# Denkmal TD2 V4 Alpha 8 · Environment & Character Graphics

Tester: https://imbaaalanced-dot.github.io/a/v4-alpha8/
Base: Alpha 7, `45b7d8d216ced6d325acac6837e7e55f416ca839`. The main branch and published Alpha 7 remain unchanged.

## In the playable build

- Ender Dorfkirche: approved high-resolution architecture, exported as a 1536×1536 RGBA WebP with its source proportions retained. The southern ground anchor and collision footprint remain at their Alpha 7 coordinates.
- Ender Löwe: 1184×1328 RGBA memorial, sleeping lion facing south toward the viewer; separate from the church, with unchanged objective anchor and gameplay size. The inset plaque is blank rather than carrying invented historical text.
- Marcel and Kim: menu selection, four directions and three walk phases each. Identical combat stats and equipment rules; selection is cosmetic and does not add a save key. Existing Marcel story/dialogue remains. Directional animation atlases have normalized square cells and grounded feet, with stray neighbouring-frame fragments removed.
- Wraith, runner and brute: three movement phases and static-atlas fallback. Other enemies retain their existing art/flight animation.
- All six levels: shared illustrated shrub, rock, fern, stump, rubble and leaf sprites, deterministic lane-safe placement, cached terrain dressing and contact shadows. Hohensyburg uses the shared detailed tree crowns. Terrace masonry stays free of new ground props.
- Cannon: painted wood, iron and explosive ammunition; three six-frame impact sequences. Existing projectile collisions, damage and particle caps remain unchanged. Cold/failed images use the previous cached procedural graphics.
- HUD: stronger contrast and bronze edges. Hero choice uses 48px buttons in the main menu.
- Alpha 8 path: all six campaign cards directly playable for visual testing. Test victories do not write campaign completion/unlock flags. Inventory and loot still use the existing Alpha 7 keys and formats, so earned loot is shared when using the same browser.

## Validation and remaining limits

Run `node --test tests/*.test.cjs`, `TEST_MOBILE=1 node tests/game.test.cjs`, `TEST_MOBILE=1 node tests/alpha8-preview.test.cjs`, `python tests/assets.test.py`, `python tests/alpha8-assets.test.py`, and `git diff --check`. Both Actions workflows run Alpha 8 asset decoding and preview regression checks before release.

The original Alpha 8 branch had five broken PNG streams. These are removed and replaced with fully decoded RGBA WebP exports. The image gate verifies the actual decoder, populated frame cells and transparent edges, not just file headers. Runtime canvas rendering of all six maps is checked locally.

The buildings are illustrated interpretations of approved reference images, not a measured architectural survey. Historical dimensions are not newly claimed. This is an incremental graphical pass: full concept-painted terrain, every enemy animation and real-device Android FPS remain further work. A successful automated gate does not establish pixel-for-pixel concept parity or Android performance.

## Startup/menu hotfix

The loader previously started many large legacy PNG downloads in parallel and classified a 3.5-second delay as missing graphics. Critical startup now requests lightweight WebP atlases through a four-request queue; a global 15-second soft deadline releases the menu while the same queue continues in the background. Timeouts are no longer reported as missing files. Legacy tower fallbacks download only when rendered.

Phone menu cards use wrapping text, a separate status row and full available width. Explicit start-screen flow/scroll rules override generic modal alignment. Asset cache keys are refreshed. New fake-network regression checks cover slow completion, queue limits and background continuation; existing tower fallback and gameplay tests remain mandatory.
