// ============================================================
// OYS-ERP Üretim Hazırlık - Factory / Initial Data
// ============================================================

import type {
  UretimHazirlikKaydi, UrunHazirlikKarti, GramajCalismasi,
  YikamaCalismasi, FormaCalismasi, IplikSatiri, OlcuSatiri,
  GramajSatiri, YikamaAdimi,
} from '../types';
import { generateId, createLog } from './calculations';

export function createEmptyIplikSatiri(id: number): IplikSatiri {
  return { id, iplikYeri: '', mekikKodu: '', denye: '', kat: '', iplikCinsi: '', iplikTanimi: '', renk: '', renkKodu: '', tedarikci: '' };
}

export function createEmptyOlcuSatiri(id: number): OlcuSatiri {
  return {
    id, boy: '', lastikBoyu: '', lastikEni: '', koncBoyu: '', tenisBoyu: '',
    tenisLastikEni: '', tabanAltiElastikBantBoyu: '', tabanAltiElastikBantEni: '',
    tabanBoyu: '', lastikStreci: '', koncStreci: '', tenisStreci: '',
    tabanStreci: '', topukStreci: '', koncMekanik: '', tabanMekanik: '',
    tenisMekanik: '', bord: '', tabanElastikBantStrec: '',
  };
}

export function createEmptyGramajSatiri(id: number): GramajSatiri {
  return {
    id, iplikYeri: '', mekikKodu: '', denye: '', kat: '', iplikCinsi: '',
    iplikTanimi: '', renk: '', renkKodu: '', tedarikci: '',
    orgudenOnceAgirlik: '', orgudenSonraAgirlik: '',
    kullanilanMiktar6Cift: 0, kullanilanMiktar1Duzine: 0,
  };
}

export function createEmptyYikamaAdimi(adim: number): YikamaAdimi {
  return {
    adim, yumusaticiSuresi: '', buharSuresi: '', sogutmaSuresi: '',
    sogutmaDerecesi: '', kurutmaSuresi: '', kurutmaDerecesi: '',
    kullanilanYumusatici: '', yumusaticiMiktari: '', silikonMiktari: '', kimyasalMiktari: '',
  };
}

export function createEmptyUrunKarti(): UrunHazirlikKarti {
  const iplikler: IplikSatiri[] = [];
  const ilk = createEmptyIplikSatiri(1);
  ilk.iplikYeri = 'KONÇ TABAN İPLİĞİ';
  ilk.iplikCinsi = 'Kesik Elyaf';
  iplikler.push(ilk);
  for (let i = 2; i <= 10; i++) iplikler.push(createEmptyIplikSatiri(i));

  const olculer: OlcuSatiri[] = [];
  for (let i = 1; i <= 3; i++) olculer.push(createEmptyOlcuSatiri(i));

  return {
    urunTanimi: '', hazirlayan: '', numuneTarihi: new Date().toISOString().split('T')[0],
    musteriKodu: '', musteriArtikelKodu: '', ormeciArtikelKodu: '',
    boy: '', burunKapama: '', yikama: '', uretimZamani: '',
    igneSayisi: '', cap: '', kalinlik: '', makinaModeli: '', makinaNo: '',
    ciftAgirligi: '', not: '', iplikler, olculer,
  };
}

export function createEmptyGramaj(): GramajCalismasi {
  const satirlar: GramajSatiri[] = [];
  for (let i = 1; i <= 10; i++) satirlar.push(createEmptyGramajSatiri(i));
  return {
    satirlar, toplam6Cift: 0, toplam1Duzine: 0,
    burunDikisi: '', yikamaAgirlik: '', birCiftAgirligi: '',
    birDuzineAgirligi: 0, genelToplam6Cift: 0, genelToplam1Duzine: 0,
    fark6Cift: 0, fark1Duzine: 0, not: '',
  };
}

export function createEmptyYikama(): YikamaCalismasi {
  return {
    yikamaYeri: '', yikamaTipi: '', musteriKodu: '', artikelKodu: '',
    ormeciArtikelNo: '', yikamaProgramKodu: '', sorumlu: '',
    adimlar: [1, 2, 3, 4, 5, 6].map(n => createEmptyYikamaAdimi(n)),
    aciklama: '',
  };
}

export function createEmptyForma(): FormaCalismasi {
  return {
    formaCesidi: '',
    parametreler: [
      { etiket: '', deger: '' }, { etiket: '', deger: '' },
      { etiket: '', deger: '' }, { etiket: '', deger: '' },
      { etiket: '', deger: '' }, { etiket: '', deger: '' },
    ],
    kalipNolari: ['', '', '', '', '', ''],
  };
}

/** Numune kaydından Üretim Hazırlık kaydı oluştur */
export function createFromNumune(numune: {
  id: number; numuneNo: string; musteri: string; musteriKodu?: string;
  musteriArtikelKodu?: string; corapTipi?: string; corapDokusu?: string;
  igneSayisi?: string; kovanCapi?: string; yikama?: string; burunKapama?: string;
  formaBilgisi?: string; formaSekli?: string; olcuSekli?: string;
  corapTanimi?: string; musteriMarkasi?: string;
}): UretimHazirlikKaydi {
  const urunKarti = createEmptyUrunKarti();

  // Numuneden devir — tek kaynak prensibi
  urunKarti.musteriKodu = numune.musteriKodu || numune.musteri || '';
  urunKarti.musteriArtikelKodu = numune.musteriArtikelKodu || '';
  urunKarti.ormeciArtikelKodu = numune.numuneNo || '';
  urunKarti.urunTanimi = numune.corapTanimi || '';
  if (numune.igneSayisi) urunKarti.igneSayisi = numune.igneSayisi;
  if (numune.kovanCapi) urunKarti.cap = numune.kovanCapi;
  if (numune.yikama) urunKarti.yikama = numune.yikama === 'Var' ? 'Lavatec' : numune.yikama === 'Yok' ? 'Yok' : numune.yikama;
  if (numune.burunKapama) urunKarti.burunKapama = numune.burunKapama;

  const yikama = createEmptyYikama();
  yikama.musteriKodu = urunKarti.musteriKodu;
  yikama.ormeciArtikelNo = urunKarti.ormeciArtikelKodu;

  const now = new Date().toISOString();

  return {
    id: generateId(),
    numuneNo: numune.numuneNo,
    numuneId: numune.id,
    status: 'NEW',
    kilitli: false,
    olusturanKullanici: 'Sistem',
    olusturmaTarihi: now,
    sonGuncelleyen: 'Sistem',
    sonGuncellemeTarihi: now,
    sorumlu: '',
    acil: false,
    urunKarti,
    gramaj: createEmptyGramaj(),
    yikama,
    forma: createEmptyForma(),
    loglar: [createLog('Sistem', 'OLUSTURMA', `Numune ${numune.numuneNo} kaydından oluşturuldu`)],
  };
}
