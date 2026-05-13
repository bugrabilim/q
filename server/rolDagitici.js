// q — Rol Dağıtıcı
// Belge Bölüm 7, 8: 12 rol havuzundan oyuncu sayısına göre alt küme seçimi
// Kurallar:
//   - Denge tablosu (6-12): grup başına rol sayısı sabit
//   - Kaan (Homofobik) her oyunda zorunlu
//   - Tekil rol kuralı (Femboy/Ladyboy gibi) — prototipte ladyboy tek var, sorun değil

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
 * Oyuncu listesi için rol dağıt.
 * @param {Array<{id, isim}>} oyuncular
 * @returns {Map<oyuncuId, rol>} — her oyuncu ID'sine rol eşlemesi
 */
function rolleriDagit(oyuncular) {
  const sayi = oyuncular.length;
  const denge = DENGE[sayi];

  if (!denge) {
    throw new Error(`${sayi} oyuncu için denge tanımlı değil (6-12 arası olmalı)`);
  }

  // 1) Her gruptan rolleri seç
  const ozgurlukcuRolleri = gruptanSec(GRUP.OZGURLUKCU, denge.ozgurlukcu);
  const tarafsizRolleri = gruptanSec(GRUP.TARAFSIZ, denge.tarafsiz);
  const gelenekciRolleri = gruptanSec(GRUP.GELENEKCI, denge.gelenekci);

  const tumRoller = [
    ...ozgurlukcuRolleri,
    ...tarafsizRolleri,
    ...gelenekciRolleri
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

  return dagilim;
}

module.exports = { rolleriDagit };
