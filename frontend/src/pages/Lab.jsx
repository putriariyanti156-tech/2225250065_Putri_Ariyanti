import { useState } from 'react';
import { Kepala, Umpan } from '../components/ui.jsx';
import GarisBilangan from '../components/GarisBilangan.jsx';
import InputJawaban from '../components/InputJawaban.jsx';
import { bacaAngka, fmt, fmtOperand } from '../lib/math/format.js';
import { NavBawah } from './Beranda.jsx';

/** Lab "Coba sendiri": siswa memasukkan soal, garis bilangan memvisualisasikannya. */
export default function Lab() {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [op, setOp] = useState('+');
  const [aktif, setAktif] = useState('a');
  const [tampil, setTampil] = useState(null);
  const [galat, setGalat] = useState('');

  const jalankan = () => {
    const x = bacaAngka(a);
    const y = bacaAngka(b);
    setGalat('');
    if (x === null || y === null) return setGalat('Isi kedua bilangan dulu.');
    if (Math.abs(x) > 30 || Math.abs(y) > 30) return setGalat('Gunakan bilangan antara −30 dan 30 agar garis bilangan tetap jelas.');
    if (op === '×') {
      if (x < 1 || x > 8) return setGalat('Untuk perkalian, bilangan pertama 1 sampai 8 (banyaknya lompatan).');
      if (Math.abs(x * y) > 40) return setGalat('Hasil perkalian terlalu besar untuk garis bilangan. Coba bilangan lebih kecil.');
      return setTampil({ mulai: 0, langkah: Array(x).fill(y), teks: `${fmt(x)} × ${fmtOperand(y)} = ${fmt(x * y)}`, ket: `Lompat ${Math.abs(y)} ke ${y >= 0 ? 'kanan' : 'kiri'}, sebanyak ${x} kali.` });
    }
    const gerak = op === '+' ? y : -y;
    setTampil({
      mulai: x,
      langkah: [gerak],
      teks: `${fmt(x)} ${op} ${fmtOperand(y)} = ${fmt(op === '+' ? x + y : x - y)}`,
      ket: op === '−' ? `Mengurangi ${fmt(y)} sama dengan menambah ${fmt(-y)}: bergerak ${Math.abs(y)} langkah ke ${gerak >= 0 ? 'kanan' : 'kiri'}.` : `Bergerak ${Math.abs(y)} langkah ke ${gerak >= 0 ? 'kanan' : 'kiri'}.`,
    });
  };

  return (
    <main className="halaman">
      <Kepala judul="Lab Garis Bilangan" />
      <div className="tumpuk">
        <p className="muted" style={{ margin: 0 }}>Buat soalmu sendiri, lalu lihat gerakannya di garis bilangan.</p>
        <div className="kartu">
          <div className="baris" style={{ justifyContent: 'center', fontSize: '1.4em', fontWeight: 700 }}>
            <button className="tombol tipis" aria-pressed={aktif === 'a'} style={aktif === 'a' ? { borderColor: 'var(--primary)' } : {}} onClick={() => setAktif('a')}>
              {a || 'a'}
            </button>
            {['+', '−', '×'].map((o) => (
              <button key={o} className="tombol tipis" aria-pressed={op === o} style={op === o ? { background: 'var(--primary)', color: 'var(--primary-ink)' } : {}} onClick={() => setOp(o)} aria-label={o === '+' ? 'tambah' : o === '−' ? 'kurang' : 'kali'}>
                {o}
              </button>
            ))}
            <button className="tombol tipis" aria-pressed={aktif === 'b'} style={aktif === 'b' ? { borderColor: 'var(--primary)' } : {}} onClick={() => setAktif('b')}>
              {b ? fmtOperand(bacaAngka(b) ?? 0) : 'b'}
            </button>
          </div>
          <div style={{ marginTop: 10 }}>
            <InputJawaban nilai={aktif === 'a' ? a : b} ubah={aktif === 'a' ? setA : setB} label={aktif === 'a' ? 'Bilangan pertama' : 'Bilangan kedua'} kirim={jalankan} />
          </div>
          <button className="tombol utama penuh" style={{ marginTop: 10 }} onClick={jalankan}>
            Tampilkan di garis bilangan
          </button>
        </div>
        {galat && <Umpan jenis="info">{galat}</Umpan>}
        {tampil && (
          <div className="kartu">
            <div className="ekspresi sedang">{tampil.teks}</div>
            <GarisBilangan mulai={tampil.mulai} langkah={tampil.langkah} />
            <p className="kecil" style={{ marginTop: 8 }}>{tampil.ket}</p>
          </div>
        )}
      </div>
      <NavBawah />
    </main>
  );
}
