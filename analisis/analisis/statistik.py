"""Fungsi statistik untuk analisis data penelitian (dokumen 08).

Fungsi di sini murni Python (tanpa pustaka tambahan) agar mudah diperiksa
dan dicocokkan dengan perhitungan manual/Excel/SPSS.
"""

from __future__ import annotations

import math
from collections.abc import Sequence
from statistics import mean, pstdev, stdev, variance

# ---------------- keefektifan ----------------


def n_gain(pre: float, post: float, maks: float = 100) -> float | None:
    """N-gain Hake: (post − pre) / (maks − pre). None bila pre = maks."""
    if pre >= maks:
        return None
    return (post - pre) / (maks - pre)


def kategori_ngain(g: float) -> str:
    if g >= 0.7:
        return "tinggi"
    if g >= 0.3:
        return "sedang"
    return "rendah"


# ---------------- kevalidan ----------------


def persentase(skor: Sequence[float], skor_maks: float) -> float:
    """Persentase skor validasi/angket: Σskor / (n × skor_maks) × 100."""
    return sum(skor) / (len(skor) * skor_maks) * 100


def kategori_validitas(persen: float) -> str:
    """Kategori dokumen 08 §1 (sesuaikan dengan acuan dosen)."""
    if persen > 80:
        return "sangat valid"
    if persen > 60:
        return "valid"
    if persen > 40:
        return "cukup valid"
    return "kurang valid"


def aiken_v(skor: Sequence[int], terendah: int = 1, kategori: int = 4) -> float:
    """Aiken's V satu butir: V = Σ(r − lo) / (n × (c − 1))."""
    return sum(r - terendah for r in skor) / (len(skor) * (kategori - 1))


# ---------------- reliabilitas ----------------


def cronbach_alpha(data: Sequence[Sequence[float]]) -> float:
    """Alpha Cronbach. `data`: baris = responden, kolom = butir.
    Untuk butir dikotomi (0/1) hasilnya setara KR-20."""
    k = len(data[0])
    if k < 2:
        raise ValueError("Minimal 2 butir.")
    var_butir = [variance([baris[i] for baris in data]) for i in range(k)]
    var_total = variance([sum(baris) for baris in data])
    if var_total == 0:
        raise ValueError("Variansi skor total nol.")
    return k / (k - 1) * (1 - sum(var_butir) / var_total)


kr20 = cronbach_alpha


def cohen_kappa(penilai_a: Sequence, penilai_b: Sequence) -> float:
    """Kesepakatan dua penilai (mis. skor rubrik uraian)."""
    if len(penilai_a) != len(penilai_b) or not penilai_a:
        raise ValueError("Panjang data dua penilai harus sama dan tidak kosong.")
    n = len(penilai_a)
    kategori = set(penilai_a) | set(penilai_b)
    po = sum(a == b for a, b in zip(penilai_a, penilai_b)) / n
    pe = sum((list(penilai_a).count(c) / n) * (list(penilai_b).count(c) / n) for c in kategori)
    if pe == 1:
        return 1.0
    return (po - pe) / (1 - pe)


# ---------------- kepraktisan ----------------


def skor_sus(jawaban: Sequence[int]) -> float:
    """System Usability Scale: 10 butir skala 1–5 → skor 0–100."""
    if len(jawaban) != 10:
        raise ValueError("SUS harus 10 butir.")
    total = sum((x - 1) if i % 2 == 0 else (5 - x) for i, x in enumerate(jawaban))
    return total * 2.5


# ---------------- beban kognitif ----------------


def z_skor(nilai: Sequence[float]) -> list[float]:
    m, s = mean(nilai), pstdev(nilai)
    return [0.0 if s == 0 else (x - m) / s for x in nilai]


def efisiensi_instruksional(kinerja: Sequence[float], beban: Sequence[float]) -> list[float]:
    """E = (Z_kinerja − Z_beban) / √2 (Paas & van Merriënboer, 1993)."""
    return [(zk - zb) / math.sqrt(2) for zk, zb in zip(z_skor(kinerja), z_skor(beban))]


def deskriptif(nilai: Sequence[float]) -> dict[str, float]:
    return {
        "n": len(nilai),
        "rata_rata": mean(nilai),
        "simpangan_baku": stdev(nilai) if len(nilai) > 1 else 0.0,
        "min": min(nilai),
        "maks": max(nilai),
    }


# ---------------- uji beda (butuh SciPy) ----------------


def uji_beda_berpasangan(pre: Sequence[float], post: Sequence[float], alfa: float = 0.05) -> dict:
    """Shapiro–Wilk pada selisih → uji-t berpasangan (normal) atau Wilcoxon (tidak normal)."""
    from scipy import stats  # impor di sini agar fungsi lain tetap jalan tanpa SciPy

    selisih = [b - a for a, b in zip(pre, post)]
    p_normal = stats.shapiro(selisih).pvalue if len(selisih) >= 3 else float("nan")
    if p_normal > alfa:
        hasil = stats.ttest_rel(post, pre)
        uji = "uji-t berpasangan"
        sd = stdev(selisih)
        efek = mean(selisih) / sd if sd else float("nan")  # Cohen's d_z
    else:
        hasil = stats.wilcoxon(post, pre)
        uji = "Wilcoxon signed-rank"
        efek = float("nan")
    return {
        "uji": uji,
        "p_normalitas": p_normal,
        "statistik": float(hasil.statistic),
        "p": float(hasil.pvalue),
        "signifikan": float(hasil.pvalue) < alfa,
        "ukuran_efek_dz": efek,
    }
