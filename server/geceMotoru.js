// Queer Quest Quench — Gece Çözümleme Motoru
// Belge Bölüm 9 (Gece Aksiyonları) ve Bölüm 14 (Kenar Durumlar)
//
// Giriş: oda.oyun.geceAksiyonlari (Map: oyuncuId → { hedef1, hedef2, gonderildi })
//        oda.oyun.roller (Map: oyuncuId → rol objesi)
//        oda.players (oyuncu listesi)

// v1.8.30 — Dul (Fatma) gece aksiyonu için karakter anıları
const karakterAnilari = require('../client/src/veri/karakterAnilari.json');
//
// Çıkış: {
//   etkiler: { ayrilanlar: Set, oyEtkileri: Map(id → {...}), kaanGelecekGorevi },
//   kisiselSabah: Map(oyuncuId → { baslik, satirlar[] }),
//   herkeseSabah: [string]
// }

// Aksiyon önceliği (belge tablosu):
// 1. Engel (Gay → Gelenekçiye)
// 2. Transport (CD)
// 3. Koruma (DQ)
// 4. Uzaklaştırma (Kaan)
// 5. Diğer etkiler

const GRUP_AD = {
  ozgurlukcu: 'Özgürlükçü',
  tarafsiz: 'Tarafsız',
  gelenekci: 'Gelenekçi'
};

const GRUP_SEMBOL = {
  ozgurlukcu: '🟢',
  tarafsiz: '🟡',
  gelenekci: '🔴'
};

function geceyiCozumle(oda) {
  const ctx = kontextHazirla(oda);

  // Adım 0: Önce CD'nin "kim olarak görüneceğini" belirle (transport)
  // Bu adım, ziyaret eden rollerin "gerçekte kimi gördüğünü" hesaplar
  uygulaTransport(ctx);

  // Adım 1: Engel — Gay → Gelenekçi → o Gelenekçi'nin aksiyonu iptal
  uygulaGayEngel(ctx);

  // Adım 1.5a: Situationship karşılıklı iptal — Gay'den sonra, DQ'dan önce çalışmalı
  // çünkü "yapışılan" kişinin aksiyonu henüz işlenmeden iptalEdilen'e eklenebilmeli
  uygulaSituationshipIptal(ctx);

  // Adım 1.5b: Non-binary (Aren) maskeleme — Sit ile aynı katman (öncelik 1.5).
  // Karar (faz1-mekanik-kararlar.md #3 + Master Bölüm 9): Sit iptalinden SONRA çalışır;
  // böylece Sit'le iptal edilen Aren ise maskeleme uygulanmaz. Aren'in mekanik etkisi
  // araştıran rollerin çıktısını "?" yapmak — bilgi üreten rollerden ÖNCE bitmiş olmalı.
  // Maskeleme aksiyonu iptal etmez; sadece görünürlük bulanır.
  uygulaArenMaskeleme(ctx);

  // Adım 2: Drag Queen koruma — Kaan'ın hedefi DQ tarafından korunduysa Kaan'ın aksiyonu boşa
  uygulaDQKoruma(ctx);

  // Adım 3: Kaan uzaklaştırma (transport ve koruma sonrası)
  // kaanGelecekGorevi varsa Hetero Erkek'in belirlediği hedef kullanılır
  uygulaKaanUzaklastirma(ctx);

  // Adım 4: Diğer Gelenekçi etkileri (oy manipülasyonu, oy iptali vb.)
  uygulaDigerGelenekci(ctx);

  // Adım 5: Tarafsız aksiyonlar (Hetero Erkek bilgi + Koca Karı)
  // NOT: Situationship iptal mekaniği Adım 1.5'te yapıldı; mesaj çıktıları burada
  uygulaTarafsizlar(ctx);

  // Adım 6: Bilgi rolleri (İnterseksüel, Ladyboy, + V1 yeni: Lezbiyen, Biseksüel, Panseksüel, Femboy)
  uygulaBilgiRolleri(ctx);

  // Adım 7: Drag Queen sahnelendirme bilgi/oy etkileri (Kaan iptal olmadıysa zaten 2'de hesaplandı)
  uygulaDQEtkileri(ctx);

  // Adım 8: Murat C (Bastırmış / Outsider) — sahte rolün başarılı cevabı.
  // Gerçek mekanik etki yok; Murat sahte rolünün arayüzüyle aksiyon gönderdi,
  // burada ona inandırıcı bir "görev başarılı" raporu üretiyoruz.
  uygulaMuratBastirmis(ctx);

  // Adım 8.5: Kaosçu roller (4 bireysel kazanma rolü).
  // Tümü öncelik 5 (Hakan öncelik 4 — uzaklaştırma sonrası oy manipülasyonu),
  // ancak fonksiyonel olarak Diğer Etkiler katmanıyla aynı zamanda işleyebilirler:
  // hiçbiri Gay engeli üzerinden iptal edilen aksiyonlardan bağımsız ÇIKTI üretmez.
  // Murat hedef Kaosçu rolünü asla görmez (sahte rol Özgürlükçü); Kaosçular Murat'ı
  // Özgürlükçü görür. Kaosçular birbirinin rolünü bilmez (ortak kanal yok).
  uygulaKaoscuNarsist(ctx);   // Okan — Spotlight (kimlik açıklama engeli + oy yönü)
  uygulaSadistBora(ctx);      // Bora — Bozuk Sipariş (aksilik notu + mesaj gecikme)
  uygulaSinirTanimaz(ctx);    // Erdem — İzinsiz Giriş (aksiyon metni + not defteri)
  uygulaZorbaHakan(ctx);      // Hakan — Baskı Mesajı (yasaklı oy)

  // Adım 9: Umay (Femboy) kümülatif aktif sayaç güncellemesi.
  // Her gece sonu: aksiyonu gönderilip hedef seçen oyuncu sayacı +1 alır.
  // Pas geçenler (gonderildi=false veya hedef yok) sayılmaz.
  // İptal edilen aksiyonlar da "aktif giriş" sayılır (oyuncu girişimde bulundu).
  guncelleKumulatifAktif(ctx);

  // Adım 10: Bu gecenin "aksiyon tipi" geçmişini kaydet.
  // Aseksüel (Irmak) bir SONRAKİ gece bu kaydı okuyup "önceki gece tipi"ni döner.
  guncelleAksiyonGecmisi(ctx);

  // Kaan girişimi olduysa (Gay engeli ile durdurulmuş olsa bile) baskı duyurusu
  if (ctx.kaanGirisimVardi && !ctx.herkeseSabah.includes('Köyde dün gece ekonomik baskı yapıldı.')) {
    ctx.herkeseSabah.push('Köyde dün gece ekonomik baskı yapıldı.');
  }

  // Sonuçları paketle
  return {
    etkiler: {
      ayrilanlar: ctx.ayrilanlar,
      oyEtkileri: ctx.oyEtkileri,
      kaanGelecekGorevi: ctx.kaanGelecekGorevi || null
    },
    kisiselSabah: ctx.kisiselSabah,
    herkeseSabah: ctx.herkeseSabah
  };
}

// ─── Bağlam hazırlığı ───────────────────────────────────────
function kontextHazirla(oda) {
  const ctx = {
    oda,
    roller: oda.oyun.roller,
    // Murat C: sahte rol haritası — araştıran roller hedef Murat ise sahte rolü görür
    sahteRoller: oda.oyun.sahteRoller || new Map(),
    aksiyonlar: oda.oyun.geceAksiyonlari,
    ozelCinsiyet: oda.oyun.karakterCinsiyetleri || new Map(),

    // Hedefin "görünen" karşılığı (transport sonrası)
    gercekHedef: new Map(),  // oyuncuId → ziyaret etse "kimi gördü gibi davranır"
    cdYerineKimGecti: new Map(), // CD id → seçtiği hedef id

    // İptal bayrakları
    iptalEdilen: new Set(), // bu kişilerin aksiyonu iptal (Gay engeli, Situationship vb.)

    // Aren (Non-binary) maskelemesi: o gece kimliği bulanıklaşan oyuncular.
    // Bu Set'teki oyuncular, araştıran rollerin (Gay/İnter/Lezbiyen/Ladyboy) çıktısında
    // rol/hedef bilgisi yerine "?" görür. Aksiyon iptal edilmez, sadece görünürlük bulanır.
    arenMaskeli: new Set(),

    // Çıktılar
    ayrilanlar: new Set(),
    oyEtkileri: new Map(),  // oyuncuId → { oyKati, oySayilmaz, otomatikHedefSahibi }
    kaanGelecekGorevi: null,

    kisiselSabah: new Map(),
    herkeseSabah: []
  };

  // Her aktif oyuncu için boş kişisel mesaj kaydı
  oda.players.forEach(p => {
    if (p.baglantiVar !== false) {
      ctx.kisiselSabah.set(p.id, { satirlar: [] });
    }
  });

  // ─── V1 yeni Tarafsız roller için kümülatif state Map'leri ─
  // Bu Map'ler oda.oyun üzerinde KALICI (gece boyu değil, oyun boyu) tutulur.
  // İlk gece null olabilir; her aksiyon fonksiyonu kendi Map'ini lazy-init eder.
  // (oyunuBaslat'ta zaten init ediliyor — burası savunma katmanı.)
  if (!oda.oyun.aksiyonGecmisi)        oda.oyun.aksiyonGecmisi = new Map();
  if (!oda.oyun.oylamaGecmisi)         oda.oyun.oylamaGecmisi = []; // [{gun, oylar:Map}]
  if (!oda.oyun.fetisistEtiketi)       oda.oyun.fetisistEtiketi = new Map();
  if (!oda.oyun.coplatanEslesmeleri)   oda.oyun.coplatanEslesmeleri = new Map();
  if (!oda.oyun.sbHediyeAlinanlar)     oda.oyun.sbHediyeAlinanlar = new Map();
  if (!oda.oyun.sdOySonuc)             oda.oyun.sdOySonuc = new Map();
  if (!oda.oyun.sdSonHedef)            oda.oyun.sdSonHedef = new Map();
  if (!oda.oyun.capkinTavlananlar)     oda.oyun.capkinTavlananlar = new Map();
  if (!oda.oyun.lbBagSayaci)           oda.oyun.lbBagSayaci = new Map();
  if (!oda.oyun.lbBagliCiftler)        oda.oyun.lbBagliCiftler = new Set();

  // ─── V1 yeni Gelenekçi rolleri için "ertesi gün" geçici state'leri ─
  // Bu Map'ler tek bir döngüde (gece → ertesi gün) yaşar; geceyeBasla() yeni
  // gece başında yenilerini hazırlamadan önce eski olanları sıfırlar.
  // Lazy-init (defansif): geceMotoru yarı yolda gelirse de güvenli erişim.
  if (!oda.oyun.sinanSavunmaKapali)    oda.oyun.sinanSavunmaKapali = new Set();
  if (!oda.oyun.yaseminKendineOy)      oda.oyun.yaseminKendineOy = new Set();
  if (!oda.oyun.huseyinPasYapilanlar)  oda.oyun.huseyinPasYapilanlar = new Set();
  if (!oda.oyun.oguzKadinHedefleri)    oda.oyun.oguzKadinHedefleri = new Set();

  // ─── V1 Kaosçu rolleri için state Map'leri (lazy-init) ──────
  // Geçici (ertesi gün döngüsü): okanSpotlightHedef, boraGecikme, boraGecikmeIlkMesaj,
  //   hakanYasakliOy. geceyeBasla() yeni gecede temizler.
  // Kümülatif (oyun boyu — kazanma izleme):
  //   okanSpotlightSayaci, boraHedefSayaci, boraGunSayaci, erdemOgrenilenHedefler,
  //   hakanYasakliTarihce, okanGoruldugKimlikler.
  if (!oda.oyun.okanSpotlightHedef)    oda.oyun.okanSpotlightHedef = new Set();
  if (!oda.oyun.okanSpotlightSayaci)   oda.oyun.okanSpotlightSayaci = new Map();
  if (!oda.oyun.okanGoruldugKimlikler) oda.oyun.okanGoruldugKimlikler = new Set();
  if (!oda.oyun.boraGecikme)           oda.oyun.boraGecikme = new Set();
  if (!oda.oyun.boraGecikmeIlkMesaj)   oda.oyun.boraGecikmeIlkMesaj = new Set();
  if (!oda.oyun.boraHedefSayaci)       oda.oyun.boraHedefSayaci = new Map();
  if (!oda.oyun.boraGunSayaci)         oda.oyun.boraGunSayaci = new Map();
  if (!oda.oyun.erdemOgrenilenHedefler) oda.oyun.erdemOgrenilenHedefler = new Map();
  if (!oda.oyun.hakanYasakliOy)        oda.oyun.hakanYasakliOy = new Map();
  if (!oda.oyun.hakanYasakliTarihce)   oda.oyun.hakanYasakliTarihce = new Map();

  return ctx;
}

// Rol id → aksiyon tipi haritası (Aseksüel "Sosyal medya stalk" için)
// "Önceki gece hedef ne tür aksiyon yapmış" sorusu: ziyaret / koruma / izleme /
// engelleme / pas. Rol semantiğine göre kabaca tasnif (kim/içerik değil sadece tür).
const ROL_AKSIYON_TIPI = {
  // engel
  homofobik: 'engelleme',
  // koruma
  drag_queen: 'koruma',
  non_binary: 'koruma',
  // izleme (bilgi)
  interseksuel: 'izleme',
  ladyboy: 'izleme',
  lezbiyen: 'izleme',
  biseksuel: 'izleme',
  panseksuel: 'izleme',
  femboy: 'izleme',
  aseksuel: 'izleme',
  mazosist: 'izleme',
  sinir_tanimaz: 'izleme',
  koca_kari: 'izleme',
  // ziyaret (diğer)
  // varsayılan: 'ziyaret'
};

function aksiyonTipiBul(rolId) {
  return ROL_AKSIYON_TIPI[rolId] || 'ziyaret';
}

// ─── Yardımcılar ────────────────────────────────────────────
function rolu(ctx, id) {
  return ctx.roller.get(id);
}

// Murat C: hedef Murat ise araştıran/inceleyen roller sahte rolünü görür.
// Sadece hedef yorumlama için kullanılır (kim olduğunu söyleme).
// Aktör tarafından yapılan handler tetikleme için rolu() kullanılmalıdır.
function gorunenHedefRolu(ctx, id) {
  return ctx.sahteRoller.get(id) || ctx.roller.get(id);
}

function isim(ctx, id) {
  const oyuncu = ctx.oda.players.find(p => p.id === id);
  return oyuncu?.isim || '?';
}

