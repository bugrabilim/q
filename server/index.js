// Queer Quest Quench — Prototip Sunucusu
// Fazlar: lobi → rol_dagitimi → tanisma → (sıradaki: gece)

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const { rolleriDagit } = require('./rolDagitici.js');
const { KARAKTER_CINSIYET } = require('./roller.js');
const { geceyiCozumle, ayrilanAciklamalari } = require('./geceMotoru.js');

// Production: CLIENT_URL env tanımlıysa onu kullan; yoksa same-origin (true)
// Dev: Vite 5173'ten geliyor.
const izinliOriginler = process.env.NODE_ENV === 'production'
  ? (process.env.CLIENT_URL ? [process.env.CLIENT_URL] : true)
  : ['http://localhost:5173'];

const app = express();
app.use(cors({ origin: izinliOriginler }));

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: { origin: izinliOriginler, methods: ['GET', 'POST'] }
});

// Faz süreleri
const SURE_BASVURU = Number(process.env.Q_BASVURU_MS || 5_000);
const SURE_TANISMA = Number(process.env.Q_TANISMA_MS || 30_000);
// v1.5 — Madde 1: Rol kartı max süre (otomatik tanışmaya geç)
const SURE_ROL = Number(process.env.Q_ROL_MS || 10_000);
// v1.5 — Madde 2: Sabah ekranı max süre (host basmasa da otomatik devam)
const SURE_SABAH = Number(process.env.Q_SABAH_MS || 30_000);

const rooms = {};

function odaKoduUret() {
  for (let deneme = 0; deneme < 100; deneme++) {
    const kod = String(Math.floor(10000 + Math.random() * 90000));
    if (!rooms[kod]) return kod;
  }
  throw new Error('Oda kodu üretilemedi');
}

// v1.7 — Kimlik açıklama adedi default'u (host lobide 0-3 seçer; default 1 = mevcut davranış)
const KIMLIK_ACIKLAMA_DEFAULT = 1;

// Yardımcı: oda.ayarlar yapısını garanti et (her zaman obje)
function ayarlariNormalize(oda) {
  if (!oda.ayarlar || typeof oda.ayarlar !== 'object') {
    oda.ayarlar = { dagilim: null, kimlikAciklamaAdedi: KIMLIK_ACIKLAMA_DEFAULT };
  } else {
    if (oda.ayarlar.dagilim === undefined) oda.ayarlar.dagilim = null;
    if (!Number.isInteger(oda.ayarlar.kimlikAciklamaAdedi)) {
      oda.ayarlar.kimlikAciklamaAdedi = KIMLIK_ACIKLAMA_DEFAULT;
    }
  }
  return oda.ayarlar;
}

// Oyuncu sayısı değişince özel dağılım geçersiz olur; ancak kimlikAciklamaAdedi korunur
function ozelDagilimiSifirla(oda) {
  const ayarlar = ayarlariNormalize(oda);
  ayarlar.dagilim = null;
}

function lobiDurumu(oda) {
  const ayarlar = ayarlariNormalize(oda);
  return {
    kod: oda.kod,
    faz: oda.faz,
    players: oda.players.map(p => ({
      id: p.id,
      isim: p.isim,
      hostMu: p.hostMu,
      baglantiVar: p.baglantiVar,
      bot: !!p.bot
    })),
    oyuncuSayisi: oda.players.length,
    minOyuncu: 4,
    maxOyuncu: 12,
    ayarlar
  };
}

function lobiyiYayinla(kod) {
  const oda = rooms[kod];
  if (!oda) return;
  io.to(kod).emit('oda:durum', lobiDurumu(oda));
}

function oyuncuyuBul(oda, id) {
  return oda.players.find(p => p.id === id);
}

// ─── Murat C — Görünen Rol Yardımcısı ────────────────────────
// Belge §9 + faz1-mekanik-kararlar.md Karar 2: Bastırmış (Murat) oyun boyunca
// SAHTE Özgürlükçü rolüyle görünür. Diğer oyuncular Murat'ı incelediğinde,
// kimliği açıklandığında ya da liste gördüklerinde sahte rolü görür.
// Gerçek rol yalnızca:
//   - Oyun bitince (bitiseBasla içinde herkese ifşa)
//   - Server'ın iç kazanma kontrolü (kazananGrupBul, erkenBitisKazanani)
// için kullanılır.
function gorunenRol(oda, oyuncuId) {
  if (!oda.oyun?.roller) return null;
  const sahte = oda.oyun.sahteRoller?.get(oyuncuId);
  if (sahte) return sahte;
  return oda.oyun.roller.get(oyuncuId) || null;
}

function aciklananKimlikler(oda) {
  if (!oda.oyun) return {};
  const sonuc = {};
  for (const id of oda.oyun.aciklanmislar) {
    // Murat kendi kimliğini açıklarsa SAHTE rol görünür (kendisi de sahte rolü
    // sanıyor zaten). Diğer oyuncular için aynı görünüm.
    const rol = gorunenRol(oda, id);
    if (rol) sonuc[id] = { ad: rol.ad, grup: rol.grup };
  }
  return sonuc;
}

// ─── Oyuncu listesi (Madde 8 + 12) ──────────────────────────
// Her oyuncuya kişiselleştirilmiş liste:
//   - Ayrılan oyuncular TÜM rolleri görür (Madde 12)
//   - Köydeki oyuncular yalnızca: kimliği açıklanan + ayrılan oyuncuların rolünü görür
function oyuncuListesi(oda, kullaniciId) {
  const kullanici = oyuncuyuBul(oda, kullaniciId);
  const benAyrilanmiyim = kullanici?.koydeMi === false;
  return oda.players.map(p => {
    const gercek = oda.oyun?.roller?.get(p.id);
    // Murat C: kimliği görünen yerlerde her zaman sahte rol kullanılır;
    // gerçek rol yalnızca Murat KÖYDEN AYRILDIYSA ifşa olur (kenar durum).
    // Murat hâlâ köydeyse sahte rol görünür (bitiş ekranı ayrı yoldan ifşa eder).
    const muratAyrildi = gercek?.id === 'bastirmis' && p.koydeMi === false;
    const rol = muratAyrildi ? gercek : gorunenRol(oda, p.id);
    let rolBilgi = null;
    if (rol) {
      const ifsa = oda.oyun?.aciklanmislar?.has(p.id) || p.koydeMi === false;
      if (benAyrilanmiyim || ifsa) {
        // v1.6 — Madde 5: karakter + portre yolu da yollanır (avatar göstermek için)
        rolBilgi = {
          id: rol.id,
          ad: rol.ad,
          grup: rol.grup,
          karakter: rol.karakter,
          gorsel: rol.gorsel
        };
      }
    }
    return {
      id: p.id,
      isim: p.isim,
      koydeMi: p.koydeMi !== false,
      baglantiVar: p.baglantiVar !== false,
      bot: !!p.bot,
      hostMu: !!p.hostMu,
      rol: rolBilgi,
      // v1.3 — Master §15: "kendi" = Oyundan Çık ile ayrıldı (sistem mesajı + ibareli liste)
      ayrilmaSebebi: p.ayrilmaSebebi || null
    };
  });
}

// Her oyuncuya kendi kişisel listesini canlı yayınla
function oyuncuListesiYayinla(oda) {
  if (!oda?.oyun) return;
  oda.players.forEach(p => {
    io.to(p.id).emit('oyuncu:listesi', { oyuncular: oyuncuListesi(oda, p.id) });
  });
}

// ─── Sohbet & Kanallar (Aşama C — Madde 3-4-5-12) ────────────
// Tüm mesajlar tek `oda.oyun.chat` dizisinde tutulur, her birine `kanal` alanı düşer.
// Kanal değerleri:
//   'koy'     → köy meydanı, gündüz/savunma/oylama dahil herkes okur (ayrılanlar da)
//   'fobik'   → sadece Kaan + Necmi + Azra (gece kanalı)
//   'ayrilan' → sadece köyden ayrılanlar + Transseksüel rolü

function mesajiGorebilirMi(oda, oyuncuId, mesaj) {
  if (!mesaj?.kanal) return true;
  const oyuncu = oyuncuyuBul(oda, oyuncuId);
  if (!oyuncu) return false;
  if (mesaj.kanal === 'koy') return true; // köy mesajları herkese açık (ayrılanlar dahil)
  if (mesaj.kanal === 'fobik') return fobikMisin(oda, oyuncuId);
  if (mesaj.kanal === 'ayrilan') {
    if (oyuncu.koydeMi === false) return true; // ayrılan
    const rol = oda.oyun.roller?.get(oyuncuId);
    return rol?.id === 'transseksuel'; // veya Trans
  }
  return false;
}

function chatGecmisi(oda, oyuncuId) {
  if (!oda.oyun?.chat) return [];
  return oda.oyun.chat.filter(m => mesajiGorebilirMi(oda, oyuncuId, m));
}

function mesajiHedefle(oda, mesaj) {
  // Mesajı kanal'a göre uygun soketlere ulaştır
  if (mesaj.kanal === 'koy') {
    // Tüm odada olanlar (ayrılanlar dahil — onlar zaten oda.kod soket odasında)
    io.to(oda.kod).emit('chat:mesaj', mesaj);
    return;
  }
  if (mesaj.kanal === 'fobik') {
    oda.players.forEach(p => {
      if (fobikMisin(oda, p.id)) io.to(p.id).emit('chat:mesaj', mesaj);
    });
    return;
  }
  if (mesaj.kanal === 'ayrilan') {
    // Ayrılanlar socket odasındakiler + Trans (onu da odaya ekliyoruz)
    io.to(oda.kod + ':ayrilan').emit('chat:mesaj', mesaj);
    return;
  }
}

function sistemMesaji(oda, metin, kanal = 'koy') {
  const mesaj = {
    id: 'sys-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    tip: 'sistem',
    metin,
    zaman: Date.now(),
    kanal
  };
  oda.oyun.chat.push(mesaj);
  mesajiHedefle(oda, mesaj);
}

function oyuncuMesaji(oda, oyuncu, metin, kanal = 'koy') {
  const mesaj = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
    tip: 'oyuncu',
    oyuncuId: oyuncu.id,
    isim: oyuncu.isim,
    metin,
    zaman: Date.now(),
    kanal
  };
  oda.oyun.chat.push(mesaj);
  mesajiHedefle(oda, mesaj);
  // Madde 13: gerçek oyuncu mesajına bot cevap verebilir
  if (!oyuncu.bot) {
    try { botCevapVer(oda, mesaj); } catch (e) { console.warn('[bot cevap]', e?.message); }
  }
}

// ─── Bot Sistemi ─────────────────────────────────────────────
// Botların isimleri normal isimlerle aynı görünür (Madde 15: prefix yok)
const BOT_ISIMLERI = [
  'Aslı', 'Burak', 'Cemre', 'Doruk', 'Ela',
  'Furkan', 'Gizem', 'Hakan', 'İnci', 'Jale',
  'Kerem'
];

// v1.6 — Madde 3: Türkçe-aware lowercase. JS varsayılan toLowerCase() Unicode'a göre
// `İ`'yi `i̇` (i + combining dot above) yapar; bu yüzden `İnci` bot ismi `inci` yazımıyla
// eşleşmezdi. `toLocaleLowerCase('tr-TR')` doğru sonucu verir: `İ→i`, `I→ı`.
function trKucult(s) {
  try { return String(s || '').toLocaleLowerCase('tr-TR'); }
  catch { return String(s || '').toLowerCase(); }
}

// ─── Bot Konuşma Havuzları (v1.6 — Madde 2: faz-bazlı genişletme) ────────────
// Genel havuz — herhangi bir fazda fallback olarak kullanılır
const BOT_KONUSMA = [
  'Burası gerçekten dinlendirici.',
  'Çay içecek sakin bir yer arıyordum.',
  'Köye yeni alıştım, etrafa bakınıyorum.',
  'Aramızda sessiz biri var, dikkatimi çekiyor.',
  'Bence acele etmeyelim, gözlemleyelim.',
  'İçimden bir his var ama henüz emin değilim.',
  'Burada birinin bir şeyler sakladığını düşünüyorum.',
  'Hadi konuşalım, susmak çözüm değil.',
  'Bu iş bana garip geliyor.',
  'Emin değilim, daha çok bilgi gerekli.',
  'Birini suçlamak istemem ama tedirginim.',
  'Geceyi sessiz geçirenler dikkat çekiyor.',
  'Ne yapacağımı bilmiyorum açıkçası.',
  'Şu an her şey karışık.'
];

// Faz-bazlı havuzlar — botMesajGonder önce burayı kontrol eder, boşsa BOT_KONUSMA'ya düşer
const BOT_KONUSMA_FAZ = {
  tanisma: [
    'Selam, ben de yeni geldim köye.',
    'Tanıştığıma memnun oldum.',
    'Merhaba arkadaşlar, ne hoş bir yer.',
    'Şehirden geldim, biraz nefes alacağım sandım.',
    'Hep böyle sessiz mi köy?',
    'İlk gece olduğu için biraz tedirginim.',
    'Birbirimizi yeni tanıyoruz, sabır.',
    'Tanışmak güzel, umarım iyi geçer.',
    'Kim olduğunu söylemek isteyen var mı?',
    'İlk izlenimlerim karışık ama umutluyum.',
    'Burada herkesin bir hikayesi var sanırım.',
    'Köye geldim ama henüz yerleşemedim.',
    'Birbirimize alışmamız zaman alacak.',
    'Çay içip biraz tanışsak iyi olur.',
    'Hayırlı olsun yeni başlangıçlar.'
  ],
  sabah: [
    'Bu gece uyuyamadım açıkçası.',
    'Sabah olduğuna sevindim.',
    'Garip rüyalar gördüm gece.',
    'Köyden biri eksildi, içim daraldı.',
    'Geceden bu yana her şey değişti gibi.',
    'Sabah olunca daha net düşünüyorum.',
    'Günaydın — uzun bir gece geçti.',
    'Olanları sindiremedim hâlâ.',
    'Yarın daha dikkatli olmalıyız.',
    'Birinin kaybı ağır geliyor.',
    'Köy uyandı ama herkes değil.',
    'Bu sabah herkes biraz daha şüpheli.'
  ],
  tartisma: [
    'Konuşmamız lazım, zaman daralıyor.',
    'Birisini öne sürmek zorundayız.',
    'Bence en şüpheli olanı seçelim.',
    'Kim ne diyor, dinleyelim önce.',
    'Bana göre fazla sessiz olanlar şüpheli.',
    'Fazla aktif olanlar da dikkatimi çekiyor.',
    'Delil yok ama sezgilerim var.',
    'Karar vermeden iyice tartışmalıyız.',
    'Birinin kaybı ağırına gidiyor olmalı, konuşsun.',
    'Bence bu işin altından çıkacağız.',
    'Acele kararlar pahalıya patlar.',
    'Suçlamak kolay, kanıtlamak zor.',
    'Sessiz duranlar bence bir şey biliyor.',
    'Geceyi anlatmayanlar var aramızda.',
    'Oyumu vermeden bir kez daha düşüneceğim.',
    'Köy kaybetmeden bir şey yapmalıyız.',
    'Birbirimize güvenmemiz lazım.',
    'Yanlış oy hepimize zarar verir.'
  ],
  oylama_tartisma: [
    'Tekrar konuşmamız çok şey değiştirmez sanırım.',
    'Aynı kişiyi seçersek yine sonuç çıkmaz.',
    'Belki bu sefer farklı düşünmeliyiz.',
    'Yine de bir karar lazım, geceyi bekleyemeyiz.',
    'Son söz olarak hâlâ aynı kişiden şüpheleniyorum.',
    'Belki yanılıyoruz, başka bir isim düşünelim.',
    'Bu tartışma bizi bir yere götürmüyor.',
    'Kim olursa olsun, karar verelim artık.',
    'Sabırlı olmalıyız, hata yapmayalım.',
    'Son şansımız, dikkatli kullanalım.'
  ],
  oylama_sonuc: [
    'Bu kararla yaşamak zor olacak.',
    'Umarım doğru kişiyi seçtik.',
    'Köy bir kişi daha eksildi.',
    'Geceyi nasıl geçireceğiz acaba?',
    'Şimdi her şey daha da gergin.',
    'Gece gelmeden toparlanalım.'
  ]
};

const BOT_SUPHE = [
  '{X} bana garip geliyor.',
  '{X} biraz fazla sessiz, ne diyorsunuz?',
  '{X} çok aktif, dikkatimi çekiyor.',
  '{X} dürüst görünüyor ama emin olamıyorum.',
  '{X}\'i izliyorum, garip bir şey yok.',
  '{X} hakkında bir fikrim yok henüz.',
  '{X} ile ilgili tedirginim.',
  '{X}\'in söylediklerine güvenebilir miyiz?',
  '{X} dün gece tuhaftı, fark eden oldu mu?',
  '{X} çok hızlı suçluyor başkalarını.',
  '{X} kendini gereğinden fazla savunuyor.',
  '{X} hiç oy kullanmıyor gibi, neden?',
  '{X} sürekli konuyu değiştiriyor.',
  '{X} bana yalan söylüyor olabilir.',
  '{X} fazla tarafsız davranıyor.',
  '{X} ile göz göze gelemiyorum.',
  '{X}\'in hikayesinde bir tutarsızlık var.',
  '{X} aslında düşündüğümüzden tehlikeli olabilir.',
  '{X}\'i bu turda dışlamayı düşünüyorum.',
  '{X} bir grupla birlikte oynuyor sanki.'
];

const BOT_CEVAP = [
  'İyi soru, düşünmem lazım.',
  'Bilmiyorum açıkçası.',
  'Sen ne düşünüyorsun?',
  'Bence öyle olabilir.',
  'Belki, belki değil.',
  'Şüphelerim var ama söylemem.',
  'Tahmin etmek zor.',
  'Henüz kararsızım.',
  'Hmm, ilginç bir nokta.',
  'Daha sonra konuşalım.',
  'Bana sorma, ben de yeniyim burada.',
  'Eminim sen daha iyi biliyorsun.',
  'Belki haklısın.',
  'Bana mantıklı geldi.',
  'Hiçbir fikrim yok.',
  'Açıkçası bana da garip geldi.',
  'Yorum yapmak için erken.',
  'Düşüneceğim, geri dönerim.',
  'Sen söylersen ben de katılırım.',
  'Şu an kafam karışık.',
  'Senin gibi düşünmüyorum sanırım.',
  'Tam tersi düşünebilir miyiz?',
  'Bu konuda emin değilim hiç.',
  'Söylediklerin mantıklı ama yine de…',
  'Bir kez daha düşünmen iyi olur.',
  'Belki başka biri yardımcı olur.',
  'Hadi konuyu değiştirelim biraz.',
  'Şu an cevap vermek istemiyorum.',
  'Bana göre değil bu iş.',
  'Doğru olabilir ama kanıt yok.'
];

