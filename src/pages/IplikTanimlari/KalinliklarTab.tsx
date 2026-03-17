// ============================================
// KALINLIKLAR SEKMESİ - Kompakt Tablo Görünümü
// ============================================
// AKSİYON MATRİSİ (Kalınlık özel - Düzenle hiç yok):
// - Aktif: Pasif Yap (Düzenle YOK, Sil YOK)
// - Pasif + referanssız: Aktif Yap + Sil
// - Pasif + referanslı: Aktif Yap (Sil YOK)
// ============================================
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Search, Ruler } from 'lucide-react';
import { useKalinlikStore } from '@/store/kalinlikStore';
import { toast } from 'sonner';
import type { Kalinlik, KalinlikFormData, KalinlikBirim } from '@/types';

const BIRIMLER: KalinlikBirim[] = ['Ne', 'Nm', 'Dtex', 'Denye'];

export default function KalinliklarTab() {
  const { kalinliklar, addKalinlik, deleteKalinlik, pasifKalinlik, aktifKalinlik, getBirlesikGosterim } = useKalinlikStore();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasifDialogOpen, setIsPasifDialogOpen] = useState(false);
  const [isAktifDialogOpen, setIsAktifDialogOpen] = useState(false);
  const [deletingKalinlik, setDeletingKalinlik] = useState<Kalinlik | null>(null);
  const [pasifKalinlikItem, setPasifKalinlikItem] = useState<Kalinlik | null>(null);
  const [aktifKalinlikItem, setAktifKalinlikItem] = useState<Kalinlik | null>(null);
  
  // Filtre states
  const [searchTerm, setSearchTerm] = useState('');
  const [birimFilter, setBirimFilter] = useState<'all' | KalinlikBirim>('all');
  const [durumFilter, setDurumFilter] = useState<'all' | 'AKTIF' | 'PASIF'>('all');
  
  // Form state
  const [formData, setFormData] = useState<KalinlikFormData>({
    birim: 'Ne',
    deger: '',
    ozellik: '',
    durum: 'AKTIF',
  });

  const resetForm = () => {
    setFormData({
      birim: 'Ne',
      deger: '',
      ozellik: '',
      durum: 'AKTIF',
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.deger.trim()) {
      toast.error('Değer zorunludur');
      return;
    }

    const result = addKalinlik(formData);
    if (result.success) {
      toast.success('Kalınlık eklendi');
      handleCloseDialog();
    } else {
      toast.error(result.error || 'Ekleme başarısız');
    }
  };

  const handlePasifClick = (kalinlik: Kalinlik) => {
    setPasifKalinlikItem(kalinlik);
    setIsPasifDialogOpen(true);
  };

  const handleAktifClick = (kalinlik: Kalinlik) => {
    setAktifKalinlikItem(kalinlik);
    setIsAktifDialogOpen(true);
  };

  const handleDeleteClick = (kalinlik: Kalinlik) => {
    setDeletingKalinlik(kalinlik);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmPasif = () => {
    if (pasifKalinlikItem) {
      const result = pasifKalinlik(pasifKalinlikItem.id);
      if (result.success) {
        toast.success('Kalınlık pasif yapıldı');
      } else {
        toast.error(result.error || 'İşlem başarısız');
      }
      setPasifKalinlikItem(null);
      setIsPasifDialogOpen(false);
    }
  };

  const handleConfirmAktif = () => {
    if (aktifKalinlikItem) {
      const result = aktifKalinlik(aktifKalinlikItem.id);
      if (result.success) {
        toast.success('Kalınlık aktif yapıldı');
      } else {
        toast.error(result.error || 'İşlem başarısız');
      }
      setAktifKalinlikItem(null);
      setIsAktifDialogOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingKalinlik) {
      const result = deleteKalinlik(deletingKalinlik.id);
      if (result.success) {
        toast.success('Kalınlık silindi');
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
      setDeletingKalinlik(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filtrelenmiş kalınlıklar
  const filteredKalinliklar = kalinliklar.filter(k => {
    const birlesik = getBirlesikGosterim(k).toLowerCase();
    const matchesSearch = birlesik.includes(searchTerm.toLowerCase());
    const matchesBirim = birimFilter === 'all' || k.birim === birimFilter;
    const matchesDurum = durumFilter === 'all' || k.durum === durumFilter;
    return matchesSearch && matchesBirim && matchesDurum;
  });

  const getDurumBadge = (durum: 'AKTIF' | 'PASIF') => {
    if (durum === 'AKTIF') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Aktif</Badge>;
    }
    return <Badge variant="secondary">Pasif</Badge>;
  };

  // Sil butonu gösterilme şartı: Sadece pasif kayıtlarda
  const showSilButton = (kalinlik: Kalinlik) => {
    return kalinlik.durum === 'PASIF';
  };

  return (
    <div className="space-y-4">
      {/* Filtreler ve Yeni Ekle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Kalınlık ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          <Select value={birimFilter} onValueChange={(v: any) => setBirimFilter(v)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Birim" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {BIRIMLER.map(b => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={durumFilter} onValueChange={(v: any) => setDurumFilter(v)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="AKTIF">Aktif</SelectItem>
              <SelectItem value="PASIF">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Yeni Kalınlık
        </Button>
      </div>

      {/* Bilgi Notu */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
        <strong>Not:</strong> Kalınlıklarda düzenleme yapılamaz. Hatalı giriş için kaydı pasif yapıp yeni kayıt ekleyin.
      </div>

      {/* Kompakt Tablo */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Birim</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Değer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Özellik</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Birleşik</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Durum</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredKalinliklar.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Kalınlık bulunamadı.
                </td>
              </tr>
            ) : (
              filteredKalinliklar.map((kalinlik) => (
                <tr 
                  key={kalinlik.id} 
                  className={`hover:bg-gray-50 ${kalinlik.durum === 'PASIF' ? 'opacity-60 bg-gray-50' : ''}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Ruler className="w-4 h-4 text-orange-500" />
                      {kalinlik.birim}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">{kalinlik.deger}</td>
                  <td className="px-4 py-3 text-gray-600">{kalinlik.ozellik || '-'}</td>
                  <td className="px-4 py-3 font-semibold text-indigo-600">
                    {getBirlesikGosterim(kalinlik)}
                  </td>
                  <td className="px-4 py-3 text-center">{getDurumBadge(kalinlik.durum)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {kalinlik.durum === 'AKTIF' ? (
                        // AKTIF: Sadece Pasif Yap
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePasifClick(kalinlik)}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Pasif Yap"
                        >
                          Pasif Yap
                        </Button>
                      ) : (
                        // PASIF: Aktif Yap + Sil (referanssızsa)
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleAktifClick(kalinlik)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Aktif Yap"
                          >
                            Aktif Yap
                          </Button>
                          {showSilButton(kalinlik) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(kalinlik)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              title="Sil"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

        {/* Ekle Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Yeni Kalınlık
              </DialogTitle>
              <DialogDescription>
                Kalınlık bilgilerini girin. Birim+Değer+Özellik kombinasyonu benzersiz olmalıdır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="birim">Birim *</Label>
                <Select
                  value={formData.birim}
                  onValueChange={(v: KalinlikBirim) => setFormData({ ...formData, birim: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BIRIMLER.map(b => (
                      <SelectItem key={b} value={b}>{b}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deger">Değer *</Label>
                <Input
                  id="deger"
                  value={formData.deger}
                  onChange={(e) => setFormData({ ...formData, deger: e.target.value })}
                  placeholder="örn: 20/1, 150"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ozellik">Özellik (Opsiyonel)</Label>
                <Input
                  id="ozellik"
                  value={formData.ozellik}
                  onChange={(e) => setFormData({ ...formData, ozellik: e.target.value })}
                  placeholder="örn: Ocs, Bci"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                Ekle
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Pasif Yap Onay Dialog */}
        <AlertDialog open={isPasifDialogOpen} onOpenChange={setIsPasifDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kalınlığı Pasif Yap</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-gray-900">
                  {pasifKalinlikItem && getBirlesikGosterim(pasifKalinlikItem)}
                </span> kalınlığını pasif yapmak istediğinize emin misiniz?
                <br /><br />
                <span className="text-amber-600 text-sm">
                  Pasif yapılan kalınlık kullanımdan kaldırılır. Düzeltme için yeni kayıt ekleyebilirsiniz.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setPasifKalinlikItem(null)}>
                İptal
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmPasif}
                className="bg-amber-600 hover:bg-amber-700"
              >
                Evet, Pasif Yap
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Aktif Yap Onay Dialog */}
        <AlertDialog open={isAktifDialogOpen} onOpenChange={setIsAktifDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kalınlığı Aktif Yap</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-gray-900">
                  {aktifKalinlikItem && getBirlesikGosterim(aktifKalinlikItem)}
                </span> kalınlığını aktif yapmak istediğinize emin misiniz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setAktifKalinlikItem(null)}>
                İptal
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmAktif}
                className="bg-green-600 hover:bg-green-700"
              >
                Evet, Aktif Yap
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Kalıcı Silme Onay Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kalıcı Silme</AlertDialogTitle>
              <AlertDialogDescription>
                Bu kayıt kalıcı olarak silinecek. Emin misiniz?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingKalinlik(null)}>
                Vazgeç
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
  );
}
