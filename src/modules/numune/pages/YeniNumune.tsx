import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, CheckCircle, Loader2, X, Check, Edit3 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { NumuneGeneralInfoForm } from '../components/NumuneGeneralInfoForm';
import { NumuneOlcuForm } from '../components/NumuneOlcuForm';
import { NumuneIplikForm } from '../components/NumuneIplikForm';
import { useRenkStore } from '@/store/renkStore';
import { useIplikDetayStore } from '@/store/iplikDetayStore';
import { useKalinlikStore } from '@/store/kalinlikStore';
import { useTedarikciStore } from '@/store/tedarikciStore';
import { useTedarikciKategoriStore } from '@/store/tedarikciKategoriStore';
import { useLookupStore } from '@/store/lookupStore';
import { useArtikelStore } from '@/store/artikelStore';
import { useMusteriStore } from '@/store/musteriStore';
import { generateNumuneNo, commitNumuneSira } from '@/lib/db';
import { resolveGenderLabel } from '@/modules/sales-orders/domain/types';

interface MeasurementRow {
  id: number;
  bedenler: string;
  renk: string;
  lastikEni: string;
  lastikYuksekligi: string;
  koncEni: string;
  ayakEni: string;
  koncBoyu: string;
  tabanBoyu: string;
  lastikStreci: string;
  koncStreciAyakStreci: string;
  topukStreci: string;
  bord: string;
  miktar: number;
  birim: string;
}

interface YarnRow {
  id: number;
  kullanimYeri: string;
  detay: string;
  denye: string;
  cins: string;
  renkKodu: string;
  renk: string;
  tedarikci: string;
  not: string;
  isFixed: boolean;
}

interface Toast {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}


