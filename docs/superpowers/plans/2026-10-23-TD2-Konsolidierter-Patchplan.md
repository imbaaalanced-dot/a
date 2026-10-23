# Denkmal TD2 – Konsolidierter Patchplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die vier gelieferten Konzepte und sieben Bilddateien geordnet zusammenführen und einen begrenzten, überprüfbaren Stabilitäts- und Fortsetzen-Patch vorbereiten.

**Architecture:** Kampagne und Ansturm behalten getrennte Spielzustände und Speicherbereiche. Gemeinsam sind Menü, Gestaltung und Navigation. Ansturm erhält eine versionierte Zustandsserialisierung; Quellfassung und veröffentlichte Kopie werden synchron gehalten.

**Tech Stack:** Bestehendes JavaScript/HTML/CSS, Canvas, Browser-Speicher, Node-Testläufer und bestehende GitHub-Pages-Pipeline. Keine neue Engine oder Framework-Migration.

**Spec:** Abschnitt „Bereinigte Produktspezifikation“ dieses Dokuments; Originalkonzepte vollständig im Anhang. Zusätzlich abgeglichen: TD2-Patchkonzept-Leitfaden-2026-10-23.md, Version 1.3 / Dateiversion 3.

Stand: 23.10.2026. Dokumente inhaltlich zusammengeführt; keine Quellcodeänderung, kein Git-Merge, kein neuer Build. Dieser Plan ersetzt konkurrierende Vorgaben der vier Anhänge als Arbeitsgrundlage. Die Originaldateien bleiben als Quellen erhalten.

## Globale Vorgaben

- Android mit 4 GB RAM und Desktop; Hoch- und Querformat.
- Style 2: Graphic Dark Fantasy, isometrische 2.5D; keine Vermischung mit Top-down-Pixelsprites.
- Marcel und Kim anhand bestätigter Referenzen erkennbar halten.
- Ansturm: zentrales Denkmal, Gegner von allen vier Rändern, keine Helden und keine Spawnportale.
- Kampagne: Ausrüstung ausschließlich bei Bossen; beide Helden dürfen das gemeinsame Mischsystem nutzen.
- Separater Entwicklungszweig; PR #51 unverändert. Kein automatischer Merge nach main.
- „Alles mergen“ bezieht sich hier auf das beigefügte Material. Unbenannte PRs werden nicht pauschal zusammengeführt.
- Alte Speicherdaten erhalten. Keine Zinswirtschaft, neue Währung oder globale Talentbaum-Migration in diesem Patch.

## 1. Geprüfter Ausgangspunkt

GitHub PR #56 ist offen und nicht gemergt. Gelesener Head: `e0e44f08dad15d155474bd2a30370270e81de2a0`, Branch `feature/td2-ansturm-integration-20261023`; Basis-Commit laut PR `52a9775e38f5d9e123499640f958b75da6210da0`.

Quelle: https://github.com/imbaaalanced-dot/a/pull/56

Gelesen wurden PR-Diff/Dateiliste sowie `ansturm-alpha1-5/model.js`, `storage.js`, `render.js` und `package.json` am genannten Head. Das README von main beschreibt noch Alpha.5 und reicht nicht als aktueller Funktionsnachweis.

| Bereich | Nachweis / Konsequenz |
|---|---|
| Menü | Neue SVG-Auswahlbanner für Marcel/Kim und Menütests vorhanden; optische Qualität und tatsächliches Deployment in dieser Prüfung nicht bestätigt. Bestehende Arbeit übernehmen, nicht erneut ersetzen. |
| Ansturm-Portale | Im gelesenen Renderer keine Portal-Zeichenroutine; vier Gate-Einträge verbleiben im Assetmanifest. Nur nach Referenzprüfung aus dem Ansturm-Ladeumfang entfernen. |
| Spawns | `spawnEnemy` rotiert durch vier Ränder; Boss alle fünf Wellen. |
| Speichern | `storage.js` besitzt nur `readRecord` und `saveRecord`. Kein Durchlauf-Fortsetzen. |
| Kampfdaten | `createGame` enthält Gold, HP, Schild, Welle, Techs, Upgrades, Gegner und Zeitgeber. `random` ist eine Funktion und darf nicht JSON-serialisiert werden. |
| Waffen | Sieben vorhandene Upgrades, jeweils drei Stufen; keine bestätigte Drei-Waffen-Begrenzung. |
| Gegner | Mehrere Typen und vier Bossmotive; im gelesenen Modell überwiegend unterschiedliche Werte statt eigener Bossfähigkeiten. |
| Tests | Testskript `npm test --prefix ansturm-alpha1-5` vorhanden. In diesem Auftrag keine Spieltests ausgeführt; frühere Erfolgsmeldungen gelten nicht als Test dieses Heads. |

Der ältere Leitfaden nennt Head `40d177…`. Diese Angabe ist für den aktuellen Entwicklungsstand überholt. Die dortige Testadresse wird hier nicht als neu geprüft ausgegeben.

## 2. Bereinigte Produktspezifikation

