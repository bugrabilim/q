# q — Master Tasarım Belgesi (v1.9)
**Queer Quest Quench | Tüm Kararların Özeti + Yeni Sohbet Devam Talimatı**

> Bu dosya hem yeni sohbete açıklayan **devam talimatı** hem de **tasarım kararlarının tek doğru kaynağı**. Yeni sohbete en güncel proje zip'i ile birlikte yüklendiğinde, Claude burayı önce okuyup mevcut durumu anlamalı.
>
> **Güncel sürüm: v1.9** (2026-06-23). Kod deposu yerel `q-v11/` klasöründe; deploy `git push origin main` → GitHub `bugrabilim/q` → Railway otomatik. Canlı: https://q-11.up.railway.app

---

## ÇALIŞMA NOTU
Claude, bu belge paylaşıldığında belgeleme veya mockup çalışması yapmadan önce onay sormalıdır. Kullanıcı "evet" demeden görsel veya belge üretilmez. Token tasarrufu için bu kural her zaman geçerlidir.

**Platform yol haritası:** Prototip web + mobil browser eş zamanlı (responsive), V1 Steam ve benzeri oyun platformları.

---

## A. YENİ SOHBET İÇİN DEVAM TALİMATI

### Selam Claude

Bu, **Queer Quest Quench** (kısaltma: q) adlı sosyal dedüksiyon oyununun prototipini yapmak için Buğra ile birlikte yürüttüğümüz uzun bir projenin devamı.

### Mevcut durum (v1.9)

Prototip canlıda: **https://q-11.up.railway.app**. Bu belgenin tamamı, tasarım kararlarının kayıtlı olduğu master belge. **Bölüm 18**'de prototip geliştirme durumu (tamamlanan tüm işler) ve Versiyon 1'e bırakılanlar listelenir.

**Prototip durumu:** Tamamlanmış ve **Railway'de canlıda** (https://q-11.up.railway.app). Tüm 8 faz, 11 rol gece motoru, sürekli paneller, bot sistemi, ses katmanı, karakter portreleri, host dağılım paneli, otomatik sayaçlar hepsi çalışıyor. Detaylı kategori-kategori liste için **Bölüm 18'in "Prototip Geliştirmesi" başlığına** bak.

**v1.9 — Görsel kimlik uygulandı (2026-06-23):** Bölüm 23'teki "sıcak piksel-art" yönü artık karar değil, **canlıda uygulanmış durum**. Tüm tema mavi-yeşilden **sıcak parşömen/ahşap palete** geçirildi (22+ CSS dosyası), yatay **logo** (`Logo.jsx`) ve **favicon** (madalyon q) eklendi, oyun ekranına **dinamik köy sahnesi** arka planı (`KoySahnesi.jsx` — oyuncu sayısı kadar ev, gece/gündüz değişimi, orman + dere) kondu, rol dağıtımı **2.5D çevirmeli karta** dönüştü (kapalı ahşap kart → dokununca 3D döner). Renk paleti Bölüm 16'da güncellendi. Detay: Bölüm 18 "v1.9".

**Oyun akışı:**
```
Lobi → Rol → Tanışma → Gece → Sabah ──┬─ Kazanan? → Bitiş
                            ↑          └─ Yok? → Tartışma → Oylama 1 → Savunma → Oylama 2 ──┬─ Biri gitti → Sonuç (20sn) → Gece
                            └────────────────────────────────────────────────────────────── └─ Kimse → 60sn Tartışma → Oylama → Gece
```

**Sıradaki adım (v1.9 sonrası):** V1'in büyük kısmı tamamlandı. Hikaye + Wiki + QA + Köy olayları + Kişi engelleme + B seçeneği (rol havuzu) + **38 karakterin ~1 sayfalık benzersiz hikayesi** (`hikayeler/`) + **görevlerin hikâyeye uyarlanması (15 rol)** + **tüm Tarafsız rollerin spesifik kazanma koşulları** bitti. **Görsel kimlik artık uygulandı** (v1.9 — sıcak piksel-art tema + logo + favicon + köy sahnesi + 2.5D rol kartı; Bölüm 18 "v1.9"). Kalan V1 işleri: **özgün 38 karakter portresi** (şu an 12 var, Kenney CC0 + filter), rol/aksiyon ikonları (emoji → piksel), senaryo sistemi, ipucu sistemi, çoklu dil (i18n) altyapı, resmi QA test matrisi. Yatırım sonrası stratejik yol haritası **Bölüm 22**'de 14 alt başlık altında planlandı (domain, hosting, email, kayıt, Steam, i18n, pazarlama, hukuki, gelir modeli, vs.).

**Açık bug yok.** v1.7'de Bug #3 (mobilde ses ayarları slider'ları) düzeltildi. Detay: `buglar.md`.

### Çalışma kuralları (Buğra ile)

1. **Türkçe konuş.** Kod yorumları, değişken adları, fonksiyon adları, UI metinleri hep Türkçe.
2. **Belgeden çıkma.** Bu master belge tek doğru kaynak. Tutarsızlık görürsen önce Buğra'ya sor.
3. **Buğra teknik bilmiyor.** Adım adım anlat. "Şu komutu yapıştır", "şu butona bas" şeklinde net söyle.
4. **Tasarım kararları için onay iste.** Kullanıcı önyüzünü etkileyen her şeyde sor.
5. **Yapım planı önce, kodlama sonra.** Büyük adımlardan önce ne yapacağını söyle, onay al.
6. **Mobilden cevap geliyor olabilir.** Kısa, net soru sor; uzun teknik açıklamadan kaçın.
7. **Test et, paketle, ver.** Her büyük adımdan sonra zip'le sun.

### Tasarım dili (v1.9 — sıcak piksel-art / parşömen-ahşap)

> **DİKKAT:** v1.9'da palet mavi-yeşilden sıcak parşömen/ahşaba geçti. Aşağıdaki değerler `client/src/index.css`'teki **gerçek canlı değerlerdir** — eski mavi-yeşil paleti kullanma.

**Renkler (CSS değişkenleri):**
- `--gokyuzu: #ecdcb4` (ana arkaplan/gündüz, parşömen), `--deniz-acik: #e8d6ad` (yüzey/kart kenarı), `--deniz: #9a6532` (aksan/border, ahşap kahve), `--derin: #3d2b1c` (metin, koyu kahve), `--gunes: #e0892b` (vurgu, altın)
- `--gece: #2d2236` (gece arkaplanı, sıcak koyu mor-kahve), `--ayisigi: #e2cd9f` (gece aksanı)
- `--parsomen: #fbf3dd` (açık panel zemini), `--ahsap: #9a6532` (ahşap çerçeve), `--ahsap-koyu: #5c3a17` (kalın kenar/gölge)
- Grup renkleri **değişmedi** (oyun mantığı): özgürlükçü `#06A77D`, tarafsız `#F4A261`, gelenekçi `#E63946`
- Piksel-art sert gölge: `--golge-orta: 0 0 0 2px var(--ahsap), 0 5px 0 rgba(92, 58, 23, 0.22)`

**Fontlar:** Lora (başlık + alıntı), system sans-serif (UI). **Caveat yok.**

**Logo:** Yatay logo bileşeni `client/src/Logo.jsx` (madalyon q + "Queer Quest Quench" + küçük gökkuşağı şeridi). Favicon: `client/public/favicon.svg` (madalyon q + grup rengi yayları).

### Teknik yığın

- **Backend:** Node.js + Express + Socket.io (`server/index.js`, `server/geceMotoru.js`, `server/roller.js`, `server/rolDagitici.js`)
- **Frontend:** React + Vite (`client/src/App.jsx`, `client/src/ekranlar/*`)
- **Veritabanı:** RAM (kalıcı değil)
- **Çalıştırma:** Root'ta `npm run dev` → sunucu (3001) + istemci (5173)
- **Test süreleri (env değişkenleri):**
  ```
  Q_BASVURU_MS=3000 Q_TANISMA_MS=10000 Q_ROL_MS=8000 Q_GECE_MS=15000 Q_SABAH_MS=8000 Q_TARTISMA_MS=30000 Q_SONUC_MS=10000 npm run dev
  ```
  v1.5'te eklenen `Q_ROL_MS` (rol kartı max süresi) ve `Q_SABAH_MS` (sabah ekranı max süresi) varsayılan 30 sn.

### Mevcut ekran/bileşen dosyaları

```
client/src/ekranlar/
├── AcilisEkrani.jsx/css       — Faz 1: isim + oda kodu girişi
├── LobiEkrani.jsx/css         — Faz 2: oda bekleme + rol galerisi popup
├── RolKartiEkrani.jsx/css     — Faz 3: rol dağıtımı (v1.9: 2.5D çevirmeli kart — kapalı gelir, dokununca 3D döner)
├── TanismaEkrani.jsx/css      — Faz 4: başvuru + serbest tanışma banner'ları
├── GeceEkrani.jsx/css         — Faz 5: gece aksiyonu seçimi + not defteri
├── SabahEkrani.jsx/css        — Sabah çözümleme (genel + kişisel)
├── TartismaEkrani.jsx/css     — Faz 6: tartışma sayaç + hazır
├── OylamaEkrani.jsx/css       — Faz 7: 1. oylama, savunma, 2. oylama, sonuç (20sn), tekrar tartışma
├── BitisEkrani.jsx/css        — Faz 8: kazanan + tüm rol ifşa + yeni oyun
├── AyrilanEkrani.jsx/css      — Köyden ayrılan oyuncu ekranı
├── OyunDuzeni.jsx/css         — Ortak 3-kolonlu yerleşim + mobil sekme barı + sağ üst çıkış
├── OyuncuListesi.jsx/css      — Sürekli oyuncu listesi (köyde + ayrılanlar ayrı bölüm) + toggle
├── RolKartPaneli.jsx/css      — Sürekli rol kart paneli + toggle
└── SohbetPaneli.jsx/css       — Sürekli sohbet paneli (çoklu kanal: köy/fobik/ayrılan)

client/src/
├── Logo.jsx                   — (v1.9) Yatay logo SVG bileşeni (madalyon q + ad + gökkuşağı)
└── bilesenler/
    ├── KoySahnesi.jsx/css     — (v1.9) Dinamik SVG köy arka planı (oyuncu sayısı=ev sayısı, gece/gündüz, orman+dere)
    └── KarakterAnisiBaneri.jsx/css — (v1.8.31) Gece başı karakter anısı banner'ı

client/public/
└── favicon.svg               — (v1.9) Madalyon q + grup rengi yayları
```

### Beklenen ilk hamlen

Prototip canlıda; sıradaki iş Versiyon 1. Buğra muhtemelen şunlardan birini söyleyecek:

**Yeni özellik (V1)**: Kaosçular eklenmesi, B seçeneği (host rol havuzu tikleme), senaryo sistemi, köy olayları, özgün portreler, çoklu dil, vb. → Önce **Bölüm 18'in "Versiyon 1" başlığını** oku, kapsamı netleştir, sonra **plan ajanıyla** uygulama planı çıkar, Buğra'ya seçeneklerle sun, onay sonrası inşaata başla.

**Test / Bug avı**: Canlı sürümü uçtan uca oyna, yeni bug bulursan `buglar.md`'ye ekle.

**Master belge güncellemesi**: Buğra "tasarım kararı şöyle değişsin" derse, önce ilgili bölümü oku, onay al, sonra belgeyi güncelle.

İyi çalışmalar.

---

## 1. OYUNUN ÖZÜ

**Konsept:** İstanbul'dan kaçıp organik bir köye yerleşen farklı yaşam tarzlarına sahip insanların birlikte yaşamayı öğrenme/öğrenememe hikayesi.

**Kısa ad:** q

**Platform:** Web tabanlı, çok cihaz, WebSocket, mobil öncelikli. Prototip responsive tasarım ile hem masaüstü hem mobil browser'da çalışır.

**Oyuncu sayısı:** 6-12 kişi (prototip). Versiyon notları için bkz. Bölüm 18.

**Temel fark:** Klasik vampir/mafya oyunlarından farklı olarak şiddet, ölüm, savaş yok. Köyden uzaklaştırma oylama veya gelenekçi gece aksiyonu ile gerçekleşir. Gece aksiyonları oylamayı etkiler ama şiddet içermez.

**Slogan:** "Hepimiz bir şeyden kaçtık."

**Ton:** Organik köy hayatı, stressiz, sıcak — ama altında sosyal dinamikler var. Gergin değil, birlikte yaşama denemesi.

**Motto (geliştirme):** Basit ve hızlı anlaşılabilir.

---

## 2. NARRATİF

**Neden köy?** Herkes İstanbul'dan bağımsız sebeplerle kaçıp bu organik köye yerleşti. Kimse birbirini seçmedi — hepsi aynı köye kaçtı. Seçilmiş aile değil, aynı yere sığınan insanlar.

**Gelenekçilerin tanışma hikayesi (A+C modeli):**
- Necmi (Muhafazakâr) köyü buldu, kendi online topluluğuna paylaştı.
- Diğer Gelenekçiler o topluluktan geldi ama fiziksel olarak hiç tanışmamışlardı.
- Köyde ilk gece tanışma toplantısında birbirlerini fark ettiler.

**İpucu Sistemi:** Prototipte yok. V1'e saklandı.

---

## 3. GRUP YAPISI (5 Grup)

| Grup | Sembol | Açıklama | Birbirini bilir mi? | Ekip oynar mı? |
|------|--------|----------|-------------------|----------------|
| Özgürlükçüler | 🟢 | Kim olduklarıyla yaşayanlar | Hayır | Hayır |
| Tarafsızlar | 🟡 | Bireysel kazanma koşulları | Hayır | Hayır |
| Gelenekçiler | 🔴 | İdeolojik ekip | Evet | Evet |
| Outsider | ⚪ | Özgürlükçü tarafında ama zarar verir | Hayır | Hayır |
| Kaosçular | ⚫ | Bireysel antagonistler | Hayır | Hayır |

---

## 4. KAZANMA KOŞULLARI

- **Özgürlükçüler:** Tüm Gelenekçiler köyden ayrılırsa kazanır.
- **Gelenekçiler:** Tüm Özgürlükçüler köyden ayrılırsa kazanır.
- **Tarafsızlar:** Kendi gizli bireysel koşulunu tamamlarsa kazanır. Koşul tamamlandığında sistem bildirir ama oyun devam eder.
- **Kaosçular:** Kendi bireysel koşulunu tamamlarsa kazanır. Kazansa da kaybetse de oyun devam eder.
- **Outsider (Bastırmış):** Özgürlükçülerle aynı tarafta kazanır ama davranışlarıyla onları zayıflatır.

**Tarafsız ve Kaosçu bireysel koşulları:** Her rolün kazanma koşulu Bölüm 9'da rol açıklamasında verilir. Koşul tamamlandığında sistem **sadece o oyuncuya** bildirir (köye duyurulmaz). Oyun grup zaferi koşuluna kadar devam eder.

---

## 5. TAM ROL LİSTESİ

### 🟢 Özgürlükçüler (11 rol)
| # | Rol | Karakter | Yaş | Meslek |
|---|-----|----------|-----|--------|
| 1 | Gay | Deniz | 25 | İK Uzmanı |
| 2 | Lezbiyen | Ada | 27 | Doktor |
| 3 | Biseksüel | Elvin | 32 | Grafik Tasarımcı |
| 4 | Transseksüel | Devin | 28 | Yazar |
| 5 | İnterseksüel | Baran | 30 | Biyolog |
| 6 | Panseksüel | Maya | 29 | Mimar |
| 7 | Non-binary | Aren | 26 | İllüstratör |
| 8 | Crossdresser | Umut | 34 | Pilot |
| 9 | Drag Queen | Berke | 24 | Senarist |
| 10 | Femboy | Umay | 23 | Muhasebeci |
| 11 | Ladyboy | Lila | 21 | Eczacı |

### 🟡 Tarafsızlar (14 rol)
| # | Rol | Karakter | Yaş | Meslek |
|---|-----|----------|-----|--------|
| 13 | Hetero Erkek | Mehmet | 35 | Rock Müzisyeni |
| 14 | Hetero Kadın | Bahar | 28 | Dijital Pazarlama |
| 15 | Aseksüel | Irmak | 33 | Sosyal Medya Uzmanı |
| 16 | Çöpçatan | Hatice | 27 | Yönetici Asistanı |
| 17 | Fetişist | Kartal | 32 | Yazılım Mühendisi |
| 18 | Sugar Baby | Selin | 25 | Yarı Zamanlı Öğrenci |
| 19 | Sugar Daddy | Eren | 42 | İş İnsanı |
| 20 | Çapkın | Can | 41 | Spor Salonu Sahibi |
| 21 | Mazoşist | Beren | 32 | Psikoterapist |
| 22 | Dul | Fatma | 48 | Eski Ev Hanımı |
| 23 | Poliamorist | Ekin | 31 | Çevirmen |
| 24 | Fuckbuddy | Tuna | 26 | Bartender |
| 25 | Lovebuddy | Nehir | 28 | UX Tasarımcı |
| 26 | Situationship | Mert | 29 | Fotoğrafçı |

