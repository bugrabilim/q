// q — Karakter Anısı Banner (Aşama 3, v1.8.30+)
// Faz başlangıcında oyuncuya kendi karakterinin hikayesinden 1 cümle gösterir.
// Belge Bölüm 24.3 — ortak omurga, 38 karakter hikayesi oyunda canlı kalır.

import { useEffect, useState, useRef } from 'react';
import karakterAnilari from '../veri/karakterAnilari.json';
import './KarakterAnisiBaneri.css';

const FADE_IN_GECIKME_MS = 800;   // ekran açıldıktan sonra anı yavaşça belirsin
const GORUNUM_SURESI_MS = 5500;   // ekranda kalma süresi
const FADE_MS = 600;              // fade in/out süresi

export default function KarakterAnisiBaneri({ karakter }) {
  const [ani, setAni] = useState(null);
  const [gorunur, setGorunur] = useState(false);
  const timersRef = useRef([]);

  useEffect(() => {
    if (!karakter || !karakterAnilari[karakter]) return;

    // Rastgele anı seç
    const havuz = karakterAnilari[karakter];
    const secilen = havuz[Math.floor(Math.random() * havuz.length)];
    setAni(secilen);

    // Fade in (gecikmeli)
    const t1 = setTimeout(() => setGorunur(true), FADE_IN_GECIKME_MS);
    // Fade out
    const t2 = setTimeout(() => setGorunur(false), FADE_IN_GECIKME_MS + GORUNUM_SURESI_MS);
    // Anıyı sıfırla — DOM'dan kaldır
    const t3 = setTimeout(() => setAni(null), FADE_IN_GECIKME_MS + GORUNUM_SURESI_MS + FADE_MS);

    timersRef.current = [t1, t2, t3];
    return () => timersRef.current.forEach(clearTimeout);
  }, [karakter]);

  if (!ani) return null;

  return (
    <div
      className={`karakter-anisi-banner ${gorunur ? 'gorunur' : ''}`}
      role="status"
      aria-live="polite"
    >
      <span className="karakter-anisi-tirnak">"</span>
      <span className="karakter-anisi-metin">{ani}</span>
      <span className="karakter-anisi-tirnak">"</span>
    </div>
  );
}
