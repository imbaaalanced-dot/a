# Westhofen: Bodenvegetation und Cache-Polish

**Stand:** 03.11.2026. Separater Folgebranch von `feature/v4.3-westhofen-scenery-placement`.

## Implementiert

- Deterministische niedrige Vegetation: Moos-, Blatt- und einzelne Steingruppen im **bestehenden** Canvas-Boden-Cache. Maximal 130 Platzierungsversuche beim Cache-Aufbau; keine neue Arbeit je Frame.
- Sicherheitsabstände: über 135 Weltpixel zu Gegnerwegen, über 112 zu Bauplätzen, über 355 zum Denkmal-Mittelpunkt und über 155 zu den drei Dekorationsankern.
- Bestehende drei SVG-Umgebungsobjekte, ihr asynchroner Lader und die prozedurale Denkmal-Rückfallsicherung bleiben bestehen.
- Cache-Version auf `westhofen-green1` in index.html und zugehörigen Regressionstests synchronisiert.
- Keine Änderung an Wellen, Spiellogik, Kollisionsdaten oder Fortschrittsspeicherung.

## Prüfnachweise

Sieben isolierte Ausführungstests am aktuellen GitHub-Quelltext erfolgreich: erster Cache-Aufbau, neue Bodendetails, keine Arbeit je Warm-Frame, expliziter Cache-Reset, deterministischer Wiederaufbau, Versionskennungen und unveränderte drei Wege/17 Bauplätze. Der neue Regressionstest ist `node tests/westhofen-vegetation.test.cjs`.

Die isolierten Checks sind **nicht** die vollständige Node-/Python-CI. Eine visuelle Abnahme bei 64/128 px, echter Browser-Test und Android-4-GB-Test sind offen.

## Nächste Abnahme

Browser-Ansicht an der tatsächlichen Spielkamera prüfen, insbesondere Bauplatz-Kontrast, Freiräume, Sichtbarkeit der Pergola/Treppe/Mauer und Speicherverhalten beim Szenenwechsel. Erst nach vollständigen Tests und bestätigter Preview einen Merge erwägen. Bestehende PRs bleiben unangetastet.
