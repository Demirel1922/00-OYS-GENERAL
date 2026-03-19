import { Save, CheckCircle2, Unlock } from 'lucide-react';
import type { UretimHazirlikKaydi } from '../types';
import { validateForApproval } from '../utils/calculations';

export function OnayTab({ kayit, onSave, onApprove, onReopen }: {
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
