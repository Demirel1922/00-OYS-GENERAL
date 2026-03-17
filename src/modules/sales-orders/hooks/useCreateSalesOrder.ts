import { useState, useCallback } from 'react';
import { addOrder, checkOrderNoExists, generateOrderNo } from '@/lib/db';
import { toast } from 'sonner';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';

interface UseCreateSalesOrderReturn {
  createOrder: (order: Omit<SalesOrder, 'id'>, musteriNo: string) => Promise<string | null>;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export function useCreateSalesOrder(): UseCreateSalesOrderReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const createOrder = useCallback(async (
    order: Omit<SalesOrder, 'id'>, 
    musteriNo: string
  ): Promise<string | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Sipariş numarasını otomatik üret: YYMMMNNNNN
      const orderNo = await generateOrderNo(musteriNo);

      const exists = await checkOrderNoExists(orderNo);
      if (exists) {
        throw new Error(`"${orderNo}" sipariş numarası zaten kullanılıyor.`);
      }

      const orderWithNo = {
        ...order,
        order_no: orderNo,
      };

      const id = await addOrder(orderWithNo);
      setSuccess(true);
      toast.success(`Sipariş başarıyla oluşturuldu: ${orderNo}`);
      return id;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sipariş oluşturulurken hata oluştu';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createOrder, loading, error, success };
}
