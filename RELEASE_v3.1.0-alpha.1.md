# Denkmal TD v3.1.0-alpha.1

Closed tester alpha — 3 October 2026.

## Tactical gameplay
- Every tower now has its own target priority: FIRST, STRONGEST, NEAREST or BOSS.
- Target priority can be cycled while standing near a tower using the new target action / T key.
- Build pauses now show the exact enemy composition of the upcoming wave.
- Mage slow now primes combo effects:
  - Cannon deals 25% more impact/splash damage to slowed enemies.
  - Rift Lance gains one additional chain jump when its primary target is slowed.

## Tester telemetry
- Optional TEST HUD shows FPS, active enemies and particle count.
- Telemetry can be toggled from the in-game menu and does not change simulation state.

## Engineering
- CI now runs on every v3 release branch, not only v3.0 alpha branches.
- Regression coverage now includes targeting modes, wave previews, telemetry and tower-combo behavior.
- 49 gameplay regression checks pass.
- Combat-FX regression suite passes.

## Tester priorities
1. Try all four target priorities on each tower role.
2. Verify wave preview readability on a phone in landscape mode.
3. Test Mage → Cannon and Mage → Rift combinations in waves 6–8.
4. Enable TEST HUD during heavy waves and report sustained FPS.
5. Re-check Level 2 build slots with the additional target button visible.
