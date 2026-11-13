"""Mengolah file ekspor "ringkasan" dari dasbor guru menjadi tabel N-gain + uji beda.

Pakai:
    python -m analisis.olah_ekspor data/bulat-XXXXXX-ringkasan.csv
"""

from __future__ import annotations

import csv
import sys
from pathlib import Path

from .statistik import deskriptif, kategori_ngain, n_gain, uji_beda_berpasangan


def baca(path: str) -> list[dict]:
    with Path(path).open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def angka(v: str) -> float | None:
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def olah(baris: list[dict], kol_pre: str, kol_post: str, judul: str) -> None:
    pasangan = [(r["kode_siswa"], angka(r.get(kol_pre)), angka(r.get(kol_post))) for r in baris]
    lengkap = [(k, a, b) for k, a, b in pasangan if a is not None and b is not None]
    print(f"\n=== {judul} ({len(lengkap)} siswa dengan data lengkap) ===")
    if not lengkap:
        print("Belum ada data pretest dan posttest yang lengkap.")
        return
    print(f"{'Kode':<8}{'Pre':>6}{'Post':>6}{'N-gain':>8}  Kategori")
    gains = []
    for k, a, b in lengkap:
        g = n_gain(a, b)
        if g is not None:
            gains.append(g)
        print(f"{k:<8}{a:>6.0f}{b:>6.0f}{(f'{g:.2f}' if g is not None else '–'):>8}  {kategori_ngain(g) if g is not None else '–'}")
    pre = [a for _, a, _ in lengkap]
    post = [b for _, _, b in lengkap]
    print(f"Pretest : {deskriptif(pre)}")
    print(f"Posttest: {deskriptif(post)}")
    if gains:
        rata = sum(gains) / len(gains)
        print(f"Rata-rata N-gain: {rata:.2f} ({kategori_ngain(rata)})")
    if len(lengkap) >= 3:
        try:
            print(f"Uji beda: {uji_beda_berpasangan(pre, post)}")
        except ImportError:
            print("Uji beda dilewati: pasang SciPy dulu (pip install scipy).")


def main() -> None:
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    baris = baca(sys.argv[1])
    olah(baris, "pretest", "posttest", "Operasi bilangan bulat")
    olah(baris, "literasi_pre", "literasi_post", "Literasi matematika")


if __name__ == "__main__":
    main()
