# Hybrid Equipment and Boss-Only Loot Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein Bossbeute-Mischsystem mit 21 festen Itemtypen, zwei Heldenausrüstungen und gezielter Verbesserung einführen, ohne alte Gegenstände zu verlieren.

**Architecture:** Der neue reine Katalog definiert Gegenstände und Würfe. Das bestehende Lootmodell übernimmt kanonisches Eigentum, Migration und Verwaltung; Game und Inventar greifen über definierte Schnittstellen darauf zu. Der Kampf verwendet weiterhin einen unabhängigen Snapshot.

**Tech Stack:** Vanilla JavaScript/CSS, statisches `dist/`, bestehende Node-VM-Tests, Python-Assetprüfungen, Playwright für Browserprüfung. Keine neue Laufzeitabhängigkeit.

**Spec:** `docs/superpowers/specs/2026-10-20-equipment-hybrid-boss-loot-design.md`, am 20.10.2026 ausdrücklich freigegeben.

## Global Constraints

- Neue Ausrüstung ausschließlich von echten Bossen.
- Alle Gegenstände sind für Marcel und Kim frei verwendbar.
- Gemeinsame Sammlung, acht Plätze und eigene Zusammenstellung je Held.
- Erhalt vorhandener Gegenstände, Startausrüstung und Fortschritte.
- Ausrüstungswechsel ausschließlich im Hauptmenü; eine Runde verwendet einen festen Snapshot.
- Keine neuen Laufzeitabhängigkeiten.
- Katalog: exakt 21 Typen, zwei feste Wertearten je neuem Item, die 14 vorhandenen Kräfte unverändert.
- Erwerb: 60 % Signaturliste / 40 % Gesamtkatalog; 80 % episch / 20 % legendär; Stufe 1–30.
- Schmieden: Rang 0–3, Kosten 50/100/150, insgesamt maximal +15 % der Ausgangswerte; keine neuen Items.
- Speicherung: `denkmal-loot-v1`, `denkmal-loot-v1-backup`, einmalige Rückwegsicherung `denkmal-loot-v1-pre-v3`; Format `denkmal-loot`, Version 3, v1/v2 lesbar.
- 30 Rucksackplätze, maximal 100.046 besessene Items, Import höchstens 15.000.000 Zeichen wie beim bestehenden Import; Dateieingang zusätzlich höchstens 15.000.000 Byte.
- Keine Änderung von Boss-Spawnregeln, Wellenzahlen, Grafikassets, anderen Speicher-Schlüsseln oder Spielmodi.

## Review Focus

1. Unbekannte Karten/Bosse oder nichtendliche RNG-Werte dürfen keinen Ersatzfund oder kaputte Werte erzeugen: Task 1.
2. Identische ID bei beiden Helden ist gültig; doppelte IDs innerhalb einer Sammlung/einer Held-Zuordnung sind ungültig: Task 2/3.
3. Speicherfehler zwischen Rückwegsicherung und Primärschreiben dürfen den alten Rohstand nicht ungesichert ersetzen: Task 2.
4. Rekursive Kills, wiederholte Todesaufrufe und eine volle Sammlung dürfen weder doppelte noch neu gewürfelte Bossfunde erzeugen: Task 4.
5. Eine offene Schmiedebestätigung darf nach Heldwechsel, Import oder Änderung in einem anderen Tab keine veraltete Aktion ausführen: Task 5/6.

---

## Dateiverantwortung und Reihenfolge

| Datei | Verantwortung |
|---|---|
| `dist/equipment-catalog.js` (neu) | Typen, Listen, Wertewürfe, reine Verbesserungsvorschau |
| `dist/loot.js` | Profil v3, Migration, Eigentum, Heldenreferenzen, Erwerb, ausstehende Funde, Verwaltung und Speichern |
| `dist/game.js` | Boss-Tod und Erwerbstokens, Entfernung anderer Itemquellen, Auswahl des Runden-Snapshots |
| `dist/hero-saga.js` | Bestehende Ausrüstungskräfte und Snapshot-Auswertung |
| `dist/loot-ui.js`, `dist/loot.css`, `dist/index.html` | Inventar, Vergleich, Herkunft, Heldenzuordnungen, Schmiedevorschau, Ladefolge und Cacheversion |
| `tests/equipment-catalog.test.cjs` (neu) | Reine Katalog- und Verteilungsprüfung |
| `tests/equipment-migration.test.cjs` (neu) | Profilvalidierung, Altversionen und Fehlerszenarien |
| `tests/boss-loot.test.cjs` (neu) | Echte Erwerbsintegration im bestehenden VM-Spielharness |
| `tests/equipment-effects.test.cjs` (neu) | 14 Kräfte, Kombinationen und Snapshot-Verhalten |
| `tests/loot.test.cjs`, `tests/loot-ui.test.cjs` | Bestehende Besitz-/UI-Regressionen auf neue Schnittstellen umstellen |
| `tools/verify-equipment-browser.cjs` (neu) | Desktop/Touch, persistierte Migration und öffentlicher Teststand |
| `.github/workflows/test.yml` | Neue Prüfungen in vorhandenen CI-Job aufnehmen |
| `docs/qa/equipment-hybrid-20261020/` (neu bei Ausführung) | Bericht, Testbefehle und ausgewählte Screenshots |

