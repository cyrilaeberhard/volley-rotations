// Playbook-Daten (Volero Aarberg 2026/27), von den Skizzen in Meter übertragen. Schlüssel je Rotation: Pn = Passeur auf Position n.
// Quellen: "Basis Aufstellung", "Annahme (K1)" P1 bis P6 und die beschriftete "Defence"-Skizze.
(function () {
  const node = typeof module !== 'undefined';
  const R = node ? require('./rules.js') : globalThis.VR;
  const { PLAYERS } = node ? require('./data.js') : globalThis.VR;

  // Basis Aufstellung: Positionen je Platz (Skizze mit Passeur auf 2), gilt für jede Rotation.
  const BASIS = {
    1: { x: 7.08, y: 5.69 }, 2: { x: 6.96, y: 0.5 }, 3: { x: 4.19, y: 0.5 },
    4: { x: 1.16, y: 0.5 }, 5: { x: 1.79, y: 5.9 }, 6: { x: 4.29, y: 7.23 },
  };

  // Annahme K1: Aufstellung je Platz und Angriffswege (Pfeile: Platz → x am Netz).
  // Korrigiert gegen die Überlappungsregel (Skizze zeigt dort eine Gleichstandstellung oder verdrehte Nachbarn):
  // P2 Plätze 3/6 (0.15 m), P4 Plätze 3/4 (0.42 m), P5 Plätze 3, 4, 5 (bis 1.03 m). P1, P3 und P6 sind wie gezeichnet.
  const RECEIVE = {
    1: {
      pos: { 1: { x: 8.69, y: 6.31 }, 2: { x: 7.58, y: 5.41 }, 3: { x: 4.56, y: 0.96 }, 4: { x: 0.75, y: 2.70 }, 5: { x: 1.47, y: 6.24 }, 6: { x: 4.36, y: 6.90 } },
      attack: { 4: 0.44, 3: 4.56, 2: 8.69 },
    },
    2: {
      pos: { 1: { x: 7.18, y: 6.40 }, 2: { x: 6.20, y: 0.78 }, 3: { x: 1.35, y: 6.18 }, 4: { x: 0.25, y: 0.51 }, 5: { x: 2.83, y: 8.68 }, 6: { x: 4.09, y: 6.48 } },
      attack: { 3: 0.22, 4: 4.29 },
    },
    3: {
      pos: { 1: { x: 5.86, y: 5.62 }, 2: { x: 6.98, y: 2.56 }, 3: { x: 5.29, y: 0.74 }, 4: { x: 1.61, y: 5.66 }, 5: { x: 3.76, y: 6.24 }, 6: { x: 5.06, y: 8.22 } },
      attack: { 4: 0.69, 2: 4.17 },
    },
    4: {
      pos: { 1: { x: 8.49, y: 8.27 }, 2: { x: 4.46, y: 6.13 }, 3: { x: 2.48, y: 1.50 }, 4: { x: 2.18, y: 0.55 }, 5: { x: 1.61, y: 6.27 }, 6: { x: 7.39, y: 6.07 } },
      attack: { 5: 0.31, 3: 4.08 },
    },
    5: {
      pos: { 1: { x: 6.92, y: 6.38 }, 2: { x: 7.92, y: 2.69 }, 3: { x: 2.47, y: 6.09 }, 4: { x: 2.17, y: 1.41 }, 5: { x: 3.66, y: 1.71 }, 6: { x: 4.29, y: 6.39 } },
      attack: { 3: 0.53, 4: 4.74, 2: 8.42 },
    },
    6: {
      pos: { 1: { x: 5.80, y: 5.35 }, 2: { x: 7.36, y: 2.61 }, 3: { x: 5.04, y: 0.65 }, 4: { x: 1.79, y: 4.94 }, 5: { x: 3.73, y: 6.65 }, 6: { x: 4.47, y: 1.81 } },
      attack: { 4: 0.97, 2: 7.62, 3: 5.06 },
    },
  };
  const ATTACK_Y = 0.6; // Pfeilspitzen liegen am Netz

  // Defence (beschriftete Skizze), gilt für alle Rotationen und ist an Rollen gebunden:
  // Die A und die M der Vorderreihe blocken am Netz, die A der Hinterreihe steht tief, die M der Hinterreihe ist der Libero.
  const DEFENCE = {
    blockA: { x: 3.2, y: 0.5 }, blockM: { x: 4.09, y: 0.5 },
    P: { x: 6.29, y: 1.44 }, D: { x: 6.24, y: 4.52 },
    L: { x: 1.71, y: 3.47 }, deepA: { x: 5.07, y: 6.63 },
  };
  const DEFENCE_LINES = [
    { x1: 2.73, y1: 0.5, x2: 1.29, y2: 9, cls: 'move' },
    { x1: 4.54, y1: 0.5, x2: 5.59, y2: 9, cls: 'move' },
  ];

  const bySlot = (ids, f) => Object.fromEntries(ids.map((id, i) => [id, f(i + 1, id)]));
  const copy = (p) => ({ x: p.x, y: p.y });
  const isLibero = (id, slot) => PLAYERS[id].pair === 'middle' && !R.isFront(slot);

  function defencePos(rot) {
    const ids = R.lineupFor(rot);
    return bySlot(ids, (slot, id) => {
      const pair = PLAYERS[id].pair;
      if (pair === 'setter') return copy(DEFENCE[id]);
      if (pair === 'outside') return copy(R.isFront(slot) ? DEFENCE.blockA : DEFENCE.deepA);
      return copy(R.isFront(slot) ? DEFENCE.blockM : DEFENCE.L);
    });
  }

  const receivePos = (rot) => bySlot(R.lineupFor(rot), (slot) => copy(RECEIVE[rot].pos[slot]));
  const attackPos = (rot) => bySlot(R.lineupFor(rot), (slot) => (
    slot in RECEIVE[rot].attack ? { x: RECEIVE[rot].attack[slot], y: ATTACK_Y } : copy(RECEIVE[rot].pos[slot])));
  const basisPos = (rot) => bySlot(R.lineupFor(rot), (slot) => copy(BASIS[slot]));
  // Annehmer laut Skizzen: beide A und der Libero (die M der Hinterreihe).
  const passersFor = (rot) => R.lineupFor(rot).filter((id, i) => PLAYERS[id].pair === 'outside' || isLibero(id, i + 1));
  const attackersFor = (rot) => R.lineupFor(rot).filter((id, i) => i + 1 in RECEIVE[rot].attack);

  // Schritte für Lernfilm und Prüfung. Schlüssel von pos = Rolle, damit Spieler zwischen Schritten wandern.
  function stepsFor(rot) {
    const passers = passersFor(rot);
    const label = (ids) => ids.map((id) => (isLibero(id, R.lineupFor(rot).indexOf(id) + 1) ? 'L' : PLAYERS[id].label)).join(', ');
    return [
      { title: 'Basis Aufstellung', caption: 'Grundaufstellung: Vorderreihe am Netz, Hinterreihe gestaffelt.', pos: basisPos(rot), passers: [], lines: [] },
      { title: `Annahme P${rot}`, caption: `Annahme-Aufstellung P${rot} (Passeur auf Position ${rot}). Es nehmen an: ${label(passers)}.`, pos: receivePos(rot), passers, lines: [] },
      {
        title: 'Angriffswege', caption: `Die Pfeile der Skizze P${rot}: Diese Spieler laufen zum Angriff ans Netz (${label(attackersFor(rot))}). Alle anderen bleiben stehen.`,
        pos: attackPos(rot), passers: [], lines: [],
      },
      {
        title: 'Defence', caption: 'Defence: A und M der Vorderreihe blocken am Netz, P steht dahinter, L links, D und die zweite A tief. Die Linien zeigen den Raum hinter dem Block.',
        pos: defencePos(rot), passers: [], lines: DEFENCE_LINES,
      },
    ];
  }

  // Stellen: Zielstellung je Platz (Annahme bzw. Defence).
  const targetsBySlot = (rot, kind) => {
    const ids = R.lineupFor(rot);
    const byRole = kind === 'defence' ? defencePos(rot) : receivePos(rot);
    return Object.fromEntries(ids.map((id, i) => [i + 1, byRole[id]]));
  };

  const api = { BASIS, RECEIVE, ATTACK_Y, DEFENCE, DEFENCE_LINES, defencePos, receivePos, attackPos, basisPos, passersFor, attackersFor, stepsFor, targetsBySlot, isLibero };
  if (node) module.exports = api;
  else globalThis.VR = Object.assign(globalThis.VR || {}, api);
})();
