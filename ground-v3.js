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
const images=new Map();let task=null;let patterns=new WeakMap();
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
 }))).then(results=>results.some(Boolean));
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
function drawBase(ctx,level){
 const tile=patternFor(ctx,level,'base');
 if(!tile)return false;
 ctx.save();ctx.fillStyle=tile;ctx.fillRect(0,0,3072,3072);ctx.restore();
 return true;
}
function clearCache(){patterns=new WeakMap();}
globalThis.TD2GroundV3=Object.freeze({enabled:active,names,byLevel,material,imageFor,pattern,patternFor,drawBase,load,clearCache,
 get loadedCount(){return images.size;}});
})();