# TD2 Style 2 – Nutzer-Turmset 1–5: reproduzierbare QA

**Stand:** 2026-10-20 · **Branch:** `assets/style2-user-towers-1to5-20261020` · **PR:** #51 (Draft).
**Grundlage:** Vom Nutzer freigegebene Original-Atlanten `86485.png` und `86488.png` und das archivierte Exportpaket `TD2_Style2_Towers_1to5_Export_V1.zip`.

## Lokal tatsächlich geprüft

1. Das ZIP wurde geöffnet und **30 Sprite-Definitionen** im `manifest.json` gezählt: 15 `tower`, 15 `projectile`.
2. **15 Turm-PNGs** sind 512×512 Pixel in RGBA. **15 Projektil-PNGs** sind 256×256 Pixel in RGBA. Die gleichnamigen **30 WebP** wurden dekodiert und sind **pixelidentisch** zu den PNG-Mastern.
3. Für **alle 30 Sprites** wurden mittels Alpha-Bounding-Box alle Außenränder geprüft: Kein Sprite besitzt einen sichtbaren Pixel am äußeren 512×512- bzw. 256×256-Canvasrand (>16 Alpha).
4. Die Originalquellen und das im ZIP liegende Python-Exportskript wurden erneut ausgeführt: **Alle 60 exportierten PNG-/WebP-Dateien sind bytegenau identisch** zum vom Nutzer akzeptierten ZIP. Lauf: `python tools/export_td2_towers.py --source /mnt/data --output /mnt/data/td2_validation/rebuild`, anschließend SHA-/Byte-Vergleich aller Dateipaare. Achtung: Das im ZIP verwendete Skript heißt `export_td2_towers.py`; auf dem GitHub-Branch liegt eine kompakte Reproduktion als `tools/export_user_style2_towers.py`. Für diese kompakte Fassung wurde **keine** eigene bytegenaue Reproduktionsprüfung durchgeführt.
5. Die 60 Einzeldateien umfassen **2.249.599 Bytes PNG** plus **1.476.344 Bytes WebP** (ohne die Originalatlanten). Die gesamte gleichzeitige RGBA-Decodierung der 30 Runtime-Sprites würde ca. **18,75 MiB** Bilddaten beanspruchen, ohne GPU-Overhead. Im Spiel nur benötigte Bilder verwenden.

## Beobachtete Qualitätsgrenzen

- Das exportierte Quellmaterial enthält farblich stark magentafarbene Pixel, insbesondere in Rift-Sprites. Da die Riftmagie absichtlich violett ist, kann ein Farbfilter diese Pixel **nicht** pauschal als Artefakte behandeln.
- Die Transparenz an Zell- und Atlasübergängen ist maschinell geprüft; eine optische Sichtprüfung im **bewegten** Canvas-Spiel sowie auf Android steht weiter aus.
- Aus den Originalgrafiken können bereits vor dem Export abgeschnittene Partikel/Glows nicht rekonstruiert werden.
- Die Zuordnung Magie/Eisoptik zu der existierenden `mage`-Verlangsamungsmechanik muss im Spiel auf Verständlichkeit geprüft werden.
- **Keine neuen Einschlag-Animationsframes** wurden durch diesen Export erstellt. Die bisherigen Impacts bleiben zunächst zuständig.

## GitHub-/Rendererstatus

- Auf GitHub PR #51 liegen derzeit nur `tools/export_user_style2_towers.py`, die Übergabedokumentation und **dieses QA-Protokoll**. Die 30 PNGs, 30 WebP-Dateien und das generierte JSON-Manifest existieren **noch nicht im Repository**.
- Der aktive `dist/game.js` zeichnet in `drawTower` zuerst `Style2Cannon` (Kanone), dann `Style2Towers`, danach `ElementalSprites` und Legacy-Fallbacks. Die Bumerang-Projektile laufen über den separaten `drawBoomerangProjectile`-Pfad. `dist/elemental-sprites.js` hat aktuell zusätzliche Projektile für Kanone, Magie und Rift.
- **Integration erst nach Binär-Upload:** Die neue Spritequelle in `drawTower` vor den bisherigen Style-2-Renderer als bevorzugte, vollständig dekodierte Quelle schalten. Wenn sie kalt/fehlgeschlagen ist, ohne Leerframe auf den alten Renderer fallen. Für Projektile den richtigen Pfad einschließlich Bumerang auswählen. Existing Impacts, Stars, Combat und Save-Keys unangetastet lassen.
- Kein Auto-Merge. Keine Bestätigung für Android-Flackerfreiheit, Speicherverbrauch oder FPS. Ein isolierter Preview-Build sowie ein echter Android-Gerätetest sind Abnahmekriterien.

## Upload-Abnahmeliste

| Prüfschritt | Status |
|---|---|
| 30 PNG-Master + 30 verlustfreie WebP exportiert | **lokal bestanden** |
| 60 Dateien reproduzierbar byteidentisch zum ZIP | **lokal bestanden** |
| RGBA, Pixelgleichheit, Bildränder | **lokal bestanden** |
| 60 Binärdateien und Manifest auf GitHub | **offen** |
| Canvas-Renderer und Projectile-Mapping integriert | **offen** |
| Automated Playtests auf Basis des integrierten Builds | **offen** |
| Echter Android-Sicht-/Flackertest | **offen** |

