// Deterministic model audit. No DOM, synthetic combat or wall-clock timings.
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import {createGame,getStats,quotePurchase,purchase,nextWave,step} from '../ansturm-alpha1-5/model.js';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=p=>readFileSync(resolve(root,p),'utf8');
export const STRATEGIES={
 balanced:['attack','tempo','range','hp','multishot','regen','frost','shield','explosion','gold','tesla','fire','pierce'],
 chain:['attack','tempo','range','tesla','multishot','frost','hp','regen'],
 splash:['attack','tempo','range','explosion','fire','multishot','hp','regen'],
 defense:['hp','regen','shield','attack','tempo','frost','range','pierce']
};
function seeded(seed){let n=seed>>>0;return ()=>{n=(Math.imul(n,1664525)+1013904223)>>>0;return n/4294967296;};}
const rounded=n=>Number(n.toFixed(6));
// Repeated rounds through fixed priorities: buy each available item once per round.
// A 256-round bound prevents unbounded purchasing even for synthetic budgets.
function buy(s,priority,ledger){for(let round=0;round<256;round++){let bought=false;for(const id of priority){const q=quotePurchase(s,id);if(q.available&&Number.isFinite(q.price)&&q.price>0&&purchase(s,id)){ledger.spent+=q.price;ledger.counts[id]=(ledger.counts[id]||0)+1;bought=true;}}if(!bought)break;}}
export function simulate({strategy='balanced',seed=17,startWave=1,endWave=15,budget=100,maxSeconds=900}={}){
 if(!STRATEGIES[strategy]||!Number.isSafeInteger(startWave)||startWave<1||endWave<startWave||!Number.isFinite(budget)||budget<0)throw new Error('Invalid audit scenario');
 const s=createGame({random:seeded(seed)}),ledger={spent:0,counts:{}};
 s.gold=budget;s.wave=startWave-1;buy(s,STRATEGIES[strategy],ledger);nextWave(s);
 let ticks=0,earned=0,maxEffects=0,maxEnemies=0,minHp=s.hp,lastWave=s.wave;const samples=[];
 const sample=()=>samples.push({wave:s.wave,status:s.status,hp:rounded(s.hp),gold:s.gold,kills:s.kills,goldSpent:ledger.spent,goldEarned:earned});
 sample();
 while(s.status!=='lost'&&ticks<Math.ceil(maxSeconds*30)){
  const goldBefore=s.gold;step(s,1/30);ticks++;earned+=s.gold-goldBefore;
  maxEffects=Math.max(maxEffects,s.effects.length);maxEnemies=Math.max(maxEnemies,s.enemies.length);minHp=Math.min(minHp,s.hp);
  if(ticks%30===0&&s.status!=='lost')buy(s,STRATEGIES[strategy],ledger);
  if(s.status==='intermission'&&s.wave>=endWave)break;
  if(s.wave!==lastWave){sample();lastWave=s.wave;}
 }
 sample();
 const stats=getStats(s);
 if(![s.hp,s.gold,...Object.values(stats)].every(Number.isFinite))throw new Error('Non-finite simulation state');
 if(s.gold!==budget+earned-ledger.spent)throw new Error('Economy ledger does not reconcile');
 return {strategy,seed,startWave,endWave,initialGold:budget,funding:startWave===1&&budget===100?'natural opening':'synthetic window; no reachability claim',outcome:s.status==='lost'?'lost':s.status==='intermission'&&s.wave>=endWave?'completed':'timeout',deaths:s.status==='lost'?1:0,lastWave:s.wave,kills:s.kills,seconds:rounded(ticks/30),hp:rounded(s.hp),minHp:rounded(minHp),finalGold:s.gold,goldSpent:ledger.spent,goldEarned:earned,upgradeDiversity:Object.keys(ledger.counts).length,weaponDiversity:Object.values(s.upgrades).filter(level=>level>0).length,researchDiversity:Object.values(s.tech).filter(level=>level>0).length,purchases:ledger.counts,tech:{...s.tech},upgrades:{...s.upgrades},stats,maxEffects,maxEnemies,samples};
}
function between(text,a,b){const start=text.indexOf(a),end=text.indexOf(b,start);if(start<0||end<0)throw new Error(`Campaign source boundary missing: ${a}`);return text.slice(start,end);}
export function campaignOpening(){
 const text=source('dist/game.js');
 const towers=between(text,'const towerSpecs=','// Enemy pressure pass:');
 const enemies=between(text,'const enemySpecs=','const waveSizes=');
 const waves=between(text,'const waveSizes=','const wavePlans=');
 const reset=between(text,'function reset(','function cameraLead(');
 const startExpr=reset.match(/essence:([^,]+),deathFx/)[1];
 const collect=between(text,'function collectWaveLoot()','\n');
 const lootValue=Number(collect.match(/game\.loot\.length\*(\d+)/)[1]);
 const drop=Number(text.match(/isBoss\(e\)\?(\d+):1/)[1]);
 const bonus=Number(text.match(/game\.wave===4\|\|game\.wave===8\)\{game\.essence\+=(\d+)/)[1]);
 const ctx={game:{level:1,mode:'campaign'},inPortal:()=>false,globalThis:{FlightEnemies:{specs:{}}},definition:{},level:1};
 vm.createContext(ctx);vm.runInContext(`${towers}\n${enemies}\n${waves}\nglobalThis.result={towerSpecs,enemySpecs,waveSize,enemyTypeForSpawn,start:${startExpr}}`,ctx);
 const {towerSpecs,enemySpecs,waveSize,enemyTypeForSpawn,start}=ctx.globalThis.result;
 const rows=Array.from({length:5},(_,i)=>{const wave=i+1,count=waveSize(wave),types={};let bounty=0,loot=0;for(let j=0;j<count;j++){const type=enemyTypeForSpawn(wave,j);types[type]=(types[type]||0)+1;bounty+=enemySpecs[type].bounty;loot+=type==='boss'?drop:1;}return {wave,count,types,bounty,lootLowerBound:0,lootUpperBound:loot*lootValue,chapterBonusOnEntry:wave===4?bonus:0};});
 const costs=Object.fromEntries(Object.entries(towerSpecs).map(([id,s])=>[id,s.cost]));
 return {startEssence:start,towerCosts:costs,openings:{twoBow:{spent:2*costs.bow,remaining:start-2*costs.bow},twoCannon:{spent:2*costs.cannon,remaining:start-2*costs.cannon},bowCannon:{spent:costs.bow+costs.cannon,remaining:start-costs.bow-costs.cannon}},waves:rows,interpretation:'Bounty assumes every enemy is killed or retired. Loot bounds allow every drop to expire versus every drop collected; no double counting collected and end-wave loot. No perk, sale, route, damage or human success simulation.'};
}
export function audit({seeds=[17,71,410],windows=[{name:'early',startWave:1,endWave:15,budget:100},{name:'mid',startWave:20,endWave:24,budget:10000},{name:'high',startWave:100,endWave:104,budget:100000}]}={}){
 const files=['ansturm-alpha1-5/model.js','ansturm-alpha1-5/config.js','dist/game.js'];
 return {version:'4.1.0',method:{dt:1/30,purchaseEverySeconds:1,seeds,windows,strategies:STRATEGIES,maxSecondsPerRun:900,limitations:['Fixed scripted purchasers, no human win-rate estimate','Mid/high windows inject documented gold; no claim of naturally reachable builds','No Android FPS/RAM, rendering, UI, player movement or campaign combat estimate','Effects/enemy maxima are observed values in these runs, not device performance guarantees']},sourceSha256:Object.fromEntries(files.map(p=>[p,createHash('sha256').update(source(p)).digest('hex')])),campaign:campaignOpening(),runs:windows.flatMap(window=>Object.keys(STRATEGIES).flatMap(strategy=>seeds.map(seed=>({window:window.name,...simulate({...window,strategy,seed})}))))};
}
export function compareBaseline(report,baseline){
 const key=r=>[r.window,r.strategy,r.seed].join('/');
 const old=new Map(baseline.runs.map(r=>[key(r),r]));
 return report.runs.map(r=>{const b=old.get(key(r));if(!b)throw new Error('Baseline scenario missing');return {scenario:key(r),before:{outcome:b.outcome,lastWave:b.lastWave,kills:b.kills,hp:b.hp,goldEarned:b.goldEarned,goldSpent:b.goldSpent},after:{outcome:r.outcome,lastWave:r.lastWave,kills:r.kills,hp:r.hp,goldEarned:r.goldEarned,goldSpent:r.goldSpent}};});
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){
 const report=audit(),output=process.argv[2],baselineFlag=process.argv.indexOf('--baseline');
 let baseline;
 if(baselineFlag>=0){const original=JSON.parse(readFileSync(resolve(process.argv[baselineFlag+1]),'utf8'));baseline=original.baseline||original;}
 else if(output&&existsSync(resolve(output)))baseline=JSON.parse(readFileSync(resolve(output),'utf8')).baseline;
 if(baseline){report.baseline=baseline;report.comparison=compareBaseline(report,baseline);}
 if(output)writeFileSync(resolve(output),JSON.stringify(report,null,2)+'\n');else console.log(JSON.stringify(report,null,2));
}
