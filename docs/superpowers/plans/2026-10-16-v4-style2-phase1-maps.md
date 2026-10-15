# Denkmal TD2 V4 Style 2 – Phase 1 Maps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved Style-2 visual contract, data-driven map renderer, debug validation, and four layered high-resolution map backgrounds without changing combat or path logic.

**Architecture:** Keep `DenkmalLevels.levels` authoritative for gates, paths, slots, and objectives. Load map-specific JSON manifests and WebP layers through a small `DenkmalMapArt` module, with the existing procedural rendering as a safe fallback. Produce 3072 px desktop and 2048 px Android variants and validate geometry, provenance, decoding, budgets, and responsive presentation before publishing an isolated tester build.

**Tech Stack:** Vanilla JavaScript IIFEs, Canvas 2D, JSON, WebP/PNG, Node.js 22 tests, Python 3 with Pillow, GitHub Pages workflows.

**Spec:** `docs/superpowers/specs/2026-10-16-v4-graphic-overhaul-style2-design.md`

## Global Constraints

- Work only on `feature/v4-graphic-overhaul-style2`; do not modify `main` or an existing live build.
- World geometry remains exactly 3072 × 3072 and `dist/levels.js` remains authoritative.
- Use 2.5D top-down artwork; do not introduce an isometric coordinate transform.
- Do not change combat stats, wave rules, enemy paths, tower ranges, save keys, or unlock behavior.
- Desktop map layers are 3072 × 3072 WebP and at most 3 MB for the combined desktop map.
- Android map layers are 2048 × 2048 WebP and at most 1.5 MB for the combined Android map.
- Any single Android runtime texture is at most 2048 px per edge.
- Build pads, arrows, labels, and rank stars remain runtime UI and are never baked into backgrounds.
- Only the selected map is loaded; missing or failed Style-2 assets fall back to existing procedural art.
- Historical metadata uses only `belegt`, `rekonstruiert`, or `kuenstlerisch`.
- Level 4 enemies end at the sleeping lion, not the church.
- Existing Node and Pillow test suites must remain green.

## Review Focus

- Missing, corrupt, or timed-out WebP files must preserve a playable procedural fallback; Task 2 tests this.
- A stale or malformed map manifest must fail validation without changing `DenkmalLevels`; Tasks 1 and 2 test this.
- Android selection must never request a texture larger than 2048 px; Tasks 2 and 5 test this.
- Foreground layers must not permanently hide actors or paths; Tasks 2, 4, and 5 test opacity and layer ordering.
- Level 4 art must preserve the church/lion separation and lion objective even when artwork is scaled; Tasks 4 and 5 test this.

---

## File Structure

**Create**

- `docs/art/v4-style2-styleguide.md` — palette, materials, lighting, perspective, anchors, and export rules.
- `dist/map-art.js` — manifest loading, variant selection, layer drawing, failure fallback, and debug overlay.
- `dist/assets/maps/level-1/map.json`
- `dist/assets/maps/level-2/map.json`
- `dist/assets/maps/level-3/map.json`
- `dist/assets/maps/level-4/map.json` — per-map layer, provenance, and object metadata.
- `dist/assets/maps/level-N/{ground,paths,decor-back,decor-front}-{desktop,mobile}.webp` — eight runtime layers per map.
- `tests/map-manifest.test.cjs` — schema and geometry-reference contract.
- `tests/map-renderer.test.cjs` — loader, variant, order, timeout, and fallback contract.
- `tests/map-assets.test.py` — decode, dimensions, transparency, and byte budgets.
- `tests/map-layout.test.cjs` — path/slot/building clearances and Level-4 target separation.
- `docs/art/v4-style2-map-review.md` — signed visual checklist and historic/artistic classification.

**Modify**

- `dist/index.html` — load `map-art.js` with a versioned URL before `game.js`.
- `dist/preloader.js` — request only the selected level's map manifest and selected size variant.
- `dist/game.js` — call `DenkmalMapArt` passes while retaining procedural fallbacks.
- `dist/polish.css` — debug-overlay switch and no production visual changes outside Style-2 maps.
- `tests/assets.test.py` — include the new map asset suite.
- `tests/level4.test.cjs` — assert art target separation still agrees with level geometry.
- `.github/workflows/test.yml` — run new Node and Pillow suites on the graphic-overhaul branch.
- `.github/workflows/pages.yml` — add a manual isolated `v4-style2/` tester publish gate.

## Interfaces

The plan uses these stable interfaces across tasks:

