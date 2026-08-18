/* =============================================
   Tenang.in — Profil Script
   ============================================= */

let profilData = null;
let profilQuestion = 0;
let profilScores = { malam: 0, pagi: 0, ekspresif: 0, terstruktur: 0 };

document.addEventListener('DOMContentLoaded', async () => {
  await Main.initPage('profil');
  await loadProfilData();

  const existing = Storage.getQuizResult('profil');
  const resultData = profilData && existing ? profilData.results[existing.type] : { name: 'Refleksi Diri', icon: 'tune' };
  
  // Render Profile Card ALWAYS at the top
  renderProfileCard(existing ? existing.type : 'malam', resultData || { name: 'Refleksi Diri', icon: 'tune' });

  if (existing) {
    showProfilResult(existing.type, false);
  } else {
    const intro = document.getElementById('profil-intro');
    const quiz = document.getElementById('profil-quiz');
    const resultSection = document.getElementById('profil-result');

    if (intro) intro.style.display = 'block';
    if (quiz) quiz.style.display = 'none';
    if (resultSection) resultSection.style.display = 'none';
  }
});

// ---- Load Data ----
async function loadProfilData() {
  try {
    const res = await fetch('assets/data/quiz-profil.json');
    profilData = await res.json();
  } catch (e) {
    console.error('Failed to load profil data:', e);
  }
}

// ---- Render Step Dots ----
function renderProfilStepDots() {
  const dotsContainer = document.getElementById('profil-step-dots');
  if (!dotsContainer || !profilData) return;

  dotsContainer.innerHTML = profilData.questions.map((_, i) =>
    `<div class="kenali-step-dot ${i === 0 ? 'active' : ''}" data-step="${i}"></div>`
  ).join('');
}

