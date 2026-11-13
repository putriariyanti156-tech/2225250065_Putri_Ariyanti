"""Model Pydantic untuk request/response API."""

from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field

# ---------------- guru ----------------


class MasukReq(BaseModel):
    email: EmailStr
    sandi: str = Field(min_length=1, max_length=200)


class DaftarReq(BaseModel):
    email: EmailStr
    sandi: str = Field(min_length=8, max_length=200)
    nama: str = Field(min_length=1, max_length=100)
    kode_daftar: str


class GuruOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    nama: str
    peran: str


class TokenOut(BaseModel):
    token: str
    guru: GuruOut


# ---------------- kelas ----------------


class KelasBuat(BaseModel):
    nama: str = Field(min_length=1, max_length=80)


class KelasOut(BaseModel):
    id: int
    nama: str
    kode_kelas: str
    jumlah_siswa: int


class GabungReq(BaseModel):
    kode_kelas: str = Field(min_length=4, max_length=12)
    kode_siswa: str = Field(pattern=r"^[A-Za-z0-9-]{2,12}$")
    persetujuan: bool


class GabungOut(BaseModel):
    token_perangkat: str
    kode_kelas: str
    nama_kelas: str


class RubrikReq(BaseModel):
    jawaban_literasi_id: str = Field(max_length=64)
    skor: int = Field(ge=0, le=3)
    catatan: str | None = Field(default=None, max_length=2000)


# ---------------- sinkronisasi ----------------

NamaTabel = Literal["hasilTes", "percobaan", "progres", "bebanKognitif", "jawabanLiterasi", "kejadian"]


class ItemSinkron(BaseModel):
    tabel: NamaTabel
    data: dict[str, Any]


class SinkronReq(BaseModel):
    item: list[ItemSinkron] = Field(max_length=200)


class SinkronOut(BaseModel):
    diterima: int
    diabaikan: int


class _Data(BaseModel):
    model_config = ConfigDict(extra="ignore")


class DHasilTes(_Data):
    id: str = Field(max_length=64)
    jenis: Literal["prasyarat", "pretest", "posttest", "literasiPre", "literasiPost"]
    skor: int = Field(ge=0, le=100)
    benar: int = 0
    total: int = 0
    jawaban: list[Any] = []
    durasiDetik: int | None = None
    waktu: str = Field(max_length=40)


class DPercobaan(_Data):
    model_config = ConfigDict(extra="allow")
    id: str = Field(max_length=64)
    soalId: str = Field(max_length=40)
    modulId: str | None = Field(default=None, max_length=10)
    jenis: str | None = Field(default=None, max_length=20)
    mode: str | None = Field(default=None, max_length=20)
    jawaban: Any = None
    benar: bool | None = None
    miskonsepsi: str | None = Field(default=None, max_length=10)
    petunjukDibuka: int = 0
    yakin: str | None = Field(default=None, max_length=10)
    durasiDetik: int | None = None
    waktu: str = Field(max_length=40)


class DProgres(_Data):
    modulId: str = Field(max_length=10)
    status: Literal["belum", "sedang", "selesai"]
    bintang: int = Field(default=0, ge=0, le=3)
    tahap: str | None = Field(default=None, max_length=20)
    diperbarui: str = Field(max_length=40)


class DBeban(_Data):
    id: str = Field(max_length=64)
    modulId: str = Field(max_length=10)
    skor: int = Field(ge=1, le=9)
    waktu: str = Field(max_length=40)


class DLiterasi(_Data):
    id: str = Field(max_length=64)
    butirId: str = Field(max_length=40)
    stimulusId: str | None = Field(default=None, max_length=40)
    modulId: str | None = Field(default=None, max_length=10)
    mode: str | None = Field(default=None, max_length=10)
    bentuk: str | None = Field(default=None, max_length=30)
    indikator: list[str] = []
    jawaban: Any = None
    benar: bool | None = None
    teksUraian: str | None = Field(default=None, max_length=5000)
    durasiDetik: int | None = None
    waktu: str = Field(max_length=40)


class DKejadian(_Data):
    id: str = Field(max_length=64)
    jenis: str = Field(max_length=40)
    konteks: dict[str, Any] = {}
    waktu: str = Field(max_length=40)
