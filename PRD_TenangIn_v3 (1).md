# Product Requirements Document (PRD)
# Tenang.in — Versi 3.0

**Subtema:** Designing a Healthier Society Through the Web
**Lomba:** Web Design INVENTION 2026 — Universitas Udayana
**AI Companion:** Teman

---

## 1. Latar Belakang

Kesehatan mental remaja menjadi isu signifikan pasca pandemi. Banyak remaja tidak menyadari kondisi emosional mereka sampai menumpuk, dan tidak tahu harus mulai dari mana. Tenang.in hadir sebagai ruang digital yang membantu remaja mengenali pola emosi, merefleksikan diri, dan merasa tidak sendirian — tanpa mengklaim menggantikan psikolog profesional.

---

## 2. Tujuan Produk

- Membantu remaja refleksi diri harian secara konsisten
- Memberikan insight personal berbasis pola data mood
- Menyajikan tips kesehatan mental dipersonalisasi berdasarkan tipe kepribadian
- Mengarahkan ke bantuan profesional saat dibutuhkan

---

## 3. Target Pengguna

**Primary:** Pelajar SMA/SMK usia 15-18 tahun di Indonesia
**Konteks:** Mobile-first, optimal juga di desktop

---

## 4. Batasan Teknis (Sesuai Ketentuan Lomba)

| Aspek | Ketentuan |
|---|---|
| Jumlah halaman | 7 halaman maksimal |
| CSS Framework | Tailwind CSS via CDN |
| JS | Vanilla JS ES6+ murni (tanpa library eksternal) |
| Tipe Website | Statis, di-hosting |
| Penyimpanan | localStorage + sessionStorage |
| Animasi | CSS Keyframes + Intersection Observer API |
| Chart | Custom SVG/Canvas manual |
| Voice | Web Speech API native |
| AI/Chatbot | Decision tree hardcoded, tanpa API eksternal |

---

## 5. Struktur Navigasi (7 Halaman)

1. **Landing Page** (`landing.html`)
2. **Home/Beranda** (`index.html`)
3. **Mood Tracker** (`mood-tracker.html`)
4. **Ruang Jurnal** (`jurnal.html`)
5. **Kenali Dirimu** (`kenali.html`)
6. **Profil** (`profil.html`)
7. **Dashboard** (`dashboard.html`)

**Dihapus:** Halaman Teman (jadi floating popup), Ruang Cerita

**Global (semua halaman kecuali Landing):**
- Navbar/bottom nav responsif
- Floating Teman button → popup chat overlay
- Footer dengan Direktori Bantuan + disclaimer

---

## 6. Design System

### 6.1 Arah Visual

**Style:** Biru soft modern — background biru medium sebagai base, elemen putih di atasnya. Clean, fresh, premium tapi tetap hangat untuk remaja.

**Vibe per halaman:**
- Landing Page: animasi hidup, headline dinamis, gradient bergerak, scroll-triggered — terasa produk digital premium
- Home & Dashboard: card-based, greeting personal, visual mood besar
- Kenali Dirimu & Profil: satu pertanyaan per layar, tombol pilihan besar, onboarding feel

### 6.2 Color Palette

| Elemen | Hex | Keterangan |
|---|---|---|
| Background utama | `#5B8FD4` | Biru soft medium |
| Background section gelap | `#3D6BAF` | Variasi section |
| Card surface | `#FFFFFF` | Putih bersih di atas biru |
| Card subtle | `#F0F5FF` | Putih kebiruan sekunder |
| Primary accent | `#2D5BA8` | Tombol utama |
| Primary hover | `#1E4A8F` | Hover/pressed |
| Secondary accent | `#7EC8E3` | Highlight/biru muda |
| Teks di biru | `#FFFFFF` | Di atas background biru |
| Teks di putih | `#1A2F4E` | Di dalam card putih |
| Teks sekunder | `#6B8DB5` | Caption/label |
| Sukses/positif | `#5BC4A0` | Mood baik |
| Warning/mood rendah | `#F5A66D` | Oranye muted, bukan merah |
| Gradient hero | `#4A7EC7` → `#2D5BA8` | Hero section |

