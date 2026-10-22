// Lauffähiger Check: node playbook.test.js
// Prüft die Playbook-Daten gegen das, was im Playbook steht (Skizzen P1 bis P6, Basis, Defence).
const assert = require('node:assert/strict');
const D = require('./data.js');
const R = require('./rules.js');
const P = require('./playbook.js');

const toSlots = (rot, byRole) => Object.fromEntries(R.lineupFor(rot).map((id, i) => [i + 1, byRole[id]]));
const inCourt = (p) => p.x >= 0 && p.x <= 9 && p.y >= 0 && p.y <= 9;

// Platz des Liberos (M/L) je Skizze: P1 Pos 6, P2 Pos 1, P3 Pos 5, P4 Pos 6, P5 Pos 1, P6 Pos 5.
const LIBERO_SLOT = { 1: 6, 2: 1, 3: 5, 4: 6, 5: 1, 6: 5 };
// Beschriftung je Skizze (Platz → Rolle): Passeur steht auf n, Diagonal gegenüber.
const ROLES = {
  1: { 1: 'P', 2: 'A', 3: 'M', 4: 'D', 5: 'A', 6: 'M' },
  2: { 1: 'M', 2: 'P', 3: 'A', 4: 'M', 5: 'D', 6: 'A' },
  3: { 1: 'A', 2: 'M', 3: 'P', 4: 'A', 5: 'M', 6: 'D' },
  4: { 1: 'D', 2: 'A', 3: 'M', 4: 'P', 5: 'A', 6: 'M' },
  5: { 1: 'M', 2: 'D', 3: 'A', 4: 'M', 5: 'P', 6: 'A' },
  6: { 1: 'A', 2: 'M', 3: 'D', 4: 'A', 5: 'M', 6: 'P' },
};
const letter = (id) => ({ P: 'P', D: 'D', A1: 'A', A2: 'A', M1: 'M', M2: 'M' })[id];

for (let rot = 1; rot <= 6; rot += 1) {
  const ids = R.lineupFor(rot);
  ids.forEach((id, i) => assert.equal(letter(id), ROLES[rot][i + 1], `P${rot} Platz ${i + 1}`));
  const libero = ids.findIndex((id, i) => R.displayLabel(id, i + 1).kind === 'libero') + 1;
  assert.equal(libero, LIBERO_SLOT[rot], `P${rot}: Libero auf falschem Platz`);

  // Annahme: legale Aufstellung, im Feld, genau drei Annehmer (A, A, L).
  const recv = toSlots(rot, P.receivePos(rot));
  const chk = R.checkFormation(recv);
  assert.ok(chk.legal, `P${rot} Annahme illegal: ${chk.violations.map((v) => v.text).join(' ')}`);
  R.SLOTS.forEach((s) => assert.ok(inCourt(recv[s]), `P${rot} Platz ${s} ausserhalb`));
  const passers = P.passersFor(rot);
  assert.equal(passers.length, 3);
  assert.deepEqual(passers.map(letter).sort(), ['A', 'A', 'M']);
  assert.ok(!passers.includes('P') && !passers.includes('D'));

  // Alle Schritte: im Feld, jeder Schritt hat alle sechs Rollen.
  P.stepsFor(rot).forEach((step) => {
    assert.deepEqual(Object.keys(step.pos).sort(), [...ids].sort());
    ids.forEach((id) => assert.ok(inCourt(step.pos[id]), `P${rot} ${step.title} ${id} ausserhalb`));
  });

  // Pfeile: nur Plätze der Skizze, Spitze am Netz und im Feld.
  Object.entries(P.RECEIVE[rot].attack).forEach(([slot, x]) => {
    assert.ok(Number(slot) >= 1 && Number(slot) <= 6 && x >= 0 && x <= 9, `P${rot} Pfeil Platz ${slot}`);
  });
  assert.ok(P.attackersFor(rot).length >= 2);

  // Defence: Passeur und Diagonal stehen immer auf ihren festen Punkten; die A und M der Vorderreihe am Netz.
  const def = P.defencePos(rot);
  assert.deepEqual(def.P, P.DEFENCE.P);
  assert.deepEqual(def.D, P.DEFENCE.D);
  ids.forEach((id, i) => {
    const slot = i + 1;
    const pair = D.PLAYERS[id].pair;
    if (pair === 'outside') assert.deepEqual(def[id], R.isFront(slot) ? P.DEFENCE.blockA : P.DEFENCE.deepA);
    if (pair === 'middle') assert.deepEqual(def[id], R.isFront(slot) ? P.DEFENCE.blockM : P.DEFENCE.L);
  });
  const spots = Object.values(def);
  assert.equal(new Set(spots.map((p) => `${p.x},${p.y}`)).size, 6, `P${rot} Defence: zwei Spieler auf demselben Punkt`);
}

// Basis Aufstellung: legal und Vorderreihe am Netz.
const basis = toSlots(2, P.basisPos(2));
assert.ok(R.checkFormation(basis).legal);
[2, 3, 4].forEach((s) => assert.ok(basis[s].y < 1));

console.log('playbook.test.js: alle Checks ok');
