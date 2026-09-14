# Queer Quest Quench — Project Master

**Sürüm:** 1.0  
**Proje kayıt başlangıcı:** 15 Mart 2024  
**Derleme tarihi:** 14 Eylül 2026 (Europe/Istanbul)  
**Kısa ad:** QQQ

## Tek cümlelik tanım

Queer Quest Quench, İzmir Eski Foça'daki organik bir köyde geçen; oyuncuların kendi rollerini görev ve ipuçlarıyla keşfettiği, birbirlerine yalan söyleyip sosyal manipülasyon yapabildiği, şiddet yerine topluluk kararlarıyla ilerleyen çok oyunculu sosyal strateji ve hafif RPG oyunudur.

## Neden yapıldı?

Proje, Feign, Town of Salem ve Among Us benzeri sosyal oyunların güven, şüphe, blöf ve tartışma gücünü; farklı kimliklerle birlikte yaşama, aidiyet, önyargı ve toplumsal farkındalık temalarıyla birleştirmek için geliştirildi. Amaç önce eğlenceli ve tekrar oynanabilir bir oyun kurmak, sosyal mesajı oynanışın doğal sonucu haline getirmektir.

## Vazgeçilmez tasarım ilkeleri

1. Çok oyunculu olacak.
2. Bütün oyuncular aynı oturum ve ortak sosyal alanda bulunacak.
3. İlk kez oynayan kişi birkaç dakika içinde sistemi anlayacak.
4. RPG ve karakter canlandırma imkânı olacak.
5. Yalan söyleme, bilgi saklama ve manipülasyon stratejik araç olacak.
6. Öldürme ve savaş olmayacak.
7. Oyuncu eksiltme sosyal karar/köyden gönderme üzerinden yapılacak.
8. Kimlik ve farklılık teması görünür olacak, fakat hedef kitle yalnızca tek bir toplulukla sınırlanmayacak.

## Dünya ve hikâye

Şehir hayatının gürültüsü, stresi, trafiği ve kirliliğinden bunalan farklı geçmişlere sahip insanlar İzmir Eski Foça'daki organik bir köye taşınır. Başlangıçtaki huzur beklentisi, yaşam tarzları, kimlikler, değerler ve önyargılar nedeniyle çatışmaya dönüşür. Oyuncular görevler, konuşmalar, rol yapma, blöf ve topluluk kararlarıyla köyün sosyal dengesini şekillendirir.

## Ana fikir

Farklı insanların saygı ve sevgi çerçevesinde bir arada yaşamasının değerini ve bunun pratikte ne kadar zor olabildiğini oyunlaştırmak.

## Karakter sistemi

Toplam 25 karakter/rol havuzu oluşturuldu. Üç ana grup vardır: iyi, tarafsız ve kötü. Tüm karakterlerin isim, yaş, meslek, kişilik, hikâye, hayal ve motivasyon taslakları vardır. Güncel ayrıntılı kadro `QUEER_QUEST_QUENCH_CHARACTER_ROSTER.md` dosyasındadır.

25 rolün tamamının tek maçta aktif olması gerekmemelidir. Temsili korumak ve öğrenme yükünü azaltmak için bütün roller karakter havuzunda kalırken maç başına yalnızca oyuncu sayısı kadar rol kullanılmalıdır.

## Legacy mekanik

İlk prototip 30 sahneli gündüz/gece yapısına dayanıyordu. Ev dekorasyonu, ana rol tahmini, muhtar seçimi, gece ziyaretleri, günlük, köy meydanı tartışması ve gitsin/kalsın oylaması gibi sistemler vardı.

Bu yapı, “ilk kez oynayanın hemen anlayabilmesi” hedefi açısından fazla karmaşık bulundu. Bu nedenle 30-sahneli sistem güncel çekirdek oyun döngüsü değil, fikir havuzu ve legacy taslak olarak saklanmalıdır.

## Güncel çekirdek yön

1. Oyuncu kendi rolünü bilmeden oyuna başlar.
2. Oyuncuya çok basit görevler verilir.
3. Görev sonuçları kendi rolü hakkında ipuçları üretir.
4. Oyuncular ortak alanda konuşur, gözlem yapar, rol yapar ve birbirlerini yanıltabilir.
5. Oyuncu kendi rolünü tahmin eder.
6. Doğru veya yanlış tahmin oyun içinde sonuç yaratır.
7. Topluluk oylamaları ve sosyal kararlar maçın yönünü değiştirir.

Önerilen MVP döngüsü:

**Görev → İpucu → Sohbet/Blöf → Rol Tahmini → Topluluk Oylaması → Yeni Tur**

## Şu anda çözülmesi gereken en kritik sorular

- Doğru rol tahmininin ödülü nedir?
- Yanlış rol tahmininin cezası nedir?
- Yalan söylemek neden stratejik olarak gerekli olacaktır?
- İyi, kötü ve tarafsız grupların kazanma koşulları nedir?
- Köyden gönderilen oyuncunun maç deneyimi nasıl devam eder?
- Her aktif role tek, özgün ve bir cümlede anlatılabilen hangi yetenek verilir?
- Maç süresi ve tur sayısı ne olmalıdır?

