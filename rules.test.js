// Lauffähiger Check: node rules.test.js
const assert = require('node:assert/strict');
const D = require('./data.js');
const R = require('./rules.js');

const sys51 = D.SYSTEMS['5-1'];

// Rotation: Zuspieler startet auf 1, nach einem Side-out auf 6, nach sechs wieder auf 1.
assert.deepEqual(R.lineupFor(sys51, 1), ['S', 'H1', 'M2', 'O', 'H2', 'M1']);
assert.equal(R.lineupFor(sys51, 2)[5], 'S');
assert.equal(R.lineupFor(sys51, 4)[3], 'S');
assert.deepEqual(R.rotateLineup(sys51.base, 6), sys51.base);
// Nach dem ersten Side-out schlägt H1 (vorher Pos. 2) auf.
assert.equal(R.lineupFor(sys51, 2)[0], 'H1');

// Überlappung: Grundaufstellung legal, vertauschte 4/3 illegal, Gleichstand illegal.
const home = Object.fromEntries(R.SLOTS.map((s) => [s, { ...D.HOME_CELLS[s] }]));
assert.equal(R.checkFormation(home).legal, true);
const swapped = { ...home, 4: { ...home[4], x: 5 } };
const res = R.checkFormation(swapped);
assert.equal(res.legal, false);
assert.ok(res.violations.some((v) => v.rule.id === 'x43'));
const tie = { ...home, 4: { ...home[4], x: home[3].x - 0.01 } };
assert.equal(R.checkFormation(tie).legal, false);
// Spalte: Pos. 5 weiter vorn als Pos. 4 ist illegal.
assert.equal(R.checkFormation({ ...home, 5: { ...home[5], y: 1 } }).legal, false);

// Aufschläger außerhalb ist ausgenommen, innerhalb nicht.
const serverLeft = { ...home, 1: { x: 0.2, y: 9.7 } };
assert.equal(R.checkFormation(serverLeft, { serving: true }).legal, true);
assert.equal(R.checkFormation(serverLeft, { serving: false }).legal, false);
assert.equal(R.checkFormation({ ...home, 1: { x: 0.2, y: 8 } }, { serving: true }).legal, false);

// Ideal-Stack: für alle Systeme/Rotationen/Phasen legal, im Feld, und selbst "grün".
Object.values(D.SYSTEMS).forEach((sys) => {
  [1, 2, 3, 4, 5, 6].forEach((rot) => ['serve', 'receive'].forEach((phase) => {
    const { pos } = R.idealStack(sys, rot, phase);
    const label = `${sys.id} R${rot} ${phase}`;
    assert.equal(R.checkFormation(pos, { serving: phase === 'serve' }).legal, true, `${label} illegal`);
    assert.equal(R.gradeStack(pos, pos).near, true);
    R.SLOTS.forEach((s) => {
      assert.ok(pos[s].x > 0 && pos[s].x < 9, `${label} x Pos ${s}: ${pos[s].x}`);
      assert.ok(pos[s].y > 0.2 && pos[s].y < 12, `${label} y Pos ${s}: ${pos[s].y}`);
    });
  }));
});

// Anker: Aufschlag = vordere Mitte; Annahme = Zuspieler, außer bei Zuspieler auf 4/5 → vordere Außen.
const anchorId = (sys, rot, phase) => {
  const ids = R.lineupFor(sys, rot);
  return ids[R.anchorSlot(sys, ids, phase) - 1];
};
assert.ok(['M1', 'M2'].includes(anchorId(sys51, 1, 'serve')));
assert.equal(anchorId(sys51, 1, 'receive'), 'S');
assert.equal(anchorId(sys51, 5, 'receive'), 'S');
assert.ok(['H1', 'H2'].includes(anchorId(sys51, 3, 'receive'))); // Zuspieler auf 5
assert.ok(['H1', 'H2'].includes(anchorId(sys51, 4, 'receive'))); // Zuspieler auf 4

// Bewertung: Ideal grün, weit weg nicht.
const ideal = R.idealStack(sys51, 1, 'receive').pos;
assert.equal(R.gradeStack({ ...ideal, 4: { x: 1, y: 8 } }, ideal).near, false);

// Wechsel: Zielpunkte ok; Reihenwechsel wird gemeldet.
const ids1 = R.lineupFor(sys51, 1);
const targets = R.targetSpots(sys51, ids1, 'serve');
assert.equal(R.gradeSwitch(sys51, ids1, 'serve', targets).ok, true);
const rowSwap = { ...targets, 4: { x: 1.2, y: 6 } };
assert.deepEqual(R.gradeSwitch(sys51, ids1, 'serve', rowSwap).rowChanges, [4]);
// Zuspieler auf 1 darf in der Annahme nach vorn laufen (kein Reihenwechsel-Fehler).
assert.equal(R.gradeSwitch(sys51, ids1, 'receive', R.targetSpots(sys51, ids1, 'receive')).ok, true);

// Libero: ersetzt Mitte in der Hinterreihe, nicht beim Aufschlag auf Pos. 1, nicht vorn.
assert.equal(R.displayLabel('M1', 6, 'receive', { libero: true }).kind, 'libero');
assert.equal(R.displayLabel('M1', 3, 'receive', { libero: true }).kind, 'normal');
assert.equal(R.displayLabel('M1', 1, 'serve', { libero: true }).kind, 'normal');
assert.equal(R.displayLabel('M1', 1, 'receive', { libero: true }).kind, 'libero');
assert.equal(R.displayLabel('H2', 5, 'receive', { ds: 'H2' }).kind, 'ds');
assert.equal(R.displayLabel('H2', 4, 'receive', { ds: 'H2' }).kind, 'normal');

// Zufallsaufstellungen: Wunsch (legal/illegal) wird eingehalten, deterministisch bei gleichem Seed.
const rng = R.makeRng(42);
for (let i = 0; i < 300; i += 1) {
  const legal = i % 2 === 0;
  const serverOutside = i % 3 === 0;
  const pos = R.randomFormation(rng, { legal, serverOutside });
  assert.equal(R.checkFormation(pos, { serving: serverOutside }).legal, legal);
}
assert.deepEqual(R.randomFormation(R.makeRng(7), { legal: true }), R.randomFormation(R.makeRng(7), { legal: true }));

console.log('rules.test.js: alle Checks ok');
