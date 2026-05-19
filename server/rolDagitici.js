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

// Belirli bir gruptan N tane rastgele rol seç (zorunlu olanlar önce).
// v1.8 — Tekil kural kaldırıldı; aynı rolden birden fazla oyuncu olabilir.
// v1.8.32 — B seçeneği: rolHavuzu verilirse, kapalı roller (false) havuzdan çıkarılır.
// Zorunlu roller (örn. Kaan) hâlâ en az 1 kez dağıtılır; geri kalanlar havuzdan
// rastgele (tekrar serbest) seçilir.
function gruptanSec(grupId, sayi, rolHavuzu) {
  if (sayi <= 0) return [];

  let havuz = ROLLER.filter(r => r.grup === grupId);
  // v1.8.32 — Host B seçeneğiyle bazı rolleri kapattıysa filtrele
  if (rolHavuzu && typeof rolHavuzu === 'object') {
    havuz = havuz.filter(r => rolHavuzu[r.id] !== false);
    if (havuz.length === 0) {
      throw new Error(`${grupId} grubunda rol havuzunda açık rol kalmadı (B seçeneği)`);
    }
  }
  const zorunlular = havuz.filter(r => r.zorunlu);
  const digerleri = havuz.filter(r => !r.zorunlu);

  // v1.8 — Eğer talep edilen sayı zorunlu sayısından azsa, zorunlular kısaltılır
  // (Kaan zorunluluğu artık host iste/istemez seçenekli; gelenekçi 0 olabilir)
  if (zorunlular.length > sayi) {
    zorunlular.length = sayi;
  }

  const secilen = [...zorunlular];
  const eksik = sayi - zorunlular.length;

  if (eksik > 0 && digerleri.length === 0) {
    throw new Error(`${grupId} grubunda dağıtılacak ek rol yok`);
  }

  // Aynı rol birden fazla seçilebilir — havuzdan rastgele çek, geri koy.
  for (let i = 0; i < eksik; i++) {
    const aday = digerleri[Math.floor(Math.random() * digerleri.length)];
    secilen.push(aday);
  }

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
function rolleriDagit(oyuncular, ozelDenge, rolHavuzu) {
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
  // BUG #6 defansif: Outsider (Murat) sahte rolü için en az 1 Özgürlükçü gerekli.
  // Aksi halde Murat'a gerçek "Bastırmış" rolü gösterilir (faz1-mekanik #2).
  if (outsiderSayi > 0 && (denge.ozgurlukcu || 0) < 1) {
    throw new Error('Outsider seçmek için en az 1 Özgürlükçü olmalı');
  }

  // 1) Her gruptan rolleri seç (v1.8.32 — rolHavuzu varsa filtre uygula)
  const ozgurlukcuRolleri = gruptanSec(GRUP.OZGURLUKCU, denge.ozgurlukcu, rolHavuzu);
  const tarafsizRolleri   = gruptanSec(GRUP.TARAFSIZ,   denge.tarafsiz,   rolHavuzu);
  const gelenekciRolleri  = gruptanSec(GRUP.GELENEKCI,  denge.gelenekci,  rolHavuzu);
  // Outsider havuzu: V1'de sadece Murat (bastirmis). Tekil kuralı yok.
  const outsiderRolleri   = outsiderSayi > 0
    ? gruptanSec(GRUP.OUTSIDER, outsiderSayi, rolHavuzu)
    : [];
  // Kaosçu havuzu: 4 rol, tekil kuralı yok — istenen kadar rastgele seçilir.
  const kaoscuRolleri     = kaoscuSayi > 0
    ? gruptanSec(GRUP.KAOSCU, kaoscuSayi, rolHavuzu)
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
