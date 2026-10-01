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
vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);vm.runInContext(fs.readFileSync(path.join(root,'hero-saga.js'),'utf8'),sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'combat-fx.js'),'utf8'),sandbox);
let source=fs.readFileSync(path.join(root,'game.js'),'utf8');source=source.replace(/\}\)\(\);\s*$/,`globalThis.test={towerLevelArt,mainMenu,draw,drawTower,screenToWorld,towerTarget,launchWave,startGame,update,spawnEnemy,selectTower,upgradeTower,sellTower,buildTower,towerPosition,placementError,pauseGame,resumeGame,dodge,resize,selectPerk,endWave,gameOver,hurtEnemy,nearest,segmentDistance,getPerks,openInventory,closeInventory,pickupItem,get game(){return game},get state(){return state},set facing(v){facing=v}};})();`);
vm.runInContext(source,sandbox);const t=sandbox.test,saga=sandbox.HeroSaga;
const tests=[];function check(name,fn){t.startGame();saga.continueStory();fn();tests.push(name);}
check('Prologue freezes combat and resumes exactly once',()=>{t.startGame();assert.equal(t.state,'story');t.update(2);assert.equal(t.game.elapsed,0);saga.continueStory();assert.equal(t.state,'playing');saga.continueStory();assert.equal(t.game.wave,1);});
check('Start resources and clean restart',()=>{assert.equal(t.game.essence,60);assert.equal(t.game.wave,1);assert.equal(t.state,'playing');assert.equal(t.game.hero.soul,100);});
check('Valid tower, no overlapping or off-map placement',()=>{t.game.hero.x=250;t.game.hero.y=350;t.facing={x:1,y:0};t.buildTower();assert.equal(t.game.towers.length,1);assert.equal(t.game.essence,35);t.game.essence=100;t.buildTower();assert.equal(t.game.towers.length,1);t.game.hero.x=3060;t.buildTower();assert.equal(t.game.towers.length,1);assert.equal(t.game.essence,100);});
check('Pause freezes simulation and clears held movement',()=>{listeners.keydown({code:'KeyD'});t.pauseGame();const x=t.game.hero.x;t.update(10);assert.equal(t.game.elapsed,0);assert.equal(t.game.hero.x,x);t.resumeGame();t.update(.01);assert.equal(t.game.hero.x,x);});
check('Movement and dodge work; repeat cannot spend twice',()=>{const x=t.game.hero.x;listeners.keydown({code:'ArrowRight',preventDefault(){}});t.update(.02);assert.ok(t.game.hero.x>x);listeners.keyup({code:'ArrowRight'});t.dodge();const x2=t.game.hero.x;t.update(.02);assert.ok(t.game.hero.x>x2);const cd=t.game.hero.dodgeCd;t.dodge();assert.equal(t.game.hero.dodgeCd,cd);});
check('Lost focus pauses',()=>{listeners.blur();assert.equal(t.state,'paused');});
check('Wave loot and perk apply once',()=>{t.game.loot=[{},{}];t.endWave();t.endWave();assert.equal(t.game.essence,68);let n=0;const perk={name:'Test',apply(){n++;}};t.selectPerk(perk);t.selectPerk(perk);assert.equal(t.game.wave,2);assert.equal(n,1);assert.equal(t.game.loot.length,0);});
check('Dead enemies cannot award duplicate kills or soul charge',()=>{const e={x:0,y:0,hp:1};t.game.enemies=[e];t.game.hero.soul=0;t.hurtEnemy(e,5);t.hurtEnemy(e,5);assert.equal(t.game.kills,1);assert.equal(t.game.hero.soul,8);assert.equal(t.nearest({x:0,y:0},100),null);});
check('Fast bullets detect targets between frames',()=>{assert.equal(t.segmentDistance({x:50,y:3},{prevX:0,prevY:0,x:100,y:0}),3);});
check('Correct defeat cause and completed waves',()=>{t.game.hero.hp=0;t.gameOver();assert.equal(element('gameoverTitle').textContent,'DER HÜTER IST GEFALLEN');assert.match(element('gameoverStats').textContent,/0 Wellen überstanden/);});
check('Arsenal exposes only bow/cannon while disabled towers remain in code',()=>{t.game.hero.x=250;t.game.hero.y=350;t.facing={x:1,y:0};t.game.essence=200;t.selectTower('mage');assert.equal(t.game.selectedTower,'bow');t.selectTower('cannon');t.buildTower();assert.equal(t.game.towers[0].kind,'cannon');t.upgradeTower();t.upgradeTower();assert.equal(t.game.towers[0].level,3);assert.equal(t.game.essence,80);t.upgradeTower();t.pauseGame();t.sellTower();assert.equal(t.game.towers.length,1);t.resumeGame();t.sellTower();assert.equal(t.game.essence,152);});
check('One boss each fifth wave and one reward',()=>{t.game.wave=5;t.spawnEnemy();t.spawnEnemy();assert.equal(t.game.enemies.filter(e=>e.type==='boss').length,1);const boss=t.game.enemies[0];t.hurtEnemy(boss,99999);t.hurtEnemy(boss,99999);assert.equal(t.game.essence,95);assert.equal(t.game.loot.length,9);});
check('Resize preserves world positions and pauses',()=>{t.game.towers=[{x:200,y:300}];sandbox.innerWidth=640;sandbox.innerHeight=400;t.resize();assert.equal(t.state,'paused');assert.equal(t.game.towers[0].x,200);});
check('Wardrobe freezes combat and enforces unlocks',()=>{const h=t.game.hero;saga.openCharacter();assert.equal(t.state,'character');t.update(3);assert.equal(t.game.elapsed,0);assert.equal(saga.equip('weapon','echo'),false);assert.equal(h.equipment.weapon,'ember');saga.closeCharacter();assert.equal(t.state,'playing');});
check('Equipment modifiers never stack or reset earned base upgrades',()=>{const h=t.game.hero;h.damage=26;t.game.wave=8;saga.openCharacter();for(let i=0;i<5;i++){saga.equip('weapon','echo');saga.equip('weapon','ember');}assert.equal(h.damage,26);assert.equal(saga.stats(h).damage,32.5);saga.equip('armor','ash');assert.equal(saga.stats(h).speed,246);saga.closeCharacter();t.dodge();assert.ok(Math.abs(h.dodgeCd-.84)<.0001);});
check('Armor reduces incoming damage and does not heal on equip',()=>{const h=t.game.hero;saga.damage(20);assert.equal(h.hp,85);t.game.wave=3;saga.openCharacter();saga.equip('armor','ash');saga.equip('armor','oath');assert.equal(h.hp,85);saga.closeCharacter();});
check('Soul call has bounded range heal and resource use',()=>{const h=t.game.hero;h.hp=50;const near={x:h.x+80,y:h.y,hp:1000,r:12},far={x:h.x+400,y:h.y,hp:1000,r:12};t.game.enemies=[near,far];assert.equal(saga.unleash(),true);assert.ok(near.hp<1000);assert.equal(far.hp,1000);assert.equal(h.hp,75);assert.equal(h.soul,0);assert.equal(saga.unleash(),false);saga.update(.6,false,{x:1,y:0});assert.ok(t.game.bullets.length>=1);});
check('Soul call cannot trigger in pause or wardrobe',()=>{t.pauseGame();assert.equal(saga.unleash(),false);assert.equal(t.game.hero.soul,100);t.resumeGame();saga.openCharacter();assert.equal(saga.unleash(),false);});
check('Story milestones pause and never repeat; epilogue after wave 15',()=>{t.game.wave=3;t.endWave();t.selectPerk({name:'Test',apply(){}});assert.equal(t.state,'story');assert.match(element('storyTitle').textContent,/Siegel/);saga.continueStory();assert.equal(saga.chapter(4),false);t.game.wave=15;t.endWave();t.selectPerk({name:'Test',apply(){}});assert.equal(t.state,'story');assert.match(element('storyTitle').textContent,/Erinnerung/);saga.continueStory();assert.equal(t.state,'playing');assert.equal(element('sagaComplete').classList.contains('hidden'),false);});
check('Run animation switches sprite frames and preserves idle pose',()=>{draws.length=0;const h=t.game.hero;saga.draw(context,h);assert.ok(draws.some(d=>d[0].src.endsWith('kael-idle-v1.png')));draws.length=0;saga.update(.24,true,{x:-1,y:0});saga.draw(context,h);assert.ok(draws.some(d=>/kael-step-[ab]-v1.png/.test(d[0].src)));assert.equal(h.faceX,-1);});
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
  t.startGame(2);assert.equal(t.game.level,2);assert.equal(t.game.wave,6);assert.equal(t.game.essence,120);assert.equal(t.game.maxTowers,6);
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
check('Cannon splash hits a nearby group while bow stays single-target',()=>{t.launchWave();const h=t.game.hero;h.fireCd=100;const m=t.game.monument;t.game.towers=[{x:m.x+220,y:m.y+100,kind:'cannon',level:1,damage:34,fireRate:1.15,fireCd:-1,range:275}];const e={x:m.x+220,y:m.y+170,hp:1000,maxHp:1000,r:12,speed:0,damage:0,attackCd:5,hit:0,type:'wraith'},other={...e,x:e.x+30};t.game.enemies=[e,other];for(let i=0;i<12;i++)t.update(.02);assert.ok(e.hp<1000);assert.ok(other.hp<1000);assert.ok(e.hp<other.hp);});
check('Roads and monument remain clear of towers',()=>{const m=t.game.monument;assert.equal(t.placementError({x:m.x+200,y:m.y}),'NEBEN DEM WEG BAUEN');assert.equal(t.placementError({x:m.x+200,y:m.y+100}),'');});
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const m of html.matchAll(/(?:src|href)="([^"?#]+)(?:\?[^\"]*)?"/g))assert.ok(fs.existsSync(path.join(root,m[1])),m[1]);
assert.equal(html.includes('KAEL'),false);
console.log(`${tests.length} gameplay checks passed; local assets verified.\n`+tests.join('\n'));
