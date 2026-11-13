# TD2 · Hohensyburg Art-248 · Isolated sprite candidate

Issue: #248 · 13 November 2026 · Development-only preview

## Scope and art direction
- **Target:** present-day single-pylon Kaiser-Wilhelm-Denkmal following the
  1935/36 transformation, with one equestrian bronze and two surviving side
  statues (Bismarck, Moltke). Do not portray the 1902 triple-tower scheme.
- The AI-generated transparent image is an **illustrative interpretation**,
  **not** an exact transcription of the photos and monument. The horse/rider
  placement within the niche and stone proportions remain **reference-QA risks**.
  V2 moves the horse forward and to viewer-left of the pylon (improved silhouette),
  but it is still **not** proven photo-accurate. No new inscription has been added.
- Sources/approved internal art lock: `docs/graphics/LEVELDESIGN_REFERENCES_V5.md`,
  `dist/hohensyburg-art.js` and the existing Issue #248 mobile screenshot.

## Binaries added without replacing originals
| File | Pixel dimensions | Format | Bytes | SHA256 |
| --- | --- | --- | ---: | --- |
| `dist/assets/hohensyburg/kaiser-wilhelm-style2-qa-v1-1x.webp` | 256×304 | WebP VP8X alpha | 28142 | `b0467005a517751982d862642a34bc4725ab3f93fd3fac619d74f9d3912394ea` |
| `dist/assets/hohensyburg/kaiser-wilhelm-style2-qa-v1-2x.webp` | 512×608 | WebP VP8X alpha | 92414 | `b5da1ebfb463a5da9eda9d2dde4201eb779ca1d3ccb5c5ec0a1f66341b0e72b5` |
| `dist/assets/hohensyburg/kaiser-wilhelm-style2-qa-v2-1x.webp` | 256×304 | WebP VP8X alpha | 26512 | `235872c9bea72a45866c3ac004586bac412f32e8262af40830164fb0af4b5722` |
| `dist/assets/hohensyburg/kaiser-wilhelm-style2-qa-v2-2x.webp` | 512×608 | WebP VP8X alpha | 87752 | `fd60d7aa0be1b45d8f88dc2219ea2515d30bcd42526814724654b23b24f5ae7e` |

- The existing `kaiser-wilhelm-style2.webp` is untouched.
- V1 and V2 were technically cropped, alpha-trimmed and resized, with no
  runtime image generation. All four binary files were staged as Git blobs
  and checked against expected Git blob hashes before source integration.
- The cached runtime drawing uses only the 2× (512×608) sprite; the 1×
  variant is an unused resolution reference, not another runtime decode.

## Preview and fallback
- `?td2SyburgArt248=1`: requests the V1 2× candidate once on Level 5,
  540 world-pixel display height, centered on the existing monument anchor;
  while decoding or upon a missing/corrupt image, uses the existing cached
  text-free Canvas fallback.
- `?td2SyburgArt248=2`: requests only V2 2× (512×608), with the same
  foot anchor, footprint and Canvas fallback. It leaves V1 intact so both
  historical interpretations can be compared at identical zoom and camera.
- Without flags, the old original WebP stays the default.
- `?td2SyburgCleanPreview=1`: retains the old Canvas-only preview.
- If both flags are supplied, the new candidate takes precedence; during
  decoding it still draws the Canvas fallback. No UI/gameplay edits.
- The sprite248 preview uses the same cleaned, cached natural-stone terrace
  and forecourt as the text-free Canvas preview; it does **not** retain the
  checkerboard stone rectangles from the default. No geometry is altered.

## Required QA before approval
- `node tests/hohensyburg-sprite248.test.cjs` checks real WebP headers,
  dimensions and alpha, URL gating, singleton decode and fallback, anchors.
- `node tests/level5.test.cjs`,
  `node tests/hohensyburg-text-free-preview.test.cjs` and cache regression.
- Desktop Chromium and touch-emulated Level 5 comparisons: original WebP,
  text-free Canvas, V1 and V2 candidates. `level5-hohensyburg-sprite248-comparison`
  stores screenshots and results.json. Inspect at 64/128 px, including
  partially hidden actor/tower markers.
- Physical Android 4 GB: open game on device, inspect actual textures,
  touch/hit targets, FPS/frame p95 and long-session RAM in a separate report.
- No merge or release until reference fidelity and visual/runtime QA are
  approved. Desktop/mobile emulator alone does **not** equal Android QA.

## V2 reference sources and known uncertainties
- [Dehio architectural history](https://de.dehio.org/bauwerk/syburg-hohensyburg-kaiser-wilhelm-denkmal):
  the 1935/36 rebuild left one simplified pylon, an equestrian statue and
  only the two Bismarck/Moltke figures.
- [Present-day front-left photographs](https://www.kdwupper.de/hohensyburg_dortmund.html)
  and [Baukunst NRW photographs](https://baukunst-nrw.de/objekte/Hohensyburg--595.htm)
  establish the equestrian statue projecting forward of the pylon. V2's
  horse nose, rider position and overlapping volumes were adjusted accordingly.
- **Do not claim exact replication**. The rider posture, three sculpture
  plinths and exact proportions are artistic interpretation pending careful
  image-to-image overlay. At 64 px the side figures are small; a separate
  photo-based silhouette QA is necessary.
- QA status: WebP dimensions and alpha technically validated, **visual
  and physical Android acceptance pending**. Keep PR #258 Draft.
