# OYS-ERP Kod Kalite Analizi Raporu

> **Tarih:** 2026-03-19  
> **Kapsam:** Repo'nun mevcut durumu — 7 madde üzerinden analiz  
> **Not:** Bu rapor salt-okunur analiz içerir; hiçbir dosya değiştirilmemiştir.

---

## Madde 1: Lazy Loading Eksikliği

### Mevcut Durum

`src/App.tsx` dosyasında **26 sayfa/modül bileşeni** eagerly import edilmektedir (satır 1-52). Hiçbirinde `React.lazy()` kullanılmamış ve dosyada `Suspense` fallback bileşeni **bulunmamaktadır**.

### Eagerly Import Edilen Sayfa Bileşenleri

| # | Dosya | Import (App.tsx satır) | Export Tipi | Lazy Uygun mu? | Neden |
|---|-------|----------------------|-------------|----------------|-------|
| 1 | `@/pages/Login` | 12 | Named | ✅ Evet | Giriş sayfası, ilk yükleme dışında gereksiz |
| 2 | `@/pages/Dashboard` | 13 | Named | ✅ Evet | Auth sonrası yüklenir |
| 3 | `@/pages/Admin` | 14 | Named | ✅ Evet | Sadece admin kullanıcılar erişir |
| 4 | `@/pages/ModulePlaceholder` | 15 | Named | ✅ Evet | Placeholder — nadir yüklenir |
| 5 | `@/pages/SubModulePlaceholder` | 16 | Named | ✅ Evet | Placeholder — nadir yüklenir |
| 6 | `@/pages/NotAuthorized403` | 17 | Named | ✅ Evet | Hata sayfası — nadir |
| 7 | `@/pages/NotFound404` | 18 | Named | ✅ Evet | Hata sayfası — nadir |
| 8 | `@/pages/IplikDepo` | 22 | Default | ✅ Evet | Modül sayfası |
| 9 | `@/pages/AksesuarDepo` | 23 | Default | ✅ Evet | Modül sayfası |
| 10 | `@/pages/HammaddeDepo` | 24 | Default | ✅ Evet | Modül sayfası |
| 11 | `@/pages/SiparisSatisSevkiyat` | 25 | Default | ✅ Evet | Modül sayfası |
| 12 | `@/pages/Sertifikalar` | 26 | Default | ✅ Evet | Modül sayfası |
| 13 | `@/pages/Sertifikalar/DIR` | 27 | Default | ✅ Evet | Alt modül sayfası |
| 14 | `@/pages/BilgiGirisleri` | 30 | Default | ✅ Evet | Modül sayfası |
| 15 | `@/pages/BilgiGirisleri/Musteriler` | 31 | Default | ✅ Evet | Alt sayfa |
| 16 | `@/pages/BilgiGirisleri/Tedarikciler` | 32 | Default | ✅ Evet | Alt sayfa |
| 17 | `@/pages/BilgiGirisleri/Depolar` | 33 | Default | ✅ Evet | Alt sayfa |
| 18 | `@/pages/BilgiGirisleri/GenelCorapBilgileri` | 34 | Default | ✅ Evet | Alt sayfa |
| 19 | `@/pages/IplikTanimlari` | 35 | Default | ✅ Evet | Alt sayfa |
| 20 | `@/pages/BilgiGirisleri/ArtikelTanimlari` | 36 | Default | ✅ Evet | Alt sayfa |
| 21 | `@/modules/sales-orders/pages/SalesOrdersPage` | 39 | Named | ✅ Evet | Modül sayfası |
| 22 | `@/modules/sales-orders/pages/SalesOrderNew` | 40 | Named | ✅ Evet | Modül sayfası |
| 23 | `@/modules/sales-orders/pages/SalesOrderDetail` | 41 | Named | ✅ Evet | Modül sayfası |
| 24 | `@/modules/sales-orders/pages/AnalyticsPage` | 42 | Named | ✅ Evet | Modül sayfası |
| 25 | `@/modules/numune/pages/NumuneDashboard` | 45 | Named | ✅ Evet | Modül sayfası |
| 26 | `@/modules/numune/pages/NumuneTaleplerPage` | 46 | Named | ✅ Evet | Modül sayfası |
| 27 | `@/modules/numune/pages/YeniNumune` | 47 | Named | ✅ Evet | Modül sayfası |
| 28 | `@/modules/numune/pages/MusteriAnalizi` | 48 | Named | ✅ Evet | Modül sayfası |
| 29 | `@/modules/uretim-hazirlik/pages/UretimHazirlikListePage` | 51 | Named | ✅ Evet | Modül sayfası |
| 30 | `@/modules/uretim-hazirlik/pages/UretimHazirlikDetayPage` | 52 | Named | ✅ Evet | Modül sayfası |

