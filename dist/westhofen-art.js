/* Reference-derived Westhofen composition: street frontage with bus stop,
   green strip, cached ground. The memorial renders procedurally from press
   photos: stepped stone pedestal with bronze winged helmet, sword and shield;
   two side tablets flank the empty central tablet frame, and the two fire-bowl
   pedestals stand bare — documenting the July 2026 bronze theft. */
(()=>{'use strict';
let ground=null,environmentRequested=false;
let memorialSprite=null,memorialRequested=false;
const C={x:1536,y:1536};
const lampOffsets=[[-900,-780],[900,-780],[-1080,-100]];
const memorialUrl='assets/westhofen/westhofen-memorial-style2-v3-preview.svg?v=westhofen-style2v3-preview1';
function readyMemorial(){
 // Level 7 preloads the same preview SVG through the shared asset manager.
 // Keep the standalone fallback for previews without the manager.
 if(globalThis.DenkmalAssets?.ready){
  memorialSprite=globalThis.DenkmalAssets.ready(memorialUrl);
  return !!(memorialSprite?.naturalWidth&&memorialSprite.naturalHeight);
 }
 if(!memorialRequested){
  memorialRequested=true;
  if(typeof Image==='function'){
   memorialSprite=new Image();memorialSprite.decoding='async';
   memorialSprite.src=memorialUrl;
  }
 }
 return !!(memorialSprite?.complete&&memorialSprite.naturalWidth&&memorialSprite.naturalHeight);
}
function path(ctx,points,color,width){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
function environmentLamps(layout){
 return lampOffsets.map(([x,y])=>({x:C.x+x,y:C.y+y})).filter(p=>{
  if(Math.hypot(p.x-C.x,p.y-C.y)<320)return false;
  if(layout.paths.some(route=>globalThis.DenkmalLevels.pathDistance(p,route)<155))return false;
  if(layout.slots.some(slot=>Math.hypot(slot.x-p.x,slot.y-p.y)<155))return false;
  // Keep the memorial apron, bus stop, sidewalk, road and planted hedges clear.
  if(Math.abs(p.x-C.x)<330&&Math.abs(p.y-(C.y+596))<170)return false;
  if(p.y>C.y+520)return false;
  for(const side of [-1,1])if(Math.hypot(p.x-(C.x+side*430),p.y-(C.y-260))<190)return false;
  return true;
 });
}
function requestSharedEnvironment(){
 if(environmentRequested)return;
 const load=globalThis.KirchendeArt?.loadEnvironment;
 if(typeof load!=='function')return;
 environmentRequested=true;
 Promise.resolve(load.call(globalThis.KirchendeArt)).then(ok=>{if(ok)ground=null;else environmentRequested=false;}).catch(()=>{environmentRequested=false;});
}
function createGround(layout){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1536;const q=canvas.getContext('2d');q.scale(.5,.5);
 q.fillStyle=globalThis.TD2GroundV3?.patternFor?.(q,7,'base')||'#3c503b';q.fillRect(0,0,3072,3072);
 const tile=globalThis.DenkmalTerrain?.groundImage;
 if(!globalThis.TD2GroundV3?.imageFor?.(7,'base')&&tile?.complete&&tile.naturalWidth){const pattern=q.createPattern(tile,'repeat');if(pattern){q.save();q.globalAlpha=.16;q.fillStyle=pattern;q.fillRect(0,0,3072,3072);q.restore();}}
 let seed=4127;const rnd=()=>((seed=(Math.imul(seed,1664525))+1013904223)>>>0)/4294967296;
 for(let i=0;i<2100;i++){const x=rnd()*3072,y=rnd()*3072;q.fillStyle=['#6a7c5224','#a89a642c','#1a2f2834'][i%3];q.beginPath();q.ellipse(x,y,4+rnd()*30,2+rnd()*12,0,0,7);q.fill();}
 // Reichshofstraße runs along the southern edge of the memorial green.
 const street=[{x:C.x-1120,y:C.y+760},{x:C.x-560,y:C.y+700},{x:C.x+40,y:C.y+720},{x:C.x+640,y:C.y+660},{x:C.x+1120,y:C.y+700}];
 path(q,street,'#a5a28c',165);path(q,street,'#676f6b',143);path(q,street,globalThis.TD2GroundV3?.patternFor?.(q,7,'street')||'#767d7444',118);
 for(let i=1;i<street.length;i++){const a=street[i-1],b=street[i],len=Math.hypot(b.x-a.x,b.y-a.y);for(let d=30;d<len;d+=64){const t=d/len;q.strokeStyle='#d8d3ba99';q.lineWidth=4;q.setLineDash([26,34]);q.beginPath();q.moveTo(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);q.lineTo(a.x+(b.x-a.x)*(t+22/len),a.y+(b.y-a.y)*(t+22/len));q.stroke();q.setLineDash([]);}}
 // Sidewalk between street and green strip; the air corridor crosses it.
 const walk=[{x:C.x-1120,y:C.y+632},{x:C.x-560,y:C.y+574},{x:C.x+40,y:C.y+592},{x:C.x+640,y:C.y+536},{x:C.x+1120,y:C.y+574}];
 path(q,walk,globalThis.TD2GroundV3?.patternFor?.(q,7,'sidewalk')||'#8f9482',54);
 // Bus stop "Westhofen Denkmal" at the eastern roadside (Reichshofstr. 142).
 const bx=C.x+330,by=C.y+596;q.fillStyle='#565d58';q.fillRect(bx-58,by-40,116,46);q.fillStyle='#7e837a';q.fillRect(bx-58,by-48,116,10);q.fillStyle='#33383444';q.beginPath();q.ellipse(bx,by+10,72,14,0,0,7);q.fill();q.fillStyle='#4b524d';q.fillRect(bx-50,by-24,100,10);q.fillStyle='#2c332f';q.fillRect(bx+40,by-22,8,28);
 // Lane footpaths: two street accesses and the northern green corridor.
 for(const lane of layout.paths){path(q,lane,'#192c2488',104);path(q,lane,'#aa9a7d',83);path(q,lane,'#816858',72);path(q,lane,globalThis.TD2GroundV3?.patternFor?.(q,7,'road')||'#b9907244',58);
  for(let i=1;i<lane.length;i++){const a=lane[i-1],b=lane[i],len=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/len,ny=(b.x-a.x)/len;for(let d=12;d<len;d+=22){const x=a.x+(b.x-a.x)*d/len,y=a.y+(b.y-a.y)*d/len;q.strokeStyle='#483f3966';q.lineWidth=2;q.beginPath();q.moveTo(x+nx*34,y+ny*34);q.lineTo(x-nx*34,y-ny*34);q.stroke();}}
 }
 // Gravel apron around the memorial stays oval and blends into the grass.
 // Previous 48x28 bright rectangles overlapped on a 37x20 grid, producing an
 // opaque rectangular mat behind the altar in mobile portrait. Keep deliberate
 // gaps between individually weathered flagstones and clip them to the apron.
 q.fillStyle=globalThis.TD2GroundV3?.patternFor?.(q,7,'forecourt')||'#505b50';
 q.beginPath();q.ellipse(C.x,C.y+8,300,190,0,0,Math.PI*2);q.fill();
 q.save();
 q.beginPath();q.ellipse(C.x,C.y+8,292,183,0,0,Math.PI*2);q.clip();
 for(let y=-140;y<150;y+=34)for(let x=-250;x<250;x+=52){
  // Grid stride is 37.44 x 20.4 world px; stone bounds never overlap.
  const salt=Math.abs((x*31+y*17)^((x-y)*13))%5;
  const px=C.x+x*.72+(salt%3),py=C.y+y*.6+((salt+1)%3);
  const w=29+salt,h=13+(salt%4);
  q.fillStyle='#27382e66';
  q.beginPath();q.moveTo(px+2,py+2);q.lineTo(px+w+2,py+2);
  q.lineTo(px+w,py+h+2);q.lineTo(px+1,py+h+2);q.closePath();q.fill();
  q.fillStyle=['#596353','#656d5d','#727665','#5d675b','#69705d'][salt];
  q.beginPath();q.moveTo(px+2,py);q.lineTo(px+w-3,py+1);
  q.lineTo(px+w,py+3);q.lineTo(px+w-2,py+h-1);
  q.lineTo(px+2,py+h);q.lineTo(px,py+h-3);q.closePath();q.fill();
  q.strokeStyle='#a3a99544';q.lineWidth=1;
  q.beginPath();q.moveTo(px+4,py+2);q.lineTo(px+w-5,py+2);q.stroke();
 }
 q.restore();
 // A translucent, soft contact shade ties the transparent sprite's stair
 // footing to the dark forecourt without changing the objective's geometry.
 const seam=q.createRadialGradient(C.x,C.y+75,40,C.x,C.y+75,235);
 seam.addColorStop(0,'#1a2b2070');seam.addColorStop(.65,'#26392a28');seam.addColorStop(1,'#27392a00');
 q.fillStyle=seam;q.beginPath();q.ellipse(C.x,C.y+64,245,125,0,0,Math.PI*2);q.fill();
 // Hedges with benches frame the green; both stay clear of lanes and pads.
 for(const side of [-1,1]){const hx=C.x+side*430,hy=C.y-260;q.fillStyle='#27361f';q.beginPath();q.ellipse(hx,hy,90,46,side*.3,0,7);q.fill();
  for(let j=0;j<26;j++){const px=hx+(rnd()-.5)*160,py=hy+(rnd()-.5)*76;globalThis.DenkmalForest?.drawShrub?.(q,px,py,12,j);q.fillStyle=j%5?'#5e7044':'#4c5f3a';q.beginPath();q.arc(px,py,4+rnd()*4,0,7);q.fill();}
  const px2=C.x+side*430,py2=C.y-190;q.fillStyle='#3a3f38';q.fillRect(px2-26,py2-6,52,10);q.fillStyle='#5a4b3a';q.fillRect(px2-26,py2-22,52,6);q.fillStyle='#4a4a44';q.fillRect(px2-22,py2+4,6,16);q.fillRect(px2+16,py2+4,6,16);}
 // Trees: northern green corridor and the street side, off authored lanes/pads.
 for(let i=0;i<30;i++){const north=i<20,x=north?C.x-1000+rnd()*2000:C.x-1050+rnd()*730,y=north?C.y-980+rnd()*520:C.y+430+rnd()*180,r=70+rnd()*80;const p={x,y};if(layout.paths.some(l=>globalThis.DenkmalLevels.pathDistance(p,l)<r+75)||layout.slots.some(s=>Math.hypot(x-s.x,y-s.y)<r+60))continue;
  q.fillStyle='#12231c55';q.beginPath();q.ellipse(x+25,y+55,r,r*.5,0,0,7);q.fill();globalThis.DenkmalForest?.drawCrown?.(q,x,y,r,i);}
 const atlas=globalThis.KirchendeArt?.image?.('environment');
 if(atlas?.naturalWidth){
  const sw=atlas.naturalWidth/3,sh=atlas.naturalHeight/2;
  for(const p of environmentLamps(layout)){
   const {x,y}=p,glow=q.createRadialGradient(x,y-52,3,x,y-52,190);
   glow.addColorStop(0,'#efbd7050');glow.addColorStop(.44,'#c18c4a20');glow.addColorStop(1,'#70591a00');
   q.fillStyle=glow;q.fillRect(x-190,y-242,380,380);
   q.drawImage(atlas,sw*2,sh,sw,sh,x-64,y-132,128,128);
  }
 }
 return canvas;
}
function drawGround(ctx,layout){requestSharedEnvironment();if(!ground)ground=createGround(layout);ctx.drawImage(ground,0,0,3072,3072);}
function drawMonument(ctx,m){
 if(readyMemorial()){
  // Identical objective anchor and collision footprint; bitmap is visual only.
  ctx.save();try{
   ctx.drawImage(memorialSprite,m.x-225,m.y-265,450,300);
   const damage=Math.max(0,1-(m.hp??m.maxHp??1)/(m.maxHp||1));
   if(damage>.25){ctx.strokeStyle='#332d2666';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(m.x-43,m.y-54);ctx.lineTo(m.x-35,m.y-36);ctx.lineTo(m.x-41,m.y-19);ctx.stroke();}
  }finally{ctx.restore();}
  return;
 }
 // Original-photo-derived memorial: low ivy-covered stone lintels, two tall
 // rear plaques, central helmet altar and stepped forecourt. Canvas fallback.
 ctx.save();ctx.translate(m.x,m.y);
 const hurt=Math.max(0,1-(m.hp??m.maxHp??1)/(m.maxHp||1));
 const stone='#777568',edge='#4d4e46',light='#a09a84',bronze='#52635a';
 const block=(x,y,w,h)=>{ctx.fillStyle=edge;ctx.fillRect(x+3,y+4,w,h);ctx.fillStyle=stone;ctx.fillRect(x,y,w,h);ctx.fillStyle=light;ctx.fillRect(x,y,w,4);};
 // The memorial's broad, low sandstone platform and short entrance steps.
 ctx.fillStyle='#1b211f66';ctx.beginPath();ctx.ellipse(0,18,210,39,0,0,Math.PI*2);ctx.fill();
 block(-195,-10,390,20);
 for(let i=0;i<3;i++)block(-76-i*11,7+i*8,152+i*22,8);
 // Open pergola: horizontal ivy-covered lintels, never Gothic arches.
 for(const x of [-172,-95,95,172])block(x-13,-155,26,145);
 block(-190,-170,380,22);
 // Side bronze memorial plaques are mounted to rear inner piers.
 for(const x of [-125,125]){
  ctx.fillStyle='#343c38';ctx.fillRect(x-25,-143,50,98);
  ctx.strokeStyle='#87958a';ctx.lineWidth=2;ctx.strokeRect(x-23,-141,46,94);
  ctx.strokeStyle='#8b9b90';ctx.lineWidth=1;
  for(let j=0;j<11;j++){ctx.beginPath();ctx.moveTo(x-17,-129+j*7);ctx.lineTo(x+17,-129+j*7);ctx.stroke();}
 }
 // Ivy on upper lintel and left pier; keep central silhouette readable.
 for(let i=0;i<36;i++){const x=-182+i*10,y=-171+(i%4)*4;
  ctx.fillStyle=i%3?'#394e32':'#607246';ctx.beginPath();ctx.arc(x,y,5+(i%3),0,Math.PI*2);ctx.fill();
 }
 for(let i=0;i<15;i++){ctx.fillStyle=i%2?'#344a30':'#596a3c';ctx.beginPath();ctx.arc(-177+(i%3)*5,-155+i*8,5,0,Math.PI*2);ctx.fill();}
 // Front altar: broad low sandstone block with detachable central plaque.
 block(-86,-75,172,76);block(-101,-83,202,13);
 ctx.fillStyle='#404b48';ctx.fillRect(-63,-60,126,46);
 ctx.strokeStyle='#7c8b80';ctx.lineWidth=2;ctx.strokeRect(-62,-59,124,44);
 // Horizontal sword, shield and recognizable upward winged helmet.
 ctx.fillStyle='#827d69';ctx.beginPath();ctx.ellipse(0,-94,58,12,0,0,Math.PI*2);ctx.fill();
 ctx.strokeStyle='#9c957d';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-73,-103);ctx.lineTo(75,-103);ctx.stroke();
 ctx.fillStyle=bronze;ctx.beginPath();ctx.moveTo(-23,-106);ctx.quadraticCurveTo(-27,-142,0,-147);ctx.quadraticCurveTo(27,-142,23,-106);ctx.closePath();ctx.fill();
 ctx.fillStyle='#202925';ctx.beginPath();ctx.ellipse(0,-110,18,10,0,0,Math.PI*2);ctx.fill();
 for(const side of [-1,1]){ctx.fillStyle=bronze;ctx.beginPath();ctx.moveTo(side*18,-135);ctx.quadraticCurveTo(side*53,-178,side*49,-148);ctx.quadraticCurveTo(side*43,-128,side*20,-122);ctx.closePath();ctx.fill();}
 // Subtle damage only, without changing the landmark's recognizable shape.
 if(hurt>.25){ctx.strokeStyle='#30332b88';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-66,-70);ctx.lineTo(-54,-35);ctx.lineTo(-60,-10);ctx.stroke();}
 ctx.restore();
}
function drawAirLane(ctx,layout,active){if(!active)return;const a=layout.airGate;ctx.save();try{ctx.setLineDash([13,20]);path(ctx,[a,C],'#7ac5d27a',3);ctx.setLineDash([]);ctx.fillStyle='#a6e7ec';ctx.font='700 16px sans-serif';ctx.textAlign='center';ctx.fillText('LUFTZULAUF',a.x,a.y-36);ctx.beginPath();ctx.moveTo(a.x-12,a.y-12);ctx.lineTo(a.x,a.y-25);ctx.lineTo(a.x+12,a.y-12);ctx.strokeStyle='#a6e7ec';ctx.lineWidth=3;ctx.stroke();}finally{ctx.restore();}}
globalThis.DenkmalWesthofenArt={drawGround,drawMonument,drawAirLane,environmentLamps,release(){ground=null;memorialSprite=null;memorialRequested=false;environmentRequested=false;}};})();
