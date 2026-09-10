# Q — Ajan Planı (v1.0)

> Bu plan, yeni bir Claude oturumu veya başka bir geliştirici tarafından **bağımsız olarak** çalıştırılabilecek şekilde yazılmıştır. Her görev kendi içinde tanımlı, bitiş kriteri net.

---

## 0. ÖNBİLGİ — Burayı önce oku

### Proje
- **Ad:** Queer Quest Quench (kısaltma: q)
- **Tip:** Sosyal dedüksiyon oyunu prototipi (vampir-köylü ailesi)
- **Sürüm:** v1.2
- **Mevcut hâli:** Tam çalışan local prototip

### Önemli dosyalar
- **Master belge:** `C:\Users\bugra\Desktop\q\q-master-belge12.md` — tek doğru kaynak. Tutarsızlık görürsen önce buraya bak.
- **Çalışan kod:** `C:\Users\bugra\Desktop\q\q-v11\` — isim eski ama içerik v1.2
- **Backend:** Node.js + Express + Socket.io (`server/`, port 3001)
- **Frontend:** React + Vite (`client/`, port 5173)
- **DB:** RAM — kalıcı değil

### Kalan iki ana iş
1. **Deploy** — Railway veya Fly.io'ya al
2. **Uçtan uca test** + bug avı

### Kullanıcı profili (Buğra)
- Teknik bilmiyor — komutları "şunu yapıştır" netliğinde söyle
- Türkçe konuşur, mobilden cevap verebilir (uzun teknik açıklama yapma)
- Tasarım/UX kararları için **onay iste**
- Büyük adımlardan önce **plan sun, başlayayım mı diye sor**

---

## 1. GÖREV LİSTESİ

### T1 — Local çalıştırma doğrulama 🟢 ÖNCE BU
**Amaç:** Kod local'de hâlâ çalışıyor mu doğrula. Deploy'a geçmeden önce şart.

**Adımlar:**
1. `cd "C:\Users\bugra\Desktop\q\q-v11"`
2. `npm install` (node_modules yoksa)
3. `npm run dev` → backend (3001) + frontend (5173) eşzamanlı başlar
4. Tarayıcıda `http://localhost:5173` aç

**Doğrulama (smoke test):**
- [ ] Açılış ekranı geliyor mu (isim + oda kodu)
- [ ] Oda oluştur → lobiye gir
- [ ] "Bot ekle" 5-6 kez bas → kadro dolsun
- [ ] "Oyunu Başlat" → faz akışı çalışıyor mu (Rol → Tanışma → Gece → Sabah → Tartışma → Oylama → Bitiş)
- [ ] Bot otomasyonu çalışıyor mu (botlar otomatik cevap veriyor mu)

**Hata olursa:**
- `npm install` başarısız: Node.js sürümü 18+ olduğunu kontrol et (`node -v`)
- Port çakışması: `Q_PORT=3002 npm run dev` veya çakışan portu kapat
- Server hatası: log'da hata mesajını oku, master belgenin Bölüm 17'sini kontrol et

**Bitiş kriteri:** Local'de 6 oyunculu tam bir tur botlarla oynanabiliyor.

---

### T2 — Deploy platformu seçimi ⚠️ ONAY GEREKİR
**Amaç:** Q'yu nereye host edeceğini belirle.

**Buğra'ya sor:**
> "Deploy için iki seçenek var: **Railway** (kolay, web UI, GitHub bağlantı, ~$5/ay kredisi free tier) veya **Fly.io** (daha yapılandırılabilir, küresel edge ama daha karmaşık). Teknik tarafı sen yönetmeyeceksen Railway öneririm. Hangisini seçelim?"

**Varsayılan önerim:** Railway. Sebep: web UI, GitHub push → auto-deploy, kredi kartı bağlama esnekliği, Türkiye'den erişim sorunsuz.

**Bitiş kriteri:** Platform seçildi, hesap açıldı (veya açılacağı an plan kuruldu).

---

### T3 — Deploy hazırlığı (kod tarafı)
**Amaç:** Production'a uygun build/start yapısı.

**Yapılacak değişiklikler:**

#### 3a. `server/index.js` — production'da client'ı serve et
```javascript
// Production: client/dist klasörünü static olarak serve et
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/dist/index.html"));
  });
}
```

