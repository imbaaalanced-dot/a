'use strict';
// Exercise the production loop with controlled browser callback timestamps.
// Resetting the render clock to each callback loses fractional intervals and
// can halve a 60 FPS target on a jittery 60 Hz display.
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
 assert.ok(result.draws>=598&&result.draws<=601,'SPARMODUS must target 60 FPS without dropping scheduled frames');
 const uncapped=run(intervals,{mobile:false});
 assert.equal(uncapped.draws,intervals.length,'desktop draws every callback');
 assert.equal(result.updates,uncapped.updates,'60 FPS low rendering must not alter simulation');
 const auto=run(intervals,{mode:'auto'});
 assert.ok(auto.draws>=598&&auto.draws<=601,'AUTO must target 60 FPS even on 90/120 Hz displays');
 assert.equal(auto.updates,uncapped.updates,'60 FPS render cap must not alter simulation');
 assert.equal(run(intervals,{mode:'high'}).draws,intervals.length,'HIGH draws at display refresh');
}
const jittered=Array.from({length:600},(_,i)=>1000/60+(i%2?.8:-.8));
for(const mode of ['low','auto'])assert.ok(run(jittered,{mode}).draws>=598,mode+' must not halve 60 FPS on jitter');
const slow=run(Array(100).fill(100));
assert.equal(slow.draws,100,'slow callbacks draw once, without catch-up bursts');
const hidden=run([]);hidden.box.document.hidden=true;hidden.tick(1000);
assert.equal(hidden.box.lastGameplayDraw,0,'background callback does not consume render deadline');
console.log('Mobile frame pacing passed.');
