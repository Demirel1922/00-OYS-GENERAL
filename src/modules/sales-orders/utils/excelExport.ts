import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';
import { STATUS_LABELS } from '@/modules/sales-orders/domain/types';
import { formatDate, formatMoneyRaw } from './format';

export async function exportOrdersToExcel(orders: SalesOrder[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Siparişler');

  worksheet.columns = [
    { header: 'Sipariş No', key: 'order_no', width: 20 },
    { header: 'Müşteri', key: 'customer_name', width: 25 },
    { header: 'Müşteri PO No', key: 'customer_po_no', width: 18 },
    { header: 'Durum', key: 'status', width: 15 },
    { header: 'Talep Edilen Termin', key: 'requested_termin', width: 20 },
    { header: 'Onaylı Termin', key: 'confirmed_termin', width: 18 },
    { header: 'Miktar (Çift)', key: 'total_pairs', width: 15 },
    { header: 'Tutar', key: 'total_amount', width: 15 },
    { header: 'Para Birimi', key: 'currency', width: 12 },
    { header: 'Teslim Şekli', key: 'incoterm', width: 14 },
    { header: 'Sipariş Tarihi', key: 'order_date', width: 18 },
    { header: 'Ödeme Koşulları', key: 'payment_terms', width: 18 },
    { header: 'Notlar', key: 'notes', width: 30 },
    { header: 'Dahili Notlar', key: 'internal_notes', width: 30 },
  ];

  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  orders.forEach((order) => {
    worksheet.addRow({
      order_no: order.order_no,
      customer_name: order.customer_name,
      customer_po_no: order.customer_po_no || '',
      status: STATUS_LABELS[order.status],
      requested_termin: formatDate(order.requested_termin),
      confirmed_termin: formatDate(order.confirmed_termin),
      total_pairs: order.total_pairs,
      total_amount: formatMoneyRaw(order.total_amount),
      currency: order.currency,
      incoterm: order.incoterm || '',
      order_date: formatDate(order.order_date),
      payment_terms: order.payment_terms,
      notes: order.notes || '',
      internal_notes: order.internal_notes || '',
    });
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `Siparisler_Raporu_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
  saveAs(blob, fileName);
}

export async function exportOrderToExcel(order: SalesOrder): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(`Sipariş_${order.order_no}`);

  worksheet.addRow(['Sipariş No', order.order_no]);
  worksheet.addRow(['Müşteri', order.customer_name]);
  worksheet.addRow(['Durum', STATUS_LABELS[order.status]]);
  worksheet.addRow(['Sipariş Tarihi', formatDate(order.order_date)]);
  worksheet.addRow(['Talep Edilen Termin', formatDate(order.requested_termin)]);
  worksheet.addRow(['Onaylı Termin', formatDate(order.confirmed_termin)]);
  worksheet.addRow(['Ödeme Koşulları', order.payment_terms]);
  worksheet.addRow(['Para Birimi', order.currency]);
  worksheet.addRow(['Toplam Çift', order.total_pairs]);
  worksheet.addRow(['Toplam Tutar', formatMoneyRaw(order.total_amount)]);
  worksheet.addRow([]);

  const headers = ['Ürün', 'Cinsiyet', 'Renk', 'Beden', 'Miktar', 'Birim', 'Birim Fiyat', 'Toplam Çift', 'Tutar'];
  worksheet.addRow(headers);
  
  const headerRow = worksheet.getRow(worksheet.rowCount);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  order.lines.forEach((line) => {
    worksheet.addRow([
      line.product_name,
      line.gender,
      line.color,
      line.size,
      line.quantity,
      line.price_unit,
      formatMoneyRaw(line.unit_price),
      line.line_total_pairs,
      formatMoneyRaw(line.line_amount),
    ]);
  });

  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  worksheet.columns.forEach((column) => {
    column.width = 18;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const fileName = `Siparis_${order.order_no}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.xlsx`;
  saveAs(blob, fileName);
}

export function exportToCSV(orders: SalesOrder[]): void {
  const headers = [
    'Sipariş No',
    'Müşteri',
    'Müşteri PO No',
    'Durum',
    'Talep Edilen Termin',
    'Onaylı Termin',
    'Miktar (Çift)',
    'Tutar',
    'Para Birimi',
    'Teslim Şekli',
    'Ödeme Koşulları',
    'Notlar',
    'Dahili Notlar',
  ];

  const rows = orders.map((order) => [
    order.order_no,
    order.customer_name,
    order.customer_po_no || '',
    STATUS_LABELS[order.status],
    formatDate(order.requested_termin),
    formatDate(order.confirmed_termin),
    order.total_pairs,
    formatMoneyRaw(order.total_amount),
    order.currency,
    order.incoterm || '',
    order.payment_terms,
    order.notes || '',
    order.internal_notes || '',
  ]);

  const delimiter = ';';
  const csvContent = '\uFEFF' + [headers.join(delimiter), ...rows.map((r) => r.join(delimiter))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Aktif_Siparisler_Raporu_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${new Date().getHours()}${new Date().getMinutes()}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}