#### 3b. Root `package.json` — build/start scripts
```json
{
  "scripts": {
    "dev": "concurrently \"npm run server\" \"npm run client\"",
    "server": "cd server && npm start",
    "client": "cd client && npm run dev",
    "build": "cd client && npm install && npm run build && cd ../server && npm install",
    "start": "cd server && NODE_ENV=production node index.js"
  }
}
```

#### 3c. `.gitignore` (yoksa oluştur)
```
node_modules
client/dist
.env
.DS_Store
*.log
```

#### 3d. PORT env variable kullan
`server/index.js`'te:
```javascript
const PORT = process.env.PORT || 3001;
```
(Railway otomatik PORT atar; kodun bunu okuması şart.)

#### 3e. CORS production-safe
`server/index.js`:
```javascript
const allowedOrigins = process.env.NODE_ENV === "production"
  ? [process.env.CLIENT_URL || "*"]
  : ["http://localhost:5173"];
```

**Test:**
1. `npm run build` çalışıyor mu
2. `npm start` ile production modunda yerelde tek port'tan çalışıyor mu

**Bitiş kriteri:** `NODE_ENV=production npm start` ile tek port üzerinden hem frontend hem WebSocket çalışıyor.

---

### T4 — GitHub repo
**Amaç:** Railway'in deploy edebileceği bir repo.

**Adımlar:**
1. Buğra'ya sor: "Repo **private** mı **public** mi?" (Private öneriyorum — kod ticari olabilir)
2. GitHub'da yeni repo oluştur: `q` veya `queer-quest-quench`
3. `cd q-v11 && git init && git add . && git commit -m "v1.2 initial commit"`
4. `git remote add origin [REPO_URL]`
5. `git branch -M main && git push -u origin main`

**Bitiş kriteri:** Kod GitHub'da, main branch'te.

---

### T5 — Railway deploy
**Amaç:** Production URL.

**Adımlar:**
1. Buğra Railway hesabı açar (`railway.app` → GitHub ile giriş)
2. "New Project" → "Deploy from GitHub repo" → Q reposunu seç
3. Railway otomatik build başlatır
4. **Build başarısızsa:** log'u oku, T3'teki adımları kontrol et
5. Build başarılıysa: Railway bir `*.up.railway.app` URL'i verir
6. **Environment variables** ekle (Railway dashboard):
   - `NODE_ENV=production`
   - `CLIENT_URL=https://[verilen-railway-url].up.railway.app`
7. Yeniden deploy

**Test (production):**
- [ ] URL açılıyor
- [ ] Lobiye girilebiliyor
- [ ] WebSocket bağlanıyor (Network tab'da WS frame'leri akıyor olmalı)
- [ ] Bot ekle + tur oyna
- [ ] Mobile cihazdan da test et

**Bitiş kriteri:** Üçüncü bir kişi paylaştığın URL'den oyuna girebilir.

---

### T6 — Uçtan uca test senaryoları
**Amaç:** Tüm fazları + edge case'leri kapsayan test koşusu.

**Test matrisi:**

| Senaryo | Oyuncu | Beklenen sonuç |
|---|---|---|
| Standart 6 kişi | 1 + 5 bot | 8 faz tamamlanır, kazanan grup belli |
| Kalabalık 12 kişi | 1 + 11 bot | Performans iyi, kararlı |
| Kaan görevi tamamlanır | en az 1 oyun | Kaan kazanma koşulu doğru çalışır |
| Kaan görevi tamamlanamaz | en az 1 oyun | Diğer gruplar kazanır |
| Bütün roller çıkar | 12 oyuncu | 11 rolün her biri en az 1 oyunda dağıtılır |
| Ayrılanların sohbeti | herhangi tur | Trans + ayrılanlar kanalı açık |
| Fobik gece kanalı | Kaan/Necmi/Azra olan tur | 3'ü gece birbiriyle yazışabilir |
| Mobile responsive | telefondan aç | Alt sekme bar (Köy/Oyun/Sohbet) çalışır |
| Yeniden başlat | bitiş ekranı | "Yeni oyun" lobi'ye döner |
| Sağ üst çıkış | herhangi faz | Oyundan çıkış doğru çalışır |

