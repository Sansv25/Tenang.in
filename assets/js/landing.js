/* =============================================
   Tenang.in, Landing Page Script
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  document.body.classList.remove('preloader-active');
  const heroReveals = document.querySelectorAll('#hero .reveal');
  heroReveals.forEach(el => el.classList.add('active'));

  // ---- Landing Navbar Scroll Effect ----
  const landingNav = document.getElementById('landing-navbar');
  if (landingNav) {
    window.addEventListener('scroll', () => {
      landingNav.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ---- Interactive Hover Hero Engine (CryptoHub Style) ----
  const interactiveLines = document.querySelectorAll('.interactive-line');
  const iconGroups = document.querySelectorAll('.icon-group');
  const titleStage = document.getElementById('interactive-hero-title');

  if (interactiveLines.length > 0 && iconGroups.length > 0) {
    const switchHeroState = (targetState, isHovering = true) => {
      // Jika isHovering = false (saat tidak di-hover / Idle), pastikan semua baris teks putih bersih tanpa efek highlight
      interactiveLines.forEach(line => {
        if (isHovering && line.getAttribute('data-target') === targetState) {
          line.classList.add('is-active');
        } else {
          line.classList.remove('is-active');
        }
      });

      // Toggle floating icon groups smoothly
      iconGroups.forEach(group => {
        if (group.getAttribute('data-group') === targetState) {
          group.classList.add('active');
        } else {
          group.classList.remove('active');
        }
      });
    };

    // Initialize in clean Idle state (semua kalimat teks normal abu-abu/putih murni, dengan ikon ketenangan tersebar di latar)
    switchHeroState('calm', false);

    // Attach mouse enter events to each interactive line (Hanya menyala ketika benar-benar disorot mouse!)
    interactiveLines.forEach(line => {
      line.addEventListener('mouseenter', () => {
        const targetState = line.getAttribute('data-target');
        switchHeroState(targetState, true);
      });

      // Support for touch/mobile screens (tap to preview icons)
      line.addEventListener('click', (e) => {
        const targetState = line.getAttribute('data-target');
        switchHeroState(targetState, true);
      });
    });

    // When mouse leaves the title area, gently reset to clean Idle 'calm' state tanpa highlight teks
    const resetToDefault = () => {
      switchHeroState('calm', false);
    };

    if (titleStage) {
      titleStage.addEventListener('mouseleave', resetToDefault);
    }
  }

  // ---- Stats Counter Animation ----
  const statElements = document.querySelectorAll('[data-count]');
  if (statElements.length > 0) {
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          let target = parseInt(entry.target.dataset.count);
          // Load dynamic additions from localStorage if Storage is initialized
          if (target === 5000 && typeof Storage !== 'undefined') {
            target += Storage.getMoods().length;
          } else if (target === 1500 && typeof Storage !== 'undefined') {
            target += (Storage.getMoods().length > 0 ? 1 : 0);
          }
          Animations.animateCounter(entry.target, target, 2000);
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    statElements.forEach(el => statsObserver.observe(el));
  }

  // ---- Custom AOS (Animate On Scroll) Pure Vanilla Engine ----
  const aosElements = document.querySelectorAll('[data-aos], .reveal');
  if (aosElements.length > 0) {
    const aosObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-aos-delay') || el.style.getPropertyValue('--reveal-delay');
          const delayMs = delay ? parseInt(String(delay).replace('ms', ''), 10) : 0;

          if (delayMs > 0) {
            el.style.transitionDelay = `${delayMs}ms`;
            setTimeout(() => {
              el.classList.add('aos-animate', 'active');
            }, delayMs);
          } else {
            el.classList.add('aos-animate', 'active');
          }
          aosObserver.unobserve(el);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.05
    });

    aosElements.forEach(el => {
      if (!el.closest('#hero')) {
        aosObserver.observe(el);
      }
    });
  }

  // ---- Auth Modal Trigger & Routing ----
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('showAuth') === 'true') {
    // Wait for preloader transition to finish
    setTimeout(() => {
      showAuthModal();
    }, 2500);
  }

  const authForm = document.getElementById('auth-form');
  if (authForm) {
    authForm.addEventListener('submit', handleAuthSubmit);
  }
});

// ---- Auth Actions (Login / Register Popup) ----
let currentAuthTab = 'login';

function handleMulaiSekarang(e) {
  if (e && typeof e.preventDefault === 'function') {
    e.preventDefault();
  }
  const loggedInUser = localStorage.getItem('tenang_logged_in_user') || localStorage.getItem('tenang_active_user') || localStorage.getItem('tenang_user_id');
  if (loggedInUser) {
    window.location.href = 'beranda.html';
  } else {
    showAuthModal();
  }
}

// ---- Onboarding Modal Navigation Logic ----
let currentStep = 1;
const totalSteps = 5;

document.addEventListener('DOMContentLoaded', () => {
  // Event listeners untuk tombol mulai sekarang (kecuali open-teman-chat)
  document.querySelectorAll('.btn-mulai-sekarang').forEach(btn => {
    if (btn.getAttribute('data-action') === 'open-teman-chat') return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleMulaiSekarang();
    });
  });

  // Pilihan goal pada step 3
  document.querySelectorAll('.onboarding-choices .choice-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.onboarding-choices .choice-btn').forEach(b => b.classList.remove('selected'));
      this.classList.add('selected');
      localStorage.setItem('tenang_user_goal', this.getAttribute('data-value') || '');
    });
  });

  const nextBtn = document.getElementById('onboarding-next');
  const backBtn = document.getElementById('onboarding-back');

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentStep < totalSteps) {
        const curStepEl = document.querySelector(`[data-step="${currentStep}"]`);
        if (curStepEl) curStepEl.style.display = 'none';
        currentStep++;
        const nextStepEl = document.querySelector(`[data-step="${currentStep}"]`);
        if (nextStepEl) nextStepEl.style.display = 'flex';
        updateDots();
        if (backBtn) backBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
        if (currentStep === totalSteps) {
          nextBtn.textContent = 'Mulai →';
        }
      } else {
        // Last step, save to localStorage and redirect
        localStorage.setItem('tenang_returning', 'true');
        localStorage.setItem('tenang_isReturning', 'true');
        const modal = document.getElementById('onboarding-modal');
        if (modal) modal.style.display = 'none';
        window.location.href = 'beranda.html';
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener('click', () => {
      const curStepEl = document.querySelector(`[data-step="${currentStep}"]`);
      if (curStepEl) curStepEl.style.display = 'none';
      currentStep--;
      const prevStepEl = document.querySelector(`[data-step="${currentStep}"]`);
      if (prevStepEl) prevStepEl.style.display = 'flex';
      updateDots();
      backBtn.style.display = currentStep > 1 ? 'inline-block' : 'none';
      if (nextBtn) nextBtn.textContent = 'Lanjut →';
    });
  }
});

function updateDots() {
  document.querySelectorAll('.step-dots .dot').forEach((dot, i) => {
    dot.classList.toggle('active', i < currentStep);
  });
}

function showAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('active');

  // Reset fields
  const emailInput = document.getElementById('auth-email');
  const usernameInput = document.getElementById('auth-username');
  const passwordInput = document.getElementById('auth-password');
  const confirmInput = document.getElementById('auth-confirm-password');
  const errorMsg = document.getElementById('auth-error-msg');
  if (emailInput) emailInput.value = '';
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
  if (confirmInput) confirmInput.value = '';
  if (errorMsg) errorMsg.style.display = 'none';

  switchAuthTab(currentAuthTab || 'login');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('active');
}

function switchAuthTab(tab) {
  currentAuthTab = tab;
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const authBtn = document.getElementById('auth-btn');
  const dividerText = document.getElementById('auth-divider-text');
  const emailGroup = document.getElementById('auth-email-group');
  const emailInput = document.getElementById('auth-email');
  const usernameLabel = document.getElementById('auth-username-label');
  const usernameIcon = document.getElementById('auth-username-icon');
  const usernameInput = document.getElementById('auth-username');
  const confirmGroup = document.getElementById('auth-confirm-group');
  const confirmInput = document.getElementById('auth-confirm-password');
  const forgotWrap = document.getElementById('auth-forgot-wrap');
  const footerSwitch = document.getElementById('auth-footer-switch');
  const errorMsg = document.getElementById('auth-error-msg');

  if (errorMsg) errorMsg.style.display = 'none';

  if (tab === 'login') {
    if (authTitle) authTitle.textContent = 'Masuk ke Tenang.in';
    if (authSubtitle) authSubtitle.textContent = 'Mari lanjutkan perjalanan refleksi dirimu.';
    if (dividerText) dividerText.textContent = 'ATAU MASUK DENGAN USERNAME / EMAIL';
    if (authBtn) authBtn.textContent = 'Masuk';

    if (emailGroup) emailGroup.style.display = 'none';
    if (emailInput) emailInput.required = false;

    if (usernameLabel) usernameLabel.textContent = 'Username atau Email';
    if (usernameIcon) usernameIcon.textContent = 'mail';
    if (usernameInput) {
      usernameInput.placeholder = 'Masukkan username atau email...';
      usernameInput.removeAttribute('maxlength');
    }

    if (confirmGroup) confirmGroup.style.display = 'none';
    if (confirmInput) confirmInput.required = false;
    if (forgotWrap) forgotWrap.style.display = 'block';

    if (footerSwitch) {
      footerSwitch.innerHTML = `Belum punya akun? <a href="#" data-action="switch-auth-tab" data-tab="register" class="auth-switch-link">Daftar</a>`;
    }
  } else {
    if (authTitle) authTitle.textContent = 'Daftar ke Tenang.in';
    if (authSubtitle) authSubtitle.textContent = 'Mulai langkah awal ruang amanmu hari ini.';
    if (dividerText) dividerText.textContent = 'ATAU DAFTAR DENGAN EMAIL & USERNAME';
    if (authBtn) authBtn.textContent = 'Daftar Sekarang';

    if (emailGroup) emailGroup.style.display = 'block';
    if (emailInput) emailInput.required = true;

    if (usernameLabel) usernameLabel.textContent = 'Username (Maksimal 10 Karakter)';
    if (usernameIcon) usernameIcon.textContent = 'person';
    if (usernameInput) {
      usernameInput.placeholder = 'Username (maksimal 10 huruf)...';
      usernameInput.setAttribute('maxlength', '10');
    }

    if (confirmGroup) confirmGroup.style.display = 'block';
    if (confirmInput) confirmInput.required = true;
    if (forgotWrap) forgotWrap.style.display = 'none';

    if (footerSwitch) {
      footerSwitch.innerHTML = `Sudah punya akun? <a href="#" data-action="switch-auth-tab" data-tab="login" class="auth-switch-link">Masuk</a>`;
    }
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const emailInput = document.getElementById('auth-email');
  const usernameInput = document.getElementById('auth-username');
  const passwordInput = document.getElementById('auth-password');
  const confirmInput = document.getElementById('auth-confirm-password');

  if (!usernameInput || !passwordInput) return;

  const password = passwordInput.value;

  // Load existing users
  let users = [];
  try {
    const rawUsers = localStorage.getItem('tenang_users');
    users = rawUsers ? JSON.parse(rawUsers) : [];
  } catch (err) {
    users = [];
  }

  if (currentAuthTab === 'register') {
    const email = emailInput ? emailInput.value.trim() : '';
    const username = usernameInput.value.trim();

    if (!email || !username || !password) {
      showAuthError('Email, username, dan kata sandi wajib diisi.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      showAuthError('Format email tidak valid.');
      return;
    }

    if (username.length > 10) {
      showAuthError('Username maksimal 10 karakter.');
      return;
    }

    if (confirmInput && confirmInput.value !== password) {
      showAuthError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    // Check if email already exists
    const emailExists = users.some(u => u.email && u.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      showAuthError('Email ini sudah terdaftar. Silakan gunakan email lain atau masuk.');
      return;
    }

    // Check if username already exists
    const usernameExists = users.some(u => u.username && u.username.toLowerCase() === username.toLowerCase());
    if (usernameExists) {
      showAuthError('Username ini sudah terdaftar. Silakan pilih username lain.');
      return;
    }

    // Register user
    users.push({ username, email, password });
    localStorage.setItem('tenang_users', JSON.stringify(users));

    // Save session
    localStorage.setItem('tenang_logged_in_user', username);
    localStorage.setItem('tenang_username', username);
    localStorage.setItem('tenang_user_email', email);

    Animations.showToast('Pendaftaran berhasil! Mengalihkan ke ruang tenangmu...', 'success');
    closeAuthModal();
    setTimeout(() => {
      window.location.href = 'beranda.html';
    }, 800);
  } else {
    // Login check (Username OR Email)
    const loginValue = usernameInput.value.trim();

    if (!loginValue || !password) {
      showAuthError('Username/Email dan kata sandi harus diisi.');
      return;
    }

    const user = users.find(u => {
      const matchUsername = u.username && u.username.toLowerCase() === loginValue.toLowerCase();
      const matchEmail = u.email && u.email.toLowerCase() === loginValue.toLowerCase();
      return (matchUsername || matchEmail) && u.password === password;
    });

    if (!user) {
      showAuthError('Username/Email atau kata sandi yang Anda masukkan salah.');
      return;
    }

    // Save session
    localStorage.setItem('tenang_logged_in_user', user.username || loginValue);
    localStorage.setItem('tenang_username', user.username || loginValue);
    if (user.email) localStorage.setItem('tenang_user_email', user.email);

    Animations.showToast(`Berhasil masuk! Selamat datang kembali, ${user.username || loginValue}.`, 'success');
    closeAuthModal();
    setTimeout(() => {
      window.location.href = 'beranda.html';
    }, 800);
  }
}

function showAuthError(msg) {
  const errorMsg = document.getElementById('auth-error-msg');
  if (errorMsg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }
}

// ---- Additional Helper Methods for Premium Auth UI ----
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = btn.querySelector('.material-symbols-rounded');
  if (input.type === 'password') {
    input.type = 'text';
    if (icon) icon.textContent = 'visibility';
  } else {
    input.type = 'password';
    if (icon) icon.textContent = 'visibility_off';
  }
}

function handleSocialAuth(provider) {
  const simulatedUsername = 'Sanjaya';
  Animations.showToast(`Menghubungkan ke ${provider}...`, 'info', 1500);

  setTimeout(() => {
    localStorage.setItem('tenang_logged_in_user', simulatedUsername);
    localStorage.setItem('tenang_username', simulatedUsername);
    Animations.showToast(`Berhasil masuk via ${provider}!`, 'success');
    closeAuthModal();
    setTimeout(() => {
      window.location.href = 'beranda.html';
    }, 600);
  }, 1200);
}

function handleForgotPassword() {
  Animations.showToast('Untuk keamanan akunmu, silakan daftar dengan username alternatif ya!', 'info', 4000);
}

// ---- Interactive Calm Particle Animation (Stardust / Ocean Light Motes) ----
let calmAnimId = null;
let auroraAnimId = null;

function initCalmParticles() {
  const canvas = document.getElementById('calmParticles');
  if (!canvas || !canvas.parentElement) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  // Create serene oceanic light motes
  const particleCount = Math.min(Math.floor((width * height) / 14000), 45);
  const colors = [
    'rgba(56, 189, 248, ',  // Sky cyan
    'rgba(129, 140, 248, ', // Soft indigo
    'rgba(255, 255, 255, ', // Starlight white
    'rgba(125, 211, 252, '  // Light aqua
  ];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.6 + 1,
      speedX: (Math.random() - 0.5) * 0.35,
      speedY: (Math.random() - 0.5) * 0.35 - 0.15, // Slight gentle upward drift
      opacity: Math.random() * 0.6 + 0.2,
      color: colors[Math.floor(Math.random() * colors.length)],
      pulseSpeed: Math.random() * 0.015 + 0.005,
      pulseDirection: Math.random() < 0.5 ? 1 : -1
    });
  }

  function renderFrame() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      // Update position
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around edges seamlessly
      if (p.x < -10) p.x = width + 10;
      if (p.x > width + 10) p.x = -10;
      if (p.y < -10) p.y = height + 10;
      if (p.y > height + 10) p.y = -10;

      // Gentle pulsing opacity (bioluminescence effect)
      p.opacity += p.pulseSpeed * p.pulseDirection;
      if (p.opacity > 0.82) {
        p.opacity = 0.82;
        p.pulseDirection = -1;
      } else if (p.opacity < 0.18) {
        p.opacity = 0.18;
        p.pulseDirection = 1;
      }

      // Draw glowing stardust mote
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color + '0.8)';
      ctx.fill();
      ctx.shadowBlur = 0; // Reset shadow for peak CPU performance
    });
  }

  function animate() {
    renderFrame();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileOrTablet = window.innerWidth <= 1024;
    if (!prefersReducedMotion && !isMobileOrTablet) {
      calmAnimId = requestAnimationFrame(animate);
    }
  }

  function startAnimation() {
    if (window.innerWidth <= 1024) {
      stopAnimation();
      renderFrame();
      return;
    }
    if (!calmAnimId) {
      animate();
    }
  }

  function stopAnimation() {
    if (calmAnimId) {
      cancelAnimationFrame(calmAnimId);
      calmAnimId = null;
    }
  }

  function resize() {
    width = canvas.width = canvas.parentElement ? canvas.parentElement.offsetWidth : window.innerWidth;
    height = canvas.height = canvas.parentElement ? canvas.parentElement.offsetHeight : 600;
    if (window.innerWidth <= 1024) {
      stopAnimation();
      renderFrame();
    } else {
      startAnimation();
    }
  }

  window.addEventListener('resize', resize);
  resize();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startAnimation();
      } else {
        stopAnimation();
      }
    });
  }, { threshold: 0.05 });

  observer.observe(canvas.parentElement || canvas);
}

// ---- Natural Serpentine Aurora Ribbon Arc & Twinkling Stars Canvas Engine ----
function initAuroraCanvas() {
  const canvas = document.getElementById('auroraCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;

  // Star Particles (Minimal & Elegant)
  const stars = [];
  const numStars = 45;

  // 2 Natural Asynchronous Auroral Arcs (Well-Separated Vertical Distance)
  const arcs = [
    {
      // Primary Upper Snake Ribbon (Bright Glowing Base -> Thin Upward Shaft)
      yBaseRatio: 0.38,
      freqX: 0.0014,
      freqX2: 0.0031,
      phaseShift: 0,
      ampY: 65,
      ampY2: 30,
      speed: 0.0006,
      rayHeightUp: 140,
      rayHeightDown: 30,
      alphaScale: 0.95,
      rayFreq1: 0.05,
      rayFreq2: 0.095,
      colorStops: [
        { stop: 0.0, color: 'rgba(0, 0, 0, 0)' },
        { stop: 0.1, color: 'rgba(16, 185, 129, 0.25)' },  // Soft Downward Bleed
        { stop: 0.22, color: 'rgba(0, 245, 212, 0.98)' }, // Sharp Peak Bright Base Edge
        { stop: 0.45, color: 'rgba(56, 189, 248, 0.55)' }, // Mid Shaft - Thinner Cyan
        { stop: 0.65, color: 'rgba(168, 85, 247, 0.18)' }, // Upper Shaft - Very Thin Violet
        { stop: 0.82, color: 'rgba(236, 72, 153, 0.04)' },  // Top Tips - Faint Whisper Pink
        { stop: 1.0, color: 'rgba(0, 0, 0, 0)' }           // Space Dissipation
      ]
    },
    {
      // Secondary Lower Soft Ribbon (Shifted Lower Down for Wide Distance)
      yBaseRatio: 0.64,
      freqX: 0.0026,
      freqX2: 0.0046,
      phaseShift: Math.PI * 0.75,
      ampY: 55,
      ampY2: 25,
      speed: -0.00045,
      rayHeightUp: 125,
      rayHeightDown: 20,
      alphaScale: 0.65,
      rayFreq1: 0.038,
      rayFreq2: 0.072,
      colorStops: [
        { stop: 0.0, color: 'rgba(0, 0, 0, 0)' },
        { stop: 0.12, color: 'rgba(14, 165, 233, 0.18)' },
        { stop: 0.25, color: 'rgba(56, 189, 248, 0.90)' }, // Peak Base Edge
        { stop: 0.5, color: 'rgba(99, 102, 241, 0.42)' },  // Thinner Mid Shaft
        { stop: 0.75, color: 'rgba(168, 85, 247, 0.16)' }, // Faint Upper Tips
        { stop: 0.92, color: 'rgba(192, 132, 252, 0.05)' },// Mist Top Fade
        { stop: 1.0, color: 'rgba(0, 0, 0, 0)' }
      ]
    }
  ];

  let time = 0;

  function renderFrame() {
    time += 1;
    ctx.clearRect(0, 0, width, height);

    // 1. Draw Subtle Twinkling Stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.phase += s.speed;
      const currentAlpha = 0.15 + (Math.sin(s.phase) + 1) * 0.35;

      ctx.save();
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${currentAlpha})`;
      ctx.shadowBlur = 4;
      ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
      ctx.restore();
    }

    // 2. Draw Natural Serpentine Ribbon Arcs with Vertical Rays Pulled Up & Down
    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    arcs.forEach(arc => {
      const step = 2.5; // Narrow step for sharp combed vertical ray filaments

      function getSpineY(x) {
        return height * arc.yBaseRatio +
          Math.sin(x * arc.freqX + time * arc.speed * 10 + arc.phaseShift) * arc.ampY +
          Math.cos(x * arc.freqX2 - time * arc.speed * 8 + arc.phaseShift * 1.5) * arc.ampY2;
      }

      for (let x = -20; x < width + 20; x += step) {
        const yBase = getSpineY(x);

        const rayUp = arc.rayHeightUp + Math.sin(x * arc.rayFreq1 + time * 0.02) * 55 + Math.cos(x * arc.rayFreq2 - time * 0.015) * 35;
        const rayDown = arc.rayHeightDown + Math.sin(x * 0.07 - time * 0.01) * 18;

        const rayAlpha = (0.35 + 0.65 * Math.pow(Math.sin(x * 0.065 + time * 0.025), 2)) * arc.alphaScale;

        const gradient = ctx.createLinearGradient(x, yBase + rayDown, x, yBase - rayUp);
        arc.colorStops.forEach(cs => {
          gradient.addColorStop(cs.stop, cs.color);
        });

        ctx.save();
        ctx.fillStyle = gradient;
        ctx.globalAlpha = rayAlpha;
        ctx.fillRect(x - step / 2, yBase - rayUp, step + 0.8, rayUp + rayDown);
        ctx.restore();
      }
    });

    ctx.restore();
  }

  function draw() {
    renderFrame();
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobileOrTablet = window.innerWidth <= 1024;
    if (!prefersReducedMotion && !isMobileOrTablet) {
      auroraAnimId = requestAnimationFrame(draw);
    }
  }

  function startAuroraAnimation() {
    if (window.innerWidth <= 1024) {
      stopAuroraAnimation();
      renderFrame();
      return;
    }
    if (!auroraAnimId) {
      draw();
    }
  }

  function stopAuroraAnimation() {
    if (auroraAnimId) {
      cancelAnimationFrame(auroraAnimId);
      auroraAnimId = null;
    }
  }

  function resize() {
    const parent = canvas.parentElement;
    width = parent ? parent.offsetWidth : window.innerWidth;
    height = parent ? parent.offsetHeight : 600;
    canvas.width = width;
    canvas.height = height;

    stars.length = 0;
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.3 + 0.5,
        alpha: Math.random(),
        speed: Math.random() * 0.02 + 0.008,
        phase: Math.random() * Math.PI * 2
      });
    }

    if (window.innerWidth <= 1024) {
      stopAuroraAnimation();
      renderFrame();
    } else {
      startAuroraAnimation();
    }
  }

  window.addEventListener('resize', resize);
  resize();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startAuroraAnimation();
      } else {
        stopAuroraAnimation();
      }
    });
  }, { threshold: 0.05 });

  observer.observe(canvas.parentElement || canvas);
}

document.addEventListener('DOMContentLoaded', () => {
  initCalmParticles();
  initAuroraCanvas();

  // Replay hover GIF animation when hovering feature cards
  document.querySelectorAll('.feature-card').forEach(card => {
    const hoverGif = card.querySelector('.hover-gif');
    if (hoverGif) {
      card.addEventListener('mouseenter', () => {
        const src = hoverGif.getAttribute('src');
        if (src) {
          hoverGif.src = '';
          hoverGif.src = src;
        }
      });
    }
  });
});

// ---- Mountain Parallax 3-Layer (Chroma Key Green-Removal & Interaction Engine) ----
document.addEventListener('DOMContentLoaded', () => {
  const ctaSection = document.querySelector('.cta-mountain-section');
  const layerBack = document.querySelector('.layer-back');
  const layerMid = document.querySelector('.layer-mid');
  const layerFront = document.querySelector('.layer-front');
  const fullMoon = document.querySelector('.full-moon-wrapper');

  if (!ctaSection || !layerBack || !layerMid || !layerFront) return;

  // ---- Chroma Key Engine (Remove #05f904 neon green screen & edge fringing) ----
  function applyChromaKeyToLayer(layer, imgPath, overlapX = 0, overlapY = 0) {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = imgPath;
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      tempCtx.drawImage(img, 0, 0);

      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        let g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue; // Already transparent

        const maxRB = Math.max(r, b);

        // Deteksi warna hijau layar (#05f904) dan tepian green halo
        if (g > maxRB * 1.02 && (g - maxRB) > 8) {
          const excess = g - maxRB;

          // Spill Suppression: Netralisir bias hijau menjadi warna gelap/netral alami
          data[i + 1] = Math.floor(maxRB * 0.95);

          // Chroma Key: Jadikan latar belakang dan tepian hijau ber-gradasi mulus menuju transparan (alpha = 0)
          if (excess > 12) {
            const fade = Math.max(0, 1 - ((excess - 12) / 22));
            data[i + 3] = Math.floor(a * fade);
          }
        }
      }

      tempCtx.putImageData(imageData, 0, 0);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width - overlapX;
      canvas.height = img.height;

      // Draw the main image
      ctx.drawImage(tempCanvas, 0, 0);
      
      // If overlap is specified, draw the right side of the image overlapping onto the left side
      if (overlapX > 0) {
        ctx.drawImage(tempCanvas, -(img.width - overlapX), overlapY);
      }

      layer.style.backgroundImage = `url("${canvas.toDataURL('image/png')}")`;
    };
  }

  // Terapkan chroma key pada ketiga lapisan gambar gunung
  applyChromaKeyToLayer(layerBack, 'assets/img/mountain-back.png');
  // Menjorok kedalam (overlap) sebesar 280px untuk layer mid agar menyatu
  applyChromaKeyToLayer(layerMid, 'assets/img/mountain-mid.png', 280);
  applyChromaKeyToLayer(layerFront, 'assets/img/mountain-front.png');

  let mouseX = 0;
  let mouseY = 0;
  let targetMouseX = 0;
  let targetMouseY = 0;

  // Track cursor movement for dynamic interactive 3D parallax depth
  window.addEventListener('mousemove', (e) => {
    const rect = ctaSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetMouseX = (e.clientX - centerX) / centerX;
      targetMouseY = (e.clientY - centerY) / centerY;
    }
  });

  let backAosOffset = 120;
  let midAosOffset = 120;
  let frontAosOffset = 120;

  // Animation loop combining Scroll Parallax + Mouse Parallax
  function updateParallax() {
    const rect = ctaSection.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Check if CTA section is inside viewport
    if (rect.top <= viewportHeight && rect.bottom >= 0) {
      // Normalisasi posisi scroll section di kisaran -0.5 hingga +0.5 (tepat bernilai 0 saat di tengah layar)
      const scrollProgress = ((viewportHeight - rect.top) / (viewportHeight + rect.height)) - 0.5;

      // Smooth cursor interpolation (lerp)
      mouseX += (targetMouseX - mouseX) * 0.08;
      mouseY += (targetMouseY - mouseY) * 0.08;

      // Lerp AOS Y entrance offsets for each mountain layer (120px -> 0px)
      const backTarget = (layerBack.classList.contains('aos-animate') || layerBack.classList.contains('active')) ? 0 : 120;
      const midTarget = (layerMid.classList.contains('aos-animate') || layerMid.classList.contains('active')) ? 0 : 120;
      const frontTarget = (layerFront.classList.contains('aos-animate') || layerFront.classList.contains('active')) ? 0 : 120;

      backAosOffset += (backTarget - backAosOffset) * 0.05;
      midAosOffset += (midTarget - midAosOffset) * 0.05;
      frontAosOffset += (frontTarget - frontAosOffset) * 0.05;

  const bantuanSection = document.querySelector('#bantuan');

  // Full Moon (Celestial Parallax - furthest depth movement in the night sky)
  if (fullMoon) {
    const targetSec = bantuanSection || ctaSection;
    const bRect = targetSec.getBoundingClientRect();
    const bProgress = ((viewportHeight - bRect.top) / (viewportHeight + bRect.height)) - 0.5;
    const moonY = (bProgress * -8) + (mouseY * 4);
    const moonX = mouseX * -6;
    fullMoon.style.transform = `translate3d(${moonX}px, ${moonY}px, 0)`;
  }

      // Layer Back (Bergerak vertikal dengan aman dalam rentang depth)
      const backY = (scrollProgress * -45) + (mouseY * 14) + backAosOffset;
      const backX = mouseX * -22;
      layerBack.style.transform = `translate3d(${backX}px, ${backY}px, 0) scale(1.04)`;

      // Layer Mid (Puncak gunung tengah proporsional & estetis di balik kartu)
      const midY = (scrollProgress * -25) + (mouseY * 8) + midAosOffset;
      const midX = mouseX * -14;
      layerMid.style.transform = `translate3d(${midX}px, ${midY}px, 0) scale(1.02)`;

      // Layer Front (Foreground layer, bergemang halus di dasar)
      const frontY = (scrollProgress * -12) + (mouseY * 4) + frontAosOffset;
      const frontX = mouseX * -6;
      layerFront.style.transform = `translate3d(${frontX}px, ${frontY}px, 0) scale(1.01)`;
    }

    if (window.innerWidth > 1024) {
      requestAnimationFrame(updateParallax);
    }
  }

  updateParallax();
  window.addEventListener('scroll', () => {
    if (window.innerWidth <= 1024) {
      updateParallax();
    }
  }, { passive: true });
});

// ---- Interactive Teman AI Robot & 3 Synchronized Auto-Rotating Speech Bubbles ----
function initInteractiveRobotBubble() {
  const stageEl = document.getElementById('teman-avatar-stage');

  const bubbleLeft = document.getElementById('robot-bubble-left');
  const iconLeft = document.getElementById('robot-icon-left');
  const textLeft = document.getElementById('robot-text-left');

  const bubbleRight = document.getElementById('robot-bubble-right');
  const iconRight = document.getElementById('robot-icon-right');
  const textRight = document.getElementById('robot-text-right');

  const bubbleBottom = document.getElementById('robot-bubble-bottom');
  const iconBottom = document.getElementById('robot-icon-bottom');
  const textBottom = document.getElementById('robot-text-bottom');

  if (!stageEl || !textLeft || !textRight || !textBottom) return;

  // 3 Distinct sets of curated warm, empathetic phrases for Indonesian teens
  const phrasesLeft = [
    { icon: '👋', text: 'Bagaimana perasaanmu hari ini?' },
    { icon: '☀️', text: 'Selamat datang di ruang amanmu!' },
    { icon: '🌱', text: 'Sempatkan napas sejenak ya...' },
    { icon: '💙', text: 'Kamu sudah berusaha keras hari ini!' },
    { icon: '🌸', text: 'Semua emosimu valid & berharga.' }
  ];

  const phrasesRight = [
    { icon: '📝', text: 'Coba fitur jurnal harian kami!' },
    { icon: '🎨', text: 'Mood-mu hari ini warna apa?' },
    { icon: '💡', text: 'Punya beban pikiran hari ini?' },
    { icon: '✨', text: 'Yuk ekspresikan perasaanmu!' },
    { icon: '🔮', text: 'Kenali tipe kepribadianmu!' }
  ];

  const phrasesBottom = [
    { icon: '🤖', text: 'Aku siap dengerin 24/7!' },
    { icon: '💬', text: 'Bebas curhat tanpa takut dihakimi.' },
    { icon: '🤝', text: 'Aku di sini nemenin langkahmu.' },
    { icon: '🛡️', text: 'Ruang privat 100% aman untukmu.' },
    { icon: '🤗', text: 'Selalu ada tempat untuk cerita.' }
  ];

  let currentIndex = 0;
  let timer = null;

  function switchAllPhrases() {
    currentIndex = (currentIndex + 1) % 5;

    // Staggered smooth pop animations
    if (bubbleLeft) bubbleLeft.classList.add('bubble-updating');
    setTimeout(() => { if (bubbleRight) bubbleRight.classList.add('bubble-updating'); }, 100);
    setTimeout(() => { if (bubbleBottom) bubbleBottom.classList.add('bubble-updating'); }, 200);

    setTimeout(() => {
      // Update Left
      if (iconLeft && textLeft) {
        iconLeft.textContent = phrasesLeft[currentIndex].icon;
        textLeft.textContent = phrasesLeft[currentIndex].text;
      }
      if (bubbleLeft) {
        bubbleLeft.classList.remove('bubble-updating');
        bubbleLeft.classList.add('bubble-updated');
        setTimeout(() => bubbleLeft.classList.remove('bubble-updated'), 450);
      }

      // Update Right
      if (iconRight && textRight) {
        iconRight.textContent = phrasesRight[currentIndex].icon;
        textRight.textContent = phrasesRight[currentIndex].text;
      }
      if (bubbleRight) {
        bubbleRight.classList.remove('bubble-updating');
        bubbleRight.classList.add('bubble-updated');
        setTimeout(() => bubbleRight.classList.remove('bubble-updated'), 450);
      }

      // Update Bottom
      if (iconBottom && textBottom) {
        iconBottom.textContent = phrasesBottom[currentIndex].icon;
        textBottom.textContent = phrasesBottom[currentIndex].text;
      }
      if (bubbleBottom) {
        bubbleBottom.classList.remove('bubble-updating');
        bubbleBottom.classList.add('bubble-updated');
        setTimeout(() => bubbleBottom.classList.remove('bubble-updated'), 450);
      }
    }, 280);
  }

  function startAutoCycle() {
    stopAutoCycle();
    timer = setInterval(() => {
      switchAllPhrases();
    }, 3800);
  }

  function stopAutoCycle() {
    if (timer) clearInterval(timer);
  }

  function triggerInteractiveBounce() {
    stopAutoCycle();
    switchAllPhrases();
    stageEl.classList.add('robot-clicked');
    setTimeout(() => stageEl.classList.remove('robot-clicked'), 600);
    startAutoCycle();
  }

  // Attach interactive click listeners to stage and all bubbles
  stageEl.addEventListener('click', triggerInteractiveBounce);
  if (bubbleLeft) bubbleLeft.addEventListener('click', (e) => { e.stopPropagation(); triggerInteractiveBounce(); });
  if (bubbleRight) bubbleRight.addEventListener('click', (e) => { e.stopPropagation(); triggerInteractiveBounce(); });
  if (bubbleBottom) bubbleBottom.addEventListener('click', (e) => { e.stopPropagation(); triggerInteractiveBounce(); });

  // Start loop
  startAutoCycle();
}

document.addEventListener('DOMContentLoaded', () => {
  initTemanVideoChromaKey();
});

// ---- Teman Mascot Video Chroma Key Engine (Green Screen Removal) ----
function initTemanVideoChromaKey() {
  const video = document.getElementById('teman-video-source');
  const canvas = document.getElementById('teman-avatar-canvas');
  if (!video || !canvas) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  let animId = null;

  function renderFrame() {
    if (video.paused || video.ended) {
      animId = requestAnimationFrame(renderFrame);
      return;
    }

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    if (vw > 0 && vh > 0) {
      if (canvas.width !== vw || canvas.height !== vh) {
        canvas.width = vw;
        canvas.height = vh;
      }

      ctx.drawImage(video, 0, 0, vw, vh);
      const frame = ctx.getImageData(0, 0, vw, vh);
      const data = frame.data;
      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        const maxRB = Math.max(r, b);
        const greenDiff = g - maxRB;

        // Key out green screen background with balanced sweet spot
        if (g > 55 && greenDiff > 16) {
          if (greenDiff > 28) {
            // Background -> 100% fully transparent
            data[i + 3] = 0;
          } else {
            // Smooth feathering edges (range 16 to 28)
            const alphaFactor = 1 - ((greenDiff - 16) / 12);
            data[i + 3] = Math.floor(a * Math.max(0, Math.min(1, alphaFactor)));
            // Spill suppression to remove green border halos
            data[i + 1] = maxRB;
          }
        } else if (g > maxRB) {
          // Desaturate green spill on mascot edge pixels
          data[i + 1] = Math.floor(maxRB + (g - maxRB) * 0.25);
        }
      }

      ctx.putImageData(frame, 0, 0);
    }

    animId = requestAnimationFrame(renderFrame);
  }

  video.muted = true;
  video.loop = true;
  video.playsInline = true;

  const startPlay = () => {
    video.play().then(() => {
      if (!animId) animId = requestAnimationFrame(renderFrame);
    }).catch(() => {
      const handleUserGesture = () => {
        video.play().catch(() => {});
        if (!animId) animId = requestAnimationFrame(renderFrame);
        window.removeEventListener('click', handleUserGesture);
        window.removeEventListener('touchstart', handleUserGesture);
        window.removeEventListener('scroll', handleUserGesture);
      };
      window.addEventListener('click', handleUserGesture, { once: true });
      window.addEventListener('touchstart', handleUserGesture, { once: true });
      window.addEventListener('scroll', handleUserGesture, { once: true });
    });
  };

  if (video.readyState >= 2) {
    startPlay();
  } else {
    video.addEventListener('loadeddata', startPlay, { once: true });
    video.addEventListener('canplay', startPlay, { once: true });
  }

  // IntersectionObserver to pause rendering when section is off-screen
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (video.paused) startPlay();
      } else {
        if (!video.paused) video.pause();
      }
    });
  }, { threshold: 0.05 });

  observer.observe(canvas.parentElement || canvas);
}

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof Settings !== 'undefined' && Settings.renderLandingLangDropdown) {
    Settings.renderLandingLangDropdown();
  }
  if (typeof Main !== 'undefined' && Main.initPage) {
    await Main.initPage('landing', { showNav: false, showFooter: false, showTeman: true, showWelcome: true });
  }
  if (typeof renderWeeklyMoodSummary === 'function') {
    renderWeeklyMoodSummary();
  }
});

// Global delegation: klik tombol mic Teman -> buka VoiceOrb
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#teman-voice-btn');
  if (!btn) return;
  if (typeof VoiceOrb !== 'undefined') {
    VoiceOrb.open();
  }
});

