import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UretimHazirlikKaydi } from '../modules/uretim-hazirlik/types';
import { tr } from './pdfHelpers';

export function generateUrunKartiPdf(kayit: UretimHazirlikKaydi): void {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const k = kayit.urunKarti;
  const forma = kayit.forma;

  const PW = 297;
  const PH = 210;
  const M = 4;
  const F = 'helvetica';

  // Sütun sınırları
  const C1 = 160;  // Sol bölüm sonu (İplik tablosu)
  const C2 = 205;  // Orta bölüm sonu (Detay bilgileri)

  let y = M;

  // ===== DIŞ ÇERÇEVE =====
  doc.setLineWidth(0.4);
  doc.rect(M, M, PW - M * 2, PH - M * 2);

  // ===== BAŞLIKLAR =====
  doc.setFontSize(9);
  doc.setFont(F, 'bold');
  doc.text(tr('ÜRÜN BİLGİLERİ'), (M + C1) / 2, y + 5, { align: 'center' });
  doc.text(tr('MAKİNA ÇIKIŞ ÖLÇÜLERİ'), (C2 + PW - M) / 2, y + 5, { align: 'center' });
  y += 7;
  doc.setLineWidth(0.15);
  doc.line(M, y, PW - M, y);

  // ===== ÜST BİLGİ SATIRI =====
  doc.setFontSize(5.5);
  doc.setFont(F, 'bold');
  doc.text(tr('ÜRÜN TANIMI'), M + 2, y + 3.5);
  doc.setFont(F, 'normal');
  doc.text(tr(k.urunTanimi || '-'), M + 28, y + 3.5);

  doc.setFont(F, 'bold');
  doc.text(tr('HAZIRLAYAN'), C1 + 2, y + 3.5);
  doc.setFont(F, 'normal');
  doc.text(tr(k.hazirlayan || '-'), C1 + 24, y + 3.5);

  doc.setFont(F, 'bold');
  doc.text(tr('NUMUNE TARİHİ'), C2 + 2, y + 3.5);
  doc.setFont(F, 'normal');
  doc.text(k.numuneTarihi || '-', C2 + 25, y + 3.5);

  y += 5;
  doc.line(M, y, PW - M, y);

  const contentTop = y;

  // ===== SOL: İPLİK TABLOSU (22 satır, boşlar dahil) =====
  const MAX = 22;
  const iplikRows: string[][] = [];
  for (let i = 0; i < MAX; i++) {
    const ip = k.iplikler[i];
    if (ip && ip.iplikYeri) {
      iplikRows.push([
        tr(ip.iplikYeri).substring(0, 24),
        ip.mekikKodu || '',
        tr(ip.denye || '').substring(0, 16),
        ip.kat || '',
        tr(ip.iplikCinsi || '').substring(0, 20),
        tr(ip.iplikTanimi || '').substring(0, 18),
        tr(ip.renk || '').substring(0, 12),
        ip.renkKodu || '',
        tr(ip.tedarikci || '').substring(0, 14),
      ]);
    } else {
      iplikRows.push(['', '', '', '', '', '', '', '', '']);
    }
  }

  autoTable(doc, {
    startY: contentTop,
    head: [['', 'Mekik', 'Denye', 'Kat', tr('İplik Cinsi'), tr('İplikTanımı'), 'Renk', 'Renk Kodu', tr('Tedarikçi')]],
    body: iplikRows,
    margin: { left: M, right: PW - C1 },
    theme: 'grid',
    tableWidth: C1 - M,
    styles: {
      fontSize: 5,
      cellPadding: { top: 0.5, bottom: 0.5, left: 0.6, right: 0.6 },
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      overflow: 'hidden',
      minCellHeight: 7,
    },
    headStyles: {
      fillColor: [235, 235, 235],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      minCellHeight: 7.5,
    },
    columnStyles: {
      0: { cellWidth: 28 },
      1: { cellWidth: 10, halign: 'center' },
      2: { cellWidth: 20 },
      3: { cellWidth: 7, halign: 'center' },
      4: { cellWidth: 22 },
      5: { cellWidth: 18 },
      6: { cellWidth: 13 },
      7: { cellWidth: 14, halign: 'center' },
      8: { cellWidth: 'auto' },
    },
  });

  // ===== ORTA: DETAY BİLGİLERİ =====
  const detW = C2 - C1;

  const details: string[][] = [
    [tr('MÜŞTERİ KODU'), tr(k.musteriKodu || '-')],
    [tr('ÖRMECİ ARTİKEL\nKODU'), tr(k.ormeciArtikelKodu || '-')],
    [tr('MÜŞTERİ ARTİKEL\nKODU'), tr(k.musteriArtikelKodu || '-')],
    ['BOY', tr(k.boy || '-')],
    ['BURUN KAPAMA', tr(k.burunKapama || '-')],
    ['YIKAMA', tr(k.yikama || '-')],
    [tr('ÜRETİM ZAMANI'), `${k.uretimZamani || '-'} sn.`],
    [tr('İĞNE SAYISI'), tr(k.igneSayisi || '-')],
    [tr('ÇAP'), tr(k.cap || '-')],
    ['KALINLIK', tr(k.kalinlik || '-')],
    [tr('MAKİNA MODELİ'), tr(k.makinaModeli || '-')],
    [tr('MAKİNA NO.'), tr(k.makinaNo || '-')],
    [tr('ÇİFT AĞIRLIĞI'), `${k.ciftAgirligi || '-'} gr.`],
    ['Not:', tr(k.not || '')],
  ];

  autoTable(doc, {
    startY: contentTop,
    body: details,
    margin: { left: C1, right: PW - C2 },
    theme: 'grid',
    tableWidth: detW,
    styles: {
      fontSize: 5,
      cellPadding: { top: 1, bottom: 1, left: 1, right: 1 },
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      minCellHeight: 7,
      overflow: 'hidden',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: detW * 0.5 },
      1: { cellWidth: detW * 0.5 },
    },
  });

  // ===== SAĞ ÜST: ÖLÇÜLER =====
  const rW = PW - M - C2;
  const boylar = k.olculer.filter(o => o.boy);
  const bH = boylar.length > 0 ? boylar.map(o => o.boy) : ['-'];

  const olcuF: [string, string][] = [
    ['lastikBoyu', tr('LASTİK BOYU')],
    ['lastikEni', tr('LASTİK ENİ')],
    ['koncBoyu', tr('KONÇ BOYU')],
    ['tenisBoyu', tr('TENİS BOYU')],
    ['tenisLastikEni', tr('TENİS LASTİK ENİ')],
    ['tabanAltiElastikBantBoyu', tr('TABANALTI ELASTİK\nBANT BOYU')],
    ['tabanAltiElastikBantEni', tr('TABANALTI ELASTİK\nBANT ENİ')],
    ['tabanBoyu', 'TABAN BOYU'],
    ['lastikStreci', tr('LASTİK STREÇİ')],
    ['koncStreci', tr('KONÇ STREÇİ')],
    ['tenisStreci', tr('TENİS STREÇİ')],
    ['tabanStreci', tr('TABAN STREÇİ')],
    ['topukStreci', tr('TOPUK STREÇİ')],
    ['koncMekanik', tr('KONÇ MEKANİK')],
    ['tabanMekanik', tr('TABAN MEKANİK')],
    ['tabanElastikBantStrec', tr('TABAN ELASTİK\nBANT STREÇ')],
    ['bord', 'BORD'],
  ];

  autoTable(doc, {
    startY: contentTop,
    head: [['Boylar', ...bH]],
    body: olcuF.map(([key, label]) => [
      label,
      ...boylar.map(o => (o as any)[key] || ''),
      ...(boylar.length === 0 ? [''] : []),
    ]),
    margin: { left: C2, right: M },
    theme: 'grid',
    tableWidth: rW,
    styles: {
      fontSize: 4.5,
      cellPadding: { top: 0.4, bottom: 0.4, left: 0.6, right: 0.6 },
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      minCellHeight: 5.2,
      halign: 'center',
      overflow: 'hidden',
    },
    headStyles: {
      fillColor: [235, 235, 235],
      textColor: [0, 0, 0],
      fontStyle: 'bold',
      minCellHeight: 5.5,
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', cellWidth: 30 },
    },
  });

  const olcuEndY = (doc as any).lastAutoTable.finalY;

  // ===== SAĞ ALT: FORMA BİLGİLERİ =====
  let fy = olcuEndY + 0.5;

  doc.setFontSize(6);
  doc.setFont(F, 'bold');
  doc.text(tr('FORMA BİLGİLERİ'), C2 + rW / 2, fy + 3, { align: 'center' });
  fy += 5;

  const formaRows: string[][] = [];

  // Forma çeşidi
  formaRows.push([tr('FORMA ÇEŞİDİ'), '', tr(forma.formaCesidi?.replace('_', ' ') || '-'), '']);

  // Parametreler (2'li grup)
  if (forma.parametreler?.length) {
    for (let i = 0; i < forma.parametreler.length; i += 2) {
      const p1 = forma.parametreler[i];
      const p2 = forma.parametreler[i + 1];
      formaRows.push([
        tr(p1?.etiket || ''), p1?.deger || '',
        tr(p2?.etiket || ''), p2?.deger || '',
      ]);
    }
  }

  // Kalıp numaraları (boy eşleştirmeli)
  const maxKalip = Math.max(forma.kalipNolari?.length || 0, 6);
  for (let i = 0; i < maxKalip; i++) {
    const boy = boylar[i]?.boy || '';
    const kalipNo = forma.kalipNolari?.[i] || '';
    formaRows.push(['KALIP NO', '', boy, kalipNo]);
  }

  // NOT
  formaRows.push(['NOT', tr(k.not || ''), '', '']);

  autoTable(doc, {
    startY: fy,
    body: formaRows,
    margin: { left: C2, right: M },
    theme: 'grid',
    tableWidth: rW,
    styles: {
      fontSize: 4.5,
      cellPadding: { top: 0.4, bottom: 0.4, left: 0.6, right: 0.6 },
      lineWidth: 0.1,
      lineColor: [0, 0, 0],
      minCellHeight: 5,
      overflow: 'hidden',
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: rW * 0.3 },
      1: { cellWidth: rW * 0.2 },
      2: { fontStyle: 'bold', cellWidth: rW * 0.3 },
      3: { cellWidth: rW * 0.2 },
    },
  });

  // ===== DİKEY AYIRMA ÇİZGİLERİ =====
  doc.setLineWidth(0.2);
  doc.line(C1, M, C1, PH - M);
  doc.line(C2, M, C2, PH - M);

  // ===== PDF'İ YENİ SEKMEDE AÇ =====
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}
