'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const {test}=require('node:test');
const P=require('../dist/portal-run.js');
const box=vm.createContext({});vm.runInContext(fs.readFileSync('dist/loot.js','utf8'),box);const L=box.DenkmalLoot;
function memory(){const data=new Map();return {data,getItem:k=>data.get(k)||null,setItem(k,v){data.set(k,v);}};}
const fresh=()=>P.create({runId:'save-test',seed:1,heroId:'marcel',startBudget:75,maxSections:3});
test('boss reward and claim share a single primary write and survive reload',()=>{
  const s=memory(),writes=[];const set=s.setItem;s.setItem=(k,v)=>{writes.push(k);set(k,v);};
  const m=L.create({storage:s,rng:()=>.5}),a=m.grantBossRewardOnce('save-test:3:boss',6,'intro');
  assert.equal(a.status,'granted');assert.equal(m.profile.bag.length,1);
  assert.equal(writes.filter(k=>k===L.KEY).length,1);
  const reload=L.create({storage:s});assert.equal(reload.grantBossRewardOnce('save-test:3:boss',6,'intro').status,'alreadyGranted');
  assert.equal(reload.profile.bag.length,1);assert.equal(reload.profile.claimedBossRewards['save-test:3:boss'],a.itemId);
});
test('failed boss save leaves durable and in-memory profile unchanged, then retries',()=>{
  const s=memory(),m=L.create({storage:s,rng:()=>.5});m.save();
  const before=m.exportJSON(),raw=s.getItem(L.KEY),set=s.setItem;
  s.setItem=()=>{throw Error('quota');};
  assert.equal(m.grantBossRewardOnce('r:3:boss',6,'intro').status,'error');
  assert.equal(m.exportJSON(),before);assert.equal(s.getItem(L.KEY),raw);
  s.setItem=set;assert.equal(m.grantBossRewardOnce('r:3:boss',6,'intro').status,'granted');
});
test('blocked read cannot claim success or mutate profile',()=>{
  const m=L.create({storage:{getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}}});
  const before=m.exportJSON();assert.equal(m.grantBossRewardOnce('r:3:boss',6,'intro').status,'error');assert.equal(m.exportJSON(),before);
});
test('stale loot tab cannot overwrite a reward or another find',()=>{
  const s=memory(),a=L.create({storage:s}),b=L.create({storage:s});
  assert.equal(a.grantBossRewardOnce('r:3:boss',6,'intro').status,'granted');const raw=s.getItem(L.KEY);
  assert.equal(b.grantBossRewardOnce('r:3:boss',6,'intro').status,'error');assert.equal(s.getItem(L.KEY),raw);assert.equal(b.profile.bag.length,0);
});
test('v1/v2 migrate without losing inventory; future profiles stay read-only',()=>{
  for(const version of [1,2]){
    const s=memory(),m=L.create({storage:s});m.add(m.generate(2));const e=JSON.parse(m.exportJSON());
    e.version=version;e.profile.version=version;delete e.profile.claimedBossRewards;
    if(version===1){delete e.profile.level3;delete e.profile.kirchendeCompleted;}
    s.setItem(L.KEY,JSON.stringify(e));const next=L.create({storage:s});assert.equal(next.profile.version,3);assert.equal(next.profile.bag[0].id,e.profile.bag[0].id);
    assert.equal(next.grantBossRewardOnce('r:3:boss',6,'intro').status,'granted');
  }
  const s=memory();s.setItem(L.KEY,'{"version":99}');const m=L.create({storage:s});
  assert.equal(m.grantBossRewardOnce('r:3:boss',6,'intro').status,'error');assert.equal(s.getItem(L.KEY),'{"version":99}');
});
test('malformed claim records and invalid boss arguments are rejected',()=>{
  const m=L.create({storage:memory()});const e=JSON.parse(m.exportJSON());e.profile.claimedBossRewards={'r:3:boss':12};
  assert.equal(m.importJSON(JSON.stringify(e)),false);
  for(const id of ['',null,'__proto__','not-a-boss'])assert.equal(m.grantBossRewardOnce(id,6,'intro').status,'error');
  assert.equal(m.grantBossRewardOnce('r:3:boss',NaN,'intro').status,'error');
});
test('portal store saves and loads separately from inventory and rejects stale writers',()=>{
  const s=memory();s.setItem(L.KEY,'untouched');const a=P.createStore(s),b=P.createStore(s),run=fresh();
  assert.equal(a.load().status,'missing');assert.equal(b.load().status,'missing');
  assert.equal(a.save(run,null).status,'saved');assert.equal(b.save(run,null).status,'conflict');
  assert.equal(a.load().run.gold,75);assert.equal(s.getItem(L.KEY),'untouched');
  const stale=a.load().run,c=P.createStore(s);c.load();
  const newer={...stale,revision:1,gold:50};assert.equal(c.save(newer,0).status,'saved');
  assert.equal(a.save({...stale,gold:1},0).status,'conflict');assert.equal(c.load().run.gold,50);
});
test('portal quota/read errors report errors and retain old checkpoint',()=>{
  const s=memory(),store=P.createStore(s);store.load();assert.equal(store.save(fresh(),null).status,'saved');
  const before=s.getItem(P.KEY);s.setItem=()=>{throw Error('quota');};
  assert.equal(store.save({...fresh(),revision:1,gold:20},0).status,'error');assert.equal(s.getItem(P.KEY),before);
  assert.equal(P.createStore({getItem(){throw Error('blocked');}}).load().status,'error');
});
test('unknown/corrupt portal data never overwrite inventory and can recover valid backup',()=>{
  const s=memory();s.setItem(L.KEY,'inventory');s.setItem(P.KEY,'{"version":99}');
  const store=P.createStore(s);assert.equal(store.load().status,'incompatible');assert.equal(store.save(fresh(),null).status,'conflict');
  s.setItem(P.KEY,'broken');assert.equal(P.createStore(s).load().status,'corrupt');
  s.setItem(P.BACKUP,JSON.stringify(fresh()));assert.equal(P.createStore(s).load().status,'ok');
  assert.equal(s.getItem(L.KEY),'inventory');
});
test('combat reload uses the pre-fight checkpoint, preserving latest CAS revision',()=>{
  const s=memory(),store=P.createStore(s);store.load();let run=P.withCheckpoint({...fresh(),gold:50,towers:[{spent:25}]});
  run=P.reduce(run,{type:'START_WAVE',runId:run.runId,section:run.section,revision:run.revision}).run;
  run={...run,heroHp:10,gold:0};assert.equal(store.save(run,null).status,'saved');
  const resumed=P.createStore(s).load();assert.equal(resumed.run.phase,'build');assert.equal(resumed.run.heroHp,100);assert.equal(resumed.run.gold,50);assert.equal(resumed.run.towers[0].spent,25);assert.equal(resumed.run.revision,1);
});
test('saved perk offers and RNG state survive reload and loading resumes at exit',()=>{
  const s=memory(),store=P.createStore(s);store.load();
  const run={...fresh(),phase:'perk',waveInSection:2,offerIds:['kraft','ausdauer','schritt'],rngState:123};
  assert.equal(store.save(run,null).status,'saved');const loaded=store.load().run;
  assert.deepEqual(loaded.offerIds,run.offerIds);assert.equal(loaded.rngState,123);
  const exit={...loaded,phase:'exit',revision:1};const loading=P.reduce(exit,{type:'ENTER_PORTAL',runId:exit.runId,section:1,revision:1,gold:10,towers:[{spent:25}]}).run;
  assert.equal(store.save(loading,0).status,'saved');const retry=store.load().run;
  assert.equal(retry.phase,'exit');assert.equal(retry.gold,10);assert.equal(retry.towers[0].spent,25);
  const reenter=P.reduce(retry,{type:'ENTER_PORTAL',runId:retry.runId,section:1,revision:retry.revision,gold:retry.gold,towers:retry.towers}).run;
  assert.equal(P.reduce(reenter,{type:'SECTION_LOADED',runId:reenter.runId,section:1,revision:reenter.revision}).run.gold,53.75);
});
test('saved boss receipt survives a crash before the separate portal save',()=>{
  const s=memory(),m=L.create({storage:s});const store=P.createStore(s);store.load();
  assert.equal(store.save(fresh(),null).status,'saved');
  assert.equal(m.grantBossRewardOnce('save-test:3:boss',6,'intro').status,'granted');
  const raw=s.getItem(L.KEY),set=s.setItem;s.setItem=(key,value)=>{if(key===P.KEY)throw Error('quota');set(key,value);};
  assert.equal(store.save({...fresh(),revision:1},0).status,'error');
  const reload=L.create({storage:s});assert.equal(reload.grantBossRewardOnce('save-test:3:boss',6,'intro').status,'alreadyGranted');
  assert.equal(s.getItem(L.KEY),raw);assert.equal(reload.profile.bag.length,1);
});
test('malformed numeric state, perks, offered IDs and missing combat checkpoint rejected',()=>{
  const store=P.createStore(memory());store.load();
  for(const data of [{gold:-1},{heroHp:NaN},{section:1.5},{perkRanks:{kraft:4}},{offerIds:['kraft','kraft','schritt']},{phase:'combat',waveInSection:1,checkpoint:null},{towers:[{spent:-1}]}]){
    assert.equal(store.save({...fresh(),...data},null).status,'invalid');
  }
});
