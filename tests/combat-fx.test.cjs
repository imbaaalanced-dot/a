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
// Verify the compact V2 art is a real 6x3 paletted PNG, not a source preview.
const png=fs.readFileSync(require('path').join(__dirname,'../dist/assets/hero/marcel-staff-fx-v2-32.png'));
assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
assert.equal(png.readUInt32BE(16),192);assert.equal(png.readUInt32BE(20),96);
assert.ok(png.length<12000,'mobile FX atlas stays small');

const requests=[],draws=[];
class HeroImage {
  naturalWidth=192;naturalHeight=96;
  set src(src){requests.push(src);this.onload?.();}
}
const spriteCtx={Image:HeroImage,Math};
vm.createContext(spriteCtx);
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/combat-fx.js'),'utf8'),spriteCtx);
const spriteFx=spriteCtx.DenkmalCombatFX;
const context=new Proxy({drawImage(...args){draws.push(args);}}, {get:(obj,key)=>key in obj?obj[key]:(()=>{})});
const wand={x:140,y:220,vx:560,vy:0,r:4,life:.95,color:'#83cfff',kind:'wand',heroShot:true,heroCharacter:'marcel'};
spriteFx.draw(context,wand,false,'marcel');
assert.equal(requests.length,1,'lazy FX request occurs on first Marcel shot');
assert.match(requests[0],/marcel-staff-fx-v2-32\.png/);
assert.equal(draws.length,1,'Marcel projectile uses atlas after decode');
assert.equal(draws[0][2],0,'auto-attack uses projectile row zero');
spriteFx.draw(context,wand,false,'marcel');assert.equal(requests.length,1,'warm asset is reused');
wand.heroCharacter='kim';const before=draws.length;spriteFx.draw(context,wand,false,'kim');
assert.equal(draws.length,before,'Kim keeps neutral projectile artwork');
wand.heroCharacter='marcel';
const impacts={particles:[]};
spriteFx.burst(impacts,wand,true,false,false);
const hit=impacts.particles.find(p=>p.ring);
assert.ok(hit,'Marcel hit has a visual-only V2 impact marker');
spriteFx.drawParticle(context,hit);
assert.equal(draws.at(-1)[2],64,'V2 impact uses atlas row two');
assert.equal(spriteFx.drawStaffFrame(context,0,0,1,.4,0,40),true,'Seelenruf row one is available for targeted cast');
assert.equal(draws.at(-1)[2],32,'Seelenruf projectile uses row one');

// Missing Image or failed decode must preserve the old procedural draw path.
const fallbackCtx={Math};vm.createContext(fallbackCtx);
vm.runInContext(fs.readFileSync(require('path').join(__dirname,'../dist/combat-fx.js'),'utf8'),fallbackCtx);
assert.equal(fallbackCtx.DenkmalCombatFX.drawStaffFrame(context,0,0,0,0),false);
fallbackCtx.DenkmalCombatFX.draw(context,wand,false,'marcel');

console.log('Marcel staff V2: PNG dimensions, lazy loading, actor isolation, three FX rows and fallbacks passed.');
console.log('Combat FX: gesture gating, mute, throttling, voice/particle caps and reduced motion passed.');
