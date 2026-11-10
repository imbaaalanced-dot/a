const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const data=new Map(),box={Math,localStorage:{getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)}};vm.createContext(box);vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),box);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),box);
const c=box.DenkmalLevels,l=c.levels[6];assert.ok(l,'Goethestraße level exists');
assert.equal(l.paths.length,3);assert.equal(l.gates.length,3);assert.equal(l.firstWave,21);assert.equal(l.lastWave,24);assert.ok(l.airGate.y>c.center.y+600);
for(const path of l.paths){assert.deepEqual(path[path.length-1],c.center);assert.ok(path.length>=4);}
assert.ok(l.slots.length>=10);for(const pad of l.slots){assert.ok(l.paths.every(p=>c.pathDistance(pad,p)>=80));assert.ok(Math.hypot(pad.x-c.center.x,pad.y-c.center.y)>=165);}
assert.equal(c.level6Completed,false);c.completeLevel6();assert.equal(c.level6Completed,true);assert.equal(JSON.parse(data.get('denkmal-progress-v2')).data.level6,true);
vm.runInContext(fs.readFileSync('dist/goethestrasse.js','utf8'),box);const g=box.DenkmalGoethe;
for(let wave=21;wave<=24;wave++){const types=Array.from({length:48},(_,i)=>g.enemyType(wave,i));assert.ok(types.includes('shadowwing'));assert.ok(types.includes('wraith'));assert.match(g.warning(wave),/LUFTANGRIFF/);assert.ok(g.waveName(wave));}
assert.ok(Array.from({length:48},(_,i)=>g.enemyType(23,i)).includes('gargoyle'));assert.ok(Array.from({length:48},(_,i)=>g.enemyType(23,i)).includes('stormwing'));assert.equal(g.enemyType(24,0),'boss');
console.log('Goethestraße geometry, slots, mixed waves and completion passed');
let canvases=0,draws=0,patterns=0,environmentLoads=0;const drawArgs=[];
const atlas={naturalWidth:1536,naturalHeight:1024,complete:true};
const ctx=new Proxy({drawImage(...args){draws++;drawArgs.push(args);},createPattern(){patterns++;return {};},createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
box.document={createElement(){canvases++;return{width:0,height:0,getContext:()=>ctx};}};
box.KirchendeArt={loadEnvironment(){environmentLoads++;return Promise.resolve(true);},image(){return atlas;}};
box.DenkmalTerrain={groundImage:{complete:true,naturalWidth:768,naturalHeight:768}};
vm.runInContext(fs.readFileSync('dist/goethestrasse-art.js','utf8'),box);const art=box.DenkmalGoetheArt;
const lamps=art.environmentLamps(l);assert.equal(lamps.length,3,'three lanterns fit the outer park pockets');
for(const lamp of lamps){assert.ok(l.paths.every(route=>c.pathDistance(lamp,route)>=155),'lanterns stay clear of enemy lanes');assert.ok(l.slots.every(slot=>Math.hypot(slot.x-lamp.x,slot.y-lamp.y)>=155),'lanterns stay clear of build pads');}
art.drawGround(ctx,l);const warm=canvases;art.drawGround(ctx,l);assert.equal(canvases,warm,'warm scenery must reuse cached canvas');
art.drawMonument(ctx,{...c,hp:500,maxHp:500});art.drawAirLane(ctx,l,true);assert.ok(draws>=2);
assert.equal(environmentLoads,1,'Level 6 requests the shared environment loader once');
assert.ok(patterns>0,'shared forest-earth texture is baked into the cached ground canvas');
assert.ok(drawArgs.some(args=>args[0]===atlas&&args.length===9&&args[1]===1024&&args[2]===512),'lanterns use the existing transparent Style-2 atlas');
console.log('Goethestraße renderer and warm cache passed');
const blocked={Math,localStorage:{getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}}};vm.createContext(blocked);vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),blocked);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),blocked);
assert.equal(blocked.DenkmalLevels.completeLevel6(),false);assert.equal(blocked.DenkmalLevels.level6Completed,true,'blocked storage retains session unlock');
const reloaded={Math,localStorage:box.localStorage};vm.createContext(reloaded);vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),reloaded);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),reloaded);assert.equal(reloaded.DenkmalLevels.level6Completed,true);
assert.ok(l.slots.length<=18,'park must not become a grid of tower markers');
for(const pad of l.slots)for(const side of [-1,1])assert.ok(Math.hypot(pad.x-c.center.x-side*340,pad.y-c.center.y+145)>=110,'rose beds must not cover build slots');
