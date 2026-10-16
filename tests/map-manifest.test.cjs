'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '../dist/assets/maps');
const allowedStatuses = new Set(['belegt', 'rekonstruiert', 'kuenstlerisch']);
const expectedPasses = ['ground', 'paths', 'decor-back', 'decor-front'];
const ids = new Set();

for (let level = 1; level <= 4; level++) {
  const filename = path.join(root, `level-${level}`, 'map.json');
  const manifest = JSON.parse(fs.readFileSync(filename, 'utf8'));

  assert.equal(manifest.id, `level-${level}`);
  assert.ok(!ids.has(manifest.id), `duplicate map id ${manifest.id}`);
  ids.add(manifest.id);
  assert.deepEqual(manifest.world, {width: 3072, height: 3072});
  assert.equal(manifest.gameplay.level, level);
  assert.equal(manifest.gameplay.paths, `DenkmalLevels.levels[${level}].paths`);
  assert.equal(manifest.gameplay.slots, `DenkmalLevels.levels[${level}].slots`);
  assert.ok(!Array.isArray(manifest.gameplay.paths));
  assert.ok(!Array.isArray(manifest.gameplay.slots));
  assert.equal(Object.hasOwn(manifest.gameplay, 'gates'), false);

  const ordered = [...manifest.layers].sort((a, b) => a.order - b.order);
  assert.deepEqual(ordered.map(layer => layer.pass), expectedPasses);
  assert.equal(new Set(ordered.map(layer => layer.pass)).size, 4);
  for (const layer of ordered) {
    assert.match(layer.desktop, /-desktop\.webp$/);
    assert.match(layer.mobile, /-mobile\.webp$/);
    assert.equal(typeof layer.alpha, 'boolean');
  }

  for (const item of [...(manifest.structures || []), ...(manifest.sources || [])]) {
    assert.ok(allowedStatuses.has(item.status), `${filename}: invalid status ${item.status}`);
  }

  if (level <= 2) {
    assert.equal(manifest.classification, 'kuenstlerisch');
  } else {
    assert.ok(manifest.sources.length > 0, `Level ${level} needs historic sources`);
    assert.ok(manifest.sources.every(source => source.label && source.url));
  }

  if (level === 4) {
    assert.equal(manifest.gameplay.objective, 'game.monument');
    assert.ok(manifest.structures.some(item => item.role === 'sleeping-lion'));
  }
}

assert.equal(ids.size, 4);
console.log('Four Style 2 map manifests satisfy the geometry and provenance contract.');
