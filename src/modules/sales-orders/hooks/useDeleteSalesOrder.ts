import { useState, useCallback } from 'react';
import { deleteOrder } from '@/lib/db';
import { toast } from 'sonner';

interface UseDeleteSalesOrderReturn {
  deleteOrderById: (id: string) => Promise<boolean>;
  loading: boolean;
  error: Error | null;
  success: boolean;
}

export function useDeleteSalesOrder(): UseDeleteSalesOrderReturn {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const deleteOrderById = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      await deleteOrder(id);
      setSuccess(true);
      toast.success('Sipariş başarıyla silindi');
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sipariş silinirken hata oluştu';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { deleteOrderById, loading, error, success };
}
