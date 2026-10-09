(() => {
  'use strict';
  const towerKinds = new Set(['bow', 'cannon', 'mage', 'rift']);
  const bounded = (value, min, max, fallback) =>
    Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;
  function waveHint(input = {}) {
    const towers = Array.isArray(input.towers) ? input.towers : [];
    return Object.freeze({
      type: 'wave_hint',
      level: input.level === 2 ? 2 : 1,
      wave: bounded(input.wave, 1, 100, 1),
      heroHpPct: bounded(input.heroHpPct, 0, 100, 100),
      towers: towers.filter(t => typeof t === 'string' && towerKinds.has(t)).slice(0, 16)
    });
  }
  globalThis.DenkmalAIEvents = Object.freeze({ waveHint });
})();