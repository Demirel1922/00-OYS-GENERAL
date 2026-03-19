# Analiz Raporu — 4 Maddelik Dar Kapsamlı Repo İncelemesi

**Tarih:** 2026-03-19  
**Kapsam:** Numune Çorap Grubu, Sipariş Çorap Tipi görünümü, ArtikelCombobox layout, Müşteri entegrasyonu  
**Tür:** Salt analiz — kod/patch/çözüm önerisi yok

---

## 1) Numune Düzenleme → Çorap Grubu

### Mevcut durum

Çorap Grubu (`cinsiyet`) alanı edit modunda **tamamen açık ve düzenlenebilir**. `<select>` elemanında `disabled`, `readOnly` veya `isEditMode` bazlı herhangi bir koşul **yok**.

**Kanıt:**

```
Dosya: src/modules/numune/pages/YeniNumune.tsx (satır 651–655)

<label>Çorap Grubu *</label>
<select value={formData.generalInfo.cinsiyet}
        onChange={(e) => handleGeneralChange('cinsiyet', e.target.value)}
        className="...">
  <option value="">Seçiniz</option>
  {CINSIYET_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
</select>
```

- `disabled` prop yok
- `isEditMode` kontrolü yok
- Hem yeni kayıt hem düzenleme modunda aynı `<select>` render ediliyor

**Edit mode tespiti:**
- `isEditMode` state'i `location.state?.editMode` üzerinden set ediliyor (satır 256)
- `isEditMode`, numune numarası üretimini engellemek için kullanılıyor (satır 296: `if (...cinsiyet && !isEditMode)`)
- Ancak Çorap Grubu `<select>` elemanına `isEditMode` **asla uygulanmıyor**

**Submit tarafı:**
- `handleSave` (satır 471) ve `handleSaveAndApprove` (satır 512) fonksiyonlarında `generalInfo` nesnesi doğrudan kaydediliyor
- `generalInfo` içinde `cinsiyet` alanı dahil
- Edit modunda değiştirilmiş `cinsiyet` değeri de kaydedilir

### Kök neden

UI katmanında `isEditMode` kontrolünün Çorap Grubu alanına eklenmemiş olması. `isEditMode` state'i mevcut ve kullanılıyor (başlık, numune no üretimi vb. için) ancak bu belirli `<select>` elemanına **uygulanmamış**.

### Etkilenen dosyalar

| Dosya | İlgili satırlar |
|-------|-----------------|
| `src/modules/numune/pages/YeniNumune.tsx` | 651–655 (select), 189 (isEditMode state), 296 (cinsiyet useEffect) |

### Risk / yan etki

- Numune numarası üretimi zaten `!isEditMode` koruması altında (satır 296) — bu yüzden edit modunda cinsiyet değiştiğinde numune no **değişmez**
- Ancak cinsiyet değiştiğinde numune numarası ile cinsiyet tutarsız hale gelir (numune no eski cinsiyet koduna göre üretilmiş kalır)
- Artikel bağlantısı etkilenmez çünkü onay sırasında güncel `cinsiyet` değeri kullanılır (satır 552)
- UI kapatmak yeterli; submit tarafında ekstra kontrol gerekmez

### Tür: İş kuralı eksikliği

### Hüküm: Doğru

Çorap Grubu alanı edit modunda açık. Kapatılması gerekiyor.

---

## 2) Sipariş → Çorap Tipi rakam görünüyor

### Mevcut durum

Sorun **iki ayrı veri format uyumsuzluğundan** kaynaklanıyor:

**A) Çorap Grubu (gender) — RAKAM gösterimi**

Numune modülündeki `CINSIYET_OPTIONS` **sayısal** değerler kullanıyor:

```
Dosya: src/modules/numune/pages/YeniNumune.tsx (satır 63–74)

{ value: '1', label: '1 - Erkek' }
{ value: '2', label: '2 - Kadın' }
{ value: '3', label: '3 - Çocuk' }
...
{ value: '0', label: '0 - Unisex 2' }
```