const BOT_GECE_NOT = [
  'Sessiz bir gece geçirdim.',
  'Şüpheli kişiler var ama emin değilim.',
  'Etrafımda gariplik vardı.',
  'Bekliyorum, sabredeyim.',
  'Hiçbir şey görmedim.',
  'Bu gece dikkatli olmalıyım.',
  'Yarın daha çok konuşmalıyım.',
  'Bir şeyler değişiyor gibi.',
  'Dışarıda ayak sesi duydum.',
  'Pencereden birini görür gibi oldum.',
  'Komşum geç saate kadar uyumadı sanırım.',
  'İçim rahat değil bu gece.',
  'Sabah olunca daha net konuşacağım.',
  'Kafamda bir liste oluşmaya başladı.',
  'Birinin yalan söylediğinden eminim artık.',
  'Yarın hata yapma lüksüm yok.'
];

// İzinli (botların yazabileceği) gündüz fazları
const BOT_KONUSMA_FAZLARI = ['tanisma', 'sabah', 'tartisma', 'oylama_tartisma', 'oylama_sonuc'];

// v1.6 — Madde 2: Faz-bazlı havuz seçici. Önce faz havuzundan dene, yoksa genel havuza düş.
function fazHavuzuSec(oda) {
  const fazHavuzu = BOT_KONUSMA_FAZ[oda.faz];
  // Faz havuzu + genel havuz birleşik — faz havuzu varsa daha sık seçilir
  if (fazHavuzu && fazHavuzu.length > 0) {
    // %70 faz havuzu, %30 genel havuz (çeşitlilik için)
    return Math.random() < 0.7 ? fazHavuzu : BOT_KONUSMA;
  }
  return BOT_KONUSMA;
}

// Bir bot için rastgele mesaj üret ve gönder
function botMesajGonder(oda, bot) {
  if (!BOT_KONUSMA_FAZLARI.includes(oda.faz)) return;
  if (bot.koydeMi === false) return;

  let metin;
  // %35 ihtimalle bir oyuncuyu hedef alan şüphe mesajı
  if (Math.random() < 0.35) {
    const baskalari = oda.players.filter(p => p.id !== bot.id && p.koydeMi !== false);
    if (baskalari.length > 0) {
      const hedef = baskalari[Math.floor(Math.random() * baskalari.length)];
      metin = BOT_SUPHE[Math.floor(Math.random() * BOT_SUPHE.length)].replace('{X}', hedef.isim);
    } else {
      const havuz = fazHavuzuSec(oda);
      metin = havuz[Math.floor(Math.random() * havuz.length)];
    }
  } else {
    const havuz = fazHavuzuSec(oda);
    metin = havuz[Math.floor(Math.random() * havuz.length)];
  }
  oyuncuMesaji(oda, bot, metin, 'koy');
}

// Faz başında botların 1-3 rastgele aralıkta mesaj atması
function botSohbetBaslat(oda) {
  oda.players.filter(p => p.bot && p.koydeMi !== false).forEach(bot => {
    const adet = 1 + Math.floor(Math.random() * 3); // 1-3 mesaj
    for (let i = 0; i < adet; i++) {
      const gecikme = 4000 + (i * 18000) + Math.random() * 12000; // sıralı
      setTimeout(() => botMesajGonder(oda, bot), gecikme);
    }
  });
}

// Gerçek oyuncu mesajı geldiğinde bot cevabı (Madde 13: %100 cevap, soru veya bot ismi geçerse)
function botCevapVer(oda, gelenMesaj) {
  const gonderen = oyuncuyuBul(oda, gelenMesaj.oyuncuId);
  if (!gonderen || gonderen.bot) return; // bot mesajına cevap verme
  if (!BOT_KONUSMA_FAZLARI.includes(oda.faz)) return;
  if (gelenMesaj.kanal !== 'koy') return; // sadece köy kanalı

  const metin = trKucult(gelenMesaj.metin);
  const soruVar = metin.includes('?');

  // Bot ismi geçiyor mu? (Türkçe-aware — Madde 3)
  const aktifBotlar = oda.players.filter(p => p.bot && p.koydeMi !== false);
  if (aktifBotlar.length === 0) return;

  let hedefBot = aktifBotlar.find(b => metin.includes(trKucult(b.isim)));

  // Tetikleyici yok ise dur
  if (!hedefBot && !soruVar) return;

  // Hedef yoksa rastgele bir bot
  if (!hedefBot) {
    hedefBot = aktifBotlar[Math.floor(Math.random() * aktifBotlar.length)];
  }

  // 3-9 saniye gecikme
  setTimeout(() => {
    if (!BOT_KONUSMA_FAZLARI.includes(oda.faz)) return;
    if (hedefBot.koydeMi === false) return;
    const cevap = BOT_CEVAP[Math.floor(Math.random() * BOT_CEVAP.length)];
    oyuncuMesaji(oda, hedefBot, cevap, 'koy');
  }, 3000 + Math.random() * 6000);
}

// Gece başlangıcında her bot için kısa not yazımı (Madde 13)
function botGeceNotuYaz(oda) {
  if (!oda.oyun.geceNotlari) oda.oyun.geceNotlari = new Map();
  oda.players.filter(p => p.bot && p.koydeMi !== false).forEach(bot => {
    const eski = oda.oyun.geceNotlari.get(bot.id) || '';
    const yeni = BOT_GECE_NOT[Math.floor(Math.random() * BOT_GECE_NOT.length)];
    const tam = eski + (eski ? '\n' : '') + `Gece ${oda.oyun.geceTuru}: ${yeni}`;
    oda.oyun.geceNotlari.set(bot.id, tam);
  });
}

let botIdSayaci = 0;

function botEkle(oda) {
  if (oda.faz !== 'lobi') return { ok: false, hata: 'Sadece lobide bot eklenebilir' };
  if (oda.players.length >= 12) return { ok: false, hata: 'Oda dolu' };

  // Kullanılmamış bir bot ismi bul
  const kullanilanIsimler = new Set(oda.players.map(p => trKucult(p.isim)));
  const uygunIsim = BOT_ISIMLERI.find(n => !kullanilanIsimler.has(trKucult(n)));
  if (!uygunIsim) return { ok: false, hata: 'Daha fazla bot ismi yok' };

  const botId = 'bot-' + (++botIdSayaci) + '-' + Math.random().toString(36).slice(2, 6);
  oda.players.push({
    id: botId,
    isim: uygunIsim,
    hostMu: false,
    baglantiVar: true,
    bot: true
  });

  // Madde 4: Oyuncu sayısı değişti — host'un özel dağılımı geçersiz olabilir, sıfırla
  // (kimlikAciklamaAdedi korunur)
  ozelDagilimiSifirla(oda);
  console.log(`[bot] ${uygunIsim} eklendi → ${oda.kod} (${oda.players.length}/12)`);
  return { ok: true, botId };
}

function botSil(oda, botId) {
  const oyuncu = oyuncuyuBul(oda, botId);
  if (!oyuncu?.bot) return { ok: false, hata: 'Bot bulunamadı' };
  oda.players = oda.players.filter(p => p.id !== botId);
  // Madde 4: Oyuncu sayısı değişti — host'un özel dağılımı geçersiz olabilir, sıfırla
  ozelDagilimiSifirla(oda);
  console.log(`[bot] ${oyuncu.isim} silindi`);
  return { ok: true };
}

// Bot davranışları — her faz değişiminde uygun aksiyonu al
function botlarRolleriOnayla(oda) {
  oda.players.filter(p => p.bot).forEach(bot => {
    setTimeout(() => {
      if (oda.faz === 'rol_dagitimi') {
        oda.oyun.rolOnaylari.add(bot.id);
        rolOnayKontrol(oda);
      }
    }, 800 + Math.random() * 1500); // 0.8-2.3 sn arası rastgele
  });
}

function botlarBasvurabilir(oda) {
  // %30 ihtimalle başvur
  oda.players.filter(p => p.bot).forEach(bot => {
    if (Math.random() < 0.3) {
      setTimeout(() => {
        if (oda.faz === 'tanisma' && oda.altFaz === 'basvuru') {
          oda.oyun.basvuranlar.add(bot.id);
          io.to(oda.kod).emit('tanisma:basvuruDurumu', { sayi: oda.oyun.basvuranlar.size });
          sistemMesaji(oda, `${oda.oyun.basvuranlar.size} kişi kimliğini açmak için başvurdu.`);
        }
      }, 1500 + Math.random() * 4000);
    }
  });
}

function botlarHazirOlur(oda) {
  oda.players.filter(p => p.bot).forEach(bot => {
    setTimeout(() => {
      if (oda.faz === 'tanisma' && oda.altFaz === 'serbest') {
        oda.oyun.hazirOlanlar.add(bot.id);
        hazirKontrol(oda);
      }
    }, 3000 + Math.random() * 8000);
  });
}

// Bug #7: Bir gerçek oyuncu "Hazır" basınca,
// tüm gerçek (bot olmayan, köyde, bağlı) oyuncular hazırsa
// kalan botları anında "Hazır" olarak işaretle.
//
// "Gerçek oyuncu" filtresi:
//   - bot değil
//   - köyde (koydeMi !== false)
//   - bağlı (baglantiVar !== false)
//
// Faz bazında değişen şey sadece "köyde + bağlı" şartı:
//   - tanisma: tüm gerçek oyuncuları say (rol henüz dağıtılmış, kimse köyden ayrılmamış)
//   - tartisma / oylama_tartisma / oylama_sonuc: aktif (köyde + bağlı) gerçek oyuncular
function tumGercekOyuncularHazirMi(oda, faz) {
  if (!oda.oyun) return false;
  let gercekler;
  if (faz === 'tanisma') {
    gercekler = oda.players.filter(p => !p.bot);
  } else {
    gercekler = oda.players.filter(p =>
      !p.bot && p.koydeMi !== false && p.baglantiVar !== false
    );
  }
  if (gercekler.length === 0) return false; // hepsi botsa bekleme mantığını bozma
  return gercekler.every(p => oda.oyun.hazirOlanlar.has(p.id));
}

// Kalan tüm botları hazırOlanlar'a anında ekle (faza özel filtreyle).
function kalanBotlariHazirYap(oda, faz) {
  if (!oda.oyun) return;
  const botFiltre = (b) => {
    if (!b.bot) return false;
    if (faz === 'tanisma') return true;
    return b.koydeMi !== false && b.baglantiVar !== false;
  };
  oda.players.filter(botFiltre).forEach(bot => {
    oda.oyun.hazirOlanlar.add(bot.id);
  });
}

// Bir gerçek oyuncu "Hazır" bastıktan sonra çağrılır.
// Tüm gerçekler hazırsa botları doldurur ve mevcut faz kontrolünü tetikler.
function gercekHazirsaBotlariDoldur(oda, faz, kontrolFn) {
  if (!tumGercekOyuncularHazirMi(oda, faz)) return;
  kalanBotlariHazirYap(oda, faz);
  if (typeof kontrolFn === 'function') kontrolFn();
}

// ─── Oyun Başlatma ───────────────────────────────────────────
function oyunuBaslat(oda) {
  // Madde 4 (A) — host özel dağılım belirlediyse onu kullan, yoksa varsayılan denge
  const ozelDenge = oda.ayarlar?.dagilim || null;
  const { dagilim, sahteRoller } = rolleriDagit(oda.players, ozelDenge);

  oda.faz = 'rol_dagitimi';
  oda.oyun = {
    roller: dagilim,
    // Outsider (Bastırmış / Murat) sahte rolleri — sadece client'a gösterim için
    // GERÇEK rol oda.oyun.roller'da kalır; bu Map sadece "Murat ne sanıyor + dış
    // dünya Murat'ı nasıl görüyor" için kullanılır.
    sahteRoller: sahteRoller,
    rolOnaylari: new Set(),
    aciklanmislar: new Set(),
    basvuranlar: new Set(),
    hazirOlanlar: new Set(),
    chat: [],
    fazTimerleri: [],
    baslangicZamani: Date.now(),
    // Cinsiyet haritası (Azra için): rol id → cinsiyet
    karakterCinsiyetleri: new Map(Object.entries(KARAKTER_CINSIYET)),
    // v1.3 — Master §10: Not defteri her fazdan yazılabilir.
    // Map oyun başlangıcında oluşturuluyor ki tanışma/sabah'tan da yazılabilsin.
    geceNotlari: new Map(),
    // ─── V1 yeni Tarafsız roller için kümülatif state Map'leri ─
    aksiyonGecmisi: new Map(),       // oyuncuId → [{gun, tip}]  (Aseksüel)
    oylamaGecmisi: [],               // [{gun, oylar:Map}]       (Mazoşist, Fuckbuddy)
    fetisistEtiketi: new Map(),      // fetisistId → etiket      (Fetişist)
    coplatanEslesmeleri: new Map(),  // copcatanId → [{a,b,gun}] (Çöpçatan kazanma)
    sbHediyeAlinanlar: new Map(),    // sbId → Set(hedefId)      (Sugar Baby tekrar yasak)
    sdOySonuc: new Map(),            // hedefId → katsayi        (Sugar Daddy oy katı)
    sdSonHedef: new Map(),           // sdId → hedefId           (SD üst üste yasak)
    capkinTavlananlar: new Map(),    // capkinId → Set(hedefId)  (Çapkın tekrar yasak)
    lbBagSayaci: new Map(),          // lbId → Map(hedefId→sayi) (Lovebuddy ardışık)
    lbBagliCiftler: new Set(),       // "lbId:hedefId"           (Lovebuddy kazanma)
    // ─── V1 yeni Gelenekçi roller için "ertesi gün" geçici state'leri ─
    // Bu Set'ler tek gece-gündüz döngüsü kadar yaşar; geceyeBasla() temizler.
    sinanSavunmaKapali: new Set(),   // hedefId set     (Transfobik: savunmaya çıkamaz)
    yaseminKendineOy: new Set(),     // hedefId set     (Bifobik: oy kendine geri döner)
    huseyinPasYapilanlar: new Set(), // hedefId set     (Dinci: ertesi gece aksiyon yok)
    oguzKadinHedefleri: new Set(),   // hedefId set     (Cinsiyetçi: Gel adayına oy 0)

    // ─── V1 Kaosçu rolleri için state Map'leri ────────────────
    // Geçici (her gece-gündüz döngüsünde sıfırlanır — geceyeBasla'da):
    okanSpotlightHedef: new Set(),       // hedefId set (Okan: yarın kimlik açıklayamaz)
    okanBuTurHedefleri: new Map(),       // okanId → Set(hedefId) (1. oylama sonu raporu için)
    boraGecikme: new Set(),              // hedefId set (Bora: yarın ilk mesaj 30sn gecik)
    boraGecikmeIlkMesaj: new Set(),      // hedefId set (Bora: gün içinde ilk mesaj bekliyor)
    hakanYasakliOy: new Map(),           // baskilananId → yasakliId (1. oylama yasağı)
    // Kümülatif (oyun boyu — kazanma izleme):
    okanSpotlightSayaci: new Map(),      // okanId → Set(hedefId)
    okanGoruldugKimlikler: new Set(),    // hedefId set (kimlik açıklayan her oyuncu)
    boraHedefSayaci: new Map(),          // boraId → Set(hedefId)
    boraGunSayaci: new Map(),            // gun → Set(boraHedefId)  (oylama sonucu eşleştirme)
    boraGunOyAlan: new Map(),            // gun → Set(boraHedefId)  (o gün ham oy alan Bora hedefleri)
    erdemOgrenilenHedefler: new Map(),   // erdemId → Set(hedefId)
    hakanYasakliTarihce: new Map()       // hakanId → [{gun, baskilananId, yasakliId, sonucCokOyMu}]
  };

  // Fetişist etiketi: oyunda Fetişist varsa rastgele bir meslek grubu etiketi ata.
  // Etiketler: yaratıcı / akademik / fiziksel (görev kararı).
  // geceMotoru lazy-init de yapıyor; bu blok her şartta etiket hazır olsun diye.
  const ETIKETLER = ['yaratıcı', 'akademik', 'fiziksel'];
  for (const [pid, rol] of dagilim.entries()) {
    if (rol.id === 'fetisist') {
      const rastgele = ETIKETLER[Math.floor(Math.random() * ETIKETLER.length)];
      oda.oyun.fetisistEtiketi.set(pid, rastgele);
      console.log(`[oyun] ${oda.kod} — Fetişist (${pid}) etiketi: ${rastgele}`);
    }
  }

  oda.players.forEach(p => {
    const gercekRol = dagilim.get(p.id);
    // Murat C: client'a SAHTE rol gönderilir (varsa). Gerçek rolü Murat asla
    // öğrenmemeli. sahteRoller boşsa (kenar durum: Özgürlükçü yok) gerçek rol
    // gönderilir; bu durumda host kontrolü sayesinde pratikte yaşanmaz.
    const gosterilen = sahteRoller.get(p.id) || gercekRol;
    // Botlara rol kartı göndermeye gerek yok ama göndersek de zarar vermez
    if (!p.bot) {
      io.to(p.id).emit('rol:kart', {
        rol: {
          id: gosterilen.id, ad: gosterilen.ad, grup: gosterilen.grup,
          karakter: gosterilen.karakter, yas: gosterilen.yas, meslek: gosterilen.meslek,
          motivasyon: gosterilen.motivasyon, geceAksiyonu: gosterilen.geceAksiyonu,
          kazanmaKosulu: gosterilen.kazanmaKosulu,
          gorsel: gosterilen.gorsel  // v1.6 — Madde 5: karakter portresi yolu
        }
      });
    }
  });

  // v1.5 — Madde 1: Rol kartı için 30 sn max süre + sayaç
  const sonZaman = Date.now() + SURE_ROL;
  oda.fazSonZaman = sonZaman;

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'rol_dagitimi',
    oyuncuSayisi: oda.players.length,
    sure: SURE_ROL,
    sonZaman
  });

  // Oyuncu listesini ilk kez yayınla (rol dağıtımından sonra)
  oyuncuListesiYayinla(oda);

  // Trans rolünü 'ayrilan' socket odasına ekle (ayrılanların mesajlarını alabilsin)
  const trans = transseksuelBul(oda);
  if (trans) {
    const transSocket = io.sockets.sockets.get(trans.id);
    if (transSocket) transSocket.join(oda.kod + ':ayrilan');
  }

  console.log(`[oyun] ${oda.kod} — Roller dağıtıldı (${oda.players.length} oyuncu)`);

  // v1.5 — Madde 1: 30 sn sonra hâlâ rol_dagitimi fazındaysak tanışmaya zorla geç
  const tRol = setTimeout(() => {
    if (oda.faz === 'rol_dagitimi') {
      console.log(`[oyun] ${oda.kod} — Rol kartı süresi doldu, tanışmaya geçiliyor`);
      tanismaBasla(oda);
    }
  }, SURE_ROL);
  oda.oyun.fazTimerleri.push(tRol);

  // Botlar otomatik onaylasın
  botlarRolleriOnayla(oda);
}

