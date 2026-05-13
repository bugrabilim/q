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
const SURE_BASVURU = Number(process.env.Q_BASVURU_MS || 10_000);
const SURE_TANISMA = Number(process.env.Q_TANISMA_MS || 30_000);

const rooms = {};

function odaKoduUret() {
  for (let deneme = 0; deneme < 100; deneme++) {
    const kod = String(Math.floor(10000 + Math.random() * 90000));
    if (!rooms[kod]) return kod;
  }
  throw new Error('Oda kodu üretilemedi');
}

function lobiDurumu(oda) {
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
    minOyuncu: 6,
    maxOyuncu: 12
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

function aciklananKimlikler(oda) {
  if (!oda.oyun) return {};
  const sonuc = {};
  for (const id of oda.oyun.aciklanmislar) {
    const rol = oda.oyun.roller.get(id);
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
    const rol = oda.oyun?.roller?.get(p.id);
    let rolBilgi = null;
    if (rol) {
      const ifsa = oda.oyun?.aciklanmislar?.has(p.id) || p.koydeMi === false;
      if (benAyrilanmiyim || ifsa) {
        rolBilgi = { id: rol.id, ad: rol.ad, grup: rol.grup };
      }
    }
    return {
      id: p.id,
      isim: p.isim,
      koydeMi: p.koydeMi !== false,
      baglantiVar: p.baglantiVar !== false,
      bot: !!p.bot,
      hostMu: !!p.hostMu,
      rol: rolBilgi
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

// ─── Bot Konuşma Havuzları (Madde 13) ────────────────────────
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

const BOT_SUPHE = [
  '{X} bana garip geliyor.',
  '{X} biraz fazla sessiz, ne diyorsunuz?',
  '{X} çok aktif, dikkatimi çekiyor.',
  '{X} dürüst görünüyor ama emin olamıyorum.',
  '{X}\'i izliyorum, garip bir şey yok.',
  '{X} hakkında bir fikrim yok henüz.',
  '{X} ile ilgili tedirginim.',
  '{X}\'in söylediklerine güvenebilir miyiz?'
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
  'Hiçbir fikrim yok.'
];

const BOT_GECE_NOT = [
  'Sessiz bir gece geçirdim.',
  'Şüpheli kişiler var ama emin değilim.',
  'Etrafımda gariplik vardı.',
  'Bekliyorum, sabredeyim.',
  'Hiçbir şey görmedim.',
  'Bu gece dikkatli olmalıyım.',
  'Yarın daha çok konuşmalıyım.',
  'Bir şeyler değişiyor gibi.'
];

// İzinli (botların yazabileceği) gündüz fazları
const BOT_KONUSMA_FAZLARI = ['tanisma', 'sabah', 'tartisma', 'oylama_tartisma', 'oylama_sonuc'];

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
      metin = BOT_KONUSMA[Math.floor(Math.random() * BOT_KONUSMA.length)];
    }
  } else {
    metin = BOT_KONUSMA[Math.floor(Math.random() * BOT_KONUSMA.length)];
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

  const metin = (gelenMesaj.metin || '').toLowerCase();
  const soruVar = metin.includes('?');

  // Bot ismi geçiyor mu?
  const aktifBotlar = oda.players.filter(p => p.bot && p.koydeMi !== false);
  if (aktifBotlar.length === 0) return;

  let hedefBot = aktifBotlar.find(b => metin.includes(b.isim.toLowerCase()));

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
  const kullanilanIsimler = new Set(oda.players.map(p => p.isim.toLowerCase()));
  const uygunIsim = BOT_ISIMLERI.find(n => !kullanilanIsimler.has(n.toLowerCase()));
  if (!uygunIsim) return { ok: false, hata: 'Daha fazla bot ismi yok' };

  const botId = 'bot-' + (++botIdSayaci) + '-' + Math.random().toString(36).slice(2, 6);
  oda.players.push({
    id: botId,
    isim: uygunIsim,
    hostMu: false,
    baglantiVar: true,
    bot: true
  });

  console.log(`[bot] ${uygunIsim} eklendi → ${oda.kod} (${oda.players.length}/12)`);
  return { ok: true, botId };
}

function botSil(oda, botId) {
  const oyuncu = oyuncuyuBul(oda, botId);
  if (!oyuncu?.bot) return { ok: false, hata: 'Bot bulunamadı' };
  oda.players = oda.players.filter(p => p.id !== botId);
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

// ─── Oyun Başlatma ───────────────────────────────────────────
function oyunuBaslat(oda) {
  const dagilim = rolleriDagit(oda.players);

  oda.faz = 'rol_dagitimi';
  oda.oyun = {
    roller: dagilim,
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
    geceNotlari: new Map()
  };

  oda.players.forEach(p => {
    const rol = dagilim.get(p.id);
    // Botlara rol kartı göndermeye gerek yok ama göndersek de zarar vermez
    if (!p.bot) {
      io.to(p.id).emit('rol:kart', {
        rol: {
          id: rol.id, ad: rol.ad, grup: rol.grup,
          karakter: rol.karakter, yas: rol.yas, meslek: rol.meslek,
          motivasyon: rol.motivasyon, geceAksiyonu: rol.geceAksiyonu,
          kazanmaKosulu: rol.kazanmaKosulu
        }
      });
    }
  });

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'rol_dagitimi',
    oyuncuSayisi: oda.players.length
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

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'tanisma',
    altFaz: 'basvuru',
    sure: SURE_BASVURU,
    sonZaman,
    aciklanmislar: aciklananKimlikler(oda),
    chat: oda.oyun.chat
  });

  sistemMesaji(oda, 'Köyde sabah oldu. Tanışma vakti — kimliğini açıklamak isteyen başvurabilir.');
  console.log(`[oyun] ${oda.kod} — Faz 4 başladı (başvuru penceresi)`);

  const t1 = setTimeout(() => basvuruKapat(oda), SURE_BASVURU);
  oda.oyun.fazTimerleri.push(t1);

  // Botlar belki başvurur
  botlarBasvurabilir(oda);
}

function basvuruKapat(oda) {
  if (oda.faz !== 'tanisma' || oda.altFaz !== 'basvuru') return;

  const basvuranIdleri = [...oda.oyun.basvuranlar];
  const basvuranIsimleri = basvuranIdleri.map(id => oyuncuyuBul(oda, id)?.isim).filter(Boolean);

  if (basvuranIdleri.length > 0) {
    sistemMesaji(oda, `Başvuranlar: ${basvuranIsimleri.join(', ')}`);

    const secilenId = basvuranIdleri[Math.floor(Math.random() * basvuranIdleri.length)];
    const secilen = oyuncuyuBul(oda, secilenId);
    const rol = oda.oyun.roller.get(secilenId);

    oda.oyun.aciklanmislar.add(secilenId);

    setTimeout(() => sistemMesaji(oda, `Köy meydanına çıkıyor: ${secilen.isim}`), 600);

    setTimeout(() => {
      sistemMesaji(oda, `${secilen.isim}: "${rol.ad}'im."`);
      io.to(oda.kod).emit('kimlik:aciklandi', {
        oyuncuId: secilenId,
        isim: secilen.isim,
        rol: { ad: rol.ad, grup: rol.grup }
      });
      // Liste güncellensin (kimlik ifşa olduğu için rol artık herkes için görünür)
      oyuncuListesiYayinla(oda);
    }, 1600);

    setTimeout(() => serbesteSec(oda), 2400);

  } else {
    sistemMesaji(oda, 'Kimse kimliğini açmadı. Köy sessizce kahvaltıya oturdu.');
    setTimeout(() => serbesteSec(oda), 800);
  }
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
  // Belge §11 (Bug #2 / kural A): Her gün için ek tartışma hakkı 1 ile sınırlı —
  // yeni gece başlarken sayacı sıfırla.
  oda.oyun.tekrarTartismaYapildi = false;

  // Gece aksiyonları: her aktif oyuncu için boş kayıt (sadece köyde olanlar)
  oda.oyun.geceAksiyonlari = new Map();
  oda.aktifOyuncular()
    .filter(p => p.koydeMi !== false)
    .forEach(p => {
      oda.oyun.geceAksiyonlari.set(p.id, { hedef1: null, hedef2: null, gonderildi: false });
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
    ayrilanlar
  });

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

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'savunma',
    sure: SURE_SAVUNMA,
    sonZaman: oda.fazSonZaman,
    savunulanId,
    savunulanIsim: savunulan?.isim || '???'
  });

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

