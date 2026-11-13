# 08 — Rencana Evaluasi Produk

Penelitian pengembangan biasanya menilai produk dari tiga aspek: **kevalidan**, **kepraktisan**, dan **keefektifan** (Nieveen, 1999). Dokumen ini juga menambahkan pengukuran **beban kognitif** sesuai fokus penelitian.

## 1. Kevalidan — Validasi Ahli

| Validator | Jumlah | Aspek yang dinilai |
|-----------|--------|--------------------|
| Ahli materi (dosen pendidikan matematika / guru senior) | 2 | Kesesuaian dengan CP/TP, kebenaran konsep & jawaban, urutan materi, kualitas soal & umpan balik, kesesuaian dengan prinsip CLT, **kesesuaian soal literasi dengan indikator LM1–LM4, konteks, dan level kognitif AKM** |
| Ahli media (dosen TIK/media pembelajaran) | 2 | Tampilan, keterbacaan & kontras, navigasi, interaktivitas, kinerja di HP, kesederhanaan desain |

- Instrumen: skala Likert 1–4.
- Analisis: rata-rata skor / persentase. Contoh kriteria (sesuaikan dengan acuan dosen):

| Rentang persentase | Kategori |
|--------------------|----------|
| 81–100% | Sangat valid |
| 61–80% | Valid |
| 41–60% | Cukup valid |
| ≤ 40% | Kurang valid |

- Kesepakatan antarvalidator dapat diuji dengan **Aiken's V** atau **CVR** (pilih salah satu sesuai pedoman kampus).

## 2. Kepraktisan

| Tahap | Subjek | Cara |
|-------|--------|------|
| Uji perorangan (*one-to-one*) | 3 siswa (tinggi, sedang, rendah) | Siswa memakai aplikasi sambil berpikir keras (*think-aloud*); catat hambatan |
| Uji kelompok kecil | 6–10 siswa | Angket respons siswa + observasi |
| Guru | 1–2 guru | Angket respons guru |

Aspek angket siswa: kemudahan penggunaan, kejelasan materi, manfaat garis bilangan/contoh, kenyamanan tampilan, kemauan memakai lagi.

Pertimbangkan juga **System Usability Scale (SUS)** — 10 butir, sudah banyak dipakai dan tersedia versi Bahasa Indonesia; skor ≥ 68 dianggap di atas rata-rata.

## 3. Keefektifan

