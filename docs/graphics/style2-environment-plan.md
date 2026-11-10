# Denkmal TD2 V5 — Style-2 Environment Masterplan

Basis: [Level-Umgebungs-Audit](level-environment-audit.md) · `main`-SHA bei Planbeginn `bbe0a46296de194c6de0e9ed8c758494609ad175`.

## Zielbild / Style-Lock

**Graphic Dark Fantasy Illustration** in der vorhandenen 2.5D-/Canvas-Kamera. Materialien: verwitterter Bruchstein, dunkle Erde, moosiger Waldboden, historische Pflasterung, altes Holz, Bronze, zurückhaltende Goldkanten. Warmes Licht von links oben wie `ART-DIRECTION.md`, satte Schatten, klare Lane- und Bauplatz-Silhouetten.

**Historische Identität behalten:** Kirchende, Dorfkirche/Löwe, Hohensyburg, Goethestraße und Westhofen behalten ihre referenzbezogenen Denkmäler und vorhandene Gebäudefußpunkte. Keine erfundenen historischen Details als Tatsachen darstellen. Bilder nie ohne Sichtprüfung, Alpha-/Pivot-Check und konkreten Loader-Verweis ersetzen.

## Phasen und eigentlicher Codex-Arbeitsauftrag

### 0. Referenz-Baseline sichern (P0)
- Aktuellen `main`-SHA und offene PRs prüfen; jeden Patch von aktueller, sauberer Basis ableiten.
- Für Level 1–7 reproduzierbare Bildschirmaufnahmen im gleichen Hochformat, Zoom, Grafikmodus und Kamerapunkt erzeugen; beim Start, Wegkreuzungen, Denkmal, Waldrand, Turmbauplätzen.
- Bestehende Grafik-/Regressionstests sowie tatsächliche Browser-Checks als Baseline ausführen; Altfehler dokumentieren.
- Kein Merge während der Bestandsaufnahme.

### 1. Shared Terrain + Roads (P0)
- `dist/terrain-polish.js`, `dist/style2-maps.js` und die `createGround`-Funktionen von Level 5–7 auf Material- und Übergangskonsistenz prüfen.
- Ein **visuelles** Wegmaterialsystem vorbereiten (Erde, Schotter, historisches Pflaster/Platten, Parkweg), mit Wegkern, weichem Saum, Moos/Steinsplittern. Ausnahmslos die vorhandenen `layout.paths` rendern, keine Geometrie neu erfinden.
- Für Steintreppe/Terrassen/Grünzüge lokal kontrollierte Variationen vorsehen. Keine sichtbaren Tile-Nähte oder zu hellen Sandstreifen.
- Alle Bodenpässe cachen und nur bei Level- oder Assetwechsel neu aufbauen; keine Bilderzeugung pro Frame.
- Pilot auf einem Level mit vorhandenen Referenzen testen, erst dann auf weitere Level ausrollen.

### 2. Shared Vegetation (P1)
- Bestehenden `environment-atlas-style2-v1.webp` und `forest-crowns.js` gegen die reale Pixelgröße, Kanaltransparenz und Bodenanker prüfen.
- Visuelle Familien: knorrige Eiche/Buche, Tanne, toter Baum, Busch, Farn, Wurzel, umrankter Fels und Moos. Unterschiede müssen im Android-Zoom erkennbar bleiben.
- Saatbasierte, stabile Verteilung statt zufälliger Positionen pro Frame. Freizonen anhand von `DenkmalLevels.pathDistance`, `slots`, `gates` und historischen Monumentflächen einhalten.
- Kronenüberdeckung von Held/Gegnern testen; Baumstämme/Wegränder dürfen keine Gegner oder Tower-Slots verdecken.
- Neue WebP-Dateien nur nach optischer Abnahme, Größen-/Alpha-/Pivot-Prüfung und erfolgreicher Laufzeitdekodierung übernehmen.

