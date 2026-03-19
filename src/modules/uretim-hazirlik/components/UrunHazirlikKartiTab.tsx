import { useEffect, useMemo } from 'react';
import { FileDown, Trash2 } from 'lucide-react';
import type { UretimHazirlikKaydi, IplikSatiri, OlcuSatiri } from '../types';
import { MAX_IPLIK_ROW_COUNT } from '../utils/calculations';
import {
  IGNE_SAYILARI, CAP_DEGERLERI, KALINLIK_DEGERLERI,
  MAKINE_MODELLERI, YIKAMA_TIPLERI, BURUN_DIKIS_TIPLERI, HAZIRLAYANLAR,
  MEKIK_TANIMLARI, MEKIK_KODLARI, KAT_DEGERLERI,
} from '../constants/lookups';
import { useLookupStore } from '@/store/lookupStore';
import { useRenkStore } from '@/store/renkStore';
import { useIplikDetayStore } from '@/store/iplikDetayStore';
import { useKalinlikStore } from '@/store/kalinlikStore';
import { useTedarikciStore } from '@/store/tedarikciStore';
import { useTedarikciKategoriStore } from '@/store/tedarikciKategoriStore';
import { useMusteriStore } from '@/store/musteriStore';
import { LookupSelect, StoreSelect, FieldInput, ReadonlyField, FormField } from './FormComponents';

export function UrunHazirlikKartiTab({ kayit, locked, updateField, updateIplik, addIplik, removeIplik, updateOlcu, addOlcu }: {
  kayit: UretimHazirlikKaydi; locked: boolean;
  updateField: (f: string, v: any) => void;
  updateIplik: (i: number, f: keyof IplikSatiri, v: string) => void;
  addIplik: () => void;
  removeIplik: (i: number) => void;
  updateOlcu: (i: number, f: keyof OlcuSatiri, v: string) => void;
  addOlcu: () => void;
}) {
  const k = kayit.urunKarti;

  // Master data store entegrasyonları
  const { items: lookupItems, seedData: seedLookup, getSortedItemsByType } = useLookupStore();
  const { renkler, seedData: seedRenk } = useRenkStore();
  const { detaylar: iplikDetaylar, seedData: seedIplikDetay } = useIplikDetayStore();
  const { kalinliklar, seedData: seedKalinlik, getBirlesikGosterim } = useKalinlikStore();
  const { tedarikciler, seedData: seedTedarikci } = useTedarikciStore();
  const { kategoriler: tedarikciKategorileri, seedData: seedTedarikciKategori } = useTedarikciKategoriStore();
  const { musteriler, seedData: seedMusteri } = useMusteriStore();

  useEffect(() => {
    if (lookupItems.length === 0) seedLookup();
    if (renkler.length === 0) seedRenk();
    if (iplikDetaylar.length === 0) seedIplikDetay();
    if (kalinliklar.length === 0) seedKalinlik();
    if (tedarikciler.length === 0) seedTedarikci();
    if (tedarikciKategorileri.length === 0) seedTedarikciKategori();
    if (musteriler.length === 0) seedMusteri();
  }, []);

  const musteriOptions = useMemo(() =>
    musteriler.filter(m => m.durum === 'AKTIF').map(m => m.ormeciMusteriNo),
    [musteriler]
  );

  const boyOptions = useMemo(() =>
    getSortedItemsByType('BEDEN').map(item => ({ value: item.ad, label: item.ad })),
    [lookupItems]
  );

  const renkOptions = useMemo(() =>
    renkler.filter(r => r.durum === 'AKTIF').map(r => ({ value: r.renkAdi, label: r.renkAdi })),
    [renkler]
  );

  const cinsOptions = useMemo(() =>
    iplikDetaylar.filter(d => d.durum === 'AKTIF').map(d => ({ value: d.detayAdi, label: d.detayAdi })),
    [iplikDetaylar]
  );

  const denyeOptions = useMemo(() =>
    kalinliklar.filter(k2 => k2.durum === 'AKTIF').map(k2 => {
      const gosterim = getBirlesikGosterim(k2);
      return { value: gosterim, label: gosterim };
    }),
    [kalinliklar, getBirlesikGosterim]
  );

  const tedarikciOptions = useMemo(() => {
    const iplikKategoriIds = tedarikciKategorileri
      .filter(kat => kat.kategoriAdi?.toLocaleLowerCase('tr').includes('iplik'))
      .map(kat => kat.id);
    return tedarikciler
      .filter(t => t.durum === 'AKTIF' && (t.kategoriIds || []).some(kid => iplikKategoriIds.includes(kid)))
      .map(t => ({ value: t.tedarikciAdi, label: `${t.tedarikciKodu} - ${t.tedarikciAdi}` }));
  }, [tedarikciler, tedarikciKategorileri]);

  const handleUrunPdfView = async () => {
    const { generateUrunKartiPdf } = await import('../../../utils/urunKartiPdf');
    generateUrunKartiPdf(kayit);
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
          <LookupSelect value={k.musteriKodu} onChange={v => updateField('musteriKodu', v)} options={musteriOptions} disabled={locked} />
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
          <StoreSelect value={k.boy} onChange={v => updateField('boy', v)} options={boyOptions} disabled={locked} />
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
                  <td className="py-1 px-1"><StoreSelect value={ip.denye} onChange={v => updateIplik(idx, 'denye', v)} options={denyeOptions} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><LookupSelect value={ip.kat} onChange={v => updateIplik(idx, 'kat', v)} options={KAT_DEGERLERI} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><StoreSelect value={ip.iplikCinsi} onChange={v => updateIplik(idx, 'iplikCinsi', v)} options={cinsOptions} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={ip.iplikTanimi} onChange={v => updateIplik(idx, 'iplikTanimi', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><StoreSelect value={ip.renk} onChange={v => updateIplik(idx, 'renk', v)} options={renkOptions} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><FieldInput value={ip.renkKodu} onChange={v => updateIplik(idx, 'renkKodu', v)} disabled={locked} className="w-full text-xs" /></td>
                  <td className="py-1 px-1"><StoreSelect value={ip.tedarikci} onChange={v => updateIplik(idx, 'tedarikci', v)} options={tedarikciOptions} disabled={locked} className="w-full text-xs" /></td>
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
                  <td className="py-1 px-1"><StoreSelect value={o.boy} onChange={v => updateOlcu(idx, 'boy', v)} options={boyOptions} disabled={locked} className="w-full text-xs" /></td>
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
