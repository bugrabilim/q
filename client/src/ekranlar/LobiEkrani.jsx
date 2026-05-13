// Queer Quest Quench — Faz 2: Lobi (Oda Bekleme)

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import './LobiEkrani.css';

const GRUP_BILGI = {
  ozgurlukcu: { ad: 'Özgürlükçü', renk: 'var(--ozgurlukcu)', sembol: '🟢' },
  tarafsiz:   { ad: 'Tarafsız',   renk: 'var(--tarafsiz)',   sembol: '🟡' },
  gelenekci:  { ad: 'Gelenekçi',  renk: 'var(--gelenekci)',  sembol: '🔴' }
};

export default function LobiEkrani({ kod, benimIsmim, oyuncuId, onAyril }) {
  const [durum, setDurum] = useState({
    kod, players: [], oyuncuSayisi: 0, minOyuncu: 6, maxOyuncu: 12
  });
  const [baslatHatasi, setBaslatHatasi] = useState('');
  const [botEkleHatasi, setBotEkleHatasi] = useState('');
  const [roller, setRoller] = useState([]);
  const [seciliRol, setSeciliRol] = useState(null); // popup'ta gösterilen rol

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

        {/* Madde 3: Roller galerisi — tıklayınca popup açılır */}
        {roller.length > 0 && (
          <section className="lobi-roller-bolum">
            <h3 className="lobi-roller-baslik">Bu oyunda olabilecek roller</h3>
            <p className="lobi-roller-altyazi">Birine tıkla → kart açılır</p>
            <div className="lobi-roller-grid">
              {roller.map(r => {
                const grup = GRUP_BILGI[r.grup];
                return (
                  <button
                    key={r.id}
                    className="lobi-rol-kart"
                    style={{ borderColor: grup?.renk }}
                    onClick={() => setSeciliRol(r)}
                  >
                    <span className="lobi-rol-kart-grup" style={{ color: grup?.renk }}>
                      {grup?.sembol}
                    </span>
                    <span className="lobi-rol-kart-ad">{r.ad}</span>
                    <span className="lobi-rol-kart-karakter">{r.karakter}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Rol detay popup */}
      {seciliRol && (
        <RolPopup rol={seciliRol} onKapat={() => setSeciliRol(null)} />
      )}
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