```js
globalThis.DenkmalMapArt = {
  load(level, options = { mobile: false, timeoutMs: 8000 }),
  ready(level),
  draw(ctx, level, pass, view),
  drawDebug(ctx, level, definition),
  unloadExcept(level),
  manifest(level)
};
```

- `load(level, options) -> Promise<boolean>`: true only when all required layers for the selected variant decode.
- `ready(level) -> boolean`: reports complete selected-variant readiness.
- `draw(ctx, level, pass, view) -> boolean`: draws `ground`, `paths`, `decor-back`, or `decor-front`; false requests the existing fallback.
- `drawDebug(ctx, level, definition) -> void`: overlays gates, paths, slots, structure bounds, and objective.
- `unloadExcept(level) -> void`: releases Image references for every other map.
- `manifest(level) -> object | null`: read-only review access.

Each `map.json` has:

```json
{
  "id": "level-1",
  "version": "v4-style2-1",
  "world": {"width": 3072, "height": 3072},
  "gameplay": {
    "level": 1,
    "paths": "DenkmalLevels.levels[1].paths",
    "slots": "DenkmalLevels.levels[1].slots",
    "objective": "game.monument"
  },
  "layers": [{
    "id": "ground",
    "pass": "ground",
    "desktop": "ground-desktop.webp",
    "mobile": "ground-mobile.webp",
    "alpha": false,
    "order": 0
  }],
  "structures": [],
  "sources": []
}
```

---

### Task 1: Freeze the Style and Manifest Contracts

**Files:**
- Create: `docs/art/v4-style2-styleguide.md`
- Create: `tests/map-manifest.test.cjs`
- Create: `dist/assets/maps/level-{1,2,3,4}/map.json`
- Modify: `.github/workflows/test.yml`

**Interfaces:**
- Consumes: approved design spec and `DenkmalLevels.levels[1..4]`.
- Produces: the exact JSON contract consumed by `DenkmalMapArt.load` in Task 2.

- [ ] **Step 1: Write the failing manifest test**

Create `tests/map-manifest.test.cjs`. Assert all four JSON files use unique ids `level-1` through `level-4`, world size 3072 × 3072, matching `DenkmalLevels` references, and exactly four required passes in order: `ground`, `paths`, `decor-back`, `decor-front`. Assert desktop/mobile WebP paths, approved historical statuses, source metadata for Levels 3/4, the Level-4 `sleeping-lion` objective, and absence of independent geometry arrays.

- [ ] **Step 2: Run the test and verify the contract is absent**

Run: `node tests/map-manifest.test.cjs`  
Expected: FAIL because the four manifests do not exist.

- [ ] **Step 3: Write the production styleguide**

Create `docs/art/v4-style2-styleguide.md` with the approved camera, shadow, palette, material, path-contrast, anchor, no-baked-UI, size, layer, alpha, and export rules. Include a compact export checklist.

- [ ] **Step 4: Add the four manifests**

Create the four `map.json` files with the exact schema. Level 3 identifies Kirchende memorial and cemetery references. Level 4 identifies the village church and 1879 sleeping lion. Non-surveyed routes, hidden facades, vegetation, fog, and lanterns are `rekonstruiert` or `kuenstlerisch`.

- [ ] **Step 5: Run the manifest test**

Run: `node tests/map-manifest.test.cjs`  
Expected: PASS with four validated contracts.

- [ ] **Step 6: Add the test to CI and commit**

Add the graphic-overhaul branch to the push trigger and the manifest test to the job.

```bash
git add docs/art/v4-style2-styleguide.md dist/assets/maps tests/map-manifest.test.cjs .github/workflows/test.yml
git commit -m "docs(v4): freeze Style 2 map contracts"
```

---

### Task 2: Add the Layered Map Loader and Debug Overlay

**Files:**
- Create: `dist/map-art.js`
- Create: `tests/map-renderer.test.cjs`
- Modify: `dist/index.html`
- Modify: `dist/preloader.js`
- Modify: `dist/game.js`
- Modify: `dist/polish.css`

**Interfaces:**
- Consumes: the JSON schema from Task 1.
- Produces: `globalThis.DenkmalMapArt` with the shared interfaces.

- [ ] **Step 1: Write the failing renderer tests**

Create `tests/map-renderer.test.cjs` with fake `fetch`, `Image`, and Canvas contexts. Assert desktop/mobile selection, level-scoped loading, rejection of oversized mobile textures, false on fetch/image/manifest/timeout failures, draw readiness, manifest order, `unloadExcept`, debug geometry reads, and immutability of level definitions.

- [ ] **Step 2: Run the renderer test**

