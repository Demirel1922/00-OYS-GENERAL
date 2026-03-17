export type IslemTipi = "GİRİŞ" | "ÇIKIŞ";

export type IslemAltSecenek =
  | "satin_alim"
  | "formaneye_iade"
  | "diger_giris"
  | "formaneye_verilen"
  | "satis"
  | "fire"
  | "diger_cikis"
  | "tedarikci_iade"
  | "ambalaja_verilen";

export interface AksesuarTedarikci {
  id: string;
  name: string;
}

export interface AksesuarDepo {
  id: string;
  name: string;
}

export interface AksesuarRenk {
  id: string;
  kod: string;
  name: string;
}

export interface AksesuarTipi {
  id: string;
  name: string;
}

export interface AksesuarDetay {
  id: string;
  name: string;
  aksesuarTipiId: string;
}

export interface AksesuarBoyut {
  id: string;
  name: string;
  aksesuarTipiId: string;
}

export interface AksesuarTanimlar {
  tedarikciler: AksesuarTedarikci[];
  depolar: AksesuarDepo[];
  renkler: AksesuarRenk[];
  aksesuarTipleri: AksesuarTipi[];
  aksesuarDetaylari: AksesuarDetay[];
  boyutlar: AksesuarBoyut[];
}

export interface AksesuarHareket {
  id: string;
  hareketNo: string;
  islemTipi: IslemTipi;
  islemAltSecenegi: IslemAltSecenek;
  tedarikci: string;
  depo: string;
  aksesuarTipi: string;
  aksesuarDetayi: string;
  boyut: string;
  ozellik?: string;
  aciklama?: string;
  renk?: string;
  tedarikciArtikelKodu?: string;
  musteriKodu?: string;
  musteriSiparisNo?: string;
  hareketTarihi: string;
  miktar: number;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AksesuarHareketFormData {
  islemTipi: IslemTipi;
  islemAltSecenegi: IslemAltSecenek;
  tedarikci: string;
  depo: string;
  aksesuarTipi: string;
  aksesuarDetayi: string;
  boyut: string;
  ozellik?: string;
  aciklama?: string;
  renk?: string;
  tedarikciArtikelKodu?: string;
  musteriKodu?: string;
  musteriSiparisNo?: string;
  hareketTarihi: string;
  miktarText: string;
  confirmOverride?: boolean;
  createdBy?: string;
}
