from tests.conftest import masuk


def _kelas(klien, h, nama="7A"):
    r = klien.post("/api/kelas", json={"nama": nama}, headers=h)
    assert r.status_code == 201, r.text
    return r.json()


def _gabung(klien, kode_kelas, kode_siswa="S01"):
    r = klien.post("/api/siswa/gabung", json={"kode_kelas": kode_kelas, "kode_siswa": kode_siswa, "persetujuan": True})
    assert r.status_code == 200, r.text
    return {"X-Token-Perangkat": r.json()["token_perangkat"]}


def _item_contoh():
    return [
        {"tabel": "hasilTes", "data": {"id": "t1", "jenis": "pretest", "skor": 40, "benar": 4, "total": 10, "jawaban": [{"id": "PRE-01", "benar": True}], "waktu": "2026-11-01T08:00:00Z"}},
        {"tabel": "hasilTes", "data": {"id": "t2", "jenis": "posttest", "skor": 70, "benar": 7, "total": 10, "jawaban": [], "waktu": "2026-11-10T08:00:00Z"}},
        {"tabel": "percobaan", "data": {"id": "p1", "soalId": "L2-02", "modulId": "M5", "jawaban": 70, "benar": False, "miskonsepsi": "MK-06", "petunjukDibuka": 1, "waktu": "2026-11-05T08:00:00Z", "percobaanKe": 1}},
        {"tabel": "progres", "data": {"modulId": "M5", "status": "selesai", "bintang": 2, "diperbarui": "2026-11-05T09:00:00Z"}},
        {"tabel": "bebanKognitif", "data": {"id": "b1", "modulId": "M5", "skor": 6, "waktu": "2026-11-05T09:00:00Z"}},
        {"tabel": "jawabanLiterasi", "data": {"id": "j1", "butirId": "LIT-A1", "stimulusId": "STM-A", "mode": "latihan", "bentuk": "pg", "indikator": ["LM1", "LM2"], "jawaban": 2, "benar": True, "waktu": "2026-11-06T08:00:00Z"}},
        {"tabel": "jawabanLiterasi", "data": {"id": "j2", "butirId": "LIT-C4", "stimulusId": "STM-C", "mode": "latihan", "bentuk": "uraian", "indikator": ["LM4"], "benar": None, "teksUraian": "Belum cukup karena 10 − 35 = −25.", "waktu": "2026-11-06T08:05:00Z"}},
        {"tabel": "kejadian", "data": {"id": "k1", "jenis": "buka_aturan_tanda", "konteks": {"modulId": "M3"}, "waktu": "2026-11-04T08:00:00Z"}},
    ]


def test_kesehatan(klien):
    assert klien.get("/api/kesehatan").json() == {"status": "ok"}


def test_masuk_salah_ditolak(klien):
    r = klien.post("/api/auth/masuk", json={"email": "guru@sekolah.id", "sandi": "salah"})
    assert r.status_code == 401


def test_tanpa_token_ditolak(klien):
    assert klien.get("/api/kelas").status_code == 401
    assert klien.post("/api/sinkron", json={"item": []}).status_code == 401


def test_daftar_guru_dengan_kode(klien):
    r = klien.post("/api/auth/daftar", json={"email": "baru@sekolah.id", "sandi": "rahasia123", "nama": "Baru", "kode_daftar": "salah"})
    assert r.status_code == 403
    r = klien.post("/api/auth/daftar", json={"email": "baru@sekolah.id", "sandi": "rahasia123", "nama": "Baru", "kode_daftar": "DAFTAR-UJI"})
    assert r.status_code == 200


