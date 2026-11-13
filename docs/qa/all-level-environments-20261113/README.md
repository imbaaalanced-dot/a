# Kampagnenumgebungen 1–7: gemeinsamer Detailpass

Basis: `main` / `7ca2783546342e4eac1b79b09278ae15593fbec0`.

## Umsetzung

- Alle sieben Level erhalten 64 deterministisch platzierte, größere Moos-/Erd-/Verwitterungsflecken, die das wiederholte Grundmaterial auflockern. Hohensyburg nutzt gedeckte Steinfarben.
- Kleinvegetation unterscheidet jetzt flache Farnwedel, Moospolster und Steinsplitter. Die vorhandenen Wegsaum- und Kontaktdetails bleiben in zwei gecachten Atlanten.
- Westhofen nutzt erstmals diesen gemeinsamen Detailpass mit eigener Palette. Straße, Bushaltestelle, Gehweg, Denkmalvorplatz und Hecken-/Bankflächen bleiben von den neuen Bodenflecken und Pflanzen frei. Auch Goethestraßes Straßenfront ist ausgespart.
- Neue Vegetation, Bodenflecken und Wegsäume halten Abstand von Bodentoren und Lufttoren; Bodenflecken halten mit ihrem gesamten Radius Abstand von Wegen, Bauplätzen und historischen Gebäude-/Terrassenflächen.
- Leveldaten, Pfade, Bauplätze, Monumentanker, Kampflogik und Speicherstände wurden nicht geändert. Vorhandene offene Monument-PRs wurden nicht übernommen oder verändert.
- Keine neuen Bitmap-Dateien oder Bilddownloads für die Spielgrafik. Alle Ergänzungen entstehen beim einmaligen Aufbau des bereits vorhandenen Canvas-Caches. Zwei Atlanten für genau ein aktives Level: maximal 18 MiB normal / 4,5 MiB in niedriger Qualität. Das ist das Budget dieses Detailpasses, keine Messung des gesamten Spielspeichers.
- Der individuelle Cache-Key von `map-polish-v410.js` wurde aktualisiert.

## Prüfungen

- Alle **113** ausführbaren Testbefehle aus `.github/workflows/test.yml` lokal bestanden (einschließlich mobiler VM-Varianten und Python-Assettests).
- Zusätzlich die sieben gezielten Terrain-/Environment-/Referenzmaterial-Testdateien mit `node --test` bestanden.
- `tests/map-polish-v410.test.cjs`: alle sieben Level, unveränderte Layouts, Platzierungsabstände, reproduzierbare Pläne, Cache-Wiederverwendung, Low-Budget und Canvas-Ausfallpfad bestanden.
- Reproduzierbarer Browsercheck: `TD2_CHROMIUM_EXECUTABLE=/usr/bin/chromium node tools/verify-all-level-environments.cjs`. Ohne System-Chromium kann Playwright seinen installierten Browser verwenden; die Variable dann weglassen.
- Der Browsercheck wartet explizit auf alle neun dekodierten V3-Materialtexturen und die Levelassets, setzt den Tutorial-Kartencache nach dem Materialladen zurück, schließt Story/Tutorial über deren Bedienelemente und prüft den tatsächlich gerenderten Detailcache einschließlich Wiederverwendung in Folgeframes. Desktop: 1280×800; Touch-Emulation: 412×915; gleicher Standardzoom.

## Vergleichsbilder

`desktop-comparison.webp`: je Zeile Level 1–7, links Basis, rechts Änderung.

`mobile-comparison.webp`: Spalten Level 1–7, oben Basis, unten Änderung.

Die Bilder zeigen eine frühe Kampfszene. Bewegliche Gegner, Partikel und Wellenbanner sind zeitabhängig; die Bodenpläne sind deterministisch. Die Vergleichsaufnahmen der Basis verwenden dieselben geladenen Materialien; nur für Level 7 entfällt dort die neue Detailcache-Zuordnung, da sie vor diesem Patch noch nicht existierte.

Die beiden Kontaktbögen wurden visuell geöffnet und geprüft: Bodenflecken und Kleinvegetation sind zurückhaltend sichtbar, Bauplätze und Straßenfront bleiben lesbar. Das ist eine gezielte Umgebungsüberarbeitung, keine abgeschlossene Neugestaltung sämtlicher Denkmäler.

## Grenzen

Keine Abnahme auf physischem Android mit 4 GB RAM; keine FPS- oder Gesamtspeicherverbesserung behauptet. Bestehende Denkmal-/Terrassen-Grafikfragen (insbesondere die getrennten offenen Hohensyburg-/Westhofen-Art-PRs) sind mit diesem Boden- und Vegetationspass nicht abgeschlossen. Kein Merge oder Release.
