import { useNavigate } from 'react-router-dom';
import { ClipboardList, Settings, ArrowLeft } from 'lucide-react';

export function NumuneDashboard() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-sm text-gray-500 mb-2 flex items-center gap-1 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Dashboard'a Dön
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Numune Yönetimi</h1>
        <p className="text-gray-500 mt-1">Numune talep ve üretim hazırlık süreçleri</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* MAVİ KART */}
        <div 
          onClick={() => navigate('/module/2/talepler')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-blue-500 p-6 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
            <ClipboardList className="text-blue-600" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Numune Talepleri</h2>
          <p className="text-sm text-gray-500">Müşteri numune taleplerinin girişi ve takibi</p>
          <span className="text-xs text-gray-400 mt-4 block">Modül ID: 2a</span>
        </div>

        {/* YEŞİL KART */}
        <div 
          onClick={() => navigate('/module/2/uretim-hazirlik')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 border-l-4 border-l-green-500 p-6 cursor-pointer hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
            <Settings className="text-green-600" size={24} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Üretim Hazırlık Aşaması</h2>
          <p className="text-sm text-gray-500">Numune üretimi için teknik hazırlık ve ürün kartı tanımları</p>
          <span className="text-xs text-gray-400 mt-4 block">Modül ID: 2b</span>
        </div>
      </div>
    </div>
  );
}
