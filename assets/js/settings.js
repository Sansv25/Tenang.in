/* =============================================
   Tenang.in — Settings System
   Theme colors, Language, Settings popup
   ============================================= */

const Settings = (() => {
  // ---- Theme Presets ----
  const themes = [
    {
      id: 'ocean',
      name: 'Ocean Blue',
      accent: '#2563EB',
      accentHover: '#1D4ED8',
      secondary: '#38BDF8',
      bgPrimary: '#3B72C4',
      bgLight: '#4F84D4',
      bgSection: '#2B5EA0',
      bgDeep: '#1E4780',
      gradBody: 'radial-gradient(circle at 15% 20%, rgba(37,99,235,0.22) 0%, transparent 65%), radial-gradient(circle at 85% 80%, rgba(56,189,248,0.2) 0%, transparent 65%), linear-gradient(135deg, #090D16 0%, #172554 50%, #090D16 100%)',
      gradHero: 'linear-gradient(135deg, #5198DE 0%, #3270BF 50%, #2B5EA0 100%)',
      navBg: 'rgba(42, 80, 140, 0.8)',
      navBgScrolled: 'rgba(42, 80, 140, 0.95)',
      glowColor: 'rgba(110, 198, 232, 0.2)',
      selectionBg: 'rgba(110, 198, 232, 0.3)'
    },
    {
      id: 'lavender',
      name: 'Lavender Dream',
      accent: '#7C3AED',
      accentHover: '#6D28D9',
      secondary: '#C084FC',
      bgPrimary: '#6D28D9',
      bgLight: '#7C3AED',
      bgSection: '#5B21B6',
      bgDeep: '#4C1D95',
      gradBody: 'radial-gradient(circle at 15% 20%, rgba(124,58,237,0.22) 0%, transparent 65%), radial-gradient(circle at 85% 80%, rgba(192,132,252,0.2) 0%, transparent 65%), linear-gradient(135deg, #090D16 0%, #2E1065 50%, #090D16 100%)',
      gradHero: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 50%, #5B21B6 100%)',
      navBg: 'rgba(76, 29, 149, 0.8)',
      navBgScrolled: 'rgba(76, 29, 149, 0.95)',
      glowColor: 'rgba(192, 132, 252, 0.2)',
      selectionBg: 'rgba(192, 132, 252, 0.3)'
    },
    {
      id: 'emerald',
      name: 'Emerald Forest',
      accent: '#059669',
      accentHover: '#047857',
      secondary: '#34D399',
      bgPrimary: '#047857',
      bgLight: '#059669',
      bgSection: '#065F46',
      bgDeep: '#064E3B',
      gradBody: 'radial-gradient(circle at 15% 20%, rgba(5,150,105,0.22) 0%, transparent 65%), radial-gradient(circle at 85% 80%, rgba(52,211,153,0.2) 0%, transparent 65%), linear-gradient(135deg, #090D16 0%, #022C22 50%, #090D16 100%)',
      gradHero: 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)',
      navBg: 'rgba(6, 78, 59, 0.8)',
      navBgScrolled: 'rgba(6, 78, 59, 0.95)',
      glowColor: 'rgba(52, 211, 153, 0.2)',
      selectionBg: 'rgba(52, 211, 153, 0.3)'
    },
    {
      id: 'sunset',
      name: 'Sunset Coral',
      accent: '#EA580C',
      accentHover: '#C2410C',
      secondary: '#FB923C',
      bgPrimary: '#C2410C',
      bgLight: '#EA580C',
      bgSection: '#9A3412',
      bgDeep: '#7C2D12',
      gradBody: 'radial-gradient(circle at 15% 20%, rgba(234,88,12,0.22) 0%, transparent 65%), radial-gradient(circle at 85% 80%, rgba(251,146,60,0.2) 0%, transparent 65%), linear-gradient(135deg, #090D16 0%, #451A03 50%, #090D16 100%)',
      gradHero: 'linear-gradient(135deg, #FB923C 0%, #EA580C 50%, #C2410C 100%)',
      navBg: 'rgba(124, 45, 18, 0.8)',
      navBgScrolled: 'rgba(124, 45, 18, 0.95)',
      glowColor: 'rgba(251, 146, 60, 0.2)',
      selectionBg: 'rgba(251, 146, 60, 0.3)'
    },
    {
      id: 'rose',
      name: 'Rose Bloom',
      accent: '#DB2777',
      accentHover: '#BE185D',
      secondary: '#F472B6',
      bgPrimary: '#BE185D',
      bgLight: '#DB2777',
      bgSection: '#9D174D',
      bgDeep: '#831843',
      gradBody: 'radial-gradient(circle at 15% 20%, rgba(219,39,119,0.22) 0%, transparent 65%), radial-gradient(circle at 85% 80%, rgba(244,114,182,0.2) 0%, transparent 65%), linear-gradient(135deg, #090D16 0%, #4C0519 50%, #090D16 100%)',
      gradHero: 'linear-gradient(135deg, #F472B6 0%, #DB2777 50%, #BE185D 100%)',
      navBg: 'rgba(131, 24, 67, 0.8)',
      navBgScrolled: 'rgba(131, 24, 67, 0.95)',
      glowColor: 'rgba(244, 114, 182, 0.2)',
      selectionBg: 'rgba(244, 114, 182, 0.3)'
    },
    {
      id: 'teal',
      name: 'Midnight Teal',
      accent: '#0D9488',
      accentHover: '#0F766E',
      secondary: '#2DD4BF',
      bgPrimary: '#0F766E',
      bgLight: '#0D9488',
      bgSection: '#115E59',
      bgDeep: '#134E4A',
      gradBody: 'radial-gradient(circle at 15% 20%, rgba(13,148,136,0.22) 0%, transparent 65%), radial-gradient(circle at 85% 80%, rgba(45,212,191,0.2) 0%, transparent 65%), linear-gradient(135deg, #090D16 0%, #042F2E 50%, #090D16 100%)',
      gradHero: 'linear-gradient(135deg, #2DD4BF 0%, #0D9488 50%, #0F766E 100%)',
      navBg: 'rgba(19, 78, 74, 0.8)',
      navBgScrolled: 'rgba(19, 78, 74, 0.95)',
      glowColor: 'rgba(45, 212, 191, 0.2)',
      selectionBg: 'rgba(45, 212, 191, 0.3)'
    },
    {
      id: 'indigo',
      name: 'Royal Indigo',
      accent: '#4F46E5',
      accentHover: '#4338CA',
      secondary: '#818CF8',
      bgPrimary: '#4338CA',
      bgLight: '#4F46E5',
      bgSection: '#3730A3',
      bgDeep: '#312E81',
      gradBody: 'radial-gradient(circle at 15% 20%, rgba(79,70,229,0.22) 0%, transparent 65%), radial-gradient(circle at 85% 80%, rgba(129,140,248,0.2) 0%, transparent 65%), linear-gradient(135deg, #090D16 0%, #1E1B4B 50%, #090D16 100%)',
      gradHero: 'linear-gradient(135deg, #818CF8 0%, #4F46E5 50%, #4338CA 100%)',
      navBg: 'rgba(49, 46, 129, 0.8)',
      navBgScrolled: 'rgba(49, 46, 129, 0.95)',
      glowColor: 'rgba(129, 140, 248, 0.2)',
      selectionBg: 'rgba(129, 140, 248, 0.3)'
    },
    {
      id: 'amber',
      name: 'Golden Amber',
      accent: '#D97706',
      accentHover: '#B45309',
      secondary: '#FBBF24',
      bgPrimary: '#B45309',
      bgLight: '#D97706',
      bgSection: '#92400E',
      bgDeep: '#78350F',
      gradBody: 'radial-gradient(circle at 15% 20%, rgba(217,119,6,0.22) 0%, transparent 65%), radial-gradient(circle at 85% 80%, rgba(251,191,36,0.2) 0%, transparent 65%), linear-gradient(135deg, #090D16 0%, #451A03 50%, #090D16 100%)',
      gradHero: 'linear-gradient(135deg, #FBBF24 0%, #D97706 50%, #B45309 100%)',
      navBg: 'rgba(120, 53, 15, 0.8)',
      navBgScrolled: 'rgba(120, 53, 15, 0.95)',
      glowColor: 'rgba(251, 191, 36, 0.2)',
      selectionBg: 'rgba(251, 191, 36, 0.3)'
    }
  ];

  // ---- Get / Set Theme ----
  const getThemeId = () => localStorage.getItem('tenang_theme') || 'ocean';
  const getTheme = () => themes.find(t => t.id === getThemeId()) || themes[0];

  const setTheme = (themeId) => {
    localStorage.setItem('tenang_theme', themeId);
    applyTheme();
  };

  // ---- Apply Theme to CSS ----
  const applyTheme = () => {
    const theme = getTheme();
    const mode = getMode();
    const isDark = mode === 'dark';
    const root = document.documentElement.style;

    // Default to ocean for index page so Fitur Unggulan and other index elements stay blue
    const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
    const effectiveTheme = isIndex ? themes.find(t => t.id === 'ocean') : theme;

    root.setProperty('--bg-primary', effectiveTheme.bgPrimary);
    root.setProperty('--bg-primary-light', effectiveTheme.bgLight);
    root.setProperty('--bg-section-dark', effectiveTheme.bgSection);
    root.setProperty('--bg-deep', effectiveTheme.bgDeep);
    root.setProperty('--primary-accent', effectiveTheme.accent);
    root.setProperty('--primary-hover', effectiveTheme.accentHover);
    root.setProperty('--secondary-accent', effectiveTheme.secondary);

    // Body background — dynamically styled per theme & mode
    if (!isIndex) {
      if (isDark) {
        document.body.style.background = effectiveTheme.gradBody;
      } else {
        document.body.style.background = effectiveTheme.gradHero;
      }
      document.body.style.backgroundAttachment = 'fixed';
    }

    // Navbar
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.background = isDark ? 'rgba(15, 23, 42, 0.9)' : effectiveTheme.navBg;
    }

    // Update pseudo-element glow colors via CSS variables
    root.setProperty('--theme-glow', effectiveTheme.glowColor);
    root.setProperty('--theme-selection', effectiveTheme.selectionBg);
    root.setProperty('--theme-nav-bg', effectiveTheme.navBg);
    root.setProperty('--theme-nav-bg-scrolled', effectiveTheme.navBgScrolled);

    // Update active swatches
    document.querySelectorAll('.settings-color-swatch').forEach(s => {
      s.classList.toggle('active', s.dataset.theme === theme.id);
    });
  };

  // ---- Get / Set Mode (Light / Dark Mode) ----
  const getMode = () => localStorage.getItem('tenang_mode') || 'light';

  const setMode = (mode) => {
    localStorage.setItem('tenang_mode', mode);
    applyMode();
  };

  const applyMode = () => {
    const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/') || window.location.pathname === '';
    
    // On index.html, completely disable dark mode so the landing page retains its original vibrant design & light/gradient buttons
    if (isIndex) {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      const root = document.documentElement.style;
      root.setProperty('--card-surface', '#FFFFFF');
      root.setProperty('--card-bg', '#FFFFFF');
      root.setProperty('--card-subtle', '#F8FAFC');
      root.setProperty('--card-border', 'rgba(226, 232, 240, 0.8)');
      root.setProperty('--text-on-white', '#1A2F4E');
      root.setProperty('--text-secondary', '#475569');
      root.setProperty('--input-bg', '#F8FAFC');
      root.setProperty('--input-border', '#E2E8F0');
      return;
    }

    const mode = getMode();
    const isDark = mode === 'dark';
    const root = document.documentElement.style;

    if (isDark) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
      root.setProperty('--card-surface', '#1E293B');
      root.setProperty('--card-bg', '#1E293B');
      root.setProperty('--card-subtle', '#0F172A');
      root.setProperty('--card-border', 'rgba(255, 255, 255, 0.12)');
      root.setProperty('--text-on-white', '#F8FAFC');
      root.setProperty('--text-secondary', '#CBD5E1');
      root.setProperty('--input-bg', '#0F172A');
      root.setProperty('--input-border', 'rgba(255, 255, 255, 0.15)');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
      root.setProperty('--card-surface', '#FFFFFF');
      root.setProperty('--card-bg', '#FFFFFF');
      root.setProperty('--card-subtle', '#F8FAFC');
      root.setProperty('--card-border', 'rgba(226, 232, 240, 0.8)');
      root.setProperty('--text-on-white', '#1A2F4E');
      root.setProperty('--text-secondary', '#475569');
      root.setProperty('--input-bg', '#F8FAFC');
      root.setProperty('--input-border', '#E2E8F0');
    }

    document.querySelectorAll('.settings-mode-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    // Re-apply theme to sync background gradient with current mode & selected color
    const theme = getTheme();
    const effectiveTheme = isIndex ? themes.find(t => t.id === 'ocean') : theme;
    if (!isIndex && effectiveTheme) {
      if (isDark) {
        document.body.style.background = effectiveTheme.gradBody;
      } else {
        document.body.style.background = effectiveTheme.gradHero;
      }
      document.body.style.backgroundAttachment = 'fixed';
    }
  };

  // ---- Apply Language ----
  const applyLanguage = () => {
    if (typeof I18n !== 'undefined') {
      I18n.applyToDom();
      document.documentElement.lang = I18n.getLang();
    }
  };

  // ---- Settings Popup HTML ----
  const renderSettingsPopup = () => {
    // Remove existing
    const existing = document.getElementById('settings-popup-overlay');
    if (existing) existing.remove();

    const currentTheme = getThemeId();
    const currentMode = getMode();
    const currentLang = typeof I18n !== 'undefined' ? I18n.getLang() : 'id';
    const t = typeof I18n !== 'undefined' ? I18n.t : (k) => k;
    const langMeta = typeof I18n !== 'undefined' ? I18n.langMeta : {};

    const avatar = (typeof Storage !== 'undefined' && Storage.getUserAvatar) ? Storage.getUserAvatar() : null;
    const uName = (typeof Storage !== 'undefined' && Storage.getUserName) ? Storage.getUserName() : '';

    const overlay = document.createElement('div');
    overlay.id = 'settings-popup-overlay';
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
      <div class="settings-popup" id="settings-popup">
        <div class="settings-header">
          <div class="settings-header-title">
            <span class="material-symbols-rounded" style="font-size:24px;">settings</span>
            <h3>${t('settings.title')}</h3>
          </div>
          <button class="settings-close-btn" onclick="Settings.close()" aria-label="${t('settings.close')}">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>

        <div class="settings-body">
          <!-- Profile Navigation Section (Above WARNA TEMA) -->
          <div class="settings-section" style="margin-bottom:24px;">
            <div class="settings-section-label" style="margin-bottom:12px;">
              <span class="material-symbols-rounded" style="font-size:20px;">account_circle</span>
              <span>Profil Pengguna</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; padding:14px 16px; background:var(--card-subtle, #F8FAFC); border-radius:16px; border:1px solid rgba(0,0,0,0.06); box-shadow:0 2px 8px rgba(0,0,0,0.03);">
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="width:48px; height:48px; border-radius:50%; background:linear-gradient(135deg, var(--primary-accent), var(--secondary-accent)); display:flex; align-items:center; justify-content:center; overflow:hidden; border:2px solid #fff; box-shadow:0 3px 10px rgba(0,0,0,0.12); flex-shrink:0;">
                  ${avatar ? `<img src="${avatar}" alt="Foto Profil" style="width:100%; height:100%; object-fit:cover;">` : `<span class="material-symbols-rounded" style="font-size:28px; color:#fff;">person</span>`}
                </div>
                <div>
                  <div style="font-weight:750; font-size:0.95rem; color:var(--text-on-white);">${uName || 'Pengguna'}</div>
                  <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">Atur foto avatar & nama</div>
                </div>
              </div>
              <a href="profil.html" class="btn btn-primary btn-sm" onclick="Settings.close()" style="font-size:0.8rem; font-weight:700; padding:8px 16px; text-decoration:none; display:inline-flex; align-items:center; gap:6px; border-radius:12px; flex-shrink:0;">
                <span class="material-symbols-rounded" style="font-size:16px;">tune</span>
                <span>Buka Profil</span>
              </a>
            </div>
          </div>

          <!-- Appearance Mode Section (Light / Dark Mode) -->
          <div class="settings-section" style="margin-bottom:24px;">
            <div class="settings-section-label">
              <span class="material-symbols-rounded" style="font-size:20px;">dark_mode</span>
              <span>Mode Tampilan</span>
            </div>
            <div class="settings-mode-grid">
              <button class="settings-mode-btn ${currentMode === 'light' ? 'active' : ''}"
                      data-mode="light"
                      onclick="Settings.setMode('light')"
                      aria-label="Mode Terang">
                <span class="material-symbols-rounded" style="font-size:22px; color:#F59E0B;">light_mode</span>
                <span class="mode-name">Mode Terang</span>
              </button>
              <button class="settings-mode-btn ${currentMode === 'dark' ? 'active' : ''}"
                      data-mode="dark"
                      onclick="Settings.setMode('dark')"
                      aria-label="Mode Gelap">
                <span class="material-symbols-rounded" style="font-size:22px; color:#818CF8;">dark_mode</span>
                <span class="mode-name">Mode Gelap</span>
              </button>
            </div>
          </div>

          <!-- Theme Color Section -->
          <div class="settings-section">
            <div class="settings-section-label">
              <span class="material-symbols-rounded" style="font-size:20px;">palette</span>
              <span>${t('settings.theme.title')}</span>
            </div>
            <div class="settings-color-grid">
              ${themes.map(th => `
                <button class="settings-color-swatch ${th.id === currentTheme ? 'active' : ''}"
                        data-theme="${th.id}"
                        onclick="Settings.setTheme('${th.id}')"
                        title="${th.name}"
                        aria-label="${th.name}">
                  <span class="swatch-color" style="background: linear-gradient(135deg, ${th.accent}, ${th.secondary});"></span>
                  <span class="swatch-check"><span class="material-symbols-rounded" style="font-size:16px;">check</span></span>
                  <span class="swatch-name">${th.name}</span>
                </button>
              `).join('')}
            </div>
          </div>

          <!-- Language Section -->
          <div class="settings-section">
            <div class="settings-section-label">
              <span class="material-symbols-rounded" style="font-size:20px;">translate</span>
              <span>${t('settings.lang.title')}</span>
            </div>
            <div class="settings-lang-grid">
              ${Object.entries(langMeta).map(([code, meta]) => `
                <button class="settings-lang-btn ${code === currentLang ? 'active' : ''}"
                        data-lang="${code}"
                        onclick="Settings.changeLang('${code}')">
                  <span class="lang-flag">${meta.flag}</span>
                  <span class="lang-name">${meta.nativeName}</span>
                </button>
              `).join('')}
            </div>
          <!-- Account Section -->
          <div class="settings-section" style="margin-top:32px;">
            <button class="settings-lang-btn" style="color:#EF4444; border-color:rgba(239, 68, 68, 0.2); background:rgba(239, 68, 68, 0.05); width:100%; justify-content:center;" onclick="Settings.logout()">
              <span class="material-symbols-rounded">logout</span>
              <span class="lang-name" style="color:#EF4444;">${t('beranda.logout') || 'Keluar dari Akun'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) Settings.close();
    });
  };

  // ---- Close Settings ----
  const close = () => {
    const overlay = document.getElementById('settings-popup-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  };

  // ---- Open Settings ----
  const open = () => {
    renderSettingsPopup();
  };

  // ---- Change Language ----
  const changeLang = (lang) => {
    if (typeof I18n !== 'undefined') {
      I18n.setLang(lang);

      // If popup is open, re-render it
      const overlay = document.getElementById('settings-popup-overlay');
      if (overlay) {
        renderSettingsPopup();
      }

      // Update landing dropdown if it exists
      const landingDropdownBtn = document.querySelector('.landing-lang-current');
      if (landingDropdownBtn && I18n.langMeta[lang]) {
        landingDropdownBtn.innerHTML = I18n.langMeta[lang].flag;
      }

      // Update active state in landing dropdown
      document.querySelectorAll('.landing-lang-option').forEach(opt => {
        opt.classList.toggle('active', opt.getAttribute('onclick').includes(`'${lang}'`));
      });
    }
  };

  // ---- Logout ----
  const logout = () => {
    localStorage.removeItem('tenang_logged_in_user');

    // Attempt to update greeting if on beranda
    const greetingEl = document.getElementById('greeting-text');
    if (greetingEl) greetingEl.textContent = 'Selamat Datang!';

    if (typeof Animations !== 'undefined') {
      Animations.showToast('Kamu telah berhasil keluar. Mengalihkan ke halaman utama...', 'info');
    }

    close();

    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  };

  // ---- Notification Popup ----
  const renderNotifications = () => {
    const existing = document.getElementById('notif-popup-overlay');
    if (existing) existing.remove();

    const t = typeof I18n !== 'undefined' ? I18n.t : (k) => k;
    const streak = typeof Storage !== 'undefined' ? Storage.getStreak() : 0;
    const moodToday = typeof Storage !== 'undefined' ? Storage.getMoodToday() : null;
    const badges = typeof Storage !== 'undefined' ? Storage.getBadges() : [];
    const newBadges = badges.filter(b => b.earned);
    const journals = typeof Storage !== 'undefined' ? Storage.getJournals() : [];
    const todayKey = typeof Storage !== 'undefined' ? Storage.todayKey() : '';
    const hasJournalToday = journals.some(j => j.date === todayKey);

    let notifItems = [];

    if (streak >= 1) {
      notifItems.push({
        icon: 'local_fire_department',
        color: '#F59E0B',
        text: t('notif.streak', { count: streak })
      });
    }

    if (!moodToday) {
      notifItems.push({
        icon: 'sentiment_neutral',
        color: '#38BDF8',
        text: t('notif.nocheckin')
      });
    }

    if (!hasJournalToday) {
      notifItems.push({
        icon: 'edit_note',
        color: '#10B981',
        text: t('notif.journal.remind')
      });
    }

    if (newBadges.length > 0) {
      notifItems.push({
        icon: 'military_tech',
        color: '#8B5CF6',
        text: `${newBadges.length} ${t('notif.newbadge')}`
      });
    }

    const overlay = document.createElement('div');
    overlay.id = 'notif-popup-overlay';
    overlay.className = 'settings-overlay';
    overlay.innerHTML = `
      <div class="settings-popup notif-popup" id="notif-popup">
        <div class="settings-header">
          <div class="settings-header-title">
            <span class="material-symbols-rounded" style="font-size:24px;">notifications</span>
            <h3>${t('notif.title')}</h3>
          </div>
          <button class="settings-close-btn" onclick="Settings.closeNotif()" aria-label="${t('settings.close')}">
            <span class="material-symbols-rounded">close</span>
          </button>
        </div>
        <div class="settings-body">
          ${notifItems.length === 0 ? `
            <div class="notif-empty">
              <span class="material-symbols-rounded" style="font-size:48px; color:var(--text-muted);">notifications_none</span>
              <p>${t('notif.empty')}</p>
            </div>
          ` : notifItems.map(item => `
            <div class="notif-item">
              <div class="notif-item-icon" style="background: ${item.color}20; color: ${item.color};">
                <span class="material-symbols-rounded" style="font-size:22px;">${item.icon}</span>
              </div>
              <span class="notif-item-text">${item.text}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) Settings.closeNotif();
    });
  };

  const closeNotif = () => {
    const overlay = document.getElementById('notif-popup-overlay');
    if (overlay) {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 300);
    }
  };

  // ---- Language Dropdown for Index Navbar ----
  const renderLandingLangDropdown = () => {
    const navRight = document.querySelector('.landing-nav-right');
    if (!navRight) return;

    // Mencegah duplikasi tombol bahasa
    if (document.querySelector('.landing-lang-wrapper')) return;

    const currentLang = typeof I18n !== 'undefined' ? I18n.getLang() : 'id';
    const langMeta = typeof I18n !== 'undefined' ? I18n.langMeta : {};
    const currentMeta = langMeta[currentLang] || { flag: '🌐', nativeName: 'ID' };

    const wrapper = document.createElement('div');
    wrapper.className = 'landing-lang-wrapper';
    wrapper.innerHTML = `
      <button class="landing-lang-btn" id="landing-lang-toggle" aria-label="Change language">
        <span class="material-symbols-rounded" style="font-size:20px;">translate</span>
        <span class="landing-lang-current">${currentMeta.flag}</span>
      </button>
      <div class="landing-lang-dropdown" id="landing-lang-dropdown">
        ${Object.entries(langMeta).map(([code, meta]) => `
          <button class="landing-lang-option ${code === currentLang ? 'active' : ''}"
                  onclick="Settings.changeLang('${code}')">
            <span>${meta.flag}</span>
            <span>${meta.nativeName}</span>
          </button>
        `).join('')}
      </div>
    `;

    // Insert before the Mulai button
    const startBtn = navRight.querySelector('.btn-rounded-start');
    if (startBtn) {
      navRight.insertBefore(wrapper, startBtn);
    } else {
      navRight.appendChild(wrapper);
    }

    // Toggle dropdown
    const toggle = wrapper.querySelector('#landing-lang-toggle');
    const dropdown = wrapper.querySelector('#landing-lang-dropdown');
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    document.addEventListener('click', () => {
      dropdown.classList.remove('active');
    });
  };

  // ---- Init (called on every page load) ----
  const init = () => {
    applyTheme();
    applyMode();
    applyLanguage();
  };

  return {
    themes, getTheme, getThemeId, setTheme,
    getMode, setMode, applyMode,
    applyTheme, applyLanguage,
    open, close,
    renderNotifications, closeNotif,
    renderLandingLangDropdown,
    changeLang, logout, init
  };
})();

// Auto-apply theme & mode on page load (before DOMContentLoaded for faster paint)
Settings.applyTheme();
Settings.applyMode();
