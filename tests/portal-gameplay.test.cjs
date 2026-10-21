const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),path=require('path');
// Reuse the existing DOM/canvas fixture, before its gameplay assertions.
let fixture=fs.readFileSync(path.join(__dirname,'game.test.cjs'),'utf8').split("if(process.env.TEST_MOBILE==='1'){")[0];
fixture=fixture.replace("let source=fs.readFileSync", "for(const file of ['portal-run.js','portal-perks.js','campaign-balance.js'])if(fs.existsSync(path.join(root,file)))vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),sandbox);\nlet source=fs.readFileSync");
const {t,sandbox}=new Function('require','__dirname',fixture+';return {t,sandbox};')(require,__dirname);
const h=sandbox.DenkmalTestHooks;assert.equal(typeof h.startPortalRun,'function');
assert.equal(h.startPortalRun({resume:false}),true);assert.equal(t.game.mode,'portal');assert.equal(t.game.essence,75);assert.equal(t.game.monument.hp,100);
assert.equal(h.getPortalRun().phase,'build');h.launchWave();assert.equal(h.getPortalRun().phase,'combat');
t.game.enemies=[];t.game.waveSpawned=t.game.waveTotal;h.endWave();assert.equal(h.getPortalRun().waveInSection,2);assert.equal(h.getPortalRun().phase,'build');
h.launchWave();h.endWave();assert.equal(h.getPortalRun().phase,'perk');assert.equal(sandbox.document.getElementById('perkGrid').children.length,3);
sandbox.document.getElementById('perkGrid').children[0].onclick();assert.equal(h.getPortalRun().phase,'exit');
const expectedHeal=45+t.game.hero.maxHp*(.1+.03*(h.getPortalRun().perkRanks.recovery||0));t.game.hero.hp=45;t.game.essence=10;t.game.towers=[{spent:25},{spent:60}];h.enterPortal();assert.equal(h.getPortalRun().section,2);assert.equal(t.game.essence,113.75);assert.equal(t.game.hero.hp,expectedHeal);h.enterPortal();assert.equal(h.getPortalRun().section,2);
assert.equal(t.lootModel.profile.level2,false);assert.equal(t.lootModel.count,0);
console.log('portal gameplay: waves, perk UI, physical exit accounting and unlock isolation passed');
h.launchWave();assert.doesNotThrow(()=>h.spawnEnemy());assert(Number.isFinite(t.game.enemies[0].hp));
const waveCount=t.game.waveSpawned;while(t.game.enemies.length<40)t.game.enemies.push({...t.game.enemies[0]});h.spawnEnemy();assert.equal(t.game.waveSpawned,waveCount);
// Future towers use derived range without accumulating mutations.
h.startPortalRun({resume:false});const run=h.getPortalRun();run.perkRanks.reach=3;run.perkRanks.precision=3;run.perkRanks.choke=3;run.perkRanks.mark=3;
const tower={x:1500,y:1500,range:100,kind:'bow',damage:10,fireRate:1,fireCd:0};
t.game.enemies=[{x:1610,y:1500,hp:500,maxHp:500,r:12,dead:false,type:'wraith',gateIndex:0}];
assert.equal(t.towerTarget(tower),t.game.enemies[0]);
t.shoot(tower,t.game.enemies[0],10);assert.equal(t.game.bullets[0].damage,12.4);
assert.equal(h.portalHit(t.game.enemies[0],10,{heroShot:true}),10);
assert.equal(h.portalHit(t.game.enemies[0],10,{towerShot:true}),13.5);
assert.equal(t.game.enemies[0].slowFactor,.84);
assert.equal(h.portalHit(t.game.enemies[0],10,{towerShot:true}),10);
// Resume restores post-selection life and investment without another perk.
h.startPortalRun({resume:false});h.launchWave();h.endWave();h.launchWave();h.endWave();
const choice=h.getPortalRun().offers.find(id=>id!=='endurance')||h.getPortalRun().offers[0];sandbox.document.getElementById('perkGrid').children[h.getPortalRun().offers.indexOf(choice)].onclick();
const chosenRanks=JSON.stringify(h.getPortalRun().perkRanks);assert.equal(h.startPortalRun({resume:true}),true);assert.equal(h.getPortalRun().phase,'exit');assert.equal(JSON.stringify(h.getPortalRun().perkRanks),chosenRanks);
for(let section=2;section<=3;section++){h.enterPortal();assert.equal(h.getPortalRun().section,section);h.launchWave();h.endWave();h.launchWave();if(section===3){
 h.spawnEnemy('boss');t.hurtEnemy(t.game.enemies[0],1e9,{fixedDamage:true});
 const owned=t.lootModel.profile.owned.length;
 assert.equal(h.startPortalRun({resume:true}),true);h.launchWave();h.spawnEnemy('boss');
 t.hurtEnemy(t.game.enemies[0],1e9,{fixedDamage:true});
 assert.equal(t.lootModel.profile.owned.length,owned,'resuming the boss wave must not duplicate equipment');
}h.endWave();if(section===2)sandbox.document.getElementById('perkGrid').children[0].onclick();}
assert.equal(h.getPortalRun().phase,'finished');assert.equal(t.state,'gameover');assert.equal(t.lootModel.count,1);assert.equal(t.lootModel.profile.level2,false);
h.startPortalRun({resume:false});t.game.monument.hp=63;h.launchWave();assert.equal(h.startPortalRun({resume:true}),true);assert.equal(t.game.monument.hp,63);
// A build phase must not create enemies until manually started.
h.update(.5);assert.equal(t.game.enemies.length,0);
// First room has one incoming lane, then the journey opens more fronts.
h.launchWave();h.spawnEnemy();h.spawnEnemy();assert.equal(t.game.enemies[0].gateIndex,t.game.enemies[1].gateIndex);
h.startPortalRun({resume:false});assert.equal(t.enemyTypeForSpawn(5,0),'wraith');assert(!t.wavePreview(5).includes('BOSS'));
