const test = require('node:test');
const assert = require('node:assert/strict');
const portal = require('../dist/portal-gameplay.js');

test('three sections have two bounded waves and boss only in the last', () => {
  assert.equal(portal.sections.length, 3);
  for (const [i, section] of portal.sections.entries()) {
    assert.equal(section.waves.length, 2);
    for (const wave of section.waves) assert.ok(wave.count <= portal.enemyCap);
    assert.equal(section.waves[1].boss, i === 2);
    assert.ok(section.spawn.y > section.exit.y);
  }
});

test('a mandatory spawn is deferred at the cap, never silently consumed', () => {
  assert.equal(portal.canSpawn(40, 0, 20), false);
  assert.equal(portal.canSpawn(39, 0, 20), true);
  assert.equal(portal.canSpawn(0, 20, 20), false);
});

test('portal entry is only accepted near the north exit in the exit phase', () => {
  const area = portal.sections[0];
  assert.equal(portal.atExit({x:area.exit.x,y:area.exit.y}, area, 'exit'), true);
  assert.equal(portal.atExit(area.spawn, area, 'exit'), false);
  assert.equal(portal.atExit(area.exit, area, 'build'), false);
});
