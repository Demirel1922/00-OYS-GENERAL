import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, CheckCircle2, Lock, Unlock, Trash2, FileDown,
} from 'lucide-react';
import type {
  UretimHazirlikKaydi, IplikSatiri,
  OlcuSatiri, GramajSatiri, FormaCesidi,
} from '../types';
import { STATUS_LABELS, FORMA_PARAMETRE_CONFIG } from '../types';
import {
  STORAGE_KEY, hesaplaGramajToplamlari, validateForApproval, createLog,
  MAX_IPLIK_ROW_COUNT,
} from '../utils/calculations';
import { createEmptyIplikSatiri, createEmptyOlcuSatiri, createEmptyGramajSatiri } from '../utils/factory';
import {
  MUSTERI_KODLARI, IGNE_SAYILARI, CAP_DEGERLERI, KALINLIK_DEGERLERI,
  MAKINE_MODELLERI, YIKAMA_TIPLERI, BURUN_DIKIS_TIPLERI, HAZIRLAYANLAR,
  BOYLAR, MEKIK_TANIMLARI, MEKIK_KODLARI, IPLIK_NUMARALARI, KAT_DEGERLERI,
  IPLIK_CINSLERI, TEDARIKCILER,
} from '../constants/lookups';

type TabKey = 'urun' | 'gramaj' | 'yikama' | 'forma' | 'makina' | 'onay';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'urun', label: 'Ürün Hazırlık Kartı' },
  { key: 'gramaj', label: 'Gramaj' },
  { key: 'yikama', label: 'Yıkama' },
  { key: 'forma', label: 'Forma' },
  { key: 'makina', label: 'Makina Kartı' },
  { key: 'onay', label: 'Onay & Kilitleme' },
];

