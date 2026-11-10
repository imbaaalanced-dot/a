'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '../dist');
const source = file => fs.readFileSync(path.join(root, file), 'utf8');
const sandbox = {};
sandbox.globalThis = sandbox;
vm.runInNewContext(source('canonical-hero-art-v5.js'), sandbox);

const art = sandbox.TD2CanonicalHeroArt;
assert.ok(Object.isFrozen(art));
for (const [actor, expected] of Object.entries({
  marcel: 'marcel-guardian-style2.webp',
  kim: 'kim-marksman-style2.webp'
})) {
  const entry = art[actor];
  assert.ok(Object.isFrozen(entry), `${actor} art map must not be mutable`);
  assert.match(entry.walk, new RegExp(`${actor}-walk-style2\\.webp`));
  assert.match(entry.actions, new RegExp(`${actor}-side-actions-style2\\.webp`));
  assert.ok(entry.portrait.split('?')[0].endsWith(expected));
  assert.equal(entry.walkCell, 256);
  assert.equal(entry.actionCell, 128);
  assert.deepEqual(Array.from(entry.walkGrid), [3, 4]);
  assert.deepEqual(Array.from(entry.actionGrid), [6, 6]);
  for (const asset of ['walk', 'actions', 'portrait']) {
    const relative = entry[asset].split('?')[0];
    assert.ok(fs.existsSync(path.join(root, relative)), `${actor} ${asset} must exist`);
  }
}

const html = source('index.html');
const registryPos = html.indexOf('src="canonical-hero-art-v5.js');
const preloaderPos = html.indexOf('src="preloader.js');
const gamePos = html.indexOf('src="game.js');
assert.ok(registryPos >= 0 && registryPos < preloaderPos && preloaderPos < gamePos,
  'hero registry must be available to preloader, gameplay and menu before scripts run');

for (const filename of ['preloader.js', 'hero-saga.js', 'directional-hero-assets-v5.js',
  'game.js', 'loot-ui.js', 'portrait-avatars-v5.js']) {
  assert.match(source(filename), /TD2CanonicalHeroArt/, `${filename} reads the approved image map`);
}

console.log('V5 canonical hero identity lock, references and script order passed');
