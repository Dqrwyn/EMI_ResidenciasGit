import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ==========================================================
//  vite.config.js
//  El puerto 5180 evita chocar con otros proyectos y el proxy
//  manda todas las llamadas /api al backend de residencias.
// ==========================================================

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5180,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4100',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
});
