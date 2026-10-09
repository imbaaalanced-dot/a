(() => {
  'use strict';
  const fallback = globalThis.DenkmalAIFallbacks;
  const events = globalThis.DenkmalAIEvents;
  function safeEndpoint(value) {
    if (typeof value !== 'string' || !value || value.length > 300) return false;
    try {
      const url = new URL(value);
      return !url.username && !url.password && !url.hash &&
        (url.protocol === 'https:' || (url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname))) &&
        url.pathname.endsWith('/v1/event');
    } catch { return false; }
  }
  function create(options = {}) {
    const endpoint = options.endpoint || '';
    const enabled = options.enabled === true && safeEndpoint(endpoint);
    const fetchImpl = options.fetchImpl || globalThis.fetch;
    const timeoutMs = Math.max(250, Math.min(8000, options.timeoutMs || 3500));
    async function waveHint(input) {
      const event = events.waveHint(input);
      const offline = () => fallback.waveHint(event);
      if (!enabled || typeof fetchImpl !== 'function' || typeof AbortController !== 'function') return offline();
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const response = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(event),
          signal: controller.signal,
          credentials: 'omit',
          cache: 'no-store'
        });
        if (!response.ok) return offline();
        const result = await response.json();
        if (!result || typeof result.headline !== 'string' || typeof result.text !== 'string' ||
            !result.headline.trim() || !result.text.trim() || result.headline.length > 70 ||
            result.text.length > 320) return offline();
        return Object.freeze({
          source: 'openai',
          headline: result.headline.trim(),
          text: result.text.trim()
        });
      } catch {
        return offline();
      } finally {
        clearTimeout(timer);
      }
    }
    return Object.freeze({ waveHint, get enabled() { return enabled; } });
  }
  globalThis.DenkmalAIClient = Object.freeze({ create });
})();