### Lazy YapılMAMASI Gereken Bileşenler

| Bileşen | Neden |
|---------|-------|
| `ProtectedRoute` / `ModuleProtectedRoute` | Her korunan route'ta sarmalayıcı — her yüklemede gerekli |
| `AuthWrapper` | `App.tsx` içinde tanımlı, her route'u sarar |
| `PublicRoute` | `App.tsx` içinde tanımlı, login route'unda gerekli |
| `Toaster` (sonner) | Global bildirim bileşeni |
| `BrowserRouter`, `Routes`, `Route`, `Navigate` | React Router altyapısı |

### Doğru Lazy Pattern

**Default export (`export default function X`)** → 13 bileşen:
```tsx
const IplikDepo = lazy(() => import('@/pages/IplikDepo'));
```

**Named export (`export function X`)** → 17 bileşen:
```tsx
const Login = lazy(() => import('@/pages/Login').then(m => ({ default: m.Login })));
```

### Etki Analizi
- `src/App.tsx` dosyası değişir. `<Suspense fallback={...}>` eklenmeli.
- İlk yükleme boyutu önemli ölçüde düşer (30 sayfa → talep üzerine).
- Build sonrası chunk splitting etkinleşir.

### Risk Seviyesi: **Düşük**
### Önerilen Aksiyon
Tüm 30 sayfa import'unu `React.lazy()` ile değiştir, `<Suspense>` ile sar, `ProtectedRoute`/`AuthWrapper` gibi altyapı bileşenlerini eagerly bırak.

---

## Madde 2: kimi-plugin-inspect-react Temizliği

### Mevcut Durum

| Dosya | Satır | İçerik |
|-------|-------|--------|
| `vite.config.ts` | 4 | `import { inspectAttr } from 'kimi-plugin-inspect-react'` |
| `vite.config.ts` | 9 | `plugins: [inspectAttr(), react()],` |
| `package.json` | 56 | `"kimi-plugin-inspect-react": "^1.0.3",` (devDependencies) |
| `package-lock.json` | — | Dependency metadata |

### Başka Referans Var mı?
Repo'da bu üç konumdan başka hiçbir yerde `kimi-plugin` referansı bulunmamaktadır.

### Kaldırıldığında Build Bozulur mu?
**Hayır.** Bu bir development-only Vite plugin'idir. Kaldırıldığında:
- `inspectAttr()` plugin çağrısı silinir → plugins dizisi `[react()]` olur
- Build ve dev server sorunsuz çalışmaya devam eder

### Silinmesi Gereken Satırlar

| # | Dosya | Satır | İşlem |
|---|-------|-------|-------|
| 1 | `vite.config.ts` | 4 | Satırı tamamen sil |
| 2 | `vite.config.ts` | 9 | `plugins: [inspectAttr(), react()]` → `plugins: [react()]` olarak değiştir |
| 3 | `package.json` | 56 | `"kimi-plugin-inspect-react": "^1.0.3",` satırını sil |
| 4 | Ardından | — | `npm install` çalıştır (package-lock.json güncellenir) |

### Etki Analizi
Yalnızca Vite dev/build pipeline'ı etkilenir. Uygulama kodu etkilenmez.

### Risk Seviyesi: **Düşük**
### Önerilen Aksiyon
3 satırı sil, `npm install` çalıştır, build doğrulaması yap.

---

## Madde 3: window.location.pathname Kullanımı

### Tüm Kullanımlar

