/* =============================================
   Tenang.in | Voice Orb Module
   Lingkaran AI animasi saat tombol mic dipencet
   ============================================= */

const VoiceOrb = (() => {
  let overlayEl = null;
  let orbCircle = null;
  let statusLabel = null;
  let isActive = false;
  let recognition = null;
  let isListening = false;

  // ---- Build Overlay DOM ----
  const buildOverlay = () => {
    console.log('[VoiceOrb] buildOverlay dipanggil');
    if (document.getElementById('voice-orb-overlay')) {
      console.log('[VoiceOrb] overlay sudah ada, skip');
      return;
    }

    overlayEl = document.createElement('div');
    overlayEl.className = 'voice-orb-overlay';
    overlayEl.id = 'voice-orb-overlay';
    overlayEl.innerHTML = `
      <!-- Top Controls -->
      <div class="voice-orb-top">
        <button class="voice-orb-menu-btn" id="voice-orb-back-btn" aria-label="Kembali ke Chat">
          <span class="material-symbols-rounded" style="font-size:22px;">arrow_back</span>
        </button>
        <button class="voice-orb-settings-btn" id="voice-orb-settings-btn" aria-label="Pengaturan Suara">
          <span class="material-symbols-rounded" style="font-size:22px;">tune</span>
        </button>
      </div>

      <!-- Orb Stage -->
      <div class="voice-orb-stage" id="voice-orb-stage">
        <!-- Ripple rings -->
        <div class="voice-orb-ripple" id="voice-orb-ripple-1"></div>
        <div class="voice-orb-ripple" id="voice-orb-ripple-2"></div>
        <div class="voice-orb-ripple" id="voice-orb-ripple-3"></div>
        <!-- Main orb -->
        <div class="voice-orb-circle" id="voice-orb-circle"></div>
      </div>

      <!-- Status -->
      <div class="voice-orb-status" id="voice-orb-status">Ketuk lingkaran untuk berbicara</div>

      <!-- Bottom Controls -->
      <div class="voice-orb-bottom">
        <button class="voice-orb-text-btn" id="voice-orb-text-btn" aria-label="Ketik pesan">
          <span class="material-symbols-rounded" style="font-size:18px;">keyboard</span>
          Tanya Teman
        </button>
        <button class="voice-orb-close-btn" id="voice-orb-close-btn" aria-label="Tutup mode suara">
          <span class="material-symbols-rounded" style="font-size:22px;">close</span>
        </button>
      </div>
    `;

    document.body.appendChild(overlayEl);

    orbCircle = document.getElementById('voice-orb-circle');
    statusLabel = document.getElementById('voice-orb-status');

    // Event: orb click → toggle listening
    orbCircle.addEventListener('click', toggleListening);

    // Event: back/close → close overlay
    document.getElementById('voice-orb-back-btn').addEventListener('click', close);
    document.getElementById('voice-orb-close-btn').addEventListener('click', close);

    // Event: text btn → close orb, focus chat
    document.getElementById('voice-orb-text-btn').addEventListener('click', () => {
      close();
      // re-open teman chat if TemanChat is available
      if (typeof TemanChat !== 'undefined') {
        TemanChat.open();
      }
    });
  };

  // ---- Open Orb Overlay ----
  const open = () => {
    console.log('[VoiceOrb] open() dipanggil, overlayEl:', overlayEl);
    if (!overlayEl) buildOverlay();
    overlayEl.classList.add('active');
    isActive = true;
    setStatus('Ketuk lingkaran untuk berbicara');
    orbCircle.classList.remove('listening', 'speaking');
    // hide ripples initially
    setRipplesVisible(false);
  };

  // ---- Close Orb Overlay ----
  const close = () => {
    stopListening();
    if (overlayEl) overlayEl.classList.remove('active');
    isActive = false;
  };

  // ---- Update Status Text ----
  const setStatus = (text) => {
    if (statusLabel) statusLabel.textContent = text;
  };

  // ---- Toggle Ripple Visibility ----
  const setRipplesVisible = (visible) => {
    ['voice-orb-ripple-1', 'voice-orb-ripple-2', 'voice-orb-ripple-3'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (visible) {
          el.classList.add('pulsing');
        } else {
          el.classList.remove('pulsing');
        }
      }
    });
  };

  // ---- Toggle Listening ----
  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  // ---- Start Listening (Web Speech API) ----
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      // Fallback: browser tidak support, tapi tetap tampilkan animasi demo
      setStatus('Mode demo — browser tidak mendukung suara');
      demoListeningAnimation();
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onstart = () => {
      isListening = true;
      orbCircle.classList.add('listening');
      orbCircle.classList.remove('speaking');
      setRipplesVisible(true);
      setStatus('Mendengarkan...');
    };

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setStatus(`"${transcript}"`);
      stopListeningState();
      setTimeout(() => {
        simulateSpeaking(transcript);
      }, 600);
    };

    recognition.onerror = (e) => {
      stopListeningState();
      if (e.error === 'not-allowed') {
        setStatus('Izin mikrofon ditolak');
      } else if (e.error === 'no-speech') {
        setStatus('Tidak ada suara terdeteksi');
      } else {
        setStatus('Ketuk lingkaran untuk berbicara');
      }
    };

    recognition.onend = () => {
      if (isListening) stopListeningState();
    };

    try {
      recognition.start();
    } catch (err) {
      stopListeningState();
    }
  };

  // ---- Stop Listening ----
  const stopListening = () => {
    if (recognition) {
      try { recognition.stop(); } catch (e) {}
      recognition = null;
    }
    stopListeningState();
  };

  const stopListeningState = () => {
    isListening = false;
    if (orbCircle) orbCircle.classList.remove('listening');
    setRipplesVisible(false);
  };

  // ---- Simulate AI Speaking ----
  const simulateSpeaking = (transcript) => {
    if (!isActive) return;
    orbCircle.classList.add('speaking');
    setStatus('Teman sedang berpikir...');
    setRipplesVisible(true);

    // Kirim ke TemanChat sebagai pesan text jika ada
    if (typeof TemanChat !== 'undefined' && transcript) {
      // Biarkan speaking state beberapa saat lalu tutup
      setTimeout(() => {
        orbCircle.classList.remove('speaking');
        setRipplesVisible(false);
        setStatus('Ketuk lingkaran untuk berbicara');
        // Tutup orb dan buka teman chat dengan pesan
        close();
        setTimeout(() => {
          if (typeof TemanChat !== 'undefined') {
            TemanChat.open();
            TemanChat.sendVoiceMessage(transcript);
          }
        }, 300);
      }, 1800);
    } else {
      setTimeout(() => {
        if (!isActive) return;
        orbCircle.classList.remove('speaking');
        setRipplesVisible(false);
        setStatus('Ketuk lingkaran untuk berbicara');
      }, 2500);
    }
  };

  // ---- Demo animation jika no SpeechRecognition support ----
  const demoListeningAnimation = () => {
    isListening = true;
    orbCircle.classList.add('listening');
    setRipplesVisible(true);
    setStatus('Mendengarkan...');

    setTimeout(() => {
      if (!isActive) return;
      stopListeningState();
      simulateSpeaking(null);
    }, 3000);
  };

  // ---- Init ----
  const init = () => {
    console.log('[VoiceOrb] init() dipanggil');
    buildOverlay();
  };

  return { init, open, close };
})();
