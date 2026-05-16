// Q — Ses Yöneticisi
// Tek-örnek (singleton) modül: müzik çalma, yumuşak geçiş (crossfade),
// UI efektleri ve ses seviyesi yönetimi. Kullanıcı tercihleri localStorage'da kalıcı.
//
// Müzik dosyaları talep üzerine yüklenir (html5 stream — mobil bellek/veri dostu).
// Varsayılan durum: ses kapalı. Kullanıcı "Sesi Aç"a basana kadar hiçbir şey çalmaz.
//
// Parça bitimi: çoklu parçalı fazlarda (gündüz, gece, savunma) bir parça bitmeden
// önce sıradakine crossfade ile geçilir — sahne geçişi olmadan ham restart yok.
// Tek parçalı fazlarda (sabah, bitiş) parça kendine sarar (native loop).

import { Howl, Howler } from 'howler';
import { MUZIK_DOSYALARI, EFEKT_DOSYALARI } from './sesHaritasi.js';

const GECIS_MS = 1000; // crossfade / fade süresi
const VARSAYILAN = { master: 0.7, muzik: 0.5, efekt: 0.7 };

const LS = {
  aktif: 'q-ses-aktif',
  master: 'q-ses-master',
  muzik: 'q-ses-muzik',
  efekt: 'q-ses-efekt',
};

function lsSayiOku(anahtar, varsayilan) {
  const ham = localStorage.getItem(anahtar);
  if (ham === null) return varsayilan;
  const sayi = parseFloat(ham);
  return Number.isNaN(sayi) ? varsayilan : sayi;
}

// ─── Durum ───
let sesAktif = localStorage.getItem(LS.aktif) === 'true';
const seviye = {
  master: lsSayiOku(LS.master, VARSAYILAN.master),
  muzik: lsSayiOku(LS.muzik, VARSAYILAN.muzik),
  efekt: lsSayiOku(LS.efekt, VARSAYILAN.efekt),
};

Howler.volume(seviye.master); // master ses Howler'ın genel seviyesi

const muzikOnbellek = {}; // dosyaYolu → Howl
const efektOnbellek = {}; // efektAdi → Howl
let aktifMuzik = null; // { faz, dosya, howl, sonrakiZamanlayici }

// ─── Yardımcılar ───
function dosyaninFazi(dosya) {
  for (const f in MUZIK_DOSYALARI) {
    if (MUZIK_DOSYALARI[f].includes(dosya)) return f;
  }
  return null;
}

function muzikHowlAl(dosya) {
  if (!muzikOnbellek[dosya]) {
    const faz = dosyaninFazi(dosya);
    const cogul = !!faz && MUZIK_DOSYALARI[faz].length > 1;
    muzikOnbellek[dosya] = new Howl({
      src: [dosya],
      // Çoklu parçalı fazda native loop kapalı — bitmeden sıradakine geçeceğiz.
      // Tek parçalı fazda native loop ile kendine sarar.
      loop: !cogul,
      volume: 0,
      html5: true,
    });
  }
  return muzikOnbellek[dosya];
}

function efektHowlAl(ad) {
  const dosya = EFEKT_DOSYALARI[ad];
  if (!dosya) return null;
  if (!efektOnbellek[ad]) {
    efektOnbellek[ad] = new Howl({ src: [dosya], volume: seviye.efekt });
  }
  return efektOnbellek[ad];
}

// Belirli bir dosyayı başlatır, eskiyi fade-out + yeniyi fade-in ile geçer.
// Çoklu parçalı faz ise parça bitmeden önce sıradakine geçecek zamanlayıcı kurar.
function muzikCalDosya(faz, dosya) {
  const yeni = muzikHowlAl(dosya);
  const cogul = MUZIK_DOSYALARI[faz].length > 1;

  // Eskiyi yumuşakça kapat + zamanlayıcısını iptal et
  if (aktifMuzik && aktifMuzik.howl !== yeni) {
    if (aktifMuzik.sonrakiZamanlayici) clearTimeout(aktifMuzik.sonrakiZamanlayici);
    const eski = aktifMuzik.howl;
    eski.fade(eski.volume(), 0, GECIS_MS);
    eski.once('fade', () => eski.stop());
  } else if (aktifMuzik && aktifMuzik.sonrakiZamanlayici) {
    // Aynı Howl'a tekrar gelinirse eski zamanlayıcıyı iptal et
    clearTimeout(aktifMuzik.sonrakiZamanlayici);
  }

  // Yeniyi yumuşakça aç
  if (!yeni.playing()) yeni.play();
  yeni.fade(yeni.volume(), seviye.muzik, GECIS_MS);

  aktifMuzik = { faz, dosya, howl: yeni, sonrakiZamanlayici: null };

  // Çoklu parça fazlarda: parça bitmeden GECIS_MS önce sıradakine geç.
  // Ayrıca onend fallback'i: timer kaçırılırsa (sekme arka planda, throttle vs.)
  // veya süre kestirimi yanlışsa, parça gerçekten bitince zinciri devam ettir.
  if (cogul) {
    const planla = (sureSn) => {
      const gecmeAni = Math.max(1000, sureSn * 1000 - GECIS_MS);
      const id = setTimeout(() => {
        // Hâlâ aynı faz ve aynı parça çalıyorsa sırayı ilerlet
        if (aktifMuzik && aktifMuzik.faz === faz && aktifMuzik.howl === yeni) {
          sirayaGec(faz);
        }
      }, gecmeAni);
      if (aktifMuzik) aktifMuzik.sonrakiZamanlayici = id;
    };
    const s = yeni.duration();
    if (s > 0) planla(s);
    else if (yeni.state() === 'loaded') planla(yeni.duration());
    else yeni.once('load', () => planla(yeni.duration()));

    // Güvenlik ağı: parça bittiğinde hâlâ aynı faz/parça aktifse sıradakine geç.
    // (loop:false olduğu için 'end' tetiklenir; her muzikCalDosya çağrısında
    // yeni bir 'once' kaydı kurulur.)
    yeni.once('end', () => {
      if (aktifMuzik && aktifMuzik.faz === faz && aktifMuzik.howl === yeni) {
        if (aktifMuzik.sonrakiZamanlayici) clearTimeout(aktifMuzik.sonrakiZamanlayici);
        sirayaGec(faz);
      }
    });
  }
}

