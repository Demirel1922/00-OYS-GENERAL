// ============================================
// İŞLEM TİPLERİ SEKMESİ - Kompakt Tablo Görünümü
// ============================================
// AKSİYON MATRİSİ:
// - Aktif: Düzenle + Pasif Yap (Sil YOK)
// - Pasif + referanssız: Düzenle + Aktif Yap + Sil
// - Pasif + referanslı: Düzenle + Aktif Yap (Sil YOK)
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
import { Plus, Edit, Trash2, Search, ArrowDown, ArrowUp } from 'lucide-react';
import { useIslemTipiStore } from '@/store/islemTipiStore';
import { toast } from 'sonner';
import { toTitleCaseTR } from '@/utils/titleCase';
import type { IslemTipi, IslemTipiFormData, HareketYonu } from '@/types';

export default function IslemTipleriTab() {
  const { islemTipleri, addIslemTipi, updateIslemTipi, deleteIslemTipi, pasifYap, aktifYap } = useIslemTipiStore();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasifDialogOpen, setIsPasifDialogOpen] = useState(false);
  const [isAktifDialogOpen, setIsAktifDialogOpen] = useState(false);
  const [editingIslem, setEditingIslem] = useState<IslemTipi | null>(null);
  const [deletingIslem, setDeletingIslem] = useState<IslemTipi | null>(null);
  const [pasifIslem, setPasifIslem] = useState<IslemTipi | null>(null);
  const [aktifIslem, setAktifIslem] = useState<IslemTipi | null>(null);
  
  // Filtre states
  const [searchTerm, setSearchTerm] = useState('');
  const [yönFilter, setYönFilter] = useState<'all' | 'GIRIS' | 'CIKIS'>('all');
  const [durumFilter, setDurumFilter] = useState<'all' | 'AKTIF' | 'PASIF'>('all');
  
  // Form state
  const [formData, setFormData] = useState<IslemTipiFormData>({
    islemAdi: '',
    hareketYonu: 'GIRIS',
    aciklama: '',
    durum: 'AKTIF',
  });

  const resetForm = () => {
    setFormData({
      islemAdi: '',
      hareketYonu: 'GIRIS',
      aciklama: '',
      durum: 'AKTIF',
    });
    setEditingIslem(null);
  };

  const handleOpenDialog = (islem?: IslemTipi) => {
    if (islem) {
      setEditingIslem(islem);
      setFormData({
        islemAdi: islem.islemAdi,
        hareketYonu: islem.hareketYonu,
        aciklama: islem.aciklama || '',
        durum: islem.durum,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSubmit = () => {
    if (!formData.islemAdi.trim()) {
      toast.error('İşlem Adı zorunludur');
      return;
    }

    let result;
    if (editingIslem) {
      result = updateIslemTipi(editingIslem.id, formData);
      if (result.success) {
        toast.success('İşlem tipi güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Güncelleme başarısız');
      }
    } else {
      result = addIslemTipi(formData);
      if (result.success) {
        toast.success('İşlem tipi eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Ekleme başarısız');
      }
    }
  };

  const handlePasifClick = (islem: IslemTipi) => {
    setPasifIslem(islem);
    setIsPasifDialogOpen(true);
  };

  const handleAktifClick = (islem: IslemTipi) => {
    setAktifIslem(islem);
    setIsAktifDialogOpen(true);
  };

  const handleDeleteClick = (islem: IslemTipi) => {
    setDeletingIslem(islem);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmPasif = () => {
    if (pasifIslem) {
      const result = pasifYap(pasifIslem.id);
      if (result.success) {
        toast.success('İşlem tipi pasif yapıldı');
      } else {
        toast.error(result.error || 'İşlem başarısız');
      }
      setPasifIslem(null);
      setIsPasifDialogOpen(false);
    }
  };

  const handleConfirmAktif = () => {
    if (aktifIslem) {
      const result = aktifYap(aktifIslem.id);
      if (result.success) {
        toast.success('İşlem tipi aktif yapıldı');
      } else {
        toast.error(result.error || 'İşlem başarısız');
      }
      setAktifIslem(null);
      setIsAktifDialogOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingIslem) {
      const result = deleteIslemTipi(deletingIslem.id);
      if (result.success) {
        toast.success('İşlem tipi silindi');
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
      setDeletingIslem(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filtrelenmiş işlem tipleri
  const filteredIslemTipleri = islemTipleri.filter(i => {
    const matchesSearch = i.islemAdi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYön = yönFilter === 'all' || i.hareketYonu === yönFilter;
    const matchesDurum = durumFilter === 'all' || i.durum === durumFilter;
    return matchesSearch && matchesYön && matchesDurum;
  });

  const getYönBadge = (yon: HareketYonu) => {
    if (yon === 'GIRIS') {
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1 w-fit">
          <ArrowDown className="w-3 h-3" />
          Giriş
        </Badge>
      );
    }
    return (
      <Badge className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1 w-fit">
        <ArrowUp className="w-3 h-3" />
        Çıkış
      </Badge>
    );
  };

  const getDurumBadge = (durum: 'AKTIF' | 'PASIF') => {
    if (durum === 'AKTIF') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Aktif</Badge>;
    }
    return <Badge variant="secondary">Pasif</Badge>;
  };

  // Sil butonu gösterilme şartı: Sadece pasif kayıtlarda
  const showSilButton = (islem: IslemTipi) => {
    return islem.durum === 'PASIF';
  };

  return (
    <div className="space-y-4">
      {/* Filtreler ve Yeni Ekle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="İşlem adı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          <Select value={yönFilter} onValueChange={(v: any) => setYönFilter(v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Hareket Yönü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="GIRIS">Giriş</SelectItem>
              <SelectItem value="CIKIS">Çıkış</SelectItem>
            </SelectContent>
          </Select>
          <Select value={durumFilter} onValueChange={(v: any) => setDurumFilter(v)}>
            <SelectTrigger className="w-36">
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
          Yeni İşlem Tipi
        </Button>
      </div>

      {/* Kompakt Tablo */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">İşlem Adı</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Hareket Yönü</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Açıklama</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Durum</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredIslemTipleri.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  İşlem tipi bulunamadı.
                </td>
              </tr>
            ) : (
              filteredIslemTipleri.map((islem) => (
                <tr 
                  key={islem.id} 
                  className={`hover:bg-gray-50 ${islem.durum === 'PASIF' ? 'opacity-60 bg-gray-50' : ''}`}
                >
                  <td className="px-4 py-3 font-medium">{islem.islemAdi}</td>
                  <td className="px-4 py-3">{getYönBadge(islem.hareketYonu)}</td>
                  <td className="px-4 py-3 text-gray-600">{islem.aciklama || '-'}</td>
                  <td className="px-4 py-3 text-center">{getDurumBadge(islem.durum)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenDialog(islem)} 
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {islem.durum === 'AKTIF' ? (
                        // AKTIF: Düzenle + Pasif Yap (Sil YOK)
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePasifClick(islem)}
                          className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                          title="Pasif Yap"
                        >
                          Pasif Yap
                        </Button>
                      ) : (
                        // PASIF: Düzenle + Aktif Yap + Sil (referanssızsa)
                        <>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleAktifClick(islem)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Aktif Yap"
                          >
                            Aktif Yap
                          </Button>
                          {showSilButton(islem) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(islem)}
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

      {/* Ekle/Düzenle Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {editingIslem ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingIslem ? 'İşlem Tipi Düzenle' : 'Yeni İşlem Tipi'}
            </DialogTitle>
            <DialogDescription>
              İşlem tipi bilgilerini girin. İşlem adı benzersiz olmalıdır.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="islemAdi">İşlem Adı *</Label>
              <Input
                id="islemAdi"
                value={formData.islemAdi}
                onChange={(e) => setFormData({ ...formData, islemAdi: e.target.value })}
                onBlur={() => setFormData(f => ({ ...f, islemAdi: toTitleCaseTR(f.islemAdi) }))}
                placeholder="örn: İplik Alımı"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hareketYonu">Hareket Yönü *</Label>
              <Select
                value={formData.hareketYonu}
                onValueChange={(v: HareketYonu) => setFormData({ ...formData, hareketYonu: v })}
                disabled={!!editingIslem}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GIRIS">Giriş</SelectItem>
                  <SelectItem value="CIKIS">Çıkış</SelectItem>
                </SelectContent>
              </Select>
              {editingIslem && (
                <p className="text-xs text-amber-600">
                  * Kullanımdaki işlem tipinde hareket yönü değiştirilemez
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="aciklama">Açıklama</Label>
              <Input
                id="aciklama"
                value={formData.aciklama}
                onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                placeholder="İsteğe bağlı açıklama..."
              />
            </div>
            {editingIslem && (
              <div className="space-y-2">
                <Label htmlFor="durum">Durum</Label>
                <Select
                  value={formData.durum}
                  onValueChange={(v: 'AKTIF' | 'PASIF') => setFormData({ ...formData, durum: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="PASIF">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              İptal
            </Button>
            <Button onClick={handleSubmit}>
              {editingIslem ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pasif Yap Onay Dialog */}
      <AlertDialog open={isPasifDialogOpen} onOpenChange={setIsPasifDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pasif Yap</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-gray-900">{pasifIslem?.islemAdi}</span> işlem tipini pasif yapmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPasifIslem(null)}>
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
            <AlertDialogTitle>Aktif Yap</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-gray-900">{aktifIslem?.islemAdi}</span> işlem tipini aktif yapmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAktifIslem(null)}>
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
            <AlertDialogCancel onClick={() => setDeletingIslem(null)}>
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
