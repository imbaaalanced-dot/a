const test=require('node:test');
const assert=require('node:assert/strict');
const load=()=>import('../tools/audit-v410-balance.mjs');
test('campaign opening analysis evaluates current source rules including loot bounds',async()=>{
 const {campaignOpening}=await load();const c=campaignOpening();
 assert.equal(c.startEssence,90);assert.equal(c.towerCosts.bow,25);
 assert.equal(c.openings.twoBow.remaining,40);assert.equal(c.openings.twoCannon.remaining,20);
 assert.equal(c.waves.length,5);assert.equal(c.waves[0].count,9);
 assert.equal(c.waves[0].bounty,18);assert.equal(c.waves[0].lootUpperBound,36);
 assert.equal(c.waves[4].types.boss||0,0,'regular fifth wave has no boss in 20-wave campaign');
 assert.ok(c.waves.every(w=>w.lootUpperBound>=0));
});
