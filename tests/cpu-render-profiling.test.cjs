/* Opt-in CPU simulation and Canvas draw timings. These are JS costs, not GPU timings. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
const varsStart=src.indexOf('  const frameSamples=new Float32Array(120)');
const varsEnd=src.indexOf('  const reducedMotion=',varsStart);
const functionsStart=src.indexOf('  function resetFrameTelemetry(){');
const functionsEnd=src.indexOf('  function updateAdaptiveResolution(now){',functionsStart);
assert.ok(varsStart>0&&varsEnd>varsStart&&functionsStart>0&&functionsEnd>functionsStart);
assert.match(src,/const profile=telemetryOn&&state==='playing'&&!document.hidden/);
assert.match(src,/recordCpuFrame\(renderStart-simulationStart,shouldDraw\?performance.now\(\)-renderStart:0,shouldDraw\)/);
const overlay={textContent:'',classList:{add(){},remove(){}}};
const box={
 Float32Array,Math,document:{hidden:false},performance:{memory:null},
 state:'playing',telemetryOn:true,telemetryFrames:0,telemetryLast:0,telemetryFps:0,
 game:{enemies:[1,2,3],particles:[1]},$:id=>{assert.equal(id,'fpsOverlay');return overlay;}
};
vm.createContext(box);
vm.runInContext(src.slice(varsStart,varsEnd)+src.slice(functionsStart,functionsEnd)+
 ';this.record=recordCpuFrame;this.update=updateTelemetry;this.reset=resetFrameTelemetry;',box);
box.record(2,4,true);box.update(1000);
box.record(4,6,true);box.update(1600);
assert.match(overlay.textContent,/SIM 3\.0ms/,'simulation mean in telemetry');
assert.match(overlay.textContent,/DRAW 5\.0ms/,'draw mean in telemetry');
box.record(8,12,true);box.update(2200);
assert.match(overlay.textContent,/SIM 8\.0ms/,'window accumulators reset after reporting');
assert.match(overlay.textContent,/DRAW 12\.0ms/);
box.record(5,999,false);box.update(2800);
assert.match(overlay.textContent,/SIM 5\.0ms/);
assert.match(overlay.textContent,/DRAW 0\.0ms/,'draw samples only when drawing');
box.telemetryOn=false;box.record(300,300,true);box.update(3400);
box.telemetryOn=true;box.record(1,1,true);box.update(4000);
box.record(3,7,true);box.update(4600);
assert.match(overlay.textContent,/SIM 2\.0ms/,'disabled telemetry does not retain previous samples');
assert.match(overlay.textContent,/DRAW 4\.0ms/);
box.document.hidden=true;box.update(5200);
box.document.hidden=false;box.record(2,3,true);box.update(5800);
box.record(4,5,true);box.update(6400);
assert.match(overlay.textContent,/SIM 3\.0ms/,'background resets averages');
assert.match(overlay.textContent,/DRAW 4\.0ms/);
console.log('CPU timing telemetry: averaging, drawn-only samples, gated profiling and resets passed.');
