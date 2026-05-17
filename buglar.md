# Q — Bug Listesi

T6/T7 sırasında bulunan hatalar burada izlenir. Format için ajan-plani.md → T7'ye bakın.

---

### Bug #1 — Host köyden ayrılınca oyun sabah fazında donuyor
- **Faz/ekran:** Sabah (Faz 6)
- **Tarih:** 2026-05-12
- **Sürüm:** v1.2
- **Adımlar:** 1 gerçek oyuncu (host) + 5 bot ile oyun başlat. Host'un rolü Kaan'a karşı savunmasız olsun (örn. Transseksüel). Kaan host'u hedef alırsa host gece 1'de köyden ayrılır.
- **Beklenen:** Master Bölüm 15'e göre host köyden ayrılırsa sıradaki gerçek oyuncuya host görevi geçer. Köyde gerçek oyuncu kalmadıysa oyun otomatik biter.
- **Gerçekleşen:** Sabah ekranına geçiliyor ama "Tartışmaya Geç →" butonu yalnızca host'ta görünür. Host (artık ayrılan) basamadığı için oyun sabah fazında sonsuza kadar bekler. Tek gerçek oyuncu host olduğundan kimse devam ettiremez.
- **Öncelik:** Yüksek — oyunu durduran. Tek-gerçek-oyuncu test senaryosunu engelliyor.
- **Durum:** Düzeltildi (2026-05-12)
- **Düzeltme:**
  1. Master belge Bölüm 15 güncellendi: "Host köyden ayrılır" + "Köyde gerçek oyuncu kalmazsa" satırları eklendi.
  2. `server/index.js` içinde 3 yardımcı fonksiyon eklendi:
     - `hostuTransferEt(oda)` — mevcut host köyden ayrıldıysa ilk gerçek+köyde+bağlı oyuncuya host görevi geçer
     - `gercekOyuncuKoydeMi(oda)` — köyde bot olmayan, ayrılmamış, bağlantısı kopmamış oyuncu var mı kontrol eder
     - `erkenBitisKazanani(oda)` — köyde kalan özgürlükçü/gelenekçi sayısına göre kazanan grup; eşitse özgürlükçüler
  3. Ayrılma noktalarında (sabah çözümleme + oylama sonrası) `ayrilmaSonrasiKontrol(oda)` çağrılır — host transfer eder, gerçek oyuncu kalmadıysa `bitiseBasla()` ile bitiş fazına geçer.

---

### Bug #2 — 1. oylama eşitlikte sonsuz tekrar tartışma döngüsü
- **Faz/ekran:** Faz 7 (1. Oylama → Ek Tartışma → Tekrar Oylama)
- **Tarih:** 2026-05-13
- **Sürüm:** v1.2
- **Adımlar:** Az oyuncu (3 vb.) kaldığında 1. oylamada hiç kimse en çok oyu alamayınca (eşitlik) "60sn ek tartışma" başlar. Ek tartışma sonu yine 1. oylama, yine eşitlik → tekrar ek tartışma → sonsuz döngü.
- **Beklenen:** Master Bölüm 11 — "Kimse gitmezse 60sn tekrar tartışma → tekrar oylama. 2. oylama sonuç çıkmazsa direkt geceye." 1. oylama eşitlikte de bir noktada geceye geçmeli (master belirsiz, kural eklenmeli).
- **Gerçekleşen:** 1. oylama eşitlikte savunma çıkmaz → 2. oylama hiç başlamaz → "direkt geceye" tetikleyici tetiklenmez → ek tartışma 60sn'lik döngü sonsuz tekrarlar.
- **Öncelik:** Orta — oyunu durdurmaz (rastgele biri bir noktada savunmaya çıkarsa kırılır) ama oyun uzayabilir.
- **Durum:** Düzeltildi (2026-05-13). Buğra: **kural A** — ek tartışma maksimum 1 kez, sonra direkt geceye.
- **Düzeltme:**
  1. Master Bölüm 11 ("Kimse Gitmezse") satırları güncellendi — ek tartışma hakkı 1 ile sınırlı, sonra direkt geceye.
  2. `server/index.js`'te `oda.oyun.tekrarTartismaYapildi` flag'ı eklendi. İki ayrılma noktasında (1. oylama eşitlik + 2. oylama %51 yok) kontrol edilir: flag set ise direkt `geceyeBasla(oda)`, değilse flag set + `tekrarTartismayaBasla(oda)`.
  3. `geceyeBasla()` başında flag sıfırlanır — her yeni gün için temiz "1 ek tartışma" hakkı.

---

### Bug #3 — Mobilde ses ayarları slider'ları tepki vermiyor
- **Faz/ekran:** Ses Ayarları Modal'ı (⚙️ ile açılır)
- **Tarih:** 2026-05-14
- **Sürüm:** v1.4
- **Adımlar:** Mobilde lobi veya oyun ekranında ⚙️ ikonuna bas → 3 slider görünür (Ana Ses / Müzik / Efekt). Slider thumb'ı parmakla sürüklemeye çalış.
- **Beklenen:** Slider parmak hareketine göre değer değişsin, çalan müziğin sesi anında uygulansın (masaüstünde böyle çalışıyor).
- **Gerçekleşen:** Mobilde slider tepki vermiyor — değer değişmiyor.
- **Öncelik:** Düşük — Buğra "önemli değil" dedi. V1.5'e bırakıldı.
- **Durum:** Düzeltildi (2026-05-16, v1.7)
- **Düzeltme:**
  1. `.ses-ayar-slider` üzerine `touch-action: pan-x` ve `-webkit-tap-highlight-color` eklendi.
  2. `@media (hover: none) and (pointer: coarse)` bloğunda track 10px, thumb 24px, dikey 10px padding ile geniş dokunma hedefi.
  3. Modal kart `<div>` sarmalayıcısına `onTouchStart` + `onTouchEnd` stopPropagation eklendi (mobilde slider dokunuşu arka plana sızıp modalı kapatmıyor).
  4. `::-ms-thumb` + `::-ms-track` tamamlandı, tüm tarayıcılarda tutarlı.
