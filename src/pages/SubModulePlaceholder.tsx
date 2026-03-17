import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Construction } from 'lucide-react';
import { getModuleById, getParentModule } from '@/data/modules';

export function SubModulePlaceholder() {
  const navigate = useNavigate();
  const { '*': splat } = useParams();
  
  // URL'den modül ID'sini çıkar
  const moduleId = splat?.split('/').pop() || '';
  const module = getModuleById(moduleId);
  const parentModule = module ? getParentModule(module.id) : undefined;

  const handleBack = () => {
    if (parentModule) {
      navigate(parentModule.route);
    } else {
      navigate(-1);
    }
  };

  const getBreadcrumb = () => {
    if (!module) return 'Bilinmeyen Modül';
    if (parentModule) {
      return `${parentModule.title} / ${module.title}`;
    }
    return module.title;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={handleBack}
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 rounded-full p-4">
                <Construction className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {getBreadcrumb()}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {module?.description || 'Modül açıklaması'}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
              <p className="text-blue-800 font-medium">
                Bu ekran daha sonra doldurulacak.
              </p>
              <p className="text-blue-600 text-sm mt-2">
                Modül ID: {moduleId}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