Run: `node tests/map-renderer.test.cjs`  
Expected: FAIL because `dist/map-art.js` does not exist.

- [ ] **Step 3: Implement `DenkmalMapArt`**

Implement the shared interface in `dist/map-art.js`. Manifest URLs are `assets/maps/level-${level}/map.json?v=v4style2-1`; default timeout is 8000 ms; required failure resolves false; foreground actor-near opacity never drops below 0.22; parsed manifests are frozen; unloading clears non-selected references.

- [ ] **Step 4: Connect loading without removing fallbacks**

Load `map-art.js?v=v4style2-1` before `game.js`. Start loading only after level selection. Draw Style-2 ground, paths, and back decor before actors; front decor after actors. Call existing procedural drawing whenever a pass returns false. Enable debug only through `?debug=maps`. Do not write geometry.

- [ ] **Step 5: Run renderer and existing regressions**

```bash
node tests/map-renderer.test.cjs
node tests/terrain-polish.test.cjs
node tests/level4.test.cjs
node tests/game.test.cjs
TEST_MOBILE=1 node tests/game.test.cjs
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add dist/map-art.js dist/index.html dist/preloader.js dist/game.js dist/polish.css tests/map-renderer.test.cjs
git commit -m "feat(v4): add layered Style 2 map renderer"
```

---

### Task 3: Produce and Integrate Levels 1 and 2

**Files:**
- Create: `dist/assets/maps/level-{1,2}/*-{desktop,mobile}.webp`
- Create: `tests/map-assets.test.py`
- Create: `tests/map-layout.test.cjs`
- Modify: `dist/assets/maps/level-{1,2}/map.json`

**Interfaces:**
- Consumes: Task 1 manifests and Task 2 loader.
- Produces: complete Style-2 runtime layers for tutorial and labyrinth.

- [ ] **Step 1: Write failing Level 1/2 asset checks**

Assert all eight files per level decode, desktop images are exactly 3072 × 3072, mobile images exactly 2048 × 2048, overlays contain transparent pixels, and combined budgets are 3,000,000 desktop / 1,500,000 mobile bytes. Assert Level 1 keeps four straight center paths, Level 2 references the existing single maze path, existing slot clearances remain valid, and manifests contain no baked slot coordinates.

- [ ] **Step 2: Run tests and verify missing assets**

```bash
python tests/map-assets.test.py --levels 1 2
node tests/map-layout.test.cjs --levels 1 2
```

Expected: asset test FAILS on missing WebP files.

- [ ] **Step 3: Generate the Level 1 layered master**

Generate a center clearing, four symmetrical bright paved approaches, reduced fog, low edge vegetation, and four gate settings aligned to current gates. Do not bake monument, arrows, pads, labels, actors, or towers. Export ground, paths, back decor, and front decor in both sizes with matching world alignment.

- [ ] **Step 4: Generate the Level 2 layered master**

Generate one visible entry matching `maze[0]`, a continuous bright winding route matching every existing segment, low dark hedges, broken stone walls, and lanterns at turns. Do not bake towers, pads, arrows, labels, or actors. Export four passes in both sizes.

- [ ] **Step 5: Update manifests and run tests**

```bash
python tests/map-assets.test.py --levels 1 2
node tests/map-manifest.test.cjs
node tests/map-layout.test.cjs --levels 1 2
node tests/map-renderer.test.cjs
```

Expected: all PASS.

- [ ] **Step 6: Perform visual checks and commit**

Check both maps with `?debug=maps` at 360 × 800, 412 × 915, 1366 × 768, and 1920 × 1080. Reject path drift or permanent route occlusion.

```bash
git add dist/assets/maps/level-1 dist/assets/maps/level-2 tests/map-assets.test.py tests/map-layout.test.cjs
git commit -m "art(v4): add Style 2 introduction and labyrinth maps"
```

---

### Task 4: Produce and Integrate Levels 3 and 4

**Files:**
- Create: `dist/assets/maps/level-{3,4}/*-{desktop,mobile}.webp`
- Modify: `dist/assets/maps/level-{3,4}/map.json`
- Modify: `tests/map-assets.test.py`
- Modify: `tests/map-layout.test.cjs`
- Modify: `tests/level4.test.cjs`

**Interfaces:**
- Consumes: Tasks 1–3 and current `KirchendeArt` / `DenkmalChurch` structures.
- Produces: classified base environments for Kirchende and the Ender churchyard; replacement structure sprites remain Phase 2.

- [ ] **Step 1: Extend failing asset and provenance tests**

