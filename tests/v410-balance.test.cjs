const test=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../tools/audit-v410-balance.mjs');
test('audit runs actual model deterministically and conserves its economy',async()=>{
 const {simulate}=await load();
 const opts={strategy:'balanced',seed:17,startWave:1,endWave:2,budget:100,maxSeconds:180};
 const a=simulate(opts),b=simulate(opts);
 assert.deepEqual(a,b);assert.ok(a.kills>0);assert.ok(a.goldSpent>0);
 assert.equal(a.finalGold,100+a.goldEarned-a.goldSpent);
 assert.ok(a.samples.length);assert.ok(a.hp>=0);assert.ok(a.upgradeDiversity>=2);
 assert.ok(['lost','completed','timeout'].includes(a.outcome));
});
test('campaign opening analysis evaluates current source rules including loot bounds',async()=>{
 const {campaignOpening}=await load();const c=campaignOpening();
 assert.equal(c.startEssence,70);assert.equal(c.towerCosts.bow,25);
 assert.equal(c.openings.twoBow.remaining,20);assert.equal(c.openings.twoCannon.remaining,0);
 assert.equal(c.waves.length,5);assert.equal(c.waves[0].count,9);
 assert.equal(c.waves[0].bounty,18);assert.equal(c.waves[0].lootUpperBound,36);
 assert.equal(c.waves[4].types.boss,1);
 assert.ok(c.waves.every(w=>w.lootUpperBound>=0));
});
test('audit matrix covers early, middle and high waves with reproducible distinct profiles',async()=>{
 const {audit}=await load();const r=audit({seeds:[17],windows:[{name:'early',startWave:1,endWave:1,budget:100},{name:'mid',startWave:20,endWave:20,budget:10000},{name:'high',startWave:100,endWave:100,budget:100000}]});
 assert.equal(r.runs.length,12);assert.equal(new Set(r.runs.map(x=>x.strategy)).size,4);
 assert.ok(r.runs.every(x=>Object.values(x.stats).every(Number.isFinite)));
 assert.ok(r.runs.every(x=>x.maxEffects<=120));
 const high=r.runs.filter(x=>x.window==='high');
 assert.equal(high.find(x=>x.strategy==='chain').upgrades.explosion,0);
 assert.ok(high.find(x=>x.strategy==='chain').upgrades.tesla>0);
 assert.ok(high.find(x=>x.strategy==='splash').upgrades.explosion>0);
 assert.ok(high.every(x=>x.weaponDiversity>0));
});
test('baseline comparison matches scenarios by identity and exposes changed outcomes',async()=>{
 const {compareBaseline}=await load();
 const before={window:'high',strategy:'chain',seed:17,outcome:'lost',lastWave:100,kills:0,hp:0,goldEarned:0,goldSpent:100};
 const after={...before,outcome:'completed',lastWave:104,kills:50,hp:100,goldEarned:400};
 const [c]=compareBaseline({runs:[after]},{runs:[before]});
 assert.equal(c.scenario,'high/chain/17');assert.equal(c.before.kills,0);assert.equal(c.after.kills,50);
 assert.throws(()=>compareBaseline({runs:[after]},{runs:[]}),/Baseline scenario missing/);
});
test('funded fixed late-wave profile can defeat enemies after the scaling correction',async()=>{
 const {simulate}=await load();
 const r=simulate({strategy:'balanced',seed:17,startWave:100,endWave:104,budget:100000});
 assert.ok(r.kills>0,'late combat must allow actual model kills, not merely finite HP');
 assert.ok(r.goldEarned>0);assert.equal(r.finalGold,100000+r.goldEarned-r.goldSpent);
});
