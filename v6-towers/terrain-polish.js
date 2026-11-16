/* Kirchende photo study: moss, leaf litter, worn earth and a slab approach.
 * Textures are seeded and cached; no route coordinates or combat state change. */
(() => {
'use strict';
const textures=new Map();let patterns=new WeakMap();
let groundLoading=null,style2Ground=null;
const pilot=/(?:^|[?&])td2Style2Pilot=1(?:&|$)/.test(globalThis.location?.search||'');
const baseGroundUrl='assets/kirchende/ground-style2-v1.webp?v=kirchende-pilot1';
const pilotGroundUrl='assets/style2-pilot-v1/environment/ground/forest_floor.webp?v=pilot1';
const pilotRoad={earth:null,slabs:null};
// Optional Level-4-only preview. Production keeps reference-ground V3.
const level4Seamfix=!pilot&&/(?:^|[?&])td2Level4Seamfix=1(?:&|$)/.test(globalThis.location?.search||'');
const level4Images={cobble:null,flagstone:null};
let level4Loading=null;
function loadLevel4Seamfix(){
  if(!level4Seamfix||typeof Image!=='function')return Promise.resolve(false);
  if(level4Loading)return level4Loading;
  const sources=[
    ['cobble','assets/level4/level4-cobblestone-512-seamfix.webp?v=seamfix-1'],
    ['flagstone','assets/level4/level4-flagstone-512-seamfix.webp?v=seamfix-1']
  ];
  level4Loading=Promise.all(sources.map(([name,url])=>new Promise(resolve=>{
    const image=new Image();image.decoding='async';
    image.onload=()=>{
      if(image.naturalWidth===512&&image.naturalHeight===512){
        level4Images[name]=image;resolve(true);
      }else resolve(false);
    };
    image.onerror=()=>resolve(false);
    image.src=url;
  }))).then(results=>{
    // The fallback pattern may have been created while the images decoded.
    patterns=new WeakMap();
    return results.some(Boolean);
  });
  return level4Loading;
}
async function loadPilotRoads(){
  if(!pilot)return;
  const requests=[
    ['earth','assets/style2-pilot-v1/environment/ground/gravel_path.webp?v=pilot1'],
    ['slabs','assets/style2-pilot-v1/environment/ground/cobble_moss.webp?v=pilot1']
  ];
  await Promise.all(requests.map(([key,url])=>new Promise(resolve=>{
    const image=new Image();image.decoding='async';
    image.onload=()=>{pilotRoad[key]=image;resolve(true);};
    image.onerror=()=>resolve(false);
    image.src=url;
  })));
}
function load(){
  if(groundLoading)return groundLoading;
  if(style2Ground)return Promise.resolve(true);
  if(typeof Image==='undefined')return Promise.resolve(false);
  groundLoading=new Promise(resolve=>{
    const image=new Image();image.decoding='async';
    let triedFallback=false;
    image.onload=()=>{
      style2Ground=image;illustratedGround=null;illustratedMeadow=null;
      // This opt-in preview never blocks gameplay when a pilot texture is missing.
      Promise.all([loadPilotRoads(),loadLevel4Seamfix(),globalThis.TD2GroundV3?.load?.()||Promise.resolve(false)]).then(()=>resolve(true),()=>resolve(true));
    };
    image.onerror=()=>{
      if(pilot&&!triedFallback){triedFallback=true;image.src=baseGroundUrl;return;}
      groundLoading=null;resolve(false);
    };
    image.src=pilot?pilotGroundUrl:baseGroundUrl;
  });
  return groundLoading;
}
// Ground and path materials stay cached; map rendering never fetches a photograph.
function rng(seed){return ()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);}
function leaf(ctx,x,y,r,color,angle){
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle=color;
  ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(-r*.3,-r*.6);ctx.lineTo(r*.65,-r*.4);
  ctx.lineTo(r,0);ctx.lineTo(r*.1,r*.65);ctx.closePath();ctx.fill();ctx.restore();
}
function litter(ctx,random,size,count){
  const colors=['#7f6045','#9a7650','#ae8c61','#675443','#b19a70','#534b36'];
  for(let i=0;i<count;i++)leaf(ctx,random()*size,random()*size,1.5+random()*3.6,colors[i%colors.length],random()*Math.PI);
}
function texture(kind){
  if(textures.has(kind))return textures.get(kind);
  const size=kind==='ground'?1024:256,c=document.createElement('canvas');c.width=c.height=size;
  const q=c.getContext('2d'),r=rng(kind==='ground'?164701:kind==='slabs'?9821:3749);
  q.fillStyle=kind==='ground'?'#767952':kind==='slabs'?'#8b8772':'#81745e';q.fillRect(0,0,size,size);
  if(kind==='ground'){
    // Broad, uneven moss patches over exposed compacted earth, as in the photos.
    for(let i=0;i<180;i++){
      const x=r()*size,y=r()*size,rx=45+r()*120,ry=20+r()*65;
      const tint=['#82975999','#526f4380','#9a9f6588','#79644880'][i%4];
      const fade=q.createRadialGradient(x,y,0,x,y,rx);fade.addColorStop(0,tint);fade.addColorStop(.5,tint.slice(0,7)+'55');fade.addColorStop(1,tint.slice(0,7)+'00');
      q.fillStyle=fade;q.fillRect(x-rx,y-rx,rx*2,rx*2);
      for(let j=0;j<24;j++){
        q.fillStyle=['#9a9d65','#7e8d50','#677c45','#a3a76b55'][j%4];
        q.fillRect((x+(r()-.5)*rx*1.8+size)%size,(y+(r()-.5)*ry*1.8+size)%size,1+r()*4,1+r()*2);
      }
    }
  }
  const grain=kind==='ground'?['#2f392c24','#cab48e22','#6b794b35']:['#302f2b24','#c3b69b28','#93846c28'];
  for(let i=0;i<(kind==='ground'?18000:2300);i++){
    q.fillStyle=grain[i%grain.length];q.fillRect(r()*size,r()*size,.7+r()*2,.5+r()*1.5);
  }
  if(kind==='slabs'){
    q.lineWidth=2;q.strokeStyle='#353d35';
    for(let y=0;y<size;y+=64)for(let x=0;x<size;x+=64){
      q.strokeRect(x,y,64,64);q.fillStyle='#c8c5a21c';q.fillRect(x+2,y+2,60,2);
      if(r()<.32){q.beginPath();q.moveTo(x+8,y);q.lineTo(x+22,y+25);q.lineTo(x+17,y+42);q.stroke();}
      q.fillStyle='#6c7c4666';q.fillRect(x+r()*50,y,10+r()*14,2);
    }
    litter(q,r,size,35);
    // A few embedded moss seams and chipped stone faces are baked into the
    // 256px paving material, not painted separately in the gameplay loop.
    for(let i=0;i<60;i++){
      const x=r()*size,y=r()*size;
      q.fillStyle=['#354b3c70','#71805955','#c4bc9c34'][i%3];
      q.fillRect(x,y,2+r()*9,1+r()*2.5);
    }
  }else{
    litter(q,r,size,kind==='ground'?1700:105);
    if(kind==='earth'){
      // Sparse worn pebbles and soft moss flecks tie the dirt route into the
      // woodland floor without changing its centreline or draw-call budget.
      for(let i=0;i<135;i++){
        const x=r()*size,y=r()*size,w=1.5+r()*6;
        q.fillStyle=['#334c3466','#66804a55','#9b927348','#3d443a5c'][i%4];
        q.beginPath();q.ellipse(x,y,w,.7+r()*2,r()*.6-.3,0,Math.PI*2);q.fill();
      }
    }
  }
  textures.set(kind,c);return c;
}
function pattern(ctx,kind,groundLevel=3){
  const sample=level4Seamfix&&groundLevel===4
    ?(kind==='slabs'?level4Images.cobble:kind==='flagstone'?level4Images.flagstone:null):null;
  if(sample){
    let cache=patterns.get(ctx);if(!cache){cache=new Map();patterns.set(ctx,cache);}
    const key='level4-seamfix-'+kind;
    if(!cache.has(key))cache.set(key,ctx.createPattern(sample,'repeat'));
    return cache.get(key);
  }
  // Existing reference-ground material is the first fallback; no new paths.
  const material=kind==='flagstone'?'dark_slab_lichen'
    :globalThis.TD2GroundV3?.material?.(groundLevel,kind==='slabs'?'road':'earth');
  const reference=globalThis.TD2GroundV3?.pattern?.(ctx,material);
  if(reference)return reference;
  let cache=patterns.get(ctx);if(!cache){cache=new Map();patterns.set(ctx,cache);}
  const fallbackKind=kind==='flagstone'?'slabs':kind;
  const pilotImage=pilot&&pilotRoad[fallbackKind];
  const cacheKey=pilotImage?'pilot-'+fallbackKind:fallbackKind;
  if(!cache.has(cacheKey)){
    cache.set(cacheKey,ctx.createPattern(pilotImage||texture(fallbackKind),'repeat'));
  }
  return cache.get(cacheKey);
}
let illustratedGround=null,illustratedMeadow=null,materialRevision=-1;
function groundPainting(groundLevel=3){
  const revision=globalThis.TD2GroundV3?.revision||0;
  if(materialRevision!==revision){illustratedGround=illustratedMeadow=null;materialRevision=revision;}
  if(groundLevel===4&&illustratedMeadow)return illustratedMeadow;
  if(groundLevel!==4&&illustratedGround)return illustratedGround;
  const c=document.createElement('canvas');c.width=c.height=1536;
  const q=c.getContext('2d'),r=rng(671629);
  const reference=globalThis.TD2GroundV3?.imageFor?.(groundLevel,'base');
  if(reference||style2Ground){
    const pattern=q.createPattern(reference||style2Ground,'repeat');
    if(pattern){
      // The cached painting is enlarged 2x in world space. Keep churchyard
      // grass at its source scale rather than enlarging individual blades.
      if(groundLevel===4)pattern.setTransform?.({a:.5,b:0,c:0,d:.5,e:0,f:0});
      q.fillStyle=pattern;q.fillRect(0,0,1536,1536);
    }
    else{q.fillStyle='#364335';q.fillRect(0,0,1536,1536);}
    q.fillStyle=groundLevel===4?'#27382c55':'#17231c22';q.fillRect(0,0,1536,1536);
  }else{q.fillStyle='#364335';q.fillRect(0,0,1536,1536);}
  // Large softly blended moss/earth masses, painted once across the whole world.
  // No tiled photograph and no repeated leaf/stone landmarks.
  for(let i=0;i<210;i++){
    const x=r()*1536,y=r()*1536,radius=35+r()*190;
    const color=['#63704b38','#82705225','#1e342c42','#92906320'][i%4];
    const fade=q.createRadialGradient(x,y,0,x,y,radius);
    fade.addColorStop(0,color);fade.addColorStop(1,color.slice(0,7)+'00');
    q.fillStyle=fade;q.fillRect(x-radius,y-radius,radius*2,radius*2);
  }
  for(let i=0;i<9000;i++){
    q.fillStyle=['#b8b08b13','#102a231c','#87956918'][i%3];
    q.fillRect(r()*1536,r()*1536,.4+r()*1.7,.3+r()*.8);
  }
  // Sparse clustered leaves: the ground must recede behind units and tower pads.
  for(let cluster=0;cluster<95;cluster++){
    const x=r()*1536,y=r()*1536;
    for(let i=0;i<5;i++)leaf(q,x+(r()-.5)*38,y+(r()-.5)*24,.7+r()*1.5,['#a18a5655','#79865755','#bb9b5c33'][i%3],r()*Math.PI);
  }
  const vignette=q.createRadialGradient(768,768,210,768,768,1100);
  vignette.addColorStop(0,'#c5b78506');vignette.addColorStop(.65,'#11272100');vignette.addColorStop(1,'#0b1c2966');
  q.fillStyle=vignette;q.fillRect(0,0,1536,1536);
  if(groundLevel===4)illustratedMeadow=c;else illustratedGround=c;
  return c;
}
function drawGround(ctx,x,y,w,h,groundLevel=3){
  const painting=groundPainting(groundLevel),left=Math.max(0,x),top=Math.max(0,y);
  const right=Math.min(3072,x+w),bottom=Math.min(3072,y+h);
  if(right>left&&bottom>top)ctx.drawImage(painting,left*.5,top*.5,(right-left)*.5,(bottom-top)*.5,left,top,right-left,bottom-top);
}
// Fixed road-material bands: distinct forest earth and weathered stone, using
// exactly the same path centreline, number of strokes and texture cache.
// These arrays are shared across frames; no new geometry or assets are loaded.
const ROAD_SHOULDERS={
  earth:[[148,'#20362612'],[138,'#29443020'],[126,'#3d523130'],[114,'#56674440'],
    [104,'#645f444f'],[94,'#5b543e80'],[86,'#85765a'],[80,'#77674b']],
  slabs:[[148,'#192b2812'],[138,'#33403720'],[126,'#424c4236'],[114,'#535b5055'],
    [104,'#65696075'],[94,'#787e7199'],[86,'#86877c'],[80,'#77796f']]
};
// Narrow, muted moss margins for the churchyard: the opaque pale bands
// previously read as continuous concrete kerbs around every footpath.
const CHURCH_SHOULDERS=[[116,'#192b2810'],[110,'#293d3020'],[104,'#35433330'],[98,'#414c3e40'],
  [92,'#4c544650'],[86,'#555d4d66'],[80,'#60645499'],[76,'#64685aaa']];
function drawRoad(ctx,path,{surface='earth',groundLevel=3}={}){
  if(!path||path.length<2)return;
  const material=surface==='flagstone'?'flagstone':surface==='slabs'?'slabs':'earth';
  ctx.save();ctx.setLineDash([]);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  // Soft mossy earth shoulders versus cooler stone margins. No traffic markings.
  const shoulders=groundLevel===4&&material!=='earth'?CHURCH_SHOULDERS:ROAD_SHOULDERS[material==='flagstone'?'slabs':material];
  for(const [width,color] of shoulders){
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  ctx.strokeStyle=pattern(ctx,material,groundLevel)||(material==='slabs'?'#77796f':'#77674b');
  ctx.lineWidth=72;ctx.stroke();
  ctx.restore();
}
function drawStars(ctx,x,y,level,low=false){const n=Math.max(1,Math.min(3,Math.floor(level||1)));ctx.save();ctx.lineJoin='round';ctx.lineWidth=1.6;
for(let i=0;i<n;i++){const sx=x+(i-(n-1)/2)*29,sy=y+47;ctx.beginPath();
for(let j=0;j<10;j++){let a=j*Math.PI/5-Math.PI/2,d=j%2?5.5:12.4,px=sx+Math.cos(a)*d,py=sy+Math.sin(a)*d;if(j)ctx.lineTo(px,py);else ctx.moveTo(px,py);}
ctx.closePath();ctx.shadowBlur=low?0:7;ctx.shadowColor='#f1ae42';ctx.fillStyle='#ffcf51';ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#543c21';ctx.stroke();}
ctx.restore();}
globalThis.DenkmalTerrain={drawGround,drawRoad,drawStars,get groundImage(){return style2Ground;},load,level4SeamfixEnabled:level4Seamfix,get level4SeamfixLoaded(){return Number(!!level4Images.cobble)+Number(!!level4Images.flagstone);}};
})();
