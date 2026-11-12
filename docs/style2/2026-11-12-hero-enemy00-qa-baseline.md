# V5 Style-2 QA baseline: heroes and enemy 00 (2026-11-12)

Branch: `qa/v5-hero-enemy00-baseline-20261112`, created from current `main`. This is a read-only assessment of runtime graphics. No graphics or saves are changed.

## Verified from repository source
- PR #178 and #180 are merged.
- `dist/canonical-hero-art-v5.js` is the shared hero art registry introduced in #178.
- Hero walk atlases: 3 columns × 4 rows, 256 px cells; hero side actions: 6 × 6, 128 px cells.
- `dist/directional-hero-assets-v5.js` defines Marcel side anchor [64,116], height 95, and Kim [64,117], height 100.
- `dist/directional-actions-v410.js` scales side actions by `height/spec.height` and anchors to the world-space origin; only authored side facing is used.
- Enemy walk sheet: 4 × 21 × 160 px; enemy action sheet 00: 4 × 12 × 128 px. Different source cell sizes are not automatically an error, but perceived size and ground contact must be checked.
- Prior contact sheet `docs/style2/previews/v5-enemy00-walk-action-64-128.webp` documents a smaller visible attack silhouette than walk.
- Existing enemy action atlas alpha margin: >=14 px in enemy 00; prior technical audit reported all 48 cells occupied. This does NOT constitute visual approval.

## Required acceptance gates before an enemy-00 asset swap
1. Extract all 4 walk frames and all 48 action frames; compute visible alpha bounding boxes at threshold 32, horizontal center and bottommost visible pixel per frame.
2. Match apparent scale and foot contact against walk reference, with stable orientation; explicitly account for intentional death collapse and hit recoil.
3. Compare every frame at 64 and 128 px on both dark and light backgrounds, and in actual game canvas at normal zoom.
4. Ensure alpha gutters, no cross-cell bleed, no accidental RGB matte, no duplicate loader requests, no added persistent decoded texture.
5. Preserve original assets, fallback paths, game state and save keys. Only switch manifest after separate review.
6. Run Node/Python asset tests, desktop Chromium and mobile touch emulation; collect screenshots and request/error logs. Android 4 GB is **not tested** until a physical device is used.
7. Require CI, reviews and branch rules before merge. Verify GitHub Pages deployment separately after merge.

## Next targets
Enemy 01–20 individually, campaign boss skins, Ansturm's separate eight enemy and four boss still images, then tower families and projectiles/impacts. Do not treat Ansturm stills as multi-frame action atlases.

## Execution record
- Baseline: source review only; no fresh automated tests or browser runs claimed.
- Asset replacements: none.
- Merge/deployment: none.
