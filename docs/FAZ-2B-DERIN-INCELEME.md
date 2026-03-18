# OYS-ERP – FAZ 2B DERİN İNCELEME / KARAR KAPATMA

**Kapsam:** 00-OYS-GENERAL  
**Mod:** SADECE ANALİZ — kod değişikliği yok  
**Referans:** docs/FAZ-2B-KARAR-ANALIZI.md (önceki analiz)  
**Amaç:** Önceki analizi eleştirel inceleme, açık kararları kapatma, çelişkileri düzeltme  

---

## 1. KISA HÜKÜM

**Puan: 72 / 100**

Önceki analiz genel çerçeveyi doğru kurmuş ancak koda geçilemez durumda bırakmıştır. Nedenleri:

1. **3 karar açık bırakılmış** (Bölüm 11) — tetikleme tipi, düzenleme modu, corapTanimi boş davranışı "netleşmesi gereken" olarak bırakılmış. Bu kabul edilemez.
2. **Çakışma kuralı Senaryo B çelişkili** — `musteriKodu + musteriArtikelNo` eşleşiyorsa "yeni kayıt oluştur" diyor ama bu mevcut `addArtikel` duplicate kontrolüyle çatışır. Sistem manuel girişte bu kombinasyonu unique sayarken numune aktarımında izin vermesi tutarsız.
3. **Duplicate koruması teknik olarak yetersiz tanımlanmış** — "numuneId bazlı kontrol" denmiş ama `numuneNo` eşleşme senaryosu eksik ele alınmış. İki farklı kontrol mekanizması (numuneId ve numuneNo) arasındaki öncelik belirsiz.
4. **Tetikleme sırası muğlak** — "navigate'den ÖNCE" denmiş ama numune kayıt başarısından sonra mı, yoksa kayıt denemesiyle eşzamanlı mı yapılacağı netleştirilmemiş.
5. **Tip uyumsuzluğu belirtilmemiş** — numune.id `number` (Date.now()), Artikel.numuneId `string | null`. toString() zorunluluğu analiz belgesinde yok.
6. **corapTanimi boşken urunTanimi ne olacak belirsiz** — numune formunda corapTanimi zorunlu alan DEĞİL (validate() fonksiyonunda yok, satır 427-452). Boş gelme ihtimali gerçek.
7. **Senaryo A "bağla" kararı snapshot ilkesiyle çelişir** — snapshot diyorsun ama Senaryo A'da mevcut kaydı güncelle diyorsun. Bu iki karar birbiriyle tutarsız.
8. **Güçlü yanlar var** — ÜH transfer pattern referansı, hata yönetimi ilkesi, orphan kararı doğru. Ama açık noktalar kapatılmadan koda geçilemez.

---

## 2. GÜÇLÜ YANLAR

1. **ÜH transfer pattern referansı doğru ve somut.** `handleUretimHazirligaGonder` (NumuneTaleplerPage.tsx:138-182) birebir aynı mimari deseni kullanıyor: numuneId ile duplicate kontrol → create → status güncelle. Bu pattern kanıtlanmış ve çalışıyor.

2. **Hata yönetimi ilkesi doğru.** "Numune onayı geri alınMAMALI" kararı mevcut mimariyle tutarlı. localStorage + Zustand/persist arasında atomiklik zorlanamaz. İki adımlı yaklaşım bu mimari için en güvenli seçenek.

3. **Orphan numuneId kararı doğru.** Referans veri silindikten sonra numuneId'yi null yapmak bilgi kaybı yaratır. Orphan bırakmak ÜH pattern'iyle de tutarlı. UI'da "bulunamadı" kontrolü basit.

4. **Snapshot kararı (genel ilke olarak) doğru.** Artikel Tanımları kalıcı referans veridir. Numune verisi sonradan değiştiğinde artikel ETKİLENMEMELİ. Bu ilke korunacak.

5. **Minimum dosya hedefi doğru.** Sadece 2 dosya (artikelStore.ts + YeniNumune.tsx) yeterli. types/index.ts, ArtikelTanimlari.tsx, modules.ts, App.tsx'e dokunmaya gerek yok.

6. **Alan eşleştirme tablosu doğru.** generalInfo.corapTanimi→urunTanimi, generalInfo.musteriArtikelKodu→musteriArtikelNo isimlendirme farkları doğru tespit edilmiş.

---

## 3. KRİTİK ZAYIF NOKTALAR

### 3.1 Çakışma Kuralı Senaryo B: Duplicate Riski

**Sorun:** Önceki analiz diyor ki: "numuneNo boş ama musteriKodu + musteriArtikelNo eşleşiyorsa → yeni kayıt oluştur."

