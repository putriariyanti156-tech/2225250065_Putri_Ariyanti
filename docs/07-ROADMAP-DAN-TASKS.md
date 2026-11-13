# 07 — Roadmap & Daftar Tugas

Disusun mengikuti model pengembangan **ADDIE** (Analysis, Design, Development, Implementation, Evaluation). Jika memakai model **4D** (Define, Design, Develop, Disseminate), tahap Analysis = Define, dan Implementation/Evaluation = bagian dari Develop (uji coba) + Disseminate.

> Durasi bersifat perkiraan; sesuaikan dengan jadwal skripsi.

## Ringkasan Fase

| Fase | Fokus | Perkiraan | Keluaran |
|------|-------|-----------|----------|
| 0. Analisis | Wawancara siswa & guru, analisis kurikulum | Minggu 1–3 | [01-ANALISIS-KEBUTUHAN.md](01-ANALISIS-KEBUTUHAN.md) final |
| 1. Desain | PRD, desain instruksional, konten, wireframe, instrumen | Minggu 3–5 | Dokumen 02–05, instrumen validasi |
| 2a. Pengembangan MVP (JavaScript) | Fitur P0 di frontend | Minggu 6–12 | Aplikasi web + APK versi alfa |
| 2b. Backend & Dasbor (Python) | Sinkronisasi, dasbor guru, rubrik | Minggu 12–14 | API + dasbor guru |
| 3. Validasi Ahli & Revisi | Ahli materi & media | Minggu 14–15 | Versi beta |
| 4. Uji Coba | Perorangan → kelompok kecil → lapangan | Minggu 16–19 | Data kepraktisan & efektivitas |
| 5. Evaluasi & Laporan | Analisis data (skrip Python), revisi akhir | Minggu 20–22 | Versi final + laporan |

## Fase 0 — Analisis

- [x] Wawancara siswa S01
- [ ] Rapikan laporan wawancara (lihat catatan di dokumen 01 bagian 5)
- [ ] Wawancara 2–5 siswa tambahan (kemampuan tinggi/sedang/rendah)
- [ ] Wawancara guru matematika
- [ ] Analisis CP/TP Kurikulum Merdeka Fase D & buku/LKS yang dipakai sekolah
- [ ] Survei perangkat siswa (jenis HP, versi Android, akses internet)

## Fase 1 — Desain

- [x] Draf PRD
- [x] Draf desain instruksional CLT
- [x] Draf konten & bank soal
- [x] Draf UI/UX & wireframe
- [ ] Konsultasi dosen pembimbing → revisi dokumen
- [ ] Prototipe klik di Figma (opsional, untuk uji cepat dengan 1–2 siswa)
- [ ] Susun instrumen: lembar validasi ahli materi, ahli media, angket respons siswa, pretest/posttest, skala Paas
- [x] Draf kerangka literasi matematika & contoh stimulus (dokumen 09)
- [ ] Susun kisi-kisi & tes literasi matematika (2 stimulus paralel) + rubrik uraian
- [ ] Lengkapi stimulus Tantangan Literasi untuk M0–M6

## Fase 2 — Pengembangan MVP (P0)

### Sprint 1 — Fondasi (Minggu 6)
- [ ] Buat struktur monorepo `frontend/`, `backend/`, `analisis/` + `.gitignore`
- [ ] Inisialisasi `frontend/` dengan Vite + React (**JavaScript**) + Tailwind
- [ ] Pasang ESLint, Prettier, Vitest, Zod; `jsconfig.json` dengan `checkJs`
- [ ] Token warna & tipografi (dokumen 05)
- [ ] Routing & tata letak dasar (header, tombol Lanjut/Kembali)
- [ ] Konfigurasi PWA (manifest, service worker, ikon)
- [ ] Skema Dexie + store Zustand

### Sprint 2 — Mesin Matematika (Minggu 7)
- [ ] Tokenizer + parser (presedensi, minus unary, kurung)
- [ ] Stepper langkah demi langkah
- [ ] Diagnosa miskonsepsi MK-01 s.d. MK-10
- [ ] Unit test untuk seluruh bank soal
- [ ] Skrip validasi konten JSON

### Sprint 3 — Komponen Visual (Minggu 8)
- [ ] `GarisBilangan` (penjumlahan, pengurangan, perkalian sebagai lompatan)
- [ ] `TabelPola`
- [ ] `KartuAturanTanda` (tombol mengambang)
- [ ] `InputJawaban` (papan angka dengan −)
- [ ] `PanelUmpanBalik` & `TombolPetunjuk`

