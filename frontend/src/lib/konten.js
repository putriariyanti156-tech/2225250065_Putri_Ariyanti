/** Memuat seluruh konten (materi, soal, stimulus, tes) yang dibundel di aplikasi. */
import M0 from '../content/modul/M0.json';
import M1 from '../content/modul/M1.json';
import M2 from '../content/modul/M2.json';
import M3 from '../content/modul/M3.json';
import M4 from '../content/modul/M4.json';
import M5 from '../content/modul/M5.json';
import M6 from '../content/modul/M6.json';
import M7 from '../content/modul/M7.json';
import stimulus from '../content/literasi/stimulus.json';
import tes from '../content/tes/tes.json';
import miskonsepsi from '../content/miskonsepsi.json';

export const MODUL = [M0, M1, M2, M3, M4, M5, M6, M7];
export const STIMULUS = stimulus;
export const TES = tes;
export const MISKONSEPSI = miskonsepsi;

export function ambilModul(id) {
  return MODUL.find((m) => m.id === id) || null;
}

export function ambilStimulus(id) {
  return STIMULUS.find((s) => s.id === id) || null;
}

/** Mencari contoh (lengkap/berlubang) di semua modul berdasarkan id. */
export function ambilContoh(id) {
  for (const m of MODUL) {
    const semua = [...(m.contoh?.lengkap || []), ...(m.contoh?.berlubang || [])];
    const c = semua.find((x) => x.id === id);
    if (c) return c;
  }
  return null;
}

export const NAMA_INDIKATOR = {
  LM1: 'Merumuskan',
  LM2: 'Menerapkan',
  LM3: 'Menafsirkan',
  LM4: 'Mengevaluasi & bernalar',
};

export const NAMA_KONTEKS = {
  personal: 'Personal',
  'sosial-budaya': 'Sosial budaya',
  saintifik: 'Saintifik',
};
