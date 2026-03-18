# OYS-ERP – FAZ 2B KESİN KARAR ANALİZİ

**Kapsam:** 00-OYS-GENERAL  
**Mod:** SADECE ANALİZ — kod değişikliği yok  
**Konu:** Numune modülünden Artikel Tanımları'na kontrollü kayıt aktarımı  

---

## 1. Kısa Sonuç

FAZ 2B, FAZ 2A'yı bozmadan güvenli şekilde eklenebilir.

Mevcut mimaride zaten aynı pattern çalışıyor: `handleUretimHazirligaGonder` (NumuneTaleplerPage.tsx) numuneden Üretim Hazırlık modülüne `numuneId` bazlı duplicate kontrolüyle transfer yapıyor. Aynı pattern, Artikel Tanımları için uygulanabilir.

Etkilenecek dosya sayısı: **2** (artikelStore.ts + YeniNumune.tsx veya NumuneTaleplerPage.tsx).

Alan eşleştirmesi:
| Numune (generalInfo) | Artikel Tanımları |
| --- | --- |
| `numuneNo` | `numuneNo` |
| `musteriKodu` | `musteriKodu` |
| `musteriArtikelKodu` | `musteriArtikelNo` |
| `corapTanimi` | `urunTanimi` |

Teknik meta alanlar otomatik atanacak: `kaynak = 'numune'`, `numuneId = numune.id`, `durum = 'AKTIF'`.

---

## 2. Tetikleme Noktası Kararı

**Karar: "Kaydet & Onayla" doğru tetikleme noktasıdır.**

- **Taslak kayıtlar artikel oluşturMAMALI.** Taslak eksik/onaysız veridir; referans veri olarak kaydedilmemeli.
- **"Beklemede" durumu yeterli eşiktir.** `handleSaveAndApprove` çağrıldığında validasyon geçmiş, numune numarası kesinleşmiş ve kullanıcı bilinçli onay vermiştir. Bu, Artikel Tanımları kaydı oluşturmak için minimum güvenli eşiktir.
- **Gerekçe:** Daha sonraki durumları (Üretimde, Hazır, vb.) beklemek gereksiz gecikme yaratır. Artikel Tanımları referans veridir — numune onaylandığı anda ürün tanımı kesinleşmiştir.

---

## 3. Oluşturma Davranışı Kararı

**Karar: `create` (yeni kayıt oluştur) + ön duplicate kontrolü.**

- **Gerekçe:** `upsert` gereksiz karmaşıklık ekler — hangi alanın güncelleneceği belirsizleşir. "Bul ve bağla" riskli — yanlış eşleşme ihtimali var. "Uyar ve dur" akışı bloke eder.
- **Davranış:** Önce `numuneId` ile duplicate kontrol yap. Eşleşme yoksa yeni Artikel kaydı `kaynak='numune'` ile oluştur. Eşleşme varsa işlemi atla ve bilgi mesajı göster.
- **Bu, mevcut ÜH transfer pattern'iyle birebir uyumlu:** `handleUretimHazirligaGonder` de aynı mantıkla çalışıyor (numuneId kontrolü → create veya reddet).

---

## 4. Manuel Kayıt Çakışma Kararı

> **⚠️ DERİN İNCELEME SONRASI GÜNCELLENDİ** — Senaryo B düzeltildi, çakışma kontrol sırası netleştirildi.

### Çakışma Kontrol Sırası (addArtikelFromNumune içinde)

