// Queer Quest Quench — Faz 2: Lobi (Oda Bekleme)

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import SesButonu from '../ses/SesButonu.jsx';
import KarakterPortresi from '../bilesenler/KarakterPortresi.jsx';
import './LobiEkrani.css';

const GRUP_BILGI = {
  ozgurlukcu: { ad: 'Özgürlükçü', renk: 'var(--ozgurlukcu)', sembol: '🟢' },
  tarafsiz:   { ad: 'Tarafsız',   renk: 'var(--tarafsiz)',   sembol: '🟡' },
  gelenekci:  { ad: 'Gelenekçi',  renk: 'var(--gelenekci)',  sembol: '🔴' }
};

// Madde 5: Önerilen dağılım tablosu (statik — server'daki DENGE ile eşleşir)
const DENGE_ONERILEN = {
  4:  { ozgurlukcu: 2, tarafsiz: 1, gelenekci: 1 },
  5:  { ozgurlukcu: 2, tarafsiz: 2, gelenekci: 1 },
  6:  { ozgurlukcu: 2, tarafsiz: 2, gelenekci: 2 },
  7:  { ozgurlukcu: 3, tarafsiz: 2, gelenekci: 2 },
  8:  { ozgurlukcu: 3, tarafsiz: 3, gelenekci: 2 },
  9:  { ozgurlukcu: 4, tarafsiz: 3, gelenekci: 2 },
  10: { ozgurlukcu: 4, tarafsiz: 3, gelenekci: 3 },
  11: { ozgurlukcu: 5, tarafsiz: 3, gelenekci: 3 },
  12: { ozgurlukcu: 6, tarafsiz: 3, gelenekci: 3 }
};
const OYUNCU_SAYILARI = [4, 5, 6, 7, 8, 9, 10, 11, 12];

