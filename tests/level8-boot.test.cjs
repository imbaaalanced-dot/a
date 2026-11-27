const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
/* Level 8 boot regression: with the 20-wave planner loaded (as on the live
   page), DenkmalCampaign20.chapter(8) is null. startGame(8) must fall back to
   the level definition instead of throwing inside reset() (the "level 8
   freezes" bug). Run: node tests/level8-boot.test.cjs */
const root=path.join(__dirname,'../dist'),elements=new Map(),listeners={},draws=[];
const context=new Proxy({drawImage(...args){draws.push(args);},createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(obj,key)=>obj[key]||(()=>{})});
function element(id){
  if(elements.has(id))return elements.get(id);
  const classes=new Set();
  const e={id,style:{},dataset:{},children:[],inert:false,disabled:false,textContent:'',firstElementChild:{style:{}},classList:{add(...cs){cs.forEach(c=>classes.add(c));},remove(...cs){cs.forEach(c=>classes.delete(c));},toggle(c,b){if(b===undefined)b=!classes.has(c);b?classes.add(c):classes.delete(c);},contains:c=>classes.has(c)},focus(){document.activeElement=this;},setAttribute(k,v){this[k]=v;},getAttribute(k){return this[k]??null;},hasAttribute(k){return k==='inert'?this.inert!==false&&this.inert!==undefined:Object.hasOwn(this,k);},removeAttribute(k){if(k==='inert')this.inert=false;else delete this[k];},remove(){},querySelector(){return element(id+'Button');},addEventListener(name,fn){this[name]=fn;},appendChild(b){this.children.push(b);},getBoundingClientRect:()=>({left:0,top:0,width:sandbox.innerWidth,height:sandbox.innerHeight}),getContext:()=>context};
  Object.defineProperty(e,'innerHTML',{set(v){this._html=v;this.children=[];},get(){return this._html||'';}});
  elements.set(id,e);return e;
}
element('heroVoice').play=function(){this.paused=false;return Promise.resolve();};
element('heroVoice').pause=function(){this.paused=true;};
let serial=0;
const document={readyState:'complete',getElementById:element,querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>element('new'+serial++),addEventListener(name,fn){listeners[name]=fn;}};
const sandbox={document,Image:class{complete=true;naturalWidth=1280;naturalHeight=1280;set src(v){this._src=v;}get src(){return this._src;}decode(){return Promise.resolve();}},Audio:class{play(){return Promise.resolve();};pause(){}},innerWidth:1280,innerHeight:800,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame(){},matchMedia:q=>({matches:false,addEventListener(){},removeEventListener(){}}),setTimeout:()=>1,clearTimeout(){},addEventListener(name,fn){listeners[name]=fn;},localStorage:{data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)}},Math,console,navigator:{userAgent:'node',maxTouchPoints:0},history:{pushState(){},back(){},state:null},crypto:{randomUUID:()=>'test-uuid'}};
sandbox.window=sandbox;sandbox.location={pathname:process.env.TEST_PREVIEW?'/v4-style2/':'/a/',search:'',href:'http://localhost/v4-style2/'};
sandbox.localStorage.setItem('td2-developer-mode-v2','disabled');
vm.createContext(sandbox);
// Boot exactly the scripts the page loads, in page order.
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const scripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1].split('?')[0]);
for(const s of scripts)vm.runInContext(fs.readFileSync(path.join(root,s),'utf8'),sandbox,{filename:s});
assert.ok(sandbox.DenkmalCampaign20,'20-wave planner is loaded on the live page');
assert.equal(sandbox.DenkmalCampaign20.chapter(8),null,'planner has no chapter 8 (this is what used to throw)');
assert.ok(sandbox.DenkmalWittenHeven&&sandbox.DenkmalWittenHevenArt,'level 8 modules loaded');
let source=fs.readFileSync(path.join(root,'game.js'),'utf8');source=source.replace(/\}\)\(\);\s*$/,`globalThis.test={startGame,mainMenu,update,draw,endWave,selectPerk,getPerks,spawnEnemy,launchWave,get game(){return game},get state(){return state}};})();`);
vm.runInContext(source,sandbox);const t=sandbox.test;
if(!process.env.TEST_PREVIEW)sandbox.DenkmalLevels.completeLevel7();
t.startGame(8,'campaign');
assert.equal(t.game.level,8,'level 8 starts instead of throwing');
assert.equal(t.state,'playing');
assert.equal(t.game.wave,29,'falls back to the level definition firstWave (chapter(8) is null)');
assert.equal(t.game.waveTotal,40,'wave 29 opening count from DenkmalWittenHeven');
assert.equal(t.game.essence,360);
for(let i=0;i<120;i++){t.update(1/60);if(i%4===0)t.draw();}
assert.equal(t.state,'playing','update/draw pump survives level 8');
// Drive the four campaign waves to completion (deterministic: spawn directly,
// clear the field, then end the wave instead of waiting for combat resolution).
for(let w=29;w<=32;w++){
  let guard=0;
  while(t.state==='playing'&&t.game.wave===w&&guard++<200){
    t.game.hero.hp=t.game.hero.maxHp=1e9;t.game.monument.hp=t.game.monument.maxHp=1e9;
    t.game.enemies.forEach(e=>{e.dead=true;});
    if(t.game.waveSpawned<t.game.waveTotal){t.spawnEnemy();if(guard%10===0)t.update(1/60),t.draw();}
    else{t.game.waveKilled=t.game.waveTotal;t.endWave();}
  }
  assert.ok(guard<200,'wave '+w+' spawn drive terminates');
  if(t.state==='perk')t.selectPerk(t.getPerks()[0]);
  if(t.state==='levelcomplete')break;
}
assert.equal(t.state,'levelcomplete','wave 32 completes level 8');
assert.equal(t.game.wave,32);
// Boss wave renders without throwing.
t.startGame(8,'campaign');t.game.wave=32;t.game.waveTotal=60;t.spawnEnemy('boss');
for(let i=0;i<120;i++){t.game.hero.hp=1e9;t.game.monument.hp=1e9;t.update(1/60);t.draw();}
const boss=t.game.enemies.find(e=>e.type==='boss');
assert.ok(boss,'boss spawns on wave 32');
assert.ok(boss.maxHp>0);
console.log('Level 8 boot: startGame(8) works with the 20-wave planner loaded, waves 29-32 complete, boss renders');

// The primary completion action must lead from Westhofen into Witten.
if(!process.env.TEST_PREVIEW){
 t.startGame(7,'campaign');
 t.game.wave=sandbox.DenkmalCampaign20.chapter(7).lastWave;
 t.endWave();
 assert.equal(t.state,'levelcomplete');
 assert.equal(element('nextLevelBtn').textContent,'LEVEL 8 STARTEN');
 element('nextLevelBtn').onclick();
 assert.equal(t.game.level,8);
 assert.equal(t.game.mode,'campaign');
 assert.equal(t.game.wave,29);
}else{
 t.startGame(7,'campaign');
 t.game.wave=sandbox.DenkmalCampaign20.chapter(7).lastWave;
 t.endWave();
 assert.equal(element('nextLevelBtn').textContent,'WESTHOFEN ENDLOS');
 element('nextLevelBtn').onclick();
 assert.equal(t.game.level,7);
 assert.equal(t.game.mode,'endless');
}
console.log('Westhofen completion routes to Witten; locked preview keeps its endless fallback');
