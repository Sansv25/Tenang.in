# AI Execution Brief — Tenang.in
## Perbaikan Performa/Aksesibilitas Landing Page + Cleanup Inline Event Handler

**Konteks proyek:** Tenang.in, static website (HTML + Tailwind CSS via CDN + Vanilla JS, tanpa framework/library JS lain selain jQuery bila dipakai) untuk lomba Web Design INVENTION 2026. Repo: https://github.com/Sansv25/Tenang.in

**Kenapa ini dikerjakan:** Dua temuan review sebelum submission:
1. Landing page (`index.html`) terlalu berat secara visual (banyak animasi dekoratif) dan berpotensi gagal kontras warna WCAG — berisiko menurunkan skor kriteria "UX dan Accessibility" (bobot 20%: responsif 15% + dapat diakses semua kalangan 5%).
2. Banyak inline `onclick="..."` tersebar di HTML di berbagai halaman — berisiko menurunkan skor kriteria "Clean code" (bobot 5%: kerapihan file dan struktur kode).

Kerjakan dua task di bawah secara terpisah dan berurutan. Jangan mengubah desain visual, copy/teks, struktur section, atau fitur yang sudah ada — ini murni perbaikan performa, aksesibilitas, dan kerapihan kode.

---

## TASK 1 — Performa & Aksesibilitas Landing Page (`index.html`)

### 1.1 Hormati `prefers-reduced-motion`
Tambahkan media query di `assets/css/landing.css` (atau file CSS terkait animasi lain seperti `style.css`, `components.css`) yang menonaktifkan/menyederhanakan animasi berikut ketika user mengaktifkan reduced motion di OS/browser mereka:
- Cloud SVG bergerak (`.cloud`, `.cloud-1/2/3`, showcase clouds)
- Floating particles (`.particle`)
- Aurora canvas (`#auroraCanvas`) dan calm particles canvas (`#calmParticles`)
- Marquee horizontal (`.marquee-track`)
- Fireflies (`.firefly`)
- Interactive hero title state-switch animation
- Micro-celebration confetti

Contoh pola yang harus diterapkan (sesuaikan nama class/selector asli di file):

```css
@media (prefers-reduced-motion: reduce) {
  .cloud, .particle, .firefly, .marquee-track,
  #auroraCanvas, #calmParticles {
    animation: none !important;
    transform: none !important;
  }
  .marquee-track { animation-play-state: paused; }
}
```

Untuk canvas JS (aurora, calm particles), tambahkan pengecekan di file JS terkait sebelum menjalankan animation loop:

```js
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!prefersReducedMotion) {
  // jalankan requestAnimationFrame loop seperti biasa
} else {
  // render 1 frame statis saja, jangan looping
}
```

### 1.2 Lazy-init elemen dekoratif berat
Elemen canvas (`#auroraCanvas`, `#calmParticles`) dan floating particles JANGAN langsung jalan saat `DOMContentLoaded`. Gunakan `IntersectionObserver` supaya animasi baru mulai render ketika section-nya benar-benar masuk viewport, dan berhenti (pause loop) saat section keluar viewport untuk hemat CPU/battery di HP low-end.

Pola yang harus diterapkan pada file JS yang menginisialisasi canvas tersebut:

```js
const target = document.querySelector('#features'); // section pemilik canvas
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      startAuroraAnimation();
    } else {
      stopAuroraAnimation();
    }
  });
}, { threshold: 0.1 });
observer.observe(target);
```

`startAuroraAnimation`/`stopAuroraAnimation` harus start/cancel `requestAnimationFrame` loop yang sudah ada, bukan fungsi baru dari nol — refactor minimal dari kode yang sudah berjalan.

### 1.3 Perbaiki kontras warna teks di atas background biru
Background utama landing page pakai gradient biru (`#5B8FD4` → `#3D6BAF` → `#0B1528`) dengan teks putih di beberapa tempat berukuran kecil (label section, subtitle, caption). Cek setiap kombinasi teks-di-atas-biru dengan target rasio kontras WCAG AA minimal 4.5:1 untuk teks normal dan 3:1 untuk teks besar (≥18px bold atau ≥24px regular).

