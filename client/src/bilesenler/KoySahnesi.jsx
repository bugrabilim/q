// Queer Quest Quench — Köy Sahnesi (oyun arka planı)
// Kodla çizilen SVG köy manzarası: orman + dere + köy meydanı (çeşme/kıraathane).
// Dinamik: ev sayısı = oyuncu sayısı. Faza göre gündüz/gece.
import { useMemo } from 'react';
import './KoySahnesi.css';

function rnd(s) { const x = Math.sin(s * 99.7) * 10000; return x - Math.floor(x); }

function ev(x, y, w, gun) {
  const h = w * 0.78, duvar = gun ? '#dcb079' : '#574535', cati = gun ? '#b5653f' : '#3a2926',
    pen = gun ? '#6e4f33' : '#f4c95d', kapi = gun ? '#7a4a28' : '#2e1f16', cw = w * 0.2;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${duvar}"/>
   <polygon points="${x - w * 0.12},${y} ${x + w / 2},${y - h * 0.5} ${x + w * 1.12},${y}" fill="${cati}"/>
   <rect x="${x + w * 0.12}" y="${y + h * 0.2}" width="${cw}" height="${cw}" fill="${pen}"/>
   <rect x="${x + w * 0.6}" y="${y + h * 0.34}" width="${w * 0.24}" height="${h * 0.66}" fill="${kapi}"/></g>`;
}
function agac(x, y, r, gun) {
  const t = gun ? '#5f9243' : '#2f4528', t2 = gun ? '#6fa54e' : '#374f30', g = gun ? '#7a5230' : '#3c2a1c';
  return `<rect x="${x - r * 0.12}" y="${y}" width="${r * 0.24}" height="${r}" fill="${g}"/>
   <circle cx="${x}" cy="${y - r * 0.2}" r="${r}" fill="${t}"/>
   <circle cx="${x - r * 0.5}" cy="${y + r * 0.1}" r="${r * 0.7}" fill="${t2}"/>
   <circle cx="${x + r * 0.55}" cy="${y}" r="${r * 0.65}" fill="${t2}"/>`;
}
function cesme(x, y, gun) {
  const tas = gun ? '#b9b0a0' : '#4b4640', tas2 = gun ? '#cfc7b8' : '#5a554c', su = gun ? '#8fd0e0' : '#3a6478';
  return `<g><ellipse cx="${x}" cy="${y + 18}" rx="34" ry="11" fill="${su}"/>
   <ellipse cx="${x}" cy="${y + 18}" rx="34" ry="11" fill="none" stroke="${tas}" stroke-width="4"/>
   <rect x="${x - 8}" y="${y - 16}" width="16" height="32" rx="3" fill="${tas2}"/>
   <rect x="${x - 13}" y="${y - 22}" width="26" height="9" rx="3" fill="${tas}"/>
   <circle cx="${x}" cy="${y - 2}" r="3" fill="${gun ? '#6aa6c0' : '#2c4d60'}"/></g>`;
}
function kiraathane(x, y, gun) {
  const duvar = gun ? '#caa978' : '#4e4234', cati = gun ? '#7a8a5a' : '#33402a',
    pen = gun ? '#6e4f33' : '#f4c95d', tabela = gun ? '#8a5a2b' : '#5c3a17', semsiye = gun ? '#c0584f' : '#5a2f2c';
  const w = 92, h = 58;
  return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${duvar}"/>
   <rect x="${x - 6}" y="${y - 12}" width="${w + 12}" height="14" rx="2" fill="${cati}"/>
   <rect x="${x + 10}" y="${y + 14}" width="20" height="20" fill="${pen}"/>
   <rect x="${x + 40}" y="${y + 14}" width="20" height="20" fill="${pen}"/>
   <rect x="${x + 68}" y="${y + 22}" width="18" height="${h - 22}" fill="${gun ? '#6e4326' : '#241812'}"/>
   <rect x="${x + 18}" y="${y - 26}" width="56" height="12" rx="2" fill="${tabela}"/>
   <text x="${x + 46}" y="${y - 17}" font-family="Lora,serif" font-size="9" font-weight="700" fill="#fbf3dd" text-anchor="middle">KIRAATHANE</text>
   <g transform="translate(${x - 30},${y + 44})"><rect x="-2" y="-2" width="4" height="22" fill="${gun ? '#5c3a17' : '#2a1c12'}"/>
     <polygon points="-18,-2 18,-2 0,-18" fill="${semsiye}"/>
     <ellipse cx="0" cy="22" rx="11" ry="4" fill="${gun ? '#9a6532' : '#3a2a1c'}"/></g></g>`;
}
function cicek(x, y, gun) {
  if (!gun) return `<circle cx="${x}" cy="${y}" r="1.5" fill="#d8c19a" opacity=".5"/>`;
  const r = ['#e85d5d', '#f0c64e', '#e88fc0', '#fff', '#c08fe8'][Math.floor(rnd(x + y) * 5)];
  return `<circle cx="${x}" cy="${y}" r="2.3" fill="${r}"/><circle cx="${x}" cy="${y}" r=".9" fill="#fff8d0"/>`;
}

// Ev yerleşim noktaları: x, y(kot), s(ölçek/perspektif) — tepe/yokuş/orta/ön karışık
const NOKTALAR = [
  { x: 300, y: 250, s: 1.0 }, { x: 520, y: 255, s: 1.0 },
  { x: 150, y: 215, s: 0.85 }, { x: 660, y: 225, s: 0.9 },
  { x: 240, y: 165, s: 0.68 }, { x: 560, y: 158, s: 0.68 },
  { x: 120, y: 320, s: 1.25 }, { x: 680, y: 330, s: 1.3 },
  { x: 110, y: 120, s: 0.5 }, { x: 690, y: 105, s: 0.5 },
  { x: 400, y: 330, s: 1.15 }, { x: 430, y: 150, s: 0.6 }
];

