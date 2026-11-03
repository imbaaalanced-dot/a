# Gegner-KI und Simulation – 3. November 2026

Entwicklungsbasis: aktueller main `4c8aad92b28108128564d486377b7fcb036259ff`, einschließlich der separat veröffentlichten Ansturm-Tempoauswahl 1×/2×/3× aus PR #85. Referenz für Messungen und Simulationszustände: `c5d6f21e763d425cc596ca81f6a7dd9ae7fd520f` (PR #82); `game.js`, `levels.js` und `model.js` sind zwischen beiden main-Ständen unverändert. Branch: `perf/td2-simulation-20261103`. Der Patch ist unabhängig von PR #83 (Filter-Bake) und PR #84 (Touch-Bau). Bestehende PRs werden nicht verändert. Keine Veröffentlichung und kein Merge.

## Ergebnisse

Median aus sieben Durchlaufmittelwerten, Millisekunden pro **Simulationsschritt**. Kampagne: 1/60 s pro Schritt; Ansturm: 1/30 s. CPU-Host: Intel Xeon Platinum 8573C, Node v24.22.1. Dies sind keine Browser- oder Android-FPS und keine GPU-Messungen. In einem gerenderten Frame können je nach Tempo mehrere Simulationsschritte anfallen.

| Modus | Aktive Gegner | Vorher ms | Nachher ms | Weniger Zeit | hypot-Aufrufe/Schritt vorher → nachher |
|---|---:|---:|---:|---:|---:|
| Kampagne | 25 | 0.427 | 0.255 | 40.3 % | 933.9 → 129.1 |
| Kampagne | 50 | 0.746 | 0.327 | 56.2 % | 2670.3 → 262.7 |
| Kampagne | 100 | 1.186 | 0.485 | 59.1 % | 3663.6 → 429.6 |
| Kampagne | 200 | 3.072 | 1.015 | 67.0 % | 10532.5 → 984.2 |
| Ansturm | 25 | 0.176 | 0.058 | 66.7 % | 535.9 → 122.9 |
| Ansturm | 50 | 0.357 | 0.121 | 66.2 % | 1446.6 → 254.6 |
| Ansturm | 100 | 0.768 | 0.223 | 70.9 % | 3535.7 → 518.1 |
| Ansturm | 200 | 1.932 | 0.443 | 77.1 % | 8307.2 → 1045.1 |

Messung: pro Runde neue deterministische Simulation, 120 Schritte Aufwärmen, 360 gemessene Schritte. Reihenfolge vorher/nachher wechselt pro Runde. Explizite GC erfolgt außerhalb des Messfensters nach Aufbau und Aufwärmen. `hypot` wird in einem **separaten**, nicht zeitgemessenen Durchlauf gezählt. Minimum/Maximum der Durchlaufmittelwerte und Rohwerte stehen in `comparison.json`. CPU-Last, JIT und GC können die absoluten Zeiten beeinflussen; keine harte Millisekunden-Schranke in CI.

`before.json` und `after.json` sind frühere, getrennte Vorher-/Nachherläufe ohne explizite GC. Dort fiel Ansturm/50 als Zeit-Ausreißer auf. Die abschließende alternierende Vergleichsmessung in `comparison.json` ist die Quelle obiger Tabelle. Die früheren Rohmessungen bleiben nachvollziehbar erhalten.

Kampagne: 14 Türme mit gemischten Waffen/Zielmodi, bewegliche Gegner mit hoher HP, laufende Projektile und Effekte. Ansturm: alle Waffen-Upgrades auf Stufe 3, Brennen auf allen Gegnern, gemischte Verlangsamung, Mehrfachschuss und ein Koloss. In beiden Szenarien bleibt die Gegnerzahl während Aufwärmen und Messung konstant. Der Benchmark prüft, dass die Simulation tatsächlich läuft und die Gegnerzahl nicht absinkt. Die Kampagne hat produktiv weiterhin maximal **40 aktive Gegner**; 50/100/200 werden nur im Harness direkt injiziert. Auch 25 Gegner ist hier eine künstlich erzeugte Kampfszene, kein kompletter Spielablauf.

## Analyse und Entscheidung

