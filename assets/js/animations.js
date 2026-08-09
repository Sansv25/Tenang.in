/* =============================================
   Tenang.in — Animations & Micro-Celebrations
   ============================================= */

const Animations = (() => {
  // ---- Intersection Observer for Scroll Reveals ----
  const initScrollReveal = () => {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
    if (revealElements.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.01,
      rootMargin: '0px 0px 150px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  };

  // ---- Counter Animation ----
  const animateCounter = (element, target, duration = 2000) => {
    const start = 0;
    const startTime = performance.now();

    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.floor(start + (target - start) * eased);

      element.textContent = current.toLocaleString('id-ID');

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = target.toLocaleString('id-ID');
      }
    };

    requestAnimationFrame(update);
  };

  // ---- Toast Notifications ----
  const showToast = (message, type = 'info', duration = 3000) => {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: 'check_circle',
      warning: 'warning',
      info: 'info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-icon-badge">
        <span class="material-symbols-rounded toast-icon">${icons[type] || icons.info}</span>
      </div>
      <span class="toast-message">${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('toast-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // ---- Confetti ----
  const showConfetti = (count = 30) => {
    const container = document.createElement('div');
    container.className = 'confetti-container';
    document.body.appendChild(container);

    const colors = ['#10B981', '#38BDF8', '#F59E0B', '#6366F1', '#EC4899', '#2563EB'];

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      piece.style.left = Math.random() * 100 + '%';
      piece.style.background = colors[Math.floor(Math.random() * colors.length)];
      piece.style.animationDelay = Math.random() * 1.5 + 's';
      piece.style.animationDuration = (2 + Math.random() * 2) + 's';

      const shapes = ['circle', 'square', 'rectangle'];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];
      if (shape === 'circle') piece.style.borderRadius = '50%';
      if (shape === 'rectangle') {
        piece.style.width = '6px';
        piece.style.height = '14px';
      }

      container.appendChild(piece);
    }

    setTimeout(() => container.remove(), 4000);
  };

  // ---- Full Screen Celebration ----
  const showCelebration = (iconName, text, duration = 2500) => {
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
      <div class="celebration-emoji">
        <span class="material-symbols-rounded" style="font-size:72px; color:var(--warning);">${iconName || 'stars'}</span>
      </div>
      <div class="celebration-text">${text}</div>
    `;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    showConfetti(50);

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => overlay.remove(), 400);
    }, duration);
  };

  // ---- Check Achievements ----
  const checkAchievements = () => {
    const streak = Storage.getStreak();
    const moodCount = Storage.getMoods().length;
    const journalCount = Storage.getJournalCount();

    // First check-in
    if (moodCount === 1 && !sessionStorage.getItem('celebrated_first')) {
      sessionStorage.setItem('celebrated_first', '1');
      showToast('Check-in pertamamu tersimpan!', 'success');
      showConfetti(20);
    }

    // 3-day streak
    if (streak === 3 && !sessionStorage.getItem('celebrated_streak3')) {
      sessionStorage.setItem('celebrated_streak3', '1');
      showToast('3 hari berturut-turut! Hebat!', 'success');
      showConfetti(25);
    }

    // 7-day streak
    if (streak === 7 && !sessionStorage.getItem('celebrated_streak7')) {
      sessionStorage.setItem('celebrated_streak7', '1');
      showCelebration('star', '7 Hari Konsisten! Luar biasa!');
    }

    // First journal
    if (journalCount === 1 && !sessionStorage.getItem('celebrated_journal1')) {
      sessionStorage.setItem('celebrated_journal1', '1');
      showToast('Jurnal pertamamu tersimpan!', 'success');
    }
  };

  // ---- Init ----
  const init = () => {
    initScrollReveal();
  };

  return { init, initScrollReveal, animateCounter, showToast, showConfetti, showCelebration, checkAchievements };
})();
