// Statische Daten nach dem Playbook (Volero Aarberg, 1. Liga Herren 2026/27): Feld, Rollen, Aufstellung 5-1.
// Koordinaten in Metern, eigene Feldhälfte: x 0..9 (links→rechts, Blick zum Netz), y 0 = Netz, y 9 = Endlinie.
(function () {
  const COURT = { width: 9, depth: 9, attackLine: 3, tol: 0.02 };

  // Rollen laut Playbook: P = Passeur, D = Diagonal, A = Außen (A¹/A²), M = Mitte (M¹/M²), L = Libero.
  const PLAYERS = {
    P: { label: 'P', name: 'Passeur', pair: 'setter' },
    D: { label: 'D', name: 'Diagonal', pair: 'setter' },
    A1: { label: 'A¹', name: 'Außen 1', pair: 'outside' },
    A2: { label: 'A²', name: 'Außen 2', pair: 'outside' },
    M1: { label: 'M¹', name: 'Mitte 1', pair: 'middle' },
    M2: { label: 'M²', name: 'Mitte 2', pair: 'middle' },
  };

  // Spielsystem 5-1. Rotation Pn = der Passeur steht auf Position n (Playbook: P1 bis P6).
  // base = Aufstellung P1, Index 0 = Position 1 ... Index 5 = Position 6.
  // Probe mit "Basis Aufstellung" (Passeur auf 2): 1 M¹, 2 P, 3 A¹, 4 M², 5 D, 6 A².
  const SYSTEM = { id: '5-1', name: '5-1', base: ['P', 'A1', 'M2', 'D', 'A2', 'M1'] };

  const api = { COURT, PLAYERS, SYSTEM };
  if (typeof module !== 'undefined') module.exports = api;
  else globalThis.VR = Object.assign(globalThis.VR || {}, api);
})();
