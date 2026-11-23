# Traffic-Prototyp „fahrende Autos" (P1 #330 §2)

Stand: 2026-11-22. Optionale, dezente Umgebungsanimation als Prototyp —
noch keine Freigabe, noch keine Android-4-GB-Messung.

## Umfang

- Nur dekorative Fahrzeuge auf den **autorisierten Straßen** der Level
  3 (Kirchender Dorfweg, `levels.js`-`street`), 6 (Goethestraße) und
  7 (Reichshofstraße, Westhofen). Die Straßen-Polylines werden von den
  Level-Modulen exportiert (`DenkmalGoetheArt.streetRoutes()`,
  `DenkmalWesthofenArt.streetRoutes()`), damit Traffic und gezeichneter
  Straßenverlauf nicht auseinanderlaufen können.
- **Opt-in:** `?td2Traffic=1`. Default AUS. Zusätzlich aus bei `lowFX` und
  `prefers-reduced-motion: reduce`.
- Reine Canvas-Zeichnung (Karosserie, Fenster, Räder, dezentes
  Scheinwerferlicht in den Abend-Leveln 6/7). Keine neuen Bild-Assets,
  keine neuen Imagedecodes, Routen-Metriken werden gecacht.
- Max. 3 Autos pro Route, feste Seed-Parameter: Position ist eine reine
  Funktion aus `time` — deterministisch, kein `Math.random()` im Draw-Pfad.

## Spielbeeinträchtigung / Kollision

- Autos sind **keine Entities**: sie tauchen in keinem Pfad-, Slot-, Gate-,
  Kollisions- oder Wellenzustand auf. Das Layout wird nur gelesen
  (Test pinnt: Layout-JSON vor/nach `draw` identisch).
- Autos fahren ausschließlich innerhalb der Straßenhalbbreite auf der
  Polylines (Test pinnt Bound pro Auto).
- Gezeichnet unter den acteurs (Hook in `Style2Ambience.drawGround`, vor
  Türmen/Gegnern/Helden), damit querende Gegner nie „unter" einem Auto
  verschwinden.

## Performance

- Pro Frame höchstens 6 Autos (2 Routen × 3), jeweils ~10 günstige
  Canvas-Operationen; keine Allokation im Hot-Path (Routen-Prep gecacht,
  Positions-Scratch wiederverwendet).
- **Nicht gemessen:** FPS/RAM auf physischem Android 4 GB — CI-Chromium
  deckt nur den Default-Pfad (Traffic aus) ab. Vor einer Default-Schaltung
  ist die 4-GB-Abnahme Pflicht (Issue-#330-Regel).

## Tests

- `node tests/traffic.test.cjs`: Opt-in/Opt-out, lowFX/reduced-motion aus,
  Auto-Anzahl gedeckelt, Positionen auf der Straße, Determinismus,
  Layout-Unveränderlichkeit, Hook in `style2-ambience.js` und
  `index.html`-Eintrag gepinnt.
- `tests/cache-busting.test.cjs`: `traffic.js` + gebumpte Keys
  (`style2-ambience.js`, `westhofen-art.js`, `goethestrasse-art.js`).
- Vollsuite lokal: alle Node-Tests grün.

## Review für Marcel

Level 3/6/7 mit `?td2Traffic=1` starten und auf Dezente/Position/Licht
prüfen; danach Entscheidung: Default an/aus, Auto-Anzahl, Farben.