### 6.3 Tipografi

- **Font:** Plus Jakarta Sans (Google Fonts CDN)
- H1 Hero: 40-48px, bold, putih
- H2 Section: 24-32px, semibold
- H3 Card: 18-20px, semibold
- Body: 16px, regular, line-height 1.6
- Caption: 13-14px, secondary

### 6.4 Animasi (Vanilla JS + CSS Only)

| Animasi | Implementasi |
|---|---|
| Hero gradient bergerak | CSS `@keyframes` background-position |
| Headline teks berganti | Vanilla JS interval + CSS fade |
| Scroll-triggered reveal | Intersection Observer API |
| Horizontal marquee | CSS `@keyframes translateX` infinite |
| Welcome screen fade | CSS opacity + sessionStorage flag |
| Micro-celebration | CSS confetti + vanilla JS trigger |
| Slide kuis per pertanyaan | CSS transform transition |

---

## 7. Sistem Global

### 7.1 Welcome Screen

- Full-screen overlay, sekali per sesi (sessionStorage)
- Logo "Tenang.in" + tagline animasi fade-in + scale
- Background: gradient biru animated
- Durasi 2.5 detik → auto fade-out ke Landing Page
- Tidak ada tombol/interaksi

### 7.2 Floating Teman Chat

**Mekanisme (Decision Tree tanpa API):**
- User hanya klik pilihan, tidak ketik bebas
- Alur dari `data/decisions.json`
- Konteks mood localStorage mempengaruhi pembuka percakapan
- Voice-to-text: Web Speech API, fallback toast jika tidak support
- Disclaimer: "Teman membantu refleksi, bukan pengganti konsultasi profesional"

### 7.3 Mood Context Engine (storage.js)

- `getMoodToday()` — mood hari ini
- `getMoodHistory(n)` — n hari terakhir
- `getDominantTag()` — tag dominan saat mood rendah
- `getUserType()` — tipe diri dari Profil
- `getStreak()` — streak check-in berturut

### 7.4 First Time Journey

- Deteksi user baru: `localStorage.getItem('isReturning')`
- User baru: spotlight ke check-in emoji → nudge ke Profil
- Selesai Profil: `isReturning = true`

### 7.5 Micro-Celebration System

| Pencapaian | Animasi |
|---|---|
| Check-in pertama | Toast + confetti CSS |
| Streak 3 hari | Toast "3 hari berturut! 🔥" |
| Streak 7 hari | Full-screen moment 2 detik |
| Jurnal pertama | Pesan Teman di floating chat |
| Profil selesai | Reveal tipe diri dengan animasi |

---

## 8. Spesifikasi Per Halaman

### 8.1 Landing Page

**Animasi yang harus terasa hidup:**
- Gradient biru animated terus-menerus di background
- Headline dinamis berganti: "Kenali Dirimu" → "Cerita Perasaanmu" → "Kamu Tidak Sendirian"
- Elemen reveal saat scroll (Intersection Observer)
- Marquee horizontal: "Tenang.in · Ruang Amanmu · Bareng Teman · 100% Privat · Gratis ·"
- Floating particles CSS sederhana di hero

**Section (scroll panjang):**

Hero → Marquee strip → Statistik (3 angka besar) → Fitur Unggulan (card grid) → Cara Kerja (3 langkah) → Perkenalan Teman → Footer

**CTA utama:** "Mulai Sekarang" → index.html

---

### 8.2 Home/Beranda

**Section:**
- Header: greeting + avatar + notifikasi
- Daily check-in emoji (modal, sekali per hari)
- Quick access cards 2 kolom: Mood Tracker, Jurnal, Kenali Dirimu, Dashboard
- Streak & progress bar
- Tips harian kontekstual (dari getDominantTag)
- Nudge ke Profil untuk user baru

