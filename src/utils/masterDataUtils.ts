// ============================================
// MASTER DATA ORTAK FONKSİYONLARI
// ============================================
// Tüm store'lar tarafından kullanılan ortak utility fonksiyonları
// ============================================

/**
 * Benzersiz ID oluşturur (timestamp + random)
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Şu anki timestamp'i ISO formatında döndürür
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Karşılaştırma için normalize eder (Türkçe karakter uyumlu)
 * - Küçük harfe çevirir
 * - Türkçe karakterleri İngilizce karşılıklarına çevirir
 * - Boşlukları temizler
 */
export const normalizeForCompare = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/İ/g, 'I')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ş/g, 'S')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .trim();
};

/**
 * Title Case formatına çevirir (bağlaç istisnası ile)
 * Örn: "YÜN VE KARIŞIMLILAR" → "Yün ve Karışımlılar"
 */
const BAGLACLAR = ['ve', 'ile', 'de', 'da', 'ki', 'için', 'gibi', 'kadar', 'rağmen', 'karşın', 'dek', 'sonra', 'önce', 'ise'];

export const toTitleCase = (str: string): string => {
  return str
    .toLowerCase()
    .split(' ')
    .map((word, index) => {
      // İlk kelime her zaman büyük
      if (index === 0) return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1);
      // Bağlaçlar küçük kalır
      if (BAGLACLAR.includes(word)) return word;
      // Diğer kelimeler Title Case
      return word.charAt(0).toLocaleUpperCase('tr-TR') + word.slice(1);
    })
    .join(' ');
};
