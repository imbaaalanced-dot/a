'use strict';
const assert=require('node:assert/strict'),{load,memory,json,fixture}=require('./helpers/equipment.cjs');
const {DenkmalLoot:L}=load(),PRE='denkmal-loot-v1-pre-v3';
for(const version of [1,2]){
 const original=fixture(version),old=JSON.parse(original).profile,s=memory({[L.KEY]:original}),m=L.create({storage:s});
 assert.equal(m.profile.version,4,'old profiles migrate to v4');assert.equal(m.profile.owned.length,43);
 assert.deepEqual(json(m.profile.loadouts.marcel),old.equipped);assert.deepEqual(json(m.profile.loadouts.kim),old.equipped);
 for(const i of [...old.items,...old.bag,...old.overflow]){const got=json(m.find(i.id));for(const k of Object.keys(i))assert.deepEqual(got[k],i[k]);assert.deepEqual(got.baseStats,i.stats);assert.equal(got.upgradeRank,0);}
 assert.equal(m.profile.essence,777);assert.equal(m.profile.level3,version===2);assert.equal(m.view('kim').bag.length,30);assert.equal(m.view('kim').overflow.length,5);
 assert.equal(m.save(),true);assert.equal(s.getItem(PRE),original);const once=m.exportJSON();assert.equal(L.create({storage:s}).exportJSON(),once);
 const other=L.create({storage:memory()});assert.equal(other.importJSON(original),true);assert.equal(other.profile.owned.length,43);
}
const fresh=L.create({storage:memory()});assert.equal(fresh.profile.owned.length,3);fresh.save();assert.equal(L.create({storage:fresh.storage}).profile.owned.length,3);
assert.equal(fresh.snapshot('unknown'),null);assert.equal(fresh.view('unknown'),null);
const original=fixture(2);
for(const failure of [PRE,L.BACKUP,L.KEY]){
 const s=memory({[L.KEY]:original}),set=s.setItem;s.setItem=(k,v)=>{if(k===failure)throw Error('quota');set(k,v);};
 const m=L.create({storage:s});assert.equal(m.save(),false);assert.equal(s.getItem(L.KEY),original);assert.match(m.status,/Sitzung/);
}
const corrupt=memory({[L.KEY]:original,[PRE]:'broken'}),blocked=L.create({storage:corrupt});assert.equal(blocked.save(),false);assert.equal(corrupt.getItem(PRE),'broken');assert.equal(corrupt.getItem(L.KEY),original);assert.equal(blocked.exportPreMigration(),'broken');
assert.equal(blocked.recoveryAvailable,true);assert.equal(blocked.exportRecovery(),original);assert.match(blocked.status,/beide Rohsicherungen/);
const validBackup=memory({[L.KEY]:original,[PRE]:fixture(1)}),keep=L.create({storage:validBackup});assert.equal(keep.save(),true);assert.equal(validBackup.getItem(PRE),fixture(1));
for(const mutate of [p=>p.owned.push(p.owned[0]),p=>p.loadouts.kim.weapon='missing',p=>p.owned[0].stats.damage=999,p=>p.owned[0].upgradeRank=8,p=>p.owned[0].baseStats.damage=NaN,p=>p.nextId=Number.MAX_SAFE_INTEGER]){
 const m=L.create({storage:memory()}),before=m.exportJSON(),bad=JSON.parse(before);mutate(bad.profile);assert.equal(m.importJSON(JSON.stringify(bad)),false);assert.equal(m.exportJSON(),before);
}
assert.equal(fresh.importJSON(' '.repeat(15000001)),false);
const future='{"format":"denkmal-loot","version":99}',s=memory({[L.KEY]:future}),locked=L.create({storage:s});assert.equal(locked.readOnly,true);assert.equal(locked.save(),false);assert.equal(s.getItem(L.KEY),future);
const recovery=L.create({storage:memory({[L.KEY]:'{broken',[L.BACKUP]:original})});assert.equal(recovery.readOnly,false);assert.equal(recovery.profile.owned.length,43);assert.match(recovery.status,/Sicherung/);
const tabs=memory(),a=L.create({storage:tabs}),b=L.create({storage:tabs});a.save();assert.equal(b.save(),false);assert.equal(b.readOnly,true);
console.log('Migration: v1/v2, exact legacy preservation, backup failures, imports, reload and stale tabs passed');
// These are plain JSON metadata keys, not executable prototype assignments.
const metadata=JSON.parse(fixture(2));metadata.profile.bag[0].notes=JSON.parse('{"constructor":"historical label","__proto__":{"text":"metadata only"}}');
const metadataModel=L.create({storage:memory({[L.KEY]:JSON.stringify(metadata)})});
assert.equal(metadataModel.readOnly,false,'safe legacy JSON metadata must remain readable');
assert.deepEqual(json(metadataModel.find('fixture-8').notes),metadata.profile.bag[0].notes);
