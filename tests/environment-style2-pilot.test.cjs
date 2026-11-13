const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');

const terrain = fs.readFileSync(path.join(root, 'dist/terrain-polish.js'), 'utf8');
const scenery = fs.readFileSync(path.join(root, 'dist/kirchende-art.js'), 'utf8');
const levels = fs.readFileSync(path.join(root, 'dist/levels.js'), 'utf8');
const markup = fs.readFileSync(path.join(root, 'dist/index.html'), 'utf8');

assert.match(terrain, /ground-style2-v1\.webp/);
// The V3 preview selects its material first, but the original Kirchende art
// must remain the fallback if the opt-in texture is absent or fails to decode.
assert.match(terrain, /const reference=globalThis\.TD2GroundV3\?\.imageFor\?\.\(groundLevel,'base'\)/,
  'V3 material lookup is isolated to the ground-painting path');
assert.match(terrain, /createPattern\(reference\|\|style2Ground,'repeat'\)/,
  'Original Kirchende texture remains the fallback');
assert.match(terrain, /illustratedGround=null/);
assert.match(scenery, /environment-atlas-style2-v1\.webp/);
assert.match(scenery, /layout\.paths\?\.some/);
assert.match(scenery, /layout\.slots\?\.some/);
assert.match(scenery, /DenkmalForest\?\.drawCrown/);
assert.match(markup, /src="terrain-polish\.js/);
assert.match(markup, /src="kirchende-art\.js/);
assert.match(levels, /kirchendePaths=/);

const ground = path.join(root, 'dist/assets/kirchende/ground-style2-v1.webp');
const atlas = path.join(root, 'dist/assets/kirchende/environment-atlas-style2-v1.webp');
assert.ok(fs.statSync(ground).size < 250_000, 'ground texture stays below 250 KB');
assert.ok(fs.statSync(atlas).size < 500_000, 'transparent atlas stays below 500 KB');

console.log('Kirchende Style-2 environment pilot assets and render hooks passed.');
