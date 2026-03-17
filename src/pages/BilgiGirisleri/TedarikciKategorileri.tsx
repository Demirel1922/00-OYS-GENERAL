// ============================================
// TEDARİKÇİ KATEGORİLERİ SAYFASI - CRUD
// ============================================
// Uygulama ilk açılışında varsayılan kategoriler otomatik yüklenir
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
import { Plus, Edit, Trash2, Search, Tag, ArrowLeft, FolderOpen } from 'lucide-react';
import { useTedarikciKategoriStore } from '@/store/tedarikciKategoriStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import type { TedarikciKategorisi, TedarikciKategorisiFormData } from '@/types';

export default function TedarikciKategorileri() {
  const navigate = useNavigate();
  const { kategoriler, addKategori, updateKategori, deleteKategori, pasifYap, aktifYap, seedData } = useTedarikciKategoriStore();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingKategori, setEditingKategori] = useState<TedarikciKategorisi | null>(null);
  const [deletingKategori, setDeletingKategori] = useState<TedarikciKategorisi | null>(null);
  
  // Arama state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<TedarikciKategorisiFormData>({
    kategoriKodu: '',
    kategoriAdi: '',
    aciklama: '',
  });

  // İlk yüklemede varsayılan kategorileri yükle
  useEffect(() => {
    if (kategoriler.length === 0) {
      seedData();
    }
  }, [kategoriler.length, seedData]);

  const resetForm = () => {
    setFormData({
      kategoriKodu: '',
      kategoriAdi: '',
      aciklama: '',
    });
    setEditingKategori(null);
  };

  const handleOpenDialog = (kategori?: TedarikciKategorisi) => {
    if (kategori) {
      setEditingKategori(kategori);
      setFormData({
        kategoriKodu: kategori.kategoriKodu || '',
        kategoriAdi: kategori.kategoriAdi,
        aciklama: kategori.aciklama || '',
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
    // Validasyon
    if (!formData.kategoriAdi.trim()) {
      toast.error('Kategori Adı zorunludur');
      return;
    }

    let result;
    if (editingKategori) {
      result = updateKategori(editingKategori.id, formData);
      if (result.success) {
        toast.success('Kategori güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Güncelleme başarısız');
      }
    } else {
      result = addKategori(formData);
      if (result.success) {
        toast.success('Kategori eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Ekleme başarısız');
      }
    }
  };

  const handleDeleteClick = (kategori: TedarikciKategorisi) => {
    setDeletingKategori(kategori);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingKategori) {
      const result = deleteKategori(deletingKategori.id);
      if (result.success) {
        toast.success('Kategori silindi');
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
      setDeletingKategori(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Filtrelenmiş kategoriler
  const filteredKategoriler = kategoriler.filter(k => 
    k.kategoriAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (k.kategoriKodu && k.kategoriKodu.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (k.aciklama && k.aciklama.toLowerCase().includes(searchTerm.toLowerCase()))
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
              <Tag className="w-8 h-8 text-pink-600" />
              Tedarikçi Kategorileri
            </h1>
            <p className="text-gray-600 mt-2">
              Tedarikçi kategorilerini yönetin. Tedarikçi kartlarında çoklu seçim yapılır.
            </p>
          </div>
        </div>

        {/* Kategori Listesi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Kategori Listesi
              <Badge variant="secondary" className="ml-2">
                {filteredKategoriler.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Ara (Kod, Ad, Açıklama)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Yeni Kategori
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kategori Kodu</TableHead>
                    <TableHead>Kategori Adı</TableHead>
                    <TableHead>Açıklama</TableHead>
                    <TableHead className="text-center">Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKategoriler.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz kategori eklenmemiş.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredKategoriler.map((kategori) => (
                      <TableRow key={kategori.id} className={`hover:bg-gray-50 ${kategori.durum === 'PASIF' ? 'opacity-60 bg-gray-50' : ''}`}>
                        <TableCell>
                          {kategori.kategoriKodu ? (
                            <Badge variant="outline" className="font-mono">
                              {kategori.kategoriKodu}
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{kategori.kategoriAdi}</TableCell>
                        <TableCell className="text-gray-600">
                          {kategori.aciklama || '-'}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={kategori.durum === 'AKTIF' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-gray-100 text-gray-600'}>
                            {kategori.durum === 'AKTIF' ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(kategori)} title="Düzenle"><Edit className="w-4 h-4" /></Button>
                            {kategori.durum === 'AKTIF' ? (
                              <Button variant="ghost" size="sm" onClick={() => { const r = pasifYap(kategori.id); if (r.success) toast.success('Pasif yapıldı'); else toast.error(r.error); }} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">Pasif Yap</Button>
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => { const r = aktifYap(kategori.id); if (r.success) toast.success('Aktif yapıldı'); else toast.error(r.error); }} className="text-green-600 hover:text-green-700 hover:bg-green-50">Aktif Yap</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(kategori)} className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Sil"><Trash2 className="w-4 h-4" /></Button>
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

        {/* Varsayılan Kategoriler Bilgisi */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <FolderOpen className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900">Varsayılan Kategoriler</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Uygulama ilk açıldığında şu kategoriler otomatik olarak yüklenir:
                  İplik, Koli, Etiket, Lastik, Kimya, Aksesuar, Dış Hizmet, Ambalaj.
                  Bu kategorileri silebilir veya yeni kategoriler ekleyebilirsiniz.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ekle/Düzenle Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingKategori ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingKategori ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
              </DialogTitle>
              <DialogDescription>
                Kategori bilgilerini doldurun. Kategori Adı benzersiz olmalıdır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kategoriKodu">
                    Kategori Kodu <span className="text-gray-500">(Opsiyonel)</span>
                  </Label>
                  <Input
                    id="kategoriKodu"
                    value={formData.kategoriKodu}
                    onChange={(e) => setFormData({ ...formData, kategoriKodu: e.target.value })}
                    placeholder="örn: IPLIK"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kategoriAdi">Kategori Adı *</Label>
                  <Input
                    id="kategoriAdi"
                    value={formData.kategoriAdi}
                    onChange={(e) => setFormData({ ...formData, kategoriAdi: e.target.value })}
                    placeholder="örn: İplik"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="aciklama">Açıklama (Opsiyonel)</Label>
                <Input
                  id="aciklama"
                  value={formData.aciklama}
                  onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
                  placeholder="Kategori açıklaması..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                {editingKategori ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kategori Silme</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-gray-900">{deletingKategori?.kategoriAdi}</span> kategorisini silmek istediğinize emin misiniz?
                <br /><br />
                <span className="text-red-600 text-sm">
                  Bu işlem geri alınamaz. Eğer bu kategori tedarikçilerde kullanılıyorsa silme işlemi engellenecektir.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingKategori(null)}>
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
      </main>
    </div>
  );
}
