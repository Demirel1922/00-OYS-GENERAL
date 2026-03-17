import type { Module } from '@/types';

export const MODULES: Module[] = [
  {
    id: '1',
    title: 'Bilgi Girişi',
    description: 'Temel veri tanımları ve bilgi yönetimi',
    route: '/module/1',
    parent: null,
    hasChildren: true,
    adminOnly: false,
  },
  // Bilgi Girişi alt modülleri
  {
    id: '1a',
    title: 'Müşteriler',
    description: 'Müşteri kayıtları ve yönetimi',
    route: '/module/1/musteriler',
    parent: '1',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '1b',
    title: 'Tedarikçiler',
    description: 'Tedarikçi kayıtları ve yönetimi',
    route: '/module/1/tedarikciler',
    parent: '1',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '1c',
    title: 'Depolar',
    description: 'Depo tanımları ve yönetimi',
    route: '/module/1/depolar',
    parent: '1',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '1d',
    title: 'Tedarikçi Kategorileri',
    description: 'Tedarikçi kategori tanımları',
    route: '/module/1/tedarikci-kategorileri',
    parent: '1',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '1e',
    title: 'Genel Çorap Bilgileri',
    description: 'Beden, tip ve cinsiyet tanımları',
    route: '/module/1/genel-corap-bilgileri',
    parent: '1',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '1f',
    title: 'İplik Tanımları',
    description: 'İplik detay, kalınlık, renk ve işlem tipleri',
    route: '/module/1/iplik-tanimlari',
    parent: '1',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '2',
    title: 'Numune Yönetimi',
    description: 'Numune takibi ve yönetimi',
    route: '/module/2',
    parent: null,
    hasChildren: true,
    adminOnly: false,
  },
  // Numune Yönetimi alt modülleri
  {
    id: '2a',
    title: 'Numune Talepleri',
    description: 'Müşteri numune taleplerinin girişi ve takibi',
    route: '/module/2/talepler',
    parent: '2',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '2b',
    title: 'Üretim Hazırlık',
    description: 'Numune üretimi için teknik hazırlık ve ürün kartı tanımları',
    route: '/module/2/uretim-hazirlik',
    parent: '2',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '3',
    title: 'Hammadde / Malzeme Depo',
    description: 'Hammadde ve malzeme depo yönetimi',
    route: '/module/3',
    parent: null,
    hasChildren: true,
    adminOnly: false,
  },
  {
    id: '3a',
    title: 'İplik Depo',
    description: 'İplik stok ve depo yönetimi',
    route: '/module/3a',
    parent: '3',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '3b',
    title: 'Aksesuar Depo',
    description: 'Aksesuar stok ve depo yönetimi',
    route: '/module/3b',
    parent: '3',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '4',
    title: 'Sipariş–Satış–Sevkiyat',
    description: 'Sipariş, satış ve sevkiyat yönetimi',
    route: '/module/4',
    parent: null,
    hasChildren: true,
    adminOnly: false,
  },
  // Sipariş-Satış-Sevkiyat alt modülleri
  {
    id: '4a',
    title: 'Sipariş',
    description: 'Sipariş yönetimi ve takibi',
    route: '/module/4/siparis',
    parent: '4',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '4b',
    title: 'Satış',
    description: 'Satış işlemleri yönetimi',
    route: '/module/4/satis',
    parent: '4',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '4c',
    title: 'Sevkiyat',
    description: 'Sevkiyat ve lojistik yönetimi',
    route: '/module/4/sevkiyat',
    parent: '4',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '5',
    title: 'Satın Alma',
    description: 'Satın alma süreçleri yönetimi',
    route: '/module/5',
    parent: null,
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '6',
    title: 'Üretim',
    description: 'Üretim süreçleri yönetimi',
    route: '/module/6',
    parent: null,
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '7',
    title: 'Kalite',
    description: 'Kalite kontrol ve yönetimi',
    route: '/module/7',
    parent: null,
    hasChildren: false,
    adminOnly: false,
  },
  // Sevkiyat (id: '8') KALDIRILDI - artık 4c altında
  {
    id: '9',
    title: 'Raporlar',
    description: 'Raporlama ve analiz',
    route: '/module/9',
    parent: null,
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '10',
    title: 'Yönetim',
    description: 'Yönetim ve ayarlar',
    route: '/module/10',
    parent: null,
    hasChildren: false,
    adminOnly: true,
  },
  // YENİ: Sertifikalar modülü
  {
    id: '11',
    title: 'Sertifikalar',
    description: 'Sertifika ve belge yönetimi',
    route: '/module/11',
    parent: null,
    hasChildren: true,
    adminOnly: false,
  },
  // Sertifikalar alt modülleri
  {
    id: '11a',
    title: 'DİR (Dahilde İşleme Rejimi)',
    description: 'Dahilde İşleme Rejimi belge takibi',
    route: '/module/11/dir',
    parent: '11',
    hasChildren: true,
    adminOnly: false,
  },
  // DİR alt modülleri
  {
    id: '11a1',
    title: 'Tanımlar',
    description: 'GTİP/kompozisyon tanımları',
    route: '/module/11/dir/tanimlar',
    parent: '11a',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '11a2',
    title: 'DİR Belgeleri',
    description: 'Belge bazlı takip',
    route: '/module/11/dir/belgeler',
    parent: '11a',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '11a3',
    title: 'Yönetim',
    description: 'Yetki ve parametreler',
    route: '/module/11/dir/yonetim',
    parent: '11a',
    hasChildren: false,
    adminOnly: false,
  },
  {
    id: '11a4',
    title: 'Raporlar',
    description: 'Özet raporlar',
    route: '/module/11/dir/raporlar',
    parent: '11a',
    hasChildren: false,
    adminOnly: false,
  },
];

export function getModuleById(id: string): Module | undefined {
  return MODULES.find((m) => m.id === id);
}

export function getChildModules(parentId: string): Module[] {
  return MODULES.filter((m) => m.parent === parentId);
}

export function getParentModule(childId: string): Module | undefined {
  const child = MODULES.find((m) => m.id === childId);
  if (child?.parent) {
    return MODULES.find((m) => m.id === child.parent);
  }
  return undefined;
}

// Top-level modülleri getir (Dashboard'da gösterilecekler)
export function getTopLevelModules(): Module[] {
  return MODULES.filter((m) => m.parent === null);
}
