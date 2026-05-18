# 📜 Versiyon Notları

Canlı sürüm: **v1.8.23** · https://q-11.up.railway.app

---

## v1.8 — Versiyon 1 Roller (2026-05-17/18)

**23 alt sürüm:** v1.8 → v1.8.23

### Yeni Roller (27)
- ⚪ Outsider Bastırmış Murat (Murat C — sahte Özgürlükçü rolüyle oynar)
- 🟢 5 yeni Özgürlükçü: Ada, Elvin, Maya, Aren, Umay
- 🟡 11 yeni Tarafsız: Bahar, Irmak, Hatice, Kartal, Selin, Eren, Can, Beren, Ekin, Tuna, Nehir
- 🔴 5 yeni Gelenekçi: Sinan, Yasemin, Hüseyin, Pınar, Oğuz
- ⚫ 4 Kaosçu: Okan, Bora, Erdem, Hakan

### Gece Motoru Genişlemesi
- Bireysel kazanma izleyicileri: Murat, Mazoşist, 4 Kaosçu, 4 spesifik Tarafsız
- Aren maskelemesi (öncelik 1.5) — hedef araştıran rollere "?" görünür
- Kimlik açıklayan oyuncu **ilk gece Kaan'a karşı otomatik korunur**

### Host Kontrolü (Lobide)
- Outsider + Kaosçu satırları dağılım panelinde
- 4 süre dropdown: Tartışma / Gece / Sabah / Savunma
- Kimlik açıklama adedi (0-3)
- **Kişi engelleme** (lobi'de host gerçek oyuncuyu odadan atabilir)

### Oyun Mekaniği
- Kaan zorunluluğu **kaldırıldı** (gelenekçi 0 olabilir)
- Tekil rol kuralı **kaldırıldı** (aynı rolden birden fazla oyuncu olabilir)

### UI / UX
- **12 oyuncu üst sınırı kaldırıldı** (max 99)
- Önerilen Dağılım popup → **inline panel** (lobide sürekli açık)
- Rol kartı yeni yapı: "Karakterin Hikayesi" (Kim? / Neden geldin? / Ne yapmak istiyorsun?) + "Oyundaki Görevin" (Ne yaparsın? / Nasıl kazanırsın?)
- 38 karakter için **burç** eklendi
- Tüm rol kartları aynı tasarım
- Roller galerisi 5 grup başlık altında (Özg → Tar → Gel → Outsider → Kaosçu)
- "Detaylı oku" butonu — uzun roman hikayesi açılır
- 11 karakter hikayesi motif tekrarı için yeniden düzenlendi

### Belgeler
- `hikayeler-v1.md` — 38 karakter için kısa + uzun romanvari hikaye
- Master belge Bölüm 3, 4, 5, 6, 8, 9, 11, 12, 18, 21 güncellendi
- **GitHub Wiki başlatıldı** (bu sayfa)

---

## v1.7 (2026-05-16)

- Açılış ekranı yeniden düzen (isim ayrı + "Oda Kur" / "Odaya Katıl" kartlar)
- Kimlik açıklama adedi host kontrolü (0-3)
- Başvuru süresi 10 sn → 5 sn
- Bug #3 mobil ses slider düzeltildi
- "Odaya Katıl" UX iyileştirildi

---

## v1.6 (2026-05-15)

- 11 müzik parçası + 6 UI sesi
- Karakter portreleri (Kenney CC0)
- Açılış gradient animasyonu, gece/gündüz crossfade
- Lobi'de "Roller" + "Önerilen Dağılım" popup'ları

---

## v1.5 (2026-05-14)

- Mobil responsive (3 kolon → alt sekme)
- Ses katmanı (Howler.js)
- Min 4 oyuncu desteği
- Host dağılım paneli
- Rol Dağıtımı + Sabah otomatik geçiş sayaçları

---

## v1.4 (2026-05-13)

- Sürekli paneller (3 kolonlu mimari)
- Sohbet Paneli (3 kanal: köy / fobik / ayrılan)
- Bot sistemi
- Bug #1 + Bug #2 fix

---

## v1.0 → v1.3 (2026-05-10/12)

- 8 faz oyun akışı
- 11 rol gece motoru (Gay, CD, DQ, Kaan, Necmi, Azra, vs.)
- WebSocket gerçek zamanlı
- Railway deploy

---

## 🐛 Düzeltilen Buglar

| # | Bug | Düzeltildi |
|---|-----|------------|
| 1 | Host köyden ayrılınca sabah donması | v1.2 |
| 2 | 1. oylama eşitlikte sonsuz tekrar tartışma | v1.2 |
| 3 | Mobilde ses slider tepkisiz | v1.7 |
| 4 | Müzik kuyruğu bitince tekrar başlamıyor | v1.7.1 |
| 5 | Rol Dağıtımı süresi 30 → 10 sn | v1.7.1 |
| 6 | Masaüstü ayarlar butonu çakışması | v1.7.1 |
| 7 | Botlar canlı oyuncular hazır basınca beklemesi | v1.7.1 |
| 8 | Bitiş ekranında ses butonları z-index | v1.7.1 |

---

⬅️ [Home](Home)
