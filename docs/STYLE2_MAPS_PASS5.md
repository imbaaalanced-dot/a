# Denkmal TD2 – Style 2 Grafikpass 5: Einleitung und Labyrinth

**Basis:** PR #38, alle bisherigen Style-2-Grafiken für Kirchende, Dorfkirche und drei Turmfamilien bleiben erhalten.

## Ziel

Den **Bildaufbau der vom Nutzer gewünschten Kartenübersicht** schrittweise in die echte Canvas-Spielgrafik übersetzen: dunkles Grün, bräunliches Steinpflaster, warme Laternen, Mauerränder, gärtnerische Blumenakzente und gut erkennbare runde Turmplätze.

Die Kartenübersicht ist ein **Art-Direction-Referenzbild**, nicht der aktuelle vollständige Spielstand. Dieses Grafikupdate nähert den Echtzeitrenderer daran an, ersetzt ihn aber noch nicht durch isometrische 3D-Assets.

## Implementiert

- `dist/style2-maps.js` malt ein 3072×3072-Weltbild mit 1536×1536 Offscreen-Pufferspeicher, nur bei erstmaligem Öffnen eines Levels oder beim Kartenwechsel.
- **Level 1:** vier bestehende Zufahrten erhalten Steinpflaster, Schattierungen, kleine Fugen, warme Lichtquellen an den vier Toren, Beete um das zentrale Denkmal sowie dezente Gartenmauereffekte.
- **Level 2:** die tatsächlich vorhandene geschwungene Gegnerroute wird bepflastert; seitlich werden dekorative Hecken versetzt, ohne die bekannten Wege oder Bauplätze zu verdecken.
- Dunkle Wiesen-/Laubtextur, kontrastreiche Turmbauflächen, feste, warme Bodenbeleuchtung und randseitige Bepflanzung.
- Die eingefügten Elemente sind **rein dekorativ**, keine Wände mit Kollisionen. Die Hecken dürfen Spieler nicht in die Irre führen: Android-Sichtprüfung und eventuell spätere kollisionsbasierte Anpassung sind vor Release nötig.
- Beim Kartenwechsel wird das bisherige große Grafik-Canvas verworfen: nur eine große Karte gleichzeitig im Speicher.
- `dist/game.js` verwendet das neue Kartenbild für Level 1/2 und lässt die bisherigen gezeichneten Straßen als Fallback erhalten.
- `tests/style2-maps.test.cjs` überprüft lazy caching, Levelwechsel, feste Größen, Beleuchtungsaufbau, unveränderte Routen/Bauplätze und Skripteinbindung.

## Grenzen

- Keine neuen 3D-Modelle oder wirklich isometrische Weltgeometrie.
- Die Kämpfe bleiben im bisherigen Top-down-Spielkoordinatensystem.
- Die Karten stimmen gestalterisch stärker mit dem Moodboard überein, sind **nicht** 1:1 identisch mit der hochauflösenden Konzeptillustration.
- Besonders Level 2 behält die aktuelle **eine** zusammenhängende Gegnerroute; zusätzliche Tore, wie auf der Konzeptgrafik, würden Gameplay- und Layoutänderungen verlangen.
- Die Spielfläche wurde nicht neu vermessen; Turm- und Gegnerkoordinaten bleiben 1:1.
- Nochmalige Realgerät-Tests für Zoom, Kontrast, FPS und Speicherbedarf notwendig.

## Tester

Wenn die CI/Pages-Veröffentlichung gelingt:
https://imbaaalanced-dot.github.io/a/v4-style2-maps/

Die Vorschau lässt Level 3 und 4 weiterhin direkt öffnen; reguläre Kapitel-Freischaltungen werden nicht daraus abgeleitet. `main` ist unverändert.
