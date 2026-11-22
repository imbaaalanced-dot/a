const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.join(__dirname,'../dist'),elements=new Map(),listeners={},draws=[];
const context=new Proxy({drawImage(...args){draws.push(args);},createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(obj,key)=>obj[key]||(()=>{})});
function element(id){
  if(elements.has(id))return elements.get(id);
  const classes=new Set();
  const e={id,style:{},dataset:{},children:[],inert:false,disabled:false,textContent:'',firstElementChild:{style:{}},classList:{add(...cs){cs.forEach(c=>classes.add(c));},remove(...cs){cs.forEach(c=>classes.delete(c));},toggle(c,b){if(b===undefined)b=!classes.has(c);b?classes.add(c):classes.delete(c);},contains:c=>classes.has(c)},focus(){document.activeElement=this;},setAttribute(k,v){this[k]=v;},querySelector(selector){return element(id+':'+selector);},addEventListener(name,fn){this[name]=fn;},appendChild(b){this.children.push(b);},replaceChildren(...children){this.children=children;},getBoundingClientRect:()=>({left:0,top:0,width:sandbox.innerWidth,height:sandbox.innerHeight}),getContext:()=>context};
  Object.defineProperty(e,'innerHTML',{set(v){this._html=v;this.children=[];},get(){return this._html||'';}});
  elements.set(id,e);return e;
}
element('heroVoice').play=function(){this.paused=false;return Promise.resolve();};
element('heroVoice').pause=function(){this.paused=true;};
let serial=0;
const document={getElementById:element,querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>element('new'+serial++),addEventListener(name,fn){listeners[name]=fn;}};
/* Publish gate observed a one-off flake: the „Gegnertod“ sound batch assertion
   failed in publish run 44965371487 (2026-11-22) while the identical battery on
   the same merge commit passed in the Test workflow. Root cause class: the
   vm context falls back to the host’s wall-clock Date and unseeded
   Math.random (runId/Portal-Seed/loot dice/particles). Pin both so this
   battery is a pure function of the checked-out source and reproducible on
   every runner and every retry. */
