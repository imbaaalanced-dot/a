/* Level 4 reference scenery: no level geometry or hitbox changes. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const source=fs.readFileSync('dist/style2-level4-reference.js','utf8');
const html=fs.readFileSync('dist/index.html','utf8');
assert.ok(html.includes('style2-level4-reference.js?v=ref4a1'));
assert.ok(html.indexOf('church-art.js')<html.indexOf('style2-level4-reference.js'));
assert.ok(html.indexOf('style2-level4-reference.js')<html.indexOf('game.js?v='));
let made=0,painted=0,oldGround=0,oldSite=0,saves=0;
const gradient=()=>({addColorStop(){}});
const ctx=new Proxy({createLinearGradient:gradient,createRadialGradient:gradient,
  save(){saves++;},restore(){saves--;},drawImage(){painted++;}},
  {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
const center={x:1536,y:1536};
const pathDistance=(p,path)=>{
  let best=Infinity;
  for(let i=1;i<path.length;i++){
    const a=path[i-1],b=path[i],dx=b.x-a.x,dy=b.y-a.y;
    const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));
    best=Math.min(best,Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy));
  }
  return best;
};
const point=(x,y)=>({x:center.x+x,y:center.y+y});
const layout={
  churchFootprint:{left:-415,right:235,top:-700,bottom:-290},
  paths:[
    [[420,-1000],[420,-760],[420,-360],[350,-200],[200,-90],[0,0]],
    [[850,520],[450,520],[400,250],[250,100],[0,0]],
    [[-850,520],[-300,520],[-100,280],[-100,100],[0,0]],
    [[-850,-220],[-600,-220],[-420,-200],[-220,-180],[-100,-80],[0,0]]
  ].map(points=>points.map(([x,y])=>point(x,y))),
  slots:[[-760,-590],[-470,-810],[310,-210],[440,340],[560,190],[230,390]].map(([x,y])=>point(x,y))
};
const snapshot=JSON.stringify(layout);
const church={drawGround(){oldGround++;},drawSite(){oldSite++;}};
const sandbox={Math,DenkmalChurch:church,DenkmalLevels:{levels:{4:layout},center,pathDistance},
  document:{createElement(tag){assert.equal(tag,'canvas');made++;return {width:0,height:0,getContext:()=>ctx};}},
  Style2Phase6:{upright(context,anchor,paint){return paint();}}};
vm.createContext(sandbox);vm.runInContext(source,sandbox,{filename:'style2-level4-reference.js'});
const api=sandbox.Style2Level4Reference;
assert.ok(api,'style 2 reference renderer registers');
assert.equal(made,0,'lazy cache on level entry');
assert.ok(api.lamps.length>=3,'churchyard receives visible fixed-position lanterns');
assert.ok(api.lamps.every(p=>api.clear(p.x,p.y,73,75)));
const camera={x:700,y:700};
church.drawGround(ctx,camera,850,850);church.drawSite(ctx,center);
assert.equal(made,2,'one small terrain atlas and one reusable lantern atlas');
assert.equal(api.builds,2);
const cached=made;
for(let i=0;i<100;i++){church.drawGround(ctx,camera,850,850);church.drawSite(ctx,center);}
assert.equal(made,cached,'no per-frame texture allocations');
assert.equal(oldGround,101);assert.equal(oldSite,101);
assert.ok(painted>100);
assert.equal(saves,0,'all canvas state saved/restored');
assert.equal(JSON.stringify(layout),snapshot,'no route or tower site mutations');
assert.equal(api.clear(center.x,center.y),false,'monument stays unobstructed');
assert.equal(api.clear(center.x,center.y-475),false,'church footprint stays unobstructed');
assert.ok(!source.includes('Math.random'),'decoration is deterministic');
console.log('Style 2 reference level 4: cached garden, lamps, path clearance and untouched game data passed.');
