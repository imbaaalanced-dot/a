'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const file=path.join(__dirname,'../dist/equipment-catalog.js');
assert.ok(fs.existsSync(file),'Boss catalog must exist');
const box={};vm.createContext(box);vm.runInContext(fs.readFileSync(file,'utf8'),box);const C=box.DenkmalEquipmentCatalog;
const json=x=>JSON.parse(JSON.stringify(x));
const context={mapId:1,wave:5,bossType:'boss'},sequence=values=>()=>values.shift();
assert.equal(Object.keys(C.templates).length,21);
assert.deepEqual(Object.keys(C.bossPools).sort(),['1','3','4','5','6']);
assert.equal(new Set(Object.values(C.templates).map(t=>t.power).filter(Boolean)).size,14);
const first=C.rollBoss(context,sequence([0,0,0,0,0]));
assert.deepEqual(json(first),{templateId:'ember-staff',slot:'weapon',name:'Abendrot',rarity:'epic',level:5,power:'ember',stats:{damage:10,health:26},baseStats:{damage:10,health:26},upgradeRank:0,source:{mapId:1,wave:5,bossType:'boss'},favorite:false});
assert.equal(C.rollBoss(context,sequence([.6,0,.8,0,0])).rarity,'legendary');
for(const bad of [{...context,mapId:2},{...context,bossType:'wraith'},{...context,wave:Infinity},{...context,wave:-1},{...context,bossType:'uprooted'}])assert.equal(C.rollBoss(bad,()=>0),null);
for(const value of [NaN,Infinity,-.1,1])assert.equal(C.rollBoss(context,()=>value),null);
assert.equal(C.rollBoss({...context,wave:999},()=>.999).level,30);
let state=123456,signature=0,legendary=0;const seen=new Set(),rng=()=>((state=(Math.imul(state,1664525)+1013904223)>>>0)/4294967296);
for(let n=0;n<100000;n++){const i=C.rollBoss(context,rng);seen.add(i.templateId);if(C.bossPools[1].includes(i.templateId))signature++;if(i.rarity==='legendary')legendary++;assert.equal(Object.keys(i.stats).length,2);for(const [k,v]of Object.entries(i.stats))assert.ok(Number.isFinite(v)&&v<=C.caps[k]);}
assert.equal(seen.size,21);assert.ok(Math.abs(signature/100000-(.6+.4*4/21))<.01);assert.ok(Math.abs(legendary/100000-.2)<.01);
let item={stats:{damage:20,haste:.1},baseStats:{damage:20,haste:.1},upgradeRank:0};
for(const [rank,cost,damage,haste]of [[1,50,21,.105],[2,100,22,.11],[3,150,23,.115]]){const p=C.previewUpgrade(item);assert.equal(p.allowed,true);assert.equal(p.cost,cost);assert.equal(p.nextRank,rank);assert.deepEqual(json(p.stats),{damage,haste});item={...item,stats:p.stats,upgradeRank:rank};}
assert.equal(C.previewUpgrade(item).allowed,false);
assert.equal(C.previewUpgrade({stats:{damage:40},baseStats:{damage:40},upgradeRank:0}).allowed,false);
assert.equal(C.previewUpgrade({stats:{},baseStats:{},upgradeRank:0}).allowed,false);
const fractional=C.previewUpgrade({stats:{damage:1.4},baseStats:{damage:1.4},upgradeRank:0});assert.ok(fractional.stats.damage>=1.4);
console.log('Catalog: all 21 types, exact rolls, limits, seeded distribution and upgrade previews passed');