### Menü und Inventar

Hauptmenü: **Spielen**, **Helden & Ausrüstung**, **Optionen**. Unter Spielen: Kampagne und Denkmal-Ansturm. Endlos ist eine Zusatzoption freigeschalteter Kampagnenkarten. Portalreise bleibt aus der regulären Auswahl entfernt; alte Daten bleiben erhalten.

Marcel links, Kim rechts, beide zum Zentrum. Ausgewählter Held mit goldener Kontur, anderer Held grau; Name und Auswahlzustand zusätzlich als echter Text. Dunkler Stein, Eisen, matte Bronze und kaltes Laternenblau. Texte/Buttons nicht in die Hintergrundgrafik einbrennen. Touchflächen mindestens 44 CSS-Pixel. Hochformat-Shop ein-/ausblendbar, Querformat ohne verdeckte Kernaktionen.

Inventar bleibt in diesem Patch funktional erhalten. Geplanter Folgeausbau: klare Trennung von angelegter Ausrüstung und Rucksack, Vergleich vor Austausch, eindeutige Werte, unveränderte Item-IDs und Exportmöglichkeit. Keine neue Drop-Tabelle ohne Migrationstest.

### Ansturm-Fortsetzen: verbindlicher Patchvorschlag

- Neuer Schlüssel `td2.denkmalAnsturm.run.v1`; bestehender Rekordschlüssel unverändert.
- Vollständiger Gameplay-Snapshot während laufender Welle oder Baupause, einschließlich Gegner, HP, Schild, Käufe und Zeitgeber. Kosmetische Effekte werden nicht gespeichert.
- Speichern nach erfolgreichen Käufen, an Wellenübergängen, bei `visibilitychange` nach verborgen, bei `pagehide` und vor bestätigter Rückkehr ins Menü. Während aktiven Spiels höchstens alle fünf Sekunden zusätzlich sichern; niemals pro Frame.
- Fortsetzen stellt den gespeicherten Zustand wieder her und startet ausdrücklich pausiert. Kein Offline-Fortschritt, keine Heilung für vergangene Realzeit, keine Nachholsimulation.
- Neue Runde löscht vorhandenen Snapshot erst nach Bestätigung. Niederlage entfernt den Snapshot und erhält den Rekord.
- Bei beschädigtem oder unbekanntem Format verständliche Meldung und neuer Start möglich; keine stillschweigende Kampagnenlöschung.
- Wenn Speichern blockiert ist, Spiel weiter nutzbar halten und sichtbar melden: „Fortsetzen kann auf diesem Gerät gerade nicht gespeichert werden.“
- Modell-Status bleibt `running` oder `intermission`; Pause ist UI-Zustand. Dadurch bleibt `step` unverändert verwendbar.
- Wiederherstellen vergibt kein Gold und ruft weder `startGame` noch `nextWave` auf. Aktuell existiert im gelesenen Ansturm-Modell kein separater Wellenbonus; keiner wird für diesen Patch ergänzt.
- Zufall wird nach Laden frisch injiziert. Gleiche künftige Zufallsfolge ist kein Ziel; bereits gespawnte Gegner bleiben identisch.

### Zusammenführung der vier Turmideen

Die vorhandenen sechs Kampagnenrollen aus der Projektvorgabe bleiben Leitlinie. Ihre vollständige aktuelle Implementierung ist hier nicht auditiert.

| Alter Entwurf | Bereinigte Entscheidung | Zeitfenster |
|---|---|---|
| Äther-Säule: 100 Gold, Doppelziel, +30 % Reichweite, Krit-Schockwelle | Einzelziel-/Durchschlag-Idee gegen vorhandenen Bogenturm/Riftlanze prüfen. Keine zusätzliche Turmklasse nur durch Umbenennung. Alte Preise sind ungetestete Vorschläge. | Kampagnen-Pilot |
| Blauflamm-Becken: 175 Gold, DoT, Slow, −15 % Rüstung, Verwirrung | DoT als eigener Schwerpunkt; nicht gleichzeitig Schaden, Slow, Rüstungsbruch und Verwirrung in einem Basis-Turm bündeln. Gegen Kanone/Eissturm abgrenzen. | Kampagnen-Pilot |
| Chrono-Obelisk: 225 Gold, Buff, 20 % Slow, 10 % Extraangriff | Unterstützung zunächst als begrenzte Synergie testen. Extraangriffe dürfen keine rekursiven Proc-Ketten erzeugen. | Spätere Balanceprüfung |
| Portal-Bastion: 350 Gold, Barriere, Schild, Verkaufs-/Zerstörungsexplosion | Als „Wächter-Bastion“ nur in einem Kampagnen-Maze-Prototyp weiterführen. Keine Portale im Ansturm. Verkaufsbetäubung verwerfen, um Kauf-/Verkaufs-Schleifen zu vermeiden. | Separater Maze-Patch |

Keine der vier Klassen wird mit diesem Stabilitätspatch neu eingebaut. Die Ideen bleiben vollständig im Anhang erhalten.