function sahneSVG(gun, n) {
  const W = 800, H = 430;
  const sky = gun ? '#cfe7ee' : '#241d36', tepe1 = gun ? '#b6cf95' : '#2b2740', tepe2 = gun ? '#9bbf6e' : '#283322',
    orman = gun ? '#6f9a4e' : '#243019', cim = gun ? '#86ad52' : '#2c3823', cim2 = gun ? '#79a043' : '#28321f',
    meydan = gun ? '#cdb487' : '#3a3026', dere = gun ? '#73bcd6' : '#2f5470', dereUst = gun ? '#a6dcea' : '#43678a',
    dag = gun ? '#a9b8c4' : '#2c2a3e', yol = gun ? '#d8c193' : '#473c2e';
  let s = `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">`;
  s += `<rect width="${W}" height="${H}" fill="${sky}"/>`;
  if (!gun) { for (let i = 0; i < 26; i++) { s += `<circle cx="${(rnd(i) * W).toFixed(0)}" cy="${(rnd(i + 50) * 150).toFixed(0)}" r="${(rnd(i + 9) * 1.3 + 0.5).toFixed(1)}" fill="#fff" opacity="${(rnd(i + 3) * 0.6 + 0.4).toFixed(2)}"/>`; } }
  s += `<circle cx="700" cy="58" r="30" fill="${gun ? '#f6d589' : '#ece4cc'}" opacity=".9"/>`;
  if (!gun) s += `<circle cx="688" cy="52" r="26" fill="${sky}"/>`;
  s += `<path d="M0 130 L140 60 L260 120 L380 55 L520 125 L660 70 L800 120 V200 H0Z" fill="${dag}" opacity=".7"/>`;
  s += `<path d="M0 150 Q200 110 410 145 T800 140 V430 H0Z" fill="${tepe1}"/>`;
  s += `<path d="M0 200 Q260 165 520 200 T800 195 V430 H0Z" fill="${tepe2}"/>`;
  let o = `<path d="M0 230 `; for (let x = 0; x <= W; x += 44) { o += `Q${x + 22} ${205 + rnd(x) * 22} ${x + 44} 224 `; } o += `V430 H0Z" fill="${orman}"/>`; s += o;
  for (let i = 0; i < 16; i++) { s += `<circle cx="${(15 + i * 50 + rnd(i) * 16).toFixed(0)}" cy="${(222 - rnd(i + 7) * 16).toFixed(0)}" r="${(9 + rnd(i) * 8).toFixed(0)}" fill="${orman}"/>`; }
  s += `<rect x="0" y="248" width="${W}" height="182" fill="${cim}"/>`;
  s += `<path d="M0 300 Q400 280 800 300 V430 H0Z" fill="${cim2}"/>`;
  s += `<ellipse cx="410" cy="300" rx="180" ry="46" fill="${meydan}"/>`;
  s += `<path d="M410 300 Q300 270 230 200" stroke="${yol}" stroke-width="9" fill="none" opacity=".8"/>`;
  s += `<path d="M410 300 Q540 275 600 230" stroke="${yol}" stroke-width="9" fill="none" opacity=".8"/>`;
  s += `<path d="M410 320 Q250 345 140 330" stroke="${yol}" stroke-width="10" fill="none" opacity=".8"/>`;
  const evler = NOKTALAR.slice(0, Math.min(n, NOKTALAR.length)).slice().sort((a, b) => a.y - b.y);
  s += agac(70, 250, 26, gun); s += agac(740, 255, 28, gun); s += agac(350, 205, 20, gun); s += agac(610, 275, 22, gun);
  evler.forEach(p => { s += ev(p.x - 35 * p.s, p.y, 70 * p.s, gun); });
  s += kiraathane(450, 250, gun);
  s += cesme(360, 300, gun);
  s += agac(45, 360, 34, gun); s += agac(760, 365, 36, gun); s += agac(180, 345, 24, gun);
  for (let i = 0; i < 26; i++) { s += cicek((20 + rnd(i + 11) * 760).toFixed(0), (330 + rnd(i + 30) * 70).toFixed(0), gun); }
  s += `<path d="M560 148 Q526 235 560 288 Q602 350 452 376 Q312 402 50 392" fill="none" stroke="${dere}" stroke-width="24" stroke-linecap="round" opacity=".95"/>`;
  s += `<path d="M560 148 Q526 235 560 288 Q602 350 452 376 Q312 402 50 392" fill="none" stroke="${dereUst}" stroke-width="4" stroke-linecap="round" opacity=".5"/>`;
  s += `<rect x="298" y="378" width="66" height="9" rx="2" fill="${gun ? '#9a6532' : '#4a3a2a'}"/><rect x="302" y="386" width="5" height="11" fill="${gun ? '#7a4a28' : '#3a2a1c'}"/><rect x="356" y="386" width="5" height="11" fill="${gun ? '#7a4a28' : '#3a2a1c'}"/>`;
  s += `</svg>`;
  return s;
}

export default function KoySahnesi({ gece = false, oyuncuSayisi = 6 }) {
  const n = Math.max(4, Math.min(NOKTALAR.length, oyuncuSayisi || 6));
  const svg = useMemo(() => sahneSVG(!gece, n), [gece, n]);
  return (
    <div className={`koy-sahne ${gece ? 'koy-sahne--gece' : ''}`} aria-hidden="true">
      <div className="koy-sahne-resim" dangerouslySetInnerHTML={{ __html: svg }} />
      <div className="koy-sahne-perde" />
    </div>
  );
}