// Aynı fazın bir sonraki parçasına geçer (mevcut hariç rastgele).
function sirayaGec(faz) {
  const secenekler = MUZIK_DOSYALARI[faz];
  if (!secenekler || secenekler.length === 0) return;
  const digerleri = secenekler.filter((d) => d !== aktifMuzik?.dosya);
  const havuz = digerleri.length > 0 ? digerleri : secenekler;
  const sonraki = havuz[Math.floor(Math.random() * havuz.length)];
  muzikCalDosya(faz, sonraki);
}

// ─── Genel API ───

export function sesiEtkinlestir() {
  sesAktif = true;
  localStorage.setItem(LS.aktif, 'true');
}

export function sesiKapat() {
  sesAktif = false;
  localStorage.setItem(LS.aktif, 'false');
  muzikDurdur();
}

export function sesAktifMi() {
  return sesAktif;
}

// Verilen faz için müzik çalar. Mevcut müzik varsa crossfade ile geçer.
// Aynı faz zaten çalıyorsa hiçbir şey yapmaz (parça baştan başlamaz).
export function muzikCal(faz) {
  if (!sesAktif) return;
  if (!faz) {
    muzikDurdur();
    return;
  }
  if (aktifMuzik && aktifMuzik.faz === faz) return;

  const secenekler = MUZIK_DOSYALARI[faz];
  if (!secenekler || secenekler.length === 0) return;
  const dosya = secenekler[Math.floor(Math.random() * secenekler.length)];
  muzikCalDosya(faz, dosya);
}

// Çalan müziği yumuşakça durdurur ve sıradaki zamanlayıcıyı iptal eder.
export function muzikDurdur() {
  if (aktifMuzik) {
    if (aktifMuzik.sonrakiZamanlayici) clearTimeout(aktifMuzik.sonrakiZamanlayici);
    const h = aktifMuzik.howl;
    h.fade(h.volume(), 0, GECIS_MS);
    h.once('fade', () => h.stop());
  }
  aktifMuzik = null;
}

// Kısa UI efekti çalar (tikla, oylama, bildirim, ayrilma, kazan, notdefteri).
export function efektCal(ad) {
  if (!sesAktif) return;
  const h = efektHowlAl(ad);
  if (h) h.play();
}

// ─── Ses seviyesi (0–1 arası) ───
export function setMaster(deger) {
  seviye.master = deger;
  localStorage.setItem(LS.master, String(deger));
  Howler.volume(deger);
}

export function setMuzikSes(deger) {
  seviye.muzik = deger;
  localStorage.setItem(LS.muzik, String(deger));
  if (aktifMuzik && aktifMuzik.howl) aktifMuzik.howl.volume(deger);
}

export function setEfektSes(deger) {
  seviye.efekt = deger;
  localStorage.setItem(LS.efekt, String(deger));
  for (const ad in efektOnbellek) efektOnbellek[ad].volume(deger);
}

export function seviyeAl() {
  return { ...seviye };
}

// Geliştirme modunda tarayıcı konsolundan test için:
//   Q_SES.sesiEtkinlestir(); Q_SES.muzikCal('gece');
if (import.meta.env.DEV) {
  window.Q_SES = {
    muzikCal,
    muzikDurdur,
    efektCal,
    sesiEtkinlestir,
    sesiKapat,
    sesAktifMi,
    seviyeAl,
    setMaster,
    setMuzikSes,
    setEfektSes,
  };
}
