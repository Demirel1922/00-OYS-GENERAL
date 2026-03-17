import { useEffect, useState } from 'react';
import { X, FileText, Mail, Eye } from 'lucide-react';

interface MeasurementRow {
  bedenler?: string;
  beden?: string;
  renk?: string;
  miktar?: number;
  birim?: string;
  lastikEni?: string;
  lastikYuksekligi?: string;
  koncEni?: string;
  ayakEni?: string;
  koncBoyu?: string;
  tabanBoyu?: string;
  lastikStreci?: string;
  koncStreciAyakStreci?: string;
  topukStreci?: string;
  bord?: string;
}

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

interface NumuneData {
  id: number;
  numuneNo: string;
  musteriKodu?: string;
  musteri?: string;
  musteriArtikelKodu?: string;
  musteriArtikelNo?: string;
  musteriMarkasi?: string;
  cinsiyet?: string;
  numuneTipi?: string;
  numuneninSebebi?: string;
  corapTipi?: string;
  corapDokusu?: string;
  igneSayisi?: string;
  kovanCapi?: string;
  hedefTarih?: string;
  termin?: string;
  deseneVerilisTarihi?: string;
  durum?: string;
  gonderim?: string;
  gonderimSekli?: string;
  miktar?: number;
  birim?: string;
  formaBilgisi?: string;
  formaSekli?: string;
  yikama?: string;
  olcuSekli?: string;
  corapTanimi?: string;
  measurements?: MeasurementRow[];
  olculer?: MeasurementRow[];
  yarnInfo?: YarnRow[];
  generalInfo?: Record<string, string>;
}

interface NumuneDetayModalProps {
  isOpen: boolean;
  onClose: () => void;
  numuneId: number | null;
}

