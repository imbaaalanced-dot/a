/* TD2 release label and static asset cache regression. Run: node tests/cache-busting.test.cjs */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const dist = path.resolve(__dirname, '../dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

assert.ok(!html.includes('class="release-badge"'), 'main menu must not show a patch badge');
assert.ok(html.includes('<meta name="application-version" content="v5-alpha"'), 'V5 version remains available as metadata');
assert.match(html, /id="td2-version-label"/, 'menu version labels use the canonical metadata');

// Asset versions are intentionally per-file, not one global version.
// A changed JS/CSS file must have its own cache key bumped in index.html
// and the expected key updated here; unchanged files keep their existing keys.
const expectedVersions = new Map([
  ['canonical-hero-art-v5.js', 'hero-lock2'],
  ['directional-assets-v410.js','v410a1'],
  ['directional-actions-v410.js','v5-hero-canonical1'],
  ['map-polish-v410.js','all-levels-20261113'],
  ['styles.css', 'v400a4merge1'],
  ['hero.css', 'v400a4merge1'],
  ['polish.css', 'v5-style2a1'],
  ['loot.css', 'v5-armory-hub1'],
  ['menu.css', 'developer3x1'],
  ['level-gallery.css', 'gallery-combined1'],
  ['portrait-avatars-v5.css', 'duo-v5a1'],
  ['combat-hud-v2.css', 'v5hud2a2'],
  ['style2-v5-ui-refinement.css', '20261109a'],
  ['combat-hud-layout-v3.css','td2hud-layout-20261113a'],
  ['level4-options-menu-compact.css','level4menu-20261114a'],
  ['portrait-avatars-v5.js', 'copy-20261112-urlfix'],
  ['level-gallery.js', 'v5-style2a1'],
  ['preloader.css', 'td2preload1'],
  ['portrait-patch.css', 'v410a1touch1'],
  ['asset-manager.js', 'syburg-clean-runtime1'],
  ['preloader.js', 'copy-20261110a'],
  ['persisted-state.js', 'save1'],
  ['campaign-20-wave-plan.js', 'campaign20-runtime1'],
  ['levels.js', 'level7btouch1campaign20-kirchende-layout-20261114a'],
  ['visuals.js', 'expansion2'],
  ['equipment-catalog.js', 'loot-v2-20261029'],
  ['loot.js', 'loot-v2-20261029'],
  ['loot-ui.js', 'copy-20261112-urlfix'],
  ['v2-expansion-data.js', 'expansion2'],
  ['v2-expansion.js', 'copy-20261110a'],
  ['hero-saga.js', 'copy-20261112-urlfix'],
  ['directional-hero-assets-v5.js','v5-canonical-art3'],
  ['combat-fx.js', 'v5-projectile-canonical1'],
  ['style2-user-towers.js', 'v5-canonical-art1'],
  ['style2-impact-atlas.js', 'reference-refresh-1'],
  ['style2-impact-atlas-v4.js', 'style2-v4a1'],
  ['style2-user-towers-v4.js', 'style2-v4a1'],
  ['enemy-animations.js', 'v410a1'],
  ['style2-markers.js', 'markers2'],
  ['ground-v3.js','late-ground-20261113'],
  ['style2-maps.js','cold-start-20261113'],
  ['flight-enemies.js', 'flight2'],
  ['goethestrasse.js', 'goethe2'],
  ['goethestrasse-art.js','late-ground-20261113'],
  ['westhofen.js', 'westhofen2'],
  ['westhofen-art.js','late-ground-20261113'],
  ['game.js', 'towerhud-20261113a'],
  ['barracks.js','td2-barracks5'],
  ['touch-context-hud.js','v5hud2a1'],
  ['portal-run.js','save2'],
  ['portal-perks.js','portal1'],
  ['campaign-balance.js','portal1'],
  ['portal-ui.css','expansion2'],
  ['hohensyburg.js', 'syburg-balance2'],
  ['hohensyburg-art.js','syburg-v2-late-ground-20261114'],
  ['style2-ambience.js', 'alpha9a2'],
  ['style2-ui-polish.css', 'ui-gold2'],
  ['style2-phase6.js', 'alpha9a5'],
  ['kirchende-combat.js', 'v400a5combined1'],
  ['kirchende-art.js', 'kirchende-layout-20261114a'],
  ['style2-environment-palette.js','v5-style2a1'],
  ['terrain-polish.js','late-ground-20261113'],
  ['forest-crowns.js', 'style2-forest6a'],
  ['church-art.js','kirchende-layout-20261114a'],
  ['style2-level4-reference.js', 'ref4a2'],
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
assert.match(gameSource,/asset-atlas-style2\.webp\?v=style2a1/,'game must use a valid versioned Style-2 atlas');
for(const filename of expectedVersions.keys()){
  if(!filename.endsWith('.js'))continue;
  assert.doesNotMatch(fs.readFileSync(path.join(dist,filename),'utf8'),/\.(?:webp|png|jpg|jpeg|svg)assets\/v=/,
    filename+' contains an invalid image asset version separator');
}
assert.match(gameSource,/mobileRender&&graphicsMode!=='high'\?1000\/60:0/,'mobile LOW and AUTO both target 60 FPS, HIGH remains uncapped');
assert.match(gameSource,/qualityTier==='medium'\?\(mobileRender\?\.85:1\.25\):mobileRender\?\.70:\.85/,'mobile renderer uses conservative DPR caps');
assert.match(gameSource,/qualityTier==='high'\?1400000:qualityTier==='medium'\?650000:320000/,'mobile low tier stays within a 320k pixel budget');
assert.match(gameSource,/for\(let s=0;s<steps;s\+\+\)update\(FIXED_STEP\)/,'simulation stays on the fixed 60 Hz path');
console.log('TD2 V4.1 preview metadata and ' + resources.length + ' static JS/CSS cache references verified.');