- **Desain:** *one group pretest–posttest* (minimal) atau *pretest–posttest control group* (lebih kuat, jika sekolah mengizinkan).
- **Subjek:** satu kelas (±30 siswa) kelas VII (sedang mempelajari materi) atau kelas IX (remedial/pengayaan).
- **Instrumen:** 10 soal paralel pretest & posttest (lihat dokumen 04 bagian 5), diuji validitas butir & reliabilitas (Cronbach's α / KR-20) terlebih dahulu.
- **Analisis:**
  - Uji normalitas → *paired t-test* (normal) atau *Wilcoxon* (tidak normal).
  - **N-gain** (Hake): g = (posttest − pretest) / (100 − pretest); kategori tinggi ≥ 0,7; sedang 0,3–0,7; rendah < 0,3.
  - Analisis per jenis soal (Level 1/2/3) dan per kode miskonsepsi (dari log aplikasi).

### 3.1 Keefektifan terhadap Literasi Matematika

- **Instrumen:** tes literasi matematika (2 stimulus paralel untuk pretest dan posttest, 8 butir; kisi-kisi di dokumen 04 bagian 5), divalidasi ahli dan diuji reliabilitasnya.
- **Penilaian:** butir objektif dinilai otomatis; butir uraian dinilai dengan rubrik 0–3 (dokumen 09 bagian 6) oleh **dua penilai** — kesepakatan antarpenilai dihitung dengan *Cohen's kappa* atau persentase kesepakatan.
- **Analisis:**
  - Uji beda pretest–posttest (paired t-test / Wilcoxon) dan **N-gain** skor literasi total.
  - N-gain **per indikator** LM1–LM4 untuk melihat proses mana yang paling/kurang berkembang.
  - Kategori kemampuan literasi (mis. tinggi/sedang/rendah) berdasarkan persentase skor; sesuaikan dengan acuan kampus.
  - Data pendukung dari log: profil literasi (F22) dan ketepatan pilihan alasan (F18).
- **Opsional (kualitatif):** wawancara 3 siswa setelah posttest untuk melihat perubahan cara mereka membaca stimulus dan memeriksa jawaban — dibandingkan dengan temuan EL01, EL05, GL02.

## 4. Pengukuran Beban Kognitif

| Instrumen | Kapan | Keterangan |
|-----------|-------|-----------|
| **Skala Paas** (1 butir, 9 poin: "sangat-sangat ringan" s.d. "sangat-sangat berat") | Setelah setiap modul (terintegrasi di aplikasi, F13) | Mengukur usaha mental keseluruhan |
| **Kuesioner Leppink dkk. (2013)** — 10 butir untuk IL, EL, GL | Setelah sesi uji coba | Memisahkan tiga jenis beban; perlu adaptasi & validasi bahasa |
| Data log aplikasi | Otomatis | Waktu per soal, petunjuk dibuka, kartu aturan tanda dibuka |

**Efisiensi instruksional** (Paas & van Merriënboer, 1993) dapat dihitung:
E = (Z_kinerja − Z_beban) / √2
Nilai positif berarti kinerja tinggi dengan beban rendah.

**Hipotesis yang diharapkan:**
- EL rendah (tampilan sederhana, visual, tempo mandiri).
- GL meningkat (contoh bertahap, penjelasan diri).
- Skor Paas untuk tipe soal yang sama menurun dari latihan awal ke latihan akhir, seiring terbentuknya skema.
- Skor Paas pada Tantangan Literasi lebih tinggi daripada latihan prosedural (wajar karena interaktivitas elemen tinggi), tetapi tetap ≤ 6 dan menurun dari M0 ke M7 — menandakan dukungan bertahap berhasil mengelola beban sambil mengembangkan literasi.

## 4b. Alat Analisis Data

Seluruh perhitungan di atas dibuat sebagai skrip **Python** di folder `analisis/` (lihat [06-ARSITEKTUR-TEKNIS.md](06-ARSITEKTUR-TEKNIS.md) §8), sehingga analisis dapat diulang dan diperiksa:

| Analisis | Skrip |
|----------|-------|
| Kevalidan (rata-rata, persentase, Aiken's V) | `validasi_ahli.py` |
| Kepraktisan (angket, SUS) | `sus.py` |
| Reliabilitas instrumen (KR-20 / Cronbach's α) | `reliabilitas.py` |
| Keefektifan (normalitas, uji-t / Wilcoxon, N-gain total & per LM) | `uji_statistik.py`, `ngain.py` |
| Kesepakatan penilai rubrik (Cohen's kappa) | `kappa.py` |
| Beban kognitif & efisiensi instruksional | `beban_kognitif.py` |

Hasil skrip sebaiknya dicocokkan sekali dengan perhitungan manual atau SPSS/Excel pada data kecil, untuk memastikan kebenaran sebelum dipakai di skripsi.

## 5. Siklus Revisi

```
Validasi ahli → Revisi I → Uji perorangan → Revisi II → Uji kelompok kecil → Revisi III → Uji lapangan → Produk final
```

Setiap revisi dicatat dalam tabel: **masukan – sumber – tindakan – status**.

## 6. Etika Penelitian

- Izin sekolah dan persetujuan orang tua/wali (siswa di bawah umur).
- Identitas siswa memakai kode (S01, S02, …); foto wajah siswa sebaiknya **disamarkan** dalam laporan publik (catatan: laporan wawancara S01 saat ini memuat foto wajah siswa — pertimbangkan diburamkan sebelum dipublikasikan).
- Data disimpan aman dan hanya dipakai untuk penelitian.

## 7. Referensi

- Nieveen, N. (1999). Prototyping to reach product quality. In J. van den Akker et al. (Eds.), *Design Approaches and Tools in Education and Training*. Kluwer.
- Paas, F., & van Merriënboer, J. J. G. (1993). The efficiency of instructional conditions: An approach to combine mental effort and performance measures. *Human Factors, 35*(4), 737–743.
- Leppink, J., Paas, F., van der Vleuten, C. P. M., van Gog, T., & van Merriënboer, J. J. G. (2013). Development of an instrument for measuring different types of cognitive load. *Behavior Research Methods, 45*, 1058–1072.
- Hake, R. R. (1998). Interactive-engagement versus traditional methods. *American Journal of Physics, 66*(1), 64–74.
- Brooke, J. (1996). SUS: A "quick and dirty" usability scale. In *Usability Evaluation in Industry*. Taylor & Francis.
- Aiken, L. R. (1985). Three coefficients for analyzing the reliability and validity of ratings. *Educational and Psychological Measurement, 45*, 131–142.

> Verifikasi kembali detail referensi sebelum dimasukkan ke skripsi.
