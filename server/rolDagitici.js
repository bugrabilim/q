// q — Rol Dağıtıcı
// Belge Bölüm 7, 8: 12 rol havuzundan oyuncu sayısına göre alt küme seçimi
// Kurallar:
//   - Denge tablosu (4-12): grup başına rol sayısı sabit
//   - Kaan (Homofobik) her oyunda zorunlu
//   - Tekil rol kuralı (Femboy/Ladyboy gibi) — prototipte ladyboy tek var, sorun değil
//   - Host override (Madde 4): oda.ayarlar.dagilim verilirse onu kullanır, yoksa DENGE[sayi]

const { ROLLER, DENGE, GRUP } = require('./roller.js');

// Fisher-Yates karıştırma
function karistir(dizi) {
  const yeni = [...dizi];
  for (let i = yeni.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [yeni[i], yeni[j]] = [yeni[j], yeni[i]];
  }
  return yeni;
}

// Belirli bir gruptan N tane rastgele rol seç (zorunlu olanlar önce)
function gruptanSec(grupId, sayi) {
  const havuz = ROLLER.filter(r => r.grup === grupId);
  const zorunlular = havuz.filter(r => r.zorunlu);
  const digerleri = havuz.filter(r => !r.zorunlu);

  if (zorunlular.length > sayi) {
    throw new Error(`${grupId} grubunda ${zorunlular.length} zorunlu rol var ama sadece ${sayi} yer var`);
  }

  const secilen = [...zorunlular];
  const karistirilmis = karistir(digerleri);
  const eksik = sayi - zorunlular.length;
  secilen.push(...karistirilmis.slice(0, eksik));

  return secilen;
}

/**
 * Murat (Bastırmış / Outsider) için oyundaki Özgürlükçü rollerinden rastgele
 * birini "sahte rol" olarak seçer. Murat oyun boyunca bu sahte rolün
 * arayüzüyle oynar; gerçek rolü server'da bastirmis olarak kalır.
 *
 * Belge §9 / faz1-mekanik-kararlar.md Karar 2 (Murat C):
 *   "Oyun başında, oyundaki Özgürlükçü havuzundan rastgele bir rol seçilir;
 *    Murat'a rol kartında o rol gösterilir."
 *
 * Kenar durum: Oyunda hiç Özgürlükçü yoksa null döner; çağrı tarafı bunu
 * yakalamalı (V1'de host kontrolünden geçer, ama güvenlik için).
 *
 * @param {Array<rol>} tumRoller — Bastırmış DAHİL tüm dağıtılan rol objeleri
 * @returns {Object|null} — Sahte rol objesi veya null
 */
function muratSahteRolSec(tumRoller) {
  const ozgurlukcuRolleri = tumRoller.filter(r => r.grup === GRUP.OZGURLUKCU);
  if (ozgurlukcuRolleri.length === 0) return null;
  const sira = Math.floor(Math.random() * ozgurlukcuRolleri.length);
  return ozgurlukcuRolleri[sira];
}

/**
 * Oyuncu listesi için rol dağıt.
 * @param {Array<{id, isim}>} oyuncular
 * @param {Object} [ozelDenge] — host'un seçtiği özel dağılım (Madde 4 A seçeneği)
 *   Format: { ozgurlukcu, tarafsiz, gelenekci, outsider?, kaoscu? }
 *   - outsider: 0 veya 1 (default 0) — Murat
 *   - kaoscu:   0..4    (default 0) — host kontrolüne kalmış
 *   Outsider ve Kaosçu sayıları toplam oyuncu sayısından düşer; geri kalan
 *   üç ana grup arasında paylaştırılır.
 * @returns {{dagilim: Map<oyuncuId, rol>, sahteRoller: Map<oyuncuId, rol>}}
 *   - dagilim: her oyuncu ID'sine GERÇEK rol eşlemesi (Murat için bastirmis)
 *   - sahteRoller: sadece Outsider'lar için sahte (gösterilen) rol eşlemesi
 */
