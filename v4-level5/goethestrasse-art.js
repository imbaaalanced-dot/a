/* Reference-derived park composition. Cached ground, independent upright memorial. */
(()=>{'use strict';
let ground=null,memorial=null;
const C={x:1536,y:1536};
function path(ctx,points,color,width){ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();}
function createGround(layout){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1536;const q=canvas.getContext('2d');q.scale(.5,.5);
 q.fillStyle='#354935';q.fillRect(0,0,3072,3072);
 let seed=18631;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 for(let i=0;i<2300;i++){const x=rnd()*3072,y=rnd()*3072;q.fillStyle=['#69795424','#b09b6330','#1c322b32'][i%3];q.beginPath();q.ellipse(x,y,4+rnd()*30,2+rnd()*12,0,0,7);q.fill();}
 // Street along the park's east and front edges. Flight does not receive a ground road.
 const street=[{x:C.x+730,y:C.y-900},{x:C.x+730,y:C.y+120},{x:C.x+800,y:C.y+540},{x:C.x+1120,y:C.y+780}];
 const front=[{x:C.x-1120,y:C.y+820},{x:C.x-530,y:C.y+600},{x:C.x+20,y:C.y+720},{x:C.x+800,y:C.y+540}];
 for(const road of [street,front]){path(q,road,'#a5a28c',155);path(q,road,'#676f6b',133);path(q,road,'#767d7444',110);}
 for(const lane of layout.paths){path(q,lane,'#192c2488',104);path(q,lane,'#aa9a7d',83);path(q,lane,'#816858',72);path(q,lane,'#b9907244',58);
  for(let i=1;i<lane.length;i++){const a=lane[i-1],b=lane[i],len=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/len,ny=(b.x-a.x)/len;for(let d=12;d<len;d+=22){const x=a.x+(b.x-a.x)*d/len,y=a.y+(b.y-a.y)*d/len;q.strokeStyle='#483f3966';q.lineWidth=2;q.beginPath();q.moveTo(x+nx*34,y+ny*34);q.lineTo(x-nx*34,y-ny*34);q.stroke();}}
 }
 // Flagstone forecourt and rose borders leave the endpoint and build pads free.
 q.fillStyle='#5d6555';q.fillRect(C.x-240,C.y-115,480,225);
 for(let y=-105;y<105;y+=38)for(let x=-230;x<230;x+=57){q.fillStyle=(x+y)%3?'#96967e':'#858775';q.fillRect(C.x+x,C.y+y,53,34);q.fillStyle='#bfc0a030';q.fillRect(C.x+x+3,C.y+y+2,45,3);}
 for(const side of [-1,1]){const x=C.x+side*340,y=C.y-145;q.fillStyle='#293729';q.beginPath();q.ellipse(x,y,65,110,side*.45,0,7);q.fill();
 for(let j=0;j<22;j++){const px=x+(rnd()-.5)*100,py=y+(rnd()-.5)*170;globalThis.DenkmalForest?.drawShrub(q,px,py,13,j);q.fillStyle=j%4?'#e4dfb9':'#d2ae92';q.beginPath();q.arc(px,py,3+rnd()*2,0,7);q.fill();}}
 // Rear woodland anchors the memorial; edge trees stay clear of authored lanes and pads.
 for(let i=0;i<28;i++){const x=C.x-1000+rnd()*2000,y=C.y-400-rnd()*650,r=70+rnd()*85;const p={x,y};if(layout.paths.some(l=>globalThis.DenkmalLevels.pathDistance(p,l)<r+75)||layout.slots.some(s=>Math.hypot(x-s.x,y-s.y)<r+60))continue;
 q.fillStyle='#12231c55';q.beginPath();q.ellipse(x+25,y+55,r,r*.5,0,0,7);q.fill();globalThis.DenkmalForest?.drawCrown(q,x,y,r,i);}
 return canvas;
}
function drawGround(ctx,layout){if(!ground)ground=createGround(layout);ctx.drawImage(ground,0,0,3072,3072);}
function image(){if(typeof Image==='undefined')return null;if(!memorial){memorial=new Image();memorial.decoding='async';memorial.src='assets/elemental/goethestrasse-memorial-v1.webp?v=goethe1';}return memorial.complete&&memorial.naturalWidth>0?memorial:null;}
function drawMonument(ctx,m){
 const img=image();ctx.save();try{ctx.fillStyle='#0b211e55';ctx.beginPath();ctx.ellipse(m.x+12,m.y+26,160,30,0,0,7);ctx.fill();
 if(img){ctx.drawImage(img,m.x-230,m.y-410,460,460);return;}
 ctx.translate(m.x,m.y);ctx.fillStyle='#666d60';ctx.fillRect(-170,-115,340,125);ctx.beginPath();ctx.moveTo(-90,-115);ctx.lineTo(0,-210);ctx.lineTo(90,-115);ctx.fill();
 for(const x of [-165,135]){ctx.fillStyle='#929580';ctx.fillRect(x,-250,30,260);ctx.fillStyle='#364b42';ctx.fillRect(x+7,-195,16,135);ctx.fillStyle='#a0a18b';ctx.fillRect(x-7,-263,44,13);ctx.fillRect(x+10,-292,10,29);ctx.fillRect(x,-284,30,9);}
 ctx.fillStyle='#797e6c';ctx.fillRect(-60,-38,120,55);ctx.fillStyle='#979b86';ctx.fillRect(-72,10,144,16);ctx.beginPath();ctx.ellipse(0,-92,24,51,-.2,0,7);ctx.fill();ctx.beginPath();ctx.arc(0,-155,19,0,7);ctx.fill();
 }finally{ctx.restore();}
}
function drawAirLane(ctx,layout,active){if(!active)return;const a=layout.airGate;ctx.save();try{ctx.setLineDash([13,20]);path(ctx,[a,C],'#7ac5d27a',3);ctx.setLineDash([]);ctx.fillStyle='#a6e7ec';ctx.font='700 16px sans-serif';ctx.textAlign='center';ctx.fillText('LUFTZULAUF',a.x,a.y-36);ctx.beginPath();ctx.moveTo(a.x-12,a.y-12);ctx.lineTo(a.x,a.y-25);ctx.lineTo(a.x+12,a.y-12);ctx.strokeStyle='#a6e7ec';ctx.lineWidth=3;ctx.stroke();}finally{ctx.restore();}}
globalThis.DenkmalGoetheArt={drawGround,drawMonument,drawAirLane};})();