Sipariş modülü ise `lookupStore` CINSIYET verilerini kullanıyor:

```
Dosya: src/store/lookupStore.ts (satır 53–58)

{ lookupType: 'CINSIYET', ad: 'Erkek', ... }
{ lookupType: 'CINSIYET', ad: 'Kadın', ... }
{ lookupType: 'CINSIYET', ad: 'Unisex', ... }
```

**Veri akışı zinciri:**
1. Numune → `cinsiyet = '1'` (sayısal kod)
2. Numune onayı → artikel oluşturma → `corapGrubu: formData.generalInfo.cinsiyet || ''` → `'1'` (satır 552)
3. Sipariş → ArtikelCombobox seçimi → `form.setValue('gender', artikel.corapGrubu)` → `'1'` (satır 527)
4. UI'da disabled Input `field.value = '1'` → **RAKAM görünüyor**

**B) Çorap Tipi (sock_type) — KOD gösterimi**

Numune modülündeki `CORAP_TIPI_OPTIONS` **kod** değerler kullanıyor:

```
Dosya: src/modules/numune/pages/YeniNumune.tsx (satır 101–110)

{ value: 'PATIK', label: 'Patik' }
{ value: 'KISA_KONC', label: 'Kısa Konç' }
{ value: 'NORMAL_KONC', label: 'Normal Konç' }
```

Sipariş modülü ise `lookupStore` TIP verilerini kullanıyor:

```
Dosya: src/store/lookupStore.ts (satır 44–51)

{ lookupType: 'TIP', ad: 'Patik Çorap', ... }
{ lookupType: 'TIP', ad: 'Kısa Çorap', ... }
```

**Veri akışı:** Numune → `corapTipi = 'PATIK'` → Artikel → Sipariş → `sock_type = 'PATIK'` → UI'da `'PATIK'` görünüyor (okunabilir ad değil)

**C) Detay/Export tarafında da sorun var:**

| Ekran | Çorap Grubu | Çorap Tipi |
|-------|-------------|------------|
| SalesOrderDetail.tsx:220 | `line.gender \|\| '-'` (raw) | `SOCK_TYPE_LABELS[line.sock_type] \|\| line.sock_type` (fallback) |
| excelExport.ts:103 | `line.gender` (raw) | `line.sock_type \|\| ''` (raw) |
| pdfExport.tsx:148–149 | `v \|\| '-'` (passthrough) | `v \|\| '-'` (passthrough) |

`SOCK_TYPE_LABELS` key'leri (`soket`, `kisa_konc`) ile gerçek veriler (`PATIK`, `KISA_KONC`) **eşleşmiyor** (case farklılığı + farklı kelimeler).

### Kök neden

**İki ayrı lookup/options sistemi** arasında değer formatı tutarsızlığı:
1. Numune modülü: hardcoded `CINSIYET_OPTIONS` (rakam) + `CORAP_TIPI_OPTIONS` (büyük harf kod)
2. Sipariş modülü: `lookupStore` dynamic değerler (okunabilir ad/label)
3. Artikel bu iki sistemi köprülüyor ama değer dönüşümü **yok**

### Etkilenen dosyalar

| Dosya | İlgili satırlar |
|-------|-----------------|
| `src/modules/numune/pages/YeniNumune.tsx` | 63–74 (CINSIYET_OPTIONS), 101–110 (CORAP_TIPI_OPTIONS), 552–553 (artikel aktarım) |
| `src/store/artikelStore.ts` | 109–183 (addArtikelFromNumune — değer dönüşümü yok) |
| `src/modules/sales-orders/pages/SalesOrderNew.tsx` | 527–528 (artikel → form mapping) |
| `src/modules/sales-orders/pages/SalesOrderDetail.tsx` | 220–221 (render) |
| `src/modules/sales-orders/utils/pdfExport.tsx` | 148–149 (passthrough) |
| `src/modules/sales-orders/utils/excelExport.ts` | 103–104 (raw value) |
| `src/modules/sales-orders/domain/types.ts` | 67–75 (SOCK_TYPE_LABELS — key mismatch) |
| `src/store/lookupStore.ts` | 44–58 (TIP ve CINSIYET seed data) |

