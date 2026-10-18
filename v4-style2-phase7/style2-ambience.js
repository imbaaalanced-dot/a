/* TD2 Style 2 Phase 7: subtle, deterministic ambience for all playable levels.
 * Ground lights draw beneath actors; airborne dust draws above scenery.
 * Gameplay coordinates, paths and collisions remain untouched. */
(()=>{'use strict';
const WORLD=3072,STEP_X=230,STEP_Y=195,MAX_MOTES=48;
const lightCache=new Map();
function hash(x,y,level){let n=(Math.imul(x,73856093)^Math.imul(y,19349663)^Math.imul(level,83492791))>>>0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296;}
function light(color){
 if(lightCache.has(color))return lightCache.get(color);
 const c=document.createElement('canvas');c.width=c.height=128;
 const g=c.getContext('2d');
 const halo=g.createRadialGradient(64,64,1,64,64,63);
 if(color==='blue'){
  halo.addColorStop(0,'rgba(105,202,215,.65)');halo.addColorStop(.28,'rgba(72,178,190,.25)');halo.addColorStop(1,'rgba(35,138,155,0)');
 }else{
  halo.addColorStop(0,'rgba(255,213,138,.72)');halo.addColorStop(.28,'rgba(232,151,65,.22)');halo.addColorStop(1,'rgba(186,99,30,0)');
 }
 g.fillStyle=halo;g.fillRect(0,0,128,128);
 lightCache.set(color,c);return c;
}
function drawGround(ctx,level,layout,time=0,{low=false}={}){
 if(!layout?.center||!layout.gates)return;
 const gates=layout.gates,center=layout.center;
 ctx.save();
 try{
  // Monument light is a ground accent, not an ever-expanding combat aura.
  ctx.globalAlpha=low?.16:.24;
  ctx.drawImage(light(level===6?'blue':'amber'),center.x-165,center.y-138,330,270);
  // Smaller lantern spill at authored entrances. No invented lamp coordinates.
  ctx.globalAlpha=low?.08:.12;
  for(const gate of gates)ctx.drawImage(light('amber'),gate.x-122,gate.y-106,244,212);
  if(level===6&&layout.airGate&&!low){
   ctx.globalAlpha=.11;
   ctx.drawImage(light('blue'),layout.airGate.x-118,layout.airGate.y-118,236,236);
  }
 }finally{ctx.restore();}
}
function motes(level,camera,viewWidth,viewHeight,time=0,{low=false}={}){
 if(low||!camera||viewWidth<=0||viewHeight<=0)return [];
 const firstX=Math.max(0,Math.floor((camera.x-30)/STEP_X)),lastX=Math.min(Math.ceil(WORLD/STEP_X),Math.ceil((camera.x+viewWidth+30)/STEP_X));
 const firstY=Math.max(0,Math.floor((camera.y-30)/STEP_Y)),lastY=Math.min(Math.ceil(WORLD/STEP_Y),Math.ceil((camera.y+viewHeight+30)/STEP_Y));
 const dust=[];
 for(let y=firstY;y<=lastY;y++)for(let x=firstX;x<=lastX;x++){
  if(dust.length>=MAX_MOTES)return dust;
  const s=hash(x,y,level),p=hash(y,x,level+47);
  if(s<.27)continue; // negative space prevents visual noise
  const phase=s*6.283185307179586,dx=Math.sin(time*.35+phase)*12,dy=Math.sin(time*.23+phase*2)*7;
  const px=(x+.25+p*.5)*STEP_X+dx,py=(y+.25+s*.45)*STEP_Y+dy;
  if(px<0||py<0||px>WORLD||py>WORLD||px<camera.x-15||py<camera.y-15||px>camera.x+viewWidth+15||py>camera.y+viewHeight+15)continue;
  dust.push({x:px,y:py,r:1.2+p*1.5,alpha:.10+.11*(.5+.5*Math.sin(time*.7+phase)),kind:level===6&&p>.6?'blue':s>.79?'leaf':'dust'});
 }
 return dust;
}
function drawAir(ctx,level,camera,viewWidth,viewHeight,time=0,{low=false}={}){
 const particles=motes(level,camera,viewWidth,viewHeight,time,{low});
 if(!particles.length)return 0;
 ctx.save();
 try{
  for(const p of particles){
   ctx.globalAlpha=p.alpha;
   if(p.kind==='leaf'){
    ctx.fillStyle='#ac8b59';ctx.beginPath();ctx.ellipse(p.x,p.y,p.r*2.2,p.r*.68,-.5,0,Math.PI*2);ctx.fill();
   }else{
    ctx.fillStyle=p.kind==='blue'?'#a3ded7':'#e6ce9c';
    ctx.fillRect(p.x,p.y,p.r,p.r);
   }
  }
 }finally{ctx.restore();}
 return particles.length;
}
globalThis.Style2Ambience={drawGround,drawAir,motes,get allocations(){return lightCache.size;},MAX_MOTES};
})();