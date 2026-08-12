/* =============================================
   Tenang.in — Jurnal Script
   ============================================= */

let jurnalTags = [];
let currentPrompt = '';

document.addEventListener('DOMContentLoaded', async () => {
  await Main.initPage('jurnal');
  loadPrompt();
  renderJournalList();
  setupCharCounter();
});

// ---- Load Daily Prompt ----
async function loadPrompt() {
  const promptEl = document.getElementById('jurnal-prompt');
  if (!promptEl) return;

  try {
    const res = await fetch('assets/data/prompts.json');
    const prompts = await res.json();

    // Pick prompt based on date + mood context
    const mood = Storage.getMoodToday();
    let filtered = prompts;

    if (mood) {
      const moodContext = mood.level <= 2 ? 'sad' : mood.level >= 4 ? 'happy' : 'neutral';
      filtered = prompts.filter(p =>
        p.mood_context.includes('all') || p.mood_context.includes(moodContext)
      );
    }

    const dayIndex = new Date().getDate() % filtered.length;
    const prompt = filtered[dayIndex];
    currentPrompt = prompt.text;

    promptEl.innerHTML = `
      <div class="card" style="padding:var(--space-lg); border-left:4px solid var(--primary-accent);">
        <div style="font-size:0.8125rem; font-weight:600; color:var(--primary-accent); margin-bottom:var(--space-xs); display:flex; align-items:center; gap:8px;">
          <img src="assets/img/maskots/mascot-confused.png" alt="Milo Reflecting" style="width:24px; height:24px; object-fit:contain;">
          <span>Prompt Hari Ini</span>
        </div>
        <p style="font-size:1.0625rem; font-weight:500; line-height:1.6; color:var(--text-on-white);">${prompt.text}</p>
      </div>
    `;
  } catch(e) {
    currentPrompt = 'Apa yang ada di pikiranmu hari ini?';
    promptEl.innerHTML = `
      <div class="card" style="padding:var(--space-lg); border-left:4px solid var(--primary-accent);">
        <p style="font-size:1.0625rem; color:var(--text-on-white);">Apa yang ada di pikiranmu hari ini?</p>
      </div>
    `;
  }
}

// ---- Change Prompt Category ----
async function changePromptCategory(category) {
  document.getElementById('prompt-category-modal').classList.remove('active');
  const promptEl = document.getElementById('jurnal-prompt');
  
  try {
    const res = await fetch('assets/data/prompts.json');
    const prompts = await res.json();
    
    let filtered = prompts;
    if (category === 'gratitude') {
      filtered = prompts.filter(p => p.mood_context.includes('happy') || p.text.toLowerCase().includes('syukur') || p.text.toLowerCase().includes('terbaik'));
    } else if (category === 'stress') {
      filtered = prompts.filter(p => p.mood_context.includes('sad') || p.text.toLowerCase().includes('beban') || p.text.toLowerCase().includes('stres'));
    } else if (category === 'discovery') {
      filtered = prompts.filter(p => p.mood_context.includes('neutral') || p.text.toLowerCase().includes('pelajaran') || p.text.toLowerCase().includes('tujuan'));
    }
    
    if (filtered.length === 0) filtered = prompts; // fallback
    
    const randomIdx = Math.floor(Math.random() * filtered.length);
    const prompt = filtered[randomIdx];
    currentPrompt = prompt.text;
    
    promptEl.innerHTML = `
      <div class="card" style="padding:var(--space-lg); border-left:4px solid var(--primary-accent); animation: bubbleIn 0.3s ease-out forwards;">
        <div style="font-size:0.8125rem; font-weight:600; color:var(--primary-accent); margin-bottom:var(--space-xs); display:flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:18px;">lightbulb</span>
          <span>Prompt Baru (${category})</span>
        </div>
        <p style="font-size:1.0625rem; font-weight:500; line-height:1.6; color:var(--text-on-white);">${prompt.text}</p>
      </div>
    `;
  } catch (e) {
    console.error("Failed to change prompt", e);
  }
}

// ---- Character Counter ----
function setupCharCounter() {
  const textarea = document.getElementById('jurnal-content');
  const counter = document.getElementById('char-counter');
  if (!textarea || !counter) return;

  textarea.addEventListener('input', () => {
    const text = textarea.value.trim();
    const len = textarea.value.length;
    const words = text ? text.split(/\s+/).length : 0;
    counter.textContent = `${words} kata | ${len} karakter`;
  });
}

