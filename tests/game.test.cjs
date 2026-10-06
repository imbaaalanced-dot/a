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
const sandbox={document,Image:class{complete=true;naturalWidth=1280;naturalHeight=1280;},Audio:class{play(){return Promise.resolve();}pause(){}},innerWidth:1280,innerHeight:800,devicePixelRatio:1,performance:{now:()=>0},requestAnimationFrame(){},matchMedia:q=>({matches:process.env.TEST_MOBILE==='1'&&q==='(pointer:coarse)'}),setTimeout:()=>1,clearTimeout(){},addEventListener(name,fn){listeners[name]=fn;},localStorage:{getItem:()=> 'off',setItem(){}},Math,console};
sandbox.window=sandbox;
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'hero-saga.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'combat-fx.js'),'utf8'),sandbox);
let source=fs.readFileSync(path.join(root,'game.js'),'utf8');source=source.replace(/\}\)\(\);\s*$/,`globalThis.test={towerLevelArt,enemySpecs,waveSize,enemyTypeForSpawn,waveComposition,wavePreview,wavePlan,applyWavePlan,precisionMultiplier:typeof precisionMultiplier==='function'?precisionMultiplier:null,buildSynergyMultiplier:typeof buildSynergyMultiplier==='function'?buildSynergyMultiplier:null,enemyReadabilityStyle:typeof enemyReadabilityStyle==='function'?enemyReadabilityStyle:null,targetModes,targetLabels,mainMenu,draw,drawTower,screenToWorld,towerTarget,projectileSynergy,updateEnemyPressure,bossPhaseLabel,placementPreview,threatIndicators,portraitLayout,zoomForMode,cameraLead,joystickVector,launchWave,startGame,update,spawnEnemy,shoot,selectTower,upgradeTower,sellTower,buildTower,towerPosition,placementError,buildContextActive,cycleTargetMode,pauseGame,resumeGame,dodge,resize,selectPerk,endWave,gameOver,hurtEnemy,nearest,segmentDistance,getPerks,openInventory,closeInventory,pickupItem,get zoom(){return zoom},get game(){return game},get state(){return state},get shake(){return shake},get hitStop(){return hitStop},set facing(v){facing=v},set moveIntent(v){moveIntent=v}};})();`);
vm.runInContext(source,sandbox);const t=sandbox.test,saga=sandbox.HeroSaga;
const tests=[];function check(name,fn){t.startGame();saga.continueStory();fn();tests.push(name);}
check('Prologue freezes combat and resumes exactly once',()=>{t.startGame();assert.equal(t.state,'story');t.update(2);assert.equal(t.game.elapsed,0);saga.continueStory();assert.equal(t.state,'playing');saga.continueStory();assert.equal(t.game.wave,1);});
check('Start resources and clean restart',()=>{assert.equal(t.game.essence,70);assert.equal(t.game.wave,1);assert.equal(t.state,'playing');assert.equal(t.game.hero.soul,100);});
check('Level 1 uses fixed build pads and rejects occupied or off-pad placement',()=>{const slot=sandbox.DenkmalLevels.levels[1].slots[0];t.game.hero.x=slot.x-58;t.game.hero.y=slot.y;t.facing={x:1,y:0};assert.equal(t.buildContextActive(),true);t.buildTower();assert.equal(t.game.towers.length,1);assert.equal(t.game.essence,45);t.game.essence=100;t.buildTower();assert.equal(t.game.towers.length,1);t.game.hero.x=3060;t.game.hero.y=3060;t.buildTower();assert.equal(t.game.towers.length,1);assert.equal(t.game.essence,100);});
check('Pause freezes simulation and clears held movement',()=>{listeners.keydown({code:'KeyD'});t.pauseGame();const x=t.game.hero.x;t.update(10);assert.equal(t.game.elapsed,0);assert.equal(t.game.hero.x,x);t.resumeGame();t.update(.01);assert.equal(t.game.hero.x,x);});
check('Movement and dodge work; repeat cannot spend twice',()=>{const x=t.game.hero.x;listeners.keydown({code:'ArrowRight',preventDefault(){}});t.update(.02);assert.ok(t.game.hero.x>x);listeners.keyup({code:'ArrowRight'});t.dodge();const x2=t.game.hero.x;t.update(.02);assert.ok(t.game.hero.x>x2);const cd=t.game.hero.dodgeCd;t.dodge();assert.equal(t.game.hero.dodgeCd,cd);});
check('Lost focus pauses',()=>{listeners.blur();assert.equal(t.state,'paused');});
check('Wave loot and perk apply once',()=>{t.game.loot=[{},{}];t.endWave();t.endWave();assert.equal(t.game.essence,78);let n=0;const perk={name:'Test',apply(){n++;}};t.selectPerk(perk);t.selectPerk(perk);assert.equal(t.game.wave,2);assert.equal(n,1);assert.equal(t.game.loot.length,0);});
check('Dead enemies cannot award duplicate kills or soul charge',()=>{const e={x:0,y:0,hp:1};t.game.enemies=[e];t.game.hero.soul=0;t.hurtEnemy(e,5);t.hurtEnemy(e,5);assert.equal(t.game.kills,1);assert.equal(t.game.hero.soul,8);assert.equal(t.nearest({x:0,y:0},100),null);});
check('Fast bullets detect targets between frames',()=>{assert.equal(t.segmentDistance({x:50,y:3},{prevX:0,prevY:0,x:100,y:0}),3);});
check('Correct defeat cause and completed waves',()=>{t.game.hero.hp=0;t.gameOver();assert.equal(element('gameoverTitle').textContent,'DER HÜTER IST GEFALLEN');assert.match(element('gameoverStats').textContent,/0 Wellen überstanden/);});
check('Arsenal exposes four production tower roles while experimental towers stay disabled',()=>{
  const slot=sandbox.DenkmalLevels.levels[1].slots[1];t.game.hero.x=slot.x-58;t.game.hero.y=slot.y;t.facing={x:1,y:0};t.game.essence=300;
  for(const kind of ['bow','cannon','mage','rift']){t.selectTower(kind);assert.equal(t.game.selectedTower,kind);}
  t.selectTower('ballista');assert.equal(t.game.selectedTower,'rift');
  t.selectTower('cannon');t.buildTower();assert.equal(t.game.towers[0].kind,'cannon');
  t.upgradeTower();t.upgradeTower();assert.equal(t.game.towers[0].level,3);t.upgradeTower();
  t.pauseGame();t.sellTower();assert.equal(t.game.towers.length,1);t.resumeGame();t.sellTower();assert.equal(t.game.towers.length,0);
});
check('Wave 5 contains exactly one vertical-slice boss and one reward',()=>{t.game.wave=5;t.spawnEnemy();t.spawnEnemy();assert.equal(t.game.enemies.filter(e=>e.type==='boss').length,1);const boss=t.game.enemies[0];t.hurtEnemy(boss,99999);t.hurtEnemy(boss,99999);assert.equal(t.game.essence,105);assert.equal(t.game.loot.length,9);});
check('Resize preserves world positions without interrupting play',()=>{t.game.towers=[{x:200,y:300}];sandbox.innerWidth=640;sandbox.innerHeight=400;t.resize(false);assert.equal(t.state,'playing');assert.equal(t.game.towers[0].x,200);});
check('Wardrobe freezes combat and enforces unlocks',()=>{const h=t.game.hero;saga.openCharacter();assert.equal(t.state,'character');t.update(3);assert.equal(t.game.elapsed,0);assert.equal(saga.equip('weapon','echo'),false);assert.equal(h.equipment.weapon,'ember');saga.closeCharacter();assert.equal(t.state,'playing');});
check('Equipment modifiers never stack or reset earned base upgrades',()=>{const h=t.game.hero;h.damage=26;t.game.wave=8;saga.openCharacter();for(let i=0;i<5;i++){saga.equip('weapon','echo');saga.equip('weapon','ember');}assert.equal(h.damage,26);assert.equal(saga.stats(h).damage,32.5);saga.equip('armor','ash');assert.equal(saga.stats(h).speed,246);saga.closeCharacter();t.dodge();assert.ok(Math.abs(h.dodgeCd-.84)<.0001);});
check('Armor reduces incoming damage and does not heal on equip',()=>{const h=t.game.hero;saga.damage(20);assert.equal(h.hp,85);t.game.wave=3;saga.openCharacter();saga.equip('armor','ash');saga.equip('armor','oath');assert.equal(h.hp,85);saga.closeCharacter();});
check('Soul call has bounded range heal and resource use',()=>{const h=t.game.hero;h.hp=50;const near={x:h.x+80,y:h.y,hp:1000,r:12},far={x:h.x+400,y:h.y,hp:1000,r:12};t.game.enemies=[near,far];assert.equal(saga.unleash(),true);assert.ok(near.hp<1000);assert.equal(far.hp,1000);assert.equal(h.hp,75);assert.equal(h.soul,0);assert.equal(saga.unleash(),false);saga.update(.6,false,{x:1,y:0});assert.ok(t.game.bullets.length>=1);});
check('Soul call cannot trigger in pause or wardrobe',()=>{t.pauseGame();assert.equal(saga.unleash(),false);assert.equal(t.game.hero.soul,100);t.resumeGame();saga.openCharacter();assert.equal(saga.unleash(),false);});
check('Story milestones pause and never repeat; epilogue after wave 15',()=>{t.game.wave=3;t.endWave();t.selectPerk({name:'Test',apply(){}});assert.equal(t.state,'story');assert.match(element('storyTitle').textContent,/Siegel/);saga.continueStory();assert.equal(saga.chapter(4),false);t.game.wave=15;t.endWave();t.selectPerk({name:'Test',apply(){}});assert.equal(t.state,'story');assert.match(element('storyTitle').textContent,/Erinnerung/);saga.continueStory();assert.equal(t.state,'playing');assert.equal(element('sagaComplete').classList.contains('hidden'),false);});
check('Lantern guardian uses the directional sprite atlas',()=>{draws.length=0;const h=t.game.hero;saga.draw(context,h);let draw=draws.find(d=>d[0].src?.endsWith('marcel-lantern-sprite-v1.webp'));assert.ok(draw);assert.equal(h.direction,'down');draws.length=0;saga.update(.24,true,{x:0,y:-1});assert.equal(h.direction,'up');saga.draw(context,h);draw=draws.find(d=>d[0].src?.endsWith('marcel-lantern-sprite-v1.webp'));assert.ok(draw);assert.equal(draw[1],0);assert.equal(draw[2],0);draws.length=0;saga.update(.24,true,{x:1,y:0});assert.equal(h.direction,'right');saga.draw(context,h);draw=draws.find(d=>d[0].src?.endsWith('marcel-lantern-sprite-v1.webp'));assert.ok(draw);assert.equal(draw[1],128);assert.equal(draw[2],128);});
check('Marcels dialogue replaces the old character and respects mute',()=>{assert.match(saga.lines.intro,/Marcel/);assert.equal(Object.values(saga.lines).some(s=>s.includes('Kael')),false);t.startGame();element('soundBtn').onclick();element('voiceBtn').onclick();saga.continueStory();assert.equal(t.state,'playing');element('soundBtn').onclick();});
check('Four fixed gates ignore hero position and viewport',()=>{
  t.game.hero.x=120;t.game.hero.y=200;
  for(let i=0;i<8;i++)t.spawnEnemy();
  t.game.enemies.forEach((e,i)=>{const gate=sandbox.DenkmalLevels.levels[1].gates[i%4];assert.equal(e.x,gate.x);assert.equal(e.y,gate.y);});
});
check('Level 2 is locked before completing the fifth wave',()=>{
  t.startGame(2);assert.equal(t.game.level,1);
});
check('Wave 5 unlocks level 2 once and returns to main menu',()=>{
  t.game.wave=5;t.endWave();assert.equal(t.state,'levelcomplete');
  assert.equal(sandbox.DenkmalLevels.unlocked,true);t.endWave();assert.equal(t.state,'levelcomplete');
  t.mainMenu();assert.equal(t.state,'start');assert.equal(element('level2Btn').disabled,false);
  t.startGame(2);assert.equal(t.game.level,2);assert.equal(t.game.wave,6);assert.equal(t.game.essence,130);assert.equal(t.game.maxTowers,6);
});
check('Maze follows corners without being attracted to hero',()=>{
  t.startGame(2);t.launchWave();t.spawnEnemy();const e=t.game.enemies[0];
  t.game.hero.x=e.x;t.game.hero.y=e.y+250;t.update(.02);
  const path=sandbox.DenkmalLevels.levels[2].paths[0];assert.equal(e.y,path[0].y);assert.ok(e.x>path[0].x);
  sandbox.DenkmalLevels.advance(e,1000);assert.equal(e.waypoint,path.length);assert.equal(e.x,t.game.monument.x);assert.equal(e.y,t.game.monument.y);
  const hp=t.game.monument.hp;t.update(.02);assert.ok(t.game.monument.hp<hp);
});
check('Maze permits only empty road-side slots and refunds on sale',()=>{
  t.startGame(2);assert.notEqual(t.placementError({x:250,y:250}),'');
  const slot=sandbox.DenkmalLevels.levels[2].slots[0];assert.equal(t.placementError(slot),'');
  t.game.hero.x=slot.x-58;t.game.hero.y=slot.y;t.facing={x:1,y:0};t.buildTower();
  assert.equal(t.game.towers.length,1);assert.equal(t.game.towers[0].x,slot.x);
  t.buildTower();assert.equal(t.game.towers.length,1);t.sellTower();assert.equal(t.game.towers.length,0);
  for(const p of sandbox.DenkmalLevels.levels[2].slots)assert.ok(sandbox.DenkmalLevels.pathDistance(p,sandbox.DenkmalLevels.levels[2].paths[0])>=70);
});
check('Level 2 build HUD appears only at a valid free slot',()=>{
  sandbox.DenkmalLevels.unlock();t.startGame(2);
  t.game.hero.x=250;t.game.hero.y=250;t.facing={x:1,y:0};assert.equal(t.buildContextActive(),false);
  const slot=sandbox.DenkmalLevels.levels[2].slots[0];t.game.hero.x=slot.x-58;t.game.hero.y=slot.y;t.facing={x:1,y:0};assert.equal(t.buildContextActive(),true);
  t.buildTower();assert.equal(t.buildContextActive(),false);
});
check('First eight waves use explicit vertical-slice sizes',()=>{
  assert.deepEqual([1,2,3,4,5,6,7,8].map(t.waveSize),[7,9,11,14,16,18,21,24]);
});
check('Wave 7 exposes all six normal enemy roles',()=>{
  t.game.wave=7;t.game.waveSpawned=0;t.game.enemies=[];
  for(let i=0;i<6;i++)t.spawnEnemy();
  assert.equal(new Set(t.game.enemies.map(e=>e.type)).size,6);
  for(const kind of ['wraith','runner','brute','archer','guardian','sapper'])assert.ok(t.game.enemies.some(e=>e.type===kind),kind);
});
check('Guardian armor reduces damage and mage slow reduces movement',()=>{
  const armored={x:0,y:0,hp:100,maxHp:100,r:12,type:'guardian',armor:.32,hit:0};t.game.enemies=[armored];const oldRandom=sandbox.Math.random;sandbox.Math.random=()=>.5;t.hurtEnemy(armored,10);sandbox.Math.random=oldRandom;assert.ok(Math.abs(armored.hp-93.2)<1e-9);
  const e={x:300,y:300,hp:100,maxHp:100,r:12,type:'wraith',armor:0,hit:0,dead:false,slow:0,slowFactor:1,speed:60,damage:0,attackCd:99,attackCooldown:.85,gateIndex:0,waypoint:1};
  t.game.enemies=[e];t.shoot({x:200,y:300,kind:'mage',level:1},e,1,500,'#69bfff',{slow:.58,slowDuration:1.6});for(let i=0;i<15;i++)t.update(.02);assert.ok(e.slow>0);assert.ok(e.slowFactor<=.58);
});
check('Slowed targets amplify cannon impact/splash damage and Rift chain count',()=>{
  const target={slow:1};const cannon=t.projectileSynergy({kind:'cannon',splash:64},target),rift=t.projectileSynergy({kind:'rift',chain:2},target),plain=t.projectileSynergy({kind:'cannon',splash:64},{slow:0});
  assert.equal(cannon.impact,1.25);assert.equal(cannon.splash,64);assert.ok(cannon.splashFactor>plain.splashFactor);assert.equal(rift.chain,3);
});
check('Synergy expires with slow and does not amplify unrelated projectiles',()=>{
  for(const slow of [0,-1,undefined]){
    const cannon=t.projectileSynergy({kind:'cannon',splash:64},{slow});
    assert.equal(cannon.impact,1);assert.equal(cannon.splashFactor,.58);
    assert.equal(t.projectileSynergy({kind:'rift',chain:2},{slow}).chain,2);
  }
  const bow=t.projectileSynergy({kind:'bow'},{slow:1});
  assert.equal(bow.impact,1);assert.equal(bow.splash,0);assert.equal(bow.chain,0);
  assert.equal(t.projectileSynergy({kind:'cannon',splash:64},{slow:1}).splashFactor,.725);
});
check('All target modes exclude dead and out-of-range enemies; boss falls back to first',()=>{
  const m=t.game.monument,tower={x:m.x+200,y:m.y,range:200};
  const first={x:m.x+50,y:m.y,hp:10},near={x:m.x+180,y:m.y,hp:50};
  const dead={x:tower.x,y:tower.y,hp:999,type:'boss',dead:true},outside={x:m.x-20,y:m.y,hp:999,type:'boss'};
  t.game.enemies=[dead,outside,near,first];
  for(const [mode,want] of [['first',first],['strongest',near],['nearest',near],['boss',first]]){tower.targetMode=mode;assert.equal(t.towerTarget(tower),want);}
  t.game.enemies=[dead,outside];for(const mode of ['first','strongest','nearest','boss']){tower.targetMode=mode;assert.equal(t.towerTarget(tower),null);}
});
check('Placement guards reject unsafe authored slots without spending essence',()=>{
  const level=sandbox.DenkmalLevels.levels[1],slots=level.slots,paths=level.paths,m=t.game.monument;
  try{
    // Exercise each safety guard even if future level content accidentally marks an unsafe slot.
    level.paths=[];
    for(const p of [level.gates[0],{x:27,y:500},{x:3045,y:500},{x:500,y:27},{x:500,y:3045},{x:m.x+100,y:m.y}]){
      level.slots=[p];assert.notEqual(t.placementError(p),'');
    }
    level.slots=slots;level.paths=paths;
    const p=slots[0];assert.equal(t.placementError(p),'');t.game.towers=[{...p}];assert.notEqual(t.placementError(p),'');
    t.game.hero.x=p.x-58;t.game.hero.y=p.y;t.facing={x:1,y:0};const essence=t.game.essence;t.buildTower();assert.equal(t.game.essence,essence);assert.equal(t.game.towers.length,1);
  }finally{level.slots=slots;level.paths=paths;}
});
check('Wave preview summarizes the authored enemy composition',()=>{
  assert.equal(t.wavePreview(1),'7× GEIST');
  const w7=t.waveComposition(7);assert.equal(Object.values(w7).reduce((a,b)=>a+b,0),21);assert.equal(Object.keys(w7).length,6);
  t.game.intermission=5;t.update(.01);assert.match(element('wavePreview').textContent,/VORSCHAU/);
});
check('Tower target priority cycles first strongest nearest boss',()=>{
  const m=t.game.monument,tower={x:m.x+300,y:m.y,range:500,targetMode:'first'};
  const first={x:m.x+40,y:m.y,hp:20,maxHp:20,type:'wraith',gateIndex:0,waypoint:1},strong={x:m.x+180,y:m.y,hp:120,maxHp:120,type:'brute',gateIndex:0,waypoint:1},near={x:tower.x-20,y:tower.y+10,hp:30,maxHp:30,type:'runner',gateIndex:0,waypoint:1},boss={x:m.x+220,y:m.y,hp:200,maxHp:200,type:'boss',gateIndex:0,waypoint:1};
  t.game.enemies=[first,strong,near,boss];assert.equal(t.towerTarget(tower),first);tower.targetMode='strongest';assert.equal(t.towerTarget(tower),boss);tower.targetMode='nearest';assert.equal(t.towerTarget(tower),near);tower.targetMode='boss';assert.equal(t.towerTarget(tower),boss);
  t.game.towers=[tower];t.game.hero.x=tower.x;t.game.hero.y=tower.y;tower.targetMode='first';t.cycleTargetMode();assert.equal(tower.targetMode,'strongest');t.cycleTargetMode();assert.equal(tower.targetMode,'nearest');
});
check('Placement preview reports selected tower range and role only near a free pad',()=>{
  const slot=sandbox.DenkmalLevels.levels[1].slots[0];t.game.hero.x=slot.x-58;t.game.hero.y=slot.y;t.facing={x:1,y:0};t.selectTower('mage');const preview=t.placementPreview();
  assert.equal(preview.x,slot.x);assert.equal(preview.range,282);assert.equal(preview.role,'KONTROLLE');t.game.hero.x=50;t.game.hero.y=50;assert.equal(t.placementPreview(),null);
});
check('Offscreen boss creates a threat indicator',()=>{
  t.game.enemies=[{x:3000,y:3000,type:'boss',dead:false,hp:100,maxHp:100,r:34}];t.game.intermission=5;const indicators=t.threatIndicators();assert.ok(indicators.some(x=>x.kind==='boss'&&x.label==='BOSS'));
});
check('Rift chain damages multiple clustered enemies',()=>{
  const make=x=>({x,y:300,hp:100,maxHp:100,r:12,type:'wraith',armor:0,hit:0,dead:false,slow:0,slowFactor:1,speed:0,damage:0,attackCd:99,attackCooldown:.85,gateIndex:0,waypoint:1});
  const a=make(300),b=make(340),c=make(370);t.game.enemies=[a,b,c];t.shoot({x:200,y:300,kind:'rift',level:1},a,10,520,'#ee58ff',{chain:2});for(let i=0;i<15;i++)t.update(.02);assert.ok(a.hp<100&&b.hp<100&&c.hp<100);
});
check('Alpha.2 camera widens the view and adds movement lead without pausing',()=>{
  sandbox.innerWidth=390;sandbox.innerHeight=844;t.resize(false);assert.equal(t.portraitLayout(),true);assert.equal(t.zoom,.46);assert.equal(t.state,'playing');
  const center=t.screenToWorld(195,844*.43);assert.ok(Math.abs(center.y-t.game.hero.y)<1e-8);
  sandbox.innerWidth=1280;sandbox.innerHeight=800;t.resize(false);assert.equal(t.portraitLayout(),false);assert.equal(t.zoom,process.env.TEST_MOBILE==='1'?.50:.52);
  listeners.keydown({code:'ArrowRight',preventDefault(){}});t.update(.02);listeners.keyup({code:'ArrowRight'});assert.ok(t.cameraLead().x>0);
});
check('Walk camera ignores tiny analog jitter and scales lead with stick magnitude',()=>{
  t.moveIntent={x:.05,y:.04};const idle=t.cameraLead();assert.equal(idle.x,0);assert.equal(idle.y,0);
  t.moveIntent={x:.25,y:0};const gentle=t.cameraLead().x;
  t.moveIntent={x:1,y:0};const full=t.cameraLead().x;
  assert.ok(gentle>0&&gentle<full*.4);
});
check('Graphics and camera settings cycle without pausing gameplay',()=>{
  assert.equal(t.state,'playing');element('graphicsBtn').onclick();assert.equal(element('graphicsBtn').textContent,'GRAFIK: LOW');assert.equal(t.state,'playing');
  element('zoomBtn').onclick();assert.equal(element('zoomBtn').textContent,'KAMERA: STANDARD');assert.equal(t.state,'playing');
});
check('Mobile joystick applies a deadzone, analog response and radius clamp',()=>{
  const dead=t.joystickVector(2,2,40);assert.equal(dead.x,0);assert.equal(dead.y,0);
  const mid=t.joystickVector(20,0,40);assert.ok(mid.x>0&&mid.x<1);assert.equal(mid.y,0);
  const full=t.joystickVector(80,0,40);assert.equal(full.x,1);assert.equal(full.knobX,40);
});
check('First enemy of a wave triggers the profiled wave banner',()=>{
  t.game.intermission=0;t.game.waveSpawned=0;t.game.enemies=[];t.spawnEnemy();assert.equal(element('waveBanner').textContent,'WELLE 1 · ERSTE GLUT');assert.equal(element('waveBanner').classList.contains('show'),true);
});
check('Alpha.3 wave profiles modify selected enemy roles without changing wave sizes',()=>{
  assert.equal(t.wavePlan(2).name,'HETZJAGD');assert.equal(t.wavePlan(7).name,'SABOTAGE');
  const runner=t.applyWavePlan('runner',t.enemySpecs.runner,2),brute=t.applyWavePlan('brute',t.enemySpecs.brute,3),guardian=t.applyWavePlan('guardian',t.enemySpecs.guardian,6);
  assert.equal(runner.speed,1.14);assert.equal(brute.hp,1.12);assert.equal(guardian.armor,.06);
  assert.deepEqual([1,2,3,4,5,6,7,8].map(t.waveSize),[7,9,11,14,16,18,21,24]);
});
check('Runner enrages and Guardian breaks shield below health thresholds',()=>{
  const runner={x:300,y:300,type:'runner',hp:44,maxHp:100,speed:100,damage:10,enraged:false,dead:false,hitKick:0};
  t.updateEnemyPressure(runner);assert.equal(runner.enraged,true);assert.equal(runner.speed,128);assert.ok(runner.damage>10);
  const guardian={x:300,y:300,type:'guardian',hp:49,maxHp:100,speed:40,damage:10,armor:.38,shieldBroken:false,dead:false,hitKick:0};
  t.updateEnemyPressure(guardian);assert.equal(guardian.shieldBroken,true);assert.ok(Math.abs(guardian.armor-.18)<1e-9);assert.ok(guardian.speed>40);
});
check('Belagerer escalates through three combat phases',()=>{
  const boss={x:300,y:300,type:'boss',hp:650,maxHp:1000,speed:30,damage:40,attackCooldown:.82,armor:0,phase:1,dead:false,hitKick:0};
  t.updateEnemyPressure(boss);assert.equal(boss.phase,2);assert.equal(t.bossPhaseLabel(boss.phase),'II');const phase2Speed=boss.speed;
  boss.hp=320;t.updateEnemyPressure(boss);assert.equal(boss.phase,3);assert.equal(t.bossPhaseLabel(boss.phase),'III');assert.ok(boss.speed>phase2Speed);assert.ok(boss.armor>=.12);assert.match(element('waveBanner').textContent,/PHASE III/);
});
check('v3.2 alpha.2 keeps light hits still and reserves hit-stop for boss hits',()=>{
  const oldRandom=sandbox.Math.random;sandbox.Math.random=()=>.5;
  const light={x:300,y:300,type:'wraith',hp:100,maxHp:100,armor:0,dead:false,hitKick:0};
  t.hurtEnemy(light,10);assert.equal(t.shake,0);assert.equal(t.hitStop,0);
  const boss={x:300,y:300,type:'boss',hp:1000,maxHp:1000,armor:0,phase:1,dead:false,hitKick:0};
  t.hurtEnemy(boss,10);assert.equal(t.shake,3);assert.ok(t.hitStop>0);
  sandbox.Math.random=oldRandom;
});
check('v3.2 alpha.2 marks normal and heavy cannon projectiles with distinct impact feedback',()=>{
  const m=t.game.monument;t.game.hero.fireCd=100;
  const enemy={x:m.x+220,y:m.y+170,hp:1000,maxHp:1000,r:12,speed:0,damage:0,attackCd:99,attackCooldown:.85,hit:0,hitKick:0,type:'wraith',armor:0,dead:false,gateIndex:0,waypoint:1,slow:0,slowFactor:1};
  const cannon={x:m.x+220,y:m.y+100,kind:'cannon',level:1,damage:34,fireRate:1.15,fireCd:-1,range:275,targetMode:'nearest'};
  t.game.enemies=[enemy];t.game.towers=[cannon];t.update(.01);
  let shot=t.game.bullets.find(b=>b.kind==='cannon');assert.equal(shot.impactShake,.6);assert.equal(shot.hitStop,0);
  t.game.bullets=[];cannon.level=3;cannon.fireCd=-1;t.update(.01);
  shot=t.game.bullets.find(b=>b.kind==='cannon');assert.equal(shot.impactShake,3);assert.equal(shot.hitStop,.045);
});
check('v3.2 alpha.2 boss phase transition overrides the hit impulse with shake 10',()=>{
  const boss={x:300,y:300,type:'boss',hp:650,maxHp:1000,speed:30,damage:40,attackCooldown:.82,armor:0,phase:1,dead:false,hitKick:0};
  t.updateEnemyPressure(boss);assert.equal(t.shake,10);
});
check('Sapper detonates once at the monument instead of repeating melee attacks',()=>{
  const m=t.game.monument,h=t.game.hero;h.fireCd=100;h.x=m.x+500;h.y=m.y+500;
  const sapper={x:m.x+50,y:m.y,type:'sapper',hp:100,maxHp:100,r:14,speed:0,damage:32,attackCd:0,attackCooldown:1.05,attackRange:0,armor:0,focusMonument:true,gateIndex:0,waypoint:1,slow:0,slowFactor:1,hit:0,hitKick:0,dead:false};
  const before=m.hp,essence=t.game.essence;t.game.enemies=[sapper];t.game.waveKilled=0;t.game.spawnTimer=100;t.update(.02);
  assert.ok(Math.abs(m.hp-(before-52.8))<1e-9);assert.equal(t.game.enemies.length,0);assert.equal(t.game.waveKilled,1);assert.equal(t.game.essence,essence+4);
  const after=m.hp;t.update(.02);t.hurtEnemy(sapper,999);assert.equal(m.hp,after);assert.equal(t.game.waveKilled,1);assert.equal(t.game.essence,essence+4);
});
check('Archer backs away when Marcel closes inside minimum range',()=>{
  const m=t.game.monument,h=t.game.hero;h.x=m.x+320;h.y=m.y;h.fireCd=100;
  const archer={x:h.x+40,y:h.y,type:'archer',hp:100,maxHp:100,r:12,speed:46,damage:0,attackCd:99,attackCooldown:1.25,attackRange:170,armor:0,focusMonument:false,gateIndex:0,waypoint:1,slow:0,slowFactor:1,hit:0,hitKick:0,dead:false};
  const before=Math.hypot(archer.x-h.x,archer.y-h.y);t.game.enemies=[archer];t.update(.1);const after=Math.hypot(archer.x-h.x,archer.y-h.y);assert.ok(after>before);
});
// Persistence must survive a fresh script context; blocked storage must not stop play.
const saved=new Map();
function loadLevels(storage){const c={localStorage:storage};vm.createContext(c);vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),c);return c.DenkmalLevels;}
const storage={getItem:k=>saved.get(k),setItem:(k,v)=>saved.set(k,v)};
assert.equal(loadLevels(storage).unlocked,false);loadLevels(storage).unlock();assert.equal(loadLevels(storage).unlocked,true);
const blocked=loadLevels({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});assert.equal(blocked.unlock(),false);assert.equal(blocked.unlocked,true);
// One canonical source tree; no duplicate dist folder required.
check('Loot inventory holds six items and converts overflow to essence',()=>{
  const item={id:'test',name:'TESTRELIKT',rarity:'TEST',desc:'Test'};
  t.game.inventory=[];t.game.essence=10;for(let i=0;i<6;i++)assert.equal(t.pickupItem(item,true),true);
  assert.equal(t.game.inventory.length,6);assert.equal(t.pickupItem(item,true),false);assert.equal(t.game.essence,18);
  t.openInventory();assert.equal(t.state,'inventory');t.update(1);assert.equal(t.game.elapsed,0);t.closeInventory();assert.equal(t.state,'playing');
});
check('Rift tower selects the matching level graphic',()=>{
  for(let level=1;level<=3;level++){
    draws.length=0;t.drawTower({kind:'rift',level,x:250,y:350});
    assert.ok(draws.some(d=>d[0].src?.endsWith(`tower-rift-lance-l${level}.png`)));
  }
});
check('Tower upgrades select distinct sprites and preserve their base anchor',()=>{
  for(const kind of ['bow','cannon','ballista']){
    const sprites=new Set();
    for(let level=1;level<=3;level++){
      draws.length=0;t.drawTower({kind,level,x:250,y:350});
      const draw=draws.find(d=>d[0].src?.endsWith(`tower-${kind}-l${level}-v2.png`));
      const rendered=draws.find(d=>d.length===5&&d[0].width===192);
      assert.ok(draw,`${kind} ${level} sprite missing`);sprites.add(draw[0].src);
      assert.equal(draw.length,9);assert.ok(draw[3]>0&&draw[4]>0);
      assert.ok(rendered,'cached sprite not drawn');assert.ok(Math.abs(rendered[2]+rendered[4]-20)<1e-9,'base shifts on upgrade');
      assert.ok(Math.abs(rendered[3]/rendered[4]-draw[3]/draw[4])<1e-9,'sprite distorted');
      assert.ok(fs.existsSync(path.join(root,draw[0].src)));
    }
    assert.equal(sprites.size,3);
  }
});
check('Tower crop is reused on consecutive frames',()=>{const tower={kind:'bow',level:1,x:250,y:350};t.drawTower(tower);draws.length=0;t.drawTower(tower);assert.ok(!draws.some(d=>d[0]===t.towerLevelArt.bow[0]));assert.ok(draws.some(d=>d.length===5&&d[0].width===192));});
check('Terrain cache is reused and offscreen actors are culled',()=>{t.draw();draws.length=0;t.draw();const baseline=draws.length;t.game.enemies=[{x:-10000,y:-10000,type:'boss',hp:100,maxHp:100,r:34}];draws.length=0;t.draw();assert.equal(draws.length,baseline);assert.ok(!draws.some(d=>d[0].src?.endsWith('stone-terrain-v27.png')));});
check('Loading or failed tower upgrades retain a usable fallback sprite',()=>{
  for(const [kind,fallback] of [['bow','infernal'],['cannon','ash'],['ballista','rift']]){
    draws.length=0;t.drawTower({kind,level:2,x:250,y:350});
    const image=t.towerLevelArt[kind][1];
    const width=image.naturalWidth;image.complete=false;image.naturalWidth=0;
    draws.length=0;t.drawTower({kind,level:2,x:250,y:350});
    assert.ok(draws.some(d=>d[0].src?.endsWith(`tower-${kind}-${fallback}-v1.png`)));
    image.complete=true;image.naturalWidth=width;
  }
});
check('Zoom maps screen coordinates back to world coordinates',()=>{const point=t.screenToWorld(sandbox.innerWidth/2,sandbox.innerHeight/2);assert.ok(Math.abs(point.x-t.game.hero.x)<1e-8);assert.ok(Math.abs(point.y-t.game.hero.y)<1e-8);t.game.hero.x=26;t.game.hero.y=26;t.resize();const corner=t.screenToWorld(0,0);assert.equal(corner.x,0);assert.equal(corner.y,0);});
check('Build pause is finite and can be skipped without duplicating waves',()=>{t.update(2);assert.equal(t.game.waveSpawned,0);assert.equal(t.game.intermission,3);t.launchWave();t.launchWave();t.update(.5);assert.equal(t.game.waveSpawned,1);t.endWave();t.selectPerk({apply(){}});assert.equal(t.game.intermission,6);});
check('Loot grants bonuses once; full inventory grants no bonus',()=>{const h=t.game.hero;let base=h.damage;t.pickupItem({id:'ash'},true);assert.equal(h.damage,base+3);let rate=h.fireRate;t.pickupItem({id:'rune'},true);assert.ok(Math.abs(h.fireRate-rate*.94)<1e-10);h.hp=40;t.game.monument.hp=200;t.pickupItem({id:'seal'},true);assert.equal(h.maxHp,130);assert.equal(h.hp,90);assert.equal(t.game.monument.hp,280);while(t.game.inventory.length<6)t.pickupItem({id:'test'},true);base=h.damage;t.pickupItem({id:'ash'},true);assert.equal(h.damage,base);});
check('Final wave collects the boss seal before unlocking level 2',()=>{t.game.wave=5;t.game.loot=[{kind:'item',item:{id:'seal'}}];t.endWave();assert.equal(t.game.inventory[0].id,'seal');assert.equal(t.game.hero.maxHp,130);assert.equal(t.state,'levelcomplete');});
check('Towers choose the enemy closest to the monument within range',()=>{const m=t.game.monument,a={x:m.x+180,y:m.y},b={x:m.x+90,y:m.y},out={x:m.x+1,y:m.y};t.game.enemies=[a,b,out];const tower={x:m.x+190,y:m.y,range:150};assert.equal(t.towerTarget(tower),b);});
check('Cannon splash hits a nearby group while bow stays single-target',()=>{const oldRandom=sandbox.Math.random;sandbox.Math.random=()=>.5;t.launchWave();const h=t.game.hero;h.fireCd=100;const m=t.game.monument;t.game.towers=[{x:m.x+220,y:m.y+100,kind:'cannon',level:1,damage:34,fireRate:1.15,fireCd:-1,range:275}];const e={x:m.x+220,y:m.y+170,hp:1000,maxHp:1000,r:12,speed:0,damage:0,attackCd:5,hit:0,type:'wraith'},other={...e,x:e.x+30};t.game.enemies=[e,other];for(let i=0;i<12;i++)t.update(.02);assert.ok(e.hp<1000);assert.ok(other.hp<1000);assert.ok(e.hp<other.hp);sandbox.Math.random=oldRandom;});
check('Roads and monument remain clear while Level 1 pads stay legal',()=>{const m=t.game.monument,slot=sandbox.DenkmalLevels.levels[1].slots[0];assert.notEqual(t.placementError({x:m.x+200,y:m.y}),'');assert.equal(t.placementError(slot),'');for(const p of sandbox.DenkmalLevels.levels[1].slots)for(const path of sandbox.DenkmalLevels.levels[1].paths)assert.ok(sandbox.DenkmalLevels.pathDistance(p,path)>=64);});
check('v3.6 initializes three build paths and tags build perks',()=>{
  assert.equal(t.game.build.control,0);assert.equal(t.game.build.precision,0);assert.equal(t.game.build.rift,0);
  const buildPerks=t.getPerks().filter(p=>p.path);
  assert.ok(buildPerks.length>=3);
  for(const p of buildPerks){assert.ok(p.id);assert.ok(['control','precision','rift'].includes(p.path));assert.match(p.desc,/^(KONTROLLE|PRÄZISION|RISS) ·/);}
});
check('v3.6 control and rift perks stay bounded',()=>{
  const build=t.game.build;
  build.perks.add('icebreak');build.perks.add('coldrift');build.perks.add('afterglow');
  const slowed={slow:1};
  const cannon=t.projectileSynergy({kind:'cannon',splash:64},slowed);
  assert.ok(Math.abs(cannon.splashFactor-(.58*1.25*1.15))<1e-9);
  assert.equal(t.projectileSynergy({kind:'rift',chain:2},slowed).chain,4);
  const e={x:300,y:300,hp:100,maxHp:100,r:12,type:'wraith',armor:0,hit:0,dead:false,slow:0,slowFactor:1,speed:0,damage:0,attackCd:99,attackCooldown:.85,gateIndex:0,waypoint:1};
  t.game.enemies=[e];t.shoot({x:200,y:300,kind:'mage',level:1},e,1,500,'#69bfff',{slow:.58,slowDuration:1.6});for(let i=0;i<15;i++)t.update(.02);
  assert.ok(e.slow>1.8,'afterglow extends mage slow');
  build.riftCharge=3;t.game.bullets=[];t.shoot({x:200,y:300,kind:'rift',level:1},e,100,520,'#ee58ff',{chain:2});
  assert.ok(Math.abs(t.game.bullets[0].damage-124)<1e-9);assert.equal(build.riftCharge,0);
  build.perks.add('soulSpark');t.game.hero.soul=100;assert.equal(saga.unleash(),true);assert.ok(build.soulSparkUntil>t.game.elapsed);
  assert.equal(t.projectileSynergy({kind:'rift',chain:2},slowed).chain,5);
  build.perks.add('overskip');
  assert.ok(t.projectileSynergy({kind:'rift',chain:2},slowed).chain<=5,'rift chain budget remains finite');
  const oldRandom=sandbox.Math.random;sandbox.Math.random=()=>.5;
  const a={x:300,y:300,hp:100,maxHp:100,r:12,type:'wraith',armor:0,hit:0,dead:false,slow:0,slowFactor:1,speed:0,damage:0,attackCd:99,attackCooldown:.85,gateIndex:0,waypoint:1};
  const b={...a,x:340};t.game.enemies=[a,b];t.game.bullets=[];build.riftCharge=0;build.soulSparkUntil=0;
  t.shoot({x:200,y:300,kind:'rift',level:1},a,10,520,'#ee58ff',{chain:1});for(let i=0;i<15;i++)t.update(.02);
  sandbox.Math.random=oldRandom;
  assert.ok(Math.abs(a.hp-86.5)<1e-6,'overskip returns once for 35% damage');
});
check('v3.6 precision focus rewards elite and boss targeting without leaking',()=>{
  assert.equal(typeof t.precisionMultiplier,'function');
  const b=t.game.build;b.perks.add('huntersInstinct');b.perks.add('targetMark');b.perks.add('memoryStrike');
  const elite={type:'brute',elite:true,dead:false,focusHits:0},boss={type:'boss',dead:false,focusHits:0},plain={type:'wraith',dead:false,focusHits:0};
  assert.equal(t.precisionMultiplier({kind:'bow'},elite),1.3);
  assert.equal(t.precisionMultiplier({kind:'bow'},boss),1.3);
  assert.equal(t.precisionMultiplier({kind:'bow'},plain),1);
  assert.equal(t.precisionMultiplier({kind:'wand'},elite),1,'unmarked Marcel hit has no memory bonus');
  b.focusTarget=elite;b.focusHits=5;assert.ok(Math.abs(t.precisionMultiplier({kind:'wand'},elite)-1.50)<1e-9);
  b.focusTarget=plain;b.focusHits=0;assert.equal(t.precisionMultiplier({kind:'wand'},elite),1,'focus does not leak after target change');
});
check('v3.6 resonance rift-runner and elites have bounded counters',()=>{
  const oldRandom=sandbox.Math.random;sandbox.Math.random=()=>.5;
  const resonance={x:0,y:0,hp:100,maxHp:100,r:12,type:'resonance',armor:0,hit:0,dead:false};
  t.game.enemies=[resonance];t.hurtEnemy(resonance,20,{secondary:'chain'});assert.ok(Math.abs(resonance.hp-87)<1e-9);
  const directHp=resonance.hp;t.hurtEnemy(resonance,10,{});assert.ok(Math.abs(resonance.hp-(directHp-10))<1e-9);
  const rr={x:0,y:0,hp:100,maxHp:100,r:12,type:'riftRunner',armor:0,hit:0,dead:false,riftSurge:0};t.hurtEnemy(rr,1,{secondary:'chain'});assert.equal(rr.riftSurge,1.5);t.hurtEnemy(rr,1,{secondary:'chain'});assert.equal(rr.riftSurge,1.5);
  sandbox.Math.random=()=>0;t.game.wave=8;t.game.waveSpawned=0;t.game.enemies=[];t.spawnEnemy();const e=t.game.enemies[0];assert.equal(e.elite,true);assert.ok(['armored','frenzied','slowResist'].includes(e.eliteModifier));assert.equal(Array.isArray(e.eliteModifier),false);
  t.game.wave=5;t.game.waveSpawned=0;t.game.enemies=[];t.spawnEnemy();assert.equal(t.game.enemies[0].type,'boss');assert.equal(t.game.enemies[0].elite,false);
  sandbox.Math.random=oldRandom;
});
check('v3.6 soul call evolutions are exclusive and numerically bounded',()=>{
  const oldRandom=sandbox.Math.random;sandbox.Math.random=()=>.5;
  const h=t.game.hero,b=t.game.build;baseDamage=70+h.damage*2;
  const enemy=()=>({x:h.x+80,y:h.y,hp:1000,maxHp:1000,r:12,type:'wraith',armor:0,hit:0,dead:false,slow:0,slowFactor:1,speed:0,damage:0,attackCd:99,attackCooldown:.85,gateIndex:0,waypoint:1});
  b.soulEvolution='shockwave';let e=enemy();t.game.enemies=[e];h.soul=100;assert.equal(saga.unleash(),true);assert.ok(Math.abs(e.hp-(1000-baseDamage*1.35))<1e-6);assert.equal(e.weakenedUntil||0,0);
  t.startGame();saga.continueStory();const h2=t.game.hero,b2=t.game.build;b2.soulEvolution='weaken';e={...enemy(),x:h2.x+80,y:h2.y};t.game.enemies=[e];h2.soul=100;const base2=70+h2.damage*2;assert.equal(saga.unleash(),true);assert.ok(Math.abs(e.hp-(1000-base2*.70))<1e-6);assert.ok(e.weakenedUntil>t.game.elapsed);
  const hp=e.hp;t.hurtEnemy(e,100);assert.ok(Math.abs(e.hp-(hp-115))<1e-6);
  sandbox.Math.random=oldRandom;
});
check('v3.6 dodge evolutions apply readiness or a nonstacking counterstrike window',()=>{
  const b=t.game.build,h=t.game.hero;b.dodgeEvolution='readiness';t.dodge();assert.ok(Math.abs(h.dodgeCd-.84)<1e-9);
  t.startGame();saga.continueStory();const b2=t.game.build,h2=t.game.hero;b2.dodgeEvolution='counterstrike';t.dodge();t.update(.20);assert.ok(h2.counterstrikeUntil>t.game.elapsed);
  const first=h2.counterstrikeUntil;t.dodge();assert.equal(h2.counterstrikeUntil,first,'second dodge does not stack before completion');t.update(1.3);t.dodge();t.update(.20);assert.ok(h2.counterstrikeUntil>=first,'later dodge refreshes the window');
  t.game.bullets=[];const target={x:h2.x+80,y:h2.y,hp:1000,maxHp:1000,r:12,type:'wraith',armor:0,hit:0,dead:false};t.shoot(h2,target,100);assert.ok(Math.abs(t.game.bullets[0].damage-125)<1e-9);
});
check('v3.6 boss phase exposes a three-second synergy window without changing shake rules',()=>{
  assert.equal(typeof t.buildSynergyMultiplier,'function');
  const b=t.game.build;b.control=2;
  const boss={x:300,y:300,hp:650,maxHp:1000,r:34,type:'boss',armor:0,hit:0,hitKick:0,dead:false,phase:1,speed:30,damage:40,attackCooldown:.82};
  t.game.enemies=[boss];t.updateEnemyPressure(boss);assert.equal(boss.phase,2);assert.ok(Math.abs(boss.exposedUntil-(t.game.elapsed+3))<1e-9);assert.equal(t.shake,10);assert.equal(t.buildSynergyMultiplier(boss),1.1);
  boss.hp=320;t.updateEnemyPressure(boss);assert.equal(boss.phase,3);assert.ok(Math.abs(boss.exposedUntil-(t.game.elapsed+3))<1e-9);assert.equal(t.shake,10);
  b.control=1;b.precision=1;b.rift=1;assert.equal(t.buildSynergyMultiplier(boss),1,'hybrid without two perks in one path is not completed');
});
check('v3.6 new enemy roles and elite modifiers have readable visual identities',()=>{
  assert.equal(typeof t.enemyReadabilityStyle,'function');
  const resonance=t.enemyReadabilityStyle({type:'resonance',elite:false});
  const runner=t.enemyReadabilityStyle({type:'riftRunner',elite:false});
  assert.ok(resonance.filter&&runner.filter&&resonance.filter!==runner.filter);
  for(const mod of ['armored','frenzied','slowResist']){const s=t.enemyReadabilityStyle({type:'wraith',elite:true,eliteModifier:mod});assert.ok(s.ring,'elite modifier '+mod+' has a visible ring');}
});
check('v3.6 precision focus clears when the marked target dies',()=>{
  const oldRandom=sandbox.Math.random;sandbox.Math.random=()=>.5;const e={x:0,y:0,hp:1,maxHp:10,r:12,type:'boss',armor:0,hit:0,dead:false};
  t.game.enemies=[e];t.game.build.focusTarget=e;t.game.build.focusHits=5;t.hurtEnemy(e,10);sandbox.Math.random=oldRandom;
  assert.equal(t.game.build.focusTarget,null);assert.equal(t.game.build.focusHits,0);
});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const polish=fs.readFileSync(path.join(root,'polish.css'),'utf8');
assert.ok(html.includes('viewport-fit=cover'));
assert.ok(polish.includes('@media (orientation:portrait)'));
assert.ok(polish.includes('v3.0.0-alpha.6 — portrait-first mobile combat layout'));assert.ok(polish.includes('v3.1.0-alpha.2 — mobile combat polish'));assert.ok(polish.includes('v3.1.0-alpha.3 — combat variety + boss escalation'));
for(const m of html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^\"]*)?"/g))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);
assert.equal(html.includes('KAEL'),false);
assert.ok(html.includes('marcel-lantern-portrait-v1.webp'));
assert.ok(html.includes('DENKMAL TD · v3.6.0'));
assert.ok(html.includes('?v=v360'));
assert.equal(html.includes('marcel-portrait-v27.png'),false);
assert.ok(fs.existsSync(path.join(root,'assets/hero/marcel-lantern-sprite-v1.webp')));
for(const id of ['graphicsBtn','zoomBtn','telemetryBtn','fpsOverlay','wavePreview','targetBtn','waveBanner'])assert.ok(html.includes(`id="${id}"`));
for(const tower of ['bow','cannon','mage','rift'])assert.ok(html.includes(`data-tower="${tower}"`));
console.log(`${tests.length} gameplay checks passed; local assets verified.\n`+tests.join('\n'));
