'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {test} = require('node:test');
const PortalRun = require('../dist/portal-run.js');
const create = (options={}) => PortalRun.create({runId:'pilot-1',seed:123,heroId:'marcel',startBudget:75,maxSections:3,...options});
const send = (run,type,data={}) => PortalRun.reduce(run,{type,runId:run.runId,section:run.section,revision:run.revision,...data});
function exit(run=create()) {
  run=send(run,'START_WAVE').run;
  run=send(run,'WAVE_CLEARED').run;
  run=send(run,'START_WAVE').run;
  run=send(run,'WAVE_CLEARED').run;
  return send(run,'PERK_SELECTED').run;
}
test('starts with three basic bow towers worth of essence and isolated run fields',()=>{
  const run=create();
  assert.equal(run.gold,75);assert.equal(run.phase,'build');assert.equal(run.section,1);
  assert.equal(run.waveInSection,0);assert.equal(run.version,1);assert.equal(run.revision,0);
  assert.equal(run.rngState,123);assert.equal(run.heroId,'marcel');assert.equal(run.heroHp,100);
  assert.deepEqual(run.perkRanks,{});assert.deepEqual(run.rewardIds,[]);assert.equal(run.checkpoint,null);
});
test('two waves lead to perk and explicit exit; reducers never mutate their input',()=>{
  const run=create(), before=JSON.stringify(run);
  const first=send(run,'START_WAVE').run;
  assert.equal(first.phase,'combat');assert.equal(first.waveInSection,1);
  assert.equal(JSON.stringify(run),before);assert.equal(exit(run).phase,'exit');
});
test('transition refunds only remaining paid investments and pays 18.75 once',()=>{
  const run=exit(), towers=[{spent:25},{spent:60}];
  const pending=send(run,'ENTER_PORTAL',{gold:10,towers}).run;
  assert.equal(pending.phase,'loading');assert.equal(pending.gold,75);
  const event={type:'SECTION_LOADED',runId:pending.runId,section:pending.section,revision:pending.revision};
  const result=PortalRun.reduce(pending,event);
  assert.equal(result.run.gold,113.75);assert.equal(result.run.section,2);
  assert.equal(result.run.waveInSection,0);assert.equal(result.run.phase,'build');
  assert.deepEqual(result.effects,[{type:'CLEAR_TOWERS_AND_PROJECTILES'},{type:'RESET_PROTECTION',integrity:100}]);
  assert.equal(PortalRun.reduce(result.run,event).run,result.run);
  assert.equal(send(result.run,'SECTION_LOADED').run,result.run);
  assert.deepEqual(towers,[{spent:25},{spent:60}]);
});
test('sold towers are absent, so they cannot be refunded again; discounts use spent',()=>{
  assert.equal(PortalRun.refund([{spent:18.75},{spent:0}]),18.75);
  const pending=send(exit(),'ENTER_PORTAL',{gold:35,towers:[]}).run;
  assert.equal(send(pending,'SECTION_LOADED').run.gold,53.75);
});
test('failed loading can retry without duplicate settlement or loss',()=>{
  let run=send(exit(),'ENTER_PORTAL',{gold:10,towers:[{spent:85}]}).run;
  run=send(run,'SECTION_LOAD_FAILED').run;assert.equal(run.phase,'exit');assert.equal(run.gold,75);
  run=send(run,'ENTER_PORTAL',{gold:10,towers:[{spent:85}]}).run;
  run=send(run,'SECTION_LOADED').run;assert.equal(run.gold,113.75);
  assert.deepEqual(run.rewardIds,['pilot-1:1:settlement']);
});
test('last boss finishes without a perk or another section payout',()=>{
  let run=create({maxSections:1});
  run=send(run,'START_WAVE').run;run=send(run,'WAVE_CLEARED').run;
  run=send(run,'START_WAVE').run;const result=send(run,'WAVE_CLEARED');
  assert.equal(result.run.phase,'finished');assert.equal(result.run.gold,75);
  assert.deepEqual(result.effects,[{type:'RUN_FINISHED'}]);
  assert.equal(send(result.run,'PERK_SELECTED').run,result.run);
});
test('failure is terminal and produces no payout',()=>{
  const failed=send(create(),'FAIL').run;assert.equal(failed.phase,'failed');
  assert.equal(send(failed,'START_WAVE').run,failed);assert.equal(failed.gold,75);
});
test('stale, foreign, missing identity and invalid-phase events do nothing',()=>{
  const run=create();
  for(const data of [{runId:'other'},{section:2},{revision:1},{revision:undefined}]){
    assert.equal(send(run,'START_WAVE',data).run,run);
  }
  for(const type of ['WAVE_CLEARED','PERK_SELECTED','ENTER_PORTAL','SECTION_LOADED','UNKNOWN']){
    assert.deepEqual(send(run,type),{run,effects:[]});
  }
  assert.deepEqual(PortalRun.reduce(run,null),{run,effects:[]});
});
test('validates finite nonnegative investments and rejects overflow',()=>{
  for(const spent of [-1,NaN,Infinity,'25',undefined,Number.MAX_VALUE]){
    assert.throws(()=>PortalRun.refund([{spent}]),/invalid/i);
  }
  assert.throws(()=>PortalRun.refund(null),/invalid/i);
  assert.throws(()=>PortalRun.refund([null]),/invalid/i);
  assert.equal(PortalRun.refund([]),0);
});
test('invalid creation and transition values cannot corrupt the economy',()=>{
  for(const options of [{startBudget:-1},{startBudget:NaN},{maxSections:0},{maxSections:1.5},{seed:NaN},{seed:-1},{seed:1.5},{runId:''},{heroId:''},{heroHp:-1},{heroHp:101}]){
    assert.throws(()=>create(options),/invalid/i);
  }
  const run=exit();
  for(const data of [{gold:-1,towers:[]},{gold:NaN,towers:[]},{gold:10,towers:[{spent:-2}]},{gold:10,towers:null}]){
    assert.deepEqual(send(run,'ENTER_PORTAL',data),{run,effects:[]});
  }
});
test('browser global has the same API without CommonJS or dependencies',()=>{
  const context=vm.createContext({});
  vm.runInContext(fs.readFileSync(require.resolve('../dist/portal-run.js'),'utf8'),context);
  assert.equal(typeof context.PortalRun.create,'function');
  assert.equal(context.PortalRun.create({runId:'browser',seed:1,heroId:'kim',startBudget:75,maxSections:3}).gold,75);
});
