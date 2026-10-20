# TD2 Portalreise Pilot – Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Native Ausführung empfohlen; Delegation erst nach Wahl durch den Nutzer.

**Goal:** Drei spielbare Portalabschnitte und eine längere Kampagnen-Testkarte mit fairer Wirtschaft, zwölf Perks und sicherer Bossbeute bereitstellen.

**Architecture:** Kleine browserfähige Module für Zustand, Wirtschaft und Perks; explizite Einbindung in den vorhandenen Spielzyklus. Bestehende Kampagnenfreischaltungen bleiben getrennt von Abschnittsnummern. Bossvergaben werden im Inventarspeicher selbst idempotent abgelegt, damit zwei getrennte Speicherschlüssel keine vermeintlich atomare Transaktion bilden.

**Tech Stack:** Bestehendes Browser-JavaScript, Canvas 2D, Node-22-Tests mit assert/vm, bestehende Python-Assettests. Keine neue Laufzeitabhängigkeit.

**Spec:** [TD2-Gameplay-Portalreise-Entwurf.md](../specs/2026-10-20-portalreise.md), vom Nutzer am 20.10.2026 freigegeben.

## Belegter Ausgangspunkt
Read-only geprüft: imbaaalanced-dot/a, PR 51, Head 3503717a1c60bb98b17623d05c97c2205a2a4403, Branch assets/style2-user-towers-1to5-20261020. PR ist offen und Draft; kein Merge oder Publishing Teil dieser Planung. main ist nicht mit diesem Grafikstand gleichzusetzen. Vor Arbeitsbeginn Head erneut prüfen und bei Änderungen den Plan abgleichen.

