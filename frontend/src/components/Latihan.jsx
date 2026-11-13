import { useMemo, useRef, useState } from 'react';
import InputJawaban from './InputJawaban.jsx';
import { Umpan, Lembar } from './ui.jsx';
import { ContohLengkap, EkspresiSorot } from './Contoh.jsx';
import { parse, hitung } from '../lib/math/parser.js';
import { selesaikan, kandidat, cariLangkah, pesanPilihanSalah, terapkan, alasanLangkah, penjelasanTanda } from '../lib/math/stepper.js';
import { tulis, bacaAngka, fmt } from '../lib/math/format.js';
import { diagnosa } from '../lib/math/diagnosa.js';
import { simpan, catatKejadian } from '../lib/db.js';
import { ambilContoh, MISKONSEPSI } from '../lib/konten.js';

/** Mencatat satu percobaan menjawab ke IndexedDB (dan antrean sinkron). */
function useCatatan(soal, modulId) {
  const mulai = useRef(Date.now());
  const petunjukDibuka = useRef(0);
  return {
    petunjukDibuka,
    catat: (data) =>
      simpan('percobaan', {
        soalId: soal.id,
        modulId,
        durasiDetik: Math.round((Date.now() - mulai.current) / 1000),
        petunjukDibuka: petunjukDibuka.current,
        ...data,
      }),
  };
}

/** Petunjuk berjenjang: petunjuk 1 → petunjuk 2 → pembahasan (hanya setelah mencoba). */
function Petunjuk({ petunjuk = [], sudahMencoba, pembahasan, saatBuka }) {
  const [level, setLevel] = useState(0);
  const [lihatBahas, setLihatBahas] = useState(false);
  return (
    <div className="tumpuk">
      {petunjuk.slice(0, level).map((p, i) => (
        <Umpan key={i} jenis="info" judul={`Petunjuk ${i + 1}`}>
          {p}
        </Umpan>
      ))}
      <div className="baris">
        {level < petunjuk.length && (
          <button
            className="tombol tipis"
            onClick={() => {
              setLevel(level + 1);
              saatBuka();
            }}
          >
            💡 Petunjuk {level + 1}
          </button>
        )}
        {pembahasan && (
          <button className="tombol tipis" disabled={!sudahMencoba} onClick={() => setLihatBahas(true)} title={sudahMencoba ? '' : 'Coba jawab dulu minimal sekali'}>
            Lihat pembahasan
          </button>
        )}
      </div>
      {!sudahMencoba && pembahasan && <p className="kecil muted" style={{ margin: 0 }}>Pembahasan terbuka setelah kamu mencoba sekali.</p>}
      <Lembar terbuka={lihatBahas} tutup={() => setLihatBahas(false)} judul="Pembahasan">
        {pembahasan}
      </Lembar>
    </div>
  );
}

function PembahasanEkspresi({ ekspresi }) {
  const { langkah, hasil } = useMemo(() => selesaikan(ekspresi), [ekspresi]);
  return (
    <div className="tumpuk">
      <div className="ekspresi sedang">{ekspresi}</div>
      {langkah.map((l, i) => (
        <div key={i} className="kartu">
          <EkspresiSorot teks={l.ekspresiSebelum} rentang={l.bagianAktif} />
          {l.alasan && <p className="kecil">{l.alasan}</p>}
          <p className="langkah-baris" style={{ margin: 0 }}>
            {l.bagianTeks} = {fmt(l.hasilBagian)}
          </p>
          {l.tanda && <p className="kecil muted" style={{ margin: 0 }}>{l.tanda}</p>}
        </div>
      ))}
      <Umpan jenis="info" judul={`Hasil akhir: ${fmt(hasil)}`} />
    </div>
  );
}

