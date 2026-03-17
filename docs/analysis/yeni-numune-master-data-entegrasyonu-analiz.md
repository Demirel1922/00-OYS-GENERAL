# Yeni Numune Ekranı – Master Data Entegrasyonu Analiz Raporu

**Tarih:** 2026-03-17  
**Kapsam:** `YeniNumune.tsx` → Ölçüler bölümü + İplik Bilgileri bölümü  
**Durum:** Sadece analiz – henüz uygulama yapılmadı

---

## 1) Değişmesi Gerekecek Dosyalar

| # | Dosya | Değişiklik Türü | Açıklama |
|---|-------|-----------------|----------|
| 1 | `src/modules/numune/pages/YeniNumune.tsx` | **Tek değişiklik noktası** | Ölçüler bölümünde Beden (Boy) alanının `BOYLAR` sabit dizisinden `lookupStore.getSortedItemsByType('BEDEN')` kaynağına geçirilmesi |

### Değişmeyecek Dosyalar (Zaten Doğru Entegre)

| Dosya | Durum | Açıklama |
|-------|-------|----------|
| `src/store/renkStore.ts` | ✅ Değişiklik gerekmez | `getAktifRenkler()` mevcut; Ölçüler ve İplik Bilgileri'nde zaten kullanılıyor |
| `src/store/iplikDetayStore.ts` | ✅ Değişiklik gerekmez | `getAktifDetaylar()` mevcut; Cins alanında zaten kullanılıyor |
| `src/store/kalinlikStore.ts` | ✅ Değişiklik gerekmez | `getAktifKalinliklar()` mevcut; Denye alanında zaten kullanılıyor |
| `src/store/tedarikciStore.ts` | ✅ Değişiklik gerekmez | Tedarikçi verileri zaten çekiliyor |
| `src/store/tedarikciKategoriStore.ts` | ✅ Değişiklik gerekmez | Kategori filtreleme zaten çalışıyor |
| `src/store/lookupStore.ts` | ✅ Değişiklik gerekmez | `getSortedItemsByType('BEDEN')` mevcut ve hazır |

---

## 2) Kullanılacak Store / Veri Kaynakları

| Alan | Store | Metot / Erişim | Dosya |
|------|-------|----------------|-------|
| **Beden** | `useLookupStore` | `getSortedItemsByType('BEDEN')` → aktif + sıralı beden listesi | `src/store/lookupStore.ts` |
| **Renk** (Ölçüler + İplik) | `useRenkStore` | `renkler.filter(r => r.durum === 'AKTIF')` | `src/store/renkStore.ts` |
| **Cins** | `useIplikDetayStore` | `detaylar.filter(d => d.durum === 'AKTIF')` → İplik Detayları | `src/store/iplikDetayStore.ts` |
| **Denye** | `useKalinlikStore` | `kalinliklar.filter(k => k.durum === 'AKTIF')` + `getBirlesikGosterim()` | `src/store/kalinlikStore.ts` |
| **Tedarikçi** | `useTedarikciStore` + `useTedarikciKategoriStore` | Kategori filtrelemeli aktif tedarikçiler | `src/store/tedarikciStore.ts` + `src/store/tedarikciKategoriStore.ts` |
| **Renk Kodu** | Yok (manuel giriş) | `<input type="text">` olarak kalacak | – |

---

## 3) Ölçüler Bölümü – Beden ve Renk Veri Eşleme Planı

### 3a) Beden (Boy) Alanı

| Özellik | Mevcut Durum | Hedef Durum |
|---------|-------------|-------------|
| **Veri kaynağı** | Sabit dizi: `BOYLAR` (`uretim-hazirlik/constants/lookups.ts`) | `lookupStore.getSortedItemsByType('BEDEN')` |
| **İçerik** | 25 hardcoded değer (ör. '35-38', '39-42', 'S', 'M', 'L', 'XL') | Dinamik, Bilgi Girişleri ekranından yönetilen beden listesi |
| **Filtreleme** | Yok (tüm sabit liste gösterilir) | Sadece `durum === 'AKTIF'` olanlar (store metodu bunu otomatik yapar) |
| **Sıralama** | Dizi sırası | `sira` alanına göre otomatik sıralama (store metodu yapar) |
| **Gösterim değeri** | Doğrudan string (ör. '39-42') | `item.ad` alanı (ör. '39-42', '0-6 Ay') |
| **Kayıt değeri** | Aynı string | `item.ad` alanı (mevcut `value` yapısıyla uyumlu) |

