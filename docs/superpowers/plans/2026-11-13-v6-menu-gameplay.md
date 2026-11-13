# Denkmal TD2 V6 Menü- und Gameplay-Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Improve the existing V6 player journey from main menu through campaign selection into mobile-friendly tower-defense combat, without adding major gameplay systems.

**Architecture:** Keep the current Vanilla JavaScript, HTML/CSS and Canvas 2D architecture. Reuse the four current menu destinations, campaign progression and touch-context HUD; correct the player-facing Developer-Modus conflict, tighten the menu-to-run flow, and make only evidence-backed combat/UI fixes. Save formats and core balance remain unchanged.

**Tech Stack:** HTML, CSS, Vanilla JavaScript, Node.js `assert` VM tests, existing Chromium smoke workflow.

**Spec:** `docs/superpowers/specs/2026-11-13-v6-menu-gameplay-design.md`

## Global Constraints

- Target: mobile browser and Android with 4 GB RAM; desktop controls continue to work.
- Use Style 2 and the existing approved hero/menu assets; preserve originals.
- Do not add talent trees, currencies, meta-progression, new modes, or campaign in-progress saves.
- Campaign speed is limited to 1× and 2×; the player-facing Developer-Modus and its test unlocks are removed.
- Preserve campaign progression, loot, save keys, and data formats; do not change balance without a reproduced defect.
- Work from a fresh implementation branch based on current `main`; do not develop on `main` or modify existing PRs.
- Separate local tests, CI/Chromium, deployed preview, and real Android results; no merge or production publish without separate approval.

## Review Focus

- Legacy developer preference or test globals must not unlock campaign cards or enable 3×. **Pinned by Task 1 tests in `tests/game.test.cjs` and `tests/main-menu.test.cjs`.**
- Campaign completion/freischaltungen must not be mistaken for a resumable live run. **Pinned by Task 2 tests in `tests/menu-navigation.test.cjs`; existing saved-run resume stays covered by `tests/portal-gameplay.test.cjs`.**
- Long hero names, narrow portrait widths, and large text must not clip the four menu actions or create horizontal overflow. **Pinned by Task 2's responsive browser checks and focused menu assertions.**
- Pause, modal, drag, stale funds, or a full tower limit must not spend essence through the touch-context menu. **Pinned by Task 3 tests in `tests/context-hud.test.cjs` and `tests/touch-build.test.cjs`.**
- Enemies must respect role rules while still visibly threatening a nearby eligible hero; ranged enemies must not shoot through corners. **Pinned by Task 4 checks in `tests/game.test.cjs`.**

---

### Task 1: Remove player-facing Developer-Modus and enforce the 2× cap

**Files:**
- Modify: `dist/index.html` — remove the player-facing developer option, info and activation overlay.
- Modify: `dist/game.js` — remove developer preference, toggle, unlock bypass, developer-run persistence branch and 3× speed path; preserve isolated preview guards and test hooks that do not expose player controls.
- Modify: `tests/main-menu.test.cjs`, `tests/menu-navigation.test.cjs`, `tests/game.test.cjs`.

**Interfaces:**
- Consumes: Existing campaign unlock flags, `startGame(level, mode)`, `toggleSpeed()`, `simulationStepsPerFrame()`.
- Produces: Normal campaign starts only at genuinely unlocked levels; `toggleSpeed()` cycles 1×/2× where current rules allow; no persisted developer setting can alter runtime access.

- [ ] **Step 1: Replace the old developer-mode expectations with failing V6 assertions.** Cover absence of the options control and toast, rejection of locked level starts, ignored legacy storage/global values, no `developerRun` campaign path, and the 1×/2×/1× speed cycle.
- [ ] **Step 2: Run the focused tests and confirm the current main fails the new V6 assertions.** Run: `node tests/main-menu.test.cjs && node tests/game.test.cjs`.
- [ ] **Step 3: Remove the player-facing mode and its unlock/speed bypass from `dist/game.js` and `dist/index.html`, including developer-only entries in `DenkmalTestHooks`.** Keep `style2Preview` and other explicit test-preview guards separate; do not remove protected preview behavior as a side effect.
- [ ] **Step 4: Run `node tests/main-menu.test.cjs`, `node tests/menu-navigation.test.cjs`, and `node tests/game.test.cjs`.** Expected: all pass; every normal campaign run caps at 2× and locked cards remain locked.
- [ ] **Step 5: Commit** `fix: remove player developer mode and cap campaign speed`.

