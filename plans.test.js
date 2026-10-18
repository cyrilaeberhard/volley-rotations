// Lauffähiger Check: node plans.test.js
const assert = require('node:assert/strict');
const D = require('./data.js');
const R = require('./rules.js');
const P = require('./plans.js');
const { PDF_PLANS } = require('./pdf-plans.js');

const sys51 = D.SYSTEMS['5-1'];
for (let rot = 1; rot <= 6; rot += 1) {
  ['serve', 'receive'].forEach((phase) => {
    const plan = P.planFor(sys51, rot, phase);
    assert.equal(plan.source, 'PDF');
    assert.equal(plan.steps.length, phase === 'receive' ? 6 : 3);
    const ids = R.lineupFor(sys51, rot);
    plan.steps.forEach((s) => assert.deepEqual(Object.keys(s.pos).sort(), [...ids].sort()));
    // Stack aus dem PDF ist nach unseren Regeln legal.
    const pos = Object.fromEntries(ids.map((id, i) => [i + 1, plan.steps[0].pos[id]]));
    assert.equal(R.checkFormation(pos, { serving: phase === 'serve' }).legal, true, `${rot} ${phase}`);
    // Annahme: immer genau drei Annehmer, Aufschlag: Aufschläger startet außerhalb auf Position 1.
    if (phase === 'receive') assert.equal(PDF_PLANS[`${rot}-receive`].passers.length, 3);
    else assert.ok(plan.steps[0].pos[ids[0]].y > D.COURT.depth, 'Aufschläger außerhalb');
  });
}
// 6-2 und 4-2 werden berechnet, gleiche Schrittstruktur.
['6-2', '4-2'].forEach((id) => {
  const plan = P.planFor(D.SYSTEMS[id], 2, 'receive');
  assert.equal(plan.source, 'berechnet');
  assert.equal(plan.steps.length, 3);
});
// idealFor: 5-1 nutzt PDF-Stack, Ziele = angriffsbereit/Grundposition.
const ideal = P.idealFor(sys51, 3, 'receive');
assert.deepEqual(ideal.pos[4], PDF_PLANS['3-receive'].steps[0].pos.M1);
assert.deepEqual(ideal.targets[4], PDF_PLANS['3-receive'].steps[2].pos.M1);
// Token-Liste: Schlüssel je Rolle, Libero ersetzt die hintere Mitte.
const tokens = P.stepTokens(sys51, 3, 'receive', P.planFor(sys51, 3, 'receive').steps[0], { libero: true });
assert.equal(tokens.length, 6);
assert.ok(tokens.some((t) => t.key === 'M2' && t.kind === 'libero'));
// Die angezeigte Lösung muss die eigene Prüfung bestehen (Stack und Wechsel), für alle Systeme.
Object.values(D.SYSTEMS).forEach((sys) => {
  for (let rot = 1; rot <= 6; rot += 1) {
    ['serve', 'receive'].forEach((phase) => {
      const label = `${sys.id} R${rot} ${phase}`;
      const ideal = P.idealFor(sys, rot, phase);
      assert.equal(R.checkFormation(ideal.pos, { serving: phase === 'serve' }).legal, true, `${label}: Stack-Lösung illegal`);
      assert.equal(R.gradeStack(ideal.pos, ideal.pos).near, true, `${label}: Stack-Lösung nicht grün`);
      const sw = R.gradeSwitch(sys, ideal.ids, phase, ideal.targets, 1.2, ideal.targets);
      assert.equal(sw.ok, true, `${label}: Wechsel-Lösung besteht Prüfung nicht ${JSON.stringify(sw.far)} ${JSON.stringify(sw.rowChanges)}`);
      // Kleine Abweichung (0,8 m) bleibt grün.
      const shifted = Object.fromEntries(R.SLOTS.map((s) => [s, { x: ideal.targets[s].x + 0.5, y: ideal.targets[s].y + 0.6 }]));
      assert.equal(R.gradeSwitch(sys, ideal.ids, phase, shifted, 1.2, ideal.targets).far.length, 0, `${label}: Toleranz`);
    });
  }
});
console.log('plans.test.js: alle Checks ok');
