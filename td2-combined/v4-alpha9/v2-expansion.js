/* V2 action sprites and map dressing. Cosmetic only; manager owns every texture. */
(()=>{'use strict';
const data=globalThis.V2ExpansionData,base='assets/expansion-v2/',version='?v=expansion2';
const pending=new Map(),deaths=new WeakMap(),queue=[];let loading=0;
const url=name=>base+name+version;
function pump(){
 const assets=globalThis.DenkmalAssets;
 while(loading<2&&queue.length){
  const name=queue.shift(),key=url(name),state=pending.get(key);if(!state)continue;
  state.started=true;loading++;
  Promise.resolve(assets.retain('expansion-v2:'+name,[key])).then(()=>{if(pending.get(key)===state)state.retryAt=assets.ready(key)?Infinity:Date.now()+10000;},()=>{state.retryAt=Date.now()+10000;}).finally(()=>{loading--;pump();});
 }
}
function image(name){
 const assets=globalThis.DenkmalAssets;if(!assets?.ready||!assets?.retain)return null;
 const key=url(name);if(pending.get(key)?.retryAt<Date.now())pending.delete(key);
 if(!pending.has(key)){pending.set(key,{started:false,retryAt:Infinity});queue.push(name);pump();}
 return pending.get(key)?.started?assets.ready(key):null;
}
const clamp=v=>Math.max(0,Math.min(1,v));
function action(ctx,name,kind,progress,x,y,height,face=1,reduced=false){
 const spec=data?.actors[name];if(!spec||!Number.isFinite(progress))return false;
 const art=image(spec.file);if(!art?.naturalWidth)return false;
 const row={attack:0,hit:1,death:2}[kind];if(row===undefined)return false;
 const frame=reduced?(kind==='death'?3:2):Math.min(3,Math.floor(clamp(progress)*4));
 const scale=height/spec.height,c=spec.cell;
 ctx.save();try{ctx.translate(x,y);ctx.scale(face,1);ctx.drawImage(art,frame*c,(spec.row+row)*c,c,c,-spec.anchor[0]*scale,-spec.anchor[1]*scale,c*scale,c*scale);return true;}catch{return false;}finally{ctx.restore();}
}
function enemy(ctx,e,face,options={}){
 const skin=globalThis.DenkmalEnemyAnimations?.select(e,options.level);if(skin<0||skin==null)return false;
 const name='enemy-'+String(skin).padStart(2,'0');
 // Warm only the group used by a visible enemy, keeping cold frames on the walk fallback.
 const spec=data?.actors?.[name];if(!spec)return false;image(spec.file);
 let kind,progress;if(options.deathProgress!=null){kind='death';progress=options.deathProgress;}
 else if(e.hit>0){kind='hit';progress=1-e.hit/.1;}
 else if(e.attackAnim>0){kind='attack';progress=1-e.attackAnim/.22;}
 else return false;
 const heights={runner:44,brute:66,guardian:68,boss:100,uprooted:116,gargoyle:82,shadowwing:72,stormwing:78};
 const airborne=e.flying?12+(e.r||13)*.35:0;
 return action(ctx,name,kind,progress,e.x,e.y+6-airborne,heights[e.type]||54,face,options.reduced);
}
function hero(ctx,h,attackTime,reduced=false){
 const name=h.character==='kim'?'kim':'marcel';image(name+'.webp');
 let kind,progress;
 if(h.hp<=0){kind='death';if(!deaths.has(h))deaths.set(h,performance.now());progress=(performance.now()-deaths.get(h))/650;}
 else if(h.hitFlash>0){kind='hit';progress=1-h.hitFlash/.16;}
 else if(attackTime>0){kind='attack';progress=1-attackTime/.24;}
 else return false;
 return action(ctx,name,kind,progress,0,0,70,1,reduced);
}
function impact(ctx,p){
 if(!p||p.reduced||!['cannon','boomerang'].includes(p.kind)||![p.life,p.max,p.x,p.y].every(Number.isFinite)||p.life<=0||p.max<=0)return false;
 const tier=Math.floor(Number(p.level)||1);if(tier<1||tier>2)return false;
 const art=image('impacts.webp');if(!art)return false;
 const progress=clamp(1-p.life/p.max),frame=Math.min(5,Math.floor(progress*6)),row=(p.kind==='cannon'?0:2)+tier-1,size=55+tier*14;
 ctx.save();try{ctx.globalAlpha*=Math.min(1,(1-progress)*2);ctx.drawImage(art,frame*128,row*128,128,128,p.x-size/2,p.y-size*.65,size,size);return true;}finally{ctx.restore();}
}
function legacy(ctx,key,x,y,height,face=1,opacity=1){
 const index={monument:0,gate:1,infantry:2,brute:3,boss:4}[key];if(index===undefined)return false;
 const art=image('legacy.webp');if(!art)return false;
 ctx.save();try{ctx.translate(x,y);ctx.scale(face,1);ctx.globalAlpha*=opacity;ctx.drawImage(art,index%3*192,Math.floor(index/3)*192,192,192,-height*.58,12-height*1.08,height*1.16,height*1.16);return true;}finally{ctx.restore();}
}
const placementCache=new Map();
function placements(level,layout){
 const key=level+':'+JSON.stringify([layout.paths,layout.slots,layout.churchFootprint,layout.syburgTerrace]);if(placementCache.has(key))return placementCache.get(key);
 const result=[];let seed=9973+level*5197;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<220&&result.length<40;i++){
  const p={x:layout.center.x-740+random()*1480,y:layout.center.y-740+random()*1480,index:i%8,size:42+(i%3)*9};
  if(Math.hypot(p.x-layout.center.x,p.y-layout.center.y)<240)continue;
  if(layout.paths.some(path=>globalThis.DenkmalLevels.pathDistance(p,path)<140))continue;
  if(layout.slots.some(s=>Math.hypot(s.x-p.x,s.y-p.y)<125))continue;
  const f=layout.churchFootprint;if(f&&p.x>layout.center.x+f.left-130&&p.x<layout.center.x+f.right+130&&p.y>layout.center.y+f.top-130&&p.y<layout.center.y+f.bottom+130)continue;
  if(layout.syburgTerrace&&[layout.syburgTerrace.raised,layout.syburgTerrace.forecourt].some(f=>p.x>layout.center.x+f.left-100&&p.x<layout.center.x+f.right+100&&p.y>layout.center.y+f.top-100&&p.y<layout.center.y+f.bottom+100))continue;
  if(result.some(s=>Math.hypot(s.x-p.x,s.y-p.y)<90))continue;result.push(p);
 }
 placementCache.set(key,result);return result;
}
let environmentLevel=0;
function environment(ctx,level,layout,low=false){
 if(environmentLevel&&environmentLevel!==level){const name='environment-'+environmentLevel+'.webp';globalThis.DenkmalAssets?.release('expansion-v2:'+name);pending.delete(url(name));}environmentLevel=level;
 const art=image('environment-'+level+'.webp');if(!art)return false;
 const ground={1:[3,5],2:[4,5,7],3:[6,7],4:[4,5],5:[4,5],6:[1,5,6]};
 const points=placements(level,layout);for(let i=0;i<points.length;i++){if(low&&i%2)continue;const p=points[i],paint=()=>ctx.drawImage(art,p.index%4*128,Math.floor(p.index/4)*128,128,128,p.x-p.size/2,p.y-p.size*.75,p.size,p.size);if(!ground[level]?.includes(p.index)&&globalThis.Style2Phase6?.upright)globalThis.Style2Phase6.upright(ctx,p,paint);else paint();}
 return true;
}
globalThis.V2Expansion={action,enemy,hero,impact,legacy,environment,placements,image};
})();
