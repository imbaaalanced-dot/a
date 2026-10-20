/* Regression checks for the opt-in Style-2 image adapter. Run: node tests/style2-adapter-regression.cjs */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('dist/style2-user-towers.js','utf8');
function boot(search){
  const pending=[];
  class FakeImage {
    constructor(){this.naturalWidth=0;pending.push(this);}
    set src(v){this.url=v;}
    decode(){return Promise.resolve();}
    succeed(){this.naturalWidth=256;this.onload?.();}
    fail(){this.onerror?.();}
  }
  const sandbox={URLSearchParams,Image:FakeImage,Date,location:{search},globalThis:null};
  sandbox.globalThis=sandbox;
  vm.runInNewContext(source,sandbox,{filename:'style2-user-towers.js'});
  return {adapter:sandbox.UserStyle2Towers,pending};
}
function canvas(throwOnDraw=false){
  const calls={save:0,restore:0,draw:0};
  return {calls,save(){calls.save++;},restore(){calls.restore++;},
    translate(){},rotate(){},drawImage(){calls.draw++;if(throwOnDraw)throw Error('GPU draw failed');}};
}
(async()=>{
  const off=boot('');
  assert.equal(off.adapter.enabled,false);
  assert.equal(off.adapter.drawTower(canvas(),'bow',0,0,1),false);
  assert.equal(off.pending.length,0,'opt-out must not load sprites');

  const {adapter,pending}=boot('?td2UserTowers=1&td2Style2Debug=1');
  const first=canvas();
  assert.equal(adapter.drawTower(first,'bow',0,0,1),false,'cold start uses legacy renderer');
  assert.equal(pending.length,2,'tower warms its projectile');
  pending.forEach(img=>img.succeed());
  await Promise.resolve();
  await Promise.resolve();
  const ready=canvas();
  assert.equal(adapter.drawTower(ready,'bow',0,0,1),true);
  assert.equal(ready.calls.draw,1);
  assert.equal(ready.calls.save,ready.calls.restore);
  const broken=canvas(true);
  assert.equal(adapter.drawTower(broken,'bow',0,0,1),false,'draw exception falls back');
  assert.equal(broken.calls.save,broken.calls.restore,'canvas state must balance');
  assert.equal(adapter.getDiagnostics().drawErrors,1);

  const projectile=canvas();
  assert.equal(adapter.drawProjectile(projectile,{kind:'bow',level:1,x:1,y:2,vx:0,vy:1}),true);
  assert.equal(projectile.calls.save,projectile.calls.restore);
  const failed=boot('?td2UserTowers=1&td2Style2Debug=1');
  assert.equal(failed.adapter.drawTower(canvas(),'rift',0,0,1),false);
  failed.pending[0].fail();
  assert.equal(failed.adapter.drawTower(canvas(),'rift',0,0,1),false);
  assert.ok(failed.adapter.getDiagnostics().fallbackFailed>=1);
  console.log('Style-2 adapter regression: PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});