function updateProfilStepDots() {
  const dots = document.querySelectorAll('#profil-step-dots .kenali-step-dot');
  dots.forEach((dot, i) => {
    dot.classList.remove('active', 'completed');
    if (i < profilQuestion) dot.classList.add('completed');
    if (i === profilQuestion) dot.classList.add('active');
  });
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
  if (profileCard) profileCard.style.display = 'block';

  profilQuestion = 0;
  profilScores = { malam: 0, pagi: 0, ekspresif: 0, terstruktur: 0 };
  renderProfilStepDots();
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

  const optionLetters = ['A', 'B', 'C', 'D', 'E'];

  profilData.questions.forEach((q, index) => {
    const slide = document.createElement('div');
    slide.className = `kenali-slide ${index === 0 ? 'active' : 'next'}`;
    slide.dataset.index = index;

    slide.innerHTML = `
      <div class="kenali-question-number">
        <span class="material-symbols-rounded" style="font-size:14px;">quiz</span>
        Pertanyaan ${index + 1} dari ${profilData.questions.length}
      </div>
      <h3 class="kenali-question-text">${q.text}</h3>
      <div class="kenali-options-wrap">
        ${q.options.map((opt, i) => `
          <button class="kenali-option quiz-option" onclick="selectProfilAnswer(${i})">
            <span class="kenali-option-letter">${optionLetters[i] || (i + 1)}</span>
            <span>${opt.text}</span>
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
  updateProfilStepDots();
}

// ---- Select Answer ----
function selectProfilAnswer(optIndex) {
  const q = profilData.questions[profilQuestion];
  const option = q.options[optIndex];

  // Add scores
  for (const [key, val] of Object.entries(option.scores)) {
    profilScores[key] = (profilScores[key] || 0) + val;
  }

  const slides = document.querySelectorAll('#profil-questions .kenali-slide');
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
  cardSection.style.display = 'block';

  const avatar = (typeof Storage !== 'undefined' && Storage.getUserAvatar) ? Storage.getUserAvatar() : null;
  const name = (typeof Storage !== 'undefined' && Storage.getUserName) ? Storage.getUserName() : '';
  const kenaliResult = Storage.getQuizResult('kenali');
  const joinDate = Storage.getQuizResult('profil')?.completedAt;
  const dateStr = joinDate ? new Date(joinDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '13 Agustus 2026';
  const iconName = result.icon || result.emoji || 'dark_mode';

  cardSection.innerHTML = `
    <div class="card" style="padding:var(--space-xl); margin-top:var(--space-2xl); border-radius:24px; box-shadow:0 10px 30px rgba(0,0,0,0.06);">
      <h3 style="font-weight:750; margin-bottom:var(--space-lg); color:var(--text-on-white); display:flex; align-items:center; justify-content:space-between;">
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="material-symbols-rounded text-primary" style="font-size:24px;">person</span>
          <span>Profil Kamu</span>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="showShareResultModal('${escapeHTML(result.name)}', '${iconName}')" aria-label="Bagikan Hasil Profil"><span class="material-symbols-rounded">share</span></button>
      </h3>

      <!-- Avatar Upload Circle -->
      <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; margin-bottom:var(--space-2xl);">
        <div style="position:relative; width:140px; height:140px; border-radius:50%; background:linear-gradient(135deg, #2563EB, #60A5FA); display:flex; align-items:center; justify-content:center; box-shadow:0 12px 32px rgba(37,99,235,0.3); border:4px solid #ffffff; overflow:visible;">
          ${avatar ? `
            <img src="${avatar}" id="avatar-img-preview" alt="Avatar" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">
          ` : `
            <span class="material-symbols-rounded" id="avatar-icon-placeholder" style="font-size:84px; color:#ffffff;">person</span>
          `}
          <!-- Camera badge button -->
          <label for="avatar-file-input" style="position:absolute; bottom:4px; right:4px; width:40px; height:40px; background:#2563EB; border:3px solid #ffffff; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; box-shadow:0 4px 12px rgba(0,0,0,0.2); transition:transform 0.2s;" title="Unggah Foto Avatar">
            <span class="material-symbols-rounded" style="font-size:22px; color:#ffffff;">photo_camera</span>
          </label>
          <input type="file" id="avatar-file-input" accept="image/*" style="display:none;" onchange="handleAvatarUpload(event)">
        </div>
        <label for="avatar-file-input" style="font-size:0.9rem; font-weight:750; color:#2563EB; margin-top:12px; cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:18px;">upload</span>
          <span>Unggah Foto</span>
        </label>
      </div>

      <!-- Name Input -->
      <div style="margin-bottom:var(--space-xl);">
        <label style="font-size:0.875rem; font-weight:600; color:var(--text-secondary); display:block; margin-bottom:var(--space-sm);">Nama (opsional)</label>
        <div style="display:flex; gap:var(--space-sm);">
          <input type="text" class="input" id="profil-name" value="${escapeHTML(name)}" placeholder="Masukkan namamu..." style="flex:1;">
          <button class="btn btn-primary btn-sm" onclick="saveName()">Simpan</button>
        </div>
      </div>

      <!-- Profile Badges & Stats -->
      <div style="display:flex; flex-direction:column; gap:var(--space-md); margin-bottom:var(--space-2xl);">
        <div style="display:flex; align-items:center; gap:var(--space-md);">
          <span class="material-symbols-rounded text-primary" style="font-size:28px;">${iconName}</span>
          <div>
            <div style="font-weight:600; color:var(--text-on-white);">${result.name}</div>
            <div style="font-size:var(--caption-size); color:var(--text-secondary);">Gaya Refleksi</div>
          </div>
        </div>
        ${kenaliResult ? `
          <div style="display:flex; align-items:center; gap:var(--space-md);">
            <span class="material-symbols-rounded text-primary" style="font-size:28px;">${kenaliResult.icon || 'psychology'}</span>
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

      <!-- Notification & Reminder Section -->
      <div style="border-top:1px solid rgba(0,0,0,0.06); padding-top:var(--space-lg);">
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:var(--space-md);">
          <div style="display:flex; align-items:center; gap:8px; font-weight:750; color:var(--text-on-white);">
            <span class="material-symbols-rounded text-primary" style="font-size:22px;">notifications</span>
            <span>Pemberitahuan & Pengingat</span>
          </div>
          <span style="font-size:0.75rem; font-weight:700; background:rgba(37,99,235,0.1); color:#2563EB; padding:2px 10px; border-radius:99px;">Aktif</span>
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <!-- Item 1: Streak -->
          <div style="display:flex; align-items:flex-start; gap:12px; padding:12px 14px; background:var(--card-subtle, #F8FAFC); border-radius:14px; border:1px solid rgba(0,0,0,0.04);">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(245,158,11,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span class="material-symbols-rounded" style="color:#D97706; font-size:20px;">local_fire_department</span>
            </div>
            <div>
              <div style="font-weight:750; font-size:0.875rem; color:var(--text-on-white);">1 Hari Berturut-turut!</div>
              <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">Pertahankan ritme refleksi harianmu untuk menjaga kejernihan pikiran.</div>
            </div>
          </div>

          <!-- Item 2: Mood Check-in -->
          <div style="display:flex; align-items:flex-start; gap:12px; padding:12px 14px; background:var(--card-subtle, #F8FAFC); border-radius:14px; border:1px solid rgba(0,0,0,0.04);">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(16,185,129,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span class="material-symbols-rounded" style="color:#059669; font-size:20px;">task_alt</span>
            </div>
            <div>
              <div style="font-weight:750; font-size:0.875rem; color:var(--text-on-white);">Check-in Mood Tersimpan</div>
              <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">Kamu telah mencatat emosimu hari ini. Terima kasih telah jujur pada diri sendiri!</div>
            </div>
          </div>

          <!-- Item 3: Journal -->
          <div style="display:flex; align-items:flex-start; gap:12px; padding:12px 14px; background:var(--card-subtle, #F8FAFC); border-radius:14px; border:1px solid rgba(0,0,0,0.04);">
            <div style="width:36px; height:36px; border-radius:10px; background:rgba(139,92,246,0.15); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
              <span class="material-symbols-rounded" style="color:#7C3AED; font-size:20px;">edit_note</span>
            </div>
            <div>
              <div style="font-weight:750; font-size:0.875rem; color:var(--text-on-white);">Jurnal Hari Ini Masih Kosong</div>
              <div style="font-size:0.78rem; color:var(--text-secondary); margin-top:2px;">Tuangkan pikiran atau ceritakan harimu di Ruang Jurnal.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function handleAvatarUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (file.size > 5 * 1024 * 1024) {
    if (typeof Animations !== 'undefined') Animations.showToast('Ukuran foto maksimal 5MB', 'warning');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const base64 = event.target.result;
    if (typeof Storage !== 'undefined' && Storage.setUserAvatar) {
      Storage.setUserAvatar(base64);
    }
    if (typeof Main !== 'undefined' && Main.updateHeaderAvatar) {
      Main.updateHeaderAvatar();
    }
    if (typeof Animations !== 'undefined') {
      Animations.showToast('Foto profil berhasil diperbarui!', 'success');
    }
    const existing = Storage.getQuizResult('profil');
    const resultData = profilData && existing ? profilData.results[existing.type] : { name: 'Refleksi Diri', icon: 'tune' };
    renderProfileCard(existing ? existing.type : 'malam', resultData);
  };
  reader.readAsDataURL(file);
}

// ---- Save Name ----
function saveName() {
  const input = document.getElementById('profil-name');
  if (input) {
    Storage.setUserName(input.value.trim());
    Animations.showToast('Nama tersimpan!', 'success');
  }
}

window.showShareResultModal = function (title, emoji) {
  const modal = document.getElementById('share-result-modal');
  if (modal) {
    document.getElementById('share-result-title').textContent = title;
    if (emoji && document.getElementById('share-result-emoji')) {
      document.getElementById('share-result-emoji').innerHTML = `<span class="material-symbols-rounded" style="font-size:3.5rem;">${emoji}</span>`;
    }
    modal.classList.add('active');
  }
};

window.simulateResultShare = function () {
  if (typeof Animations !== 'undefined') {
    Animations.showToast('Memproses gambar...', 'info');
  }
  setTimeout(() => {
    const modal = document.getElementById('share-result-modal');
    if (modal) modal.classList.remove('active');
    if (typeof Animations !== 'undefined') {
      Animations.showToast('Hasil berhasil dibagikan', 'success');
    }
  }, 1500);
};
