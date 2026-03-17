import type { SalesOrderLine } from '@/modules/sales-orders/domain/types';

interface StockItem {
  productId: string;
  quantity: number;
  reserved: number;
}

const mockStockDB: Map<string, StockItem> = new Map();

export function initializeMockStock(): void {
  const products = [
    { productId: 'PROD-001', quantity: 1000, reserved: 0 },
    { productId: 'PROD-002', quantity: 500, reserved: 0 },
    { productId: 'PROD-003', quantity: 2000, reserved: 0 },
    { productId: 'PROD-004', quantity: 750, reserved: 0 },
    { productId: 'PROD-005', quantity: 1500, reserved: 0 },
  ];
  
  products.forEach((item) => {
    mockStockDB.set(item.productId, item);
  });
}

export function checkStock(productId: string, requiredQuantity: number): boolean {
  const stockItem = mockStockDB.get(productId);
  if (!stockItem) return false;
  
  const availableStock = stockItem.quantity - stockItem.reserved;
  return availableStock >= requiredQuantity;
}

export function getAvailableStock(productId: string): number {
  const stockItem = mockStockDB.get(productId);
  if (!stockItem) return 0;
  
  return stockItem.quantity - stockItem.reserved;
}

export function reserveStock(orderId: string, items: SalesOrderLine[]): { success: boolean; message?: string } {
  for (const item of items) {
    const stockItem = mockStockDB.get(item.product_name);
    if (!stockItem) {
      return { success: false, message: `"${item.product_name}" ürünü için stok bulunamadı` };
    }
    
    const availableStock = stockItem.quantity - stockItem.reserved;
    if (availableStock < item.line_total_pairs) {
      return { 
        success: false, 
        message: `"${item.product_name}" ürünü için yeterli stok yok. İstenen: ${item.line_total_pairs}, Mevcut: ${availableStock}` 
      };
    }
  }
  
  for (const item of items) {
    const stockItem = mockStockDB.get(item.product_name);
    if (stockItem) {
      stockItem.reserved += item.line_total_pairs;
    }
  }
  
  return { success: true };
}

export function releaseStock(orderId: string): void {
  mockStockDB.forEach((stockItem) => {
    stockItem.reserved = Math.max(0, stockItem.reserved);
  });
}

export function updateStockQuantity(productId: string, newQuantity: number): boolean {
  const stockItem = mockStockDB.get(productId);
  if (!stockItem) return false;
  
  stockItem.quantity = newQuantity;
  return true;
}

export function getAllStock(): StockItem[] {
  return Array.from(mockStockDB.values());
}

initializeMockStock();
