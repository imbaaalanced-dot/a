/* TD2 release label and static asset cache regression. Run: node tests/cache-busting.test.cjs */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dist = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

assert.ok(!html.includes('class="release-badge"'), 'main menu must not show a patch badge');
assert.ok(html.includes('<meta name="application-version" content="v4.1.0-alpha.1"'), 'version remains available as metadata');

// Asset versions are intentionally per-file, not one global version.
// A changed JS/CSS file must have its own cache key bumped in index.html
// and the expected key updated here; unchanged files keep their existing keys.
const expectedVersions = new Map([
  ['directional-assets-v410.js','v410a1'],
  ['directional-actions-v410.js','v410a1'],
  ['map-polish-v410.js','v410a1'],
  ['styles.css', 'v400a4merge1'],
  ['hero.css', 'v400a4merge1'],
  ['polish.css', 'v5-style2a1'],
  ['loot.css', 'contrastglow1'],
  ['menu.css', 'menu-v3-redesign'],
  ['level-gallery.css', 'gallery-combined1'],
  ['portrait-home-v1.css', 'style2-portrait4'],
  ['portrait-avatars-v5.css', 'duo-v5a1'],
  ['portrait-home-v1.js', 'style2-portrait2'],
  ['portrait-avatars-v5.js', 'duo-v5a2'],
  ['level-gallery.js', 'v5-style2a1'],
  ['preloader.css', 'td2preload1'],
  ['portrait-patch.css', 'v410a1touch1'],
  ['asset-manager.js', 'alpha9a3'],
  ['preloader.js', 'menu-v3b-preload'],
  ['persisted-state.js', 'save1'],
  ['campaign-20-wave-plan.js', 'campaign20-runtime1'],
  ['levels.js', 'level7btouch1campaign20'],
  ['visuals.js', 'expansion2'],
  ['equipment-catalog.js', 'loot-v2-20261029'],
  ['loot.js', 'loot-v2-20261029'],
  ['loot-ui.js', 'v5-style2a1'],
  ['v2-expansion-data.js', 'expansion2'],
  ['v2-expansion.js', 'v410a1'],
  ['hero-saga.js', 'v5style2a1'],
  ['directional-hero-assets-v5.js','v5-hero-actions-a1'],
  ['combat-fx.js', 'v400a6s2t5'],
  ['style2-cannon.js', 'alpha8cannon2'],
  ['style2-towers.js', 'v400a6elemental1'],
  ['elemental-sprites.js', 'alpha8a2'],
  ['style2-user-towers.js', 'v5-style2a1'],
  ['style2-impact-atlas.js', 'reference-refresh-1'],
  ['enemy-animations.js', 'v410a1'],
  ['style2-markers.js', 'markers2'],
  ['style2-maps.js', 'v400a6markers1'],
  ['flight-enemies.js', 'flight2'],
  ['goethestrasse.js', 'goethe2'],
  ['goethestrasse-art.js', 'v5-style2a1'],
  ['westhofen.js', 'westhofen2'],
  ['westhofen-art.js', 'v5-style2a1'],
  ['game.js', 'v5-style2a1'],
  ['portal-run.js','save2'],
  ['portal-perks.js','portal1'],
  ['campaign-balance.js','portal1'],
  ['portal-ui.css','expansion2'],
  ['hohensyburg.js', 'syburg-balance2'],
  ['hohensyburg-art.js', 'v5-style2a1'],
  ['style2-ambience.js', 'alpha9a2'],
  ['style2-ui-polish.css', 'ui-gold2'],
  ['style2-phase6.js', 'alpha9a5'],
  ['kirchende-combat.js', 'v400a5combined1'],
  ['kirchende-art.js', 'v5-style2a1'],
  ['style2-environment-palette.js','v5-style2a1'],
  ['terrain-polish.js', 'v400a6s2ground3'],
  ['forest-crowns.js', 'v400a6s2foliage4'],
  ['church-art.js', 'v5-style2a1'],
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
const heroSagaSource=fs.readFileSync(path.join(dist,'hero-saga.js'),'utf8');
assert.match(heroSagaSource,/walk\.naturalWidth%3===0/,'Hero action uses only valid 3-column walk sheets');
const gameSource=fs.readFileSync(path.join(dist,'game.js'),'utf8');
assert.match(gameSource,/mobileRender&&lowFX\(\)\?1000\/30:0/,'mobile low FX caps rendering at 30 FPS');
assert.match(gameSource,/qualityTier==='medium'\?\(mobileRender\?\.85:1\.25\):mobileRender\?\.70:\.85/,'mobile renderer uses conservative DPR caps');
assert.match(gameSource,/qualityTier==='high'\?1400000:qualityTier==='medium'\?650000:320000/,'mobile low tier stays within a 320k pixel budget');
assert.match(gameSource,/for\(let s=0;s<steps;s\+\+\)update\(FIXED_STEP\)/,'simulation stays on the fixed 60 Hz path');
console.log('TD2 V4.1 preview metadata and ' + resources.length + ' static JS/CSS cache references verified.');