function rolOnayKontrol(oda) {
  if (!oda.oyun) return;
  const onayli = oda.oyun.rolOnaylari.size;
  const toplam = oda.players.length;

  io.to(oda.kod).emit('rol:onayDurumu', { onayli, toplam });

  if (onayli >= toplam && oda.faz === 'rol_dagitimi') {
    tanismaBasla(oda);
  }
}

// ─── Faz 4 — Tanışma ─────────────────────────────────────────
function tanismaBasla(oda) {
  oda.faz = 'tanisma';
  oda.altFaz = 'basvuru';
  oda.fazBaslangic = Date.now();

  const sonZaman = Date.now() + SURE_BASVURU;
  oda.fazSonZaman = sonZaman;

  const ayarlarBilgi = ayarlariNormalize(oda);
  io.to(oda.kod).emit('faz:degisti', {
    faz: 'tanisma',
    altFaz: 'basvuru',
    sure: SURE_BASVURU,
    sonZaman,
    aciklanmislar: aciklananKimlikler(oda),
    chat: oda.oyun.chat,
    kimlikAciklamaAdedi: ayarlarBilgi.kimlikAciklamaAdedi
  });

  sistemMesaji(oda, 'Köyde sabah oldu. Tanışma vakti — kimliğini açıklamak isteyen başvurabilir.');
  console.log(`[oyun] ${oda.kod} — Faz 4 başladı (başvuru penceresi)`);

  // V1 Kaosçu — Okan "Spotlight": bu turda spotlight'a alınmış oyunculara
  // kişisel bildirim gönder (UI başvuru butonunu disable etmek için).
  if (oda.oyun.okanSpotlightHedef && oda.oyun.okanSpotlightHedef.size > 0) {
    for (const hedefId of oda.oyun.okanSpotlightHedef) {
      io.to(hedefId).emit('tanisma:spotlightKapali', {
        mesaj: 'Bu turda kimlik açıklama yapamazsın (Spotlight etkisi).'
      });
    }
  }

  const t1 = setTimeout(() => basvuruKapat(oda), SURE_BASVURU);
  oda.oyun.fazTimerleri.push(t1);

  // Botlar belki başvurur
  botlarBasvurabilir(oda);
}

function basvuruKapat(oda) {
  if (oda.faz !== 'tanisma' || oda.altFaz !== 'basvuru') return;

  const basvuranIdleri = [...oda.oyun.basvuranlar];
  const basvuranIsimleri = basvuranIdleri.map(id => oyuncuyuBul(oda, id)?.isim).filter(Boolean);

  // v1.7 — Host lobide kaç kişinin açıklanacağını seçer (0-3, default 1)
  const ayarlar = ayarlariNormalize(oda);
  const maxAcikla = Math.max(0, Math.min(3, ayarlar.kimlikAciklamaAdedi ?? KIMLIK_ACIKLAMA_DEFAULT));
  const acilacakSayi = Math.min(maxAcikla, basvuranIdleri.length);

  if (acilacakSayi === 0) {
    if (basvuranIdleri.length > 0 && maxAcikla === 0) {
      sistemMesaji(oda, 'Bu turda kimlik açıklanmıyor. Köy sessizce kahvaltıya oturdu.');
    } else {
      sistemMesaji(oda, 'Kimse kimliğini açmadı. Köy sessizce kahvaltıya oturdu.');
    }
    setTimeout(() => serbesteSec(oda), 800);
    return;
  }

  sistemMesaji(oda, `Başvuranlar: ${basvuranIsimleri.join(', ')}`);

  // Rastgele N kişi seç (Fisher-Yates karıştırma → ilk N)
  const havuz = [...basvuranIdleri];
  for (let i = havuz.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [havuz[i], havuz[j]] = [havuz[j], havuz[i]];
  }
  const secilenler = havuz.slice(0, acilacakSayi);

  secilenler.forEach((secilenId, idx) => {
    const secilen = oyuncuyuBul(oda, secilenId);
    // Murat C: kimlik açıklaması sahte rol üzerinden yapılır — Murat kendisini
    // sahte rol sanıyor, herkes de onu sahte rolüyle görsün.
    const rol = gorunenRol(oda, secilenId);
    if (!secilen || !rol) return;

    oda.oyun.aciklanmislar.add(secilenId);
    // V1 Kaosçu — Okan kazanma izleme: kimlik açıklayan her oyuncu kümülatif
    // set'e eklenir (oyun boyu). Okan'ın spotlight'a aldığı oyuncu zaten basvur
    // handler'ında reddedilmiştir, bu set sadece "açıklayanların oranını" tutar.
    if (!oda.oyun.okanGoruldugKimlikler) oda.oyun.okanGoruldugKimlikler = new Set();
    oda.oyun.okanGoruldugKimlikler.add(secilenId);

    // Her açıklamayı sırayla geciktirerek sahnele
    const t1 = 600 + idx * 1800;
    const t2 = 1600 + idx * 1800;

    setTimeout(() => sistemMesaji(oda, `Köy meydanına çıkıyor: ${secilen.isim}`), t1);
    setTimeout(() => {
      sistemMesaji(oda, `${secilen.isim}: "${rol.ad}'im."`);
      io.to(oda.kod).emit('kimlik:aciklandi', {
        oyuncuId: secilenId,
        isim: secilen.isim,
        rol: { ad: rol.ad, grup: rol.grup }
      });
      // Liste güncellensin (kimlik ifşa olduğu için rol artık herkes için görünür)
      oyuncuListesiYayinla(oda);
    }, t2);
  });

  const toplamGecikme = 1600 + (secilenler.length - 1) * 1800 + 800;
  setTimeout(() => serbesteSec(oda), toplamGecikme);
}

function serbesteSec(oda) {
  if (oda.faz !== 'tanisma') return;
  oda.altFaz = 'serbest';
  oda.fazBaslangic = Date.now();
  const sonZaman = Date.now() + SURE_TANISMA;
  oda.fazSonZaman = sonZaman;

  io.to(oda.kod).emit('tanisma:altFaz', {
    altFaz: 'serbest',
    sure: SURE_TANISMA,
    sonZaman
  });

  sistemMesaji(oda, 'Tanışma başladı — 30 saniye serbest sohbet. Herkes "Hazır" derse erken geceye geçilir.');
  console.log(`[oyun] ${oda.kod} — Serbest tanışma başladı`);

  const t = setTimeout(() => geceyeBasla(oda), SURE_TANISMA);
  oda.oyun.fazTimerleri.push(t);

  // Botlar bir süre sonra hazır olur + sohbet başlat
  botlarHazirOlur(oda);
  botSohbetBaslat(oda);
}

function hazirKontrol(oda) {
  if (oda.faz !== 'tanisma' || oda.altFaz !== 'serbest') return;
  const hazir = oda.oyun.hazirOlanlar.size;
  const toplam = oda.players.length;
  io.to(oda.kod).emit('tanisma:hazirDurumu', { hazir, toplam });
  if (hazir >= toplam) geceyeBasla(oda);
}

function geceyeBasla(oda) {
  // 'tanisma', 'sabah' veya 'oylama_2_bitis' (oylama sonrası geceye) gelebilir
  if (oda.faz !== 'tanisma' && oda.faz !== 'sabah') return;
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];

  oda.faz = 'gece';
  oda.altFaz = null;
  oda.oyun.hazirOlanlar.clear();
  oda.oyun.geceTuru = (oda.oyun.geceTuru || 0) + 1;

  // Yeni gece: önceki gecenin sabah verilerini temizle
  oda.oyun.sabahKisisel = new Map();
  oda.oyun.sabahHerkese = null;
  // Sugar Daddy oy katsayısı SADECE "ertesi gün" oylamasında geçerli.
  // O oylama bittikten sonra (yeni gece başlarken) sıfırlanır.
  // Yatırım yeni gece içinde tekrar yapılırsa Map yeniden doldurulur.
  if (!oda.oyun.sdOySonuc) oda.oyun.sdOySonuc = new Map();
  oda.oyun.sdOySonuc.clear();
  // Belge §11 (Bug #2 / kural A): Her gün için ek tartışma hakkı 1 ile sınırlı —
  // yeni gece başlarken sayacı sıfırla.
  oda.oyun.tekrarTartismaYapildi = false;

  // ─── V1 yeni Gelenekçi geçici state'leri ──────────────────
  // Sinan/Yasemin/Oğuz: hedeflenen oyuncuya GEÇEN gece kondu, ETKİSİ ertesi
  // gündür (bu fonksiyon "yeni gece" başında çalışıyor → o oyun günü kapandı,
  // efektler tüketildi; şimdi yeni döngü için Set'leri sıfırlıyoruz).
  // Hüseyin: hedef ETKİSİ "ertesi gece pas" → işte O gece şu an başlıyor.
  //   Önce huseyinPasYapilanlar'ı OKUYUP geceAksiyonlari'na "pas işaretli/kilitli"
  //   kayıt yerleştiriyoruz, SONRA Set'i sıfırlıyoruz.
  if (!oda.oyun.sinanSavunmaKapali)   oda.oyun.sinanSavunmaKapali = new Set();
  if (!oda.oyun.yaseminKendineOy)     oda.oyun.yaseminKendineOy = new Set();
  if (!oda.oyun.huseyinPasYapilanlar) oda.oyun.huseyinPasYapilanlar = new Set();
  if (!oda.oyun.oguzKadinHedefleri)   oda.oyun.oguzKadinHedefleri = new Set();
  oda.oyun.sinanSavunmaKapali.clear();
  oda.oyun.yaseminKendineOy.clear();
  oda.oyun.oguzKadinHedefleri.clear();
  // Hüseyin pas etkisi: bu gece tetiklenir, sonra temizle.
  const huseyinPasSnapshot = new Set(oda.oyun.huseyinPasYapilanlar);
  oda.oyun.huseyinPasYapilanlar.clear();

  // ─── V1 Kaosçu geçici state'leri ──────────────────────────
  // Yeni gece başlıyor: önceki gün'ün geçici efektleri tüketildi (kimlik
  // açıklama yapıldı / yapılamadı; ilk mesaj yazıldı; 1. oylama bitti).
  // Kümülatif Map'lere DOKUNMUYORUZ — kazanma izleme oyun boyu sürmeli.
  if (!oda.oyun.okanSpotlightHedef)   oda.oyun.okanSpotlightHedef = new Set();
  if (!oda.oyun.okanBuTurHedefleri)   oda.oyun.okanBuTurHedefleri = new Map();
  if (!oda.oyun.boraGecikme)          oda.oyun.boraGecikme = new Set();
  if (!oda.oyun.boraGecikmeIlkMesaj)  oda.oyun.boraGecikmeIlkMesaj = new Set();
  if (!oda.oyun.hakanYasakliOy)       oda.oyun.hakanYasakliOy = new Map();
  oda.oyun.okanSpotlightHedef.clear();
  oda.oyun.okanBuTurHedefleri.clear();
  oda.oyun.boraGecikme.clear();
  oda.oyun.boraGecikmeIlkMesaj.clear();
  oda.oyun.hakanYasakliOy.clear();

  // Gece aksiyonları: her aktif oyuncu için boş kayıt (sadece köyde olanlar)
  oda.oyun.geceAksiyonlari = new Map();
  oda.aktifOyuncular()
    .filter(p => p.koydeMi !== false)
    .forEach(p => {
      // Hüseyin "vicdan baskısı" — bu oyuncunun bu gece aksiyonu kilitli.
      // gonderildi=true + hedef1=null: motor onu "pas" olarak okur (aksiyonu(ctx,..)
      // null döner çünkü hedef yok). Ayrıca client'a kilitli olarak işaretlemek
      // gerekirse "huseyinPasli" bayrağı eklenebilir.
      const huseyinPasli = huseyinPasSnapshot.has(p.id);
      oda.oyun.geceAksiyonlari.set(p.id, {
        hedef1: null,
        hedef2: null,
        gonderildi: huseyinPasli,    // otomatik "pas" işaretli
        huseyinPasli                  // client'a bildirim için (UI'da kilitlenebilir)
      });
      if (huseyinPasli) {
        io.to(p.id).emit('gece:vicdanBaskisi', {
          mesaj: 'Bu gece vicdan baskısı altındasın. Aksiyon yapamazsın (Dinci\'nin "ahlaki vaazı" etkisi).'
        });
      }
    });

  // Not defterleri (zaten varsa koru, yoksa başlat)
  if (!oda.oyun.geceNotlari) oda.oyun.geceNotlari = new Map();

  // Hetero Erkek → Kaan görevi: önceki geceden kalan görevi bu geceye aktar
  // kaanGelecekGorevi geçen gece motor tarafından kaydedildi; şimdi aktif hale gelir
  if (oda.oyun.kaanGelecekGorevi) {
    oda.oyun.kaanGelecekGoreviAktif = oda.oyun.kaanGelecekGorevi;
    oda.oyun.kaanGelecekGorevi = null;
    // Hetero Erkek'e bildirim: bu gece Kaan'ın hedefini sen belirle
    const heId = oda.oyun.kaanGelecekGoreviAktif.sahip;
    const heOyuncu = oda.players.find(p => p.id === heId);
    if (heOyuncu && heOyuncu.koydeMi !== false) {
      io.to(heId).emit('gece:ozelGorev', {
        mesaj: "Bu gece Kaan\u2019ın hedefini sen belirleyeceksin. Gece aksiyonunda hedef seçmen yeterli."
      });
      console.log(`[oyun] ${oda.kod} — Hetero Erkek (${heOyuncu.isim}) bu gece Kaan'ın hedefini belirleyecek`);
    }
  } else {
    oda.oyun.kaanGelecekGoreviAktif = null;
  }

  // Fobik gece kanalı (Kaan + Necmi + Azra arası özel chat)
  if (!oda.oyun.fobikKanal) oda.oyun.fobikKanal = { mesajlar: [] };

  // Transseksüel ↔ ayrılanlar kanalı (Parça B'de dolu kullanılacak)
  if (!oda.oyun.ayrilanlarOdasi) oda.oyun.ayrilanlarOdasi = { mesajlar: [], uyeler: new Set() };

  // Gece süre timer
  const SURE_GECE = Number(process.env.Q_GECE_MS || 30_000);
  oda.geceSonZaman = Date.now() + SURE_GECE;

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'gece',
    geceTuru: oda.oyun.geceTuru,
    sure: SURE_GECE,
    sonZaman: oda.geceSonZaman
  });

  console.log(`[oyun] ${oda.kod} — Gece ${oda.oyun.geceTuru} başladı (${SURE_GECE / 1000}sn)`);

  const tGece = setTimeout(() => geceyiCoz(oda), SURE_GECE);
  oda.oyun.fazTimerleri.push(tGece);

  // Botlar aksiyonlarını otomatik göndersin + not defterine kısa not yazsın
  botlarGeceAksiyonYapsin(oda);
  botGeceNotuYaz(oda);
}

// ─── Gece Çözümleme ─────────────────────────────────────────
function geceyiCoz(oda) {
  if (oda.faz !== 'gece') return;
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];

  console.log(`[oyun] ${oda.kod} — Gece ${oda.oyun.geceTuru} çözümleniyor…`);

  // Motoru çalıştır
  const sonuc = geceyiCozumle(oda);

  // Etkileri oda state'ine kaydet (gelecek fazlarda — özellikle oylamada — kullanılır)
  if (!oda.oyun.oyEtkileri) oda.oyun.oyEtkileri = new Map();
  oda.oyun.oyEtkileri = sonuc.etkiler.oyEtkileri;
  oda.oyun.kaanGelecekGorevi = sonuc.etkiler.kaanGelecekGorevi;

  // Ayrılan oyuncuları işaretle
  for (const ayrilanId of sonuc.etkiler.ayrilanlar) {
    const oyuncu = oyuncuyuBul(oda, ayrilanId);
    if (oyuncu) {
      oyuncu.koydeMi = false;
      oyuncu.ayrildigGece = oda.oyun.geceTuru;
      // Ayrılan oyuncuyu socket odasına ekle (chat'in 'ayrilan' kanalı için)
      ayrilanlarOdasinaAl(oda, oyuncu);
    }
  }
  // Liste güncellensin: ayrılanların rolü ifşa olur, ayrılanlar kendi adlarına tüm rolleri görür
  if (sonuc.etkiler.ayrilanlar.size > 0) oyuncuListesiYayinla(oda);

  // Ayrılan açıklamaları (rol ifşası + not defteri)
  const ayrilanlar = ayrilanAciklamalari({ oda, oyun: oda.oyun, roller: oda.oyun.roller, ayrilanlar: sonuc.etkiler.ayrilanlar });

  // Her ayrılan oyuncuya kişisel bildirim → AyrilanEkrani'ya geçiş yapabilsin
  for (const ac of ayrilanlar) {
    io.to(ac.oyuncuId).emit('oyuncu:ayrildi', {
      oyuncuId: ac.oyuncuId,
      isim: ac.isim,
      rolAd: ac.rol?.ad || '?',
      grup: ac.rol?.grup || '?',
      notDefteri: ac.not,
      sebep: 'gece'
    });
  }

  // Faz değişimi
  oda.faz = 'sabah';
  oda.altFaz = null;

  // v1.5 — Madde 2: Sabah max 30 sn — host basmasa da otomatik devam
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];
  const sabahSonZaman = Date.now() + SURE_SABAH;
  oda.fazSonZaman = sabahSonZaman;

  // Kişisel sabah mesajları — her oyuncuya ayrı ayrı
  // Aynı zamanda state'e kaydet ki yenileme yapınca tekrar verebilelim
  if (!oda.oyun.sabahKisisel) oda.oyun.sabahKisisel = new Map();
  for (const [oyuncuId, kayit] of sonuc.kisiselSabah.entries()) {
    const benimRolum = oda.oyun.roller.get(oyuncuId);
    const paket = {
      geceTuru: oda.oyun.geceTuru,
      benimRolum: benimRolum ? { ad: benimRolum.ad, grup: benimRolum.grup } : null,
      satirlar: kayit.satirlar
    };
    oda.oyun.sabahKisisel.set(oyuncuId, paket);
    io.to(oyuncuId).emit('gece:sabahKisisel', paket);
  }

  // Herkese açık sabah bildirimi (genel olaylar + ayrılanlar) — state'e de kaydet
  oda.oyun.sabahHerkese = {
    geceTuru: oda.oyun.geceTuru,
    herkeseSabah: sonuc.herkeseSabah,
    ayrilanlar
  };

  // Herkese açık sabah bildirimi (genel olaylar + ayrılanlar)
  io.to(oda.kod).emit('faz:degisti', {
    faz: 'sabah',
    geceTuru: oda.oyun.geceTuru,
    herkeseSabah: sonuc.herkeseSabah,
    ayrilanlar,
    sure: SURE_SABAH,
    sonZaman: sabahSonZaman
  });

  // v1.5 — Madde 2: 30 sn sonra hâlâ sabah'taysak otomatik devam (host'u beklemeden)
  const tSabah = setTimeout(() => sabahOtomatikDevam(oda), SURE_SABAH);
  oda.oyun.fazTimerleri.push(tSabah);

  console.log(`[oyun] ${oda.kod} — Sabah ${oda.oyun.geceTuru}: ${sonuc.etkiler.ayrilanlar.size} ayrılan, ${sonuc.herkeseSabah.length} genel mesaj`);

  // Belge §15 — Ayrılma sonrası host transferi + kazanma/erken bitiş kontrolü
  if (sonuc.etkiler.ayrilanlar.size > 0) {
    hostuTransferEt(oda);
    lobiyiYayinla(oda.kod); // host değişikliğini client'lara yansıt
    const erkenKazanan = kazananGrupBul(oda)
      || (!gercekOyuncuKoydeMi(oda) ? erkenBitisKazanani(oda) : null);
    if (erkenKazanan) {
      if (!gercekOyuncuKoydeMi(oda)) {
        sistemMesaji(oda, `Köyde gerçek oyuncu kalmadı — oyun otomatik sonlandırılıyor.`);
      }
      setTimeout(() => bitiseBasla(oda, erkenKazanan), 2000);
    }
  }
}

