/** Format bilangan dan ekspresi dengan tanda minus asli (−) dan kali (×). */

/** @param {number} v */
export function fmt(v) {
  return v < 0 ? `−${-v}` : String(v);
}

/** Bilangan negatif di tengah ekspresi diberi kurung: (−5). */
export function fmtOperand(v, pertama = false) {
  return v < 0 && !pertama ? `(${fmt(v)})` : fmt(v);
}

/** Mengubah jawaban siswa ("−12", "-12", " 12 ") menjadi angka, atau null. */
export function bacaAngka(teks) {
  if (teks === null || teks === undefined) return null;
  const s = String(teks).trim().replace(/[−–]/g, '-').replace(/\s/g, '');
  if (!/^-?\d+$/.test(s)) return null;
  const n = Number(s);
  return n === 0 ? 0 : n;
}

/**
 * Menulis AST menjadi teks dan (opsional) mencari rentang karakter node target
 * untuk disorot.
 * @param {import('./parser.js').Node} ast
 * @param {object|null} target
 * @returns {{teks:string, rentang:[number,number]|null}}
 */
export function tulis(ast, target = null) {
  let out = '';
  let rentang = null;

  function jalan(node, pertama) {
    const awal = out.length;
    switch (node.type) {
      case 'num':
        out += fmtOperand(node.value, pertama);
        break;
      case 'group':
        out += '(';
        jalan(node.expr, true);
        out += ')';
        break;
      case 'neg':
        out += '−';
        jalan(node.expr, false);
        break;
      case 'bin':
        jalan(node.left, pertama);
        out += ` ${node.op} `;
        jalan(node.right, false);
        break;
      default:
        break;
    }
    if (node === target) rentang = [awal, out.length];
  }

  jalan(ast, true);
  return { teks: out, rentang };
}

/** Menormalkan penulisan ekspresi dari konten. */
export function rapikan(teks) {
  return teks.replace(/-/g, '−').replace(/\*/g, '×').replace(/\//g, ':');
}
