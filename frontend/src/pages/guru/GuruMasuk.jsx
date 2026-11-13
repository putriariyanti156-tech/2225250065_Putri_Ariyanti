import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { panggil } from '../../lib/api.js';
import { Kepala, Umpan } from '../../components/ui.jsx';
import { ambilSesi, simpanSesi } from './sesiGuru.js';

function FormMasuk({ masuk }) {
  const [email, setEmail] = useState('');
  const [sandi, setSandi] = useState('');
  const [galat, setGalat] = useState('');
  const [sibuk, setSibuk] = useState(false);
  const kirim = async (e) => {
    e.preventDefault();
    setSibuk(true);
    setGalat('');
    try {
      const r = await panggil('/api/auth/masuk', { data: { email: email.trim(), sandi } });
      simpanSesi(r);
      masuk(r);
    } catch (err) {
      setGalat(err.message);
    } finally {
      setSibuk(false);
    }
  };
  return (
    <form className="kartu tumpuk" onSubmit={kirim}>
      <h2>Masuk sebagai guru / peneliti</h2>
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label htmlFor="sandi">Kata sandi</label>
        <input id="sandi" type="password" autoComplete="current-password" value={sandi} onChange={(e) => setSandi(e.target.value)} required />
      </div>
      {galat && <Umpan jenis="salah">{galat}</Umpan>}
      <button className="tombol utama" type="submit" disabled={sibuk}>
        Masuk
      </button>
      <p className="kecil muted" style={{ margin: 0 }}>Akun guru dibuat oleh pengelola server (lihat README bagian backend).</p>
    </form>
  );
}

export default function GuruMasuk() {
  const [sesi, setSesi] = useState(ambilSesi);
  const [kelas, setKelas] = useState([]);
  const [nama, setNama] = useState('');
  const [galat, setGalat] = useState('');

  const muat = async (s = sesi) => {
    if (!s) return;
    try {
      setKelas(await panggil('/api/kelas', { token: s.token }));
    } catch (err) {
      if (err.status === 401) {
        simpanSesi(null);
        setSesi(null);
      } else setGalat(err.message);
    }
  };
  useEffect(() => {
    muat();
  }, []);

  const buat = async (e) => {
    e.preventDefault();
    if (!nama.trim()) return;
    try {
      await panggil('/api/kelas', { token: sesi.token, data: { nama: nama.trim() } });
      setNama('');
      muat();
    } catch (err) {
      setGalat(err.message);
    }
  };

  return (
    <main className="halaman lebar">
      <Kepala
        judul="Dasbor Guru"
        kembali="/"
        kanan={
          sesi && (
            <button className="tombol tipis" onClick={() => { simpanSesi(null); setSesi(null); }}>
              Keluar
            </button>
          )
        }
      />
      {!sesi ? (
        <FormMasuk masuk={(s) => { setSesi(s); muat(s); }} />
      ) : (
        <div className="tumpuk">
          <p className="muted" style={{ margin: 0 }}>Masuk sebagai {sesi.guru.nama} ({sesi.guru.email})</p>
          {galat && <Umpan jenis="salah">{galat}</Umpan>}
          <section className="kartu">
            <h2>Kelas saya</h2>
            {kelas.length === 0 && <p className="muted">Belum ada kelas. Buat kelas pertama di bawah.</p>}
            {kelas.length > 0 && (
              <div className="gulir-x">
                <table className="tabel">
                  <thead>
                    <tr>
                      <th>Kelas</th>
                      <th>Kode kelas</th>
                      <th>Siswa</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {kelas.map((k) => (
                      <tr key={k.id}>
                        <td>{k.nama}</td>
                        <td>
                          <strong style={{ letterSpacing: 2 }}>{k.kode_kelas}</strong>
                        </td>
                        <td>{k.jumlah_siswa}</td>
                        <td>
                          <Link to={`/guru/kelas/${k.id}`}>Buka →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <form className="kartu tumpuk" onSubmit={buat}>
            <h2>Buat kelas baru</h2>
            <div>
              <label htmlFor="namaKelas">Nama kelas</label>
              <input id="namaKelas" type="text" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="contoh: 7A — Uji coba lapangan" />
            </div>
            <button className="tombol utama" type="submit">
              Buat kelas
            </button>
            <p className="kecil muted" style={{ margin: 0 }}>Bagikan kode kelas kepada siswa. Siswa memasukkannya di menu Pengaturan → Gabung kelas.</p>
          </form>
        </div>
      )}
    </main>
  );
}
