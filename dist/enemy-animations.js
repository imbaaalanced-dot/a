/* Painted enemy movement, cosmetic only. One shared, lazily loaded atlas.
 * Cold/failed art returns false so the previous renderer stays available. */
(()=>{'use strict';
const cell=160,rows=21,url='assets/enemies/walk-v1.webp?v=enemymove1';
const variants={
 wraith:[12,15,3],runner:[0,13,11],brute:[1,7,9],archer:[2],guardian:[14,3],sapper:[5],
 rootrunner:[11,13],stoneguard:[7,14],mistcaller:[6,16,4],uprooted:[18],
 shadowwing:[8],gargoyle:[17],stormwing:[8,17]
};
const heights={wraith:62,runner:54,brute:80,archer:62,guardian:80,sapper:64,
 rootrunner:60,stoneguard:86,mistcaller:72,boss:116,uprooted:140,
 shadowwing:86,gargoyle:100,stormwing:94};
let entry=null;
function variant(e){return Math.abs(Math.floor(Number(e.visualVariant)||0));}
function select(e,level=1){
 if(!e)return -1;
 if(e.type==='boss')return ({1:18,2:19,3:18,4:10,5:20,6:19})[level]??18;
 const choices=variants[e.type];return choices?choices[variant(e)%choices.length]:-1;
}
function image(){
 if(typeof Image==='undefined')return null;
 if(globalThis.DenkmalAssets){
  const img=globalThis.DenkmalAssets.ready(url);
  return img&&img.naturalWidth===cell*4&&img.naturalHeight===cell*rows?img:null;
 }
 if(entry?.failed&&Date.now()>=entry.retryAt)entry=null;
 if(!entry){
  const current={img:new Image(),failed:false,retryAt:0};entry=current;
  current.img.decoding='async';current.img.onerror=()=>{current.failed=true;current.retryAt=Date.now()+5000;};
  current.img.src=url;
 }
 const img=entry.img;
 return !entry.failed&&img.complete&&img.naturalWidth===cell*4&&img.naturalHeight===cell*rows?img:null;
}
function draw(ctx,e,face=1,time=0,options={}){
 const row=select(e,options.level);if(row<0)return false;
 const img=image();if(!img)return false;
 const moving=Math.hypot(e.velX||0,e.velY||0)>.5;
 const reduced=options.reduced||options.low;
 const clock=Number.isFinite(time)?Math.max(0,time):0;
 const frame=reduced||(!e.flying&&!moving)?0:(Math.floor(clock*6)+variant(e))%4;
 const size=(heights[e.type]||62)*cell/136;
 const airborne=e.flying?12+(e.r||13)*.35:0;
 ctx.save();try{
  ctx.translate(e.x,e.y-airborne);
  const reduced=options.reduced||options.low;
  const attack=clamp(options.attack||0,0,1),hit=clamp(options.hitKick||0,0,1);
  if(!reduced&&attack>0)ctx.translate((face<0?-1:1)*6*attack,0);
  if(!reduced&&hit>0)ctx.translate((face<0?1:-1)*Math.min(5,hit*5),0);
  if(options.deathProgress!=null){
   const death=clamp(options.deathProgress,0,1);
   if(!options.alphaApplied)ctx.globalAlpha=(ctx.globalAlpha==null?1:ctx.globalAlpha)*(1-death);
   if(!reduced&&death>0)ctx.scale(1,1-death*.78);
  }else if(attack>0)ctx.scale(1+attack*.07,1-attack*.025);
  ctx.scale(face<0?-1:1,1);
  ctx.drawImage(img,frame*cell,row*cell,cell,cell,-size/2,-size*148/cell,size,size);
 }finally{ctx.restore();}
 return true;
}
function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
globalThis.DenkmalEnemyAnimations={draw,select};
})();
