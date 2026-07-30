/* =============================================
   Tenang.in — Profil Script
   ============================================= */

let profilData = null;
let profilQuestion = 0;
let profilScores = { malam: 0, pagi: 0, ekspresif: 0, terstruktur: 0 };

document.addEventListener('DOMContentLoaded', async () => {
  await Main.initPage('profil');
  await loadProfilData();

  // Check if already completed
  const existing = Storage.getQuizResult('profil');
  if (existing) {
    showProfilResult(existing.type, false);
  }
});

// ---- Load Data ----
async function loadProfilData() {
  try {
    const res = await fetch('assets/data/quiz-profil.json');
    profilData = await res.json();
  } catch(e) {
    console.error('Failed to load profil data:', e);
  }
}

// ---- Start Quiz ----
function startProfilQuiz() {
  if (!profilData) {
    Animations.showToast('Data kuis belum dimuat...', 'warning');
    return;
  }

  const intro = document.getElementById('profil-intro');
  const quiz = document.getElementById('profil-quiz');
  const result = document.getElementById('profil-result');
  const profileCard = document.getElementById('profil-card-section');

  if (intro) intro.style.display = 'none';
  if (quiz) quiz.style.display = 'block';
  if (result) result.style.display = 'none';
  if (profileCard) profileCard.style.display = 'none';

  profilQuestion = 0;
  profilScores = { malam: 0, pagi: 0, ekspresif: 0, terstruktur: 0 };
  renderProfilQuestion();
}

