# Ansturm-Walk-Sheet-Intake: Formatvertrag 2026-11-23

Nacharbeit zu `docs/ansturm-enemy-inventory-20261122.md` Abschnitt 3
(richtungsbezogene Lauf-Sheets, braucht neue Art + Eigentümer-Abnahme).

## Status

- **Keine Walk-Sheets sind vorhanden oder integriert.** Die freigegebene
  Runtime-Lösung bleibt der prozedurale Walk-Cycle in
  `dist/ansturm/render.js` (vertraglich gepinnt über
  `ansturm-alpha1-5/tests/enemy-walk.test.js`).
- Neu ist ausschließlich der **read-only Intake-Gate**
  `tools/verify-ansturm-walk-sheet.py` mit Smoke-Test
  `tests/ansturm-walk-sheet-intake.test.py`. Er erzeugt keine Assets und
  ändert kein Manifest; entsprechend gilt nach wie vor:
  „Integriert“ erst nach Runtime-Laden und visueller Prüfung im Spiel.

## Sheet-Vertrag (pro Typ × Richtung, bevor irgendetwas in den Loader geht)

| Eigenschaft | Vorgabe |
| --- | --- |
| Typen | `normal, runner, armored, cultist, shieldbearer, bomber, gargoyle, siege` + Bosse `stonebreaker, stormlord, shieldwarden, colossus` |
| Richtungen | Kompass `n, e, s, w` (Bezug: Bewegung aufs Denkmal) |
| Layout | 1 Zeile × 8 quadratische Frames, horizontaler Strip |
| Zellengröße | 192–1024 px (Runtime-Downscale später Teil der Integrationsprüfung) |
| Format | RGBA mit echtem Alpha (PNG/WebP-Staging) |
| Anker | Fußpunkt unten mittig; Fußlinie am Zellboden, Anchor-Drift ≤ 12 % der Zelle |
| Hygiene | Ecken transparent, kein Kanten-Clipping, ≥ 3 sichtbare Silhouetten, keine Duplikat-Frames, unsichtbare Matte == 0 |

Mitgelieferte Ablehnungen im Test: opake Hintergründe, statische Strips,
nicht am Boden stehende Figuren, falsches Grid, Nicht-RGBA, unbekannte
Typen/Richtungen.

## Nächste Schritte zur echten Integration

1. Art-Quellen je Typ × Richtung gemäß Style-2-Referenzen generieren
   (Marcel/Kim-Referenz-Pipeline analog zu `docs/hero-animation-qa`).
2. Einzelstreifen durch den Gate schicken (Pixel-Gate = pass).
3. Eigentümer-Abnahme der Framessichtbarkeit und Richtungswahl.
4. Erst danach: Renderer-Erweiterung `walk_<type>_<dir>` mit Fallback auf
   den gepinnten prozeduralen Cycle, neue Cache-Keys, Byte-Parität
   `ansturm-alpha1-5` ↔ `dist/ansturm`, Mobile-Budget-Prüfung.
