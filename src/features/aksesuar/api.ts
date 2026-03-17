import type { AksesuarHareket, AksesuarHareketFormData, AksesuarTanimlar } from "./types";
import { getOrInitTanimlar, appendHareket, normalizeOptional, computeStock, checkDuplicate } from "./storage";
import { ALT_TO_TIP } from "./constants";

// Mock API - localStorage kullanarak (İplik modülüyle aynı pattern)
export async function getSeed(): Promise<AksesuarTanimlar> {
  await new Promise(resolve => setTimeout(resolve, 100));
  return getOrInitTanimlar();
}

export type CreateMovementResult =
  | { ok: true; record: AksesuarHareket }
  | { ok: false; code: "DUPLICATE_WARNING" | "INSUFFICIENT_STOCK" | "VALIDATION_ERROR"; message: string; requiresConfirm?: boolean; currentStock?: number; requestedAmount?: number };

export async function createMovement(payload: AksesuarHareketFormData): Promise<CreateMovementResult> {
  await new Promise(resolve => setTimeout(resolve, 200));

  const ozellik = normalizeOptional(payload.ozellik);
  const aciklama = normalizeOptional(payload.aciklama);
  const renk = normalizeOptional(payload.renk);
  const tedarikciArtikelKodu = normalizeOptional(payload.tedarikciArtikelKodu);
  const musteriKodu = normalizeOptional(payload.musteriKodu);
  const musteriSiparisNo = normalizeOptional(payload.musteriSiparisNo);
  const miktar = parseFloat(payload.miktarText.replace(",", "."));

  const tip = ALT_TO_TIP[payload.islemAltSecenegi];

  // Stok kontrolü (çıkış)
  if (tip === "ÇIKIŞ") {
    const currentStock = computeStock({
      depo: payload.depo,
      aksesuarTipi: payload.aksesuarTipi,
      aksesuarDetayi: payload.aksesuarDetayi,
      boyut: payload.boyut,
      renk,
      ozellik,
    });

    if (currentStock < miktar) {
      return {
        ok: false,
        code: "INSUFFICIENT_STOCK",
        message: `Yetersiz stok. Mevcut: ${currentStock.toFixed(3)} adet, Talep: ${miktar.toFixed(3)} adet`,
        currentStock,
        requestedAmount: miktar,
      };
    }
  }

  // Mükerrer kontrolü
  const recordForDuplicate = {
    islemTipi: tip,
    islemAltSecenegi: payload.islemAltSecenegi,
    tedarikci: payload.tedarikci,
    depo: payload.depo,
    aksesuarTipi: payload.aksesuarTipi,
    aksesuarDetayi: payload.aksesuarDetayi,
    boyut: payload.boyut,
    ozellik,
    aciklama,
    renk,
    tedarikciArtikelKodu,
    musteriKodu,
    musteriSiparisNo,
    hareketTarihi: payload.hareketTarihi,
    miktar,
  };

  if (!payload.confirmOverride && checkDuplicate(recordForDuplicate)) {
    return {
      ok: false,
      code: "DUPLICATE_WARNING",
      message: "Bu kayıt son 3 saat içinde girilmiş (miktar aynı). Devam edilsin mi?",
      requiresConfirm: true,
    };
  }

  // Kayıt oluştur
  const now = new Date().toISOString();
  const newRecord: AksesuarHareket = {
    id: crypto.randomUUID(),
    hareketNo: `AKS-${Date.now()}`,
    ...recordForDuplicate,
    createdBy: payload.createdBy || "unknown",
    createdAt: now,
    updatedAt: now,
  };

  appendHareket(newRecord);
  return { ok: true, record: newRecord };
}
