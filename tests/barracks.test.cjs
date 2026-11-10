'use strict';
const {readFileSync}=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const s={};s.globalThis=s;vm.runInNewContext(readFileSync(require('node:path').join(__dirname,'../dist/barracks.js'),'utf8'),s);
const b=s.DenkmalBarracks,paths=[[{x:0,y:0},{x:200,y:0}]];
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
