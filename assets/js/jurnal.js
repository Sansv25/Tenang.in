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
        <div style="font-size:0.8125rem; font-weight:600; color:var(--primary-accent); margin-bottom:var(--space-xs); display:flex; align-items:center; gap:6px;">
          <span class="material-symbols-rounded" style="font-size:18px;">lightbulb</span>
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

  Animations.showToast('Jurnal tersimpan!', 'success');
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
      <div class="empty-state card">
        <div class="empty-state-icon">
          <span class="material-symbols-rounded text-secondary" style="font-size:48px;">edit_note</span>
        </div>
        <p class="empty-state-text" style="color:var(--text-secondary);">Belum ada jurnal. Tulis refleksi pertamamu!</p>
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
        ${j.prompt ? `<p style="font-size:0.75rem; color:var(--primary-accent); margin-top:var(--space-xs); font-style:italic;">Prompt: ${j.prompt.substring(0, 60)}...</p>` : ''}
        <p class="journal-preview">${j.content}</p>
        ${j.tags.length ? `<div class="journal-tags">${j.tags.map(t => `<span class="journal-tag">${t}</span>`).join('')}</div>` : ''}
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
  tagsEl.innerHTML = journal.tags.map(t => `<span class="journal-tag">${t}</span>`).join('');

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
