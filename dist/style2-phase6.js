/* Style 2 Phase 6: oblique ground projection and deterministic ground dressing.
   All coordinates remain in the original simulation. No collisions are added. */
(()=>{
'use strict';
const depth=.82;
const project=(p,c,z)=>({x:(p.x-c.x)*z,y:(p.y-c.y)*z*depth});
const unproject=(p,c,z)=>({x:p.x/z+c.x,y:p.y/(z*depth)+c.y});
let active=0,cache=null;
function details(level,layout){
 let seed=62917+level*7919;
 const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const result=[];
 for(let i=0;i<650;i++){
  const p={x:360+random()*2352,y:360+random()*2352,r:3+random()*9,kind:i%4};
  if(Math.hypot(p.x-layout.center.x,p.y-layout.center.y)<220)continue;
  if(layout.paths.some(path=>globalThis.DenkmalLevels.pathDistance(p,path)<115))continue;
  if(layout.slots.some(s=>Math.hypot(s.x-p.x,s.y-p.y)<88))continue;
  const f=layout.churchFootprint;
  if(f&&p.x>layout.center.x+f.left-80&&p.x<layout.center.x+f.right+80&&p.y>layout.center.y+f.top-80&&p.y<layout.center.y+f.bottom+80)continue;
  result.push(p);
 }
 return result;
}
function draw(ctx,level,layout){
 if(!cache||active!==level){
  cache=document.createElement('canvas');cache.width=cache.height=1536;active=level;
  const g=cache.getContext('2d');g.scale(.5,.5);
  for(const p of details(level,layout)){
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
   if(p.kind===1&&p.r>9){
    // Short, ankle-height remnants; clear of every path and build pad.
    g.fillStyle='#3a3c35';g.fillRect(p.x-14,p.y,28,7);
    g.fillStyle='#85816c';g.fillRect(p.x-14,p.y-5,28,6);
    g.strokeStyle='#c6b89588';g.beginPath();g.moveTo(p.x-14,p.y-5);g.lineTo(p.x+14,p.y-5);g.stroke();
    g.fillStyle='#4b593999';g.fillRect(p.x-11,p.y-3,10,3);
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
 ctx.drawImage(cache,0,0,1536,1536,0,0,3072,3072);
}
globalThis.Style2Phase6={depth,project,unproject,details,draw};
})();
