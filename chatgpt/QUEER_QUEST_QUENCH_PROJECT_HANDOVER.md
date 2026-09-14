# Queer Quest Quench — Proje Devir / Durum Dokümanı

**Proje kayıt başlangıcı:** 15 Mart 2024  
**Devir tarihi:** 14 Eylül 2026  
**Amaç:** Yeni bir sohbette veya yeni ekip üyesiyle projeye kaldığı yerden devam etmek.

## Proje özeti

Queer Quest Quench (QQQ), İzmir Eski Foça'daki organik bir köyde geçen, çok oyunculu, sosyal blöf ve hafif RPG temelli bir oyundur. Oyunun farkı, sosyal deduction gerilimini öldürme/savaş yerine kimlik, güven, yalan, manipülasyon, görevler, rol keşfi ve köyden gönderme gibi barışçıl sosyal sonuçlar üzerinden kurmasıdır. LGBTQ+ farkındalığı ve farklı insanların birlikte yaşaması ana tematik eksendir.

## Neden yapılıyor?

- Çok oyunculu sosyal oyunların güçlü etkileşimini kullanmak.
- İlk kez oynayanın hızla anlayabileceği bir deneyim yaratmak.
- Oyunculara RPG, blöf ve manipülasyon alanı vermek.
- LGBTQ+ görünürlüğünü ve farklı kimliklerle birlikte yaşam tartışmasını oyun diliyle işlemek.
- Global pazarda yayıncı dostu, tekrar oynanabilir, küçük ekip tarafından üretilebilir bir indie oyun ortaya çıkarmak.

## Kesinleşmiş kararlar

- Ad: **Queer Quest Quench**.
- Kısaltma: **QQQ**.
- Çok oyunculu kalacak.
- Tüm oyuncular aynı oturumda / ortak alanda olacak.
- Öğrenmesi çok kolay olacak.
- RPG mümkün olacak.
- Yalan söyleme ve manipülasyon temel mekanik olacak.
- Öldürme/savaş olmayacak.
- Organik köy ve Eski Foça dünyası korunacak.
- 25 karakterlik havuz korunacak.
- Karakterlerin tamamının aynı maçta aktif olması zorunlu değil.

## En son tasarım yönü

Eski 30-sahneli gündüz/gece prototipi fazla karmaşık bulundu. Yeni güçlü fikir:

1. Oyuncu kendi rolünü bilmeden başlar.
2. Basit görevler yapar.
3. Görevlerden kendi rolüne ilişkin ipuçları alır.
4. Diğer oyuncularla konuşur ve yalan söyleyebilir.
5. Kendi rolünü tahmin eder.
6. Doğru/yanlış tahminin ödül/cezası olur.
7. Topluluk içi oylamalar ve sosyal kararlar maçın yönünü değiştirir.

## Şu anda kilit tasarım problemi

**Bu sistemi eğlenceli, sade ve tekrar oynanabilir bir çekirdek döngüye dönüştürmek.**

Özellikle cevaplanması gerekenler:

- Doğru rol tahmini ödülü ne?
- Yanlış tahmin cezası ne?
- Bir oyuncunun yalan söylemesi neden stratejik olarak gerekli?
- Oyuncu köyden nasıl gönderilir?
- Gönderilen oyuncu maçtan tamamen kopar mı?
- İyi, kötü ve tarafsız kazanma koşulları nedir?
- Her 25 role nasıl tek, eşsiz ve çok basit bir oyun içi yetenek verilir?

## Karakter kadrosu

### İyiler
Deniz/Gay, Ada/Lezbiyen, Elvin/Biseksüel, Devin/Transeksüel, Baran/Interseksüel, Maya/Panseksüel, Umut/Crossdresser, Berke/Drag Queen, Arin/Hermafrodit, Umay/Femboy, Lila/Ladyboy.

### Tarafsızlar
Mehmet/Heteroseksüel-Erkek, Bahar/Heteroseksüel-Kadın, Irmak/Aseksüel, Fatma/Koca Karı, Hatice/Çöpçatan, Kartal/Fetişist, Selin/Eskort, Eren/Jigolo, Can/Çapkın.

