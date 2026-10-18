// Regel-Engine ohne UI: Rotation, Überlappung, Stack-Ideal, Wechsel-Ziele, Zufallsaufstellungen.
(function () {
  const D = typeof module !== 'undefined' ? require('./data.js') : globalThis.VR;
  const { COURT, PLAYERS, FRONT_POS, BACK_POS, DEFENSE, ATTACK, SETTER_SPOT, SERVE_SPOT } = D;

  const SLOTS = [1, 2, 3, 4, 5, 6];
  const isFront = (slot) => slot >= 2 && slot <= 4;
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  // a muss links von b stehen (x) bzw. näher am Netz als b (y).
  const OVERLAP = [
    { id: 'x43', a: 4, b: 3, axis: 'x' }, { id: 'x32', a: 3, b: 2, axis: 'x' },
    { id: 'x56', a: 5, b: 6, axis: 'x' }, { id: 'x61', a: 6, b: 1, axis: 'x' },
    { id: 'y45', a: 4, b: 5, axis: 'y' }, { id: 'y36', a: 3, b: 6, axis: 'y' },
    { id: 'y21', a: 2, b: 1, axis: 'y' },
  ];
  const ruleText = (r) => (r.axis === 'x'
    ? `Position ${r.a} muss links von Position ${r.b} stehen.`
    : `Position ${r.a} muss näher am Netz stehen als Position ${r.b}.`);

  // ---------- Rotation ----------
  // Ein Side-out dreht im Uhrzeigersinn: Pos 2→1, 1→6, 6→5 ... Liste Index 0 = Position 1.
  function rotateLineup(ids, n) {
    let l = ids;
    for (let i = 0; i < ((n % 6) + 6) % 6; i += 1) l = [...l.slice(1), l[0]];
    return l;
  }
  const lineupFor = (system, rot) => rotateLineup(system.base, rot - 1);

  function isSetting(system, id, slot) {
    if (!system.setters.includes(id)) return false;
    if (system.setterRow === 'back') return !isFront(slot);
    if (system.setterRow === 'front') return isFront(slot);
    return true;
  }

  function displayLabel(id, slot, phase, opts = {}) {
    const p = PLAYERS[id];
    const back = !isFront(slot);
    const servesNow = phase === 'serve' && slot === 1;
    if (opts.libero && p.pair === 'middle' && back && !servesNow) return { text: 'L', kind: 'libero', name: 'Libero' };
    if (opts.ds && opts.ds === id && back) return { text: 'DS', kind: 'ds', name: 'Abwehrspezialist' };
    return { text: p.label, kind: 'normal', name: p.name };
  }

  function tokensFor(system, rot, phase, pos, opts = {}) {
    const ids = lineupFor(system, rot);
    return SLOTS.map((slot) => ({ slot, id: ids[slot - 1], ...pos[slot], ...displayLabel(ids[slot - 1], slot, phase, opts) }));
  }

  // ---------- Überlappung ----------
  function checkFormation(pos, { serving = false, tol = COURT.tol } = {}) {
    const exempt = serving && pos[1].y > COURT.depth;
    const violations = OVERLAP
      .filter((r) => !(exempt && (r.a === 1 || r.b === 1)))
      .map((rule) => ({ rule, delta: pos[rule.b][rule.axis] - pos[rule.a][rule.axis] }))
      .filter((v) => v.delta <= tol)
      .map((v) => ({ ...v, text: ruleText(v.rule) }));
    return { legal: violations.length === 0, violations, serverExempt: exempt };
  }

  // ---------- Ziele und Ideal-Stack ----------
  function targetSpots(system, ids, phase) {
    const out = {};
    SLOTS.forEach((slot) => {
      const id = ids[slot - 1];
      const pair = PLAYERS[id].pair;
      const front = isFront(slot);
      const spot = front ? FRONT_POS[pair] : BACK_POS[pair];
      if (phase === 'receive' && isSetting(system, id, slot)) out[slot] = { ...SETTER_SPOT };
      else if (phase === 'receive' && front) out[slot] = { ...ATTACK[spot] };
      else out[slot] = { ...DEFENSE[spot] };
    });
    return out;
  }

  function anchorSlot(system, ids, phase) {
    const frontWith = (pair) => SLOTS.find((s) => isFront(s) && PLAYERS[ids[s - 1]].pair === pair);
    if (phase === 'serve') return frontWith('middle');
    const setterSlot = SLOTS.find((s) => isSetting(system, ids[s - 1], s));
    if (setterSlot && setterSlot !== 4 && setterSlot !== 5) return setterSlot;
    return frontWith('outside');
  }

  // Gewichtete Kleinste-Quadrate-Anpassung mit Reihenfolge-Zwang (Pool Adjacent Violators).
  function isotonic(values, weights) {
    const blocks = [];
    values.forEach((v, i) => {
      blocks.push({ s: v * weights[i], w: weights[i], n: 1 });
      while (blocks.length > 1) {
        const b = blocks[blocks.length - 1];
        const a = blocks[blocks.length - 2];
        if (a.s / a.w <= b.s / b.w) break;
        blocks.splice(-2, 2, { s: a.s + b.s, w: a.w + b.w, n: a.n + b.n });
      }
    });
    return blocks.flatMap((b) => Array(b.n).fill(b.s / b.w));
  }
  const orderedChain = (values, weights, margin) => isotonic(values.map((v, i) => v - margin * i), weights)
    .map((v, i) => v + margin * i);
  function orderedPair(tf, tb, wf, wb, margin) {
    const d = margin - (tb - tf);
    return d <= 0 ? [tf, tb] : [tf - (d * wb) / (wf + wb), tb + (d * wf) / (wf + wb)];
  }

  const MIN_NET_DISTANCE = 0.7;
  const STACK_MARGIN = 1.3; // etwas mehr als ein Token-Durchmesser, damit gestackte Spieler sich nicht verdecken

  function idealStack(system, rot, phase) {
    const ids = lineupFor(system, rot);
    const t = targetSpots(system, ids, phase);
    const serving = phase === 'serve';
    const anchor = anchorSlot(system, ids, phase);
    const w = (s) => (s === anchor ? 4 : 1);
    const pos = {};
    [[4, 3, 2], serving ? [5, 6] : [5, 6, 1]].forEach((chain) => {
      const xs = orderedChain(chain.map((s) => t[s].x), chain.map(w), STACK_MARGIN);
      chain.forEach((s, i) => { pos[s] = { x: xs[i], y: t[s].y }; });
    });
    if (serving) pos[1] = { ...SERVE_SPOT };
    [[4, 5], [3, 6], [2, 1]].forEach(([f, b]) => {
      if (serving && b === 1) return;
      const [yf, yb] = orderedPair(t[f].y, t[b].y, w(f), w(b), STACK_MARGIN);
      const frontY = Math.max(yf, MIN_NET_DISTANCE); // nicht ins Netz stacken
      pos[f] = { ...pos[f], y: frontY };
      pos[b] = { ...pos[b], y: Math.max(yb, frontY + STACK_MARGIN) };
    });
    return { pos, anchor, targets: t, ids };
  }

  function gradeStack(pos, ideal, radius = 1.5) {
    const far = SLOTS.filter((s) => dist(pos[s], ideal[s]) > radius);
    return { near: far.length === 0, far };
  }

  // Wechsel nach dem Aufschlag-Kontakt: Zielpunkte und Reihenwechsel prüfen.
  function gradeSwitch(system, ids, phase, pos, radius = 1.2) {
    const t = targetSpots(system, ids, phase);
    const far = SLOTS.filter((s) => dist(pos[s], t[s]) > radius);
    const rowChanges = SLOTS.filter((s) => {
      if (isSetting(system, ids[s - 1], s) && !isFront(s)) return false; // zustellende Hinterspielerin darf nach vorn laufen
      return isFront(s) !== (pos[s].y < COURT.attackLine);
    });
    return { ok: far.length === 0 && rowChanges.length === 0, far, rowChanges, targets: t };
  }

  // ---------- Zufall ----------
  function makeRng(seed) {
    let a = seed >>> 0;
    return function rng() {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const between = (rng, lo, hi) => lo + (hi - lo) * rng();
  const round2 = (v) => Math.round(v * 100) / 100;

  function sortedSpread(rng, lo, hi, gap) {
    for (let i = 0; i < 200; i += 1) {
      const xs = [between(rng, lo, hi), between(rng, lo, hi), between(rng, lo, hi)].sort((p, q) => p - q);
      if (xs[1] - xs[0] >= gap && xs[2] - xs[1] >= gap) return xs;
    }
    return [1.5, 4.5, 7.5];
  }

  function randomFormation(rng, { legal, serverOutside = false }) {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const fx = sortedSpread(rng, 0.5, 8.5, 0.9);
      const bx = sortedSpread(rng, 0.5, 8.5, 0.9);
      let pos = {};
      [4, 3, 2].forEach((s, i) => { pos[s] = { x: fx[i], y: between(rng, 0.5, 2.8) }; });
      [[5, 4], [6, 3], [1, 2]].forEach(([b, f], i) => {
        pos[b] = { x: bx[i], y: pos[f].y + 0.8 + rng() * (8.4 - pos[f].y - 0.8) };
      });
      if (serverOutside) pos[1] = { x: between(rng, 0.5, 8.5), y: 9.8 };
      if (!legal) {
        const pool = OVERLAP.filter((r) => !(serverOutside && (r.a === 1 || r.b === 1)));
        const r = pool[Math.floor(rng() * pool.length)];
        const [pa, pb] = [pos[r.a], pos[r.b]];
        pos = { ...pos, [r.a]: { ...pa, [r.axis]: pb[r.axis] }, [r.b]: { ...pb, [r.axis]: pa[r.axis] } };
      }
      const rounded = Object.fromEntries(SLOTS.map((s) => [s, { x: round2(pos[s].x), y: round2(pos[s].y) }]));
      if (checkFormation(rounded, { serving: serverOutside }).legal === legal) return rounded;
    }
    throw new Error('randomFormation: keine passende Aufstellung gefunden');
  }

  const api = {
    SLOTS, OVERLAP, isFront, dist, ruleText, rotateLineup, lineupFor, isSetting, displayLabel, tokensFor,
    checkFormation, targetSpots, anchorSlot, idealStack, gradeStack, gradeSwitch, makeRng, randomFormation,
  };
  if (typeof module !== 'undefined') module.exports = api;
  else globalThis.VR = Object.assign(globalThis.VR || {}, api);
})();
