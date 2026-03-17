# Yeni Numune Ekranı – Master Data Entegrasyonu Düzeltme Analiz Raporu

**Tarih:** 2026-03-17 (güncelleme)  
**Kapsam:** `src/modules/numune/pages/YeniNumune.tsx` → Ölçüler bölümü + İplik Bilgileri bölümü  
**Durum:** Sadece analiz – henüz uygulama yapılmadı  
**Tür:** Önceki analizin kapsam düzeltmesi

---

## 1) Gerçekten Değişmesi Gereken Dosya

| # | Dosya | Değişiklik | Detay |
|---|-------|-----------|-------|
| 1 | `src/modules/numune/pages/YeniNumune.tsx` | Beden alanının veri kaynağı değişecek | Hardcoded `BOYLAR` sabiti → `lookupStore` (Boy master data) |

**Başka dosya değişmeyecek.** Store'lar, type'lar, route'lar, style'lar ve diğer modüller kapsam dışıdır.

---

## 2) Beden Alanı – Doğru Veri Eşleme Kararı (KRİTİK DÜZELTME)

### Önceki analizdeki yanlış
Önceki analiz bu alanı "BEDEN master data" olarak adlandırmış ve `lookupStore.getSortedItemsByType('BEDEN')` teknik eşlemesini doğru vermiş ancak iş kuralı netleştirilmemişti.

### Doğru iş kuralı

| Özellik | Değer |
|---------|-------|
| **Ekrandaki sütun başlığı** | `"Boy *"` (satır 709) |
| **Form data property** | `row.bedenler` (satır 734) |
| **"Yeni satır ekle" butonu** | `"Yeni Boy Ekle"` (satır 701) |
| **İş kuralı** | Beden = Boy (operasyonel olarak eşdeğer kabul edilecek) |
| **Alan adı değişikliği** | Yok — mevcut sütun başlığı "Boy *" zaten doğru |

### Mevcut durum → Hedef durum

| | Mevcut | Hedef |
|-|--------|-------|
| **Veri kaynağı** | `BOYLAR` sabiti (`uretim-hazirlik/constants/lookups.ts`) — 25 hardcoded değer | `lookupStore` üzerinden yönetilen Boy/Beden master data |
| **Veri tipi** | String dizisi: `['15-18','19-22',...,'S','M','L','XL']` | `LookupItem[]` — Bilgi Girişleri > Genel Çorap Bilgileri'nden yönetilen |
| **Filtreleme** | Yok (tüm sabit liste) | Sadece `durum === 'AKTIF'` olanlar |
| **Sıralama** | Dizi sırası | `sira` alanına göre otomatik |
| **Gösterim** | `b` (string) | `item.ad` |

### Teknik eşleme

Bilgi Girişleri > Genel Çorap Bilgileri sayfası bu veriyi `lookupType: 'BEDEN'` olarak yönetiyor (tab etiketi: "Beden", açıklama: "Çorap beden ölçüleri (35-38, 39-42 vb.)"). Kodda bu veriye erişim:

```typescript
lookupStore.getSortedItemsByType('BEDEN')
```

Bu fonksiyon otomatik olarak:
- Sadece `durum === 'AKTIF'` kayıtları döndürür
- `sira` alanına göre sıralar

**ÖNEMLİ:** Operasyonel olarak Beden = Boy. Koddaki lookup type `'BEDEN'` olmakla birlikte, Yeni Numune ekranında bu alan "Boy" master datasını temsil eder. Uygulama sırasında SalesOrderNew.tsx'teki mevcut pattern referans alınacak (satır 67-79).

---

## 3) Ölçüler > Renk Alanı – Mevcut Durum

| Özellik | Değer |
|---------|-------|
| **Store** | `useRenkStore` (satır 197) |
| **Seed** | `seedRenk()` (satır 198) |
| **Filtreleme** | `renkler.filter(r => r.durum === 'AKTIF')` → `aktifRenkler` (satır 199) |
| **Render** | Satır 740-743: `aktifRenkler.map(r => <option ...>{r.renkAdi}</option>)` |
| **Kaynak** | Bilgi Girişi > İplik Tanımları > Renkler |

**✅ Değişiklik gerekmiyor.** Mevcut renk store entegrasyonu doğru çalışıyor. Sadece AKTIF renkler gösteriliyor.

---

