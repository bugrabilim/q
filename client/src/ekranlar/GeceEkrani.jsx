// Queer Quest Quench — Faz 5: Gece Aksiyonu (sade hali)
// Belge Bölüm 9 (Gece Aksiyonları), Bölüm 11 (Faz 5)
// Aşama C sonrası: rol kartı, sohbet ve oyuncu listesi OyunDuzeni'nde sürekli görünür.
// Bu ekran sadece gece aksiyonu (hedef seçimi) + sayaç + not defteri içerir.

import { useEffect, useState, useRef, useCallback } from 'react';
import { socket } from '../socket.js';
import './GeceEkrani.css';

// Koca Karı dışındaki roller tek hedef seçer (Koca Karı iki hedef seçer)
const CIFT_HEDEF_ROLLER = ['koca_kari'];

// Kendine aksiyon yapamayan roller (belge Bölüm 13)
const KENDINE_YAPILAMAZ = ['gay', 'drag_queen', 'homofobik'];

export default function GeceEkrani({ benimIsmim, oyuncuId, benimRolum }) {
  // ─ Zamanlayıcı ─
  const [kalanSn, setKalanSn] = useState(30);
  const [sonZaman, setSonZaman] = useState(null);

  // ─ Aksiyon durumu (Madde 1: süre sonuna kadar hedef değişebilir) ─
  // secili1/secili2 = sunucuya gönderilmiş aktif hedef. null ise pas.
  const [secili1, setSecili1] = useState(null);
  const [secili2, setSecili2] = useState(null);
  const [aksiyonSayisi, setAksiyonSayisi] = useState(0);
  const [aktifSayisi, setAktifSayisi] = useState(0);

  // ─ Oyuncu listesi (gece aksiyonu için seçim listesi) ─
  const [oyuncular, setOyuncular] = useState([]);

  // ─ Not defteri ─
  const [not, setNot] = useState('');
  const notTimerRef = useRef(null);

  // ─ Gece turu / özel görev ─
  const [geceTuru, setGeceTuru] = useState(1);
  const [ozelGorev, setOzelGorev] = useState(null);

  const ciftHedef = benimRolum && CIFT_HEDEF_ROLLER.includes(benimRolum.id);
  const kendineYapilmaz = benimRolum && KENDINE_YAPILAMAZ.includes(benimRolum.id);

  // ─── Mount: sunucudan güncel durum iste ────────────────────
  useEffect(() => {
    socket.emit('gece:durumIste', null, (cevap) => {
      if (!cevap?.ok) return;
      if (cevap.geceTuru) setGeceTuru(cevap.geceTuru);
      if (cevap.sonZaman) setSonZaman(cevap.sonZaman);
      if (typeof cevap.aksiyonSayisi === 'number') setAksiyonSayisi(cevap.aksiyonSayisi);
      if (typeof cevap.aktifSayisi === 'number') setAktifSayisi(cevap.aktifSayisi);
      if (cevap.oyuncular) setOyuncular(cevap.oyuncular);
      if (cevap.benimNotum) setNot(cevap.benimNotum);
    });
  }, []);

  // ─── Socket dinleyiciler ───────────────────────────────────
  useEffect(() => {
    function aksiyonSayisiGeldi({ sayi, toplam }) {
      setAksiyonSayisi(sayi);
      if (toplam) setAktifSayisi(toplam);
    }
    function ozelGorevGeldi({ mesaj }) {
      setOzelGorev(mesaj);
    }
    socket.on('gece:aksiyonSayisi', aksiyonSayisiGeldi);
    socket.on('gece:ozelGorev', ozelGorevGeldi);
    return () => {
      socket.off('gece:aksiyonSayisi', aksiyonSayisiGeldi);
      socket.off('gece:ozelGorev', ozelGorevGeldi);
    };
  }, []);

  // ─── Sayaç ────────────────────────────────────────────────
  useEffect(() => {
    if (!sonZaman) return;
    function hesapla() {
      const kalan = Math.max(0, Math.ceil((sonZaman - Date.now()) / 1000));
      setKalanSn(kalan);
    }
    hesapla();
    const interval = setInterval(hesapla, 500);
    return () => clearInterval(interval);
  }, [sonZaman]);

  // ─── Hedef seç / direkt gönder (Madde 1+7) ────────────────
  // Tek hedef: tıkla = anında gönder. Aynı isme tıklarsan iptal (pas).
  // Çift hedef (Koca Karı): 1. tıkla seç, 2. tıkla gönder.
  // Süre sonuna kadar her tıklamada hedef değişir.
  function oyuncuTikla(id) {
    if (id === oyuncuId && kendineYapilmaz) return;

    if (ciftHedef) {
      // Halihazırda iki seçim de gönderilmiş → yeni 1. seçim olarak başla
      if (secili1 && secili2) {
        if (secili1 === id || secili2 === id) {
          // Aynı isimlerden birine tıkla → iptal
          aksiyonuGonder(null, null);
        } else {
          aksiyonuGonder(id, null);
        }
        return;
      }
      // Sadece 1. seçim var
      if (secili1) {
        if (secili1 === id) {
          // Aynı isime → iptal
          aksiyonuGonder(null, null);
        } else {
          // 2. seçim — gönder
          aksiyonuGonder(secili1, id);
        }
        return;
      }
      // Hiç seçim yok → 1. seçimi yerel olarak işaretle (henüz sunucuya gitmiyor)
      setSecili1(id);
    } else {
      // Tek hedef → aynı isme tekrar = iptal, farklıysa güncelle
      if (secili1 === id) {
        aksiyonuGonder(null, null);
      } else {
        aksiyonuGonder(id, null);
      }
    }
  }

  function aksiyonuGonder(hedef1, hedef2) {
    socket.emit('gece:aksiyon', { hedef1, hedef2 }, (cevap) => {
      if (cevap?.ok) {
        setSecili1(hedef1);
        setSecili2(hedef2);
      }
    });
  }

  // ─── Not defteri (debounce 1sn) ───────────────────────────
  const notGuncelle = useCallback((deger) => {
    setNot(deger);
    clearTimeout(notTimerRef.current);
    notTimerRef.current = setTimeout(() => {
      socket.emit('gece:notGuncelle', { metin: deger });
    }, 1000);
  }, []);

  function hedefMetni() {
    if (ciftHedef) {
      if (secili1 && secili2) {
        const a = oyuncular.find(p => p.id === secili1)?.isim || '?';
        const b = oyuncular.find(p => p.id === secili2)?.isim || '?';
        return `Seçimin: ${a} ve ${b}. Değiştirmek istersen tıkla.`;
      }
      if (secili1) {
        const a = oyuncular.find(p => p.id === secili1)?.isim || '?';
        return `1. seçim: ${a}. 2. kişiye tıkla → gönder.`;
      }
      return 'İki kişi seçilecek — 1. tıkla seçer, 2. tıkla gönderir';
    }
    if (secili1) {
      const isim = oyuncular.find(p => p.id === secili1)?.isim || '?';
      return `Seçimin: ${isim}. Başkasına tıkla → değiştir, aynısına → iptal.`;
    }
    return 'Bir isme tıkla — anında gönderilir';
  }

  // ─── Render ───────────────────────────────────────────────
  const sure = 30;
  const ilerleme = sonZaman ? Math.max(0, Math.min(100, (kalanSn / sure) * 100)) : 100;

  return (
    <div className="gece-kapsayici">
      {/* Üst başlık + sayaç */}
      <header className="gece-header">
        <div className="gece-header-sol">
          <span className="gece-tur">Gece {geceTuru}</span>
          <span className="gece-aksiyonsayisi">
            {aksiyonSayisi}/{aktifSayisi} aksiyon gönderildi
          </span>
        </div>
        <div className="gece-sayac-kutu">
          <div className={`gece-sayac ${kalanSn <= 5 ? 'gece-sayac--kritik' : ''}`}>
            {kalanSn}
          </div>
          <div className="gece-ilerleme-arka">
            <div className="gece-ilerleme-ic" style={{ width: `${ilerleme}%` }} />
          </div>
        </div>
      </header>

      {/* Aksiyon listesi */}
      <section className="gece-liste-bolum">
        <p className="gece-liste-baslik">
          {ciftHedef
            ? 'Dedikodu için iki kişi seç — 2. tıkla gönderir'
            : 'Aksiyon yapacağın kişiye tıkla — anında gönderilir'
          }
        </p>
        <p className="gece-otomatik-pas-not">
          Süre sonuna kadar değiştirebilirsin. Aynı isme tekrar tıkla → iptal.
        </p>

        <ul className="gece-oyuncu-liste">
          {oyuncular
            .filter(p => p.koydeMi !== false)
            .filter(p => p.id !== oyuncuId || !kendineYapilmaz)
            .map(p => {
              const benimim = p.id === oyuncuId;
              const secildi1 = secili1 === p.id;
              const secildi2 = secili2 === p.id;
              const yasak = benimim && kendineYapilmaz;

              let sinif = 'gece-oyuncu-satir';
              if (secildi1) sinif += ' gece-oyuncu-satir--secili1';
              if (secildi2) sinif += ' gece-oyuncu-satir--secili2';
              if (yasak) sinif += ' gece-oyuncu-satir--yasak';
              if (!p.baglantiVar) sinif += ' gece-oyuncu-satir--cevrimdisi';

              return (
                <li
                  key={p.id}
                  className={sinif}
                  onClick={() => !yasak && oyuncuTikla(p.id)}
                  title={yasak ? 'Kendine aksiyon yapamazsın' : ''}
                >
                  <span className="gece-oyuncu-isim">
                    {p.isim}
                    {benimim && <span className="gece-sen-etiketi"> (sen)</span>}
                    {!p.baglantiVar && <span className="gece-cevrimdisi-etiketi"> çevrimdışı</span>}
                  </span>
                  {(secildi1 || secildi2) && (
                    <span className="gece-secim-etiketi">
                      {secildi1 && !ciftHedef ? '✓' : secildi1 ? '1.' : '2.'}
                    </span>
                  )}
                </li>
              );
            })}
        </ul>

        <p className="gece-hedef-durum">{hedefMetni()}</p>

        {ozelGorev && (
          <div className="gece-ozel-gorev-bant">⭐ {ozelGorev}</div>
        )}
      </section>

      {/* Not defteri */}
      <section className="gece-not-bolum">
        <label className="gece-not-etiket">📓 Not defteri</label>
        <textarea
          className="gece-not-alan"
          value={not}
          onChange={e => notGuncelle(e.target.value)}
          placeholder="Gece notlarını buraya yaz…"
          rows={4}
        />
      </section>
    </div>
  );
}
