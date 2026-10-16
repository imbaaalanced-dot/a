# Denkmal TD2 – Style 2: Kanonenturm Grafikpass 3

Stand: 16. Oktober 2026. Branch: `feature/style2-cannon-pass3-20261016` auf Basis des bereits kombinierten Style-2-Kirchende-Branches.

## Drei unterscheidbare Entwicklungsstufen

| Stufe | Turmoptik | Projektil | Visueller Einschlag |
|---|---|---|---|
| I | Steinunterbau, hölzerne Tragkonstruktion, einfache bronzefarbene Kanone | Dunkelbraune Holzkugel mit Maserung | Kleine erdige Staubwelle und Holz-/Steinsplitter |
| II | Größerer befestigter Sockel, Eisenstützen und breite Kanone | Dunkle Eisenkugel mit metallischem Glanz | Mittlerer grauer Stoßring, Splitter und Rauch |
| III | Verstärkte Bastion, glühender Kern und bronzene Verzierungen | Glühende Explosivkugel mit Funken | Größerer bernsteinfarbener Feuerstoß und Partikel |

## Technische Umsetzung

- `dist/style2-cannon.js`: keine neuen Bilddownloads; alle drei Turmstufen (240×256), drei Geschosse (80×80) und sechs Einschlagbilder pro Stufe (144×144) werden bei Bedarf in Offscreen-Canvas gezeichnet und anschließend wiederverwendet.
- `dist/game.js`: Level-gerechte Turmzeichnungen mit den vorhandenen 1–3 Goldsternen; die bisherige Sprite-Auswahl bleibt als Fallback im Code.
- `dist/combat-fx.js`: Spezialprojektil und ein zusätzlicher Level-spezifischer Einschlag innerhalb des bestehenden Partikellimits (240), anstelle der alten generischen Cannon-Atlas-Explosion.
- Statischer Script-Cache-Key: `v400a6s2c3`.
- `tests/style2-cannon.test.cjs`: optische Stufentrennung, Wiederverwendung der Render-Caches, FX-Lifecycle, FPS-freundliche Hot-Paths, Particle-Cap und vorhandener Kanonenturm-Grundwert.
- Isolierter Spielbuild: `/a/v4-style2-cannon/` nach erfolgreichem Deployment. Level 3 und Level 4 sind dort testweise direkt anwählbar, ohne dadurch reguläre Kapitelabschlüsse freizuschalten.

**Wichtig: bestehendes Schadens-/Splash-Balancing wurde nicht verändert.** Die vorhandenen Kanonen-Grenzwerte, Upgradeformeln, Zielvorhersage, Kollision und Schockeffekte bleiben identisch. Die Explosion der dritten Stufe ist visuell kräftiger, nicht zusätzliches Gameplay-AoE.

## Stilrichtung und Qualität

Graphic Dark Fantasy, isometrische 2.5D-Anmutung, verwitterter Naturstein, Bronzeakzente, warmes Bernsteinlicht und eindeutige Turmsilhouetten. Gerade bei Android-Portraitzoom sollen Stufe I (Holz), II (Eisen) und III (glühender Bastionsaufbau) ohne Text unterscheidbar sein.

Offene Checks: CI-Test und separater Pages-Deploy, Smartphone-Playtest mit mehreren Kanonen, Kontrast vor Blatt-/Steinboden, Frame-Rate bei zeitgleichen Treffern, Sichtprüfung im Auto-/Low-Graphics-Modus. Keine Änderungen an `main`; die Bereinigungsroutine des aktuellen `main`-Workflows schützt den neuen Testpfad erst nach Übernahme des entsprechenden Workflows.
