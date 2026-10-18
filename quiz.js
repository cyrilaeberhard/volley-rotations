// Quiz-Modi: "Legal oder Fehlstellung" (Modus 2) und Rotationsquiz (Modus 3).
(function () {
  const { SYSTEMS, PLAYERS, HOME_CELLS, STATEMENTS } = VR;
  const R = VR;
  const ROUND = 10;
  const SECONDS = 20;

  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const shuffle = (rng, arr) => arr.map((v) => [rng(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  const phaseName = (p) => (p === 'serve' ? 'Aufschlag' : 'Annahme');

  function pickContext(s, rng) {
    const rot = 1 + Math.floor(rng() * 6);
    if (s.level === 'leicht') return { sys: SYSTEMS[s.system], rot, phase: 'receive', opts: {} };
    const phase = pick(rng, ['serve', 'receive']);
    if (s.level === 'mittel') return { sys: SYSTEMS[s.system], rot, phase, opts: { libero: true } };
    const sys = SYSTEMS[pick(rng, Object.keys(SYSTEMS))];
    const dsChoices = sys.base.filter((id) => PLAYERS[id].pair !== 'middle');
    return { sys, rot, phase, opts: { libero: true, ds: pick(rng, dsChoices) } };
  }

  const homePositions = () => Object.fromEntries(R.SLOTS.map((slot) => [slot, { ...HOME_CELLS[slot] }]));
  const courtOf = (c, pos, status = {}, lines = []) => ({
    tokens: R.tokensFor(c.sys, c.rot, c.phase, pos, c.opts).map((t) => ({ ...t, status: status[t.slot] || '' })),
    lines,
  });

  // ---------- Fragen ----------
  function legalQuestion(s, rng) {
    const c = pickContext(s, rng);
    const legal = rng() < 0.5;
    const serverOutside = c.phase === 'serve' && s.level !== 'leicht' && rng() < 0.7;
    const pos = R.randomFormation(rng, { legal, serverOutside });
    const res = R.checkFormation(pos, { serving: c.phase === 'serve' });
    const bad = {};
    res.violations.forEach((v) => { bad[v.rule.a] = 'bad'; bad[v.rule.b] = 'bad'; });
    const lines = res.violations.map((v) => ({
      x1: pos[v.rule.a].x, y1: pos[v.rule.a].y, x2: pos[v.rule.b].x, y2: pos[v.rule.b].y, cls: 'bad',
    }));
    const explain = res.legal
      ? (res.serverExempt
        ? 'Legal. Der Aufschläger steht hinter der Endlinie und ist von den Überlappungsregeln ausgenommen. Alle anderen Nachbarn passen.'
        : 'Legal. Alle Nachbarn in der Reihe und in der Spalte stehen in der richtigen Reihenfolge.')
      : `Fehlstellung: ${res.violations.map((v) => v.text).join(' ')}`;
    return {
      prompt: `${c.sys.name}, Rotation ${c.rot}, ${phaseName(c.phase)}: Ist diese Aufstellung legal?`,
      options: ['Legal', 'Fehlstellung'],
      answer: res.legal ? 0 : 1,
      explain,
      court: courtOf(c, pos),
      reveal: courtOf(c, pos, bad, lines),
      sys: c.sys.id,
      rot: c.rot,
    };
  }

  function whoServes(s, rng) {
    const c = pickContext(s, rng);
    const n = 1 + Math.floor(rng() * 5);
    const ids = R.lineupFor(c.sys, c.rot);
    const after = R.rotateLineup(ids, n);
    const correct = after[0];
    const options = shuffle(rng, [correct, ...shuffle(rng, ids.filter((id) => id !== correct)).slice(0, 3)]);
    return {
      prompt: `${c.sys.name}, Rotation ${c.rot} (siehe Feld). Nach ${n} Side-out${n > 1 ? 's' : ''}: Wer steht auf Position 1 und schlägt auf?`,
      options: options.map((id) => `${PLAYERS[id].label} (${PLAYERS[id].name})`),
      answer: options.indexOf(correct),
      explain: `Jeder Side-out dreht im Uhrzeigersinn (Position 2 → 1 → 6 → 5 → 4 → 3 → 2). Nach ${n}× steht ${PLAYERS[correct].name} auf Position 1.`,
      court: courtOf({ ...c, opts: {} }, homePositions()),
      sys: c.sys.id,
      rot: c.rot,
    };
  }

  function whereAfter(s, rng) {
    const c = pickContext(s, rng);
    const ids = R.lineupFor(c.sys, c.rot);
    const slot = 1 + Math.floor(rng() * 6);
    const id = ids[slot - 1];
    const correct = slot === 1 ? 6 : slot - 1;
    const options = shuffle(rng, [correct, ...shuffle(rng, R.SLOTS.filter((p) => p !== correct)).slice(0, 3)]);
    return {
      prompt: `${c.sys.name}, Rotation ${c.rot}: ${PLAYERS[id].name} (${PLAYERS[id].label}) steht auf Position ${slot}. Auf welcher Position steht sie oder er nach einem Side-out?`,
      options: options.map((p) => `Position ${p}`),
      answer: options.indexOf(correct),
      explain: `Im Uhrzeigersinn drehen heißt: Position ${slot} → Position ${correct}.`,
      court: courtOf({ ...c, opts: {} }, homePositions()),
      sys: c.sys.id,
      rot: c.rot,
    };
  }

  function liberoQuestion(s, rng) {
    const c = { ...pickContext(s, rng), phase: 'receive' };
    c.opts = { ...c.opts, libero: true };
    const ids = R.lineupFor(c.sys, c.rot);
    const cands = R.SLOTS.filter((p) => PLAYERS[ids[p - 1]].pair === 'middle' && [5, 6, 1, 2].includes(p));
    const slot = pick(rng, cands);
    const m = PLAYERS[ids[slot - 1]];
    const court = courtOf(c, homePositions());
    const base = { court, sys: c.sys.id, rot: c.rot };
    if (slot === 2) {
      return {
        ...base,
        prompt: `Rotation ${c.rot}: ${m.label} steht vorn auf Position 2 und rotiert beim nächsten Side-out auf Position 1. Wer schlägt auf?`,
        options: [`${m.label} schlägt selbst auf`, 'Der Libero schlägt auf'],
        answer: 0,
        explain: 'Der Libero darf nicht aufschlagen. Die Mittelblockerin oder der Mittelblocker schlägt selbst auf.',
      };
    }
    const mustLeave = slot === 5;
    const stay = `Der Libero bleibt, ${m.label} bleibt in der Hinterreihe (Position ${slot === 1 ? 6 : slot - 1}).`;
    const leave = `Der Libero muss raus, ${m.label} spielt vorn auf Position 4.`;
    const options = shuffle(rng, [leave, stay]);
    return {
      ...base,
      prompt: `Rotation ${c.rot}: Der Libero spielt für ${m.label} auf Position ${slot}. Was passiert beim nächsten Side-out?`,
      options,
      answer: options.indexOf(mustLeave ? leave : stay),
      explain: mustLeave
        ? 'Rotiert die Mitte von 5 nach 4, kommt sie in die Vorderreihe. Der Libero darf nur hinten spielen und muss raus.'
        : 'Die Mitte bleibt hinten, also darf der Libero weiterspielen.',
    };
  }

  function statementQuestion(s, rng) {
    const tags = { leicht: ['rotation'], mittel: ['rotation', 'libero'], schwer: ['rotation', 'libero', 'ds'] }[s.level];
    const st = pick(rng, STATEMENTS.filter((x) => x.tags.some((t) => tags.includes(t))));
    return { prompt: st.text, options: ['Wahr', 'Falsch'], answer: st.answer ? 0 : 1, explain: st.explain, court: null, sys: null, rot: null, statement: st.text };
  }

  function rotationQuestion(s, rng) {
    const gens = [whoServes, whereAfter, statementQuestion];
    if (s.level !== 'leicht') gens.push(liberoQuestion);
    return pick(rng, gens)(s, rng);
  }

  function buildRound(kind, s, rng) {
    const make = kind === 'legal' ? legalQuestion : rotationQuestion;
    const seen = new Set();
    const out = [];
    for (let i = 0; i < 200 && out.length < ROUND; i += 1) {
      const q = make(s, rng);
      if (q.statement && seen.has(q.statement)) continue;
      if (q.statement) seen.add(q.statement);
      out.push(q);
    }
    return out;
  }

  // ---------- Ablauf ----------
  function startQuiz(kind, ctx) {
    const { state: s, court, panel, onScore } = ctx;
    let questions = buildRound(kind, s, Math.random);
    let idx = 0;
    let right = 0;
    let timerId = null;
    const stopTimer = () => { if (timerId) { clearInterval(timerId); timerId = null; } };

    function showCourt(spec, overlay) {
      if (!spec) { court.setTokens([]); court.setOverlay({}); return; }
      court.setTokens(spec.tokens);
      court.setOverlay(overlay ? { lines: spec.lines } : {});
    }

    function finish() {
      stopTimer();
      court.setTokens([]);
      court.setOverlay({});
      panel.innerHTML = `<h2>Runde fertig</h2><p class="big">${right} von ${questions.length} richtig</p>
        <button type="button" id="again" class="primary">Nochmal</button>`;
      panel.querySelector('#again').addEventListener('click', () => { questions = buildRound(kind, s, Math.random); idx = 0; right = 0; ask(); });
    }

    function answer(q, choice) {
      stopTimer();
      const ok = choice === q.answer;
      if (ok) right += 1;
      onScore(q.sys, q.rot, ok);
      if (q.reveal) showCourt(q.reveal, true);
      panel.querySelectorAll('.opt').forEach((b, i) => {
        b.disabled = true;
        if (i === q.answer) b.classList.add('right');
        else if (i === choice) b.classList.add('wrong');
      });
      const last = idx === questions.length - 1;
      panel.querySelector('.feedback').innerHTML = `<p class="${ok ? 'ok' : 'bad'}">${choice == null ? 'Zeit abgelaufen. ' : (ok ? 'Richtig. ' : 'Falsch. ')}${q.explain}</p>
        <button type="button" id="next" class="primary">${last ? 'Auswertung' : 'Weiter'}</button>`;
      panel.querySelector('#next').addEventListener('click', () => { idx += 1; if (idx >= questions.length) finish(); else ask(); });
    }

    function ask() {
      const q = questions[idx];
      showCourt(q.court, false);
      panel.innerHTML = `<div class="progress">Frage ${idx + 1} / ${questions.length} · richtig: ${right}</div>
        ${s.timer ? '<div class="timer"><div class="timer-bar"></div></div>' : ''}
        <h2>${q.prompt}</h2>
        <div class="options">${q.options.map((o, i) => `<button type="button" class="opt" data-i="${i}">${o}</button>`).join('')}</div>
        <div class="feedback"></div>`;
      panel.querySelectorAll('.opt').forEach((b) => b.addEventListener('click', () => answer(q, Number(b.dataset.i))));
      if (s.timer) {
        const bar = panel.querySelector('.timer-bar');
        const t0 = Date.now();
        timerId = setInterval(() => {
          const left = 1 - (Date.now() - t0) / (SECONDS * 1000);
          bar.style.width = `${Math.max(0, left) * 100}%`;
          if (left <= 0) answer(q, null);
        }, 100);
      }
    }

    ask();
    return stopTimer;
  }

  globalThis.VR = Object.assign(globalThis.VR || {}, { startQuiz });
})();
