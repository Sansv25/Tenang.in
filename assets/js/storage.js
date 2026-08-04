/* =============================================
   Tenang.in — Mood Context Engine (storage.js)
   Central data layer for all pages
   ============================================= */

const Storage = (() => {
  // ---- Helpers ----
  const getJSON = (key, fallback = null) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch { return fallback; }
  };

  const setJSON = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const todayKey = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const daysBetween = (d1, d2) => {
    const oneDay = 86400000;
    return Math.round(Math.abs((new Date(d1) - new Date(d2)) / oneDay));
  };

  // ---- Mood Functions ----
  const getMoods = () => getJSON('tenang_moods', []);

  const saveMood = (data) => {
    const moods = getMoods();
    const entry = {
      date: todayKey(),
      timestamp: Date.now(),
      level: data.level,       // 1-5
      tags: data.tags || [],
      note: data.note || ''
    };
    // Replace if exists for today
    const idx = moods.findIndex(m => m.date === todayKey());
    if (idx >= 0) moods[idx] = entry;
    else moods.push(entry);
    setJSON('tenang_moods', moods);
    return entry;
  };

  const getMoodToday = () => {
    const moods = getMoods();
    return moods.find(m => m.date === todayKey()) || null;
  };

  const getMoodHistory = (n = 7) => {
    const moods = getMoods();
    return moods.slice(-n);
  };

  const getMoodAverage = (n = 7) => {
    const history = getMoodHistory(n);
    if (history.length === 0) return 0;
    const sum = history.reduce((a, m) => a + m.level, 0);
    return Math.round((sum / history.length) * 10) / 10;
  };

  const getDominantTag = () => {
    const moods = getMoods().filter(m => m.level <= 2);
    const tagCount = {};
    moods.forEach(m => {
      (m.tags || []).forEach(t => {
        tagCount[t] = (tagCount[t] || 0) + 1;
      });
    });
    let maxTag = null, maxCount = 0;
    for (const [tag, count] of Object.entries(tagCount)) {
      if (count > maxCount) { maxTag = tag; maxCount = count; }
    }
    return maxTag;
  };

  const isFirstVisitToday = () => {
    return !getMoodToday();
  };

  // ---- Streak ----
  const getStreak = () => {
    const moods = getMoods();
    if (moods.length === 0) return 0;

    const sortedDates = [...new Set(moods.map(m => m.date))].sort().reverse();
    let streak = 0;
    let checkDate = new Date();

    for (const dateStr of sortedDates) {
      const expected = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
      if (dateStr === expected) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  // ---- Journal ----
  const getJournals = () => getJSON('tenang_journals', []);

  const saveJournal = (data) => {
    const journals = getJournals();
    const entry = {
      id: Date.now(),
      date: todayKey(),
      timestamp: Date.now(),
      prompt: data.prompt || '',
      content: data.content,
      tags: data.tags || [],
      moodLevel: data.moodLevel || null
    };
    journals.push(entry);
    setJSON('tenang_journals', journals);
    return entry;
  };

  const deleteJournal = (id) => {
    const journals = getJournals().filter(j => j.id !== id);
    setJSON('tenang_journals', journals);
  };

  const getJournalCount = () => getJournals().length;

  // ---- Quiz Results ----
  const saveQuizResult = (type, result) => {
    // type = 'kenali' or 'profil'
    setJSON(`tenang_quiz_${type}`, {
      ...result,
      completedAt: Date.now()
    });
  };

  const getQuizResult = (type) => {
    return getJSON(`tenang_quiz_${type}`, null);
  };

  // ---- User Profile ----
  const getUserType = () => {
    const profil = getQuizResult('profil');
    return profil ? profil.type : null;
  };

  const getKenaliType = () => {
    const kenali = getQuizResult('kenali');
    return kenali ? kenali.type : null;
  };

  const setUserName = (name) => {
    localStorage.setItem('tenang_username', name);
  };

  const getUserName = () => {
    return localStorage.getItem('tenang_username') || '';
  };

  // ---- First Time Journey ----
  const isNewUser = () => {
    return !localStorage.getItem('tenang_isReturning');
  };

  const setReturning = () => {
    localStorage.setItem('tenang_isReturning', 'true');
  };

  // ---- Teman Chat Sessions ----
  const incrementTemanSessions = () => {
    const count = parseInt(localStorage.getItem('tenang_teman_sessions') || '0');
    localStorage.setItem('tenang_teman_sessions', String(count + 1));
  };

  const getTemanSessions = () => {
    return parseInt(localStorage.getItem('tenang_teman_sessions') || '0');
  };

  // ---- Badges ----
  const getBadges = () => {
    const streak = getStreak();
    const journalCount = getJournalCount();
    const hasProfil = !!getQuizResult('profil');
    const hasKenali = !!getQuizResult('kenali');
    const moodCount = getMoods().length;

    return [
      {
        id: 'first_step',
        icon: 'eco',
        name: 'Langkah Pertama',
        description: 'Check-in mood pertama kali',
        earned: moodCount >= 1
      },
      {
        id: 'streak_3',
        icon: 'local_fire_department',
        name: '3 Hari Berturut',
        description: 'Check-in 3 hari berturut-turut',
        earned: streak >= 3
      },
      {
        id: 'streak_7',
        icon: 'star',
        name: '7 Hari Konsisten',
        description: 'Check-in 7 hari berturut-turut',
        earned: streak >= 7
      },
      {
        id: 'writer_beginner',
        icon: 'edit_note',
        name: 'Penulis Pemula',
        description: 'Menulis 5 jurnal',
        earned: journalCount >= 5
      },
      {
        id: 'writer_active',
        icon: 'auto_stories',
        name: 'Penulis Aktif',
        description: 'Menulis 15 jurnal',
        earned: journalCount >= 15
      },
      {
        id: 'profil_done',
        icon: 'tune',
        name: 'Sudah Kenal Diri',
        description: 'Menyelesaikan profil',
        earned: hasProfil
      },
      {
        id: 'kenali_done',
        icon: 'psychology',
        name: 'Sudah Kenali Dirimu',
        description: 'Menyelesaikan kuis Kenali Dirimu',
        earned: hasKenali
      }
    ];
  };

  // ---- Time Capsules (Pesan untuk Masa Depan) ----
  const getTimeCapsules = () => getJSON('tenang_time_capsules', []);

  const saveTimeCapsule = (message) => {
    const capsules = getTimeCapsules();
    capsules.push({ id: Date.now(), message, date: todayKey() });
    setJSON('tenang_time_capsules', capsules);
  };

  const getRandomCapsule = () => {
    const capsules = getTimeCapsules();
    if (capsules.length === 0) return null;
    return capsules[Math.floor(Math.random() * capsules.length)];
  };

  // ---- Data Reset (for testing) ----
  const resetAll = () => {
    const keys = ['tenang_moods', 'tenang_journals', 'tenang_quiz_kenali', 'tenang_quiz_profil',
      'tenang_username', 'tenang_isReturning', 'tenang_teman_sessions', 'tenang_time_capsules'];
    keys.forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  };

  return {
    getMoods, saveMood, getMoodToday, getMoodHistory, getMoodAverage,
    getDominantTag, isFirstVisitToday, getStreak,
    getJournals, saveJournal, deleteJournal, getJournalCount,
    saveQuizResult, getQuizResult, getUserType, getKenaliType,
    setUserName, getUserName,
    isNewUser, setReturning,
    incrementTemanSessions, getTemanSessions,
    getTimeCapsules, saveTimeCapsule, getRandomCapsule,
    getBadges, resetAll, todayKey
  };
})();
