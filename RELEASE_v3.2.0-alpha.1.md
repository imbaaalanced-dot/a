# Denkmal TD v3.2.0-alpha.1

Readability and endless-wave modifier release based on v3.1.0-alpha.3 plus regression hardening.

## Gameplay/readability
- Floating damage numbers for hits and critical hits.
- Mobile/reduced-FX mode caps damage-number density at 8; desktop cap is 24 and overflow merges so damage accounting is preserved.
- Armored enemies show a shield indicator beside their HP bar.
- Every fourth wave after the authored wave-8 slice becomes a rotating mini-boss modifier wave (12, 16, 20, ...).

## Testability
- `globalThis.DenkmalTestHooks` exposes stable gameplay helpers used by regression tests.
- New `tests/v3.1-features.test.cjs` covers damage numbers, shared audio context, synergies, mini-boss plans, placement and targeting.
- CI runs gameplay, mobile gameplay, combat FX, and the v3.1/v3.2 feature suite.

## Still open
- Stronger hit-stop/camera impulse only for bosses and heavy cannon impacts.
- Final distinct production silhouettes for runner, guardian and sapper.
- Real Android Chrome/WebView long-run testing remains required.
