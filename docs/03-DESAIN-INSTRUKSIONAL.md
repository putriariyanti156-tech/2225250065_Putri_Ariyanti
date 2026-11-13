# 03 — Desain Instruksional Berbasis Cognitive Load Theory

## 1. Landasan Teori

*Cognitive Load Theory* (Sweller, 1988; Sweller, van Merriënboer & Paas, 1998, 2019) menyatakan bahwa memori kerja (*working memory*) memiliki kapasitas terbatas, sehingga pembelajaran efektif terjadi bila:

- **Beban intrinsik (IL)** dikelola sesuai kemampuan siswa (bukan dihilangkan),
- **Beban ekstrinsik (EL)** dikurangi seminimal mungkin,
- Kapasitas yang tersisa diarahkan ke **beban germane (GL)**, yaitu pembentukan dan otomatisasi skema.

Prinsip multimedia Mayer (2009/2021) dipakai sebagai pelengkap untuk merancang tampilan.

## 2. Pemetaan Prinsip → Fitur

| Prinsip / Efek | Penjelasan singkat | Penerapan di aplikasi | Dasar wawancara |
|----------------|--------------------|-----------------------|-----------------|
| **Segmenting / Chunking** | Materi kompleks dipecah menjadi bagian kecil | Kartu 1 ide per layar (F02) | IL04, EL02 |
| **Simple-to-complex sequencing** | Elemen ditambah bertahap | 1 operasi → 2 operasi → campuran → kurung (F06) | IL04 |
| **Pre-training** | Konsep prasyarat diajarkan dulu | Tes prasyarat + modul penguatan (F01) | IL03, K01 |
| **Worked example effect** | Pemula belajar lebih baik dari contoh lengkap daripada memecahkan soal | Contoh lengkap langkah demi langkah (F05) | GL03 |
| **Completion / Fading effect** | Langkah contoh dikurangi bertahap | Contoh berlubang → mandiri (F05) | GL03, GL05 |
| **Expertise reversal effect** | Bantuan yang berguna bagi pemula bisa membebani siswa mahir | Siswa yang skornya tinggi boleh melewati contoh; petunjuk hanya bila diminta | — |
| **Split-attention effect** | Informasi yang saling terkait jangan dipisah jauh | Penjelasan langkah diletakkan tepat di samping/bawah ekspresi, bukan di halaman lain | EL02 |
| **Redundancy effect** | Informasi yang sama dalam dua bentuk menambah beban | Tidak membacakan teks yang sudah tertulis; tidak mengulang teks yang sudah tampak di gambar | EL02, DS03 |
| **Signaling / Cueing** | Menandai informasi penting | Sorotan bagian yang dikerjakan dulu (F06), penanda pada soal cerita (F07) | IL02, EL05 |
| **Coherence** | Hilangkan materi yang tidak relevan | Tanpa dekorasi/animasi tak terkait (NF5) | DS03 |
| **Learner pacing** | Siswa mengontrol tempo | Tombol Lanjut/Ulangi, tanpa auto-play (F09) | EL04 |
| **Variability / Comparison** | Membandingkan soal mirip membentuk skema | "Lihat contoh mirip" + tabel pola (F04, F05) | GL05 |
| **Self-explanation** | Menjelaskan alasan langkah memperkuat skema | "Jelaskan kembali" (F10) | GL04 |
| **Goal-free / Isolated elements** | Mengerjakan elemen terpisah sebelum interaksi penuh | Aturan tanda dilatih terpisah sebelum operasi campuran | IL01, IL04 |
| **Immediate elaborated feedback** | Umpan balik segera yang menjelaskan | Umpan balik diagnostik per langkah (F08) | IL05, GL02 |

## 3. Urutan Belajar per Subbab

