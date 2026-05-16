// Q — Ses Ayarları Modal'ı
// 3 slider: ana ses (master), müzik, efekt. Canlı uygulanır; tercih localStorage'da kalıcı.

import { useEffect, useState } from 'react';
import { seviyeAl, setMaster, setMuzikSes, setEfektSes, efektCal } from './SesYoneticisi.js';
import './SesAyarlariModal.css';

export default function SesAyarlariModal({ onKapat }) {
  const ilk = seviyeAl();
  const [master, _setMaster] = useState(Math.round(ilk.master * 100));
  const [muzik, _setMuzik] = useState(Math.round(ilk.muzik * 100));
  const [efekt, _setEfekt] = useState(Math.round(ilk.efekt * 100));

  // ESC ile kapanma
  useEffect(() => {
    function esc(e) {
      if (e.key === 'Escape') onKapat();
    }
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onKapat]);

  function masterDegis(e) {
    const v = Number(e.target.value);
    _setMaster(v);
    setMaster(v / 100);
  }
  function muzikDegis(e) {
    const v = Number(e.target.value);
    _setMuzik(v);
    setMuzikSes(v / 100);
  }
  function efektDegis(e) {
    const v = Number(e.target.value);
    _setEfekt(v);
    setEfektSes(v / 100);
  }
  // Slider'dan parmak çekildiğinde örnek bir efekt çal — yeni seviyeyi duyalım
  function efektOrnek() {
    efektCal('tikla');
  }

  return (
    <div className="ses-ayar-arka" onClick={onKapat}>
      <div
        className="ses-ayar-kart"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
      >
        <button className="ses-ayar-kapat" onClick={onKapat} aria-label="Kapat">
          ✕
        </button>
        <h2 className="ses-ayar-baslik">Ses Ayarları</h2>

        <div className="ses-ayar-satir">
          <label className="ses-ayar-etiket">
            <span>Ana Ses</span>
            <span className="ses-ayar-deger">{master}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={master}
            onChange={masterDegis}
            className="ses-ayar-slider"
          />
        </div>

        <div className="ses-ayar-satir">
          <label className="ses-ayar-etiket">
            <span>Müzik</span>
            <span className="ses-ayar-deger">{muzik}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={muzik}
            onChange={muzikDegis}
            className="ses-ayar-slider"
          />
        </div>

        <div className="ses-ayar-satir">
          <label className="ses-ayar-etiket">
            <span>Efekt</span>
            <span className="ses-ayar-deger">{efekt}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={efekt}
            onChange={efektDegis}
            onMouseUp={efektOrnek}
            onTouchEnd={efektOrnek}
            className="ses-ayar-slider"
          />
        </div>

        <p className="ses-ayar-bilgi">Tercihlerin tarayıcıda saklanır.</p>
      </div>
    </div>
  );
}
