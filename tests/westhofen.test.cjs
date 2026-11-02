const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const data=new Map(),box={Math,localStorage:{getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}};vm.createContext(box);
vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),box);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),box);
const c=box.DenkmalLevels,l=c.levels[7];assert.ok(l,'Westhofen level exists');
assert.match(l.name,/WESTHOFEN/);assert.ok(l.approximate,'layout is explicitly illustrative, not surveyed');
assert.equal(l.paths.length,3);assert.equal(l.gates.length,3);
assert.equal(l.firstWave,25);assert.equal(l.lastWave,28);
assert.equal(l.startEssence,340);assert.equal(l.maxTowers,12);
assert.equal(l.gateLabels.join('|'),'REICHSHOFSTRASSE WEST|REICHSHOFSTRASSE OST|GRÜNZUG NORD');
assert.ok(l.airGate&&Number.isFinite(l.airGate.x)&&Number.isFinite(l.airGate.y),'air corridor enters from the street side');
for(const [i,route] of l.paths.entries()){
  assert.ok(route.length>=4);
  assert.deepEqual(route.at(-1),c.center);
  assert.equal(route[0].x,l.gates[i].x);assert.equal(route[0].y,l.gates[i].y);
}
assert.ok(l.slots.length>=10&&l.slots.length<=18,'green strip must not become a tower grid');
for(const pad of l.slots){
  assert.ok(l.paths.every(p=>c.pathDistance(pad,p)>=80),'build pads stay off the approach lanes');
  assert.ok(Math.hypot(pad.x-c.center.x,pad.y-c.center.y)>=165,'memorial footprint stays empty');
}
assert.deepEqual(Array.from(c.getWaveGates(7,25)),[0,1],'chapter opening pressures both street corridors');
assert.deepEqual(Array.from(c.getWaveGates(7,26)),[0,1,2],'the green corridor joins from wave 26');
vm.runInContext(fs.readFileSync('dist/westhofen.js','utf8'),box);const w=box.DenkmalWesthofen;
for(let wave=25;wave<=28;wave++)assert.ok(w.waveName(wave));
const opening=Array.from({length:34},(_,i)=>w.enemyType(25,i));
assert.ok(opening.every(t=>!['shadowwing','gargoyle','stormwing'].includes(t)),'wave 25 chapter opening is a pure ground attack');
assert.ok(opening.includes('wraith')&&opening.includes('runner'));
assert.ok(Array.from({length:48},(_,i)=>w.enemyType(26,i)).includes('shadowwing'),'air pressure arrives with wave 26');
assert.ok(Array.from({length:48},(_,i)=>w.enemyType(27,i)).includes('gargoyle'));
assert.ok(Array.from({length:48},(_,i)=>w.enemyType(28,i)).includes('stormwing'));
assert.equal(w.enemyType(28,0),'boss');
assert.match(w.warning(25,'campaign'),/BODENANGRIFF/);
assert.match(w.warning(25,'campaign'),/ZWEI STRASSENZULÄUFE/);
assert.match(w.warning(26,'campaign'),/LUFTANGRIFF/);
assert.equal(w.campaignWave(25,'endless'),null,'endless keeps its own composition');
assert.equal(w.campaignWave(29),null,'campaign opening only covers waves 25–28');
assert.ok(Array.from({length:32},(_,i)=>w.enemyType(25,i,'endless')).includes('shadowwing'),'endless wave 25 retains aerial pressure');
assert.equal(c.level7Completed,false);assert.equal(c.completeLevel7(),true);assert.equal(c.level7Completed,true);
assert.equal(JSON.parse(data.get('denkmal-progress-v2')).data.level7,true);
// A save written before Westhofen (no level7 field) stays valid and upgrades in memory.
const legacy=new Map([['denkmal-progress-v2',JSON.stringify({schemaVersion:1,lastUpdated:5,data:{level2:true,level4:true,level5:true,level6:true}})]]);
const legacyBox={Math,localStorage:{getItem:k=>legacy.get(k)??null,setItem:(k,v)=>legacy.set(k,v)}};vm.createContext(legacyBox);
vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),legacyBox);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),legacyBox);
assert.equal(legacyBox.DenkmalLevels.level6Completed,true,'legacy envelope without level7 stays readable');
assert.equal(legacyBox.DenkmalLevels.level7Completed,false,'missing level7 defaults to locked');
// Renderer: cached ground, procedural memorial, air lane — no DOM or assets required.
let canvases=0,draws=0;const ctx=new Proxy({drawImage(){draws++;},createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
box.document={createElement(){canvases++;return{width:0,height:0,getContext:()=>ctx};}};
vm.runInContext(fs.readFileSync('dist/westhofen-art.js','utf8'),box);const art=box.DenkmalWesthofenArt;
art.drawGround(ctx,l);const warm=canvases;art.drawGround(ctx,l);assert.equal(canvases,warm,'warm scenery must reuse its cached canvas');
art.drawMonument(ctx,{...c,hp:500,maxHp:500});art.drawAirLane(ctx,l,true);assert.ok(draws>=2);
assert.equal(typeof art.release,'function');
// Blocked storage keeps the session unlock; a reload restores the flag.
const blocked={Math,localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}};vm.createContext(blocked);
vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),blocked);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),blocked);
assert.equal(blocked.DenkmalLevels.completeLevel7(),false);
assert.equal(blocked.DenkmalLevels.level7Completed,true,'blocked storage retains the session unlock');
const reloaded={Math,localStorage:box.localStorage};vm.createContext(reloaded);
vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),reloaded);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),reloaded);
assert.equal(reloaded.DenkmalLevels.level7Completed,true,'completion survives a browser restart');
// Wiring: scripts, cache keys, menu cards and game hooks must reference Westhofen.
const html=fs.readFileSync('dist/index.html','utf8'),game=fs.readFileSync('dist/game.js','utf8');
assert.ok(html.includes('westhofen.js?v=westhofen1'));
assert.ok(html.includes('westhofen-art.js?v=westhofen1'));
assert.ok(html.includes('levels.js?v=level7'));
assert.ok(html.includes('game.js?v=v410a1level7'));
for(const id of ['level7Btn','endless7Btn'])assert.ok(html.includes('id="'+id+'"'),id+' exists in the menu');
assert.match(html,/KRIEGERDENKMAL WESTHOFEN/);
assert.match(game,/campaign\.completeLevel7\(\)/);
assert.ok(game.includes('game.level===7&&game.wave===28'),'wave 28 ends the Westhofen campaign');
assert.ok(game.includes('DenkmalWesthofenArt?.drawGround'),'game renders the Westhofen ground cache');
assert.ok(game.includes('DenkmalWesthofen.enemyType(wave,index,game.mode)'),'Westhofen drives the wave composition');
console.log('Westhofen geometry, slots, gates, waves, saves, legacy envelope, cached art and wiring passed');
