/* TD2 release label and static asset cache regression. Run: node tests/cache-busting.test.cjs */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dist = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const badges = [...html.matchAll(/<span class="release-badge">([^<]+)<\/span>/g)];
assert.equal(badges.length, 1, 'main menu should have exactly one release badge');
assert.equal(badges[0][1], 'v3.6.0-alpha.6 · BEUTE', 'badge must describe the deployed Alpha.6 features');

// Asset versions are intentionally per-file, not one global version.
// A changed JS/CSS file must have its own cache key bumped in index.html
// and the expected key updated here; unchanged files keep their existing keys.
const expectedVersions = new Map([
  ['styles.css', 'v360a5'],
  ['hero.css', 'v360a5'],
  ['polish.css', 'v360a5'],
  ['loot.css', 'v360a5'],
  ['menu.css', 'v4campaign1'],
  ['preloader.css', 'td2preload1'],
  ['portrait-patch.css', 'v360a5'],
  ['preloader.js', 'td2preload2'],
  ['levels.js', 'v360a5'],
  ['campaign-modes.js', 'v4campaign1'],
  ['visuals.js', 'v360a5'],
  ['loot.js', 'v360a6bulk1'],
  ['loot-ui.js', 'v360a6bulk1'],
  ['hero-saga.js', 'v360a5'],
  ['combat-fx.js', 'v360a5'],
  ['game.js', 'v4campaign1'],
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
console.log('TD2 Alpha.6 badge and ' + resources.length + ' static JS/CSS cache references verified.');
