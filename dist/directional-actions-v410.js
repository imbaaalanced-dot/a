/* V4.1: separately authored directions. Optional art; no mirrored directional claims. */
(()=>{'use strict';
const directions=['down','left','right','up'],actions=['attack','hit','death'];
const pending=new Map(),queue=[],deaths=new WeakMap();let loading=0,level=null,serial=0;
const clamp=v=>Math.max(0,Math.min(1,v));
function direction(x,y,fallback=null){
 if(!Number.isFinite(x)||!Number.isFinite(y)||Math.hypot(x,y)<=.01)return directions.includes(fallback)?fallback:null;
 return Math.abs(y)>=Math.abs(x)?(y<0?'up':'down'):(x<0?'left':'right');
}
function enemyDirection(e,target,kind=e.attackAnim>0?'attack':null){
 const aim=direction(target?.x-e.x,target?.y-e.y)||direction(e.targetX-e.x,e.targetY-e.y);
 const moving=direction(e.velX,e.velY),facing=direction(0,0,e.direction);
 if(kind==='death')return direction(0,0,e.deathDirection)||facing||aim||moving;
 if(kind==='attack')return aim||direction(0,0,e.attackDirection)||moving||facing;
 return moving||aim||facing;
}
function release(key){const state=pending.get(key);if(!state)return;pending.delete(key);globalThis.DenkmalAssets?.release(state.group);}
function setLevel(next){
 if(next==null||next===level)return;
 if(level!=null)for(const [key,state] of pending)if(state.enemy)release(key);
 level=next;
}
function pump(){
 const assets=globalThis.DenkmalAssets;if(!assets?.retain)return;
 while(loading<2&&queue.length){
  const state=queue.shift();if(pending.get(state.key)!==state)continue;
  state.started=true;loading++;
  Promise.resolve().then(()=>assets.retain(state.group,[state.key])).then(()=>{
   if(pending.get(state.key)===state)state.retryAt=assets.ready(state.key)?Infinity:Date.now()+10000;
   else assets.release(state.group);
  },()=>{state.retryAt=Date.now()+10000;}).finally(()=>{loading--;pump();});
 }
}
function image(spec,actor){
 const assets=globalThis.DenkmalAssets;if(!assets?.ready||!assets?.retain)return null;
 const key=spec.file;if(!key)return null;
 let state=pending.get(key);
 if(state&&state.retryAt<Date.now()){release(key);state=null;}
 if(!state){
  // At most 24 atlases (21 enemy identities plus heroes and one spare), two in flight.
  if(pending.size>=24){const oldest=[...pending].sort((a,b)=>a[1].used-b[1].used)[0];if(oldest)release(oldest[0]);}
  state={key,group:'directional-v410:'+ ++serial,enemy:actor.startsWith('enemy-'),started:false,retryAt:Infinity,used:serial};
  pending.set(key,state);queue.push(state);pump();
 }
 state.used=++serial;return state.started?assets.ready(key):null;
}
function draw(ctx,actor,kind,facing,progress,x,y,height,options={}){
 const spec=globalThis.TD2DirectionalAssets?.[actor];
 const row=spec?.rows?.[facing]?.[kind],c=spec?.cell;
 if(!directions.includes(facing)||!actions.includes(kind)||!Number.isFinite(progress)||spec?.frames!==4||!Number.isInteger(row)||row<0||row>=12||!Number.isFinite(c)||c<=0||!Array.isArray(spec.anchor)||!spec.anchor.every(Number.isFinite)||!(spec.height>0))return false;
 const art=image(spec,actor);if(!art||art.naturalWidth!==c*4||art.naturalHeight!==c*12)return false;
 const frame=options.reduced||options.low?(kind==='death'?3:2):Math.min(3,Math.floor(clamp(progress)*4));
 const scale=height/spec.height;
 ctx.save();try{
  ctx.translate(x,y);
  if(kind==='death'&&!options.alphaApplied)ctx.globalAlpha=(ctx.globalAlpha??1)*(1-clamp(progress));
  ctx.drawImage(art,frame*c,row*c,c,c,-spec.anchor[0]*scale,-spec.anchor[1]*scale,c*scale,c*scale);
  return true;
 }catch{return false;}finally{ctx.restore();}
}
function drawHeroSide(ctx,actor,kind,facing,progress,x,y,height,options={}){
 const base=globalThis.TD2HeroSideAssets?.[actor];
 // Each newly painted view uses its own atlas path but inherits the canonical
 // cell grid, row contract and ground pivot. No mirrored or reused side art.
 const alternate=base?.sheets?.[facing];
 const spec=base?.facing===facing?base:
   typeof alternate==='string'&&alternate&&alternate!==base?.file?
     {...base,file:alternate,facing}:null;
 if(!spec||!directions.includes(facing)||!actions.includes(kind)||!Number.isFinite(progress)||
    spec.frames!==6||spec.cell!==128||!Number.isInteger(spec.rows?.[kind])||
    !Array.isArray(spec.anchor)||!spec.anchor.every(Number.isFinite)||!(spec.height>0))return false;
 const art=image(spec,actor),cell=spec.cell;
 if(!art||art.naturalWidth!==cell*6||art.naturalHeight!==cell*6)return false;
 const frame=options.reduced||options.low?(kind==='death'?5:kind==='hit'?2:3):Math.min(5,Math.floor(clamp(progress)*6));
 const scale=height/spec.height;
 ctx.save();try{
  ctx.translate(x,y);
  if(kind==='death'&&!options.alphaApplied)ctx.globalAlpha=(ctx.globalAlpha??1)*(1-clamp(progress));
  ctx.drawImage(art,frame*cell,spec.rows[kind]*cell,cell,cell,-spec.anchor[0]*scale,-spec.anchor[1]*scale,cell*scale,cell*scale);
  return true;
 }catch{return false;}finally{ctx.restore();}
}
function preloadHeroSide(actor){
 const spec=globalThis.TD2HeroSideAssets?.[actor];
 if(spec)image(spec,actor);
}
function enemy(ctx,e,options={}){
 setLevel(options.level);
 const skin=globalThis.DenkmalEnemyAnimations?.select(e,options.level);if(skin==null||skin<0)return false;
 let kind,progress;
 if(options.deathProgress!=null){kind='death';progress=options.deathProgress;}
 else if(e.hit>0){kind='hit';progress=1-e.hit/.1;}
 else if(e.attackAnim>0){kind='attack';progress=1-e.attackAnim/.22;}
 else return false;
 const heights={runner:44,brute:66,guardian:68,boss:100,uprooted:116,gargoyle:82,shadowwing:72,stormwing:78};
 const actionHeight=skin===0&&e.type==='runner'?54:(heights[e.type]||54);
 // Enemy 00 uses the runner's 54px walk reference, not the older 44px
 // action scale. Keep its authored directional atlas and anchor unchanged.
 return draw(ctx,'enemy-'+String(skin).padStart(2,'0'),kind,enemyDirection(e,options.target,kind),progress,e.x,e.y+6-(e.flying?12+(e.r||13)*.35:0),actionHeight,options);
}
function hero(ctx,h,attackTime,reduced=false,time=0){
 let kind,progress;
 if(h.hp<=0){kind='death';if(!deaths.has(h))deaths.set(h,{time,direction:h.direction});progress=(time-deaths.get(h).time)/.65;}
 else {deaths.delete(h);if(h.hitFlash>0){kind='hit';progress=1-h.hitFlash/.16;}else if(attackTime>0){kind='attack';progress=1-attackTime/.24;}else return false;}
 const facing=kind==='attack'?(direction(0,0,h.attackDirection)||h.direction):kind==='death'?deaths.get(h).direction:h.direction;
 const actor=h.character==='kim'?'kim':'marcel';
 // Only the V5b side sheet is authorized. Unsupported angles remain the
 // V5b walk sheet (painted by HeroSaga), never the older 4x12 hero atlas.
 return drawHeroSide(ctx,actor,kind,facing,progress,0,0,70,{reduced});
}
globalThis.TD2DirectionalActions={draw,drawHeroSide,preloadHeroSide,enemy,hero,direction,enemyDirection,setLevel};
})();
