import { db } from './db';
import type { PriceAuditLog } from '@/modules/sales-orders/domain/types';

export async function addPriceAuditLog(
  orderId: string,
  fieldName: string,
  oldValue: string,
  newValue: string,
  changedBy: string = 'Sistem'
): Promise<string> {
  try {
    const log: Omit<PriceAuditLog, 'id'> = {
      order_id: orderId,
      field_name: fieldName,
      old_value: oldValue,
      new_value: newValue,
      changed_by: changedBy,
      changed_at: new Date().toISOString(),
    };

    const id = await db.priceAuditLogs.add(log as PriceAuditLog);
    return id;
  } catch (error) {
    console.error('Price audit log error:', error);
    throw new Error('Fiyat değişiklik kaydı oluşturulurken hata oluştu.');
  }
}

export async function getPriceAuditLogsByOrderId(orderId: string): Promise<PriceAuditLog[]> {
  try {
    return await db.priceAuditLogs
      .where('order_id')
      .equals(orderId)
      .sortBy('changed_at');
  } catch (error) {
    console.error('Get price audit logs error:', error);
    throw new Error('Fiyat değişiklik kayıtları getirilirken hata oluştu.');
  }
}

export async function getAllPriceAuditLogs(): Promise<PriceAuditLog[]> {
  try {
    return await db.priceAuditLogs.toArray();
  } catch (error) {
    console.error('Get all price audit logs error:', error);
    throw new Error('Fiyat değişiklik kayıtları getirilirken hata oluştu.');
  }
}
