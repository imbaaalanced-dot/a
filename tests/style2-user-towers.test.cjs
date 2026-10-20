/* Preview-only user tower sprites: cold image fallback and balanced Canvas state. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/style2-user-towers.js'),'utf8');
const ctx=()=>({ops:[], save(){this.ops.push('save')},restore(){this.ops.push('restore')},drawImage(...a){this.ops.push(['drawImage',a])},translate(...a){this.ops.push(['translate',a])},rotate(...a){this.ops.push(['rotate',a])}});
const run=search=>{
  const ready=new Map(),seen=new Set();
  const assets={retain(group,urls){assert.equal(group,'td2-user-towers');urls.forEach(u=>seen.add(u));return Promise.resolve([])},ready(url){return ready.get(url)||null}};
  const sandbox={URLSearchParams,location:{search},DenkmalAssets:assets,console};sandbox.globalThis=sandbox;
  vm.runInNewContext(source,sandbox);
  return {api:sandbox.UserStyle2Towers,ready,seen};
};
{
  const {api,seen}=run('');
  assert.equal(api.enabled,false);
  assert.equal(api.drawTower(ctx(),'bow',2,3,1),false);
  assert.equal(seen.size,0,'disabled mode must not request any WebP file');
}
{
  const {api,ready,seen}=run('?td2UserTowers=1');
  const c=ctx();
  assert.equal(api.drawTower(c,'cannon',120,250,2),false,'cold image must fall back');
  assert.equal(seen.size,1);
  assert.equal(c.ops.length,0,'cold draw must not touch Canvas');
  const url='assets/style2-user-towers-v1/runtime-webp/towers/tower_cannon_lv2.webp?v=user-towers-1';
  ready.set(url,{width:512});
  assert.equal(api.drawTower(c,'cannon',120,250,2),true);
  assert.equal(c.ops.filter(x=>x==='save').length,1);
  assert.equal(c.ops.filter(x=>x==='restore').length,1);
  assert.equal(c.ops[1][0],'drawImage');
  const c2=ctx();
  assert.equal(api.drawProjectile(c2,{kind:'boomerang',level:3,x:12,y:34,vx:1,vy:0},.1),false);
  ready.set('assets/style2-user-towers-v1/runtime-webp/projectiles/projectile_boomerang_lv3.webp?v=user-towers-1',{width:256});
  assert.equal(api.drawProjectile(c2,{kind:'boomerang',level:3,x:12,y:34,vx:1,vy:0},.1),true);
  assert.equal(c2.ops.filter(x=>x==='save').length,1);
  assert.equal(c2.ops.filter(x=>x==='restore').length,1);
  assert.equal(api.drawTower(c2,'ballista',0,0,1),false,'unapproved tower types remain on legacy path');
}
console.log('Style-2 user tower preview adapter: 2 test scenarios passed');
