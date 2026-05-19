// Queer Quest Quench — Faz 2: Lobi (Oda Bekleme)

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import SesButonu from '../ses/SesButonu.jsx';
import KarakterPortresi from '../bilesenler/KarakterPortresi.jsx';
import { uzunHikayeyiAl } from '../karakterler/hikayeler.js';
import RolHavuzuPaneli from './RolHavuzuPaneli.jsx';
import './LobiEkrani.css';

const GRUP_BILGI = {
  ozgurlukcu: { ad: 'Özgürlükçü', renk: 'var(--ozgurlukcu)', sembol: '🟢' },
  tarafsiz:   { ad: 'Tarafsız',   renk: 'var(--tarafsiz)',   sembol: '🟡' },
  gelenekci:  { ad: 'Gelenekçi',  renk: 'var(--gelenekci)',  sembol: '🔴' },
  outsider:   { ad: 'Outsider',   renk: 'var(--outsider, #9AA0A6)', sembol: '⚪' },
  kaoscu:     { ad: 'Kaosçu',     renk: 'var(--kaoscu, #1A1A1A)',   sembol: '⚫' }
};

// v1.8 — Grup bazlı "Ne yapmak istiyorsun?" niyet metinleri
const GRUP_NIYETLERI = {
  ozgurlukcu: 'Gelenekçileri köyden uzaklaştırıp kim olduğunla özgürce yaşamak.',
  outsider:   'Köyde kalıp Özgürlükçüler kazansın istiyorsun — ama farkında olmadan onları zayıflatıyorsun.',
  tarafsiz:   'Kendi bireysel hedefini tamamlamak — "Nasıl kazanırsın?" altında ne aradığın yazılı.',
  gelenekci:  'Özgürlükçüleri köyden uzaklaştırıp eski düzeni kurmak.',
  kaoscu:     'Kendi kaos hedefini sessizce gerçekleştirmek — "Nasıl kazanırsın?" altında yazılı.'
};

// v1.8 — Karakter burçları (tematik atama; kişilik + meslek + hikaye uyumu)
const ROL_BURCLARI = {
  // Özgürlükçüler
  gay:           { sembol: '♎', ad: 'Terazi' },
  lezbiyen:      { sembol: '♍', ad: 'Başak' },
  biseksuel:     { sembol: '♊', ad: 'İkizler' },
  transseksuel:  { sembol: '♋', ad: 'Yengeç' },
  interseksuel:  { sembol: '♒', ad: 'Kova' },
  panseksuel:    { sembol: '♐', ad: 'Yay' },
  non_binary:    { sembol: '♓', ad: 'Balık' },
  crossdresser:  { sembol: '♈', ad: 'Koç' },
  drag_queen:    { sembol: '♌', ad: 'Aslan' },
  femboy:        { sembol: '♉', ad: 'Boğa' },
  ladyboy:       { sembol: '♏', ad: 'Akrep' },
  // Outsider
  bastirmis:     { sembol: '♑', ad: 'Oğlak' },
  // Tarafsızlar
  hetero_erkek:  { sembol: '♌', ad: 'Aslan' },
  hetero_kadin:  { sembol: '♊', ad: 'İkizler' },
  aseksuel:      { sembol: '♒', ad: 'Kova' },
  copcatan:      { sembol: '♎', ad: 'Terazi' },
  fetisist:      { sembol: '♍', ad: 'Başak' },
  sugar_baby:    { sembol: '♓', ad: 'Balık' },
  sugar_daddy:   { sembol: '♑', ad: 'Oğlak' },
  capkin:        { sembol: '♐', ad: 'Yay' },
  mazosist:      { sembol: '♏', ad: 'Akrep' },
  koca_kari:     { sembol: '♉', ad: 'Boğa' },
  poliamorist:   { sembol: '♊', ad: 'İkizler' },
  fuckbuddy:     { sembol: '♈', ad: 'Koç' },
  lovebuddy:     { sembol: '♋', ad: 'Yengeç' },
  situationship: { sembol: '♓', ad: 'Balık' },
  // Gelenekçiler
  homofobik:     { sembol: '♉', ad: 'Boğa' },
  transfobik:    { sembol: '♑', ad: 'Oğlak' },
  bifobik:       { sembol: '♏', ad: 'Akrep' },
  erkek_dusmani: { sembol: '♈', ad: 'Koç' },
  muhafazakar:   { sembol: '♑', ad: 'Oğlak' },
  dinci:         { sembol: '♍', ad: 'Başak' },
  nb_karsiti:    { sembol: '♍', ad: 'Başak' },
  cinsiyetci:    { sembol: '♌', ad: 'Aslan' },
  // Kaosçular
  kaoscu_narsist:{ sembol: '♌', ad: 'Aslan' },
  sadist:        { sembol: '♏', ad: 'Akrep' },
  sinir_tanimaz: { sembol: '♐', ad: 'Yay' },
  zorba:         { sembol: '♈', ad: 'Koç' }
};

