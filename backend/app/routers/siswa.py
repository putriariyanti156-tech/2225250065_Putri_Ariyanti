"""Rute untuk aplikasi siswa: bergabung ke kelas dan sinkronisasi data."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..database import ambil_db
from ..models import BebanKognitif, HasilTes, JawabanLiterasi, Kejadian, Kelas, Percobaan, Progres, Siswa
from ..schemas import (
    DBeban,
    DHasilTes,
    DKejadian,
    DLiterasi,
    DPercobaan,
    DProgres,
    GabungOut,
    GabungReq,
    SinkronOut,
    SinkronReq,
)
from ..security import batas_gabung, buat_token_perangkat, hash_token, siswa_saat_ini

router = APIRouter(prefix="/api", tags=["siswa"])


@router.post("/siswa/gabung", response_model=GabungOut, dependencies=[Depends(batas_gabung)])
def gabung(req: GabungReq, db: Session = Depends(ambil_db)) -> GabungOut:
    if not req.persetujuan:
        raise HTTPException(status_code=400, detail="Persetujuan diperlukan untuk bergabung ke kelas.")
    kelas = db.scalar(select(Kelas).where(Kelas.kode_kelas == req.kode_kelas.strip().upper(), Kelas.aktif.is_(True)))
    if kelas is None:
        raise HTTPException(status_code=404, detail="Kode kelas tidak ditemukan. Periksa lagi kode dari guru.")
    kode = req.kode_siswa.strip().upper()
    token = buat_token_perangkat()
    siswa = db.scalar(select(Siswa).where(Siswa.kelas_id == kelas.id, Siswa.kode_siswa == kode))
    if siswa is None:
        siswa = Siswa(kelas_id=kelas.id, kode_siswa=kode, token_hash=hash_token(token))
        db.add(siswa)
    else:
        # Bergabung ulang (mis. ganti HP): token lama tidak berlaku lagi.
        siswa.token_hash = hash_token(token)
        siswa.persetujuan_pada = datetime.now(timezone.utc)
    db.commit()
    return GabungOut(token_perangkat=token, kode_kelas=kelas.kode_kelas, nama_kelas=kelas.nama)


def _simpan(db: Session, siswa: Siswa, tabel: str, data: BaseModel) -> bool:
    """Menyimpan satu rekaman secara idempoten. Mengembalikan True bila diterima."""
    if tabel == "progres":
        d: DProgres = data  # type: ignore[assignment]
        p = db.scalar(select(Progres).where(Progres.siswa_id == siswa.id, Progres.modul_id == d.modulId))
        if p is None:
            db.add(Progres(siswa_id=siswa.id, modul_id=d.modulId, status=d.status, bintang=d.bintang, tahap=d.tahap, diperbarui=d.diperbarui))
        elif d.diperbarui >= p.diperbarui:
            p.status, p.bintang, p.tahap, p.diperbarui = d.status, d.bintang, d.tahap, d.diperbarui
        return True

    model = {
        "hasilTes": HasilTes,
        "percobaan": Percobaan,
        "bebanKognitif": BebanKognitif,
        "jawabanLiterasi": JawabanLiterasi,
        "kejadian": Kejadian,
    }[tabel]
    ada = db.get(model, data.id)  # type: ignore[attr-defined]
    if ada is not None:
        return ada.siswa_id == siswa.id  # sudah pernah diterima (kirim ulang) → anggap diterima

    if tabel == "hasilTes":
        d = data  # type: ignore[assignment]
        db.add(HasilTes(id=d.id, siswa_id=siswa.id, jenis=d.jenis, skor=d.skor, benar=d.benar, total=d.total, jawaban=d.jawaban, durasi_detik=d.durasiDetik, waktu=d.waktu))
    elif tabel == "percobaan":
        d = data  # type: ignore[assignment]
        lain = {k: v for k, v in (d.model_extra or {}).items()}
        db.add(
            Percobaan(
                id=d.id, siswa_id=siswa.id, soal_id=d.soalId, modul_id=d.modulId, jenis=d.jenis, mode=d.mode,
                jawaban=d.jawaban, benar=d.benar, miskonsepsi=d.miskonsepsi, petunjuk_dibuka=d.petunjukDibuka,
                yakin=d.yakin, durasi_detik=d.durasiDetik, data_lain=lain or None, waktu=d.waktu,
            )
        )
    elif tabel == "bebanKognitif":
        d = data  # type: ignore[assignment]
        db.add(BebanKognitif(id=d.id, siswa_id=siswa.id, modul_id=d.modulId, skor=d.skor, waktu=d.waktu))
    elif tabel == "jawabanLiterasi":
        d = data  # type: ignore[assignment]
        db.add(
            JawabanLiterasi(
                id=d.id, siswa_id=siswa.id, butir_id=d.butirId, stimulus_id=d.stimulusId, modul_id=d.modulId,
                mode=d.mode, bentuk=d.bentuk, indikator=d.indikator, jawaban=d.jawaban, benar=d.benar,
                teks_uraian=d.teksUraian, durasi_detik=d.durasiDetik, waktu=d.waktu,
            )
        )
    elif tabel == "kejadian":
        d = data  # type: ignore[assignment]
        db.add(Kejadian(id=d.id, siswa_id=siswa.id, jenis=d.jenis, konteks=d.konteks, waktu=d.waktu))
    return True


SKEMA = {
    "hasilTes": DHasilTes,
    "percobaan": DPercobaan,
    "progres": DProgres,
    "bebanKognitif": DBeban,
    "jawabanLiterasi": DLiterasi,
    "kejadian": DKejadian,
}


@router.post("/sinkron", response_model=SinkronOut)
def sinkron(req: SinkronReq, siswa: Siswa = Depends(siswa_saat_ini), db: Session = Depends(ambil_db)) -> SinkronOut:
    diterima = diabaikan = 0
    for item in req.item:
        try:
            data = SKEMA[item.tabel].model_validate(item.data)
        except ValidationError:
            diabaikan += 1
            continue
        if _simpan(db, siswa, item.tabel, data):
            diterima += 1
            db.flush()
        else:
            diabaikan += 1
    siswa.sinkron_terakhir = datetime.now(timezone.utc)
    db.commit()
    return SinkronOut(diterima=diterima, diabaikan=diabaikan)
