/* =============================================
   Tenang.in — Custom SVG Chart Generator
   ============================================= */

const Charts = (() => {
  // ---- Mood Level to Color ----
  const moodColor = (level) => {
    const colors = {
      1: '#EF4444',
      2: '#F59E0B',
      3: '#EAB308',
      4: '#38BDF8',
      5: '#10B981'
    };
    return colors[level] || '#94A3B8';
  };

  const moodLabel = (level) => {
    const labels = { 1: 'Buruk', 2: 'Kurang', 3: 'Biasa', 4: 'Baik', 5: 'Sangat Baik' };
    return labels[level] || 'Biasa';
  };

  const moodEmoji = (level) => {
    const emojis = { 1: '<span class="material-symbols-rounded">sentiment_very_dissatisfied</span>', 2: '<span class="material-symbols-rounded">sentiment_dissatisfied</span>', 3: '<span class="material-symbols-rounded">sentiment_neutral</span>', 4: '<span class="material-symbols-rounded">sentiment_satisfied</span>', 5: '<span class="material-symbols-rounded">sentiment_very_satisfied</span>' };
    return emojis[level] || '<span class="material-symbols-rounded">sentiment_neutral</span>';
  };

  // ---- Line Chart (7 days) ----
  const createLineChart = (container, data, options = {}) => {
    const {
      width = 600,
      height = 205,
      padding = { top: 32, right: 42, bottom: 28, left: 38 },
      showDots = true,
      showArea = true,
      showLabels = true
    } = options;

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    if (!data || data.length === 0) {
      container.innerHTML = `
        <div class="empty-state" style="padding:var(--space-xl) var(--space-md);">
          <div class="empty-state-icon">
            <span class="material-symbols-rounded text-muted" style="font-size:38px;">bar_chart</span>
          </div>
          <p class="empty-state-text" style="color:var(--text-secondary); font-size:0.875rem;">Belum ada data mood. Mulai check-in hari ini!</p>
        </div>`;
      return;
    }

    // 1. Build map of existing moods by YYYY-MM-DD
    const moodMap = {};
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item && item.date) {
          moodMap[item.date] = item;
        }
      });
    }

    // 2. Generate last 7 consecutive calendar days (from 6 days ago up to today)
    const today = new Date();
    const daysShort = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const calendar7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const dayName = daysShort[d.getDay()];
      calendar7Days.push({
        colIndex: 6 - i, // 0..6
        date: dateKey,
        dayName: dayName,
        mood: moodMap[dateKey] || null
      });
    }

    // 3. Active points mapped to 7-day grid coordinates
    const activePoints = calendar7Days
      .filter(d => d.mood && (d.mood.level !== undefined || d.mood.score !== undefined))
      .map(d => {
        const lvl = d.mood.level !== undefined ? d.mood.level : d.mood.score;
        return {
          x: padding.left + (d.colIndex / 6) * chartW,
          y: padding.top + chartH - ((lvl - 1) / 4) * chartH,
          level: lvl,
          date: d.date,
          dayName: d.dayName,
          ...d.mood
        };
      });

    // Fallback if raw data exists outside last 7 calendar days
    let points = activePoints;
    if (points.length === 0 && data.length > 0) {
      const sortedData = data.slice().sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      points = sortedData.map((d, i) => {
        const lvl = d.level !== undefined ? d.level : (d.score || 3);
        return {
          x: padding.left + (sortedData.length === 1 ? chartW / 2 : (i / (sortedData.length - 1)) * chartW),
          y: padding.top + chartH - ((lvl - 1) / 4) * chartH,
          level: lvl,
          ...d
        };
      });
    }

    // Build SVG path
    let pathD = '';
    let areaD = '';

    if (points.length === 1) {
      const p = points[0];
      pathD = `M ${padding.left} ${p.y} L ${width - padding.right} ${p.y}`;
      areaD = `M ${padding.left} ${padding.top + chartH} L ${padding.left} ${p.y} L ${width - padding.right} ${p.y} L ${width - padding.right} ${padding.top + chartH} Z`;
    } else if (points.length > 1) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      areaD = `M ${points[0].x} ${padding.top + chartH} L ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const cpx = (prev.x + curr.x) / 2;
        pathD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
        areaD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
      }

      areaD += ` L ${points[points.length - 1].x} ${padding.top + chartH} Z`;
    }

    // Day labels (Sleek 12px labels, clean & balanced)
    const labelsHTML = showLabels ? calendar7Days.map(d => {
      const x = padding.left + (d.colIndex / 6) * chartW;
      const isToday = d.colIndex === 6;
      return `
        <text x="${x}" y="${height - 6}" text-anchor="middle" fill="${isToday ? '#2563EB' : '#475569'}" font-size="12" font-weight="${isToday ? '850' : '700'}" font-family="Plus Jakarta Sans">${d.dayName}</text>
      `;
    }).join('') : '';

    // Y-axis labels & gridlines (10.5px clean labels)
    const yLabelsHTML = [1,2,3,4,5].map(level => {
      const y = padding.top + chartH - ((level - 1) / 4) * chartH;
      return `
        <text x="${padding.left - 8}" y="${y + 3.5}" text-anchor="end" fill="#64748B" font-size="10.5" font-weight="650" font-family="Plus Jakarta Sans">${level}</text>
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(226, 232, 240, 0.5)" stroke-width="1" stroke-dasharray="4 4"/>
      `;
    }).join('');

    // Dots & Callout Tooltips (Compact 10.5px badges)
    const dotsHTML = showDots ? points.map(p => {
      const col = moodColor(p.level);
      const labelText = moodLabel(p.level);
      const badgeW = labelText.length > 6 ? 74 : 52;
      const badgeX = Math.max(4, Math.min(width - badgeW - 4, p.x - badgeW / 2));
      const badgeCenter = badgeX + badgeW / 2;
      return `
        <g class="chart-point-group">
          <!-- Glow halo -->
          <circle cx="${p.x}" cy="${p.y}" r="7.5" fill="${col}" opacity="0.18"/>
          <!-- Solid dot -->
          <circle cx="${p.x}" cy="${p.y}" r="4" fill="${col}" stroke="#FFFFFF" stroke-width="2" class="chart-dot"/>
          <!-- Tooltip badge above point -->
          <rect x="${badgeX}" y="${p.y - 24}" width="${badgeW}" height="18" rx="9" fill="#0F172A" opacity="0.94" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.18));"/>
          <text x="${badgeCenter}" y="${p.y - 11.5}" text-anchor="middle" fill="#FFFFFF" font-size="10.5" font-weight="750" font-family="Plus Jakarta Sans">${labelText}</text>
        </g>
      `;
    }).join('') : '';

    const gradientId = 'lineGradient_' + Math.random().toString(36).substring(2, 9);

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" preserveAspectRatio="xMidYMid meet" style="max-height: 220px; width: 100%; height: auto; overflow:visible; display: block; margin: 0 auto;">
        <defs>
          <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2563EB" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#2563EB" stop-opacity="0.0"/>
          </linearGradient>
        </defs>
        ${yLabelsHTML}
        ${showArea && areaD ? `<path d="${areaD}" fill="url(#${gradientId})"/>` : ''}
        ${pathD ? `<path d="${pathD}" fill="none" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round" ${points.length === 1 ? 'stroke-dasharray="6 6"' : ''}/>` : ''}
        ${dotsHTML}
        ${labelsHTML}
      </svg>
    `;
  };

  // ---- Contribution Grid (Calendar-Based) ----
  const createContributionGrid = (container, moods, days = 35, monthOffset = 0) => {
    const now = new Date();
    const viewDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Monday = 0

    const monthNames = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const dayNames = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];

    const todayKey = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const isCurrentMonth = (now.getFullYear() === year && now.getMonth() === month);

    // Day headers
    const headerHTML = dayNames.map(d => `<div class="contribution-day-header">${d}</div>`).join('');

    // Empty cells for offset
    const emptyCells = Array(firstDayOfWeek).fill('<div class="contribution-cell contribution-cell-empty"></div>').join('');

    // Date cells
    const dateCells = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const mood = moods.find(m => m.date === dateKey);
      const level = mood ? mood.level : 0;
      const isToday = dateKey === todayKey;
      const isFuture = new Date(year, month, day) > now;

      const formattedDate = new Date(year, month, day).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const moodLbl = mood ? moodLabel(mood.level) : 'Belum check-in';
      const moodClr = mood ? moodColor(mood.level) : '';
      const tags = mood && mood.tags && mood.tags.length ? mood.tags.join(', ') : '';
      const note = mood && mood.note ? mood.note : '';
      const safeTags = typeof window.escapeHTML === 'function' ? window.escapeHTML(tags) : String(tags).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
      const safeNote = typeof window.escapeHTML === 'function' ? window.escapeHTML(note) : String(note).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

      const dataAttrs = `data-level="${level}" data-date="${dateKey}" data-formatted="${formattedDate}" data-mood-label="${moodLbl}" data-mood-color="${moodClr}" data-tags="${safeTags}" data-note="${safeNote}"`;

      dateCells.push(`
        <div class="contribution-cell${isToday ? ' contribution-cell-today' : ''}${isFuture ? ' contribution-cell-future' : ''}" ${dataAttrs}>
          <span class="contribution-cell-date">${day}</span>
        </div>
      `);
    }

    // Navigation
    const canGoForward = !isCurrentMonth;
    const navHTML = `
      <div class="mood-grid-nav">
        <button class="mood-grid-nav-btn" onclick="navigateGridMonth(-1)" aria-label="Bulan sebelumnya">
          <span class="material-symbols-rounded" style="font-size:20px;">chevron_left</span>
        </button>
        <span class="mood-grid-month-label">${monthNames[month]} ${year}</span>
        <button class="mood-grid-nav-btn${canGoForward ? '' : ' disabled'}" onclick="${canGoForward ? 'navigateGridMonth(1)' : ''}" aria-label="Bulan berikutnya" ${canGoForward ? '' : 'disabled'}>
          <span class="material-symbols-rounded" style="font-size:20px;">chevron_right</span>
        </button>
      </div>
    `;

    // Tooltip container
    const tooltipHTML = '<div class="contribution-tooltip" id="contribution-tooltip"></div>';

    container.innerHTML = `
      ${navHTML}
      <div class="contribution-grid">
        ${headerHTML}
        ${emptyCells}
        ${dateCells.join('')}
      </div>
      ${tooltipHTML}
    `;

    // Attach tooltip events
    container.querySelectorAll('.contribution-cell:not(.contribution-cell-empty)').forEach(cell => {
      const showTooltip = (e) => {
        const tooltip = document.getElementById('contribution-tooltip');
        if (!tooltip) return;

        const date = cell.dataset.formatted;
        const moodLbl = cell.dataset.moodLabel;
        const moodClr = cell.dataset.moodColor;
        const tags = cell.dataset.tags;
        const note = cell.dataset.note;
        const level = parseInt(cell.dataset.level);

        const icons = { 1: 'sentiment_very_dissatisfied', 2: 'sentiment_dissatisfied', 3: 'sentiment_neutral', 4: 'sentiment_satisfied', 5: 'sentiment_very_satisfied' };

        let content = `<div class="contribution-tooltip-date">${date}</div>`;
        if (level > 0) {
          content += `<div class="contribution-tooltip-mood" style="color:${moodClr};">
            <span class="material-symbols-rounded" style="font-size:18px;">${icons[level] || ''}</span>
            <span>${moodLbl}</span>
          </div>`;
          if (tags) content += `<div class="contribution-tooltip-tags">${typeof window.escapeHTML === 'function' ? window.escapeHTML(tags) : tags}</div>`;
          if (note) content += `<div class="contribution-tooltip-note">"${typeof window.escapeHTML === 'function' ? window.escapeHTML(note) : note}"</div>`;
        } else {
          content += `<div class="contribution-tooltip-empty">Belum check-in</div>`;
        }

        tooltip.innerHTML = content;
        tooltip.classList.add('active');

        // Position tooltip
        const cellRect = cell.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const tooltipEl = tooltip;
        const tooltipW = tooltipEl.offsetWidth;
        let left = cellRect.left - containerRect.left + (cellRect.width / 2) - (tooltipW / 2);
        left = Math.max(0, Math.min(left, containerRect.width - tooltipW));
        tooltipEl.style.left = left + 'px';
        tooltipEl.style.top = (cellRect.top - containerRect.top - tooltipEl.offsetHeight - 8) + 'px';
      };

      const hideTooltip = () => {
        const tooltip = document.getElementById('contribution-tooltip');
        if (tooltip) tooltip.classList.remove('active');
      };

      cell.addEventListener('mouseenter', showTooltip);
      cell.addEventListener('mouseleave', hideTooltip);
      cell.addEventListener('click', (e) => {
        const tooltip = document.getElementById('contribution-tooltip');
        if (tooltip && tooltip.classList.contains('active')) {
          hideTooltip();
        } else {
          showTooltip(e);
        }
      });
    });
  };

  // ---- Progress Bars (2 dimensions for quiz results) ----
  const createDimensionBars = (container, scores) => {
    const { IE, TF } = scores;

    const iePercent = Math.round(((IE + 6) / 12) * 100);
    const tfPercent = Math.round(((TF + 6) / 12) * 100);

    container.innerHTML = `
      <div style="margin-bottom: 1.5rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span style="font-size:0.875rem; font-weight:600; color:var(--text-on-white);">Introvert</span>
          <span style="font-size:0.875rem; font-weight:600; color:var(--text-on-white);">Ekstrovert</span>
        </div>
        <div class="progress-bar-container" style="height:12px;">
          <div class="progress-bar" style="width:${iePercent}%; background: linear-gradient(90deg, #2563EB, #38BDF8);"></div>
        </div>
        <div style="text-align:center; margin-top:0.375rem; font-size:0.8125rem; font-weight:500; color:var(--text-secondary);">
          ${iePercent < 50 ? 'Cenderung Introvert' : iePercent > 50 ? 'Cenderung Ekstrovert' : 'Seimbang'}
        </div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span style="font-size:0.875rem; font-weight:600; color:var(--text-on-white);">Thinker</span>
          <span style="font-size:0.875rem; font-weight:600; color:var(--text-on-white);">Feeler</span>
        </div>
        <div class="progress-bar-container" style="height:12px;">
          <div class="progress-bar" style="width:${tfPercent}%; background: linear-gradient(90deg, #F59E0B, #EC4899);"></div>
        </div>
        <div style="text-align:center; margin-top:0.375rem; font-size:0.8125rem; font-weight:500; color:var(--text-secondary);">
          ${tfPercent < 50 ? 'Cenderung Thinker' : tfPercent > 50 ? 'Cenderung Feeler' : 'Seimbang'}
        </div>
      </div>
    `;
  };

  // ---- Mini Chart (for Dashboard) ----
  const createMiniChart = (container, data) => {
    createLineChart(container, data, {
      width: 440,
      height: 130,
      padding: { top: 30, right: 45, bottom: 26, left: 42 },
      showArea: true,
      showDots: true,
      showLabels: true
    });
  };

  return { createLineChart, createContributionGrid, createDimensionBars, createMiniChart, moodColor, moodEmoji, moodLabel };
})();
