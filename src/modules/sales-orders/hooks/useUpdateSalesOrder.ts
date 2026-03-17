import { useState, useCallback } from 'react';
import { updateOrder } from '@/lib/db';
import { toast } from 'sonner';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';

interface UseUpdateSalesOrderReturn {
  update: (id: string, changes: Partial<SalesOrder>) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export function useUpdateSalesOrder(): UseUpdateSalesOrderReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const update = useCallback(async (id: string, changes: Partial<SalesOrder>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await updateOrder(id, changes);
      setSuccess(true);
      toast.success('Sipariş başarıyla güncellendi');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sipariş güncellenirken hata oluştu';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { update, loading, error, success };
}
