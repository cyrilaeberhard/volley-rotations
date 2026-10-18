// Live-Simulation: Ballwechsel mit sichtbarem Ball, Läufern, Punktestand und Rotation nach Side-out.
// Ausgänge sind zufällig oder erzwungen (wir/Gegner). Haltungen kommen aus dem Plan (5-1) bzw. der Regel-Engine.
(function () {
  const node = typeof module !== 'undefined';
  const R = node ? Object.assign({}, require('./rules.js'), require('./plans.js'), require('./data.js')) : globalThis.VR;
  const { SETTER_SPOT } = R;

  const RUN_SPEED = 5.5; // m/s
  const SET_POINTS = 25;
  const CHANCES = {
    auto: { serveAce: 0.08, serveErr: 0.08, oppAce: 0.08, oppErr: 0.08, dig: 0.7, kill: 0.4, attackErr: 0.1 },
    us: { serveAce: 0.2, serveErr: 0, oppAce: 0, oppErr: 0.2, dig: 1, kill: 1, attackErr: 0 },
    them: { serveAce: 0, serveErr: 0.3, oppAce: 0.3, oppErr: 0, dig: 0, kill: 0, attackErr: 1 },
  };

  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const ease = (u) => (u < 0.5 ? 2 * u * u : 1 - ((-2 * u + 2) ** 2) / 2);
  const between = (rng, lo, hi) => lo + (hi - lo) * rng();

  function createSim({ court, system, rot, phase, opts, rng = Math.random, onLog = () => {}, onScore = () => {} }) {
    const state = { rot, phase, score: { us: 0, them: 0 }, speed: 1, paused: false, forced: 'auto', fastForward: false };
    const roles = [...system.base];
    const actors = Object.fromEntries(roles.map((id) => [id, { x: 0, y: 0, mv: null, touchUntil: 0 }]));
    const ball = { x: 0, y: -1.5, z: 1, mv: null, visible: false };
    const events = [];
    let clock = 0;
    let planned = {};

    // ---------- Zeitplan ----------
    const at = (t, fn) => {
      events.push({ t, fn });
      events.sort((a, b) => a.t - b.t);
    };
    const runDur = (id, to) => Math.max(0.4, dist(planned[id], to) / RUN_SPEED);
    function go(id, to, t, dur = runDur(id, to)) {
      planned = { ...planned, [id]: { ...to } };
      at(t, () => { actors[id].mv = { x0: actors[id].x, y0: actors[id].y, x1: to.x, y1: to.y, t0: t, dur }; });
    }
    function fly(from, to, t, dur, peak = 1.5, z0 = 1, z1 = 0) {
      at(t, () => { ball.visible = true; ball.mv = { x0: from.x, y0: from.y, x1: to.x, y1: to.y, z0, z1, peak, t0: t, dur }; });
    }
    const touch = (id, t) => at(t, () => { actors[id].touchUntil = t + 0.5; });
    const say = (text, t) => at(t, () => onLog(text));

    function advance(dt) {
      clock += dt;
      while (events.length && events[0].t <= clock) events.shift().fn();
      roles.forEach((id) => {
        const a = actors[id];
        if (!a.mv) return;
        const u = clamp((clock - a.mv.t0) / a.mv.dur, 0, 1);
        const e = ease(u);
        a.x = a.mv.x0 + (a.mv.x1 - a.mv.x0) * e;
        a.y = a.mv.y0 + (a.mv.y1 - a.mv.y0) * e;
        if (u >= 1) a.mv = null;
      });
      if (ball.mv) {
        const m = ball.mv;
        const u = clamp((clock - m.t0) / m.dur, 0, 1);
        ball.x = m.x0 + (m.x1 - m.x0) * u;
        ball.y = m.y0 + (m.y1 - m.y0) * u;
        ball.z = m.z0 + (m.z1 - m.z0) * u + 4 * m.peak * u * (1 - u);
        if (u >= 1) ball.mv = null;
      }
    }

    function render() {
      const ids = R.lineupFor(system, state.rot);
      court.setTokens(ids.map((id, i) => ({
        key: id, slot: i + 1, id, x: actors[id].x, y: actors[id].y,
        ...R.displayLabel(id, i + 1, state.phase, opts), passer: actors[id].touchUntil > clock, duration: 0,
      })));
      court.setBall(ball.visible ? { x: ball.x, y: ball.y, z: Math.max(0, ball.z) } : null);
    }

    // ---------- Ballwechsel ----------
    function scriptRally() {
      const ids = R.lineupFor(system, state.rot);
      const poses = R.posesFor(system, state.rot, state.phase);
      const spots = R.spotsByRole(system, state.rot);
      const chance = (key) => rng() < CHANCES[state.forced][key];
      const slotOf = (id) => ids.indexOf(id) + 1;
      const setter = ids.find((id, i) => R.isSetting(system, id, i + 1));
      const label = (id) => R.displayLabel(id, slotOf(id), state.phase, opts).text;
      const backIds = ids.filter((id) => !R.isFront(slotOf(id)));
      const pick = (arr) => arr[Math.floor(rng() * arr.length)];
      const nearest = (list, pt) => list.reduce((best, id) => (dist(planned[id], pt) < dist(planned[best], pt) ? id : best), list[0]);
      const noisy = (p, dx, yLo, yHi) => ({ x: clamp(p.x + between(rng, -dx, dx), 0.8, 8.2), y: clamp(p.y + between(rng, -dx, dx), yLo, yHi) });
      const everyoneTo = (pose, t) => ids.forEach((id) => go(id, pose[id], t));
      const finish = (winner, t, text) => {
        say(text, t);
        at(t + 1.2, () => finishRally(winner));
      };
      planned = Object.fromEntries(ids.map((id) => [id, { x: actors[id].x, y: actors[id].y }]));
      const t0 = clock + 0.4;

      // Gegner: Annahme, Zuspiel, Angriff auf unsere Seite. Rückgabe: Ankunftszeit und Landepunkt.
      function opponentAttack(tLand, from, defense) {
        everyoneTo(defense, tLand + 0.2);
        const target = pick(backIds);
        const L = noisy(defense[target], 0.9, 3.8, 8.3);
        const mid = { x: 4.8, y: -0.9 };
        const setPt = { x: between(rng, 2, 7), y: -0.6 };
        say('Gegner nimmt an und stellt zu', tLand + 0.45);
        fly(from, mid, tLand + 0.45, 0.7, 1.6, 0.3, 1.8);
        fly(mid, setPt, tLand + 1.2, 0.8, 1.2, 1.8, 2.6);
        say('Gegner greift an', tLand + 2.0);
        fly(setPt, L, tLand + 2.0, 0.55, 0.3, 2.8, 0);
        return { tArrive: tLand + 2.55, L };
      }

      function dig(tArrive, L, ready) {
        if (!chance('dig')) {
          finish('them', tArrive, 'Ball fällt im Feld: Punkt für den Gegner');
          return;
        }
        const digger = nearest(ids.filter((id) => id !== setter), L);
        const dur = Math.min(runDur(digger, L), 1.0);
        go(digger, L, tArrive - dur, dur);
        possession(tArrive, L, digger, ready, `Abwehr durch ${label(digger)}`);
      }

      // Erster Kontakt (Annahme/Abwehr), Zuspiel, Angriff und Absicherung.
      function possession(tC, L, contact, ready, text) {
        touch(contact, tC);
        say(text, tC);
        if (setter && setter !== contact) go(setter, SETTER_SPOT, tC - 0.6, 0.6);
        ids.filter((id) => id !== contact && id !== setter).forEach((id) => go(id, ready[id], tC - 0.5));
        const tS = tC + 0.85;
        fly(L, SETTER_SPOT, tC, 0.85, 2.2, 0.4, 2.3);
        touch(setter || contact, tS);
        say(`Zuspiel durch ${label(setter || contact)}`, tS);
        const attackers = ids.filter((id) => id !== setter && id !== contact && R.isFront(slotOf(id)));
        const hitter = pick(attackers.length ? attackers : ids.filter((id) => id !== setter && id !== contact));
        const A = { x: clamp(planned[hitter].x, 0.9, 8.1), y: 0.9 };
        const tA = tS + 0.75;
        go(hitter, A, tS, 0.7);
        fly(SETTER_SPOT, A, tS, 0.75, 1.8, 2.3, 2.8);
        coverHitter(hitter, A, tS + 0.1);
        touch(hitter, tA);
        say(`Angriff durch ${label(hitter)}`, tA);
        const target = { x: between(rng, 1, 8), y: -1.2 };
        if (chance('attackErr')) {
          fly(A, { x: A.x, y: 0.15 }, tA, 0.25, 0.1, 2.9, 0.8);
          finish('them', tA + 0.5, 'Angriffsfehler ins Netz: Punkt für den Gegner');
        } else if (chance('kill')) {
          fly(A, target, tA, 0.45, 0.4, 3.0, 0);
          finish('us', tA + 0.5, 'Punkt für uns: Angriff verwandelt');
        } else {
          fly(A, target, tA, 0.45, 0.4, 3.0, 0);
          const next = opponentAttack(tA + 0.45, target, spots.defense);
          dig(next.tArrive, next.L, spots.ready);
        }
      }

      function coverHitter(hitter, A, t) {
        const spotsList = [
          { x: A.x - 1.8, y: 2.6 }, { x: A.x + 1.8, y: 2.6 },
          { x: A.x - 2.8, y: 5.5 }, { x: A.x, y: 6.2 }, { x: A.x + 2.8, y: 5.5 },
        ].map((p) => ({ x: clamp(p.x, 0.6, 8.4), y: p.y })).sort((a, b) => a.x - b.x);
        const others = ids.filter((id) => id !== hitter).sort((a, b) => planned[a].x - planned[b].x);
        others.forEach((id, i) => go(id, spotsList[i], t));
      }

      if (state.phase === 'serve') {
        const server = ids[0];
        const from = { x: planned[server].x, y: planned[server].y };
        ball.visible = true;
        ball.mv = null;
        Object.assign(ball, { x: from.x, y: from.y, z: 1.2 });
        const tServe = t0 + 0.5;
        touch(server, tServe);
        say(`Aufschlag durch ${label(server)}`, tServe);
        const Q = { x: between(rng, 1, 8), y: -1.3 };
        ids.forEach((id) => go(id, poses.defense[id], tServe + (id === server ? 0.2 : 0.3)));
        if (chance('serveAce')) {
          fly(from, Q, tServe, 1.3, 3.2, 2.4, 0);
          finish('us', tServe + 1.4, 'Ass: Punkt für uns');
        } else if (chance('serveErr')) {
          fly(from, { x: Q.x, y: 0.15 }, tServe, 1.0, 0.6, 2.4, 0.8);
          finish('them', tServe + 1.2, 'Aufschlagfehler ins Netz: Punkt für den Gegner');
        } else {
          fly(from, Q, tServe, 1.3, 3.2, 2.4, 0);
          const next = opponentAttack(tServe + 1.3, Q, poses.defense);
          dig(next.tArrive, next.L, spots.ready);
        }
        return;
      }

      // Annahme: Gegner schlägt auf
      const passers = R.planFor(system, state.rot, 'receive').steps[0].passers;
      const sortedByDepth = ids.filter((id) => id !== setter).sort((a, b) => planned[b].y - planned[a].y);
      const receivers = passers.length ? passers : sortedByDepth.slice(0, 3);
      const passer = pick(receivers);
      const fromOpp = { x: between(rng, 1, 8), y: -1.5 };
      const tServe = t0 + 0.5;
      ball.visible = true;
      ball.mv = null;
      Object.assign(ball, { x: fromOpp.x, y: fromOpp.y, z: 1.2 });
      say('Gegner schlägt auf', tServe);
      if (chance('oppAce')) {
        const hole = { x: clamp(planned[passer].x + 3.2, 0.8, 8.2), y: clamp(planned[passer].y + 0.8, 3.5, 8.5) };
        fly(fromOpp, hole, tServe, 1.2, 3.0, 2.4, 0);
        finish('them', tServe + 1.3, 'Ass des Gegners: Punkt für den Gegner');
      } else if (chance('oppErr')) {
        fly(fromOpp, { x: between(rng, 1, 8), y: 9.8 }, tServe, 1.5, 3.0, 2.4, 0);
        finish('us', tServe + 1.6, 'Aufschlagfehler des Gegners: Punkt für uns');
      } else {
        const L = noisy(planned[passer], 0.8, 3.8, 8.3);
        fly(fromOpp, L, tServe, 1.3, 3.0, 2.4, 0.3);
        go(setter, SETTER_SPOT, tServe, 1.0);
        ids.filter((id) => id !== passer && id !== setter && !receivers.includes(id)).forEach((id) => go(id, poses.ready[id], tServe + 0.3));
        go(passer, L, tServe + 0.1, 1.1);
        possession(tServe + 1.3, L, passer, poses.ready, `Annahme durch ${label(passer)}`);
      }
    }

    function finishRally(winner) {
      const serving = state.phase === 'serve';
      const score = { ...state.score, [winner]: state.score[winner] + 1 };
      let nextRot = state.rot;
      let nextPhase = serving ? (winner === 'us' ? 'serve' : 'receive') : 'receive';
      let text = winner === 'us' ? 'Punkt für uns' : 'Punkt für den Gegner';
      if (!serving && winner === 'us') {
        nextRot = (state.rot % 6) + 1;
        nextPhase = 'serve';
        text += `: Side-out, Rotation ${nextRot} (Drehung im Uhrzeigersinn), wir schlagen auf`;
      } else if (winner === 'them' && serving) {
        text += ': Aufschlagwechsel, wir nehmen an';
      }
      const diff = Math.abs(score.us - score.them);
      const over = (score.us >= SET_POINTS || score.them >= SET_POINTS) && diff >= 2;
      if (over) text += score.us > score.them ? '. Satz gewonnen' : '. Satz verloren';
      Object.assign(state, { score: over ? { us: 0, them: 0 } : score, rot: nextRot, phase: nextPhase, fastForward: false });
      onScore({ ...score, winner, rot: nextRot, phase: nextPhase, setOver: over });
      onLog(text);
      ball.visible = false;
      ball.mv = null;
      const stack = R.posesFor(system, nextRot, nextPhase).stack;
      planned = Object.fromEntries(roles.map((id) => [id, { x: actors[id].x, y: actors[id].y }]));
      roles.forEach((id) => go(id, stack[id], clock + 0.2, 2.4));
      at(clock + (over ? 4.2 : 3.0), () => { state.fastForward = false; scriptRally(); });
    }

    // ---------- Steuerung ----------
    function start() {
      const stack = R.posesFor(system, state.rot, state.phase).stack;
      roles.forEach((id) => { actors[id].x = stack[id].x; actors[id].y = stack[id].y; actors[id].mv = null; });
      render();
      at(clock + 1.0, scriptRally);
    }
    function tick(dtSeconds) {
      if (state.paused) return;
      const dt = Math.min(dtSeconds, 0.1) * state.speed * (state.fastForward ? 8 : 1);
      advance(dt);
      render();
    }
    return {
      start, tick, state,
      setSpeed: (v) => { state.speed = v; },
      setPaused: (v) => { state.paused = v; },
      setForced: (v) => { state.forced = v; },
      skip: () => { state.fastForward = true; },
    };
  }

  const api = { createSim };
  if (node) module.exports = api;
  else globalThis.VR = Object.assign(globalThis.VR || {}, api);
})();