- **Dosyalar:** `client/src/ses/SesAyarlariModal.jsx` + `client/src/ses/SesAyarlariModal.css`

---

### Bug #4 — Müzik kuyruğu bitince tekrar başlamıyor
- **Faz/ekran:** Tüm gündüz/gece fazları
- **Tarih:** 2026-05-16
- **Sürüm:** v1.7
- **Adımlar:** Oyunda müzik çalsın → bir parça bitince sıradaki çalsın → o da bitince yeni parça çalmıyor.
- **Beklenen:** Master Bölüm 20: Parçalar crossfade ile rotasyon, faz boyunca süreklilik.
- **Gerçekleşen:** Sıradaki parça bittiğinde kuyruk duruyor.
- **Öncelik:** Yüksek — atmosfer kaybı
- **Durum:** Düzeltildi (2026-05-16, v1.7.1)
- **Olası sebep:** `SesYoneticisi.js` rotasyon listesi tüketildiğinde resetlenmiyor; `onend` callback sonsuz döngü garanti etmiyor.
- **Dosyalar:** `client/src/ses/SesYoneticisi.js`

---

### Bug #5 — Rol Dağıtımı süresi 30 sn çok uzun, 10 sn olsun
- **Faz/ekran:** Faz 3 — Rol Dağıtımı
- **Tarih:** 2026-05-16
- **Sürüm:** v1.7
- **Adımlar:** Lobiden oyuna geçtikten sonra rol kartı ekranı max 30 sn bekliyor.
- **Beklenen:** Max 10 sn (Buğra talebi).
- **Öncelik:** Orta — UX hızlandırma
- **Durum:** Düzeltildi (2026-05-16, v1.7.1)
- **Düzeltme:** `SURE_ROL = 10_000` (`server/index.js`); master Bölüm 11 Faz 3 ve Bölüm 12 ekran özeti güncelle.
- **Dosyalar:** `server/index.js`, `q-master-belge12.md`

---

### Bug #6 — Masaüstünde ⚙️ ayarlar butonu sohbet "Köy Meydanı" başlığının üstüne kaymış
- **Faz/ekran:** Tüm oyun ekranları (masaüstü)
- **Tarih:** 2026-05-16
- **Sürüm:** v1.7
- **Adımlar:** Masaüstü ekranında oyun aç → sağ üstte ⚙️ butonu ile sohbet panelinin "Köy Meydanı" başlığı çakışıyor.
- **Beklenen:** Ayarlar butonu sohbet panelinin başlığıyla çakışmasın.
- **Öncelik:** Orta — UI
- **Durum:** Düzeltildi (2026-05-16, v1.7.1)
- **Düzeltme:** `OyunDuzeni.css` sağ üst pozisyonu / `SesButonu` z-index ve top değeri ayarlanmalı.
- **Dosyalar:** `client/src/ekranlar/OyunDuzeni.css`, `client/src/ses/SesButonu.css`, `client/src/ekranlar/SohbetPaneli.css`

---

### Bug #7 — Botlar tüm canlı oyuncular hazır basınca hemen bassın
- **Faz/ekran:** Tanışma, Tartışma, Savunma, Oylama Sonucu (her "Hazır" butonu olan faz)
- **Tarih:** 2026-05-16
- **Sürüm:** v1.7
- **Adımlar:** Az gerçek oyuncuyla oyun → tüm gerçek oyuncular "Hazır" basıyor → botlar kendi gecikmelerini bekliyor → faz uzun sürüyor.
- **Beklenen:** Tüm gerçek oyuncular hazır basınca botlar gecikmesiz "Hazır" emit etsin → faz erken bitsin.
- **Öncelik:** Orta — UX hızlandırma
- **Durum:** Düzeltildi (2026-05-16, v1.7.1)
- **Düzeltme:** `server/index.js` bot otomasyon kontrolünde her "hazır" geldiğinde "gerçek oyuncuların hepsi hazır mı?" kontrolü; öyleyse kalan botları anında hazır işaretle.
- **Dosyalar:** `server/index.js`

---

### Bug #8 — Bitiş ekranında ⚙️ ve 🔊 butonları kazanan grup zemini arkasında kalıyor
- **Faz/ekran:** Faz 8 — Bitiş
- **Tarih:** 2026-05-16
- **Sürüm:** v1.7
- **Adımlar:** Oyun bittiğinde "X Kazandı" yeşil/kırmızı zemin görünür → sağ üst ⚙️ + 🔊 butonları zeminin arkasında kalıyor, tıklanamıyor.
- **Beklenen:** Butonlar üstte ve tıklanabilir.
- **Öncelik:** Orta — UI
- **Durum:** Düzeltildi (2026-05-16, v1.7.1)
- **Düzeltme:** `BitisEkrani.css` kazanan gradient banner z-index düşürülmeli veya butonların container'ı yükseltilmeli.
- **Dosyalar:** `client/src/ekranlar/BitisEkrani.css`, `client/src/ses/SesButonu.css`
