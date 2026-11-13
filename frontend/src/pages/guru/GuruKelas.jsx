import { useEffect, useMemo, useState } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { panggil } from '../../lib/api.js';
import { STIMULUS, TES, MODUL, NAMA_INDIKATOR, MISKONSEPSI } from '../../lib/konten.js';
import { Kepala, Umpan } from '../../components/ui.jsx';
import { ambilSesi } from './sesiGuru.js';

/** Peta id butir → teks soal (dari konten bundel), untuk halaman penilaian. */
function petaButir() {
  const peta = {};
  const tambah = (st) =>
    st.butir.forEach((b) => (peta[b.id] = { soal: b.soal || `${b.tokoh}: “${b.klaim}”`, stimulus: st.judul, contoh: b.contohJawaban || b.pembahasan || '' }));
  STIMULUS.forEach(tambah);
  tambah(TES.literasiPre.stimulus);
  tambah(TES.literasiPost.stimulus);
  return peta;
}

const RUBRIK = [
  [3, 'Jawaban benar, alasan tepat dan lengkap, dikaitkan dengan konteks'],
  [2, 'Jawaban benar, alasan sebagian tepat / kurang dikaitkan konteks'],
  [1, 'Jawaban salah tetapi ada penalaran relevan, atau benar tanpa alasan'],
  [0, 'Tidak menjawab atau tidak relevan'],
];

