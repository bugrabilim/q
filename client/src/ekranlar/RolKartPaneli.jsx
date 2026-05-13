// Queer Quest Quench — Sürekli Rol Kart Paneli (Madde 6)
// Sol kolonun altında, oyuncu listesinin yanında. Her zaman erişilebilir.
// v1.3: "Diğer Roller →" butonu — oyun havuzundaki tüm rollerin modal galerisi.

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import './RolKartPaneli.css';

const GRUP_BILGI = {
  ozgurlukcu: { ad: 'Özgürlükçü', renk: 'var(--ozgurlukcu)', sembol: '🟢' },
  tarafsiz:   { ad: 'Tarafsız',   renk: 'var(--tarafsiz)',   sembol: '🟡' },
  gelenekci:  { ad: 'Gelenekçi',  renk: 'var(--gelenekci)',  sembol: '🔴' }
};

export default function RolKartPaneli({ rol }) {
  const [acik, setAcik] = useState(true);
  // v1.3 — Galeri modal state
  const [galeriAcik, setGaleriAcik] = useState(false);
  const [tumRoller, setTumRoller] = useState([]);
  const [seciliRol, setSeciliRol] = useState(null);

  // Galeri ilk açıldığında server'dan rolleri çek
  useEffect(() => {
    if (galeriAcik && tumRoller.length === 0) {
      socket.emit('roller:listele', null, (cevap) => {
        if (cevap?.ok && Array.isArray(cevap.roller)) setTumRoller(cevap.roller);
      });
    }
  }, [galeriAcik, tumRoller.length]);

  if (!rol) {
    return (
      <div className="rol-kart-paneli">
        <header className="rol-kart-paneli-bas">
          <span className="rol-kart-paneli-baslik">🎭 Rolün</span>
        </header>
        <p className="rol-kart-paneli-bos">Rol bilgisi yükleniyor…</p>
      </div>
    );
  }

  const grup = GRUP_BILGI[rol.grup] || { ad: '?', renk: 'var(--derin)', sembol: '·' };

  return (
    <div className={`rol-kart-paneli ${acik ? '' : 'rol-kart-paneli--kapali'}`}>
      <header className="rol-kart-paneli-bas" onClick={() => setAcik(a => !a)}>
        <span className="rol-kart-paneli-baslik">
          🎭 {rol.ad}
        </span>
        <span className="rol-kart-paneli-acma">{acik ? '−' : '+'}</span>
      </header>

      {acik && (
        <div className="rol-kart-paneli-icerik">
          <div
            className="rol-kart-paneli-grup-bant"
            style={{ background: grup.renk }}
          >
            {grup.sembol} {grup.ad}
          </div>

          {rol.karakter && (
            <p className="rol-kart-paneli-karakter">
              <strong>{rol.karakter}</strong>
              {rol.yas && <> · {rol.yas}</>}
              {rol.meslek && <> · {rol.meslek}</>}
            </p>
          )}

          {/* Madde 4: Köye geliş hikayesi */}
          {rol.motivasyon && (
            <div className="rol-kart-paneli-bolum">
              <p className="rol-kart-paneli-bolum-baslik">Köye Gelişin</p>
              <p className="rol-kart-paneli-bolum-metin rol-kart-paneli-motivasyon">
                {rol.motivasyon}
              </p>
            </div>
          )}

          {rol.geceAksiyonu && (
            <div className="rol-kart-paneli-bolum">
              <p className="rol-kart-paneli-bolum-baslik">Gece Aksiyonu</p>
              <p className="rol-kart-paneli-bolum-metin">{rol.geceAksiyonu}</p>
            </div>
          )}

          {rol.kazanmaKosulu && (
            <div className="rol-kart-paneli-bolum rol-kart-paneli-kazanma">
              <p className="rol-kart-paneli-bolum-baslik">Kazanmak için</p>
              <p className="rol-kart-paneli-bolum-metin">{rol.kazanmaKosulu}</p>
            </div>
          )}

          {/* v1.3 — Diğer rollere bak butonu */}
          <button
            className="rol-kart-paneli-galeri-btn"
            onClick={() => setGaleriAcik(true)}
            title="Bu oyunda kim hangi rolü oynayabilir?"
          >
            Diğer Roller →
          </button>
        </div>
      )}

      {/* v1.3 — Galeri modal */}
      {galeriAcik && (
        <RollerGalerisiModal
          roller={tumRoller}
          seciliRol={seciliRol}
          onSec={setSeciliRol}
          onKapat={() => { setGaleriAcik(false); setSeciliRol(null); }}
        />
      )}
    </div>
  );
}

// v1.3 — Tüm roller galerisi (lobi'dekiyle aynı UX, modal popup)
function RollerGalerisiModal({ roller, seciliRol, onSec, onKapat }) {
  useEffect(() => {
    function esc(e) { if (e.key === 'Escape') onKapat(); }
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onKapat]);

  if (seciliRol) {
    return (
      <RolDetayPopup rol={seciliRol} onKapat={() => onSec(null)} />
    );
  }

  return (
    <div className="lobi-popup-arka" onClick={onKapat}>
      <div
        className="lobi-popup-kart rol-galeri-popup"
        onClick={e => e.stopPropagation()}
      >
        <button className="lobi-popup-kapat" onClick={onKapat}>✕</button>
        <h2 className="lobi-popup-ad" style={{ marginTop: 0 }}>Diğer Roller</h2>
        <p className="lobi-roller-altyazi">Birine tıkla → detay açılır</p>
        {roller.length === 0 ? (
          <p className="rol-kart-paneli-bos">Roller yükleniyor…</p>
        ) : (
          <div className="lobi-roller-grid">
            {roller.map(r => {
              const grup = GRUP_BILGI[r.grup];
              return (
                <button
                  key={r.id}
                  className="lobi-rol-kart"
                  style={{ borderColor: grup?.renk }}
                  onClick={() => onSec(r)}
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
        )}
      </div>
    </div>
  );
}

// v1.3 — Tek bir rolün detay popup'ı (lobi RolPopup ile aynı görünüm)
function RolDetayPopup({ rol, onKapat }) {
  const grup = GRUP_BILGI[rol.grup];

  useEffect(() => {
    function esc(e) { if (e.key === 'Escape') onKapat(); }
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onKapat]);

  return (
    <div className="lobi-popup-arka" onClick={onKapat}>
      <div className="lobi-popup-kart" onClick={e => e.stopPropagation()} style={{ borderColor: grup?.renk }}>
        <button className="lobi-popup-kapat" onClick={onKapat}>← Geri</button>
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
