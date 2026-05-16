// Queer Quest Quench — Sürekli Oyuncu Listesi (Madde 8 + 12)
// Tüm fazlarda sabit görünür. Ayrıldıysa çizik + rol etiketi, kimliği açıklandıysa rol etiketi.
// v1.3: Başlık çubuğunda 📓 Not Defteri butonu (Master §13).

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import NotDefteriModal from './NotDefteriModal.jsx';
import { efektCal } from '../ses/SesYoneticisi.js';
import KarakterPortresi from '../bilesenler/KarakterPortresi.jsx';
import './OyuncuListesi.css';

const GRUP_RENGI = {
  ozgurlukcu: 'var(--ozgurlukcu)',
  tarafsiz: 'var(--tarafsiz)',
  gelenekci: 'var(--gelenekci)'
};
const GRUP_SEMBOL = {
  ozgurlukcu: '🟢',
  tarafsiz: '🟡',
  gelenekci: '🔴'
};

export default function OyuncuListesi({ oyuncuId, faz }) {
  const [oyuncular, setOyuncular] = useState([]);
  const [acik, setAcik] = useState(true);
  // v1.3 — Not defteri modal state (Master §13: liste başlığındaki 📓 butonu)
  const [notModalAcik, setNotModalAcik] = useState(false);

  // Mount'ta + faz değiştiğinde server'dan listeyi iste
  useEffect(() => {
    const endpoint = endpointBul(faz);
    if (!endpoint) return;
    socket.emit(endpoint, null, (cevap) => {
      if (cevap?.ok && Array.isArray(cevap.oyuncular)) setOyuncular(cevap.oyuncular);
    });
  }, [faz]);

  // Server canlı liste güncellemesi (kimlik açıklama, ayrılma, vb.)
  useEffect(() => {
    function listeGeldi(d) {
      if (Array.isArray(d?.oyuncular)) setOyuncular(d.oyuncular);
    }
    socket.on('oyuncu:listesi', listeGeldi);
    return () => socket.off('oyuncu:listesi', listeGeldi);
  }, []);

  const koydekiler = oyuncular.filter(o => o.koydeMi);
  const ayrilanlar = oyuncular.filter(o => !o.koydeMi);

  return (
    <div className={`oyuncu-listesi ${acik ? '' : 'oyuncu-listesi--kapali'}`}>
      <header className="oyuncu-listesi-bas">
        <span
          className="oyuncu-listesi-baslik-tikla"
          onClick={() => setAcik(a => !a)}
          title={acik ? 'Listeyi kapat' : 'Listeyi aç'}
        >
          <span className="oyuncu-listesi-baslik">👥 Köy</span>
        </span>
        <span className="oyuncu-listesi-sag-bas">
          <span className="oyuncu-listesi-sayac">
            {koydekiler.length}/{oyuncular.length}
          </span>
          {/* v1.3 — 📓 Not defteri butonu (Master §13) */}
          <button
            className="oyuncu-listesi-not-btn"
            onClick={(e) => { e.stopPropagation(); efektCal('notdefteri'); setNotModalAcik(true); }}
            title="Not Defteri"
          >
            📓
          </button>
          <span
            className="oyuncu-listesi-acma"
            onClick={() => setAcik(a => !a)}
            title={acik ? 'Listeyi kapat' : 'Listeyi aç'}
          >
            {acik ? '−' : '+'}
          </span>
        </span>
      </header>

      {acik && (
        <div className="oyuncu-listesi-icerik">
          {/* Köyde olanlar */}
          {koydekiler.length > 0 && (
            <ul className="oyuncu-listesi-ul">
              {koydekiler.map(o => <Satir key={o.id} o={o} oyuncuId={oyuncuId} />)}
            </ul>
          )}

          {/* Ayrılanlar (Madde 5) */}
          {ayrilanlar.length > 0 && (
            <>
              <div className="oyuncu-listesi-ara-baslik">Ayrılanlar</div>
              <ul className="oyuncu-listesi-ul oyuncu-listesi-ul--ayrilanlar">
                {ayrilanlar.map(o => <Satir key={o.id} o={o} oyuncuId={oyuncuId} />)}
              </ul>
            </>
          )}
        </div>
      )}

      {/* v1.3 — Not defteri modal */}
      {notModalAcik && (
        <NotDefteriModal
          oyuncuId={oyuncuId}
          oyuncular={oyuncular}
          onKapat={() => { efektCal('notdefteri'); setNotModalAcik(false); }}
        />
      )}
    </div>
  );
}

function Satir({ o, oyuncuId }) {
  const benim = o.id === oyuncuId;
  const ayrilmis = !o.koydeMi;
  const rol = o.rol;
  // v1.3 — "Oyundan Çık" ile ayrılanlar için ibare (köy oylama/Kaan ile farklı)
  const oyundanAyrildi = ayrilmis && o.ayrilmaSebebi === 'kendi';
  return (
    <li
      className={`oyuncu-listesi-satir ${ayrilmis ? 'oyuncu-listesi-satir--ayrilmis' : ''} ${benim ? 'oyuncu-listesi-satir--ben' : ''}`}
    >
      {/* v1.6 — Madde 5: Mini avatar (rol ifşa olmuşsa karakter, değilse jenerik) */}
      <KarakterPortresi
        karakter={rol?.karakter}
        gorsel={rol?.gorsel}
        grup={rol?.grup}
        boyut={28}
        className="oyuncu-listesi-avatar"
      />
      <span className="oyuncu-listesi-isim">
        {o.isim}
        {benim && <span className="oyuncu-listesi-sen"> (sen)</span>}
        {o.hostMu && <span className="oyuncu-listesi-host">host</span>}
        {oyundanAyrildi && (
          <span className="oyuncu-listesi-cikti">(oyundan ayrıldı)</span>
        )}
      </span>
      <span className="oyuncu-listesi-sag">
        {!o.baglantiVar && !ayrilmis && <span className="oyuncu-listesi-cevrimdisi">●</span>}
        {rol && (
          <span
            className="oyuncu-listesi-rol"
            style={{ background: GRUP_RENGI[rol.grup] }}
          >
            {rol.ad}
          </span>
        )}
      </span>
    </li>
  );
}

function endpointBul(faz) {
  if (faz === 'tanisma') return 'tanisma:durumIste';
  if (faz === 'gece') return 'gece:durumIste';
  if (faz === 'sabah') return 'sabah:durumIste';
  if (faz === 'tartisma') return 'tartisma:durumIste';
  if (faz === 'oylama_1' || faz === 'oylama_2' || faz === 'savunma' || faz === 'oylama_tartisma') {
    return 'oylama:durumIste';
  }
  if (faz === 'oylama_sonuc') return 'oylama_sonuc:durumIste';
  return null;
}
