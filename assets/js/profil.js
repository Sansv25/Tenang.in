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

// ---- Render Questions (Slides) ----
function renderProfilQuestion() {
  const container = document.getElementById('profil-questions');
  const progressSection = document.getElementById('quiz-progress-section');
  if (!container) return;

  container.innerHTML = '';
  if (progressSection) progressSection.style.display = 'block';
  updateProfilProgressBar();

  profilData.questions.forEach((q, index) => {
    const slide = document.createElement('div');
    slide.className = `quiz-slide ${index === 0 ? 'active' : 'next'}`;
    slide.dataset.index = index;

    slide.innerHTML = `
      <h3 style="font-size:var(--h3-size); font-weight:700; color:var(--text-on-white); text-align:center; margin-bottom:var(--space-xl);">
        ${q.text}
      </h3>
      <div style="display:flex; flex-direction:column; gap:var(--space-md); width:100%; max-width:400px; margin:0 auto;">
        ${q.options.map((opt, i) => `
          <button class="btn btn-secondary btn-full quiz-option" style="justify-content:flex-start; padding:1rem;" onclick="selectProfilAnswer(${i})">
            ${opt.text}
          </button>
        `).join('')}
      </div>
    `;
    container.appendChild(slide);
  });
}

function updateProfilProgressBar() {
  const textEl = document.getElementById('profil-progress-text');
  const barEl = document.getElementById('profil-progress-bar');
  if (textEl && barEl) {
    textEl.textContent = `${profilQuestion + 1} / ${profilData.questions.length}`;
    const percent = ((profilQuestion + 1) / profilData.questions.length) * 100;
    barEl.style.width = `${percent}%`;
  }
}

// ---- Select Answer ----
function selectProfilAnswer(optIndex) {
  const q = profilData.questions[profilQuestion];
  const option = q.options[optIndex];

  // Add scores
  for (const [key, val] of Object.entries(option.scores)) {
    profilScores[key] = (profilScores[key] || 0) + val;
  }

  const slides = document.querySelectorAll('#profil-questions .quiz-slide');
  const currentSlide = slides[profilQuestion];

  // Mark selected
  const buttons = currentSlide.querySelectorAll('.quiz-option');
  buttons[optIndex].classList.add('selected');
  buttons.forEach(b => b.style.pointerEvents = 'none');

  setTimeout(() => {
    if (profilQuestion < profilData.questions.length - 1) {
      currentSlide.classList.replace('active', 'prev');
      profilQuestion++;
      updateProfilProgressBar();
      slides[profilQuestion].classList.replace('next', 'active');
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
      <h3 style="font-weight:700; margin-bottom:var(--space-lg); color:var(--text-on-white); display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="material-symbols-rounded text-primary" style="font-size:24px;">person</span>
          <span>Profil Kamu</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="showShareResultModal('${escapeHTML(result.name)}', '${iconName}')" aria-label="Bagikan Hasil Profil"><span class="material-symbols-rounded">share</span></button>
      </h3>

      <!-- Name Input -->
      <div style="margin-bottom:var(--space-lg);">
        <label style="font-size:0.875rem; font-weight:600; color:var(--text-secondary); display:block; margin-bottom:var(--space-sm);">Nama (opsional)</label>
        <div style="display:flex; gap:var(--space-sm);">
          <input type="text" class="input" id="profil-name" value="${escapeHTML(name)}" placeholder="Masukkan namamu..." style="flex:1;">
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

window.showShareResultModal = function(title, emoji) {
  const modal = document.getElementById('share-result-modal');
  if (modal) {
    document.getElementById('share-result-title').textContent = title;
    if (emoji && document.getElementById('share-result-emoji')) {
      document.getElementById('share-result-emoji').innerHTML = `<span class="material-symbols-rounded" style="font-size:3.5rem;">${emoji}</span>`;
    }
    modal.classList.add('active');
  }
};

window.simulateResultShare = function() {
  Animations.showToast('Memproses gambar...', 'info');
  setTimeout(() => {
    document.getElementById('share-result-modal').classList.remove('active');
    Animations.showToast('Hasil berhasil dibagikan!', 'success');
  }, 1500);
};
