import { Header } from '@/components/common/Header';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Package, TrendingUp, Clock, CheckCircle, XCircle, BarChart3 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts';
import { differenceInDays, parseISO, format } from 'date-fns';
import { tr } from 'date-fns/locale';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';
import { STATUS_LABELS } from '@/modules/sales-orders/domain/types';
import { formatMoney2, formatDate, formatQuantity } from '@/modules/sales-orders/utils/format';
import { parsePriceString } from '@/modules/sales-orders/services/orderService';
import { useSalesOrders } from '@/modules/sales-orders/hooks/useSalesOrders';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const PIE_COLORS = ['#10b981', '#ef4444', '#f59e0b'];

export function AnalyticsPage() {
  const navigate = useNavigate();
  const { orders, loading } = useSalesOrders();

  const analytics = useMemo(() => {
    if (!orders.length) return null;

    // Genel istatistikler
    const totalOrders = orders.length;
    const activeOrders = orders.filter((o) => o.status === 'draft' || o.status === 'approved').length;
    const shippedOrders = orders.filter((o) => o.status === 'shipped');
    const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length;
    const totalPairs = orders.reduce((s, o) => s + o.total_pairs, 0);

    // Para birimi bazlı ciro
    const revenueByCurrency: Record<string, number> = {};
    orders.forEach((o) => {
      if (o.status !== 'cancelled') {
        revenueByCurrency[o.currency] = (revenueByCurrency[o.currency] || 0) + parsePriceString(o.total_amount);
      }
    });

    // Termin performansı
    const shippedWithTermin = shippedOrders.filter((o) => o.shipped_at && o.confirmed_termin);
    let onTime = 0;
    let late = 0;
    let totalDelay = 0;
    const terminDetails: Array<{ order: SalesOrder; diff: number }> = [];

    shippedWithTermin.forEach((o) => {
      try {
        const diff = differenceInDays(parseISO(o.shipped_at!), parseISO(o.confirmed_termin));
        terminDetails.push({ order: o, diff });
        if (diff <= 0) onTime++;
        else { late++; totalDelay += diff; }
      } catch {}
    });

    const terminSuccessRate = shippedWithTermin.length > 0 ? Math.round((onTime / shippedWithTermin.length) * 100) : 0;
    const avgDelay = late > 0 ? Math.round(totalDelay / late) : 0;

    // Durum dağılımı
    const statusDist = [
      { name: 'Taslak', value: orders.filter((o) => o.status === 'draft').length, color: '#94a3b8' },
      { name: 'Onaylandı', value: orders.filter((o) => o.status === 'approved').length, color: '#3b82f6' },
      { name: 'Gönderildi', value: shippedOrders.length, color: '#10b981' },
      { name: 'İptal', value: cancelledOrders, color: '#ef4444' },
    ].filter((d) => d.value > 0);

    // Müşteri dağılımı
    const customerMap: Record<string, { pairs: number; amount: number; count: number }> = {};
    orders.filter((o) => o.status !== 'cancelled').forEach((o) => {
      if (!customerMap[o.customer_name]) customerMap[o.customer_name] = { pairs: 0, amount: 0, count: 0 };
      customerMap[o.customer_name].pairs += o.total_pairs;
      customerMap[o.customer_name].amount += parsePriceString(o.total_amount);
      customerMap[o.customer_name].count++;
    });
    const customerDist = Object.entries(customerMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);

    // Müşteri bazlı termin başarısı
    const customerTermin: Record<string, { onTime: number; late: number }> = {};
    terminDetails.forEach(({ order: o, diff }) => {
      if (!customerTermin[o.customer_name]) customerTermin[o.customer_name] = { onTime: 0, late: 0 };
      if (diff <= 0) customerTermin[o.customer_name].onTime++;
      else customerTermin[o.customer_name].late++;
    });
    const customerTerminData = Object.entries(customerTermin).map(([name, d]) => ({
      name,
      basari: d.onTime + d.late > 0 ? Math.round((d.onTime / (d.onTime + d.late)) * 100) : 0,
      toplam: d.onTime + d.late,
    }));

    // Aylık trend
    const monthMap: Record<string, { count: number; pairs: number; amount: number }> = {};
    orders.filter((o) => o.status !== 'cancelled').forEach((o) => {
      try {
        const month = format(parseISO(o.order_date), 'yyyy-MM');
        if (!monthMap[month]) monthMap[month] = { count: 0, pairs: 0, amount: 0 };
        monthMap[month].count++;
        monthMap[month].pairs += o.total_pairs;
        monthMap[month].amount += parsePriceString(o.total_amount);
      } catch {}
    });
    const monthlyTrend = Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: format(parseISO(`${month}-01`), 'MMM yyyy', { locale: tr }),
        ...data,
      }));

    // Termin performans pasta
    const terminPie = [
      { name: 'Zamanında', value: onTime, color: '#10b981' },
      { name: 'Gecikmeli', value: late, color: '#ef4444' },
    ].filter((d) => d.value > 0);

    return {
      totalOrders, activeOrders, shippedCount: shippedOrders.length, cancelledOrders,
      totalPairs, revenueByCurrency, terminSuccessRate, avgDelay,
      statusDist, customerDist, customerTerminData, monthlyTrend,
      terminPie, terminDetails,
    };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz sipariş verisi yok</p>
            <Button onClick={() => navigate('/module/4/siparis')} className="mt-4">Siparişlere Dön</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/module/4/siparis')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6" /> Sipariş Analizi</h1>
          <p className="text-gray-500">Sipariş performansınızı takip edin</p>
        </div>
      </div>

      {/* Özet Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Toplam Sipariş</p>
              <p className="text-2xl font-bold">{analytics.totalOrders}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-amber-500" />
            <div>
              <p className="text-xs text-gray-500">Aktif Sipariş</p>
              <p className="text-2xl font-bold">{analytics.activeOrders}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-emerald-500" />
            <div>
              <p className="text-xs text-gray-500">Toplam Çift</p>
              <p className="text-2xl font-bold">{formatQuantity(analytics.totalPairs)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
            <div>
              <p className="text-xs text-gray-500">Termin Başarısı</p>
              <p className={`text-2xl font-bold ${analytics.terminSuccessRate >= 80 ? 'text-emerald-600' : analytics.terminSuccessRate >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                %{analytics.terminSuccessRate}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-xs text-gray-500">Toplam Ciro</p>
              {Object.entries(analytics.revenueByCurrency).map(([c, amt]) => (
                <p key={c} className="text-lg font-bold">{formatMoney2(amt.toFixed(2), c)}</p>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Grafikler - Üst Sıra */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Durum Dağılımı */}
        <Card>
          <CardHeader className="pb-2"><h3 className="font-semibold">Durum Dağılımı</h3></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={analytics.statusDist} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {analytics.statusDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Termin Başarı Pasta */}
        <Card>
          <CardHeader className="pb-2"><h3 className="font-semibold">Termin Performansı</h3></CardHeader>
          <CardContent>
            {analytics.terminPie.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={analytics.terminPie} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {analytics.terminPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">Henüz gönderilmiş sipariş yok</div>
            )}
            {analytics.avgDelay > 0 && (
              <p className="text-center text-sm text-gray-500 mt-2">Ortalama gecikme: <span className="font-medium text-red-600">{analytics.avgDelay} gün</span></p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grafikler - Alt Sıra */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Müşteri Dağılımı */}
        <Card>
          <CardHeader className="pb-2"><h3 className="font-semibold">Müşteri Sipariş Dağılımı</h3></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={analytics.customerDist} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                <Tooltip formatter={(value: number) => formatQuantity(value)} />
                <Bar dataKey="pairs" fill="#3b82f6" name="Çift" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Müşteri Termin Başarısı */}
        <Card>
          <CardHeader className="pb-2"><h3 className="font-semibold">Müşteri Termin Başarısı</h3></CardHeader>
          <CardContent>
            {analytics.customerTerminData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analytics.customerTerminData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} unit="%" />
                  <YAxis dataKey="name" type="category" width={100} fontSize={12} />
                  <Tooltip formatter={(value: number) => `%${value}`} />
                  <Bar dataKey="basari" fill="#10b981" name="Başarı %" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">Veri yok</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Aylık Trend */}
      {analytics.monthlyTrend.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><h3 className="font-semibold">Aylık Sipariş Trendi</h3></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" name="Sipariş Adedi" strokeWidth={2} />
                <Line yAxisId="right" type="monotone" dataKey="pairs" stroke="#10b981" name="Toplam Çift" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Termin Detay Tablosu */}
      {analytics.terminDetails.length > 0 && (
        <Card>
          <CardHeader className="pb-2"><h3 className="font-semibold">Gönderilme Performans Detayı</h3></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Sipariş No</th>
                    <th className="text-left py-2 px-3 font-medium">Müşteri</th>
                    <th className="text-left py-2 px-3 font-medium">Onaylı Termin</th>
                    <th className="text-left py-2 px-3 font-medium">Gönderilme</th>
                    <th className="text-center py-2 px-3 font-medium">Fark (Gün)</th>
                    <th className="text-center py-2 px-3 font-medium">Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.terminDetails
                    .sort((a, b) => b.diff - a.diff)
                    .map(({ order: o, diff }) => (
                    <tr key={o.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/module/4/siparis/${o.id}`)}>
                      <td className="py-2 px-3 font-medium">{o.order_no}</td>
                      <td className="py-2 px-3">{o.customer_name}</td>
                      <td className="py-2 px-3">{formatDate(o.confirmed_termin)}</td>
                      <td className="py-2 px-3">{formatDate(o.shipped_at)}</td>
                      <td className="py-2 px-3 text-center font-medium">
                        {diff <= 0 ? `${Math.abs(diff)} gün erken` : `${diff} gün geç`}
                      </td>
                      <td className="py-2 px-3 text-center">
                        {diff <= 0
                          ? <span className="inline-flex items-center gap-1 text-emerald-600"><CheckCircle className="w-4 h-4" /> Zamanında</span>
                          : <span className="inline-flex items-center gap-1 text-red-600"><XCircle className="w-4 h-4" /> Gecikmeli</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      </div>
    </div>
  );
}
