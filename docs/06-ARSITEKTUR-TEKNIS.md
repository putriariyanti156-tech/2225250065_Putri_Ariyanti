# 06 — Arsitektur Teknis (JavaScript + Python)

> **Catatan implementasi (13 Nov 2026).** Aplikasi sudah dibangun mengikuti dokumen ini, dengan penyederhanaan berikut:
> - CSS biasa dengan token warna (bukan Tailwind); tanpa Zustand/Zod.
> - Struktur folder lebih datar (`src/components/*.jsx`, `src/pages/*.jsx`).
> - Stimulus literasi disatukan di `content/literasi/stimulus.json`.
> - SQLAlchemy **2.0** dan tabel dibuat otomatis (`create_all`, belum Alembic).
> - Backend juga **menyajikan web app** sehingga cukup satu server/satu link.
> - Hosting: [Dockerfile](../Dockerfile) + [render.yaml](../render.yaml) atau [netlify.toml](../netlify.toml) (lihat [README](../README.md)).
> - Pemasangan di HP memakai **PWA**, sehingga APK Capacitor tidak diperlukan.

## 1. Ringkasan Keputusan

Aplikasi dibangun dengan **JavaScript** di sisi siswa (frontend: web + Android) dan **Python** di sisi server (backend: sinkronisasi data, dasbor guru) serta untuk **analisis data penelitian**.

| Bagian | Bahasa | Teknologi | Alasan |
|--------|--------|-----------|--------|
| Aplikasi siswa (web + Android) | **JavaScript** (ES2022, JSX) | **React 18 + Vite**, dibungkus **Capacitor** untuk Android | Satu kode untuk web dan APK; banyak tutorial berbahasa Indonesia |
| Bisa *offline* & dipasang dari browser | JavaScript | **PWA** (`vite-plugin-pwa`) | Siswa bisa "Tambahkan ke layar utama" tanpa Play Store |
| Tampilan | CSS | **Tailwind CSS** | Token warna terpusat, ringan |
| Visual garis bilangan & ekspresi | JavaScript | **SVG** dalam komponen React | Ringan, tajam di semua layar |
| Penyimpanan di perangkat | JavaScript | **IndexedDB via Dexie.js** | Progres tersimpan *offline* |
| State aplikasi | JavaScript | **Zustand** | Sederhana |
| Validasi data/konten (frontend) | JavaScript | **Zod** | Menggantikan pemeriksaan tipe TypeScript untuk data JSON |
| Dokumentasi tipe | JavaScript | **JSDoc** (`@typedef`, `@param`) | Bantuan *autocomplete* di VS Code tanpa TypeScript |
| **Backend API** | **Python 3.11+** | **FastAPI** + **Uvicorn** | Cepat dipelajari, dokumentasi API otomatis (`/docs`), validasi dengan Pydantic |
| Basis data server | SQL | **SQLite** (pengembangan) → **PostgreSQL** (produksi) melalui **SQLAlchemy 2** + **Alembic** | Mudah dimulai, mudah dipindah ke server |
| Autentikasi guru | Python | **JWT** (PyJWT) + hash kata sandi **bcrypt** (passlib) | Standar, sederhana |
| **Analisis penelitian** | **Python** | **pandas, SciPy, matplotlib, openpyxl, Jupyter** | N-gain, uji-t/Wilcoxon, reliabilitas, Aiken's V, kappa, grafik untuk skripsi |
| Pengujian | JS / Python | **Vitest** + Testing Library + **Playwright** (frontend) · **pytest** + HTTPX (backend) | Mesin matematika & API wajib teruji |
| Kualitas kode | JS / Python | **ESLint + Prettier** · **Ruff** (lint + format) | Konsisten |
| Hosting | — | Frontend: **Netlify / Vercel / GitHub Pages** · Backend: **Render / Railway / PythonAnywhere** · DB: **Neon / Supabase (PostgreSQL)** | Tersedia paket gratis untuk penelitian |

### Prinsip utama: *offline-first*

