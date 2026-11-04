/* Verify pooled paint callbacks preserve rendering dispatch, depth order and actor updates. */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
const start=src.indexOf('  const drawOrder=[],drawOrderPool=[];');
const end=src.indexOf('  function draw(){',start);
assert.ok(start>0&&end>start,'render pool helpers exist');
assert.ok(src.includes('Style2Phase6.upright(ctx,a.o,a.paint);else a.paint()'),
 'draw loop invokes reusable paint method without a per-actor closure');
const calls=[];
const game={
 monument:{name:'monument',y:5},
 towers:[{name:'tower',y:10,range:45}],
 enemies:[{name:'enemy',y:15}],
 deathFx:[{name:'death',y:20,life:0.25,maxLife:1}],
 hero:{name:'hero',y:25}
};
const box={
 game,
 visible:(actor,range)=>!actor.hidden&&range>0,
 drawTower:actor=>calls.push(['tower',actor]),
 drawEnemy:(actor,death)=>calls.push(['enemy',actor,death]),
 drawMonument:actor=>calls.push(['monument',actor]),
 drawHero:actor=>calls.push(['hero',actor])
};
vm.createContext(box);
vm.runInContext(src.slice(start,end)+';this.collect=collectDrawOrder;this.pool=drawOrderPool;',box);
const initial=box.collect();
assert.deepEqual(Array.from(initial,e=>e.t),['m','t','e','d','h']);
assert.equal(initial.length,5);
for(const entry of initial)entry.paint();
assert.deepEqual(calls.map(x=>x[0]),['monument','tower','enemy','enemy','hero']);
assert.equal(calls[2][2],undefined,'normal enemy has no death fade');
assert.equal(calls[3][2],0.75,'death fade uses latest life ratio');
const storedCallbacks=Array.from(box.pool,e=>e.paint);
const storedActors=Array.from(box.pool,e=>e.o);
calls.length=0;
// Reassign every pooled slot with new objects and even different rendering types.
game.monument={name:'monument2',y:40};
game.towers=[];
game.enemies=[{name:'enemy2',y:10},{name:'enemy3',y:20}];
game.deathFx=[{name:'death2',y:30,life:0.5,maxLife:1}];
game.hero={name:'hero2',y:50};
const updated=box.collect();
assert.equal(updated.length,5);
for(let i=0;i<box.pool.length;i++)assert.equal(box.pool[i].paint,storedCallbacks[i],
 'callback identity remains stable between frames');
for(const entry of updated)entry.paint();
assert.deepEqual(calls.map(x=>x[0]),['enemy','enemy','enemy','monument','hero']);
assert.deepEqual(calls.map(x=>x[1].name),['enemy2','enemy3','death2','monument2','hero2'],
 'paint follows new actors instead of captured actors');
assert.equal(calls[2][2],0.5,'updated dying actor fade');
assert.ok(box.pool.some((e,i)=>e.o!==storedActors[i]),'the slot actors changed');
game.enemies=[];game.deathFx=[];
game.monument.hidden=true;game.hero.hidden=true;
assert.equal(box.collect().length,0,'hidden actors are not rendered');
assert.equal(box.pool.length,5,'previously allocated callbacks remain cached');
console.log('Paint callback pool: actor replacement, role changes, fade, visibility and stable callbacks passed.');
