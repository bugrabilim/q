# DEVAM NOTU — Q (Queer Quest Quench)
**Tarih:** 2026-06-23 · **Sürüm:** v1.9 · Canlı: https://q-11.up.railway.app

> Bu kısa bir devam notudur. **Tek doğru kaynak = `q-master-belge12.md`** (her şey orada, Bölüm A devam talimatı). Bu dosya sadece "en son nerede kaldık" özeti.

---

## NEREDEYİZ (büyük resim)
Proje = **3 ayaklı IP**: 🎮 Oyun (canlı, **artık görsel kimlikli**) · 📖 Hikâye (bitti) · 📕 Roman (taslak) · 📦 Kutu oyunu + yeni konseptler (henüz başlamadı).

## BUGÜN NE YAPTIK (v1.9 — görsel kimlik)
1. **Sıcak piksel-art tema** — tüm palet mavi-yeşilden parşömen/ahşaba geçti (`client/src/index.css` + 22+ CSS dosyası). Güncel renkler: master Bölüm 16.
2. **Logo + favicon** — yatay logo `client/src/Logo.jsx` (madalyon q + ad + gökkuşağı), favicon `client/public/favicon.svg` (madalyon q + grup yayları). Eski mor Claude logosu kalktı.
3. **Dinamik köy sahnesi** — `client/src/bilesenler/KoySahnesi.jsx` oyun ekranı arka planı: orman, dere, köprü, çeşme + kıraathane, **oyuncu sayısı kadar ev**, gece/gündüz değişimi. Paneller yarı saydam yapıldı.
4. **2.5D rol kartı çevirme** — `RolKartiEkrani.jsx/css` rol artık kapalı ahşap kartla gelir, dokununca 3D döner; "Anladım" sadece çevrilince çıkar.
5. **Deploy** — 2 commit: `daaccd2` (tema+logo+favicon+köy) + `6d25119` (2.5D kart), push → Railway.
6. **Master belge güncellendi** → v1.9 (Bölüm 16 renk paleti + Bölüm 18 "v1.9" changelog; Necmi forum + Dul mekaniği "henüz kodlanmadı" yanlışı düzeltildi — ikisi de v1.8.31'de kodlanmış).

## SIRADA NE VAR (Buğra seçecek)
- 🎨 **Özgün 38 karakter portresi** — şu an 12 var (Kenney CC0 + filter); tema ile uyumlu özgün set gerek (AI veya freelance, master Bölüm 23 Aşama 1). + rol/aksiyon ikonları (emoji → piksel).
- 📕 **Roman yazımı** (Aşama 4) — 4 karar bekliyor: anlatıcı / ana çatışma / dil / yayınevi (master Bölüm 24 + `roman-taslagi-v1.md`).
- 📦 Kutu oyunu / yeni konsept oyunlar planı.
- Kalan V1 ufak işler: senaryo sistemi, ipucu sistemi, i18n, köy sahnesini diğer ekranlara yayma.

## DEPLOY HATIRLATMA
- Git deposu: `q-v11/` (kök DEĞİL). Push: `main` → `bugrabilim/q` → Railway otomatik deploy.
- Master belge artık GitHub'da: `bugrabilim/q` → `q-master-belge12.md`
- `hikayeler/` kökte, depo dışında — commit gerektirmez.

---

## YENİ SESSION NASIL BAŞLATILIR

### Seçenek A — Dosyasız (GitHub'dan oku)
1. Yeni sohbet aç, proje klasörü eklemene gerek yok.
2. Şunu yaz:
   > **"GitHub'dan master belgeyi oku: https://raw.githubusercontent.com/bugrabilim/q/main/q-master-belge12.md — nerede kaldığımızı söyle."**
3. Claude WebFetch ile okur, özet verir.

### Seçenek B — Klasörle (yerel dosya)
1. Yeni sohbette proje klasörünü aç.
2. Şunu yaz: **"DEVAM.md ve q-master-belge12.md'yi oku, nerede kaldığımızı söyle."**

### Her iki seçenekte de Claude kuralları:
Türkçe konuş, kısa/listeli cevap ver, büyük adımdan önce onay al (detay: master Bölüm A).