- Seluruh **materi, latihan, mesin matematika, dan umpan balik berjalan di perangkat** (JavaScript). Siswa tetap bisa belajar tanpa internet.
- **Backend Python hanya untuk**: bergabung ke kelas, mengirim hasil belajar (sinkronisasi), dasbor guru, penilaian uraian dengan rubrik, dan ekspor data.
- Jika server mati atau tidak ada sinyal, aplikasi tetap berfungsi; data dikirim nanti saat online.

## 2. Gambaran Arsitektur

```
┌───────────────────── PERANGKAT SISWA (JavaScript) ─────────────────────┐
│  UI React (pages, components)                                          │
│  ├─ Modul, Latihan, Soal Cerita, Literasi, Tes                         │
│  State (Zustand)                                                       │
│  Logika domain:  lib/math (tokenizer, parser, stepper, diagnosa)       │
│                  lib/adaptif, lib/sinkron                              │
│  Konten JSON (materi, soal, stimulus literasi) — dibundel, offline     │
│  IndexedDB (Dexie): progres, percobaan, tes, beban, literasi, antrian  │
│  Platform: Browser (PWA + Service Worker) | Android (Capacitor)        │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │ HTTPS · JSON · saat online
                               ▼
┌───────────────────────── SERVER (Python) ──────────────────────────────┐
│  FastAPI                                                               │
│  ├─ /api/auth      (login guru, JWT)                                   │
│  ├─ /api/kelas     (buat kelas, kode kelas, ringkasan)                 │
│  ├─ /api/siswa     (gabung kelas dengan kode kelas + kode siswa)       │
│  ├─ /api/sinkron   (terima data hasil belajar, idempoten)              │
│  ├─ /api/rubrik    (penilaian jawaban uraian literasi)                 │
│  └─ /api/ekspor    (CSV / Excel)                                       │
│  SQLAlchemy ──► SQLite (dev) / PostgreSQL (produksi)                   │
└──────────────────────────────┬─────────────────────────────────────────┘
                               │ ekspor CSV/XLSX
                               ▼
┌──────────────────── ANALISIS PENELITIAN (Python) ──────────────────────┐
│  pandas · SciPy · matplotlib · Jupyter                                 │
│  N-gain · normalitas · uji-t / Wilcoxon · KR-20/Cronbach α ·           │
│  Aiken's V · Cohen's kappa · efisiensi instruksional · skor SUS        │
└────────────────────────────────────────────────────────────────────────┘
```

Dasbor guru adalah bagian dari aplikasi React yang sama (rute `/guru`), hanya tersedia di versi web.

## 3. Struktur Folder (Monorepo)

