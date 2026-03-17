import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Download, Search, Users, MoreVertical, Edit3, Trash2, ChevronRight, Eye, CheckCircle, Truck, X, Check, Settings } from 'lucide-react';
import { NumuneDetayModal } from '../components/NumuneDetayModal';
import { createFromNumune } from '../../uretim-hazirlik/utils/factory';
import { STORAGE_KEY as UH_STORAGE_KEY } from '../../uretim-hazirlik/utils/calculations';

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
  generalInfo?: any;
}

const mockData: NumuneItem[] = [
  { id: 1, numuneNo: '55A1', musteri: 'ABC Tekstil', musteriKodu: 'ABC001', musteriArtikelNo: 'ART-001', refNo: 'REF-2025-001', durum: 'Beklemede', termin: '2026-03-15', miktar: 50, gonderim: 'Kargo', numuneTipi: 'İlk Geliştirme' },
  { id: 2, numuneNo: '55A2', musteri: 'XYZ Giyim', musteriKodu: 'XYZ002', musteriArtikelNo: 'ART-002', refNo: 'PO-456', durum: 'Üretimde', termin: '2026-03-10', miktar: 100, gonderim: 'Elden', numuneTipi: 'Boy Seti' },
  { id: 3, numuneNo: '55A3', musteri: 'Global Socks', musteriKodu: 'GSK003', musteriArtikelNo: 'ART-003', refNo: '-', durum: 'Hazır', termin: '2026-03-05', miktar: 25, gonderim: 'Kurye', numuneTipi: 'Renk Seti' },
  { id: 4, numuneNo: '55A4', musteri: 'Premium Textile', musteriKodu: 'PT004', musteriArtikelNo: 'ART-004', refNo: 'PT-2025-333', durum: 'Beklemede', termin: '2026-03-25', miktar: 20, gonderim: 'Kurye', numuneTipi: 'Kalite Numunesi' },
  { id: 5, numuneNo: '55A5', musteri: 'ABC Tekstil', musteriKodu: 'ABC001', musteriArtikelNo: 'ART-005', refNo: '-', durum: 'Üretimde', termin: '2026-03-12', miktar: 45, gonderim: 'Kargo', numuneTipi: 'Production' },
  { id: 6, numuneNo: '55A6', musteri: 'XYZ Giyim', musteriKodu: 'XYZ002', musteriArtikelNo: 'ART-006', refNo: 'PO-789', durum: 'Hazır', termin: '2026-03-07', miktar: 80, gonderim: 'Elden', numuneTipi: 'Fuar' },
];

const DURUM_OPTIONS = ['Taslak', 'Beklemede', 'Üretimde', 'Hazır', 'Gönderildi', 'Tamamlandı', 'İptal'];
const GONDERIM_OPTIONS = ['Kargo', 'Elden', 'Kurye'];

const MENU_HEIGHT = 320;

