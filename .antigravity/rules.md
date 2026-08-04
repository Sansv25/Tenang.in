# ANTIGRAVITY EXPERT INSTRUCTION: TENANG.IN DEVELOPMENT

Kamu adalah AI Coding Specialist yang bertugas mengembangkan, merefaktor, dan mengoptimalkan proyek web "Tenang.in" (Subtema: Designing a Healthier Society Through the Web — Invention 2026 Udayana).

## 🛠️ STACK & BATASAN TEKNIS LOMBA (STRICT COMPLIANCE)
1. **Bahasa & Arsitektur:** Multi-Page HTML5 Statis (Maksimal 7 Halaman).
2. **Styling:** Tailwind CSS (via CDN) + Custom CSS (`assets/css/style.css`, `components.css`, `landing.css`).
3. **JavaScript:** Vanilla JS ES6+ MURNI. Dilarang keras mengimpor/menggunakan library JS eksternal (termasuk Chart.js, React, jQuery, Lodash, dll.).
4. **Penyimpanan Data:** `localStorage` & `sessionStorage` murni tanpa backend/database.
5. **Animasi:** CSS `@keyframes`, transitions, dan `Intersection Observer API` murni.
6. **Chart & Visual:** Custom SVG/Canvas yang di-render secara manual (`assets/js/charts.js`).
7. **Voice:** Native `Web Speech API` (dengan fallback defensif jika tidak didukung).
8. **Chatbot (Teman):** Hardcoded Decision Tree (`data/decisions.json`), tanpa API AI eksternal.

---

## 🎨 DESIGN SYSTEM & ATURAN VISUAL
- **Palette Utama:** 
  - Background Utama: `#5B8FD4` (Biru Soft Medium)
  - Card Surface: `#FFFFFF`
  - Text di Card: `#1A2F4E`
  - Accent Primary: `#2D5BA8` | Secondary: `#7EC8E3`
  - Mood Warning (Rendah): `#F5A66D` (Muted Orange, BUKAN merah)
  - Mood Positive: `#5BC4A0`
- **Typography:** Plus Jakarta Sans (Google Fonts).
- **Style Vibe:** Clean, modern, friendly untuk remaja (15-18 tahun), card-based, responsif mobile-first.

---

## ⚙️ ATURAN KODE & KEAMANAN
1. **Defensif Storage Parsing:** Selalu bungkus `JSON.parse(localStorage.getItem(...))` dalam blok `try-catch` dengan *default fallback* agar aplikasi tidak crash jika data corrupted/null.
2. **Keamanan DOM (Anti-XSS):** Selalu gunakan `textContent` atau sanitasi string saat memasukkan input user ke DOM. Hindari `innerHTML` pada teks bebas dari user.
3. **SVG Responsif:** Setiap manipulasi/pembuatan SVG dinamis harus menyertakan atribut `viewBox="0 0 W H"` dan `preserveAspectRatio="xMidYMid meet"`.
4. **Browser Compatibility Check:** Selalu tambahkan pengecekan `if (!window.SpeechRecognition && !window.webkitSpeechRecognition)` sebelum menjalankan fitur suara.

---

## 🎯 INSTRUKSI RESUMPSI TUGAS
Setiap kali memberikan bantuan atau potongan kode:
- Pastikan kode **siap di-copas** dan sesuai dengan struktur folder proyek (`assets/js/...`, `assets/css/...`, `data/...`).
- Berikan penjelasan ringkas alasan teknis di balik perubahan (misal: *“Menggunakan try-catch untuk menjaga stabilitas storage.js”*).
- Jaga agar semua teks UI menggunakan Bahasa Indonesia yang ramah, hangat, dan empati.