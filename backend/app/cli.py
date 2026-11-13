"""Perintah pengelolaan server.

Contoh:
    python -m app.cli buat-guru --email guru@sekolah.sch.id --nama "Bu Guru"
    python -m app.cli daftar-guru
    python -m app.cli ganti-sandi --email guru@sekolah.sch.id
"""

from __future__ import annotations

import argparse
import getpass
import sys

from sqlalchemy import select

from .database import SesiLokal, siapkan_tabel
from .models import Guru
from .security import hash_sandi


def _minta_sandi() -> str:
    sandi = getpass.getpass("Kata sandi (min. 8 karakter): ")
    if len(sandi) < 8:
        sys.exit("Kata sandi terlalu pendek.")
    if getpass.getpass("Ulangi kata sandi: ") != sandi:
        sys.exit("Kata sandi tidak sama.")
    return sandi


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    sub = parser.add_subparsers(dest="perintah", required=True)

    b = sub.add_parser("buat-guru", help="Membuat akun guru/peneliti")
    b.add_argument("--email", required=True)
    b.add_argument("--nama", required=True)
    b.add_argument("--peran", default="guru", choices=["guru", "peneliti"])
    b.add_argument("--sandi", help="Jika dikosongkan, akan ditanyakan (lebih aman)")

    sub.add_parser("daftar-guru", help="Menampilkan semua akun guru")

    g = sub.add_parser("ganti-sandi", help="Mengganti kata sandi guru")
    g.add_argument("--email", required=True)
    g.add_argument("--sandi")

    args = parser.parse_args(argv)
    siapkan_tabel()
    with SesiLokal() as db:
        if args.perintah == "buat-guru":
            email = args.email.lower()
            if db.scalar(select(Guru).where(Guru.email == email)):
                sys.exit(f"Email {email} sudah terdaftar.")
            sandi = args.sandi or _minta_sandi()
            db.add(Guru(email=email, nama=args.nama, peran=args.peran, hash_sandi=hash_sandi(sandi)))
            db.commit()
            print(f"Akun {args.peran} dibuat: {email}")
        elif args.perintah == "daftar-guru":
            for guru in db.scalars(select(Guru).order_by(Guru.id)):
                print(f"{guru.id}\t{guru.email}\t{guru.nama}\t{guru.peran}")
        elif args.perintah == "ganti-sandi":
            guru = db.scalar(select(Guru).where(Guru.email == args.email.lower()))
            if guru is None:
                sys.exit("Guru tidak ditemukan.")
            guru.hash_sandi = hash_sandi(args.sandi or _minta_sandi())
            db.commit()
            print("Kata sandi diperbarui.")


if __name__ == "__main__":
    main()
