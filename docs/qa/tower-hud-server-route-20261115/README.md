# Tower HUD QA server route

Base: main `f4d8559`, following the merges of #308 and #309.

CI run 43746206282 failed before exercising any HUD assertions: `DenkmalTestHooks is not defined`. Reproduced locally against the base. The server replaced `/v4-alpha9/` with an empty string, resolving `index.html` to `dist/.index.html` and returning HTTP 404. The prefix now maps to `/`. The test asserts HTTP 200 and waits for both game hooks and loader completion, so a missing loader on an error document cannot count as readiness.

Only the QA server and browser setup change. Production assets and gameplay are unchanged. `TD2_CHROMIUM_EXECUTABLE` allows the same script to use system Chromium locally.

Validation: `tests/tower-shop-hud.test.cjs`, `tests/cache-busting.test.cjs`, and five actual Chromium viewports (1649/1280/900 desktop, 412/360 mobile emulation). Browser results accompany this note. No new physical Android test or FPS/P95 measurement.

The earlier cold-start screenshot timeout in run 43744532619 did not reproduce in a local rerun: all four delayed/failed material startup cases passed with Chromium 156. This is not proof that the remote screenshot timeout is permanently resolved.
