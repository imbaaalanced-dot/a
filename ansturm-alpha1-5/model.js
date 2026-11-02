import {TECH,UPGRADES,ENEMY} from './config.js';
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function createGame({random=Math.random}={}){return {random,gold:100,hp:250,shield:0,wave:0,kills:0,elapsed:0,status:'ready',tech:Object.fromEntries(Object.keys(TECH).map(x=>[x,0])),upgrades:Object.fromEntries(Object.keys(UPGRADES).map(x=>[x,0])),enemies:[],projectiles:[],effects:[],nextId:1,waveElapsed:0,spawned:0,planned:0,spawnClock:0,fireClock:0,intermission:0,lastDamage:-100};}
export function getStats(s){return {damage:12+s.tech.attack*3,attacksPerSecond:1.4+s.tech.tempo*.15,maxHp:250+s.tech.hp*30,regenPerSecond:s.tech.regen,rangeRatio:Math.min(.8,.3+s.tech.range*.035),goldMultiplier:1+s.tech.gold*.1,shieldCapacity:s.upgrades.shield*80};}
export function quotePurchase(s,id){if(id==='range'&&getStats(s).rangeRatio>=.8)return {price:0,available:false,reason:'Maximum',nextLevel:s.tech.range};if(s.status==='lost')return {price:0,available:false,reason:'Niederlage',nextLevel:0};let price,nextLevel;
if(Object.hasOwn(TECH,id)){if(!Number.isSafeInteger(s.tech[id])||s.tech[id]<0||s.tech[id]>=Number.MAX_SAFE_INTEGER)return {price:0,available:false,reason:'Maximum',nextLevel:0};nextLevel=s.tech[id]+1;price=Math.ceil(TECH[id].base*TECH[id].growth**(nextLevel-1));}else if(Object.hasOwn(UPGRADES,id)){nextLevel=s.upgrades[id]+1;price=UPGRADES[id].prices[nextLevel-1];}else return {price:0,available:false,reason:'Unbekannt',nextLevel:0};
if(price===undefined||!Number.isSafeInteger(price)||price<=0)return {price:0,available:false,reason:'Maximum',nextLevel};return {price,available:s.gold>=price,reason:s.gold>=price?'':'Zu wenig Gold',nextLevel};}
export function purchase(s,id){const q=quotePurchase(s,id);if(!q.available)return false;s.gold-=q.price;if(id in TECH){s.tech[id]++;if(id==='hp')s.hp+=30;}else{s.upgrades[id]++;if(id==='shield')s.shield+=80;}return true;}
export function startGame(s){if(s.status!=='ready')return;nextWave(s);}
export function nextWave(s){if(!['ready','intermission'].includes(s.status))return false;if(s.wave>=1000){s.intermission=5;return false;}s.wave++;s.status='running';s.waveElapsed=0;s.spawned=0;s.planned=10+3*s.wave+(s.wave%5===0?1:0);s.spawnClock=0;s.intermission=0;return true;}
const BOSS_SPRITES=['boss_stonebreaker','boss_stormlord','boss_shieldwarden','boss_colossus'];
export function spawnEnemy(s){const i=s.spawned++,side=i%4,offset=clamp(s.random(),0,1)*1.5-.75;let x,y;if(side===0){x=-1;y=offset;}else if(side===1){x=1;y=offset;}else if(side===2){x=offset;y=-1;}else{x=offset;y=1;}const isBoss=s.wave%5===0&&i===s.planned-1;const pool=['normal','runner','armored'];if(s.wave>=2)pool.push('cultist');if(s.wave>=3)pool.push('shieldbearer');if(s.wave>=4)pool.push('bomber');if(s.wave>=6)pool.push('gargoyle');if(s.wave>=8)pool.push('siege');let type=isBoss?'boss':pool[i%pool.length];const p=ENEMY[type];// W1–20 retain their original curve; later waves continue linearly from W20.
let scaleHp=s.wave<=20?1.14**(s.wave-1):1.14**19*(1+.14*(s.wave-20)),scaleDps=s.wave<=20?1.1**(s.wave-1):1.1**19*(1+.1*(s.wave-20));s.enemies.push({id:s.nextId++,x,y,type,spriteKey:isBoss?BOSS_SPRITES[(Math.floor(s.wave/5)-1)%BOSS_SPRITES.length]:`enemy_${type}`,hp:p.hp*scaleHp,maxHp:p.hp*scaleHp,speed:p.speed,dps:p.dps*scaleDps,gold:p.gold,slowUntil:0,burnUntil:0,burnDps:0,alive:true});const enemy=s.enemies.at(-1);if(isBoss)initBoss(enemy);return enemy;}
// All boss clocks use simulation seconds; no wall-clock work or extra spawns.
export function initBoss(e){if(e.type==='boss'&&e.bossPhase===undefined){e.bossPhase='approach';e.bossTimer=0;e.bossInterrupt=0;}return e;}
function setBossPhase(e,phase,seconds){e.bossPhase=phase;e.bossTimer=seconds;e.bossInterrupt=0;}
export function bossCue(e){
 if(e.type!=='boss')return '';initBoss(e);
 const name={boss_stonebreaker:'Steinbrecher',boss_stormlord:'Sturmherr',boss_shieldwarden:'Schildwächter',boss_colossus:'Koloss'}[e.spriteKey];
 const cues={boss_stonebreaker:e.bossPhase==='warning'?'Monumentstoß! Distanzschaden unterbricht (8 % HP).':'Stoß nur in 0,30 Reichweite – früh beschießen.',boss_stormlord:e.bossPhase==='haste'?'Verstärkung aktiv: nahe Gegner 3 s schneller.':'Verstärkung angekündigt – Frost bremst nahe Gegner.',boss_shieldwarden:e.bossPhase==='protected'?'Schutz aktiv – danach 4 s verwundbar.':e.bossPhase==='vulnerable'?'Verwundbar! +35 % Schaden.':'Schutz angekündigt – danach Schadensfenster nutzen.',boss_colossus:e.bossPhase==='charge'?'Ansturm! Frost bremst; danach 3 s Erholung.':e.bossPhase==='recovery'?'Erholung – jetzt Schaden verursachen.':'Ansturm angekündigt – Frost bremst.'};
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
export function damageEnemy(s,id,amount){const e=s.enemies.find(e=>e.id===id);if(!e||!e.alive||!Number.isFinite(amount)||amount<=0)return;if(e.type==='boss'){initBoss(e);if(e.bossPhase==='protected')amount*=.35;if(e.bossPhase==='vulnerable')amount*=1.35;if(e.spriteKey==='boss_stonebreaker'&&e.bossPhase==='warning'&&Math.hypot(e.x,e.y)>.1){e.bossInterrupt+=amount;if(e.bossInterrupt>=e.maxHp*.08)setBossPhase(e,'recovery',7);}}e.hp-=amount;if(e.hp<=0){e.alive=false;s.kills++;s.gold+=Math.floor(e.gold*getStats(s).goldMultiplier);s.effects.push({x:e.x,y:e.y,life:.45,type:'kill'});}}
export function damageMonument(s,amount){if(s.status!=='running'||!Number.isFinite(amount)||amount<=0)return;let hit=Math.min(s.shield,amount);s.shield-=hit;s.hp=Math.max(0,s.hp-(amount-hit));s.lastDamage=s.elapsed;if(s.hp===0){s.status='lost';s.planned=s.spawned;}}
function strike(s,target){if(!target||!target.alive)return;const st=getStats(s),damage=st.damage;const shotKey=s.upgrades.tesla?'effect_lightning':s.upgrades.explosion?'effect_blast':s.upgrades.frost?'effect_ice':s.upgrades.fire?'effect_fire':s.upgrades.pierce?'effect_lance':'effect_bolt';s.effects.push({x:0,y:0,tx:target.x,ty:target.y,progress:0,life:.14,total:.14,type:'projectile',spriteKey:shotKey});damageEnemy(s,target.id,damage);s.effects.push({x:target.x,y:target.y,life:.22,type:'impact',spriteKey:shotKey});
if(s.upgrades.fire){target.burnDps=Math.max(target.burnDps,damage*(.12+.08*s.upgrades.fire));target.burnUntil=Math.max(target.burnUntil,s.elapsed+1.5+s.upgrades.fire*.5);}
if(s.upgrades.pierce){const dx=target.x,dy=target.y,len=Math.hypot(dx,dy)||1,ux=dx/len,uy=dy/len;const pierced=s.enemies.filter(e=>e.alive&&e.id!==target.id).map(e=>({e,t:e.x*ux+e.y*uy,perp:Math.abs(e.x*uy-e.y*ux)})).filter(v=>v.t>len&&v.perp<.12).sort((a,b)=>a.t-b.t).slice(0,s.upgrades.pierce);for(const v of pierced){damageEnemy(s,v.e.id,damage*(.55+.15*s.upgrades.pierce));s.effects.push({x:v.e.x,y:v.e.y,life:.2,type:'impact',spriteKey:'effect_lance'});}}
if(s.upgrades.explosion){for(const e of s.enemies){if(e.id!==target.id&&e.alive&&Math.hypot(e.x-target.x,e.y-target.y)<.1+s.upgrades.explosion*.025)damageEnemy(s,e.id,damage*(.25+.1*s.upgrades.explosion));}}
if(s.upgrades.frost){for(const e of s.enemies){if(e.alive&&Math.hypot(e.x-target.x,e.y-target.y)<.17)e.slowUntil=Math.max(e.slowUntil,s.elapsed+1+s.upgrades.frost*.5);}}
if(s.upgrades.tesla){const visited=new Set([target.id]);let last=target;for(let i=0;i<s.upgrades.tesla+2;i++){const cand=s.enemies.filter(e=>e.alive&&!visited.has(e.id)&&Math.hypot(e.x-last.x,e.y-last.y)<.26).sort((a,b)=>Math.hypot(a.x-last.x,a.y-last.y)-Math.hypot(b.x-last.x,b.y-last.y))[0];if(!cand)break;visited.add(cand.id);damageEnemy(s,cand.id,damage*.45);s.effects.push({fromX:last.x,fromY:last.y,x:cand.x,y:cand.y,life:.18,type:'tesla',spriteKey:'effect_lightning'});last=cand;}}
}
export function step(s,dt){if(s.status!=='running'&&s.status!=='intermission')return;if(!Number.isFinite(dt)||dt<=0||dt>1/30+1e-6)return; s.elapsed+=dt;
if(s.status==='intermission'){s.intermission-=dt;if(s.intermission<=0)nextWave(s);return;}
s.waveElapsed+=dt;s.spawnClock+=dt;while(s.spawned<s.planned&&s.spawnClock>=(25/s.planned)){s.spawnClock-=25/s.planned;spawnEnemy(s);}if(s.spawned===s.planned)s.spawnClock=0;
const hasteSource=s.enemies.find(e=>e.alive&&e.spriteKey==='boss_stormlord'&&e.bossPhase==='haste');
for(const e of s.enemies){if(s.status!=='running')break;if(!e.alive)continue;if(e.burnUntil>s.elapsed)damageEnemy(s,e.id,e.burnDps*dt);if(!e.alive)continue;if(e.type==='boss')updateBoss(s,e,dt);if(s.status!=='running')break;let d=Math.hypot(e.x,e.y);let speed=e.speed,dps=e.dps;
if(e.spriteKey==='boss_colossus'){speed*=e.bossPhase==='warning'||e.bossPhase==='recovery'?0:e.bossPhase==='charge'?3:.65;if(e.bossPhase==='recovery')dps*=.5;}
if(hasteSource&&hasteSource.alive&&hasteSource.bossPhase==='haste'&&Math.hypot(hasteSource.x-e.x,hasteSource.y-e.y)<=.45)speed*=1.5;
if(d>.1){let advance=Math.min(d-.1,speed*(s.elapsed<e.slowUntil?0.52:1)*dt);e.x-=e.x/d*advance;e.y-=e.y/d*advance;}else{damageMonument(s,dps*dt);}}
if(s.status!=='running'){s.effects=s.effects.filter(f=>(f.life-=dt)>0).slice(-120);return;}
const stats=getStats(s);s.hp=Math.min(stats.maxHp,s.hp+stats.regenPerSecond*dt);if(s.upgrades.shield&&s.elapsed-s.lastDamage>=5)s.shield=Math.min(stats.shieldCapacity,s.shield+(4+s.upgrades.shield*3)*dt);
s.fireClock+=dt;let shots=0;while(s.fireClock>=1/stats.attacksPerSecond&&shots++<4){s.fireClock-=1/stats.attacksPerSecond;const targets=s.enemies.filter(e=>e.alive&&Math.hypot(e.x,e.y)<=stats.rangeRatio).sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y)).slice(0,1+s.upgrades.multishot);for(const e of targets)strike(s,e);}
s.enemies=s.enemies.filter(e=>e.alive);s.effects=s.effects.filter(f=>{f.life-=dt;if(f.type==='projectile')f.progress=Math.min(1,f.progress+dt/f.total);return f.life>0;}).slice(-120);
if(s.spawned===s.planned&&s.enemies.length===0&&s.waveElapsed>=25){s.status='intermission';s.intermission=5;}
}

