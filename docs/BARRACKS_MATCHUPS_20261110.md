# Kaserne · Kontaktmatrix und Simulationsmessung · 10.11.2026

Aufbau: aktueller Spielecode im bestehenden Game-VM-Bootstrap, Zufall konstant 0.5; feste Kontaktpositionen. Kein gewonnener Durchlauf und kein Ersatz für reale Gameplay-Abnahme.

## Kontaktmatrix
`node tests/barracks-matchups.test.cjs`
- 14 echte Gegnertypen × 3 Kasernenstufen = 42 Kontaktfälle bestanden.
- Bodenziele erhalten Milizschaden, Flugziele nicht. Normale Bodengegner und Belagerer schlagen zurück; Fluggegner, Sappeure und Entwurzelter behalten ihre Ausnahmebehandlung.
- 7 Kapitel × lokale Bosswellen 10/20 × 3 Stufen = 42 Bosskontaktfälle bestanden, mit echten Boss-Spawns und den jeweiligen Kapitelwerten.
- 7 Kapitel × 20 Wellen = 140 kurze Koexistenzprüfungen bestanden. Nur Spawn und ein Simulationsschritt, keine 140 gewonnenen Wellen.

## Optimierung
Zielsuche und Miliz-Aggro vergleichen quadrierte Entfernungen; die tatsächliche Bewegung verwendet weiter die unveränderte Entfernung. Keine Balancewerte geändert. Regression: 500 gesetzte Zufallsszenarien plus Grenzfälle bei 90 Einheiten.

Ein separater Vorher/Nachher-Vergleich gegen den unveränderten lokalen Ausgangsstand ergab identische Ereignisse und Zustände über 1.800 Schritte, 40 bewegte Gegner und 5 Kasernen einschließlich Upgrade. Trace-SHA256: `5072f50743aa1d796cc2aa1b640fc4fdbdee78bb9670fe521d697f0efd9d4f44`.

## Messung
`node tests/barracks-stress.cjs`, gleicher Executor, jeweils 18.000 Schritte, 8 Kasernen, 400 stationäre Gegner; 300 simulierte Sekunden, 10 aktive Rekruten. Node-Simulation, keine Browser-FPS.

| Messwert | Vorher | Nachher |
|---|---:|---:|
| Median ms | 1.399 | 0.184 |
| P95 ms | 1.699 | 0.292 |
| P99 ms | 2.229 | 0.383 |
| Prozess-CPU Benutzerzeit ms | 26038.014 | 3704.323 |

Einzelnes Messpaar, kein plattformübergreifender Leistungsnachweis. Heapdifferenzen enthalten Messdaten und GC-Einflüsse, daher keine Aussage zur Leckfreiheit.

## Freigabe
CI/Chromium für diesen neuen Commit separat prüfen. Echte Android-Abnahme auf 4 GB, 15–30 Minuten, gesamte Balance, tatsächliche Bosskämpfe über mehrere Wellen und separate Ansturm-Integration bleiben offen. PR #168 bleibt Draft; kein Merge/Deployment.
