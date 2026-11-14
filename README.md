# BULAT — Belajar Operasi Bilangan Bulat

Aplikasi pembelajaran **Operasi Bilangan Bulat** untuk siswa SMP, berbasis **Teori Beban Kognitif (CLT)**, yang juga **menumbuhkembangkan literasi matematika**. Bisa dibuka di **browser** dan **dipasang di HP/komputer tanpa Play Store atau App Store** (Progressive Web App), serta tetap berjalan **tanpa internet**.

- **JavaScript** (React + Vite): aplikasi siswa & dasbor guru → [frontend/](frontend/)
- **Python** (FastAPI): server API + penyaji web app → [backend/](backend/)
- **Python**: skrip statistik penelitian → [analisis/](analisis/)

Dasar perancangan: wawancara siswa S01 (8 November 2026), lihat [docs/](docs/).

---

## Fitur yang sudah jadi

| Untuk siswa | Untuk guru / peneliti |
|---|---|
| Tes prasyarat, tes awal & akhir, tes literasi awal & akhir | Login, buat kelas, kode kelas 6 huruf |
| 8 modul (M0–M7): ringkasan per kartu → contoh lengkap → contoh berlubang → latihan → jelaskan kembali → tantangan literasi → refleksi | Ringkasan kelas: skor tes, N-gain, modul selesai |
| Garis bilangan interaktif (dijalankan langkah demi langkah) & tabel pola | Miskonsepsi tersering (MK-01 s.d. MK-10) |
| Operasi campuran langkah demi langkah: pilih operasi → hitung → sorotan | Profil literasi kelas LM1–LM4, rata-rata skala Paas |
| Umpan balik diagnostik miskonsepsi, petunjuk berjenjang, contoh mirip | Penilaian jawaban uraian dengan rubrik 0–3 (mendukung 2 penilai) |
| Soal cerita 5 tahap (Diketahui–Ditanya–Model–Hitung–Kesimpulan) | Ekspor CSV / Excel untuk analisis |
| Literasi: stimulus, glosarium, 7 bentuk soal AKM | |
| Kartu Aturan Tanda (±) & Strategi Stimulus (?) selalu tersedia | |
| Skala usaha mental Paas, progres & profil literasi, Lab garis bilangan | |
| Offline, sinkron otomatis saat online, ekspor CSV dari HP | |

---

## Menjalankan di komputer (Windows)

Prasyarat: **Node.js LTS** dan **Python 3.11+**.

```bash
# 1) Build aplikasi web (sekali, ulangi bila kode frontend berubah)
cd frontend
npm install
npm run build

# 2) Siapkan server Python
cd ../backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env        # lalu isi SECRET_KEY (lihat petunjuk di dalam file)

# 3) Buat akun guru (kata sandi akan ditanyakan)
python -m app.cli buat-guru --email guru@sekolah.sch.id --nama "Nama Guru"

# 4) Jalankan server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Lalu buka:
- di komputer yang sama: **http://localhost:8000**
- dari HP di **Wi-Fi yang sama**: **http://ALAMAT-IP-KOMPUTER:8000** (lihat alamat IP dengan `ipconfig`). Jika tidak bisa dibuka, izinkan Python di Windows Firewall.
- dokumentasi API: http://localhost:8000/docs

> Pengembangan frontend dengan *hot reload*: jalankan server Python, lalu `cd frontend && npm run dev` dan buka http://localhost:5173.

### Memasang aplikasi di HP (tanpa Play Store)

Pemasangan PWA **membutuhkan HTTPS** (kecuali di `localhost`). Jadi pakai link hosting HTTPS (bagian berikut).
- **Android (Chrome/Edge):** buka link → tombol **📲 Pasang** di aplikasi, atau menu ⋮ → *Instal aplikasi*.
- **iPhone/iPad (Safari):** buka link → tombol **Bagikan** → *Tambahkan ke Layar Utama*.
- **Laptop (Chrome/Edge):** ikon pasang di bilah alamat.

Setelah dibuka sekali, aplikasi tetap bisa dipakai tanpa internet.

---

## Mendapatkan link web permanen (HTTPS)

### Opsi 0 — GitHub Pages (gratis, otomatis dari repositori ini)
1. Workflow menerbitkan hasil build ke branch `gh-pages`. Jika situs belum aktif, buka **Settings → Pages** lalu pilih *Deploy from a branch* → `gh-pages` / `(root)`.
2. Setiap push ke `main` menjalankan [.github/workflows/pages.yml](.github/workflows/pages.yml): uji, build, lalu terbit otomatis.
3. Link: `https://<akun>.github.io/<nama-repo>/`. Aplikasi siswa lengkap, bisa dipasang dan dipakai offline. Gabung kelas dan dasbor guru butuh backend (Opsi A).

> GitHub Pages gratis hanya untuk repositori **publik**.

### Platform yang didukung (satu aplikasi untuk semua)

| Platform | Cara memasang dari link HTTPS |
|---|---|
| Android (Chrome, Edge, Samsung Internet) | Tombol **📲 Pasang** di aplikasi, atau menu ⋮ → *Instal aplikasi* |
| iPhone / iPad (iOS/iPadOS 16.4+) | Buka di **Safari** → **Bagikan** → *Tambahkan ke Layar Utama* |
| Windows 10/11 | Edge/Chrome → ikon pasang di bilah alamat (muncul di menu Start) |
| macOS | Chrome/Edge → ikon pasang; Safari 17+ → *File → Add to Dock* |
| Linux, ChromeOS | Chrome/Edge → ikon pasang |

Ingin masuk **Play Store / Microsoft Store / App Store** juga? Masukkan link HTTPS aplikasi ke **pwabuilder.com** untuk menghasilkan paket toko dari PWA yang sama. Langkah ini butuh akun pengembang masing-masing toko (Google Play USD 25 sekali bayar; Apple USD 99/tahun dan perlu Mac).

