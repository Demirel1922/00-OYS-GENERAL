import Dexie from 'dexie';
import type { SalesOrder, PriceAuditLog } from '@/modules/sales-orders/domain/types';

// Sipariş sayaç tipi
export interface OrderCounter {
  id?: number;
  year: number;
  lastSeq: number;
}

// Numune sayaç tipi — her grup kodu için ayrı sayaç
export interface NumuneCounter {
  id?: number;
  year: number;          // Tam yıl: 2026
  cinsiyetKodu: string;  // "0"-"9" grup kodu
  lastSira: string;      // Son kullanılan sıra: "" (henüz yok), "A0", "A1", ... "Z9"
}

export class OysDatabase extends Dexie {
  salesOrders!: Dexie.Table<SalesOrder>;
  priceAuditLogs!: Dexie.Table<PriceAuditLog>;
  orderCounter!: Dexie.Table<OrderCounter>;
  numuneCounter!: Dexie.Table<NumuneCounter>;

  constructor() {
    super('OysDatabase');
    
    this.version(1).stores({
      salesOrders: '++id, order_no, customer_id, status, order_date, requested_termin, shipping_status',
      priceAuditLogs: '++id, order_id, changed_at',
    });

    this.version(2).stores({
      salesOrders: '++id, order_no, customer_id, status, order_date, requested_termin, shipped_at',
      priceAuditLogs: '++id, order_id, changed_at',
    }).upgrade((tx) => {
      return tx.table('salesOrders').toCollection().modify((order: any) => {
        if (order.status === 'shipped' && !order.shipped_at) {
          order.shipped_at = order.updated_at;
        }
        if (order.status === 'delivered') {
          order.status = 'shipped';
          if (!order.shipped_at) {
            order.shipped_at = order.updated_at;
          }
        }
        delete order.shipping_status;
      });
    });

    // v3: orderCounter tablosu eklendi
    this.version(3).stores({
      salesOrders: '++id, order_no, customer_id, status, order_date, requested_termin, shipped_at',
      priceAuditLogs: '++id, order_id, changed_at',
      orderCounter: '++id, year',
    });

    // v4: numuneCounter tablosu eklendi (eski global sayaç — v5 ile değiştirildi)
    this.version(4).stores({
      salesOrders: '++id, order_no, customer_id, status, order_date, requested_termin, shipped_at',
      priceAuditLogs: '++id, order_id, changed_at',
      orderCounter: '++id, year',
      numuneCounter: '++id, year',
    });

    // v5: numuneCounter cinsiyet bazlı compound index
    this.version(5).stores({
      salesOrders: '++id, order_no, customer_id, status, order_date, requested_termin, shipped_at',
      priceAuditLogs: '++id, order_id, changed_at',
      orderCounter: '++id, year',
      numuneCounter: '++id, [year+cinsiyetKodu]',
    }).upgrade(tx => {
      // Eski global sayaç kayıtlarını temizle — cinsiyet bazlı yenileri oluşturulacak
      return tx.table('numuneCounter').toCollection().delete();
    });
  }
}

export const db = new OysDatabase();

/**
 * Sipariş numarası üretici
 * Format: YYMMMNNNNN → 26 039 0001
 * YY = Yılın son 2 hanesi
 * MMM = Müşteri no (ormeciMusteriNo), 3 hane
 * NNNN = Global sıra numarası, 4 hane (yıl değişince sıfırlanır)
 * Çakışma kontrolü: Üretilen numara mevcutsa bir sonrakine atlar
 */
