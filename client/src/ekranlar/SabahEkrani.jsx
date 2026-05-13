// Queer Quest Quench — Faz 6 (Sabah Bölümü)
// Belge Bölüm 11 — Faz 6 (Sabah + Tartışma)
// Bu sürümde tartışma henüz yok, sadece sabah çözümleme görüntüsü ve "Devam" butonu

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import './SabahEkrani.css';

const GRUP_RENGI = {
  ozgurlukcu: 'var(--ozgurlukcu)',
  tarafsiz: 'var(--tarafsiz)',
  gelenekci: 'var(--gelenekci)'
};

const GRUP_AD = {
  ozgurlukcu: 'Özgürlükçü',
  tarafsiz: 'Tarafsız',
  gelenekci: 'Gelenekçi'
};

export default function SabahEkrani({ benimIsmim, oyuncuId, onAyril, benimRolumId }) {
  const [benimSabah, setBenimSabah] = useState(null);
  const [herkeseSabah, setHerkeseSabah] = useState(null);
  const [hostMu, setHostMu] = useState(false);
  const [devamGonderildi, setDevamGonderildi] = useState(false);

  // Mount: hem state'i sunucudan iste hem de event'leri dinle (yenileme dostu)
  useEffect(() => {
    socket.emit('sabah:durumIste', null, (cevap) => {
      if (!cevap?.ok) return;
      if (cevap.benimSabah) setBenimSabah(cevap.benimSabah);
      if (cevap.herkeseSabah) setHerkeseSabah(cevap.herkeseSabah);
      if (typeof cevap.hostMu === 'boolean') setHostMu(cevap.hostMu);
    });

    function kisiselGeldi(paket) {
      setBenimSabah(paket);
    }
    socket.on('gece:sabahKisisel', kisiselGeldi);

    function fazDegisti(paket) {
      if (paket.faz === 'sabah' && paket.herkeseSabah !== undefined) {
        setHerkeseSabah({
          geceTuru: paket.geceTuru,
          herkeseSabah: paket.herkeseSabah,
          ayrilanlar: paket.ayrilanlar
        });
      }
    }
    socket.on('faz:degisti', fazDegisti);

    return () => {
      socket.off('gece:sabahKisisel', kisiselGeldi);
      socket.off('faz:degisti', fazDegisti);
    };
  }, []);

  function devamEt() {
    if (devamGonderildi) return;
    setDevamGonderildi(true);
    socket.emit('sabah:devam', null, (cevap) => {
      if (!cevap?.ok) {
        setDevamGonderildi(false);
        if (cevap?.hata) alert(cevap.hata);
      }
    });
  }

  const geceTuru = benimSabah?.geceTuru || herkeseSabah?.geceTuru || 1;

  return (
    <div className="sabah-kapsayici">
      {/* Üst başlık — sabah */}
      <header className="sabah-header">
        <div className="sabah-gunes">☀️</div>
        <div>
          <h1 className="sabah-baslik">Sabah Geldi</h1>
          <p className="sabah-altbaslik">Gece {geceTuru} — köy uyanıyor</p>
        </div>
      </header>

      {/* Genel olaylar (herkese açık) */}
      {herkeseSabah?.herkeseSabah?.length > 0 && (
        <section className="sabah-bolum">
          <h2 className="sabah-bolum-baslik">Köyde Olanlar</h2>
          <ul className="sabah-genel-liste">
            {herkeseSabah.herkeseSabah.map((mesaj, i) => (
              <li key={i} className="sabah-genel-satir">
                <span className="sabah-bullet">•</span>
                {mesaj}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Köyden ayrılanlar — rolleri ifşa olur, not defteri herkese açılır */}
      {herkeseSabah?.ayrilanlar?.length > 0 && (
        <section className="sabah-bolum">
          <h2 className="sabah-bolum-baslik">Köyden Ayrılanlar</h2>
          {herkeseSabah.ayrilanlar.map(ayrilan => (
            <div key={ayrilan.oyuncuId} className="sabah-ayrilan-kart">
              <div className="sabah-ayrilan-baslik">
                <span className="sabah-ayrilan-isim">{ayrilan.isim}</span>
                {ayrilan.rol && (
                  <span
                    className="sabah-ayrilan-rol"
                    style={{ background: GRUP_RENGI[ayrilan.rol.grup] }}
                  >
                    {ayrilan.rol.sembol} {ayrilan.rol.ad}
                  </span>
                )}
              </div>
              {ayrilan.not && (
                <div className="sabah-ayrilan-not">
                  <p className="sabah-not-etiket">Not defterinden:</p>
                  <p className="sabah-not-metni">{ayrilan.not}</p>
                </div>
              )}
              {!ayrilan.not && (
                <p className="sabah-not-bos">Not defteri boş.</p>
              )}
            </div>
          ))}
        </section>
      )}

      {/* Kişisel sabah — sadece bana özel */}
      {benimSabah && (
        <section className="sabah-bolum sabah-bolum--kisisel">
          <h2 className="sabah-bolum-baslik">
            Senin Gecen
            {benimSabah.benimRolum && (
              <span
                className="sabah-rol-rozet"
                style={{ background: GRUP_RENGI[benimSabah.benimRolum.grup] }}
              >
                {benimSabah.benimRolum.ad}
              </span>
            )}
          </h2>
          {benimSabah.satirlar?.length > 0 ? (
            <ul className="sabah-kisisel-liste">
              {benimSabah.satirlar.map((satir, i) => (
                <li key={i} className="sabah-kisisel-satir">
                  <span className="sabah-bullet">›</span>
                  {satir}
                </li>
              ))}
            </ul>
          ) : (
            <p className="sabah-kisisel-bos">Bu gece sessiz geçti — sana özel bir bilgi yok.</p>
          )}
        </section>
      )}

      {/* Devam butonu — host bastığında tartışmaya (veya bitişe) geçilir */}
      <div className="sabah-devam-bolum">
        <p className="sabah-devam-not">
          Hazır olan herkesi bekleyince host devam edecek.
        </p>
        {hostMu ? (
          <button
            className="sabah-devam-btn"
            onClick={devamEt}
            disabled={devamGonderildi}
          >
            {devamGonderildi ? 'Geçiliyor…' : 'Tartışmaya Geç →'}
          </button>
        ) : (
          <p className="sabah-bekliyor">Host'un devam etmesi bekleniyor…</p>
        )}
        <button className="sabah-cikis-btn" onClick={onAyril}>
          Oyundan Çık
        </button>
      </div>
    </div>
  );
}
