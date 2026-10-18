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

  function planFor(system, rot, phase) {
    const pdf = system.id === '5-1' ? PDF_PLANS[`${rot}-${phase}`] : null;
    return pdf ? { source: 'PDF', steps: pdf.steps } : computedPlan(system, rot, phase);
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

  const api = { planFor, idealFor, stepTokens, posesFor, spotsByRole };
  if (node) module.exports = api;
  else globalThis.VR = Object.assign(globalThis.VR || {}, api);
})();
