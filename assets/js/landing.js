/* =============================================
   Tenang.in — Landing Page Script
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Preloader (Loading Screen) Logic ----
  const preloader = document.getElementById('preloader');

  if (preloader) {
    const finishPreloader = () => {
      preloader.classList.add('fade-out');

      // Scroll to top so page starts at the very top
      window.scrollTo(0, 0);

      // Let body scroll again
      document.body.classList.remove('preloader-active');

      // Remove element from DOM after transition
      setTimeout(() => {
        preloader.style.display = 'none';

        // Trigger reveal for hero elements immediately
        const heroReveals = document.querySelectorAll('#hero .reveal');
        heroReveals.forEach(el => el.classList.add('active'));
      }, 800);
    };

    // Simple 1.5 second delay then fade out
    setTimeout(finishPreloader, 1500);
  } else {
    document.body.classList.remove('preloader-active');
  }

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

  // ---- Vanilla Scroll Reveal Engine ----
  const revealElements = document.querySelectorAll('.reveal');
  if (revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -60px 0px', // Trigger slightly before element is in view
      threshold: 0.15
    });

    // Observe elements (exclude hero section reveals, as they are triggered by preloader)
    revealElements.forEach(el => {
      if (!el.closest('#hero')) {
        revealObserver.observe(el);
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
});

// ---- Auth Actions (Login / Register Popup) ----
let currentAuthTab = 'login';

function handleMulaiSekarang() {
  const isReturning = localStorage.getItem('tenang_returning') || localStorage.getItem('tenang_isReturning') || localStorage.getItem('tenang_logged_in_user');
  if (isReturning) {
    window.location.href = 'beranda.html';
  } else {
    // Tampilkan onboarding modal
    const modal = document.getElementById('onboarding-modal');
    if (modal) {
      modal.style.display = 'flex';
    } else {
      showAuthModal();
    }
  }
}

// ---- Onboarding Modal Navigation Logic ----
let currentStep = 1;
const totalSteps = 3;

document.addEventListener('DOMContentLoaded', () => {
  // Event listeners untuk tombol mulai sekarang
  document.querySelectorAll('.btn-mulai-sekarang').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      handleMulaiSekarang();
    });
  });

  // Pilihan goal pada step 3
  document.querySelectorAll('.onboarding-choices .choice-btn').forEach(btn => {
    btn.addEventListener('click', function() {
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
        // Last step — save to localStorage and redirect
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
  const usernameInput = document.getElementById('auth-username');
  const passwordInput = document.getElementById('auth-password');
  const errorMsg = document.getElementById('auth-error-msg');
  if (usernameInput) usernameInput.value = '';
  if (passwordInput) passwordInput.value = '';
  if (errorMsg) errorMsg.style.display = 'none';
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
  const confirmGroup = document.getElementById('auth-confirm-group');
  const confirmInput = document.getElementById('auth-confirm-password');
  const forgotWrap = document.getElementById('auth-forgot-wrap');
  const footerSwitch = document.getElementById('auth-footer-switch');
  const errorMsg = document.getElementById('auth-error-msg');

  if (errorMsg) errorMsg.style.display = 'none';

  if (tab === 'login') {
    if (authTitle) authTitle.textContent = 'Masuk ke Tenang.in';
    if (authSubtitle) authSubtitle.textContent = 'Mari lanjutkan perjalanan refleksi dirimu.';
    if (dividerText) dividerText.textContent = 'ATAU MASUK DENGAN USERNAME';
    if (authBtn) authBtn.textContent = 'Masuk';

    if (confirmGroup) confirmGroup.style.display = 'none';
    if (confirmInput) confirmInput.required = false;
    if (forgotWrap) forgotWrap.style.display = 'block';

    if (footerSwitch) {
      footerSwitch.innerHTML = `Belum punya akun? <a href="javascript:void(0)" onclick="switchAuthTab('register')" class="auth-switch-link">Daftar</a>`;
    }
  } else {
    if (authTitle) authTitle.textContent = 'Daftar ke Tenang.in';
    if (authSubtitle) authSubtitle.textContent = 'Mulai langkah awal ruang amanmu hari ini.';
    if (dividerText) dividerText.textContent = 'ATAU DAFTAR DENGAN USERNAME';
    if (authBtn) authBtn.textContent = 'Daftar Sekarang';

    if (confirmGroup) confirmGroup.style.display = 'block';
    if (confirmInput) confirmInput.required = true;
    if (forgotWrap) forgotWrap.style.display = 'none';

    if (footerSwitch) {
      footerSwitch.innerHTML = `Sudah punya akun? <a href="javascript:void(0)" onclick="switchAuthTab('login')" class="auth-switch-link">Masuk</a>`;
    }
  }
}

function handleAuthSubmit(e) {
  e.preventDefault();
  const usernameInput = document.getElementById('auth-username');
  const passwordInput = document.getElementById('auth-password');
  const confirmInput = document.getElementById('auth-confirm-password');

  if (!usernameInput || !passwordInput) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  if (!username || !password) {
    showAuthError('Username dan password harus diisi.');
    return;
  }

  // Load existing users
  let users = [];
  try {
    const rawUsers = localStorage.getItem('tenang_users');
    users = rawUsers ? JSON.parse(rawUsers) : [];
  } catch (err) {
    users = [];
  }

  if (currentAuthTab === 'register') {
    if (confirmInput && confirmInput.value !== password) {
      showAuthError('Konfirmasi kata sandi tidak cocok!');
      return;
    }

    // Check if user already exists
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
      showAuthError('Username/Email sudah terdaftar. Silakan pilih yang lain.');
      return;
    }

    // Register user
    users.push({ username, password });
    localStorage.setItem('tenang_users', JSON.stringify(users));

    // Save session
    localStorage.setItem('tenang_logged_in_user', username);
    localStorage.setItem('tenang_username', username);

    Animations.showToast('Pendaftaran berhasil! Mengalihkan ke ruang tenangmu...', 'success');
    closeAuthModal();
    setTimeout(() => {
      window.location.href = 'beranda.html';
    }, 800);
  } else {
    // Login check
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!user) {
      showAuthError('Username atau kata sandi yang Anda masukkan salah.');
      return;
    }

    // Save session
    localStorage.setItem('tenang_logged_in_user', user.username);
    localStorage.setItem('tenang_username', user.username);

    Animations.showToast(`Berhasil masuk! Selamat datang kembali, ${user.username}.`, 'success');
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
  const simulatedUsername = `Teman_${provider}_${Math.floor(100 + Math.random() * 900)}`;
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
function initCalmParticles() {
  const canvas = document.getElementById('calmParticles');
  if (!canvas || !canvas.parentElement) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }

  window.addEventListener('resize', resize);
  resize();

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

  function animate() {
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

    requestAnimationFrame(animate);
  }

  animate();
}

document.addEventListener('DOMContentLoaded', () => {
  initCalmParticles();
});
