// ============================================
// DEPOLAR SAYFASI - CRUD
// ============================================
// ÖZELLİK: Manuel depo kodu (1000-9999) + unique kontrol
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Plus, Edit, Trash2, Search, Warehouse, ArrowLeft, Building, MapPin } from 'lucide-react';
import { useSort, SortIcon } from '@/components/common/SortableTable';
import { useDepoStore } from '@/store/depoStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { toTitleCaseTR } from '@/utils/titleCase';
import type { Depo, DepoFormData, DepoTipi } from '@/types';

export default function Depolar() {
  const navigate = useNavigate();
  const { depolar, addDepo, updateDepo, deleteDepo, pasifYap, aktifYap, seedData } = useDepoStore();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingDepo, setEditingDepo] = useState<Depo | null>(null);
  const [deletingDepo, setDeletingDepo] = useState<Depo | null>(null);
  
  // Arama state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<DepoFormData>({
    depoAdi: '',
    depoKodu: 1000,
    depoTipi: 'IC_DEPO',
    disDepoAdres: '',
    disDepoVKN: '',
    disDepoVergiDairesi: '',
  });

  // Form validasyon hataları
  const [koduError, setKoduError] = useState<string>('');

  // İlk yüklemede örnek verileri ekle
  useEffect(() => {
    if (depolar.length === 0) {
      seedData();
    }
  }, [depolar.length, seedData]);

  const resetForm = () => {
    setFormData({
      depoAdi: '',
      depoKodu: 1000,
      depoTipi: 'IC_DEPO',
      disDepoAdres: '',
      disDepoVKN: '',
      disDepoVergiDairesi: '',
    });
    setKoduError('');
    setEditingDepo(null);
  };

  const handleOpenDialog = (depo?: Depo) => {
    if (depo) {
      setEditingDepo(depo);
      setFormData({
        depoAdi: depo.depoAdi,
        depoKodu: depo.depoKodu,
        depoTipi: depo.depoTipi,
        disDepoAdres: depo.disDepoAdres || '',
        disDepoVKN: depo.disDepoVKN || '',
        disDepoVergiDairesi: depo.disDepoVergiDairesi || '',
      });
    } else {
      // Yeni depo için uygun kod bul
      const usedCodes = depolar.map(d => d.depoKodu);
      let nextCode = 1000;
      while (usedCodes.includes(nextCode) && nextCode <= 9999) {
        nextCode++;
      }
      setFormData(prev => ({ ...prev, depoKodu: nextCode <= 9999 ? nextCode : 1000 }));
    }
    setKoduError('');
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDepoKoduChange = (value: string) => {
    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      setFormData(prev => ({ ...prev, depoKodu: 0 }));
      setKoduError('Geçerli bir sayı giriniz');
      return;
    }

    if (numValue < 1000 || numValue > 9999) {
      setKoduError('Depo Kodu 1000-9999 arasında olmalıdır');
    } else {
      // Unique kontrolü
      const exists = depolar.some(d => d.depoKodu === numValue && d.id !== editingDepo?.id);
      if (exists) {
        setKoduError(`Depo Kodu "${numValue}" zaten kullanılıyor`);
      } else {
        setKoduError('');
      }
    }
    setFormData(prev => ({ ...prev, depoKodu: numValue }));
  };

  const handleSubmit = () => {
    // Validasyon
    if (!formData.depoAdi.trim()) {
      toast.error('Depo Adı zorunludur');
      return;
    }
    if (formData.depoKodu < 1000 || formData.depoKodu > 9999) {
      toast.error('Depo Kodu 1000-9999 arasında olmalıdır');
      return;
    }
    if (koduError) {
      toast.error(koduError);
      return;
    }

    // Dış depo validasyonu
    if (formData.depoTipi === 'DIS_DEPO' && !formData.disDepoAdres?.trim()) {
      toast.error('Dış depo için adres zorunludur');
      return;
    }

    let result;
    if (editingDepo) {
      result = updateDepo(editingDepo.id, formData);
      if (result.success) {
        toast.success('Depo güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Güncelleme başarısız');
      }
    } else {
      result = addDepo(formData);
      if (result.success) {
        toast.success('Depo eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Ekleme başarısız');
      }
    }
  };

  const handleDeleteClick = (depo: Depo) => {
    setDeletingDepo(depo);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingDepo) {
      const result = deleteDepo(deletingDepo.id);
      if (result.success) {
        toast.success('Depo silindi');
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
      setDeletingDepo(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Sıralama
  const { sortField, sortDir, toggleSort, sortFn } = useSort('depoKodu');

  // Filtrelenmiş ve sıralanmış depolar
  const filteredDepolar = sortFn(
    depolar.filter(d => 
      d.depoAdi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.depoKodu.toString().includes(searchTerm)
    ),
    (d: any, f: string) => f === 'depoKodu' ? Number(d[f]) || 0 : (d[f] ?? '')
  );

  const getDepoTipiBadge = (tipi: DepoTipi) => {
    if (tipi === 'IC_DEPO') {
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">İç Depo</Badge>;
    }
    return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Dış Depo</Badge>;
  };

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
              <Warehouse className="w-8 h-8 text-orange-600" />
              Depolar
            </h1>
            <p className="text-gray-600 mt-2">
              Depo tanımlarını yönetin. Depo kodu 1000-9999 arasında manuel girilir.
            </p>
          </div>
        </div>

        {/* Depo Listesi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Depo Listesi
              <Badge variant="secondary" className="ml-2">
                {filteredDepolar.length}
              </Badge>
            </CardTitle>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Ara (Kod, Ad)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Yeni Depo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('depoKodu')}>Depo Kodu <SortIcon field="depoKodu" sortField={sortField} sortDir={sortDir} /></TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('depoAdi')}>Depo Adı <SortIcon field="depoAdi" sortField={sortField} sortDir={sortDir} /></TableHead>
                    <TableHead className="cursor-pointer select-none" onClick={() => toggleSort('depoTipi')}>Depo Tipi <SortIcon field="depoTipi" sortField={sortField} sortDir={sortDir} /></TableHead>
                    <TableHead>Ek Bilgiler</TableHead>
                    <TableHead className="text-center">Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDepolar.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz depo eklenmemiş.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepolar.map((depo) => (
                      <TableRow key={depo.id} className={`hover:bg-gray-50 ${depo.durum === 'PASIF' ? 'opacity-60 bg-gray-50' : ''}`}>
                        <TableCell className="font-medium">
                          <Badge variant="outline" className="font-mono text-base px-3 py-1">
                            {depo.depoKodu}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{depo.depoAdi}</TableCell>
                        <TableCell>{getDepoTipiBadge(depo.depoTipi)}</TableCell>
                        <TableCell>
                          {depo.depoTipi === 'DIS_DEPO' && depo.disDepoAdres && (
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-xs">{depo.disDepoAdres}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className={depo.durum === 'AKTIF' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-gray-100 text-gray-600'}>
                            {depo.durum === 'AKTIF' ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(depo)} title="Düzenle"><Edit className="w-4 h-4" /></Button>
                            {depo.durum === 'AKTIF' ? (
                              <Button variant="ghost" size="sm" onClick={() => { const r = pasifYap(depo.id); if (r.success) toast.success('Pasif yapıldı'); else toast.error(r.error); }} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">Pasif Yap</Button>
                            ) : (
                              <>
                                <Button variant="ghost" size="sm" onClick={() => { const r = aktifYap(depo.id); if (r.success) toast.success('Aktif yapıldı'); else toast.error(r.error); }} className="text-green-600 hover:text-green-700 hover:bg-green-50">Aktif Yap</Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(depo)} className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Sil"><Trash2 className="w-4 h-4" /></Button>
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
                {editingDepo ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingDepo ? 'Depo Düzenle' : 'Yeni Depo Ekle'}
              </DialogTitle>
              <DialogDescription>
                Depo bilgilerini doldurun. Depo Kodu 1000-9999 arasında benzersiz olmalıdır.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Temel Bilgiler */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Temel Bilgiler</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="depoKodu">
                      Depo Kodu * 
                      <span className="text-gray-500 font-normal">(1000-9999)</span>
                    </Label>
                    <Input
                      id="depoKodu"
                      type="number"
                      min={1000}
                      max={9999}
                      value={formData.depoKodu}
                      onChange={(e) => handleDepoKoduChange(e.target.value)}
                      placeholder="örn: 1001"
                      className={koduError ? 'border-red-500' : ''}
                    />
                    {koduError && (
                      <p className="text-sm text-red-600">{koduError}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="depoAdi">Depo Adı *</Label>
                    <Input
                      id="depoAdi"
                      value={formData.depoAdi}
                      onChange={(e) => setFormData({ ...formData, depoAdi: e.target.value })}
                      onBlur={() => setFormData(f => ({ ...f, depoAdi: toTitleCaseTR(f.depoAdi) }))}
                      placeholder="örn: Ana Depo - Kayseri"
                    />
                  </div>
                </div>
              </div>

              {/* Depo Tipi */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Depo Tipi</h3>
                <div className="space-y-2">
                  <Label htmlFor="depoTipi">Depo Tipi</Label>
                  <Select
                    value={formData.depoTipi}
                    onValueChange={(value: DepoTipi) => setFormData({ ...formData, depoTipi: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IC_DEPO">İç Depo (Kendi Depomuz)</SelectItem>
                      <SelectItem value="DIS_DEPO">Dış Depo (3. Şahıs)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dış Depo Bilgileri (Koşullu) */}
              {formData.depoTipi === 'DIS_DEPO' && (
                <div className="space-y-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h3 className="text-sm font-semibold text-orange-900 border-b border-orange-200 pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Dış Depo Bilgileri
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="disDepoAdres">Dış Depo Adresi *</Label>
                      <Input
                        id="disDepoAdres"
                        value={formData.disDepoAdres}
                        onChange={(e) => setFormData({ ...formData, disDepoAdres: e.target.value })}
                        placeholder="Dış depo tam adresi..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="disDepoVKN">VKN</Label>
                        <Input
                          id="disDepoVKN"
                          value={formData.disDepoVKN}
                          onChange={(e) => setFormData({ ...formData, disDepoVKN: e.target.value })}
                          placeholder="Vergi kimlik no..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="disDepoVergiDairesi">Vergi Dairesi</Label>
                        <Input
                          id="disDepoVergiDairesi"
                          value={formData.disDepoVergiDairesi}
                          onChange={(e) => setFormData({ ...formData, disDepoVergiDairesi: e.target.value })}
                          placeholder="Vergi dairesi..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button onClick={handleSubmit} disabled={!!koduError}>
                {editingDepo ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Depo Silme</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-gray-900">{deletingDepo?.depoAdi}</span> (Kod: {deletingDepo?.depoKodu}) deposunu silmek istediğinize emin misiniz?
                <br /><br />
                <span className="text-red-600 text-sm">
                  Bu işlem geri alınamaz. Eğer bu depo stok hareketlerinde kullanılıyorsa silme işlemi engellenecektir.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingDepo(null)}>
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
