# Spät geladene V3-Böden aktualisieren gecachte Karten

Basis: `main` @ `85250bacbfc57ce1bfac68d4332923d8100f2ecb` (veröffentlichter PR #255).

## Reproduzierter Fehler

Wird eine Karte vor dem Dekodieren der V3-Materialien gezeichnet, bleibt ihr Ersatzboden im Canvas-Cache. Das spätere Laden der Texturen löst keinen Neuaufbau aus. Im kontrollierten Chromium-Test gegen unveränderten `main` scheitert Level 1: Vorher-/Nachher-Pixelhash identisch (`4274246678`). Der neue Unit-Test reproduziert ebenfalls die ausgebliebene Aktualisierung.

Außerdem lieferte ein zweiter Aufruf von `DenkmalTerrain.load()` bereits Erfolg, sobald die ältere Grundtextur geladen war, obwohl der erste Aufruf noch auf die V3-Materialien wartete.

## Korrektur

- Der V3-Loader veröffentlicht nach Abschluss seines einmaligen Downloadpakets eine Materialrevision. Auch teilweise erfolgreiche Downloads erhalten eine Revision; bei komplettem Fehlschlag bleibt die Revision unverändert.
- Die gecachten Bodendarstellungen für Level 1/2, 3/4 und 5–7 vergleichen diese Revision. Nach dem Laden wird der Ersatzboden einmal ersetzt. Danach greifen dieselben Caches wie vorher.
- Kirchende/Dorfkirche können eine bereits geladene V3-Grundtextur direkt verwenden, auch wenn die ältere Grundtextur noch fehlt.
- Gleichzeitige Terrain-Ladeaufrufe erhalten dieselbe noch laufende Promise. Kein vorzeitiges Erfolgssignal zwischen Grundtextur- und V3-Decode.
- Individuelle Script-Cache-Keys aktualisiert. Keine neuen Spielassets, Änderungen an Wegen, Bauplätzen, Spielständen oder Kampflogik.

## Nachweise

- 15 gezielte Unit-/Regressionstestdateien bestanden, einschließlich Cacheversionen, Level 4/5/6/7, optionaler Vorschauen und gemeinsamer Bildverwaltung.
- `tests/ground-late-load.test.cjs`: alle sieben Level; gecachter Ersatzboden während des Ladens, genau ein Neuaufbau nach erfolgreichem Decode, stabile Folgeframes, unveränderte Layoutdaten, teilweise/komplett fehlgeschlagene Downloads und konkurrierende Terrain-Ladeaufrufe.
- `tools/verify-ground-late-load-browser.cjs`: 14 Chromium-Szenarien (sieben Level × Desktop/Touch-Emulation). V3-Netzwerkantworten werden kontrolliert zurückgehalten, bis der Ersatzboden gecacht ist. Danach ändern sich die tatsächlichen Canvas-Pixel; exakt eine zusätzliche Welt-Canvas-Allokation, genau neun Materialrequests und keine weiteren Allokationen in 20 Folgezeichnungen. Keine JavaScript- oder HTTP-Assetfehler.
- Dieser isolierte Renderertest zeichnet die echten Bodenmodule auf ein Canvas; er ist kein vollständiger Spieltest. Die separate Prüfung mit `tools/verify-all-level-environments.cjs` hat ebenfalls alle 14 Spielansichten (1280×800 Desktop / 412×915 Touch-Emulation) ohne JavaScript-/Assetfehler bestanden; alle neun V3-Materialien sind dekodiert. Ergebnisse: [gameplay.json](gameplay.json).
- Neuer Unit-Test im Haupt-Testworkflow; verzögerter Chromium-Test samt Bild-/JSON-Artefakten in der Referenzboden-CI ergänzt.

[Level-1-Vergleich](level1-delayed-decode.webp) · [14 Renderer-Ergebnisse](delayed-decode.json)

Keine physische Android-Abnahme oder FPS-/Gesamtspeichermessung. Der einmalige Neuaufbau nach spätem Laden benötigt Renderarbeit; eine Performanceverbesserung wird nicht behauptet. Kein Merge oder Deployment dieses Folgepatches ohne gesonderte Freigabe.