export async function generateOrderNo(musteriNo: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yy = String(currentYear).slice(-2); // "26"
  
  // Müşteri no'yu 3 haneye formatla
  const numericPart = musteriNo.replace(/\D/g, '');
  const mmm = numericPart.padStart(3, '0').slice(-3);
  
  // Sayacı al veya oluştur
  let counter = await db.orderCounter.where('year').equals(currentYear).first();
  
  if (!counter) {
    const id = await db.orderCounter.add({ year: currentYear, lastSeq: 0 });
    counter = { id: id as number, year: currentYear, lastSeq: 0 };
  }
  
  // Çakışma kontrolü ile numara üret
  let seq = counter.lastSeq + 1;
  let orderNo = `${yy}${mmm}${String(seq).padStart(4, '0')}`;
  
  // Mevcut siparişlerde bu sıra numarası (son 4 hane) kullanılmış mı kontrol et
  // Müşteri farketmez, sadece sıra numarasına bak
  let allOrders = await db.salesOrders.toArray();
  const usedSeqs = new Set(
    allOrders
      .map(o => o.order_no)
      .filter(no => no.startsWith(yy))
      .map(no => parseInt(no.slice(-4), 10))
      .filter(n => !isNaN(n))
  );
  
  while (usedSeqs.has(seq)) {
    seq++;
  }
  
  orderNo = `${yy}${mmm}${String(seq).padStart(4, '0')}`;
  
  // Sayacı güncelle
  await db.orderCounter.update(counter.id!, { lastSeq: seq });
  
  return orderNo;
}

/**
 * Mevcut yılın sipariş sayacını oku
 */
export async function getOrderCounter(): Promise<number> {
  const currentYear = new Date().getFullYear();
  const counter = await db.orderCounter.where('year').equals(currentYear).first();
  return counter?.lastSeq || 0;
}

/**
 * Mevcut yılın sipariş sayacını elle güncelle
 */
export async function setOrderCounter(newSeq: number): Promise<void> {
  const currentYear = new Date().getFullYear();
  let counter = await db.orderCounter.where('year').equals(currentYear).first();
  if (counter) {
    await db.orderCounter.update(counter.id!, { lastSeq: newSeq });
  } else {
    await db.orderCounter.add({ year: currentYear, lastSeq: newSeq });
  }
}

// ============================================
// NUMUNE NUMARASI SAYAÇ FONKSİYONLARI
// ============================================
// Format: [GRUP_KODU][YIL_SON_HANE][HARF][SAYI]
// Örnek: 16A0, 26B3, 36C9
// Sıra ilerleyişi: A0→A1→...→A9→B0→B1→...→Z9
// Harfler: A-Z (İngilizce alfabe)
// Rakamlar: 0-9
// Her grup için kapasite: 26 × 10 = 260
// ============================================

/**
 * Bir sonraki numune sırasını hesapla
 * "" → A0 (ilk numune), A9 → B0, Z9 → null (kapasite dolu)
 */
function nextSira(current: string): string | null {
  // Boş veya geçersiz → ilk numune A0
  if (!current || !/^[A-Z]\d$/.test(current)) {
    return 'A0';
  }
  // Z9 ise kapasite dolu — wrap-around yapmıyoruz
  if (current === 'Z9') {
    return null;
  }
  let harf = current.charAt(0);
  let sayi = parseInt(current.slice(1), 10);
  sayi++;
  if (sayi > 9) {
    sayi = 0;
    harf = String.fromCharCode(harf.charCodeAt(0) + 1);
  }
  return `${harf}${sayi}`;
}

/**
 * Sıra stringini sayısal index'e çevir (çakışma kontrolü için)
 * "" → -1 (henüz kullanılmadı)
 * A0=0, A1=1, ... A9=9, B0=10, B1=11, ... Z9=259
 */
function siraToIndex(sira: string): number {
  if (!sira || !/^[A-Z]\d$/.test(sira)) return -1;
  const harf = sira.charAt(0);
  const sayi = parseInt(sira.slice(1), 10);
  return (harf.charCodeAt(0) - 65) * 10 + sayi;
}

/** Maksimum sıra sayısı: 26 harf × 10 rakam = 260 (A0'dan Z9'a) */
const MAX_SIRA_COUNT = 260;

