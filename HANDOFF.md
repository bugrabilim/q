# HANDOFF — Q (Queer Quest Quench)

**Devir tarihi:** 2026-09-10 · **Sürüm:** v1.9 · **Canlı:** https://q-11.up.railway.app
**Repo:** https://github.com/bugrabilim/q · **Dal:** `main`

> Bu dosya, yerel klasörden buluta geçiş için yazıldı. Yerel makinede artık çalışılmayacak.
> **Tek doğru kaynak = `q-master-belge12.md`** (bu repoda, kökte). Bu dosya sohbet devri + envanterdir.

---

## 1. BU SOHBETTE NE KONUŞULDUK / NE YAPTIK

Oturum, "projede neredeyiz?" sorusuyla başladı ve tamamen **görsel kimliğe** dönüştü. Oyunun mekaniği zaten v1.8.35'te bitmişti; bu oturum oyunu metinsel görünümden çıkarıp görsel bir kimliğe kavuşturdu → **v1.9**.

### İstek sırası (Buğra'nın kendi cümleleriyle)
1. "projede neredeyiz, detaylı incele ve rapor ver"
2. "görsel yapalım" → sıcak piksel-art tema seçildi
3. "B lora iyi. renk okey." → font + palet onaylandı
4. "logoyu yapalım" → **V3 (yatay)** seçildi
5. "Favicon da ekle"
6. "oyunu metinsel formattan çıkartıp, görsel formata nasıl sokalım?" → önce bedava deneme
7. "kaç oyuncu varsa o kadar ev olsun. ormanlık ve derenin olduğu doğal güzelliği yüksek olan bir köy görseli olsun."
8. "arka plan görseli oturmamış." → paneller yarı saydam yapıldı
9. "gönder" → 1. deploy
10. "mobil app ve webde çalışacak şekilde bu oyunu 3d yapabilir misin?" → **2.5D önerildi, kabul edildi.** Mobil app ertelendi.
11. "Rol çevirme kartı yap bir göreyim bakalım." → 2.5D kart yapıldı
12. "Gönder" → 2. deploy
13. "master döküman oluştur yeni sessiondan devam edeceğim" → master belge v1.9'a güncellendi
14. "githubdan oku diyerek kaldığımız yerden başlatabileyim" → belge GitHub'a taşındı

### Alınan kararlar (kilitli)
| Karar | Sonuç |
|---|---|
| Görsel yön | **Sıcak piksel-art** (Stardew tabanı) — parşömen/ahşap palet |
| Font | **Lora** (başlık + alıntı) + system sans (UI). Caveat yok. |
| Logo | **Yatay** varyant (madalyon q + ad + gökkuşağı şeridi) |
| 3D | **2.5D** (CSS 3D transform). Gerçek 3D/WebGL **yok**. |
| Mobil app | **Ertelendi** — şimdilik responsive web |
| Grup renkleri | **Değişmedi** (oyun mantığına bağlı): yeşil/turuncu/kırmızı |
| Köy sahnesi | Kod-üretimli SVG. Dış görsel dosya/stok asset **yok**. |

### Yapılan iş (kod)
| # | İş | Dosya |
|---|---|---|
| 1 | Tema: mavi-yeşil → sıcak parşömen/ahşap (22+ CSS dosyası) | `client/src/index.css` + tüm ekran CSS'leri |
| 2 | Yatay logo (SVG bileşen) | `client/src/Logo.jsx` |
| 3 | Favicon (madalyon q + grup yayları) | `client/public/favicon.svg` |
| 4 | Dinamik köy sahnesi | `client/src/bilesenler/KoySahnesi.jsx/css` |
| 5 | Panel saydamlığı (köy görünsün) | `client/src/ekranlar/OyunDuzeni.css`, `SohbetPaneli.css`, `GeceEkrani.css` |
| 6 | 2.5D rol kartı çevirme | `client/src/ekranlar/RolKartiEkrani.jsx/css` |
| 7 | Master belge v1.9 | `q-master-belge12.md` |

**Deploy commit'leri:** `daaccd2` (tema+logo+favicon+köy) · `6d25119` (2.5D kart) · `d849672`+`639fc82` (belgeler GitHub'a)

