// q — Faz 3: Rol Kartı Ekranı
// Belge Bölüm 11, Faz 3:
//   - Rol adı, grup rengi
//   - Karakter (isim, yaş, meslek)
//   - Köye geliş motivasyonu
//   - Gece aksiyonu açıklaması
//   - Kazanma koşulu
//   - "Anladım" butonu — basınca diğerlerinin de basmasını bekle

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import KarakterPortresi from '../bilesenler/KarakterPortresi.jsx';
import './RolKartiEkrani.css';

const GRUP_BILGI = {
  ozgurlukcu: { ad: 'Özgürlükçü', renk: 'var(--ozgurlukcu)', sembol: '🟢' },
  tarafsiz:   { ad: 'Tarafsız',   renk: 'var(--tarafsiz)',   sembol: '🟡' },
  gelenekci:  { ad: 'Gelenekçi',  renk: 'var(--gelenekci)',  sembol: '🔴' }
};

export default function RolKartiEkrani({ benimIsmim, rol: rolProp = null, sonZaman = null }) {
  const [rol, setRol] = useState(rolProp);
  const [onayli, setOnayli] = useState(false);
  const [onayDurumu, setOnayDurumu] = useState({ onayli: 0, toplam: 0 });
  // v1.5 — Madde 1: 30 sn otomatik geçiş sayacı
  const [kalanSn, setKalanSn] = useState(null);

  useEffect(() => {
    if (rolProp) setRol(rolProp); // prop sonradan da gelse güncelle
  }, [rolProp]);

  // Sayaç tik tik düşsün
  useEffect(() => {
    if (!sonZaman) { setKalanSn(null); return; }
    function guncelle() {
      const fark = Math.max(0, Math.round((sonZaman - Date.now()) / 1000));
      setKalanSn(fark);
    }
    guncelle();
    const id = setInterval(guncelle, 500);
    return () => clearInterval(id);
  }, [sonZaman]);

  useEffect(() => {
    function rolKart({ rol }) {
      setRol(rol);
    }
    function onayDurumuGuncelle(d) {
      setOnayDurumu(d);
    }

    socket.on('rol:kart', rolKart);
    socket.on('rol:onayDurumu', onayDurumuGuncelle);

    return () => {
      socket.off('rol:kart', rolKart);
      socket.off('rol:onayDurumu', onayDurumuGuncelle);
    };
  }, []);

  function anladim() {
    if (onayli) return;
    socket.emit('rol:onayla', null, (cevap) => {
      if (cevap?.ok) {
        setOnayli(true);
      }
    });
  }

  if (!rol) {
    return (
      <div className="rol-yukleniyor">
        <p className="rol-yukleniyor-yazi">Köy uyanıyor…</p>
      </div>
    );
  }

  const grup = GRUP_BILGI[rol.grup];

  return (
    <div className="rol-ekran">
      {kalanSn !== null && (
        <div className="rol-sayac" aria-live="polite">
          {kalanSn}s
        </div>
      )}
      <div className="rol-icerik">
        {/* Üst: kim olduğun */}
        <div className="rol-ust">
          <p className="rol-etiket">Sen <span className="rol-ben">{benimIsmim}</span>'sin</p>
          <p className="rol-ipucu">ama bu köyde…</p>
        </div>

        {/* Ana kart */}
        <article
          className="rol-kart"
          style={{ borderColor: grup.renk }}
        >
          <header className="rol-kart-bas">
            {/* v1.6 — Madde 5: Büyük karakter portresi */}
            <div className="rol-kart-portre-sarmal">
              <KarakterPortresi
                karakter={rol.karakter}
                gorsel={rol.gorsel}
                grup={rol.grup}
                boyut={108}
              />
            </div>
            <p className="rol-grup" style={{ color: grup.renk }}>
              {grup.sembol} {grup.ad}
            </p>
            <h1 className="rol-ad">{rol.ad}</h1>
            <p className="rol-karakter">
              <span className="rol-karakter-isim">{rol.karakter}</span>
              <span className="rol-karakter-ayrac"> · </span>
              <span>{rol.yas}</span>
              <span className="rol-karakter-ayrac"> · </span>
              <span>{rol.meslek}</span>
            </p>
          </header>

          <div className="rol-bolum">
            <h2 className="rol-bolum-baslik">Köye Gelişin</h2>
            <p className="rol-bolum-metin rol-motivasyon">{rol.motivasyon}</p>
          </div>

          <div className="rol-bolum">
            <h2 className="rol-bolum-baslik">Gece Aksiyonu</h2>
            <p className="rol-bolum-metin">{rol.geceAksiyonu}</p>
          </div>

          <div className="rol-bolum rol-kazanma">
            <h2 className="rol-bolum-baslik">Kazanmak İçin</h2>
            <p className="rol-bolum-metin">{rol.kazanmaKosulu}</p>
          </div>
        </article>

        {/* Alt: onay */}
        <div className="rol-alt">
          {!onayli ? (
            <button className="btn btn-birincil" onClick={anladim}>
              Anladım
            </button>
          ) : (
            <div className="rol-bekleme">
              <p className="rol-bekleme-yazi">Diğerleri okuyor…</p>
              <p className="rol-bekleme-sayac">
                {onayDurumu.onayli} / {onayDurumu.toplam}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