/**
 * Numune numarası üret (önizleme — sayacı ilerletmez)
 * cinsiyetKodu: "0"-"9"
 * Dönen format: [grupKodu][yılSonHane][harf][sayı] → ör. "16A0"
 *
 * Her grup kodu kendi bağımsız sıra sayacına sahiptir.
 * Yıl değişince her grup A0'dan yeniden başlar.
 * NOT: Bu fonksiyon sayacı güncellemez. Kayıt sırasında
 * commitNumuneSira() çağrılarak sayaç kalıcı olarak ilerletilmelidir.
 */
export async function generateNumuneNo(cinsiyetKodu: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const yilHanesi = String(currentYear).slice(-1); // Son hane: 2026 → "6"

  // localStorage'dan göç kontrolü (tek seferlik)
  const legacySira = localStorage.getItem('oys_numune_sira');
  if (legacySira) {
    localStorage.removeItem('oys_numune_sira');
  }

  // Grup bazlı sayacı al veya oluştur
  let counter = await db.numuneCounter.where('[year+cinsiyetKodu]').equals([currentYear, cinsiyetKodu]).first();
  if (!counter) {
    const id = await db.numuneCounter.add({ year: currentYear, cinsiyetKodu, lastSira: '' });
    counter = { id: id as number, year: currentYear, cinsiyetKodu, lastSira: '' };
  }

  // Bir sonraki sırayı hesapla
  const yeniSira = nextSira(counter.lastSira);

  // Kapasite kontrolü — Z9 sonrası taşma engeli
  if (yeniSira === null) {
    throw new Error('KAPASITE_DOLU');
  }

  // Çakışma kontrolü: mevcut numune listesindeki aynı grup+yıl numaraları
  const mevcutListe = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
  const usedSiras = new Set(
    mevcutListe
      .map((n: any) => n.numuneNo || n.generalInfo?.numuneNo || '')
      .filter((no: string) => no.length >= 3 && no.charAt(0) === cinsiyetKodu && no.charAt(1) === yilHanesi)
      .map((no: string) => no.slice(2)) // Harf+Sayı kısmı
  );

  let finalSira: string | null = yeniSira;
  let safety = 0;
  while (finalSira && usedSiras.has(finalSira) && safety < MAX_SIRA_COUNT) {
    finalSira = nextSira(finalSira);
    safety++;
  }

  // Çakışma atlatma sırasında da kapasite kontrolü
  if (finalSira === null) {
    throw new Error('KAPASITE_DOLU');
  }

  // Sayacı burada güncellemiyoruz — kayıt sırasında commitNumuneSira() çağrılacak

  return `${cinsiyetKodu}${yilHanesi}${finalSira}`;
}

/**
 * Numune kaydedildikten sonra sayacı kalıcı olarak ilerlet.
 * numuneNo: kaydedilen numune numarası (ör. "16A0")
 * 1. karakterden grup kodu, kalan kısımdan sırayı çıkarıp
 * ilgili grubun sayacını günceller.
 */
export async function commitNumuneSira(numuneNo: string): Promise<void> {
  if (!numuneNo || numuneNo.length < 3) return;
  const cinsiyetKodu = numuneNo.charAt(0); // "16A0" → "1"
  const sira = numuneNo.slice(2); // "16A0" → "A0"
  // Geçersiz format koruması
  if (!/^[A-Z]\d$/.test(sira)) return;
  if (!/^\d$/.test(cinsiyetKodu)) return;
  const currentYear = new Date().getFullYear();
  let counter = await db.numuneCounter.where('[year+cinsiyetKodu]').equals([currentYear, cinsiyetKodu]).first();
  if (counter) {
    // Sadece ileri gidiyorsa güncelle (geri alma engeli)
    if (siraToIndex(sira) > siraToIndex(counter.lastSira)) {
      await db.numuneCounter.update(counter.id!, { lastSira: sira });
    }
  } else {
    await db.numuneCounter.add({ year: currentYear, cinsiyetKodu, lastSira: sira });
  }
}

/**
 * Belirli bir grubun mevcut yıldaki numune sayacını oku
 */