### Task 2: Simplify the menu-to-campaign flow and version presentation

**Files:**
- Modify: `dist/index.html` — primary menu, campaign submenu, version metadata and version-label controller.
- Modify: `dist/menu.css` — only the rules needed for menu hierarchy, responsive cards, focus/pressed states and compact version display.
- Modify: `dist/game.js` — menu state and progression labels only if a confirmed navigation defect requires it.
- Modify: `tests/main-menu.test.cjs`, `tests/menu-navigation.test.cjs`, `tests/version-menu.test.cjs`, `tests/menu-patch-a.test.cjs`, and `tests/cache-busting.test.cjs` when cache keys change.

**Interfaces:**
- Consumes: Existing menu actions `menuCampaignBtn`, `menuAnsturmBtn`, `menuCharacterBtn`, `menuOptionsBtn`, campaign map buttons and `mainMenu()` navigation.
- Produces: Four clear primary destinations; campaign labels derived from actual unlock/completion state; a single canonical `application-version` value populates both existing visible version labels. On the V6 development branch, the value is `V6 · ALPHA`.

- [ ] **Step 1: Add failing menu/version assertions.** Assert the four primary destinations, truthful lock/completion text, no campaign “Fortsetzen” claim, one canonical `V6 · ALPHA` value, and consistent version text in the masthead/footer.
- [ ] **Step 2: Run `node tests/main-menu.test.cjs && node tests/menu-navigation.test.cjs && node tests/version-menu.test.cjs` and confirm failures reflect the new assertions.**
- [ ] **Step 3: Refine only the current menu markup and CSS.** Keep existing IDs/handlers, hero assets, campaign/Ansturm destinations, keyboard focus, back-navigation and safe-area layout; do not add a campaign run-save feature or promote hidden test/pilot actions to primary actions.
- [ ] **Step 4: Update the canonical version metadata/controller and relevant asset cache keys.** Avoid a second hard-coded version source.
- [ ] **Step 5: Run the focused menu tests and cache-busting checks.** Expected: navigation returns to the correct parent panel; both labels match metadata; stale versioned assets are not requested.
- [ ] **Step 6: Check 320, 360, 393, 420 and 760 CSS-pixel widths, portrait/landscape, and large-text zoom in Chromium.** Expected: no horizontal overflow, clipped primary actions, or lost focus visibility.
- [ ] **Step 7: Commit** `style: clarify V6 menu and campaign navigation`.

### Task 3: Make combat phases and mobile tower actions unambiguous

**Files:**
- Modify: `dist/index.html` — combat status/action labels only as required.
- Modify: `dist/game.js` — existing state-to-HUD updates and touch routing only where a reproduced state mismatch exists.
- Modify: `dist/touch-context-hud.js` and `dist/combat-hud-v2.css` only if existing behavior fails the focused acceptance cases.
- Modify: `tests/context-hud.test.cjs`, `tests/touch-build.test.cjs`, `tests/game.test.cjs`, and `tests/cache-busting.test.cjs` if script/style URLs change.

**Interfaces:**
- Consumes: Existing `DenkmalTouchContext.create(root, actions)`, `openBuild(slot, choices)`, `openTower(tower, actions)`, `close()`, and `isOpen()`; existing game states `playing`, `paused`, `perk`, `levelcomplete`, and `gameover`.
- Produces: A phase-accurate compact HUD and touch actions that revalidate live game state before any build, upgrade, target change or sale. The desktop keyboard/mouse flow remains intact.

- [ ] **Step 1: Add failing cases for each actual gap found during baseline review.** Assert the HUD's phase label/available action across build, combat, pause, completion and game-over states; assert a stale or full build context cannot spend essence.
- [ ] **Step 2: Run `node tests/context-hud.test.cjs && node tests/touch-build.test.cjs && node tests/game.test.cjs` to confirm each new assertion is meaningful.**
- [ ] **Step 3: Make the smallest change in the existing state update/context callbacks.** Keep tower cost and tower-limit validation in the game callback at action time; a disabled visual control alone is not validation.
- [ ] **Step 4: Run the focused tests plus `node tests/portal-gameplay.test.cjs`.** Expected: touch actions apply only to the tapped slot/tower, invalid contexts close or remain safely disabled, and the existing Portal phase/save loop is unchanged.
- [ ] **Step 5: Commit** `fix: clarify combat phase and touch tower actions`.

