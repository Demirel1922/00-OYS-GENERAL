import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { salesOrderSchema, type SalesOrderFormData } from '@/modules/sales-orders/domain/schema';
import {
  type SalesOrder,
  type SalesOrderLine,
} from '@/modules/sales-orders/domain/types';
import {
  normalizePriceInput,
} from '@/modules/sales-orders/utils/format';
import { useCreateSalesOrder } from '@/modules/sales-orders/hooks/useCreateSalesOrder';
import { calculateLineTotals, calculateOrderTotals } from '@/modules/sales-orders/services/orderService';
import { Form } from '@/components/ui/form';

import { Header } from '@/components/common/Header';

// Store entegrasyonu - Bilgi Girişleri modülünden dinamik veri
import { useMusteriStore } from '@/store/musteriStore';
import { useRenkStore } from '@/store/renkStore';
import { useLookupStore } from '@/store/lookupStore';
import { useArtikelStore } from '@/store/artikelStore';

// Sub-components
import { OrderHeaderForm } from '@/modules/sales-orders/components/OrderHeaderForm';
import { OrderLineTable } from '@/modules/sales-orders/components/OrderLineTable';
import { OrderSummary } from '@/modules/sales-orders/components/OrderSummary';

function makeEmptyLine(defaultCurrency: string = 'TRY') {
  return {
    id: crypto.randomUUID(),
    artikel_no: '',
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
  const { artikeller, seedData: seedArtikel } = useArtikelStore();

  // İlk yüklemede seed data
  useEffect(() => {
    if (musteriler.length === 0) seedMusteri();
    if (renkler.length === 0) seedRenk();
    if (lookupItems.length === 0) seedLookup();
    seedArtikel();
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
    if (!line.artikel_no?.trim()) errors.push('Örmeci Artikel No');
    if (!line.product_name?.trim()) errors.push('Ürün Tanımı');
    if (!line.gender?.trim()) errors.push('Çorap Grubu');
    if (!line.sock_type?.trim()) errors.push('Çorap Tipi');
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
          artikel_no: line.artikel_no || '',
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
      customer_name: customer?.ormeciMusteriNo || '',
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
              <OrderHeaderForm form={form} aktifMusteriler={aktifMusteriler} />

              <OrderLineTable
                form={form}
                fields={fields}
                append={append}
                lines={lines}
                confirmedLines={confirmedLines}
                handleConfirmLine={handleConfirmLine}
                handleConfirmAndAddNew={handleConfirmAndAddNew}
                handleRemoveLine={handleRemoveLine}
                handleQuantityChange={handleQuantityChange}
                handlePriceUnitChange={handlePriceUnitChange}
                handleLinePriceChange={handleLinePriceChange}
                handleLineCurrencyChange={handleLineCurrencyChange}
                aktifRenkler={aktifRenkler}
                bedenler={bedenler}
                cinsiyetler={cinsiyetler}
                corapTipleri={corapTipleri}
                getBirimAdi={getBirimAdi}
                makeEmptyLine={makeEmptyLine}
                artikeller={artikeller}
                getSortedItemsByType={getSortedItemsByType}
              />

              <OrderSummary
                form={form}
                confirmedLines={confirmedLines}
                totals={totals}
                lines={lines}
              />
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
