// Q — Ses Haritası
// Faz → müzik dosyası eşleştirmesi ve UI efekt dosyaları.
// Dosyalar client/public/ses/ altında; tarayıcıya kök yoldan (/ses/...) servis edilir.

const TABAN = '/ses';

// Her müzik fazında bir veya birden çok parça olabilir.
// Birden çok varsa çalınırken rastgele biri seçilir (çeşitlilik).
export const MUZIK_DOSYALARI = {
  gunduz: [
    `${TABAN}/muzik/gunduz-1.mp3`,
    `${TABAN}/muzik/gunduz-2.mp3`,
    `${TABAN}/muzik/gunduz-3.mp3`,
  ],
  sabah: [`${TABAN}/muzik/sabah.mp3`],
  gece: [
    `${TABAN}/muzik/gece-1.mp3`,
    `${TABAN}/muzik/gece-2.mp3`,
  ],
  savunma: [
    `${TABAN}/muzik/savunma-1.mp3`,
    `${TABAN}/muzik/savunma-2.mp3`,
  ],
  'bitis-ozg': [`${TABAN}/muzik/bitis-ozg.mp3`],
  'bitis-gel': [`${TABAN}/muzik/bitis-gel.mp3`],
};

// UI ses efektleri
export const EFEKT_DOSYALARI = {
  tikla: `${TABAN}/efekt/tikla.mp3`,
  oylama: `${TABAN}/efekt/oylama.mp3`,
  bildirim: `${TABAN}/efekt/bildirim.mp3`,
  ayrilma: `${TABAN}/efekt/ayrilma.mp3`,
  kazan: `${TABAN}/efekt/kazan.mp3`,
  notdefteri: `${TABAN}/efekt/notdefteri.mp3`,
};

// Sunucu fazını (serverFaz) veya ekran fazını müzik fazı anahtarına çevirir.
// Dönüş: MUZIK_DOSYALARI anahtarı veya null (sessiz).
//
// Eşleştirme:
//   acilis                                  → null (sessiz, kullanıcı henüz "Sesi Aç" basmadı)
//   gece                                    → gece
//   sabah                                   → sabah  (gece sonuçları/ifşa anı — kendi parçası)
//   savunma                                 → savunma
//   bitis                                   → bitis-gel (gelenekçi kazandı) / bitis-ozg (diğer)
//   lobi, rol_dagitimi, tanisma, tartisma,
//   oylama_1/2/tartisma/sonuc, diğer her şey → gunduz
//
// Bitiş notu: kazananGrupBul yalnız 'ozgurlukcu' | 'gelenekci' | 'beraberlik' döner.
// Tarafsız tek başına kazandığında dahi ana grup 'ozgurlukcu' olur → yeşil parça çalar.
export function fazaMuzikEslestir(faz, kazananGrup) {
  switch (faz) {
    case 'acilis':
      return null;
    case 'gece':
      return 'gece';
    case 'sabah':
      return 'sabah';
    case 'savunma':
      return 'savunma';
    case 'bitis':
      return kazananGrup === 'gelenekci' ? 'bitis-gel' : 'bitis-ozg';
    default:
      return 'gunduz';
  }
}
