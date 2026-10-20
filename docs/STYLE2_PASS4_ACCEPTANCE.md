# Style 2 Pass 4 – Rift, Projektile und Android-Abnahme

Stand: 20.10.2026. Arbeitsbranch `assets/style2-user-towers-1to5-20261020`; PR #51 bleibt Draft. Diese Datei definiert Prüfkriterien, keine bereits durchgeführte Abnahme.

## Ausgangslage

Pass 3 hat elf Turmvarianten bereinigt. Drei Rift-Türme bleiben V1. Die aktive Bildzuordnung besteht aus 30 Varianten; bisherige Chromium-Smoke-Tests ersetzen keinen Android-Langzeittest. Keine Änderung von Save-Keys, Spielbalance oder Upgrade-Sternen.

## Gate A: Rift-Bildkorrektur

- Drei Rift-Türme (L1–L3) einzeln bei 64, 128 und 512 px auf dunklem und hellem Hintergrund prüfen.
- Nur künstliche pinke Keying-Säume entfernen; beabsichtigte violette Magie, Glows und freischwebende Elemente behalten.
- 512×512 RGBA, transparente Außenränder, Bodenanker [256,488], unveränderte Ausrichtung.
- Jede Korrektur als neue versionierte PNG-/verlustfreie WebP-Variante mit SHA-256 und Bounding-Box protokollieren.
- Ohne bestandenen visuellen Vergleich kein automatisches Aktivieren des Overrides.

## Gate B: Projektile und Treffer

- Alle 15 Projektile bei 64 und 128 px prüfen; insbesondere Eis/Magie L2 auf abgesetzte Fremdpartikel kontrollieren.
- 256×256 RGBA, Mittelpunkt [128,128] und bestehende Flugwinkel beibehalten.
- Einschläge pro Turmfamilie als getrennte Effekte entwickeln; keine Änderung an Schadenslogik oder Projektilgeschwindigkeit.
- Fallback muss bei noch ladenden oder fehlerhaften Assets sichtbar bleiben.

## Gate C: Android-Abnahme

- Test auf realem Android-Browser und wenn verfügbar Android-WebView, jeweils Kaltstart und Neustart.
- Je ein kompletter Durchlauf aller sechs Level sowie ein längerer Endloslauf mit vielen Gegnern.
- Bei Bewegung, Turm-Upgrades, Geschossen und Levelwechseln auf leere Frames, Flackern und Sprite-Sprünge prüfen.
- FPS, Framezeiten, JS-Fehler, HTTP-Asset-Fehler und soweit messbar Speicherverbrauch protokollieren.
- Opt-in `?td2UserTowers=1` gegen Opt-out vergleichen; keine Regression des normalen Builds akzeptieren.

## Release-Regel

PR #51 bleibt Draft und wird nicht gemergt oder live veröffentlicht, bevor die Bildprüfung und Android-Abnahme nachvollziehbar dokumentiert sind. Ergebnisse mit Datum, Gerät, Browser/WebView-Version, Build-SHA, Screenshots und Fehlerbeschreibung ergänzen.

## Zwischenpatch: Asset-Manager-Kapazitätsgrenze (20.10.2026)

Der Opt-in-Renderer `dist/style2-user-towers.js` begrenzt jetzt **beide** Bildladepfade: den tatsächlich im Spiel vorhandenen `DenkmalAssets`-Pfad und den eigenständigen `Image`-Fallback.

- Statt der dauerhaft wachsenden Sammelgruppe `td2-user-towers` erhält jede Sprite-URL eine eigene, freigebbare Gruppe `td2-user-tower:<url>`.
- Höchstens 4 gleichzeitig laufende Ladevorgänge und 12 referenzierte Varianten im lokalen Style-2-Manager; laufende Bilder werden nicht zur Platzbeschaffung abgebrochen.
- Fertig geladene, selten verwendete Gruppen werden per `release` freigegeben; beim nächsten Sichtkontakt dürfen sie erneut geladen werden. Vorübergehend zeichnet weiterhin der alte Renderer.
- `tests/style2-manager-pressure.cjs` prüft 30 angeforderte Varianten mit einem asynchronen `DenkmalAssets`-Mock, maximal vier gleichzeitigen Ladevorgängen und LRU-Freigaben. Der Test wurde vor dem GitHub-Commit lokal erfolgreich ausgeführt; die komplette GitHub-CI-Abnahme steht separat.
- Der opt-in-JavaScript-Cache-Key ist `user-towers-5`. Keine Änderungen an Grafikpixeln, Kampf- und Save-Keys oder an den alten Builds.

**Achtung:** Cache-Limits sind noch kein Nachweis der Flackerfreiheit. Die echte Android-/WebView-Abnahme aus Gate C bleibt erforderlich.

## Zwischenpatch: fünf prozedurale Trefferfamilien

**Stand: 20.10.2026, vor Android-Abnahme.** Der opt-in `UserStyle2Towers`-Adapter zeichnet jetzt getrennte Canvas-Einschläge für `bow`, `cannon`, `mage`, `rift` und `boomerang`:
Bogen-Funken, Kanonen-Druckwelle, Eis-Kristallsplitter, violette Rift-Arcs und Bumerang-Schnittbögen.

- Alle Effekte berücksichtigen L1–L3 und die reduzierte Grafikqualität; keine neuen Grafikdownloads oder zusätzlichen Sprite-Caches.
- `DenkmalCombatFX.burst` legt bei aktivem Opt-in höchstens **einen** neuen Treffer-Particle pro Einschlag an, statt den entsprechenden älteren Spezialeffekt zusätzlich zu erzeugen. Die bisherigen Partikelringe/Funken, Schadenswerte und Geschossbewegungen bleiben erhalten.
- Bei abgeschaltetem Opt-in sind der bisherige Trefferpfad und die alten Grafiken unverändert aktiv.
- `tests/style2-impact-pass4.test.cjs` umfasst fünf Familien, je drei Level und zwei Grafikmodi sowie Canvas-Restore bei Zeichenfehlern und die bestehende 240-Partikel-Grenze. Der Test ist im GitHub-Workflow enthalten.
- `combat-fx.js` hat Cache-Key `v400a6s2t5`, `style2-user-towers.js` `user-towers-6`; Cache-Key- und Renderer-Regressionen wurden angepasst.
- GitHub-CI für Commit `c2c4e8c703b62cb031a4fb69c0e6492012f4a62b`: [Push-Test bestanden](https://github.com/imbaaalanced-dot/a/actions/runs/39449848562) und [PR-Test bestanden](https://github.com/imbaaalanced-dot/a/actions/runs/39449853440).

**Nicht erledigt:** Die drei originalen Rift-Turmgrafiken wurden noch nicht bildlich korrigiert. Die neuen Treffer sind prozedural, keine bearbeiteten PNG-/WebP-Master. Vor Freigabe fehlen visuelle Abnahme auf echten Screens sowie realer Android-Browser-/WebView-Test bei vielen Gegnern.
