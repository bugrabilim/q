// Queer Quest Quench — Sürekli Rol Kart Paneli (Madde 6)
// Sol kolonun altında, oyuncu listesinin yanında. Her zaman erişilebilir.

import { useState } from 'react';
import './RolKartPaneli.css';

const GRUP_BILGI = {
  ozgurlukcu: { ad: 'Özgürlükçü', renk: 'var(--ozgurlukcu)', sembol: '🟢' },
  tarafsiz:   { ad: 'Tarafsız',   renk: 'var(--tarafsiz)',   sembol: '🟡' },
  gelenekci:  { ad: 'Gelenekçi',  renk: 'var(--gelenekci)',  sembol: '🔴' }
};

export default function RolKartPaneli({ rol }) {
  const [acik, setAcik] = useState(true);

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
        </div>
      )}
    </div>
  );
}
