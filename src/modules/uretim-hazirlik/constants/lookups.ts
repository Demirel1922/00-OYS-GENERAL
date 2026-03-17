// ============================================================
// OYS-ERP Üretim Hazırlık - Lookup / Dropdown Verileri
// Kaynak: Excel "Veriler" sheet'i
// ============================================================

export const MUSTERI_KODLARI = ['09','13','39','86','89','124','126','127','129','131','132','133','137','139','142','143'];

export const IGNE_SAYILARI = ['84','96','108','120','132','144','156','168','176','200','220'];

export const CAP_DEGERLERI = ['3 1/4','3 1/2','3 3/4','4'];

export const KALINLIK_DEGERLERI = ['3','6','9','14','18'];

export const MAKINE_MODELLERI = [
  'GL 615 Burun Açık',
  'GL 615 Burun Kapamalı',
  'GK 616 Burun Kapamalı',
  'GK 616 D Burun Kapamalı',
  'GK 625 Burun Kapamalı',
];

export const CORAP_OZELLIKLERI = ['Düz','Havlu','Yarım Havlu','Teknik Havlu','Seçmeli Havlu','Derbili'];

export const CORAP_TIPLERI = ['Patik','Kısa Konç','Normal Konç','Çetik','Dizaltı','Dizüstü','Külotlu'];

export const YIKAMA_TIPLERI = ['Lavatec','Silikonlu','Sulu','Yok'];

export const BURUN_DIKIS_TIPLERI = ['Rosso','Teksıra','Comfort'];

export const FORMA_TIPLERI = ['Normal','Tüp'];

export const OLCU_SISTEMLERI = ['Alman','Katlamalı','Kuş Gözü'];

export const FORMA_CESITLERI = ['EL KALIBI','CORTESE','TECNOPEA'];

export const HAZIRLAYANLAR = ['Yusuf Gül','Mehmet Akif Salbaş'];

export const BOYLAR = [
  '15-18','19-22','23-25','23-26','26-30','27-30','31-34',
  '35-37','35-38','36-38','36-40','37-38','37-39','38-40',
  '39-41','39-42','41-43','41-45','43-45','43-46','44-46','47-50',
  'S','M','L','XL'
];

// Mekik Tanımları (79 adet) - Excel Veriler C14 kolonu
export const MEKIK_TANIMLARI = [
  'ASTAR','LASTİK-1','LASTİK-2','LASTİK İPLİĞİ','LASTİK KONÇ İPLİĞİ',
  'LASTİK TENİS İPLİĞİ','LASTİK KONÇ TABAN İPLİĞİ','LASTİK TENİS TABAN İPLİĞİ',
  'TENİS İPLİĞİ','LASTİK İPLİK ALTI','LASTİK KONÇ İPLİK ALTI',
  'LASTİK TENİS İPLİK ALTI','LASTİK KONÇ TABAN İPLİK ALTI',
  'LASTİK TENİS BİLEK TABAN İPLİĞİ','LASTİK TENİS BİLEK TABAN İPLİK ALTI',
  'TENİS İPLİK ALTI','ÇEKÇEK TOPUK','3 BOYUT TOPUK-1','3 BOYUT TOPUK-2',
  'TOPUK İPLİĞİ','TOPUK İPLİK ALTI','BURUN İPLİĞİ','TOPUK BURUN İPLİĞİ',
  'TOPUK BURUN İPLİK ALTI','BURUN İPLİK ALTI',
  'ÇEKÇEK TOPUK TOPUK','ÇEKÇEK TOPUK TOPUK ALTI',
  'ÇEKÇEK TOPUK TOPUK BURUN','ÇEKÇEK TOPUK TOPUK BURUN ALTI',
  'ÇEKÇEK TOPUK ZEMİN BURUN İPLİK ALTI',
  'KONÇ İPLİĞİ','KONÇ İPLİK ALTI','KONÇ TABAN İPLİĞİ','KONÇ TABAN İPLİK ALTI',
  'KONÇ PİKOT','LASTİK PİKOT','KONÇ 3 BOYUT',
  'KONÇ DESEN İPLİĞİ','TABAN DESEN İPLİĞİ','TAKVİYE İPLİĞİ',
  'ÇARIK TOPUK LASTİĞİ','ÇARIK TOPUK İPLİĞİ','ÇARIK TOPUK İPLİK ALTI',
  'ÇARIK BOŞLUK İPLİĞİ','ÇARIK BOŞLUK İPLİK ALTI',
  'ÇARIK KIVIRMA İPLİĞİ','ÇARIK LASTİK','ÇARIK TABAN İPLİĞİ',
  'ÇARIK TABAN İPLİK ALTI','ÇARIK BURUN İPLİĞİ','ÇARIK BURUN ALTI',
  'ÇARIK TOPUK BOŞLUK İPLİĞİ','ÇARIK TOPUK BOŞLUK İPLİĞİ ALTI',
  'ÇARIK TOPUK BURUN İPLİĞİ','ÇARIK TOPUK BURUN İPLİĞİ ALTI',
  'Tenis Bilek Topuk Taban Burun İplik Altı',
  'TENİS BİLEK TOPUK TABAN İPLİĞİ','TENİS BİLEK TOPUK TABAN İPLİK Altı',
  'DESEN İPİ =1','DESEN İPİ =2','DESEN İPİ =3','DESEN İPİ =4',
  'DESEN İPİ =5','DESEN İPİ =6','DESEN İPİ =7','DESEN İPİ =8',
  'DESEN İPİ =9','DESEN İPİ =10','DESEN İPİ =11','DESEN İPİ =12',
  'DESEN İPİ =13','DESEN İPİ =14','DESEN İPİ =15','DESEN İPİ =16',
  'DESEN İPİ =17','DESEN İPİ =18',
  'TEKSIRA TAKVİYE İPLİĞİ','TEKSIRA İNCE İĞNE','TEKSIRA KALIN İĞNE',
];

