# Denkmal TD v3.0.0-alpha.4

Closed tester alpha — 3 October 2026.

## Interface
- Level 1 now uses fixed build pads on all four approach lanes instead of free placement.
- The tower arsenal remains contextual and only appears when Marcel is actually at a valid free build pad.
- Mobile HUD spacing now respects safe-area insets and keeps joystick, actions and build controls separated.
- Compact mobile overrides reduce overlap between health, wave, resources and boss UI.

## Code / performance
- HUD text, width, visibility and disabled-state writes are cached to avoid redundant DOM work.
- Combat HUD refresh cadence is reduced from 12.5 Hz to about 8.3 Hz without slowing gameplay simulation.
- Browser/mobile resize no longer automatically pauses an active run.
- Build-slot lookup is shared between Level 1 and Level 2.

## Regression coverage
- Level 1 fixed build pads are covered by gameplay tests.
- Existing Level 2 slot, tower, wave, enemy-role and combat-FX tests remain part of the PR CI gate.

## Tester focus
1. Android joystick while moving near build pads.
2. Build menu appearing only at highlighted pads.
3. No HUD overlap in landscape mode.
4. No unwanted pause when browser chrome or viewport size changes.
5. Waves 7–8 FPS and boss readability.