### 3. Levelbezogene Endabnahme (P1)
- **1 Einleitung:** festliche Steinwege, sanfte Übergänge zum Wald, klare vier Zufahrten.
- **2 Labyrinth:** variierte Hecken, Pflasterkanten; Gegnerroute trotz dichtem Bewuchs lesbar.
- **3 Kirchende:** Wald-, Wurzel- und Monument-Referenzpilot, abwechslungsreiche Bäume, optisch verwachsene historische Wege.
- **4 Dorfkirche:** Kirchhofpflaster, Friedhofsrand, Gebäudesockel, Baum- und Mauerschatten.
- **5 Hohensyburg:** Stein-Terrasse, Fels- und Waldübergänge, Treppen und Denkmal.
- **6 Goethestraße:** Stadtpark/Blumenbeete, alte Straßenkante, Waldzugänge, gutes Luftlane-Feedback.
- **7 Westhofen:** Pflaster und Grünstreifen, Straßensaum, Bushaltestelle und Denkmal-Sockel; vorhandenen PR #186 respektieren.

### 4. QA, Ressourcen und Freigabe
- Automatisch: `node --test tests/style2-maps.test.cjs tests/terrain-polish.test.cjs tests/style2-environment-coherence.test.cjs tests/environment-style2-pilot.test.cjs tests/style2-ground.test.cjs tests/westhofen-style2-art.test.cjs`; zusätzlich komplette bestehende Test-Suite gemäß tatsächlich vorhandenem Repo-Workflow.
- Browser: existierende `tools/verify-style2-environment-pilot.cjs` und `tools/verify-level{4,5,6,7}-style2-environment.cjs`, erforderliche Screenshots und Console-Fehler prüfen.
- Android 4 GB: reale Hardware-Abnahme getrennt von Touch-Emulation; stabiler Input, kein grober FPS-Einbruch, keine späten Decodes oder unerklärte Frame-Stops. Vergleichbare FPS/Memory-Messungen dokumentieren.
- Animationen, Projektile, Helden-Atlanten, Spawns, Bauplätze und Speicherstände unverändert lassen.
- Nur geprüfte, atomare PRs; `main` erst nach CI, Screenshotvergleich und notwendigen Realgerät-Abnahmen mergen.

## Kleinste direkt ausführbare Arbeitspakete

| Reihenfolge | Entwicklungs-PR | Abnahme |
| --- | --- | --- |
| A | Lesbarer Audit + Style-Lock + reproduzierbare visuelle Baseline | Dateipfade, Screenshot-Quellen, bestehende Tests und Risikoliste liegen vor |
| B | Shared Wegmaterial-Pilot auf Level 3, ohne Layoutänderung | Vorher/Nachher und unveränderte Wegkoordinaten, Null Build-Slot-Regression |
| C | Vegetationsatlas-/Bodenanker-Pilot auf Level 3 | RGBA, Atlas-Framing, 64/128px, Überschneidungen und Fallback funktionieren |
| D | Level 1/2 + 4/5 + 6/7 in getrennten kleinen Patches | alle sieben Karten im identischen Stil, dokumentierte Screenshots |
| E | Gesamtoptimierung und finales Mobile-QA | sämtliche vorhandenen Tests sowie physische 4-GB-Android-Abnahme |

## Verbotene Abkürzungen

Nicht alle Assets auf Verdacht löschen. Keine komplette Welt als einzige neue 3072px-Bitmap pro Frame. Keine unkontrollierten Schatten-/Partikelschichten. Kein fremdes Gameplay-Refactoring. Kein pauschales `Math.random()` in Draw-Schleifen. Fehlende Bildgenerator-Anbindung als Blocker markieren, nicht Provisorien als endgültiges Art-Paket ausgeben.

## Berichtsformat pro PR

Basis-SHA, geänderte Dateipfade, Screenshot-Vergleich, neue Asset-Maße/Formate, Renderer-/Loader-Pfade, Testbefehle mit echten Ausgaben, Mobile-Beobachtungen bzw. klarer Hinweis `nicht geprüft`, bekannte Restrisiken und Merge-Entscheidung.