### 🔴 Gelenekçiler (8 rol)
| # | Rol | Karakter | Yaş | Meslek |
|---|-----|----------|-----|--------|
| 27 | Homofobik | Kaan | 45 | Motosiklet Kurye |
| 28 | Transfobik | Sinan | 39 | Lise Öğretmeni |
| 29 | Bifobik | Yasemin | 33 | Avukat |
| 30 | Erkek Düşmanı | Azra | 34 | Ürün Yöneticisi |
| 31 | Muhafazakâr | Necmi | 52 | Emekli Memur |
| 32 | Dinci | Hüseyin | 47 | İmam |
| 33 | Non-binary Karşıtı | Pınar | 38 | Hemşire |
| 34 | Cinsiyetçi | Oğuz | 44 | Esnaf |

### ⚪ Outsider (1 rol)
| # | Rol | Karakter | Yaş | Meslek |
|---|-----|----------|-----|--------|
| 12 | Bastırmış | Murat | 36 | Avukat |

### ⚫ Kaosçular (4 rol)
| # | Rol | Karakter | Yaş | Meslek |
|---|-----|----------|-----|--------|
| 35 | Narsist | Okan | 29 | Influencer |
| 36 | Sadist | Bora | 37 | Bakkal Sahibi |
| 37 | Sınır Tanımaz | Erdem | 42 | Seyyar Satıcı |
| 38 | Zorba | Hakan | 38 | İnşaat Müteahhidi |

---

## 6. TEKİL ROL KURALI

**v1.8'de kaldırıldı.** Aynı rolden birden fazla oyuncu olabilir; kategori bazlı kısıt yok.