Assert Level 3/4 layers and budgets, non-empty source label/URL for non-artistic metadata, Level-3 memorial/cemetery references, Level-4 church scenery and sleeping-lion objective, church bounds north/west of the objective, at least 450 world pixels of separation, all Level-4 paths ending at center, and foreground minimum opacity 0.22.

- [ ] **Step 2: Run tests and verify missing assets**

```bash
python tests/map-assets.test.py --levels 3 4
node tests/map-layout.test.cjs --levels 3 4
node tests/level4.test.cjs
```

Expected: new asset/provenance assertions FAIL; legacy geometry remains green.

- [ ] **Step 3: Generate the Level 3 layered master**

Use the documented road, footpath, cemetery boundary, terrain slope, and tree groups. Keep all four current approaches aligned, edge houses dark, and the center clear for the separate monument. Mark hidden connections as reconstructed. Bake no monument, actor, enemy, tower, pad, label, or arrow.

- [ ] **Step 4: Generate the Level 4 layered master**

Use churchyard/cemetery context north and west, preserve a clear forecourt, and keep church and lion as separate runtime objects. Paths remain continuous to the lion. Graves, walls, and trees frame rather than block routes. Bake no church, lion, actor, enemy, tower, pad, label, or arrow.

- [ ] **Step 5: Update manifests and run all map suites**

```bash
python tests/map-assets.test.py --levels 1 2 3 4
node tests/map-manifest.test.cjs
node tests/map-layout.test.cjs --levels 1 2 3 4
node tests/map-renderer.test.cjs
node tests/level4.test.cjs
TEST_MOBILE=1 node tests/level4.test.cjs
```

Expected: all PASS.

- [ ] **Step 6: Perform historical/artistic review and commit**

Check Level 3/4 at all target viewports with debug overlays. Confirm church/lion separation, objective, routes, classification, and sources.

```bash
git add dist/assets/maps/level-3 dist/assets/maps/level-4 tests/map-assets.test.py tests/map-layout.test.cjs tests/level4.test.cjs
git commit -m "art(v4): add Style 2 Kirchende and churchyard maps"
```

---

### Task 5: Optimize, Document, and Publish the Isolated Map Test Build

**Files:**
- Create: `docs/art/v4-style2-map-review.md`
- Modify: `tests/map-assets.test.py`
- Modify: `.github/workflows/test.yml`
- Modify: `.github/workflows/pages.yml`
- Modify: `dist/preloader.js`
- Modify: `dist/index.html`

**Interfaces:**
- Consumes: all four maps and `DenkmalMapArt`.
- Produces: a budget-checked, manually publishable `v4-style2/` tester build and review record.

- [ ] **Step 1: Add final failure-mode assertions**

Assert aggregate initial Style-2 load below 10,000,000 bytes, no eager unselected-map URLs, cache-version agreement, debug disabled by default, actor-near opacity at least 0.22, and Level-4 manifest/geometry agreement.

- [ ] **Step 2: Run the full suite before optimization**

Run all commands from `.github/workflows/test.yml`, plus the four map suites. Expected: any over-budget or stale-cache asset fails with path and actual byte count.

- [ ] **Step 3: Optimize only failing assets**

Re-export WebP quality and layer boundaries without changing pixel alignment. Keep desktop exactly 3072 and mobile exactly 2048. Re-run the asset suite after every batch.

- [ ] **Step 4: Record visual and device QA**

Create `docs/art/v4-style2-map-review.md` with all viewport/level checks, geometry visibility, Level-3/4 classification, Android device/browser/wave/FPS, known issues, and the explicit Phase-1 boundary.

- [ ] **Step 5: Add isolated manual publishing**

Extend `.github/workflows/pages.yml` so only manual dispatch from the graphic-overhaul branch publishes under `v4-style2/`. Run the complete suite first and do not overwrite root or existing `v4-alpha*` folders.

- [ ] **Step 6: Verify and commit**

Run the complete suite, inspect the diff, and verify `main` is unchanged.

```bash
git add dist docs/art tests .github/workflows
git commit -m "release(v4): prepare isolated Style 2 map tester build"
```

---

## Phase Boundary

This plan delivers the Style-2 guide, four map environments, runtime layers, Android variants, validation, and isolated tester build.

It deliberately excludes final replacement monument/church/lion sprites, five tower families, projectiles/FX, HUD, icons, and main-menu redesign. Those receive separate plans:

1. Phase 2 — historical structures and reusable environment sprites;
2. Phase 3 — five tower families, projectiles, and combat FX;
3. Phase 4 — HUD, icons, main menu, integration, and release candidate.
