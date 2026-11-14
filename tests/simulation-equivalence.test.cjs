'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {ansturm,campaign,snapshot}=require('./helpers/simulation.cjs');
const target='tests/fixtures/simulation-c5d6f21.json',record=process.argv.includes('--record'),ref=process.argv.find(a=>a.startsWith('--ref='))?.slice(6);
if(record)assert.equal(ref,'c5d6f21','record only from the original baseline commit');
const results={};
// Both engines execute under the same Node/Math implementation. Cross-version
// floating point digests are diagnostic only; no rounding or tolerance is used.
function trace(name,build,count,options,ticks,prepare=()=>{}){
 // Compare both simulation engines on the same authored map. Layout changes
 // belong to geometry tests; the immutable baseline engine remains untouched.
 const layoutRef=record?ref:null;
 const actual=build(count,{...options,ref,layoutRef}),expected=build(count,{...options,ref:'baseline',layoutRef});
 prepare(actual.state);prepare(expected.state);const hash=crypto.createHash('sha256');
 for(let i=0;i<ticks;i++){
  actual.tick();expected.tick();if(i===0){assert.ok(actual.state.elapsed>0,name+' advances');assert.ok(expected.state.elapsed>0,name+' baseline advances');}const value=JSON.stringify(snapshot(actual.state));
  assert.equal(value,JSON.stringify(snapshot(expected.state)),`${name}: exact state at update ${i+1}`);
  hash.update(value);
 }
 results[name]=hash.digest('hex');
}
for(const [mode,build] of Object.entries({campaign,ansturm}))for(const count of [25,50,100,200])for(const lethal of [false,true])
 trace(`${mode}-${count}-${lethal?'lethal':'sustained'}`,build,count,{lethal},360);
for(const bossWave of [5,10,15,20])trace(`boss-${bossWave}`,ansturm,25,{lethal:true,bossWave},1200);
for(const level of [1,2,3,4,5,6,7])trace(`campaign-mixed-level-${level}`,campaign,25,{level,mixed:true,lethal:true},360);
for(const kind of ['ties','lost','effect-cap'])trace(`ansturm-${kind}`,ansturm,25,{lethal:true},360,s=>{
 for(let i=0;i<s.enemies.length;i++){const e=s.enemies[i];e.x=i%2?.8:.1;e.y=0;e.speed=0;e.burnUntil=0;e.type='normal';}
 if(kind==='lost'){s.hp=.001;s.shield=0;s.enemies.forEach(e=>e.x=0);}
 if(kind==='effect-cap')s.effects=Array.from({length:150},(_,i)=>({type:'projectile',x:i,life:i%2?.4:.001,total:.4,progress:0}));
 s.fireClock=1;
});
if(record){fs.writeFileSync(target,JSON.stringify({baseline:'c5d6f21',runtime:process.version,ticks:360,bossTicks:1200,results},null,2)+'\n');console.log('Recorded unmodified baseline diagnostics');}
else{
 const legacy=JSON.parse(fs.readFileSync(target));const drift=Object.keys(results).filter(k=>results[k]!==legacy.results[k]);
 console.log(`${Object.keys(results).length} simulation traces match immutable baseline exactly after every update (${process.version})`);
 console.log(`Cross-runtime diagnostic: ${drift.length} legacy digest differences; boss-5=${results['boss-5']}`);
}
