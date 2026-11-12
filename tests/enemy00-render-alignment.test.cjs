'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../dist/directional-actions-v410.js'), 'utf8');
const calls = [];
const atlas = {naturalWidth: 512, naturalHeight: 1536};
const ctx = {
  save() {}, restore() {}, translate(x,y) { calls.push({type:'translate',x,y}); },
  drawImage(...args) { calls.push({type:'draw',args}); }, globalAlpha: 1
};
const sandbox = {Date, Map, WeakMap, Promise};
sandbox.globalThis = sandbox;
sandbox.DenkmalEnemyAnimations = {select: e => e.visualVariant === 1 ? 13 : 0};
sandbox.TD2DirectionalAssets = {
  'enemy-00': {file:'enemy-00.webp',cell:128,anchor:[66,72],height:53,frames:4,
    rows:{right:{attack:6,hit:7,death:8}}},
  'enemy-13': {file:'enemy-13.webp',cell:128,anchor:[66,72],height:53,frames:4,
    rows:{right:{attack:6,hit:7,death:8}}}
};
sandbox.DenkmalAssets = {ready: () => atlas, retain: () => Promise.resolve(), release() {}};
vm.runInNewContext(source, sandbox);
const renderer = sandbox.TD2DirectionalActions;

async function run() {
  const base = {type:'runner',x:100,y:200,velX:1,velY:0,visualVariant:0};
  for (const state of ['attack','hit','death']) {
    calls.length = 0;
    const e = {...base, attackAnim: state==='attack' ? .11 : 0, hit:state==='hit' ? .05 : 0};
    const opts = {level:1,target:{x:200,y:200}};
    if (state==='death') opts.deathProgress=.5;
    // First call queues the shared atlas; subsequent calls reuse the cache.
    renderer.enemy(ctx,e,opts);
    await Promise.resolve();
    await Promise.resolve();
    assert.equal(renderer.enemy(ctx,e,opts),true, state+' renders');
    const draw = calls.filter(c=>c.type==='draw').at(-1).args;
    const translate = calls.filter(c=>c.type==='translate').at(-1);
    assert.equal(draw[7],128*54/53, state+' width uses 54px runner height');
    assert.equal(draw[8],128*54/53, state+' height uses 54px runner height');
    assert.equal(translate.y,206,state+' uses common action footpoint');
    assert.ok(Math.abs((translate.y + draw[6] + 72*54/53)-206)<1e-9,
      state+' atlas anchor lands on action footpoint');
  }
  // Other skins must retain their prior scale; no global resizing.
  const other={...base,visualVariant:1,attackAnim:.11,hit:0};
  renderer.enemy(ctx,other,{level:1,target:{x:200,y:200}});
  await Promise.resolve();
  await Promise.resolve();
  calls.length=0;
  assert.equal(renderer.enemy(ctx,other,{level:1,target:{x:200,y:200}}),true);
  assert.equal(calls.filter(c=>c.type==='draw').at(-1).args[7],128*44/53);
  console.log('Enemy 00 attack/hit/death sizing, footpoint and other-skin isolation passed');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