Langkah kerja:
1. Audit semua elemen teks di `index.html` yang berada langsung di atas background gradient biru (bukan di atas card putih).
2. Untuk teks yang gagal kontras, naikkan opacity/kecerahan warna teks, atau tambahkan `text-shadow` tipis gelap, atau turunkan brightness background di belakang teks tersebut secukupnya.
3. Prioritaskan: `.section-label`, `.hero-subtitle`, `.stat-desc`, `.step-desc`, caption-caption kecil lainnya.
4. Jangan ubah teks yang sudah berada di atas card putih (`.feature-card`, `.step-card`, dll) — itu sudah aman karena teksnya `cardText`/`#1A2F4E` di atas putih.

### 1.4 Uji hasil
Setelah perubahan 1.1–1.3, lakukan pengecekan:
- Buka landing page dengan throttling network "Slow 3G" di DevTools — pastikan halaman tetap bisa dipakai (tidak freeze).
- Aktifkan "Emulate CSS prefers-reduced-motion: reduce" di DevTools Rendering tab — pastikan semua animasi berhenti/statis.
- Jalankan Lighthouse (mode mobile) — catat skor Performance dan Accessibility sebelum vs sesudah perubahan.

---

## TASK 2 — Cleanup Inline Event Handler → Centralized Event Listener

### 2.1 Masalah saat ini
Di beberapa file HTML (`index.html`, dan cek juga `beranda.html`, `dashboard.html`, `jurnal.html`, `kenali.html`, `mood-tracker.html`, `profil.html`) ditemukan pola seperti:

```html
<a href="javascript:void(0)" onclick="handleMulaiSekarang(event)">Mulai Sekarang</a>
```

Pola ini bikin kode kurang rapi (HTML dan behavior tercampur), susah di-maintain, dan rawan duplikasi listener.

### 2.2 Yang harus dilakukan
1. **Cari semua occurrence** atribut `onclick="..."` dan `href="javascript:void(0)"` di seluruh file `.html` dalam repo.
2. Untuk setiap elemen yang punya `onclick`, ganti dengan:
   - Tambahkan atribut `data-action="nama-aksi"` (gunakan nama deskriptif, mis. `data-action="mulai-sekarang"`) sebagai pengganti onclick.
   - Hilangkan atribut `onclick` dan ubah `href="javascript:void(0)"` menjadi `href="#"` HANYA jika elemen tersebut memang bukan link navigasi asli (kalau ada elemen yang seharusnya link biasa, jangan disentuh).
3. Di `assets/js/main.js` (atau file JS global yang sudah memuat semua halaman), buat SATU event listener terpusat pakai event delegation:

```js
document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;

  const action = trigger.dataset.action;

  switch (action) {
    case 'mulai-sekarang':
      event.preventDefault();
      handleMulaiSekarang(event);
      break;
    // tambahkan case lain sesuai data-action yang ditemukan
    default:
      break;
  }
});
```

4. Fungsi-fungsi handler lama (`handleMulaiSekarang`, dll) TIDAK perlu ditulis ulang isinya — cukup dipanggil dari switch-case di atas. Jangan ubah logic di dalamnya.
5. Pastikan setiap `data-action` yang dipakai di HTML punya case yang sesuai di JS — jangan sampai ada action yang tidak ter-handle (silent fail).

### 2.3 Cakupan
Terapkan pola ini secara konsisten ke SEMUA 7 halaman (landing/index, beranda, mood-tracker, jurnal, kenali, profil, dashboard) — bukan cuma index.html — supaya penilaian "kerapihan file dan struktur kode" konsisten di seluruh repo, bukan cuma satu halaman.

### 2.4 Verifikasi
- Setelah refactor, klik ulang semua tombol/link yang sebelumnya pakai `onclick` dan pastikan behavior-nya identik dengan sebelum refactor (tidak ada regresi fungsional).
- Pastikan tidak ada lagi `onclick=` tersisa di file `.html` mana pun (bisa dicek dengan grep `onclick=` di seluruh folder repo, hasilnya harus 0 match).
- Pastikan tidak ada duplicate event listener yang ter-attach dua kali kalau ada script yang di-load lebih dari sekali per halaman.

---

## Batasan (jangan dilanggar)

- Tetap vanilla JS + Tailwind CDN saja — jangan tambah library/framework baru.
- Jangan ubah desain visual, warna brand, copy/teks konten, atau struktur HTML section yang sudah fix.
- Jangan hapus fitur yang sudah berjalan — tujuannya optimasi & cleanup, bukan redesign.
- Commit terpisah untuk Task 1 dan Task 2 supaya mudah di-review/rollback jika perlu.
