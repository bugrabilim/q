// Queer Quest Quench — Faz 1: Açılış Ekranı

import { useState } from 'react';
import { socket } from '../socket.js';
import Logo from '../Logo.jsx';
import './AcilisEkrani.css';

export default function AcilisEkrani({ onOdayaGir }) {
  const [isim, setIsim] = useState('');
  const [odaKodu, setOdaKodu] = useState('');
  const [hata, setHata] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const isimGecerli = isim.trim().length > 0;
  const koduGecerli = /^\d{5}$/.test(odaKodu.trim());

  function odaKur() {
    if (!isimGecerli || yukleniyor) return;
    setHata('');
    setYukleniyor(true);
    socket.emit('oda:kur', { isim: isim.trim() }, (cevap) => {
      setYukleniyor(false);
      if (cevap.ok) {
        onOdayaGir({ kod: cevap.kod, oyuncuId: cevap.oyuncuId, benimIsmim: isim.trim() });
      } else {
        setHata(cevap.hata || 'Oda kurulamadı');
      }
    });
  }

  function odayaKatil() {
    if (yukleniyor) return;
    if (!koduGecerli) return; // buton zaten pasif; ek olarak güvenlik
    // Kod doğru ama isim boşsa → net uyarı göster, isim alanına odaklan
    if (!isimGecerli) {
      setHata('Önce isim gir.');
      const isimEl = document.getElementById('isim-alan');
      if (isimEl) isimEl.focus();
      return;
    }
    setHata('');
    setYukleniyor(true);
    socket.emit('oda:katil', { kod: odaKodu.trim(), isim: isim.trim() }, (cevap) => {
      setYukleniyor(false);
      if (cevap.ok) {
        onOdayaGir({ kod: cevap.kod, oyuncuId: cevap.oyuncuId, benimIsmim: isim.trim() });
      } else {
        setHata(cevap.hata || 'Odaya katılınamadı');
      }
    });
  }

  // Enter davranışı:
  // - İsim alanında Enter → eğer oda kodu da girilmişse katıl, değilse oda kur
  // - Oda kodu alanında Enter → katıl
  function isimEnter(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    if (koduGecerli) odayaKatil();
    else odaKur();
  }

  function koduEnter(e) {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    odayaKatil();
  }

  return (
    <div className="acilis">
      <div className="acilis-icerik">
        <header className="acilis-baslik">
          <Logo />
          <p className="slogan">"Hepimiz bir şeyden kaçtık."</p>
        </header>

        {/* 1) ÜST — Tek isim alanı, her iki seçenek için ortak */}
        <section className="isim-bolumu">
          <div className="form-grup">
            <label className="etiket" htmlFor="isim-alan">Adın</label>
            <input
              id="isim-alan"
              type="text"
              value={isim}
              onChange={(e) => setIsim(e.target.value)}
              onKeyDown={isimEnter}
              placeholder="Köyde nasıl bilinmek istersin?"
              maxLength={20}
              className="alan"
              autoFocus
            />
            <p className="alan-ipucu">Hem oda kurmak hem katılmak için kullanılır.</p>
          </div>
        </section>

        {/* 2) ALT — İki ayrı seçenek kartı */}
        <div className="secenekler">
          {/* A. Oda Kur */}
          <section className="secenek-kart">
            <h2 className="secenek-baslik">Yeni Oda Kur</h2>
            <p className="secenek-aciklama">Sen kur, arkadaşlarını davet et.</p>
            <button
              className="btn btn-birincil"
              onClick={odaKur}
              disabled={!isimGecerli || yukleniyor}
            >
              Oda Kur
            </button>
          </section>

          <div className="ayirici">
            <span>veya</span>
          </div>

          {/* B. Odaya Katıl */}
          <section className="secenek-kart">
            <h2 className="secenek-baslik">Var Olan Odaya Katıl</h2>
            <p className="secenek-aciklama">Arkadaşından aldığın 5 haneli kodu gir.</p>
            <div className="form-grup">
              <label className="etiket" htmlFor="kod-alan">Oda Kodu</label>
              <input
                id="kod-alan"
                type="tel"
                value={odaKodu}
                onChange={(e) => setOdaKodu(e.target.value.replace(/\D/g, '').slice(0, 5))}
                onKeyDown={koduEnter}
                placeholder="5 haneli kod"
                maxLength={5}
                className="alan alan-kod"
                inputMode="numeric"
              />
            </div>
            <button
              className="btn btn-ikincil"
              onClick={odayaKatil}
              disabled={!koduGecerli || yukleniyor}
              title={!isimGecerli && koduGecerli ? 'Önce isim gir' : undefined}
            >
              Katıl
            </button>
          </section>
        </div>

        {hata && <p className="hata">{hata}</p>}

        {/* v1.8 — Wiki / Kurallar (oyun-içi /wiki rotası) */}
        <footer className="acilis-footer">
          <a href="/wiki" className="acilis-wiki-link">
            📚 Kurallar &amp; Roller (Wiki)
          </a>
        </footer>
      </div>
    </div>
  );
}
