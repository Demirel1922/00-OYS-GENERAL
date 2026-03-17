import { useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Admin } from '@/pages/Admin';
import { ModulePlaceholder } from '@/pages/ModulePlaceholder';
import { SubModulePlaceholder } from '@/pages/SubModulePlaceholder';
import { NotAuthorized403 } from '@/pages/NotAuthorized403';
import { NotFound404 } from '@/pages/NotFound404';
import { ProtectedRoute, ModuleProtectedRoute } from '@/components/common/ProtectedRoute';

// Modül sayfaları
import IplikDepo from '@/pages/IplikDepo';
import AksesuarDepo from '@/pages/AksesuarDepo';
import HammaddeDepo from '@/pages/HammaddeDepo';
import SiparisSatisSevkiyat from '@/pages/SiparisSatisSevkiyat';
import Sertifikalar from '@/pages/Sertifikalar';
import DIRPage from '@/pages/Sertifikalar/DIR';

// Bilgi Girişleri Modülü (Modül 1) sayfaları
import BilgiGirisleri from '@/pages/BilgiGirisleri';
import Musteriler from '@/pages/BilgiGirisleri/Musteriler';
import Tedarikciler from '@/pages/BilgiGirisleri/Tedarikciler';
import Depolar from '@/pages/BilgiGirisleri/Depolar';
import GenelCorapBilgileri from '@/pages/BilgiGirisleri/GenelCorapBilgileri';
import IplikTanimlari from '@/pages/IplikTanimlari';

// Sipariş Modülü (Modül 4a) sayfaları
import { SalesOrdersPage } from '@/modules/sales-orders/pages/SalesOrdersPage';
import { SalesOrderNew } from '@/modules/sales-orders/pages/SalesOrderNew';
import { SalesOrderDetail } from '@/modules/sales-orders/pages/SalesOrderDetail';
import { AnalyticsPage } from '@/modules/sales-orders/pages/AnalyticsPage';

// Numune Modülü (Modül 2) sayfaları
import { NumuneDashboard } from '@/modules/numune/pages/NumuneDashboard';
import { NumuneTaleplerPage } from '@/modules/numune/pages/NumuneTaleplerPage';
import { YeniNumune } from '@/modules/numune/pages/YeniNumune';
import { MusteriAnalizi } from '@/modules/numune/pages/MusteriAnalizi';

// Üretim Hazırlık Modülü (Modül 2b) sayfaları
import { UretimHazirlikListePage } from '@/modules/uretim-hazirlik/pages/UretimHazirlikListePage';
import { UretimHazirlikDetayPage } from '@/modules/uretim-hazirlik/pages/UretimHazirlikDetayPage';

// Auth check wrapper
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    checkAuth();
  }, [checkAuth, location.pathname]);

  return <>{children}</>;
}

