import { describe, it, expect } from 'vitest';
import { hitungEkspresi, parse } from '../src/lib/math/parser.js';
import { selesaikan, kandidat, pesanPilihanSalah } from '../src/lib/math/stepper.js';
import { diagnosa } from '../src/lib/math/diagnosa.js';
import { bacaAngka, tulis } from '../src/lib/math/format.js';

describe('evaluasi', () => {
  const kasus = [
    ['−8 + 15', 7],
    ['−7 × (−6)', 42],
    ['12 − (−5)', 17],
    ['20 : (−4)', -5],
    ['−12 : 3 + (−4) × 2', -12],
    ['15 − (−5) × 3 + 10', 40],
    ['5 × (−2 + 7) : (−5)', -5],
    ['−6 + (15 : 3) × 2', 4],
    ['12 : 3 × 2', 8],
    ['10 − 3 + 2', 9],
    ['24 : (−6) × 2', -8],
    ['−2 × (5 − (−3))', -16],
    ['3 × (−4 + 10) − 18 : (−3)', 24],
    ['−(12 + 8)', -20],
    ['-3 * -4', 12],
    ['0 : (−6)', 0],
  ];
  it.each(kasus)('%s = %d', (src, hasil) => {
    expect(hitungEkspresi(src)).toBe(hasil);
  });

  it('menolak pembagian tak habis dan pembagian nol', () => {
    expect(() => hitungEkspresi('7 : 2')).toThrow();
    expect(() => hitungEkspresi('5 : 0')).toThrow();
  });
  it('menolak ekspresi rusak', () => {
    expect(() => parse('3 + ')).toThrow();
    expect(() => parse('(3 + 4')).toThrow();
    expect(() => parse('3 a 4')).toThrow();
  });
});

describe('langkah demi langkah', () => {
  it('15 − (−5) × 3 + 10: kali dulu, lalu dari kiri', () => {
    const { langkah, hasil } = selesaikan('15 − (−5) × 3 + 10');
    expect(hasil).toBe(40);
    expect(langkah.map((l) => l.ekspresiSesudah)).toEqual(['15 − (−15) + 10', '30 + 10', '40']);
    expect(langkah[0].bagianTeks).toBe('−5 × 3');
    expect(langkah[0].alasan).toMatch(/sebelum tambah dan kurang/);
  });
  it('kurung dikerjakan lebih dulu', () => {
    const { langkah } = selesaikan('5 × (−2 + 7) : (−5)');
    expect(langkah[0].ekspresiSesudah).toBe('5 × 5 : (−5)');
    expect(langkah[0].alasan).toMatch(/kurung/);
    expect(langkah[1].ekspresiSesudah).toBe('25 : (−5)');
  });
  it('kali dan bagi setara dari kiri', () => {
    const { langkah } = selesaikan('12 : 3 × 2');
    expect(langkah[0].bagianTeks).toBe('12 : 3');
    expect(langkah[0].alasan).toMatch(/setara/);
  });
  it('rentang sorotan tepat', () => {
    const { langkah } = selesaikan('8 + 4 × (−3)');
    const [a, b] = langkah[0].bagianAktif;
    expect(langkah[0].ekspresiSebelum.slice(a, b)).toBe('4 × (−3)');
  });
  it('kandidat pilihan dan pesan salah', () => {
    const ast = parse('15 − (−5) × 3 + 10');
    const k = kandidat(ast);
    expect(k.map((x) => x.teks)).toEqual(['15 − (−5)', '−5 × 3', '3 + 10']);
    expect(pesanPilihanSalah(ast, k[0])).toMatch(/sebelum tambah/);
  });
  it('kurung bertingkat', () => {
    const { hasil, langkah } = selesaikan('−2 × (5 − (−3))');
    expect(hasil).toBe(-16);
    expect(langkah[0].ekspresiSesudah).toBe('−2 × 8');
  });
});

describe('diagnosa miskonsepsi', () => {
  it('mengerjakan dari kiri → MK-06', () => {
    expect(diagnosa('15 − (−5) × 3 + 10', 70)?.kode).toBe('MK-06');
    expect(diagnosa('−12 : 3 + (−4) × 2', -16)?.kode).toBe('MK-06');
  });
  it('KUKABATAKU kaku → MK-07', () => {
    expect(diagnosa('24 : (−6) × 2', -2)?.kode).toBe('MK-07');
    expect(diagnosa('10 − 3 + 2', 5)?.kode).toBe('MK-07');
  });
  it('mengurangi negatif → MK-03', () => {
    expect(diagnosa('12 − (−5)', 7)?.kode).toBe('MK-03');
  });
  it('tanda terbalik pada kali → MK-04', () => {
    expect(diagnosa('−7 × (−6)', -42)?.kode).toBe('MK-04');
  });
  it('umpan balik khusus diutamakan', () => {
    expect(diagnosa('−8 + 15', -23, [{ jawaban: -23, miskonsepsi: 'MK-01' }])?.kode).toBe('MK-01');
  });
  it('jawaban benar → null', () => {
    expect(diagnosa('−8 + 15', 7)).toBeNull();
  });
});

describe('format', () => {
  it('membaca jawaban siswa', () => {
    expect(bacaAngka('−12')).toBe(-12);
    expect(bacaAngka('-0')).toBe(0);
    expect(bacaAngka('1a')).toBeNull();
  });
  it('menulis ulang ekspresi', () => {
    expect(tulis(parse('-12:3+(-4)*2')).teks).toBe('−12 : 3 + (−4) × 2');
  });
});
