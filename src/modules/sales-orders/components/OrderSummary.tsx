import type { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { SalesOrderFormData } from '@/modules/sales-orders/domain/schema';
import { formatMoney2, formatQuantity } from '@/modules/sales-orders/utils/format';

interface OrderSummaryProps {
  form: UseFormReturn<SalesOrderFormData>;
  confirmedLines: Set<number>;
  totals: { total_pairs: number; total_amount: string };
  lines: SalesOrderFormData['lines'];
}

export function OrderSummary({ form, confirmedLines, totals, lines }: OrderSummaryProps) {
  return (
    <>
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
    </>
  );
}
