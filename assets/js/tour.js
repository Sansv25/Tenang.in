/* =============================================
   Tenang.in — Guided Tour Engine v2.0
   Cross-page Unified Tour
   100% Vanilla JS, Zero Dependencies
   ============================================= */

const Tour = (() => {
  'use strict';

  // ─────────────────────────────────────────
  // CONSTANTS & STORAGE KEYS
  // ─────────────────────────────────────────
  const KEY_RUNNING = 'tenang_tour_running';
  const KEY_STEP    = 'tenang_tour_step';
  const KEY_DONE    = 'tenang_tour_done';

  const MASCOT_IMG    = 'assets/img/maskots/mascot-greeting.png';
  const TRANSITION_MS = 280;
  const SPOT_PAD      = 10;
  const TIP_GAP       = 16;

  // ─────────────────────────────────────────
  // PAGE URL MAP
  // ─────────────────────────────────────────
  const PAGE_URL = {
    beranda:        'beranda.html',
    'mood-tracker': 'mood-tracker.html',
    jurnal:         'jurnal.html',
    kenali:         'kenali.html',
    dashboard:      'dashboard.html',
    profil:         'profil.html'
  };

  // ─────────────────────────────────────────
  // FLAT TOUR STEPS
  // Semua step lintas halaman dalam satu array
  // ─────────────────────────────────────────
  const STEPS = [

    // ══════════════════════════════
    // BERANDA  (step 0 – 6)
    // ══════════════════════════════
    {
      page: 'beranda', target: null, position: 'center', mascot: true,
      title: 'Selamat Datang di Tenang.in',
      body: 'Aku Milo! Aku akan memandumu menjelajahi setiap fitur dan tombol di Tenang.in agar kamu nyaman berefleksi harian. Mari kita mulai!'
    },
    {
      page: 'beranda', target: '#greeting-text, .greeting-text, .dashboard-hero-floating h1', position: 'bottom',
      title: 'Sapaan & Streak Konsistensi',
      body: 'Area sapaan harianmu. Tombol ikon api ("Streak") mencatat konsistensi refleksi harianmu. Kamu juga bisa membagikan streak-mu lewat tombol bagikan (ikon share).'
    },
    {
      page: 'beranda', target: '#mood-checked-in-state a, #mood-checked-in-state button, #mood-grid-container, .mood-grid', position: 'bottom',
      title: 'Check-In Mood Harian',
      body: 'Gunakan 5 opsi emoji untuk mencatat emosimu saat ini. Jika sudah check-in, tombol "Lihat Analisa & Grafisku" membuka grafik emosi, sedangkan "Ubah Check-In" untuk memperbarui mood hari ini.'
    },
    {
      page: 'beranda', target: '#inspiration-card .btn-rotate-quote, #inspiration-card', position: 'bottom',
      title: 'Wisdom & Kutipan Motivasi',
      body: 'Kutipan reflektif penenang pikiran. Klik tombol "Inspirasi Baru" di bagian atas kartu untuk mengacak dan mendapatkan pesan motivasi segar kapan saja.'
    },
    {
      page: 'beranda', target: '#quick-teman-ai .btn-ai-start, #quick-teman-ai, [data-action="open-teman-chat"]', position: 'top',
      noTooltip: true,
      autoOpen: () => {
        if (typeof TemanChat !== 'undefined' && TemanChat.open) {
          if (!document.getElementById('teman-chat')?.classList.contains('active')) {
            TemanChat.open();
          }
        }
      },
      autoAdvance: true,
      autoAdvanceDelayMs: 1200,
      delayMs: 600
    },
    {
      page: 'beranda', target: '#teman-chat', position: 'left',
      noTooltip: true,
      beforeRender: async () => {
        if (typeof TemanChat !== 'undefined' && TemanChat.open) {
          if (!document.getElementById('teman-chat')?.classList.contains('active')) {
            TemanChat.open();
          }
        }
      },
      autoAdvance: true,
      autoAdvanceDelayMs: 3000,
      delayMs: 300
    },
    {
      page: 'beranda',
      target: '#teman-voice-btn',
      position: 'top',
      title: 'Percakapan Suara',
      body: 'Ketuk ikon mikrofon ini untuk berbicara langsung menggunakan suara dengan Teman AI.',
      beforeRender: async () => {
        if (typeof TemanChat !== 'undefined' && TemanChat.open) {
          if (!document.getElementById('teman-chat')?.classList.contains('active')) {
            TemanChat.open();
          }
        }
        const voiceBtn = document.getElementById('teman-voice-btn');
        if (voiceBtn) {
          voiceBtn.style.position = 'relative';
          voiceBtn.style.zIndex = '10601';
        }
      },
      autoAdvance: true,
      autoAdvanceDelayMs: 2800,
      delayMs: 300
    },
    {
      page: 'beranda',
      target: '#voice-orb-circle, #voice-orb-overlay',
      position: 'center',
      noTooltip: true,
      beforeRender: async () => {
        if (typeof TemanChat !== 'undefined' && TemanChat.close) {
          TemanChat.close();
        }
        await new Promise(r => setTimeout(r, 120));
        if (typeof VoiceOrb !== 'undefined' && VoiceOrb.open) {
          VoiceOrb.open();
        }
      },
      modalId: 'voice-orb-overlay',
      autoAdvance: true,
      autoAdvanceDelayMs: 3200,
      delayMs: 400
    },
    {
      page: 'beranda', target: '#quick-mood, .bento-grid', position: 'top',
      beforeRender: async () => {
        if (typeof VoiceOrb !== 'undefined' && VoiceOrb.close) {
          VoiceOrb.close();
        }
        if (typeof TemanChat !== 'undefined' && TemanChat.close) {
          TemanChat.close();
        }
      },
      title: 'Navigasi Fitur Utama',
      body: 'Empat kartu navigasi cepat: Mood Tracker (lacak emosi), Ruang Jurnal (menulis cerita), Kenali Dirimu (tes kepribadian), dan Dashboard (medali & statistik). Klik kartu mana saja untuk ke fitur tersebut.'
    },

    // ══════════════════════════════
    // MOOD TRACKER
    // ══════════════════════════════
    {
      page: 'mood-tracker', target: null, position: 'center', mascot: true,
      title: 'Mood Tracker — Kenali Pola Emosi',
      body: 'Halaman khusus untuk melacak emosi harian secara mendalam, melihat tren fluktuasi mingguan, dan mengamati kalender riwayat emosional.'
    },
    {
      page: 'mood-tracker', target: '#mood-emojis, #mood-form-section .card, #mood-form-section', position: 'bottom',
      title: 'Pencatatan Mood & Tag Perasaan',
      body: 'Pilih emoji mood, tambahkan tag perasaan (seperti #cemas, #bersyukur, #lelah), dan ketik catatan singkat. Lalu tekan tombol "Simpan Mood" untuk mencatat suasana hatimu.'
    },
    {
      page: 'mood-tracker', target: '.btn-share-trigger, #mood-chart', position: 'top',
      title: 'Grafik 7 Hari & Tombol Bagikan',
      body: 'Grafik visual tren emosimu selama seminggu. Tekan tombol "Bagikan" (ikon share) di pojok kanan atas untuk mengunduh atau membagikan kartu grafik mood dalam tampilan estetik.'
    },
    {
      page: 'mood-tracker', target: '#mood-grid', position: 'top',
      title: 'Kalender Riwayat Mood',
      body: 'Visualisasi kalender riwayat refleksi. Tiap kotak berwarna mewakili emosimu pada tanggal tersebut. Sentuh kotak untuk melihat rincian catatan harianmu.'
    },
    {
      page: 'mood-tracker', target: '[data-action="open-settings"]', position: 'bottom',
      title: 'Pengaturan & Preferensi',
      body: 'Ketuk ikon roda gigi di kanan atas untuk mengelola tema tampilan, suara, dan preferensi akunmu.'
    },

    // ══════════════════════════════
    // JURNAL
    // ══════════════════════════════
    {
      page: 'jurnal', target: null, position: 'center', mascot: true,
      title: 'Ruang Jurnal Personal',
      body: 'Ruang rahasia privat untuk menulis cerita, merenungkan prompt refleksi, dan melepaskan beban pikiran secara aman di perangkatmu.'
    },
    {
      page: 'jurnal', target: '.btn-prompt-trigger, #jurnal-prompt', position: 'bottom',
      title: 'Prompt Refleksi & Tombol Ganti Topik',
      body: 'Pertanyaan panduan harian untuk memicu tulisanmu. Tekan tombol "Ganti Topik Prompt" untuk memilih kategori lain seperti Rasa Syukur, Pelepasan Stres, Self-Love, atau Harapan.'
    },
    {
      page: 'jurnal', target: '[data-action="save-jurnal"], #jurnal-content', position: 'top',
      title: 'Area Menulis & Tombol Simpan',
      body: 'Tuangkan pikiranmu di area teks, pilih tag emosi yang sesuai, lalu tekan tombol "Simpan Jurnal" untuk mengunci catatan refleksimu secara aman.'
    },
    {
      page: 'jurnal', target: '#btn-burn, [data-action="simulate-burn"], #bakar-beban-card', position: 'top',
      title: 'Fitur Bakar Beban (Katarsis)',
      body: 'Ketikkan kekhawatiran atau emosi negatifmu di kolom ini, lalu klik tombol "Siapkan Pembakaran Beban Ini". Tulisanmu akan dibakar dalam simulasi api 3D hingga musnah tanpa tersimpan.'
    },

    // ══════════════════════════════
    // KENALI DIRIMU
    // ══════════════════════════════
    {
      page: 'kenali', target: null, position: 'center', mascot: true,
      title: 'Kenali Dirimu',
      body: 'Modul tes psikologi ringan untuk membantumu menemukan tipe karakter kepribadian dan gaya self-care yang paling efektif bagimu.'
    },
    {
      page: 'kenali', target: '[data-action="start-kenali-quiz"], #kenali-intro .btn-primary, #kenali-intro', position: 'bottom',
      title: 'Tombol Mulai Kuis Kepribadian',
      body: 'Klik tombol "Mulai Kuis Sekarang" untuk menjawab 12 pertanyaan refleksi bergambar dan menemukan tipe karaktermu.'
    },
    {
      page: 'kenali', target: '.personality-grid .personality-card, .personality-grid', position: 'bottom',
      title: 'Hasil Profil & Tips Self-Care',
      body: 'Dapatkan penjelasan mendalam mengenai 4 tipe karakter (Pemikir Tenang, Perasa Mendalam, Pemimpin Aktif, Jiwa Sosial) beserta rekomendasi teknik self-care personal.'
    },

    // ══════════════════════════════
    // DASHBOARD
    // ══════════════════════════════
    {
      page: 'dashboard', target: null, position: 'center', mascot: true,
      title: 'Dashboard Perjalanan Diri',
      body: 'Pusat kendali dan ringkasan seluruh perjalanan refleksimu, mulai dari indikator statistik hingga medali pencapaian.'
    },
    {
      page: 'dashboard', target: '#dashboard-quote button, #dashboard-quote', position: 'bottom',
      title: 'Kutipan Motivasi & Tombol Apresiasi',
      body: 'Kutipan inspirasi harian. Klik tombol "Tandai Selesai" setelah meresapi maknanya sebagai bentuk apresiasi atas usahamu merawat diri hari ini.'
    },
    {
      page: 'dashboard', target: '#dashboard-stats-grid .stat-card, #dashboard-stats-grid', position: 'top',
      title: 'Statistik Perjalanan Diri',
      body: 'Empat indikator statistik utama: Hari Streak Konsistensi, Mood Rata-Rata, Total Catatan Jurnal, dan Sesi Cerita bersama Teman AI.'
    },
    {
      page: 'dashboard', target: '#dashboard-badges', position: 'top',
      title: 'Badge & Medali Pencapaian',
      body: 'Kumpulkan dan buka medali pencapaian seiring konsistensimu dalam mencatat mood, jurnal, dan aktivitas refleksi harian.'
    },

    // ══════════════════════════════
    // PROFIL
    // ══════════════════════════════
    {
      page: 'profil', target: null, position: 'center', mascot: true,
      title: 'Profil Pengguna',
      body: 'Kelola identitas personalmu, ubah avatar, dan ikuti kuis gaya refleksi jiwa.'
    },
    {
      page: 'profil', target: '#profil-avatar-box, #profil-name-box, label[for="avatar-file-input"], #profil-name', position: 'bottom',
      title: 'Pengaturan Avatar & Nama',
      body: 'Gunakan tombol foto avatar untuk mengunggah foto profil favoritmu, dan isi kolom nama panggilan untuk personalisasi aplikasi.'
    },
    {
      page: 'profil', target: '[data-action="start-profil-quiz"], #profil-intro .btn-primary, #profil-intro', position: 'top',
      title: 'Kuis Gaya Refleksi Jiwa',
      body: 'Klik tombol "Mulai Kuis Refleksi" untuk menjawab 7 pertanyaan dan menemukan ritme refleksi personal yang paling cocok.'
    },
    {
      page: 'profil', target: null, position: 'center', mascot: true,
      title: 'Tour Selesai',
      body: 'Kamu telah mengenal seluruh fitur dan tombol utama Tenang.in! Selamat melanjutkan perjalanan refleksi dan merawat kesehatan mentalmu.'
    }
  ];

  // ─────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────
  let state = { step: 0, active: false };
  let spotlightEl = null;
  let tooltipEl   = null;
  let resizeTimer = null;

  // ─────────────────────────────────────────
  // STORAGE HELPERS
  // ─────────────────────────────────────────
  function setRunning(step) {
    try {
      localStorage.setItem(KEY_RUNNING, 'true');
      localStorage.setItem(KEY_STEP, String(step));
    } catch(e) {}
  }

  function clearRunning() {
    try {
      localStorage.removeItem(KEY_RUNNING);
      localStorage.removeItem(KEY_STEP);
    } catch(e) {}
  }

  function isRunning() {
    return localStorage.getItem(KEY_RUNNING) === 'true';
  }

  function getSavedStep() {
    return Math.max(0, parseInt(localStorage.getItem(KEY_STEP) || '0'));
  }

  function setDone() {
    try { localStorage.setItem(KEY_DONE, 'true'); } catch(e) {}
  }

  function isDone() {
    return localStorage.getItem(KEY_DONE) === 'true';
  }

  function clearDone() {
    try { localStorage.removeItem(KEY_DONE); } catch(e) {}
  }

  // ─────────────────────────────────────────
  // PAGE DETECTION
  // ─────────────────────────────────────────
  function detectPage() {
    const f = window.location.pathname.split('/').pop() || '';
    if (f === 'beranda.html')      return 'beranda';
    if (f === 'mood-tracker.html') return 'mood-tracker';
    if (f === 'jurnal.html')       return 'jurnal';
    if (f === 'kenali.html')       return 'kenali';
    if (f === 'dashboard.html')    return 'dashboard';
    if (f === 'profil.html')       return 'profil';
    return '';
  }

  let isProgrammaticScrolling = false;

  function preventScroll(e) {
    if (isProgrammaticScrolling) return;
    if (tooltipEl && tooltipEl.contains(e.target)) return;
    e.preventDefault();
  }

  function preventScrollKeys(e) {
    if (isProgrammaticScrolling) return;
    const scrollKeys = ['Space', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown', ' '];
    if (scrollKeys.includes(e.key) || scrollKeys.includes(e.code)) {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
      e.preventDefault();
    }
  }

  function handleScroll() {
    if (!state.active) return;
    const sd = STEPS[state.step];
    if (!sd) return;
    const el = getTargetEl(sd.target);
    updateSpotlight(el);
    positionTooltip(el, sd.position);
  }

  function lockScroll() {
    document.documentElement.classList.add('tour-active');
    document.body.classList.add('tour-active');
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', preventScrollKeys, { passive: false });
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  function unlockScroll() {
    document.documentElement.classList.remove('tour-active');
    document.body.classList.remove('tour-active');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.touchAction = '';

    window.removeEventListener('wheel', preventScroll);
    window.removeEventListener('touchmove', preventScroll);
    window.removeEventListener('keydown', preventScrollKeys);
    window.removeEventListener('scroll', handleScroll);
  }

  // ─────────────────────────────────────────
  // MODAL HELPERS
  // ─────────────────────────────────────────
  function closeActiveModals() {
    try {
      const ci = document.getElementById('checkin-modal');
      if (ci) ci.classList.remove('active');

      document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));

      const onb = document.getElementById('onboarding-modal');
      if (onb && onb.style.display !== 'none') {
        onb.classList.add('opacity-0', 'pointer-events-none');
        onb.classList.remove('opacity-100');
        setTimeout(() => { onb.style.display = 'none'; }, 300);
      }

      const sm = document.getElementById('streak-modal');
      if (sm) sm.classList.remove('active');

      const sp = document.getElementById('settings-popup-overlay');
      if (sp) sp.remove();
    } catch(e) {}
  }

  function isAnyModalOpen() {
    const welcome = document.getElementById('welcome-screen');
    if (welcome && !welcome.classList.contains('fade-out')) return true;

    const onb = document.getElementById('onboarding-modal');
    if (onb && onb.style.display !== 'none' && !onb.classList.contains('opacity-0')) return true;

    const ci = document.getElementById('checkin-modal');
    if (ci && ci.classList.contains('active')) return true;

    if (document.querySelectorAll('.modal-overlay.active').length > 0) return true;

    const sm = document.getElementById('streak-modal');
    if (sm && sm.classList.contains('active')) return true;

    if (window._isCapsuleInterventionPending || window._isStreakMilestonePending) return true;

    return false;
  }

  // ─────────────────────────────────────────
  // DOM: CREATE / DESTROY UI
  // ─────────────────────────────────────────
  function createUI() {
    destroyUI();

    spotlightEl = document.createElement('div');
    spotlightEl.className = 'tour-spotlight-box';
    spotlightEl.id = 'tour-spotlight';
    spotlightEl.style.opacity = '0';
    document.body.appendChild(spotlightEl);

    tooltipEl = document.createElement('div');
    tooltipEl.className = 'tour-tooltip tour-hidden';
    tooltipEl.id = 'tour-tooltip';
    document.body.appendChild(tooltipEl);

    document.addEventListener('keydown', handleKeydown);
  }

  function destroyUI() {
    stopUserModalWatcher();
    document.getElementById('tour-spotlight')?.remove();
    document.getElementById('tour-tooltip')?.remove();
    spotlightEl = null;
    tooltipEl   = null;
    document.removeEventListener('keydown', handleKeydown);
  }

  // ─────────────────────────────────────────
  // TARGET ELEMENT RESOLVER
  // (supports comma-separated fallback selectors)
  // ─────────────────────────────────────────
  function getTargetEl(sel) {
    if (!sel) return null;
    for (const s of sel.split(',').map(x => x.trim())) {
      try { const el = document.querySelector(s); if (el) return el; }
      catch(e) {}
    }
    return null;
  }

  // ─────────────────────────────────────────
  // RENDER TOOLTIP HTML
  // ─────────────────────────────────────────
  function renderTooltip(stepData, stepIdx, total) {
    if (!tooltipEl) return;

    const isCenter   = stepData.position === 'center';
    const showMascot = isCenter || !!stepData.mascot;
    const isLast     = stepIdx === total - 1;

    const dots = Array.from({ length: total }, (_, i) =>
      `<span class="tour-dot${i === stepIdx ? ' active' : ''}"></span>`
    ).join('');

    const prevBtn = stepIdx > 0
      ? `<button class="tour-btn-prev" onclick="Tour._prev()">
           <span class="material-symbols-rounded" style="font-size:15px;">arrow_back</span>
           Kembali
         </button>`
      : '';

    const nextClass = isLast ? 'tour-btn-next tour-btn-finish' : 'tour-btn-next';
    const nextLabel = isLast ? 'Selesai!' : 'Lanjut';
    const nextIcon  = isLast ? 'check_circle' : 'arrow_forward';

    tooltipEl.innerHTML = `
      ${!isCenter ? '<div class="tour-arrow" id="tour-arrow"></div>' : ''}
      ${showMascot ? `<img src="${MASCOT_IMG}" alt="Milo" class="tour-mascot" loading="lazy" decoding="async">` : ''}
      <div class="tour-step-counter">Langkah ${stepIdx + 1} dari ${total}</div>
      <div class="tour-title">${stepData.title}</div>
      <div class="tour-body">${stepData.body}</div>
      ${stepData.actionHTML ? `<div style="margin-bottom:12px;">${stepData.actionHTML}</div>` : ''}
      <div class="tour-progress">${dots}</div>
      <div class="tour-actions">
        ${prevBtn}
        <button class="${nextClass}" onclick="Tour._next()">
          ${nextLabel}
          <span class="material-symbols-rounded" style="font-size:15px;">${nextIcon}</span>
        </button>
      </div>
      <button class="tour-skip" onclick="Tour.stop()">Lewati Tour</button>
    `;

    tooltipEl.classList.toggle('tour-center', isCenter);
  }

  // ─────────────────────────────────────────
  // SPOTLIGHT POSITION
  // ─────────────────────────────────────────
  function updateSpotlight(targetEl) {
    if (!spotlightEl) return;
    if (!targetEl) {
      spotlightEl.style.width   = '0px';
      spotlightEl.style.height  = '0px';
      spotlightEl.style.top     = '50%';
      spotlightEl.style.left    = '50%';
      spotlightEl.style.borderRadius = '0';
      spotlightEl.style.opacity = '1';
      return;
    }

    const node = typeof targetEl === 'string' ? getTargetEl(targetEl) : targetEl;
    if (!node) {
      spotlightEl.style.opacity = '0';
      return;
    }

    // Safety check for Teman Chat container
    const chatEl = document.getElementById('teman-chat');
    if (chatEl && (node === chatEl || node.classList?.contains('teman-chat') || chatEl.contains(node))) {
      if (!chatEl.classList.contains('active')) {
        spotlightEl.style.opacity = '0';
        return;
      }
    }

    const r = node.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) {
      spotlightEl.style.opacity = '0';
      return;
    }

    const isSmallBtn = r.height <= 64;
    const p = isSmallBtn ? 6 : SPOT_PAD;
    let radius = isSmallBtn ? '18px' : '14px';

    let top = r.top - p;
    let left = r.left - p;
    let width = r.width + p * 2;
    let height = r.height + p * 2;

    // Special handling for Teman Chat modal on mobile (when targeting the chat window itself)
    if (chatEl && chatEl.classList.contains('active') && (node === chatEl || node.classList?.contains('teman-chat'))) {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      if (vw <= 768) {
        const chatRect = chatEl.getBoundingClientRect();
        top = Math.max(0, chatRect.top - 6);
        left = 0;
        width = vw;
        height = Math.max(0, vh - top);
        radius = '24px 24px 0 0';
      }
    }

    spotlightEl.style.top          = `${top}px`;
    spotlightEl.style.left         = `${left}px`;
    spotlightEl.style.width        = `${Math.max(0, width)}px`;
    spotlightEl.style.height       = `${Math.max(0, height)}px`;
    spotlightEl.style.borderRadius = radius;
    spotlightEl.style.opacity      = '1';
  }

  // ─────────────────────────────────────────
  // TOOLTIP POSITION
  // ─────────────────────────────────────────
  function positionTooltip(targetEl, position) {
    if (!tooltipEl) return;

    const chatEl = document.getElementById('teman-chat');
    if (chatEl && targetEl && (targetEl === chatEl || chatEl.contains(targetEl)) && !chatEl.classList.contains('active')) {
      tooltipEl.classList.add('tour-hidden');
      return;
    }

    const vw  = window.innerWidth;
    const vh  = window.innerHeight;
    const isMobile = vw <= 768;
    const pad = isMobile ? 12 : TIP_GAP;
    const TW  = tooltipEl.offsetWidth  || (isMobile ? Math.min(350, vw - 24) : 360);
    const TH  = tooltipEl.offsetHeight || 200;

    let top, left;
    const arrowEl = tooltipEl.querySelector('#tour-arrow');

    if (!targetEl || position === 'center') {
      top  = (vh - TH) / 2;
      left = (vw - TW) / 2;
      if (arrowEl) arrowEl.style.display = 'none';
    } else {
      const r   = targetEl.getBoundingClientRect();
      const p   = SPOT_PAD;

      if (arrowEl) arrowEl.style.display = isMobile ? 'none' : 'block';

      if (isMobile) {
        // Mobile: Prioritize BELOW target element
        left = Math.max(pad, (vw - TW) / 2);

        // Place below target
        top = r.bottom + p + pad;

        // If placing below exceeds screen bottom, check if placing above is cleaner
        if (top + TH > vh - 12 && r.top - p - pad - TH > 12) {
          top = r.top - p - pad - TH;
          if (arrowEl) arrowEl.className = 'tour-arrow arrow-bottom';
        } else {
          if (arrowEl) arrowEl.className = 'tour-arrow arrow-top';
        }
      } else {
        // Desktop positioning logic
        let pos = position;
        const spaceAbove = r.top - p - pad;
        const spaceBelow = vh - (r.bottom + p + pad);

        // Auto-flip if not enough space on requested side
        if (pos === 'top' && spaceAbove < TH) {
          if (spaceBelow >= TH || spaceBelow > spaceAbove) {
            pos = 'bottom';
          }
        } else if (pos === 'bottom' && spaceBelow < TH) {
          if (spaceAbove >= TH || spaceAbove > spaceBelow) {
            pos = 'top';
          }
        }

        if (pos === 'bottom') {
          top  = r.bottom + p + pad;
          if (arrowEl) arrowEl.className = 'tour-arrow arrow-top';
        } else if (pos === 'top') {
          top  = r.top - p - pad - TH;
          if (arrowEl) arrowEl.className = 'tour-arrow arrow-bottom';
        } else if (pos === 'right') {
          top  = (r.top + r.bottom) / 2 - TH / 2;
          left = r.right + p + pad;
          if (arrowEl) arrowEl.className = 'tour-arrow arrow-right';
        } else {
          top  = (r.top + r.bottom) / 2 - TH / 2;
          left = r.left - p - pad - TW;
          if (arrowEl) arrowEl.className = 'tour-arrow arrow-left';
        }

        // Horizontal placement & smart alignment for wide section cards
        if (pos === 'bottom' || pos === 'top') {
          if (r.width > 520) {
            left = r.left + 24;
            left = Math.max(pad, Math.min(left, vw - TW - pad));
            if (arrowEl) {
              const arrowOffset = Math.max(28, Math.min(TW - 28, (r.left + 48) - left));
              arrowEl.style.left = `${arrowOffset}px`;
            }
          } else {
            const tCX = (r.left + r.right) / 2;
            left = tCX - TW / 2;
            left = Math.max(pad, Math.min(left, vw - TW - pad));
            if (arrowEl) {
              arrowEl.style.left = '50%';
            }
          }
        } else {
          left = Math.max(pad, Math.min(left, vw - TW - pad));
          if (arrowEl) arrowEl.style.left = '50%';
        }
      }

      // Vertical safety clamp
      top = Math.max(pad, Math.min(top, vh - TH - pad));
    }

    tooltipEl.style.top  = `${Math.max(pad, top)}px`;
    tooltipEl.style.left = `${Math.max(pad, left)}px`;
  }

  // ─────────────────────────────────────────
  // SCROLL TO TARGET
  // Temporarily unlock → scroll → relock
  // ─────────────────────────────────────────
  async function scrollToTarget(targetEl, position = 'bottom') {
    if (!targetEl) return;
    const r      = targetEl.getBoundingClientRect();
    const vh     = window.innerHeight;
    const isMobile = window.innerWidth <= 768;
    const TH     = tooltipEl ? (tooltipEl.offsetHeight || 200) : 200;
    const pad    = TIP_GAP;
    const p      = SPOT_PAD;

    let needsScroll = false;
    let targetY = window.scrollY;

    if (isMobile) {
      // On mobile, scroll target near top of viewport (top: 85px) so room below is maximized
      const desiredY = window.scrollY + r.top - 85;
      if (Math.abs(window.scrollY - desiredY) > 30) {
        needsScroll = true;
        targetY = desiredY;
      }
    } else {
      const spaceAbove = r.top - p - pad;
      const spaceBelow = vh - (r.bottom + p + pad);

      if (position === 'top' && spaceAbove < TH + 20) {
        needsScroll = true;
        targetY = window.scrollY + r.top - (TH + pad + p + 50);
      } else if (position === 'bottom' && spaceBelow < TH + 20) {
        needsScroll = true;
        targetY = window.scrollY + r.bottom + TH + pad + p + 50 - vh;
      } else if (r.top < 80 || r.bottom > vh - 80) {
        needsScroll = true;
        targetY = window.scrollY + r.top - (vh - r.height) / 2;
      }
    }

    if (needsScroll) {
      isProgrammaticScrolling = true;
      document.documentElement.classList.remove('tour-active');
      document.body.classList.remove('tour-active');
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';

      window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
      await new Promise(res => setTimeout(res, 450));

      lockScroll();
      isProgrammaticScrolling = false;
    }
  }

  let activeAutoTimer = null;
  let activeWatcherInterval = null;
  let userModalWatcherTimer = null;
  let activeWatchedUserModal = null;

  function stopUserModalWatcher() {
    if (userModalWatcherTimer) {
      clearInterval(userModalWatcherTimer);
      userModalWatcherTimer = null;
    }
    activeWatchedUserModal = null;
  }

  function getActiveUserModal() {
    const activeModals = Array.from(document.querySelectorAll('.modal-overlay.active, .modal.active, .modal-card.active'));
    for (const m of activeModals) {
      if (m.id === 'onboarding-modal' || m.id === 'welcome-screen') continue;
      return m;
    }

    const sp = document.getElementById('settings-popup-overlay');
    if (sp && document.body.contains(sp)) return sp;

    const vo = document.getElementById('voice-orb-overlay');
    if (vo && vo.style.display !== 'none' && getComputedStyle(vo).display !== 'none' && getComputedStyle(vo).opacity !== '0') {
      return vo;
    }

    return null;
  }

  function startUserModalWatcher() {
    stopUserModalWatcher();

    userModalWatcherTimer = setInterval(() => {
      if (!state.active) {
        stopUserModalWatcher();
        return;
      }

      const sd = STEPS[state.step];
      if (sd && sd.modalId && sd.autoOpen) {
        return;
      }

      const openModal = getActiveUserModal();

      if (openModal) {
        if (!activeWatchedUserModal) {
          activeWatchedUserModal = openModal;
          if (spotlightEl) spotlightEl.style.opacity = '0';
          if (tooltipEl) tooltipEl.classList.add('tour-hidden');
          unlockScroll();
        } else if (activeWatchedUserModal !== openModal) {
          activeWatchedUserModal = openModal;
        }
      } else {
        if (activeWatchedUserModal) {
          activeWatchedUserModal = null;
          lockScroll();
          setTimeout(() => {
            if (state.active) {
              _next();
            }
          }, 300);
        }
      }
    }, 200);
  }

  let activeTargetObserver = null;
  let activeResizeObserver = null;

  function observeTarget(targetEl) {
    if (activeTargetObserver) {
      activeTargetObserver.disconnect();
      activeTargetObserver = null;
    }
    if (activeResizeObserver) {
      activeResizeObserver.disconnect();
      activeResizeObserver = null;
    }
    if (!targetEl) return;

    activeTargetObserver = new MutationObserver(() => {
      if (state.active && spotlightEl) {
        updateSpotlight(targetEl);
        const sd = STEPS[state.step];
        if (sd) positionTooltip(targetEl, sd.position);
      }
    });

    activeTargetObserver.observe(targetEl, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true
    });

    if (window.ResizeObserver) {
      activeResizeObserver = new ResizeObserver(() => {
        if (state.active && spotlightEl) {
          updateSpotlight(targetEl);
          const sd = STEPS[state.step];
          if (sd) positionTooltip(targetEl, sd.position);
        }
      });
      activeResizeObserver.observe(targetEl);
    }
  }

  function clearAutoTriggers() {
    if (activeAutoTimer) {
      clearTimeout(activeAutoTimer);
      activeAutoTimer = null;
    }
    if (activeWatcherInterval) {
      clearInterval(activeWatcherInterval);
      clearTimeout(activeWatcherInterval);
      activeWatcherInterval = null;
    }
    if (activeTargetObserver) {
      activeTargetObserver.disconnect();
      activeTargetObserver = null;
    }
    if (activeResizeObserver) {
      activeResizeObserver.disconnect();
      activeResizeObserver = null;
    }
    activeWatchedUserModal = null;
    const voiceBtn = document.getElementById('teman-voice-btn');
    if (voiceBtn) {
      voiceBtn.style.position = '';
      voiceBtn.style.zIndex = '';
    }
    const chatEl = document.getElementById('teman-chat');
    if (chatEl) chatEl.style.zIndex = '';
  }

  // ─────────────────────────────────────────
  // RENDER A SPECIFIC GLOBAL STEP
  // ─────────────────────────────────────────
  async function renderStep(globalStep) {
    clearAutoTriggers();

    const stepData = STEPS[globalStep];
    if (!stepData) return;

    if (typeof stepData.beforeRender === 'function') {
      try {
        await stepData.beforeRender();
      } catch(e) {}
      await new Promise(r => setTimeout(r, 150));
    }

    state.step = globalStep;
    if (tooltipEl) tooltipEl.classList.add('tour-hidden');

    const targetEl = getTargetEl(stepData.target);
    await scrollToTarget(targetEl, stepData.position);
    await new Promise(r => setTimeout(r, 60));

    updateSpotlight(targetEl);
    observeTarget(targetEl);

    if (stepData.noTooltip) {
      if (tooltipEl) tooltipEl.classList.add('tour-hidden');
    } else {
      renderTooltip(stepData, globalStep, STEPS.length);
      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => setTimeout(r, 20));

      positionTooltip(targetEl, stepData.position);
      if (tooltipEl) tooltipEl.classList.remove('tour-hidden');
    }

    if (stepData.autoOpen) {
      const delay = stepData.delayMs || 2000;
      activeAutoTimer = setTimeout(() => {
        if (!state.active) return;

        try { stepData.autoOpen(); } catch(e) {}

        if (stepData.autoAdvance) {
          const advDelay = stepData.autoAdvanceDelayMs || 2500;
          activeWatcherInterval = setTimeout(() => {
            if (state.active) _next();
          }, advDelay);
          return;
        }

        if (spotlightEl) spotlightEl.style.opacity = '0';
        unlockScroll();

        if (stepData.modalId) {
          let wasModalEverOpen = false;

          activeWatcherInterval = setInterval(() => {
            if (!state.active) { clearAutoTriggers(); return; }

            const modalEl = document.getElementById(stepData.modalId);
            const isCurrentlyOpen = modalEl && (
              modalEl.classList.contains('active') ||
              (modalEl.style.display !== 'none' && getComputedStyle(modalEl).display !== 'none' && getComputedStyle(modalEl).opacity !== '0')
            );

            if (isCurrentlyOpen) {
              wasModalEverOpen = true;
            }

            if (wasModalEverOpen && !isCurrentlyOpen) {
              clearAutoTriggers();
              lockScroll();
              setTimeout(() => {
                if (state.active) _next();
              }, 300);
            }
          }, 300);
        }
      }, delay);
    }
  }

  // ─────────────────────────────────────────
  // NAVIGATE TO ANOTHER PAGE
  // ─────────────────────────────────────────
  function navigateTo(page, step) {
    clearAutoTriggers();
    setRunning(step);
    if (tooltipEl)    tooltipEl.classList.add('tour-hidden');
    if (spotlightEl)  spotlightEl.style.opacity = '0';
    setTimeout(() => {
      window.location.href = PAGE_URL[page] || (page + '.html');
    }, TRANSITION_MS + 30);
  }

  // ─────────────────────────────────────────
  // INTERNAL: launch at specific step
  // (assumes we are already on the correct page)
  // ─────────────────────────────────────────
  function _launch(globalStep) {
    clearAutoTriggers();
    if (state.active) { destroyUI(); unlockScroll(); }
    state.step   = globalStep;
    state.active = true;
    setRunning(globalStep);
    lockScroll();
    setTimeout(() => {
      createUI();
      renderStep(globalStep);
      startUserModalWatcher();
      window.addEventListener('resize', handleResize);
    }, 180);
  }

  // ─────────────────────────────────────────
  // PUBLIC: start() — always from step 0
  // ─────────────────────────────────────────
  function start() {
    clearAutoTriggers();
    clearRunning();
    clearDone();
    closeActiveModals();

    const firstPage  = STEPS[0].page;
    const currPage   = detectPage();

    if (firstPage !== currPage) {
      // Navigate to beranda first
      setRunning(0);
      setTimeout(() => { window.location.href = PAGE_URL[firstPage]; }, 120);
      return;
    }

    _launch(0);
  }

  // ─────────────────────────────────────────
  // PUBLIC: stop()
  // ─────────────────────────────────────────
  function stop() {
    clearAutoTriggers();
    stopUserModalWatcher();
    if (typeof TemanChat !== 'undefined' && TemanChat.close) {
      TemanChat.close();
    }
    if (typeof VoiceOrb !== 'undefined' && VoiceOrb.close) {
      VoiceOrb.close();
    }
    if (!state.active) { clearRunning(); unlockScroll(); return; }
    state.active = false;

    clearRunning();
    setDone();
    unlockScroll();

    if (tooltipEl)   tooltipEl.classList.add('tour-hidden');
    if (spotlightEl) spotlightEl.style.opacity = '0';

    setTimeout(destroyUI, TRANSITION_MS + 50);
    window.removeEventListener('resize', handleResize);

    try {
      if (typeof Animations !== 'undefined' && Animations.showToast) {
        Animations.showToast('Tour selesai! Selamat menjelajahi Tenang.in', 'success');
      }
    } catch(e) {}
  }

  // ─────────────────────────────────────────
  // PUBLIC: reset() — clears done flag so tour can repeat
  // ─────────────────────────────────────────
  function reset() {
    clearAutoTriggers();
    stopUserModalWatcher();
    clearRunning();
    clearDone();
  }

  // ─────────────────────────────────────────
  // TEMAN CHAT CLOSED HANDLER
  // ─────────────────────────────────────────
  function onTemanChatClosed() {
    if (!state.active) return;
    const sd = STEPS[state.step];
    if (!sd) return;

    const targetStr = sd.target || '';
    if (targetStr.includes('teman-chat') || targetStr.includes('teman-voice-btn') || targetStr.includes('quick-teman-ai')) {
      clearAutoTriggers();
      if (typeof VoiceOrb !== 'undefined' && VoiceOrb.close) {
        VoiceOrb.close();
      }
      if (spotlightEl) spotlightEl.style.opacity = '0';
      if (tooltipEl) tooltipEl.classList.add('tour-hidden');

      // Find the next step that is not a chat/voice step (i.e. step 8: Navigasi Fitur Utama)
      let nextStep = state.step + 1;
      while (nextStep < STEPS.length) {
        const nextTarget = STEPS[nextStep].target || '';
        if (!nextTarget.includes('teman-chat') && !nextTarget.includes('teman-voice-btn') && !nextTarget.includes('voice-orb')) {
          break;
        }
        nextStep++;
      }

      setTimeout(() => {
        if (state.active) {
          state.step = nextStep;
          setRunning(nextStep);
          renderStep(nextStep);
        }
      }, 120);
    }
  }

  // ─────────────────────────────────────────
  // NEXT / PREV  (called from inline onclick)
  // ─────────────────────────────────────────
  function _next() {
    clearAutoTriggers();
    if (!state.active) return;
    const nextStep = state.step + 1;
    if (nextStep >= STEPS.length) { stop(); return; }

    const nextPage = STEPS[nextStep].page;
    const currPage = detectPage();

    if (nextPage !== currPage) {
      navigateTo(nextPage, nextStep);
    } else {
      state.step = nextStep;
      setRunning(nextStep);
      renderStep(nextStep);
    }
  }

  function _prev() {
    clearAutoTriggers();
    if (!state.active || state.step <= 0) return;
    const prevStep = state.step - 1;
    const prevPage = STEPS[prevStep].page;
    const currPage = detectPage();

    if (prevPage !== currPage) {
      navigateTo(prevPage, prevStep);
    } else {
      state.step = prevStep;
      setRunning(prevStep);
      renderStep(prevStep);
    }
  }

  // ─────────────────────────────────────────
  // EVENT HANDLERS
  // ─────────────────────────────────────────
  function handleKeydown(e) {
    if (!state.active) return;
    if (activeWatchedUserModal) return;
    if (e.key === 'Escape')     stop();
    if (e.key === 'ArrowRight') _next();
    if (e.key === 'ArrowLeft')  _prev();
  }

  function handleResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!state.active) return;
      const sd = STEPS[state.step];
      if (!sd) return;
      const el = getTargetEl(sd.target);
      updateSpotlight(el);
      positionTooltip(el, sd.position);
    }, 120);
  }

  // ─────────────────────────────────────────
  // AUTO-START / RESUME  (DOMContentLoaded)
  // ─────────────────────────────────────────
  function autoStart() {
    const currPage = detectPage();
    if (!currPage) return;

    // ① Resume ongoing tour
    if (isRunning()) {
      const savedStep     = getSavedStep();
      const savedStepData = STEPS[savedStep];

      if (!savedStepData) { clearRunning(); return; }

      // If wrong page, navigate to correct page
      if (savedStepData.page !== currPage) {
        navigateTo(savedStepData.page, savedStep);
        return;
      }

      // Wait for any modals to close, then launch
      let polls = 0;
      const poll = () => {
        polls++;
        if (polls > 20 || !isAnyModalOpen()) {
          closeActiveModals();
          setTimeout(() => _launch(savedStep), 300);
        } else {
          setTimeout(poll, 500);
        }
      };
      setTimeout(poll, 600);
      return;
    }

    // ② Auto-start for brand-new users (only on beranda, only once)
    if (!isDone() && currPage === 'beranda') {
      let quietPolls = 0;
      let maxTimeoutPolls = 0;

      const poll = () => {
        maxTimeoutPolls++;
        if (maxTimeoutPolls > 300) return; // 150s absolute safety limit

        const isNewUserDone = localStorage.getItem('isNewUser') === 'false';
        const isNewUserRaw = localStorage.getItem('isNewUser');

        // For first-ever users: wait for onboarding to complete
        if ((isNewUserRaw === null || isNewUserRaw === undefined) && !isNewUserDone) {
          setTimeout(poll, 500);
          return;
        }

        if (isAnyModalOpen()) {
          quietPolls = 0; // Reset quiet count as long as any modal is open or pending
          setTimeout(poll, 500);
        } else {
          quietPolls++;
          if (quietPolls >= 3) {
            // 1.5s of sustained quiet (no modal open or pending)
            if (!isRunning() && !isDone()) {
              start();
            }
            return; // Tour launched or finished
          }
          setTimeout(poll, 500); // Keep polling until sustained quiet condition is met
        }
      };
      setTimeout(poll, 1500);
    }
  }

  // ─────────────────────────────────────────
  // EXPOSE PUBLIC API
  // ─────────────────────────────────────────
  return {
    start,
    stop,
    reset,
    detectPage,
    isRunning,
    isDone,
    autoStart,
    onTemanChatClosed,
    _next,
    _prev
  };

})();

// Init on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  Tour.autoStart();
});
