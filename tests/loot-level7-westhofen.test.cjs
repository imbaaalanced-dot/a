'use strict';
/* Level 2 (Labyrinth) and Level 7 (Westhofen) shipped without boss rewards and
   Westhofen enemies dropped nothing at all. This locks the closed gaps:
   both boss pools exist, both boss kills claim, Westhofen enemy drops work and
   the results survive a reload, while out-of-range maps stay rejected. */
const assert=require('node:assert/strict'),{load,memory,json}=require('./helpers/equipment.cjs');
const {DenkmalLoot:L,DenkmalEquipmentCatalog:C}=load();

assert.deepEqual(Object.keys(C.bossPools).map(Number).sort(),[1,2,3,4,5,6,7,8],'every campaign map has a boss pool');
for(const pool of Object.values(C.bossPools)){assert.equal(pool.length,4,'authored pools keep four slots');for(const id of pool)assert.ok(C.templates[id],'pool templates exist: '+id);}
assert.ok(C.bossPools[7].includes('sight-ring'),'Westhofen finale carries the previously unpooled sight-ring');
assert.ok(C.bossPools[8].includes('bell-amulet'),'Heven (Witten) boss pool carries the bell-amulet');

// Westhofen enemy drops: level mirrors the wave, sources stay attributable.
const m=L.create({storage:memory(),rng:()=>0});
assert.equal(m.claimEnemy({mapId:7,wave:25,enemyType:'shadowwing',runId:'west',spawnId:'1'}).state,'granted');
const first=m.find('enemy-west-1');
assert.equal(first.source.kind,'enemy');assert.equal(first.source.mapId,7);assert.equal(first.level,25);
for(const type of ['gargoyle','stormwing'])assert.equal(m.claimEnemy({mapId:7,wave:42,enemyType:type,runId:'west',spawnId:type}).state,'granted',type+' drops on Westhofen');
assert.equal(m.claimEnemy({mapId:8,wave:29,enemyType:'shadowwing',runId:'heven',spawnId:'x'}).state,'granted','Heven enemy drops work');
assert.equal(m.claimEnemy({mapId:9,wave:25,enemyType:'shadowwing',runId:'west',spawnId:'x'}).state,'rejected');
assert.equal(m.claimEnemy({mapId:7,wave:0,enemyType:'shadowwing',runId:'west',spawnId:'y'}).state,'rejected');

// Pity keeps working on Westhofen kills.
const dry=L.create({storage:memory(),rng:()=>.99});
for(let n=1;n<40;n++)assert.equal(dry.claimEnemy({mapId:7,wave:25,enemyType:'gargoyle',runId:'pity',spawnId:String(n)}).state,'none');
assert.equal(dry.claimEnemy({mapId:7,wave:25,enemyType:'gargoyle',runId:'pity',spawnId:'40'}).state,'granted');

// Boss claims: Labyrinth wave 5 and both Westhofen campaign bosses (34/44) claim; duplicates stay idempotent.
const l2=L.create({storage:memory(),rng:()=>0});
const two=l2.claimBoss({mapId:2,wave:5,bossType:'boss',runId:'labyrinth',spawnId:'1'});
assert.equal(two.state,'granted');assert.ok(C.bossPools[2].includes(two.item.templateId),'Labyrinth pick stays pool-bound');
assert.ok(['epic','legendary'].includes(two.item.rarity));assert.equal(two.item.source.mapId,2);

const b7=L.create({storage:memory(),rng:()=>0});
const west=b7.claimBoss({mapId:7,wave:34,bossType:'boss',runId:'westhofen',spawnId:'1'});
assert.equal(west.state,'granted');assert.ok(C.bossPools[7].includes(west.item.templateId),'Westhofen pick stays pool-bound');
assert.equal(west.item.level,30,'wave 34+ caps at item level 30');
assert.equal(b7.claimBoss({mapId:7,wave:34,bossType:'boss',runId:'westhofen',spawnId:'1'}).state,'duplicate');
assert.equal(b7.claimBoss({mapId:7,wave:34,bossType:'uprooted',runId:'westhofen',spawnId:'2'}).state,'rejected','uprooted only exists on Kirchende');
const b8=L.create({storage:memory(),rng:()=>0});
const heven=b8.claimBoss({mapId:8,wave:32,bossType:'boss',runId:'heven',spawnId:'1'});
assert.equal(heven.state,'granted');assert.ok(C.bossPools[8].includes(heven.item.templateId),'Heven boss pick stays pool-bound');
assert.equal(b7.claimBoss({mapId:9,wave:34,bossType:'boss',runId:'westhofen',spawnId:'3'}).state,'rejected');

// Reload round trip: the new sources persist and revalidate.
const reload=L.create({storage:memory({[L.KEY]:b7.exportJSON()}),rng:()=>0});
assert.ok(reload.find(west.item.id),'Westhofen boss item survives reload');
assert.deepEqual(json(reload.find(west.item.id).stats),json(west.item.stats));
const again=L.create({storage:memory({[L.KEY]:l2.exportJSON()}),rng:()=>0});
assert.equal(again.claimBoss({mapId:2,wave:5,bossType:'boss',runId:'labyrinth',spawnId:'1'}).state,'duplicate');

console.log('Loot level 2/7: boss pools, Westhofen enemy drops, pity, idempotence and reload passed');
