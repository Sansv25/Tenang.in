/* =============================================
   Tenang.in, Home Page Script
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
  // Guard for landing page (index.html) if home.js is loaded there
  const isLandingPage = document.querySelector('.hero') !== null || window.location.pathname.endsWith('index.html') || (window.location.pathname === '/' || window.location.pathname.endsWith('/'));
  if (isLandingPage && !document.title.toLowerCase().includes('beranda')) {
    if (typeof renderWeeklyMoodSummary === 'function') renderWeeklyMoodSummary();
    return;
  }

  await Main.initPage('home');

  const loggedInUser = localStorage.getItem('tenang_logged_in_user');
  if (!loggedInUser) {
    window.location.replace('index.html?showAuth=true');
    return;
  } else {
    initializeHome();
    initInspirationRotator();
  }
});

async function initializeHome() {
  // ---- Greeting ----
  const greetingEl = document.getElementById('greeting-text');
  if (greetingEl) greetingEl.textContent = Main.getGreetingText();

  // Show logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.style.display = 'inline-flex';

  // ---- Check First-Time Onboarding ----
  if (typeof Onboarding !== 'undefined') {
    Onboarding.init();
  }

  // ---- Check if already checked in today ----
  if (Storage.isFirstVisitToday() && localStorage.getItem('isNewUser') !== null) {
    showCheckInModal();
  }

  // ---- Streak Display ----
  updateStreakDisplay();

  // ---- Tips ----
  loadDailyTip();

  // ---- New User Nudge ----
  const nudge = document.getElementById('new-user-nudge');
  if (nudge && !Storage.isNewUser()) {
    nudge.style.display = 'none';
  }

  // ---- Quick Card Mood Summary ----
  updateMoodSummary();
  renderWeeklyMoodSummary();

  // ---- NEW SECTIONS FOR BERANDA ----
  renderHomePersonalitySection();
  renderHomeAchievementsShowcase();


  // ---- Update CTA button if already checked in ----
  updateCTAButton();
}


// ---- Daily Check-in Modal ----
function showCheckInModal(preselectedLevel = null) {
  const overlay = document.getElementById('checkin-modal');
  if (!overlay) return;
  overlay.classList.add('active');
  if (preselectedLevel && typeof selectMood === 'function') {
    selectMood(preselectedLevel);
  }
}

function closeCheckInModal() {
  const overlay = document.getElementById('checkin-modal');
  if (overlay) overlay.classList.remove('active');
}

// ---- Mood Selection ----
let selectedMood = null;
let selectedTags = [];

function selectMood(level) {
  selectedMood = level;
  document.querySelectorAll('#checkin-emojis .emoji-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', (i + 1) === level);
  });
  // Show tags section
  document.getElementById('checkin-tags-section').style.display = 'block';
}

function toggleTag(tag, btn) {
  const idx = selectedTags.indexOf(tag);
  if (idx >= 0) {
    selectedTags.splice(idx, 1);
    btn.classList.remove('selected');
  } else {
    selectedTags.push(tag);
    btn.classList.add('selected');
  }
}

function submitCheckIn() {
  if (!selectedMood) {
    Animations.showToast('Pilih mood kamu dulu ya!', 'warning');
    return;
  }

  const note = document.getElementById('checkin-note')?.value || '';

  Storage.saveMood({
    level: selectedMood,
    tags: selectedTags,
    note: note
  });

  closeCheckInModal();
  Animations.checkAchievements();
  updateStreakDisplay();
  updateMoodSummary();
  renderWeeklyMoodSummary();
  updateCTAButton();
  if (typeof Main !== 'undefined' && Main.updateBottomNav) Main.updateBottomNav('home');
  Animations.showToast('Mood hari ini tersimpan!', 'success');

  // Check time capsule or low mood interventions
  if (typeof window.checkTimeCapsuleIntervention === 'function') {
    window.checkTimeCapsuleIntervention(selectedMood);
  } else if (selectedMood <= 2) {
    setTimeout(() => {
      Animations.showToast('Kalau butuh bicara, Teman selalu di sini untukmu.', 'info', 4000);
    }, 1500);
  }
}

// ---- Update Streak Display ----
function updateStreakDisplay() {
  const streak = Storage.getStreak();
  const streakEl = document.getElementById('streak-count');
  const streakContainer = document.getElementById('streak-display');

  if (streakEl) streakEl.textContent = streak;
  if (streakContainer && streak > 0) {
    streakContainer.style.display = 'inline-flex';
  }

  // Show streak milestone modal if hitting milestones
  const milestoneKey = `tenang_streak_milestone_${streak}`;
  if ([3, 7, 14, 21, 30].includes(streak) && !localStorage.getItem(milestoneKey)) {
    const streakModal = document.getElementById('streak-modal');
    const streakModalCount = document.getElementById('streak-modal-count');
    if (streakModal && streakModalCount) {
      streakModalCount.textContent = streak;
      setTimeout(() => {
        streakModal.classList.add('active');
        // Trigger confetti if possible
        if (typeof confetti === 'function') {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      }, 1000);
      localStorage.setItem(milestoneKey, 'true');
    }
  }
}

// ---- Update Mood Summary & Checked-In State ----
function updateMoodSummary() {
  const mood = Storage.getMoodToday();
  const summaryEl = document.getElementById('mood-today-summary');
  const gridContainer = document.getElementById('mood-grid-container');
  const checkedInState = document.getElementById('mood-checked-in-state');
  const checkinCtaBtn = document.getElementById('checkin-cta-btn');

  if (mood) {
    document.documentElement.classList.add('already-checked-in');
    const icons = {
      1: 'sentiment_very_dissatisfied',
      2: 'sentiment_dissatisfied',
      3: 'sentiment_neutral',
      4: 'sentiment_satisfied',
      5: 'sentiment_very_satisfied'
    };
    const colors = {
      1: '#EF4444',
      2: '#F97316',
      3: '#3B82F6',
      4: '#10B981',
      5: '#8B5CF6'
    };
    const bgGlows = {
      1: 'rgba(239, 68, 68, 0.12)',
      2: 'rgba(249, 115, 22, 0.12)',
      3: 'rgba(59, 130, 246, 0.12)',
      4: 'rgba(16, 185, 129, 0.12)',
      5: 'rgba(139, 92, 246, 0.12)'
    };
    const labels = { 1: 'Buruk · Sangat Berat', 2: 'Kurang · Kurang Oke', 3: 'Biasa · Normal & Stabil', 4: 'Baik · Damai & Positif', 5: 'Luar Biasa · Sangat Bahagia' };

    if (summaryEl) {
      summaryEl.className = 'mood-badge-floating';
      summaryEl.innerHTML = `
        <span class="material-symbols-rounded" style="font-size:20px; color:${colors[mood.level]} !important;">${icons[mood.level]}</span>
        <span style="font-size:0.88rem; font-weight:700; color:#FFFFFF !important;">${labels[mood.level].split(' · ')[0]}</span>
      `;
    }

    if (gridContainer && checkedInState) {
      gridContainer.style.display = 'none';
      checkedInState.style.display = 'block';

      const tagsHTML = mood.tags && mood.tags.length > 0
        ? `<div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin:16px 0;">
             ${mood.tags.map(t => `<span style="background:var(--card-subtle); border:1px solid var(--card-border); color:var(--text-secondary); font-size:0.75rem; font-weight:600; padding:4px 12px; border-radius:16px;">#${escapeHTML(t)}</span>`).join('')}
           </div>`
        : '';

      const noteHTML = mood.note
        ? `<div style="margin:16px auto; max-width:420px; padding:14px 18px; background:var(--card-subtle); border:1px solid var(--card-border); border-radius:14px; color:var(--text-secondary); font-size:0.9rem; font-style:italic; text-align:center;">"${escapeHTML(mood.note)}"</div>`
        : '';

      checkedInState.innerHTML = `
        <div style="padding: 8px 16px 20px; max-width: 600px; margin: 0 auto; text-align:center;">
          <div style="margin: 0 auto 12px; display: flex; align-items: center; justify-content: center;">
            <img src="assets/img/maskots/mascot-mood-${mood.level}.png" alt="Mood ${mood.level}" class="checked-in-mascot-img">
          </div>
          <span style="display:inline-block; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${colors[mood.level]}; background:${bgGlows[mood.level]}; padding:4px 14px; border-radius:12px; margin-bottom:12px;">Check-In Hari Ini Tersimpan</span>
          <h3 style="font-size:1.5rem; font-weight:800; color:var(--text-on-white); margin: 4px 0;">${labels[mood.level]}</h3>
          <p style="color:var(--text-secondary); font-size:0.95rem; line-height:1.6; max-width:480px; margin: 8px auto 0;">
            Terimakasih telah hadir dan jujur melacak emosimu hari ini. Konsistensi dalam mengenali diri sendiri adalah langkah utama menuju jiwa yang tenang dan berdaya.
          </p>
          
          ${tagsHTML}
          ${noteHTML}

          <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:14px; margin-top:28px;">
            <a href="mood-tracker.html" style="text-decoration:none; background:linear-gradient(135deg, #2563EB, #3B82F6); color:#fff; padding:12px 26px; border-radius:26px; font-weight:700; font-size:0.9rem; display:flex; align-items:center; gap:6px; box-shadow:0 4px 16px rgba(37,99,235,0.35); transition:transform 0.2s;">
              <span class="material-symbols-rounded" style="font-size:20px;">analytics</span>
              Lihat Analisa & Grafisku
            </a>
            <button onclick="window.resetMoodInHome()" style="background:var(--card-subtle); border:1px solid var(--card-border); color:var(--text-on-white); padding:12px 24px; border-radius:26px; font-weight:600; font-size:0.9rem; display:flex; align-items:center; gap:6px; cursor:pointer; transition:background 0.2s;">
              <span class="material-symbols-rounded" style="font-size:20px;">edit_note</span>
              Ubah Check-In
            </button>
          </div>
        </div>
      `;
    }

    const checkinCtaWrapper = document.getElementById('checkin-cta-wrapper');
    if (checkinCtaBtn) checkinCtaBtn.style.display = 'none';
    if (checkinCtaWrapper) checkinCtaWrapper.style.display = 'none';
  } else {
    document.documentElement.classList.remove('already-checked-in');
    if (gridContainer && checkedInState) {
      gridContainer.style.display = '';
      checkedInState.style.display = 'none';
    }
    const checkinCtaWrapper = document.getElementById('checkin-cta-wrapper');
    if (checkinCtaWrapper) checkinCtaWrapper.style.display = 'flex';
    if (checkinCtaBtn) checkinCtaBtn.style.display = 'inline-flex';
  }
}

window.resetMoodInHome = function () {
  document.documentElement.classList.remove('already-checked-in');
  const gridContainer = document.getElementById('mood-grid-container');
  const checkedInState = document.getElementById('mood-checked-in-state');
  const checkinCtaBtn = document.getElementById('checkin-cta-btn');
  const checkinCtaWrapper = document.getElementById('checkin-cta-wrapper');
  if (gridContainer) gridContainer.style.display = '';
  if (checkedInState) checkedInState.style.display = 'none';
  if (checkinCtaWrapper) checkinCtaWrapper.style.display = 'flex';
  if (checkinCtaBtn) checkinCtaBtn.style.display = 'inline-flex';
  showCheckInModal();
};

// ---- Update CTA Button (now unified with updateMoodSummary) ----
function updateCTAButton() {
  updateMoodSummary();
}

// ---- Load Daily Tip ----
const FALLBACK_TIPS = {
  "IT": { "emoji": "dark_mode", "name": "Pemikir Tenang", "daily": [ "Tuangkan pikiran lewat journaling agar terasa lebih teratur.", "Bedakan hal yang bisa kamu kendalikan dari hal yang tidak.", "Luangkan waktu sendiri untuk mengisi kembali energimu.", "Beri dirimu 10 menit untuk memikirkan kekhawatiran, lalu lepaskan.", "Ingat, kamu tidak harus selalu punya jawaban untuk semuanya." ] },
  "IF": { "emoji": "favorite", "name": "Perasa Mendalam", "daily": [ "Perasaanmu yang dalam adalah kekuatan, bukan kelemahan. Jangan pernah ragu merasakannya.", "Self-compassion: hari ini, perlakukan dirimu seperti kamu memperlakukan sahabat terbaikmu.", "Batasi scrolling hari ini. Perasaan orang lain di timeline bisa mempengaruhimu tanpa sadar.", "Saat emosi terasa overwhelming, coba grounding 5-4-3-2-1: lihat 5 benda, sentuh 4, dengar 3, cium 2, rasa 1.", "Tidak semua perasaan harus dibagikan. Jurnal adalah ruang amanmu untuk memproses." ] },
  "ET": { "emoji": "bolt", "name": "Pemimpin Aktif", "daily": [ "Ubah kecemasan jadi aksi. Langkah kecil hari ini > rencana besar yang nggak dimulai.", "Bilang 'tidak' adalah skill. Kamu nggak harus iya-kan semua hal.", "Energimu besar, tapi jangan lupa isi ulang. Tidur cukup malam ini, ya.", "Jadwalkan 10 menit waktu diam hari ini. Otak aktif juga butuh jeda.", "Istirahat aktif cocok buat kamu. Jalan kaki 15 menit bisa reset pikiran." ] },
  "EF": { "emoji": "auto_awesome", "name": "Jiwa Sosial", "daily": [ "Kamu mudah merasakan emosi orang lain. Hari ini, cek dulu: ini perasaanku atau perasaan orang?", "Kamu nggak harus selalu jadi 'penyemangat'. Kamu juga berhak lelah dan istirahat.", "Tarik napas sebelum bereaksi. Jeda 3 detik bisa mengubah reaksi jadi respons.", "Pilih circle yang memberi energi, bukan hanya menguras. Kamu layak itu.", "Empati itu kekuatanmu. Tapi bedakan antara memahami beban orang lain vs menanggungnya." ] },
  "default": { "emoji": "lightbulb", "name": "Untukmu", "daily": [ "Hari ini adalah kesempatan baru. Mulai dari hal kecil yang membuatmu tersenyum.", "Kamu nggak harus baik-baik aja setiap hari. Yang penting, kamu hadir.", "Progress, bukan perfection. Langkah kecil tetap langkah.", "Jaga dirimu hari ini: minum air, gerak badan, dan beri waktu untuk dirimu.", "Kamu lebih kuat dari yang kamu kira. Buktinya, kamu masih di sini." ] }
};

function renderTipContent(tips) {
  const tipEl = document.getElementById('daily-tip');
  if (!tipEl) return;
  const kenaliType = typeof Storage !== 'undefined' && typeof Storage.getKenaliType === 'function' ? Storage.getKenaliType() : null;
  const tipSet = kenaliType && tips[kenaliType] ? tips[kenaliType] : tips.default;
  const dayIndex = new Date().getDate() % tipSet.daily.length;
  const iconName = tipSet.emoji || 'lightbulb';

  tipEl.innerHTML = `
    <div class="insight-card">
      <div class="insight-card-header">
        <span class="material-symbols-rounded" style="color:var(--primary-accent); font-size:22px;">${iconName}</span>
        <span>Tips untuk ${tipSet.name}</span>
      </div>
      <p style="font-size:0.9375rem; line-height:1.65; color:var(--text-on-white);">${tipSet.daily[dayIndex]}</p>
    </div>
  `;
}

async function loadDailyTip() {
  const tipEl = document.getElementById('daily-tip');
  if (!tipEl) return;

  // Render synchronously with fallback first for Zero-CLS
  renderTipContent(FALLBACK_TIPS);

  try {
    const res = await fetch('assets/data/tips.json');
    const tips = await res.json();
    renderTipContent(tips);
  } catch (e) {
    // Already rendered fallback synchronously
  }
}

// ---- High-Impact Innovation: Weekly Mood Summary & Contextual Insight (INVENTION 2026) ----
async function renderWeeklyMoodSummary() {
  const container = document.getElementById('weekly-mood-summary-section');
  if (!container) return;

  let moodHistory = [];
  try {
    const raw = localStorage.getItem('tenang_moods');
    moodHistory = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(moodHistory)) moodHistory = [];
  } catch(e) {
    moodHistory = [];
  }

  const safeText = (str) => {
    if (typeof escapeHTML === 'function') return escapeHTML(str);
    return String(str || '').replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  };

  // Deteksi tema tempat komponen dijalankan (Landing vs Dashboard vs Dark Mode)
  const isLanding = document.querySelector('.hero') !== null || window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
  const isDark = document.documentElement.classList.contains('dark-mode') || document.body.classList.contains('dark-mode');

  const theme = {
    cardBg: isLanding ? 'rgba(255, 255, 255, 0.04)' : (isDark ? '#1E293B' : '#FFFFFF'),
    cardBorder: isLanding ? '1px solid rgba(255, 255, 255, 0.12)' : (isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2E8F0'),
    cardBlur: isLanding ? 'backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);' : '',
    textColor: isLanding ? '#FFFFFF' : (isDark ? '#F8FAFC' : '#1A2F4E'),
    subTextColor: isLanding ? 'rgba(255, 255, 255, 0.75)' : (isDark ? '#CBD5E1' : '#64748B'),
    boxBg: isLanding ? 'rgba(255, 255, 255, 0.05)' : (isDark ? '#0F172A' : '#F8FAFC'),
    boxBorder: isLanding ? '1px solid rgba(255, 255, 255, 0.1)' : (isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2E8F0'),
    chipBg: isLanding ? 'rgba(126, 200, 227, 0.15)' : (isDark ? 'rgba(59, 130, 246, 0.2)' : '#EEF3F9'),
    chipBorder: isLanding ? '1px solid rgba(126, 200, 227, 0.3)' : (isDark ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid #7EC8E3'),
    chipColor: isLanding ? '#7EC8E3' : (isDark ? '#60A5FA' : '#2D5BA8'),
    tipBg: isLanding ? 'rgba(45, 91, 168, 0.35)' : (isDark ? '#0F172A' : 'linear-gradient(135deg, #EEF3F9 0%, #E0F2FE 100%)'),
    tipBorder: isLanding ? '1px solid rgba(126, 200, 227, 0.3)' : (isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1.5px solid #7EC8E3'),
    tipText: isLanding ? '#FFFFFF' : (isDark ? '#F8FAFC' : '#1A2F4E'),
    btnDetailBg: isLanding ? 'rgba(255, 255, 255, 0.1)' : (isDark ? '#0F172A' : '#F8FAFC'),
    btnDetailBorder: isLanding ? '1px solid rgba(255, 255, 255, 0.2)' : (isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1.5px solid #CBD5E1'),
    btnDetailColor: isLanding ? '#FFFFFF' : (isDark ? '#F8FAFC' : '#1E293B'),
    emptyBorder: isLanding ? '1px dashed rgba(255, 255, 255, 0.2)' : (isDark ? '2px dashed rgba(255, 255, 255, 0.2)' : '2px dashed #CBD5E1')
  };

  // Jika data mood belum cukup (user baru / kosong) -> Tampilkan Motivative Empty State
  if (!moodHistory.length) {
    container.innerHTML = `
      <div style="background: ${theme.cardBg}; border: ${theme.emptyBorder}; ${theme.cardBlur} border-radius: 28px; padding: clamp(24px, 5vw, 36px) clamp(16px, 4vw, 28px); text-align: center; box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.25); color: ${theme.textColor};">
        <div style="width: clamp(56px, 12vw, 72px); height: clamp(56px, 12vw, 72px); border-radius: 50%; background: ${isLanding ? 'rgba(91, 143, 212, 0.2)' : '#EEF3F9'}; border: 2px solid #5B8FD4; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 8px 20px rgba(91, 143, 212, 0.2);">
          <span class="material-symbols-rounded" style="font-size: clamp(30px, 7vw, 38px); color: ${isLanding ? '#7EC8E3' : '#2D5BA8'};">insights</span>
        </div>
        <span style="display: inline-block; font-size: 0.72rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: ${theme.chipColor}; background: ${theme.chipBg}; border: ${theme.chipBorder}; padding: 4px 14px; border-radius: 999px; margin-bottom: 12px;">Rangkuman Emosi Mingguan</span>
        <h3 style="font-size: clamp(1.25rem, 4vw, 1.5rem); font-weight: 850; color: ${theme.textColor}; margin: 0;">Jejak Emosimu Belum Terukir</h3>
        <p style="color: ${theme.subTextColor}; font-size: clamp(0.88rem, 2.5vw, 0.95rem); line-height: 1.6; max-width: 500px; margin: 10px auto 24px;">
          Setiap perasaanmu berharga dan layak dicatat. Mulai check-in mood pertamamu hari ini untuk membuka analisis emosi mendalam dan tips refleksi yang disesuaikan khusus untukmu.
        </p>
        <button type="button" onclick="typeof showCheckInModal === 'function' ? showCheckInModal() : (typeof handleMulaiSekarang === 'function' ? handleMulaiSekarang() : window.location.href='beranda.html')" style="background: #2D5BA8; color: #FFFFFF; border: none; padding: clamp(12px, 3vw, 14px) clamp(24px, 5vw, 32px); border-radius: 999px; font-weight: 800; font-size: 0.92rem; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 8px 24px rgba(45, 91, 168, 0.35); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='none'">
          <span class="material-symbols-rounded" style="font-size: 22px;">sentiment_very_satisfied</span>
          Mulai Check-in Pertamaku
        </button>
      </div>
    `;
    return;
  }

  // Ambil data 7 hari terakhir / minggu ini
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const weekMoods = moodHistory.filter(m => {
    try {
      const d = m.date ? new Date(m.date) : (m.timestamp ? new Date(m.timestamp) : now);
      return d >= oneWeekAgo && !isNaN(d.getTime());
    } catch(e) { return false; }
  });
  const itemsToAnalyze = weekMoods.length ? weekMoods : moodHistory.slice(-7);

  // Hitung frekuensi tag
  const tagCounts = {};
  itemsToAnalyze.forEach(m => {
    if (Array.isArray(m.tags)) {
      m.tags.forEach(t => {
        const tag = (t || '').toLowerCase().trim();
        if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });
  let dominantTag = '';
  let maxCount = -1;
  for (const [t, count] of Object.entries(tagCounts)) {
    if (count > maxCount) { maxCount = count; dominantTag = t; }
  }
  const allTopTags = Object.keys(tagCounts).slice(0, 5);

  // Hitung mood rata-rata (1-5)
  const totalScore = itemsToAnalyze.reduce((sum, m) => sum + (Number(m.level || m.score) || 3), 0);
  const avgScore = Math.round(totalScore / itemsToAnalyze.length);
  const moodNames = { 1: 'Buruk', 2: 'Kurang', 3: 'Biasa', 4: 'Baik', 5: 'Luar Biasa' };
  const moodIcons = { 1: 'sentiment_very_dissatisfied', 2: 'sentiment_dissatisfied', 3: 'sentiment_neutral', 4: 'sentiment_satisfied', 5: 'sentiment_very_satisfied' };
  const colorMap = { 1: '#EF4444', 2: '#F97316', 3: '#3B82F6', 4: '#10B981', 5: '#8B5CF6' };

  // Generate Pesan Insight Kontekstual yang Hangat
  let insightMsg = 'Konsistensi dalam mencatat perasaan adalah kunci utama menuju ketenangan mental. Terus perhatikan kesadaran dirimu setiap hari.';
  if (dominantTag === 'lelah') {
    insightMsg = 'Minggu ini kamu cukup sering merasa lelah. Tubuh dan pikiranmu sedang meminta hak istirahatnya yang layak. Beri jeda pada rutinitasmu dan istirahatlah tanpa rasa salah.';
  } else if (dominantTag === 'cemas' || dominantTag === 'stres' || dominantTag === 'bingung') {
    insightMsg = 'Ada gelombang ketegangan dan kecemasan minggu ini. Ingatlah bahwa emosi adalah cuaca sesaat; langit jiwamu tetap lapang dan kuat melaluinya. Perlahan lepaskan apa yang tak bisa kamu kontrol.';
  } else if (dominantTag === 'kesepian') {
    insightMsg = 'Rasa sepi sempet menghantuimu minggu ini. Ingat bahwa berduaan dengan diri sendiri juga merupakan ruang pemeliharaan kekuatan baru, dan Teman AI maupun tim profesional selalu siap mendengar ceritamu.';
  } else if (dominantTag === 'bersyukur' || dominantTag === 'semangat' || dominantTag === 'tenang') {
    insightMsg = 'Pola emosimu didominasi oleh ketenangan dan energi positif yang luar biasa. Kembangkan terus rasa syukur ini dan bagikan cahaya damaimu kepada lingkungan di sekitarmu!';
  } else if (avgScore <= 2) {
    insightMsg = 'Minggu ini terasa cukup menantang bagimu. Kamu luar biasa tangguh karena telah berani menghadapi hari-hari berat ini tanpa menyerah. Tetaplah melangkah perlahan.';
  }

  // Ambil 1 tips cepat dari data/tips.json berdasarkan tipe kepribadian atau tag dominan
  let quickTip = 'Luangkan waktu 5 menit hari ini untuk meremaskan bahu, menarik napas panjang, dan tersenyum pada dirimu di cermin.';
  try {
    const res = await fetch('assets/data/tips.json');
    if (res.ok) {
      const tipsData = await res.json();
      const userType = localStorage.getItem('tenang_personality_type') || (typeof Storage !== 'undefined' && Storage.getKenaliType ? Storage.getKenaliType() : null) || 'default';
      const tipList = (tipsData[userType] && tipsData[userType].daily) ? tipsData[userType].daily : (tipsData.default?.daily || []);
      if (tipList && tipList.length > 0) {
        const tipIdx = Math.floor(Math.random() * tipList.length);
        quickTip = tipList[tipIdx];
      }
    }
  } catch(e) {}

  const tagChipsHTML = allTopTags.length ? allTopTags.map(t => `<span style="background: ${theme.chipBg}; border: ${theme.chipBorder}; color: ${theme.chipColor}; font-size: 0.75rem; font-weight: 750; padding: 6px 14px; border-radius: 20px; display: inline-block;">#${safeText(t)}</span>`).join('') : `<span style="color: ${theme.subTextColor}; font-size: 0.8rem; font-style: italic;">Belum ada tag yang dipilih minggu ini</span>`;

  container.innerHTML = `
    <div class="weekly-summary-card" style="background: ${theme.cardBg}; border: ${theme.cardBorder}; ${theme.cardBlur} border-radius: 28px; padding: clamp(20px, 4vw, 36px); box-shadow: 0 18px 45px -15px rgba(0, 0, 0, 0.25); color: ${theme.textColor}; overflow: hidden;">
      <div class="weekly-summary-header" style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 24px; border-bottom: 1.5px solid rgba(255,255,255,0.1); padding-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: clamp(10px, 3vw, 16px); flex: 1; min-width: 0;">
          <div style="width: clamp(42px, 10vw, 54px); height: clamp(42px, 10vw, 54px); border-radius: 16px; background: #5B8FD4; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(91, 143, 212, 0.35); flex-shrink: 0;">
            <span class="material-symbols-rounded" style="font-size: clamp(24px, 5.5vw, 30px); color: #FFFFFF;">query_stats</span>
          </div>
          <div style="flex: 1; min-width: 0;">
            <div style="font-size: 0.72rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0.8px; color: ${theme.chipColor}; margin-bottom: 3px;">Analisis Emosi Mingguan</div>
            <h2 style="font-size: clamp(1.05rem, 3.8vw, 1.45rem); font-weight: 850; color: ${theme.textColor}; margin: 0; line-height: 1.25;">Rangkuman Emosimu Minggu Ini</h2>
          </div>
        </div>
        <div style="flex-shrink: 0;">
          <a href="dashboard.html" class="weekly-detail-link" style="text-decoration: none; background: ${theme.btnDetailBg}; border: ${theme.btnDetailBorder}; color: ${theme.btnDetailColor}; font-weight: 750; font-size: 0.85rem; padding: 10px 16px; border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; gap: 6px; transition: opacity 0.2s; white-space: nowrap;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'" title="Detail Statistik">
            <span class="desktop-btn-label">Detail Statistik</span>
            <span class="material-symbols-rounded" style="font-size: 20px;">chevron_right</span>
          </a>
        </div>
      </div>

      <div class="weekly-summary-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: clamp(16px, 3vw, 22px); margin-bottom: 24px;">
        <div class="weekly-box-trend" style="background: ${theme.boxBg}; border: ${theme.boxBorder}; border-radius: 22px; padding: clamp(20px, 4vw, 26px); display: flex; flex-direction: column; justify-content: flex-start;">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding-bottom: 16px; border-bottom: 1px solid rgba(126, 200, 227, 0.15); margin-bottom: 16px;">
            <span style="font-size: 0.88rem; font-weight: 750; color: ${theme.subTextColor};">Tren Mood Rata-Rata</span>
            <div style="display: inline-flex; align-items: center; gap: 6px; background: ${colorMap[avgScore] || '#3B82F6'}1A; color: ${colorMap[avgScore] || '#3B82F6'}; border: 1.5px solid ${colorMap[avgScore] || '#3B82F6'}50; padding: 5px 14px; border-radius: 20px; font-weight: 800; font-size: 0.9rem; white-space: nowrap;">
              <span class="material-symbols-rounded" style="font-size: 18px; color: ${colorMap[avgScore] || '#3B82F6'};">${moodIcons[avgScore] || 'sentiment_neutral'}</span>
              <span>${moodNames[avgScore] || 'Biasa'}</span>
            </div>
          </div>
          <div style="font-size: 0.85rem; font-weight: 700; color: ${theme.subTextColor}; margin-bottom: 12px;">Emosi / Tag Paling Sering Dirasakan:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${tagChipsHTML}
          </div>
        </div>

        <div class="weekly-box-insight" style="background: ${theme.boxBg}; border: ${theme.boxBorder}; border-radius: 22px; padding: clamp(20px, 4vw, 26px); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: ${isLanding ? '#7EC8E3' : '#2D5BA8'}; font-size: 0.92rem; margin-bottom: 12px;">
              <span class="material-symbols-rounded" style="font-size: 22px;">psychology</span>
              <span>Insight Refleksi Untukmu</span>
            </div>
            <p style="font-size: clamp(0.88rem, 2.5vw, 0.94rem); color: ${isLanding ? 'rgba(255,255,255,0.9)' : (isDark ? '#F8FAFC' : '#334155')}; line-height: 1.65; font-style: italic; margin: 0; text-align: justify;">
              "${safeText(insightMsg)}"
            </p>
          </div>
          <div class="weekly-insight-sub" style="margin-top: 18px; font-size: 0.78rem; font-weight: 750; color: ${theme.subTextColor}; display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-rounded" style="font-size: 16px; color: ${isLanding ? '#7EC8E3' : (isDark ? '#60A5FA' : '#2D5BA8')};">analytics</span>
            <span>Berdasarkan ${itemsToAnalyze.length} catatan check-in mood terakhir</span>
          </div>
        </div>
      </div>

      <div class="weekly-tips-box" style="background: ${theme.tipBg}; border: ${theme.tipBorder}; border-radius: 20px; padding: 18px clamp(18px, 4vw, 24px); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 240px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: ${isDark ? '#1E293B' : '#FFFFFF'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <span class="material-symbols-rounded" style="color: #F59E0B; font-size: 26px;">lightbulb</span>
          </div>
          <div style="flex: 1;">
            <div style="font-size: 0.72rem; font-weight: 850; color: ${isLanding ? '#FDE68A' : '#2D5BA8'}; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px;">Tips Praktis Hari Ini</div>
            <div style="font-size: clamp(0.86rem, 2.5vw, 0.92rem); font-weight: 700; color: ${theme.tipText}; line-height: 1.45;">${safeText(quickTip)}</div>
          </div>
        </div>
        <div style="width: auto; max-width: max-content; display: flex; align-items: center;">
          <button onclick="window.location.href='kenali.html'" style="background: #2D5BA8; color: #FFFFFF; border: none; padding: 10px 18px; border-radius: 14px; font-size: 0.82rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 6px; box-shadow: 0 4px 12px rgba(45, 91, 168, 0.3); transition: opacity 0.2s; white-space: nowrap;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
            <span>Eksplorasi Tips</span>
            <span class="material-symbols-rounded" style="font-size: 16px;">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  `;
}
window.renderWeeklyMoodSummary = renderWeeklyMoodSummary;

// ---- Interactive Inspiration & Prompt Rotator ----
const inspirationList = [
  { text: "Kamu tidak harus sempurna setiap saat. Hadir dan mengamati perasaanmu sudah merupakan satu langkah besar.", author: "Refleksi Harian" },
  { text: "Perasaanmu adalah pesan, bukan musuh. Beri mereka ruang untuk dirasakan tanpa harus dihakimi.", author: "Mindful Space" },
  { text: "Satu hari yang berat tidak menentukan seluruh kisah hidupmu. Terus melangkah dengan perlahan.", author: "Tenang.in Wisdom" },
  { text: "Batu yang keras pun bisa terkikis oleh tetesan air yang konsisten. Konsistensi kecilmu sangat berarti.", author: "Pertahanan Diri" },
  { text: "Jika kamu merasa penuh, tuangkanlah dalam jurnal. Hatimu terlalu berharga untuk memendam beban sendirian.", author: "Ruang Jurnal" }
];
let currentInspIdx = 0;

function initInspirationRotator() {
  const quoteEl = document.getElementById('interactive-quote-text');
  const authorEl = document.getElementById('interactive-quote-author');
  if (quoteEl && authorEl && inspirationList.length > 0) {
    quoteEl.textContent = `"${inspirationList[0].text}"`;
    authorEl.textContent = inspirationList[0].author;
  }
}

function rotateInspiration() {
  const container = document.getElementById('inspiration-card');
  const quoteEl = document.getElementById('interactive-quote-text');
  const authorEl = document.getElementById('interactive-quote-author');
  if (!container || !quoteEl || !authorEl) return;

  container.classList.add('fading');
  setTimeout(() => {
    currentInspIdx = (currentInspIdx + 1) % inspirationList.length;
    quoteEl.textContent = `"${inspirationList[currentInspIdx].text}"`;
    authorEl.textContent = inspirationList[currentInspIdx].author;
    container.classList.remove('fading');
  }, 250);
}

// ---- First-Time Onboarding Modal Engine (Vanilla JS State Management & Interactive Selections) ----
const Onboarding = (() => {
  let currentStep = 0;

  // Interactive Onboarding State
  let state = {
    gender: localStorage.getItem('tenang_user_gender') || 'Netral',
    goals: [],
    time: localStorage.getItem('tenang_user_time') || 'Fleksibel',
    aiStyle: localStorage.getItem('tenang_user_aistyle') || 'Empatis'
  };
  try {
    const savedGoals = localStorage.getItem('tenang_user_goals');
    if (savedGoals) state.goals = JSON.parse(savedGoals);
  } catch (e) { state.goals = []; }

  if (state.goals.length === 0) {
    state.goals = ['Mengelola Stres & Cemas']; // Default choice
  }

  const checkAndShow = () => {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser === null || isNewUser === undefined || isNewUser === '') {
      setTimeout(() => {
        open();
      }, 700);
    }
  };

  const open = () => {
    const modal = document.getElementById('onboarding-modal');
    const card = document.getElementById('onboarding-card');
    if (!modal || !card) return;

    modal.style.display = 'flex';
    setTimeout(() => {
      modal.classList.remove('opacity-0', 'pointer-events-none');
      modal.classList.add('opacity-100');
      card.classList.remove('scale-95');
      card.classList.add('scale-100');
    }, 50);

    currentStep = 0;
    renderSlide();
  };

  const close = () => {
    const modal = document.getElementById('onboarding-modal');
    const card = document.getElementById('onboarding-card');
    if (!modal || !card) return;

    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0', 'pointer-events-none');
    card.classList.remove('scale-100');
    card.classList.add('scale-95');

    setTimeout(() => {
      modal.style.display = 'none';
      if (Storage && typeof Storage.isFirstVisitToday === 'function' && Storage.isFirstVisitToday() && typeof showCheckInModal === 'function') {
        showCheckInModal();
      }
    }, 500);
  };

  const complete = () => {
    localStorage.setItem('isNewUser', 'false');
    localStorage.setItem('tenang_user_gender', state.gender);
    localStorage.setItem('tenang_user_goals', JSON.stringify(state.goals));
    localStorage.setItem('tenang_user_time', state.time);
    localStorage.setItem('tenang_user_aistyle', state.aiStyle);
    close();
    if (typeof Animations !== 'undefined' && typeof Animations.showToast === 'function') {
      Animations.showToast('Selamat datang! Ruang amanmu siap digunakan.', 'success', 4000);
    }
  };

  const selectGender = (val) => {
    state.gender = val;
    localStorage.setItem('tenang_user_gender', val);
    renderSlide();
  };

  const toggleGoal = (goalText) => {
    const index = state.goals.indexOf(goalText);
    if (index > -1) {
      if (state.goals.length > 1) { // keep at least one selected
        state.goals.splice(index, 1);
      }
    } else {
      state.goals.push(goalText);
    }
    localStorage.setItem('tenang_user_goals', JSON.stringify(state.goals));
    renderSlide();
  };

  const selectTime = (val) => {
    state.time = val;
    localStorage.setItem('tenang_user_time', val);
    renderSlide();
  };

  const selectAiStyle = (val) => {
    state.aiStyle = val;
    localStorage.setItem('tenang_user_aistyle', val);
    renderSlide();
  };

  const nextSlide = () => {
    if (currentStep < 4) {
      currentStep++;
      renderSlide();
    } else {
      complete();
    }
  };

  const prevSlide = () => {
    if (currentStep > 0) {
      currentStep--;
      renderSlide();
    }
  };

  const renderSlide = () => {
    const contentEl = document.getElementById('onboarding-slide-content');
    const prevBtn = document.getElementById('onboarding-prev-btn');
    const nextBtn = document.getElementById('onboarding-next-btn');
    const dots = document.querySelectorAll('.onboarding-dot');
    if (!contentEl) return;

    let html = '';

    if (currentStep === 0) {
      // Step 1: Welcome & Gender Selection
      html = `
        <div style="width: 56px; height: 56px; border-radius: 9999px; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; background: rgba(91, 143, 212, 0.15);">
          <span class="material-symbols-rounded" style="font-size: 32px; color: #3B72C4;">waving_hand</span>
        </div>
        <h3 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 6px 0; color: #1E293B; line-height: 1.3; text-align: center;">
          Selamat Datang di Tenang.in
        </h3>
        <p style="font-size: 0.85rem; max-width: 340px; margin: 0 auto 18px; color: #64748B; line-height: 1.5; text-align: center;">
          Agar Teman AI dapat menyapa dan berinteraksi lebih personal, apa panggilan atau gender yang kamu nyaman?
        </p>
        <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; width: 100%; max-width: 400px; margin: 0 auto;">
          ${[
            { val: 'Laki-laki', label: 'Laki-laki', icon: 'man' },
            { val: 'Perempuan', label: 'Perempuan', icon: 'woman' },
            { val: 'Netral', label: 'Netral / Privasi', icon: 'person' }
          ].map(opt => {
            const isSelected = state.gender === opt.val;
            const btnStyle = isSelected
              ? 'background: #F0F6FF; border: 2px solid #3B72C4; color: #1E3A8A; font-weight: 700; box-shadow: 0 4px 12px rgba(59, 114, 196, 0.15);'
              : 'background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #475569; font-weight: 600;';
            const iconColor = isSelected ? '#3B72C4' : '#94A3B8';
            return `
              <button type="button" onclick="Onboarding.selectGender('${opt.val}')" style="padding: 16px 8px; border-radius: 16px; transition: all 0.2s ease; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; min-height: 90px; text-align: center; ${btnStyle}">
                <span class="material-symbols-rounded" style="font-size: 28px; color: ${iconColor};">${opt.icon}</span>
                <span style="font-size: 0.78rem; line-height: 1.2;">${opt.label}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    } else if (currentStep === 1) {
      // Step 2: Primary Goals Selection
      const availableGoals = [
        { text: 'Mengelola Stres & Cemas', icon: 'self_improvement' },
        { text: 'Konsistensi Catat Mood & Emosi', icon: 'mood' },
        { text: 'Teman Bercerita Tanpa Menghakimi', icon: 'forum' },
        { text: 'Refleksi & Belajar Memahami Diri', icon: 'menu_book' }
      ];
      html = `
        <div style="width: 56px; height: 56px; border-radius: 9999px; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; background: rgba(14, 165, 233, 0.15);">
          <span class="material-symbols-rounded" style="font-size: 32px; color: #0284C7;">track_changes</span>
        </div>
        <h3 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 6px 0; color: #1E293B; line-height: 1.3; text-align: center;">
          Apa fokus utamamu saat ini?
        </h3>
        <p style="font-size: 0.85rem; max-width: 340px; margin: 0 auto 16px; color: #64748B; line-height: 1.5; text-align: center;">
          Pilih satu atau lebih fokus refleksi agar pengalamanmu lebih terarah.
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 380px; margin: 0 auto;">
          ${availableGoals.map(g => {
            const isSelected = state.goals.includes(g.text);
            const btnStyle = isSelected
              ? 'background: #F0F6FF; border: 2px solid #3B72C4; color: #1E293B; font-weight: 700;'
              : 'background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #475569; font-weight: 600;';
            const iconColor = isSelected ? '#3B72C4' : '#94A3B8';
            return `
              <button type="button" onclick="Onboarding.toggleGoal('${g.text}')" style="padding: 12px 16px; border-radius: 16px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: space-between; cursor: pointer; text-align: left; ${btnStyle}">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="material-symbols-rounded" style="font-size: 22px; color: ${iconColor}; flex-shrink: 0;">${g.icon}</span>
                  <span style="font-size: 0.82rem; line-height: 1.3;">${g.text}</span>
                </div>
                <span class="material-symbols-rounded" style="font-size: 20px; color: ${iconColor}; flex-shrink: 0;">${isSelected ? 'check_circle' : 'radio_button_unchecked'}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    } else if (currentStep === 2) {
      // Step 3: Daily Reflection Time Preference
      const timeOptions = [
        { val: 'Pagi', label: 'Pagi Hari (08:00)', desc: 'Memulai hari dengan pikiran tenang & niat positif', icon: 'wb_sunny' },
        { val: 'Sore', label: 'Sore Hari (17:00)', desc: 'Melepas penat seusai beraktivitas', icon: 'wb_twilight' },
        { val: 'Malam', label: 'Malam Hari (21:00)', desc: 'Evaluasi & menenangkan pikiran sebelum tidur', icon: 'bedtime' },
        { val: 'Fleksibel', label: 'Fleksibel / Kapan Saja', desc: 'Tanpa jadwal khusus, saat butuh cerita', icon: 'auto_awesome' }
      ];
      html = `
        <div style="width: 56px; height: 56px; border-radius: 9999px; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; background: rgba(245, 158, 11, 0.15);">
          <span class="material-symbols-rounded" style="font-size: 32px; color: #D97706;">schedule</span>
        </div>
        <h3 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 6px 0; color: #1E293B; line-height: 1.3; text-align: center;">
          Kapan waktu refleksi terbaikmu?
        </h3>
        <p style="font-size: 0.85rem; max-width: 340px; margin: 0 auto 16px; color: #64748B; line-height: 1.5; text-align: center;">
          Tenang.in siap mendampingimu kapan pun kamu meluangkan waktu sejenak.
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 380px; margin: 0 auto;">
          ${timeOptions.map(t => {
            const isSelected = state.time === t.val;
            const btnStyle = isSelected
              ? 'background: #F0F6FF; border: 2px solid #3B72C4; color: #1E293B; font-weight: 700;'
              : 'background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #475569; font-weight: 600;';
            const iconColor = isSelected ? '#3B72C4' : '#94A3B8';
            return `
              <button type="button" onclick="Onboarding.selectTime('${t.val}')" style="padding: 12px 16px; border-radius: 16px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: space-between; cursor: pointer; text-align: left; ${btnStyle}">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="material-symbols-rounded" style="font-size: 22px; color: ${iconColor}; flex-shrink: 0;">${t.icon}</span>
                  <div>
                    <div style="font-size: 0.82rem; font-weight: 700; color: #1E293B; line-height: 1.2;">${t.label}</div>
                    <div style="font-size: 0.72rem; font-weight: 400; color: #64748B; line-height: 1.3; margin-top: 2px;">${t.desc}</div>
                  </div>
                </div>
                <span class="material-symbols-rounded" style="font-size: 20px; color: ${iconColor}; flex-shrink: 0;">${isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    } else if (currentStep === 3) {
      // Step 4: Teman AI Communication Style
      const aiStyles = [
        { val: 'Empatis', label: 'Empatis & Hangat', desc: 'Menenangkan, merangkul, dan ramah', icon: 'favorite' },
        { val: 'Solutif', label: 'Solutif & Praktis', desc: 'Memberikan sudut pandang baru & langkah konkrit', icon: 'lightbulb' },
        { val: 'Santai', label: 'Santai & Pendengar', desc: 'Seperti sahabat tempat cerita tanpa sekat', icon: 'chat_bubble' }
      ];
      html = `
        <div style="width: 56px; height: 56px; border-radius: 9999px; margin: 0 auto 14px; display: flex; align-items: center; justify-content: center; background: rgba(168, 85, 247, 0.15);">
          <span class="material-symbols-rounded" style="font-size: 32px; color: #9333EA;">psychology</span>
        </div>
        <h3 style="font-size: 1.35rem; font-weight: 800; margin: 0 0 6px 0; color: #1E293B; line-height: 1.3; text-align: center;">
          Gaya komunikasi Teman AI yang kamu suka?
        </h3>
        <p style="font-size: 0.85rem; max-width: 340px; margin: 0 auto 16px; color: #64748B; line-height: 1.5; text-align: center;">
          Atur gaya bimbingan Teman AI agar obrolan terasa paling nyaman untukmu.
        </p>
        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; max-width: 380px; margin: 0 auto;">
          ${aiStyles.map(s => {
            const isSelected = state.aiStyle === s.val;
            const btnStyle = isSelected
              ? 'background: #F0F6FF; border: 2px solid #3B72C4; color: #1E293B; font-weight: 700;'
              : 'background: #F8FAFC; border: 1.5px solid #E2E8F0; color: #475569; font-weight: 600;';
            const iconColor = isSelected ? '#9333EA' : '#94A3B8';
            return `
              <button type="button" onclick="Onboarding.selectAiStyle('${s.val}')" style="padding: 12px 16px; border-radius: 16px; transition: all 0.2s ease; display: flex; align-items: center; justify-content: space-between; cursor: pointer; text-align: left; ${btnStyle}">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <span class="material-symbols-rounded" style="font-size: 22px; color: ${iconColor}; flex-shrink: 0;">${s.icon}</span>
                  <div>
                    <div style="font-size: 0.82rem; font-weight: 700; color: #1E293B; line-height: 1.2;">${s.label}</div>
                    <div style="font-size: 0.72rem; font-weight: 400; color: #64748B; line-height: 1.3; margin-top: 2px;">${s.desc}</div>
                  </div>
                </div>
                <span class="material-symbols-rounded" style="font-size: 20px; color: ${isSelected ? '#3B72C4' : '#94A3B8'}; flex-shrink: 0;">${isSelected ? 'radio_button_checked' : 'radio_button_unchecked'}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    } else {
      // Step 5: Ready & Personalized Summary
      const timeLabelMap = {
        'Pagi': 'Pagi (08:00)',
        'Sore': 'Sore (17:00)',
        'Malam': 'Malam (21:00)',
        'Fleksibel': 'Fleksibel'
      };

      const aiStyleLabelMap = {
        'Empatis': 'Empatis & Hangat',
        'Solutif': 'Solutif & Praktis',
        'Santai': 'Santai & Pendengar'
      };

      const primaryGoalText = state.goals.length > 0 ? state.goals[0] : 'Refleksi Diri';

      html = `
        <div style="width: 56px; height: 56px; border-radius: 16px; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #3B72C4 0%, #2563EB 100%); color: #FFFFFF; box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);">
          <span class="material-symbols-rounded" style="font-size: 30px;">rocket_launch</span>
        </div>

        <h3 style="font-size: 1.35rem; font-weight: 850; margin: 0 0 6px 0; color: #1E293B; line-height: 1.3; text-align: center;">
          Kamu Sudah Siap Melangkah!
        </h3>
        <p style="font-size: 0.82rem; max-width: 360px; margin: 0 auto 14px; color: #64748B; line-height: 1.4; text-align: center;">
          Preferensimu diselaraskan. Ringkasan ruang amanmu:
        </p>

        <!-- User Preference Summary Pill Grid -->
        <div style="width: 100%; max-width: 390px; margin: 0 auto 12px; padding: 12px 14px; border-radius: 16px; background: #F0F6FF; border: 1.5px solid #D2E4FF; text-align: left;">
          <div style="font-size: 0.7rem; font-weight: 800; color: #1E3A8A; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-rounded" style="font-size: 15px; color: #2563EB;">tune</span>
            <span>Profil Refleksimu</span>
          </div>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
            <div style="background: #FFFFFF; padding: 7px 10px; border-radius: 10px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <span class="material-symbols-rounded" style="font-size: 16px; color: #3B72C4; flex-shrink: 0;">person</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${state.gender}</span>
            </div>
            <div style="background: #FFFFFF; padding: 7px 10px; border-radius: 10px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <span class="material-symbols-rounded" style="font-size: 16px; color: #D97706; flex-shrink: 0;">schedule</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${timeLabelMap[state.time] || state.time}</span>
            </div>
            <div style="background: #FFFFFF; padding: 7px 10px; border-radius: 10px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <span class="material-symbols-rounded" style="font-size: 16px; color: #9333EA; flex-shrink: 0;">psychology</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${aiStyleLabelMap[state.aiStyle] || state.aiStyle}</span>
            </div>
            <div style="background: #FFFFFF; padding: 7px 10px; border-radius: 10px; border: 1px solid #E2E8F0; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <span class="material-symbols-rounded" style="font-size: 16px; color: #059669; flex-shrink: 0;">track_changes</span>
              <span style="font-size: 0.75rem; font-weight: 700; color: #1E293B; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${primaryGoalText}</span>
            </div>
          </div>
        </div>

        <!-- 4 Core Pillars of Tenang.in -->
        <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; max-width: 390px; margin: 0 auto; text-align: left;">
          <div style="padding: 10px 12px; border-radius: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; display: flex; align-items: flex-start; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(16, 185, 129, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">
              <span class="material-symbols-rounded" style="font-size: 18px; color: #059669;">enhanced_encryption</span>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.78rem; font-weight: 800; color: #1E293B; line-height: 1.2;">100% Privasi & Keamanan Lokal</div>
              <div style="font-size: 0.71rem; font-weight: 400; color: #64748B; line-height: 1.3; margin-top: 2px;">Catatan mood & percakapan tersimpan secara privat.</div>
            </div>
          </div>

          <div style="padding: 10px 12px; border-radius: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; display: flex; align-items: flex-start; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(14, 165, 233, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">
              <span class="material-symbols-rounded" style="font-size: 18px; color: #0284C7;">grid_view</span>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.78rem; font-weight: 800; color: #1E293B; line-height: 1.2;">Visual Bento Grid & Analisis Mood</div>
              <div style="font-size: 0.71rem; font-weight: 400; color: #64748B; line-height: 1.3; margin-top: 2px;">Lacak grafik tren emosimu dengan visual jernih.</div>
            </div>
          </div>

          <div style="padding: 10px 12px; border-radius: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; display: flex; align-items: flex-start; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(168, 85, 247, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">
              <span class="material-symbols-rounded" style="font-size: 18px; color: #9333EA;">forum</span>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.78rem; font-weight: 800; color: #1E293B; line-height: 1.2;">Teman AI Pendamping 24/7</div>
              <div style="font-size: 0.71rem; font-weight: 400; color: #64748B; line-height: 1.3; margin-top: 2px;">Ruang curhat hangat & responsif tanpa diskriminasi.</div>
            </div>
          </div>

          <div style="padding: 10px 12px; border-radius: 14px; background: #F8FAFC; border: 1px solid #E2E8F0; display: flex; align-items: flex-start; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: 10px; background: rgba(245, 158, 11, 0.12); display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">
              <span class="material-symbols-rounded" style="font-size: 18px; color: #D97706;">self_improvement</span>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.78rem; font-weight: 800; color: #1E293B; line-height: 1.2;">Jurnal & Panduan Olah Rasa</div>
              <div style="font-size: 0.71rem; font-weight: 400; color: #64748B; line-height: 1.3; margin-top: 2px;">Prompts reflektif harian & latihan relaksasi pikiran.</div>
            </div>
          </div>
        </div>
      `;
    }

    // Smooth update
    contentEl.style.opacity = '0';
    setTimeout(() => {
      contentEl.innerHTML = html;
      contentEl.style.opacity = '1';
    }, 120);

    // Update Dots
    dots.forEach((dot, index) => {
      if (index === currentStep) {
        dot.style.background = '#5B8FD4';
        dot.style.width = '24px';
        dot.classList.remove('bg-slate-200');
      } else {
        dot.style.background = '';
        dot.style.width = '10px';
        dot.classList.add('bg-slate-200');
      }
    });

    // Update Prev Button
    if (prevBtn) {
      if (currentStep === 0) {
        prevBtn.classList.add('opacity-0', 'pointer-events-none');
      } else {
        prevBtn.classList.remove('opacity-0', 'pointer-events-none');
      }
    }

    // Update Next Button
    if (nextBtn) {
      if (currentStep === 4) {
        nextBtn.innerHTML = `<span>Mulai Perjalananku</span><span class="material-symbols-rounded" style="font-size:18px;">check_circle</span>`;
        nextBtn.style.background = '#2D5BA8';
      } else {
        nextBtn.innerHTML = `<span>Lanjut</span><span class="material-symbols-rounded" style="font-size:18px;">arrow_forward</span>`;
        nextBtn.style.background = '#5B8FD4';
      }
    }
  };

  return { init: checkAndShow, open, close, complete, nextSlide, prevSlide, selectGender, toggleGoal, selectTime, selectAiStyle };
})();

window.Onboarding = Onboarding;

// ---- Streak Share Modal Engine ----
const STREAK_AI_QUOTES = [
  'Satu hari lagi jujur dan ramah pada diri sendiri.',
  'Melangkah pelan, merawat ketenangan jiwa.',
  'Setiap detik refleksi adalah ruang bertumbuh.',
  'Hadir utuh menyapa apa pun rasa hari ini.',
  'Konsisten menjaga damai di dalam dada.',
  'Hargai setiap proses kecil perjalanan ini.'
];

let streakInputInitialized = false;

window.openShareStreakModal = function () {
  const modal = document.getElementById('share-streak-modal');
  if (!modal) return;

  const streak = (typeof Storage !== 'undefined' && Storage.getStreak) ? Storage.getStreak() : 1;
  const username = (typeof Storage !== 'undefined' && Storage.getUserName) ? Storage.getUserName() : 'User Tenang.in';

  const countEl = document.getElementById('streak-share-count-text');
  const userEl = document.getElementById('streak-share-username');
  const dateEl = document.getElementById('streak-share-date');
  const captionInput = document.getElementById('streak-caption-input');
  const captionPreview = document.getElementById('streak-share-caption-preview');

  if (countEl) countEl.textContent = `${streak} HARI`;
  if (userEl) userEl.textContent = username || 'User Tenang.in';
  if (dateEl) {
    const now = new Date();
    dateEl.textContent = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Set default caption if empty
  const defaultCaption = 'Melangkah pelan, merawat ketenangan jiwa.';
  if (captionInput && !captionInput.value.trim()) {
    captionInput.value = defaultCaption;
  }
  if (captionPreview) {
    captionPreview.textContent = `"${(captionInput ? captionInput.value.trim() : defaultCaption) || defaultCaption}"`;
  }

  // Attach live input listener once
  if (captionInput && !streakInputInitialized) {
    captionInput.addEventListener('input', () => {
      const val = captionInput.value.trim();
      if (captionPreview) {
        captionPreview.textContent = `"${val || defaultCaption}"`;
      }
    });
    streakInputInitialized = true;
  }

  modal.classList.add('active');
};

window.generateStreakCaption = function () {
  const captionInput = document.getElementById('streak-caption-input');
  const captionPreview = document.getElementById('streak-share-caption-preview');
  if (!captionInput) return;

  // Pick a random quote distinct from current
  const currentVal = captionInput.value.trim();
  const availableQuotes = STREAK_AI_QUOTES.filter(q => q !== currentVal);
  const randomQuote = availableQuotes[Math.floor(Math.random() * availableQuotes.length)] || STREAK_AI_QUOTES[0];

  captionInput.value = randomQuote;
  if (captionPreview) {
    captionPreview.textContent = `"${randomQuote}"`;
  }

  if (typeof Animations !== 'undefined' && Animations.showToast) {
    Animations.showToast('Kata-kata disajikan khusus oleh Teman AI ✨', 'info', 2000);
  }
};

window.changeStreakShareTheme = function (theme, btn) {
  const preview = document.getElementById('streak-share-card-preview');
  if (!preview) return;

  const themes = {
    sunset: 'linear-gradient(135deg, #F97316, #EF4444)',
    blue: 'linear-gradient(135deg, #2D5BA8, #7EC8E3)',
    midnight: 'linear-gradient(135deg, #0F172A, #1E293B, #334155)',
    forest: 'linear-gradient(135deg, #059669, #10B981, #34D399)',
    purple: 'linear-gradient(135deg, #7E22CE, #A855F7, #EC4899)'
  };

  preview.style.background = themes[theme] || themes.sunset;

  const buttons = document.querySelectorAll('#streak-share-theme-selector button');
  buttons.forEach(b => {
    b.style.border = '2px solid transparent';
    b.style.transform = 'scale(1)';
  });
  if (btn) {
    btn.style.border = '2px solid #FFFFFF';
    btn.style.transform = 'scale(1.1)';
  }
};

window.copyStreakShare = function () {
  const streak = (typeof Storage !== 'undefined' && Storage.getStreak) ? Storage.getStreak() : 1;
  const captionInput = document.getElementById('streak-caption-input');
  const customQuote = captionInput ? captionInput.value.trim() : '';

  const shareText = `🔥 Streak Refleksi ${streak} Hari Beruntun!\n"${customQuote || 'Melangkah pelan, merawat ketenangan jiwa.'}"\n\nYuk mulai perjalanan refleksi dirimu di https://tenang.in #TenangIn`;

  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(shareText).then(() => {
      if (typeof Animations !== 'undefined' && Animations.showToast) {
        Animations.showToast('Teks streak berhasil disalin ke papan klip!', 'success');
      }
    });
  } else {
    if (typeof Animations !== 'undefined' && Animations.showToast) {
      Animations.showToast('Teks streak berhasil disalin!', 'success');
    }
  }
};

window.simulateStreakShare = function () {
  document.getElementById('share-streak-modal')?.classList.remove('active');
  if (typeof Animations !== 'undefined' && Animations.showToast) {
    Animations.showToast('Pesan streak berhasil dibagikan! Terus pertahankan semangatmu! 🔥', 'success');
  }
};

/* ========================================================
   SECTIONS FOR BERANDA: PERSONALITY & ACHIEVEMENTS SHOWCASE
   ======================================================== */