| # | Dosya:Satır | Mevcut Kullanım | Değiştirilebilir mi? | Gerekli Import Değişikliği |
|---|------------|-----------------|---------------------|---------------------------|
| 1 | `src/components/common/ProtectedRoute.tsx:30` | `const pathname = window.location.pathname;` | ✅ Evet | `useLocation` import'u eklenmeli (`react-router-dom`'dan). Satır 30: `const { pathname } = useLocation();` |
| 2 | `src/components/ErrorBoundary.tsx:35` | `window.location.reload();` | ❌ Hayır | Class component + hata kurtarma senaryosu. `reload()` için alternatif yok, uygun kullanım. |
| 3 | `src/modules/sales-orders/utils/pdfExport.tsx:8` | `window.location.origin` | ❌ Hayır | Utility dosyası, React bileşeni değil. Font URL oluşturma için gerekli. |
| 4 | `src/modules/numune/pages/MusteriAnalizi.tsx:263` | `window.location.href = 'mailto:...'` | ❌ Hayır | `mailto:` protokolü — React Router navigasyonu değil. Uygun kullanım. |

### Detaylı Analiz — ProtectedRoute.tsx (Satır 30)

```typescript
// MEVCUT (sorunlu):
export function ModuleProtectedRoute({ children }: ModuleProtectedRouteProps) {
  const { isAuthenticated, allowedModules, isAdmin } = useAuthStore();
  const pathname = window.location.pathname; // ← window.location kullanımı
  ...
}

// ÖNERİLEN:
import { Navigate, useLocation } from 'react-router-dom';
export function ModuleProtectedRoute({ children }: ModuleProtectedRouteProps) {
  const { isAuthenticated, allowedModules, isAdmin } = useAuthStore();
  const { pathname } = useLocation(); // ← React Router hook'u
  ...
}
```

**Koşul kontrolü:** `ModuleProtectedRoute`, `<Route>` içinde kullanıldığı için React Router context'i mevcuttur ✅

### Etki Analizi
Yalnızca `ProtectedRoute.tsx` değişir. Tüm korunan route'lar bu bileşeni kullanır, ama davranış değişmez.

### Risk Seviyesi: **Düşük**
### Önerilen Aksiyon
`ProtectedRoute.tsx` satır 30'da `window.location.pathname` yerine `useLocation()` hook'u kullan.

---

## Madde 4: Unused Import / Variable Temizliği

### Tespit Edilen Sorunlar

| # | Dosya:Satır | Unused Tanım | Tipi | Güvenle Silinebilir mi? |
|---|------------|-------------|------|------------------------|
| 1 | `src/components/common/SortableTable.tsx:4` | `useMemo` | import | ✅ Evet — dosyada hiç kullanılmıyor |
| 2 | `src/components/common/ProtectedRoute.tsx:3` | `getModuleById` | import | ✅ Evet — import ediliyor ama dosyada kullanılmıyor (yalnızca `MODULES` kullanılıyor) |
| 3 | `src/pages/BilgiGirisleri/TedarikciKategorileri.tsx` | Tüm dosya | dosya | ⚠️ Dikkat — Dosya tanımlı ama repo'da hiçbir yerden import edilmiyor. Ölü kod. |

### Ek Notlar
- `@ts-ignore` kullanımı: **0 adet** (temiz ✅)
- `eslint-disable` kullanımı: **0 adet** (temiz ✅)
- `type` import'ları ayrı değerlendirildi — runtime'da silindiği için öncelik dışı bırakıldı

### Etki Analizi
- `SortableTable.tsx`: Sadece import satırı değişir, bileşen davranışı etkilenmez
- `ProtectedRoute.tsx`: Sadece import satırı değişir, bileşen davranışı etkilenmez
- `TedarikciKategorileri.tsx`: Dosya silinebilir ama gelecekte kullanılma ihtimali değerlendirilmeli

### Risk Seviyesi: **Düşük**
### Önerilen Aksiyon
Kullanılmayan import'ları kaldır; `TedarikciKategorileri.tsx` için takım kararı al (sil veya route ekle).

---

## Madde 5: Dosya/Klasör Adlandırma Tutarlılığı

### Tespit Edilen Tutarsızlıklar

#### A) Klasör Adlandırma — Türkçe vs İngilizce Karışımı

