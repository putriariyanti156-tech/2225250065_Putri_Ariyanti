/**
 * Validasi konten: setiap kunci jawaban harus cocok dengan mesin matematika,
 * dan setiap butir literasi harus berlabel indikator/konteks/level AKM.
 * Jalankan: npm run validate:content
 */
import { describe, it, expect } from 'vitest';
import { MODUL, STIMULUS, TES, MISKONSEPSI, ambilStimulus, ambilContoh } from '../src/lib/konten.js';
import { hitungEkspresi } from '../src/lib/math/parser.js';
import { selesaikan } from '../src/lib/math/stepper.js';

const INDIKATOR = ['LM1', 'LM2', 'LM3', 'LM4'];
const KONTEKS = ['personal', 'sosial-budaya', 'saintifik'];
const LEVEL = ['pemahaman', 'penerapan', 'penalaran'];
const BENTUK = ['pg', 'pgKompleksBS', 'pgKompleksMulti', 'menjodohkan', 'isian', 'pilihAlasan', 'uraian'];

function cekButirLiterasi(b) {
  expect(BENTUK, `${b.id} bentuk`).toContain(b.bentuk);
  expect(b.indikator.length, `${b.id} indikator`).toBeGreaterThan(0);
  b.indikator.forEach((i) => expect(INDIKATOR).toContain(i));
  expect(LEVEL, `${b.id} levelAkm`).toContain(b.levelAkm);
  if (b.bentuk === 'isian') expect(hitungEkspresi(b.modelPembahasan), `${b.id}`).toBe(b.kunci);
  if (b.bentuk === 'pg') expect(b.kunci).toBeLessThan(b.opsi.length);
  if (b.bentuk === 'pgKompleksMulti') b.kunci.forEach((k) => expect(k).toBeLessThan(b.opsi.length));
  if (b.bentuk === 'menjodohkan') {
    expect(b.kunci.length).toBe(b.kiri.length);
    expect(new Set(b.kunci).size).toBe(b.kunci.length);
  }
  if (b.bentuk === 'pilihAlasan') expect(b.kunciAlasan).toBeLessThan(b.opsiAlasan.length);
}

describe('modul', () => {
  const idSoal = new Set();
  for (const m of MODUL) {
    describe(m.id, () => {
      it('memiliki kartu dengan teks singkat (≤ 45 kata)', () => {
        expect(m.kartu.length).toBeGreaterThan(0);
        m.kartu.forEach((k) => expect(k.teks.split(/\s+/).length, k.judul).toBeLessThanOrEqual(45));
      });
      it('contoh otomatis dapat diselesaikan dan contoh berisi isian valid', () => {
        [...m.contoh.lengkap, ...m.contoh.berlubang].forEach((c) => {
          if (c.otomatis) expect(() => selesaikan(c.soal)).not.toThrow();
          else expect(c.langkah.length).toBeGreaterThan(0);
        });
      });
      it('kunci latihan cocok dengan mesin matematika', () => {
        m.latihan.forEach((s) => {
          expect(idSoal.has(s.id), `id ganda ${s.id}`).toBe(false);
          idSoal.add(s.id);
          if (s.tipe === 'ekspresi') expect(hitungEkspresi(s.soal), s.id).toBe(s.jawaban);
          if (s.tipe === 'cerita') {
            expect(hitungEkspresi(s.model), s.id).toBe(s.jawaban);
            expect(s.pilihanModel[s.kunciModel], s.id).toBe(s.model);
          }
          if (s.tipe === 'pilihan') expect(s.kunci).toBeLessThan(s.opsi.length);
          (s.umpanBalikKhusus || []).forEach((u) => {
            expect(MISKONSEPSI[u.miskonsepsi], `${s.id} ${u.miskonsepsi}`).toBeTruthy();
            expect(u.jawaban, `${s.id} umpan balik tidak boleh sama dengan kunci`).not.toBe(s.jawaban);
          });
          if (s.contohMirip) expect(ambilContoh(s.contohMirip), `${s.id} → ${s.contohMirip}`).toBeTruthy();
        });
      });
      it('stimulus literasi ada', () => {
        expect(m.literasi.length).toBeGreaterThan(0);
        m.literasi.forEach((id) => expect(ambilStimulus(id), id).toBeTruthy());
      });
    });
  }
});

describe('stimulus literasi', () => {
  for (const s of STIMULUS) {
    it(`${s.id} valid`, () => {
      expect(KONTEKS).toContain(s.konteks);
      expect(typeof s.dataIlustratif).toBe('boolean');
      if (s.tabel) expect(s.tabel.baris.length).toBeLessThanOrEqual(5);
      s.butir.forEach(cekButirLiterasi);
    });
  }
});

describe('tes', () => {
  for (const jenis of ['prasyarat', 'pretest', 'posttest']) {
    it(`${jenis}: kunci cocok`, () => {
      TES[jenis].butir.forEach((b) => {
        if (b.tipe === 'isian') expect(hitungEkspresi(b.model), b.id).toBe(b.jawaban);
      });
    });
  }
  it('pretest dan posttest paralel (jumlah sama)', () => {
    expect(TES.pretest.butir.length).toBe(TES.posttest.butir.length);
  });
  for (const jenis of ['literasiPre', 'literasiPost']) {
    it(`${jenis}: satu butir per indikator LM1–LM4`, () => {
      const st = TES[jenis].stimulus;
      st.butir.forEach(cekButirLiterasi);
      expect(st.butir.flatMap((b) => b.indikator).sort()).toEqual(INDIKATOR);
    });
  }
});
