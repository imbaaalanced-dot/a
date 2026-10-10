# V4 Kriegerdenkmal Kirchende Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Ein spielbares Level 3 mit wiedererkennbarem Kirchender Kriegerdenkmal, vier Zuläufen, neuen Gegnern, Türmen, Items und Grafiken.
**Architecture:** Bestehende Canvas-Engine erweitern. Leveldaten und Kampagnenregeln bleiben in levels.js; neue Kampfregeln werden als kleine reine Funktionen in kirchende-combat.js getestet und aus game.js aufgerufen. Loot-Migration bleibt in loot.js.
**Tech Stack:** Vanilla JavaScript, Canvas 2D, Node-Testskripte, Python/Pillow für Assets.
**Spec:** docs/superpowers/specs/2026-10-10-v4-kirchende-design.md
**Basis:** 273bf3a20ee8ad5ccf22bae1c967e6dc637e8c05; vor Ausführung Branch samt neueren Änderungen erneut prüfen.

## Global Constraints
- Der Name lautet „Kriegerdenkmal Kirchende“.
- Vier Gegner-Zuläufe werden auf drei angenommene Parkzugänge zusammengeführt.
- Drei Parkzugänge sind eine Entwurfsannahme, keine vermessene Tatsache.
- Keine erfundenen lesbaren Inschriften.
- Startbudget-Vorschlag: 180 Essenz, maximal acht Türme, zwölf feste Bauplätze.
- Erster spielbarer Stand: v4.0.0-alpha.1.
- Existierende Speicher dürfen nicht zurückgesetzt werden.
- Level 1/2 und bisheriger Endlosmodus behalten ihre Regeln.
- Neue Assets werden verzögert geladen; Ladefehler behalten lesbare Ersatzdarstellungen.
- Keine Behauptung eines Releases ohne tatsächlich ausgeführte Tests und veröffentlichten Build.

## Review Focus
- Große dt-Werte und fehlende Pfadzuordnung: kein Überspringen des Ziels und kein NaN.
- Doppelte Wellenabschluss-Aufrufe: Hainkern genau einmal.
- Import alter/neuer/beschädigter Saves: Migration oder vorhandene geschützte Wiederherstellung.
- Pause während Bossladung: keine Fortschritte oder Schadensauslösung im pausierten Zustand.
- Fehlende Assets und verdeckende Kronen: Level bleibt spielbar und Gegner sichtbar.

## Dateistruktur
Modify: dist/levels.js, dist/game.js, dist/loot.js, dist/loot-ui.js, dist/index.html, dist/visuals.js, dist/preloader.js, vorhandene CSS-/Combat-FX-Dateien und beide .github/workflows-Dateien nach ihren tatsächlichen Namen.
Create: dist/kirchende-combat.js, dist/kirchende-art.js, dist/assets/kirchende/, tests/kirchende-level.test.cjs, tests/kirchende-combat.test.cjs, tests/kirchende-loot.test.cjs, tests/kirchende-integration.test.cjs, tests/kirchende-assets.test.py, BALANCE_v4.0.0-alpha.1.md, RELEASE_v4.0.0-alpha.1.md.
Renderer ersetzt die vorhandene Art-Registry nicht; KirchendeArt wird nur für Level 3 verwendet.