| Mevcut Yol | Sorun | Önerilen Yol | Kırılma Riski |
|-----------|-------|-------------|--------------|
| `src/pages/BilgiGirisleri/` | Türkçe PascalCase klasör | `src/pages/bilgi-girisleri/` veya olduğu gibi bırak | 🔴 Yüksek — 7+ import değişir |
| `src/pages/HammaddeDepo/` | Türkçe PascalCase klasör | `src/pages/hammadde-depo/` veya olduğu gibi bırak | 🔴 Yüksek — import değişir |
| `src/pages/IplikTanimlari/` | Türkçe PascalCase klasör | `src/pages/iplik-tanimlari/` veya olduğu gibi bırak | 🔴 Yüksek — import değişir |
| `src/pages/SiparisSatisSevkiyat/` | Türkçe PascalCase klasör | `src/pages/siparis-satis-sevkiyat/` veya olduğu gibi bırak | 🔴 Yüksek — import değişir |
| `src/modules/numune/` | Türkçe kebab-case | Tutarlı ✅ | — |
| `src/modules/sales-orders/` | İngilizce kebab-case | Tutarlı ✅ | — |
| `src/modules/uretim-hazirlik/` | Türkçe kebab-case | Tutarlı ✅ | — |
| `src/features/aksesuar/` | Türkçe kebab-case | Tutarlı ✅ | — |
| `src/features/iplik/` | Türkçe kebab-case | Tutarlı ✅ | — |

**Dominant pattern:** `modules/` ve `features/` → **kebab-case**; `pages/` → **PascalCase**

#### B) Dosya Adlandırma — Pattern Karışımı

| Mevcut Dosya | Sorun | Önerilen | Kırılma Riski |
|-------------|-------|----------|--------------|
| `src/hooks/use-mobile.ts` | kebab-case hook | `src/hooks/useMobile.ts` (camelCase tüm hooklar gibi) | 🟡 Orta — 1 import değişir |
| `src/components/ui/*.tsx` | kebab-case (shadcn/ui convention) | Olduğu gibi bırak — shadcn/ui standardı | — |
| `src/utils/makinaKartiPdf.ts` | Türkçe camelCase | Kabul edilebilir — Türkçe domain | — |
| `src/utils/urunKartiPdf.ts` | Türkçe camelCase | Kabul edilebilir — Türkçe domain | — |

#### C) index.tsx Pattern Tutarlılığı

| Pattern | Sayı | Örnekler |
|---------|------|---------|
| `index.tsx` / `index.ts` kullanan | 13 | `pages/BilgiGirisleri/index.tsx`, `pages/HammaddeDepo/index.tsx`, `store/index.ts`, `types/index.ts` vb. |
| Doğrudan dosya adı kullanan | 20+ | `pages/Login.tsx`, `pages/Dashboard.tsx`, `pages/Admin.tsx` vb. |

**Dominant pattern:** Tek dosyalı sayfalar → doğrudan isim (`Login.tsx`); klasör bazlı modüller → `index.tsx`

#### D) Dil Tutarsızlığı Özeti

| Kategori | Türkçe | İngilizce | Karışık |
|---------|--------|-----------|--------|
| Klasörler (pages/) | 5 | 0 | Sertifikalar/DIR |
| Klasörler (modules/) | 2 | 1 | — |
| Dosyalar (pages/) | 15+ | 5 | — |
| Dosyalar (modules/) | 8+ | 10+ | — |
| Store dosyaları | 12 | 0 | — |

### Etki Analizi
Klasör/dosya adı değiştirmek tüm import yollarını, route tanımlarını ve dinamik referansları etkiler. Büyük ölçekli değişiklik.

### Risk Seviyesi: **Yüksek**
### Önerilen Aksiyon
Mevcut pattern'i kabul et; yeni dosyalar için `modules/` → kebab-case, `pages/` → PascalCase kuralını belgele. Yalnızca `use-mobile.ts` → `useMobile.ts` değişikliği düşük riskle yapılabilir.

---

## Madde 6: Büyük Dosyaların Bölünme Analizi

### 1. YeniNumune.tsx — 920 satır

**İç bileşenler:** Yok (tek monolitik bileşen)

**useState çağrıları:** 9 adet
- `activeTab`, `isSaving`, `toast`, `status`, `lastSaved`, `isEditMode`, `editId`, `formData`, `showRestoreDialog`

**useMemo hook'ları:** 7 adet
- `aktifRenkler`, `boyListesi`, `dokuListesi`, `aktifIplikDetaylar`, `aktifMusteriler`, `aktifKalinliklar`, `iplikTedarikcileri`

**Yardımcı fonksiyonlar (bileşen içi):** 26 adet
- `showToast`, `handleRestoreConfirm`, `handleRestoreCancel`, `handleGeneralChange`, `handleMeasurementChange`, `addMeasurementRow`, `removeMeasurementRow`, `handleYarnChange`, `addDesenRow`, `removeDesenRow`, `isGeneralInfoComplete`, `hasValidMeasurement`, `getMissingGeneralFields`, `handleTabClick`, `validate`, `calculateTotalMiktar`, `handleSave`, `handleSaveAndApprove`, `getStatusBadgeColor` vb.

