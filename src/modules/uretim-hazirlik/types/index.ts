// ============================================================
// OYS-ERP Üretim Hazırlık Modülü - Type Definitions
// Kaynak: Excel "Yeni_Kartela_-_Numune_form_Sistemi_v_9"
// ============================================================

// --- STATÜ ---
export type UretimHazirlikStatus = 'NEW' | 'IN_PROGRESS' | 'COMPLETED_LOCKED' | 'REOPENED';

export const STATUS_LABELS: Record<UretimHazirlikStatus, string> = {
  NEW: 'Yeni',
  IN_PROGRESS: 'Devam Eden',
  COMPLETED_LOCKED: 'Biten',
  REOPENED: 'Geri Açıldı',
};

// --- İPLİK SATIRI (KartelaArkası satır 3-41, max 38 satır) ---
export interface IplikSatiri {
  id: number;
  iplikYeri: string;       // Mekik Tanımı (dropdown, 79 adet)
  mekikKodu: string;       // Z-1..Z-EXTRA, D-1-1..D-6-3, L-1, L-2
  denye: string;           // İplik numarası
  kat: string;             // 1-50+
  iplikCinsi: string;      // 28 adet cins
  iplikTanimi: string;     // Serbest metin
  renk: string;
  renkKodu: string;
  tedarikci: string;       // 20+ firma
}

// --- ÖLÇÜ SATIRI (KartelaArkası sağ bölüm, boy bazlı) ---
export interface OlcuSatiri {
  id: number;
  boy: string;             // Boylar dropdown
  lastikBoyu: string;
  lastikEni: string;
  koncBoyu: string;
  tenisBoyu: string;
  tenisLastikEni: string;
  tabanAltiElastikBantBoyu: string;
  tabanAltiElastikBantEni: string;
  tabanBoyu: string;
  lastikStreci: string;
  koncStreci: string;
  tenisStreci: string;
  tabanStreci: string;
  topukStreci: string;
  koncMekanik: string;
  tabanMekanik: string;
  tenisMekanik: string;
  bord: string;
  tabanElastikBantStrec: string;
}

// --- ÜRÜN HAZIRLIK KARTI (KartelaArkası = MASTER) ---
export interface UrunHazirlikKarti {
  // Header
  urunTanimi: string;
  hazirlayan: string;
  numuneTarihi: string;
  // Müşteri
  musteriKodu: string;
  musteriArtikelKodu: string;
  // Artikel
  ormeciArtikelKodu: string;
  // Ürün
  boy: string;
  burunKapama: string;     // Rosso / Teksıra / Comfort
  yikama: string;          // Lavatec / Silikonlu / Sulu / Yok
  uretimZamani: string;    // saniye
  // Makina
  igneSayisi: string;
  cap: string;
  kalinlik: string;
  makinaModeli: string;
  makinaNo: string;
  // Ağırlık
  ciftAgirligi: string;    // gram
  // Notlar
  not: string;
  // İplik tablosu
  iplikler: IplikSatiri[];
  // Ölçüler
  olculer: OlcuSatiri[];
}

// --- GRAMAJ SATIRI ---
export interface GramajSatiri {
  id: number;
  // KartelaArkası'ndan otomatik (readonly)
  iplikYeri: string;
  mekikKodu: string;
  denye: string;
  kat: string;
  iplikCinsi: string;
  iplikTanimi: string;
  renk: string;
  renkKodu: string;
  tedarikci: string;
  // Manuel giriş (editable)
  orgudenOnceAgirlik: string;
  orgudenSonraAgirlik: string;
  // Hesaplanan (readonly)
  kullanilanMiktar6Cift: number;   // = önce - sonra
  kullanilanMiktar1Duzine: number; // = 6cift * 2
}

