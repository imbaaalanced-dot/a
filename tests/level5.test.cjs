'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const memory=new Map(),writes=[],storage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>{memory.set(k,v);writes.push(k);}};
const box={Math,localStorage:storage,console};vm.createContext(box);
vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),box);
const lib=box.DenkmalLevels,level=lib.levels[5],center=lib.center;
assert.ok(level&&level.approximate,'visual approach is explicitly illustrative');
assert.match(level.name,/KAISER-WILHELM/);
assert.equal(level.firstWave,17);assert.equal(level.lastWave,20);
assert.equal(level.startEssence,300);assert.equal(level.maxTowers,11);
assert.equal(level.paths.length,3);assert.equal(level.gates.length,3);
const terrace=level.syburgTerrace;
assert.ok(terrace,'the two-level photographed terrace is part of the game map');
assert.ok(terrace.forecourt.right-terrace.forecourt.left>terrace.raised.right-terrace.raised.left,'public forecourt is wider than the pylon deck');
assert.ok(terrace.forecourt.top<terrace.raised.bottom&&terrace.forecourt.bottom>terrace.raised.bottom,'two planes meet at stairs');
assert.equal(terrace.stairs.length,2,'two independently modeled public stair flights');
assert.ok(level.paths[0][0].x<center.x&&level.paths[1][0].x>center.x&&level.paths[2][0].y>center.y,'woodland arms and front approach stay asymmetric');
assert.ok(level.paths[2].some(p=>Math.hypot(p.x-(center.x+218),p.y-(center.y+325))<5),'the lower approach actually crosses its stairway');
assert.ok(level.slots.length>=12&&level.slots.length<=20);
assert.ok(level.airGate.y>center.y+850,'flight spawns over the south-side hillside');
for(const [i,route] of level.paths.entries()){
 assert.ok(route.length>=4);assert.deepEqual(route.at(-1),center);
 assert.equal(route[0].x,level.gates[i].x);assert.equal(route[0].y,level.gates[i].y);
}
for(const pad of level.slots){
 assert.ok(level.paths.every(route=>lib.pathDistance(pad,route)>=90),'safe pads stay off approach lanes');
 assert.ok(Math.hypot(pad.x-center.x,pad.y-center.y)>=200,'memorial footprint stays empty');
 assert.ok(pad.y<center.y+690,'no towers on the southern ravine');
 const x=pad.x-center.x,y=pad.y-center.y,r=terrace.raised;
 assert.ok(x<r.left-45||x>r.right+45||y<r.top-45||y>r.bottom+45,'tower pad never intersects the elevated retaining wall');
 assert.ok(terrace.stairs.every(stair=>Math.abs(x-stair.x)>=stair.width/2+65||y<=stair.top-65||y>=stair.bottom+65),'tower pad never blocks visitor stairways');
}
assert.deepEqual(Array.from(lib.getWaveGates(5,17)),[0,1]);
assert.deepEqual(Array.from(lib.getWaveGates(5,18)),[0,1,2]);
vm.runInContext(fs.readFileSync('dist/hohensyburg.js','utf8'),box);
const plan=box.DenkmalHohensyburg;
for(let wave=17;wave<=20;wave++){
 const pool=Array.from({length:48},(_,i)=>plan.enemyType(wave,i));
 assert.ok(pool.includes('wraith'));assert.ok(pool.includes('shadowwing'));
 assert.match(plan.warning(wave),/LUFTANGRIFF/);assert.ok(plan.waveName(wave));
}
assert.equal(plan.enemyType(20,0),'boss');
assert.ok(Array.from({length:48},(_,i)=>plan.enemyType(19,i)).includes('stormwing'));
assert.equal(lib.level5Completed,false);assert.equal(lib.completeLevel5(),true);
assert.equal(lib.level5Completed,true);
assert.equal(memory.get('denkmal-level5-completed-v1'),'true');
const reload={Math,localStorage:storage};vm.createContext(reload);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),reload);
assert.equal(reload.DenkmalLevels.level5Completed,true,'completed level survives browser restart');
const blocked={Math,localStorage:{getItem(){throw Error('denied')},setItem(){throw Error('denied')}}};
vm.createContext(blocked);vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),blocked);
assert.equal(blocked.DenkmalLevels.completeLevel5(),false);
assert.equal(blocked.DenkmalLevels.level5Completed,true,'blocked storage keeps session progress');
// Renderer: test both cache reuse and objective anchoring, without a DOM or WebGL.
let creations=0,images=0;const drawArgs=[];
const paint=new Proxy({drawImage(...args){images++;drawArgs.push(args);},createLinearGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:()=>{}});
box.document={createElement(tag){assert.equal(tag,'canvas');creations++;return {width:0,height:0,getContext:()=>paint};}};
vm.runInContext(fs.readFileSync('dist/hohensyburg-art.js','utf8'),box);
const art=box.DenkmalHohensyburgArt;
art.drawGround(paint,level);art.drawMonument(paint,{...center,hp:500,maxHp:500});art.drawAirLane(paint,level,true);
const n=creations;art.drawGround(paint,level);art.drawMonument(paint,center);
assert.equal(creations,n,'draw calls reuse their pre-rendered caches');assert.equal(n,2);
assert.ok(images>=4,'painted terrain and upright memorial are rendered');
const spritePath='dist/assets/hohensyburg/kaiser-wilhelm-v1.webp';
const asset=fs.readFileSync(spritePath);
assert.ok(asset.length>10000&&asset.length<120000,'transparent game WebP is lightweight');
assert.equal(asset.toString('ascii',0,4),'RIFF');
assert.equal(asset.toString('ascii',8,12),'WEBP');
assert.equal(asset.toString('ascii',12,16),'VP8X');
assert.ok(asset[20]&0x10,'VP8X alpha flag set for transparency');
box.Image=class {
  constructor(){this.complete=true;this.naturalWidth=361;this.naturalHeight=550;}
  set src(value){this.loadedFrom=value;}
};
vm.runInContext(fs.readFileSync('dist/hohensyburg-art.js','utf8'),box);
const beforeSprite=creations;
box.DenkmalHohensyburgArt.drawMonument(paint,center);
assert.equal(creations,beforeSprite,'loaded sprite does not allocate a fallback canvas');
const drawnSprite=drawArgs.at(-1);
assert.match(drawnSprite[0].loadedFrom,/hohensyburg\/kaiser-wilhelm-v1\.webp\?v=syburg3/);
assert.ok(Math.abs(drawnSprite[1]+drawnSprite[3]/2-center.x)<.01,'asset x remains at monument anchor');
assert.ok(Math.abs(drawnSprite[2]+drawnSprite[4]-center.y-40)<.01,'asset foot rests on raised terrace');
const html=fs.readFileSync('dist/index.html','utf8'),game=fs.readFileSync('dist/game.js','utf8');
for(const id of ['level5Btn','endless5Btn'])assert.ok(html.includes('id="'+id+'"'));
assert.ok(html.includes('hohensyburg.js?v=syburg1'));
assert.ok(html.includes('levels.js?v=syburg2'));
assert.ok(html.includes('hohensyburg-art.js?v=syburg3'));
assert.match(game,/campaign.completeLevel5\(\)/);
assert.ok(game.includes('game.level===5&&game.wave===20'));
assert.ok(game.includes('DenkmalHohensyburgArt?.drawGround'));
console.log('Hohensyburg map, 3 lanes, air route, tower safety, waves, saves and cached art passed');
