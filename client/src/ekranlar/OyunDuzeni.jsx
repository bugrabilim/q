// Queer Quest Quench — Ortak Oyun Düzeni
// 3 kolonlu sabit yerleşim: sol = OyuncuListesi + RolKartPaneli, orta = ana içerik, sağ = SohbetPaneli
// Sağ üst köşede sabit "Oyundan Çık" butonu (Madde 2).

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import OyuncuListesi from './OyuncuListesi.jsx';
import RolKartPaneli from './RolKartPaneli.jsx';
import SohbetPaneli from './SohbetPaneli.jsx';
import './OyunDuzeni.css';

// Fobik roller (gece sohbet kanalı için)
const FOBIK_ROL_IDLERI = ['homofobik', 'muhafazakar', 'erkek_dusmani'];

export default function OyunDuzeni({
  oyuncuId,
  benimRolum,
  faz,
  ayrildimMi = false,
  savunulanId = null,
  onAyril,
  children
}) {
  const [oyuncularSnapshot, setOyuncularSnapshot] = useState([]);
  // Madde 7: Mobilde aktif sekme — 'sol' (Köy+Rol) | 'orta' (Oyun) | 'sag' (Sohbet)
  const [mobilSekme, setMobilSekme] = useState('orta');

  useEffect(() => {
    function listeGeldi(d) {
      if (Array.isArray(d?.oyuncular)) setOyuncularSnapshot(d.oyuncular);
    }
    socket.on('oyuncu:listesi', listeGeldi);
    return () => socket.off('oyuncu:listesi', listeGeldi);
  }, []);

  const fobikUye = !!benimRolum && FOBIK_ROL_IDLERI.includes(benimRolum.id);

  function cikisYap() {
    if (window.confirm('Oyundan çıkmak istediğinden emin misin? Geri dönüş yok.')) {
      socket.emit('oda:ayril');
      onAyril?.();
    }
  }

  return (
    <div className="oyun-duzeni" data-mobil-sekme={mobilSekme}>
      {/* Sağ üst köşe — sabit oyundan çık butonu (Madde 2) */}
      {onAyril && (
        <button className="oyun-duzeni-cikis" onClick={cikisYap} title="Oyundan çık">
          ✕ Oyundan Çık
        </button>
      )}

      {/* Sol kolon — oyuncu listesi + rol kartı */}
      <aside className={`oyun-duzeni-sol ${mobilSekme === 'sol' ? 'oyun-duzeni-aktif' : ''}`}>
        <OyuncuListesi oyuncuId={oyuncuId} faz={faz} />
        <RolKartPaneli rol={benimRolum} />
      </aside>

      {/* Orta — ekrana özel ana içerik */}
      <main className={`oyun-duzeni-orta ${mobilSekme === 'orta' ? 'oyun-duzeni-aktif' : ''}`}>
        {children}
      </main>

      {/* Sağ kolon — sürekli sohbet */}
      <aside className={`oyun-duzeni-sag ${mobilSekme === 'sag' ? 'oyun-duzeni-aktif' : ''}`}>
        <SohbetPaneli
          oyuncuId={oyuncuId}
          faz={faz}
          benimRolumId={benimRolum?.id}
          fobikUye={fobikUye}
          ayrildimMi={ayrildimMi}
          savunulanId={savunulanId}
        />
      </aside>

      {/* Madde 7: Mobil alt sekme barı — sadece mobilde görünür */}
      <nav className="oyun-duzeni-mobil-sekmeler">
        <button
          className={`oyun-duzeni-sekme-btn ${mobilSekme === 'sol' ? 'oyun-duzeni-sekme-btn--aktif' : ''}`}
          onClick={() => setMobilSekme('sol')}
        >
          <span className="oyun-duzeni-sekme-icon">👥</span>
          <span className="oyun-duzeni-sekme-etiket">Köy / Rol</span>
        </button>
        <button
          className={`oyun-duzeni-sekme-btn ${mobilSekme === 'orta' ? 'oyun-duzeni-sekme-btn--aktif' : ''}`}
          onClick={() => setMobilSekme('orta')}
        >
          <span className="oyun-duzeni-sekme-icon">🎮</span>
          <span className="oyun-duzeni-sekme-etiket">Oyun</span>
        </button>
        <button
          className={`oyun-duzeni-sekme-btn ${mobilSekme === 'sag' ? 'oyun-duzeni-sekme-btn--aktif' : ''}`}
          onClick={() => setMobilSekme('sag')}
        >
          <span className="oyun-duzeni-sekme-icon">💬</span>
          <span className="oyun-duzeni-sekme-etiket">Sohbet</span>
        </button>
      </nav>
    </div>
  );
}