### Task 4: Verify hero-threat and wave/boss feedback; fix only reproduced defects

**Files:**
- Modify: `dist/game.js` only if existing aggro or cue behavior fails a test.
- Modify: `dist/hero-saga.js` or `dist/combat-hud-v2.css` only if the failing behavior belongs there.
- Modify: `tests/game.test.cjs`; add `tests/gameplay-feedback-v6.test.cjs` only if an uncovered behavior cannot be expressed cleanly in the existing test harness.

**Interfaces:**
- Consumes: Existing enemy role rules, `update(dt)`, `launchWave()`, `wavePreview()`, `bossPhaseLabel()` and existing HUD/banner updates.
- Produces: Confirmed behavior for eligible enemy attacks, lane/corner restrictions, wave warnings and boss phases; no speculative enemy rebalance.

- [ ] **Step 1: Run the existing hero-aggro and feedback tests in `tests/game.test.cjs`.** Review cases for route pursuers, archers, off-lane attacks, focus-monument enemies, attack cues, wave banners and boss phase changes.
- [ ] **Step 2: If an acceptance case fails or the previously reported “enemies do not attack heroes” issue still reproduces in the actual build, add the smallest failing regression test for that exact role/map/state.** Otherwise record the existing behavior as verified and make no combat-AI change.
- [ ] **Step 3: For a reproduced failure, make the minimum role-aware correction in the owning function.** Preserve lane/corner checks, monument-focused enemy behavior, militia aggro, attack cooldown, dodge invulnerability and boss phase rules.
- [ ] **Step 4: Run `node tests/game.test.cjs && node tests/campaign-20-integration.test.cjs && node tests/portal-gameplay.test.cjs`.** Expected: normal combat, all seven 20-wave chapters, boss rewards and Portal behavior remain intact.
- [ ] **Step 5: Commit** `fix: restore verified hero threat feedback` if a correction was needed; otherwise include the verified no-code finding in the final PR summary without an empty commit.

### Task 5: Integrated V6 regression and review handoff

**Files:**
- Modify: focused files/tests from Tasks 1–4 only.
- Update: `docs/superpowers/specs/2026-11-13-v6-menu-gameplay-design.md` only if implementation reveals a material design change.

**Interfaces:** All existing campaign, save, loot, tower, hero, Ansturm and menu contracts remain the source of truth.

- [ ] **Step 1: Run focused suite:** `node tests/main-menu.test.cjs && node tests/menu-navigation.test.cjs && node tests/version-menu.test.cjs && node tests/game.test.cjs && node tests/context-hud.test.cjs && node tests/touch-build.test.cjs && node tests/campaign-20-integration.test.cjs && node tests/portal-gameplay.test.cjs && node tests/cache-busting.test.cjs`.
- [ ] **Step 2: Run the repository's `.github/workflows/test.yml` suite on Node 22, including its listed Node and Python asset commands, and run `git diff --check`; fix failures rather than skipping them.**
- [ ] **Step 3: Run `node tools/verify-hud2-browser.cjs` and `node tools/verify-combined-browser.cjs` for desktop and touch-emulated Chromium.** Capture the menu-to-campaign-to-gameplay path, pause/resume, wave start, one valid build, one invalid/stale build, and return to menu; confirm no runtime error or failed asset request.
- [ ] **Step 4: Run a focused physical Android 4 GB regression for the changed menu and gameplay interactions.** Record device/browser, tested build, touch findings and actual FPS/RAM readings if collected; do not reuse V5 measurements as V6 results.
- [ ] **Step 5: Inspect the final diff for unintended save, balance, art deletion or Ansturm changes.** Start the implementation from fresh `main` on a new code branch, keeping the planning-only branch separate.
- [ ] **Step 6: Push only the implementation branch and open a draft PR if any required preview/Android result remains outstanding.** Do not merge or publish production without separate explicit approval.

## Handoff

Implement in the same V6 scope, but begin with a new code branch from the latest verified `main`; this planning branch contains documentation only. Preferred execution is native in-session implementation, consistent with the project's solo-development preference. Pause before implementation until the user approves this plan.