## 4) İplik Bilgileri – Cins / Denye / Renk / Tedarikçi Mevcut Store Eşleşmeleri

### 4a) Cins

| Özellik | Değer |
|---------|-------|
| **Store** | `useIplikDetayStore` → `detaylar` (satır 202) |
| **Seed** | `seedIplikDetay()` (satır 208) |
| **Filtreleme** | `iplikDetaylar.filter(d => d.durum === 'AKTIF')` → `aktifIplikDetaylar` (satır 214) |
| **Render** | Satır 809-813: `aktifIplikDetaylar.map(d => <option ...>{d.detayAdi}</option>)` |
| **Kaynak** | İplik Tanımları > İplik Detayları > Detay |
| **Fallback** | Mevcut değer listede yoksa ek option gösterilir (satır 812) |

**✅ Doğru bağlanmış. Değişiklik gerekmiyor.**

### 4b) Denye

| Özellik | Değer |
|---------|-------|
| **Store** | `useKalinlikStore` → `kalinliklar` (satır 203) |
| **Seed** | `seedKalinlik()` (satır 209) |
| **Filtreleme** | `kalinliklar.filter(k => k.durum === 'AKTIF')` + `getBirlesikGosterim(k)` → `aktifKalinliklar` (satır 215-218) |
| **Render** | Satır 802-806: `aktifKalinliklar.map(k => <option ...>{k.gosterim}</option>)` |
| **Kaynak** | Kalınlıklar (tüm birimler: Ne, Nm, Dtex, Denye) |
| **Fallback** | Mevcut değer listede yoksa ek option gösterilir (satır 805) |

**✅ Doğru bağlanmış. Değişiklik gerekmiyor.**

### 4c) Renk (İplik Bilgileri)

| Özellik | Değer |
|---------|-------|
| **Store** | `useRenkStore` → `renkler` (satır 197 — Ölçüler ile aynı store) |
| **Filtreleme** | Aynı `aktifRenkler` memoized değişkeni kullanılıyor (satır 199) |
| **Render** | Satır 817-821: `aktifRenkler.map(r => <option ...>{r.renkAdi}</option>)` |
| **Kaynak** | Bilgi Girişi > İplik Tanımları > Renkler |
| **Fallback** | Mevcut değer listede yoksa ek option gösterilir (satır 820) |

**✅ Doğru bağlanmış. Değişiklik gerekmiyor.**

### 4d) Tedarikçi

| Özellik | Değer |
|---------|-------|
| **Store** | `useTedarikciStore` + `useTedarikciKategoriStore` (satır 204-205) |
| **Seed** | `seedTedarikci()` + `seedTedarikciKategori()` (satır 210-211) |
| **Filtreleme** | Satır 219-226: kategori adında "iplik" geçen + `durum === 'AKTIF'` |
| **Render** | Satır 824-828: `iplikTedarikcileri.map(t => <option ...>{t.tedarikciKodu} - {t.tedarikciAdi}</option>)` |
| **Fallback** | Mevcut değer listede yoksa ek option gösterilir (satır 827) |

**✅ Doğru bağlanmış. Değişiklik gerekmiyor.**

### Ek: Renk Kodu

| Özellik | Değer |
|---------|-------|
| **Tür** | Manuel metin girişi (`<input type="text">`) |
| **Render** | Satır 815 |

**✅ Manuel giriş olarak kalacak.**

---

## 5) Hangileri Doğru, Hangileri Değişiklik Gerektiriyor

| # | Alan | Bölüm | Mevcut Store | Doğru mu? | Değişiklik |
|---|------|-------|-------------|-----------|-----------|
| 1 | **Beden (Boy)** | Ölçüler | ❌ Hardcoded `BOYLAR` | **HAYIR** | `lookupStore` entegrasyonu gerekli |
| 2 | Renk | Ölçüler | ✅ `renkStore` → `aktifRenkler` | EVET | Yok |
| 3 | Cins | İplik Bilgileri | ✅ `iplikDetayStore` → `aktifIplikDetaylar` | EVET | Yok |
| 4 | Denye | İplik Bilgileri | ✅ `kalinlikStore` → `aktifKalinliklar` | EVET | Yok |
| 5 | Renk | İplik Bilgileri | ✅ `renkStore` → `aktifRenkler` | EVET | Yok |
| 6 | Tedarikçi | İplik Bilgileri | ✅ `tedarikciStore` + kategori filtresi | EVET | Yok |
| 7 | Renk Kodu | İplik Bilgileri | ✅ Manuel giriş | EVET | Yok |

