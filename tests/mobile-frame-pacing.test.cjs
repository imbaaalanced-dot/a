'use strict';
// Exercise the production loop with controlled browser callback timestamps.
// Resetting the render clock to each callback loses fractional intervals and
// turns a 30 fps cap into roughly 20 fps on a slightly jittery 60 Hz display.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(require('node:path').join(__dirname,'../dist/game.js'),'utf8');
const loopSource=source.slice(source.indexOf('  function loop(now){'),source.indexOf('  function tone('));
const renderSource=source.match(/^  function targetRenderInterval\(\)\{.*\}$/m)?.[0];
assert.ok(renderSource,'production frame limiter must be available');
function run(intervals,{mobile=true,mode='low'}={}){
 let draws=0,updates=0;
 const box={last:0,MAX_FRAME_SECONDS:.25,FIXED_STEP:1/60,loopAccumulator:0,
 telemetryOn:false,state:'playing',document:{hidden:false},lastIdleDraw:0,lastGameplayDraw:0,
 performance:{now:()=>0},simulationStepsPerFrame:()=>1,
 mobileRender:mobile,graphicsMode:mode,
 update(){updates++;},draw(){draws++;},recordCpuFrame(){},advanceQualityMonitor(){},
 updateAdaptiveResolution(){},updateTelemetry(){},requestAnimationFrame(){}};
 vm.createContext(box);vm.runInContext(renderSource+'\n'+loopSource,box);
 let now=0;for(const interval of intervals){now+=interval;box.loop(now);}
 return {draws,updates,box,tick:dt=>box.loop(now+=dt)};
}
for(const hz of [60,90,120]){
 const intervals=Array.from({length:hz*10},(_,i)=>1000/hz+(i%2?.2:-.2));
 const result=run(intervals);
 console.log(`${hz} Hz callbacks: ${result.draws} draws / 10 seconds`);
 assert.ok(result.draws>=299&&result.draws<=301,'30 fps cap must retain fractional time instead of dropping scheduled frames');
 const uncapped=run(intervals,{mobile:false});
 assert.equal(uncapped.draws,intervals.length,'desktop draws every callback');
 assert.equal(result.updates,uncapped.updates,'render cap must not alter simulation');
 for(const mode of ['auto','high'])assert.equal(run(intervals,{mode}).draws,intervals.length,mode+' mode must draw at display refresh');
}
const slow=run(Array(100).fill(100));
assert.equal(slow.draws,100,'slow callbacks draw once, without catch-up bursts');
const hidden=run([]);hidden.box.document.hidden=true;hidden.tick(1000);
assert.equal(hidden.box.lastGameplayDraw,0,'background callback does not consume render deadline');
console.log('Mobile frame pacing passed.');
