import { useState } from 'react';
import GarisBilangan from './GarisBilangan.jsx';

export function TabelTanda() {
  return (
    <div>
      <table className="tabel">
        <caption className="sr-only">Aturan tanda perkalian dan pembagian</caption>
        <thead>
          <tr>
            <th>Tanda bilangan</th>
            <th>Hasil × dan :</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>positif dan positif</td>
            <td className="pos">positif (+)</td>
          </tr>
          <tr>
            <td>positif dan negatif</td>
            <td className="neg">negatif (−)</td>
          </tr>
          <tr>
            <td>negatif dan positif</td>
            <td className="neg">negatif (−)</td>
          </tr>
          <tr>
            <td>negatif dan negatif</td>
            <td className="pos">positif (+)</td>
          </tr>
        </tbody>
      </table>
      <p className="kecil muted" style={{ marginTop: 8 }}>
        ⚠ Hanya untuk kali dan bagi. Untuk tambah dan kurang, pakai garis bilangan.
      </p>
    </div>
  );
}

export function Tangga() {
  const anak = [
    ['①', 'Tanda kurung', 'Kerjakan yang di dalam kurung lebih dulu.'],
    ['②', 'Kali (×) dan bagi (:)', 'Setara. Kerjakan dari kiri ke kanan.'],
    ['③', 'Tambah (+) dan kurang (−)', 'Setara. Kerjakan dari kiri ke kanan.'],
  ];
  return (
    <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {anak.map(([n, j, t], i) => (
        <li key={n} className="kartu" style={{ marginLeft: i * 18, marginTop: i ? 8 : 0, padding: 10 }}>
          <strong>
            {n} {j}
          </strong>
          <div className="kecil muted">{t}</div>
        </li>
      ))}
    </ol>
  );
}

export function DaftarStrategi() {
  return (
    <ol style={{ paddingLeft: 22, margin: 0 }}>
      <li>Apa situasinya? (suhu, uang, lantai, laut …)</li>
      <li>Angka apa yang penting? Apa satuannya?</li>
      <li>Apa yang ditanyakan?</li>
      <li>Operasi apa yang cocok? Tulis modelnya.</li>
      <li>Apakah hasilnya masuk akal? Apa artinya?</li>
    </ol>
  );
}

function TabelPola({ kolom, baris, catatan }) {
  const [tampil, setTampil] = useState(1);
  return (
    <div>
      <table className="tabel">
        <thead>
          <tr>
            {kolom.map((k) => (
              <th key={k}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {baris.slice(0, tampil).map((b) => (
            <tr key={b[0]}>
              {b.map((sel, i) => (
                <td key={i} style={{ fontWeight: i === b.length - 1 ? 700 : 400 }}>
                  {sel}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="baris" style={{ marginTop: 8 }}>
        {tampil < baris.length ? (
          <button className="tombol" onClick={() => setTampil((t) => t + 1)}>
            Tampilkan baris berikutnya
          </button>
        ) : (
          catatan && <p className="kecil" style={{ margin: 0 }}>{catatan}</p>
        )}
      </div>
    </div>
  );
}

/** Menampilkan visual kartu materi sesuai jenisnya. */
export default function Visual({ visual }) {
  if (!visual) return null;
  switch (visual.tipe) {
    case 'garis':
      return <GarisBilangan {...visual} />;
    case 'tabelPola':
      return <TabelPola {...visual} />;
    case 'tabelTanda':
      return <TabelTanda />;
    case 'tangga':
      return <Tangga />;
    case 'strategi':
      return <DaftarStrategi />;
    case 'ekspresi':
      return <div className="ekspresi sedang">{visual.teks}</div>;
    case 'daftar':
      return (
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          {visual.butir.map((b) => (
            <li key={b} style={{ marginBottom: 4 }}>
              {b}
            </li>
          ))}
        </ul>
      );
    default:
      return null;
  }
}
