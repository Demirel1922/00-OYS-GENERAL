import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import type { SalesOrder } from '@/modules/sales-orders/domain/types';
import { useLookupStore as useLookupStoreRef } from '@/store/lookupStore';

// ----- FONT TANIMLAMA (Türkçe karakterler için Noto Sans) -----
// window.location.origin ile tam URL oluştur (web worker uyumlu)
const fontBase = typeof window !== 'undefined' ? window.location.origin : '';
Font.register({
  family: 'NotoSans',
  fonts: [
    { src: `${fontBase}/fonts/NotoSans-Regular.ttf` },
    { src: `${fontBase}/fonts/NotoSans-Bold.ttf`, fontWeight: 'bold' },
  ],
});

// ----- FORMAT FONKSİYONLARI -----
const formatDate = (date: any): string => {
  if (!date) return '-';
  try {
    const d = new Date(date);
    return d.toLocaleDateString('tr-TR');
  } catch {
    return String(date);
  }
};

const parseTrNumber = (val: any): number => {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  const str = String(val).trim();
  if (str === '') return 0;
  
  const hasComma = str.includes(',');
  const hasDot = str.includes('.');
  
  let normalized: string;
  if (hasComma && hasDot) {
    // Türkçe format: "1.234,56" → nokta binlik, virgül ondalık
    normalized = str.replace(/\./g, '').replace(',', '.');
  } else if (hasComma && !hasDot) {
    // Sadece virgül: "0,45" veya "1234,56"
    normalized = str.replace(',', '.');
  } else {
    // İngilizce format veya tam sayı: "4500.00" veya "10000"
    normalized = str;
  }
  
  const num = parseFloat(normalized);
  return isNaN(num) ? 0 : num;
};

const formatMoney = (amount: any, currency: string = 'TL'): string => {
  const num = parseTrNumber(amount);
  return num.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }) + ' ' + currency;
};

const formatQty = (qty: any): string => {
  const num = Number(qty) || 0;
  return num.toLocaleString('tr-TR');
};

// ----- STILLER (NotoSans fontu kullanılır) -----
const s = StyleSheet.create({
  page: { padding: 35, fontSize: 10, fontFamily: 'NotoSans' },
  header: { marginBottom: 20, borderBottom: '2px solid #000', paddingBottom: 10 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 10, color: '#666' },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 6, backgroundColor: '#f0f0f0', paddingTop: 4, paddingBottom: 4, paddingLeft: 8, paddingRight: 8 },
  row: { flexDirection: 'row', marginBottom: 4, paddingLeft: 2 },
  label: { width: '35%', fontWeight: 'bold', fontSize: 9 },
  value: { width: '65%', fontSize: 9 },
  table: { marginTop: 8 },
  tHead: { flexDirection: 'row', backgroundColor: '#f0f0f0', paddingTop: 4, paddingBottom: 4, paddingLeft: 2, paddingRight: 2, borderBottom: '1px solid #000' },
  tRow: { flexDirection: 'row', paddingTop: 3, paddingBottom: 3, paddingLeft: 2, paddingRight: 2, borderBottom: '1px solid #ddd' },
  colProduct: { width: '14%', fontSize: 7 },
  colGender: { width: '8%', fontSize: 7 },
  colType: { width: '12%', fontSize: 7 },
  colColor: { width: '10%', fontSize: 7 },
  colSize: { width: '8%', fontSize: 7, textAlign: 'center' },
  colQty: { width: '10%', fontSize: 7, textAlign: 'right' },
  colUnit: { width: '10%', fontSize: 7, textAlign: 'center' },
  colPrice: { width: '14%', fontSize: 7, textAlign: 'right' },
  colTotal: { width: '14%', fontSize: 7, textAlign: 'right' },
  thText: { fontSize: 7, fontWeight: 'bold' },
  thSub: { fontSize: 6, color: '#888' },
  totals: { marginTop: 12, paddingTop: 8, borderTop: '2px solid #000' },
  totalRow: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 3 },
  totalLabel: { fontWeight: 'bold', marginRight: 10, fontSize: 9 },
  footer: { position: 'absolute', bottom: 30, left: 35, right: 35, flexDirection: 'row', justifyContent: 'space-between', borderTop: '1px solid #ccc', paddingTop: 10 },
  sig: { width: '45%' },
  sigLine: { borderTop: '1px solid #000', marginTop: 30, paddingTop: 5 },
});

// ----- ETİKETLER (Türkçe karakterler düzeltildi) -----
const STATUS_LABELS: Record<string, string> = {
  draft: 'Taslak',
  confirmed: 'Onaylı',
  shipped: 'Gönderildi',
  cancelled: 'İptal'
};

const GENDER_OPTIONS = [
  { value: 'male', label: 'Erkek' },
  { value: 'female', label: 'Kadın' },
  { value: 'unisex', label: 'Unisex' }
];