// v1.5 — Madde 2: Sabah süresi dolunca otomatik devam (host olmasa bile)
function sabahOtomatikDevam(oda) {
  if (oda.faz !== 'sabah') return;
  console.log(`[oyun] ${oda.kod} — Sabah süresi doldu, otomatik devam`);
  const kazanan = kazananGrupBul(oda);
  if (kazanan) {
    bitiseBasla(oda, kazanan);
  } else {
    tartismayaBasla(oda);
  }
}

// ─── Belge §15 — Host transferi + gerçek oyuncu kontrolü ─────
// Host köyden ayrılırsa (Kaan veya oylama ile) sıradaki gerçek
// oyuncuya host görevi geçer. Bot host olmaz. Köyde gerçek oyuncu
// kalmazsa oyun otomatik biter (erkenBitisKazanani ile kazanan grup belirlenir).

function hostuTransferEt(oda) {
  const mevcutHost = oda.players.find(p => p.hostMu);
  if (mevcutHost && mevcutHost.koydeMi !== false && mevcutHost.baglantiVar !== false) {
    return; // Host hâlâ aktif — transfere gerek yok
  }
  if (mevcutHost) mevcutHost.hostMu = false;
  // Sıradaki gerçek oyuncu: bot olmayan + köyde + bağlı
  const yeniHost = oda.players.find(p =>
    !p.bot && p.koydeMi !== false && p.baglantiVar !== false
  );
  if (yeniHost) {
    yeniHost.hostMu = true;
    console.log(`[oda] ${oda.kod} — Host devredildi: ${yeniHost.isim}`);
  }
}

function gercekOyuncuKoydeMi(oda) {
  return oda.players.some(p =>
    !p.bot && p.koydeMi !== false && p.baglantiVar !== false
  );
}

// Belge §15 — Köyde gerçek oyuncu kalmadığında uygulanır.
// Köyde kalan özg/gel sayısı karşılaştırılır → çoğunluk; eşitlikte özgürlükçüler.
// Tarafsız bireysel kazananlar bitiseBasla() içinde hesaplanır.
function erkenBitisKazanani(oda) {
  let ozg = 0, gel = 0;
  for (const oyuncu of oda.players) {
    if (oyuncu.koydeMi === false) continue;
    if (oyuncu.baglantiVar === false) continue;
    const rol = oda.oyun?.roller?.get(oyuncu.id);
    if (!rol) continue;
    if (rol.grup === 'ozgurlukcu') ozg++;
    else if (rol.grup === 'gelenekci') gel++;
  }
  return ozg >= gel ? 'ozgurlukcu' : 'gelenekci';
}

// ─── Kazanma Kontrolü ───────────────────────────────────────
// Belge §4 — Kazanma Koşulları
// Prototipte sadece Özg vs Gel kontrolü yapılıyor; Tarafsız bireysel koşul Faz 8'de açıklanır.
function kazananGrupBul(oda) {
  // Köyde kalan aktif oyuncuların gruplarını say
  const sayim = { ozgurlukcu: 0, tarafsiz: 0, gelenekci: 0 };
  for (const oyuncu of oda.players) {
    if (oyuncu.koydeMi === false) continue;          // ayrılmış
    if (oyuncu.baglantiVar === false) continue;      // bağlantısı kopmuş = ayrılmış (belge §14)
    const rol = oda.oyun.roller.get(oyuncu.id);
    if (!rol) continue;
    sayim[rol.grup] = (sayim[rol.grup] || 0) + 1;
  }

  if (sayim.gelenekci === 0 && sayim.ozgurlukcu > 0) return 'ozgurlukcu';
  if (sayim.ozgurlukcu === 0 && sayim.gelenekci > 0) return 'gelenekci';
  // İkisi de 0 ise (uç durum) — kimse kazanmaz, ama oyun da bitmeli
  if (sayim.ozgurlukcu === 0 && sayim.gelenekci === 0) return 'beraberlik';
  return null; // devam
}

// ─── Tartışmaya Geçiş (Faz 6) ───────────────────────────────
function tartismayaBasla(oda) {
  if (oda.faz !== 'sabah') return;

  oda.faz = 'tartisma';
  oda.altFaz = null;
  oda.oyun.hazirOlanlar.clear();

  const SURE_TARTISMA = Number(process.env.Q_TARTISMA_MS || 120_000);
  oda.fazSonZaman = Date.now() + SURE_TARTISMA;

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'tartisma',
    sure: SURE_TARTISMA,
    sonZaman: oda.fazSonZaman,
    chat: oda.oyun.chat
  });

  sistemMesaji(oda, `Gece ${oda.oyun.geceTuru} sona erdi. Tartışma başladı — 120 saniye serbest sohbet.`);
  console.log(`[oyun] ${oda.kod} — Faz 6 (Tartışma) başladı`);

  const t = setTimeout(() => tartismadanOylamaya(oda), SURE_TARTISMA);
  oda.oyun.fazTimerleri.push(t);

  // Botlar bir süre sonra hazır olur + sohbet başlat
  oda.players.filter(p => p.bot && p.koydeMi !== false).forEach(bot => {
    setTimeout(() => {
      if (oda.faz === 'tartisma') {
        oda.oyun.hazirOlanlar.add(bot.id);
        tartismaHazirKontrol(oda);
      }
    }, 30000 + Math.random() * 60000); // tartışmada hazır olmak için biraz daha bekle
  });
  botSohbetBaslat(oda);
}

function tartismaHazirKontrol(oda) {
  if (oda.faz !== 'tartisma') return;
  const aktif = oda.players.filter(p => p.koydeMi !== false && p.baglantiVar !== false);
  const hazir = [...oda.oyun.hazirOlanlar].filter(id => {
    const p = oyuncuyuBul(oda, id);
    return p && p.koydeMi !== false && p.baglantiVar !== false;
  }).length;
  io.to(oda.kod).emit('tartisma:hazirDurumu', { hazir, toplam: aktif.length });
  if (hazir >= aktif.length) tartismadanOylamaya(oda);
}

function tartismadanOylamaya(oda) {
  if (oda.faz !== 'tartisma' && oda.faz !== 'oylama_tartisma') return;
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];
  console.log(`[oyun] ${oda.kod} — Tartışma bitti, 1. oylama başlıyor`);
  birInciOylamayaBasla(oda);
}

// ─── Faz 7 — 1. Oylama ──────────────────────────────────────
// Belge §11: 15 saniye, herkes oy verir, anlık görünür, geri çekilebilir
function birInciOylamayaBasla(oda) {
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];

  oda.faz = 'oylama_1';
  oda.altFaz = null;

  // Oyları sıfırla
  oda.oyun.oylar1 = new Map(); // oyuncuId → hedefId

  const SURE_OYLAMA_1 = 15_000;
  oda.fazSonZaman = Date.now() + SURE_OYLAMA_1;

  // Köyde olan oyuncuların listesi (oy verebilecekler + hedef adayları)
  const koydekiler = oda.players
    .filter(p => p.koydeMi !== false && p.baglantiVar !== false)
    .map(p => ({ id: p.id, isim: p.isim, bot: !!p.bot }));

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'oylama_1',
    sure: SURE_OYLAMA_1,
    sonZaman: oda.fazSonZaman,
    koydekiler
  });

  // V1 Kaosçu — Hakan "Baskı Mesajı": baskılanan oyuncuya yasaklı hedefi
  // kişisel olarak bildir; UI o oyuncuda yasaklı hedefin oy butonunu griler.
  // (Yasak Set'i sadece o gün geçerlidir; sonraki gece başında geceyeBasla
  //  hakanYasakliOy.clear() çağırıyor.)
  if (oda.oyun.hakanYasakliOy && oda.oyun.hakanYasakliOy.size > 0) {
    for (const [baskilananId, yasakliId] of oda.oyun.hakanYasakliOy.entries()) {
      io.to(baskilananId).emit('oylama:hakanYasakliOy', {
        yasakliId,
        mesaj: 'Baskı mesajı altındasın — bu turda yasaklı hedefe oy veremezsin.'
      });
    }
  }

  sistemMesaji(oda, '⚖️ Oylama başladı — 15 saniye içinde kimi köyden göndermek istediğinizi seçin.');
  console.log(`[oyun] ${oda.kod} — Faz 7: 1. Oylama başladı`);

  const t = setTimeout(() => birInciOylamaBitti(oda), SURE_OYLAMA_1);
  oda.oyun.fazTimerleri.push(t);

  // Botlar rastgele oy versin
  botlarOyVersin(oda, 'oylama_1', oda.oyun.oylar1);
}

// 1. oylama bitti: motor etkilerini uygula, en çok oyu bulan kim?
function birInciOylamaBitti(oda) {
  if (oda.faz !== 'oylama_1') return;
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];

  // Motor etkilerini uygula (Necmi, Azra, DQ)
  // Önce Necmi manipülasyonunu ham haritaya yansıt, sonra ağırlıkları hesapla
  necmiEtkisiniUygula(oda, oda.oyun.oylar1);
  const { oylarSonuc, oylarHam } = oylariBisle(oda, oda.oyun.oylar1);

  // Kim kime oy verdi — herkese göster
  const oyAciklamasi = oylarHamAcikla(oda, oylarHam);

  // En çok oy alanı bul
  const { hedef, oyCount, esitlik } = enCokOyAlan(oylarSonuc);

  // ─── V1 Kaosçu — 1. Oylama sonrası kazanma izleme ──────────
  // (a) Okan'a spotlight'a aldığı hedeflerin oy yönlerini kişisel rapor olarak
  //     gönder. (Hangi adaya oy verdiler? "Kimseye/Kullanmadı" olabilir.)
  // (b) Hakan'ın tarihçesinde bu günün kayıtlarını güncelle: yasakladığı hedef
  //     EN ÇOK OY ALAN mı? (sonucCokOyMu).
  // (c) Bora'nın bu günkü hedeflerinden hangileri (ham) oy aldı kaydet
  //     (boraGunSayaci içeriği zaten bu günün Bora hedefleri).
  uygulaKaoscuOylamaSonrasi(oda, oylarHam, hedef);

  console.log(`[oyun] ${oda.kod} — 1. Oylama bitti. En çok oy: ${hedef || 'yok'} (${oyCount})`);

  if (!hedef || oyCount === 0) {
    // Hiç oy yok — kimse gitmiyor.
    // Belge §11 (Bug #2 / kural A): Bir kez ek tartışma yapılır.
    // Ek tartışmadan sonra yine sonuç çıkmazsa direkt geceye geçilir.
    io.to(oda.kod).emit('oylama:1Sonuc', {
      oyAciklamasi,
      hedef: null,
      hedefIsim: null,
      mesaj: 'Oylar eşit — kimse köyden ayrılmıyor.'
    });
    if (oda.oyun.tekrarTartismaYapildi) {
      sistemMesaji(oda, '🌙 Oylama yine sonuç vermedi — geceye geçiliyor.');
      oda.oyun.tekrarTartismaYapildi = false;
      oda.faz = 'sabah'; // geceyeBasla 'sabah' fazından kabul ediyor
      return geceyeBasla(oda);
    }
    sistemMesaji(oda, '🤝 Oylar eşit, kimse köyden ayrılmıyor. 60 saniyelik tartışma başlıyor.');
    oda.oyun.tekrarTartismaYapildi = true;
    return tekrarTartismayaBasla(oda);
  }

  const hedefOyuncu = oyuncuyuBul(oda, hedef);
  io.to(oda.kod).emit('oylama:1Sonuc', {
    oyAciklamasi,
    hedef,
    hedefIsim: hedefOyuncu?.isim || '???',
    oyCount,
    mesaj: `${hedefOyuncu?.isim || '???'} en çok oyu aldı (${oyCount} oy). Savunma hakkı başlıyor.`
  });

  sistemMesaji(oda, `🎤 ${hedefOyuncu?.isim || '???'} en çok oyu aldı. Savunma süresi: 20 saniye.`);

  // 1. oylama yapanları kaydet (2. oylama için)
  oda.oyun.birInciOylamaKatilimcilar = new Set(oylarHam.keys());
  oda.oyun.birInciOylamaSonuc = { hedef, oyCount, oylarSonuc, oyAciklamasi };

  // Mazoşist / Fuckbuddy için oylama geçmişine kaydet (ham oylar — kim kime)
  if (!oda.oyun.oylamaGecmisi) oda.oyun.oylamaGecmisi = [];
  oda.oyun.oylamaGecmisi.push({
    gun: oda.oyun.geceTuru || 0,
    oylar: new Map(oylarHam)  // shallow kopya — sonraki manipülasyondan etkilenmesin
  });

  savunmayaBasla(oda, hedef);
}

// ─── Faz 7 — Son Savunma ─────────────────────────────────────
function savunmayaBasla(oda, savunulanId) {
  oda.faz = 'savunma';
  oda.altFaz = null;
  oda.oyun.hazirOlanlar.clear();

  const SURE_SAVUNMA = 20_000;
  oda.fazSonZaman = Date.now() + SURE_SAVUNMA;

  const savunulan = oyuncuyuBul(oda, savunulanId);

  // ─── V1: Transfobik (Sinan) "Veli toplantısı" etkisi ──────
  // Hedef savunmaya çıkıyorsa otomatik pas: kısa duyuru + 2 saniye sonra savunma biter.
  // Bayrak tek seferlik; aynı oyuncu sonraki turda normal savunabilir (Set bu gün kapanışında temizlenecek).
  const sinanKapali = oda.oyun.sinanSavunmaKapali?.has(savunulanId);

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'savunma',
    sure: SURE_SAVUNMA,
    sonZaman: oda.fazSonZaman,
    savunulanId,
    savunulanIsim: savunulan?.isim || '???',
    sinanKapali: !!sinanKapali   // client UI savunma alanını gizleyebilir
  });

  if (sinanKapali) {
    sistemMesaji(oda,
      `🤐 ${savunulan?.isim || '???'} savunmaya çıkamadı (Transfobik etkisiyle veli toplantısına çağrılmış — susuyor).`);
    console.log(`[oyun] ${oda.kod} — Savunma: ${savunulan?.isim} (Sinan etkisiyle PAS)`);
    // Sinan tek seferlik etki: bayrağı kullandık, temizle.
    oda.oyun.sinanSavunmaKapali.delete(savunulanId);
    // Kısa gecikme sonrası savunma otomatik biter.
    const tPas = setTimeout(() => {
      if (oda.faz === 'savunma') savunmaBitti(oda, savunulanId);
    }, 2500);
    oda.oyun.fazTimerleri.push(tPas);
    return;
  }

  sistemMesaji(oda, `🎤 ${savunulan?.isim || '???'} kendini savunuyor — 20 saniye.`);
  console.log(`[oyun] ${oda.kod} — Savunma: ${savunulan?.isim}`);

  const t = setTimeout(() => savunmaBitti(oda, savunulanId), SURE_SAVUNMA);
  oda.oyun.fazTimerleri.push(t);

  // Sadece savunulan oyuncu bot ise rastgele bir gecikmeyle "Hazırım" der
  const savunulanOyuncu = oyuncuyuBul(oda, savunulanId);
  if (savunulanOyuncu?.bot) {
    setTimeout(() => {
      if (oda.faz === 'savunma') {
        oda.oyun.hazirOlanlar.add(savunulanId);
        savunmaHazirKontrol(oda, savunulanId);
      }
    }, 5000 + Math.random() * 10000);
  }
}

function savunmaHazirKontrol(oda, savunulanId) {
  if (oda.faz !== 'savunma') return;
  // Yalnızca savunulan oyuncu hazır olabilir → o hazırsa savunma biter
  const savunulanHazir = oda.oyun.hazirOlanlar.has(savunulanId);
  io.to(oda.kod).emit('savunma:hazirDurumu', {
    savunulanHazir,
    savunulanId
  });
  if (savunulanHazir) savunmaBitti(oda, savunulanId);
}

function savunmaBitti(oda, savunulanId) {
  if (oda.faz !== 'savunma') return;
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];
  console.log(`[oyun] ${oda.kod} — Savunma bitti, 2. oylama başlıyor`);
  ikinciOylamayaBasla(oda, savunulanId);
}

