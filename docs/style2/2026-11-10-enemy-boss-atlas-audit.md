# Denkmal TD2 V5 · Gegner- und Bossatlas-Prüfung (10.11.2026)

**Basis:** `main` @ `604a5343b622bcb269729adfa67edbc27b7a928b`

**Arbeitsbranch:** `audit/style2-enemy-boss-atlas-20261110`

**Status:** Pixel-/Manifest-Audit, **keine neuen Runtime-Assets**, kein Engine-/Save-/Wellen-Umbau.

## Technischer Vertrag: drei getrennte Grafikpfade

| Pfad | Tatsächlicher Vertrag | Funktion |
|---|---|---|
| `dist/assets/enemies/walk-v1.webp` | RGBA 640×3360, 4 Spalten × 21 Reihen, 160×160, vier Laufphasen je Skin | Kampagnen-Bewegung und Fallback; **keine** separaten Aktionen |
| `dist/assets/directional-v410/enemy-00.webp` bis `enemy-20.webp` | Je RGBA 512×1536, 4 Spalten × 12 Reihen, 128×128; Attack/Hit/Death × 4 Richtungen × 4 Frames | Kampagnenaktionen über `TD2DirectionalActions`; Feinde werden anhand vorhandener Skins zugeordnet |
| `dist/ansturm/assets/enemy_*.webp`, `boss_*.webp` | Acht Gegner- und vier Boss-**Einzelbilder**, verschiedene Bildgrößen; keine Aktionszellen | Eigenständiger Ansturm-Renderer (`sprite`): ein Standbild je Typ, Boss-Phasen-/Warnhinweise aus Code |

Die **21 Kampagnen-Skins** sind nicht 21 Gegner-KI-Klassen. In der Kampagne werden die Boss-Skins unter anderem aus den Reihen 10, 18, 19 und 20 nach Level gewählt. In Ansturm existieren die vier eigenen Bossbilder *Steinbrecher*, *Sturmherr*, *Schildwächter* und *Koloss*. Ein einzelnes Ansturm-Bild darf nicht als Attack-/Hit-/Death-Atlas eingetragen werden.

## Kampagne: geprüfte 21 Aktionsatlanten

Der neue schreibgeschützte Prüfer `tools/audit-enemy-boss-style2.py` bewertet sichtbare Pixel mit Alpha ≥ 32, nicht bloße RGB-Werte mit Alpha 0. Alle 21 Dateien besitzen 48 belegte Zellen und mindestens 10 px transparenten Zellrand; **21/21 Pixel-Pass, 0 technische Holds**. Die vorhandenen V4.1-Tests sichern zusätzlich Laufzeitmaße, Hashes, vier nicht identische Richtungsblöcke und Zellraster ab.

| Actor | Kleinster sichtbarer Zellrand | Versteckte RGB-Pixel (Alpha 0) | Pixelstatus |
|---|---:|---:|---|
| `enemy-00` | 14 px | 0 | Pass |
| `enemy-01` | 18 px | 0 | Pass |
| `enemy-02` | 10 px | 0 | Pass |
| `enemy-03` | 12 px | 0 | Pass |
| `enemy-04` | 15 px | 11.780 | Pass |
| `enemy-05` | 13 px | 6.529 | Pass |
| `enemy-06` | 12 px | 16.568 | Pass |
| `enemy-07` | 14 px | 19.195 | Pass |
| `enemy-08` | 15 px | 6.202 | Pass |
| `enemy-09` | 14 px | 3.909 | Pass |
| `enemy-10` | 10 px | 0 | Pass |
| `enemy-11` | 15 px | 3.671 | Pass |
| `enemy-12` | 10 px | 40.703 | Pass |
| `enemy-13` | 13 px | 0 | Pass |
| `enemy-14` | 11 px | 6.215 | Pass |
| `enemy-15` | 11 px | 30.502 | Pass |
| `enemy-16` | 13 px | 14.967 | Pass |
| `enemy-17` | 14 px | 15.741 | Pass |
| `enemy-18` (Boss-Skin) | 11 px | 39.602 | Pass |
| `enemy-19` (Boss-Skin) | 15 px | 33.200 | Pass |
| `enemy-20` (Boss-Skin) | 15 px | 27.002 | Pass |

Der gemeinsame Laufatlas besteht die identische Sichtbarkeitsprüfung mit **84/84** belegten Zellen und mindestens **12 px** Rand. Manche Rohansichten zeigen rote, gelbe oder blaue Blöcke. An überprüften Stellen (z. B. beim Sturmherrn) sind diese Farben **voll transparent (Alpha 0)** und damit keine unmittelbar sichtbaren Canvas-Flächen. Versteckte RGB-Werte können gesondert für Exportqualität untersucht werden; sie sind **kein** Grund, intakte Bilder pauschal zu beschneiden.

**Noch keine künstlerische Abnahme:** Gleichartige Silhouette/Kamera über alle vier Richtungen, tatsächliche Fußpunkt-Stabilität während Attack/Hit/Death, Kontinuität der 4-Frame-Aktion sowie 64/128-px-Wirkung im laufenden Canvas-Spiel sind hier nicht vollständig nachgewiesen. Insbesondere bei `enemy-13` und `enemy-17` ist die Links-/Rechts-Zuordnung im Manifest bewusst vertauscht; sie muss in der echten Bewegungsrichtung überprüft werden.

## Ansturm: Einzelprüfung der 12 verwendeten Feind-/Bossbilder

