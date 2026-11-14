/* V4.1 deterministic ground overlays. Existing geometry is the only placement source.
 * Ground-space marks only: no upright sprites, navigation, image fetches or animation.
 * Two transparent atlases, one active map, 18 MiB normal / 4.5 MiB low. */
(()=>{'use strict';
const WORLD=3072,TAU=Math.PI*2;
const palettes=[null,['#8f815b36','#aaa17c55','#60704c70'],['#777c5636','#aaa38a55','#48613e70'],['#7b735436','#b3a38455','#546e4670'],['#87806936','#b6ae9155','#52664070'],['#7f806b36','#b6ad9455','#4a654970'],['#7c765736','#ada38b55','#58734470'],['#77785f36','#b0aa9055','#536c4770']];
let active=null,ground=null,details=null,size=0,failedSize=0,builds=0,planBuilds=0;
function distance(x,y,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a.x-dx*t,y-a.y-dy*t);}
function pathClear(x,y,r,paths){for(let j=0;j<paths.length;j++)for(let i=1;i<paths[j].length;i++)if(distance(x,y,paths[j][i-1],paths[j][i])<r)return false;return true;}
function padsClear(x,y,r,slots){for(let i=0;i<slots.length;i++)if(Math.hypot(x-slots[i].x,y-slots[i].y)<r)return false;return true;}
function rectClear(x,y,r,c,f){return x+r<c.x+f.left||x-r>c.x+f.right||y+r<c.y+f.top||y-r>c.y+f.bottom;}
function builtClear(x,y,r,layout,level){
 const c=layout.center;
 if(level===3&&globalThis.KirchendeArt?.groundDecorationClear?.(x,y,r+35,c)===false)return false;
 if(layout.churchFootprint&&!rectClear(x,y,r+35,c,layout.churchFootprint))return false;
 // Park frontage remains bare: road, pavement, bus stop and memorial apron.
 if(level===6&&(x+r>c.x+620||y+r>c.y+500))return false;
 if(level===7){
  if(y+r>c.y+460)return false;
  if(!rectClear(x,y,r,c,{left:-320,right:320,top:-210,bottom:220}))return false;
  for(const side of [-1,1])if(Math.hypot(x-c.x-side*430,y-c.y+230)<r+120)return false;
 }
 const t=layout.syburgTerrace;
 if(t){if(!rectClear(x,y,r+35,c,t.raised)||!rectClear(x,y,r+35,c,t.forecourt))return false;
  for(let i=0;i<t.stairs.length;i++){const s=t.stairs[i];if(x+r>c.x+s.x-s.width/2-35&&x-r<c.x+s.x+s.width/2+35&&y+r>c.y+s.top-35&&y-r<c.y+s.bottom+35)return false;}
  if(y+r>c.y+t.cliffY-30)return false;
 }
 return true;
}
function valid(level,layout){return level>=1&&level<=7&&layout&&layout.center&&Array.isArray(layout.paths)&&Array.isArray(layout.slots);}
function gatesClear(x,y,r,layout){
 return (layout.gates||[]).every(p=>Math.hypot(x-p.x,y-p.y)>r+125)
  &&(!layout.airGate||Math.hypot(x-layout.airGate.x,y-layout.airGate.y)>r+125);
}
function same(level,l){return active&&active.level===level&&active.paths===l.paths&&active.slots===l.slots&&active.church===l.churchFootprint&&active.terrace===l.syburgTerrace&&active.cx===l.center.x&&active.cy===l.center.y&&active.gates===l.gates&&active.airGate===l.airGate&&active.sceneryGuard===(level===3?globalThis.KirchendeArt?.groundDecorationClear:null);}
function getPlan(level,layout){
 if(!valid(level,layout))return null;
 if(same(level,layout))return active.plan;
 ground=details=null;size=failedSize=0;
 let seed=41007+level*7907;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const vegetation=[],edges=[],contact=[],weathering=[],c=layout.center;
 // Large irregular stains interrupt the repeating base material. Painted once
 // into the existing ground atlas; their full radius clears lanes and pads.
 for(let attempt=0;attempt<640&&weathering.length<64;attempt++){
  const p={x:170+random()*2732,y:170+random()*2732,r:48+random()*72,angle:random()*TAU,kind:attempt%3};
  if(Math.hypot(p.x-c.x,p.y-c.y)<300+p.r||!pathClear(p.x,p.y,76+p.r,layout.paths)||!padsClear(p.x,p.y,65+p.r,layout.slots)||!builtClear(p.x,p.y,p.r,layout,level)||!gatesClear(p.x,p.y,p.r,layout))continue;
  weathering.push(Object.freeze(p));
 }
 // Bounded rejection sampling; radius includes all drawn blades and leaf shadows.
 for(let attempt=0;attempt<960&&vegetation.length<240;attempt++){
  const p={x:220+random()*2632,y:220+random()*2632,r:10+random()*11,kind:attempt%3};
  if(Math.hypot(p.x-c.x,p.y-c.y)<180+p.r||!pathClear(p.x,p.y,74+p.r,layout.paths)||!padsClear(p.x,p.y,60+p.r,layout.slots)||!builtClear(p.x,p.y,p.r,layout,level)||!gatesClear(p.x,p.y,p.r,layout))continue;
  vegetation.push(Object.freeze(p));
 }
 // Broken worn shoulders follow each existing polyline. No new connecting roads.
 for(let pathIndex=0;pathIndex<layout.paths.length;pathIndex++){
  const path=layout.paths[pathIndex];
  for(let j=1;j<path.length&&edges.length<900;j++){
   const a=path[j-1],b=path[j],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(len<1)continue;
   for(let along=16;along<len&&edges.length<900;along+=30){
    for(let side=-1;side<=1&&edges.length<900;side+=2){
     const offset=68+random()*8,r=4+random()*5,x=a.x+dx/len*along-dy/len*offset*side,y=a.y+dy/len*along+dx/len*offset*side;
     if(Math.hypot(x-c.x,y-c.y)<155||!pathClear(x,y,55+r,layout.paths)||!padsClear(x,y,48+r,layout.slots)||!builtClear(x,y,r,layout,level)||!gatesClear(x,y,r,layout))continue;
     edges.push(Object.freeze({x,y,r,angle:Math.atan2(dy,dx),kind:(j+side+pathIndex+3)%3}));
    }
   }
  }
 }
 // Contact follows the objective's unchanged bottom anchor, rather than a second monument.
 for(let i=0;i<24;i++){const a=i*TAU/24;contact.push(Object.freeze({x:c.x+Math.cos(a)*65,y:c.y+Math.sin(a)*43+10,r:10,angle:a,kind:0}));}
 function foundation(f){
  for(let x=f.left+14;x<f.right;x+=30){
   const wx=c.x+x,wy=c.y+f.bottom+10;
   const stairs=layout.syburgTerrace?.stairs;
   const stairClear=!stairs||stairs.every(s=>Math.abs(wx-c.x-s.x)>s.width/2+20||wy<c.y+s.top-20||wy>c.y+s.bottom+20);
   if(stairClear&&pathClear(wx,wy,58,layout.paths)&&padsClear(wx,wy,50,layout.slots))contact.push(Object.freeze({x:wx,y:wy,r:10,angle:0,kind:1}));
  }
 }
 if(layout.churchFootprint)foundation(layout.churchFootprint);
 if(layout.syburgTerrace){foundation(layout.syburgTerrace.raised);foundation(layout.syburgTerrace.forecourt);}
 const plan=Object.freeze({level,weathering:Object.freeze(weathering),vegetation:Object.freeze(vegetation),edges:Object.freeze(edges),contact:Object.freeze(contact)});
 active={level,paths:layout.paths,slots:layout.slots,church:layout.churchFootprint,terrace:layout.syburgTerrace,cx:c.x,cy:c.y,gates:layout.gates,airGate:layout.airGate,sceneryGuard:level===3?globalThis.KirchendeArt?.groundDecorationClear:null,plan};planBuilds++;return plan;
}
function oval(g,x,y,rx,ry,angle,color){g.fillStyle=color;g.beginPath();g.ellipse(x,y,rx,ry,angle,0,TAU);g.fill();}
function raster(level,layout,low){
 const plan=getPlan(level,layout);if(!plan)return false;
 const wanted=low?768:1536;if(ground&&details&&size===wanted)return true;if(failedSize===wanted)return false;
 ground=details=null;size=0;
 if(typeof document==='undefined'||typeof document.createElement!=='function'){failedSize=wanted;return false;}
 try{
  const a=document.createElement('canvas'),b=document.createElement('canvas');a.width=a.height=b.width=b.height=wanted;
  const g=a.getContext('2d'),d=b.getContext('2d');if(!g||!d){failedSize=wanted;return false;}
  g.scale(wanted/WORLD,wanted/WORLD);d.scale(wanted/WORLD,wanted/WORLD);
  const palette=palettes[level];
  const stains=level===5?['#b1a27b18','#172b2424','#6c765426']:['#9f93631a','#172b2424','#60754928'];
  for(const p of plan.weathering){
   // Nested translucent lobes soften the edge without gradients or extra atlases.
   for(let ring=3;ring>=1;ring--){
    const k=ring/3;oval(g,p.x,p.y,p.r*k,p.r*.52*k,p.angle,stains[p.kind]);
   }
   oval(g,p.x-p.r*.24,p.y+p.r*.12,p.r*.48,p.r*.25,p.angle,palette[0]);
  }
  for(let i=0;i<plan.edges.length;i++){
   const p=plan.edges[i];oval(g,p.x,p.y,p.r*1.8,p.r*.65,p.angle,palette[0]);
   if(i%2===0)oval(g,p.x,p.y,p.r*.7,p.r*.22,p.angle,palette[1]);
  }
  for(let i=0;i<plan.contact.length;i++){
   const p=plan.contact[i];oval(g,p.x+2,p.y+3,p.r*1.6,p.r*.48,p.angle,'#14241c30');
   oval(g,p.x,p.y,p.r,p.r*.22,p.angle,p.kind?'#b5ae8740':'#8b927132');
  }
  const stride=low?2:1;
  for(let i=0;i<plan.vegetation.length;i+=stride){
   const p=plan.vegetation[i],r=p.r;
   oval(g,p.x,p.y,r,r*.55,0,palette[0]);
   oval(d,p.x+2,p.y+3,r*.66,r*.23,0,'#18271e32');
   if(p.kind===1){
    oval(d,p.x,p.y,r*.58,r*.28,-.25,'#8b8d725e');oval(d,p.x-2,p.y-2,r*.35,r*.09,-.25,'#c4ba9255');
   }else if(p.kind===2){
    // Low fern silhouette, distinct from the rounded moss clusters.
    for(let stem=0;stem<3;stem++){
     const angle=-1.9+stem*.55,dx=Math.cos(angle),dy=Math.sin(angle);
     for(let leaf=1;leaf<=3;leaf++)for(const side of [-1,1]){
      const t=leaf*r*.16;oval(d,p.x+dx*t-dy*side*r*.12,p.y+dy*t+dx*side*r*.12,r*.2,r*.07,angle+side*.6,palette[2]);
     }
    }
   }else{
    // All leaves stay within the tested radius; low ground dressing does not need upright().
    for(let leaf=0;leaf<3;leaf++){
     const angle=leaf*2.1+i;oval(d,p.x+Math.cos(angle)*r*.3,p.y+Math.sin(angle)*r*.18,r*.4,r*.16,angle,palette[2]);
    }
    if(!low){d.strokeStyle='#b0b27d60';d.lineWidth=1.5;d.beginPath();d.moveTo(p.x-4,p.y+2);d.lineTo(p.x-6,p.y-r*.6);d.moveTo(p.x+2,p.y+2);d.lineTo(p.x+5,p.y-r*.45);d.stroke();}
   }
  }
  ground=a;details=b;size=wanted;failedSize=0;builds++;return true;
 }catch{failedSize=wanted;return false;}
}
function composite(ctx,canvas,camera,w,h){
 const cx=camera?camera.x:0,cy=camera?camera.y:0;
 const x=Math.max(0,cx),y=Math.max(0,cy),right=Math.min(WORLD,cx+w),bottom=Math.min(WORLD,cy+h);
 if(right<=x||bottom<=y)return;
 const s=size/WORLD;ctx.drawImage(canvas,x*s,y*s,(right-x)*s,(bottom-y)*s,x,y,right-x,bottom-y);
}
function drawGround(ctx,level,layout,camera,w=3072,h=3072,options){if(!raster(level,layout,!!options?.low))return false;composite(ctx,ground,camera,w,h);return true;}
function drawDetails(ctx,level,layout,camera,w=3072,h=3072,options){if(!raster(level,layout,!!options?.low))return false;composite(ctx,details,camera,w,h);return true;}
globalThis.DenkmalMapPolish={getPlan,drawGround,drawDetails,reset(){active=ground=details=null;size=failedSize=0;},stats(){return {activeLevel:active?.level||0,builds,planBuilds,size,retainedCanvases:(ground?1:0)+(details?1:0),bytes:size*size*4*2};}};
})();
