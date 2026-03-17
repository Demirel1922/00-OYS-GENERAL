import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, ArrowLeft, Save, CheckCircle, Check, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { salesOrderSchema, type SalesOrderFormData } from '@/modules/sales-orders/domain/schema';
import {
  CURRENCIES,
  type SalesOrder,
  type SalesOrderLine,
} from '@/modules/sales-orders/domain/types';
import {
  normalizePriceInput,
  formatMoney2,
  formatQuantity,
} from '@/modules/sales-orders/utils/format';
import { useCreateSalesOrder } from '@/modules/sales-orders/hooks/useCreateSalesOrder';
import { calculateLineTotals, calculateOrderTotals } from '@/modules/sales-orders/services/orderService';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';

import { Header } from '@/components/common/Header';

// Store entegrasyonu - Bilgi Girişleri modülünden dinamik veri
import { useMusteriStore } from '@/store/musteriStore';
import { useRenkStore } from '@/store/renkStore';
import { useLookupStore } from '@/store/lookupStore';
import { toTitleCaseTR } from '@/utils/titleCase';

function makeEmptyLine(defaultCurrency: string = 'TRY') {
  return {
    id: crypto.randomUUID(),
    product_name: '',
    gender: '',
    sock_type: '',
    color: '',
    size: '',
    quantity: 0,
    price_unit: 'BIRIM_CIFT' as const,
    unit_price: '',
    currency: defaultCurrency as any,
    line_total_pairs: 0,
    line_amount: '0.00',
  };
}

