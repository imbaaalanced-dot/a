# Ausrüstung V1 – Bossbeute und zwei Helden

Umsetzung der am 20.10.2026 freigegebenen Spezifikation. Neue Ausrüstung entsteht
nur bei echten Bossen. Wellen, normale Gegner und Kartenabschlüsse vergeben
keine zusätzlichen Items. Die Startausrüstung und vorher erworbene Gegenstände
bleiben erhalten. Level 2 hat derzeit keinen echten Boss und deshalb keine
Ausrüstungsbelohnung; Boss-Spawnregeln sind unverändert.

21 feste Typen nutzen die 14 vorhandenen Kräfte. Jeder Typ hat zwei feste
Wertearten, Bosskarten eigene bevorzugte Funde. Qualität variiert begrenzt;
Schmieden verbessert vorhandene Werte dreimal für 50/100/150 Schmiedessenz.

Marcel und Kim verwenden eine gemeinsame Sammlung mit eigenen acht Plätzen.
Dieselbe Instanz darf bei beiden Helden stehen; sie ist dadurch nicht doppelt
vorhanden. Bei einem der Helden angelegte Items und Favoriten bleiben vor
Recycling und Schmieden geschützt. Änderungen erfolgen nur im Hauptmenü.

## Speicherung

Der vorhandene Schlüssel bleibt; Profile werden auf Version 3 übernommen.
Eine einmalige pre-v3-Sicherung erhält den alten Stand für einen bewussten
Rückweg. Nach dem ersten v3-Schreiben können ältere Builds den neuen Stand
nicht verwalten. Ein alter Export enthält keinen später erworbenen Fortschritt.

Bossbeute wird direkt verbucht und gespeichert. Bei blockiertem Speicher bleibt
sie im Sitzungsstand und kann exportiert werden. Eine volle Sammlung hält den
Fund als Kandidaten; Recycling versucht dessen unveränderte Übernahme erneut.
Andere Tabs sperren veraltete Schreibzugriffe, statt fremden Fortschritt zu ersetzen.

## Prüfstand

Katalog, Migration, Heldenreferenzen, Schmieden, Recycling und Bossvergabe sind
mit Verhaltensprüfungen abgedeckt. Ein harter Grenztest verwendet 100.046 echte
Iteminstanzen. Die Browserprüfung führt Desktop-/Touchabläufe und eine simulierte
Quota-Ausnahme aus. Die Ergebnisse stehen unten; echte Android-/WebView-Prüfung
ist noch offen.

## Abnahme vom 20. Oktober 2026

Geprüfte Produktrevision: `92591758a770bd2a2005ed48eec34e8ad4db76c9`.
Gestapelt auf Style-2-Grafikrevision `5a4b368`; bestehender Grafiktest bleibt
getrennt. [Draft-PR #53](https://github.com/imbaaalanced-dot/a/pull/53).

Alle 59 Workflowbefehle lokal erfolgreich. Chromium 133 prüfte 1280×900 und
412×915: v2→v3 samt Sicherung, getrennte Heldenzuordnungen, geteilte Instanz,
Schutz des anderen Helden, gezieltes Schmieden, tatsächlicher Bosskill,
Speicherung/Reload sowie Quota-Warnung und Export. Alle sechs Karten starteten;
30 Style-2-WebPs decodierten. Keine beobachteten JS- oder HTTP-Fehler.
[Bericht](qa/equipment-hybrid-20261020/local-report.json),
[Testbefehle](qa/equipment-hybrid-20261020/suite-results.json) und
[unabhängiges Review samt Befundbehebung](qa/equipment-hybrid-20261020/review.md).

Die Prüfung verwendet niedrige Grafikqualität und reduzierte Bewegung sowie
DOM-Klicks nach Geometrie-/Hit-Test. Physisches Android/WebView, natives
Touch-Timing und FPS sind damit nicht abgenommen.

## Öffentlicher Teststand

[Equipment und Style 2 spielen](https://imbaaalanced-dot.github.io/a/v4-style2-towers/equipment/v4-alpha9/?td2UserTowers=1&qa=92591758).
Nur der freigegebene separate Unterpfad wurde veröffentlicht; main und der
vorhandene Grafiktest bleiben erhalten.

[Pages-Deployment erfolgreich](https://github.com/imbaaalanced-dot/a/actions/runs/39503711332),
[GitHub-CI erfolgreich](https://github.com/imbaaalanced-dot/a/actions/runs/39504048804).
Die vier Produktdateien stimmen per SHA-256 mit der Quelle überein. Derselbe
Browserablauf bestand auch öffentlich auf Desktop und Touch samt Quota/Export,
allen sechs Karten und 30 WebP-Decodes ohne beobachtete JS-/HTTP-Fehler.
[Öffentlicher Prüfbericht](qa/equipment-hybrid-20261020/report.json).
