// Türkçe karakter dönüştürücü (jsPDF default font Türkçe desteklemez)
const TR_MAP: Record<string, string> = {
  'ç': 'c', 'Ç': 'C', 'ğ': 'g', 'Ğ': 'G', 'ı': 'i', 'İ': 'I',
  'ö': 'o', 'Ö': 'O', 'ş': 's', 'Ş': 'S', 'ü': 'u', 'Ü': 'U',
};
export function tr(text: string): string {
  if (!text) return '';
  return text.replace(/[çÇğĞıİöÖşŞüÜ]/g, c => TR_MAP[c] || c);
}
