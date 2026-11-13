import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { simpanProfil } from '../lib/db.js';
import { useProfil } from '../App.jsx';
import { Pemandu } from '../components/ui.jsx';
import PasangAplikasi from '../components/PasangAplikasi.jsx';
import { DEMO } from '../lib/mode.js';

export default function Onboarding() {
  const nav = useNavigate();
  const { muatUlang } = useProfil();
  const [layar, setLayar] = useState(0);
  const [kode, setKode] = useState('');
  const [kelas, setKelas] = useState('');
  const [galat, setGalat] = useState('');

  const simpan = async (e) => {
    e.preventDefault();
    const k = kode.trim().toUpperCase();
    if (!/^[A-Z0-9-]{2,12}$/.test(k)) return setGalat('Kode siswa 2–12 karakter (huruf/angka), contoh: S01.');
    await simpanProfil({ kodeSiswa: k, kelas: kelas.trim() });
    await muatUlang();
    nav('/tes/prasyarat');
  };

  return (
    <main className="halaman" style={{ paddingTop: 32 }}>
      {layar === 0 && (
        <div className="tumpuk">
          <div className="nomor-modul" style={{ width: 64, height: 64, fontSize: '1.8em' }} aria-hidden="true">
            ±
          </div>
          <h1>Selamat datang di BULAT</h1>
          <p>Belajar <strong>operasi bilangan bulat</strong> sedikit demi sedikit, dengan garis bilangan, contoh bertahap, dan soal dari kehidupan sehari-hari.</p>
          <Pemandu>Hai, aku Bima! Aku akan menemanimu belajar. Kamu bisa belajar sesuai kecepatanmu sendiri.</Pemandu>
          <button className="tombol utama penuh" onClick={() => setLayar(1)}>
            Mulai →
          </button>
          <PasangAplikasi />
          {DEMO ? (
            <p className="kecil muted tengah">Versi pratinjau. Kemajuan belajar tersimpan di browser ini saja.</p>
          ) : (
            <p className="kecil tengah">
              Guru atau peneliti? <Link to="/guru">Masuk ke dasbor guru</Link>
            </p>
          )}
        </div>
      )}

      {layar === 1 && (
        <div className="tumpuk">
          <h1>Cara belajar di BULAT</h1>
          <div className="kartu">
            <strong>1. Satu ide setiap kartu</strong>
            <p className="kecil" style={{ margin: 0 }}>Tekan “Lanjut” kalau sudah paham. Tidak ada yang berjalan sendiri.</p>
          </div>
          <div className="kartu">
            <strong>2. Contoh dulu, baru latihan</strong>
            <p className="kecil" style={{ margin: 0 }}>Lihat contoh lengkap, lengkapi contoh, lalu kerjakan sendiri.</p>
          </div>
          <div className="kartu">
            <strong>3. Bantuan selalu ada</strong>
            <p className="kecil" style={{ margin: 0 }}>Tombol <strong>±</strong> berisi aturan tanda. Tombol 💡 berisi petunjuk.</p>
          </div>
          <button className="tombol utama penuh" onClick={() => setLayar(2)}>
            Lanjut →
          </button>
        </div>
      )}

      {layar === 2 && (
        <form className="tumpuk" onSubmit={simpan}>
          <h1>Isi kode siswamu</h1>
          <p className="muted">Gunakan kode dari guru, bukan nama asli.</p>
          <div>
            <label htmlFor="kode">Kode siswa</label>
            <input id="kode" type="text" autoComplete="off" value={kode} onChange={(e) => setKode(e.target.value)} placeholder="contoh: S01" />
          </div>
          <div>
            <label htmlFor="kelas">Kelas (boleh dikosongkan)</label>
            <input id="kelas" type="text" autoComplete="off" value={kelas} onChange={(e) => setKelas(e.target.value)} placeholder="contoh: 7A" />
          </div>
          {galat && <p style={{ color: 'var(--error)' }}>{galat}</p>}
          <p className="kecil muted">
            {DEMO
              ? 'Hasil belajarmu disimpan di browser ini saja dan tidak dikirim ke mana pun.'
              : 'Hasil belajarmu disimpan di perangkat ini. Data hanya dikirim ke guru jika kamu bergabung ke kelas di menu Pengaturan.'}
          </p>
          <button className="tombol utama penuh" type="submit">
            Simpan dan mulai tes singkat
          </button>
        </form>
      )}
    </main>
  );
}
