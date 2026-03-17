import type { IplikHareket, IplikHareketFormData, IplikTanimlar } from "./types";
import { getOrInitTanimlar, appendHareket, normalizeOptional, computeStock, checkDuplicate } from "./storage";
import { ALT_TIP_TO_TIP } from "./constants";

// Mock API - localStorage kullanarak
export async function getSeed(): Promise<IplikTanimlar> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return getOrInitTanimlar();
}

export type CreateMovementResult =
  | { ok: true; record: IplikHareket }
  | { ok: false; code: "DUPLICATE_WARNING" | "INSUFFICIENT_STOCK" | "VALIDATION_ERROR"; message: string; requiresConfirm?: boolean; currentStock?: number; requestedAmount?: number; };



export async function createMovement(payload: IplikHareketFormData): Promise<CreateMovementResult> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const depoId = normalizeOptional(payload.depoId);
  const lotNo = normalizeOptional(payload.lotNo);
  const satinalmaFisNo = normalizeOptional(payload.satinalmaFisNo);
  const siparisNo = normalizeOptional(payload.siparisNo);
  const tedarikciIrsNo = normalizeOptional(payload.tedarikciIrsNo);
  const tedarikciArtikel = normalizeOptional(payload.tedarikciArtikel);
  const ozellik = normalizeOptional(payload.ozellik);
  const not = normalizeOptional(payload.not);
  // kaynakHareketId kullanılabilir ama şimdilik sadece bilgi amaçlı

  const tip = ALT_TIP_TO_TIP[payload.altTip];
  const miktarKg = parseFloat(payload.miktarText.replace(",", "."));

  // Check stock for çıkış
  if (tip === "ÇIKIŞ") {
    const currentStock = computeStock({
      iplikDetayId: payload.iplikDetayId,
      iplikKalinlik: payload.iplikKalinlik,
      renkKod: payload.renkKod,
      renkId: payload.renkId,
      depoId,
      lotNo,
    });

    if (currentStock < miktarKg) {
      return {
        ok: false,
        code: "INSUFFICIENT_STOCK",
        message: `Yetersiz stok. Mevcut: ${currentStock.toFixed(3)} kg, Talep: ${miktarKg.toFixed(3)} kg`,
        currentStock,
        requestedAmount: miktarKg,
      };
    }
  }

  // Check duplicate
  const recordForDuplicate: Omit<IplikHareket, "id" | "createdAt" | "createdBy"> = {
    tip,
    altTip: payload.altTip,
    tedarikci: payload.tedarikci,
    depoId,
    iplikDetayId: payload.iplikDetayId,
    iplikCinsiId: payload.iplikCinsiId,
    iplikCinsiAltKey: payload.iplikCinsiAltKey,
    iplikKalinlik: payload.iplikKalinlik,
    renkKod: payload.renkKod,
    renkId: payload.renkId,
    renkAdi: payload.renkAdi,
    tedarikciArtikel,
    lotNo,
    ozellik,
    not,
    evrakTarihi: payload.evrakTarihi,
    miktarKg,
    satinalmaFisNo,
    siparisNo,
    tedarikciIrsNo,
  };

  if (!payload.confirmOverride && checkDuplicate(recordForDuplicate)) {
    return {
      ok: false,
      code: "DUPLICATE_WARNING",
      message: "Bu kayıt son 3 saat içinde girilmiş (miktar aynı). Devam edilsin mi?",
      requiresConfirm: true,
    };
  }

  // Create record
  const newRecord: IplikHareket = {
    id: crypto.randomUUID(),
    tip,
    altTip: payload.altTip,
    satinalmaFisNo,
    siparisNo,
    tedarikciIrsNo,
    tedarikci: payload.tedarikci,
    depoId,
    iplikDetayId: payload.iplikDetayId,
    iplikCinsiId: payload.iplikCinsiId,
    iplikCinsiAltKey: payload.iplikCinsiAltKey,
    iplikKalinlik: payload.iplikKalinlik,
    renkKod: payload.renkKod,
    renkId: payload.renkId,
    renkAdi: payload.renkAdi,
    tedarikciArtikel,
    lotNo,
    ozellik,
    not,
    evrakTarihi: payload.evrakTarihi,
    miktarKg,
    createdBy: payload.createdBy || "unknown",
    createdAt: new Date().toISOString(),
  };

  appendHareket(newRecord);
  return { ok: true, record: newRecord };
}
