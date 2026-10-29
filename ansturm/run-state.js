import {createGame,getStats} from './model.js';
import {TECH,UPGRADES,ENEMY} from './config.js';

const scalarFields=['gold','hp','shield','wave','kills','elapsed','status','nextId','waveElapsed','spawned','planned','spawnClock','fireClock','intermission','lastDamage'];
const enemyFields=['id','x','y','type','spriteKey','hp','maxHp','speed','dps','gold','slowUntil','burnUntil','burnDps','alive'];
const bosses=['boss_stonebreaker','boss_stormlord','boss_shieldwarden','boss_colossus'];
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const finite=(v,min=0)=>Number.isFinite(v)&&v>=min;
const integer=(v,min=0)=>Number.isSafeInteger(v)&&v>=min;
const pick=(o,keys)=>Object.fromEntries(keys.map(k=>[k,o[k]]));
function levels(v,catalog,max=Number.MAX_SAFE_INTEGER){return record(v)&&Object.keys(v).length===Object.keys(catalog).length&&Object.keys(catalog).every(k=>Object.hasOwn(v,k)&&integer(v[k])&&v[k]<=max);}
function valid(s){
  if(!record(s)||!['running','intermission'].includes(s.status))return false;
  // Schema v1 has a bounded spawn budget; refuse corrupt saves before any simulation.
  if(s.wave>1000)return false;
  if(!levels(s.tech,TECH)||!levels(s.upgrades,UPGRADES,3))return false;
  if(!['gold','hp','shield','elapsed','waveElapsed','spawnClock','fireClock','intermission'].every(k=>finite(s[k])))return false;
  if(!['wave','nextId'].every(k=>integer(s[k],1))||!['kills','spawned','planned'].every(k=>integer(s[k])))return false;
  if(!Number.isFinite(s.lastDamage)||s.lastDamage>s.elapsed||s.waveElapsed>s.elapsed||s.hp<=0||s.spawned>s.planned)return false;
  const stats=getStats(s);
  if(!Object.values(stats).every(Number.isFinite)||s.hp>stats.maxHp||s.shield>stats.shieldCapacity)return false;
  // A payload must describe a real wave, not an unbounded synthetic spawn loop.
  if(s.planned!==10+3*s.wave+(s.wave%5===0?1:0)||!Array.isArray(s.enemies)||s.enemies.length>s.spawned)return false;
  if(s.status==='intermission'&&(s.enemies.length||s.spawned!==s.planned||s.intermission>5))return false;
  if(s.spawnClock>25/s.planned+1/30+1e-6)return false;
  const ids=new Set();
  for(const e of s.enemies){
    if(!record(e)||!integer(e.id,1)||e.id>=s.nextId||ids.has(e.id)||!Object.hasOwn(ENEMY,e.type)||e.alive!==true)return false;
    ids.add(e.id);
    if(!finite(e.x,-1)||e.x>1||!finite(e.y,-1)||e.y>1)return false;
    if(!['hp','maxHp','speed','dps','gold','slowUntil','burnUntil','burnDps'].every(k=>finite(e[k]))||e.hp<=0||e.hp>e.maxHp)return false;
    if(e.type==='boss'?!bosses.includes(e.spriteKey):e.spriteKey!==`enemy_${e.type}`)return false;
  }
  return true;
}
function snapshot(s){return {...pick(s,scalarFields),tech:pick(s.tech,Object.keys(TECH)),upgrades:pick(s.upgrades,Object.keys(UPGRADES)),enemies:s.enemies.map(e=>pick(e,enemyFields))};}
export function serializeRun(state){
  if(!valid(state))throw new Error('Ungültiger Durchlauf');
  return JSON.stringify({version:1,state:snapshot(state)});
}
export function deserializeRun(raw,{random=Math.random}={}){
  try{
    if(typeof raw!=='string')return {ok:false,reason:'missing'};
    if(raw.length>2_000_000)return {ok:false,reason:'invalid'};
    const data=JSON.parse(raw);
    if(!record(data)||data.version!==1)return {ok:false,reason:'version'};
    if(!valid(data.state))return {ok:false,reason:'invalid'};
    return {ok:true,state:Object.assign(createGame({random}),snapshot(data.state))};
  }catch{return {ok:false,reason:'invalid'};}
}
