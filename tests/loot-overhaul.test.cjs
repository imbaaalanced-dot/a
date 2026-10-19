'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const box={};vm.runInNewContext(fs.readFileSync('dist/loot.js','utf8'),box);const L=box.DenkmalLoot;
const mem=()=>{const data=new Map();return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v)}};
const seeded=()=>{let n=739;return ()=>((n=(n*1664525+1013904223)>>>0)/4294967296);};
test('40 distinct bases have different meaningful stat priorities and all slots',()=>{
 assert.equal(L.catalogue?.length,40,'40 actual item bases rather than random suffixes');
 assert.equal(new Set(L.catalogue.map(t=>t.name)).size,40);
 for(const slot of Object.keys(L.slots)){
  const variants=L.catalogue.filter(t=>t.slot===slot);assert.equal(variants.length,5);
  assert.equal(new Set(variants.map(t=>t.stats.slice(0,2).join(','))).size,5,'different two-stat specializations per slot');
 }
 const m=L.create({storage:mem(),rng:seeded()}),seen=new Set();
 for(let level=1;level<=6;level++)for(let n=0;n<1000;n++){
  const item=m.generate(level*4,n%2===0,level),base=L.catalogue.find(t=>t.id===item.baseId);
  assert.ok(base,'generated item comes from catalogue');seen.add(base.id);
  assert.equal(item.name,base.name);assert.equal(item.slot,base.slot);
  assert.deepEqual(Object.keys(item.stats).slice(0,2),Array.from(base.stats.slice(0,2)));
  assert.ok(Object.values(item.stats).every(v=>v>0));assert.ok(m.add(item));m.salvage(item.id);
 }
 assert.equal(seen.size,40,'every base can actually drop');
});
test('Six map-specific items only drop in their home region, with high quality bosses',()=>{
 assert.equal(L.catalogue?.filter(t=>t.region).length,6);
 for(let region=1;region<=6;region++){
  const m=L.create({storage:mem(),rng:seeded()});let local=0;
  for(let n=0;n<500;n++){
   const i=m.generate(20,true,region),base=L.catalogue.find(t=>t.id===i.baseId);
   assert.ok(!base.region||base.region===region);if(base.region)local++;
   assert.ok(['epic','legendary'].includes(i.rarity));
  }
  assert.ok(local>50,'local items are discoverable');
 }
});
test('Old saved equipment and new bases survive export, import, reforge and reload',()=>{
 const storage=mem(),m=L.create({storage,rng:seeded()}),old=m.snapshot();
 const legacy={id:'old-ring',slot:'ring1',rarity:'rare',name:'Siegelring der Erinnerung',level:8,stats:{crit:.04},power:null,favorite:true};
 assert.ok(m.add(legacy));const i=m.generate(12,true,4);assert.ok(m.add(i));
 for(let n=0;n<4;n++){const scrap=m.generate(20,true);m.add(scrap);m.salvage(scrap.id);}
 const stats=Object.keys(i.stats);assert.ok(m.reforge(i.id));assert.equal(m.find(i.id).baseId,i.baseId);
 assert.deepEqual(Object.keys(m.find(i.id).stats),stats);assert.deepEqual(JSON.parse(JSON.stringify(m.snapshot())),JSON.parse(JSON.stringify(old)));
 const restored=L.create({storage});assert.equal(restored.find('old-ring').name,legacy.name);assert.equal(restored.find('old-ring').favorite,true);
 const imported=L.create({storage:mem()});assert.ok(imported.importJSON(restored.exportJSON()));assert.equal(imported.find(i.id).baseId,i.baseId);
 const bad=JSON.parse(imported.exportJSON());bad.profile.bag.find(x=>x.id===i.id).baseId='invalid-base';assert.equal(imported.importJSON(JSON.stringify(bad)),false);
});
