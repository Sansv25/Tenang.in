/* =============================================
   Tenang.in — Mood Tracker Script
   ============================================= */

// ---- Global functions for Modals ----
window.showShareChartModal = function() {
  const modal = document.getElementById('share-chart-modal');
  if (modal) modal.classList.add('active');
};

window.simulateShare = function() {
  Animations.showToast('Memproses gambar...', 'info');
  setTimeout(() => {
    document.getElementById('share-chart-modal').classList.remove('active');
    Animations.showToast('Grafik berhasil dibagikan!', 'success');
  }, 1500);
};

window.changeShareTheme = function(theme) {
  const gradients = {
    blue: 'linear-gradient(135deg, #2D5BA8, #7EC8E3)',
    sunset: 'linear-gradient(135deg, #FF512F, #DD2476)',
    midnight: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    forest: 'linear-gradient(135deg, #11998e, #38ef7d)',
    purple: 'linear-gradient(135deg, #8E2DE2, #4A00E0)'
  };
  
  const previewCard = document.getElementById('share-card-preview');
  if (previewCard && gradients[theme]) {
    previewCard.style.background = gradients[theme];
  }
  
  // Highlight active button
  const buttons = document.querySelectorAll('#share-theme-selector button');
  buttons.forEach(btn => {
    btn.style.transform = 'scale(1)';
    btn.style.border = '2px solid transparent';
  });
  const activeBtn = event.currentTarget;
  activeBtn.style.transform = 'scale(1.1)';
  activeBtn.style.border = '2px solid #fff';
};

document.addEventListener('DOMContentLoaded', async () => {
  await Main.initPage('mood');
  renderMoodForm();
  renderChart();
  renderContributionGrid();
  renderInsights();
});

// ---- State ----
let moodLevel = null;
let moodTags = [];

// ---- Render Mood Form ----
function renderMoodForm() {
  const today = Storage.getMoodToday();
  const formEl = document.getElementById('mood-form-section');
  if (!formEl) return;

  if (today) {
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
    const labels = { 1: 'Buruk', 2: 'Kurang Baik', 3: 'Biasa', 4: 'Baik', 5: 'Luar Biasa' };
    formEl.innerHTML = `
      <div class="card text-center" style="padding:var(--space-2xl);">
        <div style="margin-bottom:var(--space-sm);">
          <span class="material-symbols-rounded" style="font-size:48px; color:${colors[today.level]};">${icons[today.level]}</span>
        </div>
        <h3 style="font-weight:700; margin-bottom:var(--space-xs); color:var(--text-on-white);">${labels[today.level]}</h3>
        <p style="font-size:var(--caption-size); color:var(--text-secondary);">Mood hari ini sudah tercatat</p>
        ${today.tags.length ? `<div class="journal-tags" style="justify-content:center; margin-top:var(--space-md);">${today.tags.map(t => `<span class="journal-tag">${t}</span>`).join('')}</div>` : ''}
        ${today.note ? `<p style="font-size:0.875rem; color:var(--text-secondary); margin-top:var(--space-sm); font-style:italic;">"${today.note}"</p>` : ''}
        <button class="btn btn-sm btn-ghost" style="margin-top:var(--space-lg); color:var(--primary-accent);" onclick="resetTodayMood()">Ubah Mood Hari Ini</button>
      </div>
    `;
  }
}

function selectMoodTracker(level) {
  moodLevel = level;
  document.querySelectorAll('#mood-emojis .emoji-btn').forEach((btn, i) => {
    btn.classList.toggle('selected', (i + 1) === level);
  });
  document.getElementById('mood-tags-area').style.display = 'block';
}

function toggleMoodTag(tag, btn) {
  const idx = moodTags.indexOf(tag);
  if (idx >= 0) {
    moodTags.splice(idx, 1);
    btn.classList.remove('selected');
  } else {
    moodTags.push(tag);
    btn.classList.add('selected');
  }
}

