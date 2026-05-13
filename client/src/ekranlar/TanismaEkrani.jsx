// Queer Quest Quench — Faz 4: Tanışma Günü (Aşama C sonrası sade hali)
// Sohbet artık sürekli SohbetPaneli'nde — bu ekran sadece sayaç + başvuru/hazır bannerları + açıklanmış kimlik bilgisi.

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import './TanismaEkrani.css';

const GRUP_SEMBOL = {
  ozgurlukcu: '🟢',
  tarafsiz: '🟡',
  gelenekci: '🔴'
};

export default function TanismaEkrani({ benimIsmim, oyuncuId }) {
  const [altFaz, setAltFaz] = useState('basvuru');
  const [sonZaman, setSonZaman] = useState(null);
  const [kalanSn, setKalanSn] = useState(0);

  const [basvurdumMu, setBasvurdumMu] = useState(false);
  const [basvuruSayisi, setBasvuruSayisi] = useState(0);

  const [hazirMiyim, setHazirMiyim] = useState(false);
  const [hazirDurumu, setHazirDurumu] = useState({ hazir: 0, toplam: 0 });

  const [aciklananlar, setAciklananlar] = useState({});

  // Mount: durumu sun
  useEffect(() => {
    socket.emit('tanisma:durumIste', null, (cevap) => {
      if (!cevap?.ok) return;
      if (cevap.altFaz) setAltFaz(cevap.altFaz);
      if (cevap.sonZaman) setSonZaman(cevap.sonZaman);
      if (cevap.aciklanmislar) setAciklananlar(cevap.aciklanmislar);
      if (typeof cevap.basvuruSayisi === 'number') setBasvuruSayisi(cevap.basvuruSayisi);
      if (typeof cevap.basvurdumMu === 'boolean') setBasvurdumMu(cevap.basvurdumMu);
    });
  }, []);

  useEffect(() => {
    function fazDegisti(d) {
      if (d.faz !== 'tanisma') return;
      if (d.altFaz) setAltFaz(d.altFaz);
      if (d.sonZaman) setSonZaman(d.sonZaman);
      if (d.aciklanmislar) setAciklananlar(d.aciklanmislar);
    }
    function altFazDegisti(d) {
      setAltFaz(d.altFaz);
      if (d.sonZaman) setSonZaman(d.sonZaman);
      setHazirMiyim(false);
      setHazirDurumu({ hazir: 0, toplam: 0 });
    }
    function basvuruDurumu(d) { setBasvuruSayisi(d.sayi); }
    function kimlikAciklandi(d) {
      setAciklananlar(önceki => ({
        ...önceki,
        [d.oyuncuId]: { ad: d.rol.ad, grup: d.rol.grup }
      }));
    }
    function hazirGuncelle(d) { setHazirDurumu(d); }

    socket.on('faz:degisti', fazDegisti);
    socket.on('tanisma:altFaz', altFazDegisti);
    socket.on('tanisma:basvuruDurumu', basvuruDurumu);
    socket.on('kimlik:aciklandi', kimlikAciklandi);
    socket.on('tanisma:hazirDurumu', hazirGuncelle);

    return () => {
      socket.off('faz:degisti', fazDegisti);
      socket.off('tanisma:altFaz', altFazDegisti);
      socket.off('tanisma:basvuruDurumu', basvuruDurumu);
      socket.off('kimlik:aciklandi', kimlikAciklandi);
      socket.off('tanisma:hazirDurumu', hazirGuncelle);
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

  function basvur() {
    if (basvurdumMu) {
      socket.emit('tanisma:basvuruGeriCek', null, (cevap) => {
        if (cevap?.ok) setBasvurdumMu(false);
      });
    } else {
      socket.emit('tanisma:basvur', null, (cevap) => {
        if (cevap?.ok) setBasvurdumMu(true);
      });
    }
  }

  function hazirToggle() {
    if (hazirMiyim) {
      socket.emit('tanisma:hazirGeriCek', null, (cevap) => {
        if (cevap?.ok) setHazirMiyim(false);
      });
    } else {
      socket.emit('tanisma:hazir', null, (cevap) => {
        if (cevap?.ok) setHazirMiyim(true);
      });
    }
  }

  const aciklananLar = Object.entries(aciklananlar);

  return (
    <div className="tanisma">
      <header className="tanisma-bas">
        <div className="tanisma-bas-sol">
          <p className="tanisma-faz">Tanışma Günü ☀️</p>
          <p className="tanisma-altfaz">
            {altFaz === 'basvuru' ? 'Kimlik açma penceresi' : 'Serbest tanışma'}
          </p>
        </div>
        <div className="tanisma-sayac">
          <span className="tanisma-sayac-degeri">{kalanSn}</span>
          <span className="tanisma-sayac-birim">sn</span>
        </div>
      </header>

      {altFaz === 'basvuru' ? (
        <BasvuruBanner
          basvurdumMu={basvurdumMu}
          basvuruSayisi={basvuruSayisi}
          onTikla={basvur}
        />
      ) : (
        <HazirBanner
          hazirMiyim={hazirMiyim}
          hazir={hazirDurumu.hazir}
          toplam={hazirDurumu.toplam}
          onTikla={hazirToggle}
        />
      )}

      {/* Açıklanmış kimlikler */}
      {aciklananLar.length > 0 && (
        <section className="tanisma-aciklanan-bolum">
          <h3 className="tanisma-aciklanan-baslik">Kimliğini açanlar</h3>
          <ul className="tanisma-aciklanan-liste">
            {aciklananLar.map(([id, k]) => (
              <li key={id} className="tanisma-aciklanan-satir">
                <span className="tanisma-aciklanan-isim">
                  {GRUP_SEMBOL[k.grup]} {k.ad}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="tanisma-not-bandi">
        💬 Konuşmalar sağdaki sohbet panelinde — herkes okuyabilir, yazabilir.
      </div>
    </div>
  );
}

function BasvuruBanner({ basvurdumMu, basvuruSayisi, onTikla }) {
  return (
    <div className="banner banner-basvuru">
      <div className="banner-metin">
        <p className="banner-baslik">Kimliğini açmak ister misin?</p>
        {basvuruSayisi > 0 && (
          <p className="banner-altyazi">{basvuruSayisi} kişi başvurdu</p>
        )}
      </div>
      <button
        className={`banner-btn ${basvurdumMu ? 'banner-btn-aktif' : ''}`}
        onClick={onTikla}
      >
        {basvurdumMu ? 'Geri çek' : 'Başvur'}
      </button>
    </div>
  );
}

function HazirBanner({ hazirMiyim, hazir, toplam, onTikla }) {
  return (
    <div className="banner banner-hazir">
      <div className="banner-metin">
        <p className="banner-baslik">Geceye geçmeye hazır mısın?</p>
        {toplam > 0 && (
          <p className="banner-altyazi">{hazir} / {toplam} hazır</p>
        )}
      </div>
      <button
        className={`banner-btn ${hazirMiyim ? 'banner-btn-aktif' : ''}`}
        onClick={onTikla}
      >
        {hazirMiyim ? 'Hazır ✓' : 'Hazırım'}
      </button>
    </div>
  );
}
