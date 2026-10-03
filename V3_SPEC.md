# Denkmal TD v3 — Vertical Slice Specification

Target: v3.0.0 closed tester alpha.

## Architecture
- Static browser game under `dist/`; no runtime package dependencies.
- `game.js`: simulation, towers, spawning, input, rendering orchestration.
- `levels.js`: gates, paths, maze routing, build slots, level unlock persistence.
- `hero-saga.js`: Marcel progression, story, equipment, voice hooks.
- `combat-fx.js`: bounded combat particles/audio feedback.
- `tests/*.cjs`: headless regression checks with mocked DOM/canvas.
- GitHub Pages publishes `dist/` from `main`.

## v3 alpha task breakdown

### P0 — tester stability
- [x] Four deterministic spawn gates.
- [x] Level 2 maze routing and build-slot validation.
- [x] Touch joystick pointer capture/reset hardening.
- [x] Camera zoom 0.60 and compact combat HUD.
- [x] Rendering caches and offscreen culling.
- [x] Contextual Level 2 construction HUD.
- [x] CI gate for gameplay + combat-FX regression tests.
- [ ] Real Android device touch test.
- [ ] Sustained-wave FPS capture on a mid-range Android device.

### P1 — vertical slice completeness
- [ ] Four production tower roles exposed in the arsenal.
- [ ] Six distinct enemy roles.
- [ ] Eight-wave balancing pass plus one boss encounter.
- [ ] Finalized v3 map art and spawn-gate readability.
- [ ] Mobile settings for graphics/audio/zoom validated end-to-end.

### P2 — tester packaging
- [x] Versioned closed-alpha release notes.
- [ ] Publish alpha.2 to Pages after CI passes.
- [ ] Tester issue template with device/browser/level/wave/repro fields.
