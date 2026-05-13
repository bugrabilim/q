// Queer Quest Quench — Gece Çözümleme Motoru
// Belge Bölüm 9 (Gece Aksiyonları) ve Bölüm 14 (Kenar Durumlar)
//
// Giriş: oda.oyun.geceAksiyonlari (Map: oyuncuId → { hedef1, hedef2, gonderildi })
//        oda.oyun.roller (Map: oyuncuId → rol objesi)
//        oda.players (oyuncu listesi)
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

  // Adım 1.5: Situationship karşılıklı iptal — Gay'den sonra, DQ'dan önce çalışmalı
  // çünkü "yapışılan" kişinin aksiyonu henüz işlenmeden iptalEdilen'e eklenebilmeli
  uygulaSituationshipIptal(ctx);

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

  // Adım 6: Bilgi rolleri (İnterseksüel, Ladyboy)
  uygulaBilgiRolleri(ctx);

  // Adım 7: Drag Queen sahnelendirme bilgi/oy etkileri (Kaan iptal olmadıysa zaten 2'de hesaplandı)
  uygulaDQEtkileri(ctx);

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
    aksiyonlar: oda.oyun.geceAksiyonlari,
    ozelCinsiyet: oda.oyun.karakterCinsiyetleri || new Map(),

    // Hedefin "görünen" karşılığı (transport sonrası)
    gercekHedef: new Map(),  // oyuncuId → ziyaret etse "kimi gördü gibi davranır"
    cdYerineKimGecti: new Map(), // CD id → seçtiği hedef id

    // İptal bayrakları
    iptalEdilen: new Set(), // bu kişilerin aksiyonu iptal (Gay engeli, Situationship vb.)

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

  return ctx;
}

// ─── Yardımcılar ────────────────────────────────────────────
function rolu(ctx, id) {
  return ctx.roller.get(id);
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
    const hedefRol = rolu(ctx, hedefId);
    if (!hedefRol) return;

    if (hedefRol.grup === 'gelenekci') {
      ctx.iptalEdilen.add(hedefId);
      ekleSatir(ctx, gayId, `${isim(ctx, hedefId)} bir Gelenekçi'ydi — gece aksiyonunu engelledin.`);

      // Eğer engellenen Kaan'sa, hedefi vardı ve iptal edildi → yine de "baskı" duyurusu
      if (hedefRol.id === 'homofobik' && a.hedef1) {
        const kaanAks = ctx.aksiyonlar.get(hedefId);
        if (kaanAks?.gonderildi && kaanAks.hedef1) {
          ctx.kaanGirisimVardi = true;
        }
      }
    } else if (hedefRol.grup === 'tarafsiz') {
      ctx.iptalEdilen.add(hedefId);
      ekleSatir(ctx, gayId, `${isim(ctx, hedefId)} bir Tarafsız'dı — bu geceki aksiyonunu engelledin.`);
    } else if (hedefRol.grup === 'ozgurlukcu') {
      ekleSatir(ctx, gayId, `${isim(ctx, hedefId)} bir Özgürlükçü — rolü: ${hedefRol.ad}`);
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
    const hedefRol = rolu(ctx, hedefId);
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
}

// ─── 5. Tarafsız aksiyonlar ────────────────────────────────
function uygulaTarafsizlar(ctx) {
  // Hetero Erkek — Özgürlükçüye giderse ziyaretçiler, Kaan'a giderse görev
  rolSahipleri(ctx, 'hetero_erkek').forEach(heId => {
    const a = aksiyonu(ctx, heId);
    if (!a || !a.hedef1) return;
    const hedefRol = rolu(ctx, a.hedef1);

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

  // Koca Karı — iki kişi karşılaştır
  rolSahipleri(ctx, 'koca_kari').forEach(kkId => {
    const a = aksiyonu(ctx, kkId);
    if (!a || !a.hedef1 || !a.hedef2) return;
    const r1 = rolu(ctx, a.hedef1);
    const r2 = rolu(ctx, a.hedef2);
    if (!r1 || !r2) return;
    const ayni = r1.grup === r2.grup;
    ekleSatir(ctx, kkId, `${isim(ctx, a.hedef1)} ve ${isim(ctx, a.hedef2)}'i araştırdın. Sonuç: ${ayni ? 'AYNI grupta' : 'FARKLI gruplarda'}.`);
  });
}

// ─── 6. Bilgi rolleri (İnterseksüel, Ladyboy) ──────────────
function uygulaBilgiRolleri(ctx) {
  // İnterseksüel — hedefin o gece kime aksiyon yaptığını öğrenir
  rolSahipleri(ctx, 'interseksuel').forEach(intId => {
    const a = aksiyonu(ctx, intId);
    if (!a || !a.hedef1) return;
    const hedefAks = ctx.aksiyonlar.get(a.hedef1);
    if (!hedefAks || !hedefAks.gonderildi || !hedefAks.hedef1) {
      ekleSatir(ctx, intId, `${isim(ctx, a.hedef1)}'i izledin. Bu gece kimseye aksiyon yapmamış.`);
    } else if (ctx.iptalEdilen.has(a.hedef1)) {
      ekleSatir(ctx, intId, `${isim(ctx, a.hedef1)}'i izledin. ${isim(ctx, hedefAks.hedef1)}'e gitmek istemiş ama aksiyonu iptal olmuş.`);
    } else {
      ekleSatir(ctx, intId, `${isim(ctx, a.hedef1)}'i izledin. Hedefi: ${isim(ctx, hedefAks.hedef1)}.`);
    }
  });

  // Ladyboy — tüm gece ziyaret listesi
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
      ziyaretler.push(`${isim(ctx, actorId)} → ${isim(ctx, aks.hedef1)}`);
    }
    if (ziyaretler.length === 0) {
      ekleSatir(ctx, lbId, 'Bu gece köyde kimse hareket etmedi.');
    } else {
      ekleSatir(ctx, lbId, `Bu gece: ${ziyaretler.join(' • ')}`);
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
    const hedefRol = rolu(ctx, a.hedef1);
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
      rol: rol ? { ad: rol.ad, grup: rol.grup, sembol: GRUP_SEMBOL[rol.grup] } : null,
      not: not.trim()
    });
  }
  return aciklamalar;
}

module.exports = { geceyiCozumle, ayrilanAciklamalari, GRUP_AD, GRUP_SEMBOL };
