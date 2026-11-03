# Westhofen Enemy Sheets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Integrate the five approved sheets cosmetically in Level 7.
**Architecture:** A scoped renderer before existing directional fallbacks. The asset manager owns five small atlases through the existing level:7 lifecycle.
**Tech Stack:** JavaScript Canvas, Node VM tests, Python Pillow/numpy/scipy.
**Spec:** docs/superpowers/specs/2026-11-03-westhofen-approved-enemy-sheets-design.md (approved by user, 2026-11-03).

## Global Constraints
- Level 7 only; no combat, save, wave or flying-enemy changes.
- 4 poses per action; Golem special art remains unused by combat.
- No main merge or changes to existing PR branches.
- Maximum 8 MiB additional decoded RGBA storage.

## Review Focus
- Cold/failed art: previous renderer remains visible.
- Release during image decode: no retained level group remains.
- Death already has alpha: do not fade twice.
- Non-finite clocks and progress: bounded valid frame selections.
- Low quality and reduced motion: stable poses and final death frame.

### Task 1: Mobile atlases and provenance
**Files:** tools/prepare-westhofen-enemies.py, dist/assets/enemies/westhofen/*, tests/westhofen-enemy-assets.test.py.
**Interfaces:** 144 px cells, 4 columns, 4 action rows (5 for golem), anchor [72,136], 128 px maximum content dimension; manifest with hashes, source crops and constant source scale per actor.
- [x] Write/run failing asset test: 5 RGBA sheets, 84 nonempty distinct poses, alpha gutters, <=8 MiB decoded.
- [x] Extract connected visible regions; preserve alpha inside each connected character/effect region. Pack with a fixed actor scale and baseline. Store unmodified sources outside dist and hashes in manifest.
- [x] Run asset test and commit.

### Task 2: Scoped renderer and lifecycle
**Files:** dist/westhofen-enemy-actions.js, dist/enemy-animations.js, dist/asset-manager.js, dist/index.html, tests/westhofen-enemy-actions.test.cjs, tests/cache-busting.test.cjs.
**Interfaces:** DenkmalWesthofenEnemyActions.draw(ctx,e,face,time,options) -> boolean. It consumes Task 1 atlases, existing attackAnim/.22, hit/.1, deathProgress and level.
- [x] Write/run failing tests for gating, action priority, timers, cold/failure fallback, mirrors, bounds, canvas restoration and read-only enemy state.
- [x] Implement draw; use existing asset manager readiness and level lifecycle, no Image allocation in renderer.
- [x] Add five URLs to levelAssets[7], one early renderer call and script before enemy-animations; bump changed script cache keys.
- [x] Run new tests, lifecycle tests and cache checks; commit.

### Task 3: Regression and handoff
**Files:** docs/releases/WESTHOFEN-ENEMY-SHEETS-QA.md.
- [x] Run all tests/*.test.cjs, tests/*.test.py, npm test --prefix ansturm-alpha1-5 and seven mobile suites from Westhofen workflow.
- [x] Attempt real browser rendering; document environment limitation if no browser is available.
- [x] Independent whole-branch review, address material findings and rerun relevant tests.
- [ ] Push only this new branch and create a draft PR; no merge. Record exact tested commit and remaining Android/browser checks.
