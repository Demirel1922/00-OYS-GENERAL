import { toast } from 'sonner';
import { updateOrder, addPriceAuditLog } from '@/lib/db';
import type { SalesOrder, OrderStatus, SalesOrderLine } from '@/modules/sales-orders/domain/types';
import { PRICE_UNIT_MULTIPLIERS } from '@/modules/sales-orders/domain/types';
import { useLookupStore } from '@/store/lookupStore';

// lookupStore'dan birim çarpanını al (dinamik)
function getBirimCarpan(priceUnit: string): number {
  try {
    const store = useLookupStore.getState();
    const birimItem = store.items.find(i => i.lookupType === 'BIRIM' && i.kod === priceUnit);
    if (birimItem?.carpan) return birimItem.carpan;
  } catch {}
  // Fallback: eski hardcoded değerler
  return PRICE_UNIT_MULTIPLIERS[priceUnit] || 1;
}

const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  draft: ['approved', 'cancelled'],
  approved: ['shipped', 'cancelled'],
  shipped: [],
  cancelled: [],
};

const ERROR_MESSAGES: Record<string, string> = {
  'shipped->cancelled': 'Gönderilmiş sipariş iptal edilemez',
  'approved->draft': 'Onaylanmış sipariş taslak durumuna geri alınamaz',
};

function getTransitionKey(from: OrderStatus, to: OrderStatus): string {
  return `${from}->${to}`;
}

export function canTransitionStatus(from: OrderStatus, to: OrderStatus): { valid: boolean; message?: string } {
  const validTransitions = VALID_STATUS_TRANSITIONS[from];
  if (!validTransitions.includes(to)) {
    const key = getTransitionKey(from, to);
    const message = ERROR_MESSAGES[key] || `"${from}" durumundan "${to}" durumuna geçiş yapılamaz`;
    return { valid: false, message };
  }
  return { valid: true };
}

export async function approveOrder(order: SalesOrder): Promise<SalesOrder> {
  const transition = canTransitionStatus(order.status, 'approved');
  if (!transition.valid) {
    toast.error(transition.message || 'Onaylama işlemi başarısız');
    throw new Error(transition.message);
  }

  await updateOrder(order.id, { status: 'approved' });
  toast.success('Sipariş onaylandı');
  return { ...order, status: 'approved' };
}

export async function shipOrder(order: SalesOrder): Promise<SalesOrder> {
  const transition = canTransitionStatus(order.status, 'shipped');
  if (!transition.valid) {
    toast.error(transition.message || 'Sevkiyat işlemi başarısız');
    throw new Error(transition.message);
  }

  const shippedAt = new Date().toISOString();
  await updateOrder(order.id, { status: 'shipped', shipped_at: shippedAt });
  toast.success('Sipariş gönderildi');
  return { ...order, status: 'shipped', shipped_at: shippedAt };
}

export async function cancelOrder(order: SalesOrder): Promise<SalesOrder> {
  const transition = canTransitionStatus(order.status, 'cancelled');
  if (!transition.valid) {
    toast.error(transition.message || 'İptal işlemi başarısız');
    throw new Error(transition.message);
  }

  await updateOrder(order.id, { status: 'cancelled' });
  toast.success('Sipariş iptal edildi');
  return { ...order, status: 'cancelled' };
}

export function parsePriceString(value: string | number | null | undefined): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return isNaN(value) ? 0 : value;
  const trimmed = value.trim();
  if (trimmed === '') return 0;
  const hasComma = trimmed.includes(',');
  const hasDot = trimmed.includes('.');
  let normalized: string;
  if (hasComma && hasDot) {
    normalized = trimmed.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    normalized = trimmed.replace(',', '.');
  } else {
    normalized = trimmed;
  }
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
}

export function calculateLineTotals(
  line: Omit<SalesOrderLine, 'line_total_pairs' | 'line_amount'>,
  headerUnitPrice: string
): { line_total_pairs: number; line_amount: string } {
  const multiplier = getBirimCarpan(line.price_unit);
  const lineTotalPairs = line.quantity * multiplier;
  const priceSource = line.unit_price || headerUnitPrice || '0';
  const priceNum = parsePriceString(priceSource);
  // Tutar = Miktar × Birim Fiyat (çift ile çarpılmaz!)
  const lineAmount = line.quantity * priceNum;
  return {
    line_total_pairs: lineTotalPairs,
    line_amount: lineAmount.toFixed(2),
  };
}

export function calculateOrderTotals(lines: SalesOrderLine[]): { total_pairs: number; total_amount: string } {
  if (!lines || lines.length === 0) {
    return { total_pairs: 0, total_amount: '0.00' };
  }
  const totalPairs = lines.reduce((sum, line) => {
    const pairs = typeof line.line_total_pairs === 'number' ? line.line_total_pairs : 0;
    return sum + pairs;
  }, 0);
  const totalAmount = lines.reduce((sum, line) => {
    return sum + parsePriceString(line.line_amount);
  }, 0);
  return {
    total_pairs: totalPairs,
    total_amount: totalAmount.toFixed(2),
  };
}

export async function trackPriceChange(
  orderId: string, fieldName: string, oldValue: string, newValue: string, changedBy: string = 'Sistem'
): Promise<void> {
  if (oldValue === newValue) return;
  try {
    await addPriceAuditLog({ order_id: orderId, field_name: fieldName, old_value: oldValue, new_value: newValue, changed_by: changedBy, changed_at: new Date().toISOString() });
  } catch (error) {
    console.error('Fiyat değişikliği kaydedilirken hata:', error);
  }
}
