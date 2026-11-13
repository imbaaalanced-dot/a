/* Reference-guided Style 2 material pass V3.
 * Opt-in only: ?td2GroundV3=1. Original layouts, save data and routes unchanged.
 * The nine 256px WebPs are AI interpretations of documented material families,
 * not literal original photographs or historically exact reconstruction. */
(()=>{
'use strict';
const active=/(?:^|[?&])td2GroundV3=1(?:&|$)/.test(globalThis.location?.search||'');
const base='assets/reference-ground-v3/';
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
 task=Promise.all(names.map(name=>new Promise(resolve=>{
  const img=new Image();img.decoding='async';
  img.onload=()=>{
   if(img.naturalWidth===256&&img.naturalHeight===256){images.set(name,img);resolve(true);}
   else resolve(false);
  };
  img.onerror=()=>resolve(false);
  img.src=base+name+'.webp?v=ground-v3-20261113';
 }))).then(results=>results.some(Boolean));
 return task;
}
function material(level,kind='base'){
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
 if(!cache.has(name))cache.set(name,ctx.createPattern(images.get(name),'repeat'));
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