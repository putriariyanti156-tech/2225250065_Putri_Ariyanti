# PRD — Product Requirements Document

**Produk:** BULAT — Belajar Operasi Bilangan Bulat (nama kerja)
**Versi dokumen:** 1.2 · 13 November 2026 (v1.1: literasi matematika · v1.2: stack JavaScript + Python, dasbor guru masuk v1)
**Pemilik:** Putri Ariyanti (S1 Pendidikan Matematika)
**Status:** Draf untuk ditinjau dosen pembimbing

---

## 1. Latar Belakang

Wawancara dengan siswa kelas IX (S01) menunjukkan bahwa meskipun materi operasi bilangan bulat sudah dipelajari sejak SD kelas 6 dan SMP kelas 7, siswa masih:

- keliru menerapkan **aturan tanda**, terutama pada perkalian dan pembagian;
- tertukar **urutan operasi** pada soal campuran dan lupa mendahulukan tanda kurung;
- kesulitan **memodelkan soal cerita** (menentukan yang diketahui dan ditanyakan);
- terbebani **LKS yang terlalu tekstual** dan tidak pernah mendapat **visualisasi** dari guru;
- bergantung pada **teman** untuk mengecek jawaban.

Dalam kerangka *Cognitive Load Theory*, ini menunjukkan **beban intrinsik** yang belum dikelola (materi kompleks disajikan sekaligus), **beban ekstrinsik** yang tinggi (penyajian teks panjang, tempo tidak sesuai), dan kurangnya dukungan untuk **beban germane** (contoh bertahap, umpan balik, penjelasan diri). Rincian ada di [docs/01-ANALISIS-KEBUTUHAN.md](docs/01-ANALISIS-KEBUTUHAN.md).

Kesulitan memodelkan soal cerita (EL01, EL05) dan ketergantungan pada teman untuk menilai benar-tidaknya jawaban (GL02, GL04) juga menunjukkan **literasi matematika** yang belum berkembang: siswa belum terbiasa merumuskan situasi nyata menjadi model matematika, menafsirkan hasil ke dalam konteks, dan menilai kewajaran jawaban. Hal ini sejalan dengan rendahnya capaian numerasi siswa Indonesia pada PISA dan AKM. Karena itu, aplikasi dirancang tidak hanya untuk kelancaran prosedur, tetapi juga untuk **menumbuhkembangkan literasi matematika**. Kerangkanya dijelaskan di [docs/09-LITERASI-MATEMATIKA.md](docs/09-LITERASI-MATEMATIKA.md).

## 2. Tujuan Produk

| ID | Tujuan | Indikator keberhasilan |
|----|--------|------------------------|
| T1 | Menurunkan kesalahan aturan tanda dan urutan operasi | Rata-rata skor posttest > pretest secara signifikan; N-gain ≥ 0,3 (sedang) |
| T2 | Membantu siswa memodelkan soal cerita | ≥ 70% siswa mampu menuliskan Diketahui–Ditanya–Model dengan benar pada posttest |
| T3 | Menyajikan materi dengan beban kognitif yang terkelola | Skor beban mental (skala Paas 1–9) rata-rata ≤ 5 pada modul latihan |
| T4 | Produk valid dan praktis | Validasi ahli materi & media kategori "valid" (≥ 3,26 dari 4 atau ≥ 81%); respons siswa kategori "praktis" |
| T5 | Menumbuhkembangkan literasi matematika (merumuskan, menerapkan, menafsirkan, mengevaluasi/bernalar) | Skor tes literasi matematika meningkat signifikan (N-gain ≥ 0,3); peningkatan terlihat pada keempat indikator LM1–LM4 |

## 3. Bukan Tujuan (Out of Scope v1)

- Materi selain operasi bilangan bulat (pecahan, aljabar, dll.).
- Perpangkatan dan akar bilangan bulat (dapat ditambahkan pada v2).
- Fitur media sosial, chat bebas antarpengguna, atau iklan.
- Akun/login untuk siswa (siswa cukup memakai kode kelas + kode siswa).
- Aplikasi iOS.

## 4. Pengguna

### 4.1 Persona Utama — "Sinta", siswa SMP kelas VII–IX

