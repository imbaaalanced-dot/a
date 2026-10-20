/* Regression for bounded Style-2 loads when the real game supplies DenkmalAssets. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('dist/style2-user-towers.js','utf8');
const images=new Map(),pending=new Map(),groups=new Map(),allUrls=new Set();
let peak=0,releases=0;
const assets={
  retain(group,urls){
    assert.equal(urls.length,1,'each image needs a separately releasable group');
    assert.ok(group.startsWith('td2-user-tower:'));
    const url=urls[0];allUrls.add(url);groups.set(group,url);
    return new Promise(resolve=>{
      pending.set(url,()=>{images.set(url,{naturalWidth:512});pending.delete(url);resolve([images.get(url)]);});
      peak=Math.max(peak,pending.size);
    });
  },
  ready(url){return images.get(url)||null;},
  status(url){return pending.has(url)?'loading':images.has(url)?'ready':'unrequested';},
  release(group){releases++;const url=groups.get(group);groups.delete(group);images.delete(url);}
};
const sandbox={URLSearchParams,location:{search:'?td2UserTowers=1&td2Style2Debug=1'},DenkmalAssets:assets};
sandbox.globalThis=sandbox;
vm.runInNewContext(source,sandbox);
const api=sandbox.UserStyle2Towers;
const ctx={save(){},restore(){},drawImage(){},translate(){},rotate(){}};
const variants=['bow','cannon','mage','rift','boomerang'].flatMap(kind=>[1,2,3].map(tier=>[kind,tier]));
const draw=([kind,tier])=>api.drawTower(ctx,kind,0,0,tier);
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  variants.forEach(draw);
  assert.equal(pending.size,4,'central manager must not start 30 parallel decodes');
  for(let frame=0;frame<20;frame++)variants.forEach(draw);
  assert.equal(allUrls.size,4,'pending assets must not be restarted');
  for(const finish of [...pending.values()])finish();
  await tick();
  for(const variant of variants){
    draw(variant);
    for(const finish of [...pending.values()])finish();
    await tick();
    assert.equal(draw(variant),true,'requested tower must eventually draw');
    assert.ok(api.getDiagnostics().requested<=12,'managed cache remains bounded');
    assert.ok(api.getDiagnostics().managerPending<=4,'concurrent loads remain bounded');
  }
  assert.equal(allUrls.size,30,'all tower and projectile variants eventually load');
  assert.equal(peak,4,'peak decode concurrency must be four');
  assert.ok(releases>=18,'LRU eviction must release previous asset-manager groups');
  console.log('Style-2 managed cache: PASS (30 variants; peak four; retained at most twelve)');
})().catch(e=>{console.error(e);process.exitCode=1;});
