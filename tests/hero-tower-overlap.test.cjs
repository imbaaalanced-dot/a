/* A moving hero must not pass through the painted base of a placed tower. */
'use strict';
const assert = require('node:assert/strict');
const { createRenderSandbox } = require('./helpers/render-sandbox.cjs');

const harness = createRenderSandbox();
const t = harness.test;
t.startGame(1);
harness.sandbox.HeroSaga.continueStory();
const game = t.getGame();
game.intermission = 9999;
game.waveTotal = 10;
game.waveSpawned = 0;
game.enemies.length = 0;
const tower = { x: 1670, y: 1616, r: 18, kind: 'bow', level: 1,
  range: 250, fireCd: 9999, fireRate: 1, damage: 0, spent: 30 };
game.towers = [tower];
game.hero.x = tower.x - 65;
game.hero.y = tower.y;
const startX = game.hero.x;

harness.dispatch('keydown', { code: 'KeyD', repeat: false, preventDefault() {} });
for (let i = 0; i < 40; i++) t.update(1 / 60);
harness.dispatch('keyup', { code: 'KeyD' });

assert.ok(game.hero.x > startX + 10, `movement must be active, got x=${game.hero.x}`);
assert.ok(game.hero.x <= tower.x - game.hero.r - tower.r + 0.01,
  `hero should stop at the tower base, got x=${game.hero.x} past tower x=${tower.x}`);

// A tower must not be created directly under a standing hero, either.
t.startGame(1);
harness.sandbox.HeroSaga.continueStory();
const fresh = t.getGame();
const slot = harness.sandbox.DenkmalLevels.levels[1].slots[0];
fresh.hero.x = slot.x;
fresh.hero.y = slot.y;
fresh.essence = 9999;
t.selectTower('bow');
t.buildTower();
assert.equal(fresh.towers.length, 0, 'building on the hero must be rejected');

// Older saves may already have overlapping coordinates. Movement away must
// remain possible, so a character cannot become trapped in a tower.
fresh.towers = [tower];
fresh.hero.x = tower.x;
fresh.hero.y = tower.y;
fresh.waveTotal = 10;
fresh.intermission = 9999;
harness.dispatch('keydown', { code: 'KeyD', repeat: false, preventDefault() {} });
for (let i = 0; i < 12; i++) t.update(1 / 60);
harness.dispatch('keyup', { code: 'KeyD' });
assert.ok(fresh.hero.x > tower.x + 20, 'a hero already inside the tower can leave');

console.log('hero-tower-overlap: traversal, placement and escaping old overlaps are guarded');