def test_alur_lengkap(klien):
    h = masuk(klien)
    kelas = _kelas(klien, h)
    assert len(kelas["kode_kelas"]) == 6

    # gabung tanpa persetujuan ditolak; kode salah ditolak
    assert klien.post("/api/siswa/gabung", json={"kode_kelas": kelas["kode_kelas"], "kode_siswa": "S01", "persetujuan": False}).status_code == 400
    assert klien.post("/api/siswa/gabung", json={"kode_kelas": "ZZZZZZ", "kode_siswa": "S01", "persetujuan": True}).status_code == 404

    hs = _gabung(klien, kelas["kode_kelas"].lower())  # tidak peka huruf besar/kecil
    r = klien.post("/api/sinkron", json={"item": _item_contoh()}, headers=hs)
    assert r.status_code == 200
    assert r.json() == {"diterima": 8, "diabaikan": 0}

    # kirim ulang: idempoten, tidak menggandakan
    r = klien.post("/api/sinkron", json={"item": _item_contoh()}, headers=hs)
    assert r.json()["diterima"] == 8
    ring = klien.get(f"/api/kelas/{kelas['id']}/ringkasan", headers=h).json()
    s = ring["siswa"][0]
    assert s["kode_siswa"] == "S01"
    assert s["pretest"] == 40 and s["posttest"] == 70
    assert s["ngain"] == 0.5
    assert s["modul_selesai"] == 1
    assert ring["miskonsepsi"] == [{"kode": "MK-06", "jumlah": 1}]
    assert ring["literasi"]["LM1"] == {"benar": 1, "total": 1}
    assert ring["literasi"]["LM4"] == {"benar": 0, "total": 0}  # uraian tidak dinilai otomatis
    assert ring["beban"] == [{"modul_id": "M5", "rata": 6.0, "n": 1}]

    # penilaian rubrik
    uraian = klien.get(f"/api/kelas/{kelas['id']}/uraian", headers=h).json()
    assert len(uraian) == 1 and uraian[0]["skor_saya"] is None
    assert klien.post("/api/rubrik", json={"jawaban_literasi_id": "j2", "skor": 3}, headers=h).status_code == 200
    assert klien.post("/api/rubrik", json={"jawaban_literasi_id": "j2", "skor": 2}, headers=h).status_code == 200
    uraian = klien.get(f"/api/kelas/{kelas['id']}/uraian", headers=h).json()
    assert uraian[0]["skor_saya"] == 2 and uraian[0]["jumlah_penilai"] == 1
    assert klien.post("/api/rubrik", json={"jawaban_literasi_id": "j2", "skor": 5}, headers=h).status_code == 422

    # ekspor
    r = klien.get(f"/api/kelas/{kelas['id']}/ekspor?jenis=jawaban_literasi&format=csv", headers=h)
    assert r.status_code == 200
    teks = r.content.decode("utf-8-sig")
    assert "skor_rubrik_1" in teks and "LIT-C4" in teks
    r = klien.get(f"/api/kelas/{kelas['id']}/ekspor?jenis=semua&format=xlsx", headers=h)
    assert r.status_code == 200 and r.content[:2] == b"PK"
    assert klien.get(f"/api/kelas/{kelas['id']}/ekspor?jenis=salah", headers=h).status_code == 400


def test_guru_lain_tidak_bisa_akses_kelas(klien):
    h = masuk(klien)
    kelas = _kelas(klien, h)
    hs = _gabung(klien, kelas["kode_kelas"])
    klien.post("/api/sinkron", json={"item": _item_contoh()}, headers=hs)

    h2 = masuk(klien, "lain@sekolah.id")
    assert klien.get(f"/api/kelas/{kelas['id']}/ringkasan", headers=h2).status_code == 404
    assert klien.get(f"/api/kelas/{kelas['id']}/uraian", headers=h2).status_code == 404
    assert klien.get(f"/api/kelas/{kelas['id']}/ekspor", headers=h2).status_code == 404
    assert klien.post("/api/rubrik", json={"jawaban_literasi_id": "j2", "skor": 1}, headers=h2).status_code == 404
    assert klien.get("/api/kelas", headers=h2).json() == []


def test_data_tidak_valid_diabaikan(klien):
    h = masuk(klien)
    kelas = _kelas(klien, h)
    hs = _gabung(klien, kelas["kode_kelas"])
    item = [
        {"tabel": "bebanKognitif", "data": {"id": "x", "modulId": "M1", "skor": 12, "waktu": "w"}},  # skor > 9
        {"tabel": "hasilTes", "data": {"id": "y", "jenis": "asal", "skor": 50, "waktu": "w"}},  # jenis salah
        {"tabel": "bebanKognitif", "data": {"id": "z", "modulId": "M1", "skor": 4, "waktu": "w"}},
    ]
    assert klien.post("/api/sinkron", json={"item": item}, headers=hs).json() == {"diterima": 1, "diabaikan": 2}


def test_id_milik_siswa_lain_tidak_ditimpa(klien):
    h = masuk(klien)
    kelas = _kelas(klien, h)
    hs1 = _gabung(klien, kelas["kode_kelas"], "S01")
    hs2 = _gabung(klien, kelas["kode_kelas"], "S02")
    item = [{"tabel": "bebanKognitif", "data": {"id": "sama", "modulId": "M1", "skor": 4, "waktu": "w"}}]
    assert klien.post("/api/sinkron", json={"item": item}, headers=hs1).json()["diterima"] == 1
    assert klien.post("/api/sinkron", json={"item": item}, headers=hs2).json() == {"diterima": 0, "diabaikan": 1}


def test_gabung_ulang_mengganti_token(klien):
    h = masuk(klien)
    kelas = _kelas(klien, h)
    lama = _gabung(klien, kelas["kode_kelas"])
    baru = _gabung(klien, kelas["kode_kelas"])
    assert klien.post("/api/sinkron", json={"item": []}, headers=lama).status_code == 401
    assert klien.post("/api/sinkron", json={"item": []}, headers=baru).status_code == 200
    assert klien.get("/api/kelas", headers=h).json()[0]["jumlah_siswa"] == 1


def test_pembatas_laju_masuk(klien):
    for _ in range(10):
        klien.post("/api/auth/masuk", json={"email": "guru@sekolah.id", "sandi": "salah"})
    r = klien.post("/api/auth/masuk", json={"email": "guru@sekolah.id", "sandi": "salah"})
    assert r.status_code == 429
