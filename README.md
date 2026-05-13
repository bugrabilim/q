# Queer Quest Quench

> "Hepimiz bir şeyden kaçtık."

İstanbul'dan kaçıp organik bir köye yerleşen farklı yaşam tarzlarına sahip insanların birlikte yaşamayı öğrenme/öğrenememe hikayesi. Web tabanlı, çok oyunculu, sosyal dedüksiyon oyunu.

---

## Bu sürümde ne var? (v1.0)

Tüm oyun fazları tamamlandı:

| Faz | İçerik | Durum |
|-----|--------|-------|
| Faz 1 | Açılış Ekranı | ✅ |
| Faz 2 | Lobi (bot ekleme dahil) | ✅ |
| Faz 3 | Rol Dağıtımı (12 rol, Kaan zorunlu) | ✅ |
| Faz 4 | Tanışma Günü (başvuru + kimlik açıklama + sohbet) | ✅ |
| Faz 5 | Gece Aksiyonu (çözümleme motoru tam çalışıyor) | ✅ |
| Sabah | Genel olaylar, rol ifşası, not defteri, kişisel mesajlar | ✅ |
| Faz 6 | Tartışma (120sn, "Hazırım" ile erken geçiş) | ✅ |
| Faz 7 | Oylama (1. oylama → savunma → 2. oylama, motor etkileri) | ✅ |
| Faz 8 | Bitiş (kazanan, tüm rol ifşası, "Yeni Oyun") | ✅ |

**Ek sistemler:**
- Ayrılan oyuncular ekranı (izleyici modu + ayrılanlar kanalı)
- Transseksüel ↔ ayrılanlar ortak kanalı (her fazda aktif)
- Fobik gece kanalı (Kaan + Necmi + Azra)

---

## Oyun Akışı

```
Lobi → Rol → Tanışma → Gece → Sabah ─┬─ Kazanan? → Bitiş → Yeni Oyun
                           ↑          └─ Yok? → Tartışma → Oylama ─┬─ Biri gitti → Gece
                           └──────────────────────────────────────── └─ Kimse gitmedi → 60sn Tartışma → Oylama → Gece
```

---

## Kurulum (sadece ilk seferde)

Bilgisayarında **Node.js** kurulu olmalı (yoksa: [nodejs.org](https://nodejs.org) → LTS).

1. `q` klasörünü bir yere çıkart
2. Terminal aç, klasörün içine gir:
   ```
   cd q
   ```
3. Kurulum komutunu çalıştır:
   ```
   npm run kur
   ```

---

## Çalıştırma

```
npm run dev
```

Tarayıcında şu adresleri aç:

| Adres | Ne işe yarar |
|-------|-------------|
| `http://localhost:5173` | Oyun arayüzü |
| `http://localhost:3001/saglik` | Sunucu sağlık kontrolü |

Birden fazla oyuncu simüle etmek için aynı bilgisayarda birden fazla sekme aç.

---

## Hızlı Test

1. Sekme 1: İsim gir → **Oda Kur**
2. **"+ Bot Ekle"** butonuna 5 kez bas (toplam 6 kişi)
3. **"Oyunu Başlat"** → Rol kartı → "Anladım"
4. Tanışma → Gece → Sabah → Tartışma → Oylama → …
5. Oyun bitince host **"Yeni Oyun"** → lobi

### Hızlandırılmış test süreleri

Uzun beklemek istemiyorsan:
```
Q_BASVURU_MS=3000 Q_TANISMA_MS=10000 Q_GECE_MS=15000 Q_TARTISMA_MS=30000 npm run dev
```

| Değişken | Varsayılan | Test |
|----------|-----------|------|
| `Q_BASVURU_MS` | 10 000 ms (10 sn) | 3 000 ms |
| `Q_TANISMA_MS` | 30 000 ms (30 sn) | 10 000 ms |
| `Q_GECE_MS` | 30 000 ms (30 sn) | 15 000 ms |
| `Q_TARTISMA_MS` | 120 000 ms (2 dk) | 30 000 ms |

---

## Prototip Rol Seti (12 Rol)

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
| 🔴 Gelenekçi | Homofobik (Kaan) | Kaan |
| 🔴 Gelenekçi | Muhafazakâr (Necmi) | Necmi |
| 🔴 Gelenekçi | Erkek Düşmanı (Azra) | Azra |

Kaan her oyunda zorunlu. Oyuncu sayısına göre denge tablosu uygulanır (6–12 oyuncu).

---

## Bot Sistemi

Lobide **"+ Bot Ekle"** ile test botu eklenebilir:

- Rol kartını otomatik onaylar
- Tanışmada %30 ihtimalle kimlik başvurusu yapar
- Gece rastgele hedef seçer
- Tartışmada 5–35 sn arası "Hazırım" der
- Oylama turlarında rastgele oy verir

---

## Gece Motoru

Motor şu etkileri tam uygular:

| Öncelik | Rol | Etki |
|---------|-----|------|
| 1 | Gay | Gelenekçi aksiyonunu engeller |
| 2 | Crossdresser | Kaan'ın hedefini değiştirir (transport) |
| 3 | Drag Queen | Özgürlükçüyü korur / oyunu etkiler |
| 4 | Kaan | Ekonomik abluka (köyden uzaklaştırma) |
| 5 | Necmi | Oy manipülasyonu (kayıt + oylama uygulaması) |
| 5 | Azra | Erkek oyuncunun oyunu iptal |
| 5 | İnterseksüel | Hedefin gece aksiyonunu izler |
| 5 | Ladyboy | Tüm gece hareketlerini görür |
| 5 | Hetero Erkek | Özgürlükçülerin ziyaretçilerini görür |
| 5 | Koca Karı | İki kişinin aynı grupta olup olmadığını öğrenir |

---

## Oylama Etkileri (Faz 7)

| Etki | Kaynak | Uygulama |
|------|--------|----------|
| Oy iptal | Azra | Hedef erkek oyuncunun oyu sayılmaz |
| Oy yönlendirme | Necmi | Hedefin oyu Necmi'nin oyuyla aynı yönü alır |
| Oy 2 katı | Drag Queen | Koruduğu Özgürlükçünün oyu 2 sayılır |
| Oy iptal | Drag Queen | Koruduğu Gelenekçinin oyu sayılmaz |

---

## Özel Kanallar

### Fobik Gece Kanalı
Kaan, Necmi ve Azra gece aksiyonu sırasında birbirleriyle özel chat yapabilir. Sadece gece fazında aktif.

### Ayrılanlar Kanalı
Köyden ayrılan oyuncular (gece veya oylama yoluyla) bu kanala otomatik alınır. Transseksüel rolü de bu kanala katılır. Her fazda aktif — ayrılanlar hem canlı chat'i izler hem de kendi aralarında yazışır.

---

## Sorun Çıkarsa

| Hata | Çözüm |
|------|-------|
| `EADDRINUSE: port 3001` | Önceki sunucu açık — terminalde `Ctrl+C` yap |
| `npm: command not found` | Node.js kurulu değil → [nodejs.org](https://nodejs.org) LTS kur |
| Ekran boş geliyor | Tarayıcıyı yenile — sunucu otomatik senkronize eder |
| Lobi sonrası bağlantı koptu | Tüm sekmeleri kapat, sunucuyu yeniden başlat |
| Bot ekle butonu görünmüyor | Sayfayı yenile — lobi durumu yüklenmiş olacak |

---

## Durdurmak için

Terminalde `Ctrl + C`.
