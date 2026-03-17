import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Search, Filter, Mail, ChevronUp, ChevronDown, ChevronRight, MoreVertical, RotateCcw, Eye, CheckCircle } from 'lucide-react';
import { NumuneDetayModal } from '../components/NumuneDetayModal';

interface NumuneItem {
  id: number;
  numuneNo: string;
  musteri: string;
  musteriKodu?: string;
  musteriArtikelNo?: string;
  musteriArtikelKodu?: string;
  refNo: string;
  durum: string;
  termin: string;
  hedefTarih?: string;
  miktar: number;
  gonderim: string;
  gonderimSekli?: string;
  numuneTipi?: string;
  olusturmaTarihi?: string;
}

interface FilterState {
  musteri: string;
  baslangicTarihi: string;
  bitisTarihi: string;
  numuneTipi: string;
}

type SortField = 'numuneNo' | 'musteri' | 'musteriArtikelNo' | 'termin' | 'miktar' | 'numuneTipi';
type SortDirection = 'asc' | 'desc';

const NUMUNE_TIPI_OPTIONS = [
  { value: '', label: 'Tümü' },
  { value: 'ILK_GELISTIRME', label: 'İlk Geliştirme Numunesi' },
  { value: 'BOY_SETI', label: 'Boy Seti' },
  { value: 'RENK_SETI', label: 'Renk Seti' },
  { value: 'KALITE_NUMUNESI', label: 'Kalite Numunesi' },
  { value: 'PREPRODUCTION', label: 'Preproduction Sample' },
  { value: 'PRODUCTION', label: 'Production Sample' },
  { value: 'SALESMAN', label: 'Salesman Sample' },
  { value: 'FUAR_NUMUNESI', label: 'Fuar Numunesi' },
  { value: 'REVIZE_NUMUNE', label: 'Revize Numune' },
  { value: 'REFERANS_NUMUNE', label: 'Referans Numune' },
  { value: 'TEST_NUMUNESI', label: 'Test Numunesi' }
];

const DURUM_OPTIONS = ['Taslak', 'Beklemede', 'Üretimde', 'Hazır', 'Gönderildi', 'Tamamlandı', 'İptal'];

const mockData: NumuneItem[] = [
  { id: 1, numuneNo: '55A1', musteri: 'ABC Tekstil', musteriKodu: 'ABC001', musteriArtikelNo: 'ART-001', refNo: 'REF-2025-001', durum: 'Beklemede', termin: '2026-03-15', miktar: 50, gonderim: 'Kargo', numuneTipi: 'İlk Geliştirme', olusturmaTarihi: '2025-01-10' },
  { id: 2, numuneNo: '55A2', musteri: 'XYZ Giyim', musteriKodu: 'XYZ002', musteriArtikelNo: 'ART-002', refNo: 'PO-456', durum: 'Üretimde', termin: '2026-03-10', miktar: 100, gonderim: 'Elden', numuneTipi: 'Boy Seti', olusturmaTarihi: '2025-01-12' },
  { id: 3, numuneNo: '55A3', musteri: 'Global Socks', musteriKodu: 'GSK003', musteriArtikelNo: 'ART-003', refNo: '-', durum: 'Hazır', termin: '2026-03-05', miktar: 25, gonderim: 'Kurye', numuneTipi: 'Renk Seti', olusturmaTarihi: '2025-01-15' },
  { id: 4, numuneNo: '55A4', musteri: 'Premium Textile', musteriKodu: 'PT004', musteriArtikelNo: 'ART-004', refNo: 'PT-2025-333', durum: 'Beklemede', termin: '2026-03-25', miktar: 20, gonderim: 'Kurye', numuneTipi: 'Kalite Numunesi', olusturmaTarihi: '2025-01-18' },
  { id: 5, numuneNo: '55A5', musteri: 'ABC Tekstil', musteriKodu: 'ABC001', musteriArtikelNo: 'ART-005', refNo: '-', durum: 'Üretimde', termin: '2026-03-12', miktar: 45, gonderim: 'Kargo', numuneTipi: 'Production', olusturmaTarihi: '2025-01-20' },
  { id: 6, numuneNo: '55A6', musteri: 'XYZ Giyim', musteriKodu: 'XYZ002', musteriArtikelNo: 'ART-006', refNo: 'PO-789', durum: 'Hazır', termin: '2026-03-07', miktar: 80, gonderim: 'Elden', numuneTipi: 'Fuar Numunesi', olusturmaTarihi: '2025-01-22' },
];

