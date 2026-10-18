// Statische Daten: Feld, Rollen, Systeme, Zielpunkte, Regel-Aussagen.
// Koordinaten in Metern, eigene Feldhälfte: x 0..9 (links→rechts, Blick zum Netz), y 0 = Netz, y 9 = Endlinie.
(function () {
  const COURT = { width: 9, depth: 9, attackLine: 3, tol: 0.02 };

  const PLAYERS = {
    S: { label: 'Z', name: 'Zuspieler', pair: 'setter' },
    S1: { label: 'Z1', name: 'Zuspieler 1', pair: 'setter' },
    S2: { label: 'Z2', name: 'Zuspieler 2', pair: 'setter' },
    O: { label: 'D', name: 'Diagonal', pair: 'setter' },
    H1: { label: 'A1', name: 'Außenangreifer 1', pair: 'outside' },
    H2: { label: 'A2', name: 'Außenangreifer 2', pair: 'outside' },
    M1: { label: 'M1', name: 'Mittelblocker 1', pair: 'middle' },
    M2: { label: 'M2', name: 'Mittelblocker 2', pair: 'middle' },
  };

  // base = Spieler in Rotation 1, Index 0 = Position 1 ... Index 5 = Position 6 (wie im Plan).
  // setterRow: wann ein Zuspieler tatsächlich zuspielt (any = immer, back = nur Hinterreihe, front = nur Vorderreihe).
  const SYSTEMS = {
    '5-1': { id: '5-1', name: '5-1 (ein Zuspieler)', base: ['S', 'H1', 'M2', 'O', 'H2', 'M1'], setters: ['S'], setterRow: 'any' },
    '6-2': { id: '6-2', name: '6-2 (zwei Zuspieler, Hinterreihe stellt)', base: ['S1', 'H1', 'M2', 'S2', 'H2', 'M1'], setters: ['S1', 'S2'], setterRow: 'back' },
    '4-2': { id: '4-2', name: '4-2 (zwei Zuspieler, Vorderreihe stellt)', base: ['S1', 'H1', 'M2', 'S2', 'H2', 'M1'], setters: ['S1', 'S2'], setterRow: 'front' },
  };

  // Spezialposition je Paar (gegenüberliegende Rollen): Vorderreihe / Hinterreihe.
  const FRONT_POS = { setter: 2, outside: 4, middle: 3 };
  const BACK_POS = { setter: 1, outside: 5, middle: 6 };

  const HOME_CELLS = {
    4: { x: 1.5, y: 1.5 }, 3: { x: 4.5, y: 1.5 }, 2: { x: 7.5, y: 1.5 },
    5: { x: 1.5, y: 6 }, 6: { x: 4.5, y: 6 }, 1: { x: 7.5, y: 6 },
  };
  const DEFENSE = {
    4: { x: 1.2, y: 1.0 }, 3: { x: 4.5, y: 1.0 }, 2: { x: 7.8, y: 1.0 },
    5: { x: 1.5, y: 6.5 }, 6: { x: 4.5, y: 7.0 }, 1: { x: 7.5, y: 6.5 },
  };
  const ATTACK = {
    ...DEFENSE,
    4: { x: 1.2, y: 1.6 }, 3: { x: 4.5, y: 1.6 }, 2: { x: 7.8, y: 1.6 },
  };
  const SETTER_SPOT = { x: 6.3, y: 0.8 };
  const SERVE_SPOT = { x: 7.5, y: 9.7 };

  // tags: libero | ds | rotation
  const STATEMENTS = [
    { text: 'Der Libero darf aufschlagen.', answer: false, tags: ['libero'], explain: 'Nach dem Plan darf der Libero nicht aufschlagen, blocken oder einen Block versuchen.' },
    { text: 'Der Libero darf blocken oder einen Block versuchen.', answer: false, tags: ['libero'], explain: 'Der Libero darf weder aufschlagen noch blocken.' },
    { text: 'Der Libero darf jeden Hinterspieler ersetzen.', answer: true, tags: ['libero'], explain: 'Der Libero wechselt frei für jeden Hinterspieler.' },
    { text: 'Nach dem Rauswechseln muss der Libero einen Ballwechsel warten, bevor er wieder aufs Feld darf.', answer: true, tags: ['libero'], explain: 'Kommt er raus, muss er einen Ballwechsel warten.' },
    { text: 'Der Libero darf einen Ball über Netzhöhe angreifen.', answer: false, tags: ['libero'], explain: 'Der Libero darf nicht über Netzhöhe angreifen.' },
    { text: 'Setzt der Libero Überkopf vor der 3-m-Linie, darf der Angreifer den Ball nicht über Netzhöhe vollenden.', answer: true, tags: ['libero'], explain: 'Überkopf-Zuspiel des Liberos vor der 3-m-Linie: Der Angriffsschlag über Netzhöhe ist verboten.' },
    { text: 'Ein Abwehrspezialist (DS) darf aufschlagen.', answer: true, tags: ['ds'], explain: 'Der DS darf aufschlagen. Deshalb lohnt sich ein DS mit gutem Aufschlag.' },
    { text: 'Ein Abwehrspezialist (DS) darf blocken.', answer: false, tags: ['ds'], explain: 'Als Hinterreihen-Ersatz darf der DS nicht blocken.' },
    { text: 'Ein DS darf hinter der 3-m-Linie über Netzhöhe angreifen.', answer: true, tags: ['ds'], explain: 'Aus dem Hinterfeld, hinter der 3-m-Linie, darf er angreifen.' },
    { text: 'Ein DS kann für mehrere verschiedene Spieler wechseln, wie der Libero.', answer: false, tags: ['ds'], explain: 'Der DS wechselt nur mit dem Spieler, für den er eingewechselt wurde. Das kann nur der Libero frei.' },
    { text: 'Vor dem Aufschlag müssen alle in der richtigen Rotationsordnung stehen.', answer: true, tags: ['rotation'], explain: 'Bis zum Aufschlag gilt die Rotationsordnung relativ zu den Mitspielern.' },
    { text: 'Man darf die Positionen wechseln, sobald der Aufschläger den Ball berührt hat.', answer: true, tags: ['rotation'], explain: 'Erst nach dem Aufschlagkontakt darf gewechselt werden.' },
    { text: 'Wer zu früh seinen Platz verlässt, verursacht einen Rotationsfehler und der Gegner bekommt den Punkt.', answer: true, tags: ['rotation'], explain: 'Die Mannschaft wird als nicht in Rotation gerufen, der Gegner gewinnt automatisch den Punkt.' },
    { text: 'Nach einem Punkt bei eigenem Aufschlag dreht die Mannschaft im Uhrzeigersinn weiter.', answer: false, tags: ['rotation'], explain: 'Gedreht wird nur nach einem Punkt bei gegnerischem Aufschlag (Side-out).' },
    { text: 'Ein Hinterspieler darf blocken.', answer: false, tags: ['rotation'], explain: 'Hinterreihe darf weder blocken noch vor der 3-m-Linie über Netzhöhe angreifen.' },
    { text: 'Der Aufschlag muss aus dem Bereich von Position 1 erfolgen.', answer: false, tags: ['rotation'], explain: 'Aufgeschlagen wird von irgendwo hinter der Endlinie.' },
    { text: 'Ein Wechsel zwischen Vorder- und Hinterreihe nach dem Aufschlag ist verboten.', answer: false, tags: ['rotation'], explain: 'Es gibt keine Regel dagegen, aber man verliert Block- und Angriffsrechte und ist im Nachteil.' },
    { text: 'Position 4 muss immer links von Position 3 stehen.', answer: true, tags: ['rotation'], explain: 'Nachbarn in der Reihe behalten ihre Reihenfolge.' },
    { text: 'Position 4 muss näher am Netz stehen als Position 5.', answer: true, tags: ['rotation'], explain: 'Vorder- und Hinterspieler einer Spalte behalten ihre Reihenfolge.' },
    { text: 'Position 4 darf rechts von Position 1 stehen.', answer: true, tags: ['rotation'], explain: 'Nur die direkten Nachbarn zählen. Zu Position 1 gibt es keine Bedingung.' },
    { text: 'Ein Aufschläger hinter der Endlinie muss sich nicht an die Überlappungsregeln halten.', answer: true, tags: ['rotation'], explain: 'Ein Aufschläger außerhalb des Feldes ist von der relativen Position ausgenommen.' },
    { text: 'In der Annahme bleibt man oft einen Ballwechsel stehen („stay for one") und wechselt erst danach.', answer: true, tags: ['rotation'], explain: 'Das ist üblich, weil Wechseln während der Annahme Verwirrung stiftet.' },
  ];

  const api = { COURT, PLAYERS, SYSTEMS, FRONT_POS, BACK_POS, HOME_CELLS, DEFENSE, ATTACK, SETTER_SPOT, SERVE_SPOT, STATEMENTS };
  if (typeof module !== 'undefined') module.exports = api;
  else globalThis.VR = Object.assign(globalThis.VR || {}, api);
})();
