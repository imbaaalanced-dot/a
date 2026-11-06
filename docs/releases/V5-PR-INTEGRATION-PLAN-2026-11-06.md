# Denkmal TD2 V5 – PR-Bestandsaufnahme und Integrationsplan
Stand: 2026-11-06 (Europe/Berlin). Repository: `imbaaalanced-dot/a`.
Basis: `main` @ `6b7cc3cc5b130e722abbd58dff67543bbd40c909` (fal.ai-Assetworkflow, PR #109).

## Rahmen
- Dieser Branch dokumentiert die V5-Integrationsprüfung und führt eine eigene, read-only CI aus. Er enthält **keine** Gameplay-Änderungen oder vorgezogenen PR-Merges.
- Bestehende Pull Requests, ihre Basisbranches und `main` bleiben unverändert. Kein produktiver Pages-Deploy.
- Die Bestandsaufnahme basiert auf GitHub-PR-Metadaten, Dateilisten, Vergleichs- und CI-Ergebnissen. Sie ist **keine** vollständige Code- oder physische Android-Freigabe.
- Freigabekriterien: Node-, Python- und Ansturm-Suite grün, mobile Logik grün, Android Chrome (4 GB RAM) mit FPS/RAM/Touch-Test, Spielstandmigration und visueller Abnahme.
- 29 PRs offen; 28 Drafts. Die einzige nicht als Draft markierte PR ist #84. GitHub meldet Merge-Konflikte für #73, #74 und #87.

## Arbeitsgruppen – sämtliche offenen PRs

| Gruppe | Pull Requests | Abhängigkeiten, Status und Entscheidung |
| --- | --- | --- |
| V5-Menü und Levelgalerie | #73, #107, #108 | #108 kombiniert #73 und #107, ohne diese zu ändern. #108 CI `Test Denkmal TD` erfolgreich (Run 42123244295) und isolierte Vorschau vorhanden. #73 Konflikt gegen main; #108 vorziehen, Android-Touch/Unlock/Seitenwechsel abnehmen. Einzel-PRs nicht zusätzlich mergen. |
| Westhofen: früher Art-/QA-Stapel | #74, #75, #76, #77, #78, #79 | Aufeinander aufbauend: Monument-SVG → Umgebungspiloten → Platzierung → Vegetation → QA → PR-Trigger. #74 Konflikt gegen seinen Basisbranch. #79 QA erfolgreich (Run 41584608589). Neueren V4.4-main prüfen, bevor alte Änderungen übernommen werden. |
| Westhofen: Figuren, Grafik und Diagnose | #86, #88, #89, #93, #103, #104 | #86 Gegnersheets; #88 Asset-Freigabe; #89 Denkmal-WebP; #93 Steinweg. #103 (statisches Licht) und #104 (Stillstandsdiagnose) liegen auf parallelen Zweigen derselben Westhofen-Vorschau. #104 zuerst auf echtem Android reproduzieren; Ursache unbestätigt. Keine visuelle Arbeit als Fehlerbehebung ausgeben. |
| Render-/Android-Performance-Stapel | #90, #91, #92, #94, #95, #97, #98, #99, #100, #101, #102 | Reihenfolge: nearest-target → Render-Order-Pool → Frame-Telemetrie → adaptive Auflösung → kombinierte QA/Preview → Assertion-Fix → Performance-Preview → SIM/DRAW-Messung → Diagnose-Preview → Paint-Callback-Pool → Render-Preview. #95 jüngster CI-Lauf **fehlgeschlagen**, #97 Fix-Branch grün (Run 41917872446), #99 und #101 ebenfalls grün. Integrationspunkt nach Android-Messung auswählen, nicht jeden gestapelten PR separat mergen. |
| Spielsimulation und Ansturm | #87 | Breiter isolierter CPU-Patch, CI grün (Run 41612906375); Konflikt gegen `main` und Überschneidungen an `dist/game.js` mit Performance-/Touch-Patches. Auf V5-Basis konfliktbewusst übertragen und Verhalten gegen Referenz prüfen. Android-FPS nicht gemessen. |
| Android-Bedienung | #84 | Bau-/Rüstkammer-Touchverbesserungen auf `release/v4.1.0` (nicht `main`), kein Draft. Gegenüber main deutlich veraltet; nach Menüentscheidung neu überprüfen, Bau-Touch und Speicherstand mit Gerät testen. |
| Grafik-Performance-PoC | #83 | Filter-Bake-Prototyp, CI auf eigenem Branch grün (Run 41589013632), aber echte 4-GB-Android-GPU-Messung fehlt. Nicht ohne Messwert in V5 aufnehmen. |

## Konkrete CI-Befunde

- **#108:** `Test Denkmal TD` Run 42123244295 erfolgreich. Der separate Ansturm-Preview-Lauf war `skipped`, nicht grün.
- **#107:** `Test Denkmal TD` Run 42114917338 erfolgreich.
- **#95:** Run 41930055272 rot in `Node gameplay, art, performance regression suites`; `tests/render-order-pool.test.cjs:41` meldet `1 !== 2` (`pool shrinks active list when enemies disappear`). Python-/Ansturm-Tests waren grün; Mobile-Lauf wurde übersprungen. Kein Beleg eines Runtime-Bugs.
- **#97:** Fügt nach 250 zufälligen Sichtbarkeitsszenarien `game.monument.hidden=false; game.hero.hidden=false;` hinzu; Run 41917872446 grün. Die Assertion-Korrektur ist im späteren Teststapel enthalten. Nicht als Gameplay-Fix einstufen.
- **#101:** Render-Callback-Pooling Run 41923423092 erfolgreich; **#99:** CPU-/Draw-Messung Run 41920992955 erfolgreich.
- **#87:** Run 41612906375 erfolgreich, aber im aktuellen `main` nicht konfliktfrei integrierbar.
- **#79:** isolierte Westhofen-QA Run 41584608589 erfolgreich.
- Für die übrigen Köpfe wurde über die PR-Commit-Laufabfrage kein PR-getriggerter Workflow-Lauf gefunden; das bedeutet **nicht**, dass die Branches nie getestet wurden.

## Priorisierte V5-Sequenz

1. **Stabilitäts-Gate:** Westhofen-Freeze mit #104 auf physischem Android (4 GB) reproduzieren; UI-Reaktion, Zeitpunkt, Kopierbericht, FPS/CPU/DRAW und Spielstand dokumentieren. Ohne Diagnose keinen vermeintlichen Freeze-Fix mergen.
2. **Menü-Gate:** #108 unter Android Chrome: 2×2-Karten, Wisch-/Seitentasten, gesperrte Karten (nur Stadtname), Freischaltungen nach Level 2, Hauptmenü-Routen, Hoch-/Querformat, Save-Isolation. Danach entscheiden, ob #108 alleiniger Integrationskandidat wird.
3. **Touch-Gate:** #84 auf den aktuellen Hauptstand übertragen, sobald Menü und Spielstart gesichert sind; Turmbau und Rüstkammer auf realem Gerät testen.
4. **Leistungs-Gate:** #97-Korrektur als Testvoraussetzung erhalten; #99/#101- und #102-Preview gegen Baseline auf Android vergleichen, dann den Performance-Stapel inkl. #87 bewusst neu aufsetzen.
5. **Westhofen-Art:** Bereits in V4.4/main enthaltene Grafiken ermitteln; nur fehlende, abgenommene #86/#88/#89/#93/#103-Teile übernehmen. Cache-Invalidierung und Speicherkosten kontrollieren.
6. **Release-Gate:** Vollständige Regression inklusive Ansturm 3×, Kampagnenfortschritt, Loot V2, Altspielstände, Touch, Asset-Ladefehler, Pause/Hintergrund und warmem Neustart; isolierte HTTPS-V5-Testversion erst nach erfolgreicher CI veröffentlichen.

## Keine stillen Annahmen
- `mergeable=true` ist kein Android-Freigabebeleg. `mergeable=false` betrifft den jeweiligen PR-Basisbranch.
- Die CI prüft Logik/Syntax und Asset-Verträge, nicht echte GPU-Leistung oder vollständige Touchbedienbarkeit.
- Die aktiven Level 5/6 laut aktuellem README sind Hohensyburg und Goethestraße; ältere Konzepte mit vertauschten Nummern sind veraltet.
- Bereitgestellte historische Konzepte zu Portalreise und Bumerang gelten nicht als aktuelle Freigabe zur Wiedereinführung.
- Die fal.ai-Konfiguration in `main` ist opt-in; keine API-Schlüssel in Quellcode, Tests, CI-Ausgaben oder Dokumentation.
