# 09 — Pengembangan Literasi Matematika

Dokumen ini menjelaskan bagaimana aplikasi BULAT tidak hanya melatih keterampilan berhitung bilangan bulat, tetapi juga **menumbuhkembangkan literasi matematika** siswa, dengan tetap menjaga beban kognitif terkelola.

## 1. Pengertian & Kerangka Acuan

**Literasi matematika** (OECD, PISA 2022) adalah kemampuan individu untuk **bernalar secara matematis** serta **merumuskan, menerapkan, dan menafsirkan** matematika untuk memecahkan masalah dalam berbagai konteks dunia nyata.

Di Indonesia, kemampuan ini diukur melalui **AKM Numerasi** (Asesmen Nasional). Aplikasi memakai gabungan kedua kerangka:

| Dimensi | PISA 2022 | AKM Numerasi | Dipakai di aplikasi |
|---------|-----------|--------------|---------------------|
| **Proses / Level kognitif** | Merumuskan (*formulate*), Menerapkan (*employ*), Menafsirkan & Mengevaluasi (*interpret & evaluate*), dengan **Penalaran matematis** sebagai inti | Pemahaman, Penerapan, Penalaran | Empat proses PISA (P1–P4), dipetakan ke level AKM |
| **Konten** | *Quantity* (bilangan) | Bilangan | Operasi bilangan bulat |
| **Konteks** | Personal, pekerjaan, sosial, ilmiah | Personal, sosial budaya, saintifik | Personal, sosial budaya, saintifik |
| **Bentuk soal** | PG, PG kompleks, isian, uraian | PG, PG kompleks, menjodohkan, isian, uraian | Kelima bentuk AKM |

### Indikator Literasi Matematika (dipakai untuk desain soal & penilaian)

| Kode | Proses | Indikator pada materi bilangan bulat | Level AKM |
|------|--------|--------------------------------------|-----------|
| **LM1** | Merumuskan | Mengidentifikasi informasi matematis dari situasi nyata (tabel, grafik, teks) dan mengubahnya menjadi model operasi bilangan bulat | Pemahaman / Penerapan |
| **LM2** | Menerapkan | Menggunakan operasi bilangan bulat dan urutan operasi dengan benar untuk memperoleh hasil | Penerapan |
| **LM3** | Menafsirkan | Memaknai hasil perhitungan kembali ke konteks (mis. −3 m berarti 3 meter di bawah permukaan laut) | Penerapan / Penalaran |
| **LM4** | Mengevaluasi & bernalar | Menilai kewajaran hasil, menguji kebenaran pernyataan/klaim, dan memberi alasan atau argumen matematis | Penalaran |

## 2. Hubungan dengan Hasil Wawancara

| Temuan | Kaitan dengan literasi | Respons desain |
|--------|------------------------|----------------|
| EL01 — bingung menentukan diketahui & ditanya | Lemah pada **merumuskan** (LM1) | Latihan khusus "ubah situasi jadi model" sebelum menghitung |
| EL05 — sulit fokus pada soal cerita panjang | Lemah membaca **stimulus** | Stimulus dipecah, penanda teks, glosarium istilah konteks |
| DS02 — soal cerita perlu pelan-pelan | Butuh scaffolding pada siklus pemodelan | Siklus literasi bertahap, satu proses per layar |
| GL02, GL04 — mengecek & menjelaskan bergantung pada teman | Lemah pada **mengevaluasi & bernalar** (LM4) | Aktivitas "Benar atau Salah? Jelaskan!" dan "Cek kewajaran" |
| GL05 — mencari kesamaan dengan soal sebelumnya | Potensi **transfer** ke konteks baru | Satu model matematika diterapkan di berbagai konteks berbeda |
| K03 — ragu pada perkalian & pembagian | Konteks nyata memberi makna aturan tanda | Konteks "berulang" (setiap menit, setiap minggu) untuk perkalian |

## 3. Menjaga Beban Kognitif pada Soal Literasi

Soal literasi memiliki **interaktivitas elemen tinggi** (membaca konteks + memilih informasi + memodelkan + menghitung + menafsirkan). Agar tidak membebani:

