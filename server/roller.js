// q — Rol Tanımları (Prototip 12 Rol)
// Belge Bölüm 7: Prototip Rol Seti
// Belge Bölüm 9: Gece Aksiyonları

// Grup ID'leri — UI renk eşlemesinde kullanılır
const GRUP = {
  OZGURLUKCU: 'ozgurlukcu',
  TARAFSIZ: 'tarafsiz',
  GELENEKCI: 'gelenekci'
};

// Tüm prototip rolleri — sırasıyla denge tablosuna göre seçileceğiz
const ROLLER = [
  // 🟢 ÖZGÜRLÜKÇÜLER (6 rol — havuzdan seçilecek)
  {
    id: 'gay',
    grup: GRUP.OZGURLUKCU,
    ad: 'Gay',
    karakter: 'Deniz',
    yas: 25,
    meslek: 'İK Uzmanı',
    motivasyon: 'İstanbul\'un kalabalığında kendin olamadın. Bu köy belki nefes aldırır.',
    geceAksiyonu: 'Gece bir kişiyi ziyaret edersin. Özgürlükçüyse rolünü öğrenirsin, Tarafsızsa o gece aksiyonu iptal olur, Gelenekçiyse o Gelenekçinin gece aksiyonu tamamen iptal olur. Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'crossdresser',
    grup: GRUP.OZGURLUKCU,
    ad: 'Crossdresser',
    karakter: 'Umut',
    yas: 34,
    meslek: 'Pilot',
    motivasyon: 'İstanbul\'da gizli yaşadığın bir parçanı bu köyde yaşamak istiyorsun.',
    geceAksiyonu: 'Gece kimin yerine geçeceğini seçersin — kör seçimdir. Kaan o gece seçtiğin kişiyi hedef alırsa sen ayrılırsın; seni hedef alırsa seçtiğin kişi ayrılır. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'drag_queen',
    grup: GRUP.OZGURLUKCU,
    ad: 'Drag Queen',
    karakter: 'Berke',
    yas: 24,
    meslek: 'Senarist',
    motivasyon: 'Sahne arkasında değil ön safta var olmak istiyorsun.',
    geceAksiyonu: 'Gece bir kişiyi "sahneye çıkarırsın." Özgürlükçüyse ertesi gün oyu 2 sayılır. Tarafsızsa o oyuncuyu o gece kimlerin ziyaret ettiğini öğrenirsin. Gelenekçiyse ertesi gün oyu sayılmaz. Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'interseksuel',
    grup: GRUP.OZGURLUKCU,
    ad: 'İnterseksüel',
    karakter: 'Baran',
    yas: 30,
    meslek: 'Biyolog',
    motivasyon: 'Senin gibi olanlara dair çok az şey biliniyor — burada görünür olabilirsin.',
    geceAksiyonu: 'Gece bir oyuncuyu izlersin — kimse fark etmez. O gecekinin kime aksiyon yaptığını öğrenirsin (hedefi görürsün, içeriği değil). Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'transseksuel',
    grup: GRUP.OZGURLUKCU,
    ad: 'Transseksüel',
    karakter: 'Devin',
    yas: 28,
    meslek: 'Yazar',
    motivasyon: 'Geçmişle bugün arasında bir köprü olmak istiyorsun.',
    geceAksiyonu: 'Köyden ayrılan oyuncularla özel kanaldan iletişimde kalırsın. Onlar bilgi aktarabilir, sen de onlara. Bu kanal başka kimseye açık değildir.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'ladyboy',
    grup: GRUP.OZGURLUKCU,
    ad: 'Ladyboy',
    karakter: 'Lila',
    yas: 21,
    meslek: 'Eczacı',
    motivasyon: 'Hayatın boyunca dikkat ettin, şimdi sen dikkat edenlerden olmak istiyorsun.',
    geceAksiyonu: 'Gece kim kimi ziyaret etti öğrenirsin — tüm gece hareketlerinin listesini alırsın. İçerik değil hareket görünür. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Gelenekçiler köyden ayrılırsa kazanırsın.',
    tekil: 'boylar' // Femboy/Ladyboy → sadece biri
  },

  // 🟡 TARAFSIZLAR (3 rol)
  {
    id: 'hetero_erkek',
    grup: GRUP.TARAFSIZ,
    ad: 'Hetero Erkek',
    karakter: 'Mehmet',
    yas: 35,
    meslek: 'Rock Müzisyeni',
    motivasyon: 'Şehirden kaçtın. Kim olduklarına değil, ne içtiklerine bakıyorsun.',
    geceAksiyonu: 'Gece çay içmeye, sohbet etmeye gidersin. Özgürlükçüyse o oyuncuyu o gece kimlerin ziyaret ettiğini öğrenirsin. Tarafsızsa boş gece. Kaan\'a gidersen ertesi gece Kaan\'ın hedefini sen belirlersin. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Bireysel gizli koşulun var (prototipte: oyun sonuna kalmak).',
    tekil: 'heterolar'
  },
  {
    id: 'situationship',
    grup: GRUP.TARAFSIZ,
    ad: 'Situationship',
    karakter: 'Mert',
    yas: 29,
    meslek: 'Fotoğrafçı',
    motivasyon: 'Tanımlamayı sevmiyorsun. Buradaki insanlar da pek tanımlanmak istemiyor gibi.',
    geceAksiyonu: 'Gece birine "yapışırsın" — ne aşk ne arkadaş. Özgürlükçü/Tarafsızsa ikinizin de gece aksiyonu iptal olur (karşılıklı koruma). Kaan\'a yapışırsan rolünü öğrenirsin ama Kaan\'ı engelleyemezsin. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Bireysel gizli koşulun var (prototipte: oyun sonuna kalmak).',
    tekil: null
  },
  {
    id: 'koca_kari',
    grup: GRUP.TARAFSIZ,
    ad: 'Koca Karı',
    karakter: 'Fatma',
    yas: 48,
    meslek: 'Eski Ev Hanımı',
    motivasyon: 'Şehirde kimse seni dinlemiyordu. Burada herkesin hikayesini bileceksin.',
    geceAksiyonu: 'Gece dedikodu toplarsın — iki oyuncu seçersin (kendin dahil olabilir), aynı grupta olup olmadıklarını öğrenirsin. Sistem grup ismini değil sadece "aynı/farklı" bilgisini verir.',
    kazanmaKosulu: 'Bireysel gizli koşulun var (prototipte: oyun sonuna kalmak).',
    tekil: null
  },

  // 🔴 GELENEKÇİLER (3 rol)
  {
    id: 'homofobik',
    grup: GRUP.GELENEKCI,
    ad: 'Homofobik',
    karakter: 'Kaan',
    yas: 45,
    meslek: 'Motosiklet Kurye',
    motivasyon: '"Bu insanlar köyümüzü bozdu." Burayı eskisi gibi yapmaya geldin.',
    geceAksiyonu: 'Ekonomik Abluka. Gece bir kişiyi ekonomik olarak izole edip köyden uzaklaştırırsın. Her gece 1 kişi. Savunma: Gay (engel), Drag Queen (koruma), Crossdresser (yerine geçme). Kendine aksiyon yapamazsın.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: 'fobikler-homo',
    zorunlu: true // Kaan her oyunda bulunur
  },
  {
    id: 'muhafazakar',
    grup: GRUP.GELENEKCI,
    ad: 'Muhafazakâr',
    karakter: 'Necmi',
    yas: 52,
    meslek: 'Emekli Memur',
    motivasyon: 'Eski düzeni özlüyorsun. Konuşmaya, ikna etmeye geldin.',
    geceAksiyonu: 'Sosyal Manipülasyon. Gece birine yakınlık gösterirsin — ertesi gün oylamada o oyuncu senin oy verdiğin kişiye otomatik oy verir, fark etmez ve değiştiremez. Sen oy vermezsen o da kullanamaz. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: null
  },
  {
    id: 'erkek_dusmani',
    grup: GRUP.GELENEKCI,
    ad: 'Erkek Düşmanı',
    karakter: 'Azra',
    yas: 34,
    meslek: 'Ürün Yöneticisi',
    motivasyon: 'Erkeklerden çok çekmişsin. Burada düzeni sen kuracaksın.',
    geceAksiyonu: 'Kimlik Tespiti. Oyun başında tüm oyuncuların doğuştan cinsiyetini öğrenirsin (rol kartından otomatik). Gece bir erkek oyuncuyu hedef alırsın — ertesi gün oyu sayılmaz. Gay engeli iptal eder. Kendine aksiyon yapabilirsin.',
    kazanmaKosulu: 'Tüm Özgürlükçüler köyden ayrılırsa kazanırsın.',
    tekil: null
  }
];

