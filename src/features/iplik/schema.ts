import { z } from "zod";

export const iplikHareketSchema = z.object({
  altTip: z.enum([
    "iplik_alimi","uretim_iade","boyamadan_gelen","numune_iade",
    "diger_giris","disari_depodan_gelen","hurda_iade",
    "uretim","satis","numune_uretimi","fire","boyamaya_giden",
    "diger_cikis","tedarikci_iade","hurda_cikis","disari_depoya_giden"
  ]),
  tip: z.enum(["GİRİŞ","ÇIKIŞ"]),
  tedarikci: z.string().min(1, "Tedarikçi seçilmelidir"),
  depoId: z.string().optional(),

  iplikDetayId: z.string().min(1, "İplik detayı seçilmelidir"),
  iplikCinsiId: z.string().min(1, "İplik cinsi bulunamadı"),
  iplikCinsiAltKey: z.string().min(1, "İplik cinsi alt key bulunamadı"),
  iplikKalinlik: z.string().min(1, "İplik kalınlığı seçilmelidir"),

  renkKod: z.string().min(1, "Renk kodu girilmelidir"),
  renkId: z.string().min(1, "Renk seçilmelidir"),
  renkAdi: z.string().optional(),

  tedarikciArtikel: z.string().optional(),
  lotNo: z.string().optional(),
  ozellik: z.string().optional(),
  not: z.string().optional(),

  evrakTarihi: z.string().min(1, "Evrak tarihi girilmelidir"),
  miktarText: z.string().min(1, "Miktar girilmelidir"),

  satinalmaFisNo: z.string().optional(),
  siparisNo: z.string().optional(),
  tedarikciIrsNo: z.string().optional(),

  confirmOverride: z.boolean().optional(),
  createdBy: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.miktarText.includes(".")) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Miktarı virgülle yazın (12,5)", path: ["miktarText"] });
    return;
  }
  const n = parseFloat(data.miktarText.replace(",", "."));
  if (isNaN(n) || n <= 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Geçerli bir miktar girin (örn: 12,5)", path: ["miktarText"] });
  }

  if (data.altTip === "iplik_alimi") {
    if (!data.satinalmaFisNo?.trim()) ctx.addIssue({ code:z.ZodIssueCode.custom, path:["satinalmaFisNo"], message:"Satın alma fiş no zorunludur" });
    if (!data.tedarikciIrsNo?.trim()) ctx.addIssue({ code:z.ZodIssueCode.custom, path:["tedarikciIrsNo"], message:"Tedarikçi irsaliye no zorunludur" });
  }

  if (data.altTip === "uretim") {
    if (!data.siparisNo?.trim()) ctx.addIssue({ code:z.ZodIssueCode.custom, path:["siparisNo"], message:"Sipariş no zorunludur" });
  }
});

export type IplikHareketFormData = z.infer<typeof iplikHareketSchema>;
