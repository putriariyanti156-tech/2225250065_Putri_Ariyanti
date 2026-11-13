"""Rute untuk guru/peneliti: login, kelas, ringkasan, penilaian uraian, ekspor."""

from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Response
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from .. import services
from ..config import pengaturan
from ..database import ambil_db
from ..models import Guru, JawabanLiterasi, Kelas, Siswa, SkorRubrik
from ..schemas import DaftarReq, GuruOut, KelasBuat, KelasOut, MasukReq, RubrikReq, TokenOut
from ..security import batas_masuk, buat_kode_kelas, buat_token_guru, cek_sandi, guru_saat_ini, hash_sandi

router = APIRouter(prefix="/api", tags=["guru"])


# ---------------- autentikasi ----------------


@router.post("/auth/masuk", response_model=TokenOut, dependencies=[Depends(batas_masuk)])
def masuk(req: MasukReq, db: Session = Depends(ambil_db)) -> TokenOut:
    guru = db.scalar(select(Guru).where(Guru.email == req.email.lower()))
    if guru is None or not cek_sandi(req.sandi, guru.hash_sandi):
        raise HTTPException(status_code=401, detail="Email atau kata sandi salah.")
    return TokenOut(token=buat_token_guru(guru.id), guru=GuruOut.model_validate(guru))


@router.post("/auth/daftar", response_model=TokenOut, dependencies=[Depends(batas_masuk)])
def daftar(req: DaftarReq, db: Session = Depends(ambil_db)) -> TokenOut:
    """Pendaftaran guru mandiri — hanya aktif bila KODE_DAFTAR_GURU diatur di server."""
    if not pengaturan.kode_daftar_guru or req.kode_daftar != pengaturan.kode_daftar_guru:
        raise HTTPException(status_code=403, detail="Kode pendaftaran guru tidak valid.")
    guru = Guru(email=req.email.lower(), hash_sandi=hash_sandi(req.sandi), nama=req.nama)
    db.add(guru)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Email sudah terdaftar.") from None
    return TokenOut(token=buat_token_guru(guru.id), guru=GuruOut.model_validate(guru))


@router.get("/auth/saya", response_model=GuruOut)
def saya(guru: Guru = Depends(guru_saat_ini)) -> GuruOut:
    return GuruOut.model_validate(guru)


# ---------------- kelas ----------------


def kelas_milik(db: Session, guru: Guru, kelas_id: int) -> Kelas:
    kelas = db.get(Kelas, kelas_id)
    if kelas is None or kelas.guru_id != guru.id:
        raise HTTPException(status_code=404, detail="Kelas tidak ditemukan.")
    return kelas


@router.get("/kelas", response_model=list[KelasOut])
def daftar_kelas(guru: Guru = Depends(guru_saat_ini), db: Session = Depends(ambil_db)) -> list[KelasOut]:
    jumlah = dict(
        db.execute(
            select(Siswa.kelas_id, func.count(Siswa.id)).join(Kelas).where(Kelas.guru_id == guru.id).group_by(Siswa.kelas_id)
        ).all()
    )
    return [
        KelasOut(id=k.id, nama=k.nama, kode_kelas=k.kode_kelas, jumlah_siswa=jumlah.get(k.id, 0))
        for k in db.scalars(select(Kelas).where(Kelas.guru_id == guru.id).order_by(Kelas.dibuat_pada.desc()))
    ]


@router.post("/kelas", response_model=KelasOut, status_code=201)
def buat_kelas(req: KelasBuat, guru: Guru = Depends(guru_saat_ini), db: Session = Depends(ambil_db)) -> KelasOut:
    for _ in range(10):
        kode = buat_kode_kelas()
        if db.scalar(select(Kelas).where(Kelas.kode_kelas == kode)) is None:
            break
    kelas = Kelas(guru_id=guru.id, nama=req.nama.strip(), kode_kelas=kode)
    db.add(kelas)
    db.commit()
    return KelasOut(id=kelas.id, nama=kelas.nama, kode_kelas=kelas.kode_kelas, jumlah_siswa=0)


