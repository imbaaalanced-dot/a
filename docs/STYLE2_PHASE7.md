# Denkmal TD2 · Style 2 Grafikphase 7

Basis: `feature/style2-phase6-20261016` (PR #40). Eigener Entwicklungsbranch; kein Merge nach `main`.

## Umfang
- Zwei einmalig erzeugte 128×128-RGBA-Canvas-Lichtmasken (bernsteinfarben und blau) für geringe Lichtreflexe am Denkmal und an vorhandenen Torpunkten; Flugtor in Goethestraße erhält einen eigenen schwachen blauen Akzent.
- Deterministische, ortsfeste Staub- und Laubpartikel über der Kulisse. Maximal 48 sehr kleine Motive im sichtbaren Ausschnitt; keine neuen Canvas-Texturen oder Zufallswerte pro Frame.
- `GRAFIK: NIEDRIG` deaktiviert bewegte Atmosphäre und reduziert Lichtintensität.
- Stimmigere Bronzekanten, Oberflächenlicht und Auswahlzustände in Ressourcenanzeigen, Wellenpanel und Arsenal. Kein neues HUD-Layout und keine verkleinerten Android-Berührungsflächen.
- Die gesamten Änderungen sind rein visuell. Gegnerpfade, Bauplätze, Denkmalpositionen, Türme, Werte und Speicherstände bleiben unverändert.

## Prüfung
- `node tests/style2-ambience.test.cjs`: gleichbleibende Partikelpositionen zur selben Zeit, unveränderte Weltgeometrie, 2 Licht-Canvas maximal, restaurierte Canvas-Zustände, Android-Niedrigmodus, Parser-/Einbindungskontrollen.
- Für die Veröffentlichung vollständige Node-/Android-Simulationstests und reale Sicht-/FPS-Prüfung ausführen. Ohne diese Prüfungen ist es ein *Entwicklungsstand*, kein bestätigter Android-Release.

Die Bildgenerator-Vorschau ist ausdrücklich **kein** automatisch importiertes Spielasset. Die tatsächlich integrierte Atmosphärenschicht entsteht reproduzierbar durch Canvas und benötigt keine externen Bild-Downloads.
