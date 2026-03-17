import { useState, useEffect, useCallback } from 'react';
import { getOrder } from '@/lib/db';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';

interface UseSalesOrderReturn {
  order: SalesOrder | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSalesOrder(id: string | undefined): UseSalesOrderReturn {
  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) {
      setOrder(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getOrder(id);
      setOrder(data || null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sipariş getirilirken hata oluştu'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return { order, loading, error, refetch: fetchOrder };
}