// Karakter cinsiyetleri (Azra'nın aksiyonu için)
// Belge: "Azra'nın aksiyonu için gereken cinsiyet bilgisi her karakterin rol kartından otomatik gelir"
const KARAKTER_CINSIYET = {
  'gay': 'erkek',
  'crossdresser': 'erkek',
  'drag_queen': 'erkek',
  'interseksuel': 'diger', // İnterseksüel — ne erkek ne kadın olarak modelleniyor
  'transseksuel': 'kadin', // Devin trans kadın olarak yazılmış
  'ladyboy': 'kadin',
  'hetero_erkek': 'erkek',
  'situationship': 'erkek',
  'koca_kari': 'kadin',
  'homofobik': 'erkek',
  'muhafazakar': 'erkek',
  'erkek_dusmani': 'kadin'
};

// Denge tablosu (Belge Bölüm 8)
const DENGE = {
  6:  { ozgurlukcu: 2, tarafsiz: 2, gelenekci: 2 },
  7:  { ozgurlukcu: 3, tarafsiz: 2, gelenekci: 2 },
  8:  { ozgurlukcu: 3, tarafsiz: 3, gelenekci: 2 },
  9:  { ozgurlukcu: 4, tarafsiz: 3, gelenekci: 2 },
  10: { ozgurlukcu: 4, tarafsiz: 3, gelenekci: 3 },
  11: { ozgurlukcu: 5, tarafsiz: 3, gelenekci: 3 },
  12: { ozgurlukcu: 6, tarafsiz: 3, gelenekci: 3 }
};

module.exports = {
  GRUP,
  ROLLER,
  KARAKTER_CINSIYET,
  DENGE
};
