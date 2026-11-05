/* Approved Westhofen source poses. Cosmetic only; one authored view, mirrored.
 * Images belong to asset-manager's level:7 group, never to individual mobs. */
(()=>{'use strict';
const cell=144,anchorX=72,anchorY=136,sourceHeight=128;
const specs={wraith:['swordsman',4,62],runner:['swordsman',4,54],guardian:['guardian',4,80],archer:['archer',4,62],sapper:['censer',4,64],boss:['golem',5,116]};
const prefix='assets/enemies/westhofen/',suffix='-v1.webp?v=whactors1';
const finite=v=>Number.isFinite(v)?v:0;
const clamp=v=>Math.max(0,Math.min(1,finite(v)));
function draw(ctx,e,face=1,time=0,options={}){
 if(options.level!==7||!e||e.flying)return false;
 const spec=Object.hasOwn(specs,e.type)?specs[e.type]:null;if(!spec)return false;
 const assets=globalThis.DenkmalAssets;if(!assets?.ready)return false;
 const img=assets.ready(prefix+spec[0]+suffix);
 if(!img||img.naturalWidth!==cell*4||img.naturalHeight!==cell*spec[1])return false;
 const reduced=options.reduced||options.low;
 let row=0,frame=0;
 if(options.deathProgress!=null){row=3;frame=reduced?3:Math.min(3,Math.floor(clamp(options.deathProgress)*4));}
 else if(e.hit>0){row=2;frame=reduced?2:Math.min(3,Math.floor(clamp(1-e.hit/.1)*4));}
 else if(e.attackAnim>0){row=1;frame=reduced?2:Math.min(3,Math.floor(clamp(1-e.attackAnim/.22)*4));}
 else if(!reduced&&(Math.abs(e.velX||0)>.5||Math.abs(e.velY||0)>.5)){
  const variant=Math.abs(Math.floor(finite(e.visualVariant)))%4;
  frame=(Math.floor((Math.max(0,finite(time))%(4/6))*6)+variant)%4;
 }
 const scale=spec[2]/sourceHeight;
 ctx.save();try{
  ctx.translate(e.x,e.y);
  ctx.scale(face<0?-1:1,1);
  if(row===3&&!options.alphaApplied)ctx.globalAlpha=(ctx.globalAlpha??1)*(1-clamp(options.deathProgress));
  ctx.drawImage(img,frame*cell,row*cell,cell,cell,-anchorX*scale,-anchorY*scale,cell*scale,cell*scale);
  return true;
 }catch{return false;}finally{ctx.restore();}
}
globalThis.DenkmalWesthofenEnemyActions={draw};
})();
