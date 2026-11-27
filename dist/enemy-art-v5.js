/* TD2 campaign enemy art V5 — live Cloudinary CDN, cosmetic only.
 * Replaces the look of every campaign monster (runner, archer, wraith, brute,
 * guardian, sapper, rootrunner, stoneguard, mistcaller, uprooted, boss) while
 * names, values and behavior stay untouched. Lazy per-strip loading with a
 * 5 s error retry; cold/failed art returns false so the previous renderers
 * (directional actions, V2 expansion, walk-style2 atlas) stay available
 * unchanged. Pixel contract of the V5 strips: 160 px cells, RGBA alpha,
 * foot line at cell bottom, identical to the legacy walk atlas. */
(()=>{'use strict';
const CDN='https://res.cloudinary.com/xs5rd7mt/image/upload',CELL=160,RETRY_MS=5000,IN_FLIGHT_MAX=3;
const STRIPS={
 runner:{
  idle:['v1795726915/td2-gegner-v5-runner-idle-6f.webp',6],
  walk:['v1795726914/td2-gegner-v5-runner-walk-6f.webp',6],
  attack:['v1795726906/td2-gegner-v5-runner-attack-6f.webp',6],
  hit:['v1795726935/td2-gegner-v5-runner-hit-4f.webp',4],
  death:['v1795726904/td2-gegner-v5-runner-death-8f.webp',8]},
 archer:{
  idle:['v1795726938/td2-gegner-v5-archer-idle-6f.webp',6],
  walk:['v1795726938/td2-gegner-v5-archer-walk-6f.webp',6],
  attack:['v1795726934/td2-gegner-v5-archer-attack-6f.webp',6],
  hit:['v1795726932/td2-gegner-v5-archer-hit-4f.webp',4],
  death:['v1795726941/td2-gegner-v5-archer-death-8f.webp',8]},
 wraith:{
  idle:['v1795726925/td2-gegner-v5-wraith-idle-6f.webp',6],
  walk:['v1795726940/td2-gegner-v5-wraith-walk-6f.webp',6],
  attack:['v1795726895/td2-gegner-v5-wraith-attack-6f.webp',6],
  hit:['v1795726938/td2-gegner-v5-wraith-hit-4f.webp',4],
  death:['v1795726927/td2-gegner-v5-wraith-death-8f.webp',8]},
 brute:{
  idle:['v1795726928/td2-gegner-v5-brute-idle-6f.webp',6],
  walk:['v1795726921/td2-gegner-v5-brute-walk-6f.webp',6],
  attack:['v1795726920/td2-gegner-v5-brute-attack-6f.webp',6],
  hit:['v1795726899/td2-gegner-v5-brute-hit-4f.webp',4],
  death:['v1795726920/td2-gegner-v5-brute-death-8f.webp',8]},
 guardian:{
  idle:['v1795726893/td2-gegner-v5-guardian-idle-6f.webp',6],
  walk:['v1795726928/td2-gegner-v5-guardian-walk-6f.webp',6],
  attack:['v1795726933/td2-gegner-v5-guardian-attack-6f.webp',6],
  hit:['v1795726894/td2-gegner-v5-guardian-hit-4f.webp',4],
  death:['v1795726923/td2-gegner-v5-guardian-death-8f.webp',8]},
 sapper:{
  idle:['v1795726910/td2-gegner-v5-sapper-idle-6f.webp',6],
  walk:['v1795726929/td2-gegner-v5-sapper-walk-6f.webp',6],
  attack:['v1795726911/td2-gegner-v5-sapper-attack-6f.webp',6],
  hit:['v1795726900/td2-gegner-v5-sapper-hit-4f.webp',4],
  death:['v1795726918/td2-gegner-v5-sapper-death-8f.webp',8]},
 boss:{
  idle:['v1795726934/td2-boss-v5-hauptmann-idle-6f.webp',6],
  walk:['f_webp/q_auto/v1795726918/td2-boss-v5-hauptmann-move-6f.webp',6],
  attack:['v1795726934/td2-boss-v5-hauptmann-attack-a-6f.webp',6],
  attackB:['v1795726931/td2-boss-v5-hauptmann-attack-b-6f.webp',6],
  special:['v1795726916/td2-boss-v5-hauptmann-special-6f.webp',6],
  hit:['f_webp/q_auto/v1795726925/td2-boss-v5-hauptmann-hit-6f.webp',6],
  death:['v1795726939/td2-boss-v5-hauptmann-death-6f.webp',6]}
};
/* New V5 monsters with single master art: stoneguard/mistcaller/uprooted
 * keep their gameplay identity and get procedural walk (bob), matching the
 * approved mapping steinwaechter/waldwyrm/grubenriese. */
const MASTERS={
 stoneguard:'e_background_removal/c_scale,w_512/f_webp/q_auto/v1795732364/td2-gegner-v5-steinwaechter-idle-master.webp',
 mistcaller:'e_background_removal/c_scale,w_512/f_webp/q_auto/v1795732359/td2-gegner-v5-waldwyrm-idle-master.webp',
 uprooted:'e_background_removal/c_scale,w_512/f_webp/q_auto/v1795732360/td2-gegner-v5-grubenriese-idle-master.webp'
};
/* rootrunner: runner V5 art with an earthy root tint instead of new art. */
const ROOT_FILTER='hue-rotate(55deg) saturate(1.25) brightness(.92)';
/* Boss "Der Belagerer": Hauptmann in 4 color variants across the levels. */
const BOSS_VARIANTS=['','hue-rotate(115deg) saturate(1.05)','hue-rotate(215deg) saturate(1.05)','hue-rotate(300deg) saturate(1.1) brightness(1.05)'];
const LEVEL_VARIANT={1:0,2:1,3:2,4:3,5:2,6:1};
/* Identical silhouettes to the legacy renderer: same heights, same 1.2 scale. */
const heights={wraith:62,runner:54,brute:80,archer:62,guardian:80,sapper:64,
 rootrunner:60,stoneguard:86,mistcaller:72,boss:116,uprooted:140};
const VISUAL_SCALE=1.2;
const cache=new Map();let loading=0;const queue=[];
function warm(url){
 if(typeof Image==='undefined')return null;
 let entry=cache.get(url);
 if(entry){
  if(entry.failed&&Date.now()>=entry.retryAt){cache.delete(url);entry=null;}
  else return entry;
 }
 if(!entry){
  entry={img:new Image(),failed:false,retryAt:0,started:false};entry.img.crossOrigin='anonymous';cache.set(url,entry);
  queue.push(url);pump();
 }
 return entry;
}
function pump(){
 while(loading<IN_FLIGHT_MAX&&queue.length){
  const url=queue.shift(),entry=cache.get(url);
  if(!entry||entry.started)continue;
  entry.started=true;loading++;
  entry.img.decoding='async';
  entry.img.onload=()=>{loading--;};
  entry.img.onerror=()=>{entry.failed=true;entry.retryAt=Date.now()+RETRY_MS;loading--;};
  entry.img.src=CDN+'/'+url;
 }
}
function ready(url){const entry=warm(url);return !entry.failed&&entry.img.complete&&entry.img.naturalWidth>0?entry.img:null;}
/* Strip baking for color variants and live canvas filters (frost tint etc.),
 * same LRU discipline as the legacy module. */
const bakeCache=new Map(),BAKE_CAP=24;
function bake(img,frames,filter){
 if(typeof document==='undefined'||!document.createElement)return null;
 const key=img.src+'|'+filter;
 if(bakeCache.has(key))return bakeCache.get(key);
 try{
  const c=document.createElement('canvas');c.width=CELL*frames;c.height=CELL;
  const g=c.getContext('2d');g.filter=filter;g.drawImage(img,0,0);g.filter='none';
  if(bakeCache.size>=BAKE_CAP){const oldest=bakeCache.keys().next().value;bakeCache.delete(oldest);}
  bakeCache.set(key,c);return c;
 }catch{return null;}
}
const clamp=(v,min,max)=>Math.max(min,Math.min(1,v));
function variant(e){return Math.abs(Math.floor(Number(e.visualVariant)||0));}
function stripFor(e,options){
 const type=e.type==='rootrunner'?'runner':e.type;
 const set=STRIPS[type];
 if(!set)return null;
 if(options.deathProgress!=null)return set.death;
 if(e.hit>0)return set.hit;
 if(e.attackAnim>0){
  if(type==='boss')return (e.phase>=3)?set.special:(e.phase>=2)?set.attackB:set.attack;
  return set.attack;
 }
 const moving=Math.hypot(e.velX||0,e.velY||0)>.5;
 return moving?set.walk:set.idle;
}
function filterFor(e,options){
 if(e.type==='rootrunner')return ROOT_FILTER;
 if(e.type==='boss')return BOSS_VARIANTS[LEVEL_VARIANT[options.level]??0]||'';
 return '';
}
function draw(ctx,e,face=1,time=0,options={}){
 if(!e)return false;
 const type=e.type;
 if(!STRIPS[type==='rootrunner'?'runner':type]&&!MASTERS[type])return false;
 const reduced=!!(options.reduced||options.low);
 const clock=Number.isFinite(time)?Math.max(0,time):0;
 const attack=clamp(options.attack||0,0,1),hit=clamp(options.hitKick||0,0,1);
 const size=(heights[type]||62)*VISUAL_SCALE*CELL/136;
 const airborne=e.flying?12+(e.r||13)*.35:0;
 const master=MASTERS[type];
 ctx.save();try{
  ctx.translate(e.x,e.y-airborne);
  if(!reduced&&attack>0&&options.deathProgress==null)ctx.translate((face<0?-1:1)*6*attack,0);
  if(!reduced&&hit>0&&options.deathProgress==null)ctx.translate((face<0?1:-1)*Math.min(5,hit*5),0);
  if(options.deathProgress!=null){
   const death=clamp(options.deathProgress,0,1);
   if(!options.alphaApplied)ctx.globalAlpha=(ctx.globalAlpha==null?1:ctx.globalAlpha)*(1-death);
   if(!reduced&&death>0)ctx.scale(1,1-death*.78);
  }else if(attack>0)ctx.scale(1+attack*.07,1-attack*.025);
  ctx.scale(face<0?-1:1,1);
  if(master){
   const img=ready(master);
   if(!img)return false;
   const h=size*148/CELL,w=h*img.naturalWidth/img.naturalHeight;
   const moving=Math.hypot(e.velX||0,e.velY||0)>.5;
   const bob=(!reduced&&moving&&options.deathProgress==null)?Math.sin(clock*10+variant(e))*size*.025:0;
   ctx.drawImage(img,-w/2,-h+size*.075-bob,w,h);
   return true;
  }
  const spec=stripFor(e,options);
  if(!spec)return false;
  const [path,frames]=spec;
  const img=ready(path);
  if(!img)return false;
  let source=img,sx;
  const live=ctx.filter&&ctx.filter!=='none'?ctx.filter:null;
  const own=filterFor(e,options);
  const eff=[own,live].filter(Boolean).join(' ');
  if(eff){
   const strip=bake(img,frames,eff);
   if(strip){source=strip;ctx.filter='none';}
  }
  let frame=0;
  const moving=Math.hypot(e.velX||0,e.velY||0)>.5;
  if(options.deathProgress!=null)frame=Math.min(frames-1,Math.floor(clamp(options.deathProgress,0,1)*frames));
  else if(e.hit>0)frame=Math.min(frames-1,Math.floor(clamp(1-e.hit/.1,0,1)*frames));
  else if(e.attackAnim>0)frame=Math.min(frames-1,Math.floor(clamp(1-e.attackAnim/.22,0,1)*frames));
  else if(reduced||(!e.flying&&!moving))frame=variant(e)%frames;
  else frame=(Math.floor(clock*6)+variant(e))%frames;
  sx=frame*CELL;
  ctx.drawImage(source,sx,0,CELL,CELL,-size/2,-size*148/CELL,size,size);
  return true;
 }finally{ctx.restore();}
}
globalThis.DenkmalEnemyArtV5={draw,stats:()=>({images:cache.size,bakes:bakeCache.size})};
})();
