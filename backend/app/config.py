"""Pengaturan aplikasi dari variabel lingkungan (atau file backend/.env)."""

from __future__ import annotations

import os
import secrets
import warnings
from pathlib import Path

FOLDER_BACKEND = Path(__file__).resolve().parent.parent


def _muat_env() -> None:
    """Pembaca .env sederhana (KUNCI=nilai), tanpa pustaka tambahan."""
    berkas = FOLDER_BACKEND / ".env"
    if not berkas.exists():
        return
    for baris in berkas.read_text(encoding="utf-8").splitlines():
        baris = baris.strip()
        if not baris or baris.startswith("#") or "=" not in baris:
            continue
        kunci, nilai = baris.split("=", 1)
        os.environ.setdefault(kunci.strip(), nilai.strip().strip('"').strip("'"))


_muat_env()


def _url_db(url: str) -> str:
    # Layanan seperti Render/Neon memberi "postgres://"; SQLAlchemy + psycopg 3 butuh skema ini.
    if url.startswith("postgres://"):
        return "postgresql+psycopg://" + url[len("postgres://") :]
    if url.startswith("postgresql://"):
        return "postgresql+psycopg://" + url[len("postgresql://") :]
    return url


class Pengaturan:
    def __init__(self) -> None:
        self.secret_key: str = os.environ.get("SECRET_KEY", "")
        if not self.secret_key:
            warnings.warn(
                "SECRET_KEY belum diatur. Memakai kunci acak sementara: semua login guru "
                "akan kedaluwarsa saat server dimulai ulang. Atur SECRET_KEY untuk produksi.",
                stacklevel=2,
            )
            self.secret_key = secrets.token_urlsafe(48)
        # Nilai kosong di .env dianggap "tidak diatur" → pakai bawaan.
        self.database_url: str = _url_db(
            os.environ.get("DATABASE_URL") or f"sqlite:///{(FOLDER_BACKEND / 'bulat.db').as_posix()}"
        )
        self.cors_origins: list[str] = [
            o.strip() for o in os.environ.get("CORS_ORIGINS", "").split(",") if o.strip()
        ]
        self.kode_daftar_guru: str = os.environ.get("KODE_DAFTAR_GURU", "")
        self.token_jam: int = int(os.environ.get("TOKEN_JAM") or "8")
        self.frontend_dist: Path = Path(
            os.environ.get("FRONTEND_DIST") or FOLDER_BACKEND.parent / "frontend" / "dist"
        )


pengaturan = Pengaturan()