**Test kayıt formatı:** her senaryo için:
- Tarih + sürüm
- Sonuç: ✅ ya da ❌ + açıklama
- Ekran görüntüsü (varsa)

**Bitiş kriteri:** En az 8 senaryo ✅ olarak işaretlendi.

---

### T7 — Bug raporu + düzeltme
**Amaç:** Bulunan hataları kayda al, önceliklendir, çöz.

**Bug raporu formatı** (her bug için):
```markdown
### Bug #N — [Kısa başlık]
- **Faz/ekran:** Hangi faz veya ekran
- **Adımlar:** Nasıl tekrar üretilir
- **Beklenen:** Ne olmalıydı (master belgeye göre)
- **Gerçekleşen:** Ne oldu
- **Öncelik:** Yüksek (oyunu durduran) / Orta (UX bozan) / Düşük (kozmetik)
- **Durum:** Açık / Düzeltildi / Bekliyor onay
```

**Bug dosyası:** `q-v11/buglar.md`

**Düzeltme sırası:**
1. Yüksek öncelik → hemen
2. Orta → toplu olarak, master belge revizyonu da gerekirse onay al
3. Düşük → biriktir, opsiyonel

**Çalışma kuralı:**
- Bug master belgeyi mi yanlış uygulamış, yoksa master belge mi eksik?
- Master belge eksikse Buğra'ya sor, belgeyi güncelle, sonra kodu düzelt
- Master belge tutarlıysa kodu düzelt, master'ı bu kez güncellemeye gerek yok

**Bitiş kriteri:** Yüksek + orta öncelik buglar 0.

---

## 2. KARAR NOKTALARI (Buğra'dan onay alınacaklar)

| Karar | Önerim | Sor |
|---|---|---|
| Hosting platformu | Railway | "Railway uygun mu?" |
| Repo özelliği | Private | "Repo'yu private yapalım, sonra istersen public ederiz, OK?" |
| Custom domain | Sonra | "Şimdilik Railway subdomain. Custom domain (q.app gibi) ileride alırız?" |
| Analytics | Plausible (ücretsiz) | "Kaç kişi oynuyor görmek için Plausible ekleyelim mi?" |
| Hata izleme | Sentry free tier | "Production'da hatalar Sentry'ye düşsün mü?" |

---

## 3. ÇALIŞMA KURALLARI (master belgeden)

1. **Türkçe konuş.** Kod yorumları, değişken adları, fonksiyon adları, UI metinleri hep Türkçe.
2. **Master belgeden çıkma.** Tutarsızlık görürsen Buğra'ya sor.
3. **Buğra teknik bilmiyor.** Adım adım net söyle. "Şu komutu yapıştır", "şu butona bas".
4. **Tasarım kararları için onay iste.** Önyüz/akış etkileyen her şeyde sor.
5. **Yapım planı önce, kodlama sonra.** "Başlayayım mı?" diye sor.
6. **Mobilden cevap geliyor olabilir.** Kısa, net soru sor; uzun açıklamadan kaçın.
7. **Test et, paketle, ver.** Her büyük adımdan sonra durum özetle.

---

## 4. HATA MODLARI

| Belirti | Olası sebep | Çözüm |
|---|---|---|
| `npm install` patladı | Node sürüm uyumsuz | `node -v` kontrol, 18+ olsun |
| `npm run dev` server başlamadı | Port 3001 dolu | `netstat -ano \| findstr 3001`, çakışan kapat |
| Frontend açılıyor ama WS bağlanmıyor | CORS veya port | Browser console + Network tab kontrol |
| Railway build patladı | package.json scripts eksik | T3 adımlarını yeniden gözden geçir |
| Deploy sonrası 502/503 | Server crashed | Railway log'larını oku |
| Bot otomasyonu sıkıştı | Race condition | Master Bölüm 14 (kenar durumlar) kontrol |
| Mobile'da düzen bozuk | CSS breakpoint | `OyunDuzeni.css` + alt sekme bar incele |

---

## 5. BAĞLAM HARITASI (kod yapısı)