function submitMoodTracker() {
  if (!moodLevel) {
    Animations.showToast('Pilih mood kamu dulu ya!', 'warning');
    return;
  }

  const note = document.getElementById('mood-note')?.value || '';

  Storage.saveMood({
    level: moodLevel,
    tags: moodTags,
    note: note
  });

  Animations.showToast('Mood tersimpan!', 'success');
  Animations.checkAchievements();

  // Check low mood or time capsule interventions
  if (typeof window.checkTimeCapsuleIntervention === 'function') {
    window.checkTimeCapsuleIntervention(moodLevel);
  } else if (moodLevel <= 2) {
    showLowMoodPopup();
  }

  // Re-render
  renderMoodForm();
  renderChart();
  renderContributionGrid();
  renderInsights();

  // Reset
  moodLevel = null;
  moodTags = [];
}

function resetTodayMood() {
  const formEl = document.getElementById('mood-form-section');
  if (!formEl) return;

  formEl.innerHTML = getMoodFormHTML();
}

function getMoodFormHTML() {
  return `
    <div class="card" style="padding:var(--space-2xl);">
      <h3 style="font-weight:700; margin-bottom:var(--space-lg); text-align:center; color:var(--text-on-white);">Bagaimana perasaanmu hari ini?</h3>
      <div class="emoji-selector" id="mood-emojis">
        <button class="emoji-btn" onclick="selectMoodTracker(1)">
          <span class="material-symbols-rounded" style="font-size:32px; color:var(--mood-1);">sentiment_very_dissatisfied</span>
          <span class="emoji-label">Buruk</span>
        </button>
        <button class="emoji-btn" onclick="selectMoodTracker(2)">
          <span class="material-symbols-rounded" style="font-size:32px; color:var(--mood-2);">sentiment_dissatisfied</span>
          <span class="emoji-label">Kurang</span>
        </button>
        <button class="emoji-btn" onclick="selectMoodTracker(3)">
          <span class="material-symbols-rounded" style="font-size:32px; color:var(--mood-3);">sentiment_neutral</span>
          <span class="emoji-label">Biasa</span>
        </button>
        <button class="emoji-btn" onclick="selectMoodTracker(4)">
          <span class="material-symbols-rounded" style="font-size:32px; color:var(--mood-4);">sentiment_satisfied</span>
          <span class="emoji-label">Baik</span>
        </button>
        <button class="emoji-btn" onclick="selectMoodTracker(5)">
          <span class="material-symbols-rounded" style="font-size:32px; color:var(--mood-5);">sentiment_very_satisfied</span>
          <span class="emoji-label">Luar Biasa</span>
        </button>
      </div>
      <div id="mood-tags-area" style="display:none; margin-top:var(--space-lg);">
        <p style="font-size:0.875rem; font-weight:600; color:var(--text-secondary); margin-bottom:var(--space-sm);">Tag (opsional)</p>
        <div class="tag-container">
          <button class="tag-chip" onclick="toggleMoodTag('cemas', this)">Cemas</button>
          <button class="tag-chip" onclick="toggleMoodTag('stres', this)">Stres</button>
          <button class="tag-chip" onclick="toggleMoodTag('kesepian', this)">Kesepian</button>
          <button class="tag-chip" onclick="toggleMoodTag('lelah', this)">Lelah</button>
          <button class="tag-chip" onclick="toggleMoodTag('bersyukur', this)">Bersyukur</button>
          <button class="tag-chip" onclick="toggleMoodTag('semangat', this)">Semangat</button>
          <button class="tag-chip" onclick="toggleMoodTag('tenang', this)">Tenang</button>
          <button class="tag-chip" onclick="toggleMoodTag('bingung', this)">Bingung</button>
        </div>
        <textarea id="mood-note" class="input textarea" placeholder="Catatan (opsional)..." style="margin-top:var(--space-md); min-height:80px;"></textarea>
        <button class="btn btn-primary btn-full" style="margin-top:var(--space-md);" onclick="submitMoodTracker()">Simpan Mood</button>
      </div>
    </div>
  `;
}

// ---- Render Chart ----
function renderChart() {
  const chartEl = document.getElementById('mood-chart');
  if (!chartEl) return;
  const history = Storage.getMoodHistory(7);
  Charts.createLineChart(chartEl, history);
}

// ---- Render Contribution Grid ----
let gridMonthOffset = 0;