1. **Urutan**: soal literasi diberikan **setelah** siswa lancar prosedurnya di modul tersebut (*isolated elements → interacting elements*). Prosedur yang sudah otomatis membebaskan memori kerja untuk bernalar.
2. **Contoh literasi lengkap dulu**: satu stimulus dikerjakan sebagai *worked example* yang memperlihatkan keempat proses (LM1–LM4), lalu *faded*, lalu mandiri.
3. **Satu proses per layar**: Merumuskan → Menerapkan → Menafsirkan → Mengevaluasi.
4. **Stimulus tersegmentasi**: teks per kalimat, tabel/grafik sederhana (maks. 4–5 baris data), stimulus tetap terlihat (bisa dibuka-tutup) saat menjawab untuk menghindari *split attention*.
5. **Glosarium konteks**: istilah seperti "di bawah permukaan laut", "saldo", "defisit", "basement" dapat diketuk untuk melihat arti singkat.
6. **Kartu Strategi Membaca Stimulus** (selalu tersedia): *Apa situasinya? → Angka apa yang penting? → Apa yang ditanya? → Operasi apa? → Apakah hasilnya masuk akal?*
7. **Fading**: dukungan dikurangi bertahap; pada akhir modul M7 siswa mengerjakan stimulus tanpa kerangka.

## 4. Fitur Literasi di Aplikasi

| ID | Fitur | Deskripsi | Indikator |
|----|-------|-----------|-----------|
| F16 | **Tantangan Literasi** di akhir setiap modul | 1 stimulus kontekstual dengan 2–3 butir soal setelah latihan prosedural | LM1–LM4 |
| F17 | **Modul M7 "Bilangan Bulat di Sekitar Kita"** | Kumpulan stimulus bergaya AKM (konteks personal, sosial budaya, saintifik) dengan bentuk soal beragam | LM1–LM4 |
| F18 | **Benar atau Salah? Jelaskan!** | Siswa menilai klaim tokoh fiktif lalu memilih/menyusun alasan | LM4 |
| F19 | **Cek Kewajaran** | Sebelum/sesudah menghitung, siswa memperkirakan tanda dan besar hasil, lalu membandingkannya | LM3, LM4 |
| F20 | **Satu Model, Banyak Cerita** | Siswa mencocokkan satu ekspresi (mis. −6 + 5 × 2) dengan beberapa konteks yang sesuai/tidak sesuai | LM1 (transfer) |
| F21 | **Buat Soalmu Sendiri** (*problem posing*) | Siswa menyusun cerita dari model yang diberikan menggunakan template kalimat; dapat dibagikan ke teman | LM1, LM3 |
| F22 | **Profil Literasi** | Grafik sederhana penguasaan LM1–LM4 berdasarkan jawaban siswa | Semua |

## 5. Contoh Stimulus & Soal

> Semua data di bawah adalah **data ilustratif** (bukan data resmi). Validasi oleh ahli materi sebelum dipakai.

### Stimulus A — Suhu Empat Kota (konteks saintifik)

Tabel suhu dalam satu hari:

| Kota | Suhu terendah (°C) | Suhu tertinggi (°C) |
|------|--------------------|---------------------|
| Kota A | −12 | −3 |
| Kota B | 2 | 9 |
| Kota C | −1 | 17 |
| Kota D | −7 | 3 |

| No | Bentuk | Soal | Kunci | Indikator |
|----|--------|------|-------|-----------|
| A1 | Pilihan ganda | Kota manakah yang memiliki selisih suhu tertinggi dan terendah paling besar? | **Kota C** (17 − (−1) = 18). Selisih lain: A = 9, B = 7, D = 10 | LM1, LM2 |
| A2 | PG kompleks (Benar/Salah) | (a) Suhu terendah Kota A lebih rendah daripada Kota D. (b) Kota B tidak pernah bersuhu di bawah 0 °C pada hari itu. (c) Selisih suhu Kota A lebih besar daripada Kota D. (d) Suhu tertinggi Kota D 10 °C lebih tinggi daripada suhu terendahnya. | (a) **B** (−12 < −7) (b) **B** (c) **S** (9 < 10) (d) **B** (3 − (−7) = 10) | LM3, LM4 |
| A3 | Uraian (penalaran) | Rina berkata: "Kota A paling dingin karena 12 lebih besar dari 7." Apakah alasan Rina tepat? Jelaskan. | Kesimpulan benar (−12 terendah), tetapi **alasannya keliru**: pada bilangan negatif, makin jauh dari nol ke kiri makin kecil; −12 < −7 karena −12 terletak di sebelah kiri −7 pada garis bilangan | LM4 |

