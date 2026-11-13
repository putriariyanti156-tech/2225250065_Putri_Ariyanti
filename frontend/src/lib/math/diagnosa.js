/**
 * Menebak miskonsepsi dari jawaban salah dengan mensimulasikan strategi keliru.
 */
import { parse, evaluate, hitung, nol } from './parser.js';
import { ratakan } from './stepper.js';
import miskonsepsi from '../../content/miskonsepsi.json';

/** Evaluasi satu tingkat dengan urutan prioritas operator tertentu. */
function evalDenganUrutan(node, urutan) {
  if (node.type === 'num') return node.value;
  if (node.type === 'group') return evalDenganUrutan(node.expr, urutan);
  if (node.type === 'neg') return nol(-evalDenganUrutan(node.expr, urutan));
  const daftar = ratakan(node);
  const nilai = [];
  const ops = [];
  daftar.forEach((it) => {
    if (it.jenis === 'op') ops.push(it.op);
    else nilai.push(evalDenganUrutan(it.node, urutan));
  });
  for (const kelompok of urutan) {
    let i = 0;
    while (i < ops.length) {
      if (kelompok.includes(ops[i])) {
        nilai.splice(i, 2, hitung(ops[i], nilai[i], nilai[i + 1]));
        ops.splice(i, 1);
      } else i++;
    }
  }
  return nilai[0];
}

function aman(fn) {
  try {
    return fn();
  } catch {
    return null;
  }
}

/** Mengurangi bilangan negatif dianggap mengurangi bilangan positif: a − (−b) → a − b. */
function hilangkanNegatifSetelahKurang(node) {
  switch (node.type) {
    case 'bin': {
      let right = hilangkanNegatifSetelahKurang(node.right);
      if (node.op === '−' && right.type === 'num' && right.value < 0) right = { type: 'num', value: -right.value };
      return { ...node, left: hilangkanNegatifSetelahKurang(node.left), right };
    }
    case 'group':
    case 'neg':
      return { ...node, expr: hilangkanNegatifSetelahKurang(node.expr) };
    default:
      return node;
  }
}

function jenisOperasi(node, set = new Set()) {
  if (node.type === 'bin') {
    set.add(node.op);
    jenisOperasi(node.left, set);
    jenisOperasi(node.right, set);
  } else if (node.type !== 'num') jenisOperasi(node.expr, set);
  return set;
}

export function strategiSalah(src) {
  const ast = parse(src);
  return {
    kiriKeKanan: aman(() => evalDenganUrutan(ast, [['×', ':', '+', '−']])),
    kakuKukabataku: aman(() => evalDenganUrutan(ast, [['×'], [':'], ['+'], ['−']])),
    kurangNegatif: aman(() => evaluate(hilangkanNegatifSetelahKurang(ast))),
  };
}

/**
 * @param {string} src - ekspresi soal (atau model)
 * @param {number} jawaban
 * @param {{jawaban:number, miskonsepsi:string, pesan?:string}[]} khusus
 * @returns {{kode:string, pesan:string}|null}
 */
export function diagnosa(src, jawaban, khusus = []) {
  const benar = aman(() => evaluate(parse(src)));
  if (benar === null || jawaban === benar) return null;

  const k = khusus.find((x) => x.jawaban === jawaban);
  if (k) return { kode: k.miskonsepsi, pesan: k.pesan || miskonsepsi[k.miskonsepsi]?.pesan || '' };

  const s = strategiSalah(src);
  const cocok = (v) => v !== null && v !== benar && v === jawaban;
  let kode = null;
  if (cocok(s.kiriKeKanan)) kode = 'MK-06';
  else if (cocok(s.kakuKukabataku)) kode = 'MK-07';
  else if (cocok(s.kurangNegatif)) kode = 'MK-03';
  else if (benar !== 0 && jawaban === -benar) {
    const ops = jenisOperasi(parse(src));
    kode = ops.has('+') || ops.has('−') ? 'MK-02' : 'MK-04';
  }
  if (!kode) return null;
  return { kode, pesan: miskonsepsi[kode]?.pesan || '' };
}
