# Portalreise Task 3 – Speicher und Bossvergaben

Stand: 20.10.2026. Branch feature/td2-portalreise-state-economy-20261020.
Basis 6a5eb29683b03c4c21c8172a3c80a561af8d25c3. Umfang Task 3 des bestätigten Plans.

## Umsetzung
- PortalRun.createStore(storage) bietet load/save. Schlüssel denkmal-portal-run-v1, separate Sicherung mit -backup. Inventar- und Kampagnenschlüssel werden dabei nicht angefasst.
- load meldet ok/missing/incompatible/corrupt/error; save meldet saved/conflict/invalid/error. Unbekannte Versionen werden nicht automatisch ersetzt. Beschädigte Daten können aus einer gültigen Sicherung gelesen werden.
- save prüft erwartete Revision und den zuletzt gelesenen vollständigen Rohstand; fremde Änderungen werden vor dem Schreiben erneut geprüft. Das ist optimistische Konflikterkennung, keine atomare Compare-and-Swap-Operation und keine Tab-Sperre. Exakt gleichzeitige Zugriffe verschiedener Browserprozesse sind damit nicht vollständig ausgeschlossen; ein späterer asynchroner Web-Lock-Adapter bleibt erforderlich, falls diese stärkere Garantie verlangt wird.
- withCheckpoint(run) erzeugt eine tiefe Kopie einer sicheren build-/exit-Phase. Kampfstände werden nur mit gültigem sicheren Checkpoint gespeichert und beim Laden auf diesen zurückgesetzt. Die jüngste gespeicherte Revision bleibt für die nächste Konfliktprüfung erhalten.
- pendingTransition ist von checkpoint getrennt. Ein Ladeabbruch stellt Restessenz und vollständige Turmdaten des begonnenen Übergangs wieder her, ohne Prämie oder Rückzahlung vorwegzunehmen.
- offerIds und rngState werden geprüft und erhalten. Der Spieladapter muss das Angebot vor der Anzeige speichern und withCheckpoint vor dem Kampf/nach Auswahl aufrufen. Diese Live-Einbindung ist Task 4.
- Inventarprofil und Exportformat auf Version 3 erweitert; v1/v2 werden ohne Gegenstandsverlust migriert. Der Schlüssel denkmal-loot-v1 bleibt erhalten. claimedBossRewards speichert Kennung -> Gegenstands-ID und wird validiert.
- grantBossRewardOnce(rewardId,wave,region) erstellt einen privaten Kandidaten und schreibt Gegenstand und Vergabekennung gemeinsam in EINEM primären JSON-Schreibvorgang. Nur nach erfolgreichem setItem wird der Arbeitsspeicherstand ersetzt. Fehler liefern error, Wiederholungen alreadyGranted, Erstvergaben granted mit itemId.
- rewardId muss eine stabile Kennung in der Form runId:section:boss sein. Ein Absturz nach dem Inventarschreiben, aber vor dem Portalstand-Schreiben führt nach Neuladen zu alreadyGranted statt zu einem zweiten Gegenstand.
- Die bisherigen session-toleranten Inventarfunktionen bleiben kompatibel; die neue Bossfunktion verwendet add/save ausdrücklich nicht als Erfolgsbeleg. Eine manuell importierte alte Gesamtsicherung kann wie bisher den gesamten Inventarstand zurücksetzen; sie ist kein manipulationssicheres Vergabejournal.

## Tests
RED: Die ersten zwölf neuen Fälle scheiterten vor Implementierung an fehlenden APIs bzw. der alten Profilversion.
Zusätzlicher RED/GREEN-Fall: Nach Reload während loading stand zunächst 75 statt der erfassten 10 Restessenz im Exit-Zustand. Der Test wurde vor der Korrektur rot ausgeführt; Wiederherstellung aus pendingTransition behält nun 10 Essenz und den Turm mit 25 Investment. Bestätigter erneuter Wechsel ergibt 53,75.
13/13 Speicherprüfungen, 11/11 Zustandsprüfungen, 13/13 Perkprüfungen und 19/19 bestehende Inventarprüfungen bestanden.
TEST_MOBILE=1 node tests/portal-storage.test.cjs: 13/13; keine echte Androidmessung.
Syntaxprüfungen für portal-run.js und loot.js bestanden.
Alle 40 lokal verfügbaren *.test.cjs ausgeführt: 36 bestanden. Unverändert vier Fehler wegen fehlender Binärassets in der Quellenkopie: game.test.cjs (existsSync für Turmbild), level5.test.cjs (Kaiser-Wilhelm-WebP), style2-church-sprite.test.cjs (Kirchen-WebP), v4-alpha5.test.cjs (Bumerang-Atlas). Kein vollständiges grünes Projektergebnis behauptet.
Unabhängiges Review: keine wichtigen/kritischen Befunde, keine zurückgestellten Kleinigkeiten; Grenze der optimistischen Tab-Prüfung bestätigt.

## Noch nicht enthalten
Keine Live-Bossanbindung, kein Menü, kein begehbares Portal und kein Publish; diese Schritte folgen ab Task 4. PR 51 und main werden nicht beschrieben. Python-Bildtests und echte Browser-/Android-Spieltests wurden hier nicht ausgeführt.