### Sorun nerede: data + mapping + render (üç katmanlı)

1. **data:** Numune → Artikel aktarımında kaynak değer formatı (rakam/kod) ile hedef değer formatı (okunabilir ad) uyumsuz
2. **mapping:** SOCK_TYPE_LABELS key'leri verilerle eşleşmiyor (case + farklı kelimeler)
3. **render:** SalesOrderDetail, pdfExport, excelExport'ta lookup yapılmadan raw değer gösteriliyor

### Tür: Bug (veri format uyumsuzluğu)

### Hüküm: Doğru

Çorap Tipi ve Çorap Grubu için hem form hem detay hem export'ta isim yerine kod/rakam görünüyor.

---

## 3) Artikel Combobox Layout Sorunu

### Mevcut durum

`ArtikelCombobox` bileşeni var ve `Popover + Command` (shadcn/ui) deseni kullanıyor:

```
Dosya: src/modules/sales-orders/components/ArtikelCombobox.tsx

- Popover > PopoverTrigger > Button (w-full, h-9)
- PopoverContent (className="w-[--radix-popover-trigger-width] p-0", align="start")
  - Command > CommandInput + CommandList > CommandGroup > CommandItem
```

Bileşen SalesOrderNew.tsx'te şu grid yapısı içinde yer alıyor:

```
Dosya: src/modules/sales-orders/pages/SalesOrderNew.tsx (satır 514)

<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
  <!-- ArtikelCombobox burada (sol sütun) -->
</div>

<!-- Hemen altında: -->
<div className="grid grid-cols-2 md:grid-cols-5 gap-3">
  <!-- Ürün Tanımı, Çorap Grubu, Çorap Tipi, Renk, Beden -->
</div>
```

### Teknik analiz

**Popover altyapısı:**

```
Dosya: src/components/ui/popover.tsx (satır 27–38)

<PopoverPrimitive.Portal>
  <PopoverPrimitive.Content
    className={cn(
      "... z-50 w-72 ... rounded-md border p-4 shadow-md ...",
      className
    )}
  />
</PopoverPrimitive.Portal>
```

- `PopoverPrimitive.Portal` kullanılıyor → İçerik DOM ağacının dışında render ediliyor
- Default genişlik: `w-72` (288px)
- ArtikelCombobox override: `w-[--radix-popover-trigger-width]` (trigger ile aynı genişlik)
- z-index: `z-50`

**Olası sorun noktaları:**

1. **Genişlik kısıtlaması:** `--radix-popover-trigger-width` CSS değişkeni trigger butonunun genişliğini alıyor. Grid `md:grid-cols-2` layout'ta bu yaklaşık yarım sütun genişliğinde. CommandItem içindeki çok satırlı içerik (ormeciArtikelNo + urunTanimi + corapGrubu + corapTipi + musteriKodu + musteriArtikelNo) dar alanda sığmayabilir ve diğer alanlarla çakışma hissi yaratabilir.

2. **Default `w-72` ve override çakışması:** Tailwind'de `cn()` kullanıldığında `w-72` default class'ı ile `w-[--radix-popover-trigger-width]` override class'ı arasında specificity çakışması olabilir. `cn` (clsx + twMerge) normalde doğru merge eder ancak CSS custom property'li utility'ler garanti edilmiyor.

3. **Popover yönü:** Default `sideOffset = 4` ve side belirtilmemiş. Radix Popover otomatik yön seçer. Ekranın üstüne yakın konumda açılırsa yukarı doğru açılabilir ve üstteki form başlığı/alanlarla çakışabilir.

4. **Default padding:** Popover base class'ında `p-4` var, ArtikelCombobox `p-0` ile override ediyor. Bu doğru çalışıyor.

