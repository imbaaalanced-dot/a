# Portalreise — Task 1: state and economy

Base: PR #51 head `682451cc1b9f9e513881347566951be217e9ce3e`.
Branch: `feature/td2-portalreise-task1-20261020`.
Scope: pure state/economy module only; no changes to the active game, inventory,
PR #51, publishing, or main. The module is not loaded by index.html yet.

Authoritative plan: TD2-Portalreise-Implementierungsplan.md, 20 October 2026,
Task 1. Spec: TD2-Gameplay-Portalreise-Entwurf.md.

## Contract

`PortalRun.create({runId,seed,heroId,startBudget,maxSections})` creates version 1
state; browser global and CommonJS exports have identical APIs. Start budget is
supplied by the caller (three bows currently cost 75); it is not coupled to the
renderer. Default initial hero HP is 100; hero-specific initialization/healing
belongs to the gameplay adapter in Task 4. Checkpoint starts null; durable
checkpoints belong to Task 3. No localStorage calls exist here.

`reduce(run,event)` returns `{run,effects}` without mutating input. Every event
must carry the current `runId`, `section` and `revision`. Invalid or out-of-phase
events return the original run with no effects. Accepted events increment
revision once. There are currently no external effects.

- START_WAVE: build → combat.
- WAVE_CLEARED: first wave → build; second wave → perk, or finished on final section.
  On the second wave, pass `towers: [{spent: actualPaidCost}, ...]` containing only
  remaining towers. Settlement occurs once at this point, not again on load.
- PERK_SELECTED: perk → exit. Acknowledgement only; Task 2 validates/applies the
  chosen perk and Task 3 ensures durable storage before this acknowledgement.
- PORTAL_ENTER: exit → loading.
- LOAD_FAILED: loading → exit.
- SECTION_LOADED: loading → next section's build phase, wave counter zero.
- FAIL: active phases → failed. Finished/failed are terminal.

`refund(towers)` sums actual investments. Sold towers must already be removed;
the helper does not discover ownership or perform sales. Phase-dependent sale
payouts belong to the later gameplay integration.

Money is validated as safe integer quarter units before arithmetic. Regular
premium is 25% of original start budget, intermediate boss (section 5) 50%, final
boss no regular premium. Ten remaining essence + investments 25 and 60 + 18.75
premium = 113.75. Invalid amounts and unsafe sums never produce a payout.

## Decisions and interface scan

- Ruling: use updated PR #51 head as base — its three changed files only concern
  the graphics adapter/acceptance; game economics unchanged. Cost if wrong:
  rebase before gameplay integration. PR #51 itself remains untouched.
- Ruling: freeze event names and settle at WAVE_CLEARED — Task 1 names the reducer
  but does not prescribe event names; this makes repeated completion harmless.
  Cost if wrong: adapt the Task 4 caller, without save migration.
- Tasks 2/3 consume perkRanks, rngState, revision and checkpoint. Their contents
  are initialized only here; no catalog/storage implementation is pre-empted.
- Task 4 must keep the run's gold authoritative when applying build/sale actions,
  pass remaining towers on second-wave completion and initialize hero HP from
  the selected hero. This task does not claim gameplay integration.
- Scope is Task 1 as explicitly requested. Tasks 2–6 remain pending.

## Verification

New regression test observed failing with MODULE_NOT_FOUND before implementation,
then passing. It covers start essence, exact refunds, sold-tower omission,
invalid/NaN/overflow values, stale and duplicate events, terminal phases,
loading retry, three-section progression, boss premium and browser-global use.

Full existing workflow commands plus adapter regression and new portal test are
run before committing. Local runtime is Node 24.19.0 (CI specifies Node 22).
No playable Portalreise build or Android performance claim is made by Task 1.

Result: 52/52 verification commands PASS (all 50 workflow commands, the adapter
regression and portal-run test); node syntax check and git diff --check PASS.
Task 1 complete. Self-review: transitions, immutable inputs, integer quarter-unit
arithmetic and replay guards checked; no runtime integration claimed.
Concurrent updates to PR #51 after the pinned base are intentionally not pulled
into this task branch. No remote branch is force-updated.
