"""Tabel basis data server (dokumen 06 §7.1). Identitas siswa hanya kode, tanpa nama."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .database import Base


def kini() -> datetime:
    return datetime.now(timezone.utc)


class Guru(Base):
    __tablename__ = "guru"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    hash_sandi: Mapped[str] = mapped_column(String(100))
    nama: Mapped[str] = mapped_column(String(100))
    peran: Mapped[str] = mapped_column(String(20), default="guru")
    dibuat_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=kini)

    kelas: Mapped[list[Kelas]] = relationship(back_populates="guru")


class Kelas(Base):
    __tablename__ = "kelas"
    id: Mapped[int] = mapped_column(primary_key=True)
    guru_id: Mapped[int] = mapped_column(ForeignKey("guru.id"), index=True)
    nama: Mapped[str] = mapped_column(String(80))
    kode_kelas: Mapped[str] = mapped_column(String(12), unique=True, index=True)
    aktif: Mapped[bool] = mapped_column(Boolean, default=True)
    dibuat_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=kini)

    guru: Mapped[Guru] = relationship(back_populates="kelas")
    siswa: Mapped[list[Siswa]] = relationship(back_populates="kelas")


class Siswa(Base):
    __tablename__ = "siswa"
    __table_args__ = (UniqueConstraint("kelas_id", "kode_siswa"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    kelas_id: Mapped[int] = mapped_column(ForeignKey("kelas.id"), index=True)
    kode_siswa: Mapped[str] = mapped_column(String(12))
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    persetujuan_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=kini)
    sinkron_terakhir: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    kelas: Mapped[Kelas] = relationship(back_populates="siswa")


class HasilTes(Base):
    __tablename__ = "hasil_tes"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    siswa_id: Mapped[int] = mapped_column(ForeignKey("siswa.id"), index=True)
    jenis: Mapped[str] = mapped_column(String(20), index=True)
    skor: Mapped[int] = mapped_column(Integer)
    benar: Mapped[int] = mapped_column(Integer, default=0)
    total: Mapped[int] = mapped_column(Integer, default=0)
    jawaban: Mapped[Any] = mapped_column(JSON, default=list)
    durasi_detik: Mapped[int | None] = mapped_column(Integer, nullable=True)
    waktu: Mapped[str] = mapped_column(String(40))
    diterima_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=kini)


class Percobaan(Base):
    __tablename__ = "percobaan"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    siswa_id: Mapped[int] = mapped_column(ForeignKey("siswa.id"), index=True)
    soal_id: Mapped[str] = mapped_column(String(40), index=True)
    modul_id: Mapped[str | None] = mapped_column(String(10), nullable=True)
    jenis: Mapped[str | None] = mapped_column(String(20), nullable=True)
    mode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    jawaban: Mapped[Any] = mapped_column(JSON, nullable=True)
    benar: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    miskonsepsi: Mapped[str | None] = mapped_column(String(10), nullable=True, index=True)
    petunjuk_dibuka: Mapped[int] = mapped_column(Integer, default=0)
    yakin: Mapped[str | None] = mapped_column(String(10), nullable=True)
    durasi_detik: Mapped[int | None] = mapped_column(Integer, nullable=True)
    data_lain: Mapped[Any] = mapped_column(JSON, nullable=True)
    waktu: Mapped[str] = mapped_column(String(40))
    diterima_pada: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=kini)


class Progres(Base):
    __tablename__ = "progres"
    __table_args__ = (UniqueConstraint("siswa_id", "modul_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    siswa_id: Mapped[int] = mapped_column(ForeignKey("siswa.id"), index=True)
    modul_id: Mapped[str] = mapped_column(String(10))
    status: Mapped[str] = mapped_column(String(10))
    bintang: Mapped[int] = mapped_column(Integer, default=0)
    tahap: Mapped[str | None] = mapped_column(String(20), nullable=True)
    diperbarui: Mapped[str] = mapped_column(String(40))


class BebanKognitif(Base):
    __tablename__ = "beban_kognitif"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    siswa_id: Mapped[int] = mapped_column(ForeignKey("siswa.id"), index=True)
    modul_id: Mapped[str] = mapped_column(String(10))
    skor: Mapped[int] = mapped_column(Integer)
    waktu: Mapped[str] = mapped_column(String(40))


class JawabanLiterasi(Base):
    __tablename__ = "jawaban_literasi"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    siswa_id: Mapped[int] = mapped_column(ForeignKey("siswa.id"), index=True)
    butir_id: Mapped[str] = mapped_column(String(40), index=True)
    stimulus_id: Mapped[str | None] = mapped_column(String(40), nullable=True)
    modul_id: Mapped[str | None] = mapped_column(String(10), nullable=True)
    mode: Mapped[str | None] = mapped_column(String(10), nullable=True)
    bentuk: Mapped[str | None] = mapped_column(String(30), nullable=True)
    indikator: Mapped[Any] = mapped_column(JSON, default=list)
    jawaban: Mapped[Any] = mapped_column(JSON, nullable=True)
    benar: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    teks_uraian: Mapped[str | None] = mapped_column(Text, nullable=True)
    durasi_detik: Mapped[int | None] = mapped_column(Integer, nullable=True)
    waktu: Mapped[str] = mapped_column(String(40))

    skor_rubrik: Mapped[list[SkorRubrik]] = relationship(back_populates="jawaban")


class SkorRubrik(Base):
    __tablename__ = "skor_rubrik"
    __table_args__ = (UniqueConstraint("jawaban_literasi_id", "penilai_id"),)
    id: Mapped[int] = mapped_column(primary_key=True)
    jawaban_literasi_id: Mapped[str] = mapped_column(ForeignKey("jawaban_literasi.id"), index=True)
    penilai_id: Mapped[int] = mapped_column(ForeignKey("guru.id"))
    skor: Mapped[int] = mapped_column(Integer)
    catatan: Mapped[str | None] = mapped_column(Text, nullable=True)
    waktu: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=kini, onupdate=kini)

    jawaban: Mapped[JawabanLiterasi] = relationship(back_populates="skor_rubrik")


class Kejadian(Base):
    __tablename__ = "kejadian"
    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    siswa_id: Mapped[int] = mapped_column(ForeignKey("siswa.id"), index=True)
    jenis: Mapped[str] = mapped_column(String(40))
    konteks: Mapped[Any] = mapped_column(JSON, default=dict)
    waktu: Mapped[str] = mapped_column(String(40))
