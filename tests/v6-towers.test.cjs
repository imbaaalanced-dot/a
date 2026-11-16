'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync(__dirname+'/../dist/style2-v6-towers.js','utf8');
function setup(search='?td2V6Towers=1'){
  const requested=[],draws=[],ready=new Set(),failed=new Set();
  const old={drawTower:(...a)=>{draws.push(['legacy',...a]);return true;},drawProjectile:()=>true};
  const manager={
    retain:(group,urls)=>{requested.push(urls[0]);return Promise.resolve([])},
    release:()=>{},
    ready:(url)=>ready.has(url)?{naturalWidth:256,url}:null,
    status:(url)=>failed.has(url)?'failed':ready.has(url)?'ready':'loading'
  };
  const g={globalThis:null,location:{search},URLSearchParams,Promise,Object,UserStyle2Towers:old,DenkmalAssets:manager};
  g.globalThis=g;vm.runInNewContext(code,g);
  const ctx={save:()=>{},restore:()=>{},drawImage:(...a)=>draws.push(['v6',...a])};
  return {g,requested,draws,ctx,ready,failed,old};
}
(async()=>{
  const disabled=setup('');
  assert.equal(disabled.g.UserStyle2Towers.drawTower,disabled.old.drawTower);
  assert.equal(disabled.requested.length,0);
  const t=setup(),draw=t.g.UserStyle2Towers.drawTower;
  assert.equal(draw(t.ctx,'bow',300,500,1),true);
  assert.equal(t.requested[0],'assets/style2-v6-candidates/tuerme/upgrade_stufen/bogen_l1.webp');
  assert.equal(t.draws.at(-1)[0],'legacy');
  t.ready.add(t.requested[0]);await Promise.resolve();await Promise.resolve();
  assert.equal(draw(t.ctx,'bow',300,500,1),true);
  assert.equal(t.draws.at(-1)[0],'v6');
  assert.equal(t.draws.at(-1)[2],244);
  assert.equal(t.requested.length,1);
  draw(t.ctx,'boomerang',300,500,1);assert.equal(t.requested.length,1);
  draw(t.ctx,'rift',300,500,9);assert.ok(t.requested.at(-1).endsWith('/riftlanze_l3.webp'));
  const f=setup(),fd=f.g.UserStyle2Towers.drawTower;
  fd(f.ctx,'mage',0,0,1);f.failed.add(f.requested[0]);
  await Promise.resolve();await Promise.resolve();
  fd(f.ctx,'mage',0,0,1);assert.equal(f.g.TD2V6Towers.getDiagnostics().failed,1);
  assert.equal(f.draws.at(-1)[0],'legacy');
  console.log('PASS v6 tower fallback and mapping');
})().catch(e=>{console.error(e);process.exitCode=1});
