// Q — Ayarlar Menüsü (v1.5 — Madde 7)
// Tek bir ⚙️ butonu altında: Sesi Aç/Kapa, Ses Ayarları, Oyundan Çık.
// İlk kullanımda "🔊 Sesi Aç" büyük butonu kalır (mobil autoplay engelini açmak için kritik).
// Menü açıkken dışarı tıklayınca kapanır. Sadece köy/rol (sol panel) bölgesinde render edilir.

import { useState, useEffect, useRef } from 'react';
import { sesiEtkinlestir, sesiKapat, sesAktifMi, muzikCal } from './SesYoneticisi.js';
import SesAyarlariModal from './SesAyarlariModal.jsx';
import './AyarlarMenusu.css';

export default function AyarlarMenusu({ muzikFazi = null, onAyril = null }) {
  const [aktif, setAktif] = useState(sesAktifMi());
  const [ilkKez, setIlkKez] = useState(
    () => localStorage.getItem('q-ses-aktif') === null
  );
  const [menuAcik, setMenuAcik] = useState(false);
  const [sesAyarlariAcik, setSesAyarlariAcik] = useState(false);
  const sarmalRef = useRef(null);

  // Dönen kullanıcı sesi daha önce açtıysa mevcut faz müziğini başlat.
  useEffect(() => {
    if (aktif) muzikCal(muzikFazi);
    // yalnızca mount'ta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Menü açıkken dışarı tıklayınca veya Escape ile kapansın
  useEffect(() => {
    if (!menuAcik) return;
    function disariTikla(e) {
      if (sarmalRef.current && !sarmalRef.current.contains(e.target)) {
        setMenuAcik(false);
      }
    }
    function escKapat(e) {
      if (e.key === 'Escape') setMenuAcik(false);
    }
    document.addEventListener('mousedown', disariTikla);
    document.addEventListener('touchstart', disariTikla);
    document.addEventListener('keydown', escKapat);
    return () => {
      document.removeEventListener('mousedown', disariTikla);
      document.removeEventListener('touchstart', disariTikla);
      document.removeEventListener('keydown', escKapat);
    };
  }, [menuAcik]);

  function sesiAc() {
    sesiEtkinlestir();
    muzikCal(muzikFazi);
    setAktif(true);
    setIlkKez(false);
  }

  function sesiToggle() {
    if (aktif) {
      sesiKapat();
      setAktif(false);
    } else {
      sesiAc();
    }
  }

  function cikisYap() {
    setMenuAcik(false);
    if (window.confirm('Oyundan çıkmak istediğinden emin misin? Geri dönüş yok.')) {
      onAyril?.();
    }
  }

  // İlk kez — mobil autoplay engelini açmak için büyük "Sesi Aç" butonu
  if (ilkKez && !aktif) {
    return (
      <button
        className="ayarlar-ilkses"
        onClick={sesiAc}
        title="Müzik ve ses efektlerini aç"
      >
        🔊 Sesi Aç
      </button>
    );
  }

  return (
    <div className="ayarlar-sarmal" ref={sarmalRef}>
      <button
        className={`ayarlar-btn ${menuAcik ? 'ayarlar-btn--acik' : ''}`}
        onClick={() => setMenuAcik(v => !v)}
        title="Ayarlar"
        aria-label="Ayarlar menüsü"
        aria-expanded={menuAcik}
      >
        ⚙️
      </button>

      {menuAcik && (
        <div className="ayarlar-menu" role="menu">
          <button
            type="button"
            className="ayarlar-menu-satir"
            onClick={() => { sesiToggle(); }}
            role="menuitem"
          >
            <span className="ayarlar-menu-ikon">{aktif ? '🔊' : '🔇'}</span>
            <span className="ayarlar-menu-metin">{aktif ? 'Sesi Kapat' : 'Sesi Aç'}</span>
          </button>

          <button
            type="button"
            className="ayarlar-menu-satir"
            onClick={() => { setMenuAcik(false); setSesAyarlariAcik(true); }}
            role="menuitem"
          >
            <span className="ayarlar-menu-ikon">🎚️</span>
            <span className="ayarlar-menu-metin">Ses Ayarları</span>
          </button>

          {onAyril && (
            <>
              <div className="ayarlar-menu-ayrac" />
              <button
                type="button"
                className="ayarlar-menu-satir ayarlar-menu-satir--tehlikeli"
                onClick={cikisYap}
                role="menuitem"
              >
                <span className="ayarlar-menu-ikon">✕</span>
                <span className="ayarlar-menu-metin">Oyundan Çık</span>
              </button>
            </>
          )}
        </div>
      )}

      {sesAyarlariAcik && <SesAyarlariModal onKapat={() => setSesAyarlariAcik(false)} />}
    </div>
  );
}
