// Menü, Modus-Steuerung und die Übungsmodi 1 (Formation legen), 4 (Stack & Switch), 5 (Lernmodus).
(function () {
  const R = VR;
  const { SYSTEMS, PLAYERS, HOME_CELLS, SERVE_SPOT } = VR;
  const $ = (sel) => document.querySelector(sel);

  const MODES = [
    { id: 5, name: 'Lernfilm', hint: 'Zuschauen, wie sich das Team stellt und wechselt.' },
    { id: 6, name: 'Simulation', hint: 'Ein Ballwechsel live.' },
    { id: 1, name: 'Formation', hint: 'Spieler selbst ziehen.' },
    { id: 4, name: 'Stack & Switch', hint: 'Stack stellen, dann wechseln.' },
    { id: 2, name: 'Legal?', hint: 'Aufstellung beurteilen.' },
    { id: 3, name: 'Quiz', hint: 'Fragen zu Rotation und Regeln.' },
  ];
  const phaseName = (p) => (p === 'serve' ? 'Aufschlag' : 'Annahme');

  let state = { mode: 1, system: '5-1', rot: 1, phase: 'receive', libero: true, ds: '', level: 'leicht', timer: false };
  let cleanup = () => {};
  let handler = null;
  let tapHandler = null;
  const court = VR.createCourt($('#court'), (slot, p, final) => { if (handler) handler(slot, p, final); }, (key) => { if (tapHandler) tapHandler(key); });
  const panel = $('#panel');

  const startPositions = (phase) => ({
    ...Object.fromEntries(R.SLOTS.map((slot) => [slot, { ...HOME_CELLS[slot] }])),
    ...(phase === 'serve' ? { 1: { ...SERVE_SPOT } } : {}),
  });
  const linksFor = (pos, violations) => violations.map((v) => ({
    x1: pos[v.rule.a].x, y1: pos[v.rule.a].y, x2: pos[v.rule.b].x, y2: pos[v.rule.b].y, cls: 'bad',
  }));
  const options = () => ({ libero: state.libero, ds: state.ds });
  const record = (ok) => { VR.stats.record(state.system, state.rot, ok); renderScore(); };

  // ---------- Modus 1: Formation legen ----------
  function modeFormation() {
    const sys = SYSTEMS[state.system];
    const serving = state.phase === 'serve';
    let pos = startPositions(state.phase);
    let bad = new Set();
    let lines = [];

    const draw = () => {
      court.setTokens(R.tokensFor(sys, state.rot, state.phase, pos, options())
        .map((t) => ({ ...t, movable: true, status: bad.has(t.slot) ? 'bad' : '' })));
      court.setOverlay({ lines });
    };
    const message = (html) => { panel.querySelector('.feedback').innerHTML = html; };

    panel.innerHTML = `<h2>Formation legen</h2>
      <p>${sys.name} · Rotation ${state.rot} · ${phaseName(state.phase)}</p>
      <p>Zieh alle sechs Spieler auf legale Plätze.</p>
      <details><summary>Hinweise</summary><p>Die Zahl am Spieler ist seine Position in der Rotation. Tipp: Spieler antippen zeigt den Namen.${serving ? ' Der Aufschläger darf in die Aufschlagzone, für ihn gilt keine Überlappungsregel.' : ''}</p></details>
      <div class="row"><button type="button" id="check" class="primary">Prüfen</button><button type="button" id="reset">Zurücksetzen</button></div>
      <div class="feedback"></div>`;

    handler = (slot, p, final) => {
      pos = { ...pos, [slot]: p };
      if (final) { bad = new Set(); lines = []; draw(); message(''); }
    };
    panel.querySelector('#check').addEventListener('click', () => {
      const res = R.checkFormation(pos, { serving });
      bad = new Set(res.violations.flatMap((v) => [v.rule.a, v.rule.b]));
      lines = linksFor(pos, res.violations);
      draw();
      record(res.legal);
      message(res.legal
        ? `<p class="ok">Legal. ${res.serverExempt ? 'Der Aufschläger steht außerhalb und ist ausgenommen.' : 'Alle Nachbarn stehen in der richtigen Reihenfolge.'}</p>`
        : `<p class="bad">Fehlstellung:</p><ul>${res.violations.map((v) => `<li>${v.text}</li>`).join('')}</ul>`);
    });
    panel.querySelector('#reset').addEventListener('click', () => { pos = startPositions(state.phase); bad = new Set(); lines = []; draw(); message(''); });
    draw();
  }

  // ---------- Modus 4: Stack & Switch ----------
  function modeStack() {
    const sys = SYSTEMS[state.system];
    const serving = state.phase === 'serve';
    const ideal = VR.idealFor(sys, state.rot, state.phase);
    const ids = ideal.ids;
    const anchorLabel = R.displayLabel(ids[ideal.anchor - 1], ideal.anchor, state.phase, options()).text;
    const switchTarget = serving ? 'Verteidigung' : 'Angriff';
    let step = 'stack';
    let pos = startPositions(state.phase);
    let bad = new Set();
    let lines = [];
    let ghosts = [];

    const draw = () => {
      court.setTokens(R.tokensFor(sys, state.rot, state.phase, pos, options())
        .map((t) => ({ ...t, movable: true, status: bad.has(t.slot) ? 'bad' : '' })));
      court.setOverlay({ lines, ghosts });
    };
    const ghostList = (spots) => R.SLOTS.map((slot) => ({
      ...spots[slot], text: R.displayLabel(ids[slot - 1], slot, state.phase, options()).text,
    }));
    const message = (html) => { panel.querySelector('.feedback').innerHTML = html; };

    function renderPanel() {
      const hint = serving
        ? `Aufschlag: Stack um die vordere Mitte (${anchorLabel}), sie soll zum Block bereit bleiben. Der Aufschläger steht hinter der Endlinie.`
        : `Annahme: Stack um ${anchorLabel}. ${ideal.anchor === R.SLOTS.find((s) => R.isSetting(sys, ids[s - 1], s)) ? 'Der Zuspieler soll nah an seinem Zuspielpunkt starten.' : 'Der Zuspieler steht auf 4 oder 5, darum hat die vordere Außenangreiferin Vorrang und bleibt nah an Links-vorne.'}`;
      panel.innerHTML = step === 'stack'
        ? `<h2>Schritt 1: Stack stellen</h2><p>${sys.name} · Rotation ${state.rot} · ${phaseName(state.phase)}</p>
           <p>Stell den Stack: legal und nah am Ideal wird grün.</p><details><summary>Hinweise</summary><p>${hint}</p><p>Legal, aber weiter weg: gelb.</p></details>
           <div class="row"><button type="button" id="check" class="primary">Stack prüfen</button><button type="button" id="show">Ideal zeigen</button><button type="button" id="reset">Zurücksetzen</button></div>
           <div class="feedback"></div>`
        : `<h2>Schritt 2: Wechsel (${switchTarget})</h2>
           <p>Zieh jeden Spieler auf seine ${switchTarget}-Position, in der eigenen Reihe.</p>
           <div class="row"><button type="button" id="check" class="primary">Wechsel prüfen</button><button type="button" id="show">Lösung zeigen</button><button type="button" id="back">Zurück zum Stack</button></div>
           <div class="feedback"></div>`;
      bind();
    }

    function bind() {
      const q = (sel) => panel.querySelector(sel);
      q('#check').addEventListener('click', step === 'stack' ? checkStack : checkSwitch);
      q('#show').addEventListener('click', () => { ghosts = ghostList(step === 'stack' ? ideal.pos : ideal.targets); draw(); });
      if (q('#reset')) q('#reset').addEventListener('click', () => { pos = startPositions(state.phase); bad = new Set(); lines = []; ghosts = []; draw(); message(''); });
      if (q('#back')) q('#back').addEventListener('click', () => { step = 'stack'; bad = new Set(); lines = []; ghosts = []; renderPanel(); draw(); });
    }

    function checkStack() {
      const res = R.checkFormation(pos, { serving });
      bad = new Set(res.violations.flatMap((v) => [v.rule.a, v.rule.b]));
      lines = linksFor(pos, res.violations);
      ghosts = [];
      if (!res.legal) {
        draw(); record(false);
        message(`<p class="bad">Rot: Fehlstellung.</p><ul>${res.violations.map((v) => `<li>${v.text}</li>`).join('')}</ul>`);
        return;
      }
      const grade = R.gradeStack(pos, ideal.pos);
      if (grade.near) {
        draw(); record(true);
        message('<p class="ok">Grün: legal und ein guter Stack.</p><button type="button" id="go" class="primary">Weiter zum Wechsel</button>');
        panel.querySelector('#go').addEventListener('click', () => { step = 'switch'; bad = new Set(); lines = []; renderPanel(); draw(); });
      } else {
        ghosts = ghostList(ideal.pos);
        bad = new Set(grade.far);
        draw(); record(false);
        message(`<p class="warn">Gelb: legal, aber weiter vom Stack im Plan weg (Positionen ${grade.far.join(', ')}). Die gestrichelten Kreise zeigen eine mögliche Variante, es gibt mehrere gute Stacks.</p>`);
      }
    }

    function checkSwitch() {
      const res = R.gradeSwitch(sys, ids, state.phase, pos, 1.2, ideal.targets);
      bad = new Set([...res.far, ...res.rowChanges]);
      ghosts = res.ok ? [] : ghostList(res.targets);
      draw(); record(res.ok);
      message(res.ok
        ? '<p class="ok">Alle Spieler stehen auf ihrer Position nach dem Wechsel.</p>'
        : `<p class="bad">${res.far.length ? `Zu weit vom Ziel weg: Position ${res.far.join(', ')}. ` : ''}${res.rowChanges.length ? `Reihenwechsel (vorn/hinten) bei Position ${res.rowChanges.join(', ')}: nicht verboten, aber du verlierst Block- und Angriffsrechte.` : ''}</p>`);
    }

    handler = (slot, p, final) => {
      pos = { ...pos, [slot]: p };
      if (final) { bad = new Set(); lines = []; ghosts = []; draw(); message(''); }
    };
    renderPanel();
    draw();
  }

  // ---------- Modus 5: Lernmodus (Film) ----------
  const HOLD_MS = 5200;

  function modeLearn() {
    const sys = SYSTEMS[state.system];
    let seg = { rot: state.rot, phase: state.phase };
    let idx = 0;
    let note = '';
    let playing = false;
    let timer = null;
    let focus = null;
    let coverSide = 'links'; // Angriffsseite für den Schritt Absicherung
    cleanup = () => { playing = false; clearTimeout(timer); court.setFocus(null); };

    const plan = () => VR.planFor(sys, seg.rot, seg.phase, coverSide);

    // Laufweg der fokussierten Person: Punkte je Schritt, verbunden, nummeriert.
    function trail(p) {
      const pts = p.steps.map((st) => st.pos[focus]);
      const lines = pts.slice(1).map((q, i) => ({ x1: pts[i].x, y1: pts[i].y, x2: q.x, y2: q.y, cls: 'trail' }));
      const ghosts = pts.map((q, i) => ({ x: q.x, y: q.y, text: String(i + 1), r: 0.42, cls: i === idx ? 'now' : 'step' }));
      return { lines, ghosts };
    }

    function focusPanel(p, ids) {
      const slot = ids.indexOf(focus) + 1;
      const label = R.displayLabel(focus, slot, seg.phase, options());
      const acts = VR.playerActions(sys, seg.rot, seg.phase, focus);
      const now = acts[idx];
      return `<div class="focus-head"><span class="chip">${label.text}</span><div><strong>${label.name}</strong><div class="meta">Position ${slot} · ${PLAYERS[focus].name}</div></div>
          <button type="button" id="unfocus" class="ghost-btn" title="Fokus aufheben">✕</button></div>
        <div class="verb">${now.verb}</div><p>${now.text}</p>
        <ol class="timeline">${acts.map((a, i) => `<li><button type="button" data-step="${i}" class="${i === idx ? 'on' : ''}"><b>${i + 1}</b><span>${a.verb}</span></button></li>`).join('')}</ol>`;
    }

    function show(duration = 1.0) {
      const p = plan();
      const step = p.steps[idx];
      const ids = R.lineupFor(sys, seg.rot);
      court.setTokens(VR.stepTokens(sys, seg.rot, seg.phase, step, options(), duration));
      court.setFocus(focus);
      const arc = step.cover ? step.cover.arc : [];
      court.setOverlay(focus ? { ...trail(p), lines: [...trail(p).lines, ...arc] } : { lines: arc });
      const chips = p.steps.map((s, i) => `<button type="button" data-step="${i}" class="${i === idx ? 'on' : ''}">${i + 1}</button>`).join('');
      const body = focus
        ? focusPanel(p, ids)
        : `<h2>${step.title}</h2>
          ${note && idx === 0 ? `<p class="note">${note}</p>` : ''}
          <p>${step.caption}</p>
          ${step.passers.length ? `<p class="meta">Gelb umrandet: nehmen an (${step.passers.map((r) => PLAYERS[r].label).join(', ')}).</p>` : ''}
          ${step.cover ? `<div class="row seg" aria-label="Angriffsseite">${Object.keys(VR.COVER_SIDES).map((k) => `<button type="button" data-side="${k}" class="${k === coverSide ? 'on' : ''}">Angriff ${k}</button>`).join('')}</div>` : ''}
          <div class="row seg">${chips}</div>
          <p class="hint">Tippe auf einen Spieler, um nur seinen Weg und seine Aufgaben zu sehen.</p>`;
      panel.innerHTML = `<p class="meta">${sys.name} · Rotation ${seg.rot} · ${phaseName(seg.phase)}${focus ? ` · ${step.title}` : ''}</p>${body}
        <div class="row"><button type="button" id="prev">◀</button><button type="button" id="next" class="primary">Weiter ▶</button><button type="button" id="play">${playing ? '⏸ Pause' : '▶ Abspielen'}</button></div>`;
      panel.querySelector('#prev').addEventListener('click', () => { stop(); back(); });
      panel.querySelector('#next').addEventListener('click', () => { stop(); advance(); });
      panel.querySelector('#play').addEventListener('click', () => { if (playing) stop(); else start(); });
      panel.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => { stop(); idx = Number(b.dataset.step); note = ''; show(); }));
      panel.querySelectorAll('[data-side]').forEach((b) => b.addEventListener('click', () => { stop(); coverSide = b.dataset.side; show(); }));
      const un = panel.querySelector('#unfocus');
      if (un) un.addEventListener('click', () => { focus = null; show(); });
    }

    function advance() {
      if (idx < plan().steps.length - 1) { idx += 1; show(); return; }
      if (seg.phase === 'receive') {
        seg = { rot: (seg.rot % 6) + 1, phase: 'serve' };
        note = `Punkt gewonnen (Side-out): Das Team dreht im Uhrzeigersinn und schlägt jetzt in Rotation ${seg.rot} auf.`;
      } else {
        seg = { rot: seg.rot, phase: 'receive' };
        note = 'Der Gegner gewinnt den Ballwechsel: Das Team nimmt in derselben Rotation an.';
      }
      idx = 0;
      state = { ...state, rot: seg.rot, phase: seg.phase };
      renderMenu();
      show(1.8);
    }
    function back() {
      if (idx > 0) { idx -= 1; note = ''; show(); }
    }
    function tick() {
      if (!playing) return;
      advance();
      timer = setTimeout(tick, HOLD_MS);
    }
    function start() {
      playing = true;
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

  // ---------- Modus 6: Simulation ----------
  function modeSim() {
    const sys = SYSTEMS[state.system];
    const lines = [];
    let raf = 0;
    let last = 0;
    court.setOverlay({});
    const infoText = (rot, phase) => `Rotation ${rot} · ${phase === 'serve' ? 'wir schlagen auf' : 'Gegner schlägt auf'}`;

    panel.innerHTML = `<h2>Simulation</h2>
      <p class="meta">${sys.name}. Der Ball fliegt, alle laufen: Aufschlag, Annahme, Zuspiel, Angriff, Absicherung. Nach einem Punkt bei Annahme dreht das Team (Side-out).</p>
      <div class="scoreboard"><strong id="simScore">Wir 0 : 0 Gegner</strong><span id="simInfo">${infoText(state.rot, state.phase)}</span></div>
      <div class="row">
        <button type="button" id="pause">⏸ Pause</button>
        <label>Tempo <select id="speed"><option value="0.5">0,5×</option><option value="1" selected>1×</option><option value="2">2×</option></select></label>
        <label>Ausgang <select id="forced"><option value="auto">zufällig</option><option value="us">wir punkten</option><option value="them">Gegner punktet</option></select></label>
      </div>
      <div class="row"><button type="button" id="skip">Ballwechsel überspringen</button><button type="button" id="restart">Neu starten</button></div>
      <ol id="simLog" class="log"></ol>`;
    const logEl = panel.querySelector('#simLog');
    const onLog = (text) => {
      lines.unshift(text);
      lines.length = Math.min(lines.length, 8);
      logEl.innerHTML = lines.map((l) => `<li>${l}</li>`).join('');
    };
    const sim = VR.createSim({
      court, system: sys, rot: state.rot, phase: state.phase, opts: options(), onLog,
      onScore: (r) => {
        panel.querySelector('#simScore').textContent = `Wir ${r.us} : ${r.them} Gegner`;
        panel.querySelector('#simInfo').textContent = infoText(r.rot, r.phase);
      },
    });
    panel.querySelector('#pause').addEventListener('click', (e) => {
      sim.setPaused(!sim.state.paused);
      e.target.textContent = sim.state.paused ? '▶ Weiter' : '⏸ Pause';
    });
    panel.querySelector('#speed').addEventListener('change', (e) => sim.setSpeed(Number(e.target.value)));
    panel.querySelector('#forced').addEventListener('change', (e) => sim.setForced(e.target.value));
    panel.querySelector('#skip').addEventListener('click', () => sim.skip());
    panel.querySelector('#restart').addEventListener('click', () => setState({}));

    const loop = (ts) => {
      sim.tick(last ? (ts - last) / 1000 : 0);
      last = ts;
      raf = requestAnimationFrame(loop);
    };
    cleanup = () => { cancelAnimationFrame(raf); court.setFocus(null); };
    handler = null;
    let simFocus = null;
    tapHandler = (key) => { simFocus = simFocus === key ? null : key; court.setFocus(simFocus); };
    sim.start();
    raf = requestAnimationFrame(loop);
  }

  // ---------- Menü ----------
  function renderMenu() {
    const s = state;
    const sys = SYSTEMS[s.system];
    $('#modes').innerHTML = MODES.map((m) => `<button type="button" data-mode="${m.id}" title="${m.hint}" class="${m.id === s.mode ? 'on' : ''}">${m.name}</button>`).join('');
    const showRot = [1, 4, 5, 6].includes(s.mode);
    const showPhase = s.mode !== 3;
    const showLevel = s.mode === 2 || s.mode === 3;
    const dsIds = [...new Set(sys.base)].filter((id) => PLAYERS[id].pair !== 'middle');
    $('#menu').innerHTML = `
      ${showRot ? `<div class="seg" role="group" aria-label="Rotation">${[1, 2, 3, 4, 5, 6].map((r) => `<button type="button" data-rot="${r}" class="${r === s.rot ? 'on' : ''}">R${r}</button>`).join('')}</div>` : ''}
      ${showPhase ? `<div class="seg" role="group" aria-label="Phase">${['serve', 'receive'].map((p) => `<button type="button" data-phase="${p}" class="${p === s.phase ? 'on' : ''}">${phaseName(p)}</button>`).join('')}</div>` : ''}
      <details class="settings"><summary>⚙ ${s.system}</summary><div class="pop">
        <label>System <select data-key="system">${Object.values(SYSTEMS).map((x) => `<option value="${x.id}" ${x.id === s.system ? 'selected' : ''}>${x.name}</option>`).join('')}</select></label>
        <label class="chk"><input type="checkbox" data-key="libero" ${s.libero ? 'checked' : ''}> Libero für die Mitte</label>
        <label>DS für <select data-key="ds"><option value="">keiner</option>${dsIds.map((id) => `<option value="${id}" ${id === s.ds ? 'selected' : ''}>${PLAYERS[id].name}</option>`).join('')}</select></label>
        ${showLevel ? `<label>Stufe <select data-key="level">${['leicht', 'mittel', 'schwer'].map((l) => `<option ${l === s.level ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="chk"><input type="checkbox" data-key="timer" ${s.timer ? 'checked' : ''}> Zeitlimit 20 s</label>` : ''}
      </div></details>`;
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
    if (m === 1) modeFormation();
    else if (m === 4) modeStack();
    else if (m === 5) modeLearn();
    else if (m === 6) modeSim();
    else {
      cleanup = VR.startQuiz(m === 2 ? 'legal' : 'rotation', {
        state, court, panel, onScore: (sysId, rot, ok) => { VR.stats.record(sysId || state.system, rot, ok); renderScore(); },
      });
    }
  }

  function setState(patch) {
    const prevSystem = state.system;
    state = { ...state, ...patch };
    if (state.system !== prevSystem && !SYSTEMS[state.system].base.includes(state.ds)) state = { ...state, ds: '' };
    renderMenu();
    startMode();
  }

  $('#modes').addEventListener('click', (e) => { const b = e.target.closest('[data-mode]'); if (b) setState({ mode: Number(b.dataset.mode) }); });
  $('#menu').addEventListener('click', (e) => {
    const r = e.target.closest('[data-rot]');
    const p = e.target.closest('[data-phase]');
    if (r) setState({ rot: Number(r.dataset.rot) });
    if (p) setState({ phase: p.dataset.phase });
  });
  $('#menu').addEventListener('change', (e) => {
    const key = e.target.dataset.key;
    if (!key) return;
    setState({ [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  });

  function showStats() {
    const st = VR.stats.load();
    const rows = Object.values(SYSTEMS).map((sys) => `<tr><th>${sys.id}</th>${[1, 2, 3, 4, 5, 6].map((r) => {
      const v = st.byRot[`${sys.id}:${r}`];
      return `<td>${v ? `${Math.round((v.ok / v.total) * 100)}% <small>(${v.total})</small>` : '–'}</td>`;
    }).join('')}</tr>`).join('');
    const dlg = $('#statsDialog');
    dlg.innerHTML = `<h2>Statistik</h2><p>${st.points} Punkte · Streak ${st.streak} · bester Streak ${st.best}</p>
      <table><thead><tr><th></th>${[1, 2, 3, 4, 5, 6].map((r) => `<th>R${r}</th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
      <p><small>Trefferquote je System und Rotation (Anzahl Versuche in Klammern).</small></p>
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
