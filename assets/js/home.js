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
      summaryEl.innerHTML = `
        <span class="material-symbols-rounded" style="font-size:24px; color:${colors[mood.level]};">${icons[mood.level]}</span>
        <span style="font-size:0.8125rem; font-weight:600; color:var(--text-on-blue);">${labels[mood.level].split(' · ')[0]}</span>
      `;
    }
    
    if (gridContainer && checkedInState) {
      gridContainer.style.display = 'none';
      checkedInState.style.display = 'block';

      const tagsHTML = mood.tags && mood.tags.length > 0 
        ? `<div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin:16px 0;">
             ${mood.tags.map(t => `<span style="background:rgba(15,23,42,0.06); border:1px solid rgba(15,23,42,0.15); color:#334155; font-size:0.75rem; font-weight:600; padding:4px 12px; border-radius:16px;">#${t}</span>`).join('')}
           </div>` 
        : '';
        
      const noteHTML = mood.note 
        ? `<div style="margin:16px auto; max-width:420px; padding:12px 16px; background:#F8FAFC; border-left:4px solid ${colors[mood.level]}; border-radius:6px; color:#475569; font-size:0.9rem; font-style:italic; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.05);">"${mood.note}"</div>`
        : '';

      checkedInState.innerHTML = `
        <div style="padding: 20px 24px; max-width: 600px; margin: 0 auto; text-align:center;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: ${bgGlows[mood.level]}; border: 2px solid ${colors[mood.level]}; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; box-shadow: 0 6px 24px ${bgGlows[mood.level]};">
            <span class="material-symbols-rounded" style="font-size: 46px; color: ${colors[mood.level]};">${icons[mood.level]}</span>
          </div>
          <span style="display:inline-block; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:${colors[mood.level]}; background:${bgGlows[mood.level]}; padding:4px 14px; border-radius:12px; margin-bottom:12px;">Check-In Hari Ini Tersimpan</span>
          <h3 style="font-size:1.5rem; font-weight:800; color:#1E293B; margin: 4px 0;">${labels[mood.level]}</h3>
          <p style="color:#64748B; font-size:0.95rem; line-height:1.6; max-width:480px; margin: 8px auto 0;">
            Terimakasih telah hadir dan jujur melacak emosimu hari ini. Konsistensi dalam mengenali diri sendiri adalah langkah utama menuju jiwa yang tenang dan berdaya.
          </p>
          
          ${tagsHTML}
          ${noteHTML}

          <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:14px; margin-top:28px;">
            <a href="mood-tracker.html" style="text-decoration:none; background:linear-gradient(135deg, #2563EB, #3B82F6); color:#fff; padding:12px 26px; border-radius:26px; font-weight:700; font-size:0.9rem; display:flex; align-items:center; gap:6px; box-shadow:0 4px 16px rgba(37,99,235,0.35); transition:transform 0.2s;">
              <span class="material-symbols-rounded" style="font-size:20px;">analytics</span>
              Lihat Analisa & Grafisku
            </a>
            <button onclick="window.resetMoodInHome()" style="background:#F1F5F9; border:1px solid #CBD5E1; color:#334155; padding:12px 24px; border-radius:26px; font-weight:600; font-size:0.9rem; display:flex; align-items:center; gap:6px; cursor:pointer; transition:background 0.2s;">
              <span class="material-symbols-rounded" style="font-size:20px;">edit_note</span>
              Ubah Check-In
            </button>
          </div>
        </div>
      `;
    }

    if (checkinCtaBtn) {
      checkinCtaBtn.style.display = 'none';
    }
  } else {
    if (gridContainer && checkedInState) {
      gridContainer.style.display = 'grid';
      checkedInState.style.display = 'none';
    }
    if (checkinCtaBtn) {
      checkinCtaBtn.style.display = 'inline-flex';
      checkinCtaBtn.innerHTML = `
        <span class="material-symbols-rounded" style="font-size:18px;">add_circle</span>
        <span>Buka Form Lengkap</span>
      `;
      checkinCtaBtn.onclick = () => showCheckInModal();
    }
  }
}

window.resetMoodInHome = function() {
  const gridContainer = document.getElementById('mood-grid-container');
  const checkedInState = document.getElementById('mood-checked-in-state');
  const checkinCtaBtn = document.getElementById('checkin-cta-btn');
  if (gridContainer) gridContainer.style.display = 'grid';
  if (checkedInState) checkedInState.style.display = 'none';
  if (checkinCtaBtn) {
    checkinCtaBtn.style.display = 'inline-flex';
  }
  showCheckInModal();
};

// ---- Update CTA Button (now unified with updateMoodSummary) ----
function updateCTAButton() {
  updateMoodSummary();
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
