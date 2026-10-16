# Denkmal TD2 V4 – Style-2 Asset-Overhaul, Phase 2

Stand: 16. Oktober 2026

Branch: `feature/v4-graphic-overhaul-style2`

## Eingangsprüfung

Die bereitgestellten Grafiken wurden nach ihrem tatsächlichen Einsatzzweck getrennt:

| Quelle | Einordnung | Verwendung |
|---|---|---|
| `marcel_true_topdown.png` | vier Blickrichtungen, grüner Hintergrund | Referenz für Richtungszuordnung |
| `marcel_topdown_transparent.png` | Einzelpose mit weißem Hintergrund | Charakter- und Materialreferenz |
| `marcel_walk_4x3.png` | zwölf Posen, Magenta-Hintergrund | verbindliche Animationsquelle |
| vier große Marcel-/Logo-Grafiken | Portrait, Menü und Markenreferenz | nicht als kleine Runtime-Sprites verwendet |
| `Turm-Konzepte.md` | Äther-Säule, Blauflamm-Becken, Chrono-Obelisk, Portal-Bastion | Konzeptquelle für die weitere Turmfamilie |

Die Dateinamen oder Alpha-Modi wurden nicht ungeprüft übernommen. Grün, Weiß und Magenta waren in den gelieferten Bildern noch als sichtbare Hintergründe enthalten.

## Integrierter Heldenatlas

- Runtime-Datei: `dist/assets/hero/marcel-walk-atlas-v2.webp`
- Aufbau: drei Laufphasen × vier Richtungen
- Zellgröße: 362 × 362 Pixel
- Gesamtgröße: 1086 × 1448 Pixel
- Transparenz: RGBA mit vollständig transparenten und vollständig deckenden Pixeln
- Downloadgröße: unter 400 KB
- Animation: acht Bildwechsel pro Sekunde während der Bewegung; mittlere Phase im Stand
- Stabile Sonderfälle: Ausweich-Nachbilder und Seelenechos verwenden die neutrale Mittelphase

## Integrierter Magieturm

Der bisher für alle Stufen identische rote Höllenfeuerturm wurde durch die blaue Äther-Säule ersetzt. Die Spiellogik bleibt unverändert.

| Stufe | Silhouette | Runtime-Datei |
|---|---|---|
| 1 | niedrige Steinsäule, ein kleiner Kristall | `tower-mage-l1-v2.webp` |
| 2 | Doppelfokus mit zwei Emittern | `tower-mage-l2-v2.webp` |
| 3 | hoher Resonanzkristall mit Orbitalsplittern | `tower-mage-l3-v2.webp` |

Alle drei Dateien sind quadratische 724-Pixel-WebPs mit echter Alpha-Transparenz. Zusammen benötigen sie weniger als 250 KB. Die Footprints und Baselines bleiben zwischen den Ausbaustufen stabil.

## Integrierter Bogenturm

Die bisher hellen, uneinheitlich beschnittenen Armbrustgrafiken wurden durch eine zusammenhängende Style-2-Serie ersetzt. Die Spiellogik bleibt unverändert.

| Stufe | Silhouette | Runtime-Datei |
|---|---|---|
| 1 | kompakte Eichenarmbrust auf niedrigem Wehrsockel | `tower-bow-l1-v3.webp` |
| 2 | verstärkte Repetiermechanik mit Getriebe und höherem Sockel | `tower-bow-l2-v3.webp` |
| 3 | schwere Doppelmechanik mit Winde und kleinem Bernstein-Runenkern | `tower-bow-l3-v3.webp` |

Alle drei Sprites sind 724 × 724 Pixel groß, besitzen echte Alpha-Transparenz und verwenden dieselbe Grundfläche, Baseline und Zielrichtung. Zusammen bleiben sie unter 250 KB und benötigen zur Laufzeit kein nachträgliches Zuschneiden.

## Technische Grenzen dieser Teilphase

- Keine Schadens-, Kosten-, Reichweiten- oder Verlangsamungswerte wurden verändert.
- Die vorhandenen Projektil-/Treffereffekte bleiben vorerst aktiv; individuelle Projektile und Trefferframes folgen als eigener, testbarer Block.
- Die großen Portrait- und Menüreferenzen werden erst beim späteren HUD-/Hauptmenü-Block ersetzt.