**Sonuç: 7 alandan 6'sı doğru. Sadece Beden (Boy) alanı değişiklik gerektiriyor.**

---

## 6) Tedarikçi Filtresinin Veri Alanı

### Filtre kodu (YeniNumune.tsx satır 219-226)

```typescript
const iplikTedarikcileri = useMemo(() => {
  const iplikKategoriIds = tedarikciKategorileri
    .filter(k => k.kategoriAdi?.toLocaleLowerCase('tr').includes('iplik'))
    .map(k => k.id);
  return tedarikciler.filter(
    t => t.durum === 'AKTIF' && (t.kategoriIds || []).some(kid => iplikKategoriIds.includes(kid))
  );
}, [tedarikciler, tedarikciKategorileri]);
```

### Filtreleme alanları

| Adım | Veri alanı | Store |
|------|-----------|-------|
| 1 | `TedarikciKategorisi.kategoriAdi` | `tedarikciKategoriStore` |
| 2 | `Tedarikci.kategoriIds` (string[]) | `tedarikciStore` |
| 3 | `Tedarikci.durum === 'AKTIF'` | `tedarikciStore` |

### Filtre doğrulama (tüm senaryolar)

| Kategori Adı | `toLocaleLowerCase('tr')` | `.includes('iplik')` | Dahil mi? | Beklenen |
|-------------|---------------------------|---------------------|-----------|----------|
| İplik | iplik | ✅ true | DAHİL | ✅ |
| İplik-Koli | iplik-koli | ✅ true | DAHİL | ✅ |
| İplik Etiket | iplik etiket | ✅ true | DAHİL | ✅ |
| Ana İplik | ana iplik | ✅ true | DAHİL | ✅ |
| Koli | koli | ❌ false | DAHİL DEĞİL | ✅ |
| Etiket | etiket | ❌ false | DAHİL DEĞİL | ✅ |

**✅ Mevcut filtre mantığı tüm senaryoları doğru karşılıyor.**

---

## 7) Gerçek Riskler / Belirsizlikler

| # | Risk | Seviye | Açıklama |
|---|------|--------|----------|
| 1 | **Beden seed veri eksikliği** | ⚠️ Orta | Mevcut `BOYLAR` sabiti **25 değer** içerir (15-18, 19-22, ..., S, M, L, XL). lookupStore BEDEN seed verisi sadece **8 değer** içerir (35-38, 39-42, 43-46, 47-50, 0-6 Ay, 6-12 Ay, 12-18 Ay, 18-24 Ay). Geçiş öncesinde seed verisi mevcut BOYLAR değerlerini karşılayacak şekilde genişletilmeli, yoksa dropdown'da eksik değerler olur. |
| 2 | **BOYLAR import temizliği** | Düşük | `BOYLAR` sabiti `MUSTERI_KODLARI, IGNE_SAYILARI, CAP_DEGERLERI` ile aynı import satırından geliyor. Ayrıca `UretimHazirlikDetayPage.tsx`'te de kullanılıyor. YeniNumune.tsx'teki import'tan `BOYLAR` kaldırılacak ama sabit dosyasına ve diğer kullanım yerlerine dokunulmayacak. |
| 3 | **Orphan değerler** | Düşük | Daha önce kaydedilmiş numunelerde BOYLAR listesinde olup lookupStore'da olmayan boy değerleri kalabilir. Beden alanına da mevcut fallback pattern (değer listede yoksa ek option göster) uygulanarak yönetilebilir. |

---

## Özet

Sadece **1 dosyada**, **1 alan** için değişiklik gerekiyor:

- **Dosya:** `src/modules/numune/pages/YeniNumune.tsx`
- **Alan:** Beden (Boy) — `BOYLAR` hardcoded sabiti → `lookupStore` (Boy/Beden master data)
- **Diğer 6 alan:** Zaten doğru bağlanmış, değişiklik yok
- **Tedarikçi filtresi:** Tüm senaryoları doğru karşılıyor
- **Korunacaklar:** Cins adı, Renk Kodu manuel giriş, satır yapısı, ekran layout'u — hepsi korunacak
