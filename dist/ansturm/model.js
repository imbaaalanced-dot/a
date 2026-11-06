import {TECH,UPGRADES,ENEMY} from './config.js';
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function createGame({random=Math.random}={}){return {random,gold:100,hp:250,shield:0,wave:0,kills:0,elapsed:0,status:'ready',tech:Object.fromEntries(Object.keys(TECH).map(x=>[x,0])),upgrades:Object.fromEntries(Object.keys(UPGRADES).map(x=>[x,0])),enemies:[],projectiles:[],effects:[],nextId:1,waveElapsed:0,spawned:0,planned:0,spawnClock:0,fireClock:0,intermission:0,lastDamage:-100};}
export function getStats(s){return {damage:12+s.tech.attack*3,attacksPerSecond:1.4+s.tech.tempo*.15,maxHp:250+s.tech.hp*30,regenPerSecond:s.tech.regen,rangeRatio:Math.min(.8,.3+s.tech.range*.035),goldMultiplier:1+s.tech.gold*.1,shieldCapacity:s.upgrades.shield*80};}
export function quotePurchase(s,id){if(s.status==='lost')return {price:0,available:false,reason:'Niederlage',nextLevel:0};let price,nextLevel;
if(Object.hasOwn(TECH,id)){if(!Number.isSafeInteger(s.tech[id])||s.tech[id]<0||s.tech[id]>=Number.MAX_SAFE_INTEGER)return {price:0,available:false,reason:'Maximum',nextLevel:0};nextLevel=s.tech[id]+1;price=Math.ceil(TECH[id].base*TECH[id].growth**(nextLevel-1));}else if(Object.hasOwn(UPGRADES,id)){nextLevel=s.upgrades[id]+1;price=UPGRADES[id].prices[nextLevel-1];}else return {price:0,available:false,reason:'Unbekannt',nextLevel:0};
if(price===undefined||!Number.isSafeInteger(price)||price<=0)return {price:0,available:false,reason:'Maximum',nextLevel};return {price,available:s.gold>=price,reason:s.gold>=price?'':'Zu wenig Gold',nextLevel};}
export function purchase(s,id){const q=quotePurchase(s,id);if(!q.available)return false;s.gold-=q.price;if(id in TECH){s.tech[id]++;if(id==='hp')s.hp+=30;}else{s.upgrades[id]++;if(id==='shield')s.shield+=80;}return true;}
export function startGame(s){if(s.status!=='ready')return;nextWave(s);}
export function nextWave(s){if(!['ready','intermission'].includes(s.status))return false;if(s.wave>=1000){s.intermission=5;return false;}s.wave++;s.status='running';s.waveElapsed=0;s.spawned=0;s.planned=10+3*s.wave+(s.wave%5===0?1:0);s.spawnClock=0;s.intermission=0;return true;}
const BOSS_SPRITES=['boss_stonebreaker','boss_stormlord','boss_shieldwarden','boss_colossus'];
export function spawnEnemy(s){const i=s.spawned++,side=i%4,offset=clamp(s.random(),0,1)*1.5-.75;let x,y;if(side===0){x=-1;y=offset;}else if(side===1){x=1;y=offset;}else if(side===2){x=offset;y=-1;}else{x=offset;y=1;}const isBoss=s.wave%5===0&&i===s.planned-1;const pool=['normal','runner','armored'];if(s.wave>=2)pool.push('cultist');if(s.wave>=3)pool.push('shieldbearer');if(s.wave>=4)pool.push('bomber');if(s.wave>=6)pool.push('gargoyle');if(s.wave>=8)pool.push('siege');let type=isBoss?'boss':pool[i%pool.length];const p=ENEMY[type];// W1–20 retain their original curve; later waves continue linearly from W20.
let scaleHp=s.wave<=20?1.14**(s.wave-1):1.14**19*(1+.14*(s.wave-20)),scaleDps=s.wave<=20?1.1**(s.wave-1):1.1**19*(1+.1*(s.wave-20));const enemy={id:s.nextId++,x,y,type,spriteKey:isBoss?BOSS_SPRITES[(Math.floor(s.wave/5)-1)%BOSS_SPRITES.length]:`enemy_${type}`,hp:p.hp*scaleHp,maxHp:p.hp*scaleHp,speed:p.speed,dps:p.dps*scaleDps,gold:p.gold,slowUntil:0,burnUntil:0,burnDps:0,alive:true};s.enemies.push(enemy);if(isBoss)initBoss(enemy);return enemy;}
// All boss clocks use simulation seconds; no wall-clock work or extra spawns.
export function initBoss(e){if(e.type==='boss'&&e.bossPhase===undefined){e.bossPhase='approach';e.bossTimer=0;e.bossInterrupt=0;}return e;}
function setBossPhase(e,phase,seconds){e.bossPhase=phase;e.bossTimer=seconds;e.bossInterrupt=0;}
export function bossCue(e){
 if(e.type!=='boss')return '';initBoss(e);
 const name={boss_stonebreaker:'Steinbrecher',boss_stormlord:'Sturmherr',boss_shieldwarden:'Schildwächter',boss_colossus:'Koloss'}[e.spriteKey];
 const cues={boss_stonebreaker:e.bossPhase==='warning'?'Monumentstoß! Distanzschaden unterbricht (8 % HP).':'Stoß nur in 0,30 Reichweite – früh beschießen.',boss_stormlord:e.bossPhase==='haste'?'Verstärkung aktiv: nahe Gegner 3 s schneller.':'Verstärkung angekündigt – Frost bremst nahe Gegner.',boss_shieldwarden:e.bossPhase==='protected'?'Schutz aktiv – danach 4 s verwundbar.':'Ansturm angekündigt – danach Schadensfenster nutzen.',boss_colossus:e.bossPhase==='charge'?'Ansturm! Frost bremst; danach 3 s Erholung.':'Erholung – jetzt Schaden verursachen.'};
 return `${name}: ${cues[e.spriteKey]}${e.bossTimer>0?' · '+e.bossTimer.toFixed(1)+' s':''}`;
}
function updateBoss(s,e,dt){
 initBoss(e);e.bossTimer=Math.max(0,e.bossTimer-dt);
 if(e.bossTimer>1e-8)return;
 const kind=e.spriteKey,phase=e.bossPhase;
 if(phase==='approach'||phase==='recovery'||phase==='vulnerable'){
  if(kind==='boss_stonebreaker'&&Math.hypot(e.x,e.y)>.3){setBossPhase(e,'approach',0);return;}
  setBossPhase(e,'warning',kind==='boss_shieldwarden'?1.5:kind==='boss_stonebreaker'?1.8:2);return;
 }
 if(phase==='warning'){
  if(kind==='boss_stonebreaker'){if(Math.hypot(e.x,e.y)<=.3)damageMonument(s,e.dps*1.5);setBossPhase(e,'recovery',7);}
  else if(kind==='boss_stormlord')setBossPhase(e,'haste',3);
  else if(kind==='boss_shieldwarden')setBossPhase(e,'protected',3);
  else setBossPhase(e,'charge',2);
 }else if(phase==='protected')setBossPhase(e,'vulnerable',4);
 else setBossPhase(e,'recovery',kind==='boss_colossus'?3:8);
}
// Perf: applyDamage takes the enemy object directly (callers already hold it),
// so hot paths do no id lookup at all. damageEnemy(id) remains for external callers.
function applyDamage(s,e,amount){
 if(!e||!e.alive||!Number.isFinite(amount)||amount<=0)return;
 if(e.type==='boss'){initBoss(e);if(e.bossPhase==='protected')amount*=.35;if(e.bossPhase==='vulnerable')amount*=1.35;if(e.spriteKey==='boss_stonebreaker'&&e.bossPhase==='warning'&&Math.hypot(e.x,e.y)>.1){e.bossInterrupt+=amount;if(e.bossInterrupt>=e.maxHp*.08)setBossPhase(e,'recovery',7);}}
 e.hp-=amount;
 if(e.hp<=0){e.alive=false;s.kills++;s.gold+=Math.floor(e.gold*getStats(s).goldMultiplier);s.effects.push({x:e.x,y:e.y,life:.45,type:'kill'});}
}
export function damageEnemy(s,id,amount){const e=s.enemies.find(x=>x.id===id);applyDamage(s,e,amount);}
export function damageMonument(s,amount){if(s.status!=='running'||!Number.isFinite(amount)||amount<=0)return;let hit=Math.min(s.shield,amount);s.shield-=hit;s.hp=Math.max(0,s.hp-(amount-hit));s.lastDamage=s.elapsed;if(s.hp===0){s.status='lost';s.planned=s.spawned;}}
function strike(s,target){
 if(!target||!target.alive)return;
 const st=getStats(s),damage=st.damage;
 const shotKey=s.upgrades.tesla?'effect_lightning':s.upgrades.explosion?'effect_blast':s.upgrades.frost?'effect_ice':s.upgrades.fire?'effect_fire':s.upgrades.pierce?'effect_lance':'effect_bolt';
 s.effects.push({x:0,y:0,tx:target.x,ty:target.y,progress:0,life:.14,total:.14,type:'projectile',spriteKey:shotKey});
 applyDamage(s,target,damage);
 s.effects.push({x:target.x,y:target.y,life:.22,type:'impact',spriteKey:shotKey});
if(s.upgrades.fire){target.burnDps=Math.max(target.burnDps,damage*(.12+.08*s.upgrades.fire));target.burnUntil=Math.max(target.burnUntil,s.elapsed+1.5+s.upgrades.fire*.5);}
if(s.upgrades.pierce){const dx=target.x,dy=target.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len,limit=s.upgrades.pierce;
 // Perf: single pass, keep the nearest up to `limit` candidates in t-order (was filter+map+filter+sort+slice).
 let bestT=[],bestE=[],count=0;
 for(const e of s.enemies){
  if(!e.alive||e.id===target.id)continue;
  const t=e.x*ux+e.y*uy;if(t<=len)continue;
  if(Math.abs(e.x*uy-e.y*ux)>=.12)continue;
  let pos;
  if(count===limit){if(bestT[limit-1]<=t)continue;pos=limit-1;while(pos>0&&bestT[pos-1]>t)pos--;for(let i=limit-1;i>pos;i--){bestT[i]=bestT[i-1];bestE[i]=bestE[i-1];}}
  else{pos=count;while(pos>0&&bestT[pos-1]>t)pos--;for(let i=count;i>pos;i--){bestT[i]=bestT[i-1];bestE[i]=bestE[i-1];}count++;}
  bestT[pos]=t;bestE[pos]=e;
 }
 for(let i=0;i<count;i++){const v=bestE[i];applyDamage(s,v,damage*(.55+.15*s.upgrades.pierce));s.effects.push({x:v.x,y:v.y,life:.2,type:'impact',spriteKey:'effect_lance'});}}
if(s.upgrades.explosion){for(const e of s.enemies){if(e.id!==target.id&&e.alive&&Math.hypot(e.x-target.x,e.y-target.y)<.1+s.upgrades.explosion*.025)applyDamage(s,e,damage*(.25+.1*s.upgrades.explosion));}}
if(s.upgrades.frost){for(const e of s.enemies){if(e.alive&&Math.hypot(e.x-target.x,e.y-target.y)<.17)e.slowUntil=Math.max(e.slowUntil,s.elapsed+1+s.upgrades.frost*.5);}}
if(s.upgrades.tesla){const visited=new Set([target.id]);let last=target;for(let i=0;i<s.upgrades.tesla+2;i++){
 // Perf: nearest unvisited candidate in one pass (was filter+sort per hop).
 let best=null,bestD=.26;
 for(const e of s.enemies){if(!e.alive||visited.has(e.id))continue;const d=Math.hypot(e.x-last.x,e.y-last.y);if(d<bestD){bestD=d;best=e;}}
 if(!best)break;visited.add(best.id);applyDamage(s,best,damage*.45);s.effects.push({x:best.x,y:best.y,life:.18,type:'tesla',spriteKey:'effect_lightning'});last=best;}}
}
// Perf: compact effects in place, keep the last CAP survivors (matches filter().slice(-120)).
function compactEffects(s,dt,projectiles){
 const list=s.effects;let write=0;
 for(let i=0;i<list.length;i++){const f=list[i];f.life-=dt;if(f.type==='projectile'&&projectiles)f.progress=Math.min(1,f.progress+dt/(f.total||.14));if(f.life>0)list[write++]=f;}
 let start=write>120?write-120:0;
 if(start>0)for(let i=start;i<write;i++)list[i-start]=list[i];
 list.length=write-start;
}
export function step(s,dt){if(s.status!=='running'&&s.status!=='intermission')return;if(!Number.isFinite(dt)||dt<=0||dt>1/30+1e-6)return; s.elapsed+=dt;
if(s.status==='intermission'){s.intermission-=dt;if(s.intermission<=0)nextWave(s);return;}
s.waveElapsed+=dt;s.spawnClock+=dt;while(s.spawned<s.planned&&s.spawnClock>=(25/s.planned)){s.spawnClock-=25/s.planned;spawnEnemy(s);}if(s.spawned===s.planned)s.spawnClock=0;
const hasteSource=s.enemies.find(e=>e.alive&&e.spriteKey==='boss_stormlord'&&e.bossPhase==='haste');
for(const e of s.enemies){if(s.status!=='running')break;if(!e.alive)continue;if(e.burnUntil>s.elapsed)applyDamage(s,e,e.burnDps*dt);if(!e.alive)continue;if(e.type==='boss')updateBoss(s,e,dt);if(s.status!=='running')break;let d=Math.hypot(e.x,e.y);let speed=e.speed,dps=e.dps;
if(e.spriteKey==='boss_colossus'){speed*=e.bossPhase==='warning'||e.bossPhase==='recovery'?0:e.bossPhase==='charge'?3:.65;if(e.bossPhase==='recovery')dps*=.5;}
if(hasteSource&&hasteSource.alive&&hasteSource.bossPhase==='haste'&&Math.hypot(hasteSource.x-e.x,hasteSource.y-e.y)<=.45)speed*=1.5;
if(d>.1){let advance=Math.min(d-.1,speed*(s.elapsed<e.slowUntil?0.52:1)*dt);e.x-=e.x/d*advance;e.y-=e.y/d*advance;}else{damageMonument(s,dps*dt);}}
if(s.status!=='running'){compactEffects(s,dt,true);return;}
const stats=getStats(s);s.hp=Math.min(stats.maxHp,s.hp+stats.regenPerSecond*dt);if(s.upgrades.shield&&s.elapsed-s.lastDamage>=5)s.shield=Math.min(stats.shieldCapacity,s.shield+(4+s.upgrades.shield*3)*dt);
s.fireClock+=dt;let shots=0;
// Perf: nearest-K target selection in one pass (was filter+sort+slice per shot).
const picks=[],pickD=[];
while(s.fireClock>=1/stats.attacksPerSecond&&shots++<4){s.fireClock-=1/stats.attacksPerSecond;
 const limit=1+s.upgrades.multishot,R=stats.rangeRatio;let count=0;picks.length=0;pickD.length=0;
 for(const e of s.enemies){
  if(!e.alive)continue;const d=Math.hypot(e.x,e.y);if(d>R)continue;
  let pos;
  if(count===limit){if(pickD[limit-1]<=d)continue;pos=limit-1;while(pos>0&&pickD[pos-1]>d)pos--;for(let i=limit-1;i>pos;i--){picks[i]=picks[i-1];pickD[i]=pickD[i-1];}}
  else{pos=count;while(pos>0&&pickD[pos-1]>d)pos--;for(let i=count;i>pos;i--){picks[i]=picks[i-1];pickD[i]=pickD[i-1];}count++;}
  picks[pos]=e;pickD[pos]=d;
 }
 for(let i=0;i<count;i++)strike(s,picks[i]);}
// Perf: compact enemies in place (was filter per tick).
let write=0;for(let i=0;i<s.enemies.length;i++){if(s.enemies[i].alive)s.enemies[write++]=s.enemies[i];}s.enemies.length=write;
compactEffects(s,dt,true);
if(s.spawned===s.planned&&s.enemies.length===0&&s.waveElapsed>=25){s.status='intermission';s.intermission=5;}
}