---

### 8.3 Mood Tracker

**Fitur:**
- Form check-in: emoji + tag multi-select + catatan
- Line chart SVG 7 hari (custom, tanpa library)
- Contribution grid (kotak warna per hari)
- Insight rule-based dari tag dominan
- Popup kontekstual saat mood ≤ 2

---

### 8.4 Ruang Jurnal

**Fitur:**
- 15 prompt harian dari `data/prompts.json` (rotasi + personalisasi mood)
- Textarea + tag mood chip + counter karakter
- Riwayat jurnal: card list → modal baca penuh
- Hapus entri dengan konfirmasi

---

### 8.5 Kenali Dirimu

**Kuis 2 dimensi (10-12 pertanyaan, satu per layar):**
- Dimensi 1: Introvert ↔ Ekstrovert
- Dimensi 2: Thinker ↔ Feeler
- Animasi slide per pertanyaan
- Progress bar di atas

**4 Tipe Hasil:**

| Tipe | Karakter |
|---|---|
| 🌙 Pemikir Tenang (I+T) | Introvert + Thinker — analitis, suka kedalaman |
| 💙 Perasa Mendalam (I+F) | Introvert + Feeler — empatik, sensitif |
| ⚡ Pemimpin Aktif (E+T) | Ekstrovert + Thinker — tegas, problem-solver |
| 🌟 Jiwa Sosial (E+F) | Ekstrovert + Feeler — hangat, ekspresif |

**Halaman Hasil:**
- Nama tipe + deskripsi karakter
- Progress bar 2 dimensi (SVG custom)
- 5 tips spesifik per tipe
- Tombol "Bagikan Hasilku" + "Ulangi Kuis"

---

### 8.6 Profil

**Kuis 7 pertanyaan preferensi gaya refleksi (berbeda dari Kenali Dirimu)**

**4 Tipe Diri (preferensi, bukan kepribadian):**

| Tipe | Dampak |
|---|---|
| 🌙 Reflektif Malam | Quote malam, prompt filosofis |
| ☀️ Aktif Pagi | Quote semangat pagi, tips rutinitas |
| 💬 Ekspresif | Teman lebih sering buka percakapan |
| 🎯 Terstruktur | Dashboard prominent, tips produktivitas |

- Accent color berubah per tipe via CSS `--accent-color`
- Profil card: nama opsional, tipe, tanggal bergabung, rekomendasi fitur

---

### 8.7 Dashboard

**Quote harian rule-based** (dari kombinasi mood + tag + streak + tipe)

**Ringkasan:**
- Mini SVG chart 7 hari
- Statistik: streak, total jurnal, sesi Teman, mood rata-rata

**Badge:**
- 🌱 Langkah Pertama
- 🔥 3 Hari Berturut
- ⭐ 7 Hari Konsisten
- 📖 Penulis Pemula (5 jurnal)
- 📚 Penulis Aktif (15 jurnal)
- 🎯 Sudah Kenal Diri (Profil selesai)
- 🧠 Sudah Kenali Dirimu (kuis Kenali selesai)

---

## 9. Tips per Tipe Kepribadian

### 🌙 Pemikir Tenang
1. Arahkan overthinking dengan journaling terstruktur
2. Buat daftar kekhawatiran — tandai yang bisa dikontrol
3. Waktu sendiri adalah cara mengisi ulang energi, bukan anti-sosial
4. Teknik "worry window": 10 menit khusus untuk khawatir, lalu tutup
5. Kamu tidak harus punya jawaban untuk semua hal

### 💙 Perasa Mendalam
1. Perasaanmu yang dalam adalah kekuatan, bukan kelemahan
2. Teknik grounding 5-4-3-2-1 saat emosi overwhelming
3. Batasi waktu scrolling — konten orang lain mempengaruhi mood tanpa disadari
4. Self-compassion: perlakukan dirimu seperti sahabat terbaikmu
5. Tidak semua perasaan perlu dibagikan — jurnal untuk memproses dulu

