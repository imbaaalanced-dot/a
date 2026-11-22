# Level 3 Kirchende – Denkmal-Ausrichtung (P1 aus #330 §2)

Stand: 2026-11-22. Befund und Varianten für die visuelle Winkel-Abnahme durch Marcel.

## Befund

Der P1-Punkt aus #330 („Denkmalrotation/Ausrichtung: aktuell zu weit nach rechts
gedreht; Blick zur unteren Spielecke/Spielerposition") betrifft das Level-3-Denkmal:
Das Sprite `monument-style2-pilot.webp` (261×425) zeigt die Seitenfläche auf der
**rechten** Kante und den Sockelschatten nach rechts — das Denkmal liest als nach
rechts gedreht, nicht zur unteren Spielecke (Spielerposition). Vergleiche
`variants.png` (links Default, rechts gespiegelt) und den In-Game-Ausschnitt
`docs/qa/v410/browser/desktop-map3.webp`.

## Maßnahme (rein visuell, keine Geometrie-Änderung)

- `dist/kirchende-art.js`: neuer opt-in Query-Parameter `?td2KirchendeMemorialFace=-1`.
  Er spiegelt nur das Denkmal-Sprite (`face=-1`), sodass die Vorderseite zur unteren
  Spielecke zeigt. Default bleibt `face=1` — keine stille Änderung des Live-Builds.
- Anker, Zeichnungsrechteck, Hitbox, Pfade, Tore, Bauplätze, Save-Keys und alle
  anderen Sprites bleiben unverändert (im Test gepinnt: identisches `drawImage`-Rechteck).
- Das Foto-Legacy (`?td2KirchendeMemorialLegacy=1`) lässt sich mit dem Face-Parameter
  kombinieren.

## Varianten vergleichen

- Lokal/CI-Browser: `node tools/verify-kirchende-memorial-browser.cjs` schreibt
  `desktop-style2-default-orientation-variants.png` (beide Varianten nebeneinander,
  gleiche Kamera/Beleuchtung/Skalierung 235 px).
- Live im Spiel: Level 3 mit `?td2KirchendeMemorialFace=-1` starten und gegen den
  Default ohne Parameter vergleichen.

## Tests

- `node tests/kirchende-memorial-orientation.test.cjs`: Default face=1, Variante
  face=-1 nur für `monument`, identisches Zeichnungsrechteck, explizites `face`
  gewinnt, Legacy-Modus kompatibel, ungültiger Wert fällt auf 1 zurück.
- `node tests/kirchende-memorial-pilot.test.cjs`, `tests/kirchende-loading.test.cjs`,
  `tests/kirchende-site-layout.test.cjs` unverändert grün.
- CI: Workflow `td2-kirchende-memorial-browser.yml` (Node-Gate + Chromium-QA-Artefakte).

## Status

**Offen:** Finale Winkel-Abnahme durch Marcel (Default vs. `face=-1`). Erst nach
seiner Wahl wird die gewählte Ausrichtung als Default verdrahtet. Kein Android-4-GB-
Gerätetest in diesem Patch (visuelle 2D-Spiegelung ohne neue Allokation; CI-Chromium
reicht als Nachweis, physische Abnahme bleibt separat offen).