// Motor etkilerini (Necmi, Azra, DQ) uygular; ham oylar → işlenmiş oylar
function oylariBisle(oda, oylarHam) {
  const oyEtkileri = oda.oyun.oyEtkileri || new Map();
  const oylarSonuc = new Map(); // hedefId → oy sayısı (ağırlıklı)

  for (const [oyuncuId, hedefId] of oylarHam.entries()) {
    if (!hedefId) continue;

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
      const adaylar = aktif.filter(p => p.id !== bot.id);
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
      rol: { id: rol.id, ad: rol.ad, grup: rol.grup, karakter: rol.karakter }
    });
  }

  // Tarafsız bireysel kazananlar — prototipte koşul "oyun sonuna kalmak"
  const tarafsizKazananlar = tumRoller
    .filter(r => r.rol.grup === 'tarafsiz' && r.koydeMi)
    .map(r => ({ oyuncuId: r.oyuncuId, isim: r.isim, rolAd: r.rol.ad }));

  oda.oyun.bitis = {
    kazananGrup,
    tumRoller,
    tarafsizKazananlar,
    geceTuru: oda.oyun.geceTuru || 0
  };

  io.to(oda.kod).emit('faz:degisti', {
    faz: 'bitis',
    kazananGrup,
    tumRoller,
    tarafsizKazananlar,
    geceTuru: oda.oyun.geceTuru || 0
  });

  console.log(`[oyun] ${oda.kod} — Bitiş: ${kazananGrup} kazandı`);
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
  kazanmaKosulu: r.kazanmaKosulu
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
    if (oda.players.some(p => p.isim.toLowerCase() === temizIsim.toLowerCase())) {
      return callback({ ok: false, hata: 'Bu isimde biri zaten odada' });
    }
    oda.players.push({ id: oyuncuId, isim: temizIsim, hostMu: false, baglantiVar: true });
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
    oda.players = oda.players.filter(p => p.id !== oyuncuId);
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

  socket.on('oyun:baslat', (_, callback) => {
    if (!mevcutOda || !rooms[mevcutOda]) return callback?.({ ok: false, hata: 'Oda bulunamadı' });
    const oda = rooms[mevcutOda];
    const oyuncu = oyuncuyuBul(oda, oyuncuId);
    if (!oyuncu?.hostMu) return callback?.({ ok: false, hata: 'Sadece host başlatabilir' });
    if (oda.faz !== 'lobi') return callback?.({ ok: false, hata: 'Oyun zaten başlamış' });
    if (oda.players.length < 6) return callback?.({ ok: false, hata: 'En az 6 oyuncu gerekli' });
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
    callback?.({
      ok: true,
      altFaz: oda.altFaz,
      sonZaman: oda.fazSonZaman,
      aciklanmislar: aciklananKimlikler(oda),
      chat: chatGecmisi(oda, oyuncuId),
      basvuruSayisi: oda.oyun.basvuranlar.size,
      basvurdumMu: oda.oyun.basvuranlar.has(oyuncuId),
      oyuncular: oyuncuListesi(oda, oyuncuId)
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
      oyuncular: oyuncuListesi(oda, oyuncuId)
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
