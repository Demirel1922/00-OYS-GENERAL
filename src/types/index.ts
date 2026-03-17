// ============================================
// OYS-ERP TİP TANIMLARI
// ============================================

// ============================================
// TEMEL TİPLER (Orijinal)
// ============================================
export interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  modules: string[];
}

export interface Session {
  user: User;
  token: string;
  allowedModules: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  route: string;
  parent: string | null;
  hasChildren: boolean;
  adminOnly: boolean;
}

// ============================================
// BİLGİ GİRİŞLERİ MODÜLÜ - TİPLER
// ============================================

export type Bolge = 'IHRACAT' | 'IC_PIYASA';
export type OdemeVadesiBirim = 'GUN' | 'AY';
export type DepoTipi = 'IC_DEPO' | 'DIS_DEPO';
export type LookupType = 'BEDEN' | 'TIP' | 'CINSIYET' | 'BIRIM';

export interface Musteri {
  id: string;
  ormeciMusteriNo: string;
  musteriKisaKod: string;
  musteriUnvan: string;
  bolge: Bolge;
  ulke: string;
  adres: string;
  vergiNo: string;
  odemeVadesiDeger: number;
  odemeVadesiBirim: OdemeVadesiBirim;
  odemeTipi: string;
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

export interface Tedarikci {
  id: string;
  tedarikciKodu: string;
  tedarikciAdi: string;
  tedarikciUnvan?: string;
  bolge: 'ITHALAT' | 'IC_PIYASA';
  ulke?: string;
  adres: string;
  vkn: string;
  vergiDairesi: string;
  kategoriIds: string[];
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

export interface TedarikciKategorisi {
  id: string;
  kategoriKodu?: string;
  kategoriAdi: string;
  aciklama?: string;
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

export interface Depo {
  id: string;
  depoAdi: string;
  depoKodu: number;
  depoTipi: DepoTipi;
  disDepoAdres?: string;
  disDepoVKN?: string;
  disDepoVergiDairesi?: string;
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

export interface LookupItem {
  id: string;
  lookupType: LookupType;
  kod: string;
  ad: string;
  durum: 'AKTIF' | 'PASIF';
  sira?: number;
  carpan?: number; // Birim çarpanı (ör: Düzine=12, 3lü Paket=3)
  createdAt: string;
  updatedAt: string;
}

// ============================================
// FORM TİPLERİ
// ============================================

export interface MusteriFormData {
  ormeciMusteriNo: string;
  musteriKisaKod: string;
  musteriUnvan: string;
  bolge: Bolge;
  ulke: string;
  adres: string;
  vergiNo: string;
  odemeVadesiDeger: number;
  odemeVadesiBirim: OdemeVadesiBirim;
  odemeTipi: string;
}

export interface TedarikciFormData {
  tedarikciKodu: string;
  tedarikciAdi: string;
  tedarikciUnvan?: string;
  bolge: 'ITHALAT' | 'IC_PIYASA';
  ulke?: string;
  adres: string;
  vkn: string;
  vergiDairesi: string;
  kategoriIds: string[];
}

export interface TedarikciKategorisiFormData {
  kategoriKodu?: string;
  kategoriAdi: string;
  aciklama?: string;
}

export interface DepoFormData {
  depoAdi: string;
  depoKodu: number;
  depoTipi: DepoTipi;
  disDepoAdres?: string;
  disDepoVKN?: string;
  disDepoVergiDairesi?: string;
}

export interface LookupItemFormData {
  lookupType: LookupType;
  kod: string;
  ad: string;
  sira?: number;
}

// ============================================
// API/HATA TİPLERİ
// ============================================

export interface ApiError {
  code: string;
  message: string;
  details?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export type SilmeHataTipi =
  | 'REFERANSLI_MUSTERI'
  | 'REFERANSLI_TEDARIKCI'
  | 'REFERANSLI_DEPO'
  | 'REFERANSLI_KATEGORI'
  | 'REFERANSLI_LOOKUP'
  | 'DUPLICATE_KOD'
  | 'DUPLICATE_NO';

export interface SilmeHataResponse {
  success: false;
  errorType: SilmeHataTipi;
  message: string;
  references?: {
    module: string;
    count: number;
  }[];
}

// ============================================
// İPLİK TANIMLARI TİPLERİ
// ============================================

export type HareketYonu = 'GIRIS' | 'CIKIS';

export interface IslemTipi {
  id: string;
  islemAdi: string;
  hareketYonu: HareketYonu;
  aciklama?: string;
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

export interface IplikKategori {
  id: string;
  kategoriAdi: string;
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

export interface IplikCins {
  id: string;
  kategoriId: string;
  cinsAdi: string;
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

export interface IplikDetay {
  id: string;
  cinsId: string;
  detayAdi: string;
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

export type KalinlikBirim = 'Ne' | 'Nm' | 'Dtex' | 'Denye';

export interface Kalinlik {
  id: string;
  birim: KalinlikBirim;
  deger: string;
  ozellik?: string;
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

export interface Renk {
  id: string;
  renkAdi: string;
  durum: 'AKTIF' | 'PASIF';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// İPLİK TANIMLARI FORM TİPLERİ
// ============================================

export interface IslemTipiFormData {
  islemAdi: string;
  hareketYonu: HareketYonu;
  aciklama?: string;
  durum: 'AKTIF' | 'PASIF';
}

export interface IplikKategoriFormData {
  kategoriAdi: string;
  durum: 'AKTIF' | 'PASIF';
}

export interface IplikCinsFormData {
  kategoriId: string;
  cinsAdi: string;
  durum: 'AKTIF' | 'PASIF';
}

export interface IplikDetayFormData {
  cinsId: string;
  detayAdi: string;
  durum: 'AKTIF' | 'PASIF';
}

export interface KalinlikFormData {
  birim: KalinlikBirim;
  deger: string;
  ozellik?: string;
  durum: 'AKTIF' | 'PASIF';
}

export interface RenkFormData {
  renkAdi: string;
  durum: 'AKTIF' | 'PASIF';
}