// Pure shop/readout helpers: preview uses the same derived stats as combat.
export function purchasePreview(s,id){
 const tech=Object.hasOwn(TECH,id),weapon=Object.hasOwn(UPGRADES,id);if(!tech&&!weapon)return null;
 const next={...s,tech:{...s.tech},upgrades:{...s.upgrades}};
 const prop={attack:'damage',tempo:'attacksPerSecond',hp:'maxHp',regen:'regenPerSecond',range:'rangeRatio',gold:'goldMultiplier',shield:'shieldCapacity'}[id];
 const value=state=>prop?getStats(state)[prop]:id==='multishot'?1+state.upgrades[id]:id==='tesla'?(state.upgrades[id]?state.upgrades[id]+2:0):state.upgrades[id];
 const units={attack:'Schaden',tempo:'Angriffe/s',hp:'HP',regen:'HP/s',range:'Arenaradius',gold:'Goldfaktor',shield:'Schild',multishot:'Ziele',tesla:'Sprünge'};
 const q=quotePurchase(s,id);if(tech)next.tech[id]++;else next.upgrades[id]++;
 return {before:value(s),after:q.reason==='Maximum'?null:value(next),unit:units[id]||'Waffenstufe'};
}
export function wavePreview(wave){
 if(wave>1000)return 'Wellenlimit erreicht';
 const types=['Fußsoldaten','Läufer','Gepanzerte'];
 for(const [at,label] of [[2,'Kultisten'],[3,'Schildträger'],[4,'Bomber'],[6,'Gargoyles'],[8,'Belagerer']])if(wave>=at)types.push(label);
 const boss=wave%5===0?['Steinbrecher','Sturmherr','Schildwächter','Koloss'][(wave/5-1)%4]:null;
 return `Welle ${wave} · ${10+3*wave+(boss?1:0)} Gegner · ${boss?'BOSS: '+boss+' · ':''}${types.join(', ')}`;
}
export function runSummary(s){
 const seconds=Math.floor(s.elapsed),time=`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
 const weapons=Object.entries(UPGRADES).filter(([id])=>s.upgrades[id]>0).map(([id,cfg])=>`${cfg.name} ${s.upgrades[id]}`).join(' · ');
 return `Welle ${s.wave} · ${s.kills} besiegte Gegner · ${time} Minuten\n${weapons||'Keine Waffen ausgebaut'}\nSchaden ${getStats(s).damage} · Tempo ${getStats(s).attacksPerSecond.toFixed(2)}/s`;
}
