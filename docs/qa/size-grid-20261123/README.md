# Perspektiv-/Größenraster (P1 #330 §2 / Beta-Plan Meilenstein B)

Stand: 2026-11-23. Dev-Overlay `?td2SizeGrid=1`: 256-Weltpixel-Raster mit
Koordinatenlabels (alle 1024) über dem aktuellen Viewport — zum Abgleich von
Straße, Monument, Turm, Spieler und Vegetation gegen Marcels Referenzen.
Read-only, default AUS, keine Gameplay-State-Änderung.

- `dist/size-grid.js` (neu): `TD2SizeGrid.draw(ctx, level, camera, vw, vh)`,
  Hook in `Style2Ambience.drawAir` (über den Actors, zum Messen).
- `tests/size-grid.test.cjs` (neu): Opt-in/Opt-out, Rasterlinien auf
  256er-Vielfachen im Viewport, Labels, Determinismus, Wiring-Pins.
- Cache-Keys: `size-grid.js?v=sizegrid-20261123`, `style2-ambience.js` gebumpt.
- Doku-Drift behoben: `LEVELDESIGN_REFERENCES_V5.md` Runtime-Abgleich L3-Boden
  jetzt `ground-style2-v2.webp` (main @ 45e2e42, nach #412).

Lokal: 152/152 Node-Tests grün.
