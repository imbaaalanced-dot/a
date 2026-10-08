# Persistent Loot Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans; user authorized autonomous execution through release.

**Goal:** Permanent Diablo-inspired inventory with main-menu-only equipment changes.
**Architecture:** Independent versioned profile model, DOM inventory UI, immutable run loadout integrated with existing hero and combat.
**Tech Stack:** Vanilla JavaScript/CSS, Node VM tests, Python Pillow asset checks, GitHub Pages.
**Spec:** docs/superpowers/specs/2026-10-08-persistent-loot-design.md

## Global Constraints
Permanent finds; equipment changes exclusively from main menu. Eight equipment slots, 30 backpack cells, lossless overflow. Static dist with no runtime dependencies. German UI and touch controls. Save errors visible; imports validated before replacement.

## Review Focus
- Full inventory at death and wave completion must retain every item.
- Stale/malformed/future-version storage must not silently destroy a save.
- All non-menu routes must reject equipment/profile mutation.
- Repeated equip/reset must not accumulate bonuses or heal active runs.
- Mobile dialogs must scroll, expose actions, and restore focus.

### Task 1: Persistent inventory model
Files: dist/loot.js; tests/loot.test.cjs.
Interfaces: DenkmalLoot.create({storage,rng,canManage}), generate(wave,boss), add(item), equip(id,slot), unequip(slot), salvage(id), favorite(id), reforge(id), snapshot(), totals(items), exportJSON(), importJSON(text), profile/readOnly/status.
- [ ] Write failing tests for save/reload, guards, overflow, bounded rolls, powers, invalid imports, storage failure and run snapshots.
- [ ] Run node tests/loot.test.cjs and observe missing-model failure.
- [ ] Implement model, validate profile and atomic writes; rerun tests and commit.

### Task 2: Game integration
Files: dist/game.js, dist/hero-saga.js; tests/game.test.cjs; tests/v3.1-features.test.cjs.
Interfaces: game reset freezes model.snapshot() as hero.loadout; hero.stats derives bonuses without mutation. I/H enter inventory with return state; main menu button enables management. Loot drops and wave/milestone rewards call model.add immediately. Damage/crit/lifesteal/tower/chain apply only to intended attack origins.
- [ ] Replace superseded inventory/equip tests with new expected behavior and prove failure.
- [ ] Integrate, retaining legacy default effects and progression. Enforce read-only old wardrobe.
- [ ] Run all existing gameplay/FX/features tests desktop and mobile plus loot tests; commit.

### Task 3: Inventory interface and release
Files: dist/loot-ui.js, dist/loot.css, dist/index.html, README.md, RELEASE_v3.6.0-alpha.1.md, .github/workflows/*.yml.
Interfaces: DenkmalLootUI.create(model,{editable,onClose,onImport}) -> render/close; user actions go through model guards.
- [ ] Implement responsive eight-slot portrait, grid, overflow, selection/compare, filters, sort, favorites, salvage/reforge and export/import preview confirmation.
- [ ] Update tutorial/copy/version; wire model tests into CI and preserve separate deployed alpha3 directory.
- [ ] Run full suite, independent whole-branch review, fix important issues, commit.
- [ ] Push, open/merge PR after passing CI, tag release, wait for Pages success and test actual browser UI.
