import type { UseFormReturn } from 'react-hook-form';
import type { FieldArrayWithId, UseFieldArrayAppend } from 'react-hook-form';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Trash2, Check, PlusCircle } from 'lucide-react';
import type { SalesOrderFormData } from '@/modules/sales-orders/domain/schema';
import {
  CURRENCIES,
  resolveGenderLabel,
  resolveSockTypeLabel,
} from '@/modules/sales-orders/domain/types';
import {
  formatMoney2,
  formatQuantity,
} from '@/modules/sales-orders/utils/format';
import { ArtikelCombobox } from '@/modules/sales-orders/components/ArtikelCombobox';
import { toTitleCaseTR } from '@/utils/titleCase';
import type { Artikel, LookupItem, Renk } from '@/types';

interface OrderLineTableProps {
  form: UseFormReturn<SalesOrderFormData>;
  fields: FieldArrayWithId<SalesOrderFormData, 'lines', 'id'>[];
  append: UseFieldArrayAppend<SalesOrderFormData, 'lines'>;
  lines: SalesOrderFormData['lines'];
  confirmedLines: Set<number>;
  handleConfirmLine: (index: number) => void;
  handleConfirmAndAddNew: (index: number) => void;
  handleRemoveLine: (index: number) => void;
  handleQuantityChange: (index: number, rawValue: string) => void;
  handlePriceUnitChange: (index: number, value: string) => void;
  handleLinePriceChange: (index: number, value: string) => void;
  handleLineCurrencyChange: (index: number, value: string) => void;
  aktifRenkler: Renk[];
  bedenler: LookupItem[];
  cinsiyetler: LookupItem[];
  corapTipleri: LookupItem[];
  getBirimAdi: (kod: string) => string;
  makeEmptyLine: (defaultCurrency?: string) => SalesOrderFormData['lines'][number];
  artikeller: Artikel[];
  getSortedItemsByType: (type: string) => LookupItem[];
}

export function OrderLineTable({
  form,
  fields,
  append,
  lines,
  confirmedLines,
  handleConfirmLine,
  handleConfirmAndAddNew,
  handleRemoveLine,
  handleQuantityChange,
  handlePriceUnitChange,
  handleLinePriceChange,
  handleLineCurrencyChange,
  aktifRenkler,
  bedenler,
  cinsiyetler,
  corapTipleri,
  getBirimAdi,
  makeEmptyLine,
  artikeller,
  getSortedItemsByType,
}: OrderLineTableProps) {
  return (
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
                <div className="flex-1 grid grid-cols-2 md:grid-cols-11 gap-2 text-sm">
                  <div><span className="text-gray-500 text-xs block">Artikel No</span><span className="font-medium font-mono">{watchedLine?.artikel_no || '-'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Ürün Tanımı</span><span className="font-medium">{watchedLine?.product_name || '-'}</span></div>
                  <div><span className="text-gray-500 text-xs block">Çorap Grubu</span><span>{resolveGenderLabel(watchedLine?.gender)}</span></div>
                  <div><span className="text-gray-500 text-xs block">Çorap Tipi</span><span>{resolveSockTypeLabel(watchedLine?.sock_type)}</span></div>
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
              {/* Satır 0: Örmeci Artikel No seçimi */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField control={form.control} name={`lines.${index}.artikel_no`} render={({ field: artikelField }) => (
                  <FormItem>
                    <FormLabel>Örmeci Artikel No</FormLabel>
                    <FormControl>
                      <ArtikelCombobox
                        artikeller={artikeller}
                        value={artikelField.value || ''}
                        disabled={isConfirmed}
                        onSelect={(artikel) => {
                          if (artikel) {
                            form.setValue(`lines.${index}.artikel_no`, artikel.ormeciArtikelNo || '', { shouldValidate: true });
                            form.setValue(`lines.${index}.product_name`, artikel.urunTanimi || '', { shouldValidate: true });
                            form.setValue(`lines.${index}.gender`, artikel.corapGrubu || '', { shouldValidate: true });
                            form.setValue(`lines.${index}.sock_type`, artikel.corapTipi || '', { shouldValidate: true });
                          } else {
                            form.setValue(`lines.${index}.artikel_no`, '', { shouldValidate: true });
                            form.setValue(`lines.${index}.product_name`, '', { shouldValidate: true });
                            form.setValue(`lines.${index}.gender`, '', { shouldValidate: true });
                            form.setValue(`lines.${index}.sock_type`, '', { shouldValidate: true });
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              {/* Satır 1: Ürün Tanımı, Çorap Grubu, Çorap Tipi, Renk, Beden */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {/* Ürün Tanımı */}
              <FormField control={form.control} name={`lines.${index}.product_name`} render={({ field }) => (
                <FormItem>
                  <FormLabel>Ürün Tanımı</FormLabel>
                  <FormControl><Input {...field} placeholder="Artikel seçin" disabled={isConfirmed} onBlur={() => { field.onBlur(); if (field.value) form.setValue(field.name, toTitleCaseTR(field.value)); }} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Çorap Grubu */}
              <FormField control={form.control} name={`lines.${index}.gender`} render={({ field }) => (
                <FormItem>
                  <FormLabel>Çorap Grubu</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value} disabled={isConfirmed}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {cinsiyetler.map((o) => <SelectItem key={o.id} value={o.ad}>{o.ad}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Çorap Tipi */}
              <FormField control={form.control} name={`lines.${index}.sock_type`} render={({ field }) => (
                <FormItem>
                  <FormLabel>Çorap Tipi</FormLabel>
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
  );
}
