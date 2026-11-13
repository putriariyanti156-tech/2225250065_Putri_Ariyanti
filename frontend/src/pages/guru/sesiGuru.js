/** Penyimpanan sesi login guru (token JWT) di browser. */
const KUNCI = 'bulat-guru';

export function ambilSesi() {
  try {
    return JSON.parse(localStorage.getItem(KUNCI) || 'null');
  } catch {
    return null;
  }
}

export function simpanSesi(sesi) {
  try {
    if (sesi) localStorage.setItem(KUNCI, JSON.stringify(sesi));
    else localStorage.removeItem(KUNCI);
  } catch {
    /* penyimpanan tidak tersedia */
  }
}