const PRICE_UNIT_LABELS: Record<string, string> = {
  pair: 'Çift',
  dozen: 'Düzine',
  piece: 'Adet'
};

const SOCK_TYPE_LABELS: Record<string, string> = {
  socket: 'Soket',
  short: 'Kısa Konç',
  ankle: 'Patik',
  knee: 'Dizaltı',
  thermal: 'Termal',
  slip: 'Slip'
};

// ----- PDF BİLEŞENİ -----
function OrderPDFDocument({ order }: { order: SalesOrder }) {
  const safeOrder = {
    order_no: order?.order_no || 'Bilinmiyor',
    customer_name: order?.customer_name || 'Bilinmiyor',
    customer_po_no: order?.customer_po_no || '',
    order_date: order?.order_date,
    requested_termin: order?.requested_termin,
    confirmed_termin: order?.confirmed_termin,
    shipped_at: order?.shipped_at,
    payment_terms: order?.payment_terms || '',
    incoterm: order?.incoterm || '',
    currency: order?.currency || 'TL',
    status: order?.status || 'draft',
    notes: order?.notes || '',
    internal_notes: order?.internal_notes || '',
    lines: Array.isArray(order?.lines) ? order.lines : []
  };

  // Artık değerler doğrudan Türkçe string olarak geliyor (store'dan)
  const getGender = (v: string) => v || '-';
  const getSockType = (v: string) => v || '-';
  const getUnit = (v: string) => {
    // lookupStore'dan birim adını al
    try {
      const store = useLookupStoreRef.getState();
      const birim = store.items.find((i: any) => i.lookupType === 'BIRIM' && i.kod === v);
      if (birim) return birim.ad;
    } catch {}
    return PRICE_UNIT_LABELS[v] || v || '-';
  };

  let totalPairs = 0;
  let totalAmount = 0;
  safeOrder.lines.forEach((l: any) => {
    const qty = Number(l?.quantity) || 0;
    const unitPrice = parseTrNumber(l?.unit_price);
    const lineAmount = parseTrNumber(l?.line_amount) || (qty * unitPrice);
    totalPairs += qty;
    totalAmount += lineAmount;
  });

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Başlık */}
        <View style={s.header}>
          <Text style={s.title}>Örmeci Çorap / Ormeci Socks</Text>
          <Text style={s.subtitle}>Sipariş Formu / Order Form</Text>
        </View>

        {/* Genel Bilgiler */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Genel Bilgiler / General Information</Text>
          <View style={s.row}><Text style={s.label}>Sipariş No / Order No:</Text><Text style={s.value}>{safeOrder.order_no}</Text></View>
          <View style={s.row}><Text style={s.label}>Müşteri / Customer:</Text><Text style={s.value}>{safeOrder.customer_name}</Text></View>
          {safeOrder.customer_po_no ? <View style={s.row}><Text style={s.label}>Müşteri PO No / Customer PO:</Text><Text style={s.value}>{safeOrder.customer_po_no}</Text></View> : null}
          <View style={s.row}><Text style={s.label}>Sipariş Tarihi / Order Date:</Text><Text style={s.value}>{formatDate(safeOrder.order_date)}</Text></View>
          <View style={s.row}><Text style={s.label}>Durum / Status:</Text><Text style={s.value}>{STATUS_LABELS[safeOrder.status] || safeOrder.status}</Text></View>
        </View>

        {/* Termin Bilgileri */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Termin Bilgileri / Delivery Information</Text>
          <View style={s.row}><Text style={s.label}>Talep Edilen Termin / Requested:</Text><Text style={s.value}>{formatDate(safeOrder.requested_termin)}</Text></View>
          <View style={s.row}><Text style={s.label}>Onaylı Termin / Confirmed:</Text><Text style={s.value}>{formatDate(safeOrder.confirmed_termin)}</Text></View>
          {safeOrder.shipped_at && <View style={s.row}><Text style={s.label}>Gönderilme Tarihi / Shipped:</Text><Text style={s.value}>{formatDate(safeOrder.shipped_at)}</Text></View>}
          <View style={s.row}><Text style={s.label}>Ödeme Koşulları / Payment:</Text><Text style={s.value}>{safeOrder.payment_terms}</Text></View>
          {safeOrder.incoterm && <View style={s.row}><Text style={s.label}>Teslim Şekli / Incoterm:</Text><Text style={s.value}>{safeOrder.incoterm}</Text></View>}
        </View>

        {/* Sipariş Kalemleri */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sipariş Kalemleri / Order Items</Text>
          <View style={s.table}>
            <View style={s.tHead}>
              <View style={s.colProduct}><Text style={s.thText}>Ürün</Text><Text style={s.thSub}>Product</Text></View>
              <View style={s.colGender}><Text style={s.thText}>Cinsiyet</Text><Text style={s.thSub}>Gender</Text></View>
              <View style={s.colType}><Text style={s.thText}>Tip</Text><Text style={s.thSub}>Type</Text></View>
              <View style={s.colColor}><Text style={s.thText}>Renk</Text><Text style={s.thSub}>Color</Text></View>
              <View style={{...s.colSize}}><Text style={{...s.thText, textAlign: 'center'}}>Beden</Text><Text style={{...s.thSub, textAlign: 'center'}}>Size</Text></View>
              <View style={{...s.colQty}}><Text style={{...s.thText, textAlign: 'right'}}>Miktar</Text><Text style={{...s.thSub, textAlign: 'right'}}>Qty</Text></View>
              <View style={{...s.colUnit}}><Text style={{...s.thText, textAlign: 'center'}}>Birim</Text><Text style={{...s.thSub, textAlign: 'center'}}>Unit</Text></View>
              <View style={{...s.colPrice}}><Text style={{...s.thText, textAlign: 'right'}}>Birim Fiyat</Text><Text style={{...s.thSub, textAlign: 'right'}}>Unit Price</Text></View>
              <View style={{...s.colTotal}}><Text style={{...s.thText, textAlign: 'right'}}>Tutar</Text><Text style={{...s.thSub, textAlign: 'right'}}>Amount</Text></View>
            </View>
            {safeOrder.lines.map((l: any, i: number) => {
              const lCurr = l?.currency || safeOrder.currency;
              return (
              <View key={i} style={s.tRow}>
                <Text style={s.colProduct}>{l?.product_name || '-'}</Text>
                <Text style={s.colGender}>{getGender(l?.gender)}</Text>
                <Text style={s.colType}>{getSockType(l?.sock_type)}</Text>
                <Text style={s.colColor}>{l?.color || '-'}</Text>
                <Text style={s.colSize}>{l?.size || '-'}</Text>
                <Text style={s.colQty}>{formatQty(l?.quantity)}</Text>
                <Text style={s.colUnit}>{getUnit(l?.price_unit)}</Text>
                <Text style={s.colPrice}>{formatMoney(l?.unit_price, lCurr)}</Text>
                <Text style={s.colTotal}>{formatMoney(l?.line_amount || (parseTrNumber(l?.quantity) * parseTrNumber(l?.unit_price)), lCurr)}</Text>
              </View>
              );
            })}
          </View>
        </View>

        {/* Toplamlar */}
        <View style={s.totals}>
          <View style={s.totalRow}><Text style={s.totalLabel}>Toplam Çift / Total Pairs:</Text><Text>{formatQty(totalPairs)}</Text></View>
          <View style={s.totalRow}><Text style={s.totalLabel}>Toplam Tutar / Total Amount:</Text><Text>{formatMoney(totalAmount, safeOrder.currency)}</Text></View>
        </View>

        {/* Notlar */}
        {(safeOrder.notes || safeOrder.internal_notes) && (
          <View style={s.section}>
            {safeOrder.notes ? (
              <View style={s.row}><Text style={s.label}>Notlar / Notes:</Text><Text style={s.value}>{safeOrder.notes}</Text></View>
            ) : null}
            {safeOrder.internal_notes ? (
              <View style={s.row}><Text style={s.label}>Dahili Notlar / Internal:</Text><Text style={s.value}>{safeOrder.internal_notes}</Text></View>
            ) : null}
          </View>
        )}

        {/* İmza Alanı */}
        <View style={s.footer}>
          <View style={s.sig}>
            <Text>Örmeci Çorap / Ormeci Socks</Text>
            <View style={s.sigLine}><Text>İmza / Signature</Text></View>
          </View>
          <View style={s.sig}>
            <Text>Müşteri Onayı / Customer: {safeOrder.customer_name}</Text>
            <View style={s.sigLine}><Text>İmza / Signature</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ----- PDF OLUŞTURMA FONKSİYONLARI -----
export async function generateOrderPDF(order: SalesOrder): Promise<Blob | null> {
  try {
    const blob = await pdf(<OrderPDFDocument order={order} />).toBlob();
    return blob;
  } catch (error) {
    console.error('PDF hatası:', error);
    alert('PDF oluşturulamadı: ' + (error instanceof Error ? error.message : 'Bilinmeyen hata'));
    return null;
  }
}

export async function downloadOrderPDF(order: SalesOrder): Promise<void> {
  const blob = await generateOrderPDF(order);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Siparis_${order?.order_no || 'unknown'}_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}.pdf`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function openOrderPDFInNewTab(order: SalesOrder): Promise<void> {
  const blob = await generateOrderPDF(order);
  if (!blob) { alert('PDF açılamadı'); return; }
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}