// ---- SECTION 1: PROFIL KEPRIBADIAN & SELF-CARE RECOMMENDATIONS ----
function renderHomePersonalitySection() {
  const container = document.getElementById('beranda-personality-section');
  if (!container) return;

  const typeKey = (typeof Storage !== 'undefined' && typeof Storage.getKenaliType === 'function')
    ? Storage.getKenaliType()
    : (localStorage.getItem('tenang_kenali_type') || localStorage.getItem('tenang_personality_type'));

  const typesData = {
    IT: {
      name: 'Pemikir Tenang',
      tagline: 'Introvert + Thinker',
      icon: 'dark_mode',
      color: '#4F46E5',
      bg: '#EEF2FF',
      border: '#C7D2FE',
      strengths: ['Analitis Mendalam', 'Reflektif Mandiri', 'Fokus Terstruktur'],
      tip: 'Tuangkan pikiran lewat jurnal untuk membantu menata ide & merapikan kompleksitas di dalam kepala.'
    },
    IF: {
      name: 'Perasa Mendalam',
      tagline: 'Introvert + Feeler',
      icon: 'favorite',
      color: '#D97706',
      bg: '#FEF3C7',
      border: '#FDE68A',
      strengths: ['Empati Tinggi', 'Self-Compassion', 'Peka Emosional'],
      tip: 'Perasaanmu adalah kompas. Luangkan waktu untuk menyapa emosimu tanpa rasa salah hari ini.'
    },
    ET: {
      name: 'Pemimpin Aktif',
      tagline: 'Ekstrovert + Thinker',
      icon: 'bolt',
      color: '#059669',
      bg: '#D1FAE5',
      border: '#A7F3D0',
      strengths: ['Solutif & Cepat', 'Berani Bertindak', 'Energi Tinggi'],
      tip: 'Ubah kecemasan jadi aksi nyata. Langkah kecil yang dieksekusi hari ini jauh lebih berharga.'
    },
    EF: {
      name: 'Jiwa Sosial',
      tagline: 'Ekstrovert + Feeler',
      icon: 'auto_awesome',
      color: '#9333EA',
      bg: '#F3E8FF',
      border: '#E9D5FF',
      strengths: ['Komunikatif Warm', 'Penghangat Suasana', 'Koneksi Jiwa'],
      tip: 'Berbagi cerita memberi kekuatan baru. Mengobrol privat bersama Teman AI dapat membuatmu lega.'
    }
  };

  if (typeKey && typesData[typeKey]) {
    const t = typesData[typeKey];
    container.innerHTML = `
      <div class="card" style="padding: clamp(20px, 4vw, 28px); background: #FFFFFF; border: 1.5px solid ${t.border}; border-radius: 24px; box-shadow: 0 12px 32px -6px rgba(15, 23, 42, 0.08); position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 50px; height: 50px; border-radius: 16px; background: ${t.bg}; border: 1.5px solid ${t.border}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px ${t.color}20;">
              <span class="material-symbols-rounded" style="color: ${t.color}; font-size: 28px;">${t.icon}</span>
            </div>
            <div>
              <span style="font-size: 0.72rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0.8px; color: ${t.color};">Profil Kepribadian Refleksimu</span>
              <h2 style="font-size: clamp(1.15rem, 4vw, 1.4rem); font-weight: 850; color: #0F172A; margin: 2px 0 0;">${t.name} <span style="font-size: 0.85rem; font-weight: 600; color: #64748B;">(${t.tagline})</span></h2>
            </div>
          </div>
          <a href="kenali.html" class="btn btn-sm" style="background: #F8FAFC; border: 1px solid #E2E8F0; color: #0F172A; font-weight: 750; font-size: 0.8rem; border-radius: 20px; padding: 6px 14px; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
            <span class="material-symbols-rounded" style="font-size: 16px;">refresh</span>
            <span>Ulangi Tes</span>
          </a>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px;">
          ${t.strengths.map(s => `<span style="background: ${t.bg}; border: 1px solid ${t.border}; color: ${t.color}; font-size: 0.76rem; font-weight: 750; padding: 4px 12px; border-radius: 16px; display: inline-flex; align-items: center; gap: 4px;"><span class="material-symbols-rounded" style="font-size: 14px; color: ${t.color};">auto_awesome</span> ${s}</span>`).join('')}
        </div>

        <div style="background: var(--card-subtle, #F8FAFC); border: 1px solid var(--card-border, #E2E8F0); border-radius: 16px; padding: 14px 18px; font-size: 0.88rem; color: var(--text-secondary, #334155); line-height: 1.55; font-weight: 500;">
          <strong style="color: ${t.color};">Aksi Self-Care Hari Ini:</strong> ${t.tip}
        </div>
      </div>
    `;
  } else {
    // Show inviting preview card if user hasn't completed quiz
    container.innerHTML = `
      <div class="card" style="padding: clamp(20px, 4vw, 28px); background: linear-gradient(135deg, #FFFFFF 0%, #F0F6FF 100%); border: 1.5px solid #BAE6FD; border-radius: 24px; box-shadow: 0 12px 32px -6px rgba(15, 23, 42, 0.08); position: relative; overflow: hidden;">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px; margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 50px; height: 50px; border-radius: 16px; background: #E0F2FE; border: 1.5px solid #BAE6FD; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.2);">
              <span class="material-symbols-rounded" style="color: #0284C7; font-size: 28px;">psychology</span>
            </div>
            <div>
              <span style="font-size: 0.72rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0.8px; color: #0284C7;">Kuis Self-Discovery (3 Menit)</span>
              <h2 style="font-size: clamp(1.15rem, 4vw, 1.4rem); font-weight: 850; color: #0F172A; margin: 2px 0 0;">Temukan Tipe Kepribadian Refleksimu</h2>
            </div>
          </div>
          <a href="kenali.html" class="btn btn-primary" style="background: #0284C7; border-color: #0284C7; color: #FFFFFF; font-weight: 800; font-size: 0.88rem; padding: 10px 22px; border-radius: 999px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);">
            <span class="material-symbols-rounded" style="font-size: 20px;">play_arrow</span>
            <span>Mulai Kuis Sekarang</span>
          </a>
        </div>
        
        <p style="font-size: 0.88rem; color: #475569; line-height: 1.55; margin: 0 0 16px; max-width: 680px;">
          Jawab 12 pertanyaan singkat untuk mengenali keunikan emosionalmu, menemukan 4 tipe karakter refleksi, dan mendapatkan rekomendasi perawatan diri (*self-care*) yang dipersonalisasi.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 10px; text-align: center;">
            <span class="material-symbols-rounded" style="color: #4F46E5; font-size: 22px;">dark_mode</span>
            <div style="font-size: 0.8rem; font-weight: 800; color: #0F172A; margin-top: 2px;">Pemikir Tenang</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 10px; text-align: center;">
            <span class="material-symbols-rounded" style="color: #D97706; font-size: 22px;">favorite</span>
            <div style="font-size: 0.8rem; font-weight: 800; color: #0F172A; margin-top: 2px;">Perasa Mendalam</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 10px; text-align: center;">
            <span class="material-symbols-rounded" style="color: #059669; font-size: 22px;">bolt</span>
            <div style="font-size: 0.8rem; font-weight: 800; color: #0F172A; margin-top: 2px;">Pemimpin Aktif</div>
          </div>
          <div style="background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 14px; padding: 10px; text-align: center;">
            <span class="material-symbols-rounded" style="color: #9333EA; font-size: 22px;">auto_awesome</span>
            <div style="font-size: 0.8rem; font-weight: 800; color: #0F172A; margin-top: 2px;">Jiwa Sosial</div>
          </div>
        </div>
      </div>
    `;
  }
}
window.renderHomePersonalitySection = renderHomePersonalitySection;

