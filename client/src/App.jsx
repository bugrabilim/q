// Queer Quest Quench — Ana uygulama

import { useEffect, useState, useRef } from 'react';
import { socket } from './socket.js';
import AcilisEkrani from './ekranlar/AcilisEkrani.jsx';
import LobiEkrani from './ekranlar/LobiEkrani.jsx';
import RolKartiEkrani from './ekranlar/RolKartiEkrani.jsx';
import TanismaEkrani from './ekranlar/TanismaEkrani.jsx';
import GeceEkrani from './ekranlar/GeceEkrani.jsx';
import SabahEkrani from './ekranlar/SabahEkrani.jsx';
import TartismaEkrani from './ekranlar/TartismaEkrani.jsx';
import OylamaEkrani from './ekranlar/OylamaEkrani.jsx';
import BitisEkrani from './ekranlar/BitisEkrani.jsx';
import AyrilanEkrani from './ekranlar/AyrilanEkrani.jsx';
import OyunDuzeni from './ekranlar/OyunDuzeni.jsx';

const OYLAMA_FAZLARI = new Set(['oylama_1', 'savunma', 'oylama_2', 'oylama_tartisma', 'oylama_sonuc']);

export default function App() {
  const [faz, setFaz] = useState('acilis');
  const [oturum, setOturum] = useState(null);
  const [benimRolum, setBenimRolum] = useState(null);
  const [ayrilmaBilgisi, setAyrilmaBilgisi] = useState(null);
  // Sunucudan gelen alt-faz bilgisi (oylama_sonuc, savunma vb.) — sohbet/sunucu durumu için
  const [serverFaz, setServerFaz] = useState(null);
  const [savunulanId, setSavunulanId] = useState(null);
  // Ayrılan ekranındayken gelen faz:degisti'yi yok saymak için ref
  const fazRef = useRef('acilis');

  // gidFaz: setFaz + fazRef'i birlikte günceller
  // useEffect içinden erişebilmek için ref üzerinden tanımlanır
  const gidFazRef = useRef(null);
  gidFazRef.current = (yeniFaz) => { fazRef.current = yeniFaz; setFaz(yeniFaz); };

  useEffect(() => {
    function fazDegisti(d) {
      const yeniFaz = d.faz;
      // Server alt-fazını her zaman güncelle (sohbet/oyuncu listesi/savunulan için)
      setServerFaz(yeniFaz);
      if (yeniFaz === 'savunma' && d.savunulanId) setSavunulanId(d.savunulanId);
      // Ayrılan ekranındaysak ana faz yönlendirmelerini atla (bitiş/lobi hariç)
      if (fazRef.current === 'ayrilan' && yeniFaz !== 'bitis' && yeniFaz !== 'lobi') return;
      const gidFaz = gidFazRef.current;
      if (yeniFaz === 'rol_dagitimi') gidFaz('rol');
      else if (yeniFaz === 'tanisma') gidFaz('tanisma');
      else if (yeniFaz === 'gece') gidFaz('gece');
      else if (yeniFaz === 'sabah') gidFaz('sabah');
      else if (yeniFaz === 'tartisma') gidFaz('tartisma');
      else if (OYLAMA_FAZLARI.has(yeniFaz)) gidFaz('oylama');
      else if (yeniFaz === 'bitis') gidFaz('bitis');
      else if (yeniFaz === 'lobi') {
        setBenimRolum(null);
        setAyrilmaBilgisi(null);
        setServerFaz(null);
        setSavunulanId(null);
        gidFaz('lobi');
      }
    }
    function rolKartGeldi({ rol }) {
      setBenimRolum(rol);
    }
    function oyuncuAyrildi(bilgi) {
      if (bilgi.oyuncuId === socket.id) {
        setAyrilmaBilgisi({ rolAd: bilgi.rolAd, grup: bilgi.grup, sebep: bilgi.sebep });
        gidFazRef.current('ayrilan');
      }
    }
    socket.on('faz:degisti', fazDegisti);
    socket.on('rol:kart', rolKartGeldi);
    socket.on('oyuncu:ayrildi', oyuncuAyrildi);
    return () => {
      socket.off('faz:degisti', fazDegisti);
      socket.off('rol:kart', rolKartGeldi);
      socket.off('oyuncu:ayrildi', oyuncuAyrildi);
    };
  }, []);

  // setFaz her çağrıldığında fazRef'i de güncelle
  function gidFaz(yeniFaz) { fazRef.current = yeniFaz; setFaz(yeniFaz); }

  function onOdayaGir(bilgi) { setOturum(bilgi); gidFaz('lobi'); }
  function onAyril() { setOturum(null); setBenimRolum(null); setAyrilmaBilgisi(null); gidFaz('acilis'); }
  function onOylamaFazDegisti({ faz: yeniFaz }) {
    if (yeniFaz === 'gece') gidFaz('gece');
    else if (yeniFaz === 'bitis') gidFaz('bitis');
  }

  if (faz === 'acilis') return <AcilisEkrani onOdayaGir={onOdayaGir} />;

  if (faz === 'lobi') return (
    <LobiEkrani kod={oturum.kod} oyuncuId={oturum.oyuncuId} benimIsmim={oturum.benimIsmim} onAyril={onAyril} />
  );

  if (faz === 'rol') return <RolKartiEkrani benimIsmim={oturum.benimIsmim} rol={benimRolum} />;

  if (faz === 'bitis') return (
    <BitisEkrani benimIsmim={oturum.benimIsmim} oyuncuId={oturum.oyuncuId} onAyril={onAyril} />
  );

  // Aşağıdaki tüm fazlar 3 kolonlu sabit OyunDuzeni içinde render edilir
  // (sohbet, oyuncu listesi, rol kartı sürekli görünür — Madde 3, 6, 8)
  const ortakDuzen = (icerik, ayrildim = false) => (
    <OyunDuzeni
      oyuncuId={oturum.oyuncuId}
      benimRolum={benimRolum}
      faz={serverFaz || faz}
      ayrildimMi={ayrildim}
      savunulanId={savunulanId}
      onAyril={onAyril}
    >
      {icerik}
    </OyunDuzeni>
  );

  if (faz === 'tanisma') return ortakDuzen(
    <TanismaEkrani benimIsmim={oturum.benimIsmim} oyuncuId={oturum.oyuncuId} />
  );

  if (faz === 'gece') return ortakDuzen(
    <GeceEkrani benimIsmim={oturum.benimIsmim} oyuncuId={oturum.oyuncuId} benimRolum={benimRolum} />
  );

  if (faz === 'sabah') return ortakDuzen(
    <SabahEkrani benimIsmim={oturum.benimIsmim} oyuncuId={oturum.oyuncuId} onAyril={onAyril} benimRolumId={benimRolum?.id} />
  );

  if (faz === 'tartisma') return ortakDuzen(
    <TartismaEkrani benimIsmim={oturum.benimIsmim} oyuncuId={oturum.oyuncuId} benimRolumId={benimRolum?.id} />
  );

  if (faz === 'oylama') return ortakDuzen(
    <OylamaEkrani benimIsmim={oturum.benimIsmim} oyuncuId={oturum.oyuncuId} onFazDegisti={onOylamaFazDegisti} benimRolumId={benimRolum?.id} />
  );

  if (faz === 'ayrilan') return ortakDuzen(
    <AyrilanEkrani benimIsmim={oturum.benimIsmim} oyuncuId={oturum.oyuncuId} ayrilmaBilgisi={ayrilmaBilgisi} />,
    true
  );

  return null;
}
