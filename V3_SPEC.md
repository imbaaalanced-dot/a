# Denkmal TD v3 — Vertical Slice Specification

Target: v3.0.0 closed tester alpha.

## Architecture
- Static browser game under `dist/`; no runtime package dependencies.
- `game.js`: simulation, tower/enemy roles, spawning, input, rendering orchestration and local settings.
- `levels.js`: gates, paths, maze routing, build slots, level unlock persistence.
- `hero-saga.js`: Marcel progression, story, equipment and voice hooks.
- `combat-fx.js`: bounded combat particles/audio feedback.
- `tests/*.cjs`: headless regression checks with mocked DOM/canvas.
- GitHub Actions gates gameplay + combat FX before tester publication.
- `gh-pages` remains the tester publication branch while repository Pages settings are branch-based.

## v3 alpha task breakdown

### P0 — tester stability
- [x] Four deterministic spawn gates.
- [x] Level 2 maze routing and build-slot validation.
- [x] Touch joystick pointer capture/reset hardening.
- [x] Wide camera and compact contextual combat HUD.
- [x] Rendering caches, offscreen culling and bounded particles.
- [x] CI gate for gameplay + combat-FX regression tests.
- [ ] Real Android device touch test.
- [ ] Sustained-wave FPS capture on a mid-range Android device.

### P1 — vertical slice completeness
- [x] Four production tower roles: bow, cannon, mage slow, rift chain.
- [x] Six normal enemy roles: wraith, runner, brute, archer, guardian, sapper.
- [x] Explicit balancing for waves 1–8 plus one boss encounter on wave 5.
- [x] Spawn-gate labels, numbering and active-gate telegraphing.
- [x] Persistent audio, graphics and camera settings for mobile/desktop.
- [x] Contextual build HUD on valid construction positions.

### P2 — tester packaging
- [x] Versioned closed-alpha release notes.
- [x] Tester issue template with device/browser/level/wave/reproduction fields.
- [x] CI regression workflow.
- [ ] Publish alpha.3 to tester branch after CI passes.
- [ ] Record real-device Android results in a tester issue.

## v3.0 acceptance gate
The build is considered ready to leave alpha only after:
1. CI is green.
2. Android touch is confirmed on at least one real device.
3. A wave 1–8 run completes without progression blockers.
4. Level 2 build slots, upgrade and sell flow are verified.
5. Sustained combat does not show unacceptable FPS degradation on the target Android device.


## v3.1 tactical layer
- [x] Per-tower target priorities: first / strongest / nearest / boss.
- [x] Upcoming-wave composition preview during build pause.
- [x] Mage slow → Cannon +25% impact/splash damage synergy.
- [x] Mage slow → Rift extra-chain synergy.
- [x] Existing Alpha-7 tester telemetry retained.
- [x] CI trigger generalized to all v3 release branches.


## v3.2 alpha readability + endless modifiers
- [x] Damage numbers with mobile density reduction and merge-on-cap accounting.
- [x] Explicit armor shield indicator beside enemy HP bars.
- [x] Rotating mini-boss wave modifiers every four waves after wave 8 (12, 16, 20, ...).
- [x] Stable `DenkmalTestHooks` surface for feature regression tests.
- [x] Dedicated `tests/v3.1-features.test.cjs` CI gate.
- [ ] Stronger hit-stop/camera impulse limited to boss and heavy cannon impacts.
- [ ] Final distinct production silhouettes for runner, guardian and sapper.
