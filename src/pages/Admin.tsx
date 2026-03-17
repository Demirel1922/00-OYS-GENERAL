import { useState } from 'react';
import { Header } from '@/components/common/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Shield, User, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUsersStore, type UserWithModules } from '@/store/usersStore';
import { MODULES } from '@/data/modules';
import { toast } from 'sonner';

export function Admin() {
  const navigate = useNavigate();
  const { users, addUser, updateUser, deleteUser } = useUsersStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithModules | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    isAdmin: false,
    modules: [] as string[],
  });



  const resetForm = () => {
    setFormData({
      username: '',
      fullName: '',
      email: '',
      password: '',
      isAdmin: false,
      modules: [],
    });
    setEditingUser(null);
  };

  const handleOpenDialog = (user?: UserWithModules) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        password: '',
        isAdmin: user.isAdmin,
        modules: user.modules.filter(m => m !== 'all'),
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

  // Alt modül seçilince tüm üst modülleri de otomatik seç
  const getParentChain = (moduleId: string): string[] => {
    const parents: string[] = [];
    const mod = MODULES.find(m => m.id === moduleId);
    if (mod?.parent) {
      parents.push(mod.parent);
      parents.push(...getParentChain(mod.parent));
    }
    return parents;
  };

  const handleModuleToggle = (moduleId: string) => {
    setFormData((prev) => {
      const isSelected = prev.modules.includes(moduleId);
      
      if (isSelected) {
        // Kaldırırken: bu modülü ve altındaki tüm çocukları kaldır
        const childIds = MODULES.filter(m => m.parent === moduleId).map(m => m.id);
        const allToRemove = [moduleId, ...childIds];
        // Alt-altları da kaldır (2. seviye)
        childIds.forEach(cid => {
          MODULES.filter(m => m.parent === cid).forEach(m => allToRemove.push(m.id));
        });
        return {
          ...prev,
          modules: prev.modules.filter(m => !allToRemove.includes(m)),
        };
      } else {
        // Eklerken: üst modülleri de otomatik ekle
        const parents = getParentChain(moduleId);
        const newModules = [...prev.modules, moduleId, ...parents];
        // Tekrar eden ID'leri kaldır
        return {
          ...prev,
          modules: [...new Set(newModules)],
        };
      }
    });
  };

  const handleSelectAllModules = () => {
    const allModuleIds = MODULES.map(m => m.id);
    const allSelected = allModuleIds.every(id => formData.modules.includes(id));
    
    setFormData((prev) => ({
      ...prev,
      modules: allSelected ? [] : allModuleIds,
    }));
  };

  const handleSubmit = () => {
    if (!formData.username || !formData.fullName) {
      toast.error('Kullanıcı adı ve ad soyad zorunludur');
      return;
    }

    if (!editingUser && !formData.password) {
      toast.error('Yeni kullanıcı için şifre zorunludur');
      return;
    }

    const modules = formData.isAdmin ? ['all'] : formData.modules;

    if (editingUser) {
      const updates: Partial<UserWithModules> = {
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        isAdmin: formData.isAdmin,
        modules,
      };
      if (formData.password) {
        updates.password = formData.password;
      }
      updateUser(editingUser.id, updates);
      toast.success('Kullanıcı güncellendi');
    } else {
      addUser({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        isAdmin: formData.isAdmin,
        modules,
      });
      toast.success('Kullanıcı eklendi');
    }

    handleCloseDialog();
  };

  const handleDelete = (user: UserWithModules) => {
    if (confirm(`'${user.fullName}' kullanıcısını silmek istediğinize emin misiniz?`)) {
      deleteUser(user.id);
      toast.success('Kullanıcı silindi');
    }
  };

  const getModuleNames = (userModules: string[]) => {
    if (userModules.includes('all')) return ['Tüm Modüller'];
    
    return userModules
      .map((id) => MODULES.find((m) => m.id === id)?.title)
      .filter(Boolean) as string[];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Menüye Dön
        </Button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Yönetim Paneli</h1>
          <p className="text-gray-600 mt-2">
            Kullanıcı yönetimi ve yetkilendirme
          </p>
        </div>

        {/* Kullanıcı Listesi */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Kullanıcılar
            </CardTitle>
            <Button onClick={() => handleOpenDialog()} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Yeni Kullanıcı
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kullanıcı Adı</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Yetkili Modüller</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="default" className="bg-purple-600">
                          <Shield className="w-3 h-3 mr-1" />
                          Admin
                        </Badge>
                      ) : (
                        <Badge variant="outline">Kullanıcı</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {getModuleNames(user.modules).slice(0, 3).map((name, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {name}
                          </Badge>
                        ))}
                        {user.modules.length > 3 && !user.modules.includes('all') && (
                          <Badge variant="secondary" className="text-xs">
                            +{user.modules.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Kullanıcı Ekle/Düzenle Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Kullanıcı Adı *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="kullaniciadi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ad Soyad"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@ornek.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">
                    Şifre {editingUser && '(Boş bırakırsanız değişmez)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? '••••••' : 'Şifre'}
                  />
                </div>
              </div>

              {/* Admin Yetkisi */}
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="isAdmin"
                  checked={formData.isAdmin}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isAdmin: checked as boolean })
                  }
                />
                <Label htmlFor="isAdmin" className="font-medium">
                  Admin Yetkisi (Tüm modüllere erişim)
                </Label>
              </div>

              {/* Modül Yetkileri */}
              {!formData.isAdmin && (
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <Label className="font-medium">Modül Yetkileri</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAllModules}
                    >
                      Tümünü Seç/İptal
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                    {MODULES.map((module) => (
                      <div key={module.id} className="flex items-start space-x-2">
                        <Checkbox
                          id={`module-${module.id}`}
                          checked={formData.modules.includes(module.id)}
                          onCheckedChange={() => handleModuleToggle(module.id)}
                        />
                        <div className="grid gap-1 leading-none">
                          <Label
                            htmlFor={`module-${module.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {module.title}
                          </Label>
                          <span className="text-xs text-gray-500">
                            ID: {module.id}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                İptal
              </Button>
              <Button onClick={handleSubmit}>
                {editingUser ? 'Güncelle' : 'Ekle'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
