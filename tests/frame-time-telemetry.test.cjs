/* Opt-in frame timing telemetry regression checks. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
const start=src.indexOf('  const frameSamples=new Float32Array(120)');
const varsEnd=src.indexOf('  const reducedMotion=',start);
const helpersStart=src.indexOf('  function resetFrameTelemetry(){');
const helpersEnd=src.indexOf('  function simulationStepsPerFrame()',helpersStart);
assert.ok(start>=0&&varsEnd>start&&helpersStart>0&&helpersEnd>helpersStart,'frame telemetry declared');
const overlay={textContent:'',classList:{add(){},remove(){}}};
const box={
 Float32Array,Math,document:{hidden:false},
 performance:{memory:null},
 state:'playing',game:{enemies:[1,2,3],particles:[1]},
 telemetryOn:true,telemetryFrames:0,telemetryLast:0,telemetryFps:0,
 $:id=>{assert.equal(id,'fpsOverlay');return overlay;}
};
vm.createContext(box);
vm.runInContext(src.slice(start,varsEnd)+src.slice(helpersStart,helpersEnd)+
 ';this.update=updateTelemetry;this.reset=resetFrameTelemetry;this.stats=frameTelemetryStats;',box);
box.update(1000);
for(let i=1;i<=125;i++)box.update(1000+i*16.6667);
let stats=box.stats();
assert.equal(stats.frameCount,120,'120-frame bounded ring buffer');
assert.equal(stats.stutters,0);
assert.ok(stats.p95>16&&stats.p95<18);
assert.match(overlay.textContent,/P95/,'live display has percentile');
assert.match(overlay.textContent,/>50ms/,'live display has slow-frame count');
box.update(4000);
stats=box.stats();
assert.equal(stats.stutters,1,'long frames counted');
box.reset();
assert.equal(box.stats().frameCount,0,'toggle/reset clears history');
box.update(5000);
assert.equal(box.stats().frameCount,0,'first sample after reset is a baseline');
box.update(5016);
assert.equal(box.stats().frameCount,1);
box.document.hidden=true;
box.update(5032);
assert.equal(box.stats().frameCount,0,'background resets samples');
console.log('Frame telemetry: bounded 120-frame ring, p95, slow frame counts, reset and hidden state passed.');