| Bereich | Befund | Umsetzung / Begründung |
|---|---|---|
| Wegfindung | Kampagne folgt vorgegebenen Wegpunkten mit Bewegungsbudget; kein A* pro Gegner. Flugeinheiten und Ansturm bewegen sich direkt. | Budget, Wegpunkte, Positionen und Reihenfolge unverändert. `pathDistance` iteriert ohne `slice`/`map`/Spread. |
| Entfernungen | `Math.hypot` häufig in Bewegung, Zielvergleich und Projektil-Kollision. Turm-Reichweiten verwenden bereits quadrierte Abstände. | Ansturm berechnet Kandidatenabstände einmal je Auswahl; Kampagnen-Kollision verwirft entfernte Kandidaten vor `hypot`. Exakte Distanzformeln und Grenzoperatoren bleiben bestehen. |
| Turmziele | Kampagne suchte auch während der Nachladezeit; Ansturm sortierte alle erreichbaren Gegner je Schuss. | Kampagne sucht nur bei `fireCd <= 0`. Ansturm hält maximal vier Ziele stabil geordnet vor; gleiche Distanzen behalten die ursprüngliche Listenreihenfolge. |
| Kollisionen | Geschosse prüfen gegen alle Gegner; Piercing sortiert zusätzlich entlang der Flugstrecke. | Konservative swept AABB vor exakter Segmentdistanz. Durchschlag-, Bumerang-, Luftziel- und Trefferreihenfolge bleiben bestehen. Kein räumliches Raster eingeführt. |
| Projektile | Kampagne hat echte Geschosse mit Lebensdauer und Treffer-Sets. Ansturm richtet Schaden sofort an; seine Projektile sind Darstellungseffekte. | Zielvorhersage verwendet nur noch ein statt vier Ergebnisobjekten. Ansturm-Effekte werden in-place bereinigt; Lebensdauer, Fortschritt und Limit 120 bleiben unverändert. |
| Statuswirkungen | Brennen suchte für jeden betroffenen Ansturm-Gegner erneut per ID in derselben Liste. | Interne Schadenspfade erhalten die vorhandene Gegnerreferenz. Öffentliche `damageEnemy(state,id,amount)` bleibt kompatibel. Bei 200 brennenden Gegnern sinkt der gezählte Suchaufwand von 20.300 auf 200 Prädikatsaufrufe pro Schritt (verbleibende Sturmherr-Suche). |
| Schaden | Bossphasen, Rüstung, Schild, Krits, Ketten und Belohnungen sind reihenfolgeabhängig. | Formeln und Reihenfolge bleiben bestehen. Tesla findet das nächste Ziel linear, ohne vollständige Sortierung; Durchschlag nutzt stabile begrenzte Auswahl. |
| Wellen/Spawns | Kampagne: 40er-Aktivlimit und Spawn-Timer. Ansturm: geplante Welle, Nachspawn über festen Takt, Pause/Limit. | Kein Änderungsbedarf für diesen Patch; alle Werte, Timer, Limits, Pause und Reihenfolge unverändert. |
| Wiederholte Werte | `getStats` wurde pro Treffer/Schuss erneut erzeugt; Sortiervergleiche berechneten dieselben Abstände mehrfach. | Ansturm verwendet die ohnehin pro Schritt ermittelten Stats für seine Schüsse; Goldfaktor als identischer Skalarausdruck. Kein dauerhaftes Stats-Caching, damit Käufe und geladene Spielstände sofort wirksam bleiben. |
| Speicherzuweisungen | Viele `filter/map/sort/slice`-Zwischenlisten im Ansturm; Wegabstandslisten und wiederholte Vorhersageobjekte in Kampagne. | Per-Spiel-WeakMap mit wiederverwendeten Ziel-, Distanz-, Treffer- und Besuchslisten; Inhalte nach jedem Schuss geleert. Gegner/Effekte werden stabil in-place kompaktiert. Keine zusätzlichen Felder im Speicherstand. Heap-Bytes und GC-Pausen auf Android wurden nicht gemessen. |

## Bewertete weitere Ansätze

- **Räumliches Raster:** Nicht implementiert. Für Turmziele entfällt jetzt der Großteil der Abfragen während Cooldowns. Bei produktiv höchstens 40 Kampagnengegnern ist ein zusätzlicher Index samt Neuaufbau nach Bewegung und stabiler Trefferreihenfolge vorerst nicht begründet. Die AABB-Vorprüfung spart bereits die meisten genauen Projektildistanzen. Für sehr große Ansturm-Wellen bleibt ein Raster für Tesla/Explosion/Frost ein Folgeexperiment; dieser Patch beseitigt zunächst den belegten quadratischen Brennschaden. Ein Raster wurde hier nicht separat benchmarked; es wird kein gemessener Vergleich gegen ein Raster behauptet.
- **Objektpool für alle Projektile:** Nicht implementiert. Geschosse tragen unterschiedliche Felder und langlebige Treffer-Sets/Referenzen. Ein unvollständiger Reset könnte Schaden und Treffer verändern. Die risikoärmeren temporären Listen werden bereits wiederverwendet.
- **Weniger KI-Updates außerhalb der Kamera:** Nicht implementiert. Unsichtbare Gegner müssen weiter bewegen und rechtzeitig angreifen. Unterschiedliche Aktualisierungsintervalle könnten insbesondere Boss-/Helden-Aggro und Reichweitengrenzen ändern.
- **Simulation/Darstellung trennen:** `update`/`draw` bzw. `step`/`renderArena` sind bereits getrennte Einstiegspunkte. Kampagnen-Update erzeugt weiterhin FX/UI-Ereignisse; der Patch baut dies nicht grundsätzlich um. Im Benchmark wird nicht gerendert, bestehende FX/UI-Arbeit des Updates bleibt enthalten.
- **Feste Schritte und begrenztes Aufholen:** Ansturm nutzt bereits 30 Hz, einen auf 0,30 Sekunden begrenzten Akkumulator und maximal zehn Schleifendurchläufe pro Bild. Kampagne verwendet frameabhängiges `dt` (max. 0,034 s) und ein/zwei Updateaufrufe je Frame. Ein Wechsel auf Akkumulator würde bestehende Cooldown-/Hitstop-/Partikel-Semantik und Verhalten bei niedrigen FPS verändern. Deshalb hier keine Umstellung und keine neue Zeitverdünnung; dies benötigt eine separate gezielte Verhaltensspezifikation.

