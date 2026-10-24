'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const P=require('../dist/persisted-state.js');
const data=new Map();
const storage={getItem:k=>data.has(k)?data.get(k):null,setItem:(k,v)=>data.set(k,v)};
const defaults={level2:false,level4:false,level5:false,level6:false};
const valid=p=>!!p&&typeof p==='object'&&!Array.isArray(p)&&Object.keys(defaults).every(k=>typeof p[k]==='boolean');
const primary='denkmal-progress-v2';
const a=P.create(storage);
assert.equal(a.load(primary,1,defaults,valid).status,'missing','absent save initializes cleanly');
assert.equal(a.save(primary,1,{...defaults,level2:true},valid),true);
assert.equal(a.load(primary,1,defaults,valid).value.level2,true,'fresh v2 write roundtrips');
assert.equal(JSON.parse(data.get(primary)).schemaVersion,1);
assert(Number.isFinite(JSON.parse(data.get(primary)).lastUpdated));
const b=P.create(storage);b.load(primary,1,defaults,valid);
assert.equal(a.save(primary,1,{...defaults,level2:true,level4:true},valid),true);
assert.equal(b.save(primary,1,defaults,valid),false,'stale tab may not overwrite newer progress');
const latest=data.get(primary);
data.set(primary,'{');
const corrupt=P.create(storage);assert.equal(corrupt.load(primary,1,defaults,valid).status,'corrupt');
assert.equal(corrupt.save(primary,1,defaults,valid),false,'malformed JSON remains untouched');
assert.equal(data.get(primary),'{');
data.set(primary,JSON.stringify({schemaVersion:1,lastUpdated:5,data:{level2:true}}));
assert.equal(P.create(storage).load(primary,1,defaults,valid).status,'corrupt','partial data rejected');
assert.equal(data.get(primary),JSON.stringify({schemaVersion:1,lastUpdated:5,data:{level2:true}}));
data.set(primary,JSON.stringify({schemaVersion:99,lastUpdated:5,data:defaults}));
const future=P.create(storage);assert.equal(future.load(primary,1,defaults,valid).status,'incompatible');
assert.equal(future.save(primary,1,defaults,valid),false,'future data remains untouched');
data.set(primary,latest);
const blocked=P.create({getItem(){throw Error('denied');},setItem(){throw Error('denied');}});
assert.equal(blocked.load(primary,1,defaults,valid).status,'unavailable');
assert.equal(blocked.save(primary,1,defaults,valid),false);

// Old production unlocks migrate in memory, then persist in the new key without deleting old data.
const old=new Map([['denkmal-level2-unlocked-v1','true'],['denkmal-level5-completed-v1','true']]);
const oldStorage={getItem:k=>old.has(k)?old.get(k):null,setItem:(k,v)=>old.set(k,v)};
function openLevels(){const box={localStorage:oldStorage};vm.createContext(box);
  vm.runInContext(fs.readFileSync('dist/persisted-state.js','utf8'),box);
  vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),box);return box.DenkmalLevels;}
const first=openLevels();assert.equal(first.unlocked,true);assert.equal(first.level5Completed,true);
assert.equal(first.completeLevel6(),true);
assert.equal(openLevels().level6Completed,true);
assert.equal(old.get('denkmal-level5-completed-v1'),'true','legacy save is preserved');
assert.equal(JSON.parse(old.get(primary)).data.level6,true);

console.log('persisted state: migration, versioning, bad JSON, partial writes, stale tabs and blocked storage passed');
