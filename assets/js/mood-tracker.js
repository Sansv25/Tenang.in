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
      <div class="card text-center" style="padding: 1.5rem 1.75rem;">
        <div style="margin-bottom:var(--space-sm); display:flex; justify-content:center;">
          <img src="assets/img/maskots/mascot-mood-${today.level}.png" alt="${labels[today.level]}" style="width:200px; height:200px; object-fit:contain; transform:scale(1.4); filter:drop-shadow(0 12px 30px rgba(0,0,0,0.18)); margin:-20px auto -10px;">
        </div>
        <h3 style="font-weight:700; margin-bottom:var(--space-xs); color:var(--text-on-white);">${labels[today.level]}</h3>
        <p style="font-size:var(--caption-size); color:var(--text-secondary);">Mood hari ini sudah tercatat</p>
        ${today.tags.length ? `<div class="journal-tags" style="justify-content:center; margin-top:var(--space-md);">${today.tags.map(t => `<span class="journal-tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
        ${today.note ? `<p style="font-size:0.875rem; color:var(--text-secondary); margin-top:var(--space-sm); font-style:italic;">"${escapeHTML(today.note)}"</p>` : ''}
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
    <div class="card" style="padding: 1.5rem 1.75rem;">
      <h3 style="font-weight:700; margin-bottom:var(--space-lg); text-align:center; color:var(--text-on-white);">Bagaimana perasaanmu hari ini?</h3>
      <div class="emoji-selector" id="mood-emojis">
        <button class="emoji-btn" onclick="selectMoodTracker(1)">
          <img src="assets/img/maskots/mascot-mood-1.png" alt="Buruk" class="emoji-mascot-img">
          <span class="emoji-label">Buruk</span>
        </button>
        <button class="emoji-btn" onclick="selectMoodTracker(2)">
          <img src="assets/img/maskots/mascot-mood-2.png" alt="Kurang" class="emoji-mascot-img">
          <span class="emoji-label">Kurang</span>
        </button>
        <button class="emoji-btn" onclick="selectMoodTracker(3)">
          <img src="assets/img/maskots/mascot-mood-3.png" alt="Biasa" class="emoji-mascot-img">
          <span class="emoji-label">Biasa</span>
        </button>
        <button class="emoji-btn" onclick="selectMoodTracker(4)">
          <img src="assets/img/maskots/mascot-mood-4.png" alt="Baik" class="emoji-mascot-img">
          <span class="emoji-label">Baik</span>
        </button>
        <button class="emoji-btn" onclick="selectMoodTracker(5)">
          <img src="assets/img/maskots/mascot-mood-5.png" alt="Luar Biasa" class="emoji-mascot-img">
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

// ---- Demo: Simulate check-in for progress ----
function demoAddCheckin() {
  const moods = Storage.getMoods();
  if (moods.length >= 3) return;

  // Create a mood entry with a past date so it doesn't overwrite today's entry
  const daysBack = moods.length + 1;
  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - daysBack);
  const dateKey = `${pastDate.getFullYear()}-${String(pastDate.getMonth() + 1).padStart(2, '0')}-${String(pastDate.getDate()).padStart(2, '0')}`;

  // Only add if this date doesn't already exist
  if (!moods.find(m => m.date === dateKey)) {
    const randomLevel = Math.floor(Math.random() * 3) + 3; // level 3-5
    const tagOptions = ['tenang', 'bersyukur', 'semangat', 'lelah', 'cemas'];
    const randomTags = [tagOptions[Math.floor(Math.random() * tagOptions.length)]];

    moods.push({
      date: dateKey,
      timestamp: pastDate.getTime(),
      level: randomLevel,
      tags: randomTags,
      note: ''
    });
    localStorage.setItem('tenang_moods', JSON.stringify(moods));
  }

  // Re-render everything
  renderInsights();
  renderChart();
  renderContributionGrid();
  Animations.showToast(`Progress: ${Math.min(moods.length, 3)}/3 Check-in!`, 'success');
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
          <span class="tag-chip selected" style="font-size:0.75rem; cursor:pointer; transition:transform 0.15s, box-shadow 0.15s;" onclick="demoAddCheckin()" onmouseenter="this.style.transform='scale(1.08)';this.style.boxShadow='0 2px 12px rgba(37,99,235,0.25)'" onmouseleave="this.style.transform='scale(1)';this.style.boxShadow='none'" title="Klik untuk menambah progress demo">${moods.length}/3 Check-in</span>
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
  const history = Storage.getMoodHistory(7);

  // Determine mood trend (improving / declining / stable)
  let trendIcon = 'trending_flat';
  let trendLabel = 'Stabil';
  let trendColor = '#3B82F6';
  if (history.length >= 2) {
    const recentHalf = history.slice(Math.floor(history.length / 2));
    const olderHalf = history.slice(0, Math.floor(history.length / 2));
    const recentAvg = recentHalf.reduce((a, m) => a + m.level, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((a, m) => a + m.level, 0) / olderHalf.length;
    if (recentAvg > olderAvg + 0.3) {
      trendIcon = 'trending_up'; trendLabel = 'Meningkat'; trendColor = '#10B981';
    } else if (recentAvg < olderAvg - 0.3) {
      trendIcon = 'trending_down'; trendLabel = 'Menurun'; trendColor = '#EF4444';
    }
  }

  // AI Analysis text based on avg
  let aiAnalysis = '';
  let aiAdvice = [];
  let moodEmoji = '';
  let moodStatus = '';
  let statusColor = '';

  if (avg >= 4) {
    moodEmoji = 'sentiment_very_satisfied';
    moodStatus = 'Sangat Baik';
    statusColor = '#10B981';
    aiAnalysis = 'Berdasarkan data check-in kamu, kondisi emosionalmu secara keseluruhan sangat positif. Kamu menunjukkan pola mood yang sehat dan stabil. Ini menandakan kamu memiliki mekanisme coping yang baik.';
    aiAdvice = [
      { icon: 'self_improvement', text: 'Pertahankan rutinitas positifmu saat ini — konsistensi adalah kunci kesehatan mental jangka panjang.' },
      { icon: 'group', text: 'Bagikan energi positifmu kepada orang di sekitarmu. Kebaikan kecil bisa berdampak besar.' },
      { icon: 'edit_note', text: 'Coba tuliskan 3 hal yang kamu syukuri hari ini di jurnal untuk memperkuat pola pikir positif.' }
    ];
  } else if (avg >= 3) {
    moodEmoji = 'sentiment_neutral';
    moodStatus = 'Cukup Stabil';
    statusColor = '#F59E0B';
    aiAnalysis = 'Mood-mu cenderung netral dan stabil minggu ini. Ini bukan hal buruk, tapi ada ruang untuk meningkatkan kualitas emosimu. Perhatikan pola aktivitas yang mempengaruhi perasaanmu.';
    aiAdvice = [
      { icon: 'directions_walk', text: 'Kurangi waktu di depan layar dan tambahkan 15 menit jalan kaki di luar rumah setiap hari.' },
      { icon: 'bedtime', text: 'Pastikan tidur cukup 7-8 jam. Kurang tidur sering menjadi penyebab mood yang datar.' },
      { icon: 'music_note', text: 'Coba dengarkan musik yang kamu sukai atau lakukan hobi yang sudah lama tidak kamu sentuh.' }
    ];
  } else {
    moodEmoji = 'sentiment_dissatisfied';
    moodStatus = 'Perlu Perhatian';
    statusColor = '#EF4444';
    aiAnalysis = 'Data menunjukkan mood-mu sedang dalam fase rendah. Ini wajar dan bukan tanda kelemahan. Yang penting adalah kamu tetap hadir dan mencatat perasaanmu — itu sudah langkah yang sangat berani.';
    aiAdvice = [
      { icon: 'spa', text: 'Kurangi tekanan pada dirimu sendiri. Istirahat bukan berarti menyerah, tapi mengisi ulang energi.' },
      { icon: 'chat_bubble', text: 'Ceritakan perasaanmu kepada seseorang yang kamu percaya, atau gunakan fitur Teman AI di Tenang.in.' },
      { icon: 'local_florist', text: 'Lakukan satu hal kecil yang membuatmu senang hari ini — minum teh hangat, dengarkan lagu favorit, atau jalan-jalan sebentar.' }
    ];
  }

  // Tag-specific insight
  let tagInsight = '';
  if (dominantTag) {
    const tagAdvice = {
      'cemas': 'Rasa cemas sering muncul dalam datamu. Coba teknik pernapasan 4-7-8: tarik napas 4 detik, tahan 7 detik, buang 8 detik.',
      'stres': 'Stres mendominasi emosimu akhir-akhir ini. Prioritaskan tugas-tugasmu dan jangan ragu untuk bilang "tidak" pada hal yang berlebihan.',
      'kesepian': 'Kamu sering merasa kesepian. Coba hubungi satu teman lama hari ini — koneksi kecil bisa membuat perbedaan besar.',
      'lelah': 'Kelelahan terdeteksi sebagai pola berulang. Evaluasi beban kerjamu dan pastikan ada waktu istirahat yang cukup.',
      'bersyukur': 'Rasa syukur sering muncul — ini tanda positif! Terus latih gratitude journaling untuk memperkuat mindset ini.',
      'semangat': 'Semangatmu terlihat dari data! Channel energi ini untuk membangun kebiasaan baru yang positif.',
      'tenang': 'Ketenangan menjadi emosi dominanmu. Ini fondasi yang bagus untuk kesehatan mental jangka panjang.',
      'bingung': 'Perasaan bingung sering muncul. Coba luangkan waktu 10 menit untuk journaling — menulis bisa membantu menjernihkan pikiran.'
    };
    tagInsight = tagAdvice[dominantTag] || `Tag "${dominantTag}" sering muncul dalam catatan emosimu.`;
  }

  // Mood level distribution
  const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  moods.forEach(m => { moodCounts[m.level] = (moodCounts[m.level] || 0) + 1; });
  const maxCount = Math.max(...Object.values(moodCounts), 1);

  insightEl.innerHTML = `
    <div class="insight-card" style="border:none; padding:0; overflow:hidden; border-radius:16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #1E3A5F, #2563EB); padding:20px 24px; display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="assets/img/maskots/mascot-listening.png" alt="Teman AI" style="width:34px; height:34px; object-fit:contain; filter:drop-shadow(0 2px 4px rgba(0,0,0,0.15));">
          <span style="color:#fff; font-weight:700; font-size:1rem;">Analisa Teman AI</span>
        </div>
        <span style="background:rgba(255,255,255,0.2); backdrop-filter:blur(8px); color:#fff; font-size:0.7rem; font-weight:600; padding:4px 12px; border-radius:20px;">
          <span class="material-symbols-rounded" style="font-size:14px; vertical-align:middle;">auto_awesome</span>
          Diperbarui Hari Ini
        </span>
      </div>

      <div style="padding:20px 24px;">

        <!-- Status & Trend Row -->
        <div style="display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap;">
          <div style="flex:1; min-width:140px; background:${statusColor}12; border:1px solid ${statusColor}30; border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px;">
            <span class="material-symbols-rounded" style="font-size:32px; color:${statusColor};">${moodEmoji}</span>
            <div>
              <div style="font-size:0.7rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">Status Emosi</div>
              <div style="font-size:1rem; font-weight:700; color:${statusColor};">${moodStatus}</div>
            </div>
          </div>
          <div style="flex:1; min-width:140px; background:${trendColor}12; border:1px solid ${trendColor}30; border-radius:12px; padding:14px 16px; display:flex; align-items:center; gap:12px;">
            <span class="material-symbols-rounded" style="font-size:32px; color:${trendColor};">${trendIcon}</span>
            <div>
              <div style="font-size:0.7rem; color:var(--text-secondary); text-transform:uppercase; letter-spacing:0.5px;">Tren Mood</div>
              <div style="font-size:1rem; font-weight:700; color:${trendColor};">${trendLabel}</div>
            </div>
          </div>
        </div>

        <!-- AI Analysis -->
        <div style="background:linear-gradient(135deg, #EEF2FF, #F0F9FF); border-radius:12px; padding:16px; margin-bottom:20px; border-left:4px solid #2563EB;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
            <span class="material-symbols-rounded" style="font-size:18px; color:#2563EB;">psychology</span>
            <span style="font-size:0.8rem; font-weight:700; color:#2563EB; text-transform:uppercase; letter-spacing:0.5px;">Analisa AI</span>
          </div>
          <p style="font-size:0.9rem; line-height:1.7; color:#334155; margin:0;">${aiAnalysis}</p>
        </div>

        ${tagInsight ? `
        <!-- Tag Insight -->
        <div style="background:#FFF7ED; border-radius:12px; padding:14px 16px; margin-bottom:20px; border-left:4px solid #F59E0B;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
            <span class="material-symbols-rounded" style="font-size:18px; color:#F59E0B;">label</span>
            <span style="font-size:0.8rem; font-weight:700; color:#B45309;">Pola Emosi Terdeteksi: "${dominantTag}"</span>
          </div>
          <p style="font-size:0.875rem; line-height:1.6; color:#78350F; margin:0;">${tagInsight}</p>
        </div>
        ` : ''}

        <!-- AI Recommendations -->
        <div style="margin-bottom:20px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:12px;">
            <span class="material-symbols-rounded" style="font-size:20px; color:#10B981;">tips_and_updates</span>
            <span style="font-size:0.875rem; font-weight:700; color:var(--text-on-white);">Saran Personal dari Teman AI</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:10px;">
            ${aiAdvice.map((a, i) => `
              <div style="display:flex; align-items:flex-start; gap:12px; padding:12px 14px; background:var(--bg-soft, #F8FAFC); border-radius:10px; border:1px solid rgba(0,0,0,0.05); transition:transform 0.15s;" onmouseenter="this.style.transform='translateX(4px)'" onmouseleave="this.style.transform='translateX(0)'">
                <div style="min-width:36px; height:36px; border-radius:10px; background:${['#EEF2FF','#ECFDF5','#FFF7ED'][i]}; display:flex; align-items:center; justify-content:center;">
                  <span class="material-symbols-rounded" style="font-size:20px; color:${['#2563EB','#10B981','#F59E0B'][i]};">${a.icon}</span>
                </div>
                <p style="font-size:0.85rem; line-height:1.6; color:#475569; margin:0; padding-top:2px;">${a.text}</p>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Mood Distribution -->
        <div style="background:var(--bg-soft, #F8FAFC); border-radius:12px; padding:16px;">
          <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
            <span class="material-symbols-rounded" style="font-size:18px; color:#6366F1;">bar_chart</span>
            <span style="font-size:0.8rem; font-weight:700; color:var(--text-on-white);">Distribusi Mood</span>
          </div>
          <div style="display:flex; align-items:flex-end; gap:8px; height:60px; margin-bottom:8px;">
            ${[1,2,3,4,5].map(level => {
              const count = moodCounts[level];
              const height = Math.max((count / maxCount) * 100, 8);
              const colors = { 1: '#EF4444', 2: '#F97316', 3: '#3B82F6', 4: '#10B981', 5: '#8B5CF6' };
              return `<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:4px;">
                <span style="font-size:0.65rem; font-weight:600; color:${colors[level]};">${count}</span>
                <div style="width:100%; height:${height}%; background:${colors[level]}; border-radius:6px 6px 2px 2px; min-height:4px; transition:height 0.3s;"></div>
              </div>`;
            }).join('')}
          </div>
          <div style="display:flex; gap:8px;">
            ${['😢','😟','😐','😊','🤩'].map(e => `<div style="flex:1; text-align:center; font-size:1rem;">${e}</div>`).join('')}
          </div>
        </div>

        <!-- Stats Row -->
        <div style="display:flex; gap:12px; margin-top:16px; flex-wrap:wrap;">
          <div style="flex:1; min-width:80px; text-align:center; padding:12px 8px; background:rgba(37,99,235,0.06); border-radius:10px;">
            <div style="font-size:1.5rem; font-weight:800; color:var(--primary-accent);">${avg}</div>
            <div style="font-size:0.7rem; color:var(--text-secondary); font-weight:600;">Rata-rata</div>
          </div>
          <div style="flex:1; min-width:80px; text-align:center; padding:12px 8px; background:rgba(245,158,11,0.06); border-radius:10px;">
            <div style="font-size:1.5rem; font-weight:800; color:var(--warning);">${streak}</div>
            <div style="font-size:0.7rem; color:var(--text-secondary); font-weight:600;">Hari Streak</div>
          </div>
          <div style="flex:1; min-width:80px; text-align:center; padding:12px 8px; background:rgba(16,185,129,0.06); border-radius:10px;">
            <div style="font-size:1.5rem; font-weight:800; color:var(--success);">${moods.length}</div>
            <div style="font-size:0.7rem; color:var(--text-secondary); font-weight:600;">Total Check-in</div>
          </div>
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