// Mekik Kodları
export const MEKIK_KODLARI = [
  'Z-1','Z-2','Z-3','Z-4','Z-5','Z-6','Z-7','Z-8','Z-EXTRA',
  'D-1-1','D-1-2','D-1-3','D-2-1','D-2-2','D-2-3',
  'D-3-1','D-3-2','D-3-3','D-4-1','D-4-2','D-4-3',
  'D-5-1','D-5-2','D-5-3','D-6-1','D-6-2','D-6-3',
  'L-1','L-2',
];

// İplik Numaraları (Ne / Nm / den / dtex)
export const IPLIK_NUMARALARI = [
  'Ne 12/1','Ne 16/1','Ne 18/1','Ne 19/1','Ne 20/1','Ne 24/1','Ne 30/1','Ne 30/2',
  'Ne 40/1','Ne 40/2','Ne 60/2','Ne 80/2',
  'Nm 28/1','Nm 30/1','Nm 48/2','Nm 50/2',
  'den 150','den 150/48','den 152','den 300',
  'dtex 40/1','dtex 40/2','dtex 70/1','dtex 70/2','dtex 70/3',
  'dtex 20/40','dtex 18/40','dtex 18/70','dtex 20/70','dtex 20/75',
  'dtex 30/75','dtex 30/70','dtex 70/70',
  'dtex 130/70/70','dtex 140/70/70','dtex 200/70/70','dtex 280/70/70','dtex 560/70/70',
  'dtex 130/75/75','dtex 140/75/75',
];

// İplik Cinsleri (28 adet)
export const IPLIK_CINSLERI = [
  'Karde','Penye','Organik Karde','Organik Penye','Compact','Organik Compact',
  'Merserize','% 100 Pamuk Melanj','Yün','Yün Akrilik','Yün Kaşmir',
  'Bambu','Modal','Polyamid 6','Polyamid 6.6','Tactel','Recycle Polyamid',
  'Coolmax','Kesik Elyaf','Kesik Elyaf Polyester','Thermolite','Repreve','Repreve Sorbtek',
  'Filament Polyester','Polyamid Elastan','Recycle Polyamidli Elastan',
  'Polyester Elastan','Recycle Polyesterli Elastan','Polyamid Likra','Polyester Likra',
  'Polyamid Likra Lastik','Polyester Likra Lastik','Polyamid Lastik Elastan',
  'Polyester Lastik Elastan','Pamuk Polyester','Polypropilen','İpek Kaşmir',
  'Streçelit','Elastoelit','Polyelit',
];

// Tedarikçiler
export const TEDARIKCILER = [
  'Akpamuk','Aloha','Danişment','Denge Tekstil','Elasteks','Gapsan',
  'Garanti İplik','Gipelast','Gülçağ','İnfo İplik','İstanbul İplik','İthal',
  'Kaplanlar Tekstil','Karadağ İplik','Keten İplik','Mersu','Sarar',
  'Südwolle','Uzunlar İplik','Zafer Tekstil',
];

// KAT değerleri
export const KAT_DEGERLERI = Array.from({length: 50}, (_, i) => String(i + 1));
