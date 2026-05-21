// Görev yenileme — değişen mantık testleri (v1.8.34)
// Çalıştır: cd server && node test-gorev.js
const assert = require('assert');
const { fuckbuddyKazandiMi, sugarDaddyKazandiMi, aksiyonTipiBul } = require('./geceMotoru.js');

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

console.log('\nSonuc: ' + gecti + ' gecti, ' + kaldi + ' kaldi');
process.exit(kaldi ? 1 : 0);
