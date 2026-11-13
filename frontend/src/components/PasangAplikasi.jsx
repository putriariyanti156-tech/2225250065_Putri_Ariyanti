import { useEffect, useState } from 'react';
import { DEMO } from '../lib/mode.js';

/** Peristiwa beforeinstallprompt ditangkap sedini mungkin (lihat main.jsx). */
function ambilPrompt() {
  return window.__promptPasang || null;
}

function sudahTerpasang() {
  return window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true;
}

function iOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/**
 * Tombol "Pasang aplikasi" tanpa Play Store / App Store.
 * Android & komputer (Chrome/Edge): memunculkan dialog pemasangan bawaan browser.
 * iPhone/iPad (Safari): menampilkan petunjuk "Tambahkan ke Layar Utama".
 */
export default function PasangAplikasi({ ringkas = false }) {
  const [prompt, setPrompt] = useState(ambilPrompt);
  const [terpasang, setTerpasang] = useState(sudahTerpasang);
  const [petunjuk, setPetunjuk] = useState(false);

  useEffect(() => {
    const ada = () => setPrompt(ambilPrompt());
    const pasang = () => setTerpasang(true);
    window.addEventListener('prompt-pasang-siap', ada);
    window.addEventListener('appinstalled', pasang);
    return () => {
      window.removeEventListener('prompt-pasang-siap', ada);
      window.removeEventListener('appinstalled', pasang);
    };
  }, []);

  if (DEMO) return null;
  if (terpasang) return ringkas ? null : <p className="kecil muted">✓ Aplikasi sudah terpasang di perangkat ini.</p>;

  const pasang = async () => {
    if (prompt) {
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') setTerpasang(true);
      window.__promptPasang = null;
      setPrompt(null);
    } else {
      setPetunjuk(true);
    }
  };

  return (
    <div className="kartu" style={{ borderColor: 'var(--primary)' }}>
      <div className="baris ujung">
        <div style={{ flex: 1, minWidth: 180 }}>
          <strong>Pasang BULAT di perangkatmu</strong>
          {!ringkas && <div className="kecil muted">Tanpa Play Store. Bisa dibuka walau tidak ada internet.</div>}
        </div>
        <button className="tombol utama" onClick={pasang}>
          📲 Pasang
        </button>
      </div>
      {petunjuk && (
        <div className="kecil" style={{ marginTop: 10 }}>
          {iOS() ? (
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              <li>Buka halaman ini di <strong>Safari</strong>.</li>
              <li>Ketuk tombol <strong>Bagikan</strong> (kotak dengan panah ke atas).</li>
              <li>Pilih <strong>Tambahkan ke Layar Utama</strong>, lalu <strong>Tambah</strong>.</li>
            </ol>
          ) : (
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              <li>Buka halaman ini di <strong>Chrome</strong> atau <strong>Edge</strong>.</li>
              <li>Ketuk menu <strong>⋮</strong> di pojok kanan atas.</li>
              <li>Pilih <strong>Instal aplikasi</strong> atau <strong>Tambahkan ke layar utama</strong>.</li>
            </ol>
          )}
        </div>
      )}
    </div>
  );
}
