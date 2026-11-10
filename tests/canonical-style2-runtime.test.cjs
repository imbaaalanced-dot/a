'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.join(__dirname,'../dist');
const source=name=>fs.readFileSync(path.join(root,name),'utf8');

function canvas(){
  const draws=[];
  return {draws,save(){},restore(){},translate(){},rotate(){},scale(){},beginPath(){},ellipse(){},arc(){},fill(){},stroke(){},fillRect(){},moveTo(){},lineTo(){},closePath(){},drawImage(...args){draws.push(args);}};
}

test('cold hero walk renders no competing legacy identity or expansion sprite',()=>{
  const loaded=[];
  class Image{
    constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
    set src(value){loaded.push(value);this._src=value;}
    get src(){return this._src;}
  }
  let expansionCalls=0;
  const box={Image,Math,matchMedia:()=>({matches:false}),document:{getElementById:()=>({})},DenkmalArt:{draw(){throw Error('legacy hero renderer should not run');}},
    V2Expansion:{hero(){expansionCalls++;return true;}},TD2DirectionalActions:{preloadHeroSide(){},hero(){return false;}}};
  box.globalThis=box;
  vm.runInNewContext(source('hero-saga.js'),box);
  const hero={character:'marcel',hp:100,maxHp:100,x:12,y:34,moving:false,dodge:0,faceX:0,faceY:1,direction:'down',hitFlash:0,equipment:{armor:'none',relic:'none',weapon:'none'}};
  box.HeroSaga.draw(canvas(),hero);
  assert.equal(expansionCalls,0);
  assert.equal(loaded.length,1,'only the chosen V5b walk image may load');
  assert.match(loaded[0],/marcel-walk-style2\.webp/);
});

test('unpainted combat facing must keep the V5b walk identity without fetching old action atlases',()=>{
  const retained=[];
  const box={Math,Date,DenkmalAssets:{retain(group,urls){retained.push(...urls);return Promise.resolve([]);},ready(){return null;},release(){}}};
  box.globalThis=box;
  for(const file of ['directional-assets-v410.js','directional-hero-assets-v5.js','directional-actions-v410.js'])vm.runInNewContext(source(file),box);
  const hero={character:'marcel',hp:100,hitFlash:.1,direction:'up'};
  assert.equal(box.TD2DirectionalActions.hero(canvas(),hero,0,false,1),false);
  assert.deepEqual(retained,[],'no old 4x12 atlas may be requested for unsupported facings');
  assert.equal(box.TD2DirectionalAssets.marcel,undefined,'hero old action manifests are no longer active');
  assert.equal(box.TD2DirectionalAssets.kim,undefined,'hero old action manifests are no longer active');
});

test('game towers never cascade to old style2, elemental or old image families',()=>{
  const {box,t,draws}=require('./helpers/game.cjs')();
  let alternatives=0,canonical=0;
  box.UserStyle2Towers={drawTower(){canonical++;return false;}};
  for(const name of ['Style2Cannon','Style2Towers','ElementalSprites'])box[name]={drawTower(){alternatives++;return true;}};
  for(const kind of ['bow','cannon','mage','rift','boomerang']){
    for(let level=1;level<=3;level++){
      draws.length=0;
      t.drawTower({kind,level,x:250,y:350});
      assert.ok(!draws.some(args=>/\/tower-(?:bow|cannon|mage|rift|boomerang)-/i.test(args[0]?.src||'')),`legacy image requested for ${kind} ${level}`);
    }
  }
  assert.equal(canonical,15,'every tier uses the one canonical adapter');
  assert.equal(alternatives,0,'old rendering engines remain inactive');
  assert.doesNotMatch(source('game.js'),/tower-boomerang-atlas\.webp/,'obsolete boomerang must not be fetched at startup');
});

test('projectile loading uses a neutral effect without fetching or rendering obsolete art',()=>{
  const loaded=[];
  const box={Math,Image:class{set src(v){loaded.push(v);}}};box.globalThis=box;
  vm.runInNewContext(source('combat-fx.js'),box);
  let oldCalls=0;
  box.Style2Cannon={drawProjectile(){oldCalls++;return true;}};
  box.Style2Towers={drawProjectile(){oldCalls++;return true;}};
  box.DenkmalCombatFX.draw(canvas(),{x:0,y:0,kind:'cannon',level:1,r:4,vx:10,vy:0,color:'#dab789'},true);
  assert.equal(oldCalls,0,'old projectile renderers must not run');
  assert.equal(loaded.length,0,'no legacy SVG atlas download');
});
