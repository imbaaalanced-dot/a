const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', 'dist');

test('gallery keeps campaign order and never reveals locked monument data', () => {
  const {levelMeta, visibleLevel} = require(path.join(root, 'level-gallery.js'));
  assert.deepEqual(levelMeta.map(x => x.id), [1,2,3,4,5,6,7,8]);
  assert.equal(levelMeta[4].name, 'Hohensyburg');
  assert.equal(levelMeta[5].name, 'Goethestraße');
  assert.deepEqual(visibleLevel(8, false), {id:8, city:'Witten', locked:true});
  assert.equal(visibleLevel(8, true).name, 'Heven');
  assert.deepEqual(visibleLevel(3, false), {id:3, city:'Herdecke', locked:true});
  assert.equal(visibleLevel(3, true).name, 'Kirchende');
});

test('gallery CSS and script load after existing menu and game', () => {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  assert.ok(html.includes('level-gallery.css'));
  assert.ok(html.indexOf('game.js?') < html.indexOf('level-gallery.js?'));
  assert.ok(fs.existsSync(path.join(root, 'level-gallery.css')));
});

test('world map is opt-in and covers all eight original chapter slots', () => {
  const {worldMapEnabled, worldMapPositions, levelMeta, visibleLevel}=require(path.join(root,'level-gallery.js'));
  assert.equal(worldMapEnabled(''),false);
  assert.equal(worldMapEnabled('?td2WorldMap=0'),false);
  assert.equal(worldMapEnabled('?td2WorldMap=1'),true);
  assert.equal(worldMapEnabled('?td2Cdn=1&td2WorldMap=1'),true);
  assert.deepEqual(Object.keys(worldMapPositions).map(Number),levelMeta.map(x=>x.id));
  const points=Object.values(worldMapPositions);
  assert.equal(new Set(points.map(x=>x.join(','))).size,8);
  assert.ok(points.every(([x,y])=>x>=12.5&&x<=87.5&&y>=10&&y<=90));
  assert.equal(visibleLevel(8,false).locked,true);
  assert.equal(visibleLevel(8,false).image,undefined);
  assert.equal(visibleLevel(8,true).name,'Heven');
});