```
bulat/
├─ CLAUDE.md
├─ PRD.md
├─ README.md
├─ docs/                          # dokumen perencanaan
│
├─ frontend/                      # JavaScript — aplikasi siswa + dasbor guru
│  ├─ public/
│  │  ├─ fonts/                   # font lokal (offline)
│  │  └─ icons/                   # ikon PWA
│  ├─ src/
│  │  ├─ main.jsx
│  │  ├─ App.jsx
│  │  ├─ routes.jsx
│  │  ├─ pages/
│  │  │  ├─ Onboarding.jsx
│  │  │  ├─ Beranda.jsx
│  │  │  ├─ Modul.jsx
│  │  │  ├─ Latihan.jsx
│  │  │  ├─ SoalCerita.jsx
│  │  │  ├─ Literasi.jsx          # M7 & Tantangan Literasi
│  │  │  ├─ Tes.jsx               # prasyarat / pretest / posttest / tes literasi
│  │  │  ├─ Progres.jsx
│  │  │  ├─ Pengaturan.jsx
│  │  │  └─ guru/                 # Login, DaftarKelas, RingkasanKelas, PenilaianUraian
│  │  ├─ components/
│  │  │  ├─ GarisBilangan/
│  │  │  ├─ TabelPola/
│  │  │  ├─ LangkahPengerjaan/
│  │  │  ├─ InputJawaban/         # papan angka dengan tombol −
│  │  │  ├─ PanelUmpanBalik/
│  │  │  ├─ KartuAturanTanda/
│  │  │  ├─ PenandaTeks/
│  │  │  ├─ SkalaBeban/
│  │  │  ├─ literasi/             # PanelStimulus, GlosariumKonteks, SoalPGKompleks,
│  │  │  │                        # SoalMenjodohkan, PilihAlasan, ProfilLiterasi
│  │  │  └─ ui/
│  │  ├─ lib/
│  │  │  ├─ math/
│  │  │  │  ├─ tokenizer.js
│  │  │  │  ├─ parser.js          # menghasilkan AST
│  │  │  │  ├─ stepper.js         # menghasilkan urutan langkah
│  │  │  │  ├─ diagnosa.js        # cocokkan jawaban salah ke miskonsepsi
│  │  │  │  └─ format.js          # tampilkan − dan × dengan benar
│  │  │  ├─ adaptif.js
│  │  │  ├─ sinkron.js            # antrian & pengiriman data ke backend
│  │  │  ├─ api.js                # klien HTTP ke FastAPI
│  │  │  └─ ekspor.js             # CSV lokal (cadangan bila tanpa server)
│  │  ├─ store/
│  │  ├─ db/index.js              # skema Dexie
│  │  ├─ schemas/                 # skema Zod untuk konten JSON
│  │  ├─ content/
│  │  │  ├─ modul/M0.json … M7.json
│  │  │  ├─ soal/latihan.json
│  │  │  ├─ soal/tes.json
│  │  │  ├─ literasi/stimulus-*.json
│  │  │  ├─ literasi/butir.json
│  │  │  └─ miskonsepsi.json
│  │  └─ styles/
│  ├─ scripts/validate-content.js # cek semua kunci jawaban vs mesin matematika
│  ├─ tests/
│  │  ├─ unit/                    # Vitest
│  │  └─ e2e/                     # Playwright
│  ├─ android/                    # dibuat oleh Capacitor
│  ├─ capacitor.config.json
│  ├─ vite.config.js
│  ├─ tailwind.config.js
│  ├─ jsconfig.json               # checkJs untuk JSDoc
│  └─ package.json
│
├─ backend/                       # Python — API FastAPI
│  ├─ app/
│  │  ├─ main.py                  # membuat aplikasi FastAPI, CORS, router
│  │  ├─ config.py                # pengaturan dari variabel lingkungan
│  │  ├─ database.py              # engine & sesi SQLAlchemy
│  │  ├─ models/                  # tabel SQLAlchemy
│  │  ├─ schemas/                 # model Pydantic (request/response)
│  │  ├─ routers/                 # auth.py, kelas.py, siswa.py, sinkron.py, rubrik.py, ekspor.py
│  │  ├─ services/                # logika bisnis (ringkasan kelas, ekspor, statistik)
│  │  └─ security.py              # JWT, hash kata sandi
│  ├─ alembic/                    # migrasi basis data
│  ├─ tests/                      # pytest
│  ├─ requirements.txt
│  ├─ .env.example
│  └─ pyproject.toml              # konfigurasi Ruff & pytest
│
└─ analisis/                      # Python — analisis data skripsi
   ├─ data/                       # hasil ekspor (JANGAN di-commit; ada di .gitignore)
   ├─ notebooks/                  # Jupyter: eksplorasi & grafik
   ├─ analisis/
   │  ├─ ngain.py                 # N-gain total & per indikator
   │  ├─ uji_statistik.py         # normalitas, uji-t berpasangan, Wilcoxon
   │  ├─ reliabilitas.py          # KR-20, Cronbach's alpha
   │  ├─ validasi_ahli.py         # rata-rata, persentase, Aiken's V
   │  ├─ kappa.py                 # kesepakatan dua penilai rubrik
   │  ├─ beban_kognitif.py        # skor Paas, efisiensi instruksional
   │  └─ sus.py                   # skor System Usability Scale
   ├─ tests/                      # pytest untuk fungsi statistik
   └─ requirements.txt
```

## 4. Mesin Matematika (`frontend/src/lib/math`, JavaScript)

