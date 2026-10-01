const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
let starts=0, master;
const param=()=>({value:0,setValueAtTime(){},exponentialRampToValueAtTime(){}});
class AudioContext {
  state='running';currentTime=0;destination={};
  createGain(){const n={gain:param(),connect(){return this;},disconnect(){}};if(!master)master=n;return n;}
  createOscillator(){return {frequency:param(),connect(){return this;},disconnect(){},start(){starts++;},stop(){}};}
}
const c={AudioContext,Math};vm.createContext(c);vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/combat-fx.js'),'utf8'),c);
const fx=c.DenkmalCombatFX,g={particles:[]},b={x:0,y:0,kind:'cannon',color:'#ffaa00'};
fx.burst(g,b,false,true,false);assert.equal(starts,0,'no audio before gesture');
fx.unlock();fx.burst(g,b,false,false,false);assert.equal(starts,0,'mute suppresses new voices');
fx.burst(g,b,false,true,false);fx.burst(g,b,false,true,false);assert.equal(starts,1,'same sound throttled');
for(const kind of ['bow','magic','mage','rift','shrine','mortar','ballista','extra'])fx.burst(g,{...b,kind},false,true,false);
assert.equal(starts,8,'voice cap');fx.mute(true);assert.equal(master.gain.value,0);fx.mute(false);assert.equal(master.gain.value,.65);
for(let i=0;i<1000;i++)fx.burst(g,b,true,false,false);
assert.equal(g.particles.length,240,'bounded particles under sustained fire');
const low={particles:[]},normal={particles:[]};fx.burst(low,b,true,false,true);fx.burst(normal,b,true,false,false);assert.ok(low.particles.length<normal.particles.length);
assert.ok(g.particles.every(p=>p.life>0&&p.life===p.max));
console.log('Combat FX: gesture gating, mute, throttling, voice/particle caps and reduced motion passed.');
