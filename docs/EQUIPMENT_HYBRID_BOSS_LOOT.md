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
Quota-Ausnahme aus. Der abschließende Ergebnisbericht und öffentliche Testlink
werden nach der tatsächlichen Abnahme ergänzt. Echte Android-/WebView-Prüfung
ist noch offen.
