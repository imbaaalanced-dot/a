'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {campaign,snapshot}=require('./helpers/simulation.cjs');
const target='tests/fixtures/simulation-e4d6134.json',record=process.argv.includes('--record'),ref=process.argv.find(a=>a.startsWith('--ref='))?.slice(6);
if(record)assert.equal(ref,'e4d613480344b6934456922afbb849bd4fb3b46b','record only from the current baseline commit e4d6134');
const results={};
// Both campaign engine versions execute under the same Node/Math implementation. Cross-version
// floating point digests are diagnostic only; no rounding or tolerance is used.
function trace(name,build,count,options,ticks,prepare=()=>{}){
 // Compare both campaign engine versions on the same authored map. Layout changes
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
for(const [mode,build] of Object.entries({campaign}))for(const count of [25,50,100,200])for(const lethal of [false,true])
 trace(`${mode}-${count}-${lethal?'lethal':'sustained'}`,build,count,{lethal,reducedMotion:true},360);
for(const level of [1,2,3,4,5,6,7])trace(`campaign-mixed-level-${level}`,campaign,25,{level,mixed:true,lethal:true,reducedMotion:true},360);
if(record){fs.writeFileSync(target,JSON.stringify({baseline:'e4d6134',runtime:process.version,ticks:360,results},null,2)+'\n');console.log('Recorded unmodified baseline diagnostics');}
else{
 const legacy=JSON.parse(fs.readFileSync(target));const drift=Object.keys(results).filter(k=>results[k]!==legacy.results[k]);
 console.log(`${Object.keys(results).length} simulation traces match immutable baseline exactly after every update (${process.version})`);
 console.log(`Cross-runtime diagnostic: ${drift.length} legacy digest differences`);
}
