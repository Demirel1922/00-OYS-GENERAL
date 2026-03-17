import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Construction } from 'lucide-react';
import { getModuleById } from '@/data/modules';

export function ModulePlaceholder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const module = getModuleById(id || '');

  const handleBack = () => {
    navigate('/dashboard');
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
          Dashboard'a Dön
        </Button>

        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-100 rounded-full p-4">
                <Construction className="w-12 h-12 text-yellow-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">
              {module ? module.title : 'Modül'}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              {module ? module.description : ''}
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
              <p className="text-blue-800 font-medium">
                Bu modül sonraki aşamada aktif edilecektir.
              </p>
              <p className="text-blue-600 text-sm mt-2">
                Modül ID: {id}
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