export async function getNumuneCounter(cinsiyetKodu: string): Promise<string> {
  const currentYear = new Date().getFullYear();
  const counter = await db.numuneCounter.where('[year+cinsiyetKodu]').equals([currentYear, cinsiyetKodu]).first();
  return counter?.lastSira || '';
}

/**
 * Belirli bir grubun mevcut yıldaki numune sayacını elle güncelle
 */
export async function setNumuneCounter(cinsiyetKodu: string, newSira: string): Promise<void> {
  const currentYear = new Date().getFullYear();
  let counter = await db.numuneCounter.where('[year+cinsiyetKodu]').equals([currentYear, cinsiyetKodu]).first();
  if (counter) {
    await db.numuneCounter.update(counter.id!, { lastSira: newSira });
  } else {
    await db.numuneCounter.add({ year: currentYear, cinsiyetKodu, lastSira: newSira });
  }
}

export async function addOrder(order: Omit<SalesOrder, 'id'>): Promise<string> {
  try {
    const id = await db.salesOrders.add(order as SalesOrder);
    return id;
  } catch (error) {
    console.error('Dexie addOrder error:', error);
    throw new Error('Sipariş veritabanına kaydedilirken hata oluştu.');
  }
}

export async function updateOrder(id: string, changes: Partial<SalesOrder>): Promise<void> {
  try {
    await db.salesOrders.update(id, {
      ...changes,
      updated_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Dexie updateOrder error:', error);
    throw new Error('Sipariş güncellenirken hata oluştu.');
  }
}

export async function deleteOrder(id: string): Promise<void> {
  try {
    await db.salesOrders.delete(id);
  } catch (error) {
    console.error('Dexie deleteOrder error:', error);
    throw new Error('Sipariş silinirken hata oluştu.');
  }
}

export async function getOrder(id: string): Promise<SalesOrder | undefined> {
  try {
    let order = await db.salesOrders.get(id);
    if (!order) {
      order = await db.salesOrders.where('order_no').equals(id).first();
    }
    if (!order && !isNaN(Number(id))) {
      order = await db.salesOrders.get(Number(id));
    }
    return order;
  } catch (error) {
    console.error('Dexie getOrder error:', error);
    throw new Error('Sipariş getirilirken hata oluştu.');
  }
}

export async function getAllOrders(): Promise<SalesOrder[]> {
  try {
    return await db.salesOrders.toArray();
  } catch (error) {
    console.error('Dexie getAllOrders error:', error);
    throw new Error('Siparişler getirilirken hata oluştu.');
  }
}

export async function getOrdersByStatus(status: string): Promise<SalesOrder[]> {
  try {
    return await db.salesOrders.where('status').equals(status).toArray();
  } catch (error) {
    console.error('Dexie getOrdersByStatus error:', error);
    throw new Error('Siparişler getirilirken hata oluştu.');
  }
}

export async function checkOrderNoExists(orderNo: string): Promise<boolean> {
  try {
    const count = await db.salesOrders.where('order_no').equals(orderNo).count();
    return count > 0;
  } catch (error) {
    console.error('Dexie checkOrderNoExists error:', error);
    throw new Error('Sipariş numarası kontrol edilirken hata oluştu.');
  }
}

export async function addPriceAuditLog(log: Omit<PriceAuditLog, 'id'>): Promise<string> {
  try {
    const id = await db.priceAuditLogs.add(log as PriceAuditLog);
    return id;
  } catch (error) {
    console.error('Dexie addPriceAuditLog error:', error);
    throw new Error('Fiyat değişiklik kaydı oluşturulurken hata oluştu.');
  }
}

export async function getPriceAuditLogsByOrderId(orderId: string): Promise<PriceAuditLog[]> {
  try {
    return await db.priceAuditLogs.where('order_id').equals(orderId).toArray();
  } catch (error) {
    console.error('Dexie getPriceAuditLogsByOrderId error:', error);
    throw new Error('Fiyat değişiklik kayıtları getirilirken hata oluştu.');
  }
}
