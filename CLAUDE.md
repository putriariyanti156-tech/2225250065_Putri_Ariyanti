# CLAUDE.md

Panduan untuk Claude Code saat bekerja di repositori ini.

## Tentang Proyek

**BULAT** (nama kerja) adalah aplikasi pembelajaran **Operasi Bilangan Bulat** untuk siswa SMP, berbasis **Cognitive Load Theory (CLT)**, dan bertujuan **menumbuhkembangkan literasi matematika** (kerangka PISA 2022 & AKM Numerasi). Berjalan di web (PWA) dan Android (Capacitor), dengan backend Python untuk sinkronisasi data dan dasbor guru. Ini adalah produk penelitian pengembangan (skripsi S1 Pendidikan Matematika), jadi **kebenaran matematika dan kesesuaian dengan desain instruksional lebih penting daripada fitur tambahan**.

Baca sebelum mengerjakan fitur:
- [PRD.md](PRD.md): fitur, prioritas (P0/P1/P2), kriteria penerimaan
- [docs/03-DESAIN-INSTRUKSIONAL.md](docs/03-DESAIN-INSTRUKSIONAL.md): prinsip CLT yang wajib dipatuhi
- [docs/04-KONTEN-DAN-BANK-SOAL.md](docs/04-KONTEN-DAN-BANK-SOAL.md): materi, soal, katalog miskonsepsi
- [docs/05-UI-UX-DESIGN.md](docs/05-UI-UX-DESIGN.md): warna, tipografi, komponen
- [docs/06-ARSITEKTUR-TEKNIS.md](docs/06-ARSITEKTUR-TEKNIS.md): stack, struktur folder, model data, API
- [docs/07-ROADMAP-DAN-TASKS.md](docs/07-ROADMAP-DAN-TASKS.md): urutan sprint & tugas
- [docs/09-LITERASI-MATEMATIKA.md](docs/09-LITERASI-MATEMATIKA.md): kerangka & bank stimulus literasi matematika

## Tech Stack

| Folder | Bahasa | Teknologi |
|--------|--------|-----------|
| `frontend/` | **JavaScript** (ES2022, JSX), **bukan TypeScript** | React 18, Vite, CSS biasa dengan token warna di `src/styles.css`, React Router (HashRouter), Dexie (IndexedDB), vite-plugin-pwa, Vitest, puppeteer-core (uji klik di Chrome lokal) |
| `backend/` | **Python 3.11+** | FastAPI, Uvicorn (tanpa httptools), Pydantic v2, SQLAlchemy **2.0** (bukan 2.1, karena ekstensi C diblokir Smart App Control Windows), SQLite (dev) / PostgreSQL via psycopg (produksi), PyJWT, bcrypt, openpyxl, pytest + HTTPX, Ruff |
| `analisis/` | **Python 3.11+** | Fungsi statistik murni Python; SciPy untuk uji beda; pandas/matplotlib opsional |

Status implementasi (13 Nov 2026): seluruh fitur P0, sebagian besar P1 (F10 jelaskan kembali, F11 pemandu "Bima", F12 progres, F13 instrumen, F15 sinkron & dasbor guru, F19 cek kewajaran pada soal cerita, F20 satu model banyak cerita, F22 profil literasi). Belum: F14 mode proyeksi kelas, F21 buat soal sendiri (baru sebagai butir uraian LIT-E3), APK Capacitor (tidak diperlukan karena PWA bisa dipasang langsung). Tabel DB dibuat otomatis (`create_all`); tambahkan Alembic sebelum skema diubah di produksi.

## Perintah