```
q-v11/
├── server/
│   ├── index.js          ← Ana sunucu, WS event handler'ları
│   ├── geceMotoru.js     ← Gece aksiyon çözümleme
│   ├── roller.js         ← 11 rol tanımı
│   └── rolDagitici.js    ← Oyuncu sayısına göre rol seçimi
│
├── client/src/
│   ├── App.jsx           ← Ekran yönlendirme
│   └── ekranlar/
│       ├── AcilisEkrani       ← İsim + oda kodu
│       ├── LobiEkrani         ← Oyuncu listesi + rol galerisi
│       ├── RolKartiEkrani     ← Rol dağıtımı sonrası
│       ├── TanismaEkrani      ← Başvurular + serbest tanışma
│       ├── GeceEkrani         ← Gece aksiyon seçimi
│       ├── SabahEkrani        ← Çözümleme
│       ├── TartismaEkrani     ← Tartışma sayacı
│       ├── OylamaEkrani       ← 1. ve 2. oylama, savunma, sonuç
│       ├── BitisEkrani        ← Kazanan + ifşa
│       ├── AyrilanEkrani      ← Köyden ayrılan oyuncu görünümü
│       ├── OyunDuzeni         ← 3 kolon sabit yerleşim + mobile sekme
│       ├── OyuncuListesi      ← Sürekli panel
│       ├── RolKartPaneli      ← Sürekli panel
│       └── SohbetPaneli       ← Çoklu kanal sohbet
│
├── package.json (root)   ← npm run dev (concurrently)
└── README.md
```

**Master belgede:**
- Bölüm 7: Prototip rol seti
- Bölüm 9: Gece aksiyonları
- Bölüm 11: Oyun akışı detayı
- Bölüm 14: Kenar durumlar (race condition, edge case)
- Bölüm 17: Teknik mimari + deploy notları
- Bölüm 21: v1.2 yapım durumu
- Bölüm 22: v1.1 → v1.2 değişiklikleri

---

## 6. BİTİŞ KRİTERLERİ (planın tamamı için)

- [x] T1: Local'de tam bir tur oynanabilir (2026-05-12)
- [x] T2: Hosting platformu seçildi — Railway (2026-05-13)
- [x] T3: Production build çalışır (2026-05-13)
- [x] T4: GitHub repo açıldı, kod push'landı — `bugrabilim/q` (2026-05-13)
- [x] T5: Production URL paylaşılabilir — https://q-11.up.railway.app (2026-05-13)
- [➡] T6: Resmi QA test matrisi → **V1'e ertelendi** (master Bölüm 18). Prototipte kullanıcı testi ile örtük yürütüldü.
- [🔁] T7: Bug raporu + düzeltme — **reaktif sürüyor**. Buğra bulduğunu yazıyor, hızla düzeltiliyor. `buglar.md` aktif.

**Plan tamamlandı (2026-05-13):**
- Q v1.3 canlı, https://q-11.up.railway.app
- Düzeltilen buglar: #1 (host transfer + erken bitiş), #2 (oylama ek tartışma döngüsü)
- v1.2 → v1.3 değişiklikleri: not defteri modal (her faz + ayrılanlar tekrar açma), rol galerisi oyun içi, bitiş ekranı renk sıralaması, mobilde çıkış butonu kontrolü, oyun sırasında çıkışın sistem mesajı + liste ibaresi
- Müzik V1'e ertelendi (master Bölüm 18)
- "Odaya Katıl" UX iyileştirmesi V1'e ertelendi
- V1 yol haritasına geçilebilir (master Bölüm 18)

---

## 7. SONRAKİ ADIM (planı kim açtıysa)

1. Master belgeyi 5 dakika oku (`q-master-belge12.md`, Bölüm 0-22)
2. **T1**'i çalıştır
3. T1 ✅ olursa Buğra'ya:
   > "Local doğrulaması tamam. Şimdi deploy aşamasına geçiyorum. Railway uygun mu, yoksa başka bir platform mu istersin?"
4. Cevaba göre **T2**'den devam et.

**Asla atlama:**
- Master belge okumadan kod yazma
- Buğra onayı almadan tasarım/UX değiştirme
- T1 ✅ olmadan T2'ye geçme

---

**Plan sahibi:** Buğra
**Plan yazarı:** Claude (Prism oturumu, 2026-05)
**Sonraki revizyon:** Deploy tamamlandıktan sonra T6/T7 detaylarını güncelle.
