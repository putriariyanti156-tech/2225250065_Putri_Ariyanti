"""Kata sandi (bcrypt), token login guru (JWT), token perangkat siswa, dan pembatas laju."""

from __future__ import annotations

import hashlib
import secrets
import string
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, Header, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .config import pengaturan
from .database import ambil_db
from .models import Guru, Siswa

ALGORITMA = "HS256"


def hash_sandi(sandi: str) -> str:
    return bcrypt.hashpw(sandi.encode("utf-8"), bcrypt.gensalt()).decode("ascii")


def cek_sandi(sandi: str, hash_tersimpan: str) -> bool:
    try:
        return bcrypt.checkpw(sandi.encode("utf-8"), hash_tersimpan.encode("ascii"))
    except ValueError:
        return False


def buat_token_guru(guru_id: int) -> str:
    kedaluwarsa = datetime.now(timezone.utc) + timedelta(hours=pengaturan.token_jam)
    return jwt.encode({"sub": str(guru_id), "exp": kedaluwarsa}, pengaturan.secret_key, algorithm=ALGORITMA)


def buat_token_perangkat() -> str:
    return secrets.token_urlsafe(32)


def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def buat_kode_kelas(panjang: int = 6) -> str:
    # Tanpa huruf/angka yang mirip (0/O, 1/I/L) agar mudah dibacakan di kelas.
    huruf = "".join(c for c in string.ascii_uppercase + string.digits if c not in "0O1IL")
    return "".join(secrets.choice(huruf) for _ in range(panjang))


# ---------------- dependensi FastAPI ----------------


def guru_saat_ini(
    authorization: str | None = Header(default=None), db: Session = Depends(ambil_db)
) -> Guru:
    gagal = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesi tidak valid atau sudah berakhir. Silakan masuk lagi.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not authorization or not authorization.lower().startswith("bearer "):
        raise gagal
    try:
        isi = jwt.decode(authorization.split(" ", 1)[1], pengaturan.secret_key, algorithms=[ALGORITMA])
        guru = db.get(Guru, int(isi["sub"]))
    except (jwt.PyJWTError, KeyError, ValueError):
        raise gagal from None
    if guru is None:
        raise gagal
    return guru


def siswa_saat_ini(
    x_token_perangkat: str | None = Header(default=None), db: Session = Depends(ambil_db)
) -> Siswa:
    if not x_token_perangkat:
        raise HTTPException(status_code=401, detail="Perangkat belum bergabung ke kelas.")
    siswa = db.scalar(select(Siswa).where(Siswa.token_hash == hash_token(x_token_perangkat)))
    if siswa is None:
        raise HTTPException(status_code=401, detail="Token perangkat tidak dikenal. Gabung ulang ke kelas.")
    return siswa


class PembatasLaju:
    """Pembatas laju sederhana di memori: maks `batas` permintaan per `detik` per alamat IP."""

    def __init__(self, batas: int, detik: int) -> None:
        self.batas = batas
        self.detik = detik
        self.catatan: dict[str, deque[float]] = defaultdict(deque)

    def __call__(self, request: Request) -> None:
        ip = request.client.host if request.client else "?"
        sekarang = time.monotonic()
        antrean = self.catatan[ip]
        while antrean and sekarang - antrean[0] > self.detik:
            antrean.popleft()
        if len(antrean) >= self.batas:
            raise HTTPException(status_code=429, detail="Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.")
        antrean.append(sekarang)


batas_masuk = PembatasLaju(batas=10, detik=60)
batas_gabung = PembatasLaju(batas=20, detik=60)