### Marcel-Fähigkeiten: bereinigtes Backlog

Das Avatar-Dokument beschreibt Marcel, nicht automatisch Kim. Kim erhält keine ungeprüfte Kopie des gesamten Skillsets.

| Fähigkeit | Übernahme / Konfliktauflösung |
|---|---|
| Laternen-Einschlag | Kampagnen-Prototyp: 12 s Cooldown, 3,5 s Effekt, 40 % Slow als Startwerte. Formel 85 + 25 × Level + 0,6 × Magiekraft nur nach Abgleich mit realem Schadensmodell. Kein Ansturm-Skill. |
| Äther-Schutzschild | Widerspruch 20 % Max-HP versus 150 + 40 × Level auflösen: vorgeschlagen 20 % Max-HP, 5 s, 18 s Cooldown. Keine additive zweite Formel. Türme nur schützen, wenn sie tatsächlich ein Schadens-/HP-System besitzen; Projektilreflexion separat zurückstellen. |
| Chrono-Blitz | 8 s als Prototyp. Durch Gegner erlaubt, nicht durch unpassierbare Weltgeometrie; Zielpunkt muss begehbar sein. Feuerspur erst nach Performanceprüfung. |
| Wächter des Denkmals | +15 % als Testwert ausschließlich in klar sichtbarem Denkmalradius; nicht zusätzlich unsichtbare Kreuzungsboni stapeln. |
| Blaues Irrlicht | Bonus maximal +20 %, ausdrücklich nur für den aktuellen Durchlauf, nicht dauerhaft über Spielstarts. Vor Umsetzung konkrete Zuwachsrate und Economy-Verträglichkeit messen. |
| Orakel des Portals | In „Denkmal-Resonanz“ umbenennen; kein Spawnportal. 60 s / 8 s Verstärkung nur als Konzeptwerte. Globaler Pull und 2-s-Boss-Stun nicht ungeprüft übernehmen; Bossresistenzen und Lesbarkeit zuerst. |

Keine neuen Talentpunkte, Magiekraftwerte oder Ressourcen erfinden, nur um die alten Formeln unverändert einzubauen.

### Maze, Karten und Gegner

Reale regionale Denkmäler bleiben Kern der Kampagne. „Ewige Säulenhallen“, 24 × 16 Raster und zehn Wellen sind ein optionales Testlevel, kein Ersatz für Kirchende, Ender Dorfkirche, Hohensyburg oder Goethestraße.

Maze-Prototyp nur auf einer Kampagnenkarte: vor jeder Bauaktion für jeden aktiven Eintritt einen erreichbaren Weg zum Ziel nachweisen. Blockierender Bau wird ohne Goldabzug abgewiesen; Abbruch/Rückerstattung atomar. Kein Platzieren auf Gegnern, Denkmal oder Spawnzonen. Dash muss dieselben Weltgrenzen beachten. Das gilt nicht als Baupflicht im Ansturm.

Wellen 1–3 als Einführung, 4–7 als Flankenversuch und Boss als Abschluss sind Dramaturgieideen. Mehr Schwierigkeit durch Rollen und Kombinationen, keine pauschale Verdreifachung leerer Wartezeit. Phasengänger, Hexer und Belagerer später jeweils mit sichtbarer Ankündigung, Gegenmaßnahme und begrenzter Wirkung. Bestehende Gegner zuerst mechanisch differenzieren.

### Wirtschaft, Meta und Lore

Gold, Denkmal-HP und bestehende Belohnungen erhalten. Seelenfeuer/Äther, Zinsen, Frühstartboni und drei permanente Talentpfade bleiben getrenntes Backlog; keine Mehrfachwährungen im nächsten Patch. Pfade Licht/Architektur/Zeit können später unterschiedliche Spielstile abbilden. Story, Minimap und Bodenboni kommen erst nach funktionaler und mobiler Abnahme. Pfadvorschau hat für Maze Vorrang vor einer zusätzlichen Minimap.

## 3. Bereinigter Grafikkatalog

Alle sieben Dateien visuell in einer Kontaktübersicht geprüft; Maße und SHA-256 ermittelt. Keine byteidentischen Doppeldateien gefunden. Ähnliche Motive sind Varianten und werden nicht gelöscht.

| Quelldatei | Maße | Einordnung |
|---|---|---|
| marcel_true_topdown.png | 2240 × 1120, RGBA | Vier Ansichten, Top-down/Pixelstil; Referenzarchiv, kein Ersatz für Style-2-Live-Sprites. |
| marcel_topdown_transparent.png | 1600 × 1600, RGBA | Einzelmotiv mit Kapuze; Stil-/Ausrüstungsreferenz, nicht identisch mit Cap-Variante. |
| 834392760_1442213927344088_3014541429294144140_n.webp | 1280 × 1904, RGB | Marcel mit Cap und blauer Laterne; brauchbare Motivreferenz, kein freigestelltes Laufasset. |
| 836438576_1417275447160210_391588387467787853_n.webp | 1600 × 1600, RGB | Vier Logoentwürfe auf einer Tafel; nicht als fertiges einzelnes Logo importieren. |
| 836918978_2407149409693980_8922459360205257372_n.webp | 2048 × 1152, RGB | Älteres Menü mit eingebrannten englischen Buttons, Soloheld und Portal; ausschließlich Atmosphärenreferenz. |
| 834420758_953908607279578_6187576738269369916_n.webp | 1280 × 1904, RGB | Kapuzenportrait mit Portal; alternative Referenz, nicht gleichwertiger Identitätsanker zur Cap-Version. |
| marcel_walk_4x3.png | 1344 × 1792, RGBA | Sichtbar drei Spalten und vier Reihen. Dateiname „4x3“ ist missverständlich; bei Nutzung explizit columns=3, rows=4, Zellen 448 × 448. Laufzyklusqualität und Richtungsfolge noch nicht freigegeben. |

