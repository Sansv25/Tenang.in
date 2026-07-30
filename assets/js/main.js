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
      <p class="welcome-tagline">Ruang amanmu untuk refleksi diri 💙</p>
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
              <button class="bottom-nav-action" onclick="if(typeof showCheckInModal === 'function'){ showCheckInModal(); } else { window.location.href='beranda.html'; }" aria-label="Quick Action">
                <span class="material-symbols-rounded">add</span>
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
            <span>Tenang.in adalah ruang refleksi diri dan bukan pengganti konsultasi profesional. Jika kamu merasa butuh bantuan lebih, jangan ragu menghubungi psikolog atau konselor profesional. Semua data tersimpan hanya di perangkatmu (localStorage).</span>
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

    if (hour < 11) greeting = 'Selamat Pagi';
    else if (hour < 15) greeting = 'Selamat Siang';
    else if (hour < 18) greeting = 'Selamat Sore';
    else greeting = 'Selamat Malam';

    return name ? `${greeting}, ${name}! 👋` : `${greeting}! 👋`;
  };

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
  };

  return { initPage, getGreetingText, logoSVG };
})();