function rolleriDagit(oyuncular, ozelDenge) {
  const sayi = oyuncular.length;
  const denge = ozelDenge || DENGE[sayi];

  if (!denge) {
    throw new Error(`${sayi} oyuncu için denge tanımlı değil (4-12 arası olmalı)`);
  }

  // V1: Outsider ve Kaosçu opsiyonel; default 0 (host isterse açar).
  // Master belge Bölüm 8 — denge tablosunda bu sütunlar opsiyoneldir.
  const outsiderSayi = denge.outsider || 0;
  const kaoscuSayi   = denge.kaoscu   || 0;

  if (outsiderSayi < 0 || outsiderSayi > 1) {
    throw new Error('outsider sayısı 0 veya 1 olmalı (V1: sadece Murat)');
  }
  if (kaoscuSayi < 0) {
    throw new Error('kaoscu sayısı negatif olamaz');
  }

  // Özel denge validasyonu: toplam oyuncu sayısıyla uyumlu, Kaan zorunlu (gel ≥ 1)
  const toplam = (denge.ozgurlukcu || 0)
               + (denge.tarafsiz || 0)
               + (denge.gelenekci || 0)
               + outsiderSayi
               + kaoscuSayi;
  if (toplam !== sayi) {
    throw new Error(`Dağılım toplamı (${toplam}) oyuncu sayısıyla (${sayi}) uyuşmuyor`);
  }
  if ((denge.gelenekci || 0) < 1) {
    throw new Error('En az 1 gelenekçi olmalı (Kaan zorunlu)');
  }

  // 1) Her gruptan rolleri seç
  const ozgurlukcuRolleri = gruptanSec(GRUP.OZGURLUKCU, denge.ozgurlukcu);
  const tarafsizRolleri   = gruptanSec(GRUP.TARAFSIZ,   denge.tarafsiz);
  const gelenekciRolleri  = gruptanSec(GRUP.GELENEKCI,  denge.gelenekci);
  // Outsider havuzu: V1'de sadece Murat (bastirmis). Tekil kuralı yok.
  const outsiderRolleri   = outsiderSayi > 0
    ? gruptanSec(GRUP.OUTSIDER, outsiderSayi)
    : [];
  // Kaosçu havuzu: 4 rol, tekil kuralı yok — istenen kadar rastgele seçilir.
  const kaoscuRolleri     = kaoscuSayi > 0
    ? gruptanSec(GRUP.KAOSCU, kaoscuSayi)
    : [];

  const tumRoller = [
    ...ozgurlukcuRolleri,
    ...tarafsizRolleri,
    ...gelenekciRolleri,
    ...outsiderRolleri,
    ...kaoscuRolleri
  ];

  if (tumRoller.length !== sayi) {
    throw new Error(`Rol sayısı (${tumRoller.length}) oyuncu sayısıyla (${sayi}) uyuşmuyor`);
  }

  // 2) Rolleri ve oyuncuları karıştır, eşleştir
  const karistirilmisRoller = karistir(tumRoller);
  const karistirilmisOyuncular = karistir(oyuncular);

  const dagilim = new Map();
  for (let i = 0; i < sayi; i++) {
    dagilim.set(karistirilmisOyuncular[i].id, karistirilmisRoller[i]);
  }

  // 3) Outsider (Bastırmış / Murat) için sahte rol ata
  // Kenar durum: oyunda Özgürlükçü yoksa sahteRoller boş kalır.
  // Bu durumda Murat client'a "Bastırmış" gerçek kimliğiyle gösterilir
  // (V1 host kontrolüne kalmış; pratikte denge tablosunda hep ozgurlukcu ≥ 2).
  const sahteRoller = new Map();
  for (const [oyuncuId, rol] of dagilim.entries()) {
    if (rol.id === 'bastirmis') {
      const sahte = muratSahteRolSec(tumRoller);
      if (sahte) sahteRoller.set(oyuncuId, sahte);
    }
  }

  return { dagilim, sahteRoller };
}

module.exports = { rolleriDagit, muratSahteRolSec };
