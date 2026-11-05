/* Kirchende photo study: moss, leaf litter, worn earth and a slab approach.
 * Textures are seeded and cached; no route coordinates or combat state change. */
(() => {
'use strict';
const textures=new Map();let patterns=new WeakMap(),groundPhoto=null;
let groundLoading=null;
function load(){
  if(groundPhoto)return Promise.resolve(true);
  if(typeof Image==='undefined')return Promise.resolve(false);
  if(groundLoading)return groundLoading;
  groundLoading=new Promise(resolve=>{
    const image=new Image();image.decoding='async';
    image.onload=()=>{groundPhoto=image;textures.delete('ground');patterns=new WeakMap();resolve(true);};
    image.onerror=()=>{groundLoading=null;resolve(false);};
    image.src='assets/kirchende/ground-photo-v2.webp?v=v400a5photo2';
  });
  return groundLoading;
}
// The optional photo loader stays available for older callers; illustration needs no download.
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
  const size=kind==='ground'?(groundPhoto?512:1024):256,c=document.createElement('canvas');c.width=c.height=size;
  const q=c.getContext('2d'),r=rng(kind==='ground'?164701:kind==='slabs'?9821:3749);
  if(kind==='ground'&&groundPhoto){q.drawImage(groundPhoto,0,0,512,512);textures.set(kind,c);return c;}
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
  }else litter(q,r,size,kind==='ground'?1700:105);
  textures.set(kind,c);return c;
}
function pattern(ctx,kind){
  let cache=patterns.get(ctx);if(!cache){cache=new Map();patterns.set(ctx,cache);}
  if(!cache.has(kind))cache.set(kind,ctx.createPattern(texture(kind),'repeat'));
  return cache.get(kind);
}
let illustratedGround=null;
function groundPainting(){
  if(illustratedGround)return illustratedGround;
  const c=document.createElement('canvas');c.width=c.height=1536;
  const q=c.getContext('2d'),r=rng(671629);
  q.fillStyle='#364335';q.fillRect(0,0,1536,1536);
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
  illustratedGround=c;return c;
}
function drawGround(ctx,x,y,w,h){
  const painting=groundPainting(),left=Math.max(0,x),top=Math.max(0,y);
  const right=Math.min(3072,x+w),bottom=Math.min(3072,y+h);
  if(right>left&&bottom>top)ctx.drawImage(painting,left*.5,top*.5,(right-left)*.5,(bottom-top)*.5,left,top,right-left,bottom-top);
}
function drawRoad(ctx,path,{surface='earth'}={}){
  if(!path||path.length<2)return;
  const slabs=surface==='slabs';ctx.save();ctx.setLineDash([]);ctx.lineCap='round';ctx.lineJoin='round';
  ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  // Soft soil shoulders rather than kerbs or traffic markings. Same route centreline.
  for(const [width,color] of [[148,'#8a805006'],[138,'#84764709'],[126,'#a08e5a0d'],[114,'#aa986017'],[104,'#75694c24'],[94,'#5e594044'],[86,'#9c8c6655'],[80,'#8b7d60'],[72,pattern(ctx,slabs?'slabs':'earth')||'#81745e']]){
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  ctx.restore();
}
function drawStars(ctx,x,y,level,low=false){const n=Math.max(1,Math.min(3,Math.floor(level||1)));ctx.save();ctx.lineJoin='round';ctx.lineWidth=1.6;
for(let i=0;i<n;i++){const sx=x+(i-(n-1)/2)*29,sy=y+47;ctx.beginPath();
for(let j=0;j<10;j++){let a=j*Math.PI/5-Math.PI/2,d=j%2?5.5:12.4,px=sx+Math.cos(a)*d,py=sy+Math.sin(a)*d;if(j)ctx.lineTo(px,py);else ctx.moveTo(px,py);}
ctx.closePath();ctx.shadowBlur=low?0:7;ctx.shadowColor='#f1ae42';ctx.fillStyle='#ffcf51';ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#543c21';ctx.stroke();}
ctx.restore();}
globalThis.DenkmalTerrain={drawGround,drawRoad,drawStars,load};
})();
