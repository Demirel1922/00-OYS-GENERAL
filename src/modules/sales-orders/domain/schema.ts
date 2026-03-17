import { z } from 'zod';
import { isBefore, parseISO } from 'date-fns';

const salesOrderLineSchema = z.object({
  id: z.string(),
  product_name: z.string().min(1, 'Ürün adı zorunlu'),
  gender: z.string().min(1, 'Cinsiyet zorunlu'),
  sock_type: z.string().min(1, 'Tip zorunlu'),
  color: z.string().min(1, 'Renk zorunlu'),
  size: z.string().min(1, 'Beden zorunlu'),
  quantity: z.number().min(1, 'Miktar en az 1 olmalı'),
  price_unit: z.string().min(1, 'Birim seçiniz'),
  unit_price: z.string().min(1, 'Birim fiyat zorunlu').refine((val) => {
    const normalized = val.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    return !Number.isNaN(num) && num > 0;
  }, 'Birim fiyat 0\'dan büyük olmalıdır'),
  currency: z.enum(['TRY', 'EUR', 'USD']).optional(),
  line_total_pairs: z.number().min(0),
  line_amount: z.string(),
  conversion_rate: z.number().positive().optional(),
});

export const salesOrderSchema = z.object({
  customer_id: z.string().min(1, 'Müşteri seçimi zorunlu'),
  customer_po_no: z.string().optional(),
  order_date: z.string().min(1, 'Sipariş tarihi zorunlu'),
  requested_termin: z.string().min(1, 'Talep edilen termin zorunlu'),
  confirmed_termin: z.string().min(1, 'Onaylanan termin zorunlu'),
  payment_terms: z.string().min(1, 'Ödeme koşulları zorunlu'),
  incoterm: z.string().optional(),
  currency: z.enum(['TRY', 'EUR', 'USD']).optional().default('TRY'),
  notes: z.string().optional(),
  internal_notes: z.string().optional(),
  lines: z.array(salesOrderLineSchema).min(1, 'En az bir kalem eklenmeli'),
}).refine((data) => {
  const orderDate = parseISO(data.order_date);
  const requestedTermin = parseISO(data.requested_termin);
  return !isBefore(requestedTermin, orderDate);
}, {
  message: 'Talep edilen termin, sipariş tarihinden önce olamaz',
  path: ['requested_termin'],
}).refine((data) => {
  const orderDate = parseISO(data.order_date);
  const confirmedTermin = parseISO(data.confirmed_termin);
  return !isBefore(confirmedTermin, orderDate);
}, {
  message: 'Onaylanan termin, sipariş tarihinden önce olamaz',
  path: ['confirmed_termin'],
});

export type SalesOrderFormData = z.infer<typeof salesOrderSchema>;

export function formatZodError(error: z.ZodError): string {
  const messages = error.errors.map((err) => {
    const path = err.path.length > 0 ? err.path.join('.') : 'Genel';
    return `${path}: ${err.message}`;
  });
  return messages.join('\n');
}