function LookupSelect({ value, onChange, options, placeholder, disabled, className }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder?: string; disabled?: boolean; className?: string;
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className={`border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${className || 'w-full'}`}
    >
      <option value="">{placeholder || 'Seçiniz'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function FieldInput({ value, onChange, type, disabled, placeholder, className }: {
  value: string; onChange: (v: string) => void; type?: string;
  disabled?: boolean; placeholder?: string; className?: string;
}) {
  return (
    <input
      type={type || 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      placeholder={placeholder}
      className={`border border-gray-300 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-500 ${className || 'w-full'}`}
    />
  );
}

function ReadonlyField({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-sm text-gray-700 min-h-[34px]">
        {value || '-'}
      </div>
    </div>
  );
}

function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

export function UretimHazirlikDetayPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabKey>('urun');
  const [kayit, setKayit] = useState<UretimHazirlikKaydi | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' });

  const isLocked = kayit?.status === 'COMPLETED_LOCKED';

  const showToast = useCallback((msg: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  useEffect(() => {
    const all: UretimHazirlikKaydi[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const found = all.find(k => k.id === id);
    if (found) setKayit(found);
  }, [id]);

  const persist = useCallback((updated: UretimHazirlikKaydi) => {
    const all: UretimHazirlikKaydi[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const idx = all.findIndex(k => k.id === updated.id);
    if (idx >= 0) all[idx] = updated; else all.push(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    setKayit(updated);
  }, []);

  const updateUrunKarti = useCallback((field: string, value: any) => {
    if (!kayit || isLocked) return;
    setKayit(prev => prev ? { ...prev, urunKarti: { ...prev.urunKarti, [field]: value } } : prev);
  }, [kayit, isLocked]);

  const updateIplik = useCallback((idx: number, field: keyof IplikSatiri, value: string) => {
    if (!kayit || isLocked) return;
    setKayit(prev => {
      if (!prev) return prev;
      const iplikler = [...prev.urunKarti.iplikler];
      iplikler[idx] = { ...iplikler[idx], [field]: value };
      return { ...prev, urunKarti: { ...prev.urunKarti, iplikler } };
    });
  }, [kayit, isLocked]);

  const addIplikSatiri = useCallback(() => {
    if (!kayit || isLocked) return;
    if (kayit.urunKarti.iplikler.length >= MAX_IPLIK_ROW_COUNT) return;
    setKayit(prev => {
      if (!prev) return prev;
      const newId = Math.max(...prev.urunKarti.iplikler.map(i => i.id), 0) + 1;
      return {
        ...prev,
        urunKarti: {
          ...prev.urunKarti,
          iplikler: [...prev.urunKarti.iplikler, createEmptyIplikSatiri(newId)],
        },
      };
    });
  }, [kayit, isLocked]);

  const removeIplikSatiri = useCallback((idx: number) => {
    if (!kayit || isLocked) return;
    if (kayit.urunKarti.iplikler.length <= 1) return;
    setKayit(prev => {
      if (!prev) return prev;
      const iplikler = prev.urunKarti.iplikler.filter((_, i) => i !== idx);
      return { ...prev, urunKarti: { ...prev.urunKarti, iplikler } };
    });
  }, [kayit, isLocked]);

  const updateOlcu = useCallback((idx: number, field: keyof OlcuSatiri, value: string) => {
    if (!kayit || isLocked) return;
    setKayit(prev => {
      if (!prev) return prev;
      const olculer = [...prev.urunKarti.olculer];
      olculer[idx] = { ...olculer[idx], [field]: value };
      return { ...prev, urunKarti: { ...prev.urunKarti, olculer } };
    });
  }, [kayit, isLocked]);

  const addOlcuSatiri = useCallback(() => {
    if (!kayit || isLocked) return;
    setKayit(prev => {
      if (!prev) return prev;
      const newId = Math.max(...prev.urunKarti.olculer.map(o => o.id), 0) + 1;
      return {
        ...prev,
        urunKarti: {
          ...prev.urunKarti,
          olculer: [...prev.urunKarti.olculer, createEmptyOlcuSatiri(newId)],
        },
      };
    });
  }, [kayit, isLocked]);

  const updateGramajSatir = useCallback((idx: number, field: keyof GramajSatiri, value: string) => {
    if (!kayit || isLocked) return;
    setKayit(prev => {
      if (!prev) return prev;
      const satirlar = [...prev.gramaj.satirlar];
      satirlar[idx] = { ...satirlar[idx], [field]: value };
      const gramaj = hesaplaGramajToplamlari({ ...prev.gramaj, satirlar });
      return { ...prev, gramaj };
    });
  }, [kayit, isLocked]);

  const updateYikama = useCallback((field: string, value: any) => {
    if (!kayit || isLocked) return;
    setKayit(prev => prev ? { ...prev, yikama: { ...prev.yikama, [field]: value } } : prev);
  }, [kayit, isLocked]);

  const updateYikamaAdim = useCallback((adimIdx: number, field: string, value: string) => {
    if (!kayit || isLocked) return;
    setKayit(prev => {
      if (!prev) return prev;
      const adimlar = [...prev.yikama.adimlar];
      adimlar[adimIdx] = { ...adimlar[adimIdx], [field]: value };
      return { ...prev, yikama: { ...prev.yikama, adimlar } };
    });
  }, [kayit, isLocked]);

  const updateForma = useCallback((field: string, value: any) => {
    if (!kayit || isLocked) return;
    setKayit(prev => prev ? { ...prev, forma: { ...prev.forma, [field]: value } } : prev);
  }, [kayit, isLocked]);

  const handleSave = useCallback(() => {
    if (!kayit || isLocked) return;
    const now = new Date().toISOString();
    let updated = { ...kayit, sonGuncellemeTarihi: now, sonGuncelleyen: 'Kullanıcı' };

    const gramajSatirlari = updated.gramaj.satirlar.map((gs, i) => {
      const iplik = updated.urunKarti.iplikler[i];
      if (iplik) {
        return {
          ...gs,
          iplikYeri: iplik.iplikYeri, mekikKodu: iplik.mekikKodu,
          denye: iplik.denye, kat: iplik.kat, iplikCinsi: iplik.iplikCinsi,
          iplikTanimi: iplik.iplikTanimi, renk: iplik.renk,
          renkKodu: iplik.renkKodu, tedarikci: iplik.tedarikci,
        };
      }
      return gs;
    });

    while (gramajSatirlari.length < updated.urunKarti.iplikler.length) {
      gramajSatirlari.push(createEmptyGramajSatiri(gramajSatirlari.length + 1));
    }

    updated.gramaj = hesaplaGramajToplamlari({
      ...updated.gramaj,
      satirlar: gramajSatirlari,
      burunDikisi: updated.urunKarti.burunKapama,
      yikamaAgirlik: updated.urunKarti.yikama,
      birCiftAgirligi: updated.urunKarti.ciftAgirligi,
    });

    updated.yikama = {
      ...updated.yikama,
      musteriKodu: updated.urunKarti.musteriKodu,
      artikelKodu: updated.urunKarti.musteriArtikelKodu,
      ormeciArtikelNo: updated.urunKarti.ormeciArtikelKodu,
    };

    if (updated.status === 'NEW') {
      updated.status = 'IN_PROGRESS';
      updated.loglar = [...updated.loglar, createLog('Kullanıcı', 'STATU_DEGISIM', 'Yeni → Devam Eden')];
    } else {
      updated.loglar = [...updated.loglar, createLog('Kullanıcı', 'KAYDET', 'Ara kayıt')];
    }

    persist(updated);
    showToast('Kayıt başarıyla kaydedildi');
  }, [kayit, isLocked, persist, showToast]);

  const handleApprove = useCallback(() => {
    if (!kayit) return;
    const result = validateForApproval(kayit);
    if (!result.valid) {
      showToast(`Eksik alanlar: ${result.errors.join(', ')}`, 'error');
      return;
    }
    const now = new Date().toISOString();
    const updated: UretimHazirlikKaydi = {
      ...kayit,
      status: 'COMPLETED_LOCKED',
      kilitli: true,
      sonGuncellemeTarihi: now,
      sonGuncelleyen: 'Kullanıcı',
      loglar: [...kayit.loglar, createLog('Kullanıcı', 'ONAY', 'Kaydet ve Onayla — Biten')],
    };
    persist(updated);
    showToast('Kayıt onaylandı ve kilitlendi');
  }, [kayit, persist, showToast]);

  const handleReopen = useCallback(() => {
    if (!kayit) return;
    const sebep = window.prompt('Geri açma nedeninizi yazın:');
    if (!sebep) return;
    const now = new Date().toISOString();
    const updated: UretimHazirlikKaydi = {
      ...kayit,
      status: 'IN_PROGRESS',
      kilitli: false,
      sonGuncellemeTarihi: now,
      sonGuncelleyen: 'Yönetici',
      loglar: [...kayit.loglar, createLog('Yönetici', 'GERI_ACMA', `Geri açma: ${sebep}`)],
    };
    persist(updated);
    showToast('Kayıt yeniden açıldı', 'info');
  }, [kayit, persist, showToast]);

  if (!kayit) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-gray-500">Kayıt bulunamadı.</p>
        <button onClick={() => navigate('/module/2/uretim-hazirlik')} className="mt-4 text-blue-600 text-sm">
          ← Listeye dön
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-[1500px]">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[99999] px-4 py-3 rounded-lg shadow-lg text-white text-sm ${
          toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'
        }`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/module/2/uretim-hazirlik')} className="text-sm text-gray-500 flex items-center gap-1 hover:text-gray-700">
          <ArrowLeft size={16} /> Listeye Dön
        </button>
        <div className="flex items-center gap-2">
          {!isLocked && (
            <>
              <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                <Save size={16} /> Ara Kaydet
              </button>
              <button onClick={handleApprove} className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                <CheckCircle2 size={16} /> Kaydet ve Onayla
              </button>
            </>
          )}
          {isLocked && (
            <button onClick={handleReopen} className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600">
              <Unlock size={16} /> Geri Aç (Yönetici)
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div><span className="text-gray-400">Numune No:</span> <strong>{kayit.numuneNo}</strong></div>
            <div><span className="text-gray-400">Müşteri:</span> <strong>{kayit.urunKarti.musteriKodu || '-'}</strong></div>
            <div><span className="text-gray-400">Örmeci Artikel:</span> <strong>{kayit.urunKarti.ormeciArtikelKodu || '-'}</strong></div>
            <div><span className="text-gray-400">Ürün:</span> <strong>{kayit.urunKarti.urunTanimi || '-'}</strong></div>
          </div>
          <div className="flex items-center gap-3">
            {isLocked && (
              <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                <Lock size={12} /> Kilitli
              </span>
            )}
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              kayit.status === 'COMPLETED_LOCKED' ? 'bg-green-100 text-green-800' :
              kayit.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {STATUS_LABELS[kayit.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-2 flex gap-0.5 overflow-x-auto">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4">
          {activeTab === 'urun' && <UrunHazirlikKartiTab kayit={kayit} locked={isLocked} updateField={updateUrunKarti} updateIplik={updateIplik} addIplik={addIplikSatiri} removeIplik={removeIplikSatiri} updateOlcu={updateOlcu} addOlcu={addOlcuSatiri} />}
          {activeTab === 'gramaj' && <GramajTab kayit={kayit} locked={isLocked} updateSatir={updateGramajSatir} />}
          {activeTab === 'yikama' && <YikamaTab kayit={kayit} locked={isLocked} updateField={updateYikama} updateAdim={updateYikamaAdim} />}
          {activeTab === 'forma' && <FormaTab kayit={kayit} locked={isLocked} updateField={updateForma} />}
          {activeTab === 'makina' && <MakinaKartiTab kayit={kayit} />}
          {activeTab === 'onay' && <OnayTab kayit={kayit} onSave={handleSave} onApprove={handleApprove} onReopen={handleReopen} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SEKME 1: ÜRÜN HAZIRLIK KARTI
// ============================================================
function UrunHazirlikKartiTab({ kayit, locked, updateField, updateIplik, addIplik, removeIplik, updateOlcu, addOlcu }: {
  kayit: UretimHazirlikKaydi; locked: boolean;
  updateField: (f: string, v: any) => void;
  updateIplik: (i: number, f: keyof IplikSatiri, v: string) => void;
  addIplik: () => void;
  removeIplik: (i: number) => void;
  updateOlcu: (i: number, f: keyof OlcuSatiri, v: string) => void;
  addOlcu: () => void;
}) {
  const k = kayit.urunKarti;

  const handleUrunPdfView = async () => {
    // TODO: PDF özelliği şu an devre dışı — jspdf dependency eklenmediği için.
    // İleride @react-pdf/renderer ile uyarlanacak.
    alert('PDF export özelliği henüz aktif değildir.');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button
          onClick={handleUrunPdfView}
          className="flex items-center gap-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
        >
          <FileDown size={16} /> Ürün Kartı Görüntüle (PDF)
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FormField label="Ürün Tanımı" required>
          <FieldInput value={k.urunTanimi} onChange={v => updateField('urunTanimi', v)} disabled={locked} />
        </FormField>
        <FormField label="Müşteri Kodu" required>
          <LookupSelect value={k.musteriKodu} onChange={v => updateField('musteriKodu', v)} options={MUSTERI_KODLARI} disabled={locked} />
        </FormField>
        <FormField label="Örmeci Artikel Kodu" required>
          <FieldInput value={k.ormeciArtikelKodu} onChange={v => updateField('ormeciArtikelKodu', v)} disabled={locked} />
        </FormField>
        <FormField label="Müşteri Artikel Kodu">
          <FieldInput value={k.musteriArtikelKodu} onChange={v => updateField('musteriArtikelKodu', v)} disabled={locked} />
        </FormField>
        <FormField label="Hazırlayan">
          <LookupSelect value={k.hazirlayan} onChange={v => updateField('hazirlayan', v)} options={HAZIRLAYANLAR} disabled={locked} />
        </FormField>
        <ReadonlyField label="Numune Tarihi" value={k.numuneTarihi} />
        <FormField label="Boy">
          <LookupSelect value={k.boy} onChange={v => updateField('boy', v)} options={BOYLAR} disabled={locked} />
        </FormField>
        <FormField label="Burun Kapama">
          <LookupSelect value={k.burunKapama} onChange={v => updateField('burunKapama', v)} options={BURUN_DIKIS_TIPLERI} disabled={locked} />
        </FormField>
        <FormField label="Yıkama">
          <LookupSelect value={k.yikama} onChange={v => updateField('yikama', v)} options={YIKAMA_TIPLERI} disabled={locked} />
        </FormField>
        <FormField label="Üretim Zamanı (sn)">
          <FieldInput value={k.uretimZamani} onChange={v => updateField('uretimZamani', v)} disabled={locked} placeholder="sn" />
        </FormField>
        <FormField label="İğne Sayısı">
          <LookupSelect value={k.igneSayisi} onChange={v => updateField('igneSayisi', v)} options={IGNE_SAYILARI} disabled={locked} />
        </FormField>
        <FormField label="Çap">
          <LookupSelect value={k.cap} onChange={v => updateField('cap', v)} options={CAP_DEGERLERI} disabled={locked} />
        </FormField>
        <FormField label="Kalınlık">
          <LookupSelect value={k.kalinlik} onChange={v => updateField('kalinlik', v)} options={KALINLIK_DEGERLERI} disabled={locked} />
        </FormField>
        <FormField label="Makina Modeli">
          <LookupSelect value={k.makinaModeli} onChange={v => updateField('makinaModeli', v)} options={MAKINE_MODELLERI} disabled={locked} />
        </FormField>
        <FormField label="Makina No">
          <FieldInput value={k.makinaNo} onChange={v => updateField('makinaNo', v)} disabled={locked} />
        </FormField>
        <FormField label="Çift Ağırlığı (gr)">
          <FieldInput value={k.ciftAgirligi} onChange={v => updateField('ciftAgirligi', v)} disabled={locked} placeholder="gr" />
        </FormField>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">
            İplik Tablosu
            <span className="ml-2 text-xs font-normal text-gray-400">({k.iplikler.length}/{MAX_IPLIK_ROW_COUNT})</span>
          </h3>
          {!locked && k.iplikler.length < MAX_IPLIK_ROW_COUNT && (
            <button onClick={addIplik} className="text-xs text-blue-600 hover:text-blue-800">+ Satır Ekle</button>
          )}
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-2 text-left font-semibold text-gray-600 w-8">#</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[180px]">TEKNİK GİRİŞ</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[80px]">MEKİK</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[120px]">DENYE</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[60px]">KAT</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[140px]">İPLİK CİNSİ</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[120px]">İPLİK TANIMI</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[80px]">RENK</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[80px]">RENK KODU</th>
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[120px]">TEDARİKÇİ</th>
                {!locked && <th className="py-2 px-2 w-8"></th>}
              </tr>
            </thead>
            <tbody>
              {k.iplikler.map((ip, idx) => (
                <tr key={ip.id} className="border-t border-gray-100 hover:bg-blue-50/30">
                  <td className="py-1 px-2 text-gray-400">{idx + 1}</td>
                  <td className="py-1 px-1"><LookupSelect value={ip.iplikYeri} onChange={v => updateIplik(idx, 'iplikYeri', v)} options={MEKIK_TANIMLARI} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><LookupSelect value={ip.mekikKodu} onChange={v => updateIplik(idx, 'mekikKodu', v)} options={MEKIK_KODLARI} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><LookupSelect value={ip.denye} onChange={v => updateIplik(idx, 'denye', v)} options={IPLIK_NUMARALARI} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><LookupSelect value={ip.kat} onChange={v => updateIplik(idx, 'kat', v)} options={KAT_DEGERLERI} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><LookupSelect value={ip.iplikCinsi} onChange={v => updateIplik(idx, 'iplikCinsi', v)} options={IPLIK_CINSLERI} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={ip.iplikTanimi} onChange={v => updateIplik(idx, 'iplikTanimi', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={ip.renk} onChange={v => updateIplik(idx, 'renk', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={ip.renkKodu} onChange={v => updateIplik(idx, 'renkKodu', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><LookupSelect value={ip.tedarikci} onChange={v => updateIplik(idx, 'tedarikci', v)} options={TEDARIKCILER} disabled={locked} className="w-full text-xs" /></td>
                  {!locked && (
                    <td className="py-1 px-1">
                      <button onClick={() => removeIplik(idx)} className="text-red-400 hover:text-red-600" title="Satırı sil">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-700">Makine Çıkış Ölçüleri</h3>
          {!locked && (
            <button onClick={addOlcu} className="text-xs text-blue-600 hover:text-blue-800">+ Boy Ekle</button>
          )}
        </div>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[80px]">BOY</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Lastik Boyu</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Lastik Eni</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Konç Boyu</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Tenis Boyu</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Taban Boyu</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Lastik Streçi</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Konç Streçi</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Taban Streçi</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Topuk Streçi</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Konç Mek.</th>
                <th className="py-2 px-1 text-left font-semibold text-gray-600">Taban Mek.</th>
              </tr>
            </thead>
            <tbody>
              {k.olculer.map((o, idx) => (
                <tr key={o.id} className="border-t border-gray-100">
                  <td className="py-1 px-1"><LookupSelect value={o.boy} onChange={v => updateOlcu(idx, 'boy', v)} options={BOYLAR} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.lastikBoyu} onChange={v => updateOlcu(idx, 'lastikBoyu', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.lastikEni} onChange={v => updateOlcu(idx, 'lastikEni', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.koncBoyu} onChange={v => updateOlcu(idx, 'koncBoyu', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.tenisBoyu} onChange={v => updateOlcu(idx, 'tenisBoyu', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.tabanBoyu} onChange={v => updateOlcu(idx, 'tabanBoyu', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.lastikStreci} onChange={v => updateOlcu(idx, 'lastikStreci', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.koncStreci} onChange={v => updateOlcu(idx, 'koncStreci', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.tabanStreci} onChange={v => updateOlcu(idx, 'tabanStreci', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.topukStreci} onChange={v => updateOlcu(idx, 'topukStreci', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.koncMekanik} onChange={v => updateOlcu(idx, 'koncMekanik', v)} disabled={locked} className="w-16 text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={o.tabanMekanik} onChange={v => updateOlcu(idx, 'tabanMekanik', v)} disabled={locked} className="w-16 text-xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FormField label="Not">
        <textarea value={k.not} onChange={e => updateField('not', e.target.value)} disabled={locked}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 disabled:bg-gray-100" />
      </FormField>
    </div>
  );
}

// ============================================================
// SEKME 2: GRAMAJ
// ============================================================
function GramajTab({ kayit, locked, updateSatir }: {
  kayit: UretimHazirlikKaydi; locked: boolean;
  updateSatir: (i: number, f: keyof GramajSatiri, v: string) => void;
}) {
  const g = kayit.gramaj;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-gray-50 p-3 rounded-lg">
        <ReadonlyField label="Müşteri Kodu" value={kayit.urunKarti.musteriKodu} />
        <ReadonlyField label="Ürün Kodu" value={kayit.urunKarti.ormeciArtikelKodu} />
        <ReadonlyField label="İğne Sayısı" value={kayit.urunKarti.igneSayisi} />
        <ReadonlyField label="Makina No" value={kayit.urunKarti.makinaNo} />
        <ReadonlyField label="Makina Türü" value={kayit.urunKarti.makinaModeli} />
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-2 px-2 text-left font-semibold text-gray-600 w-8">#</th>
              <th className="py-2 px-2 text-left font-semibold text-gray-600 min-w-[150px]">TEKNİK GİRİŞ</th>
              <th className="py-2 px-2 text-left font-semibold text-gray-600">MEKİK</th>
              <th className="py-2 px-2 text-left font-semibold text-gray-600">DENYE</th>
              <th className="py-2 px-2 text-left font-semibold text-gray-600">KAT</th>
              <th className="py-2 px-2 text-left font-semibold text-gray-600">İPLİK CİNSİ</th>
              <th className="py-2 px-2 text-left font-semibold text-gray-600">TEDARİKÇİ</th>
              <th className="py-2 px-2 text-center font-semibold text-blue-700 bg-blue-50 min-w-[90px]">Örgüden Önce</th>
              <th className="py-2 px-2 text-center font-semibold text-blue-700 bg-blue-50 min-w-[90px]">Örgüden Sonra</th>
              <th className="py-2 px-2 text-center font-semibold text-green-700 bg-green-50 min-w-[90px]">6 Çift</th>
              <th className="py-2 px-2 text-center font-semibold text-green-700 bg-green-50 min-w-[90px]">1 Düzine</th>
            </tr>
          </thead>
          <tbody>
            {g.satirlar.map((s, idx) => (
              <tr key={s.id} className="border-t border-gray-100">
                <td className="py-1 px-2 text-gray-400">{idx + 1}</td>
                <td className="py-1 px-2 text-gray-600">{s.iplikYeri || '-'}</td>
                <td className="py-1 px-2 text-gray-600">{s.mekikKodu || '-'}</td>
                <td className="py-1 px-2 text-gray-600">{s.denye || '-'}</td>
                <td className="py-1 px-2 text-gray-600">{s.kat || '-'}</td>
                <td className="py-1 px-2 text-gray-600">{s.iplikCinsi || '-'}</td>
                <td className="py-1 px-2 text-gray-600">{s.tedarikci || '-'}</td>
                <td className="py-1 px-1 bg-blue-50/30">
                  <FieldInput value={s.orgudenOnceAgirlik} onChange={v => updateSatir(idx, 'orgudenOnceAgirlik', v)} type="number" disabled={locked} className="w-20 text-xs text-center" />
                </td>
                <td className="py-1 px-1 bg-blue-50/30">
                  <FieldInput value={s.orgudenSonraAgirlik} onChange={v => updateSatir(idx, 'orgudenSonraAgirlik', v)} type="number" disabled={locked} className="w-20 text-xs text-center" />
                </td>
                <td className="py-1 px-2 text-center text-green-700 font-medium bg-green-50/30">{s.kullanilanMiktar6Cift.toFixed(2)}</td>
                <td className="py-1 px-2 text-center text-green-700 font-medium bg-green-50/30">{s.kullanilanMiktar1Duzine.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold text-sm">
              <td colSpan={9} className="py-2 px-2 text-right">TOPLAM:</td>
              <td className="py-2 px-2 text-center text-green-800">{g.toplam6Cift.toFixed(2)}</td>
              <td className="py-2 px-2 text-center text-green-800">{g.toplam1Duzine.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-yellow-50/50 p-3 rounded-lg border border-yellow-100">
        <ReadonlyField label="Burun Dikişi" value={g.burunDikisi} />
        <ReadonlyField label="Yıkama" value={g.yikamaAgirlik} />
        <ReadonlyField label="1 Çift Ağırlığı (gr)" value={g.birCiftAgirligi} />
        <ReadonlyField label="1 Düzine Ağırlığı (gr)" value={g.birDuzineAgirligi.toFixed(2)} />
        <ReadonlyField label="Genel Toplam (6 Çift)" value={g.genelToplam6Cift.toFixed(2)} />
        <ReadonlyField label="Genel Toplam (1 Dz)" value={g.genelToplam1Duzine.toFixed(2)} />
        <ReadonlyField label="Fark (6 Çift)" value={g.fark6Cift.toFixed(2)} />
        <ReadonlyField label="Fark (1 Düzine)" value={g.fark1Duzine.toFixed(2)} />
      </div>

      <FormField label="Not">
        <textarea value={g.not} onChange={() => {}} disabled={locked}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-16 disabled:bg-gray-100" />
      </FormField>
    </div>
  );
}

// ============================================================
// SEKME 3: YIKAMA
// ============================================================
function YikamaTab({ kayit, locked, updateField, updateAdim }: {
  kayit: UretimHazirlikKaydi; locked: boolean;
  updateField: (f: string, v: any) => void;
  updateAdim: (i: number, f: string, v: string) => void;
}) {
  const y = kayit.yikama;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <FormField label="Yıkama Yeri">
          <FieldInput value={y.yikamaYeri} onChange={v => updateField('yikamaYeri', v)} disabled={locked} />
        </FormField>
        <FormField label="Yıkama Tipi">
          <LookupSelect value={y.yikamaTipi} onChange={v => updateField('yikamaTipi', v)} options={YIKAMA_TIPLERI} disabled={locked} />
        </FormField>
        <ReadonlyField label="Müşteri Kodu" value={y.musteriKodu} />
        <ReadonlyField label="Örmeci Artikel No" value={y.ormeciArtikelNo} />
        <FormField label="Yıkama Program Kodu">
          <FieldInput value={y.yikamaProgramKodu} onChange={v => updateField('yikamaProgramKodu', v)} disabled={locked} />
        </FormField>
        <FormField label="Sorumlu">
          <FieldInput value={y.sorumlu} onChange={v => updateField('sorumlu', v)} disabled={locked} />
        </FormField>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Yıkama Adımları</h3>
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="py-2 px-2 font-semibold text-gray-600">Adım</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Yumuşatıcı Süresi</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Buhar Süresi</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Soğutma Süresi</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Soğutma °C</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Kurutma Süresi</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Kurutma °C</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Yumuşatıcı</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Yum. Miktarı</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Silikon Mkt.</th>
                <th className="py-2 px-2 font-semibold text-gray-600">Kimyasal Mkt.</th>
              </tr>
            </thead>
            <tbody>
              {y.adimlar.map((a, idx) => (
                <tr key={a.adim} className="border-t border-gray-100">
                  <td className="py-1 px-2 text-center font-medium text-gray-600">{a.adim}</td>
                  <td className="py-1 px-1"><FieldInput value={a.yumusaticiSuresi} onChange={v => updateAdim(idx, 'yumusaticiSuresi', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={a.buharSuresi} onChange={v => updateAdim(idx, 'buharSuresi', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={a.sogutmaSuresi} onChange={v => updateAdim(idx, 'sogutmaSuresi', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={a.sogutmaDerecesi} onChange={v => updateAdim(idx, 'sogutmaDerecesi', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={a.kurutmaSuresi} onChange={v => updateAdim(idx, 'kurutmaSuresi', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={a.kurutmaDerecesi} onChange={v => updateAdim(idx, 'kurutmaDerecesi', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={a.kullanilanYumusatici} onChange={v => updateAdim(idx, 'kullanilanYumusatici', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={a.yumusaticiMiktari} onChange={v => updateAdim(idx, 'yumusaticiMiktari', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={a.silikonMiktari} onChange={v => updateAdim(idx, 'silikonMiktari', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={a.kimyasalMiktari} onChange={v => updateAdim(idx, 'kimyasalMiktari', v)} disabled={locked} className="w-full text-xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FormField label="Açıklama">
        <textarea value={y.aciklama} onChange={e => updateField('aciklama', e.target.value)} disabled={locked}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-20 disabled:bg-gray-100" />
      </FormField>
    </div>
  );
}

// ============================================================
// SEKME 4: FORMA
// ============================================================
function FormaTab({ kayit, locked, updateField }: {
  kayit: UretimHazirlikKaydi; locked: boolean;
  updateField: (f: string, v: any) => void;
}) {
  const f = kayit.forma;
  const config = f.formaCesidi ? FORMA_PARAMETRE_CONFIG[f.formaCesidi] : null;

  const updateParam = (idx: number, value: string) => {
    const params = [...f.parametreler];
    params[idx] = { ...params[idx], deger: value };
    updateField('parametreler', params);
  };

  const updateKalip = (idx: number, value: string) => {
    const kaliplar = [...f.kalipNolari];
    kaliplar[idx] = value;
    updateField('kalipNolari', kaliplar);
  };

  const handleCesidiChange = (v: string) => {
    updateField('formaCesidi', v as FormaCesidi);
    if (v && FORMA_PARAMETRE_CONFIG[v]) {
      const cfg = FORMA_PARAMETRE_CONFIG[v];
      const etiketler = [cfg.etiket1, cfg.etiket2, cfg.etiket3, cfg.etiket4, cfg.etiket5, cfg.etiket6];
      const params = etiketler.map((e, i) => ({ etiket: e, deger: f.parametreler[i]?.deger || '' }));
      updateField('parametreler', params);
    }
  };

  return (
    <div className="space-y-6">
      <FormField label="Forma Çeşidi" required>
        <LookupSelect
          value={f.formaCesidi}
          onChange={handleCesidiChange}
          options={['EL_KALIBI', 'CORTESE', 'TECNOPEA']}
          disabled={locked}
          className="max-w-xs"
        />
      </FormField>

      {config && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Parametreler ({f.formaCesidi?.replace('_', ' ')})</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {f.parametreler.map((p, idx) => (
              p.etiket ? (
                <FormField key={idx} label={p.etiket}>
                  <FieldInput value={p.deger} onChange={v => updateParam(idx, v)} disabled={locked} type="number" />
                </FormField>
              ) : null
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Kalıp Numaraları (Boy bazlı)</h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {f.kalipNolari.map((kn, idx) => (
            <FormField key={idx} label={`Kalıp No ${idx + 1}`}>
              <FieldInput value={kn} onChange={v => updateKalip(idx, v)} disabled={locked} />
            </FormField>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SEKME 5: MAKİNA KARTI
// ============================================================
function MakinaKartiTab({ kayit }: { kayit: UretimHazirlikKaydi }) {
  const k = kayit.urunKarti;

  const handlePdfView = async () => {
    // TODO: PDF özelliği şu an devre dışı — jspdf dependency eklenmediği için.
    // İleride @react-pdf/renderer ile uyarlanacak.
    alert('PDF export özelliği henüz aktif değildir.');
  };

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">Üretim Bilgi Formu (A5 Özet)</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePdfView}
            className="flex items-center gap-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
          >
            <FileDown size={16} /> Makina Kartı Görüntüle (PDF)
          </button>
        </div>
      </div>

      <div className="border-2 border-gray-400 rounded-lg p-4 bg-white print:border-black space-y-3 text-xs">
        <div className="text-center font-bold text-sm border-b pb-2">ÜRETİM BİLGİ FORMU</div>

        <div className="grid grid-cols-2 gap-2">
          <div><span className="text-gray-500">Desen Tanımı:</span> <strong>{k.urunTanimi}</strong></div>
          <div><span className="text-gray-500">Müşteri Kodu:</span> <strong>{k.musteriKodu}</strong></div>
          <div><span className="text-gray-500">Ürün Kodu:</span> <strong>{k.ormeciArtikelKodu}</strong></div>
          <div><span className="text-gray-500">Numune No:</span> <strong>{kayit.numuneNo}</strong></div>
          <div><span className="text-gray-500">Makina No:</span> <strong>{k.makinaNo}</strong></div>
          <div><span className="text-gray-500">Tarih:</span> <strong>{k.numuneTarihi}</strong></div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-[10px]">
              <th className="border border-gray-300 px-1 py-0.5">TEKNİK GİRİŞ</th>
              <th className="border border-gray-300 px-1 py-0.5">MEKİK</th>
              <th className="border border-gray-300 px-1 py-0.5">DENYE</th>
              <th className="border border-gray-300 px-1 py-0.5">Kat</th>
              <th className="border border-gray-300 px-1 py-0.5">RENK</th>
              <th className="border border-gray-300 px-1 py-0.5">İPLİK CİNSİ</th>
              <th className="border border-gray-300 px-1 py-0.5">TEDARİKÇİ</th>
            </tr>
          </thead>
          <tbody>
            {k.iplikler.filter(ip => ip.iplikYeri).map((ip, idx) => (
              <tr key={idx} className="text-[10px]">
                <td className="border border-gray-300 px-1 py-0.5">{ip.iplikYeri}</td>
                <td className="border border-gray-300 px-1 py-0.5">{ip.mekikKodu}</td>
                <td className="border border-gray-300 px-1 py-0.5">{ip.denye}</td>
                <td className="border border-gray-300 px-1 py-0.5">{ip.kat}</td>
                <td className="border border-gray-300 px-1 py-0.5">{ip.renk}</td>
                <td className="border border-gray-300 px-1 py-0.5">{ip.iplikCinsi}</td>
                <td className="border border-gray-300 px-1 py-0.5">{ip.tedarikci}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="text-[10px] font-semibold mt-2">ÖLÇÜLER</div>
        <table className="w-full border-collapse text-[10px]">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-1 py-0.5">Ölçü</th>
              {k.olculer.filter(o => o.boy).map((o, i) => (
                <th key={i} className="border border-gray-300 px-1 py-0.5">{o.boy}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {['lastikBoyu','lastikEni','koncBoyu','tenisBoyu','tabanBoyu','lastikStreci','koncStreci','tabanStreci','topukStreci'].map(field => (
              <tr key={field}>
                <td className="border border-gray-300 px-1 py-0.5 font-medium">{field.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}</td>
                {k.olculer.filter(o => o.boy).map((o, i) => (
                  <td key={i} className="border border-gray-300 px-1 py-0.5 text-center">{(o as any)[field] || '-'}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {k.ciftAgirligi && <div className="text-[10px] mt-2"><span className="font-semibold">Çift Ağırlığı:</span> {k.ciftAgirligi} gr</div>}
        {k.not && <div className="text-[10px] mt-1"><span className="font-semibold">NOT:</span> {k.not}</div>}
      </div>
    </div>
  );
}

// ============================================================
// SEKME 6: ONAY & KİLİTLEME
// ============================================================
function OnayTab({ kayit, onSave, onApprove, onReopen }: {
  kayit: UretimHazirlikKaydi;
  onSave: () => void; onApprove: () => void; onReopen: () => void;
}) {
  const isLocked = kayit.status === 'COMPLETED_LOCKED';
  const validation = validateForApproval(kayit);

  return (
    <div className="space-y-6 max-w-2xl">
      <div className={`p-4 rounded-lg border ${validation.valid ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
        <h3 className={`text-sm font-semibold mb-2 ${validation.valid ? 'text-green-800' : 'text-yellow-800'}`}>
          {validation.valid ? '✓ Tüm zorunlu alanlar dolu — onaya hazır' : '⚠ Eksik alanlar var'}
        </h3>
        {!validation.valid && (
          <ul className="text-sm text-yellow-700 space-y-1">
            {validation.errors.map((e, i) => <li key={i}>• {e}</li>)}
          </ul>
        )}
      </div>

      <div className="space-y-3">
        {!isLocked && (
          <>
            <button onClick={onSave} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Save size={18} /> Ara Kaydet
            </button>
            <button onClick={onApprove} disabled={!validation.valid}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
              <CheckCircle2 size={18} /> Kaydet ve Onayla
            </button>
          </>
        )}
        {isLocked && (
          <button onClick={onReopen} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <Unlock size={18} /> Geri Aç (Yönetici — Sebep Zorunlu)
          </button>
        )}
      </div>

      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">İşlem Geçmişi</h3>
        <div className="border border-gray-200 rounded-lg divide-y divide-gray-100 max-h-64 overflow-y-auto">
          {kayit.loglar.slice().reverse().map(log => (
            <div key={log.id} className="px-3 py-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{log.aksiyon}</span>
                <span className="text-gray-400">{new Date(log.tarih).toLocaleString('tr-TR')}</span>
              </div>
              <div className="text-gray-500 mt-0.5">{log.detay} — {log.kullanici}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}