### Task 1: Levelgeometrie und Pfadbewegung
**Files:** dist/levels.js; tests/kirchende-level.test.cjs.
**Interfaces:** DenkmalLevels.levels[3] mit name, gates[4], paths[4], slots[12], firstWave:9, lastWave:12, startEssence:180, maxTowers:8, scenery; advance(enemy,dt,path?) behält maze als Legacy-Default. getWaveGates(level,wave) liefert Gate-Indizes; L3 bei 9:[0,1], 10:[0,1,2], ab 11:[0,1,2,3].
- [ ] Draufsicht aus Nutzerreferenzen in einer beschrifteten lokalen SVG planen, unsichere Einmündungen gestrichelt markieren. Nicht als vermessenen Plan ausgeben.
- [ ] Failing tests: assert.equal(levels[3].gates.length,4); assert.equal(levels[3].slots.length,12); assert.equal(levels[3].firstWave,9). Alle Pfade enden an center. Jeder Bauplatz hat Abstand >=64 zu jedem Weg, >=110 zu center und >=75 zu Gates.
- [ ] Failing tests für alle vier Pfade: großes dt erreicht exakt den letzten Punkt; dt=0 bewegt nicht; leerer expliziter Pfad bewegt nicht und erzeugt keine ungültigen Zahlen. Legacy-Aufruf folgt weiterhin maze.
- [ ] Run node tests/kirchende-level.test.cjs; erwartetes FAIL wegen fehlendem Level 3.
- [ ] Leveldaten nach Referenzdraufsicht ergänzen und advance(enemy,dt,path=maze) verallgemeinern. Budgets und Bauplätze explizit in Leveldaten speichern.
- [ ] Run node tests/kirchende-level.test.cjs und node tests/game.test.cjs; beide PASS.
- [ ] Commit: feat: define Kirchende level and lane movement.

### Task 2: Speicher und neue Items
**Files:** dist/loot.js, dist/loot-ui.js; tests/kirchende-loot.test.cjs.
**Interfaces:** profile.level3:boolean, profile.kirchendeCompleted:boolean; unlockLevel3():boolean; claimKirchendeReward():Item|null. Zweiter Aufruf liefert null. Generate-/Pickup-Schnittstellen bleiben kompatibel. Neue IDs: bark, roots, splinter, wardlight, grove.
- [ ] Tests: Version-1-Profil mit bisheriger Beute migriert nach Version 2, Items/IDs/Favoriten bleiben erhalten, neue Flags sind false. Version-2-Export importiert vollständig. Unbekannte Version 3 bleibt readOnly; beschädigte Daten folgen vorhandenem Backup-Verhalten.
- [ ] Tests: claimKirchendeReward liefert einmal Hainkern mit slot ring1, power grove, rarity epic; Wiederholung liefert null und nach Speichern/Neuladen weiterhin null. Voller Beutel führt über bestehenden Überlauf, kein Verlust.
- [ ] Tests: alle fünf neuen Kräfte validieren, milestone 12 ist zulässig; Recycling entfernt keine ausgerüsteten/favorisierten Items.
- [ ] Run node tests/kirchende-loot.test.cjs; erwartetes FAIL.
- [ ] Migration im Speicherparser und Import implementieren, gemeinsame Versionkonstanten aktualisieren. Acht bestehende Slots und bisherige Statgrenzen beibehalten.
- [ ] Kräfte: bark -> 8 % weniger eingehender Schaden; roots -> 8 % mehr Bewegungstempo; splinter -> Heldenschüsse ignorieren 10 Prozentpunkte Rüstung, mindestens 0; wardlight -> 25 % mehr Heldenschaden auf Schilde; grove -> jeder fünfte Heldentreffer verursacht 20 % des unkritischen Basisschadens im Radius 60, ohne rekursive Procs.
- [ ] Run node tests/kirchende-loot.test.cjs und node tests/loot.test.cjs; PASS.
- [ ] Commit: feat: migrate loot saves and add Kirchende rewards.

