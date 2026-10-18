/* Generated Rift/Ice art. Existing mage identity and all combat values stay intact.
 * Failed/cold images return false so the procedural Style2 renderer remains usable. */
(()=>{'use strict';
const supported=new Set(['mage','rift']),images=new Map();
const tier=value=>Math.max(1,Math.min(3,Math.floor(Number(value)||1)));
function image(kind,type){
 if((!supported.has(kind)&&!(['bow','cannon','boomerang'].includes(kind)&&type==='towers'))||typeof Image==='undefined')return null;
 const key=kind+'-'+type;
 if(!images.has(key)){
  const entry={img:new Image(),failed:false,retryAt:0};images.set(key,entry);
  entry.img.decoding='async';entry.img.onerror=()=>{entry.failed=true;entry.retryAt=Date.now()+5000;};
  entry.img.src='assets/elemental/'+key+'-v1.webp?v=elemental1';
 }
 const entry=images.get(key);
 if(entry.failed&&Date.now()>=entry.retryAt){images.delete(key);return image(kind,type);}
 return !entry.failed&&entry.img.complete&&entry.img.naturalWidth>0?entry.img:null;
}
function drawTower(ctx,kind,x,y,level){
 const img=image(kind,'towers');if(!img)return false;
 const size=112;ctx.drawImage(img,(tier(level)-1)*512,0,512,512,x-size/2,y+13-size,size,size);return true;
}
function drawProjectile(ctx,b){
 if(!b)return false;const img=image(b.kind,'projectiles');if(!img)return false;
 const level=tier(b.level),size=[30,36,42][level-1];
 ctx.save();try{ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy??0,b.vx??1));ctx.drawImage(img,(level-1)*128,0,128,128,-size/2,-size/2,size,size);}finally{ctx.restore();}return true;
}
function drawImpact(ctx,p){
 if(!p?.style2Impact)return false;
 const img=image(p.kind,'impacts');if(!img)return false;
 const level=tier(p.level),progress=Math.max(0,Math.min(1,1-p.life/Math.max(.001,p.max)));
 const frame=Math.min(5,Math.floor(progress*6)),size=[48,62,78][level-1];
 ctx.save();try{ctx.globalAlpha*=1-progress;ctx.drawImage(img,frame*128,(level-1)*128,128,128,p.x-size/2,p.y-size/2,size,size);}finally{ctx.restore();}return true;
}
globalThis.ElementalSprites={drawTower,drawProjectile,drawImpact};
})();

/* Shared enemy atlas: stable feet and type-specific silhouette sizes. */
(()=>{'use strict';
const types=['wraith','runner','brute','archer','guardian','sapper','rootrunner','stoneguard','mistcaller','boss','uprooted'];
const heights=[62,54,80,62,80,64,60,86,72,116,140];let img=null,failed=false,retryAt=0;
function draw(ctx,e,face=1){const i=types.indexOf(e.type);if(i<0||typeof Image==='undefined')return false;
 if(failed&&Date.now()>=retryAt){img=null;failed=false;}
 if(!img){img=new Image();img.decoding='async';img.onerror=()=>{failed=true;retryAt=Date.now()+5000;};img.src='assets/elemental/enemies-v1.webp?v=enemies1';}
 if(failed||!img.complete||!img.naturalWidth)return false;
 const size=heights[i];ctx.save();try{ctx.translate(e.x,e.y);ctx.scale(face<0?-1:1,1);ctx.drawImage(img,(i%4)*256,Math.floor(i/4)*256,256,256,-size/2,-size*240/256,size,size);}finally{ctx.restore();}return true;
}
globalThis.Style2Enemies={draw};})();
