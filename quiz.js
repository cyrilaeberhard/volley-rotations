// Quiz-Modi: "Legal oder Fehlstellung" (Modus 4) und Playbook-Quiz (Modus 5).
(function () {
  const { PLAYERS } = VR;
  const R = VR;
  const ROUND = 10;
  const SECONDS = 20;

  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
  const shuffle = (rng, arr) => arr.map((v) => [rng(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  const rotName = (rot) => `P${rot}`;
  // Anzeigename einer Rolle auf einem Platz: die Mitte der Hinterreihe heißt Libero.
  const shown = (id, slot) => R.displayLabel(id, slot).text;

  // Aussagen aus dem Playbook.
  const STATEMENTS = [
    { text: 'Unser Spielsystem ist das 5-1.', answer: true, explain: 'Playbook, Spielsystem: 5-1.' },
    { text: 'Unser Spielsystem ist das 6-2.', answer: false, explain: 'Playbook, Spielsystem: 5-1.' },
    { text: 'In der Annahme nehmen beide A und der Libero an.', answer: true, explain: 'Playbook, Annahme P1 bis P6: A, A und M/L bilden die Annahme.' },
    { text: 'Die 7 heißt «Schuss».', answer: true, explain: 'Playbook, Angriffsvarianten: 7 = «Schuss».' },
    { text: 'Die 0 ist auch schnell spielbar.', answer: true, explain: 'Playbook, Angriffsvarianten: 0 = auch schnell spielbar.' },
    { text: 'Bei «6 und 1» ruft die Mitte spontan.', answer: true, explain: 'Playbook: Bei 6 und 1 ruft die Mitte spontan.' },
    { text: 'Bei «6 und 1» ruft Dia spontan.', answer: false, explain: 'Playbook: Bei 6 und 1 ruft die Mitte spontan, bei 3 und 1 ruft Dia.' },
    { text: 'Bei «3 und 1» ruft Dia spontan.', answer: true, explain: 'Playbook: Bei 3 und 1 ruft Dia spontan.' },
    { text: 'Bei «3 und 1» ruft die Mitte spontan.', answer: false, explain: 'Playbook: Bei 3 und 1 ruft Dia spontan, bei 6 und 1 die Mitte.' },
  ];

  const courtOf = (rot, pos, status = {}, lines = []) => ({
    tokens: R.tokensFor(rot, pos).map((t) => ({ ...t, status: status[t.slot] || '' })),
    lines,
  });

  // ---------- Fragen ----------
  function legalQuestion(rng) {
    const rot = 1 + Math.floor(rng() * 6);
    const legal = rng() < 0.5;
    const pos = R.randomFormation(rng, { legal });
    const res = R.checkFormation(pos);
    const bad = {};
    res.violations.forEach((v) => { bad[v.rule.a] = 'bad'; bad[v.rule.b] = 'bad'; });
    const lines = res.violations.map((v) => ({
      x1: pos[v.rule.a].x, y1: pos[v.rule.a].y, x2: pos[v.rule.b].x, y2: pos[v.rule.b].y, cls: 'bad',
    }));
    return {
      prompt: `${rotName(rot)}: Ist diese Aufstellung legal?`,
      options: ['Legal', 'Fehlstellung'],
      answer: res.legal ? 0 : 1,
      explain: res.legal
        ? 'Legal. Alle Nachbarn in der Reihe und in der Spalte stehen in der richtigen Reihenfolge.'
        : `Fehlstellung: ${res.violations.map((v) => v.text).join(' ')}`,
      court: courtOf(rot, pos),
      reveal: courtOf(rot, pos, bad, lines),
      rot,
    };
  }

  function whoOnSlot(rng) {
    const rot = 1 + Math.floor(rng() * 6);
    const ids = R.lineupFor(rot);
    const slot = 1 + Math.floor(rng() * 6);
    const correct = ids[slot - 1];
    const roles = Object.keys(PLAYERS);
    const options = shuffle(rng, [correct, ...shuffle(rng, roles.filter((id) => id !== correct)).slice(0, 3)]);
    return {
      prompt: `${rotName(rot)} (Passeur auf Position ${rot}): Wer steht auf Position ${slot}?`,
      options: options.map((id) => PLAYERS[id].label),
      answer: options.indexOf(correct),
      explain: `In ${rotName(rot)} steht ${PLAYERS[correct].name} (${PLAYERS[correct].label}) auf Position ${slot}. Die Reihenfolge im Uhrzeigersinn ist P, A¹, M², D, A², M¹.`,
      court: null,
      rot,
    };
  }

  function slotOfRole(rng) {
    const rot = 1 + Math.floor(rng() * 6);
    const ids = R.lineupFor(rot);
    const id = pick(rng, ids);
    const correct = ids.indexOf(id) + 1;
    const options = shuffle(rng, [correct, ...shuffle(rng, R.SLOTS.filter((p) => p !== correct)).slice(0, 3)]);
    return {
      prompt: `${rotName(rot)} (Passeur auf Position ${rot}): Auf welcher Position steht ${PLAYERS[id].label} (${PLAYERS[id].name})?`,
      options: options.map((p) => `Position ${p}`),
      answer: options.indexOf(correct),
      explain: `In ${rotName(rot)} steht ${PLAYERS[id].label} auf Position ${correct}.`,
      court: null,
      rot,
    };
  }

  function liberoQuestion(rng) {
    const rot = 1 + Math.floor(rng() * 6);
    const ids = R.lineupFor(rot);
    const correct = ids.findIndex((id, i) => R.displayLabel(id, i + 1).kind === 'libero') + 1;
    const options = shuffle(rng, [correct, ...shuffle(rng, R.SLOTS.filter((p) => p !== correct)).slice(0, 3)]);
    return {
      prompt: `${rotName(rot)}: Auf welcher Position spielt der Libero (für die Mitte der Hinterreihe)?`,
      options: options.map((p) => `Position ${p}`),
      answer: options.indexOf(correct),
      explain: `In ${rotName(rot)} steht ${shown(ids[correct - 1], correct)} auf Position ${correct}: ${PLAYERS[ids[correct - 1]].label} wird durch den Libero ersetzt.`,
      court: null,
      rot,
    };
  }

  function rowQuestion(rng) {
    const rot = 1 + Math.floor(rng() * 6);
    const ids = R.lineupFor(rot);
    const slot = 1 + Math.floor(rng() * 6);
    const id = ids[slot - 1];
    const front = R.isFront(slot);
    return {
      prompt: `${rotName(rot)}: ${PLAYERS[id].label} steht auf Position ${slot}. Vorder- oder Hinterreihe?`,
      options: ['Vorderreihe', 'Hinterreihe'],
      answer: front ? 0 : 1,
      explain: `Die Positionen 2, 3 und 4 sind die Vorderreihe, 5, 6 und 1 die Hinterreihe. Position ${slot}: ${front ? 'Vorderreihe' : 'Hinterreihe'}.`,
      court: null,
      rot,
    };
  }

  function statementQuestion(rng) {
    const st = pick(rng, STATEMENTS);
    return { prompt: st.text, options: ['Wahr', 'Falsch'], answer: st.answer ? 0 : 1, explain: st.explain, court: null, rot: null, statement: st.text };
  }

  const playbookQuestion = (rng) => pick(rng, [whoOnSlot, slotOfRole, liberoQuestion, rowQuestion, statementQuestion])(rng);

  function buildRound(kind, rng) {
    const make = kind === 'legal' ? legalQuestion : playbookQuestion;
    const seen = new Set();
    const out = [];
    for (let i = 0; i < 200 && out.length < ROUND; i += 1) {
      const q = make(rng);
      if (q.statement && seen.has(q.statement)) continue;
      if (q.statement) seen.add(q.statement);
      out.push(q);
    }
    return out;
  }

  // ---------- Ablauf ----------
  function startQuiz(kind, ctx) {
    const { state: s, court, panel, onScore } = ctx;
    let questions = buildRound(kind, Math.random);
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
      panel.querySelector('#again').addEventListener('click', () => { questions = buildRound(kind, Math.random); idx = 0; right = 0; ask(); });
    }

    function answer(q, choice) {
      stopTimer();
      const ok = choice === q.answer;
      if (ok) right += 1;
      onScore(q.rot, ok);
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