function aktifMi(ctx, id) {
  if (ctx.ayrilanlar.has(id)) return false;
  const oyuncu = ctx.oda.players.find(p => p.id === id);
  return oyuncu && oyuncu.baglantiVar !== false;
}

// Hedefini bulup, transport'u dikkate alarak "kim olarak görüldüğünü" döner
function gorunenHedef(ctx, hedefId) {
  return ctx.gercekHedef.get(hedefId) || hedefId;
}

// Birinin gönderdiği aksiyonu güvenli okur (gönderilmemişse null)
function aksiyonu(ctx, oyuncuId) {
  const a = ctx.aksiyonlar.get(oyuncuId);
  if (!a || !a.gonderildi) return null;
  if (ctx.iptalEdilen.has(oyuncuId)) return null;
  return a;
}

// Belirli rol id'li oyuncuları bul
function rolSahipleri(ctx, rolId) {
  const sonuc = [];
  for (const [pid, rol] of ctx.roller.entries()) {
    if (rol.id === rolId) sonuc.push(pid);
  }
  return sonuc;
}

function ekleSatir(ctx, oyuncuId, satir) {
  const kayit = ctx.kisiselSabah.get(oyuncuId);
  if (kayit) kayit.satirlar.push(satir);
}

// ─── 0. Transport (Crossdresser) ───────────────────────────
function uygulaTransport(ctx) {
  rolSahipleri(ctx, 'crossdresser').forEach(cdId => {
    const a = aksiyonu(ctx, cdId);
    if (!a || !a.hedef1) return;

    // CD seçtiği kişinin yerine geçer.
    // Diğer ziyaretler için CD = seçtiği kişi olarak görünür.
    ctx.cdYerineKimGecti.set(cdId, a.hedef1);
    ctx.gercekHedef.set(cdId, a.hedef1);
  });
}

// ─── 1. Gay engeli ─────────────────────────────────────────
function uygulaGayEngel(ctx) {
  rolSahipleri(ctx, 'gay').forEach(gayId => {
    const a = aksiyonu(ctx, gayId);
    if (!a || !a.hedef1) return;

    const hedefId = a.hedef1;
    // Murat C: Gay hedef Murat ise sahte rolü (Özgürlükçü) görür.
    // Gerçek mekanik etki için gerçek rol kullanılır.
    const gercekHedefRol = rolu(ctx, hedefId);
    const gorunenRol = gorunenHedefRolu(ctx, hedefId);
    if (!gercekHedefRol) return;

    if (gercekHedefRol.grup === 'gelenekci') {
      ctx.iptalEdilen.add(hedefId);
      ekleSatir(ctx, gayId, `${isim(ctx, hedefId)} bir Gelenekçi'ydi — gece aksiyonunu engelledin.`);

      // Eğer engellenen Kaan'sa, hedefi vardı ve iptal edildi → yine de "baskı" duyurusu
      if (gercekHedefRol.id === 'homofobik' && a.hedef1) {
        const kaanAks = ctx.aksiyonlar.get(hedefId);
        if (kaanAks?.gonderildi && kaanAks.hedef1) {
          ctx.kaanGirisimVardi = true;
        }
      }
    } else if (gercekHedefRol.grup === 'tarafsiz') {
      ctx.iptalEdilen.add(hedefId);
      ekleSatir(ctx, gayId, `${isim(ctx, hedefId)} bir Tarafsız'dı — bu geceki aksiyonunu engelledin.`);
    } else if (gercekHedefRol.grup === 'ozgurlukcu' || gercekHedefRol.grup === 'outsider') {
      // Outsider (Murat) Özgürlükçü olarak görünür; sahte rol adı raporlanır.
      // Aren maskelemesi: hedef bu gece maskeliyse rol adı "?" döner (grup belli ama rol değil).
      const rolAdi = maskeliMi(ctx, hedefId) ? '?' : gorunenRol.ad;
      ekleSatir(ctx, gayId, `${isim(ctx, hedefId)} bir Özgürlükçü — rolü: ${rolAdi}`);
    }

    // Hedef bildirimi (her durumda)
    ekleSatir(ctx, hedefId, 'Bu gece biri seni ziyaret etti.');
  });
}

// ─── 1.5 Situationship — erken iptal (karşılıklı koruma) ──
// Gay'den sonra, DQ'dan önce: yapışılan kişinin aksiyonu henüz işlenmedi
// Belge §9: "İkisinin de gece aksiyonu iptal olur."
function uygulaSituationshipIptal(ctx) {
  rolSahipleri(ctx, 'situationship').forEach(sitId => {
    // Daha önce aksiyonu iptal edildiyse (Gay engeli vb.) atla
    if (ctx.iptalEdilen.has(sitId)) return;
    const a = ctx.aksiyonlar.get(sitId);
    if (!a || !a.gonderildi || !a.hedef1) return;

    const hedefId = a.hedef1;
    // Murat C: Sit Murat'a yapışırsa Özgürlükçü görür → karşılıklı iptal devreye girer.
    // (Murat'ın aksiyonu zaten boşa düşeceği için bu iptal mekanik anlamda no-op,
    //  ama Sit'in aksiyonu da iptal olur — bu DOĞRU davranış: yapıştığı kişi Özg gibi.)
    const hedefRol = gorunenHedefRolu(ctx, hedefId);
    if (!hedefRol) return;

    // Kaan'a yapışırsa sadece rol öğrenir, iptal yok (ayrı işleniyor: uygulaTarafsizlar)
    if (hedefRol.id === 'homofobik') return;

    // Özgürlükçü veya Tarafsız'a yapışırsa → karşılıklı iptal
    if (hedefRol.grup === 'ozgurlukcu' || hedefRol.grup === 'tarafsiz') {
      // Situationship'in aksiyonunu iptal et
      ctx.iptalEdilen.add(sitId);
      // Hedefin aksiyonunu da iptal et (henüz işlenmedi — bu adımın amacı bu)
      ctx.iptalEdilen.add(hedefId);

      ekleSatir(ctx, sitId,
        `${isim(ctx, hedefId)}'e yapıştın. Karşılıklı koruma — ikisinin de gece aksiyonu iptal.`);
      ekleSatir(ctx, hedefId,
        `Bu gece biri sana yapıştı. Karşılıklı koruma — gece aksiyonun iptal oldu.`);
      console.log(`[motor] Situationship: ${isim(ctx, sitId)} ↔ ${isim(ctx, hedefId)} — karşılıklı iptal`);
    }
  });
}

