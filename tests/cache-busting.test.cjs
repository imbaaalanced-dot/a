/* TD2 release label and static asset cache regression. Run: node tests/cache-busting.test.cjs */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dist = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

assert.ok(!html.includes('class="release-badge"'), 'main menu must not show a patch badge');
assert.ok(html.includes('<meta name="application-version" content="v4.0.0-alpha.9"'), 'version remains available as metadata');

// Asset versions are intentionally per-file, not one global version.
// A changed JS/CSS file must have its own cache key bumped in index.html
// and the expected key updated here; unchanged files keep their existing keys.
const expectedVersions = new Map([
  ['styles.css', 'v400a4merge1'],
  ['hero.css', 'v400a4merge1'],
  ['polish.css', 'alpha9a1'],
  ['loot.css', 'alpha8polish1'],
  ['menu.css', 'alpha8polish1'],
  ['preloader.css', 'td2preload1'],
  ['portrait-patch.css', 'v400a6hud2'],
  ['asset-manager.js', 'alpha9a3'],
  ['preloader.js', 'alpha9a1'],
  ['levels.js', 'syburg2'],
  ['visuals.js', 'alpha9a1'],
  ['loot.js', 'v400a4merge1'],
  ['loot-ui.js', 'alpha9a1'],
  ['hero-saga.js', 'alpha9a1'],
  ['combat-fx.js', 'v400a6s2t4'],
  ['style2-cannon.js', 'alpha8cannon2'],
  ['style2-towers.js', 'v400a6elemental1'],
  ['elemental-sprites.js', 'alpha8a2'],
  ['style2-user-towers.js', 'user-towers-1'],
  ['enemy-animations.js', 'alpha9a3'],
  ['style2-markers.js', 'markers2'],
  ['style2-maps.js', 'v400a6markers1'],
  ['flight-enemies.js', 'flight2'],
  ['goethestrasse.js', 'goethe2'],
  ['goethestrasse-art.js', 'goethe1'],
  ['game.js', 'alpha9-user-towers1'],
  ['hohensyburg.js', 'syburg1'],
  ['hohensyburg-art.js', 'alpha9a3'],
  ['style2-ambience.js', 'alpha9a2'],
  ['style2-ui-polish.css', 'alpha8a2'],
  ['style2-phase6.js', 'alpha9a5'],
  ['kirchende-combat.js', 'v400a5combined1'],
  ['kirchende-art.js', 'v400a6s2polish5'],
  ['terrain-polish.js', 'v400a6s2ground3'],
  ['forest-crowns.js', 'v400a6s2foliage4'],
  ['church-art.js', 'alpha8a2'],
  ['style2-level4-reference.js', 'ref4a1'],
]);

const resources = [
  ...[...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(match => match[1]),
  ...[...html.matchAll(/<link\b(?=[^>]*\brel="stylesheet")[^>]*\bhref="([^"]+)"/g)].map(match => match[1]),
];
assert.equal(resources.length, expectedVersions.size, 'all static JS/CSS entries must be audited');
const seen = new Set();
for (const resource of resources) {
  const url = new URL(resource, 'https://td2.invalid/');
  assert.equal(url.origin, 'https://td2.invalid', 'external static resource is not audited');
  const file = decodeURIComponent(url.pathname.slice(1));
  assert.ok(expectedVersions.has(file), 'unexpected static asset ' + file);
  assert.ok(!seen.has(file), 'duplicate static asset ' + file);
  seen.add(file);
  assert.deepEqual([...url.searchParams.keys()], ['v'], file + ' needs exactly one cache key');
  assert.equal(url.searchParams.get('v'), expectedVersions.get(file), file + ' has a stale/unreviewed cache key');
  const absolute = path.resolve(dist, file);
  assert.equal(path.dirname(absolute), dist, 'unexpected resource path ' + file);
  assert.ok(fs.statSync(absolute).isFile(), 'referenced asset missing: ' + file);
}
for (const file of expectedVersions.keys()) {
  assert.ok(seen.has(file), 'required static asset not included: ' + file);
}
console.log('TD2 Alpha.5 metadata and ' + resources.length + ' static JS/CSS cache references verified.');