// V1 — Outsider/Kaosçu üst sınırları (host paneli için)
const OUTSIDER_MAX = 1;
const KAOSCU_MAX = 3;

// Madde 5: Önerilen dağılım tablosu (statik — server'daki DENGE ile eşleşir)
// V1: outsider/kaoscu opsiyonel; default 0 — host isterse aktive eder
const DENGE_ONERILEN = {
  4:  { ozgurlukcu: 2, tarafsiz: 1, gelenekci: 1, outsider: 0, kaoscu: 0 },
  5:  { ozgurlukcu: 2, tarafsiz: 2, gelenekci: 1, outsider: 0, kaoscu: 0 },
  6:  { ozgurlukcu: 2, tarafsiz: 2, gelenekci: 2, outsider: 0, kaoscu: 0 },
  7:  { ozgurlukcu: 3, tarafsiz: 2, gelenekci: 2, outsider: 0, kaoscu: 0 },
  8:  { ozgurlukcu: 3, tarafsiz: 3, gelenekci: 2, outsider: 0, kaoscu: 0 },
  9:  { ozgurlukcu: 4, tarafsiz: 3, gelenekci: 2, outsider: 0, kaoscu: 0 },
  10: { ozgurlukcu: 4, tarafsiz: 3, gelenekci: 3, outsider: 0, kaoscu: 0 },
  11: { ozgurlukcu: 5, tarafsiz: 3, gelenekci: 3, outsider: 0, kaoscu: 0 },
  12: { ozgurlukcu: 6, tarafsiz: 3, gelenekci: 3, outsider: 0, kaoscu: 0 }
};
const OYUNCU_SAYILARI = [4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function LobiEkrani({ kod, benimIsmim, oyuncuId, onAyril }) {
  const [durum, setDurum] = useState({
    kod, players: [], oyuncuSayisi: 0, minOyuncu: 4, maxOyuncu: 99, ayarlar: null
  });
  const [baslatHatasi, setBaslatHatasi] = useState('');
  const [botEkleHatasi, setBotEkleHatasi] = useState('');
  const [roller, setRoller] = useState([]);
  const [seciliRol, setSeciliRol] = useState(null); // popup'ta gösterilen rol
  // v1.6 — Madde 1: Önerilen Dağılım ve Roller artık popup'ta açılır
  const [dagilimPopupAcik, setDagilimPopupAcik] = useState(false);
  const [rollerPopupAcik, setRollerPopupAcik] = useState(false);
  // Madde 4: Host'un düzenlemekte olduğu dağılım (uygulamadan önce)
  const [hostSecim, setHostSecim] = useState(null);
  const [hostHata, setHostHata] = useState('');

  useEffect(() => {
    function odaDurumGuncelle(yeniDurum) { setDurum(yeniDurum); }
    socket.on('oda:durum', odaDurumGuncelle);
    // Mount'ta anlık durumu çek (event gecikmesine karşı)
    socket.emit('lobi:durumIste', null, (cevap) => {
      if (cevap?.ok && cevap.durum) setDurum(cevap.durum);
    });
    // Madde 3: Tüm rolleri çek
    socket.emit('roller:listele', null, (cevap) => {
      if (cevap?.ok && Array.isArray(cevap.roller)) setRoller(cevap.roller);
    });
    return () => socket.off('oda:durum', odaDurumGuncelle);
  }, []);

  const benOyuncu = durum.players.find(p => p.isim === benimIsmim);
  const benHostMu = !!benOyuncu?.hostMu;
  const yeterliOyuncu = durum.oyuncuSayisi >= durum.minOyuncu;
  const dolu = durum.oyuncuSayisi >= durum.maxOyuncu;

  // Madde 4: Aktif dağılım — host ayarı varsa onu, yoksa önerilen (dagilimHesapla)
  // V1: 5 grup (ozg + tar + gel + outsider + kaoscu). Eski oyunlarda outsider/kaoscu eksik
  // olabilir; defaultlarla normalize edilir.
  const aktifDagilimHam = durum.ayarlar?.dagilim
    || dagilimHesapla(durum.oyuncuSayisi)
    || { ozgurlukcu: 0, tarafsiz: 0, gelenekci: 0, outsider: 0, kaoscu: 0 };
  const aktifDagilim = {
    ozgurlukcu: aktifDagilimHam.ozgurlukcu || 0,
    tarafsiz:   aktifDagilimHam.tarafsiz   || 0,
    gelenekci:  aktifDagilimHam.gelenekci  || 0,
    outsider:   aktifDagilimHam.outsider   || 0,
    kaoscu:     aktifDagilimHam.kaoscu     || 0
  };

  // v1.7 — Tanışma'da kaç kişi kimlik açıklasın (host seçer; 0-3; default 1)
  const kimlikAciklamaAdedi = Number.isInteger(durum.ayarlar?.kimlikAciklamaAdedi)
    ? durum.ayarlar.kimlikAciklamaAdedi
    : 1;

  // v1.8 — Host'un seçeceği süreler (saniye)
  const TARTISMA_SURELERI = [30, 60, 90, 120, 180, 240];
  const FAZ_SURELERI = [10, 20, 30, 40];
  const tartismaSuresi = TARTISMA_SURELERI.includes(durum.ayarlar?.tartismaSuresi)
    ? durum.ayarlar.tartismaSuresi : 120;
  const geceSuresi = FAZ_SURELERI.includes(durum.ayarlar?.geceSuresi)
    ? durum.ayarlar.geceSuresi : 30;
  const sabahSuresi = FAZ_SURELERI.includes(durum.ayarlar?.sabahSuresi)
    ? durum.ayarlar.sabahSuresi : 30;
  const savunmaSuresi = FAZ_SURELERI.includes(durum.ayarlar?.savunmaSuresi)
    ? durum.ayarlar.savunmaSuresi : 20;

  // Oyuncu sayısı veya server ayarı değişince host düzenlemesini senkronize et
  useEffect(() => {
    setHostSecim(null);
    setHostHata('');
  }, [durum.oyuncuSayisi, durum.ayarlar]);

  // Host düzenleme modunda — gerçek aktif değer (5 grup)
  const duzenlemeDagilim = hostSecim || aktifDagilim;
  const hostToplam =
    duzenlemeDagilim.ozgurlukcu +
    duzenlemeDagilim.tarafsiz +
    duzenlemeDagilim.gelenekci +
    duzenlemeDagilim.outsider +
    duzenlemeDagilim.kaoscu;
  const hostGecerli =
    hostToplam === durum.oyuncuSayisi &&
    duzenlemeDagilim.gelenekci >= 0 &&
    duzenlemeDagilim.outsider >= 0 && duzenlemeDagilim.outsider <= OUTSIDER_MAX &&
    duzenlemeDagilim.kaoscu >= 0 && duzenlemeDagilim.kaoscu <= KAOSCU_MAX &&
    durum.oyuncuSayisi >= durum.minOyuncu;

  // v1.6 — Madde 1 (rev): +/- bastığında otomatik dengele + anında server'a uygula.
  // V1: 5 grup (ozg + tar + gel + outsider + kaoscu). Outsider 0-1, Kaosçu 0-3.
  // Toplam korunur: hedef grup artarsa başka birinden düşülür; azaltılırsa başkasına eklenir.
  // Outsider/Kaosçu değişimi → karşı taraf ana gruplar (ozg/tar/gel). Bu sayede Kaan ≥ 1
  // korunur ve mevcut Özg/Tar/Gel mantığı bozulmaz.
  function hostDegistir(grup, delta) {
    setHostHata('');
    const base = { ...(hostSecim || aktifDagilim) };
    const yeniDeger = base[grup] + delta;

    // Min/max sınırları
    if (grup === 'gelenekci' && yeniDeger < 0) return;
    if (grup === 'outsider' && (yeniDeger < 0 || yeniDeger > OUTSIDER_MAX)) return;
    if (grup === 'kaoscu' && (yeniDeger < 0 || yeniDeger > KAOSCU_MAX)) return;
    if (yeniDeger < 0) return;

    base[grup] = yeniDeger;

    // Dengeleme havuzu: outsider/kaoscu değişirse karşı taraf üç ana gruptur.
    // Ozg/Tar/Gel değişirse karşı taraf diğer iki ana gruptur (outsider/kaoscu sabit kalır).
    const ANA_GRUPLAR = ['ozgurlukcu', 'tarafsiz', 'gelenekci'];
    const diger = (grup === 'outsider' || grup === 'kaoscu')
      ? ANA_GRUPLAR.slice()
      : ANA_GRUPLAR.filter(g => g !== grup);

    if (delta > 0) {
      // Bir grup arttı — başka birinden düş. En yüksekten başla; gelenekçi ≥ 1 korunur.
      const sirali = diger.sort((a, b) => base[b] - base[a]);
      let dusuldu = false;
      for (const g of sirali) {
        const altSinir = 0;
        if (base[g] > altSinir) { base[g] -= 1; dusuldu = true; break; }
      }
      // Karşıdan düşülecek alan yoksa (örn. herkes alt sınırda) — değişikliği geri al
      if (!dusuldu) return;
    } else if (delta < 0) {
      // Bir grup azaldı — başka birine ekle (en düşük olanı tercih et).
      const sirali = diger.sort((a, b) => base[a] - base[b]);
      base[sirali[0]] += 1;
    }

    setHostSecim(base);
    socket.emit('lobi:ayar', { dagilim: base }, (cevap) => {
      if (!cevap?.ok) setHostHata(cevap?.hata || 'Ayar uygulanamadı');
    });
  }

  // v1.7 — Host: Tanışma'da kimlik açıklayacak kişi sayısını seç
  function hostKimlikAcAdediSec(yeniDeger) {
    setHostHata('');
    if (!Number.isInteger(yeniDeger) || yeniDeger < 0 || yeniDeger > 3) return;
    if (yeniDeger === kimlikAciklamaAdedi) return;
    socket.emit('lobi:ayar', { kimlikAciklamaAdedi: yeniDeger }, (cevap) => {
      if (!cevap?.ok) setHostHata(cevap?.hata || 'Ayar uygulanamadı');
    });
  }

  // v1.8 — Tartışma süresi seçimi (30/60/90/120/180/240 sn)
  function hostTartismaSuresiSec(yeniSn) {
    setHostHata('');
    if (!TARTISMA_SURELERI.includes(yeniSn)) return;
    if (yeniSn === tartismaSuresi) return;
    socket.emit('lobi:ayar', { tartismaSuresi: yeniSn }, (cevap) => {
      if (!cevap?.ok) setHostHata(cevap?.hata || 'Ayar uygulanamadı');
    });
  }

  // v1.8 — Gece/Sabah/Savunma süresi seçimi (10/20/30/40 sn)
  function hostFazSuresiSec(alan, yeniSn) {
    setHostHata('');
    if (!FAZ_SURELERI.includes(yeniSn)) return;
    socket.emit('lobi:ayar', { [alan]: yeniSn }, (cevap) => {
      if (!cevap?.ok) setHostHata(cevap?.hata || 'Ayar uygulanamadı');
    });
  }

  // "Önerileni Uygula" — server'a null gönder (server önerilen denge tablosuna döner)
  function hostOnerileniUygula() {
    setHostHata('');
    setHostSecim(null);
    socket.emit('lobi:ayar', { dagilim: null }, (cevap) => {
      if (!cevap?.ok) setHostHata(cevap?.hata || 'Sıfırlanamadı');
    });
  }

  function odadanAyril() {
    socket.emit('oda:ayril');
    onAyril();
  }

  function oyunuBaslat() {
    setBaslatHatasi('');
    socket.emit('oyun:baslat', null, (cevap) => {
      if (!cevap?.ok) setBaslatHatasi(cevap?.hata || 'Başlatılamadı');
    });
  }

  function botEkle() {
    setBotEkleHatasi('');
    socket.emit('bot:ekle', null, (cevap) => {
      if (!cevap?.ok) setBotEkleHatasi(cevap?.hata || 'Bot eklenemedi');
    });
  }

  function botSil(botId) {
    socket.emit('bot:sil', { botId });
  }

  // v1.8 — Host gerçek oyuncuyu odadan çıkarır
  function oyuncuCikar(hedefId, hedefIsim) {
    if (!window.confirm(`${hedefIsim} adlı oyuncuyu odadan çıkarmak istediğine emin misin? Bu oyuncu odaya tekrar giremez.`)) return;
    socket.emit('lobi:oyuncuCikar', { hedefOyuncuId: hedefId }, (cevap) => {
      if (!cevap?.ok) setHostHata(cevap?.hata || 'Çıkarılamadı');
    });
  }

  function koduPanoyaKopyala() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(durum.kod).catch(() => {});
    }
  }

  return (
    <div className="lobi">
      <div className="lobi-icerik">
        <header className="lobi-baslik">
          <button className="geri-btn" onClick={odadanAyril} title="Lobiden ayrıl">
            ← Ayrıl
          </button>
          <SesButonu muzikFazi="gunduz" />
        </header>

        <section className="oda-kodu-kart" onClick={koduPanoyaKopyala}>
          <p className="oda-kodu-etiket">Oda Kodu</p>
          <p className="oda-kodu">{durum.kod}</p>
          <p className="oda-kodu-ipucu">Tıkla, kopyala</p>
        </section>

        {/* Madde 2: Bot ekleme + Oyunu başlat — oyuncu listesinin ÜSTÜNDE sabit */}
        <section className="lobi-ust-aksiyon">
          {benHostMu && !dolu && (
            <button className="btn btn-bot" onClick={botEkle}>
              + Bot Ekle (test için)
            </button>
          )}

          {benHostMu ? (
            <button
              className="btn btn-birincil"
              disabled={!yeterliOyuncu || !hostGecerli}
              onClick={oyunuBaslat}
            >
              Oyunu Başlat
            </button>
          ) : (
            <p className="bilgi bilgi-host">
              {durum.players.find(p => p.hostMu)?.isim || 'Host'} oyunu başlatacak
            </p>
          )}

          {!yeterliOyuncu && (
            <p className="bilgi">
              En az {durum.minOyuncu} oyuncu gerekli — {durum.minOyuncu - durum.oyuncuSayisi} kişi daha bekleniyor
            </p>
          )}

          {/* v1.8 — Dağılım toplamı oyuncu sayısıyla eşleşmezse uyarı (host için) */}
          {benHostMu && yeterliOyuncu && !hostGecerli && (
            <p className="bilgi bilgi-uyari">
              ⚠️ Önce dağılım toplamını oyuncu sayısıyla eşleştir — aşağıdaki "Dağılımı Özelleştir" panelinden ayarla.
            </p>
          )}
          {botEkleHatasi && <p className="hata">{botEkleHatasi}</p>}
          {baslatHatasi && <p className="hata">{baslatHatasi}</p>}
        </section>

        <section className="oyuncu-bolumu">
          <div className="oyuncu-baslik-satir">
            <h2 className="oyuncu-baslik">Köydekiler</h2>
            <span className="oyuncu-sayac">
              {durum.oyuncuSayisi}
              <span className="oyuncu-sayac-not"> · en az {durum.minOyuncu} kişiyle başlar</span>
            </span>
          </div>

          <ul className="oyuncu-listesi">
            {durum.players.map((p) => (
              <li
                key={p.id}
                className={`oyuncu-satir ${p.isim === benimIsmim ? 'oyuncu-ben' : ''}`}
              >
                <span className="oyuncu-isim">
                  {p.isim}
                  {p.isim === benimIsmim && <span className="ben-etiketi"> (sen)</span>}
                </span>
                <span className="rozet-grup">
                  {p.hostMu && <span className="rozet rozet-host">host</span>}
                  {p.bot && benHostMu && (
                    <button
                      className="bot-sil-btn"
                      onClick={() => botSil(p.id)}
                      title="Test botu (host'a özel: kaldır)"
                    >
                      ×
                    </button>
                  )}
                  {/* v1.8 — Host gerçek oyuncuyu çıkarabilir (kendisi hariç) */}
                  {!p.bot && benHostMu && p.id !== oyuncuId && (
                    <button
                      className="bot-sil-btn"
                      onClick={() => oyuncuCikar(p.id, p.isim)}
                      title="Bu oyuncuyu odadan çıkar (geri giremez)"
                    >
                      ×
                    </button>
                  )}
                </span>
              </li>
            ))}

            {Array.from({ length: durum.minOyuncu - durum.oyuncuSayisi }).map((_, i) => (
              <li key={`bos-${i}`} className="oyuncu-satir oyuncu-bos">
                <span className="oyuncu-isim">bekleniyor…</span>
              </li>
            ))}
          </ul>
        </section>

        {/* v1.8 — Önerilen Dağılım artık inline (popup değil). Roller butonu kaldı. */}
        <DagilimInline oyuncuSayisi={durum.oyuncuSayisi} />
        <section className="lobi-info-bolum lobi-info-bolum--tek">
          <button
            type="button"
            className="lobi-info-btn"
            onClick={() => setRollerPopupAcik(true)}
            disabled={roller.length === 0}
          >
            <span className="lobi-info-btn-ikon">🎭</span>
            <span className="lobi-info-btn-metin">
              <span className="lobi-info-btn-baslik">Roller</span>
              <span className="lobi-info-btn-altyazi">{roller.length || '…'} rol — tıkla detay</span>
            </span>
          </button>
        </section>

        {/* v1.7 — Kimlik açıklama adedi (host seçer · diğerleri read-only görür) */}
        <section className="lobi-kimlik-ayar-bolum">
          <div className="lobi-kimlik-ayar-bas">
            <h3 className="lobi-kimlik-ayar-baslik">
              Kimlik açıklayacak kişi sayısı
              {benHostMu && <span className="lobi-host-ayar-rozet">host</span>}
            </h3>
            <p className="lobi-kimlik-ayar-altyazi">
              Tanışma fazında başvuranlardan en fazla kaç kişinin kimliği açılsın
            </p>
          </div>
          <div className="lobi-kimlik-ayar-secenekler" role="radiogroup" aria-label="Kimlik açıklama adedi">
            {[0, 1, 2, 3].map(n => {
              const aktif = n === kimlikAciklamaAdedi;
              return (
                <button
                  type="button"
                  key={n}
                  role="radio"
                  aria-checked={aktif}
                  className={`lobi-kimlik-ayar-sec ${aktif ? 'aktif' : ''}`}
                  onClick={() => benHostMu && hostKimlikAcAdediSec(n)}
                  disabled={!benHostMu}
                  title={
                    n === 0
                      ? 'Hiç kimlik açıklanmaz'
                      : `En fazla ${n} kişi kimliğini açıklar`
                  }
                >
                  {n}
                </button>
              );
            })}
          </div>
          {!benHostMu && (
            <p className="lobi-kimlik-ayar-not">
              Host bu sayıyı belirler — şu an: {kimlikAciklamaAdedi === 0 ? 'kimse açıklamaz' : `en fazla ${kimlikAciklamaAdedi} kişi`}
            </p>
          )}
        </section>

        {/* v1.8 — Süre ayarları (host belirler · 4 dropdown) */}
        <section className="lobi-sureler-bolum">
          <h3 className="lobi-sureler-baslik">
            Süreler
            {benHostMu && <span className="lobi-host-ayar-rozet">host</span>}
          </h3>
          <div className="lobi-sureler-grid">
            <label className="lobi-sure-satir">
              <span className="lobi-sure-etiket">💬 Tartışma</span>
              <select
                className="lobi-tartisma-ayar-select"
                value={tartismaSuresi}
                onChange={e => benHostMu && hostTartismaSuresiSec(Number(e.target.value))}
                disabled={!benHostMu}
              >
                {TARTISMA_SURELERI.map(sn => <option key={sn} value={sn}>{sn} sn</option>)}
              </select>
            </label>
            <label className="lobi-sure-satir">
              <span className="lobi-sure-etiket">🌙 Gece</span>
              <select
                className="lobi-tartisma-ayar-select"
                value={geceSuresi}
                onChange={e => benHostMu && hostFazSuresiSec('geceSuresi', Number(e.target.value))}
                disabled={!benHostMu}
              >
                {FAZ_SURELERI.map(sn => <option key={sn} value={sn}>{sn} sn</option>)}
              </select>
            </label>
            <label className="lobi-sure-satir">
              <span className="lobi-sure-etiket">☀️ Sabah</span>
              <select
                className="lobi-tartisma-ayar-select"
                value={sabahSuresi}
                onChange={e => benHostMu && hostFazSuresiSec('sabahSuresi', Number(e.target.value))}
                disabled={!benHostMu}
              >
                {FAZ_SURELERI.map(sn => <option key={sn} value={sn}>{sn} sn</option>)}
              </select>
            </label>
            <label className="lobi-sure-satir">
              <span className="lobi-sure-etiket">⚖️ Savunma</span>
              <select
                className="lobi-tartisma-ayar-select"
                value={savunmaSuresi}
                onChange={e => benHostMu && hostFazSuresiSec('savunmaSuresi', Number(e.target.value))}
                disabled={!benHostMu}
              >
                {FAZ_SURELERI.map(sn => <option key={sn} value={sn}>{sn} sn</option>)}
              </select>
            </label>
          </div>
        </section>

        {/* v1.8 — Host'a özel dağılım ayarı paneli (sabit açık — sadece host görür) */}
        {benHostMu && (
          <section className="lobi-host-ayar-bolum">
            <h3 className="lobi-host-ayar-baslik">
              Dağılımı Özelleştir <span className="lobi-host-ayar-rozet">host</span>
            </h3>
            <p className="lobi-host-ayar-altyazi">
              Önerilenden farklı oynatmak istersen ayarla — toplam {durum.oyuncuSayisi} olmalı
            </p>
            <div className="lobi-host-ayar-satirlar">
              {[
                { key: 'ozgurlukcu', etiket: '🟢 Özgürlükçü', altSinir: 0, ustSinir: null, satirClass: 'ozg' },
                { key: 'tarafsiz',   etiket: '🟡 Tarafsız',   altSinir: 0, ustSinir: null, satirClass: 'tar' },
                { key: 'gelenekci',  etiket: '🔴 Gelenekçi',  altSinir: 0, ustSinir: null, satirClass: 'gel' },
                { key: 'outsider',   etiket: '⚪ Outsider',   altSinir: 0, ustSinir: OUTSIDER_MAX, satirClass: 'outsider' },
                { key: 'kaoscu',     etiket: '⚫ Kaosçu',     altSinir: 0, ustSinir: KAOSCU_MAX,  satirClass: 'kaoscu' }
              ].map(({ key, etiket, altSinir, ustSinir, satirClass }) => (
                <div key={key} className={`lobi-host-ayar-satir lobi-host-ayar-satir--${satirClass}`}>
                  <span className="lobi-host-ayar-etiket">{etiket}</span>
                  <div className="lobi-host-ayar-sayac">
                    <button
                      type="button"
                      className="lobi-host-ayar-btn"
                      onClick={() => hostDegistir(key, -1)}
                      disabled={duzenlemeDagilim[key] <= altSinir}
                      aria-label="azalt"
                    >−</button>
                    <span className="lobi-host-ayar-deger">{duzenlemeDagilim[key]}</span>
                    <button
                      type="button"
                      className="lobi-host-ayar-btn"
                      onClick={() => hostDegistir(key, +1)}
                      disabled={ustSinir !== null && duzenlemeDagilim[key] >= ustSinir}
                      aria-label="arttır"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="lobi-host-ayar-altbar">
              <span className={`lobi-host-ayar-toplam ${hostToplam === durum.oyuncuSayisi ? 'ok' : 'hata'}`}>
                Toplam: {hostToplam} / {durum.oyuncuSayisi}
                {hostToplam !== durum.oyuncuSayisi && (
                  <span className="lobi-host-ayar-fark">
                    {' '}({Math.abs(hostToplam - durum.oyuncuSayisi)} {hostToplam > durum.oyuncuSayisi ? 'fazla' : 'eksik'})
                  </span>
                )}
              </span>
              <button
                type="button"
                className="lobi-host-ayar-sifirla"
                onClick={hostOnerileniUygula}
                title="Önerilen dağılıma dön"
              >
                Önerileni Uygula
              </button>
            </div>
            {durum.ayarlar && (
              <p className="lobi-host-ayar-aktif">Özel dağılım aktif</p>
            )}
            {hostHata && <p className="hata">{hostHata}</p>}

            {/* v1.8 — Outsider/Kaosçu bilgi notu kaldırıldı (Buğra isteği) */}
          </section>
        )}

        {/* v1.8.32 — B Seçeneği: Host hangi rollerin havuzda olabileceğini seçer */}
        {benHostMu && (
          <RolHavuzuPaneli
            roller={roller}
            rolHavuzu={durum.ayarlar?.rolHavuzu || null}
            dagilim={durum.ayarlar?.dagilim || null}
            onChange={(yeniHavuz) => {
              socket.emit('lobi:ayar', { rolHavuzu: yeniHavuz }, (cevap) => {
                if (!cevap?.ok) console.warn('rolHavuzu güncelleme hatası:', cevap?.hata);
              });
            }}
          />
        )}

      </div>

      {/* v1.8 — Önerilen Dağılım popup yerine inline (yukarıda DagilimInline) */}

      {/* v1.6 — Madde 1: Roller galerisi popup */}
      {rollerPopupAcik && roller.length > 0 && (
        <RollerPopup
          roller={roller}
          onRolSec={(r) => setSeciliRol(r)}
          onKapat={() => setRollerPopupAcik(false)}
        />
      )}

      {/* Rol detay popup — RollerPopup üstüne açılır */}
      {seciliRol && (
        <RolPopup rol={seciliRol} onKapat={() => setSeciliRol(null)} />
      )}
    </div>
  );
}

// v1.8 — Önerilen Dağılım popup'ı: oyuncu sayısı yaz, yandaki dağılımı gör
// v1.8 — Tek kaynak dağılım formülü (4'ten sınırsız oyuncu sayısına kadar)
// Outsider 7+, Kaosçu 10+ (1) / 13+ (2). Kalan: gelenekçi ~25%, özgürlükçü ~45%, tarafsız kalan.
function dagilimHesapla(n) {
  if (!Number.isInteger(n) || n < 4) return null;
  const outsider = n >= 7 ? 1 : 0;
  const kaoscu = n >= 13 ? 2 : (n >= 10 ? 1 : 0);
  const kalan = n - outsider - kaoscu;
  let gel = Math.max(1, Math.round(kalan * 0.25));
  let ozg = Math.max(2, Math.round(kalan * 0.45));
  let tar = kalan - ozg - gel;
  if (tar < 1) {
    // Yuvarlatma: tar'ı ozg'den eksilt
    ozg -= (1 - tar);
    tar = 1;
  }
  return { ozgurlukcu: ozg, tarafsiz: tar, gelenekci: gel, outsider, kaoscu };
}

// v1.8 — Önerilen Dağılım inline panel (lobide sürekli açık)
function DagilimInline({ oyuncuSayisi }) {
  const [secilen, setSecilen] = useState(() => oyuncuSayisi >= 4 ? oyuncuSayisi : 4);

  useEffect(() => {
    if (oyuncuSayisi >= 4) setSecilen(oyuncuSayisi);
  }, [oyuncuSayisi]);

  function girisDegis(e) {
    const ham = e.target.value.replace(/\D/g, '').slice(0, 3);
    if (ham === '') { setSecilen(''); return; }
    setSecilen(Number(ham));
  }

  const dagilim = dagilimHesapla(secilen);
  const gecerli = !!dagilim;

  return (
    <section className="lobi-onerilen-inline">
      <h3 className="lobi-onerilen-inline-baslik">📊 Önerilen Dağılım</h3>
      <div className="lobi-onerilen-sorgu">
        <label className="lobi-onerilen-sorgu-etiket" htmlFor="lobi-onerilen-input">
          Oyuncu sayısı
        </label>
        <input
          id="lobi-onerilen-input"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          className="lobi-onerilen-sorgu-input"
          value={secilen}
          onChange={girisDegis}
          placeholder="örn. 8"
        />
        <div className="lobi-onerilen-sorgu-sonuc">
          <span className="lobi-onerilen-grup ozg" title="Özgürlükçü">🟢 {gecerli ? dagilim.ozgurlukcu : '—'}</span>
          <span className="lobi-onerilen-grup tar" title="Tarafsız">🟡 {gecerli ? dagilim.tarafsiz : '—'}</span>
          <span className="lobi-onerilen-grup gel" title="Gelenekçi">🔴 {gecerli ? dagilim.gelenekci : '—'}</span>
          <span className="lobi-onerilen-grup outsider" title="Outsider">⚪ {gecerli ? dagilim.outsider : '—'}</span>
          <span className="lobi-onerilen-grup kaoscu" title="Kaosçu">⚫ {gecerli ? dagilim.kaoscu : '—'}</span>
        </div>
      </div>
    </section>
  );
}

// v1.6 — Madde 1: Roller galerisi popup'ı (eski lobi içeriği)
function RollerPopup({ roller, onRolSec, onKapat }) {
  useEffect(() => {
    function esc(e) { if (e.key === 'Escape') onKapat(); }
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onKapat]);

  return (
    <div className="lobi-popup-arka" onClick={onKapat}>
      <div className="lobi-popup-kart lobi-popup-kart--orta" onClick={e => e.stopPropagation()}>
        <button className="lobi-popup-kapat" onClick={onKapat}>✕</button>
        <div className="lobi-popup-bas">
          <h2 className="lobi-popup-ad">🎭 Roller</h2>
          <p className="lobi-popup-karakter">Birine tıkla → detay kartı açılır</p>
        </div>
        <div className="lobi-roller-bolumler">
          {['ozgurlukcu', 'tarafsiz', 'gelenekci', 'outsider', 'kaoscu'].map(grupId => {
            const grupRolleri = roller.filter(r => r.grup === grupId);
            if (grupRolleri.length === 0) return null;
            const grup = GRUP_BILGI[grupId];
            return (
              <div key={grupId} className="lobi-roller-bolum">
                <h3
                  className="lobi-roller-bolum-baslik"
                  style={{ color: grup?.renk, borderColor: grup?.renk }}
                >
                  <span className="lobi-roller-bolum-sembol">{grup?.sembol}</span>
                  <span className="lobi-roller-bolum-ad">{grup?.ad}</span>
                  <span className="lobi-roller-bolum-sayi">({grupRolleri.length})</span>
                </h3>
                <div className="lobi-roller-grid">
                  {grupRolleri.map(r => (
                    <button
                      key={r.id}
                      className="lobi-rol-kart"
                      style={{ borderColor: grup?.renk }}
                      onClick={() => onRolSec(r)}
                    >
                      <KarakterPortresi
                        karakter={r.karakter}
                        gorsel={r.gorsel}
                        grup={r.grup}
                        boyut={48}
                      />
                      <span className="lobi-rol-kart-ad">{r.ad}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RolPopup({ rol, onKapat }) {
  const grup = GRUP_BILGI[rol.grup];
  const burc = ROL_BURCLARI[rol.id];
  const [uzunHikaye, setUzunHikaye] = useState(null);

  useEffect(() => {
    uzunHikayeyiAl(rol.karakter).then(setUzunHikaye);
  }, [rol.karakter]);

  // Escape ile kapama
  useEffect(() => {
    function esc(e) {
      if (e.key === 'Escape') onKapat();
    }
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onKapat]);

  return (
    <div className="lobi-popup-arka" onClick={onKapat}>
      <div className="lobi-popup-kart" onClick={e => e.stopPropagation()} style={{ borderColor: grup?.renk }}>
        <button className="lobi-popup-kapat" onClick={onKapat}>✕</button>

        <div className="lobi-popup-bas">
          <div className="lobi-popup-portre-sarmal">
            <KarakterPortresi
              karakter={rol.karakter}
              gorsel={rol.gorsel}
              grup={rol.grup}
              boyut={96}
            />
          </div>
          <p className="lobi-popup-grup" style={{ color: grup?.renk }}>
            {grup?.sembol} {grup?.ad}
          </p>
          <h2 className="lobi-popup-ad">{rol.ad}</h2>
        </div>

        {/* v1.8 — Karakterin Hikayesi (3 alt grup: kim, neden geldin, ne yapmak istiyorsun) */}
        <div className="lobi-popup-bolum">
          <p className="lobi-popup-bolum-baslik">Karakterin Hikayesi</p>

          <p className="lobi-popup-bolum-altbaslik">Kim?</p>
          <p className="lobi-popup-bolum-metin lobi-popup-karakter-satir">
            <strong>{rol.karakter}</strong> · {rol.yas} · {rol.meslek}
            {burc && <> · <span className="lobi-popup-burc">{burc.sembol} {burc.ad}</span></>}
          </p>

          <p className="lobi-popup-bolum-altbaslik lobi-popup-altbaslik-ikinci">Neden bu köye geldin?</p>
          <p className="lobi-popup-bolum-metin lobi-popup-motivasyon">{rol.motivasyon}</p>
          {uzunHikaye && (
            <details className="rol-detayli-hikaye">
              <summary>Detaylı oku</summary>
              <div className="rol-detayli-hikaye-icerik">
                {uzunHikaye.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
              </div>
            </details>
          )}

          <p className="lobi-popup-bolum-altbaslik lobi-popup-altbaslik-ikinci">Ne yapmak istiyorsun?</p>
          <p className="lobi-popup-bolum-metin">{GRUP_NIYETLERI[rol.grup] || '—'}</p>
        </div>

        {/* v1.8 — Oyundaki Görevin (2 alt grup: ne yaparsın, nasıl kazanırsın) */}
        <div className="lobi-popup-bolum">
          <p className="lobi-popup-bolum-baslik">Oyundaki Görevin</p>

          <p className="lobi-popup-bolum-altbaslik">Ne yaparsın?</p>
          <p className="lobi-popup-bolum-metin">{rol.geceAksiyonu}</p>

          <p className="lobi-popup-bolum-altbaslik lobi-popup-altbaslik-ikinci">Nasıl kazanırsın?</p>
          <p className="lobi-popup-bolum-metin">{rol.kazanmaKosulu}</p>
        </div>
      </div>
    </div>
  );
}
