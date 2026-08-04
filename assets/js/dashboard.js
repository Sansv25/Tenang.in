/* =============================================
   Tenang.in — Dashboard Script
   ============================================= */

document.addEventListener('DOMContentLoaded', async () => {
  await Main.initPage('dashboard');
  renderQuote();
  renderMiniChart();
  renderStats();
  renderBadges();
  renderMiniGrid();
});

// ---- Daily Quote ----
async function renderQuote() {
  const quoteEl = document.getElementById('dashboard-quote');
  if (!quoteEl) return;

  try {
    const res = await fetch('assets/data/tips.json');
    const tips = await res.json();

    const kenaliType = Storage.getKenaliType();
    const streak = Storage.getStreak();
    const mood = Storage.getMoodToday();

    let tipSet = kenaliType && tips[kenaliType] ? tips[kenaliType] : tips.default;
    const dayIndex = new Date().getDate() % tipSet.daily.length;
    const tip = tipSet.daily[dayIndex];

    let prefix = '';
    if (mood) {
      if (mood.level >= 4) prefix = 'Mood-mu hari ini bagus! ';
      else if (mood.level <= 2) prefix = 'Hari ini mungkin berat, tapi ingat: ';
    }
    if (streak >= 7) prefix = '7 hari konsisten! ';
    else if (streak >= 3) prefix = 'Streak ' + streak + ' hari! ';

    const iconName = tipSet.emoji || 'format_quote';

    quoteEl.innerHTML = `
      <div class="card" style="padding:var(--space-xl); text-align:center; border-left:4px solid var(--primary-accent);">
        <div style="font-size:0.8125rem; font-weight:600; color:var(--primary-accent); margin-bottom:var(--space-sm); display:flex; align-items:center; justify-content:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:20px;">${iconName}</span>
          <span>Quote Harian — ${tipSet.name}</span>
        </div>
        <p style="font-size:1.125rem; font-weight:500; line-height:1.7; color:var(--text-on-white);">${prefix}${tip}</p>
      </div>
    `;
  } catch(e) {
    quoteEl.innerHTML = `
      <div class="card" style="padding:var(--space-xl); text-align:center; border-left:4px solid var(--primary-accent);">
        <p style="font-size:1.125rem; color:var(--text-on-white);">Kamu lebih kuat dari yang kamu kira.</p>
      </div>
    `;
  }
}

// ---- Mini Chart ----
function renderMiniChart() {
  const chartEl = document.getElementById('dashboard-chart');
  if (!chartEl) return;
  const history = Storage.getMoodHistory(7);
  Charts.createMiniChart(chartEl, history);
}

// ---- Stats ----
function renderStats() {
  const statsEl = document.getElementById('dashboard-stats');
  if (!statsEl) return;

  const streak = Storage.getStreak();
  const journalCount = Storage.getJournalCount();
  const temanSessions = Storage.getTemanSessions();
  const moodAvg = Storage.getMoodAverage(7);
  const moodCount = Storage.getMoods().length;

  const moodIcons = {
    1: 'sentiment_very_dissatisfied',
    2: 'sentiment_dissatisfied',
    3: 'sentiment_neutral',
    4: 'sentiment_satisfied',
    5: 'sentiment_very_satisfied'
  };
  const avgIcon = moodAvg > 0 ? moodIcons[Math.round(moodAvg)] || 'sentiment_neutral' : 'sentiment_neutral';

  let emptyBannerHTML = '';
  if (moodCount === 0 && journalCount === 0) {
    emptyBannerHTML = `
      <div class="card p-6 md:p-8 mb-6 rounded-2xl border border-solid shadow-md" style="border-color:#7EC8E3; background:linear-gradient(135deg, #FFFFFF 0%, #F0F5FF 100%);">
        <div class="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
          <div class="w-14 h-14 rounded-full flex items-center justify-center shrink-0 shadow" style="background:#5B8FD4;">
            <span class="material-symbols-rounded" style="font-size:32px; color:#FFFFFF;">rocket_launch</span>
          </div>
          <div class="flex-1">
            <h3 class="font-bold text-lg mb-1" style="color:#1A2F4E;">Dashboard Analisamu Masih Kosong</h3>
            <p class="text-sm leading-relaxed" style="color:#6B8DB5;">
              Mulai catat check-in mood pertamamu hari ini atau tuangkan cerita di Jurnal agar grafik dan statistik pribadimu aktif di sini!
            </p>
          </div>
          <a href="beranda.html" class="btn btn-primary inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-bold shadow hover:opacity-95 transition whitespace-nowrap" style="background:#2D5BA8; color:#FFFFFF; text-decoration:none;">
            <span class="material-symbols-rounded" style="font-size:18px;">add_circle</span>
            <span>Mulai Check-In</span>
          </a>
        </div>
      </div>
    `;
  }

  statsEl.innerHTML = emptyBannerHTML + `
    <div class="grid md\\:grid-2" style="grid-template-columns: repeat(2, 1fr); gap:var(--space-md);">
      <div class="card stat-card">
        <div style="display:flex; justify-content:center; align-items:center; gap:6px; margin-bottom:4px;">
          <span class="material-symbols-rounded text-warning" style="font-size:28px;">local_fire_department</span>
          <span class="stat-number" style="color:var(--warning); margin:0;">${streak}</span>
        </div>
        <div class="stat-label">Hari Streak</div>
      </div>
      <div class="card stat-card">
        <div style="display:flex; justify-content:center; align-items:center; gap:6px; margin-bottom:4px;">
          <span class="material-symbols-rounded text-primary" style="font-size:28px;">edit_note</span>
          <span class="stat-number" style="margin:0;">${journalCount}</span>
        </div>
        <div class="stat-label">Total Jurnal</div>
      </div>
      <div class="card stat-card">
        <div style="display:flex; justify-content:center; align-items:center; gap:6px; margin-bottom:4px;">
          <span class="material-symbols-rounded text-primary" style="font-size:28px;">smart_toy</span>
          <span class="stat-number" style="margin:0;">${temanSessions}</span>
        </div>
        <div class="stat-label">Sesi Teman</div>
      </div>
      <div class="card stat-card">
        <div style="display:flex; justify-content:center; align-items:center; gap:6px; margin-bottom:4px;">
          <span class="material-symbols-rounded text-primary" style="font-size:28px;">${avgIcon}</span>
          <span class="stat-number" style="margin:0;">${moodAvg || '—'}</span>
        </div>
        <div class="stat-label">Rata-rata Mood (7 hari)</div>
      </div>
    </div>
  `;
}