// ─── Faz 7 — 2. Oylama ──────────────────────────────────────
// Belge §11: 10 saniye, sadece 1. turda oy kullananlar, evet/hayır
function ikinciOylamayaBasla(oda, savunulanId) {
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];

  oda.faz = 'oylama_2';
  oda.altFaz = null;

  oda.oyun.oylar2 = new Map(); // oyuncuId → 'evet' | 'hayir'
  oda.oyun.oylama2Hedef = savunulanId;

  const SURE_OYLAMA_2 = 10_000;
  oda.fazSonZaman = Date.now() + SURE_OYLAMA_2;

  const savunulan = oyuncuyuBul(oda, savunulanId);

  // Sadece 1. turda oy kullananlar katılabilir
  const katilabilecekler = [...(oda.oyun.birInciOylamaKatilimcilar || new Set())]
    .map(id => {
      const p = oyuncuyuBul(oda, id);
      return p && p.koydeMi !== false ? { id: p.id, isim: p.isim } : null;
    })
    .filter(Boolean);

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'oylama_2',
    sure: SURE_OYLAMA_2,
    sonZaman: oda.fazSonZaman,
    savunulanId,
    savunulanIsim: savunulan?.isim || '???',
    katilabilecekler
  });

  sistemMesaji(oda, `⚖️ 2. oylama: ${savunulan?.isim || '???'} köyden ayrılsın mı? (10 saniye)`);
  console.log(`[oyun] ${oda.kod} — 2. Oylama başladı (hedef: ${savunulan?.isim})`);

  const t = setTimeout(() => ikinciOylamaBitti(oda), SURE_OYLAMA_2);
  oda.oyun.fazTimerleri.push(t);

  // Botlar rastgele evet/hayır versin
  botlarIkinciOyVersin(oda);
}

function ikinciOylamaBitti(oda) {
  if (oda.faz !== 'oylama_2') return;
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];

  const savunulanId = oda.oyun.oylama2Hedef;
  const savunulan = oyuncuyuBul(oda, savunulanId);
  const oylar = oda.oyun.oylar2;

  const evet = [...oylar.values()].filter(v => v === 'evet').length;
  const hayir = [...oylar.values()].filter(v => v === 'hayir').length;
  const toplam = evet + hayir;

  // Kim evet/hayır dedi — herkese göster
  const oyAciklamasi2 = [];
  for (const [oyuncuId, karar] of oylar.entries()) {
    const p = oyuncuyuBul(oda, oyuncuId);
    oyAciklamasi2.push({ oyuncuId, isim: p?.isim || '???', karar });
  }

  // %51 çoğunluk gerekli
  const gidiyor = toplam > 0 && (evet / toplam) > 0.5;

  console.log(`[oyun] ${oda.kod} — 2. Oylama bitti: evet=${evet} hayır=${hayir} → ${gidiyor ? 'GİDİYOR' : 'KALIYOR'}`);

  io.to(oda.kod).emit('oylama:2Sonuc', {
    oyAciklamasi2,
    evet,
    hayir,
    gidiyor,
    savunulanId,
    savunulanIsim: savunulan?.isim || '???'
  });

  if (gidiyor) {
    // Oyuncu köyden ayrılıyor
    sistemMesaji(oda, `🚪 ${savunulan?.isim || '???'} köyden ayrılıyor.`);

    if (savunulan) {
      savunulan.koydeMi = false;
      savunulan.ayrildigGunduz = oda.oyun.geceTuru;

      // Ayrılan oyuncuyu socket odasına ekle (chat'in 'ayrilan' kanalı için)
      ayrilanlarOdasinaAl(oda, savunulan);
      // Liste güncellensin
      oyuncuListesiYayinla(oda);

      // Not defteri herkese açılır + rol ifşası
      const not = oda.oyun.geceNotlari?.get(savunulanId) || '';
      const rol = oda.oyun.roller?.get(savunulanId);

      io.to(oda.kod).emit('oyuncu:ayrildi', {
        oyuncuId: savunulanId,
        isim: savunulan.isim,
        rolAd: rol?.ad || '?',
        grup: rol?.grup || '?',
        notDefteri: not,
        sebep: 'oylama'
      });

      // Belge §15 — Ayrılma sonrası host transferi + kazanma/erken bitiş kontrolü
      hostuTransferEt(oda);
      lobiyiYayinla(oda.kod);
      const kazanan = kazananGrupBul(oda)
        || (!gercekOyuncuKoydeMi(oda) ? erkenBitisKazanani(oda) : null);
      if (kazanan) {
        if (!gercekOyuncuKoydeMi(oda)) {
          sistemMesaji(oda, `Köyde gerçek oyuncu kalmadı — oyun otomatik sonlandırılıyor.`);
        }
        // Kazanan varsa direkt bitiş (sonuç fazı çalıştırılmaz)
        setTimeout(() => bitiseBasla(oda, kazanan), 2000);
      } else {
        // Yeni: 20sn'lik sonuç fazı — not defteri okuma + hazır mekaniği, sonra geceye
        oylamaSonucaBasla(oda, {
          ayrilanId: savunulanId,
          ayrilanIsim: savunulan.isim,
          rol: rol ? { ad: rol.ad, grup: rol.grup } : null,
          notDefteri: not,
          oyAciklamasi2,
          evet,
          hayir
        });
      }
    }
  } else {
    // Kimse gitmiyor (2. oylamada %51 sağlanamadı)
    // Belge §11 (Bug #2 / kural A): Bir kez ek tartışma yapılır.
    // Ek tartışmadan sonra yine sonuç çıkmazsa direkt geceye geçilir.
    const mesaj = toplam === 0
      ? 'Kimse oy kullanmadı — kimse köyden ayrılmıyor.'
      : 'Çoğunluk sağlanamadı — kimse köyden ayrılmıyor.';

    if (oda.oyun.tekrarTartismaYapildi) {
      sistemMesaji(oda, `🤝 ${mesaj}`);
      sistemMesaji(oda, '🌙 Oylama yine sonuç vermedi — geceye geçiliyor.');
      oda.oyun.tekrarTartismaYapildi = false;
      oda.faz = 'sabah'; // geceyeBasla 'sabah' fazından kabul ediyor
      return geceyeBasla(oda);
    }
    sistemMesaji(oda, `🤝 ${mesaj} 60 saniyelik tartışma başlıyor.`);
    oda.oyun.tekrarTartismaYapildi = true;
    tekrarTartismayaBasla(oda);
  }
}

// ─── Faz 7 — Oylama Sonucu (20 sn, hazır ile erken geçilir) ───
// Madde 2: Birinin köyden ayrılmasından sonra 20sn — sonuçlar + not defteri okuma süresi
// Herkes "Hazırım" derse beklenmeden geceye geçilir
function oylamaSonucaBasla(oda, sonucBilgi) {
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];

  oda.faz = 'oylama_sonuc';
  oda.altFaz = null;
  oda.oyun.hazirOlanlar.clear();

  const SURE_SONUC = Number(process.env.Q_SONUC_MS || 20_000);
  oda.fazSonZaman = Date.now() + SURE_SONUC;

  // Sonuç bilgisini odaya kaydet (mount sonrası senkronizasyon için)
  oda.oyun.oylamaSonucu = sonucBilgi;

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'oylama_sonuc',
    sure: SURE_SONUC,
    sonZaman: oda.fazSonZaman,
    sonuc: sonucBilgi
  });

  sistemMesaji(oda, `📜 Sonuçlar açıklandı. 20 saniye içinde not defterini oku — herkes hazırsa geceye erken geçilir.`);
  console.log(`[oyun] ${oda.kod} — Oylama sonuç fazı (20sn)`);

  const t = setTimeout(() => oylamaSonucundanGeceye(oda), SURE_SONUC);
  oda.oyun.fazTimerleri.push(t);

  // Botlar otomatik hazır olsun + biraz da konuşsun
  oda.players.filter(p => p.bot && p.koydeMi !== false).forEach(bot => {
    setTimeout(() => {
      if (oda.faz === 'oylama_sonuc') {
        oda.oyun.hazirOlanlar.add(bot.id);
        oylamaSonucuHazirKontrol(oda);
      }
    }, 6000 + Math.random() * 10000);
  });
  botSohbetBaslat(oda);
}

function oylamaSonucuHazirKontrol(oda) {
  if (oda.faz !== 'oylama_sonuc') return;
  const aktif = oda.players.filter(p => p.koydeMi !== false && p.baglantiVar !== false);
  const hazir = [...oda.oyun.hazirOlanlar].filter(id => {
    const p = oyuncuyuBul(oda, id);
    return p && p.koydeMi !== false && p.baglantiVar !== false;
  }).length;
  io.to(oda.kod).emit('oylama_sonuc:hazirDurumu', { hazir, toplam: aktif.length });
  if (hazir >= aktif.length && aktif.length > 0) oylamaSonucundanGeceye(oda);
}

function oylamaSonucundanGeceye(oda) {
  if (oda.faz !== 'oylama_sonuc') return;
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];
  oda.faz = 'sabah'; // geceyeBasla 'sabah' fazından kabul ediyor
  geceyeBasla(oda);
}

// ─── Faz 7 — Tekrar Tartışma (60 sn, sonra direkt geceye) ───
function tekrarTartismayaBasla(oda) {
  oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
  oda.oyun.fazTimerleri = [];

  oda.faz = 'oylama_tartisma';
  oda.altFaz = null;
  oda.oyun.hazirOlanlar.clear();

  const SURE_TARTISMA_2 = 60_000;
  oda.fazSonZaman = Date.now() + SURE_TARTISMA_2;

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'oylama_tartisma',
    sure: SURE_TARTISMA_2,
    sonZaman: oda.fazSonZaman,
    chat: oda.oyun.chat
  });

  sistemMesaji(oda, '🗣️ Kimse köyden ayrılmadı — 60 saniyelik ek tartışma. Sonra tekrar oylama.');
  console.log(`[oyun] ${oda.kod} — Tekrar tartışma (60 sn)`);

  const t = setTimeout(() => tartismadanOylamaya(oda), SURE_TARTISMA_2);
  oda.oyun.fazTimerleri.push(t);

  // Botlar hazır olsun + sohbet başlat
  oda.players.filter(p => p.bot && p.koydeMi !== false).forEach(bot => {
    setTimeout(() => {
      if (oda.faz === 'oylama_tartisma') {
        oda.oyun.hazirOlanlar.add(bot.id);
        const aktif = oda.players.filter(p => p.koydeMi !== false && p.baglantiVar !== false);
        if (oda.oyun.hazirOlanlar.size >= aktif.length) tartismadanOylamaya(oda);
      }
    }, 20000 + Math.random() * 30000);
  });
  botSohbetBaslat(oda);
}

// ─── Oylama Yardımcı Fonksiyonları ──────────────────────────

// Motor etkilerini (Necmi, Azra, DQ, Sugar Daddy, V1 Gelenekçi) uygular; ham oylar → işlenmiş oylar
function oylariBisle(oda, oylarHam) {
  const oyEtkileri = oda.oyun.oyEtkileri || new Map();
  // Sugar Daddy etkisi: hedef bazlı oy katsayısı (gruptan bağımsız)
  // Map(hedefId → katsayi) — geceMotoru'nda uygulaSugarDaddyYatirim doldurur
  const sdOySonuc = oda.oyun.sdOySonuc || new Map();
  // V1 Gelenekçi geçici state'leri (Bifobik & Cinsiyetçi)
  const yaseminKendineOy = oda.oyun.yaseminKendineOy || new Set();
  const oguzKadinHedefleri = oda.oyun.oguzKadinHedefleri || new Set();

  const oylarSonuc = new Map(); // hedefId → oy sayısı (ağırlıklı)

  for (const [oyuncuId, hedefId] of oylarHam.entries()) {
    if (!hedefId) continue;

    // ─── V1: Bifobik (Yasemin) "Sözleşme hilesi" ─────────────
    // Yaseminin hedefi oy verirken oyu kendine yönlenir → kendine oy = geçersiz.
    // Kendi adına sayma adımına bile gelmeden bu oyu atla.
    if (yaseminKendineOy.has(oyuncuId)) {
      console.log(`[oylama] ${oyuncuId} oyu Bifobik (Yasemin) etkisiyle kendine yönlendi → geçersiz`);
      continue;
    }

    // Azra'nın oySayilmaz etkisi: bu oyuncunun oyu sayılmaz
    const azraEtki = oyEtkileri.get(oyuncuId);
    if (azraEtki?.oySayilmaz) {
      console.log(`[oylama] ${oyuncuId} oyu Azra etkisiyle sayılmadı`);
      continue;
    }

    // DQ oyKati etkisi: bu oyuncu Özgürlükçüye oy verdiyse 2 kat sayılır
    // (DQ gelenekçiyi sahnelerse oySayilmaz; özgürlükçüyü sahnelerse oyKati:2)
    const dqEtki = oyEtkileri.get(oyuncuId);
    let oyAgirligi = 1;
    if (dqEtki?.oyKati) {
      const hedefRol = oda.oyun.roller?.get(hedefId);
      if (hedefRol?.grup === 'ozgurlukcu') {
        oyAgirligi = dqEtki.oyKati; // genellikle 2
        console.log(`[oylama] ${oyuncuId} oyu DQ etkisiyle ${oyAgirligi}x sayıldı`);
      } else if (hedefRol?.grup === 'gelenekci') {
        // DQ gelenekçiye gittiyse oySayilmaz
        console.log(`[oylama] ${oyuncuId} oyu DQ etkisiyle sayılmadı (gelenekçiye gitti)`);
        continue;
      }
    }

    // Sugar Daddy etkisi: oy VEREN kişi (oyuncuId) SD'nin hedefiyse oyu 2 sayılır.
    // Karar: DQ ile çakışırsa max 2 kalır (kümülatif değil).
    const sdKati = sdOySonuc.get(oyuncuId);
    if (sdKati && sdKati > oyAgirligi) {
      oyAgirligi = sdKati;
      console.log(`[oylama] ${oyuncuId} oyu SD etkisiyle ${oyAgirligi}x sayıldı`);
    }

    // ─── V1: Cinsiyetçi (Oğuz) "Yer bilir" ──────────────────
    // Oğuz'un kadın hedefinin Gelenekçi adaya verdiği oy 0 sayılır.
    // Karar #10: yarılama değil, "Gelenekçi adayına 0" (diğer adaylara oy normal).
    if (oguzKadinHedefleri.has(oyuncuId)) {
      const hedefRol = oda.oyun.roller?.get(hedefId);
      if (hedefRol?.grup === 'gelenekci') {
        console.log(`[oylama] ${oyuncuId} oyu Cinsiyetçi (Oğuz) etkisiyle Gelenekçi adaya 0 sayıldı`);
        continue;
      }
    }

    oylarSonuc.set(hedefId, (oylarSonuc.get(hedefId) || 0) + oyAgirligi);
  }

  return { oylarSonuc, oylarHam };
}

// Necmi manipülasyonunu da ham oy haritasına uygular (oylar verilmeden önce çağrılır)
function necmiEtkisiniUygula(oda, oylarHam) {
  const oyEtkileri = oda.oyun.oyEtkileri || new Map();
  for (const [oyuncuId] of oylarHam.entries()) {
    const etki = oyEtkileri.get(oyuncuId);
    if (!etki?.otomatikHedefSahibi) continue;
    // Necmi'nin kendi oyuna bak
    const necmiId = etki.otomatikHedefSahibi;
    const necmiOyu = oylarHam.get(necmiId);
    if (necmiOyu) {
      console.log(`[oylama] Necmi manipülasyonu: ${oyuncuId} → ${necmiOyu} (Necmi'nin oyu)`);
      oylarHam.set(oyuncuId, necmiOyu);
    } else {
      // Necmi oy vermediyse hedef de kullanamaz
      console.log(`[oylama] Necmi manipülasyonu: ${oyuncuId} oy kullanamadı (Necmi oy vermedi)`);
      oylarHam.delete(oyuncuId);
    }
  }
}

// En çok oy alanı bul (eşitlikte null döner)
function enCokOyAlan(oylarSonuc) {
  if (oylarSonuc.size === 0) return { hedef: null, oyCount: 0, esitlik: false };
  const sirali = [...oylarSonuc.entries()].sort((a, b) => b[1] - a[1]);
  const enCok = sirali[0][1];
  const esitler = sirali.filter(([, v]) => v === enCok);
  if (esitler.length > 1) return { hedef: null, oyCount: enCok, esitlik: true };
  return { hedef: esitler[0][0], oyCount: enCok, esitlik: false };
}

// Ham oy haritasından "X → Y'ye oy verdi" string listesi üret
function oylarHamAcikla(oda, oylarHam) {
  const sonuc = [];
  for (const [oyuncuId, hedefId] of oylarHam.entries()) {
    const p = oyuncuyuBul(oda, oyuncuId);
    const h = oyuncuyuBul(oda, hedefId);
    if (p && h) sonuc.push({ oyuncuId, isim: p.isim, hedefId, hedefIsim: h.isim });
  }
  return sonuc;
}

// Botlar 1. oylama için rastgele oy versin
function botlarOyVersin(oda, faz, oylarMap) {
  const aktif = oda.players.filter(p => p.koydeMi !== false && p.baglantiVar !== false);
  oda.players.filter(p => p.bot && p.koydeMi !== false).forEach(bot => {
    setTimeout(() => {
      if (oda.faz !== faz) return;
      // V1 Kaosçu — Hakan yasağı: bot bu turda yasaklıysa o hedefi listeden çıkar
      const yasakliHedef = (faz === 'oylama_1')
        ? oda.oyun.hakanYasakliOy?.get(bot.id) || null : null;
      const adaylar = aktif.filter(p => p.id !== bot.id && p.id !== yasakliHedef);
      if (adaylar.length === 0) return;
      const hedef = adaylar[Math.floor(Math.random() * adaylar.length)];
      oylarMap.set(bot.id, hedef.id);

      // Herkese anlık oy durumunu yayınla
      io.to(oda.kod).emit('oylama:guncellendi', oylarAnlikDurum(oda, oylarMap));
    }, 2000 + Math.random() * 10000);
  });
}