**Modül seviyesi yardımcılar:** 3 adet
- `getFixedYarnRows()` (satır 118), `getInitialDesenRow()` (satır 139), `initialFormData` (satır 143)

**Bölünme planı:**

```
src/modules/numune/pages/YeniNumune.tsx (920 → ~300 satır)

→ src/modules/numune/components/GeneralInfoTab.tsx
  - Satır aralığı: ~642-798
  - Props: formData.generalInfo, handleGeneralChange, aktifMusteriler, aktifRenkler,
           boyListesi, dokuListesi, CINSIYET_OPTIONS, NUMUNE_TIPI_OPTIONS, CORAP_TIPI_OPTIONS
  
→ src/modules/numune/components/MeasurementTab.tsx
  - Satır aralığı: ~750-838
  - Props: formData.measurements, handleMeasurementChange, addMeasurementRow,
           removeMeasurementRow, boyListesi, aktifRenkler, BIRIM_OPTIONS

→ src/modules/numune/components/YarnInfoTab.tsx
  - Satır aralığı: ~840-917
  - Props: formData.yarnInfo, formData.desenCount, handleYarnChange, addDesenRow,
           removeDesenRow, aktifKalinliklar, aktifIplikDetaylar, aktifRenkler, iplikTedarikcileri

→ src/modules/numune/components/StatusHeader.tsx
  - Satır aralığı: ~601-628
  - Props: status, lastSaved, isEditMode, isSaving, handleSave, handleSaveAndApprove
```

---

### 2. UretimHazirlikDetayPage.tsx — 1.053 satır

**İç bileşenler:** 11 adet (zaten iyi yapılandırılmış!)

*Yeniden kullanılabilir UI bileşenleri (satır 40-113):*
- `LookupSelect` (satır 40-55) → Ayrı dosyaya taşınabilir mi? ✅ Evet
- `StoreSelect` (satır 57-75) → Ayrı dosyaya taşınabilir mi? ✅ Evet
- `FieldInput` (satır 77-91) → Ayrı dosyaya taşınabilir mi? ✅ Evet
- `ReadonlyField` (satır 93-102) → Ayrı dosyaya taşınabilir mi? ✅ Evet
- `FormField` (satır 104-113) → Ayrı dosyaya taşınabilir mi? ✅ Evet

*Tab bileşenleri (satır 428-1053):*
- `UrunHazirlikKartiTab` (satır 428-671, 244 satır) → Ayrı dosyaya taşınabilir mi? ✅ Evet
- `GramajTab` (satır 672-756, 85 satır) → Ayrı dosyaya taşınabilir mi? ✅ Evet
- `YikamaTab` (satır 757-832, 76 satır) → Ayrı dosyaya taşınabilir mi? ✅ Evet
- `FormaTab` (satır 833-905, 73 satır) → Ayrı dosyaya taşınabilir mi? ✅ Evet
- `MakinaKartiTab` (satır 906-998, 93 satır) → Ayrı dosyaya taşınabilir mi? ✅ Evet
- `OnayTab` (satır 999-1053, 55 satır) → Ayrı dosyaya taşınabilir mi? ✅ Evet

**useState çağrıları:** 3 adet (ana bileşende)
- `activeTab`, `kayit`, `toast`

**Bölünme planı:**

```
src/modules/uretim-hazirlik/pages/UretimHazirlikDetayPage.tsx (1053 → ~300 satır)

→ src/modules/uretim-hazirlik/components/FormComponents.tsx
  - LookupSelect, StoreSelect, FieldInput, ReadonlyField, FormField
  - Props: Bileşen bazlı (zaten prop-driven)

→ src/modules/uretim-hazirlik/components/UrunHazirlikKartiTab.tsx
  - Props: kayit, locked, updateField, updateIplik, addIplik, removeIplik, updateOlcu, addOlcu

→ src/modules/uretim-hazirlik/components/GramajTab.tsx
  - Props: kayit, locked, updateSatir

→ src/modules/uretim-hazirlik/components/YikamaTab.tsx
  - Props: kayit, locked, updateField, updateAdim

→ src/modules/uretim-hazirlik/components/FormaTab.tsx
  - Props: kayit, locked, updateField

→ src/modules/uretim-hazirlik/components/MakinaKartiTab.tsx
  - Props: kayit

→ src/modules/uretim-hazirlik/components/OnayTab.tsx
  - Props: kayit, onSave, onApprove, onReopen
```