**Gerekli değişiklik (YeniNumune.tsx):**
1. `useLookupStore` import et
2. `useEffect` içinde `seedLookup()` çağrısı ekle
3. `bedenler = useMemo(() => getSortedItemsByType('BEDEN'), [lookupItems])` tanımla
4. Satır 736'daki `{BOYLAR.map(b => ...)}` ifadesini `{bedenler.map(b => ...)}` ile değiştir
5. `BOYLAR` import'unu kaldır (eğer başka yerde kullanılmıyorsa)

**Referans pattern (SalesOrderNew.tsx satır 64-81):**
```typescript
const { items: lookupItems, seedData: seedLookup, getSortedItemsByType } = useLookupStore();
useEffect(() => { if (lookupItems.length === 0) seedLookup(); }, []);
const bedenler = useMemo(() => getSortedItemsByType('BEDEN'), [lookupItems]);
```

### 3b) Renk Alanı (Ölçüler Bölümü)

| Özellik | Mevcut Durum | Hedef Durum |
|---------|-------------|-------------|
| **Veri kaynağı** | `useRenkStore` → `renkler` | Değişiklik yok ✅ |
| **Filtreleme** | `renkler.filter(r => r.durum === 'AKTIF')` | Değişiklik yok ✅ |
| **Gösterim/Kayıt** | `r.renkAdi` | Değişiklik yok ✅ |

**Durum:** ✅ Zaten doğru entegre (YeniNumune.tsx satır 197-199, render satır 740-743)

---

## 4) İplik Bilgileri Bölümü – Cins / Denye / Renk / Tedarikçi Veri Eşleme Planı

### 4a) Cins Alanı

| Özellik | Mevcut Durum | Hedef Durum |
|---------|-------------|-------------|
| **Veri kaynağı** | `useIplikDetayStore` → `detaylar` | Değişiklik yok ✅ |
| **Master data yolu** | İplik Tanımları → İplik Detayları → Detay | Doğru ✅ |
| **Filtreleme** | `detaylar.filter(d => d.durum === 'AKTIF')` | Değişiklik yok ✅ |
| **Gösterim/Kayıt** | `d.detayAdi` | Değişiklik yok ✅ |
| **Alan adı** | "Cins" olarak kalacak | Değişiklik yok ✅ |
| **Fallback** | Mevcut değer listede yoksa ek option gösterilir | Zaten mevcut ✅ |

**Durum:** ✅ Zaten doğru entegre (YeniNumune.tsx satır 202, 214, render satır 809-813)

### 4b) Denye Alanı

| Özellik | Mevcut Durum | Hedef Durum |
|---------|-------------|-------------|
| **Veri kaynağı** | `useKalinlikStore` → `kalinliklar` | Değişiklik yok ✅ |
| **Master data yolu** | Kalınlıklar (tüm birimler: Ne, Nm, Dtex, Denye) | Doğru ✅ |
| **Filtreleme** | `kalinliklar.filter(k => k.durum === 'AKTIF')` | Değişiklik yok ✅ |
| **Gösterim** | `getBirlesikGosterim(k)` → "Birim Değer Özellik" formatı | Değişiklik yok ✅ |
| **Kayıt** | `gosterim` string değeri | Değişiklik yok ✅ |
| **Fallback** | Mevcut değer listede yoksa ek option gösterilir | Zaten mevcut ✅ |

**Durum:** ✅ Zaten doğru entegre (YeniNumune.tsx satır 203, 215-218, render satır 802-806)

### 4c) Renk Alanı (İplik Bilgileri)

| Özellik | Mevcut Durum | Hedef Durum |
|---------|-------------|-------------|
| **Veri kaynağı** | `useRenkStore` → `renkler` | Değişiklik yok ✅ |
| **Master data yolu** | Bilgi Girişi → İplik Tanımları → Renkler | Doğru ✅ |
| **Filtreleme** | `renkler.filter(r => r.durum === 'AKTIF')` | Değişiklik yok ✅ |
| **Gösterim/Kayıt** | `r.renkAdi` | Değişiklik yok ✅ |
| **Fallback** | Mevcut değer listede yoksa ek option gösterilir | Zaten mevcut ✅ |

