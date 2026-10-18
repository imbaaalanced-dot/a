# Herdecke Goethestraße — Level 6

Playable reference-based park map, derived from the user's photographs 81505–81516 and annotated street/map views 86198 and 86200. Layout is illustrative, not surveyed. The commemorative architecture is based on photo 81513; generated cutout provenance is in `dist/assets/elemental/goethestrasse-manifest.json`.

- Three asymmetric ground approaches: western park path, northern street, eastern street. The two eastern approaches merge.
- Air spawns separately at the front street and flies directly across lawn. Cyan dotted corridor appears only in build pauses; it is not a ground path.
- Shadowwing, gargoyle and stormwing are introduced over waves 21–23; wave 24 includes the existing siege boss. Air warning names the three anti-air tower roles before each wave.
- Fourteen marked sites, twelve active towers, 320 starting essence, standard hero and monument rules. Cannon and boomerang remain ground-only; bow, ice, rift and hero hit air.
- Normal campaign access follows completion of Hohensyburg (Level 5). Existing completed Level 6 saves keep their unlocked chapter and endless access.
- Separate Style 2 preview can launch Level 6 without prior progress; completing that preview does not store campaign completion. Same-run endless continuation remains possible.
- A normal victory persists `denkmal-level6-completed-v1` and enables Level 6 endless. Storage failure retains the unlock for the session and reports the failure.
- Garden ground, brick paths, flagstone apron, street and rear woods are baked once into a cached canvas. Memorial art remains an upright sprite.

## Verification

`node tests/goethestrasse.test.cjs`: geometry, path endpoints, pad clearance, rose-bed clearance, mixed schedules, save/reload/blocked save, renderer warm-cache reuse.

`node tests/goethestrasse-preview.test.cjs`: actual game start, victory and same-run endless with no campaign completion writes in preview.

`node tests/game.test.cjs`: actual unlock/start, scheduled air and all three ground origins, anti-air preview, campaign victory and persistent endless route.

All Node test files, coarse-pointer game/preview/church suites and `python tests/assets.test.py` must pass before tester publication. These checks do not replace a full Android playthrough or device FPS measurement.

## Memorial generation prompt

Built-in image generation, transparent background, reference photo 81513: two rough limestone square pillars with cross caps and green bronze plaques, low connecting wall with central triangular gable, seated helmeted soldier resting his head on his hand, rectangular stepped pedestal; elevated three-quarter orthographic 2.5D, hand-painted dark fantasy, gray-beige masonry, subtle moss, restrained upper-left light; no scenery, UI or added writing. Runtime WebP preserves alpha and a padded bottom anchor.