---

### 3. SalesOrderNew.tsx — 788 satır

**İç bileşenler:** Yok (tek monolitik bileşen)

**useState çağrıları:** 1 adet
- `confirmedLines`

**useForm/useFieldArray:** React Hook Form kullanımı (form, fields, append, remove)

**useMemo hook'ları:** 5 adet
- `aktifMusteriler`, `aktifRenkler`, `bedenler`, `cinsiyetler`, `corapTipleri`

**Yardımcı fonksiyonlar (bileşen içi):** 19 adet
- `getBirimAdi`, `recalculateLine`, `handleQuantityChange`, `handlePriceUnitChange`, `handleLinePriceChange`, `handleLineCurrencyChange`, `validateLineBeforeConfirm`, `handleConfirmLine`, `handleConfirmAndAddNew`, `handleRemoveLine`, `buildOrderPayload`, `onSubmit`, `handleSaveAndApprove` vb.

**Modül seviyesi yardımcılar:** 1 adet
- `makeEmptyLine()` (satır 46)

**Bölünme planı:**

```
src/modules/sales-orders/pages/SalesOrderNew.tsx (788 → ~250 satır)

→ src/modules/sales-orders/components/OrderHeaderSection.tsx
  - Satır aralığı: ~330-380
  - Props: form, aktifMusteriler, control

→ src/modules/sales-orders/components/OrderLinesTable.tsx
  - Satır aralığı: ~380-720
  - Props: form, fields, append, remove, lines, confirmedLines,
           handleQuantityChange, handlePriceUnitChange, handleLinePriceChange,
           handleLineCurrencyChange, handleConfirmLine, handleConfirmAndAddNew,
           handleRemoveLine, validateLineBeforeConfirm, totals,
           aktifRenkler, bedenler, cinsiyetler, corapTipleri, getBirimAdi

→ src/modules/sales-orders/components/OrderSummarySection.tsx
  - Satır aralığı: ~720-780
  - Props: totals, confirmedLines, lines, currency
```

### Etki Analizi
Bölünme işlemi dosya bazlı olduğu için risk düşüktür; ancak prop geçişlerinin doğru yapılandırılması gerekir.

### Risk Seviyesi: **Orta**
### Önerilen Aksiyon
Öncelik sırası: (1) UretimHazirlikDetayPage — zaten iç bileşenleri var, sadece taşıma; (2) YeniNumune — tab bazlı bölünme; (3) SalesOrderNew — form bölünmesi.

---

## Madde 7: localStorage vs Dexie Depolama Tutarsızlığı

### localStorage Kullanımları

| # | Key | Dosya(lar) | İşlem | Açıklama |
|---|-----|-----------|-------|----------|
| 1 | `oys_numune_listesi` | `lib/db.ts`, `numune/pages/YeniNumune.tsx`, `numune/pages/NumuneTaleplerPage.tsx`, `numune/pages/MusteriAnalizi.tsx`, `numune/components/NumuneDetayModal.tsx` | get/set | Numune listesi — ana veri deposu |
| 2 | `oys_numune_sira` | `lib/db.ts:219-221` | get/remove | Eski sayaç göç kontrolü (legacy) |
| 3 | `oys_uretim_hazirlik_listesi` | `uretim-hazirlik/pages/UretimHazirlikDetayPage.tsx`, `uretim-hazirlik/pages/UretimHazirlikListePage.tsx`, `numune/pages/NumuneTaleplerPage.tsx` | get/set | Üretim hazırlık kayıtları |
| 4 | `erp_tanimlar` | `features/iplik/storage.ts` | get/set | İplik tanımları |
| 5 | `erp_iplik_hareketleri` | `features/iplik/storage.ts` | get/set | İplik stok hareketleri |
| 6 | `erp_aksesuar_tanimlar` | `features/aksesuar/storage.ts` | get/set | Aksesuar tanımları |
| 7 | `erp_aksesuar_hareketleri` | `features/aksesuar/storage.ts` | get/set | Aksesuar stok hareketleri |

### Zustand Persist (localStorage Üzerinden)