function ContohMirip({ id }) {
  const [buka, setBuka] = useState(false);
  const contoh = id ? ambilContoh(id) : null;
  if (!contoh) return null;
  return (
    <>
      <button
        className="tombol tipis"
        onClick={() => {
          setBuka(true);
          catatKejadian('lihat_contoh_mirip', { contohId: id });
        }}
      >
        📘 Lihat contoh mirip
      </button>
      <Lembar terbuka={buka} tutup={() => setBuka(false)} judul="Contoh mirip">
        <ContohLengkap contoh={contoh} />
      </Lembar>
    </>
  );
}

function YakinRagu({ nilai, ubah }) {
  return (
    <div className="baris" role="group" aria-label="Seberapa yakin kamu?">
      <span className="kecil muted">Seberapa yakin?</span>
      {['yakin', 'ragu'].map((v) => (
        <button key={v} className="tombol tipis" aria-pressed={nilai === v} style={nilai === v ? { borderColor: 'var(--primary)', background: 'var(--primary-soft)' } : {}} onClick={() => ubah(nilai === v ? null : v)}>
          {v === 'yakin' ? 'Yakin' : 'Ragu'}
        </button>
      ))}
    </div>
  );
}

function TombolLanjut({ benar, lanjut }) {
  if (!benar) return null;
  return (
    <button className="tombol utama penuh" onClick={lanjut}>
      Soal berikutnya →
    </button>
  );
}