Komponen paling penting; berjalan di perangkat agar umpan balik instan dan *offline*. Harus **deterministik dan teruji**.

1. **Tokenizer**: mengubah string `"15 − (−5) × 3 + 10"` menjadi token. Menerima `-`/`−`, `*`/`x`/`×`, `/`/`:`.
2. **Parser**: menghasilkan *Abstract Syntax Tree* dengan presedensi kurung > ×,: > +,−; asosiatif kiri; mendukung minus unary.
3. **Stepper**: menyederhanakan AST satu operasi per langkah sesuai urutan yang diajarkan:
   ```js
   /**
    * @typedef {Object} Langkah
    * @property {string} ekspresiSebelum   - "15 − (−5) × 3 + 10"
    * @property {[number, number]} bagianAktif - posisi karakter yang disorot
    * @property {'+'|'−'|'×'|':'} operasi
    * @property {number} hasilBagian       - −15
    * @property {string} ekspresiSesudah   - "15 − (−15) + 10"
    * @property {string} alasan            - "Kali dikerjakan sebelum kurang"
    */
   ```
4. **Diagnosa**: mensimulasikan strategi salah (dari kiri saja, tanda terbalik, kali-sebelum-bagi, dll.) untuk menebak miskonsepsi `MK-xx` dari jawaban siswa.

Aturan: hanya bilangan bulat; pembagian tak habis atau dengan 0 ditolak saat validasi konten. **Dilarang** memakai `eval()` atau `new Function()`.

## 5. Model Data Konten (JSON, di frontend)

```jsonc
// content/soal/latihan.json (satu butir)
{
  "id": "L2-02",
  "modul": "M5",
  "level": 2,
  "tipe": "ekspresi",               // "ekspresi" | "cerita" | "pilihan"
  "soal": "15 − (−5) × 3 + 10",
  "jawaban": 40,
  "contohMirip": "WE-M5-02",
  "petunjuk": [
    "Cari operasi kali atau bagi lebih dulu.",
    "Hitung (−5) × 3 dulu, lalu kerjakan dari kiri."
  ],
  "umpanBalikKhusus": [
    { "jawaban": 70, "miskonsepsi": "MK-06" },
    { "jawaban": 10, "miskonsepsi": "MK-03" }
  ]
}
```

```jsonc
// content/soal/latihan.json (soal cerita)
{
  "id": "L3-01",
  "modul": "M6",
  "level": 3,
  "tipe": "cerita",
  "kalimat": [
    "Sebuah es batu mula-mula memiliki suhu −6 °C setelah dikeluarkan dari kulkas.",
    "Ketika diletakkan di ruang terbuka, suhu es batu tersebut naik 2 °C setiap 3 menit.",
    "Berapakah suhu es batu itu setelah didiamkan selama 15 menit di ruang terbuka?"
  ],
  "diketahui": [
    { "label": "Suhu awal", "nilai": -6, "satuan": "°C" },
    { "label": "Kenaikan", "nilai": 2, "satuan": "°C setiap 3 menit" },
    { "label": "Waktu", "nilai": 15, "satuan": "menit" }
  ],
  "ditanya": "Suhu setelah 15 menit",
  "pilihanDitanya": ["Suhu setelah 15 menit", "Lama es mencair", "Kenaikan suhu tiap menit"],
  "model": "−6 + (15 : 3) × 2",
  "jawaban": 4,
  "satuan": "°C",
  "kesimpulan": "Suhu es batu setelah 15 menit adalah 4 °C.",
  "umpanBalikKhusus": [
    { "jawaban": 24, "miskonsepsi": "MK-08" },
    { "jawaban": -1, "miskonsepsi": "MK-08" },
    { "jawaban": 16, "miskonsepsi": "MK-09" }
  ]
}
```

### 5.1 Stimulus Literasi