### Sprint 4 — Alur Belajar (Minggu 9)
- [ ] Halaman Modul: kartu ringkasan → contoh lengkap → contoh berlubang → latihan
- [ ] `LangkahPengerjaan` untuk operasi campuran (pilih bagian → hitung)
- [ ] Aturan adaptif sederhana (dokumen 03 bagian 3)
- [ ] Isi konten M0–M5 dalam JSON

### Sprint 5 — Soal Cerita & Tes (Minggu 10)
- [ ] `PenandaTeks` + `FormSoalCerita` 5 tahap
- [ ] Konten M6
- [ ] Tes prasyarat, pretest, posttest
- [ ] Beranda dengan peta modul & progres

### Sprint 5b — Literasi Matematika (Minggu 10–11)
- [ ] Skema JSON stimulus & butir literasi + validasi (dokumen 06 bagian 5.1)
- [ ] Komponen `PanelStimulus`, `GlosariumKonteks`, `KartuStrategiStimulus`
- [ ] Bentuk soal: PG, PG kompleks (B/S & pilih semua), menjodohkan, isian, pilih alasan, uraian
- [ ] Tantangan Literasi di akhir M0–M6 (F16)
- [ ] Modul M7 dengan stimulus A–D (F17) + Benar atau Salah? Jelaskan! (F18)
- [ ] Tes literasi (pretest & posttest) + penyimpanan jawaban uraian untuk diekspor

### Sprint 6 — Android & Penyempurnaan (Minggu 11–12)
- [ ] Capacitor: build APK, uji di HP nyata
- [ ] Pengaturan (ukuran huruf, kode siswa)
- [ ] Audit aksesibilitas & Lighthouse
- [ ] Uji E2E alur utama
- [ ] Rilis alfa (web + APK)

### Sprint 7 — Backend Python (Minggu 12–13)
- [ ] Inisialisasi `backend/`: FastAPI, SQLAlchemy, Alembic, Ruff, pytest, `.env.example`
- [ ] Model & migrasi tabel (dokumen 06 §7.1)
- [ ] Auth guru (login, JWT, bcrypt) + rate limit
- [ ] Endpoint kelas, gabung siswa, sinkron (idempoten)
- [ ] Endpoint ringkasan kelas, uraian, rubrik, ekspor CSV/XLSX
- [ ] pytest: hak akses antar-kelas, sinkron ganda, validasi data
- [ ] Deploy ke hosting gratis (mis. Render) + PostgreSQL (mis. Neon), HTTPS & CORS

### Sprint 8 — Sinkronisasi & Dasbor Guru (Minggu 13–14)
- [ ] Frontend: tabel `antrianSinkron`, `lib/sinkron.js`, `lib/api.js`
- [ ] Layar gabung kelas + pernyataan persetujuan
- [ ] Uji offline → online (mode pesawat)
- [ ] Halaman `/guru`: login, daftar kelas, ringkasan kelas, penilaian uraian, unduh ekspor

### Sprint 9 — Skrip Analisis Python (paralel dengan uji coba)
- [ ] Inisialisasi `analisis/` + `requirements.txt`
- [ ] `validasi_ahli.py` (rata-rata, persentase, Aiken's V) untuk Fase 3
- [ ] `sus.py`, `reliabilitas.py` untuk uji kelompok kecil
- [ ] `ngain.py`, `uji_statistik.py`, `kappa.py`, `beban_kognitif.py` untuk uji lapangan
- [ ] pytest dengan data contoh; notebook grafik untuk bab hasil skripsi

> Jika waktu terbatas, Sprint 7–8 dapat diganti dengan ekspor CSV lokal (F13) agar data penelitian tetap terkumpul; skrip analisis (Sprint 9) tetap bisa dipakai karena format CSV-nya sama.

## Fitur P1 (bila waktu cukup, paralel dengan Fase 3 validasi)

- [ ] F10 "Jelaskan kembali"
- [ ] F11 Tokoh pemandu sebaya
- [ ] F12 Halaman progres & laporan
- [ ] F13 Skala Paas, angket di dalam aplikasi, ekspor CSV
- [ ] F19 Cek Kewajaran
- [ ] F20 Satu Model, Banyak Cerita
- [ ] F22 Profil Literasi (LM1–LM4)
- [ ] F21 Buat Soalmu Sendiri (P2)

## Fase 4 & 5 — Lihat [08-RENCANA-EVALUASI.md](08-RENCANA-EVALUASI.md)

## Definition of Done (setiap fitur)

- Memenuhi kriteria penerimaan di PRD
- Berjalan di Chrome desktop dan HP Android
- Lulus uji kontras & area sentuh
- Unit test (Vitest untuk JavaScript, pytest untuk Python) lulus
- Fitur siswa tetap berjalan tanpa internet
- Konten sudah dicek kebenarannya
- Tidak menambah elemen visual yang tidak terkait materi
