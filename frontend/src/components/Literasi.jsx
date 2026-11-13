import { useRef, useState } from 'react';
import InputJawaban from './InputJawaban.jsx';
import { Umpan, Lembar } from './ui.jsx';
import { bacaAngka, fmt } from '../lib/math/format.js';
import { simpan } from '../lib/db.js';
import { NAMA_INDIKATOR, NAMA_KONTEKS } from '../lib/konten.js';

/** Stimulus tetap terlihat saat menjawab (bisa diciutkan) agar tidak terjadi split attention. */
export function PanelStimulus({ stimulus }) {
  const [buka, setBuka] = useState(true);
  const [istilah, setIstilah] = useState(null);
  return (
    <section className="kartu" aria-label={`Stimulus: ${stimulus.judul}`}>
      <button className="baris ujung" style={{ width: '100%', background: 'none', border: 0, padding: 0, cursor: 'pointer', textAlign: 'left' }} aria-expanded={buka} onClick={() => setBuka(!buka)}>
        <strong>
          {buka ? '▼' : '▶'} {stimulus.judul}
        </strong>
        <span className="lencana">{NAMA_KONTEKS[stimulus.konteks]}</span>
      </button>
      {buka && (
        <div className="tumpuk" style={{ marginTop: 10 }}>
          {stimulus.kalimat.map((k) => (
            <p key={k} style={{ margin: 0 }}>
              {k}
            </p>
          ))}
          {stimulus.tabel && (
            <div className="gulir-x">
              <table className="tabel">
                <thead>
                  <tr>
                    {stimulus.tabel.kolom.map((k) => (
                      <th key={k}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stimulus.tabel.baris.map((b) => (
                    <tr key={b[0]}>
                      {b.map((s, i) => (
                        <td key={i}>{s}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {stimulus.glosarium?.length > 0 && (
            <div className="baris">
              <span className="kecil muted">Istilah:</span>
              {stimulus.glosarium.map((g) => (
                <button key={g.istilah} className="lencana" style={{ cursor: 'pointer', background: 'var(--surface)', minHeight: 32 }} onClick={() => setIstilah(g)}>
                  {g.istilah}
                </button>
              ))}
            </div>
          )}
          {stimulus.dataIlustratif && <p className="kecil muted" style={{ margin: 0 }}>Data ilustrasi, bukan data resmi.</p>}
        </div>
      )}
      <Lembar terbuka={!!istilah} tutup={() => setIstilah(null)} judul={istilah?.istilah || ''}>
        <p>{istilah?.arti}</p>
      </Lembar>
    </section>
  );
}

function Opsi({ teks, dipilih, onClick, status, peran = 'button', nonaktif }) {
  const ikon = status === 'benar' ? '✓' : status === 'salah' ? '✗' : dipilih ? '●' : '○';
  return (
    <button className={`pilihan ${status || ''}`} aria-pressed={dipilih} onClick={onClick} disabled={nonaktif} role={peran === 'checkbox' ? 'checkbox' : undefined} aria-checked={peran === 'checkbox' ? dipilih : undefined}>
      <span aria-hidden="true">{ikon}</span>
      <span>{teks}</span>
    </button>
  );
}

function samaHimpunan(a, b) {
  return a.length === b.length && [...a].sort().every((v, i) => v === [...b].sort()[i]);
}

/**
 * Satu butir literasi. mode "latihan": ada umpan balik & pembahasan.
 * mode "tes": tanpa umpan balik; hasil dikirim lewat onJawab.
 */
export function ButirLiterasi({ butir, stimulusId, mode = 'latihan', modulId = null, onJawab, onLanjut }) {
  const [jawaban, setJawaban] = useState(() => awal(butir));
  const [terkirim, setTerkirim] = useState(false);
  const [benar, setBenar] = useState(null);
  const [uraian, setUraian] = useState('');
  const [bahas, setBahas] = useState(false);
  const mulai = useRef(Date.now());
  const latihan = mode === 'latihan';

  const siap = (() => {
    switch (butir.bentuk) {
      case 'pg':
        return jawaban !== null;
      case 'pgKompleksBS':
        return jawaban.every((v) => v !== null);
      case 'pgKompleksMulti':
        return jawaban.length > 0;
      case 'menjodohkan':
        return jawaban.pasangan.every((v) => v !== null);
      case 'isian':
        return bacaAngka(jawaban) !== null;
      case 'pilihAlasan':
        return jawaban.klaim !== null && jawaban.alasan !== null;
      case 'uraian':
        return uraian.trim().length >= 5;
      default:
        return false;
    }
  })();

  const kirim = async () => {
    if (!siap || terkirim) return;
    const ok = nilai(butir, jawaban);
    const rekaman = {
      butirId: butir.id,
      stimulusId,
      modulId,
      mode,
      bentuk: butir.bentuk,
      indikator: butir.indikator,
      jawaban:
        butir.bentuk === 'uraian'
          ? null
          : butir.bentuk === 'menjodohkan'
            ? jawaban.pasangan
            : butir.bentuk === 'isian'
              ? bacaAngka(jawaban)
              : jawaban,
      benar: ok,
      teksUraian: butir.bentuk === 'uraian' || (butir.bentuk === 'pilihAlasan' && uraian.trim()) ? uraian.trim() : null,
      durasiDetik: Math.round((Date.now() - mulai.current) / 1000),
    };
    await simpan('jawabanLiterasi', rekaman);
    setTerkirim(true);
    setBenar(ok);
    onJawab?.(rekaman);
  };

  const status = (benarKah, dipilihKah) => {
    if (!terkirim || !latihan) return null;
    if (benarKah) return 'benar';
    if (dipilihKah) return 'salah';
    return null;
  };
  const kunci = (k) => (terkirim && latihan ? k : undefined);

  return (
    <div className="tumpuk">
      <div className="kartu">
        <div className="baris" style={{ marginBottom: 6 }}>
          {butir.indikator.map((i) => (
            <span key={i} className="lencana">
              {NAMA_INDIKATOR[i]}
            </span>
          ))}
        </div>
        {butir.bentuk === 'pilihAlasan' ? (
          <>
            <p style={{ margin: 0 }}>
              <strong>{butir.tokoh}</strong> berkata:
            </p>
            <p style={{ fontSize: '1.1em', fontWeight: 700, margin: '4px 0 0' }}>“{butir.klaim}”</p>
          </>
        ) : (
          <p style={{ fontSize: '1.1em', fontWeight: 700, margin: 0 }}>{butir.soal}</p>
        )}
      </div>

      {butir.bentuk === 'pg' &&
        butir.opsi.map((o, i) => (
          <Opsi key={i} teks={o} dipilih={jawaban === i} nonaktif={terkirim} status={status(kunci(butir.kunci) === i, jawaban === i)} onClick={() => setJawaban(i)} />
        ))}

      {butir.bentuk === 'pgKompleksMulti' && (
        <>
          <p className="kecil muted" style={{ margin: 0 }}>Boleh memilih lebih dari satu.</p>
          {butir.opsi.map((o, i) => (
            <Opsi
              key={i}
              teks={o}
              peran="checkbox"
              dipilih={jawaban.includes(i)}
              nonaktif={terkirim}
              status={status(terkirim && butir.kunci.includes(i), jawaban.includes(i))}
              onClick={() => setJawaban(jawaban.includes(i) ? jawaban.filter((x) => x !== i) : [...jawaban, i])}
            />
          ))}
        </>
      )}

      {butir.bentuk === 'pgKompleksBS' &&
        butir.pernyataan.map((p, i) => (
          <div key={i} className="kartu" style={{ padding: 12 }}>
            <p style={{ marginTop: 0 }}>{p.teks}</p>
            <div className="baris">
              {[true, false].map((v) => {
                const dipilih = jawaban[i] === v;
                const st = status(terkirim && p.kunci === v, dipilih);
                return (
                  <button key={String(v)} className={`pilihan ${st || ''}`} style={{ flex: 1, marginTop: 0 }} aria-pressed={dipilih} disabled={terkirim} onClick={() => setJawaban(jawaban.map((x, j) => (j === i ? v : x)))}>
                    {v ? 'Benar' : 'Salah'}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

      {butir.bentuk === 'menjodohkan' && (
        <Menjodohkan butir={butir} jawaban={jawaban} ubah={setJawaban} terkirim={terkirim} tampilKunci={latihan && terkirim} />
      )}

      {butir.bentuk === 'isian' && (
        <>
          <InputJawaban nilai={jawaban} ubah={setJawaban} kirim={kirim} nonaktif={terkirim} label={butir.satuan ? `Jawaban (${butir.satuan})` : 'Jawaban'} />
        </>
      )}

      {butir.bentuk === 'pilihAlasan' && (
        <>
          <p style={{ margin: 0 }}><strong>Apakah pendapat {butir.tokoh} tepat?</strong></p>
          <div className="baris">
            {['Tepat', 'Kurang tepat'].map((t, i) => (
              <button key={t} className={`pilihan ${status(terkirim && butir.kunciKlaim === i, jawaban.klaim === i) || ''}`} style={{ flex: 1, marginTop: 0 }} aria-pressed={jawaban.klaim === i} disabled={terkirim} onClick={() => setJawaban({ ...jawaban, klaim: i })}>
                {t}
              </button>
            ))}
          </div>
          <p style={{ margin: 0 }}><strong>Pilih alasan yang paling tepat:</strong></p>
          {butir.opsiAlasan.map((o, i) => (
            <Opsi key={i} teks={o} dipilih={jawaban.alasan === i} nonaktif={terkirim} status={status(terkirim && butir.kunciAlasan === i, jawaban.alasan === i)} onClick={() => setJawaban({ ...jawaban, alasan: i })} />
          ))}
          {butir.izinkanUraian && (
            <div>
              <label htmlFor={`ur-${butir.id}`}>Jelaskan dengan kalimatmu sendiri (boleh dikosongkan)</label>
              <textarea id={`ur-${butir.id}`} value={uraian} disabled={terkirim} onChange={(e) => setUraian(e.target.value)} />
            </div>
          )}
        </>
      )}

      {butir.bentuk === 'uraian' && (
        <div>
          <label htmlFor={`ur-${butir.id}`}>Tulis jawabanmu</label>
          <textarea id={`ur-${butir.id}`} value={uraian} disabled={terkirim} onChange={(e) => setUraian(e.target.value)} placeholder="Gunakan perhitungan untuk mendukung jawabanmu." />
          <p className="kecil muted">Jawaban ini akan dinilai oleh guru.</p>
        </div>
      )}

      {!terkirim && (
        <button className="tombol utama penuh" disabled={!siap} onClick={kirim}>
          {latihan ? 'Periksa' : 'Simpan jawaban'}
        </button>
      )}

      {terkirim && latihan && (
        <>
          {butir.bentuk === 'uraian' ? (
            <Umpan jenis="info" judul="Jawabanmu tersimpan">
              Bandingkan dengan contoh jawaban ini: <em>{butir.contohJawaban}</em>
            </Umpan>
          ) : (
            <Umpan jenis={benar ? 'benar' : 'salah'} judul={benar ? 'Tepat!' : 'Belum tepat'}>
              {butir.pembahasan}
              {butir.bentuk === 'isian' && !benar && <div>Jawaban yang benar: {fmt(butir.kunci)} {butir.satuan || ''}</div>}
            </Umpan>
          )}
          {butir.modelPembahasan && (
            <button className="tombol tipis" onClick={() => setBahas(true)}>
              Lihat model matematika
            </button>
          )}
          <Lembar terbuka={bahas} tutup={() => setBahas(false)} judul="Model matematika">
            <div className="ekspresi sedang">
              {butir.modelPembahasan} = {fmt(butir.kunci)}
            </div>
          </Lembar>
        </>
      )}

      {terkirim && onLanjut && (
        <button className="tombol utama penuh" onClick={onLanjut}>
          Lanjut →
        </button>
      )}
    </div>
  );
}

function Menjodohkan({ butir, jawaban, ubah, terkirim, tampilKunci }) {
  const { pasangan, aktif } = jawaban;
  return (
    <div className="tumpuk">
      <p className="kecil muted" style={{ margin: 0 }}>Ketuk item di kiri, lalu ketuk pasangannya.</p>
      {butir.kiri.map((k, i) => {
        const p = pasangan[i];
        const st = tampilKunci ? (p === butir.kunci[i] ? 'benar' : 'salah') : '';
        return (
          <div key={k} className="kartu" style={{ padding: 10, borderColor: aktif === i ? 'var(--primary)' : undefined, borderWidth: aktif === i ? 2 : 1 }}>
            <button className={`pilihan ${st}`} style={{ marginTop: 0 }} disabled={terkirim} aria-pressed={aktif === i} onClick={() => ubah({ ...jawaban, aktif: aktif === i ? null : i })}>
              <strong>{k}</strong>
              <span style={{ marginLeft: 'auto' }}>→ {p === null ? '…' : butir.kanan[p]}</span>
            </button>
            {aktif === i && (
              <div className="baris" style={{ marginTop: 8 }}>
                {butir.kanan.map((r, j) => (
                  <button key={r} className="tombol tipis" onClick={() => ubah({ pasangan: pasangan.map((x, n) => (n === i ? j : x === j ? null : x)), aktif: null })}>
                    {r}
                  </button>
                ))}
              </div>
            )}
            {tampilKunci && p !== butir.kunci[i] && <div className="kecil">Pasangan yang benar: {butir.kanan[butir.kunci[i]]}</div>}
          </div>
        );
      })}
    </div>
  );
}

function awal(butir) {
  switch (butir.bentuk) {
    case 'pg':
      return null;
    case 'pgKompleksBS':
      return butir.pernyataan.map(() => null);
    case 'pgKompleksMulti':
      return [];
    case 'menjodohkan':
      return { pasangan: butir.kiri.map(() => null), aktif: null };
    case 'isian':
      return '';
    case 'pilihAlasan':
      return { klaim: null, alasan: null };
    default:
      return null;
  }
}

/** Penilaian otomatis butir objektif. Uraian → null (dinilai guru dengan rubrik). */
export function nilai(butir, jawaban) {
  switch (butir.bentuk) {
    case 'pg':
      return jawaban === butir.kunci;
    case 'pgKompleksBS':
      return butir.pernyataan.every((p, i) => p.kunci === jawaban[i]);
    case 'pgKompleksMulti':
      return samaHimpunan(jawaban, butir.kunci);
    case 'menjodohkan':
      return butir.kunci.every((k, i) => jawaban.pasangan[i] === k);
    case 'isian':
      return bacaAngka(jawaban) === butir.kunci;
    case 'pilihAlasan':
      return jawaban.klaim === butir.kunciKlaim && jawaban.alasan === butir.kunciAlasan;
    default:
      return null;
  }
}