```jsonc
// content/literasi/stimulus-A.json
{
  "id": "STM-A",
  "judul": "Suhu Empat Kota",
  "konteks": "saintifik",            // "personal" | "sosial-budaya" | "saintifik"
  "dataIlustratif": true,
  "kalimat": ["Tabel berikut menunjukkan suhu terendah dan tertinggi empat kota dalam satu hari."],
  "tabel": {
    "kolom": ["Kota", "Suhu terendah (°C)", "Suhu tertinggi (°C)"],
    "baris": [["Kota A", -12, -3], ["Kota B", 2, 9], ["Kota C", -1, 17], ["Kota D", -7, 3]]
  },
  "glosarium": [{ "istilah": "selisih suhu", "arti": "Suhu tertinggi dikurangi suhu terendah." }],
  "butir": ["LIT-A1", "LIT-A2", "LIT-A3"]
}
```

```jsonc
// content/literasi/butir.json (contoh 3 bentuk)
[
  {
    "id": "LIT-A1", "stimulus": "STM-A", "bentuk": "pg",
    "indikator": ["LM1", "LM2"], "levelAkm": "penerapan",
    "soal": "Kota manakah yang memiliki selisih suhu paling besar?",
    "opsi": ["Kota A", "Kota B", "Kota C", "Kota D"], "kunci": 2,
    "modelPembahasan": "17 − (−1)"
  },
  {
    "id": "LIT-A2", "stimulus": "STM-A", "bentuk": "pgKompleksBS",
    "indikator": ["LM3", "LM4"], "levelAkm": "penalaran",
    "pernyataan": [
      { "teks": "Suhu terendah Kota A lebih rendah daripada Kota D.", "kunci": true },
      { "teks": "Selisih suhu Kota A lebih besar daripada Kota D.", "kunci": false }
    ]
  },
  {
    "id": "LIT-A3", "stimulus": "STM-A", "bentuk": "pilihAlasan",
    "indikator": ["LM4"], "levelAkm": "penalaran",
    "klaim": "Kota A paling dingin karena 12 lebih besar dari 7.",
    "kunciKlaim": "kurangTepat",
    "opsiAlasan": ["−12 terletak di sebelah kiri −7 pada garis bilangan", "12 lebih besar dari 7"],
    "kunciAlasan": 0,
    "izinkanUraian": true
  }
]
```

Bentuk soal yang didukung: `pg`, `pgKompleksBS`, `pgKompleksMulti`, `menjodohkan`, `isian`, `pilihAlasan`, `uraian`. `scripts/validate-content.js` memastikan setiap kunci numerik sama dengan hasil evaluasi `soal`/`model`/`modelPembahasan`, dan setiap file lolos skema Zod.

## 6. Penyimpanan di Perangkat (Dexie / IndexedDB)

| Tabel | Kolom utama | Keterangan |
|-------|-------------|-----------|
| `profil` | `kodeSiswa`, `kelas`, `kodeKelas?`, `tokenPerangkat?`, `dibuatPada` | **Tanpa nama asli** |
| `hasilTes` | `id` (UUID), `jenis`, `skor`, `jawaban[]`, `durasiDetik`, `waktu` | jenis: prasyarat / pretest / posttest / literasiPre / literasiPost |
| `percobaan` | `id` (UUID), `soalId`, `jawaban`, `benar`, `miskonsepsi?`, `petunjukDibuka`, `yakin?`, `durasiDetik`, `waktu` | |
| `progres` | `modulId`, `status`, `bintang`, `diperbarui` | |
| `bebanKognitif` | `id` (UUID), `modulId`, `skor` (1–9), `waktu` | Skala Paas |
| `jawabanLiterasi` | `id` (UUID), `butirId`, `indikator[]`, `jawaban`, `benar?`, `teksUraian?`, `waktu` | |
| `kejadian` | `id` (UUID), `jenis`, `konteks`, `waktu` | buka_aturan_tanda, lihat_contoh_mirip, … |
| `antrianSinkron` | `id`, `tabel`, `recordId`, `status` (menunggu/terkirim/gagal), `percobaanKirim` | *Outbox* untuk sinkronisasi |
| `pengaturan` | `ukuranHuruf`, `suara`, `instrumenPenelitianAktif`, `sinkronAktif` | |