// ─── 1.5b Non-binary (Aren) maskeleme ─────────────────────
// "Kimliği bulanıklaştırır" — hedef o gece araştıran rollere "?" görünür.
// Öncelik 1.5 (Sit ile aynı katman, karardan: bkz. faz1-mekanik-kararlar.md #3).
// Maskeleme aksiyonu iptal etmez; sadece görünürlük bulanır.
// - Gay rolü hedef Aren'in maskelediği biriyse, grup rengini söyler ama rol adını "?" verir.
// - İnter izlediği oyuncu maskeliyse "hedefi: ?" görür.
// - Ladyboy listesinde maskelenmiş oyuncu hareketleri "? → ?" görür.
// - Lezbiyen muayene ederse grup rengi "?" görür.
function uygulaArenMaskeleme(ctx) {
  rolSahipleri(ctx, 'non_binary').forEach(arenId => {
    const a = aksiyonu(ctx, arenId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    ctx.arenMaskeli.add(hedefId);
    ekleSatir(ctx, arenId,
      `${isim(ctx, hedefId)}'in kimliğini bu gece bulanıklaştırdın. Araştıran roller hedefini "?" olarak görecek.`);
    if (hedefId !== arenId) {
      ekleSatir(ctx, hedefId, 'Bu gece kimliğin bir gölgenin altına alındı.');
    }
  });
}

// Araştıran rol bir hedefi inceliyorsa, hedef Aren tarafından maskeliyse true döner.
function maskeliMi(ctx, hedefId) {
  return ctx.arenMaskeli.has(hedefId);
}

// ─── 2. DQ koruma — sadece Kaan'ın hedefini koru ───────────
function uygulaDQKoruma(ctx) {
  // Kaan'ın hedefini bul
  const kaanIdler = rolSahipleri(ctx, 'homofobik');
  if (kaanIdler.length === 0) return;
  const kaanId = kaanIdler[0];
  const kaanAks = aksiyonu(ctx, kaanId);

  rolSahipleri(ctx, 'drag_queen').forEach(dqId => {
    const a = aksiyonu(ctx, dqId);
    if (!a || !a.hedef1) return;

    const dqHedefId = a.hedef1;

    // Kaan bu kişiyi hedef almışsa korumaya gir
    if (kaanAks && kaanAks.hedef1) {
      const kaanGercekHedef = kaanAks.hedef1; // CD transport'u Kaan adımında işler
      if (kaanGercekHedef === dqHedefId) {
        // DQ koruma başarılı: Kaan'ın aksiyonu boşa
        ctx.iptalEdilen.add(kaanId);
        ctx.dqKorumaUygulandi = ctx.dqKorumaUygulandi || new Set();
        ctx.dqKorumaUygulandi.add(dqId);

        ekleSatir(ctx, dqId, `${isim(ctx, dqHedefId)}'i sahnelendirdin — Kaan'ın hedefiymiş, koruman tuttu.`);
        ekleSatir(ctx, dqHedefId, 'Bu gece sahneye çıkarıldın. Kaan\'dan korundun.');
        ekleSatir(ctx, kaanId, `Hedefin (${isim(ctx, dqHedefId)}) bu gece sahnedeymiş, görevin boşa çıktı.`);

        // Kaan girişimde bulundu — herkese duyuru
        ctx.herkeseSabah.push('Köyde dün gece ekonomik baskı yapıldı.');
      }
    }
  });
}

// ─── 3. Kaan uzaklaştırma ──────────────────────────────────
function uygulaKaanUzaklastirma(ctx) {
  const kaanIdler = rolSahipleri(ctx, 'homofobik');
  if (kaanIdler.length === 0) return;
  const kaanId = kaanIdler[0];

  // Hetero Erkek'in önceki gece kazandığı görev: Kaan'ın hedefini HE belirler
  const gorev = ctx.oda.oyun.kaanGelecekGoreviAktif;
  if (gorev) {
    const heAksiyonu = ctx.aksiyonlar.get(gorev.sahip);
    const heSectiHedef = heAksiyonu?.gonderildi ? heAksiyonu.hedef1 : null;

    if (heSectiHedef && !ctx.iptalEdilen.has(gorev.sahip)) {
      // Hetero Erkek Kaan'ın hedefini belirledi
      ekleSatir(ctx, gorev.sahip,
        `Önceki gece kazandığın görevi kullandın. Kaan'ın hedefini ${isim(ctx, heSectiHedef)} olarak belirledin.`);
      ekleSatir(ctx, kaanId,
        `Bu gece hedefin Hetero Erkek tarafından belirlendi: ${isim(ctx, heSectiHedef)}.`);
      // Kaan'ın kendi aksiyonunu geçersiz kıl, HE'nin seçimiyle devam et
      if (!ctx.aksiyonlar.has('__kaan_override__')) {
        ctx.aksiyonlar.set('__kaan_override__', { hedef1: heSectiHedef, gonderildi: true });
      }
      // Kaan'ın orijinal aksiyonunu HE'nin seçimiyle değiştir
      const kaanAks = ctx.aksiyonlar.get(kaanId);
      if (kaanAks) kaanAks.hedef1 = heSectiHedef;
    } else {
      ekleSatir(ctx, gorev.sahip, 'Kaan\'ın hedefini belirleme hakkın vardı ama hedef seçmedin — Kaan kendi seçimiyle gitti.');
    }
    // Görevi tüket (bir kez kullanılır)
    ctx.oda.oyun.kaanGelecekGoreviAktif = null;
  }

  const a = aksiyonu(ctx, kaanId);
  if (!a || !a.hedef1) return;

  let asilHedef = a.hedef1;

  // Transport mantığı (belge bölüm 14 — Crossdresser öncelik sırası):
  // - Kaan, CD'nin seçtiği kişiyi hedef aldıysa → CD ayrılır, asıl hedef kalır
  // - Kaan, CD'nin kendisini hedef aldıysa → CD'nin seçtiği kişi ayrılır
  let cdEtkilenen = null;
  for (const [cdId, cdHedef] of ctx.cdYerineKimGecti.entries()) {
    if (asilHedef === cdHedef) {
      // CD'nin seçtiği kişi yerine CD ayrılır
      cdEtkilenen = { cdId, asilHedef, sonuc: 'cd_ayrildi' };
      asilHedef = cdId;
      break;
    } else if (asilHedef === cdId) {
      // CD'yi hedef alınca, CD'nin seçtiği kişi ayrılır
      cdEtkilenen = { cdId, asilHedef: cdHedef, sonuc: 'baska_ayrildi' };
      asilHedef = cdHedef;
      break;
    }
  }

  // v1.8 — Tanışmada kimlik açıklayan oyuncu ilk gece köy tarafından korunur
  if (
    ctx.oda.oyun.geceTuru === 1 &&
    ctx.oda.oyun.aciklanmislar?.has(asilHedef)
  ) {
    ekleSatir(ctx, kaanId,
      `Hedefin ${isim(ctx, a.hedef1)} idi ama tanışmada kimliğini açıklayan oyuncu ilk gece köy tarafından korunuyor — aksiyonun boşa çıktı.`);
    ekleSatir(ctx, asilHedef,
      `Tanışmada kimliğini açıkladığın için bu gece köy seni korudu. Kaan'ın hedefiydin ama ayrılmadın.`);
    ctx.herkeseSabah.push('Köy, kimliğini açıklayan oyuncuyu ilk gecede koruma altına aldı — Kaan boşa çıktı.');
    return;
  }

  ctx.ayrilanlar.add(asilHedef);
  const ayrilanRol = rolu(ctx, asilHedef);
  ekleSatir(ctx, kaanId, `Hedefin ${isim(ctx, a.hedef1)} idi. Köyden ayrılan: ${isim(ctx, asilHedef)} (${ayrilanRol?.ad || '?'}).`);

  if (cdEtkilenen) {
    if (cdEtkilenen.sonuc === 'cd_ayrildi') {
      ekleSatir(ctx, cdEtkilenen.cdId, `Yerine geçtiğin ${isim(ctx, cdEtkilenen.asilHedef)} Kaan'ın hedefiymiş — sen köyden ayrıldın, asıl hedef kaldı.`);
    } else {
      ekleSatir(ctx, cdEtkilenen.cdId, `Kaan seni hedef aldı ama yerine geçtiğin ${isim(ctx, cdEtkilenen.asilHedef)} köyden ayrıldı.`);
    }
  }

  ctx.herkeseSabah.push('Köyde dün gece ekonomik baskı yapıldı.');
}

// ─── 4. Diğer Gelenekçi etkileri ───────────────────────────
function uygulaDigerGelenekci(ctx) {
  // Necmi — manipülasyon (oy etkisi, ileri taşınır)
  rolSahipleri(ctx, 'muhafazakar').forEach(necmiId => {
    const a = aksiyonu(ctx, necmiId);
    if (!a || !a.hedef1) return;
    // Hedef ayrıldıysa etki kaybolur
    if (!aktifMi(ctx, a.hedef1)) {
      ekleSatir(ctx, necmiId, `${isim(ctx, a.hedef1)}'e yakınlık göstermiştin ama köyden ayrıldı, etki kayboldu.`);
      return;
    }
    const mevcut = ctx.oyEtkileri.get(a.hedef1) || {};
    mevcut.otomatikHedefSahibi = necmiId;
    ctx.oyEtkileri.set(a.hedef1, mevcut);
    ekleSatir(ctx, necmiId, `${isim(ctx, a.hedef1)}'e yakınlık gösterdin, oyunu yönlendirdin.`);
  });

  // Azra — erkek oyuncunun oyu sayılmaz
  rolSahipleri(ctx, 'erkek_dusmani').forEach(azraId => {
    const a = aksiyonu(ctx, azraId);
    if (!a || !a.hedef1) return;
    const hedefRol = rolu(ctx, a.hedef1);
    const cinsiyet = ctx.ozelCinsiyet.get(hedefRol?.id);

    if (cinsiyet !== 'erkek') {
      ekleSatir(ctx, azraId, `${isim(ctx, a.hedef1)}'i hedef aldın — hedef uygun değil (erkek değil).`);
      return;
    }
    const mevcut = ctx.oyEtkileri.get(a.hedef1) || {};
    mevcut.oySayilmaz = true;
    ctx.oyEtkileri.set(a.hedef1, mevcut);
    ekleSatir(ctx, azraId, `${isim(ctx, a.hedef1)}'i hedef aldın. Yarınki oyu sayılmayacak.`);
    ekleSatir(ctx, a.hedef1, 'Bu gece biri seni hedef aldı.');
  });

  // ─── V1 yeni Gelenekçi roller (öncelik 5) ──────────────────
  // Hepsi: Gay engelinde aksiyonu iptal, DQ koruma Kaan'ı koruduğu için bu rollere
  // dolaylı koruma sağlamaz (DQ sadece Kaan hedefini korur). CD transport hedef
  // yorumunda devreye girer: hedef CD ise yerine geçen kişi ele alınır.
  uygulaTransfobikVeli(ctx);
  uygulaBifobikSozlesme(ctx);
  uygulaDinciVaaz(ctx);
  uygulaNbKarsitiEtiketle(ctx);
  uygulaCinsiyetciYer(ctx);
}

// ─── V1 Gelenekçi #1 — Transfobik (Sinan) "Veli toplantısı" ───
// Hedef Trans/CD/DQ/Ladyboy/Femboy ise ertesi gün savunmaya çıkamaz.
// Hedef kısıtı: SADECE Özgürlükçü hedef seçebilir (Azra modeli).
// "Sonra incele" notu (faz1-mekanik-kararlar.md #8): serbest mi onaylanırsa
//   bu filtreyi gevşet — şu an Özgürlükçü dışı hedefte aksiyon boşa.
// CD transport: hedef CD ise zaten Crossdresser görünür, kontrol gercekHedef
//   üzerinden gerçek rol idine bakar (gorunenHedefRolu sahte rolü maskeleyebilir;
//   bu aksiyon "doğuştan kimliği" işlediği için GERÇEK rolü kullanıyoruz).
function uygulaTransfobikVeli(ctx) {
  const HEDEF_ETKILI_ROLLER = ['transseksuel', 'crossdresser', 'drag_queen', 'ladyboy', 'femboy'];
  rolSahipleri(ctx, 'transfobik').forEach(sinanId => {
    const a = aksiyonu(ctx, sinanId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    // Hedef kısıtı: sadece Özgürlükçü grup (Murat sahte Özg olarak Özgürlükçü görünse
    // de gerçek rolü Outsider; karar tablosu "Özgürlükçü" diyor → grubu Özg olan).
    // gorunenHedefRolu Murat için sahte rol (Özg grubunda) döner — bu uygundur:
    // Sinan da diğer oyuncular gibi Murat'ı Özg görür ve hedefler.
    const gorunenRol = gorunenHedefRolu(ctx, hedefId);
    const gercekRol = rolu(ctx, hedefId);
    if (!gorunenRol || !gercekRol) return;

    if (gorunenRol.grup !== 'ozgurlukcu' && gercekRol.grup !== 'outsider') {
      ekleSatir(ctx, sinanId,
        `${isim(ctx, hedefId)}'i veli toplantısına çağırdın — hedef uygun değil (sadece Özgürlükçü).`);
      return;
    }

    // Etki kontrolü: gerçek rol id'si etkili rollerden biri mi?
    // (Murat sahte rolüyle DQ/CD vb. görünse bile gerçek rolü 'bastirmis' →
    //  kapsam dışı, aksiyon boşa düşer. Bu doğru: gerçekte etkilenecek kimse yok.)
    if (HEDEF_ETKILI_ROLLER.includes(gercekRol.id)) {
      if (!ctx.oda.oyun.sinanSavunmaKapali) ctx.oda.oyun.sinanSavunmaKapali = new Set();
      ctx.oda.oyun.sinanSavunmaKapali.add(hedefId);
      ekleSatir(ctx, sinanId,
        `${isim(ctx, hedefId)}'i veli toplantısına çağırdın. Yarın savunmaya çıkarsa susmak zorunda.`);
    } else {
      // Aksiyon boşa (Azra modeli)
      ekleSatir(ctx, sinanId,
        `${isim(ctx, hedefId)}'i veli toplantısına çağırdın — hedef uygun değil (etkilenen kimlik yok).`);
    }
    if (hedefId !== sinanId) {
      ekleSatir(ctx, hedefId, 'Bu gece biri seni hedef aldı.');
    }
  });
}

// ─── V1 Gelenekçi #2 — Bifobik (Yasemin) "Sözleşme hilesi" ────
// Hedef Bi/Pan/Poli/Sit/FB/LB ise ertesi gün oyu kendine yönlendirilir.
// Etki: hedef hangi adaya oy verirse versin, oy "kendine" sayılır → geçersiz.
// Hedef kısıtı yok (her oyuncuyu hedefleyebilir), ama uygunsuz rollerde aksiyon boşa.
function uygulaBifobikSozlesme(ctx) {
  const HEDEF_ETKILI_ROLLER = [
    'biseksuel', 'panseksuel', 'poliamorist', 'situationship', 'fuckbuddy', 'lovebuddy'
  ];
  rolSahipleri(ctx, 'bifobik').forEach(yaseminId => {
    const a = aksiyonu(ctx, yaseminId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    const gercekRol = rolu(ctx, hedefId);
    if (!gercekRol) return;

    if (HEDEF_ETKILI_ROLLER.includes(gercekRol.id)) {
      if (!ctx.oda.oyun.yaseminKendineOy) ctx.oda.oyun.yaseminKendineOy = new Set();
      ctx.oda.oyun.yaseminKendineOy.add(hedefId);
      ekleSatir(ctx, yaseminId,
        `${isim(ctx, hedefId)}'e sözleşme hilesi yaptın. Yarın oyu kendine geri dönecek (geçersiz).`);
    } else {
      ekleSatir(ctx, yaseminId,
        `${isim(ctx, hedefId)}'e sözleşme hilesi yaptın — hedef uygun değil (etkilenen kimlik yok).`);
    }
    if (hedefId !== yaseminId) {
      ekleSatir(ctx, hedefId, 'Bu gece biri seni hedef aldı.');
    }
  });
}

// ─── V1 Gelenekçi #3 — Dinci (Hüseyin) "Ahlaki vaaz" ──────────
// Hedef ertesi gece aksiyon yapamaz (otomatik pas, mesaj: "vicdan baskısı").
// Hedef kısıtı: SADECE Özgürlükçü/Tarafsız hedef seçebilir.
// "Sonra incele" notu (faz1-mekanik-kararlar.md #9): serbest mi?
//   Şu an: Gelenekçi/Kaosçu/Outsider hedefte aksiyon boşa.
function uygulaDinciVaaz(ctx) {
  rolSahipleri(ctx, 'dinci').forEach(huseyinId => {
    const a = aksiyonu(ctx, huseyinId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    // gorunenHedefRolu: Murat sahte Özgürlükçü görünür → Hüseyin onu Özg sanır
    // ve etkili sayar. Bu doğru: oyun-içi tutarlılık (Hüseyin diğer oyuncularla
    // aynı bilgiyle hareket eder).
    const gorunenRol = gorunenHedefRolu(ctx, hedefId);
    if (!gorunenRol) return;

    if (gorunenRol.grup !== 'ozgurlukcu' && gorunenRol.grup !== 'tarafsiz') {
      ekleSatir(ctx, huseyinId,
        `${isim(ctx, hedefId)}'e ahlaki vaaz verdin — hedef uygun değil (sadece Özgürlükçü/Tarafsız).`);
      return;
    }

    if (!ctx.oda.oyun.huseyinPasYapilanlar) ctx.oda.oyun.huseyinPasYapilanlar = new Set();
    ctx.oda.oyun.huseyinPasYapilanlar.add(hedefId);
    ekleSatir(ctx, huseyinId,
      `${isim(ctx, hedefId)}'e ahlaki vaaz verdin. Ertesi gece aksiyon yapamayacak.`);
    if (hedefId !== huseyinId) {
      ekleSatir(ctx, hedefId, 'Bu gece biri seni hedef aldı.');
    }
  });
}

// ─── V1 Gelenekçi #4 — Non-binary Karşıtı (Pınar) "Etiketleme" ─
// Hedef Non-binary/İnterseksüel/Crossdresser ise rolü sabah herkese ifşa.
// (Tablo "Aren"i ayrıca anıyor — Aren'in rol id'si 'non_binary' olduğu için
// listede zaten dahil.)
// Gerçek rol id'sine bakılır: Aren maskelemesi araştıran rolleri etkiler,
// Pınar "etiketleyerek" gerçek kimliği çıplak gösterir → maskeleme by-pass yok
// (zaten Aren Pınar'ın hedefiyse aksiyon başarılı olur, ironik).
function uygulaNbKarsitiEtiketle(ctx) {
  const HEDEF_ETKILI_ROLLER = ['non_binary', 'interseksuel', 'crossdresser'];
  rolSahipleri(ctx, 'nb_karsiti').forEach(pinarId => {
    const a = aksiyonu(ctx, pinarId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    const gercekRol = rolu(ctx, hedefId);
    if (!gercekRol) return;

    if (HEDEF_ETKILI_ROLLER.includes(gercekRol.id)) {
      // Sabah ifşa mesajını herkese duyur. Mesaj formatı:
      // "Pınar etiketledi: <isim>'in rolü açığa çıktı — <ROL>."
      // (Pınar adını duyurmak isteğe bağlı; tablo "rolü açığa çıktı" diyor — anonim tutuyoruz.)
      const ifsaMetni = `🪧 ${isim(ctx, hedefId)}'in rolü açığa çıktı: ${gercekRol.ad}.`;
      ctx.herkeseSabah.push(ifsaMetni);
      ekleSatir(ctx, pinarId,
        `${isim(ctx, hedefId)}'i etiketledin. Rolü (${gercekRol.ad}) sabah herkese ifşa edilecek.`);
      ekleSatir(ctx, hedefId, `Bu gece kimliğin açığa çıkarıldı: ${gercekRol.ad}.`);
    } else {
      ekleSatir(ctx, pinarId,
        `${isim(ctx, hedefId)}'i etiketledin — hedef uygun değil (etkilenen kimlik yok).`);
      if (hedefId !== pinarId) {
        ekleSatir(ctx, hedefId, 'Bu gece biri seni hedef aldı.');
      }
    }
  });
}

// ─── V1 Gelenekçi #5 — Cinsiyetçi (Oğuz) "Yer bilir" ──────────
// Hedef kadınsa ertesi gün o oyuncunun Gelenekçi adaya verdiği oy 0 sayılır.
// (Karar #10: "yarılama yerine Gelenekçi adayına 0".)
// Hedef kısıtı: cinsiyet rol kartından "kadin". Kadın değilse aksiyon boşa.
function uygulaCinsiyetciYer(ctx) {
  rolSahipleri(ctx, 'cinsiyetci').forEach(oguzId => {
    const a = aksiyonu(ctx, oguzId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    const gercekRol = rolu(ctx, hedefId);
    if (!gercekRol) return;
    const cinsiyet = ctx.ozelCinsiyet.get(gercekRol.id);

    if (cinsiyet !== 'kadin') {
      ekleSatir(ctx, oguzId,
        `${isim(ctx, hedefId)}'e "yer bilir" gözdağı verdin — hedef uygun değil (kadın değil).`);
      return;
    }

    if (!ctx.oda.oyun.oguzKadinHedefleri) ctx.oda.oyun.oguzKadinHedefleri = new Set();
    ctx.oda.oyun.oguzKadinHedefleri.add(hedefId);
    ekleSatir(ctx, oguzId,
      `${isim(ctx, hedefId)}'e "yer bilir" gözdağı verdin. Yarın Gelenekçi adaya verdiği oy 0 sayılacak.`);
    if (hedefId !== oguzId) {
      ekleSatir(ctx, hedefId, 'Bu gece biri seni hedef aldı.');
    }
  });
}

// ─── 5. Tarafsız aksiyonlar ────────────────────────────────
function uygulaTarafsizlar(ctx) {
  // Hetero Erkek — Özgürlükçüye giderse ziyaretçiler, Kaan'a giderse görev
  rolSahipleri(ctx, 'hetero_erkek').forEach(heId => {
    const a = aksiyonu(ctx, heId);
    if (!a || !a.hedef1) return;
    // Murat C: HE Murat'ı Özgürlükçü olarak görür (sahte rol).
    const hedefRol = gorunenHedefRolu(ctx, a.hedef1);

    if (hedefRol?.grup === 'ozgurlukcu') {
      // O kişiyi o gece kimler ziyaret etti?
      const ziyaretciler = ziyaretEdenleriBul(ctx, a.hedef1);
      const liste = ziyaretciler.length
        ? ziyaretciler.map(id => isim(ctx, id)).join(', ')
        : 'kimse';
      ekleSatir(ctx, heId, `${isim(ctx, a.hedef1)}'in yanında takıldın. Bu gece onu ziyaret edenler: ${liste}.`);
      ekleSatir(ctx, a.hedef1, 'Bu gece biri senin etrafında dolaştı.');
    } else if (hedefRol?.id === 'homofobik') {
      // Kaan'a görev: ertesi gece Kaan'ın hedefini Hetero Erkek belirler
      ctx.kaanGelecekGorevi = { sahip: heId };
      ekleSatir(ctx, heId,
        'Kaan ile çay içtin. Ertesi gece onun hedefini sen belirleyeceksin — gece aksiyonunda hedefini seç.');
    } else if (hedefRol?.grup === 'tarafsiz') {
      ekleSatir(ctx, heId, `${isim(ctx, a.hedef1)} ile takıldın. Boş gece — bilgi yok.`);
    }
  });

  // Situationship — Kaan'a yapışırsa bilgi verir (iptal yok)
  // Karşılıklı iptal mekaniği Adım 1.5'te (uygulaSituationshipIptal) halledildi.
  // Bu blok sadece Kaan'a yapışma durumunu yönetir.
  rolSahipleri(ctx, 'situationship').forEach(sitId => {
    const sitAks = ctx.aksiyonlar.get(sitId);
    if (!sitAks || !sitAks.gonderildi || !sitAks.hedef1) return;
    const hedefId = sitAks.hedef1;
    const hedefRol = rolu(ctx, hedefId);

    if (hedefRol?.id === 'homofobik') {
      // Kaan'a yapışma: iptal yok, sadece rolü öğrenir
      ekleSatir(ctx, sitId, `${isim(ctx, hedefId)}'e yapıştın. Rolü: ${hedefRol.ad}. Onu engelleyemedin.`);
      ekleSatir(ctx, hedefId, 'Bu gece biri sana yapıştı.');
    }
    // Diğer durum (iptal) zaten Adım 1.5'te mesajlandı — tekrar yazma
  });

  // Dul (Fatma) — v1.8.30 Aşama 3: geçmiş anısı sor
  // Hedefin karakterinden rastgele 1 anı, hikayeler-v2.md'den parse edilmiş
  // (client/src/veri/karakterAnilari.json — 38 karakter × 5 anı).
  // Murat C: Dul, Murat'ın gerçek karakterinden anı alır (sahte değil — anı
  // karakterin hikayesinden, rol mantığından bağımsız). Buğra onayıyla bu
  // davranış korunur: Dul'a verilen ipucu karakterin gerçek geçmişidir.
  rolSahipleri(ctx, 'koca_kari').forEach(dulId => {
    const a = aksiyonu(ctx, dulId);
    if (!a || !a.hedef1) return;
    // Kazanma takibi + tekrar engeli: aynı kişiden tekrar anı toplanamaz
    if (!ctx.oda.oyun.dulAnilar) ctx.oda.oyun.dulAnilar = new Map();
    let dulSet = ctx.oda.oyun.dulAnilar.get(dulId);
    if (!dulSet) { dulSet = new Set(); ctx.oda.oyun.dulAnilar.set(dulId, dulSet); }
    if (dulSet.has(a.hedef1)) {
      ekleSatir(ctx, dulId, `${isim(ctx, a.hedef1)}'e daha önce gittin — aynı kişiden tekrar anı toplayamazsın.`);
      return;
    }
    // Gerçek rolden karakteri al (Murat için sahte değil gerçek karakter Murat)
    const gercekRol = ctx.oda.oyun.roller.get(a.hedef1);
    if (!gercekRol || !gercekRol.karakter) return;
    const anilar = karakterAnilari[gercekRol.karakter];
    if (!anilar || anilar.length === 0) {
      ekleSatir(ctx, dulId, `${isim(ctx, a.hedef1)} hakkında bir hatıra bulamadın bu gece.`);
      return;
    }
    const ani = anilar[Math.floor(Math.random() * anilar.length)];
    dulSet.add(a.hedef1);
    ekleSatir(ctx, dulId, `${isim(ctx, a.hedef1)}'in geçmişinden bir hatıra: "${ani}"`);
  });

  // ─── V1 yeni Tarafsız roller (11 rol) ─────────────────────
  // Hepsi öncelik 5 (diğer etkiler katmanı). Sıralama içeriği etkilemiyor —
  // her biri bağımsız bilgi/etki üretiyor, paralel davranıyor.
  uygulaHeteroKadinKahve(ctx);
  uygulaAseksuelStalk(ctx);
  uygulaCopcatanTanistir(ctx);
  uygulaFetisistEtiket(ctx);
  uygulaSugarBabyHediye(ctx);
  uygulaSugarDaddyYatirim(ctx);
  uygulaCapkinTavla(ctx);
  uygulaMazosistTerapi(ctx);
  uygulaPoliamoristBag(ctx);
  uygulaFuckbuddyZiyaret(ctx);
  uygulaLovebuddyBag(ctx);
}

// ─── 6. Bilgi rolleri (İnterseksüel, Ladyboy) ──────────────
function uygulaBilgiRolleri(ctx) {
  // İnterseksüel — hedefin o gece kime aksiyon yaptığını öğrenir
  // Aren maskelemesi: izlenen oyuncu maskeliyse hedefi "?" görünür.
  rolSahipleri(ctx, 'interseksuel').forEach(intId => {
    const a = aksiyonu(ctx, intId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    const hedefAks = ctx.aksiyonlar.get(hedefId);
    if (maskeliMi(ctx, hedefId)) {
      // Aren bulanıklaştırdı: izleme yapıldı ama hedef bilgisi gelmez
      ekleSatir(ctx, intId, `${isim(ctx, hedefId)}'i izledin. Aksiyonu: ? (kimliği bulanıklaştırılmış).`);
    } else if (!hedefAks || !hedefAks.gonderildi || !hedefAks.hedef1) {
      ekleSatir(ctx, intId, `${isim(ctx, hedefId)}'i izledin. Bu gece kimseye aksiyon yapmamış.`);
    } else if (ctx.iptalEdilen.has(hedefId)) {
      ekleSatir(ctx, intId, `${isim(ctx, hedefId)}'i izledin. ${isim(ctx, hedefAks.hedef1)}'e gitmek istemiş ama aksiyonu iptal olmuş.`);
    } else {
      ekleSatir(ctx, intId, `${isim(ctx, hedefId)}'i izledin. Hedefi: ${isim(ctx, hedefAks.hedef1)}.`);
    }
  });

  // Ladyboy — tüm gece ziyaret listesi
  // Aren maskelemesi: maskeli kişiyle ilgili giriş "? → ?" görünür.
  rolSahipleri(ctx, 'ladyboy').forEach(lbId => {
    const a = aksiyonu(ctx, lbId);
    if (!a || !a.hedef1) return;
    // Tüm ziyaret eden roller (ziyaret = hedef seçen, bilgi rolü dahil)
    const ziyaretler = [];
    for (const [actorId, aks] of ctx.aksiyonlar.entries()) {
      if (!aks.gonderildi || !aks.hedef1) continue;
      if (ctx.iptalEdilen.has(actorId)) continue;
      // Kendine yapılan aksiyonlar listede olmasın (gözle göründüğünde tuhaf olur)
      if (actorId === aks.hedef1) continue;
      // Aren maskelemesi: aktör veya hedef maskeliyse "?" döner.
      const aktorEt = maskeliMi(ctx, actorId) ? '?' : isim(ctx, actorId);
      const hedefEt = maskeliMi(ctx, aks.hedef1) ? '?' : isim(ctx, aks.hedef1);
      ziyaretler.push(`${aktorEt} → ${hedefEt}`);
    }
    if (ziyaretler.length === 0) {
      ekleSatir(ctx, lbId, 'Bu gece köyde kimse hareket etmedi.');
    } else {
      ekleSatir(ctx, lbId, `Bu gece: ${ziyaretler.join(' • ')}`);
    }
  });

  // ─── V1 yeni Özgürlükçü bilgi rolleri (Lezbiyen, Biseksüel, Panseksüel, Femboy) ───
  uygulaLezbiyenMuayene(ctx);
  uygulaBiseksuelGorum(ctx);
  uygulaPanseksuelKopru(ctx);
  uygulaFemboyHesap(ctx);
}

// ─── Lezbiyen (Ada) "Muayene" — öncelik 5 ──────────────────
// Hedefin grup rengini öğrenir (Özgürlükçü/Tarafsız/Gelenekçi).
// - Gay engelinde Ada bilgi alamaz (kendi aksiyonu iptal).
// - Aren maskelemesi: hedef maskeliyse grup rengi "?" döner.
// - Outsider Murat hedef alınırsa Özgürlükçü olarak görünür (sahte rol Özg grubunda).
//   gorunenHedefRolu Murat için sahte rol döner, sahte rolün grubu zaten 'ozgurlukcu'.
function uygulaLezbiyenMuayene(ctx) {
  rolSahipleri(ctx, 'lezbiyen').forEach(adaId => {
    const a = aksiyonu(ctx, adaId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    const hedefRol = gorunenHedefRolu(ctx, hedefId);
    if (!hedefRol) return;

    if (maskeliMi(ctx, hedefId)) {
      ekleSatir(ctx, adaId, `${isim(ctx, hedefId)}'i muayene ettin. Grup rengi: ? (kimliği bulanıklaştırılmış).`);
      return;
    }
    // Sahte rol haritası Murat'ı Özgürlükçü grubunda gösterir → grupAd doğru çıkar.
    const grupAd = GRUP_AD[hedefRol.grup] || hedefRol.grup;
    const sembol = GRUP_SEMBOL[hedefRol.grup] || '';
    ekleSatir(ctx, adaId, `${isim(ctx, hedefId)}'i muayene ettin. Grup rengi: ${sembol} ${grupAd}.`);
  });
}

// ─── Biseksüel (Elvin) "İki dünyada görür" — öncelik 5 ─────
// İki hedef seçer; sistem ikisinin de o gece aksiyon yapıp yapmadığını bildirir.
// Sadece var/yok bilgisi — hedef veya içerik değil.
// - Aksiyon "yapılmış" sayılır: gönderildi=true + hedef seçildi + iptal edilmedi.
// - Gay engelinde iptal edilen aksiyon "pasif" sayılır (kullanıcı seçti ama etki olmadı).
function uygulaBiseksuelGorum(ctx) {
  rolSahipleri(ctx, 'biseksuel').forEach(elvinId => {
    const a = aksiyonu(ctx, elvinId);
    if (!a || !a.hedef1 || !a.hedef2) return;
    const h1 = a.hedef1;
    const h2 = a.hedef2;
    const aktifEtti = (id) => {
      const aks = ctx.aksiyonlar.get(id);
      if (!aks || !aks.gonderildi || !aks.hedef1) return false;
      if (ctx.iptalEdilen.has(id)) return false;
      return true;
    };
    const h1Durum = aktifEtti(h1) ? 'aktif' : 'pasif';
    const h2Durum = aktifEtti(h2) ? 'aktif' : 'pasif';
    ekleSatir(ctx, elvinId,
      `İki dünya: ${isim(ctx, h1)} → ${h1Durum} • ${isim(ctx, h2)} → ${h2Durum}.`);
  });
}

// ─── Panseksüel (Maya) "Köprü kurar" — öncelik 5 ───────────
// İki hedef seçer; sistem "biri diğerini ziyaret etti mi" bildirir (yön yok).
// - A → B veya B → A varsa "köprü var".
// - Aksiyon hedef seçilse bile iptal edilmediyse sayılır.
function uygulaPanseksuelKopru(ctx) {
  rolSahipleri(ctx, 'panseksuel').forEach(mayaId => {
    const a = aksiyonu(ctx, mayaId);
    if (!a || !a.hedef1 || !a.hedef2) return;
    const A = a.hedef1;
    const B = a.hedef2;
    const aAks = ctx.aksiyonlar.get(A);
    const bAks = ctx.aksiyonlar.get(B);
    const aBGitti = aAks?.gonderildi && !ctx.iptalEdilen.has(A) &&
      (aAks.hedef1 === B || aAks.hedef2 === B);
    const bAGitti = bAks?.gonderildi && !ctx.iptalEdilen.has(B) &&
      (bAks.hedef1 === A || bAks.hedef2 === A);
    const baglanti = aBGitti || bAGitti;
    ekleSatir(ctx, mayaId,
      `${isim(ctx, A)} ↔ ${isim(ctx, B)}: ${baglanti ? 'aralarında ziyaret VAR' : 'aralarında ziyaret YOK'}.`);
  });
}

// ─── Femboy (Umay) "Hesap tutar" — öncelik 5 ───────────────
// Hedefin oyun başından beri aktif aksiyon yaptığı kümülatif gece sayısını döner.
// Pas geceler sayılmaz (karar: faz1-mekanik-kararlar.md #4).
// Sayaç: oda.oyun.kumulatifAktif Map'inde tutulur, her gece sonu guncelleKumulatifAktif() ile artırılır.
// Umay'ın aksiyonu BU GECE'nin güncellemesinden ÖNCE okunur — yani şu ana kadarki sayım döner.
// (Hedefin bu geceki aksiyonu henüz sayaca yansımamış olur; "geçmiş geceler özeti" niteliği taşır.)
function uygulaFemboyHesap(ctx) {
  rolSahipleri(ctx, 'femboy').forEach(umayId => {
    const a = aksiyonu(ctx, umayId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    const sayac = ctx.oda.oyun.kumulatifAktif?.get(hedefId) || 0;
    // Toplam oynanan gece sayısı: index.js'te oda.oyun.geceTuru (1'den başlar, bu gece dahil).
    // Sayaç bu geceyi henüz dahil etmediği için "geceTuru - 1" = önceki gece sayısı.
    const geceTuru = ctx.oda.oyun.geceTuru || 0;
    const oncekiGeceler = Math.max(0, geceTuru - 1);
    const ifade = oncekiGeceler > 0
      ? `${oncekiGeceler} geceden ${sayac}'inde aktif`
      : `henüz önceki gece yok (bu gece ilk gece, sayım 0)`;
    ekleSatir(ctx, umayId, `${isim(ctx, hedefId)}'in hesabını tuttun. ${ifade}.`);
  });
}

// ─── 9. Umay kümülatif aktif sayaç güncellemesi ────────────
// Her gece sonu: aksiyonu gönderilmiş ve hedef seçilmiş her oyuncunun sayacı +1.
// Pas geçen (gonderildi=false veya hedef yok) oyuncular sayılmaz.
// İptal edilen aksiyonlar da AKTİF girişim sayılır — oyuncu hedef seçti, sistem iptal etti.
// (Bu yorum karar #4 ile tutarlı: "sadece aktif aksiyon" = oyuncu aksiyon seçti.)
function guncelleKumulatifAktif(ctx) {
  if (!ctx.oda.oyun.kumulatifAktif) {
    ctx.oda.oyun.kumulatifAktif = new Map();
  }
  const sayac = ctx.oda.oyun.kumulatifAktif;
  for (const [oyuncuId, aks] of ctx.aksiyonlar.entries()) {
    // Pseudo anahtarları atla (örn. '__kaan_override__')
    if (typeof oyuncuId !== 'string') continue;
    if (oyuncuId.startsWith('__')) continue;
    if (!aks || !aks.gonderildi) continue;
    if (!aks.hedef1) continue;
    // Aktif giriş — sayacı artır
    const mevcut = sayac.get(oyuncuId) || 0;
    sayac.set(oyuncuId, mevcut + 1);
  }
}

// ─── 10. Aksiyon tipi geçmişini güncelle (Aseksüel için) ──
// Bu gece her oyuncunun "yaptığı aksiyonun tipini" kaydeder.
// Aseksüel BİR SONRAKİ gece bu kayda bakıp "önceki gece tipi"ni döner.
// Pas geçen / aksiyonu olmayan oyuncular için tip "pas" kaydedilir.
function guncelleAksiyonGecmisi(ctx) {
  if (!ctx.oda.oyun.aksiyonGecmisi) {
    ctx.oda.oyun.aksiyonGecmisi = new Map();
  }
  const gecmis = ctx.oda.oyun.aksiyonGecmisi;
  const geceTuru = ctx.oda.oyun.geceTuru || 0;

  // Her aktif oyuncu için son aksiyon tipini güncelle
  ctx.oda.players.forEach(p => {
    if (p.koydeMi === false) return;
    const rol = ctx.roller.get(p.id);
    if (!rol) return;
    const aks = ctx.aksiyonlar.get(p.id);
    let tip = 'pas';
    if (aks && aks.gonderildi && aks.hedef1) {
      tip = aksiyonTipiBul(rol.id);
    }
    const liste = gecmis.get(p.id) || [];
    liste.push({ gun: geceTuru, tip });
    gecmis.set(p.id, liste);
  });
}

// ─── V1 YENİ TARAFSIZ ROLLER — AKSIYON FONKSİYONLARI ──────
// Hepsi öncelik 5 (uygulaBilgiRolleri sonunda çağrılıyor).
// Aren maskelemesi: bilgi sızdıran rollerde maskeli hedeflerde "?" döner.
// Murat C: hedef Murat ise sahte rol görünür (gorunenHedefRolu kullan).

// ─── 1. Hetero Kadın (Bahar) — "Kahve ısmarlar" ─────────
// Hedef Özgürlükçü → doğuştan cinsiyet; Tarafsız → grup rengi;
// Kaan → o gece Kaan'ın hedefini öğrenir (Hetero Erkek mantığıyla AYNI değil:
// belge formülünde "Kaan'ın hedefini öğrenir" tek seferlik bilgi).
// NOT: HE'nin Kaan görevi (uygulaKaanUzaklastirma) etkin olmaya devam ediyor.
// Bahar HE'den farklı: ertesi gece görev hakkı YOK, sadece o gece Kaan'ın
// hedefini öğreniyor. Bu mekanik faz1-mekanik-kararlar.md'ye uygun.
function uygulaHeteroKadinKahve(ctx) {
  rolSahipleri(ctx, 'hetero_kadin').forEach(baharId => {
    const a = aksiyonu(ctx, baharId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    const hedefRol = gorunenHedefRolu(ctx, hedefId);
    if (!hedefRol) return;

    // Kazanma takibi: seçilen hedeflerin cinsiyeti (2E + 2K)
    if (!ctx.oda.oyun.hkHedefler) ctx.oda.oyun.hkHedefler = new Map();
    let baharH = ctx.oda.oyun.hkHedefler.get(baharId);
    if (!baharH) { baharH = new Map(); ctx.oda.oyun.hkHedefler.set(baharId, baharH); }
    baharH.set(hedefId, ctx.ozelCinsiyet.get(hedefRol.id) || 'bilinmiyor');

    if (maskeliMi(ctx, hedefId)) {
      ekleSatir(ctx, baharId, `${isim(ctx, hedefId)}'e kahve ısmarladın. Bilgi: ? (kimliği bulanıklaştırılmış).`);
      return;
    }

    if (hedefRol.id === 'homofobik') {
      // Kaan'ın o gece hedefini öğren (Kaan'ın aksiyon iptal olsa bile hedef niyet bilinir)
      const kaanAks = ctx.aksiyonlar.get(hedefId);
      const kaanHedef = kaanAks?.gonderildi && kaanAks.hedef1 ? kaanAks.hedef1 : null;
      const hedefAdi = kaanHedef ? isim(ctx, kaanHedef) : 'kimse';
      ekleSatir(ctx, baharId, `${isim(ctx, hedefId)} (Kaan) ile kahve içtin. Bu gece hedefi: ${hedefAdi}.`);
    } else if (hedefRol.grup === 'ozgurlukcu' || hedefRol.grup === 'outsider') {
      // Doğuştan cinsiyet: rol id üzerinden KARAKTER_CINSIYET haritasından
      const cinsiyet = ctx.ozelCinsiyet.get(hedefRol.id) || 'bilinmiyor';
      ekleSatir(ctx, baharId, `${isim(ctx, hedefId)}'e kahve ısmarladın. Doğuştan cinsiyeti: ${cinsiyet}.`);
    } else if (hedefRol.grup === 'tarafsiz') {
      const grupAd = GRUP_AD[hedefRol.grup];
      const sembol = GRUP_SEMBOL[hedefRol.grup] || '';
      ekleSatir(ctx, baharId, `${isim(ctx, hedefId)}'e kahve ısmarladın. Grup rengi: ${sembol} ${grupAd}.`);
    } else if (hedefRol.grup === 'gelenekci') {
      // Karar dokümanında Bahar'ın Gelenekçi (Kaan değil) hedefinde davranışı net değil;
      // Kaan dışındaki Gelenekçiler için grup rengini ver (gizli kalmasın).
      const grupAd = GRUP_AD[hedefRol.grup];
      const sembol = GRUP_SEMBOL[hedefRol.grup] || '';
      ekleSatir(ctx, baharId, `${isim(ctx, hedefId)}'e kahve ısmarladın. Grup rengi: ${sembol} ${grupAd}.`);
    }
    if (hedefId !== baharId) {
      ekleSatir(ctx, hedefId, 'Bu gece biri sana kahve ısmarladı.');
    }
  });
}

// ─── 2. Aseksüel (Irmak) — "Sosyal medya stalk" ─────────
// Hedefin BİR ÖNCEKİ GECE yaptığı aksiyonun türünü öğrenir
// (ziyaret / koruma / izleme / engelleme / pas). 1. gecede "veri yok".
function uygulaAseksuelStalk(ctx) {
  rolSahipleri(ctx, 'aseksuel').forEach(irmakId => {
    const a = aksiyonu(ctx, irmakId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    const geceTuru = ctx.oda.oyun.geceTuru || 0;
    if (geceTuru <= 1) {
      ekleSatir(ctx, irmakId, `${isim(ctx, hedefId)}'in sosyal medyasını stalk ettin. Veri yok (ilk gece).`);
      return;
    }
    const gecmis = ctx.oda.oyun.aksiyonGecmisi || new Map();
    const liste = gecmis.get(hedefId) || [];
    // "Önceki gece" = bir önceki kayıt; aksiyonGecmisi henüz BU GECE güncellenmediği için
    // listedeki son eleman önceki gecenin tipidir.
    const oncekiKayit = liste[liste.length - 1];
    if (!oncekiKayit) {
      ekleSatir(ctx, irmakId, `${isim(ctx, hedefId)}'in sosyal medyasını stalk ettin. Veri yok.`);
      return;
    }
    if (!ctx.oda.oyun.asHedefler) ctx.oda.oyun.asHedefler = new Map();
    let irmakS = ctx.oda.oyun.asHedefler.get(irmakId);
    if (!irmakS) { irmakS = new Set(); ctx.oda.oyun.asHedefler.set(irmakId, irmakS); }
    irmakS.add(hedefId);
    ekleSatir(ctx, irmakId,
      `${isim(ctx, hedefId)}'in sosyal medyasını stalk ettin. Önceki gece tipi: ${oncekiKayit.tip}.`);
  });
}

// ─── 3. Çöpçatan (Hatice) — "Tanıştırır" ────────────────
// İki oyuncu seçer; ikisi de sabah "X seninle tanışmak istiyor" bildirim alır.
// Kazanma izleme için oda.oyun.coplatanEslesmeleri Map'inde tutulur.
function uygulaCopcatanTanistir(ctx) {
  rolSahipleri(ctx, 'copcatan').forEach(haticeId => {
    const a = aksiyonu(ctx, haticeId);
    if (!a || !a.hedef1 || !a.hedef2) return;
    if (a.hedef1 === a.hedef2) {
      ekleSatir(ctx, haticeId, 'Aynı oyuncuyu iki kez seçtin; tanıştırma yapılamadı.');
      return;
    }
    const aId = a.hedef1;
    const bId = a.hedef2;
    const aAdi = isim(ctx, aId);
    const bAdi = isim(ctx, bId);
    const geceTuru = ctx.oda.oyun.geceTuru || 0;

    // Kayıt
    if (!ctx.oda.oyun.coplatanEslesmeleri) ctx.oda.oyun.coplatanEslesmeleri = new Map();
    const eslesmeler = ctx.oda.oyun.coplatanEslesmeleri;
    const liste = eslesmeler.get(haticeId) || [];
    liste.push({ a: aId, b: bId, gun: geceTuru });
    eslesmeler.set(haticeId, liste);

    ekleSatir(ctx, haticeId, `${aAdi} ile ${bAdi}'i tanıştırdın. Eşleştirme kaydedildi.`);
    ekleSatir(ctx, aId, `${isim(ctx, haticeId)} seni ${bAdi} ile tanıştırdı.`);
    ekleSatir(ctx, bId, `${isim(ctx, haticeId)} seni ${aAdi} ile tanıştırdı.`);
  });
}

// ─── 4. Fetişist (Kartal) — "Gizli etiket" ──────────────
// Oyun başında atanan etiket (oda.oyun.fetisistEtiketi Map'inden) ile hedefin
// mesleğini karşılaştırır. "uydu" / "uymadı" bildirimi.
// Etiket başlatma: oyunuBaslat içinde Fetişist atandığında set ediliyor.
// Fallback: ilk gece etiket yoksa burada lazy-init et (oyunda hep Fetişist var demek).
function uygulaFetisistEtiket(ctx) {
  rolSahipleri(ctx, 'fetisist').forEach(kartalId => {
    const a = aksiyonu(ctx, kartalId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;
    const hedefRol = gorunenHedefRolu(ctx, hedefId);
    if (!hedefRol) return;

    // Etiket lazy-init (eğer oyunuBaslat'ta atanmadıysa)
    if (!ctx.oda.oyun.fetisistEtiketi) ctx.oda.oyun.fetisistEtiketi = new Map();
    if (!ctx.oda.oyun.fetisistEtiketi.has(kartalId)) {
      const etiketler = ['yaratıcı', 'akademik', 'fiziksel'];
      const rastgele = etiketler[Math.floor(Math.random() * etiketler.length)];
      ctx.oda.oyun.fetisistEtiketi.set(kartalId, rastgele);
    }
    const etiket = ctx.oda.oyun.fetisistEtiketi.get(kartalId);
    const hedefEtiket = meslekEtiketiBul(hedefRol.meslek);
    const uyuyor = hedefEtiket === etiket;
    if (uyuyor) {
      if (!ctx.oda.oyun.ftDogru) ctx.oda.oyun.ftDogru = new Map();
      let kartalS = ctx.oda.oyun.ftDogru.get(kartalId);
      if (!kartalS) { kartalS = new Set(); ctx.oda.oyun.ftDogru.set(kartalId, kartalS); }
      kartalS.add(hedefId);
    }
    ekleSatir(ctx, kartalId,
      `${isim(ctx, hedefId)}'i (${hedefRol.meslek || '?'}) etiketinle (${etiket}) kontrol ettin: ${uyuyor ? 'UYDU' : 'uymadı'}.`);
  });
}

// Meslek → etiket eşlemesi (görev tanımındaki listelere göre)
function meslekEtiketiBul(meslek) {
  if (!meslek) return 'diğer';
  const m = meslek.toLowerCase();
  const yaratici = ['tasarımcı', 'illüstratör', 'yazar', 'senarist', 'mimar', 'müzisyen', 'fotoğrafçı', 'rock', 'çizer', 'grafik'];
  const akademik = ['doktor', 'biyolog', 'avukat', 'öğretmen', 'imam', 'psikoterapist', 'hemşire', 'memur'];
  const fiziksel = ['kurye', 'pilot', 'spor', 'seyyar', 'müteahhit', 'bartender', 'esnaf', 'inşaat', 'bakkal'];
  if (yaratici.some(k => m.includes(k))) return 'yaratıcı';
  if (akademik.some(k => m.includes(k))) return 'akademik';
  if (fiziksel.some(k => m.includes(k))) return 'fiziksel';
  return 'diğer';
}

// ─── 5. Sugar Baby (Selin) — "Hediye ister" ─────────────
// Hedefin grup rengini öğrenir. Aynı hedef tekrar yasak.
function uygulaSugarBabyHediye(ctx) {
  rolSahipleri(ctx, 'sugar_baby').forEach(selinId => {
    const a = aksiyonu(ctx, selinId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;

    if (!ctx.oda.oyun.sbHediyeAlinanlar) ctx.oda.oyun.sbHediyeAlinanlar = new Map();
    const alinanlar = ctx.oda.oyun.sbHediyeAlinanlar;
    const set = alinanlar.get(selinId) || new Set();
    if (set.has(hedefId)) {
      ekleSatir(ctx, selinId, `${isim(ctx, hedefId)}'den daha önce hediye almıştın — tekrar yasak, bilgi gelmedi.`);
      return;
    }

    const hedefRol = gorunenHedefRolu(ctx, hedefId);
    if (!hedefRol) return;

    if (maskeliMi(ctx, hedefId)) {
      ekleSatir(ctx, selinId, `${isim(ctx, hedefId)}'den hediye istedin. Grup rengi: ? (kimliği bulanıklaştırılmış).`);
    } else {
      const grupAd = GRUP_AD[hedefRol.grup] || hedefRol.grup;
      const sembol = GRUP_SEMBOL[hedefRol.grup] || '';
      ekleSatir(ctx, selinId, `${isim(ctx, hedefId)}'den hediye istedin. Grup rengi: ${sembol} ${grupAd}.`);
    }
    set.add(hedefId);
    alinanlar.set(selinId, set);
  });
}

// ─── 6. Sugar Daddy (Eren) — "Yatırım" ──────────────────
// Hedefin ertesi günkü oyu 2 sayılır. Aynı hedefe üst üste yasak.
// oda.oyun.sdOySonuc Map(hedefId → katsayi) — index.js oylariBisle'de okunur.
function uygulaSugarDaddyYatirim(ctx) {
  rolSahipleri(ctx, 'sugar_daddy').forEach(erenId => {
    const a = aksiyonu(ctx, erenId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;

    if (!ctx.oda.oyun.sdSonHedef) ctx.oda.oyun.sdSonHedef = new Map();
    if (ctx.oda.oyun.sdSonHedef.get(erenId) === hedefId) {
      ekleSatir(ctx, erenId, `${isim(ctx, hedefId)}'e dün yatırım yapmıştın — üst üste yasak, etki yok.`);
      return;
    }

    if (!ctx.oda.oyun.sdOySonuc) ctx.oda.oyun.sdOySonuc = new Map();
    // Karar: DQ ile çakışırsa max 2 (kümülatif değil)
    const mevcut = ctx.oda.oyun.sdOySonuc.get(hedefId) || 1;
    const yeni = Math.max(mevcut, 2);
    ctx.oda.oyun.sdOySonuc.set(hedefId, yeni);
    ctx.oda.oyun.sdSonHedef.set(erenId, hedefId);

    // Kazanma takibi: bu oyuncuya kaç kez yatırım yapıldı
    if (!ctx.oda.oyun.sdYatirim) ctx.oda.oyun.sdYatirim = new Map();
    let erenY = ctx.oda.oyun.sdYatirim.get(erenId);
    if (!erenY) { erenY = new Map(); ctx.oda.oyun.sdYatirim.set(erenId, erenY); }
    erenY.set(hedefId, (erenY.get(hedefId) || 0) + 1);

    ekleSatir(ctx, erenId, `${isim(ctx, hedefId)}'e yatırım yaptın. Yarınki oyu 2 sayılacak.`);
    if (hedefId !== erenId) {
      ekleSatir(ctx, hedefId, 'Bu gece sana yatırım yapıldı.');
    }
  });
}

// ─── 7. Çapkın (Can) — "Tavlar" ─────────────────────────
// Hedefin o geceki aksiyon hedefini öğrenir. Aynı hedef tekrar yasak.
function uygulaCapkinTavla(ctx) {
  rolSahipleri(ctx, 'capkin').forEach(canId => {
    const a = aksiyonu(ctx, canId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;

    if (!ctx.oda.oyun.capkinTavlananlar) ctx.oda.oyun.capkinTavlananlar = new Map();
    const tavlananlar = ctx.oda.oyun.capkinTavlananlar;
    const set = tavlananlar.get(canId) || new Set();
    if (set.has(hedefId)) {
      ekleSatir(ctx, canId, `${isim(ctx, hedefId)}'i daha önce tavlamıştın — tekrar yasak, bilgi gelmedi.`);
      return;
    }

    const hedefAks = ctx.aksiyonlar.get(hedefId);
    if (maskeliMi(ctx, hedefId)) {
      ekleSatir(ctx, canId, `${isim(ctx, hedefId)}'le flört ettin. Hedefi: ? (kimliği bulanıklaştırılmış).`);
    } else if (!hedefAks || !hedefAks.gonderildi || !hedefAks.hedef1) {
      ekleSatir(ctx, canId, `${isim(ctx, hedefId)}'le flört ettin. Bu gece kimseye aksiyon yapmamış.`);
    } else {
      ekleSatir(ctx, canId, `${isim(ctx, hedefId)}'le flört ettin. Bu gece hedefi: ${isim(ctx, hedefAks.hedef1)}.`);
    }
    set.add(hedefId);
    tavlananlar.set(canId, set);
  });
}

// ─── 8. Mazoşist (Beren) — "Süpervizyon" ────────────────
// Hedefin O GECE yaptığı aksiyonun türünü öğrenir (izleme/koruma/engelleme/
// ziyaret/pas) — "başkasının taşıdığı yükü görmek". Çapkın/Tuna gibi o geceyi okur.
function uygulaMazosistTerapi(ctx) {
  rolSahipleri(ctx, 'mazosist').forEach(berenId => {
    const a = aksiyonu(ctx, berenId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;

    const hedefAks = ctx.aksiyonlar.get(hedefId);
    if (maskeliMi(ctx, hedefId)) {
      ekleSatir(ctx, berenId, `${isim(ctx, hedefId)}'e seans verdin. Taşıdığı yük: ? (kimliği bulanıklaştırılmış).`);
    } else if (!hedefAks || !hedefAks.gonderildi || !hedefAks.hedef1) {
      ekleSatir(ctx, berenId, `${isim(ctx, hedefId)}'e seans verdin. Bu gece bir yük taşımamış (pas).`);
    } else {
      const rol = gorunenHedefRolu(ctx, hedefId);
      const tip = aksiyonTipiBul(rol?.id);
      ekleSatir(ctx, berenId, `${isim(ctx, hedefId)}'e seans verdin. Bu gece taşıdığı yükün türü: ${tip}.`);
    }
  });
}

// ─── 9. Poliamorist (Ekin) — "Yakınlaşır" ───────────────
// İki hedef seçer; ikisinin de rolünün ilk harfini öğrenir.
// Aren maskelemesi: maskeli hedef için "?" döner.
function uygulaPoliamoristBag(ctx) {
  rolSahipleri(ctx, 'poliamorist').forEach(ekinId => {
    const a = aksiyonu(ctx, ekinId);
    if (!a || !a.hedef1 || !a.hedef2) return;
    const h1 = a.hedef1;
    const h2 = a.hedef2;
    const harf = (hedefId) => {
      if (maskeliMi(ctx, hedefId)) return '?';
      const rol = gorunenHedefRolu(ctx, hedefId);
      if (!rol || !rol.ad) return '?';
      return rol.ad.charAt(0).toUpperCase();
    };
    const h1Harf = harf(h1);
    const h2Harf = harf(h2);
    // Kazanma takibi: harfi öğrenilen farklı oyuncular (maskeli '?' sayılmaz)
    if (!ctx.oda.oyun.poliOgrendi) ctx.oda.oyun.poliOgrendi = new Map();
    let ekinS = ctx.oda.oyun.poliOgrendi.get(ekinId);
    if (!ekinS) { ekinS = new Set(); ctx.oda.oyun.poliOgrendi.set(ekinId, ekinS); }
    if (h1Harf !== '?') ekinS.add(h1);
    if (h2Harf !== '?') ekinS.add(h2);
    ekleSatir(ctx, ekinId,
      `${isim(ctx, h1)} ve ${isim(ctx, h2)} ile yakınlaştın. Rol harfleri: ${h1Harf} — ${h2Harf}.`);
  });
}

// ─── 10. Fuckbuddy (Tuna) — "Son Sipariş" ───────────────
// Hedefin o gece kime gittiğini (aksiyon hedefini) öğrenir — Çapkın'a benzer.
// Kazanma takibi: aynı hedefe kaç farklı gece gidildiği fbTakip'te tutulur.
function uygulaFuckbuddyZiyaret(ctx) {
  rolSahipleri(ctx, 'fuckbuddy').forEach(tunaId => {
    const a = aksiyonu(ctx, tunaId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;

    // Kazanma takibi: aynı yüzü kaç farklı gece takip etti
    if (!ctx.oda.oyun.fbTakip) ctx.oda.oyun.fbTakip = new Map();
    let tunaTakip = ctx.oda.oyun.fbTakip.get(tunaId);
    if (!tunaTakip) { tunaTakip = new Map(); ctx.oda.oyun.fbTakip.set(tunaId, tunaTakip); }
    tunaTakip.set(hedefId, (tunaTakip.get(hedefId) || 0) + 1);

    const hedefAks = ctx.aksiyonlar.get(hedefId);
    if (maskeliMi(ctx, hedefId)) {
      ekleSatir(ctx, tunaId, `${isim(ctx, hedefId)}'i tanıdın. Bu gece kime gitti: ? (kimliği bulanıklaştırılmış).`);
    } else if (!hedefAks || !hedefAks.gonderildi || !hedefAks.hedef1) {
      ekleSatir(ctx, tunaId, `${isim(ctx, hedefId)}'i tanıdın. Bu gece kimseye gitmemiş.`);
    } else {
      ekleSatir(ctx, tunaId, `${isim(ctx, hedefId)}'i tanıdın. Bu gece gittiği: ${isim(ctx, hedefAks.hedef1)}.`);
    }
  });
}

// ─── 11. Lovebuddy (Nehir) — "Bağ kurar" ────────────────
// Aynı hedefe 2 gece üst üste aksiyon → karşılıklı rol paylaşımı (her ikisi de
// diğerinin rolünü öğrenir). Hedef değişirse sayaç sıfırlanır.
function uygulaLovebuddyBag(ctx) {
  rolSahipleri(ctx, 'lovebuddy').forEach(nehirId => {
    const a = aksiyonu(ctx, nehirId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;

    if (!ctx.oda.oyun.lbBagSayaci) ctx.oda.oyun.lbBagSayaci = new Map();
    const sayacMap = ctx.oda.oyun.lbBagSayaci;
    let nehirSayac = sayacMap.get(nehirId);
    if (!nehirSayac) {
      nehirSayac = new Map();
      sayacMap.set(nehirId, nehirSayac);
    }

    // Hedef değişti mi? — diğer hedefleri sıfırla
    for (const [key] of nehirSayac.entries()) {
      if (key !== hedefId) nehirSayac.set(key, 0);
    }
    const onceki = nehirSayac.get(hedefId) || 0;
    const yeni = onceki + 1;
    nehirSayac.set(hedefId, yeni);

    if (yeni >= 2) {
      // Karşılıklı bağ kuruldu (bu gece 2. üst üste ziyaret).
      // Aren maskelemesi: hedef maskeliyse rol bilgisi "?" döner.
      const hedefRol = maskeliMi(ctx, hedefId) ? null : gorunenHedefRolu(ctx, hedefId);
      const nehirRol = ctx.roller.get(nehirId);
      const hedefRolAd = hedefRol ? hedefRol.ad : '?';
      const nehirRolAd = nehirRol ? nehirRol.ad : '?';
      ekleSatir(ctx, nehirId,
        `${isim(ctx, hedefId)} ile karşılıklı bağ kurdun. Rolü: ${hedefRolAd}.`);
      ekleSatir(ctx, hedefId,
        `${isim(ctx, nehirId)} ile karşılıklı bağ kuruldu. Rolü: ${nehirRolAd}.`);

      // Kazanma izleme: bağlı çiftler set'ine kaydet
      if (!ctx.oda.oyun.lbBagliCiftler) ctx.oda.oyun.lbBagliCiftler = new Set();
      ctx.oda.oyun.lbBagliCiftler.add(`${nehirId}:${hedefId}`);
    } else {
      ekleSatir(ctx, nehirId,
        `${isim(ctx, hedefId)} ile bağ kurmaya başladın. Üst üste 1 gece — bilgi henüz yok.`);
    }
  });
}

// ─── 7. DQ etkileri (oy katı, oy iptali, tarafsız ziyaretçi listesi) ──
function uygulaDQEtkileri(ctx) {
  rolSahipleri(ctx, 'drag_queen').forEach(dqId => {
    if (ctx.iptalEdilen.has(dqId)) return;
    // Eğer DQ koruma adımında etkin koruma yaptıysa, sahnelendirme bilgi mesajı
    // tek satırda kaldı — duplicate eklemeyelim ama oy etkisini yine de kaydedelim
    const korumaUygulandi = ctx.dqKorumaUygulandi?.has(dqId);

    const a = aksiyonu(ctx, dqId);
    if (!a || !a.hedef1) return;
    // Murat C: DQ Murat'ı Özgürlükçü olarak görür — gerçekte de oy katı uygulanır
    // (Murat sahte rolüyle oynuyor, gerçek dünyada Özgürlükçü gibi davranır).
    const hedefRol = gorunenHedefRolu(ctx, a.hedef1);
    if (!hedefRol) return;

    if (hedefRol.grup === 'ozgurlukcu') {
      const mevcut = ctx.oyEtkileri.get(a.hedef1) || {};
      mevcut.oyKati = (mevcut.oyKati || 1) * 2;
      ctx.oyEtkileri.set(a.hedef1, mevcut);
      if (!korumaUygulandi) {
        ekleSatir(ctx, dqId, `${isim(ctx, a.hedef1)}'i sahnelendirdin (Özgürlükçü). Yarınki oyu 2 sayılacak.`);
        ekleSatir(ctx, a.hedef1, 'Bu gece sahneye çıkarıldın. Yarın oyun 2 sayılacak.');
      }
    } else if (hedefRol.grup === 'tarafsiz') {
      const ziyaretciler = ziyaretEdenleriBul(ctx, a.hedef1);
      const liste = ziyaretciler.length
        ? ziyaretciler.map(id => isim(ctx, id)).join(', ')
        : 'kimse';
      ekleSatir(ctx, dqId, `${isim(ctx, a.hedef1)}'i sahnelendirdin (Tarafsız). Bu gece onu ziyaret edenler: ${liste}.`);
      ekleSatir(ctx, a.hedef1, 'Bu gece sahneye çıkarıldın.');
    } else if (hedefRol.grup === 'gelenekci') {
      const mevcut = ctx.oyEtkileri.get(a.hedef1) || {};
      mevcut.oySayilmaz = true;
      ctx.oyEtkileri.set(a.hedef1, mevcut);
      ekleSatir(ctx, dqId, `${isim(ctx, a.hedef1)}'i sahnelendirdin (Gelenekçi). Yarınki oyu sayılmayacak.`);
      ekleSatir(ctx, a.hedef1, 'Bu gece sahneye çıkarıldın.');
    }
  });
}

// ─── 8. Murat C (Bastırmış / Outsider) ─────────────────────
// Murat sahte Özgürlükçü rolüyle oynar. Aksiyonu hiçbir gerçek etki yaratmaz
// ama o, sahte rolün arayüzünden "görev başarılı" izlenimi almalı. Cevap
// içeriği DOĞRU (sahte rolün muhtemel cevabı) — sadece rolün kendisi sahte.
//
// faz1-mekanik-kararlar.md Karar 2: "Gece kimi seçerse 'görev başarılı'
// sahte cevabı alır ama gerçekte hiçbir şey olmaz".
function uygulaMuratBastirmis(ctx) {
  rolSahipleri(ctx, 'bastirmis').forEach(muratId => {
    const a = ctx.aksiyonlar.get(muratId);
    if (!a || !a.gonderildi) return;
    // Murat'ın aksiyonu Sit/Gay iptaliyle düşmüş olabilir — yine de bir mesaj ver
    // ama "engellendin" havasında ima etmeden, sahte rol cevabının üretildiğini söyle.
    const sahteRol = ctx.sahteRoller.get(muratId);
    if (!sahteRol) return; // Kenar durum: oyunda Özgürlükçü yok, sahte rol atanamamış

    const hedefId = a.hedef1;
    const ikinciHedefId = a.hedef2;
    const cevap = muratSahteCevap(ctx, muratId, hedefId, ikinciHedefId, sahteRol);
    if (cevap) ekleSatir(ctx, muratId, cevap);
  });
}

// Sahte rolün muhtemel cevabını üretir. Cevap içeriği gerçek (doğru bilgi),
// ama hiçbir gerçek etki yaratılmaz — Murat'a sadece sabah panelinde gösterilir.
function muratSahteCevap(ctx, muratId, hedefId, ikinciHedefId, sahteRol) {
  const hedefAdi = hedefId ? isim(ctx, hedefId) : '?';
  // Hedef için gerçek grup (Murat hedefi sahte rolün araştırırken görür gibi)
  // Hedef BAŞKA bir Murat olamayacağı için gorunenHedefRolu ile aynı sonucu verir
  // (sadece tek Outsider). Yine de tutarlı olsun diye gorunenHedefRolu kullanıyoruz.
  const hedefRol = hedefId ? gorunenHedefRolu(ctx, hedefId) : null;
  const grupAd = hedefRol ? (GRUP_AD[hedefRol.grup] || hedefRol.grup) : '?';

  switch (sahteRol.id) {
    case 'gay':
      // Gay'in normal çıktısı: hedef özg ise rol adı, gel/tarafsız ise engel mesajı
      if (!hedefRol) return null;
      if (hedefRol.grup === 'gelenekci') {
        return `${hedefAdi} bir Gelenekçi'ydi — gece aksiyonunu engelledin.`;
      }
      if (hedefRol.grup === 'tarafsiz') {
        return `${hedefAdi} bir Tarafsız'dı — bu geceki aksiyonunu engelledin.`;
      }
      return `${hedefAdi} bir Özgürlükçü — rolü: ${hedefRol.ad}`;

    case 'crossdresser':
      return `${hedefAdi}'in yerine geçtin. Kaan bu gece seni hedef alsaydı sen ayrılacaktın; ${hedefAdi}'i hedef alsaydı senin yerinde olduğun için ${hedefAdi} ayrılacaktı.`;

    case 'drag_queen':
      // Hedefin grubu doğru gösterilir; oy etkisi yok (mekanik no-op)
      if (!hedefRol) return null;
      if (hedefRol.grup === 'ozgurlukcu') {
        return `${hedefAdi}'i sahnelendirdin (Özgürlükçü). Yarınki oyu 2 sayılacak.`;
      }
      if (hedefRol.grup === 'tarafsiz') {
        const ziyaretciler = ziyaretEdenleriBul(ctx, hedefId);
        const liste = ziyaretciler.length
          ? ziyaretciler.filter(id => id !== muratId).map(id => isim(ctx, id)).join(', ') || 'kimse'
          : 'kimse';
        return `${hedefAdi}'i sahnelendirdin (Tarafsız). Bu gece onu ziyaret edenler: ${liste}.`;
      }
      return `${hedefAdi}'i sahnelendirdin (Gelenekçi). Yarınki oyu sayılmayacak.`;

    case 'interseksuel': {
      // İnter doğru bilgi verir — hedef Murat değil, ondan dolayı bu safe
      const hedefAks = hedefId ? ctx.aksiyonlar.get(hedefId) : null;
      if (!hedefAks || !hedefAks.gonderildi || !hedefAks.hedef1) {
        return `${hedefAdi}'i izledin. Bu gece kimseye aksiyon yapmamış.`;
      }
      return `${hedefAdi}'i izledin. Hedefi: ${isim(ctx, hedefAks.hedef1)}.`;
    }

    case 'transseksuel':
      // Trans'ın aktif gece aksiyonu yok (sadece ayrılan kanalı). Genel mesaj.
      return 'Bu gece ayrılanlarla iletişim kanalın açık. (Murat sahte rol cevabı)';

    case 'ladyboy': {
      // Tüm ziyaret listesi — gerçek bilgi
      const ziyaretler = [];
      for (const [actorId, aks] of ctx.aksiyonlar.entries()) {
        if (!aks.gonderildi || !aks.hedef1) continue;
        if (actorId === muratId) continue; // Murat kendi ziyaretini listede görmesin
        if (actorId === aks.hedef1) continue;
        ziyaretler.push(`${isim(ctx, actorId)} → ${isim(ctx, aks.hedef1)}`);
      }
      return ziyaretler.length === 0
        ? 'Bu gece köyde kimse hareket etmedi.'
        : `Bu gece: ${ziyaretler.join(' • ')}`;
    }

    // V1 yeni Özgürlükçü rolleri — geceMotoru'da henüz uygulanmadı.
    // Sahte rol bu rollerden biriyse Murat'a sahte rolün BEKLENEN cevap
    // formatında, içeriği doğru olan bir mesaj döneriz.
    case 'lezbiyen':
      // "Muayene" → hedefin grup rengi
      if (!hedefRol) return null;
      return `${hedefAdi}'i muayene ettin. Grup rengi: ${grupAd}.`;

    case 'biseksuel': {
      // "İki dünyada görür" → iki hedefin o gece aksiyon var/yok
      const h1Aks = hedefId ? ctx.aksiyonlar.get(hedefId) : null;
      const h2Aks = ikinciHedefId ? ctx.aksiyonlar.get(ikinciHedefId) : null;
      const h1Var = h1Aks?.gonderildi && h1Aks.hedef1 ? 'var' : 'yok';
      const h2Adi = ikinciHedefId ? isim(ctx, ikinciHedefId) : '?';
      const h2Var = h2Aks?.gonderildi && h2Aks.hedef1 ? 'var' : 'yok';
      return `${hedefAdi}: aksiyon ${h1Var} • ${h2Adi}: aksiyon ${h2Var}.`;
    }

    case 'panseksuel': {
      // "Köprü kurar" → iki hedef arasında ziyaret var mı
      const h1Aks = hedefId ? ctx.aksiyonlar.get(hedefId) : null;
      const h2Aks = ikinciHedefId ? ctx.aksiyonlar.get(ikinciHedefId) : null;
      const baglanti =
        (h1Aks?.hedef1 === ikinciHedefId) ||
        (h2Aks?.hedef1 === hedefId);
      const h2Adi = ikinciHedefId ? isim(ctx, ikinciHedefId) : '?';
      return `${hedefAdi} ↔ ${h2Adi}: ${baglanti ? 'aralarında ziyaret var' : 'aralarında ziyaret yok'}.`;
    }

    case 'non_binary':
      // "Kimliği bulanıklaştırır" → koruma temalı, gerçek etki yok
      return `${hedefAdi}'in kimliğini bu gece bulanıklaştırdın. Araştıran roller hedefini "?" olarak görecek.`;

    case 'femboy': {
      // "Hesap tutar" → hedefin oyun başından beri aktif gece sayısı.
      // Henüz tracking yok, V1'de 0 ile placeholder verelim — Murat için
      // sadece inandırıcı bir sayı, gerçeği önemsemiyor.
      return `${hedefAdi}'in hesabını tuttun. Aktif gece sayısı: 1.`;
    }

    default:
      // Tanınmayan sahte rol — generic onay
      return hedefId
        ? `${hedefAdi}'i gece aksiyonun için seçtin. (Görev başarılı.)`
        : 'Gece sessiz geçti.';
  }
}

// ═══════════════════════════════════════════════════════════
// ─── KAOSÇULAR — 4 bireysel kazanma rolü (V1 YENİ) ─────────
// ═══════════════════════════════════════════════════════════
// Genel kurallar:
//  - Kaosçular birbirini bilmez (roller.js ortak kanal tanımlamadı).
//  - Murat hedef seçilirse sahte rolüyle (Özgürlükçü) görünür; Kaosçular onu
//    Özgürlükçü görür — bu doğru tutarlılık (mekanik etki gerçek rolde değil
//    "görünür kimliğe" bağlı; etkiler herkesin gördüğü Murat profilinde işler).
//  - Gay engeli ve DQ koruma Kaan'a özel; bu rollerin aksiyonları sadece Gay
//    "Tarafsız" gibi muamele eder (Kaosçu = ne Özg ne Gel). Karar tablosu:
//    Gay/DQ Kaosçu'yu durdurabilir mi? Tablo "Gay/DQ engelleyebilir" diyor
//    (Narsist için açıkça). Implementasyon: Gay hedef Kaosçu ise grup 'kaoscu'
//    olduğundan mevcut uygulaGayEngel "ozgurlukcu/tarafsiz/gelenekci" şubelerine
//    girmez → aksiyon iptal de olmaz, mesaj da gelmez. Karar tablosuna sadık
//    kalmak için Kaosçu rolleri kendi içlerinde "iptalEdilen.has(...)" kontrolünü
//    kullanır; mevcut Gay/DQ akışı zaten iptalEdilen'i set ettiğinde bu kontrol
//    onları durdurur. (Faz1 kararı: Gay/DQ Narsist'i engelleyebilir; aynı
//    semantik diğer 3'e de uygulanır — defansif tutum.)

// ─── Kaosçu #1 — Narsist (Okan) "Spotlight Çekme" ─────────
// Hedef ertesi gün kimlik açıklama başvurusu yapamaz (basvur handler kontrolü
// oda.oyun.okanSpotlightHedef Set'inde). Okan ek olarak hedefin O GÜNKÜ
// 1. oylama oyunu (kime oy verdiğini) öğrenir — bu sonuç birInciOylamaBitti
// sonrasında ayrı olarak Okan'a iletilir (index.js'te).
// Kazanma kümülatifi: okanSpotlightSayaci Map(okanId → Set(hedefId)).
function uygulaKaoscuNarsist(ctx) {
  rolSahipleri(ctx, 'kaoscu_narsist').forEach(okanId => {
    if (ctx.iptalEdilen.has(okanId)) return;
    const a = aksiyonu(ctx, okanId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;

    // Kendine yapamaz
    if (hedefId === okanId) {
      ekleSatir(ctx, okanId, 'Kendine spotlight yapamazsın — aksiyon boşa düştü.');
      return;
    }

    // Hedefi "yarınki kimlik açıklama yasağı" Set'ine ekle.
    // tanışma:basvur handler bu Set'i kontrol edip hedefin başvurusunu reddeder.
    if (!ctx.oda.oyun.okanSpotlightHedef) ctx.oda.oyun.okanSpotlightHedef = new Set();
    ctx.oda.oyun.okanSpotlightHedef.add(hedefId);

    // Kümülatif kazanma sayacı — hangi farklı oyuncuları spotlight'a aldı
    if (!ctx.oda.oyun.okanSpotlightSayaci) ctx.oda.oyun.okanSpotlightSayaci = new Map();
    const sayac = ctx.oda.oyun.okanSpotlightSayaci;
    const hedefSeti = sayac.get(okanId) || new Set();
    hedefSeti.add(hedefId);
    sayac.set(okanId, hedefSeti);

    // Hedef oylamada kime oy verdiğini öğrenme görevi: index.js
    // birInciOylamaBitti() içinde Okan'a "spotlight: hedefin oyu = ..." emit eder.
    // Burada hedefId'yi "bu turdaki bekleyen okan hedefi" olarak kaydedelim:
    if (!ctx.oda.oyun.okanBuTurHedefleri) ctx.oda.oyun.okanBuTurHedefleri = new Map();
    const buTur = ctx.oda.oyun.okanBuTurHedefleri.get(okanId) || new Set();
    buTur.add(hedefId);
    ctx.oda.oyun.okanBuTurHedefleri.set(okanId, buTur);

    ekleSatir(ctx, okanId,
      `${isim(ctx, hedefId)}'i spotlight'a aldın. Yarın kimlik açıklama başvurusu yapamayacak. ` +
      `Ayrıca 1. oylamadaki oyunu öğreneceksin.`);
    ekleSatir(ctx, hedefId, 'Bu gece üzerinde bir göz vardı. Yarın kimliğini açıklayamayacaksın.');
  });
}

// ─── Kaosçu #2 — Sadist (Bora) "Bozuk Sipariş" ────────────
// Hedef için sabah paneline jenerik aksilik notu eklenir + ertesi gün ilk
// sohbet mesajı 30 saniye gecikmeli iletilir (chat handler kontrolü).
// Kazanma kümülatifi:
//  - boraHedefSayaci Map(boraId → Set(hedefId)) → 4+ farklı oyuncu hedefi.
//  - boraGunSayaci Map(gun → Set(boraHedefId)) → 1. oylamada oy alanlardan 2'si.
const BORA_AKSILIK_NOTLARI = [
  'Bakkaldan aldığın ekmek küflüydü.',
  'Para üstün eksik geldi.',
  'Süt kesilmiş, dolaba yetişememiş.'
];
function uygulaSadistBora(ctx) {
  rolSahipleri(ctx, 'sadist').forEach(boraId => {
    if (ctx.iptalEdilen.has(boraId)) return;
    const a = aksiyonu(ctx, boraId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;

    // Kendine yapamaz (mantıken bakkal kendi siparişini bozmaz)
    if (hedefId === boraId) {
      ekleSatir(ctx, boraId, 'Kendine bozuk sipariş yapamazsın — aksiyon boşa düştü.');
      return;
    }

    // Gecikme Set'ine ekle (ilk mesaj kontrolü için)
    if (!ctx.oda.oyun.boraGecikme) ctx.oda.oyun.boraGecikme = new Set();
    if (!ctx.oda.oyun.boraGecikmeIlkMesaj) ctx.oda.oyun.boraGecikmeIlkMesaj = new Set();
    ctx.oda.oyun.boraGecikme.add(hedefId);
    // boraGecikmeIlkMesaj: bu hedef bu gün İLK mesajını henüz yazmadı flag'i.
    // Yeni gün başlangıcı her zaman "henüz yazmadı" demek; chat handler ilk yazımda
    // bu Set'ten çıkarıp gecikmeyi uygular.
    ctx.oda.oyun.boraGecikmeIlkMesaj.add(hedefId);

    // Sabah aksilik notu (jenerik 3 mahalle olayından rastgele)
    const not = BORA_AKSILIK_NOTLARI[Math.floor(Math.random() * BORA_AKSILIK_NOTLARI.length)];
    ekleSatir(ctx, hedefId, `Mahalle olayı: ${not}`);

    // Kümülatif: hangi farklı hedeflere uygulandı (kazanma koşulu 1)
    if (!ctx.oda.oyun.boraHedefSayaci) ctx.oda.oyun.boraHedefSayaci = new Map();
    const sayac = ctx.oda.oyun.boraHedefSayaci;
    const hedefSeti = sayac.get(boraId) || new Set();
    hedefSeti.add(hedefId);
    sayac.set(boraId, hedefSeti);

    // Bugünün hedef listesine ekle (kazanma koşulu 2: 1. oylamada oy alma)
    if (!ctx.oda.oyun.boraGunSayaci) ctx.oda.oyun.boraGunSayaci = new Map();
    const gun = ctx.oda.oyun.geceTuru || 0;
    const gunSeti = ctx.oda.oyun.boraGunSayaci.get(gun) || new Set();
    gunSeti.add(hedefId);
    ctx.oda.oyun.boraGunSayaci.set(gun, gunSeti);

    ekleSatir(ctx, boraId,
      `${isim(ctx, hedefId)}'e bozuk sipariş yolladın. Sabah paneline aksilik notu eklendi. ` +
      `Yarın ilk mesajı 30 saniye gecikecek.`);
  });
}

// ─── Kaosçu #3 — Sınır Tanımaz (Erdem) "İzinsiz Giriş" ────
// Hedefin O GECEKİ gece aksiyonunun TAM METNİNİ öğrenir (rol adı değil,
// aksiyonun ne olduğunu — kime ne yaptığı). Hedef sabah "kapın açık
// bırakılmıştı" mesajı + not defterine ZORLA jenerik 1 satır eklenir.
// Erdem öncelik 5 sayılır (bilgi rolü + ziyaret); Gay/DQ engelleyebilir
// (Gay hedef Erdem ise mevcut akışta grup 'kaoscu' → şu an Gay onu engellemez;
//  defansif: iptalEdilen.has(erdem) kontrolü).
// Kazanma kümülatifi: erdemOgrenilenHedefler Map(erdemId → Set(hedefId)).
const ERDEM_NOT_SATIRI = 'Tedirgin oldum, biri evin etrafında dolaşmış.';
function uygulaSinirTanimaz(ctx) {
  rolSahipleri(ctx, 'sinir_tanimaz').forEach(erdemId => {
    if (ctx.iptalEdilen.has(erdemId)) return;
    const a = aksiyonu(ctx, erdemId);
    if (!a || !a.hedef1) return;
    const hedefId = a.hedef1;

    // Kendine yapamaz
    if (hedefId === erdemId) {
      ekleSatir(ctx, erdemId, 'Kendine izinsiz giriş yapamazsın — aksiyon boşa düştü.');
      return;
    }

    // Hedefin o geceki aksiyonunun metnini üret.
    // Aren maskelemesi burada KASTEN UYGULANMIYOR: Erdem "fiziksel olarak"
    // hedefin evine girip not defterini görüyor → "kim olduğu" değil "ne yaptığı"
    // sorusunun cevabı. Maskeleme rol kimliğini bulanıklaştırır; aksiyon metnine
    // dokunmaz. (Bu yorumlama tutarlı: NB Aren rolün adını gizler, faaliyetini değil.)
    const hedefAks = ctx.aksiyonlar.get(hedefId);
    let aksiyonMetni = 'Hiçbir şey yapmadı (pas geçti).';
    if (hedefAks && hedefAks.gonderildi && hedefAks.hedef1) {
      const hedefRol = ctx.roller.get(hedefId);
      const rolAksAciklama = hedefRol?.geceAksiyonu ?? '?';
      const h1Ad = isim(ctx, hedefAks.hedef1);
      const h2Ad = hedefAks.hedef2 ? isim(ctx, hedefAks.hedef2) : null;
      // Aksiyon metni: hedefin rol aksiyon kısa adı + kimi hedef aldığı.
      // Rol adını VERME (görev şartı: "rol adı değil, aksiyon açıklaması").
      // Rol açıklamasını yine de "aksiyon türü" ima ediyor; ama metin oyuncuya
      // okuyacak, kim olduğu ipucundan kaçınmak için sadece "X kişisine ziyarette
      // bulundu / aksiyon yaptı" formatında özetleyelim.
      const hedefIcerik = h2Ad
        ? `${h1Ad} ve ${h2Ad} üzerinde aksiyon yaptı.`
        : `${h1Ad}'e aksiyon yaptı.`;
      aksiyonMetni = ctx.iptalEdilen.has(hedefId)
        ? `${hedefIcerik} (Bu aksiyon iptal edildi.)`
        : hedefIcerik;
    }

    ekleSatir(ctx, erdemId,
      `${isim(ctx, hedefId)}'in evine izinsiz girdin. Bu gece yaptığı: ${aksiyonMetni}`);
    ekleSatir(ctx, hedefId, 'Sabah uyandığında kapın açık bırakılmıştı.');

    // Not defterine zorla 1 satır ekle (mevcut nota append; idempotent değil —
    // her gece Erdem hedef alırsa not defterine başka bir satır daha eklenir).
    if (!ctx.oda.oyun.geceNotlari) ctx.oda.oyun.geceNotlari = new Map();
    const mevcutNot = ctx.oda.oyun.geceNotlari.get(hedefId) || '';
    const yeniNot = mevcutNot
      ? `${mevcutNot}\n${ERDEM_NOT_SATIRI}`
      : ERDEM_NOT_SATIRI;
    ctx.oda.oyun.geceNotlari.set(hedefId, yeniNot.slice(0, 1000));

    // Kümülatif kazanma sayacı
    if (!ctx.oda.oyun.erdemOgrenilenHedefler) ctx.oda.oyun.erdemOgrenilenHedefler = new Map();
    const sayac = ctx.oda.oyun.erdemOgrenilenHedefler;
    const hedefSeti = sayac.get(erdemId) || new Set();
    hedefSeti.add(hedefId);
    sayac.set(erdemId, hedefSeti);
  });
}

// ─── Kaosçu #4 — Zorba (Hakan) "Baskı Mesajı" ─────────────
// İki hedef: hedef1 = baskılanan oyuncu (A), hedef2 = yasaklı oyuncu (B).
// A ertesi gün 1. oylamada B'ye oy veremez (oy butonu UI'da grileşir + server
// reddi). Hakan oy listesini görmez, sadece yasak uygular.
// Öncelik 4 (uzaklaştırma sonrası); aksiyon mantıksal olarak diğer Kaosçularla
// aynı katmanda çalışıyor, sıralama içeriği etkilemez.
// Kazanma kümülatifi: hakanYasakliTarihce Map(hakanId → Array<{gun, baskilananId,
//   yasakliId, sonucCokOyMu}>). "sonucCokOyMu" alanı birInciOylamaBitti içinde
// doldurulur (bu fonksiyon sadece kayıt açar).
function uygulaZorbaHakan(ctx) {
  rolSahipleri(ctx, 'zorba').forEach(hakanId => {
    if (ctx.iptalEdilen.has(hakanId)) return;
    const a = aksiyonu(ctx, hakanId);
    if (!a || !a.hedef1 || !a.hedef2) {
      // Tek hedef gönderildiyse Hakan'a uyarı, aksiyon boşa
      if (a && (a.hedef1 || a.hedef2)) {
        ekleSatir(ctx, hakanId, 'Baskı mesajı için iki hedef seçmelisin (baskılanan + yasaklı). Aksiyon boşa düştü.');
      }
      return;
    }
    const baskilananId = a.hedef1;
    const yasakliId = a.hedef2;

    // Aynı kişi olamaz
    if (baskilananId === yasakliId) {
      ekleSatir(ctx, hakanId, 'Baskılanan ve yasaklı aynı kişi olamaz — aksiyon boşa düştü.');
      return;
    }
    // Kendine baskı yapamaz (yasaklı kendisi olabilir mi? — mantıken evet; ama
    // baskılananın Hakan olması anlamsız; defansif: ikisi de Hakan değil).
    if (baskilananId === hakanId) {
      ekleSatir(ctx, hakanId, 'Kendini baskılayamazsın — aksiyon boşa düştü.');
      return;
    }

    // Yarınki 1. oylama yasağı: baskilananId → yasakliId
    if (!ctx.oda.oyun.hakanYasakliOy) ctx.oda.oyun.hakanYasakliOy = new Map();
    ctx.oda.oyun.hakanYasakliOy.set(baskilananId, yasakliId);

    // Tarihçe kaydı (kazanma izleme — sonuç birInciOylamaBitti'de doldurulur)
    if (!ctx.oda.oyun.hakanYasakliTarihce) ctx.oda.oyun.hakanYasakliTarihce = new Map();
    const tarihce = ctx.oda.oyun.hakanYasakliTarihce;
    const liste = tarihce.get(hakanId) || [];
    const gun = ctx.oda.oyun.geceTuru || 0;
    liste.push({ gun, baskilananId, yasakliId, sonucCokOyMu: false });
    tarihce.set(hakanId, liste);

    ekleSatir(ctx, hakanId,
      `${isim(ctx, baskilananId)}'i baskıladın. Yarın 1. oylamada ${isim(ctx, yasakliId)}'e oy veremeyecek.`);
    ekleSatir(ctx, baskilananId,
      `Sabah telefonuna bir baskı mesajı düştü. Yarın oylamada bazı seçimler kapanmış olacak.`);
  });
}

// ─── Yardımcı: bir kişiyi kim ziyaret etti? ────────────────
function ziyaretEdenleriBul(ctx, hedefId) {
  const sonuc = [];
  for (const [actorId, aks] of ctx.aksiyonlar.entries()) {
    if (!aks.gonderildi || !aks.hedef1) continue;
    if (ctx.iptalEdilen.has(actorId)) continue;
    if (actorId === hedefId) continue; // kendine sayma
    if (aks.hedef1 === hedefId || aks.hedef2 === hedefId) {
      sonuc.push(actorId);
    }
  }
  return sonuc;
}

// ─── Sabah açıklamaları (ayrılanlar, not defteri vb.) ──────
function ayrilanAciklamalari(ctx) {
  const aciklamalar = [];
  for (const id of ctx.ayrilanlar) {
    const oyuncu = ctx.oda.players.find(p => p.id === id);
    const rol = ctx.roller.get(id);
    const not = ctx.oda.oyun.geceNotlari?.get(id) || '';
    aciklamalar.push({
      oyuncuId: id,
      isim: oyuncu?.isim || '?',
      rol: rol ? {
        ad: rol.ad,
        grup: rol.grup,
        sembol: GRUP_SEMBOL[rol.grup],
        karakter: rol.karakter,    // v1.6 — Madde 5: portre için
        gorsel: rol.gorsel
      } : null,
      not: not.trim()
    });
  }
  return aciklamalar;
}

// ─── Kazanma kontrolleri (test edilebilir saf fonksiyonlar) ─────────────────
// index.js bitiseBasla içinden çağrılır. Saf: yalnız oda state'ini okur.

// Fuckbuddy (Tuna): aynı oyuncuyu ≥3 farklı gece hedef al + o oyuncu köyde kalsın.
function fuckbuddyKazandiMi(oda, oyuncuId) {
  const takip = oda?.oyun?.fbTakip?.get(oyuncuId);
  if (!takip) return false;
  for (const [hedefId, sayi] of takip.entries()) {
    if (sayi >= 3) {
      const hedef = oda.players.find(p => p.id === hedefId);
      if (hedef && hedef.koydeMi !== false) return true;
    }
  }
  return false;
}

// Sugar Daddy (Eren): en az bir oyuncuya 2 kez yatırım + o oyuncu köyde kalsın.
function sugarDaddyKazandiMi(oda, oyuncuId) {
  const yat = oda?.oyun?.sdYatirim?.get(oyuncuId);
  if (!yat) return false;
  for (const [hedefId, sayi] of yat.entries()) {
    if (sayi >= 2) {
      const hedef = oda.players.find(p => p.id === hedefId);
      if (hedef && hedef.koydeMi !== false) return true;
    }
  }
  return false;
}

// Hetero Kadın (Bahar): en az 2 erkek + 2 kadın farklı hedef seçmiş olmalı.
function heteroKadinKazandiMi(oda, oyuncuId) {
  const m = oda?.oyun?.hkHedefler?.get(oyuncuId);
  if (!m) return false;
  let e = 0, k = 0;
  for (const c of m.values()) { if (c === 'erkek') e++; else if (c === 'kadin') k++; }
  return e >= 2 && k >= 2;
}
// Aseksüel (Irmak): 3 farklı oyuncuyu başarıyla stalk etmiş olmalı.
function aseksuelKazandiMi(oda, oyuncuId) {
  return (oda?.oyun?.asHedefler?.get(oyuncuId)?.size ?? 0) >= 3;
}
// Fetişist (Kartal): etiketine uyan 3 farklı oyuncu tespit etmiş olmalı.
function fetisistKazandiMi(oda, oyuncuId) {
  return (oda?.oyun?.ftDogru?.get(oyuncuId)?.size ?? 0) >= 3;
}
// Dul (Fatma): 3 farklı oyuncudan anı toplamış olmalı.
function dulKazandiMi(oda, oyuncuId) {
  return (oda?.oyun?.dulAnilar?.get(oyuncuId)?.size ?? 0) >= 3;
}
// Poliamorist (Ekin): 3 farklı oyuncunun rol harfini öğrenmiş olmalı.
function poliamoristKazandiMi(oda, oyuncuId) {
  return (oda?.oyun?.poliOgrendi?.get(oyuncuId)?.size ?? 0) >= 3;
}

module.exports = { geceyiCozumle, ayrilanAciklamalari, GRUP_AD, GRUP_SEMBOL, fuckbuddyKazandiMi, sugarDaddyKazandiMi, aksiyonTipiBul, heteroKadinKazandiMi, aseksuelKazandiMi, fetisistKazandiMi, dulKazandiMi, poliamoristKazandiMi };
