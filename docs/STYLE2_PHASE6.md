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

## Follow-up: upright sprites and cropped terrain (16 October)

Browser play check of the first build reached Kirchende successfully. The renderer applied the ground depth factor to the entire scene, which also compressed standing artwork. Standing objects now receive an inverse depth transform around their existing world anchor; the church bitmap receives the same correction around its existing base. Paths, camera picking and movement still use the oblique ground projection. This is still an approximation, not true isometry.

The decoration layer now copies only the visible world rectangle, clipped to map bounds. Camera motion reuses the atlas. Regression tests verify stable sprite anchors, undistorted sprite height, transform restoration and camera clipping/cache reuse. Local Android emulation tests do not replace real-device FPS testing.

## Follow-up: coherent ground painting

Replaced repeated photographic ground in the active renderer with one deterministic, full-world 1536px painting: low-contrast moss/earth masses and sparse leaf clusters. All four maps share this palette through the terrain renderer; the first two retain their existing paving and hedges. Historical map footpaths now blend into the ground through nine graduated shoulder strokes. Road centrelines, core widths, object sizes and collision geometry are unchanged. Object proportion work remains separate.

The old photo is removed from startup preloading and level-entry fetching. Its optional loader remains available for legacy callers. The shared ground painting adds roughly 9 MiB RGBA memory, reused across levels; the decoration atlas and Level1/2 map bitmap remain separate. No per-frame ground canvas allocation. A real Canvas render of Kirchende ground, routes and scenery was inspected; full Android gameplay visual/FPS assessment remains open. New regression tests cover no startup photo download, full-world source clipping and cache reuse.

## Follow-up: village buildings and foliage polish

Kirchende's two decorative village buildings now use lazy cached sprites rather than plain rectangular per-frame facades. Added pitched slate roofs with clipped tile courses, recessed window frames, low-contrast masonry, subtle lit windows, chimneys and base shadows. Original building placements and nominal world bounds remain unchanged; the silhouettes are illustrative, not surveyed reconstructions.

The shared Level3/4 tree crowns have fewer high-contrast leaf marks, subdued greens and a baked upper-left light/lower-right shadow. Crown drawing diameter changes from 2.32r to 2.16r; shrub drawing dimensions from 2.3r to 2.12r. World anchors, transparency-distance rules and collision data stay unchanged. This makes foliage slightly more compact around the existing pads and paths. No tower, enemy, hero or monument gameplay sizes change.

The renderer-caching regression verifies both building buffers are reused on subsequent frames. Complete Node and mobile gameplay suites pass. Native Canvas output of terrain, village facades and foliage was inspected. This is a visual polish pass, not completion of the full concept-art conversion. Real-device Android FPS remains unverified.

### Browser follow-up, 18 October 2026
Live desktop inspection confirmed Kirchende and church/lion rendering and found an unnecessarily narrow 180px wave preview. At landscape widths of at least 900px, the preview now expands up to 420px while keeping space for the side HUD; the boss panel moves beneath it. Portrait and narrow landscape rules remain in effect. All 22 Node test files and the coarse-pointer gameplay suite pass. These checks do not establish actual Android FPS or a complete playthrough of all four chapters.

### Ground detail follow-up
Reduced isolated decoration anchors from 650 candidates to 380, adding softly blended moss/soil patches, flattened leaf clusters and short grass blades within the existing exclusion zones. The cached 1536px atlas and viewport crop remain unchanged. All four level layouts passed deterministic clearance/immutability tests; terrain-and-route samples for all four were rendered with native Canvas and inspected. This is a terrain-layer check, not a complete four-map browser playthrough.
