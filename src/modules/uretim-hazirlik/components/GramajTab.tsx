import type { UretimHazirlikKaydi, GramajSatiri } from '../types';
import { ReadonlyField, FieldInput, FormField } from './FormComponents';

export function GramajTab({ kayit, locked, updateSatir }: {
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
