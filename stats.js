// Fortschritt in localStorage: Punkte, Streak, Trefferquote je Rotation.
(function () {
  const KEY = 'vr-stats-v1';
  const empty = () => ({ points: 0, streak: 0, best: 0, byRot: {} });

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY));
      return raw && typeof raw === 'object' ? { ...empty(), ...raw } : empty();
    } catch (err) {
      return empty();
    }
  }
  function save(s) {
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch (err) {
      console.warn('Statistik konnte nicht gespeichert werden:', err);
    }
  }

  // rot darf null sein (Regel-Aussagen ohne Rotation): zählt dann nur für Punkte und Streak.
  function record(systemId, rot, ok) {
    const s = load();
    const streak = ok ? s.streak + 1 : 0;
    const key = `${systemId}:${rot}`;
    const prev = s.byRot[key] || { ok: 0, total: 0 };
    const byRot = rot == null ? s.byRot : { ...s.byRot, [key]: { ok: prev.ok + (ok ? 1 : 0), total: prev.total + 1 } };
    const next = { points: s.points + (ok ? 10 + Math.min(s.streak, 5) : 0), streak, best: Math.max(s.best, streak), byRot };
    save(next);
    return next;
  }
  function reset() {
    save(empty());
    return empty();
  }

  globalThis.VR = Object.assign(globalThis.VR || {}, { stats: { load, record, reset } });
})();
