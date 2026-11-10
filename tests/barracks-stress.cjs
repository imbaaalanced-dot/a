'use strict';
// Node simulation microbenchmark: these are NOT browser FPS or Android results.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const {performance}=require('node:perf_hooks');
const s={};vm.runInNewContext(fs.readFileSync(require('node:path').join(__dirname,'../dist/barracks.js'),'utf8'),s);
const b=s.DenkmalBarracks;
const game={towers:Array.from({length:8},(_,i)=>({kind:'barracks',level:3,x:i*20,y:50})),militia:[],enemies:Array.from({length:400},(_,i)=>({x:i%200,y:0,r:12,hp:1e9}))};
const opts={paths:[[{x:0,y:0},{x:400,y:0}]],hurtEnemy(e,d){e.hp-=d;}};
for(let i=0;i<1800;i++)b.update(game,1/60,opts);
const samples=[],before=process.memoryUsage().heapUsed,cpu=process.cpuUsage();
for(let i=0;i<18000;i++){
 const t=performance.now();b.update(game,1/60,opts);
 for(const e of game.enemies){const u=b.aggroTarget(game,e);if(u)b.damageAlly(u,.0001);}
 samples.push(performance.now()-t);assert.ok(game.militia.filter(u=>u.hp>0).length<=10);assert.ok(game.militia.length<=20);
}
samples.sort((a,b)=>a-b);const used=process.cpuUsage(cpu);
console.log(JSON.stringify({environment:'Node synthetic simulation; 300 simulated seconds, 8 barracks, 400 stationary enemies',iterations:samples.length,medianMs:samples[9000],p95Ms:samples[17100],p99Ms:samples[17820],cpuUserMs:used.user/1000,cpuSystemMs:used.system/1000,heapDeltaBytes:process.memoryUsage().heapUsed-before,live:game.militia.filter(u=>u.hp>0).length,retainedUnits:game.militia.length},null,2));
