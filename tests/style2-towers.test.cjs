/* Style 2 bow/mage/rift renderer contract and FX integration. */
'use strict';
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs'),path=require('node:path');
const root=path.join(__dirname,'../dist');
let canvases=0,draws=0;
const records=[];
function context(){
  return new Proxy({
    globalAlpha:1,
    createRadialGradient(){return {addColorStop(){}};},
    createLinearGradient(){return {addColorStop(){}};},
    drawImage(img,...args){records.push({img,args});draws++;}
  },{get:(obj,key)=>key in obj?obj[key]:()=>{},set:(obj,key,v)=>(obj[key]=v,true)});
}
const main=context(),offscreen=context();
const sandbox={Math,console,document:{createElement(tag){assert.equal(tag,'canvas');canvases++;return {width:0,height:0,getContext:()=>offscreen};}}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'style2-towers.js'),'utf8'),sandbox,{filename:'style2-towers.js'});
const art=sandbox.Style2Towers;
assert.ok(art,'style2 bow/mage/rift module registers');
assert.equal(canvases,0,'no eager canvas allocations');
const kinds=['bow','mage','rift'],towers=new Set(),projectiles=new Set();
for(const kind of kinds){
  for(let level=1;level<=3;level++){
    assert.equal(art.drawTower(main,kind,120,140,level,false),true);
    towers.add(records.at(-1).img);
    assert.equal(art.drawProjectile(main,{kind,level,x:120,y:140,vx:300,vy:25},true),true);
    projectiles.add(records.at(-1).img);
  }
}
assert.equal(towers.size,9,'nine unique tier silhouettes');
assert.equal(projectiles.size,9,'nine unique projectile textures');
assert.equal(canvases,18,'tower and projectile sprites cached only once');
assert.equal(art.drawTower(main,'cannon',100,100,1),false,'cannon renderer remains separate');
assert.equal(art.drawProjectile(main,{kind:'boomerang',x:20,y:30}),false,'boomerang renderer remains separate');
const frames=new Set();
for(const kind of kinds)for(let level=1;level<=3;level++)for(let frame=0;frame<5;frame++){
  const p={style2Impact:true,kind,level,x:40,y:60,max:1,life:1-(frame+.1)/5};
  assert.equal(art.drawImpact(main,p),true);frames.add(records.at(-1).img);
}
assert.equal(frames.size,45,'five cached impact frames for each of nine tower tiers');
assert.equal(canvases,63,'expected upper bound for a fully warmed visual atlas');
const warm=canvases;
for(let i=0;i<70;i++){
  const kind=kinds[i%3],level=i%3+1;
  art.drawTower(main,kind,120,130,level,true);
  art.drawProjectile(main,{kind,level,x:1,y:1,vx:1,vy:0},false);
  art.drawImpact(main,{style2Impact:true,kind,level,x:1,y:1,life:.1,max:1});
}
assert.equal(canvases,warm,'no canvas allocations on warmed repeated renders');
vm.runInContext(fs.readFileSync(path.join(root,'combat-fx.js'),'utf8'),sandbox,{filename:'combat-fx.js'});
const fx=sandbox.DenkmalCombatFX,game={particles:[]};
for(const kind of kinds)for(let level=1;level<=3;level++){
  const before=game.particles.length;
  fx.burst(game,{kind,level,x:20,y:30,vx:400,vy:5,color:'#cba9e9'},true,false,false);
  const particles=game.particles.slice(before);
  assert.equal(particles.filter(p=>p.style2Impact).length,1,kind+level+' impact exactly once');
  const p=particles.find(p=>p.style2Impact);
  assert.equal(p.level,level,'impact retains upgrade level');
  assert.equal(p.life,p.max,'particle lifetime initialized');
  assert.equal(fx.drawParticle(main,p),true);
  assert.equal(fx.draw(main,{kind,level,x:20,y:30,vx:400,vy:0,color:'#fff',life:.7},false),undefined);
}
for(let i=0;i<500;i++)fx.burst(game,{kind:'rift',level:3,x:20,y:30,vx:10,vy:10,color:'#f0f'},true,false,true);
assert.ok(game.particles.length<=fx.MAX_PARTICLES,'existing particle budget applies to new FX');
assert.ok(game.particles.every(p=>p.max===p.life),'all burst particles begin with valid lifetimes');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(html,/style2-towers\.js\?v=v400a6s2t4/);
assert.ok(html.indexOf('style2-towers.js')<html.indexOf('game.js?v='),
  'tower renderer loaded before main game');
assert.match(html,/combat-fx\.js\?v=v400a6s2t4/);
const gameCode=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert.match(gameCode,/Style2Towers\?\.drawTower/,'tower game renderer integrated');
assert.match(gameCode,/location\?\.pathname\?\.includes\('\/v4-style2-towers\/'\)/,'test-only campaign preview path');
for(const kind of kinds)assert.match(gameCode,new RegExp(kind+":\\{name:"),'existing tower balance still defined');
console.log('Style 2 towers: 9 silhouettes, 9 projectiles, 45 impacts, hot-cache rendering, capped FX passed.');