// Botlar 2. oylama için rastgele evet/hayır versin
function botlarIkinciOyVersin(oda) {
  const katilabilecekler = oda.oyun.birInciOylamaKatilimcilar || new Set();
  oda.players
    .filter(p => p.bot && p.koydeMi !== false && katilabilecekler.has(p.id))
    .forEach(bot => {
      setTimeout(() => {
        if (oda.faz !== 'oylama_2') return;
        oda.oyun.oylar2.set(bot.id, 'evet');
        io.to(oda.kod).emit('oylama2:guncellendi', {
          evet: [...oda.oyun.oylar2.values()].filter(v => v === 'evet').length,
          hayir: [...oda.oyun.oylar2.values()].filter(v => v === 'hayir').length,
          kullananlar: [...oda.oyun.oylar2.keys()]
        });
      }, 1000 + Math.random() * 7000);
    });
}

// 1. oylama anlık durum (herkes görebilir)
function oylarAnlikDurum(oda, oylarMap) {
  const sayimlar = new Map(); // hedefId → sayı
  for (const [, hedefId] of oylarMap.entries()) {
    if (hedefId) sayimlar.set(hedefId, (sayimlar.get(hedefId) || 0) + 1);
  }
  const kullananlar = [...oylarMap.keys()];
  return { sayimlar: Object.fromEntries(sayimlar), kullananlar };
}

// ─── V1 Kaosçu — 1. oylama sonrası kazanma izleme ───────────
// Çağrı yeri: birInciOylamaBitti içinde, enCokOyAlan'dan sonra.
// (a) Okan: spotlight aldığı hedeflerin "kime oy verdiği" Okan'a kişisel emit.
// (b) Hakan: tarihçesinde bu günün son kaydının sonucCokOyMu alanını günceller.
// (c) Bora: günsel kazanma izleme — bu günkü Bora hedeflerinden hangileri ham oy aldı
//     ayrı bir Set'te saklanır (kazanma kontrolü bitiseBasla'da yapılır).
function uygulaKaoscuOylamaSonrasi(oda, oylarHam, enCokOyAlanId) {
  if (!oda.oyun) return;
  const gun = oda.oyun.geceTuru || 0;

  // (a) Okan: bu turdaki spotlight hedeflerinin oy yönü
  if (oda.oyun.okanBuTurHedefleri && oda.oyun.okanBuTurHedefleri.size > 0) {
    for (const [okanId, hedefSet] of oda.oyun.okanBuTurHedefleri.entries()) {
      const okanOyuncu = oyuncuyuBul(oda, okanId);
      if (!okanOyuncu || okanOyuncu.koydeMi === false) continue;
      for (const hedefId of hedefSet) {
        const oyu = oylarHam.get(hedefId);
        const hedefIsim = oyuncuyuBul(oda, hedefId)?.isim || '?';
        const oyIsim = oyu ? (oyuncuyuBul(oda, oyu)?.isim || '?') : null;
        io.to(okanId).emit('kaoscu:okanOyRaporu', {
          gun,
          hedefId,
          hedefIsim,
          oyVerilenId: oyu || null,
          oyVerilenIsim: oyIsim,
          mesaj: oyu
            ? `Spotlight: ${hedefIsim} → ${oyIsim}'e oy verdi.`
            : `Spotlight: ${hedefIsim} oy kullanmadı.`
        });
      }
    }
    // Bu turun spotlight hedeflerini temizle — bir sonraki gece yeniden dolar.
    oda.oyun.okanBuTurHedefleri.clear();
  }

  // (b) Hakan: tarihçedeki bu günün kaydı için sonucCokOyMu güncelle.
  if (oda.oyun.hakanYasakliTarihce && oda.oyun.hakanYasakliTarihce.size > 0) {
    for (const liste of oda.oyun.hakanYasakliTarihce.values()) {
      for (const kayit of liste) {
        if (kayit.gun !== gun) continue;
        kayit.sonucCokOyMu = (kayit.yasakliId === enCokOyAlanId);
      }
    }
  }

  // (c) Bora: bu günkü Bora hedeflerinden ham oy alanlar
  if (oda.oyun.boraGunSayaci && oda.oyun.boraGunSayaci.size > 0) {
    if (!oda.oyun.boraGunOyAlan) oda.oyun.boraGunOyAlan = new Map();
    const gunHedefleri = oda.oyun.boraGunSayaci.get(gun);
    if (gunHedefleri && gunHedefleri.size > 0) {
      // Oy alanların set'i: oylarHam'da değer olarak görünen tüm hedefler
      const oyAlanlar = new Set();
      for (const oyHedef of oylarHam.values()) {
        if (oyHedef) oyAlanlar.add(oyHedef);
      }
      const buGunBoraOyAlan = new Set();
      for (const boraHedef of gunHedefleri) {
        if (oyAlanlar.has(boraHedef)) buGunBoraOyAlan.add(boraHedef);
      }
      oda.oyun.boraGunOyAlan.set(gun, buGunBoraOyAlan);
    }
  }
}

// ─── Bitişe Geçiş (Faz 8) ───────────────────────────────────
function bitiseBasla(oda, kazananGrup) {
  oda.oyun?.fazTimerleri?.forEach(t => clearTimeout(t));
  if (oda.oyun) oda.oyun.fazTimerleri = [];

  oda.faz = 'bitis';
  oda.altFaz = null;

  // Tüm rolleri ifşa et
  const tumRoller = [];
  for (const oyuncu of oda.players) {
    const rol = oda.oyun.roller.get(oyuncu.id);
    if (!rol) continue;
    tumRoller.push({
      oyuncuId: oyuncu.id,
      isim: oyuncu.isim,
      bot: !!oyuncu.bot,
      koydeMi: oyuncu.koydeMi !== false,
      rol: { id: rol.id, ad: rol.ad, grup: rol.grup, karakter: rol.karakter, gorsel: rol.gorsel }
    });
  }

  // Tarafsız bireysel kazananlar — V1: her rolün kendi koşulu var
  // (faz1-mekanik-kararlar.md Tarafsız tablosu). State'i olan roller için
  // spesifik kontrol; state altyapısı henüz tam olmayan roller için fallback
  // olarak "köyde kalmak" döner. Mazoşist ayrı listede tutulduğundan atlanır.
  const tarafsizKazananlar = [];
  for (const [oyuncuId, rolObj] of oda.oyun.roller) {
    if (rolObj.grup !== 'tarafsiz') continue;
    const oyuncu = oda.players.find(p => p.id === oyuncuId);
    if (!oyuncu) continue;
    const koydeMi = oyuncu.koydeMi !== false;
    const rolId = rolObj.id;
    let kazandiMi = false;

    switch (rolId) {
      case 'mazosist':
        // Ayrı listede (mazosistBireyKazanan) — burada işlenmez.
        continue;

      case 'sugar_baby':
        // 4 farklı oyuncudan hediye almış olmalı.
        kazandiMi = (oda.oyun.sbHediyeAlinanlar?.get(oyuncuId)?.size ?? 0) >= 4;
        break;

      case 'capkin':
        // 3 farklı hedefe başarılı tavla atmış olmalı.
        kazandiMi = (oda.oyun.capkinTavlananlar?.get(oyuncuId)?.size ?? 0) >= 3;
        break;

      case 'copcatan': {
        // En az 2 farklı eşleştirme + her iki tarafı da oyun sonuna kadar köyde.
        const eslesmeler = oda.oyun.coplatanEslesmeleri?.get(oyuncuId) || [];
        const oyundaKalanlar = eslesmeler.filter(es => {
          const a = oda.players.find(p => p.id === es.a);
          const b = oda.players.find(p => p.id === es.b);
          return a && b && a.koydeMi !== false && b.koydeMi !== false;
        });
        kazandiMi = oyundaKalanlar.length >= 2;
        break;
      }

      case 'lovebuddy': {
        // En az 1 karşılıklı bağ + bağ kurulan hedef köyde kalsın.
        const bagliCiftler = oda.oyun.lbBagliCiftler || new Set();
        let varMi = false;
        for (const anahtar of bagliCiftler) {
          const [lbId, hedefId] = String(anahtar).split(':');
          if (lbId !== oyuncuId) continue;
          const hedef = oda.players.find(p => p.id === hedefId);
          if (hedef && hedef.koydeMi !== false) {
            varMi = true;
            break;
          }
        }
        kazandiMi = varMi;
        break;
      }

      // ─── State altyapısı henüz tam olmayan roller: fallback "köyde kalmak"
      // (faz1-mekanik-kararlar.md koşulları ileride state'lerle değiştirilecek)
      case 'hetero_erkek':       // 3 farklı gece çay + ≥1 ziyaretçi (heAksiyon yok)
      case 'hetero_kadin':       // 2 erkek + 2 kadın hedef (bkHedefler yok)
      case 'aseksuel':           // 3 farklı oyuncunun aksiyon tipi (özel set yok)
      case 'fetisist':           // 3 farklı doğru tespit (fetisistDogruTespit yok)
      case 'sugar_daddy':        // 2 kez yatırım → oy ile ayrılma (sdYatirimSonuc yok)
      case 'koca_kari':          // 3 farklı "aynı grup" eşleşmesi (kkAyniGrupEslesmeleri yok)
      case 'poliamorist':        // 3 farklı oyuncunun rolünü doğru (poliDogruTahmin yok)
      case 'fuckbuddy':          // 2 gece bilgi + 1 Gelenekçi işaret (fbBilgi/fbGelIsaret yok)
      case 'situationship':      // 3 gece üst üste aynı hedef (sitArdisikHedef yok)
      default:
        kazandiMi = koydeMi;
        break;
    }

    if (kazandiMi) {
      tarafsizKazananlar.push({ oyuncuId, isim: oyuncu.isim, rolAd: rolObj.ad });
    }
  }

  // Outsider (Bastırmış / Murat) bireysel kazanma — Özgürlükçü zaferi + Murat köyde kalmalı
  const muratBireyKazanan = tumRoller
    .filter(r => r.rol.id === 'bastirmis' && r.koydeMi && kazananGrup === 'ozgurlukcu')
    .map(r => ({ oyuncuId: r.oyuncuId, isim: r.isim, rolAd: r.rol.ad }));

  // Mazoşist (Beren) bireysel kazanma — Beren oyun sırasında köyden AYRILDIYSA kazanır.
  // (Karar: gizli tahmin yok; ayrılmak otomatik kazanma.)
  // koydeMi === false → ayrılmış demektir.
  const mazosistBireyKazanan = tumRoller
    .filter(r => r.rol.id === 'mazosist' && !r.koydeMi)
    .map(r => ({ oyuncuId: r.oyuncuId, isim: r.isim, rolAd: r.rol.ad }));

  // ─── V1 Kaosçu bireysel kazananlar ─────────────────────────
  // Her Kaosçu rolünün koşulu farklı; faz1-mekanik-kararlar.md'ye göre:
  //   Okan (kaoscu_narsist): kimlik açıklayanların ≥%50'si (min 2) spotlight'ında
  //   Bora (sadist):         4+ farklı hedef + bunlardan 2'si aynı gün ham oy aldı
  //   Erdem (sinir_tanimaz): 4+ farklı oyuncunun aksiyonunu öğrenmiş
  //   Hakan (zorba):         2+ oylamada yasakladığı kişi en çok oy almış
  const kaoscuBireyKazananlar = [];

  for (const [oyuncuId, rolObj] of oda.oyun.roller) {
    const rolId = rolObj.id;
    const oyuncu = oda.players.find(p => p.id === oyuncuId);
    if (!oyuncu) continue;
    const isim = oyuncu.isim;
    // koydeMi koşulu: spec'te ayrılma şartı yok — ayrılsalar bile koşul tamamsa
    // kazanırlar (Kaosçu = bireysel zafer; oyun devam etse de tetiklenir).

    if (rolId === 'kaoscu_narsist') {
      // Okan: spotlight aldıkları arasında kimlik açıklamış olanların oranı
      // %50 ve üzeriyse (ve en az 2 kişi) kazanır.
      const aciklananSet = oda.oyun.aciklanmislar || new Set();
      const spotlightSet = oda.oyun.okanSpotlightSayaci?.get(oyuncuId) || new Set();
      if (aciklananSet.size > 0) {
        const ortak = [...aciklananSet].filter(id => spotlightSet.has(id)).length;
        const minEsik = Math.max(2, Math.ceil(aciklananSet.size / 2));
        if (ortak >= minEsik) {
          kaoscuBireyKazananlar.push({ oyuncuId, isim, rolAd: rolObj.ad });
        }
      }
    } else if (rolId === 'sadist') {
      // Bora: 4+ farklı hedefe "Bozuk Sipariş" uygulamış olmalı; ayrıca
      // bunlardan en az 2'si aynı gün (1. oylamada) ham oy almış olmalı.
      // boraGunOyAlan: gun → Set(boraHedefId) — o gün ham oy alan Bora hedefleri
      // Burada herhangi bir günde >=2 olması koşulu sağlar.
      const hedefSet = oda.oyun.boraHedefSayaci?.get(oyuncuId) || new Set();
      let enFazlaAynıGun = 0;
      if (oda.oyun.boraGunOyAlan instanceof Map) {
        for (const oyAlanSet of oda.oyun.boraGunOyAlan.values()) {
          if (oyAlanSet?.size > enFazlaAynıGun) enFazlaAynıGun = oyAlanSet.size;
        }
      }
      if (hedefSet.size >= 4 && enFazlaAynıGun >= 2) {
        kaoscuBireyKazananlar.push({ oyuncuId, isim, rolAd: rolObj.ad });
      }
    } else if (rolId === 'sinir_tanimaz') {
      // Erdem: 4+ farklı oyuncunun aksiyonunu öğrenmiş
      const ogrenilen = oda.oyun.erdemOgrenilenHedefler?.get(oyuncuId) || new Set();
      if (ogrenilen.size >= 4) {
        kaoscuBireyKazananlar.push({ oyuncuId, isim, rolAd: rolObj.ad });
      }
    } else if (rolId === 'zorba') {
      // Hakan: tarihçede sonucCokOyMu=true olan kayıt sayısı 2+
      const tarihce = oda.oyun.hakanYasakliTarihce?.get(oyuncuId) || [];
      const basariliSay = tarihce.filter(t => t.sonucCokOyMu).length;
      if (basariliSay >= 2) {
        kaoscuBireyKazananlar.push({ oyuncuId, isim, rolAd: rolObj.ad });
      }
    }
  }

  oda.oyun.bitis = {
    kazananGrup,
    tumRoller,
    tarafsizKazananlar,
    muratBireyKazanan,
    mazosistBireyKazanan,
    kaoscuBireyKazananlar,
    geceTuru: oda.oyun.geceTuru || 0
  };

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'bitis',
    kazananGrup,
    tumRoller,
    tarafsizKazananlar,
    muratBireyKazanan,
    mazosistBireyKazanan,
    kaoscuBireyKazananlar,
    geceTuru: oda.oyun.geceTuru || 0
  });

  console.log(`[oyun] ${oda.kod} — Bitiş: ${kazananGrup} kazandı (Kaosçu bireysel: ${kaoscuBireyKazananlar.length})`);
}

// ─── Fobik Kanal Üyeleri ─────────────────────────────────────
// ─── Trans Kanal Yardımcıları ────────────────────────────────

// Odada Transseksüel rolüne sahip oyuncuyu bulur
function transseksuelBul(oda) {
  if (!oda.oyun?.roller) return null;
  for (const oyuncu of oda.players) {
    const rol = oda.oyun.roller.get(oyuncu.id);
    if (rol?.id === 'transseksuel') return oyuncu;
  }
  return null;
}

// Bir oyuncu köyden ayrılınca → ayrılanlar odasına al, Trans'ı da socket odasına ekle
// Ayrılan oyuncuyu 'ayrilan' socket odasına ekle (chat'in 'ayrilan' kanal mesajları için)
function ayrilanlarOdasinaAl(oda, ayrilanOyuncu) {
  const ayrilanSocket = io.sockets.sockets.get(ayrilanOyuncu.id);
  if (ayrilanSocket) ayrilanSocket.join(oda.kod + ':ayrilan');

  // Trans rolü zaten oyun başında socket odasına ekleniyor; yine de garantiye al
  const trans = transseksuelBul(oda);
  if (trans) {
    const transSocket = io.sockets.sockets.get(trans.id);
    if (transSocket) transSocket.join(oda.kod + ':ayrilan');
  }

  console.log(`[ayrilan] ${oda.kod} — ${ayrilanOyuncu.isim} ayrılanlar kanalına alındı`);
}

function fobikMisin(oda, oyuncuId) {
  if (!oda.oyun?.roller) return false;
  const rol = oda.oyun.roller.get(oyuncuId);
  // Kaan (homofobik), Necmi (muhafazakar), Azra (erkek_dusmani) — prototip fobik kanalı
  return rol && ['homofobik', 'muhafazakar', 'erkek_dusmani'].includes(rol.id);
}

// ─── Bot Gece Aksiyonu ───────────────────────────────────────
function botlarGeceAksiyonYapsin(oda) {
  const aktif = oda.aktifOyuncular().filter(p => p.koydeMi !== false);
  oda.players.filter(p => p.bot && p.koydeMi !== false).forEach(bot => {
    const botAksiyon = oda.oyun.geceAksiyonlari.get(bot.id);
    if (!botAksiyon) return;

    setTimeout(() => {
      if (oda.faz !== 'gece') return;
      // Rastgele hedef seç (kendisi hariç)
      const adaylar = aktif.filter(p => p.id !== bot.id);
      if (adaylar.length === 0) return;
      const hedef = adaylar[Math.floor(Math.random() * adaylar.length)];
      botAksiyon.hedef1 = hedef.id;
      botAksiyon.gonderildi = true;

      const sayac = [...oda.oyun.geceAksiyonlari.values()].filter(a => a.gonderildi).length;
      io.to(oda.kod).emit('gece:aksiyonSayisi', { sayi: sayac });
    }, 3000 + Math.random() * 15000);
  });
}

// ─── Tüm prototip rollerini istemciye sun (LobiEkrani için, Madde 3) ───
const { ROLLER } = require('./roller.js');
const ROLLER_OZETI = ROLLER.map(r => ({
  id: r.id,
  ad: r.ad,
  grup: r.grup,
  karakter: r.karakter,
  yas: r.yas,
  meslek: r.meslek,
  motivasyon: r.motivasyon,
  geceAksiyonu: r.geceAksiyonu,
  kazanmaKosulu: r.kazanmaKosulu,
  gorsel: r.gorsel  // v1.6 — Madde 5: karakter portresi yolu
}));