In dieser Lieferung fehlen eine Kim-Referenz und passende komplette Style-2-Kampfzyklen. Keine Kim neu aus Marcel ableiten. Bereits vorhandene bestätigte Referenzen für spätere Produktion verwenden.

Organisation im späteren Repo: Rohreferenzen unter `docs/reference/`, freigegebene Laufzeitassets unter dem bestehenden Assetpfad, Metadaten mit Perspektive, Raster, Anker und Verwendungszweck. Referenztafeln nicht vorladen. Entfernen nur nach Referenzsuche über HTML, CSS, JS, JSON und dynamische Asset-IDs. Archivmaterial nicht in den mobilen Build kopieren.

## 4. Nächster abgeschlossener Patch: „Konsolidierung & Fortsetzen“

Umfang: bestehenden Menü-/Portalstand sichern, obsolete Ansturm-Ladeeinträge bereinigen, Fortsetzen implementieren und mobil abnehmen. Kein gleichzeitiger Turm-, Maze-, Inventar- und Talentbaum-Neubau.

### Review-Fokus

1. Beschädigte, zukünftige oder numerisch ungültige Saves müssen kontrolliert abgewiesen werden (Task 2).
2. Laden während einer Welle darf Gegner, Gold, Käufe oder Spawnfortschritt nicht duplizieren (Task 2/3).
3. Tabwechsel und Querformatwechsel dürfen keine laufende Simulation hinter einem Dialog erzeugen (Task 3/5).
4. Fehlende Grafik oder langsames Laden darf weder unsichtbare Gegner noch einen hängenden Start verursachen (Task 1/5).
5. Buildkopie und Quelle dürfen nicht auseinanderlaufen; alte Kampagnenstände bleiben unverändert (Task 4/5).

### Task 0 – Basis sichern

- [ ] Aktuellen PR-Head erneut prüfen; bei neuem Head Delta zu oben gelesenem Commit dokumentieren.
- [ ] Separaten Branch `feature/td2-consolidation-resume-20261023` vom geprüften Integrationsstand erstellen; PR #56 und #51 nicht überschreiben.
- [ ] Bestehende Tests ausführen und Ergebnis als Ausgangslage dokumentieren. Fehler vor neuen Änderungen zuordnen.

### Task 1 – Menü und Ladeumfang abschließen

**Dateien:** bestehende `dist/index.html`, `dist/menu.css`, `dist/game.js`, `dist/preloader.js`; Ansturm `asset-manifest.js`, `assets.json`, `sprites.js`, `render.js` unter `ansturm-alpha1-5/`. Tests: bestehende Menütests; neu `tests/ansturm-no-portals.test.cjs`.

**Vertrag:** bestehende Heldenauswahl und Navigation erhalten; kein neues API. Gate-IDs aus Ansturm-Ladeumfang entfernen, wenn Referenzsuche keine Nutzung bestätigt. Gemeinsame historische Kartenassets nicht löschen.

- [ ] Test ergänzen: Renderer/Ladeumfang enthält keine Ansturm-Gate-IDs; Randspawns funktionieren weiterhin auf vier Seiten.
- [ ] Test vor Änderung ausführen; gegen verbleibende Manifest-Einträge muss er fehlschlagen.
- [ ] Nur ungenutzte Ansturm-Referenzen entfernen; gewählte Heldengrafik plus Textzustand auf beiden Auswahlzuständen prüfen.
- [ ] Menütests und Ansturmtests ausführen; bei fehlenden Bildern bleibt vorhandener Canvas-Fallback sichtbar.
- [ ] Eigenen Commit für diese Bereinigung erstellen.

### Task 2 – Versionierter Durchlaufzustand

**Dateien:** neu `ansturm-alpha1-5/run-state.js`, neu `ansturm-alpha1-5/tests/run-state.test.js`; bestehende `model.js`, `config.js`, `storage.js` als Datenbasis.

**Interfaces (neue Vorschläge):** `serializeRun(state): string`; `deserializeRun(raw, {random}={}): {ok:true,state}|{ok:false,reason}`. JSON-Hülle `{version:1,state:{...}}`. Kein Speichern von Funktionen/DOM/Canvas.

