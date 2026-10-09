(() => {
  'use strict';
  function waveHint(event = {}) {
    const critical = event.heroHpPct <= 35;
    return Object.freeze({
      source: 'offline',
      headline: critical ? 'DIE WACHT WANKT' : 'DIE WACHT HÄLT',
      text: critical
        ? 'Marcel ist verwundet. Bleib in Bewegung und schütze das Monument.'
        : 'Halte die Wege im Blick. Baue nur auf markierten Plätzen und kombiniere deine Türme.'
    });
  }
  globalThis.DenkmalAIFallbacks = Object.freeze({ waveHint });
})();