### Task 3: Kampfregeln, Gegner und Türme
**Files:** dist/kirchende-combat.js, dist/game.js, dist/combat-fx.js; tests/kirchende-combat.test.cjs.
**Interfaces:** KirchendeCombat.applyShieldDamage(enemy,damage)->{shieldDamage,hpDamage}; tickSupport(enemies,dt); tickBoss(enemy,dt,monument)->{attackDamage,phaseChanged}; registerBossHit(enemy,hpDamage); thornDamage(base,index)->number. Globale Registry passend zu bestehenden IIFEs.
- [ ] Failing tests: thornDamage(100,0/1/2) ergibt 100/70/49, ab Index 3 null bzw. 0. Projektil trifft denselben Gegner nur einmal. Schild nimmt Schaden vor HP, Überhang trifft HP.
- [ ] Tests: Rufer vergibt höchstens einen Schild an nächsten ungeschützten Verbündeten im Radius 180, Schildlaufzeit 4 s und Rufer-CD 8 s; keine Stapelung, tote Gegner ausgeschlossen.
- [ ] Tests: Bossladung 2 s; 8 % maxHp an tatsächlichem HP-Schaden innerhalb der Ladezeit unterbrechen; danach 6 s Cooldown. Pausierte Spielupdates rufen tickBoss nicht auf. HP-Schwellen 66 % und 33 % lösen jede Phase einmal aus.
- [ ] Run node tests/kirchende-combat.test.cjs; erwartetes FAIL.
- [ ] Pure Regeln implementieren und in game.js einbinden. Initialwerte vor Integration in BALANCE-Datei dokumentieren: Wurzelläufer 75 % infantry-HP/135 % Tempo; Steinpanzer 140 % brute-HP/75 % Tempo/Rüstung .35; Nebelrufer infantry-HP/85 % Tempo, Schild 25 % Ziel-maxHp; Entwurzelter 120 % bestehender boss-HP/65 % Tempo. Bestehende Wave-Skalierung einmal anwenden.
- [ ] Dornenwerfer: Kosten 65, Basisdamage 24, range 300, Cooldown 1.2 s, Durchschuss max. 3. Runenlaterne: Kosten 75, range 180, Impuls-CD 1.5 s, je Ziel 18 Schild-/4 HP-Schaden, maximal 6 Ziele pro Impuls. Stufen 2/3: Schaden x1.25/x1.5, Reichweite x1.1/x1.2; bestehende Upgradepreise nutzen. Als Playtestwerte kennzeichnen.
- [ ] Run node tests/kirchende-combat.test.cjs und node tests/combat-fx.test.cjs; PASS.
- [ ] Commit: feat: add Kirchende enemies and defensive towers.

### Task 4: Kampagne, Auswahl und HUD
**Files:** dist/game.js, dist/index.html, dist/loot-ui.js und vorhandene UI-CSS; tests/kirchende-integration.test.cjs.
**Interfaces:** reset(level=1,mode='campaign'), startGame(level=1,mode='campaign'); game.mode, game.level; enemy.gateIndex wählt seinen Pfad. Testhooks ergänzen spawnEnemy, endWave, startGame, update und getState nur für deterministische Prüfung.
- [ ] Tests: L3 ist vor Abschluss Welle 8 gesperrt; danach frei, auch nach Neuladen. L3 startet Welle 9/180 Essenz/8 Türme. Dornenwerfer sofort verfügbar, Runenlaterne ab Welle 11.
- [ ] Tests: Abschluss Welle 8 zeigt Wahl L3 oder bisheriger Endlosmodus, Welle 12 in L3 zeigt Abschluss statt generischem Mini-Boss; wiederholter Abschluss dupliziert keine Belohnung. Endlos-L2 behält bisherige Skalierung. Vier Gate-Pfade werden jeweils benutzt.
- [ ] Tests: Vorschau und Threat-Arrows nennen nur aktive Gates; getrennte Held-/Beute-Menüs bleiben erreichbar. Pause stoppt Bossladung und schließt Input ab.
- [ ] Run node tests/kirchende-integration.test.cjs; erwartetes FAIL.
- [ ] Levelabhängige Reset-/Start-/Wellenende-Abfragen auf Leveldaten umstellen, Pfadbewegung für L2/L3 aktivieren; kein pauschales Ersetzen aller level===2-Abfragen. Bestehende L1-Boss-/Unlock-Regeln erhalten.
- [ ] Run node tests/kirchende-integration.test.cjs, node tests/portrait-hud.test.cjs und TEST_MOBILE=1 node tests/game.test.cjs; PASS.
- [ ] Commit: feat: integrate Kirchende campaign and unlock flow.

