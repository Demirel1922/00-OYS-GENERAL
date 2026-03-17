import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { useAuthStore } from "@/store/authStore";
import { Header } from "@/components/common/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

import { ExcelRow } from "@/components/excel/ExcelRow";
import { ExcelErrorBox } from "@/components/excel/ExcelErrorBox";
import { DuplicateConfirmDialog } from "@/components/excel/DuplicateConfirmDialog";

import { aksesuarHareketSchema } from "@/features/aksesuar/schema";
import type { AksesuarHareketFormData, AksesuarTanimlar } from "@/features/aksesuar/types";
import { ALT_TO_TIP, ALT_SECENEKLER } from "@/features/aksesuar/constants";
import { getSeed, createMovement } from "@/features/aksesuar/api";

export default function AksesuarDepo() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [tanimlar, setTanimlar] = useState<AksesuarTanimlar | null>(null);
  const [loading, setLoading] = useState(false);
  const [dupOpen, setDupOpen] = useState(false);
  const [pending, setPending] = useState<AksesuarHareketFormData | null>(null);

  const altSecenekTriggerRef = useRef<HTMLButtonElement>(null);
  const today = new Date().toISOString().slice(0, 10);

  // ── Form ───────────────────────────────────────────────────
  const form = useForm<AksesuarHareketFormData>({
    resolver: zodResolver(aksesuarHareketSchema),
    defaultValues: {
      hareketTarihi: today,
      miktarText: "",
      tedarikci: "",
      depo: "",
      aksesuarTipi: "",
      aksesuarDetayi: "",
      boyut: "",
    },
    mode: "onSubmit",
  });

  const { control, setValue, reset, register, handleSubmit, formState: { errors } } = form;

  // ── useWatch — hepsi component üstünde, JSX'te DEĞİL ─────
  const islemTipi = useWatch({ control, name: "islemTipi" });
  const islemAltSecenegi = useWatch({ control, name: "islemAltSecenegi" });
  const aksesuarTipi = useWatch({ control, name: "aksesuarTipi" });
  const aksesuarDetayi = useWatch({ control, name: "aksesuarDetayi" });
  const depo = useWatch({ control, name: "depo" });
  const tedarikci = useWatch({ control, name: "tedarikci" });
  const boyut = useWatch({ control, name: "boyut" });
  const renk = useWatch({ control, name: "renk" });

  // ── Seed yükle ─────────────────────────────────────────────
  useEffect(() => {
    getSeed()
      .then(setTanimlar)
      .catch(() => toast.error("Tanım verileri yüklenemedi"));
  }, []);

  // ── Alt seçenek → işlem tipi otomatik set ─────────────────
  useEffect(() => {
    if (!islemAltSecenegi) return;
    const tip = ALT_TO_TIP[islemAltSecenegi];
    if (tip) setValue("islemTipi", tip);
  }, [islemAltSecenegi, setValue]);

  // ── Aksesuar tipi değişince detay ve boyut sıfırla ────────
  useEffect(() => {
    if (!aksesuarTipi) return;
    setValue("aksesuarDetayi", "");
    setValue("boyut", "");
  }, [aksesuarTipi, setValue]);

  // ── Filtrelenmiş listeler ─────────────────────────────────
  const detayList = useMemo(() => {
    if (!tanimlar || !aksesuarTipi) return [];
    return tanimlar.aksesuarDetaylari.filter((d) => d.aksesuarTipiId === aksesuarTipi);
  }, [tanimlar, aksesuarTipi]);

  const boyutList = useMemo(() => {
    if (!tanimlar || !aksesuarTipi) return [];
    const list = tanimlar.boyutlar.filter((b) => b.aksesuarTipiId === aksesuarTipi);
    if (list.length === 0) return [{ id: "yok", name: "Yok", aksesuarTipiId: aksesuarTipi }];
    return list;
  }, [tanimlar, aksesuarTipi]);

  // ── Hata listesi ──────────────────────────────────────────
  const errorList = useMemo(() => {
    const list: string[] = [];
    for (const v of Object.values(errors)) {
      const msg = (v as any)?.message;
      if (msg) list.push(String(msg));
    }
    return list;
  }, [errors]);

  // ── Temizle ───────────────────────────────────────────────
  const doClear = () => {
    reset({
      hareketTarihi: today,
      miktarText: "",
      tedarikci: "",
      depo: "",
      aksesuarTipi: "",
      aksesuarDetayi: "",
      boyut: "",
      ozellik: "",
      aciklama: "",
      renk: "",
      tedarikciArtikelKodu: "",
      musteriKodu: "",
      musteriSiparisNo: "",
    });
    setTimeout(() => altSecenekTriggerRef.current?.focus(), 0);
  };

  // ── Kaydet ────────────────────────────────────────────────
  const submitCore = async (data: AksesuarHareketFormData, clearAfter: boolean) => {
    setLoading(true);

    const payload: AksesuarHareketFormData = {
      ...data,
      createdBy: user?.fullName || user?.username || "unknown",
    };

    const result = await createMovement(payload);

    if (!result.ok) {
      if (result.code === "DUPLICATE_WARNING") {
        setPending(data);
        setDupOpen(true);
      } else {
        toast.error(result.message);
      }
      setLoading(false);
      return;
    }

    toast.success(`Kayıt başarıyla oluşturuldu (${result.record.hareketNo})`);

    if (clearAfter) {
      doClear();
    } else {
      navigate("/module/3");
    }
    setLoading(false);
  };

  const confirmDuplicate = async () => {
    if (!pending) return;
    setDupOpen(false);
    setLoading(true);
    await submitCore({ ...pending, confirmOverride: true }, true);
    setPending(null);
  };

  // ── Loading state ─────────────────────────────────────────
  if (!tanimlar) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-500">Tanımlar yükleniyor...</p>
        </main>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="outline"
          onClick={() => navigate("/module/3")}
          className="mb-6 flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Hammadde Depo&apos;ya Dön
        </Button>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Aksesuar Depo - Yeni Hareket</h1>

          <ExcelErrorBox errors={errorList} />

          <form className="border border-gray-300 rounded overflow-hidden shadow-sm bg-white">

            {/* İşlem Alt Seçeneği */}
            <ExcelRow label="İşlem Alt Seçeneği" required error={errors.islemAltSecenegi?.message}>
              <div className="flex items-center gap-3">
                <Select
                  value={islemAltSecenegi || ""}
                  onValueChange={(v) => setValue("islemAltSecenegi", v as any)}
                >
                  <SelectTrigger className="w-64" ref={altSecenekTriggerRef}>
                    <SelectValue placeholder="İşlem alt seçeneği seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {ALT_SECENEKLER.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {islemTipi && (
                  <Badge variant={islemTipi === "GİRİŞ" ? "default" : "destructive"}>
                    {islemTipi}
                  </Badge>
                )}
              </div>
            </ExcelRow>

            {/* Tedarikçi */}
            <ExcelRow label="Tedarikçi" required error={errors.tedarikci?.message}>
              <Select
                value={tedarikci || ""}
                onValueChange={(v) => setValue("tedarikci", v)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Tedarikçi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {tanimlar.tedarikciler.map((t) => (
                    <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            {/* Depo */}
            <ExcelRow label="Depo" required error={errors.depo?.message}>
              <Select
                value={depo || ""}
                onValueChange={(v) => setValue("depo", v)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Depo seçin" />
                </SelectTrigger>
                <SelectContent>
                  {tanimlar.depolar.map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            {/* Aksesuar Tipi */}
            <ExcelRow label="Aksesuar Tipi" required error={errors.aksesuarTipi?.message}>
              <Select
                value={aksesuarTipi || ""}
                onValueChange={(v) => setValue("aksesuarTipi", v)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Aksesuar tipi seçin" />
                </SelectTrigger>
                <SelectContent>
                  {tanimlar.aksesuarTipleri.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            {/* Aksesuar Detayı */}
            <ExcelRow label="Aksesuar Detayı" required error={errors.aksesuarDetayi?.message}>
              <Select
                value={aksesuarDetayi || ""}
                onValueChange={(v) => setValue("aksesuarDetayi", v)}
                disabled={!aksesuarTipi}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder={aksesuarTipi ? "Detay seçin" : "Önce tip seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {detayList.map((d) => (
                    <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            {/* Boyut */}
            <ExcelRow label="Boyut" required error={errors.boyut?.message}>
              <Select
                value={boyut || ""}
                onValueChange={(v) => setValue("boyut", v)}
                disabled={!aksesuarTipi}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder={aksesuarTipi ? "Boyut seçin" : "Önce tip seçin"} />
                </SelectTrigger>
                <SelectContent>
                  {boyutList.map((b) => (
                    <SelectItem key={b.id} value={b.name}>{b.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            {/* Özellik */}
            <ExcelRow label="Özellik">
              <Input {...register("ozellik")} className="max-w-xs" placeholder="Opsiyonel" />
            </ExcelRow>

            {/* Açıklama */}
            <ExcelRow label="Açıklama">
              <Input {...register("aciklama")} className="max-w-xs" placeholder="Opsiyonel" />
            </ExcelRow>

            {/* Renk */}
            <ExcelRow label="Renk">
              <Select
                value={renk || "__NONE__"}
                onValueChange={(v) => setValue("renk", v === "__NONE__" ? undefined : v)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Renk seçin (opsiyonel)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__NONE__">Seçilmedi</SelectItem>
                  {tanimlar.renkler.map((r) => (
                    <SelectItem key={r.id} value={r.kod}>{r.kod} - {r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </ExcelRow>

            {/* Tedarikçi Artikel Kodu */}
            <ExcelRow label="Tedarikçi Artikel Kodu">
              <Input {...register("tedarikciArtikelKodu")} className="max-w-xs" placeholder="Opsiyonel" />
            </ExcelRow>

            {/* Müşteri Kodu */}
            <ExcelRow label="Müşteri Kodu">
              <Input {...register("musteriKodu")} className="max-w-xs" placeholder="Opsiyonel" />
            </ExcelRow>

            {/* Müşteri Sipariş No */}
            <ExcelRow label="Müşteri Sipariş No">
              <Input {...register("musteriSiparisNo")} className="max-w-xs" placeholder="Opsiyonel" />
            </ExcelRow>

            {/* Hareket Tarihi */}
            <ExcelRow label="Hareket Tarihi" required error={errors.hareketTarihi?.message}>
              <Input type="date" {...register("hareketTarihi")} className="max-w-xs" />
            </ExcelRow>

            {/* Miktar */}
            <ExcelRow label="Miktar (adet)" required error={errors.miktarText?.message}>
              <Input {...register("miktarText")} className="max-w-xs" placeholder="12,5" />
            </ExcelRow>

          </form>

          {/* Butonlar */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSubmit((d) => submitCore(d, false))}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
            <Button
              onClick={handleSubmit((d) => submitCore(d, true))}
              disabled={loading}
              variant="outline"
            >
              Kaydet &amp; Temizle
            </Button>
            <Button onClick={doClear} type="button" variant="ghost">
              Temizle
            </Button>
          </div>

          <DuplicateConfirmDialog
            open={dupOpen}
            onConfirm={confirmDuplicate}
            onCancel={() => { setDupOpen(false); setPending(null); }}
          />
        </div>
      </main>
    </div>
  );
}