function Ringkasan({ r }) {
  return (
    <div className="tumpuk">
      <section className="kartu">
        <h2>Siswa ({r.siswa.length})</h2>
        <div className="gulir-x">
          <table className="tabel kecil">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Modul selesai</th>
                <th>Pretest</th>
                <th>Posttest</th>
                <th>N-gain</th>
                <th>Literasi awal</th>
                <th>Literasi akhir</th>
                <th>N-gain lit.</th>
                <th>Sinkron terakhir</th>
              </tr>
            </thead>
            <tbody>
              {r.siswa.map((s) => (
                <tr key={s.kode_siswa}>
                  <td><strong>{s.kode_siswa}</strong></td>
                  <td>{s.modul_selesai}/{MODUL.length}</td>
                  <td>{s.pretest ?? '–'}</td>
                  <td>{s.posttest ?? '–'}</td>
                  <td>{s.ngain ?? '–'}</td>
                  <td>{s.literasi_pre ?? '–'}</td>
                  <td>{s.literasi_post ?? '–'}</td>
                  <td>{s.ngain_literasi ?? '–'}</td>
                  <td>{s.sinkron_terakhir ? new Date(s.sinkron_terakhir).toLocaleString('id-ID') : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        <section className="kartu">
          <h2>Profil literasi kelas</h2>
          {Object.keys(NAMA_INDIKATOR).map((k) => {
            const v = r.literasi[k] || { benar: 0, total: 0 };
            const p = v.total ? Math.round((v.benar / v.total) * 100) : 0;
            return (
              <div key={k} style={{ marginBottom: 10 }}>
                <div className="baris ujung kecil">
                  <span>{k} {NAMA_INDIKATOR[k]}</span>
                  <span>{v.total ? `${p}% (${v.benar}/${v.total})` : '–'}</span>
                </div>
                <div className="batang"><div style={{ width: `${p}%` }} /></div>
              </div>
            );
          })}
          <p className="kecil muted" style={{ margin: 0 }}>Hanya butir objektif; uraian dinilai di tab Penilaian.</p>
        </section>

        <section className="kartu">
          <h2>Miskonsepsi tersering</h2>
          {r.miskonsepsi.length === 0 ? (
            <p className="muted">Belum ada data.</p>
          ) : (
            <ol style={{ paddingLeft: 18, margin: 0 }}>
              {r.miskonsepsi.map((m) => (
                <li key={m.kode}>
                  <strong>{m.kode}</strong> {MISKONSEPSI[m.kode]?.nama} <span className="muted">({m.jumlah}×)</span>
                </li>
              ))}
            </ol>
          )}
        </section>

        <section className="kartu">
          <h2>Beban kognitif (Paas 1–9)</h2>
          <table className="tabel kecil">
            <thead>
              <tr><th>Modul</th><th>Rata-rata</th><th>n</th></tr>
            </thead>
            <tbody>
              {MODUL.map((m) => {
                const b = r.beban.find((x) => x.modul_id === m.id);
                return (
                  <tr key={m.id}>
                    <td>{m.id} {m.judul}</td>
                    <td>{b ? b.rata.toFixed(2) : '–'}</td>
                    <td>{b ? b.n : 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

function Penilaian({ id, token }) {
  const [daftar, setDaftar] = useState(null);
  const [galat, setGalat] = useState('');
  const peta = useMemo(petaButir, []);
  const muat = async () => {
    try {
      setDaftar(await panggil(`/api/kelas/${id}/uraian`, { token }));
    } catch (e) {
      setGalat(e.message);
    }
  };
  useEffect(() => {
    muat();
  }, [id]);

  const nilai = async (jawabanId, skor) => {
    try {
      await panggil('/api/rubrik', { token, data: { jawaban_literasi_id: jawabanId, skor } });
      setDaftar((d) => d.map((x) => (x.id === jawabanId ? { ...x, skor_saya: skor } : x)));
    } catch (e) {
      setGalat(e.message);
    }
  };

  if (galat) return <Umpan jenis="salah">{galat}</Umpan>;
  if (!daftar) return <p>Memuat…</p>;
  const belum = daftar.filter((d) => d.skor_saya === null).length;
  return (
    <div className="tumpuk">
      <Umpan jenis="info">
        {daftar.length} jawaban uraian, {belum} belum Anda nilai. Untuk reliabilitas antarpenilai, minta penilai kedua masuk dengan akunnya sendiri dan menilai jawaban yang sama.
      </Umpan>
      <details className="kartu">
        <summary><strong>Rubrik 0–3</strong></summary>
        <ul style={{ paddingLeft: 18 }}>
          {RUBRIK.map(([s, t]) => <li key={s}><strong>{s}</strong> — {t}</li>)}
        </ul>
      </details>
      {daftar.map((d) => {
        const info = peta[d.butir_id] || {};
        return (
          <article key={d.id} className="kartu tumpuk">
            <div className="baris ujung kecil muted">
              <span><strong>{d.kode_siswa}</strong> · {d.butir_id} · {d.mode === 'tes' ? 'Tes' : 'Latihan'}</span>
              <span>{d.indikator.map((k) => NAMA_INDIKATOR[k]).join(', ')}</span>
            </div>
            <p className="kecil" style={{ margin: 0 }}>{info.stimulus} — <strong>{info.soal}</strong></p>
            <blockquote style={{ margin: 0, padding: '8px 12px', background: 'var(--highlight)', borderRadius: 8 }}>{d.teks_uraian}</blockquote>
            {info.contoh && <p className="kecil muted" style={{ margin: 0 }}>Acuan: {info.contoh}</p>}
            <div className="baris" role="group" aria-label="Skor rubrik">
              {[0, 1, 2, 3].map((s) => (
                <button key={s} className="tombol tipis" aria-pressed={d.skor_saya === s} style={d.skor_saya === s ? { background: 'var(--primary)', color: 'var(--primary-ink)' } : {}} onClick={() => nilai(d.id, s)}>
                  {s}
                </button>
              ))}
              {d.jumlah_penilai > 0 && <span className="kecil muted">Dinilai {d.jumlah_penilai} penilai</span>}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Ekspor({ id, token }) {
  const [galat, setGalat] = useState('');
  const unduh = async (jenis, format) => {
    setGalat('');
    try {
      const res = await panggil(`/api/kelas/${id}/ekspor?jenis=${jenis}&format=${format}`, { token, mentah: true });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bulat-kelas${id}-${jenis}.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setGalat(e.message);
    }
  };
  const jenis = [
    ['ringkasan', 'Ringkasan per siswa (skor tes, N-gain)'],
    ['hasil_tes', 'Hasil tes (semua jawaban)'],
    ['percobaan', 'Percobaan latihan'],
    ['jawaban_literasi', 'Jawaban literasi + skor rubrik'],
    ['beban_kognitif', 'Skor beban kognitif (Paas)'],
    ['kejadian', 'Log interaksi'],
  ];
  return (
    <div className="tumpuk">
      {galat && <Umpan jenis="salah">{galat}</Umpan>}
      <section className="kartu tumpuk">
        <h2>Semua data (Excel)</h2>
        <button className="tombol utama" onClick={() => unduh('semua', 'xlsx')}>⬇ Unduh .xlsx (semua sheet)</button>
      </section>
      <section className="kartu">
        <h2>Per tabel (CSV)</h2>
        <p className="kecil muted">Format CSV dipakai skrip analisis Python di folder analisis/.</p>
        {jenis.map(([j, t]) => (
          <div key={j} className="baris ujung" style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
            <span>{t}</span>
            <button className="tombol tipis" onClick={() => unduh(j, 'csv')}>CSV</button>
          </div>
        ))}
      </section>
    </div>
  );
}

export default function GuruKelas() {
  const { id } = useParams();
  const sesi = ambilSesi();
  const [tab, setTab] = useState('ringkasan');
  const [r, setR] = useState(null);
  const [galat, setGalat] = useState('');

  useEffect(() => {
    if (!sesi) return;
    panggil(`/api/kelas/${id}/ringkasan`, { token: sesi.token }).then(setR).catch((e) => setGalat(e.message));
  }, [id]);

  if (!sesi) return <Navigate to="/guru" replace />;

  return (
    <main className="halaman lebar">
      <Kepala judul={r ? `Kelas ${r.kelas.nama}` : 'Kelas'} kembali="/guru" kanan={r && <span className="kecil">Kode: <strong>{r.kelas.kode_kelas}</strong></span>} />
      <nav className="baris" style={{ marginBottom: 16 }}>
        {[['ringkasan', 'Ringkasan'], ['penilaian', 'Penilaian uraian'], ['ekspor', 'Ekspor data']].map(([k, t]) => (
          <button key={k} className="tombol tipis" aria-pressed={tab === k} style={tab === k ? { background: 'var(--primary)', color: 'var(--primary-ink)' } : {}} onClick={() => setTab(k)}>
            {t}
          </button>
        ))}
      </nav>
      {galat && <Umpan jenis="salah">{galat}</Umpan>}
      {tab === 'ringkasan' && r && <Ringkasan r={r} />}
      {tab === 'penilaian' && <Penilaian id={id} token={sesi.token} />}
      {tab === 'ekspor' && <Ekspor id={id} token={sesi.token} />}
    </main>
  );
}
