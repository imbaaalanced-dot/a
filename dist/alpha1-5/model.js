import {TECH,UPGRADES,ENEMY} from './config.js';
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export function createGame({random=Math.random}={}){return {random,gold:100,hp:250,shield:0,wave:0,kills:0,elapsed:0,status:'ready',tech:Object.fromEntries(Object.keys(TECH).map(x=>[x,0])),upgrades:Object.fromEntries(Object.keys(UPGRADES).map(x=>[x,0])),enemies:[],projectiles:[],effects:[],nextId:1,waveElapsed:0,spawned:0,planned:0,spawnClock:0,fireClock:0,intermission:0,lastDamage:-100};}
export function getStats(s){return {damage:12+s.tech.attack*3,attacksPerSecond:1.4+s.tech.tempo*.15,maxHp:250+s.tech.hp*30,regenPerSecond:s.tech.regen,rangeRatio:Math.min(.8,.3+s.tech.range*.035),goldMultiplier:1+s.tech.gold*.1,shieldCapacity:s.upgrades.shield*80};}
export function quotePurchase(s,id){if(s.status==='lost')return {price:0,available:false,reason:'Niederlage',nextLevel:0};let price,nextLevel;
if(id in TECH){nextLevel=s.tech[id]+1;price=Math.ceil(TECH[id].base*TECH[id].growth**(nextLevel-1));}else if(id in UPGRADES){nextLevel=s.upgrades[id]+1;price=UPGRADES[id].prices[nextLevel-1];}else return {price:0,available:false,reason:'Unbekannt',nextLevel:0};
if(price===undefined)return {price:0,available:false,reason:'Maximum',nextLevel};return {price,available:s.gold>=price,reason:s.gold>=price?'':'Zu wenig Gold',nextLevel};}
export function purchase(s,id){const q=quotePurchase(s,id);if(!q.available)return false;s.gold-=q.price;if(id in TECH){s.tech[id]++;if(id==='hp')s.hp+=30;}else{s.upgrades[id]++;if(id==='shield')s.shield+=80;}return true;}
export function startGame(s){if(s.status!=='ready')return;nextWave(s);}
export function nextWave(s){if(!['ready','intermission'].includes(s.status))return false;s.wave++;s.status='running';s.waveElapsed=0;s.spawned=0;s.planned=10+3*s.wave+(s.wave%5===0?1:0);s.spawnClock=0;s.intermission=0;return true;}
function spawn(s){const i=s.spawned++,u=s.random(),side=i%4,offset=clamp(s.random(),0,1)*1.5-.75;let x,y;if(side===0){x=-1;y=offset;}else if(side===1){x=1;y=offset;}else if(side===2){x=offset;y=-1;}else{x=offset;y=1;}let type=s.wave%5===0&&i===s.planned-1?'boss':i%7===0?'armored':i%4===0?'runner':'normal';const p=ENEMY[type];let scaleHp=1.14**(s.wave-1),scaleDps=1.1**(s.wave-1);const bossArt=['boss_stonebreaker','boss_stormlord','boss_shieldwarden','boss_colossus'][Math.floor(s.wave/5-1)%4];s.enemies.push({id:s.nextId++,x,y,type,artKey:type==='boss'?bossArt:'enemy_'+type,hp:p.hp*scaleHp,maxHp:p.hp*scaleHp,speed:p.speed,dps:p.dps*scaleDps,gold:p.gold,slowUntil:0,alive:true});}
export function damageEnemy(s,id,amount){const e=s.enemies.find(e=>e.id===id);if(!e||!e.alive||!Number.isFinite(amount)||amount<=0)return;e.hp-=amount;if(e.hp<=0){e.alive=false;s.kills++;s.gold+=Math.floor(e.gold*getStats(s).goldMultiplier);s.effects.push({x:e.x,y:e.y,life:.45,duration:.45,type:'kill',asset:'effect_blast'});}}
export function damageMonument(s,amount){if(s.status!=='running'||!Number.isFinite(amount)||amount<=0)return;let hit=Math.min(s.shield,amount);s.shield-=hit;s.hp=Math.max(0,s.hp-(amount-hit));s.lastDamage=s.elapsed;if(s.hp===0){s.status='lost';s.planned=s.spawned;}}
function strike(s,target){if(!target||!target.alive)return;const st=getStats(s),damage=st.damage;
const projectileAsset=s.upgrades.tesla?'effect_lightning':s.upgrades.frost?'effect_ice':s.upgrades.explosion?'effect_fire':s.upgrades.multishot?'effect_lance':'effect_bolt';
s.effects.push({type:'projectile',asset:projectileAsset,fromX:0,fromY:0,toX:target.x,toY:target.y,life:.18,duration:.18});
damageEnemy(s,target.id,damage);
s.effects.push({x:target.x,y:target.y,life:.25,duration:.25,type:'hit',asset:s.upgrades.explosion?'effect_blast':s.upgrades.frost?'effect_ice':s.upgrades.tesla?'effect_lightning':'effect_lance'});
if(s.upgrades.explosion){for(const e of s.enemies){if(e.id!==target.id&&e.alive&&Math.hypot(e.x-target.x,e.y-target.y)<.1+s.upgrades.explosion*.025)damageEnemy(s,e.id,damage*(.25+.1*s.upgrades.explosion));}}
if(s.upgrades.frost){for(const e of s.enemies){if(e.alive&&Math.hypot(e.x-target.x,e.y-target.y)<.17)e.slowUntil=Math.max(e.slowUntil,s.elapsed+1+s.upgrades.frost*.5);}}
if(s.upgrades.tesla){const visited=new Set([target.id]);let last=target;for(let i=0;i<s.upgrades.tesla+2;i++){const cand=s.enemies.filter(e=>e.alive&&!visited.has(e.id)&&Math.hypot(e.x-last.x,e.y-last.y)<.26).sort((a,b)=>Math.hypot(a.x-last.x,a.y-last.y)-Math.hypot(b.x-last.x,b.y-last.y))[0];if(!cand)break;visited.add(cand.id);damageEnemy(s,cand.id,damage*.45);s.effects.push({x:cand.x,y:cand.y,fromX:last.x,fromY:last.y,toX:cand.x,toY:cand.y,life:.18,duration:.18,type:'tesla',asset:'effect_lightning'});last=cand;}}
}
export function step(s,dt){if(s.status!=='running'&&s.status!=='intermission')return;if(!Number.isFinite(dt)||dt<=0||dt>1/30+1e-6)return; s.elapsed+=dt;
if(s.status==='intermission'){s.intermission-=dt;if(s.intermission<=0)nextWave(s);return;}
s.waveElapsed+=dt;s.spawnClock+=dt;while(s.spawned<s.planned&&s.spawnClock>=(25/s.planned)){s.spawnClock-=25/s.planned;spawn(s);}
for(const e of s.enemies){if(s.status!=='running')break;if(!e.alive)continue;let d=Math.hypot(e.x,e.y);if(d>.1){let advance=Math.min(d-.1,e.speed*(s.elapsed<e.slowUntil?0.52:1)*dt);e.x-=e.x/d*advance;e.y-=e.y/d*advance;}else{damageMonument(s,e.dps*dt);}}
if(s.status!=='running'){s.effects=s.effects.filter(f=>(f.life-=dt)>0).slice(-120);return;}
const stats=getStats(s);s.hp=Math.min(stats.maxHp,s.hp+stats.regenPerSecond*dt);if(s.upgrades.shield&&s.elapsed-s.lastDamage>=5)s.shield=Math.min(stats.shieldCapacity,s.shield+(4+s.upgrades.shield*3)*dt);
s.fireClock+=dt;let shots=0;while(s.fireClock>=1/stats.attacksPerSecond&&shots++<4){s.fireClock-=1/stats.attacksPerSecond;const targets=s.enemies.filter(e=>e.alive&&Math.hypot(e.x,e.y)<=stats.rangeRatio).sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y)).slice(0,1+s.upgrades.multishot);for(const e of targets)strike(s,e);}
s.enemies=s.enemies.filter(e=>e.alive);s.effects=s.effects.filter(f=>(f.life-=dt)>0).slice(-120);
if(s.spawned===s.planned&&s.enemies.length===0&&s.waveElapsed>=25){s.status='intermission';s.intermission=5;}
}
