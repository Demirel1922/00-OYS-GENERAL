import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileQuestion } from 'lucide-react';

export function NotFound404() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="bg-gray-200 rounded-full p-4">
              <FileQuestion className="w-12 h-12 text-gray-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Sayfa Bulunamadı</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            Aradığınız sayfa mevcut değil veya taşınmış olabilir.
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mt-6">
            <p className="text-gray-800 font-medium">
              Hata Kodu: 404
            </p>
            <p className="text-gray-600 text-sm mt-2">
              Sayfa bulunamadı.
            </p>
          </div>
          <Button
            onClick={() => navigate('/dashboard')}
            className="mt-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard'a Dön
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
