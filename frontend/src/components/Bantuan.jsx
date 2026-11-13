import { useState } from 'react';
import { Lembar } from './ui.jsx';
import { TabelTanda, Tangga, DaftarStrategi } from './Visual.jsx';
import { catatKejadian } from '../lib/db.js';

/** Tombol mengambang "±" berisi kartu Aturan Tanda dan urutan operasi (selalu tersedia). */
export function TombolAturanTanda({ konteks }) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <button
        className="tombol-bantu"
        aria-label="Buka kartu aturan tanda"
        title="Aturan tanda"
        onClick={() => {
          setBuka(true);
          catatKejadian('buka_aturan_tanda', konteks);
        }}
      >
        ±
      </button>
      <Lembar terbuka={buka} tutup={() => setBuka(false)} judul="Aturan Tanda">
        <TabelTanda />
        <h3 style={{ marginTop: 16 }}>Urutan operasi</h3>
        <Tangga />
      </Lembar>
    </>
  );
}

/** Tombol "?" berisi strategi membaca stimulus literasi. */
export function TombolStrategi({ konteks }) {
  const [buka, setBuka] = useState(false);
  return (
    <>
      <button
        className="tombol-bantu"
        aria-label="Buka strategi membaca stimulus"
        title="Strategi membaca stimulus"
        onClick={() => {
          setBuka(true);
          catatKejadian('buka_strategi_stimulus', konteks);
        }}
      >
        ?
      </button>
      <Lembar terbuka={buka} tutup={() => setBuka(false)} judul="Strategi Membaca Stimulus">
        <DaftarStrategi />
      </Lembar>
    </>
  );
}
