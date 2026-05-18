// q — Wiki ekranı (oyun içinden /wiki rotası)
// Sol sidebar: sayfa listesi · Sağ: seçili sayfanın markdown'ı
// Wiki .md dosyaları client/public/wiki/ altından fetch edilir.

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import './WikiEkrani.css';

const SAYFALAR = [
  { id: 'Home',                  ad: '🏠 Ana sayfa' },
  { id: 'Roller',                ad: '🎭 Roller' },
  { id: 'Gruplar',               ad: '🟢 Gruplar' },
  { id: 'Gece-Aksiyonlari',      ad: '🌙 Gece Aksiyonları' },
  { id: 'Kazanma-Kosullari',     ad: '⚖️ Kazanma Koşulları' },
  { id: 'Karakter-Hikayeleri',   ad: '📖 Karakter Hikayeleri' },
  { id: 'Versiyon-Notlari',      ad: '📜 Versiyon Notları' }
];

function rotadanSayfa() {
  // /wiki veya /wiki/ → Home
  // /wiki/Roller → Roller
  const yol = window.location.pathname.replace(/^\/wiki\/?/, '');
  if (!yol) return 'Home';
  // İlk segmenti al
  const parca = yol.split('/')[0];
  return SAYFALAR.find(s => s.id.toLowerCase() === parca.toLowerCase())?.id || 'Home';
}

export default function WikiEkrani() {
  const [aktifSayfa, setAktifSayfa] = useState(rotadanSayfa());
  const [icerik, setIcerik] = useState('');
  const [yukleniyor, setYukleniyor] = useState(true);
  const [sidebarAcik, setSidebarAcik] = useState(false);

  // URL → state senkronizasyonu (popstate)
  useEffect(() => {
    function urlDegisti() { setAktifSayfa(rotadanSayfa()); }
    window.addEventListener('popstate', urlDegisti);
    return () => window.removeEventListener('popstate', urlDegisti);
  }, []);

  // Aktif sayfa değişince dosyayı çek
  useEffect(() => {
    setYukleniyor(true);
    fetch(`/wiki/${aktifSayfa}.md`)
      .then(r => r.ok ? r.text() : Promise.reject(r.status))
      .then(t => { setIcerik(t); setYukleniyor(false); })
      .catch(() => { setIcerik(`# Sayfa bulunamadı\n\n\`${aktifSayfa}\` adlı bir sayfa yok.`); setYukleniyor(false); });
  }, [aktifSayfa]);

  function sayfayaGec(id) {
    setAktifSayfa(id);
    setSidebarAcik(false);
    window.history.pushState(null, '', `/wiki/${id === 'Home' ? '' : id}`);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function oyunaDon() {
    window.location.href = '/';
  }

  // Markdown içindeki [Sayfa](Sayfa) linklerini iç route'a çevir
  const markdownComponents = {
    a: ({ href, children, ...props }) => {
      // Dış link (https://) → yeni sekme
      if (href && /^https?:\/\//.test(href)) {
        return <a href={href} target="_blank" rel="noopener noreferrer" {...props}>{children}</a>;
      }
      // İç wiki link
      const hedef = SAYFALAR.find(s => s.id === href);
      if (hedef) {
        return (
          <a
            href={`/wiki/${href === 'Home' ? '' : href}`}
            onClick={(e) => { e.preventDefault(); sayfayaGec(href); }}
            {...props}
          >
            {children}
          </a>
        );
      }
      return <a href={href} {...props}>{children}</a>;
    }
  };

  return (
    <div className="wiki-ekran">
      <header className="wiki-bas">
        <button className="wiki-mobil-menu" onClick={() => setSidebarAcik(a => !a)} aria-label="Menü">☰</button>
        <h1 className="wiki-baslik">q — Wiki</h1>
        <button className="wiki-oyna-btn" onClick={oyunaDon}>← Oyuna dön</button>
      </header>

      <div className="wiki-icerik">
        <aside className={`wiki-sidebar ${sidebarAcik ? 'acik' : ''}`}>
          <nav className="wiki-nav">
            {SAYFALAR.map(s => (
              <button
                key={s.id}
                className={`wiki-nav-link ${aktifSayfa === s.id ? 'aktif' : ''}`}
                onClick={() => sayfayaGec(s.id)}
              >
                {s.ad}
              </button>
            ))}
          </nav>
          <p className="wiki-not">
            📂 Kaynak: <a href="https://github.com/bugrabilim/q/wiki" target="_blank" rel="noopener noreferrer">GitHub Wiki</a>
          </p>
        </aside>

        <main className="wiki-ana">
          {yukleniyor ? (
            <p className="wiki-yukleniyor">Yükleniyor…</p>
          ) : (
            <article className="wiki-markdown">
              <ReactMarkdown components={markdownComponents}>{icerik}</ReactMarkdown>
            </article>
          )}
        </main>
      </div>
    </div>
  );
}
