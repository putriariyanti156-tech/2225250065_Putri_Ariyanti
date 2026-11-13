import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ambilPengaturan, simpanPengaturan, simpanProfil, hapusSemuaData } from '../lib/db.js';
import { jumlahMenunggu, sinkronkan } from '../lib/sinkron.js';
import { panggil } from '../lib/api.js';
import { unduhCsv } from '../lib/ekspor.js';
import { useProfil } from '../App.jsx';
import { Kepala, Umpan } from '../components/ui.jsx';
import PasangAplikasi from '../components/PasangAplikasi.jsx';
import { NavBawah } from './Beranda.jsx';
import { DEMO } from '../lib/mode.js';

export default function Pengaturan() {
  const { profil, muatUlang } = useProfil();
  const nav = useNavigate();
  const [atur, setAtur] = useState(null);
  const [menunggu, setMenunggu] = useState(0);
  const [kodeKelas, setKodeKelas] = useState('');
  const [setuju, setSetuju] = useState(false);
  const [pesan, setPesan] = useState(null);
  const [sibuk, setSibuk] = useState(false);
  const [yakinHapus, setYakinHapus] = useState(false);

  const segarkan = async () => {
    setAtur(await ambilPengaturan());
    setMenunggu(await jumlahMenunggu());
  };
  useEffect(() => {
    segarkan();
  }, []);

  if (!atur) return null;

  const ubah = async (perubahan) => {
    const baru = await simpanPengaturan(perubahan);
    setAtur(baru);
    document.documentElement.dataset.huruf = baru.ukuranHuruf;
  };

  const gabung = async (e) => {
    e.preventDefault();
    setPesan(null);
    if (!setuju) return setPesan({ jenis: 'salah', teks: 'Centang persetujuan terlebih dahulu.' });
    setSibuk(true);
    try {
      const r = await panggil('/api/siswa/gabung', {
        data: { kode_kelas: kodeKelas.trim().toUpperCase(), kode_siswa: profil.kodeSiswa, persetujuan: true },
      });
      await simpanProfil({ tokenPerangkat: r.token_perangkat, kodeKelas: r.kode_kelas, namaKelas: r.nama_kelas, kelas: profil.kelas || r.nama_kelas });
      await muatUlang();
      const s = await sinkronkan();
      setPesan({ jenis: 'benar', teks: `Berhasil bergabung ke kelas ${r.nama_kelas}. ${s.terkirim ? `${s.terkirim} data terkirim.` : ''}` });
    } catch (err) {
      setPesan({ jenis: 'salah', teks: err.message });
    } finally {
      setSibuk(false);
      segarkan();
    }
  };

  const kirimSekarang = async () => {
    setSibuk(true);
    const s = await sinkronkan();
    setSibuk(false);
    await segarkan();
    setPesan(
      s.status === 'gagal'
        ? { jenis: 'salah', teks: `Gagal mengirim: ${s.pesan}` }
        : { jenis: 'info', teks: s.terkirim ? `${s.terkirim} data terkirim.` : s.pesan || 'Tidak ada data baru.' },
    );
  };

  const keluarKelas = async () => {
    await simpanProfil({ tokenPerangkat: null, kodeKelas: null, namaKelas: null });
    await muatUlang();
    setPesan({ jenis: 'info', teks: 'Kamu keluar dari kelas. Data tetap tersimpan di perangkat ini.' });
  };

  const hapus = async () => {
    await hapusSemuaData();
    await muatUlang();
    nav('/mulai');
  };

  return (
    <main className="halaman">
      <Kepala judul="Pengaturan" />
      <div className="tumpuk">
        {pesan && <Umpan jenis={pesan.jenis}>{pesan.teks}</Umpan>}

        <section className="kartu tumpuk">
          <h2>Tampilan</h2>
          <div className="baris">
            <span>Ukuran huruf:</span>
            {['normal', 'besar'].map((u) => (
              <button key={u} className="tombol tipis" aria-pressed={atur.ukuranHuruf === u} style={atur.ukuranHuruf === u ? { borderColor: 'var(--primary)', background: 'var(--primary-soft)' } : {}} onClick={() => ubah({ ukuranHuruf: u })}>
                {u === 'normal' ? 'Normal' : 'Besar'}
              </button>
            ))}
          </div>
        </section>

        {DEMO && (
          <Umpan jenis="info" judul="Versi pratinjau">
            Kemajuan belajar tersimpan di browser ini saja. Fitur gabung kelas, dasbor guru, pemasangan aplikasi, dan mode offline tersedia di versi yang di-hosting dengan server.
          </Umpan>
        )}

        {!DEMO && (
        <section className="kartu tumpuk">
          <h2>Kelas & pengiriman data</h2>
          <p className="kecil" style={{ margin: 0 }}>
            Kode siswa: <strong>{profil?.kodeSiswa}</strong>
            {profil?.namaKelas && (
              <>
                {' '}· Kelas: <strong>{profil.namaKelas}</strong> ({profil.kodeKelas})
              </>
            )}
          </p>
          {profil?.tokenPerangkat ? (
            <>
              <p className="kecil" style={{ margin: 0 }}>
                Data menunggu dikirim: <strong>{menunggu}</strong>
              </p>
              <div className="baris">
                <button className="tombol" onClick={kirimSekarang} disabled={sibuk}>
                  Kirim sekarang
                </button>
                <button className="tombol tipis" onClick={keluarKelas}>
                  Keluar dari kelas
                </button>
              </div>
            </>
          ) : (
            <form className="tumpuk" onSubmit={gabung}>
              <div>
                <label htmlFor="kodeKelas">Kode kelas dari guru</label>
                <input id="kodeKelas" type="text" autoComplete="off" value={kodeKelas} onChange={(e) => setKodeKelas(e.target.value)} placeholder="contoh: AB12CD" />
              </div>
              <label style={{ fontWeight: 400, display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                <input type="checkbox" checked={setuju} onChange={(e) => setSetuju(e.target.checked)} style={{ width: 22, height: 22, flex: 'none' }} />
                <span className="kecil">Saya setuju hasil belajar saya (dengan kode siswa, tanpa nama) dikirim ke guru untuk keperluan pembelajaran dan penelitian.</span>
              </label>
              <button className="tombol utama" type="submit" disabled={sibuk || !kodeKelas.trim()}>
                Gabung kelas
              </button>
            </form>
          )}
          <details>
            <summary className="kecil">Alamat server (lanjutan)</summary>
            <p className="kecil muted">Kosongkan jika aplikasi dibuka dari alamat server guru. Isi jika aplikasi dibuka dari alamat lain, misalnya https://bulat-api.onrender.com</p>
            <input type="url" value={atur.alamatServer} onChange={(e) => setAtur({ ...atur, alamatServer: e.target.value })} onBlur={() => ubah({ alamatServer: atur.alamatServer.trim() })} placeholder="https://…" />
          </details>
        </section>
        )}

        <section className="kartu tumpuk">
          <h2>Penelitian</h2>
          <label style={{ fontWeight: 400, display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="checkbox" checked={atur.instrumenPenelitianAktif} onChange={(e) => ubah({ instrumenPenelitianAktif: e.target.checked })} style={{ width: 22, height: 22 }} />
            Tampilkan skala usaha mental di akhir modul
          </label>
          {!DEMO && (
            <button className="tombol tipis" onClick={unduhCsv}>
              ⬇ Unduh data saya (CSV)
            </button>
          )}
        </section>

        <PasangAplikasi />

        <section className="kartu tumpuk">
          <h2>Lainnya</h2>
          {!DEMO && <Link to="/guru">Dasbor guru</Link>}
          {!yakinHapus ? (
            <button className="tombol tipis" style={{ borderColor: 'var(--error)', color: 'var(--error)' }} onClick={() => setYakinHapus(true)}>
              Hapus semua data di perangkat ini
            </button>
          ) : (
            <div className="umpan salah tumpuk" role="alert">
              <div>
                <strong>Hapus semua data belajar?</strong>
                <p className="kecil" style={{ margin: 0 }}>Progres, hasil tes, dan jawaban di perangkat ini akan hilang dan tidak bisa dikembalikan.</p>
                <div className="baris" style={{ marginTop: 8 }}>
                  <button className="tombol tipis" onClick={() => setYakinHapus(false)}>Batal</button>
                  <button className="tombol utama" style={{ background: 'var(--error)', borderColor: 'var(--error)' }} onClick={hapus}>Ya, hapus</button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
      <NavBawah />
    </main>
  );
}
