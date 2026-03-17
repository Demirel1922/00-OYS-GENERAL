import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getModuleById, MODULES } from '@/data/modules';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}

interface ModuleProtectedRouteProps {
  children: React.ReactNode;
}

export function ModuleProtectedRoute({ children }: ModuleProtectedRouteProps) {
  const { isAuthenticated, allowedModules, isAdmin } = useAuthStore();
  const pathname = window.location.pathname;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admin tüm modüllere erişebilir - hemen geç
  if (isAdmin || allowedModules.includes('all')) {
    return <>{children}</>;
  }

  // URL'den modül ID'sini bul: önce route ile tam eşleşme, sonra en uzun eşleşme
  let foundModule = MODULES.find(m => m.route === pathname);

  if (!foundModule) {
    // pathname ile başlayan en uzun route'u bul (en spesifik eşleşme)
    const candidates = MODULES.filter(m => pathname.startsWith(m.route) && m.route !== '/');
    if (candidates.length > 0) {
      foundModule = candidates.sort((a, b) => b.route.length - a.route.length)[0];
    }
  }

  // Route bulunamadıysa, /module/ altında olduğu sürece en üst modüle bak
  if (!foundModule && pathname.startsWith('/module/')) {
    const parts = pathname.split('/');
    // /module/4/siparis/new → moduleId parçası "4"
    if (parts.length >= 3) {
      const topModuleId = parts[2];
      foundModule = MODULES.find(m => m.id === topModuleId);
    }
  }

  if (!foundModule) {
    return <Navigate to="/404" replace />;
  }

  // Kullanıcının bu modüle yetkisi var mı?
  const moduleId = foundModule.id;
  const parentId = foundModule.parent;
  const hasDirectAccess = allowedModules.includes(moduleId);
  const hasParentAccess = parentId ? allowedModules.includes(parentId) : false;
  // Üst üst modüle de bak (3 seviyeli hiyerarşi için)
  let hasGrandParentAccess = false;
  if (parentId) {
    const parentModule = MODULES.find(m => m.id === parentId);
    if (parentModule?.parent) {
      hasGrandParentAccess = allowedModules.includes(parentModule.parent);
    }
  }

  if (!hasDirectAccess && !hasParentAccess && !hasGrandParentAccess) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
