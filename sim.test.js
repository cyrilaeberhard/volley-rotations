// Lauffähiger Check: node sim.test.js
const assert = require('node:assert/strict');
const D = require('./data.js');
const R = require('./rules.js');
const { createSim } = require('./sim.js');

function seeded(seed) { return R.makeRng(seed); }

function run(system, rot, phase, forced, seed, seconds = 400) {
  let tokens = [];
  let ball = null;
  const results = [];
  const logs = [];
  const court = { setTokens: (t) => { tokens = t; }, setBall: (b) => { ball = b; } };
  const sim = createSim({
    court, system, rot, phase, opts: { libero: true }, rng: seeded(seed),
    onLog: (t) => logs.push(t), onScore: (s) => results.push(s),
  });
  sim.setForced(forced);
  sim.start();
  let prev = { rot, phase };
  for (let i = 0; i < seconds * 30; i += 1) {
    sim.tick(1 / 30);
    tokens.forEach((t) => {
      assert.ok(t.x > -1 && t.x < 10 && t.y > -2 && t.y < 13, `Spieler außerhalb: ${t.id} ${t.x.toFixed(1)}/${t.y.toFixed(1)}`);
      assert.ok(Number.isFinite(t.x) && Number.isFinite(t.y));
    });
    if (ball) assert.ok(ball.x > -1 && ball.x < 10 && ball.y > -2.5 && ball.y < 13 && ball.z >= 0 && ball.z < 5, `Ball: ${JSON.stringify(ball)}`);
  }
  return { results, logs, tokens, prev };
}

// Regeln: nur Punkt bei Annahme dreht (Side-out), sonst bleibt die Rotation.
const sys = D.SYSTEMS['5-1'];
const { results } = run(sys, 1, 'receive', 'auto', 7);
assert.ok(results.length >= 10, `zu wenige Ballwechsel: ${results.length}`);
let state = { rot: 1, phase: 'receive' };
results.forEach((r) => {
  const serving = state.phase === 'serve';
  const expectRot = !serving && r.winner === 'us' ? (state.rot % 6) + 1 : state.rot;
  const expectPhase = serving ? (r.winner === 'us' ? 'serve' : 'receive') : (r.winner === 'us' ? 'serve' : 'receive');
  assert.equal(r.rot, expectRot, `Rotation falsch nach ${state.phase} ${r.winner}`);
  assert.equal(r.phase, expectPhase, `Phase falsch nach ${state.phase} ${r.winner}`);
  state = { rot: r.rot, phase: r.phase };
});
assert.ok(results.some((r) => r.winner === 'us') && results.some((r) => r.winner === 'them'));

// Erzwungene Ausgänge.
run(sys, 3, 'receive', 'us', 11, 120).results.forEach((r) => assert.equal(r.winner, 'us'));
run(sys, 3, 'serve', 'them', 12, 120).results.forEach((r) => assert.equal(r.winner, 'them'));

// Alle Systeme, Rotationen und Phasen laufen ohne Fehler.
Object.values(D.SYSTEMS).forEach((s) => {
  for (let rot = 1; rot <= 6; rot += 1) {
    ['serve', 'receive'].forEach((phase) => {
      const r = run(s, rot, phase, 'auto', rot * 31 + (phase === 'serve' ? 1 : 2), 60);
      assert.ok(r.results.length >= 1, `${s.id} R${rot} ${phase}: kein Ballwechsel`);
    });
  }
});

// Satzende bei 25 mit 2 Punkten Vorsprung: Stand springt zurück.
const long = run(sys, 1, 'serve', 'us', 5, 1500);
assert.ok(long.results.some((r) => r.setOver), 'Satzende nie erreicht');
console.log('sim.test.js: alle Checks ok');
