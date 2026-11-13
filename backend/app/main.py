"""Server BULAT (FastAPI).

- /api/...  : API untuk aplikasi siswa dan dasbor guru
- /docs     : dokumentasi API interaktif
- /         : aplikasi web (PWA) hasil build frontend, bila folder frontend/dist ada
"""

from __future__ import annotations

import mimetypes
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .config import pengaturan
from .database import siapkan_tabel
from .routers import guru, siswa

# Windows kadang tidak mengenali tipe berkas PWA ini.
mimetypes.add_type("application/manifest+json", ".webmanifest")
mimetypes.add_type("text/javascript", ".js")
mimetypes.add_type("font/woff2", ".woff2")


@asynccontextmanager
async def siklus(_: FastAPI):
    siapkan_tabel()
    yield


app = FastAPI(
    title="BULAT API",
    description="Backend aplikasi BULAT — Belajar Operasi Bilangan Bulat.",
    version="0.1.0",
    lifespan=siklus,
)

asal = pengaturan.cors_origins + ["capacitor://localhost", "http://localhost", "http://localhost:5173"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=asal,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type", "X-Token-Perangkat"],
)

app.include_router(guru.router)
app.include_router(siswa.router)


@app.get("/api/kesehatan", tags=["umum"])
def kesehatan() -> dict:
    return {"status": "ok"}


# Menyajikan aplikasi web (PWA). Harus dipasang terakhir agar tidak menutupi /api.
if pengaturan.frontend_dist.is_dir():
    app.mount("/", StaticFiles(directory=pengaturan.frontend_dist, html=True), name="web")
