import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MODUL } from '../lib/konten.js';
import { db } from '../lib/db.js';
import { useProfil } from '../App.jsx';
import { Bintang } from '../components/ui.jsx';
import PasangAplikasi from '../components/PasangAplikasi.jsx';

const LABEL_STATUS = { belum: 'Belum', sedang: 'Sedang', selesai: 'Selesai' };

export function NavBawah() {
  return (
    <nav className="kaki" aria-label="Navigasi utama">
      <div className="kaki-isi">
        <Link className="tombol tipis" to="/">🏠 Beranda</Link>
        <Link className="tombol tipis" to="/lab">📏 Lab</Link>
        <Link className="tombol tipis" to="/progres">📊 Progres</Link>
        <Link className="tombol tipis" to="/pengaturan" aria-label="Pengaturan">⚙</Link>
      </div>
    </nav>
  );
}

export default function Beranda() {
  const { profil } = useProfil();
  const [progres, setProgres] = useState({});
  const [tes, setTes] = useState({});

  useEffect(() => {
    (async () => {
      const p = await db.progres.toArray();
      setProgres(Object.fromEntries(p.map((x) => [x.modulId, x])));
      const t = await db.hasilTes.toArray();
      const akhir = {};
      t.forEach((x) => {
        if (!akhir[x.jenis] || akhir[x.jenis].waktu < x.waktu) akhir[x.jenis] = x;
      });
      setTes(akhir);
    })();
  }, []);

  const tesAwalBelum = ['prasyarat', 'pretest', 'literasiPre'].find((j) => !tes[j]);
  const perluPenguatan = tes.prasyarat && tes.prasyarat.skor < 60;
  const m7Selesai = progres.M7?.status === 'selesai';
  const tesAkhirBelum = ['posttest', 'literasiPost'].find((j) => !tes[j]);

  return (
    <main className="halaman">
      <header className="kepala">
        <h1>Halo, {profil?.kodeSiswa} 👋</h1>
        <span className="kecil">{profil?.kelas}</span>
      </header>

      <div className="tumpuk">
        <PasangAplikasi ringkas />

        {tesAwalBelum && (
          <div className="kartu" style={{ borderColor: 'var(--primary)', borderWidth: 2 }}>
            <strong>Tes awal belum selesai</strong>
            <p className="kecil">Tes singkat ini membantu kami melihat kemampuan awalmu.</p>
            <Link className="tombol utama" to={`/tes/${tesAwalBelum}`}>
              Kerjakan tes
            </Link>
          </div>
        )}

        {perluPenguatan && (
          <div className="kartu">
            <strong>Saran untukmu</strong>
            <p className="kecil" style={{ margin: 0 }}>Mulai dari Modul 0 untuk menguatkan dasar-dasarnya dulu, ya.</p>
          </div>
        )}

        <h2 style={{ marginTop: 20 }}>Modul belajar</h2>
        {MODUL.map((m) => {
          const p = progres[m.id];
          const status = p?.status || 'belum';
          return (
            <Link key={m.id} to={`/modul/${m.id}`} className="kartu kartu-modul">
              <span className="nomor-modul">{m.nomor}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ display: 'block' }}>{m.judul}</strong>
                <span className="kecil muted">{m.ringkas}</span>
              </span>
              <span style={{ textAlign: 'right' }}>
                <span className={`lencana ${status}`}>{LABEL_STATUS[status]}</span>
                {status === 'selesai' && (
                  <span style={{ display: 'block' }}>
                    <Bintang n={p.bintang} />
                  </span>
                )}
              </span>
            </Link>
          );
        })}

        {m7Selesai && tesAkhirBelum && (
          <div className="kartu" style={{ borderColor: 'var(--success)', borderWidth: 2 }}>
            <strong>Semua modul selesai! 🎉</strong>
            <p className="kecil">Sekarang kerjakan tes akhir untuk melihat perkembanganmu.</p>
            <Link className="tombol utama" to={`/tes/${tesAkhirBelum}`}>
              Kerjakan tes akhir
            </Link>
          </div>
        )}
      </div>
      <NavBawah />
    </main>
  );
}