export function NumuneDetayModal({ isOpen, onClose, numuneId }: NumuneDetayModalProps) {
  const [data, setData] = useState<NumuneData | null>(null);

  useEffect(() => {
    if (isOpen && numuneId) {
      const liste = JSON.parse(localStorage.getItem('oys_numune_listesi') || '[]');
      const bulunan = liste.find((n: NumuneData) => n.id === numuneId);
      if (bulunan) {
        // YeniNumune sayfasından kaydedilen veriler generalInfo nested objesi içinde olabilir.
        // Flat hale getiriyoruz ki modal tüm alanları düzgün okusun.
        const generalInfo = bulunan.generalInfo || {};
        const merged: NumuneData = {
          ...bulunan,
          musteriKodu: bulunan.musteriKodu || generalInfo.musteriKodu,
          musteriArtikelKodu: bulunan.musteriArtikelKodu || generalInfo.musteriArtikelKodu,
          musteriMarkasi: bulunan.musteriMarkasi || generalInfo.musteriMarkasi,
          cinsiyet: bulunan.cinsiyet || generalInfo.cinsiyet,
          numuneTipi: bulunan.numuneTipi || generalInfo.numuneTipi,
          numuneninSebebi: bulunan.numuneninSebebi || generalInfo.sebep,
          corapTipi: bulunan.corapTipi || generalInfo.corapTipi,
          corapDokusu: bulunan.corapDokusu || generalInfo.corapDokusu,
          igneSayisi: bulunan.igneSayisi || generalInfo.igneSayisi,
          kovanCapi: bulunan.kovanCapi || generalInfo.kovanCapi,
          hedefTarih: bulunan.hedefTarih || generalInfo.hedefTarih,
          deseneVerilisTarihi: bulunan.deseneVerilisTarihi || generalInfo.deseneVerilisTarihi,
          formaBilgisi: bulunan.formaBilgisi || generalInfo.formaBilgisi,
          formaSekli: bulunan.formaSekli || generalInfo.formaSekli,
          yikama: bulunan.yikama || generalInfo.yikama,
          olcuSekli: bulunan.olcuSekli || generalInfo.olcuSekli,
          corapTanimi: bulunan.corapTanimi || generalInfo.corapTanimi,
          measurements: bulunan.measurements || [],
          yarnInfo: bulunan.yarnInfo || [],
        };
        setData(merged);
      } else {
        setData(null);
      }
    }
  }, [isOpen, numuneId]);

  if (!isOpen || !data) return null;

  const viewPDF = () => {
    // TODO: PDF özelliği şu an devre dışı — jspdf dependency eklenmediği için.
    // İleride @react-pdf/renderer ile uyarlanacak.
    console.warn('PDF export özelliği henüz aktif değildir.');
    alert('PDF export özelliği henüz aktif değildir. Bu özellik ileride eklenecektir.');
  };

  const downloadPDF = () => {
    // TODO: PDF özelliği şu an devre dışı — jspdf dependency eklenmediği için.
    // İleride @react-pdf/renderer ile uyarlanacak.
    console.warn('PDF export özelliği henüz aktif değildir.');
    alert('PDF export özelliği henüz aktif değildir. Bu özellik ileride eklenecektir.');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Sample Request - ${data.numuneNo}`);
    const body = encodeURIComponent(`Sample Details / Numune Detayı:

Sample No (Numune No): ${data.numuneNo}
Customer (Musteri): ${data.musteriKodu || data.musteri || '-'}
Status (Durum): ${data.durum || '-'}
Target Date (Hedef Tarih): ${data.hedefTarih || data.termin || '-'}

Please find the PDF attached. / PDF ekte bulunmaktadir.`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const olculer = data.measurements || data.olculer || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4 border-b pb-4">
          <h2 className="text-xl font-bold">Numune Detayı (Sample Detail)</h2>
          <div className="flex gap-2">
            <button onClick={viewPDF} className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              <Eye size={18} /> PDF Görüntüle
            </button>
            <button onClick={downloadPDF} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              <FileText size={18} /> PDF İndir
            </button>
            <button onClick={handleEmail} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              <Mail size={18} /> Email
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* BILINGUAL OZET KART */}
        <div className="grid grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded">
          <div>
            <div className="text-xs text-gray-500">Numune No (Sample No)</div>
            <div className="font-bold text-lg">{data.numuneNo}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Musteri (Customer)</div>
            <div className="font-bold">{data.musteriKodu || data.musteri || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Durum (Status)</div>
            <div className="font-bold">{data.durum || '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Miktar (Qty)</div>
            <div className="font-bold">{data.miktar || 0} {data.birim || ''}</div>
          </div>
        </div>

        {/* GENEL BILGILER TABLOSU */}
        <h3 className="font-bold mb-2 text-gray-700">Genel Bilgiler (General Info)</h3>
        <table className="w-full border-collapse border border-gray-300 mb-6">
          <tbody>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 w-1/3 font-medium">Numune No (Sample No)</td>
              <td className="p-2">{data.numuneNo}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Musteri (Customer)</td>
              <td className="p-2">{data.musteriKodu || data.musteri || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Musteri Artikel No (Customer Art No)</td>
              <td className="p-2">{data.musteriArtikelKodu || data.musteriArtikelNo || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Numune Tipi (Type)</td>
              <td className="p-2">{data.numuneTipi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Numunenin Sebebi (Reason)</td>
              <td className="p-2">{data.numuneninSebebi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Corap Tipi (Sock Type)</td>
              <td className="p-2">{data.corapTipi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Corap Dokusu (Texture)</td>
              <td className="p-2">{data.corapDokusu || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Igne Sayisi (Needle Count)</td>
              <td className="p-2">{data.igneSayisi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Kovan Capi (Cylinder)</td>
              <td className="p-2">{data.kovanCapi || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Durum (Status)</td>
              <td className="p-2">{data.durum || '-'}</td>
            </tr>
            <tr className="border-b">
              <td className="p-2 bg-gray-50 font-medium">Gonderim Sekli (Shipping)</td>
              <td className="p-2">{data.gonderim || data.gonderimSekli || '-'}</td>
            </tr>
            <tr>
              <td className="p-2 bg-gray-50 font-medium">Hedef Tarih (Target Date)</td>
              <td className="p-2">{data.hedefTarih || data.termin || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* OLCULER TABLOSU */}
        <h3 className="font-bold mb-2 text-gray-700">Ölçüler (Measurements)</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left whitespace-nowrap">Beden (Size)</th>
                <th className="p-2 border text-left whitespace-nowrap">Renk (Color)</th>
                <th className="p-2 border text-left whitespace-nowrap">Miktar (Qty)</th>
                <th className="p-2 border text-left whitespace-nowrap">Birim (Unit)</th>
                <th className="p-2 border text-left whitespace-nowrap">Lst.Eni</th>
                <th className="p-2 border text-left whitespace-nowrap">Lst.Yük.</th>
                <th className="p-2 border text-left whitespace-nowrap">Kç.Eni</th>
                <th className="p-2 border text-left whitespace-nowrap">Ay.Eni</th>
                <th className="p-2 border text-left whitespace-nowrap">Kç.Boy</th>
                <th className="p-2 border text-left whitespace-nowrap">Tb.Boy</th>
                <th className="p-2 border text-left whitespace-nowrap">Lst.St.</th>
                <th className="p-2 border text-left whitespace-nowrap">Kç/Ay.St.</th>
                <th className="p-2 border text-left whitespace-nowrap">Tp.St.</th>
                <th className="p-2 border text-left whitespace-nowrap">Bord</th>
              </tr>
            </thead>
            <tbody>
              {olculer.length > 0 ? olculer.map((olcu, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{olcu.bedenler || olcu.beden || '-'}</td>
                  <td className="p-2 border">{olcu.renk || '-'}</td>
                  <td className="p-2 border">{olcu.miktar || 0}</td>
                  <td className="p-2 border">{olcu.birim || 'Çift'}</td>
                  <td className="p-2 border">{olcu.lastikEni || '-'}</td>
                  <td className="p-2 border">{olcu.lastikYuksekligi || '-'}</td>
                  <td className="p-2 border">{olcu.koncEni || '-'}</td>
                  <td className="p-2 border">{olcu.ayakEni || '-'}</td>
                  <td className="p-2 border">{olcu.koncBoyu || '-'}</td>
                  <td className="p-2 border">{olcu.tabanBoyu || '-'}</td>
                  <td className="p-2 border">{olcu.lastikStreci || '-'}</td>
                  <td className="p-2 border">{olcu.koncStreciAyakStreci || '-'}</td>
                  <td className="p-2 border">{olcu.topukStreci || '-'}</td>
                  <td className="p-2 border">{olcu.bord || '-'}</td>
                </tr>
              )) : (
                <tr>
                  <td className="p-2 border text-center text-gray-500" colSpan={14}>Veri yok / No data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* İPLİK BİLGİLERİ TABLOSU */}
        {data.yarnInfo && data.yarnInfo.length > 0 && (
          <>
            <h3 className="font-bold mb-2 text-gray-700">İplik Bilgileri (Yarn Information)</h3>
            <div className="overflow-x-auto mb-6">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead className="bg-purple-50">
                  <tr>
                    <th className="p-2 border text-left whitespace-nowrap">Kullanım Yeri</th>
                    <th className="p-2 border text-left whitespace-nowrap">Detay</th>
                    <th className="p-2 border text-left whitespace-nowrap">Denye</th>
                    <th className="p-2 border text-left whitespace-nowrap">Cins</th>
                    <th className="p-2 border text-left whitespace-nowrap">Renk Kodu</th>
                    <th className="p-2 border text-left whitespace-nowrap">Renk</th>
                    <th className="p-2 border text-left whitespace-nowrap">Tedarikçi</th>
                    <th className="p-2 border text-left whitespace-nowrap">Not</th>
                  </tr>
                </thead>
                <tbody>
                  {data.yarnInfo.map((iplik, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2 border font-medium text-gray-700">{iplik.kullanimYeri || '-'}</td>
                      <td className="p-2 border text-gray-600">{iplik.detay || '-'}</td>
                      <td className="p-2 border">{iplik.denye || '-'}</td>
                      <td className="p-2 border">{iplik.cins || '-'}</td>
                      <td className="p-2 border">{iplik.renkKodu || '-'}</td>
                      <td className="p-2 border">{iplik.renk || '-'}</td>
                      <td className="p-2 border">{iplik.tedarikci || '-'}</td>
                      <td className="p-2 border">{iplik.not || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* KAPAT BUTONU */}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 rounded hover:bg-gray-300">
            Kapat (Close)
          </button>
        </div>

      </div>
    </div>
  );
}
