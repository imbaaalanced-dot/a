# Denkmal TD2 · Style 2 Referenzlevel 4 · Durchgang 1

## Ziel
Die Ender Dorfkirche mit dem südlich blickenden Löwendenkmal dient als erste spielbare Referenz für die freigegebene Style-2-Konzeptgrafik. Diese Änderung ist eine **Zwischenstufe**. Sie ist kein Beleg dafür, dass die aufwendigen generierten Perspektivbilder bereits als echte Spielkulisse umgesetzt sind.

## Geliefert
- Neue visuelle Kirchhof-Ebene in `dist/style2-level4-reference.js` auf Basis von Phase 7.
- Ein einmalig erzeugter, 1024²-Pixel großer transparenter Untergrundatlas für einen 2048×2048-Weltausschnitt. Zufallszahlen sind fest gesetzt; nichts wird pro Frame neu gerastert.
- Gedämpfte Moos-, Laub-, Steinsplitter- und trockene Steinmauer-Details, die den bekannten Kirchenumriss, alle Gegnerwege, das Löwendenkmal und die Bauplätze aussparen.
- Wiederverwendete, 70×155-Pixel große Laternen-Sprites mit eingebackenem warmem Licht. Sie werden mit der bestehenden Phase-6-Perspektive am Boden verankert, ohne eigene Hitbox.
- Kein Eingriff in Wege, Gegner, Turmschaden, Bodenanker, 1879-Löwenausrichtung oder Spielstandsschema.
- Referenzlevel über `/a/v4-style2-reference/` als Testvorschau ohne neue Kampagnen-Freischaltung; der normale Loot-Mechanismus bleibt aktiv.

## Prüfungen
`tests/style2-level4-reference.test.cjs` prüft Initialisierung, ausgelagerte Draw-Aufrufe, zwischengespeicherte Grafiken, freie Wege/Bauplätze, reproduzierbare Dekoration und unveränderte Leveldaten. CI und ein eigener GitHub-Pages-Testpfad wurden ergänzt. Ein erfolgreicher CI-Lauf und eine tatsächliche Sichtprüfung auf Android müssen vor einer Freigabe bestätigt werden.

## Offene Qualitätslücke zu den Konzeptbildern
- Die Architektur ist weiter eine gezeichnete Canvas-Annäherung an die echte Kirche und **keine** detailgetreue isometrische 3D-Darstellung.
- Das Gelände ist ein zusätzlicher illustrierter Layer, noch kein hochauflösendes, fertig komponiertes 2.5D-Artwork.
- Ein konsequent neuer Architektur-/Bodenatlas, realistische Bauwerksproportionen, eine bessere Tiefensortierung und ein deutlich reichhaltigeres HUD bleiben Folgearbeiten.
- Kartenwege und genaue Maße sind teilweise Referenzannäherungen, keine Vermessung.
- Mobile Speichernutzung steigt durch den neuen 1024²-RGBA-Atlas um maximal rund 4 MiB.

## Veröffentlichungsstrategie
Draft-Branch auf Phase 7, ohne Merge in `main`. Erst neuer Testbuild, Prüfung des tatsächlichen Bildes im mobilen Browser, Screenshots gegen Zielgrafik und Performance, dann Entscheidung über weitere Grafikarbeit. Vor einem späteren Root-Deploy muss dessen Pages-Workflow den neuen Testordner ebenfalls erhalten, sonst könnte er ihn entfernen.

## Durchgang 2 – Architektur und Steinreliefs
- Kirchendach mit kleineren Schieferkursen, entlang der Traufe verdunkelter Tiefe, schmalen Lichtkanten und einem klareren Dachfirst.
- Fassaden mit hervorgehobenen Strebepfeilern, eingezogenen Buntglasfenstern, Giebelschatten und architektonisch gerahmtem Südportal; Uhrturm mit Steinlagen und Glockenöffnungen.
- Südwärts ausgerichteter schlafender Löwe bleibt unverändert verankert. Feinere Mähnenkonturen, weich abgestufter Steinton, hervorgehobene Tafelumrandung und dezente Flechten sind in der bestehenden Objektbitmap enthalten.
- **Technischer Nachweis:** Der Renderer-Schnelltest hat 3 Canvas-Erzeugungen beim ersten Zeichnen und keine weiteren während 90 Folgezeichnungen gesehen. Das ist keine Sichtprüfung im Livebrowser und kein Android-FPS-Nachweis.
- Browsercache-Key für `church-art.js` auf `ref4b2` gesetzt; dazu Cache- und Level-4-Regressionen aktualisiert. Kein Eingriff in Löwenausrichtung, Kampfverhalten, Kartenwege oder Kollision.

Weiterhin offen: Vergleich mit den Original-Konzeptbildern in echter Gerätedarstellung. Diese Stufe ist ein verbesserter Canvas-Art-Pass, keine fertig produzierte fotorealistische Asset-Pipeline.