5. **Portal render:** Portal DOM dışında render ettiği için parent `overflow: hidden` sorunu **yok**. Ancak portal, sayfa scroll'u ile birlikte konumunu güncelleme konusunda edge case'ler yaratabilir.

**Bağımlılıklar:**
- `@radix-ui/react-popover`: `^1.1.15` ✅ yüklü
- `cmdk`: `^1.1.1` ✅ yüklü

### Kök neden

Kesin bir tek kök neden yerine birkaç faktörün birleşimi söz konusu:
- Popover genişliğinin trigger ile sınırlanması (dar sütunda dar dropdown)
- CommandItem'lerdeki çok satırlı bilgi yoğunluğu (4 satırlık veri: ormeciArtikelNo, urunTanimi, corapGrubu, corapTipi, musteriKodu, musteriArtikelNo)
- Grid layout'taki yarım genişlik sütun kısıtlaması
- Olası `w-72` / `w-[--radix-popover-trigger-width]` CSS class merge sorunu

### Etkilenen dosyalar

| Dosya | İlgili satırlar |
|-------|-----------------|
| `src/modules/sales-orders/components/ArtikelCombobox.tsx` | 38–107 (tüm popover/command yapısı), 54 (genişlik), 89–100 (item içerik) |
| `src/components/ui/popover.tsx` | 32–33 (default w-72 + z-50) |
| `src/modules/sales-orders/pages/SalesOrderNew.tsx` | 514 (parent grid layout) |

### Sorun nerede: popover + parent layout (birlikte)

Sorun ne sadece combobox içinde ne de sadece parent layout'ta. Popover genişlik kısıtlaması + parent grid dar sütunu + item bilgi yoğunluğu birlikte çakışmaya neden oluyor.

### Tür: Bug (CSS/layout)

### Hüküm: Doğru

Dropdown açıldığında üstteki/yandaki yazılarla karışma sorunu, popover genişlik/position ayarları ve parent layout'un birleşiminden kaynaklanıyor.

---

## 4) Yeni Numune + Üretim Hazırlık → Müşteri Entegrasyonu

### Bilgi Tanımları müşteri kaynağı

```
Dosya: src/store/musteriStore.ts

- Zustand + persist store
- Store adı: 'oys-musteri-store-v2'
- Musteri interface: ormeciMusteriNo, musteriKisaKod, musteriUnvan, bolge, ulke, adres, vergiNo, odemeVadesiDeger, odemeVadesiBirim, odemeTipi, durum, ...
- Seed: 2 müşteri (ECC GmbH / ormeciMusteriNo: '39', ABC Tekstil / ormeciMusteriNo: '42')
- Bilgi Girişleri > Müşteriler ekranı bu store'u kullanıyor
```

### Yeni Numune mevcut kaynak

```
Dosya: src/modules/numune/pages/YeniNumune.tsx (satır 15, 677–679)

import { MUSTERI_KODLARI, ... } from '../../uretim-hazirlik/constants/lookups';

<select value={formData.generalInfo.musteriKodu} onChange={...}>
  <option value="">Seçiniz</option>
  {MUSTERI_KODLARI.map(o => <option key={o} value={o}>{o}</option>)}
</select>
```

`MUSTERI_KODLARI` kaynağı:

```
Dosya: src/modules/uretim-hazirlik/constants/lookups.ts (satır 6)

export const MUSTERI_KODLARI = ['09','13','39','86','89','124','126','127','129','131','132','133','137','139','142','143'];
```

Bu **hardcoded statik bir dizi**. `musteriStore` ile hiçbir bağlantısı yok.

### Yeni Numune'de tedarikçi referans deseni (doğru entegrasyon örneği)

