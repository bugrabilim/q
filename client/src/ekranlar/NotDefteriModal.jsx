// Queer Quest Quench — Not Defteri Modal (v1.3)
// Master §10: Her fazdan açılabilir, ayrılan oyuncuların notları tekrar görüntülenebilir.

import { useEffect, useRef, useState } from 'react';
import { socket } from '../socket.js';
import './NotDefteriModal.css';

const GRUP_RENGI = {
  ozgurlukcu: 'var(--ozgurlukcu)',
  tarafsiz: 'var(--tarafsiz)',
  gelenekci: 'var(--gelenekci)'
};

export default function NotDefteriModal({ oyuncuId, oyuncular = [], onKapat }) {
  // hedefId === null veya oyuncuId iken kendi notum, başka değerde ayrılan oyuncunun notu
  const [hedefId, setHedefId] = useState(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [veri, setVeri] = useState(null); // { isim, kendi, koydeMi, rolAd?, grup?, metin }
  const [taslak, setTaslak] = useState('');
  const [hata, setHata] = useState('');
  const debounceRef = useRef(null);

  // Köyden ayrılan oyuncular (prop'tan filtrele)
  const ayrilanlar = oyuncular.filter(p => p.koydeMi === false && p.id !== oyuncuId);

  // Escape ile kapama
  useEffect(() => {
    function esc(e) { if (e.key === 'Escape') onKapat(); }
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onKapat]);

  // hedef değiştiğinde not getir
  useEffect(() => {
    setYukleniyor(true);
    setHata('');
    const isteHedefi = hedefId || oyuncuId;
    socket.emit('not:getir', { hedefId: isteHedefi }, (cevap) => {
      setYukleniyor(false);
      if (!cevap?.ok) {
        setHata(cevap?.hata || 'Not defteri alınamadı');
        setVeri(null);
        return;
      }
      setVeri(cevap);
      setTaslak(cevap.metin || '');
    });
  }, [hedefId, oyuncuId]);

  // Kendi notum: debounce ile yaz
  function metniGuncelle(yeni) {
    setTaslak(yeni);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      socket.emit('gece:notGuncelle', { metin: yeni });
    }, 600);
  }

  const kendi = !veri || veri.kendi !== false;
  const grupRengi = veri?.grup ? GRUP_RENGI[veri.grup] : null;

  return (
    <div className="not-modal-arka" onClick={onKapat}>
      <div className="not-modal-kart" onClick={e => e.stopPropagation()}>
        <header className="not-modal-bas">
          <h2 className="not-modal-baslik">📓 Not Defteri</h2>
          <button className="not-modal-kapat" onClick={onKapat}>✕</button>
        </header>

        {/* Sekme barı: Notum + ayrılanlar */}
        <div className="not-modal-sekme-bar">
          <button
            className={`not-modal-sekme ${kendi ? 'not-modal-sekme--aktif' : ''}`}
            onClick={() => setHedefId(null)}
          >
            Notum
          </button>
          {ayrilanlar.map(a => (
            <button
              key={a.id}
              className={`not-modal-sekme ${hedefId === a.id ? 'not-modal-sekme--aktif' : ''}`}
              onClick={() => setHedefId(a.id)}
              title={`${a.isim}'nın not defterini gör`}
            >
              {a.isim}
            </button>
          ))}
        </div>

        {/* İçerik */}
        <div className="not-modal-icerik">
          {yukleniyor && <p className="not-modal-bos">Yükleniyor…</p>}
          {hata && <p className="not-modal-hata">{hata}</p>}
          {!yukleniyor && !hata && veri && (
            <>
              {!kendi && veri.rolAd && (
                <p className="not-modal-altyazi" style={{ color: grupRengi }}>
                  <strong>{veri.isim}</strong> — {veri.rolAd}
                </p>
              )}
              {kendi ? (
                <textarea
                  className="not-modal-textarea"
                  value={taslak}
                  onChange={e => metniGuncelle(e.target.value)}
                  placeholder="Notlarını buraya yaz… (her faz erişilebilir, otomatik kaydedilir)"
                  rows={12}
                  maxLength={1000}
                  autoFocus
                />
              ) : (
                <pre className="not-modal-okuma">
                  {veri.metin || <em>(boş — not yazmamış)</em>}
                </pre>
              )}
              {kendi && (
                <p className="not-modal-bilgi">
                  Otomatik kaydedilir. Köyden ayrılırsan notların tüm oyunculara açılır.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