- Usia 12–15 tahun, memakai HP Android kelas menengah ke bawah (RAM 2–4 GB, layar ~6"), kuota internet terbatas.
- Sudah mengenal bilangan bulat, tetapi ragu pada perkalian/pembagian bertanda negatif.
- Lebih mudah paham lewat gambar dan contoh mirip daripada teks panjang.
- Nyaman belajar dengan teman; sering mengecek jawaban ke teman.
- Mudah kehilangan fokus pada soal cerita panjang.

### 4.2 Persona Sekunder — Guru Matematika

- Ingin memakai aplikasi sebagai media di kelas (diproyeksikan) atau tugas rumah.
- Butuh melihat hasil latihan siswa secara sederhana lewat **dasbor guru** (web) dan menilai jawaban uraian literasi.

### 4.3 Persona Tersier — Peneliti

- Membutuhkan data pretest, posttest, tes literasi, dan skala beban kognitif yang dapat diekspor (CSV/XLSX) dan diolah dengan skrip analisis Python.

## 5. Ruang Lingkup Materi

Mengacu Kurikulum Merdeka Fase D (kelas VII) — elemen Bilangan:

1. Mengenal bilangan bulat & garis bilangan (apersepsi/prasyarat)
2. Penjumlahan bilangan bulat
3. Pengurangan bilangan bulat
4. Perkalian bilangan bulat
5. Pembagian bilangan bulat
6. Operasi hitung campuran (urutan operasi & tanda kurung)
7. Soal cerita kontekstual (suhu, ketinggian/kedalaman, utang-piutang, skor permainan)
8. **Literasi matematika: "Bilangan Bulat di Sekitar Kita"** — stimulus bergaya AKM (tabel, teks, situasi) dalam konteks personal, sosial budaya, dan saintifik

Detail di [docs/04-KONTEN-DAN-BANK-SOAL.md](docs/04-KONTEN-DAN-BANK-SOAL.md) dan [docs/09-LITERASI-MATEMATIKA.md](docs/09-LITERASI-MATEMATIKA.md).

## 6. Kebutuhan Fungsional

Prioritas: **P0** = wajib untuk MVP, **P1** = penting (target v1 penuh), **P2** = opsional/v2.
Kolom **Dasar** merujuk kode wawancara dan ID kebutuhan (`KB-xx`).

### F01 — Tes Prasyarat & Pretest (P0)
**Dasar:** IL03, K01 · KB-03
- Tes singkat 5–8 soal operasi dasar dan letak bilangan pada garis bilangan.
- Bila skor < 60%, siswa diarahkan ke modul "Penguatan Dasar" (tidak dikunci, hanya disarankan).
- Pretest materi inti (10 soal) disimpan untuk keperluan penelitian.

**Kriteria penerimaan:**
- [ ] Hasil tes tersimpan lokal dan tetap ada setelah aplikasi ditutup.
- [ ] Rekomendasi modul muncul sesuai skor.

### F02 — Modul Materi Terpecah (Ringkasan) (P0)
**Dasar:** EL02, DS01, IL04 · KB-04, KB-15
- Setiap subbab dibagi menjadi **kartu-kartu kecil** (1 ide per kartu, maks. ±40 kata + 1 visual).
- Struktur tetap setiap subbab: **Ringkasan → Contoh → Latihan**.
- Navigasi Lanjut/Kembali; tidak ada perpindahan otomatis.

**Kriteria penerimaan:**
- [ ] Tidak ada kartu materi yang membutuhkan *scroll* vertikal di layar 360×640.
- [ ] Setiap kartu memiliki satu visual atau contoh konkret.

### F03 — Garis Bilangan Interaktif (P0)
**Dasar:** EL02, EL03 · KB-07
- Menampilkan operasi + dan − sebagai gerakan panah (kanan = positif, kiri = negatif).
- Siswa dapat menggeser/menekan untuk menjalankan langkah satu per satu.
- Perkalian ditampilkan sebagai lompatan berulang (mis. 3 × (−2) = tiga lompatan −2).
- Mode "Coba sendiri": siswa memasukkan soal sendiri, garis bilangan memvisualisasikan.

**Kriteria penerimaan:**
- [ ] Rentang −20 s.d. 20 dapat ditampilkan jelas di layar HP; rentang menyesuaikan otomatis.
- [ ] Animasi berjalan per langkah sesuai tombol, bukan otomatis.

### F04 — Kartu & Tabel Aturan Tanda (P0)
**Dasar:** IL01, K03 · KB-01
- Tabel pola (mis. 3×(−2)=−6, 2×(−2)=−4, 1×(−2)=−2, 0×(−2)=0, (−1)×(−2)=2 …) untuk menemukan sendiri aturan "negatif × negatif = positif".
- Tombol **"Aturan Tanda"** selalu tersedia (ikon mengambang) saat latihan sebagai *job aid*; frekuensi pembukaan dicatat (indikator penurunan ketergantungan).

**Kriteria penerimaan:**
- [ ] Kartu dapat dibuka dari layar latihan mana pun dalam 1 ketukan.

### F05 — Contoh Soal Bertahap / Worked & Faded Examples (P0)
**Dasar:** GL03, GL05, K02 · KB-12, KB-14
- Tiap tipe soal punya 3 tingkatan:
  1. **Contoh lengkap**: semua langkah ditampilkan satu per satu dengan alasan singkat.
  2. **Contoh berlubang**: sebagian langkah dikosongkan, siswa mengisi.
  3. **Latihan mandiri**: siswa mengerjakan semua langkah.
- Setiap soal latihan memiliki tautan **"Lihat contoh mirip"**.

**Kriteria penerimaan:**
- [ ] Contoh lengkap menampilkan langkah satu per satu (siswa menekan "Langkah berikutnya").
- [ ] Contoh berlubang memvalidasi tiap isian dengan umpan balik.

### F06 — Penyelesai Operasi Campuran Langkah-demi-Langkah (P0)
**Dasar:** IL02, IL04 · KB-02, KB-04
- Ekspresi ditampilkan besar; bagian yang harus dikerjakan lebih dulu **disorot**.
- Siswa diminta **memilih** bagian mana yang dikerjakan dulu, lalu menghitungnya. Jika salah memilih, muncul pengingat urutan: *Kurung → Kali/Bagi (dari kiri) → Tambah/Kurang (dari kiri)*.
- Ekspresi menyusut baris demi baris sampai hasil akhir (seperti pengerjaan di buku).

**Kriteria penerimaan:**
- [ ] Mesin evaluasi menghasilkan urutan langkah yang benar untuk semua soal di bank soal (diuji otomatis).
- [ ] Pembagian dan perkalian setara dikerjakan dari kiri ke kanan.

### F07 — Kerangka Soal Cerita (P0)
**Dasar:** EL01, EL05, DS02 · KB-06, KB-09
- Soal cerita ditampilkan **per kalimat** (bukan satu paragraf panjang).
- Alat **penanda**: siswa menyorot informasi penting (angka + satuan).
- Formulir bertahap: **1. Diketahui → 2. Ditanya → 3. Model matematika → 4. Hitung → 5. Kesimpulan**; satu tahap per layar.
- Petunjuk berjenjang pada setiap tahap.

**Kriteria penerimaan:**
- [ ] Siswa tidak dapat melompat ke tahap "Hitung" sebelum "Model" diisi (pada mode terbimbing).
- [ ] Mode bebas tersedia setelah siswa menyelesaikan ≥ 3 soal cerita terbimbing.

### F08 — Latihan Bertingkat dengan Umpan Balik Diagnostik (P0)
**Dasar:** IL05, GL02, K03 · KB-05, KB-11
- Tiga level sesuai lembar soal pemicu: **Level 1** operasi satu tanda, **Level 2** operasi campuran, **Level 3** soal cerita.
- Jawaban salah memunculkan **umpan balik sesuai jenis kesalahan** (miskonsepsi), mis.:
  - jawaban 42 untuk −7 × 6 → "Periksa tandanya: negatif × positif hasilnya …"
  - jawaban −16 untuk 15 − (−5) × 3 + 10 bila siswa mengerjakan dari kiri → "Kali dikerjakan sebelum kurang."
- **Petunjuk berjenjang**: Petunjuk 1 (arah) → Petunjuk 2 (langkah) → Pembahasan lengkap.
- Penanda keyakinan opsional "Yakin / Ragu" setelah menjawab.

**Kriteria penerimaan:**
- [ ] Minimal 1 umpan balik spesifik per soal untuk tiap miskonsepsi umum (lihat dokumen 04).
- [ ] Kunci jawaban tidak muncul sebelum siswa mencoba minimal 1 kali.

### F09 — Kendali Tempo (P0)
**Dasar:** EL04 · KB-08
- Semua animasi/penjelasan bergerak hanya lewat tombol siswa (Lanjut, Ulangi, Kembali).
- Tidak ada batas waktu pada mode belajar. (Pengatur waktu hanya opsional pada mode kuis.)

### F10 — "Jelaskan Kembali" (Self-Explanation) (P1)
**Dasar:** GL04, GL01 · KB-13
- Setelah langkah kunci, siswa memilih alasan yang tepat dari 3 pilihan (mis. "Mengapa hasilnya positif?").
- Opsional: siswa merekam/mengetik penjelasan singkat untuk dibagikan ke teman.

### F11 — Tokoh Pemandu Sebaya (P1)
**Dasar:** GL01, GL04 · KB-10
- Satu karakter sederhana yang "menjelaskan seperti teman" dengan bahasa santai namun tetap baku-ringan.
- Hanya muncul pada kartu penjelasan, tidak bergerak/berkedip (menghindari distraksi — DS03).

### F12 — Progres & Ringkasan Hasil (P1)
- Peta progres per subbab (belum/sedang/selesai) dan bintang penguasaan.
- Laporan sederhana yang bisa ditunjukkan ke guru / diekspor (CSV/gambar).

### F13 — Instrumen Penelitian Terintegrasi (P1)
**Dasar:** kebutuhan penelitian
- Skala beban mental Paas (1–9) muncul setelah setiap modul (bisa dinonaktifkan).
- Posttest dan angket respons siswa di dalam aplikasi.
- Ekspor data ke CSV (kode siswa, skor, waktu, beban kognitif) — **tanpa nama asli**.

### F14 — Mode Belajar Bersama (P2)
**Dasar:** GL01
- Mode proyeksi untuk kelas (huruf besar, tanpa penilaian).
- Kode tantangan yang bisa dibagikan antarteman (offline: kode soal).

### F15 — Sinkronisasi Data & Dasbor Guru (P1)
**Dasar:** persona guru & peneliti · backend Python (FastAPI)
- Guru/peneliti login (web), membuat kelas, dan membagikan **kode kelas**.
- Siswa bergabung dengan kode kelas + kode siswa (tanpa nama) dan menyetujui pernyataan persetujuan.
- Data belajar dikirim otomatis saat online (*offline-first*: aplikasi tetap berfungsi tanpa internet; data menunggu di antrean).
- Dasbor menampilkan: progres per modul, skor pretest/posttest, miskonsepsi tersering, profil literasi LM1–LM4, rata-rata skor beban kognitif.
- Halaman penilaian jawaban uraian dengan rubrik 0–3; mendukung 2 penilai.
- Ekspor data kelas ke CSV/XLSX.

**Kriteria penerimaan:**
- [ ] Mengirim data yang sama dua kali tidak menggandakan data.
- [ ] Guru hanya bisa melihat kelas miliknya.
- [ ] Aplikasi siswa tetap dapat dipakai penuh dalam mode pesawat.

### Fitur Literasi Matematika

Indikator: **LM1** merumuskan · **LM2** menerapkan · **LM3** menafsirkan · **LM4** mengevaluasi & bernalar (lihat [docs/09-LITERASI-MATEMATIKA.md](docs/09-LITERASI-MATEMATIKA.md)).

### F16 — Tantangan Literasi per Modul (P0)
**Dasar:** EL01, GL05 · LM1–LM4
- Di akhir setiap modul (setelah latihan prosedural), ada 1 stimulus kontekstual dengan 2–3 butir soal.
- Stimulus tersegmentasi (teks per kalimat, tabel maks. 5 baris) dan tetap dapat dibuka saat menjawab.
- Tersedia glosarium istilah konteks dan **Kartu Strategi Membaca Stimulus**.

**Kriteria penerimaan:**
- [ ] Setiap modul M0–M6 memiliki minimal 1 tantangan literasi.
- [ ] Setiap butir ditandai indikator LM dan konteksnya.

### F17 — Modul M7 "Bilangan Bulat di Sekitar Kita" (P0)
**Dasar:** T5 · LM1–LM4
- Minimal 4 stimulus bergaya AKM (konteks personal, sosial budaya, saintifik).
- Bentuk soal: pilihan ganda, PG kompleks (pilih semua/benar-salah), menjodohkan, isian singkat, uraian.
- Dukungan dikurangi bertahap: contoh literasi lengkap → terbimbing → mandiri.

**Kriteria penerimaan:**
- [ ] Kelima bentuk soal AKM didukung dan dinilai otomatis (kecuali uraian).
- [ ] Jawaban uraian tersimpan dan ikut diekspor untuk dinilai dengan rubrik.

### F18 — Benar atau Salah? Jelaskan! (P0)
**Dasar:** GL02, GL04 · LM4
- Siswa menilai klaim tokoh fiktif (mis. "Kota A paling dingin karena 12 > 7"), lalu memilih alasan yang tepat dari beberapa opsi; boleh menambahkan penjelasan sendiri.
- Melatih siswa memverifikasi jawaban secara mandiri, tidak hanya bergantung pada teman.

### F19 — Cek Kewajaran (P1)
**Dasar:** IL05 · LM3, LM4
- Sebelum menghitung, siswa memperkirakan tanda (positif/negatif) dan kira-kira besar hasil; setelahnya, siswa memaknai hasil dalam konteks (mis. "−3 m berarti …").

### F20 — Satu Model, Banyak Cerita (P1)
**Dasar:** GL05 · LM1 (transfer)
- Satu ekspresi dicocokkan dengan beberapa cerita; sebagian sesuai, sebagian tidak, sebagian sesuai tetapi hasilnya tidak masuk akal.

### F21 — Buat Soalmu Sendiri (P2)
**Dasar:** GL01, GL04 · LM1, LM3
- Siswa menyusun cerita dari model yang diberikan dengan template kalimat; hasil dapat dibagikan ke teman.

### F22 — Profil Literasi (P1)
- Tampilan sederhana penguasaan LM1–LM4 di halaman Progres; ikut diekspor ke CSV.

## 7. Kebutuhan Non-Fungsional

| ID | Kategori | Kebutuhan |
|----|----------|-----------|
| NF0 | Teknologi | Frontend **JavaScript** (React + Vite); backend **Python** (FastAPI); analisis data **Python** (pandas, SciPy). Rincian di [docs/06-ARSITEKTUR-TEKNIS.md](docs/06-ARSITEKTUR-TEKNIS.md) |
| NF1 | Platform | Berjalan di Chrome/Edge/Firefox versi terbaru dan Android 8.0+ (APK via Capacitor) |
| NF2 | Offline | Seluruh materi & latihan dapat diakses tanpa internet setelah instalasi pertama |
| NF3 | Performa | Muat awal < 3 detik di 4G; ukuran APK < 25 MB; nyaman di RAM 2 GB |
| NF4 | Aksesibilitas | Kontras teks ≥ 4,5:1 (WCAG AA); ukuran huruf dasar ≥ 16 px; area sentuh ≥ 44×44 px; tidak mengandalkan warna saja |
| NF5 | Kesederhanaan | Maks. 1 tujuan utama per layar; tanpa dekorasi/animasi yang tidak terkait materi (DS03) |
| NF6 | Privasi | Pengguna anak di bawah umur: tidak mengumpulkan nama asli, foto, atau lokasi; data disimpan di perangkat dan baru dikirim ke server setelah siswa bergabung ke kelas dan menyetujui; komunikasi lewat HTTPS |
| NF10 | Ketersediaan server | Gangguan server tidak boleh menghentikan belajar siswa; data disinkronkan ulang otomatis |
| NF7 | Bahasa | Bahasa Indonesia baku yang ramah; istilah konsisten (mis. "bilangan negatif", bukan campur "minus"/"negatif" tanpa penjelasan) |
| NF8 | Pemeliharaan | Konten (materi & soal) dipisahkan dari kode dalam file data (JSON) agar dapat diubah tanpa pemrograman ulang |
| NF9 | Notasi | Pembagian ditulis dengan simbol `:` sesuai kebiasaan buku sekolah Indonesia; bilangan negatif dalam operasi diberi kurung, mis. `5 × (−3)` |

## 8. Alur Pengguna Utama

```
Buka aplikasi
  └─> (pertama kali) Isi kode siswa + kelas → Tes prasyarat → Pretest
        └─> Beranda: peta modul
              └─> Pilih subbab
                    ├─> Ringkasan (kartu + garis bilangan)
                    ├─> Contoh (lengkap → berlubang)
                    ├─> Latihan (L1 → L2 → L3) + umpan balik
                    ├─> Tantangan Literasi (stimulus kontekstual)
                    └─> Skala beban mental (opsional) → Progres diperbarui
              └─> M7 Bilangan Bulat di Sekitar Kita (setelah M0–M6)
  └─> Setelah semua modul: Posttest + Tes Literasi → Angket respons → Data tersinkron ke server

Guru (web): Login → Buat kelas → Bagikan kode kelas → Pantau dasbor → Nilai uraian → Ekspor data
Peneliti: Ekspor CSV/XLSX → Skrip analisis Python (N-gain, uji statistik, kappa, dll.)
```

## 9. Metrik Keberhasilan Produk

- Persentase siswa menyelesaikan seluruh modul.
- Rata-rata jumlah petunjuk yang dibuka per soal (diharapkan menurun antar-level).
- Frekuensi membuka kartu aturan tanda (diharapkan menurun dari waktu ke waktu).
- Skor pretest vs posttest, N-gain.
- Skor beban kognitif (Paas) per modul.
- Skor tes literasi matematika (pretest vs posttest) per indikator LM1–LM4.
- Persentase jawaban benar pada butir penalaran (LM4) di M7.

## 10. Asumsi & Risiko

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Data kebutuhan hanya dari 1 siswa | Fitur bias pada satu profil | Tambah narasumber & wawancara guru sebelum tahap desain final |
| HP siswa spesifikasi rendah | Aplikasi lambat | Tanpa video berat; SVG ringan; uji pada perangkat RAM 2 GB |
| Keterbatasan waktu pengembangan (skripsi) | Fitur tidak selesai | Prioritas P0 dulu; P1/P2 hanya bila waktu cukup |
| Mesin evaluasi ekspresi salah | Umpan balik menyesatkan | Uji unit untuk semua soal bank soal; validasi ahli materi |
| Gangguan fokus dari gamifikasi | Menambah beban ekstrinsik | Gamifikasi minimal (progres & bintang saja) |
| Soal literasi (stimulus panjang, banyak langkah) terlalu membebani | Siswa kewalahan, beban ekstrinsik naik | Diberikan setelah prosedur lancar; stimulus tersegmentasi; satu proses per layar; contoh literasi lengkap dulu |
| Jawaban uraian tidak bisa dinilai otomatis | Data penalaran tidak lengkap | Mode latihan memakai pilihan alasan; jawaban uraian dinilai guru/peneliti dengan rubrik di dasbor |
| Server gratis "tertidur" atau lambat | Sinkronisasi tertunda | Arsitektur *offline-first*; sinkronisasi diulang otomatis; ekspor lokal sebagai cadangan |
| Bertambahnya cakupan (backend + dasbor) | Waktu pengembangan bertambah | Backend dikerjakan setelah MVP frontend P0 selesai; bila waktu tidak cukup, pakai ekspor CSV lokal |

## 11. Keputusan Terbuka

- [ ] Nama final aplikasi.
- [ ] Model pengembangan penelitian: **ADDIE** atau **4D (Thiagarajan)** — lihat [docs/08-RENCANA-EVALUASI.md](docs/08-RENCANA-EVALUASI.md).
- [ ] Apakah perpangkatan bilangan bulat dimasukkan (LKS menyebut "pemangkatan").
- [x] ~~Apakah guru membutuhkan dasbor pada v1~~ → Ya, dasbor guru + sinkronisasi masuk v1 (P1) dengan backend Python.
- [ ] Layanan hosting backend & basis data (mis. Render + Neon) dan siapa pemilik akunnya.

## 12. Dokumen Terkait

- [docs/01-ANALISIS-KEBUTUHAN.md](docs/01-ANALISIS-KEBUTUHAN.md)
- [docs/03-DESAIN-INSTRUKSIONAL.md](docs/03-DESAIN-INSTRUKSIONAL.md)
- [docs/04-KONTEN-DAN-BANK-SOAL.md](docs/04-KONTEN-DAN-BANK-SOAL.md)
- [docs/05-UI-UX-DESIGN.md](docs/05-UI-UX-DESIGN.md)
- [docs/06-ARSITEKTUR-TEKNIS.md](docs/06-ARSITEKTUR-TEKNIS.md)
- [docs/07-ROADMAP-DAN-TASKS.md](docs/07-ROADMAP-DAN-TASKS.md)
- [docs/08-RENCANA-EVALUASI.md](docs/08-RENCANA-EVALUASI.md)
- [docs/09-LITERASI-MATEMATIKA.md](docs/09-LITERASI-MATEMATIKA.md)
