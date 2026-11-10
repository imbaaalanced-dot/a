'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
// Reuse the same engine bootstrap as campaign-20-integration.test.cjs.
const original=fs.readFileSync(path.join(__dirname,'game.test.cjs'),'utf8');
let setup=original.slice(0,original.indexOf("if(process.env.TEST_MOBILE==='1'){") );
if(!setup)throw Error('game VM bootstrap unavailable');
const hook="vm.runInContext(fs.readFileSync(path.join(root,'levels.js'),'utf8'),sandbox);";
if(!setup.includes(hook))throw Error('planner injection point unavailable');
setup=setup.replace(hook,"vm.runInContext(fs.readFileSync(path.join(root,'campaign-20-wave-plan.js'),'utf8'),sandbox);"+hook);
setup=setup.replace("source=source.replace('lootModel,drawMonument,','lootModel,drawMonument,drawEnemy,');", "source=source.replace('lootModel,drawMonument,','lootModel,resetGame:reset,drawMonument,drawEnemy,');");
setup=setup.replace('vm.runInContext(source,sandbox);',"sandbox.Math=Object.create(Math);sandbox.Math.random=()=>.5;source=source.replace('get state(){return state}', 'get state(){return state},set state(v){state=v}');vm.runInContext(source,sandbox);");
const checks=String.raw`
const T=sandbox.test,B=sandbox.DenkmalBarracks,P=sandbox.DenkmalCampaign20;
function fixture(level=1,wave=1,tier=1){
 T.startGame(1);T.resetGame(level,'campaign');T.state='playing';const g=T.game;
 g.wave=wave;g.intermission=9999;g.hero.x=2800;g.hero.y=2800;g.hero.fireCd=9999;
 const tower={kind:'barracks',x:200,y:200,level:tier,recruitCd:9999};g.towers=[tower];
 const u=B.makeUnit(tower,[]);Object.assign(u,{x:200,y:200,rally:{x:200,y:200},aliveTime:2,mode:'idle'});g.militia=[u];return {g,u,tower};
}
let matchups=0,bossCases=0;
for(const tier of [1,2,3])for(const type of Object.keys(T.enemySpecs)){
 const {g,u}=fixture(1,1,tier);T.spawnEnemy(type);const e=g.enemies[0];e.x=205;e.y=200;e.speed=0;
 const hp=e.hp,allyHP=u.hp;T.update(1/60);
 assert.equal(e.hp<hp,!e.flying,'ground-only militia damage: '+tier+'/'+type);
 const retaliates=!e.flying&&!e.focusMonument&&!['sapper','uprooted'].includes(type);
 assert.equal(u.hp<allyHP,retaliates,'enemy response: '+tier+'/'+type);matchups++;
}
// Real chapter-local boss waves: 7 maps × 2 boss waves × all 3 tiers.
for(let level=1;level<=7;level++)for(const localWave of [10,20])for(const tier of [1,2,3]){
 const wave=P.chapter(level).firstWave+localWave-1,{g,u}=fixture(level,wave,tier);
 T.spawnEnemy();const e=g.enemies[0];assert.equal(e.type,level===3?'uprooted':'boss');
 e.x=205;e.y=200;e.speed=0;const hp=e.hp;T.update(1/60);
 assert.ok(e.hp<hp,'militia reaches chapter boss');
 if(level===3)assert.equal(u.hp,u.maxHp,'Entwurzelter retains monument focus');
 else assert.ok(u.hp<u.maxHp,'Belagerer counterattacks militia');
 assert.ok(Number.isFinite(e.hp)&&Number.isFinite(u.hp));bossCases++;
}
// Every campaign wave can coexist with recruits; no completed-run claim.
let waveCases=0;
for(let level=1;level<=7;level++)for(let localWave=1;localWave<=20;localWave++){
 const wave=P.chapter(level).firstWave+localWave-1,{g,u}=fixture(level,wave,3);
 T.spawnEnemy();const e=g.enemies[0];assert.ok(e&&e.type);T.update(1/60);
 assert.equal(T.state,'playing');assert.ok(g.militia.includes(u));waveCases++;
}
console.log(JSON.stringify({seed:'constant random 0.5',matchups,bossCases,waveCases,scope:'stationary contact and single-step campaign smoke; NOT full wave wins, Android, or complete balance acceptance'},null,2));
`;
vm.runInNewContext(setup+checks,{require,process,console,__dirname,setTimeout,clearTimeout},{filename:__filename,timeout:20000});
