"""Logika ringkasan kelas dan ekspor data (dipakai router kelas & ekspor)."""

from __future__ import annotations

import csv
import io
from collections import Counter, defaultdict
from typing import Any

from sqlalchemy import select
from sqlalchemy.orm import Session

from .models import BebanKognitif, HasilTes, JawabanLiterasi, Kejadian, Kelas, Percobaan, Progres, Siswa, SkorRubrik

INDIKATOR = ["LM1", "LM2", "LM3", "LM4"]


def n_gain(pre: float | None, post: float | None) -> float | None:
    """N-gain Hake: (post − pre) / (100 − pre)."""
    if pre is None or post is None or pre >= 100:
        return None
    return round((post - pre) / (100 - pre), 2)


def _siswa_kelas(db: Session, kelas: Kelas) -> list[Siswa]:
    return list(db.scalars(select(Siswa).where(Siswa.kelas_id == kelas.id).order_by(Siswa.kode_siswa)))


def _tes_terakhir(db: Session, ids: list[int]) -> dict[int, dict[str, HasilTes]]:
    hasil: dict[int, dict[str, HasilTes]] = defaultdict(dict)
    for t in db.scalars(select(HasilTes).where(HasilTes.siswa_id.in_(ids)).order_by(HasilTes.waktu)):
        hasil[t.siswa_id][t.jenis] = t  # urut waktu → yang terakhir menimpa
    return hasil


def ringkasan_kelas(db: Session, kelas: Kelas) -> dict[str, Any]:
    siswa = _siswa_kelas(db, kelas)
    ids = [s.id for s in siswa]
    tes = _tes_terakhir(db, ids)

    selesai = Counter(
        p.siswa_id for p in db.scalars(select(Progres).where(Progres.siswa_id.in_(ids), Progres.status == "selesai"))
    )

    baris_siswa = []
    for s in siswa:
        t = tes.get(s.id, {})
        skor = {j: (t[j].skor if j in t else None) for j in ("pretest", "posttest", "literasiPre", "literasiPost")}
        baris_siswa.append(
            {
                "kode_siswa": s.kode_siswa,
                "modul_selesai": selesai.get(s.id, 0),
                "pretest": skor["pretest"],
                "posttest": skor["posttest"],
                "ngain": n_gain(skor["pretest"], skor["posttest"]),
                "literasi_pre": skor["literasiPre"],
                "literasi_post": skor["literasiPost"],
                "ngain_literasi": n_gain(skor["literasiPre"], skor["literasiPost"]),
                "sinkron_terakhir": s.sinkron_terakhir.isoformat() if s.sinkron_terakhir else None,
            }
        )

    mk = Counter(
        p.miskonsepsi
        for p in db.scalars(select(Percobaan).where(Percobaan.siswa_id.in_(ids), Percobaan.miskonsepsi.is_not(None)))
    )

    literasi = {k: {"benar": 0, "total": 0} for k in INDIKATOR}
    for j in db.scalars(
        select(JawabanLiterasi).where(JawabanLiterasi.siswa_id.in_(ids), JawabanLiterasi.benar.is_not(None))
    ):
        for k in j.indikator or []:
            if k in literasi:
                literasi[k]["total"] += 1
                literasi[k]["benar"] += int(bool(j.benar))

    beban: dict[str, list[int]] = defaultdict(list)
    for b in db.scalars(select(BebanKognitif).where(BebanKognitif.siswa_id.in_(ids))):
        beban[b.modul_id].append(b.skor)

    return {
        "kelas": {"id": kelas.id, "nama": kelas.nama, "kode_kelas": kelas.kode_kelas},
        "siswa": baris_siswa,
        "miskonsepsi": [{"kode": k, "jumlah": n} for k, n in mk.most_common(5)],
        "literasi": literasi,
        "beban": [{"modul_id": m, "rata": sum(v) / len(v), "n": len(v)} for m, v in sorted(beban.items())],
    }


# ---------------- ekspor ----------------

JENIS_EKSPOR = ["ringkasan", "hasil_tes", "percobaan", "jawaban_literasi", "beban_kognitif", "kejadian"]


