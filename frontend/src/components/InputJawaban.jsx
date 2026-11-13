import { useEffect, useRef } from 'react';

/**
 * Papan angka dengan tombol tanda negatif, agar siswa tidak perlu mencari
 * tanda minus di keyboard HP. Di komputer, keyboard fisik juga bisa dipakai.
 * @param {{nilai:string, ubah:(v:string)=>void, kirim?:()=>void, label?:string, nonaktif?:boolean}} props
 */
export default function InputJawaban({ nilai, ubah, kirim, label = 'Jawabanmu', nonaktif = false }) {
  const ref = useRef(null);

  const tekan = (k) => {
    if (nonaktif) return;
    if (k === '⌫') return ubah(nilai.slice(0, -1));
    if (k === '−') return ubah(nilai.startsWith('−') ? nilai.slice(1) : `−${nilai}`);
    if (nilai.replace('−', '').length >= 6) return;
    ubah(nilai + k);
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const tombol = (e) => {
      if (/^[0-9]$/.test(e.key)) tekan(e.key);
      else if (e.key === '-' || e.key === '−') tekan('−');
      else if (e.key === 'Backspace') tekan('⌫');
      else if (e.key === 'Enter' && kirim) kirim();
      else return;
      e.preventDefault();
    };
    el.addEventListener('keydown', tombol);
    return () => el.removeEventListener('keydown', tombol);
  });

  return (
    <div ref={ref} tabIndex={0} aria-label={`${label}. Ketik angka atau pakai tombol.`}>
      <div className={`layar-jawaban ${nilai ? '' : 'kosong'}`} aria-live="polite">
        {nilai || label}
      </div>
      <div className="papan">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '−', '0', '⌫'].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => tekan(k)}
            disabled={nonaktif}
            aria-label={k === '−' ? 'Tanda negatif' : k === '⌫' ? 'Hapus' : k}
          >
            {k === '−' ? '±' : k}
          </button>
        ))}
      </div>
    </div>
  );
}
