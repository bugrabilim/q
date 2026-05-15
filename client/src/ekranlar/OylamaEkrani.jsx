// Queer Quest Quench — Faz 7: Oylama
// Belge §11 — 1. Oylama (15sn) → Savunma (20sn) → 2. Oylama (10sn) → Sonuç
// Necmi manipülasyonu, Azra oy iptali, DQ oy katı sunucuda uygulanır

import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket.js';
import { efektCal } from '../ses/SesYoneticisi.js';
import './OylamaEkrani.css';

export default function OylamaEkrani({ benimIsmim, oyuncuId, onFazDegisti, benimRolumId }) {
  const [faz, setFaz] = useState(null); // 'oylama_1' | 'savunma' | 'oylama_2' | 'oylama_tartisma' | 'oylama_sonuc'
  const [sonZaman, setSonZaman] = useState(null);
  const [kalanSn, setKalanSn] = useState(0);

  // 1. Oylama
  const [koydekiler, setKoydekiler] = useState([]);
  const [benimOyum1, setBenimOyum1] = useState(null);    // hedefId
  const [oylarAnlik, setOylarAnlik] = useState({ sayimlar: {}, kullananlar: [] });
  const [sonuc1, setSonuc1] = useState(null);             // { oyAciklamasi, hedef, hedefIsim, oyCount }

  // Savunma
  const [savunulanId, setSavunulanId] = useState(null);
  const [savunulanIsim, setSavunulanIsim] = useState('');
  const [hazirMiyim, setHazirMiyim] = useState(false);
  const [hazirDurumu, setHazirDurumu] = useState({ hazir: 0, toplam: 0 });

  // 2. Oylama
  const [katilabilirMiyim, setKatilabilirMiyim] = useState(false);
  const [benimOyum2, setBenimOyum2] = useState(null);    // 'evet' | 'hayir'
  const [oylar2Durum, setOylar2Durum] = useState({ evet: 0, hayir: 0, kullananlar: [] });
  const [sonuc2, setSonuc2] = useState(null);

  // Oylama Sonucu (yeni — Madde 2)
  const [oylamaSonucu, setOylamaSonucu] = useState(null);

  // Mount: sunucudan güncel durumu al
  useEffect(() => {
    socket.emit('oylama:durumIste', null, (cevap) => {
      if (!cevap?.ok) return;
      setFaz(cevap.faz);
      if (cevap.sonZaman) setSonZaman(cevap.sonZaman);
      if (cevap.koydekiler) setKoydekiler(cevap.koydekiler);
      if (cevap.oylarAnlik) setOylarAnlik(cevap.oylarAnlik);
      if (cevap.benimOyum1) setBenimOyum1(cevap.benimOyum1);
      if (cevap.savunulanId) setSavunulanId(cevap.savunulanId);
      if (cevap.savunulanIsim) setSavunulanIsim(cevap.savunulanIsim);
      if (typeof cevap.katilabilirMiyim === 'boolean') setKatilabilirMiyim(cevap.katilabilirMiyim);
      if (cevap.benimOyum2) setBenimOyum2(cevap.benimOyum2);
      if (typeof cevap.hazirMiyim === 'boolean') setHazirMiyim(cevap.hazirMiyim);
    });

    // Mount'ta oylama_sonuc fazındaysak ayrı durum iste
    socket.emit('oylama_sonuc:durumIste', null, (cevap) => {
      if (!cevap?.ok) return;
      setFaz('oylama_sonuc');
      if (cevap.sonZaman) setSonZaman(cevap.sonZaman);
      if (cevap.sonuc) setOylamaSonucu(cevap.sonuc);
      if (typeof cevap.hazirMiyim === 'boolean') setHazirMiyim(cevap.hazirMiyim);
      if (typeof cevap.hazirSayisi === 'number') {
        setHazirDurumu({ hazir: cevap.hazirSayisi, toplam: cevap.hazirToplam || 0 });
      }
    });
  }, []);

  // Socket eventleri
  useEffect(() => {
    function fazDegisti(d) {
      const oylamaFazlari = ['oylama_1', 'savunma', 'oylama_2', 'oylama_tartisma', 'oylama_sonuc'];
      if (!oylamaFazlari.includes(d.faz)) {
        // Gece, bitiş vs. — üst bileşen halleder
        onFazDegisti?.(d);
        return;
      }
      setFaz(d.faz);
      if (d.sonZaman) setSonZaman(d.sonZaman);

      if (d.faz === 'oylama_1') {
        if (d.koydekiler) setKoydekiler(d.koydekiler);
        setBenimOyum1(null);
        setOylarAnlik({ sayimlar: {}, kullananlar: [] });
        setSonuc1(null);
        setSonuc2(null);
        setHazirMiyim(false);
      }
      if (d.faz === 'savunma') {
        setSavunulanId(d.savunulanId);
        setSavunulanIsim(d.savunulanIsim || '');
        setHazirMiyim(false);
        setHazirDurumu({ hazir: 0, toplam: 0 });
      }
      if (d.faz === 'oylama_2') {
        setSavunulanId(d.savunulanId);
        setSavunulanIsim(d.savunulanIsim || '');
        setBenimOyum2(null);
        setOylar2Durum({ evet: 0, hayir: 0, kullananlar: [] });
        setKatilabilirMiyim(
          (d.katilabilecekler || []).some(p => p.id === oyuncuId)
        );
      }
      if (d.faz === 'oylama_tartisma') {
        setHazirMiyim(false);
        setHazirDurumu({ hazir: 0, toplam: 0 });
      }
      if (d.faz === 'oylama_sonuc') {
        if (d.sonuc) setOylamaSonucu(d.sonuc);
        setHazirMiyim(false);
        setHazirDurumu({ hazir: 0, toplam: 0 });
      }
    }

    function oylamaGuncellendi(d) {
      setOylarAnlik(d);
    }

    function oylama1Sonuc(d) {
      setSonuc1(d);
    }

    function oylama2Guncellendi(d) {
      setOylar2Durum(d);
    }

    function oylama2Sonuc(d) {
      setSonuc2(d);
    }

    function savunmaHazir(d) {
      // Yeni format: { savunulanHazir, savunulanId }
      // Yalnızca savunulan oyuncu hazır olabilir; biz savunulansak hazırMiyim'i güncelle
      if (d?.savunulanId && d.savunulanId === oyuncuId) {
        setHazirMiyim(!!d.savunulanHazir);
      }
    }

    function tartismaHazirDurumu(d) {
      setHazirDurumu(d);
    }

    function oylamaSonucHazirDurumu(d) {
      setHazirDurumu(d);
    }

    socket.on('faz:degisti', fazDegisti);
    socket.on('oylama:guncellendi', oylamaGuncellendi);
    socket.on('oylama:1Sonuc', oylama1Sonuc);
    socket.on('oylama2:guncellendi', oylama2Guncellendi);
    socket.on('oylama:2Sonuc', oylama2Sonuc);
    socket.on('savunma:hazirDurumu', savunmaHazir);
    socket.on('tartisma:hazirDurumu', tartismaHazirDurumu);
    socket.on('oylama_sonuc:hazirDurumu', oylamaSonucHazirDurumu);

    return () => {
      socket.off('faz:degisti', fazDegisti);
      socket.off('oylama:guncellendi', oylamaGuncellendi);
      socket.off('oylama:1Sonuc', oylama1Sonuc);
      socket.off('oylama2:guncellendi', oylama2Guncellendi);
      socket.off('oylama:2Sonuc', oylama2Sonuc);
      socket.off('savunma:hazirDurumu', savunmaHazir);
      socket.off('tartisma:hazirDurumu', tartismaHazirDurumu);
      socket.off('oylama_sonuc:hazirDurumu', oylamaSonucHazirDurumu);
    };
  }, [oyuncuId, onFazDegisti]);

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

  // Oy ver (1. oylama)
  function oyVer(hedefId) {
    efektCal('oylama');
    if (benimOyum1 === hedefId) {
      // Aynı kişiye basarsan geri çek
      socket.emit('oylama1:oyGeriCek', null, (cevap) => {
        if (cevap?.ok) setBenimOyum1(null);
      });
    } else {
      socket.emit('oylama1:oyVer', { hedefId }, (cevap) => {
        if (cevap?.ok) setBenimOyum1(hedefId);
      });
    }
  }

  // 2. oylama
  function ikinciOy(karar) {
    if (benimOyum2 === karar) return; // zaten verdim
    efektCal('oylama');
    socket.emit('oylama2:oyVer', { karar }, (cevap) => {
      if (cevap?.ok) setBenimOyum2(karar);
    });
  }

  // Savunma: hazır
  function savunmaHazirToggle() {
    if (hazirMiyim) return; // tek yönlü
    efektCal('tikla');
    socket.emit('savunma:hazir', null, (cevap) => {
      if (cevap?.ok) setHazirMiyim(true);
    });
  }

  // Tekrar tartışma: hazır
  function tartismaHazirToggle() {
    efektCal('tikla');
    if (hazirMiyim) {
      socket.emit('oylama_tartisma:hazirGeriCek', null, (cevap) => {
        if (cevap?.ok) setHazirMiyim(false);
      });
    } else {
      socket.emit('oylama_tartisma:hazir', null, (cevap) => {
        if (cevap?.ok) setHazirMiyim(true);
      });
    }
  }

  // Oylama Sonuç (Madde 2): hazır
  function sonucHazirToggle() {
    efektCal('tikla');
    if (hazirMiyim) {
      socket.emit('oylama_sonuc:hazirGeriCek', null, (cevap) => {
        if (cevap?.ok) setHazirMiyim(false);
      });
    } else {
      socket.emit('oylama_sonuc:hazir', null, (cevap) => {
        if (cevap?.ok) setHazirMiyim(true);
      });
    }
  }

  // ─── Render ─────────────────────────────────────────────────

  if (!faz) return <div className="oylama-yukle">Yükleniyor…</div>;

  return (
    <div className="oylama">
      {/* ─ 1. Oylama ─ */}
      {faz === 'oylama_1' && (
        <BirInciOylama
          kalanSn={kalanSn}
          koydekiler={koydekiler}
          benimId={oyuncuId}
          benimOyum={benimOyum1}
          oylarAnlik={oylarAnlik}
          sonuc={sonuc1}
          onOyVer={oyVer}
        />
      )}

      {/* ─ Savunma ─ */}
      {faz === 'savunma' && (
        <Savunma
          kalanSn={kalanSn}
          savunulanId={savunulanId}
          savunulanIsim={savunulanIsim}
          benimId={oyuncuId}
          hazirMiyim={hazirMiyim}
          sonuc1={sonuc1}
          onHazir={savunmaHazirToggle}
        />
      )}

      {/* ─ 2. Oylama ─ */}
      {faz === 'oylama_2' && (
        <IkinciOylama
          kalanSn={kalanSn}
          savunulanIsim={savunulanIsim}
          katilabilirMiyim={katilabilirMiyim}
          benimOyum={benimOyum2}
          oylar2Durum={oylar2Durum}
          sonuc={sonuc2}
          onOy={ikinciOy}
        />
      )}

      {/* ─ Tekrar Tartışma ─ */}
      {faz === 'oylama_tartisma' && (
        <TekrarTartisma
          kalanSn={kalanSn}
          hazirMiyim={hazirMiyim}
          hazirDurumu={hazirDurumu}
          onHazir={tartismaHazirToggle}
        />
      )}

      {/* ─ Oylama Sonucu (yeni — Madde 2) ─ */}
      {faz === 'oylama_sonuc' && (
        <OylamaSonuc
          kalanSn={kalanSn}
          sonuc={oylamaSonucu}
          hazirMiyim={hazirMiyim}
          hazirDurumu={hazirDurumu}
          onHazir={sonucHazirToggle}
        />
      )}
    </div>
  );
}
function BirInciOylama({ kalanSn, koydekiler, benimId, benimOyum, oylarAnlik, sonuc, onOyVer }) {
  const { sayimlar, kullananlar } = oylarAnlik;

  return (
    <div className="oylama-bolum">
      <header className="oylama-bas">
        <div className="oylama-bas-sol">
          <p className="oylama-faz">Oylama ⚖️</p>
          <p className="oylama-altfaz">Kimi köyden göndermek istiyorsunuz?</p>
        </div>
        <SayacPil kalanSn={kalanSn} />
      </header>

      <div className="oylama-bilgi-serit">
        <span>{kullananlar.length} / {koydekiler.length} oy kullandı</span>
        {benimOyum && (
          <span className="oylama-benim-oy-badge">
            ✓ Oyunu verdin — tekrar basarak geri çekebilirsin
          </span>
        )}
      </div>

      <div className="oylama-liste">
        {koydekiler.map(p => {
          const benim = p.id === benimId;
          const oyAldim = sayimlar[p.id] || 0;
          const seciliMi = benimOyum === p.id;
          return (
            <button
              key={p.id}
              className={`oylama-kart ${seciliMi ? 'oylama-kart-secili' : ''} ${benim ? 'oylama-kart-ben' : ''}`}
              onClick={() => !benim && onOyVer(p.id)}
              disabled={benim}
              title={benim ? 'Kendine oy veremezsin' : ''}
            >
              <div className="oylama-kart-isim">
                {p.isim}
                {benim && <span className="oylama-ben-etiketi">(sen)</span>}
              </div>
              <div className="oylama-kart-sag">
                {oyAldim > 0 && (
                  <span className="oylama-oy-sayaci">{oyAldim}</span>
                )}
                {seciliMi && <span className="oylama-secim-isareti">✓</span>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Sonuç geldi mi (süre dolmuş ama bileşen hâlâ gösteriliyorsa kısa süre) */}
      {sonuc && <OylamaSonucBant sonuc={sonuc} />}
    </div>
  );
}

// ─── Savunma Bileşeni ────────────────────────────────────────
// Yalnızca savunulan oyuncu "Hazırım" butonuna basabilir
function Savunma({ kalanSn, savunulanId, savunulanIsim, benimId, hazirMiyim, sonuc1, onHazir }) {
  const benSavunuluyorum = savunulanId === benimId;

  return (
    <div className="oylama-bolum">
      <header className="oylama-bas">
        <div className="oylama-bas-sol">
          <p className="oylama-faz">Son Savunma 🎤</p>
          <p className="oylama-altfaz">
            {benSavunuluyorum
              ? 'Sen en çok oyu aldın — kendini savun!'
              : `${savunulanIsim} kendini savunuyor.`}
          </p>
        </div>
        <SayacPil kalanSn={kalanSn} renk="turuncu" />
      </header>

      {/* 1. oylama özeti */}
      {sonuc1?.oyAciklamasi && (
        <div className="oylama-aciklama-kutu">
          <p className="oylama-aciklama-baslik">1. Oylama Sonuçları</p>
          <div className="oylama-aciklama-liste">
            {sonuc1.oyAciklamasi.map((o, i) => (
              <div key={i} className="oylama-aciklama-satir">
                <span className="oylama-aciklama-isim">{o.isim}</span>
                <span className="oylama-aciklama-ok">→</span>
                <span className="oylama-aciklama-hedef">{o.hedefIsim}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="oylama-savunma-kutu">
        {benSavunuluyorum ? (
          <p className="oylama-savunma-mesaj oylama-savunma-ben">
            💬 Sohbete kendini savunabilirsin. Hazır olduğunda butona basarsan 2. oylamaya erken geçilir.
          </p>
        ) : (
          <p className="oylama-savunma-mesaj">
            💬 {savunulanIsim} kendini savunuyor. Süre dolunca veya o "Hazırım" diyince 2. oylama başlar.
          </p>
        )}
      </div>

      {/* Hazır butonu yalnızca savunulan oyuncuda görünür */}
      {benSavunuluyorum && (
        <div className="oylama-hazir-banner">
          <div className="oylama-hazir-metin">
            <p className="oylama-hazir-baslik">Savunmanı bitirdiysen hazır ol</p>
            <p className="oylama-hazir-altyazi">2. oylamaya erken geçilir</p>
          </div>
          <button
            className={`oylama-hazir-btn ${hazirMiyim ? 'oylama-hazir-btn-aktif' : ''}`}
            onClick={onHazir}
            disabled={hazirMiyim}
          >
            {hazirMiyim ? 'Hazır ✓' : 'Hazırım'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── 2. Oylama Bileşeni ──────────────────────────────────────
function IkinciOylama({ kalanSn, savunulanIsim, katilabilirMiyim, benimOyum, oylar2Durum, sonuc, onOy }) {
  const { evet, hayir, kullananlar } = oylar2Durum;
  const toplam = evet + hayir;

  return (
    <div className="oylama-bolum">
      <header className="oylama-bas">
        <div className="oylama-bas-sol">
          <p className="oylama-faz">2. Oylama ⚖️</p>
          <p className="oylama-altfaz">
            {savunulanIsim} köyden ayrılsın mı?
          </p>
        </div>
        <SayacPil kalanSn={kalanSn} />
      </header>

      <div className="oylama-bilgi-serit">
        {katilabilirMiyim
          ? <span>Oy kullanabilirsin</span>
          : <span className="oylama-katilim-yok">1. turda oy kullanmadın — bu turda oy kullanamazsın.</span>
        }
      </div>

      {katilabilirMiyim && (
        <div className="oylama-iki-btn-grup">
          <button
            className={`oylama-iki-btn oylama-iki-btn-evet ${benimOyum === 'evet' ? 'oylama-iki-btn-secili' : ''}`}
            onClick={() => onOy('evet')}
          >
            ✓ Gitsin
          </button>
          <button
            className={`oylama-iki-btn oylama-iki-btn-hayir ${benimOyum === 'hayir' ? 'oylama-iki-btn-secili' : ''}`}
            onClick={() => onOy('hayir')}
          >
            ✗ Kalsın
          </button>
        </div>
      )}

      <div className="oylama-sayac-cubuklari">
        <div className="oylama-cubuk-satir">
          <span className="oylama-cubuk-etiket">Gitsin</span>
          <div className="oylama-cubuk-arka">
            <div
              className="oylama-cubuk-dolu oylama-cubuk-evet"
              style={{ width: toplam > 0 ? `${(evet / toplam) * 100}%` : '0%' }}
            />
          </div>
          <span className="oylama-cubuk-sayi">{evet}</span>
        </div>
        <div className="oylama-cubuk-satir">
          <span className="oylama-cubuk-etiket">Kalsın</span>
          <div className="oylama-cubuk-arka">
            <div
              className="oylama-cubuk-dolu oylama-cubuk-hayir"
              style={{ width: toplam > 0 ? `${(hayir / toplam) * 100}%` : '0%' }}
            />
          </div>
          <span className="oylama-cubuk-sayi">{hayir}</span>
        </div>
        <p className="oylama-cubuk-alt">
          {toplam} oy kullanıldı · %51 çoğunluk gerekli
        </p>
      </div>

      {sonuc && <OylamaSonucBant2 sonuc={sonuc} />}
    </div>
  );
}

// ─── Tekrar Tartışma Bileşeni (Aşama C sade hali — sohbet sağda) ───
function TekrarTartisma({ kalanSn, hazirMiyim, hazirDurumu, onHazir }) {
  return (
    <div className="oylama-bolum oylama-tartisma-mod">
      <header className="oylama-bas">
        <div className="oylama-bas-sol">
          <p className="oylama-faz">Ek Tartışma 🗣️</p>
          <p className="oylama-altfaz">Kimse gitmedi — tekrar konuşun</p>
        </div>
        <SayacPil kalanSn={kalanSn} renk="turuncu" />
      </header>

      <div className="oylama-hazir-banner">
        <div className="oylama-hazir-metin">
          <p className="oylama-hazir-baslik">Hazırsan oylamaya geç</p>
          {hazirDurumu.toplam > 0 && (
            <p className="oylama-hazir-altyazi">
              {hazirDurumu.hazir} / {hazirDurumu.toplam} hazır
            </p>
          )}
        </div>
        <button
          className={`oylama-hazir-btn ${hazirMiyim ? 'oylama-hazir-btn-aktif' : ''}`}
          onClick={onHazir}
        >
          {hazirMiyim ? 'Hazır ✓' : 'Hazırım'}
        </button>
      </div>

      <div className="oylama-not-bandi">
        💬 Sohbet sağda — herkes konuşabilir.
      </div>
    </div>
  );
}

// ─── Oylama Sonucu Bileşeni (Madde 2 — 20sn not defteri okuma) ───
const GRUP_RENGI_SONUC = {
  ozgurlukcu: 'var(--ozgurlukcu)',
  tarafsiz: 'var(--tarafsiz)',
  gelenekci: 'var(--gelenekci)'
};
const GRUP_SEMBOL_SONUC = {
  ozgurlukcu: '🟢',
  tarafsiz: '🟡',
  gelenekci: '🔴'
};

function OylamaSonuc({ kalanSn, sonuc, hazirMiyim, hazirDurumu, onHazir }) {
  if (!sonuc) {
    return (
      <div className="oylama-bolum">
        <p style={{ textAlign: 'center', padding: 24, opacity: 0.6 }}>Sonuçlar yükleniyor…</p>
      </div>
    );
  }

  const { ayrilanIsim, rol, notDefteri } = sonuc;

  return (
    <div className="oylama-bolum">
      <header className="oylama-bas">
        <div className="oylama-bas-sol">
          <p className="oylama-faz">Sonuç 📜</p>
          <p className="oylama-altfaz">Köyden ayrılan + not defteri — okurken hazırı bekliyoruz</p>
        </div>
        <SayacPil kalanSn={kalanSn} renk="turuncu" />
      </header>

      {/* Ayrılan kartı */}
      <div className="oylama-sonuc-ayrilan-kart">
        <div className="oylama-sonuc-ayrilan-bas">
          <span className="oylama-sonuc-ayrilan-isim">🚪 {ayrilanIsim}</span>
          {rol && (
            <span
              className="oylama-sonuc-ayrilan-rol"
              style={{ background: GRUP_RENGI_SONUC[rol.grup] }}
            >
              {GRUP_SEMBOL_SONUC[rol.grup]} {rol.ad}
            </span>
          )}
        </div>
        <p className="oylama-sonuc-ayrilan-aciklama">Köyden ayrıldı.</p>
      </div>

      {/* Not defteri */}
      <div className="oylama-sonuc-not-kart">
        <p className="oylama-sonuc-not-baslik">📓 Not defterinden:</p>
        {notDefteri && notDefteri.trim() ? (
          <p className="oylama-sonuc-not-metni">{notDefteri}</p>
        ) : (
          <p className="oylama-sonuc-not-bos">Not defteri boş.</p>
        )}
      </div>

      {/* Hazır banner */}
      <div className="oylama-hazir-banner">
        <div className="oylama-hazir-metin">
          <p className="oylama-hazir-baslik">Okuduysan hazır ol</p>
          {hazirDurumu.toplam > 0 && (
            <p className="oylama-hazir-altyazi">
              {hazirDurumu.hazir} / {hazirDurumu.toplam} hazır — geceye erken geçilir
            </p>
          )}
        </div>
        <button
          className={`oylama-hazir-btn ${hazirMiyim ? 'oylama-hazir-btn-aktif' : ''}`}
          onClick={onHazir}
        >
          {hazirMiyim ? 'Hazır ✓' : 'Hazırım'}
        </button>
      </div>
    </div>
  );
}

// ─── Küçük Yardımcı Bileşenler ───────────────────────────────

function SayacPil({ kalanSn, renk = 'yesil' }) {
  return (
    <div className={`oylama-sayac oylama-sayac-${renk}`}>
      <span className="oylama-sayac-degeri">{kalanSn}</span>
      <span className="oylama-sayac-birim">sn</span>
    </div>
  );
}

function OylamaSonucBant({ sonuc }) {
  if (!sonuc) return null;
  return (
    <div className="oylama-sonuc-bant">
      <p>{sonuc.mesaj}</p>
    </div>
  );
}

function OylamaSonucBant2({ sonuc }) {
  if (!sonuc) return null;
  return (
    <div className={`oylama-sonuc-bant ${sonuc.gidiyor ? 'oylama-sonuc-gidiyor' : 'oylama-sonuc-kaliyor'}`}>
      <p className="oylama-sonuc-baslik">
        {sonuc.gidiyor
          ? `🚪 ${sonuc.savunulanIsim} köyden ayrılıyor.`
          : `🤝 ${sonuc.savunulanIsim} köyde kalıyor.`}
      </p>
      <div className="oylama-aciklama-liste">
        {sonuc.oyAciklamasi2?.map((o, i) => (
          <div key={i} className="oylama-aciklama-satir">
            <span className="oylama-aciklama-isim">{o.isim}</span>
            <span className="oylama-aciklama-ok">→</span>
            <span className={`oylama-karar ${o.karar === 'evet' ? 'oylama-karar-evet' : 'oylama-karar-hayir'}`}>
              {o.karar === 'evet' ? 'Gitsin' : 'Kalsın'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

