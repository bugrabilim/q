// Queer Quest Quench — Sürekli Oyuncu Listesi (Madde 8 + 12)
// Tüm fazlarda sabit görünür. Ayrıldıysa çizik + rol etiketi, kimliği açıklandıysa rol etiketi.

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
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
      <header
        className="oyuncu-listesi-bas"
        onClick={() => setAcik(a => !a)}
        title={acik ? 'Listeyi kapat' : 'Listeyi aç'}
      >
        <span className="oyuncu-listesi-baslik">👥 Köy</span>
        <span className="oyuncu-listesi-sag-bas">
          <span className="oyuncu-listesi-sayac">
            {koydekiler.length}/{oyuncular.length}
          </span>
          <span className="oyuncu-listesi-acma">{acik ? '−' : '+'}</span>
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
    </div>
  );
}

function Satir({ o, oyuncuId }) {
  const benim = o.id === oyuncuId;
  const ayrilmis = !o.koydeMi;
  const rol = o.rol;
  return (
    <li
      className={`oyuncu-listesi-satir ${ayrilmis ? 'oyuncu-listesi-satir--ayrilmis' : ''} ${benim ? 'oyuncu-listesi-satir--ben' : ''}`}
    >
      <span className="oyuncu-listesi-isim">
        {o.isim}
        {benim && <span className="oyuncu-listesi-sen"> (sen)</span>}
        {o.hostMu && <span className="oyuncu-listesi-host">host</span>}
      </span>
      <span className="oyuncu-listesi-sag">
        {!o.baglantiVar && <span className="oyuncu-listesi-cevrimdisi">●</span>}
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