const getFixedYarnRows = (): YarnRow[] => [
  { id: 1, kullanimYeri: 'LASTİK', detay: 'Lastik Elastiği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 2, kullanimYeri: 'LASTİK', detay: 'Lastik Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 3, kullanimYeri: 'LASTİK', detay: 'Lastik Takviyesi', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 4, kullanimYeri: 'LASTİK', detay: 'Astar', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 5, kullanimYeri: 'KONÇ', detay: 'Konç Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 6, kullanimYeri: 'KONÇ', detay: 'Konç Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 7, kullanimYeri: 'KONÇ', detay: 'Konç İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 8, kullanimYeri: 'TOPUK', detay: 'Topuk Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 9, kullanimYeri: 'TOPUK', detay: 'Topuk İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 10, kullanimYeri: 'TABAN', detay: 'Taban Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 11, kullanimYeri: 'TABAN', detay: 'Taban Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 12, kullanimYeri: 'TABAN', detay: 'Taban İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 13, kullanimYeri: 'TABAN ALTI', detay: 'Tabanaltı Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 14, kullanimYeri: 'TABAN ALTI', detay: 'Tabanaltı İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 15, kullanimYeri: 'BURUN', detay: 'Burun Zemin İpliği', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 16, kullanimYeri: 'BURUN', detay: 'Burun İplik Altı', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 17, kullanimYeri: 'BURUN DİKİŞ İPLİĞİ', detay: 'Rosso İşe', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
  { id: 18, kullanimYeri: 'BURUN DİKİŞ İPLİĞİ', detay: 'Tek Sıra İşe', denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: true },
];

const getInitialDesenRow = (id: number, num: number): YarnRow => ({
  id, kullanimYeri: 'DESEN İPLİĞİ', detay: `Desen ${num}`, denye: '', cins: '', renkKodu: '', renk: '', tedarikci: '', not: '', isFixed: false
});

const initialFormData = {
  generalInfo: {
    numuneNo: '',
    cinsiyet: '',
    numuneTipi: '',
    sebep: '',
    musteriKodu: '',
    musteriArtikelKodu: '',
    musteriMarkasi: '',
    corapTipi: '',
    corapDokusu: '',
    igneSayisi: '',
    kovanCapi: '',
    formaBilgisi: '',
    formaSekli: '',
    yikama: '',
    olcuSekli: '',
    corapTanimi: '',
    deseneVerilisTarihi: '',
    hedefTarih: ''
  },
  measurements: [{
    id: 1, bedenler: '', renk: '', lastikEni: '', lastikYuksekligi: '',
    koncEni: '', ayakEni: '', koncBoyu: '', tabanBoyu: '',
    lastikStreci: '', koncStreciAyakStreci: '', topukStreci: '', bord: '',
    miktar: 1, birim: 'Çift'
  }] as MeasurementRow[],
  yarnInfo: [...getFixedYarnRows(), getInitialDesenRow(19, 1)] as YarnRow[],
  desenCount: 1
};

export function YeniNumune() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'general' | 'measurements' | 'yarn'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<Toast>({ show: false, message: '', type: 'success' });
  const [status, setStatus] = useState<'Taslak' | 'Beklemede' | 'Onayli'>('Taslak');
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const pendingRestoreRef = useRef<{ data: string; time: string | null } | null>(null);

  // Renk store entegrasyonu (sipariş modülü referans alındı)
  const { renkler, seedData: seedRenk } = useRenkStore();
  useEffect(() => { if (renkler.length === 0) seedRenk(); }, []);
  const aktifRenkler = useMemo(() => renkler.filter(r => r.durum === 'AKTIF'), [renkler]);

  // Boy (Beden) master data entegrasyonu — lookupStore üzerinden
  const { items: lookupItems, seedData: seedLookup, getSortedItemsByType } = useLookupStore();
  useEffect(() => { if (lookupItems.length === 0) seedLookup(); }, []);
  const boyListesi = useMemo(() => getSortedItemsByType('BEDEN'), [lookupItems]);
  const dokuListesi = useMemo(() => getSortedItemsByType('DOKU'), [lookupItems]);

  // İplik Bilgileri store entegrasyonları
  const { detaylar: iplikDetaylar, seedData: seedIplikDetay } = useIplikDetayStore();
  const { kalinliklar, seedData: seedKalinlik, getBirlesikGosterim } = useKalinlikStore();
  const { tedarikciler, seedData: seedTedarikci } = useTedarikciStore();
  const { kategoriler: tedarikciKategorileri, seedData: seedTedarikciKategori } = useTedarikciKategoriStore();

  // Müşteri store entegrasyonu (Bilgi Tanımları > Müşteriler)
  const { musteriler, seedData: seedMusteri } = useMusteriStore();

  // FAZ 2B: Artikel store entegrasyonu
  const { addArtikelFromNumune } = useArtikelStore();

  useEffect(() => {
    if (iplikDetaylar.length === 0) seedIplikDetay();
    if (kalinliklar.length === 0) seedKalinlik();
    if (tedarikciler.length === 0) seedTedarikci();
    if (tedarikciKategorileri.length === 0) seedTedarikciKategori();
    if (musteriler.length === 0) seedMusteri();
  }, []);

  const aktifIplikDetaylar = useMemo(() => iplikDetaylar.filter(d => d.durum === 'AKTIF'), [iplikDetaylar]);
  const aktifMusteriler = useMemo(() => musteriler.filter(m => m.durum === 'AKTIF'), [musteriler]);
  const aktifKalinliklar = useMemo(
    () => kalinliklar.filter(k => k.durum === 'AKTIF').map(k => ({ ...k, gosterim: getBirlesikGosterim(k) })),
    [kalinliklar, getBirlesikGosterim]
  );
  const iplikTedarikcileri = useMemo(() => {
    const iplikKategoriIds = tedarikciKategorileri
      .filter(k => k.kategoriAdi?.toLocaleLowerCase('tr').includes('iplik'))
      .map(k => k.id);
    return tedarikciler.filter(
      t => t.durum === 'AKTIF' && (t.kategoriIds || []).some(kid => iplikKategoriIds.includes(kid))
    );
  }, [tedarikciler, tedarikciKategorileri]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type }), 3000);
  }, []);

  const handleRestoreConfirm = () => {
    if (pendingRestoreRef.current) {
      setFormData(JSON.parse(pendingRestoreRef.current.data));
      if (pendingRestoreRef.current.time) setLastSaved(pendingRestoreRef.current.time);
      showToast('Önceki kayıt yüklendi', 'info');
      pendingRestoreRef.current = null;
    }
    setShowRestoreDialog(false);
  };

  const handleRestoreCancel = () => {
    pendingRestoreRef.current = null;
    setShowRestoreDialog(false);
  };

  useEffect(() => {
    if (location.state?.editMode && location.state?.numuneId) {
      setIsEditMode(true);
      setEditId(location.state.numuneId);
      const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
      const bulunan = liste.find((n: any) => n.id === location.state.numuneId);
      if (bulunan) {
        setFormData(prev => ({
          ...prev,
          generalInfo: { ...prev.generalInfo, ...bulunan.generalInfo },
          measurements: bulunan.measurements || prev.measurements,
          yarnInfo: bulunan.yarnInfo || prev.yarnInfo,
          desenCount: bulunan.desenCount || 1
        }));
        setStatus(bulunan.durum || 'TASLAK');
        showToast('Düzenleme modu aktif', 'info');
      }
    }
  }, [location, showToast]);

  useEffect(() => {
    if (!isEditMode) {
      const saved = localStorage.getItem('oys_numune_yeniFormData');
      const savedTime = localStorage.getItem('oys_numune_yeniLastSaved');
      if (saved) {
        pendingRestoreRef.current = { data: saved, time: savedTime };
        setShowRestoreDialog(true);
      }
    }
  }, [isEditMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      localStorage.setItem('oys_numune_yeniFormData', JSON.stringify(formData));
      localStorage.setItem('oys_numune_yeniLastSaved', new Date().toISOString());
      setLastSaved(new Date().toISOString());
    }, 30000);
    return () => clearInterval(interval);
  }, [formData]);

  useEffect(() => {
    if (formData.generalInfo.cinsiyet && !isEditMode) {
      generateNumuneNo(formData.generalInfo.cinsiyet).then(newNumuneNo => {
        setFormData(prev => ({
          ...prev,
          generalInfo: { ...prev.generalInfo, numuneNo: newNumuneNo }
        }));
      }).catch((err) => {
        if (err?.message === 'KAPASITE_DOLU') {
          showToast('Bu çorap grubu kodunda numune kapasitesi doldu (A0-Z9). Lütfen yeni bir çorap grubu seçin.', 'error');
          setFormData(prev => ({
            ...prev,
            generalInfo: { ...prev.generalInfo, numuneNo: '', cinsiyet: '' }
          }));
        } else {
          showToast('Numune numarası üretilemedi', 'error');
        }
      });
    }
  }, [formData.generalInfo.cinsiyet, isEditMode]);

  const handleGeneralChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      generalInfo: { ...prev.generalInfo, [field]: value }
    }));
  };

  const handleMeasurementChange = (rowIndex: number, field: keyof MeasurementRow, value: string | number) => {
    setFormData(prev => {
      const newMeasurements = [...prev.measurements];
      newMeasurements[rowIndex] = { ...newMeasurements[rowIndex], [field]: value };
      return { ...prev, measurements: newMeasurements };
    });
  };

  const addMeasurementRow = () => {
    if (formData.measurements.length >= 10) {
      showToast('En fazla 10 ölçü satırı eklenebilir', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      measurements: [...prev.measurements, {
        id: Date.now(), bedenler: '', renk: '', lastikEni: '', lastikYuksekligi: '',
        koncEni: '', ayakEni: '', koncBoyu: '', tabanBoyu: '',
        lastikStreci: '', koncStreciAyakStreci: '', topukStreci: '', bord: '',
        miktar: 1, birim: 'Çift'
      }]
    }));
  };

  const removeMeasurementRow = (index: number) => {
    if (formData.measurements.length <= 1) {
      showToast('En az bir ölçü satırı kalmalıdır', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      measurements: prev.measurements.filter((_, i) => i !== index)
    }));
  };

  const handleYarnChange = (index: number, field: keyof YarnRow, value: string) => {
    setFormData(prev => {
      const newYarnInfo = [...prev.yarnInfo];
      newYarnInfo[index] = { ...newYarnInfo[index], [field]: value };
      return { ...prev, yarnInfo: newYarnInfo };
    });
  };

  const addDesenRow = () => {
    if (formData.desenCount >= 10) {
      showToast('En fazla 10 desen eklenebilir', 'error');
      return;
    }
    const newCount = formData.desenCount + 1;
    setFormData(prev => ({
      ...prev,
      yarnInfo: [...prev.yarnInfo, getInitialDesenRow(18 + newCount, newCount)],
      desenCount: newCount
    }));
  };

  const removeDesenRow = (index: number) => {
    if (formData.desenCount <= 1) {
      showToast('En az bir desen satırı kalmalıdır', 'error');
      return;
    }
    setFormData(prev => ({
      ...prev,
      yarnInfo: prev.yarnInfo.filter((_, i) => i !== index),
      desenCount: prev.desenCount - 1
    }));
  };

  const isGeneralInfoComplete = () => {
    const g = formData.generalInfo;
    return g.cinsiyet?.trim() && g.numuneTipi?.trim() && g.sebep?.trim() && g.musteriKodu?.trim() && g.hedefTarih;
  };

  const hasValidMeasurement = () => {
    return formData.measurements.some(row => row.bedenler?.trim() && row.renk?.trim() && row.miktar >= 1);
  };

  const canAccessMeasurements = isGeneralInfoComplete();
  const canAccessYarn = canAccessMeasurements && hasValidMeasurement();

  const getMissingGeneralFields = () => {
    const g = formData.generalInfo;
    const missing = [];
    if (!g.cinsiyet?.trim()) missing.push('Çorap Grubu');
    if (!g.numuneTipi?.trim()) missing.push('Numune Tipi');
    if (!g.sebep?.trim()) missing.push('Sebep');
    if (!g.musteriKodu?.trim()) missing.push('Müşteri Kodu');
    if (!g.hedefTarih) missing.push('Hedef Tarih');
    return missing;
  };

  const handleTabClick = (tab: 'general' | 'measurements' | 'yarn') => {
    if (tab === 'measurements') {
      const missing = getMissingGeneralFields();
      if (missing.length > 0) {
        showToast(`Önce şu alanları doldurun: ${missing.join(', ')}`, 'error');
        return;
      }
    }
    if (tab === 'yarn') {
      if (!hasValidMeasurement()) {
        showToast('Ölçüler sekmesinde en az bir satırda Boy, Renk ve Miktar girilmelidir', 'error');
        return;
      }
    }
    setActiveTab(tab);
  };

  const validate = () => {
    const g = formData.generalInfo;
    if (!g.cinsiyet?.trim()) { showToast('Çorap Grubu zorunludur', 'error'); return false; }
    if (!g.numuneTipi?.trim()) { showToast('Numune Tipi zorunludur', 'error'); return false; }
    if (!g.sebep?.trim()) { showToast('Numunenin Sebebi zorunludur', 'error'); return false; }
    if (!g.musteriKodu?.trim()) { showToast('Müşteri Kodu zorunludur', 'error'); return false; }
    if (!g.hedefTarih) { showToast('Hedef Tarih zorunludur', 'error'); return false; }
    if (g.deseneVerilisTarihi && g.hedefTarih) {
      if (new Date(g.deseneVerilisTarihi) > new Date(g.hedefTarih)) {
        showToast('Desene veriliş tarihi, hedef tarihten sonra olamaz', 'error');
        return false;
      }
    }
    if (!hasValidMeasurement()) {
      showToast('Ölçüler sekmesinde en az bir satırda Boy, Renk ve Miktar girilmelidir', 'error');
      return false;
    }
    const hasYarnData = formData.yarnInfo.some(
      row => row.denye?.trim() || row.cins?.trim() || row.renkKodu?.trim() ||
             row.renk?.trim() || row.tedarikci?.trim() || row.not?.trim()
    );
    if (!hasYarnData) {
      showToast('İplik Bilgileri tamamen boş bırakılamaz', 'error');
      return false;
    }
    return true;
  };

  const calculateTotalMiktar = () => {
    return formData.measurements.reduce((acc, row) => acc + (row.miktar || 0), 0);
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    // Yeni kayıt ise sayacı kalıcı olarak ilerlet
    if (formData.generalInfo.numuneNo && !isEditMode) {
      await commitNumuneSira(formData.generalInfo.numuneNo);
    }
    const yeniNumune = {
      id: isEditMode ? editId : Date.now(),
      numuneNo: formData.generalInfo.numuneNo,
      musteri: formData.generalInfo.musteriKodu,
      musteriArtikelNo: formData.generalInfo.musteriArtikelKodu,
      refNo: '-',
      durum: 'Taslak',
      termin: formData.generalInfo.hedefTarih,
      miktar: calculateTotalMiktar(),
      gonderim: '-',
      numuneTipi: formData.generalInfo.numuneTipi,
      generalInfo: formData.generalInfo,
      measurements: formData.measurements,
      yarnInfo: formData.yarnInfo,
      desenCount: formData.desenCount,
      olusturmaTarihi: new Date().toISOString()
    };
    const mevcutListe = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    let yeniListe;
    if (isEditMode) {
      yeniListe = mevcutListe.map((n: any) => n.id === editId ? yeniNumune : n);
    } else {
      yeniListe = [yeniNumune, ...mevcutListe];
    }
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    setStatus('Taslak');
    localStorage.removeItem('oys_numune_yeniFormData');
    localStorage.removeItem('oys_numune_yeniLastSaved');
    showToast(isEditMode ? 'Güncellendi' : 'Taslak olarak kaydedildi', 'success');
    setIsSaving(false);
    navigate('/module/2/talepler', { state: { refresh: true, timestamp: Date.now() } });
  };

  const handleSaveAndApprove = async () => {
    if (!validate()) return;
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 500));
    // Yeni kayıt ise sayacı kalıcı olarak ilerlet
    if (formData.generalInfo.numuneNo && !isEditMode) {
      await commitNumuneSira(formData.generalInfo.numuneNo);
    }
    const yeniNumune = {
      id: isEditMode ? editId : Date.now(),
      numuneNo: formData.generalInfo.numuneNo,
      musteri: formData.generalInfo.musteriKodu,
      musteriArtikelNo: formData.generalInfo.musteriArtikelKodu,
      refNo: '-',
      durum: 'Beklemede',
      termin: formData.generalInfo.hedefTarih,
      miktar: calculateTotalMiktar(),
      gonderim: '-',
      numuneTipi: formData.generalInfo.numuneTipi,
      generalInfo: formData.generalInfo,
      measurements: formData.measurements,
      yarnInfo: formData.yarnInfo,
      desenCount: formData.desenCount,
      olusturmaTarihi: new Date().toISOString()
    };
    const mevcutListe = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    let yeniListe;
    if (isEditMode) {
      yeniListe = mevcutListe.map((n: any) => n.id === editId ? yeniNumune : n);
    } else {
      yeniListe = [yeniNumune, ...mevcutListe];
    }
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    setStatus('Beklemede');
    localStorage.removeItem('oys_numune_yeniFormData');
    localStorage.removeItem('oys_numune_yeniLastSaved');
    showToast(isEditMode ? 'Güncellendi ve Onaylandı' : 'Kaydedildi ve Onaylandı', 'success');

    // FAZ 2B: Numune onayı sonrası otomatik artikel oluşturma / bağlama
    try {
      const numuneId = (yeniNumune.id as number).toString();
      const result = addArtikelFromNumune({
        numuneId,
        numuneNo: formData.generalInfo.numuneNo,
        musteriKodu: formData.generalInfo.musteriKodu,
        musteriArtikelNo: formData.generalInfo.musteriArtikelKodu || '',
        urunTanimi: formData.generalInfo.corapTanimi || '',
        ormeciArtikelNo: formData.generalInfo.numuneNo || '',
        corapGrubu: resolveGenderLabel(formData.generalInfo.cinsiyet),
        corapTipi: formData.generalInfo.corapTipi || '',
      });
      if (!result.success) {
        showToast('Numune onaylandı ancak artikel tanımı oluşturulamadı. Lütfen Artikel Tanımları ekranını kontrol edin.', 'error');
      }
    } catch {
      showToast('Numune onaylandı ancak artikel tanımı oluşturulamadı. Lütfen Artikel Tanımları ekranını kontrol edin.', 'error');
    }

    setIsSaving(false);
    navigate('/module/2/talepler', { state: { refresh: true, timestamp: Date.now() } });
  };

  const getStatusBadgeColor = () => {
    switch (status) {
      case 'Taslak': return 'bg-gray-100 text-gray-600';
      case 'Beklemede': return 'bg-yellow-100 text-yellow-700';
      case 'Onayli': return 'bg-green-100 text-green-700';
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          toast.type === 'success' ? 'bg-green-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check size={18} /> : toast.type === 'error' ? <X size={18} /> : <Check size={18} />}
          {toast.message}
        </div>
      )}

      {/* Önceki kaydı geri yükleme dialog'u */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Önceki Kayıt Bulundu</AlertDialogTitle>
            <AlertDialogDescription>
              Önceki kaydınızı geri yüklemek ister misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleRestoreCancel}>Hayır</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreConfirm}>Evet, Yükle</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex justify-between items-start mb-4 border-b border-gray-200 pb-3">
          <div>
            <button onClick={() => navigate(-1)} className="text-sm text-gray-500 mb-1 flex items-center gap-1 hover:text-gray-700">
              <ArrowLeft size={14} /> Geri
            </button>
            <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Numune Düzenle' : 'Yeni Numune'}</h1>
            <p className="text-gray-500 text-sm">{isEditMode ? 'Mevcut numuneyi düzenleyin' : 'Yeni bir numune oluşturun'}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor()}`}>
              {status}
            </span>
            {lastSaved && (
              <span className="text-xs text-gray-400">
                {new Date(lastSaved).toLocaleTimeString()}
              </span>
            )}
            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 text-sm">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : isEditMode ? <Edit3 size={14} /> : <Save size={14} />}
              {isEditMode ? 'Güncelle' : 'Kaydet'}
            </button>
            <button onClick={handleSaveAndApprove} disabled={isSaving} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
              {isEditMode ? 'Güncelle & Onayla' : 'Kaydet & Onayla'}
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200 mb-4">
          <button onClick={() => handleTabClick('general')} className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
            Genel Bilgiler
          </button>
          <button onClick={() => handleTabClick('measurements')} className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${activeTab === 'measurements' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'} ${!canAccessMeasurements ? 'opacity-50' : ''}`}>
            Ölçüler
          </button>
          <button onClick={() => handleTabClick('yarn')} className={`px-3 py-1.5 text-sm font-medium transition-colors border-b-2 ${activeTab === 'yarn' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'} ${!canAccessYarn ? 'opacity-50' : ''}`}>
            İplik Bilgileri
          </button>
        </div>

        {activeTab === 'general' && (
          <NumuneGeneralInfoForm
            formData={formData}
            handleGeneralChange={handleGeneralChange}
            isEditMode={isEditMode}
            aktifMusteriler={aktifMusteriler}
            dokuListesi={dokuListesi}
          />
        )}

        {activeTab === 'measurements' && (
          <NumuneOlcuForm
            formData={formData}
            handleMeasurementChange={handleMeasurementChange}
            addMeasurementRow={addMeasurementRow}
            removeMeasurementRow={removeMeasurementRow}
            boyListesi={boyListesi}
            aktifRenkler={aktifRenkler}
          />
        )}

        {activeTab === 'yarn' && (
          <NumuneIplikForm
            formData={formData}
            handleYarnChange={handleYarnChange}
            addDesenRow={addDesenRow}
            removeDesenRow={removeDesenRow}
            aktifKalinliklar={aktifKalinliklar}
            aktifIplikDetaylar={aktifIplikDetaylar}
            aktifRenkler={aktifRenkler}
            iplikTedarikcileri={iplikTedarikcileri}
          />
        )}
      </div>
    </div>
  );
}