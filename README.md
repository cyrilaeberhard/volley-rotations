# Volley-Rotationen üben (Playbook Volero Aarberg 2026/27)

Webapp zum Üben der Aufstellungen aus dem Playbook (1. Liga Herren, System 5-1).
Reine statische Dateien: `index.html` öffnen, kein Build. Es gilt nur, was im Playbook steht.

Rotationen heißen wie im Playbook P1 bis P6: Der Passeur steht auf Position n.

## Modi
1. **Lernfilm**: Basis Aufstellung, Annahme Pn (Skizze), Angriffswege (Pfeile), Defence.
2. **Formation**: Spieler ziehen, Überlappung wird geprüft.
3. **Stellen**: Annahme Pn und Defence wie im Playbook stellen.
4. **Legal?**: Aufstellung beurteilen.
5. **Quiz**: Positionen, Libero, Aussagen aus dem Playbook.

## Dateien
- `data.js`: Feld, Rollen, 5-1-Reihenfolge
- `playbook.js`: Positionen aus den Skizzen (Basis, Annahme P1 bis P6, Defence)
- `rules.js`: Rotation, Überlappung, Bewertung, Zufallsaufstellungen
- `court.js`, `ui.js`, `quiz.js`, `stats.js`: Oberfläche
- Tests: `node rules.test.js && node playbook.test.js`

## Herkunft der Zahlen
Die Skizzen sind von Hand gezeichnet und wurden in Meter übertragen (Genauigkeit etwa 0,2 m).
Korrigiert, weil die Skizze gegen die Überlappungsregel verstößt: P2 (Plätze 3/6, 0,15 m), P4 (Plätze 3/4, 0,42 m), P5 (Plätze 3, 4, 5, bis 1,03 m). P1, P3, P6 sind wie gezeichnet.
Die Defence-Skizze gilt für alle Rotationen: A und M der Vorderreihe blocken, A der Hinterreihe steht tief, der Libero ersetzt die M der Hinterreihe.
