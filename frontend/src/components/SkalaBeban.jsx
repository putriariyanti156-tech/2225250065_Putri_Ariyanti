import { useState } from 'react';

const LABEL = [
  'Sangat-sangat ringan',
  'Sangat ringan',
  'Ringan',
  'Agak ringan',
  'Sedang',
  'Agak berat',
  'Berat',
  'Sangat berat',
  'Sangat-sangat berat',
];

/** Skala usaha mental Paas (1–9), satu butir. */
export default function SkalaBeban({ kirim }) {
  const [skor, setSkor] = useState(null);
  return (
    <div className="tumpuk">
      <p style={{ margin: 0 }}>
        <strong>Seberapa besar usaha pikiranmu saat mempelajari modul ini?</strong>
      </p>
      <div className="skala" role="radiogroup" aria-label="Skala usaha mental 1 sampai 9">
        {LABEL.map((l, i) => (
          <button key={l} role="radio" aria-checked={skor === i + 1} aria-pressed={skor === i + 1} aria-label={`${i + 1}: ${l}`} onClick={() => setSkor(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
      <div className="baris ujung kecil muted">
        <span>1 = sangat-sangat ringan</span>
        <span>9 = sangat-sangat berat</span>
      </div>
      <p aria-live="polite" style={{ minHeight: '1.5em', margin: 0 }}>
        {skor && (
          <>
            Pilihanmu: <strong>{skor} — {LABEL[skor - 1]}</strong>
          </>
        )}
      </p>
      <button className="tombol utama penuh" disabled={!skor} onClick={() => kirim(skor)}>
        Simpan dan selesaikan modul
      </button>
    </div>
  );
}