def baris_ekspor(db: Session, kelas: Kelas, jenis: str) -> list[dict[str, Any]]:
    siswa = {s.id: s for s in _siswa_kelas(db, kelas)}
    ids = list(siswa)
    kode = lambda sid: siswa[sid].kode_siswa  # noqa: E731

    if jenis == "ringkasan":
        return [{"kelas": kelas.nama, **r} for r in ringkasan_kelas(db, kelas)["siswa"]]

    if jenis == "hasil_tes":
        return [
            {
                "kode_siswa": kode(t.siswa_id),
                "id": t.id,
                "jenis": t.jenis,
                "skor": t.skor,
                "benar": t.benar,
                "total": t.total,
                "durasi_detik": t.durasi_detik,
                "waktu": t.waktu,
                **{f"butir_{j.get('id', i + 1)}": _sel(j.get("benar")) for i, j in enumerate(t.jawaban or []) if isinstance(j, dict)},
            }
            for t in db.scalars(select(HasilTes).where(HasilTes.siswa_id.in_(ids)).order_by(HasilTes.waktu))
        ]

    if jenis == "percobaan":
        return [
            {
                "kode_siswa": kode(p.siswa_id),
                "id": p.id,
                "modul_id": p.modul_id,
                "soal_id": p.soal_id,
                "jenis": p.jenis,
                "mode": p.mode,
                "jawaban": _sel(p.jawaban),
                "benar": _sel(p.benar),
                "miskonsepsi": p.miskonsepsi,
                "petunjuk_dibuka": p.petunjuk_dibuka,
                "yakin": p.yakin,
                "durasi_detik": p.durasi_detik,
                "waktu": p.waktu,
            }
            for p in db.scalars(select(Percobaan).where(Percobaan.siswa_id.in_(ids)).order_by(Percobaan.waktu))
        ]

    if jenis == "jawaban_literasi":
        hasil = []
        for j in db.scalars(
            select(JawabanLiterasi).where(JawabanLiterasi.siswa_id.in_(ids)).order_by(JawabanLiterasi.waktu)
        ):
            skor = sorted(j.skor_rubrik, key=lambda s: s.penilai_id)
            hasil.append(
                {
                    "kode_siswa": kode(j.siswa_id),
                    "id": j.id,
                    "mode": j.mode,
                    "modul_id": j.modul_id,
                    "stimulus_id": j.stimulus_id,
                    "butir_id": j.butir_id,
                    "bentuk": j.bentuk,
                    "indikator": ";".join(j.indikator or []),
                    "jawaban": _sel(j.jawaban),
                    "benar": _sel(j.benar),
                    "teks_uraian": j.teks_uraian,
                    "skor_rubrik_1": skor[0].skor if len(skor) > 0 else None,
                    "penilai_1": skor[0].penilai_id if len(skor) > 0 else None,
                    "skor_rubrik_2": skor[1].skor if len(skor) > 1 else None,
                    "penilai_2": skor[1].penilai_id if len(skor) > 1 else None,
                    "durasi_detik": j.durasi_detik,
                    "waktu": j.waktu,
                }
            )
        return hasil

    if jenis == "beban_kognitif":
        return [
            {"kode_siswa": kode(b.siswa_id), "id": b.id, "modul_id": b.modul_id, "skor": b.skor, "waktu": b.waktu}
            for b in db.scalars(select(BebanKognitif).where(BebanKognitif.siswa_id.in_(ids)).order_by(BebanKognitif.waktu))
        ]

    if jenis == "kejadian":
        return [
            {"kode_siswa": kode(k.siswa_id), "id": k.id, "jenis": k.jenis, "konteks": _sel(k.konteks), "waktu": k.waktu}
            for k in db.scalars(select(Kejadian).where(Kejadian.siswa_id.in_(ids)).order_by(Kejadian.waktu))
        ]

    raise ValueError(f"Jenis ekspor tidak dikenal: {jenis}")


def _sel(v: Any) -> Any:
    """Nilai sel: bool → 1/0, list/dict → teks JSON."""
    import json

    if isinstance(v, bool):
        return int(v)
    if isinstance(v, (list, dict)):
        return json.dumps(v, ensure_ascii=False)
    return v


def _kolom(baris: list[dict[str, Any]]) -> list[str]:
    kolom: list[str] = []
    for b in baris:
        for k in b:
            if k not in kolom:
                kolom.append(k)
    return kolom


def ke_csv(baris: list[dict[str, Any]]) -> bytes:
    buf = io.StringIO()
    kolom = _kolom(baris) or ["kosong"]
    w = csv.DictWriter(buf, fieldnames=kolom, extrasaction="ignore")
    w.writeheader()
    w.writerows(baris)
    return buf.getvalue().encode("utf-8-sig")  # BOM agar Excel membaca UTF-8 dengan benar


def ke_xlsx(lembar: dict[str, list[dict[str, Any]]]) -> bytes:
    from openpyxl import Workbook

    wb = Workbook()
    wb.remove(wb.active)
    for nama, baris in lembar.items():
        ws = wb.create_sheet(title=nama[:31])
        kolom = _kolom(baris)
        ws.append(kolom or ["kosong"])
        for b in baris:
            ws.append([b.get(k) for k in kolom])
    buf = io.BytesIO()
    wb.save(buf)
    return buf.getvalue()


def jumlah_penilai(j: JawabanLiterasi) -> int:
    return len(j.skor_rubrik)


def skor_oleh(j: JawabanLiterasi, guru_id: int) -> SkorRubrik | None:
    return next((s for s in j.skor_rubrik if s.penilai_id == guru_id), None)
