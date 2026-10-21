'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('dist/style2-user-towers.js', 'utf8');
const images = [];
let active = 0, peak = 0;
class Image {
  constructor() { this.naturalWidth = 0; images.push(this); }
  set src(url) { this.url = url; this.loading = true; peak = Math.max(peak, ++active); }
  decode() { return Promise.resolve(); }
  finish(fail = false) {
    assert.ok(this.loading);
    this.loading = false; active--;
    if (fail) this.onerror();
    else { this.naturalWidth = 512; this.onload(); }
  }
}
const sandbox = { URLSearchParams, Image, Date, location: { search: '?td2UserTowers=1&td2Style2Debug=1' } };
vm.runInNewContext(source, sandbox);
const adapter = sandbox.UserStyle2Towers;
const ctx = { save() {}, restore() {}, drawImage() {} };
const variants = ['bow', 'cannon', 'mage', 'rift', 'boomerang'].flatMap(kind => [1, 2, 3].map(tier => [kind, tier]));
const draw = ([kind, tier]) => adapter.drawTower(ctx, kind, 0, 0, tier);
const tick = () => new Promise(resolve => setImmediate(resolve));
(async () => {
  variants.forEach(draw);
  assert.equal(images.length, 4, 'rapid switching must start only four loads');
  for (let frame = 0; frame < 20; frame++) variants.forEach(draw);
  assert.equal(images.length, 4, 'in-flight images must not be evicted or restarted');
  const firstBatch = images.slice();
  firstBatch[0].finish(true);
  firstBatch.slice(1).forEach(img => img.finish());
  await tick();
  draw(variants[2]);
  assert.equal(images.length, 6, 'next visible variant must load after slots are freed');
  for (const variant of variants.slice(2)) {
    draw(variant);
    images.filter(img => img.loading).forEach(img => img.finish());
    await tick();
    assert.equal(draw(variant), true, 'requested tower must become drawable');
    assert.ok(adapter.getDiagnostics().fallbackLoaded <= 12, 'cache stays bounded');
  }
  assert.equal(peak, 4);
  assert.equal(active, 0);
  assert.equal(new Set(images.map(img => img.url)).size, 30, 'all tower and projectile variants progress');
  console.log('Style-2 cache pressure: PASS (30 variants, peak 4, cache <= 12)');
})().catch(error => { console.error(error); process.exitCode = 1; });
