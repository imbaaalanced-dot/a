'use strict';
const fs=require('node:fs'),path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createRenderSandbox}=require('./render-sandbox.cjs');
const root=path.resolve(__dirname,'../..');
let baseline;
function baselineSource(file){
 baseline??=require('../fixtures/simulation-baseline-e4d6134.json');
 const item=baseline.files[file];if(!item)throw Error('Missing baseline source: '+file);
 const bytes=require('node:zlib').gunzipSync(Buffer.from(item.gzipBase64,'base64'));
 if(require('node:crypto').createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('Baseline integrity failure: '+file);
 return bytes.toString('utf8');
}
function read(file,ref){if(ref==='baseline')return baselineSource(file);return ref?execFileSync('git',['show',`${ref}:${file}`],{cwd:root,encoding:'utf8',maxBuffer:2e6}):fs.readFileSync(path.join(root,file),'utf8');}
function mathBox(instrument=false){let seed=0x12345678,calls=0;const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};if(instrument)math.hypot=(...args)=>{calls++;return Math.hypot(...args);};return {math,calls:()=>calls};}
function campaign(count,{ref,layoutRef=ref,instrument=false,lethal=false,level=2,mixed=false,reducedMotion=false,legacyTowersOnly=false}={}){const m=mathBox(instrument),sourceOverrides={};if(ref)sourceOverrides['game.js']=read('dist/game.js',ref);sourceOverrides['levels.js']=read('dist/levels.js',layoutRef);
const h=createRenderSandbox({countOps:false,sourceOverrides,math:m.math,reducedMotion,initialStorage:{'td2-v4-intro-tutorial':'done','td2-developer-mode-v2':'disabled'}}),t=h.test;t.startGame(1);h.sandbox.HeroSaga.continueStory?.();const g=t.getGame();g.level=level;g.wave=3;g.intermission=0;g.waveTotal=g.waveSpawned=count;g.monument.hp=g.monument.maxHp=1e9;g.hero.hp=g.hero.maxHp=1e9;g.hero.invuln=1e9;
// The production cap remains 40. Inject fixtures directly for deliberate overload.
t.spawnEnemy('normal');const template=g.enemies[0];g.enemies=[];g.waveSpawned=count;
const specimens=[];if(mixed){g.enemies=[];for(const type of ['runner','guardian','boss','uprooted','shadowwing','gargoyle','stormwing','mistcaller','sapper']){t.spawnEnemy(type);specimens.push(g.enemies.at(-1));}g.enemies=[];g.waveSpawned=count;}
const kinds=legacyTowersOnly?['ballista','mortar','boomerang']:['bow','cannon','mage','rift','ballista','mortar','boomerang'];
for(let i=0;i<count;i++){const base=mixed?specimens[i%specimens.length]:template;const e={...base,spawnId:String(i+1),type:mixed?base.type:i%9===0?'archer':'normal',gateIndex:i%h.sandbox.DenkmalLevels.levels[level].paths.length,waypoint:1,x:1430+(i%13)*18,y:1390+Math.floor(i/13)*20,hp:lethal?80:1e8,maxHp:lethal?80:1e8,prevX:1430+(i%13)*18,prevY:1390+Math.floor(i/13)*20};g.enemies.push(e);}
for(let i=0;i<14;i++)g.towers.push({x:1330+i%7*60,y:1350+Math.floor(i/7)*240,r:18,range:420,damage:15,fireRate:.3+i%3*.2,fireCd:i%4*.08,kind:kinds[i%kinds.length],level:i%3+1,targetMode:['first','nearest','strongest','boss'][i%4]});
return {state:g,tick:()=>t.update(1/60),calls:m.calls,h};}
function snapshot(s){if(s.hero)return {elapsed:s.elapsed,hero:s.hero,monument:s.monument,enemies:s.enemies,bullets:s.bullets,towers:s.towers,kills:s.kills,waveKilled:s.waveKilled,wave:s.wave,waveSpawned:s.waveSpawned,essence:s.essence,loot:s.loot,particles:s.particles,deathFx:s.deathFx};const {random,...rest}=s;return rest;}
module.exports={read,campaign,snapshot};
