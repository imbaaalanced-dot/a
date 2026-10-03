# Denkmal TD v3.0.0-alpha.3

Closed tester alpha — 3 October 2026.

## Gameplay
- Four production tower roles are playable: Bow, Cannon, Mage and Rift Lance.
- Mage applies a movement slow; Rift Lance chains damage through clustered enemies.
- Six normal enemy roles now rotate into waves: Wraith, Runner, Brute, Archer, Guardian and Sapper.
- Guardian has armor, Archer attacks from range and Sapper prioritizes the monument.
- Waves 1–8 now use explicit authored enemy counts; wave 5 contains the vertical-slice boss.

## UI / mobile
- Build controls are contextual and appear only at valid construction positions.
- Spawn gates have stronger labels, numbering and active-spawn telegraphing.
- Persistent settings added for sound, graphics quality and camera zoom.
- Four-tower arsenal is compacted for narrow mobile screens.

## Testing
- Regression coverage expanded for wave sizing, six enemy roles, armor, slow, chain damage and settings.
- Existing gameplay and Combat-FX CI remains the release gate.

## Tester priorities
1. Android joystick and action buttons.
2. FPS during waves 7–8.
3. Mage slow and Rift chain behavior.
4. Guardian/Archer/Sapper readability.
5. Level 2 construction slots and four-tower selection.
