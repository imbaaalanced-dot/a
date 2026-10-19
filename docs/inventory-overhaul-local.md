# Inventar-Überarbeitung · separater Testbuild

Basis: Alpha-8-Hotfix `47441f5`. Eigener Branch `feature/td2-inventory-overhaul`. Nach Testfreigabe des Nutzers wird der Stand separat unter `/a/v4-inventory/` veröffentlicht. Alpha 7 und `/a/v4-alpha8/` bleiben unverändert. Die neuen Ladebildschirm- und Hauptmenüillustrationen werden hier nicht integriert.

## Beute

- Normale Gegner: 2 % statt 12 % Itemchance (83,3 % weniger zufällige Ausrüstungsdrops). Kampfessenz unverändert.
- Reguläre Wellenbelohnung nach jeder dritten Welle statt nach jeder Welle, pro Lauf und Welle nur einmal.
- Bosse: weiterhin genau ein garantiert mindestens epischer Ausrüstungsfund neben ihrer Kampfessenz.
- Bestehende einmalige Geschichtenbelohnungen und Kirchende-Abschlussbelohnung bleiben erhalten.

## Vielfalt

40 Grundgegenstände, fünf pro Ausrüstungsplatz. Jeder hat zwei feste Werte-Schwerpunkte; seltene Qualitätsstufen ergänzen Zusatzwerte. Epische/legendäre Exemplare können bestehende, bereits im Kampf implementierte Spezialeffekte besitzen. Werteobergrenzen bleiben bestehen. Die beiden Ringkategorien sind weiterhin auf beiden Ringplätzen anlegbar.

| Level | Ortsbeute | Schwerpunkt |
| --- | --- | --- |
| Vier Tore | Amulett der vier Tore | Turmschaden + Lebenspunkte |
| Labyrinth | Labyrinthschritte | Lauftempo + Angriffstempo |
| Kirchende | Rindenmantel | Schadensreduktion + Lebensraub |
| Ender Dorfkirche | Löwensiegel | Turmschaden + Schadensreduktion |
| Hohensyburg | Syburger Wachthelm | Lebenspunkte + Turmschaden |
| Goethestraße | Chronistenhandschuhe | Angriffstempo + Lebenspunkte |

Beim Erzeugen eines Items wird in seinem Heimatlevel mit 25 % Wahrscheinlichkeit die jeweilige Ortsbeute gewählt, bei Bossbeute mit 50 %. Dies ist die Auswahl innerhalb eines tatsächlich entstandenen Fundes, keine zusätzliche Dropchance.

## Inventar

Seltenheit und Ausrüstungsplatz lassen sich kombinieren, auch im Überlauf. Der Vergleich zeigt angelegte Werte, Fund und Änderung in einer Tabelle; Prozentwerte werden in Prozentpunkten verglichen. Bei Ringen ist der Zielplatz wählbar. Gegenstände zeigen ihren Werte-Schwerpunkt und gegebenenfalls Fundort. Favoriten und angelegte Gegenstände bleiben vor Recycling geschützt. Massenrecycling umfasst weiterhin alle ungeschützten Funde, unabhängig vom Filter; die Bestätigung nennt dies ausdrücklich.

## Spielstände und Prüfung

Speicherschlüssel und Formatversion bleiben unverändert. Alte Gegenstände ohne Katalogkennung behalten Namen, Werte, Effekte und Favoritenstatus. Neue Gegenstände speichern zusätzlich eine optionale Katalogkennung. Import, Export, Neuschmieden und Wiederherstellung sind geprüft.

- `node --test tests/*.test.cjs`: 40 Tests / Testdateien erfolgreich, 0 Fehler (einschließlich der bestehenden Unterprüfungen).
- `TEST_MOBILE=1 node tests/game.test.cjs`: erfolgreich.
- `git diff --check`: erfolgreich.
- Unabhängige Codeprüfung: keine blockierenden Befunde.
- Vergleichstests decken positive/negative Änderungen, Prozentpunkte und Ring II ab.
- Neue Tests in beiden GitHub-Prüfworkflows aufgenommen, vor Veröffentlichung lokal ausgeführt; GitHub-Ausführung folgt beim Push.

Ein echter Sicht- und Touchtest auf Android steht vor einer späteren Veröffentlichung noch aus. Bestehende Itemgrafiken werden wiederverwendet; dieses Update ergänzt keine 40 individuellen Icons.
