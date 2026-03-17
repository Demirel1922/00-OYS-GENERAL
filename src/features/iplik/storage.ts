import type { IplikHareket, IplikTanimlar } from "./types";
import { DEFAULT_TANIMLAR } from "./constants";

export const STORAGE_KEYS = {
  TANIMLAR: "erp_tanimlar",
  HAREKETLER: "erp_iplik_hareketleri",
} as const;

export function getOrInitTanimlar(): IplikTanimlar {
  const stored = localStorage.getItem(STORAGE_KEYS.TANIMLAR);
  if (stored) return JSON.parse(stored);
  localStorage.setItem(STORAGE_KEYS.TANIMLAR, JSON.stringify(DEFAULT_TANIMLAR));
  return DEFAULT_TANIMLAR;
}

export function getHareketler(): IplikHareket[] {
  const stored = localStorage.getItem(STORAGE_KEYS.HAREKETLER);
  return stored ? JSON.parse(stored) : [];
}

export function saveHareketler(list: IplikHareket[]): void {
  localStorage.setItem(STORAGE_KEYS.HAREKETLER, JSON.stringify(list));
}

export function appendHareket(record: IplikHareket): void {
  const list = getHareketler();
  list.push(record);
  saveHareketler(list);
}

export function normalizeOptional(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  return str === "" ? undefined : str;
}

export function computeStock(params: {
  iplikDetayId: string;
  iplikKalinlik: string;
  renkKod: string;
  renkId: string;
  depoId?: string;
  lotNo?: string;
}): number {
  const { iplikDetayId, iplikKalinlik, renkKod, renkId, depoId, lotNo } = params;
  const hareketler = getHareketler();
  let stock = 0;

  for (const h of hareketler) {
    if (h.iplikDetayId !== iplikDetayId) continue;
    if (h.iplikKalinlik !== iplikKalinlik) continue;
    if (h.renkKod !== renkKod) continue;
    if (h.renkId !== renkId) continue;

    if (depoId !== undefined && h.depoId !== depoId) continue;
    if (lotNo !== undefined && h.lotNo !== lotNo) continue;

    stock += h.tip === "GİRİŞ" ? h.miktarKg : -h.miktarKg;
  }
  return stock;
}

export function checkDuplicate(
  newRecord: Omit<IplikHareket, "id" | "createdAt" | "createdBy">,
  windowMinutes = 180
): boolean {
  const hareketler = getHareketler();
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const TOLERANCE = 0.000001;

  const duplicateKey = (h: any) =>
    `${h.tip}|${h.altTip}|${h.iplikDetayId}|${h.iplikKalinlik}|${h.renkKod}|${h.renkId}|${h.depoId ?? "null"}|${h.lotNo ?? "null"}|${h.satinalmaFisNo ?? "null"}|${h.siparisNo ?? "null"}`;

  const newKey = duplicateKey(newRecord as any);

  for (const h of hareketler) {
    const hTime = new Date(h.createdAt).getTime();
    if (now - hTime > windowMs) continue;
    if (duplicateKey(h) !== newKey) continue;
    if (Math.abs(h.miktarKg - newRecord.miktarKg) < TOLERANCE) return true;
  }
  return false;
}