**Neden riskli:** Mevcut `addArtikel` fonksiyonu (artikelStore.ts:47-60), numuneNo boş olduğunda `musteriKodu + musteriArtikelNo` kombinasyonunu unique olarak kontrol ediyor ve duplicate'i engelliyor. Ancak numune aktarımında numuneNo DOLU olacağından bu kontrol devreye GİRMİYOR (satır 36-44 numuneNo bazlı kontrol çalışıyor). Sonuç:
- Manuel kayıt: numuneNo="", musteriKodu="ABC", musteriArtikelNo="123" ✓ oluşturulmuş
- Numune aktarımı: numuneNo="1A5B0", musteriKodu="ABC", musteriArtikelNo="123" ✓ yeni oluşturulur
- **İki farklı artikel, aynı müşteri/artikel kombini** = iş kuralı duplicate'i

**Kodda ne olur:** İki ayrı Artikel kaydı, aynı müşteri/artikel bilgisiyle yaşar. Kullanıcı Artikel Tanımları listesinde iki satır görür. Hangisinin doğru olduğu belirsizleşir.

**Doğru karar:**
`musteriKodu + musteriArtikelNo` eşleşiyorsa (mevcut kaydın numuneNo'su boşsa) → **mevcut kaydı bağla** (numuneNo, numuneId, kaynak alanlarını güncelle).

**Gerekçe:** Manuel kayıt bir "ön tanım"dır. Numune onayı geldiğinde bu ön tanım resmi referans verisine dönüşür. İki ayrı kayıt tutmak değil, mevcut kaydı zenginleştirmek doğru iş kuralıdır. Bu, kullanıcıya "bu müşteri/artikel için zaten bir tanım var, numune bilgisiyle eşleştirildi" şeklinde bilgi mesajı ile bildirilir.

---

### 3.2 Senaryo A "Bağla" Kararı ile Snapshot İlkesi Arasındaki Çelişki

**Sorun:** Analiz Bölüm 6'da "snapshot" diyor — yani numune onayı anındaki veri sabitlenir, sonradan değişmez. Ama Bölüm 4 Senaryo A'da "mevcut kaydın numuneId ve kaynak alanlarını güncelle" diyor. Bu güncelleme snapshot ilkesini kısmen ihlal eder.

**Neden riskli:** Eğer mevcut kayıttaki veri (urunTanimi, musteriKodu vb.) numunedeki veriden farklıysa, güncelleme hangi değerleri koruyacak? Kullanıcının manuel girdiği mi, numunenin getirdiği mi?

**Doğru karar:** Bağlama işlemi SADECE meta alanları günceller: `numuneId`, `numuneNo`, `kaynak`. İş alanları (musteriKodu, musteriArtikelNo, urunTanimi) GÜNCELLENMez. Snapshot ilkesi bu şekilde korunur: mevcut kaydın iş verileri sabit kalır, sadece numune referansı eklenir.

---

### 3.3 Düzenleme Modu Kararı Açık

**Sorun:** Önceki analiz Bölüm 11'de "netleşmesi gereken" olarak bırakmış.

**Neden riskli:** Kullanıcı mevcut bir "Beklemede" numune kaydını edit edip tekrar "Kaydet & Onayla" yaparsa (isEditMode=true), sistem ikinci kez artikel oluşturmaya mı çalışacak?

**Doğru karar:** `addArtikelFromNumune` metodu her çağrıda `numuneId` duplicate kontrolü yapacak. İlk onayda artikel oluşturulmuş ve numuneId bağlanmışsa, ikinci çağrıda `numuneId` eşleşmesi bulunacak ve işlem sessizce atlanacak. **Ek kod gerekmez** — duplicate kontrol mekanizması bu senaryoyu doğal olarak yönetir. Düzenleme modunda tekrar çalışır ama ikinci kayıt oluşturmaz.

---

### 3.4 corapTanimi Boş Davranışı Açık

**Sorun:** Önceki analiz Bölüm 11'de "netleşmesi gereken" olarak bırakmış.

**Neden riskli:** Numune formunda `corapTanimi` zorunlu alan DEĞİL (validate() fonksiyonu satır 427-452'de corapTanimi kontrolü yok). Boş gelme ihtimali gerçek. Eğer addArtikelFromNumune bu alana bağımlıysa, artikel oluşturma sessizce başarısız olabilir.

**Doğru karar:** `corapTanimi` boşsa bile artikel oluşturulacak. `urunTanimi` alanı boş string olarak kaydedilecek. **Gerekçe:** numuneNo tek başına yeterli tanımlayıcıdır. urunTanimi opsiyonel açıklama alanıdır. Kullanıcı Artikel Tanımları ekranından sonra düzenleyebilir. Artikel oluşturmayı engellemek veya atlamak iş akışını gereksiz bloke eder.

---

### 3.5 Tetikleme Tipi Kararı Açık

**Sorun:** Önceki analiz Bölüm 11'de "otomatik mı manuel mi — iş sahibinin onayı gerekir" olarak bırakmış.

**Doğru karar:** **Otomatik.** `handleSaveAndApprove` içinde çalışacak. **Gerekçe:**
- Manuel akış (NumuneTaleplerPage'de ayrı buton) kullanıcı unutma riski yaratır — numune onaylanır ama artikel oluşturulmaz.
- Otomatik akış "Kaydet & Onayla" ile kullanıcının bilinçli onay verdiği anda çalışır. Ekstra kullanıcı aksiyonu gereksizdir.
- ÜH transfer pattern'i (NumuneTaleplerPage:138-182) manuel butondur ama bu farklı bir iş kuralıdır — ÜH'ye gönderme ayrı bir operasyonel karardır. Artikel oluşturma ise onay sürecinin doğal sonucudur.

---

### 3.6 Tetikleme Sırası Muğlak

**Sorun:** "navigate'den ÖNCE" denmiş ama numune kaydı ile artikel oluşturma arasındaki tam sıra belirsiz.

**Doğru karar:** Sıralama **B** olacak:

```
1. validate() → başarısız ise dur
2. commitNumuneSira() → sayaç ilerlet (yeni kayıtsa)
3. yeniNumune nesnesi oluştur (durum: 'Beklemede')
4. localStorage'a yaz → NUMUNE KAYDI TAMAMLANDI
5. setStatus('Beklemede')
6. TRY: addArtikelFromNumune(numuneData) → başarılı / başarısız
7. Başarılıysa: normal onay toast'u
8. Başarısızsa: onay toast'u + ek uyarı toast'u ("artikel oluşturulamadı")
9. navigate → HER DURUMDA çalışır
```

**Gerekçe:** Numune kaydı (adım 4) her durumda tamamlanır. Artikel hatası (adım 6) numune kaydını ETKİLEMEZ. Bu, "artikel hatası numune onayını bozmamalı" ilkesiyle birebir uyumlu.

---

### 3.7 Duplicate Koruması Teknik Netliği Eksik

**Sorun:** "numuneId bazlı kontrol" denmiş ama store mı, Dexie mi, ikisi birlikte mi belirsiz. İki sekme riski değerlendirilmemiş.

**Doğru karar:** **Sadece store pre-check yeterli.**

**Gerekçe:**
- Artikel store Zustand + persist (localStorage) kullanıyor — Dexie DEĞİL. Dexie seviyesinde unique constraint eklemek mimari değişiklik gerektirir ve FAZ 2B kapsamını aşar.
- Zustand persist okuması senkron. `get().artikeller` çağrısı anlık store durumunu verir.
- İki sekme riski: Zustand persist, her sekme için bağımsız store instance'ı çalıştırır. localStorage üzerinden senkronize olur. Ancak iki sekmede aynı anda "Kaydet & Onayla" basılması pratik olarak imkansız (kullanıcı aynı anda iki numune onaylamaz). Bu edge case ihmal edilebilir.
- **Kontrol sırası (addArtikelFromNumune içinde):**
  1. `numuneId` kontrolü: `artikeller.some(a => a.numuneId === numuneIdStr)` → varsa atla
  2. `numuneNo` kontrolü: `artikeller.some(a => normalizeForCompare(a.numuneNo) === normalizedNumuneNo)` → varsa bağla (meta güncelle)
  3. `musteriKodu + musteriArtikelNo` kontrolü: eşleşen kaydın numuneNo'su boşsa → bağla (meta güncelle)
  4. Hiçbir eşleşme yoksa → create

---

### 3.8 Tip Uyumsuzluğu Belirtilmemiş

**Sorun:** numune.id `number` tipinde (Date.now()), Artikel.numuneId `string | null` tipinde. Önceki analizde bu uyumsuzluk belirtilmemiş.

**Doğru karar:** `addArtikelFromNumune` parametresi numuneId'yi `string` olarak alacak. Çağıran taraf (YeniNumune.tsx) `numune.id.toString()` dönüşümünü yapacak. Bu, tip güvenliğini garantiler.

---

## 4. KARAR KAPATMA TABLOSU

| Başlık | Önceki Durum | Risk | Nihai Karar | Gerekçe |
| --- | --- | --- | --- | --- |
| **Tetikleme tipi** | Açık ("iş sahibi onayı gerekir") | Kullanıcı unutma riski | **Otomatik** — handleSaveAndApprove içinde | Onay = bilinçli karar, ekstra adım gereksiz |
| **Tetikleme sırası** | Muğlak ("navigate'den ÖNCE") | Hata yönetimi belirsiz | **B: Numune kaydı → onay → artikel try/catch → navigate** | Numune kaydı her durumda korunur |
| **Çakışma: numuneNo eşleşirse** | Bağla (meta güncelle) | Snapshot ile çelişki | **Bağla — sadece meta alanlar** (numuneId, numuneNo, kaynak). İş alanları güncellenmez | Snapshot ilkesi korunur |
| **Çakışma: musteriKodu+musteriArtikelNo eşleşirse** | Yeni kayıt oluştur | Duplicate riski | **Bağla — sadece meta alanlar** (eşleşen kaydın numuneNo'su boşsa) | Aynı ürün iki kez kayıt olmamalı |
| **Çakışma: eşleşme yoksa** | Yeni kayıt oluştur | Yok | **Create** — yeni artikel kaydı | Standart davranış |
| **Duplicate koruması** | numuneId bazlı (tek katman) | numuneNo eşleşme senaryosu eksik | **3 katmanlı store pre-check:** numuneId → numuneNo → musteriKodu+musteriArtikelNo | Tüm senaryolar kapsanır |
| **Düzenleme modu** | Açık ("netleşmesi gerekir") | İkinci kayıt riski | **Her çağrıda çalışır, numuneId kontrolü ikinci oluşturmayı engeller** | Ek kod gerekmez, doğal koruma |
| **corapTanimi boş** | Açık ("netleşmesi gerekir") | İş akışı blokajı | **Boş olsa bile artikel oluşturulur**, urunTanimi="" olarak kaydedilir | numuneNo yeterli tanımlayıcı |
| **Snapshot yaklaşımı** | Doğru karar | Senaryo A ile çelişki | **Korunuyor.** Bağlama işlemi sadece meta alanları günceller, iş alanları sabit kalır | Tutarlılık sağlandı |
| **Orphan yaşam döngüsü** | Doğru karar | Yok | **Korunuyor.** numuneId orphan kalabilir, null yapılmaz | Bilgi kaybı önlenir |
| **Hata yönetimi** | Doğru karar | Yok | **Korunuyor.** Non-atomik, iki adımlı. Numune onayı + artikel try/catch | Mevcut mimariyle uyumlu |
| **Minimum dosyalar** | 2 dosya (doğru) | Yok | **2 dosya: artikelStore.ts + YeniNumune.tsx** | Dokunulmayacak dosyalar listesi korunuyor |
| **Tip uyumsuzluğu** | Belirtilmemiş | Runtime hatası | **numune.id.toString() dönüşümü** çağıran tarafta yapılacak | string/number mismatch önlenir |

---

## 5. NİHAİ KARAR SETİ

Aşağıdaki maddeler kesindir. Hiçbiri açık uçlu değildir. Her madde "şöyle olacak" şeklindedir.

### Tetikleme
1. Artikel oluşturma **otomatik** olarak `handleSaveAndApprove` içinde çalışacak.
2. Sadece `handleSaveAndApprove` tetikler. `handleSave` (Taslak) tetiklemeyecek.
3. Tetikleme sırası: numune localStorage'a yazıldıktan SONRA, navigate'den ÖNCE. Try/catch ile sarılacak.

### Oluşturma Davranışı
4. Yeni metot adı: `addArtikelFromNumune`.
5. Bu metot mevcut `addArtikel`'e DOKUNMAYACAK. Ayrı metot olarak eklenecek.
6. `addArtikelFromNumune` parametreleri: `{ numuneId: string, numuneNo: string, musteriKodu: string, musteriArtikelNo: string, urunTanimi: string }`.
7. `kaynak` alanı `'numune'` olarak set edilecek.
8. `durum` alanı `'AKTIF'` olarak set edilecek.

### Duplicate / Çakışma Kontrolü (addArtikelFromNumune içinde, sırasıyla)
9. **1. Kontrol:** `numuneId` eşleşmesi → varsa işlem atlanır, `{ success: true, skipped: true }` döner.
10. **2. Kontrol:** `numuneNo` eşleşmesi → varsa mevcut kaydın sadece meta alanları güncellenir (numuneId, kaynak='numune'), iş alanları DEĞİŞMEZ, `{ success: true, linked: true }` döner.
11. **3. Kontrol:** `musteriKodu + musteriArtikelNo` eşleşmesi (mevcut kaydın numuneNo'su boşsa) → mevcut kaydın meta alanları güncellenir (numuneId, numuneNo, kaynak='numune'), iş alanları DEĞİŞMEZ, `{ success: true, linked: true }` döner.
12. **Eşleşme yoksa:** Yeni Artikel kaydı oluşturulur, `{ success: true, created: true }` döner.

### Alan Eşleştirme (YeniNumune.tsx → addArtikelFromNumune çağrısı)
13. `numuneId` = `yeniNumune.id.toString()` (number → string dönüşümü zorunlu).
14. `numuneNo` = `formData.generalInfo.numuneNo`.
15. `musteriKodu` = `formData.generalInfo.musteriKodu`.
16. `musteriArtikelNo` = `formData.generalInfo.musteriArtikelKodu` (isim farkı: kaynak=musteriArtikelKodu, hedef=musteriArtikelNo).
17. `urunTanimi` = `formData.generalInfo.corapTanimi` (isim farkı: kaynak=corapTanimi, hedef=urunTanimi). Boş olabilir.

### Düzenleme Modu
18. `handleSaveAndApprove` düzenleme modunda da artikel oluşturmayı tetikler. Ancak numuneId duplicate kontrolü (madde 9) ikinci oluşturmayı otomatik olarak engeller. Ek kod GEREKMEZ.

### corapTanimi Boş Davranışı
19. `corapTanimi` (→ `urunTanimi`) boşsa bile artikel oluşturulacak. Boş string kaydedilecek. Engelleme veya atlama YOK.

### Snapshot İlkesi
20. Artikel kaydındaki iş alanları (numuneNo, musteriKodu, musteriArtikelNo, urunTanimi) oluşturma/bağlama anında sabitlenir. Numune verisi sonradan değişirse artikel ETKİLENMEZ.
21. Bağlama senaryolarında (madde 10, 11) sadece meta alanlar güncellenir. İş alanları güncellenmez.

### Hata Yönetimi
22. Artikel oluşturma başarısız olursa numune onayı GERİ ALINMAZ.
23. Hata durumunda kullanıcıya uyarı toast'u gösterilir. Navigate engellenMEZ.
24. Atomik davranış GEREKMEZ. Non-atomik iki adımlı yaklaşım yeterli.

### Yaşam Döngüsü
25. Numune silindiğinde artikel kaydı kalıcı kalır. `numuneId` olduğu gibi bırakılır. Orphan referans kabul edilir.

### Teknik
26. Duplicate koruması: sadece store pre-check yeterli. Dexie/veri katmanı unique constraint GEREKMEZ.
27. Tip dönüşümü: numune.id (number) → numuneId (string) dönüşümü `.toString()` ile çağıran tarafta yapılır.

### Dosyalar
28. Değişecek dosyalar: `src/store/artikelStore.ts` (addArtikelFromNumune metodu), `src/modules/numune/pages/YeniNumune.tsx` (handleSaveAndApprove'a çağrı + import).
29. Dokunulmayacak dosyalar: `types/index.ts`, `ArtikelTanimlari.tsx`, `modules.ts`, `App.tsx`, `index.tsx`, `NumuneTaleplerPage.tsx`.

---

## 6. KODA GEÇİŞ HAZIRLIK HÜKMÜ

**Bu haliyle koda geçilebilir.**

Nedenleri:

1. **Tüm açık kararlar kapatıldı.** Tetikleme tipi (otomatik), düzenleme modu (çalışır ama duplicate engeller), corapTanimi boş (oluşturulur) — Bölüm 11'deki 3 madde karar haline getirildi.

2. **Çelişkiler giderildi.** Senaryo B "yeni kayıt oluştur" kararı "bağla" olarak düzeltildi. Senaryo A "bağla" kararı snapshot ilkesiyle uyumlu hale getirildi (sadece meta güncelleme).

3. **Duplicate koruması 3 katmanlı olarak netleştirildi.** numuneId → numuneNo → musteriKodu+musteriArtikelNo sırasıyla kontrol. Her senaryo karara bağlandı.

4. **Minimum dosya ilkesi korundu.** 2 dosya değişikliği ile tüm kararlar uygulanabilir.

5. **Tip uyumsuzluğu tespit ve çözüm belirtildi.** toString() dönüşümü netleştirildi.

**Bloklayıcı madde kalmadı. FAZ 2B kodlamasına bu dokümanı esas alarak başlanabilir.**
