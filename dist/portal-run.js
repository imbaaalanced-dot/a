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
      gold: startBudget, perkRanks: {}, rngState: seed, checkpoint: null, rewardIds: [], towers: [], offerIds: null
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
        changes = {phase: 'loading', pendingTransition: {gold: event.gold, investment, towers: JSON.parse(JSON.stringify(event.towers))}};
        effects = [{type: 'LOAD_SECTION', section: run.section + 1}];
        break;
      }
      case 'SECTION_LOAD_FAILED':
        if (run.phase !== 'loading') return unchanged;
        changes = {phase: 'exit', pendingTransition: null};
        break;
      case 'SECTION_LOADED': {
        if (run.phase !== 'loading' || run.section >= run.maxSections || !run.pendingTransition) return unchanged;
        const rewardId = run.runId + ':' + run.section + ':settlement';
        if (run.rewardIds.includes(rewardId)) return unchanged;
        const {gold, investment} = run.pendingTransition;
        const total = gold + investment + run.startBudget * .25;
        if (!amount(gold) || !amount(investment) || !amount(total)) return unchanged;
        changes = {
          phase: 'build', section: run.section + 1, waveInSection: 0,
          gold: total, checkpoint: null, pendingTransition: null, towers: [], offerIds: null, rewardIds: [...run.rewardIds, rewardId]
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
  const KEY = 'denkmal-portal-run-v1', BACKUP = KEY + '-backup';
  const perkIds = new Set(['kraft','ausdauer','schritt','erholung','praezision','reichweite','taktung','engpass','zielmarkierung','deckung','gegenstoss','waechterkreis']);
  const clone = value => JSON.parse(JSON.stringify(value));
  function validateRun(run, nested = false) {
    requireValid(run && run.version === 1 && id(run.runId) && id(run.heroId));
    requireValid(integer(run.revision) && integer(run.section) && run.section >= 1 && integer(run.maxSections) && run.section <= run.maxSections);
    requireValid(integer(run.waveInSection) && run.waveInSection <= 2 && ['build','combat','perk','exit','loading','finished','failed'].includes(run.phase));
    requireValid(amount(run.gold) && amount(run.startBudget) && amount(run.heroHp) && integer(run.rngState) && run.rngState <= 0xffffffff);
    requireValid(run.perkRanks && typeof run.perkRanks === 'object' && !Array.isArray(run.perkRanks));
    for (const [key, rank] of Object.entries(run.perkRanks)) requireValid(perkIds.has(key) && integer(rank) && rank <= 3);
    requireValid(Array.isArray(run.rewardIds) && run.rewardIds.length <= 100000 && new Set(run.rewardIds).size === run.rewardIds.length && run.rewardIds.every(id));
    refund(run.towers);
    requireValid(run.offerIds === null || Array.isArray(run.offerIds) && run.offerIds.length <= 3 && new Set(run.offerIds).size === run.offerIds.length && run.offerIds.every(key => perkIds.has(key) && (run.perkRanks[key] || 0) < 3));
    if (run.phase === 'combat') requireValid(run.waveInSection >= 1 && run.checkpoint && ['build','exit'].includes(run.checkpoint.phase));
    if (run.phase === 'loading') {
      requireValid(run.pendingTransition && amount(run.pendingTransition.gold) && amount(run.pendingTransition.investment));
      requireValid(refund(run.pendingTransition.towers) === run.pendingTransition.investment);
    }
    if (run.checkpoint != null) {
      requireValid(!nested && run.checkpoint.checkpoint == null);
      validateRun(run.checkpoint, true);
      requireValid(run.checkpoint.runId === run.runId && run.checkpoint.section === run.section);
    }
    return run;
  }
  /** Capture a safe state before START_WAVE or after a confirmed selection. */
  function withCheckpoint(run) {
    validateRun(run);
    requireValid(['build','exit'].includes(run.phase));
    const safe = clone({...run, checkpoint: null, pendingTransition: null});
    return {...clone(run), checkpoint: safe};
  }
  function createStore(storage) {
    let observed, observedRun = null, incompatible = false;
    function decode(raw) {
      const run = JSON.parse(raw);
      if (run?.version !== 1) return {status:'incompatible'};
      validateRun(run);
      return {status:'ok', run};
    }
    function load() {
      observedRun = null; incompatible = false;
      try {
        observed = storage.getItem(KEY) || null;
        if (!observed) return {status:'missing'};
        let result;
        try { result = decode(observed); } catch (_) { result = {status:'corrupt'}; }
        if (result.status === 'incompatible') { incompatible = true; return result; }
        if (result.status === 'corrupt') {
          try { result = decode(storage.getItem(BACKUP)); if (result.status === 'ok') result.recovered = true; } catch (_) {}
        }
        if (result.status !== 'ok') return {status:'corrupt'};
        observedRun = clone(result.run);
        if (result.run.phase === 'combat') result.run = {...clone(result.run.checkpoint), revision:result.run.revision};
        if (result.run.phase === 'loading') result.run = {...result.run, phase:'exit', gold:result.run.pendingTransition.gold, towers:clone(result.run.pendingTransition.towers), pendingTransition:null};
        return result;
      } catch (_) { return {status:'error'}; }
    }
    function save(run, expectedRevision) {
      try { validateRun(run); } catch (_) { return {status:'invalid'}; }
      try {
        const current = storage.getItem(KEY) || null;
        if (incompatible || (observed === undefined ? current !== null : current !== observed)) return {status:'conflict'};
        if (current && !observedRun || (observedRun ? observedRun.revision !== expectedRevision : expectedRevision !== null)) return {status:'conflict'};
        if (observedRun && run.runId === observedRun.runId && run.revision < observedRun.revision) return {status:'conflict'};
        const next = JSON.stringify(run);
        if (observedRun) { try { storage.setItem(BACKUP, JSON.stringify(observedRun)); } catch (_) {} }
        if ((storage.getItem(KEY) || null) !== current) return {status:'conflict'};
        storage.setItem(KEY, next);
        observed = next; observedRun = clone(run);
        return {status:'saved'};
      } catch (_) { return {status:'error'}; }
    }
    return Object.freeze({load, save});
  }
  const api = Object.freeze({create, reduce, refund, withCheckpoint, createStore, KEY, BACKUP});
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PortalRun = api;
})(globalThis);
