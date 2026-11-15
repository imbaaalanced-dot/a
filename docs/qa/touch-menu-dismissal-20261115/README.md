# Touch menu dismissal

Baseline: `955eff8` (main). A touch on a free build pad while the HUD menu was open closed the menu on pointerdown, then opened the build selector on pointerup. The browser regression failed with `menu dismissal must not also open build selector`; it did not spend essence.

The canvas now clears pending tap state first and consumes menu-dismissal gestures before recording a selectable tap. Normal pad selection still requires a separate tap. No level geometry, costs or save format changed.

Verification:
- All 117 commands from the main test workflow passed locally.
- `TD2_CHROMIUM_PATH=/usr/bin/chromium node tools/verify-touch-guards-browser.cjs` tests levels 3/4 at 360×915 and 412×915 with browser-dispatched touch input: drag, HUD dismissal, paused backdrop, separate build selection and unchanged essence.
- Pad coordinates come from the real canvas render transform, not duplicated camera calculations. The dismissal target is checked to hit the canvas rather than a menu option. Scene startup and state inspection use existing test hooks; transactions use real touch UI. Google Fonts CSS is isolated to the app's fallback fonts. Chromium mobile emulation is not a physical Android test.
- The previously reported Redmi 15C acceptance remains user-reported. Additional FPS/P95 measurements remain skipped at the user's request.

The tower HUD workflow runs the new browser regression and uploads its report/screenshots. Merge and publication are separate pending steps.
