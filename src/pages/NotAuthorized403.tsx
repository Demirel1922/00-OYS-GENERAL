import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/common/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Lock } from 'lucide-react';

export function NotAuthorized403() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 rounded-full p-4">
                <Lock className="w-12 h-12 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Erişim Reddedildi</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              Bu sayfaya erişim yetkiniz bulunmamaktadır.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mt-6">
              <p className="text-red-800 font-medium">
                Hata Kodu: 403
              </p>
              <p className="text-red-600 text-sm mt-2">
                Yetkisiz erişim denemesi.
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
      </main>
    </div>
  );
}
