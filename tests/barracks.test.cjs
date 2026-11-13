'use strict';
const {readFileSync}=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s={};s.globalThis=s;vm.runInNewContext(readFileSync(require('node:path').join(__dirname,'../dist/barracks.js'),'utf8'),s);
const b=s.DenkmalBarracks,paths=[[{x:0,y:0},{x:200,y:0}]];
const fs=require('node:fs'),path=require('node:path');
for(const [label,url] of [['atlas',b.ATLAS],['states',b.STATES]]){
  assert.match(url,/^assets\/barracks\/[a-z0-9-]+\.webp\?v=[a-z0-9-]+$/i,label+' must be a valid versioned WebP URL');
  assert.ok(fs.statSync(path.join(__dirname,'../dist',url.split('?')[0])).isFile(),label+' active runtime asset exists');
}
assert.notEqual(b.ATLAS,b.STATES,'barracks action and state sheets use distinct URLs');
const tower={kind:'barracks',level:1,x:90,y:78},game={towers:[tower],enemies:[],militia:[]};
assert.equal(b.nearestLanePoint(tower,paths).y,0);
b.update(game,1/60,{paths});assert.equal(game.militia.length,1);
for(let k=0;k<200;k++)b.update(game,1/60,{paths});
assert.equal(game.militia.length,1);assert.ok(game.militia[0].y<78);
const enemy={x:90,y:0,r:12,hp:75,dead:false};game.enemies.push(enemy);
let hits=0;for(let k=0;k<200;k++)b.update(game,1/60,{paths,hurtEnemy:(e,d)=>{hits++;e.hp-=d;if(e.hp<=0)e.dead=true}});
assert.ok(hits>0&&enemy.hp<75);
assert.equal(b.aggroTarget(game,{x:90,y:0}),game.militia[0]);
assert.equal(b.aggroTarget(game,{x:90,y:0,flying:true}),null);
assert.equal(b.aggroTarget(game,{x:90,y:0,type:'sapper'}),null);
assert.equal(b.damageAlly(game.militia[0],1000),true);
b.update(game,1/60,{paths});assert.equal(b.animation(game.militia[0]),'death');
for(let k=0;k<40;k++)b.update(game,1/60,{paths});assert.equal(game.militia.length,0);
tower.level=2;tower.recruitCd=0;for(let k=0;k<900;k++)b.update(game,1/60,{paths});assert.equal(game.militia.length,2);
const veteran=game.militia[0];veteran.hp=veteran.maxHp/2;
tower.level=3;b.update(game,1/60,{paths});assert.equal(game.militia.length,2);assert.equal(game.militia[0],veteran);assert.equal(veteran.hp,75);assert.equal(veteran.level,3);
game.towers.length=0;b.update(game,1/60,{paths});assert.equal(game.militia.length,0);
const many={towers:Array.from({length:20},(_,i)=>({kind:'barracks',level:3,x:i*5,y:60})),enemies:[],militia:[]};
for(let k=0;k<1300;k++)b.update(many,1/60,{paths});assert.ok(many.militia.length<=b.MAX_ALLIES);
console.log('Barracks: recruitment, caps, path, damage, aggro, upgrade and sell passed');

// All drawing uses one atlas blit, never an overlaid standing sprite.
let draws=0,loads=0;const img={};s.DenkmalAssets={ready:()=>img,retain:()=>{loads++;}};
const ctx=new Proxy({drawImage(){draws++;}}, {get:(o,k)=>o[k]||(()=>{})});
const unit=b.makeUnit({level:1,x:0,y:0},paths);unit.aliveTime=2;
for(const mode of ['idle','walk','attack']){unit.mode=mode;draws=0;b.drawUnit(ctx,unit);assert.equal(draws,1);}
unit.hitTime=.1;assert.equal(b.animation(unit),'hit');unit.hitTime=0;unit.hp=0;assert.equal(b.animation(unit),'death');
draws=0;b.drawTower(ctx,{kind:'barracks',level:3,x:0,y:0});assert.equal(draws,1);
s.DenkmalAssets.ready=()=>null;draws=0;b.drawUnit(ctx,unit);assert.equal(draws,0,'no placeholder or duplicate art when atlas is loading');
console.log('Barracks atlas rendering and state priority passed');
// Squared-distance hot path must preserve the original nearest-target ordering.
let seed=1701;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let scenario=0;scenario<500;scenario++){
 const allies=Array.from({length:10},(_,i)=>({x:random()*400,y:random()*400,hp:i%4===0?0:100}));
 const e={x:random()*400,y:random()*400};let expected=null,best=90;
 for(const u of allies){if(u.hp<=0)continue;const d=Math.hypot(e.x-u.x,e.y-u.y);if(d<best){best=d;expected=u;}}
 assert.equal(b.aggroTarget({militia:allies},e),expected);
}
const edge={x:0,y:0,hp:1};assert.equal(b.aggroTarget({militia:[edge]},{x:90,y:0}),null);
assert.equal(b.aggroTarget({militia:[edge]},{x:89.999,y:0}),edge);
console.log('Barracks: 500 seeded nearest-target cases and range boundaries passed');


// The original VP8 building atlas has no alpha channel. Its dark surrounding
// pixels must be removed once per building, without erasing the colored sprite.
{
 const pixels=new Uint8ClampedArray(192*192*4);
 for(let i=0;i<192*192;i++){const at=i*4;pixels[at]=pixels[at+1]=pixels[at+2]=5;pixels[at+3]=255;}
 for(let y=65;y<120;y++)for(let x=60;x<134;x++){
   const at=(y*192+x)*4;pixels[at]=172;pixels[at+1]=65;pixels[at+2]=39;
 }
 let allocations=0,output=null,painted=null;
 s.document={createElement(){allocations++;return {width:0,height:0,getContext(){return {
   drawImage(){},getImageData(){return {data:pixels};},putImageData(frame){output=frame.data;}
 };}};}};
 const opaqueAtlas={};s.DenkmalAssets.ready=()=>opaqueAtlas;
 const dest={drawImage(...args){painted=args;}};
 b.drawTower(dest,{kind:'barracks',level:2,x:300,y:400});
 assert.equal(output[3],0,'outer opaque black is made transparent');
 const center=(90*192+90)*4;
 assert.equal(output[center+3],255,'painted building silhouette remains opaque');
 assert.equal(painted.length,5,'cutout is one regular cached image draw');
 b.drawTower(dest,{kind:'barracks',level:2,x:300,y:400});
 assert.equal(allocations,1,'cutout allocated only once per atlas and level');
}
console.log('Barracks building background alpha cutout and caching passed.');
