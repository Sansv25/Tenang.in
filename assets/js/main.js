/* =============================================
   Tenang.in — Main Global Script
   ============================================= */

const Main = (() => {
  // ---- Logo SVG ----
  const logoSVG = `<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="16" r="15" fill="url(#logoGrad)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <path d="M10 18 C10 14, 13 11, 16 11 C19 11, 22 14, 22 18" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
    <circle cx="12.5" cy="15" r="1.5" fill="white"/>
    <circle cx="19.5" cy="15" r="1.5" fill="white"/>
    <path d="M13 20 Q16 23, 19 20" stroke="white" stroke-width="1.5" stroke-linecap="round" fill="none"/>
    <defs><linearGradient id="logoGrad" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#7EC8E3"/><stop offset="1" stop-color="#2D5BA8"/></linearGradient></defs>
  </svg>`;

  // ---- Welcome Screen ----
  const showWelcomeScreen = () => {
    if (sessionStorage.getItem('tenang_welcomed')) return;

    const overlay = document.createElement('div');
    overlay.className = 'welcome-screen';
    overlay.id = 'welcome-screen';
    overlay.innerHTML = `
      <div class="welcome-logo">
        <svg width="80" height="80" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="15" fill="url(#wlGrad)" stroke="rgba(255,255,255,0.3)" stroke-width="0.5"/>
          <path d="M10 18 C10 14, 13 11, 16 11 C19 11, 22 14, 22 18" stroke="white" stroke-width="2" stroke-linecap="round" fill="none"/>
          <circle cx="12.5" cy="15" r="1.2" fill="white"/>
          <circle cx="19.5" cy="15" r="1.2" fill="white"/>
          <path d="M13 20 Q16 23, 19 20" stroke="white" stroke-width="1.2" stroke-linecap="round" fill="none"/>
          <defs><linearGradient id="wlGrad" x1="0" y1="0" x2="32" y2="32"><stop stop-color="#7EC8E3"/><stop offset="1" stop-color="#2D5BA8"/></linearGradient></defs>
        </svg>
        <h1 style="font-size:2.5rem; margin-top:1rem; font-weight:800; letter-spacing:-0.02em;">Tenang.in</h1>
      </div>
      <p class="welcome-tagline" data-i18n="welcome.tagline">Ruang amanmu untuk refleksi diri</p>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => {
      overlay.classList.add('fade-out');
      setTimeout(() => {
        overlay.remove();
      }, 600);
    }, 2500);

    sessionStorage.setItem('tenang_welcomed', 'true');
  };

  // ---- Navbar ----
  const createNavbar = (activePage = '') => {
    const nav = document.createElement('nav');
    nav.className = 'navbar';
    nav.id = 'navbar';

    const links = [
      { href: 'beranda.html', label: 'Beranda', id: 'home' },
      { href: 'mood-tracker.html', label: 'Mood', id: 'mood' },
      { href: 'jurnal.html', label: 'Jurnal', id: 'jurnal' },
      { href: 'kenali.html', label: 'Kenali', id: 'kenali' },
      { href: 'dashboard.html', label: 'Dashboard', id: 'dashboard' }
    ];

    nav.innerHTML = `
      <div class="navbar-inner">
        <a href="index.html" class="navbar-logo">
          ${logoSVG}
          <span>Tenang.in</span>
        </a>
        <div class="navbar-links">
          ${links.map(l => `<a href="${l.href}" class="${activePage === l.id ? 'active' : ''}">${l.label}</a>`).join('')}
        </div>
      </div>
    `;

    document.body.prepend(nav);

    // Scroll effect
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    });
  };

  // ---- Bottom Nav (Mobile - Matte Black Capsule) ----
  const createBottomNav = (activePage = '') => {
    if (document.querySelector('.bottom-nav')) return;

    const items = [
      { href: 'beranda.html', label: 'Home', id: 'home', icon: 'grid_view' },
      { href: 'mood-tracker.html', label: 'Mood', id: 'mood', icon: 'sentiment_satisfied' },
      { isAction: true, label: '', id: 'action', icon: 'add' },
      { href: 'kenali.html', label: 'Learn', id: 'kenali', icon: 'psychology' },
      { href: 'dashboard.html', label: 'Summary', id: 'dashboard', icon: 'bar_chart' }
    ];

    const bottomNav = document.createElement('div');
    bottomNav.className = 'bottom-nav';
    bottomNav.innerHTML = `
      <div class="bottom-nav-inner">
        ${items.map(item => {
          if (item.isAction) {
            return `
              <button class="bottom-nav-action" onclick="if(typeof showCheckInModal === 'function'){ showCheckInModal(); } else { window.location.href='beranda.html'; }" aria-label="Catat Mood">
                <span class="material-symbols-rounded">edit</span>
                <span style="font-size: 0.75rem; font-weight: 600;">Catat</span>
              </button>
            `;
          }
          return `
            <a href="${item.href}" class="bottom-nav-item ${activePage === item.id ? 'active' : ''}">
              <span class="material-symbols-rounded">${item.icon}</span>
              <span class="bottom-nav-label">${item.label}</span>
            </a>
          `;
        }).join('')}
      </div>
    `;

    document.body.appendChild(bottomNav);
  };

  // ---- Footer ----
  const createFooter = () => {
    const footer = document.createElement('footer');
    footer.className = 'footer';
    footer.innerHTML = `
      <div class="container">
        <div class="footer-grid">
          <div>
            <div class="footer-brand">
              <span class="material-symbols-rounded" style="color:var(--secondary-accent); font-size:22px;">favorite</span>
              <span>Tenang.in</span>
            </div>
            <p class="footer-desc">Ruang digital untuk membantu remaja mengenali pola emosi, merefleksikan diri, dan merasa tidak sendirian.</p>
          </div>
          <div>
            <div class="footer-title">Navigasi</div>
            <a href="beranda.html" class="footer-link"><span class="material-symbols-rounded">home</span> Beranda</a>
            <a href="mood-tracker.html" class="footer-link"><span class="material-symbols-rounded">sentiment_satisfied</span> Mood Tracker</a>
            <a href="jurnal.html" class="footer-link"><span class="material-symbols-rounded">edit_note</span> Ruang Jurnal</a>
            <a href="kenali.html" class="footer-link"><span class="material-symbols-rounded">psychology</span> Kenali Dirimu</a>
            <a href="dashboard.html" class="footer-link"><span class="material-symbols-rounded">bar_chart</span> Dashboard</a>
          </div>
          <div>
            <div class="footer-title">Bantuan Profesional</div>
            <a href="tel:119" class="footer-link"><span class="material-symbols-rounded">call</span> Hotline 119 ext. 8</a>
            <a href="tel:02178845555" class="footer-link"><span class="material-symbols-rounded">phone_iphone</span> Into The Light</a>
            <a href="#" class="footer-link"><span class="material-symbols-rounded">chat</span> Sejiwa: 119 ext. 8</a>
            <a href="https://www.halodoc.com" target="_blank" rel="noopener" class="footer-link"><span class="material-symbols-rounded">language</span> Halodoc</a>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="footer-disclaimer">
            <span class="material-symbols-rounded">warning</span>
            <span>Tenang.in adalah ruang refleksi diri dan bukan pengganti konsultasi profesional. Jika kamu merasa butuh bantuan lebih, jangan ragu menghubungi psikolog atau konselor profesional. Seluruh data terenkripsi dan terjaga privasinya.</span>
          </p>
          <p style="font-size:0.75rem; color:rgba(255,255,255,0.4);">© 2026 Tenang.in</p>
        </div>
      </div>
    `;
    document.body.appendChild(footer);
  };

  // ---- Get Greeting Text ----
  const getGreetingText = () => {
    const hour = new Date().getHours();
    const name = Storage.getUserName();
    let greeting = '';

    if (hour < 11) greeting = (typeof I18n !== 'undefined') ? I18n.t('beranda.greeting.morning') : 'Selamat Pagi';
    else if (hour < 15) greeting = (typeof I18n !== 'undefined') ? I18n.t('beranda.greeting.afternoon') : 'Selamat Siang';
    else if (hour < 18) greeting = (typeof I18n !== 'undefined') ? I18n.t('beranda.greeting.evening') : 'Selamat Sore';
    else greeting = (typeof I18n !== 'undefined') ? I18n.t('beranda.greeting.night') : 'Selamat Malam';

    return name ? `${greeting}, ${name}!` : `${greeting}!`;
  };



  // ---- Time Capsule Intervention Engine ----
  window.checkTimeCapsuleIntervention = function(level) {
    if (level >= 4) {
      const lastPrompt = localStorage.getItem('tenang_last_capsule_prompt');
      const today = Storage.todayKey();
      if (lastPrompt !== today) {
        localStorage.setItem('tenang_last_capsule_prompt', today);
        setTimeout(() => showWriteCapsuleModal(), 1200);
      }
    } else if (level <= 2) {
      const capsule = Storage.getRandomCapsule();
      if (capsule) {
        setTimeout(() => showReadCapsuleModal(capsule), 1200);
      } else {
        setTimeout(() => showLowMoodRecommendationModal(), 1200);
      }
    }
  };

  function showWriteCapsuleModal() {
    let modal = document.getElementById('time-capsule-write-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'time-capsule-write-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal" style="max-width:460px; background:linear-gradient(135deg, #1E293B, #0F172A); border:1px solid rgba(255,255,255,0.15); box-shadow:0 15px 35px rgba(0,0,0,0.5);">
          <div class="modal-header">
            <h3 style="font-weight:800; color:#fff; display:flex; align-items:center; gap:8px;">
              <span class="material-symbols-rounded" style="color:#F59E0B; font-size:26px;">history_edu</span>
              Kapsul Waktu untuk Dirimu
            </h3>
            <button class="modal-close" onclick="document.getElementById('time-capsule-write-modal').classList.remove('active');" aria-label="Tutup Modal"><span class="material-symbols-rounded">close</span></button>
          </div>
          <p style="color:rgba(255,255,255,0.85); font-size:0.9rem; margin-top:6px; line-height:1.5;">
            Mumpung mood kamu lagi <b>Baik / Luar Biasa</b> hari ini, mau tinggalkan pesan semangat untuk dirimu sendiri jika suatu hari nanti kamu merasa down?
          </p>
          <div style="margin-top:16px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
            <span style="font-size:0.8rem; font-weight:700; color:rgba(255,255,255,0.7);">Isi Pesan Motivasi:</span>
            <button id="btn-generate-ai" type="button" onclick="window.generateAICapsule()" style="background:linear-gradient(135deg, rgba(139,92,246,0.25), rgba(79,70,229,0.25)); border:1px solid rgba(139, 92, 246, 0.6); color:#DDD6FE; border-radius:20px; padding:5px 14px; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:6px; cursor:pointer; box-shadow:0 0 15px rgba(139, 92, 246, 0.3); transition:all 0.2s;">
              <span class="material-symbols-rounded" style="font-size:16px; color:#A78BFA;">auto_awesome</span>
              <span>Generate ala Teman AI</span>
            </button>
          </div>
          <textarea id="capsule-input-msg" class="input textarea" placeholder="Ketik manual di sini atau klik 'Generate ala Teman AI' di atas untuk dibuatkan kata-kata indah secara otomatis..." style="margin-top:8px; min-height:120px; background:rgba(0,0,0,0.3); color:#fff; border:1px solid rgba(255,255,255,0.2); border-radius:10px; font-size:0.9rem; line-height:1.6; padding:12px;"></textarea>
          <div style="display:flex; gap:12px; margin-top:22px;">
            <button class="btn btn-secondary btn-full" style="background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:#fff; font-weight:600;" onclick="document.getElementById('time-capsule-write-modal').classList.remove('active');">Nanti Saja</button>
            <button class="btn btn-primary btn-full" style="background:linear-gradient(135deg, #F59E0B, #D97706); border:none; color:#fff; font-weight:700; box-shadow:0 4px 15px rgba(245,158,11,0.4);" onclick="submitTimeCapsule()">
              <span class="material-symbols-rounded" style="font-size:18px;">lock_clock</span> Simpan ke Kapsul
            </button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('active');
  }

  window.generateAICapsule = function() {
    const textarea = document.getElementById('capsule-input-msg');
    const btn = document.getElementById('btn-generate-ai');
    if (!textarea) return;

    const messages = [
      "Hei kamu di masa depan! Aku menulis pesan ini saat mood-ku sedang luar biasa baik hari ini. Aku cuma mau ingetin: masa sulit itu wajar dan pasti berlalu. Buktinya hari ini aku bisa sebahagia ini. Tarik napas yang dalam, kamu pasti bisa melewati badai saat ini!",
      "Pesan hangat dari dirimu yang sedang damai hari ini: Jangan terlalu keras pada dirimu sendiri ya. Kamu udah berjuang sejauh ini dan itu hebat banget! Kalau capai, tidak apa-apa istirahat dulu. Badai pasti berlalu, dan hari sejuk seperti ini akan datang lagi.",
      "Ingat ya: mendung tidak berarti langit runtuh! Saat surat ini ditulis, hatiku sedang penuh rasa damai dan syukur. Ayo rasakan kembali ketenangan itu perlahan-lahan. Lelah sesekali sangat manusiawi, kamu jauh lebih tangguh dari rasa takutmu!",
      "Dari aku yang sedang bangga dan bersemangat hari ini: Saat kamu membaca ini, mungkin kepalamu sedang bising atau hatimu sedih. Tapi ingat berapa banyak ujian di masa lalu yang dulu kamu kira tak bisa terlewati, nyatanya kita berhasil sampai di sini! Kamu sanggup melewati ini.",
      "Kolaborasi pesan antara Teman AI & Dirimu hari ini: Segala kegelapan yang kamu rasakan sekarang adalah proses istirahat bagi jiwamu. Jangan menghukum diri atas hal yang di luar kendalimu. Kita pasti kan kembali tersenyum lega seperti saat pesan ini ditulis!"
    ];

    const chosen = messages[Math.floor(Math.random() * messages.length)];

    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-rounded" style="font-size:16px; color:#C4B5FD;">hourglass_top</span> <span>Teman AI merangkai kata...</span>`;
    }

    textarea.value = "";
    let i = 0;
    const typeInterval = setInterval(() => {
      textarea.value += chosen.charAt(i);
      i++;
      textarea.scrollTop = textarea.scrollHeight;
      if (i >= chosen.length) {
        clearInterval(typeInterval);
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = `<span class="material-symbols-rounded" style="font-size:16px; color:#A78BFA;">auto_awesome</span> <span>Ganti Inspirasi Lain (AI)</span>`;
        }
        if (typeof Animations !== 'undefined') {
          Animations.showToast('Pesan berhasil dirangkai oleh Teman AI! Kamu bisa mengubah kata-katanya sesukamu.', 'success');
        }
      }
    }, 16);
  };

  window.submitTimeCapsule = function() {
    const textarea = document.getElementById('capsule-input-msg');
    if (textarea && textarea.value.trim()) {
      Storage.saveTimeCapsule(textarea.value.trim());
      document.getElementById('time-capsule-write-modal')?.classList.remove('active');
      if (typeof Animations !== 'undefined') {
        Animations.showToast('Pesan rahasiamu berhasil dikunci dalam kapsul waktu!', 'success');
      }
    } else {
      if (typeof Animations !== 'undefined') {
        Animations.showToast('Tuliskan sedikit kata motivasi terlebih dahulu ya.', 'warning');
      }
    }
  };

  function showReadCapsuleModal(capsule) {
    let modal = document.getElementById('time-capsule-read-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'time-capsule-read-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal" style="max-width:440px; background:linear-gradient(135deg, #1E293B, #0F172A); border:1px solid rgba(244,63,94,0.3); box-shadow:0 0 30px rgba(244,63,94,0.2);">
          <div class="modal-header">
            <h3 style="font-weight:800; color:#F43F5E; display:flex; align-items:center; gap:8px;">
              <span class="material-symbols-rounded" style="color:#F43F5E;">drafts</span>
              Surat dari Dirimu di Masa Lalu
            </h3>
            <button class="modal-close" onclick="document.getElementById('time-capsule-read-modal').classList.remove('active');" aria-label="Tutup Modal"><span class="material-symbols-rounded">close</span></button>
          </div>
          <p style="color:rgba(255,255,255,0.75); font-size:0.85rem; margin-top:4px;">
            Saat kamu merasa harimu berat hari ini, dirimu dari tanggal <b id="read-capsule-date" style="color:#fff;"></b> pernah mengirimkan pesan ini khusus untukmu:
          </p>
          <div style="margin:20px 0; padding:16px; background:rgba(255,255,255,0.05); border-left:4px solid #F43F5E; border-radius:8px; font-style:italic; color:#fff; font-size:1rem; line-height:1.6;" id="read-capsule-content"></div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            <button class="btn btn-full" style="background:linear-gradient(135deg, #F97316, #D97706); color:#fff; border:none; font-weight:700;" onclick="document.getElementById('time-capsule-read-modal').classList.remove('active'); window.location.href='jurnal.html';">
              <span class="material-symbols-rounded">local_fire_department</span> Lepas Emosimu via "Bakar Beban" di Jurnal
            </button>
            <button class="btn btn-ghost btn-full" style="color:rgba(255,255,255,0.7);" onclick="document.getElementById('time-capsule-read-modal').classList.remove('active');">Tutup & Resapi Pesan Ini</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    const dateEl = modal.querySelector('#read-capsule-date');
    const contentEl = modal.querySelector('#read-capsule-content');
    if (dateEl) dateEl.innerText = capsule.date;
    if (contentEl) contentEl.innerText = `"${capsule.message}"`;
    modal.classList.add('active');
  }

  function showLowMoodRecommendationModal() {
    let modal = document.getElementById('low-mood-rec-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'low-mood-rec-modal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal" style="max-width:420px; text-align:center; background:linear-gradient(135deg, #1E293B, #0F172A); border:1px solid rgba(244,63,94,0.3); box-shadow:0 15px 35px rgba(0,0,0,0.5);">
          <span class="material-symbols-rounded" style="font-size:48px; color:#F43F5E;">favorite</span>
          <h3 style="font-weight:800; color:#fff; margin-top:8px;">Harimu Sedang Berat?</h3>
          <p style="color:rgba(255,255,255,0.85); font-size:0.875rem; margin-top:8px; line-height:1.5;">
            Tidak apa-apa, kamu tidak sendiri. Cobalah fitur katarsis kami yang bisa langsung melegakan perasaanmu saat ini:
          </p>
          <div style="display:flex; flex-direction:column; gap:10px; margin-top:20px;">
            <button class="btn btn-full" style="background:linear-gradient(135deg, #F97316, #D97706); color:#fff; border:none; font-weight:700; box-shadow:0 4px 15px rgba(249,115,22,0.35);" onclick="document.getElementById('low-mood-rec-modal').classList.remove('active'); window.location.href='jurnal.html';">
              <span class="material-symbols-rounded">local_fire_department</span> Coba "Bakar Beban" di Jurnal
            </button>
            <button class="btn btn-ghost btn-sm" style="margin-top:4px; color:rgba(255,255,255,0.7);" onclick="document.getElementById('low-mood-rec-modal').classList.remove('active');">Nanti Saja, Aku Cukup Istirahat</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }
    modal.classList.add('active');
  }

  // ---- Init Page ----
  const initPage = async (pageName, options = {}) => {
    const { showWelcome = true, showNav = true, showFooter = true, showTeman = true } = options;

    if (showWelcome) showWelcomeScreen();
    if (showNav) {
      createNavbar(pageName);
      createBottomNav(pageName);
    }
    if (showFooter) createFooter();
    if (showTeman) await TemanChat.init();

    Animations.init();
    
    if (typeof Settings !== 'undefined' && Settings.applyTheme) {
      Settings.applyTheme();
    }

    // ---- Global ESC Key Listener for Accessibility (a11y) ----
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        document.querySelectorAll('.modal-overlay.active, .welcome-modal-overlay.active').forEach(modal => {
          modal.classList.remove('active');
        });
        const onboardingModal = document.getElementById('interactive-onboarding-modal');
        if (onboardingModal && onboardingModal.classList.contains('active')) {
          onboardingModal.classList.remove('active');
        }
        if (typeof TemanChat !== 'undefined' && typeof TemanChat.close === 'function') {
          const chatContainer = document.getElementById('teman-chat');
          if (chatContainer && chatContainer.classList.contains('active')) {
            TemanChat.close();
          }
        }
      }
    });
  };

  // ---- Universal Clipboard Copy Helper for Emergency Numbers ----
  window.copyEmergencyNumber = function(number, label) {
    try {
      if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(number).then(() => {
          if (typeof Animations !== 'undefined' && Animations.showToast) {
            Animations.showToast(`Nomor ${label} (${number}) disalin ke papan klip!`, 'success', 3500);
          }
        }).catch(() => fallbackCopy(number, label));
      } else {
        fallbackCopy(number, label);
      }
    } catch(e) {
      fallbackCopy(number, label);
    }
  };

  function fallbackCopy(text, label) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-99999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand('copy');
      if (typeof Animations !== 'undefined' && Animations.showToast) {
        Animations.showToast(`Nomor ${label} (${text}) disalin ke papan klip!`, 'success', 3500);
      }
    } catch (err) {}
    document.body.removeChild(ta);
  }

  return { initPage, getGreetingText, logoSVG };
})();
