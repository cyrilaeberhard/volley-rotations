// Lauffähiger Check: node rules.test.js
const assert = require('node:assert/strict');
const D = require('./data.js');
const R = require('./rules.js');

// Rotation Pn: Passeur auf Position n, Reihenfolge im Uhrzeigersinn bleibt P, A, M, D, A, M.
for (let rot = 1; rot <= 6; rot += 1) {
  const ids = R.lineupFor(rot);
  assert.equal(ids[rot - 1], 'P', `P${rot}: Passeur nicht auf ${rot}`);
  assert.equal(ids[((rot + 2) % 6)], 'D', `P${rot}: Diagonal nicht gegenüber`);
}
assert.deepEqual(R.lineupFor(1), ['P', 'A1', 'M2', 'D', 'A2', 'M1']);
// "Basis Aufstellung" im Playbook (Passeur auf 2): 1 M¹, 2 P, 3 A¹, 4 M², 5 D, 6 A².
assert.deepEqual(R.lineupFor(2), ['M1', 'P', 'A1', 'M2', 'D', 'A2']);
assert.deepEqual(R.rotateLineup(D.SYSTEM.base, 6), D.SYSTEM.base);
// Ein Side-out dreht im Uhrzeigersinn: Wer auf 2 stand, steht danach auf 1, der Passeur P1 → P6.
assert.equal(R.rotateLineup(R.lineupFor(1), 1)[5], 'P');

// Überlappung: Gleichstand und vertauschte Nachbarn sind illegal.
const home = { 4: { x: 1.5, y: 1.5 }, 3: { x: 4.5, y: 1.5 }, 2: { x: 7.5, y: 1.5 }, 5: { x: 1.5, y: 6 }, 6: { x: 4.5, y: 6 }, 1: { x: 7.5, y: 6 } };
assert.equal(R.checkFormation(home).legal, true);
const res = R.checkFormation({ ...home, 4: { ...home[4], x: 5 } });
assert.equal(res.legal, false);
assert.ok(res.violations.some((v) => v.rule.id === 'x43'));
assert.equal(R.checkFormation({ ...home, 4: { ...home[4], x: home[3].x - 0.01 } }).legal, false);
assert.equal(R.checkFormation({ ...home, 5: { ...home[5], y: 1 } }).legal, false);

// Libero ersetzt die Mitte in der Hinterreihe, nicht vorn und nicht andere Rollen.
assert.equal(R.displayLabel('M1', 6).kind, 'libero');
assert.equal(R.displayLabel('M1', 1).kind, 'libero');
assert.equal(R.displayLabel('M1', 3).kind, 'normal');
assert.equal(R.displayLabel('A2', 5).kind, 'normal');

// Bewertung: Ziel selbst ist ok, weit weg nicht.
assert.equal(R.gradeFormation(home, home).near, true);
assert.deepEqual(R.gradeFormation({ ...home, 4: { x: 1, y: 8 } }, home).far, [4]);

// Zufallsaufstellungen: Wunsch (legal/illegal) wird eingehalten, deterministisch bei gleichem Seed.
const rng = R.makeRng(42);
for (let i = 0; i < 300; i += 1) {
  const legal = i % 2 === 0;
  assert.equal(R.checkFormation(R.randomFormation(rng, { legal })).legal, legal);
}
assert.deepEqual(R.randomFormation(R.makeRng(7), { legal: true }), R.randomFormation(R.makeRng(7), { legal: true }));

console.log('rules.test.js: alle Checks ok');
