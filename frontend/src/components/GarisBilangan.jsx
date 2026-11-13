import { useMemo, useState, useEffect } from 'react';
import { fmt } from '../lib/math/format.js';

const W = 360;
const H = 130;
const PAD = 18;
const SUMBU_Y = 92;

/**
 * Garis bilangan interaktif. Gerakan dijalankan satu per satu oleh siswa
 * (tidak ada animasi otomatis). Positif = biru ke kanan, negatif = oranye ke kiri.
 * @param {{mulai?:number, langkah?:number[], titik?:number[], min?:number, max?:number}} props
 */
export default function GarisBilangan({ mulai = 0, langkah = [], titik = [], min, max }) {
  const [jalan, setJalan] = useState(0);
  useEffect(() => setJalan(0), [mulai, langkah.join(',')]);

  const posisi = useMemo(() => {
    const p = [mulai];
    langkah.forEach((l) => p.push(p[p.length - 1] + l));
    return p;
  }, [mulai, langkah]);

  const [lo, hi] = useMemo(() => {
    const semua = [...posisi, ...titik, 0];
    let a = min ?? Math.min(...semua) - 2;
    let b = max ?? Math.max(...semua) + 2;
    while (b - a < 10) {
      a -= 1;
      b += 1;
    }
    return [a, b];
  }, [posisi, titik, min, max]);

  const x = (v) => PAD + ((v - lo) * (W - 2 * PAD)) / (hi - lo);
  const rentang = hi - lo;
  const jarakLabel = rentang <= 24 ? 1 : rentang <= 50 ? 5 : 10;

  const ticks = [];
  for (let v = lo; v <= hi; v++) ticks.push(v);

  const sekarang = posisi[jalan];
  const deskripsi =
    langkah.length > 0
      ? `Garis bilangan. Mulai di ${fmt(mulai)}. ${langkah
          .slice(0, jalan)
          .map((l) => `Bergerak ${Math.abs(l)} langkah ke ${l > 0 ? 'kanan' : 'kiri'}.`)
          .join(' ')} Posisi sekarang ${fmt(sekarang)}.`
      : `Garis bilangan dengan titik ${titik.map(fmt).join(', ')}.`;

  return (
    <div className="garis">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={deskripsi}>
        <defs>
          <marker id="panah-pos" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--positive)" />
          </marker>
          <marker id="panah-neg" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--negative)" />
          </marker>
        </defs>

        <line x1={PAD - 10} y1={SUMBU_Y} x2={W - PAD + 10} y2={SUMBU_Y} stroke="var(--text)" strokeWidth="2" />
        {ticks.map((v) => {
          const tampil = v % jarakLabel === 0;
          return (
            <g key={v}>
              <line x1={x(v)} y1={SUMBU_Y - (tampil ? 6 : 3)} x2={x(v)} y2={SUMBU_Y + (tampil ? 6 : 3)} stroke="var(--text)" strokeWidth={v === 0 ? 2.5 : 1.2} />
              {tampil && (
                <text
                  x={x(v)}
                  y={SUMBU_Y + 24}
                  textAnchor="middle"
                  fontSize={rentang > 16 ? 10 : 12}
                  fontWeight={v === 0 ? 700 : 400}
                  fill={v < 0 ? 'var(--negative)' : v > 0 ? 'var(--positive)' : 'var(--text)'}
                >
                  {fmt(v)}
                </text>
              )}
            </g>
          );
        })}

        {titik.map((t) => (
          <circle key={`t${t}`} cx={x(t)} cy={SUMBU_Y} r="6" fill={t < 0 ? 'var(--negative)' : t > 0 ? 'var(--positive)' : 'var(--text)'} />
        ))}

        {langkah.slice(0, jalan).map((l, i) => {
          const a = x(posisi[i]);
          const b = x(posisi[i + 1]);
          const tinggi = Math.min(52, 18 + Math.abs(b - a) / 3);
          const naik = SUMBU_Y - 8 - (i % 2) * 4;
          const warna = l > 0 ? 'var(--positive)' : 'var(--negative)';
          return (
            <g key={i}>
              <path
                d={`M${a},${naik} Q${(a + b) / 2},${naik - tinggi} ${b},${naik}`}
                fill="none"
                stroke={warna}
                strokeWidth="3"
                markerEnd={`url(#${l > 0 ? 'panah-pos' : 'panah-neg'})`}
              />
              <text x={(a + b) / 2} y={naik - tinggi / 2 - 6} textAnchor="middle" fontSize="13" fontWeight="700" fill={warna}>
                {l > 0 ? `+${l}` : fmt(l)}
              </text>
            </g>
          );
        })}

        {langkah.length > 0 && (
          <>
            <circle cx={x(mulai)} cy={SUMBU_Y} r="5" fill="var(--surface)" stroke="var(--text)" strokeWidth="2" />
            <circle cx={x(sekarang)} cy={SUMBU_Y} r="8" fill="var(--text)" />
          </>
        )}
      </svg>

      {langkah.length > 0 && (
        <div className="baris ujung" style={{ marginTop: 6 }}>
          <span className="muted kecil" aria-live="polite">
            {jalan === 0 ? `Mulai di ${fmt(mulai)}` : `Posisi: ${fmt(sekarang)}`}
          </span>
          <div className="baris">
            <button className="tombol tipis" onClick={() => setJalan(0)} disabled={jalan === 0}>
              Ulangi
            </button>
            <button className="tombol" onClick={() => setJalan((j) => Math.min(j + 1, langkah.length))} disabled={jalan >= langkah.length}>
              Jalankan langkah
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
