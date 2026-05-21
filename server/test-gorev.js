// Görev yenileme — değişen mantık testleri (v1.8.34)
// Çalıştır: cd server && node test-gorev.js
const assert = require('assert');
const { fuckbuddyKazandiMi, sugarDaddyKazandiMi, aksiyonTipiBul, heteroKadinKazandiMi, aseksuelKazandiMi, fetisistKazandiMi, dulKazandiMi, poliamoristKazandiMi } = require('./geceMotoru.js');

let gecti = 0, kaldi = 0;
function t(ad, fn) {
  try { fn(); console.log('  OK ', ad); gecti++; }
  catch (e) { console.log('  XX ', ad, '->', e.message); kaldi++; }
}

// id->{hedefId:sayi} biçimini Map<id, Map<hedefId,sayi>>'ye çevirir
function icMap(obj) {
  return new Map(Object.entries(obj).map(([k, v]) => [k, new Map(Object.entries(v))]));
}
function mockOda({ fbTakip, sdYatirim, players }) {
  const oda = { oyun: {}, players: players || [] };
  if (fbTakip) oda.oyun.fbTakip = icMap(fbTakip);
  if (sdYatirim) oda.oyun.sdYatirim = icMap(sdYatirim);
  return oda;
}

console.log('Fuckbuddy (Tuna) — aynı kişiyi 3 gece + sağ kalsın:');
t('3 gece aynı hedef + hedef köyde -> kazanır', () => {
  const oda = mockOda({ fbTakip: { tuna: { ada: 3 } }, players: [{ id: 'ada', koydeMi: true }] });
  assert.strictEqual(fuckbuddyKazandiMi(oda, 'tuna'), true);
});
t('3 gece ama hedef ayrıldı -> kazanamaz', () => {
  const oda = mockOda({ fbTakip: { tuna: { ada: 3 } }, players: [{ id: 'ada', koydeMi: false }] });
  assert.strictEqual(fuckbuddyKazandiMi(oda, 'tuna'), false);
});
t('sadece 2 gece -> kazanamaz', () => {
  const oda = mockOda({ fbTakip: { tuna: { ada: 2 } }, players: [{ id: 'ada', koydeMi: true }] });
  assert.strictEqual(fuckbuddyKazandiMi(oda, 'tuna'), false);
});
t('2+1 farklı hedefe dağılmış -> kazanamaz', () => {
  const oda = mockOda({ fbTakip: { tuna: { ada: 2, can: 1 } }, players: [{ id: 'ada', koydeMi: true }, { id: 'can', koydeMi: true }] });
  assert.strictEqual(fuckbuddyKazandiMi(oda, 'tuna'), false);
});
t('hiç takip yok -> kazanamaz', () => {
  const oda = mockOda({ players: [] });
  assert.strictEqual(fuckbuddyKazandiMi(oda, 'tuna'), false);
});

console.log('Sugar Daddy (Eren) — bir kişiye 2 yatırım + sağ kalsın:');
t('2 yatırım aynı kişi + köyde -> kazanır', () => {
  const oda = mockOda({ sdYatirim: { eren: { mehmet: 2 } }, players: [{ id: 'mehmet', koydeMi: true }] });
  assert.strictEqual(sugarDaddyKazandiMi(oda, 'eren'), true);
});
t('2 yatırım ama kişi ayrıldı -> kazanamaz', () => {
  const oda = mockOda({ sdYatirim: { eren: { mehmet: 2 } }, players: [{ id: 'mehmet', koydeMi: false }] });
  assert.strictEqual(sugarDaddyKazandiMi(oda, 'eren'), false);
});
t('sadece 1 yatırım -> kazanamaz', () => {
  const oda = mockOda({ sdYatirim: { eren: { mehmet: 1 } }, players: [{ id: 'mehmet', koydeMi: true }] });
  assert.strictEqual(sugarDaddyKazandiMi(oda, 'eren'), false);
});

console.log('Aksiyon tipi (Beren "taşınan yükün türü") :');
t('homofobik -> engelleme', () => assert.strictEqual(aksiyonTipiBul('homofobik'), 'engelleme'));
t('drag_queen -> koruma', () => assert.strictEqual(aksiyonTipiBul('drag_queen'), 'koruma'));
t('interseksuel -> izleme', () => assert.strictEqual(aksiyonTipiBul('interseksuel'), 'izleme'));
t('gay -> ziyaret (varsayılan)', () => assert.strictEqual(aksiyonTipiBul('gay'), 'ziyaret'));

// key->{ownerId:[targetId...]} -> Map<ownerId, Set<targetId>>
function setOda(key, obj) {
  const oda = { oyun: {} };
  oda.oyun[key] = new Map(Object.entries(obj).map(([k, v]) => [k, new Set(v)]));
  return oda;
}

console.log('Hetero Kadın (Bahar) — 2 erkek + 2 kadın hedef:');
t('2E + 2K -> kazanır', () => {
  const oda = { oyun: { hkHedefler: icMap({ bahar: { a: 'erkek', b: 'erkek', c: 'kadin', d: 'kadin' } }) } };
  assert.strictEqual(heteroKadinKazandiMi(oda, 'bahar'), true);
});
t('2E + 1K -> kazanamaz', () => {
  const oda = { oyun: { hkHedefler: icMap({ bahar: { a: 'erkek', b: 'erkek', c: 'kadin' } }) } };
  assert.strictEqual(heteroKadinKazandiMi(oda, 'bahar'), false);
});
t('diger cinsiyet sayılmaz -> kazanamaz', () => {
  const oda = { oyun: { hkHedefler: icMap({ bahar: { a: 'erkek', b: 'erkek', c: 'diger', d: 'diger' } }) } };
  assert.strictEqual(heteroKadinKazandiMi(oda, 'bahar'), false);
});

console.log('Aseksüel / Fetişist / Dul / Poliamorist — 3 farklı:');
t('Aseksüel 3 stalk -> kazanır', () => assert.strictEqual(aseksuelKazandiMi(setOda('asHedefler', { irmak: ['a', 'b', 'c'] }), 'irmak'), true));
t('Aseksüel 2 stalk -> kazanamaz', () => assert.strictEqual(aseksuelKazandiMi(setOda('asHedefler', { irmak: ['a', 'b'] }), 'irmak'), false));
t('Fetişist 3 doğru -> kazanır', () => assert.strictEqual(fetisistKazandiMi(setOda('ftDogru', { kartal: ['a', 'b', 'c'] }), 'kartal'), true));
t('Dul 3 anı -> kazanır', () => assert.strictEqual(dulKazandiMi(setOda('dulAnilar', { fatma: ['a', 'b', 'c'] }), 'fatma'), true));
t('Dul 2 anı -> kazanamaz', () => assert.strictEqual(dulKazandiMi(setOda('dulAnilar', { fatma: ['a', 'b'] }), 'fatma'), false));
t('Poliamorist 3 harf -> kazanır', () => assert.strictEqual(poliamoristKazandiMi(setOda('poliOgrendi', { ekin: ['a', 'b', 'c'] }), 'ekin'), true));
t('Poliamorist 2 harf -> kazanamaz', () => assert.strictEqual(poliamoristKazandiMi(setOda('poliOgrendi', { ekin: ['a', 'b'] }), 'ekin'), false));

console.log('\nSonuc: ' + gecti + ' gecti, ' + kaldi + ' kaldi');
process.exit(kaldi ? 1 : 0);
