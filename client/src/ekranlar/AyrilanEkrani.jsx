// Queer Quest Quench — Köyden Ayrılan Oyuncu Ekranı (Aşama C sade hali)
// Sohbet artık ortak panele birleşti (ayrılanlar kanalı). Bu ekran sadece "ayrıldın" başlığını
// ve rol bilgisini gösterir.

import './AyrilanEkrani.css';

export default function AyrilanEkrani({ benimIsmim, oyuncuId, ayrilmaBilgisi }) {
  const grupRenk = {
    ozgurlukcu: '#06A77D',
    tarafsiz: '#F4A261',
    gelenekci: '#E63946'
  };
  const grupAd = {
    ozgurlukcu: '🟢 Özgürlükçü',
    tarafsiz: '🟡 Tarafsız',
    gelenekci: '🔴 Gelenekçi'
  };
  const renk = grupRenk[ayrilmaBilgisi?.grup] || '#A8DADC';

  return (
    <div className="ayrilan">
      <header className="ayrilan-bas" style={{ borderTopColor: renk }}>
        <div className="ayrilan-rozet" style={{ background: renk }}>
          {grupAd[ayrilmaBilgisi?.grup] || '?'}
        </div>
        <h1 className="ayrilan-baslik">Köyden ayrıldın</h1>
        <p className="ayrilan-altbaslik">
          {ayrilmaBilgisi?.sebep === 'oylama'
            ? 'Oylama sonucu köyden ayrıldın.'
            : 'Bu gece köyden uzaklaştırıldın.'}
        </p>
        <div className="ayrilan-rol-kutu">
          <span className="ayrilan-rol-etiket">Rolün</span>
          <span className="ayrilan-rol-ad">{ayrilmaBilgisi?.rolAd || '?'}</span>
        </div>
      </header>

      <div className="ayrilan-bilgi">
        <p className="ayrilan-bilgi-metin">
          Artık tüm oyuncuların rollerini sol panelde görebilirsin. Sağdaki sohbet panelinden
          diğer ayrılanlar (ve Transseksüel) ile yazışabilirsin. Köyün canlı sohbetini de okuyabilirsin —
          ama yazdıklarını sadece ayrılanlar görür.
        </p>
      </div>
    </div>
  );
}
