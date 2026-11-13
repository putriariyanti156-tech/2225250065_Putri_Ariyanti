import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import { DEMO } from './lib/mode.js';
import './styles.css';

// Tangkap peristiwa pemasangan PWA sedini mungkin agar tombol "Pasang" bisa memakainya.
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  window.__promptPasang = e;
  window.dispatchEvent(new Event('prompt-pasang-siap'));
});

// Service worker: menyimpan aplikasi agar bisa dibuka offline & dipasang.
// Tidak dipakai di mode pratinjau (lingkungan yang tidak mengizinkan service worker).
if (!DEMO && 'serviceWorker' in navigator) {
  registerSW({ immediate: true, onRegisterError: () => {} });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
