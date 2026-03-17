// ============================================
// İPLİK TANIMLARI - ANA SAYFA
// ============================================
import { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRightLeft, 
  Layers, 
  Ruler, 
  Palette,
  Database
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Sekme bileşenleri
import IslemTipleriTab from './IslemTipleriTab';
import IplikDetaylariTab from './IplikDetaylariTab';
import KalinliklarTab from './KalinliklarTab';
import RenklerTab from './RenklerTab';

// Store'lar
import { useIslemTipiStore } from '@/store/islemTipiStore';
import { useIplikDetayStore } from '@/store/iplikDetayStore';
import { useKalinlikStore } from '@/store/kalinlikStore';
import { useRenkStore } from '@/store/renkStore';

export default function IplikTanimlari() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('islem');
  
  // Store'lardan veri sayılarını al
  const { islemTipleri, seedData: seedIslem } = useIslemTipiStore();
  const { detaylar, seedData: seedDetay } = useIplikDetayStore();
  const { kalinliklar, seedData: seedKalinlik } = useKalinlikStore();
  const { renkler, seedData: seedRenk } = useRenkStore();

  // İlk yüklemede verileri seed et
  useEffect(() => {
    if (islemTipleri.length === 0) seedIslem();
    if (detaylar.length === 0) seedDetay();
    if (kalinliklar.length === 0) seedKalinlik();
    if (renkler.length === 0) seedRenk();
  }, []);

  // Aktif sayıları hesapla
  const aktifIslem = islemTipleri.filter(i => i.durum === 'AKTIF').length;
  const aktifKalinlik = kalinliklar.filter(k => k.durum === 'AKTIF').length;
  const aktifRenk = renkler.filter(r => r.durum === 'AKTIF').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık ve Geri Butonu */}
        <div className="mb-8 flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/module/1')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Geri
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Database className="w-8 h-8 text-indigo-600" />
              İplik Tanımları
            </h1>
            <p className="text-gray-600 mt-2">
              İplik, Numune, Ürün Reçetesi modüllerinin referans alacağı master data havuzu
            </p>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">İşlem Tipleri</p>
                  <p className="text-2xl font-bold text-blue-900">{aktifIslem}</p>
                </div>
                <ArrowRightLeft className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">İplik Detayları</p>
                  <p className="text-2xl font-bold text-purple-900">{detaylar.length}</p>
                </div>
                <Layers className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Kalınlıklar</p>
                  <p className="text-2xl font-bold text-orange-900">{aktifKalinlik}</p>
                </div>
                <Ruler className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-pink-50 border-pink-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-600 font-medium">Renkler</p>
                  <p className="text-2xl font-bold text-pink-900">{aktifRenk}</p>
                </div>
                <Palette className="w-8 h-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sekmeler */}
        <Card>
          <CardHeader>
            <CardTitle>Tanım Yönetimi</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="islem" className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  İşlem Tipleri
                  <Badge variant="secondary" className="ml-1">{aktifIslem}</Badge>
                </TabsTrigger>
                <TabsTrigger value="detay" className="flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  İplik Detayları
                  <Badge variant="secondary" className="ml-1">{detaylar.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="kalinlik" className="flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Kalınlıklar
                  <Badge variant="secondary" className="ml-1">{aktifKalinlik}</Badge>
                </TabsTrigger>
                <TabsTrigger value="renk" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Renkler
                  <Badge variant="secondary" className="ml-1">{aktifRenk}</Badge>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="islem" className="mt-6">
                <IslemTipleriTab />
              </TabsContent>
              
              <TabsContent value="detay" className="mt-6">
                <IplikDetaylariTab />
              </TabsContent>
              
              <TabsContent value="kalinlik" className="mt-6">
                <KalinliklarTab />
              </TabsContent>
              
              <TabsContent value="renk" className="mt-6">
                <RenklerTab />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