export function MusteriAnalizi() {
  const navigate = useNavigate();
  const [numuneListesi, setNumuneListesi] = useState<NumuneItem[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    musteri: '',
    baslangicTarihi: '',
    bitisTarihi: '',
    numuneTipi: ''
  });
  const [sortField, setSortField] = useState<SortField>('termin');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<'durum' | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const menuButtonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  // Load data from localStorage
  useEffect(() => {
    const storedList = localStorage.getItem('oys_numune_listesi');
    if (storedList) {
      const parsedList = JSON.parse(storedList);
      const existingIds = new Set(parsedList.map((n: NumuneItem) => n.id));
      const filteredMock = mockData.filter(m => !existingIds.has(m.id));
      setNumuneListesi([...parsedList, ...filteredMock]);
    } else {
      setNumuneListesi(mockData);
    }
  }, []);

  // ESC tuşu ile menüyü kapat
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenuId(null);
        setOpenSubMenu(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // Get unique customers for dropdown
  const musteriler = useMemo(() => {
    const unique = new Set(numuneListesi.map(n => n.musteri));
    return Array.from(unique).sort();
  }, [numuneListesi]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let data = [...numuneListesi];

    // Apply filters
    if (filters.musteri) {
      data = data.filter(n => n.musteri === filters.musteri);
    }
    if (filters.baslangicTarihi) {
      data = data.filter(n => n.termin >= filters.baslangicTarihi);
    }
    if (filters.bitisTarihi) {
      data = data.filter(n => n.termin <= filters.bitisTarihi);
    }
    if (filters.numuneTipi) {
      // YeniNumune value kodu (ILK_GELISTIRME) veya label (İlk Geliştirme) olabilir - ikisini de destekle
      data = data.filter(n => {
        if (!n.numuneTipi) return false;
        const secilenOption = NUMUNE_TIPI_OPTIONS.find(o => o.value === filters.numuneTipi);
        return n.numuneTipi === filters.numuneTipi || n.numuneTipi === secilenOption?.label;
      });
    }

    // Apply sorting
    data.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'termin') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return data;
  }, [numuneListesi, filters, sortField, sortDirection]);

  // ISTATISTIKLER - useMemo ile hesapla
  const stats = useMemo(() => ({
    toplam: filteredData.length,
    uretimde: filteredData.filter(d => d.durum === 'Üretimde').length,
    bekleyen: filteredData.filter(d => ['Taslak', 'Beklemede'].includes(d.durum)).length,
    tamamlanan: filteredData.filter(d => d.durum === 'Tamamlandı').length,
    hazir: filteredData.filter(d => d.durum === 'Hazır').length,
    gonderildi: filteredData.filter(d => d.durum === 'Gönderildi').length,
  }), [filteredData]);

  // GRAFIK VERILERI
  const durumData = [
    { name: 'Üretimde', value: stats.uretimde, color: '#3b82f6' },
    { name: 'Bekleyen', value: stats.bekleyen, color: '#fbbf24' },
    { name: 'Hazır', value: stats.hazir, color: '#10b981' },
    { name: 'Gönderildi', value: stats.gonderildi, color: '#8b5cf6' },
    { name: 'Tamamlanan', value: stats.tamamlanan, color: '#059669' },
  ].filter(d => d.value > 0);

  const ayData = useMemo(() => {
    const grouped: Record<string, number> = {};
    filteredData.forEach(d => {
      const tarih = d.olusturmaTarihi || d.hedefTarih || d.termin;
      const ay = tarih ? tarih.substring(0, 7) : 'Bilinmeyen';
      grouped[ay] = (grouped[ay] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([ay, count]) => ({ ay, count }))
      .sort((a, b) => a.ay.localeCompare(b.ay))
      .slice(-6);
  }, [filteredData]);

  const musteriData = useMemo(() => {
    const grouped: Record<string, number> = {};
    numuneListesi.forEach(d => {
      const musteri = d.musteriKodu || d.musteri || 'Bilinmeyen';
      grouped[musteri] = (grouped[musteri] || 0) + 1;
    });
    return Object.entries(grouped)
      .map(([musteri, count]) => ({ musteri, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [numuneListesi]);

  // DURUM DEGISTIRME
  const handleDurumChange = (id: number, yeniDurum: string) => {
    const updated = numuneListesi.map(n => n.id === id ? { ...n, durum: yeniDurum } : n);
    setNumuneListesi(updated);
    localStorage.setItem('oys_numune_listesi', JSON.stringify(updated));
    setOpenMenuId(null);
    setOpenSubMenu(null);
  };

  // MODAL AC
  const openDetail = (id: number) => {
    setSelectedId(id);
    setModalOpen(true);
    setOpenMenuId(null);
    setOpenSubMenu(null);
  };

  const toggleMenu = (id: number) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
      setOpenSubMenu(null);
    } else {
      setOpenMenuId(id);
      setOpenSubMenu(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleReset = () => {
    setFilters({
      musteri: '',
      baslangicTarihi: '',
      bitisTarihi: '',
      numuneTipi: ''
    });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleEmail = (numune: NumuneItem) => {
    const subject = `Sample ${numune.numuneNo} - ${numune.musteri}`;
    const body = `Sample Details:
    
Sample No: ${numune.numuneNo}
Customer: ${numune.musteri}
Art. No: ${numune.musteriArtikelNo || '-'}
Delivery Date: ${formatDate(numune.termin)}
Quantity: ${numune.miktar} pcs
Type: ${numune.numuneTipi || '-'}
Status: ${numune.durum}
Shipping: ${numune.gonderim}

Best regards,`;
    
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setOpenMenuId(null);
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronUp size={14} className="text-gray-300" />;
    return sortDirection === 'asc' ? <ChevronUp size={14} className="text-gray-700" /> : <ChevronDown size={14} className="text-gray-700" />;
  };

  const getDurumBadgeClass = (durum: string) => {
    switch (durum) {
      case 'Taslak': return 'bg-gray-200 text-gray-700';
      case 'Beklemede': return 'bg-yellow-200 text-yellow-800';
      case 'Üretimde': return 'bg-blue-200 text-blue-800';
      case 'Hazır': return 'bg-green-200 text-green-800';
      case 'Gönderildi': return 'bg-purple-200 text-purple-800';
      case 'Tamamlandı': return 'bg-emerald-200 text-emerald-800';
      case 'İptal': return 'bg-red-200 text-red-800';
      default: return 'bg-gray-200 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <button 
              onClick={() => navigate('/module/2/talepler')}
              className="text-sm text-gray-500 mb-2 flex items-center gap-1 hover:text-gray-700"
            >
              <ArrowLeft size={16} /> Numune Listesine Dön
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Müşteri Numune Analizi</h1>
            <p className="text-gray-500 mt-1">Müşteri bazlı numune analizi ve raporlama</p>
          </div>
        </div>

        {/* KPI KARTLARI */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-500 text-sm">Toplam Numune</div>
            <div className="text-2xl font-bold">{stats.toplam}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-500 text-sm">Üretimde</div>
            <div className="text-2xl font-bold text-blue-600">{stats.uretimde}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-500 text-sm">Bekleyen</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.bekleyen}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-500 text-sm">Hazır</div>
            <div className="text-2xl font-bold text-green-600">{stats.hazir}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-500 text-sm">Tamamlanan</div>
            <div className="text-2xl font-bold text-emerald-600">{stats.tamamlanan}</div>
          </div>
        </div>

        {/* GRAFIKLER */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold mb-4 text-gray-700">Durum Dağılımı</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie 
                  data={durumData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {durumData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <h3 className="font-bold mb-4 text-gray-700">Aylık Dağılım (Son 6 Ay)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ayData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ay" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* MUSTERI DAGILIMI */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <h3 className="font-bold mb-4 text-gray-700">Müşteri Bazlı Dağılım</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={musteriData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="musteri" type="category" width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-gray-600" />
            <h3 className="font-medium text-gray-700">Filtreler</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri</label>
              <select 
                value={filters.musteri} 
                onChange={(e) => setFilters({...filters, musteri: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              >
                <option value="">Tümü</option>
                {musteriler.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
              <input 
                type="date" 
                value={filters.baslangicTarihi}
                onChange={(e) => setFilters({...filters, baslangicTarihi: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
              <input 
                type="date" 
                value={filters.bitisTarihi}
                onChange={(e) => setFilters({...filters, bitisTarihi: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numune Tipi</label>
              <select 
                value={filters.numuneTipi} 
                onChange={(e) => setFilters({...filters, numuneTipi: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              >
                {NUMUNE_TIPI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button 
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 text-sm"
            >
              <RotateCcw size={16} /> Sıfırla
            </button>
            <button 
              onClick={() => {}}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 text-sm"
            >
              <Search size={16} /> Filtrele
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="flex justify-between items-center mb-4">
          <p className="text-sm text-gray-600">
            <span className="font-medium">{filteredData.length}</span> kayıt bulundu | 
            Toplam Miktar: <span className="font-medium">{filteredData.reduce((acc, n) => acc + n.miktar, 0)}</span> adet
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('numuneNo')}
                >
                  <div className="flex items-center gap-1">Numune No {getSortIcon('numuneNo')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('musteri')}
                >
                  <div className="flex items-center gap-1">Müşteri {getSortIcon('musteri')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('musteriArtikelNo')}
                >
                  <div className="flex items-center gap-1">Müşteri Artikel No {getSortIcon('musteriArtikelNo')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('termin')}
                >
                  <div className="flex items-center gap-1">Termin {getSortIcon('termin')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('miktar')}
                >
                  <div className="flex items-center gap-1">Miktar {getSortIcon('miktar')}</div>
                </th>
                <th 
                  className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('numuneTipi')}
                >
                  <div className="flex items-center gap-1">Numune Tipi {getSortIcon('numuneTipi')}</div>
                </th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{row.numuneNo}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{row.musteri}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{row.musteriArtikelNo || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{formatDate(row.termin)}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{row.miktar} adet</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {row.numuneTipi || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDurumBadgeClass(row.durum)}`}>
                      {row.durum}
                    </span>
                  </td>
                  <td className="py-4 px-4 relative">
                    <button 
                      ref={(el) => {
                        if (el) menuButtonRefs.current.set(row.id, el);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Tiklandi:", row.id);
                        toggleMenu(row.id);
                      }}
                      className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                      <MoreVertical size={18} />
                    </button>
                    
                    {/* MENÜ - Absolute position ile td içinde */}
                    {openMenuId === row.id && (
                      <>
                        {/* Overlay */}
                        <div 
                          className="fixed inset-0 z-[9998]" 
                          onClick={() => {
                            setOpenMenuId(null);
                            setOpenSubMenu(null);
                          }} 
                        />
                        
                        {/* Ana Menü */}
                        <div className="absolute right-4 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[9999]">
                          <button 
                            onClick={() => openDetail(row.id)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap"
                          >
                            <Eye size={16} className="text-blue-600" /> Görüntüle
                          </button>
                          
                          {/* Durum Değiştir */}
                          <div className="relative">
                            <button 
                              onClick={() => setOpenSubMenu(openSubMenu === 'durum' ? null : 'durum')}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex justify-between items-center whitespace-nowrap"
                            >
                              <span className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-600" /> Durum Değiştir
                              </span>
                              <ChevronRight size={16} className={openSubMenu === 'durum' ? 'rotate-90' : ''} />
                            </button>
                            
                            {/* Submenü - Aşağıya doğru açılan */}
                            {openSubMenu === 'durum' && (
                              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-[10000]">
                                {DURUM_OPTIONS.map(d => (
                                  <button 
                                    key={d} 
                                    onClick={() => handleDurumChange(row.id, d)} 
                                    className={`w-full px-4 py-2 text-left hover:bg-gray-100 text-sm whitespace-nowrap ${
                                      row.durum === d ? 'bg-blue-50 font-bold' : ''
                                    }`}
                                  >
                                    {d} {row.durum === d && '✓'}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <button 
                            onClick={() => handleEmail(row)}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap border-t border-gray-100"
                          >
                            <Mail size={16} className="text-green-600" /> E-posta Gönder
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>Filtrelere uygun kayıt bulunamadı.</p>
          </div>
        )}
      </div>

      {/* MODAL */}
      <NumuneDetayModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        numuneId={selectedId} 
      />
    </div>
  );
}