dist/game.js: startGame(337), lootFor(380), rewardWave(385), completeLevel(387), hurtEnemy(509), buildTower(520), upgradeTower(533), sellTower(534), endWave(536), getPerks(537), selectPerk(545), update(559), updateUI(644). Zeilen beziehen sich auf den geprüften Head. Bogenturm kostet 25, Kanone 35; Turminvestition steht bereits in spent. Verkauf erstattet aktuell 60 Prozent. endWave erkennt feste Kampagnengrenzen 5/8/12/16/20/24. Normale Gegner haben derzeit 12 Prozent Itemchance; rewardWave erzeugt zusätzlich immer ein Item. dist/loot.js verwaltet versionierte Profile sowie Mehrtab-Konflikte; add meldet Erfolg auch dann, wenn anschließendes save fehlschlägt. Neue Bossvergaben dürfen dieses Verhalten nicht als Speicherbestätigung verwenden. dist/index.html enthält bereits perkScreen, perkGrid, nextWaveBtn. Tests verwenden direkt node tests/*.test.cjs; package.json auf main nicht vorhanden.

## Global Constraints
- Held und Türme gleich wichtig; Ausrüstung nur bei Bossen. Bestehende Gegenstände bleiben erhalten.
- Pilot: drei Abschnitte, zwei Wellen pro Abschnitt, Boss in Abschnitt drei; nach Abschlussboss kein Perk.
- Vollausbau: zehn Abschnitte, Bosse fünf/zehn, 20–30 Minuten; gesonderte Ausbauphase nach Pilotabnahme.
- Kampagne Level 1: acht Wellen, Ziel 8–10 Minuten; weitere Karten später zwölf Wellen und 12–18 Minuten. Dauer wird gemessen, nicht erzwungen.
- Startbudget drei Basis-Bogentürme = 75 Essenz am geprüften Stand. Reguläre Prämie 25 Prozent = 18,75; intern exakte Viertelwerte speichern, HUD maximal zwei Dezimalstellen. Zwischenboss 50 Prozent = 37,5.
- Portal-Schutzpunkt 100 Integrität, erneuert pro Karte. Heilung nach regulärem Abschluss 10 Prozent der maximalen Heldenleben, gedeckelt.
- Verkauf sicher 100 Prozent, im Kampf 75 Prozent; Übergang erstattet nur verbleibendes tatsächliches Investment.
- Zwölf Perks und alle Zahlen gemäß Spec; maximal drei Stufen. Perkschaden löst keine weiteren Trefferperks aus.
- Höchstens 40 lebende Gegner gleichzeitig, wartende Pflichtgegner zählen weiter zur Welle.
- Getrennte Portalstände, bestehende Save-Keys erhalten; kein Inventarreset bei inkompatiblem Portalstand.
- Desktop und Android-Touch; Ziel überwiegend mindestens 30 FPS auf echtem Testgerät.

## Review Focus
1. Zweimaliger Portalzutritt oder Doppeltippen darf nur einen Übergang erzeugen (Task 4).
2. Speicher voll, blockiert oder von anderem Tab verändert: keine falsche Erfolgsmeldung und keine doppelte Bossbeute (Task 3).
3. Maximalperks, Neuladen und identischer Zufallszustand: weiterhin drei verschiedene zulässige Angebote (Task 2).
4. Fliegende oder beschworene Pflichtgegner und Spawnlimit: Abschnitt darf nicht zu früh enden (Task 4).
5. Globale Wellennummern, Vorschau und alte Freischaltungen: keine Freischaltung allein durch Portalspiel (Task 5).

## Dateien und Zuständigkeiten
Neu: dist/portal-run.js (reiner Zustandsautomat, Wirtschaft und Checkpoints), dist/portal-perks.js (Angebote und abgeleitete Werte), dist/portal-ui.css (Portal- und Perkdarstellung), dist/campaign-balance.js (optionales Pilot-Wellenprofil). Neue Node-Tests heißen portal-run.test.cjs, portal-perks.test.cjs, portal-storage.test.cjs, portal-gameplay.test.cjs, campaign-balance.test.cjs. Modifizieren: dist/game.js, dist/loot.js, dist/index.html, .github/workflows/test.yml. dist/levels.js nur um ein explizites Pilot-Kartenlayout ergänzen; originale historische Geometrie bleibt erhalten. Das Portal wird aus Canvas-Geometrie gezeichnet, ohne neue Bildassets.

## Task 1: Zustände und Wirtschaft
**Interfaces:** PortalRun.create({runId,seed,heroId,startBudget,maxSections}) -> Run; reduce(run,event) -> {run,effects}; refund(towers) -> number. Run enthält version:1, revision, section, waveInSection, phase, heroHp, gold, perkRanks, rngState, checkpoint, rewardIds. Phase ist build/combat/perk/exit/loading/finished/failed. Ungültige Ereignisse ändern nichts. towers für refund: Array<{spent:number}>.
- [ ] tests/portal-run.test.cjs schreiben: 75 Startessenz; zwei Türme mit spent 25 und 60 plus 10 Rest ergeben beim regulären Übergang 113,75; bereits verkaufte Türme fehlen; doppeltes Abschlussereignis zahlt nichts nach.
- [ ] node tests/portal-run.test.cjs ausführen: zunächst fehlendes Modul, danach Implementierung und PASS.
- [ ] portal-run.js als Browserglobal PortalRun mit CommonJS-Testexport implementieren; endliche nichtnegative Zahlen und Ganzzahl-Abschnitte validieren; runId/section/revision für Ereignisse prüfen.
- [ ] Tests einschließlich negativer/NaN-Investitionen und wiederholter Ereignisse grün ausführen; gezielter Commit.

## Task 2: Perks
**Interfaces:** PortalPerks.offer(ranks,rngState,context) -> {ids,rngState}; choose(ranks,id) -> ranks; derive(base,ranks) -> stats. context enthält heroId und vorhandene turretKinds. offer ist deterministisch; ranks enthält nur katalogisierte IDs 0..3. Alle zwölf Einträge und Stufenwerte wortgetreu aus Spec übernehmen.
- [ ] tests/portal-perks.test.cjs: gleiche Eingabe erzeugt gleiche drei verschiedene IDs; Stufe drei ausgeschlossen; Kraft 3 ergibt Grundschaden *1,24; Tempo 3 ergibt *1,15; Engpass nutzt 8/12/16 Prozent statt Summierung; unzulässige Wahl abweisen.
- [ ] node tests/portal-perks.test.cjs zunächst rot ausführen.
- [ ] Modul und vier gemeinsame Trefferregeln integrierbar definieren; effectOrigin=base/perk verhindert Rekursion. Gemeinsame Effekte nicht je Turm stapeln.
- [ ] Testgrün prüfen, inklusive Pool bei neun erhaltenen Perks und mehrfacher Wiederaufnahme; Commit.

## Task 3: Speichern und Bossbelohnungen
**Interfaces:** PortalRun.createStore(storage) -> {load(),save(run,expectedRevision)}; load liefert ok/missing/incompatible/corrupt. Neuer Schlüssel denkmal-portal-run-v1. lootModel.grantBossRewardOnce(rewardId,wave,region) -> {status:granted|alreadyGranted|error,itemId?}. rewardId = runId:section:boss; Inventarprofil speichert Vergabekennung und Item in derselben JSON-Operation.
- [ ] tests/portal-storage.test.cjs: wiederholte Vergabe erzeugt exakt ein Item; Ausnahme in setItem meldet error und lässt persistierten sowie In-Memory-Stand unverändert; anderer Tab verhindert Überschreiben; alte Profile migrieren ohne Itemverlust.
- [ ] node tests/portal-storage.test.cjs und node tests/loot.test.cjs als Ausgangspunkt ausführen; neue Fälle müssen zuerst scheitern.
- [ ] Loot-Profilversion auf drei erweitern: v1/v2 weiter lesen und bestehende Migration beibehalten; claimedBossRewards als validiertes Objekt ergänzen. Kein bestehendes Profil allein durch unbekannte Version überschreiben. Boss-ID vor Vergabe deterministisch festlegen. Keine zwei getrennten setItem-Aufrufe als atomar behandeln.
- [ ] Beim Absturz nach Inventarschreiben vor Run-Schreiben liefert Wiederholung alreadyGranted und kann den Run fortsetzen. Checkpoint vor Kampf und nach Auswahl; Angebot bereits vor Anzeige speichern. Quota-, Reload-, Backup- und Konflikttests grün prüfen; Commit.

## Task 4: Spielbarer Portal-Pilot
**Interfaces:** startPortalRun({resume:boolean}) -> Promise<boolean>; enterPortalSection(run) -> Promise<boolean>. Nur Portalpfad umgeht Kampagnen-Freischaltprüfungen; er schreibt keine Kampagnenflags. Bestehende startGame-Signatur erhalten. game.mode='portal', lokaler Wellenzähler separat von historischem game.wave.
- [ ] tests/portal-gameplay.test.cjs mit bestehendem vm-Testmuster schreiben: zwei Wellen -> Auswahl -> exit; zehn Zutritte -> genau ein Abschnittswechsel; letzte Bosswelle -> Ergebnis ohne Perk; Leben 45/100 -> 55/100 nach regulärem Abschluss.
- [ ] node tests/portal-gameplay.test.cjs zunächst rot ausführen.
- [ ] Module vor game.js laden. Menüeintrag Portalreise mit Neu/Fortsetzen hinzufügen. Zustandsautomat an endWave/selectPerk/update/gameOver anbinden. Drei Layoutvarianten auf Level-1-Geometrie nutzen, je erreichbarer südlicher Start und nördlicher Ausgang; neue Baupositionen nur auf gültigen Flächen. Türme und Geschosse bei bestätigtem Wechsel entfernen, Held/Perks erhalten, Schutzpunkt erneuern.
- [ ] Ausgang erst nach Auswahl scharf schalten; erneuten Eintritt verlangen. Bewegung in exit erlauben, Kampf und Bau sperren. Loading-Ereignis nur einmal; bei Ladefehler in exit zurück. Keine ausstehende Ladeantwort darf nach Verlassen des Modus eine Karte starten.
- [ ] Gegnerbounty, Essenz-Pickups und rewardWave-Items im Portalpfad sperren. Ausrüstung auch im übrigen Gameplay nur durch Bossereignis; normale Zufallsdrops und Wellenitems entfernen, Freischaltungsfunktionen auf versteckte Itemvergaben prüfen. Alte Items behalten.
- [ ] Spawnwarteschlange bei 40 lebenden Gegnern anhalten; Endbedingung verlangt leere Warteschlange und keine lebenden Pflichtgegner. Tests für Fluggegner, Bosseskorte und alte Kampagnenflags ergänzen; Desktop und TEST_MOBILE=1 node tests/portal-gameplay.test.cjs müssen PASS liefern; Commit.

## Task 5: Längere Kampagnen-Testkarte
**Interfaces:** CampaignBalance.profile(level,{pilot}) -> {localWaves,phases,slots}; erstes Profil nur Level 1. Andere Level und Endlos verwenden vorerst ihre bisherigen Profile. Pilotwahl explizit über ?td2CampaignPilot=1, kein Überschreiben regulärer Freischaltungen.
- [ ] tests/campaign-balance.test.cjs: acht lokale Wellen, drei Phasen (1–2/3–5/6–8), Boss acht; Auswahl aus zwei brauchbaren Eröffnungen; Endlos unverändert; Pilotabschluss schreibt keine Kampagnenflags.
- [ ] node tests/campaign-balance.test.cjs zunächst rot ausführen.
- [ ] Acht geprüfte Bauplätze mit Außen-/Kreuzungs-/Rückfallrollen im Level-1-Pilot definieren; maxTowers zunächst sechs. Vorab Reichweite 300 des Bogens gegen Weltkoordinaten prüfen. Überspringbare Baupausen und Vorschau erhalten. Alle Hinweise im Pilot aus Profil ableiten statt fester Wellenangaben.
- [ ] Automatische Fälle grün prüfen. Zwei reale Eröffnungen spielen, Dauer messen, anschließend Gegnerbudget nach Befund abstimmen. Keine behauptete Balanceabnahme aus vm-Tests ableiten; Commit.

## Task 6: Verifikation und separater Teststand
- [ ] Neue Node-Prüfungen in .github/workflows/test.yml aufnehmen. Bestehende dort gelistete Node- und Python-Prüfungen ausführen; bewusst geänderte Item-Erwartungen gezielt aktualisieren, Save-/Freischaltungsregressionen behalten.
- [ ] Browser-Smoke-Test: Marcel und Kim, neuer und geladener Portalrun, Kampagnenpilot, unveränderter Endlosstart, keine JS-/Assetfehler. 412x915 Touch-Emulation und Desktop prüfen. Neue Perks mit Touch und Tasten 1–3 bedienbar.
- [ ] Auf echtem Android-Gerät Framerate mit 40 Gegnern, Portalzugang, Hintergrundwechsel und Reload prüfen; Gerät, Dauer und FPS protokollieren. Emulation nicht als Androidmessung ausgeben.
- [ ] Eigenen Featurebranch und Draft-PR mit Spec/Plan und Testbefunden bereitstellen; Grafik-PR 51 unverändert lassen. Separaten Testlink nur über geprüften vorhandenen Previewworkflow veröffentlichen, sobald Pilot zur Veröffentlichung freigegeben ist. Kein Merge nach main.

## Ausbau nach Pilotabnahme
Diese Planung setzt bewusst den freigegebenen ersten Testumfang um. Danach eigener Plan für zehn Portalabschnitte, Bosse fünf/zehn und restliche fünf Kampagnenkarten. Begrenzte Labyrinthbarrikaden ebenfalls eigener Schritt nach Pfadprüfung. Zielspieldauer, vollständige Kartenbalance und echte Android-Leistung bleiben bis zu Spieltests unbelegt.

## Selbstprüfung und Übergabe
Spec-Pilot, alle zwölf Perks, Wirtschaft, Bossbeute und Speicherfehler sind Aufgaben zugeordnet. Folgeumfang explizit abgegrenzt. Werte und Schnittstellen auf Konsistenz geprüft. Dieser Plan ändert keine Produktdateien; kein Test wurde als ausgeführt behauptet. Empfohlene Ausführung: nativ in dieser Sitzung, damit Zustand, Inventar und Spielzyklus zusammenhängend bearbeitet werden. Planprüfung durch Nutzer vor Implementierung gemäß Planungsskill.
