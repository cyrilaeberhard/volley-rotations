// Lauffähiger Check: node audit.test.js
// Prüft Daten und Simulation gegen die Regeln: legale Aufstellungen, Spieler im Feld, Reihen, Rotationsrichtung.
const assert = require('node:assert/strict');
const D = require('./data.js');
const R = require('./rules.js');
const P = require('./plans.js');
const { createSim } = require('./sim.js');

const problems = [];
const bad = (msg) => problems.push(msg);
const toSlots = (ids, frame) => Object.fromEntries(ids.map((id, i) => [i + 1, frame[id]]));

// Rotation: Spieler auf Position 2 rückt auf Position 1, 1 nach 6, 6 nach 5, 5 nach 4, 4 nach 3, 3 nach 2.
Object.values(D.SYSTEMS).forEach((s) => {
  for (let rot = 1; rot <= 6; rot += 1) {
    const a = R.lineupFor(s, rot);
    const b = R.lineupFor(s, (rot % 6) + 1);
    [[1, 2], [6, 1], [5, 6], [4, 5], [3, 4], [2, 3]].forEach(([to, from]) => {
      if (b[to - 1] !== a[from - 1]) bad(`Rotation ${s.id} R${rot}: Position ${from} sollte nach ${to} rücken`);
    });
  }
});

Object.values(D.SYSTEMS).forEach((s) => {
  for (let rot = 1; rot <= 6; rot += 1) {
    ['serve', 'receive'].forEach((phase) => {
      const ids = R.lineupFor(s, rot);
      const where = `${s.id} R${rot} ${phase}`;
      const plan = P.planFor(s, rot, phase);
      // Stack legal (Aufschläger außerhalb ist ausgenommen).
      const res = R.checkFormation(toSlots(ids, plan.steps[0].pos), { serving: phase === 'serve' });
      if (!res.legal) bad(`Stack illegal ${where}: ${res.violations.map((v) => v.text).join('; ')}`);
      const st = P.posesFor(s, rot, phase).stack;
      if (!R.checkFormation(toSlots(ids, st), { serving: phase === 'serve' }).legal) bad(`Sim-Stack illegal ${where}`);
      // Alle Schritte: Spieler im Bereich, Hinter-/Vorderreihe bleibt in ihrer Feldhälfte (Abwehr/Angriff).
      plan.steps.forEach((step, k) => ids.forEach((id, i) => {
        const p = step.pos[id];
        const server = phase === 'serve' && i === 0 && k === 0;
        if (!p || p.x < -1 || p.x > 10 || p.y < 0 || (p.y > 9 && !server)) bad(`Spieler ausserhalb ${where} Schritt ${k + 1} ${id}`);
      }));
      const last = plan.steps[plan.steps.length - 1];
      ids.forEach((id, i) => {
        const front = R.isFront(i + 1);
        const p = last.pos[id];
        if (front && p.y > 3.6) bad(`Vorderspieler zu weit hinten in Grundposition ${where} ${id} y=${p.y}`);
        if (!front && p.y < 3) bad(`Hinterspieler zu weit vorn in Grundposition ${where} ${id} y=${p.y}`);
      });
      // Annahme: genau drei Annehmer, keiner ist Zuspieler, Libero-fähig.
      if (phase === 'receive') {
        const passers = plan.steps[0].passers;
        if (plan.source === 'PDF' && passers.length !== 3) bad(`Annehmer ${where}: ${passers.length}`);
        passers.forEach((id) => { if (R.isSetting(s, id, ids.indexOf(id) + 1)) bad(`Zuspieler nimmt an ${where}`); });
      }
    });
  }
});

// Simulation: im Moment des Aufschlagkontakts ist jede Aufstellung legal, danach bleiben alle im Rahmen.
Object.values(D.SYSTEMS).forEach((s) => {
  for (let rot = 1; rot <= 6; rot += 1) {
    ['serve', 'receive'].forEach((phase) => [3, 9].forEach((seed) => {
      let tokens = [];
      let cur = { rot, phase };
      const court = { setTokens: (t) => { tokens = t; }, setBall: () => {} };
      const sim = createSim({
        court, system: s, rot, phase, opts: { libero: true }, rng: R.makeRng(seed),
        onLog: (t) => {
          if (!/^(Aufschlag durch|Gegner schlägt auf)/.test(t)) return;
          const res = R.checkFormation(Object.fromEntries(tokens.map((k) => [k.slot, { x: k.x, y: k.y }])), { serving: cur.phase === 'serve' });
          if (!res.legal) bad(`Sim illegal bei Aufschlag ${s.id} R${cur.rot} ${cur.phase} seed${seed}: ${res.violations.map((v) => v.text).join('; ')}`);
        },
        onScore: (r) => { cur = { rot: r.rot, phase: r.phase }; },
      });
      sim.start();
      for (let i = 0; i < 30 * 200; i += 1) sim.tick(1 / 30);
    }));
  }
});

assert.equal(problems.length, 0, `\n${problems.slice(0, 30).join('\n')}\n=> ${problems.length} Probleme`);
console.log('audit.test.js: alle Checks ok');
