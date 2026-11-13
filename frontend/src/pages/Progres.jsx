import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../lib/db.js';
import { MODUL, TES, NAMA_INDIKATOR, MISKONSEPSI } from '../lib/konten.js';
import { Kepala, Bintang } from '../components/ui.jsx';
import { NavBawah } from './Beranda.jsx';

export default function Progres() {
  const [data, setData] = useState(null);

  useEffect(() => {
    (async () => {
      const [progres, tes, literasi, beban, percobaan] = await Promise.all([
        db.progres.toArray(),
        db.hasilTes.orderBy('waktu').toArray(),
        db.jawabanLiterasi.toArray(),
        db.bebanKognitif.toArray(),
        db.percobaan.toArray(),
      ]);
      const profilLM = Object.fromEntries(Object.keys(NAMA_INDIKATOR).map((k) => [k, { benar: 0, total: 0 }]));
      literasi
        .filter((j) => j.benar !== null && j.benar !== undefined)
        .forEach((j) => j.indikator.forEach((k) => {
          profilLM[k].total += 1;
          if (j.benar) profilLM[k].benar += 1;
        }));
      const mk = {};
      percobaan.filter((p) => p.miskonsepsi).forEach((p) => (mk[p.miskonsepsi] = (mk[p.miskonsepsi] || 0) + 1));
      const tesAkhir = {};
      tes.forEach((t) => (tesAkhir[t.jenis] = t));
      setData({
        progres: Object.fromEntries(progres.map((p) => [p.modulId, p])),
        tes: tesAkhir,
        profilLM,
        beban: Object.fromEntries(beban.map((b) => [b.modulId, b.skor])),
        miskonsepsi: Object.entries(mk).sort((a, b) => b[1] - a[1]).slice(0, 3),
        jumlahSoal: percobaan.length,
      });
    })();
  }, []);

  if (!data) return null;

  const ngain = (pre, post) => (pre !== undefined && post !== undefined && pre < 100 ? ((post - pre) / (100 - pre)).toFixed(2) : '–');

  return (
    <main className="halaman">
      <Kepala judul="Progres Saya" />
      <div className="tumpuk">
        <section className="kartu">
          <h2>Modul</h2>
          {MODUL.map((m) => {
            const p = data.progres[m.id];
            return (
              <div key={m.id} className="baris ujung" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                <span>
                  {m.nomor}. {m.judul}
                </span>
                {p?.status === 'selesai' ? <Bintang n={p.bintang} /> : <span className="kecil muted">{p?.status === 'sedang' ? 'Sedang' : 'Belum'}</span>}
              </div>
            );
          })}
        </section>

        <section className="kartu">
          <h2>Profil literasi matematika</h2>
          <p className="kecil muted">Persentase jawaban tepat pada soal literasi.</p>
          {Object.entries(data.profilLM).map(([k, v]) => {
            const persen = v.total ? Math.round((v.benar / v.total) * 100) : 0;
            return (
              <div key={k} style={{ marginBottom: 10 }}>
                <div className="baris ujung kecil">
                  <span>
                    {k} {NAMA_INDIKATOR[k]}
                  </span>
                  <span>{v.total ? `${persen}% (${v.benar}/${v.total})` : 'belum ada'}</span>
                </div>
                <div className="batang" role="img" aria-label={`${NAMA_INDIKATOR[k]} ${persen} persen`}>
                  <div style={{ width: `${persen}%` }} />
                </div>
              </div>
            );
          })}
        </section>

        <section className="kartu">
          <h2>Hasil tes</h2>
          <table className="tabel">
            <thead>
              <tr>
                <th>Tes</th>
                <th>Skor</th>
              </tr>
            </thead>
            <tbody>
              {['prasyarat', 'pretest', 'posttest', 'literasiPre', 'literasiPost'].map((j) => (
                <tr key={j}>
                  <td>{TES[j].judul}</td>
                  <td>{data.tes[j] ? data.tes[j].skor : <Link to={`/tes/${j}`}>Kerjakan</Link>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="kecil" style={{ marginTop: 8 }}>
            Peningkatan (N-gain) operasi: <strong>{ngain(data.tes.pretest?.skor, data.tes.posttest?.skor)}</strong> · literasi:{' '}
            <strong>{ngain(data.tes.literasiPre?.skor, data.tes.literasiPost?.skor)}</strong>
          </p>
        </section>

        {data.miskonsepsi.length > 0 && (
          <section className="kartu">
            <h2>Yang perlu diperhatikan</h2>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {data.miskonsepsi.map(([k, n]) => (
                <li key={k}>
                  {MISKONSEPSI[k]?.nama} <span className="muted kecil">({n}×)</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="kecil muted tengah">Kamu sudah menjawab {data.jumlahSoal} soal latihan.</p>
      </div>
      <NavBawah />
    </main>
  );
}