// ---- Render Question ----
function renderProfilQuestion() {
  const q = profilData.questions[profilQuestion];
  const total = profilData.questions.length;
  const progress = ((profilQuestion) / total) * 100;

  const container = document.getElementById('profil-quiz-content');
  if (!container) return;

  container.innerHTML = `
    <div class="quiz-progress">
      <span class="quiz-progress-text" style="color:var(--text-on-blue);">${profilQuestion + 1}/${total}</span>
      <div class="progress-bar-container" style="flex:1;">
        <div class="progress-bar" style="width:${progress}%;"></div>
      </div>
    </div>

    <div class="card-elevated" style="margin-top:var(--space-xl);">
      <h2 class="quiz-question" style="color:var(--text-on-white);">${q.text}</h2>
      <div style="display:flex; flex-direction:column; gap:var(--space-md);">
        ${q.options.map((opt, i) => `
          <button class="quiz-option" onclick="selectProfilAnswer(${i})">
            ${opt.text}
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

// ---- Select Answer ----
function selectProfilAnswer(optIndex) {
  const q = profilData.questions[profilQuestion];
  const option = q.options[optIndex];

  // Add scores
  for (const [key, val] of Object.entries(option.scores)) {
    profilScores[key] = (profilScores[key] || 0) + val;
  }

  // Mark selected
  const buttons = document.querySelectorAll('.quiz-option');
  buttons[optIndex].classList.add('selected');
  buttons.forEach(b => b.style.pointerEvents = 'none');

  setTimeout(() => {
    profilQuestion++;
    if (profilQuestion < profilData.questions.length) {
      renderProfilQuestion();
    } else {
      calculateProfilResult();
    }
  }, 400);
}

// ---- Calculate Result ----
function calculateProfilResult() {
  let maxType = 'malam';
  let maxScore = 0;

  for (const [type, score] of Object.entries(profilScores)) {
    if (score > maxScore) {
      maxType = type;
      maxScore = score;
    }
  }

  Storage.saveQuizResult('profil', { type: maxType, scores: profilScores });
  Storage.setReturning();
  Animations.checkAchievements();

  showProfilResult(maxType, true);
}

// ---- Show Result ----
function showProfilResult(type, isNew = true) {
  const result = profilData.results[type];
  if (!result) return;

  const intro = document.getElementById('profil-intro');
  const quiz = document.getElementById('profil-quiz');
  const resultSection = document.getElementById('profil-result');
  const profileCard = document.getElementById('profil-card-section');

  if (intro) intro.style.display = 'none';
  if (quiz) quiz.style.display = 'none';
  if (resultSection) resultSection.style.display = 'block';
  if (profileCard) profileCard.style.display = 'block';

  // Apply accent color
  document.documentElement.style.setProperty('--accent-color', result.accent_color);

  const iconName = result.icon || result.emoji || 'tune';

  if (isNew) {
    Animations.showCelebration(iconName, `Tipe refleksimu: ${result.name}!`);
  }

  resultSection.innerHTML = `
    <div class="card-elevated" style="text-align:center; margin-bottom:var(--space-xl);">
      <div style="margin-bottom:var(--space-md);">
        <span class="material-symbols-rounded text-primary" style="font-size:64px;">${iconName}</span>
      </div>
      <h2 style="font-size:var(--h2-size); font-weight:800; margin-bottom:var(--space-xs); color:var(--text-on-white);">${result.name}</h2>
      <p style="font-size:0.9375rem; color:var(--text-secondary); margin-bottom:var(--space-lg);">${result.impact}</p>
      <p style="font-size:var(--body-size); color:var(--text-on-white); line-height:1.7; max-width:480px; margin:0 auto;">${result.description}</p>
    </div>

    <div class="card" style="margin-bottom:var(--space-xl); padding:var(--space-xl);">
      <h3 style="font-weight:700; margin-bottom:var(--space-md); color:var(--text-on-white); display:flex; align-items:center; gap:8px;">
        <span class="material-symbols-rounded text-primary" style="font-size:22px;">stars</span>
        <span>Rekomendasi Fitur</span>
      </h3>
      <div style="display:flex; flex-direction:column; gap:var(--space-sm);">
        ${result.recommendations.map(r => `
          <div style="display:flex; align-items:center; gap:var(--space-md); padding:var(--space-sm) 0;">
            <span class="material-symbols-rounded text-primary" style="font-size:18px;">check_circle</span>
            <span style="font-size:0.9375rem; color:var(--text-on-white);">${r}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div style="text-align:center;">
      <button class="btn btn-secondary" style="color:var(--text-on-blue);" onclick="startProfilQuiz()">
        <span class="material-symbols-rounded">refresh</span>
        Ulangi Kuis
      </button>
    </div>
  `;

  // Render profile card
  renderProfileCard(type, result);
}

// ---- Render Profile Card ----
function renderProfileCard(type, result) {
  const cardSection = document.getElementById('profil-card-section');
  if (!cardSection) return;

  const name = Storage.getUserName();
  const kenaliResult = Storage.getQuizResult('kenali');
  const joinDate = Storage.getQuizResult('profil')?.completedAt;
  const dateStr = joinDate ? new Date(joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Hari ini';
  const iconName = result.icon || result.emoji || 'tune';
  const kenaliIcon = kenaliResult ? (kenaliResult.icon || 'psychology') : 'psychology';

  cardSection.innerHTML = `
    <div class="card" style="padding:var(--space-xl); margin-top:var(--space-2xl);">
      <h3 style="font-weight:700; margin-bottom:var(--space-lg); color:var(--text-on-white); display:flex; align-items:center; gap:8px;">
        <span class="material-symbols-rounded text-primary" style="font-size:24px;">person</span>
        <span>Profil Kamu</span>
      </h3>

      <!-- Name Input -->
      <div style="margin-bottom:var(--space-lg);">
        <label style="font-size:0.875rem; font-weight:600; color:var(--text-secondary); display:block; margin-bottom:var(--space-sm);">Nama (opsional)</label>
        <div style="display:flex; gap:var(--space-sm);">
          <input type="text" class="input" id="profil-name" value="${name}" placeholder="Masukkan namamu..." style="flex:1;">
          <button class="btn btn-primary btn-sm" onclick="saveName()">Simpan</button>
        </div>
      </div>

      <!-- Profile Info -->
      <div style="display:flex; flex-direction:column; gap:var(--space-md);">
        <div style="display:flex; align-items:center; gap:var(--space-md);">
          <span class="material-symbols-rounded text-primary" style="font-size:28px;">${iconName}</span>
          <div>
            <div style="font-weight:600; color:var(--text-on-white);">${result.name}</div>
            <div style="font-size:var(--caption-size); color:var(--text-secondary);">Gaya Refleksi</div>
          </div>
        </div>
        ${kenaliResult ? `
          <div style="display:flex; align-items:center; gap:var(--space-md);">
            <span class="material-symbols-rounded text-primary" style="font-size:28px;">${kenaliIcon}</span>
            <div>
              <div style="font-weight:600; color:var(--text-on-white);">${kenaliResult.name || 'Selesai'}</div>
              <div style="font-size:var(--caption-size); color:var(--text-secondary);">Tipe Kepribadian</div>
            </div>
          </div>
        ` : ''}
        <div style="display:flex; align-items:center; gap:var(--space-md);">
          <span class="material-symbols-rounded text-secondary" style="font-size:28px;">calendar_today</span>
          <div>
            <div style="font-weight:600; color:var(--text-on-white);">${dateStr}</div>
            <div style="font-size:var(--caption-size); color:var(--text-secondary);">Bergabung sejak</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ---- Save Name ----
function saveName() {
  const input = document.getElementById('profil-name');
  if (input) {
    Storage.setUserName(input.value.trim());
    Animations.showToast('Nama tersimpan!', 'success');
  }
}
