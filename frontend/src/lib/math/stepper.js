/**
 * Penyelesai langkah demi langkah sesuai urutan operasi yang diajarkan:
 * ① kurung → ② × dan : (setara, dari kiri) → ③ + dan − (setara, dari kiri).
 */
import { parse, hitung, nol } from './parser.js';
import { tulis, fmt, fmtOperand } from './format.js';

/**
 * Meratakan satu "tingkat" ekspresi menjadi deret operand dan operator
 * (tidak masuk ke dalam kurung).
 */
export function ratakan(node, daftar = []) {
  if (node.type === 'bin') {
    ratakan(node.left, daftar);
    daftar.push({ jenis: 'op', op: node.op, node });
    ratakan(node.right, daftar);
  } else {
    daftar.push({ jenis: 'operand', node });
  }
  return daftar;
}

const kaliBagi = (op) => op === '×' || op === ':';

/** Mencari operasi yang harus dikerjakan berikutnya. */
export function cariLangkah(level, dalamKurung = false) {
  const daftar = ratakan(level);
  for (const it of daftar) {
    if (it.jenis === 'operand' && it.node.type !== 'num') {
      return cariLangkah(it.node.expr, true);
    }
  }
  const ops = daftar.filter((i) => i.jenis === 'op');
  if (!ops.length) return null;
  const kb = ops.filter((o) => kaliBagi(o.op));
  const tk = ops.filter((o) => !kaliBagi(o.op));
  const pilih = kb[0] || tk[0];
  return {
    target: pilih.node,
    dalamKurung,
    kategori: kaliBagi(pilih.op) ? 'kaliBagi' : 'tambahKurang',
    jumlahKaliBagi: kb.length,
    jumlahTambahKurang: tk.length,
  };
}

/** Kalimat alasan untuk sebuah langkah. */
export function alasanLangkah(s) {
  const bagian = [];
  if (s.dalamKurung) bagian.push('Kerjakan bagian di dalam tanda kurung lebih dulu.');
  if (s.kategori === 'kaliBagi') {
    if (s.jumlahKaliBagi > 1) bagian.push('Kali dan bagi setara, kerjakan dari kiri.');
    else if (s.jumlahTambahKurang > 0)
      bagian.push('Kali dan bagi dikerjakan sebelum tambah dan kurang.');
  } else if (s.jumlahTambahKurang > 1) {
    bagian.push('Tambah dan kurang setara, kerjakan dari kiri.');
  }
  return bagian.join(' ');
}

/** Penjelasan tanda untuk kali/bagi, mis. "negatif × positif = negatif". */
export function penjelasanTanda(op, a, b) {
  if (!kaliBagi(op) || a === 0 || b === 0) return '';
  const nama = (v) => (v < 0 ? 'negatif' : 'positif');
  const hasil = a < 0 === b < 0 ? 'positif' : 'negatif';
  return `Tanda: ${nama(a)} ${op} ${nama(b)} = ${hasil}.`;
}

function ganti(node, target, pengganti) {
  if (node === target) return pengganti;
  switch (node.type) {
    case 'bin':
      return {
        ...node,
        left: ganti(node.left, target, pengganti),
        right: ganti(node.right, target, pengganti),
      };
    case 'group': {
      const isi = ganti(node.expr, target, pengganti);
      return isi.type === 'num' ? isi : { type: 'group', expr: isi };
    }
    case 'neg': {
      const isi = ganti(node.expr, target, pengganti);
      return isi.type === 'num' ? { type: 'num', value: nol(-isi.value) } : { type: 'neg', expr: isi };
    }
    default:
      return node;
  }
}

/** Menerapkan satu langkah: node target diganti hasilnya. */
export function terapkan(ast, target, nilai) {
  return ganti(ast, target, { type: 'num', value: nilai });
}

/**
 * @typedef {Object} Langkah
 * @property {string} ekspresiSebelum
 * @property {[number,number]} bagianAktif
 * @property {string} operasi
 * @property {number} kiri
 * @property {number} kanan
 * @property {string} bagianTeks      - mis. "(−5) × 3"
 * @property {number} hasilBagian
 * @property {string} ekspresiSesudah
 * @property {string} alasan
 * @property {string} tanda
 */

/**
 * @param {string|object} sumber - teks ekspresi atau AST
 * @returns {{langkah: Langkah[], hasil: number}}
 */
export function selesaikan(sumber) {
  let ast = typeof sumber === 'string' ? parse(sumber) : sumber;
  const langkah = [];
  let batas = 50;
  while (ast.type !== 'num' && batas-- > 0) {
    const s = cariLangkah(ast);
    if (!s) break;
    const { left, right, op } = s.target;
    const hasilBagian = hitung(op, left.value, right.value);
    const { teks, rentang } = tulis(ast, s.target);
    const baru = terapkan(ast, s.target, hasilBagian);
    langkah.push({
      ekspresiSebelum: teks,
      bagianAktif: rentang,
      operasi: op,
      kiri: left.value,
      kanan: right.value,
      bagianTeks: `${fmtOperand(left.value, true)} ${op} ${fmtOperand(right.value)}`,
      hasilBagian,
      ekspresiSesudah: tulis(baru).teks,
      alasan: alasanLangkah(s),
      tanda: penjelasanTanda(op, left.value, right.value),
    });
    ast = baru;
  }
  if (ast.type !== 'num') throw new Error('Ekspresi tidak dapat diselesaikan');
  return { langkah, hasil: ast.value };
}

/**
 * Pilihan operasi yang bisa diketuk siswa (pasangan bilangan bersebelahan),
 * dari tingkat luar maupun di dalam kurung.
 */
export function kandidat(ast) {
  const hasil = [];
  function kumpul(level, dalamKurung) {
    const daftar = ratakan(level);
    daftar.forEach((it, i) => {
      if (it.jenis === 'operand' && it.node.type !== 'num') kumpul(it.node.expr, true);
      if (it.jenis !== 'op') return;
      const kiri = daftar[i - 1];
      const kanan = daftar[i + 1];
      if (kiri?.node.type === 'num' && kanan?.node.type === 'num') {
        hasil.push({
          node: it.node,
          op: it.op,
          dalamKurung,
          urutan: i,
          teks: `${fmtOperand(kiri.node.value, true)} ${it.op} ${fmtOperand(kanan.node.value)}`,
        });
      }
    });
  }
  kumpul(ast, false);
  return hasil;
}

/** Pesan bila siswa memilih operasi yang salah. */
export function pesanPilihanSalah(ast, dipilih) {
  const s = cariLangkah(ast);
  if (!s) return '';
  if (s.dalamKurung && !dipilih.dalamKurung) return 'Ada tanda kurung. Kerjakan bagian di dalam kurung lebih dulu.';
  if (s.kategori === 'kaliBagi' && !kaliBagi(dipilih.op))
    return 'Masih ada kali atau bagi. Kali dan bagi dikerjakan sebelum tambah dan kurang.';
  if (s.kategori === 'kaliBagi') return 'Kali dan bagi setara. Kerjakan yang paling kiri lebih dulu.';
  return 'Tambah dan kurang setara. Kerjakan yang paling kiri lebih dulu.';
}

export { fmt };
