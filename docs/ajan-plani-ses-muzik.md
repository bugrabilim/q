# Q — Ses & Müzik Ajan Planı (V1)

> Bu plan, master belge v1.3+ üzerine **Ses & Müzik** katmanını ekler. Bağımsız bir Claude oturumu veya geliştirici tarafından çalıştırılabilecek şekilde yazılmıştır. Master belgenin Bölüm 18'inde "V1 hedefi" olarak listelenen "Müzik & ses efektleri" maddesi bu planla detaylandırılır.

---

## ÖN ONAYLAR — Buğra kararları (2026-05-13)

Bu kararlar Buğra ile **ses katmanı planlama aşamasında** netleştirildi. Yeni oturum bunları temel alarak M1'den itibaren ilerler (M0 kararları artık otomatik, sadece M0-ek karar #5 onaylanır).

| # | Karar | Cevap |
|---|---|---|
| 1 | Atmosfer kapsamı | **B genişletme — faza göre karışık** (her faz farklı queer ton, ayrıntı için Bölüm 1.5 Ton Haritası) |
| 2 | UI efektler | _M0'da sor — varsayılan: C (geniş)_ |
| 3 | Kaynak | _M0'da sor — varsayılan: A (CC0)_ |
| 4 | Varsayılan ses | _M0'da sor — varsayılan: B (sessiz, kullanıcı açar)_ |
| 5 | **LGBTİ+ ses dili** ⭐ | **Faz bazlı queer harman** — Claude her faz için 3 örnek dinletip onaylatır. Heteronormatif country/folk klişeleri yasak. Referans tarzı için **Bölüm 1.5 Ton Haritası**. |

---

## 0. ÖNBİLGİ — Burayı önce oku

