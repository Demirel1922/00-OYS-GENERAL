// ============================================
// RENKLER SEKMESİ - Kompakt Tablo Görünümü
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
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { useRenkStore } from '@/store/renkStore';
import { toast } from 'sonner';
import { toTitleCaseTR } from '@/utils/titleCase';
import type { Renk, RenkFormData } from '@/types';

export default function RenklerTab() {
  const { renkler, addRenk, updateRenk, deleteRenk, pasifRenk, aktifRenk } = useRenkStore();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasifDialogOpen, setIsPasifDialogOpen] = useState(false);
  const [isAktifDialogOpen, setIsAktifDialogOpen] = useState(false);
  const [editingRenk, setEditingRenk] = useState<Renk | null>(null);
  const [deletingRenk, setDeletingRenk] = useState<Renk | null>(null);
  const [pasifRenkItem, setPasifRenkItem] = useState<Renk | null>(null);
  const [aktifRenkItem, setAktifRenkItem] = useState<Renk | null>(null);
  
  // Filtre states
  const [searchTerm, setSearchTerm] = useState('');
  const [durumFilter, setDurumFilter] = useState<'all' | 'AKTIF' | 'PASIF'>('all');
  
  // Form state
  const [formData, setFormData] = useState<RenkFormData>({
    renkAdi: '',
    durum: 'AKTIF',
  });

  const resetForm = () => {
    setFormData({
      renkAdi: '',
      durum: 'AKTIF',
    });
    setEditingRenk(null);
  };

  const handleOpenDialog = (renk?: Renk) => {
    if (renk) {
      setEditingRenk(renk);
      setFormData({
        renkAdi: renk.renkAdi,
        durum: renk.durum,
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
    if (!formData.renkAdi.trim()) {
      toast.error('Renk adı zorunludur');
      return;
    }

    let result;
    if (editingRenk) {
      result = updateRenk(editingRenk.id, formData);
      if (result.success) {
        toast.success('Renk güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Güncelleme başarısız');
      }
    } else {
      result = addRenk(formData);
      if (result.success) {
        toast.success('Renk eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Ekleme başarısız');
      }
    }
  };

  const handlePasifClick = (renk: Renk) => {
    setPasifRenkItem(renk);
    setIsPasifDialogOpen(true);
  };

  const handleAktifClick = (renk: Renk) => {
    setAktifRenkItem(renk);
    setIsAktifDialogOpen(true);
  };

  const handleDeleteClick = (renk: Renk) => {
    setDeletingRenk(renk);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmPasif = () => {
    if (pasifRenkItem) {
      const result = pasifRenk(pasifRenkItem.id);
      if (result.success) {
        toast.success('Renk pasif yapıldı');
      } else {
        toast.error(result.error || 'İşlem başarısız');
      }
      setPasifRenkItem(null);
      setIsPasifDialogOpen(false);
    }
  };

  const handleConfirmAktif = () => {
    if (aktifRenkItem) {
      const result = aktifRenk(aktifRenkItem.id);
      if (result.success) {
        toast.success('Renk aktif yapıldı');
      } else {
        toast.error(result.error || 'İşlem başarısız');
      }
      setAktifRenkItem(null);
      setIsAktifDialogOpen(false);
    }
  };

  const handleConfirmDelete = () => {
    if (deletingRenk) {
      const result = deleteRenk(deletingRenk.id);
      if (result.success) {
        toast.success('Renk silindi');
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
      setDeletingRenk(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filtrelenmiş renkler
  const filteredRenkler = renkler.filter(r => {
    const matchesSearch = r.renkAdi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDurum = durumFilter === 'all' || r.durum === durumFilter;
    return matchesSearch && matchesDurum;
  });

  const getDurumBadge = (durum: 'AKTIF' | 'PASIF') => {
    if (durum === 'AKTIF') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Aktif</Badge>;
    }
    return <Badge variant="secondary">Pasif</Badge>;
  };

  // Sil butonu gösterilme şartı: Sadece pasif kayıtlarda
  const showSilButton = (renk: Renk) => {
    return renk.durum === 'PASIF';
  };

  return (
    <div className="space-y-4">
      {/* Filtreler ve Yeni Ekle */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Renk ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
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
          Yeni Renk
        </Button>
      </div>

      {/* Kompakt Tablo - Sadece metin, swatch yok */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Renk Adı</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Durum</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRenkler.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  Renk bulunamadı.
                </td>
              </tr>
            ) : (
              filteredRenkler.map((renk) => (
                <tr 
                  key={renk.id} 
                  className={`hover:bg-gray-50 ${renk.durum === 'PASIF' ? 'opacity-60 bg-gray-50' : ''}`}
                >
                  <td className="px-4 py-3 font-medium">{renk.renkAdi}</td>
                  <td className="px-4 py-3 text-center">{getDurumBadge(renk.durum)}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleOpenDialog(renk)} 
                        title="Düzenle"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      {renk.durum === 'AKTIF' ? (
                        // AKTIF: Düzenle + Pasif Yap (Sil YOK)
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePasifClick(renk)}
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
                            onClick={() => handleAktifClick(renk)}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            title="Aktif Yap"
                          >
                            Aktif Yap
                          </Button>
                          {showSilButton(renk) && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteClick(renk)}
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
              {editingRenk ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {editingRenk ? 'Renk Düzenle' : 'Yeni Renk'}
            </DialogTitle>
            <DialogDescription>
              Renk adını girin. Renk adı benzersiz olmalıdır.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="renkAdi">Renk Adı *</Label>
              <Input
                id="renkAdi"
                value={formData.renkAdi}
                onChange={(e) => setFormData({ ...formData, renkAdi: e.target.value })}
                onBlur={() => setFormData(f => ({ ...f, renkAdi: toTitleCaseTR(f.renkAdi) }))}
                placeholder="örn: Koyu Mavi"
              />
            </div>
            {editingRenk && (
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
              {editingRenk ? 'Güncelle' : 'Ekle'}
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
              <span className="font-semibold text-gray-900">{pasifRenkItem?.renkAdi}</span> rengini pasif yapmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPasifRenkItem(null)}>
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
              <span className="font-semibold text-gray-900">{aktifRenkItem?.renkAdi}</span> rengini aktif yapmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAktifRenkItem(null)}>
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
            <AlertDialogCancel onClick={() => setDeletingRenk(null)}>
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
