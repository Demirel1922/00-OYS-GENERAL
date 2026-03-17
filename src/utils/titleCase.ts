// ============================================
// TÜRKÇE TITLE CASE - Otomatik büyük/küçük harf düzeltme
// ============================================
// Kural: Her kelimenin ilk harfi büyük, bağlaçlar küçük
// Türkçe karakter desteği: ı→İ, i→İ, ş→Ş, ç→Ç, ğ→Ğ, ö→Ö, ü→Ü
// ============================================

const BAGLACLAR = new Set([
  've', 'ile', 'ya', 'da', 'veya', 'için', 'de', 'ki', 'ama', 'fakat',
  'ise', 'ne', 'hem', 'oysa', 'ancak', 'lakin', 'hatta', 'üzere',
]);

function trUpperFirst(word: string): string {
  if (!word) return word;
  const first = word.charAt(0);
  const rest = word.slice(1).toLocaleLowerCase('tr-TR');

  // Türkçe özel: i → İ, ı → I
  const upper = first.toLocaleUpperCase('tr-TR');
  return upper + rest;
}

/**
 * Türkçe Title Case: Her kelimenin ilk harfi büyük, bağlaçlar küçük.
 * İlk kelime her zaman büyük harfle başlar.
 * Örnek: "çİÇEK VE ARI DeSenli" → "Çiçek ve Arı Desenli"
 */
export function toTitleCaseTR(text: string): string {
  if (!text || !text.trim()) return text;

  const words = text.trim().replace(/\s+/g, ' ').split(' ');

  return words.map((word, index) => {
    const lower = word.toLocaleLowerCase('tr-TR');

    // İlk kelime her zaman büyük
    if (index === 0) {
      return trUpperFirst(lower);
    }

    // Bağlaçlar küçük kalır
    if (BAGLACLAR.has(lower)) {
      return lower;
    }

    return trUpperFirst(lower);
  }).join(' ');
}

/**
 * Input onBlur handler — alandan çıkınca Title Case uygula.
 * React Hook Form setValue ile kullanılır.
 */
export function titleCaseOnBlur(
  value: string,
  setValue: (val: string) => void
): void {
  const corrected = toTitleCaseTR(value);
  if (corrected !== value) {
    setValue(corrected);
  }
}
