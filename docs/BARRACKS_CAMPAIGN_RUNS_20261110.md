# Kasernen: kontrollierte Kampagnendurchläufe · 10.11.2026

## Methode und Grenzen
`node tests/barracks-campaign-runs.test.cjs`

21 reproduzierbare Durchläufe: 7 Kapitel × 3 feste Turmgruppen. Konstanter Zufall 0.5, stationärer Held, 600 Essenz als Testbudget, die ersten vier legalen Bauplätze und vier Türme auf Stufe 3. Danach echte Spawnverwaltung, Gegnerbewegung, Heldenschaden, Rekrutierung, Turmschaden, Belohnungen, Story-/Perkwechsel und reguläres Kapitelende oder Niederlage. Kein erzwungenes Überleben, kein künstliches Töten und keine übersprungenen Wellen. Der erste angebotene Perk wird gewählt.

Das ist ein kontrollierter Verteidigungsvergleich, kein normal erspielter Start und keine optimale menschliche Steuerung. Die Gruppen haben unterschiedliche Baukosten; verbleibende Essenz wird nicht nachträglich investiert. Ergebnisse erlauben keine isolierte Aussage über einen einzelnen Balancewert.

| Gruppe | Türme |
|---|---|
| Fernkampf | Bogen, Kanone, Magie, Rift |
| Eine Kaserne | Bogen, Kaserne, Magie, Rift |
| Zwei Kasernen | Bogen, Kaserne, Kaserne, Rift |

## Tatsächliche Ergebnisse

| Kapitel | Gruppe | Ergebnis | Letzte lokale Welle | Simulierte Sekunden | Kills | Bosswellen erreicht |
|---|---|---|---:|---:|---:|---|
| 1 | ranged-control | gameover | 8 | 191.95 | 105 | keine |
| 1 | one-barracks | gameover | 8 | 191.95 | 105 | keine |
| 1 | two-barracks | gameover | 7 | 167.68 | 87 | keine |
| 2 | ranged-control | levelcomplete | 20 | 829.68 | 447 | 10,20 |
| 2 | one-barracks | gameover | 20 | 1186.28 | 443 | 10,20 |
| 2 | two-barracks | gameover | 20 | 1315.38 | 444 | 10,20 |
| 3 | ranged-control | gameover | 6 | 168.6 | 80 | keine |
| 3 | one-barracks | gameover | 6 | 178.77 | 80 | keine |
| 3 | two-barracks | gameover | 6 | 182.18 | 80 | keine |
| 4 | ranged-control | gameover | 5 | 164.85 | 65 | keine |
| 4 | one-barracks | gameover | 5 | 164.85 | 65 | keine |
| 4 | two-barracks | gameover | 5 | 164.85 | 65 | keine |
| 5 | ranged-control | gameover | 4 | 132.48 | 51 | keine |
| 5 | one-barracks | gameover | 4 | 132.48 | 50 | keine |
| 5 | two-barracks | gameover | 4 | 132.48 | 50 | keine |
| 6 | ranged-control | gameover | 6 | 254.33 | 102 | keine |
| 6 | one-barracks | gameover | 6 | 254.33 | 102 | keine |
| 6 | two-barracks | gameover | 5 | 209.2 | 78 | keine |
| 7 | ranged-control | gameover | 1 | 27.42 | 8 | keine |
| 7 | one-barracks | gameover | 1 | 27.42 | 8 | keine |
| 7 | two-barracks | gameover | 1 | 27.42 | 8 | keine |

In Kapitel 2 beendet die Fernkampfgruppe Welle 20. Beide Kasernengruppen verlieren dort in Welle 20 durch den Tod des Helden, während das Monument noch 500 LP hat. Alle drei Gruppen haben die Bosswellen 10 und 20 tatsächlich erreicht. Andere Kapitel enden auch ohne Kaserne früh: stationärer Held und feste Positionierung begrenzen die Aussagekraft.

Alle Läufe enden innerhalb des 30-Minuten-Simulationslimits regulär, ohne NaN/Infinity und ohne Überschreitung des aktiven Milizlimits. Keine unbelegte Werteanpassung. Messergebnisse in `BARRACKS_CAMPAIGN_RUNS_20261110.json` enthalten Kosten, LP und Maximalzahlen.

## Freigabestatus
Keine vollständige Balance-Abnahme. Als Nächstes Positions- und Ressourcenstrategie variieren sowie tatsächliches Spielen auf Android 4 GB. Chromium bestätigt Bedienung, nicht die optimale Balance dieser stationären Testgruppen. PR #168 bleibt Draft; kein Merge/Deployment.
