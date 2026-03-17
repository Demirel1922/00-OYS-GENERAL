import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { ModuleCard } from '@/components/dashboard/ModuleCard';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getChildModules } from '@/data/modules';
import { useAuthStore } from '@/store/authStore';

export default function HammaddeDepo() {
  const navigate = useNavigate();
  const { allowedModules, isAdmin } = useAuthStore();
  
  // Alt modülleri getir (İplik Depo ve Aksesuar Depo)
  const childModules = getChildModules('3');
  
  // Yetki kontrolü
  const visibleModules = childModules.filter((m) => {
    if (isAdmin || allowedModules.includes('all')) return true;
    return allowedModules.includes(m.id);
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')} 
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard&apos;a Dön
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Hammadde / Malzeme Depo</h1>
          <p className="text-gray-600 mt-2">
            Hammadde ve malzeme depo yönetimi modülleri
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleModules.map((module) => (
            <ModuleCard key={module.id} module={module} isChild />
          ))}
        </div>

        {visibleModules.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Erişiminiz olan alt modül bulunmamaktadır.</p>
          </div>
        )}
      </main>
    </div>
  );
}
