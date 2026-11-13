import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  // Jalur relatif: aplikasi bisa di-hosting di root domain maupun subfolder.
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'BULAT — Belajar Operasi Bilangan Bulat',
        short_name: 'BULAT',
        description: 'Belajar operasi bilangan bulat dan literasi matematika untuk siswa SMP.',
        lang: 'id',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#FAFAF7',
        theme_color: '#1D4ED8',
        categories: ['education'],
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,woff,woff2}'],
        navigateFallbackDenylist: [/^\/api/, /^\/docs/],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  server: {
    host: true,
    proxy: { '/api': 'http://localhost:8000' },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
  },
});
