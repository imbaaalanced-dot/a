# Westhofen enemy sheets — integration QA

03 November 2026. Design and preview approved by the user. Isolated branch; no main merge.

## Implemented
- Five mobile WebP atlases: 84 authored poses, 4 columns, 144 px cells. The Golem's fifth action row is retained as art but introduces no new attack mechanic.
- Level 7 routing: wraith/runner -> swordsman, guardian -> shield knight, archer -> skeleton archer, sapper -> censer, boss -> Golem. Flying enemies and other levels retain their renderers.
- Priority death > hit > attack > movement > idle, driven by existing simulation timers.
- Fixed actor scale and foot anchor. One authored facing, optional mirroring; no claim of newly authored four-direction art.
- Existing level:7 ownership loads five shared atlases and releases them when leaving. No new images per enemy/frame.
- Download: 1,138,076 bytes of atlas data; decoded additional atlas area: 6,967,296 bytes (6.64 MiB).
- Originals remain in their source uploads; manifest records all five SHA256 hashes, crops, scales and destinations. Rebuild with tools/prepare-westhofen-enemies.py --sources PATH_TO_ORIGINAL_UPLOADS.

## Verification
- Unmodified baseline: 94/94 suite commands passed.
- Integrated suite: 96/96 commands passed (all *.test.cjs, all *.test.py, Ansturm npm test, seven mobile reruns).
- New asset and renderer tests observed failing before implementation and passing afterward.
- Independent review confirmed source hashes/crop pixel fidelity, bounds, routing, lifecycle, alpha and read-only combat state. Extreme finite clocks were found to overflow frame selection; a regression test failed first, then passed after modulo normalization.
- Native Canvas decoded all five atlases and rendered 20 samples (five actors x four actions). Composite visually inspected on dark ground. This is not an in-game browser test.
- git diff --check passed.
- Branch-specific read-only GitHub Actions workflow runs the same full suite on push. Remote CI outcome must be verified separately; no deployment is attached.

## Still open
- Actual in-game browser inspection of animation timing, fallback and cache reload.
- Physical Android 4 GB RAM: FPS, RAM pressure, touch, repeated level transitions, and animation readability.
- Runner/wraith share one visual identity; verify combat filters and speed keep their roles readable.
- Attack/hit use four source poses within the existing 0.22/0.1-second timers. Review at 1x and 2x speed on device.
- Local Chromium could not be installed: downloaded archive was truncated/invalid. No browser success is claimed.
- No new HTTPS build published. Existing Westhofen preview does not yet contain these changes.
