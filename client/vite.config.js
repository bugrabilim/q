import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Geliştirme: Vite frontend'i 5173'te servis eder,
// /socket.io ve /saglik isteklerini backend'e (3001) yönlendirir.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/socket.io': {
        target: 'http://localhost:3001',
        ws: true,
        changeOrigin: true,
      },
      '/saglik': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
