const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
const root=path.join(__dirname,'../dist'),elements=new Map(),listeners={},draws=[];
const context=new Proxy({drawImage(...args){draws.push(args);},createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})}, {get:(obj,key)=>obj[key]||(()=>{})});
function element(id){
  if(elements.has(id))return elements.get(id);
  const classes=new Set();
  const e={id,style:{},dataset:{},children:[],inert:false,disabled:false,textContent:'',firstElementChild:{style:{}},classList:{add(...cs){cs.forEach(c=>classes.add(c));},remove(...cs){cs.forEach(c=>classes.delete(c));},toggle(c,b){if(b===undefined)b=!classes.has(c);b?classes.add(c):classes.delete(c);},contains:c=>classes.has(c)},focus(){document.activeElement=this;},setAttribute(k,v){this[k]=v;},querySelector(){return element(id+'Button');},addEventListener(name,fn){this[name]=fn;},appendChild(b){this.children.push(b);},getBoundingClientRect:()=>({left:0,top:0,width:sandbox.innerWidth,height:sandbox.innerHeight}),getContext:()=>context};
  Object.defineProperty(e,'innerHTML',{set(v){this._html=v;this.children=[];},get(){return this._html||'';}});
  elements.set(id,e);return e;
}
element('heroVoice').play=function(){this.paused=false;return Promise.resolve();};
element('heroVoice').pause=function(){this.paused=true;};
let serial=0;
const document={getElementById:element,querySelectorAll:()=>[],querySelector:()=>null,createElement:()=>element('new'+serial++),addEventListener(name,fn){listeners[name]=fn;}};
const sandbox={document,Image:class{complete=true;naturalWidth=1280;naturalHeight=1280;},Audio:class{play(){return Promise.resolve();}pause(){}},innerWidth:1280,innerHeight:800,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame(){},matchMedia:q=>({matches:process.env.TEST_MOBILE==='1'&&q==='(pointer:coarse)'}),setTimeout:()=>1,clearTimeout(){},addEventListener(name,fn){listeners[name]=fn;},localStorage:{data:new Map(),getItem(k){return this.data.get(k)||null},setItem(k,v){this.data.set(k,v)}},Math,console};
sandbox.window=sandbox;sandbox.location={pathname:"/a/td2-v5-graphics-preview/"};
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'equipment-catalog.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'loot.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'persisted-state.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'hero-saga.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'combat-fx.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'style2-phase6.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'style2-markers.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'flight-enemies.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'hohensyburg.js'),'utf8'),sandbox);
let source=fs.readFileSync(path.join(root,'game.js'),'utf8');source=source.replace(/\}\)\(\);\s*$/,`globalThis.test={lootModel,drawMonument,towerLevelArt,enemySpecs,waveSize,enemyTypeForSpawn,waveComposition,wavePreview,wavePlan,applyWavePlan,targetModes,targetLabels,mainMenu,draw,drawTower,screenToWorld,towerTarget,projectileSynergy,updateEnemyPressure,bossPhaseLabel,placementPreview,threatIndicators,portraitLayout,zoomForMode,cameraLead,joystickVector,launchWave,simulationStepsPerFrame:typeof simulationStepsPerFrame==='function'?simulationStepsPerFrame:null,toggleSpeed:typeof toggleSpeed==='function'?toggleSpeed:null,startGame,update,spawnEnemy,shoot,selectTower,upgradeTower,sellTower,buildTower,towerPosition,placementError,buildContextActive,cycleTargetMode,pauseGame,resumeGame,dodge,resize,selectPerk,endWave,gameOver,hurtEnemy,nearest,segmentDistance,getPerks,openInventory,closeInventory,get zoom(){return zoom},get speedMultiplier(){return typeof speedMultiplier==='undefined'?1:speedMultiplier},get game(){return game},get state(){return state},get shake(){return shake},get hitStop(){return hitStop},set facing(v){facing=v},set moveIntent(v){moveIntent=v}};})();`);
vm.runInContext(source,sandbox);

const t=sandbox.test;
assert.equal(sandbox.DenkmalLevels.level4Completed,false);
assert.equal(t.lootModel.claimKirchendeCompletion(),true);
t.startGame(4);
assert.equal(t.game.level,4);
assert.equal(t.state,'playing');
// A second tab saves another milestone while this V5 preview is still open.
const tab={Math,localStorage:sandbox.localStorage,console};
vm.createContext(tab);
vm.runInContext(fs.readFileSync(path.join(root,'persisted-state.js'),'utf8'),tab);
vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),tab);
assert.equal(tab.DenkmalLevels.unlock(),true);
t.game.wave=16;t.endWave();
assert.equal(t.state,'levelcomplete','last Dorfkirche wave completes campaign');
assert.equal(sandbox.DenkmalLevels.level4Completed,true);
assert.equal(element('levelSaveNote').textContent,'Freischaltung und Beute gespeichert.');
const saved=JSON.parse(sandbox.localStorage.getItem('denkmal-progress-v2')).data;
assert.equal(saved.level2,true,'newer tab level2 is preserved');
assert.equal(saved.level4,true,'level4 is persisted despite stale original snapshot');
element('nextLevelBtn').onclick();
assert.equal(t.game.level,5,'the victory action must start Hohensyburg');
assert.equal(t.state,'playing');
t.mainMenu();
assert.equal(element('level5Btn').disabled,false,'level5 campaign card becomes available');

// Browser restart: same storage, fresh independent campaign model.
const reload={Math,localStorage:sandbox.localStorage,console};vm.createContext(reload);
vm.runInContext(fs.readFileSync(path.join(root,'persisted-state.js'),'utf8'),reload);
vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),reload);
assert.equal(reload.DenkmalLevels.level4Completed,true,'Hohensyburg unlock survives a reload');

// Corrupt progress must not be silently overwritten.
const corruptStore={data:new Map([['denkmal-progress-v2','{']]),getItem(k){return this.data.get(k)??null},setItem(k,v){this.data.set(k,v)}};
const corrupt={Math,localStorage:corruptStore};vm.createContext(corrupt);
vm.runInContext(fs.readFileSync(path.join(root,'persisted-state.js'),'utf8'),corrupt);
vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),corrupt);
assert.equal(corrupt.DenkmalLevels.completeLevel4(),false);
assert.equal(corruptStore.getItem('denkmal-progress-v2'),'{');
console.log('Dorfkirche wave 16 unlocks Hohensyburg on V5, survives competing tab and reload; corrupt saves remain protected.');
