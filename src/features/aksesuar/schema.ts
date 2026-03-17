import { z } from "zod";

export const aksesuarHareketSchema = z.object({
  islemTipi: z.enum(["GİRİŞ", "ÇIKIŞ"]),
  islemAltSecenegi: z.enum([
    "satin_alim", "formaneye_iade", "diger_giris",
    "formaneye_verilen", "satis", "fire", "diger_cikis", "tedarikci_iade", "ambalaja_verilen",
  ]),
  tedarikci: z.string().min(1, "Tedarikçi seçilmelidir"),
  depo: z.string().min(1, "Depo seçilmelidir"),
  aksesuarTipi: z.string().min(1, "Aksesuar tipi seçilmelidir"),
  aksesuarDetayi: z.string().min(1, "Aksesuar detayı seçilmelidir"),
  boyut: z.string().min(1, "Boyut seçilmelidir"),
  ozellik: z.string().optional(),
  aciklama: z.string().optional(),
  renk: z.string().optional(),
  tedarikciArtikelKodu: z.string().optional(),
  musteriKodu: z.string().optional(),
  musteriSiparisNo: z.string().optional(),
  hareketTarihi: z.string().min(1, "Hareket tarihi girilmelidir"),
  miktarText: z.string().min(1, "Miktar girilmelidir"),
  confirmOverride: z.boolean().optional(),
  createdBy: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.miktarText.includes(".")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Miktarı virgülle yazın (örn: 12,5)",
      path: ["miktarText"],
    });
    return;
  }

  const numericValue = parseFloat(data.miktarText.replace(",", "."));
  if (isNaN(numericValue) || numericValue <= 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Geçerli bir miktar girin (örn: 12,5)",
      path: ["miktarText"],
    });
  }
});

export type AksesuarHareketFormData = z.infer<typeof aksesuarHareketSchema>;