### Opsi A — Lengkap (aplikasi + dasbor guru): Render + Neon (gratis)
1. Unggah folder proyek ini ke repositori GitHub (boleh **private**). File `.gitignore` sudah mencegah `.env`, basis data, dan `node_modules` ikut terunggah.
2. Buat basis data PostgreSQL gratis di **neon.tech** → salin *connection string*.
3. Di **render.com** → *New* → *Blueprint* → pilih repositori. Render membaca [render.yaml](render.yaml) dan [Dockerfile](Dockerfile).
4. Isi `DATABASE_URL` dengan connection string Neon. `SECRET_KEY` dibuat otomatis.
5. Buat akun guru: di Render → *Shell* → `python -m app.cli buat-guru --email ... --nama ...`
   (atau isi `KODE_DAFTAR_GURU` lalu daftar lewat `POST /api/auth/daftar` di halaman `/docs`).
6. Link Anda: `https://bulat-xxxx.onrender.com`.

> Paket gratis Render "tidur" setelah 15 menit tanpa akses; pembukaan pertama bisa lambat ±1 menit. Siswa tidak terganggu karena aplikasi berjalan offline dan sinkron belakangan.

### Opsi B — Paling cepat (hanya aplikasi siswa): Netlify
1. Jalankan `npm run build` di folder `frontend`.
2. Buka **app.netlify.com/drop** → seret folder **`frontend/dist`** ke halaman.
3. Link langsung jadi, misalnya `https://bulat-xxxx.netlify.app`: bisa dibuka, dipasang, dan dipakai offline.
4. Gabung kelas/dasbor guru baru aktif jika backend di-hosting (Opsi A). Isi alamatnya di *Pengaturan → Alamat server*, dan tambahkan domain Netlify ke `CORS_ORIGINS` di backend.

---

### Link pratinjau (claude.ai)

Versi pratinjau tanpa server sudah diterbitkan di **https://claude.ai/artifact/R82kk6mJmZ9jhVCV8hCgKV** (bersifat privat; bagikan lewat menu *Share* di halaman itu). Di sana service worker tidak diizinkan, jadi versi ini **tidak bisa dipasang dan tidak bisa offline**, serta tidak memuat gabung kelas/dasbor guru. Kemajuan belajar tersimpan di browser masing-masing pengguna. Membuat ulang build-nya:

```bash
cd frontend
VITE_DEMO=1 npx vite build --outDir dist-demo --emptyOutDir   # PowerShell: $env:VITE_DEMO="1"; npx vite build --outDir dist-demo --emptyOutDir
```

## Pengujian

```bash
cd frontend
npm test                      # 81 uji: mesin matematika + validasi semua kunci jawaban konten
npm run validate:content      # hanya validasi konten
node tests/e2e/smoke.mjs      # uji klik otomatis di Chrome (server harus berjalan; lihat komentar di file)

cd ../backend
.venv\Scripts\activate
pip install -r requirements-dev.txt
pytest                        # 10 uji API: alur lengkap, keamanan antar-guru, sinkron ganda, dll.

cd ../analisis
pytest                        # uji fungsi statistik
```

## Analisis data penelitian

Ekspor **Ringkasan (CSV)** dari dasbor guru ke `analisis/data/`, lalu:

```bash
cd analisis
pip install -r requirements.txt
python -m analisis.olah_ekspor data/bulat-KODE-ringkasan.csv
```

Fungsi lain di [analisis/analisis/statistik.py](analisis/analisis/statistik.py): N-gain, Aiken's V, Cronbach α / KR-20, Cohen's kappa, SUS, efisiensi instruksional, uji-t / Wilcoxon.

## Catatan Windows

Laptop dengan **Smart App Control / Application Control** dapat memblokir modul Python terkompilasi tertentu. Karena itu proyek ini memakai SQLAlchemy 2.0 dan `uvicorn` tanpa `httptools`, yang tetap berjalan dalam kondisi tersebut.

## Peta dokumen perencanaan

| File | Isi |
|------|-----|
| [PRD.md](PRD.md) | Kebutuhan produk, fitur, kriteria penerimaan |
| [CLAUDE.md](CLAUDE.md) | Panduan untuk Claude Code |
| [docs/01-ANALISIS-KEBUTUHAN.md](docs/01-ANALISIS-KEBUTUHAN.md) | Hasil wawancara → kebutuhan |
| [docs/03-DESAIN-INSTRUKSIONAL.md](docs/03-DESAIN-INSTRUKSIONAL.md) | Prinsip CLT → fitur |
| [docs/04-KONTEN-DAN-BANK-SOAL.md](docs/04-KONTEN-DAN-BANK-SOAL.md) | Materi, bank soal, miskonsepsi |
| [docs/05-UI-UX-DESIGN.md](docs/05-UI-UX-DESIGN.md) | Tampilan & aksesibilitas |
| [docs/06-ARSITEKTUR-TEKNIS.md](docs/06-ARSITEKTUR-TEKNIS.md) | Arsitektur JavaScript + Python |
| [docs/07-ROADMAP-DAN-TASKS.md](docs/07-ROADMAP-DAN-TASKS.md) | Tahapan & tugas |
| [docs/08-RENCANA-EVALUASI.md](docs/08-RENCANA-EVALUASI.md) | Validasi, kepraktisan, efektivitas |
| [docs/09-LITERASI-MATEMATIKA.md](docs/09-LITERASI-MATEMATIKA.md) | Kerangka literasi matematika |

> Semua soal, kunci, dan data stimulus (bertanda "data ilustrasi") tetap perlu divalidasi ahli materi sebelum uji coba.