### Köy sahnesi — nasıl çalışıyor
`KoySahnesi.jsx` tamamen kodla çizilen SVG: dağlar, katmanlı tepeler, orman silüeti, çayır, köy meydanı (çeşme + kıraathane), köprülü dere, ağaçlar, çiçekler.
- **`oyuncuSayisi` prop → ev sayısı** (12 noktalı NOKTALAR dizisinden, y'ye göre arkadan öne sıralanır)
- **`gece` prop → gece/gündüz paleti** (faz `gece` veya `savunma` ise true)

### 2.5D rol kartı — nasıl çalışıyor
`perspective: 1400px` + `transform-style: preserve-3d` + `backface-visibility: hidden`.
Kart kapalı ahşap yüzle gelir (madalyon mühür + "Rolün hazır / Karta dokun, çevir") → dokununca `rotateY(180deg)` (0.85s) → arkada gerçek rol kartı.
"Anladım" butonu **sadece kart çevrilince** görünür. Çevrildikten sonra kart normal akışa dönüp tam boy olur. `prefers-reduced-motion` destekli.

### Belgede düzeltilen hata
Master belge, **Necmi forum bağı** ve **Dul gece mekaniği** için "🔲 henüz kodlanmadı" diyordu. **Yanlıştı** — ikisi de v1.8.31'de kodlanmış. Koddan doğrulandı:
- `forumTanidikSayisi` → `server/index.js`, `client/src/ekranlar/RolKartiEkrani.jsx`, `RolKartPaneli.jsx`
- Dul `karakterAnilari` → `server/geceMotoru.js`
Aşama 3 artık **4/4 tam** olarak işaretli.

---

## 2. YARIM KALANLAR / BİLİNEN DURUMLAR

| Durum | Detay |
|---|---|
| ⚠️ **Köy sahnesi görsel onayı yok** | "Oturmamış" geri bildirimi sonrası düzeltme yapıldı ve deploy edildi, ama **Buğra canlıda onaylamadı**. Yeni oturumda ilk iş: telefondan bakıp onaylamak. |
| ⚠️ **Screenshot aracı bozuktu** | Tüm oturum boyunca `preview_screenshot` 30 sn timeout verdi. Doğrulama DOM eval ile yapıldı. Görsel doğrulama yapılamadı. |
| ℹ️ **Belge iki yerde** | `q-master-belge12.md` + `DEVAM.md` hem repo kökünde hem (yerel) `Desktop/q` kökünde vardı. Repo kopyası canoniktir. Yerel siliniyorsa sorun kalmaz. |
| ℹ️ **38 portre eksik** | Sadece 12 portre var (Kenney CC0 + CSS filter). Yeni sıcak temayla tam uyumlu değil. |
| 🔲 **Aşama 4 (roman)** | 4 karar bekliyor: anlatıcı / ana çatışma / dil / yayınevi. Taslak: `docs/roman-taslagi-v1.md` |

---

## 3. SIRADAKİ ADIMLAR (öncelik sırasıyla)

1. **Köy sahnesini canlıda onayla** (telefondan) — düzeltme tuttu mu?
2. 🎨 **Özgün 38 karakter portresi** — en büyük görsel eksik. Master Bölüm 23 Aşama 1: AI (Midjourney/Leonardo) veya freelance ($30-80/portre). Yeni sıcak palete uyumlu olmalı.
3. 🎨 **Rol/aksiyon ikonları** — şu an emoji, piksel ikona geçilecek.
4. 🎨 Köy sahnesini diğer ekranlara yay (lobi, bitiş).
5. 📕 **Roman (Aşama 4)** — 4 karar bekliyor.
6. 🔲 Senaryo sistemi · ipucu sistemi · i18n (TR+EN) · resmi QA matrisi (T6).

---

## 4. DOSYA ENVANTERİ (bu repo)

```
q-v11/                          ← git kökü, GitHub: bugrabilim/q
├── HANDOFF.md                  ← bu dosya
├── CLAUDE.md                   ← yeni oturum için kalıcı talimat
├── q-master-belge12.md         ← TEK DOĞRU KAYNAK (v1.9, 103 KB, 24 bölüm)
├── DEVAM.md                    ← kısa "nerede kaldık" özeti
├── buglar.md                   ← bug kaydı (açık bug yok)
├── README.md
├── package.json                ← npm run dev / npm run kur
│
├── client/                     ← React + Vite
│   ├── public/favicon.svg      ← (v1.9) madalyon q
│   └── src/
│       ├── Logo.jsx            ← (v1.9) yatay logo
│       ├── index.css           ← (v1.9) TÜM tema değişkenleri burada
│       ├── bilesenler/
│       │   ├── KoySahnesi.jsx/css        ← (v1.9) dinamik köy
│       │   └── KarakterAnisiBaneri.jsx/css
│       ├── ekranlar/           ← 14 ekran (Acilis, Lobi, RolKarti, Tanisma,
│       │                          Gece, Sabah, Tartisma, Oylama, Bitis, ...)
│       └── veri/karakterAnilari.json     ← 190 anı (38 karakter × 5)
│
├── server/                     ← Node + Express + Socket.io
│   ├── index.js                ← ana sunucu + faz akışı
│   ├── geceMotoru.js           ← 38 rol gece mekaniği + kazanma kontrolleri
│   ├── roller.js               ← rol tanımları
│   ├── rolDagitici.js          ← dağıtım + rol havuzu (B seçeneği)
│   └── test-gorev.js           ← 22 test
│
├── qa/                         ← QA matrisi
└── docs/                       ← (2026-09-10'da yerelden taşındı)
    ├── hikayeler-v2.md         ← HİKÂYE KANONU (103 KB) ⭐
    ├── hikayeler-v1.md         ← arşiv
    ├── hikayeler/              ← 38 karakterin ~1 sayfalık hikâyesi
    ├── roman-taslagi-v1.md     ← roman taslağı (47 KB)
    ├── q-wiki/                 ← 47 wiki sayfası
    ├── ajan-plani.md · ajan-plani-ses-muzik.md · faz1-mekanik-kararlar.md
    ├── tema-sunucu.js
    └── handoff/                ← bu sohbette paylaşılan dosyalar
        ├── rol-karti-demo.html              ← 2.5D kart demosu (Buğra'ya gösterildi)
        └── rol-karti-demo-onizleme.html     ← önizleme varyantı
```

### Repoya ALINMAYANLAR (yerelde kaldı — karar bekliyor)
| Klasör | Boyut | Ne? |
|---|---|---|
| `ses-arac/` | **416 MB** | Ses üretim araçları — git için çok büyük |
| `ses-ham/` | 29 MB | Ham mp3 kaynakları (16 dosya) |
| `karakter/` | 7.1 MB | Kenney CC0 karakter paketi (698 dosya, yeniden indirilebilir) |

> Oyunun **kullandığı** ses ve portreler zaten `client/public/` içinde ve repoda. Yukarıdakiler **kaynak/ham** malzeme.

---

## 5. ÇALIŞTIRMA NOTLARI

```bash
npm run kur      # tek seferlik kurulum (kök + client + server)
npm run dev      # sunucu :3001 + istemci :5173
```

**Hızlı test için süreleri kısalt:**
```bash
Q_BASVURU_MS=3000 Q_TANISMA_MS=10000 Q_ROL_MS=8000 Q_GECE_MS=15000 \
Q_SABAH_MS=8000 Q_TARTISMA_MS=30000 Q_SONUC_MS=10000 npm run dev
```

**Test:** `node server/test-gorev.js` (22 test)

**Deploy:** `git push origin main` → GitHub `bugrabilim/q` → **Railway otomatik build+deploy** (~2-3 dk).
Ek adım yok, Railway main dalını izliyor.

---

## 6. ÇALIŞMA KURALLARI (Buğra ile)

1. **Türkçe konuş** — kod yorumu, değişken, UI metni, cevap hepsi Türkçe.
2. **Kısa ve listeli cevap ver.** Uzun paragraf istemiyor.
3. **Buğra teknik bilmiyor** — "şu butona bas", "şu komutu yapıştır" diye net söyle.
4. **Tasarım kararında onay al.** Kullanıcı arayüzünü etkileyen her şeyde sor.
5. **Mobilden cevap veriyor** — kısa net soru sor.
6. **Master belgeden çıkma.** Tutarsızlık görürsen önce sor.
7. Büyük adımdan önce planı söyle, onay al.

---

## 7. YENİ OTURUMDA YAPIŞTIRILACAK İLK MESAJ

```
Bu repodan devam ediyoruz: https://github.com/bugrabilim/q

Önce şu üç dosyayı oku:
1. HANDOFF.md          — son sohbetin tam devri (ne yaptık, ne kaldı)
2. q-master-belge12.md — tek doğru kaynak (v1.9, tasarım kararları)
3. DEVAM.md            — kısa özet

Sonra bana kısa ve listeli olarak şunu söyle:
- Proje nerede kaldı
- Sıradaki iş ne
- Benden ne karar bekliyorsun

Kurallar: Türkçe konuş, kısa/listeli cevap ver, ben teknik bilmiyorum,
tasarım kararlarında bana sor. Canlı: https://q-11.up.railway.app
```

---

**Son güncelleme:** 2026-09-10 · v1.9 · Bu devir notu `q-master-belge12.md`'nin yerini tutmaz — o hâlâ tek doğru kaynak.
