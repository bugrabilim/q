// q — Socket bağlantısı
// Vite proxy ile /socket.io → backend:3001

import { io } from 'socket.io-client';

// Geliştirme ortamında Vite'ın proxy'si üzerinden gider.
// Production'da aynı origin kullanılır (server frontend'i de servis eder).
export const socket = io({
  autoConnect: true,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log('🔌 Bağlandı:', socket.id);
});

socket.on('disconnect', (sebep) => {
  console.log('🔌 Koptu:', sebep);
});

socket.on('connect_error', (hata) => {
  console.warn('🔌 Bağlantı hatası:', hata.message);
});
