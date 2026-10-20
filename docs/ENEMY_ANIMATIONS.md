# Alpha 8 enemy movement integration

The enemy renderer now uses 21 generated movement designs, four frames each,
from `TD2-Gegneranimationen-v2`. The 640 × 3360 RGBA WebP contains 84 fixed
160 × 160 cells with transparent gutters. Download: 1,792,224 bytes; decoded
pixel budget: 8,601,600 bytes (about 8.2 MiB). No new runtime dependency.

`dist/enemy-animations.js` renders before the previous ground/flight art.
The atlas loads once, lazily; the startup preloader warms the same URL in its
existing four-worker queue. Cold/failed loads return to the old renderers;
failed runtime loads retry after five seconds. The renderer reads simulation
time, so pause freezes it and 2× simulation accelerates it. Stopped ground
units hold one pose. Low graphics or reduced motion holds one pose for all
units. Flying units otherwise continue their wingbeat while hovering.

Each spawn gets a cosmetic `visualVariant` counter. It never changes in
response to location, health or animation time. Designs map to existing
archetypes: dogs → runners, armored infantry → melee/guards, skeleton archer
→ archer, casters/spirits → mistcaller, gargoyles → existing flying types.
Boss cosmetics depend on the level: siege colossus in 1/3, bell sorceress in
2/6, black king in 4, ash lord in 5. Uprooted keeps its existing abilities and
uses the large siege-colossus artwork. These are cosmetic interpretations,
not 21 new enemy classes. HP, attacks, AI, drops, routes, waves and save
formats are unchanged. Tripling level duration is outside this graphics
integration and remains unimplemented.

Rebuild with `python tools/prepare-enemy-animations.py /path/to/TD2-Gegneranimationen-v2`.
Pillow is only an offline preparation/test dependency already used by this
repository. The source hashes and extraction rectangles are tracked in
`dist/assets/enemies/manifest.json`. Frames use one scale per creature and
aligned baseline (center for the source floating characters).

Validation: 35 Node suites; six mobile gameplay/preview runs; three Python
image-decoding suites; native Canvas render of all 21 skins; `git diff --check`.
The integration gameplay check exercises every existing ground/air/boss type
through the actual game draw path and verifies enemy state is unchanged.

Limitations: four generated movement phases, one facing mirrored left/right.
No separate directional back views or hand-painted action cycles. Attacks use
a brief lunge, hits use the existing flash plus recoil, and deaths use a short
squash/fade effect. These cues read simulation time and never retain a corpse
in the combat collection. Reduced motion suppresses displacement. Some pose and
armor-detail variation remains. Native Canvas validation is not an actual
Android touch/FPS playtest. Low-end devices still need a real horde playtest.

Stacked on PR #47's Alpha-8 branch. Isolated tester publication:
`/a/v4-enemies/v4-alpha8/`; preserves the root and existing Alpha-8 tester.