```
┌─────────────────────────────────────────────────────────────┐
│ 0. Apersepsi (1 kartu)  – kaitkan dengan pengalaman nyata   │
│ 1. Ringkasan            – 3–6 kartu, tiap kartu 1 ide        │
│ 2. Visualisasi          – garis bilangan / tabel pola        │
│ 3. Contoh lengkap       – 2 soal, langkah per langkah        │
│ 4. Contoh berlubang     – 2 soal, isi langkah yang kosong    │
│ 5. Latihan mandiri      – 5–8 soal, umpan balik diagnostik   │
│ 6. Jelaskan kembali     – 1–2 pertanyaan alasan              │
│ 7. Tantangan Literasi   – 1 stimulus kontekstual, 2–3 butir  │
│ 8. Refleksi             – skala beban mental (opsional)      │
└─────────────────────────────────────────────────────────────┘
```

**Aturan adaptif sederhana (tanpa AI):**
- Jika siswa menjawab benar 2 contoh berlubang tanpa petunjuk → boleh lewati contoh berlubang berikutnya (*expertise reversal*).
- Jika siswa salah ≥ 3 kali berturut-turut di latihan → tawarkan kembali ke contoh lengkap yang mirip.
- Jika skor latihan subbab ≥ 80% → subbab ditandai "dikuasai".

## 4. Strategi Khusus per Masalah

### 4.1 Aturan Tanda (IL01, K03)

Pendekatan **menemukan pola**, bukan hafalan:

| Perkalian | Hasil | Pola |
|-----------|-------|------|
| 3 × (−2) | −6 | |
| 2 × (−2) | −4 | bertambah 2 |
| 1 × (−2) | −2 | bertambah 2 |
| 0 × (−2) | 0 | bertambah 2 |
| (−1) × (−2) | **2** | bertambah 2 → jadi positif |
| (−2) × (−2) | **4** | |

Kemudian dihubungkan ke pembagian sebagai kebalikan perkalian: karena (−3) × (−2) = 6, maka 6 : (−2) = −3.

Hindari ungkapan "minus ketemu minus jadi plus" tanpa konteks, karena siswa sering menerapkannya pula pada **penjumlahan** (mis. −3 + (−4) dianggap 7). Bedakan secara eksplisit:
- **Penjumlahan/pengurangan** → pakai garis bilangan (arah & jarak).
- **Perkalian/pembagian** → pakai aturan tanda.

### 4.2 Urutan Operasi (IL02, IL04)

- Tampilkan urutan sebagai **3 anak tangga**: ① Kurung ② Kali & Bagi (dari kiri) ③ Tambah & Kurang (dari kiri).
- Luruskan miskonsepsi "KUKABATAKU" yang sering diartikan kali **selalu** sebelum bagi, dan tambah **selalu** sebelum kurang. Yang benar: kali dan bagi **setara**, dikerjakan dari kiri; tambah dan kurang **setara**, dikerjakan dari kiri.
  - Contoh: 12 : 3 × 2 = 4 × 2 = **8** (bukan 12 : 6 = 2).
  - Contoh: 10 − 3 + 2 = 7 + 2 = **9** (bukan 10 − 5 = 5).
- Siswa **memilih** bagian yang dikerjakan duluan sebelum menghitung (melatih keputusan, bukan hanya berhitung).

### 4.3 Soal Cerita (EL01, EL05, DS02)

Kerangka 5 langkah (adaptasi Polya):

| Langkah | Pertanyaan pemandu | Bantuan |
|---------|--------------------|---------|
| 1. Diketahui | "Angka apa saja yang ada? Apa satuannya?" | Penanda pada kalimat; daftar isian otomatis dari teks yang disorot |
| 2. Ditanya | "Apa yang harus dicari?" | Pilihan ganda pada mode terbimbing |
| 3. Model | "Operasi apa yang cocok?" | Kartu kata kunci (naik → +, turun → −, setiap → ×/:) |
| 4. Hitung | "Kerjakan sesuai urutan operasi" | Penyelesai langkah demi langkah (F06) |
| 5. Kesimpulan | "Jawab dengan kalimat & satuan" | Template kalimat |

