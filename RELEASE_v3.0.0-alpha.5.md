# Denkmal TD v3.0.0-alpha.5

Closed tester alpha — 3 October 2026.

## Gameplay
- Mage slow now creates a real tower synergy: Cannon splash becomes larger and stronger when the primary target is slowed.
- Rift Lance gains one additional chain jump when its primary target is slowed.

## Readability
- Active off-screen spawn gates now get edge-of-screen direction indicators.
- Off-screen bosses get a dedicated red threat indicator.
- Build pads now show a placement ghost with the selected tower's range, role and visual identity.
- Build preview disappears away from valid free build pads to keep the battlefield clean.

## Tester tooling
- Optional FPS overlay added to the in-game menu.
- Overlay reports FPS, live enemy count and active FX particle count.
- Setting persists locally and remains disabled by default.

## Testing
- Added regression coverage for slowed-target tower synergies.
- Added placement-preview coverage.
- Added off-screen boss indicator coverage.
- Existing gameplay and Combat-FX suites remain the release gate.

## Tester priorities
1. Confirm build range circles are readable but not distracting on Android.
2. Verify boss/gate arrows are useful at wide and standard camera zoom.
3. Compare FPS overlay during waves 7–8 in AUTO and LOW graphics modes.
4. Stress-test Mage + Cannon and Mage + Rift combinations.
