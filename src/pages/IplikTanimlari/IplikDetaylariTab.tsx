// ============================================
// İPLİK DETAYLARI SEKMESİ - Kompakt Tablo Görünümü
// ============================================
// Kategori > Cins > Detay hiyerarşisi
// AKSİYON MATRİSİ (Detay için):
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
  DialogFooter
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
import { useIplikDetayStore } from '@/store/iplikDetayStore';
import { toast } from 'sonner';
import { toTitleCaseTR } from '@/utils/titleCase';

export default function IplikDetaylariTab() {
  const { 
    kategoriler, 
    cinsler, 
    detaylar, 
    addKategori, 
    addCins, 
    addDetay,
    updateKategori,
    updateCins,
    updateDetay,
    deleteKategori,
    deleteCins,
    deleteDetay,
    pasifKategori,
    pasifCins,
    pasifDetay,
    aktifKategori,
    aktifCins,
    aktifDetay,

  } = useIplikDetayStore();
  
  // Dialog states
  const [activeDialog, setActiveDialog] = useState<'none' | 'kategori' | 'cins' | 'detay'>('none');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPasifDialogOpen, setIsPasifDialogOpen] = useState(false);
  const [isAktifDialogOpen, setIsAktifDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{type: 'kategori' | 'cins' | 'detay', item: any} | null>(null);
  const [deletingItem, setDeletingItem] = useState<{type: 'kategori' | 'cins' | 'detay', item: any} | null>(null);
  const [pasifItem, setPasifItem] = useState<{type: 'kategori' | 'cins' | 'detay', item: any} | null>(null);
  const [aktifItem, setAktifItem] = useState<{type: 'kategori' | 'cins' | 'detay', item: any} | null>(null);
  
  // Filtre states
  const [searchTerm, setSearchTerm] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('all');
  const [durumFilter, setDurumFilter] = useState<'all' | 'AKTIF' | 'PASIF'>('all');
  
  // Form states
  const [kategoriForm, setKategoriForm] = useState<{ kategoriAdi: string; durum: 'AKTIF' | 'PASIF' }>({ kategoriAdi: '', durum: 'AKTIF' });
  const [cinsForm, setCinsForm] = useState<{ kategoriId: string; cinsAdi: string; durum: 'AKTIF' | 'PASIF' }>({ kategoriId: '', cinsAdi: '', durum: 'AKTIF' });
  const [detayForm, setDetayForm] = useState<{ cinsId: string; detayAdi: string; durum: 'AKTIF' | 'PASIF' }>({ cinsId: '', detayAdi: '', durum: 'AKTIF' });

  const resetForms = () => {
    setKategoriForm({ kategoriAdi: '', durum: 'AKTIF' });
    setCinsForm({ kategoriId: '', cinsAdi: '', durum: 'AKTIF' });
    setDetayForm({ cinsId: '', detayAdi: '', durum: 'AKTIF' });
    setEditingItem(null);
  };

  const handleOpenDialog = (type: 'kategori' | 'cins' | 'detay', item?: any, itemType?: 'kategori' | 'cins' | 'detay') => {
    resetForms();
    if (item) {
      setEditingItem({ type: itemType || type, item });
      if (itemType === 'kategori' || type === 'kategori') {
        setKategoriForm({ kategoriAdi: item.kategoriAdi, durum: item.durum });
      } else if (itemType === 'cins' || type === 'cins') {
        setCinsForm({ kategoriId: item.kategoriId, cinsAdi: item.cinsAdi, durum: item.durum });
      } else {
        setDetayForm({ cinsId: item.cinsId, detayAdi: item.detayAdi, durum: item.durum });
      }
    }
    setActiveDialog(type);
  };

  const handleCloseDialog = () => {
    setActiveDialog('none');
    resetForms();
  };

  // Kategori işlemleri
  const handleKategoriSubmit = () => {
    if (!kategoriForm.kategoriAdi.trim()) {
      toast.error('Kategori adı zorunludur');
      return;
    }
    
    let result;
    if (editingItem?.type === 'kategori') {
      result = updateKategori(editingItem.item.id, kategoriForm);
      if (result.success) {
        toast.success('Kategori güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error);
      }
    } else {
      result = addKategori(kategoriForm);
      if (result.success) {
        toast.success('Kategori eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error);
      }
    }
  };

  // Cins işlemleri
  const handleCinsSubmit = () => {
    if (!cinsForm.cinsAdi.trim() || !cinsForm.kategoriId) {
      toast.error('Cins adı ve kategori zorunludur');
      return;
    }
    
    let result;
    if (editingItem?.type === 'cins') {
      result = updateCins(editingItem.item.id, cinsForm);
      if (result.success) {
        toast.success('Cins güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error);
      }
    } else {
      result = addCins(cinsForm);
      if (result.success) {
        toast.success('Cins eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error);
      }
    }
  };

  // Detay işlemleri
  const handleDetaySubmit = () => {
    if (!detayForm.detayAdi.trim() || !detayForm.cinsId) {
      toast.error('Detay adı ve cins zorunludur');
      return;
    }
    
    let result;
    if (editingItem?.type === 'detay') {
      result = updateDetay(editingItem.item.id, detayForm);
      if (result.success) {
        toast.success('Detay güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error);
      }
    } else {
      result = addDetay(detayForm);
      if (result.success) {
        toast.success('Detay eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error);
      }
    }
  };

  const handlePasifClick = (type: 'kategori' | 'cins' | 'detay', item: any) => {
    setPasifItem({ type, item });
    setIsPasifDialogOpen(true);
  };

  const handleAktifClick = (type: 'kategori' | 'cins' | 'detay', item: any) => {
    setAktifItem({ type, item });
    setIsAktifDialogOpen(true);
  };

  const handleDeleteClick = (type: 'kategori' | 'cins' | 'detay', item: any) => {
    setDeletingItem({ type, item });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmPasif = () => {
    if (!pasifItem) return;
    
    let result;
    if (pasifItem.type === 'kategori') {
      result = pasifKategori(pasifItem.item.id);
    } else if (pasifItem.type === 'cins') {
      result = pasifCins(pasifItem.item.id);
    } else {
      result = pasifDetay(pasifItem.item.id);
    }
    
    if (result.success) {
      toast.success(`${pasifItem.type === 'kategori' ? 'Kategori' : pasifItem.type === 'cins' ? 'Cins' : 'Detay'} pasif yapıldı`);
    } else {
      toast.error(result.error);
    }
    
    setPasifItem(null);
    setIsPasifDialogOpen(false);
  };

  const handleConfirmAktif = () => {
    if (!aktifItem) return;
    
    let result;
    if (aktifItem.type === 'kategori') {
      result = aktifKategori(aktifItem.item.id);
    } else if (aktifItem.type === 'cins') {
      result = aktifCins(aktifItem.item.id);
    } else {
      result = aktifDetay(aktifItem.item.id);
    }
    
    if (result.success) {
      toast.success(`${aktifItem.type === 'kategori' ? 'Kategori' : aktifItem.type === 'cins' ? 'Cins' : 'Detay'} aktif yapıldı`);
    } else {
      toast.error(result.error);
    }
    
    setAktifItem(null);
    setIsAktifDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingItem) return;
    
    let result;
    if (deletingItem.type === 'kategori') {
      result = deleteKategori(deletingItem.item.id);
    } else if (deletingItem.type === 'cins') {
      result = deleteCins(deletingItem.item.id);
    } else {
      result = deleteDetay(deletingItem.item.id);
    }
    
    if (result.success) {
      toast.success(`${deletingItem.type === 'kategori' ? 'Kategori' : deletingItem.type === 'cins' ? 'Cins' : 'Detay'} silindi`);
    } else {
      toast.error(result.error);
    }
    
    setDeletingItem(null);
    setIsDeleteDialogOpen(false);
  };

  // Filtrelenmiş detaylar
  const filteredDetaylar = detaylar.filter(d => {
    const cins = cinsler.find(c => c.id === d.cinsId);
    const kategori = cins ? kategoriler.find(k => k.id === cins.kategoriId) : null;
    
    const matchesSearch = d.detayAdi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKategori = kategoriFilter === 'all' || kategori?.id === kategoriFilter;
    const matchesDurum = durumFilter === 'all' || d.durum === durumFilter;
    
    return matchesSearch && matchesKategori && matchesDurum;
  });

  const getKategoriById = (id: string) => kategoriler.find(k => k.id === id);
  const getCinsById = (id: string) => cinsler.find(c => c.id === id);

  const getDurumBadge = (durum: 'AKTIF' | 'PASIF') => {
    if (durum === 'AKTIF') {
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Aktif</Badge>;
    }
    return <Badge variant="secondary">Pasif</Badge>;
  };

  const getItemName = (type: string, item: any) => {
    if (type === 'kategori') return item.kategoriAdi;
    if (type === 'cins') return item.cinsAdi;
    return item.detayAdi;
  };

  // Sil butonu gösterilme şartı: Sadece pasif kayıtlarda
  const showSilButton = (detay: any) => {
    return detay.durum === 'PASIF';
  };

  return (
    <div className="space-y-4">
      {/* Filtreler ve Butonlar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Detay ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Kategori filtresi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {kategoriler.filter(k => k.durum === 'AKTIF').map(k => (
                <SelectItem key={k.id} value={k.id}>{k.kategoriAdi}</SelectItem>
              ))}
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleOpenDialog('kategori')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Kategori
          </Button>
          <Button variant="outline" onClick={() => handleOpenDialog('cins')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Cins
          </Button>
          <Button onClick={() => handleOpenDialog('detay')} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Detay
          </Button>
        </div>
      </div>

      {/* Kompakt Tablo */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Kategori</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Cins</th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">Detay</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">Durum</th>
              <th className="px-4 py-3 text-center font-medium text-gray-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredDetaylar.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  İplik detayı bulunamadı.
                </td>
              </tr>
            ) : (
              filteredDetaylar.map((detay) => {
                const cins = getCinsById(detay.cinsId);
                const kategori = cins ? getKategoriById(cins.kategoriId) : null;
                
                return (
                  <tr 
                    key={detay.id} 
                    className={`hover:bg-gray-50 ${detay.durum === 'PASIF' ? 'opacity-60 bg-gray-50' : ''}`}
                  >
                    <td className="px-4 py-3">{kategori?.kategoriAdi || '-'}</td>
                    <td className="px-4 py-3">{cins?.cinsAdi || '-'}</td>
                    <td className="px-4 py-3 font-medium">{detay.detayAdi}</td>
                    <td className="px-4 py-3 text-center">{getDurumBadge(detay.durum)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleOpenDialog('detay', detay, 'detay')} 
                          title="Düzenle"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {detay.durum === 'AKTIF' ? (
                          // AKTIF: Düzenle + Pasif Yap (Sil YOK)
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handlePasifClick('detay', detay)}
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
                              onClick={() => handleAktifClick('detay', detay)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              title="Aktif Yap"
                            >
                              Aktif Yap
                            </Button>
                            {showSilButton(detay) && (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteClick('detay', detay)}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Kategori Ekle/Düzenle Dialog */}
      <Dialog open={activeDialog === 'kategori'} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.type === 'kategori' ? 'Kategori Düzenle' : 'Yeni Kategori'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kategori Adı *</Label>
              <Input
                value={kategoriForm.kategoriAdi}
                onChange={(e) => setKategoriForm({ ...kategoriForm, kategoriAdi: e.target.value })}
                placeholder="örn: Doğal Elyaf"
              />
            </div>
            {editingItem?.type === 'kategori' && (
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select 
                  value={kategoriForm.durum} 
                  onValueChange={(v: 'AKTIF' | 'PASIF') => setKategoriForm({ ...kategoriForm, durum: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="PASIF">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleKategoriSubmit}>{editingItem ? 'Güncelle' : 'Ekle'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cins Ekle/Düzenle Dialog */}
      <Dialog open={activeDialog === 'cins'} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.type === 'cins' ? 'Cins Düzenle' : 'Yeni Cins'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingItem && (
              <div className="space-y-2">
                <Label>Kategori *</Label>
                <Select 
                  value={cinsForm.kategoriId} 
                  onValueChange={(v) => setCinsForm({ ...cinsForm, kategoriId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Kategori seçin" /></SelectTrigger>
                  <SelectContent>
                    {kategoriler.filter(k => k.durum === 'AKTIF').map(k => (
                      <SelectItem key={k.id} value={k.id}>{k.kategoriAdi}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Cins Adı *</Label>
              <Input
                value={cinsForm.cinsAdi}
                onChange={(e) => setCinsForm({ ...cinsForm, cinsAdi: e.target.value })}
                placeholder="örn: Pamuk"
              />
            </div>
            {editingItem?.type === 'cins' && (
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select 
                  value={cinsForm.durum} 
                  onValueChange={(v: 'AKTIF' | 'PASIF') => setCinsForm({ ...cinsForm, durum: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="PASIF">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleCinsSubmit}>{editingItem ? 'Güncelle' : 'Ekle'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detay Ekle/Düzenle Dialog */}
      <Dialog open={activeDialog === 'detay'} onOpenChange={() => handleCloseDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem?.type === 'detay' ? 'Detay Düzenle' : 'Yeni Detay'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!editingItem && (
              <div className="space-y-2">
                <Label>Cins *</Label>
                <Select 
                  value={detayForm.cinsId} 
                  onValueChange={(v) => setDetayForm({ ...detayForm, cinsId: v })}
                >
                  <SelectTrigger><SelectValue placeholder="Cins seçin" /></SelectTrigger>
                  <SelectContent>
                    {cinsler.filter(c => c.durum === 'AKTIF').map(c => {
                      const kategori = getKategoriById(c.kategoriId);
                      return (
                        <SelectItem key={c.id} value={c.id}>
                          {kategori?.kategoriAdi} → {c.cinsAdi}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Detay Adı *</Label>
              <Input
                value={detayForm.detayAdi}
                onChange={(e) => setDetayForm({ ...detayForm, detayAdi: e.target.value })}
                onBlur={() => setDetayForm(f => ({ ...f, detayAdi: toTitleCaseTR(f.detayAdi) }))}
                placeholder="örn: Karde"
              />
            </div>
            {editingItem?.type === 'detay' && (
              <div className="space-y-2">
                <Label>Durum</Label>
                <Select 
                  value={detayForm.durum} 
                  onValueChange={(v: 'AKTIF' | 'PASIF') => setDetayForm({ ...detayForm, durum: v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AKTIF">Aktif</SelectItem>
                    <SelectItem value="PASIF">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>İptal</Button>
            <Button onClick={handleDetaySubmit}>{editingItem ? 'Güncelle' : 'Ekle'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pasif Yap Onay Dialog */}
      <AlertDialog open={isPasifDialogOpen} onOpenChange={setIsPasifDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Pasif Yap</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-semibold text-gray-900">
                {pasifItem && getItemName(pasifItem.type, pasifItem.item)}
              </span>
              {' '}{pasifItem?.type === 'kategori' ? 'kategorisini' : pasifItem?.type === 'cins' ? 'cinsini' : 'detayını'} pasif yapmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPasifItem(null)}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPasif} className="bg-amber-600 hover:bg-amber-700">
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
              <span className="font-semibold text-gray-900">
                {aktifItem && getItemName(aktifItem.type, aktifItem.item)}
              </span>
              {' '}{aktifItem?.type === 'kategori' ? 'kategorisini' : aktifItem?.type === 'cins' ? 'cinsini' : 'detayını'} aktif yapmak istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAktifItem(null)}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAktif} className="bg-green-600 hover:bg-green-700">
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
            <AlertDialogCancel onClick={() => setDeletingItem(null)}>Vazgeç</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