Die Reihenfolge ist 1 → 2 → 3 → 4 → 5 → 6 → 7. Die Arbeiten bilden einen
gemeinsam auszuliefernden Patch. Zwischenstände werden nicht veröffentlicht.
Vor Beginn bestehenden isolierten Arbeitsbereich und sauberen Stand prüfen;
Umsetzungszweig `feature/equipment-hybrid-boss-loot-20261020` vom freigegebenen
Plan-Commit erstellen. Grafikzweig und bestehender Testlink bleiben erhalten.

## Verbindliche Schnittstellen

Typen sind dokumentierte JS-Verträge, keine neue TypeScript-Abhängigkeit.

- `HeroId = 'marcel' | 'kim'`; `Slot` sind die bisherigen acht Slot-IDs.
- `BossContext = {mapId:number, wave:number, bossType:'boss'|'uprooted'}`.
- `RewardRequest = BossContext & {runId:string, spawnId:string}`.
- `DenkmalEquipmentCatalog.templates`: eingefrorenes Objekt, Schlüssel sind die 21 IDs aus der Spezifikation.
- `DenkmalEquipmentCatalog.bossPools`: eingefrorene Signaturlisten für 1/3/4/5/6.
- `DenkmalEquipmentCatalog.rollBoss(context, rng=Math.random) -> ItemDescriptor | null`: ohne Instanz-ID; ungültige Eingaben liefern `null`.
- `DenkmalEquipmentCatalog.previewUpgrade(item) -> {allowed:boolean, reason:string, cost:number, nextRank:number, stats:object}`: reine Berechnung; keine Besitz-/Menüprüfung.
- `DenkmalLoot.create({storage,rng,canManage,getHero}) -> model`: `getHero` liefert den Menühelden, Standard für alte Aufrufer `'marcel'`.
- `model.profile`: tiefe Kopie des kanonischen v3-Profils; keine veränderlichen Referenzen.
- `model.view(hero=model.getHero()) -> {items,bag,overflow,equipped,all}`: tiefe, abgeleitete Ansicht. `all` enthält jedes besessene Item einmal; `items` nur beim angefragten Helden angelegte Instanzen; `bag/overflow` schließen die Vereinigungsmenge beider Zuordnungen aus.
- `model.snapshot(hero=model.getHero()) -> Item[]`: tiefe Kopie der ausgerüsteten Items dieses Helden.
- `model.equip(id,slot,hero=model.getHero())`, `unequip(slot,hero=model.getHero())`, `favorite(id)`, `salvage(id)`, `salvageAll()`, `upgrade(id) -> boolean`: Modell prüft Menü, aktuellen Speicher und alle Schutzregeln.
- `model.upgradePreview(id) -> {allowed,reason,cost,nextRank,stats}`: Katalogvorschau plus Modellschutz/Kostenprüfung.
- `model.claimBoss(request) -> {state:'granted'|'pending'|'duplicate'|'rejected', item:Item|null, persisted:boolean}`: einziger normaler Erwerbsweg für neue Ausrüstung.
- `model.retryPending() -> {granted:number,pending:number,persisted:boolean}`: Kandidaten unverändert in Erwerbsreihenfolge übernehmen; nach Recycling und gültigem Import aufrufen.
- `model.exportJSON()`, `exportRecovery()`, `exportPreMigration() -> string|null`, `validateImport(text)`, `importJSON(text)`, `save()` bleiben beziehungsweise werden eindeutig erweitert. Rückwegsicherung ist ein eigener Export, nicht der Recovery-Export eines neueren Primärstands.
- `model.claimKirchendeCompletion() -> boolean`: Abschlussflag ohne Item, wiederholbar ohne zusätzliche Wirkung.
- Bestehende `unlockLevel()`/`unlockLevel3()` und `salvagePreview()`/`salvageValue(item)` bleiben erhalten. `generate`, `generateKirchende`, `milestone`, `claimKirchendeReward` und `reforge` entfallen nach Umstellung aller Aufrufer.

