const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'dist');

test('gallery keeps campaign order and never reveals locked monument data', () => {
  const {levelMeta, visibleLevel} = require(path.join(root, 'level-gallery.js'));
  assert.deepEqual(levelMeta.map(x => x.id), [1,2,3,4,5,6,7]);
  assert.equal(levelMeta[4].name, 'Hohensyburg');
  assert.equal(levelMeta[5].name, 'Goethestraße');
  assert.deepEqual(visibleLevel(3, false), {id:3, city:'Herdecke', locked:true});
  assert.equal(visibleLevel(3, true).name, 'Kirchende');
});

test('gallery CSS and script load after existing menu and game', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('level-gallery.css'));
  assert.ok(html.indexOf('game.js?') < html.indexOf('level-gallery.js?'));
  assert.ok(fs.existsSync(path.join(root, 'level-gallery.css')));
});
