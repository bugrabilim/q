// Q — Ses Aç/Kapat Düğmesi
// İlk kullanımda büyük "🔊 Sesi Aç" butonu gösterir — bu kullanıcı dokunuşu
// mobil tarayıcıların autoplay engelini açar. Sonrasında küçük 🔊/🔇 aç-kapa
// düğmesi + yanında ⚙️ ses ayarları ikonu olur.

import { useState, useEffect } from 'react';
import { sesiEtkinlestir, sesiKapat, sesAktifMi, muzikCal } from './SesYoneticisi.js';
import SesAyarlariModal from './SesAyarlariModal.jsx';
import './SesButonu.css';

export default function SesButonu({ muzikFazi = null }) {
  const [aktif, setAktif] = useState(sesAktifMi());
  // localStorage'da hiç kayıt yoksa: kullanıcı sesle daha önce hiç etkileşmedi
  const [ilkKez, setIlkKez] = useState(
    () => localStorage.getItem('q-ses-aktif') === null
  );
  const [ayarlarAcik, setAyarlarAcik] = useState(false);

  // Dönen kullanıcı sesi daha önce açtıysa mevcut faz müziğini başlat.
  // (Tarayıcı autoplay engeli varsa Howler ilk kullanıcı dokunuşunda çalar.)
  useEffect(() => {
    if (aktif) muzikCal(muzikFazi);
    // yalnızca mount'ta — faz geçişlerini App.jsx yönetir (M4)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function ac() {
    sesiEtkinlestir();
    muzikCal(muzikFazi);
    setAktif(true);
    setIlkKez(false);
  }

  function kapat() {
    sesiKapat();
    setAktif(false);
  }

  if (ilkKez && !aktif) {
    return (
      <button
        className="ses-btn ses-btn--ilk"
        onClick={ac}
        title="Müzik ve ses efektlerini aç"
      >
        🔊 Sesi Aç
      </button>
    );
  }

  return (
    <span className="ses-btn-grup">
      <button
        className={`ses-btn ses-btn--toggle ${aktif ? 'ses-btn--acik' : 'ses-btn--kapali'}`}
        onClick={aktif ? kapat : ac}
        title={aktif ? 'Sesi kapat' : 'Sesi aç'}
        aria-label={aktif ? 'Sesi kapat' : 'Sesi aç'}
      >
        {aktif ? '🔊' : '🔇'}
      </button>
      <button
        className="ses-btn ses-btn--ayarlar"
        onClick={() => setAyarlarAcik(true)}
        title="Ses ayarları"
        aria-label="Ses ayarları"
      >
        ⚙️
      </button>
      {ayarlarAcik && <SesAyarlariModal onKapat={() => setAyarlarAcik(false)} />}
    </span>
  );
}
