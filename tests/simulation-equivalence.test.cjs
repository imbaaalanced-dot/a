'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {ansturm,campaign,snapshot}=require('./helpers/simulation.cjs');
const target='tests/fixtures/simulation-c5d6f21.json',record=process.argv.includes('--record'),ref=process.argv.find(a=>a.startsWith('--ref='))?.slice(6);
if(record)assert.equal(ref,'c5d6f21','record only from the original baseline commit');
const results={};
for(const [mode,build] of Object.entries({campaign,ansturm}))for(const count of [25,50,100,200])for(const lethal of [false,true]){
 const sim=build(count,{lethal,ref}),hash=crypto.createHash('sha256');
 for(let i=0;i<360;i++){sim.tick();assert.ok(sim.state.elapsed>0,'simulation actually advances');hash.update(JSON.stringify(snapshot(sim.state)));}
 results[`${mode}-${count}-${lethal?'lethal':'sustained'}`]=hash.digest('hex');
}
// All four Ansturm boss types, sequential deaths, rewards and intermission/spawning.
for(const bossWave of [5,10,15,20]){const sim=ansturm(25,{lethal:true,bossWave,ref}),hash=crypto.createHash('sha256');for(let i=0;i<1200;i++){sim.tick();hash.update(JSON.stringify(snapshot(sim.state)));}results[`boss-${bossWave}`]=hash.digest('hex');}
for(const level of [1,2,3,4,5,6,7]){const sim=campaign(25,{ref,level,mixed:true,lethal:true}),hash=crypto.createHash('sha256');for(let i=0;i<360;i++){sim.tick();hash.update(JSON.stringify(snapshot(sim.state)));}results[`campaign-mixed-level-${level}`]=hash.digest('hex');}
for(const kind of ['ties','lost','effect-cap']){const sim=ansturm(25,{ref,lethal:true}),s=sim.state,hash=crypto.createHash('sha256');
 for(let i=0;i<s.enemies.length;i++){const e=s.enemies[i];e.x=i%2?.8:.1;e.y=0;e.speed=0;e.burnUntil=0;e.type='normal';}
 if(kind==='lost'){s.hp=.001;s.shield=0;s.enemies.forEach(e=>e.x=0);}
 if(kind==='effect-cap')s.effects=Array.from({length:150},(_,i)=>({type:'projectile',x:i,life:i%2?.4:.001,total:.4,progress:0}));
 s.fireClock=1;for(let i=0;i<360;i++){sim.tick();hash.update(JSON.stringify(snapshot(s)));}results[`ansturm-${kind}`]=hash.digest('hex');
}
if(record){fs.writeFileSync(target,JSON.stringify({baseline:'c5d6f21',ticks:360,bossTicks:1200,results},null,2)+'\n');console.log('Recorded unmodified baseline');}
else{assert.deepEqual(results,JSON.parse(fs.readFileSync(target)).results,'every simulation tick matches the pre-optimization baseline');console.log(`${Object.keys(results).length} deterministic simulation traces match baseline exactly`);}
