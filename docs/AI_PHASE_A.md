# Denkmal TD · OpenAI Phase A (opt-in)

This is an isolated *manual preview*, not a live AI gameplay director. No combat stats, saved loot, hero equipment, or wave rules are modified.

## Browser
- `dist/ai-config.js`: enabled is **false** and endpoint is empty by default.
- `dist/ai-events.js`: allowlisted event fields only.
- `dist/ai-fallbacks.js`: deterministic offline hint.
- `dist/ai-client.js`: POST to `/v1/event`, 3.5s timeout, safe fallback on failure.
- `dist/ai-bridge.js`: a main-menu button to test the feature; no background polling or API requests.

## Optional Worker setup
1. Install Wrangler for local development (Node 22+): `npx wrangler@latest dev --config ai-worker/wrangler.toml`.
2. Configure `ALLOWED_ORIGIN` for the **exact** site origin and review the two rate-limit namespace IDs.
3. Do **not** store any API key in `dist/`, `wrangler.toml`, or Git history.
4. Set the Worker secret: `npx wrangler@latest secret put OPENAI_API_KEY --config ai-worker/wrangler.toml`.
5. Worker defaults to `AI_ENABLED = "false"`. Only enable for a controlled private test after verifying Cloudflare authentication, budget limits, rate limits and deployment permissions.
6. Deploy only when ready: `npx wrangler@latest deploy --config ai-worker/wrangler.toml`.
7. Set `enabled: true` and `endpoint: 'https://YOUR-WORKER.example/v1/event'` in `dist/ai-config.js` **only after** verifying access controls; the endpoint is public configuration, *not* a secret.

**Important:** CORS/Origin checking is not user authentication and does not prevent scripted abuse. Worker rate-limit bindings are local/permissive and do not provide a hard global spending cap. Before enabling for public users, add strong user authentication or Cloudflare Access/Turnstile verification, a true server-side quota/budget policy and abuse monitoring. Until then leave the production Worker disabled. Cloudflare account and OpenAI API billing are separate from ChatGPT.

## Contract
`POST /v1/event` body:
```json
{"type":"wave_hint","level":1,"wave":1,"heroHpPct":100,"towers":[]}
```
Response:
```json
{"headline":"DIE WACHT HÄLT","text":"Halte die Tore im Blick."}
```
Output is narrative text only, never executable game commands. Model output is schema-constrained server-side and length-validated both on server and client; always render with `textContent`, not `innerHTML`.

## Testing
```sh
node tests/ai-phase-a.test.cjs
node tests/loot.test.cjs
node tests/game.test.cjs
TEST_MOBILE=1 node tests/game.test.cjs
node tests/combat-fx.test.cjs
node tests/v3.1-features.test.cjs
```

Next step (Phase B): use the opt-in client for Marcel's narrative dialogue at safe wave transitions, with consent, caching, non-blocking requests and pre-generated speech. No API call should ever be made from the frame loop.
