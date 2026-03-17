// ============================================
// GENEL ÇORAP BİLGİLERİ SAYFASI - CRUD
// ============================================
// Bedenler, Tipler, Cinsiyetler için tab'lı arayüz
// ============================================
import { useState, useEffect } from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { Plus, Edit, Trash2, Search, Footprints, ArrowLeft, Ruler, Users, Package } from 'lucide-react';
import { useLookupStore } from '@/store/lookupStore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { toTitleCaseTR } from '@/utils/titleCase';
import type { LookupItem, LookupItemFormData, LookupType } from '@/types';

const LOOKUP_TYPES: { id: LookupType; label: string; labelTekil: string; icon: React.ElementType; description: string }[] = [
  { id: 'BEDEN', label: 'Beden', labelTekil: 'Beden', icon: Ruler, description: 'Çorap beden ölçüleri (35-38, 39-42 vb.)' },
  { id: 'TIP', label: 'Tip', labelTekil: 'Tip', icon: Footprints, description: 'Çorap tipleri (Patik, Kısa, Diz Altı vb.)' },
  { id: 'CINSIYET', label: 'Cinsiyet', labelTekil: 'Cinsiyet', icon: Users, description: 'Cinsiyet kategorileri (Erkek, Kadın, Unisex vb.)' },
  { id: 'BIRIM', label: 'Birim', labelTekil: 'Birim', icon: Package, description: 'Sipariş birimleri (Çift, Düzine, Paket vb.)' },
];