`model.getHero() -> HeroId` wird als dokumentierte Methode bereitgestellt. Ein unbekannter
expliziter Held wird abgelehnt statt still auf Marcel umgebogen. `view` und
`snapshot` liefern dann `null`; schreibende Befehle liefern `false`.
Tests laden den Katalog in ihren VM-Kontexten vor `loot.js`.

### Task 1: Reiner Gegenstandskatalog und feste Würfelregeln

**Files:** Create `dist/equipment-catalog.js`, `tests/equipment-catalog.test.cjs`.
Modify `dist/index.html` für Ladefolge; vorhandene VM-Harnesses beim Laden des
Lootmodells um den Katalog ergänzen, ohne deren Verhaltensprüfungen zu entfernen.

**Interfaces:** Produces `DenkmalEquipmentCatalog.templates`, `bossPools`,
`rollBoss(context,rng)` und `previewUpgrade(item)` wie oben. Consumes keine
anderen neuen Module; übernimmt Wertearten/Kappen aus der Spezifikation.

- [x] **Step 1: Fehlende Katalogtests schreiben.** Node `assert/strict` + VM wie im bestehenden Loot-Test. Assertions:
  ```js
  assert.equal(Object.keys(C.templates).length, 21);
  assert.deepEqual(Object.keys(C.bossPools).sort(), ['1','3','4','5','6']);
  assert.equal(C.rollBoss({mapId:2,wave:8,bossType:'boss'},()=>0), null);
  assert.equal(C.rollBoss({mapId:1,wave:5,bossType:'wraith'},()=>0), null);
  assert.equal(C.rollBoss({mapId:3,wave:12,bossType:'uprooted'},()=>NaN), null);
  assert.equal(C.previewUpgrade(cappedRank3).allowed, false);
  ```
  Zusätzlich jede Typ-ID, zwei exakte Wertearten, alle 14 Kräfte, Ringkompatibilität und alle fünf Signaturlisten gegen die Spezifikation prüfen. Tests besitzen eigene kleine gültige Itemfixtures.
- [x] **Step 2: Rot prüfen.** `node tests/equipment-catalog.test.cjs` muss am fehlenden Katalog scheitern.
- [x] **Step 3: Katalog implementieren.** RNG-Verbrauch festlegen: Poolzweig, Typindex, Seltenheit, Wert 1, Wert 2. Jeder gezogene RNG-Wert muss endlich in `[0,1)` liegen, sonst `null`, ohne Teil-Item. Karten 1/4/5/6 akzeptieren `boss`, Karte 3 `uprooted`; negative/nichtendliche Wellen werden abgelehnt, gültige Wellen auf 1–30 gekappt. Raritätswurf `<.8` episch, sonst legendär. Werteformel und Rangberechnung exakt aus der Spezifikation; neue Ringe speichern `ring1`.
- [x] **Step 4: Grenzfälle und Verteilung grün prüfen.** `node tests/equipment-catalog.test.cjs`: RNG-Grenzen .6/.8, Stufen 1/30/999, Rundung, rangweise monotone Vorschau, Kosten `[50,100,150]`. Mit festem PRNG-Seed 100.000 Würfe in einem Signaturpool prüfen: Signaturtypen insgesamt erwartet `.6 + .4*4/21` (Toleranz ±.01), legendär `.2` (±.01); alle 21 Typen müssen vorkommen. Keine falsche 60-%-Prüfung, die Überschneidung beider Listen ignoriert.
- [x] **Step 5: Commit.** `git add dist/equipment-catalog.js dist/index.html tests` und `git commit -m "feat(equipment): add fixed item catalog and boss pools"`; nur die in diesem Task geänderten Testharnesses aufnehmen.

### Task 2: Profil v3, Altspielstände und Speichersicherheit

**Files:** Modify `dist/loot.js`, `tests/loot.test.cjs`; Create
`tests/equipment-migration.test.cjs`, `tests/fixtures/loot-v1.json`,
`tests/fixtures/loot-v2.json`. Fixtures sind synthetisch und enthalten keine Nutzerdaten.

**Interfaces:** Consumes Task 1. Produces v3 `profile`, `view(hero)`, `snapshot(hero)`,
`find(id)`, Speicher-/Export-/Importmethoden und frische Startausrüstung. Mutation
über einen validierten Kandidaten; Commit in den Sitzungszustand und Speicherversuch
sind getrennte Ergebnisse. `MAX_OWNED=100046` ist intern konstant.

