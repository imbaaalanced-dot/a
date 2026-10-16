/* Denkmal TD2 – Style 2 map pass.
 * Painted static world backgrounds for levels 1–2. All roads and placements
 * use the EXISTING level data; no navigation, collisions, or spawning changes.
 * One 1536px offscreen canvas at a time, generated lazily and reused. */
(() => {
'use strict';
const WORLD=3072,SCALE=.5;
let activeLevel=0,background=null,baseTile=null,builds=0;
function rng(seed){return()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
function line(g,points,width,color){
  if(!points||points.length<2)return;
  g.save();g.lineJoin='round';g.lineCap='round';g.lineWidth=width;g.strokeStyle=color;
  g.beginPath();points.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.stroke();g.restore();
}
function circle(g,x,y,r,fill,stroke){
  g.beginPath();g.arc(x,y,r,0,Math.PI*2);if(fill){g.fillStyle=fill;g.fill();}
  if(stroke){g.strokeStyle=stroke;g.lineWidth=2;g.stroke();}
}
function tile(){
  if(baseTile)return baseTile;
  const c=document.createElement('canvas');c.width=c.height=256;
  const g=c.getContext('2d'),rand=rng(246195);
  g.fillStyle='#2d3b31';g.fillRect(0,0,256,256);
  for(let i=0;i<4400;i++){
    const x=rand()*256,y=rand()*256,r=.4+rand()*3.5;
    g.fillStyle=['#4a594036','#9b927044','#101c193e','#7278492a'][i%4];
    g.fillRect(x,y,r,r*.5);
  }
  for(let i=0;i<44;i++){
    const x=rand()*256,y=rand()*256;
    const a=g.createRadialGradient(x,y,0,x,y,12+rand()*27);
    a.addColorStop(0,i%3?'#66764b34':'#554f3d33');a.addColorStop(1,'#31432a00');
    g.fillStyle=a;g.fillRect(x-40,y-40,80,80);
  }
  baseTile=c;return c;
}
function worldGround(g,level){
  g.fillStyle='#26362c';g.fillRect(0,0,WORLD,WORLD);
  if(globalThis.DenkmalTerrain?.drawGround)globalThis.DenkmalTerrain.drawGround(g,0,0,WORLD,WORLD);
  else{const pattern=g.createPattern(tile(),'repeat');if(pattern){g.fillStyle=pattern;g.fillRect(0,0,WORLD,WORLD);}}
  const halo=g.createRadialGradient(1536,1510,130,1536,1510,1500);
  halo.addColorStop(0,level===1?'#b0a06a14':'#7e895e14');
  halo.addColorStop(.55,'#1d2d2600');halo.addColorStop(1,'#060c12a0');
  g.fillStyle=halo;g.fillRect(0,0,WORLD,WORLD);
  // Autumn forest vegetation stays around the playable clearing, not on lanes.
  const rand=rng(level===1?11643:28570);
  const center={x:1536,y:1536};
  for(let i=0;i<520;i++){
    const x=rand()*WORLD,y=rand()*WORLD;
    const d=Math.hypot(x-center.x,y-center.y);
    if(d<440||d<860&&rand()<.74)continue;
    const r=5+rand()*20;
    g.fillStyle=['#283e2ee0','#556443c0','#70462ed0','#8e5d33b5','#2f4943b0'][i%5];
    circle(g,x,y,r,g.fillStyle);
    circle(g,x-r*.29,y-r*.33,r*.45,'#c8a26922');
  }
}
function road(g,path,level){
  if(!path||path.length<2)return;
  // Broad worn soil shoulder, cobblestone body and subtle lit edge.
  line(g,path,126,'#101917bb');
  line(g,path,114,'#665a477c');
  line(g,path,98,'#9c8870');
  line(g,path,90,'#b3a080');
  line(g,path,82,'#827361');
  // Small tessellated paving blocks follow the same path centreline.
  const rand=rng(1976+path[0].x*3+path[0].y);
  for(let j=1;j<path.length;j++){
    const a=path[j-1],b=path[j],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
    const nx=-dy/len,ny=dx/len,tx=dx/len,ty=dy/len;
    for(let along=12;along<len-8;along+=23)for(const across of [-31,-11,10,30]){
      const x=a.x+tx*along+nx*across,y=a.y+ty*along+ny*across;
      const shade=['#e3d0a44b','#524b443e','#c8b28b65','#46463b25'][Math.floor(rand()*4)];
      g.strokeStyle=shade;g.lineWidth=2;
      g.beginPath();g.moveTo(x-ty*8-nx*7,y+tx*8-ny*7);
      g.lineTo(x+ty*8+nx*7,y-tx*8+ny*7);g.stroke();
    }
  }
  // Route readability takes precedence over light decoration.
  line(g,path,2,level===1?'#f7dfaa50':'#ebd2a33d');
}
function segmentDistance(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
  return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);
}
function distToPath(p,path){let d=Infinity;for(let i=1;i<path.length;i++)d=Math.min(d,segmentDistance(p,path[i-1],path[i]));return d;}
function padClear(p,slots,r=80){return slots.every(s=>Math.hypot(s.x-p.x,s.y-p.y)>=r);}
function shrubs(g,x,y,r,variant){
  circle(g,x+4,y+10,r+5,'#111b15a6');
  circle(g,x,y,r,['#354c31','#455b34','#3f583b'][variant%3],'#1d3027');
  for(let i=0;i<5;i++){
    const a=(i*2.4+variant)*1.5,rx=Math.cos(a)*r*.6,ry=Math.sin(a)*r*.44;
    circle(g,x+rx,y+ry,r*.29,i%2?'#6b775057':'#8e965e50');
  }
}
function hedges(g,level,paths,slots,gates){
  const path=paths[0];if(level!==2||!path)return;
  const pieces=[];
  for(let j=1;j<path.length;j++){
    const a=path[j-1],b=path[j],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
    const nx=-dy/len,ny=dx/len;
    for(let d=58;d<len-42;d+=44)for(const side of [-1,1]){
      const x=a.x+dx*d/len+nx*111*side,y=a.y+dy*d/len+ny*111*side,p={x,y};
      if(!padClear(p,slots,81)||gates.some(gate=>Math.hypot(gate.x-x,gate.y-y)<115))continue;
      if(paths.some(pth=>distToPath(p,pth)<85))continue;
      if(x<250||x>WORLD-250||y<250||y>WORLD-250)continue;
      pieces.push([x,y,side]);
    }
  }
  for(let i=0;i<pieces.length;i++){
    const [x,y]=pieces[i];shrubs(g,x,y,21,i);
    if(i%7===0)circle(g,x+12,y-7,4,i%2?'#bf9167':'#9873a0');
  }
}
function lantern(g,x,y,level){
  // Warm light is baked into the map so low-power Android needs no glow pass.
  const light=g.createRadialGradient(x,y,4,x,y,99);
  light.addColorStop(0,'#ffdb8178');light.addColorStop(.35,'#eca95526');light.addColorStop(1,'#f4a63b00');
  g.fillStyle=light;g.fillRect(x-99,y-99,198,198);
  circle(g,x+6,y+8,20,'#07131577');
  g.strokeStyle='#343b31';g.lineWidth=7;g.beginPath();g.moveTo(x,y+30);g.lineTo(x,y-23);g.stroke();
  g.strokeStyle='#ba9761';g.lineWidth=3;g.strokeRect(x-10,y-27,20,23);
  circle(g,x,y-18,level===1?6:5,'#ffdb89');
  circle(g,x,y-18,2,'#fff1c4');
}
function decorate(g,level,layout){
  const {center,gates,slots,paths}=layout;
  const rand=rng(64898+level*123);
  // Low stone guard rings near the core; do not change monument collision.
  g.strokeStyle='#a69a778a';g.lineWidth=14;
  g.beginPath();g.arc(center.x,center.y,166,0,Math.PI*2);g.stroke();
  g.strokeStyle='#3b4a3699';g.lineWidth=5;
  g.beginPath();g.arc(center.x,center.y,185,0,Math.PI*2);g.stroke();
  for(let i=0;i<32;i++){
    const a=i*Math.PI/16,r=189+(i%3)*13,x=center.x+Math.cos(a)*r,y=center.y+Math.sin(a)*r,p={x,y};
    if(paths.some(path=>distToPath(p,path)<76)||!padClear(p,slots,70))continue;
    shrubs(g,x,y,8+(i%3)*3,i);
  }
  // Build pads remain visually distinct even under the fully painted terrain.
  for(const p of slots){
    circle(g,p.x,p.y,36,'#101e19aa','#c5ab7566');
    circle(g,p.x,p.y,29,'#29352b','#d8bc8266');
    for(let i=0;i<6;i++){
      const a=i*Math.PI/3;
      circle(g,p.x+Math.cos(a)*33,p.y+Math.sin(a)*33,2,'#e0c58a66');
    }
  }
  // Entrance pillars and amber torches remain outside active spawn circles.
  for(let i=0;i<gates.length;i++){
    const gate=gates[i],dx=center.x-gate.x,dy=center.y-gate.y,len=Math.hypot(dx,dy)||1;
    const nx=-dy/len,ny=dx/len;
    for(const side of [-1,1]){
      const x=gate.x+nx*82*side,y=gate.y+ny*82*side;
      g.fillStyle='#2c3632';g.fillRect(x-15,y-9,30,32);
      g.fillStyle='#817968';g.fillRect(x-17,y-16,34,9);
      g.fillStyle='#c4b18b';g.fillRect(x-17,y-16,34,3);
      lantern(g,x,y-15,level);
    }
  }
  // Sparse flowerbeds beside roads, never on active lanes or build pads.
  for(let i=0;i<200;i++){
    const x=570+rand()*1940,y=560+rand()*1940,p={x,y};
    if(paths.some(path=>distToPath(p,path)<110)||!padClear(p,slots,72)||Math.hypot(x-center.x,y-center.y)<215)continue;
    const size=2+rand()*5;
    circle(g,x,y,size,['#c28e5c98','#985d6790','#ada36398','#62764b99'][i%4]);
  }
}
function make(level,layout){
  if(level!==1&&level!==2)return null;
  const c=document.createElement('canvas');c.width=c.height=WORLD*SCALE;
  const g=c.getContext('2d');g.scale(SCALE,SCALE);
  worldGround(g,level);
  for(const path of layout.paths)road(g,path,level);
  hedges(g,level,layout.paths,layout.slots,layout.gates);
  decorate(g,level,layout);
  builds++;
  return c;
}
function draw(ctx,level,camera,viewWidth,viewHeight,layout){
  if(level!==1&&level!==2)return false;
  if(activeLevel!==level||!background){background=make(level,layout);activeLevel=level;}
  const x=Math.max(0,camera.x-56),y=Math.max(0,camera.y-56);
  const w=Math.max(0,Math.min(WORLD-x,viewWidth+112)),h=Math.max(0,Math.min(WORLD-y,viewHeight+112));
  if(!w||!h)return true;
  ctx.drawImage(background,x*SCALE,y*SCALE,w*SCALE,h*SCALE,x,y,w,h);
  return true;
}
globalThis.Style2Maps={
  draw,
  stats:()=>({activeLevel,builds,canvas:background&&{width:background.width,height:background.height}}),
  reset:()=>{activeLevel=0;background=null;}
};
})();