```
Dosya: src/modules/numune/pages/YeniNumune.tsx (satır 20–21, 208–209, 226–233, 895–902)

// Store import
import { useTedarikciStore } from '@/store/tedarikciStore';
import { useTedarikciKategoriStore } from '@/store/tedarikciKategoriStore';

// Store kullanımı
const { tedarikciler, seedData: seedTedarikci } = useTedarikciStore();
const { kategoriler: tedarikciKategorileri, seedData: seedTedarikciKategori } = useTedarikciKategoriStore();

// Filtreleme
const iplikTedarikcileri = useMemo(() => {
  const iplikKategoriIds = tedarikciKategorileri
    .filter(k => k.kategoriAdi?.toLocaleLowerCase('tr').includes('iplik'))
    .map(k => k.id);
  return tedarikciler.filter(
    t => t.durum === 'AKTIF' && (t.kategoriIds || []).some(kid => iplikKategoriIds.includes(kid))
  );
}, [tedarikciler, tedarikciKategorileri]);

// Select'te kullanım
{iplikTedarikcileri.map(t =>
  <option key={t.id} value={t.tedarikciAdi}>{t.tedarikciKodu} - {t.tedarikciAdi}</option>
)}
```

Bu desen: Zustand store'dan çekme → aktif filtreleme → `useMemo` ile cache → UI'da gösterme. **Müşteri için de aynı desen uygulanmalı.**

### Üretim Hazırlık mevcut kaynak

```
Dosya: src/modules/uretim-hazirlik/pages/UretimHazirlikDetayPage.tsx (satır 17, 508)

import { MUSTERI_KODLARI, ... } from '../constants/lookups';

<LookupSelect value={k.musteriKodu} onChange={v => updateField('musteriKodu', v)}
              options={MUSTERI_KODLARI} disabled={locked} />
```

Yeni Numune ile **aynı hardcoded kaynak** (`MUSTERI_KODLARI`). `musteriStore` kullanılmıyor.

### Fark nerede

| Ekran | Müşteri kaynağı | Store kullanımı |
|-------|-----------------|-----------------|
| Bilgi Girişleri > Müşteriler | `musteriStore` (Zustand+persist) | ✅ Dinamik |
| Sipariş (SalesOrderNew) | `useMusteriStore()` → `aktifMusteriler` | ✅ Dinamik |
| Yeni Numune | `MUSTERI_KODLARI` (hardcoded array) | ❌ Statik |
| Üretim Hazırlık | `MUSTERI_KODLARI` (hardcoded array) | ❌ Statik |

**Sipariş doğru entegre** — Yeni Numune ve Üretim Hazırlık **doğru entegre değil**.

### Etkilenen dosyalar

| Dosya | Değişiklik tipi |
|-------|----------------|
| `src/modules/numune/pages/YeniNumune.tsx` | MUSTERI_KODLARI → musteriStore entegrasyonu |
| `src/modules/uretim-hazirlik/pages/UretimHazirlikDetayPage.tsx` | MUSTERI_KODLARI → musteriStore entegrasyonu |
| `src/modules/uretim-hazirlik/constants/lookups.ts` | MUSTERI_KODLARI kullanımı azalacak (ama diğer sabitler kalıyor) |

### Sorun nerede: data source (birincil) + UI binding (ikincil)

- **Data source:** Yeni Numune ve Üretim Hazırlık, `musteriStore` yerine hardcoded `MUSTERI_KODLARI` kullanıyor
- **UI binding:** Hardcoded seçenekler sadece müşteri kodu gösteriyor; musteriStore'dan çekildiğinde unvan/isim de gösterilebilir
- **Referans desen mevcut:** Aynı dosyada (YeniNumune.tsx) tedarikçi alanı zaten store entegrasyonu kullanıyor — bu desen müşteri için de uygulanabilir
- **Mevcut kayıtlar:** Numune ve Üretim Hazırlık kayıtları localStorage'da `musteriKodu` olarak hardcoded kodları (`'39'`, `'86'` vb.) saklamakta. `musteriStore`'daki `ormeciMusteriNo` alanı aynı formatı kullandığı için (`'39'`, `'42'` vb.) mevcut verilerle geriye dönük uyumluluk muhafaza edilebilir; ancak seed'de olmayan kodlar (`'09'`, `'13'`, `'86'` vb.) için musteriStore'a yeni kayıt eklenmeli veya mevcut numune/üretim kayıtları migration gerektirebilir

