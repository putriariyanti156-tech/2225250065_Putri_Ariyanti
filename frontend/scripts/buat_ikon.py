"""Membuat ikon PNG aplikasi (tanda ±) tanpa pustaka tambahan.

Jalankan dari folder frontend:  python scripts/buat_ikon.py
"""

import struct
import zlib
from pathlib import Path

BIRU = (0x1D, 0x4E, 0xD8)
PUTIH = (0xFF, 0xFF, 0xFF)
ORANYE = (0xFD, 0xBA, 0x74)


def png(lebar: int, piksel: list[list[tuple[int, int, int]]]) -> bytes:
    def potongan(jenis: bytes, data: bytes) -> bytes:
        isi = jenis + data
        return struct.pack(">I", len(data)) + isi + struct.pack(">I", zlib.crc32(isi) & 0xFFFFFFFF)

    mentah = b"".join(b"\x00" + bytes(c for p in baris for c in p) for baris in piksel)
    ihdr = struct.pack(">IIBBBBB", lebar, lebar, 8, 2, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + potongan(b"IHDR", ihdr) + potongan(b"IDAT", zlib.compress(mentah, 9)) + potongan(b"IEND", b"")


def gambar(ukuran: int, skala_isi: float) -> bytes:
    """skala_isi < 1 memberi ruang aman untuk ikon maskable."""
    piksel = [[BIRU for _ in range(ukuran)] for _ in range(ukuran)]
    s = ukuran / 64 * skala_isi
    o = ukuran * (1 - skala_isi) / 2

    def kotak(x: float, y: float, w: float, h: float, warna: tuple[int, int, int]) -> None:
        for yy in range(int(o + y * s), int(o + (y + h) * s)):
            for xx in range(int(o + x * s), int(o + (x + w) * s)):
                piksel[yy][xx] = warna

    kotak(28, 12, 8, 26, PUTIH)  # garis tegak tanda +
    kotak(19, 21, 26, 8, PUTIH)  # garis datar tanda +
    kotak(19, 44, 26, 8, ORANYE)  # tanda −
    return png(ukuran, piksel)


def main() -> None:
    folder = Path(__file__).resolve().parent.parent / "public" / "icons"
    folder.mkdir(parents=True, exist_ok=True)
    (folder / "icon-192.png").write_bytes(gambar(192, 1.0))
    (folder / "icon-512.png").write_bytes(gambar(512, 1.0))
    (folder / "icon-maskable-512.png").write_bytes(gambar(512, 0.7))
    (folder / "apple-touch-icon.png").write_bytes(gambar(180, 0.85))
    print("Ikon dibuat di", folder)


if __name__ == "__main__":
    main()
