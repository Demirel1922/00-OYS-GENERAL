import { Plus, Trash2 } from 'lucide-react';
import { BIRIM_OPTIONS } from '../constants';

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

interface NumuneOlcuFormProps {
  formData: {
    measurements: MeasurementRow[];
  };
  handleMeasurementChange: (rowIndex: number, field: keyof MeasurementRow, value: string | number) => void;
  addMeasurementRow: () => void;
  removeMeasurementRow: (index: number) => void;
  boyListesi: { id: number; ad: string }[];
  aktifRenkler: { id: number; renkAdi: string }[];
}

export function NumuneOlcuForm({
  formData,
  handleMeasurementChange,
  addMeasurementRow,
  removeMeasurementRow,
  boyListesi,
  aktifRenkler,
}: NumuneOlcuFormProps) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-base font-semibold">Ölçü Tablosu</h3>
        <button onClick={addMeasurementRow} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
          <Plus size={14} /> Yeni Boy Ekle
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-gray-200">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-10"></th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-24">Boy *</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-16">Renk *</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-16">Lst.Eni</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-16">Lst.Yük.</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-14">Kç.Eni</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-14">Ay.Eni</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-14">Kç.Boy</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-14">Tb.Boy</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-14">Lst.Str.</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-16">Kç/Ay.Str.</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-14">Tp.Str.</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-12">Bord</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-14">Miktar *</th>
              <th className="px-1.5 py-1.5 text-left font-medium text-gray-700 w-16">Birim</th>
            </tr>
          </thead>
          <tbody>
            {formData.measurements.map((row, idx) => (
              <tr key={row.id} className="border-b border-gray-100">
                <td className="px-1 py-0.5">
                  <button onClick={() => removeMeasurementRow(idx)} className="text-red-500 hover:text-red-700 p-0.5">
                    <Trash2 size={14} />
                  </button>
                </td>
                <td className="px-1 py-0.5">
                  <select value={row.bedenler} onChange={(e) => handleMeasurementChange(idx, 'bedenler', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                    <option value="">Seçiniz</option>
                    {row.bedenler && !boyListesi.some(b => b.ad === row.bedenler) && (
                      <option value={row.bedenler}>{row.bedenler}</option>
                    )}
                    {boyListesi.map(b => <option key={b.id} value={b.ad}>{b.ad}</option>)}
                  </select>
                </td>
                <td className="px-1 py-0.5">
                  <select value={row.renk} onChange={(e) => handleMeasurementChange(idx, 'renk', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                    <option value="">Seçiniz</option>
                    {aktifRenkler.map(r => <option key={r.id} value={r.renkAdi}>{r.renkAdi}</option>)}
                  </select>
                </td>
                <td className="px-1 py-0.5"><input type="text" value={row.lastikEni} onChange={(e) => handleMeasurementChange(idx, 'lastikEni', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" value={row.lastikYuksekligi} onChange={(e) => handleMeasurementChange(idx, 'lastikYuksekligi', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" value={row.koncEni} onChange={(e) => handleMeasurementChange(idx, 'koncEni', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" value={row.ayakEni} onChange={(e) => handleMeasurementChange(idx, 'ayakEni', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" value={row.koncBoyu} onChange={(e) => handleMeasurementChange(idx, 'koncBoyu', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" value={row.tabanBoyu} onChange={(e) => handleMeasurementChange(idx, 'tabanBoyu', e.target.value)} placeholder="cm" className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" value={row.lastikStreci} onChange={(e) => handleMeasurementChange(idx, 'lastikStreci', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" value={row.koncStreciAyakStreci} onChange={(e) => handleMeasurementChange(idx, 'koncStreciAyakStreci', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" value={row.topukStreci} onChange={(e) => handleMeasurementChange(idx, 'topukStreci', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" value={row.bord} onChange={(e) => handleMeasurementChange(idx, 'bord', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5"><input type="text" inputMode="numeric" pattern="[0-9]*" value={row.miktar} onChange={(e) => handleMeasurementChange(idx, 'miktar', parseInt(e.target.value) || 1)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs" /></td>
                <td className="px-1 py-0.5">
                  <select value={row.birim} onChange={(e) => handleMeasurementChange(idx, 'birim', e.target.value)} className="w-full border border-gray-300 rounded px-1.5 py-0.5 text-xs">
                    {BIRIM_OPTIONS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