Ein Randwert von **0 px** bedeutet sichtbare Alpha-Pixel direkt am Dateirand. Das ist eine technische **Nachprüfung**, nicht automatisch eine amputierte Figur: Runen-/Flugspuren und Waffen dürfen bewusst lang sein. Das Bild ist aber ohne Reserve für spätere Exporte und Filterung riskant.

| Aktives Asset | Größe | Sichtbarer Mindestrand | Pixelstatus | Einzelbefund / nächste Sichtprüfung |
|---|---:|---:|---|---|
| `enemy_normal.webp` | 129×190 | 0 px | Hold | Linke Waffe und rechter Schildbereich auf Beschnitt prüfen |
| `enemy_runner.webp` | 123×190 | 0 px | Hold | Ausladende Waffen-/Laufsilhouette am linken Rand |
| `enemy_armored.webp` | 134×190 | 0 px | Hold | Rechte Ausrüstung und Fußlinie am Rand |
| `enemy_cultist.webp` | 122×190 | 0 px | Hold | Links separat wirkende Form auf sichtbare Fremdpixel prüfen |
| `enemy_shieldbearer.webp` | 119×190 | 0 px | Hold | Linke Klinge, obere Partikel und Standpunkt prüfen |
| `enemy_bomber.webp` | 125×190 | 0 px | Hold | Rechte Flügel-/Effektkontur prüfen |
| `enemy_gargoyle.webp` | 166×190 | 20 px | Pixel-Pass | Freigestellte Flugfigur; Bewegungs-/Trefferaktionen fehlen in Ansturm |
| `enemy_siege.webp` | 134×190 | 0 px | Hold | Steinpanzer/Silhouette am Bodenrand, Abgrenzung zum Steinbrecher |
| `boss_stonebreaker.webp` | 152×280 | 0 px | Hold | Rechte Schulter/Steinkontur am Rand; Boss-Telegraph nur prozedural |
| `boss_stormlord.webp` | 166×280 | 17 px | Pixel-Pass | Gute sichtbare Insets; farbige RGB-Matte mit Alpha 0 nicht automatisch ein Effektfehler |
| `boss_shieldwarden.webp` | 174×280 | 0 px | Hold | Linkes und rechtes Ausrüstungs-/Schildelement berührt die Außenkante |
| `boss_colossus.webp` | 173×280 | 0 px | Hold | Linkes Rüstungsteil berührt die Außenkante; Silhouette vollständig neu abnehmen |

**Produktionsempfehlung (keine automatische Retusche):** zuerst `boss_shieldwarden`, dann `boss_colossus` als isolierte Master mit vollständig sichtbarem Schild, Waffen und Standfläche sowie sicherem Alpha-Inset neu freistellen/ggf. ergänzen. Dabei weder Figurenidentität noch Treffergröße, Rendermaß, Boss-Phasen oder Pivot stillschweigend ändern. Danach `boss_stonebreaker` und die acht Normalgegner einzeln. Keine pauschale Erweiterung des Canvas, die Figuren bei fester Renderbreite ungewollt kleiner zeichnet.

**Gezielter Produktionsprompt für den ersten Hold (`boss_shieldwarden`)**: *Use the existing `boss_shieldwarden.webp` as the strict visual identity reference. Reconstruct exactly this full-body dark-fantasy medieval shield warden in the established Denkmal TD2 hand-painted 2.5D gameplay camera: battered blackened armor, antique bronze trim, large weathered stone-and-metal shield with restrained blue rune, mace, aged red cloth. Show the complete shield, mace, cloak and both feet with a shared bottom-center ground contact. One isolated figure only, genuine transparent RGBA PNG master, generous transparent safety inset on all four sides, stable silhouette readable at 64/128 px. Preserve lighting from the upper left and the current relative body proportions. No second actor, no background or stone floor, no opaque glow rectangle, no text, no cropped weapon, no camera rotation, no new heraldry or silhouette redesign. Produce a source master for QA only; do not replace the 174×280 runtime image before pivot, frame-size, miniature and browser checks.*

## Reproduzierbare Prüfungen und Grenzen

```bash
python tests/style2-enemy-boss-audit.test.py
python tools/audit-enemy-boss-style2.py --grid 4x12 dist/assets/directional-v410/enemy-*.webp
python tools/audit-enemy-boss-style2.py --grid 4x21 dist/assets/enemies/walk-v1.webp
python tools/audit-enemy-boss-style2.py dist/ansturm/assets/boss_*.webp dist/ansturm/assets/enemy_*.webp
python tests/ansturm-asset-edges.test.py
python tests/v410-directional-assets.test.py
```

Der neue Prüfer berechnet **keine** Style-Freigabe. Die vorhandenen getrennten `dist`- und Standalone-Ansturm-Dateien bleiben unverändert; deren Byte-Parität prüft der bestehende Test. Keine Kampfwerte, Save-Keys, Loader, bestehenden Assets oder Cache-Versionen wurden verändert.

**Offen:** CPU-Komposition auf hellem/dunklem Hintergrund bei 64/128 px, tatsächliche Attack/Hit/Death-Richtungs- und Pivotprüfung im Spiel, Desktop-/Touch-Chromium, echter Android-4-GB-Test. Ein zuvor versuchter lokaler Chromium-Smoke scheiterte an `socket(): Operation not permitted` **vor dem Spielstart**; daraus wird kein Spielergebnis abgeleitet.

**Freigabe:** Eine Pixel-Pass-Meldung ist kein Style- oder Release-Gate. Ohne freigegebene vollständige Ersatzgrafik wird **kein Runtime-Bild** ersetzt, kein Merge und kein Deployment allein aufgrund dieses Audits durchgeführt.