### Tür: Entegrasyon eksikliği

### Hüküm: Doğru

Yeni Numune ve Üretim Hazırlık'ta müşteri verisi Bilgi Tanımları'ndan gelmiyor; hardcoded statik dizi kullanılıyor.

---

## Genel Sonuç

### Madde sınıflandırması

| # | Konu | Tür | Öncelik |
|---|------|-----|---------|
| 1 | Numune düzenleme → Çorap Grubu | İş kuralı eksikliği | Düşük risk, kolay fix |
| 2 | Sipariş → Çorap Tipi/Grubu rakam | Bug (veri format uyumsuzluğu) | Yüksek risk, çoklu dosya |
| 3 | ArtikelCombobox layout | Bug (CSS/layout) | Orta risk, izole |
| 4 | Müşteri entegrasyonu | Entegrasyon eksikliği | Orta risk, 2 dosya |

### Kodlamaya geçmeden önce netleştirilmesi gereken kararlar

**Madde 1:**
- Çorap Grubu edit modunda tamamen mi kapatılacak, yoksa uyarı ile mi bırakılacak?
- Cinsiyet değişirse numune numarası ile tutarsızlık kabul edilebilir mi?

**Madde 2:**
- Numune modülünün `CINSIYET_OPTIONS` (sayısal '1','2',...) formatı korunacak mı, lookupStore formatına ('Erkek','Kadın',...) mı geçilecek?
- `CORAP_TIPI_OPTIONS` ('PATIK','KISA_KONC',...) formatı korunacak mı, lookupStore'a ('Patik Çorap','Kısa Çorap',...) mı geçilecek?
- Yoksa sipariş tarafında değer → label dönüşümü mü yapılacak?
- Mevcut kayıtlı siparişlerdeki eski veriler nasıl ele alınacak (migration)?

**Madde 3:**
- Minimum genişlik ayarı mı yapılacak, yoksa tam yapısal düzenleme mi?
- Popover yönlendirme (side/align) değiştirilecek mi?

**Madde 4:**
- Yeni Numune'de müşteri seçimi sadece müşteri kodu mu gösterecek, yoksa unvan ile birlikte mi?
- Üretim Hazırlık'ta müşteri seçimi düzenlenebilir mi kalacak, yoksa numuneden gelen veri readonly mı olacak?
- MUSTERI_KODLARI sabiti tamamen kaldırılacak mı? (Dikkat: başka kullanımları olabilir)

### Tahmini dosya kapsamı

**Doğrudan etkilenen dosyalar (8 dosya):**

| Dosya | Maddeler |
|-------|----------|
| `src/modules/numune/pages/YeniNumune.tsx` | 1, 2, 4 |
| `src/modules/sales-orders/pages/SalesOrderNew.tsx` | 2 |
| `src/modules/sales-orders/pages/SalesOrderDetail.tsx` | 2 |
| `src/modules/sales-orders/utils/pdfExport.tsx` | 2 |
| `src/modules/sales-orders/utils/excelExport.ts` | 2 |
| `src/modules/sales-orders/components/ArtikelCombobox.tsx` | 3 |
| `src/components/ui/popover.tsx` | 3 |
| `src/modules/uretim-hazirlik/pages/UretimHazirlikDetayPage.tsx` | 4 |

**Dolaylı etkilenen dosyalar:**

| Dosya | Neden |
|-------|-------|
| `src/store/artikelStore.ts` | Madde 2 — değer format dönüşümü gerekebilir |
| `src/modules/sales-orders/domain/types.ts` | Madde 2 — SOCK_TYPE_LABELS güncellenmeli |
| `src/modules/uretim-hazirlik/constants/lookups.ts` | Madde 4 — MUSTERI_KODLARI kullanımı azalacak |
| `src/store/lookupStore.ts` | Madde 2 — referans veri kaynağı |
| `src/store/musteriStore.ts` | Madde 4 — referans veri kaynağı |
