import { Header } from '@/components/common/Header';
import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, CheckCircle, Truck, Ban, FileText, AlertCircle } from 'lucide-react';
import type { OrderStatus } from '@/modules/sales-orders/domain/types';
import { STATUS_LABELS, PRICE_UNIT_LABELS, SOCK_TYPE_LABELS } from '@/modules/sales-orders/domain/types';
import { useLookupStore } from '@/store/lookupStore';
import { formatMoney2, formatDate, formatQuantity } from '@/modules/sales-orders/utils/format';
import { parsePriceString, canTransitionStatus, approveOrder, shipOrder, cancelOrder } from '@/modules/sales-orders/services/orderService';
import { useSalesOrder } from '@/modules/sales-orders/hooks/useSalesOrder';
import { downloadOrderPDF, openOrderPDFInNewTab } from '@/modules/sales-orders/utils/pdfExport';
import { differenceInDays, parseISO } from 'date-fns';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  approved: 'bg-blue-100 text-blue-700',
  shipped: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function SalesOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { order, loading, error, refetch } = useSalesOrder(id);
  const { items: lookupItems } = useLookupStore();
  const getBirimAdi = (kod: string) => {
    const birim = lookupItems.find(i => i.lookupType === 'BIRIM' && i.kod === kod);
    return birim?.ad || PRICE_UNIT_LABELS[kod] || kod || '-';
  };
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'approve' | 'ship' | 'cancel' | null>(null);

  const handleAction = useCallback(async () => {
    if (!order || !pendingAction) return;
    try {
      switch (pendingAction) {
        case 'approve': await approveOrder(order); break;
        case 'ship': await shipOrder(order); break;
        case 'cancel': await cancelOrder(order); break;
      }
      refetch();
    } catch (err) {
      console.error('Action failed:', err);
    } finally {
      setActionDialogOpen(false);
      setPendingAction(null);
    }
  }, [order, pendingAction, refetch]);

  const openActionDialog = useCallback((action: 'approve' | 'ship' | 'cancel') => {
    setPendingAction(action);
    setActionDialogOpen(true);
  }, []);

  const getActionDialogContent = () => {
    if (!pendingAction) return null;
    const actions = {
      approve: { title: 'Onayla', message: 'Siparişi onaylamak istediğinize emin misiniz?' },
      ship: { title: 'Gönder', message: 'Siparişi gönderildi olarak işaretlemek istediğinize emin misiniz? Gönderilme tarihi otomatik kaydedilecek.' },
      cancel: { title: 'İptal Et', message: 'Siparişi iptal etmek istediğinize emin misiniz?' },
    };
    return actions[pendingAction];
  };

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

  if (error || !order) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error?.message || 'Sipariş bulunamadı'}</p>
          <Button onClick={() => navigate('/module/4/siparis')} className="mt-4">Listeye Dön</Button>
        </div>
      </div>
    );
  }

  const canApprove = canTransitionStatus(order.status, 'approved').valid;
  const canShip = canTransitionStatus(order.status, 'shipped').valid;
  const canCancel = canTransitionStatus(order.status, 'cancelled').valid;

  const totalPairs = order.lines.reduce((sum, line) => sum + (line.line_total_pairs || 0), 0);
  const totalAmount = order.lines.reduce((sum, line) => sum + parsePriceString(line.line_amount), 0);

  // Termin performansı
  let terminPerf: { diff: number; label: string; color: string } | null = null;
  if (order.status === 'shipped' && order.shipped_at && order.confirmed_termin) {
    try {
      const diff = differenceInDays(parseISO(order.shipped_at), parseISO(order.confirmed_termin));
      if (diff <= 0) terminPerf = { diff, label: `${Math.abs(diff)} gün erken gönderildi`, color: 'text-emerald-600' };
      else terminPerf = { diff, label: `${diff} gün geç gönderildi`, color: 'text-red-600' };
    } catch {}
  }

  const dialogContent = getActionDialogContent();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/module/4/siparis')}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Sipariş Detayı</h1>
                <p className="text-gray-500">{order.order_no}</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" onClick={() => openOrderPDFInNewTab(order)}>
                <FileText className="w-4 h-4 mr-2" /> PDF Görüntüle
              </Button>
              <Button variant="outline" onClick={() => downloadOrderPDF(order)}>
                <FileText className="w-4 h-4 mr-2" /> PDF İndir
              </Button>
              {canApprove && <Button onClick={() => openActionDialog('approve')}><CheckCircle className="w-4 h-4 mr-2" />Onayla</Button>}
              {canShip && <Button onClick={() => openActionDialog('ship')} className="bg-emerald-600 hover:bg-emerald-700"><Truck className="w-4 h-4 mr-2" />Gönder</Button>}
              {canCancel && <Button variant="destructive" onClick={() => openActionDialog('cancel')}><Ban className="w-4 h-4 mr-2" />İptal Et</Button>}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
              <TabsTrigger value="items">Sipariş Kalemleri</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Sipariş Bilgileri</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Sipariş No:</span><span className="font-medium">{order.order_no}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Müşteri:</span><span className="font-medium">{order.customer_name}</span></div>
                    {order.customer_po_no && <div className="flex justify-between"><span className="text-gray-600">Müşteri PO No:</span><span className="font-medium">{order.customer_po_no}</span></div>}
                    <div className="flex justify-between"><span className="text-gray-600">Durum:</span><Badge className={STATUS_COLORS[order.status]}>{STATUS_LABELS[order.status]}</Badge></div>
                    <div className="flex justify-between"><span className="text-gray-600">Sipariş Tarihi:</span><span>{formatDate(order.order_date)}</span></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Termin Bilgileri</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Talep Edilen Termin:</span><span>{formatDate(order.requested_termin)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Onaylı Termin:</span><span>{formatDate(order.confirmed_termin)}</span></div>
                    {order.shipped_at && (
                      <div className="flex justify-between"><span className="text-gray-600">Gönderilme Tarihi:</span><span className="font-medium">{formatDate(order.shipped_at)}</span></div>
                    )}
                    {terminPerf && (
                      <div className="flex justify-between"><span className="text-gray-600">Performans:</span><span className={`font-medium ${terminPerf.color}`}>{terminPerf.label}</span></div>
                    )}
                    <div className="flex justify-between"><span className="text-gray-600">Ödeme Koşulları:</span><span>{order.payment_terms}</span></div>
                    {order.incoterm && <div className="flex justify-between"><span className="text-gray-600">Teslim Şekli:</span><span>{order.incoterm}</span></div>}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Toplamlar</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-600">Toplam Çift:</span><span className="font-medium">{formatQuantity(totalPairs)} çift</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Toplam Tutar:</span><span className="font-bold text-lg">{formatMoney2(totalAmount.toFixed(2), order.currency)}</span></div>
                  </div>
                </div>
              </div>

              {(order.notes || order.internal_notes) && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {order.notes && (<div><h3 className="font-semibold text-lg border-b pb-2 mb-2">Notlar</h3><p className="text-gray-700">{order.notes}</p></div>)}
                  {order.internal_notes && (<div><h3 className="font-semibold text-lg border-b pb-2 mb-2">Dahili Notlar</h3><p className="text-gray-700">{order.internal_notes}</p></div>)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="items">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Ürün</th>
                      <th className="text-left py-3 px-4 font-medium">Cinsiyet</th>
                      <th className="text-left py-3 px-4 font-medium">Tip</th>
                      <th className="text-left py-3 px-4 font-medium">Renk</th>
                      <th className="text-left py-3 px-4 font-medium">Beden</th>
                      <th className="text-right py-3 px-4 font-medium">Miktar</th>
                      <th className="text-left py-3 px-4 font-medium">Birim</th>
                      <th className="text-right py-3 px-4 font-medium">Birim Fiyat</th>
                      <th className="text-right py-3 px-4 font-medium">Toplam Çift</th>
                      <th className="text-right py-3 px-4 font-medium">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.lines.map((line, index) => {
                      const lineCurrency = line.currency || order.currency;
                      return (
                        <tr key={line.id || index} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{line.product_name}</td>
                          <td className="py-3 px-4">{line.gender || '-'}</td>
                          <td className="py-3 px-4">{SOCK_TYPE_LABELS[line.sock_type] || line.sock_type || ''}</td>
                          <td className="py-3 px-4">{line.color}</td>
                          <td className="py-3 px-4">{line.size}</td>
                          <td className="py-3 px-4 text-right">{formatQuantity(line.quantity)}</td>
                          <td className="py-3 px-4">{getBirimAdi(line.price_unit)}</td>
                          <td className="py-3 px-4 text-right">{formatMoney2(line.unit_price, lineCurrency)}</td>
                          <td className="py-3 px-4 text-right">{formatQuantity(line.line_total_pairs)}</td>
                          <td className="py-3 px-4 text-right font-medium">{formatMoney2(line.line_amount, lineCurrency)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold">Toplam:</span>
                  <div className="text-right">
                    <div className="font-bold">{formatQuantity(totalPairs)} çift</div>
                    <div className="text-xl font-bold text-primary">{formatMoney2(totalAmount.toFixed(2), order.currency)}</div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialogContent?.title}</DialogTitle>
            <DialogDescription>{dialogContent?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>İptal</Button>
            <Button onClick={handleAction} variant={pendingAction === 'cancel' ? 'destructive' : 'default'}>Onayla</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
