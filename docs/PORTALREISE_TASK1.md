# Portalreise Task 1 – Umsetzung und Prüfung
Stand: 20.10.2026
Plan: TD2-Portalreise-Implementierungsplan.md, Task 1.
Featurebranch: feature/td2-portalreise-task1-20261020
Basis: 682451cc1b9f9e513881347566951be217e9ce3e (PR 51 ausschließlich gelesen).

## Umfang
Eigenständiges Browserglobal/CommonJS-Modul PortalRun mit create/reduce/refund.
75 Startessenz werden vom Aufrufer als startBudget übergeben (aktuelle Bogenkosten 25).
Zwei Wellen, Perkbestätigung, Ausgang, Ladephase, Abschluss und Fehlschlag.
Alle Ereignisse prüfen runId/section/revision. Ungültige Ereignisse liefern denselben Zustand ohne Effekte.
Turmrückzahlung verwendet ausschließlich übergebene verbleibende paid-spent-Werte.
10 Rest + 25 + 60 Investment + 18,75 Prämie ergeben 113,75.
Keine Änderung bestehender Produktdateien, Spielstände, PR 51 oder main.
Noch keine Einbindung ins Spiel; Perks, persistente Checkpoints, Bossbeute, Verkauf im Live-Spiel und Lebenssynchronisierung folgen in Tasks 2–4.

## Schnittstellenentscheidungen
- Erfolgreiches SECTION_LOADED verbucht die zuvor bei ENTER_PORTAL erfasste Wirtschaft. SECTION_LOAD_FAILED zahlt nichts und erlaubt erneuten Versuch. Damit erfolgen Rückzahlung und Prämie ausschließlich beim bestätigten Wechsel.
- Ereignisse: START_WAVE, WAVE_CLEARED, PERK_SELECTED, ENTER_PORTAL, SECTION_LOADED, SECTION_LOAD_FAILED, FAIL. PERK_SELECTED bestätigt nur die Auswahl; deren Katalogprüfung ist Task 2.
- checkpoint enthält hier nur die vorläufige Übergangsabrechnung; sichere persistente Abschnittsstände müssen in Task 3 gesondert ergänzt werden.
- Der aktuelle Head ergänzt gegenüber dem Planstand Grafik-Adapter-Ladebegrenzung, Regressionstest und Abnahmedokument; keine Änderung der Task-1-Kostenbasis.
- Git-Transport war nicht nutzbar. Quellen über GitHub-Verbindung anhand des festen Commit-Hashes geladen; Git-Objekte werden mit unverändertem Basistree und nur den drei neuen Dateien erstellt.

## Belege
RED: node tests/portal-run.test.cjs -> MODULE_NOT_FOUND, vor Anlegen des Moduls.
GREEN: 11/11 Portal-Tests; TEST_MOBILE=1 ebenfalls 11/11 (reines Modul, kein Touch-Nachweis).
node --check dist/portal-run.js -> erfolgreich.
node tests/loot.test.cjs -> 19/19 Inventarprüfungen.
Alle 38 lokal verfügbaren *.test.cjs ausgeführt: 34 erfolgreich, vier wegen fehlender Binärassets in der Quellenkopie gescheitert:
- tests/game.test.cjs: fs.existsSync für gezeichnetes Bild schlägt fehl (auch vor Implementierung).
- tests/level5.test.cjs: dist/assets/hohensyburg/kaiser-wilhelm-v1.webp fehlt.
- tests/style2-church-sprite.test.cjs: dist/assets/church-ende-alpha8.webp fehlt.
- tests/v4-alpha5.test.cjs: Bumerang-Atlas fehlt.
Keine vollständige Suite als grün bezeichnet. Python-Assettests und echte Android-/Browser-Spieltests nicht ausgeführt.
Unabhängiges Review: keine wichtigen/kritischen Befunde, keine zurückgestellten Kleinigkeiten. Persistenz und Live-Synchronisierung ausdrücklich noch nicht geprüft.