// ---- SECTION 2: MEDALI PENCAPAIAN & REKOR REFLEKSI ----
function renderHomeAchievementsShowcase() {
  const container = document.getElementById('beranda-achievements-section');
  if (!container) return;

  const streak = (typeof Storage !== 'undefined' && Storage.getStreak) ? Storage.getStreak() : 0;
  const journalsCount = (typeof Storage !== 'undefined' && Storage.getJournals) ? Storage.getJournals().length : 0;
  const moodHistory = (typeof Storage !== 'undefined' && Storage.getMoodHistory) ? Storage.getMoodHistory() : [];
  const moodCount = moodHistory.length;

  const badges = [
    {
      id: 'first_step',
      name: 'Langkah Pertama',
      symbol: 'directions_walk',
      color: '#0284C7',
      desc: 'Melakukan check-in mood pertamamu',
      unlocked: moodCount >= 1
    },
    {
      id: 'streak_7',
      name: 'Streak Master',
      symbol: 'local_fire_department',
      color: '#EA580C',
      desc: 'Mencapai 7 hari streak berturut-turut',
      unlocked: streak >= 7
    },
    {
      id: 'journal_master',
      name: 'Pena Emas',
      symbol: 'edit_note',
      color: '#059669',
      desc: 'Menulis setidaknya 5 entri jurnal refleksi',
      unlocked: journalsCount >= 5
    },
    {
      id: 'explorer',
      name: 'Penjelajah Jiwa',
      symbol: 'psychology',
      color: '#7C3AED',
      desc: 'Melengkapi tes kepribadian & gaya refleksi',
      unlocked: Boolean(localStorage.getItem('tenang_kenali_type') || localStorage.getItem('tenang_personality_type'))
    }
  ];

  const unlockedCount = badges.filter(b => b.unlocked).length;

  container.innerHTML = `
    <div class="card" style="padding: clamp(20px, 4vw, 28px); background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 24px; box-shadow: 0 12px 32px -6px rgba(15, 23, 42, 0.08);">
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 18px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 16px; background: #F3E8FF; border: 1.5px solid #E9D5FF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 12px rgba(126, 34, 206, 0.15);">
            <span class="material-symbols-rounded" style="color: #7E22CE; font-size: 28px;">military_tech</span>
          </div>
          <div>
            <h2 style="font-size: clamp(1.15rem, 4vw, 1.4rem); font-weight: 850; color: #0F172A; margin: 0;">Medali Pencapaian & Rekor Refleksi</h2>
          </div>
        </div>
        <a href="dashboard.html#dashboard-badges" class="btn btn-sm" style="background: #F8FAFC; border: 1px solid #E2E8F0; color: #7E22CE; font-weight: 800; font-size: 0.82rem; border-radius: 20px; padding: 6px 16px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px;">
          <span>Lihat Selengkapnya</span>
          <span class="material-symbols-rounded" style="font-size: 16px;">arrow_forward</span>
        </a>
      </div>

      <!-- Stat Counter Pills with Material Symbols Icons -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px; margin-bottom: 20px;">
        <div style="background: #FFF7ED; border: 1px solid #FFEDD5; border-radius: 16px; padding: 10px 12px; text-align: center;">
          <div style="font-size: 1.25rem; font-weight: 850; color: #EA580C; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            <span class="material-symbols-rounded" style="font-size: 22px; color: #EA580C;">local_fire_department</span>
            <span>${streak}</span>
          </div>
          <div style="font-size: 0.72rem; font-weight: 750; color: #9A3412; margin-top: 2px;">Hari Streak</div>
        </div>

        <div style="background: #F0F9FF; border: 1px solid #BAE6FD; border-radius: 16px; padding: 10px 12px; text-align: center;">
          <div style="font-size: 1.25rem; font-weight: 850; color: #0284C7; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            <span class="material-symbols-rounded" style="font-size: 22px; color: #0284C7;">analytics</span>
            <span>${moodCount}</span>
          </div>
          <div style="font-size: 0.72rem; font-weight: 750; color: #0369A1; margin-top: 2px;">Check-In Mood</div>
        </div>

        <div style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 16px; padding: 10px 12px; text-align: center;">
          <div style="font-size: 1.25rem; font-weight: 850; color: #059669; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            <span class="material-symbols-rounded" style="font-size: 22px; color: #059669;">edit_note</span>
            <span>${journalsCount}</span>
          </div>
          <div style="font-size: 0.72rem; font-weight: 750; color: #047857; margin-top: 2px;">Jurnal Refleksi</div>
        </div>

        <div style="background: #F3E8FF; border: 1px solid #E9D5FF; border-radius: 16px; padding: 10px 12px; text-align: center;">
          <div style="font-size: 1.25rem; font-weight: 850; color: #7E22CE; display: inline-flex; align-items: center; justify-content: center; gap: 4px;">
            <span class="material-symbols-rounded" style="font-size: 22px; color: #7E22CE;">military_tech</span>
            <span>${unlockedCount}/4</span>
          </div>
          <div style="font-size: 0.72rem; font-weight: 750; color: #6B21A8; margin-top: 2px;">Medali Terbuka</div>
        </div>
      </div>

      <!-- Badge Cards -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px;">
        ${badges.map(b => `
          <div style="background: ${b.unlocked ? '#FFFFFF' : '#F8FAFC'}; border: 1.5px solid ${b.unlocked ? b.color + '45' : '#E2E8F0'}; border-radius: 16px; padding: 12px 14px; display: flex; align-items: center; gap: 12px; opacity: ${b.unlocked ? 1 : 0.65}; box-shadow: ${b.unlocked ? '0 4px 12px rgba(0,0,0,0.04)' : 'none'}; transition: transform 0.2s;">
            <div style="width: 44px; height: 44px; border-radius: 12px; background: ${b.unlocked ? b.color + '1A' : '#E2E8F0'}; border: 1px solid ${b.unlocked ? b.color + '50' : '#CBD5E1'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <span class="material-symbols-rounded" style="color: ${b.unlocked ? b.color : '#94A3B8'}; font-size: 24px;">${b.symbol}</span>
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="font-size: 0.85rem; font-weight: 850; color: ${b.unlocked ? '#0F172A' : '#64748B'}; line-height: 1.25; word-break: break-word;">${b.name}</div>
              <div style="font-size: 0.72rem; color: ${b.unlocked ? b.color : '#94A3B8'}; font-weight: 750; margin-top: 2px; display: inline-flex; align-items: center; gap: 3px;">
                <span class="material-symbols-rounded" style="font-size: 13px;">${b.unlocked ? 'check_circle' : 'lock'}</span>
                <span>${b.unlocked ? 'Terbuka' : 'Terkunci'}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

}
window.renderHomeAchievementsShowcase = renderHomeAchievementsShowcase;