const rngState={s:0x9e3779b9^(0x20261121|0)};
const seededRandom=()=>{rngState.s|=0;rngState.s=(rngState.s+0x6d2b79f5)|0;let t=Math.imul(rngState.s^(rngState.s>>>15),1|rngState.s);t=(t+Math.imul(t^(t>>>7),61|t))^t;return((t^(t>>>14))>>>0)/4294967296;};
class FixedDate extends Date{constructor(){super(0);}static now(){return 0;}}
const SeededMath=Object.create(Math,{});SeededMath.random=seededRandom;
const sandbox={document,Image:class{complete=true;naturalWidth=1280;naturalHeight=1280;set src(value){this._src=value;if(value.includes('assets/enemies/walk-style2.webp')){this.naturalWidth=640;this.naturalHeight=3360;}}get src(){return this._src;}},Audio:class{play(){return Promise.resolve();}pause(){}},innerWidth:1280,innerHeight:800,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame(){},matchMedia:q=>({matches:process.env.TEST_MOBILE==='1'&&q==='(pointer:coarse)'}),setTimeout:()=>1,clearTimeout(){},addEventListener(name,fn){listeners[name]=fn;},localStorage:{data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)}},Math:SeededMath,Date:FixedDate,console};
sandbox.window=sandbox;
sandbox.TD2DeveloperMode=true;
sandbox.localStorage.setItem('td2_developer_mode_enabled','true');
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'equipment-catalog.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'loot.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'persisted-state.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'hero-saga.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'barracks.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'combat-fx.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'style2-phase6.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'style2-markers.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'flight-enemies.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'directional-actions-v410.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'enemy-animations.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'touch-context-hud.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'goethestrasse.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'westhofen.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'hohensyburg.js'),'utf8'),sandbox);
let source=fs.readFileSync(path.join(root,'game.js'),'utf8');source=source.replace(/\}\)\(\);\s*$/,`globalThis.test={lootModel,drawMonument,enemySpecs,waveSize,enemyTypeForSpawn,waveComposition,wavePreview,wavePlan,applyWavePlan,targetModes,targetLabels,mainMenu,draw,drawTower,screenToWorld,towerTarget,projectileSynergy,updateEnemyPressure,bossPhaseLabel,placementPreview,threatIndicators,portraitLayout,zoomForMode,cameraLead,openingCameraBias,joystickVector,launchWave,simulationStepsPerFrame:typeof simulationStepsPerFrame==='function'?simulationStepsPerFrame:null,toggleSpeed:typeof toggleSpeed==='function'?toggleSpeed:null,startGame,update,spawnEnemy,shoot,selectTower,upgradeTower,sellTower,buildTower,towerPosition,placementError,buildContextActive,cycleTargetMode,pauseGame,resumeGame,dodge,resize,selectPerk,endWave,gameOver,hurtEnemy,nearest,segmentDistance,getPerks,openInventory,closeInventory,get zoom(){return zoom},get speedMultiplier(){return typeof speedMultiplier==='undefined'?1:speedMultiplier},get game(){return game},get state(){return state},get shake(){return shake},get hitStop(){return hitStop},set facing(v){facing=v},set moveIntent(v){moveIntent=v}};})();`);
source=source.replace('lootModel,drawMonument,','lootModel,drawMonument,drawEnemy,');
source=source.replace('lootModel,drawMonument,drawEnemy,','lootModel,completeLevel,drawMonument,drawEnemy,');
vm.runInContext(source,sandbox);
assert.equal(sandbox.DenkmalTestHooks.getDeveloperMode(),false,'a new player starts in normal campaign mode');
assert.equal(element('menuDeveloperBtn')['aria-pressed'],'false');
element('menuOptionsBtn').onclick();element('menuDeveloperBtn').onclick();
assert.equal(sandbox.localStorage.getItem('td2-developer-mode-v2'),'enabled');
vm.runInContext(source,sandbox);
assert.equal(sandbox.DenkmalTestHooks.getDeveloperMode(),true,'explicitly enabled developer mode survives a reload');
assert.equal(element('menuDeveloperBtn')['aria-pressed'],'true');
element('menuOptionsBtn').onclick();element('menuDeveloperBtn').onclick();
assert.equal(sandbox.localStorage.getItem('td2-developer-mode-v2'),'disabled');
vm.runInContext(source,sandbox);
assert.equal(sandbox.DenkmalTestHooks.getDeveloperMode(),false,'explicitly disabled mode survives a reload');
assert.equal(element('menuDeveloperBtn')['aria-pressed'],'false');
const t=sandbox.test,saga=sandbox.HeroSaga;
/* Audio game flow: every named sfx must fire inside the real game loop, not just exist.
   Each expect() consumes one interaction batch and requires its exact sound set. */
const realSfx=sandbox.DenkmalCombatFX.sfx, played=[];
sandbox.DenkmalCombatFX.sfx=name=>{played.push(name);try{return realSfx(name);}catch{}};
let mark=0;
function expect(sounds,label){
  const batch=played.slice(mark);mark=played.length;
  assert.deepEqual([...batch].sort(),[...sounds].sort(),label||'sound batch');
}

// Spielstart: Menüstart schlägt den Start-Akkord an.
t.startGame(1);saga.continueStory();
expect(['gameStart'],'Spielstart');

// Turmbau/Aufwerten/Verkaufen am festen Bauplatz.
const slot=sandbox.DenkmalLevels.levels[1].slots[0];
t.game.hero.x=slot.x-58;t.game.hero.y=slot.y;t.facing={x:1,y:0};
t.selectTower('bow');t.buildTower();
assert.equal(t.game.towers.length,1);
expect(['towerBuild'],'Turmbau');
t.game.essence=200;t.upgradeTower();
assert.equal(t.game.towers[0].level,2);
expect(['towerUpgrade'],'Aufwerten');
t.sellTower();
assert.equal(t.game.towers.length,0);
expect(['towerSell'],'Verkauf');

// Ausweichen und Wellenstart.
t.dodge();
expect(['dodge'],'Ausweichrolle');
t.launchWave();
expect(['waveLaunch'],'Wellenstart');

