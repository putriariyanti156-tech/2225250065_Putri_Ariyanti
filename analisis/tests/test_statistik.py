import math

import pytest

from analisis.statistik import (
    aiken_v,
    cohen_kappa,
    cronbach_alpha,
    efisiensi_instruksional,
    kategori_ngain,
    kategori_validitas,
    n_gain,
    persentase,
    skor_sus,
)


def test_n_gain():
    assert n_gain(40, 70) == pytest.approx(0.5)
    assert n_gain(100, 100) is None
    assert kategori_ngain(0.75) == "tinggi"
    assert kategori_ngain(0.5) == "sedang"
    assert kategori_ngain(0.1) == "rendah"


def test_validasi():
    assert persentase([4, 4, 3, 3], 4) == pytest.approx(87.5)
    assert kategori_validitas(87.5) == "sangat valid"
    assert kategori_validitas(70) == "valid"
    assert aiken_v([4, 4, 3]) == pytest.approx(8 / 9)


def test_cronbach_alpha():
    assert cronbach_alpha([[1, 1], [2, 2], [3, 3]]) == pytest.approx(1.0)
    data = [[1, 0, 1], [1, 1, 1], [0, 0, 1], [1, 1, 0], [0, 0, 0]]
    a = cronbach_alpha(data)
    assert -1 < a < 1


def test_cohen_kappa():
    assert cohen_kappa([1, 1, 0, 0], [1, 0, 0, 0]) == pytest.approx(0.5)
    assert cohen_kappa([3, 2, 1], [3, 2, 1]) == pytest.approx(1.0)


def test_sus():
    assert skor_sus([3] * 10) == 50
    assert skor_sus([5, 1] * 5) == 100
    with pytest.raises(ValueError):
        skor_sus([3] * 9)


def test_efisiensi():
    e = efisiensi_instruksional([80, 60, 40], [3, 5, 7])
    assert e[0] > 0 > e[2]
    assert sum(e) == pytest.approx(0)
    assert e[0] == pytest.approx(math.sqrt(2) * (1.2247448713915890))  # (1.2247 + 1.2247)/√2


def test_uji_beda():
    pytest.importorskip("scipy")
    from analisis.statistik import uji_beda_berpasangan

    h = uji_beda_berpasangan([40, 50, 30, 60, 45, 55], [70, 80, 60, 85, 75, 90])
    assert h["signifikan"] is True
