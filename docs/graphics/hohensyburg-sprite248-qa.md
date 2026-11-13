# TD2 · Hohensyburg Art-248 · Isolated sprite candidate

Issue: #248 · 13 November 2026 · Development-only preview

## Scope and art direction
- **Target:** present-day single-pylon Kaiser-Wilhelm-Denkmal following the
  1935/36 transformation, with one equestrian bronze and two surviving side
  statues (Bismarck, Moltke). Do not portray the 1902 triple-tower scheme.
- The AI-generated transparent image is an **illustrative interpretation**,
  **not** an exact transcription of the photos and monument. The horse/rider
  placement within the niche and stone proportions remain **reference-QA risks**.
  No new inscription has been added.
- Sources/approved internal art lock: `docs/graphics/LEVELDESIGN_REFERENCES_V5.md`,
  `dist/hohensyburg-art.js` and the existing Issue #248 mobile screenshot.

## Binaries added without replacing originals
| File | Pixel dimensions | Format | Bytes | SHA256 |
| --- | --- | --- | ---: | --- |
| `dist/assets/hohensyburg/kaiser-wilhelm-style2-qa-v1-1x.webp` | 256×304 | WebP VP8X alpha | 28142 | `b0467005a517751982d862642a34bc4725ab3f93fd3fac619d74f9d3912394ea` |
| `dist/assets/hohensyburg/kaiser-wilhelm-style2-qa-v1-2x.webp` | 512×608 | WebP VP8X alpha | 92414 | `b5da1ebfb463a5da9eda9d2dde4201eb779ca1d3ccb5c5ec0a1f66341b0e72b5` |

- The existing `kaiser-wilhelm-style2.webp` is untouched.
- The source was technically cropped, alpha-trimmed and resized, with no
  runtime image generation. Both binary files were read back from GitHub
  byte-for-byte and verified before source integration.
- The cached runtime drawing uses only the 2× (512×608) sprite; the 1×
  variant is an unused resolution reference, not another runtime decode.

## Preview and fallback
- `?td2SyburgArt248=1`: requests the new 2× candidate once on Level 5,
  540 world-pixel display height, centered on the existing monument anchor;
  while decoding or upon a missing/corrupt image, uses the existing cached
  text-free Canvas fallback.
- Without flags, the old original WebP stays the default.
- `?td2SyburgCleanPreview=1`: retains the old Canvas-only preview.
- If both flags are supplied, the new candidate takes precedence; during
  decoding it still draws the Canvas fallback. No UI/gameplay edits.

## Required QA before approval
- `node tests/hohensyburg-sprite248.test.cjs` checks real WebP headers,
  dimensions and alpha, URL gating, singleton decode and fallback, anchors.
- `node tests/level5.test.cjs`,
  `node tests/hohensyburg-text-free-preview.test.cjs` and cache regression.
- Desktop Chromium and touch-emulated Level 5 comparisons: original WebP,
  text-free Canvas, new candidate. `level5-hohensyburg-sprite248-comparison`
  stores screenshots and results.json. Inspect at 64/128 px, including
  partially hidden actor/tower markers.
- Physical Android 4 GB: open game on device, inspect actual textures,
  touch/hit targets, FPS/frame p95 and long-session RAM in a separate report.
- No merge or release until reference fidelity and visual/runtime QA are
  approved. Desktop/mobile emulator alone does **not** equal Android QA.
