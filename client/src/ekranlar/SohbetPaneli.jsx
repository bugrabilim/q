// Queer Quest Quench — Sürekli Sohbet Paneli (Madde 3-4-5-11-12)
// Tüm fazlarda sabit görünür. Mod bağlamına göre kanal/kim yazabilir değişir.

import { useEffect, useState, useRef } from 'react';
import { socket } from '../socket.js';
import { efektCal } from '../ses/SesYoneticisi.js';
import './SohbetPaneli.css';

// v1.6 — Madde 4: Türkçe-aware mention tespiti (bildirim sesi için)
function bendenBahsediyorMu(metin, benimIsmim) {
  if (!benimIsmim) return false;
  try {
    const m = String(metin || '').toLocaleLowerCase('tr-TR');
    const i = String(benimIsmim).toLocaleLowerCase('tr-TR');
    return i.length > 0 && m.includes(i);
  } catch {
    return false;
  }
}

export default function SohbetPaneli({
  oyuncuId,
  benimIsmim = '',
  faz,                  // 'tanisma' | 'gece' | 'sabah' | 'tartisma' | 'oylama_1' | 'savunma' | 'oylama_2' | 'oylama_tartisma' | 'oylama_sonuc' | 'ayrilan'
  benimRolumId,
  fobikUye = false,     // Kaan/Necmi/Azra ise true
  ayrildimMi = false,
  savunulanId = null    // savunma fazında — yalnızca o yazabilir
}) {
  const [mesajlar, setMesajlar] = useState([]);
  const [taslak, setTaslak] = useState('');
  const chatBitisRef = useRef(null);

  // Mount + faz değişiminde mesaj geçmişini kaynaklara göre topla
  useEffect(() => {
    // Hangi durum endpoint'ine başvuracağız?
    const endpoint = endpointBul(faz);
    if (!endpoint) return;
    socket.emit(endpoint, null, (cevap) => {
      if (cevap?.ok && Array.isArray(cevap.chat)) setMesajlar(cevap.chat);
    });
  }, [faz]);

  // Yeni mesaj geldiğinde ekle (server zaten bize görünür olanı yolluyor)
  // v1.6 — Madde 4: Bildirim sesi yalnızca beni tag'leyen mesajlarda çalar.
  //                Diğer mesajlar (bot olsun, gerçek olsun) sessizdir.
  useEffect(() => {
    function chatMesaj(mesaj) {
      setMesajlar(prev => [...prev, mesaj]);
      if (mesaj?.oyuncuId === oyuncuId) return;                  // kendi mesajım — sessiz
      if (mesaj?.sistem || mesaj?.kanal === 'sistem') return;    // sistem mesajı — sessiz
      if (bendenBahsediyorMu(mesaj?.metin, benimIsmim)) {
        efektCal('bildirim');
      }
    }
    socket.on('chat:mesaj', chatMesaj);
    return () => socket.off('chat:mesaj', chatMesaj);
  }, [oyuncuId, benimIsmim]);

  // Otomatik scroll
  useEffect(() => {
    chatBitisRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [mesajlar]);

  // Kim yazabilir? Hangi placeholder?
  const yazabilirMiyim = yazmaIznim({ faz, fobikUye, ayrildimMi, oyuncuId, savunulanId, benimRolumId });
  const placeholder = placeholderMetni({ faz, fobikUye, ayrildimMi, oyuncuId, savunulanId, benimRolumId });
  const moduMetni = baslikModu({ faz, fobikUye, ayrildimMi, benimRolumId });

  function gonder(e) {
    e?.preventDefault();
    const metin = taslak.trim();
    if (!metin || !yazabilirMiyim) return;
    socket.emit('chat:gonder', { metin }, (cevap) => {
      if (cevap?.ok) setTaslak('');
      else if (cevap?.hata) console.warn('[chat]', cevap.hata);
    });
  }

  return (
    <div className="sohbet-paneli">
      <header className="sohbet-bas">
        <span className="sohbet-bas-baslik">💬 Sohbet</span>
        <span className="sohbet-bas-mod">{moduMetni}</span>
      </header>

      <div className="sohbet-mesajlar">
        {mesajlar.length === 0 && (
          <p className="sohbet-bos">Henüz mesaj yok.</p>
        )}
        {mesajlar.map(m => (
          <SohbetMesaji
            key={m.id}
            mesaj={m}
            benMiyim={m.oyuncuId === oyuncuId}
          />
        ))}
        <div ref={chatBitisRef} />
      </div>

      <form className="sohbet-form" onSubmit={gonder}>
        <input
          className="sohbet-input"
          value={taslak}
          onChange={e => setTaslak(e.target.value)}
          placeholder={placeholder}
          maxLength={280}
          disabled={!yazabilirMiyim}
        />
        <button
          type="submit"
          className="sohbet-gonder"
          disabled={!yazabilirMiyim || !taslak.trim()}
        >
          →
        </button>
      </form>
    </div>
  );
}

// ─── Yardımcılar ──────────────────────────────────────────

function endpointBul(faz) {
  if (faz === 'tanisma') return 'tanisma:durumIste';
  if (faz === 'gece') return 'gece:durumIste';
  if (faz === 'sabah') return 'sabah:durumIste';
  if (faz === 'tartisma') return 'tartisma:durumIste';
  if (faz === 'oylama_1' || faz === 'oylama_2' || faz === 'savunma' || faz === 'oylama_tartisma') {
    return 'oylama:durumIste';
  }
  if (faz === 'oylama_sonuc') return 'oylama_sonuc:durumIste';
  return null;
}

function yazmaIznim({ faz, fobikUye, ayrildimMi, oyuncuId, savunulanId, benimRolumId }) {
  // Ayrılan oyuncular her zaman yazabilir (ayrılan kanalında)
  if (ayrildimMi) return true;
  // Trans rolü gece sırasında yazabilir (ayrılan kanalına gider)
  if (faz === 'gece' && benimRolumId === 'transseksuel') return true;
  // Gece: sadece fobikler yazar
  if (faz === 'gece') return fobikUye;
  // Savunma: sadece savunulan yazar
  if (faz === 'savunma') return oyuncuId === savunulanId;
  // Konuşulabilir gündüz fazları
  const izinli = ['tanisma', 'tartisma', 'oylama_1', 'oylama_2', 'oylama_tartisma', 'oylama_sonuc', 'sabah'];
  return izinli.includes(faz);
}

function placeholderMetni({ faz, fobikUye, ayrildimMi, oyuncuId, savunulanId, benimRolumId }) {
  if (ayrildimMi) return 'Ayrılanlar arasında yaz…';
  if (faz === 'gece' && benimRolumId === 'transseksuel') return 'Ayrılanlarla yaz…';
  if (faz === 'gece' && fobikUye) return 'Gelenekçi kanalında yaz…';
  if (faz === 'gece') return 'Köy uyuyor — şu an yazamazsın';
  if (faz === 'savunma' && oyuncuId !== savunulanId) return 'Savunma sürerken sadece savunulan yazabilir';
  return 'Bir şeyler söyle…';
}

function baslikModu({ faz, fobikUye, ayrildimMi, benimRolumId }) {
  if (ayrildimMi) return 'Ayrılanlar';
  if (faz === 'gece' && benimRolumId === 'transseksuel') return 'Ayrılanlarla';
  if (faz === 'gece' && fobikUye) return 'Gelenekçi gece';
  if (faz === 'gece') return 'Köy uyuyor';
  if (faz === 'savunma') return 'Savunma';
  return 'Köy meydanı';
}

function SohbetMesaji({ mesaj, benMiyim }) {
  if (mesaj.tip === 'sistem') {
    return (
      <div className="sohbet-mesaj sohbet-mesaj-sistem">
        <span className="sohbet-mesaj-sistem-metin">{mesaj.metin}</span>
      </div>
    );
  }
  const kanalSinif = mesaj.kanal ? `sohbet-mesaj-kanal-${mesaj.kanal}` : '';
  return (
    <div className={`sohbet-mesaj sohbet-mesaj-oyuncu ${benMiyim ? 'sohbet-mesaj-ben' : ''} ${kanalSinif}`}>
      <span className="sohbet-mesaj-isim">{mesaj.isim}</span>
      <span className="sohbet-mesaj-metin">{mesaj.metin}</span>
    </div>
  );
}
