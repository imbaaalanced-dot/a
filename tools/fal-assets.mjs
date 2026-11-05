#!/usr/bin/env node
// Development-only fal.ai image asset generator. Never bundle into the browser game.
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';

const args = process.argv.slice(2);
const option = (flag) => { const i = args.indexOf(flag); return i < 0 ? undefined : args[i + 1]; };
const prompt = option('--prompt');
const model = option('--model') ?? 'fal-ai/flux/schnell';
const output = resolve(option('--out') ?? 'generated/fal-review');
const reference = option('--image-url');
const allowed = new Set(['fal-ai/flux/schnell', 'fal-ai/flux-kontext/dev']);
if (!args.includes('--generate') || !prompt || !allowed.has(model)) {
  console.error('Usage: FAL_KEY=... node tools/fal-assets.mjs --generate --prompt "..." [--model fal-ai/flux/schnell|fal-ai/flux-kontext/dev] [--image-url https://...] [--out generated/fal-review]');
  process.exitCode = 2;
} else if (!process.env.FAL_KEY) {
  console.error('Missing FAL_KEY. Store it in your local environment, never in game source.');
  process.exitCode = 2;
} else {
  const headers = { Authorization: 'Key ' + process.env.FAL_KEY, 'Content-Type': 'application/json' };
  const input = { prompt, num_images: 1 };
  if (reference) {
    if (model !== 'fal-ai/flux-kontext/dev' || !/^https:\/\//.test(reference)) throw Error('Reference requires flux-kontext/dev and HTTPS image URL');
    input.image_url = reference;
  }
  async function json(url, init = {}) {
    const response = await fetch(url, init);
    if (!response.ok) throw Error('fal HTTP ' + response.status + ': ' + (await response.text()).slice(0, 500));
    return response.json();
  }
  const submitted = await json('https://queue.fal.run/' + model, { method: 'POST', headers, body: JSON.stringify(input) });
  await mkdir(output, { recursive: true });
  const record = { model, prompt, reference: reference ?? null, request_id: submitted.request_id, created_at: new Date().toISOString() };
  const stem = (submitted.request_id ?? Date.now().toString()).replace(/[^a-zA-Z0-9_-]/g, '_');
  const metadata = join(output, stem + '.json');
  await writeFile(metadata, JSON.stringify(record, null, 2));
  console.log('Request submitted:', submitted.request_id, 'Metadata:', metadata);
  if (!submitted.status_url || !submitted.response_url) throw Error('fal did not return status/response URLs; request ID was saved');
  let done = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    const status = await json(submitted.status_url, { headers });
    if (status.status === 'COMPLETED') { done = true; break; }
    if (status.status === 'FAILED') throw Error('fal generation failed; request ID saved');
    await new Promise(r => setTimeout(r, 2000));
  }
  if (!done) throw Error('Timed out; request ID saved, do not submit again automatically');
  const result = await json(submitted.response_url, { headers });
  record.images = result.images ?? [];
  await writeFile(metadata, JSON.stringify(record, null, 2));
  for (const [i, item] of (result.images ?? []).entries()) {
    if (!item.url || !/^https:\/\//.test(item.url)) continue;
    const response = await fetch(item.url);
    if (!response.ok) throw Error('Image download HTTP ' + response.status);
    const type = response.headers.get('content-type') ?? '';
    const ext = type.includes('png') ? 'png' : type.includes('webp') ? 'webp' : 'jpg';
    const file = join(output, stem + '-' + (i + 1) + '.' + ext);
    await writeFile(file, Buffer.from(await response.arrayBuffer()));
    console.log('Saved:', file);
  }
}
