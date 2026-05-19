// q — Rol Havuzu Paneli (B Seçeneği, v1.8.32)
// Lobide host'un hangi rollerin oyuna girebileceğini tikleyebildiği panel.
// A seçeneği (grup sayıları) ile birlikte çalışır.
// Master Belge Bölüm 18: "Rol havuzu tikleme (B seçeneği)"

import { useMemo } from 'react';
import './RolHavuzuPaneli.css';

const GRUP_BILGI = {
  ozgurlukcu: { ad: 'Özgürlükçüler', sembol: '🟢' },
  tarafsiz:   { ad: 'Tarafsızlar',   sembol: '🟡' },
  gelenekci:  { ad: 'Gelenekçiler',  sembol: '🔴' },
  outsider:   { ad: 'Outsider',      sembol: '⚪' },
  kaoscu:     { ad: 'Kaosçular',     sembol: '⚫' }
};

const GRUP_SIRA = ['ozgurlukcu', 'tarafsiz', 'gelenekci', 'outsider', 'kaoscu'];

export default function RolHavuzuPaneli({ roller, rolHavuzu, dagilim, onChange }) {
  // rolHavuzu: null = tüm roller açık (default), { rolId: bool, ... } = host seçimi
  // dagilim: { ozgurlukcu, tarafsiz, gelenekci, outsider, kaoscu } veya null
  // onChange(yeniHavuz | null) — server'a iletmek için callback

  function acikMi(rolId) {
    if (!rolHavuzu) return true;
    return rolHavuzu[rolId] !== false;
  }

  function tumHavuzObjesi() {
    // rolHavuzu null ise, hepsini true ile başlat (sonra değişiklik kolay olsun)
    const yeni = {};
    roller.forEach(r => { yeni[r.id] = acikMi(r.id); });
    return yeni;
  }

  function toggle(rolId) {
    const yeni = tumHavuzObjesi();
    yeni[rolId] = !yeni[rolId];
    // Eğer hepsi true olduysa null'a düşür (default davranışa eşdeğer)
    const hepsiAcik = Object.values(yeni).every(v => v === true);
    onChange(hepsiAcik ? null : yeni);
  }

  function hepsiniAc() {
    onChange(null);
  }

  function grupToggle(grupId, deger) {
    const yeni = tumHavuzObjesi();
    roller.filter(r => r.grup === grupId).forEach(r => {
      yeni[r.id] = deger;
    });
    const hepsiAcik = Object.values(yeni).every(v => v === true);
    onChange(hepsiAcik ? null : yeni);
  }

  // Grup başına açık/toplam sayı
  const grupSayilari = useMemo(() => {
    const sonuc = {};
    GRUP_SIRA.forEach(g => {
      const gruptaki = roller.filter(r => r.grup === g);
      const acik = gruptaki.filter(r => acikMi(r.id)).length;
      sonuc[g] = { acik, toplam: gruptaki.length };
    });
    return sonuc;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roller, rolHavuzu]);

  // Validation: A grup sayısı > 0 ise B'de o gruptan en az 1 açık olmalı
  // (Tekil kuralı kalktı — aynı rol birden fazla oyuncuya verilebilir)
  const uyarilar = useMemo(() => {
    if (!dagilim) return [];
    const u = [];
    GRUP_SIRA.forEach(g => {
      const istenen = Number(dagilim[g] || 0);
      const acik = grupSayilari[g]?.acik || 0;
      if (istenen > 0 && acik === 0) {
        u.push(`${GRUP_BILGI[g].ad}: ${istenen} oyuncu için tikli rol yok — en az 1 rol açık olmalı`);
      }
    });
    return u;
  }, [grupSayilari, dagilim]);

  if (!roller || roller.length === 0) {
    return null; // Roller henüz yüklenmediyse paneli render etme
  }

  const havuzAktif = rolHavuzu !== null && rolHavuzu !== undefined;

  return (
    <section className="rol-havuzu-paneli">
      <h3 className="rol-havuzu-baslik">
        Roller (B Seçeneği) <span className="rol-havuzu-rozet">host</span>
      </h3>
      <p className="rol-havuzu-altyazi">
        Hangi spesifik roller havuzda olabilir? Kapalı roller dağıtılmaz. Default: hepsi açık.
        Aynı rolden birden fazla oyuncuya verilebilir (tekil kuralı v1.8'de kalktı).
      </p>

      <div className="rol-havuzu-hizli-butonlar">
        <button
          type="button"
          onClick={hepsiniAc}
          className="rol-havuzu-hizli-btn"
          disabled={!havuzAktif}
          title="Tüm rolleri varsayılan olarak aç"
        >
          ↺ Hepsini Aç (Default)
        </button>
        {havuzAktif && <span className="rol-havuzu-aktif-rozet">Özel havuz aktif</span>}
      </div>

      {GRUP_SIRA.map(grupId => {
        const sayi = grupSayilari[grupId];
        if (!sayi || sayi.toplam === 0) return null;
        const gruptaki = roller.filter(r => r.grup === grupId);
        return (
          <div key={grupId} className={`rol-havuzu-grup rol-havuzu-grup--${grupId}`}>
            <div className="rol-havuzu-grup-baslik">
              <span className="rol-havuzu-grup-ad">
                {GRUP_BILGI[grupId].sembol} {GRUP_BILGI[grupId].ad}
              </span>
              <span className="rol-havuzu-grup-sayi">
                ({sayi.acik}/{sayi.toplam} açık)
              </span>
              <span className="rol-havuzu-grup-mini-btnler">
                <button
                  type="button"
                  onClick={() => grupToggle(grupId, true)}
                  className="rol-havuzu-mini-btn"
                  disabled={sayi.acik === sayi.toplam}
                >Hepsi</button>
                <button
                  type="button"
                  onClick={() => grupToggle(grupId, false)}
                  className="rol-havuzu-mini-btn"
                  disabled={sayi.acik === 0}
                >Yok</button>
              </span>
            </div>
            <div className="rol-havuzu-rol-listesi">
              {gruptaki.map(rol => (
                <label
                  key={rol.id}
                  className={`rol-havuzu-rol-satir ${!acikMi(rol.id) ? 'kapali' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={acikMi(rol.id)}
                    onChange={() => toggle(rol.id)}
                  />
                  <span className="rol-havuzu-rol-ad">
                    {rol.ad}
                    {rol.karakter && (
                      <span className="rol-havuzu-karakter"> · {rol.karakter}</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        );
      })}

      {uyarilar.length > 0 && (
        <div className="rol-havuzu-validation">
          {uyarilar.map((u, i) => (
            <p key={i} className="rol-havuzu-uyari">⚠️ {u}</p>
          ))}
        </div>
      )}
    </section>
  );
}
