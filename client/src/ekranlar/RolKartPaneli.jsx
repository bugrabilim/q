// Queer Quest Quench — Sürekli Rol Kart Paneli (Madde 6)
// Sol kolonun altında, oyuncu listesinin yanında. Her zaman erişilebilir.
// v1.3: "Diğer Roller →" butonu — oyun havuzundaki tüm rollerin modal galerisi.

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import KarakterPortresi from '../bilesenler/KarakterPortresi.jsx';
import './RolKartPaneli.css';

const GRUP_BILGI = {
  ozgurlukcu: { ad: 'Özgürlükçü', renk: 'var(--ozgurlukcu)', sembol: '🟢' },
  tarafsiz:   { ad: 'Tarafsız',   renk: 'var(--tarafsiz)',   sembol: '🟡' },
  gelenekci:  { ad: 'Gelenekçi',  renk: 'var(--gelenekci)',  sembol: '🔴' },
  outsider:   { ad: 'Outsider',   renk: 'var(--outsider, #9AA0A6)', sembol: '⚪' },
  kaoscu:     { ad: 'Kaosçu',     renk: 'var(--kaoscu, #1A1A1A)',   sembol: '⚫' }
};

// v1.8 — Lobi RolPopup ile aynı tasarım: grup niyetleri + burçlar
const GRUP_NIYETLERI = {
  ozgurlukcu: 'Gelenekçileri köyden uzaklaştırıp kim olduğunla özgürce yaşamak.',
  outsider:   'Köyde kalıp Özgürlükçüler kazansın istiyorsun — ama farkında olmadan onları zayıflatıyorsun.',
  tarafsiz:   'Kendi bireysel hedefini tamamlamak — "Nasıl kazanırsın?" altında ne aradığın yazılı.',
  gelenekci:  'Özgürlükçüleri köyden uzaklaştırıp eski düzeni kurmak.',
  kaoscu:     'Kendi kaos hedefini sessizce gerçekleştirmek — "Nasıl kazanırsın?" altında yazılı.'
};

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

