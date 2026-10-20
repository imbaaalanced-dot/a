'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const P=require('../dist/portal-run.js');
const fresh=(options={})=>P.create({runId:'test-run',seed:42,heroId:'marcel',startBudget:75,maxSections:3,...options});
const event=(run,type,data={})=>({type,runId:run.runId,section:run.section,revision:run.revision,...data});
const step=(run,type,data)=>P.reduce(run,event(run,type,data)).run;
function cleared(options={}){
 let run=fresh(options);
 run=step(run,'START_WAVE');
 run=step(run,'WAVE_CLEARED');
 assert.equal(run.phase,'build');assert.equal(run.waveInSection,1);
 return step(run,'START_WAVE');
}
assert.equal(fresh().gold,75);
assert.equal(fresh().phase,'build');
assert.equal(fresh({heroId:'kim'}).heroId,'kim');
let run=cleared();
run={...run,gold:10};
const before=JSON.stringify(run), towers=[{spent:25},{spent:60}];
const finishEvent=event(run,'WAVE_CLEARED',{towers});
const result=P.reduce(run,finishEvent);
assert.equal(JSON.stringify(run),before,'reducer must not mutate input');
assert.equal(result.run.gold,113.75);
assert.equal(result.run.phase,'perk');
assert.equal(P.refund(towers),85);
assert.equal(P.refund([{spent:25}]),25,'sold towers are absent, never refunded twice');
assert.equal(P.refund([]),0);
assert.strictEqual(P.reduce(result.run,finishEvent).run,result.run);
assert.equal(P.reduce(result.run,event(result.run,'WAVE_CLEARED',{towers})).run.gold,113.75);
for(const data of [{runId:'other'},{section:2},{revision:999},{revision:undefined}]){
 const r=fresh();assert.strictEqual(P.reduce(r,event(r,'START_WAVE',data)).run,r);
}
for(const type of ['UNKNOWN','PORTAL_ENTER','SECTION_LOADED','PERK_SELECTED','WAVE_CLEARED']){
 const r=fresh();assert.strictEqual(P.reduce(r,event(r,type)).run,r);
}
for(const invalid of [-1,NaN,Infinity,'25',null]){
 assert.throws(()=>P.refund([{spent:invalid}]));
 assert.throws(()=>fresh({startBudget:invalid}));
}
assert.throws(()=>P.refund([{spent:Number.MAX_VALUE},{spent:Number.MAX_VALUE}]));
for(const maxSections of [0,-1,1.5,NaN,Infinity])assert.throws(()=>fresh({maxSections}));
for(const seed of [-1,1.5,NaN,Infinity])assert.throws(()=>fresh({seed}));
for(const runId of ['',null])assert.throws(()=>fresh({runId}));
assert.throws(()=>fresh({heroId:'unknown'}));
assert.throws(()=>fresh({startBudget:75.1}),'money uses exact quarter units');
assert.throws(()=>P.refund([{spent:1.1}]));
const invalidRefundRun=cleared();
assert.strictEqual(P.reduce(invalidRefundRun,event(invalidRefundRun,'WAVE_CLEARED',{towers:[{spent:NaN}]})).run,invalidRefundRun);
let exit=step(result.run,'PERK_SELECTED');
assert.equal(exit.phase,'exit');
let loading=step(exit,'PORTAL_ENTER');
assert.equal(loading.phase,'loading');
assert.strictEqual(step(loading,'PORTAL_ENTER'),loading);
exit=step(loading,'LOAD_FAILED');assert.equal(exit.phase,'exit');
loading=step(exit,'PORTAL_ENTER');
let next=step(loading,'SECTION_LOADED');
assert.equal(next.section,2);assert.equal(next.phase,'build');assert.equal(next.gold,113.75);assert.equal(next.waveInSection,0);
assert.strictEqual(P.reduce(next,event(loading,'SECTION_LOADED')).run,next);
let journey=fresh();
for(let section=1;section<=3;section++){
 journey=step(journey,'START_WAVE');journey=step(journey,'WAVE_CLEARED');
 journey=step(journey,'START_WAVE');journey=step(journey,'WAVE_CLEARED',{towers:[]});
 if(section<3){
  journey=step(journey,'PERK_SELECTED');journey=step(journey,'PORTAL_ENTER');
  journey=step(journey,'SECTION_LOADED');
 }
}
assert.equal(journey.section,3);assert.equal(journey.phase,'finished');
assert.equal(journey.gold,112.5);
let boss=cleared({maxSections:1});boss=step(boss,'WAVE_CLEARED',{towers:[]});
assert.equal(boss.phase,'finished');assert.equal(boss.gold,75,'final boss has no regular prize');
let failed=step(fresh(),'FAIL');assert.equal(failed.phase,'failed');assert.strictEqual(step(failed,'START_WAVE'),failed);
let mid=cleared({maxSections:10});mid={...mid,section:5};
assert.equal(step(mid,'WAVE_CLEARED',{towers:[]}).gold,112.5);
const browser={};vm.runInNewContext(fs.readFileSync(require.resolve('../dist/portal-run.js'),'utf8'),browser);
assert.equal(browser.PortalRun.create({runId:'browser',seed:0,heroId:'kim',startBudget:75,maxSections:3}).gold,75);
console.log('Portal run: state, economy, validation, replay and browser tests PASS');
