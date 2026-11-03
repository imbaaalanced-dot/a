'use strict';
const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createRenderSandbox}=require('./render-sandbox.cjs');
const root=path.resolve(__dirname,'../..');
function read(file,ref){return ref?execFileSync('git',['show',`${ref}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:2e6}):fs.readFileSync(path.join(root,file),'utf8');}
function mathBox(instrument=false){let seed=0x12345678,calls=0;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};if(instrument)math.hypot=(...args)=>{calls++;return Math.hypot(...args);};return {math,calls:()=>calls};}
function model(ref,instrument=false){const m=mathBox(instrument),box={Math:m.math};vm.createContext(box);vm.runInContext(read('ansturm-alpha1-5/config.js',ref).replaceAll('export ',''),box);vm.runInContext(read('ansturm-alpha1-5/model.js',ref).replace(/^import .*\n/,'').replaceAll('export ','')+'\nglobalThis.api={createGame,step,spawnEnemy,damageEnemy,getStats};',box);return {...box.api,calls:m.calls};}
function ansturm(count,{ref,lethal=false,instrument=false,bossWave=20}={}){const api=model(ref,instrument),s=api.createGame({random:()=>.5});s.status='running';s.wave=bossWave;s.planned=count;
for(let i=0;i<count;i++){const e=api.spawnEnemy(s),a=i*2.399963229728653,r=.12+(i%11)*.045;e.x=Math.cos(a)*r;e.y=Math.sin(a)*r;e.hp=e.maxHp=lethal?60+i%7*25:1e8;e.burnUntil=1000;e.burnDps=3;e.slowUntil=i%2?2:0;}
s.hp=1e8;s.tech.hp=4e6;s.tech.range=15;s.tech.tempo=20;for(const k of Object.keys(s.upgrades))s.upgrades[k]=3;
return {state:s,tick:()=>api.step(s,1/30),calls:api.calls};}
function campaign(count,{ref,instrument=false,lethal=false,level=2,mixed=false}={}){const m=mathBox(instrument),sourceOverrides={};if(ref)for(const file of ['game.js','levels.js'])sourceOverrides[file]=read('dist/'+file,ref);
const h=createRenderSandbox({countOps:false,sourceOverrides,math:m.math,initialStorage:{'td2-v4-intro-tutorial':'done'}}),t=h.test;t.startGame(1);h.sandbox.HeroSaga.continueStory?.();const g=t.getGame();g.level=level;g.wave=3;g.intermission=0;g.waveTotal=g.waveSpawned=count;g.monument.hp=g.monument.maxHp=1e9;g.hero.hp=g.hero.maxHp=1e9;g.hero.invuln=1e9;
// The production cap remains 40. Inject fixtures directly for deliberate overload.
t.spawnEnemy('normal');const template=g.enemies[0];g.enemies=[];g.waveSpawned=count;
const specimens=[];if(mixed){g.enemies=[];for(const type of ['runner','guardian','boss','uprooted','shadowwing','gargoyle','stormwing','mistcaller','sapper']){t.spawnEnemy(type);specimens.push(g.enemies.at(-1));}g.enemies=[];g.waveSpawned=count;}
const kinds=['bow','cannon','mage','rift','ballista','mortar','boomerang'];
for(let i=0;i<count;i++){const base=mixed?specimens[i%specimens.length]:template;const e={...base,spawnId:String(i+1),type:mixed?base.type:i%9===0?'archer':'normal',gateIndex:i%h.sandbox.DenkmalLevels.levels[level].paths.length,waypoint:1,x:1430+(i%13)*18,y:1390+Math.floor(i/13)*20,hp:lethal?80:1e8,maxHp:lethal?80:1e8,prevX:1430+(i%13)*18,prevY:1390+Math.floor(i/13)*20};g.enemies.push(e);}
for(let i=0;i<14;i++)g.towers.push({x:1330+i%7*60,y:1350+Math.floor(i/7)*240,r:18,range:420,damage:15,fireRate:.3+i%3*.2,fireCd:i%4*.08,kind:kinds[i%kinds.length],level:i%3+1,targetMode:['first','nearest','strongest','boss'][i%4]});
return {state:g,tick:()=>t.update(1/60),calls:m.calls,h};}
function snapshot(s){if(s.hero)return {elapsed:s.elapsed,hero:s.hero,monument:s.monument,enemies:s.enemies,bullets:s.bullets,towers:s.towers,kills:s.kills,waveKilled:s.waveKilled,wave:s.wave,waveSpawned:s.waveSpawned,essence:s.essence,loot:s.loot,particles:s.particles,deathFx:s.deathFx};const {random,...rest}=s;return rest;}
module.exports={read,model,ansturm,campaign,snapshot};