ID setiap rekaman dibuat di perangkat (UUID) agar pengiriman ulang tidak menggandakan data (idempoten).

## 7. Backend Python (FastAPI)

### 7.1 Tabel Basis Data Server

| Tabel | Kolom utama |
|-------|-------------|
| `guru` | `id`, `email`, `hash_sandi`, `nama_tampilan`, `peran` (guru/peneliti), `dibuat_pada` |
| `kelas` | `id`, `guru_id`, `nama` (mis. "7A"), `kode_kelas` (6 karakter acak), `aktif` |
| `siswa` | `id`, `kelas_id`, `kode_siswa` (mis. S01), `token_perangkat_hash`, `persetujuan_pada` |
| `hasil_tes` | `id` (UUID dari perangkat), `siswa_id`, `jenis`, `skor`, `jawaban` (JSON), `durasi_detik`, `waktu` |
| `percobaan` | `id`, `siswa_id`, `soal_id`, `jawaban`, `benar`, `miskonsepsi`, `petunjuk_dibuka`, `yakin`, `durasi_detik`, `waktu` |
| `progres` | `siswa_id`, `modul_id`, `status`, `bintang`, `diperbarui` |
| `beban_kognitif` | `id`, `siswa_id`, `modul_id`, `skor`, `waktu` |
| `jawaban_literasi` | `id`, `siswa_id`, `butir_id`, `indikator` (JSON), `jawaban`, `benar`, `teks_uraian`, `waktu` |
| `skor_rubrik` | `id`, `jawaban_literasi_id`, `penilai_id`, `skor` (0–3), `catatan`, `waktu` — **boleh 2 penilai** per jawaban (untuk kappa) |
| `kejadian` | `id`, `siswa_id`, `jenis`, `konteks` (JSON), `waktu` |

### 7.2 Endpoint API

| Metode | Endpoint | Pengguna | Fungsi |
|--------|----------|----------|--------|
| POST | `/api/auth/login` | Guru/peneliti | Login → JWT |
| POST | `/api/kelas` | Guru | Membuat kelas → `kode_kelas` |
| GET | `/api/kelas` | Guru | Daftar kelas milik guru |
| GET | `/api/kelas/{id}/ringkasan` | Guru | Progres per modul, rata-rata skor, miskonsepsi tersering, profil literasi LM1–LM4, rata-rata skor Paas |
| POST | `/api/siswa/gabung` | Siswa | `{kode_kelas, kode_siswa, persetujuan: true}` → `token_perangkat` |
| POST | `/api/sinkron` | Siswa | Kirim kumpulan data dari `antrianSinkron`; balas daftar ID yang diterima |
| GET | `/api/kelas/{id}/uraian` | Guru/peneliti | Daftar jawaban uraian yang belum dinilai |
| POST | `/api/rubrik` | Guru/peneliti | Simpan skor rubrik 0–3 untuk satu jawaban uraian |
| GET | `/api/kelas/{id}/ekspor?format=csv\|xlsx` | Guru/peneliti | Unduh data untuk analisis |
| GET | `/api/kesehatan` | — | Cek server hidup |

Dokumentasi interaktif tersedia otomatis di `/docs` (Swagger UI).

### 7.3 Alur Sinkronisasi

```
Siswa menyelesaikan soal
  → simpan ke IndexedDB + tambahkan ke antrianSinkron
  → jika online & sudah gabung kelas: kirim per batch (maks. 100 rekaman) ke /api/sinkron
      → server: validasi Pydantic, simpan dengan "INSERT ... ON CONFLICT DO NOTHING" (berdasarkan UUID)
      → balas ID yang diterima → status "terkirim"
  → jika gagal: coba lagi nanti (saat aplikasi dibuka / koneksi kembali), jeda bertambah
```

### 7.4 Keamanan

