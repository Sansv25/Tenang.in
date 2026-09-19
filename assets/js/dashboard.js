/* =============================================
   Tenang.in, Dashboard Script
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

// ---- Defensive Storage Parsing Helper ----
function safeGetJSON(key, defaultVal = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    console.warn(`[Defensive Parsing] Error parsing localStorage key "${key}":`, e);
    return defaultVal;
  }
}

// ---- Empty State Check ----
function checkEmptyState() {
  const moodHistory = safeGetJSON('tenang_moods', []);
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
  const journals = safeGetJSON('tenang_journals', []);
  return journals.length;
}

function getJournalCountThisMonth() {
  const journals = safeGetJSON('tenang_journals', []);
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
  const moodHistory = safeGetJSON('tenang_moods', []);
  const dominantTag = getDominantTag(moodHistory);
  const streak = getStreak(moodHistory);
  const userType = localStorage.getItem('tenang_user_type') || (typeof Storage !== 'undefined' ? Storage.getUserType() : null);
  const hour = new Date().getHours();

  const lastMoods = moodHistory.slice(-3).map(m => m.score !== undefined ? m.score : (m.level || 3));
  const avgMood = lastMoods.length ? lastMoods.reduce((a, b) => a + b, 0) / lastMoods.length : 3;

  if (dominantTag === 'Lelah' && moodHistory.slice(-2).every(m => (m.tags || []).includes('Lelah')))
    return "Hari ini kamu bisa coba tidur lebih awal. Tubuh yang istirahat cukup akan membawa pikiran yang lebih jernih. 🌙";
  if (avgMood <= 2 && lastMoods.length >= 3)
    return "Kamu sudah melewati hari-hari berat. Itu butuh kekuatan yang luar biasa. Bangga sama dirimu. 💙";
  if (streak >= 5)
    return `${streak} hari berturut-turut check-in, kamu luar biasa konsisten! 🔥`;
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
      markDoneBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px;">done_all</span> <span>Selesai dibaca</span>';
      markDoneBtn.style.background = '#DCFCE7';
      markDoneBtn.style.color = '#15803D';
      markDoneBtn.style.borderColor = '#86EFAC';
      markDoneBtn.disabled = true;
    }
    markDoneBtn.addEventListener('click', () => {
      localStorage.setItem('tenang_quote_done_' + today, 'true');
      markDoneBtn.innerHTML = '<span class="material-symbols-rounded" style="font-size:18px;">done_all</span> <span>Selesai dibaca</span>';
      markDoneBtn.style.background = '#DCFCE7';
      markDoneBtn.style.color = '#15803D';
      markDoneBtn.style.borderColor = '#86EFAC';
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
  const moodHistory = safeGetJSON('tenang_moods', []);

  const streakEl = document.getElementById('stat-streak');
  if (streakEl) streakEl.textContent = getStreak(moodHistory);

  const journalEl = document.getElementById('stat-journal');
  if (journalEl) journalEl.textContent = getJournalCountThisMonth();

  const temanEl = document.getElementById('stat-teman');
  if (temanEl) temanEl.textContent = parseInt(localStorage.getItem('tenang_teman_sessions') || '0');

  // Mood rata-rata minggu ini (rich badge)
  const weekMoods = moodHistory.slice(-7).map(m => m.score !== undefined ? m.score : (m.level || 0)).filter(s => s > 0);
  const avg = weekMoods.length ?
    Math.round(weekMoods.reduce((a, b) => a + b, 0) / weekMoods.length) : 0;

  const avgLabels = ['Belum Ada', 'Buruk', 'Kurang', 'Biasa', 'Baik', 'Sangat Baik'];
  const avgIcons = ['help_outline', 'sentiment_very_dissatisfied', 'sentiment_dissatisfied', 'sentiment_neutral', 'sentiment_satisfied', 'sentiment_very_satisfied'];
  const avgColors = ['#64748B', '#EF4444', '#F97316', '#FBBF24', '#10B981', '#3B82F6'];

  const avgMoodEl = document.getElementById('stat-avg-mood');
  if (avgMoodEl) {
    if (avg === 0 || !weekMoods.length) {
      avgMoodEl.innerHTML = `<span style="font-size:2rem; font-weight:850; color:#64748B;">-</span>`;
    } else {
      const floatAvg = (weekMoods.reduce((a, b) => a + b, 0) / weekMoods.length).toFixed(1);
      avgMoodEl.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; gap:6px; margin: 4px 0;">
          <span style="font-size: 2.2rem; font-weight: 850; color: ${avgColors[avg]}; line-height: 1;">${floatAvg}</span>
          <span style="font-size: 0.72rem; font-weight: 800; color: ${avgColors[avg]}; background: ${avgColors[avg]}1A; border: 1px solid ${avgColors[avg]}40; padding: 2px 8px; border-radius: 10px; white-space: nowrap;">${avgLabels[avg]}</span>
        </div>`;
    }
  }
}

// ---- Badge Pencapaian ----
const badges = [
  {
    id: 'first-checkin',
    icon: 'eco',
    name: 'Langkah Pertama',
    desc: 'Check-in mood pertama kali',
    condition: () => {
      const moodHistory = safeGetJSON('tenang_moods', []);
      return moodHistory.length >= 1;
    }
  },
  {
    id: 'streak-3',
    icon: 'local_fire_department',
    name: '3 Hari Berturut',
    desc: 'Check-in 3 hari berturut-turut',
    condition: () => {
      const moodHistory = safeGetJSON('tenang_moods', []);
      return getStreak(moodHistory) >= 3;
    }
  },
  {
    id: 'streak-7',
    icon: 'star',
    name: '7 Hari Konsisten',
    desc: 'Check-in 7 hari berturut-turut',
    condition: () => {
      const moodHistory = safeGetJSON('tenang_moods', []);
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

// ---- Stat Details Modal Engine (Streak, Avg Mood, Journal, Teman) ----
function openStatModal(type) {
  const modal = document.getElementById('stat-detail-modal');
  const container = document.getElementById('stat-modal-container');
  if (!modal || !container) return;

  const moodHistory = safeGetJSON('tenang_moods', []);
  const streak = getStreak(moodHistory);
  const journalCount = getJournalCountThisMonth();
  const temanSessions = parseInt(localStorage.getItem('tenang_teman_sessions') || '0');
  
  const weekMoods = moodHistory.slice(-7).map(m => m.score !== undefined ? m.score : (m.level || 0)).filter(s => s > 0);
  const floatAvg = weekMoods.length ? (weekMoods.reduce((a, b) => a + b, 0) / weekMoods.length).toFixed(1) : '-';
  const avg = weekMoods.length ? Math.round(weekMoods.reduce((a, b) => a + b, 0) / weekMoods.length) : 0;
  const avgLabels = ['Belum Ada', 'Buruk', 'Kurang', 'Biasa', 'Baik', 'Sangat Baik'];
  const avgLabel = avgLabels[avg] || 'Stabil';

  const avatar = (typeof Storage !== 'undefined' && Storage.getUserAvatar) ? Storage.getUserAvatar() : null;

  if (type === 'streak') {
    const tiers = [
      { days: 3, label: '3d', color: '#F59E0B' },
      { days: 7, label: '7d', color: '#F97316' },
      { days: 14, label: '14d', color: '#EF4444' },
      { days: 30, label: '30d', color: '#EC4899' },
      { days: 100, label: '100d', color: '#8B5CF6' }
    ];
    const tiersHTML = tiers.map((t, index) => {
      const isUnlocked = streak >= t.days;
      const isLast = index === tiers.length - 1;
      return `
        <div style="display:flex; align-items:center; gap:6px;">
          <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
            <div style="width:38px; height:38px; border-radius:50%; background:${isUnlocked ? t.color + '22' : 'var(--card-subtle)'}; border:2px solid ${isUnlocked ? t.color : 'var(--card-border)'}; display:flex; align-items:center; justify-content:center; box-shadow:${isUnlocked ? `0 0 12px ${t.color}60` : 'none'}; transition:all 0.3s ease;">
              <span class="material-symbols-rounded" style="font-size:20px; color:${isUnlocked ? t.color : 'var(--text-muted)'};">local_fire_department</span>
            </div>
            <span style="font-size:0.75rem; font-weight:800; color:${isUnlocked ? 'var(--text-on-white)' : 'var(--text-muted)'};">${t.label}</span>
          </div>
          ${!isLast ? `<div style="width:16px; height:2px; background:${streak >= tiers[index+1].days ? tiers[index+1].color : 'var(--card-border)'}; margin-bottom:18px;"></div>` : ''}
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div style="position:relative; text-align:center; padding: 10px 4px 6px;">
        <button class="modal-close" onclick="closeStatModal()" aria-label="Tutup" style="position:absolute; top:-6px; right:-6px;"><span class="material-symbols-rounded">close</span></button>

        <!-- Top Avatar Header -->
        <div style="position:relative; display:flex; justify-content:center; align-items:center; margin-bottom:16px; margin-top:10px;">
          <!-- Overlapping Avatars -->
          <div style="display:flex; align-items:center; justify-content:center;">
            <div style="width:58px; height:58px; border-radius:50%; background:linear-gradient(135deg, #2563EB, #60A5FA); border:3px solid var(--card-surface); display:flex; align-items:center; justify-content:center; overflow:hidden; z-index:2; box-shadow:0 6px 16px rgba(0,0,0,0.3);">
              <img src="assets/img/maskots/mascot-listening.png" alt="Milo" style="width:100%; height:100%; object-fit:cover;">
            </div>
            <div style="width:58px; height:58px; border-radius:50%; background:linear-gradient(135deg, #F59E0B, #EF4444); border:3px solid var(--card-surface); display:flex; align-items:center; justify-content:center; overflow:hidden; margin-left:-18px; z-index:1; box-shadow:0 6px 16px rgba(0,0,0,0.3);">
              ${avatar ? `<img src="${avatar}" style="width:100%; height:100%; object-fit:cover;">` : `<span class="material-symbols-rounded" style="color:#FFF; font-size:32px;">person</span>`}
            </div>
          </div>
        </div>

        <!-- Title -->
        <h3 style="font-size: clamp(1.2rem, 4vw, 1.45rem); font-weight:850; color:var(--text-on-white); margin-bottom:8px; line-height:1.3;">
          Kamu memiliki Streak selama<br>
          <span style="display:inline-flex; align-items:center; justify-content:center; gap:6px; font-size:1.35em; font-weight:900; color:#EF4444; margin-top:4px;"><span class="material-symbols-rounded" style="font-size:1.15em; color:#EF4444; font-variation-settings: 'FILL' 1;">local_fire_department</span><span>${streak} Hari</span></span>
        </h3>

        <!-- Explanation Bullet Points -->
        <div style="text-align:left; background:var(--card-subtle); border:1px solid var(--card-border); border-radius:18px; padding:14px 16px; margin:18px 0; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; align-items:flex-start; gap:10px; font-size:0.85rem; color:var(--text-on-white); line-height:1.5;">
            <span style="color:#F97316; font-weight:850; font-size:1rem;">•</span>
            <span>Streak terbuka saat kamu mencatat check-in mood secara konsisten setiap hari di <strong>Tenang.in</strong>.</span>
          </div>
          <div style="display:flex; align-items:flex-start; gap:10px; font-size:0.85rem; color:var(--text-on-white); line-height:1.5;">
            <span style="color:#F97316; font-weight:850; font-size:1rem;">•</span>
            <span>Jaga ritme check-in harianmu untuk memperbarui & meningkatkan level badge refleksimu!</span>
          </div>
        </div>

        <!-- Tier Step Milestones -->
        <div style="margin:20px 0 24px;">
          <div style="font-size:0.75rem; font-weight:800; text-transform:uppercase; letter-spacing:0.8px; color:var(--text-secondary); margin-bottom:12px;">Level Pencapaian Streak</div>
          <div style="display:flex; align-items:center; justify-content:center; gap:4px; flex-wrap:nowrap; overflow-x:auto; padding:4px 0;">
            ${tiersHTML}
          </div>
        </div>

        <!-- CTA Button -->
        <button class="btn btn-full" onclick="closeStatModal()" style="background: linear-gradient(135deg, #FF512F, #DD2476); color:#FFFFFF; border:none; font-weight:850; font-size:1rem; padding:14px; border-radius:999px; box-shadow:0 8px 24px rgba(221,36,118,0.4); cursor:pointer; transition:transform 0.2s;">
          Paham!
        </button>
      </div>
    `;
  } else if (type === 'avg-mood') {
    container.innerHTML = `
      <div style="position:relative; text-align:center; padding: 10px 4px 6px;">
        <button class="modal-close" onclick="closeStatModal()" aria-label="Tutup" style="position:absolute; top:-6px; right:-6px;"><span class="material-symbols-rounded">close</span></button>

        <div style="width:72px; height:72px; border-radius:24px; background:rgba(37,99,235,0.15); border:1px solid rgba(37,99,235,0.3); display:flex; align-items:center; justify-content:center; margin:10px auto 14px;">
          <span class="material-symbols-rounded" style="font-size:40px; color:#38BDF8;">analytics</span>
        </div>

        <h3 style="font-size:1.35rem; font-weight:850; color:var(--text-on-white); margin-bottom:6px;">Rata-rata Mood</h3>
        <div style="font-size:2.4rem; font-weight:850; color:#38BDF8; margin-bottom:6px;">${floatAvg} <span style="font-size:0.4em; padding:4px 12px; border-radius:12px; background:rgba(56,189,248,0.15); border:1px solid rgba(56,189,248,0.3); vertical-align:middle;">${avgLabel}</span></div>

        <div style="text-align:left; background:var(--card-subtle); border:1px solid var(--card-border); border-radius:18px; padding:14px 16px; margin:18px 0; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; align-items:flex-start; gap:10px; font-size:0.85rem; color:var(--text-on-white); line-height:1.5;">
            <span style="color:#38BDF8; font-weight:850; font-size:1rem;">•</span>
            <span>Rata-rata dihitung dari 7 hari check-in terakhir yang kamu catat.</span>
          </div>
          <div style="display:flex; align-items:flex-start; gap:10px; font-size:0.85rem; color:var(--text-on-white); line-height:1.5;">
            <span style="color:#38BDF8; font-weight:850; font-size:1rem;">•</span>
            <span>Menunjukkan gambaran tren kestabilan emosi dan kondisi perasaanmu minggu ini.</span>
          </div>
        </div>

        <a href="mood-tracker.html" class="btn btn-primary btn-full" style="display:inline-flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; border-radius:999px; font-weight:800; padding:14px;">
          <span class="material-symbols-rounded">show_chart</span>
          <span>Buka Mood Tracker</span>
        </a>
      </div>
    `;
  } else if (type === 'journal') {
    container.innerHTML = `
      <div style="position:relative; text-align:center; padding: 10px 4px 6px;">
        <button class="modal-close" onclick="closeStatModal()" aria-label="Tutup" style="position:absolute; top:-6px; right:-6px;"><span class="material-symbols-rounded">close</span></button>

        <div style="width:72px; height:72px; border-radius:24px; background:rgba(139,92,246,0.15); border:1px solid rgba(139,92,246,0.3); display:flex; align-items:center; justify-content:center; margin:10px auto 14px;">
          <span class="material-symbols-rounded" style="font-size:40px; color:#A78BFA;">edit_note</span>
        </div>

        <h3 style="font-size:1.35rem; font-weight:850; color:var(--text-on-white); margin-bottom:6px;">Entri Jurnal</h3>
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:12px;">
          <span style="font-size:2.8rem; font-weight:850; color:#A78BFA; line-height:1;">${journalCount}</span>
          <span style="font-size:0.875rem; font-weight:700; color:var(--text-secondary); margin-top:4px;">Catatan Bulan Ini</span>
        </div>

        <div style="text-align:left; background:var(--card-subtle); border:1px solid var(--card-border); border-radius:18px; padding:14px 16px; margin:18px 0; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; align-items:flex-start; gap:10px; font-size:0.85rem; color:var(--text-on-white); line-height:1.5;">
            <span style="color:#A78BFA; font-weight:850; font-size:1rem;">•</span>
            <span>Jurnal adalah ruang privat aman tempatmu mengekspresikan pikiran dan perasaan tanpa batasan.</span>
          </div>
          <div style="display:flex; align-items:flex-start; gap:10px; font-size:0.85rem; color:var(--text-on-white); line-height:1.5;">
            <span style="color:#A78BFA; font-weight:850; font-size:1rem;">•</span>
            <span>Menulis jurnal secara teratur membantu meredakan stres dan melatih kepekaan diri.</span>
          </div>
        </div>

        <a href="jurnal.html" class="btn btn-full" style="background:linear-gradient(135deg, #8B5CF6, #6366F1); color:#FFFFFF; display:inline-flex; align-items:center; justify-content:center; gap:8px; text-decoration:none; border-radius:999px; font-weight:800; padding:14px; border:none; box-shadow:0 8px 24px rgba(139,92,246,0.35);">
          <span class="material-symbols-rounded">edit_note</span>
          <span>Tulis Jurnal Sekarang</span>
        </a>
      </div>
    `;
  } else if (type === 'teman') {
    container.innerHTML = `
      <div style="position:relative; text-align:center; padding: 10px 4px 6px;">
        <button class="modal-close" onclick="closeStatModal()" aria-label="Tutup" style="position:absolute; top:-6px; right:-6px;"><span class="material-symbols-rounded">close</span></button>

        <div style="width:72px; height:72px; border-radius:24px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); display:flex; align-items:center; justify-content:center; margin:10px auto 14px;">
          <span class="material-symbols-rounded" style="font-size:40px; color:#34D399;">smart_toy</span>
        </div>

        <h3 style="font-size:1.35rem; font-weight:850; color:var(--text-on-white); margin-bottom:6px;">Sesi Teman AI</h3>
        <div style="display:flex; flex-direction:column; align-items:center; margin-bottom:12px;">
          <span style="font-size:2.8rem; font-weight:850; color:#34D399; line-height:1;">${temanSessions}</span>
          <span style="font-size:0.875rem; font-weight:700; color:var(--text-secondary); margin-top:4px;">Sesi Refleksi</span>
        </div>

        <div style="text-align:left; background:var(--card-subtle); border:1px solid var(--card-border); border-radius:18px; padding:14px 16px; margin:18px 0; display:flex; flex-direction:column; gap:10px;">
          <div style="display:flex; align-items:flex-start; gap:10px; font-size:0.85rem; color:var(--text-on-white); line-height:1.5;">
            <span style="color:#34D399; font-weight:850; font-size:1rem;">•</span>
            <span>Teman AI selalu hadir 24/7 untuk mendengarkan curhatmu kapan saja tanpa pernah menghakimi.</span>
          </div>
          <div style="display:flex; align-items:flex-start; gap:10px; font-size:0.85rem; color:var(--text-on-white); line-height:1.5;">
            <span style="color:#34D399; font-weight:850; font-size:1rem;">•</span>
            <span>Setiap sesi membantumu meresapi perasaan dengan perspektif baru yang lebih damai.</span>
          </div>
        </div>

        <button class="btn btn-full" onclick="closeStatModal(); if(typeof window.openTemanChat === 'function') window.openTemanChat();" style="background:linear-gradient(135deg, #10B981, #059669); color:#FFFFFF; display:inline-flex; align-items:center; justify-content:center; gap:8px; border-radius:999px; font-weight:800; padding:14px; border:none; box-shadow:0 8px 24px rgba(16,185,129,0.35); cursor:pointer;">
          <span class="material-symbols-rounded">chat</span>
          <span>Mulai Chat Teman AI</span>
        </button>
      </div>
    `;
  }

  modal.classList.add('active');
}

function closeStatModal() {
  const modal = document.getElementById('stat-detail-modal');
  if (modal) modal.classList.remove('active');
}

// Close on overlay click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('stat-detail-modal');
  if (modal && modal.classList.contains('active') && e.target === modal) {
    closeStatModal();
  }
});

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