Allowlist: gold, hp, shield, wave, kills, elapsed, status, tech, upgrades, enemies, nextId, waveElapsed, spawned, planned, spawnClock, fireClock, intermission, lastDamage. Gegnerfelder anhand des vorhandenen Modells. `effects`/`projectiles` nach Laden leer; aktuell sind Treffer im Modell unmittelbar, die sichtbaren Projektile kosmetisch.

Validierung: nur laufende Welle/Baupause; endliche Zahlen; nichtnegative Ressourcen/Zeitwerte (lastDamage darf negativ sein); sichere ganzzahlige Zähler; erlaubte Typ-/Upgrade-IDs; Upgrade-Level 0–3; vollständige Tech-Schlüssel; `spawned <= planned`, eindeutige Gegner-IDs, `nextId` größer als alle IDs, HP/Schild innerhalb aus Techs berechneter Grenzen. Ungültiges Format ablehnen statt teilweise blind übernehmen. Neue Modellfelder erfordern Schema-/Testanpassung.

- [ ] Roundtrip-Test für laufende Welle mit beschädigtem Gegner, Burn/Slow, gekauftem HP und Tesla schreiben; alle Gameplayfelder müssen gleich bleiben.
- [ ] Tests für defektes JSON, Version 2, fehlende Techs, negative Goldwerte, doppelte IDs und Upgrade-Level 4 schreiben.
- [ ] Tests rot ausführen: `node --test ansturm-alpha1-5/tests/run-state.test.js`.
- [ ] Allowlist-Serialisierung und validierte Wiederherstellung implementieren; `createGame({random})` liefert Standardstrukturen, keine Start-/Wellenfunktion aufrufen.
- [ ] Tests grün ausführen und committen.

### Task 3 – Speicher und Fortsetzen-Dialog

**Dateien:** `ansturm-alpha1-5/storage.js`, `app.js`, `index.html`, `styles.css`; neu `tests/run-storage.test.js` und `tests/resume-flow.test.js` in diesem Unterprojekt.

**Interfaces:** `saveRun(storage,state): boolean`; `readRun(storage,options): {ok:true,state}|{ok:false,reason}`; `clearRun(storage): boolean`. Ein einzelner Schlüssel verhindert auseinanderlaufende Teilstände. Fehler aus getItem/setItem/removeItem abfangen. `readRecord`/`saveRecord` unverändert.

- [ ] Speichertest für blockierten Speicher, Roundtrip und unveränderten Rekord/Kampagnenschlüssel schreiben und rot ausführen.
- [ ] Funktionen mit Task-2-Serialisierung implementieren.
- [ ] UI-Tests: Fortsetzen ist pausiert; Abbrechen von „Neuer Durchlauf“ erhält Save; Bestätigen löscht ihn; Niederlage invalidiert ihn; Laden gibt kein Gold und startet keine neue Welle.
- [ ] Fortsetzen-/Neustartaktionen und Speicherereignisse wie in Abschnitt 2 einbauen. Beim Laden `prev=0`, `acc=0`, `lastKills=state.kills`, manuelle Pause setzen; Speichern vor Ortswechsel durchführen.
- [ ] `visibilitychange`/`pagehide` und Fünf-Sekunden-Sicherung ergänzen; keine Simulationszeit im Hintergrund nachholen. Speicherfehler sichtbar anzeigen.
- [ ] Beide neuen Testdateien und gesamte Ansturm-Suite grün ausführen; committen.

### Task 4 – Build und isolierte Vorschau

**Dateien:** entsprechende `dist/ansturm/`-Dateien; neu `tests/ansturm-source-parity.test.cjs`; eigener Preview-Workflow für neuen Branch, ohne bestehenden PR-Workflow zu überschreiben.

- [ ] Paritätstest für alle Laufzeitdateien einschließlich neuem `run-state.js` schreiben. Quellen und Deploykopien müssen bytegleich sein.
- [ ] Dateien synchronisieren; neue Module im Build und Cacheversionen berücksichtigen.
- [ ] Preview-Workflow auf neuen Branch und exklusiven Pfad `td2-consolidation/` begrenzen. Das ist ein geplanter Pfad, noch keine existierende Testadresse.
- [ ] Gesamte Regression ausführen; nur bei Erfolg committen und Vorschau veröffentlichen.

### Task 5 – Abnahme und Patchbericht

- [ ] `npm test --prefix ansturm-alpha1-5`
- [ ] `for test in tests/*.test.cjs; do node "$test" || exit 1; done`
- [ ] `TEST_MOBILE=1 node tests/game.test.cjs`
- [ ] `python tests/assets.test.py`
- [ ] Browser: 360×800, 412×915, 800×360 und Desktop; Start, Heldenwechsel, Inventar-Rückkehr, Ansturm, Techkauf, Upgrade, Pause, Neuladen, Fortsetzen, Niederlage und Neustart.
- [ ] Echte Android-Abnahme: mindestens 15 Minuten, 1× und 2×, Wechsel Hoch/Querformat und App-Hintergrund; FPS/Frametimes und sichtbare Fehler protokollieren. Ziel: überwiegend mindestens 30 FPS; kein Tababbruch. Ohne echtes Gerät bleibt dieser Punkt offen.
- [ ] Während Belastung maximal vier gleichzeitige Bildladungen bestätigen; fehlendes Asset testen; kein Flackern/fehlender Gegner nach Laden.
- [ ] Erfolgreichen Publish-Workflow und tatsächlichen HTTPS-Pfad prüfen; aktuelle Buildkennung mit getesteter Kennung abgleichen.
- [ ] Patchnotiz mit Commit, Tests, offenen Grenzen und geprüftem Link ergänzen. Kein „fertig veröffentlicht“ bei bloßem Upload-Erfolg.

