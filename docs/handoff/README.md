# docs/handoff — devir sırasında paylaşılan dosyalar

2026-09-10 devrinde, v1.9 görsel kimlik oturumunda üretilen/paylaşılan dosyalar.

| Dosya | Ne? |
|---|---|
| `rol-karti-demo.html` | **2.5D rol kartı çevirme demosu.** Buğra'ya gösterilen bağımsız HTML. 3 donmuş kare (kapalı → dönerken → açık) + gömülü base64 portre. Tarayıcıda doğrudan açılır, bağımlılık yok. |
| `rol-karti-demo-onizleme.html` | Aynı demonun önizleme varyantı (`.onizleme/index.html`). Canlı etkileşimli kart içerir. |

> Bu demolar **referanstır**, oyunun parçası değildir. Gerçek uygulama:
> `client/src/ekranlar/RolKartiEkrani.jsx` + `RolKartiEkrani.css`

## Neden burada?
Yerel klasör silinip buluta geçildiği için, sohbette üretilen referans dosyalar kaybolmasın diye repoya alındı. Detay: kökteki `HANDOFF.md`.
