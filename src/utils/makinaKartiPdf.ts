import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UretimHazirlikKaydi } from '../modules/uretim-hazirlik/types';
import { tr } from './pdfHelpers';

export function generateMakinaKartiPdf(kayit: UretimHazirlikKaydi): void {
  const doc = new jsPDF('landscape', 'mm', 'a5');
  const k = kayit.urunKarti;
  const PW = 210;
  const PH = 148;
  const M = 3;
  const F = 'helvetica';

  let y = M;

  // HEADER
  doc.setFontSize(7);
  doc.setFont(F, 'bold');
  doc.text(tr('ÜRETİM BİLGİ FORMU'), PW / 2, y + 3, { align: 'center' });
  y += 5;

  // META
  doc.setFontSize(5);
  const half = (PW - M * 2) / 2;
  const metaLeft = [
    ['DESEN TANIMI', tr(k.urunTanimi || '-')],
    [tr('MÜŞTERİ KODU'), tr(k.musteriKodu || '-')],
  ];
  const metaRight = [
    [tr('ÜRÜN KODU'), tr(k.ormeciArtikelKodu || '-')],
    ['NUMUNE NO', kayit.numuneNo || '-'],
  ];
  for (let i = 0; i < metaLeft.length; i++) {
    doc.setFont(F, 'bold');
    doc.text(metaLeft[i][0], M, y + 2.5);
    doc.setFont(F, 'normal');
    doc.text(metaLeft[i][1], M + 22, y + 2.5);
    doc.setFont(F, 'bold');
    doc.text(metaRight[i][0], M + half, y + 2.5);
    doc.setFont(F, 'normal');
    doc.text(metaRight[i][1], M + half + 18, y + 2.5);
    y += 3.5;
  }
  y += 1;
  doc.setLineWidth(0.2);
  doc.line(M, y, PW - M, y);
  y += 1;

  const splitX = 128;
  const tableTop = y;

  // SOL: İPLİK TABLOSU (40 satır, boşlar dahil)
  const MAX = 40;
  const rows: string[][] = [];
  for (let i = 0; i < MAX; i++) {
    const ip = k.iplikler[i];
    if (ip && ip.iplikYeri) {
      rows.push([
        tr(ip.iplikYeri).substring(0, 18), ip.mekikKodu || '',
        tr(ip.denye || '').substring(0, 12), ip.kat || '',
        tr(ip.renk || '').substring(0, 8), ip.renkKodu || '',
        tr(ip.iplikCinsi || '').substring(0, 14), tr(ip.iplikTanimi || '').substring(0, 14),
        tr(ip.tedarikci || '').substring(0, 12),
      ]);
    } else {
      rows.push(['', '', '', '', '', '', '', '', '']);
    }
  }

  autoTable(doc, {
    startY: tableTop,
    head: [['YERI', 'MEKIK', 'DENYE', 'Kat', 'RENK', 'RENK KODU', tr('İPLİK CİNSİ'), tr('İPLİK TANIMI'), tr('TEDARİKÇİ')]],
    body: rows,
    margin: { left: M, right: PW - splitX + 2 },
    theme: 'grid',
    tableWidth: splitX - M - 2,
    styles: { fontSize: 3.8, cellPadding: { top: 0.3, bottom: 0.3, left: 0.5, right: 0.5 }, lineWidth: 0.08, lineColor: [0, 0, 0], overflow: 'hidden', minCellHeight: 2.5 },
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 3.8, minCellHeight: 3.5 },
    columnStyles: { 0: { cellWidth: 19 }, 1: { cellWidth: 8 }, 2: { cellWidth: 15 }, 3: { cellWidth: 5, halign: 'center' }, 4: { cellWidth: 10 }, 5: { cellWidth: 9 }, 6: { cellWidth: 17 }, 7: { cellWidth: 17 }, 8: { cellWidth: 'auto' } },
  });

  // SAĞ: ÖLÇÜLER
  const rX = splitX;
  const rW = PW - M - splitX;
  doc.setFontSize(4.5);
  doc.setFont(F, 'bold');
  doc.text(tr('ÖLÇÜLER'), rX + rW / 2, tableTop + 2, { align: 'center' });

  const boylar = k.olculer.filter(o => o.boy);
  const bH = boylar.length > 0 ? boylar.map(o => o.boy) : ['-'];

  const olcuF: [string, string][] = [
    ['lastikBoyu', tr('LASTİK BOYU')], ['lastikEni', tr('LASTİK ENİ')],
    ['koncBoyu', tr('KONÇ BOYU')], ['tenisBoyu', tr('TENİS BOYU')],
    ['tenisLastikEni', tr('TENİS LASTİK ENİ')],
    ['tabanAltiElastikBantBoyu', tr('TABANALTI ELASTİK BANT BOYU')],
    ['tabanAltiElastikBantEni', tr('TABANALTI ELASTİK BANT ENİ')],
    ['tabanBoyu', 'TABAN BOYU'], ['lastikStreci', tr('LASTİK STREÇİ')],
    ['koncStreci', tr('KONÇ STREÇİ')], ['tenisStreci', tr('TENİS STREÇİ')],
    ['tabanStreci', tr('TABAN STREÇİ')], ['topukStreci', tr('TOPUK STREÇİ')],
    ['koncMekanik', tr('KONÇ MEKANİK')], ['tabanMekanik', tr('TABAN MEKANİK')],
    ['tenisMekanik', tr('TENİS MEKANİK')],
    ['tabanElastikBantStrec', tr('TABAN ELASTİK BANT STREÇ')],
  ];

  autoTable(doc, {
    startY: tableTop + 4,
    head: [['', ...bH]],
    body: olcuF.map(([key, label]) => [label, ...boylar.map(o => (o as any)[key] || ''), ...(boylar.length === 0 ? [''] : [])]),
    margin: { left: rX, right: M },
    theme: 'grid',
    tableWidth: rW,
    styles: { fontSize: 3.5, cellPadding: { top: 0.3, bottom: 0.3, left: 0.5, right: 0.5 }, lineWidth: 0.08, lineColor: [0, 0, 0], overflow: 'hidden', minCellHeight: 2.5, halign: 'center' },
    headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 3.8, minCellHeight: 3 },
    columnStyles: { 0: { halign: 'left', fontStyle: 'bold', cellWidth: 28 } },
  });

  const endY = (doc as any).lastAutoTable.finalY;
  if (endY < PH - 10) {
    let ny = endY + 3;
    doc.setFontSize(4);
    doc.setFont(F, 'bold');
    doc.text('NOT', rX, ny);
    if (k.not) { doc.setFont(F, 'normal'); doc.text(doc.splitTextToSize(tr(k.not), rW - 2).slice(0, 4), rX, ny + 3); }
    if (k.ciftAgirligi) { doc.setFont(F, 'bold'); doc.text(tr(`Çift Ağırlığı: ${k.ciftAgirligi} gr`), rX, ny + 10); }
  }

  // GÖRÜNTÜLE (indirme değil, yeni sekmede aç)
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}