```bash
# Frontend (JavaScript)
cd frontend
npm run dev                # server pengembangan (http://localhost:5173)
npm run build              # build produksi ke dist/
npm run test               # Vitest (mesin matematika + validasi konten)
npm run validate:content   # cek semua kunci jawaban di src/content cocok dengan mesin matematika
node tests/e2e/smoke.mjs   # uji klik di Chrome; butuh server berjalan + akun guru uji (lihat komentar file)
python scripts/buat_ikon.py  # membuat ulang ikon PWA

# Backend (Python) — aktifkan venv dulu: .venv\Scripts\activate
cd backend
python -m uvicorn app.main:app --reload   # http://localhost:8000 (web) & /docs (API)
python -m app.cli buat-guru --email ... --nama ...
pytest
ruff check . && ruff format .

# Analisis (Python)
cd analisis
pytest
jupyter lab
```

> Perintah di atas adalah target; buat skrip `package.json`, `requirements.txt`, dan `pyproject.toml` yang sesuai saat inisialisasi proyek.

## Pembagian Tanggung Jawab (penting)

- **Semua logika belajar berjalan di frontend (JavaScript)**: mesin matematika, umpan balik, adaptif, penilaian soal objektif. Aplikasi harus tetap berfungsi penuh **tanpa internet dan tanpa backend**.
- **Backend Python hanya untuk**: login guru, kelas & kode kelas, menerima sinkronisasi data, dasbor ringkasan, penilaian rubrik uraian, ekspor CSV/XLSX.
- **Jangan menduplikasi mesin matematika di Python.** Sumber kebenaran perhitungan ada di `frontend/src/lib/math/`.
- **Analisis statistik penelitian** ditulis di `analisis/` (Python), bukan di backend maupun frontend.

## Aturan Wajib

### Kebenaran matematika
- Semua logika hitung ada di `frontend/src/lib/math/`. **Jangan** menghitung jawaban dengan `eval()` atau `new Function()`.
- Presedensi: kurung → × dan : (setara, kiri ke kanan) → + dan − (setara, kiri ke kanan). Jangan menerapkan "kali sebelum bagi" atau "tambah sebelum kurang" secara kaku.
- Hanya bilangan bulat. Konten yang menghasilkan pecahan atau pembagian dengan nol harus ditolak oleh validator.
- Setiap perubahan pada `lib/math/` atau `src/content/` **harus** lulus unit test dan `validate:content`.
- Jangan mengubah jawaban, soal, atau teks materi di `src/content/` tanpa diminta, karena konten divalidasi ahli materi.

### Prinsip Cognitive Load (jangan dilanggar)
- **Satu ide per kartu**, teks kartu ±40 kata maksimum, tanpa scroll di layar 360×640.
- **Tidak ada auto-play/auto-advance.** Semua langkah maju lewat tombol siswa.
- **Tidak ada elemen dekoratif** (animasi, ilustrasi, suara) yang tidak menjelaskan materi.
- Penjelasan diletakkan **dekat** dengan ekspresi/visual yang dijelaskan (hindari *split attention*).
- Kunci jawaban tidak ditampilkan sebelum siswa mencoba minimal sekali; petunjuk berjenjang dulu.
- Gamifikasi minimal: progres & bintang saja, tanpa papan peringkat.

### Literasi matematika
- Setiap butir literasi wajib memiliki `indikator` (LM1–LM4), `konteks` (personal / sosial-budaya / saintifik), dan `levelAkm`.
- Soal literasi muncul **setelah** latihan prosedural dalam modul yang sama.
- Stimulus tetap dapat dilihat saat siswa menjawab (panel yang bisa diciutkan), bukan di halaman terpisah.
- Stimulus pendek: teks per kalimat, tabel maks. ±5 baris data. Data rekaan ditandai `dataIlustratif: true`.
- Jawaban numerik pada soal konteks diikuti tafsir makna (mis. "−3 m berarti 3 m di bawah permukaan laut").
- Jawaban uraian **tidak dinilai otomatis**: simpan teksnya untuk dinilai guru/peneliti dengan rubrik di dasbor.

