# Style 2 – Phase 6 test build

Base: PR #39, `feature/style2-maps-pass5-20261016`.

## Changes

- Oblique presentation: vertical world projection at 0.82. Camera limits, terrain source rectangles, visibility culling, pointer picking and threat indicators use the same depth factor. This is an incremental 2.5D presentation, not a full rotated isometric renderer or a replacement with 3D geometry.
- All four levels receive deterministic leaf clumps, weathered stones, low masonry remnants and warm entrance ground light. Every decoration clears authored paths by 115 world pixels and build pads by 88 pixels. These are ground details without collisions.
- Cached contact shading anchors memorials; a shallow shadow at the church footprint integrates the building into its existing ground. No footprint, path, tower pad, spawn, wave, damage or movement data changes.
- Touch menu and tower/action targets reach 48 CSS pixels. Safe-area-aware scrolling keeps the menu usable in short landscape viewports. Focus outlines support keyboard navigation.
- One extra 1536-square transparent decoration bitmap is retained (roughly 9 MiB RGBA); rebuilt on level changes, never randomized each frame. Real Android memory/FPS assessment remains necessary.

## Verification

- Baseline: 18 test suites passed before implementation.
- New projection and immutable scenery tests fail before the new module exists, then pass with implementation.
- Complete Node suite: 19 test files pass, including 82 gameplay assertions with the new renderer loaded.
- Mobile gameplay, alpha5 and churchyard suites pass. Pillow verifies existing asset decoding and budgets.
- Visual browser verification is pending: no Chromium executable is installed in this environment; the attempted browser download returned an invalid archive. No real-device performance claim is made.

## Publishing

Branch: `feature/style2-phase6-20261016`.
Tester destination: `/a/v4-style2-phase6/`.
The Pages workflow runs regression checks before publishing only this directory on gh-pages. The new workflow also preserves this directory during this branch's main-root publishing logic. Older main workflow revisions do not know this new directory; carry forward the preservation rule before publishing main from an older revision.

Preview levels 3/4 remain available without awarding the Kirchende campaign reward. Existing save behavior is inherited from PR #39. Main is not merged or changed.
