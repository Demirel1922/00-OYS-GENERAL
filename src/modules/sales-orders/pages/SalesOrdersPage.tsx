import { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, FileSpreadsheet, AlertTriangle, AlertCircle, Package, MoreVertical,
  Search, Eye, Trash2, BarChart3, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { SalesOrder, OrderStatus } from '@/modules/sales-orders/domain/types';
import { STATUS_LABELS } from '@/modules/sales-orders/domain/types';
import { formatMoney2, formatDate, formatQuantity } from '@/modules/sales-orders/utils/format';
import { parsePriceString } from '@/modules/sales-orders/services/orderService';
import { exportToCSV } from '@/modules/sales-orders/utils/excelExport';
import { useSalesOrders } from '@/modules/sales-orders/hooks/useSalesOrders';
import { useDeleteSalesOrder } from '@/modules/sales-orders/hooks/useDeleteSalesOrder';
import { differenceInDays, parseISO } from 'date-fns';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';

import { Header } from '@/components/common/Header';

const STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'bg-slate-100 text-slate-700 border border-slate-300',
  approved: 'bg-blue-100 text-blue-700 border border-blue-300',
  shipped: 'bg-emerald-100 text-emerald-700 border border-emerald-300',
  cancelled: 'bg-red-100 text-red-700 border border-red-300',
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

function ShipmentBadge({ order }: { order: SalesOrder }) {
  if (order.status !== 'shipped' || !order.shipped_at || !order.confirmed_termin) return null;
  try {
    const shipped = parseISO(order.shipped_at);
    const termin = parseISO(order.confirmed_termin);
    const diff = differenceInDays(shipped, termin);
    if (diff <= 0) {
      return <span className="text-xs text-emerald-600 font-medium" title={`${Math.abs(diff)} gün erken`}>✅ {Math.abs(diff)}g erken</span>;
    } else {
      return <span className="text-xs text-red-600 font-medium" title={`${diff} gün geç`}>🔴 {diff}g geç</span>;
    }
  } catch { return null; }
}

export function SalesOrdersPage() {
  const navigate = useNavigate();
  const { orders, loading, error, refetch } = useSalesOrders();
  const { deleteOrderById, loading: deleteLoading } = useDeleteSalesOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<string>('order_no');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<SalesOrder | null>(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const handleDeleteClick = useCallback((order: SalesOrder) => {
    setOrderToDelete(order); setDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (orderToDelete) {
      const success = await deleteOrderById(orderToDelete.id);
      if (success) { setDeleteDialogOpen(false); setOrderToDelete(null); refetch(); }
    }
  }, [orderToDelete, deleteOrderById, refetch]);

  const handleExport = useCallback(() => {
    exportToCSV(orders); toast.success('Excel dosyası indirildi');
  }, [orders]);

  const getFilteredOrders = useCallback((tab: string) => {
    let base: SalesOrder[];
    switch (tab) {
      case 'active': base = orders.filter((o) => o.status === 'draft' || o.status === 'approved'); break;
      case 'shipped': base = orders.filter((o) => o.status === 'shipped'); break;
      case 'cancelled': base = orders.filter((o) => o.status === 'cancelled'); break;
      default: base = orders; break;
    }
    return base.filter((order) => {
      const matchesSearch =
        order.order_no.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        order.customer_name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, debouncedSearchTerm, statusFilter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error.message}</p>
          <Button onClick={refetch} className="mt-4">Tekrar Dene</Button>
        </div>
      </div>
    );
  }

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-30" />;
    return sortDir === 'asc' ? <ArrowUp className="w-3 h-3 ml-1" /> : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  const sortOrders = (list: SalesOrder[]) => {
    return [...list].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'order_no': cmp = a.order_no.localeCompare(b.order_no); break;
        case 'customer_name': cmp = a.customer_name.localeCompare(b.customer_name); break;
        case 'customer_po_no': cmp = (a.customer_po_no || '').localeCompare(b.customer_po_no || ''); break;
        case 'status': cmp = a.status.localeCompare(b.status); break;
        case 'termin': cmp = (a.confirmed_termin || '').localeCompare(b.confirmed_termin || ''); break;
        case 'total_pairs': cmp = a.total_pairs - b.total_pairs; break;
        case 'incoterm': cmp = (a.incoterm || '').localeCompare(b.incoterm || ''); break;
        case 'total_amount': cmp = parsePriceString(a.total_amount) - parsePriceString(b.total_amount); break;
        default: cmp = a.order_no.localeCompare(b.order_no);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
  };

  const renderTable = (tabValue: string) => {
    const tabOrders = sortOrders(getFilteredOrders(tabValue));
    return (
      <>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('order_no')}><span className="flex items-center">Sipariş No<SortIcon field="order_no" /></span></th>
                <th className="text-left py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('customer_name')}><span className="flex items-center">Müşteri<SortIcon field="customer_name" /></span></th>
                <th className="text-left py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('customer_po_no')}><span className="flex items-center">PO No<SortIcon field="customer_po_no" /></span></th>
                <th className="text-left py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('status')}><span className="flex items-center">Durum<SortIcon field="status" /></span></th>
                <th className="text-left py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('termin')}><span className="flex items-center">Termin<SortIcon field="termin" /></span></th>
                {tabValue === 'shipped' && <th className="text-left py-3 px-4 font-medium">Gönderilme</th>}
                <th className="text-center py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('total_pairs')}><span className="flex items-center justify-center">Miktar<SortIcon field="total_pairs" /></span></th>
                <th className="text-left py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('incoterm')}><span className="flex items-center">Teslim Şekli<SortIcon field="incoterm" /></span></th>
                <th className="text-right py-3 px-4 font-medium cursor-pointer select-none" onClick={() => toggleSort('total_amount')}><span className="flex items-center justify-end">Tutar<SortIcon field="total_amount" /></span></th>
                <th className="text-center py-3 px-4 font-medium">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {tabOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/module/4/siparis/${order.id}`)}
                >
                  <td className="py-3 px-4 font-medium">{order.order_no}</td>
                  <td className="py-3 px-4">{order.customer_name}</td>
                  <td className="py-3 px-4 text-gray-600">{order.customer_po_no || '-'}</td>
                  <td className="py-3 px-4">
                    <Badge className={STATUS_COLORS[order.status]}>{STATUS_LABELS[order.status]}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {formatDate(order.confirmed_termin)}
                      <ShipmentBadge order={order} />
                    </div>
                  </td>
                  {tabValue === 'shipped' && <td className="py-3 px-4">{formatDate(order.shipped_at)}</td>}
                  <td className="py-3 px-4 text-center">{formatQuantity(order.total_pairs)} çift</td>
                  <td className="py-3 px-4">{order.incoterm || '-'}</td>
                  <td className="py-3 px-4 text-right font-medium">{formatMoney2(order.total_amount, order.currency)}</td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="w-4 h-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/module/4/siparis/${order.id}`)}>
                          <Eye className="w-4 h-4 mr-2" /> Görüntüle
                        </DropdownMenuItem>
                        {order.status === 'draft' && (
                          <DropdownMenuItem onClick={() => handleDeleteClick(order)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" /> Sil
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {tabOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Sipariş bulunamadı</p>
          </div>
        )}

        {tabOrders.length > 0 && (() => {
          const totals = tabOrders.reduce(
            (acc, order) => {
              acc.totalPairs += order.total_pairs;
              const amount = parsePriceString(order.total_amount);
              acc.byCurrency[order.currency] = (acc.byCurrency[order.currency] || 0) + amount;
              return acc;
            },
            { totalPairs: 0, byCurrency: {} as Record<string, number> }
          );
          return (
            <div className="mt-4 p-4 bg-gray-50 border-t-2 border-gray-900">
              <div className="flex justify-between items-center">
                <span className="font-bold uppercase">TOPLAM</span>
                <div className="text-right">
                  <div className="font-bold tabular-nums">{formatQuantity(totals.totalPairs)} çift</div>
                  {Object.entries(totals.byCurrency).sort(([a], [b]) => a.localeCompare(b)).map(([curr, amount]) => (
                    <div key={curr} className="font-bold">{formatMoney2(amount.toFixed(2), curr)}</div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          Ana Menüye Dön
        </Button>
      </div>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">Sipariş Listesi</h1>
              <p className="text-gray-500">Tüm siparişlerinizi yönetin</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => navigate('/module/4/siparis/analytics')}>
                <BarChart3 className="w-4 h-4 mr-2" /> Analiz
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel İndir
              </Button>
              <Button onClick={() => navigate('/module/4/siparis/new')}>
                <Plus className="w-4 h-4 mr-2" /> Yeni Sipariş Kaydı
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Aktif</TabsTrigger>
              <TabsTrigger value="shipped">Gönderildi</TabsTrigger>
              <TabsTrigger value="cancelled">İptal Edildi</TabsTrigger>
            </TabsList>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Label htmlFor="search" className="text-xs font-medium text-gray-700">Ara</Label>
                <div className="relative mt-1.5">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input id="search" placeholder="Sipariş no veya müşteri adı..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9" />
                </div>
              </div>
              <div className="w-full md:w-48">
                <Label htmlFor="status" className="text-xs font-medium text-gray-700">Durum</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger id="status" className="mt-1.5 h-9"><SelectValue placeholder="Tümü" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="draft">Taslak</SelectItem>
                    <SelectItem value="approved">Onaylandı</SelectItem>
                    <SelectItem value="shipped">Gönderildi</SelectItem>
                    <SelectItem value="cancelled">İptal Edildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="active">{renderTable('active')}</TabsContent>
            <TabsContent value="shipped">{renderTable('shipped')}</TabsContent>
            <TabsContent value="cancelled">{renderTable('cancelled')}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sipariş Silme</DialogTitle>
            <DialogDescription>
              {orderToDelete && (<><strong>{orderToDelete.order_no}</strong> numaralı siparişi silmek istediğinize emin misiniz?<br />Bu işlem geri alınamaz.</>)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteLoading}>{deleteLoading ? 'Siliniyor...' : 'Sil'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
