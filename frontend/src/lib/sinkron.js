/**
 * Sinkronisasi offline-first: data menunggu di tabel `antrian`, lalu dikirim
 * per batch ke backend saat online. ID dibuat di perangkat, sehingga
 * pengiriman ulang tidak menggandakan data.
 */
import { db, ambilProfil } from './db.js';
import { panggil } from './api.js';

const UKURAN_BATCH = 100;
let sedangBerjalan = false;

export async function jumlahMenunggu() {
  return db.antrian.count();
}

/** @returns {Promise<{status:'lewat'|'kosong'|'selesai'|'gagal', terkirim?:number, pesan?:string}>} */
export async function sinkronkan() {
  if (sedangBerjalan) return { status: 'lewat' };
  const profil = await ambilProfil();
  if (!profil?.tokenPerangkat) return { status: 'lewat', pesan: 'Belum bergabung ke kelas.' };
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return { status: 'lewat', pesan: 'Sedang offline.' };

  sedangBerjalan = true;
  let terkirim = 0;
  try {
    for (;;) {
      const batch = await db.antrian.limit(UKURAN_BATCH).toArray();
      if (!batch.length) break;
      await panggil('/api/sinkron', {
        data: { item: batch.map((b) => ({ tabel: b.tabel, data: b.data })) },
        tokenPerangkat: profil.tokenPerangkat,
      });
      await db.antrian.bulkDelete(batch.map((b) => b.no));
      terkirim += batch.length;
    }
    return { status: terkirim ? 'selesai' : 'kosong', terkirim };
  } catch (e) {
    return { status: 'gagal', terkirim, pesan: e.message };
  } finally {
    sedangBerjalan = false;
  }
}

/** Menjalankan sinkronisasi otomatis: saat online kembali dan berkala. */
export function mulaiSinkronOtomatis() {
  const jalan = () => sinkronkan().catch(() => {});
  window.addEventListener('online', jalan);
  const timer = setInterval(jalan, 60_000);
  jalan();
  return () => {
    window.removeEventListener('online', jalan);
    clearInterval(timer);
  };
}
