# TD2 · Reference-ground V3 · 13.11.2026

## Status
Nine RGB WebP materials (each 256 × 256) are staged under `dist/assets/reference-ground-v3/` and **enabled by default**. Use `?td2GroundV3=0` as an explicit legacy opt-out; the older `?td2GroundV3=1` preview link remains compatible. The separate `?td2Style2Pilot=1` mode disables V3 to keep comparisons isolated. Missing/broken V3 assets fall back to existing painted ground and road materials; authored path geometry and saved progress remain unchanged.

## Source fidelity
Materials are AI-generated interpretations selected using the project reference collection and site photographs. They are **not** licensed original-photo crops, not surveyed road or graveyard geometry, and not historico-archaeological evidence. Hohensyburg uses current monument shape. Westhofen keeps the post-July-2026 monument state separate from any period reconstruction.

## Level mapping
1 introduction: forest base / churchyard stone road;
2 maze: forest base / dark slabs;
3 Kirchende: root-rich forest / dark slab approach;
4 Dorfkirche/Löwe: patchy meadow / churchyard cobble;
5 Hohensyburg: bedrock / sandstone terrace and access;
6 Goethestraße: meadow / brick walkway / asphalt street;
7 Westhofen: meadow / memorial gravel / asphalt street / cobble sidewalk.

Visual-only; path layout, towers, saved progress, game rules and navigation unchanged. The preexisting `?td2Style2Pilot=1` mode is maintained separately and **must not** be combined with V3 for comparison.

## Release scope
Default-on activation requested on 13 November 2026. Chromium desktop/touch checks are not a physical device test. Android 4 GB FPS, memory, GPU compatibility, touch and long-session stability remain **unverified** until a real-device session is documented.

## QA requirements
- `node tests/reference-ground-v3.test.cjs` and existing terrain, maps, level tests.
- Chromium desktop/touch full-scene before/after, network/console errors, repeatable screens.
- Physical Android 4 GB: measure FPS, RAM, texture decoding, long-run stability.
- No merge until required CI and visual QA pass. No automatic published status from a PR alone.