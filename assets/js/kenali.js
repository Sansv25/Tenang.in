/* =============================================
   Tenang.in — Kenali Dirimu Quiz Script
   ============================================= */

let quizData = null;
let currentQuestion = 0;
let scores = { IE: 0, TF: 0 };

document.addEventListener('DOMContentLoaded', async () => {
  await Main.initPage('kenali');
  await loadQuizData();

  // Check if already completed
  const existing = Storage.getQuizResult('kenali');
  if (existing && quizData && quizData.results) {
    showExistingResult(existing);
  }
});

// ---- Load Quiz Data ----
async function loadQuizData() {
  try {
    const res = await fetch('assets/data/quiz-kenali.json');
    quizData = await res.json();
  } catch(e) {
    console.error('Failed to load quiz data:', e);
  }
}

// ---- Show Existing Result ----
function showExistingResult(result) {
  const intro = document.getElementById('kenali-intro');
  const quiz = document.getElementById('kenali-quiz');
  if (intro) intro.style.display = 'none';
  if (quiz) quiz.style.display = 'none';

  showResult(result.type, result.scores, false);
}

// ---- Start Quiz ----
function startKenaliQuiz() {
  if (!quizData) {
    Animations.showToast('Data kuis belum dimuat, coba lagi...', 'warning');
    return;
  }

  const intro = document.getElementById('kenali-intro');
  const quiz = document.getElementById('kenali-quiz');
  const resultSection = document.getElementById('kenali-result');

  if (intro) intro.style.display = 'none';
  if (quiz) quiz.style.display = 'block';
  if (resultSection) resultSection.style.display = 'none';

  currentQuestion = 0;
  scores = { IE: 0, TF: 0 };
  renderQuestions();
}

// ---- Render Questions (Slides) ----
function renderQuestions() {
  const container = document.getElementById('kenali-questions');
  const progressSection = document.getElementById('quiz-progress-section');
  if (!container) return;

  container.innerHTML = '';
  if (progressSection) progressSection.style.display = 'block';
  updateProgressBar();

  quizData.questions.forEach((q, index) => {
    const slide = document.createElement('div');
    slide.className = `quiz-slide ${index === 0 ? 'active' : 'next'}`;
    slide.dataset.index = index;

    slide.innerHTML = `
      <h3 style="font-size:var(--h3-size); font-weight:700; color:var(--text-on-white); text-align:center; margin-bottom:var(--space-xl);">
        ${q.text}
      </h3>
      <div style="display:flex; flex-direction:column; gap:var(--space-md); width:100%; max-width:400px; margin:0 auto;">
        ${q.options.map((opt, i) => `
          <button class="btn btn-secondary btn-full quiz-option" style="justify-content:flex-start; padding:1rem;" onclick="selectKenaliAnswer(${i})">
            ${opt.text}
          </button>
        `).join('')}
      </div>
    `;
    container.appendChild(slide);
  });
}

function updateProgressBar() {
  const textEl = document.getElementById('kenali-progress-text');
  const barEl = document.getElementById('kenali-progress-bar');
  if (textEl && barEl) {
    textEl.textContent = `${currentQuestion + 1} / ${quizData.questions.length}`;
    const percent = ((currentQuestion + 1) / quizData.questions.length) * 100;
    barEl.style.width = `${percent}%`;
  }
}

function selectKenaliAnswer(optIndex) {
  const q = quizData.questions[currentQuestion];
  const option = q.options[optIndex];

  // Add score
  scores[q.dimension] += option.score;

  const slides = document.querySelectorAll('#kenali-questions .quiz-slide');
  const currentSlide = slides[currentQuestion];
  
  // Mark selected with animation
  const buttons = currentSlide.querySelectorAll('.quiz-option');
  buttons[optIndex].classList.add('selected');
  buttons.forEach(b => b.style.pointerEvents = 'none');
  
  setTimeout(() => {
    if (currentQuestion < quizData.questions.length - 1) {
      currentSlide.classList.replace('active', 'prev');
      currentQuestion++;
      updateProgressBar();
      slides[currentQuestion].classList.replace('next', 'active');
    } else {
      calculateResult();
    }
  }, 400);
}

// ---- Calculate Result ----
function calculateResult() {
  const ie = scores.IE <= 0 ? 'I' : 'E';
  const tf = scores.TF <= 0 ? 'T' : 'F';
  const type = ie + tf;

  // Save result
  Storage.saveQuizResult('kenali', { type, scores });
  Animations.checkAchievements();

  showResult(type, scores, true);
}

