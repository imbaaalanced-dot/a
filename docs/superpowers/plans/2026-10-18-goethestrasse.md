# Goethestraße Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish playable Goethestraße Level 6 using the user's annotated photographs and map.
**Architecture:** Extend existing level definitions and game hooks; isolate site rendering in goethestrasse-art.js. Three ground routes and one separate airborne spawn; four mixed waves with warning, completion and endless unlock.
**Tech Stack:** Native browser Canvas, JavaScript, Node vm tests, Pillow asset checks.
**Spec:** User annotated uploads 86198 and 86200 and ten memorial photos; docs/GOETHESTRASSE_FLIGHT_ENEMIES.md.

## Global Constraints
- Retain all existing level routes and mechanics.
- Level 6 preserves the planned Hohensyburg number 5; no invented replacement chapter.
- Three ground inflows plus separate direct airborne approach; no paved air road.
- Separate tester build only; no main merge.
- Source geometry is illustrative, not surveyed.

## Review Focus
- Preview completion must not write campaign unlocks.
- Save failure must retain unlock for the session.
- Ground and air spawn points must never mix.
- End of wave 20 completes once; endless continues with mixed waves.
- Warm renderer must allocate no canvas per frame.

### Task 1: Layout and wave definition
Files: dist/levels.js, dist/goethestrasse.js, tests/goethestrasse.test.cjs.
Interfaces: DenkmalGoethe.enemyType(wave,index), waveName(wave), warning(wave), layout definition levels[6] and completeLevel6().
- [x] Write failing test for level6 geometry, slot clearance, all three air types, warning, save behavior.
- [x] Run node tests/goethestrasse.test.cjs; expect failure missing level6.
- [x] Implement layout, schedule and session-safe completion.
- [x] Run test; expect pass.

### Task 2: Full game integration
Files: dist/game.js, dist/index.html, tests/game.test.cjs, tests/cache-busting.test.cjs.
Interfaces: new schedule consumed before existing chapter selection; air uses level.airGate; existing targets and flight motion reused.
- [x] Write failing full-game test for start gate, mixed spawns, air origin, completion, endless lock, preview isolation.
- [x] Run test; expect assertion failure.
- [x] Implement menu, unlocks, spawns, warnings, campaign completion and endless mode.
- [x] Run full Node suite and coarse-pointer tests; expect pass.

### Task 3: Site rendering and delivery
Files: dist/goethestrasse-art.js, docs/GOETHESTRASSE_LEVEL.md, workflows.
Interfaces: DenkmalGoetheArt.drawGround(ctx), drawMonument(ctx,m), drawAirLane(ctx,layout,active).
- [x] Add failing renderer cache and actual draw tests.
- [x] Implement lawn/road, brick paths, flagstone apron, rose beds, two pillars and seated soldier with gabled wall.
- [x] Render and visually inspect standalone preview, then run full test/asset suite.
- [x] Fresh review, fix material findings, commit and publish separate testbuild; verify both workflows.

## Execution ledger
Ruling: Continue native execution authorized earlier; no repeated plan-approval pause.
Ruling: Level6 unlocked after4 until reserved chapter5 exists; menu explicitly labels this arrangement. Wrong assumption costs only later unlock remapping.

Task 1: complete — geometry/wave/save tests RED then GREEN.
Task 2: complete — game start/spawn/completion/preview tests RED then GREEN.
Task 3: renderer/cache/assets and all Node suites passed. Native Canvas preview inspected.
Final review: independent gpt-6-astra reviewer found incorrect air-spawn threat cue; corrected origin and ground-gate highlighting. New full-game assertion RED then GREEN; full desktop/mobile suites rerun before publish.
