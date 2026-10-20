/* Opt-in Pass 4 impacts: preserve legacy, particle bounds and Android-friendly draw state. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const towerSrc=fs.readFileSync('dist/style2-user-towers.js','utf8');
const fxSrc=fs.readFileSync('dist/combat-fx.js','utf8');
const families=['bow','cannon','mage','rift','boomerang'];
function boot(query){
  const sandbox={URLSearchParams,Math,location:{search:query}};
  sandbox.globalThis=sandbox;
  vm.runInNewContext(towerSrc,sandbox,{filename:'style2-user-towers.js'});
  vm.runInNewContext(fxSrc,sandbox,{filename:'combat-fx.js'});
  return sandbox;
}
function ctx(breakArc=false){
  const calls={save:0,restore:0,arcs:0,strokes:0};
  return {calls,globalAlpha:1,save(){calls.save++;},restore(){calls.restore++;},
    translate(){},beginPath(){},moveTo(){},lineTo(){},fill(){},
    arc(){calls.arcs++;if(breakArc)throw Error('Canvas failure');},
    stroke(){calls.strokes++;}};
}
for(const enabled of [false,true]){
  const s=boot(enabled?'?td2UserTowers=1':'');
  const api=s.UserStyle2Towers,fx=s.DenkmalCombatFX;
  assert.equal(api.enabled,enabled);
  for(const kind of families)for(const tier of [1,2,3])for(const reduced of [false,true]){
    const g={particles:[]};
    const bullet={x:70,y:80,vx:120,vy:0,color:'#cda782',kind,level:tier};
    fx.burst(g,bullet,true,false,reduced);
    const impacts=g.particles.filter(p=>p.userStyle2Impact);
    assert.equal(impacts.length,enabled?1:0,'one optional impact per hit');
    assert.ok(g.particles.every(p=>p.life>0&&p.max===p.life),'particle life contract');
    if(!enabled)continue;
    const p=impacts[0],canvas=ctx();
    assert.equal(p.kind,kind);
    assert.equal(p.level,tier);
    assert.equal(p.reduced,reduced);
    assert.equal(api.drawImpact(canvas,p),true,kind+' L'+tier+' draws');
    assert.equal(canvas.calls.save,canvas.calls.restore,'balanced draw state');
    assert.ok(canvas.calls.arcs>0,'visible arc primitive');
    assert.equal(fx.drawParticle(ctx(),p),true,'combat fx accepts optional effect');
    const midway={...p,life:p.life/2},mid=ctx();
    assert.equal(api.drawImpact(mid,midway),true,'mid-animation frame draws');
    const broken=ctx(true);
    assert.equal(api.drawImpact(broken,p),false,'GPU draw errors use fallback');
    assert.equal(broken.calls.save,broken.calls.restore,'restore after failure');
  }
  const g={particles:[]};
  for(let i=0;i<200;i++)fx.burst(g,{x:0,y:0,vx:0,vy:1,kind:'rift',level:3,color:'#a879d8'},true,false,false);
  assert.equal(g.particles.length,fx.MAX_PARTICLES,'no new particle overflow');
  assert.equal(api.drawImpact(ctx(),{kind:'rift',max:0,life:0}),false,'invalid lifecycle rejected');
}
console.log('Style-2 Pass 4 impacts: PASS (5 families x 3 tiers x normal/reduced; legacy and cap)');
