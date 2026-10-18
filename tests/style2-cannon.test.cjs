/* Style 2 cannon: tower tiers, cached projectiles and level-specific impact frames. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../dist');
let allocations=0,images=0;
const drawn=[];
function context(){
  const state={globalAlpha:1};
  return new Proxy(Object.assign(state,{
    drawImage(img,...args){images++;drawn.push({img,args});},
    createRadialGradient(){return {addColorStop(){}};},
    createLinearGradient(){return {addColorStop(){}};}
  }),{
    get:(obj,k)=>k in obj?obj[k]:()=>{},
    set:(obj,k,v)=>(obj[k]=v,true)
  });
}
const offscreen=context(),ctx=context();
const sandbox={Math,console,document:{
  createElement(tag){
    assert.equal(tag,'canvas','only offscreen textures may be created');
    allocations++;
    return {width:0,height:0,getContext:()=>offscreen};
  }
}};
vm.createContext(sandbox);
const source=fs.readFileSync(path.join(root,'style2-cannon.js'),'utf8');
vm.runInContext(source,sandbox,{filename:'style2-cannon.js'});
const art=sandbox.Style2Cannon;
assert.ok(art,'Style2Cannon must register');
assert.equal(allocations,0,'sprites are lazy, not created at module load');
const distinctTowerArt=new Set(),distinctShellArt=new Set();
for(let level=1;level<=3;level++){
  assert.equal(art.drawTower(ctx,400,400,level),true);
  distinctTowerArt.add(drawn.at(-1).img);
  assert.equal(art.drawProjectile(ctx,{kind:'cannon',level,x:410,y:420,vx:430,vy:0},false),true);
  distinctShellArt.add(drawn.at(-1).img);
}
assert.equal(distinctTowerArt.size,3,'three distinct cannon tower levels');
assert.equal(distinctShellArt.size,3,'wood, iron and incendiary ammunition use different sprites');
assert.equal(allocations,6,'three tower sprites and three projectile sprites are cached');
assert.equal(art.drawProjectile(ctx,{kind:'mage',level:3},false),false,'module does not alter other towers');
const impactTextures=new Set();
for(let level=1;level<=3;level++){
  for(let frame=0;frame<6;frame++){
    const life=1-(frame+.1)/6;
    assert.equal(art.drawImpact(ctx,{cannonImpact:true,level,x:410,y:420,life,max:1}),true);
    impactTextures.add(drawn.at(-1).img);
  }
}
assert.equal(impactTextures.size,18,'three distinct six-frame impact animations');
assert.equal(art.cacheCounts().impactFrames,18);
const warm=allocations,draws=images;
for(let i=0;i<15;i++){
  art.drawTower(ctx,400,400,i%3+1,true);
  art.drawProjectile(ctx,{kind:'cannon',level:i%3+1,x:400,y:400,vx:1,vy:1},true);
  art.drawImpact(ctx,{cannonImpact:true,level:i%3+1,x:400,y:400,life:.1,max:.3});
}
assert.equal(allocations,warm,'hot draw path creates no new canvas objects');
assert.equal(images-draws,45,'all cached frames still draw');
vm.runInContext(fs.readFileSync(path.join(root,'combat-fx.js'),'utf8'),sandbox,{filename:'combat-fx.js'});
const fx=sandbox.DenkmalCombatFX,game={particles:[]};
for(let level=1;level<=3;level++){
  const before=game.particles.length;
  fx.burst(game,{kind:'cannon',level,x:101,y:102,vx:400,vy:50,color:'#d7a16c'},true,false,false);
  const newParticles=game.particles.slice(before);
  const impacts=newParticles.filter(p=>p.cannonImpact);
  assert.equal(impacts.length,1,'exactly one Level '+level+' specialty impact');
  assert.equal(impacts[0].level,level,'impacts respect the fired cannon tier');
  assert.ok(impacts[0].life===impacts[0].max,'all impacts start fully alive');
  assert.equal(fx.drawParticle(ctx,impacts[0]),true,'tier impact is recognized');
  assert.equal(fx.draw(ctx,{kind:'cannon',level,x:400,y:400,vx:1,vy:2,color:'#d7a16c',life:1},false),undefined);
}
for(let i=0;i<1000;i++)fx.burst(game,{kind:'cannon',level:3,x:0,y:0,vx:1,vy:0,color:'#ffb060'},true,false,true);
assert.ok(game.particles.length<=fx.MAX_PARTICLES,'cannon impacts respect the global particle budget');
assert.ok(game.particles.every(p=>Number.isFinite(p.life)&&p.life===p.max),'particle lifecycle invariant stays intact');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert.match(html,/style2-cannon\.js\?v=alpha8cannon2/);
assert.match(html,/combat-fx\.js\?v=v400a6s2t4/);
const gameplay=fs.readFileSync(path.join(root,'game.js'),'utf8');
assert.match(gameplay,/Style2Cannon\?\.drawTower/,'cannon graphics must be used by gameplay');
assert.match(gameplay,/location\?\.pathname\?\.includes\('\/v4-style2-cannon\/'\)/,'dedicated test preview must work');
assert.match(gameplay,/cannon:\{name:'KANONENTURM',cost:35,damage:34,rate:1\.15,range:275/,'cannon base balance remains unchanged');
console.log('Style 2 cannon: three towers, three shells, 18 cached impact frames, capped FX and unchanged stats passed.');
