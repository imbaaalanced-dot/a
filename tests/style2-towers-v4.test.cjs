'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'../dist');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'assets/style2-user-towers-v4/manifest.json'),'utf8'));
assert.equal(manifest.status,'runtime-integrated-candidate');
assert.deepEqual(manifest.families,['bow','cannon','mage','rift','boomerang']);
assert.deepEqual(manifest.tower_master_px,[512,512]);
assert.deepEqual(manifest.projectile_master_px,[256,256]);
assert.deepEqual(manifest.tower_pivot,[256,488]);
assert.equal(manifest.impact_atlas.columns,6);
assert.equal(manifest.impact_atlas.frames_per_level,6);
assert.deepEqual(manifest.cannon_progression,['wood','iron','explosive']);
assert.equal(manifest.barracks_assets_replaced,false);
assert.equal(manifest.runtime_assets.length,35);
for(const asset of manifest.runtime_assets){
 const full=path.join(root,'assets/style2-user-towers-v4',asset.path);
 const data=fs.readFileSync(full);
 assert(data.length>1000,`${asset.path} should be optimized runtime art`);
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 assert.equal(data.length,asset.bytes);
}
for(const f of ['towers-before-after-64.png','towers-before-after-128.png','towers-64-128-overview.png','projectiles-64px.png','projectiles-128px.png'])
 assert(fs.statSync(path.join(root,'../docs/qa/style2-towers-v4',f)).size>1000,`${f} miniature QA is included`);
const towerSource=fs.readFileSync(path.join(root,'style2-user-towers-v4.js'),'utf8');
assert(towerSource.includes('style2-user-towers-v4/runtime-webp')&&towerSource.includes('v=style2-v4'));
assert.match(towerSource,/Style2ImpactsV4/);
const impactSource=fs.readFileSync(path.join(root,'style2-impact-atlas-v4.js'),'utf8');
assert.match(impactSource,/impact_\$\{kind\}_6x3\.webp/);
assert.match(impactSource,/frame\*128/);
assert(impactSource.includes('(tier-1)*128'));
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const script of ['style2-impact-atlas-v4.js?v=style2-v4a1','style2-user-towers-v4.js?v=style2-v4a1'])
 assert(html.indexOf(script)<html.indexOf('game.js?v='),`${script} must load before game logic`);
const vm=require('node:vm');
{
 const requests=[],ready=new Map();
 const assets={retain(group,urls){requests.push({group,urls});return Promise.resolve([])},ready:url=>ready.get(url)||null};
 const box={DenkmalAssets:assets,URLSearchParams,location:{search:''},Date};box.globalThis=box;
 vm.runInNewContext(towerSource,box);
 const draw={save(){},restore(){},drawImage(...args){this.last=args}};
 assert.equal(box.UserStyle2Towers.drawTower(draw,'cannon',80,120,3),false,'cold V4 sprite keeps existing Canvas fallback');
 assert(requests.some(r=>r.urls[0].includes('style2-user-towers-v4/runtime-webp/towers/tower_cannon_lv3.webp')));
 assert(requests.some(r=>r.urls[0].includes('style2-user-towers-v4/runtime-webp/projectiles/projectile_cannon_lv3.webp')));
 const towerUrl=requests.flatMap(r=>r.urls).find(url=>url.includes('tower_cannon_lv3'));
 ready.set(towerUrl,{naturalWidth:512});
 assert.equal(box.UserStyle2Towers.drawTower(draw,'cannon',80,120,3),true);
 assert.equal(draw.last.at(-2),112,'tower footprint remains the existing 112 px draw size');
}
{
 const requests=[],ready=new Map();
 const box={URLSearchParams,location:{search:''},Date,DenkmalAssets:{retain(group,urls){requests.push({group,urls});return Promise.resolve([])},ready:url=>ready.get(url)||null}};box.globalThis=box;
 vm.runInNewContext(impactSource,box);
 const image={naturalWidth:768,naturalHeight:384};
 for(const [row,family] of ['bow','cannon','mage','rift','boomerang'].entries()){
  const url=`assets/style2-user-towers-v4/runtime-webp/impact_${family}_6x3.webp?v=style2-v4`;
  const p={kind:family,level:row%3+1,x:40,y:60,life:.3,max:.3};
  const ctx={globalAlpha:1,saves:0,restores:0,draws:[],save(){this.saves++},restore(){this.restores++},drawImage(...args){this.draws.push(args)}};
  assert.equal(box.Style2ImpactsV4.draw(ctx,p),false,'cold V4 hit atlas falls back cleanly');
  ready.set(url,image);
  for(let frame=0;frame<6;frame++){
   const c={globalAlpha:1,saves:0,restores:0,draws:[],save(){this.saves++},restore(){this.restores++},drawImage(...args){this.draws.push(args)}};
   assert.equal(box.Style2ImpactsV4.draw(c,{...p,life:.3*(1-(frame+.1)/6)}),true);
   assert.deepEqual(c.draws[0].slice(1,5),[frame*128,(p.level-1)*128,128,128]);
   assert.equal(c.saves,c.restores);
  }
 }
 assert.equal(requests.length,5,'one retained V4 hit atlas per family');
}
console.log('Style-2 tower V4 manifest, 35 WebP assets, atlas rows, miniature sheets, and runtime ordering passed');
