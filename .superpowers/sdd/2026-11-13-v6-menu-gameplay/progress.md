# SDD ledger — plan: /workspace/scratch/78a9fc25c20e/docs/superpowers/plans/2026-11-13-v6-menu-gameplay.md

BASE: 6a9eed0cbc30e1c0a690814517f98f1b3c4a18b9 (verified origin/main at worktree creation)

Pre-flight: Task 1 produces the no-developer-mode/2× runtime contract consumed by Task 2 menu assertions; both touch `dist/index.html`, `dist/game.js` and menu tests, so complete Task 1 first and retain existing IDs outside developer controls.
Pre-flight: Task 2 stabilizes menu and campaign navigation used by Task 3's return-to-menu and state-to-HUD flow; they overlap in `dist/index.html` and `dist/game.js`, so keep menu-only changes in Task 2 and phase/HUD changes in Task 3.
Pre-flight: Task 3 and Task 4 both touch gameplay behavior/tests; run sequentially and keep Task 4 limited to reproduced aggro/wave/boss feedback defects.

Task 1: in progress

Task 1: complete
- Removed the player-facing Developer-Modus, persistent developer toggle, unlock bypass, and 3× runtime path; campaign speed is capped at 2×.
- Kept explicit preview-only safeguards and legacy-input regression checks.
- RED confirmed old menu and runtime paths failed the new assertions; GREEN verified `tests/main-menu.test.cjs`, `tests/menu-navigation.test.cjs`, `tests/version-menu.test.cjs`, `tests/game.test.cjs`, `tests/context-hud.test.cjs`, and `tests/touch-build.test.cjs`.
- `node --check dist/game.js` and `git diff --check` passed.

Task 2: complete (automated layout/browser run blocked by missing Chromium executable)
- Canonical metadata/build labels now read `v6-alpha`; the version controller still populates the masthead and footer from one source.
- Added an explicit first-chapter status and completion-aware labels for completed campaign maps; locked cards remain data-driven and the menu makes no campaign-resume claim.
- Kept the four primary destinations and existing IDs/handlers. Moved the version badge styling out of inline HTML and added visible keyboard focus plus compact responsive sizing.
- Bumped only the changed `menu.css` cache key.
- RED checks exposed the old V5 labels and missing truthful status text; GREEN: main-menu, navigation, version, and cache-busting tests all pass.
- Chromium viewport checks at 320/360/393/420/760 CSS px and landscape could not start: Playwright reports its Chromium executable is absent in this environment. No visual/browser result is claimed.

Task 3: verified existing behavior; no runtime changes required
- Touch context actions re-check live play state, funds, placement legality, unlocked tower class and tower capacity at click time. Tower upgrade/sell/target callbacks also re-check live state and membership.
- Added a regression case proving an open build palette cannot purchase after the tower limit is reached.
- Focused HUD and touch tests pass; combat phase labels already follow pause, perk, build, boss and Portal states in the existing update loop.

Task 4: verified; no combat-AI or balance change
- Existing gameplay regressions cover route enemies attacking nearby heroes on maze/Kirchende lanes, archers retreating while attacking, ranged corner/lane limits, off-lane safeguards, attack cues, wave banners and boss phase feedback.
- Desktop/mobile `game.test.cjs`, the 20-wave campaign integration and Portal gameplay pass; no reported aggro defect reproduced in the current runtime tests.
- Full CI-scope run caught four stale expectations that referenced removed `getDeveloperMode`/`developerRun` test interfaces and old V5 menu metadata. Updated those assertions to the V6 contract; all four focused regressions now pass.
