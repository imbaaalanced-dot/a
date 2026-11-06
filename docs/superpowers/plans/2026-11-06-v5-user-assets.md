# V5 User Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Audit all ten uploaded V5 images and integrate two approved transparent, Android-light hero-menu portraits on a new branch.

**Architecture:** Two versioned WebP portraits continue through the guarded existing menu decorator. The remaining sources stay out of runtime, with a traceable QA record. No gameplay or save mutation.

**Tech Stack:** Static HTML/CSS/JS Canvas 2D game; Python Pillow asset checks, Node VM menu tests, WebP runtime exports.

**Spec:** `docs/superpowers/specs/2026-11-06-v5-user-assets-design.md`

## Global Constraints

- Do not change `main`, existing PRs or published Pages paths.
- Keep historical Westhofen monument and level routes unchanged.
- Keep the existing fallback menu and all navigation handlers functional.
- Test output is not an Android device acceptance.

## Review Focus

- A missing V5b image must not block the playable menu.
- Old V5 assets must remain present for rollback.
- Transparent margins must not decode as black/pink in browsers.
- Tiny portrait viewports must not obscure menu buttons.
- A decorative concept must not silently replace the Westhofen memorial.

---

### Task 1: Asset QA and optimized exports

**Files:**
- Create: `tests/v5-user-asset-qa.test.py`
- Create: `dist/assets/menu/v5-avatars/marcel-guardian-v5b.webp`
- Create: `dist/assets/menu/v5-avatars/kim-marksman-v5b.webp`
- Create: `docs/qa/V5_UPLOADED_ASSETS_20261106.md`

**Interfaces:** Produces two transparent WebP paths under `dist/assets/menu/v5-avatars/` for Task 2.

- [ ] Write tests asserting real WebP, 500×680 upper bound, transparent corners, significant alpha coverage and ≤150 KiB.
- [ ] Run `python3 tests/v5-user-asset-qa.test.py`, observe missing-file failure.
- [ ] Export images from the generated, transparent masters to versioned runtime WebP files.
- [ ] Rerun the asset test and inspect reduced-size silhouettes.
- [ ] Record all ten originals with real formats, alpha status, roles and blockers.

### Task 2: Connect the guarded menu stage

**Files:**
- Modify: `dist/portrait-avatars-v5.js`
- Modify: `dist/index.html`
- Modify: `tests/portrait-avatars-v5.test.cjs`

**Interfaces:** Consumes Task 1's `marcel-guardian-v5b.webp`, `kim-marksman-v5b.webp`.

- [ ] Extend the existing portrait menu test to require versioned V5b paths and cache key; observe it fail.
- [ ] Change only the V5 stage image paths and its script cache key; keep failure fallback and button handlers.
- [ ] Run portrait test and asset QA; verify green.
- [ ] Run Westhofen and other applicable regressions; inspect `git diff` for unrelated changes.

### Task 3: Branch verification and handoff

**Files:** QA record and commits above.

**Interfaces:** No new runtime behavior.

- [ ] Run relevant full tests and determine actual browser/Android coverage.
- [ ] Inspect branch changes and commit with traceable message.
- [ ] Push only the new branch if repository access works; never merge or publish.
- [ ] Report exact branch, changed files, unintegrated assets and unverified Android steps.
