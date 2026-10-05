# Denkmal TD v3.5.0-alpha.1

Consolidated tester release built from `release/v3.2.0-alpha.2`.

## Included patch line

- All non-divergent v3 feature/fix/release branches are already ancestors of this release.
- The old divergent `release/v3.1.0-alpha.1` and `v3-ui-code-polish` branches were audited and not merged mechanically because their tactical targeting, wave preview, telemetry, fixed build-pad and HUD/resize work is already present in the current source line.
- `gh-pages` remains deployment output only and is not merged back into source.

## Combat feedback patch

- Light hits: no camera shake and no hit-stop.
- Normal cannon impact (levels 1–2): camera shake 0.6, no hit-stop.
- Heavy cannon impact (level 3; mortar path treated as heavy): camera shake 3 and 45 ms hit-stop.
- Boss hits: camera shake 3 and 45 ms hit-stop.
- Boss phase transition: camera shake 10.
- Removed legacy generic shake values 1.7, 8, 12 and 16 from the active combat paths.

## Release verification

Required before publishing:

```bash
node tests/game.test.cjs
TEST_MOBILE=1 node tests/game.test.cjs
node tests/combat-fx.test.cjs
node tests/v3.1-features.test.cjs
```

The Pages workflow runs the same suite before mirroring `dist/` to `gh-pages`.