- [x] **Step 1: Migrations-/Fehlertests schreiben.** Fixtures enthalten acht ausgerüstete Items, mehr als 30 weitere Items, Favoriten, Schmiedessenz und Abschlussflags. Assertions:
  ```js
  assert.equal(m.profile.version, 3);
  assert.equal(m.profile.owned.length, old.items.length+old.bag.length+old.overflow.length);
  assert.deepEqual(m.profile.loadouts.marcel, old.equipped);
  assert.deepEqual(m.profile.loadouts.kim, old.equipped);
  assert.equal(m.find(old.items[0].id).stats.damage, old.items[0].stats.damage);
  assert.equal(storage.getItem(PRE_V3), originalRaw);
  assert.equal(fresh.profile.owned.length, 3);
  ```
  Backup-Vergleich nach erstem `save()`. Frischprofil besitzt die bisherigen drei Starter einmal, Referenzen bei beiden Helden, keine zusätzlichen Items bei Reload/Import. v1 setzt neue Flags wie bislang auf false.
- [x] **Step 2: Rot prüfen.** `node tests/equipment-migration.test.cjs` muss an v3/owned scheitern.
- [x] **Step 3: Migration/Validierung implementieren.** v1/v2 zuerst mit alten Grenzen validieren, dann `items+bag+overflow` verlustfrei normalisieren. Altobjekte kopieren, `legacy`, `baseStats`, `upgradeRank:0` ergänzen. v3 validiert eindeutige IDs, Slotreferenzen, Kräfte, Rang 0–3, begrenzte Werte, sichere Zusatzdaten und die Beziehung zwischen `baseStats`/Rang/Stats. Neue Templateitems müssen zu ihrem Typ passen. Profilansichten sind abgeleitet, keine zweite Eigentumsliste. Flags und fremde Speicher-Schlüssel erhalten.
- [x] **Step 4: Schreib- und Importpfad testen.** Simulierte Speicheradapter werfen jeweils beim Lesen, pre-v3-Schreiben, Backup-Schreiben und Primärschreiben. Das alte Original darf ohne bestätigte Rückwegsicherung nicht ersetzt werden. Ein gültiger pre-v3-Stand bleibt unverändert; ein beschädigter blockiert die Ersetzung. Unbekannte Versionen, doppelte owned-IDs, NaN/Infinity, verwaiste Referenzen, unzulässige Rang-/Statskombinationen und >15-MB-Import werden atomar abgelehnt. Wiederholte Migration und Import ergeben keine Duplikate. Aktuelle Sitzungsänderungen bleiben bei Quota erhalten, Status meldet Sitzung.
- [x] **Step 5: Grün prüfen und committen.** `node tests/equipment-migration.test.cjs`; bestehende `tests/loot.test.cjs` auf v3-Ansichten/Fixtures umstellen, alte Schutzprüfungen behalten. `git add dist/loot.js tests/loot.test.cjs tests/equipment-migration.test.cjs tests/fixtures/loot-v1.json tests/fixtures/loot-v2.json` und `git commit -m "feat(equipment): migrate inventory to shared version 3 ownership"`.

### Task 3: Zwei Heldenausrüstungen, gezielte Schmiede und Recycling

**Files:** Modify `dist/loot.js`, `tests/loot.test.cjs`.

**Interfaces:** Consumes Task 2 ownership/view. Produces `equip`, `unequip`,
`favorite`, `upgradePreview`, `upgrade`, `salvage`, `salvageAll` und bisherige
Preview-/Wertmethoden. Alle schreibenden Verwaltungsbefehle prüfen `canManage`
und aktuellen Primärstand unmittelbar vor Mutation. `reforge` wird entfernt.

