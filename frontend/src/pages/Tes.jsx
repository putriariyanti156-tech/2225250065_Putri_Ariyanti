import { useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { TES } from '../lib/konten.js';
import { simpan } from '../lib/db.js';
import { sinkronkan } from '../lib/sinkron.js';
import { bacaAngka } from '../lib/math/format.js';
import { Kepala, Kemajuan, Umpan } from '../components/ui.jsx';
import InputJawaban from '../components/InputJawaban.jsx';
import { PanelStimulus, ButirLiterasi } from '../components/Literasi.jsx';

const BERIKUTNYA = {
  prasyarat: 'pretest',
  pretest: 'literasiPre',
  posttest: 'literasiPost',
};

function ButirTes({ butir, jawab }) {
  const [nilai, setNilai] = useState('');
  const [pilih, setPilih] = useState(null);
  const siap = butir.tipe === 'pilihan' ? pilih !== null : bacaAngka(nilai) !== null;
  const kirim = () => {
    if (!siap) return;
    if (butir.tipe === 'pilihan') jawab({ id: butir.id, jawaban: butir.opsi[pilih], benar: pilih === butir.kunci });
    else {
      const v = bacaAngka(nilai);
      jawab({ id: butir.id, jawaban: v, benar: v === butir.jawaban });
    }
  };
  return (
    <div className="tumpuk">
      <div className="kartu">
        {butir.soal.length > 40 ? <p style={{ fontWeight: 700, margin: 0 }}>{butir.soal}</p> : <div className="ekspresi">{butir.soal} {butir.tipe === 'isian' ? '= ?' : ''}</div>}
      </div>
      {butir.tipe === 'pilihan' ? (
        butir.opsi.map((o, i) => (
          <button key={i} className="pilihan" aria-pressed={pilih === i} onClick={() => setPilih(i)}>
            <span aria-hidden="true">{pilih === i ? '●' : '○'}</span> {o}
          </button>
        ))
      ) : (
        <InputJawaban nilai={nilai} ubah={setNilai} kirim={kirim} label={butir.satuan ? `Jawaban (${butir.satuan})` : 'Jawaban'} />
      )}
      <button className="tombol utama penuh" disabled={!siap} onClick={kirim}>
        Simpan & lanjut →
      </button>
    </div>
  );
}

export default function Tes() {
  const { jenis } = useParams();
  const nav = useNavigate();
  const tes = TES[jenis];
  const literasi = jenis === 'literasiPre' || jenis === 'literasiPost';
  const butirList = tes ? (literasi ? tes.stimulus.butir : tes.butir) : [];
  const [tahap, setTahap] = useState('awal');
  const [i, setI] = useState(0);
  const jawaban = useRef([]);
  const mulai = useRef(0);
  const [hasil, setHasil] = useState(null);

  if (!tes) return <main className="halaman"><Kepala judul="Tes tidak ditemukan" /></main>;

  const selesai = async () => {
    const objektif = jawaban.current.filter((j) => j.benar !== null);
    const benar = objektif.filter((j) => j.benar).length;
    const skor = objektif.length ? Math.round((benar / objektif.length) * 100) : 0;
    await simpan('hasilTes', {
      jenis,
      skor,
      benar,
      total: objektif.length,
      jawaban: jawaban.current,
      durasiDetik: Math.round((Date.now() - mulai.current) / 1000),
    });
    sinkronkan();
    setHasil({ skor, benar, total: objektif.length, uraian: jawaban.current.length - objektif.length });
    setTahap('hasil');
  };

  const catat = (j) => {
    jawaban.current[i] = j;
    if (i + 1 < butirList.length) setI(i + 1);
    else selesai();
  };

  return (
    <main className="halaman">
      <Kepala judul={tes.judul} kembali={tahap === 'soal' ? null : '/'} kanan={tahap === 'soal' && <span className="kecil">{i + 1}/{butirList.length}</span>} />

      {tahap === 'awal' && (
        <div className="tumpuk">
          <p>{tes.petunjuk}</p>
          <Umpan jenis="info">Selama tes tidak ada petunjuk dan tidak ditampilkan benar/salah. Kerjakan dengan tenang.</Umpan>
          <button
            className="tombol utama penuh"
            onClick={() => {
              mulai.current = Date.now();
              setTahap('soal');
            }}
          >
            Mulai tes
          </button>
          <Link className="tombol tipis penuh" to="/">
            Nanti saja
          </Link>
        </div>
      )}

      {tahap === 'soal' && (
        <div className="tumpuk">
          <Kemajuan total={butirList.length} aktif={i} />
          {literasi ? (
            <>
              <PanelStimulus stimulus={tes.stimulus} />
              <ButirLiterasi key={butirList[i].id} butir={butirList[i]} stimulusId={tes.stimulus.id} mode="tes" onJawab={(r) => (jawaban.current[i] = { id: r.butirId, jawaban: r.jawaban, benar: r.benar, indikator: r.indikator, teksUraian: r.teksUraian })} onLanjut={() => (i + 1 < butirList.length ? setI(i + 1) : selesai())} />
            </>
          ) : (
            <ButirTes key={butirList[i].id} butir={butirList[i]} jawab={catat} />
          )}
        </div>
      )}

      {tahap === 'hasil' && hasil && (
        <div className="tumpuk">
          <div className="kartu tengah">
            <p className="muted" style={{ margin: 0 }}>Skor</p>
            <div className="ekspresi">{hasil.skor}</div>
            <p style={{ margin: 0 }}>
              {hasil.benar} dari {hasil.total} soal benar
              {hasil.uraian > 0 && `, ${hasil.uraian} jawaban uraian akan dinilai guru`}
            </p>
          </div>
          {jenis === 'prasyarat' && hasil.skor < (tes.batasLulus || 60) && (
            <Umpan jenis="info">Saranku: mulai belajar dari Modul 0 untuk menguatkan dasar-dasarnya.</Umpan>
          )}
          {BERIKUTNYA[jenis] ? (
            <button
              className="tombol utama penuh"
              onClick={() => {
                jawaban.current = [];
                setI(0);
                setHasil(null);
                setTahap('awal');
                nav(`/tes/${BERIKUTNYA[jenis]}`);
              }}
            >
              Lanjut ke {TES[BERIKUTNYA[jenis]].judul} →
            </button>
          ) : (
            <Link className="tombol utama penuh" to={jenis === 'literasiPost' ? '/progres' : '/'}>
              {jenis === 'literasiPost' ? 'Lihat progresku' : 'Mulai belajar →'}
            </Link>
          )}
        </div>
      )}
    </main>
  );
}
