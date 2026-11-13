# 05 — Desain UI/UX

## 1. Prinsip Desain

Diturunkan dari saran siswa (DS03, EL02, EL04) dan prinsip CLT:

1. **Satu layar, satu tujuan.** Tidak menampilkan materi, soal, dan menu sekaligus.
2. **Tenang dan bersih.** Tanpa ilustrasi dekoratif, latar bermotif, atau animasi yang tidak menjelaskan materi.
3. **Kontras tinggi.** Teks selalu di atas latar polos dengan rasio kontras ≥ 4,5:1 (teks besar ≥ 3:1).
4. **Siswa memegang kendali.** Semua perpindahan lewat tombol; tidak ada auto-play.
5. **Konsisten.** Posisi tombol Lanjut, Kembali, Petunjuk, dan Aturan Tanda selalu sama.
6. **Warna bukan satu-satunya penanda.** Benar/salah selalu disertai ikon (✓/✗) dan teks.
7. **Ramah HP murah.** Desain *mobile-first* untuk layar 360×640 dp, lalu menyesuaikan ke tablet/desktop.

## 2. Palet Warna

| Token | Warna | Hex | Penggunaan |
|-------|-------|-----|-----------|
| `bg` | Putih tulang | `#FAFAF7` | Latar utama |
| `surface` | Putih | `#FFFFFF` | Kartu |
| `text` | Abu sangat gelap | `#1F2328` | Teks utama (kontras ~15:1 pada `bg`) |
| `text-muted` | Abu gelap | `#57606A` | Teks sekunder (kontras ~6:1) |
| `primary` | Biru tua | `#1D4ED8` | Tombol utama, tautan |
| `positive` | Biru | `#2563EB` | Bilangan/arah **positif** di garis bilangan |
| `negative` | Oranye tua | `#C2410C` | Bilangan/arah **negatif** di garis bilangan |
| `highlight` | Kuning lembut | `#FEF3C7` | Sorotan bagian yang dikerjakan / penanda soal cerita |
| `success` | Hijau tua | `#15803D` | Umpan balik benar (+ ikon ✓) |
| `error` | Merah tua | `#B91C1C` | Umpan balik salah (+ ikon ✗) |

Catatan:
- Pasangan **biru (positif) – oranye (negatif)** dipilih agar tetap dapat dibedakan oleh siswa dengan buta warna merah-hijau. Tanda "+"/"−" tetap selalu ditulis.
- Periksa ulang kontras dengan alat seperti WebAIM Contrast Checker setelah implementasi.
- Mode gelap: P2 (opsional).

## 3. Tipografi

- Font: **Lexend** atau **Atkinson Hyperlegible** (dirancang untuk keterbacaan) — keduanya gratis di Google Fonts. Simpan lokal agar bekerja *offline*.
- Ukuran dasar 16–18 px; ekspresi matematika 24–32 px.
- Gunakan karakter minus asli `−` (U+2212), bukan tanda hubung `-`, agar tanda negatif terlihat jelas. Tanda kali `×` (U+00D7).
- Angka *tabular* agar baris pengerjaan sejajar.

## 4. Komponen Utama

| Komponen | Deskripsi |
|----------|-----------|
| `KartuMateri` | Judul pendek, maks. ±40 kata, satu visual, tombol Lanjut/Kembali |
| `GarisBilangan` | SVG responsif; panah berwarna; langkah dijalankan via tombol |
| `TabelPola` | Tabel yang barisnya muncul satu per satu |
| `LangkahPengerjaan` | Ekspresi bertingkat, bagian aktif disorot `highlight` |
| `InputJawaban` | Papan angka khusus (0–9, −, hapus) agar siswa tidak perlu mencari tanda minus di keyboard HP |
| `PanelUmpanBalik` | Muncul dari bawah; ikon + teks singkat + tombol "Coba lagi" / "Lihat petunjuk" |
| `TombolPetunjuk` | Petunjuk berjenjang 1 → 2 → pembahasan |
| `TombolAturanTanda` | Tombol mengambang ±; membuka lembar bawah berisi tabel aturan tanda |
| `PenandaTeks` | Kalimat soal cerita yang dapat diketuk untuk disorot |
| `FormSoalCerita` | Stepper 5 tahap |
| `SkalaBeban` | Skala 1–9 dengan label ujung "sangat-sangat ringan" – "sangat-sangat berat" |
| `PemanduSebaya` | Avatar statis + gelembung teks |
| `PanelStimulus` | Menampilkan stimulus literasi (teks per kalimat, tabel sederhana); dapat diciutkan/dibuka saat menjawab agar stimulus dan soal tidak terpisah halaman |
| `GlosariumKonteks` | Istilah bergaris bawah titik-titik; diketuk → arti singkat di lembar bawah |
| `KartuStrategiStimulus` | 5 pertanyaan pemandu membaca stimulus; tombol tetap seperti Aturan Tanda |
| `SoalPGKompleks` | Daftar pernyataan dengan pilihan Benar/Salah atau kotak centang "pilih semua yang benar" |
| `SoalMenjodohkan` | Ketuk item kiri lalu item kanan (bukan seret, agar mudah di HP) |
| `PilihAlasan` | Klaim tokoh + Benar/Salah + pilihan alasan + kolom penjelasan opsional |
| `ProfilLiterasi` | Empat batang horizontal LM1–LM4 dengan label teks (tanpa grafik rumit) |

## 5. Peta Layar

