# Denkmal TD2 · Kim/Marcel Sprite Integration V5b (2026-11-09)

## Sources and reference lock

User-supplied RGBA PNG images, original copies preserved in
`source-art/hero/2026-11-09/`; no faces, outfits, weapons, or poses regenerated.
Kim is the bow-wielding marksman and Marcel the sword/shield guardian.

| Source | Role | Grid | Decision |
| --- | --- | --- | --- |
| 4459 (Kim) | 4-way walk | 3 columns × 4 rows, 362 px | Integrated: clean cell margins |
| 4458 (Marcel) | 4-way walk | 3 columns × 4 rows, 362 px | Integrated: clean cell margins |
| 4342 (Kim) | Side actions | 6 columns × 6 rows, 256 px | Integrated for **left** facing only |
| 4344 (Marcel) | Side actions | 6 columns × 6 rows, 256 px | Integrated for **right** facing only |
| 4461 (Kim alternative) | Walk | 3×4 | Rejected: art touches and crosses frame edges in rows 0/1 |
| 4460 (Kim alternative) | Walk | 3×4 | Not chosen: more near-invisible matte pixels than 4459 |
| 4336 (duo) | Sideward pose study | 4×2, 443.5 px/cell | Not integrated: not a valid integer-grid 4-way sheet |

## Runtime atlas contract

| Actor/action | WebP | Grid | Cell | Mapping | Contact pivot | Playback |
| --- | --- | --- | --- | --- | --- | --- |
| Kim walk | `kim-walk-v5b.webp` | 3×4 | 256 px | down/up/left/right rows 0/1/2/3 | bottom-center, existing walk draw | 9 fps when moving |
| Marcel walk | `marcel-walk-v5b.webp` | 3×4 | 256 px | same | bottom-center | 9 fps |
| Kim combat | `kim-side-actions-v5b.webp` | 6×6 | 128 px | attack row 2, hit row 4, death row 5 | [64,117], target art height 100 | 6 frames over game action timer |
| Marcel combat | `marcel-side-actions-v5b.webp` | 6×6 | 128 px | same | [64,116], target art height 95 | 6 frames over game action timer |

The other three side-sheet rows (idle, locomotion and special effect) remain
preserved in the master and runtime atlas, but are **not** advertised as
four-direction animations. The left/right asymmetry is intentional: the new
side view is authored leftward for Kim, rightward for Marcel. We never mirror
their bow, sword, or shield. Other facings continue to use the existing 4×12
directional action atlases. A cold/not-ready/invalid side image also falls
back to those atlases; draw state is protected by `save/restore`.

Build: `python tools/export-hero-sprites-v5b.py`. It only clears alpha < 16,
resamples to Android-friendly sizes, and exports lossless WebP. Its PNG inputs
are unchanged. Total V5b runtime compressed size is about 1.5 MiB. Two walk
atlases are 3 MiB decoded each, two side atlases 2.25 MiB decoded each; the
walk loader holds one actor at a time. That is texture arithmetic, **not** a
measured device RAM saving or proof of frame rate.

## QA and release gates

- Run `node tests/hero-sprites-v5b.test.cjs`, `node tests/hero-style2-v5.test.cjs`,
  `node tests/directional-actions-v410.test.cjs`, and
  `python tests/hero-sprites-v5b.test.py`.
- Visual-check the actual Canvas actor at 64/128 CSS pixels for color fringes,
  pivot, bow/shield clipping and smooth walk/attack/hit/death transitions.
- Test menu → gameplay, character switch, all four directions, reduced-motion,
  attack target facing, cold asset decode and long-session cache behavior.
- **Physical Android (4 GB RAM): pending.** Measure FPS/RAM/touch in portrait
  and landscape on the published build; do not infer from Node or desktop tests.
- Main merge and Pages publication must be verified by their actual results.
