/* Reference-derived Westhofen composition: street frontage with bus stop,
   green strip, cached ground. The memorial renders procedurally from press
   photos: stepped stone pedestal with bronze winged helmet, sword and shield;
   two side tablets flank the empty central tablet frame, and the two fire-bowl
   pedestals stand bare — documenting the July 2026 bronze theft. */
(()=>{'use strict';
let ground=null, monumentSprite=null, monumentLoad='unrequested';
let loadGeneration=0;
function readyMonumentSprite(){
 if(monumentLoad==='unrequested'){
  if(typeof Image!=='function'){monumentLoad='unavailable';return null;}
  monumentLoad='loading';
  const img=new Image();monumentSprite=img;
  const generation=loadGeneration;
  img.decoding='async';
  img.onload=()=>{if(generation===loadGeneration)monumentLoad=img.naturalWidth>0&&img.naturalHeight>0?'ready':'failed';};
  img.onerror=()=>{if(generation===loadGeneration)monumentLoad='failed';};
  img.src='assets/westhofen-monument-v2.webp?v=whmonument2';
 }
 return monumentLoad==='ready'&&monumentSprite?.complete&&monumentSprite.naturalWidth>0?monumentSprite:null;
}
const C={x:1536,y:1536};
// Decorative location estimates only. Runtime geometry is the source of truth.
const SCENERY=[
 {name:'pergola',url:'assets/westhofen/pergola-pilot.svg?v=westhofen-scenery1',dx:-825,dy:-420,w:165,h:124},
 {name:'stairs',url:'assets/westhofen/stairs-pilot.svg?v=westhofen-scenery1',dx:850,dy:-530,w:150,h:112},
 {name:'wall',url:'assets/westhofen/wall-pilot.svg?v=westhofen-scenery1',dx:820,dy:-115,w:152,h:114}
];
let sceneryStarted=false;
const scenery=new Map();
function requestScenery(){
 if(sceneryStarted)return;
 sceneryStarted=true;
 if(typeof Image!=='function')return;
 for(const item of SCENERY){
  const img=new Image();
  const generation=loadGeneration;
  scenery.set(item.name,{image:img,loaded:false,failed:false});
  img.decoding='async';
  img.onload=()=>{
   if(generation!==loadGeneration)return;
   const entry=scenery.get(item.name);
   if(entry){entry.loaded=img.naturalWidth>0&&img.naturalHeight>0;entry.failed=!entry.loaded;ground=null;}
  };
  img.onerror=()=>{if(generation!==loadGeneration)return;const entry=scenery.get(item.name);if(entry)entry.failed=true;};
  img.src=item.url;
 }
}
function safeScenery(item,layout){
 const p={x:C.x+item.dx,y:C.y+item.dy};
 const margin=Math.max(item.w,item.h)*.6+120;
 return Math.hypot(item.dx,item.dy)>400 &&
   p.x>margin&&p.y>margin&&p.x<3072-margin&&p.y<3072-margin&&
   layout.paths.every(route=>globalThis.DenkmalLevels.pathDistance(p,route)>margin)&&
   layout.slots.every(slot=>Math.hypot(slot.x-p.x,slot.y-p.y)>margin);
}
function drawScenery(q,layout){
 for(const item of SCENERY){
  const entry=scenery.get(item.name);
  if(!entry?.loaded||!entry.image.complete||!safeScenery(item,layout))continue;
  // Ground uses 0.82 depth projection; compensate standing silhouettes.
  q.save();
  try{
   q.translate(C.x+item.dx,C.y+item.dy);
   q.scale(1,1/.82);
   q.drawImage(entry.image,-item.w/2,-item.h,item.w,item.h);
  }finally{q.restore();}
 }
}

// Ground-level moss, small plants and loose stones: deterministic and outside
// all travel lanes, build pads and the monument footprint. Draw only in cache.
function drawLowVegetation(q,layout,rnd){
 const clearance=p=>Math.hypot(p.x-C.x,p.y-C.y)>355 &&
   layout.paths.every(route=>globalThis.DenkmalLevels.pathDistance(p,route)>135)&&
   layout.slots.every(slot=>Math.hypot(slot.x-p.x,slot.y-p.y)>112)&&
   SCENERY.every(item=>Math.hypot(p.x-C.x-item.dx,p.y-C.y-item.dy)>155);
 for(let i=0;i<130;i++){
  const x=240+rnd()*2592,y=230+rnd()*2592,p={x,y};
  if(!clearance(p))continue;
  const radius=7+rnd()*17;
  // Shadows and leafy clusters are kept shallow so build pads stay legible.
  q.fillStyle='#14251a33';
  q.beginPath();q.ellipse(x+3,y+5,radius*1.6,radius*.46,0,0,Math.PI*2);q.fill();
  q.fillStyle=['#43563a','#64714a','#455d46','#77715b'][i%4];
  for(let leaf=0;leaf<3;leaf++){
   const a=(leaf*2.094)+rnd()*.35,px=x+Math.cos(a)*radius*.48,py=y+Math.sin(a)*radius*.28;
   q.beginPath();q.ellipse(px,py,radius*.58,radius*.26,a*.28,0,Math.PI*2);q.fill();
  }
  if(i%5===0){
   q.fillStyle='#a39d82';
   q.beginPath();q.ellipse(x+radius,y+radius*.35,3+rnd()*4,2+rnd()*2,-.3,0,Math.PI*2);q.fill();
  }
 }
}
function path(ctx,points,color,width){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
// Irregular, staggered old-stone joints. All marks are baked once into ground,
// not redrawn each frame; the path geometry and collision areas never change.
function drawStoneJoints(ctx,lane){
 for(let i=1;i<lane.length;i++){
  const a=lane[i-1],b=lane[i],len=Math.hypot(b.x-a.x,b.y-a.y);
  if(len<1)continue;
  const ux=(b.x-a.x)/len,uy=(b.y-a.y)/len,nx=-uy,ny=ux;
  for(let d=18,j=0;d<len-6;d+=31,j++){
   const x=a.x+ux*d,y=a.y+uy*d,shift=(j%3-1)*4;
   ctx.strokeStyle=j%4===0?'#c4ae8a55':'#302c2a75';ctx.lineWidth=1.7;
   ctx.beginPath();ctx.moveTo(x+nx*(-31+shift),y+ny*(-31+shift));
   ctx.lineTo(x+ux*3+nx*(31+shift),y+uy*3+ny*(31+shift));ctx.stroke();
   // Half-length seam alternates sides, avoiding a uniform ladder appearance.
   const side=j%2?-1:1,offset=d+15;
   if(offset<len-5){ctx.beginPath();ctx.moveTo(a.x+ux*offset,a.y+uy*offset);
    ctx.lineTo(a.x+ux*offset+nx*side*29,a.y+uy*offset+ny*side*29);ctx.stroke();}
  }
 }
}
function createGround(layout){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1536;const q=canvas.getContext('2d');q.scale(.5,.5);
 q.fillStyle='#3c503b';q.fillRect(0,0,3072,3072);
 let seed=4127;const rnd=()=>((seed=(Math.imul(seed,1664525))+1013904223)>>>0)/4294967296;
 for(let i=0;i<2100;i++){const x=rnd()*3072,y=rnd()*3072;q.fillStyle=['#6a7c5224','#a89a642c','#1a2f2834'][i%3];q.beginPath();q.ellipse(x,y,4+rnd()*30,2+rnd()*12,0,0,7);q.fill();}
 // Reichshofstraße runs along the southern edge of the memorial green.
 const street=[{x:C.x-1120,y:C.y+760},{x:C.x-560,y:C.y+700},{x:C.x+40,y:C.y+720},{x:C.x+640,y:C.y+660},{x:C.x+1120,y:C.y+700}];
 path(q,street,'#a5a28c',165);path(q,street,'#676f6b',143);path(q,street,'#767d7444',118);
 for(let i=1;i<street.length;i++){const a=street[i-1],b=street[i],len=Math.hypot(b.x-a.x,b.y-a.y);for(let d=30;d<len;d+=64){const t=d/len;q.strokeStyle='#d8d3ba99';q.lineWidth=4;q.setLineDash([26,34]);q.beginPath();q.moveTo(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t);q.lineTo(a.x+(b.x-a.x)*(t+22/len),a.y+(b.y-a.y)*(t+22/len));q.stroke();q.setLineDash([]);}}
 // Sidewalk between street and green strip; the air corridor crosses it.
 const walk=[{x:C.x-1120,y:C.y+632},{x:C.x-560,y:C.y+574},{x:C.x+40,y:C.y+592},{x:C.x+640,y:C.y+536},{x:C.x+1120,y:C.y+574}];
 path(q,walk,'#8f9482',54);
 // Bus stop "Westhofen Denkmal" at the eastern roadside (Reichshofstr. 142).
 const bx=C.x+330,by=C.y+596;q.fillStyle='#565d58';q.fillRect(bx-58,by-40,116,46);q.fillStyle='#7e837a';q.fillRect(bx-58,by-48,116,10);q.fillStyle='#33383444';q.beginPath();q.ellipse(bx,by+10,72,14,0,0,7);q.fill();q.fillStyle='#4b524d';q.fillRect(bx-50,by-24,100,10);q.fillStyle='#2c332f';q.fillRect(bx+40,by-22,8,28);
 // Lane footpaths: two street accesses and the northern green corridor.
 for(const lane of layout.paths){path(q,lane,'#192c2488',104);path(q,lane,'#aa9a7d',83);path(q,lane,'#816858',72);path(q,lane,'#b9907244',58);
  drawStoneJoints(q,lane);
 }
 // Gravel apron around the memorial leaves the objective and build pads free.
 q.fillStyle='#5f6657';q.beginPath();q.ellipse(C.x,C.y+8,300,190,0,0,7);q.fill();
 for(let y=-140;y<150;y+=34)for(let x=-250;x<250;x+=52){q.fillStyle=(x+y)%3?'#93937c':'#83856f';q.fillRect(C.x+x*.72,C.y+y*.6,48,28);q.fillStyle='#bfc0a026';q.fillRect(C.x+x*.72+3,C.y+y*.6+2,40,3);}
 // Extra low vegetation is deterministic and respects paths, pads and decorations.
 drawLowVegetation(q,layout,rnd);
 // Scenery is baked into the existing ground cache, before vegetation.
 drawScenery(q,layout);
 // Hedges with benches frame the green; both stay clear of lanes and pads.
 for(const side of [-1,1]){const hx=C.x+side*430,hy=C.y-260;q.fillStyle='#27361f';q.beginPath();q.ellipse(hx,hy,90,46,side*.3,0,7);q.fill();
  for(let j=0;j<26;j++){const px=hx+(rnd()-.5)*160,py=hy+(rnd()-.5)*76;globalThis.DenkmalForest?.drawShrub?.(q,px,py,12,j);q.fillStyle=j%5?'#5e7044':'#4c5f3a';q.beginPath();q.arc(px,py,4+rnd()*4,0,7);q.fill();}
  const px2=C.x+side*430,py2=C.y-190;q.fillStyle='#3a3f38';q.fillRect(px2-26,py2-6,52,10);q.fillStyle='#5a4b3a';q.fillRect(px2-26,py2-22,52,6);q.fillStyle='#4a4a44';q.fillRect(px2-22,py2+4,6,16);q.fillRect(px2+16,py2+4,6,16);}
 // Trees: northern green corridor and the street side, off authored lanes/pads.
 for(let i=0;i<30;i++){const north=i<20,x=north?C.x-1000+rnd()*2000:C.x-1050+rnd()*730,y=north?C.y-980+rnd()*520:C.y+430+rnd()*180,r=70+rnd()*80;const p={x,y};if(layout.paths.some(l=>globalThis.DenkmalLevels.pathDistance(p,l)<r+75)||layout.slots.some(s=>Math.hypot(x-s.x,y-s.y)<r+60))continue;
  q.fillStyle='#12231c55';q.beginPath();q.ellipse(x+25,y+55,r,r*.5,0,0,7);q.fill();globalThis.DenkmalForest?.drawCrown?.(q,x,y,r,i);}
 return canvas;
}
function drawGround(ctx,layout){requestScenery();if(!ground)ground=createGround(layout);ctx.drawImage(ground,0,0,3072,3072);}
function drawMonument(ctx,m){
 const sprite=readyMonumentSprite();
 if(sprite){
  ctx.save();
  try{
   ctx.translate(m.x,m.y);
   ctx.drawImage(sprite,-320,-230,640,320);
   // Preserve progressive monument damage feedback from the procedural fallback.
   const damage=Math.max(0,1-(m.hp??m.maxHp??1)/(m.maxHp||1));
   if(damage>.25){ctx.strokeStyle='#00000055';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-40,-96);ctx.lineTo(-30,-40);ctx.lineTo(-42,-2);ctx.stroke();}
   if(damage>.6){ctx.strokeStyle='#00000077';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(52,-92);ctx.lineTo(44,-30);ctx.stroke();ctx.beginPath();ctx.moveTo(-10,-96);ctx.lineTo(4,-52);ctx.stroke();}
  }finally{ctx.restore();}
  return;
 }
 ctx.save();ctx.translate(m.x,m.y);
 const hurt=Math.max(0,1-(m.hp??m.maxHp??1)/(m.maxHp||1));
 // Contact shadow and stepped stone pedestal.
 ctx.fillStyle='#1b211f45';ctx.beginPath();ctx.ellipse(0,10,96,24,0,0,7);ctx.fill();
 for(const [w,h,y,c] of [[150,14,6,'#6f6d60'],[118,16,-8,'#7b7867'],[88,120,-72,'#6a685c']]){ctx.fillStyle=c;ctx.fillRect(-w/2,y-h,w,h);ctx.fillStyle='#00000018';ctx.fillRect(-w/2,y-4,w,4);}
 ctx.fillStyle='#827f6f';ctx.fillRect(-74,-96,148,26);
 // Three tablet frames: the central bronze tablet was stolen on 20.07.2026
 // and the frame stands empty; the side tablets remain.
 for(const side of [-1,1]){ctx.fillStyle='#5c5a4e';ctx.fillRect(side*58-24,-92,48,64);ctx.fillStyle='#8d8168';ctx.fillRect(side*58-20,-88,40,56);}
 ctx.fillStyle='#4a483e';ctx.fillRect(-24,-92,48,64);ctx.fillStyle='#2b2a24';ctx.fillRect(-20,-88,40,56);ctx.fillStyle='#9a9077';ctx.fillRect(-24,-30,48,3);
 // Winged bronze helmet resting on top, sword right, round shield left.
 ctx.fillStyle='#5d4f35';ctx.beginPath();ctx.moveTo(-30,-104);ctx.quadraticCurveTo(0,-150,30,-104);ctx.lineTo(24,-92);ctx.lineTo(-24,-92);ctx.closePath();ctx.fill();
 ctx.fillStyle='#7a6642';ctx.beginPath();ctx.ellipse(0,-108,24,14,0,0,7);ctx.fill();
 ctx.fillStyle='#5d4f35';ctx.beginPath();ctx.moveTo(22,-124);ctx.quadraticCurveTo(52,-116,44,-88);ctx.quadraticCurveTo(34,-102,20,-108);ctx.closePath();ctx.fill();
 ctx.beginPath();ctx.moveTo(-22,-124);ctx.quadraticCurveTo(-52,-116,-44,-88);ctx.quadraticCurveTo(-34,-102,-20,-108);ctx.closePath();ctx.fill();
 ctx.strokeStyle='#8d8168';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(86,-30);ctx.lineTo(62,-118);ctx.stroke();ctx.fillStyle='#8d8168';ctx.beginPath();ctx.moveTo(58,-128);ctx.lineTo(66,-112);ctx.lineTo(72,-124);ctx.closePath();ctx.fill();
 ctx.fillStyle='#7a7458';ctx.beginPath();ctx.arc(-88,-64,26,0,7);ctx.fill();ctx.fillStyle='#5d5744';ctx.beginPath();ctx.arc(-88,-64,17,0,7);ctx.fill();
 // Both fire-bowl pedestals stand bare since the theft; brackets remain.
 for(const side of [-1,1]){ctx.fillStyle='#6f6d60';ctx.fillRect(side*252-20,32,40,56);ctx.fillStyle='#827f6f';ctx.fillRect(side*252-26,26,52,8);ctx.strokeStyle='#00000030';ctx.lineWidth=3;ctx.beginPath();ctx.arc(side*252,22,14,Math.PI,0);ctx.stroke();}
 // Moss and cracks grow with damage, like the neglected real site.
 ctx.fillStyle='#3d4a2e33';ctx.fillRect(-70,-40,50,8);ctx.fillRect(30,-70,36,6);
 if(hurt>.25){ctx.strokeStyle='#00000045';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-40,-96);ctx.lineTo(-30,-40);ctx.lineTo(-42,-2);ctx.stroke();}
 if(hurt>.6){ctx.strokeStyle='#00000060';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(52,-92);ctx.lineTo(44,-30);ctx.stroke();ctx.beginPath();ctx.moveTo(-10,-96);ctx.lineTo(4,-52);ctx.stroke();}
 ctx.restore();
}
function drawAirLane(ctx,layout,active){if(!active)return;const a=layout.airGate;ctx.save();try{ctx.setLineDash([13,20]);path(ctx,[a,C],'#7ac5d27a',3);ctx.setLineDash([]);ctx.fillStyle='#a6e7ec';ctx.font='700 16px sans-serif';ctx.textAlign='center';ctx.fillText('LUFTZULAUF',a.x,a.y-36);ctx.beginPath();ctx.moveTo(a.x-12,a.y-12);ctx.lineTo(a.x,a.y-25);ctx.lineTo(a.x+12,a.y-12);ctx.strokeStyle='#a6e7ec';ctx.lineWidth=3;ctx.stroke();}finally{ctx.restore();}}
globalThis.DenkmalWesthofenArt={drawGround,drawMonument,drawAirLane,release(){
 loadGeneration++;
 ground=null;sceneryStarted=false;
 for(const entry of scenery.values()){
  entry.image.onload=null;entry.image.onerror=null;
  entry.image.src='';
 }
 scenery.clear();
 if(monumentSprite){monumentSprite.onload=null;monumentSprite.onerror=null;monumentSprite.src='';}
 monumentSprite=null;monumentLoad='unrequested';
}};})();
