/* TD2 size/perspective grid (P1 #330 §2 / beta plan: „Perspektiv-/Größenraster
 * für Straße, Monument, Turm, Spieler und Vegetation“). Opt-in dev overlay via
 * ?td2SizeGrid=1: draws a 256-world-unit grid with coordinate labels over the
 * current viewport. Read-only debug drawing; no gameplay state is touched. */
(()=>{'use strict';
const enabled=/(?:^|[?&])td2SizeGrid=1(?:&|$)/.test(globalThis.location?.search||'');
const STEP=256,WORLD=3072;
function draw(ctx,level,camera,viewWidth,viewHeight){
 if(!enabled||!camera||viewWidth<=0||viewHeight<=0)return false;
 const x0=Math.max(0,Math.floor(camera.x/STEP)*STEP),x1=Math.min(WORLD,Math.ceil((camera.x+viewWidth)/STEP)*STEP);
 const y0=Math.max(0,Math.floor(camera.y/STEP)*STEP),y1=Math.min(WORLD,Math.ceil((camera.y+viewHeight)/STEP)*STEP);
 if(x1<x0||y1<y0)return false;
 ctx.save();
 try{
  ctx.strokeStyle='#7ac5d233';ctx.lineWidth=1;
  ctx.fillStyle='#a6e7ec99';ctx.font='11px sans-serif';ctx.textAlign='left';ctx.textBaseline='alphabetic';
  for(let x=x0;x<=x1;x+=STEP){
   ctx.beginPath();ctx.moveTo(x,y0);ctx.lineTo(x,y1);ctx.stroke();
   if(x%1024===0)ctx.fillText('x'+x,x+3,y0+12);
  }
  for(let y=y0;y<=y1;y+=STEP){
   ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x1,y);ctx.stroke();
   if(y%1024===0)ctx.fillText('y'+y,x0+3,y-3);
  }
  ctx.fillStyle='#a6e7ecc0';ctx.fillText('Raster 256 wu · Level '+level,Math.max(0,camera.x)+6,Math.max(0,camera.y)+24);
 }finally{ctx.restore();}
 return true;
}
globalThis.TD2SizeGrid={draw,enabled,STEP};
})();