**Durum:** ✅ Zaten doğru entegre (YeniNumune.tsx satır 197-199, render satır 817-821)

### 4d) Tedarikçi Alanı

| Özellik | Mevcut Durum | Hedef Durum |
|---------|-------------|-------------|
| **Veri kaynağı** | `useTedarikciStore` + `useTedarikciKategoriStore` | Değişiklik yok ✅ |
| **Filtreleme** | Kategori adında "iplik" geçenler + `durum === 'AKTIF'` | Değişiklik yok ✅ |
| **Gösterim** | `t.tedarikciKodu - t.tedarikciAdi` | Değişiklik yok ✅ |
| **Kayıt** | `t.tedarikciAdi` | Değişiklik yok ✅ |
| **Fallback** | Mevcut değer listede yoksa ek option gösterilir | Zaten mevcut ✅ |

**Durum:** ✅ Zaten doğru entegre (YeniNumune.tsx satır 204-205, 219-226, render satır 824-828)

### 4e) Renk Kodu Alanı

| Özellik | Mevcut Durum | Hedef Durum |
|---------|-------------|-------------|
| **Girdi türü** | Manuel metin girişi (`<input type="text">`) | Değişiklik yok ✅ |

**Durum:** ✅ Manuel giriş olarak kalacak (YeniNumune.tsx satır 815)

---

## 5) Tedarikçi Filtresinin Veri Alanı Analizi

### Mevcut Filtre Mantığı (YeniNumune.tsx satır 219-226)

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

### Filtre Doğrulama Tablosu

| Kategori Adı | `toLocaleLowerCase('tr')` | `.includes('iplik')` | Sonuç | Gereksinim |
|-------------|---------------------------|---------------------|-------|------------|
| **İplik** | `iplik` | ✅ `true` | **DAHİL** | ✅ Doğru |
| **İplik-Koli** *(henüz yok)* | `iplik-koli` | ✅ `true` | **DAHİL** | ✅ Doğru |
| **Koli** | `koli` | ❌ `false` | **DAHİL DEĞİL** | ✅ Doğru |
| **Etiket** | `etiket` | ❌ `false` | **DAHİL DEĞİL** | ✅ Doğru |
| Lastik | `lastik` | ❌ `false` | Dahil değil | – |
| Kimya | `kimya` | ❌ `false` | Dahil değil | – |
| Aksesuar | `aksesuar` | ❌ `false` | Dahil değil | – |
| Dış Hizmet | `dış hizmet` | ❌ `false` | Dahil değil | – |
| Ambalaj | `ambalaj` | ❌ `false` | Dahil değil | – |

### Filtreleme Alanları

| Adım | Veri Alanı | Tablo/Store | Açıklama |
|------|-----------|-------------|----------|
| 1 | `TedarikciKategorisi.kategoriAdi` | `tedarikciKategoriStore` | "iplik" kelimesini içeren kategori ID'lerini bul |
| 2 | `Tedarikci.kategoriIds` (string[]) | `tedarikciStore` | Tedarikçinin kategori ID'leri dizisinde eşleşme ara |
| 3 | `Tedarikci.durum` | `tedarikciStore` | Sadece `'AKTIF'` olanları al |

**Sonuç:** Mevcut filtre mantığı istenilen gereksinimleri tam olarak karşılıyor. ✅

---

## 6) Riskler ve Belirsizlikler

### ⚠️ Düşük Risk

| # | Risk | Etki | Öneri |
|---|------|------|-------|
| 1 | **Beden veri uyumsuzluğu** | Düşük | Mevcut `BOYLAR` sabiti 25 değer içerir (ör. '15-18', '19-22', ..., 'S', 'M', 'L', 'XL'); `lookupStore` seed verisi sadece 8 beden içerir (ör. '35-38', '39-42', ..., '18-24 Ay'). Geçiş sonrası mevcut BOYLAR'daki bazı değerler dropdown'da görünmeyebilir. **Çözüm:** `lookupStore` seed verisi genişletilmeli veya kullanıcı Bilgi Girişleri ekranından eksik bedenleri eklemeli. |
| 2 | **Mevcut kayıtlı numunelerde orphan değer** | Düşük | Daha önce kaydedilmiş numunelerde `BOYLAR` listesinde olup `lookupStore`'da olmayan beden değerleri kalabilir. **Çözüm:** Mevcut fallback pattern (listede yoksa ek option göster) bu durumu zaten yönetir. Aynı pattern beden için de uygulanabilir. |
| 3 | **`BOYLAR` import'u başka yerde kullanılıyor olabilir** | Düşük | `BOYLAR` sabiti `uretim-hazirlik` modülünden import edilir. Import satırından kaldırmadan önce başka kullanım yerleri kontrol edilmeli. `MUSTERI_KODLARI`, `IGNE_SAYILARI`, `CAP_DEGERLERI` hâlâ aynı import satırından kullanılmaktadır. |