### Stimulus B — Lift Gedung Parkir (konteks personal)

> Sebuah gedung memiliki 3 lantai bawah tanah (B1, B2, B3) dan 10 lantai di atas tanah. Lantai dasar (G) dianggap lantai 0. Tinggi setiap lantai 4 meter.

| No | Bentuk | Soal | Kunci | Indikator |
|----|--------|------|-------|-----------|
| B1 | Menjodohkan | Pasangkan: B3, G, B1, Lantai 5 ↔ −1, 0, 5, −3 | B3 ↔ −3; G ↔ 0; B1 ↔ −1; Lantai 5 ↔ 5 | LM1 |
| B2 | PG | Ayah memarkir mobil di B3 lalu naik lift ke lantai 7. Model yang tepat untuk banyak lantai yang dilalui adalah … | **7 − (−3)** (= 10 lantai) | LM1 |
| B3 | Isian | Berapa meter perubahan ketinggian Ayah? | **40 meter** (10 × 4) | LM2, LM3 |
| B4 | Uraian | Dari lantai 6, Dina turun 8 lantai. Dina berkata ia berada di lantai "−2". Apa arti jawaban Dina di gedung ini? | 6 − 8 = −2 → **lantai B2** (2 lantai di bawah lantai dasar) | LM3 |

### Stimulus C — Kas Kelas (konteks sosial budaya)

> Saldo awal kas kelas Rp20.000. Catatan perubahan kas per minggu (pemasukan +, pengeluaran −):

| Minggu | Perubahan (ribu rupiah) |
|--------|------------------------|
| 1 | +25 |
| 2 | −40 |
| 3 | +15 |
| 4 | −10 |

| No | Bentuk | Soal | Kunci | Indikator |
|----|--------|------|-------|-----------|
| C1 | Isian | Berapa saldo kas di akhir minggu ke-4? | 20 + 25 − 40 + 15 − 10 = **Rp10.000** | LM1, LM2 |
| C2 | PG | Pada akhir minggu ke berapa saldo kas paling sedikit? | **Minggu 2** (saldo berturut-turut: 45, 5, 20, 10 ribu) | LM2, LM3 |
| C3 | Uraian | Di minggu ke-5 kelas ingin membeli bola seharga Rp35.000. Apakah uang kas cukup? Jika tidak, berapa kekurangannya? Jelaskan. | 10 − 35 = −25 → **tidak cukup, kurang Rp25.000** | LM3, LM4 |

### Stimulus D — Di Atas dan Di Bawah Laut (konteks saintifik)

> Seekor burung camar terbang 30 m di atas permukaan laut. Seorang penyelam berada 12 m di bawah permukaan laut. Seekor ikan berenang 8 m di bawah penyelam.

| No | Bentuk | Soal | Kunci | Indikator |
|----|--------|------|-------|-----------|
| D1 | PG kompleks | Pilih **semua** model yang benar untuk posisi ikan: (a) −12 − 8 (b) −12 + 8 (c) −(12 + 8) (d) 12 − 8 | **(a) dan (c)** → −20 m | LM1 |
| D2 | Isian | Berapa jarak vertikal burung camar dan penyelam? | 30 − (−12) = **42 m** | LM2, LM3 |
| D3 | Benar/Salah + alasan | Budi berkata: "Jarak burung dan ikan adalah 30 − 20 = 10 m." Benar atau salah? | **Salah**: posisi ikan −20, jadi jarak = 30 − (−20) = 50 m | LM4 |

