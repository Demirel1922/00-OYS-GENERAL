import type { IslemAltTipi, IslemTipi, IplikTanimlar } from "./types";

export const ALT_TIP_TO_TIP: Record<IslemAltTipi, IslemTipi> = {
  iplik_alimi: "GİRİŞ",
  uretim_iade: "GİRİŞ",
  boyamadan_gelen: "GİRİŞ",
  numune_iade: "GİRİŞ",
  diger_giris: "GİRİŞ",
  disari_depodan_gelen: "GİRİŞ",
  hurda_iade: "GİRİŞ",

  uretim: "ÇIKIŞ",
  satis: "ÇIKIŞ",
  numune_uretimi: "ÇIKIŞ",
  fire: "ÇIKIŞ",
  boyamaya_giden: "ÇIKIŞ",
  diger_cikis: "ÇIKIŞ",
  tedarikci_iade: "ÇIKIŞ",
  hurda_cikis: "ÇIKIŞ",
  disari_depoya_giden: "ÇIKIŞ",
};

export const ALT_TIPLER = [
  { value: "iplik_alimi", label: "İplik Alımı" },
  { value: "uretim_iade", label: "Üretim İade" },
  { value: "boyamadan_gelen", label: "Boyamadan Gelen" },
  { value: "numune_iade", label: "Numune İade" },
  { value: "diger_giris", label: "Diğer Giriş" },
  { value: "disari_depodan_gelen", label: "Dışarı Depodan Gelen" },
  { value: "hurda_iade", label: "Hurda İade" },

  { value: "uretim", label: "Üretim" },
  { value: "satis", label: "Satış" },
  { value: "numune_uretimi", label: "Numune Üretimi" },
  { value: "fire", label: "Fire" },
  { value: "boyamaya_giden", label: "Boyamaya Giden" },
  { value: "diger_cikis", label: "Diğer Çıkış" },
  { value: "tedarikci_iade", label: "Tedarikçi İade" },
  { value: "hurda_cikis", label: "Hurda Çıkış" },
  { value: "disari_depoya_giden", label: "Dışarı Depoya Giden" },
] as const;

export const DEFAULT_TANIMLAR: IplikTanimlar = {
  tedarikciler: [
    "Akpamuk","Aloha","Danişment","Denge Tekstil","Elasteks","Gapsan","Garanti İplik","Gülçağ",
    "İnfo İplik","İstanbul İplik","İthal","Karadağ İplik","Keten İplik","Mersu","Sarar","Südwolle",
    "Uzunlar İplik","Zafer Tekstil"
  ],
  depolar: [
    { id: "MAIN", name: "Ana Depo" },
    { id: "DYE", name: "Boyahane" },
    { id: "DDIS1", name: "Dış Depo 1" },
    { id: "DDIS2", name: "Dış Depo 2" },
  ],
  renkler: [
    { id: "r1", kod: "MRS 155", name: "Kırmızı" },
    { id: "r2", kod: "BLK 001", name: "Siyah" },
    { id: "r3", kod: "WHT 001", name: "Beyaz" },
    { id: "r4", kod: "NAV 042", name: "Lacivert" },
    { id: "r5", kod: "GRY 103", name: "Gri" },
    { id: "r6", kod: "CRM 205", name: "Krem" },
    { id: "r7", kod: "WHT-M", name: "Beyaz Melanj" },
    { id: "r8", kod: "BLK-M", name: "Siyah Melanj" },
    { id: "r9", kod: "NAV-M", name: "Lacivert Melanj" },
  ],
  iplikDetaylari: [
    { id: "d1", detay: "Karde", cinsi: "Pamuk", anaKategori: "Dogal_Elyaf", kalinliklar: [] },
    { id: "d2", detay: "Penye", cinsi: "Pamuk", anaKategori: "Dogal_Elyaf", kalinliklar: [] },
    { id: "d3", detay: "Tactel", cinsi: "Polyamid", anaKategori: "Sentetik_Elyaf", kalinliklar: [] },
    { id: "d4", detay: "Polyamid 6", cinsi: "Polyamid", anaKategori: "Sentetik_Elyaf", kalinliklar: [] },
    { id: "d5", detay: "Coolmax", cinsi: "Polyester", anaKategori: "Sentetik_Elyaf", kalinliklar: [] },
    { id: "d6", detay: "Elastoelit", cinsi: "Polyester", anaKategori: "Sentetik_Elyaf", kalinliklar: [] },
  ],
  iplikCinsleri: [
    { id: "c1", name: "Pamuk", altKey: "Pamuk" },
    { id: "c2", name: "Polyamid", altKey: "Polyamid" },
    { id: "c3", name: "Polyester", altKey: "Polyester" },
  ],
  altTipToTip: ALT_TIP_TO_TIP,
  allowedKalinlikByIplikCinsiAltKey: {
    Pamuk: ["Ne 12/1","Ne 16/1","Ne 20/1","Ne 30/1","Ne 40/1","Ne 50/1"],
    Polyamid: ["22 dtex","33 dtex","44 dtex","78 dtex","122 dtex"],
    Polyester: ["Ne 30/1","Ne 40/1","75 denye","22 dtex","44 dtex"],
  },
};
