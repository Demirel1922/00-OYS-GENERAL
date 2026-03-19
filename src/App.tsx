import { useEffect, lazy, Suspense } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { Toaster } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { ProtectedRoute, ModuleProtectedRoute } from '@/components/common/ProtectedRoute';

// ── Lazy-loaded sayfa bileşenleri ──────────────────────────────

// Named export → .then(m => ({ default: m.X }))
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Admin = lazy(() => import('@/pages/Admin').then(m => ({ default: m.Admin })));
const ModulePlaceholder = lazy(() => import('@/pages/ModulePlaceholder').then(m => ({ default: m.ModulePlaceholder })));
const SubModulePlaceholder = lazy(() => import('@/pages/SubModulePlaceholder').then(m => ({ default: m.SubModulePlaceholder })));
const NotAuthorized403 = lazy(() => import('@/pages/NotAuthorized403').then(m => ({ default: m.NotAuthorized403 })));
const NotFound404 = lazy(() => import('@/pages/NotFound404').then(m => ({ default: m.NotFound404 })));

// Default export → lazy(() => import('...'))
const IplikDepo = lazy(() => import('@/pages/IplikDepo'));
const AksesuarDepo = lazy(() => import('@/pages/AksesuarDepo'));
const HammaddeDepo = lazy(() => import('@/pages/HammaddeDepo'));
const SiparisSatisSevkiyat = lazy(() => import('@/pages/SiparisSatisSevkiyat'));
const Sertifikalar = lazy(() => import('@/pages/Sertifikalar'));
const DIRPage = lazy(() => import('@/pages/Sertifikalar/DIR'));

// Bilgi Girişleri Modülü (Modül 1) sayfaları — default export
const BilgiGirisleri = lazy(() => import('@/pages/BilgiGirisleri'));
const Musteriler = lazy(() => import('@/pages/BilgiGirisleri/Musteriler'));
const Tedarikciler = lazy(() => import('@/pages/BilgiGirisleri/Tedarikciler'));
const Depolar = lazy(() => import('@/pages/BilgiGirisleri/Depolar'));
const GenelCorapBilgileri = lazy(() => import('@/pages/BilgiGirisleri/GenelCorapBilgileri'));
const IplikTanimlari = lazy(() => import('@/pages/IplikTanimlari'));
const ArtikelTanimlari = lazy(() => import('@/pages/BilgiGirisleri/ArtikelTanimlari'));

// Sipariş Modülü (Modül 4a) sayfaları — named export
const SalesOrdersPage = lazy(() => import('@/modules/sales-orders/pages/SalesOrdersPage').then(m => ({ default: m.SalesOrdersPage })));
const SalesOrderNew = lazy(() => import('@/modules/sales-orders/pages/SalesOrderNew').then(m => ({ default: m.SalesOrderNew })));
const SalesOrderDetail = lazy(() => import('@/modules/sales-orders/pages/SalesOrderDetail').then(m => ({ default: m.SalesOrderDetail })));
const AnalyticsPage = lazy(() => import('@/modules/sales-orders/pages/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));

// Numune Modülü (Modül 2) sayfaları — named export
const NumuneDashboard = lazy(() => import('@/modules/numune/pages/NumuneDashboard').then(m => ({ default: m.NumuneDashboard })));
const NumuneTaleplerPage = lazy(() => import('@/modules/numune/pages/NumuneTaleplerPage').then(m => ({ default: m.NumuneTaleplerPage })));
const YeniNumune = lazy(() => import('@/modules/numune/pages/YeniNumune').then(m => ({ default: m.YeniNumune })));
const MusteriAnalizi = lazy(() => import('@/modules/numune/pages/MusteriAnalizi').then(m => ({ default: m.MusteriAnalizi })));

// Üretim Hazırlık Modülü (Modül 2b) sayfaları — named export
const UretimHazirlikListePage = lazy(() => import('@/modules/uretim-hazirlik/pages/UretimHazirlikListePage').then(m => ({ default: m.UretimHazirlikListePage })));
const UretimHazirlikDetayPage = lazy(() => import('@/modules/uretim-hazirlik/pages/UretimHazirlikDetayPage').then(m => ({ default: m.UretimHazirlikDetayPage })));

// ── Sayfa yükleme göstergesi ───────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-gray-500">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      <span className="text-sm font-medium">Yükleniyor...</span>
    </div>
  );
}

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
    <Suspense fallback={<PageLoader />}>
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
      <Route
        path="/module/1/artikel-tanimlari"
        element={
          <ModuleProtectedRoute>
            <ArtikelTanimlari />
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
    </Suspense>
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
