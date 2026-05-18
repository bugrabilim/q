// q — Köy Olayları (atmosfer mesajları)
//
// v1.8 — Master Bölüm 18'de "köy olayları" planlanan iş olarak listelenmişti.
// V1'in basit hali: sabah ekranında %30 ihtimalle rastgele bir atmosfer mesajı
// sistemMesaji olarak sohbete düşer. Mekanik etki yoktur — sadece köy hayatı
// duygusu katar.
//
// V2'de mekanik etkili olaylar eklenebilir (örn. "Yağmur var → bu gece DQ
// koruması bonusu" gibi). Şimdilik sadece atmosfer.

const KOY_OLAYLARI = [
  '🍞 Fırının önünde bugün uzun bir kuyruk vardı, taze ekmeğin kokusu sokakları sardı.',
  '🌫️ Sabah erken köyün bir ucu sise gömüldü, çobanların sesi uzaktan duyuldu.',
  '🐈 Bakkalın önündeki kedi yavru doğurdu, dört tane.',
  '💧 Köy meydanındaki çeşmenin suyu yarım saatliğine kesildi, sonra geri geldi.',
  '🐦 Bir kuş köyün damına yuva yapmış, kimse bozmamış.',
  '🌧️ Akşam üstü hafif bir yağmur yağdı, bahçeler keyiflendi.',
  '⚙️ Köyün eski değirmeninin dişlilerinden biri kırıldı, ustaca tamiri bekleniyor.',
  '✉️ Köye yeni bir mektup geldi, kime olduğu hâlâ belli değil.',
  '⭐ Geceleyin gökyüzünde çok parlak bir yıldız göründü, hatırlayan kimse yoktu adını.',
  '🦆 Köyün küçük gölünde tanımadık bir kuş türü görüldü.',
  '🍅 Bahçedeki domatesler kızardı, ilk hasat zamanı geldi.',
  '📜 Köyün eski kuyusunun yanındaki taşın altında bir not bulundu — yıllar öncesinden.',
  '🌬️ Köyün rüzgârgülü sabaha karşı kuzeye döndü; dün güneydeydi.',
  '🍯 Komşu kasabadan bir tüccar geldi, sadece bal sattı, çayını içip gitti.',
  '🐕 Bir köpek köyün ortasında yatıp uyudu, kimse rahatsız etmedi.',
  '💡 Köyün sokak lambasının biri sabaha kadar yanmaya devam etti, kapatan olmadı.',
  '🌸 İhtiyar bir köylü bahçesindeki yeni çiçeği herkese tek tek gösterdi.',
  '🚶 Bir grup gezgin köyden sessizce geçti, kimseyle konuşmadan gittiler.',
  '🌾 Tarlanın kenarındaki yabani buğday başakları olgunlaştı.',
  '🔔 Köyün küçük çanı sabah erken kendi kendine üç kez çaldı, kimse el sürmemişti.'
];

// %30 ihtimal — değiştirilebilir
const OLAY_IHTIMALI = 0.3;

/**
 * Sabaha geçişte çağrılır. İhtimal tutarsa bir olay döner, yoksa null.
 * @returns {string|null}
 */
function rastgeleKoyOlayi() {
  if (Math.random() > OLAY_IHTIMALI) return null;
  const i = Math.floor(Math.random() * KOY_OLAYLARI.length);
  return KOY_OLAYLARI[i];
}

module.exports = { KOY_OLAYLARI, rastgeleKoyOlayi, OLAY_IHTIMALI };
