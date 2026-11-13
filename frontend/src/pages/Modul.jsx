import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ambilModul, ambilStimulus } from '../lib/konten.js';
import { ambilProgres, simpanProgres, simpan, ambilPengaturan, catatKejadian } from '../lib/db.js';
import { sinkronkan } from '../lib/sinkron.js';
import { Kepala, Kaki, Pemandu, Umpan, Kemajuan } from '../components/ui.jsx';
import Visual from '../components/Visual.jsx';
import { ContohLengkap, ContohBerlubang } from '../components/Contoh.jsx';
import { SoalLatihan } from '../components/Latihan.jsx';
import { PanelStimulus, ButirLiterasi } from '../components/Literasi.jsx';
import { TombolAturanTanda, TombolStrategi } from '../components/Bantuan.jsx';
import SkalaBeban from '../components/SkalaBeban.jsx';

const NAMA_TAHAP = {
  kartu: 'Ringkasan',
  contoh: 'Contoh',
  latihan: 'Latihan',
  jelaskan: 'Jelaskan kembali',
  literasi: 'Tantangan Literasi',
  refleksi: 'Refleksi',
};

function hitungBintang(rasio) {
  if (rasio >= 0.8) return 3;
  if (rasio >= 0.5) return 2;
  return 1;
}

// ------------------------------------------------------------------
function TahapKartu({ modul, lanjut }) {
  const [i, setI] = useState(0);
  const k = modul.kartu[i];
  const akhir = i === modul.kartu.length - 1;
  return (
    <>
      <div className="tumpuk">
        <Kemajuan total={modul.kartu.length} aktif={i} />
        <article className="kartu tumpuk" aria-live="polite">
          <h2>{k.judul}</h2>
          <p>{k.teks}</p>
          {k.visual && <Visual key={i} visual={k.visual} />}
        </article>
        <Pemandu>{k.pemandu}</Pemandu>
      </div>
      <Kaki>
        <button className="tombol tipis" disabled={i === 0} onClick={() => setI(i - 1)}>
          ← Kembali
        </button>
        <button className="tombol utama" onClick={() => (akhir ? lanjut() : setI(i + 1))}>
          {akhir ? 'Ke contoh →' : 'Lanjut →'}
        </button>
      </Kaki>
    </>
  );
}

function TahapContoh({ modul, lanjut }) {
  const daftar = useMemo(
    () => [
      ...modul.contoh.lengkap.map((c) => ({ c, jenis: 'lengkap' })),
      ...modul.contoh.berlubang.map((c) => ({ c, jenis: 'berlubang' })),
    ],
    [modul],
  );
  const [i, setI] = useState(0);
  const item = daftar[i];
  const berikut = () => (i + 1 < daftar.length ? setI(i + 1) : lanjut());
  return (
    <div className="tumpuk">
      <div className="baris ujung">
        <span className="kecil muted">
          Contoh {i + 1} dari {daftar.length}
        </span>
        <button
          className="tombol tipis"
          onClick={() => {
            catatKejadian('lewati_contoh', { modulId: modul.id, posisi: i });
            lanjut();
          }}
        >
          Saya sudah paham, lewati
        </button>
      </div>
      {item.jenis === 'lengkap' ? <ContohLengkap key={item.c.id} contoh={item.c} selesai={berikut} /> : <ContohBerlubang key={item.c.id} contoh={item.c} selesai={berikut} />}
    </div>
  );
}

function TahapLatihan({ modul, lanjut }) {
  const [i, setI] = useState(0);
  const hasil = useRef([]);
  const soal = modul.latihan[i];
  const selesai = (h) => {
    hasil.current[i] = h.benarPertama;
    if (i + 1 < modul.latihan.length) setI(i + 1);
    else lanjut({ latihan: hasil.current });
  };
  return (
    <div className="tumpuk">
      <div className="baris ujung">
        <span className="kecil muted">
          Soal {i + 1} dari {modul.latihan.length}
        </span>
        <span className="lencana">{soal.id}</span>
      </div>
      <Kemajuan total={modul.latihan.length} aktif={i} />
      <SoalLatihan key={soal.id} soal={soal} modulId={modul.id} selesai={selesai} />
    </div>
  );
}

function TahapJelaskan({ modul, lanjut }) {
  const [i, setI] = useState(0);
  const [pilih, setPilih] = useState(null);
  const q = modul.jelaskan[i];
  const benar = pilih === q.kunci;
  const jawab = (j) => {
    if (benar) return;
    setPilih(j);
    simpan('percobaan', { soalId: `${modul.id}-JK-${i + 1}`, modulId: modul.id, jenis: 'jelaskan', jawaban: q.opsi[j], benar: j === q.kunci });
  };
  return (
    <div className="tumpuk">
      <Pemandu>Coba jelaskan dengan kata-katamu sendiri dulu dalam hati, lalu pilih alasan yang paling tepat.</Pemandu>
      <div className="kartu">
        <strong>{q.pertanyaan}</strong>
      </div>
      {q.opsi.map((o, j) => (
        <button key={j} className={`pilihan ${pilih === j ? (j === q.kunci ? 'benar' : 'salah') : ''}`} onClick={() => jawab(j)} disabled={benar}>
          {o}
        </button>
      ))}
      {pilih !== null && (
        <Umpan jenis={benar ? 'benar' : 'salah'} judul={benar ? 'Tepat!' : 'Belum tepat, coba alasan lain.'}>
          {benar && q.penjelasan}
        </Umpan>
      )}
      {benar && (
        <button
          className="tombol utama penuh"
          onClick={() => {
            if (i + 1 < modul.jelaskan.length) {
              setI(i + 1);
              setPilih(null);
            } else lanjut();
          }}
        >
          Lanjut →
        </button>
      )}
    </div>
  );
}