export function NumuneTaleplerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Aktif');
  const [searchTerm, setSearchTerm] = useState('');
  const [numuneler, setNumuneler] = useState<NumuneItem[]>(mockData);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedNumuneId, setSelectedNumuneId] = useState<number | null>(null);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [openSubMenu, setOpenSubMenu] = useState<'durum' | 'gonderim' | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' });
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const menuRef = useRef<HTMLDivElement>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  }, []);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    if (data.length > 0) {
      setNumuneler(data);
    } else {
      localStorage.setItem('oys_numune_listesi', JSON.stringify(mockData));
      setNumuneler(mockData);
    }
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenMenuId(null);
        setOpenSubMenu(null);
        setMenuPosition(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (openMenuId !== null) {
        setOpenMenuId(null);
        setOpenSubMenu(null);
        setMenuPosition(null);
      }
    };
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [openMenuId]);

  const closeMenu = () => {
    setOpenMenuId(null);
    setOpenSubMenu(null);
    setMenuPosition(null);
  };

  const handleDurumChange = (id: number, yeniDurum: string) => {
    setNumuneler(prev => prev.map(n => n.id === id ? { ...n, durum: yeniDurum } : n));
    const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    const yeniListe = liste.map((n: NumuneItem) => n.id === id ? { ...n, durum: yeniDurum, guncellemeTarihi: new Date().toISOString() } : n);
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    showToast(`Durum "${yeniDurum}" olarak güncellendi`, 'success');
    closeMenu();
  };

  const handleGonderimChange = (id: number, yeniGonderim: string) => {
    setNumuneler(prev => prev.map(n => n.id === id ? { ...n, gonderim: yeniGonderim, gonderimSekli: yeniGonderim } : n));
    const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
    const yeniListe = liste.map((n: NumuneItem) => n.id === id ? { ...n, gonderim: yeniGonderim, gonderimSekli: yeniGonderim } : n);
    localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
    showToast(`Gönderim "${yeniGonderim}" olarak güncellendi`, 'success');
    closeMenu();
  };

  const openDetailModal = (id: number) => {
    setSelectedNumuneId(id);
    setModalOpen(true);
    closeMenu();
  };

  const handleEdit = (id: number) => {
    navigate('/module/2/yeni', { state: { editMode: true, numuneId: id } });
    closeMenu();
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Bu numuneyi silmek istediğinize emin misiniz?')) {
      const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
      const yeniListe = liste.filter((n: NumuneItem) => n.id !== id);
      localStorage.setItem('oys_numune_listesi', JSON.stringify(yeniListe));
      setNumuneler(yeniListe);
    }
    closeMenu();
  };

  const handleUretimHazirligaGonder = (id: number) => {
    const numune = numuneler.find(n => n.id === id);
    if (!numune) return;

    const mevcutKayitlar = JSON.parse(localStorage.getItem(UH_STORAGE_KEY) || '[]');
    const zatenVar = mevcutKayitlar.find((k: any) => k.numuneId === id);
    if (zatenVar) {
      showToast('Bu numune zaten Üretim Hazırlık\'a gönderilmiş!', 'error');
      closeMenu();
      return;
    }

    // localStorage'dan tam veriyi al
    const fullNumuneData = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]')
      .find((n: any) => n.id === numune.id);

    // generalInfo altındaki verilere doğru erişim
    const gi = fullNumuneData?.generalInfo;

    const yeniKayit = createFromNumune({
      id: numune.id,
      numuneNo: numune.numuneNo,
      musteri: numune.musteri,
      musteriKodu: gi?.musteriKodu || numune.musteriKodu || numune.musteri || '',
      musteriArtikelKodu: gi?.musteriArtikelKodu || numune.musteriArtikelKodu || numune.musteriArtikelNo || '',
      igneSayisi: gi?.igneSayisi || '',
      kovanCapi: gi?.kovanCapi || '',
      yikama: gi?.yikama || '',
      burunKapama: gi?.burunKapama || '',
      corapTanimi: gi?.corapTanimi || '',
      corapTipi: gi?.corapTipi || '',
      corapDokusu: gi?.corapDokusu || '',
      formaBilgisi: gi?.formaBilgisi || '',
      formaSekli: gi?.formaSekli || '',
      olcuSekli: gi?.olcuSekli || '',
      musteriMarkasi: gi?.musteriMarkasi || '',
    });

    mevcutKayitlar.push(yeniKayit);
    localStorage.setItem(UH_STORAGE_KEY, JSON.stringify(mevcutKayitlar));

    handleDurumChange(id, 'Üretimde');
    showToast(`${numune.numuneNo} Üretim Hazırlık'a gönderildi`, 'success');
    closeMenu();
  };

  const toggleMenu = (id: number) => {
    if (openMenuId === id) {
      closeMenu();
    } else {
      const button = buttonRefs.current.get(id);
      if (button) {
        const rect = button.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;

        let top: number;

        if (spaceBelow >= MENU_HEIGHT) {
          top = rect.bottom + 4;
        } else if (spaceAbove >= MENU_HEIGHT) {
          top = rect.top - MENU_HEIGHT - 4;
        } else {
          top = Math.max(8, (viewportHeight - MENU_HEIGHT) / 2);
        }

        let left = rect.right - 224;
        if (left < 8) left = 8;

        setMenuPosition({ top, left });
      }
      setOpenMenuId(id);
      setOpenSubMenu(null);
    }
  };

  const getSubMenuPosition = (itemIndex: number) => {
    if (!menuPosition || !menuRef.current) return { top: 0, left: 0 };

    const menuRect = menuRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const itemTop = menuRect.top + (itemIndex * 45);

    const subMenuHeight = openSubMenu === 'durum' ? DURUM_OPTIONS.length * 36 + 16 : GONDERIM_OPTIONS.length * 36 + 16;

    let top = itemTop;
    if (top + subMenuHeight > viewportHeight - 8) {
      top = viewportHeight - subMenuHeight - 8;
    }
    if (top < 8) top = 8;

    let left = menuRect.left - 168;
    if (left < 8) {
      left = menuRect.right + 4;
    }

    return { top, left };
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

  const filteredNumuneler = numuneler.filter(n => {
    const matchesSearch = n.numuneNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         n.musteri.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (n.musteriKodu && n.musteriKodu.toLowerCase().includes(searchTerm.toLowerCase()));
    if (activeTab === 'Tümü') return matchesSearch;
    if (activeTab === 'Aktif') return matchesSearch && ['Taslak', 'Beklemede', 'Üretimde', 'Hazır'].includes(n.durum);
    if (activeTab === 'Gönderildi') return matchesSearch && n.durum === 'Gönderildi';
    if (activeTab === 'Tamamlandı') return matchesSearch && n.durum === 'Tamamlandı';
    if (activeTab === 'İptal') return matchesSearch && n.durum === 'İptal';
    return matchesSearch;
  });

  return (
    <div className="container mx-auto p-6">
      {toast.show && (
        <div className={`fixed top-4 right-4 z-[99999] px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-all ${
          toast.type === 'success' ? 'bg-green-600 text-white' :
          toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
        }`}>
          {toast.type === 'success' ? <Check size={16} /> : toast.type === 'error' ? <X size={16} /> : <Check size={16} />}
          <span className="text-sm">{toast.message}</span>
        </div>
      )}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <button
              onClick={() => navigate('/module/2')}
              className="text-sm text-gray-500 mb-2 flex items-center gap-1 hover:text-gray-700"
            >
              <ArrowLeft size={16} /> Ana Menüye Dön
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Numune Listesi</h1>
            <p className="text-gray-500 mt-1">Tüm numune taleplerinizi yönetin</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/module/2/musteri-analizi')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Users size={18} /> Müşteri Analizi
            </button>
            <button
              onClick={() => navigate('/module/2/yeni')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              <Plus size={18} /> Yeni Numune
            </button>
          </div>
        </div>

        <div className="inline-flex bg-gray-100 p-1 rounded-lg mb-6">
          {['Aktif', 'Gönderildi', 'Tamamlandı', 'İptal', 'Tümü'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Numune no veya müşteri adı..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="border border-gray-300 rounded-lg px-4 py-2 bg-white">
            <option>Tüm Durumlar</option>
            <option>Beklemede</option>
            <option>Üretimde</option>
            <option>Hazır</option>
          </select>
          <button
            onClick={() => console.log('Excel export triggered')}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
          >
            <Download size={16} /> Excel İndir
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Sıra No</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Numune No</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Müşteri</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Müşteri Artikel No</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Termin</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Miktar</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Numune Tipi</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Durum</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredNumuneler.map((numune, index) => (
                <tr key={numune.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-sm text-gray-600">{index + 1}</td>
                  <td className="py-4 px-4 text-sm font-medium text-gray-900">{numune.numuneNo}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{numune.musteriKodu || numune.musteri}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{numune.musteriArtikelKodu || numune.musteriArtikelNo || '-'}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{numune.hedefTarih || numune.termin}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{numune.miktar} adet</td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      {numune.numuneTipi || '-'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDurumBadgeClass(numune.durum)}`}>
                      {numune.durum}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <button
                      ref={(el) => {
                        if (el) buttonRefs.current.set(numune.id, el);
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMenu(numune.id);
                      }}
                      className="p-2 hover:bg-gray-200 rounded-full"
                    >
                      <MoreVertical size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          Toplam {filteredNumuneler.length} kayıt<br />
          Toplam Miktar: {filteredNumuneler.reduce((acc, curr) => acc + curr.miktar, 0)} adet
        </div>
      </div>

      {openMenuId !== null && menuPosition && (
        <>
          <div
            className="fixed inset-0 z-[9998]"
            onClick={closeMenu}
          />

          <div
            ref={menuRef}
            className="fixed z-[9999] w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 max-h-[90vh] overflow-y-auto"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            <button
              onClick={() => openDetailModal(openMenuId)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm whitespace-nowrap"
            >
              <Eye size={18} className="text-blue-600" />
              Görüntüle
            </button>

            <div>
              <button
                onClick={() => setOpenSubMenu(openSubMenu === 'durum' ? null : 'durum')}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between text-sm whitespace-nowrap"
              >
                <span className="flex items-center gap-3">
                  <CheckCircle size={18} className="text-green-600" />
                  Durum Değiştir
                </span>
                <ChevronRight size={16} className={`transition-transform ${openSubMenu === 'durum' ? 'rotate-90' : ''}`} />
              </button>

              {openSubMenu === 'durum' && (
                <div
                  className="fixed z-[10000] w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
                  style={getSubMenuPosition(1)}
                >
                  {DURUM_OPTIONS.map(durum => {
                    const numune = numuneler.find(n => n.id === openMenuId);
                    return (
                      <button
                        key={durum}
                        onClick={() => handleDurumChange(openMenuId, durum)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 text-sm whitespace-nowrap ${
                          numune?.durum === durum ? 'bg-blue-50 font-bold' : ''
                        }`}
                      >
                        {durum} {numune?.durum === durum && '✓'}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setOpenSubMenu(openSubMenu === 'gonderim' ? null : 'gonderim')}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between text-sm whitespace-nowrap"
              >
                <span className="flex items-center gap-3">
                  <Truck size={18} className="text-orange-600" />
                  Gönderim Şekli
                </span>
                <ChevronRight size={16} className={`transition-transform ${openSubMenu === 'gonderim' ? 'rotate-90' : ''}`} />
              </button>

              {openSubMenu === 'gonderim' && (
                <div
                  className="fixed z-[10000] w-40 bg-white rounded-lg shadow-xl border border-gray-200 py-2"
                  style={getSubMenuPosition(2)}
                >
                  {GONDERIM_OPTIONS.map(gonderim => {
                    const numune = numuneler.find(n => n.id === openMenuId);
                    return (
                      <button
                        key={gonderim}
                        onClick={() => handleGonderimChange(openMenuId, gonderim)}
                        className={`w-full px-4 py-2 text-left hover:bg-gray-100 text-sm whitespace-nowrap ${
                          numune?.gonderim === gonderim ? 'bg-blue-50 font-bold' : ''
                        }`}
                      >
                        {gonderim}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <hr className="my-2 mx-4" />

            <button
              onClick={() => handleUretimHazirligaGonder(openMenuId)}
              className="w-full px-4 py-3 text-left hover:bg-green-50 text-green-700 flex items-center gap-3 text-sm whitespace-nowrap"
            >
              <Settings size={18} />
              Üretim Hazırlığa Gönder
            </button>

            <button
              onClick={() => handleEdit(openMenuId)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 text-sm whitespace-nowrap"
            >
              <Edit3 size={18} className="text-gray-600" />
              Düzenle
            </button>

            <button
              onClick={() => handleDelete(openMenuId)}
              className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-600 flex items-center gap-3 text-sm whitespace-nowrap"
            >
              <Trash2 size={18} />
              Sil
            </button>
          </div>
        </>
      )}

      <NumuneDetayModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        numuneId={selectedNumuneId}
      />
    </div>
  );
}