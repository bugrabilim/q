# Q — Queer Quest Quench · Proje Talimatı

Bu dosyayı her oturumda ilk sen okuyorsun. Aşağıdakiler kural, öneri değil.

---

## Proje

Tarayıcı tabanlı, çok oyunculu **sosyal dedüksiyon** oyunu. Türkçe.
Konsept: İstanbul'dan kaçıp organik bir köye yerleşen farklı yaşam tarzlarındaki insanların birlikte yaşamayı öğrenme/öğrenememe hikâyesi.
Slogan: *"Hepimiz bir şeyden kaçtık."*
Sahibi: Buğra. Tek kişilik geliştirme.

**Canlı:** https://q-11.up.railway.app · **Sürüm:** v1.9

**Klasik mafya/vampir oyunlarından farkı:** şiddet, ölüm, savaş **yok**. Köyden uzaklaştırma var.

| Belge | Ne için |
|---|---|
| `q-master-belge12.md` | **TEK DOĞRU KAYNAK** — 24 bölüm, tüm tasarım kararları |
| `HANDOFF.md` | Son sohbetin tam devri (ne yapıldı, ne kaldı) |
| `DEVAM.md` | Kısa "nerede kaldık" özeti |
| `docs/hikayeler-v2.md` | Hikâye kanonu — 38 karakter |
| `buglar.md` | Bug kaydı |

---

## Dil

- Kod dışındaki **her şey Türkçe**: arayüz metni, commit mesajı, yorum, doküman, bana verdiğin cevap.
- Kod içinde de Türkçe isimlendirme kullanılıyor (`geceMotoru`, `rolDagitici`, `oyuncuSayisi`, `KoySahnesi`). **Tutarlı ol, İngilizceye kaçma.**

---

## Kilitli kararlar — tartışma, uygula

### Görsel yön: sıcak piksel-art (v1.9)

Ton: organik köy, sıcak, stressiz — ama altında sosyal dinamikler var.
Referans: **Stardew Valley** DNA'sı. **Town of Salem'in gotik tonu alınmaz.**

**Palet — `client/src/index.css` tek kaynak. Oradan sapma.**

| Token | Hex | Rol |
|---|---|---|
| `--gokyuzu` | `#ecdcb4` | Ana zemin (gündüz) — parşömen |
| `--deniz` | `#9a6532` | Aksan, border — ahşap kahve |
| `--derin` | `#3d2b1c` | Metin — koyu kahve |
| `--gunes` | `#e0892b` | Vurgu — altın |
| `--gece` | `#2d2236` | Gece zemini — sıcak koyu mor-kahve |
| `--parsomen` | `#fbf3dd` | Açık panel zemini |
| `--ahsap-koyu` | `#5c3a17` | Kalın kenar / sert gölge |

**Grup renkleri değişmez** (oyun mantığına bağlı):
özgürlükçü `#06A77D` · tarafsız `#F4A261` · gelenekçi `#E63946`

Tipografi: **Lora** (başlık + alıntı) · system sans-serif (UI). **Caveat yok.**
Gölge: piksel-art sert gölge (`--golge-orta`), yumuşak blur değil.

**Yeni ekran açarken yeni renk, yeni font, yeni yuvarlaklık ekleme.** Gerektiğini düşünüyorsan önce Buğra'ya sor.

### Görsel üretim: prosedürel

Logo, favicon, köy sahnesi — hepsi **kodla üretilen SVG**. Stok ikon seti, 3D render, dış görsel dosya **yok**.
Tek istisna: karakter portreleri (`client/public/karakterler/`, şu an Kenney CC0).

### 3D: sadece 2.5D

CSS 3D transform (`perspective` + `preserve-3d` + `rotateY`). **WebGL/Three.js yok.**
Mobil app (Electron/native) **ertelendi** — şimdilik responsive web.

---

## Çıktı biçimi

- **Mobil öncelikli.** Buğra çoğunlukla telefondan bakıyor.
- `prefers-reduced-motion` desteklenecek.
- Bağımlılık ekleme — mevcut yığın: React 19 + Vite, Express 5 + Socket.io 4. Yeni paket gerekiyorsa **sor**.

---

## Çalışma şekli

1. **Türkçe, kısa, listeli cevap ver.** Buğra uzun paragraf istemiyor.
2. **Buğra teknik bilmiyor.** "Şu butona bas", "şu komutu yapıştır" diye net söyle.
3. **Varsayma, sor.** Tasarım kararlarında ve kullanıcı arayüzünü etkileyen her şeyde onay al.
4. **Büyük adımdan önce planı söyle**, onay al, sonra kodla.
5. **Kararları dokümana yaz.** İş bitince `q-master-belge12.md` Bölüm 18'e changelog satırı ekle, `DEVAM.md`'yi güncelle.
6. **Master belgeden çıkma.** Tutarsızlık görürsen önce sor — belge yanlış olabilir (v1.9'da böyle bir hata bulundu ve düzeltildi).

---

## Çalıştırma

```bash
npm run kur      # tek seferlik kurulum
npm run dev      # sunucu :3001 + istemci :5173
```

Hızlı test (süreleri kısalt):
```bash
Q_BASVURU_MS=3000 Q_TANISMA_MS=10000 Q_ROL_MS=8000 Q_GECE_MS=15000 \
Q_SABAH_MS=8000 Q_TARTISMA_MS=30000 Q_SONUC_MS=10000 npm run dev
```

Test: `node server/test-gorev.js` (22 test)

**Deploy:** `git push origin main` → Railway otomatik build+deploy (~2-3 dk). Başka adım yok.

---

## Mevcut durum (v1.9)

**Bitti:** 8 faz · 38 rol gece motoru · sürekli paneller · bot sistemi · ses katmanı (11 parça) · host kontrolleri · rol havuzu (B seçeneği) · tüm Tarafsız kazanma koşulları · 38 karakter hikâyesi · sıcak piksel-art tema · logo · favicon · dinamik köy sahnesi · 2.5D rol kartı.

**Sırada:**
1. Köy sahnesini canlıda onayla (Buğra telefondan bakacak — henüz onaylanmadı)
2. 🎨 Özgün 38 karakter portresi (şu an 12 tane, Kenney CC0 + filter)
3. 🎨 Rol/aksiyon ikonları (emoji → piksel)
4. 📕 Roman (Aşama 4) — 4 karar bekliyor
5. 🔲 Senaryo sistemi · ipucu sistemi · i18n (TR+EN) · QA matrisi

**Açık bug yok.**

---

## Kritik uyarılar

- **İstemciye güvenme.** Rol bilgisi sadece sunucuda tutulur; client yalnız görmesi gerekeni alır. Sohbet kanalı filtrelemesi **server tarafında**. Bu kuralı bozma.
- **Grup renklerini değiştirme** — oyun mantığına bağlı.
- **Veritabanı RAM'de** (kalıcı değil). Sunucu yeniden başlarsa odalar gider. V1'de Redis+Postgres planlanıyor ama **henüz seçilmedi** — kendi kararınla yığın kurup ilerleme, önce sor.
- **Kaan zorunlu değil** (v1.8.33). Gelenekçi sayısı 0 olabilir; >0 ise Kaan grup içi favori seçilir.
