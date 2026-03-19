import type { UretimHazirlikKaydi } from '../types';
import { YIKAMA_TIPLERI } from '../constants/lookups';
import { LookupSelect, FieldInput, ReadonlyField, FormField } from './FormComponents';

export function YikamaTab({ kayit, locked, updateField, updateAdim }: {
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