// ─── Socket Bağlantıları ─────────────────────────────────────
io.on('connection', (socket) => {
  console.log(`[+] Bağlantı: ${socket.id}`);
  let mevcutOda = null;
  const oyuncuId = socket.id;

  socket.join(oyuncuId);

  // Madde 3: Lobi rol listesi
  socket.on('roller:listele', (_, callback) => {
    callback?.({ ok: true, roller: ROLLER_OZETI });
  });

  socket.on('oda:kur', ({ isim }, callback) => {
    if (!isim || !isim.trim()) return callback({ ok: false, hata: 'İsim boş olamaz' });
    const temizIsim = isim.trim().slice(0, 20);
    const kod = odaKoduUret();
    rooms[kod] = {
      kod, faz: 'lobi', oyun: null,
      players: [{ id: oyuncuId, isim: temizIsim, hostMu: true, baglantiVar: true }],
      olusturuldu: Date.now(),
      aktifOyuncular() { return this.players.filter(p => p.baglantiVar !== false); }
    };
    socket.join(kod);
    mevcutOda = kod;
    console.log(`[oda] Kuruldu: ${kod} (host: ${temizIsim})`);
    callback({ ok: true, kod, oyuncuId });
    lobiyiYayinla(kod);
  });

  socket.on('oda:katil', ({ kod, isim }, callback) => {
    const temizKod = String(kod || '').trim();
    if (!temizKod || !rooms[temizKod]) return callback({ ok: false, hata: 'Oda bulunamadı' });
    if (!isim || !isim.trim()) return callback({ ok: false, hata: 'İsim boş olamaz' });
    const oda = rooms[temizKod];
    if (oda.faz !== 'lobi') return callback({ ok: false, hata: 'Oyun başladı, katılınamaz' });
    if (oda.players.length >= 12) return callback({ ok: false, hata: 'Oda dolu (max 12)' });
    const temizIsim = isim.trim().slice(0, 20);
    if (oda.players.some(p => trKucult(p.isim) === trKucult(temizIsim))) {
      return callback({ ok: false, hata: 'Bu isimde biri zaten odada' });
    }
    oda.players.push({ id: oyuncuId, isim: temizIsim, hostMu: false, baglantiVar: true });
    // Madde 4: Oyuncu sayısı değişti — host'un özel dağılımı geçersiz olabilir, sıfırla
    // (kimlikAciklamaAdedi korunur)
    ozelDagilimiSifirla(oda);
    if (!oda.aktifOyuncular) oda.aktifOyuncular = function() { return this.players.filter(p => p.baglantiVar !== false); };
    socket.join(temizKod);
    mevcutOda = temizKod;
    console.log(`[oda] ${temizIsim} katıldı: ${temizKod} (${oda.players.length}/12)`);
    callback({ ok: true, kod: temizKod, oyuncuId });
    lobiyiYayinla(temizKod);
  });

  socket.on('oda:ayril', () => {
    if (!mevcutOda || !rooms[mevcutOda]) return;
    const oda = rooms[mevcutOda];
    const ayrilan = oyuncuyuBul(oda, oyuncuId);

    // v1.3 — Master §15: Oyun başladıysa "Oyundan Çık" = köyden ayrılma
    // (oyuncuyu listeden silmek yerine koydeMi=false yap, sistem mesajı + kontroller)
    if (oda.faz !== 'lobi' && ayrilan && ayrilan.koydeMi !== false) {
      ayrilan.koydeMi = false;
      ayrilan.baglantiVar = false;
      ayrilan.ayrilmaSebebi = 'kendi'; // "köyden gönderildi" değil, kendi isteği
      ayrilan.ayrildigGunduz = oda.oyun?.geceTuru || 0;

      // Sistem mesajı: sohbette herkese duyuru
      sistemMesaji(oda, `🚪 ${ayrilan.isim} oyundan ayrıldı.`);

      // Ayrılanlar kanalına da ekle (Trans + ayrılanlar sohbet için)
      ayrilanlarOdasinaAl(oda, ayrilan);

      // Liste güncellensin
      oyuncuListesiYayinla(oda);

      // Master §15 helper'ları: host transfer + erken bitiş kontrolü
      hostuTransferEt(oda);
      lobiyiYayinla(oda.kod);
      const kazanan = kazananGrupBul(oda)
        || (!gercekOyuncuKoydeMi(oda) ? erkenBitisKazanani(oda) : null);
      if (kazanan) {
        if (!gercekOyuncuKoydeMi(oda)) {
          sistemMesaji(oda, `Köyde gerçek oyuncu kalmadı — oyun otomatik sonlandırılıyor.`);
        }
        setTimeout(() => bitiseBasla(oda, kazanan), 1500);
      }

      console.log(`[oyun] ${oda.kod} — ${ayrilan.isim} oyundan ayrıldı (koydeMi=false)`);

      socket.leave(mevcutOda);
      mevcutOda = null;
      return;
    }

    // Lobi senaryosu: oyuncuyu listeden tamamen sil (eski davranış)
    oda.players = oda.players.filter(p => p.id !== oyuncuId);
    // Madde 4: Oyuncu sayısı değişti — host'un özel dağılımı geçersiz olabilir, sıfırla
    // (kimlikAciklamaAdedi korunur)
    ozelDagilimiSifirla(oda);
    if (oda.players.length === 0 || oda.players.every(p => p.bot)) {
      // Tüm gerçek oyuncular gittiyse odayı kapat
      oda.oyun?.fazTimerleri?.forEach(t => clearTimeout(t));
      delete rooms[mevcutOda];
      console.log(`[oda] ${mevcutOda} silindi`);
    } else {
      if (ayrilan?.hostMu) {
        // Yeni host: ilk gerçek oyuncu (bot olmayan)
        const yeniHost = oda.players.find(p => !p.bot);
        if (yeniHost) yeniHost.hostMu = true;
      }
      lobiyiYayinla(mevcutOda);
    }
    socket.leave(mevcutOda);
    mevcutOda = null;
  });

  // ─ Bot ekle/sil (host) ─
  socket.on('bot:ekle', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false, hata: 'Oda yok' });
    const oda = rooms[mevcutOda];
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu?.hostMu) return callback?.({ ok: false, hata: 'Sadece host bot ekleyebilir' });
    const sonuc = botEkle(oda);
    callback?.(sonuc);
    if (sonuc.ok) lobiyiYayinla(oda.kod);
  });

  socket.on('bot:sil', ({ botId }) => {
    if (!mevcutOda || !rooms[mevcutOda]) return;
    const oda = rooms[mevcutOda];
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu?.hostMu) return;
    const sonuc = botSil(oda, botId);
    if (sonuc.ok) lobiyiYayinla(oda.kod);
  });

  // ─ Lobi durumu (mount sonrası senkronizasyon) ─────────
  socket.on('lobi:durumIste', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'lobi') return callback?.({ ok: false });
    callback?.({ ok: true, durum: lobiDurumu(oda) });
  });

  // Madde 4 (A) — Host özel grup dağılımı belirleyebilir (roller gizli kalır)
  // dagilim: { ozgurlukcu, tarafsiz, gelenekci } veya null (önerilene dön)
  // Toplam oyuncu sayısı ile eşleşmeli; gelenekci >= 1 (Kaan zorunlu).
  // v1.7 — Host ayrıca Tanışma'da kaç kişinin kimlik açıklayacağını seçer (0-3)
  socket.on('lobi:ayar', (payload, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false, hata: 'Oda yok' });
    const oda = rooms[mevcutOda];
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu?.hostMu) return callback?.({ ok: false, hata: 'Sadece host ayar yapabilir' });
    if (oda.faz !== 'lobi') return callback?.({ ok: false, hata: 'Oyun zaten başladı' });

    const ayarlar = ayarlariNormalize(oda);
    const p = payload || {};
    const dagilimVar = Object.prototype.hasOwnProperty.call(p, 'dagilim');
    const kimlikVar = Object.prototype.hasOwnProperty.call(p, 'kimlikAciklamaAdedi');

    // ─ Dağılım (eski davranış korunur) ─
    if (dagilimVar) {
      const dagilim = p.dagilim;
      if (dagilim === null || dagilim === undefined) {
        ayarlar.dagilim = null;
      } else {
        const ozg = Number(dagilim.ozgurlukcu);
        const tar = Number(dagilim.tarafsiz);
        const gel = Number(dagilim.gelenekci);
        if ([ozg, tar, gel].some(n => !Number.isInteger(n) || n < 0)) {
          return callback?.({ ok: false, hata: 'Geçersiz sayı' });
        }
        if (gel < 1) {
          return callback?.({ ok: false, hata: 'En az 1 gelenekçi olmalı (Kaan zorunlu)' });
        }
        const toplam = ozg + tar + gel;
        if (toplam !== oda.players.length) {
          return callback?.({ ok: false, hata: `Toplam ${oda.players.length} olmalı (şu an ${toplam})` });
        }
        ayarlar.dagilim = { ozgurlukcu: ozg, tarafsiz: tar, gelenekci: gel };
      }
    }

    // ─ Kimlik açıklama adedi (v1.7) ─
    if (kimlikVar) {
      const n = Number(p.kimlikAciklamaAdedi);
      if (!Number.isInteger(n) || n < 0 || n > 3) {
        return callback?.({ ok: false, hata: 'Kimlik açıklama adedi 0-3 arası olmalı' });
      }
      ayarlar.kimlikAciklamaAdedi = n;
    }

    lobiyiYayinla(oda.kod);
    callback?.({ ok: true });
  });

  socket.on('oyun:baslat', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false, hata: 'Oda bulunamadı' });
    const oda = rooms[mevcutOda];
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu?.hostMu) return callback?.({ ok: false, hata: 'Sadece host başlatabilir' });
    if (oda.faz !== 'lobi') return callback?.({ ok: false, hata: 'Oyun zaten başlamış' });
    if (oda.players.length < 4) return callback?.({ ok: false, hata: 'En az 4 oyuncu gerekli' });
    if (oda.players.length > 12) return callback?.({ ok: false, hata: 'En fazla 12 oyuncu' });
    try {
      oyunuBaslat(oda);
      callback?.({ ok: true });
    } catch (e) {
      console.error('[oyun] Başlatma hatası:', e.message);
      callback?.({ ok: false, hata: e.message });
    }
  });

  socket.on('rol:onayla', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'rol_dagitimi') return callback?.({ ok: false });
    oda.oyun.rolOnaylari.add(oyuncuId);
    callback?.({ ok: true });
    rolOnayKontrol(oda);
  });

  // ─ Tanışma durumunu sorgula (mount sonrası senkronizasyon) ─
  socket.on('tanisma:durumIste', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'tanisma') return callback?.({ ok: false });
    const ayarlarBilgi = ayarlariNormalize(oda);
    callback?.({
      ok: true,
      altFaz: oda.altFaz,
      sonZaman: oda.fazSonZaman,
      aciklanmislar: aciklananKimlikler(oda),
      chat: chatGecmisi(oda, oyuncuId),
      basvuruSayisi: oda.oyun.basvuranlar.size,
      basvurdumMu: oda.oyun.basvuranlar.has(oyuncuId),
      oyuncular: oyuncuListesi(oda, oyuncuId),
      kimlikAciklamaAdedi: ayarlarBilgi.kimlikAciklamaAdedi
    });
  });

  // Tek chat:gonder — kanal otomatik seçilir (Madde 3-4-5-11-12)
  socket.on('chat:gonder', ({ metin }, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (!oda.oyun) return callback?.({ ok: false });
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu) return callback?.({ ok: false });
    const temizMetin = String(metin || '').trim().slice(0, 280);
    if (!temizMetin) return callback?.({ ok: false });

    const rol = oda.oyun.roller?.get(oyuncuId);
    const ayrilan = oyuncu.koydeMi === false;

    // ─ Ayrılan oyuncular: kendi aralarında 'ayrilan' kanalına yazar (Madde 12)
    if (ayrilan) {
      oyuncuMesaji(oda, oyuncu, temizMetin, 'ayrilan');
      return callback?.({ ok: true });
    }

    // ─ Trans rolü köydeyken: gece sırasında ayrılanlarla yazışabilir
    //   Diğer fazlarda köy kanalında konuşur.
    if (rol?.id === 'transseksuel' && oda.faz === 'gece') {
      oyuncuMesaji(oda, oyuncu, temizMetin, 'ayrilan');
      return callback?.({ ok: true });
    }

    // ─ Gece: sadece fobikler 'fobik' kanalda yazışır
    if (oda.faz === 'gece') {
      if (!fobikMisin(oda, oyuncuId)) {
        return callback?.({ ok: false, hata: 'Köy uyuyor — şu an yazamazsın' });
      }
      oyuncuMesaji(oda, oyuncu, temizMetin, 'fobik');
      return callback?.({ ok: true });
    }

    // ─ Savunma: sadece savunulan oyuncu yazabilir (Madde 11)
    if (oda.faz === 'savunma') {
      const savunulanId = oda.oyun.birInciOylamaSonuc?.hedef;
      if (oyuncuId !== savunulanId) {
        return callback?.({ ok: false, hata: 'Şu an sadece savunulan oyuncu yazabilir' });
      }
      oyuncuMesaji(oda, oyuncu, temizMetin, 'koy');
      return callback?.({ ok: true });
    }

    // ─ Diğer "konuşulabilir" fazlar (gündüz):
    const izinliFazlar = ['tanisma', 'tartisma', 'oylama_1', 'oylama_2', 'oylama_tartisma', 'oylama_sonuc', 'sabah'];
    if (!izinliFazlar.includes(oda.faz)) {
      return callback?.({ ok: false, hata: 'Şu an mesaj atılamaz' });
    }

    // V1 Kaosçu — Bora "Bozuk Sipariş": hedef bu gün ilk mesajını yazıyorsa
    // 30 saniye gecikmeli iletilir. Sadece İLK mesaj geciktirilir; flag tek
    // kullanımlık (boraGecikmeIlkMesaj Set'inden çıkar). Bora etkisi her gün
    // başlangıcında (geceyeBasla yerine yeni gün başladığında) yeniden uygulanır;
    // Set'ler geceyeBasla'da temizleniyor — yani gecede uygulanan etki ertesi
    // gündüz (tanışma + tartışma) içinde geçerli.
    if (oda.oyun.boraGecikme?.has(oyuncuId)
        && oda.oyun.boraGecikmeIlkMesaj?.has(oyuncuId)) {
      // İlk mesaj flag'ini hemen temizle (yeniden bekletmeyelim)
      oda.oyun.boraGecikmeIlkMesaj.delete(oyuncuId);
      // Hedefe info — UI mesajın "gönderildi ama gecikecek" göstersin
      callback?.({ ok: true, gecikme: 30000, sebep: 'Bozuk Sipariş etkisi' });
      // 30 sn sonra mesajı yayınla. Faz değişmiş olabilir; en azından mesajın
      // o gün içinde iletilmesini garanti edelim (faz kontrolü yok bilerek —
      // mesaj zaten "şu an" izinli fazda yazılmıştı, sonradan gece geçse bile
      // mesaj kayıtlı tutulur). Köy uyandığında gecikmeli mesajı kayda almak
      // pratik açıdan en az şaşırtıcı yol.
      setTimeout(() => {
        oyuncuMesaji(oda, oyuncu, temizMetin, 'koy');
      }, 30000);
      return;
    }

    oyuncuMesaji(oda, oyuncu, temizMetin, 'koy');
    callback?.({ ok: true });
  });

  socket.on('tanisma:basvur', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'tanisma' || oda.altFaz !== 'basvuru') {
      return callback?.({ ok: false, hata: 'Başvuru penceresi kapalı' });
    }
    if (oda.oyun.aciklanmislar.has(oyuncuId)) {
      return callback?.({ ok: false, hata: 'Kimliğin zaten açık' });
    }
    // V1 Kaosçu — Okan "Spotlight": bu turda spotlight'ta olan oyuncu kimlik
    // açıklama başvurusu yapamaz. Set geceyeBasla → yeni gece başında temizlenir,
    // yani sadece "spotlight uygulandıktan sonraki ilk tanışma" için geçerli.
    if (oda.oyun.okanSpotlightHedef?.has(oyuncuId)) {
      return callback?.({ ok: false, hata: 'Bu turda spotlight altındasın — kimliğini açıklayamazsın.' });
    }
    const yeni = !oda.oyun.basvuranlar.has(oyuncuId);
    oda.oyun.basvuranlar.add(oyuncuId);
    callback?.({ ok: true });
    if (yeni) {
      io.to(oda.kod).emit('tanisma:basvuruDurumu', { sayi: oda.oyun.basvuranlar.size });
      sistemMesaji(oda, `${oda.oyun.basvuranlar.size} kişi kimliğini açmak için başvurdu.`);
    }
  });

  socket.on('tanisma:basvuruGeriCek', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'tanisma' || oda.altFaz !== 'basvuru') return callback?.({ ok: false });
    const vardı = oda.oyun.basvuranlar.delete(oyuncuId);
    callback?.({ ok: true });
    if (vardı) {
      io.to(oda.kod).emit('tanisma:basvuruDurumu', { sayi: oda.oyun.basvuranlar.size });
    }
  });

  socket.on('tanisma:hazir', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'tanisma' || oda.altFaz !== 'serbest') {
      return callback?.({ ok: false, hata: 'Henüz hazır olamazsın' });
    }
    oda.oyun.hazirOlanlar.add(oyuncuId);
    callback?.({ ok: true });
    // Bug #7: Tüm gerçek oyuncular hazırsa botları anında doldur
    gercekHazirsaBotlariDoldur(oda, 'tanisma', () => hazirKontrol(oda));
    hazirKontrol(oda);
  });

  socket.on('tanisma:hazirGeriCek', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'tanisma' || oda.altFaz !== 'serbest') return callback?.({ ok: false });
    oda.oyun.hazirOlanlar.delete(oyuncuId);
    callback?.({ ok: true });
    io.to(oda.kod).emit('tanisma:hazirDurumu', {
      hazir: oda.oyun.hazirOlanlar.size,
      toplam: oda.players.length
    });
  });

  // ─ Gece Aksiyonu ─────────────────────────────────────────
  socket.on('gece:durumIste', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'gece') return callback?.({ ok: false });

    const benimAksiyon = oda.oyun.geceAksiyonlari.get(oyuncuId);
    const gonderildi = benimAksiyon?.gonderildi || false;
    const aksiyonSayisi = [...oda.oyun.geceAksiyonlari.values()].filter(a => a.gonderildi).length;
    const aktifSayisi = oda.aktifOyuncular().filter(p => p.koydeMi !== false).length;

    // Fobik kanalı bu kişi görebilir mi?
    const fobikUyemiyim = fobikMisin(oda, oyuncuId);

    callback?.({
      ok: true,
      geceTuru: oda.oyun.geceTuru,
      sonZaman: oda.geceSonZaman,
      gonderildi,
      aksiyonSayisi,
      aktifSayisi,
      fobikUyemiyim,
      benimNotum: oda.oyun.geceNotlari.get(oyuncuId) || '',
      oyuncular: oyuncuListesi(oda, oyuncuId),
      chat: chatGecmisi(oda, oyuncuId)
    });
  });

  // Madde 1: Hedef süre sonuna kadar değiştirilebilir.
  // hedef1 null gönderilirse → seçim iptal (pas durumuna döner).
  socket.on('gece:aksiyon', ({ hedef1, hedef2 }, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false, hata: 'Oda yok' });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'gece') return callback?.({ ok: false, hata: 'Gece değil' });

    const benimAksiyon = oda.oyun.geceAksiyonlari.get(oyuncuId);
    if (!benimAksiyon) return callback?.({ ok: false, hata: 'Kayıt bulunamadı' });

    benimAksiyon.hedef1 = hedef1 || null;
    benimAksiyon.hedef2 = hedef2 || null;
    // gonderildi sadece ilk anlamlı seçimde true olur; iptal gelirse false'a düşer
    benimAksiyon.gonderildi = !!hedef1;

    const aksiyonSayisi = [...oda.oyun.geceAksiyonlari.values()].filter(a => a.gonderildi).length;
    const aktifSayisi = oda.aktifOyuncular().filter(p => p.koydeMi !== false).length;

    io.to(oda.kod).emit('gece:aksiyonSayisi', { sayi: aksiyonSayisi, toplam: aktifSayisi });
    callback?.({ ok: true });

    // Herkes seçim yaptıysa erken çöz
    if (aksiyonSayisi >= aktifSayisi) {
      oda.oyun.fazTimerleri.forEach(t => clearTimeout(t));
      oda.oyun.fazTimerleri = [];
      setTimeout(() => geceyiCoz(oda), 800);
    }
  });

  socket.on('gece:notGuncelle', ({ metin }, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (!oda.oyun?.geceNotlari) return callback?.({ ok: false });
    const temiz = String(metin || '').slice(0, 1000);
    oda.oyun.geceNotlari.set(oyuncuId, temiz);
    callback?.({ ok: true });
  });

  // v1.3 — Master §10: Ayrılan oyuncuların not defterleri tekrar açılabilir.
  // Kendi notunu veya köyden ayrılmış bir oyuncunun (ifşa olmuş) notunu getir.
  socket.on('not:getir', ({ hedefId }, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (!oda.oyun?.geceNotlari) return callback?.({ ok: false });

    const hedef = hedefId || oyuncuId;
    const hedefOyuncu = oyuncuyuBul(oda, hedef);
    if (!hedefOyuncu) return callback?.({ ok: false, hata: 'Oyuncu bulunamadı' });

    // Kendi notunu her zaman alabilir
    if (hedef === oyuncuId) {
      return callback?.({
        ok: true,
        isim: hedefOyuncu.isim,
        kendi: true,
        koydeMi: hedefOyuncu.koydeMi !== false,
        metin: oda.oyun.geceNotlari.get(hedef) || ''
      });
    }

    // Başkasının notu: yalnızca o oyuncu köyden ayrılmışsa (ifşa olduğu için)
    if (hedefOyuncu.koydeMi !== false) {
      return callback?.({ ok: false, hata: 'Bu oyuncu hâlâ köyde — notu görüntülenemez' });
    }
    const rol = oda.oyun.roller?.get(hedef);
    callback?.({
      ok: true,
      isim: hedefOyuncu.isim,
      kendi: false,
      koydeMi: false,
      rolAd: rol?.ad || null,
      grup: rol?.grup || null,
      metin: oda.oyun.geceNotlari.get(hedef) || ''
    });
  });

  // NOT: Eski `gece:fobikMesaj` event'i kaldırıldı.
  // Artık `chat:gonder` çağrısı kanal seçimini otomatik yapar:
  //   gece + fobik → 'fobik' kanalı, sadece fobikler görür.

  // ─ Sabah durumu (mount sonrası senkronizasyon) ──────────
  socket.on('sabah:durumIste', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'sabah') return callback?.({ ok: false });

    const benimSabah = oda.oyun.sabahKisisel?.get(oyuncuId);
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    callback?.({
      ok: true,
      benimSabah: benimSabah || null,
      herkeseSabah: oda.oyun.sabahHerkese || null,
      hostMu: oyuncu?.hostMu || false,
      chat: chatGecmisi(oda, oyuncuId),
      oyuncular: oyuncuListesi(oda, oyuncuId),
      sonZaman: oda.fazSonZaman || null
    });
  });

  // ─ Sabah → Tartışma veya Bitiş (host devam'a basar) ────
  socket.on('sabah:devam', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu?.hostMu) return callback?.({ ok: false, hata: 'Sadece host devam edebilir' });
    if (oda.faz !== 'sabah') return callback?.({ ok: false });

    // Kazanma kontrolü
    const kazanan = kazananGrupBul(oda);
    if (kazanan) {
      bitiseBasla(oda, kazanan);
    } else {
      tartismayaBasla(oda);
    }
    callback?.({ ok: true });
  });

  // ─ Tartışma: hazır / hazır geri çek ────────────────────
  socket.on('tartisma:hazir', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'tartisma') return callback?.({ ok: false });
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu || oyuncu.koydeMi === false) return callback?.({ ok: false });
    oda.oyun.hazirOlanlar.add(oyuncuId);
    callback?.({ ok: true });
    // Bug #7: Tüm gerçek oyuncular hazırsa botları anında doldur
    gercekHazirsaBotlariDoldur(oda, 'tartisma', () => tartismaHazirKontrol(oda));
    tartismaHazirKontrol(oda);
  });

  socket.on('tartisma:hazirGeriCek', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'tartisma') return callback?.({ ok: false });
    oda.oyun.hazirOlanlar.delete(oyuncuId);
    callback?.({ ok: true });
    const aktif = oda.players.filter(p => p.koydeMi !== false && p.baglantiVar !== false);
    io.to(oda.kod).emit('tartisma:hazirDurumu', {
      hazir: oda.oyun.hazirOlanlar.size,
      toplam: aktif.length
    });
  });

  // ─ Tartışma durumu (mount sonrası senkronizasyon) ──────
  socket.on('tartisma:durumIste', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'tartisma') return callback?.({ ok: false });
    const aktif = oda.players.filter(p => p.koydeMi !== false && p.baglantiVar !== false);
    callback?.({
      ok: true,
      sonZaman: oda.fazSonZaman,
      chat: chatGecmisi(oda, oyuncuId),
      hazirSayisi: oda.oyun.hazirOlanlar.size,
      hazirToplam: aktif.length,
      hazirMiyim: oda.oyun.hazirOlanlar.has(oyuncuId),
      oyuncular: oyuncuListesi(oda, oyuncuId)
    });
  });

  // ─ 1. Oylama: oy ver / geri çek ────────────────────────
  socket.on('oylama1:oyVer', ({ hedefId }, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'oylama_1') return callback?.({ ok: false, hata: 'Oylama aktif değil' });
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu || oyuncu.koydeMi === false) return callback?.({ ok: false });
    if (hedefId === oyuncuId) return callback?.({ ok: false, hata: 'Kendine oy verilemez' });
    const hedef = oyuncuyuBul(oda, hedefId);
    if (!hedef || hedef.koydeMi === false) return callback?.({ ok: false, hata: 'Geçersiz hedef' });

    // V1 Kaosçu — Hakan "Baskı Mesajı": baskılanan oyuncu yasaklı hedefe oy
    // veremez. Yasaklı hedef hâlâ köydeyse (aktif aday) kontrol etmek anlamlı.
    const yasakliHedef = oda.oyun.hakanYasakliOy?.get(oyuncuId);
    if (yasakliHedef && yasakliHedef === hedefId) {
      return callback?.({ ok: false, hata: 'Baskı mesajı: bu oyuncuya oy veremezsin.' });
    }

    // Necmi etkisi var mı? Etkiyi ham oy haritasını güncellerken uygulama — birInciOylamaBitti'de toplu yapılacak
    oda.oyun.oylar1.set(oyuncuId, hedefId);
    io.to(oda.kod).emit('oylama:guncellendi', oylarAnlikDurum(oda, oda.oyun.oylar1));
    callback?.({ ok: true });
  });

  socket.on('oylama1:oyGeriCek', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'oylama_1') return callback?.({ ok: false });
    oda.oyun.oylar1.delete(oyuncuId);
    io.to(oda.kod).emit('oylama:guncellendi', oylarAnlikDurum(oda, oda.oyun.oylar1));
    callback?.({ ok: true });
  });

  // ─ 2. Oylama: evet / hayır ──────────────────────────────
  socket.on('oylama2:oyVer', ({ karar }, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'oylama_2') return callback?.({ ok: false, hata: '2. oylama aktif değil' });
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu || oyuncu.koydeMi === false) return callback?.({ ok: false });
    if (!oda.oyun.birInciOylamaKatilimcilar?.has(oyuncuId))
      return callback?.({ ok: false, hata: '1. turda oy kullanmadın' });
    if (!['evet', 'hayir'].includes(karar)) return callback?.({ ok: false });

    oda.oyun.oylar2.set(oyuncuId, karar);
    io.to(oda.kod).emit('oylama2:guncellendi', {
      evet: [...oda.oyun.oylar2.values()].filter(v => v === 'evet').length,
      hayir: [...oda.oyun.oylar2.values()].filter(v => v === 'hayir').length,
      kullananlar: [...oda.oyun.oylar2.keys()]
    });
    callback?.({ ok: true });
  });

  // ─ Savunma: hazır butonu (sadece savunulan oyuncu basabilir) ─
  socket.on('savunma:hazir', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'savunma') return callback?.({ ok: false });
    const savunulanId = oda.oyun.birInciOylamaSonuc?.hedef;
    if (oyuncuId !== savunulanId) {
      return callback?.({ ok: false, hata: 'Sadece savunulan oyuncu hazır olabilir' });
    }
    oda.oyun.hazirOlanlar.add(oyuncuId);
    callback?.({ ok: true });
    savunmaHazirKontrol(oda, savunulanId);
  });

  // ─ Oylama_tartisma (2. tartışma): hazır / geri çek ──────
  socket.on('oylama_tartisma:hazir', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'oylama_tartisma') return callback?.({ ok: false });
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu || oyuncu.koydeMi === false) return callback?.({ ok: false });
    oda.oyun.hazirOlanlar.add(oyuncuId);
    callback?.({ ok: true });
    // Bug #7: Tüm gerçek oyuncular hazırsa botları anında doldur
    gercekHazirsaBotlariDoldur(oda, 'oylama_tartisma');
    const aktif = oda.players.filter(p => p.koydeMi !== false && p.baglantiVar !== false);
    io.to(oda.kod).emit('tartisma:hazirDurumu', { hazir: oda.oyun.hazirOlanlar.size, toplam: aktif.length });
    if (oda.oyun.hazirOlanlar.size >= aktif.length) tartismadanOylamaya(oda);
  });

  socket.on('oylama_tartisma:hazirGeriCek', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'oylama_tartisma') return callback?.({ ok: false });
    oda.oyun.hazirOlanlar.delete(oyuncuId);
    callback?.({ ok: true });
    const aktif = oda.players.filter(p => p.koydeMi !== false && p.baglantiVar !== false);
    io.to(oda.kod).emit('tartisma:hazirDurumu', { hazir: oda.oyun.hazirOlanlar.size, toplam: aktif.length });
  });

  // ─ Oylama Sonucu (Faz 7 sonrası 20sn): hazır / geri çek ──
  socket.on('oylama_sonuc:hazir', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'oylama_sonuc') return callback?.({ ok: false });
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu || oyuncu.koydeMi === false) return callback?.({ ok: false });
    oda.oyun.hazirOlanlar.add(oyuncuId);
    callback?.({ ok: true });
    // Bug #7: Tüm gerçek oyuncular hazırsa botları anında doldur
    gercekHazirsaBotlariDoldur(oda, 'oylama_sonuc', () => oylamaSonucuHazirKontrol(oda));
    oylamaSonucuHazirKontrol(oda);
  });

  socket.on('oylama_sonuc:hazirGeriCek', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'oylama_sonuc') return callback?.({ ok: false });
    oda.oyun.hazirOlanlar.delete(oyuncuId);
    callback?.({ ok: true });
    oylamaSonucuHazirKontrol(oda);
  });

  socket.on('oylama_sonuc:durumIste', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'oylama_sonuc') return callback?.({ ok: false });
    const aktif = oda.players.filter(p => p.koydeMi !== false && p.baglantiVar !== false);
    callback?.({
      ok: true,
      sonZaman: oda.fazSonZaman,
      sonuc: oda.oyun.oylamaSonucu || null,
      hazirSayisi: oda.oyun.hazirOlanlar.size,
      hazirToplam: aktif.length,
      hazirMiyim: oda.oyun.hazirOlanlar.has(oyuncuId),
      chat: chatGecmisi(oda, oyuncuId),
      oyuncular: oyuncuListesi(oda, oyuncuId)
    });
  });

  // ─ Oylama durumu (mount sonrası senkronizasyon) ─────────
  socket.on('oylama:durumIste', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (!['oylama_1', 'oylama_2', 'savunma', 'oylama_tartisma'].includes(oda.faz))
      return callback?.({ ok: false });

    const koydekiler = oda.players
      .filter(p => p.koydeMi !== false && p.baglantiVar !== false)
      .map(p => ({ id: p.id, isim: p.isim, bot: !!p.bot }));

    // V1 Kaosçu — Hakan yasak (sadece bu oyuncuya özel)
    const hakanYasakliId = oda.oyun.hakanYasakliOy?.get(oyuncuId) || null;
    callback?.({
      ok: true,
      faz: oda.faz,
      sonZaman: oda.fazSonZaman,
      koydekiler,
      oylarAnlik: oda.faz === 'oylama_1' ? oylarAnlikDurum(oda, oda.oyun.oylar1 || new Map()) : null,
      benimOyum1: oda.oyun.oylar1?.get(oyuncuId) || null,
      savunulanId: oda.oyun.birInciOylamaSonuc?.hedef || null,
      savunulanIsim: oda.oyun.birInciOylamaSonuc?.hedef
        ? oyuncuyuBul(oda, oda.oyun.birInciOylamaSonuc.hedef)?.isim : null,
      katilabilirMiyim: oda.oyun.birInciOylamaKatilimcilar?.has(oyuncuId) || false,
      benimOyum2: oda.oyun.oylar2?.get(oyuncuId) || null,
      hakanYasakliId,
      chat: chatGecmisi(oda, oyuncuId),
      hazirMiyim: oda.oyun.hazirOlanlar?.has(oyuncuId) || false,
      oyuncular: oyuncuListesi(oda, oyuncuId)
    });
  });

  // ─ Ayrılan/Trans kanalı: artık `chat:gonder` kanal seçimini halleder ──
  // Eski `ayrilanlar:mesajGonder` ve `ayrilanlar:durumIste` kaldırıldı.
  // Trans rolü oyun başlarken socket odasına eklenmeli (mesaj alabilmek için):
  socket.on('trans:odayaKatil', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    const trans = transseksuelBul(oda);
    if (!trans || trans.id !== oyuncuId) return callback?.({ ok: false });
    socket.join(oda.kod + ':ayrilan');
    callback?.({ ok: true });
  });

  // ─ Bitiş durumu (mount sonrası senkronizasyon) ─────────
  socket.on('bitis:durumIste', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    if (oda.faz !== 'bitis') return callback?.({ ok: false });
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    callback?.({
      ok: true,
      ...oda.oyun.bitis,
      hostMu: oyuncu?.hostMu || false
    });
  });

  // ─ Yeni oyun (host) ────────────────────────────────────
  socket.on('oyun:yeniOyun', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false });
    const oda = rooms[mevcutOda];
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu?.hostMu) return callback?.({ ok: false, hata: 'Sadece host yeni oyun başlatabilir' });
    if (oda.faz !== 'bitis') return callback?.({ ok: false });

    // Lobi durumuna sıfırla
    oda.faz = 'lobi';
    oda.oyun = null;
    oda.altFaz = null;
    oda.fazSonZaman = null;
    oda.geceSonZaman = null;
    oda.players.forEach(p => {
      p.koydeMi = true;
      p.ayrildigGece = null;
    });

    callback?.({ ok: true });
    io.to(oda.kod).emit('faz:degisti', { faz: 'lobi' });
    lobiyiYayinla(oda.kod);
    console.log(`[oyun] ${oda.kod} — Yeni oyuna lobiye dönüldü`);
  });

  socket.on('disconnect', () => {
    console.log(`[-] Kopuş: ${socket.id}`);
    if (!mevcutOda || !rooms[mevcutOda]) return;
    const oda = rooms[mevcutOda];

    if (oda.faz === 'lobi') {
      const ayrilan = oyuncuyuBul(oda, oyuncuId);
      oda.players = oda.players.filter(p => p.id !== oyuncuId);
      if (oda.players.length === 0 || oda.players.every(p => p.bot)) {
        delete rooms[mevcutOda];
        console.log(`[oda] ${mevcutOda} silindi`);
      } else {
        if (ayrilan?.hostMu) {
          const yeniHost = oda.players.find(p => !p.bot);
          if (yeniHost) yeniHost.hostMu = true;
        }
        lobiyiYayinla(mevcutOda);
      }
    } else {
      const oyuncu = oyuncuyuBul(oda, oyuncuId);
      if (oyuncu) {
        oyuncu.baglantiVar = false;
        console.log(`[oda] ${oyuncu.isim} bağlantısı koptu (oyun devam)`);
      }
    }
  });
});

app.get('/saglik', (_, res) => {
  res.json({ ok: true, odaSayisi: Object.keys(rooms).length });
});

// Production: client/dist klasörünü static olarak serve et, geri kalan tüm
// GET isteklerini SPA index.html'e yönlendir (Railway tek-port dağıtımı için).
// Express 5: wildcard '*' yerine regex /.*/  kullanılır.
if (process.env.NODE_ENV === 'production') {
  const istemciDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(istemciDist));
  app.get(/.*/, (_, res) => {
    res.sendFile(path.join(istemciDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`\n🌿 Queer Quest Quench sunucusu hazır`);
  console.log(`   http://localhost:${PORT}\n`);
});