### Proje durumu
- **Ad:** Queer Quest Quench (kısaltma: q)
- **Sürüm:** v1.3 (canlı, https://q-11.up.railway.app)
- **Repo:** https://github.com/bugrabilim/q (private, branch: main)
- **Kod:** `C:\Users\bugra\Desktop\q\q-v11\`
- **Master belge:** `C:\Users\bugra\Desktop\q\q-master-belge12.md` (Bölüm 16 görsel dil, Bölüm 18 V1 hedefleri)
- **Ana plan:** `C:\Users\bugra\Desktop\q\ajan-plani.md` (prototip tamamlandı, T6/T7 sürüyor)

### Bu planın kapsamı
- Atmosfer müziği (faz bazlı): gündüz / gece / savunma / bitiş
- UI ses efektleri: tıklama, oylama, ayrılma, kazan/kaybet
- Mobil autoplay yönetimi (lobi'de "Sesi Aç")
- Volume control (master + müzik + efekt ayrı)
- localStorage ile kullanıcı tercihi kalıcılığı

### Kullanıcı profili (Buğra)
- Teknik bilmiyor — komutları "şunu yapıştır" netliğinde söyle
- Türkçe konuşur, mobilden cevap verebilir (uzun teknik açıklama yapma)
- Ses üretimi/lisans bilmiyor — kaynak önerilerini netleştir
- Tasarım/atmosfer kararları için **örnek dinletip onay iste**
- Büyük adımlardan önce **plan sun, başlayayım mı diye sor**

### Çalışma kuralları (master belgeden, prototipte de aynısı)
1. **Türkçe konuş.** Dosya isimleri, değişken adları, yorumlar hep Türkçe.
2. **Master belgeden çıkma.** Görsel dil + ton (sıcak, organik, stressiz) ses tarafında da aynı.
3. **Buğra teknik bilmiyor.** Adım adım net söyle.
4. **Tasarım kararları için onay iste.** Atmosfer/ton karakteri etkileyen her şeyde sor.
5. **Yapım planı önce, kodlama sonra.**
6. **Mobilden cevap geliyor olabilir.** Kısa, net.
7. **Test et, paketle, ver.**

---

## 1.5. TON HARİTASI — LGBTİ+ Faz Bazlı Ses Dili ⭐

> Bu tablo Karar #5 (LGBTİ+ ses dili) için referans rehberidir. Master Bölüm 1 ("İstanbul'dan kaçıp köye yerleşen farklı yaşam tarzları") + 11 LGBTİ+ özgürlükçü rolü ses tarafında da yansır. Müzik queer kültürün dilini taşır — heteronormatif country/folk anonimliğinden kaçınılır.

| Faz | Tarz | Referans sanatçılar | Karakter | Pixabay/FMA arama anahtarları |
|---|---|---|---|---|
| **Gündüz** (lobi/tanışma/sabah/tartışma) | Sakin queer indie folk | ANOHNI, Perfume Genius (sakin), Sufjan Stevens (Carrie & Lowell tarzı), Big Thief | Akustik (gitar/piyano) + yumuşak synth pad. Samimi, kabullenici, hafif melankoli ama umutlu. **Tipik folk-country giysisinden kaçın** — kapsayıcı, yumuşak. | "ambient acoustic", "indie folk soft", "warm piano", "intimate strings", "queer ambient" |
| **Gece** | Mistik queer ambient pop | SOPHIE (Faceshopping yumuşağı), Arca (Anoche tarzı), Björk (Vespertine), Caroline Polachek (ambient) | Synth wash + soft beats + cinsiyet-akışkan vokal hissi (vokalsiz instrumental). Gizemli, sürreal, savunmasız. **Karanlık ama tehdit edici değil**. | "ambient electronic", "dreamy synth", "ethereal pad", "experimental ambient", "queer night" |
| **Savunma** | Ballroom esinli mid-tempo gerilim | FKA Twigs (LP1), MNEK (synth), Honey Dijon (downtempo), Kelela | Kalp atışı bas + house ritim alt yapısı + sahne hissi. Drag Queen rolü ile uyumlu — "sahnedesin, kendini anlat". Gerilim var ama agresif değil, **dramatik**. | "deep house instrumental", "downtempo electronic", "club mid-tempo", "vogue beat soft" |
| **Bitiş — Özgürlükçü** 🟢 | Pride parade sevinç pop | Years & Years, Hayley Kiyoko, MUNA, Lil Nas X (Industry Baby altyapı), Robyn (sevinçli) | Tempo yüksek, synth-pop, **zafer ve sevinç** — dans edilesi. Pride yürüyüşü hissi. | "uplifting pop instrumental", "celebratory synth", "joyful electronic", "pride parade" |
| **Bitiş — Gelenekçi** 🔴 | Yumuşak melankoli (üzücü ama agresif değil) | Sufjan (Casimir Pulaski Day tarzı), ANOHNI (sad), Perfume Genius (Queen) | Akustik + minimal piyano/yaylı. **Üzücü, kayıp hissi** — özgürlükçü oyuncular kaybetti, ama oyun şiddetsiz, bu yüzden müzik yas dolu ama saldırgan değil. | "melancholy piano", "sad acoustic instrumental", "grief ambient", "soft sorrow" |
| **Bitiş — Tarafsız bireysel kazanan** 🟡 | Reflective indie | Sufjan (akustik), Bon Iver (For Emma tarzı), Phoebe Bridgers (instrumental tarzı) | Düşünceli, içe dönük. "Kendi yolumu buldum" hissi — kazandı ama yalnız. | "reflective acoustic", "introspective indie", "contemplative piano" |

### Tarz dışı kalanlar (yasak)
- ❌ Geleneksel Türk/Anadolu folk (oyun "İstanbul'dan kaçanlar"ı anlatıyor, Anadolu köyü değil — köy organik/queer-friendly bir sığınak)
- ❌ Country & Western (heteronormatif Amerikan anonim ton, queer karakter setiyle uyumsuz)
- ❌ Agresif metal/rock/EDM
- ❌ Klişe "fantastik macera" orkestra senfonik (oyun gerçekçi sosyal dinamik)
- ❌ Hetero romantik pop (oyun ekibe/topluluğa odaklı, çiftleşme/romans değil)

### Süreç (Buğra'nın onayıyla iterasyon)
1. Claude her faz için 3 aday parça önerir (yukarıdaki tarz + Pixabay/FMA linki)
2. Buğra dinler, "Bu olur" / "Bunu daha az synth" / "Tamamen farklı yön" gibi geri bildirim verir
3. Claude iter eder, son aday belirlendiğinde kabul

---

## 1. GÖREV LİSTESİ

### M0 — Kapsam onayı 🔴 İLK ADIM
**Amaç:** Buğra'dan ses tasarımı kalan parametrelerini onayla. (Karar 1 ve 5 zaten **ÖN ONAYLAR** bölümünde verildi.)

**Önceden onaylanmış (Buğra, 2026-05-13):**
- ✅ **Karar 1:** Faz bazlı karışık atmosfer (B genişletme — gündüz/gece/savunma/bitiş)
- ✅ **Karar 5:** LGBTİ+ ses dili → faz bazlı queer harman, Ton Haritası (Bölüm 1.5) referans

**Buğra'ya sorulacak (kalan 3 karar):**

#### Karar 2 — UI ses efektleri kapsamı
- **A.** Yok — sadece müzik
- **B.** Minimal: oylama, ayrılma, kazan (3 efekt)
- **C.** Geniş: yukarıdakiler + mesaj gelişi, hazır, tıklama (~6-8 efekt) (önerim ✅)

#### Karar 3 — Müzik kaynağı
- **A.** Pixabay Music / Free Music Archive — hazır CC0 parçalar (hızlı, telifsiz) (önerim ✅ V1 prototip için, Ton Haritası anahtar kelimeleriyle hedef arama)
- **B.** Suno AI / Udio — özel "köy + queer + sıcak" prompt'larıyla yapay zeka müziği (özgün, ücretli abonelik)
- **C.** Profesyonel queer müzisyen ile özel beste (V2 hedefi, prototip kapsamı dışı)

#### Karar 4 — Varsayılan ses durumu
- **A.** Sesli — sayfa açıldığında müzik çalmaya başlasın (mobil autoplay engeli var)
- **B.** Sessiz — kullanıcı manuel "🔊 Sesi Aç" basana kadar (önerim ✅ mobil dostu)

**Bitiş kriteri:** Kalan 3 karar onaylandı.

---

### M1 — Kaynak toplama ve örnekleme (Karar 3'e göre)
**Amaç:** Ton Haritası'na (Bölüm 1.5) uygun parçaları bul — heteronormatif klişelerden kaçınarak.

**Eğer Karar 3 = A (CC0 hazır):**
1. **Her faz için Ton Haritası'ndaki referans sanatçıların tarzına yakın CC0 alternatif ara.** Sadece "village folk" gibi geniş aramalar yetmez — Pixabay Music'te "deep house instrumental" (savunma), "ambient electronic" (gece), "uplifting pop instrumental" (bitiş-özg) gibi spesifik kategorilerle hedefli arama yap.
2. Kaynaklar (öncelik sırası):
   - **Pixabay Music** (pixabay.com/music) — CC0, ticari kullanım serbest, en geniş havuz
   - **Free Music Archive** (freemusicarchive.org) — CC ile filtrelenebilir, daha sanatçı odaklı
   - **Uppbeat / Soundstripe free tier** — sınırlı ama kaliteli
   - **YouTube Audio Library** — bazıları telifsiz, indirilebilir
3. Her faz için 3'er aday parça topla — Bölüm 1.5'teki referans sanatçı tarzına yakınlık ölçüsü.
4. **Kaçınma kontrolü:** Aday parça country/Anadolu folk/heteronormatif romantik tonda ise eleme. "Vokalsiz mi?" / "Drag/queer hissi var mı?" / "Anonim folk değil mi?" sor.
5. Her parçayı 30-60sn loop edilebilir bölüm olarak kısalt (ffmpeg veya online ses kesici — başlangıç/bitiş 50ms fade).
6. Buğra'ya 6 fazın (gündüz / gece / savunma / bitiş-özg / bitiş-gel / bitiş-tarafsız) 3'er adayını yolla — Spotify/SoundCloud preview linki olsun. Buğra dinler, seçer veya "daha az synth" / "daha sakin" gibi yön verir.
7. Buğra "tamam" deyince final dosyayı MP3 olarak indir (96-128 kbps, mono veya stereo).

**Eğer Karar 3 = B (Suno AI):**
1. Buğra'nın Suno hesabı var mı kontrol et — yoksa açma talimatı
2. Her faz için 3'er prompt yaz:
   - Gündüz: "Warm acoustic village morning, gentle guitar, light percussion, organic folk, no vocals, looping, 60 seconds"
   - Gece: "Calm mysterious village night, soft strings, ambient pad, no vocals, looping, 60 seconds"
   - Savunma: "Tense but warm village discussion, mild tension, acoustic, no vocals, looping, 60 seconds"
   - Bitiş: "Resolution village folk, hopeful, organic, no vocals, 30 seconds"
3. Suno'da 4×3 = 12 üretim, en iyiyi seç
4. WAV indir, MP3'e çevir (~96-128 kbps, küçük dosya)

**Eğer Karar 2 = B veya C (efektler):**
- Pixabay Sound Effects → "soft click", "vote bell", "notification chime", "door close" (ayrılma için)
- Tüm efektler kısa (<1sn) ve hafif (organik ton korunmalı, sentetik beep yok)

**Dosya teslimi:** `q-v11/client/public/ses/` klasörü altında:
```
public/ses/
├── muzik/
│   ├── gunduz.mp3       (~50-100 KB)
│   ├── gece.mp3
│   ├── savunma.mp3
│   └── bitis-{ozg,gel,tarafsiz}.mp3
└── efekt/
    ├── tikla.mp3        (~5-10 KB her biri)
    ├── oylama.mp3
    ├── ayrilma.mp3
    └── kazan.mp3
```

**Bitiş kriteri:** Tüm ses dosyaları `client/public/ses/` altında, toplam < 2 MB.

---

### M2 — Teknik altyapı (Howler.js)
**Amaç:** Ses çalma kütüphanesi entegre et.

**Adımlar:**
1. `cd client && npm install howler`
2. Yeni dosya: `client/src/ses/SesYoneticisi.js`
   ```javascript
   import { Howl } from 'howler';

   // Tek-örnek (singleton) ses yöneticisi
   const muzikler = {};
   const efektler = {};
   let aktifMuzikId = null;

   export function muzikHazirla(faz, dosyaYolu) {
     muzikler[faz] = new Howl({
       src: [dosyaYolu],
       loop: true,
       volume: 0.4,
       preload: true
     });
   }

   export function muzikCal(faz) {
     // Aktif müzik varsa fade out
     // Yeni müziği fade in
   }

   export function efektCal(efektAd) { ... }

   export function masterVolume(deger) { ... }
   ```
3. Crossfade için Howler `fade()` API'si kullan (master Bölüm 13'teki yumuşak geçişlere uygun)
4. `client/src/App.jsx`'e mount'ta tüm sesleri preload et (Karar 4 = B ise: sadece "Sesi Aç" basıldıktan sonra)

**Test:**
- Console'da `muzikCal('gunduz')` çağır, müzik başlasın
- `muzikCal('gece')` → crossfade ile geçsin

**Bitiş kriteri:** Howler.js yüklü, ses yöneticisi modülü hazır, manuel test başarılı.

---

### M3 — Mobil autoplay yönetimi + "Sesi Aç" düğmesi (Karar 4 = B ise)
**Amaç:** Mobil tarayıcılarda autoplay engeli aşılsın, kullanıcı sesli/sessiz tercihi belirlesin.

**Adımlar:**
1. `LobiEkrani.jsx`'in açılışına büyük "🔊 Sesi Aç" butonu (mevcut "Oda Kur" yanına veya altına)
2. Buton basıldığında:
   - localStorage'a `q-ses-aktif=true` yaz
   - Tüm sesleri preload et
   - Butonu küçük 🔊/🔇 toggle ile değiştir (lobi'de + oyun ekranında sağ üst)
3. Sayfa yenilenince localStorage kontrol → kullanıcı zaten açtıysa otomatik başla
4. Mobile + masaüstü için aynı buton (responsive küçülür)

**iOS Safari özel notu:** İlk dokunma olmadan ses başlatılamaz. Buton kullanıcı etkileşimi sayılır, sorun çözülür.

**Bitiş kriteri:** Yeni kullanıcı sayfayı açtığında "🔊 Sesi Aç" görür, bastığında ses başlar, localStorage'da kalıcı tercih.

---

### M4 — Faz bazlı müzik geçişleri (Karar 1 = B veya C ise)
**Amaç:** `App.jsx`'te faz değişimine göre otomatik müzik geçişi.

**Adımlar:**
1. `App.jsx`'te `socket.on('faz:degisti', ...)` dinleyicisinde:
   ```javascript
   useEffect(() => {
     function fazDegisti(d) {
       const muzikFazi = fazaMuzikEslestir(d.faz, d.kazananGrup);
       muzikCal(muzikFazi);
     }
     socket.on('faz:degisti', fazDegisti);
     return () => socket.off('faz:degisti', fazDegisti);
   }, []);
   ```
2. `fazaMuzikEslestir` haritası:
   - `lobi` / `rol_dagitimi` / `tanisma` / `sabah` / `tartisma` → `gunduz`
   - `gece` → `gece`
   - `savunma` → `savunma`
   - `bitis` → `bitis-{kazananGrup}` (ozg/gel/tarafsiz)
3. Crossfade süresi: 800-1500 ms

**Test:** Bir oyun başlat, fazlar arası geçişlerde müzik yumuşakça değişmeli.

**Bitiş kriteri:** Otomatik faz-müzik eşleşmesi sorunsuz, crossfade duyulabilir kalitede.

---

### M5 — UI ses efektleri (Karar 2 = B veya C ise)
**Amaç:** Belirli kullanıcı aksiyonlarında kısa ses efekti çalsın.

**Tetikleyiciler:**
| Aksiyon | Efekt |
|---|---|
| Oylama oyu verme | `oylama.mp3` |
| Köyden ayrılma (kendin veya başkası) | `ayrilma.mp3` |
| Kazan ekranına geçiş | `kazan.mp3` |
| (C ise) Yeni mesaj geldi | `bildirim.mp3` |
| (C ise) Hazır butonuna bas | `tikla.mp3` |
| (C ise) Modal aç/kapat | `tikla.mp3` |

**Uygulama:**
- İlgili komponentlerde event handler içinde `efektCal('oylama')` çağrısı
- Efekt volume bağımsız ayarlanabilir (master Bölüm M6)

**Bitiş kriteri:** Tüm aksiyonlar tetikliyor, efektler hafif ve atmosferi bozmuyor.

---

### M6 — Volume control UI
**Amaç:** Kullanıcı ses seviyesini ayarlasın.

**Adımlar:**
1. Yeni komponent: `client/src/ekranlar/SesAyarlariModal.jsx`
2. 3 slider:
   - Ana ses (master): 0-100, varsayılan 70
   - Müzik: 0-100, varsayılan 50
   - Efekt: 0-100, varsayılan 70
3. localStorage'a kaydet: `q-ses-master`, `q-ses-muzik`, `q-ses-efekt`
4. Modal açma: 🔊 butonuna **tıklamak** = aç/kapat toggle, **uzun basmak** veya **çift tıklama** = ayarlar modali
   - Veya: 🔊 buton + yanında ⚙️ ikonu

**Bitiş kriteri:** Slider'lar canlı çalışıyor, tercih kalıcı, sayfa yenilemede korunuyor.

---

### M7 — Master belge güncellemesi
**Amaç:** Ses katmanı master belgeye işlensin.

**Eklenecek bölümler:**
- **Yeni Bölüm 23 — SES & MÜZİK** (Bölüm 22 v1.1→v1.2'den sonra, son bölüm)
  - Atmosfer parçaları haritası
  - Efekt tetikleyiciler
  - Volume kontrolü
  - Mobil davranış
  - localStorage anahtarları
- **Bölüm 16 (Görsel Dil)** → "Sesli Dil" alt başlığı ekle, ton kuralları belirt
- **Bölüm 18 (V1 hedefleri)** → "Müzik & ses efektleri" maddesini ✅ olarak işaretle, detay için Bölüm 23'e referans
- **Bölüm 20 (Yol Haritası)** → "Müzik tamamlandı" satırı ekle

**Bitiş kriteri:** Master belge ses katmanını tam dokümante eder.

---

### M8 — Test (mobil + masaüstü)
**Amaç:** Tüm cihazlarda sorunsuz çalıştığını doğrula.

**Test matrisi:**
| Cihaz | Test |
|---|---|
| Chrome masaüstü | Sesi Aç → tüm fazlarda müzik + efektler |
| Firefox masaüstü | Aynı |
| Safari iOS | iPhone — autoplay engeli aşıldı mı, ses çalıyor mu |
| Chrome Android | Aynı |
| Sessiz mod | localStorage tercihi korunuyor mu |
| Volume slider | Anlık değişim çalışıyor mu |
| 4G/yavaş ağ | Preload süresi makul mı (<3sn) |

**Bitiş kriteri:** En az 4 cihaz/tarayıcıda sorunsuz, mobil autoplay sorunu yok.

---

### M9 — Deploy + Production smoke test
**Amaç:** Railway'e push, canlı URL'de test.

**Adımlar:**
1. `npm run build` → build başarılı, dosya boyutunu kontrol et
   - Beklenti: JS bundle ~290 → ~310 KB (Howler), CSS değişmez, public/ses ~1-2 MB ayrı serve edilir
2. `git add . && git commit -m "v1.4 — ses & müzik katmanı" && git push origin main`
3. Railway otomatik build (~3 dk)
4. Production URL'de test (Buğra mobilden dener)

**Bitiş kriteri:** Üretimde sesler çalıyor, performans iyi.

---

## 2. KARAR NOKTALARI (Buğra'dan onay alınacaklar)

| Karar | Önerim | Sor |
|---|---|---|
| Atmosfer kapsamı | B — Faz bazlı 4 parça | "Tek müzik mi 4 ayrı mı?" |
| UI efektler | C — Geniş (6-8 efekt) | "Sadece kritik 3 mü, hepsi mi?" |
| Kaynak | A — CC0 hazır (V1 hızlı) | "Hazır parçalar mı Suno AI mı?" |
| Varsayılan ses | B — Sessiz, kullanıcı açar | "Otomatik mi manuel mi başlasın?" |
| Volume control | 3 slider | "Tek toggle yeterli mi yoksa detaylı mı?" |
| Ses dosya formatı | MP3 (yaygın, küçük) | (teknik karar, varsayılan) |
| Build dahil mı? | client/public/ses/ → repo'ya commit | "Ses dosyaları repo'da mı dış CDN'de mi?" |

---

## 3. ÇALIŞMA KURALLARI

Master belge çalışma kurallarıyla aynı + ek:

1. **Telif:** Sadece CC0 / royalty-free veya orijinal üretim. Her dosyanın kaynak URL'sini `public/ses/LISANSLAR.md` dosyasına kaydet.
2. **Ton tutarlılığı:** Master Bölüm 16 görsel ton kuralı ses tarafında da geçerli — sıcak, organik, kapsayıcı. **Ama "stressiz/organik" = anonim folk değil**. Bkz. Bölüm 1.5 Ton Haritası.
3. **Queer ses dili ⭐:** Oyun 11 LGBTİ+ özgürlükçü rolü + İstanbul'dan kaçan farklı yaşam tarzlarını anlatır. Müzik bu kimliği yansıtmalı.
   - **Yasak:** Heteronormatif country/folk klişeleri, Anadolu folk, agresif rock/EDM, klişe fantastik orkestra, hetero romantik pop.
   - **Tercih:** Bölüm 1.5'teki referans sanatçıların **tarzına yakın** CC0/royalty-free alternatifler. Vokalsiz instrumental tercih edilir (dil bağımsız + cinsiyet bağımsız okuma).
   - **Drag Queen rolü vurgusu:** Savunma fazında ballroom/vogue altyapısı uygun — sahne hissi rolün ruhuyla uyumlu.
4. **Performans:** Toplam ses dosyaları < 2 MB (mobil veri dostu). Gerekirse 96 kbps MP3.
5. **Erişilebilirlik:** Hiçbir kritik bilgi sadece sesle iletilmesin (ses kapalıyken oyun aynı şekilde anlaşılmalı).
6. **Asimetri yok:** Tüm fazlar için ses kalite/kapsama dengeli, hiçbir oyuncu grubu müzik açısından "üstün"/daha atmosferik hissetmesin. **Bitiş ekranı istisna:** Kazanan gruba göre ton (özgürlükçü pride / gelenekçi yas / tarafsız iç dönük) gerçek bir tasarım kararı, asimetri değil.

---

## 4. HATA MODLARI

| Belirti | Olası sebep | Çözüm |
|---|---|---|
| Sesler iOS Safari'de çalmıyor | Autoplay engeli, kullanıcı etkileşimi gerek | M3 "Sesi Aç" butonu zorunlu |
| Crossfade kesik | Müzik dosyaları farklı sample rate | Tümünü 44.1 kHz / stereo'ya normalize et |
| Bundle çok büyüdü | Howler tüm codec'leri içeriyor | `howler/dist/howler.core.min.js` kullan |
| Müzik loop'ta tıkırtı | Dosya başı/sonu sessizlik yok | ffmpeg ile başlangıç/bitiş 50ms fade |
| Mobile veri kullanımı şikayet | Auto-preload çok dosya | Lazy load: sadece şu anki faz preload, sonraki on-demand |
| Volume slider çalışmıyor | localStorage type problem | parseFloat ile dönüştür, NaN fallback 0.5 |

---

## 5. BAĞLAM HARITASI (eklenecek dosyalar)

```
q-v11/
├── client/
│   ├── public/
│   │   └── ses/                       ← YENİ
│   │       ├── muzik/
│   │       │   ├── gunduz.mp3
│   │       │   ├── gece.mp3
│   │       │   ├── savunma.mp3
│   │       │   ├── bitis-ozg.mp3
│   │       │   ├── bitis-gel.mp3
│   │       │   └── bitis-tarafsiz.mp3
│   │       ├── efekt/
│   │       │   ├── tikla.mp3
│   │       │   ├── oylama.mp3
│   │       │   ├── ayrilma.mp3
│   │       │   ├── kazan.mp3
│   │       │   └── bildirim.mp3
│   │       └── LISANSLAR.md
│   ├── src/
│   │   ├── ses/                       ← YENİ
│   │   │   ├── SesYoneticisi.js
│   │   │   └── sesHaritasi.js
│   │   └── ekranlar/
│   │       ├── SesAyarlariModal.jsx   ← YENİ
│   │       └── SesAyarlariModal.css   ← YENİ
│   └── package.json                   ← howler eklenir
```

**Master belgede eklenecek:**
- Bölüm 23 (Ses & Müzik) — yeni
- Bölüm 16, 18, 20 — ek satırlar

---

## 6. BİTİŞ KRİTERLERİ (planın tamamı için)

- [ ] M0: 4 karar onaylandı
- [ ] M1: Ses dosyaları toplandı, `public/ses/` altında
- [ ] M2: Howler.js entegre, SesYoneticisi modülü çalışıyor
- [ ] M3: Sesi Aç düğmesi mobil + masaüstünde çalışıyor (Karar 4 = B ise)
- [ ] M4: Faz bazlı müzik geçişleri crossfade ile çalışıyor (Karar 1 ≠ A ise)
- [ ] M5: UI ses efektleri tetikleniyor (Karar 2 ≠ A ise)
- [ ] M6: Volume control UI hazır
- [ ] M7: Master belge Bölüm 23 yazıldı
- [ ] M8: Mobil + masaüstü test başarılı
- [ ] M9: Production'da canlı

**Plan tamamlandığında:**
- Q v1.4 ses katmanlı, paylaşılabilir
- Mobil veri dostu (<2 MB toplam ses)
- Kullanıcı tercihleri kalıcı
- V1 yol haritasından "Müzik & ses efektleri" maddesi ✅

---

## 7. SONRAKİ ADIM (planı kim açtıysa)

1. Master belge v1.3 + ana plan + bu planı 5 dakika oku
2. Buğra'ya **M0 kapsam onayı** sor (4 karar)
3. Onaya göre M1'den itibaren ilerle
4. Her büyük adımdan sonra durum özetle

**Asla atlama:**
- Buğra onayı almadan ses dosyası seçme/üretme
- M0 olmadan M1'e geçme
- Telifsiz olmayan ses kullanma

---

**Plan sahibi:** Buğra
**Plan yazarı:** Claude (q-v1.3 deploy sonrası, 2026-05-13)
**Sonraki revizyon:** M0 onaylandıktan sonra teknik detaylar netleşir.
