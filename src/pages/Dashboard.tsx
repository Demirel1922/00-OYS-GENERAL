import { useMemo } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Header } from '@/components/common/Header';
import { ModuleCard } from '@/components/dashboard/ModuleCard';
import { getTopLevelModules } from '@/data/modules';

export function Dashboard() {
  const { user, allowedModules, isAdmin } = useAuthStore();

  // Sadece top-level modülleri göster (parent === null)
  const visibleModules = useMemo(() => {
    const topLevelModules = getTopLevelModules();
    
    // Admin tüm modülleri görür
    if (isAdmin || allowedModules.includes('all')) {
      return topLevelModules;
    }

    // Kullanıcı sadece yetkili olduğu modülleri görür
    return topLevelModules.filter((module) => 
      allowedModules.includes(module.id)
    );
  }, [allowedModules, isAdmin]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">OYS</h1>
          <p className="text-gray-600 mt-2">
            Hoş geldiniz, {user?.fullName}. Erişiminiz olan modüller aşağıda listelenmiştir.
          </p>
        </div>

        {/* Top-Level Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleModules.map((module) => (
            <ModuleCard key={module.id} module={module} />
          ))}
        </div>

        {/* No modules message */}
        {visibleModules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Erişiminiz olan modül bulunmamaktadır.</p>
            <p className="text-gray-400 text-sm mt-2">
              Lütfen yöneticinizle iletişime geçin.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
