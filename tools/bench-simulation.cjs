#!/usr/bin/env node
'use strict';
const {performance}=require('node:perf_hooks'),os=require('node:os');
const {ansturm,campaign}=require('../tests/helpers/simulation.cjs');
const ref=process.argv.find(a=>a.startsWith('--ref='))?.slice(6);
const compare=process.argv.find(a=>a.startsWith('--compare='))?.slice(10);
const refs=compare?[compare,undefined]:[ref];
const rounds=7,warmup=120,steps=360,results=[];
for(const [mode,build] of Object.entries({campaign,ansturm}))for(const enemies of [25,50,100,200]){
 const series=refs.map(ref=>({ref,times:[]}));
 // Alternate ordering to reduce systematic before/after timing bias.
 for(let r=0;r<rounds;r++)for(const sample of r%2?[...series].reverse():series){
  const s=build(enemies,{ref:sample.ref});global.gc?.();for(let i=0;i<warmup;i++)s.tick();global.gc?.();
  if(s.state.elapsed<=0||s.state.enemies.length!==enemies)throw Error('Scenario did not reach expected active load');
  const t=performance.now();for(let i=0;i<steps;i++)s.tick();sample.times.push((performance.now()-t)/steps);
  if(s.state.enemies.length!==enemies)throw Error('Load changed during sample');
 }
 for(const sample of series){sample.times.sort((a,b)=>a-b);const counted=build(enemies,{ref:sample.ref,instrument:true});for(let i=0;i<warmup;i++)counted.tick();const before=counted.calls();for(let i=0;i<steps;i++)counted.tick();
  results.push({ref:sample.ref||'working-tree',mode,enemies,active:enemies,medianMs:sample.times[3],minMs:sample.times[0],maxMs:sample.times[6],hypotPerStep:(counted.calls()-before)/steps});
 }
}
console.log(JSON.stringify({node:process.version,cpu:os.cpus()[0].model,rounds,warmup,steps,rendering:false,gcBetweenRounds:typeof global.gc==='function',results},null,2));
