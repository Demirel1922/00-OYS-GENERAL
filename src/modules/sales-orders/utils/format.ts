import { format, parseISO, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  TL: '₺',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export function formatMoney(amount: number | string, currency: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return '-';
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = num.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function formatMoney2(amount: number | string | null | undefined, currency: string = 'TRY'): string {
  if (amount === null || amount === undefined || amount === '') return '-';
  
  let num: number;
  if (typeof amount === 'number') {
    num = amount;
  } else {
    // Hem Türkçe ("1.234,56") hem İngilizce ("1234.56") formatı destekle
    const hasComma = amount.includes(',');
    const hasDot = amount.includes('.');
    
    if (hasComma && hasDot) {
      // Türkçe format: "1.234,56"
      num = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    } else if (hasComma && !hasDot) {
      // Sadece virgül: "1234,56"
      num = parseFloat(amount.replace(',', '.'));
    } else {
      // İngilizce format veya sadece sayı: "1234.56" veya "1234"
      num = parseFloat(amount);
    }
  }
  
  if (Number.isNaN(num)) return '-';
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = num.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${symbol}${formatted}`;
}

export function formatMoney3(amount: number | string | null | undefined, currency: string = 'TRY'): string {
  if (amount === null || amount === undefined || amount === '') return '-';
  
  let num: number;
  if (typeof amount === 'number') {
    num = amount;
  } else {
    const hasComma = amount.includes(',');
    const hasDot = amount.includes('.');
    
    if (hasComma && hasDot) {
      num = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    } else if (hasComma && !hasDot) {
      num = parseFloat(amount.replace(',', '.'));
    } else {
      num = parseFloat(amount);
    }
  }
  
  if (Number.isNaN(num)) return '-';
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = num.toLocaleString('tr-TR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  return `${symbol}${formatted}`;
}

export function formatMoneyRaw(value: number | string): number {
  const num = typeof value === 'string' ? parseFloat(value.replace(/\./g, '').replace(',', '.')) : value;
  return Number.isNaN(num) ? 0 : num;
}

export function formatMoney3Decimal(amount: number | string, currency: string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(num)) return '-';
  
  const symbol = CURRENCY_SYMBOLS[currency] || currency;
  const formatted = num.toLocaleString('tr-TR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
  return `${symbol}${formatted}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd.MM.yyyy', { locale: tr });
  } catch {
    return '-';
  }
}

export function formatDateTR(date: Date | string | null | undefined): string {
  if (!date) return '-';
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd.MM.yyyy', { locale: tr });
  } catch {
    return '-';
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd.MM.yyyy HH:mm', { locale: tr });
  } catch {
    return '-';
  }
}

export function normalizePriceInput(value: string): string {
  if (!value || value.trim() === '') return '';
  
  let normalized = value.replace(/\./g, ',');
  normalized = normalized.replace(/[^0-9,]/g, '');
  
  const parts = normalized.split(',');
  if (parts.length > 2) {
    normalized = parts[0] + ',' + parts.slice(1).join('');
  }
  
  return normalized;
}

export function parsePriceInput(value: string): number {
  if (!value || value.trim() === '') return 0;
  const normalized = value.replace(/\./g, '').replace(',', '.');
  const num = parseFloat(normalized);
  return Number.isNaN(num) ? 0 : num;
}

export function formatPriceInput(value: number): string {
  return value.toLocaleString('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

interface TerminWarning {
  level: 'error' | 'warning' | 'info' | null;
  message: string;
  daysLeft: number;
}

export function getTerminWarningLevel(dateString: string | null | undefined): TerminWarning['level'] {
  if (!dateString) return null;
  
  try {
    const termin = parseISO(dateString);
    const today = new Date();
    const daysLeft = differenceInDays(termin, today);
    
    if (daysLeft < 0) return 'error';
    if (daysLeft <= 7) return 'error';
    if (daysLeft <= 14) return 'warning';
    return null;
  } catch {
    return null;
  }
}

export function getTerminWarningMessage(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  try {
    const termin = parseISO(dateString);
    const today = new Date();
    const daysLeft = differenceInDays(termin, today);
    
    if (daysLeft < 0) return `Termin geçti (${Math.abs(daysLeft)} gün)`;
    if (daysLeft === 0) return 'Termin bugün';
    if (daysLeft <= 7) return `Termin çok yakın (${daysLeft} gün kaldı)`;
    if (daysLeft <= 14) return `Termin yaklaşıyor (${daysLeft} gün kaldı)`;
    return '';
  } catch {
    return '';
  }
}

export function calculateTerminWarning(dateString: string | Date | null | undefined): { 
  color: 'red' | 'orange' | 'yellow' | null; 
  text: string; 
  icon: 'AlertCircle' | 'AlertTriangle' | 'Clock' | null;
} {
  if (!dateString) {
    return { color: null, text: '', icon: null };
  }
  
  try {
    const termin = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    const today = new Date();
    const daysLeft = differenceInDays(termin, today);
    
    if (daysLeft < 0) {
      return { color: 'red', text: `Termin geçti (${Math.abs(daysLeft)} gün)`, icon: 'AlertCircle' };
    }
    if (daysLeft <= 7) {
      return { color: 'orange', text: `Termin çok yakın (${daysLeft} gün kaldı)`, icon: 'AlertTriangle' };
    }
    if (daysLeft <= 14) {
      return { color: 'yellow', text: `Termin yaklaşıyor (${daysLeft} gün kaldı)`, icon: 'Clock' };
    }
    return { color: null, text: '', icon: null };
  } catch {
    return { color: null, text: '', icon: null };
  }
}

export function generateOrderNo(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 900) + 100;
  return `SIP-${dateStr}-${random}`;
}

/**
 * Miktar (tam sayı) için binlik ayraçlı Türkçe format.
 * Örnek: 1000 → "1.000", 11250 → "11.250"
 * Ondalık kısım eklenmez.
 */
export function formatQuantity(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseInt(value.replace(/\D/g, ''), 10) : Math.round(value);
  if (isNaN(num) || num === 0) return '0';
  return num.toLocaleString('tr-TR', { maximumFractionDigits: 0 });
}