### Task 5: Grafikproduktion und mobile Darstellung
**Files:** dist/kirchende-art.js, dist/visuals.js, dist/game.js, dist/preloader.js, dist/assets/kirchende/; tests/kirchende-assets.test.py.
**Interfaces:** KirchendeArt.load()->Promise; draw(ctx,key,x,y,height,options)->boolean, false bei fehlendem Asset; drawScenery(ctx,level,camera,actors,quality). Assets verwenden dokumentierten Fußanker und getrennte Kronen.
- [ ] Assetmanifest schreiben: drei Denkmalzustände; vier Gegner mit walk/attack/hit/death, Boss charge/phase; sechs Turmstufen; fünf Item-Icons; Boden, Dekoration und Baumkronen; Levelauswahl- und Ladebild.
- [ ] Tests: jedes referenzierte Bild decodiert, alle Frame-Rechtecke liegen im Atlas, drei Denkmalzustände besitzen identische Abmessungen/Anker. Kein einzelner Atlas größer 2048x2048.
- [ ] Grafiken mit Imagegen aus zugänglichen Referenzbildern erzeugen; zuerst Denkmal und Draufsicht zur Orts-/Stilprüfung. Keine Screenshot-UI in Assets übernehmen. Fehlende lokale Referenzen neu auflösen, nicht erfinden.
- [ ] Lauf-/Angriffsanimationen frameweise prüfen; erzeugte Sheets erst nach validierter Segmentierung als Assets einbauen.
- [ ] Renderer/Loader implementieren, L3-Assets erst bei Auswahl laden; bei fehlenden Bildern vorhandene Canvas-Ersatzgrafik. Kronenopacity .25 bei Überdeckung von Held/Gegner, sonst 1. Low-FX verzichtet auf Nebel, zusätzliche Schatten und Kronenanimation.
- [ ] Run python tests/kirchende-assets.test.py und node tests/preloader.test.cjs; PASS. Manuell alle Schadenszustände und Baumverdeckung prüfen.
- [ ] Commit: art: integrate Kirchende monument and level assets.

### Task 6: Regressionen und Testrelease
**Files:** tatsächliche .github/workflows/*.yml, RELEASE_v4.0.0-alpha.1.md, BALANCE_v4.0.0-alpha.1.md.
**Interfaces:** vorhandene Testpipeline um neue Tests erweitern; Push-Filter v4-kirchende ergänzen. Veröffentlichung bleibt erst nach allen Prüfungen.
- [ ] Baseline-Suite vor Implementierung ausführen und vorhandene Fehler protokollieren; PR-19-HUD-Fehler darf nicht als V4-Regression verschleiert werden.
- [ ] Run node tests/preloader.test.cjs; node tests/portrait-hud.test.cjs; node tests/loot.test.cjs; node tests/game.test.cjs; TEST_MOBILE=1 node tests/game.test.cjs; node tests/combat-fx.test.cjs; node tests/v3.1-features.test.cjs; python tests/assets.test.py sowie alle neuen Tests. Jeder Prozess Exit 0 erforderlich.
- [ ] Referenz-Draufsicht und fertig gerenderte Karte vergleichen, unsichere Wege klar dokumentieren. Android-Wellen 9–12 vollständig spielen; FPS unter denselben Bedingungen wie vorher messen. Browserprüfung ersetzt keinen Android-Gerätetest.
- [ ] Erst bei Erfolg Releasebezeichnung und Cacheversion v4.0.0-alpha.1 konsistent setzen, Release notes mit echten Ergebnissen schreiben.
- [ ] Separaten Testbuild bereitstellen; main/gh-pages nicht vor verifiziertem Stand überschreiben. Falls aktuelles Hosting keinen Branch-Testbuild unterstützt, ZIP-Testbuild bereitstellen und keinen Online-Release behaupten.
- [ ] Commit und Draft-PR mit konkretem Teststand; fehlenden Android-Test als offen markieren.

## Selbstprüfung
Karten-/Pfadtreue Task 1+5; Unlock/Kampagne Task 2+4; Gegner/Türme Task 3; Beute/Migration Task 2+3; Grafiken/Fallback/Performance Task 5+6. Review-Focus-Fälle sind Tasks 1,2,4,5 zugeordnet.
Die numerischen Kampfbalancewerte sind Umsetzungsvorschläge, nicht bereits gemessene Ergebnisse.
Keine Implementation oder Testfreigabe wird allein durch diesen Plan behauptet.