```
Splash
 └─ Onboarding (3 layar: tujuan, cara pakai, isi kode siswa)
     └─ Tes Prasyarat → Pretest
         └─ BERANDA (peta modul M0–M7, progres)
              ├─ Modul ▸ Ringkasan (kartu) ▸ Contoh ▸ Latihan ▸ Tantangan Literasi ▸ Refleksi
              ├─ M7 Bilangan Bulat di Sekitar Kita ▸ Contoh literasi ▸ Stimulus A, B, C, D …
              ├─ Garis Bilangan "Coba Sendiri"
              ├─ Kartu Aturan Tanda
              ├─ Progres Saya
              └─ Pengaturan (ukuran huruf, suara, kode siswa, gabung kelas, status sinkron, ekspor data)

DASBOR GURU (web, /guru)
 └─ Login
     └─ Daftar Kelas (+ buat kelas → kode kelas)
         └─ Ringkasan Kelas
              ├─ Progres per modul & skor tes
              ├─ Miskonsepsi tersering
              ├─ Profil literasi LM1–LM4 & skor beban kognitif
              ├─ Penilaian Uraian (rubrik 0–3)
              └─ Unduh data (CSV/XLSX)
         └─ Posttest + Tes Literasi → Angket → Selesai
```

## 6. Wireframe (Kasar)

### 6.1 Kartu Materi
```
┌──────────────────────────────┐
│ ← M3 Perkalian        2 / 5  │
├──────────────────────────────┤
│                              │
│  Perkalian = tambah berulang │
│                              │
│  4 × (−3)                    │
│  = (−3)+(−3)+(−3)+(−3)       │
│                              │
│  ◄──┬──┬──┬──┬──┬──┬──┬──►   │
│   −12  −9  −6  −3   0        │
│   ↶   ↶   ↶   ↶              │
│                              │
│ 🙂 "Lompat 3 ke kiri,        │
│     sebanyak 4 kali!"        │
├──────────────────────────────┤
│ [ Kembali ]     [ Lanjut → ] │
└──────────────────────────────┘
```

### 6.2 Penyelesai Operasi Campuran
```
┌──────────────────────────────┐
│ ← Latihan L2-02        [±]   │
├──────────────────────────────┤
│ Ketuk bagian yang dikerjakan │
│ lebih dulu:                  │
│                              │
│   15 − (−5) × 3 + 10         │
│        └──────┘ ← disorot    │
│                              │
│   (−5) × 3 = [    ]          │
│                              │
│ ① Kurung ② ×,: ③ +,−         │
├──────────────────────────────┤
│ [💡 Petunjuk]    [ Periksa ] │
└──────────────────────────────┘
```

### 6.3 Soal Cerita — Tahap 1 (Diketahui)
```
┌──────────────────────────────┐
│ ← Soal Cerita  ●○○○○  1/5    │
├──────────────────────────────┤
│ Ketuk informasi penting:     │
│                              │
│ Es batu bersuhu [−6 °C].     │
│ Diletakkan di ruang terbuka. │
│ Suhu naik [2 °C] setiap      │
│ [3 menit].                   │
│ Berapa suhu setelah          │
│ [15 menit]?                  │
│                              │
│ Diketahui:                   │
│ • suhu awal  = −6 °C         │
│ • kenaikan   = 2 °C / 3 menit│
│ • waktu      = 15 menit      │
├──────────────────────────────┤
│ [💡 Petunjuk]   [ Lanjut → ] │
└──────────────────────────────┘
```

### 6.4 Tantangan Literasi — Benar atau Salah? Jelaskan!
```
┌──────────────────────────────┐
│ ← Literasi M0  Butir 3/3 [?] │
├──────────────────────────────┤
│ ▼ Stimulus: Suhu Empat Kota  │
│ ┌──────┬────────┬─────────┐  │
│ │ Kota │Terendah│Tertinggi│  │
│ │  A   │  −12   │   −3    │  │
│ │  D   │   −7   │    3    │  │
│ └──────┴────────┴─────────┘  │
│                              │
│ 🙂 Rina: "Kota A paling      │
│ dingin karena 12 > 7."       │
│                              │
│ Alasan Rina:  ( ) Tepat      │
│               ( ) Kurang tepat│
│ Pilih alasanmu:              │
│ ( ) −12 di kiri −7 pada garis│
│     bilangan                 │
│ ( ) 12 lebih besar dari 7    │
│ ( ) Kota A ada di utara      │
├──────────────────────────────┤
│ [💡 Petunjuk]    [ Periksa ] │
└──────────────────────────────┘
```

## 7. Aksesibilitas (Checklist)

- [ ] Kontras teks ≥ 4,5:1, elemen UI ≥ 3:1
- [ ] Area sentuh ≥ 44×44 px
- [ ] Ukuran huruf dapat diperbesar (Pengaturan) tanpa merusak tata letak
- [ ] Semua visual punya teks alternatif / deskripsi
- [ ] Dapat dioperasikan dengan keyboard di versi web
- [ ] Menghormati pengaturan "kurangi gerakan" (`prefers-reduced-motion`)
- [ ] Suara (jika ada) opsional dan default mati

## 8. Gamifikasi (Minimal)

Untuk menghindari beban ekstrinsik, hanya:
- Progres per modul (lingkaran/garis).
- Bintang 1–3 per subbab berdasarkan penguasaan.
- Tanpa papan peringkat, poin berkedip, atau efek suara mencolok.