Eski (v1.7'ye kadar) — kayıt olarak:
| Kategori | Roller |
|----------|--------|
| Heterolar | Hetero Erkek, Hetero Kadın → sadece biri |
| Fobikler | Homofobik, Transfobik, Bifobik → her biri ayrı, ama aynı türden birer tane |
| Boylar | Femboy, Ladyboy → sadece biri |
| Sugarlar | Sugar Baby, Sugar Daddy → sadece biri |
| Buddyler | Fuckbuddy, Lovebuddy → sadece biri |

Sadece **Kaan (Homofobik)** zorunluluğu korunur (master Bölüm 8) — her oyunda en az 1 kez dağıtılır.

---

## 7. PROTOTİP ROL SETİ (12 Rol)

Outsider ve Kaosçular prototipten çıkarıldı. V1'e saklandı.
Roller prototipte otomatik dağıtılır.

| Grup | Rol | Karakter |
|------|-----|----------|
| 🟢 Özgürlükçü | Gay | Deniz |
| 🟢 Özgürlükçü | Crossdresser | Umut |
| 🟢 Özgürlükçü | Drag Queen | Berke |
| 🟢 Özgürlükçü | İnterseksüel | Baran |
| 🟢 Özgürlükçü | Transseksüel | Devin |
| 🟢 Özgürlükçü | Ladyboy | Lila |
| 🟡 Tarafsız | Hetero Erkek | Mehmet |
| 🟡 Tarafsız | Situationship | Mert |
| 🟡 Tarafsız | Koca Karı | Fatma |
| 🔴 Gelenekçi | Homofobik | Kaan |
| 🔴 Gelenekçi | Muhafazakâr | Necmi |
| 🔴 Gelenekçi | Erkek Düşmanı | Azra |

**Not:** Karakter isimleri hikaye için verilmiştir. Sistemde oyuncunun lobiye girişte belirlediği isim kullanılır.
**Not:** Azra'nın aksiyonu için gereken cinsiyet bilgisi her karakterin rol kartından otomatik gelir.

---

## 8. ROL DENGE TABLOSU (Prototip — 12 Rol, 4-12 Oyuncu)

| Oyuncu | Özgürlükçü | Tarafsız | Gelenekçi | Toplam | Not |
|--------|-----------|---------|----------|--------|-----|
| 4 | 2 | 1 | 1 | 4 | Hızlı oyun |
| 5 | 2 | 2 | 1 | 5 | Hızlı oyun |
| 6 | 2 | 2 | 2 | 6 | |
| 7 | 3 | 2 | 2 | 7 | |
| 8 | 3 | 3 | 2 | 8 | |
| 9 | 4 | 3 | 2 | 9 | |
| 10 | 4 | 3 | 3 | 10 | |
| 11 | 5 | 3 | 3 | 11 | |
| 12 | 6 | 3 | 3 | 12 | |
| 13 | 6 | 4 | 3 | 13 | V1 (Outsider opsiyonel) |
| 14 | 7 | 4 | 3 | 14 | V1 |
| 15 | 7 | 4 | 3 | 15 | V1 (+1 Kaosçu) |

**Rol havuzu:** Az oyunculu oyunlarda 12 rolden oyuncu sayısına göre seçim yapılır.
**Kaan zorunlu (v1.7'ye kadar):** Kaan (Homofobik) her oyunda bulunurdu. **v1.8'de kaldırıldı** — host gelenekçi sayısını 0'a kadar düşürebilir. Oyun mekanikleri 0 gelenekçili senaryoyu doğal karşılar (Özgürlükçü/Tarafsız/Kaosçu/Outsider yalnız oynar).
**Gelenekçi üst sınırı:** 10+ oyuncuda 3'e çıkabilir.
**Tarafsız üst sınırı:** Prototip rol havuzunda 3 tarafsız rol var, 11-12 oyunculu oyunlarda da tarafsız 3'te kalır.
**Hızlı oyun (4-5 kişi, v1.5):** Sadece 1 gelenekçi (Kaan) olur. Kaan 1. gece doğru hedef seçerse oyun çok kısa biter — bu beklenen davranıştır.
**Host özelleştirme (v1.5):** Host lobide önerilen dağılımı override edebilir. Grup sayıları (yeşil/sarı/kırmızı) host tarafından ayarlanır, hangi spesifik rollerin geleceği gizli kalır. Toplam oyuncu sayısı ile eşleşmeli, gelenekçi ≥ 1 (Kaan zorunlu).

**V1 genişletme:** V1'de Outsider (1 rol) ve Kaosçular (1-2 rol) host tarafından açılabilir. 13+ oyuncuda denge tablosu yukarıdaki gibidir; Outsider açılırsa Özgürlükçü kontenjanından 1 düşer, Kaosçu açılırsa Tarafsız kontenjanından 1 düşer.

---

## 9. GECE AKSİYONLARI (Prototip)

### Evrensel Öncelik Sırası

| Öncelik | Aksiyon Türü | Kim |
|---------|-------------|-----|
| 1 | Engel | Gay (Gelenekçiye karşı) |
| 1.5 | Situationship karşılıklı iptal | Situationship |
| 2 | Transport | Crossdresser |
| 3 | Koruma | Drag Queen |
| 4 | Uzaklaştırma | Kaan |
| 5 | Diğer etkiler | Azra, Necmi, Koca Karı, Hetero Erkek, İnterseksüel, Ladyboy, DQ |

### Genel Kurallar
- Her gece kullanılır, her tur geçerlidir.
- Pas geçilebilir — seçim yapılmazsa otomatik pas.
- **Madde 1 (v1.2):** Gece görevleri süre sonuna kadar değiştirilebilir. Tıkla = anında gönder; aynı isme tekrar tıkla = iptal (pas).
- Aksiyon tamamlandıktan sonra: not defterine yazılabilir.
- **Kendine aksiyon yapılamaz:** sadece engel (Gay), koruma (DQ) ve uzaklaştırma (Kaan) için geçerli. Diğer tüm roller kendine aksiyon yapabilir.
- Aksiyon başarılı olsa da olmasa da hem oyuncu hem hedef sabah bilgilendirilir.

### 🟢 Özgürlükçüler

**Gay** — Gece bir kişiyi ziyaret eder.
- 🟢 → hedefin rolünü öğrenir
- 🟡 → hedefin o geceki aksiyonunu engeller
- 🔴 → o gelenekçinin gece aksiyonu iptal olur. Engel her zaman önce gelir (öncelik 1).
- Kendine aksiyon yapamaz.

**Crossdresser** — Gece kimin yerine geçeceğini seçer (kör seçim).
- Kaan o gece CD'nin seçtiği kişiyi hedef almışsa → CD ayrılır
- Kaan CD'nin kendisini hedef almışsa → seçtiği kişi ayrılır
- Araştıran rollere CD, seçtiği kişi olarak görünür
- Kendine aksiyon yapabilir

**Drag Queen** — Gece bir kişiyi "sahneye çıkarır."
- 🟢 → oyu 2 sayılır
- 🟡 → o oyuncuyu kimlerin ziyaret ettiğini öğrenir
- 🔴 → o gelenekçinin oyu sayılmaz
- Kendine aksiyon yapamaz
- DQ koruma: koruduğu kişi Kaan tarafından hedef alınmışsa Kaan'ın aksiyonu boşa çıkar

**İnterseksüel** — Gece bir oyuncuyu izler.
- Hedefin o gece kime aksiyon yaptığını öğrenir
- Kendine aksiyon yapabilir

**Transseksüel** — Köyden ayrılanlarla iletişimde kalır.
- Ayrılanlar Trans'a bilgi aktarabilir, Trans da onlara
- Bu kanal başka kimseye açık değildir
- v1.2: Sohbet panelinde bu mesajlar `ayrilan` kanalı olarak akar; sadece Trans + ayrılanlar görür

**Ladyboy** — Gece tüm ziyaretlerin listesini alır.
- "X, Y'yi ziyaret etti" formatında
- Kendine aksiyon yapabilir

### 🟢 Özgürlükçüler — V1 Yeni Roller

**Lezbiyen (Ada)** — Gece bir oyuncuyu "muayene" eder
- Hedefin grup rengini öğrenir (🟢/🟡/🔴)
- Bastırmış Murat → 🟢 görünür (Murat C kuralı, sahte özg)
- Öncelik 5; kazanma: grup zaferi; denge: rol değil grup okuması, bilgi yumuşak

**Biseksüel (Elvin)** — Gece iki oyuncu seçer ("iki dünyada görür")
- İkisinin de o gece aktif aksiyon yapıp yapmadığı bilgisi (yön ve hedef yok)
- Kendine seçim yapamaz; iki farklı oyuncu olmalı
- Öncelik 5; kazanma: grup zaferi; denge: aktivite haritası, isim ifşa etmez

**Panseksüel (Maya)** — Gece iki oyuncu seçer ("köprü kurar")
- Sistem: biri diğerini o gece ziyaret etti mi? (evet/hayır, yön belirtilmez)
- Kendine seçim yapamaz
- Öncelik 5; kazanma: grup zaferi; denge: ziyaret topolojisi, Ladyboy ile örtüşmesin

**Non-binary (Aren)** — Gece bir oyuncunun "kimliğini bulanıklaştırır"
- Hedef o gece araştıran rollere (Gay, Lezbiyen, İnter, Ladyboy, Pan, Bi vb.) "?" olarak görünür
- Engel/transport ile etkileşim: Aren araştırma sonucunu maskeler ama aksiyonu engellemez
- Öncelik 1.5 (Situationship ile aynı katman); kazanma: grup zaferi; denge: bilgi sansürü, geçici

**Femboy (Umay)** — Gece bir oyuncunun "hesabını tutar"
- Hedefin oyun başından itibaren kümülatif **aktif** gece aksiyonu sayısını öğrenir (pas dahil değil)
- Kendine aksiyon yapabilir
- Öncelik 5; kazanma: grup zaferi; denge: zaman içinde biriken bilgi, pas sayılmaz

### 🟡 Tarafsızlar

**Hetero Erkek** — Gece çay içmeye gider.
- 🟢 → o gece o oyuncuyu kimlerin ziyaret ettiğini öğrenir
- 🟡 → ikisi de boş gece geçirir
- 🔴 (Kaan) → ertesi gece Kaan'ın kime gideceğini belirler

**Situationship** — Gece birine "yapışır."
- 🟢/🟡 → ikisinin de gece aksiyonu iptal olur (karşılıklı koruma)
- 🔴 (Kaan) → Kaan'ı engelleyemez, sadece rolünü öğrenir

**Koca Karı** — Gece iki oyuncu seçer.
- İkisinin aynı grupta olup olmadığını öğrenir
- Sistem sadece "aynı/farklı" verir
- **Bireysel kazanma (v1.8):** 3 farklı "aynı grup" eşleşmesi yakalamak

### 🟡 Tarafsızlar — V1 Yeni Roller

**Hetero Kadın (Bahar)** — Gece bir oyuncuya "kahve ısmarlar"
- 🟢 → hedefin cinsiyetini öğrenir
- 🟡 → hedefin grup rengini öğrenir
- 🔴 (Kaan) → ertesi gece Kaan'ın kime gideceğini öğrenir
- Öncelik 5; kazanma: 2 farklı erkek + 2 farklı kadın hedef; denge: HE'nin kadın muadili, simetrik

**Aseksüel (Irmak)** — Gece bir oyuncunun "sosyal medyasını stalk eder"
- Hedefin önceki gece aksiyon türünü öğrenir (örn. "ziyaret", "izleme", "transport", "pas")
- Kendine aksiyon yapamaz
- Öncelik 5; kazanma: 3 farklı oyuncu için aksiyon tipi raporu; denge: kim değil ne bilgisi

**Çöpçatan (Hatice)** — Gece iki oyuncuyu "tanıştırır"
- İki hedef de bildirim alır: "Çöpçatan sizi tanıştırdı (X ile Y)"
- Aksiyon başka etkisi yok, sadece sosyal işaretleme
- Öncelik 5; kazanma: en az 2 eşleştirme oyun sonuna kadar birlikte köyde kalsın; denge: meta-sosyal mekanik

**Fetişist (Kartal)** — Gece bir oyuncunun "gizli fetiş etiketine" uyup uymadığını öğrenir
- Kartal oyun başında gizli bir "fetiş etiketi" alır (rastgele meslek grubu: ör. "üniformalı", "sanatçı", "patron")
- Hedef o etikete uyuyorsa "uyuyor", uymuyorsa "uymuyor" cevabı
- Öncelik 5; kazanma: 3 farklı oyuncuyu doğru "uyuyor" olarak tespit; denge: özel kriterli araştırma

**Sugar Baby (Selin)** — Gece bir oyuncudan "hediye ister"
- Hedefin grup rengini öğrenir (🟢/🟡/🔴)
- Aynı hedefe tekrar gidemez
- Öncelik 5; kazanma: 4 farklı oyuncudan hediye almak; denge: tekrar yasağı çeşitlilik zorlar

**Sugar Daddy (Eren)** — Gece bir oyuncuya "yatırım yapar"
- O oyuncunun ertesi gün oyu 2 sayılır
- DQ ile aynı hedefe denk gelirse max 2 (kümülatif değil)
- Öncelik 5; kazanma: 2 kez yatırım yaptığı oyuncu o gün köyden gönderilen kişiye oy versin; denge: ittifak kurma

**Çapkın (Can)** — Gece bir oyuncuya "tavla atar"
- Hedefin o geceki aksiyon hedefini (ismini) öğrenir
- Aynı hedefe tekrar gidemez
- Öncelik 5; kazanma: 3 farklı gece, 3 farklı hedef; denge: yön bilgisi, ama tekrar yasağı sınırlı

**Mazoşist (Beren)** — Gece bir oyuncuya "terapi" yapar
- Hedefin o gün aldığı oy sayısını öğrenir (kim oy verdi değil, sadece sayı)
- Kendine aksiyon yapabilir
- Öncelik 5; kazanma: Beren köyden ayrıldıysa otomatik kazanır (gizli tahmin yok); denge: tersine motivasyon

**Poliamorist (Ekin)** — Gece iki oyuncu seçer
- İkisinin rolünün ilk harfini öğrenir (örn. "G ve K")
- Kendine seçim yapamaz
- Öncelik 5; kazanma: 3 farklı oyuncunun rolünü doğru tahmin etmek (sistem onayı, sabah formu); denge: çoklu bilgi, yorumlama gerekir

**Fuckbuddy (Tuna)** — Gece bir oyuncuya "kısa ziyaret"
- Hedefin önceki gün aldığı oy sayısını öğrenir
- Öncelik 5; kazanma: 2 gece bilgi topla + sabah bir Gelenekçi olduğunu düşündüğü oyuncuyu işaretle; doğruysa kazanır; denge: bilgi + bir karar

**Lovebuddy (Nehir)** — Gece bir oyuncuya "bağ kurar"
- Aynı hedefe 2 gece üst üste gidilirse → karşılıklı rol değişimi (yalnız Nehir ile o oyuncu birbirlerinin rolünü öğrenir, gizli)
- Bağ kurduğu hedef Kaan/Necmi/Azra/diğer Gelenekçi ise bağ kurulur ama Nehir kaybetme riskine girer
- Öncelik 5; kazanma: en az 1 karşılıklı bağ + bağ kurduğu hedef oyun sonunda sağ kalsın; denge: 2 gece yatırım

**Situationship (Mert)** — kazanma koşulu eki
- **Bireysel kazanma (v1.8):** 3 gece üst üste aynı hedefe yapış + hedef sağ kalsın

**Dul (Fatma)** — v1.8.30 Aşama 3: Geçmiş Anısı Sor
- Gece bir oyuncudan "geçmiş anısını sor" — hedefin karakterinden (`client/src/veri/karakterAnilari.json`'dan) rastgele 1 hatıra cümlesi Dul'a gösterilir
- Aynı hedefe tekrar gidemez (çeşitlilik için — Sugar Baby/Çapkın gibi)
- Murat (Outsider) hedef alındığında: gerçek karakter Murat'ın anıları gösterilir (sahte rolüne rağmen — anı karakterin geçmişi, rol mantığından bağımsız; tasarım kararı)
- Öncelik: 5 (diğer Tarafsızlar gibi)
- Kazanma: 3 farklı oyuncudan anı toplamak (altyapı V1 kalan iş listesinde — `dulAnilarTopladi` state'i henüz yok, şu an "köyde kalmak" fallback v1.9'a kadar)
- Tasarım: hikaye-mekanik bağı (Bölüm 24.3 — hikayeler ana omurga, Aşama 3 ilk somut entegrasyon örneği)

### 🔴 Gelenekçiler

**Homofobik (Kaan) — Ekonomik Abluka**
- Her gece 1 kişi uzaklaştırılabilir
- Şiddet dili yok: ekonomik izolasyon, sosyal baskı
- Savunma: Gay (engel), DQ (koruma), CD (yerine geçme)
- Kendine aksiyon yapamaz

**Muhafazakâr (Necmi) — Sosyal Manipülasyon**
- Hedef oyuncu ertesi gün Necmi'nin oyladığı kişiye otomatik oy verir, değiştiremez
- Necmi oy vermezse hedef de kullanamaz
- Hedef ertesi gün köyde yoksa → etki kaybolur
- Kendine aksiyon yapabilir

**Erkek Düşmanı (Azra) — Kimlik Tespiti**
- Cinsiyet bilgisi rol kartından otomatik gelir
- Erkek oyuncuyu hedef alır → oyu sayılmaz
- Gay engeli iptal eder
- Kendine aksiyon yapabilir

### 🔴 Gelenekçiler — V1 Yeni Roller

**Transfobik (Sinan)** — Gece "veli toplantısı" yapar
- Hedef seçer; eğer hedef Trans/CD/DQ/Ladyboy/Femboy ise ertesi gün oylamada **savunmaya çıkamaz** (savunma süresi atlanır, doğrudan 2. oylamaya geçilir)
- Hedef kısıtı: sadece Özgürlükçü hedefler (Sonra İncele: serbest olsun mu)
- Öncelik 5; kazanma: grup zaferi; denge: kısmi susturma, sadece spesifik özg roller

**Bifobik (Yasemin)** — "Sözleşme hilesi"
- Hedef seçer; hedef Bi/Pan/Poli/Sit/FB/LB ise o oyuncunun ertesi gün verdiği oy **kendine geri döner** (kendine oy geçersiz sayılır → oy iptal)
- Öncelik 5; kazanma: grup zaferi; denge: spesifik kimlik hedeflemesi, oy gücü kırma

**Dinci (Hüseyin)** — "Ahlaki vaaz"
- Hedef seçer; hedef ertesi gece aksiyon yapamaz (otomatik pas)
- Hedef kısıtı: sadece Özgürlükçü ve Tarafsız hedefler (Sonra İncele: serbest olsun mu)
- Öncelik 5; kazanma: grup zaferi; denge: bir gecelik susturma, Gay engel ile simetrik

**Non-binary Karşıtı (Pınar)** — "Etiketleme"
- Hedef seçer; hedef NB/İnter/CD/Aren ise sabah o oyuncunun rolü **herkese ifşa olur** (sistem duyurusu)
- Diğer hedeflerde etki yok ("uymadı" sahte cevap Pınar'a gelmez, sadece sessiz)
- Öncelik 5; kazanma: grup zaferi; denge: rol ifşası ağır, hedef havuzu dar

**Cinsiyetçi (Oğuz)** — "Yer bilir"
- Hedef seçer; hedef kadın ise o oyuncunun **o gün Gelenekçi adayına verdiği oy 0** sayılır (sadece Gelenekçi adayına verilen oy iptal, diğer oylar geçerli)
- Öncelik 5; kazanma: grup zaferi; denge: koşullu oy yutma, kadın hedef + Gelenekçi adayı

### ⚪ Outsider

**Bastırmış (Murat) — "Murat C" varyantı**
- Oyun başında oyundaki **Özgürlükçü havuzundan rastgele bir rol** atanır; Murat'a rol kartında o rol gösterilir (örn. Gay, Lezbiyen, Pan)
- Murat o rolün arayüzüyle aksiyon yapar; "görev başarılı" sahte cevabı alır ama **gerçekte hiçbir şey olmaz** (aksiyon boşa düşer)
- Murat Outsider olduğunu bilmez, kendisini gerçek Özgürlükçü sanır
- Araştıran roller (Gay, Lezbiyen, İnter, Ladyboy, Ada vb.) Murat'ı araştırırsa **sahte Özgürlükçü rolünü** görür (Özgürlükçü kimliği korunur)
- Ziyaret sayılır (Ladyboy ziyaret listesinde, İnter hedef yön bilgisinde görünür) — etkisi yok ama görünür
- Öncelik 5; kazanma: Özgürlükçü grup zaferi (tüm Gelenekçiler köyden ayrılır) **+** Murat oyun sonunda hâlâ köyde olmalı; denge: yanlış yön bilgi yayar, ekip kararını saptırır

### ⚫ Kaosçular

**Narsist (Okan)** — "Spotlight"
- Hedef seçer; hedef ertesi gün **kimlik açıklama başvurusu yapamaz** (Faz 4 başvuru butonu grileşir)
- Okan ayrıca hedefin önceki günkü oyunun yönünü (kime oy verdiği) öğrenir
- Öncelik 5; kazanma: oyun sonunda kimlik açıklayanların ≥%50'sini (min 2 oyuncu) en az 1 kez spotlight'lamış olmak; denge: kimlik açıklama oyununu sabote eder

**Sadist (Bora)** — "Bozuk Sipariş"
- Hedef seçer; hedefin sabah panelinde sistem tarafından üretilmiş küçük bir aksilik notu görünür (3 jenerik varyasyondan rastgele: "bakkaldan aldığın ekmek küflüydü", "para üstün eksik geldi", "köpek havladı uyutmadı")
- Hedefin o gün ilk yazacağı sohbet mesajı **30 saniye gecikmeli** iletilir
- Diğer Kaosçularla aynı hedefte çakışırsa paralel işlenir (biri diğerini düşürmez)
- Öncelik 5; kazanma: en az 4 farklı oyuncuya Bozuk Sipariş + bu oyunculardan en az 2'si aynı gün 1. oylamada oy almış olmak; denge: yumuşak rahatsızlık, oylamaya yönlendirme

**Sınır Tanımaz (Erdem)** — "İzinsiz Giriş"
- Hedef seçer; hedefin o gece **kendi gece aksiyonu için yazdığı metni / hedef seçimini** (özet) öğrenir
- Hedef pas geçtiyse "X pas geçti" bilgisi
- Öncelik 5; kazanma: 4+ farklı oyuncuya İzinsiz Giriş; denge: derin bilgi, kazanma uzun

**Zorba (Hakan)** — "Baskı Mesajı"
- Hedef seçer + yasaklayacağı 2. bir oyuncuyu seçer; hedef ertesi gün 1. oylamada **o oyuncuya oy veremez** (o ismin oy butonu grileşir)
- Öncelik 4; kazanma: 2+ farklı oylamada yasakladığı oyuncu o gün en çok oyu alsın; denge: oylama yönlendirme, Kaan ile aynı öncelik katmanı

---

## 10. NOT DEFTERİ

- Her oyuncuya özel, oyun boyunca serbest not alınabilir.
- **(v1.3) Her faz / her zaman yazılabilir.** Gece aksiyonu kısıtı kaldırıldı; oyuncu istediği fazda istediği zaman not ekleyebilir.
- **(v1.3) Sağ üstte "📓" butonu** her ekranda görünür, basılınca not defteri modal olarak açılır. Hem masaüstü hem mobilde aynı UX.
- Oyuncu gece aksiyonu veya oylama sonucu köyden gönderildiğinde, not defteri herkese ifşa olur (otomatik açılan sonuç ekranında bir kez gösterilir).
- **(v1.3) Ayrılan oyuncuların not defterleri tekrar açılabilir.** Köyde olan ve ayrılan herkes, ayrılanların not defterlerini istediği zaman tekrar görüntüleyebilir (oyuncu listesinden veya not defteri modali içinden seçim).
- Botlar her gece kısa bir not yazar (havuzdan rastgele).

---

## 11. OYUN AKIŞI

### Faz 1 — Açılış Ekranı
- q logosu + slogan, isim girişi, "Oda Kur" / "Odaya Katıl" (5 haneli kod)

### Faz 2 — Lobi
- Oda kodu büyük görünür
- **Üst aksiyon bandı (Madde 2 — v1.2):** "+ Bot Ekle" + "Oyunu Başlat" butonları oyuncu listesinin **üstünde** sabit
- Oyuncu listesi (host rozeti, bağlantı durumu, kendi rozeti)
- "En az 6 oyuncu gerekli" uyarısı
- **Roller galerisi (Madde 3 — v1.2):** Lobi alt kısmında prototip 12 rolünün kart şeklinde özeti. Karta tıklayınca modal popup — rol kartının tam detayı

### Faz 3 — Rol Dağıtımı (10 saniye max — v1.5; v1.7'de 30 → 10 sn)
- Her oyuncu kendi rolünü görür: ad, grup, karakter, köye geliş motivasyonu, gece aksiyonu, kazanma koşulu
- "Anladım" butonu — herkes basınca devam
- **(v1.5; v1.7'de 30 → 10 sn)** Max 10 sn süre: süre dolarsa veya herkes "Anladım" basarsa otomatik tanışmaya geçer. Sağ üstte sayaç görünür.
- **Murat C özel notu (V1):** Bastırmış Murat rolü atanan oyuncuya **sahte Özgürlükçü rolü** gösterilir. Oyundaki Özgürlükçü havuzundan rastgele bir rol seçilip (örn. Gay, Lezbiyen, Pan) onun rol kartı Murat'a verilir. Murat o rolün arayüzüyle oyunu oynar; gerçek rolünün Outsider olduğunu bilmez. Detay: Bölüm 9 Outsider.

### Faz 4 — Tanışma Günü ☀️ (40 saniye)

**0–5sn — Başvuru penceresi** (v1.7 — 10sn'den 5sn'ye düşürüldü)
- "Kimliğini açmak ister misin?" banner'ı
- Başvur / Geri çek butonu
- Sayılar görünür, kimlikler gizli

**5. saniye — Sistem seçimi**
- Başvuranlardan N kişi rastgele seçilir (N = host'un belirlediği kimlik açıklama adedi, default 1; v1.7)
- Kimliği açıklanır (kalıcı)

**Kimlik açıklayan ilk gece korunur (v1.8):**
- Tanışmada kimliği açıklanan oyuncu(lar), **birinci gece** Kaan'a karşı otomatik korunur.
- Kaan o oyuncuyu hedef alırsa aksiyon boşa çıkar (sistem sabahta köye bildirir).
- Koruma sadece ilk gece için geçerli, sonraki gecelerde standart kurallar.

**5–40sn — Serbest tanışma**
- Sohbet panelinden açık konuşma
- Herkes "Hazır" derse erken geceye

### Faz 5 — Gece 🌙 (30 saniye)

Merkez içerik: gece aksiyon listesi (not defteri sağ üst 📓 butonundan modal olarak açılır — v1.3).
- Karanlık atmosfer, geri sayım
- Aksiyon sayısı (sayı, kim değil)
- Hedef seçimi: isme tıkla → anında gönder; aynı isme tekrar = iptal; Koca Karı'da 2 seçim
- Süre sonuna kadar hedef değiştirilebilir
- Sohbet panelinde:
  - Köyde olanlar (köy uyuyor) → yazamaz
  - Fobikler (Kaan + Necmi + Azra) → kendi aralarında "fobik" kanalında yazışır
  - Transseksüel → ayrılanlarla yazışır

### Faz 6 — Sabah + Tartışma ☀️

**Sabah bölümü** — Gece sonuçları (genel + kişisel) (30 saniye max — v1.5)
- Ayrılanlar varsa: rol ifşası + not defteri herkese açılır
- Kazanma kontrolü yapılır
- Host "Devam Et" → tartışma (veya bitiş)
- **(v1.5)** Max 30 sn süre: host basmazsa otomatik geçilir. Sağ üstte sayaç görünür.

**Tartışma bölümü** — host belirler (v1.8: 30/60/90/120/180/240 sn arasından)
- Default 120 sn
- Host lobide seçer
- Sohbet panelinden serbest konuşma
- Herkes "Hazır" derse oylamaya erken

### Faz 7 — Oylama ⚖️

**1. Oylama — 15 saniye**
- Her oyuncu bir kişi seçer (kendine oy yok, kendi adı görünür ama tıklanmaz)
- Necmi/Azra/DQ etkileri sunucuda uygulanır
- En çok oyu alan → savunma

**Son Savunma — 20 saniye**
- Hedef oyuncu kendini savunur
- **Madde 10+11 (v1.2):** "Hazır" butonu sadece savunulanda görünür/basılabilir. Sohbete sadece savunulan yazabilir; diğerleri okur

**2. Oylama — 10 saniye**
- Sadece 1. turda oy kullananlar katılır
- "Gitsin / Kalsın" (evet/hayır)
- %51 → ayrılma

**Oylama Sonucu — 20 saniye (v1.2 — yeni)**
- Birisi köyden ayrılırsa: 20 saniyelik sonuç ekranı açılır
- Ayrılan + rol ifşası + not defteri okuma süresi
- Herkes "Hazırım" derse geceye erken geçilir

**Kimse Gitmezse**
- "Kimse gitmedi" durumları: (a) 1. oylama eşitlikte → savunma çıkmaz, (b) 2. oylama %51 sağlamaz.
- İlk "kimse gitmedi" durumunda **bir kez** 60 saniyelik ek tartışma yapılır → tekrar oylama.
- Ek tartışma sonrası yine sonuç çıkmazsa: **direkt geceye**.
- Ek tartışma hakkı her gün için 1 ile sınırlıdır; yeni gün/gece başlangıcında yenilenir.

### Faz 8 — Bitiş

- Kazanan grup açıklanır, **arkaplan kazanan rengin soluk tonu** (yeşil/kırmızı/turuncu)
- **Tarafsız bireysel kazananlar üstte vurgulu kart** (gunes border)
- **Tüm roller tek liste, satır satır, herkes aynı ton** (gruplama başlığı yok, ayrılan-kalan ayrımı yok)
- **(v1.3) Sıralama:** Yeşil (Özgürlükçü) en üstte → Sarı (Tarafsız) ortada → Kırmızı (Gelenekçi) en altta. Grup başlığı/ayrımı eklenmez, sadece sıra rengi takip eder.
- Her satırda: isim + rol rengi noktası + rol/grup etiketi
- "Yeni Oyun" → aynı lobiye döner

---

## 12. EKRAN ÖZETİ

| Ekran | Süre | Hazır Butonu | Notlar |
|-------|------|-------------|--------|
| Rol Dağıtımı | 10sn max (v1.7) | "Anladım" | Süre dolarsa otomatik geçer |
| Tanışma | 5sn başvuru + 35sn | Evet | Max N kişi kimlik açar (host kontrolü, default 1; v1.7) |
| Gece | 30sn | Hayır (otomatik pas) | Tıkla=gönder, değiştirilebilir |
| Sabah | 30sn max (v1.5) | — | Host devam'a basar; süre dolarsa otomatik geçer |
| Tartışma | Host belirler (30/60/90/120/180/240 sn, default 120; v1.8) | Evet | — |
| 1. Oylama | 15sn | — | Anlık görünür |
| Son Savunma | 20sn | Evet (sadece savunulan) | Sohbet sadece savunulan |
| 2. Oylama | 10sn | — | Sadece 1. turda oy kullananlar |
| Oylama Sonucu | 20sn | Evet (herkes) | Not okuma süresi |
| Tekrar Tartışma | 60sn | Evet | Kimse gitmezse |
| Bitiş | — | — | Aynı lobi |

---

## 13. SÜREKLİ PANELLER (v1.2 — yeni mimari)

Faz 4–8 arası tüm ekranlar **3 kolonlu sabit yerleşim** içinde render edilir:

```
┌─────────┬─────────────────┬──────────┐
│ Oyuncu  │                 │          │
│ Listesi │                 │          │
│         │   Ana içerik    │  Sohbet  │
│  ─────  │   (ekrana özel) │   Paneli │
│         │                 │          │
│   Rol   │                 │          │
│  Kartı  │                 │          │
└─────────┴─────────────────┴──────────┘
                                       ✕ Çıkış (sağ üst)
```

**Sütun oranları (masaüstü):** 300px / 1fr / 380px
**Tablet (≤1100px):** 260px / 1fr / 320px
**Mobil (≤860px):** Sekmeli arayüz — alt çubukta "Köy / Oyun / Sohbet" sekmesi, aktif olan tüm yer kaplar.

**Aksiyon butonları (v1.3 + v1.5):**
- 📓 **Not Defteri** butonu — **Oyuncu Listesi başlık çubuğunda** (sol panelde). Hem masaüstü hem mobilde aynı yer. Modal açar (kendi notu + ayrılanların notları).
- ⚙️ **Ayarlar menüsü** (v1.5) — sağ üst köşede tek bir buton. Tıklanınca dropdown açılır: 🔊 Sesi Aç/Kapa · 🎚️ Ses Ayarları · ✕ Oyundan Çık. Daha önce ayrı butonlar olan ses + ses ayarları + oyundan çık bu menüde toplandı.
- Mobilde Ayarlar menüsü yalnızca **"Köy/Rol" sekmesinde** görünür (Oyun sekmesindeki sayaç ile çakışmasını engeller). Bitiş ekranında her zaman görünür.

### Oyuncu Listesi
- Tek satır: isim solda, rol/durum sağda
- "Köyde" + "Ayrılanlar" iki bölüm
- Ayrılanlar üstü çizik
- Kimliği açıklanmış / ayrılmış olanların rolü görünür
- Ayrılan oyuncular **tüm rolleri** görür
- Başlığa tıkla → toggle (aç/kapa)

### Rol Kart Paneli
- Rol bilgisi: ad, grup, karakter (yaş/meslek), köye geliş (motivasyon), gece aksiyonu, kazanma koşulu
- Başlığa tıkla → toggle (aç/kapa, varsayılan açık)
- **(v1.3) "Diğer Roller →" butonu** — modal popup açar, oyun havuzundaki tüm rollerin galerisi (lobi'dekiyle aynı). Her karta tıklayınca detay açılır.

### Sohbet Paneli
- Tüm fazlarda görünür
- **Kanal mantığı server tarafında**:
  - `koy` — köyde olan herkes + ayrılanlar görür (ayrılanlar köy mesajlarını okur ama yazamaz)
  - `fobik` — sadece Kaan + Necmi + Azra (gece kanalı)
  - `ayrilan` — sadece ayrılanlar + Trans (ayrılan kanalı; köydekiler **göremez**)
- Yazma yetkisi: faz + role göre otomatik:
  - Gündüz + köyde → `koy`
  - Gece + fobik → `fobik`
  - Gece + diğerleri → yazamaz ("köy uyuyor")
  - Gece + Trans → ayrılanlarla yazışır (`ayrilan`)
  - Savunma → sadece savunulan
  - Ayrılan → `ayrilan` kanalı

---

## 14. MEKANİK KARARLAR

**Kimlik Açıklama:** Tanışma'da max 1 kişi. Kimse başvurmazsa kimse açıklamaz.

**Cinsiyet Sistemi:** Her rolün cinsiyeti hikayesinde tanımlı. Oyuncular cinsiyet giremez. Azra bilgiyi sistemden alır.

**Gece Aksiyonları:**
- Zorunlu değil, süre dolunca otomatik pas
- **v1.2: Süre sonuna kadar değiştirilebilir; aynı isme tıkla = iptal**
- Tıkla = anında gönder (Gönder butonu yok)
- Kendine aksiyon: sadece Gay/DQ/Kaan hariç herkes yapabilir

**Oylama:**
- Beraberlikte kimse gitmiyor
- %51 çoğunluk
- Anlık görünür, geri çekilebilir
- Kendine oy verilemez (kendi adı görünür ama tıklanmaz)
- İlk turda oy kullanmayanlar 2. turda da kullanamaz
- Kim kime oy verdi açık

**Köyden Ayrılma:**
- Gece: Kaan
- Gündüz: oylama
- Not defteri herkese açılır
- Rolü açıklanır
- Sohbet kanalında ayrılanlar bölümü açılır

**Şiddet Dili:** Yok. "Köyden ayrılma", "ekonomik baskı" kullanılır.

---

## 15. KENAR DURUMLAR

### Bağlantı
| Durum | Karar |
|-------|-------|
| Oyun başladıktan sonra kopma | Köyden ayrılır, geri dönüş yok |
| Oyun sırasında "Oyundan Çık" (v1.3) | Köyden ayrılır. Sohbete sistem mesajı: "X oyundan ayrıldı". Oyuncu listesinde "(oyundan ayrıldı)" ibaresi görünür. Host transferi ve gerçek-oyuncu kontrolü tetiklenir. |
| Host kopar | Sıradaki gerçek oyuncuya geçer |
| Host köyden ayrılır (Kaan / oylama) | Sıradaki **gerçek** oyuncuya host görevi geçer, oyun devam eder. Bot host olmaz. |
| Köyde gerçek oyuncu kalmazsa | Oyun otomatik biter, bitiş ekranı açılır. Kazanan grup şu kurala göre belirlenir: köyde kalan Özgürlükçü ve Gelenekçi sayısı karşılaştırılır → çoğunluk grup kazanır, eşitlikte Özgürlükçüler kazanır. Köyde kalan Tarafsızlar da bireysel olarak kazanır (her durumda). |
| Lobide kopar | Tekrar girebilir |

### Mekanik
- **Necmi:** Hedef ayrıldıysa etki kaybolur. Beraberlikte belirleyici olabilir
- **CD öncelik:** koruma → transport → Kaan
- **DQ koruma:** Korunan Kaan hedefiyse Kaan boşa çıkar
- **Gay engel:** Tüm Gelenekçi aksiyonları iptal (öncelik 1)
- **Gay + CD:** Transport öncelikli — Gay yerine geçeni görür
- **DQ + CD:** CD öncelikli
- **HE + Kaan:** HE gündüz ayrılırsa görev boşa
- **Sit + Kaan:** Engellenemez, sadece rol öğrenilir
- **Azra + erkek olmayan:** Aksiyon boşa

---

## 16. GÖRSEL DİL

**Kısa ad:** q
**Slogan:** "Hepimiz bir şeyden kaçtık."
**Ton:** Sıcak, organik, köy hayatı — stressiz ama sosyal dinamikler mevcut

### Tipografi
| Katman | Font | Kullanım |
|--------|------|----------|
| Başlık | Lora Semibold | Logo, ekran adları |
| Alıntı | Lora Italic | Slogan, rol motivasyonu |
| UI | System sans-serif | Butonlar, chat, formlar |

**Caveat (el yazısı) yok.**

### Renk Paleti (CSS değişkenleri) — v1.9 sıcak parşömen/ahşap

> v0.4–v1.8 mavi-yeşildi; **v1.9'da sıcak piksel-art palete geçildi.** Aşağıdaki `client/src/index.css` canlı değerleridir.

| Değişken | Hex | Kullanım |
|----------|-----|----------|
| `--gokyuzu` | #ecdcb4 | Ana arkaplan (gündüz) — parşömen |
| `--deniz-acik` | #e8d6ad | Yüzey, kart kenarı — açık ahşap |
| `--deniz` | #9a6532 | Aksan, border — ahşap kahve |
| `--derin` | #3d2b1c | Metin — koyu kahve |
| `--gunes` | #e0892b | Vurgu — altın/güneş |
| `--gece` | #2d2236 | Gece arkaplanı — sıcak koyu mor-kahve |
| `--ayisigi` | #e2cd9f | Gece aksanı — açık parşömen |
| `--parsomen` | #fbf3dd | Açık panel zemini |
| `--ahsap` | #9a6532 | Ahşap çerçeve |
| `--ahsap-koyu` | #5c3a17 | Kalın kenar / gölge |

**Piksel-art sert gölgeler:** `--golge-yumusak: 0 0 0 1px var(--ahsap), 0 2px 0 rgba(92,58,23,.18)` · `--golge-orta: 0 0 0 2px var(--ahsap), 0 5px 0 rgba(92,58,23,.22)`

### Grup Renkleri (değişmedi — oyun mantığı)
| Grup | Renk |
|------|------|
| Özgürlükçüler | `#06A77D` (yeşil) |
| Tarafsızlar | `#F4A261` (turuncu) |
| Gelenekçiler | `#E63946` (kırmızı) |

### Tasarım Kuralları
1. Ton sıcak ve organik; **piksel-art his** (sert gölge, ahşap çerçeve, parşömen zemin)
2. Gündüz: gokyuzu (parşömen) zemin. Gece: gece (koyu mor-kahve) zemin
3. Grup renkleri sadece chip/etiketlerde
4. Kırmızı sadece Gelenekçi grubu için
5. Bitiş ekranı kazanan grubun soluk tonunu kullanır
6. **(v1.9)** Oyun ekranı arka planında dinamik köy sahnesi; üstteki paneller yarı saydam (rgba ~0.86) ki köy görünsün

### Görsel Varlıklar (v1.9)
- **Logo:** `client/src/Logo.jsx` — yatay SVG (madalyon q dairesi + "Queer Quest Quench" + gökkuşağı şeridi)
- **Favicon:** `client/public/favicon.svg` — madalyon q + 3 grup rengi yayı
- **Köy sahnesi:** `client/src/bilesenler/KoySahnesi.jsx` — kod-üretimli SVG; dağ/tepe/orman/dere/köprü/çeşme/kıraathane + evler. Props: `gece` (bool), `oyuncuSayisi` (sayı=ev sayısı)
- **Rol kartı 2.5D:** `RolKartiEkrani.jsx/css` — `perspective` + `preserve-3d` + `backface-visibility` ile kapalı ahşap kart, dokununca `rotateY(180deg)`

### Sesli Dil (v1.4)

Müzik queer kültür ↔ sosyal dedüksiyon damarı: sinsi gizem + gerilim + pizzicato oyunsuluk. Referans aralığı: Among Us, Town of Salem, Blood on the Clocktower, Feign.

- **Tercih:** Pizzicato sneaky/mystery loop, soft synthwave (gece), disco/funky (özgürlükçü zaferi), bağlama (gelenekçi zaferi).
- **Yasak:** Ambient/relaxing fon, heteronormatif country/folk, agresif rock/EDM/metal, klişe fantastik orkestra senfonik, hetero romantik pop.
- **İstisna:** Gelenekçi zaferi için Anadolu halk müziği bilinçli tematik tercihtir (Gelenekçi dünya görüşü kazandı).

Detay için bkz. **Bölüm 20 — Ses & Müzik**.

---

## 17. TEKNİK MİMARİ

### Prototip Yığını
| Katman | Prototip | V1 hedefi |
|--------|----------|-----------|
| Frontend | React 19 + Vite | + TypeScript |
| Backend | Node.js + Express 5 | + TypeScript |
| Gerçek zamanlı | Socket.io 4 | Aynı |
| Veritabanı | RAM | Redis + PostgreSQL |
| Dil | Türkçe (i18n yok) | i18next |
| Deploy | Railway / Fly.io | Aynı |

### Kritik Kararlar
- **Veri güvenliği:** Rol bilgisi sadece sunucuda. Client kendi rolünü ve görmesi gerekenleri alır
- **Sohbet kanal güvenliği:** Server her client'a sadece görmesi izinli mesajları yollar (filtreleme server tarafında)
- **Oda sistemi:** 5 haneli kod, RAM'de tutulur
- **Zamanlayıcılar:** Sunucu taraflı
- **Responsive:** Hem masaüstü hem mobil browser

### Çalıştırma
- Kök `npm run dev` → sunucu (3001) + istemci (5173)
- Tek kurulum: `npm run kur`
- Test süreleri env ile override edilir

---

## 18. VERSİYON DURUMU

### Prototip Geliştirmesi (✅ Tamamlandı — v1.0 → v1.7, canlıda)

**Canlı URL:** https://q-11.up.railway.app

**Oyun Akışı (8 faz)**
- ✅ Faz 1 — Açılış (isim girişi, oda kur/katıl, 5 haneli kod)
- ✅ Faz 2 — Lobi (kod kartı, üst aksiyon bandı, "Önerilen Dağılım" + "Roller" popup butonları)
- ✅ Faz 3 — Rol Dağıtımı (30 sn otomatik geçiş sayacı)
- ✅ Faz 4 — Tanışma (5 sn başvuru + 35 sn serbest, host kimlik açıklama adedi belirler 0-3, default 1; v1.7)
- ✅ Faz 5 — Gece (30 sn, tıkla=anında gönder, süre sonuna kadar değiştirilebilir)
- ✅ Faz 6 — Sabah (30 sn otomatik geçiş sayacı) + Tartışma (120 sn)
- ✅ Faz 7 — Oylama (1. tur + savunma + 2. tur + sonuç 20 sn + tekrar tartışma 60 sn max 1 kez)
- ✅ Faz 8 — Bitiş (kazanan grup tonu + tek liste yeşil→sarı→kırmızı sıralı)

**Gece Motoru (11 rol mekaniği)**
- ✅ Gay engel · Crossdresser transport · Drag Queen koruma+oy etkileri
- ✅ İnterseksüel izleme · Transseksüel ayrılan kanalı · Ladyboy ziyaret listesi
- ✅ Hetero Erkek (Kaan görevi dahil) · Situationship karşılıklı koruma · Koca Karı dedikodu
- ✅ Homofobik Kaan uzaklaştırma · Muhafazakâr Necmi oy manipülasyonu · Erkek Düşmanı Azra oy iptali
- ✅ Öncelik sırası: engel → karşılıklı iptal → transport → koruma → uzaklaştırma → diğer

**Sürekli Paneller (3 kolonlu mimari)**
- ✅ OyunDuzeni (sol oyuncular+rol, orta içerik, sağ sohbet; mobilde alt sekme)
- ✅ SohbetPaneli (3 kanal: köy / fobik / ayrılan + Trans)
- ✅ OyuncuListesi (köy + ayrılanlar bölümü, mini avatar, toggle)
- ✅ RolKartPaneli (motivasyon + "Diğer Roller" modalı)
- ✅ Not Defteri Modalı (📓, her fazda yazılabilir, ayrılanların notları okunabilir)

**Bot Sistemi**
- ✅ Otomasyon (rol onay, başvuru, hazır, gece aksiyon, oylama, savunma hazır)
- ✅ Faz-bazlı konuşma havuzları: 60+ mesaj (tanışma/sabah/tartışma/oylama özel)
- ✅ Şüphe (%35 olasılık, 20 kalıp) · Cevap (30 kalıp) · Gece notu (16 kalıp)
- ✅ Bot soru cevap: ? veya bot ismi geçerse %100, 3-9 sn gecikme, Türkçe-aware (`İnci` ↔ `inci`)

**Host Kontrolü (lobide)**
- ✅ Grup dağılım paneli (+/− anlık apply + auto-balance, Kaan ≥ 1 korunur)
- ✅ "Önerileni Uygula" butonu (varsayılan dengeye dönüş)
- ✅ Önerilen dağılım tablosu (4-12 oyuncu, statik popup)
- ✅ Host transfer + erken bitiş kontrolü (gerçek oyuncu kalmazsa kazanan grup hesaplanır)

**Mobil & UI**
- ✅ Responsive (alt sekme barı: Köy/Rol · Oyun · Sohbet)
- ✅ `dvh` birimi (mobil tarayıcı çubuğu uyumu)
- ✅ Ayarlar menüsü ⚙️ (ses aç/kapa + ses ayarları + oyundan çık tek dropdown'da)
- ✅ Bitiş ekranı (kazanan tonu gradient + tek liste + tarafsız vurgu)
- ✅ Min 4 oyuncu desteği (denge tablosu 4-12, 4-5 "hızlı oyun")

**Ses Katmanı**
- ✅ 11 müzik parçası (gündüz×3 / sabah / gece×2 / savunma×2 / bitiş-özg / bitiş-gel) + crossfade
- ✅ 6 UI efekti (tıkla / oylama / bildirim / ayrılma / kazan / notdefteri)
- ✅ Ses Ayarları Modalı (Ana Ses / Müzik / Efekt slider, localStorage kalıcı)
- ✅ Mobil autoplay yönetimi ("Sesi Aç" ilk-kez butonu)
- ✅ Bildirim sesi mention-bazlı (yalnızca bana tag gelirse çalar, bot kalabalığı sessiz)

**Karakter Görselleri**
- ✅ 12 karakter portresi (Kenney "Toon Characters" CC0 + 6 baz yüz, CSS filter farklılaştırma)
- ✅ `KarakterPortresi` bileşeni (onError → emoji fallback)
- ✅ Yerleştiği yerler: rol kartı (108px), lobi galerisi (48px), rol popup (96px), oyuncu listesi (28px), sabah ayrılan kartı (52px), bitiş tüm roller (36px)

**Görsel Animasyonlar**
- ✅ Açılış gradient hareketi (18 sn döngü, parıltı katmanı)
- ✅ Gece/gündüz arka plan crossfade (2 sn yumuşak geçiş)
- ✅ Bitiş partikül efekti (kazanan gruba göre: 🍃 özg, 🚩 gel, ⭐ tarafsız)
- ✅ `prefers-reduced-motion` saygısı

**Bug Düzeltmeleri**
- ✅ Bug #1 — Host köyden ayrılınca sabah donması (host transfer + erken bitiş kontrolü)
- ✅ Bug #2 — 1. oylama eşitlikte sonsuz ek tartışma döngüsü (max 1 ek tartışma, sonra direkt geceye)
- ✅ Bug #3 — Mobilde ses ayarları slider'ları tepki vermiyor (touch-action: pan-x + thumb 24px + onTouchEnd stopPropagation, v1.7)

**Deploy**
- ✅ Railway canlı yayında, GitHub main branch auto-deploy

**v1.7 Yenilikleri (2026-05-16)**
- ✅ Açılış ekranı yeniden düzen — isim alanı ortak ve ayrı, "Oda Kur" + "Odaya Katıl" altta iki net kart
- ✅ Kimlik açıklama adedi host kontrolü (0/1/2/3) — lobide seçilir, tanışma fazı banner'ı yansıtır
- ✅ Başvuru süresi 10 sn → 5 sn (Faz 4)
- ✅ Bug #3 mobil ses slider düzeltildi
- ✅ "Odaya Katıl" UX — buton sadece kod yazılınca aktif, isim boşsa net uyarı + focus

**v1.8 Yenilikleri (2026-05-17/18) — 20 alt commit (v1.8 → v1.8.20)**

*Yeni roller ve gece motoru (Aşama 1–5):*
- ✅ 28 yeni rol kodlandı: 1 Outsider (Bastırmış Murat — sahte Özg rolüyle oynar) + 5 Özgürlükçü (Lezbiyen Ada, Bi Elvin, Pan Maya, NB Aren, Femboy Umay) + 12 Tarafsız (HK Bahar, Aseksüel Irmak, Çöpçatan Hatice, Fetişist Kartal, SB Selin, SD Eren, Çapkın Can, Mazoşist Beren, Dul Fatma, Poli Ekin, FB Tuna, LB Nehir) + 5 Gelenekçi (Sinan, Yasemin, Hüseyin, Pınar, Oğuz) + 4 Kaosçu (Okan, Bora, Erdem, Hakan)
- ✅ Aren maskelemesi: hedef o gece araştıran rollere "?" görünür (öncelik 1.5)
- ✅ Bireysel kazanma izleyicileri: Murat (Özg zaferi + köyde), Mazoşist (ayrıldıysa otomatik), 5 spesifik Tarafsız (SB/Çapkın/Çöpçatan/LB), 4 Kaosçu
- ✅ Diğer 9 Tarafsız rol için fallback "köyde kalmak" (state altyapısı sonraki sürümde)

*Host kontrol yetkileri (lobide):*
- ✅ Outsider + Kaosçu satırları host panelinde (0-1 / 0-3)
- ✅ Tartışma süresi dropdown (30/60/90/120/180/240 sn)
- ✅ Gece/Sabah/Savunma süresi dropdown'ları (10/20/30/40 sn)
- ✅ Kişi engelleme: lobide host her gerçek oyuncuya × buton, engellenen tekrar giremez (oda boyunca kalıcı)

*Oyun mekaniği:*
- ✅ Kaan zorunluluğu kaldırıldı — gelenekçi sayısı 0 olabilir. Eğer gelenekçi > 0 ise Kaan **grup içi favori** olarak seçilir (kod: `roller.js` Kaan rolünde `zorunlu: true` flag'i bu davranışı sağlar). v1.8.33'te netleştirildi.
- ✅ Tekil kural kaldırıldı (aynı rolden birden fazla oyuncu olabilir)
- ✅ Kimlik açıklayan ilk gece Kaan'a karşı otomatik korunur

*UI / UX:*
- ✅ 12 oyuncu üst sınırı kaldırıldı (max 99, formül 16+ için)
- ✅ Önerilen dağılım popup → inline (sürekli açık, lobide)
- ✅ Önerilen dağılıma Outsider (7+) ve Kaosçu (10+/13+) dahil
- ✅ Rol popup yapısı yenilendi: "Karakterin Hikayesi" (Kim?/Neden geldin?/Ne yapmak istiyorsun?) + "Oyundaki Görevin" (Ne yaparsın?/Nasıl kazanırsın?)
- ✅ 38 karakter için burç eklendi (tematik atama)
- ✅ Tüm rol kartları (RolKartiEkrani + RolKartPaneli + RolDetayPopup) aynı tasarım
- ✅ Roller galerisi 5 grup başlık altında (yeşil → sarı → kırmızı → beyaz → siyah)
- ✅ Rol kartında sadece portre + rol adı (karakter ismi/grup sembolü gizli, detay popup'ta)
- ✅ Bitiş ekranı sıralaması: Özg → Tar → Gel → Outsider → Kaoscu
- ✅ "Diğer Roller" butonu rol kart paneli kapatılsa da görünür
- ✅ Dağılımı Özelleştir paneli sabit açık (host için), toplam eşleşmezse "Oyunu Başlat" pasif + uyarı

*Belgeler:*
- ✅ `hikayeler-v1.md` — 38 karakter için kısa + uzun roman tarzı hikaye (85 KB)
- ✅ `faz1-mekanik-kararlar.md` — 38 rol mekaniği + 13 onaylanan karar + sonra incele listesi
- ✅ Master belge Bölüm 4/6/8/9/11/12/18/21 güncellendi (Outsider/Kaosçu, tekil kuralı kaldırma, host kontrolleri, Kaan zorunluluğu kaldırma)

**v1.8.30 Yenilikleri (2026-05-19) — Hikaye Geliştirme (Aşama 1.5)**

*Strateji değişikliği (Buğra kararı):* Karakter hikayeleri arka plan değil **ana ürün omurgası** — oyun + roman + kutu oyunu üçlüsünün temeli. Bölüm 24 "Genişletilmiş Medya Vizyonu" eklenecek (Aşama 2).

*Hikaye dosyası v2:*
- ✅ `hikayeler-v2.md` oluşturuldu (v1 arşiv olarak korundu)
- ✅ Rol ifşa yumuşatma — 6 karakter, 8 cümle (Murat, Pınar, Okan, Bora, Hakan, Erdem'in rolünü doğrudan söyleyen kelimeler örtükleştirildi; davranış kalır, kelime gider)
- ✅ 5 Tarafsız etiket başlıklara eklendi (Selin SB, Eren SD, Can Çapkın, Beren Mazoşist, Fatma "Koca Karı" → **"Dul"** yeniden adlandırma)
- ✅ Oğuz cinsiyetçi tutum — hikayeye 2 sahne eklendi (mahalledeki kızlar + pazar yeri kadın seçimi) A+C modeline uygun, rol-hikaye uyumu sağlandı

*Coğrafya çeşitliliği (%80 Türkiye + %20 yurt dışı, 22 karakter revize):*
- ✅ İstanbul yoğunluğu: 30 → 13 karakter (yoğunluk %43'e indi)
- ✅ Türkiye 12 büyük şehir dağılımı: Ankara 3 (Deniz, Bahar, Umay), İzmir 3 (Baran, Nehir, Berke-doğum), Bursa 2 (Hatice, Murat), Antalya 1 (Can), Konya 1 (Sinan), Kayseri 1 (Yasemin), Trabzon 1 (Fatma), Eskişehir 1 (Umut-doğum), Gaziantep 1 (Oğuz), Samsun 1 (Pınar), Mersin 1 (Lila), Adana 1 (Beren)
- ✅ 7 karakter yurt dışı: Berlin 2 (Devin diaspora, Berke aşk yolu), Amsterdam (Kartal), Viyana (Ekin), Paris (Mert), Londra (Irmak), Köln (Eren diaspora). Karakter isimleri Türk kalır — diaspora veya uzun yıl yurt dışı yaşamış Türk.

*Sınıf çeşitliliği:*
- ✅ 9 karakter alt-orta sınıf vurgusu (Lila, Selin, Kaan, Oğuz, Erdem, Bora, Pınar, Tuna, Mehmet) — önceki 4'ten %125 artış
- ✅ Sınıfsal yorgunluk metinlerde belirgin (hemşire maaşı, gece vardiyası, kira sorunu, esnaf çöküşü)

*Geliş kalıbı çeşitliliği (5 yeni kalıp — "şehirde tükendi → ayna → bavul → köy" şablonu kırıldı):*
- ✅ "Köyde doğdu, hiç gitmedi" — Bora (en büyük değişiklik, 37 yıllık köy yerlisi olarak yeniden örüldü)
- ✅ "Atalarından kalan / ucuza kapatılmış arsa" — Hakan (mevcut detay öne çıkarıldı)
- ✅ "Aşk için gitti, dönüş yolunda" — Berke (Berlin-Cem hikayesi entegre edildi)
- ✅ "İş icabı geldi, kaldı" — Erdem (tükenmişlik anı yok, sezgi)
- ✅ "Yurt dışı dönüş yolunda durdu" — Kartal (Amsterdam → Türkiye yolu)
- Eski şablon ~33 karakterden ~25-26'ya indi

*Yeni rol:*
- ✅ **Dul (Fatma)** — Bölüm 5 ve Bölüm 9'da güncellendi; gece mekaniği v1.8.31'de tanımlandı ("geçmiş anısı sor" — aşağıda)

**v1.8.31 Yenilikleri (2026-05-19) — Hikaye-Mekanik Entegrasyon (Aşama 3 başlangıç)**

*Aşama 3'ün ilk 3 alt parçası tamamlandı (kalan: B seçeneği — Alt Parça 4):*

- ✅ **Karakter anıları (faz banner)** — Her gece ekranı açılışında oyuncu kendi karakterinden 1 hatıra cümlesi üst banner'da görür (800ms gecikme + 5.5sn göster + 600ms fade out). Yeni dosya `client/src/veri/karakterAnilari.json` (38 karakter × 5 anı = 190 alıntı). Yeni component `KarakterAnisiBaneri.jsx/css`. Atmosfer derinleşir, hikayeler oyunda canlı.

- ✅ **Necmi forum bağı (gelenekçi rol kartı)** — Server `rol:kart` emit'inde gelenekçi gruba `forumTanidikSayisi` ek bilgi gönderir (kendisi hariç gelenekçi sayısı). Rol kartı (`RolKartiEkrani.jsx`) ve sürekli panel (`RolKartPaneli.jsx`) gelenekçiye özel "Necmi'nin Forumu" notu gösterir. Bilgi vermez, atmosfer + paranoya katar. Denge bozmaz. Mevcut "fobik" sohbet kanalı (3 kişi) değişmez.

- ✅ **Dul gece mekaniği (geçmiş anısı sor)** — Eski "Koca Karı" iki hedef + grup karşılaştırma mekaniği değişti. Yeni: tek hedef seç, hedefin karakterinden `karakterAnilari.json`'dan rastgele 1 anı sabah Dul'a özel mesajda. Aynı hedefe tekrar gidemez. Murat hedef olunca: gerçek karakter Murat'ın anıları gösterilir (sahte rol etkilemez — anı karakterin gerçek geçmişi). Kazanma altyapısı v1.9'da (şu an "köyde kalmak" fallback). `roller.js`, `geceMotoru.js`, `server/index.js`, `GeceEkrani.jsx` güncellendi.

*Hikaye-mekanik bağı (Bölüm 24.3):*
Aşama 3 Alt Parça 1 ile 3 birbirini tamamlar: oyuncu kendi karakterinin anısını gece başında görür (içsel atmosfer), Dul başkalarının anılarını ister (sosyal mekanik). Hikayeler hem atmosfer hem mekanik veri kaynağı.

*Kalan iş (önceki):* B seçeneği vardı — v1.8.32'de tamamlandı (aşağıda).

**v1.8.32 Yenilikleri (2026-05-19) — B Seçeneği: Host Rol Havuzu (Aşama 3 son alt parça)**

*Aşama 3 — 4/4 alt parça tamamlandı:*

> **Düzeltme (v1.9'da):** Bu liste eskiden Alt Parça 2 ve 3'ü "🔲 henüz kodlanmadı" gösteriyordu; bu **yanlıştı** — ikisi de v1.8.31'de kodlanmıştı (koddan doğrulandı: `forumTanidikSayisi` → `server/index.js` + `RolKartiEkrani.jsx` + `RolKartPaneli.jsx`; Dul `karakterAnilari` → `server/geceMotoru.js`). Aşama 3 **tam** (4/4).

- ✅ **Alt Parça 1: Faz-bazlı Karakter Anıları** (v1.8.31) — `KarakterAnisiBaneri.jsx/css` + `karakterAnilari.json` (190 alıntı, 38 karakter × 5) + `GeceEkrani.jsx` entegrasyon. Gece başında oyuncu kendi karakterinden 1 cümle banner görür.
- ✅ **Alt Parça 2: Necmi Forum Bağı** (v1.8.31) — Server `rol:kart` emit'inde gelenekçi gruba `forumTanidikSayisi` (kendisi hariç gelenekçi sayısı) gönderir; rol kartı + sürekli panel gelenekçiye özel "Necmi'nin Forumu" notu gösterir. Bilgi vermez, atmosfer/paranoya katar. **Kodlandı.**
- ✅ **Alt Parça 3: Dul Rolünün Gece Mekaniği** (v1.8.31) — Fatma tek hedef seçer, hedefin karakterinden `karakterAnilari.json`'dan rastgele 1 anı sabah Dul'a özel mesajda gelir; aynı hedefe tekrar gidilemez. `roller.js`/`geceMotoru.js`/`index.js`/`GeceEkrani.jsx`. **Kodlandı.**
- ✅ **Alt Parça 4: B Seçeneği — Host Rol Havuzu** (v1.8.32) — Lobide host hangi spesifik rollerin oyuna girebileceğini checkbox ile seçer. A seçeneği (grup sayıları) ile birlikte çalışır. Default: tüm roller açık (`rolHavuzu = null`). Host bazı rolleri kapatırsa: rastgele dağıtım sırasında sadece açık roller arasından seçilir.

*Davranış kuralları:*
- Default tüm roller açık (`rolHavuzu = null` = legacy davranış)
- Aynı rolden çoklu izin verilir (tekil kuralı v1.8'de kalktı; B'de tek rol açık olsa bile A=3 oyuncuya verilir)
- A grup sayısı > 0 ise B'de o gruptan en az 1 rol açık olmalı (validation uyarısı)
- Master belge Bölüm 5 (rol listesi) ve Bölüm 8 (denge tablosu) değişmez — B seçeneği A'nın üstüne eklendi
- Lobide oyuncu sayısı değişse de rol havuzu korunur (kimlikAciklamaAdedi gibi)

*Implementation:*
- **Server:** `ayarlariNormalize`'a `rolHavuzu` default eklendi (null), `lobi:ayar` handler genişletildi (geçersiz/bilinmeyen rol ID'leri filtrelenir, hepsi true'sa null'a düşer), `oyunuBaslat` `rolHavuzu`'nu `rolleriDagit`'e yollar, `rolDagitici.js`'te `gruptanSec`/`rolleriDagit` `rolHavuzu` parametresi alır ve filtreleme yapar (kapalı roller havuzdan çıkarılır).
- **Client:** Yeni component `RolHavuzuPaneli.jsx/css` — checkbox grid, 5 gruba göre ayrılır (Özg/Tar/Gel/Outsider/Kaosçu), "Hepsi/Yok" hızlı butonlar grup başına, "Hepsini Aç (Default)" genel buton, validation uyarıları. `LobiEkrani.jsx` "Dağılımı Özelleştir" sonrasına entegre, `socket.emit('lobi:ayar', { rolHavuzu })` ile server'a yansıtır.

*Hikaye-mekanik bağı (Bölüm 24):*
B seçeneği hikaye odaklı oyun kurmayı kolaylaştırır — örn. host "sadece Necmi forumundan gelen 8 gelenekçi" senaryosu için sadece gelenekçi rolleri açabilir; veya "yurt dışı dönüş hikayesi" için sadece Devin/Berke/Kartal/Ekin/Mert/Irmak/Eren açabilir. Aşama 3'ün tüm parçaları birlikte hikaye-mekanik bütünlüğü sağlar.

*Aşama 3 tamam (4/4).* Dört alt parça da kodlandı (yukarıdaki düzeltme notuna bak). Sıradaki ana iş: Aşama 4 (roman taslağı) veya görsel kimlik (v1.9'da yapıldı).

**v1.8.33 (2026-05-20) — Kritik fix paketi (Ajan QA bulguları)**
- Ajan destekli QA taramasından çıkan kritik hatalar düzeltildi (detay commit geçmişinde).

**v1.8.34 (2026-05-21) — Görev-Hikâye Uyumu (15 rol)**
- 38 karakterin ~1 sayfalık (~400-500 kelime) **benzersiz** hikayesi `hikayeler/` klasörüne yazıldı (grup+numara). Kanon kaynak yine `hikayeler-v2.md`.
- 15 rolün oyun görevi hikâyelerine uyarlandı:
  - **Motivasyon (denge 0):** Deniz, Devin, Mehmet, Azra.
  - **Mekanik:** Oğuz ("Eski Düzen" tema, mekanik aynı), Tuna ("Son Sipariş" — o gece kime gitti; kazanma "aynı kişiyi 3 gece + sağ kalsın"), Eren (kazanma "yatırım yaptığın kişi sağ kalsın"), Beren ("Süpervizyon" — o geceki aksiyon türü).
  - **Anlatım rötuşu (denge 0):** Umay, Bahar, Kartal, Can, Ekin, Sinan, Bora.
- `roller.js` + `geceMotoru.js` + `index.js` güncellendi. (Sugar Baby/Selin değiştirilmedi — uyum yeterliydi.)

**v1.8.35 (2026-05-21) — Tüm Tarafsız Kazanma Koşulları Kodlandı**
- Eskiden "köyde kalmak" fallback'iyle çalışan Tarafsız rollerin spesifik kazanma koşulları gerçek state ile kodlandı: Hetero Kadın, Aseksüel, Fetişist, Dul, Poliamorist (+ önceki Sugar Baby/Çöpçatan/Çapkın/Sugar Daddy/Fuckbuddy/Lovebuddy/Mazoşist).
- Fallback artık **yalnız Hetero Erkek + Situationship** (gizli koşul = oyun sonuna kalmak).
- Kazanma kontrolleri `geceMotoru.js`'te saf fonksiyonlara çıkarıldı; `index.js` `bitiseBasla` bunları çağırıyor.
- Test altyapısı: `server/test-gorev.js` (22 test, hepsi geçti).
- **Sıradaki ana iş:** Görsel kimlik kararı (Bölüm 23) veya Aşama 4 (roman taslağı).

**v1.9 (2026-06-23) — Görsel Kimlik Uygulandı (sıcak piksel-art tema)**

Bölüm 23'teki "Sıcak Piksel Art (Stardew tabanı)" yönü onaylanıp koda uygulandı. Bu sürüm tamamen **görsel/önyüz**; oyun mekaniği değişmedi.

*Tema dönüşümü:*
- ✅ Tüm palet mavi-yeşilden **sıcak parşömen/ahşaba** geçirildi — `client/src/index.css` ana değişkenler + 22+ CSS dosyasındaki gömülü rgba değerleri toplu güncellendi. Güncel değerler Bölüm 16'da.
- ✅ Piksel-art sert gölge sistemi (`--golge-yumusak`, `--golge-orta` — ahşap çerçeve + offset gölge)
- ✅ Grup renkleri (yeşil/turuncu/kırmızı) korundu — oyun mantığına bağlı, değiştirilmedi.

*Logo & favicon:*
- ✅ **Yatay logo** `client/src/Logo.jsx` — SVG bileşeni (madalyon "q" + "Queer Quest Quench" + küçük gökkuşağı şeridi). `yukseklik` prop ile ölçeklenir.
- ✅ **Favicon** `client/public/favicon.svg` — madalyon q + 3 grup rengi yayı (eski mor Claude logosu kaldırıldı).

*Köy sahnesi (dinamik arka plan):*
- ✅ `client/src/bilesenler/KoySahnesi.jsx/css` — tamamen kod-üretimli SVG köy manzarası: dağlar, katmanlı tepeler, yoğun orman silüeti, çayır, köy meydanı (çeşme + kıraathane), farklı yükseklikte dağılmış evler, ağaçlar, köprülü dere, çiçekler.
- ✅ **Oyuncu sayısı = ev sayısı** (`oyuncuSayisi` prop). **Gece/gündüz** ayrı palet (`gece` prop — faz gece/savunma ise true).
- ✅ `OyunDuzeni.jsx`'e ilk çocuk olarak eklendi; sol/orta/sağ paneller yarı saydam yapıldı (rgba ~0.86) ki köy görünsün.

*2.5D rol kartı çevirme:*
- ✅ `RolKartiEkrani.jsx/css` — rol dağıtımı artık **kapalı ahşap kartla** açılır (madalyon mühür + "Rolün hazır / Karta dokun, çevir"). Dokununca CSS 3D `rotateY(180deg)` ile döner (0.85s), arkasında gerçek rol kartı çıkar.
- ✅ `perspective` + `transform-style: preserve-3d` + `backface-visibility: hidden` tekniği. "Anladım" butonu sadece kart çevrildikten sonra görünür. Çevrilince kart normal akışa dönüp tam boy görünür. `prefers-reduced-motion` saygısı var.
- ✅ Bağımsız demo: `rol-karti-demo.html` (kök) — Buğra'ya gösterildi.

*Deploy:* İki commit — `daaccd2` (tema+logo+favicon+köy) ve `6d25119` (2.5D rol kartı). GitHub `bugrabilim/q` main → Railway auto-deploy.

- **Sıradaki ana iş:** Özgün 38 karakter portresi (Bölüm 23 Aşama 1) veya rol/aksiyon ikonları (emoji → piksel) veya Aşama 4 (roman taslağı).

---

### Versiyon 1 (kalan iş)

*v1.8'de tamamlanmadı, sonraki sürümlerde:*

**Host Kontrolü (lobide)**
- ✅ **Rol havuzu tikleme (B seçeneği)** — v1.8.32'de tamamlandı (host spesifik rolleri checkbox ile seçer; "grup sayıları (A)" ile kombo).

**Oyun Yapısı**
- 🔲 **Senaryo sistemi** (farklı oyun varyantları)
- 🔲 **Köy olayları** (random olaylar, gündüz/gece tetikleyiciler)
- 🔲 **İpucu sistemi**

**Tarafsız Rol Spesifik Kazanma Altyapısı**
- ✅ **v1.8.35'te tamamlandı** — HK/Aseksüel/Fetişist/Dul/Poli + SB/Çöpçatan/Çapkın/SD/FB/LB/Mazoşist için spesifik state + kazanma kontrolü kodlandı (`geceMotoru.js` saf fonksiyonlar + `test-gorev.js` 22 test). Fallback yalnız Hetero Erkek + Situationship'te kaldı (gizli koşul = oyun sonuna kalmak).

---

> **Yatırım Sonrası Stratejik Yol Haritası → Bölüm 22**'ye taşındı.
> Domain, hosting, email, kayıt sistemi, Steam, i18n, pazarlama ve daha fazlası
> detaylı şekilde 14 alt başlık altında yapılandırıldı.

**Görsel & Teknik**
- ✅ **Sıcak piksel-art tema + logo + favicon + köy sahnesi + 2.5D rol kartı** — v1.9'da uygulandı (Bölüm 18 "v1.9", Bölüm 16).
- 🔲 **Özgün 38 karakter portresi** (şu an 12 var: Kenney CC0 + filter; tema ile uyumlu özgün set gerekiyor — AI veya freelance, Bölüm 23 Aşama 1)
- 🔲 **Rol/aksiyon ikonları** (emoji → piksel ikon)
- 🔲 **Köy sahnesinin diğer ekranlara yayılması** (şu an oyun ekranında; lobi/bitiş ekranlarına da konabilir)
- 🔲 **Çoklu dil** (i18next altyapısı, en az TR + EN)
- 🔲 **Steam ve oyun platformları** (Electron veya benzeri sarmalama)

**Kalite & UX**
- 🔲 **Resmi QA test matrisi** (T6 — 10 senaryo: 6-kişi, 12-kişi, Kaan tam/eksik, tüm 11 rol dağıtım, ayrılanlar/fobik sohbet, mobile, yeniden başlat, sağ üst çıkış vb.)

---

## 19. SEKTÖR REFERANSLARI

| Oyun | Katkı |
|------|-------|
| Blood on the Clocktower | Outsider, 4 faksiyon, rol etkileşim derinliği |
| Town of Salem | Neutral Evil, bilgi rolleri |
| Secret Hitler | İdeolojik ekip mekaniği |
| Mafia/Werewolf | Temel gece/gündüz döngüsü |

---

## 20. SES & MÜZİK

Prototipe eklenen ses katmanı. Müzik queer kültür ↔ sosyal dedüksiyon damarını taşır (referans: Among Us, Town of Salem, Blood on the Clocktower, Feign). Atmosferik fon yerine sinsi gizem + gerilim + pizzicato oyunsuluk. Tüm parçalar Pixabay CC0 kaynaklı.

### 20.1 Ekran → Müzik Haritası

| Ekran / Faz | Müzik fazı | Parça(lar) |
|---|---|---|
| Açılış | (sessiz) | Kullanıcı "Sesi Aç"a basana kadar müzik çalmaz |
| Lobi, Rol Dağıtımı, Tanışma, Tartışma, Oylama (1./2./ek tartışma/sonuç) | `gunduz` | Curious + Sneaky Mischief + Mystery Hybrid Pizzicato (rastgele rotasyon) |
| Sabah (gece sonuçları/ifşa) | `sabah` | Mysterious Cinematic Background |
| Gece | `gece` | Sneaky Mystery Film Noir + Tense Orchestral Loop (rastgele rotasyon) |
| Son Savunma | `savunma` | Cool Suspense Pizzicato + Sneaky Piz Quirky Orchestral (rastgele rotasyon) |
| Bitiş — Özgürlükçü kazandı | `bitis-ozg` | Blow Up the Dance Floor (disco/funky — LGBTQ+ pride) |
| Bitiş — Gelenekçi kazandı | `bitis-gel` | Bağlama sesi (halk müziği — tematik istisna) |
| Ayrılan oyuncu ekranı | (o anki faz) | Köyle aynı faz müziğini duyar |

**Tarafsız bitiş kuralı:** Tarafsız tek başına kazandıysa (yeşil/kırmızı yok) **Özgürlükçü parçası** çalar. Yeşil veya kırmızı ile birlikte kazandıysa, **kazanan grubun parçası** çalar. Tarafsıza özgü ayrı parça yoktur.

**Parça rotasyonu:** Çoklu parçalı fazlarda (gündüz, gece, savunma) bir parça bitmeden ~1 saniye önce sıradakine **crossfade** ile geçilir; mevcut hariç rastgele seçilir. Tek parçalı fazlarda (sabah, bitiş) parça kendine sarar (native loop).

**Crossfade:** Faz değişiminde ve parça sonunda 1 sn yumuşak geçiş (`GECIS_MS`).

### 20.2 UI Ses Efektleri

| Efekt | Tetikleyici |
|---|---|
| `tikla.mp3` | Tanışma/Tartışma/Sabah hazır+devam, Oylama Savunma/Tartışma/Sonuç hazır butonları |
| `oylama.mp3` | 1. tur oy ver/geri çek, 2. tur evet/hayır |
| `bildirim.mp3` | **(v1.6)** Yalnızca beni tag'leyen mesaj geldiğinde (isim mention'u, Türkçe-aware). Diğer mesajlar (bot/gerçek) sessiz. |
| `ayrilma.mp3` | Bir oyuncu köyden ayrılınca — herkes duyar (`oyuncu:ayrildi` socket event) |
| `kazan.mp3` | Bitiş ekranında kazanan grup bilgisi gelince |
| `notdefteri.mp3` | 📓 Not defteri aç/kapa |

Tüm efektler kısa (<3 sn), 96 kbps MP3.

### 20.3 Ses Kontrolü

**"Sesi Aç" düğmesi:** Açılışta ses kapalı (mobil autoplay engeli + kullanıcı tercihi). Lobide büyük **"🔊 Sesi Aç"** butonu — basınca müzik başlar ve mobil autoplay engeli açılır (kullanıcı dokunuşu). Sonrasında küçük **🔊/🔇 toggle** + yanında **⚙️ ses ayarları** ikonu olur. Lobide ve tüm oyun ekranlarında sağ üst köşede.

**Ses Ayarları Modal'ı (⚙️):** 3 slider — Ana Ses (master) / Müzik / Efekt, hepsi 0-100. Canlı uygulanır, çalan müziğin sesi anında değişir. Tercih localStorage'a yazılır, kalıcı.

**Mobil:** Sağ üst köşe (🔊 + ⚙️ + ✕ Oyundan Çık) yalnızca "Köy/Rol" sekmesinde görünür — "Oyun" sekmesinde top-right'taki sayaç ile çakışmasın diye. Bitiş ekranında her zaman görünür.

### 20.4 localStorage Anahtarları

| Anahtar | Değer | Anlam |
|---|---|---|
| `q-ses-aktif` | `'true'` / `'false'` | Ses açık mı |
| `q-ses-master` | `0`–`1` | Ana ses seviyesi (varsayılan 0.7) |
| `q-ses-muzik` | `0`–`1` | Müzik sesi (varsayılan 0.5) |
| `q-ses-efekt` | `0`–`1` | Efekt sesi (varsayılan 0.7) |

`q-ses-aktif` hiç yazılmamışsa "ilk kullanım" sayılır ve büyük "Sesi Aç" butonu gösterilir; bir kez yazıldıktan sonra (true ya da false) küçük toggle gösterilir.

### 20.5 Dosya Düzeni

```
client/public/ses/
├── muzik/
│   ├── gunduz-1.mp3, gunduz-2.mp3, gunduz-3.mp3
│   ├── sabah.mp3
│   ├── gece-1.mp3, gece-2.mp3
│   ├── savunma-1.mp3, savunma-2.mp3
│   ├── bitis-ozg.mp3
│   └── bitis-gel.mp3
├── efekt/
│   ├── tikla.mp3, oylama.mp3, bildirim.mp3
│   ├── ayrilma.mp3, kazan.mp3, notdefteri.mp3
└── LISANSLAR.md         (kaynak URL'leri + lisans bilgisi)

client/src/ses/
├── SesYoneticisi.js          — singleton: muzikCal, efektCal, ses seviyesi, crossfade, parça rotasyonu
├── sesHaritasi.js            — MUZIK_DOSYALARI, EFEKT_DOSYALARI, fazaMuzikEslestir(faz, kazananGrup)
├── SesButonu.jsx/css         — 🔊 toggle + ⚙️ ikonu (Lobi, OyunDuzeni, BitisEkrani'na yerleşir)
└── SesAyarlariModal.jsx/css  — 3 slider modal'ı
```

**Toplam boyut:** ~4.8 MB. Müzikler 30-45 sn loop'a kısaltılmış, 96 kbps MP3, başı/sonu 50 ms fade. Her parça talep üzerine yüklenir (Howler `html5: true` stream — mobil veri/bellek dostu).

**Kütüphane:** `howler` 2.2.4 (~10 KB gzip).

### 20.6 Lisans

Tüm ses dosyaları **Pixabay** içerik lisansı altında: ticari kullanım serbest, atıf zorunlu değil. Kaynak URL'leri `client/public/ses/LISANSLAR.md` dosyasında tutulur.

### 20.7 Tasarım Notları

- **Sosyal dedüksiyon dili:** İlk denemede ambient/relaxing aday parçalar oyunun modunu düşürdü — Among Us / Town of Salem damarı belirlendikten sonra pizzicato sneaky/mystery yön benimsendi.
- **Bitiş asimetrisi tematik:** Bitiş ekranı kazanan gruba göre belirgin ton değişikliği yapan tek istisnadır (Bölüm 16 tasarım kuralı). Özgürlükçü zaferi pride/disco, Gelenekçi zaferi halk müziği — bu asimetri kasıtlı.
- **Bot kalabalığı:** Çok sayıda bot oyuncu varsa sohbet bildirim sesi spamlanmaması için 2 sn cooldown uygulanır.
- **Erişilebilirlik:** Hiçbir kritik oyun bilgisi yalnız sesle iletilmez (ses kapalıyken oyun aynı şekilde anlaşılır).

---

## 21. KARAKTER HİKAYELERİ

38 karakterin köye geliş hikayeleri tek dosyada toplandı. **Aktif sürüm: `hikayeler-v2.md`** (v1.8.30, 2026-05-19). `hikayeler-v1.md` arşiv olarak korunur. **v1.8.34: Her karakterin ~1 sayfalık (~400-500 kelime), birbirinden benzersiz genişletilmiş hikayesi `hikayeler/` klasörüne ayrı dosyalar olarak yazıldı (ozg-1..11, out-1, tar-1..14, gel-1..8, kao-1..4). Bu hikayeler görev yenilemenin (v1.8.34) kaynağı oldu.**

Her karakter için:
- **Kısa hikaye** (2-3 cümle, ~40-60 kelime) — rol kartında "Köye geliş motivasyonu" alanında gösterilir. **v1.8.33: 60-80 hedefi → 40-60'a revize edildi** (mevcut v2 standardı 30-55 aralığında stabilleşti; mobilde rol kartında okuma kolaylığı için kısa tutulması doğru).
- **Detaylı hikaye** (300-500 kelime, romanvari) — "Detaylı oku" butonu altında

Hikayeler benzersiz, şiddetsiz, rolü doğrudan ifşa etmeyecek şekilde yazıldı. Gelenekçilerin A+C modeli (Bölüm 2) korundu.

**v2 değişiklikleri (Aşama 1.5, 2026-05-19):**
- Rol ifşa yumuşatma (6 karakter, 8 cümle)
- 4 Tarafsız etiket başlıklara + yeni Dul rolü (Fatma, eski "Koca Karı")
- Oğuz cinsiyetçi tutum — 2 sahne eklendi (A+C modeli)
- Coğrafya: %80 Türkiye (12 şehir) + %20 yurt dışı (Berlin, Amsterdam, Viyana, Paris, Londra, Köln) — 22 karakter revize
- Sınıf çeşitliliği: 9 alt-orta vurgu (önceki 4'ten artış)
- Geliş kalıbı: 5 yeni kalıp (Bora köyde doğdu, Hakan ucuza arsa, Berke aşk dönüş, Erdem iş icabı, Kartal yurt dışı dönüş)

**Stratejik konum (Buğra kararı, 2026-05-19):** Karakter hikayeleri arka plan değil **ana ürün omurgası**. Oyun + roman + kutu oyunu üçlüsünün temeli. Detaylar Bölüm 24'te (planlama aşamasında).

---

---

## 22. YATIRIM SONRASI — STRATEJİK YOL HARİTASI

Şu işler yatırım/finansman/topluluk geldikten sonra şekillenecek. Mimari, kadro ve maliyet kararları buna göre değişir. Her bölüm bağımsız bir kapsamdır.

---

### 22.1 Altyapı (Domain · Hosting · Email · DB)

**Domain:** Kendi alan adı (örn. `qoyun.com`, `qoyun.app`). Cloudflare/Namecheap ~$10-15/yıl. Railway Custom Domain ücretsiz, HTTPS otomatik.

**Hosting / Scale-up:**
- Railway Hobby ($5/ay) — şu anki, 200-500 eşzamanlı oyuncuya yeter
- Pro ($20/ay) — 1000-2000 oyuncu
- 2000+ oyuncuda Redis + PostgreSQL ekle (mimari refactor 1-2 hafta)
- 5000+ oyuncuda horizontal scaling (Socket.io Redis adapter)

**Email servisi:**
- `info@qoyun.com` gibi profesyonel hesap
- **Zoho Mail** (ücretsiz) veya **Google Workspace** ($6/ay)
- Kayıt sistemi için SendGrid (ücretsiz başlangıç 100 mail/gün)

**Veritabanı:**
- Şu an: RAM tabanlı (kalıcı değil)
- Kayıtlı giriş → PostgreSQL (Railway $5-20/ay)

**Aylık toplam orta ölçek:** ~$30-50/ay

---

### 22.2 Hukuki & Kurumsal

- **Şirket kurma:** Şahıs (kolay başlangıç) vs Ltd.Ş. (yatırım almak için gerekli). Ltd.Ş kurulum ~₺10-20K + aylık muhasebe ~₺2-5K
- **Marka tescili:** "Queer Quest Quench" TR (~₺3-5K) + uluslararası Madrid sistemi (~$1000-2000)
- **KVKK + GDPR uyumu:** Privacy policy, cookie consent, veri silme hakkı. Hukukçu desteği ~₺5-10K
- **Kullanıcı sözleşmesi (EULA):** Topluluk kuralları, içerik moderasyon politikası, yaş kısıtı (13+ veya 16+)
- **Telif/Lisans:** Karakter tasarımları, müzik (Pixabay CC0 + sanat eseri lisansları)

---

### 22.3 Kullanıcı Sistemi (Kayıtlı Giriş)

**Hedef:** Misafir + Opsiyonel Üyelik hibrit.

**Auth seçenekleri:**
- **Google OAuth** ⭐ önerilen (en düşük sürtünme)
- Email + Şifre (klasik)
- Magic Link (parolasız)

**Profil özellikleri:**
- Avatar, kullanıcı adı, biyografi
- İstatistik (oyun sayısı, rol bazında kazanma oranı)
- Arkadaş listesi + davet
- Leaderboard
- Kalıcı engelleme listesi
- Kişisel ayarlar (ses, tema, dil) tüm cihazlarda senkron

**Teknik:** PostgreSQL + bcrypt/JWT veya passport-OAuth. 1-2 hafta geliştirme.

---

### 22.4 Platform Genişletme (Steam · Mobile · Console)

**Steam dağıtımı:**
- Electron ile paketleme (mevcut React+Node sarmalanır)
- Steamworks hesabı $100 tek seferlik
- %30 satış komisyonu
- F2P önerilir (sosyal multiplayer için)
- Süreç ~2-3 ay (hesap onayı + paketleme + Coming Soon + content review)
- Görsel/banner tasarımı $200-500

**Mobile (PWA → Native):**
- PWA: 1 hafta — "Aplikasyon Ekle" Chrome/Safari'den
- iOS native (Capacitor): 2-3 hafta + $99/yıl Apple Developer
- Android native: 2-3 hafta + $25 tek seferlik Google Play

**Diğer:**
- itch.io (ücretsiz, indie odaklı) — Steam'den önce MVP
- Epic Games Store (Steam sonrası, %12 komisyon)
- Switch/Console — 6+ ay native rewrite (uzun vadeli)

---

### 22.5 Çoklu Dil (i18n) — Asya Odaklı Küresel Erişim

**Stratejik karar (Buğra):** Sadece Batı değil, Asya öncelikli — Q'nun "bastırılmış kimlik / gizli rol" teması Asya'da rezonansı çok güçlü.

**Hedef dil paketi (4-5 milyar erişim):**
- **Batı (~750M):** EN, ES, PT (Brezilya), DE, FR
- **Doğu Asya (~1.6B):** ZH-Simplified, ZH-Traditional, JA, KO
- **Güneydoğu Asya (~600M):** ID, TH, TL (Filipince), VI, MS
- **Güney Asya (~1B):** HI, BN, UR
- **Diğer (~830M):** RU, AR (RTL), FA (RTL), UK

**Teknik:** i18next + react-i18next. Noto Sans CJK/Devanagari/Thai (ücretsiz). RTL dilleri için `direction: rtl` + mirror layout. Yerelleştirme = sadece çeviri değil; renk/emoji/cinsiyet kelimeleri kültürel.

**Süre:** Altyapı 2 hafta + EN. Her dil grubu 2-3 hafta (toplam 3-4 ay).

**Maliyet:** Crowdin topluluk çevirisi ücretsiz; AI + native düzeltme ~$2000-5000; tam profesyonel $20-40K.

**Strateji:** Her yeni özellikten **önce** altyapı kurulmalı. Karakter isimleri Türk kalır (kültürel kimlik).

---

### 22.6 Pazarlama & Topluluk

**Platform önceliği:** TikTok ⭐ > Twitch > Discord > Twitter/X > Reddit > Instagram > YouTube

**Influencer tipleri:**
- Sosyal dedüksiyon streamers (CorpseHusband, Disguised Toast, Hafu; TR: Wtcn, Pqueen, Elraenn)
- LGBTQ+ creators (Esmeray, Bilge Tarhan; Tom Daley, Tyler Oakley)
- Micro-influencer (5K-50K — düşük maliyet, yüksek engagement)
- VTubers (Asya pazarı için kritik)

**Aşamalı plan:**
- Aşama 0 (hazırlık, $200): Sosyal hesaplar, Discord, press kit
- Aşama 1 (organic 0-1K, $0): LGBTQ+ toplulukları, TikTok, Reddit
- Aşama 2 (micro 1K-10K, $500-2K): 5-10 Türk micro-streamer
- Aşama 3 (mid 10K-100K, $5-20K): Co-stream etkinlikleri, paid ads
- Aşama 4 (patlama 100K+, $50K+): Top-tier, profesyonel trailer, turnuva

**Q'ya özel taktikler:**
- "Türk LGBTQ+ İndie Oyunu" hikayesi — global gaming medyası için press değerli
- Karakter spotlight serisi (haftada 1 karakter)
- Co-streaming etkinlik (Among Us'un patlama sırrı)
- Discord topluluk turnuvası
- Türk medya: Bianet, Kaos GL, Webtekno

**İnsan kaynağı:** Community Manager ($500-4K/ay), Content Creator ($300-3K/ay), PR (hizmet bazlı).

---

### 22.7 Gelir Modelleri

| Model | Q İçin Uygunluk | Açıklama |
|---|---|---|
| **F2P + Kozmetik** | ⭐⭐⭐⭐⭐ | Özgün portreler, özel temalar, ses paketleri |
| **Premium oda** | ⭐⭐⭐⭐ | Özel mod, gelişmiş istatistik, AI bot, custom roller |
| **Battle Pass** | ⭐⭐⭐ | Sezonluk içerik + ödüller (Among Us yapıyor) |
| **Patreon/Ko-fi** | ⭐⭐⭐⭐ | Indie geliştirici destekçileri |
| **Reklam** | ⭐ | Kaçınılmalı — UX bozar |
| **NFT** | ❌ | Topluluk düşmanlık eder |

**Önerim:** F2P + kozmetik + Patreon (sosyal sorumluluk dahil).

---

### 22.8 Analitik & Veri

- **Plausible Analytics** ($9/ay) — gizlilik dostu, KVKK uyumlu
- **PostHog** (ücretsiz başlangıç) — kullanıcı davranışı + A/B test + funnel
- **Mixpanel** — derin funnel analizi

**Kritik metrikler:**
- DAU/MAU (günlük/aylık aktif kullanıcı)
- Churn rate (terk oranı)
- Hangi rol en popüler, hangi grup kazanıyor
- Ortalama oyun süresi
- Hangi fazda oyuncu kaybı en yüksek

---

### 22.9 Erişilebilirlik (a11y)

- **Renk körü modu** — grup renkleri yerine sembolu öne çıkar
- **Ekran okuyucu uyumu** — semantik HTML, ARIA etiketleri
- **Disleksi fontu** — opsiyonel (OpenDyslexic)
- **Sesli oyun** — sosyal dedüksiyon zaten sesli olarak iyi çalışır
- **Tek el modu** — mobilde
- **Karanlık/aydınlık tema** — şu an aydınlık + gece otomatik

---

### 22.10 İş Birlikleri

| Tür | Örnek |
|---|---|
| **LGBTQ+ STK'lar** | Türkiye: Lambda, Kaos GL, SPoD, Hevi LGBTİ+. Global: GLAAD, Stonewall |
| **Müzisyenler** | Tema şarkıları (Türk LGBTQ+ sanatçılar) |
| **Drag queen'ler** | Etkinlik konuğu, karakter tasarım girişi |
| **Diğer LGBTQ+ oyunlar** | Cross-promo: Dream Daddy, Hades, Tell Me Why |
| **Yerel kafe/bar'lar** | İstanbul LGBTQ+ mekanlarda demo etkinlik |
| **Akademik** | Üniversite LGBTQ+ kulüpleri, sosyoloji/psikoloji araştırma |

---

### 22.11 Sosyal Sorumluluk

- **Kazancın %X'i** LGBTQ+ STK'lara bağışlanır
- **Pride ay kampanyası** (Haziran) — 1 hafta ücretsiz premium, gelir bağışlanır
- **Türkiye'de psikolojik destek hatları** sponsorluk
- **Marka değeri:** topluluk güvenir, basın olumlu yazar, oyuncu sadakati yüksek

---

### 22.12 AI Entegrasyonu (V2+)

- **Akıllı botlar** — GPT-4/Claude API ile gerçekçi sohbet
- **Otomatik bot konuşma havuzu** — her dile native AI çevirisi
- **Davranış analizi** — şüpheli oyuncu tespiti
- **NPC karakterler** — "Köy büyüğü" sistem karakteri (random tavsiyeler)
- **Maliyet:** $0.01-0.10 per oyun (API)

---

### 22.13 Yarışmalar & Ödüller

| Yarışma | Kategori |
|---|---|
| **IGF (Independent Games Festival)** | Excellence in Narrative |
| **BAFTA Games Awards** | Diversity in Games |
| **IndieCade** | LGBTQ+ özel kategori |
| **LGBTQ+ Game Festival** | Türk yapım |
| **Türkiye Bilişim Vadisi** | Yerli indie |
| **Apple Design Awards** | iOS sürüm gerekir |

---

### 22.14 Uzun Vadeli Vizyon

- **Q evreni** — kart oyunu, kitap, animasyon, podcast
- **Q Foundation** — LGBTQ+ indie geliştirici fonu
- **Q Akademi** — yeni geliştiriciler için eğitim platformu
- **Q Live Events** — yıllık LGBTQ+ gaming kongresi

---

## 23. GÖRSEL STRATEJİSİ

> **GÜNCEL DURUM (v1.9):** Bu bölümün önerdiği "Sıcak Piksel Art (Stardew tabanı)" yönü **onaylandı ve uygulandı** — tema, logo, favicon, dinamik köy sahnesi ve 2.5D rol kartı canlıda (Bölüm 18 "v1.9"). Aşağıdaki strateji **referans/yol haritası** olarak kalıyor; kalan büyük iş **özgün 38 karakter portresi** (Aşama 1) ve rol ikonları.

Q v1.8'e kadar büyük ölçüde metinseldi (emoji/Kenney CC0 portreler). v1.8'de oyun mekaniği kilitlendi, v1.9'da **görsel kimlik** uygulamaya geçti.

### 23.1 Referans Oyun Analizi

| Oyun | Stil | Q İçin Değer |
|---|---|---|
| **Stardew Valley** | Piksel art, sıcak köy, indie efsane, tek yaratıcı (ConcernedApe) | 🎯 **DNA %90 örtüşme** — köy + queer + sıcak ton; tek yaratıcı markası Buğra için ilham |
| **Town of Salem** | Gotik-koyu, madalyon rol ikonları (renkli daire + silüet), ~50 rol | ⚙️ Yapısal model alınır (rol ikonu sistemi) — gotik ton **alınmaz** (Q ile çatışır) |
| **Blood on the Clocktower** | Yağlıboya Art Nouveau, 3 profesyonel sanatçı (Dawn / Hughes / Van Fleet), $30K+ bütçe | 🌟 Hedef kalite ama erişilmez — konsept ilham, madalyon ikonu, "her rol bir sanat eseri" felsefesi |

### 23.2 Önerilen Ana Stil

**🎯 "Sıcak Piksel Art (Stardew tabanı) + Türk Motifleri"**

**Neden:**
- Köy + queer + organik = Stardew DNA'sıyla doğrudan örtüşür
- AI ile üretilebilir (Pixellab, Retro Diffusion, Aseprite + Stable Diffusion) — Buğra teknik bilmediği için kritik
- Türk motifleri (rumi, kilim, nazar, çay bardağı) küçük dokunuşla entegre — "egzotikleştirme" tuzağından kaçınmak için **fazla yapma**
- Tek yaratıcı hikayesi marka değerli

**Referans oyunlar (Stardew + ek):**
- Stardew Valley
- Wylde Flowers (queer NPC'li çiftlik oyunu)
- Eastward (modern piksel art)
- Quantum Witch (LGBTQ+ retro piksel)

### 23.3 Alternatifler

**Alternatif 1: "Madalyon Rol İkonları" (ToS/BotC hibridi)**
- 38 rol için renkli daire + sembol/silüet — hızlı, ucuz
- AI ile dakikalarda üretilir
- Maliyet: $0-100 (AI) - $500-1.500 (freelance)
- 1-2 hafta

**Alternatif 2: "Türk Minyatür + Art Nouveau" (özgün, pahalı)**
- Topkapı minyatür kompozisyonu + Mucha tarzı süsleme
- Sosyal dedüksiyonda **hiç görülmemiş** özgün stil
- Maliyet: $5.000-15.000
- 4-6 ay, uzman illüstratör gerekli
- Risk: Bütçe + zaman yüksek

### 23.4 Üretim Akışı

**Aşama 0 — Minimum Geçerli Görsel (1-2 hafta, $0-50)**
- AI ile (Midjourney $30/ay veya Leonardo.ai ücretsiz) 38 rol madalyon ikonu
- Renk-kodlu fraksiyon: 🟢🟡🔴⚪⚫ mevcut renkleri korunur
- Tek logo varyasyonu (Stardew tarzı el-yazısı piksel + "Q" + küçük gökkuşağı)

**Aşama 1 — Ana Karakterler + Logo (1-2 ay, $200-2.000)**
- 38 karakter 64x64 piksel portre (AI + manuel düzeltme veya freelance Fiverr $30-80/portre)
- Resmi logo (gökkuşağı + Türk motifi hibrid)
- Ana ekran arka planı: organik köy panoraması
- Sosyal medya kit (avatar, kapak, post şablonu)

**Aşama 2 — Web Sitesi + Tüm Karakterler (2-3 ay, $2.000-8.000)**
- Web sitesi yenileme: piksel art temalı, koyu yeşil/altın palet, parallax köy manzarası
- 38 karakter ifade varyasyonları (mutlu, üzgün, şüpheli, ölü)
- Oyun-içi UI: ahşap doku, parşömen sarısı paneller
- 5-10 ortam görseli (kahvehane, tarla, ev, meydan, gece)

**Aşama 3 — Animasyon + Atmosfer (4-6 ay, $5.000-25.000)**
- Karakter idle animasyonları (göz kırpma, salınım)
- Gece/gündüz görsel geçişi (ses tasarımıyla senkron)
- Logo intro animasyonu
- Festival/seçim/oylama görsel efektleri
- Trailer/tanıtım videosu

### 23.5 Bütçe Senaryoları

| Senaryo | Bütçe | Süre | Kalite |
|---|---|---|---|
| **Minimum** (Buğra + AI) | $0-200 | 1-2 hafta MVP | Tanınabilir, orijinal değil |
| **Orta** (AI + 1 freelance) | $1.000-5.000 | 2-3 ay | Profesyonel indie |
| **Profesyonel** (art dir + illustrator) | $10.000-30.000 | 3-4 ay | BotC kalite yaklaşımı |
| **Stüdyo** (3+ kişi tam zamanlı) | $50.000+ | 6-12 ay | Premium AAA-indie |

### 23.6 Aksiyon Önerileri (Buğra için)

1. **Şimdi başla — Aşama 0 AI ile.** Midjourney aboneliği ($30), 38 rol madalyon ikonu. **1 hafta MVP.** Beklemek için neden yok.

2. **Stardew = referans, BotC = hedef.** Stardew'in sıcak köy DNA'sı %90 örtüşür. BotC kalitesi bütçe gelene kadar erişilmez. ToS gotik tonundan kaçın.

3. **Türk kimliği = küçük dokunuş.** Logo'da bir rumi, ortam görselinde çay bardağı, karakterlerden birinin elinde nazar — **fazlası egzotikleştirme tuzağı.** Queer + Türk dengesi hassas.

4. **Önce ikonlar, sonra portreler.** 38 madalyon ikonu hızlı kazanım. Tam karakter portresi yatırımı mekanik kilitlendikten sonra — yoksa para boşa gider.

5. **Tek freelance illustrator** — Fiverr/ArtStation'dan **Türk** veya Doğu Avrupalı, $30-50/saat. 1-2 deneme portresi ($60-100), sonra 38'lik paket pazarlığı. Türk illustrator marka hikayesini güçlendirir ("Türk yapımı, Türk sanatçısı"). **Başlangıç bütçesi: $1.500-3.000 ile Aşama 1'i bitir.**

### 23.7 Kaynaklar

- Stardew Valley Logo History — designyourway.net
- Town of Salem 2 Art (Christopher O'Boyle) — ArtStation
- BotC Sanatçıları: Micaela Dawn, Matt Hughes, John Van Fleet — Behance
- Quantum Witch — Gayming Mag (LGBTQ+ piksel referans)
- Character Design Pricing 2025 — animotionsstudio.com
- Midjourney Pricing — gamsgo.com

---

## 24. GENİŞLETİLMİŞ MEDYA VİZYONU

Q'nun stratejik konumu 2026-05-19'da değişti. Karakter hikayeleri artık arka plan değil — **ana ürün omurgası**. Oyun, roman ve kutu oyunu üç ayağı bu omurganın üzerine kurulur. Bu bölüm üç ayağın ortak yapısını ve üretim sırasını tanımlar.

### 24.1 Stratejik Konum

**Karar (Buğra, 2026-05-19):** 38 karakter hikayesi tek bir "sosyal dedüksiyon oyunu için arka plan metni" değil — bağımsız bir narrative IP. Q evreni bu omurganın üzerinden üç farklı medyada büyür.

**Neden şimdi:**
- Aşama 1.5'te hikayeler kalite açısından (rol ifşa yumuşatma, coğrafya çeşitliliği, sınıf vurgusu, geliş kalıbı çeşitliliği) profesyonel narrative standartlarına yaklaştı.
- Necmi merkezli gelenekçi ağ + 6 ana dramatik damar romansal yapıya zaten hazır.
- LGBTQ+ Türk indie IP olarak özgün konumlanma — küresel pazarda doğrudan rakipsiz.

---

### 24.2 Üç Ayak

#### A. Oyun (canlı, v1.9)
- **Mevcut durum:** https://q-11.up.railway.app — 38 karakter, 5 grup (Özg/Tarafsız/Gelenekçi/Outsider/Kaosçu), 8 faz, gece mekanikleri (38 rol), sürekli paneller, ses katmanı, bot sistemi, host kontrolleri, B seçeneği, tüm Tarafsız kazanma koşulları tamam. **v1.9: sıcak piksel-art tema + logo + favicon + dinamik köy sahnesi + 2.5D rol kartı.**
- **V1 kalan iş (Bölüm 18):** özgün 38 karakter portresi, rol/aksiyon ikonları, senaryo sistemi, ipucu sistemi, çoklu dil, T6 QA matrisi (canlı doğrulama). *(B seçeneği v1.8.32, görev-hikâye uyumu v1.8.34, 9 Tarafsız kazanma v1.8.35, görsel kimlik v1.9'da tamamlandı.)*
- **Aşama 3 katkısı:** Hikayelerden çıkan yeni mekanikler — gizli ilişkiler (Necmi forum bağı oyun-içi görünür), faz-bazlı anılar (karakterin hikayesinden cümleler tetikleyici), Dul rolünün gece mekaniği, dramatik damarlar için özel etkileşimler.

#### B. Roman (Aşama 4 — taslak)
- **Format adayları:** Çoklu anlatıcı (3-5 karakter perspektifi rotasyonu) veya tek anlatıcı (gözlemci tipi, örn. Bora köyün yerlisi olduğu için tüm karakterleri görür).
- **Ana çatışma adayı:** Necmi'nin geleneksel ağ örme çabası vs. Murat'ın bastırılmış kimliği vs. köyün geleneksel olmayan karakterleri — üçgen çatışma; veya 6 dramatik damardan 2-3'ünün roman boyunca örülmesi.
- **Ölçek:** İlk taslak ~80-100K kelime (Türkçe roman standardı). Tahmini yazım: 6-12 ay (Buğra tek yaratıcı); profesyonel editör/co-yazar dahil edilirse 3-6 ay.
- **Pazar:** Önce Türkçe (İletişim, Metis, Doğan Kitap gibi yayınevleri), sonra çeviri (İngilizce öncelikli). LGBTQ+ Türk romanı niş ama dünya pazarında talep var.

#### C. Kutu Oyunu (Aşama 5 — taslak)
- **Format adayları:**
  - Sosyal dedüksiyon kartı (Town of Salem / Werewolf benzeri, Q karakterleriyle)
  - Karakter bazlı RPG-lite (38 karakter karta basılı, hikaye genişlemesi)
  - Hibrit: kartlar + senaryo defterleri + role-playing rolleri
- **Materyal:** 38 karakter kartı + rol kartları + senaryo defterleri + zar/jeton + kutu sanat eseri.
- **Ölçek:** İlk prototip 3-4 ay (kart tasarımı + kural geliştirme + playtest). Profesyonel üretim 6-12 ay.
- **Pazar:** Türkiye boardgame topluluğu (Tabletop Türkiye) + Kickstarter (uluslararası). 1500-3000 TL fiyat aralığı premium queer indie ürün.

---

### 24.3 Ortak Omurga — 38 Karakter

Üç ayağı birleştiren temel: aynı 38 karakter, aynı bağ haritası, aynı dramatik damarlar. Tek doğru kaynak: `hikayeler-v2.md` + Bölüm 21.

**Yapısal kilit: Necmi**
Necmi tek "ağ örücüsü" — 7 gelenekçiyi forumda bizzat çağırıyor, köye ilk gelen o. Diğer 4 grup için böyle bir merkez yok. Roman/kutu oyunu için Necmi yapısal başlangıç noktası olarak işler.

**6 ana dramatik damar (Aşama 1 haritası):**
1. **Yasemin × Elvin** — "Hadi ama, ikisinden biri olamaz mısın?" — net cevap arayan vs. ortada kalan.
2. **Murat × Hüseyin** — Bastırmış gay avukat × imam. "Açmadığı dosya" Hüseyin'le bir kez daha kapanır.
3. **Pınar × Aren** — NB karşıtı hemşire × NB illüstratör. Sessiz baskının ana ekseni.
4. **Bora × Kartal** — Köyün yerlisi sadist gözlemci × yurt dışı dönüş fetişist gözlemci. İkisi de gözleyen.
5. **Necmi × Hakan** — Aynı tarafta ama liderlik tarzı zıt (sessiz/pasif vs. baskıcı/kaplayıcı).
6. **Hatice × Irmak/Tuna/Nehir** — Çöpçatan kadın × aseksüel + fuckbuddy + lovebuddy üçlüsü. Hassas/komik gerilim.

**Çeşitlilik damarları (Aşama 1.5'ten):**
- **Coğrafya:** %80 Türkiye (12 şehir) + %20 yurt dışı (Berlin 2, Amsterdam, Viyana, Paris, Londra, Köln) — küresel temayla uyumlu, Türk diaspora için doğrudan rezonans.
- **Sınıf:** 9 alt-orta karakter (Lila, Selin, Kaan, Oğuz, Erdem, Bora, Pınar, Tuna, Mehmet) — sınıfsal çatışma damarları.
- **Geliş kalıbı:** 5 farklı (köyde doğdu, atalarından arsa, aşk için, iş icabı, yurt dışı dönüş) — anlatı çeşitliliği.

**Tutarlılık kuralı:** Üç ayakta da aynı karakter aynı temel özellikleri taşır (yaş, meslek, kimlik, ana motivasyon). Değişen: derinlik (oyun yüzeysel anlık, roman derin kronolojik), format (kart vs. paragraf), perspektif (oyuncu = oyun-içi katılımcı, okuyucu = dışarıdan gözlemci, kutu oyunu = sosyal performans).

---

### 24.4 Üretim Sırası ve Öncelikler

**Faz 1: Oyun Derinleştir (Aşama 3, ~2-4 hafta)**
- Hikayelerden çıkan mekanikler canlıya entegre:
  - Necmi gelenekçi forum bağı oyun-içi görünür
  - Faz-bazlı karakter anıları (rastgele faz başlangıçlarında karakter hikayesinden 1 cümle pop-up)
  - Dul rolünün gece mekaniği (aday: "bir oyuncunun geçmiş anısını sor")
  - 6 dramatik damar için özel etkileşim (Yasemin × Elvin aynı oyundaysa özel diyalog tetiklenir)
- B seçeneği (rol havuzu tikleme) bu fazda eklenebilir.
- **Çıktı:** v1.9 canlı sürüm, hikaye-mekanik entegrasyonu.

**Faz 2: Roman Taslağı (Aşama 4, 1-3 ay taslak + 6-12 ay tam yazım)**
- `roman-taslagi-v1.md` yeni dosya.
- Taslak içeriği: anlatıcı seçimi, ana çatışma örgüsü, bölüm planı (15-25 bölüm), karakter arc'ları, açılış sahnesi, son sahne.
- Tam yazımda profesyonel editör erken devreye girsin (Buğra'nın stilini korumalı).

**Faz 3: Kutu Oyunu Taslağı (Aşama 5, 1-2 ay taslak + 3-6 ay prototip)**
- `kutu-oyunu-v1.md` yeni dosya.
- Taslak içeriği: format seçimi, kart sistemi, kural taslağı, materyal listesi, prototip senaryosu, üretim notları.
- Kickstarter veya yerli boardgame yayıncı (Pegasus, Hobi) araştırması.

**Toplam vizyonun gerçekleşmesi:**
- Hızlı tahmin (Buğra tek yaratıcı + opsiyonel destek): 18-36 ay
- Yatırım senaryosu (Bölüm 22 — kadrolu üretim): 6-18 ay

---

### 24.5 Risk ve Fırsatlar

**Riskler:**
1. **Odak kaybı:** Üç ayakta dağılma — Buğra tek yaratıcı, her ayağa yeterli zaman ayıramayabilir. **Önlem:** Sıralı üretim (oyun → roman → kutu oyunu), paralel değil.
2. **Kalite tutarsızlığı:** Roman edebî standardı tutturmazsa Q markasına zarar verir. **Önlem:** Profesyonel editör erken devreye girsin, hatta co-yazar.
3. **IP karmaşası:** Üç format aynı karakterleri farklı yorumlarsa kanon çelişkisi. **Önlem:** Bölüm 21 + `hikayeler-v2.md` = tek doğru kaynak; her ayak buraya referansla yazılır.
4. **Pazar parçalanması:** Oyun oyuncuları ≠ roman okuyucuları ≠ kutu oyunu hayranları. Üçüne pazarlama maliyetli. **Önlem:** Çapraz tanıtım (oyun-içi roman bölüm açılımları, kutu oyununda oyun QR kodu, romanın iç kapağında oyun davet kodu vb.).
5. **Yorgunluk:** Buğra Q ile aylar yıllar geçirdi; üç format yorucu olabilir. **Önlem:** Her fazda mola/kontrol noktaları, dış destek (yatırım, kadrolu) yeri zamanı gelir.

**Fırsatlar:**
1. **Tek IP, üç format:** Stardew Valley'in oyun + merchandise modelinin ötesi. Kitap + kutu oyunu = "queer Türk IP universe" — küresel pazarda öncü konum.
2. **Yatırım çekiciliği:** Üç ayak = üç gelir kaynağı + üç pazarlama kapısı. Yatırımcılar için risk dağılımı.
3. **Topluluk derinleşmesi:** Roman okuyucuları kutu oyunu alıcısı, kutu oyunu oyuncusu dijital oyun oyuncusu — üçlü besleme.
4. **Akademik ilgi:** LGBTQ+ Türk IP, sosyoloji/cinsiyet çalışmaları için kaynak. Üniversite araştırma + ödüller (Bölüm 22.13).
5. **Türk diaspora pazarı:** Yurt dışı karakterler (Berlin, Köln, Amsterdam vb.) Almanya/Hollanda Türk topluluğunda doğrudan rezonansa girer. Diaspora roman okuyucusu = hazır kitle.

---

### 24.6 Sonraki Adımlar

**Kısa vadeli (Aşama 3 — sıradaki iş, ~2-4 hafta):**
- Hikayelerden çıkan oyun mekanikleri canlıya eklensin (Necmi forum bağı, anılar, Dul rolü, damar etkileşimleri).
- v1.9 canlı, hikaye-mekanik entegrasyon test edilir.

**Orta vadeli (Aşama 4 — 2026 sonbahar/kış):**
- Roman taslağı yazılır. Buğra'nın yazım stiline en uygun anlatıcı + çatışma kurgusu seçilir.
- Profesyonel editör erken devreye girsin.

**Uzun vadeli (Aşama 5 — 2027 başı):**
- Kutu oyunu taslağı yazılır. Format seçimi (sosyal dedüksiyon kart mı, karakter RPG-lite mı, hibrit mi) Buğra karar verir.

**Karar bekleyen noktalar:**
- **Roman dili:** sadece Türkçe mi, çift dil (TR+EN) mi? — Bölüm 22.5 (i18n) ile entegre kararı.
- **Kutu oyunu ölçeği:** tek senaryo mu, çoklu senaryo paketi mi?
- **Yatırım modeli:** Bağımsız mı, yatırım çağrısı mı (Bölüm 22 ile entegrasyon)?
- **Anlatıcı kararı (Roman):** Tek (Bora gözlemci) mi, çoklu (3-5 karakter rotasyonu) mu?

---

**Son güncelleme:** v1.9 (2026-06-23) — Canlı: https://q-11.up.railway.app · Wiki: /wiki rotası (oyun-içi) + https://github.com/bugrabilim/q/wiki · 38 rol mekaniği + **38 karakter hikayesi v2** (`hikayeler-v2.md`, Aşama 1.5 tamam) + **Aşama 3 tamam (4/4)** (karakter anıları banner + Necmi forum bağı + Dul gece mekaniği v1.8.31 + B seçeneği host rol havuzu v1.8.32) + tüm Tarafsız kazanma koşulları (v1.8.35) + 7 wiki sayfası + T6 QA matrisi + köy olayları + kişi engelleme + arama tamam. **v1.9: görsel kimlik uygulandı** — sıcak piksel-art tema + logo + favicon + dinamik köy sahnesi + 2.5D rol kartı. Bölüm 22 yatırım sonrası 14 alt başlık. Bölüm 23 görsel kimlik kararı **uygulandı** (kalan: özgün portreler). **Bölüm 24 ✅ Genişletilmiş Medya Vizyonu** (oyun + roman + kutu oyunu üç ayağı). **Hikaye katmanı ana ürün omurgası**. Sıradaki: özgün 38 portre / rol ikonları veya Aşama 4 (roman taslağı).
