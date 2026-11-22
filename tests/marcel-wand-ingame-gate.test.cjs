'use strict';
/* Beta #330 P0 gate: Marcel carries the wand (Zauberstab) everywhere in runtime art.
 * - canonical ingame hero art (walk/actions/side sheets) must be the locked v5b set
 * - the wand projectile FX atlas must be referenced by combat-fx.js
 * - no runtime code may reference sword/shield/lantern-sprite assets for heroes
 * Visual acceptance of the re-produced sheets stays with Marcel (reference lock 2026-11-15).
 */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../dist');
const source = name => fs.readFileSync(path.join(root, name), 'utf8');

const mapping = {}; mapping.globalThis = mapping;
for (const file of ['canonical-hero-art-v5.js', 'directional-hero-assets-v5.js'])
  vm.runInNewContext(source(file), mapping, { filename: file });

const marcel = mapping.TD2CanonicalHeroArt.marcel;
for (const key of ['walk', 'actions', 'portrait'])
  assert.ok(fs.existsSync(path.join(root, marcel[key].split('?')[0])), 'missing ' + key);
assert.match(marcel.walk, /-v5b\.webp/, 'ingame walk must use the locked v5b atlas');
assert.match(marcel.actions, /-v5b\.webp/, 'ingame actions must use the locked v5b atlas');
assert.match(marcel.portrait, /marcel-guardian-v7\.webp/, 'armory/Story portrait must be the v7 wand cutout');

const sides = mapping.TD2HeroSideAssets.marcel;
assert.equal(sides.file, marcel.actions, 'side sheet must equal the canonical action atlas');
for (const [dir, url] of Object.entries(sides.sheets)) {
  assert.ok(fs.existsSync(path.join(root, url.split('?')[0])), 'missing directional sheet ' + dir);
  assert.match(url, /-v5b/, 'directional sheet ' + dir + ' must be v5b');
}

const fx = source('combat-fx.js');
const staffMatch = fx.match(/STAFF_FX_FILE\s*=\s*'([^']+)'/);
assert.ok(staffMatch, 'combat-fx must declare the staff FX atlas');
assert.ok(fs.existsSync(path.join(root, staffMatch[1].split('?')[0])), 'staff FX atlas missing on disk');

const html = source('index.html');
assert.match(html, /marcel-wand-menu-portrait-20261117-refined\.webp/, 'home menu banner must be the wand portrait');

// No runtime surface may reference sword/shield/lantern-sprite hero art.
const forbidden = /assets\/[A-Za-z0-9_./-]*(?:sword|schwert|lantern-sprite)[A-Za-z0-9_./-]*\.(?:webp|png)/i;
for (const name of fs.readdirSync(root)) {
  if (!/\.(js|css|html)$/.test(name)) continue;
  const text = source(name);
  const hit = text.match(forbidden);
  assert.ok(!hit, name + ' references forbidden legacy hero asset: ' + (hit && hit[0]));
}

console.log('Marcel wand ingame gate: v5b atlases + v6 portrait + staff FX wired, no sword/shield/lantern references');
