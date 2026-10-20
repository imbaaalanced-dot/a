/* Portalreise state and economy. No DOM, storage, campaign flags or runtime hooks. */
(function (root) {
  'use strict';
  const MAX_AMOUNT = Number.MAX_SAFE_INTEGER / 4;
  const amount = n => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= MAX_AMOUNT;
  const integer = n => Number.isSafeInteger(n) && n >= 0;
  const id = value => typeof value === 'string' && value.trim().length > 0;
  function requireValid(condition) {
    if (!condition) throw new TypeError('Invalid PortalRun value');
  }
  /** Remaining towers only; spent includes actual paid upgrades and discounts. */
  function refund(towers) {
    requireValid(Array.isArray(towers));
    return towers.reduce((sum, tower) => {
      requireValid(tower != null && amount(tower.spent) && amount(sum + tower.spent));
      return sum + tower.spent;
    }, 0);
  }
  function create({runId, seed, heroId, startBudget, maxSections, heroHp = 100} = {}) {
    requireValid(id(runId) && id(heroId) && integer(seed) && seed <= 0xffffffff);
    requireValid(amount(startBudget) && Number.isSafeInteger(maxSections) && maxSections > 0);
    requireValid(amount(heroHp) && heroHp <= 100);
    return {
      version: 1, revision: 0, runId, heroId, startBudget, maxSections,
      section: 1, waveInSection: 0, phase: 'build', heroHp,
      gold: startBudget, perkRanks: {}, rngState: seed, checkpoint: null, rewardIds: []
    };
  }
  /**
   * Every event carries runId, section and the current revision. A stale event
   * returns the exact input object and no effects, including after a double tap.
   * ENTER_PORTAL snapshots the live economy; only SECTION_LOADED settles it.
   * On failure no money is paid, so retrying cannot duplicate a refund.
   * PERK_SELECTED is an acknowledgement; perk validation belongs to PortalPerks.
   */
  function reduce(run, event) {
    const unchanged = {run, effects: []};
    if (!run || !event || run.version !== 1 || event.runId !== run.runId ||
        event.section !== run.section || event.revision !== run.revision ||
        !integer(run.revision) || run.revision >= Number.MAX_SAFE_INTEGER ||
        run.phase === 'finished' || run.phase === 'failed') return unchanged;
    let changes, effects = [];
    switch (event.type) {
      case 'START_WAVE':
        if (run.phase !== 'build' || ![0, 1].includes(run.waveInSection)) return unchanged;
        changes = {phase: 'combat', waveInSection: run.waveInSection + 1};
        break;
      case 'WAVE_CLEARED':
        if (run.phase !== 'combat' || ![1, 2].includes(run.waveInSection)) return unchanged;
        if (run.waveInSection === 1) changes = {phase: 'build'};
        else if (run.section === run.maxSections) {
          changes = {phase: 'finished'};
          effects = [{type: 'RUN_FINISHED'}];
        } else changes = {phase: 'perk'};
        break;
      case 'PERK_SELECTED':
        if (run.phase !== 'perk') return unchanged;
        changes = {phase: 'exit'};
        break;
      case 'ENTER_PORTAL': {
        if (run.phase !== 'exit' || run.section >= run.maxSections || !amount(event.gold)) return unchanged;
        let investment;
        try { investment = refund(event.towers); } catch (_) { return unchanged; }
        if (!amount(event.gold + investment + run.startBudget * .25)) return unchanged;
        changes = {phase: 'loading', checkpoint: {gold: event.gold, investment}};
        effects = [{type: 'LOAD_SECTION', section: run.section + 1}];
        break;
      }
      case 'SECTION_LOAD_FAILED':
        if (run.phase !== 'loading') return unchanged;
        changes = {phase: 'exit', checkpoint: null};
        break;
      case 'SECTION_LOADED': {
        if (run.phase !== 'loading' || run.section >= run.maxSections || !run.checkpoint) return unchanged;
        const rewardId = run.runId + ':' + run.section + ':settlement';
        if (run.rewardIds.includes(rewardId)) return unchanged;
        const {gold, investment} = run.checkpoint;
        const total = gold + investment + run.startBudget * .25;
        if (!amount(gold) || !amount(investment) || !amount(total)) return unchanged;
        changes = {
          phase: 'build', section: run.section + 1, waveInSection: 0,
          gold: total, checkpoint: null, rewardIds: [...run.rewardIds, rewardId]
        };
        effects = [{type: 'CLEAR_TOWERS_AND_PROJECTILES'}, {type: 'RESET_PROTECTION', integrity: 100}];
        break;
      }
      case 'FAIL':
        changes = {phase: 'failed', checkpoint: null};
        break;
      default:
        return unchanged;
    }
    return {run: {...run, ...changes, revision: run.revision + 1}, effects};
  }
  const api = Object.freeze({create, reduce, refund});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PortalRun = api;
})(globalThis);