// ---- Badges ----
function renderBadges() {
  const badgeEl = document.getElementById('dashboard-badges');
  if (!badgeEl) return;

  const badges = Storage.getBadges();
  const earned = badges.filter(b => b.earned).length;

  badgeEl.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-md);">
      <h2 style="font-size:var(--h3-size); font-weight:600; color:var(--text-on-blue); display:flex; align-items:center; gap:8px;">
        <span class="material-symbols-rounded" style="font-size:22px;">military_tech</span>
        <span>Pencapaian Badge</span>
      </h2>
      <span style="font-size:var(--caption-size); color:rgba(255,255,255,0.7);">${earned}/${badges.length} terbuka</span>
    </div>
    <div class="card" style="padding:var(--space-xl);">
      <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(90px, 1fr)); gap:var(--space-lg); justify-items:center;">
        ${badges.map(b => `
          <div style="text-align:center; cursor:pointer; transition:transform 0.2s;" onclick="openBadgeDetail('${b.id}')" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
            <div class="badge ${b.earned ? 'badge-earned' : 'badge-locked'}" title="${b.description}">
              <span class="material-symbols-rounded" style="font-size:28px; color:${b.earned ? 'var(--primary-accent)' : 'var(--text-muted)'};">${b.icon || b.emoji || 'star'}</span>
            </div>
            <div class="badge-name" style="color:var(--text-on-white); font-weight:500; ${b.earned ? '' : 'opacity:0.5;'}">${b.name}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// ---- Badge Detail Modal ----
function openBadgeDetail(id) {
  const badges = Storage.getBadges();
  const badge = badges.find(b => b.id === id);
  if (!badge) return;

  const modal = document.getElementById('badge-detail-modal');
  document.getElementById('badge-detail-symbol').textContent = badge.icon || badge.emoji || 'star';
  document.getElementById('badge-detail-icon').style.color = badge.earned ? 'var(--primary-accent)' : 'var(--text-muted)';
  document.getElementById('badge-detail-title').textContent = badge.name;
  
  const statusEl = document.getElementById('badge-detail-status');
  if (badge.earned) {
    statusEl.textContent = '✨ Badge Terbuka';
    statusEl.style.color = 'var(--success)';
  } else {
    statusEl.textContent = '🔒 Badge Terkunci';
    statusEl.style.color = 'var(--text-secondary)';
  }
  
  document.getElementById('badge-detail-desc').textContent = badge.description;
  
  modal.classList.add('active');
}

// ---- Mini Contribution Grid ----
let gridMonthOffset = 0;

function renderMiniGrid() {
  const gridEl = document.getElementById('dashboard-grid');
  if (!gridEl) return;
  const moods = Storage.getMoods();
  Charts.createContributionGrid(gridEl, moods, 35, gridMonthOffset);
}

function navigateGridMonth(direction) {
  gridMonthOffset += direction;
  // Don't allow going past current month
  if (gridMonthOffset > 0) gridMonthOffset = 0;
  renderMiniGrid();
}
