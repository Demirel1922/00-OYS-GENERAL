import { Plus, Trash2 } from 'lucide-react';

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

interface NumuneIplikFormProps {
  formData: {
    yarnInfo: YarnRow[];
    desenCount: number;
  };
  handleYarnChange: (index: number, field: keyof YarnRow, value: string) => void;
  addDesenRow: () => void;
  removeDesenRow: (index: number) => void;
  aktifKalinliklar: { id: number; gosterim: string }[];
  aktifIplikDetaylar: { id: number; detayAdi: string }[];
  aktifRenkler: { id: number; renkAdi: string }[];
  iplikTedarikcileri: { id: number; tedarikciAdi: string; tedarikciKodu: string }[];
}

export function NumuneIplikForm({
  formData,
  handleYarnChange,
  addDesenRow,
  removeDesenRow,
  aktifKalinliklar,
  aktifIplikDetaylar,
  aktifRenkler,
  iplikTedarikcileri,
}: NumuneIplikFormProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold">İplik Bilgileri</h3>
        <button
          onClick={addDesenRow}
          disabled={formData.desenCount >= 10}
          title={formData.desenCount >= 10 ? 'Maksimum 10 desen eklenebilir' : ''}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} /> Desen Ekle ({formData.desenCount}/10)
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-28">Kullanım Yeri</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-28">Detay</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-14">Denye</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-16">Cins</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-16">Renk Kodu</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-16">Renk</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-20">Tedarikçi</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-24">Not</th>
            </tr>
          </thead>
          <tbody>
            {formData.yarnInfo.map((row, idx) => (
              <tr key={row.id} className="border-b border-gray-100">
                <td className="px-1 py-0.5 text-gray-600 font-medium text-xs">{row.kullanimYeri}</td>
                <td className="px-1 py-0.5 text-gray-600 text-xs">{row.detay}</td>
                <td className="px-1 py-0.5">
                  <select value={row.denye} onChange={(e) => handleYarnChange(idx, 'denye', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                    <option value="">Seçiniz</option>
                    {aktifKalinliklar.map(k => <option key={k.id} value={k.gosterim}>{k.gosterim}</option>)}
                    {row.denye && !aktifKalinliklar.some(k => k.gosterim === row.denye) && <option value={row.denye}>{row.denye}</option>}
                  </select>
                </td>
                <td className="px-1 py-0.5">
                  <select value={row.cins} onChange={(e) => handleYarnChange(idx, 'cins', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                    <option value="">Seçiniz</option>
                    {aktifIplikDetaylar.map(d => <option key={d.id} value={d.detayAdi}>{d.detayAdi}</option>)}
                    {row.cins && !aktifIplikDetaylar.some(d => d.detayAdi === row.cins) && <option value={row.cins}>{row.cins}</option>}
                  </select>
                </td>
                <td className="px-1 py-0.5"><input type="text" value={row.renkKodu} onChange={(e) => handleYarnChange(idx, 'renkKodu', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5">
                  <select value={row.renk} onChange={(e) => handleYarnChange(idx, 'renk', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                    <option value="">Seçiniz</option>
                    {aktifRenkler.map(r => <option key={r.id} value={r.renkAdi}>{r.renkAdi}</option>)}
                    {row.renk && !aktifRenkler.some(r => r.renkAdi === row.renk) && <option value={row.renk}>{row.renk}</option>}
                  </select>
                </td>
                <td className="px-1 py-0.5">
                  <select value={row.tedarikci} onChange={(e) => handleYarnChange(idx, 'tedarikci', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                    <option value="">Seçiniz</option>
                    {iplikTedarikcileri.map(t => <option key={t.id} value={t.tedarikciAdi}>{t.tedarikciKodu} - {t.tedarikciAdi}</option>)}
                    {row.tedarikci && !iplikTedarikcileri.some(t => t.tedarikciAdi === row.tedarikci) && <option value={row.tedarikci}>{row.tedarikci}</option>}
                  </select>
                </td>
                <td className="px-1 py-0.5">
                  <div className="flex items-center gap-1">
                    <input type="text" value={row.not} onChange={(e) => handleYarnChange(idx, 'not', e.target.value)} className="flex-1 border border-gray-300 rounded px-1.5 py-0.5 text-xs" />
                    {!row.isFixed && (
                      <button onClick={() => removeDesenRow(idx)} className="text-red-500 hover:text-red-700 p-0.5 flex-shrink-0" title="Deseni Sil">
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
