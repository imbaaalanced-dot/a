# Save & Portal Integrity Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden TD2 saves and portal transitions without losing older player progress.

**Architecture:** A small versioned-key helper migrates campaign flags and preferences. The existing loot v3 store stays unchanged. The portal store accepts its legacy v1 shape, writes an enveloped v2 shape, and gameplay commits reducer transitions before exposing their effects.

**Tech Stack:** Browser JavaScript, localStorage, Node.js `assert`/`vm` test scripts.

**Spec:** `docs/superpowers/specs/2026-10-24-save-portal-integrity-design.md`

## Global Constraints

- Isolated branch; never edit `main` or PR #56.
- No localStorage key deletion or overriding malformed/newer data.
- Inventory migration and reward IDs in `dist/loot.js` remain compatible.
- No packages/dependencies or runtime device fingerprinting.

## Review Focus

- Legacy true flags should remain true on reload after a new save.
- A partially written modern preference object should not reset or erase data.
- A second tab's portal revision must block stale writes.
- A perk buff must not be applied twice after quota failure.
- Boss loot may persist while portal checkpoint fails, so retries must be deduplicated.

---

### Task 1: Schema-aware progress/preferences

**Files:** Create `dist/persisted-state.js`; modify `dist/levels.js`, `dist/game.js`, `dist/index.html` and relevant existing VM fixtures; test `tests/persisted-state.test.cjs`.

**Interfaces:** `DenkmalPersistence.create(storage)` produces `load(key, version, defaults, validate, migrate)` and `save(key, version, value, validate)`; `load` returns `{status,value,writable}`.

- [x] Write failing tests for absent, migrated legacy, corrupt, partial, blocked and future-version records; observe RED.
- [x] Implement helper envelope and migration of four campaign flags and six preferences; observe GREEN.
- [x] Load helper before levels/game in browser and fixtures; preserve historical keys without deleting them.
- [x] Run `node --test tests/*.test.cjs`; expected 0 failures.
- [x] Commit tests, helper, wiring as `fix: version campaign progress and preferences`.

### Task 2: Portal-store migration and CAS

**Files:** Modify `dist/portal-run.js`; test `tests/portal-run.test.cjs`.

**Interfaces:** Preserve `PortalRun.createStore(storage).load()/save(run,expectedRevision)`; accept bare v1 payload on read; write `{schemaVersion:2,lastUpdated,run}` after CAS succeeds.

- [x] Write tests for bare v1 migration, malformed/incompatible saves, stale tab CAS and quota failure; observe RED.
- [x] Implement envelope with domain validation and preserve failed/unknown raw bytes; observe GREEN.
- [x] Run `node --test tests/portal-run.test.cjs tests/portal-gameplay.test.cjs tests/portal-storage.test.cjs`; expected 0 failures.
- [x] Commit as `fix: migrate and protect portal checkpoints`.

### Task 3: Commit portal transitions before UI changes

**Files:** Modify `dist/game.js`; test `tests/portal-gameplay.test.cjs` and new failure-focused cases.

**Interfaces:** A local commit function applies `PortalRun.reduce`, attaches a checkpoint to the candidate, persists via `createStore.save`, and only then switches `portalRun` and revision. Preserve existing recovery on phase `loading`.

- [x] Write failing tests for duplicate completion, failed CLEAR save, failed CHOOSE save and stale/resumed checkpoint; observe RED.
- [x] Refactor `endPortalWave`, `choosePortalPerk`, `enterPortal` and resume handling; ensure reward persistence precedes phase advancement; observe GREEN.
- [x] Run full `node --test tests/*.test.cjs` plus syntax checks of changed `.js`; expected 0 failures.
- [x] Commit as `fix: make portal transitions retry-safe`.

## Verification notes

- `node --test tests/*.test.cjs`: 54/54 passing on 2026-10-24.
- `node --check` for changed runtime scripts: passing.
- All `tests/*.test.py` asset scripts: passing when invoked individually; `pytest` is not installed in the workspace.
- Native Android browser / 4 GB RAM smoke test: pending before merge.
- Persistence across separate localStorage keys cannot be truly atomic; the shared boss reward identity and reward-before-checkpoint ordering make reload/retry safe.