export default function RolKartPaneli({ rol }) {
  const [acik, setAcik] = useState(true);
  // v1.3 — Galeri modal state
  const [galeriAcik, setGaleriAcik] = useState(false);
  const [tumRoller, setTumRoller] = useState([]);
  const [seciliRol, setSeciliRol] = useState(null);

  // Galeri ilk açıldığında server'dan rolleri çek
  useEffect(() => {
    if (galeriAcik && tumRoller.length === 0) {
      socket.emit('roller:listele', null, (cevap) => {
        if (cevap?.ok && Array.isArray(cevap.roller)) setTumRoller(cevap.roller);
      });
    }
  }, [galeriAcik, tumRoller.length]);

  if (!rol) {
    return (
      <div className="rol-kart-paneli">
        <header className="rol-kart-paneli-bas">
          <span className="rol-kart-paneli-baslik">🎭 Rolün</span>
        </header>
        <p className="rol-kart-paneli-bos">Rol bilgisi yükleniyor…</p>
      </div>
    );
  }

  const grup = GRUP_BILGI[rol.grup] || { ad: '?', renk: 'var(--derin)', sembol: '·' };

  return (
    <div className={`rol-kart-paneli ${acik ? '' : 'rol-kart-paneli--kapali'}`}>
      <header className="rol-kart-paneli-bas" onClick={() => setAcik(a => !a)}>
        <span className="rol-kart-paneli-baslik">
          🎭 {rol.ad}
        </span>
        <span className="rol-kart-paneli-acma">{acik ? '−' : '+'}</span>
      </header>

      {acik && (
        <div className="rol-kart-paneli-icerik">
          <div
            className="rol-kart-paneli-grup-bant"
            style={{ background: grup.renk }}
          >
            {grup.sembol} {grup.ad}
          </div>

          {/* v1.8 — Karakterin Hikayesi (3 alt grup) */}
          <div className="rol-kart-paneli-bolum">
            <p className="rol-kart-paneli-bolum-baslik">Karakterin Hikayesi</p>

            {rol.karakter && (
              <>
                <p className="rol-kart-paneli-bolum-altbaslik">Kim?</p>
                <p className="rol-kart-paneli-bolum-metin">
                  <strong>{rol.karakter}</strong>
                  {rol.yas && <> · {rol.yas}</>}
                  {rol.meslek && <> · {rol.meslek}</>}
                  {ROL_BURCLARI[rol.id] && (
                    <> · <span className="rol-kart-paneli-burc">{ROL_BURCLARI[rol.id].sembol} {ROL_BURCLARI[rol.id].ad}</span></>
                  )}
                </p>
              </>
            )}

            {rol.motivasyon && (
              <>
                <p className="rol-kart-paneli-bolum-altbaslik rol-kart-paneli-altbaslik-ikinci">Neden bu köye geldin?</p>
                <p className="rol-kart-paneli-bolum-metin rol-kart-paneli-motivasyon">
                  {rol.motivasyon}
                </p>
              </>
            )}

            <p className="rol-kart-paneli-bolum-altbaslik rol-kart-paneli-altbaslik-ikinci">Ne yapmak istiyorsun?</p>
            <p className="rol-kart-paneli-bolum-metin">{GRUP_NIYETLERI[rol.grup] || '—'}</p>
          </div>

          {/* v1.8 — Oyundaki Görevin (2 alt grup) */}
          <div className="rol-kart-paneli-bolum">
            <p className="rol-kart-paneli-bolum-baslik">Oyundaki Görevin</p>

            {rol.geceAksiyonu && (
              <>
                <p className="rol-kart-paneli-bolum-altbaslik">Ne yaparsın?</p>
                <p className="rol-kart-paneli-bolum-metin">{rol.geceAksiyonu}</p>
              </>
            )}

            {rol.kazanmaKosulu && (
              <>
                <p className="rol-kart-paneli-bolum-altbaslik rol-kart-paneli-altbaslik-ikinci">Nasıl kazanırsın?</p>
                <p className="rol-kart-paneli-bolum-metin">{rol.kazanmaKosulu}</p>
              </>
            )}
          </div>

          <button
            className="rol-kart-paneli-galeri-btn"
            onClick={() => setGaleriAcik(true)}
            title="Bu oyunda kim hangi rolü oynayabilir?"
          >
            Diğer Roller →
          </button>
        </div>
      )}

      {/* v1.3 — Galeri modal */}
      {galeriAcik && (
        <RollerGalerisiModal
          roller={tumRoller}
          seciliRol={seciliRol}
          onSec={setSeciliRol}
          onKapat={() => { setGaleriAcik(false); setSeciliRol(null); }}
        />
      )}
    </div>
  );
}

