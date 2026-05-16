// q — Karakter Portresi (v1.6 — Madde 5)
// Karakter ismi veya server'dan gelen `gorsel` URL'sine göre PNG portre gösterir.
// Görsel yüklenmezse (henüz konmamış / 404) emoji fallback.

import { useState } from 'react';

const GRUP_EMOJI = {
  ozgurlukcu: '🟢',
  tarafsiz: '🟡',
  gelenekci: '🔴'
};

// v1.6 — Madde 5: Kenney paketinde sadece 6 farklı baz yüz var (4 insan + Robot +
// Zombie), 12 karakter için tekrar kaçınılmaz. Aynı baz görseli paylaşan karakterleri
// CSS filter ile farklılaştırıyoruz (saç/ten renk kayması). Tüm değerler 0.5x boyut
// koruma için sade — performans riski yok.
const KARAKTER_FILTER = {
  // Male adventurer paylaşanlar
  Deniz:   null,
  Berke:   'hue-rotate(85deg) saturate(1.2)',     // drag queen → mor/pembe ton
  Mert:    'hue-rotate(-55deg) sepia(0.25)',      // daha sıcak/kahve
  // Male person paylaşanlar
  Umut:    null,
  Mehmet:  'hue-rotate(40deg) saturate(1.1)',     // kızıl rock tonu
  Kaan:    'hue-rotate(-35deg) saturate(0.75)',   // sert, sönük
  Necmi:   'hue-rotate(180deg) saturate(0.55) brightness(0.95)', // yaşlı, gri
  // Female adventurer paylaşanlar
  Devin:   null,
  Lila:    'hue-rotate(55deg) brightness(1.05)',  // pembe/mor saç
  // Female person paylaşanlar
  Fatma:   null,
  Azra:    'hue-rotate(75deg) saturate(1.15)',    // mor/kızıl
  // Eşsiz
  Baran:   null
};

// Karakter ismini dosya adına çevir: Türkçe karakter zaten yok prototipte
function karakterDosyaAdi(karakter) {
  if (!karakter) return null;
  try {
    return String(karakter).toLocaleLowerCase('tr-TR');
  } catch {
    return String(karakter).toLowerCase();
  }
}

export default function KarakterPortresi({
  karakter,                // 'Deniz', 'Kaan' vs.
  gorsel = null,           // server'dan gelen direkt yol (öncelikli)
  grup = null,             // fallback için emoji seçer
  boyut = 56,              // px
  yuvarlak = true,
  className = ''
}) {
  const [hata, setHata] = useState(false);
  const dosya = gorsel || (karakter ? `/karakterler/${karakterDosyaAdi(karakter)}.png` : null);
  const grupEmoji = GRUP_EMOJI[grup] || '👤';

  const stil = {
    width: boyut,
    height: boyut,
    borderRadius: yuvarlak ? '50%' : '12%',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    background: 'var(--deniz-acik)',
    color: 'var(--derin)',
    fontSize: Math.max(14, Math.round(boyut * 0.5)),
    flexShrink: 0,
    boxShadow: '0 1px 3px rgba(38,70,83,0.15)',
    border: '2px solid white'
  };

  if (!dosya || hata) {
    return (
      <span className={`karakter-portresi karakter-portresi--fallback ${className}`} style={stil} aria-hidden="true">
        {grupEmoji}
      </span>
    );
  }

  // v1.6 — Madde 5: Karakter-bazlı filter (paylaşılan baz görselleri farklılaştır)
  const karakterFilter = karakter ? KARAKTER_FILTER[karakter] : null;

  return (
    <span className={`karakter-portresi ${className}`} style={stil}>
      <img
        src={dosya}
        alt={karakter || 'karakter'}
        onError={() => setHata(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center top',  // yüz üst kısmı odakta kalsın
          display: 'block',
          filter: karakterFilter || undefined
        }}
      />
    </span>
  );
}
