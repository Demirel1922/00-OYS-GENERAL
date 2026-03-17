import type { AksesuarHareket, AksesuarTanimlar } from "./types";
import { DEFAULT_TANIMLAR } from "./constants";

export const STORAGE_KEYS = {
  TANIMLAR: "erp_aksesuar_tanimlar",
  HAREKETLER: "erp_aksesuar_hareketleri",
} as const;

/* ── Tanımlar ─────────────────────────────────────────────── */

export function getOrInitTanimlar(): AksesuarTanimlar {
  const stored = localStorage.getItem(STORAGE_KEYS.TANIMLAR);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEYS.TANIMLAR, JSON.stringify(DEFAULT_TANIMLAR));
  return DEFAULT_TANIMLAR;
}

/* ── Hareketler CRUD ──────────────────────────────────────── */

export function getHareketler(): AksesuarHareket[] {
  const stored = localStorage.getItem(STORAGE_KEYS.HAREKETLER);
  return stored ? JSON.parse(stored) : [];
}

export function saveHareketler(list: AksesuarHareket[]): void {
  localStorage.setItem(STORAGE_KEYS.HAREKETLER, JSON.stringify(list));
}

export function appendHareket(record: AksesuarHareket): void {
  const list = getHareketler();
  list.push(record);
  saveHareketler(list);
}

/* ── Yardımcılar ──────────────────────────────────────────── */

export function normalizeOptional(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  return str === "" ? undefined : str;
}

/**
 * Stok hesaplama.
 * Depo + aksesuarTipi + aksesuarDetayi + boyut zorunlu eşleşme.
 * renk ve ozellik: SADECE değer verilmişse filtre uygulanır,
 * undefined/boş ise o filtre atlanır (tüm renkler/özellikler dahil edilir).
 */
export function computeStock(params: {
  depo: string;
  aksesuarTipi: string;
  aksesuarDetayi: string;
  boyut: string;
  renk?: string;
  ozellik?: string;
}): number {
  const { depo, aksesuarTipi, aksesuarDetayi, boyut, renk, ozellik } = params;
  const hareketler = getHareketler();
  let stock = 0;

  for (const h of hareketler) {
    // Zorunlu eşleşmeler
    if (h.depo !== depo) continue;
    if (h.aksesuarTipi !== aksesuarTipi) continue;
    if (h.aksesuarDetayi !== aksesuarDetayi) continue;
    if (h.boyut !== boyut) continue;

    // Opsiyonel filtreler: sadece ikisi de dolu ise karşılaştır
    if (renk && h.renk && renk !== h.renk) continue;
    if (ozellik && h.ozellik && ozellik !== h.ozellik) continue;

    stock += h.islemTipi === "GİRİŞ" ? h.miktar : -h.miktar;
  }
  return stock;
}

/**
 * Mükerrer kayıt kontrolü.
 * Son `windowMinutes` dakika içinde aynı anahtar + miktar varsa true döner.
 */
export function checkDuplicate(
  newRecord: Omit<AksesuarHareket, "id" | "hareketNo" | "createdAt" | "createdBy" | "updatedAt">,
  windowMinutes = 180,
): boolean {
  const hareketler = getHareketler();
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const TOLERANCE = 0.000001;

  const duplicateKey = (h: Pick<AksesuarHareket, "islemTipi" | "islemAltSecenegi" | "depo" | "aksesuarTipi" | "aksesuarDetayi" | "boyut" | "renk" | "ozellik" | "tedarikci" | "musteriSiparisNo">) =>
    `${h.islemTipi}|${h.islemAltSecenegi}|${h.depo}|${h.aksesuarTipi}|${h.aksesuarDetayi}|${h.boyut}|${h.renk ?? "null"}|${h.ozellik ?? "null"}|${h.tedarikci}|${h.musteriSiparisNo ?? "null"}`;

  const newKey = duplicateKey(newRecord);

  for (const h of hareketler) {
    const hTime = new Date(h.createdAt).getTime();
    if (now - hTime > windowMs) continue;
    if (duplicateKey(h) !== newKey) continue;
    if (Math.abs(h.miktar - newRecord.miktar) < TOLERANCE) return true;
  }
  return false;
}
