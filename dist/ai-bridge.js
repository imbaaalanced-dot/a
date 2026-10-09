(() => {
  'use strict';
  // Phase A is a manual, non-gameplay preview. No background or automatic API requests.
  const anchor = document.getElementById('collectionBtn');
  if (!anchor || !globalThis.DenkmalAIClient) return;
  const config = globalThis.DenkmalAIConfig || {};
  const client = globalThis.DenkmalAIClient.create(config);
  const button = document.createElement('button');
  button.id = 'aiPreviewBtn';
  button.type = 'button';
  button.className = 'secondary-level';
  button.textContent = 'KI-VORSCHAU TESTEN';
  const status = document.createElement('p');
  status.id = 'aiPreviewStatus';
  status.className = 'level-progress';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.textContent = client.enabled ? 'KI-Server konfiguriert · Anfrage nur per Klick' : 'Offline-Modus · keine API-Kosten';
  anchor.insertAdjacentElement('afterend', status);
  anchor.insertAdjacentElement('afterend', button);
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    button.disabled = true;
    status.textContent = 'Hinweis wird geladen …';
    try {
      const hint = await client.waveHint({ level: 1, wave: 1, heroHpPct: 100, towers: [] });
      status.textContent = hint.headline + ' · ' + hint.text +
        (hint.source === 'offline' ? ' (Offline-Hinweis)' : ' (KI-Hinweis)');
    } finally {
      button.disabled = false;
    }
  });
})();