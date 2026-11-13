/** Ekspor data belajar ke CSV dari perangkat (cadangan bila tidak memakai server). */
import { db, ambilProfil } from './db.js';

const KOLOM = [
  'tabel', 'kodeSiswa', 'kelas', 'id', 'waktu', 'jenis', 'modulId', 'soalId', 'butirId',
  'jawaban', 'benar', 'skor', 'indikator', 'miskonsepsi', 'petunjukDibuka', 'yakin',
  'durasiDetik', 'teksUraian', 'status', 'bintang',
];

function sel(v) {
  if (v === null || v === undefined) return '';
  const s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function buatCsv() {
  const profil = (await ambilProfil()) || {};
  const baris = [KOLOM.join(',')];
  const tambah = (tabel, r) =>
    baris.push(
      KOLOM.map((k) => {
        if (k === 'tabel') return tabel;
        if (k === 'kodeSiswa') return sel(profil.kodeSiswa);
        if (k === 'kelas') return sel(profil.kelas);
        if (k === 'id' && tabel === 'progres') return sel(r.modulId);
        if (k === 'waktu' && tabel === 'progres') return sel(r.diperbarui);
        return sel(r[k]);
      }).join(','),
    );
  for (const tabel of ['hasilTes', 'percobaan', 'jawabanLiterasi', 'bebanKognitif', 'progres']) {
    (await db.table(tabel).toArray()).forEach((r) => tambah(tabel, r));
  }
  return '﻿' + baris.join('\n');
}

export async function unduhCsv() {
  const csv = await buatCsv();
  const profil = (await ambilProfil()) || {};
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bulat-${profil.kodeSiswa || 'siswa'}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
