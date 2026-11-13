"""Koneksi basis data (SQLAlchemy 2)."""

from __future__ import annotations

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from .config import pengaturan


class Base(DeclarativeBase):
    pass


def buat_engine(url: str):
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False})
    return create_engine(url, pool_pre_ping=True)


engine = buat_engine(pengaturan.database_url)
SesiLokal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def ambil_db() -> Iterator[Session]:
    db = SesiLokal()
    try:
        yield db
    finally:
        db.close()


def siapkan_tabel(eng=None) -> None:
    """Membuat tabel bila belum ada (cukup untuk MVP; gunakan Alembic bila skema berubah)."""
    from . import models  # noqa: F401  (mendaftarkan model)

    Base.metadata.create_all(bind=eng or engine)