// Public route - redirect to dashboard if authenticated
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Admin Route */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* Module Routes */}
      {/* Hammadde / Malzeme Depo Ana Modülü */}
      <Route
        path="/module/3"
        element={
          <ModuleProtectedRoute>
            <HammaddeDepo />
          </ModuleProtectedRoute>
        }
      />

      {/* Bilgi Girişleri Ana Modülü (Modül 1) */}
      <Route
        path="/module/1"
        element={
          <ModuleProtectedRoute>
            <BilgiGirisleri />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/1/musteriler"
        element={
          <ModuleProtectedRoute>
            <Musteriler />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/1/tedarikciler"
        element={
          <ModuleProtectedRoute>
            <Tedarikciler />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/1/depolar"
        element={
          <ModuleProtectedRoute>
            <Depolar />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/1/genel-corap-bilgileri"
        element={
          <ModuleProtectedRoute>
            <GenelCorapBilgileri />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/1/iplik-tanimlari"
        element={
          <ModuleProtectedRoute>
            <IplikTanimlari />
          </ModuleProtectedRoute>
        }
      />

      {/* Sipariş Modülü (4a) - Gerçek implementasyon */}
      <Route
        path="/module/4/siparis"
        element={
          <ModuleProtectedRoute>
            <SalesOrdersPage />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/4/siparis/new"
        element={
          <ModuleProtectedRoute>
            <SalesOrderNew />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/4/siparis/analytics"
        element={
          <ModuleProtectedRoute>
            <AnalyticsPage />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/4/siparis/:id"
        element={
          <ModuleProtectedRoute>
            <SalesOrderDetail />
          </ModuleProtectedRoute>
        }
      />

      {/* İplik Depo Modülü (3a) - Gerçek implementasyon */}
      <Route
        path="/module/3a"
        element={
          <ModuleProtectedRoute>
            <IplikDepo />
          </ModuleProtectedRoute>
        }
      />

      {/* Aksesuar Depo Modülü (3b) */}
      <Route
        path="/module/3b"
        element={
          <ModuleProtectedRoute>
            <AksesuarDepo />
          </ModuleProtectedRoute>
        }
      />

      {/* Sipariş-Satış-Sevkiyat Ana Modülü */}
      <Route
        path="/module/4"
        element={
          <ModuleProtectedRoute>
            <SiparisSatisSevkiyat />
          </ModuleProtectedRoute>
        }
      />

      {/* Sipariş-Satış-Sevkiyat Alt Modülleri - Satış ve Sevkiyat hâlâ placeholder */}
      <Route
        path="/module/4/satis"
        element={
          <ModuleProtectedRoute>
            <SubModulePlaceholder />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/4/sevkiyat"
        element={
          <ModuleProtectedRoute>
            <SubModulePlaceholder />
          </ModuleProtectedRoute>
        }
      />

      {/* Sertifikalar Ana Modülü */}
      <Route
        path="/module/11"
        element={
          <ModuleProtectedRoute>
            <Sertifikalar />
          </ModuleProtectedRoute>
        }
      />

      {/* DİR Ana Modülü */}
      <Route
        path="/module/11/dir"
        element={
          <ModuleProtectedRoute>
            <DIRPage />
          </ModuleProtectedRoute>
        }
      />

      {/* DİR Alt Modülleri */}
      <Route
        path="/module/11/dir/tanimlar"
        element={
          <ModuleProtectedRoute>
            <SubModulePlaceholder />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/11/dir/belgeler"
        element={
          <ModuleProtectedRoute>
            <SubModulePlaceholder />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/11/dir/yonetim"
        element={
          <ModuleProtectedRoute>
            <SubModulePlaceholder />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/11/dir/raporlar"
        element={
          <ModuleProtectedRoute>
            <SubModulePlaceholder />
          </ModuleProtectedRoute>
        }
      />

      {/* Yönetim Modülü (10) - Kullanıcı Yetkilendirme */}
      <Route
        path="/module/10"
        element={
          <ProtectedRoute requireAdmin={true}>
            <Admin />
          </ProtectedRoute>
        }
      />

      {/* Numune Yönetimi Ana Modülü (Modül 2) */}
      <Route
        path="/module/2"
        element={
          <ModuleProtectedRoute>
            <NumuneDashboard />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/2/talepler"
        element={
          <ModuleProtectedRoute>
            <NumuneTaleplerPage />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/2/yeni"
        element={
          <ModuleProtectedRoute>
            <YeniNumune />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/2/musteri-analizi"
        element={
          <ModuleProtectedRoute>
            <MusteriAnalizi />
          </ModuleProtectedRoute>
        }
      />

      {/* Üretim Hazırlık Modülü (Modül 2b) */}
      <Route
        path="/module/2/uretim-hazirlik"
        element={
          <ModuleProtectedRoute>
            <UretimHazirlikListePage />
          </ModuleProtectedRoute>
        }
      />
      <Route
        path="/module/2/uretim-hazirlik/detay/:id"
        element={
          <ModuleProtectedRoute>
            <UretimHazirlikDetayPage />
          </ModuleProtectedRoute>
        }
      />

      {/* Diğer modüller için placeholder */}
      <Route
        path="/module/:id"
        element={
          <ModuleProtectedRoute>
            <ModulePlaceholder />
          </ModuleProtectedRoute>
        }
      />

      {/* Error Pages */}
      <Route
        path="/403"
        element={
          <ProtectedRoute>
            <NotAuthorized403 />
          </ProtectedRoute>
        }
      />

      <Route path="/404" element={<NotFound404 />} />

      {/* Redirect root to login or dashboard */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Catch all - 404 */}
      <Route path="*" element={<NotFound404 />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthWrapper>
        <AppRoutes />
      </AuthWrapper>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
