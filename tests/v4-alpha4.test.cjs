'use strict';
// V4 alpha.4 regression suite: target prediction, projectile speeds, FX contracts,
// HUD menu routing, shell cache busts and persistence keys.
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
sandbox.window=sandbox;
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'loot.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'hero-saga.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'combat-fx.js'),'utf8'),sandbox);
let source=fs.readFileSync(path.join(root,'game.js'),'utf8');
source=source.replace(/\}\)\(\);\s*$/,`globalThis.test={interceptPoint,projectileSpeed,closeHudMenu,towerTarget,update,shoot,pauseGame,startGame,spawnEnemy,placementError,segmentDistance,get game(){return game},get state(){return state}};})();`);
vm.runInContext(source,sandbox);
const t=sandbox.test,fx=sandbox.DenkmalCombatFX,saga=sandbox.HeroSaga;
const tests=[];function check(name,fn){t.startGame();saga.continueStory();fn();tests.push(name);}
function startRun(){t.game.intermission=0;t.game.waveSpawned=t.game.waveTotal;t.game.hero.fireCd=99;}
// Enemies enter from the south gate of level 1 and walk straight toward the monument.
function makeEnemy(overrides={}){
  const e=Object.assign({x:1536,y:2136,gateIndex:2,waypoint:1,type:'wraith',hit:0,hitKick:0,slow:0,slowFactor:1,enraged:false,shieldBroken:false,phase:0,r:12,hp:400,maxHp:400,speed:66,damage:10,attackCd:0,attackCooldown:.85,armor:0,focusMonument:false,miniBoss:false,velX:0,velY:0},overrides);
  e.prevX=e.x;e.prevY=e.y;return e;
}
check('Intercept prediction: exact for stationary targets, bounded and adaptive for movers',()=>{
  assert.deepEqual(t.interceptPoint({x:0,y:0},{x:300,y:300},520),{x:300,y:300});
  const mover={x:300,y:0,velX:120,velY:0};
  const far=t.interceptPoint({x:0,y:0},mover,520);
  assert.ok(far.x>300,'movers are led ahead of their current position');
  assert.equal(far.y,0);
  assert.ok(far.x-300<=120*1.05+1e-9,'lead is capped at 1.05 s of travel');
  const near=t.interceptPoint({x:280,y:0},mover,520);
  assert.ok(near.x>300&&near.x-300<far.x-300,'closer shooters adapt with a shorter lead');
});
check('Shell speed table covers every tower and hero shells stay at 560',()=>{
  assert.deepEqual([t.projectileSpeed('bow'),t.projectileSpeed('cannon'),t.projectileSpeed('mortar'),t.projectileSpeed('ballista')],[520,430,350,660]);
  assert.equal(t.projectileSpeed('mage'),520);
  assert.equal(t.projectileSpeed('rift'),520);
  assert.equal(t.projectileSpeed('thorn'),560);
  startRun();
  const h=t.game.hero;h.fireCd=0;
  t.game.enemies=[makeEnemy({x:h.x+80,y:h.y,hp:1000,maxHp:1000,speed:0,attackCd:99})];
  t.update(.02);
  const b=t.game.bullets[0];
  assert.ok(b&&b.heroShot,'hero fires at the nearest enemy');
  assert.ok(Math.abs(Math.hypot(b.vx,b.vy)-560)<1e-9,'hero shells keep their tuned 560 px/s');
});
check('Bow towers lead runners instead of firing at stale positions and connect',()=>{
  startRun();
  const m=t.game.monument;
  const runner=makeEnemy({x:m.x,y:m.y+380,hp:600,maxHp:600});
  t.game.enemies=[runner];
  const tower={x:m.x+120,y:m.y+200,kind:'bow',level:1,damage:21,fireRate:1.05,fireCd:0,range:300,spent:30,targetMode:'first'};
  t.game.towers=[tower];
  t.update(.02);
  const b=t.game.bullets[0];
  assert.ok(b,'bow tower fires within one frame');
  const aim=t.interceptPoint(tower,runner,520);
  const len=Math.hypot(b.vx,b.vy)||1,dir={x:b.vx/len,y:b.vy/len};
  const aimLen=Math.hypot(aim.x-tower.x,aim.y-tower.y);
  const cosLead=(dir.x*(aim.x-tower.x)+dir.y*(aim.y-tower.y))/aimLen;
  const nowLen=Math.hypot(runner.x-tower.x,runner.y-tower.y);
  const cosNow=(dir.x*(runner.x-tower.x)+dir.y*(runner.y-tower.y))/nowLen;
  assert.ok(Math.abs(cosLead-1)<1e-9,'the shell flies exactly at the predicted intercept');
  assert.ok(cosLead>cosNow,'it leads ahead of the old position instead of trailing it');
  for(let i=0;i<60;i++)t.update(.02);
  assert.ok(runner.hp<600,'the led shot actually connects with the moving runner');
});
check('Velocity is measured from the first real step and never fabricated',()=>{
  startRun();
  t.game.waveSpawned=2;t.spawnEnemy();
  const walker=t.game.enemies[0];
  t.update(.02);
  assert.ok(Math.abs(walker.velY+66)<1e-6,'velocity is measured from the first real step');
  assert.ok(Math.abs(walker.velX)<1e-9,'straight lanes report zero lateral velocity');
  t.update(.02);
  assert.ok(Math.abs(walker.velY+66)<1e-6,'tracking stays stable across frames');
  walker.speed=0;
  t.update(.02);
  assert.equal(walker.velY,0,'stationary enemies keep zero velocity, nothing is fabricated');
  assert.equal(walker.velX,0);
});
check('Slowed enemies are led along their slowed path',()=>{
  startRun();
  t.game.waveSpawned=2;t.spawnEnemy();
  const slowed=t.game.enemies[0];
  slowed.speed=100;slowed.slow=1;slowed.slowFactor=.5;
  t.update(.02);t.update(.02);
  assert.ok(Math.abs(slowed.velY+50)<1e-6,'slow factor is part of the measured velocity');
  const aim=t.interceptPoint({x:slowed.x+100,y:slowed.y+100},slowed,520);
  assert.ok(aim.y<slowed.y,'prediction leads slowed enemies along their real path');
});
check('Impact bursts spawn shock rings, directional debris and well-formed particles',()=>{
  const g={particles:[]},shell={x:5,y:5,kind:'cannon',vx:120,vy:0,color:'#d7a16c'};
  fx.burst(g,shell,true,false,false);
  assert.ok(g.particles.some(p=>p.ring),'impacts expand a shock ring');
  assert.ok(g.particles.some(p=>p.vx<0),'debris kicks back against the shell direction');
  assert.ok(g.particles.every(p=>p.life>0&&p.life===p.max),'every particle is born with life===max');
});
check('Rift chain lightning renders a visible bolt between targets',()=>{
  const bg={particles:[]};
  fx.bolt(bg,{x:0,y:0},{x:100,y:0},'#ee58ff',false);
  assert.ok(bg.particles.length>0&&bg.particles.some(p=>p.vx!==0),'bolt spawns particles along the arc');
  startRun();
  const m=t.game.monument;
  const first=makeEnemy({x:m.x-60,y:m.y+300}),second=makeEnemy({x:m.x+20,y:m.y+320});
  t.game.enemies=[first,second];
  t.game.towers=[{x:m.x-20,y:m.y+200,kind:'rift',level:1,damage:21,fireRate:.46,fireCd:0,range:292,spent:58,targetMode:'first'}];
  let seen=false;
  for(let i=0;i<90&&!seen;i++){t.update(.02);seen=t.game.particles.some(p=>p.bolt&&p.vx!==0);}
  assert.ok(seen,'in-game rift chains draw bolt particles between chained targets');
});
check('HUD menu routes pause, closes on demand and on every screen switch',()=>{
  const menu=element('hudMenu');
  menu.open=true;
  t.pauseGame();
  assert.equal(t.state,'paused');
  assert.equal(t.closeHudMenu(),true);
  assert.equal(menu.open,false,'closeHudMenu folds the details overlay');
  t.startGame(1);saga.continueStory();
  assert.equal(typeof element('menuPauseBtn').onclick,'function','menu PAUSE button is wired');
  element('menuPauseBtn').onclick();
  assert.equal(t.state,'paused','the in-menu PAUSE button pauses the run');
  menu.open=true;
  t.startGame(1);saga.continueStory();
  assert.equal(menu.open,false,'closeScreens folds the menu on every screen switch');
});
check('Shell contracts: alpha.4 badge, cache busts and menu layering',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const polish=fs.readFileSync(path.join(root,'polish.css'),'utf8');
  const portrait=fs.readFileSync(path.join(root,'portrait-patch.css'),'utf8');
  assert.ok(html.includes('v4.0.0-alpha.4 · EINLEITUNG'),'release badge names alpha.4');
  assert.ok(html.includes('id="hudMenu"'),'the menu details element is addressable');
  assert.ok(html.includes('id="menuPauseBtn"'),'the menu has a PAUSE button');
  assert.ok(!html.includes('v400a3'),'no stale alpha.3 cache busts remain');
  assert.equal((html.match(/\?v=v400a4a1/g)||[]).length,15,'every asset is cache-busted as v400a4a1');
  assert.ok(polish.includes('.hud-menu-panel{z-index:8}'),'polish keeps the menu under modal overlays');
  assert.ok(/\.hud-menu-panel\{[^}]*z-index:8/.test(portrait.replace(/\s/g,'')),'portrait keeps the menu under modal overlays');
  assert.ok(portrait.includes('touch-action:manipulation'),'menu taps avoid double-tap zoom');
  assert.ok(portrait.includes('overscroll-behavior:contain'),'menu scrolling never pulls the page');
});
check('Persistence and collision guards survive the alpha.4 pass',()=>{
  const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
  const levels=fs.readFileSync(path.join(root,'levels.js'),'utf8');
  assert.ok(levels.includes('denkmal-level2-unlocked-v1'),'level 2 unlock persistence key kept');
  assert.ok(game.includes('td2-v4-intro-tutorial'),'intro tutorial persistence key kept');
  assert.ok(game.includes("monumentImage.src = 'assets/monument-level1-v2.webp'"),'the alpha.3 monument hotfix is backported');
  assert.equal(typeof sandbox.DenkmalLoot.create,'function','loot model factory intact');
  const e={x:10,y:10,r:5},b={prevX:0,prevY:0,x:20,y:0,r:4};
  assert.equal(t.segmentDistance(e,b),10);
  assert.ok(!(t.segmentDistance(e,b)<e.r+b.r),'a shell one pixel past the radius misses');
});
console.log(`${tests.length} v4-alpha.4 combat, FX, menu and persistence checks passed.\n`+tests.join('\n'));
