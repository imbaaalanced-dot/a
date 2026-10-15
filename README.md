# Denkmal TD / TD2 · v4.0.0-alpha.5

Visueller Alpha.5-Patch vom 15. Oktober 2026: goldene Level-Sterne, gecachte Waldtexturen, Stein-/Wegoberflächen und neue Baumkronen in Kirchende. Keine Änderungen an Kampfwerten, Wegen oder Bauplätzen.

Zusammengeführter Stand vom 15. Oktober 2026: main mit V4/Kirchende, Kampagnen- und Endlosmenü, Intro-Tutorial, Zielvorhersage und Treffer-Effekten.

Enthalten bleiben das kompakte HUD-Menü, getrennte Helden-/Beuteansichten, Sammel-Recycling und dauerhafte Ausrüstung. 2×-Tempo steht ab Level 2 und im Endlosmodus bereit. Speicher-Schlüssel und bestehende Migrationen bleiben erhalten.

Das Level-1-Monument liegt jetzt vollständig im Quellcode; ein Rückgriff auf ältere Veröffentlichungen ist nicht mehr erforderlich. Die Levels 4–6 sind keine spielbaren Bestandteile dieses Merge.

## Testen und Veröffentlichung

Alle tests/*.test.cjs (einschließlich terrain-polish.test.cjs) sowie TEST_MOBILE=1 node tests/game.test.cjs und python tests/assets.test.py ausführen. Der Pages-Workflow prüft die Tests vor der Veröffentlichung von dist/ auf gh-pages. main veröffentlicht den regulären Testlink https://imbaaalanced-dot.github.io/a/ . Die separaten historischen Testpfade bleiben erhalten.

Lokal: python -m http.server 8777 --directory dist

Der Alpha.5-Tester-Build wird über die Branch-Pipeline unter https://imbaaalanced-dot.github.io/a/v4-alpha5/ veröffentlicht, sobald deren Test- und Publish-Lauf erfolgreich abgeschlossen ist. Die neue Geländegrafik ist bewusst prozedural aus wiederverwendeten Kacheln aufgebaut statt als vollständiger Screenshot hinterlegt.

Die automatisierten Prüfungen ersetzen keinen realen Android-Spieltest. Inventar und Freischaltungen liegen im Browser auf diesem Gerät; vor dem Löschen von Browserdaten die Beute als JSON exportieren. Ausrüstung wird nur im Hauptmenü gewechselt.

Historische RELEASE_*.md beschreiben frühere Stände. Die getrennte Sites-Fassung TD2 v0.6 ist nicht Teil dieses Repository-Merge.
