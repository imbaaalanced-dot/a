# Denkmal TD2 · V4.1.0 in Entwicklung

Aktueller freigegebener Hauptstand: V4 Alpha9 mit LootV2, Kampagnenbalance und Ansturm-Menü/Tutorial. Branch `release/v4.1.0` entwickelt die fünf freigegebenen Pakete. Seine Kennung `v4.1.0-alpha.1` bezeichnet einen separaten Vorabbuild; sie ist kein abgeschlossener Hauptrelease.

- [Separater V4.1 Alpha1 Testbuild – nach erfolgreicher CI-Veröffentlichung](https://imbaaalanced-dot.github.io/a/td2-all-patches/v4.1.0/)
- [V4.1 Alpha1 Änderungen](docs/releases/V4.1.0-RELEASE.md)
- [Verbindlicher V4.1-Umfang](docs/releases/V4.1.0-SCOPE.md)
- [Arbeitsstand und Prüfnachweise](docs/releases/V4.1.0-PROGRESS.md)
- [Animationsvertrag](docs/releases/V4.1.0-ANIMATION-CONTRACT.md)
- [Kartenpolish und Geometrieschutz](docs/releases/V4.1.0-MAPS.md)
- [Reproduzierbare Balanceanalyse](docs/releases/V4.1.0-BALANCE.md)

Aktive Kampagnenreihenfolge:1 Einleitung,2 Labyrinth,3 Kriegerdenkmal Kirchende,4 Ender Dorfkirche/Löwe,5 Hohensyburg,6 Goethestraße. Frühere Texte ordnen5/6 teils anders zu; der aktive Code und `levels.js` sind maßgeblich.

Speicherformate und alte Profile bleiben geschützt. Die Android-Abnahme des vorherigen Builds ist vom Nutzer bestätigt; neue Gerätewerte und eine V4.1-Abnahme werden daraus nicht abgeleitet.

## Historisches Entwicklungsprotokoll

Die folgenden Angaben beschreiben ältere Alpha-Patches und sind kein aktueller Versionsstatus.

# Denkmal TD / TD2 · v4.0.0-alpha.5

Visueller Alpha.5-Patch vom 15. Oktober 2026: goldene Level-Sterne, gecachte Waldtexturen, Stein-/Wegoberflächen und neue Baumkronen in Kirchende. Keine Änderungen an Kampfwerten, Wegen oder Bauplätzen.

Fotoabgleich Kirchende (`kirchende-photo-2`): moosiger Erdboden mit Laub, Plattenzugang mit flachen Stufen, verwitterter Denkmalplatz mit separater Steinplatte, seitliche Bänke und dichtes Gebüsch. Der zweite Fotoabgleich ergänzt einen neuen graubraunen Denkmal-Sprite und eine bildbasierte Moos-/Laubtextur. Level 3 beginnt erst nach dem Laden des Denkmals. Die räumliche Umsetzung ist eine Annäherung aus den bereitgestellten Fotos und Videos; siehe `docs/KIRCHENDE_PHOTO_TERRAIN.md`.

Zusammengeführter Stand vom 15. Oktober 2026: main mit V4/Kirchende, Kampagnen- und Endlosmenü, Intro-Tutorial, Zielvorhersage und Treffer-Effekten.

Enthalten bleiben das kompakte HUD-Menü, getrennte Helden-/Beuteansichten, Sammel-Recycling und dauerhafte Ausrüstung. 2×-Tempo steht ab Level 2 und im Endlosmodus bereit. Speicher-Schlüssel und bestehende Migrationen bleiben erhalten.

Das Level-1-Monument liegt jetzt vollständig im Quellcode; ein Rückgriff auf ältere Veröffentlichungen ist nicht mehr erforderlich. Die Levels 4–6 sind keine spielbaren Bestandteile dieses Merge.

## Testen und Veröffentlichung

Alle tests/*.test.cjs (einschließlich terrain-polish.test.cjs) sowie TEST_MOBILE=1 node tests/game.test.cjs und python tests/assets.test.py ausführen. Der Pages-Workflow prüft die Tests vor der Veröffentlichung von dist/ auf gh-pages. main veröffentlicht den regulären Testlink https://imbaaalanced-dot.github.io/a/ . Die separaten historischen Testpfade bleiben erhalten.

Lokal: python -m http.server 8777 --directory dist

Der Alpha.5-Tester-Build wird über die Branch-Pipeline unter https://imbaaalanced-dot.github.io/a/v4-alpha5/ veröffentlicht, sobald deren Test- und Publish-Lauf erfolgreich abgeschlossen ist. Die neue Geländegrafik ist bewusst prozedural aus wiederverwendeten Kacheln aufgebaut statt als vollständiger Screenshot hinterlegt.

Die automatisierten Prüfungen ersetzen keinen realen Android-Spieltest. Inventar und Freischaltungen liegen im Browser auf diesem Gerät; vor dem Löschen von Browserdaten die Beute als JSON exportieren. Ausrüstung wird nur im Hauptmenü gewechselt.

Historische RELEASE_*.md beschreiben frühere Stände. Die getrennte Sites-Fassung TD2 v0.6 ist nicht Teil dieses Repository-Merge.