1. **numuneId eşleşmesi** → varsa işlem atlanır (aynı numune zaten aktarılmış)
2. **numuneNo eşleşmesi** → varsa mevcut kaydın sadece meta alanları güncellenir (numuneId, kaynak='numune'). İş alanları DEĞİŞMEZ.
3. **musteriKodu + musteriArtikelNo eşleşmesi** (mevcut kaydın numuneNo'su boşsa) → mevcut kaydın meta alanları güncellenir (numuneId, numuneNo, kaynak='numune'). İş alanları DEĞİŞMEZ.
4. **Hiçbir eşleşme yoksa** → yeni Artikel kaydı oluşturulur.

### Senaryo A: `numuneNo` eşleşiyorsa
**Karar: Bağla — sadece meta alanları güncelle.**

Mevcut kaydın `numuneId` ve `kaynak` alanları güncellenir. İş alanları (musteriKodu, musteriArtikelNo, urunTanimi) güncellenmez. Snapshot ilkesi korunur.

### Senaryo B: `numuneNo` boş ama `musteriKodu + musteriArtikelNo` eşleşiyorsa
**Karar: ~~Yeni kayıt oluştur.~~ → Bağla — sadece meta alanları güncelle.**

Manuel kayıt bir ön tanımdır. Numune onayı geldiğinde bu ön tanım resmi referans verisine dönüşür. İki ayrı kayıt tutmak duplicate yaratır ve kullanıcıyı karıştırır. Mevcut kaydın numuneId, numuneNo ve kaynak alanları güncellenir. İş alanları DEĞİŞMEZ.

### Senaryo C: Hiçbir eşleşme yoksa
**Karar: Yeni kayıt oluştur.**

Standart `create` davranışı. Herhangi bir eşleşme olmadığında doğrudan yeni Artikel kaydı oluşturulur.

---

## 5. Duplicate Önleme Kararı

> **⚠️ DERİN İNCELEME SONRASI GÜNCELLENDİ** — 3 katmanlı kontrol olarak netleştirildi.

**Karar: 3 katmanlı store pre-check.** Sadece store seviyesi yeterli, Dexie/veri katmanı unique constraint gerekmez.

Kontrol sırası (`addArtikelFromNumune` içinde):
1. `numuneId` kontrolü: `artikeller.some(a => a.numuneId === numuneIdStr)` → varsa atla
2. `numuneNo` kontrolü: `artikeller.some(a => normalizeForCompare(a.numuneNo) === normalizedNumuneNo)` → varsa bağla (meta güncelle)
3. `musteriKodu + musteriArtikelNo` kontrolü: eşleşen kaydın numuneNo'su boşsa → bağla (meta güncelle)
4. Hiçbir eşleşme yoksa → create

---

## 6. Snapshot mı Canlı Bağ mı?

**Karar: Snapshot.**

- **Gerekçe:** Artikel Tanımları, kalıcı referans veridir. Numune onaylandığı andaki 4 iş alanı (numuneNo, musteriKodu, musteriArtikelNo, urunTanimi) sabitlenir.
- Numune verisi sonradan değişirse (düzeltme, güncelleme) Artikel kaydı ETKİLENMEZ.
- `numuneId` sadece köken izlenebilirliği (traceability) için tutulur, canlı veri bağı olarak DEĞİL.
- Bu yaklaşım, mevcut ÜH transferiyle de tutarlıdır — ÜH kaydı da numuneden snapshot alır, sonradan bağımsız yaşar.

---

## 7. Yaşam Döngüsü / Numune Silinirse Ne Olur?

**Karar: Artikel kaydı kalıcı kalır. `numuneId` olduğu gibi bırakılır. Orphan referans kabul edilir.**

- Artikel Tanımları, numuneden bağımsız yaşam döngüsüne sahip referans veridir.
- Numune silindiğinde Artikel kaydında `numuneId` değerini `null` yapmak bilgi kaybı yaratır — kökeni artık izlenemez.
- Orphan `numuneId` güvenlidir: UI'da numune detayı gösterilmek istendiğinde "numune bulunamadı" durumu basit bir `if` kontrolüyle yönetilebilir.
- **Bu, mevcut ÜH pattern'iyle tutarlıdır** — ÜH kayıtlarında da `numuneId` orphan kalabilir.

---

## 8. Hata / Geri Dönüş Kararı

**Numune onayı geri alınMAMALI. Artikel hatası ayrı yönetilmeli.**

- **Numune "Kaydet & Onayla" başarılı ama artikel oluşturma başarısız olursa:** Numune kaydı 'Beklemede' olarak korunur. Kullanıcıya uyarı gösterilir: _"Numune onaylandı ancak artikel tanımı oluşturulamadı. Lütfen Artikel Tanımları ekranını kontrol edin."_
- **Atomik davranış GEREKMEZ.** Mevcut mimari localStorage bazlı — transaction desteği yok. İki bağımsız storage (localStorage numune listesi + Zustand/persist artikel store) arasında atomiklik garanti edilemez ve zorlamak gereksiz karmaşıklık yaratır.
- **Kontrollü iki adımlı yaklaşım yeterli:**
  1. Numune kaydını güncelle (durum: 'Beklemede') → başarılı
  2. Artikel kaydı oluşturmayı dene → başarılı veya hata mesajı
- **Yarım kalan aktarım tespiti:** 'Beklemede' veya sonrası durumda olup Artikel store'da karşılığı (`numuneId` eşleşmesi) olmayan numuneler taranarak tespit edilebilir. Bu, ileride bir "kontrol" fonksiyonu olarak eklenebilir ama FAZ 2B kapsamında zorunlu değildir.

---

## 9. Kesin Etkilenecek Minimum Dosyalar

| # | Dosya | Değişiklik |
| --- | --- | --- |
| 1 | `src/store/artikelStore.ts` | `addArtikelFromNumune(numuneData)` metodu ekleme — `kaynak='numune'`, `numuneId` atama, `numuneId` bazlı duplicate kontrol |
| 2 | `src/modules/numune/pages/YeniNumune.tsx` | `handleSaveAndApprove` içine artikel oluşturma çağrısı ekleme (numune kaydı sonrası) |

**Alternatif tetikleme noktası** (eğer otomatik yerine manuel tercih edilirse):
| 2 (alt.) | `src/modules/numune/pages/NumuneTaleplerPage.tsx` | Ayrı "Artikel Oluştur" aksiyonu ekleme (ÜH transfer pattern'i gibi) |

**Dokunulmayacak dosyalar:** `types/index.ts` (mevcut Artikel tipi yeterli — yeni alan yok), `ArtikelTanimlari.tsx` (manuel CRUD akışı korunacak — yeni UI elementi yok), `modules.ts` (modül tanımı değişmiyor), `App.tsx` (yeni route yok), `index.tsx` (kart listesi değişmiyor).

---

## 10. FAZ 2B İçin En Güvenli Uygulama Sırası

1. **artikelStore.ts'e `addArtikelFromNumune` metodu ekle** — `numuneId` duplicate kontrolü + `kaynak='numune'` ile kayıt oluşturma. Mevcut `addArtikel` metoduna DOKUNMA.
2. **YeniNumune.tsx `handleSaveAndApprove` sonuna artikel çağrısı ekle** — numune localStorage'a yazıldıktan SONRA, navigate'den ÖNCE. Hata durumunda toast göster, navigate'i bloke etme.
3. **Manuel test** — Taslak kaydet → artikel oluşmadığını doğrula. Kaydet & Onayla → artikel oluştuğunu doğrula. Aynı numune ikinci kez → duplicate engellendiğini doğrula. Manuel artikel CRUD → bozulmadığını doğrula.

---

## 11. ~~Kod Başlamadan Önce Netleşmesi Gereken Son 3 Karar~~ KAPATILDI

> **⚠️ DERİN İNCELEME SONRASI GÜNCELLENDİ** — Tüm açık kararlar kapatılmıştır.

1. **Tetikleme yeri: KAPATILDI → Otomatik.** `handleSaveAndApprove` içinde çalışacak. Manuel buton gereksiz — kullanıcı unutma riski yaratır.

2. **Düzenleme modu davranışı: KAPATILDI → Her çağrıda çalışır, numuneId kontrolü ikinci oluşturmayı engeller.** Ek kod gerekmez. Duplicate kontrol mekanizması bu senaryoyu doğal olarak yönetir.

3. **corapTanimi boş davranışı: KAPATILDI → Boş olsa bile artikel oluşturulur.** urunTanimi="" olarak kaydedilir. numuneNo yeterli tanımlayıcıdır. Kullanıcı Artikel Tanımları ekranından düzenleyebilir.

**Ek: Tip uyumsuzluğu tespiti →** numune.id (number/Date.now()) → Artikel.numuneId (string) dönüşümü `.toString()` ile çağıran tarafta yapılacak.

**Sonuç: Koda geçilebilir. Bloklayıcı madde kalmamıştır.** Detaylı derin inceleme için bkz. `docs/FAZ-2B-DERIN-INCELEME.md`.
