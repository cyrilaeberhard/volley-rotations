// Abläufe für den Lernmodus: 5-1 exakt nach dem Plan-PDF, 6-2 und 4-2 aus der Regel-Engine berechnet.
(function () {
  const node = typeof module !== 'undefined';
  const R = node ? require('./rules.js') : globalThis.VR;
  const { PDF_PLANS } = node ? require('./pdf-plans.js') : globalThis.VR;

  const GENERIC = {
    serveStack: 'Aufstellung vor dem Aufschlag: Stack um die vordere Mitte. Der Aufschläger steht hinter der Endlinie und muss nicht auf seine relative Position achten.',
    serveSwitch: 'Nach dem Aufschlagkontakt wechseln alle auf ihre Abwehrposition. Der Aufschläger läuft ins Feld.',
    base: 'Das Team steht in der Grundposition für die Abwehr.',
    recvStack: 'Annahme-Stack: Der Zuspieler steht nah an seinem Zuspielpunkt. Steht er auf 4 oder 5, hat die vordere Außenangreiferin Vorrang.',
    recvSwitch: 'Nach der Annahme gehen alle auf ihre Angriffsposition, der Zuspieler zum Zuspielpunkt.',
  };

  const byRole = (ids, bySlot) => Object.fromEntries(ids.map((id, i) => [id, bySlot[i + 1]]));

  function computedPlan(system, rot, phase) {
    const ideal = R.idealStack(system, rot, phase);
    const ids = ideal.ids;
    const defense = R.targetSpots(system, ids, 'serve');
    const step = (title, caption, pos, delays = {}) => ({ title, caption, pos: byRole(ids, pos), delays, passers: [] });
    if (phase === 'serve') {
      const server = ids[0];
      const delays = Object.fromEntries(ids.map((id) => [id, id === server ? 0 : 0.3]));
      return { source: 'berechnet', steps: [
        step('Stack vor dem Aufschlag', GENERIC.serveStack, ideal.pos),
        step('Übergang zur Abwehr', GENERIC.serveSwitch, defense, delays),
        step('Grundposition Abwehr', GENERIC.base, defense),
      ] };
    }
    const setter = ids.find((id, i) => R.isSetting(system, id, i + 1));
    const delays = Object.fromEntries(ids.map((id) => [id, id === setter ? 0 : 0.6]));
    return { source: 'berechnet', steps: [
      step('Stack', GENERIC.recvStack, ideal.pos),
      step('Übergang zum Angriff', GENERIC.recvSwitch, ideal.targets, delays),
      step('Grundposition Abwehr', GENERIC.base, defense),
    ] };
  }

  // ---------- Absicherung (Soutien) ----------
  // Das PDF liefert hier nur die Grundstellung. Die Wege je Angriffsseite werden berechnet:
  // Der Angreifer springt am Netz, alle anderen (außer dem Zuspieler) bilden einen Halbkreis dahinter.
  const COVER_SIDES = { links: 'links', mitte: 'der Mitte', rechts: 'rechts' };
  const ARC = { cy: 0.9, rx: 2.6, ry: 3.4, angles: [160, 115, 65, 20] };
  const clampX = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  function coverPlan(system, rot, ready, side) {
    const ids = R.lineupFor(system, rot);
    const slotOf = (id) => ids.indexOf(id) + 1;
    const setter = ids.find((id) => R.isSetting(system, id, slotOf(id)));
    const hitters = ids.filter((id) => id !== setter && R.isFront(slotOf(id))).sort((a, b) => ready[a].x - ready[b].x);
    const middle = hitters.find((id) => PLAYERS_PAIR(id) === 'middle')
      || [...hitters].sort((a, b) => Math.abs(ready[a].x - 4.5) - Math.abs(ready[b].x - 4.5))[0];
    const hitter = { links: hitters[0], mitte: middle, rechts: hitters[hitters.length - 1] }[side];
    const ax = clampX(ready[hitter].x, 1.2, 7.8);
    const cx = clampX(ax, 3, 6);
    const spots = ARC.angles.map((deg) => ({
      x: cx + ARC.rx * Math.cos((deg * Math.PI) / 180), y: ARC.cy + ARC.ry * Math.sin((deg * Math.PI) / 180),
    }));
    const others = ids.filter((id) => id !== hitter && id !== setter).sort((a, b) => ready[a].x - ready[b].x);
    const pos = { ...ready, [hitter]: { x: ax, y: 1.0 } };
    others.forEach((id, i) => { pos[id] = spots[i]; });
    const arc = [];
    for (let deg = 0; deg < 180; deg += 15) {
      const a = (d) => ({ x: cx + ARC.rx * Math.cos((d * Math.PI) / 180), y: ARC.cy + ARC.ry * Math.sin((d * Math.PI) / 180) });
      const [p, q] = [a(deg), a(deg + 15)];
      arc.push({ x1: p.x, y1: p.y, x2: q.x, y2: q.y, cls: 'move' });
    }
    const name = PLAYERS_NAME(hitter);
    const caption = `Absicherung bei Angriff über ${COVER_SIDES[side]}: ${name} greift an. Alle anderen außer dem Zuspieler bilden einen Halbkreis etwa 2 bis 4 m hinter dem Angreifer, damit sie einen geblockten Ball erreichen. Der Zuspieler bleibt am Netz.`;
    return { pos, caption, cover: { hitter, side, arc } };
  }

  function planFor(system, rot, phase, side = 'links') {
    const pdf = system.id === '5-1' ? PDF_PLANS[`${rot}-${phase}`] : null;
    if (!pdf) return computedPlan(system, rot, phase);
    const steps = pdf.steps.map((st) => (phase === 'receive' && st.title === 'Absicherung'
      ? { ...st, ...coverPlan(system, rot, pdf.steps[2].pos, side) }
      : st));
    return { source: 'PDF', steps };
  }

  // Ideal-Stack und Wechsel-Ziele für Modus 4: 5-1 nach PDF, sonst berechnet.
  function idealFor(system, rot, phase) {
    const alg = R.idealStack(system, rot, phase);
    const pdf = system.id === '5-1' ? PDF_PLANS[`${rot}-${phase}`] : null;
    if (!pdf) return alg;
    const bySlot = (frame) => Object.fromEntries(alg.ids.map((id, i) => [i + 1, frame[id]]));
    return { ...alg, pos: bySlot(pdf.steps[0].pos), targets: bySlot(pdf.steps[2].pos) };
  }

  // Token-Liste eines Schritts; Schlüssel = Rolle, damit Spieler zwischen Schritten und Rotationen wandern.
  function stepTokens(system, rot, phase, step, opts = {}, duration = 1.0) {
    const ids = R.lineupFor(system, rot);
    return ids.map((id, i) => ({
      key: id, slot: i + 1, id, ...step.pos[id], ...R.displayLabel(id, i + 1, phase, opts),
      passer: step.passers.includes(id), delay: step.delays[id] ?? 0, duration,
    }));
  }

  // Haltungen für die Simulation: stack, ready (angriffsbereit), cover (Absicherung), defense (Grundposition Abwehr).
  function posesFor(system, rot, phase) {
    const plan = planFor(system, rot, phase);
    const at = (i) => plan.steps[Math.min(i, plan.steps.length - 1)].pos;
    if (phase === 'receive') {
      return plan.source === 'PDF'
        ? { stack: at(0), ready: at(2), cover: at(3), defense: at(5) }
        : { stack: at(0), ready: at(1), cover: at(2), defense: at(2) };
    }
    return { stack: at(0), ready: at(2), cover: at(2), defense: at(2) };
  }

  // Berechnete Angriffs- und Abwehrpunkte je Rolle (für Ballwechsel nach dem ersten Kontakt).
  function spotsByRole(system, rot) {
    const ids = R.lineupFor(system, rot);
    return { ready: byRole(ids, R.targetSpots(system, ids, 'receive')), defense: byRole(ids, R.targetSpots(system, ids, 'serve')) };
  }

  // Was ein einzelner Spieler in jedem Schritt tut: { title, verb, text } je Schritt.
  function playerActions(system, rot, phase, role) {
    const ids = R.lineupFor(system, rot);
    const slot = ids.indexOf(role) + 1;
    const front = R.isFront(slot);
    const setter = R.isSetting(system, role, slot);
    const pair = PLAYERS_PAIR(role);
    const server = phase === 'serve' && slot === 1;
    const attackText = pair === 'middle'
      ? 'Schneller Angriff in der Mitte: Anlauf so timen, dass du kurz vor dem Zuspiel abspringst.'
      : pair === 'setter'
        ? 'Angriff über rechts außen: Anlauf nehmen, Ball verlangen.'
        : 'Außenangriff über links: Anlauf nehmen, Ball verlangen, hoch und scharf spielen.';
    const blockText = pair === 'middle'
      ? 'Mittelblock: Block lesen und mit der Außenspielerin oder dem Außenspieler zum Doppelblock schließen.'
      : 'Block am Netz stellen. Außen blockt in der Regel mit der Mitte zusammen.';
    const table = {
      'Stack vor dem Aufschlag': server
        ? ['Aufschlagen', 'Hinter der Endlinie stehen. Nach dem Ballkontakt sofort ins Feld laufen.']
        : front ? ['Block vorbereiten', 'Stack halten und die vordere Mitte im Blick behalten. Nach dem Aufschlag zum Block bereit sein.']
          : ['Abwehr vorbereiten', 'Stack halten. Nach dem Aufschlag auf die Abwehrposition wechseln.'],
      'Übergang zur Abwehr': server
        ? ['Ins Feld laufen', 'Nach dem Aufschlag sofort auf die eigene Abwehrposition laufen.']
        : ['Auf Abwehr wechseln', 'Nach dem Aufschlagkontakt auf die Abwehrposition wechseln. Vorderreihe zum Block, Hinterreihe tief.'],
      Stack: setter
        ? ['Zuspiel vorbereiten', 'Nah am Zuspielpunkt starten. Nicht annehmen, den Weg zum Netz freihalten.']
        : null,
      'Übergang zum Angriff': setter
        ? ['Zum Zuspielpunkt', 'Sobald der Ball aufgeschlagen ist, sofort zum Zuspielpunkt am Netz laufen.']
        : null,
      Angriffsbereit: setter
        ? ['Zuspielen', 'Zum Ball laufen und die Angreifer sauber anspielen.']
        : front ? ['Angriffsbereit', attackText]
          : ['Absicherung', 'Tief und verteilt bleiben, falls der Angriff geblockt wird.'],
      Absicherung: front
        ? [setter ? 'Absichern' : 'Angreifen oder absichern', 'Je nach Angriffsseite greifst du an oder sicherst kurz ab. Wer keinen Weg hat, bleibt bereit.']
        : ['Angreifer absichern', 'Näher zum Angreifer rücken, tief bleiben und den geblockten Ball annehmen.'],
      'Wechsel in die Abwehr': front
        ? ['Zum Block', 'Sobald der Ball über dem Netz ist: zurück ans Netz und die Blockposition einnehmen.']
        : ['Abwehr einnehmen', 'Sobald der Ball über dem Netz ist: auf die eigene Abwehrposition wechseln, tief und bereit.'],
      'Grundposition Abwehr': front
        ? ['Blocken', blockText]
        : ['Abwehr', 'Tief stehen, Hände vorn, Ball lesen. Den Block und die Angreifer im Blick behalten.'],
    };
    return planFor(system, rot, phase).steps.map((step) => {
      const passer = step.passers.includes(role);
      let hit = table[step.title];
      if (step.title === 'Stack' && !hit) {
        hit = passer ? ['Annahme bereit', 'Du nimmst an. Tief und breit stehen, den Aufschlag lesen, Plattform vorbereiten.']
          : ['Kurze Bälle decken', 'Du nimmst nicht an. Decke kurze Aufschläge und löse dich nach dem Aufschlag zum Angriff.'];
      }
      if (step.title === 'Übergang zum Angriff' && !hit) {
        hit = passer ? ['Erst annehmen', 'Spiel den Ball genau zum Zuspieler. Erst danach auf die Angriffsposition gehen.']
          : front ? ['Zum Angriff lösen', 'Löse dich zur Angriffsposition. Achte auf kurze Aufschläge.']
            : ['Bereit zur Absicherung', 'Folge dem Spiel und sei bereit, den Angreifer abzusichern.'];
      }
      const [verb, text] = hit || ['Position halten', step.caption];
      return { title: step.title, verb, text };
    });
  }
  const PLAYERS_NAME = (role) => (globalThis.VR ? globalThis.VR.PLAYERS : require('./data.js').PLAYERS)[role].name;
  const PLAYERS_PAIR = (role) => (globalThis.VR ? globalThis.VR.PLAYERS : require('./data.js').PLAYERS)[role].pair;

  const api = { COVER_SIDES, planFor, idealFor, stepTokens, posesFor, spotsByRole, playerActions };
  if (node) module.exports = api;
  else globalThis.VR = Object.assign(globalThis.VR || {}, api);
})();
