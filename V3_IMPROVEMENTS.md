# Denkmal TD v3 — Improvement Backlog

Prioritized follow-ups beyond the current vertical slice.

## V3.1 — gameplay depth
- Tower targeting modes: first, strongest, nearest, boss.
- [x] Tower synergies: mage slow amplifies cannon splash; rift chains gain bonus jumps on slowed enemies.
- Enemy resistances shown explicitly instead of hidden multipliers.
- Mini-boss modifiers every four waves after the authored wave-8 slice.
- Wave preview during build pause with the upcoming enemy composition.

## V3.2 — feel and readability
- [x] Edge-of-screen threat arrows for active gates and bosses.
- Damage numbers with automatic density reduction on mobile.
- Stronger hit-stop/camera impulse only for boss and heavy cannon impacts.
- Distinct silhouettes and final production sprites for runner, guardian and sapper.
- [x] Per-tower placement ghost showing range and role icon before construction.

## V3.3 — progression
- Run summary with damage dealt per tower, kills, essence efficiency and monument damage taken.
- Permanent codex for discovered enemies, towers and relics.
- Optional challenge modifiers such as low essence, double-speed enemies and one-life monument.
- Save-slot/version migration layer before adding larger persistent progression.

## Engineering
- Split `game.js` into simulation, rendering, input, UI and content-data modules.
- Deterministic seeded RNG for reproducible tester runs.
- Browser smoke test with Playwright in addition to headless VM tests.
- [x] Lightweight frame-time telemetry overlay enabled only in tester builds.
- Asset manifest/preload screen so missing or oversized images are reported before a run starts.
