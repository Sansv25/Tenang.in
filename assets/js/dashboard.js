/* =============================================
   Tenang.in — Dashboard Script
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
  if (typeof Main !== 'undefined' && Main.initPage) {
    await Main.initPage('dashboard');
  }
  checkEmptyState();
  renderQuote();
  renderMiniChart();
  renderStats();
  renderBadges();
  renderMiniGrid();
});

// ---- Empty State Check ----
function checkEmptyState() {
  const moodHistory = JSON.parse(localStorage.getItem('tenang_moods') || '[]');
  const emptyEl = document.getElementById('empty-state');
  const contentEl = document.getElementById('dashboard-content');
  if (!moodHistory.length) {
    if (emptyEl) emptyEl.style.display = 'flex';
    if (contentEl) contentEl.style.display = 'none';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    if (contentEl) contentEl.style.display = 'block';
  }
}

// ---- Helpers for Rules & Statistics ----
function getDominantTag(moods) {
  const tagCount = {};
  (moods || []).forEach(m => {
    (m.tags || []).forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
  });
  let maxTag = null, maxCount = 0;
  for (const [tag, count] of Object.entries(tagCount)) {
    if (count > maxCount) { maxTag = tag; maxCount = count; }
  }
  return maxTag;
}

function getStreak(moods) {
  if (typeof Storage !== 'undefined' && Storage.getStreak) {
    return Storage.getStreak();
  }
  if (!moods || moods.length === 0) return 0;
  const sortedDates = [...new Set(moods.map(m => m.date))].sort().reverse();
  let streak = 0;
  let checkDate = new Date();
  for (const dateStr of sortedDates) {
    const expected = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
    if (dateStr === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function getJournalCount() {
  const journals = JSON.parse(localStorage.getItem('tenang_journals') || '[]');
  return journals.length;
}

function getJournalCountThisMonth() {
  const journals = JSON.parse(localStorage.getItem('tenang_journals') || '[]');
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();
  return journals.filter(j => {
    const d = j.timestamp ? new Date(j.timestamp) : (j.date ? new Date(j.date) : new Date());
    return d.getMonth() === curMonth && d.getFullYear() === curYear;
  }).length;
}

// ---- Daily Quote (Rule-based) ----
function getDailyQuote() {
  const moodHistory = JSON.parse(localStorage.getItem('tenang_moods') || '[]');
  const dominantTag = getDominantTag(moodHistory);
  const streak = getStreak(moodHistory);
  const userType = localStorage.getItem('tenang_user_type') || (typeof Storage !== 'undefined' ? Storage.getUserType() : null);
  const hour = new Date().getHours();

  const lastMoods = moodHistory.slice(-3).map(m => m.score !== undefined ? m.score : (m.level || 3));
  const avgMood = lastMoods.length ? lastMoods.reduce((a,b) => a+b, 0) / lastMoods.length : 3;

  if (dominantTag === 'Lelah' && moodHistory.slice(-2).every(m => (m.tags || []).includes('Lelah')))
    return "Hari ini kamu bisa coba tidur lebih awal. Tubuh yang istirahat cukup akan membawa pikiran yang lebih jernih. 🌙";
  if (avgMood <= 2 && lastMoods.length >= 3)
    return "Kamu sudah melewati hari-hari berat. Itu butuh kekuatan yang luar biasa. Bangga sama dirimu. 💙";
  if (streak >= 5)
    return `${streak} hari berturut-turut check-in — kamu luar biasa konsisten! 🔥`;
  if (userType === 'malam' && hour >= 20)
    return "Malam yang tenang untuk pikiran yang jernih. Selamat merenung. 🌙";
  if (userType === 'pagi' && hour < 12)
    return "Pagi yang bagus untuk memulai hari dengan niat yang baik. ☀️";
  if (!moodHistory.length)
    return "Mulai check-in mood hari ini untuk melihat perjalananmu di sini.";
  return "Setiap hari adalah kesempatan baru untuk mengenal dirimu lebih dalam. ✨";
}

function renderQuote() {
  const quoteTextEl = document.getElementById('daily-quote');
  if (quoteTextEl) {
    quoteTextEl.textContent = getDailyQuote();
  }
  const markDoneBtn = document.getElementById('mark-done-btn');
  if (markDoneBtn) {
    const today = typeof Storage !== 'undefined' ? Storage.todayKey() : new Date().toISOString().split('T')[0];
    if (localStorage.getItem('tenang_quote_done_' + today)) {
      markDoneBtn.innerHTML = '<span class="material-icons" style="font-size:18px;">done_all</span> Selesai dibaca';
      markDoneBtn.style.background = '#DCFCE7';
      markDoneBtn.style.color = '#15803D';
      markDoneBtn.disabled = true;
    }
    markDoneBtn.addEventListener('click', () => {
      localStorage.setItem('tenang_quote_done_' + today, 'true');
      markDoneBtn.innerHTML = '<span class="material-icons" style="font-size:18px;">done_all</span> Selesai dibaca';
      markDoneBtn.style.background = '#DCFCE7';
      markDoneBtn.style.color = '#15803D';
      markDoneBtn.disabled = true;
      if (typeof Animations !== 'undefined' && Animations.showToast) {
        Animations.showToast('Kutipan harian selesai dibaca ✨', 'success');
      }
    });
  }
}

// ---- Mini Chart ----
function renderMiniChart() {
  const chartEl = document.getElementById('dashboard-chart');
  if (!chartEl || typeof Charts === 'undefined' || !Charts.createMiniChart) return;
  const history = typeof Storage !== 'undefined' ? Storage.getMoodHistory(7) : [];
  Charts.createMiniChart(chartEl, history);
}

// ---- Statistik Cards ----
function renderStats() {
  const moodHistory = JSON.parse(localStorage.getItem('tenang_moods') || '[]');
  
  const streakEl = document.getElementById('stat-streak');
  if (streakEl) streakEl.textContent = getStreak(moodHistory);
  
  const journalEl = document.getElementById('stat-journal');
  if (journalEl) journalEl.textContent = getJournalCountThisMonth();
  
  const temanEl = document.getElementById('stat-teman');
  if (temanEl) temanEl.textContent = parseInt(localStorage.getItem('tenang_teman_sessions') || '0');

  // Mood rata-rata minggu ini (emoji)
  const weekMoods = moodHistory.slice(-7).map(m => m.score !== undefined ? m.score : (m.level || 0));
  const avg = weekMoods.length ? 
    Math.round(weekMoods.reduce((a,b) => a+b, 0) / weekMoods.length) : 0;
  const avgEmojis = ['-', '😫', '😔', '😐', '🙂', '😄'];
  
  const avgMoodEl = document.getElementById('stat-avg-mood');
  if (avgMoodEl) avgMoodEl.textContent = avgEmojis[avg] || '-';
}

// ---- Badge Pencapaian ----
const badges = [
  {
    id: 'first-checkin',
    icon: 'eco',
    name: 'Langkah Pertama',
    desc: 'Check-in mood pertama kali',
    condition: () => {
      const moodHistory = JSON.parse(localStorage.getItem('tenang_moods') || '[]');
      return moodHistory.length >= 1;
    }
  },
  {
    id: 'streak-3',
    icon: 'local_fire_department',
    name: '3 Hari Berturut',
    desc: 'Check-in 3 hari berturut-turut',
    condition: () => {
      const moodHistory = JSON.parse(localStorage.getItem('tenang_moods') || '[]');
      return getStreak(moodHistory) >= 3;
    }
  },
  {
    id: 'streak-7',
    icon: 'star',
    name: '7 Hari Konsisten',
    desc: 'Check-in 7 hari berturut-turut',
    condition: () => {
      const moodHistory = JSON.parse(localStorage.getItem('tenang_moods') || '[]');
      return getStreak(moodHistory) >= 7;
    }
  },
  {
    id: 'journal-5',
    icon: 'edit_note',
    name: 'Penulis Pemula',
    desc: '5 entri jurnal',
    condition: () => getJournalCount() >= 5
  },
  {
    id: 'journal-15',
    icon: 'menu_book',
    name: 'Penulis Aktif',
    desc: '15 entri jurnal',
    condition: () => getJournalCount() >= 15
  },
  {
    id: 'profile-done',
    icon: 'person',
    name: 'Sudah Kenal Diri',
    desc: 'Selesaikan kuis Profil',
    condition: () => !!(localStorage.getItem('tenang_user_type') || (typeof Storage !== 'undefined' && Storage.getQuizResult('profil')))
  },
  {
    id: 'kenali-done',
    icon: 'psychology',
    name: 'Sudah Kenali Dirimu',
    desc: 'Selesaikan kuis Kenali Dirimu',
    condition: () => !!(localStorage.getItem('tenang_personality_type') || (typeof Storage !== 'undefined' && Storage.getQuizResult('kenali')))
  }
];

function renderBadges() {
  const container = document.getElementById('badge-grid');
  if (!container) return;
  container.innerHTML = '';
  badges.forEach(badge => {
    const unlocked = badge.condition();
    container.innerHTML += `
      <div class="badge-item ${unlocked ? 'unlocked' : 'locked'}" 
           title="${badge.desc}" onclick="openBadgeDetail('${badge.id}')">
        <div class="badge-circle">
          <span class="material-icons">${unlocked ? badge.icon : 'lock'}</span>
        </div>
        <span class="badge-name">${badge.name}</span>
      </div>
    `;
  });
}

function openBadgeDetail(id) {
  const badge = badges.find(b => b.id === id);
  if (!badge) return;

  const modal = document.getElementById('badge-detail-modal');
  if (!modal) return;
  const unlocked = badge.condition();
  const symbolEl = document.getElementById('badge-detail-symbol');
  if (symbolEl) symbolEl.textContent = unlocked ? badge.icon : 'lock';
  
  const iconWrap = document.getElementById('badge-detail-icon');
  if (iconWrap) iconWrap.style.color = unlocked ? '#5B8FD4' : '#94A3B8';
  
  const titleEl = document.getElementById('badge-detail-title');
  if (titleEl) titleEl.textContent = badge.name;
  
  const statusEl = document.getElementById('badge-detail-status');
  if (statusEl) {
    if (unlocked) {
      statusEl.textContent = '✨ Badge Terbuka';
      statusEl.style.color = '#5BC4A0';
    } else {
      statusEl.textContent = '🔒 Badge Terkunci';
      statusEl.style.color = '#94A3B8';
    }
  }
  
  const descEl = document.getElementById('badge-detail-desc');
  if (descEl) descEl.textContent = badge.desc;
  
  modal.classList.add('active');
}

// ---- Mini Contribution Grid ----
let gridMonthOffset = 0;

function renderMiniGrid() {
  const gridEl = document.getElementById('dashboard-grid');
  if (!gridEl || typeof Charts === 'undefined' || !Charts.createContributionGrid) return;
  const moods = typeof Storage !== 'undefined' ? Storage.getMoods() : [];
  Charts.createContributionGrid(gridEl, moods, 35, gridMonthOffset);
}

function navigateGridMonth(direction) {
  gridMonthOffset += direction;
  if (gridMonthOffset > 0) gridMonthOffset = 0;
  renderMiniGrid();
}