## 5. Folgepakete in Reihenfolge

| Paket | Enthält | Startbedingung |
|---|---|---|
| Inventar/Bedienung | Rucksack, Vergleich, gemeinsame Ausrüstung, Boss-only-Drops absichern | Stabilitätspatch abgenommen, Save-Schema auditiert |
| Ansturm-Balance | Experiment mit drei offensiven Plätzen; Schild separat; Kauf-/Wechselregeln zuerst spezifizieren | Fortsetzen stabil, Vergleichsläufe vorhanden |
| Gegner/Bosse | Eine Spezialrolle und ein Boss mit angekündigter Fähigkeit | Mindestens zwei brauchbare Waffenaufbauten |
| Kampagnen-Pilot | Eine reale Karte, klare Turmrollen, begrenzte Marcel-Synergie | Aktueller Kampagnencode und Kim-Fähigkeiten geprüft |
| Maze/Meta | Wächter-Bastion, Pfadvalidierung, später Talente/Lore | Pilot beweist Nutzen; eigener Implementierungsplan |

## 6. Definition „fertiger Patch“

Erst fertig, wenn der begrenzte Umfang implementiert ist, Regression und Browserprüfung bestanden sind, Android-Abnahme samt Grenzen vorliegt und der veröffentlichte Build identifiziert wurde. Aktuell fertig: Zusammenführung, Konfliktbereinigung, Grafiksichtung und Patchplanung. Aktuell nicht erledigt: Implementierung, neuer Testlauf und Veröffentlichung.

## 7. Originalquellen – unveränderte Konzepte

Die folgenden Texte sind archivierte Ausgangsideen, keine zusätzlichen Anforderungen. Bei Konflikten gelten die bereinigten Abschnitte oben. Damit bleibt beim Zusammenführen keine Idee verloren.


### Quelle: 01-Turm-Konzepte.md

```markdown
# Turm-Konzepte: Die Bollwerke von Denkmal TD

## Übersicht
Die Türme in **Denkmal TD** basieren auf antiken, magischen Relikten und der architektonischen Macht der Denkmäler. Sie ergänzen den Laternen-Träger taktisch auf dem Spielfeld.

---

## 1. Basis-Turm: Äther-Säule (Aether Pillar)
* **Typ:** Einzelziel-Schaden (Projektil)
* **Kosten:** $100\,\text{Gold}$
* **Beschreibung:** Eine schlanke, beschworene Steinsäule, die kontinuierlich konzentrierte Ätherstrahlen auf den nächstgelegenen Gegner abfeuert. 
* **Upgrades:**
  * **Stufe 2 (Doppelter Fokus):** Feuert zwei Energiestrahlen gleichzeitig auf bis zu zwei Ziele ab.
  * **Stufe 3 (Resonanz-Kristall):** Erhöht die Angriffsreichweite um $30\%$ und lässt kritische Treffer kleine Schockwellen erzeugen.

---

## 2. Flächen-Turm: Blauflamm-Becken (Blue-Flame Brazier)
* **Typ:** Flächenschaden (AoE) & Verlangsamung
* **Kosten:** $175\,\text{Gold}$
* **Beschreibung:** Ein schweres Kohlenbecken, das die blaue Magie der Laterne widerspiegelt. Verbrennt alle Fußsoldaten, die das umliegende Gitter passieren, mit anhaltendem magischen Schaden (DoT).
* **Upgrades:**
  * **Stufe 2 (Sengender Rauch):** Reduziert zusätzlich die Rüstung aller Feinde im Radius um $15\%$.
  * **Stufe 3 (Irrlicht-Herd):** Beschwört kleine Irrlichter, die gelegentlich ausbrechen und Gegner kurzzeitig verwirren.

---

## 3. Unterstützungs-Turm: Chrono-Obelisk (Chrono Obelisk)
* **Typ:** Utility / Buff & Temporale Kontrolle
* **Kosten:** $225\,\text{Gold}$
* **Beschreibung:** Ein verwitterter Obelisk, der die Zeit im Umkreis leicht krümmt. Erhöht die Angriffsgeschwindigkeit und verringert die Abklingzeiten aller benachbarten Türme sowie des Wächters.
* **Upgrades:**
  * **Stufe 2 (Zeit-Anker):** Verlangsamt das Bewegungstempo aller Gegner im Einflussbereich um $20\%$.
  * **Stufe 3 (Ätherische Überladung):** Verleiht angrenzenden Türmen eine Chance von $10\%$, einen Sofortangriff ohne Abklingzeit auszuführen.

---

## 4. Spezial-Turm: Portal-Bastion (Gateway Bastion)
* **Typ:** Blockade & Boss-Kontrolle
* **Kosten:** $350\,\text{Gold}$
* **Beschreibung:** Ein Miniatur-Tor, das physische Barrieren errichtet. Kann direkt auf den Bahnen platziert werden, um Monster aufzuhalten oder sie in bestimmte Engpässe zu zwingen.
* **Upgrades:**
  * **Stufe 2 (Riss-Schild):** Verfügt über ein eigenes Energieschild, das sich nach kurzer Zeit außerhalb des Kampfes regeneriert.
  * **Stufe 3 (Kollaps-Matrix):** Verursacht beim Zerstören oder Verkaufen eine massive Explosion, die alle Einheiten in der Nähe betäubt.
```