export default function GenelCorapBilgileri() {
  const navigate = useNavigate();
  const { items, addItem, updateItem, deleteItem, pasifYap, aktifYap, getItemsByType, seedData } = useLookupStore();
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<LookupItem | null>(null);
  
  // Active tab
  const [activeTab, setActiveTab] = useState<LookupType>('BEDEN');
  
  // Arama state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form state
  const [formData, setFormData] = useState<LookupItemFormData>({
    lookupType: 'BEDEN',
    kod: '',
    ad: '',
    sira: undefined,
  });

  // İlk yüklemede varsayılan verileri yükle
  useEffect(() => {
    if (items.length === 0) {
      seedData();
    }
  }, [items.length, seedData]);

  const resetForm = () => {
    setFormData({
      lookupType: activeTab,
      kod: '',
      ad: '',
      sira: undefined,
    });
    setEditingItem(null);
  };

  const handleOpenDialog = (item?: LookupItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        lookupType: item.lookupType,
        kod: item.kod,
        ad: item.ad,
        sira: item.sira,
        carpan: item.carpan,
      } as any);
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
    if (!formData.kod.trim()) {
      toast.error('Kod zorunludur');
      return;
    }
    if (!formData.ad.trim()) {
      toast.error('Ad zorunludur');
      return;
    }

    let result;
    if (editingItem) {
      result = updateItem(editingItem.id, formData);
      if (result.success) {
        toast.success('Kayıt güncellendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Güncelleme başarısız');
      }
    } else {
      result = addItem(formData);
      if (result.success) {
        toast.success('Kayıt eklendi');
        handleCloseDialog();
      } else {
        toast.error(result.error || 'Ekleme başarısız');
      }
    }
  };

  const handleDeleteClick = (item: LookupItem) => {
    setDeletingItem(item);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deletingItem) {
      const result = deleteItem(deletingItem.id);
      if (result.success) {
        toast.success('Kayıt silindi');
      } else {
        toast.error(result.error || 'Silme başarısız');
      }
      setDeletingItem(null);
      setIsDeleteDialogOpen(false);
    }
  };

  // Tab değiştiğinde aramayı sıfırla
  const handleTabChange = (value: string) => {
    setActiveTab(value as LookupType);
    setSearchTerm('');
  };

  // Filtrelenmiş öğeler
  const getFilteredItems = (type: LookupType) => {
    const typeItems = getItemsByType(type);
    if (!searchTerm) return typeItems;
    
    return typeItems.filter(item => 
      item.kod.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ad.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const renderLookupTable = (type: LookupType) => {
    const filteredItems = getFilteredItems(type);
    const typeInfo = LOOKUP_TYPES.find(t => t.id === type);

    return (
      <div className="space-y-4">
        {/* Arama ve Yeni Butonu */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder={`${typeInfo?.label} ara...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni {typeInfo?.labelTekil}
          </Button>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sıra</TableHead>
                <TableHead>Kod</TableHead>
                <TableHead>Ad</TableHead>
                {type === 'BIRIM' && <TableHead className="text-center">Çift Çarpanı</TableHead>}
                <TableHead className="text-center">Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    {searchTerm ? 'Arama sonucu bulunamadı.' : `Henüz ${typeInfo?.label.toLowerCase()} eklenmemiş.`}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems
                  .sort((a, b) => (a.sira || 999) - (b.sira || 999))
                  .map((item) => (
                    <TableRow key={item.id} className={`hover:bg-gray-50 ${item.durum === 'PASIF' ? 'opacity-60 bg-gray-50' : ''}`}>
                      <TableCell>
                        {item.sira ? (
                          <Badge variant="outline" className="font-mono">
                            {item.sira}
                          </Badge>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.kod}</TableCell>
                      <TableCell className="font-medium">{item.ad}</TableCell>
                      {type === 'BIRIM' && (
                        <TableCell className="text-center">
                          <Badge variant="outline">{item.carpan || 1}x</Badge>
                        </TableCell>
                      )}
                      <TableCell className="text-center">
                        <Badge className={item.durum === 'AKTIF' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' : 'bg-gray-100 text-gray-600'}>
                          {item.durum === 'AKTIF' ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(item)} title="Düzenle"><Edit className="w-4 h-4" /></Button>
                          {item.durum === 'AKTIF' ? (
                            <Button variant="ghost" size="sm" onClick={() => { const r = pasifYap(item.id); if (r.success) toast.success('Pasif yapıldı'); else toast.error(r.error); }} className="text-amber-600 hover:text-amber-700 hover:bg-amber-50">Pasif Yap</Button>
                          ) : (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => { const r = aktifYap(item.id); if (r.success) toast.success('Aktif yapıldı'); else toast.error(r.error); }} className="text-green-600 hover:text-green-700 hover:bg-green-50">Aktif Yap</Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(item)} className="text-red-600 hover:text-red-700 hover:bg-red-50" title="Sil"><Trash2 className="w-4 h-4" /></Button>
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
      </div>
    );
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
              <Footprints className="w-8 h-8 text-teal-600" />
              Genel Çorap Bilgileri
            </h1>
            <p className="text-gray-600 mt-2">
              Çorap üretimi için temel bilgileri yönetin. Sipariş ve üretim kartlarında kullanılır.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Çorap Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {LOOKUP_TYPES.map((type) => {
                  const Icon = type.icon;
                  const count = getItemsByType(type.id).length;
                  return (
                    <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {type.label}
                      <Badge variant="secondary" className="ml-1 text-xs">{count}</Badge>
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {LOOKUP_TYPES.map((type) => (
                <TabsContent key={type.id} value={type.id} className="mt-6">
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <type.icon className="w-4 h-4" />
                      <span className="text-sm">{type.description}</span>
                    </div>
                  </div>
                  {renderLookupTable(type.id)}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>

        {/* Ekle/Düzenle Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {editingItem ? <Edit className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                {editingItem ? 'Kayıt Düzenle' : 'Yeni Kayıt Ekle'}
              </DialogTitle>
              <DialogDescription>
                {LOOKUP_TYPES.find(t => t.id === activeTab)?.label} listesine kayıt ekleyin.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="kod">Kod *</Label>
                  <Input
                    id="kod"
                    value={formData.kod}
                    onChange={(e) => setFormData({ ...formData, kod: e.target.value })}
                    placeholder={`örn: ${activeTab}_001`}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ad">Ad *</Label>
                  <Input
                    id="ad"
                    value={formData.ad}
                    onChange={(e) => setFormData({ ...formData, ad: e.target.value })}
                    onBlur={() => setFormData(f => ({ ...f, ad: toTitleCaseTR(f.ad) }))}
                    placeholder="Ekranda görünecek ad"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sira">
                  Sıra <span className="text-gray-500">(Opsiyonel - Dropdown sıralaması için)</span>
                </Label>
                <Input
                  id="sira"
                  type="number"
                  min={1}
                  value={formData.sira || ''}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    sira: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder="örn: 1"
                />
              </div>
              {activeTab === 'BIRIM' && (
                <div className="space-y-2">
                  <Label htmlFor="carpan">
                    Çift Çarpanı <span className="text-gray-500">(Bu birimde kaç çift var?)</span>
                  </Label>
                  <Input
                    id="carpan"
                    type="number"
                    min={1}
                    value={(formData as any).carpan || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      carpan: e.target.value ? parseInt(e.target.value) : undefined 
                    } as any)}
                    placeholder="örn: 3 (3'lü Paket için)"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                {editingItem ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Silme Onay Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Kayıt Silme</AlertDialogTitle>
              <AlertDialogDescription>
                <span className="font-semibold text-gray-900">{deletingItem?.ad}</span> kaydını silmek istediğinize emin misiniz?
                <br /><br />
                <span className="text-red-600 text-sm">
                  Bu işlem geri alınamaz. Eğer bu kayıt sipariş/üretim kartlarında kullanılıyorsa silme işlemi engellenecektir.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeletingItem(null)}>
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