### ✅ Risk Olmayan Alanlar

| Alan | Açıklama |
|------|----------|
| Renk (Ölçüler + İplik) | Zaten store'dan geliyor, sadece AKTIF olanlar gösteriliyor |
| Cins | Zaten iplikDetayStore'dan geliyor |
| Denye | Zaten kalinlikStore'dan geliyor |
| Tedarikçi | Zaten filtrelenmiş şekilde store'dan geliyor |
| Renk Kodu | Manuel giriş, değişiklik yok |
| Ekran yapısı | Tablo yapısı, satır düzeni, kullanım yeri düzeni korunuyor |
| Mevcut entegrasyonlar | Sipariş modülü ve diğer modüller etkilenmeyecek |

---

## 7) En Güvenli Patch Sırası

Tek bir dosyada (`YeniNumune.tsx`) tek bir değişiklik gerektiğinden, patch sırası basittir:

### Patch 1 – lookupStore import ve erişim ekleme
```diff
+ import { useLookupStore } from '@/store/lookupStore';
```

### Patch 2 – Store erişimi ve seed çağrısı
```diff
+ const { items: lookupItems, seedData: seedLookup, getSortedItemsByType } = useLookupStore();

  // Mevcut useEffect bloğuna ekleme:
+ if (lookupItems.length === 0) seedLookup();
```

### Patch 3 – Beden memoization tanımlama
```diff
+ const bedenler = useMemo(() => getSortedItemsByType('BEDEN'), [lookupItems]);
```

### Patch 4 – BOYLAR → bedenler geçişi (render kısmı)
```diff
- {BOYLAR.map(b => <option key={b} value={b}>{b}</option>)}
+ {bedenler.map(b => <option key={b.id} value={b.ad}>{b.ad}</option>)}
```

### Patch 5 – BOYLAR import temizliği
```diff
- import { MUSTERI_KODLARI, IGNE_SAYILARI, CAP_DEGERLERI, BOYLAR } from '...lookups';
+ import { MUSTERI_KODLARI, IGNE_SAYILARI, CAP_DEGERLERI } from '...lookups';
```

### Patch 6 – Test ve doğrulama
- Ölçüler sekmesinde Beden dropdown'ının doğru dolduğunu kontrol et
- İplik Bilgileri sekmesinin mevcut çalışmasının bozulmadığını kontrol et
- Mevcut numune kayıt/düzenleme işlevinin korunmuş olduğunu kontrol et
- Build hatası olmadığını doğrula

---

## Özet Tablo

| Bölüm | Alan | Mevcut Durum | Gerekli İş |
|-------|------|-------------|------------|
| Ölçüler | **Beden** | ❌ Hardcoded `BOYLAR` | `lookupStore` entegrasyonu gerekli |
| Ölçüler | Renk | ✅ `renkStore` (aktif) | Değişiklik yok |
| İplik Bilgileri | Cins | ✅ `iplikDetayStore` (aktif detaylar) | Değişiklik yok |
| İplik Bilgileri | Denye | ✅ `kalinlikStore` (aktif, birleşik gösterim) | Değişiklik yok |
| İplik Bilgileri | Renk | ✅ `renkStore` (aktif) | Değişiklik yok |
| İplik Bilgileri | Tedarikçi | ✅ `tedarikciStore` + kategori filtresi | Değişiklik yok |
| İplik Bilgileri | Renk Kodu | ✅ Manuel giriş | Değişiklik yok |

**Sonuç:** 7 alandan 6'sı zaten doğru şekilde master data kaynaklarına bağlı. Sadece **Beden** alanı için `lookupStore` entegrasyonu gerekiyor. Bu değişiklik sadece `YeniNumune.tsx` dosyasını etkiler ve yaklaşık 5-6 satır kod değişikliği gerektirir.
