/* TD2 traffic prototype (P1 #330 section 2): optional, decorative cars that
 * drive only on the authored streets of levels 3/6/7. Opt-in via
 * ?td2Traffic=1, off under lowFX or prefers-reduced-motion. Cars are pure
 * canvas drawing on the road polylines exported by the level art modules;
 * they are not entities and never touch paths, slots, gates or collisions. */
(()=>{'use strict';
const enabled=/(?:^|[?&])td2Traffic=1(?:&|$)/.test(globalThis.location?.search||'');
const reduced=typeof globalThis.matchMedia==='function'&&!!globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
const MAX_CARS_PER_ROUTE=3,CAR_LENGTH=46,CAR_WIDTH=20;
const PALETTE=['#4c5560','#5e4f43','#39443d','#6b5a4a','#50565e','#705f43'];
const prepCache=new Map();
const scratch={x:0,y:0,angle:0};
function rndFactory(seed){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function routesFor(level,layout){
 if(level===3&&layout?.street&&layout?.center){
  const st=layout.street,c=layout.center;
  return [{points:[{x:c.x+st.left,y:c.y+st.y},{x:c.x+st.right,y:c.y+st.y}],halfWidth:st.width/2}];
 }
 if(level===6)return globalThis.DenkmalGoetheArt?.streetRoutes?.()||[];
 if(level===7)return globalThis.DenkmalWesthofenArt?.streetRoutes?.()||[];
 return [];
}
function prepare(route){
 let p=prepCache.get(route);
 if(p)return p;
 const pts=route.points,segs=[],lengths=[];let total=0;
 for(let i=1;i<pts.length;i++){
  const dx=pts[i].x-pts[i-1].x,dy=pts[i].y-pts[i-1].y,len=Math.hypot(dx,dy);
  segs.push({x:pts[i-1].x,y:pts[i-1].y,dx,dy,len,angle:Math.atan2(dy,dx)});lengths.push(len);total+=len;
 }
 p={segs,total};prepCache.set(route,p);return p;
}
function pointAt(route,d,lane){
 const p=prepare(route);
 d=((d%p.total)+p.total)%p.total;
 for(const seg of p.segs){
  if(d<=seg.len||seg===p.segs[p.segs.length-1]){
   const t=seg.len?d/seg.len:0;
   const nx=-seg.dy/seg.len,ny=seg.dx/seg.len;
   scratch.x=seg.x+seg.dx*t+nx*lane;scratch.y=seg.y+seg.dy*t+ny*lane;scratch.angle=seg.angle;
   return scratch;
  }
  d-=seg.len;
 }
 return scratch;
}
function drawCar(ctx,x,y,angle,colorIndex,dir,evening){
 ctx.save();ctx.translate(x,y);ctx.rotate(angle);
 ctx.fillStyle='#0b14124d';ctx.beginPath();ctx.ellipse(3,4,CAR_LENGTH/2+3,CAR_WIDTH/2+3,0,0,7);ctx.fill();
 ctx.fillStyle=PALETTE[colorIndex%PALETTE.length];
 ctx.beginPath();ctx.roundRect(-CAR_LENGTH/2,-CAR_WIDTH/2,CAR_LENGTH,CAR_WIDTH,5);ctx.fill();
 ctx.fillStyle='#20262b';ctx.beginPath();ctx.roundRect(-CAR_LENGTH/2+7,-CAR_WIDTH/2+3,CAR_LENGTH-14,CAR_WIDTH-6,3);ctx.fill();
 ctx.fillStyle='#10151a';
 for(const wx of [-CAR_LENGTH/2+6,CAR_LENGTH/2-12])for(const wy of [-CAR_WIDTH/2+1,CAR_WIDTH/2-4])ctx.fillRect(wx,wy,6,3);
 if(evening){
  ctx.fillStyle='#ffd98a55';ctx.beginPath();ctx.arc(dir*CAR_LENGTH/2,-CAR_WIDTH/2+3,2.2,0,7);ctx.arc(dir*CAR_LENGTH/2,CAR_WIDTH/2-3,2.2,0,7);ctx.fill();
  ctx.fillStyle='#ffe9b022';ctx.beginPath();ctx.arc(dir*CAR_LENGTH/2,0,9,0,7);ctx.fill();
 }
 ctx.restore();
}
function draw(ctx,level,layout,time=0,{low=false}={}){
 if(!enabled||reduced||low)return false;
 const routes=routesFor(level,layout);
 if(!routes.length)return false;
 const evening=level===6||level===7;
 let drew=false;
 ctx.save();
 try{
  for(let r=0;r<routes.length;r++){
   const route=routes[r];
   if(!route?.points||route.points.length<2)continue;
   const rnd=rndFactory(0x71af+r*7919+level*104729);
   for(let i=0;i<MAX_CARS_PER_ROUTE;i++){
    const dir=i%2===0?1:-1;
    const speed=34+rnd()*30;
    const lane=dir*(route.halfWidth*.42);
    const phase=rnd()*prepare(route).total;
    const colorIndex=Math.floor(rnd()*PALETTE.length);
    const p=pointAt(route,phase+dir*speed*time,lane);
    drawCar(ctx,p.x,p.y,p.angle,colorIndex,dir,evening);
    drew=true;
   }
  }
 }finally{ctx.restore();}
 return drew;
}
globalThis.TD2Traffic={draw,routesFor,enabled,reduced,MAX_CARS_PER_ROUTE};
})();
