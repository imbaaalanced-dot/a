/* Adaptive mobile canvas resolution: sustained frame rate, cooldown, recovery and pause. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../dist/game.js'),'utf8');
const start=source.indexOf('  function updateAdaptiveResolution(now){');
const end=source.indexOf('  function simulationStepsPerFrame()',start);
assert.ok(start>0&&end>start);
assert.match(source,/Math\.sqrt\(pixelBudget\/Math\.max\(1,W\*H\)\)\)\*\(graphicsMode==='auto'&&mobileRender\?adaptiveScale:1\)/);
let mobileRender=true,graphicsMode='auto',state='playing',adaptiveScale=1,adaptivePrevious=0,
 adaptiveWindowMs=0,adaptiveWindowFrames=0,adaptiveLastChange=0,adaptiveFastWindows=0,resizeCalls=0;
const document={hidden:false};
const stateBundle={mobileRender,graphicsMode,state,adaptiveScale,adaptivePrevious,
 adaptiveWindowMs,adaptiveWindowFrames,adaptiveLastChange,adaptiveFastWindows,document,resize(){resizeCalls++;}};
vm.createContext(stateBundle);
vm.runInContext(source.slice(start,end)+';this.tick=updateAdaptiveResolution;',stateBundle);
function frames(startTime,interval,count){
 let now=startTime;
 for(let i=0;i<count;i++){now+=interval;stateBundle.tick(now);}
 return now;
}
let now=frames(1000,1000/30,130);
assert.equal(stateBundle.adaptiveScale,.85,'sustained 30fps lowers scale one step');
assert.equal(resizeCalls,1,'one canvas resize');
now=frames(now,1000/30,130);
assert.equal(stateBundle.adaptiveScale,.85,'cooldown avoids repeated rapid resize');
now=frames(now,1000/30,400);
assert.equal(stateBundle.adaptiveScale,.7,'slow hardware uses floor .7');
now=frames(now,1000/30,500);
assert.equal(stateBundle.adaptiveScale,.7,'never shrink below minimum');
now=frames(now,1000/60,1500);
assert.equal(stateBundle.adaptiveScale,.85,'long stable 60fps recovers a step');
stateBundle.document.hidden=true;
now=frames(now,1000/30,350);
assert.equal(stateBundle.adaptiveScale,.85,'hidden tab cannot trigger downgrade');
stateBundle.document.hidden=false;
stateBundle.graphicsMode='high';
now=frames(now,1000/30,350);
assert.equal(stateBundle.adaptiveScale,.85,'manual settings bypass adaptation');
stateBundle.graphicsMode='auto';
stateBundle.state='paused';
now=frames(now,1000/30,350);
assert.equal(stateBundle.adaptiveScale,.85,'pause bypasses adaptation');
console.log('Adaptive resolution: slow frames, cooldown, floor, recovery, hidden/manual/paused checks passed.');
