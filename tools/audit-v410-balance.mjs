// Deterministic model audit. No DOM, synthetic combat or wall-clock timings.
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const source=p=>readFileSync(resolve(root,p),'utf8');
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
 const bonus=Number(text.match(/(?:campaignWaveLabel\(game\.wave\)|game\.wave)===4\|\|(?:campaignWaveLabel\(game\.wave\)|game\.wave)===8\)\{game\.essence\+=(\d+)/)[1]);
 const ctx={game:{level:1,mode:'campaign'},inPortal:()=>false,globalThis:{FlightEnemies:{specs:{}}},definition:{},level:1};
 vm.createContext(ctx);vm.runInContext(source('dist/campaign-20-wave-plan.js'),ctx);vm.runInContext(`const campaign20=globalThis.DenkmalCampaign20;\n${towers}\n${enemies}\n${waves}\nglobalThis.result={towerSpecs,enemySpecs,waveSize,enemyTypeForSpawn,start:${startExpr}}`,ctx);
 const {towerSpecs,enemySpecs,waveSize,enemyTypeForSpawn,start}=ctx.globalThis.result;
 const rows=Array.from({length:5},(_,i)=>{const wave=i+1,count=waveSize(wave),types={};let bounty=0,loot=0;for(let j=0;j<count;j++){const type=enemyTypeForSpawn(wave,j);types[type]=(types[type]||0)+1;bounty+=enemySpecs[type].bounty;loot+=type==='boss'?drop:1;}return {wave,count,types,bounty,lootLowerBound:0,lootUpperBound:loot*lootValue,chapterBonusOnEntry:wave===4?bonus:0};});
 const costs=Object.fromEntries(Object.entries(towerSpecs).map(([id,s])=>[id,s.cost]));
 return {startEssence:start,towerCosts:costs,openings:{twoBow:{spent:2*costs.bow,remaining:start-2*costs.bow},twoCannon:{spent:2*costs.cannon,remaining:start-2*costs.cannon},bowCannon:{spent:costs.bow+costs.cannon,remaining:start-costs.bow-costs.cannon}},waves:rows,interpretation:'Bounty assumes every enemy is killed or retired. Loot bounds allow every drop to expire versus every drop collected; no double counting collected and end-wave loot. No perk, sale, route, damage or human success simulation.'};
}
export function audit(){return {version:'4.1.0',sourceSha256:{'dist/game.js':createHash('sha256').update(source('dist/game.js')).digest('hex')},campaign:campaignOpening()};}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url){const report=audit();if(process.argv[2])writeFileSync(resolve(process.argv[2]),JSON.stringify(report,null,2)+'\n');else console.log(JSON.stringify(report,null,2));}
