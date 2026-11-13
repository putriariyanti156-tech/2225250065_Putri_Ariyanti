import { useMemo, useState, useEffect } from 'react';
import Visual from './Visual.jsx';
import InputJawaban from './InputJawaban.jsx';
import { Umpan } from './ui.jsx';
import { selesaikan } from '../lib/math/stepper.js';
import { bacaAngka, fmt } from '../lib/math/format.js';
import { diagnosa } from '../lib/math/diagnosa.js';

/** Ekspresi dengan bagian aktif disorot. */
export function EkspresiSorot({ teks, rentang, kelas = 'ekspresi sedang' }) {
  if (!rentang) return <div className={kelas}>{teks}</div>;
  const [a, b] = rentang;
  return (
    <div className={kelas}>
      {teks.slice(0, a)}
      <span className="sorot">{teks.slice(a, b)}</span>
      {teks.slice(b)}
    </div>
  );
}

/** Satu langkah otomatis dari mesin langkah: ekspresi + sorotan + alasan + hasil bagian. */
function LangkahOtomatis({ l, tampilHasil = true }) {
  return (
    <div className="kartu">
      <EkspresiSorot teks={l.ekspresiSebelum} rentang={l.bagianAktif} />
      {l.alasan && <p className="kecil">{l.alasan}</p>}
      {tampilHasil && (
        <>
          <p className="langkah-baris" style={{ margin: 0 }}>
            {l.bagianTeks} = {fmt(l.hasilBagian)}
          </p>
          {l.tanda && <p className="kecil muted" style={{ margin: 0 }}>{l.tanda}</p>}
        </>
      )}
    </div>
  );
}

/** Contoh lengkap: langkah dibuka satu per satu dengan tombol. */
export function ContohLengkap({ contoh, selesai }) {
  const otomatis = useMemo(() => (contoh.otomatis ? selesaikan(contoh.soal) : null), [contoh]);
  const total = otomatis ? otomatis.langkah.length : contoh.langkah.length;
  const [n, setN] = useState(1);
  useEffect(() => setN(1), [contoh.id]);

  return (
    <div className="tumpuk">
      <div className="kartu">
        <p className="muted kecil" style={{ margin: 0 }}>Contoh lengkap</p>
        <div className={contoh.soal.length > 40 ? '' : 'ekspresi'}>{contoh.soal}</div>
      </div>
      {contoh.visual && (
        <div className="kartu">
          <Visual visual={contoh.visual} />
        </div>
      )}
      {otomatis
        ? otomatis.langkah.slice(0, n).map((l, i) => <LangkahOtomatis key={i} l={l} />)
        : contoh.langkah.slice(0, n).map((l, i) => (
            <div className="kartu" key={i}>
              <span className="muted kecil">Langkah {i + 1}</span>
              <p style={{ margin: 0 }}>{l.teks}</p>
            </div>
          ))}
      {otomatis && n >= total && (
        <Umpan jenis="info" judul={`Hasil akhir: ${fmt(otomatis.hasil)}`} />
      )}
      <div className="baris">
        {n < total ? (
          <button className="tombol utama penuh" onClick={() => setN(n + 1)}>
            Langkah berikutnya ({n}/{total})
          </button>
        ) : (
          selesai && (
            <button className="tombol utama penuh" onClick={selesai}>
              Saya sudah paham →
            </button>
          )
        )}
      </div>
    </div>
  );
}

/** Contoh berlubang: siswa mengisi langkah yang kosong sebelum lanjut. */
export function ContohBerlubang({ contoh, selesai }) {
  const otomatis = useMemo(() => (contoh.otomatis ? selesaikan(contoh.soal) : null), [contoh]);
  const langkah = otomatis
    ? otomatis.langkah.map((l) => ({ otomatis: l, isian: l.hasilBagian }))
    : contoh.langkah;
  const [n, setN] = useState(0);
  const [nilai, setNilai] = useState('');
  const [umpan, setUmpan] = useState(null);
  useEffect(() => {
    setN(0);
    setNilai('');
    setUmpan(null);
  }, [contoh.id]);

  const aktif = langkah[n];
  const butuhIsian = aktif && aktif.isian !== undefined;

  const periksa = () => {
    const v = bacaAngka(nilai);
    if (v === null) return setUmpan({ jenis: 'info', teks: 'Tulis jawabanmu dengan angka dulu.' });
    if (v === aktif.isian) {
      setUmpan(null);
      setNilai('');
      setN(n + 1);
    } else {
      const d = aktif.otomatis
        ? diagnosa(aktif.otomatis.bagianTeks, v)
        : null;
      setUmpan({ jenis: 'salah', teks: d?.pesan || 'Belum tepat. Coba periksa lagi langkahnya.' });
    }
  };

  const lanjutTanpaIsian = () => setN(n + 1);

  return (
    <div className="tumpuk">
      <div className="kartu">
        <p className="muted kecil" style={{ margin: 0 }}>Lengkapi contoh ini</p>
        <div className={contoh.soal.length > 40 ? '' : 'ekspresi'}>{contoh.soal}</div>
      </div>

      {langkah.slice(0, n).map((l, i) =>
        l.otomatis ? (
          <LangkahOtomatis key={i} l={l.otomatis} />
        ) : (
          <div className="kartu" key={i}>
            <p style={{ margin: 0 }}>
              {l.isian !== undefined ? l.teks.replace('___', fmt(l.isian)) : l.teks}
              {l.isian !== undefined && <span className="pos"> ✓</span>}
            </p>
          </div>
        ),
      )}

      {aktif && (
        <div className="kartu" style={{ borderColor: 'var(--primary)', borderWidth: 2 }}>
          {aktif.otomatis ? (
            <>
              <LangkahOtomatis l={aktif.otomatis} tampilHasil={false} />
              <p className="langkah-baris" style={{ marginTop: 8 }}>
                {aktif.otomatis.bagianTeks} = ?
              </p>
            </>
          ) : (
            <p style={{ margin: 0 }}>{aktif.teks}</p>
          )}
          {butuhIsian ? (
            <div className="tumpuk" style={{ marginTop: 10 }}>
              <InputJawaban nilai={nilai} ubah={setNilai} kirim={periksa} />
              {umpan && <Umpan jenis={umpan.jenis}>{umpan.teks}</Umpan>}
              <button className="tombol utama penuh" onClick={periksa}>
                Periksa
              </button>
            </div>
          ) : (
            <button className="tombol penuh" style={{ marginTop: 10 }} onClick={lanjutTanpaIsian}>
              Lanjut
            </button>
          )}
        </div>
      )}

      {!aktif && (
        <>
          <Umpan jenis="benar" judul="Hebat, contoh ini sudah lengkap!">
            {otomatis && `Hasil akhir: ${fmt(otomatis.hasil)}`}
          </Umpan>
          {selesai && (
            <button className="tombol utama penuh" onClick={selesai}>
              Lanjut →
            </button>
          )}
        </>
      )}
    </div>
  );
}
