# Level 5: sanfterer Kampagneneinstieg

Ausgangspunkt: PR #61, Commit 8f4228e. Separater Branch; bestehende PRs bleiben erhalten.

## Befund und Entscheidung
Die globale Wellennummer 17 löste sofort die Obergrenze von 48 Gegnern und 0,30 Sekunden Spawnabstand aus. Die Karte startet mit Basisheld und ohne aufgebaute Türme. Luft- und schwere Bodengegner kamen gemeinsam bereits in der ersten Welle.

Gewählt: lokale Kampagnenprofile für Wellen 17–20 statt ausschließlich mehr Startessenz oder global schwächerer Gegner. So bleibt die Schwierigkeit anderer Karten und des Endlosmodus erhalten. Gegnerwerte, Startessenz, Turmkosten und Bosswerte bleiben gleich.

| Welle | Gegner | Spawnabstand bei 1× | Einführung |
| --- | --- | --- | --- |
| 17 | 32 | 0,75 s | Geister und Läufer, zwei Bodenwege |
| 18 | 38 | 0,60 s | Wächter und vier Schattenflügler |
| 19 | 44 | 0,48 s | Schützen und Gargoyles |
| 20 | 48 | 0,40 s | Boss, Sappeure und Sturmgeister |

Vorher alle vier Wellen: 48 Gegner, Abstand 0,30 s. Die Startmenüvorschau nutzt dieselben Regeln wie die tatsächlichen Spawns. Warntext kündigt Flieger ab Welle 18 an. Cacheversionen wurden aktualisiert.

## Prüfung
Der neue Integrationstest scheiterte vor der Umsetzung mit 48 statt 32 Gegnern. Danach 61/61 Node-Testdateien grün, mobile Gameplayprüfung und mobile Level-5-Vorschau grün, zehn Python-Assettests grün. Integration prüft tatsächlichen Spawnabstand, Neustart aus anderer Karte sowie unveränderte 48 Gegner/0,30 s im Endlosmodus.

Vier alte Tests erwarteten den vorherigen exakten game.js-Cachekey; diese Erwartungen wurden auf den neuen Key aktualisiert.

## Offene Abnahme
Noch keine Aussage zur Gewinnquote oder FPS auf physischem Android. Weniger Gegner bedeuten auch weniger verdiente Essenz: nach Welle 19 verbleibende Essenz, Turmstufen und Boss-Siegquote beobachten. Zuerst mit normaler Ausrüstung bei 1× testen, danach 2×. Ziel: erster Aufbau ist ohne perfekte Ausrüstung möglich; letzte Welle bleibt anspruchsvoll.

Isolierter Preview-Workflow: /a/td2-level5-balance/v4-level5/. Der vorhandene Testvorschaupfad schaltet Level 5 zum Testen frei und schreibt keinen Kampagnenabschluss. Veröffentlichung erst nach erfolgreichen CI-Prüfungen; kein Merge nach main.
