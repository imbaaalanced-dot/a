# Level 3 Kirchende – optional Style-2 monument pilot (2026-11-12)

Source: seven user-supplied memorial photographs and short video, documented in the companion reference PR #207. **This is an opt-in in-game asset test**, not historical architectural measurement or an Android release.

## Implemented
- `dist/assets/kirchende/monument-style2-pilot.webp`: 261 × 425 pixel, about 35 KiB. An isolated dark-fantasy stone memorial with helmet silhouette, moss and inscription plaques.
- `dist/assets/kirchende/opferplatte-style2-pilot.webp`: 470 × 248 pixel, about 37 KiB. Separate low memorial slab. This generated artwork contains decorative candles; it is **not** an exact reproduction of the bare stone in the photograph.
- `dist/kirchende-art.js`: the `td2KirchendeMemorialPilot=1` query parameter selects the new monument; the separate slab is painted on the existing cached memorial site. The default URL continues to use `monument-photo-v2.webp`.
- No new path coordinates, tower slots, hero stats, save keys, wave logic or release defaults.

## How to review
Open the existing TD2 test build with `?td2KirchendeMemorialPilot=1`, enter Level 3, inspect monument at 64/128px and portrait zoom. Compare against a second session without the parameter. Confirm the original monument stays in the normal version, both opt-in assets load without 404, and the lower separate plaque is legible without occluding units.

## Quality limitations
The generated sprite sheets with extra foliage, lanterns and architectural collage were **concept sheets**, not sprite files. Only the previously cropped PNG-derived transparent WebPs were integrated. Current game scale is 235 pixels high for the monument; the source at 261 × 425 px does **not** contain high-quality detail suitable for aggressive zooming. The historic helmet outline and side plaques still need real photograph comparison. The memorial slab may have unwanted fictional votive candles, and the existing stylized plaza fallback remains beneath its new sprite for safety. The image generation was not proof of architectural fidelity.

## Verification
- `node tests/kirchende-loading.test.cjs` (legacy path, retries)
- `node tests/kirchende-memorial-pilot.test.cjs` (pilot loads only under query, distinct slab and cached site)
- `python tests/kirchende-memorial-pilot.test.py` (WebP decode, alpha and transfer budget)
- Existing CI workflow runs these tests; **real Android 4GB device, actual FPS and touch are untested**.
- No merge until CI/Chromium passed and manual visual review of the new monument and plaque is complete.
