import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

import { ExcelRow } from "@/components/excel/ExcelRow";
import { ExcelErrorBox } from "@/components/excel/ExcelErrorBox";
import { DuplicateConfirmDialog } from "@/components/excel/DuplicateConfirmDialog";

import { createMovement } from "@/features/iplik/api";
import { iplikHareketSchema, type IplikHareketFormData } from "@/features/iplik/schema";
import type { IplikTanimlar } from "@/features/iplik/types";
import { ALT_TIP_TO_TIP, ALT_TIPLER } from "@/features/iplik/constants";

// Store entegrasyonu - Bilgi Girişleri modülünden dinamik veri
import { useTedarikciStore } from "@/store/tedarikciStore";
import { useDepoStore } from "@/store/depoStore";
import { useRenkStore } from "@/store/renkStore";
import { useIplikDetayStore } from "@/store/iplikDetayStore";
import { useKalinlikStore } from "@/store/kalinlikStore";
import { useIslemTipiStore } from "@/store/islemTipiStore";

export default function IplikDepo() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // Store'lardan dinamik veriler
  const { tedarikciler, seedData: seedTedarikci } = useTedarikciStore();
  const { depolar, seedData: seedDepo } = useDepoStore();
  const { renkler, seedData: seedRenk } = useRenkStore();
  const { detaylar, kategoriler, cinsler, seedData: seedDetay } = useIplikDetayStore();
  const { kalinliklar, seedData: seedKalinlik } = useKalinlikStore();

  // Store'ları seed et
  useEffect(() => {
    if (tedarikciler.length === 0) seedTedarikci();
    if (depolar.length === 0) seedDepo();
    if (renkler.length === 0) seedRenk();
    if (detaylar.length === 0) seedDetay();
    if (kalinliklar.length === 0) seedKalinlik();
  }, []);

  // Store'lardan IplikTanimlar formatına dönüştür
  const tanimlar = useMemo<IplikTanimlar | null>(() => {
    // En az bir store doluyana kadar null döndürme - fallback ile başla
    const aktifTedarikciler = tedarikciler.filter(t => t.durum === 'AKTIF');
    const aktifDepolar = depolar.filter(d => d.durum === 'AKTIF');
    const aktifRenkler = renkler.filter(r => r.durum === 'AKTIF');
    const aktifDetaylar = detaylar.filter(d => d.durum === 'AKTIF');
    const aktifKalinliklar = kalinliklar.filter(k => k.durum === 'AKTIF');

    // Cins-detay hiyerarşisi
    const iplikDetaylari = aktifDetaylar.map(d => {
      const cins = cinsler.find(c => c.id === d.cinsId);
      const kategori = kategoriler.find(k => cins && k.id === cins.kategoriId);
      return {
        id: d.id,
        detay: d.detayAdi,
        cinsi: cins?.cinsAdi || '',
        anaKategori: kategori?.kategoriAdi || '',
        kalinliklar: [] as string[],
      };
    });

    // İplik cinsleri
    const iplikCinsleri = cinsler
      .filter(c => c.durum === 'AKTIF')
      .map(c => ({
        id: c.id,
        name: c.cinsAdi,
        altKey: c.cinsAdi,
      }));

    // Kalınlık-cins eşlemesi (her cins için tüm kalınlıklar kullanılabilir olarak ayarla)
    const allowedKalinlikByIplikCinsiAltKey: Record<string, string[]> = {};
    const kalinlikStrs = aktifKalinliklar.map(k => `${k.birim} ${k.deger}${k.ozellik ? ` ${k.ozellik}` : ''}`);
    iplikCinsleri.forEach(c => {
      allowedKalinlikByIplikCinsiAltKey[c.altKey] = kalinlikStrs;
    });

    return {
      tedarikciler: aktifTedarikciler.map(t => t.tedarikciAdi),
      depolar: aktifDepolar.map(d => ({ id: d.id, name: d.depoAdi })),
      renkler: aktifRenkler.map(r => ({ id: r.id, kod: r.id, name: r.renkAdi })),
      iplikDetaylari,
      iplikCinsleri,
      altTipToTip: ALT_TIP_TO_TIP,
      allowedKalinlikByIplikCinsiAltKey,
    };
  }, [tedarikciler, depolar, renkler, detaylar, kalinliklar, cinsler, kategoriler]);

  const [loading, setLoading] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [pending, setPending] = useState<IplikHareketFormData | null>(null);

  const altTipTriggerRef = useRef<HTMLButtonElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  const form = useForm<IplikHareketFormData>({
    resolver: zodResolver(iplikHareketSchema),
    defaultValues: {
      evrakTarihi: today,
      tip: "GİRİŞ",
      miktarText: "",
      tedarikci: "",
      renkKod: "",
      renkId: "",
      renkAdi: "",
      iplikDetayId: "",
      iplikCinsiId: "",
      iplikCinsiAltKey: "",
      iplikKalinlik: "",
    },
    mode: "onSubmit",
  });

  const { control, setValue, reset, register, handleSubmit, formState: { errors } } = form;

  const altTip = useWatch({ control, name: "altTip" });
  const detayId = useWatch({ control, name: "iplikDetayId" });
  const altKey = useWatch({ control, name: "iplikCinsiAltKey" });
  const depoId = useWatch({ control, name: "depoId" });
  const renkId = useWatch({ control, name: "renkId" });
  const tedarikci = useWatch({ control, name: "tedarikci" });
  const iplikKalinlik = useWatch({ control, name: "iplikKalinlik" });
  const iplikCinsiId = useWatch({ control, name: "iplikCinsiId" });

  useEffect(() => {
    if (!altTip) return;
    setValue("tip", ALT_TIP_TO_TIP[altTip]);
  }, [altTip, setValue]);

  useEffect(() => {
    if (!tanimlar || !detayId) return;
    const detay = tanimlar.iplikDetaylari.find((d) => d.id === detayId);
    if (!detay) return;

    const cinsi = tanimlar.iplikCinsleri.find((c) => c.name === detay.cinsi);
    if (!cinsi) return;

    setValue("iplikCinsiId", cinsi.id);
    setValue("iplikCinsiAltKey", cinsi.altKey);
    setValue("iplikKalinlik", "");
  }, [detayId, tanimlar, setValue]);

  useEffect(() => {
    if (!tanimlar || !renkId) {
      setValue("renkAdi", "");
      return;
    }
    const r = tanimlar.renkler.find((x) => x.id === renkId);
    if (r) {
      setValue("renkAdi", r.name);
    }
  }, [renkId, tanimlar, setValue]);

  const kalinlikList = useMemo(() => {
    if (!tanimlar || !altKey) return [];
    return tanimlar.allowedKalinlikByIplikCinsiAltKey[altKey] || [];
  }, [tanimlar, altKey]);

  const iplikCinsiAdi = useMemo(() => {
    if (!tanimlar || !iplikCinsiId) return "";
    return tanimlar.iplikCinsleri.find((c) => c.id === iplikCinsiId)?.name || "";
  }, [tanimlar, iplikCinsiId]);

  const errorList = useMemo(() => {
    const list: string[] = [];
    for (const v of Object.values(errors)) {
      const msg = (v as { message?: string })?.message;
      if (msg) list.push(String(msg));
    }
    return list;
  }, [errors]);

  const isIplikAlimi = altTip === "iplik_alimi";
  const isUretim = altTip === "uretim";

  const doClear = () => {
    const keepDepo = depoId;
    reset({
      evrakTarihi: today,
      tip: "GİRİŞ",
      depoId: keepDepo,
      miktarText: "",
      tedarikci: "",
      renkKod: "",
      renkId: "",
      renkAdi: "",
      iplikDetayId: "",
      iplikCinsiId: "",
      iplikCinsiAltKey: "",
      iplikKalinlik: "",
      satinalmaFisNo: "",
      siparisNo: "",
      tedarikciIrsNo: "",
      tedarikciArtikel: "",
      lotNo: "",
      ozellik: "",
      not: "",
    });
    setTimeout(() => altTipTriggerRef.current?.focus(), 0);
  };

  const submitCore = async (data: IplikHareketFormData, clearAfter: boolean) => {
    setLoading(true);
    const payload: IplikHareketFormData = {
      ...data,
      createdBy: user?.username || "unknown",
    };
    const result = await createMovement(payload);

    if (result.ok) {
      toast.success("Kayıt başarıyla oluşturuldu");
      if (clearAfter) doClear();
      setLoading(false);
      return;
    }

    if (result.code === "DUPLICATE_WARNING" && result.requiresConfirm) {
      setPending(payload);
      setDupOpen(true);
      setLoading(false);
      return;
    }

    toast.error(result.message || "Hata");
    setLoading(false);
  };

  const confirmDuplicate = async () => {
    if (!pending) return;
    setDupOpen(false);
    setLoading(true);

    const payload = { ...pending, confirmOverride: true };
    const result = await createMovement(payload);

    if (result.ok) {
      toast.success("Kayıt başarıyla oluşturuldu");
      doClear();
    } else {
      toast.error(result.message || "Bir hata oluştu");
    }

    setPending(null);
    setLoading(false);
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  if (!tanimlar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="outline" onClick={handleBack} className="mb-6 flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Dashboard&apos;a Dön
          </Button>
          <div className="text-center py-12">Yükleniyor...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="outline" onClick={handleBack} className="mb-6 flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Dashboard&apos;a Dön
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">İplik Depo - Yeni Hareket</h1>

          <ExcelErrorBox errors={errorList} />

          <form className="border border-gray-300 rounded overflow-hidden shadow-sm bg-white">
            <ExcelRow label="İşlem Alt Seçeneği" required error={errors.altTip?.message}>
              <div className="flex items-center gap-3">
                <Select value={altTip} onValueChange={(v) => setValue("altTip", v as IplikHareketFormData["altTip"])}>
                  <SelectTrigger className="w-72" ref={altTipTriggerRef}>
                    <SelectValue placeholder="İşlem seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALT_TIPLER.map((x) => (
                      <SelectItem key={x.value} value={x.value}>
                        {x.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {altTip && (
                  <Badge variant={ALT_TIP_TO_TIP[altTip] === "GİRİŞ" ? "default" : "destructive"}>
                    {ALT_TIP_TO_TIP[altTip]}
                  </Badge>
                )}
              </div>
            </ExcelRow>

            {isIplikAlimi && (
              <>
                <ExcelRow label="Satın Alma Fiş No" required error={errors.satinalmaFisNo?.message}>
                  <Input {...register("satinalmaFisNo")} className="max-w-xs" />
                </ExcelRow>
                <ExcelRow label="Tedarikçi İrsaliye No" required error={errors.tedarikciIrsNo?.message}>
                  <Input {...register("tedarikciIrsNo")} className="max-w-xs" />
                </ExcelRow>
              </>
            )}

            {isUretim && (
              <ExcelRow label="Sipariş No" required error={errors.siparisNo?.message}>
                <Input {...register("siparisNo")} className="max-w-xs" />
              </ExcelRow>
            )}

            <ExcelRow label="Tedarikçi" required error={errors.tedarikci?.message}>
              <Select value={tedarikci} onValueChange={(v) => setValue("tedarikci", v)}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Tedarikçi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {tanimlar.tedarikciler.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            <ExcelRow label="Depo">
              <Select value={depoId || "__NONE__"} onValueChange={(v) => setValue("depoId", v === "__NONE__" ? undefined : v)}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Depo (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__NONE__">Seçilmedi</SelectItem>
                  {tanimlar.depolar.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            <ExcelRow label="İplik Detayı" required error={errors.iplikDetayId?.message}>
              <Select value={detayId} onValueChange={(v) => setValue("iplikDetayId", v)}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="İplik detayı seçin" />
                </SelectTrigger>
                <SelectContent>
                  {tanimlar.iplikDetaylari.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.detay}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            <ExcelRow label="İplik Cinsi / Kategori">
              <div className="flex gap-2">
                <Input value={iplikCinsiAdi} disabled className="w-40 bg-gray-50" placeholder="Cins" />
                <Input value={altKey || ""} disabled className="w-40 bg-gray-50" placeholder="Kategori" />
              </div>
            </ExcelRow>

            <ExcelRow label="İplik Kalınlık" required error={errors.iplikKalinlik?.message}>
              <Select
                value={iplikKalinlik}
                onValueChange={(v) => setValue("iplikKalinlik", v)}
                disabled={!altKey}
              >
                <SelectTrigger className="w-72">
                  <SelectValue placeholder={altKey ? "Kalınlık seçin" : "Önce detay seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {kalinlikList.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            <ExcelRow label="Renk Kodu" required error={errors.renkKod?.message}>
              <Input {...register("renkKod")} className="max-w-xs" placeholder="Renk kodu girin" />
            </ExcelRow>

            <ExcelRow label="Renk Adı" required error={errors.renkId?.message}>
              <Select value={renkId} onValueChange={(v) => setValue("renkId", v)}>
                <SelectTrigger className="w-72">
                  <SelectValue placeholder="Renk adı seçin" />
                </SelectTrigger>
                <SelectContent>
                  {tanimlar.renkler.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            <ExcelRow label="Tedarikçi Artikel İsmi">
              <Input {...register("tedarikciArtikel")} className="max-w-xs" placeholder="Artikel no/varsa" />
            </ExcelRow>

            <ExcelRow label="Lot No">
              <Input {...register("lotNo")} className="max-w-xs" />
            </ExcelRow>

            <ExcelRow label="Özellik">
              <Input {...register("ozellik")} className="max-w-xs" placeholder="İplik özelliği varsa" />
            </ExcelRow>

            <ExcelRow label="Evrak Tarihi" required error={errors.evrakTarihi?.message}>
              <Input type="date" {...register("evrakTarihi")} className="max-w-xs" />
            </ExcelRow>

            <ExcelRow label="Miktar (kg)" required error={errors.miktarText?.message}>
              <Input {...register("miktarText")} className="max-w-xs" placeholder="12,5" />
            </ExcelRow>

            <ExcelRow label="Not">
              <Textarea {...register("not")} className="max-w-md" placeholder="Varsa ek bilgi..." rows={3} />
            </ExcelRow>
          </form>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSubmit((d) => submitCore(d, false))}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button onClick={handleSubmit((d) => submitCore(d, true))} disabled={loading} variant="outline">
              Kaydet & Temizle
            </Button>
            <Button onClick={doClear} type="button" variant="ghost">
              Temizle
            </Button>
          </div>

          <DuplicateConfirmDialog
            open={dupOpen}
            onConfirm={confirmDuplicate}
            onCancel={() => {
              setDupOpen(false);
              setPending(null);
            }}
          />
        </div>
      </main>
    </div>
  );
}
