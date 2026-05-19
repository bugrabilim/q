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
import { uzunHikayeyiAl } from '../karakterler/hikayeler.js';
import './RolKartiEkrani.css';

const GRUP_BILGI = {
  ozgurlukcu: { ad: 'Özgürlükçü', renk: 'var(--ozgurlukcu)', sembol: '🟢' },
  tarafsiz:   { ad: 'Tarafsız',   renk: 'var(--tarafsiz)',   sembol: '🟡' },
  gelenekci:  { ad: 'Gelenekçi',  renk: 'var(--gelenekci)',  sembol: '🔴' },
  outsider:   { ad: 'Outsider',   renk: 'var(--outsider, #9AA0A6)', sembol: '⚪' },
  kaoscu:     { ad: 'Kaosçu',     renk: 'var(--kaoscu, #1A1A1A)',   sembol: '⚫' }
};

// v1.8 — Grup bazlı "Ne yapmak istiyorsun?" niyet metinleri (Lobi RolPopup ile aynı)
const GRUP_NIYETLERI = {
  ozgurlukcu: 'Gelenekçileri köyden uzaklaştırıp kim olduğunla özgürce yaşamak.',
  outsider:   'Köyde kalıp Özgürlükçüler kazansın istiyorsun — ama farkında olmadan onları zayıflatıyorsun.',
  tarafsiz:   'Kendi bireysel hedefini tamamlamak — "Nasıl kazanırsın?" altında ne aradığın yazılı.',
  gelenekci:  'Özgürlükçüleri köyden uzaklaştırıp eski düzeni kurmak.',
  kaoscu:     'Kendi kaos hedefini sessizce gerçekleştirmek — "Nasıl kazanırsın?" altında yazılı.'
};

// v1.8 — Karakter burçları (Lobi RolPopup ile aynı)
const ROL_BURCLARI = {
  gay: { sembol: '♎', ad: 'Terazi' }, lezbiyen: { sembol: '♍', ad: 'Başak' },
  biseksuel: { sembol: '♊', ad: 'İkizler' }, transseksuel: { sembol: '♋', ad: 'Yengeç' },
  interseksuel: { sembol: '♒', ad: 'Kova' }, panseksuel: { sembol: '♐', ad: 'Yay' },
  non_binary: { sembol: '♓', ad: 'Balık' }, crossdresser: { sembol: '♈', ad: 'Koç' },
  drag_queen: { sembol: '♌', ad: 'Aslan' }, femboy: { sembol: '♉', ad: 'Boğa' },
  ladyboy: { sembol: '♏', ad: 'Akrep' }, bastirmis: { sembol: '♑', ad: 'Oğlak' },
  hetero_erkek: { sembol: '♌', ad: 'Aslan' }, hetero_kadin: { sembol: '♊', ad: 'İkizler' },
  aseksuel: { sembol: '♒', ad: 'Kova' }, copcatan: { sembol: '♎', ad: 'Terazi' },
  fetisist: { sembol: '♍', ad: 'Başak' }, sugar_baby: { sembol: '♓', ad: 'Balık' },
  sugar_daddy: { sembol: '♑', ad: 'Oğlak' }, capkin: { sembol: '♐', ad: 'Yay' },
  mazosist: { sembol: '♏', ad: 'Akrep' }, koca_kari: { sembol: '♉', ad: 'Boğa' },
  poliamorist: { sembol: '♊', ad: 'İkizler' }, fuckbuddy: { sembol: '♈', ad: 'Koç' },
  lovebuddy: { sembol: '♋', ad: 'Yengeç' }, situationship: { sembol: '♓', ad: 'Balık' },
  homofobik: { sembol: '♉', ad: 'Boğa' }, transfobik: { sembol: '♑', ad: 'Oğlak' },
  bifobik: { sembol: '♏', ad: 'Akrep' }, erkek_dusmani: { sembol: '♈', ad: 'Koç' },
  muhafazakar: { sembol: '♑', ad: 'Oğlak' }, dinci: { sembol: '♍', ad: 'Başak' },
  nb_karsiti: { sembol: '♍', ad: 'Başak' }, cinsiyetci: { sembol: '♌', ad: 'Aslan' },
  kaoscu_narsist: { sembol: '♌', ad: 'Aslan' }, sadist: { sembol: '♏', ad: 'Akrep' },
  sinir_tanimaz: { sembol: '♐', ad: 'Yay' }, zorba: { sembol: '♈', ad: 'Koç' }
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
  const burc = ROL_BURCLARI[rol.id];
  const [uzunHikaye, setUzunHikaye] = useState(null);

  useEffect(() => {
    uzunHikayeyiAl(rol.karakter).then(setUzunHikaye);
  }, [rol.karakter]);

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

        {/* Ana kart — v1.8 ortak tasarım (Lobi RolPopup ile aynı) */}
        <article className="rol-kart" style={{ borderColor: grup.renk }}>
          <header className="rol-kart-bas">
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
          </header>

          {/* Karakterin Hikayesi (3 alt grup: Kim? / Neden? / Ne yapmak istiyorsun?) */}
          <div className="rol-bolum">
            <h2 className="rol-bolum-baslik">Karakterin Hikayesi</h2>

            <p className="rol-bolum-altbaslik">Kim?</p>
            <p className="rol-bolum-metin">
              <strong>{rol.karakter}</strong> · {rol.yas} · {rol.meslek}
              {burc && <> · <span className="rol-burc">{burc.sembol} {burc.ad}</span></>}
            </p>

            <p className="rol-bolum-altbaslik rol-altbaslik-ikinci">Neden bu köye geldin?</p>
            <p className="rol-bolum-metin rol-motivasyon">{rol.motivasyon}</p>
            {uzunHikaye && (
              <details className="rol-detayli-hikaye">
                <summary>Detaylı oku</summary>
                <div className="rol-detayli-hikaye-icerik">
                  {uzunHikaye.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </details>
            )}

            <p className="rol-bolum-altbaslik rol-altbaslik-ikinci">Ne yapmak istiyorsun?</p>
            <p className="rol-bolum-metin">{GRUP_NIYETLERI[rol.grup] || '—'}</p>
          </div>

          {/* Oyundaki Görevin (2 alt grup: Ne yaparsın? / Nasıl kazanırsın?) */}
          <div className="rol-bolum">
            <h2 className="rol-bolum-baslik">Oyundaki Görevin</h2>

            <p className="rol-bolum-altbaslik">Ne yaparsın?</p>
            <p className="rol-bolum-metin">{rol.geceAksiyonu}</p>

            <p className="rol-bolum-altbaslik rol-altbaslik-ikinci">Nasıl kazanırsın?</p>
            <p className="rol-bolum-metin">{rol.kazanmaKosulu}</p>

            {/* v1.8.30 — Necmi forum bağı (Aşama 3): gelenekçilere atmosferik not */}
            {rol.grup === 'gelenekci' && rol.forumTanidikSayisi > 0 && (
              <>
                <p className="rol-bolum-altbaslik rol-altbaslik-ikinci">Necmi'nin Forumu</p>
                <p className="rol-bolum-metin rol-forum-not">
                  Necmi'nin forumundan tanıdığın <strong>{rol.forumTanidikSayisi} kişi</strong> daha köyde. Kim oldukları sana söylenmez — ama benzer üslupla konuşan birini görürsen, dikkat et.
                </p>
              </>
            )}
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