export default function LobiEkrani({ kod, benimIsmim, oyuncuId, onAyril }) {
  const [durum, setDurum] = useState({
    kod, players: [], oyuncuSayisi: 0, minOyuncu: 4, maxOyuncu: 12, ayarlar: null
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

  // Madde 4: Aktif dağılım — host ayarı varsa onu, yoksa önerilen
  const aktifDagilim = durum.ayarlar?.dagilim
    || DENGE_ONERILEN[durum.oyuncuSayisi]
    || { ozgurlukcu: 0, tarafsiz: 0, gelenekci: 0 };

  // v1.7 — Tanışma'da kaç kişi kimlik açıklasın (host seçer; 0-3; default 1)
  const kimlikAciklamaAdedi = Number.isInteger(durum.ayarlar?.kimlikAciklamaAdedi)
    ? durum.ayarlar.kimlikAciklamaAdedi
    : 1;

  // Oyuncu sayısı veya server ayarı değişince host düzenlemesini senkronize et
  useEffect(() => {
    setHostSecim(null);
    setHostHata('');
  }, [durum.oyuncuSayisi, durum.ayarlar]);

  // Host düzenleme modunda — gerçek aktif değer
  const duzenlemeDagilim = hostSecim || aktifDagilim;
  const hostToplam = duzenlemeDagilim.ozgurlukcu + duzenlemeDagilim.tarafsiz + duzenlemeDagilim.gelenekci;
  const hostGecerli = hostToplam === durum.oyuncuSayisi && duzenlemeDagilim.gelenekci >= 1 && durum.oyuncuSayisi >= durum.minOyuncu;

  // v1.6 — Madde 1 (rev): +/- bastığında otomatik dengele + anında server'a uygula.
  // "Uygula" butonu kaldırıldı. Toplam korunur: hedef grubu artarsa başka gruptan
  // otomatik düşürür (en yüksek olan, gelenekçi ≥ 1 korunarak). Azaltırsa diğer
  // gruba ekler (en düşük olan).
  function hostDegistir(grup, delta) {
    setHostHata('');
    const base = { ...(hostSecim || aktifDagilim) };
    const yeniDeger = base[grup] + delta;

    // Min sınırları: gelenekçi ≥ 1 (Kaan zorunlu), diğerleri ≥ 0
    if (grup === 'gelenekci' && yeniDeger < 1) return;
    if (yeniDeger < 0) return;

    base[grup] = yeniDeger;

    // Toplamı eski oyuncu sayısında tut — diğer iki grubu otomatik dengele
    const diger = ['ozgurlukcu', 'tarafsiz', 'gelenekci'].filter(g => g !== grup);
    if (delta > 0) {
      // Bir grup arttı — başka birinden düş. En yüksekten başla; gelenekçi en son
      // ve ancak >1 ise düşülebilir.
      const sirali = diger.sort((a, b) => base[b] - base[a]);
      for (const g of sirali) {
        const altSinir = g === 'gelenekci' ? 1 : 0;
        if (base[g] > altSinir) { base[g] -= 1; break; }
      }
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
              disabled={!yeterliOyuncu}
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
          {botEkleHatasi && <p className="hata">{botEkleHatasi}</p>}
          {baslatHatasi && <p className="hata">{baslatHatasi}</p>}
        </section>

        <section className="oyuncu-bolumu">
          <div className="oyuncu-baslik-satir">
            <h2 className="oyuncu-baslik">Köydekiler</h2>
            <span className="oyuncu-sayac">
              {durum.oyuncuSayisi} <span className="bolu">/</span> {durum.maxOyuncu}
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

        {/* v1.6 — Madde 1: Önerilen Dağılım ve Roller artık popup'tan açılır.
            İki yan yana buton — sayfa kısalır, info ihtiyaca göre açılır. */}
        <section className="lobi-info-bolum">
          <button
            type="button"
            className="lobi-info-btn"
            onClick={() => setDagilimPopupAcik(true)}
          >
            <span className="lobi-info-btn-ikon">📊</span>
            <span className="lobi-info-btn-metin">
              <span className="lobi-info-btn-baslik">Önerilen Dağılım</span>
              <span className="lobi-info-btn-altyazi">{durum.oyuncuSayisi} kişiyle 🟢 🟡 🔴</span>
            </span>
          </button>
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

        {/* Madde 4: Host'a özel dağılım ayarı paneli (A seçeneği — grup sayıları) */}
        {benHostMu && durum.oyuncuSayisi >= durum.minOyuncu && (
          <section className="lobi-host-ayar-bolum">
            <h3 className="lobi-host-ayar-baslik">
              Dağılımı Özelleştir <span className="lobi-host-ayar-rozet">host</span>
            </h3>
            <p className="lobi-host-ayar-altyazi">
              Önerilenden farklı oynatmak istersen ayarla — toplam {durum.oyuncuSayisi} olmalı
            </p>
            <div className="lobi-host-ayar-satirlar">
              {[
                { key: 'ozgurlukcu', etiket: '🟢 Özgürlükçü' },
                { key: 'tarafsiz',   etiket: '🟡 Tarafsız' },
                { key: 'gelenekci',  etiket: '🔴 Gelenekçi' }
              ].map(({ key, etiket }) => (
                <div key={key} className="lobi-host-ayar-satir">
                  <span className="lobi-host-ayar-etiket">{etiket}</span>
                  <div className="lobi-host-ayar-sayac">
                    <button
                      type="button"
                      className="lobi-host-ayar-btn"
                      onClick={() => hostDegistir(key, -1)}
                      disabled={duzenlemeDagilim[key] <= (key === 'gelenekci' ? 1 : 0)}
                      aria-label="azalt"
                    >−</button>
                    <span className="lobi-host-ayar-deger">{duzenlemeDagilim[key]}</span>
                    <button
                      type="button"
                      className="lobi-host-ayar-btn"
                      onClick={() => hostDegistir(key, +1)}
                      aria-label="arttır"
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="lobi-host-ayar-altbar">
              <span className="lobi-host-ayar-toplam ok">
                Toplam: {hostToplam} / {durum.oyuncuSayisi}
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
          </section>
        )}

      </div>

      {/* v1.6 — Madde 1: Önerilen Dağılım popup */}
      {dagilimPopupAcik && (
        <DagilimPopup
          oyuncuSayisi={durum.oyuncuSayisi}
          onKapat={() => setDagilimPopupAcik(false)}
        />
      )}

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

// v1.6 — Madde 1: Önerilen Dağılım popup'ı (mevcut tablo içeriği)
function DagilimPopup({ oyuncuSayisi, onKapat }) {
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
          <h2 className="lobi-popup-ad">📊 Önerilen Dağılım</h2>
          <p className="lobi-popup-karakter">
            Oyuncu sayısına göre dengeli dağılım — host isterse değiştirebilir
          </p>
        </div>
        <div className="lobi-onerilen-tablo">
          <div className="lobi-onerilen-satir lobi-onerilen-baslik-satir">
            <span className="lobi-onerilen-sayi-bas">Kişi</span>
            <span className="lobi-onerilen-grup ozg">🟢 Özg</span>
            <span className="lobi-onerilen-grup tar">🟡 Tar</span>
            <span className="lobi-onerilen-grup gel">🔴 Gel</span>
          </div>
          {OYUNCU_SAYILARI.map(sayi => {
            const d = DENGE_ONERILEN[sayi];
            const aktif = sayi === oyuncuSayisi;
            return (
              <div key={sayi} className={`lobi-onerilen-satir ${aktif ? 'aktif' : ''}`}>
                <span className="lobi-onerilen-sayi">{sayi}</span>
                <span className="lobi-onerilen-grup ozg">{d.ozgurlukcu}</span>
                <span className="lobi-onerilen-grup tar">{d.tarafsiz}</span>
                <span className="lobi-onerilen-grup gel">{d.gelenekci}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
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
        <div className="lobi-roller-grid">
          {roller.map(r => {
            const grup = GRUP_BILGI[r.grup];
            return (
              <button
                key={r.id}
                className="lobi-rol-kart"
                style={{ borderColor: grup?.renk }}
                onClick={() => onRolSec(r)}
              >
                {/* v1.6 — Madde 5: Karakter portresi */}
                <KarakterPortresi
                  karakter={r.karakter}
                  gorsel={r.gorsel}
                  grup={r.grup}
                  boyut={48}
                />
                <span className="lobi-rol-kart-grup" style={{ color: grup?.renk }}>
                  {grup?.sembol}
                </span>
                <span className="lobi-rol-kart-ad">{r.ad}</span>
                <span className="lobi-rol-kart-karakter">{r.karakter}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RolPopup({ rol, onKapat }) {
  const grup = GRUP_BILGI[rol.grup];

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
          {/* v1.6 — Madde 5: Karakter portresi (büyük) */}
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
          <p className="lobi-popup-karakter">
            <strong>{rol.karakter}</strong> · {rol.yas} · {rol.meslek}
          </p>
        </div>

        <div className="lobi-popup-bolum">
          <p className="lobi-popup-bolum-baslik">Köye Gelişin</p>
          <p className="lobi-popup-bolum-metin lobi-popup-motivasyon">{rol.motivasyon}</p>
        </div>

        <div className="lobi-popup-bolum">
          <p className="lobi-popup-bolum-baslik">Gece Aksiyonu</p>
          <p className="lobi-popup-bolum-metin">{rol.geceAksiyonu}</p>
        </div>

        <div className="lobi-popup-bolum lobi-popup-kazanma">
          <p className="lobi-popup-bolum-baslik">Kazanmak İçin</p>
          <p className="lobi-popup-bolum-metin">{rol.kazanmaKosulu}</p>
        </div>
      </div>
    </div>
  );
}
