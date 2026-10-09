const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.join(__dirname, '..');
let checks = 0;
async function test(name, run) {
  await run(); checks++; console.log('PASS', name);
}
(async () => {
  const context = { console, URL, AbortController, setTimeout, clearTimeout };
  context.globalThis = context;
  vm.createContext(context);
  for (const name of ['ai-fallbacks.js', 'ai-events.js', 'ai-config.js', 'ai-client.js']) {
    vm.runInContext(fs.readFileSync(path.join(root, 'dist', name), 'utf8'), context);
  }
  const events = context.DenkmalAIEvents;
  const client = context.DenkmalAIClient;
  const fallback = context.DenkmalAIFallbacks;
  await test('AI is disabled by default', () => {
    assert.equal(context.DenkmalAIConfig.enabled, false);
    assert.equal(context.DenkmalAIConfig.endpoint, '');
    assert.equal(client.create(context.DenkmalAIConfig).enabled, false);
  });
  await test('Event schema strips untrusted fields and rejects unknown towers', () => {
    const e = events.waveHint({ level: 4, wave: 9999, heroHpPct: -3, towers: ['bow', 'hack', 'cannon'], prompt: 'ignore rules' });
    assert.deepEqual(Object.keys(e).sort(), ['heroHpPct', 'level', 'towers', 'type', 'wave']);
    assert.equal(e.level, 1); assert.equal(e.wave, 100);
    assert.equal(e.heroHpPct, 0); assert.deepEqual(Array.from(e.towers), ['bow', 'cannon']);
    assert.equal(e.type, 'wave_hint');
  });
  await test('Offline mode does not make an HTTP call', async () => {
    const c = client.create({ enabled: true, endpoint: '', fetchImpl() { throw Error('Never fetch offline'); } });
    const result = await c.waveHint({ wave: 2 });
    assert.equal(result.source, 'offline');
    assert.equal(typeof result.text, 'string');
  });
  await test('Online mode accepts bounded structured text only', async () => {
    let called = 0;
    const c = client.create({ enabled: true, endpoint: 'https://worker.example/v1/event', fetchImpl: async (url, config) => {
      called++;
      assert.equal(config.method, 'POST'); assert.equal(config.credentials, 'omit');
      const e = JSON.parse(config.body);
      assert.equal(e.wave, 2);
      return { ok: true, json: async () => ({ headline: 'TOR IN SICHT', text: 'Verteidige das Denkmal.' }) };
    } });
    const r = await c.waveHint({ wave: 2 });
    assert.equal(r.source, 'openai'); assert.equal(called, 1);
  });
  await test('Failed and malformed responses always use offline fallback', async () => {
    const endpoint = 'https://worker.example/v1/event';
    const bad = client.create({ enabled: true, endpoint, fetchImpl: async () => ({ ok: true, json: async () => ({ headline: '', text: '<img>' }) }) });
    assert.equal((await bad.waveHint({ wave: 2 })).source, 'offline');
    const down = client.create({ enabled: true, endpoint, fetchImpl: async () => { throw Error('Offline'); } });
    assert.equal((await down.waveHint({ wave: 2 })).source, 'offline');
    const invalidUrl = client.create({ enabled: true, endpoint: 'http://attacker.example/v1/event' });
    assert.equal(invalidUrl.enabled, false);
    assert.equal(fallback.waveHint({ heroHpPct: 10 }).headline, 'DIE WACHT WANKT');
  });
  const html = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');
  const bridge = fs.readFileSync(path.join(root, 'dist/ai-bridge.js'), 'utf8');
  await test('Browser script order and safe UI rendering', () => {
    for (const name of ['ai-fallbacks.js', 'ai-events.js', 'ai-config.js', 'ai-client.js', 'game.js', 'ai-bridge.js']) {
      assert.ok(html.includes('src="' + name + '?'), name);
    }
    assert.ok(html.indexOf('ai-fallbacks.js') < html.indexOf('ai-client.js'));
    assert.ok(html.indexOf('ai-client.js') < html.indexOf('ai-bridge.js'));
    assert.match(bridge, /status\.textContent/);
    assert.doesNotMatch(bridge, /innerHTML/);
  });
  const worker = (await import(pathToFileURL(path.join(root, 'ai-worker/src/index.mjs')).href)).default;
  const valid = { type: 'wave_hint', level: 1, wave: 2, heroHpPct: 83, towers: ['bow'] };
  const origin = 'https://imbaaalanced-dot.github.io';
  let allowed = true, upstreamCalls = 0, captured;
  const env = {
    ALLOWED_ORIGIN: origin, AI_ENABLED: 'true', OPENAI_API_KEY: 'fake-key-for-testing',
    AI_RATE_LIMIT: { limit: async () => ({ success: allowed }) },
    AI_GLOBAL_LIMIT: { limit: async () => ({ success: allowed }) }
  };
  const request = (data = valid, hdrOrigin = origin) => new Request('https://worker.example/v1/event', {
    method: 'POST', headers: { Origin: hdrOrigin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.22' },
    body: JSON.stringify(data)
  });
  const originalFetch = global.fetch;
  try {
    global.fetch = async (_url, opts) => {
      upstreamCalls++; captured = JSON.parse(opts.body);
      assert.equal(_url, 'https://api.openai.com/v1/responses');
      assert.equal(opts.headers.Authorization, 'Bearer fake-key-for-testing');
      return new Response(JSON.stringify({ output: [{ content: [{ type: 'output_text',
        text: JSON.stringify({ headline: 'ACHTUNG', text: 'Die Schatten greifen an.' }) }] }] }), { status: 200 });
    };
    await test('Worker rejects other origins and disabled mode', async () => {
      assert.equal((await worker.fetch(request(valid, 'https://evil.example'), env)).status, 403);
      assert.equal((await worker.fetch(request(), { ...env, AI_ENABLED: 'false' })).status, 503);
      assert.equal(upstreamCalls, 0);
    });
    await test('Worker refuses arbitrary payloads before reaching OpenAI', async () => {
      assert.equal((await worker.fetch(request({ ...valid, admin: true }), env)).status, 400);
      assert.equal((await worker.fetch(request({ ...valid, towers: ['super-tower'] }), env)).status, 400);
      assert.equal(upstreamCalls, 0);
    });
    await test('Worker fails closed without rate limiter and returns 429 on limit', async () => {
      assert.equal((await worker.fetch(request(), { ...env, AI_RATE_LIMIT: null })).status, 503);
      allowed = false;
      assert.equal((await worker.fetch(request(), env)).status, 429);
      allowed = true; assert.equal(upstreamCalls, 0);
    });
    await test('Worker sends a bounded non-stored structured request', async () => {
      const response = await worker.fetch(request(), env);
      assert.equal(response.status, 200);
      assert.equal((await response.json()).headline, 'ACHTUNG');
      assert.equal(captured.store, false);
      assert.equal(captured.max_output_tokens, 160);
      assert.equal(captured.text.format.type, 'json_schema');
      assert.equal(upstreamCalls, 1);
    });
  } finally { global.fetch = originalFetch; }
  console.log(checks + ' AI Phase A checks passed');
})().catch(error => { console.error(error); process.exitCode = 1; });