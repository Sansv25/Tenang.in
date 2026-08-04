/* =============================================
   Tenang.in — Teman Chat (Decision Tree)
   ============================================= */

const TemanChat = (() => {
  let decisionData = null;
  let chatContainer = null;
  let isOpen = false;

  // ---- Load Decision Tree ----
  const loadDecisions = async () => {
    try {
      const res = await fetch('assets/data/decisions.json');
      decisionData = await res.json();
    } catch (e) {
      console.error('Failed to load decisions:', e);
    }
  };

  // ---- Get Context-Aware Greeting ----
  const getGreeting = () => {
    if (!decisionData) return (typeof I18n !== 'undefined') ? I18n.t('teman.greeting') : 'Hai! Aku Teman';
    const mood = Storage.getMoodToday();
    const initial = decisionData.initial;

    if (!mood) return initial.greeting_default;
    if (mood.level >= 4) return initial.greeting_happy;
    if (mood.level <= 2) return initial.greeting_sad;
    return initial.greeting_neutral;
  };

  // ---- Build Chat UI ----
  const createChatUI = () => {
    // Floating button
    const floatingDiv = document.createElement('div');
    floatingDiv.className = 'teman-floating';
    floatingDiv.id = 'teman-floating';
    floatingDiv.innerHTML = `
      <button class="teman-btn" id="teman-toggle-btn" aria-label="Chat dengan Teman">
        <span class="material-symbols-rounded" style="font-size:28px;">smart_toy</span>
      </button>
    `;
    document.body.appendChild(floatingDiv);

    // Chat popup
    const chatDiv = document.createElement('div');
    chatDiv.className = 'teman-chat';
    chatDiv.id = 'teman-chat';
    chatDiv.innerHTML = `
      <div class="teman-chat-header">
        <div class="teman-chat-header-info">
          <div class="teman-avatar-sm">
            <span class="material-symbols-rounded" style="font-size:20px; color:white;">smart_toy</span>
          </div>
          <div>
            <div style="font-weight:600;font-size:0.9375rem;">Teman</div>
            <div style="font-size:0.75rem;opacity:0.8;">AI Companion</div>
          </div>
        </div>
        <button class="modal-close" id="teman-close-btn" style="background:rgba(255,255,255,0.15);color:white;" aria-label="Tutup Chat">
          <span class="material-symbols-rounded" style="font-size:18px;">close</span>
        </button>
      </div>
      <div class="teman-chat-body" id="teman-chat-body"></div>
      <div class="chat-options" id="teman-chat-options"></div>
      <div class="teman-chat-input-bar">
        <button type="button" class="teman-input-btn" id="teman-voice-btn" aria-label="Input Suara dengan Web Speech" title="Bicara ke Teman (Voice-to-Text)">
          <span class="material-symbols-rounded" style="font-size:22px; color:var(--primary-accent);">mic</span>
        </button>
        <input type="text" class="teman-input-field" id="teman-text-input" placeholder="Pilih opsi di atas atau tekan mik..." readonly style="background:var(--card-subtle); color:var(--text-secondary); cursor:default;">
        <button type="button" class="teman-input-btn teman-send-btn" id="teman-send-btn" aria-label="Kirim pesan" disabled>
          <span class="material-symbols-rounded" style="font-size:22px;">send</span>
        </button>
      </div>
    `;
    document.body.appendChild(chatDiv);

    chatContainer = chatDiv;

    // Event listeners
    document.getElementById('teman-toggle-btn').addEventListener('click', toggle);
    document.getElementById('teman-close-btn').addEventListener('click', close);
  };

  // ---- Open Chat ----
  const open = () => {
    if (!chatContainer) return;
    chatContainer.classList.add('active');
    document.getElementById('teman-floating').style.display = 'none';
    isOpen = true;

    // Start conversation if empty
    const body = document.getElementById('teman-chat-body');
    if (body.children.length === 0) {
      startConversation();
    }
  };

  // ---- Close Chat ----
  const close = () => {
    if (!chatContainer) return;
    chatContainer.classList.remove('active');
    document.getElementById('teman-floating').style.display = 'block';
    isOpen = false;
  };

  // ---- Toggle Chat ----
  const toggle = () => {
    if (isOpen) close();
    else open();
  };

  // ---- Start Conversation ----
  const startConversation = () => {
    Storage.incrementTemanSessions();
    const greeting = getGreeting();
    addBubble(greeting, 'teman');
    showOptions('root');
  };

  // ---- Add Chat Bubble ----
  const addBubble = (text, sender = 'teman') => {
    const body = document.getElementById('teman-chat-body');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble chat-bubble-${sender}`;
    bubble.textContent = text;
    body.appendChild(bubble);
    body.scrollTop = body.scrollHeight;
  };

  // ---- Show Options ----
  const showOptions = (nodeId) => {
    if (!decisionData) return;
    const node = decisionData.tree[nodeId];
    if (!node) return;

    const optionsContainer = document.getElementById('teman-chat-options');
    optionsContainer.innerHTML = '';

    node.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'chat-option-btn';
      // Strip emoji from display text for cleaner horizontal layout
      btn.textContent = opt.text.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F900}-\u{1F9FF}\u{200D}\u{20E3}\u{E0020}-\u{E007F}]/gu, '').trim();
      btn.addEventListener('click', () => handleOptionClick(opt));
      optionsContainer.appendChild(btn);
    });
  };

  // ---- Handle Option Click ----
  const handleOptionClick = (option) => {
    // Add user's choice as bubble
    addBubble(option.text, 'user');

    // Clear options
    document.getElementById('teman-chat-options').innerHTML = '';

    const nextId = option.next;

    // Handle special navigation actions
    if (nextId.startsWith('_navigate_')) {
      const page = nextId.replace('_navigate_', '');
      const pages = {
        jurnal: 'jurnal.html',
        mood: 'mood-tracker.html',
        kenali: 'kenali.html',
        profil: 'profil.html'
      };
      setTimeout(() => {
        addBubble((typeof I18n !== 'undefined') ? I18n.t('teman.redirect') : 'Aku arahkan kamu ke sana ya!', 'teman');
        setTimeout(() => {
          window.location.href = pages[page] || 'beranda.html';
        }, 800);
      }, 500);
      return;
    }

    if (nextId === '_close') {
      setTimeout(() => close(), 800);
      return;
    }

    // Show next node
    setTimeout(() => {
      const node = decisionData.tree[nextId];
      if (node) {
        if (node.message) {
          addBubble(node.message, 'teman');
        }
        setTimeout(() => showOptions(nextId), 300);
      }
    }, 500);
  };

  // ---- Voice Input (Web Speech API with Defensive Fallback) ----
  const setupVoice = () => {
    const voiceBtn = document.getElementById('teman-voice-btn');
    if (!voiceBtn) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      voiceBtn.addEventListener('click', () => {
        if (typeof Animations !== 'undefined' && typeof Animations.showToast === 'function') {
          Animations.showToast('Maaf, peramban ini belum mendukung Web Speech API (Input Suara). Silakan pilih opsi obrolan di atas.', 'warning', 4500);
        }
      });
      voiceBtn.style.opacity = '0.6';
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    let isListening = false;

    voiceBtn.addEventListener('click', () => {
      if (isListening) {
        try { recognition.stop(); } catch(e) {}
        return;
      }
      try {
        recognition.start();
        isListening = true;
        voiceBtn.innerHTML = `<span class="material-symbols-rounded animate-pulse" style="font-size:22px; color:#EF4444;">mic</span>`;
        if (typeof Animations !== 'undefined' && typeof Animations.showToast === 'function') {
          Animations.showToast('Mendengarkan... Katakan perasaan atau ceritamu!', 'info', 3500);
        }
      } catch (e) {
        isListening = false;
        if (typeof Animations !== 'undefined' && typeof Animations.showToast === 'function') {
          Animations.showToast('Gagal mengaktifkan mikrofon atau sesi masih berjalan.', 'warning');
        }
      }
    });

    recognition.onresult = (event) => {
      isListening = false;
      voiceBtn.innerHTML = `<span class="material-symbols-rounded" style="font-size:22px; color:var(--primary-accent);">mic</span>`;
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        const cleanText = typeof window.escapeHTML === 'function' ? window.escapeHTML(transcript) : transcript;
        addBubble(`(Suara): ${cleanText}`, 'user');
        setTimeout(() => {
          addBubble('Terimakasih sudah berbagi cerita secara langsung lewat suara! Agar Teman bisa mendampingimu dengan tepat, silakan pilih opsi refleksi di atas ya.', 'teman');
        }, 600);
      }
    };

    recognition.onerror = () => {
      isListening = false;
      voiceBtn.innerHTML = `<span class="material-symbols-rounded" style="font-size:22px; color:var(--primary-accent);">mic</span>`;
      if (typeof Animations !== 'undefined' && typeof Animations.showToast === 'function') {
        Animations.showToast('Suara tidak terdengar atau izin mikrofon belum dikonfirmasi peramban.', 'warning');
      }
    };

    recognition.onend = () => {
      isListening = false;
      voiceBtn.innerHTML = `<span class="material-symbols-rounded" style="font-size:22px; color:var(--primary-accent);">mic</span>`;
    };
  };

  // ---- Reset Conversation ----
  const reset = () => {
    const body = document.getElementById('teman-chat-body');
    const options = document.getElementById('teman-chat-options');
    if (body) body.innerHTML = '';
    if (options) options.innerHTML = '';
    startConversation();
  };

  // ---- Init ----
  const init = async () => {
    await loadDecisions();
    createChatUI();
    setupVoice();
  };

  return { init, open, close, toggle, reset };
})();