// ---- Show Result ----
function showResult(type, resultScores, isNew = true) {
  if (!quizData || !quizData.results) {
    console.error('Quiz data is not loaded yet.');
    return;
  }
  const result = quizData.results[type];
  if (!result) return;

  const quiz = document.getElementById('kenali-quiz');
  const resultSection = document.getElementById('kenali-result');
  if (quiz) quiz.style.display = 'none';
  if (resultSection) resultSection.style.display = 'block';

  const iconName = result.icon || result.emoji || 'psychology';

  if (isNew) {
    Animations.showCelebration(iconName, `Kamu adalah ${result.name}!`);
  }

  resultSection.innerHTML = `
    <div class="card-elevated" style="text-align:center; margin-bottom:var(--space-xl);">
      <div style="margin-bottom:var(--space-md);">
        <span class="material-symbols-rounded text-primary" style="font-size:64px;">${iconName}</span>
      </div>
      <h2 style="font-size:var(--h2-size); font-weight:800; margin-bottom:var(--space-xs); color:var(--text-on-white);">${result.name}</h2>
      <p style="font-size:0.9375rem; color:var(--primary-accent); font-weight:600; margin-bottom:var(--space-lg);">${result.tagline}</p>
      <p style="font-size:var(--body-size); color:var(--text-on-white); line-height:1.7; max-width:500px; margin:0 auto;">${result.description}</p>
    </div>

    <!-- Dimension Bars -->
    <div class="card" style="margin-bottom:var(--space-xl); padding:var(--space-xl);">
      <h3 style="font-weight:600; margin-bottom:var(--space-lg); text-align:center; color:var(--text-on-white);">Dimensi Kepribadianmu</h3>
      <div id="kenali-dimension-bars"></div>
    </div>

    <!-- Strengths -->
    <div class="card" style="margin-bottom:var(--space-xl); padding:var(--space-xl);">
      <h3 style="font-weight:600; margin-bottom:var(--space-md); color:var(--text-on-white); display:flex; align-items:center; gap:8px;">
        <span class="material-symbols-rounded text-primary" style="font-size:22px;">star</span>
        <span>Kekuatanmu</span>
      </h3>
      <div style="display:flex; flex-wrap:wrap; gap:var(--space-sm);">
        ${result.strengths.map(s => `<span class="tag-chip selected" style="pointer-events:none;">${s}</span>`).join('')}
      </div>
    </div>

    <!-- Tips -->
    <div class="card" style="margin-bottom:var(--space-xl); padding:var(--space-xl);">
      <h3 style="font-weight:600; margin-bottom:var(--space-md); color:var(--text-on-white); display:flex; align-items:center; gap:8px;">
        <span class="material-symbols-rounded text-primary" style="font-size:22px;">lightbulb</span>
        <span>Tips untuk ${result.name}</span>
      </h3>
      <div style="display:flex; flex-direction:column; gap:var(--space-md);">
        ${result.tips.map((tip, i) => `
          <div style="display:flex; gap:var(--space-md); align-items:flex-start;">
            <span style="width:28px; height:28px; border-radius:var(--radius-full); background:rgba(37,99,235,0.1); display:flex; align-items:center; justify-content:center; font-size:0.8125rem; font-weight:700; color:var(--primary-accent); flex-shrink:0;">${i+1}</span>
            <p style="font-size:0.9375rem; color:var(--text-on-white); line-height:1.6;">${tip}</p>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Actions -->
    <div style="display:flex; gap:var(--space-md); justify-content:center; flex-wrap:wrap; padding-bottom:var(--space-xl);">
      <button class="btn btn-white" onclick="shareResult('${result.name}')">
        <span class="material-symbols-rounded">share</span>
        Bagikan Hasilku
      </button>
      <button class="btn btn-secondary" style="color:var(--text-on-blue);" onclick="retakeQuiz()">
        <span class="material-symbols-rounded">refresh</span>
        Ulangi Kuis
      </button>
    </div>
  `;

  // Render dimension bars
  const barsEl = document.getElementById('kenali-dimension-bars');
  if (barsEl) {
    Charts.createDimensionBars(barsEl, resultScores);
  }
}

// ---- Share Result ----
async function shareResult(name) {
  const text = `Hasil kuis Kenali Dirimu di Tenang.in: Aku adalah "${name}"! Coba juga di tenang.in`;

  if (navigator.share) {
    try {
      await navigator.share({ title: 'Tenang.in — Kenali Dirimu', text });
    } catch(e) { /* cancelled */ }
  } else {
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      Animations.showToast('Disalin ke clipboard!', 'success');
    } catch {
      Animations.showToast('Nggak bisa share di browser ini', 'warning');
    }
  }
}

// ---- Retake Quiz ----
function retakeQuiz() {
  const resultSection = document.getElementById('kenali-result');
  if (resultSection) resultSection.style.display = 'none';
  startKenaliQuiz();
}