// ---- Tag Toggle ----
function toggleJurnalTag(tag, btn) {
  const idx = jurnalTags.indexOf(tag);
  if (idx >= 0) {
    jurnalTags.splice(idx, 1);
    btn.classList.remove('selected');
  } else {
    jurnalTags.push(tag);
    btn.classList.add('selected');
  }
}

// ---- Save Journal ----
function saveJurnal() {
  const content = document.getElementById('jurnal-content')?.value?.trim();
  if (!content) {
    Animations.showToast('Tulis sesuatu dulu ya!', 'warning');
    return;
  }

  if (content.length < 10) {
    Animations.showToast('Ceritakan sedikit lebih banyak...', 'warning');
    return;
  }

  Storage.saveJournal({
    prompt: currentPrompt,
    content: content,
    tags: jurnalTags,
    moodLevel: Storage.getMoodToday()?.level || null
  });

  // Reset form
  document.getElementById('jurnal-content').value = '';
  document.getElementById('char-counter').textContent = '0 kata | 0 karakter';
  jurnalTags = [];
  document.querySelectorAll('#jurnal-tags .tag-chip').forEach(b => b.classList.remove('selected'));

  document.getElementById('jurnal-success-modal').classList.add('active');
  Animations.checkAchievements();
  renderJournalList();
}

