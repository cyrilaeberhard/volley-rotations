// Regel-Engine ohne UI: Rotation, Überlappung, Bewertung, Zufallsaufstellungen.
(function () {
  const D = typeof module !== 'undefined' ? require('./data.js') : globalThis.VR;
  const { COURT, PLAYERS, SYSTEM } = D;

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
  // Rotation Pn: der Passeur steht auf Position n.
  const lineupFor = (rot) => rotateLineup(SYSTEM.base, 1 - rot);

  // Der Libero ersetzt die Mitte in der Hinterreihe.
  function displayLabel(id, slot) {
    const p = PLAYERS[id];
    if (p.pair === 'middle' && !isFront(slot)) return { text: 'L', kind: 'libero', name: 'Libero' };
    return { text: p.label, kind: 'normal', name: p.name };
  }

  function tokensFor(rot, pos) {
    const ids = lineupFor(rot);
    return SLOTS.map((slot) => ({ slot, id: ids[slot - 1], ...pos[slot], ...displayLabel(ids[slot - 1], slot) }));
  }

  // ---------- Überlappung ----------
  function checkFormation(pos, { tol = COURT.tol } = {}) {
    const violations = OVERLAP
      .map((rule) => ({ rule, delta: pos[rule.b][rule.axis] - pos[rule.a][rule.axis] }))
      .filter((v) => v.delta <= tol)
      .map((v) => ({ ...v, text: ruleText(v.rule) }));
    return { legal: violations.length === 0, violations };
  }

  // Plätze, die weiter als radius von der Zielstellung entfernt stehen.
  function gradeFormation(pos, target, radius = 1.5) {
    const far = SLOTS.filter((s) => dist(pos[s], target[s]) > radius);
    return { near: far.length === 0, far };
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

  function randomFormation(rng, { legal }) {
    for (let attempt = 0; attempt < 50; attempt += 1) {
      const fx = sortedSpread(rng, 0.5, 8.5, 0.9);
      const bx = sortedSpread(rng, 0.5, 8.5, 0.9);
      let pos = {};
      [4, 3, 2].forEach((s, i) => { pos[s] = { x: fx[i], y: between(rng, 0.5, 2.8) }; });
      [[5, 4], [6, 3], [1, 2]].forEach(([b, f], i) => {
        pos[b] = { x: bx[i], y: pos[f].y + 0.8 + rng() * (8.4 - pos[f].y - 0.8) };
      });
      if (!legal) {
        const r = OVERLAP[Math.floor(rng() * OVERLAP.length)];
        const [pa, pb] = [pos[r.a], pos[r.b]];
        pos = { ...pos, [r.a]: { ...pa, [r.axis]: pb[r.axis] }, [r.b]: { ...pb, [r.axis]: pa[r.axis] } };
      }
      const rounded = Object.fromEntries(SLOTS.map((s) => [s, { x: round2(pos[s].x), y: round2(pos[s].y) }]));
      if (checkFormation(rounded).legal === legal) return rounded;
    }
    throw new Error('randomFormation: keine passende Aufstellung gefunden');
  }

  const api = {
    SLOTS, OVERLAP, isFront, dist, ruleText, rotateLineup, lineupFor, displayLabel, tokensFor,
    checkFormation, gradeFormation, makeRng, randomFormation,
  };
  if (typeof module !== 'undefined') module.exports = api;
  else globalThis.VR = Object.assign(globalThis.VR || {}, api);
})();
