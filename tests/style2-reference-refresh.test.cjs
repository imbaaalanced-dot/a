'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

const root=path.join(__dirname,'../dist/assets');
const projectiles=JSON.parse(fs.readFileSync(path.join(root,'style2-reference-projectiles-v1/manifest.json'),'utf8'));
const expected=['bow:1','bow:2','bow:3','cannon:1','cannon:2','cannon:3',
  'mage:1','mage:2','rift:1','boomerang:1','boomerang:2','boomerang:3'];
assert.deepEqual(projectiles.assets.map(a=>`${a.kind}:${a.level}`).sort(),expected.sort());
for(const a of projectiles.assets){
  assert.deepEqual(a.canvas,[256,256]);
  assert.deepEqual(a.pivot,[128,128]);
  assert(fs.statSync(path.join(root,'style2-reference-projectiles-v1',a.master)).size>100);
  assert(fs.statSync(path.join(root,'style2-reference-projectiles-v1',a.runtime)).size>100);
  assert.equal(a.alpha_border_max,0,`${a.kind} Lv${a.level} may not clip at image border`);
}

const source=fs.readFileSync(path.join(__dirname,'../dist/style2-user-towers.js'),'utf8');
function init(search){
  const seen=[],ready=new Map();
  const assets={retain(group,urls){seen.push(...urls);return Promise.resolve([])},ready:url=>ready.get(url)||null};
  const box={DenkmalAssets:assets,location:{search},URLSearchParams,Date};box.globalThis=box;
  vm.runInNewContext(source,box);
  return {api:box.UserStyle2Towers,seen,ready};
}
const projectile={kind:'bow',level:1,x:5,y:8,vx:1,vy:0};
const plain=init('?td2UserTowers=1');
assert.equal(plain.api.drawProjectile({save(){},restore(){},translate(){},rotate(){},drawImage(){}},projectile),false);
assert(plain.seen[0].includes('style2-user-towers-v1'),'legacy remains default');
const refreshed=init('?td2UserTowers=1&td2ProjectileRefresh=1');
const c={rotations:[],saves:0,restores:0,save(){this.saves++},restore(){this.restores++},translate(){},rotate(n){this.rotations.push(n)},drawImage(){}};
assert.equal(refreshed.api.drawProjectile(c,projectile),false,'cold refreshed sprite must fall back');
assert(refreshed.seen[0].includes('style2-reference-projectiles-v1'),'opt-in uses new artwork');
refreshed.ready.set(refreshed.seen[0],{naturalWidth:256});
assert.equal(refreshed.api.drawProjectile(c,projectile),true);
assert.equal(c.saves,c.restores);
assert(Math.abs(c.rotations[0])<1,'source arrow is roughly horizontal, not 30° down');
refreshed.api.drawProjectile(c,{kind:'rift',level:3,x:5,y:8,vx:1,vy:0});
assert(refreshed.seen.some(url=>url.includes('style2-user-towers-v1/runtime-webp/projectiles/projectile_rift_lv3')),
  'tower-shaped rift concept must not become a projectile');

const impacts=JSON.parse(fs.readFileSync(path.join(root,'style2-reference-impacts-v1/manifest.json'),'utf8'));
assert.deepEqual(impacts.rows,['mage','boomerang']);
assert.equal(impacts.frames.length,12);
assert.equal(impacts.runtime_cell[0],128);
assert(fs.statSync(path.join(root,'style2-reference-impacts-v1/runtime.webp')).size>100);
const impactSource=fs.readFileSync(path.join(__dirname,'../dist/style2-impact-atlas.js'),'utf8');
const requests=[],ready=new Map(),box={URLSearchParams,location:{search:'?td2ImpactRefresh=1'},Date,
  DenkmalAssets:{retain(_group,urls){requests.push(...urls);return Promise.resolve([])},ready:url=>ready.get(url)||null}};
box.globalThis=box;vm.runInNewContext(impactSource,box);
const p={kind:'mage',level:2,x:20,y:40,life:.25,max:.3};
const impactCtx={saves:0,restores:0,draws:[],globalAlpha:1,save(){this.saves++},restore(){this.restores++},drawImage(...args){this.draws.push(args)}};
assert.equal(box.Style2ImpactsV2.draw(impactCtx,p),false);
assert(requests.some(url=>url.includes('style2-reference-impacts-v1/runtime.webp')));
ready.set(requests[0],{naturalWidth:768,naturalHeight:256});
assert.equal(box.Style2ImpactsV2.draw(impactCtx,p),true);
assert.equal(impactCtx.saves,impactCtx.restores);
assert.equal(box.Style2ImpactsV2.draw(impactCtx,{...p,reduced:true}),false,'low graphics mode keeps light fallback');
console.log('Style-2 reference refresh: 12 curated projectiles, 12 impact frames, cold fallback and opt-in paths passed');
