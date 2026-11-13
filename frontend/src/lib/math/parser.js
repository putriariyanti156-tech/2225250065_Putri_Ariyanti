/**
 * Tokenizer, parser, dan evaluator ekspresi bilangan bulat.
 * TIDAK memakai eval(); presedensi: kurung → × : (setara, dari kiri) → + − (setara, dari kiri).
 */

/**
 * @typedef {{type:'num', value:number}} NodeNum
 * @typedef {{type:'group', expr:Node}} NodeGroup
 * @typedef {{type:'neg', expr:Node}} NodeNeg
 * @typedef {{type:'bin', op:'+'|'−'|'×'|':', left:Node, right:Node}} NodeBin
 * @typedef {NodeNum|NodeGroup|NodeNeg|NodeBin} Node
 */

const OPERATOR = {
  '+': '+',
  '-': '−',
  '−': '−',
  '–': '−',
  '×': '×',
  '*': '×',
  x: '×',
  X: '×',
  '·': '×',
  ':': ':',
  '/': ':',
  '÷': ':',
};

/** @param {string} src */
export function tokenize(src) {
  const tokens = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < src.length && /[0-9]/.test(src[j])) j++;
      tokens.push({ type: 'num', value: Number(src.slice(i, j)) });
      i = j;
      continue;
    }
    if (c === '(' || c === '[') {
      tokens.push({ type: 'lp' });
      i++;
      continue;
    }
    if (c === ')' || c === ']') {
      tokens.push({ type: 'rp' });
      i++;
      continue;
    }
    if (OPERATOR[c]) {
      tokens.push({ type: 'op', value: OPERATOR[c] });
      i++;
      continue;
    }
    throw new Error(`Karakter tidak dikenal: "${c}"`);
  }
  return tokens;
}

/**
 * @param {string} src
 * @returns {Node}
 */
export function parse(src) {
  const t = tokenize(src);
  let p = 0;
  const peek = () => t[p];
  const next = () => t[p++];
  const isOp = (...ops) => peek() && peek().type === 'op' && ops.includes(peek().value);

  function expr() {
    let left = term();
    while (isOp('+', '−')) {
      const op = next().value;
      left = { type: 'bin', op, left, right: term() };
    }
    return left;
  }
  function term() {
    let left = factor();
    while (isOp('×', ':')) {
      const op = next().value;
      left = { type: 'bin', op, left, right: factor() };
    }
    return left;
  }
  function factor() {
    const tk = next();
    if (!tk) throw new Error('Ekspresi belum lengkap');
    if (tk.type === 'num') return { type: 'num', value: tk.value };
    if (tk.type === 'op' && tk.value === '−') {
      const f = factor();
      if (f.type === 'num') return { type: 'num', value: nol(-f.value) };
      return { type: 'neg', expr: f };
    }
    if (tk.type === 'op' && tk.value === '+') return factor();
    if (tk.type === 'lp') {
      const e = expr();
      const r = next();
      if (!r || r.type !== 'rp') throw new Error('Tanda kurung belum ditutup');
      return e.type === 'num' ? e : { type: 'group', expr: e };
    }
    throw new Error('Susunan ekspresi tidak valid');
  }

  const ast = expr();
  if (p < t.length) throw new Error('Susunan ekspresi tidak valid');
  return ast;
}

/** Menghindari −0. */
export function nol(v) {
  return v === 0 ? 0 : v;
}

/**
 * @param {'+'|'−'|'×'|':'} op
 * @param {number} a
 * @param {number} b
 */
export function hitung(op, a, b) {
  switch (op) {
    case '+':
      return nol(a + b);
    case '−':
      return nol(a - b);
    case '×':
      return nol(a * b);
    case ':':
      if (b === 0) throw new Error('Pembagian dengan nol tidak terdefinisi');
      if (a % b !== 0) throw new Error('Hasil pembagian bukan bilangan bulat');
      return nol(a / b);
    default:
      throw new Error(`Operasi tidak dikenal: ${op}`);
  }
}

/** @param {Node} node @returns {number} */
export function evaluate(node) {
  switch (node.type) {
    case 'num':
      return node.value;
    case 'group':
      return evaluate(node.expr);
    case 'neg':
      return nol(-evaluate(node.expr));
    case 'bin':
      return hitung(node.op, evaluate(node.left), evaluate(node.right));
    default:
      throw new Error('Node tidak dikenal');
  }
}

/** @param {string} src */
export function hitungEkspresi(src) {
  return evaluate(parse(src));
}