| # | Store Key | Dosya | Veri Tipi |
|---|-----------|-------|-----------|
| 1 | `auth-storage` | `store/authStore.ts` | Kullanıcı oturum bilgisi |
| 2 | `users-storage` | `store/usersStore.ts` | Kullanıcı listesi |
| 3 | `oys-artikel-store-v1` | `store/artikelStore.ts` | Artikel tanımları |
| 4 | `oys-depo-store-v2` | `store/depoStore.ts` | Depo tanımları |
| 5 | `oys-iplik-detay-store-v2` | `store/iplikDetayStore.ts` | İplik detay kategorileri |
| 6 | `oys-islem-tipi-store-v2` | `store/islemTipiStore.ts` | İşlem tipleri |
| 7 | `oys-kalinlik-store-v2` | `store/kalinlikStore.ts` | Kalınlık tanımları |
| 8 | `oys-lookup-store` | `store/lookupStore.ts` | Lookup (beden/tip/cinsiyet/birim/doku) |
| 9 | `oys-musteri-store-v2` | `store/musteriStore.ts` | Müşteri listesi |
| 10 | `oys-renk-store-v2` | `store/renkStore.ts` | Renk tanımları |
| 11 | `oys-tedarikci-kategori-store` | `store/tedarikciKategoriStore.ts` | Tedarikçi kategorileri |
| 12 | `oys-tedarikci-store-v2` | `store/tedarikciStore.ts` | Tedarikçi listesi |

### Dexie (IndexedDB) Kullanımları

| Tablo | Dosya | İşlemler |
|-------|-------|---------|
| `salesOrders` | `lib/db.ts`, `sales-orders/hooks/*.ts`, `sales-orders/services/orderService.ts` | CRUD (add, put, get, delete, toArray, bulkPut) |
| `priceAuditLogs` | `lib/db.ts`, `lib/priceAuditLog.ts` | add, where.equals.toArray, toArray |
| `orderCounter` | `lib/db.ts` | get, put (sipariş numara sayacı) |
| `numuneCounter` | `lib/db.ts` | where, add, update, first (numune numara sayacı) |

### Veri Kaynağı Karşılaştırma Tablosu

| Veri | Mevcut Depolama | Önerilen Depolama | Göç Riski | Göç Stratejisi |
|------|----------------|-------------------|-----------|----------------|
| Numune listesi (`oys_numune_listesi`) | localStorage | Dexie (yeni tablo: `numuneler`) | 🟡 Orta | Yeni tablo oluştur, ilk yüklemede localStorage→Dexie göçü yap, eski key'i sil |
| Numune sayacı | Dexie (`numuneCounter`) | Dexie (mevcut) ✅ | — | Zaten Dexie'de |
| Üretim hazırlık listesi (`oys_uretim_hazirlik_listesi`) | localStorage | Dexie (yeni tablo: `uretimHazirlik`) | 🟡 Orta | Aynı göç stratejisi |
| Sipariş sayacı | Dexie (`orderCounter`) | Dexie (mevcut) ✅ | — | Zaten Dexie'de |
| Sipariş verileri | Dexie (`salesOrders`) | Dexie (mevcut) ✅ | — | Zaten Dexie'de |
| İplik tanımları (`erp_tanimlar`) | localStorage | Dexie (yeni tablo) | 🟡 Orta | Göç fonksiyonu yaz |
| İplik hareketleri (`erp_iplik_hareketleri`) | localStorage | Dexie (yeni tablo) | 🟡 Orta | Göç fonksiyonu yaz |
| Aksesuar tanımları (`erp_aksesuar_tanimlar`) | localStorage | Dexie (yeni tablo) | 🟡 Orta | Göç fonksiyonu yaz |
| Aksesuar hareketleri (`erp_aksesuar_hareketleri`) | localStorage | Dexie (yeni tablo) | 🟡 Orta | Göç fonksiyonu yaz |
| Zustand store'lar (12 adet) | localStorage (persist) | localStorage (persist) ✅ | — | Kalmalı — küçük yapılandırma verileri, persist uygun |
| Auth/Users store | localStorage (persist) | localStorage (persist) ✅ | — | Kalmalı — oturum verisi için persist uygun |

### Hibrit Yapı Analizi: `generateNumuneNo()`

**Dosya:** `src/lib/db.ts` (satır 213-262)

Bu fonksiyon **hem Dexie hem localStorage** kullanmaktadır:

1. **Dexie:** `db.numuneCounter` tablosundan cinsiyet+yıl bazlı sıra sayacını okur (satır 224-228)
2. **localStorage:** `oys_numune_listesi` key'inden mevcut numune listesini okur — çakışma kontrolü için (satır 239)
3. **localStorage (legacy):** `oys_numune_sira` key'ini göç amaçlı kontrol eder ve siler (satır 219-221)

**Sorun:** Numune listesi localStorage'da tutulurken sayaç Dexie'de tutuluyor. Bu tutarsızlık:
- İki farklı asenkron kaynak arasında race condition riski oluşturur
- localStorage 5-10 MB sınırına sahip, büyük numune listeleri için yetersiz olabilir
- `JSON.parse()` işlemi büyük listelerde performans sorunu yaratabilir

**Çözüm önerisi:** `oys_numune_listesi` verilerini Dexie'ye taşı → `generateNumuneNo()` fonksiyonu tamamen Dexie'ye bağımlı olsun.

### STORAGE_KEY Kullanımları

| Anahtar | Dosya | Mekanizma |
|---------|-------|-----------|
| `STORAGE_KEY = 'oys_uretim_hazirlik_listesi'` | `uretim-hazirlik/utils/calculations.ts:1` | Export edilen sabit → localStorage key |
| `STORAGE_KEYS.TANIMLAR = 'erp_tanimlar'` | `features/iplik/storage.ts:5` | localStorage key |
| `STORAGE_KEYS.HAREKETLER = 'erp_iplik_hareketleri'` | `features/iplik/storage.ts:6` | localStorage key |
| `STORAGE_KEYS.TANIMLAR = 'erp_aksesuar_tanimlar'` | `features/aksesuar/storage.ts:5` | localStorage key |
| `STORAGE_KEYS.HAREKETLER = 'erp_aksesuar_hareketleri'` | `features/aksesuar/storage.ts:6` | localStorage key |

### Etki Analizi
Dexie göçü 5+ dosyada değişiklik gerektirir. Mevcut veri kaybı riski var — göç sırasında eski veriyi koruma mekanizması şart.

### Risk Seviyesi: **Yüksek**
### Önerilen Aksiyon
Önce `oys_numune_listesi`'ni Dexie'ye taşı (en kritik hibrit yapı), ardından `oys_uretim_hazirlik_listesi` ve iplik/aksesuar verilerini. Zustand persist store'ları localStorage'da bırak.

---

## Rapor Özeti

| # | Madde | Etkilenen Dosya Sayısı | Risk | Tahmini Efor | Öncelik Sırası |
|---|-------|----------------------|------|-------------|----------------|
| 1 | Lazy Loading | 1 (App.tsx) | Düşük | 1-2 saat | 1 |
| 2 | kimi-plugin kaldırma | 2 (vite.config.ts + package.json) | Düşük | 15 dakika | 2 |
| 3 | window.location fix | 1 (ProtectedRoute.tsx) | Düşük | 15 dakika | 3 |
| 4 | Unused temizliği | 3 (SortableTable, ProtectedRoute, TedarikciKategorileri) | Düşük | 30 dakika | 4 |
| 5 | Adlandırma tutarlılığı | 30+ dosya | Yüksek | 4-8 saat | 7 |
| 6 | Büyük dosya bölme | 3 dosya → 10+ yeni dosya | Orta | 4-6 saat | 6 |
| 7 | localStorage/Dexie | 10+ dosya | Yüksek | 8-16 saat | 5 |

### Öncelik Sıralaması

> **Kural:** En düşük risk + en yüksek etki = en önce yapılır.

1. **🟢 Lazy Loading** — 1 dosya, düşük risk, yüksek etki (bundle size azalması)
2. **🟢 kimi-plugin kaldırma** — 2 dosya, düşük risk, temiz build pipeline
3. **🟢 window.location fix** — 1 dosya, düşük risk, React Router uyumu
4. **🟢 Unused temizliği** — 3 dosya, düşük risk, kod temizliği
5. **🟡 localStorage/Dexie göçü** — 10+ dosya, yüksek risk ama yüksek etki (veri bütünlüğü)
6. **🟡 Büyük dosya bölme** — 3 dosya, orta risk, bakım kolaylığı
7. **🔴 Adlandırma tutarlılığı** — 30+ dosya, yüksek risk, düşük acil etki — en sona bırak