Kata kunci hanya sebagai **petunjuk**, bukan aturan mutlak (hindari strategi kata kunci yang dangkal) — selalu diikuti pertanyaan "Apakah masuk akal?".

### 4.4 Ketelitian (IL05)

- Langkah **"Cek ulang"** di akhir soal: perkiraan tanda hasil (positif/negatif?) sebelum menghitung.
- Umpan balik menunjukkan **baris** pengerjaan yang pertama kali salah.

### 4.5 Literasi Matematika (EL01, EL05, GL02, GL04, GL05)

Literasi matematika dikembangkan sebagai **lapisan di atas kelancaran prosedur**, bukan pengganti. Urutannya mengikuti prinsip CLT *isolated → interacting elements*:

```
Prosedur (M1–M5)  →  Soal cerita terbimbing (M6)  →  Tantangan Literasi per modul  →  M7 stimulus AKM mandiri
  beban intrinsik       kerangka 5 langkah             stimulus pendek + kerangka        stimulus beragam, dukungan dipudarkan
  dikelola dulu
```

Empat proses literasi (lihat [09-LITERASI-MATEMATIKA.md](09-LITERASI-MATEMATIKA.md)) dihubungkan dengan kerangka soal cerita:

| Kerangka soal cerita (4.3) | Proses literasi |
|----------------------------|-----------------|
| Diketahui, Ditanya, Model | **LM1 Merumuskan** |
| Hitung | **LM2 Menerapkan** |
| Kesimpulan | **LM3 Menafsirkan** |
| Cek kewajaran / Benar atau Salah? | **LM4 Mengevaluasi & bernalar** |

Strategi khusus:
- **Contoh literasi lengkap** (*worked example*) yang memperlihatkan keempat proses sebelum siswa mengerjakan stimulus sendiri.
- **Variabilitas konteks**: satu model diterapkan di berbagai konteks (suhu, lift, kas kelas, laut) agar terbentuk skema yang dapat ditransfer (GL05).
- **Penalaran eksplisit**: klaim tokoh fiktif untuk dinilai (F18), sehingga siswa terbiasa memverifikasi sendiri tanpa bergantung pada teman (GL02).
- **Tafsir hasil**: setiap jawaban numerik pada soal konteks diikuti pertanyaan "Apa artinya?" (mis. −25 ribu = kurang Rp25.000).

## 5. Gaya Bahasa

- Kalimat pendek (≤ 15 kata), sapaan "kamu".
- Istilah konsisten: "bilangan negatif", "bilangan positif", "tanda kurung".
- Ungkapan sehari-hari boleh sebagai jembatan ("minus" = negatif), tetapi istilah resmi tetap diajarkan.
- Tokoh pemandu berbicara seperti teman sekelas yang lebih paham (GL01, GL04).

## 6. Referensi

- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science, 12*(2), 257–285.
- Sweller, J., van Merriënboer, J. J. G., & Paas, F. (2019). Cognitive architecture and instructional design: 20 years later. *Educational Psychology Review, 31*, 261–292.
- Paas, F. (1992). Training strategies for attaining transfer of problem-solving skill in statistics: A cognitive-load approach. *Journal of Educational Psychology, 84*(4), 429–434.
- Mayer, R. E. (2021). *Multimedia Learning* (3rd ed.). Cambridge University Press.
- Renkl, A., & Atkinson, R. K. (2003). Structuring the transition from example study to problem solving in cognitive skill acquisition. *Educational Psychologist, 38*(1), 15–22.
- Kalyuga, S. (2007). Expertise reversal effect and its implications for learner-tailored instruction. *Educational Psychology Review, 19*, 509–539.
- Polya, G. (1945). *How to Solve It*. Princeton University Press.
- OECD. (2023). *PISA 2022 Assessment and Analytical Framework*. OECD Publishing.

> Verifikasi kembali detail referensi (tahun, halaman, edisi) sebelum dimasukkan ke skripsi.