### Tampilan & aksesibilitas
- Gunakan token warna CSS (`var(--primary)` dst.) dari `frontend/src/styles.css` (lihat dokumen 05); jangan menulis warna hex langsung di komponen.
- Kontras teks ≥ 4,5:1; area sentuh ≥ 44×44 px; huruf dasar ≥ 16 px.
- Benar/salah selalu memakai ikon + teks, bukan warna saja.
- Positif = biru, negatif = oranye di garis bilangan; tanda +/− tetap selalu ditulis.
- Tampilkan minus sebagai `−` (U+2212) dan kali sebagai `×` (U+00D7) melalui `lib/math/format.js`; pembagian memakai `:`.
- Hormati `prefers-reduced-motion`.

### Bahasa
- Semua teks UI dalam **Bahasa Indonesia** yang ramah dan singkat (≤ 15 kata per kalimat), sapaan "kamu".
- Istilah konsisten: "bilangan negatif", "bilangan positif", "tanda kurung", "urutan operasi".
- Nama domain boleh Bahasa Indonesia (`garisBilangan`, `langkahPengerjaan`, `hasil_tes`); istilah teknis umum tetap Inggris (`store`, `props`, `router`, `session`).

### Privasi (pengguna anak di bawah umur)
- Jangan menambahkan analitik pihak ketiga, iklan, login sosial, atau izin kamera/lokasi/kontak.
- Jangan menyimpan nama asli siswa, baik di perangkat maupun server; identitas hanya kode siswa dalam kelas.
- Data dikirim ke server **hanya** setelah siswa bergabung ke kelas dan menyetujui pernyataan persetujuan.
- Rahasia (`SECRET_KEY`, `DATABASE_URL`) hanya lewat `.env`; jangan di-commit. `analisis/data/` masuk `.gitignore`.

### Kinerja
- Target HP Android RAM 2 GB. Hindari pustaka berat. Visual pakai SVG.
- Semua aset (font, ikon) dibundel lokal agar bekerja offline.

## Konvensi Kode

### JavaScript (frontend)
- File komponen `.jsx`, logika `.js`. **Jangan** menambahkan TypeScript.
- Komponen fungsional + hooks; komponen di `src/components/`, halaman di `src/pages/`.
- Dokumentasikan bentuk data domain dengan **JSDoc** (`@typedef`, `@param`, `@returns`); aktifkan `checkJs` di `jsconfig.json`.
- Konten JSON divalidasi oleh `tests/konten.test.js`; data dari API divalidasi oleh Pydantic di backend.
- ES modules (`import`/`export`), `const`/`let` (tanpa `var`), async/await.

### Python (backend & analisis)
- Ikuti PEP 8; format & lint dengan **Ruff**. Gunakan *type hints* di semua fungsi.
- Backend: router tipis, logika di `services/`; request/response selalu lewat model **Pydantic**; akses DB lewat SQLAlchemy (tanpa SQL mentah kecuali untuk ekspor yang sudah diuji).
- Setiap perubahan skema DB disertai migrasi Alembic.
- Endpoint sinkronisasi harus **idempoten** (berdasarkan UUID dari perangkat).
- Guru hanya boleh mengakses kelas miliknya; uji hal ini di pytest.
- Analisis: fungsi statistik murni (input DataFrame/list → output angka) dan diuji dengan data contoh yang hasilnya diketahui.

### Umum
- Komit kecil dan deskriptif; sebutkan ID fitur PRD (mis. `feat(F06): sorot bagian aktif pada operasi campuran`, `feat(F15): endpoint ringkasan kelas`).

## Saat Ragu

- Jika permintaan bertentangan dengan prinsip CLT, PRD, atau pembagian tanggung jawab frontend/backend di atas, jelaskan konfliknya dan tanyakan dulu.
- Jika menemukan jawaban/konten yang tampak salah secara matematika, laporkan dan jangan diperbaiki diam-diam.
- Prioritaskan fitur **P0** sebelum P1/P2.