@router.get("/kelas/{kelas_id}/ringkasan")
def ringkasan(kelas_id: int, guru: Guru = Depends(guru_saat_ini), db: Session = Depends(ambil_db)) -> dict:
    return services.ringkasan_kelas(db, kelas_milik(db, guru, kelas_id))


# ---------------- penilaian uraian (rubrik) ----------------


@router.get("/kelas/{kelas_id}/uraian")
def daftar_uraian(kelas_id: int, guru: Guru = Depends(guru_saat_ini), db: Session = Depends(ambil_db)) -> list[dict]:
    kelas = kelas_milik(db, guru, kelas_id)
    q = (
        select(JawabanLiterasi, Siswa.kode_siswa)
        .join(Siswa, Siswa.id == JawabanLiterasi.siswa_id)
        .where(Siswa.kelas_id == kelas.id, JawabanLiterasi.teks_uraian.is_not(None), JawabanLiterasi.teks_uraian != "")
        .order_by(JawabanLiterasi.butir_id, Siswa.kode_siswa)
    )
    hasil = []
    for j, kode in db.execute(q).all():
        milik = services.skor_oleh(j, guru.id)
        hasil.append(
            {
                "id": j.id,
                "kode_siswa": kode,
                "butir_id": j.butir_id,
                "stimulus_id": j.stimulus_id,
                "mode": j.mode,
                "indikator": j.indikator or [],
                "teks_uraian": j.teks_uraian,
                "skor_saya": milik.skor if milik else None,
                "jumlah_penilai": services.jumlah_penilai(j),
            }
        )
    return hasil


@router.post("/rubrik")
def simpan_rubrik(req: RubrikReq, guru: Guru = Depends(guru_saat_ini), db: Session = Depends(ambil_db)) -> dict:
    j = db.get(JawabanLiterasi, req.jawaban_literasi_id)
    if j is None:
        raise HTTPException(status_code=404, detail="Jawaban tidak ditemukan.")
    siswa = db.get(Siswa, j.siswa_id)
    kelas_milik(db, guru, siswa.kelas_id)  # hanya guru pemilik kelas yang boleh menilai
    skor = db.scalar(
        select(SkorRubrik).where(SkorRubrik.jawaban_literasi_id == j.id, SkorRubrik.penilai_id == guru.id)
    )
    if skor is None:
        skor = SkorRubrik(jawaban_literasi_id=j.id, penilai_id=guru.id, skor=req.skor, catatan=req.catatan)
        db.add(skor)
    else:
        skor.skor = req.skor
        skor.catatan = req.catatan
    db.commit()
    return {"id": j.id, "skor": req.skor}


# ---------------- ekspor ----------------


@router.get("/kelas/{kelas_id}/ekspor")
def ekspor(
    kelas_id: int,
    jenis: str = Query("ringkasan"),
    format: Literal["csv", "xlsx"] = Query("csv"),
    guru: Guru = Depends(guru_saat_ini),
    db: Session = Depends(ambil_db),
) -> Response:
    kelas = kelas_milik(db, guru, kelas_id)
    nama_berkas = f"bulat-{kelas.kode_kelas}-{jenis}.{format}"
    if format == "xlsx":
        daftar = services.JENIS_EKSPOR if jenis == "semua" else [jenis]
        if any(j not in services.JENIS_EKSPOR for j in daftar):
            raise HTTPException(status_code=400, detail="Jenis ekspor tidak dikenal.")
        isi = services.ke_xlsx({j: services.baris_ekspor(db, kelas, j) for j in daftar})
        media = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        if jenis not in services.JENIS_EKSPOR:
            raise HTTPException(status_code=400, detail="Jenis ekspor tidak dikenal.")
        isi = services.ke_csv(services.baris_ekspor(db, kelas, jenis))
        media = "text/csv; charset=utf-8"
    return Response(content=isi, media_type=media, headers={"Content-Disposition": f'attachment; filename="{nama_berkas}"'})
