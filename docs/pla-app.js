(function() {
  'use strict';

  // State: each step has status 'pending' | 'in-progress' | 'completed' | 'blocked'
  const state = {};
  STEPS.forEach(s => state[s.id] = 'pending');

  // Apply initial state from data file
  if (typeof INITIAL_STATE !== 'undefined') {
    Object.keys(INITIAL_STATE).forEach(k => { if (state[k]) state[k] = INITIAL_STATE[k]; });
  }

  // Load from localStorage if available (overrides initial state)
  try {
    const saved = JSON.parse(localStorage.getItem('pla-obertura-state') || '{}');
    Object.keys(saved).forEach(k => { if (state[k]) state[k] = saved[k]; });
  } catch(e) {}

  function saveState() {
    try { localStorage.setItem('pla-obertura-state', JSON.stringify(state)); } catch(e) {}
  }

  function depsMet(step) {
    return step.deps.every(d => state[d] === 'completed');
  }

  function isBlocked(step) {
    return step.deps.length > 0 && !depsMet(step) && state[step.id] === 'pending';
  }

  function updateBlocked() {
    STEPS.forEach(s => {
      if (isBlocked(s)) {
        state[s.id] = 'blocked';
      } else if (state[s.id] === 'blocked' && depsMet(s)) {
        state[s.id] = 'pending';
      }
    });
  }

  function renderPhases() {
    const container = document.getElementById('phases');
    container.innerHTML = '';

    PHASES.forEach(phase => {
      const phaseSteps = STEPS.filter(s => s.phase === phase.n);
      const completed = phaseSteps.filter(s => state[s.id] === 'completed').length;
      const total = phaseSteps.length;
      const pct = total > 0 ? Math.round(completed / total * 100) : 0;

      const div = document.createElement('div');
      div.className = 'ph';
      div.innerHTML = 
        '<div class="ph-h">' +
          '<div class="ph-t">' +
            '<div class="ph-n">' + phase.n + '</div>' +
            '<div class="ph-m">' + phase.name + '</div>' +
          '</div>' +
          '<div class="ph-p">' +
            '<div class="ph-s">' + completed + '/' + total + '</div>' +
            '<div class="ph-pb"><div class="ph-pf" style="width:' + pct + '%"></div></div>' +
            '<div class="ph-g">&#9660;</div>' +
          '</div>' +
        '</div>' +
        '<div class="ph-b"></div>';

      const body = div.querySelector('.ph-b');
      phaseSteps.forEach(step => renderStep(step, body));

      div.querySelector('.ph-h').addEventListener('click', function() {
        div.classList.toggle('collapsed');
      });

      container.appendChild(div);
    });
  }

  function renderStep(step, container) {
    const status = state[step.id];
    const blocked = isBlocked(step);
    const effectiveStatus = blocked ? 'blocked' : status;

    const depChips = step.deps.map(d => {
      const met = state[d] === 'completed';
      return '<span class="chip ' + (met ? 'ok' : 'no') + '">' + d + '</span>';
    }).join(' ');

    const statusLabels = {pending:'Pendent', 'in-progress':'En curs', completed:'Completat', blocked:'Bloquejat'};
    const statusClasses = {pending:'p', 'in-progress':'i', completed:'c', blocked:'b'};

    const div = document.createElement('div');
    div.className = 'st' + (effectiveStatus === 'blocked' ? ' blk' : '');
    div.dataset.stepId = step.id;

    div.innerHTML = 
      '<div class="st-h">' +
        '<div class="st-c ' + (effectiveStatus === 'completed' ? 'done' : effectiveStatus === 'in-progress' ? 'wip' : effectiveStatus === 'blocked' ? 'blk' : '') + '"></div>' +
        '<div class="st-b">' +
          '<div class="st-t">' +
            '<span class="st-i">' + step.id + '</span>' +
            step.title + (step.opt ? ' <span style="color:var(--lt);font-weight:400;font-size:13px">(opcional)</span>' : '') +
            '<span class="st-sb ' + statusClasses[effectiveStatus] + '">' + statusLabels[effectiveStatus] + '</span>' +
          '</div>' +
          '<div class="st-d">' +
            '<div class="st-dl">Què</div><div class="st-dv">' + step.what + '</div>' +
            '<div class="st-dl">Fitxers</div><div class="st-dv"><code>' + step.files + '</code></div>' +
            '<div class="st-dl">Verificació</div><div class="st-dv">' + step.verify + '</div>' +
            (step.deps.length > 0 ? '<div class="st-dep">Depèn de: ' + depChips + '</div>' : '') +
          '</div>' +
          (effectiveStatus === 'blocked' ? '<div class="st-bn">Bloquejat per dependències no completades. Completa els passos marcats en groc primer.</div>' : '') +
        '</div>' +
      '</div>';

    container.appendChild(div);
  }

  function renderAcceptance() {
    const ul = document.getElementById('acList');
    ul.innerHTML = '';
    const allDone = STEPS.filter(s => !s.opt).every(s => state[s.id] === 'completed');
    ACCEPTANCE.forEach(item => {
      const li = document.createElement('li');
      li.innerHTML = '<div class="ac-c' + (allDone ? ' ok' : '') + '"></div>' + item;
      ul.appendChild(li);
    });
  }

  function updateGlobalStats() {
    const total = STEPS.length;
    const completed = STEPS.filter(s => state[s.id] === 'completed').length;
    const inProgress = STEPS.filter(s => state[s.id] === 'in-progress').length;
    const blocked = STEPS.filter(s => isBlocked(s)).length;
    const pending = total - completed - inProgress - blocked;
    const pct = Math.round(completed / total * 100);

    document.getElementById('ovFill').style.width = pct + '%';
    document.getElementById('ovText').textContent = completed + ' de ' + total + ' completats';
    document.getElementById('ovPct').textContent = pct + '%';
    document.getElementById('sP').textContent = pending;
    document.getElementById('sI').textContent = inProgress;
    document.getElementById('sC').textContent = completed;
    document.getElementById('sB').textContent = blocked;
  }

  function renderAll() {
    updateBlocked();
    renderPhases();
    renderAcceptance();
    updateGlobalStats();
    saveState();
  }

  // Expose API for Cascade to update step status
  window.plaAPI = {
    setStep: function(stepId, newStatus) {
      if (!state[stepId]) { console.warn('Unknown step:', stepId); return false; }
      state[stepId] = newStatus;
      renderAll();
      return true;
    },
    getStep: function(stepId) {
      return state[stepId] || null;
    },
    getAll: function() {
      return Object.assign({}, state);
    },
    render: renderAll
  };

  // Initial render
  renderAll();
})();