## Önerilen MVP

- 5–7 oyuncu.
- Tek organik köy haritası.
- Maç başına 6–8 rol/karakter havuzu.
- Her role yalnızca 1 özel yetenek.
- 3–5 ortak görev tipi.
- 1 rol tahmin sistemi.
- 1 topluluk oylama sistemi.
- Günlük/not defteri.
- 15–25 dakika hedef maç süresi.
- İlk aşamada kağıt prototip, ardından Unity prototipi.

## RPG katmanı

Karakter geçmişi, kişilik, kişisel ipuçları, ev dekorasyonu, günlük/not defteri, sosyal ziyaretler ve serbest sohbet RPG'nin temel araçlarıdır. Oyuncu doğruyu söylemek zorunda değildir. Sahte rol iddiası, bilgi saklama, yanlış çıkarım yaratma ve stratejik ittifak oyun davranışı olarak desteklenmelidir.

## Teknik yön

- Unity + C#.
- PC ilk çıkış hedefi.
- Mobil sonraki faz.
- Cross-platform uzun vadeli hedef.
- Online lobby.
- Yazılı sohbet.
- Sesli sohbet planı.
- Bildirim sistemi.
- Günlük/not defteri.

## Görsel ve ses yönü

Oyun dünyası için pixel/çizgi animasyon, karakter sunumlarında anime etkisi konuşuldu. Bu iki görsel dil tek bir art bible altında birleştirilmelidir.

Ses tasarımı ölüm/korku dili yerine Ege köyü sıcaklığı, gündüz huzuru, gece hafif gizem, sosyal oylamada gerilim, rol ipucunda keşif ve doğru/yanlış tahminde kısa geri bildirim sesleri üzerine kurulmalıdır.

## Hedef kitle

Birincil hedef sosyal bluff, party game, casual multiplayer, roleplay ve indie oyun oyuncuları ile Twitch/YouTube yayıncı topluluklarıdır. Kimlik ve çeşitlilik temalarına ilgi duyan oyuncular önemli ikinci kitledir.

## Pazarlama

Twitch, YouTube, TikTok/Reels/Shorts, Discord, Reddit, Steam topluluğu, indie festivaller, creator key ve erken erişim kampanyaları temel kanallar olarak planlandı.

## Gelir modeli

PC premium satış, genişleme paketleri, kozmetik mikro işlemler, mobil reklam, sponsorluk ve opsiyonel premium model değerlendirildi.

## Faz planı

- Faz 1: 2 ay, tasarım + altyapı + görsel + ses + beta.
- Faz 2: 2 ay, PC çıkışı + pazarlama + geri bildirim.
- Faz 3: 1 ay, ilk genişleme + hata düzeltme + lokalizasyon + tanıtım.
- Faz 4: 2 ay, ikinci genişleme + yeni karakterler + mobil uyarlama/test.
- Faz 5: canlı dönem, mobil yayın + bakım + sonraki genişlemeler + cross-platform.

Takvim, çekirdek mekanik kilitlenmeden kesin kabul edilmemelidir.

## Güncel aşama

Konsept, marka, dünya, karakter havuzu, eski prototip mekanik, yeni rol keşfi yönü, teknik yaklaşım, pazarlama ve faz planı oluşturuldu. Henüz oynanabilir ve doğrulanmış çekirdek döngü yoktur. Proje şu anda **pre-production / core-loop design** aşamasındadır.

## Bir sonraki sprint

1. 6 aktif rol seç.
2. Her role tek basit yetenek yaz.
3. 4 görev tipi tasarla.
4. Görevlerin rol ipuçlarını nasıl üreteceğini belirle.
5. Doğru/yanlış tahmin ödül-cezasını belirle.
6. Kazanma koşullarını kesinleştir.
7. Tek sosyal oylama kuralı oluştur.
8. 5 kağıt prototip maçı test et.
9. Yeni oyuncunun sistemi 2 dakika içinde anlayıp anlamadığını ölç.
10. Sonuç başarılıysa Unity prototipine geç.

## Yatırımcı hazırlığı

Projenin güçlü tarafı özgün tema, karakter havuzu ve sosyal farklılaşmadır. Yatırımcı öncesinde en kritik eksik oynanabilir core-loop kanıtıdır. Minimum hedef, insanların birkaç dakikada öğrendiği ve maç sonunda tekrar oynamak istediği küçük bir prototiptir.

## İlgili dosyalar

- `QUEER_QUEST_QUENCH_PROJECT_HANDOVER.md`
- `QUEER_QUEST_QUENCH_PROJECT_DOCUMENTATION.md`
- `QUEER_QUEST_QUENCH_CHARACTER_ROSTER.md`
- `QUEER_QUEST_QUENCH_CHAT_TRANSCRIPT.md`
- `NEW_CHAT_PROMPT.md`