function TahapLiterasi({ modul, lanjut }) {
  const stimulus = useMemo(() => modul.literasi.map(ambilStimulus).filter(Boolean), [modul]);
  const [s, setS] = useState(0);
  const [b, setB] = useState(0);
  const hasil = useRef([]);
  const st = stimulus[s];
  const butir = st.butir[b];
  const berikut = () => {
    if (b + 1 < st.butir.length) setB(b + 1);
    else if (s + 1 < stimulus.length) {
      setS(s + 1);
      setB(0);
    } else lanjut({ literasi: hasil.current });
  };
  return (
    <div className="tumpuk">
      <div className="baris ujung">
        <span className="kecil muted">
          {stimulus.length > 1 ? `Stimulus ${s + 1}/${stimulus.length} · ` : ''}Soal {b + 1}/{st.butir.length}
        </span>
      </div>
      <PanelStimulus key={st.id} stimulus={st} />
      <ButirLiterasi
        key={butir.id}
        butir={butir}
        stimulusId={st.id}
        modulId={modul.id}
        onJawab={(r) => r.benar !== null && hasil.current.push(r.benar)}
        onLanjut={berikut}
      />
    </div>
  );
}

function TahapRefleksi({ modul, selesai }) {
  const [aktif, setAktif] = useState(null);
  useEffect(() => {
    ambilPengaturan().then((p) => setAktif(p.instrumenPenelitianAktif));
  }, []);
  if (aktif === null) return null;
  return (
    <div className="tumpuk">
      <Pemandu>Kamu sudah sampai di akhir modul {modul.nomor}. Keren!</Pemandu>
      {aktif ? (
        <div className="kartu">
          <SkalaBeban
            kirim={async (skor) => {
              await simpan('bebanKognitif', { modulId: modul.id, skor });
              selesai();
            }}
          />
        </div>
      ) : (
        <button className="tombol utama penuh" onClick={selesai}>
          Selesaikan modul
        </button>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
export default function Modul() {
  const { id } = useParams();
  const nav = useNavigate();
  const modul = ambilModul(id);
  const tahapan = useMemo(() => {
    if (!modul) return [];
    return ['kartu', 'contoh', modul.latihan.length && 'latihan', modul.jelaskan.length && 'jelaskan', modul.literasi.length && 'literasi', 'refleksi'].filter(Boolean);
  }, [modul]);
  const [t, setT] = useState(null);
  const skor = useRef({ latihan: [], literasi: [] });

  useEffect(() => {
    if (!modul) return;
    ambilProgres(modul.id).then((p) => {
      const idx = p.status === 'sedang' && p.tahap ? Math.max(0, tahapan.indexOf(p.tahap)) : 0;
      setT(idx);
    });
  }, [modul, tahapan]);

  if (!modul) return <main className="halaman"><Kepala judul="Modul tidak ditemukan" /></main>;
  if (t === null) return null;

  const nama = tahapan[t];
  const pindah = async (idx) => {
    setT(idx);
    window.scrollTo(0, 0);
    await simpanProgres(modul.id, { status: 'sedang', tahap: tahapan[idx] });
  };
  const lanjut = (data) => {
    if (data?.latihan) skor.current.latihan = data.latihan;
    if (data?.literasi) skor.current.literasi = data.literasi;
    pindah(t + 1);
  };
  const selesai = async () => {
    const sumber = skor.current.latihan.length ? skor.current.latihan : skor.current.literasi;
    const rasio = sumber.length ? sumber.filter(Boolean).length / sumber.length : 1;
    const lama = await ambilProgres(modul.id);
    const bintang = Math.max(hitungBintang(rasio), lama.status === 'selesai' ? lama.bintang : 0);
    await simpanProgres(modul.id, { status: 'selesai', tahap: null, bintang });
    sinkronkan();
    nav('/');
  };

  return (
    <main className="halaman">
      <Kepala
        judul={`${modul.nomor}. ${modul.judul}`}
        kanan={
          <>
            {nama === 'literasi' && <TombolStrategi konteks={{ modulId: modul.id }} />}
            {['contoh', 'latihan', 'literasi'].includes(nama) && <TombolAturanTanda konteks={{ modulId: modul.id, tahap: nama }} />}
          </>
        }
      />
      <nav className="baris" aria-label="Tahap modul" style={{ marginBottom: 16 }}>
        {tahapan.map((x, i) => (
          <button key={x} className={`lencana ${i === t ? 'sedang' : i < t ? 'selesai' : ''}`} style={{ cursor: i <= t ? 'pointer' : 'default', background: 'var(--surface)', minHeight: 32 }} disabled={i > t} onClick={() => i <= t && pindah(i)} aria-current={i === t ? 'step' : undefined}>
            {i < t ? '✓ ' : ''}
            {NAMA_TAHAP[x]}
          </button>
        ))}
      </nav>

      {nama === 'kartu' && <TahapKartu modul={modul} lanjut={lanjut} />}
      {nama === 'contoh' && <TahapContoh modul={modul} lanjut={lanjut} />}
      {nama === 'latihan' && <TahapLatihan modul={modul} lanjut={lanjut} />}
      {nama === 'jelaskan' && <TahapJelaskan modul={modul} lanjut={lanjut} />}
      {nama === 'literasi' && <TahapLiterasi modul={modul} lanjut={lanjut} />}
      {nama === 'refleksi' && <TahapRefleksi modul={modul} selesai={selesai} />}
    </main>
  );
}