// Gegnertod über den Kampf-Hook.
t.spawnEnemy();const e0=t.game.enemies[0];
t.hurtEnemy(e0,1e4,{fixedDamage:true,bypassShield:true});
expect(['enemyDie'],'Gegnertod');

// Beute-Aufnahme im Update-Pfad.
t.game.loot=[{x:t.game.hero.x,y:t.game.hero.y,r:5,life:1,vx:0,vy:0,kind:'essence'}];
t.update(.02);
expect(['lootPickup'],'Essenz am Helden');

// Heldentreffer durch Nahkampf-Gegner.
t.startGame(2);t.launchWave();t.spawnEnemy();const e1=t.game.enemies[0],h=t.game.hero;
e1.type='wraith';e1.focusMonument=false;e1.attackRange=0;e1.damage=10;e1.attackCd=1;e1.attackCooldown=.85;e1.hp=e1.maxHp=1e4;
h.x=e1.x+10;h.y=e1.y;h.invuln=0;h.fireCd=100;
t.update(.005);
expect([],'kein Sound vor dem ersten Treffer');
h.invuln=0;e1.attackCd=0;h.x=e1.x+10;h.y=e1.y;t.update(.02);
assert.ok(h.hp<t.game.hero.maxHp,'Gegner muss den Held getroffen haben');
expect(['heroHurt'],'Heldentreffer');

// Monument-Treffer am Pfadende.
sandbox.DenkmalLevels.advance(e1,1000);
h.x=e1.x+500;h.y=e1.y+500;e1.attackCd=0;
const mHp=t.game.monument.hp;t.update(.02);
assert.ok(t.game.monument.hp<mHp,'Gegner muss das Monument getroffen haben');
expect(['monumentHit'],'Monument-Treffer');

// Bosswelle: Spawn-Horn, Kill und Bossbeute in einem Batch.
t.startGame(1);saga.continueStory();
t.game.wave=5;t.spawnEnemy();t.spawnEnemy();
const boss=t.game.enemies.find(x=>x.type==='boss');
assert.ok(boss,'Welle 5 muss einen Boss enthalten');
expect(['gameStart','bossSpawn'],'Startakkord plus Boss-Horn');
t.hurtEnemy(boss,99999,{fixedDamage:true,bypassShield:true});
t.hurtEnemy(boss,99999,{fixedDamage:true,bypassShield:true});
assert.equal(boss.dead,true,'Boss muss besiegt sein');
expect(['enemyDie','bossLoot'],'Boss-Kill mit Beute-Anspruch');

// Wellenabschluss -> Perk-Screen; Levelabschluss -> Sieg-Fanfare.
t.startGame(1);saga.continueStory();
t.game.loot=[{},{}];t.endWave();
assert.equal(t.state,'perk');
expect(['gameStart','waveCleared'],'Wellenabschluss');
t.selectPerk({name:'Test',apply(){}});
assert.equal(t.state,'playing');
expect([],'Perk-Wahl bleibt still');
t.game.wave=5;t.endWave();
assert.equal(t.state,'levelcomplete');
expect(['victory'],'Kapitelabschluss');

// Niederlage.
t.startGame(1);saga.continueStory();
t.game.hero.hp=0;t.gameOver();
assert.equal(t.state,'gameover');
expect(['gameStart','defeat'],'Niederlage');

// UI-Sounds: Lautstärke- und Ton-Schalter.
element('volumeBtn').onclick();
expect(['uiClick'],'Lautstärke-Stufe');
element('soundBtn').onclick();
expect([],'Ton aus bleibt still');
element('soundBtn').onclick();
expect(['uiToggle'],'Ton an');

assert.equal(played.length,mark,'keine unkodierten Zusatzsounds');
console.log('Audio-Game-Flow: 18 Sound-Ereignisse im echten Spielverlauf verifiziert (gameStart, waveLaunch, bossSpawn, bossLoot, enemyDie, towerBuild, towerUpgrade, towerSell, waveCleared, victory, defeat, monumentHit, heroHurt, lootPickup, dodge, uiClick, uiToggle + Ruhe-Batches).');
