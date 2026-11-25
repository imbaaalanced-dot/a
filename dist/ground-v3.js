/* Reference-guided Style 2 material pass V3.
 * Enabled by default; ?td2GroundV3=0 restores original terrain. Original layouts, saves and routes unchanged.
 * The nine 256px WebPs are AI interpretations of documented material families,
 * not literal original photographs or historically exact reconstruction. */
(()=>{
'use strict';
const query=globalThis.location?.search||'';
// Legacy Style-2 pilot remains isolated from V3; explicit opt-out is always respected.
const active=!/(?:^|[?&])td2GroundV3=0(?:&|$)/.test(query)
 && !/(?:^|[?&])td2Style2Pilot=1(?:&|$)/.test(query);
const base='assets/reference-ground-v3/';
const pavementV4=/(?:^|[?&])td2PavementV4=1(?:&|$)/.test(query);
const names=Object.freeze([
 'forest_moss_roots','dark_slab_lichen','meadow_patchy','churchyard_cobble',
 'syburg_bedrock','syburg_sandstone','memorial_gravel','goethe_brick','urban_asphalt'
]);
const byLevel=Object.freeze({
 1:{base:'forest_moss_roots',road:'churchyard_cobble'},
 2:{base:'forest_moss_roots',road:'dark_slab_lichen'},
 3:{base:'forest_moss_roots',road:'dark_slab_lichen',earth:'forest_moss_roots'},
 4:{base:'meadow_patchy',road:'churchyard_cobble'},
 5:{base:'syburg_bedrock',road:'syburg_sandstone',forecourt:'syburg_sandstone'},
 6:{base:'meadow_patchy',road:'goethe_brick',street:'urban_asphalt',sidewalk:'goethe_brick'},
 7:{base:'meadow_patchy',road:'memorial_gravel',street:'urban_asphalt',sidewalk:'churchyard_cobble',forecourt:'memorial_gravel'}
});
const images=new Map();let task=null,revision=0;let patterns=new WeakMap();
function load(){
 if(!active||typeof Image!=='function')return Promise.resolve(false);
 if(task)return task;
 task=Promise.all([...names,...(pavementV4?['churchyard_pavement_v4']:[])].map(name=>new Promise(resolve=>{
  const img=new Image();img.decoding='async';
  img.onload=()=>{
   if(img.naturalWidth===(name==='churchyard_pavement_v4'?512:256)&&img.naturalHeight===(name==='churchyard_pavement_v4'?512:256)){images.set(name,img);resolve(true);}
   else resolve(false);
  };
  img.onerror=()=>resolve(false);
  img.src=base+name+'.webp?v=ground-v3-20261113';
 }))).then(results=>{
  const loaded=results.some(Boolean);
  // Publish a single cache revision after the batch settles, including partial success.
  if(loaded)revision++;
  return loaded;
 });
 return task;
}
function material(level,kind='base'){
 if(level===4&&kind==='road'&&pavementV4&&images.has('churchyard_pavement_v4'))return 'churchyard_pavement_v4';
 const entry=byLevel[level];
 return entry&&(entry[kind]||entry.base)||null;
}
function imageFor(level,kind='base'){
 if(!active)return null;
 const name=material(level,kind);return name?images.get(name)||null:null;
}
function pattern(ctx,name){
 if(!active||!ctx||!name||!images.has(name))return null;
 let cache=patterns.get(ctx);if(!cache){cache=new Map();patterns.set(ctx,cache);}
 if(!cache.has(name)){
  const tile=ctx.createPattern(images.get(name),'repeat');
  // 512 source pixels retain the existing 256-world-unit material scale.
  if(name==='churchyard_pavement_v4'&&tile)tile.setTransform({a:.5,b:0,c:0,d:.5,e:0,f:0});
  cache.set(name,tile);
 }
 return cache.get(name);
}
function patternFor(ctx,level,kind='base'){return pattern(ctx,material(level,kind));}
function hash2(x,y,seed){let n=(Math.imul(x,73856093)^Math.imul(y,19349663)^Math.imul(seed,83492791))>>>0;n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967296;}
// Base material is stamped tile by tile: a seeded 90-degree rotation plus mirror
// per tile keeps the 256px source from reading as a visible grid. The base is
// baked desaturated and darkened so saturated units separate from the ground.
function stampTiles(q,img,tile,area,seed=1,filter='saturate(.55) brightness(.82)'){
 const prev=q.filter;
 try{q.filter=filter;}catch{q.filter='none';}
 for(let y=0;y<area;y+=tile)for(let x=0;x<area;x+=tile){
  const r=hash2(x/tile|0,y/tile|0,seed);
  q.save();q.translate(x+tile/2,y+tile/2);q.rotate(Math.floor(r*4)*Math.PI/2);if(r>=.5)q.scale(-1,1);
  q.drawImage(img,-tile/2,-tile/2,tile,tile);q.restore();
 }
 try{q.filter=prev;}catch{}
}
function drawBase(ctx,level){
 const img=imageFor(level,'base');
 if(!img)return false;
 ctx.save();stampTiles(ctx,img,256,3072,level);ctx.restore();
 return true;
}
// Paved approach plates where a gameplay lane meets a street polyline.
// Visual only: plates are drawn on the cached ground, lanes and routes are
// only read. Deterministic sampling, no per-frame work.
function approachPlates(q,lanes,route,reach=80){
 const pd=globalThis.DenkmalLevels?.pathDistance;
 if(!pd||!route||route.length<2)return 0;
 let drawn=0;
 for(const lane of lanes){
  if(!lane||lane.length<2)continue;
  for(let i=1;i<lane.length;i++){
   const a=lane[i-1],b=lane[i],len=Math.hypot(b.x-a.x,b.y-a.y);
   if(!len)continue;
   const ang=Math.atan2(b.y-a.y,b.x-a.x);
   for(let d=0;d<=len;d+=18){
    const x=a.x+(b.x-a.x)*d/len,y=a.y+(b.y-a.y)*d/len;
    if(pd({x,y},route)>=reach)continue;
    q.save();q.translate(x,y);q.rotate(ang);
    q.fillStyle='#3a3f3855';q.fillRect(-15,-11,30,22);
    q.fillStyle='#83876f';q.fillRect(-14,-10,28,20);
    q.fillStyle='#9b9f88';q.fillRect(-14,-10,28,4);
    q.restore();drawn++;
   }
  }
 }
 return drawn;
}
function clearCache(){patterns=new WeakMap();}
globalThis.TD2GroundV3=Object.freeze({enabled:active,names,byLevel,material,imageFor,pattern,patternFor,drawBase,stampTiles,hash2,approachPlates,load,clearCache,
 get revision(){return revision;},
 get loadedCount(){return images.size;}});
})();