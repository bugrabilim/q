# T6 — Q QA Test Matrisi

Bu belge canlı sürüm doğrulaması için **10 test senaryosu** içerir. Her sürüm sonrası bu matristen geçmesi beklenir.

**Canlı URL:** https://q-11.up.railway.app
**Sürüm:** v1.8.27

---

## Test Ortamı

- **Tarayıcı:** Chrome (en yeni), Firefox, Safari (mobil + masaüstü)
- **Mobil:** iOS Safari + Chrome Android, dvh birimi destekli
- **Ağ:** WiFi + 4G/5G mobil veri (Socket.io reconnect testi)

---

## 10 Senaryo

### 1. Hızlı Oyun (4 oyuncu)
- 1 gerçek + 3 bot
- Host paneli: ozg=2, tar=1, gel=1
- Tartışma süresi: 30 sn (en kısa)
- ✅ Oyun başlar, faz akışı sorunsuz
- ✅ Kaan host'u vurursa **host transfer** çalışır
- ✅ Kazanan grup belirlenip bitiş ekranı açılır

### 2. Klasik Oyun (6 kişi)
- Bütün roller prototip 12'den
- Default süreler
- ✅ Gece motoru tüm aksiyonları doğru çözer
- ✅ Sabah ekranı kişisel + genel mesajlar gösterir
- ✅ Oylama %51 ile doğru ayrılma

### 3. V1 Roller — Outsider + Kaosçu (8 kişi)
- Host: ozg=3, tar=2, gel=2, outsider=1, kaoscu=0
- Murat seçilince **sahte Özgürlükçü rolü** atanmalı
- ✅ Murat rol kartında sahte rol görür
- ✅ Murat aksiyon yapınca "başarılı" sahte cevap döner
- ✅ Murat gerçekte hiçbir etki yaratmaz
- ✅ Araştıran roller (Gay, İnter) Murat'ı sahte rolüyle görür
- Host: kaoscu=1 — bir Kaosçu rolü dağıtılır
- ✅ Kaosçu bireysel kazanma izleyicileri çalışır

### 4. Büyük Oyun (12 kişi)
- 12 oyuncu, default dağılım (6/3/3)
- Tüm fazlar çalışır
- ✅ Performans: 12 socket bağlantısı, gecikme < 200 ms
- ✅ Sohbet 12 kişiyle akıcı

### 5. Çok Büyük Oyun (15+ kişi, v1.8 üst sınır kalktı)
- 15 oyuncu, dağılım hesap formülünden (gel=4, ozg=7, tar=4)
- ✅ Server `players.length >= 99` kontrolü engellemez
- ✅ Performans kayıp yok

### 6. Kimlik Açıklama Adedi (0/1/2/3)
- Host kimlik adedi=0 → tanışmada "Kimlik açıklama kapalı"
- Host kimlik adedi=2 → 2 kişi rastgele açıklanır
- Host kimlik adedi=3 → 3 kişi
- ✅ Banner doğru sayıyı yansıtır
- ✅ Açıklanan oyuncular **ilk gece Kaan'a karşı korunur** (v1.8 yeni)

### 7. Süre Ayarları (Host kontrolü)
- Tartışma 30/60/90/120/180/240 sn — hepsi test edilmeli
- Gece/Sabah/Savunma 10/20/30/40 sn
- ✅ Server süreyi doğru uygular
- ✅ Sistem mesajı "X saniye serbest sohbet" doğru sayıyı gösterir

### 8. Kişi Engelleme (v1.8 yeni)
- Host lobide gerçek oyuncuya × bas
- ✅ Oyuncu odadan atılır + uyarı: "Host odadan çıkardı"
- ✅ Açılışa döner
- ✅ Aynı isimle aynı odaya tekrar girerse "Host bu odadan çıkardı" hatası
- Bot için × tuşu zaten vardı — bozulmamış olmalı

### 9. Mobil + Masaüstü Uyumu
- Mobilde (414×896):
  - ✅ Açılış: isim alanı + 2 kart altta net
  - ✅ Lobi: süreler 1 sütun, dağılım panel sade
  - ✅ Oyun ekranı: alt sekme barı (Köy/Rol · Oyun · Sohbet)
  - ✅ Ses Ayarları slider'ları parmakla çalışır (Bug #3 fix)
  - ✅ Wiki sayfası: sidebar overlay, ☰ menü açılır
- Masaüstünde (1920×1080):
  - ✅ Sohbet "Köy Meydanı" başlığı ⚙️ butonuyla çakışmaz (Bug #6 fix)
  - ✅ Bitiş ekranında ⚙️ + 🔊 butonları kazanan banner üstünde (Bug #8 fix)

### 10. Bağlantı ve Yeniden Başlat
- Bir oyuncu oyun sırasında tarayıcıyı kapar
  - ✅ Köyden ayrılır
  - ✅ Sistem mesajı: "X oyundan ayrıldı"
  - ✅ Eğer host → host transfer
  - ✅ Köyde gerçek oyuncu kalmazsa → otomatik bitiş
- Bitiş ekranında "Yeni Oyun" butonu
  - ✅ Aynı lobiye döner
  - ✅ Oyuncular kalır, roller sıfırlanır

---

## Wiki Erişimi (v1.8.25 yeni)

- ✅ Açılış ekranı footer'ında "📚 Kurallar & Roller" linki
- ✅ Tıklayınca /wiki rotasına gider
- ✅ Sol sidebar 7 sayfa
- ✅ Markdown tablolar düzgün render (v1.8.26 GFM fix)
- ✅ Arama kutusu (v1.8.27) — 2+ karakter eşleşen sayfaları listeler

---

## Bilinen Eksikler (V1 bekleyen)

- 🔲 9 Tarafsız rol spesifik kazanma state altyapısı (HE/HK/Aseksüel/Fetişist/SD/KK/Poli/FB/Sit hâlâ "köyde kalmak" fallback'i kullanıyor)
- 🔲 B seçeneği (rol havuzu tikleme)
- 🔲 Senaryo sistemi
- 🔲 Köy olayları
- 🔲 İpucu sistemi
- 🔲 Özgün karakter portreleri (şu an Kenney CC0 + filter)
- 🔲 Çoklu dil (i18next TR + EN)
- 🔲 Steam dağıtımı

---

## Sürüm Test Geçmişi

| Sürüm | Tarih | Geçti mi | Notlar |
|---|---|---|---|
| v1.8.27 | 2026-05-18 | ⏳ Beklemede | Bu matris ilk kez yazıldı, henüz canlı doğrulanmadı |