// v1.3 — Tüm roller galerisi (lobi'dekiyle aynı UX, modal popup)
function RollerGalerisiModal({ roller, seciliRol, onSec, onKapat }) {
  useEffect(() => {
    function esc(e) { if (e.key === 'Escape') onKapat(); }
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onKapat]);

  if (seciliRol) {
    return (
      <RolDetayPopup rol={seciliRol} onKapat={() => onSec(null)} />
    );
  }

  return (
    <div className="lobi-popup-arka" onClick={onKapat}>
      <div
        className="lobi-popup-kart rol-galeri-popup"
        onClick={e => e.stopPropagation()}
      >
        <button className="lobi-popup-kapat" onClick={onKapat}>✕</button>
        <h2 className="lobi-popup-ad" style={{ marginTop: 0 }}>Diğer Roller</h2>
        <p className="lobi-roller-altyazi">Birine tıkla → detay açılır</p>
        {roller.length === 0 ? (
          <p className="rol-kart-paneli-bos">Roller yükleniyor…</p>
        ) : (
          <div className="lobi-roller-bolumler">
            {['ozgurlukcu', 'tarafsiz', 'gelenekci', 'outsider', 'kaoscu'].map(grupId => {
              const grupRolleri = roller.filter(r => r.grup === grupId);
              if (grupRolleri.length === 0) return null;
              const grup = GRUP_BILGI[grupId];
              return (
                <div key={grupId} className="lobi-roller-bolum">
                  <h3 className="lobi-roller-bolum-baslik" style={{ color: grup?.renk, borderColor: grup?.renk }}>
                    <span className="lobi-roller-bolum-sembol">{grup?.sembol}</span>
                    <span className="lobi-roller-bolum-ad">{grup?.ad}</span>
                    <span className="lobi-roller-bolum-sayi">({grupRolleri.length})</span>
                  </h3>
                  <div className="lobi-roller-grid">
                    {grupRolleri.map(r => (
                      <button
                        key={r.id}
                        className="lobi-rol-kart"
                        style={{ borderColor: grup?.renk }}
                        onClick={() => onSec(r)}
                      >
                        <KarakterPortresi karakter={r.karakter} gorsel={r.gorsel} grup={r.grup} boyut={48} />
                        <span className="lobi-rol-kart-ad">{r.ad}</span>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// v1.8 — Detay popup (Lobi RolPopup ile bire bir aynı: Karakterin Hikayesi + Oyundaki Görevin)
function RolDetayPopup({ rol, onKapat }) {
  const grup = GRUP_BILGI[rol.grup];
  const burc = ROL_BURCLARI[rol.id];

  useEffect(() => {
    function esc(e) { if (e.key === 'Escape') onKapat(); }
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onKapat]);

  return (
    <div className="lobi-popup-arka" onClick={onKapat}>
      <div className="lobi-popup-kart" onClick={e => e.stopPropagation()} style={{ borderColor: grup?.renk }}>
        <button className="lobi-popup-kapat" onClick={onKapat}>← Geri</button>
        <div className="lobi-popup-bas">
          <div className="lobi-popup-portre-sarmal">
            <KarakterPortresi karakter={rol.karakter} gorsel={rol.gorsel} grup={rol.grup} boyut={96} />
          </div>
          <p className="lobi-popup-grup" style={{ color: grup?.renk }}>
            {grup?.sembol} {grup?.ad}
          </p>
          <h2 className="lobi-popup-ad">{rol.ad}</h2>
        </div>

        <div className="lobi-popup-bolum">
          <p className="lobi-popup-bolum-baslik">Karakterin Hikayesi</p>

          <p className="lobi-popup-bolum-altbaslik">Kim?</p>
          <p className="lobi-popup-bolum-metin">
            <strong>{rol.karakter}</strong> · {rol.yas} · {rol.meslek}
            {burc && <> · <span className="lobi-popup-burc">{burc.sembol} {burc.ad}</span></>}
          </p>

          <p className="lobi-popup-bolum-altbaslik lobi-popup-altbaslik-ikinci">Neden bu köye geldin?</p>
          <p className="lobi-popup-bolum-metin lobi-popup-motivasyon">{rol.motivasyon}</p>

          <p className="lobi-popup-bolum-altbaslik lobi-popup-altbaslik-ikinci">Ne yapmak istiyorsun?</p>
          <p className="lobi-popup-bolum-metin">{GRUP_NIYETLERI[rol.grup] || '—'}</p>
        </div>

        <div className="lobi-popup-bolum">
          <p className="lobi-popup-bolum-baslik">Oyundaki Görevin</p>

          <p className="lobi-popup-bolum-altbaslik">Ne yaparsın?</p>
          <p className="lobi-popup-bolum-metin">{rol.geceAksiyonu}</p>

          <p className="lobi-popup-bolum-altbaslik lobi-popup-altbaslik-ikinci">Nasıl kazanırsın?</p>
          <p className="lobi-popup-bolum-metin">{rol.kazanmaKosulu}</p>
        </div>
      </div>
    </div>
  );
}
