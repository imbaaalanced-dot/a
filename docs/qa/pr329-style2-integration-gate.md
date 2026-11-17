# PR #329 – Level 1–7 Style-2 Integration / QA Gate (2026-11-17)

## Runtime scope
- Level 1 (Einleitung) / 2 (Labyrinth): `style2-maps.js` shared cached painter; roads, lanes and tower slots unchanged. Existing `tests/style2-maps.test.cjs` proves cached draw and geometry invariance.
- Level 3 (Kirchende): `monument-style2-pilot.webp` is default in this PR. `?td2KirchendeMemorialLegacy=1` selects the photo; failed Style-2 decode falls back automatically. An unverified candle plaque is never loaded.
- Level 4 (Ender Dorfkirche / Löwe): existing church and lion unchanged.
- Level 5 (Hohensyburg): existing 2x V2 monument selected.
- Level 6 (Goethestraße): existing Style-2 memorial selected.
- Level 7 (Westhofen): current V3 SVG preview selected. Historical accuracy remains unresolved.

## Automated checks (separate from historical acceptance)
- Unit: `tests/style2-all-levels-runtime.test.cjs`, `tests/style2-maps.test.cjs`, `tests/kirchende-loading.test.cjs`, `tests/kirchende-memorial-pilot.test.cjs`.
- Chromium: `tools/verify-kirchende-memorial-browser.cjs` checks Style-2 default and legacy photo in desktop and touch-portrait, and produces 64px/128px previews plus Level 3 gameplay captures.
- WebP decode/alpha and size budget: `python tests/kirchende-memorial-pilot.test.py` in existing CI.
- No workflow publishes to GitHub Pages, no automatic release.

## Reviewed screenshot evidence (17 Nov 2026)
- GitHub Actions `TD2 Kirchende memorial pilot Chromium QA`, run `44026497720`, artifact `level3-kirchende-memorial-chromium`: desktop/touch-portrait Style-2 and photo-legacy captures, plus 64px/128px crops.
- **Visually confirmed**: the default Style-2 monument and the photographic legacy option render as different, recognizable monument images; the new version uses darker masonry and a prominent front inscription. The stone platform and background are present in both asset previews.
- **Not confirmed by these screenshots**: whether the stylized helmet, lettering, masonry profile and plaque match dated site references. A readable inscription in generated art is not evidence that the wording or geometry is authentic.
- **Release gate**: screenshots validate rendering only. Compare against original site photographs before marking Level 3 historically accepted; keep Level 7 Westhofen explicitly provisional.

## Still requiring human evidence
- **Historical fidelity**: compare Level 3 helmet silhouette/plaque, Level 4 church/lion, Level 5 Hohensyburg bronze/stone, Level 6 Goethestraße, Level 7 Westhofen with dated reference photos. Screenshots prove drawing but cannot establish architectural accuracy; Westhofen V3 is explicitly provisional.
- **Level 1/2**: current material/road/clearance unit audit is not a substitute for touch-portrait visual review.
- **Hardware**: Android device with 4 GB RAM, touch, low-memory and sustained-wave FPS/RAM QA not represented by headless Chromium. Keep release blocked until completed.

