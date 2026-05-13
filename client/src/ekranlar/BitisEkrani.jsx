// Queer Quest Quench — Faz 8: Bitiş
// Belge §11 — Kazanan grup, tüm rol ifşası, "Yeni Oyun" butonu

import { useEffect, useState } from 'react';
import { socket } from '../socket.js';
import './BitisEkrani.css';

const GRUP_AD = {
  ozgurlukcu: 'Özgürlükçüler',
  tarafsiz: 'Tarafsızlar',
  gelenekci: 'Gelenekçiler',
  beraberlik: 'Kimse'
};

const GRUP_RENGI = {
  ozgurlukcu: 'var(--ozgurlukcu)',
  tarafsiz: 'var(--tarafsiz)',
  gelenekci: 'var(--gelenekci)',
  beraberlik: 'var(--derin)'
};

const GRUP_SEMBOL = {
  ozgurlukcu: '🟢',
  tarafsiz: '🟡',
  gelenekci: '🔴'
};

// v1.3 — Bitiş ekranında renk gradyanı sırası: yeşil → sarı → kırmızı
const GRUP_SIRA = {
  ozgurlukcu: 0,
  tarafsiz: 1,
  gelenekci: 2
};

export default function BitisEkrani({ benimIsmim, oyuncuId, onAyril }) {
  const [bitis, setBitis] = useState(null);
  const [hostMu, setHostMu] = useState(false);
  const [yeniOyunGonderildi, setYeniOyunGonderildi] = useState(false);

  useEffect(() => {
    socket.emit('bitis:durumIste', null, (cevap) => {
      if (!cevap?.ok) return;
      setBitis(cevap);
      if (typeof cevap.hostMu === 'boolean') setHostMu(cevap.hostMu);
    });

    function fazDegisti(d) {
      if (d.faz === 'bitis') {
        setBitis({
          kazananGrup: d.kazananGrup,
          tumRoller: d.tumRoller,
          tarafsizKazananlar: d.tarafsizKazananlar,
          geceTuru: d.geceTuru
        });
      }
    }
    socket.on('faz:degisti', fazDegisti);
    return () => socket.off('faz:degisti', fazDegisti);
  }, []);

  function yeniOyun() {
    if (yeniOyunGonderildi) return;
    setYeniOyunGonderildi(true);
    socket.emit('oyun:yeniOyun', null, (cevap) => {
      if (!cevap?.ok) {
        setYeniOyunGonderildi(false);
        if (cevap?.hata) alert(cevap.hata);
      }
    });
  }

  if (!bitis) {
    return (
      <div className="bitis-yukleniyor">
        <p>Sonuçlar hazırlanıyor…</p>
      </div>
    );
  }

  const { kazananGrup, tumRoller = [], tarafsizKazananlar = [], geceTuru } = bitis;

  // v1.3 — Master §11: Yeşil (özg) üstte → Sarı (tarafsız) ortada → Kırmızı (gel) altta
  const siraliRoller = [...tumRoller].sort(
    (a, b) => (GRUP_SIRA[a.rol.grup] ?? 99) - (GRUP_SIRA[b.rol.grup] ?? 99)
  );

  // Madde 9: Kazanan grubuna göre arkaplan tonu
  const kazananRenk = GRUP_RENGI[kazananGrup] || 'var(--derin)';

  return (
    <div
      className={`bitis-kapsayici bitis-kapsayici--${kazananGrup}`}
      style={{ '--kazanan-renk': kazananRenk }}
    >
      {/* Kazanan başlığı */}
      <header
        className="bitis-baslik-kutu"
        style={{ background: kazananRenk }}
      >
        <p className="bitis-etiket">Oyun Bitti</p>
        <h1 className="bitis-baslik">
          {kazananGrup === 'beraberlik'
            ? 'Beraberlik'
            : `${GRUP_AD[kazananGrup]} Kazandı!`
          }
        </h1>
        <p className="bitis-altyazi">
          {geceTuru ? `${geceTuru}. gecenin sonunda` : ''}
        </p>
      </header>

      {/* Madde 11: Tarafsız bireysel kazananlar — vurgulu */}
      {tarafsizKazananlar.length > 0 && (
        <section className="bitis-bolum bitis-bolum--tarafsiz">
          <h2 className="bitis-bolum-baslik">⭐ Bireysel Kazananlar</h2>
          <ul className="bitis-tarafsiz-liste">
            {tarafsizKazananlar.map(t => (
              <li key={t.oyuncuId} className="bitis-tarafsiz-satir">
                <span className="bitis-tarafsiz-isim">{t.isim}</span>
                <span className="bitis-tarafsiz-rol">{t.rolAd}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Madde 10: Tek liste, gruplama başlığı yok, herkes aynı ton.
          v1.3: Yeşil → Sarı → Kırmızı sırasıyla. */}
      <section className="bitis-bolum">
        <h2 className="bitis-bolum-baslik">Tüm Roller</h2>
        <ul className="bitis-tum-roller">
          {siraliRoller.map(o => (
            <li key={o.oyuncuId} className="bitis-tum-satir">
              <span
                className="bitis-tum-renk-noktasi"
                style={{ background: GRUP_RENGI[o.rol.grup] }}
              />
              <span className="bitis-tum-isim">{o.isim}</span>
              <span
                className="bitis-tum-rol"
                style={{
                  background: GRUP_RENGI[o.rol.grup],
                  color: 'white'
                }}
              >
                {GRUP_SEMBOL[o.rol.grup]} {o.rol.ad}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Yeni oyun butonu */}
      <div className="bitis-aksiyon">
        {hostMu ? (
          <button
            className="bitis-yeni-btn"
            onClick={yeniOyun}
            disabled={yeniOyunGonderildi}
          >
            {yeniOyunGonderildi ? 'Sıfırlanıyor…' : '🎲 Yeni Oyun'}
          </button>
        ) : (
          <p className="bitis-bekliyor">Host'un yeni oyun başlatması bekleniyor…</p>
        )}
        <button className="bitis-cikis-btn" onClick={onAyril}>
          Oyundan Çık
        </button>
      </div>
    </div>
  );
}