- [x] **Step 1: Verhaltenstests ergänzen.** Unterschiedliche Waffen für beide Helden, anschließend dasselbe Item bei beiden: `owned.length` ändert sich nie. Ablegen bei Kim verändert Marcel nicht. Zwei Ringinstanzen passen in ring1/ring2; dieselbe ID in beiden Slots wird abgelehnt. Ein nur bei Kim angelegtes, nicht favorisiertes Item darf nicht recycelt oder verbessert werden. `snapshot('marcel')` bleibt nach späterem Wechsel bytegleich.
- [x] **Step 2: Rot prüfen.** `node tests/loot.test.cjs`; neue Zwei-Helden-/Schmiedetests müssen vor Implementierung scheitern.
- [x] **Step 3: Modellbefehle implementieren.** Schutzmenge aus beiden Zuordnungen bilden. `upgradePreview` kombiniert reine Katalogvorschau mit Eigentum, Favorit, Ausrüstung und Essenz. `upgrade` berechnet sie im Moment der Bestätigung erneut. `salvagePreview`/`salvageAll` verwenden dieselbe Schutzmenge; Transaktion erhöht Essenz höchstens auf `1e9`. Geteilte Items bleiben im Filter `all` auffindbar, aber außerhalb von bag/overflow.
- [x] **Step 4: Kosten/Schutz grün prüfen.** Ein ausreichend finanzierter unequippter Gegenstand kostet nacheinander exakt 50/100/150, Rang 4 scheitert ohne Kosten; Typ/Kraft/ID bleiben gleich. Rang 0 mit leeren Starterstats und ein vollständig gedeckeltes Item ergeben keine kostenpflichtige Nullverbesserung. Alle Befehle scheitern in der Runde und nach externem Tab-Schreiben ohne Teilmutation. Neue Held-ID `'unknown'` führt niemals zu Änderungen bei Marcel.
- [x] **Step 5: Commit.** `git add dist/loot.js tests/loot.test.cjs` und `git commit -m "feat(equipment): add independent hero loadouts and bounded upgrades"`.

### Task 4: Einmalige Bossbelohnungen und Entfernung anderer Itemquellen

**Files:** Modify `dist/loot.js`, `dist/game.js`, `tests/game.test.cjs`,
`tests/v3.1-features.test.cjs`, `tests/v4-alpha4.test.cjs`,
`tests/style2-kirchende.test.cjs` soweit deren Itemquellen betroffen sind.
Create `tests/boss-loot.test.cjs`.

**Interfaces:** Consumes Katalog/Profil. Produces `claimBoss(request)`,
`retryPending()`, `claimKirchendeCompletion()`. Game verwendet `snapshot(selectedCharacter)`
und `view(selectedCharacter)`. Tokens und Kandidaten hält das Lootmodell pro
Sitzung; das Game liefert `runId`, `spawnId`, Karte, Welle und echten Typ.

- [x] **Step 1: Integrationstests schreiben.** Den bestehenden VM-Spielharness aus `tests/game.test.cjs` verwenden, Katalog zuerst laden und testlokal `hurtEnemy`/`completeLevel` zugänglich machen. Echte Kampffunktionen ausführen, nicht nur nach Quelltextmustern suchen. Nach 500 normalen Kills und Wellen-/Meilenstein-/Erstabschlussereignissen wächst die Sammlung nicht; nach einem echten Bosskill genau um eins, schon vor Wellenende.
- [x] **Step 2: Rot prüfen.** `node tests/boss-loot.test.cjs` muss wegen bisheriger Nicht-Boss-Funde und verzögertem Boss-Pickup scheitern.
- [x] **Step 3: Erwerb implementieren.** Pro Reset neue Run-ID, pro Spawn monotone ID. Boss als tot markieren, dann Kandidat mit einmaligem Würfeln via `claimBoss` übernehmen. Bei `granted` Feedback mit Itemname/Quelle; bei Speicherproblem korrekten Status statt falscher Speicherzusage. Boss-Bodenobjekte enthalten nur bisherige Kampfessenz. Entfernen: 12-%-Items, automatische Wellenitems, Milestone-Items und zusätzliches Hainkern-Item. Kirchende-Abschlussflag unabhängig setzen. Vorhandene Kampagnen-/Preview-Schranken beibehalten. Alle verbliebenen Aufrufer der entfernten Methoden umstellen; Testfixtures nutzen Katalogdescriptoren statt Produktionsgeneratoren für normale Mobs.
- [x] **Step 4: Mehrfachaufrufe und ausstehende Funde prüfen.** Boss zweimal treffen, `endWave`/Menü/Game-over danach aufrufen und über einen Flächen-/Ketteneffekt töten: immer genau ein Item pro Spawn. Zweiter Boss/zweiter Run darf erneut geben. Bei 100.046 owned-Items bleibt exakt ein ausgewürfelter Kandidat ausstehend; Wiederholung verändert Werte/ID nicht. Nach Recycling wird er einmal übernommen. `pendingRewards` exportieren/importieren, fehlend bedeutet leer, Duplikate gegen owned/token werden abgelehnt. Simulierte Quota-Fehler und stale Tabs dürfen fremde Daten nicht überschreiben. Kein Erwerb bei lediglich `miniBoss:true`.
- [x] **Step 5: Vorschriftsgemäße Integration prüfen und committen.** `node tests/boss-loot.test.cjs`, `node tests/game.test.cjs`, `TEST_MOBILE=1 node tests/game.test.cjs`, `node tests/alpha8-preview.test.cjs`, `node tests/goethestrasse-preview.test.cjs`. Assertions für Freischaltungen und alte Grafik-/Spielmechaniken erhalten. `git add dist/loot.js dist/game.js tests` und `git commit -m "feat(loot): award equipment only once per real boss kill"`; nur tatsächlich betroffene Tests aufnehmen.

