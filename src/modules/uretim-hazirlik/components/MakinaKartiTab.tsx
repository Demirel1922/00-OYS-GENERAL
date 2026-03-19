import { FileDown } from 'lucide-react';
import type { UretimHazirlikKaydi } from '../types';

export function MakinaKartiTab({ kayit }: { kayit: UretimHazirlikKaydi }) {
  const k = kayit.urunKarti;

  const handlePdfView = async () => {
    const { generateMakinaKartiPdf } = await import('../../../utils/makinaKartiPdf');
    generateMakinaKartiPdf(kayit);
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
