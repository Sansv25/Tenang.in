/* =============================================
   Tenang.in — Kenali Dirimu Quiz Script
   Premium visual experience with rich animations
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
  renderStepDots();
  renderQuestions();
}

// ---- Render Step Dots ----
function renderStepDots() {
  const dotsContainer = document.getElementById('kenali-step-dots');
  if (!dotsContainer || !quizData) return;

  dotsContainer.innerHTML = quizData.questions.map((_, i) =>
    `<div class="kenali-step-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></div>`
  ).join('');
}

// ---- Update Step Dots ----
function updateStepDots() {
  const dots = document.querySelectorAll('.kenali-step-dot');
  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'completed');
    if (i < currentQuestion) dot.classList.add('completed');
    if (i === currentQuestion) dot.classList.add('active');
  });
}

// ---- Render Questions (Slides) ----
function renderQuestions() {
  const container = document.getElementById('kenali-questions');
  const progressSection = document.getElementById('quiz-progress-section');
  if (!container) return;

  container.innerHTML = '';
  if (progressSection) progressSection.style.display = 'block';
  updateProgressBar();

  const optionLetters = ['A', 'B'];

  quizData.questions.forEach((q, index) => {
    const slide = document.createElement('div');
    slide.className = `kenali-slide ${index === 0 ? 'active' : 'next'}`;
    slide.dataset.index = index;

    slide.innerHTML = `
      <div class="kenali-question-number">
        <span class="material-symbols-rounded" style="font-size:14px;">quiz</span>
        Pertanyaan ${index + 1} dari ${quizData.questions.length}
      </div>
      <h3 class="kenali-question-text">${q.text}</h3>
      <div class="kenali-options-wrap">
        ${q.options.map((opt, i) => `
          <button class="kenali-option quiz-option" onclick="selectKenaliAnswer(${i})">
            <span class="kenali-option-letter">${optionLetters[i]}</span>
            <span>${opt.text}</span>
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
  updateStepDots();
}

function selectKenaliAnswer(optIndex) {
  const q = quizData.questions[currentQuestion];
  const option = q.options[optIndex];

  // Add score
  scores[q.dimension] += option.score;

  const slides = document.querySelectorAll('#kenali-questions .kenali-slide');
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
  }, 450);
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

// ---- Type Color Map (On-theme palette) ----
const typeColorMap = {
  IT: { class: 'type-it', accent: '#60A5FA', gradient: 'linear-gradient(135deg, #2563EB, #60A5FA)' },
  IF: { class: 'type-if', accent: '#38BDF8', gradient: 'linear-gradient(135deg, #0EA5E9, #38BDF8)' },
  ET: { class: 'type-et', accent: '#FBBF24', gradient: 'linear-gradient(135deg, #F59E0B, #FBBF24)' },
  EF: { class: 'type-ef', accent: '#34D399', gradient: 'linear-gradient(135deg, #10B981, #34D399)' }
};

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
  const typeClass = typeColorMap[type]?.class || 'type-it';
  const typeAccent = typeColorMap[type]?.accent || '#818CF8';

  if (isNew) {
    Animations.showCelebration(iconName, `Kamu adalah ${result.name}!`);
  }

  // Calculate dimension percentages
  const iePercent = Math.round(((resultScores.IE + 6) / 12) * 100);
  const tfPercent = Math.round(((resultScores.TF + 6) / 12) * 100);
  const ieText = iePercent < 50 ? 'Cenderung Introvert' : iePercent > 50 ? 'Cenderung Ekstrovert' : 'Seimbang';
  const tfText = tfPercent < 50 ? 'Cenderung Thinker' : tfPercent > 50 ? 'Cenderung Feeler' : 'Seimbang';

  resultSection.innerHTML = `
    <!-- Result Hero Card -->
    <div class="kenali-result-hero kenali-fade-in">
      <div class="kenali-result-icon-wrap">
        <div class="kenali-result-icon-circle ${typeClass}">
          <img src="assets/img/maskots/mascot-cheerful.png" alt="${result.name}" style="width:56px; height:56px; object-fit:contain; filter:drop-shadow(0 4px 8px rgba(0,0,0,0.15));">
        </div>
      </div>
      <h2 class="kenali-result-name">${result.name}</h2>
      <span class="kenali-result-tagline ${typeClass}">${result.tagline}</span>
      <p class="kenali-result-desc">${result.description}</p>
    </div>

    <!-- Detail Cards -->
    <div class="kenali-result-cards">
      <!-- Dimension Bars -->
      <div class="kenali-detail-card kenali-fade-in kenali-fade-in-delay-1">
        <div class="kenali-detail-header">
          <div class="kenali-detail-icon icon-dimension">
            <span class="material-symbols-rounded">tune</span>
          </div>
          <span class="kenali-detail-title">Dimensi Kepribadianmu</span>
        </div>
        <div class="kenali-dimension-item">
          <div class="kenali-dimension-labels">
            <span class="kenali-dimension-label">Introvert</span>
            <span class="kenali-dimension-label">Ekstrovert</span>
          </div>
          <div class="kenali-dimension-track">
            <div class="kenali-dimension-fill fill-ie" id="dim-ie-bar" style="width:0%;"></div>
          </div>
          <div class="kenali-dimension-result-text">${ieText}</div>
        </div>
        <div class="kenali-dimension-item">
          <div class="kenali-dimension-labels">
            <span class="kenali-dimension-label">Thinker</span>
            <span class="kenali-dimension-label">Feeler</span>
          </div>
          <div class="kenali-dimension-track">
            <div class="kenali-dimension-fill fill-tf" id="dim-tf-bar" style="width:0%;"></div>
          </div>
          <div class="kenali-dimension-result-text">${tfText}</div>
        </div>
      </div>

      <!-- Strengths -->
      <div class="kenali-detail-card kenali-fade-in kenali-fade-in-delay-2">
        <div class="kenali-detail-header">
          <div class="kenali-detail-icon icon-strength">
            <span class="material-symbols-rounded">star</span>
          </div>
          <span class="kenali-detail-title">Kekuatanmu</span>
        </div>
        <div class="kenali-strength-chips">
          ${result.strengths.map(s => `
            <span class="kenali-strength-chip">
              <span class="material-symbols-rounded">check_circle</span>
              ${s}
            </span>
          `).join('')}
        </div>
      </div>

      <!-- Tips -->
      <div class="kenali-detail-card kenali-fade-in kenali-fade-in-delay-3">
        <div class="kenali-detail-header">
          <div class="kenali-detail-icon icon-tips">
            <span class="material-symbols-rounded">lightbulb</span>
          </div>
          <span class="kenali-detail-title">Tips untuk ${result.name}</span>
        </div>
        <div class="kenali-tips-list">
          ${result.tips.map((tip, i) => `
            <div class="kenali-tip-item">
              <span class="kenali-tip-number">${i + 1}</span>
              <p class="kenali-tip-text">${tip}</p>
            </div>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="kenali-result-actions kenali-fade-in kenali-fade-in-delay-4">
      <button class="kenali-btn-share" onclick="shareResult('${type}')">
        <span class="material-symbols-rounded">share</span>
        Bagikan Hasilku
      </button>
      <button class="kenali-btn-retake" onclick="retakeQuiz()">
        <span class="material-symbols-rounded">refresh</span>
        Ulangi Kuis
      </button>
    </div>
  `;

  // Animate dimension bars after a short delay
  setTimeout(() => {
    const ieBar = document.getElementById('dim-ie-bar');
    const tfBar = document.getElementById('dim-tf-bar');
    if (ieBar) ieBar.style.width = `${iePercent}%`;
    if (tfBar) tfBar.style.width = `${tfPercent}%`;
  }, 300);

  // Update share modal preview data (Mood Tracker style)
  const shareEmoji = document.getElementById('share-result-emoji');
  const shareTitle = document.getElementById('share-result-title');
  const shareTagline = document.getElementById('share-result-tagline');
  const shareStrengths = document.getElementById('share-result-strengths');
  const shareDesc = document.getElementById('share-result-desc-short');

  if (shareEmoji) shareEmoji.textContent = iconName;
  if (shareTitle) shareTitle.textContent = result.name;
  if (shareTagline) shareTagline.textContent = result.tagline || 'Kenali Dirimu';
  if (shareDesc && result.description) {
    const firstSentence = result.description.split('.')[0] + '.';
    shareDesc.textContent = `"${firstSentence}"`;
  }
  if (shareStrengths && Array.isArray(result.strengths)) {
    shareStrengths.innerHTML = result.strengths.slice(0, 3).map(s => `
      <span style="background:rgba(255,255,255,0.22); padding:3px 9px; border-radius:10px; color:#fff; font-size:0.75rem; font-weight:700; display:inline-flex; align-items:center; gap:4px; white-space:nowrap;">
        <span class="material-symbols-rounded" style="font-size:14px;">star</span> ${s}
      </span>
    `).join('');
  }
}

// ---- Share Result (Opens Mood-Tracker Style Modal) ----
function shareResult(typeOrName) {
  const modal = document.getElementById('share-result-modal');
  if (modal) {
    modal.classList.add('active');
  } else {
    Animations.showToast('Membuka menu bagikan...', 'info');
  }
}

// ---- Theme Switcher for Share Modal ----
window.changeKenaliShareTheme = function(theme, e) {
  const gradients = {
    blue: 'linear-gradient(135deg, #2D5BA8, #7EC8E3)',
    ocean: 'linear-gradient(135deg, #1E4780, #38BDF8)',
    sunset: 'linear-gradient(135deg, #FF512F, #DD2476)',
    midnight: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
    forest: 'linear-gradient(135deg, #11998e, #38ef7d)'
  };
  
  const previewCard = document.getElementById('kenali-share-card-preview');
  if (previewCard && gradients[theme]) {
    previewCard.style.background = gradients[theme];
  }
  
  const buttons = document.querySelectorAll('#kenali-theme-selector button');
  buttons.forEach(btn => {
    btn.style.transform = 'scale(1)';
    btn.style.border = '2px solid transparent';
  });
  
  const activeBtn = e ? e.currentTarget : (window.event ? window.event.currentTarget : null);
  if (activeBtn) {
    activeBtn.style.transform = 'scale(1.1)';
    activeBtn.style.border = '2px solid #fff';
  }
};

// ---- Retake Quiz ----
function retakeQuiz() {
  const resultSection = document.getElementById('kenali-result');
  if (resultSection) resultSection.style.display = 'none';
  startKenaliQuiz();
}

// ---- Simulate Share (for modal buttons) ----
window.simulateResultShare = window.simulateResultShare || function() {
  Animations.showToast('Memproses gambar...', 'info');
  setTimeout(() => {
    const modal = document.getElementById('share-result-modal');
    if (modal) modal.classList.remove('active');
    Animations.showToast('Hasil kuis berhasil dibagikan!', 'success');
  }, 1500);
};