### Task 5: Bestehende Kräfte und Inventaroberfläche integrieren

**Files:** Modify `dist/loot-ui.js`, `dist/loot.css`, `dist/index.html`,
`dist/hero-saga.js`, `dist/game.js`, `tests/loot-ui.test.cjs`;
Create `tests/equipment-effects.test.cjs`.

**Interfaces:** Consumes `model.view(hero)`, `snapshot(hero)`, `upgradePreview`,
`upgrade`, Exportmethoden und kanonische `profile`-Flags. Bestehendes UI-API
`DenkmalLootUI.create(model,{editable,onClose,onImport,getHero})` bleibt.
HeroSaga verwendet weiterhin Item-Snapshots und `DenkmalLoot.totals(items)`.

- [x] **Step 1: Verhaltensprüfungen ergänzen.** UI-Harness wählt Kim/Marcel, zeigt jeweils eigene Slots und Vergleichswerte; Filter „Alle“ findet ein nur beim anderen Helden getragenes Item und kennzeichnet dessen Verwendung. Ringvergleich folgt dem gewählten Platz. Spezialeffektverlust verhindert den Verbesserungspfeil. Vorschau zeigt Kosten/Rang/Vorher-Nachher; Bestätigung nach Import/Heldwechsel wird verworfen, nach Tab-Änderung vom Modell abgelehnt. Read-only-Rundeninventar darf nichts verändern.
- [x] **Step 2: Rot prüfen.** `node tests/loot-ui.test.cjs` muss an der noch nicht umgestellten UI/Vorschau scheitern. `node tests/equipment-effects.test.cjs` prüft die vorhandenen Kräfte als Regression; ein bereits grüner Erhaltungstest wird nicht künstlich zum Scheitern gebracht.
- [x] **Step 3: UI umstellen.** Alle `profile.items/bag/overflow/equipped`-Annahmen durch `view(currentHero)` ersetzen, auch Menü-Rucksackzähler und Auswahl nach Import. Herkunft, Rang und „Angelegt bei Marcel/Kim“ anzeigen. Zufalls-Neuschmieden durch gezielte Verbesserung ersetzen, keine Itemherstellung anbieten. Beim Wechsel/Import jede offene destruktive Bestätigung und Detailauswahl sicher invalidieren. Zeilen mit beiden Effekten und ihre bestehende Priorität zeigen; keine Stärkezahl erfinden. Eigener pre-v3-Exportbutton, wenn Rückwegsicherung vorhanden ist.
- [x] **Step 4: 14 Kräfte und Touch grün prüfen.** In `equipment-effects.test.cjs` echte Saga-/Kampfpfade prüfen: ember, echo, oath, ash, lantern, bell, bark, roots, splinter, wardlight, grove, chain, sustain, bastion. Die drei bestehenden Prioritäten zwischen den sechs Alternativkräften und doppelte Ringkräfte behalten ihre bisherige Wirkung. Ein Schadenstest für grove darf keine endlose Proc-Kette erzeugen. UI-Tests decken Tastaturfokus, mobile Detailansicht, gesperrte Aktionen und Desktopvergleich weiter ab. `node tests/loot-ui.test.cjs`, `node tests/equipment-effects.test.cjs`, `node tests/portrait-hud.test.cjs`, `node tests/menu-navigation.test.cjs`, `TEST_MOBILE=1 node tests/menu-navigation.test.cjs`.
- [x] **Step 5: Cacheversion und Commit.** Neue/geänderte Produktskripte und `loot.css` in `index.html` auf `equipment-boss1` setzen; Grafikversionsparameter unverändert lassen. `node tests/cache-busting.test.cjs` und `node tests/startup-loading.test.cjs`. `git add dist/loot-ui.js dist/loot.css dist/index.html dist/hero-saga.js dist/game.js tests/loot-ui.test.cjs tests/equipment-effects.test.cjs` und `git commit -m "feat(inventory): present shared items and targeted forge for both heroes"`.

### Task 6: Vollständige Regression und Browserprüfung