### Quelle: 02-Fehlende-Elemente-Roadmap.md

```markdown
# Game Design Roadmap: Was fehlt noch für Denkmal TD?

Um aus den bisherigen Konzepten ein vollständiges Game Design Document (GDD) zu machen, fehlen noch einige zentrale Spielmechaniken und Systeme. Hier ist die Übersicht der wichtigsten Bausteine:

---

## 1. Gegner-Bestiarium (Enemies & Horden)
* **Standard-Gegner:** Fußsoldaten, schnelle Läufer (z. B. *Äther-Hunde*).
* **Spezial-Einheiten:**
  * *Phasen-Gänger:* Können Labyrinthe/Barrieren kurzzeitig ignorieren oder überspringen.
  * *Äther-Hexer:* Schützen andere Gegner mit Schilden oder schwächen nahegelegene Türme.
  * *Belagerungs-Kolosse:* Hohe Lebenspunkte, nehmen weniger Flächenschaden und fokussieren den Abbau von Portal-Bastionen.
* **Boss-Mechaniken:** Eigene Phasen, Fähigkeiten-Ankündigungen (Telegraphed Attacks) und Interaktionen mit dem Wächter.

---

## 2. Wirtschafts- & Ressourcensystem (Economy)
* **Ressourcen:**
  * **Gold:** Wird durch besiegte Gegner und Wellen-Boni gewonnen; dient zum Bau und Upgrade von Türmen.
  * **Seelenfeuer / Äther:** Spezielle Ressource, die durch die Laterne gesammelt wird, um den Wächter aufzuwerten oder ultimative Fähigkeiten auszulösen.
  * **Denkmal-Integrität (HP):** Wie viele durchgebrochene Gegner kann der Schrein verkraften?
* **Wellen-Mechaniken:** Zins-System für aufgespartes Gold, Belohnungen für das vorzeitige Starten der nächsten Welle.

---

## 3. Meta-Progression & Talentbaum (Run-Übergreifend)
* **Permanente Upgrades:** Freischaltbare Boni zwischen den Runden (z. B. höheres Startgold, erweiterte Laternen-Reichweite).
* **3 Talentpfade für den Wächter:**
  * *Pfad des Lichts:* Fokus auf Laternen-Schaden, Auren und Verlangsamung.
  * *Pfad der Architektur:* Fokus auf Turm-Gefechte, reduzierte Baukosten und stärkere Labyrinth-Buffs.
  * *Pfad der Zeit:* Fokus auf Bewegungstempo, Abklingzeit-Reduktion und Chrono-Magie.

---

## 4. UI / UX & User Interface (HUD)
* **HUD-Elemente:**
  * Anzeige der Denkmal-HP, Gold- und Seelenfeuer-Vorräte.
  * Aktive Skill-Leiste mit Abklingzeiten für den Wächter.
  * Mini-Map mit Pfad-Vorschau (Welchen Weg nehmen die Feinde durch das Labyrinth?).
* **Bau-Interface:** Raster-Overlay für gültige Turm-Spots und Angabe der Blockade-Regeln (Gegner dürfen nicht komplett eingesperrt werden).

---

## 5. Lore & World-Building (Story)
* **Hintergrundgeschichte:** Warum existieren die Denkmäler? Wer ist der Wächter mit der Laterne und der Adidas-Cap wirklich?
* **Umgebung & Atmosphäre:** Visuelle Details zu den Ruinen, antiken Schriften und der Magie des blauen Feuers.
```


### Quelle: 03-Avatar-Skillset.md

