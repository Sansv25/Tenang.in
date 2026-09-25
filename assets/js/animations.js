/* =============================================
   Tenang.in, Animations & Micro-Celebrations
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
  // ---- Toast Notifications (Swipeable / Draggable) ----
  const showToast = (message, type = 'info', duration = 3500) => {
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
      <button type="button" class="toast-close-btn" aria-label="Tutup Toast">
        <span class="material-symbols-rounded" style="font-size:16px;">close</span>
      </button>
    `;
    container.appendChild(toast);

    let dismissTimeout = setTimeout(() => dismissToast(0), duration);

    function dismissToast(flyDirection = 0) {
      clearTimeout(dismissTimeout);
      if (toast.classList.contains('dismissing')) return;
      toast.classList.add('dismissing');

      if (flyDirection !== 0) {
        toast.style.transition = 'transform 0.25s ease-out, opacity 0.25s ease-out';
        toast.style.transform = `translate3d(${flyDirection * 350}px, 0, 0) rotate(${flyDirection * 18}deg)`;
        toast.style.opacity = '0';
      } else {
        toast.classList.add('toast-out');
      }

      setTimeout(() => {
        if (toast.parentNode) toast.remove();
      }, 260);
    }

    // Close button handler
    const closeBtn = toast.querySelector('.toast-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dismissToast(1);
      });
    }

    // ---- Swipe / Drag Gesture Engine ----
    let isDragging = false;
    let startX = 0;
    let startY = 0;

    const onStart = (e) => {
      isDragging = true;
      clearTimeout(dismissTimeout);
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      startX = clientX;
      startY = clientY;
      toast.style.transition = 'none';
      toast.classList.add('toast-dragging');
    };

    const onMove = (e) => {
      if (!isDragging) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      const rotate = deltaX * 0.04;
      const opacity = Math.max(0.1, 1 - Math.abs(deltaX) / 220);

      toast.style.transform = `translate3d(${deltaX}px, ${deltaY * 0.25}px, 0) rotate(${rotate}deg)`;
      toast.style.opacity = opacity;

      // Prevent window scroll when swiping toast horizontally
      if (Math.abs(deltaX) > Math.abs(deltaY) && e.cancelable) {
        e.preventDefault();
      }
    };

    const onEnd = (e) => {
      if (!isDragging) return;
      isDragging = false;
      toast.classList.remove('toast-dragging');

      const endX = e.changedTouches ? e.changedTouches[0].clientX : e.clientX;
      const deltaX = endX - startX;

      if (Math.abs(deltaX) > 55) {
        // Swipe threshold reached -> fly out in swipe direction
        const direction = deltaX > 0 ? 1 : -1;
        dismissToast(direction);
      } else {
        // Snap back to normal center position
        toast.style.transition = 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease';
        toast.style.transform = 'translate3d(0, 0, 0) rotate(0deg)';
        toast.style.opacity = '1';
        dismissTimeout = setTimeout(() => dismissToast(0), 2500);
      }
    };

    // Attach Touch events
    toast.addEventListener('touchstart', onStart, { passive: false });
    toast.addEventListener('touchmove', onMove, { passive: false });
    toast.addEventListener('touchend', onEnd);
    toast.addEventListener('touchcancel', onEnd);

    // Attach Mouse events (Desktop drag)
    toast.addEventListener('mousedown', (e) => {
      if (e.target.closest('.toast-close-btn')) return;
      onStart(e);
      const onMouseMove = (me) => onMove(me);
      const onMouseUp = (me) => {
        onEnd(me);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    });
  };

  // ---- Confetti ----
  const showConfetti = (count = 30) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

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

  // ---- Helper for Green Screen Video Canvas Chroma Key ----
  const playGreenScreenVideo = (container, videoSrc) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'celebration-video-wrap';
    wrapper.style.cssText = 'position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; width:100%; height:100%;';

    // Instant fallback image while video loads/buffers
    const fallbackImg = document.createElement('img');
    fallbackImg.src = 'assets/img/maskots/mascot-cheerful.png';
    fallbackImg.alt = 'Mascot';
    fallbackImg.style.cssText = 'position:absolute; width:85%; height:85%; object-fit:contain; filter:drop-shadow(0 18px 40px rgba(0,0,0,0.35)); transition:opacity 0.35s ease; z-index:1;';

    const video = document.createElement('video');
    video.src = videoSrc;
    video.preload = 'auto';
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('aria-hidden', 'true');
    video.style.cssText = 'position:absolute; width:1px; height:1px; opacity:0.01; pointer-events:none;';

    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 480;
    canvas.className = 'celebration-canvas';
    canvas.style.cssText = 'position:relative; z-index:2; width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 20px 45px rgba(0,0,0,0.35));';

    wrapper.appendChild(fallbackImg);
    wrapper.appendChild(video);
    wrapper.appendChild(canvas);
    container.appendChild(wrapper);

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animId = null;
    let hasRenderedFirstFrame = false;

    video.addEventListener('loadedmetadata', () => {
      canvas.width = video.videoWidth || 300;
      canvas.height = video.videoHeight || 300;
    });

    const renderFrame = () => {
      if (video.paused || video.ended) {
        animId = requestAnimationFrame(renderFrame);
        return;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = frame.data;
      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Green screen pixel removal
        if (g > 80 && g > r * 1.15 && g > b * 1.15) {
          data[i + 3] = 0;
        } else if (g > 65 && g > r * 1.05 && g > b * 1.05) {
          // Soft edge blending
          const diff = g - Math.max(r, b);
          data[i + 3] = Math.max(0, 255 - diff * 4);
        }
      }

      ctx.putImageData(frame, 0, 0);

      // Smoothly hide fallback image after first video frame renders
      if (!hasRenderedFirstFrame) {
        hasRenderedFirstFrame = true;
        fallbackImg.style.opacity = '0';
        setTimeout(() => { fallbackImg.style.display = 'none'; }, 350);
      }

      animId = requestAnimationFrame(renderFrame);
    };

    video.play().then(() => {
      renderFrame();
    }).catch(() => {
      // Fallback if autoplay is blocked
      canvas.style.display = 'none';
      fallbackImg.style.opacity = '1';
      fallbackImg.style.display = 'block';
    });

    return () => {
      if (animId) cancelAnimationFrame(animId);
      video.pause();
      wrapper.remove();
    };
  };

  // ---- Full Screen Celebration with Mascot Video (Theme-matched & Bottom-Up Flying Mascot) ----
  const showCelebration = (iconName, text, duration = 4500, useVideo = true) => {
    // Remove existing overlay
    const existing = document.querySelector('.celebration-overlay');
    if (existing) existing.remove();

    // Resolve active theme gradient dynamically
    let themeBg = 'linear-gradient(135deg, #10B981 0%, #059669 50%, #047857 100%)';
    if (typeof Settings !== 'undefined' && Settings.getTheme) {
      const theme = Settings.getTheme();
      const mode = Settings.getMode ? Settings.getMode() : 'light';
      if (theme) {
        themeBg = (mode === 'dark' && theme.gradBody) ? theme.gradBody : (theme.gradHero || theme.gradBody);
      }
    } else if (document.body.style.background) {
      themeBg = document.body.style.background;
    }

    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.style.background = themeBg;
    overlay.style.backgroundAttachment = 'fixed';

    overlay.innerHTML = `
      <div class="celebration-ambient-orb orb-top"></div>
      <div class="celebration-ambient-orb orb-bottom"></div>
      <div class="celebration-content-container">
        <div class="celebration-video-container" id="celebration-video-slot"></div>
        <div class="celebration-text-box">
          <div class="celebration-text">${text || 'Selamat! Kuis Selesai'}</div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    let stopVideo = null;
    const slot = overlay.querySelector('#celebration-video-slot');

    if (useVideo) {
      stopVideo = playGreenScreenVideo(slot, 'assets/img/anim-mascot/idle.mp4');
    } else {
      slot.innerHTML = `
        <div class="celebration-emoji">
          <img src="assets/img/maskots/mascot-cheerful.png" alt="Celebration Mascot" style="width:100%; height:100%; object-fit:contain; filter:drop-shadow(0 18px 40px rgba(0,0,0,0.35));">
        </div>
      `;
    }

    // Trigger active state smoothly after element injection
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('active');
      });
    });

    const dismiss = () => {
      if (overlay.classList.contains('closing')) return;
      overlay.classList.add('closing');
      overlay.classList.remove('active');
      setTimeout(() => {
        if (stopVideo) stopVideo();
        overlay.remove();
      }, 450);
    };

    // Automatically dismiss only when duration timer finishes
    setTimeout(() => {
      dismiss();
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
