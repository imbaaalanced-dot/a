# Ansturm-Gegner: Bestandsinventur & Laufanimations-Vertrag (2026-11-22)

P1-Punkt aus #330: „Vorhandene gerenderte Ansturm-Gegner inventarisieren, grobe
Laufanimationen je Richtung mit korrektem Pivot/transparentem Hintergrund einsetzen;
Angriffsanimationen im Anschluss."

## 1. Vorhandene gerenderte Gegner (Runtime-Bestand)

Quelle: `dist/ansturm/assets/` (byte-identisch gespiegelt in `ansturm-alpha1-5/assets/`,
grepinnt durch `tests/ansturm-asset-edges.test.py`). Alle RGBA mit Alpha-Kanal,
Pivot = Fußanker unten mittig (`sprite()` in `dist/ansturm/sprites.js`:
`drawImage(img, x-w/2, y-h, w, h)`).

| Typ | Sprite | Pixel | ab Welle | HP | Speed | DPS | Gold |
| --- | --- | --- | --- | --- | --- | --- | --- |
| normal | `enemy_normal.webp` | 129×190 | 1 | 24 | .08 | 5 | 8 |
| runner | `enemy_runner.webp` | 123×190 | 1 | 16 | .13 | 3 | 10 |
| armored | `enemy_armored.webp` | 134×190 | 1 | 65 | .05 | 10 | 18 |
| cultist | `enemy_cultist.webp` | 122×190 | 2 | 30 | .075 | 6 | 12 |
| shieldbearer | `enemy_shieldbearer.webp` | 119×190 | 3 | 78 | .045 | 8 | 20 |
| bomber | `enemy_bomber.webp` | 125×190 | 4 | 42 | .09 | 14 | 17 |
| gargoyle | `enemy_gargoyle.webp` | 166×190 | 6 | 48 | .11 | 7 | 22 |
| siege | `enemy_siege.webp` | 134×190 | 8 | 135 | .035 | 18 | 35 |
| boss (alle 5 Wellen) | `boss_stonebreaker/stormlord/shieldwarden/colossus.webp` | 152–174×280 | 5k | 400 | .035 | 18 | 125 |

Spawn: 4 Kartenseiten (`side 0–3` in `model.js`), Gegner laufen aufs zentrale Denkmal zu.

## 2. Laufanimation — Stand (bereits umgesetzt, test-gepinnt)

Es existieren **keine Mehrfach-Sheets**; die Artquelle bleiben die transparenten
Einzelbilder. Die Laufanimation ist **prozedural** in `render.js` und per
`ansturm-alpha1-5/tests/enemy-walk.test.js` vertraglich gepinnt:

- Walk-Clock `walkT` (35 % Tempo bei Frost), pro Gegner Phasenversatz `e.id*1.73`
- Schrittfrequenz: runner 10 Hz, alle anderen 7 Hz
- Bob (`eStep*r*.16`) + Sway + leichter Torso-Lean (`ctx.rotate`), **kein Vollbild-Mirroring**
- Bodenschatten squasht synchron zum Schritt
- Angriffs-Lunge Richtung Denkmal (`nx*lunge`, `ny*lunge`) mit Attack-Puls

Richtung: Gegner spawnen an allen 4 Rändern und laufen zentripetal; die Drehung
erfolgt über Lean/Lunge statt Spiegelung (asymmetrische Ausrüstung wie Schild
bleibt seitenrichtig).

## 3. Offen (braucht neue Art + Marcels Abnahme)

- Echte richtungsbezogene Lauf-Sheets (4 Richtungen × 8 Typen + Bosse) — heute
  nicht im Bestand; Generierung + visuelle Abnahme über die Referenz-Pipeline.
- Explizite Angriffsanimationen (Frames) im Anschluss an die Lauf-Sheets.
- Bis dahin: prozeduraler Walk-Cycle (Abschnitt 2) bleibt die freigegebene Lösung.
