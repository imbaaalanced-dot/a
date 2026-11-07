'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const sandbox={};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/campaign-20-wave-plan.js'),'utf8'),sandbox);
const P=sandbox.DenkmalCampaign20;
assert.ok(P,'standalone planner exports an API');
const all=[];
for(let level=1;level<=7;level++){
  const c=P.chapter(level);
  assert.equal(c.firstWave,1+(level-1)*20);
  assert.equal(c.lastWave,c.firstWave+19);
  assert.deepEqual(Array.from(c.bossWaves),[c.firstWave+9,c.firstWave+19]);
  for(let w=c.firstWave;w<=c.lastWave;w++){
    const data=P.describe(level,w);
    all.push(data);
    assert.equal(data.localWave,w-c.firstWave+1);
    assert.ok(Number.isFinite(data.interval)&&data.interval>=.38);
    assert.ok(Number.isInteger(data.count)&&data.count>=9&&data.count<=60);
    assert.ok(P.enemyType(level,w,data.count)===null,'no enemy beyond the spawn count');
    const types=Array.from({length:data.count},(_,i)=>P.enemyType(level,w,i));
    const bosses=types.filter(type=>type==='boss'||type==='uprooted');
    if(data.localWave===10||data.localWave===20){
      assert.equal(bosses.length,1,'exactly one boss on the 10th/20th wave');
      assert.equal(types[0],level===3?'uprooted':'boss');
    }else assert.equal(bosses.length,0,'regular waves have no boss');
    if(data.localWave===1)assert.ok(types.every(type=>!['shadowwing','gargoyle','stormwing'].includes(type)),
      'the first wave of each chapter has no flying enemies');
    if(w>c.firstWave){
      const prev=P.describe(level,w-1);
      assert.ok(data.count>=prev.count,'chapter pressure does not drop');
      assert.ok(data.interval<=prev.interval,'spawn pressure does not drop');
    }
  }
  for(const bad of [c.firstWave-1,c.lastWave+1,0,NaN])assert.equal(P.describe(level,bad),null);
  assert.equal(P.describe(level,c.firstWave,'endless'),null,'existing endless stays unchanged');
}
assert.equal(all.length,140);
assert.equal(all.filter(d=>d.boss).length,14);
assert.equal(P.chapter(0),null);
assert.equal(P.chapter(8),null);
assert.equal(P.enemyType(1,1,-1),null);
assert.equal(P.enemyType(1,1,1.5),null);
assert.equal(P.enemyType(1,1,0,'campaign-pilot'),null);
console.log('20-wave planner: 7 chapters, 140 waves, 14 bosses, mobile caps and endless isolation passed');
