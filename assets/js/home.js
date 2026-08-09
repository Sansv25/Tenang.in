/* =============================================
   Tenang.in — Home Page Script
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
             ${mood.tags.map(t => `<span style="background:rgba(15,23,42,0.06); border:1px solid rgba(15,23,42,0.15); color:#334155; font-size:0.75rem; font-weight:600; padding:4px 12px; border-radius:16px;">#${escapeHTML(t)}</span>`).join('')}
           </div>`
        : '';

      const noteHTML = mood.note
        ? `<div style="margin:16px auto; max-width:420px; padding:12px 16px; background:#F8FAFC; border-left:4px solid ${colors[mood.level]}; border-radius:6px; color:#475569; font-size:0.9rem; font-style:italic; text-align:center; box-shadow:0 1px 3px rgba(0,0,0,0.05);">"${escapeHTML(mood.note)}"</div>`
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

window.resetMoodInHome = function () {
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
const FALLBACK_TIPS = {
  "IT": { "emoji": "dark_mode", "name": "Pemikir Tenang", "daily": [ "Overthinking bukan kelemahanmu — itu tanda kamu peduli. Arahkan energi itu ke jurnal hari ini.", "Waktu sendiri bukan anti-sosial. Itu caramu mengisi ulang.", "Kamu nggak harus punya jawaban untuk semua hal. Kadang cukup hadirkan pertanyaan yang tepat.", "Pikiran yang berat bisa diringankan dengan menuliskannya. Coba buka jurnal hari ini.", "Buat daftar kekhawatiranmu — tandai mana yang bisa kamu kontrol. Lepaskan yang sisanya." ] },
  "IF": { "emoji": "favorite", "name": "Perasa Mendalam", "daily": [ "Perasaanmu yang dalam adalah kekuatan, bukan kelemahan. Jangan pernah ragu merasakannya.", "Self-compassion: hari ini, perlakukan dirimu seperti kamu memperlakukan sahabat terbaikmu.", "Batasi scrolling hari ini. Perasaan orang lain di timeline bisa mempengaruhimu tanpa sadar.", "Saat emosi terasa overwhelming, coba grounding 5-4-3-2-1: lihat 5 benda, sentuh 4, dengar 3, cium 2, rasa 1.", "Tidak semua perasaan harus dibagikan. Jurnal adalah ruang amanmu untuk memproses." ] },
  "ET": { "emoji": "bolt", "name": "Pemimpin Aktif", "daily": [ "Ubah kecemasan jadi aksi. Langkah kecil hari ini > rencana besar yang nggak dimulai.", "Bilang 'tidak' adalah skill. Kamu nggak harus iya-kan semua hal.", "Energimu besar — tapi jangan lupa isi ulang. Tidur cukup malam ini, ya.", "Jadwalkan 10 menit waktu diam hari ini. Otak aktif juga butuh jeda.", "Istirahat aktif cocok buat kamu — jalan kaki 15 menit bisa reset pikiran." ] },
  "EF": { "emoji": "auto_awesome", "name": "Jiwa Sosial", "daily": [ "Kamu mudah merasakan emosi orang lain. Hari ini, cek dulu: ini perasaanku atau perasaan orang?", "Kamu nggak harus selalu jadi 'penyemangat'. Kamu juga berhak lelah dan istirahat.", "Tarik napas sebelum bereaksi. Jeda 3 detik bisa mengubah reaksi jadi respons.", "Pilih circle yang memberi energi, bukan hanya menguras. Kamu layak itu.", "Empati itu kekuatanmu. Tapi bedakan antara memahami beban orang lain vs menanggungnya." ] },
  "default": { "emoji": "lightbulb", "name": "Untukmu", "daily": [ "Hari ini adalah kesempatan baru. Mulai dari hal kecil yang membuatmu tersenyum.", "Kamu nggak harus baik-baik aja setiap hari. Yang penting, kamu hadir.", "Progress, bukan perfection. Langkah kecil tetap langkah.", "Jaga dirimu hari ini — minum air, gerak badan, dan beri waktu untuk dirimu.", "Kamu lebih kuat dari yang kamu kira. Buktinya, kamu masih di sini." ] }
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

  // Deteksi tema tempat komponen dijalankan (Landing vs Dashboard)
  const isLanding = document.querySelector('.hero') !== null || window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/');
  const theme = {
    cardBg: isLanding ? 'rgba(255, 255, 255, 0.04)' : '#FFFFFF',
    cardBorder: isLanding ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #E2E8F0',
    cardBlur: isLanding ? 'backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);' : '',
    textColor: isLanding ? '#FFFFFF' : '#1A2F4E',
    subTextColor: isLanding ? 'rgba(255, 255, 255, 0.75)' : '#64748B',
    boxBg: isLanding ? 'rgba(255, 255, 255, 0.05)' : '#F8FAFC',
    boxBorder: isLanding ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid #E2E8F0',
    chipBg: isLanding ? 'rgba(126, 200, 227, 0.15)' : '#EEF3F9',
    chipBorder: isLanding ? '1px solid rgba(126, 200, 227, 0.3)' : '1px solid #7EC8E3',
    chipColor: isLanding ? '#7EC8E3' : '#2D5BA8',
    tipBg: isLanding ? 'rgba(45, 91, 168, 0.35)' : 'linear-gradient(135deg, #EEF3F9 0%, #E0F2FE 100%)',
    tipBorder: isLanding ? '1px solid rgba(126, 200, 227, 0.3)' : '1.5px solid #7EC8E3',
    tipText: isLanding ? '#FFFFFF' : '#1A2F4E',
    btnDetailBg: isLanding ? 'rgba(255, 255, 255, 0.1)' : '#F8FAFC',
    btnDetailBorder: isLanding ? '1px solid rgba(255, 255, 255, 0.2)' : '1.5px solid #CBD5E1',
    btnDetailColor: isLanding ? '#FFFFFF' : '#1E293B',
    emptyBorder: isLanding ? '1px dashed rgba(255, 255, 255, 0.2)' : '2px dashed #CBD5E1'
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

        <div class="weekly-box-insight" style="background: ${theme.boxBg}; border: ${theme.boxBorder}; border-left: 5px solid #2D5BA8; border-radius: 22px; padding: clamp(20px, 4vw, 26px); display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: ${isLanding ? '#7EC8E3' : '#2D5BA8'}; font-size: 0.92rem; margin-bottom: 12px;">
              <span class="material-symbols-rounded" style="font-size: 22px;">psychology</span>
              <span>Insight Refleksi Untukmu</span>
            </div>
            <p style="font-size: clamp(0.88rem, 2.5vw, 0.94rem); color: ${isLanding ? 'rgba(255,255,255,0.9)' : '#334155'}; line-height: 1.65; font-style: italic; margin: 0; text-align: justify;">
              "${safeText(insightMsg)}"
            </p>
          </div>
          <div class="weekly-insight-sub" style="margin-top: 18px; font-size: 0.78rem; font-weight: 750; color: ${theme.subTextColor}; display: flex; align-items: center; gap: 6px;">
            <span class="material-symbols-rounded" style="font-size: 16px; color: ${isLanding ? '#7EC8E3' : '#2D5BA8'};">analytics</span>
            <span>Berdasarkan ${itemsToAnalyze.length} catatan check-in mood terakhir</span>
          </div>
        </div>
      </div>

      <div class="weekly-tips-box" style="background: ${theme.tipBg}; border: ${theme.tipBorder}; border-radius: 20px; padding: 18px clamp(18px, 4vw, 24px); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
        <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 240px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: #FFFFFF; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
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

// ---- First-Time Onboarding Modal Engine (Vanilla JS State Management & Interactive Selections) ----
const Onboarding = (() => {
  let currentStep = 0;
  
  // Interactive Onboarding State
  let state = {
    gender: localStorage.getItem('tenang_user_gender') || 'Netral',
    goals: []
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

  const nextSlide = () => {
    if (currentStep < 2) {
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
        <div class="w-14 h-14 md:w-16 md:h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm" style="background: rgba(91, 143, 212, 0.15);">
          <span class="material-symbols-rounded text-2xl md:text-3xl" style="color: #5B8FD4;">waving_hand</span>
        </div>
        <h3 class="text-xl md:text-2xl font-extrabold mb-2 px-2 leading-tight" style="color: #1A2F4E;">
          Selamat Datang di Tenang.in
        </h3>
        <p class="text-xs md:text-sm max-w-xs mx-auto mb-5 leading-relaxed" style="color: #6B8DB5;">
          Agar Teman AI dapat menyapa dan berinteraksi lebih personal, apa panggilan atau gender yang kamu nyaman?
        </p>
        <div class="grid grid-cols-3 gap-2 md:gap-3 w-full max-w-sm">
          ${[
            { val: 'Laki-laki', label: 'Laki-laki', icon: 'man' },
            { val: 'Perempuan', label: 'Perempuan', icon: 'woman' },
            { val: 'Netral', label: 'Netral / Privasi', icon: 'person' }
          ].map(opt => {
            const isSelected = state.gender === opt.val;
            const cardStyle = isSelected
              ? 'border-2 border-[#5B8FD4] bg-[#F0F6FF] text-[#2D5BA8] font-bold shadow-md'
              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100';
            return `
              <button type="button" onclick="Onboarding.selectGender('${opt.val}')" class="p-3 rounded-2xl transition flex flex-col items-center justify-center gap-1 cursor-pointer ${cardStyle}">
                <span class="material-symbols-rounded text-2xl" style="color: ${isSelected ? '#5B8FD4' : '#94A3B8'};">${opt.icon}</span>
                <span class="text-[11px] md:text-xs leading-tight">${opt.label}</span>
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
        <div class="w-14 h-14 md:w-16 md:h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-sm" style="background: rgba(126, 200, 227, 0.18);">
          <span class="material-symbols-rounded text-2xl md:text-3xl" style="color: #4AA4C6;">track_changes</span>
        </div>
        <h3 class="text-xl md:text-2xl font-extrabold mb-2 px-2 leading-tight" style="color: #1A2F4E;">
          Apa fokus utamamu saat ini?
        </h3>
        <p class="text-xs md:text-sm max-w-xs mx-auto mb-4 leading-relaxed" style="color: #6B8DB5;">
          Pilih satu atau lebih fokus refleksi agar pengalamanmu lebih terarah.
        </p>
        <div class="flex flex-col gap-2.5 w-full max-w-sm text-left">
          ${availableGoals.map(g => {
            const isSelected = state.goals.includes(g.text);
            const btnStyle = isSelected
              ? 'border-2 border-[#5B8FD4] bg-[#F0F6FF] text-[#1A2F4E] font-bold shadow-sm'
              : 'border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100';
            return `
              <button type="button" onclick="Onboarding.toggleGoal('${g.text}')" class="px-4 py-3 rounded-2xl transition flex items-center justify-between cursor-pointer ${btnStyle}">
                <div class="flex items-center gap-3">
                  <span class="material-symbols-rounded text-xl" style="color: ${isSelected ? '#5B8FD4' : '#94A3B8'};">${g.icon}</span>
                  <span class="text-xs md:text-sm">${g.text}</span>
                </div>
                <span class="material-symbols-rounded text-lg" style="color: ${isSelected ? '#5B8FD4' : '#CBD5E1'};">${isSelected ? 'check_circle' : 'radio_button_unchecked'}</span>
              </button>
            `;
          }).join('')}
        </div>
      `;
    } else {
      // Step 3: Ready
      html = `
        <div class="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto mb-5 flex items-center justify-center shadow-md transform transition duration-500 hover:rotate-12" style="background: linear-gradient(135deg, #F0F6FF 0%, #E2EFFE 100%); border: 2px solid #D2E4FF;">
          <span class="material-symbols-rounded" style="font-size: 48px; color: #2D5BA8;">rocket_launch</span>
        </div>
        <h3 class="text-xl md:text-2xl font-extrabold mb-3 px-2 leading-tight" style="color: #1A2F4E;">
          Kamu Sudah Siap Melangkah!
        </h3>
        <p class="text-xs md:text-sm max-w-sm mx-auto mb-4 leading-relaxed" style="color: #6B8DB5;">
          Preferensimu telah diselaraskan. Ruang refleksi ini adalah milikmu seutuhnya.
        </p>
        <div class="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 max-w-xs mx-auto text-center flex items-center gap-2.5">
          <span class="material-symbols-rounded text-emerald-500 flex-shrink-0" style="font-size:24px;">enhanced_encryption</span>
          <p class="text-[11px] text-slate-500 text-left leading-tight">
            <strong>100% Privat & Aman:</strong> Seluruh catatan emosi dan obrolan Teman AI disandikan & terjaga privasinya.
          </p>
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
      if (currentStep === 2) {
        nextBtn.innerHTML = `<span>Mulai Perjalananku</span><span class="material-symbols-rounded" style="font-size:18px;">check_circle</span>`;
        nextBtn.style.background = '#2D5BA8';
      } else {
        nextBtn.innerHTML = `<span>Lanjut</span><span class="material-symbols-rounded" style="font-size:18px;">arrow_forward</span>`;
        nextBtn.style.background = '#5B8FD4';
      }
    }
  };

  return { init: checkAndShow, open, close, complete, nextSlide, prevSlide, selectGender, toggleGoal };
})();

window.Onboarding = Onboarding;
