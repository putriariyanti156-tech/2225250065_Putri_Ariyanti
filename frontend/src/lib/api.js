/** Klien HTTP sederhana ke backend Python (FastAPI). */
import { ambilPengaturan } from './db.js';

async function alamatDasar() {
  const p = await ambilPengaturan();
  return (p.alamatServer || '').replace(/\/+$/, '');
}

export class GalatApi extends Error {
  constructor(pesan, status) {
    super(pesan);
    this.status = status;
  }
}

/**
 * @param {string} jalur - mis. "/api/sinkron"
 * @param {{metode?:string, data?:any, token?:string, tokenPerangkat?:string, mentah?:boolean}} opsi
 */
export async function panggil(jalur, opsi = {}) {
  const header = { Accept: 'application/json' };
  if (opsi.data !== undefined) header['Content-Type'] = 'application/json';
  if (opsi.token) header.Authorization = `Bearer ${opsi.token}`;
  if (opsi.tokenPerangkat) header['X-Token-Perangkat'] = opsi.tokenPerangkat;

  let res;
  try {
    res = await fetch(`${await alamatDasar()}${jalur}`, {
      method: opsi.metode || (opsi.data !== undefined ? 'POST' : 'GET'),
      headers: header,
      body: opsi.data !== undefined ? JSON.stringify(opsi.data) : undefined,
    });
  } catch {
    throw new GalatApi('Tidak dapat terhubung ke server. Periksa koneksi internet.', 0);
  }
  if (!res.ok) {
    let pesan = `Server menjawab dengan galat ${res.status}`;
    try {
      const isi = await res.json();
      if (typeof isi.detail === 'string') pesan = isi.detail;
    } catch {
      /* bukan JSON */
    }
    throw new GalatApi(pesan, res.status);
  }
  if (opsi.mentah) return res;
  return res.status === 204 ? null : res.json();
}
