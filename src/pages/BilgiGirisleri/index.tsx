// ============================================
// BİLGİ GİRİŞLERİ - ANA MODÜL SAYFASI
// ============================================
// Alt modüllere navigasyon sağlar
// ============================================
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Truck, 
  Warehouse, 
  Tag, 
  Footprints,
  ArrowRight,
  ArrowLeft,
  Database,
  Settings,
  CircleDot,
  Edit3,
  Hash
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useMusteriStore } from '@/store/musteriStore';
import { useTedarikciStore } from '@/store/tedarikciStore';
import { useDepoStore } from '@/store/depoStore';
import { useTedarikciKategoriStore } from '@/store/tedarikciKategoriStore';
import { useLookupStore } from '@/store/lookupStore';
import { useIslemTipiStore } from '@/store/islemTipiStore';
import { useIplikDetayStore } from '@/store/iplikDetayStore';
import { useKalinlikStore } from '@/store/kalinlikStore';
import { useRenkStore } from '@/store/renkStore';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { getOrderCounter, setOrderCounter } from '@/lib/db';

interface SubModule {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  route: string;
  color: string;
  count?: number;
}

export default function BilgiGirisleri() {
  const navigate = useNavigate();
  
  // Store'lardan veri sayılarını al
  const { musteriler, seedData: seedMusteriler } = useMusteriStore();
  const { tedarikciler, seedData: seedTedarikciler } = useTedarikciStore();
  const { depolar, seedData: seedDepolar } = useDepoStore();
  const { kategoriler, seedData: seedKategoriler } = useTedarikciKategoriStore();
  const { items, seedData: seedLookups } = useLookupStore();
  
  // İplik Tanımları store'ları
  const { islemTipleri, seedData: seedIslem } = useIslemTipiStore();
  const { detaylar, seedData: seedDetay } = useIplikDetayStore();
  const { kalinliklar, seedData: seedKalinlik } = useKalinlikStore();
  const { renkler, seedData: seedRenk } = useRenkStore();

  // Sipariş sıra sayacı
  const [orderSeq, setOrderSeq] = useState<number>(0);
  const [editingSeq, setEditingSeq] = useState(false);
  const [tempSeq, setTempSeq] = useState('');

  // İlk yüklemede verileri seed et
  useEffect(() => {
    if (musteriler.length === 0) seedMusteriler();
    if (tedarikciler.length === 0) seedTedarikciler();
    if (depolar.length === 0) seedDepolar();
    if (kategoriler.length === 0) seedKategoriler();
    if (items.length === 0) seedLookups();
    if (islemTipleri.length === 0) seedIslem();
    if (detaylar.length === 0) seedDetay();
    if (kalinliklar.length === 0) seedKalinlik();
    if (renkler.length === 0) seedRenk();
    // Sipariş sayacını yükle
    getOrderCounter().then(setOrderSeq);
  }, []);

  // Lookup sayılarını hesapla
  const bedenCount = items.filter(i => i.lookupType === 'BEDEN').length;
  const tipCount = items.filter(i => i.lookupType === 'TIP').length;
  const cinsiyetCount = items.filter(i => i.lookupType === 'CINSIYET').length;

  const subModules: SubModule[] = [
    {
      id: 'musteriler',
      title: 'Müşteriler',
      description: 'Müşteri kartlarını yönetin. Sipariş modülünde kullanılacak müşteri tanımları.',
      icon: Users,
      route: '/module/1/musteriler',
      color: 'bg-blue-500',
      count: musteriler.length,
    },
    {
      id: 'tedarikciler',
      title: 'Tedarikçiler',
      description: 'Tedarikçi kartlarını yönetin. Satınalma modülünde kullanılacak tedarikçi tanımları.',
      icon: Truck,
      route: '/module/1/tedarikciler',
      color: 'bg-purple-500',
      count: tedarikciler.length,
    },
    {
      id: 'depolar',
      title: 'Depolar',
      description: 'Depo tanımlarını yönetin. Depo kodu 1000-9999 arasında manuel girilir.',
      icon: Warehouse,
      route: '/module/1/depolar',
      color: 'bg-orange-500',
      count: depolar.length,
    },
    {
      id: 'genel-corap-bilgileri',
      title: 'Genel Çorap Bilgileri',
      description: 'Bedenler, Tipler ve Cinsiyetler listelerini yönetin. Sipariş ve üretimde kullanılır.',
      icon: Footprints,
      route: '/module/1/genel-corap-bilgileri',
      color: 'bg-teal-500',
      count: bedenCount + tipCount + cinsiyetCount,
    },
    {
      id: 'iplik-tanimlari',
      title: 'İplik Tanımları',
      description: 'İşlem tipleri, iplik detayları, kalınlıklar ve renkler. İplik/Numune/Ürün Reçetesi modüllerinin master data havuzu.',
      icon: CircleDot,
      route: '/module/1/iplik-tanimlari',
      color: 'bg-amber-600',
      count: islemTipleri.length + detaylar.length + kalinliklar.length + renkler.length,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Dashboard'a Dön
            </Button>
            <div className="p-2 bg-indigo-600 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Bilgi Girişi</h1>
          </div>
          <p className="text-gray-600 ml-24">
            ERP sistemi için temel veri tanımlarını yönetin. Sipariş, satınalma ve üretim modüllerinde kullanılacak master data tanımları.
          </p>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Müşteriler</p>
                  <p className="text-2xl font-bold text-blue-900">{musteriler.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Tedarikçiler</p>
                  <p className="text-2xl font-bold text-purple-900">{tedarikciler.length}</p>
                </div>
                <Truck className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">Depolar</p>
                  <p className="text-2xl font-bold text-orange-900">{depolar.length}</p>
                </div>
                <Warehouse className="w-8 h-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-pink-50 border-pink-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pink-600 font-medium">Kategoriler</p>
                  <p className="text-2xl font-bold text-pink-900">{kategoriler.length}</p>
                </div>
                <Tag className="w-8 h-8 text-pink-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-teal-50 border-teal-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-teal-600 font-medium">Çorap Bilgileri</p>
                  <p className="text-2xl font-bold text-teal-900">{items.length}</p>
                </div>
                <Settings className="w-8 h-8 text-teal-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Son Sipariş Sıra No */}
        <div className="mb-8">
          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="w-6 h-6 text-amber-600" />
                  <div>
                    <p className="text-sm text-amber-700 font-medium">Son Sipariş Sıra No ({new Date().getFullYear()})</p>
                    <p className="text-xs text-amber-500">Yeni sipariş bu numaradan sonraki ilk boş numarayı alır</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {editingSeq ? (
                    <>
                      <Input
                        type="number"
                        min={0}
                        value={tempSeq}
                        onChange={(e) => setTempSeq(e.target.value)}
                        className="w-24 h-9 text-center font-bold"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseInt(tempSeq) || 0;
                            setOrderCounter(val).then(() => { setOrderSeq(val); setEditingSeq(false); });
                          }
                          if (e.key === 'Escape') setEditingSeq(false);
                        }}
                      />
                      <Button size="sm" onClick={() => {
                        const val = parseInt(tempSeq) || 0;
                        setOrderCounter(val).then(() => { setOrderSeq(val); setEditingSeq(false); });
                      }}>Kaydet</Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingSeq(false)}>İptal</Button>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-amber-900">{String(orderSeq).padStart(4, '0')}</span>
                      <Button size="sm" variant="ghost" onClick={() => { setTempSeq(String(orderSeq)); setEditingSeq(true); }} title="Düzenle">
                        <Edit3 className="w-4 h-4 text-amber-600" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alt Modüller Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subModules.map((module) => {
            const Icon = module.icon;
            return (
              <Card 
                key={module.id}
                className="cursor-pointer hover:shadow-lg transition-shadow duration-200 group"
                onClick={() => navigate(module.route)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg ${module.color}`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    {module.count !== undefined && (
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {module.count}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl mt-4 group-hover:text-indigo-600 transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-500">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-indigo-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                    <span>Git</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Bilgi Kartı */}
        <Card className="mt-8 bg-indigo-50 border-indigo-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-indigo-900">Master Data Yönetimi</h3>
                <p className="text-sm text-indigo-700 mt-1">
                  Bu modülde tanımlanan veriler, sistemin diğer modüllerinde (Sipariş, Satınalma, Üretim) 
                  otomatik olarak kullanılır. Her tanım sayfasında Liste, Yeni Ekle, Düzenle ve Sil 
                  işlemleri yapılabilir. Silme işlemi öncesinde kullanıcı onayı alınır ve kayıt 
                  başka modüllerde kullanılıyorsa silme engellenir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
