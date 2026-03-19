import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import type { SalesOrderFormData } from '@/modules/sales-orders/domain/schema';
import type { Musteri } from '@/types';

interface OrderHeaderFormProps {
  form: UseFormReturn<SalesOrderFormData>;
  aktifMusteriler: Musteri[];
}

export function OrderHeaderForm({ form, aktifMusteriler }: OrderHeaderFormProps) {
  return (
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
  );
}
