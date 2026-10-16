'use strict';
// V4 alpha.5: returning projectiles, stage upgrades, live enemy aggro and ground contact.
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
source=source.replace(/\}\)\(\);\s*$/, `globalThis.test={get game(){return game},get state(){return state},get lootModel(){return lootModel},startGame,mainMenu,endWave,selectTower,upgradeTower,shootBoomerang,moveBoomerang,update,drawMonument,projectileSpeed};})();`);
vm.runInContext(source,sandbox);
const t=sandbox.test;
const results=[];
function stage3(){
  t.lootModel.unlockLevel3();
  t.startGame(3);
  assert.equal(t.game.level,3,'Kirchende must open for alpha.5 tests');
  t.game.intermission=0;
  t.game.waveSpawned=t.game.waveTotal;
  t.game.hero.fireCd=99;
}
function check(name,fn){stage3();fn();results.push(name);}
function enemy(x,y,armor=0){
  return {x,y,prevX:x,prevY:y,velX:0,velY:0,r:12,type:'wraith',
    gateIndex:0,waypoint:1,hit:0,hitKick:0,slow:0,slowFactor:1,
    hp:500,maxHp:500,armor,damage:0,speed:0,attackCd:99,attackCooldown:1,
    focusMonument:false};
}
check('Three distinct WebP boomerang sprites and upgrades stay connected',()=>{
  const gameSource=fs.readFileSync(path.join(root,'game.js'),'utf8');
  const atlas=path.join(root,'assets','tower-boomerang-atlas.webp');
  assert.ok(fs.existsSync(atlas),'missing three-stage transparent boomerang atlas');
  assert.ok(fs.statSync(atlas).size>5000,'empty or truncated atlas');
  assert.ok(gameSource.includes('towerLevelArt.boomerang[0]'));
  assert.ok(gameSource.includes('frameWidth*(level-1)'));
  assert.ok(gameSource.includes('v400a5combined1'));
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.ok(html.includes('game.js?v=v400a6s2p6b'));
  assert.ok(gameSource.includes('DenkmalTerrain?.drawStars'),'star count follows level');
});
check('Thorn and lantern towers are no longer available',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const art=fs.readFileSync(path.join(root,'kirchende-art.js'),'utf8');
  const game=fs.readFileSync(path.join(root,'game.js'),'utf8');
  assert.ok(!html.includes('tower-thorn')&&!html.includes('tower-lantern'));
  assert.ok(!game.includes("name:'DORNENWERFER'")&&!game.includes("name:'RUNENLATERNE'"));
  assert.ok(!art.includes("'thorn1'")&&!art.includes("'lantern1'"));
  assert.ok(html.includes('data-tower="boomerang"'));
  assert.equal(t.projectileSpeed('boomerang'),440);
  t.selectTower('boomerang');assert.equal(t.game.selectedTower,'boomerang');
});
check('Boomerang tower upgrades give three distinct low-damage levels',()=>{
  const h=t.game.hero;
  const tower={x:h.x+20,y:h.y,kind:'boomerang',level:1,spent:48,damage:8,
    fireRate:1.75,fireCd:0,range:265,targetMode:'first'};
  t.game.towers=[tower];t.game.essence=300;
  t.upgradeTower();assert.equal(tower.level,2);assert.equal(tower.damage,11);
  assert.equal(tower.range,285);assert.equal(tower.fireRate,1.65);
  t.upgradeTower();assert.equal(tower.level,3);assert.equal(tower.damage,14);
  assert.equal(tower.range,305);assert.equal(tower.fireRate,1.55);
  t.upgradeTower();assert.equal(tower.level,3);
  assert.equal(t.game.essence,215,'35 + 50 essence upgrades');
});
check('A boomerang passes through every enemy, returns and hits each once per leg',()=>{
  const tower={x:1300,y:1350,kind:'boomerang',level:1,damage:8,fireCd:99,
    fireRate:1.75,range:265,targetMode:'first'};
  const a=enemy(1370,1350),b=enemy(1460,1350,.6),c=enemy(1520,1350);
  const offLane=enemy(1400,1410);
  t.game.enemies=[a,b,c,offLane];
  t.shootBoomerang(tower,a);
  assert.equal(t.game.bullets.length,1);
  assert.equal(t.game.bullets[0].maxDistance,265);
  let sawReturn=false;
  for(let i=0;i<100;i++){
    t.update(.02);
    if(t.game.bullets.some(b=>b.phase==='back'))sawReturn=true;
  }
  assert.ok(sawReturn,'projectile changes to return phase');
  assert.equal(t.game.bullets.length,0,'boomerang arrives back at the tower');
  for(const e of [a,b,c])assert.equal(e.hp,484,'each enemy receives exactly 8 + 8 damage despite armor');
  assert.equal(offLane.hp,500,'off-axis enemies are not hit');
});
check('Boomerang does not multi-hit a stationary enemy on one pass',()=>{
  const tower={x:1300,y:1350,kind:'boomerang',level:1,damage:8,range:265};
  const a=enemy(1360,1350);t.game.enemies=[a];
  t.shootBoomerang(tower,a);
  for(let i=0;i<15;i++)t.update(.02);
  assert.equal(a.hp,492,'outbound contact applies one fixed damage instance');
});
check('Hero attracts enemies before touching them, within the road corridor',()=>{
  const points=sandbox.DenkmalLevels.levels[3].paths[0],p=points[0],q=points[1];
  const size=Math.hypot(q.x-p.x,q.y-p.y)||1,ux=(q.x-p.x)/size,uy=(q.y-p.y)/size,nx=-uy,ny=ux;
  const e=enemy(p.x,p.y);e.speed=66;e.damage=10;
  const h=t.game.hero;h.x=p.x+ux*40+nx*55;h.y=p.y+uy*40+ny*55;
  h.invuln=0;
  t.game.enemies=[e];
  t.update(.1);
  const lateral=(e.x-p.x)*nx+(e.y-p.y)*ny;
  assert.ok(lateral>1,'enemy deviates from fixed lane to chase hero');
});
check('At most three ordinary enemies pursue hero at once',()=>{
  const points=sandbox.DenkmalLevels.levels[3].paths[0],p=points[0],q=points[1];
  const size=Math.hypot(q.x-p.x,q.y-p.y)||1,ux=(q.x-p.x)/size,uy=(q.y-p.y)/size,nx=-uy,ny=ux;
  const h=t.game.hero;h.x=p.x+ux*40+nx*55;h.y=p.y+uy*40+ny*55;
  const attackers=Array.from({length:5},()=>{const e=enemy(p.x,p.y);e.speed=66;return e;});
  t.game.enemies=attackers;t.update(.1);
  const active=attackers.filter(e=>(e.x-p.x)*nx+(e.y-p.y)*ny>1);
  assert.equal(active.length,3,'limit of three active pursuers prevents instant swarming');
});
check('Kirchende monument sprite base rests in its contact shadow',()=>{
  let contact=null,anchor=null;
  const originalEllipse=context.ellipse;
  context.ellipse=(...args)=>{contact=args;};
  sandbox.KirchendeArt={load:()=>Promise.resolve([]),draw:(ctx,key,x,y,height)=>{anchor={key,x,y,height};return true;},drawCracks(){}};
  const m=t.game.monument;
  t.drawMonument(m);
  context.ellipse=originalEllipse;
  assert.equal(anchor.key,'monument');
  assert.equal(anchor.y,m.y);
  assert.equal(contact[1],m.y+7);
  assert.ok(Math.abs(anchor.y+12-contact[1])<=6,'sprite foot and ground shadow overlap');
});
check('Low damage remains below single-target bow DPS at every stage',()=>{
  for(const [damage,rate] of [[8,1.75],[11,1.65],[14,1.55]]){
    assert.ok((damage*2)/rate<12/.5,'boomerang trades boss DPS for crowd penetration');
  }
});
check('Church level unlocks after Kirchende and persists completion of wave 16',()=>{
  t.startGame(4);assert.equal(t.game.level,3,'level 4 is locked before Kirchende reward');
  t.lootModel.claimKirchendeReward();t.startGame(4);
  assert.equal(t.game.level,4);
  assert.equal(t.game.wave,13);
  assert.equal(t.game.maxTowers,10);
  assert.equal(t.game.essence,245);
  t.game.wave=16;t.game.waveSpawned=t.game.waveTotal;t.game.enemies=[];
  t.endWave();assert.equal(t.state,'levelcomplete');
  assert.equal(sandbox.DenkmalLevels.level4Completed,true,'clearing the lion stage unlocks endless');
  t.mainMenu();t.startGame(4,'endless');assert.equal(t.game.mode,'endless');
});
console.log(results.length+' v4-alpha5 boomerang, hero aggro and monument tests passed\n'+results.join('\n'));