// ---- Render Journal List ----
function renderJournalList() {
  const listEl = document.getElementById('jurnal-list');
  if (!listEl) return;

  const journals = Storage.getJournals().reverse();

  if (journals.length === 0) {
    listEl.innerHTML = `
      <div class="card p-8 text-center border-2 border-dashed rounded-2xl my-4" style="border-color:#7EC8E3; background:linear-gradient(180deg, #FFFFFF 0%, #F0F5FF 100%);">
        <div class="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center shadow-md" style="background:#5B8FD4;">
          <span class="material-symbols-rounded" style="font-size:36px; color:#FFFFFF;">auto_stories</span>
        </div>
        <h3 class="font-bold text-lg mb-2" style="color:#1A2F4E;">Ruang Jurnalmu Masih Kosong</h3>
        <p class="text-sm max-w-sm mx-auto mb-6 leading-relaxed" style="color:#6B8DB5;">
          Hari ini bisa menjadi lembaran barumu. Tuangkan pikiran, kecemasan, atau rasa syukurmu dengan nyaman dan privat.
        </p>
        <button onclick="const el = document.getElementById('jurnal-content'); if(el) { el.focus(); el.scrollIntoView({behavior:'smooth'}); }" class="btn btn-primary inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold shadow-md hover:opacity-95 transition" style="background:#2D5BA8; color:#FFFFFF;">
          <span class="material-symbols-rounded" style="font-size:18px;">edit_note</span>
          <span>Tulis Refleksi Pertama</span>
        </button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = journals.map(j => {
    const date = new Date(j.timestamp);
    const dateStr = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    return `
      <div class="journal-entry" onclick="openJournal(${j.id})">
        <div class="flex items-center justify-between">
          <span class="journal-date">${dateStr} · ${timeStr}</span>
          <button class="btn btn-ghost btn-sm" onclick="event.stopPropagation(); confirmDeleteJournal(${j.id})" style="color:var(--text-muted); padding:4px;" aria-label="Hapus Jurnal">
            <span class="material-symbols-rounded" style="font-size:18px;">delete</span>
          </button>
        </div>
        ${j.prompt ? `<p style="font-size:0.75rem; color:var(--primary-accent); margin-top:var(--space-xs); font-style:italic;">Prompt: ${escapeHTML(j.prompt.substring(0, 60))}...</p>` : ''}
        <p class="journal-preview">${escapeHTML(j.content)}</p>
        ${j.tags.length ? `<div class="journal-tags">${j.tags.map(t => `<span class="journal-tag">${escapeHTML(t)}</span>`).join('')}</div>` : ''}
      </div>
    `;
  }).join('');
}

// ---- Open Journal Full ----
function openJournal(id) {
  const journals = Storage.getJournals();
  const journal = journals.find(j => j.id === id);
  if (!journal) return;

  const date = new Date(journal.timestamp);
  const dateStr = date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const modal = document.getElementById('jurnal-read-modal');
  document.getElementById('jurnal-read-date').textContent = dateStr;
  document.getElementById('jurnal-read-prompt').textContent = journal.prompt || '';
  document.getElementById('jurnal-read-prompt').style.display = journal.prompt ? 'block' : 'none';
  document.getElementById('jurnal-read-content').textContent = journal.content;

  const tagsEl = document.getElementById('jurnal-read-tags');
  tagsEl.innerHTML = journal.tags.map(t => `<span class="journal-tag">${typeof window.escapeHTML === 'function' ? window.escapeHTML(t) : t}</span>`).join('');
  modal.classList.add('active');
}

function closeJurnalModal() {
  document.getElementById('jurnal-read-modal')?.classList.remove('active');
}

// ---- Delete Journal ----
function confirmDeleteJournal(id) {
  const modal = document.getElementById('delete-confirm-modal');
  if (!modal) return;
  modal.dataset.deleteId = id;
  modal.classList.add('active');
}

function cancelDelete() {
  document.getElementById('delete-confirm-modal')?.classList.remove('active');
}

function executeDelete() {
  const modal = document.getElementById('delete-confirm-modal');
  const id = parseInt(modal?.dataset.deleteId);
  if (id) {
    Storage.deleteJournal(id);
    Animations.showToast('Jurnal dihapus', 'info');
    renderJournalList();
  }
  modal?.classList.remove('active');
}

// ---- Bakar Beban (3D Realistic Symbolic Catharsis) ----
let fireAnimId = null;

function runFireCanvasEngine(canvas) {
  if (fireAnimId) cancelAnimationFrame(fireAnimId);
  const ctx = canvas.getContext('2d');
  const width = canvas.width = canvas.parentElement.offsetWidth || 600;
  const height = canvas.height = canvas.parentElement.offsetHeight || 380;
  
  const particles = [];
  const sparks = [];
  let isActive = true;

  function addParticle() {
    const spread = Math.min(width, 480) * 0.8;
    const x = width / 2 + (Math.random() - 0.5) * spread;
    const y = height * 0.88 + Math.random() * 15;
    const radius = 30 + Math.random() * 40;
    const life = 1;
    const decay = 0.018 + Math.random() * 0.015;
    const vx = (Math.random() - 0.5) * 2;
    const vy = -(3.5 + Math.random() * 4.5);
    particles.push({ x, y, radius, life, decay, vx, vy });
  }

  function addSpark() {
    const spread = Math.min(width, 480) * 0.9;
    const x = width / 2 + (Math.random() - 0.5) * spread;
    const y = height * 0.88;
    const size = 2 + Math.random() * 3.5;
    const life = 1;
    const decay = 0.012 + Math.random() * 0.015;
    const vx = (Math.random() - 0.5) * 4;
    const vy = -(5 + Math.random() * 6);
    sparks.push({ x, y, size, life, decay, vx, vy });
  }

  const startTime = Date.now();

  function loop() {
    if (!isActive) return;
    ctx.clearRect(0, 0, width, height);

    const elapsed = (Date.now() - startTime) / 1000;

    if (elapsed < 3.4) {
      for (let i = 0; i < 7; i++) addParticle();
      for (let i = 0; i < 4; i++) addSpark();
    }

    ctx.globalCompositeOperation = 'lighter';
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.radius *= 0.98;
      p.life -= p.decay;

      if (p.life <= 0 || p.radius < 2) {
        particles.splice(i, 1);
        continue;
      }

      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      if (p.life > 0.65) {
        grad.addColorStop(0, `rgba(255, 250, 200, ${p.life})`);
        grad.addColorStop(0.3, `rgba(255, 160, 40, ${p.life * 0.9})`);
        grad.addColorStop(0.7, `rgba(235, 50, 15, ${p.life * 0.6})`);
        grad.addColorStop(1, 'rgba(100, 5, 0, 0)');
      } else {
        grad.addColorStop(0, `rgba(255, 120, 20, ${p.life * 0.8})`);
        grad.addColorStop(0.5, `rgba(180, 25, 10, ${p.life * 0.5})`);
        grad.addColorStop(1, 'rgba(40, 5, 5, 0)');
      }

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.x += s.vx + Math.sin(s.y * 0.05) * 0.8;
      s.y += s.vy;
      s.life -= s.decay;

      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }

      ctx.fillStyle = `rgba(255, 210, 90, ${s.life})`;
      ctx.shadowColor = '#F97316';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    ctx.globalCompositeOperation = 'source-over';

    if (elapsed < 4.2 || particles.length > 0 || sparks.length > 0) {
      fireAnimId = requestAnimationFrame(loop);
    } else {
      isActive = false;
      ctx.clearRect(0, 0, width, height);
    }
  }

  loop();
}

window.simulateBurn = function() {
  const input = document.getElementById('burn-input');
  const paper = document.getElementById('burn-paper');
  const stage3D = document.getElementById('burn-3d-stage');
  const paperCard = document.getElementById('realistic-paper-card');
  const cardContent = document.getElementById('paper-card-content');
  const badge = document.getElementById('card-ignite-badge');
  const statusEl = document.getElementById('burn-stage-status');
  const msg = document.getElementById('burn-success-msg');

  if (!input || !input.value.trim()) {
    if (typeof Animations !== 'undefined') {
      Animations.showToast('Tuliskan dahulu beban atau kecemasanmu sebelum dibakar.', 'info');
    }
    return;
  }

  const text = input.value.trim();
  if (cardContent) cardContent.textContent = `"${text}"`;
  if (paperCard) {
    paperCard.classList.remove('is-burning');
    paperCard.style.pointerEvents = 'auto';
  }
  if (statusEl) {
    statusEl.innerHTML = `
      <span class="material-symbols-rounded" style="color:#F59E0B; font-size:18px;">touch_app</span>
      Klik pada kartu di atas untuk menyalakan api katarsis dan membakarnya
    `;
  }

  if (paper && stage3D) {
    paper.style.opacity = '0';
    paper.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
      paper.style.display = 'none';
      stage3D.style.display = 'block';
      void stage3D.offsetWidth;
      stage3D.style.opacity = '1';
      stage3D.style.transform = 'translateY(0)';
    }, 400);
  }
};

window.igniteCardFire = function() {
  const stage3D = document.getElementById('burn-3d-stage');
  const paperCard = document.getElementById('realistic-paper-card');
  const canvas = document.getElementById('fire-canvas');
  const statusEl = document.getElementById('burn-stage-status');
  const msg = document.getElementById('burn-success-msg');
  const input = document.getElementById('burn-input');

  if (!paperCard || paperCard.classList.contains('is-burning')) return;

  paperCard.classList.add('is-burning');

  if (statusEl) {
    statusEl.innerHTML = `
      <span class="material-symbols-rounded animate-bounce" style="color:#EF4444; font-size:18px;">local_fire_department</span>
      Api berkobar! Memusnahkan beban dan amarahmu menjadi abu...
    `;
  }

  if (canvas) runFireCanvasEngine(canvas);

  setTimeout(() => {
    if (stage3D) {
      stage3D.style.opacity = '0';
      stage3D.style.transform = 'translateY(-15px)';
    }
    setTimeout(() => {
      if (stage3D) stage3D.style.display = 'none';
      if (input) input.value = '';
      if (paperCard) paperCard.classList.remove('is-burning');

      if (msg) {
        msg.style.display = 'block';
        void msg.offsetWidth;
        msg.style.opacity = '1';
        msg.style.transform = 'translateY(0)';
      }
    }, 450);
  }, 4200);
};

window.resetBurn = function() {
  const paper = document.getElementById('burn-paper');
  const stage3D = document.getElementById('burn-3d-stage');
  const msg = document.getElementById('burn-success-msg');

  if (msg && msg.style.display !== 'none') {
    msg.style.opacity = '0';
    msg.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      msg.style.display = 'none';
      if (stage3D) stage3D.style.display = 'none';
      if (paper) {
        paper.style.display = 'block';
        void paper.offsetWidth;
        paper.style.opacity = '1';
        paper.style.transform = 'translateY(0)';
      }
    }, 400);
  } else {
    if (stage3D) stage3D.style.display = 'none';
    if (paper) {
      paper.style.display = 'block';
      paper.style.opacity = '1';
      paper.style.transform = 'translateY(0)';
    }
  }
};
