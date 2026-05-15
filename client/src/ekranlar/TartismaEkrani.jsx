// Queer Quest Quench — Faz 6: Tartışma (Aşama C sade hali)
// Sohbet artık sürekli SohbetPaneli'nde — bu ekran sadece sayaç + hazır banner + faz başlığı.

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import { efektCal } from '../ses/SesYoneticisi.js';
import './TartismaEkrani.css';

export default function TartismaEkrani({ benimIsmim, oyuncuId, benimRolumId }) {
  const [sonZaman, setSonZaman] = useState(null);
  const [kalanSn, setKalanSn] = useState(0);

  const [hazirMiyim, setHazirMiyim] = useState(false);
  const [hazirDurumu, setHazirDurumu] = useState({ hazir: 0, toplam: 0 });

  // Mount
  useEffect(() => {
    socket.emit('tartisma:durumIste', null, (cevap) => {
      if (!cevap?.ok) return;
      if (cevap.sonZaman) setSonZaman(cevap.sonZaman);
      if (typeof cevap.hazirMiyim === 'boolean') setHazirMiyim(cevap.hazirMiyim);
      if (typeof cevap.hazirSayisi === 'number') {
        setHazirDurumu({ hazir: cevap.hazirSayisi, toplam: cevap.hazirToplam || 0 });
      }
    });
  }, []);

  useEffect(() => {
    function fazDegisti(d) {
      if (d.faz !== 'tartisma') return;
      if (d.sonZaman) setSonZaman(d.sonZaman);
      setHazirMiyim(false);
      setHazirDurumu({ hazir: 0, toplam: 0 });
    }
    function hazirGuncelle(d) { setHazirDurumu(d); }
    socket.on('faz:degisti', fazDegisti);
    socket.on('tartisma:hazirDurumu', hazirGuncelle);
    return () => {
      socket.off('faz:degisti', fazDegisti);
      socket.off('tartisma:hazirDurumu', hazirGuncelle);
    };
  }, []);

  // Sayaç
  useEffect(() => {
    if (!sonZaman) return;
    const tik = () => {
      const kalan = Math.max(0, Math.ceil((sonZaman - Date.now()) / 1000));
      setKalanSn(kalan);
    };
    tik();
    const id = setInterval(tik, 250);
    return () => clearInterval(id);
  }, [sonZaman]);

  function hazirToggle() {
    efektCal('tikla');
    if (hazirMiyim) {
      socket.emit('tartisma:hazirGeriCek', null, (cevap) => {
        if (cevap?.ok) setHazirMiyim(false);
      });
    } else {
      socket.emit('tartisma:hazir', null, (cevap) => {
        if (cevap?.ok) setHazirMiyim(true);
      });
    }
  }

  return (
    <div className="tartisma">
      <header className="tartisma-bas">
        <div className="tartisma-bas-sol">
          <p className="tartisma-faz">Tartışma 💬</p>
          <p className="tartisma-altfaz">Köyde dün gece neler oldu?</p>
        </div>
        <div className="tartisma-sayac">
          <span className="tartisma-sayac-degeri">{kalanSn}</span>
          <span className="tartisma-sayac-birim">sn</span>
        </div>
      </header>

      <div className="tartisma-banner">
        <div className="tartisma-banner-metin">
          <p className="tartisma-banner-baslik">Konuşmayı bitirdiysen hazır ol</p>
          {hazirDurumu.toplam > 0 && (
            <p className="tartisma-banner-altyazi">
              {hazirDurumu.hazir} / {hazirDurumu.toplam} hazır
            </p>
          )}
        </div>
        <button
          className={`tartisma-banner-btn ${hazirMiyim ? 'tartisma-banner-btn-aktif' : ''}`}
          onClick={hazirToggle}
        >
          {hazirMiyim ? 'Hazır ✓' : 'Hazırım'}
        </button>
      </div>

      <div className="tartisma-not-bandi">
        💬 Sohbet sağdaki panelde — herkes konuşabilir.
      </div>
    </div>
  );
}