- HTTPS wajib di produksi; CORS hanya untuk domain frontend dan skema Capacitor.
- Kata sandi guru di-hash dengan bcrypt; JWT berumur pendek.
- Token perangkat siswa disimpan sebagai hash di server.
- Pembatasan laju (*rate limit*) pada `/api/siswa/gabung` dan `/api/auth/login`.
- Rahasia (`SECRET_KEY`, `DATABASE_URL`) hanya lewat variabel lingkungan (`.env`, tidak di-commit).

## 8. Analisis Penelitian (Python)

Data diekspor dari backend (`/api/kelas/{id}/ekspor?format=csv`) atau dari aplikasi (ekspor lokal), lalu diolah di folder `analisis/`:

| Skrip | Keluaran | Dokumen terkait |
|-------|----------|-----------------|
| `ngain.py` | N-gain per siswa, rata-rata, kategori; per indikator LM1–LM4 | 08 §3, §3.1 |
| `uji_statistik.py` | Shapiro–Wilk, uji-t berpasangan atau Wilcoxon, ukuran efek | 08 §3 |
| `reliabilitas.py` | KR-20 / Cronbach's alpha untuk instrumen tes | 08 §3 |
| `validasi_ahli.py` | Rata-rata, persentase, kategori, Aiken's V | 08 §1 |
| `kappa.py` | Cohen's kappa dua penilai rubrik uraian | 08 §3.1 |
| `beban_kognitif.py` | Statistik skor Paas per modul, efisiensi instruksional E = (Z_kinerja − Z_beban)/√2 | 08 §4 |
| `sus.py` | Skor SUS per responden dan rata-rata | 08 §2 |

Setiap fungsi statistik diuji dengan pytest memakai contoh data yang hasilnya sudah diketahui.

## 9. Menjalankan Proyek

### Frontend (JavaScript)
```bash
cd frontend
npm create vite@latest . -- --template react   # template JavaScript
npm install
npm run dev            # http://localhost:5173
npm run test           # Vitest
npm run validate:content
npm run build          # hasil di dist/
```

### Android (Capacitor)
```bash
cd frontend
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "BULAT" "id.ac.<kampus>.bulat" --web-dir=dist
npx cap add android
npm run build && npx cap sync android
npx cap open android   # Android Studio → Build APK
```

### Backend (Python)
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Windows (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
copy .env.example .env          # lalu isi SECRET_KEY
alembic upgrade head
uvicorn app.main:app --reload   # http://localhost:8000/docs
pytest
```

### Analisis (Python)
```bash
cd analisis
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
jupyter lab
```

Prasyarat: **Node.js LTS**, **Python 3.11+**, **Android Studio** (untuk APK), **Git**.

## 10. Kualitas & Pengujian

- **Unit test wajib** untuk `frontend/src/lib/math`: setiap butir bank soal diuji (jawaban akhir & urutan langkah).
- **Validasi konten otomatis** (`validate:content`) sebelum build.
- **Backend**: pytest untuk setiap endpoint (memakai SQLite di memori), termasuk uji sinkronisasi ganda (idempoten) dan hak akses guru antar-kelas.
- **Analisis**: pytest untuk fungsi statistik dengan data contoh.
- **E2E** (Playwright): onboarding → modul → latihan → literasi → sinkron → ekspor.
- **Uji perangkat**: minimal 1 HP Android RAM 2–3 GB, uji mode pesawat (offline), lalu online kembali.
- **Lighthouse**: Performance, Accessibility, PWA ≥ 90.

## 11. Privasi & Etika

- Pengguna adalah anak di bawah umur: tidak mengumpulkan nama asli, foto, kontak, atau lokasi. Identitas siswa hanya **kode siswa** dalam kelas.
- Data baru dikirim ke server **setelah** siswa bergabung ke kelas dan menyetujui pernyataan persetujuan; tanpa itu, data hanya di perangkat.
- Tidak ada analitik pihak ketiga dan tidak ada iklan.
- Server hanya menyimpan data yang diperlukan penelitian; data dihapus setelah penelitian selesai sesuai kesepakatan dengan sekolah.
- File data hasil ekspor (`analisis/data/`) tidak boleh di-commit ke repositori publik.
- Lembar persetujuan orang tua/sekolah disiapkan di luar aplikasi.
