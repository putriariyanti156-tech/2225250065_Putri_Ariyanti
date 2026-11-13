/**
 * Uji asap end-to-end di Chrome (ukuran layar HP).
 * Prasyarat: server berjalan (uvicorn) + akun guru uji sudah dibuat.
 *
 *   BULAT_URL=http://127.0.0.1:8000/ GURU_EMAIL=... GURU_SANDI=... SHOT_DIR=folder node tests/e2e/smoke.mjs
 *
 * Opsional: CHROME_PATH (default lokasi Chrome di Windows).
 */
import fs from 'node:fs';
import path from 'node:path';
import puppeteer from 'puppeteer-core';
import { selesaikan } from '../../src/lib/math/stepper.js';

const BASE = process.env.BULAT_URL || 'http://127.0.0.1:8000/';
const CHROME = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = process.env.SHOT_DIR || '.';
const GURU = { email: process.env.GURU_EMAIL || 'uji@contoh.id', sandi: process.env.GURU_SANDI || 'sandiuji123' };
const baca = (p) => JSON.parse(fs.readFileSync(new URL(p, import.meta.url), 'utf8'));
const TES = baca('../../src/content/tes/tes.json');
const M5 = baca('../../src/content/modul/M5.json');
const STIM = baca('../../src/content/literasi/stimulus.json');

const HP = { width: Number(process.env.LEBAR || 390), height: Number(process.env.TINGGI || 844), isMobile: true, hasTouch: true };
const galat = [];
const jeda = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.setViewport(HP);
page.on('pageerror', (e) => galat.push(`pageerror: ${e.message}`));
page.on('console', (m) => m.type() === 'error' && galat.push(`console: ${m.text()}`));

let langkahUji = '';
const log = (t) => {
  langkahUji = t;
  console.log('•', t);
};

async function tunggu(teks, timeout = 8000) {
  await page.waitForFunction((t) => document.body.innerText.includes(t), { timeout }, teks);
}
async function klik(teks, { sel = 'button, a', persis = false } = {}) {
  const ok = await page.evaluate(
    (teks, sel, persis) => {
      const cocok = (e) => {
        const t = e.innerText.replace(/\s+/g, ' ').trim();
        return persis ? t === teks || t.endsWith(` ${teks}`) : t.includes(teks);
      };
      const el = [...document.querySelectorAll(sel)].find((e) => cocok(e) && !e.disabled);
      if (el) el.click();
      return !!el;
    },
    teks, sel, persis,
  );
  if (!ok) throw new Error(`Tombol tidak ditemukan: "${teks}"`);
  await jeda(120);
}
async function label(l) {
  await page.$eval(`button[aria-label="${l}"]`, (b) => b.click());
}
async function ketik(n) {
  for (const c of String(Math.abs(n))) await label(c);
  if (n < 0) await label('Tanda negatif');
}
const foto = (nama) => page.screenshot({ path: path.join(OUT, `${nama}.png`), fullPage: true });

async function jawabButirLiterasi(b, tombol) {
  if (b.bentuk === 'pg') await klik(b.opsi[b.kunci], { sel: 'button.pilihan', persis: true });
  if (b.bentuk === 'isian') await ketik(b.kunci);
  if (b.bentuk === 'pgKompleksBS') {
    for (let i = 0; i < b.pernyataan.length; i++) {
      await page.evaluate(
        (i, v) => {
          const kartu = [...document.querySelectorAll('.kartu')].filter((k) => [...k.querySelectorAll('button')].some((x) => x.innerText.trim() === 'Benar'));
          [...kartu[i].querySelectorAll('button')].find((x) => x.innerText.trim() === v).click();
        },
        i, b.pernyataan[i].kunci ? 'Benar' : 'Salah',
      );
      await jeda(80);
    }
  }
  if (b.bentuk === 'pilihAlasan') {
    await klik(b.kunciKlaim === 1 ? 'Kurang tepat' : 'Tepat', { sel: 'button.pilihan', persis: true });
    await klik(b.opsiAlasan[b.kunciAlasan], { sel: 'button.pilihan', persis: true });
  }
  if (b.bentuk === 'uraian') await page.type('textarea', 'Tidak setuju. −50 lebih kecil dari −35 karena letaknya lebih kiri, jadi gua lebih rendah.');
  await klik(tombol, { persis: true });
}

