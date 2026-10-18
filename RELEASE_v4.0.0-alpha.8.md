# Denkmal TD2 V4 Alpha 8 · Environment & Character Graphics

Independent tester: `/a/v4-alpha8/`. Alpha 7 at the site root and its saved campaign state remain separate. The test path uses the same storage keys as Alpha 7, so visiting it in the same browser reads existing inventory and progress.

## In the playable build

- Ender Dorfkirche: 1254 px RGBA architecture artwork replaces the 256 px church sprite. Its lower ground anchor and the gameplay footprint stay at their Alpha 7 coordinates; the tower extends further upward visually.
- Ender Löwe: 1122 × 1402 px transparent memorial image, facing south toward the viewer, drawn at the same collision anchor and size. The generated plaque is blank; the old procedural inscription remains a fallback when the new image fails.
- Marcel: a 3-frame walk cycle in four directions. Kim: matching animation atlas loaded by the renderer when a hero has `character: 'kim'`; the campaign still selects Marcel because Alpha 8 does not change the hero selection rules.
- Wraith, runner and brute: 3-frame movement sprites with automatic fallback to the previous static atlas. Other ground and flying enemies retain Alpha 7 art.
- Six levels share a subtle monument and gate contact-shadow pass; the existing terrain, buildings, paths, forest canopy, atmospheric lights, 2.5D camera and rendering order remain intact. HUD contrast and meter highlights are improved.

## Visual limits and verification

The architecture and lion are stylized interpretations of the approved direction; their precise historical dimensions cannot be established from the available in-repo reference art. The six maps have not been replaced by six full painted map images, and projectiles/impacts use the existing Alpha 7 atlas. This release does not claim every concept painting is represented pixel for pixel.

Run `node --test tests/*.test.cjs`, `TEST_MOBILE=1 node tests/game.test.cjs`, `python tests/assets.test.py`, and `python tests/alpha8-assets.test.py`. The Pages workflow also runs its full regression suite before publishing the isolated directory.