### Contoh "Satu Model, Banyak Cerita" (F20)

Model: **−6 + 5 × 2** (= 4). Manakah cerita yang sesuai?
| Cerita | Sesuai model? | Catatan untuk umpan balik |
|--------|---------------|---------------------------|
| (a) Suhu es −6 °C naik 2 °C setiap 3 menit, selama 15 menit | ✅ Sesuai | 15 : 3 = 5 kali kenaikan → hasil 4 °C masuk akal |
| (b) Penyelam di kedalaman 6 m naik 2 m setiap menit selama 5 menit | ⚠️ Model sesuai, hasil perlu ditafsirkan | Hasil 4 berarti 4 m **di atas** permukaan laut — tidak masuk akal untuk penyelam (LM4: cek kewajaran) |
| (c) Utang Rp6.000 dicicil Rp2.000 sebanyak 5 kali | ⚠️ Model sesuai, hasil perlu ditafsirkan | Hasil +4.000 berarti **kelebihan bayar** Rp4.000 — apa artinya dalam kehidupan nyata? |
| (d) Skor −6, lalu mendapat −2 sebanyak 5 kali | ❌ Tidak sesuai | Model yang benar: −6 + 5 × (−2) = −16 |

> Butir (b) dan (c) sengaja memunculkan diskusi **kewajaran konteks**: modelnya sah secara matematis, tetapi hasilnya harus ditafsirkan secara kritis.

## 6. Rubrik Penilaian Soal Uraian

Soal uraian tidak dinilai otomatis oleh aplikasi. Aplikasi menyimpan jawaban teks untuk dinilai peneliti/guru dengan rubrik berikut. Untuk mode latihan, siswa memilih alasan dari opsi (dinilai otomatis), lalu boleh menulis penjelasan sendiri.

| Skor | Kriteria |
|------|----------|
| 3 | Jawaban benar, alasan matematis tepat dan lengkap, dikaitkan dengan konteks |
| 2 | Jawaban benar, alasan sebagian tepat atau kurang dikaitkan dengan konteks |
| 1 | Jawaban salah tetapi ada penalaran yang relevan, atau jawaban benar tanpa alasan |
| 0 | Tidak menjawab atau jawaban/alasan tidak relevan |

## 7. Rencana Distribusi Soal Literasi

| Modul | Tantangan Literasi (F16) | Konteks | Proses dominan |
|-------|--------------------------|---------|----------------|
| M0 | Membandingkan suhu kota | Saintifik | LM3, LM4 |
| M1 | Skor permainan | Personal | LM1, LM2 |
| M2 | Selisih ketinggian/kedalaman | Saintifik | LM1, LM3 |
| M3 | Perubahan berulang (suhu, tabungan) | Personal | LM1, LM2 |
| M4 | Pembagian rata kerugian/perubahan | Sosial budaya | LM2, LM3 |
| M5 | Skor kuis (benar +4, salah −2, kosong −1) | Personal | LM1, LM2 |
| M6 | Soal cerita multi-langkah | Campuran | LM1–LM3 |
| **M7** | Stimulus A–D + stimulus baru | Ketiganya | **LM1–LM4**, termasuk F18–F21 |

Target komposisi bank soal M7 (mengikuti AKM): ±30% pemahaman, ±40% penerapan, ±30% penalaran; konteks seimbang antara personal, sosial budaya, dan saintifik.

## 8. Referensi

- OECD. (2023). *PISA 2022 Assessment and Analytical Framework*. OECD Publishing.
- Pusmenjar Kemendikbudristek. (2020). *AKM dan Implikasinya pada Pembelajaran*. Jakarta: Kemendikbud.
- Stacey, K., & Turner, R. (Eds.). (2015). *Assessing Mathematical Literacy: The PISA Experience*. Springer.
- Silver, E. A. (1994). On mathematical problem posing. *For the Learning of Mathematics, 14*(1), 19–28.

> Verifikasi kembali detail referensi sebelum dimasukkan ke skripsi.
