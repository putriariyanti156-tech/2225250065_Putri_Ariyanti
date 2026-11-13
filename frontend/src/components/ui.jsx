import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function Kepala({ judul, kembali = '/', kanan = null }) {
  const nav = useNavigate();
  return (
    <header className="kepala">
      {kembali !== null && (
        <button className="tombol-kembali" onClick={() => nav(kembali)} aria-label="Kembali">
          ←
        </button>
      )}
      <h1>{judul}</h1>
      {kanan}
    </header>
  );
}

export function Kaki({ children }) {
  return (
    <div className="kaki">
      <div className="kaki-isi">{children}</div>
    </div>
  );
}

/** Umpan balik: selalu ikon + teks, bukan warna saja. */
export function Umpan({ jenis = 'info', judul, children }) {
  const ikon = jenis === 'benar' ? '✓' : jenis === 'salah' ? '✗' : 'ℹ';
  return (
    <div className={`umpan ${jenis}`} role="status" aria-live="polite">
      <span className="ikon" aria-hidden="true">
        {ikon}
      </span>
      <div>
        {judul && <strong>{judul}</strong>}
        {children && <div>{children}</div>}
      </div>
    </div>
  );
}

export function Pemandu({ children }) {
  if (!children) return null;
  return (
    <div className="pemandu">
      <span className="wajah" aria-hidden="true">
        B
      </span>
      <div>
        <span className="sr-only">Kata Bima, teman belajarmu: </span>
        {children}
      </div>
    </div>
  );
}

/** Lembar bawah (modal) dengan tombol tutup dan tombol Escape. */
export function Lembar({ terbuka, tutup, judul, children }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!terbuka) return undefined;
    const tekan = (e) => e.key === 'Escape' && tutup();
    window.addEventListener('keydown', tekan);
    ref.current?.focus();
    return () => window.removeEventListener('keydown', tekan);
  }, [terbuka, tutup]);
  if (!terbuka) return null;
  return (
    <div className="latar" onClick={tutup}>
      <div
        className="lembar"
        role="dialog"
        aria-modal="true"
        aria-label={judul}
        tabIndex={-1}
        ref={ref}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="baris ujung" style={{ marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>{judul}</h2>
          <button className="tombol tipis" onClick={tutup}>
            Tutup
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Kemajuan({ total, aktif }) {
  return (
    <div className="kemajuan" aria-label={`Bagian ${aktif + 1} dari ${total}`}>
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i <= aktif ? 'aktif' : ''} />
      ))}
    </div>
  );
}

export function Bintang({ n = 0 }) {
  return (
    <span className="bintang" aria-label={`${n} dari 3 bintang`}>
      {'★'.repeat(n)}
      {'☆'.repeat(3 - n)}
    </span>
  );
}
