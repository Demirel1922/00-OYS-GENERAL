export type IslemTipi = "GİRİŞ" | "ÇIKIŞ";

export type IslemAltTipi =
  | "iplik_alimi" | "uretim_iade" | "boyamadan_gelen" | "numune_iade"
  | "diger_giris" | "disari_depodan_gelen" | "hurda_iade"
  | "uretim" | "satis" | "numune_uretimi" | "fire" | "boyamaya_giden"
  | "diger_cikis" | "tedarikci_iade" | "hurda_cikis" | "disari_depoya_giden";

export interface IplikHareket {
  id: string;
  tip: IslemTipi;
  altTip: IslemAltTipi;

  satinalmaFisNo?: string;
  siparisNo?: string;
  tedarikciIrsNo?: string;

  tedarikci: string;
  depoId?: string;

  iplikDetayId: string;
  iplikCinsiId: string;
  iplikCinsiAltKey: string;
  iplikKalinlik: string;

  renkKod: string;
  renkId: string;
  renkAdi?: string;

  tedarikciArtikel?: string;
  lotNo?: string;
  ozellik?: string;
  not?: string;

  evrakTarihi: string;
  miktarKg: number;

  createdBy: string;
  createdAt: string;
}

export interface IplikDetay {
  id: string;
  detay: string;
  cinsi: string;
  anaKategori: string;
  kalinliklar: string[];
}

export interface IplikCinsi {
  id: string;
  name: string;
  altKey: string;
}

export interface Renk {
  id: string;
  kod: string;
  name: string;
}

export interface Depo {
  id: string;
  name: string;
}

export interface IplikTanimlar {
  tedarikciler: string[];
  depolar: Depo[];
  renkler: Renk[];
  iplikDetaylari: IplikDetay[];
  iplikCinsleri: IplikCinsi[];
  altTipToTip: Record<IslemAltTipi, IslemTipi>;
  allowedKalinlikByIplikCinsiAltKey: Record<string, string[]>;
}

export interface IplikHareketFormData {
  altTip: IslemAltTipi;
  tip: IslemTipi;

  tedarikci: string;
  depoId?: string;

  iplikDetayId: string;
  iplikCinsiId: string;
  iplikCinsiAltKey: string;
  iplikKalinlik: string;

  renkKod: string;
  renkId: string;
  renkAdi?: string;

  tedarikciArtikel?: string;
  lotNo?: string;
  ozellik?: string;
  not?: string;

  evrakTarihi: string;
  miktarText: string;

  satinalmaFisNo?: string;
  siparisNo?: string;
  tedarikciIrsNo?: string;

  confirmOverride?: boolean;
  createdBy?: string;
}
