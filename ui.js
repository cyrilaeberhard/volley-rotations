// Menü, Modus-Steuerung und die Modi Lernfilm, Formation, Stellen. Quiz-Modi stehen in quiz.js.
(function () {
  const R = VR;
  const { PLAYERS, BASIS } = VR;
  const $ = (sel) => document.querySelector(sel);

  const MODES = [
    { id: 1, name: 'Lernfilm', hint: 'Zuschauen: Annahme, Angriffswege, Defence.' },
    { id: 2, name: 'Formation', hint: 'Spieler selbst ziehen, Überlappung prüfen.' },
    { id: 3, name: 'Stellen', hint: 'Annahme und Defence wie im Playbook stellen.' },
    { id: 4, name: 'Legal?', hint: 'Aufstellung beurteilen.' },
    { id: 5, name: 'Quiz', hint: 'Fragen zum Playbook.' },
  ];
  const ROT_MODES = [1, 2, 3];
  const TIMER_MODES = [4, 5];
  const SYSTEM_ID = VR.SYSTEM.id;

  let state = { mode: 1, rot: 1, timer: false };
  let cleanup = () => {};
  let handler = null;
  let tapHandler = null;
  const court = VR.createCourt($('#court'), (slot, p, final) => { if (handler) handler(slot, p, final); }, (key) => { if (tapHandler) tapHandler(key); });
  const panel = $('#panel');

  const startPositions = () => Object.fromEntries(R.SLOTS.map((slot) => [slot, { ...BASIS[slot] }]));
  const linksFor = (pos, violations) => violations.map((v) => ({
    x1: pos[v.rule.a].x, y1: pos[v.rule.a].y, x2: pos[v.rule.b].x, y2: pos[v.rule.b].y, cls: 'bad',
  }));
  const record = (ok) => { VR.stats.record(SYSTEM_ID, state.rot, ok); renderScore(); };
  const violationList = (res) => `<ul>${res.violations.map((v) => `<li>${v.text}</li>`).join('')}</ul>`;

  // ---------- Formation legen ----------
  function modeFormation() {
    let pos = startPositions();
    let bad = new Set();
    let lines = [];

    const draw = () => {
      court.setTokens(R.tokensFor(state.rot, pos).map((t) => ({ ...t, movable: true, status: bad.has(t.slot) ? 'bad' : '' })));
      court.setOverlay({ lines });
    };
    const message = (html) => { panel.querySelector('.feedback').innerHTML = html; };

    panel.innerHTML = `<h2>Formation legen</h2>
      <p>P${state.rot} (Passeur auf Position ${state.rot})</p>
      <p>Zieh alle sechs Spieler auf legale Plätze.</p>
      <details><summary>Hinweise</summary><p>Die Zahl am Spieler ist seine Position in der Rotation. Tipp: Spieler antippen zeigt den Namen.</p></details>
      <div class="row"><button type="button" id="check" class="primary">Prüfen</button><button type="button" id="reset">Zurücksetzen</button></div>
      <div class="feedback"></div>`;

    handler = (slot, p, final) => {
      pos = { ...pos, [slot]: p };
      if (final) { bad = new Set(); lines = []; draw(); message(''); }
    };
    panel.querySelector('#check').addEventListener('click', () => {
      const res = R.checkFormation(pos);
      bad = new Set(res.violations.flatMap((v) => [v.rule.a, v.rule.b]));
      lines = linksFor(pos, res.violations);
      draw();
      record(res.legal);
      message(res.legal
        ? '<p class="ok">Legal. Alle Nachbarn stehen in der richtigen Reihenfolge.</p>'
        : `<p class="bad">Fehlstellung:</p>${violationList(res)}`);
    });
    panel.querySelector('#reset').addEventListener('click', () => { pos = startPositions(); bad = new Set(); lines = []; draw(); message(''); });
    draw();
  }

  // ---------- Stellen: Annahme und Defence nach Playbook ----------
  function modeStellen() {
    const ids = R.lineupFor(state.rot);
    const targets = { receive: VR.targetsBySlot(state.rot, 'receive'), defence: VR.targetsBySlot(state.rot, 'defence') };
    const KINDS = { receive: `Annahme P${state.rot}`, defence: 'Defence' };
    let step = 'receive';
    let pos = startPositions();
    let bad = new Set();
    let lines = [];
    let ghosts = [];

    const draw = () => {
      court.setTokens(R.tokensFor(state.rot, pos).map((t) => ({ ...t, movable: true, status: bad.has(t.slot) ? 'bad' : '' })));
      court.setOverlay({ lines, ghosts });
    };
    const ghostList = (spots) => R.SLOTS.map((slot) => ({ ...spots[slot], text: R.displayLabel(ids[slot - 1], slot).text }));
    const message = (html) => { panel.querySelector('.feedback').innerHTML = html; };
    const clear = () => { bad = new Set(); lines = []; ghosts = []; };

    function renderPanel() {
      panel.innerHTML = `<h2>${step === 'receive' ? 'Schritt 1' : 'Schritt 2'}: ${KINDS[step]} stellen</h2>
        <p>Rotation P${state.rot} (Passeur auf Position ${state.rot}). Stell die Spieler wie im Playbook.</p>
        <details><summary>Hinweise</summary><p>${step === 'receive'
    ? 'Die Aufstellung muss legal sein. Grün: legal und nah an der Skizze. Gelb: legal, aber weiter weg.'
    : 'Nach dem Aufschlag darf frei gestellt werden. Die Linien zeigen den Raum hinter dem Block.'}</p></details>
        <div class="row"><button type="button" id="check" class="primary">Prüfen</button><button type="button" id="show">Lösung zeigen</button>
        ${step === 'receive' ? '' : '<button type="button" id="back">Zurück zur Annahme</button>'}<button type="button" id="reset">Zurücksetzen</button></div>
        <div class="feedback"></div>`;
      const q = (sel) => panel.querySelector(sel);
      q('#check').addEventListener('click', step === 'receive' ? checkReceive : checkDefence);
      q('#show').addEventListener('click', () => { ghosts = ghostList(targets[step]); lines = step === 'defence' ? VR.DEFENCE_LINES : []; draw(); });
      q('#reset').addEventListener('click', () => { pos = startPositions(); clear(); lines = step === 'defence' ? VR.DEFENCE_LINES : []; draw(); message(''); });
      if (q('#back')) q('#back').addEventListener('click', () => { step = 'receive'; clear(); renderPanel(); draw(); });
    }

    function checkReceive() {
      const res = R.checkFormation(pos);
      clear();
      bad = new Set(res.violations.flatMap((v) => [v.rule.a, v.rule.b]));
      lines = linksFor(pos, res.violations);
      if (!res.legal) {
        draw(); record(false);
        message(`<p class="bad">Rot: Fehlstellung.</p>${violationList(res)}`);
        return;
      }
      const grade = R.gradeFormation(pos, targets.receive);
      if (grade.near) {
        draw(); record(true);
        message('<p class="ok">Grün: legal und wie im Playbook.</p><button type="button" id="go" class="primary">Weiter zur Defence</button>');
        panel.querySelector('#go').addEventListener('click', () => { step = 'defence'; clear(); lines = VR.DEFENCE_LINES; renderPanel(); draw(); });
      } else {
        ghosts = ghostList(targets.receive);
        bad = new Set(grade.far);
        draw(); record(false);
        message(`<p class="warn">Gelb: legal, aber weiter von der Skizze weg (Positionen ${grade.far.join(', ')}). Die gestrichelten Kreise zeigen die Stellung im Playbook.</p>`);
      }
    }

    function checkDefence() {
      const grade = R.gradeFormation(pos, targets.defence);
      clear();
      lines = VR.DEFENCE_LINES;
      if (!grade.near) { ghosts = ghostList(targets.defence); bad = new Set(grade.far); }
      draw(); record(grade.near);
      message(grade.near
        ? '<p class="ok">Alle Spieler stehen wie in der Defence-Skizze.</p>'
        : `<p class="bad">Zu weit vom Ziel weg: Position ${grade.far.join(', ')}. Die gestrichelten Kreise zeigen die Stellung im Playbook.</p>`);
    }

    handler = (slot, p, final) => {
      pos = { ...pos, [slot]: p };
      if (final) { clear(); lines = step === 'defence' ? VR.DEFENCE_LINES : []; draw(); message(''); }
    };
    renderPanel();
    draw();
  }

  // ---------- Lernfilm ----------
  const HOLD_MS = 5200;

  function modeLearn() {
    const ids = R.lineupFor(state.rot);
    const steps = VR.stepsFor(state.rot);
    let idx = 0;
    let playing = false;
    let timer = null;
    let focus = null;
    cleanup = () => { playing = false; clearTimeout(timer); court.setFocus(null); };

    const tokensAt = (step) => ids.map((id, i) => ({
      key: id, slot: i + 1, id, ...step.pos[id], ...R.displayLabel(id, i + 1),
      passer: step.passers.includes(id), duration: 1.0,
    }));

    // Laufweg der fokussierten Person: Punkte je Schritt, verbunden, nummeriert.
    function trail() {
      const pts = steps.map((st) => st.pos[focus]);
      const lines = pts.slice(1).map((q, i) => ({ x1: pts[i].x, y1: pts[i].y, x2: q.x, y2: q.y, cls: 'trail' }));
      const ghosts = pts.map((q, i) => ({ x: q.x, y: q.y, text: String(i + 1), r: 0.42, cls: i === idx ? 'now' : 'step' }));
      return { lines, ghosts };
    }

    function focusPanel() {
      const slot = ids.indexOf(focus) + 1;
      const label = R.displayLabel(focus, slot);
      return `<div class="focus-head"><span class="chip">${label.text}</span><div><strong>${label.name}</strong><div class="meta">Position ${slot} · ${PLAYERS[focus].name}</div></div>
          <button type="button" id="unfocus" class="ghost-btn" title="Fokus aufheben">✕</button></div>
        <ol class="timeline">${steps.map((s, i) => `<li><button type="button" data-step="${i}" class="${i === idx ? 'on' : ''}"><b>${i + 1}</b><span>${s.title}</span></button></li>`).join('')}</ol>`;
    }

    function show() {
      const step = steps[idx];
      court.setTokens(tokensAt(step));
      court.setFocus(focus);
      const tr = focus ? trail() : { lines: [], ghosts: [] };
      court.setOverlay({ lines: [...step.lines, ...tr.lines], ghosts: tr.ghosts });
      const chips = steps.map((s, i) => `<button type="button" data-step="${i}" class="${i === idx ? 'on' : ''}">${i + 1}</button>`).join('');
      const body = focus
        ? focusPanel()
        : `<h2>${step.title}</h2><p>${step.caption}</p>
          ${step.passers.length ? `<p class="meta">Gelb umrandet: nehmen an (${step.passers.map((id) => R.displayLabel(id, ids.indexOf(id) + 1).text).join(', ')}).</p>` : ''}
          <div class="row seg">${chips}</div>
          <p class="hint">Tippe auf einen Spieler, um nur seinen Weg zu sehen.</p>`;
      panel.innerHTML = `<p class="meta">P${state.rot} (Passeur auf Position ${state.rot})${focus ? ` · ${step.title}` : ''}</p>${body}
        <div class="row"><button type="button" id="prev">◀</button><button type="button" id="next" class="primary">Weiter ▶</button><button type="button" id="play">${playing ? '⏸ Pause' : '▶ Abspielen'}</button></div>`;
      panel.querySelector('#prev').addEventListener('click', () => { stop(); back(); });
      panel.querySelector('#next').addEventListener('click', () => { stop(); advance(); });
      panel.querySelector('#play').addEventListener('click', () => { if (playing) { stop(); show(); } else start(); });
      panel.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => { stop(); idx = Number(b.dataset.step); show(); }));
      const un = panel.querySelector('#unfocus');
      if (un) un.addEventListener('click', () => { focus = null; show(); });
    }

    function advance() {
      idx = idx < steps.length - 1 ? idx + 1 : 0;
      show();
    }
    function back() {
      if (idx > 0) { idx -= 1; show(); }
    }
    function tick() {
      if (!playing) return;
      if (idx === steps.length - 1) { stop(); show(); return; }
      advance();
      timer = setTimeout(tick, HOLD_MS);
    }
    function start() {
      playing = true;
      if (idx === steps.length - 1) idx = 0;
      show();
      timer = setTimeout(tick, HOLD_MS);
    }
    function stop() {
      playing = false;
      clearTimeout(timer);
    }

    handler = null;
    tapHandler = (key) => { focus = focus === key ? null : key; show(); };
    show();
  }

  // ---------- Menü ----------
  function renderMenu() {
    const s = state;
    $('#modes').innerHTML = MODES.map((m) => `<button type="button" data-mode="${m.id}" title="${m.hint}" class="${m.id === s.mode ? 'on' : ''}">${m.name}</button>`).join('');
    const showRot = ROT_MODES.includes(s.mode);
    const showTimer = TIMER_MODES.includes(s.mode);
    $('#menu').innerHTML = `
      ${showRot ? `<div class="seg" role="group" aria-label="Rotation (Passeur auf Position)">${[1, 2, 3, 4, 5, 6].map((r) => `<button type="button" data-rot="${r}" class="${r === s.rot ? 'on' : ''}">P${r}</button>`).join('')}</div>` : ''}
      ${showTimer ? `<label class="chk"><input type="checkbox" data-key="timer" ${s.timer ? 'checked' : ''}> Zeitlimit 20 s</label>` : ''}`;
  }

  function renderScore() {
    const st = VR.stats.load();
    $('#score').textContent = `${st.points} Punkte · Streak ${st.streak} (Best ${st.best})`;
  }

  function startMode() {
    cleanup();
    cleanup = () => {};
    handler = null;
    tapHandler = null;
    court.setFocus(null);
    court.setOverlay({});
    court.setBall(null);
    const m = state.mode;
    if (m === 1) modeLearn();
    else if (m === 2) modeFormation();
    else if (m === 3) modeStellen();
    else {
      cleanup = VR.startQuiz(m === 4 ? 'legal' : 'playbook', {
        state, court, panel, onScore: (rot, ok) => { VR.stats.record(SYSTEM_ID, rot, ok); renderScore(); },
      });
    }
  }

  function setState(patch) {
    state = { ...state, ...patch };
    renderMenu();
    startMode();
  }

  $('#modes').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b) setState({ mode: Number(b.dataset.mode) }); });
  $('#menu').addEventListener('click', (e) => {
    const r = e.target.closest('[data-rot]');
    if (r) setState({ rot: Number(r.dataset.rot) });
  });
  $('#menu').addEventListener('change', (e) => {
    const key = e.target.dataset.key;
    if (key) setState({ [key]: e.target.checked });
  });

  function showStats() {
    const st = VR.stats.load();
    const cells = [1, 2, 3, 4, 5, 6].map((r) => {
      const v = st.byRot[`${SYSTEM_ID}:${r}`];
      return `<td>${v ? `${Math.round((v.ok / v.total) * 100)}% <small>(${v.total})</small>` : '–'}</td>`;
    }).join('');
    const dlg = $('#statsDialog');
    dlg.innerHTML = `<h2>Statistik</h2><p>${st.points} Punkte · Streak ${st.streak} · bester Streak ${st.best}</p>
      <table><thead><tr><th></th>${[1, 2, 3, 4, 5, 6].map((r) => `<th>P${r}</th>`).join('')}</tr></thead><tbody><tr><th>${SYSTEM_ID}</th>${cells}</tr></tbody></table>
      <p><small>Trefferquote je Rotation (Anzahl Versuche in Klammern).</small></p>
      <div class="row"><button type="button" id="resetStats">Zurücksetzen</button><button type="button" id="closeStats" class="primary">Schließen</button></div>`;
    dlg.querySelector('#closeStats').addEventListener('click', () => dlg.close());
    dlg.querySelector('#resetStats').addEventListener('click', () => { VR.stats.reset(); renderScore(); showStats(); });
    if (!dlg.open) dlg.showModal();
  }
  $('#statsBtn').addEventListener('click', showStats);

  const root = document.documentElement;
  const themeBtn = $('#themeBtn');
  const paintTheme = () => { themeBtn.textContent = root.dataset.theme === 'dark' ? '☀ Hell' : '☾ Dunkel'; };
  themeBtn.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('vr-theme', root.dataset.theme);
    paintTheme();
  });
  paintTheme();

  renderMenu();
  renderScore();
  startMode();
})();
