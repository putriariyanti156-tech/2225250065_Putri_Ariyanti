import os
import tempfile
from pathlib import Path

import pytest

# Basis data uji terpisah — diatur SEBELUM aplikasi diimpor.
_folder = Path(tempfile.mkdtemp(prefix="bulat-uji-"))
os.environ["DATABASE_URL"] = f"sqlite:///{(_folder / 'uji.db').as_posix()}"
os.environ["SECRET_KEY"] = "kunci-rahasia-khusus-pengujian-yang-cukup-panjang-0123456789"
os.environ["KODE_DAFTAR_GURU"] = "DAFTAR-UJI"
os.environ["FRONTEND_DIST"] = str(_folder / "tidak-ada")

from fastapi.testclient import TestClient  # noqa: E402

from app import security  # noqa: E402
from app.database import Base, SesiLokal, engine  # noqa: E402
from app.main import app  # noqa: E402
from app.models import Guru  # noqa: E402
from app.security import hash_sandi  # noqa: E402


@pytest.fixture()
def klien():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    security.batas_masuk.catatan.clear()
    security.batas_gabung.catatan.clear()
    with SesiLokal() as db:
        db.add(Guru(email="guru@sekolah.id", nama="Bu Guru", hash_sandi=hash_sandi("rahasia123")))
        db.add(Guru(email="lain@sekolah.id", nama="Pak Lain", hash_sandi=hash_sandi("rahasia123")))
        db.commit()
    with TestClient(app) as c:
        yield c


def masuk(klien, email="guru@sekolah.id", sandi="rahasia123") -> dict:
    r = klien.post("/api/auth/masuk", json={"email": email, "sandi": sandi})
    assert r.status_code == 200, r.text
    return {"Authorization": f"Bearer {r.json()['token']}"}
