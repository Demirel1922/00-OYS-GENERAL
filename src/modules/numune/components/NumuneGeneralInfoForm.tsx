import {
  CINSIYET_OPTIONS,
  NUMUNE_TIPI_OPTIONS,
  SEBEP_OPTIONS,
  CORAP_TIPI_OPTIONS,
  YIKAMA_OPTIONS,
} from '../constants';
import {
  IGNE_SAYILARI, CAP_DEGERLERI,
} from '../../uretim-hazirlik/constants/lookups';

interface NumuneGeneralInfoFormProps {
  formData: {
    generalInfo: {
      numuneNo: string;
      cinsiyet: string;
      numuneTipi: string;
      sebep: string;
      musteriKodu: string;
      musteriArtikelKodu: string;
      musteriMarkasi: string;
      corapTipi: string;
      corapDokusu: string;
      igneSayisi: string;
      kovanCapi: string;
      formaBilgisi: string;
      formaSekli: string;
      yikama: string;
      olcuSekli: string;
      corapTanimi: string;
      deseneVerilisTarihi: string;
      hedefTarih: string;
    };
  };
  handleGeneralChange: (field: string, value: string) => void;
  isEditMode: boolean;
  aktifMusteriler: { id: number; ormeciMusteriNo: string }[];
  dokuListesi: { id: number; ad: string }[];
}

export function NumuneGeneralInfoForm({
  formData,
  handleGeneralChange,
  isEditMode,
  aktifMusteriler,
  dokuListesi,
}: NumuneGeneralInfoFormProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numune No</label>
          <input type="text" disabled value={formData.generalInfo.numuneNo} placeholder="Çorap Grubu seçince otomatik oluşur" className="w-full border border-gray-300 rounded-lg px-3 py-1.5 bg-gray-100 text-gray-600 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Çorap Grubu *</label>
          <select value={formData.generalInfo.cinsiyet} onChange={(e) => handleGeneralChange('cinsiyet', e.target.value)} disabled={isEditMode} className={`w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`}>
            <option value="">Seçiniz</option>
            {CINSIYET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numune Tipi *</label>
          <select value={formData.generalInfo.numuneTipi} onChange={(e) => handleGeneralChange('numuneTipi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm">
            {NUMUNE_TIPI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numunenin Sebebi *</label>
          <select value={formData.generalInfo.sebep} onChange={(e) => handleGeneralChange('sebep', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm">
            {SEBEP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Kodu *</label>
          <select value={formData.generalInfo.musteriKodu} onChange={(e) => handleGeneralChange('musteriKodu', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm">
            <option value="">Seçiniz</option>
            {aktifMusteriler.map(m => <option key={m.id} value={m.ormeciMusteriNo}>{m.ormeciMusteriNo}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Artikel Kodu</label>
          <input type="text" value={formData.generalInfo.musteriArtikelKodu} onChange={(e) => handleGeneralChange('musteriArtikelKodu', e.target.value)} placeholder="Artikel no" className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Müşteri Markası</label>
          <input type="text" value={formData.generalInfo.musteriMarkasi} onChange={(e) => handleGeneralChange('musteriMarkasi', e.target.value)} placeholder="Marka adı" className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Çorap Tipi</label>
          <select value={formData.generalInfo.corapTipi} onChange={(e) => handleGeneralChange('corapTipi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm">
            {CORAP_TIPI_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Çorap Dokusu</label>
          <select value={formData.generalInfo.corapDokusu} onChange={(e) => handleGeneralChange('corapDokusu', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm">
            <option value="">Seçiniz</option>
            {dokuListesi.map(d => <option key={d.id} value={d.ad}>{d.ad}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">İğne Sayısı</label>
          <select value={formData.generalInfo.igneSayisi} onChange={(e) => handleGeneralChange('igneSayisi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm">
            <option value="">Seçiniz</option>
            {IGNE_SAYILARI.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kovan Çapı</label>
          <select value={formData.generalInfo.kovanCapi} onChange={(e) => handleGeneralChange('kovanCapi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm">
            <option value="">Seçiniz</option>
            {CAP_DEGERLERI.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Forma Bilgisi</label>
          <input type="text" value={formData.generalInfo.formaBilgisi} onChange={(e) => handleGeneralChange('formaBilgisi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Forma Şekli</label>
          <input type="text" value={formData.generalInfo.formaSekli} onChange={(e) => handleGeneralChange('formaSekli', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Yıkama</label>
          <select value={formData.generalInfo.yikama} onChange={(e) => handleGeneralChange('yikama', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm">
            <option value="">Seçiniz</option>
            {YIKAMA_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ölçü Şekli</label>
          <input type="text" value={formData.generalInfo.olcuSekli} onChange={(e) => handleGeneralChange('olcuSekli', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ürün Tanımı</label>
        <textarea value={formData.generalInfo.corapTanimi} onChange={(e) => handleGeneralChange('corapTanimi', e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Desene Veriliş Tarihi</label>
          <input type="date" value={formData.generalInfo.deseneVerilisTarihi} onChange={(e) => handleGeneralChange('deseneVerilisTarihi', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Hedef Tarih *</label>
          <input type="date" value={formData.generalInfo.hedefTarih} onChange={(e) => handleGeneralChange('hedefTarih', e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 text-sm" />
        </div>
      </div>
    </div>
  );
}
