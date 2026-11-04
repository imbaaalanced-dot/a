/* Render-order pooling regression: same depth order, same culling, reused wrappers. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
const start=src.indexOf('  const drawOrder=[],drawOrderPool=[];');
const end=src.indexOf('  function draw(){',start);
assert.ok(start>=0&&end>start,'draw-order helper present');
const game={monument:{y:0},hero:{y:1},towers:[],enemies:[],deathFx:[]};
const visible=(o,r)=>!o.hidden&&r>0;
const context={game,visible};
vm.createContext(context);
vm.runInContext(src.slice(start,end)+';this.collect=collectDrawOrder;this.pool=drawOrderPool;',context);
function oldOrder(){
 return [{o:game.monument,t:'m'},...game.towers.map(o=>({o,t:'t'})),...game.enemies.map(o=>({o,t:'e'})),...game.deathFx.map(o=>({o,t:'d'})),{o:game.hero,t:'h'}]
 .filter(a=>visible(a.o,a.t==='t'?a.o.range:180))
 .sort((a,b)=>a.o.y-b.o.y);
}
let seed=12345;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
for(let k=0;k<250;k++){
 const spawn=(count,tower=false)=>Array.from({length:count},()=>({y:Math.floor(rnd()*30),range:tower?(rnd()<.15?0:45):undefined,hidden:rnd()<.3}));
 game.monument={y:Math.floor(rnd()*30),hidden:rnd()<.1};
 game.hero={y:Math.floor(rnd()*30),hidden:rnd()<.1};
 game.towers=spawn(Math.floor(rnd()*30),true);
 game.enemies=spawn(Math.floor(rnd()*130));
 game.deathFx=spawn(Math.floor(rnd()*25));
 const expected=oldOrder(),actual=context.collect();
 assert.equal(actual.length,expected.length);
 for(let i=0;i<expected.length;i++){
  assert.equal(actual[i].o,expected[i].o,'actor identity and depth order');
  assert.equal(actual[i].t,expected[i].t,'render type and stable ordering');
 }
 const entries=actual.slice();
 const again=context.collect();
 assert.equal(again.length,entries.length);
 assert.deepEqual(again,actual);
 assert.equal(context.pool.length>=actual.length,true);
 for(const e of entries)assert.ok(context.pool.includes(e),'reuses pooled wrappers');
}
game.towers=[];game.enemies=[];game.deathFx=[];
game.monument.hidden=false;game.hero.hidden=false;
assert.equal(context.collect().length,2,'pool shrinks active list when enemies disappear');
console.log('Render order: 250 randomized depth/culling parity scenarios; pooled entries reused.');
