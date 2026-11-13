/** Penyimpanan di perangkat (IndexedDB via Dexie). Semua data tetap ada walau offline. */
import Dexie from 'dexie';

export const db = new Dexie('bulat');

db.version(1).stores({
  profil: 'id',
  pengaturan: 'id',
  hasilTes: 'id, jenis, waktu',
  percobaan: 'id, soalId, modulId, waktu',
  progres: 'modulId',
  bebanKognitif: 'id, modulId, waktu',
  jawabanLiterasi: 'id, butirId, waktu',
  kejadian: 'id, jenis, waktu',
  antrian: '++no, tabel',
});

/** Tabel yang ikut dikirim ke server. */
export const TABEL_SINKRON = ['hasilTes', 'percobaan', 'progres', 'bebanKognitif', 'jawabanLiterasi', 'kejadian'];

export function buatId() {
  try {
    if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  } catch {
    /* konteks tidak aman: pakai cadangan */
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export const sekarang = () => new Date().toISOString();

/** Menyimpan satu rekaman dan memasukkannya ke antrean sinkronisasi. */
export async function simpan(tabel, data) {
  const rekaman = { id: buatId(), waktu: sekarang(), ...data };
  await db.transaction('rw', db.table(tabel), db.antrian, async () => {
    await db.table(tabel).put(rekaman);
    if (TABEL_SINKRON.includes(tabel)) await db.antrian.add({ tabel, data: rekaman });
  });
  return rekaman;
}

export async function catatKejadian(jenis, konteks = {}) {
  try {
    await simpan('kejadian', { jenis, konteks });
  } catch {
    /* log tidak boleh mengganggu belajar */
  }
}

// ---------- profil & pengaturan ----------

export async function ambilProfil() {
  return (await db.profil.get('saya')) || null;
}

export async function simpanProfil(perubahan) {
  const lama = (await ambilProfil()) || { id: 'saya', dibuatPada: sekarang() };
  const baru = { ...lama, ...perubahan, id: 'saya' };
  await db.profil.put(baru);
  return baru;
}

const PENGATURAN_AWAL = {
  id: 'utama',
  ukuranHuruf: 'normal',
  instrumenPenelitianAktif: true,
  alamatServer: '',
};

export async function ambilPengaturan() {
  return { ...PENGATURAN_AWAL, ...((await db.pengaturan.get('utama')) || {}) };
}

export async function simpanPengaturan(perubahan) {
  const baru = { ...(await ambilPengaturan()), ...perubahan, id: 'utama' };
  await db.pengaturan.put(baru);
  return baru;
}

// ---------- progres ----------

export async function ambilProgres(modulId) {
  return (await db.progres.get(modulId)) || { modulId, status: 'belum', bintang: 0, tahap: null };
}

export async function simpanProgres(modulId, perubahan) {
  const lama = await ambilProgres(modulId);
  const baru = { ...lama, ...perubahan, modulId, diperbarui: sekarang() };
  await db.transaction('rw', db.progres, db.antrian, async () => {
    await db.progres.put(baru);
    await db.antrian.add({ tabel: 'progres', data: baru });
  });
  return baru;
}

export async function hapusSemuaData() {
  await Promise.all(db.tables.map((t) => t.clear()));
}
