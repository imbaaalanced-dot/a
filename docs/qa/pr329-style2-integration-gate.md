# PR #329 – Level 1–7 Style-2 Integration / QA Gate (2026-11-17)

## Runtime scope
- Level 1 (Einleitung) / 2 (Labyrinth): `style2-maps.js` shared cached painter; roads, lanes and tower slots unchanged. Existing `tests/style2-maps.test.cjs` proves cached draw and geometry invariance.
- Level 3 (Kirchende): `monument-style2-pilot.webp` is default in this PR. `?td2KirchendeMemorialLegacy=1` selects the photo; failed Style-2 decode falls back automatically. An unverified candle plaque is never loaded.
- Level 4 (Ender Dorfkirche / Löwe): existing church and lion unchanged.
- Level 5 (Hohensyburg): existing 2x V2 monument selected.
- Level 6 (Goethestraße): existing Style-2 memorial selected.
- Level 7 (Westhofen): current V3 SVG preview selected. Historical accuracy remains unresolved.

## Automated checks (separate from historical acceptance)
- Unit: `tests/style2-all-levels-runtime.test.cjs`, `tests/style2-maps.test.cjs`, `tests/kirchende-loading.test.cjs`, `tests/kirchende-memorial-pilot.test.cjs`.
- Chromium: `tools/verify-kirchende-memorial-browser.cjs` checks Style-2 default and legacy photo in desktop and touch-portrait, and produces 64px/128px previews plus Level 3 gameplay captures.
- WebP decode/alpha and size budget: `python tests/kirchende-memorial-pilot.test.py` in existing CI.
- No workflow publishes to GitHub Pages, no automatic release.

## Still requiring human evidence
- **Historical fidelity**: compare Level 3 helmet silhouette/plaque, Level 4 church/lion, Level 5 Hohensyburg bronze/stone, Level 6 Goethestraße, Level 7 Westhofen with dated reference photos. Screenshots prove drawing but cannot establish architectural accuracy; Westhofen V3 is explicitly provisional.
- **Level 1/2**: current material/road/clearance unit audit is not a substitute for touch-portrait visual review.
- **Hardware**: Android device with 4 GB RAM, touch, low-memory and sustained-wave FPS/RAM QA not represented by headless Chromium. Keep release blocked until completed.
