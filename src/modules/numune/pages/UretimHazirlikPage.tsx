import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings } from 'lucide-react';

export function UretimHazirlikPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <button 
        onClick={() => navigate('/module/2')}
        className="text-sm text-gray-500 mb-4 flex items-center gap-1 hover:text-gray-700"
      >
        <ArrowLeft size={16} /> Numune Yönetimine Dön
      </button>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
            <Settings className="text-green-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Üretim Hazırlık Aşaması</h1>
        </div>
        
        <div className="prose max-w-none">
          <p className="text-gray-600 mb-4">
            Bu bölümde numune üretimi için teknik hazırlık verileri girilecektir.
          </p>
          <ul className="list-disc list-inside text-gray-500 space-y-2 ml-4">
            <li>Ürün kartı tanımları</li>
            <li>Gramaj bilgileri</li>
            <li>İplik kompozisyonu</li>
            <li>Örme parametreleri</li>
            <li>Boya talimatları</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
