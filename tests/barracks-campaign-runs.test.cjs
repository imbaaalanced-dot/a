'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
// Reuse the same engine bootstrap as campaign-20-integration.test.cjs.
const original=fs.readFileSync(path.join(__dirname,'game.test.cjs'),'utf8');
let setup=original.slice(0,original.indexOf("if(process.env.TEST_MOBILE==='1'){") );
if(!setup)throw Error('game VM bootstrap unavailable');
const hook="vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);";
if(!setup.includes(hook))throw Error('planner injection point unavailable');
setup=setup.replace(hook,"vm.runInContext(fs.readFileSync(path.join(root,'campaign-20-wave-plan.js'),'utf8'),sandbox);"+hook);
setup=setup.replace("source=source.replace('lootModel,drawMonument,','lootModel,drawMonument,drawEnemy,');", "source=source.replace('lootModel,drawMonument,','lootModel,towerSpecs,resetGame:reset,drawMonument,drawEnemy,');");
setup=setup.replace('vm.runInContext(source,sandbox);',"sandbox.Math=Object.create(Math);sandbox.Math.random=()=>.5;source=source.replace('get state(){return state}', 'get state(){return state},set state(v){state=v}');vm.runInContext(source,sandbox);");
const checks=String.raw`
const T=sandbox.test,P=sandbox.DenkmalCampaign20;
const scenarios=[{name:'ranged-control',types:['bow','cannon','mage','rift']},{name:'one-barracks',types:['bow','barracks','mage','rift']},{name:'two-barracks',types:['bow','barracks','barracks','rift']}];
const results=[];
for(let level=1;level<=7;level++)for(const scenario of scenarios){
 T.startGame(1);T.resetGame(level,'campaign');T.state='playing';const g=T.game;
 // Controlled late-game loadout, not the normal campaign economy or a player run.
 g.essence=600;const initialGold=g.essence;
 const slots=sandbox.DenkmalLevels.levels[level].slots;
 assert.ok(slots.length>=4);
 scenario.types.forEach((kind,i)=>{
  const slot=slots[i];g.hero.x=slot.x;g.hero.y=slot.y+58;T.facing={x:0,y:-1};
  T.selectTower(kind);T.buildTower();assert.equal(g.towers.length,i+1,'legal tower placement '+level+'/'+kind);
  const tower=g.towers[i];T.upgradeTower(tower);T.upgradeTower(tower);assert.equal(tower.level,3);
 });
 const cost=initialGold-g.essence;
 g.hero.x=g.monument.x;g.hero.y=g.monument.y+100;
 const bossWaves=new Set();let steps=0,maxActive=0,maxRetained=0,maxEnemies=0;
 for(;steps<60*1800;steps++){
  if(['gameover','levelcomplete'].includes(T.state))break;
  if(T.state==='story'){saga.continueStory();continue;}
  if(T.state==='perk'){T.selectPerk(T.getPerks()[0]);continue;}
  assert.equal(T.state,'playing');T.update(1/60);
  const active=g.militia.filter(u=>u.hp>0).length;
  maxActive=Math.max(maxActive,active);maxRetained=Math.max(maxRetained,g.militia.length);maxEnemies=Math.max(maxEnemies,g.enemies.length);
  assert.ok(active<=10&&g.militia.length<=20,'bounded live and death-animation lists');
  for(const u of g.militia)assert.ok(Number.isFinite(u.x)&&Number.isFinite(u.y)&&Number.isFinite(u.hp));
  for(const e of g.enemies){assert.ok(Number.isFinite(e.x)&&Number.isFinite(e.y)&&Number.isFinite(e.hp));if(['boss','uprooted'].includes(e.type))bossWaves.add(g.wave-P.chapter(level).firstWave+1);}
  assert.ok(Number.isFinite(g.hero.hp)&&Number.isFinite(g.monument.hp)&&Number.isFinite(g.essence));
 }
 assert.ok(['gameover','levelcomplete'].includes(T.state),'run reaches a real terminal result within 30 simulated minutes');
 results.push({level,scenario:scenario.name,fixtureBudget:initialGold,loadoutCost:cost,result:T.state,wave:g.wave-P.chapter(level).firstWave+1,simulatedSeconds:Math.round(g.elapsed*100)/100,kills:g.kills,heroHp:Math.round(g.hero.hp*100)/100,monumentHp:Math.round(g.monument.hp*100)/100,bossWaves:[...bossWaves],maxActive,maxRetained,maxEnemies});
}
const output={seed:'constant 0.5',scope:'stationary hero; 600 essence and four tier-3 towers at chapter start; natural damage, spawns and loss; not normal campaign wins or complete balance acceptance',results};
if(process.env.TD2_BARRACKS_RUNS_OUT)fs.writeFileSync(process.env.TD2_BARRACKS_RUNS_OUT,JSON.stringify(output,null,2));
console.log(JSON.stringify(output,null,2));
`;
vm.runInNewContext(setup+checks,{require,process,console,__dirname,setTimeout,clearTimeout},{filename:__filename,timeout:120000});
