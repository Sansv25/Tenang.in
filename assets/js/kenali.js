/* =============================================
   Tenang.in, Kenali Dirimu Quiz Script
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
  } catch (e) {
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
  window.scrollTo({ top: 0, behavior: 'smooth' });
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

  const optionLetters = ['A', 'B', 'C', 'D'];

  quizData.questions.forEach((q, index) => {
    const slide = document.createElement('div');
    slide.className = `kenali-slide ${index === 0 ? 'active' : 'next'}`;
    slide.dataset.index = index;

    slide.innerHTML = `
      <h3 class="kenali-question-text">${q.text}</h3>
      <div class="kenali-options-wrap">
        ${q.options.map((opt, i) => `
          <button class="kenali-option quiz-option" onclick="selectKenaliAnswer(${i})">
            <span class="kenali-option-letter">${optionLetters[i] || (i + 1)}</span>
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
  const qNumEl = document.getElementById('kenali-q-num');
  const qTotalEl = document.getElementById('kenali-q-total');

  if (textEl && barEl) {
    textEl.textContent = `${currentQuestion + 1} / ${quizData.questions.length}`;
    const percent = ((currentQuestion + 1) / quizData.questions.length) * 100;
    barEl.style.width = `${percent}%`;
  }
  if (qNumEl) qNumEl.textContent = currentQuestion + 1;
  if (qTotalEl && quizData && quizData.questions) qTotalEl.textContent = quizData.questions.length;

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
  }, 350);
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

  // Calculate dimension percentages (for scores ranging -12 to +12)
  const iePercent = Math.min(100, Math.max(0, Math.round(((resultScores.IE + 12) / 24) * 100)));
  const tfPercent = Math.min(100, Math.max(0, Math.round(((resultScores.TF + 12) / 24) * 100)));
  const ieText = iePercent < 50 ? 'Cenderung Introvert' : iePercent > 50 ? 'Cenderung Ekstrovert' : 'Seimbang';
  const tfText = tfPercent < 50 ? 'Cenderung Thinker' : tfPercent > 50 ? 'Cenderung Feeler' : 'Seimbang';

  resultSection.innerHTML = `
    <!-- Result Hero Card -->
    <div class="kenali-result-hero kenali-fade-in">
      <div class="kenali-result-mascot-wrap" style="margin-bottom:var(--space-md);">
        <img src="assets/img/maskots/mascot-cheerful.png" alt="${result.name}" style="width:130px; height:130px; object-fit:contain; filter:drop-shadow(0 10px 22px rgba(0,0,0,0.12));">
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
          <div>
            <span class="kenali-detail-title">Kekuatanmu</span>
            <div style="font-size:0.75rem; color:#64748B; margin-top:2px;">Klik / hover untuk melihat penjelasan detail</div>
          </div>
        </div>
        <div class="kenali-strength-chips">
          ${result.strengths.map(s => {
            const exp = STRENGTH_EXPLANATIONS[s] || 'Kekuatan kepribadian unik yang membantumu berkembang dan menghadapi tantangan.';
            const safeExp = exp.replace(/"/g, '&quot;');
            return `
              <button type="button" class="kenali-strength-chip" onclick="openStrengthModal('${s}')" title="Klik untuk penjelasan detail ${s}">
                <span class="material-symbols-rounded">check_circle</span>
                <span>${s}</span>
                <span class="strength-tooltip-badge">${exp}</span>
              </button>
            `;
          }).join('')}
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
window.changeKenaliShareTheme = function (theme, e) {
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
window.simulateResultShare = window.simulateResultShare || function () {
  Animations.showToast('Memproses gambar...', 'info');
  setTimeout(() => {
    const modal = document.getElementById('share-result-modal');
    if (modal) modal.classList.remove('active');
    Animations.showToast('Hasil kuis berhasil dibagikan!', 'success');
  }, 1500);
};

// ---- Strength Detail Explanations Mapping ----
const STRENGTH_EXPLANATIONS = {
  "Analitis dan detail": "Kamu mampu mengurai masalah kompleks menjadi bagian-bagian logis dan melihat detail penting yang sering luput dari perhatian orang lain.",
  "Mandiri dan fokus": "Kamu tidak tergantung pada dorongan eksternal untuk menyelesaikan tugas; fokusmu sangat kuat saat bekerja secara mandiri.",
  "Pemikir strategis": "Kamu selalu berpikir beberapa langkah ke depan dan memperhitungkan dampak jangka panjang sebelum mengambil tindakan.",
  "Tenang di bawah tekanan": "Dalam situasi panik atau darurat, pikiran logismu membantumu tetap tenang dan menemukan solusi yang jernih.",

  "Empatik dan peka": "Kamu memiliki kepekaan luar biasa dalam merasakan suasana hati dan kebutuhan emosional orang-orang di sekitarmu.",
  "Kreatif dan imajinatif": "Kedalaman emosimu menjadi bahan bakar karya kreatif, ide out-of-the-box, dan cara pandang baru yang unik.",
  "Pendengar yang baik": "Orang lain merasa sangat didengar dan dihargai saat bercerita padamu tanpa takut dihakimi.",
  "Intuitif dan mendalam": "Kamu mempercayai kata hati dan mampu melihat makna tersirat yang mendalam di balik setiap peristiwa.",

  "Tegas dan decisive": "Kamu tidak ragu mengambil tindakan dan keputusan sulit secara cepat, lugas, dan efisien.",
  "Natural leader": "Karisma dan kepastian yang kamu pancarkan membuat orang lain secara alami terdorong untuk mengikuti arahanmu.",
  "Problem-solver efektif": "Kamu fokus pada solusi nyata dan langkah tindakan konkret daripada tenggelam dalam keluhan.",
  "Energik dan motivatif": "Semangatmu yang menular mampu mengobarkan energi positif dan menggerakkan tim untuk bertindak maju.",

  "Hangat dan ekspresif": "Kehangatan sikapmu membuat siapa pun merasa diterima, nyaman, dan dihargai saat berada di dekatmu.",
  "Mudah berteman": "Kamu memiliki kemampuan alami mencairkan suasana dan membangun koneksi erat di lingkungan baru mana pun.",
  "Penyemangat alami": "Kehadiranmu selalu membawa keceriaan dan dorongan positif saat orang-orang di sekitarmu sedang redup.",
  "Komunikator yang baik": "Kamu mahir menyuarakan isi hati dan pikiran secara artikulatif, persuasif, dan menyentuh perasaan pendengar."
};

// ---- Strength Detail Modal Popup Engine ----
window.openStrengthModal = function (strengthName) {
  const modal = document.getElementById('strength-detail-modal');
  const titleEl = document.getElementById('strength-modal-title');
  const descEl = document.getElementById('strength-modal-desc');
  if (!modal) return;

  const explanation = STRENGTH_EXPLANATIONS[strengthName] || 'Kekuatan kepribadian unik yang membantumu berkembang dan menghadapi berbagai tantangan.';

  if (titleEl) titleEl.textContent = strengthName;
  if (descEl) descEl.textContent = explanation;

  modal.classList.add('active');
};

window.closeStrengthModal = function () {
  const modal = document.getElementById('strength-detail-modal');
  if (modal) modal.classList.remove('active');
};

// Close on overlay click
document.addEventListener('click', (e) => {
  const modal = document.getElementById('strength-detail-modal');
  if (modal && modal.classList.contains('active') && e.target === modal) {
    closeStrengthModal();
  }
});

// Close on ESC key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeStrengthModal();
  }
});
