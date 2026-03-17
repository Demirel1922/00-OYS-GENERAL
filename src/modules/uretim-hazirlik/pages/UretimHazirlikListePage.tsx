import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, AlertTriangle, Clock, CheckCircle2, Search,
  ChevronRight, Flame,
} from 'lucide-react';
import type { UretimHazirlikKaydi, UretimHazirlikStatus } from '../types';
import { STATUS_LABELS } from '../types';
import { STORAGE_KEY } from '../utils/calculations';

type TabKey = 'NEW' | 'IN_PROGRESS' | 'COMPLETED_LOCKED';

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ReactNode; statuses: UretimHazirlikStatus[] }[] = [
  { key: 'NEW', label: 'Yeni', icon: <AlertTriangle size={16} />, statuses: ['NEW'] },
  { key: 'IN_PROGRESS', label: 'Devam Eden', icon: <Clock size={16} />, statuses: ['IN_PROGRESS', 'REOPENED'] },
  { key: 'COMPLETED_LOCKED', label: 'Biten', icon: <CheckCircle2 size={16} />, statuses: ['COMPLETED_LOCKED'] },
];

export function UretimHazirlikListePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabKey>('NEW');
  const [searchTerm, setSearchTerm] = useState('');
  const [kayitlar, setKayitlar] = useState<UretimHazirlikKaydi[]>([]);

  // localStorage'dan yükle
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    setKayitlar(data);
  }, []);

  // Tab bazlı sayaçlar
  const counts = TAB_CONFIG.reduce((acc, tab) => {
    acc[tab.key] = kayitlar.filter(k => tab.statuses.includes(k.status)).length;
    return acc;
  }, {} as Record<TabKey, number>);

  const acilCount = kayitlar.filter(k => k.acil && k.status === 'NEW').length;

  // Filtreleme
  const activeStatuses = TAB_CONFIG.find(t => t.key === activeTab)?.statuses || [];
  const filtered = kayitlar.filter(k => {
    if (!activeStatuses.includes(k.status)) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      k.numuneNo.toLowerCase().includes(term) ||
      k.urunKarti.musteriKodu.toLowerCase().includes(term) ||
      k.urunKarti.ormeciArtikelKodu.toLowerCase().includes(term) ||
      k.urunKarti.urunTanimi.toLowerCase().includes(term)
    );
  });

  const handleRowClick = useCallback((id: string) => {
    navigate(`/module/2/uretim-hazirlik/detay/${id}`);
  }, [navigate]);

  const getDurumBadge = (status: UretimHazirlikStatus) => {
    const cls: Record<UretimHazirlikStatus, string> = {
      NEW: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED_LOCKED: 'bg-green-100 text-green-800',
      REOPENED: 'bg-orange-100 text-orange-800',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-[1400px]">
      {/* Geri */}
      <button
        onClick={() => navigate('/module/2')}
        className="text-sm text-gray-500 mb-4 flex items-center gap-1 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Numune Yönetimine Dön
      </button>

      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Üretim Hazırlık</h1>
      </div>

      {/* Banner - yeni ve acil uyarılar */}
      {(counts.NEW > 0 || acilCount > 0) && (
        <div className="mb-4 flex gap-3">
          {counts.NEW > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm text-blue-800 flex items-center gap-2">
              <AlertTriangle size={16} />
              <span className="font-medium">{counts.NEW} yeni hazırlık kaydı var</span>
            </div>
          )}
          {acilCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-800 flex items-center gap-2">
              <Flame size={16} />
              <span className="font-medium">{acilCount} tanesi acil</span>
            </div>
          )}
        </div>
      )}

      {/* Ana Kart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Sekmeler */}
        <div className="border-b border-gray-200 px-4 flex gap-1">
          {TAB_CONFIG.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Arama */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Numune no, müşteri, artikel ara..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Tablo */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Numune No</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Müşteri</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Örmeci Artikel</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Ürün Tanımı</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase">Son Güncelleme</th>
                <th className="py-3 px-4 text-left text-xs font-semibold text-gray-600 uppercase"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 text-sm">
                    Bu sekmede kayıt bulunmuyor.
                  </td>
                </tr>
              ) : (
                filtered.map((kayit, idx) => (
                  <tr
                    key={kayit.id}
                    onClick={() => handleRowClick(kayit.id)}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-sm text-gray-500">{idx + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-900 flex items-center gap-2">
                      {kayit.acil && <Flame size={14} className="text-red-500" />}
                      {kayit.numuneNo}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{kayit.urunKarti.musteriKodu}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{kayit.urunKarti.ormeciArtikelKodu || '-'}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{kayit.urunKarti.urunTanimi || '-'}</td>
                    <td className="py-3 px-4">{getDurumBadge(kayit.status)}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {new Date(kayit.sonGuncellemeTarihi).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4">
                      <ChevronRight size={16} className="text-gray-400" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Alt bilgi */}
        <div className="p-4 border-t border-gray-100 text-sm text-gray-500">
          {filtered.length} kayıt gösteriliyor
        </div>
      </div>
    </div>
  );
}
