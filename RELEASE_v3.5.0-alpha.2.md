# Denkmal TD v3.5.0-alpha.2

Character replacement release based on v3.5.0-alpha.1.

## New Marcel / Lantern Guardian

- Replaced the active hero presentation with the new hooded lantern guardian supplied for the project.
- Added a dedicated four-direction pixel atlas:
  - up
  - down
  - left
  - right
- Added a new hooded lantern portrait for the start screen, story presentation, character menu and HUD.
- Hero direction now follows the current facing vector instead of only mirroring a left/right sprite.
- The new hero atlas takes priority over the legacy guardian atlas; the legacy atlas remains only as a fallback if the new asset fails to load.
- Attack and echo FX now follow the two-dimensional facing vector so vertical directions remain coherent.
- Existing gameplay stats, equipment, Soul Call and combat balance are unchanged.

## Assets

- `dist/assets/hero/marcel-lantern-sprite-v1.webp`
- `dist/assets/hero/marcel-lantern-portrait-v1.webp`

## Verification

Release CI must pass:

```bash
node tests/game.test.cjs
TEST_MOBILE=1 node tests/game.test.cjs
node tests/combat-fx.test.cjs
node tests/v3.1-features.test.cjs
```