### ⚡ Pemimpin Aktif
1. Ubah kecemasan jadi langkah konkret sekecil apapun
2. Istirahat aktif lebih cocok: jalan kaki, olahraga ringan
3. Bilang tidak adalah skill produktivitas, bukan kelemahan
4. Jadwalkan waktu diam — otak aktif juga butuh jeda
5. Energimu besar — isi ulang dengan tidur cukup dan makan bergizi

### 🌟 Jiwa Sosial
1. Kamu mudah merasakan emosi orang lain — jangan sampai menyerap beban mereka
2. Bedakan empati vs mengambil alih beban orang lain
3. Tarik napas sebelum bereaksi terhadap situasi emosional
4. Kamu tidak harus selalu jadi "penyemangat" — kamu juga berhak lelah
5. Pilih circle yang memberi energi, bukan hanya menguras energimu

---

## 10. Struktur Direktori

```
tenang-in/
│
├── landing.html
├── index.html
├── mood-tracker.html
├── jurnal.html
├── kenali.html
├── profil.html
├── dashboard.html
│
├── assets/
│   ├── css/
│   │   ├── style.css          # Global CSS + CSS variables
│   │   ├── components.css     # Card, chat bubble, badge, modal
│   │   └── landing.css        # Animasi khusus landing
│   │
│   ├── js/
│   │   ├── main.js            # Global: navbar, welcome screen, floating Teman
│   │   ├── storage.js         # Mood Context Engine
│   │   ├── teman-chat.js      # Decision tree Teman
│   │   ├── animations.js      # Intersection Observer + micro-celebration
│   │   ├── charts.js          # Custom SVG chart generator
│   │   ├── landing.js         # Animasi landing page
│   │   ├── home.js
│   │   ├── mood-tracker.js
│   │   ├── jurnal.js
│   │   ├── kenali.js
│   │   ├── profil.js
│   │   └── dashboard.js
│   │
│   ├── images/
│   │   ├── logo/
│   │   ├── icons/
│   │   └── illustrations/
│   │
│   └── data/
│       ├── prompts.json
│       ├── quiz-kenali.json
│       ├── quiz-profil.json
│       ├── decisions.json
│       └── tips.json
│
└── README.md
```

---

## 11. Teknologi

| Kategori | Teknologi |
|---|---|
| Markup | HTML5 semantic |
| Styling | Tailwind CSS CDN + Custom CSS |
| Interaktivitas | Vanilla JavaScript ES6+ |
| Animasi | CSS Keyframes + Intersection Observer |
| Chart | Custom SVG manual |
| Voice | Web Speech API |
| Chatbot | Decision tree hardcoded |
| Penyimpanan | localStorage + sessionStorage |
| Font | Plus Jakarta Sans (Google Fonts CDN) |
| Hosting | GitHub Pages / Netlify / Vercel |

---

## 12. Checklist Compliance Lomba

- [x] Website statis
- [x] 7 halaman
- [x] Bahasa utama Indonesia
- [x] Tailwind CSS via CDN
- [x] Tidak ada JS library selain yang diizinkan
- [x] Responsif mobile + desktop
- [x] Aset visual open license
- [ ] Hosting online — saat submit
- [ ] Survei 20-30 responden nyata
- [ ] Lembar orisinalitas materai Rp10.000

---

## 13. Validasi & Riset

- Survei 20-30 pelajar SMA/SMK (wajib, bukan AI)
- Pertanyaan: kebiasaan refleksi, hambatan bercerita, tools yang dipakai, fitur dibutuhkan
- User testing 3-5 orang sebelum submit
- Hasil untuk bagian "Survei & Uji Coba Pengguna" di proposal



npx -y serve -l 5500