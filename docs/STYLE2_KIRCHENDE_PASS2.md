# Style 2 – Kirchende: Terrain- und Vegetationspass 2

Stand: 16.10.2026 · Branch: `feature/style2-kirchende-pass2-20261016`
Baut auf `feature/style2-churchyard-pass1-20261016` und damit auf dem Level-4-Entwicklungsstand auf.

## Bildsprache
Illustratives, kontrastreiches Dark-Fantasy-2.5D mit Foto-Anmutung:
- **Farbwelt:** moosige Oliv-/Dunkelgrüntöne, graubraune Steinoberflächen, dezente Bernsteinlichter.
- **Denkmalumfeld:** feinere Brüche und Verfärbungen zwischen vorhandenen Steinplatten.
- **Bodentiefe:** Rand-Moos und Laub, sparsam verteilte Lichtflecken unter Laubbäumen, dezente Schatten.
- **Vegetation:** drei kleine vorgerenderte Wurzel-/Laubdekore pro Baumgruppe.
- **Priorität:** Gegner, Helden, Wege, Bauplätze und das Denkmal müssen aus Android-Portrait-Zoom sofort lesbar bleiben.

## Implementiert
- `dist/kirchende-art.js` ergänzt deterministische Fugen, Moospolster, gealterte Steinrisse, warmes Licht und Randabschattung im bereits vorhandenen 384×384-Denkmalplatz-Canvas.
- Drei unterschiedliche 192×112-Wurzel-/Laub-Sprites werden pro Levelinstanz lazily erzeugt und danach unter die vorhandenen elf Bäume gezeichnet.
- Der fotobasierte Monument-Sprite `monument-photo-v2.webp` und die Bodentextur `ground-photo-v2.webp` bleiben bestehen; keine neuen Netzwerkanfragen.
- Der normale Grafikmodus und der reduzierte Modus nutzen dieselben gecachten Sprites, ohne zusätzliche per-Frame-Gradienten.
- Browser-Cache-Key für `kirchende-art.js`: `v400a6s2p2`.
- Regressionstest: `tests/style2-kirchende.test.cjs`; Testworkflow um neuen Branch/PR-Basis erweitert.

## Nicht geändert
Level-3-Geometrie, Gegnerrouten, Turmbauplätze, Collision, Boss/Kampf, Spielstand und Freischaltungen sowie die Koordinaten der Kirche und des Löwen in Level 4.

## Historische Genauigkeit
Die visuelle Richtung orientiert sich an Nutzerfotos und -videos der Umgebung (Moos, Laub, schmaler Steinweg, Bänke und Gehölze). Himmelsrichtungen, Baumpositionen, Oberflächenalter und Schattenrichtung sind künstlerische Näherungen. Keine amtliche Bestandsaufnahme. Details: `docs/KIRCHENDE_PHOTO_TERRAIN.md`.

## Abnahme
- Schnelltest: Syntax, Aufbau einmalig pro Grafik und 4 wiederverwendete Canvas bei Wiederholungsrendering.
- CI: `node tests/style2-kirchende.test.cjs`, `node tests/kirchende-loading.test.cjs`, `node tests/terrain-polish.test.cjs`, `node tests/cache-busting.test.cjs` und übrige Suite.
- Ausstehend: echter Android-Sicht-/FPS-Test (Portrait/Zoom, Szene mit vielen Einheiten), Test auf Überdeckung der Bauplätze durch Vegetation.
- Isolierter GitHub-Pages-Tester: `https://imbaaalanced-dot.github.io/a/v4-style2/` (Veröffentlichung über Branch-Workflow). Die eigene Site enthält denselben Level-3-/Level-4-Grafikstand.
- Nur im Vorschaupfad sind beide Kapitel direkt anwählbar. Kapitelabschlüsse für Level 3 und Level 4 werden von dieser Vorschau nicht als Freischaltung gespeichert; Beute-/Inventaraktionen folgen weiterhin der normalen Spielmechanik.
- Die Hauptversion `main` ist unverändert. Der Cleanup-Schutz für `/v4-style2/` ist bislang nur im Entwicklungsworkflow enthalten; ein neuer Main-Deploy mit altem Cleanup kann den Testordner wieder entfernen.
