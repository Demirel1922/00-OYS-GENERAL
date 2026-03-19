export type OrderStatus = 'draft' | 'approved' | 'shipped' | 'cancelled';
export type Currency = 'TRY' | 'EUR' | 'USD';

// SockType artık dinamik - lookupStore TIP'ten geliyor
export type SockType = string;

export interface SalesOrderLine {
  id: string;
  artikel_no?: string; // Örmeci Artikel No — eski kayıtlarda olmayabilir
  product_name: string;
  gender: string; // Dinamik - lookupStore CINSIYET'ten geliyor
  sock_type: string; // Dinamik - lookupStore TIP'ten geliyor
  color: string; // Dinamik - renkStore'dan geliyor
  size: string;
  quantity: number;
  price_unit: string;
  line_total_pairs: number;
  unit_price: string;
  currency?: Currency;
  line_amount: string;
  conversion_rate?: number;
}

export interface SalesOrder {
  id: string;
  order_no: string;
  customer_id: string;
  customer_name: string;
  customer_po_no?: string;
  order_date: string;
  requested_termin: string;
  confirmed_termin: string;
  shipped_at?: string;
  payment_terms: string;
  incoterm?: string;
  currency: Currency;
  unit_price: string;
  lines: SalesOrderLine[];
  total_pairs: number;
  total_amount: string;
  status: OrderStatus;
  notes?: string;
  internal_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface PriceAuditLog {
  id: string;
  order_id: string;
  field_name: string;
  old_value: string;
  new_value: string;
  changed_by: string;
  changed_at: string;
}

export const CURRENCIES: { value: Currency; label: string }[] = [
  { value: 'TRY', label: 'TRY - Türk Lirası' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'USD', label: 'USD - US Dolar' },
];

// SOCK_TYPE_OPTIONS ve GENDER_OPTIONS artık dinamik - lookupStore'dan geliyor
// Aşağıdaki sabitler sadece eski verilerle geriye uyumluluk ve PDF/Excel export için korunuyor

export const SOCK_TYPE_LABELS: Record<string, string> = {
  soket: 'Soket',
  kisa_konc: 'Kısa Konç',
  diz_alti: 'Diz Altı',
  diz_ustu: 'Diz Üstü',
  babet: 'Babet',
  termal: 'Termal',
  // Dinamik lookup'tan gelen yeni tipler için fallback: değerin kendisi döner
};

export const GENDER_LABELS_EN: Record<string, string> = {
  male: 'Male',
  female: 'Female',
  child: 'Child',
  baby: 'Baby',
  Erkek: 'Male',
  Kadın: 'Female',
  Çocuk: 'Child',
  Bebek: 'Baby',
  Unisex: 'Unisex',
};

// ============================================
// DISPLAY LABEL RESOLVERS
// ============================================
// Numune modülü cinsiyet kodları ('1','2'...) ve çorap tipi kodları ('PATIK','KISA_KONC'...)
// Sipariş ekranlarında kullanıcıya okunabilir isim olarak gösterilmeli.
// Eğer değer zaten okunabilir (lookupStore ad değeri) ise aynen döner.

const CINSIYET_CODE_MAP: Record<string, string> = {
  '1': 'Erkek', '2': 'Kadın', '3': 'Çocuk', '4': 'Bebek',
  '5': 'Unisex', '6': 'Külotlu', '7': 'Erkek 2', '8': 'Kadın 2',
  '9': 'Bebek-Çocuk 2', '0': 'Unisex 2',
};

const CORAP_TIPI_CODE_MAP: Record<string, string> = {
  'PATIK': 'Patik', 'KISA_KONC': 'Kısa Konç', 'NORMAL_KONC': 'Normal Konç',
  'CETIK': 'Çetik', 'DIZALTI': 'Dizaltı', 'DIZUSTU': 'Dizüstü',
  'KULOTLU': 'Külotlu Çorap',
};

/** Ham cinsiyet kodu veya adını okunabilir label'a çevirir */
export function resolveGenderLabel(value: string | undefined | null): string {
  if (!value) return '-';
  return CINSIYET_CODE_MAP[value] || value;
}

/** Ham çorap tipi kodu veya adını okunabilir label'a çevirir */
export function resolveSockTypeLabel(value: string | undefined | null): string {
  if (!value) return '-';
  return CORAP_TIPI_CODE_MAP[value] || SOCK_TYPE_LABELS[value] || value;
}

export const PRICE_UNITS = [
  { value: 'pair', label: 'Çift' },
  { value: 'dozen', label: 'Düzine' },
  { value: 'box', label: 'Koli' },
];

export const PRICE_UNIT_MULTIPLIERS: Record<string, number> = {
  pair: 1,
  dozen: 12,
  box: 24,
};

export const PRICE_UNIT_LABELS: Record<string, string> = {
  pair: 'Çift / Pair',
  dozen: 'Düzine / Dozen',
  box: 'Koli / Box',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  draft: 'Taslak',
  approved: 'Onaylandı',
  shipped: 'Gönderildi',
  cancelled: 'İptal Edildi',
};

export const STATUS_LABELS_EN: Record<OrderStatus, string> = {
  draft: 'Draft',
  approved: 'Approved',
  shipped: 'Shipped',
  cancelled: 'Cancelled',
};

export const PAYMENT_TERMS_EN: Record<string, string> = {
  '30 gün': '30 Days',
  '60 gün': '60 Days',
  '90 gün': '90 Days',
  'Peşin': 'Cash',
  'Yarım Peşin': 'Half Cash',
};

// MOCK_CUSTOMERS KALDIRILDI - artık musteriStore'dan geliyor
// MOCK_PAYMENT_TERMS KALDIRILDI - artık müşteri kartından otomatik geliyor
// MOCK_SIZES KALDIRILDI - artık lookupStore BEDEN'den geliyor