// --- GRAMAJ ÇALIŞMASI ---
export interface GramajCalismasi {
  satirlar: GramajSatiri[];
  // Alt toplamlar (hesaplanan)
  toplam6Cift: number;
  toplam1Duzine: number;
  burunDikisi: string;     // ← KartelaArkası
  yikamaAgirlik: string;   // ← KartelaArkası
  birCiftAgirligi: string; // ← KartelaArkası
  birDuzineAgirligi: number; // = birCiftAgirligi * 12
  genelToplam6Cift: number;
  genelToplam1Duzine: number;
  fark6Cift: number;
  fark1Duzine: number;
  not: string;
}

// --- YIKAMA ADIMI (6 adım sabit - LAVATEC) ---
export interface YikamaAdimi {
  adim: number;            // 1-6
  yumusaticiSuresi: string;
  buharSuresi: string;
  sogutmaSuresi: string;
  sogutmaDerecesi: string;
  kurutmaSuresi: string;
  kurutmaDerecesi: string;
  kullanilanYumusatici: string;
  yumusaticiMiktari: string;
  silikonMiktari: string;
  kimyasalMiktari: string;
}

// --- YIKAMA ÇALIŞMASI ---
export interface YikamaCalismasi {
  yikamaYeri: string;
  yikamaTipi: string;
  musteriKodu: string;     // ← KartelaArkası (readonly)
  artikelKodu: string;     // ← KartelaArkası (readonly)
  ormeciArtikelNo: string; // ← KartelaArkası (readonly)
  yikamaProgramKodu: string;
  sorumlu: string;
  adimlar: YikamaAdimi[];
  aciklama: string;
}

// --- FORMA PARAMETRELERİ (conditional rendering) ---
export type FormaCesidi = 'EL_KALIBI' | 'CORTESE' | 'TECNOPEA' | '';

export interface FormaParametre {
  etiket: string;
  deger: string;
}

export interface FormaCalismasi {
  formaCesidi: FormaCesidi;
  parametreler: FormaParametre[];
  kalipNolari: string[];   // boy bazlı, max 6
}

// --- ANA KAYIT ---
export interface UretimHazirlikKaydi {
  id: string;
  // Referanslar
  numuneNo: string;
  numuneId: number;
  // Statü
  status: UretimHazirlikStatus;
  kilitli: boolean;
  // Meta
  olusturanKullanici: string;
  olusturmaTarihi: string;
  sonGuncelleyen: string;
  sonGuncellemeTarihi: string;
  sorumlu: string;
  acil: boolean;
  // Sekmeler
  urunKarti: UrunHazirlikKarti;
  gramaj: GramajCalismasi;
  yikama: YikamaCalismasi;
  forma: FormaCalismasi;
  // Audit
  loglar: AuditLog[];
}

// --- AUDIT LOG ---
export interface AuditLog {
  id: string;
  tarih: string;
  kullanici: string;
  aksiyon: 'OLUSTURMA' | 'KAYDET' | 'STATU_DEGISIM' | 'ONAY' | 'GERI_ACMA' | 'KILIT_DEGISIM';
  detay: string;
  oncekiDeger?: string;
  yeniDeger?: string;
}

// --- FORMA CONDITIONAL CONFIG ---
export const FORMA_PARAMETRE_CONFIG: Record<string, { etiket1: string; etiket2: string; etiket3: string; etiket4: string; etiket5: string; etiket6: string }> = {
  EL_KALIBI: {
    etiket1: 'Kalıp Sıcaklığı',
    etiket2: '',
    etiket3: 'Kalıp Süresi',
    etiket4: '',
    etiket5: '',
    etiket6: '',
  },
  CORTESE: {
    etiket1: 'Buhar Odası Kalış Süresi 1',
    etiket2: 'İstenen Buhar Basıncı 1',
    etiket3: 'Buhar Odası Kalış Süresi 2',
    etiket4: 'İstenen Buhar Basıncı 2',
    etiket5: 'Isı',
    etiket6: '',
  },
  TECNOPEA: {
    etiket1: 'Tünel Sıcaklığı',
    etiket2: 'Tünel Süresi',
    etiket3: 'Buhar Basıncı',
    etiket4: 'Buhar Süresi',
    etiket5: 'Press Sıcaklığı',
    etiket6: 'Press Süresi',
  },
};
