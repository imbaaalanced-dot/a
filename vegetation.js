/* TD2 vegetation/ground pass (P1 #330 section 2): optional procedural meadow,
 * grass and verge detail for levels 3/6/7. Opt-in via ?td2Vegetation=1, off
 * under lowFX. Pure canvas drawing beneath actors: placement is seeded per
 * level, cached, bounded, and keeps clear of paths, tower slots, gates, the
 * monument and the street surface. It never mutates the layout. */
(()=>{'use strict';
const enabled=/(?:^|[?&])td2Vegetation=1(?:&|$)/.test(globalThis.location?.search||'');
const WORLD=3072,STEP=86,MAX_PATCHES=70,MAX_TUFTS=260,MAX_FLOWERS=140,MAX_VERGE=180;
const CLEAR={path:54,slot:50,gate:96,center:175,street:10};
const PALETTES={
 3:{patch:['#5d6b3a','#6f7442','#4f5f36'],grass:'#3f5a2c',tip:'#7d8f4a',flower:['#e9e3c8','#e6c95a'],soil:'#4a3d2c'},
 6:{patch:['#3e5040','#46553f','#384737'],grass:'#2f4532',tip:'#5f7656',flower:['#c9d3e0','#b9a7cf'],soil:'#3a3229'},
 7:{patch:['#55613a','#636a3e','#4a5734'],grass:'#3a5130',tip:'#76864a',flower:['#ece5cc','#d9b85a'],soil:'#463a2b'}
};
const cache=new Map();
function rndFactory(seed){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function segDist(px,py,a,b){
 const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy;
 const t=l?Math.max(0,Math.min(1,((px-a.x)*dx+(py-a.y)*dy)/l)):0;
 return Math.hypot(px-(a.x+dx*t),py-(a.y+dy*t));
}
function polyDist(px,py,pts){let d=Infinity;for(let i=1;i<pts.length;i++)d=Math.min(d,segDist(px,py,pts[i-1],pts[i]));return d;}
function streetsFor(level,layout){
 if(level===3&&layout?.street&&layout?.center){
  const st=layout.street,c=layout.center;
  return [{points:[{x:c.x+st.left,y:c.y+st.y},{x:c.x+st.right,y:c.y+st.y}],halfWidth:st.width/2}];
 }
 if(level===6)return globalThis.DenkmalGoetheArt?.streetRoutes?.()||[];
 if(level===7)return globalThis.DenkmalWesthofenArt?.streetRoutes?.()||[];
 return [];
}
function blocked(x,y,layout,streets,pad=0){
 if(x<20||y<20||x>WORLD-20||y>WORLD-20)return true;
 const c=layout.center;
 if(c&&Math.hypot(x-c.x,y-c.y)<CLEAR.center+pad)return true;
 for(const g of layout.gates||[])if(Math.hypot(x-g.x,y-g.y)<CLEAR.gate+pad)return true;
 for(const s of layout.slots||[])if(Math.hypot(x-s.x,y-s.y)<CLEAR.slot+pad)return true;
 for(const p of layout.paths||[])if(p?.length>1&&polyDist(x,y,p)<CLEAR.path+pad)return true;
 for(const st of streets)if(st?.points?.length>1&&polyDist(x,y,st.points)<st.halfWidth+CLEAR.street+pad)return true;
 return false;
}
function thin(list,max,rnd){
 // Deterministic even thinning: keep every k-th candidate with a seeded offset.
 if(list.length<=max)return list;
 const step=list.length/max,off=rnd()*step,kept=[];
 for(let i=0;i<max;i++)kept.push(list[Math.min(list.length-1,Math.floor(off+i*step))]);
 list.length=0;list.push(...kept);return list;
}
function build(level,layout){
 const streets=streetsFor(level,layout);
 const rnd=rndFactory(0x5e6e7a+level*104729);
 const patches=[],tufts=[],flowers=[],verge=[];
 // Meadow field: jittered grid with negative space. Candidates are collected
 // over the whole map first, then thinned evenly so caps never favour one edge.
 for(let gy=0;gy*STEP<WORLD;gy++)for(let gx=0;gx*STEP<WORLD;gx++){
  const r=rnd(),x=(gx+.15+rnd()*.7)*STEP,y=(gy+.15+rnd()*.7)*STEP;
  if(r<.38)continue;
  if(r>.9){const rx=26+rnd()*34,ry=12+rnd()*16,c=Math.floor(rnd()*3);if(!blocked(x,y,layout,streets,rx))patches.push({x,y,rx,ry,c});continue;}
  if(r>.74){const c=rnd()<.7?0:1,n=3+Math.floor(rnd()*4),sd=rnd()*1000;if(!blocked(x,y,layout,streets))flowers.push({x,y,c,n,s:sd});continue;}
  const h=7+rnd()*7,b=3+Math.floor(rnd()*3);
  if(!blocked(x,y,layout,streets))tufts.push({x,y,h,b});
 }
 thin(patches,MAX_PATCHES,rnd);thin(flowers,MAX_FLOWERS,rnd);thin(tufts,MAX_TUFTS,rnd);
 // Verge transition: tufts and soil crumbs hugging both kerbs of each street.
 for(const st of streets){
  const pts=st?.points;if(!pts||pts.length<2)continue;
  for(let i=1;i<pts.length&&verge.length<MAX_VERGE;i++){
   const a=pts[i-1],b=pts[i],dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy);if(!len)continue;
   const nx=-dy/len,ny=dx/len;
   for(let d=18;d<len&&verge.length<MAX_VERGE;d+=26+rnd()*20){
    const side=rnd()<.5?-1:1,off=st.halfWidth+CLEAR.street+4+rnd()*16;
    const x=a.x+dx*d/len+nx*off*side,y=a.y+dy*d/len+ny*off*side;
    if(blocked(x,y,layout,streets))continue;
    verge.push({x,y,h:5+rnd()*6,b:2+Math.floor(rnd()*3),soil:rnd()<.45});
   }
  }
 }
 return {patches,tufts,flowers,verge,streets};
}
function sceneFor(level,layout){
 let s=cache.get(level);
 if(s&&s.layout===layout)return s.scene;
 const scene=build(level,layout);cache.set(level,{layout,scene});return scene;
}
function blades(ctx,t){for(let k=0;k<t.b;k++){const o=(k-(t.b-1)/2)*2.4,lean=o*.55;ctx.moveTo(t.x+o-1.1,t.y);ctx.lineTo(t.x+o+lean,t.y-t.h*(.75+.25*((k+1)%2)));ctx.lineTo(t.x+o+1.1,t.y);}}
function draw(ctx,level,layout,{low=false}={}){
 if(!enabled||low||!PALETTES[level]||!layout?.center)return false;
 const pal=PALETTES[level],sc=sceneFor(level,layout);
 if(!sc.patches.length&&!sc.tufts.length&&!sc.verge.length)return false;
 ctx.save();
 try{
  // Soft meadow tint patches: one fill per colour keeps draw calls tiny.
  ctx.globalAlpha=.16;
  for(let c=0;c<3;c++){ctx.fillStyle=pal.patch[c];ctx.beginPath();for(const p of sc.patches)if(p.c===c){ctx.moveTo(p.x+p.rx,p.y);ctx.ellipse(p.x,p.y,p.rx,p.ry,0,0,6.283185307179586);}ctx.fill();}
  ctx.globalAlpha=.32;ctx.fillStyle=pal.soil;ctx.beginPath();
  for(const v of sc.verge)if(v.soil){ctx.moveTo(v.x+6,v.y+1);ctx.ellipse(v.x,v.y+1,6,2.4,0,0,6.283185307179586);}
  ctx.fill();
  ctx.globalAlpha=.55;ctx.fillStyle=pal.grass;ctx.beginPath();
  for(const t of sc.tufts)blades(ctx,t);for(const v of sc.verge)blades(ctx,v);
  ctx.fill();
  ctx.globalAlpha=.35;ctx.fillStyle=pal.tip;ctx.beginPath();
  for(const t of sc.tufts)if(t.h>10)blades(ctx,{x:t.x+1,y:t.y-1,h:t.h*.7,b:Math.max(2,t.b-1)});
  ctx.fill();
  ctx.globalAlpha=.6;
  for(let c=0;c<2;c++){ctx.fillStyle=pal.flower[c];ctx.beginPath();for(const f of sc.flowers)if(f.c===c)for(let k=0;k<f.n;k++){const a=f.s+k*2.4,r=3+((k*37)%9);const x=f.x+Math.cos(a)*r,y=f.y+Math.sin(a)*r*.55;ctx.moveTo(x+1.3,y);ctx.arc(x,y,1.3,0,6.283185307179586);}ctx.fill();}
 }finally{ctx.restore();}
 return true;
}
function stats(level,layout){const s=sceneFor(level,layout);return {patches:s.patches.length,tufts:s.tufts.length,flowers:s.flowers.length,verge:s.verge.length};}
function items(level,layout){const s=sceneFor(level,layout);return [...s.patches,...s.tufts,...s.flowers,...s.verge].map(i=>({x:i.x,y:i.y}));}
globalThis.TD2Vegetation={draw,stats,items,enabled,CLEAR,LIMITS:{MAX_PATCHES,MAX_TUFTS,MAX_FLOWERS,MAX_VERGE},release(){cache.clear();}};
})();
