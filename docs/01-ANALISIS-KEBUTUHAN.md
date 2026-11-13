# 01 — Analisis Kebutuhan dari Hasil Wawancara

Dokumen ini menerjemahkan hasil wawancara siswa (S01) menjadi kebutuhan aplikasi. Setiap kebutuhan diberi ID (`KB-xx`) yang dirujuk oleh [PRD.md](../PRD.md).

## 1. Identitas Data

| Item | Isi |
|------|-----|
| Narasumber | Siswa kode **S01**, kelas 9H |
| Tanggal | 8 November 2026 |
| Pewawancara | Putri Ariyanti |
| Durasi | 23 menit, direkam dengan persetujuan |
| Materi | Operasi Bilangan Bulat (pernah dipelajari di SD kelas 6 dan SMP kelas 7) |
| Artefak pemicu | Lembar soal 3 level (operasi dasar satu tanda, operasi campuran, soal cerita) dan LKS Matematika Kelas VII Semester Ganjil |

## 2. Kerangka Pengodean (Cognitive Load Theory)

| Kode | Makna | Implikasi desain |
|------|-------|------------------|
| **K** | Konteks/latar belajar | Gambaran kondisi awal siswa |
| **IL** | *Intrinsic Load*: beban dari kompleksitas materi itu sendiri (banyaknya elemen yang saling terkait) | **Dikelola**: pecah materi, urutkan dari sederhana ke kompleks, pastikan prasyarat |
| **EL** | *Extraneous Load*: beban dari cara penyajian yang kurang baik | **Dikurangi**: visualisasi, hilangkan teks berlebih, atur tempo, tampilan bersih |
| **GL** | *Germane Load*: usaha mental untuk membangun skema/pemahaman | **Didorong**: contoh bertahap, perbandingan pola, refleksi, umpan balik |
| **DS** | Desain/saran siswa untuk aplikasi | Masukan langsung untuk fitur dan tampilan |

## 3. Matriks Temuan → Kebutuhan

### 3.1 Konteks (K)

| Kode | Temuan inti | Kebutuhan |
|------|-------------|-----------|
| K01 | Belajar materi di SD kelas 6 & SMP kelas 7, diingat sebagai "penjumlahan pengurangan" | Aplikasi perlu **mengaktifkan pengetahuan awal** sebelum materi baru (apersepsi singkat) |
| K02 | Guru menjelaskan di papan tulis + contoh soal (metode ekspositori) | Aplikasi menjadi **pelengkap** yang menyediakan apa yang tidak ada di kelas: visualisasi dan tempo mandiri |
| K03 | Penjumlahan/pengurangan mudah; **perkalian & pembagian sulit dan ragu** | Porsi latihan & penjelasan lebih besar pada perkalian/pembagian; ada fitur "yakin/ragu" saat menjawab |

### 3.2 Intrinsic Load (IL)

| Kode | Temuan inti | ID | Kebutuhan |
|------|-------------|----|-----------|
| IL01 | Keliru aturan tanda ("minus ketemu minus jadi plus") | KB-01 | **Kartu aturan tanda** yang selalu bisa dibuka + penjelasan *mengapa* (pola, garis bilangan), bukan hanya hafalan |
| IL02 | Paham urutan operasi tapi sering tertukar; lupa mengerjakan tanda kurung dulu | KB-02 | **Penyelesai langkah demi langkah**: menyorot bagian yang dikerjakan lebih dulu (kurung → ×/÷ dari kiri → +/− dari kiri) |
| IL03 | Merasa harus menguasai operasi dasar dulu | KB-03 | **Cek prasyarat** (tes awal singkat) dan modul penguatan bila belum lulus |
| IL04 | Sulit bila semua tanda bercampur dalam satu soal | KB-04 | **Urutan kompleksitas bertahap**: 1 operasi → 2 operasi → campuran → campuran dengan kurung |
| IL05 | Salah karena kurang teliti menghitung | KB-05 | **Umpan balik per langkah** yang menunjukkan langkah mana yang salah; kebiasaan "cek ulang" |

### 3.3 Extraneous Load (EL)

| Kode | Temuan inti | ID | Kebutuhan |
|------|-------------|----|-----------|
| EL01 | Bingung menentukan yang diketahui dan ditanyakan pada soal cerita | KB-06 | **Kerangka soal cerita** terstruktur: Diketahui → Ditanya → Model → Hitung → Simpulkan |
| EL02 | Terbantu oleh garis bilangan dan tabel; teks LKS terlalu panjang | KB-07 | **Garis bilangan interaktif** dan **tabel pola**; teks maksimal pendek per layar |
| EL03 | Guru tidak pernah memakai visualisasi | KB-07 | (sama) Visualisasi menjadi fitur inti, bukan tambahan |
| EL04 | Pernah ketinggalan mencatat; bagian ×/÷ perlu lebih pelan | KB-08 | **Tempo dikendalikan siswa** (tombol Lanjut/Ulangi), tidak ada animasi yang berjalan otomatis tanpa kontrol |
| EL05 | Pada soal cerita panjang, sulit fokus memilih data penting | KB-09 | **Penanda (highlighter)** pada teks soal cerita dan pemisahan kalimat per baris |