```markdown
# Character Skills: The Lantern-Bearer (Denkmal TD)

## Overview
**Character Name:** The Warden of the Monument / Lantern-Bearer  
**Theme:** Dark Fantasy / Ruins Guardian infused with modern tactical flair (Adidas Cap & Track Jacket elements)  
**Primary Weapon:** Mystical Blue-Flame Lantern (Area Control & Crowd Control)  
**Secondary:** Relic Blade & Tactical Straps  

---

## Active Skills

### 1. Laternen-Einschlag (Lantern Surge)
* **Cooldown:** 12.0s
* **Range:** Medium-Long (Ground Target)
* **Description:** The Warden hurls his mystic blue-flame lantern to a target area. Upon impact, it shatters temporarily into a swirling vortex of aether, dealing continuous magical damage and slowing all enemies in the radius by $40\%$ for $3.5$ seconds.
* **Scaling:** $Damage = 85 + (Level \times 25) + (0.6 \times \text{MagicPower})$

### 2. Aether-Schutzschild (Aether Ward)
* **Cooldown:** 18.0s
* **Range:** Self / Aura
* **Description:** Channels the ancient energy of the monuments through his cloak. Grants the Warden and nearby allied towers a shield equal to $20\%$ of max health/durability while reflecting projectile attacks back at minor foes for $5$ seconds.
* **Scaling:** $Shield = 150 + (Level \times 40)$

### 3. Chrono-Blitz (Ruin Dash)
* **Cooldown:** 8.0s
* **Range:** Short-Medium (Dash)
* **Description:** A swift tactical repositioning maneuver utilizing pixel-precision movement. The Warden phases through enemies, leaving a trail of blue residual fire that burns passing monsters over time (DoT).

---

## Passive Skills

### 1. Wächter des Denkmals (Monument's Vigil)
* **Description:** Standing close to ancient ruins or path intersections increases the Warden's attack speed and lantern recharge rate by $15\%$. 

### 2. Blaues Irrlicht (Will-o'-Wisp Resonance)
* **Description:** Every time an enemy is defeated within the lantern's aura, a fragment of its soul fuels the lantern, permanently stacking a minor bonus to overall spell penetration and gold generation per wave (up to a cap of $+20\%$).

---

## Ultimate Skill

### Orakel des Portals (Gateway Cataclysm)
* **Cooldown:** 60.0s
* **Range:** Global / Arena-wide
* **Description:** The Warden opens a massive temporary rift mirroring the ancient portal behind him. Swirling blue aether floods the lanes, pulling minor enemies toward the center, stunning major bosses for $2.0$ seconds, and supercharging all active tower defenses with blue-flame ammunition for $8$ seconds.
* **Scaling:** $TotalDamage = 400 + (Level \times 120) + (1.2 \times \text{MagicPower})$
```


### Quelle: 04-Maze-Leveldesign.md

```markdown
# Maze- & Leveldesign: Die Pfade von Denkmal TD

## Übersicht
Das Leveldesign in **Denkmal TD** verbindet klassische Turmverteidigung mit dynamischer Weggestaltung (User-Maze-Building). Die Spielfelder sind antike, verfallene Ruinenstätten, bei denen der Spieler durch geschickte Platzierung von Spezial-Türmen (wie der Portal-Bastion) die gegnerischen Horden lenken kann.

---

## 1. Grundprinzipien des Maze-Designs
* **Erzwungene Umwege:** Gegner (Monster-Horden) spawnen an festen Portalen und versuchen, den zentralen Schrein (das Denkmal) zu erreichen. Spieler können durch Barrieren lange Labyrinthe („Mazes“) errichten, um den Weg zu verlängern.
* **Engpässe (Choke Points):** Strategisch günstige Korridore zwischen antiken Säulen verstärken die Wirkung von Flächenschaden-Türmen wie dem Blauflamm-Becken erheblich.
* **Dynamische Hindernisse:** Bestimmte Bodenplatten im Level (Äther-Risse) gewähren Türmen Boni oder verstärken die Laternen-Aura des Wächters, wenn sie darauf platziert oder in der Nähe bekämpft werden.

---

## 2. Beispiel-Level: Die Ewigen Säulenhallen (Kapitel 1)
* **Thema:** Eine von Efeu überwucherte antike Tempelanlage mit offenen Pfaden und zerbrochenen Marmor-Säulen.
* **Spielfeldgröße:** $24 \times 16$ Rasterfelder.
* **Wellen-Struktur:**
  * *Welle 1–3:* Lineare Angriffe von Fußsoldaten zur Einführung der Äther-Säule.
  * *Welle 4–7:* Splitter-Wellen, bei denen Gegner von zwei Seiten gleichzeitig einrücken; hier kommt das Blauflamm-Becken zum Einsatz.
  * *Boss-Welle (Welle 10):* Ein schwerer Koloss, der die Portal-Bastionen durchbrechen will und den Einsatz des Chrono-Obelisken und der ultimativen Fähigkeit des Wächters erfordert.

---

## 3. Taktische Synergien zwischen Avatar und Level
* **Mobilität nutzen:** Der Wächter (Laternen-Träger) kann dank des *Chrono-Blitzes* (Dash) schnell durch enge Labyrinthe und Mauern phasen, um an Brennpunkten auszuhelfen.
* **Aura-Optimierung:** Da passive Fähigkeiten wie *Wächter des Denkmals* die Angriffsgeschwindigkeit in der Nähe antiker Ruinen erhöhen, lohnt es sich, den Wächter zentral im Labyrinth zu positionieren, wo sich die meisten Türme drängen.
```
