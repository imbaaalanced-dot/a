const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const data=new Map(),box={Math,localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}};vm.createContext(box);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),box);
const c=box.DenkmalLevels,l=c.levels[6];assert.ok(l,'Goethestraße level exists');
assert.equal(l.paths.length,3);assert.equal(l.gates.length,3);assert.equal(l.firstWave,21);assert.equal(l.lastWave,24);assert.ok(l.airGate.y>c.center.y+600);
for(const path of l.paths){assert.deepEqual(path[path.length-1],c.center);assert.ok(path.length>=4);}
assert.ok(l.slots.length>=10);for(const pad of l.slots){assert.ok(l.paths.every(p=>c.pathDistance(pad,p)>=80));assert.ok(Math.hypot(pad.x-c.center.x,pad.y-c.center.y)>=165);}
assert.equal(c.level6Completed,false);c.completeLevel6();assert.equal(c.level6Completed,true);assert.equal(data.get('denkmal-level6-completed-v1'),'true');
vm.runInContext(fs.readFileSync('dist/goethestrasse.js','utf8'),box);const g=box.DenkmalGoethe;
for(let wave=21;wave<=24;wave++){const types=Array.from({length:48},(_,i)=>g.enemyType(wave,i));assert.ok(types.includes('shadowwing'));assert.ok(types.includes('wraith'));assert.match(g.warning(wave),/LUFTANGRIFF/);assert.ok(g.waveName(wave));}
assert.ok(Array.from({length:48},(_,i)=>g.enemyType(23,i)).includes('gargoyle'));assert.ok(Array.from({length:48},(_,i)=>g.enemyType(19,i)).includes('stormwing'));assert.equal(g.enemyType(24,0),'boss');
console.log('Goethestraße geometry, slots, mixed waves and completion passed');
let canvases=0,draws=0;const ctx=new Proxy({drawImage(){draws++;},createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
box.document={createElement(){canvases++;return{width:0,height:0,getContext:()=>ctx};}};
vm.runInContext(fs.readFileSync('dist/goethestrasse-art.js','utf8'),box);const art=box.DenkmalGoetheArt;
art.drawGround(ctx,l);const warm=canvases;art.drawGround(ctx,l);assert.equal(canvases,warm,'warm scenery must reuse cached canvas');
art.drawMonument(ctx,{...c,hp:500,maxHp:500});art.drawAirLane(ctx,l,true);assert.ok(draws>=2);
console.log('Goethestraße renderer and warm cache passed');
const blocked={Math,localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}};vm.createContext(blocked);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),blocked);
assert.equal(blocked.DenkmalLevels.completeLevel6(),false);assert.equal(blocked.DenkmalLevels.level6Completed,true,'blocked storage retains session unlock');
const reloaded={Math,localStorage:box.localStorage};vm.createContext(reloaded);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),reloaded);assert.equal(reloaded.DenkmalLevels.level6Completed,true);
assert.ok(l.slots.length<=18,'park must not become a grid of tower markers');
for(const pad of l.slots)for(const side of [-1,1])assert.ok(Math.hypot(pad.x-c.center.x-side*340,pad.y-c.center.y+145)>=110,'rose beds must not cover build slots');
