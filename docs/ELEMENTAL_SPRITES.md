# Riftlanze / Eisturm generated sprite integration

Six fixed-cell RGBA WebP atlases replace the active mage/rift visual assets only. `mage` remains the existing slowing-magic tower; no new tower role or balance changes are introduced. Existing bow, cannon and boomerang graphics remain intact.

- 6 tower sprites: 512px cells, common canvas and bottom alignment; displayed at fixed 112 world-pixel canvas size. Stronger towers gain silhouette height rather than arbitrary per-tier zoom.
- 6 projectiles: 128px cells; generated art points right and runtime rotates to actual velocity, including exactly vertical shots.
- 36 impact phases: six per tier, 128px cells, three rows. Frame selection follows the existing particle lifetime and fades to zero opacity.
- Repaired effects generated with wider gutters; manually bounded tower/projectile slicing avoids neighboring silhouettes. Uniform scaling within each impact row preserves expansion and decay. Original alpha is preserved; every cell has a verified fully transparent four-pixel border.
- Approximately 1.0 MiB total additional compressed assets. Images preload with existing essential art. Cold/failed images use the established procedural fallback; errors retry only after five seconds on subsequent use.
- Generated sources are identified with SHA256 in `assets/elemental/manifest.json`. Reproduction/slicing command: `python tools/prepare-elemental-sprites.py <generated-image-directory>`.

## Verification

21 Node test files pass, including fallback, tier crops, vertical projectile orientation, six animation phases and warm image reuse. Pillow decodes every WebP and verifies dimensions, populated cells, transparent gutters and per-file size limits. Mobile gameplay passes. Native Canvas rendering of all six towers, their projectiles and impacts was visually inspected on an opaque terrain-colored background. Real Android FPS and full browser playthrough remain unverified.

All combat damage, slowing, chain-lightning targeting, route layout and build slots are unchanged. No merge to main; same separate Phase 6 tester.

## Bow follow-up
Three generated bow tower tiers now use the same fixed-cell renderer. Only tower images are enabled for bow; existing projectile and impact renderers remain active. Source hash and crop boundaries are recorded in the manifest. All 22 Node test files pass; all three bow cells decode with transparent margins and the atlas was inspected over an opaque terrain color. Browser and Android verification remain pending.