export function SalesOrderNew() {
  const navigate = useNavigate();
  const { createOrder, loading } = useCreateSalesOrder();
  const [confirmedLines, setConfirmedLines] = useState<Set<number>>(new Set());

  // Store entegrasyonu - dinamik veriler
  const { musteriler, seedData: seedMusteri } = useMusteriStore();
  const { renkler, seedData: seedRenk } = useRenkStore();
  const { items: lookupItems, seedData: seedLookup, getSortedItemsByType } = useLookupStore();

  // İlk yüklemede seed data
  useEffect(() => {
    if (musteriler.length === 0) seedMusteri();
    if (renkler.length === 0) seedRenk();
    if (lookupItems.length === 0) seedLookup();
  }, []);

  // Dinamik listeler
  const aktifMusteriler = useMemo(() => musteriler.filter(m => m.durum === 'AKTIF'), [musteriler]);
  const aktifRenkler = useMemo(() => renkler.filter(r => r.durum === 'AKTIF'), [renkler]);
  const bedenler = useMemo(() => getSortedItemsByType('BEDEN'), [lookupItems]);
  const cinsiyetler = useMemo(() => getSortedItemsByType('CINSIYET'), [lookupItems]);
  const corapTipleri = useMemo(() => getSortedItemsByType('TIP'), [lookupItems]);

  // Birim kodundan adını al
  const getBirimAdi = useCallback((kod: string) => {
    const birim = lookupItems.find(i => i.lookupType === 'BIRIM' && i.kod === kod);
    return birim?.ad || kod || '-';
  }, [lookupItems]);

  const form = useForm<SalesOrderFormData>({
    resolver: zodResolver(salesOrderSchema),
    defaultValues: {
      customer_id: '',
      customer_po_no: '',
      order_date: new Date().toISOString().slice(0, 10),
      requested_termin: '',
      confirmed_termin: '',
      payment_terms: '',
      incoterm: '',
      currency: 'TRY',
      notes: '',
      internal_notes: '',
      lines: [makeEmptyLine('TRY')],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'lines',
  });

  const currency = form.watch('currency');
  const lines = form.watch('lines');

  const totals = useMemo(() => {
    const confirmedLinesData = lines.filter((_, i) => confirmedLines.has(i)) as SalesOrderLine[];
    return calculateOrderTotals(confirmedLinesData);
  }, [lines, confirmedLines]);

  const recalculateLine = useCallback((index: number, updates: Partial<SalesOrderLine>) => {
    const line = lines[index];
    if (!line) return;

    const updatedLine = {
      id: line.id,
      product_name: line.product_name,
      gender: line.gender,
      sock_type: line.sock_type,
      color: line.color,
      size: line.size,
      quantity: line.quantity,
      price_unit: line.price_unit,
      unit_price: line.unit_price || '0',
      currency: line.currency || 'TRY',
      ...updates,
    };

    const calculated = calculateLineTotals(updatedLine, updatedLine.unit_price);

    Object.entries(updates).forEach(([key, value]) => {
      form.setValue(`lines.${index}.${key}` as any, value, { shouldValidate: true });
    });

    form.setValue(`lines.${index}.line_total_pairs`, calculated.line_total_pairs, { shouldValidate: true });
    form.setValue(`lines.${index}.line_amount`, calculated.line_amount, { shouldValidate: true });
  }, [lines, form]);

  const handleQuantityChange = useCallback((index: number, rawValue: string) => {
    const cleaned = rawValue.replace(/\./g, '').replace(/\D/g, '');
    const quantity = cleaned === '' ? 0 : parseInt(cleaned, 10);
    recalculateLine(index, { quantity });
  }, [recalculateLine]);

  const handlePriceUnitChange = useCallback((index: number, value: string) => {
    recalculateLine(index, { price_unit: value });
  }, [recalculateLine]);

  const handleLinePriceChange = useCallback((index: number, value: string) => {
    const normalized = normalizePriceInput(value);
    recalculateLine(index, { unit_price: normalized });
  }, [recalculateLine]);

  const handleLineCurrencyChange = useCallback((index: number, value: string) => {
    recalculateLine(index, { currency: value as 'TRY' | 'EUR' | 'USD' });
  }, [recalculateLine]);

  // Madde 2: Satır boşsa eklemesin, uyarı versin
  const validateLineBeforeConfirm = useCallback((index: number): boolean => {
    const line = lines[index];
    if (!line) return false;

    const errors: string[] = [];
    if (!line.product_name?.trim()) errors.push('Ürün adı');
    if (!line.color?.trim()) errors.push('Renk');
    if (!line.size) errors.push('Beden');
    if (!line.quantity || line.quantity <= 0) errors.push('Miktar');
    if (!line.unit_price?.trim()) errors.push('Birim fiyat');

    if (errors.length > 0) {
      toast.error(`Eksik alanlar: ${errors.join(', ')}`);
      return false;
    }
    return true;
  }, [lines]);

  const handleConfirmLine = useCallback((index: number) => {
    if (!validateLineBeforeConfirm(index)) return;
    setConfirmedLines((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
    toast.success(`Kalem ${index + 1} eklendi`);
  }, [validateLineBeforeConfirm]);

  const handleConfirmAndAddNew = useCallback((index: number) => {
    if (!validateLineBeforeConfirm(index)) return;

    const currentLine = lines[index];
    const lineCurrency = currentLine?.currency || 'TRY';

    setConfirmedLines((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });

    append(makeEmptyLine(lineCurrency));
    toast.success(`Kalem ${index + 1} eklendi, yeni satır açıldı`);
  }, [validateLineBeforeConfirm, append, lines]);

  // Madde 1: İlk satır silinemez
  const handleRemoveLine = useCallback((index: number) => {
    if (fields.length <= 1) {
      toast.error('En az bir kalem satırı olmalı');
      return;
    }
    remove(index);
    setConfirmedLines((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => {
        if (i < index) next.add(i);
        else if (i > index) next.add(i - 1);
      });
      return next;
    });
  }, [remove, fields.length]);

  const buildOrderPayload = useCallback((data: SalesOrderFormData, status: 'draft' | 'approved'): Omit<SalesOrder, 'id'> => {
    const now = new Date().toISOString();
    const customer = aktifMusteriler.find((c) => c.id === data.customer_id);

    const confirmedLinesData = data.lines.filter((_, i) => confirmedLines.has(i));

    const orderLines = confirmedLinesData.map((line) => {
      const calculated = calculateLineTotals(
        {
          id: line.id,
          product_name: line.product_name,
          gender: line.gender,
          sock_type: line.sock_type,
          color: line.color,
          size: line.size,
          quantity: line.quantity,
          price_unit: line.price_unit,
          unit_price: line.unit_price,
          currency: line.currency || 'TRY',
        },
        line.unit_price
      );
      return {
        ...line,
        currency: line.currency || 'TRY',
        line_total_pairs: calculated.line_total_pairs,
        line_amount: calculated.line_amount,
      };
    }) as SalesOrderLine[];

    const finalTotals = calculateOrderTotals(orderLines);
    const mainCurrency = orderLines.length > 0 ? (orderLines[0].currency || 'TRY') : 'TRY';

    return {
      order_no: '',
      customer_id: data.customer_id,
      customer_name: customer?.musteriUnvan || '',
      customer_po_no: data.customer_po_no,
      order_date: data.order_date,
      requested_termin: data.requested_termin,
      confirmed_termin: data.confirmed_termin,
      payment_terms: data.payment_terms,
      incoterm: data.incoterm || '',
      currency: mainCurrency as any,
      unit_price: orderLines.length > 0 ? orderLines[0].unit_price : '0',
      lines: orderLines,
      total_pairs: finalTotals.total_pairs,
      total_amount: finalTotals.total_amount,
      status,
      notes: data.notes,
      internal_notes: data.internal_notes,
      created_at: now,
      updated_at: now,
    };
  }, [confirmedLines]);

  const onSubmit = useCallback(async (data: SalesOrderFormData) => {
    if (confirmedLines.size === 0) {
      toast.error('En az bir kalemi "Ekle" ile onaylamalısınız');
      return;
    }
    const customer = aktifMusteriler.find((c) => c.id === data.customer_id);
    if (!customer) {
      toast.error('Müşteri seçimi zorunlu');
      return;
    }
    const order = buildOrderPayload(data, 'draft');
    const id = await createOrder(order, customer.ormeciMusteriNo);
    if (id) navigate('/module/4/siparis');
  }, [buildOrderPayload, createOrder, aktifMusteriler, navigate, confirmedLines]);

  const handleSaveAndApprove = useCallback(async () => {
    if (confirmedLines.size === 0) {
      toast.error('En az bir kalemi "Ekle" ile onaylamalısınız');
      return;
    }
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }
    const data = form.getValues();
    const customer = aktifMusteriler.find((c) => c.id === data.customer_id);
    if (!customer) {
      toast.error('Müşteri seçimi zorunlu');
      return;
    }
    const order = buildOrderPayload(data, 'approved');
    const id = await createOrder(order, customer.ormeciMusteriNo);
    if (id) {
      toast.success('Sipariş onaylı olarak kaydedildi');
      navigate('/module/4/siparis');
    }
  }, [form, buildOrderPayload, createOrder, aktifMusteriler, navigate, confirmedLines]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Ana Menüye Dön
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/module/4/siparis')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Yeni Sipariş Kaydı</h1>
                <p className="text-gray-500">Yeni bir sipariş oluşturun</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={form.handleSubmit(onSubmit)} disabled={loading}>
                <Save className="w-4 h-4 mr-2" />
                Kaydet
              </Button>
              <Button onClick={handleSaveAndApprove} disabled={loading}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Kaydet & Onayla
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form className="space-y-6">
              {/* Header */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Sipariş No</Label>
                  <Input
                    placeholder="Kaydedildiğinde otomatik üretilecek"
                    disabled
                    className="bg-gray-50"
                  />
                  <p className="text-xs text-gray-500">Format: YY + Müşteri No + Sıra (örn: 260390001)</p>
                </div>

                <FormField control={form.control} name="customer_id" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Müşteri *</FormLabel>
                    <Select onValueChange={(val) => {
                      field.onChange(val);
                      // Müşteri seçilince ödeme koşullarını otomatik doldur
                      const musteri = aktifMusteriler.find(m => m.id === val);
                      if (musteri) {
                        const vadeBirim = musteri.odemeVadesiBirim === 'GUN' ? 'Gün' : 'Ay';
                        const odemeStr = `${musteri.odemeTipi} - ${musteri.odemeVadesiDeger} ${vadeBirim}`;
                        form.setValue('payment_terms', odemeStr);
                      }
                    }} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Müşteri seçin" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {aktifMusteriler.map((m) => <SelectItem key={m.id} value={m.id}>{m.ormeciMusteriNo}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="customer_po_no" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Müşteri PO No</FormLabel>
                    <FormControl><Input {...field} placeholder="Müşteri sipariş numarası" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="order_date" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sipariş Tarihi *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="requested_termin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Talep Edilen Termin *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="confirmed_termin" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Onaylı Termin *</FormLabel>
                    <FormControl><Input type="date" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="payment_terms" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ödeme Koşulları *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Müşteri seçilince otomatik dolar" />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">Müşteri seçilince otomatik dolar, gerekirse düzenleyebilirsiniz</p>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="incoterm" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teslim Şekli (Incoterm)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Seçiniz" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="EXW">EXW</SelectItem>
                        <SelectItem value="FOB">FOB</SelectItem>
                        <SelectItem value="CIF">CIF</SelectItem>
                        <SelectItem value="DDP">DDP</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Siparis Kalemleri */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Sipariş Kalemleri</h3>

                {fields.map((field, index) => {
                  const watchedLine = lines[index];
                  const isConfirmed = confirmedLines.has(index);
                  const lineCurrency = watchedLine?.currency || 'TRY';
                  const isFirstLine = index === 0;
                  const canDelete = !isFirstLine || fields.length > 1;

                  return (
                    <Card key={field.id} className={`p-4 ${isConfirmed ? 'border-green-300 bg-green-50/30' : ''}`}>
                      {isConfirmed ? (
                        /* Eklenen kalem — kompakt özet satırı */
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1 text-green-700 text-xs font-medium shrink-0">
                            <Check className="w-3 h-3" /> Eklendi
                          </div>
                          <div className="flex-1 grid grid-cols-2 md:grid-cols-10 gap-2 text-sm">
                            <div><span className="text-gray-500 text-xs block">Ürün</span><span className="font-medium">{watchedLine?.product_name || '-'}</span></div>
                            <div><span className="text-gray-500 text-xs block">Cinsiyet</span><span>{watchedLine?.gender || '-'}</span></div>
                            <div><span className="text-gray-500 text-xs block">Tip</span><span>{watchedLine?.sock_type || '-'}</span></div>
                            <div><span className="text-gray-500 text-xs block">Renk</span><span>{watchedLine?.color || '-'}</span></div>
                            <div><span className="text-gray-500 text-xs block">Beden</span><span>{watchedLine?.size || '-'}</span></div>
                            <div><span className="text-gray-500 text-xs block">Miktar</span><span className="font-medium">{formatQuantity(watchedLine?.quantity ?? 0)}</span></div>
                            <div><span className="text-gray-500 text-xs block">Birim</span><span>{getBirimAdi(watchedLine?.price_unit)}</span></div>
                            <div><span className="text-gray-500 text-xs block">Toplam Çift</span><span className="font-medium">{formatQuantity(watchedLine?.line_total_pairs ?? 0)}</span></div>
                            <div><span className="text-gray-500 text-xs block">Birim Fiyat</span><span>{watchedLine?.unit_price || '0'} {lineCurrency}</span></div>
                            <div><span className="text-gray-500 text-xs block">Tutar</span><span className="font-bold">{formatMoney2(watchedLine?.line_amount, lineCurrency)}</span></div>
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveLine(index)}
                            title="Kalemi Sil"
                            className="h-8 w-8 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        /* Onaylanmamış kalem — düzenleme formu */
                        <>
                      <div className="space-y-3">
                        {/* Satır 1: Ürün, Cinsiyet, Tip, Renk, Beden */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {/* Urun Adi */}
                        <FormField control={form.control} name={`lines.${index}.product_name`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ürün Adı</FormLabel>
                            <FormControl><Input {...field} placeholder="Ürün adı" disabled={isConfirmed} onBlur={() => { field.onBlur(); if (field.value) form.setValue(field.name, toTitleCaseTR(field.value)); }} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Cinsiyet */}
                        <FormField control={form.control} name={`lines.${index}.gender`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cinsiyet</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isConfirmed}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {cinsiyetler.map((o) => <SelectItem key={o.id} value={o.ad}>{o.ad}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Madde 3: Tip (Cinsiyet ile Renk arası) */}
                        <FormField control={form.control} name={`lines.${index}.sock_type`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tip</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isConfirmed}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {corapTipleri.map((o) => <SelectItem key={o.id} value={o.ad}>{o.ad}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Renk */}
                        <FormField control={form.control} name={`lines.${index}.color`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Renk</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isConfirmed}>
                              <FormControl><SelectTrigger><SelectValue placeholder="Renk seçin" /></SelectTrigger></FormControl>
                              <SelectContent>
                                {aktifRenkler.map((r) => <SelectItem key={r.id} value={r.renkAdi}>{r.renkAdi}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Beden */}
                        <FormField control={form.control} name={`lines.${index}.size`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beden</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value} disabled={isConfirmed}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {bedenler.map((o) => <SelectItem key={o.id} value={o.ad}>{o.ad}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />
                        </div>

                        {/* Satır 2: Miktar, Birim, Para Birimi, Birim Fiyat, Butonlar */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">

                        {/* Madde 4: Miktar - focus olunca seçilsin */}
                        <FormField control={form.control} name={`lines.${index}.quantity`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Miktar</FormLabel>
                            <FormControl>
                              <Input
                                type="text"
                                inputMode="numeric"
                                value={field.value === 0 ? '' : formatQuantity(field.value)}
                                onChange={(e) => handleQuantityChange(index, e.target.value)}
                                onFocus={(e) => e.target.select()}
                                placeholder="0"
                                disabled={isConfirmed}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Birim */}
                        <FormField control={form.control} name={`lines.${index}.price_unit`} render={({ field }) => (
                          <FormItem>
                            <FormLabel>Birim</FormLabel>
                            <Select onValueChange={(val) => handlePriceUnitChange(index, val)} value={field.value} disabled={isConfirmed}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {getSortedItemsByType('BIRIM').map((b) => <SelectItem key={b.kod} value={b.kod}>{b.ad}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Para Birimi (kalem bazli) */}
                        <FormField control={form.control} name={`lines.${index}.currency`} render={({ field: lineField }) => (
                          <FormItem>
                            <FormLabel>Para Birimi</FormLabel>
                            <Select onValueChange={(val) => handleLineCurrencyChange(index, val)} value={lineField.value || 'TRY'} disabled={isConfirmed}>
                              <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                              <SelectContent>
                                {CURRENCIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>)}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Birim Fiyat */}
                        <FormField control={form.control} name={`lines.${index}.unit_price`} render={({ field: lineField }) => (
                          <FormItem>
                            <FormLabel>Birim Fiyat</FormLabel>
                            <FormControl>
                              <Input
                                value={lineField.value || ''}
                                placeholder="0,00"
                                onChange={(e) => handleLinePriceChange(index, e.target.value)}
                                onFocus={(e) => e.target.select()}
                                disabled={isConfirmed}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Butonlar */}
                        <div className="flex items-end gap-1">
                              <Button
                                type="button"
                                variant="default"
                                size="icon"
                                onClick={() => handleConfirmLine(index)}
                                title="Ekle"
                                className="bg-green-600 hover:bg-green-700 h-9 w-9"
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="default"
                                size="icon"
                                onClick={() => handleConfirmAndAddNew(index)}
                                title="Ekle ve Yeni Satır"
                                className="bg-blue-600 hover:bg-blue-700 h-9 w-9"
                              >
                                <PlusCircle className="w-4 h-4" />
                              </Button>
                              {canDelete && (
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={() => handleRemoveLine(index)}
                                  className="h-9 w-9"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                        </div>
                      </div>
                      </div>

                      <div className="mt-2 text-sm text-gray-600 flex gap-4">
                        <span>Toplam Çift: {formatQuantity(watchedLine?.line_total_pairs ?? 0)}</span>
                        <span>Tutar: {formatMoney2(watchedLine?.line_amount, lineCurrency)}</span>
                      </div>
                      </>
                      )}
                    </Card>
                  );
                })}

                {form.formState.errors.lines && (
                  <p className="text-sm text-red-500">{form.formState.errors.lines.message}</p>
                )}

                {/* Yeni Kalem Ekle butonu - her zaman görünür */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append(makeEmptyLine(lines?.[0]?.currency || 'TRY'))}
                  className="w-full border-dashed border-2 py-6 text-gray-500 hover:text-gray-700 hover:border-gray-400"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Yeni Kalem Ekle
                </Button>
              </div>

              {/* Notlar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notlar</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Müşteri notları..." rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="internal_notes" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dahili Notlar</FormLabel>
                    <FormControl><Textarea {...field} placeholder="Dahili notlar..." rows={3} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Toplam */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Toplam ({confirmedLines.size} kalem):</span>
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatQuantity(totals.total_pairs)} çift</div>
                    <div className="text-xl font-bold text-primary">
                      {formatMoney2(totals.total_amount, lines?.[0]?.currency || 'TRY')}
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
