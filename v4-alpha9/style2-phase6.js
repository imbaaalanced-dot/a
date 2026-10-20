/* Style 2 Phase 6: oblique ground projection and deterministic ground dressing.
   All coordinates remain in the original simulation. No collisions are added. */
(()=>{
'use strict';
const depth=.82;
const project=(p,c,z)=>({x:(p.x-c.x)*z,y:(p.y-c.y)*z*depth});
const unproject=(p,c,z)=>({x:p.x/z+c.x,y:p.y/(z*depth)+c.y});
function upright(ctx,point,paint){
 ctx.save();
 try{ctx.translate(point.x,point.y);ctx.scale(1,1/depth);ctx.translate(-point.x,-point.y);return paint();}
 finally{ctx.restore();}
}
let active=0,cache=null;
let environment=null,environmentReady=false;
let standaloneImage=null;
function refreshEnvironment(){
 if(typeof Image!=='function')return;
 let image;
 if(globalThis.DenkmalAssets)image=globalThis.DenkmalAssets.get('assets/scenery-alpha8.webp?v=alpha8a2');
 else{
  if(!standaloneImage){
   standaloneImage=new Image();standaloneImage.decoding='async';
   standaloneImage.src='assets/scenery-alpha8.webp?v=alpha8a2';
  }
  image=standaloneImage;
 }
 if(image.complete&&image.naturalWidth>0&&image!==environment){
  environment=image;environmentReady=true;cache=null;
 }
}
function details(level,layout){
 let seed=62917+level*7919;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const result=[];
 for(let i=0;i<380;i++){
  const p={x:360+random()*2352,y:360+random()*2352,r:3+random()*9,kind:i%4};
  if(Math.hypot(p.x-layout.center.x,p.y-layout.center.y)<220)continue;
  if(layout.paths.some(path=>globalThis.DenkmalLevels.pathDistance(p,path)<115))continue;
  if(layout.slots.some(s=>Math.hypot(s.x-p.x,s.y-p.y)<88))continue;
  const terrace=layout.syburgTerrace;
  if(terrace&&[terrace.raised,terrace.forecourt].some(f=>p.x>layout.center.x+f.left-55&&p.x<layout.center.x+f.right+55&&p.y>layout.center.y+f.top-55&&p.y<layout.center.y+f.bottom+55))continue;
  const f=layout.churchFootprint;
  if(f&&p.x>layout.center.x+f.left-80&&p.x<layout.center.x+f.right+80&&p.y>layout.center.y+f.top-80&&p.y<layout.center.y+f.bottom+80)continue;
  result.push(p);
 }
 return result;
}
function draw(ctx,level,layout,camera={x:0,y:0},viewWidth=3072,viewHeight=3072){
 refreshEnvironment();
 if(!cache||active!==level){
  cache=document.createElement('canvas');cache.width=cache.height=1536;active=level;
  const g=cache.getContext('2d');g.scale(.5,.5);
  for(const p of details(level,layout)){
   // Broad moss/soil transitions anchor the smaller details into the terrain.
   const moss=g.createRadialGradient(p.x,p.y,1,p.x,p.y,p.r*5);
   moss.addColorStop(0,p.kind===1?'#8b795329':'#6f805b35');moss.addColorStop(1,'#40523900');
   g.fillStyle=moss;g.fillRect(p.x-p.r*5,p.y-p.r*5,p.r*10,p.r*10);
   // Ground-level leaf clumps, weathered stones and shallow masonry fragments.
   g.fillStyle='#07141055';g.beginPath();g.ellipse(p.x+7,p.y+6,p.r*1.8,p.r*.65,0,0,7);g.fill();
   g.fillStyle=['#636c4666','#a4967d99','#394c35aa','#777b6666'][p.kind];
   g.beginPath();g.ellipse(p.x,p.y,p.r*1.5,p.r*.6,-.3,0,7);g.fill();
   g.strokeStyle=p.kind===1?'#c5b99588':'#b9b46b44';g.lineWidth=2;
   g.beginPath();g.moveTo(p.x-p.r,p.y-2);g.lineTo(p.x+p.r,p.y-4);g.stroke();
   if(p.kind===2){
    // Low vegetation: leaves with a consistent upper-left light source.
    for(let leaf=0;leaf<5;leaf++){
     const a=leaf*1.256;g.fillStyle=leaf%2?'#76825488':'#3d5939aa';
     g.beginPath();g.ellipse(p.x+Math.cos(a)*p.r,p.y+Math.sin(a)*p.r*.5,p.r*.7,p.r*.35,a,0,7);g.fill();
    }
   }
   if(p.kind===0){
    // Flattened leaf clusters, rather than isolated high-contrast dots.
    for(let leaf=0;leaf<4;leaf++){
     const x=p.x+(leaf-1.5)*p.r*.7,y=p.y+(leaf%2)*p.r*.4;
     g.fillStyle=['#91744e88','#a18b6180','#68774688','#7b684777'][leaf];
     g.beginPath();g.ellipse(x,y,p.r*.65,p.r*.26,-.5+leaf*.3,0,7);g.fill();
    }
   }
   if(p.kind===2){
    // Short grass blades remain within the existing clear-of-path footprint.
    g.lineWidth=1.5;g.strokeStyle='#a3ad7488';g.beginPath();
    for(let blade=0;blade<5;blade++){
     const x=p.x+(blade-2)*p.r*.38;
     g.moveTo(x,p.y+2);g.quadraticCurveTo(x-3,p.y-p.r*.65,x+(blade-2)*1.7,p.y-p.r*(.7+(blade%3)*.22));
    }g.stroke();
   }
   if(p.kind===1&&p.r>9){
    // Short, ankle-height remnants; clear of every path and build pad.
    g.fillStyle='#3a3c35';g.fillRect(p.x-14,p.y,28,7);
    g.fillStyle='#85816c';g.fillRect(p.x-14,p.y-5,28,6);
    g.strokeStyle='#c6b89588';g.beginPath();g.moveTo(p.x-14,p.y-5);g.lineTo(p.x+14,p.y-5);g.stroke();
    g.fillStyle='#4b593999';g.fillRect(p.x-11,p.y-3,10,3);
   }
  }
  if(environmentReady){
   const sw=environment.naturalWidth/3,sh=environment.naturalHeight/2;
   for(const [index,p] of details(level,layout).entries()){
    if(index%3!==0)continue;
    const cell=Math.floor(index/3)%6,size=42+p.r*3;
    g.drawImage(environment,(cell%3)*sw,Math.floor(cell/3)*sh,sw,sh,p.x-size/2,p.y-size*.94,size,size);
   }
  }
  for(const gate of layout.gates){
   const dx=layout.center.x-gate.x,dy=layout.center.y-gate.y,len=Math.hypot(dx,dy)||1;
   for(const side of [-1,1]){
    const x=gate.x-dy/len*86*side,y=gate.y+dx/len*86*side;
    const light=g.createRadialGradient(x,y,1,x,y,96);
    light.addColorStop(0,'#ffca6b26');light.addColorStop(1,'#f2a44000');
    g.fillStyle=light;g.fillRect(x-96,y-96,192,192);
   }
  }
  if(level===4){
   const c=layout.center,f=layout.churchFootprint;
   const wallShade=g.createLinearGradient(0,c.y+f.bottom,0,c.y+f.bottom+70);
   wallShade.addColorStop(0,'#10191577');wallShade.addColorStop(1,'#10191500');
   g.fillStyle=wallShade;g.fillRect(c.x+f.left,c.y+f.bottom,f.right-f.left,70);
  }
  // Soft soil/contact shading ties each memorial to its existing anchor.
  const c=layout.center;
  const halo=g.createRadialGradient(c.x,c.y,32,c.x,c.y,145);
  halo.addColorStop(0,'#0b141c66');halo.addColorStop(.55,'#4d493c33');halo.addColorStop(1,'#34372a00');
  g.fillStyle=halo;g.fillRect(c.x-145,c.y-145,290,290);
 }
 const x=Math.max(0,camera.x),y=Math.max(0,camera.y);
 const right=Math.min(3072,camera.x+viewWidth),bottom=Math.min(3072,camera.y+viewHeight);
 if(right>x&&bottom>y)ctx.drawImage(cache,x*.5,y*.5,(right-x)*.5,(bottom-y)*.5,x,y,right-x,bottom-y);
}
globalThis.Style2Phase6={depth,project,unproject,upright,details,draw,
 reset(){cache=null;active=0;environment=null;environmentReady=false;standaloneImage=null;}};
})();
