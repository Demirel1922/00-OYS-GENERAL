import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft, Save, CheckCircle2, Lock, Unlock,
} from 'lucide-react';
import type {
  UretimHazirlikKaydi, IplikSatiri,
  OlcuSatiri, GramajSatiri,
} from '../types';
import { STATUS_LABELS } from '../types';
import {
  STORAGE_KEY, hesaplaGramajToplamlari, validateForApproval, createLog,
  MAX_IPLIK_ROW_COUNT,
} from '../utils/calculations';
import { createEmptyIplikSatiri, createEmptyOlcuSatiri, createEmptyGramajSatiri } from '../utils/factory';
import { UrunHazirlikKartiTab } from '../components/UrunHazirlikKartiTab';
import { GramajTab } from '../components/GramajTab';
import { YikamaTab } from '../components/YikamaTab';
import { FormaTab } from '../components/FormaTab';
import { MakinaKartiTab } from '../components/MakinaKartiTab';
import { OnayTab } from '../components/OnayTab';

type TabKey = 'urun' | 'gramaj' | 'yikama' | 'forma' | 'makina' | 'onay';

// Ürün tanımı alanları kilitli durumda bile düzenlenebilir
const URUN_TANIMI_FIELDS = ['urunTanimi', 'musteriKodu', 'ormeciArtikelKodu', 'musteriArtikelKodu'];

const TABS: { key: TabKey; label: string }[] = [
  { key: 'urun', label: 'Ürün Hazırlık Kartı' },
  { key: 'gramaj', label: 'Gramaj' },
  { key: 'yikama', label: 'Yıkama' },
  { key: 'forma', label: 'Forma' },
  { key: 'makina', label: 'Makina Kartı' },
  { key: 'onay', label: 'Onay & Kilitleme' },
];

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
    if (!kayit) return;
    if (isLocked && !URUN_TANIMI_FIELDS.includes(field)) return;
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