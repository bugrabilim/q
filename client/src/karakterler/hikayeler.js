// v1.8 — Detaylı hikaye yükleyici.
// `client/public/hikayeler-v1.md` dosyasını fetch eder, parse eder, karakter ismine
// göre uzun hikayeyi döndürür. Tek sefer fetch (cache).

let cache = null;
let fetchPromise = null;

async function dosyayiYukle() {
  if (cache) return cache;
  if (fetchPromise) return fetchPromise;

  fetchPromise = (async () => {
    try {
      const cevap = await fetch('/hikayeler-v1.md');
      if (!cevap.ok) throw new Error(`Hikayeler yüklenemedi: ${cevap.status}`);
      const md = await cevap.text();
      cache = parseEt(md);
      return cache;
    } catch (e) {
      console.warn('Hikayeler yüklenemedi:', e);
      cache = {};
      return cache;
    } finally {
      fetchPromise = null;
    }
  })();

  return fetchPromise;
}

// Markdown formatı:
// ### Gay — Deniz (25, İK Uzmanı)
// **Kısa hikaye (rol kartında):**
// ...
//
// **Detaylı hikaye:**
// ...
//
// ---
function parseEt(md) {
  const sonuc = {};
  // ### başlığıyla başlayan her bloğu yakala
  // Format: ### [Rol Adı] — [Karakter İsmi] (yaş, meslek)
  const blokRegex = /^### ([^\n—]+?) —\s*([^\n(]+?)(?:\s*\([^\n]*\))?\s*$/;
  const satirlar = md.split('\n');
  let aktifKarakter = null;
  let mod = null; // 'kisa' | 'uzun' | null
  let metinler = { kisa: [], uzun: [] };

  function kaydet() {
    if (!aktifKarakter) return;
    const kisa = metinler.kisa.join('\n').trim();
    const uzun = metinler.uzun.join('\n').trim();
    sonuc[aktifKarakter] = { kisa, uzun };
  }

  for (const satir of satirlar) {
    const m = satir.match(blokRegex);
    if (m) {
      kaydet();
      aktifKarakter = m[2].trim();
      mod = null;
      metinler = { kisa: [], uzun: [] };
      continue;
    }
    if (/^\*\*Kısa hikaye/.test(satir)) { mod = 'kisa'; continue; }
    if (/^\*\*Detaylı hikaye/.test(satir)) { mod = 'uzun'; continue; }
    if (/^---\s*$/.test(satir)) { mod = null; continue; }
    if (mod && aktifKarakter) {
      metinler[mod].push(satir);
    }
  }
  kaydet();
  return sonuc;
}

/** Bir karakterin uzun hikayesini döndürür (varsa). */
export async function uzunHikayeyiAl(karakter) {
  if (!karakter) return null;
  const all = await dosyayiYukle();
  return all[karakter]?.uzun || null;
}

/** Bir karakterin kısa hikayesini döndürür (varsa). */
export async function kisaHikayeyiAl(karakter) {
  if (!karakter) return null;
  const all = await dosyayiYukle();
  return all[karakter]?.kisa || null;
}
