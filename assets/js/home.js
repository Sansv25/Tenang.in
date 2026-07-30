/* =============================================
   Tenang.in — Home Page Script
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
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

  // ---- Check if already checked in today ----
  if (Storage.isFirstVisitToday()) {
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
  updateCTAButton();
  Animations.showToast('Mood hari ini tersimpan!', 'success');

  // Check low mood
  if (selectedMood <= 2) {
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
  if (streakContainer) {
    streakContainer.style.display = 'inline-flex';
  }
}

// ---- Update Mood Summary ----
function updateMoodSummary() {
  const mood = Storage.getMoodToday();
  const summaryEl = document.getElementById('mood-today-summary');
  if (summaryEl && mood) {
    const icons = {
      1: 'sentiment_very_dissatisfied',
      2: 'sentiment_dissatisfied',
      3: 'sentiment_neutral',
      4: 'sentiment_satisfied',
      5: 'sentiment_very_satisfied'
    };
    summaryEl.innerHTML = `
      <span class="material-symbols-rounded text-primary" style="font-size:24px;">${icons[mood.level]}</span>
      <span style="font-size:0.8125rem; font-weight:600; color:var(--text-on-blue);">Mood hari ini</span>
    `;
  }
}

// ---- Update CTA Button ----
function updateCTAButton() {
  const btn = document.getElementById('checkin-cta-btn');
  if (!btn) return;

  const mood = Storage.getMoodToday();
  if (mood) {
    const icons = {
      1: 'sentiment_very_dissatisfied',
      2: 'sentiment_dissatisfied',
      3: 'sentiment_neutral',
      4: 'sentiment_satisfied',
      5: 'sentiment_very_satisfied'
    };
    const colors = {
      1: 'var(--mood-1)',
      2: 'var(--mood-2)',
      3: 'var(--mood-3)',
      4: 'var(--mood-4)',
      5: 'var(--mood-5)'
    };
    btn.innerHTML = `
      <span class="material-symbols-rounded" style="font-size:22px; color:${colors[mood.level]};">${icons[mood.level]}</span>
      Lihat Mood Tracker
    `;
    btn.onclick = () => { window.location.href = 'mood-tracker.html'; };
  }
}

// ---- Load Daily Tip ----
async function loadDailyTip() {
  const tipEl = document.getElementById('daily-tip');
  if (!tipEl) return;

  try {
    const res = await fetch('assets/data/tips.json');
    const tips = await res.json();

    const kenaliType = Storage.getKenaliType();
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
  } catch(e) {
    tipEl.innerHTML = `
      <div class="insight-card">
        <div class="insight-card-header">
          <span class="material-symbols-rounded" style="color:var(--primary-accent); font-size:22px;">lightbulb</span>
          <span>Tips Hari Ini</span>
        </div>
        <p style="font-size:0.9375rem; line-height:1.65; color:var(--text-on-white);">Hari ini adalah kesempatan baru. Mulai dari hal kecil yang membuatmu tersenyum.</p>
      </div>
    `;
  }
}

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
    authorEl.textContent = `— ${inspirationList[0].author}`;
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
    authorEl.textContent = `— ${inspirationList[currentInspIdx].author}`;
    container.classList.remove('fading');
  }, 250);
}

// ---- Handle Logout ----
function handleLogout() {
  localStorage.removeItem('tenang_logged_in_user');
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) logoutBtn.style.display = 'none';

  const greetingEl = document.getElementById('greeting-text');
  if (greetingEl) greetingEl.textContent = 'Selamat Datang!';
  
  if (typeof Animations !== 'undefined') {
    Animations.showToast('Kamu telah berhasil keluar. Mengalihkan ke halaman utama...', 'info');
  }
  
  // Directly redirect to Landing Page (index.html) as requested by USER
  setTimeout(() => {
    window.location.href = 'index.html';
  }, 400);
}