try {
  log('Onboarding');
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await tunggu('Selamat datang');
  await foto('01-onboarding');
  await klik('Mulai →');
  await klik('Lanjut →');
  await page.type('#kode', 's01');
  await page.type('#kelas', '7A');
  await klik('Simpan dan mulai tes singkat');

  log('Tes prasyarat (semua benar)');
  await tunggu('Tes Prasyarat');
  await klik('Mulai tes', { persis: true });
  for (const b of TES.prasyarat.butir) {
    if (b.tipe === 'pilihan') await klik(b.opsi[b.kunci], { sel: 'button.pilihan', persis: true });
    else await ketik(b.jawaban);
    await klik('Simpan & lanjut');
  }
  await tunggu('6 dari 6 soal benar');

  log('Pretest (5 benar, 5 salah)');
  await klik('Lanjut ke Tes Awal');
  await klik('Mulai tes', { persis: true });
  for (const [i, b] of TES.pretest.butir.entries()) {
    await ketik(i < 5 ? b.jawaban : b.jawaban + 1);
    await klik('Simpan & lanjut');
  }
  await tunggu('5 dari 10 soal benar');

  log('Tes literasi awal');
  await klik('Lanjut ke Tes Literasi Awal');
  await klik('Mulai tes', { persis: true });
  for (const b of TES.literasiPre.stimulus.butir) {
    await jawabButirLiterasi(b, 'Simpan jawaban');
    await klik('Lanjut →');
  }
  await tunggu('3 dari 3 soal benar');
  await foto('02-hasil-tes-literasi');
  await klik('Mulai belajar →');

  log('Beranda');
  await tunggu('Modul belajar');
  await foto('03-beranda');

  log('Modul 5: ringkasan');
  await klik('Operasi Campuran');
  await tunggu('Mengapa perlu aturan?');
  for (let i = 0; i < 3; i++) await klik('Lanjut →');
  await tunggu('Tambah dan kurang setara');
  await foto('04-kartu');
  await klik('Ke contoh →');

  log('Modul 5: contoh lengkap otomatis');
  await tunggu('Contoh lengkap');
  while (await page.evaluate(() => document.body.innerText.includes('Langkah berikutnya'))) await klik('Langkah berikutnya');
  await tunggu('Hasil akhir: −4');
  await foto('05-contoh');
  await klik('Saya sudah paham, lewati');

  log('Modul 5: latihan langkah demi langkah');
  for (const [i, soal] of M5.latihan.entries()) {
    await tunggu(soal.id);
    if (i === 0) {
      await label('Buka kartu aturan tanda');
      await tunggu('Hanya untuk kali dan bagi');
      await foto('06a-aturan-tanda');
      await klik('Tutup', { persis: true });
      await klik('3 + (−4)', { sel: 'button.pilihan', persis: true });
      await tunggu('Kali dan bagi dikerjakan sebelum tambah dan kurang');
      await foto('06-pilihan-salah');
    }
    for (const l of selesaikan(soal.soal).langkah) {
      await klik(l.bagianTeks, { sel: 'button.pilihan', persis: true });
      if (i === 1 && l.operasi === '×') {
        await ketik(-l.hasilBagian); // sengaja salah tanda
        await klik('Periksa', { persis: true });
        await tunggu('Periksa tandanya');
        await foto('07-umpan-balik-tanda');
        for (let k = 0; k < 4; k++) await label('Hapus');
      }
      await ketik(l.hasilBagian);
      await klik('Periksa', { persis: true });
    }
    await tunggu('Selesai!');
    if (i === 1) await foto('08-langkah-selesai');
    await klik('Soal berikutnya →');
  }

  log('Modul 5: jelaskan kembali');
  await klik(M5.jelaskan[0].opsi[M5.jelaskan[0].kunci], { sel: 'button.pilihan' });
  await tunggu('Tepat!');
  await klik('Lanjut →');

  log('Modul 5: tantangan literasi');
  const st = STIM.find((s) => s.id === 'STM-M5');
  for (const b of st.butir) {
    await tunggu(b.soal || b.klaim);
    await jawabButirLiterasi(b, 'Periksa');
    await tunggu('Tepat!');
    if (b.bentuk === 'pilihAlasan') await foto('09-literasi-alasan');
    await klik('Lanjut →');
  }

  log('Modul 5: refleksi Paas');
  await tunggu('usaha pikiranmu');
  await page.$eval('button[aria-label^="5:"]', (b) => b.click());
  await klik('Simpan dan selesaikan modul');
  await tunggu('Modul belajar');
  const statusM5 = await page.evaluate(() => [...document.querySelectorAll('a.kartu-modul')].find((a) => a.innerText.includes('Operasi Campuran')).innerText);
  // 2 kesalahan disengaja dari 6 soal → 4/6 = 67% → 2 bintang
  if (!statusM5.includes('Selesai') || !statusM5.includes('★★☆')) throw new Error(`Status M5 tidak sesuai: ${statusM5}`);

  log('Lab garis bilangan');
  await page.goto(`${BASE}#/lab`, { waitUntil: 'networkidle0' });
  await ketik(3);
  await label('kurang');
  await klik('b', { persis: true });
  await ketik(-4);
  await klik('Tampilkan di garis bilangan');
  await tunggu('3 − (−4) = 7');
  await klik('Jalankan langkah');
  await tunggu('Posisi: 7');
  await foto('10-lab');

  log('Progres');
  await page.goto(`${BASE}#/progres`, { waitUntil: 'networkidle0' });
  await tunggu('Profil literasi matematika');
  await foto('11-progres');

  log('Guru: masuk & buat kelas');
  await page.goto(`${BASE}#/guru`, { waitUntil: 'networkidle0' });
  await page.type('#email', GURU.email);
  await page.type('#sandi', GURU.sandi);
  await klik('Masuk', { persis: true });
  await tunggu('Kelas saya');
  await page.type('#namaKelas', '7A Uji Coba');
  await klik('Buat kelas', { persis: true });
  await tunggu('7A Uji Coba');
  const kode = await page.$eval('td strong', (e) => e.innerText.trim());

  log(`Siswa: gabung kelas ${kode}`);
  await page.goto(`${BASE}#/pengaturan`, { waitUntil: 'networkidle0' });
  await page.type('#kodeKelas', kode.toLowerCase());
  await page.$eval('input[type="checkbox"]', (c) => c.click());
  await klik('Gabung kelas', { persis: true });
  await tunggu('Berhasil bergabung', 15000);
  await foto('12-gabung-kelas');

  log('Guru: ringkasan, penilaian, ekspor');
  await page.goto(`${BASE}#/guru`, { waitUntil: 'networkidle0' });
  await tunggu('Buka →');
  await klik('Buka →');
  await tunggu('Siswa (1)');
  const teks = await page.evaluate(() => document.body.innerText);
  for (const harap of ['S01', 'MK-06', 'Profil literasi kelas']) if (!teks.includes(harap)) throw new Error(`Ringkasan tidak memuat ${harap}`);
  await page.setViewport({ width: 1100, height: 900 }); // memuat ulang halaman
  await tunggu('Siswa (1)');
  await foto('13-dasbor-guru');
  await klik('Penilaian uraian');
  await tunggu('TLPRE-4');
  await klik('3', { sel: 'button[aria-label], div[role="group"] button', persis: true });
  await page.waitForFunction(() => [...document.querySelectorAll('div[role="group"] button')].some((b) => b.getAttribute('aria-pressed') === 'true'));
  await foto('14-penilaian');
  await page.setViewport(HP);

  log('Offline: muat ulang tanpa internet');
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await page.waitForFunction(() => navigator.serviceWorker?.controller != null, { timeout: 10000 });
  await page.setOfflineMode(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await tunggu('Modul belajar');
  await klik('Perkalian');
  await tunggu('Perkalian = penjumlahan berulang');
  await foto('15-offline');
  await page.setOfflineMode(false);

  console.log('\nSEMUA LANGKAH BERHASIL');
} catch (e) {
  galat.push(`GAGAL di "${langkahUji}": ${e.message}`);
  await foto('gagal').catch(() => {});
}

await browser.close();
const nyata = galat.filter((g) => !/Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(g));
if (nyata.length) {
  console.error('\nMASALAH:\n' + nyata.join('\n'));
  process.exit(1);
}