## Reproduktion und Tests

```sh
# Vollständigen Ursprungscommit bei flachem Checkout gegebenenfalls zuerst holen.
node --expose-gc tools/bench-simulation.cjs --compare=c5d6f21
node tests/simulation-work.test.cjs
node tests/simulation-equivalence.test.cjs
npm test --prefix ansturm-alpha1-5
for test in tests/*.cjs; do node "$test" || exit 1; done
for test in tests/*.test.py; do python3 "$test" || exit 1; done
TEST_MOBILE=1 node tests/game.test.cjs
```

Die Referenzdatei `tests/fixtures/simulation-c5d6f21.json` entstand aus dem unveränderten Ausgangscode. `--record --ref=c5d6f21` liest bei der Regeneration ausschließlich dessen Quelltext via `git show`. Normale Regressionstests brauchen die Git-Historie nicht. Die SHA-256-Summen umfassen jeden Schritt der ausgewählten Zustandsfelder (unter anderem Gegnerpositionen/HP/Status, Helden-/Monumentdaten, Geschosse, Turm-Cooldowns, Loot, Effekte, Wellenzähler). Zufall ist pro Harness deterministisch.

30 Referenzabläufe, insgesamt 14.160 Update-/Step-Aufrufe: 25/50/100/200 Gegner jeweils mit dauerhafter Last und echten Toden in beiden Modi; vier Ansturm-Bossvarianten; gemischte Kampagnengegner mit Flugeinheiten, Bossen und Unterstützung in allen sieben Leveln; gleiche Zielentfernungen/Reichweitengrenzen, Niederlage und Effektüberlauf im Ansturm. Exakte Gleichheit bezieht sich auf diese Szenarien, nicht auf sämtliche denkbaren Spielzustände. Die vorhandenen Boss-/Flug-/Bumerang-/Schadens-/Spawn-/Speicherstandstests ergänzen diese Prüfung.

Zusätzlich Operations-Regression ohne Zeitlimit: Brennen bleibt linear; nachladende Türme lesen keine Zielkoordinaten. Neue Tests laufen auch in der vorhandenen read-only PR-CI. Cache-Keys für geänderte Laufzeitdateien und Ansturm-Importketten sind aktualisiert; Quell- und dist-Ansturm bleiben bytegleich.

## Verifizierter Prüfstand

Lokal: **96/96 Prüfkommandos erfolgreich** – 76 top-level CJS-Suiten, das vollständige native Ansturm-Testkommando (76/76 Einzeltests einschließlich 3×-Tempo), sieben zusätzliche mobile Harness-Läufe und alle zwölf Python-Assetsuiten. Das ist eine Anzahl von Kommandos, nicht von Einzelassertionen. Einzelkommandos und Exitcodes: `test-commands.json`. Syntaxprüfung der geänderten Laufzeitdateien und `git diff --check` erfolgreich. Physische Android-Tests sind darin nicht enthalten. Der mobile Simulationstest verwendet dieselbe deterministische Desktop-Geometrie; die vorhandenen mobilen Gameplay-/Menütests decken gesondert Touch- und Portrait-Geometrie ab.

## Noch offen

Physischer Test auf Android mit 4 GB RAM (FPS, RAM, längere Kämpfe, Kampagne 1×/2× und Ansturm 1×/2×/3×), Browser-Profilsitzung mit GPU/GC und subjektive Spielabnahme. Kein neuer HTTPS-Testbuild wurde veröffentlicht. Die vorhandenen veröffentlichten Vorschauen enthalten diesen Patch noch nicht.