### Kötüler
Azra/Feminist, Kaan/Homofobik, Erdem/Sapkın cinsel hasta, Beren/Mazoşist, Bora/Sadist.

## Önemli veri/tutarlılık sorunları

- Beren'in mesleği tabloda psikoterapist, hikâyede kasiyer. Önceki karar kasiyerdi.
- Devin yazar, fakat hikâyede biyoloji/bilimsel araştırma anlatılıyor.
- Umay muhasebeci, hayal/motivasyon müzik kariyeri.
- Lila eczacı, hayal sahne sanatları.
- Bazı rol adları güncel ve uluslararası LGBTQ+ terminolojisi açısından sorunlu/eskimiş olabilir.
- Feminist = kötü eşlemesi projenin eşitlik/farkındalık mesajıyla çelişebilir.
- Cinsel yönelim, cinsiyet kimliği, cinsiyet ifadesi, meslek, parafili ve siyasi/toplumsal tutum aynı rol düzleminde karışmış durumda.

## Önerilen bir sonraki sprint

### Sprint amacı
Kağıt üzerinde oynanabilir 5–7 kişilik QQQ prototipi.

### Yapılacaklar

1. 6 rol seç.
2. Her role 1 cümlelik tek yetenek ver.
3. 4 temel görev tipi tasarla.
4. Görevlerden rol ipucu üretme kuralı yaz.
5. Doğru/yanlış rol tahmini sistemini belirle.
6. 1 sosyal oylama sistemi belirle.
7. Kazanma koşullarını yaz.
8. 15–20 dakikalık hedef maç süresi belirle.
9. 5 test maçı yap.
10. Test sonrası yalnızca eğlence ve anlaşılabilirlik verisine göre revize et.

## Başarı kriterleri

- Yeni oyuncu 2 dakika içinde ne yapacağını açıklayabiliyor.
- Oyuncu en az bir kez başka oyuncuya yalan söyleme ihtiyacı hissediyor.
- Oyuncular birbirlerinin davranışlarını tartışıyor.
- Tek bir rol oyunu domine etmiyor.
- Elenen/gönderilen oyuncu aşırı erken kopmuyor.
- Ortalama maç 15–25 dakika.
- Test sonunda oyuncular tekrar oynamak istiyor.

## Teknik durum

Henüz üretim kodu bu doküman kapsamında değerlendirilmedi. Tasarım hedefi Unity + C#, PC ilk çıkış, sonrasında mobil ve cross-platform olarak konuşuldu.

## Faz planı

- Faz 1: 2 ay, tasarım + altyapı + görsel + ses + beta.
- Faz 2: 2 ay, PC çıkış + pazarlama + geri bildirim.
- Faz 3: 1 ay, ilk genişleme + lokalizasyon + pazarlama.
- Faz 4: 2 ay, ikinci genişleme + yeni karakterler + mobil port/test.
- Faz 5: Süresiz canlı dönem, mobil yayın ve devam eden destek.

**Not:** Bu süreler küçük ekip için agresif; çekirdek mekanik kilitlenmeden takvim güvenilir değildir.

## Pazarlama yönü

Hedef sadece LGBTQ+ topluluğu değildir. Sosyal bluff, party game, casual multiplayer, RPG ve yayıncı dostu oyun kitlesi temel hedef olmalıdır. Twitch/YouTube yayıncıları, Discord/Reddit toplulukları ve kısa video platformları ana dağıtım/tanıtım kanallarıdır.

## Gelir modeli

PC satış, expansion pack, kozmetik mikro işlemler, mobil reklam, sponsorluk ve opsiyonel premium model konuşuldu. Kimlik/yönelim gibi hassas kişisel verilerin satışı gelir modeli olmamalıdır.

## Yeni sohbette ilk yapılacak iş

**25 rolü koruyarak, maç başına 6–8 aktif rol kullanan; her role tek basit yetenek veren ve oyuncunun kendi rolünü görevlerden keşfettiği MVP çekirdek sistemini tasarlamak.**