### 3.4 Germane Load (GL)

| Kode | Temuan inti | ID | Kebutuhan |
|------|-------------|----|-----------|
| GL01 | Lebih paham saat diskusi kelompok, nyaman bertanya ke teman | KB-10 | Bahasa penjelasan **santai seperti teman** (tokoh pemandu sebaya); fitur opsional belajar bersama |
| GL02 | Mengecek jawaban dengan bertanya ke teman | KB-11 | **Cek jawaban mandiri** dengan umpan balik penjelas, bukan hanya benar/salah |
| GL03 | Suka contoh mirip; bingung bila langsung diberi jawaban | KB-12 | **Contoh soal bertahap** (*worked example* → *faded example*) dan **petunjuk berjenjang** sebelum kunci jawaban |
| GL04 | Paham ketika dijelaskan teman; belum pernah menjelaskan | KB-13 | Aktivitas **"Jelaskan kembali"** (*self-explanation*) — memilih/menyusun alasan sebuah langkah |
| GL05 | Mencari kesamaan dengan soal yang pernah dikerjakan | KB-14 | Tautan **"Lihat contoh mirip"** di setiap soal latihan; ringkasan pola penyelesaian |

### 3.5 Saran Desain (DS)

| Kode | Temuan inti | ID | Kebutuhan |
|------|-------------|----|-----------|
| DS01 | Harus ada ringkasan materi, contoh soal, latihan soal | KB-15 | Tiga komponen wajib per subbab: **Ringkasan – Contoh – Latihan** |
| DS02 | Soal cerita dijelaskan pelan-pelan agar teliti | KB-06, KB-08 | (sama) kerangka bertahap + tempo mandiri |
| DS03 | Jangan banyak elemen tidak nyambung; warna harus kontras dengan font | KB-16 | **Desain minimalis**, kontras teks minimal WCAG AA (4,5:1), tanpa dekorasi yang tidak relevan |

## 4. Prioritas Masalah

Berdasarkan intensitas dan frekuensi dalam wawancara:

1. **Aturan tanda pada perkalian/pembagian** (K03, IL01, EL04) → dampak terbesar.
2. **Urutan operasi pada soal campuran** (IL02, IL04).
3. **Pemodelan soal cerita** (EL01, EL05, DS02).
4. **Penyajian materi yang terlalu tekstual** (EL02, EL03, DS03).
5. **Ketergantungan pada teman untuk verifikasi** (GL02, GL04) → aplikasi menyediakan umpan balik mandiri.

## 5. Catatan Metodologis (untuk penyempurnaan laporan)

Beberapa hal yang sebaiknya ditinjau sebelum laporan wawancara dipakai sebagai dasar penelitian:

- **EL04**: kutipan siswa "Enggak kecepetan, tapi pernah ketinggalan nyatet" sedangkan interpretasi menulis "kadang terlalu cepat". Pertimbangkan merevisi menjadi: *"Tempo guru secara umum sesuai, tetapi siswa kadang tertinggal mencatat dan membutuhkan tempo lebih lambat pada bagian perkalian dan pembagian."*
- **GL01**: interpretasi menyebut "contoh soal", sementara kutipan berfokus pada **diskusi kelompok** dan kenyamanan bertanya ke teman. Pertimbangkan menyesuaikan.
- **Header tabel** kolom "Kode awal" tertulis `(IL/EL/GL/K)`, padahal ada juga kode **DS**. Tambahkan DS pada header.
- **Satu narasumber** belum cukup untuk generalisasi. Disarankan menambah 2–5 siswa dengan kemampuan berbeda (tinggi/sedang/rendah) dan, jika memungkinkan, wawancara guru, agar analisis kebutuhan lebih kuat (triangulasi sumber).
- **Kunci lembar soal pemicu** (untuk verifikasi jawaban siswa):

| Soal | Penyelesaian | Jawaban |
|------|--------------|---------|
| L1-A | −8 + 15 | **7** |
| L1-B | −7 × (−6) | **42** |
| L1-C | 12 − (−5) = 12 + 5 | **17** |
| L1-D | 20 : (−4) | **−5** |
| L2-A | −12 : 3 + (−4) × 2 = −4 + (−8) | **−12** |
| L2-B | 15 − (−5) × 3 + 10 = 15 − (−15) + 10 = 15 + 15 + 10 | **40** |
| L2-C | 5 × (−2 + 7) : (−5) = 5 × 5 : (−5) = 25 : (−5) | **−5** |
| L3 | Kenaikan = (15 : 3) × 2 = 10 °C; suhu akhir = −6 + 10 | **4 °C** |

  Perhatikan juga salah ketik pada soal L3: "15 *minute*" → "15 **menit**".