**Files:** Create `tools/verify-equipment-browser.cjs`,
`docs/qa/equipment-hybrid-20261020/report.json`, ausgewählte PNGs und
`docs/EQUIPMENT_HYBRID_BOSS_LOOT.md`; Modify `.github/workflows/test.yml`
und übrige betroffene VM-Testladefolgen.

**Interfaces:** Browserprüfer nutzt bestehende `DenkmalTestHooks`; für Kills
Spielzustand/Feindobjekte anpassen und tatsächliches `update` ausführen, keine
öffentliche Cheat-/Belohnungsfunktion für den Produktfluss hinzufügen.
`TD2_TEST_URL` ist optional: fehlt es, startet der Prüfer einen lokalen Server;
ist es gesetzt, prüft er denselben Ablauf am veröffentlichten URL.

- [ ] **Step 1: Browserprüfung schreiben und ausführen.** Playwright aus der vorhandenen Toolumgebung nutzen, keine Produktabhängigkeit installieren. Desktop 1280×900 und Touch 412×915 prüfen. Auf jedem Kontext v2-Testprofil injizieren, v3-Migration/Backup prüfen, beide Helden verschieden ausrüsten, ein Item teilen, geschützte Aktionen prüfen, unequippte Ausrüstung verbessern und einen echten Boss durch den Kampfcode töten. Reload erhält Item und Zuordnungen. Ein Quota-Adapter im separaten Kontext muss Sitzungswarnung und Export erzeugen. Report enthält Browser, Viewport, sourceCommit, Ergebnis pro Szenario, Fehler/HTTP-Fehler und `androidDeviceTested:false`.
- [ ] **Step 2: Bericht visuell prüfen.** Screenshots von Ausrüstung, Vergleich und Schmiedevorschau auf beiden Größen öffnen. Keine überlappenden oder abgeschnittenen Aktionen; Tastaturfokus und Touchdetail schließen korrekt. Bestehende Style-2-Türme über `?td2UserTowers=1` laden, alle sechs Karten starten ohne Grafikpfadänderung. Einzelprozess-Chromium-Kontexte erst am Ende gemeinsam schließen.
- [ ] **Step 3: CI und gesamte bestehende Regression ausführen.** Die vier neuen Node-Dateien Katalog/Migration/Boss/Kräfte sowie aktualisierte Loot-/UI-Tests in `.github/workflows/test.yml` aufnehmen. `feature/equipment-hybrid-boss-loot-20261020` zum Push-Trigger und `assets/style2-user-towers-1to5-20261020` als mögliches gestapeltes PR-Ziel zum Pull-Request-Trigger ergänzen; existierende Trigger erhalten, keine automatische Pages-Veröffentlichung hinzufügen. Alle vorhandenen `run`-Befehle aus dem Testworkflow ausführen, inklusive Python-Assettests und vorhandener `TEST_MOBILE=1`-Varianten. Bei einer Testanpassung nur belegte alte Lootannahmen ersetzen, keine unabhängigen Regressionen löschen oder Erwartungen lockern.
- [ ] **Step 4: Exakte Befehle und Nachweise festhalten.** Für Browser lokal: `NODE_PATH="$CODEX_PRIMARY_RUNTIME_NODE_MODULES" CHROMIUM_EXECUTABLE=/tmp/chromium TD2_QA_OUT=/tmp/td2-equipment-qa node tools/verify-equipment-browser.cjs`. Existiert das Binary nicht, verfügbares Playwright-Binary explizit verwenden; kein Nachweis ohne tatsächlichen Lauf. Nur ausgewählte Bilder/Report ins Repo kopieren; keine Profile, Nutzersaves oder vollständigen temporären Dumps. `git diff --check` muss grün sein, Statvergleich darf keine unerwarteten Binär-/Assetänderungen zeigen.
- [ ] **Step 5: Commit.** `git add tools/verify-equipment-browser.cjs docs/EQUIPMENT_HYBRID_BOSS_LOOT.md docs/qa/equipment-hybrid-20261020 .github/workflows/test.yml tests` und `git commit -m "test(equipment): verify migration boss rewards and desktop touch inventory"`; nur tatsächlich erforderliche Harnessänderungen aufnehmen.

### Task 7: Review und isolierter Teststand

**Files:** Update nur `docs/EQUIPMENT_HYBRID_BOSS_LOOT.md` mit geprüfter Revision,
Review-Ergebnis und späterem Testlink. Produktänderungen aus Reviewbefunden
bekommen ihre betroffenen Tests erneut, statt ungetesteter Abschlusskorrekturen.

