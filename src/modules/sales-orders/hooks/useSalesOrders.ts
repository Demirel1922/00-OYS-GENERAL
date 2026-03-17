import { useState, useEffect, useCallback } from 'react';
import { liveQuery } from 'dexie';
import { db } from '@/lib/db';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';

interface UseSalesOrdersReturn {
  orders: SalesOrder[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSalesOrders(): UseSalesOrdersReturn {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const allOrders = await db.salesOrders.toArray();
      setOrders(allOrders.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Siparişler getirilirken hata oluştu'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();

    const subscription = liveQuery(() => db.salesOrders.toArray()).subscribe({
      next: (data) => {
        setOrders(data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        ));
        setLoading(false);
      },
      error: (err) => {
        setError(err instanceof Error ? err : new Error('Siparişler getirilirken hata oluştu'));
        setLoading(false);
      },
    });

    return () => subscription.unsubscribe();
  }, [fetchOrders]);

  return { orders, loading, error, refetch: fetchOrders };
}
