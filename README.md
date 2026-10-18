# Volley-Rotationen üben

Webapp zum Üben von Volleyball-Rotationen, Überlappungsregeln, Stacking und Switching (5-1, 6-2, 4-2).
Reine statische Dateien: `index.html` per Doppelklick öffnen, kein Build, kein Server nötig.

## Modi
1. **Formation legen**: Spieler ziehen, Überlappung wird geprüft.
2. **Legal oder Fehler**: Aufstellung beurteilen, 10er-Runden.
3. **Rotationsquiz**: Rotation, Libero, Regel-Aussagen.
4. **Stack & Switch**: Stack stellen (grün/gelb/rot), danach Wechsel nach dem Aufschlag.
5. **Lernmodus**: Film der Abläufe. Stack, Übergang, Angriffsbereit, Absicherung, Wechsel, Abwehr; danach Side-out mit Drehung und Aufschlag in der nächsten Rotation. 5-1 exakt nach dem Plan-PDF, 6-2 und 4-2 berechnet. Annehmer sind gelb umrandet (immer drei).
6. **Simulation**: Live-Ballwechsel mit sichtbarem Ball. Aufschlag, Annahme, Zuspiel, Angriff, Absicherung, Punktestand, Side-out mit Drehung. Ausgang zufällig oder erzwungen, Tempo wählbar.

Menü: System, Rotation, Phase (Aufschlag/Annahme), Libero, DS, Stufe, Zeitlimit.
Punkte und Trefferquote liegen lokal in `localStorage`.

## Dateien
- `data.js`: Feld, Rollen, Systeme, Zielpunkte, Regel-Aussagen
- `pdf-plans.js`: aus dem PDF ausgelesene Positionen und deutsche Texte (5-1)
- `plans.js`: Abläufe für den Lernmodus, Ideal-Stack für Modus 4
- `rules.js`: Regel-Engine ohne UI (Rotation, Überlappung, Ideal-Stack, Zufallsaufstellungen)
- `court.js`: SVG-Feld mit Drag-and-drop
- `quiz.js`: Quiz-Modi 2 und 3
- `sim.js`: Simulation (Ballwechsel, Läufer, Punktestand)
- `stats.js`: Fortschritt
- `ui.js`: Menü und Modi 1, 4, 5
- `rules.test.js`, `plans.test.js`, `sim.test.js`: Tests, `for f in rules plans sim; do node $f.test.js; done`

## Hinweise zu den Regeln
Grundlage ist das Plan-PDF (5-1). Der Ideal-Stack wird berechnet: Jeder Spieler soll möglichst nah an seine Position nach dem Wechsel,
unter Einhaltung der Überlappungsregeln. Anker: beim Aufschlag die vordere Mitte, in der Annahme der Zuspieler
(Zuspieler auf 4 oder 5: die vordere Außenangreiferin). Bei 6-2 und 4-2 gelten dieselben Grundregeln, es zählt nur,
wann ein Zuspieler zuspielt (Hinterreihe bzw. Vorderreihe).
