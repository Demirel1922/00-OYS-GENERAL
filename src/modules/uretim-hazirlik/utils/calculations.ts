// ============================================================
// OYS-ERP Üretim Hazırlık - Hesaplama & Status Utilities
// Kaynak: Excel Gramajlar formülleri
// ============================================================

import type { GramajCalismasi, UretimHazirlikKaydi, UretimHazirlikStatus, AuditLog } from '../types';

// --- GRAMAJ HESAPLAMALARI ---

/** Tek satır: Kullanılan Miktar = Örgüden Önce - Örgüden Sonra */
export function hesaplaKullanilanMiktar(once: string, sonra: string): number {
  const o = parseFloat(once) || 0;
  const s = parseFloat(sonra) || 0;
  return Math.max(0, o - s);
}

/** Tek satır: 1 Düzine = 6 Çift × 2 */
export function hesapla1Duzine(miktar6Cift: number): number {
  return miktar6Cift * 2;
}

/** Tüm gramaj toplamlarını yeniden hesapla */
export function hesaplaGramajToplamlari(gramaj: GramajCalismasi): GramajCalismasi {
  // Satır bazlı hesaplama
  const satirlar = gramaj.satirlar.map(s => {
    const k6 = hesaplaKullanilanMiktar(s.orgudenOnceAgirlik, s.orgudenSonraAgirlik);
    return { ...s, kullanilanMiktar6Cift: k6, kullanilanMiktar1Duzine: hesapla1Duzine(k6) };
  });

  // Toplamlar
  const toplam6Cift = satirlar.reduce((sum, s) => sum + s.kullanilanMiktar6Cift, 0);
  const toplam1Duzine = satirlar.reduce((sum, s) => sum + s.kullanilanMiktar1Duzine, 0);

  const burunDikisiNum = parseFloat(gramaj.burunDikisi) || 0;
  const birCiftNum = parseFloat(gramaj.birCiftAgirligi) || 0;

  const genelToplam6Cift = toplam6Cift + burunDikisiNum;
  const genelToplam1Duzine = toplam1Duzine + burunDikisiNum;
  const birDuzineAgirligi = birCiftNum * 12;
  const fark6Cift = genelToplam6Cift - (birCiftNum * 6);
  const fark1Duzine = genelToplam1Duzine - birDuzineAgirligi;

  return {
    ...gramaj,
    satirlar,
    toplam6Cift,
    toplam1Duzine,
    birDuzineAgirligi,
    genelToplam6Cift,
    genelToplam1Duzine,
    fark6Cift,
    fark1Duzine,
  };
}

// --- STATUS MACHINE ---

export function canTransition(from: UretimHazirlikStatus, to: UretimHazirlikStatus, isAdmin: boolean): boolean {
  if (from === 'NEW' && to === 'IN_PROGRESS') return true;
  if (from === 'IN_PROGRESS' && to === 'COMPLETED_LOCKED') return true;
  if (from === 'COMPLETED_LOCKED' && to === 'REOPENED' && isAdmin) return true;
  if (from === 'REOPENED' && to === 'IN_PROGRESS') return true;
  return false;
}

// --- AUDIT LOG ---

export function createLog(
  kullanici: string,
  aksiyon: AuditLog['aksiyon'],
  detay: string,
  onceki?: string,
  yeni?: string
): AuditLog {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    tarih: new Date().toISOString(),
    kullanici,
    aksiyon,
    detay,
    oncekiDeger: onceki,
    yeniDeger: yeni,
  };
}

// --- VALIDATION ---

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateForApproval(kayit: UretimHazirlikKaydi): ValidationResult {
  const errors: string[] = [];

  // Ürün Kartı
  if (!kayit.urunKarti.musteriKodu) errors.push('Müşteri Kodu boş');
  if (!kayit.urunKarti.ormeciArtikelKodu) errors.push('Örmeci Artikel Kodu boş');
  if (!kayit.urunKarti.urunTanimi) errors.push('Ürün Tanımı boş');
  if (kayit.urunKarti.iplikler.filter(ip => ip.iplikYeri).length === 0) {
    errors.push('En az 1 iplik satırı doldurulmalı');
  }

  // Gramaj
  const doldurulanGramaj = kayit.gramaj.satirlar.filter(s => s.orgudenOnceAgirlik || s.orgudenSonraAgirlik);
  if (doldurulanGramaj.length === 0) {
    errors.push('Gramaj sekmesinde en az 1 satırda ağırlık girilmeli');
  }

  // Yıkama
  if (kayit.urunKarti.yikama && kayit.urunKarti.yikama !== 'Yok') {
    const doldurulanAdim = kayit.yikama.adimlar.filter(a =>
      a.yumusaticiSuresi || a.buharSuresi || a.kurutmaSuresi
    );
    if (doldurulanAdim.length === 0) {
      errors.push('Yıkama tipi "Yok" değilse en az 1 adım doldurulmalı');
    }
  }

  // Forma
  if (!kayit.forma.formaCesidi) {
    errors.push('Forma çeşidi seçilmeli');
  }

  return { valid: errors.length === 0, errors };
}

// --- KAYIT ID ÜRETİCİ ---
export function generateId(): string {
  return `UH-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

// --- CONSTANTS ---
export const MAX_IPLIK_ROW_COUNT = 40;
export const DEFAULT_IPLIK_ROW_COUNT = 10;
export const A5_PAGE_SIZE: [number, number] = [148, 210];

// --- STORAGE KEY ---
export const STORAGE_KEY = 'oys_uretim_hazirlik_listesi';