function renderContributionGrid() {
  const gridEl = document.getElementById('mood-grid');
  if (!gridEl) return;
  const moods = Storage.getMoods();
  Charts.createContributionGrid(gridEl, moods, 35, gridMonthOffset);
}

function navigateGridMonth(direction) {
  gridMonthOffset += direction;
  // Don't allow going past current month
  if (gridMonthOffset > 0) gridMonthOffset = 0;
  renderContributionGrid();
}

// ---- Render Insights ----
function renderInsights() {
  const insightEl = document.getElementById('mood-insights');
  if (!insightEl) return;

  const moods = Storage.getMoods();
  if (moods.length < 3) {
    const needed = 3 - moods.length;
    const progress = Math.round((moods.length / 3) * 100);
    insightEl.innerHTML = `
      <div class="insight-card" style="border-left:4px solid var(--secondary-accent);">
        <div class="flex items-center justify-between" style="margin-bottom:var(--space-md);">
          <div class="insight-card-header" style="margin:0;">
            <span class="material-symbols-rounded text-primary" style="font-size:24px;">psychology</span>
            <span>Kemajuan Insight AI</span>
          </div>
          <span class="tag-chip selected" style="font-size:0.75rem;">${moods.length}/3 Check-in</span>
        </div>
        <p style="font-size:0.9375rem; color:var(--text-on-white); line-height:1.6; margin-bottom:var(--space-md);">
          Lakukan ${needed} check-in lagi untuk membuka analisa kecenderungan emosi dan saran personal dari Teman AI.
        </p>
        <div class="progress-bar-container" style="height:10px; margin-bottom:var(--space-sm);">
          <div class="progress-bar" style="width:${progress}%; background: linear-gradient(90deg, #2563EB, #38BDF8);"></div>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary);">
          <span>Kemajuan: ${progress}%</span>
          <span>Target: 3 Hari</span>
        </div>
      </div>
    `;
    return;
  }

  const avg = Storage.getMoodAverage(7);
  const dominantTag = Storage.getDominantTag();
  const streak = Storage.getStreak();

  let insightText = '';
  if (avg >= 4) {
    insightText = 'Mood-mu secara keseluruhan cukup baik minggu ini! Terus jaga kebiasaan positifmu.';
  } else if (avg >= 3) {
    insightText = 'Mood-mu cenderung biasa akhir-akhir ini. Coba luangkan waktu untuk hal yang membuatmu tenang.';
  } else {
    insightText = 'Sepertinya belakangan ini cukup berat untukmu. Ingat, tidak apa-apa untuk beristirahat dan minta bantuan.';
  }

  if (dominantTag) {
    insightText += ` Tag yang sering muncul saat mood rendah: "${dominantTag}".`;
  }

  insightEl.innerHTML = `
    <div class="insight-card">
      <div class="insight-card-header">
        <span class="material-symbols-rounded" style="color:var(--primary-accent); font-size:22px;">insights</span>
        <span>Insight Mingguan</span>
      </div>
      <p style="font-size:0.9375rem; line-height:1.65; color:var(--text-on-white);">${insightText}</p>
      <div style="display:flex; gap:var(--space-lg); margin-top:var(--space-lg);">
        <div>
          <div style="font-size:1.5rem; font-weight:700; color:var(--primary-accent);">${avg}</div>
          <div style="font-size:var(--caption-size); color:var(--text-secondary);">Rata-rata</div>
        </div>
        <div>
          <div style="font-size:1.5rem; font-weight:700; color:var(--warning);">${streak} Hari</div>
          <div style="font-size:var(--caption-size); color:var(--text-secondary);">Streak</div>
        </div>
        <div>
          <div style="font-size:1.5rem; font-weight:700; color:var(--success);">${moods.length}</div>
          <div style="font-size:var(--caption-size); color:var(--text-secondary);">Total check-in</div>
        </div>
      </div>
    </div>
  `;
}

// ---- Low Mood Popup ----
function showLowMoodPopup() {
  const overlay = document.getElementById('low-mood-modal');
  if (overlay) overlay.classList.add('active');
}

function closeLowMoodModal() {
  const overlay = document.getElementById('low-mood-modal');
  if (overlay) overlay.classList.remove('active');
}