// ------------------------------------------------------------------
// Soal ekspresi: jawab langsung
// ------------------------------------------------------------------
function JawabLangsung({ soal, modulId, selesai, ekspresi = soal.soal, kunci = soal.jawaban }) {
  const [nilai, setNilai] = useState('');
  const [umpan, setUmpan] = useState(null);
  const [percobaan, setPercobaan] = useState(0);
  const [benar, setBenar] = useState(false);
  const [yakin, setYakin] = useState(null);
  const salahBeruntun = useRef(0);
  const { catat, petunjukDibuka } = useCatatan(soal, modulId);

  const periksa = async () => {
    const v = bacaAngka(nilai);
    if (v === null) return setUmpan({ jenis: 'info', teks: 'Tulis jawabanmu dengan angka dulu.' });
    const ok = v === kunci;
    const d = ok ? null : diagnosa(ekspresi, v, soal.umpanBalikKhusus);
    setPercobaan((p) => p + 1);
    await catat({ jawaban: v, benar: ok, miskonsepsi: d?.kode || null, yakin, percobaanKe: percobaan + 1 });
    if (ok) {
      setBenar(true);
      setUmpan({ jenis: 'benar', judul: 'Benar!', teks: percobaan === 0 ? 'Langsung tepat. Mantap!' : 'Kamu berhasil memperbaikinya.' });
    } else {
      salahBeruntun.current += 1;
      setUmpan({
        jenis: 'salah',
        judul: 'Belum tepat',
        teks: d?.pesan || 'Coba periksa lagi tanda dan urutan pengerjaannya.',
        saran: salahBeruntun.current >= 3,
      });
    }
  };

  return (
    <div className="tumpuk">
      <InputJawaban nilai={nilai} ubah={(v) => { setNilai(v); if (!benar) setUmpan(null); }} kirim={periksa} nonaktif={benar} />
      {!benar && <YakinRagu nilai={yakin} ubah={setYakin} />}
      {umpan && (
        <Umpan jenis={umpan.jenis} judul={umpan.judul}>
          {umpan.teks}
          {umpan.saran && <div className="kecil" style={{ marginTop: 6 }}>Sudah 3 kali belum tepat. Coba lihat contoh mirip dulu, ya.</div>}
        </Umpan>
      )}
      {!benar && (
        <button className="tombol utama penuh" onClick={periksa}>
          Periksa
        </button>
      )}
      <TombolLanjut benar={benar} lanjut={() => selesai({ benarPertama: percobaan === 1 })} />
      {!benar && (
        <>
          <Petunjuk
            petunjuk={soal.petunjuk}
            sudahMencoba={percobaan > 0}
            pembahasan={<PembahasanEkspresi ekspresi={ekspresi} />}
            saatBuka={() => (petunjukDibuka.current += 1)}
          />
          <ContohMirip id={soal.contohMirip} />
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Soal ekspresi: langkah demi langkah (pilih operasi → hitung)
// ------------------------------------------------------------------
export function LangkahPengerjaan({ ekspresi, saatSelesai, saatSalah }) {
  const [ast, setAst] = useState(() => parse(ekspresi));
  const [riwayat, setRiwayat] = useState([]);
  const [dipilih, setDipilih] = useState(null);
  const [nilai, setNilai] = useState('');
  const [umpan, setUmpan] = useState(null);

  const selesai = ast.type === 'num';
  const pilihan = useMemo(() => (selesai ? [] : kandidat(ast)), [ast, selesai]);
  const langkahBenar = useMemo(() => (selesai ? null : cariLangkah(ast)), [ast, selesai]);
  const { teks, rentang } = tulis(ast, dipilih ? dipilih.node : null);

  const pilih = (k) => {
    if (k.node === langkahBenar.target) {
      setDipilih(k);
      setUmpan(null);
    } else {
      saatSalah?.('urutan');
      setUmpan({ jenis: 'salah', teks: pesanPilihanSalah(ast, k) });
    }
  };

  const hitungBagian = () => {
    const v = bacaAngka(nilai);
    if (v === null) return setUmpan({ jenis: 'info', teks: 'Tulis hasilnya dengan angka.' });
    const { op, left, right } = dipilih.node;
    const benar = hitung(op, left.value, right.value);
    if (v !== benar) {
      saatSalah?.('hitung');
      const d = diagnosa(dipilih.teks, v);
      setUmpan({ jenis: 'salah', teks: d?.pesan || 'Hitungannya belum tepat. Coba lagi.' });
      return;
    }
    const baru = terapkan(ast, dipilih.node, benar);
    setRiwayat((r) => [...r, { sebelum: teks, rentang, bagian: `${dipilih.teks} = ${fmt(benar)}`, alasan: alasanLangkah(langkahBenar), tanda: penjelasanTanda(op, left.value, right.value) }]);
    setAst(baru);
    setDipilih(null);
    setNilai('');
    setUmpan(null);
    if (baru.type === 'num') saatSelesai(baru.value);
  };

  return (
    <div className="tumpuk">
      {riwayat.map((r, i) => (
        <div key={i} className="kartu" style={{ padding: 10 }}>
          <EkspresiSorot teks={r.sebelum} rentang={r.rentang} kelas="langkah-baris" />
          <div className="kecil">
            {r.bagian} {r.tanda && <span className="muted">· {r.tanda}</span>}
          </div>
        </div>
      ))}

      {selesai ? (
        <div className="ekspresi">= {fmt(ast.value)}</div>
      ) : (
        <div className="kartu" style={{ borderColor: 'var(--primary)', borderWidth: 2 }}>
          <EkspresiSorot teks={teks} rentang={rentang} />
          {!dipilih ? (
            <>
              <p style={{ marginBottom: 8 }}>
                <strong>Ketuk operasi yang dikerjakan lebih dulu:</strong>
              </p>
              {pilihan.map((k, i) => (
                <button key={i} className="pilihan" onClick={() => pilih(k)}>
                  <span className="langkah-baris">{k.teks}</span>
                </button>
              ))}
            </>
          ) : (
            <div className="tumpuk">
              <p className="langkah-baris" style={{ margin: 0 }}>
                {dipilih.teks} = ?
              </p>
              <InputJawaban nilai={nilai} ubah={setNilai} kirim={hitungBagian} label="Hasil bagian ini" />
              <button className="tombol utama penuh" onClick={hitungBagian}>
                Periksa
              </button>
            </div>
          )}
          {umpan && (
            <div style={{ marginTop: 10 }}>
              <Umpan jenis={umpan.jenis}>{umpan.teks}</Umpan>
            </div>
          )}
          <p className="kecil muted" style={{ marginTop: 10, marginBottom: 0 }}>
            ① Kurung → ② Kali &amp; bagi (dari kiri) → ③ Tambah &amp; kurang (dari kiri)
          </p>
        </div>
      )}
    </div>
  );
}

function JawabLangkah({ soal, modulId, selesai }) {
  const [beres, setBeres] = useState(false);
  const kesalahan = useRef([]);
  const { catat, petunjukDibuka } = useCatatan(soal, modulId);

  const saatSelesai = async (hasil) => {
    const tanpaSalah = kesalahan.current.length === 0;
    await catat({
      jawaban: hasil,
      benar: tanpaSalah,
      mode: 'langkah',
      kesalahanLangkah: kesalahan.current,
      miskonsepsi: kesalahan.current.includes('urutan') ? 'MK-06' : null,
    });
    setBeres(true);
  };

  return (
    <div className="tumpuk">
      <LangkahPengerjaan ekspresi={soal.soal} saatSelesai={saatSelesai} saatSalah={(j) => kesalahan.current.push(j)} />
      {beres ? (
        <>
          <Umpan jenis="benar" judul="Selesai!">
            {kesalahan.current.length === 0 ? 'Semua langkah tepat tanpa kesalahan.' : `Kamu memperbaiki ${kesalahan.current.length} kesalahan sampai selesai.`}
          </Umpan>
          <button className="tombol utama penuh" onClick={() => selesai({ benarPertama: kesalahan.current.length === 0 })}>
            Soal berikutnya →
          </button>
        </>
      ) : (
        <>
          <Petunjuk petunjuk={soal.petunjuk} sudahMencoba={false} saatBuka={() => (petunjukDibuka.current += 1)} />
          <ContohMirip id={soal.contohMirip} />
        </>
      )}
    </div>
  );
}

export function SoalEkspresi({ soal, modulId, selesai }) {
  const [mode, setMode] = useState(soal.mode === 'langkah' ? 'langkah' : 'langsung');
  return (
    <div className="tumpuk">
      <div className="kartu">
        <div className="ekspresi">{soal.soal} = ?</div>
      </div>
      {soal.mode === 'langkah' && (
        <div className="baris" role="group" aria-label="Cara mengerjakan">
          <button className="tombol tipis" aria-pressed={mode === 'langkah'} style={mode === 'langkah' ? { borderColor: 'var(--primary)', background: 'var(--primary-soft)' } : {}} onClick={() => setMode('langkah')}>
            Langkah demi langkah
          </button>
          <button className="tombol tipis" aria-pressed={mode === 'langsung'} style={mode === 'langsung' ? { borderColor: 'var(--primary)', background: 'var(--primary-soft)' } : {}} onClick={() => setMode('langsung')}>
            Jawab langsung
          </button>
        </div>
      )}
      {mode === 'langkah' ? (
        <JawabLangkah key={`${soal.id}-l`} soal={soal} modulId={modulId} selesai={selesai} />
      ) : (
        <JawabLangsung key={`${soal.id}-j`} soal={soal} modulId={modulId} selesai={selesai} />
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Soal pilihan
// ------------------------------------------------------------------
export function SoalPilihan({ soal, modulId, selesai }) {
  const [dipilih, setDipilih] = useState(null);
  const [benar, setBenar] = useState(false);
  const [salah, setSalah] = useState([]);
  const [percobaan, setPercobaan] = useState(0);
  const { catat, petunjukDibuka } = useCatatan(soal, modulId);

  const jawab = async (i) => {
    if (benar) return;
    setDipilih(i);
    const ok = i === soal.kunci;
    setPercobaan((p) => p + 1);
    await catat({ jawaban: soal.opsi[i], benar: ok, percobaanKe: percobaan + 1 });
    if (ok) setBenar(true);
    else setSalah((s) => [...s, i]);
  };

  return (
    <div className="tumpuk">
      <div className="kartu">
        <p style={{ fontSize: '1.15em', fontWeight: 700, margin: 0 }}>{soal.soal}</p>
      </div>
      <div>
        {soal.opsi.map((o, i) => (
          <button
            key={i}
            className={`pilihan ${benar && i === soal.kunci ? 'benar' : ''} ${salah.includes(i) ? 'salah' : ''}`}
            onClick={() => jawab(i)}
            disabled={benar || salah.includes(i)}
          >
            <span aria-hidden="true">{benar && i === soal.kunci ? '✓' : salah.includes(i) ? '✗' : '○'}</span>
            <span>{o}</span>
          </button>
        ))}
      </div>
      {dipilih !== null && (
        <Umpan jenis={benar ? 'benar' : 'salah'} judul={benar ? 'Benar!' : 'Belum tepat'}>
          {benar ? soal.pembahasan : 'Coba pilih jawaban lain. Kamu bisa membuka petunjuk.'}
        </Umpan>
      )}
      <TombolLanjut benar={benar} lanjut={() => selesai({ benarPertama: percobaan === 1 })} />
      {!benar && (
        <>
          <Petunjuk petunjuk={soal.petunjuk} sudahMencoba={percobaan > 0} pembahasan={<p>{soal.pembahasan}</p>} saatBuka={() => (petunjukDibuka.current += 1)} />
          <ContohMirip id={soal.contohMirip} />
        </>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// Soal cerita: Diketahui → Ditanya → Model → Hitung → Kesimpulan
// ------------------------------------------------------------------
const TAHAP_CERITA = ['Diketahui', 'Ditanya', 'Model', 'Hitung', 'Kesimpulan'];

export function SoalCerita({ soal, modulId, selesai }) {
  const [tahap, setTahap] = useState(0);
  const [ditandai, setDitandai] = useState([]);
  const [salahPilih, setSalahPilih] = useState([]);
  const [umpan, setUmpan] = useState(null);
  const [nilai, setNilai] = useState('');
  const kesalahan = useRef(0);
  const { catat, petunjukDibuka } = useCatatan(soal, modulId);

  const pindah = (t) => {
    setTahap(t);
    setSalahPilih([]);
    setUmpan(null);
  };

  const pilihOpsi = (i, kunci, pesanSalah) => {
    if (i === kunci) pindah(tahap + 1);
    else {
      kesalahan.current += 1;
      setSalahPilih((s) => [...s, i]);
      setUmpan({ jenis: 'salah', teks: pesanSalah });
    }
  };

  const periksaKesimpulan = async () => {
    const v = bacaAngka(nilai);
    if (v === null) return setUmpan({ jenis: 'info', teks: 'Tulis jawaban akhirnya dengan angka.' });
    const ok = v === soal.jawaban;
    const d = ok ? null : diagnosa(soal.model, v, soal.umpanBalikKhusus);
    await catat({ jawaban: v, benar: ok && kesalahan.current === 0, jawabanAkhirBenar: ok, miskonsepsi: d?.kode || null, kesalahanTahap: kesalahan.current });
    if (ok) pindah(5);
    else {
      kesalahan.current += 1;
      setUmpan({ jenis: 'salah', teks: d?.pesan || 'Periksa kembali hasil hitunganmu.' });
    }
  };

  return (
    <div className="tumpuk">
      <div className="baris ujung">
        <span className="kecil muted">Soal cerita</span>
        <span className="kecil muted">
          {tahap < 5 ? `Tahap ${tahap + 1}/5: ${TAHAP_CERITA[tahap]}` : 'Selesai'}
        </span>
      </div>
      <div className="kemajuan" aria-hidden="true">
        {TAHAP_CERITA.map((t, i) => (
          <span key={t} className={i <= tahap ? 'aktif' : ''} />
        ))}
      </div>

      <div className="kartu">
        {tahap === 0 && <p className="kecil" style={{ marginTop: 0 }}><strong>Ketuk kalimat yang berisi informasi penting.</strong></p>}
        {soal.kalimat.map((k, i) =>
          tahap === 0 ? (
            <button key={i} className="kalimat-tanda" aria-pressed={ditandai.includes(i)} onClick={() => setDitandai((d) => (d.includes(i) ? d.filter((x) => x !== i) : [...d, i]))}>
              {k}
            </button>
          ) : (
            <p key={i} style={{ margin: '0 0 6px', background: ditandai.includes(i) ? 'var(--highlight)' : 'transparent', borderRadius: 6, padding: '2px 4px' }}>
              {k}
            </p>
          ),
        )}
      </div>

      {tahap === 0 && (
        <>
          {ditandai.length > 0 && (
            <Umpan jenis="info" judul="Bandingkan dengan catatan ini">
              <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
                {soal.diketahui.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </Umpan>
          )}
          <button className="tombol utama penuh" disabled={!ditandai.length} onClick={() => pindah(1)}>
            Lanjut ke Ditanya →
          </button>
        </>
      )}

      {tahap === 1 && (
        <div>
          <p><strong>Apa yang ditanyakan?</strong></p>
          {soal.pilihanDitanya.map((o, i) => (
            <button key={i} className={`pilihan ${salahPilih.includes(i) ? 'salah' : ''}`} disabled={salahPilih.includes(i)} onClick={() => pilihOpsi(i, soal.kunciDitanya, 'Baca lagi kalimat pertanyaannya (biasanya diakhiri tanda tanya).')}>
              {o}
            </button>
          ))}
        </div>
      )}

      {tahap === 2 && (
        <div>
          <p><strong>Model matematika yang tepat adalah …</strong></p>
          {soal.pilihanModel.map((o, i) => (
            <button key={i} className={`pilihan ${salahPilih.includes(i) ? 'salah' : ''}`} disabled={salahPilih.includes(i)} onClick={() => pilihOpsi(i, soal.kunciModel, 'Model ini belum sesuai. Periksa tanda negatif dan kata "setiap" pada soal.')}>
              <span className="langkah-baris">{o}</span>
            </button>
          ))}
        </div>
      )}

      {tahap === 3 && (
        <>
          <p style={{ margin: 0 }}><strong>Hitung modelnya langkah demi langkah.</strong></p>
          <LangkahPengerjaan ekspresi={soal.model} saatSelesai={() => pindah(4)} saatSalah={() => (kesalahan.current += 1)} />
        </>
      )}

      {tahap === 4 && (
        <div className="tumpuk">
          <p style={{ margin: 0 }}>
            <strong>Kesimpulan:</strong> jadi, jawabannya adalah … {soal.satuan}
          </p>
          <InputJawaban nilai={nilai} ubah={setNilai} kirim={periksaKesimpulan} label="Jawaban akhir" />
          <button className="tombol utama penuh" onClick={periksaKesimpulan}>
            Periksa
          </button>
        </div>
      )}

      {tahap === 5 && (
        <>
          <Umpan jenis="benar" judul={soal.kesimpulan}>
            {soal.tafsir}
          </Umpan>
          <button className="tombol utama penuh" onClick={() => selesai({ benarPertama: kesalahan.current === 0 })}>
            Soal berikutnya →
          </button>
        </>
      )}

      {umpan && tahap < 5 && <Umpan jenis={umpan.jenis}>{umpan.teks}</Umpan>}

      {tahap < 5 && (
        <>
          <Petunjuk petunjuk={soal.petunjuk} sudahMencoba={tahap >= 3} pembahasan={<PembahasanEkspresi ekspresi={soal.model} />} saatBuka={() => (petunjukDibuka.current += 1)} />
          <ContohMirip id={soal.contohMirip} />
        </>
      )}
    </div>
  );
}

export function SoalLatihan(props) {
  const t = props.soal.tipe;
  if (t === 'pilihan') return <SoalPilihan {...props} />;
  if (t === 'cerita') return <SoalCerita {...props} />;
  return <SoalEkspresi {...props} />;
}

export { MISKONSEPSI };
