// ============================================
// ARTİKEL TANIMLARI SAYFASI - CRUD
// ============================================
// Musteriler.tsx pattern'i kullanılarak oluşturulmuştur
// ============================================
import { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
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
import { Plus, Edit, Trash2, Search, ArrowLeft, Package, Download, MoreHorizontal } from 'lucide-react';
import { useSort, SortIcon } from '@/components/common/SortableTable';
import { useArtikelStore } from '@/store/artikelStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { Artikel, ArtikelFormData } from '@/types';

export default function ArtikelTanimlari() {
  const navigate = useNavigate();
  const { artikeller, addArtikel, updateArtikel, deleteArtikel, pasifYap, aktifYap, seedData } = useArtikelStore();

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailArtikel, setDetailArtikel] = useState<Artikel | null>(null);
  const [editingArtikel, setEditingArtikel] = useState<Artikel | null>(null);
  const [deletingArtikel, setDeletingArtikel] = useState<Artikel | null>(null);

  // Arama state
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState<ArtikelFormData>({
    numuneNo: '',
    musteriKodu: '',
    musteriArtikelNo: '',
    urunTanimi: '',
  });

  // İlk yüklemede seed et
  useEffect(() => {
    seedData();
  }, [seedData]);

  const resetForm = () => {
    setFormData({
      numuneNo: '',
      musteriKodu: '',
      musteriArtikelNo: '',
      urunTanimi: '',
    });
    setEditingArtikel(null);
  };

  const handleOpenDialog = (artikel?: Artikel) => {
    if (artikel) {
      setEditingArtikel(artikel);
      setFormData({
        numuneNo: artikel.numuneNo,
        musteriKodu: artikel.musteriKodu,
        musteriArtikelNo: artikel.musteriArtikelNo,
        urunTanimi: artikel.urunTanimi,
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
    // Validasyon: en az bir tanımlayıcı zorunlu
    if (!formData.numuneNo.trim() && (!formData.musteriKodu.trim() || !formData.musteriArtikelNo.trim())) {
      toast.error('Numune No veya Müşteri Kodu + Müşteri Artikel No girilmelidir');
      return;
    }
    if (!formData.urunTanimi.trim()) {
      toast.error('Ürün Tanımı zorunludur');
      return;
    }

    let result;
    if (editingArtikel) {
      result = updateArtikel(editingArtikel.id, formData);
      if (result.success) {
        toast.success('Artikel güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Güncelleme başarısız');
      }
    } else {
      result = addArtikel(formData);
      if (result.success) {
        toast.success('Artikel eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Ekleme başarısız');
      }
    }
  };

  const handleExcelExport = () => {
    const headers = ['Numune No', 'Müşteri Kodu', 'Müşteri Artikel No', 'Ürün Tanımı', 'Durum'];
    const rows = filteredArtikeller.map((a: Artikel) => [
      a.numuneNo || '-',
      a.musteriKodu,
      a.musteriArtikelNo,
      a.urunTanimi,
      a.durum === 'AKTIF' ? 'Aktif' : 'Pasif'
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${c}"`).join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'artikel-tanimlari.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('Artikel listesi indirildi');
  };

  const handleDeleteClick = (artikel: Artikel) => {
    setDeletingArtikel(artikel);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingArtikel) {
      const result = deleteArtikel(deletingArtikel.id);
      if (result.success) {
        toast.success('Artikel silindi');
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
      setDeletingArtikel(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Sıralama
  const { sortField, sortDir, toggleSort, sortFn } = useSort<Artikel>('musteriKodu');

  // Filtrelenmiş ve sıralanmış artikeller
  const filteredArtikeller = sortFn(
    artikeller.filter(a =>
      a.numuneNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.musteriKodu.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.musteriArtikelNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.urunTanimi.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    (a: Artikel, f: string) => (a as Record<string, any>)[f] ?? ''
  );

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
              <Package className="w-8 h-8 text-cyan-600" />
              Artikel Tanımları
            </h1>
            <p className="text-gray-600 mt-2">
              Ürün/artikel tanımlarını yönetin. Kalıcı referans veri havuzu.
            </p>
          </div>
        </div>

        {/* Artikel Listesi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Artikel Listesi
              <Badge variant="secondary" className="ml-2">
                {filteredArtikeller.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Ara (Numune No, Müşteri, Artikel No)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" onClick={handleExcelExport} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Excel
              </Button>
              <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Yeni Artikel
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('numuneNo')}>Numune No <SortIcon field="numuneNo" sortField={sortField} sortDir={sortDir} /></TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('musteriKodu')}>Müşteri Kodu <SortIcon field="musteriKodu" sortField={sortField} sortDir={sortDir} /></TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('musteriArtikelNo')}>Müşteri Artikel No <SortIcon field="musteriArtikelNo" sortField={sortField} sortDir={sortDir} /></TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('urunTanimi')}>Ürün Tanımı <SortIcon field="urunTanimi" sortField={sortField} sortDir={sortDir} /></TableHead>
                    <TableHead className="text-center">Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredArtikeller.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz artikel tanımı eklenmemiş.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArtikeller.map((artikel) => (
                      <TableRow key={artikel.id} className={`hover:bg-gray-50 ${artikel.durum === 'PASIF' ? 'opacity-60 bg-gray-50' : ''}`}>
                        <TableCell className="font-medium">
                          {artikel.numuneNo || <span className="text-gray-400">-</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {artikel.musteriKodu}
                          </Badge>
                        </TableCell>
                        <TableCell>{artikel.musteriArtikelNo}</TableCell>
                        <TableCell className="max-w-xs truncate" title={artikel.urunTanimi}>
                          {artikel.urunTanimi}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={artikel.durum === 'AKTIF' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-gray-100 text-gray-600'}>
                            {artikel.durum === 'AKTIF' ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setDetailArtikel(artikel); setIsDetailOpen(true); }} title="Bilgiler"><MoreHorizontal className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(artikel)} title="Düzenle">
                              <Edit className="w-4 h-4" />
                            </Button>
                            {artikel.durum === 'AKTIF' ? (
                              <Button variant="ghost" size="sm" onClick={() => { const r = pasifYap(artikel.id); if (r.success) toast.success('Pasif yapıldı'); else toast.error(r.error); }} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">Pasif Yap</Button>
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => { const r = aktifYap(artikel.id); if (r.success) toast.success('Aktif yapıldı'); else toast.error(r.error); }} className="text-green-600 hover:text-green-700 hover:bg-green-50">Aktif Yap</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(artikel)} className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Sil"><Trash2 className="w-4 h-4" /></Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Ekle/Düzenle Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingArtikel ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingArtikel ? 'Artikel Düzenle' : 'Yeni Artikel Ekle'}
              </DialogTitle>
              <DialogDescription>
                Artikel bilgilerini doldurun. Numune No veya Müşteri Kodu + Müşteri Artikel No benzersiz olmalıdır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Artikel Bilgileri</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numuneNo">Numune No</Label>
                    <Input
                      id="numuneNo"
                      value={formData.numuneNo}
                      onChange={(e) => setFormData({ ...formData, numuneNo: e.target.value })}
                      placeholder="örn: 1A6A0"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="musteriKodu">Müşteri Kodu *</Label>
                    <Input
                      id="musteriKodu"
                      value={formData.musteriKodu}
                      onChange={(e) => setFormData({ ...formData, musteriKodu: e.target.value })}
                      placeholder="örn: 39"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="musteriArtikelNo">Müşteri Artikel No *</Label>
                    <Input
                      id="musteriArtikelNo"
                      value={formData.musteriArtikelNo}
                      onChange={(e) => setFormData({ ...formData, musteriArtikelNo: e.target.value })}
                      placeholder="örn: ART-2024-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urunTanimi">Ürün Tanımı *</Label>
                    <Input
                      id="urunTanimi"
                      value={formData.urunTanimi}
                      onChange={(e) => setFormData({ ...formData, urunTanimi: e.target.value })}
                      placeholder="örn: Erkek Pamuk Çorap 40-44"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  * Numune No girilmezse Müşteri Kodu ve Müşteri Artikel No zorunludur.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                {editingArtikel ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Artikel Silme</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-gray-900">{deletingArtikel?.urunTanimi}</span> artikelini silmek istediğinize emin misiniz?
                <br /><br />
                <span className="text-red-600 text-sm">
                  Bu işlem geri alınamaz.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingArtikel(null)}>
                İptal
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Evet, Sil
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Artikel Bilgi Kartı Dialog */}
        <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Artikel Kartı
              </DialogTitle>
            </DialogHeader>
            {detailArtikel && (
              <div className="space-y-3 py-2 text-sm">
                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                  <span className="text-gray-500">Numune No:</span><span className="font-medium">{detailArtikel.numuneNo || '-'}</span>
                  <span className="text-gray-500">Müşteri Kodu:</span><span className="font-medium">{detailArtikel.musteriKodu}</span>
                  <span className="text-gray-500">Müşteri Artikel No:</span><span className="font-medium">{detailArtikel.musteriArtikelNo}</span>
                  <span className="text-gray-500">Ürün Tanımı:</span><span className="font-medium">{detailArtikel.urunTanimi}</span>
                  <span className="text-gray-500">Durum:</span><span>{detailArtikel.durum === 'AKTIF' ? 'Aktif' : 'Pasif'}</span>
                  <span className="text-gray-500">Kaynak:</span><span>{detailArtikel.kaynak === 'manuel' ? 'Manuel' : 'Numune'}</span>
                  <span className="text-gray-500">Oluşturma Tarihi:</span><span>{new Date(detailArtikel.olusturmaTarihi).toLocaleDateString('tr-TR')}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Kapat</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