**Interfaces:** Verwendet die freigegebene Ausführungsmethode. Native bedeutet
Umsetzung durch den Hauptagenten und ein unabhängiges abschließendes Review;
Subagent-driven verwendet deren Skill für Taskreviews plus Abschlussreview.

- [ ] **Step 1: Gesamtdiff prüfen lassen.** Reviewer erhält Spec, Plan, tatsächlichen Basis-/Head-Commit und Testnachweise. Fokus: ausschließlich Bossquellen, Verlust-/Duplikationsfreiheit, konkurrierende Tabs, Schutz des inaktiven Helden und Modell-/UI-Prüfung beim Bestätigen. Subagent nur im Umfang der gewählten Methode beziehungsweise des Review-Skills einsetzen. Blockierende Befunde beheben und betroffene Tests erneut ausführen.
- [ ] **Step 2: Prüfbaren Draft-PR erstellen.** Aktuellen remote Basiszweig inspizieren. Wenn der Grafikpatch noch separat ist, PR zunächst gegen dessen Zweig stapeln; falls bereits integriert, gegen den passenden aktuellen Integrationszweig. Keine ungeprüften Mergeveränderungen und kein Merge in main. Prüfbefehle im PR beschreiben; sicherstellen, dass CI für das tatsächliche PR-Ziel läuft. Sourcecommit und Teststand müssen dieselbe Produktdateiversion enthalten.
- [ ] **Step 3: Teststand separat veröffentlichen.** Nach grünen Prüfungen und Review die geprüfte `dist`-Tree unter `v4-style2-towers/equipment/v4-alpha9/` im aktuellen `gh-pages`-Tree einhängen. Vorher aktuelles gh-pages-Head lesen; Commit mit diesem Parent und Refupdate mit erwarteter SHA, niemals Force. Restlichen Tree unverändert lassen. Dieser Unterpfad liegt in einem bereits erhaltenen Top-Level-Ordner und enthält `/v4-alpha9/` für die vorhandene Kartentestfreigabe. Nur Testveröffentlichung, kein main-Merge.
- [ ] **Step 4: Öffentlichen Teststand prüfen.** Pages-Deployment muss erfolgreich sein. Öffentlichen Katalog und Lootrenderer mit der freigegebenen Quelle hashvergleichen. Browserprüfer erneut mit `TD2_TEST_URL='https://imbaaalanced-dot.github.io/a/v4-style2-towers/equipment/v4-alpha9/?td2UserTowers=1'` ausführen; Script muss Query/relativen Assetpfad korrekt behandeln. Erst bei tatsächlich erreichbarem Spiel einen Link als spielbereit melden. Echte Androidprüfung bleibt offen, bis Malle auf dem Gerät testet.
- [ ] **Step 5: Abschluss.** Kurzen Bericht mit geändertem Verhalten, Prüfungen, Testlink, Draft-PR und offenen Geräteprüfungen liefern. Alte Grafik-Testversion und Hauptzweig unverändert erhalten. Plancheckboxen nur für tatsächlich abgeschlossene Aufgaben markieren.

## Selbstprüfung und Ausführungshandoff

- Spec §§1–5 → Tasks 1/4; §§6–7 → Tasks 3/5; §8 → Tasks 2/4; §9 → Schnittstellen/Tasks 1–5; §10 → Tasks 1–6; §11 → Global Constraints/Task 7.
- Alle fünf Review-Focus-Fälle haben oben benannte Verhaltensprüfungen.
- Öffentliche Methodennamen, Hero-/Slotparameter und kanonische/abgeleitete Daten sind durchgehend gleich benannt.
- Jeder Implementierungstask enthält Rotprüfung, konkrete Umsetzung, Grünprüfung und Commit; Review/Veröffentlichung ist ein eigener Abschluss mit realen Nachweisen.
- Noch kein Produktschritt oder neuer Funktionstest aus diesem Plan wurde ausgeführt.

**Empfehlung: Native.** Die Schritte hängen eng am selben Lootmodell und denselben
VM-Harnesses; Umsetzung durch einen Agenten vermeidet Übergaben an diesen Grenzen.
Ein unabhängiges Abschlussreview bleibt enthalten. Alternative ist Subagent-driven
mit frischem Implementierer und Reviewer je Aufgabe, höherem Prüfaufwand und
zusätzlichen Kontextkosten.

Nach Nutzerprüfung dieses Plans und Wahl der Methode gilt die freigegebene
Ausführung. Bei Native folgt `superpowers:executing-plans`; bei Subagent-driven
`superpowers:subagent-driven-development`. Produktcode beginnt erst danach.
