'use strict';
/* Diagnostic: attribute ctx.save() calls to their calling function.
 * Same sandbox patch technique as tools/bench-td2.cjs; no engine file modified.
 * Run: node tools/diag-save-attribution.cjs [scenario] */
const makeGame = (() => {
  const fs = require('fs'), orig = fs.readFileSync;
  fs.readFileSync = (p, ...r) => {
    const s = orig(p, ...r);
    return String(p).endsWith('game.js') ? s
      .replace('function tutorialSeen(){return preferences.tutorialSeen;}', 'function tutorialSeen(){return true;}')
      .replace("const ctx = canvas.getContext('2d', {alpha:false});", "globalThis.__saveStacks=new Map();const ctx = (()=>{const raw=canvas.getContext('2d',{alpha:false});return new Proxy(raw,{get(t,k){const v=t[k];if(typeof v!=='function')return v;return (...a)=>{if(k==='save'&&globalThis.__captureSave){const st=(new Error().stack||'').split('\\n').slice(2,4).join('|');globalThis.__saveStacks.set(st,(globalThis.__saveStacks.get(st)||0)+1);}return v.apply(t,a)}}})})();") : s;
  };
  const make = require('../tests/helpers/game.cjs');
  return make;
})();
const SCENARIO = process.argv.find(a => !a.startsWith('--') && !a.endsWith('.cjs')) || 'l3endless';
const {t, box, element} = makeGame();
const cfg = SCENARIO === 'l1campaign' ? {level: 1, mode: 'campaign', wave: 6, towers: 6} : {level: 3, mode: 'endless', wave: 25, towers: 8};
function primeLevel(level, mode, wave, towers) {
  t.startGame(1, 'campaign');
  for (let i = 0; i < 10 && t.state === 'story'; i++) element('storyContinue').onclick();
  const g = t.game;
  g.level = level; g.mode = mode; g.wave = wave;
  g.waveTotal = 40; g.intermission = 0; g.spawnTimer = 0.01; g.essence = 99999;
  const slots = box.DenkmalLevels.levels[level].slots;
  for (let i = 0; i < towers && i < slots.length; i++) {
    g.towers.push({x: slots[i].x, y: slots[i].y, r: 18, damage: 20, fireRate: .6, fireCd: 0, range: 290, kind: ['bow', 'cannon', 'mage', 'rift', 'boomerang'][i % 5], level: (i % 3) + 1, spent: 40, targetMode: 'first'});
  }
  g.hero.x = box.DenkmalLevels.center.x + 120;
  g.hero.y = box.DenkmalLevels.center.y;
  return g;
}
const g = primeLevel(cfg.level, cfg.mode, cfg.wave, cfg.towers);
g.waveTotal = 1e9;
for (let i = 0; i < 600 && g.enemies.filter(e => !e.dead).length < 40; i++) t.update(1 / 60);
for (let i = 0; i < 200; i++) { g.monument.hp = g.monument.maxHp; g.hero.hp = g.hero.maxHp; if (g.enemies.length < 40) g.spawnTimer = Math.min(g.spawnTimer, .01); t.update(1 / 60); }
box.__captureSave = true;
for (let f = 0; f < 10; f++) {
  g.monument.hp = g.monument.maxHp; g.hero.hp = g.hero.maxHp;
  if (g.enemies.length < 40) g.spawnTimer = Math.min(g.spawnTimer, .01);
  t.update(1 / 60);
  t.draw();
}
box.__captureSave = false;
const stacks = box.__saveStacks || new Map();
const rows = [...stacks.entries()].sort((a, b) => b[1] - a[1]);
let total = 0;
for (const [k, n] of rows) { total += n; console.log(String(n).padStart(4), 'x', k.replace(/\s+/g, ' ').slice(0, 200)); }
console.log('TOTAL save calls over 10 draws:', total, '=> per frame:', total / 10);