## Visual evidence review (17 Nov 2026)
Evidence: Chromium Action [#44026497720](https://github.com/imbaaalanced-dot/a/actions/runs/44026497720), artifact `level3-kirchende-memorial-chromium`; decoded artifact results contain four configurations (desktop and 390×844 touch portrait; Style-2 default and photo legacy), each with `errors: []`, `failedRequests: []`, `gameLevel: 3`, and `physicalAndroidTested: false`.

- **L3 visible:** Level-3 gameplay Canvas in 390px portrait renders the Style-2 monument, stone plaza and surrounding terrain. 64px and 128px thumbnails decode and display the silhouette; at 64px the inscription cannot be reliably read. No visible solid black/magenta image matte in the inspected captures.
- **Historical mismatch requiring adjudication:** the candidate shows a relatively short rectangular stone body with a prominent readable `UNSERN HELDEN` face; the existing legacy photo-derived sprite has a taller, more column-like profile and different visible surface treatment. The screenshot comparison cannot establish which geometry or inscription is faithful. Do **not** assert the new face text, helmet proportions, side relief or plaque as historically correct without the original dated reference photos.
- **L1/L2 visible in existing touch terrain montage:** Level 1 crossroads and Level 2 labyrinth lanes are distinguishable. The static scene previews do not prove collision clearance, building-pad hit boxes, multitouch, enemies traversing the maze, or measured sustained FPS.
- **L4–L7:** runtime references and files were checked automatically, but no dated-photo-by-photo landmark acceptance has been performed here. Level 7 Westhofen V3 remains explicitly provisional.
- **Hardware:** no physical 4 GB Android performance/interaction evidence was supplied by these Chromium runs.

## Decision matrix
| Gate | Evidence | State |
| --- | --- | --- |
| L3 default / legacy photo switching | Desktop and 390px touch Chromium, game canvas, 64/128px previews | Browser pass |
| L3 missing-image fallback | `tests/kirchende-loading.test.cjs` and memorial pilot tests | Automated pass on successful CI |
| L1/L2 cached ground + route invariance | `tests/style2-maps.test.cjs`, existing terrain previews | Automated pass; full playthrough open |
| L4–L7 asset presence / wiring | `tests/style2-all-levels-runtime.test.cjs` | Automated pass; visual history open |
| Authentic monument dimensions / inscriptions / materials | Dated real-world references and image side-by-side QA needed | **Not accepted** |
| Android 4 GB: first load, 20 waves, touch, memory, 60/30 FPS stability and resume | Device capture / test report needed | **Not tested** |
| Release / merge | All safety-critical runtime checks plus required human visual and device evidence | **Blocked** |

No landmark artwork was modified by this review. Keep PR in Draft and retain photographic fallback; do not equate the automated pass with historical or physical-device acceptance.

## Source-backed landmark identification (17 Nov 2026)
Do not collapse the following two distinct physical memorials into one level or reuse one memorial's inscription/model for the other:

1. **Kirchende across the road from the Ender Dorfkirche (Level 3 candidate):** World War I memorial at the former Hülfiskirchhof, commissioned after a design by Regierungsbaumeister Dengler of Dortmund and inaugurated **9 October 1927**, according to the local church archive/lagerbuch transcription. Wikimedia Commons identifies the memorial opposite the church and has dated photos from **13 November 2022**. This is the appropriate starting reference to verify the `monument-style2-pilot.webp` silhouette, faces, helmet and inscription; the current in-game text `UNSERN HELDEN` is **not authenticated** by these sources.
   - https://www.kdwupper.de/historischer_friedhof_herdecke_kirchende.html
   - https://commons.wikimedia.org/wiki/File:Herdecke,_Kirchender_Dorfweg,_Kriegerdenkmal_gegen%C3%BCber_der_Kirche.jpg
2. **Ender Dorfkirche churchyard (Level 4 church/lion candidate):** separate memorial with the reclining **sleeping lion**, erected **1879** for the dead of the 1864, 1866 and 1870–71 wars; the site account gives the dedication date **31 August 1879**. This must not be used as the reference for the opposite-side 1927 monument.
   - https://www.kdwupper.de/historischer_friedhof_herdecke_kirchende.html
   - https://www.herdecke.de/ (official heritage register: Kirchender Dorfweg 42, Ehrenmal „Schlafender Löwe“)

**Acceptance consequence:** before treating L3 art as historically final, inspect the specifically identified **opposite-church 1927** image from front and oblique side, then compare its footprint, side relief, top profile, materials and inscription with the rendered Level 3 sprite. Keep the current legacy fallback enabled until that comparison is approved. Do not swap the L4 lion into L3.
