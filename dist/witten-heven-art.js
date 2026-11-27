/* Level 8 art: Kriegerdenkmal Witten-Heven. Reference-based composition
   (docs/WITTEN_HEVEN_PHOTO_REFERENCE_20261126.md): four dark basalt pillars
   with wrought-iron cross on a raised stone platform in a forest clearing,
   name-plate wall to the north, stone stairs at the southern entrance.
   Ground is baked once into a cached canvas; monument renders procedurally
   until the generated sprite lands in dist/assets/witten-heven/. */
(()=>{'use strict';
 const SIZE=3072,C={x:1536,y:1536};
 let ground=null,materialRevision=-1,allocations=0,monument=null;
 let monumentSprite=null,monumentRequested=false;
 const MONUMENT_URL='assets/witten-heven/monument-heven-style2.webp?v=witten-heven-monument1';
 const BOSS_URL='assets/witten-heven/boss-pfeilerwaechter-v1.webp?v=witten-heven-boss1';
 // Generated cutouts (Cloudinary "Witten heven", WebP-Derivate) drawn as overlays
 // on the baked ground: north name-plate wall, stair arch, southern stairs.
 const ENV=[
  ['assets/witten-heven/mauer-gebogen-links.webp?v=witten-heven-env1',-280,-320,90],
  ['assets/witten-heven/gedenkwand-neutral.webp?v=witten-heven-env1',0,-322,110],
  ['assets/witten-heven/plakette.webp?v=witten-heven-env1',0,-318,64],
  ['assets/witten-heven/mauer-gebogen-mitte.webp?v=witten-heven-env1',280,-320,90],
  ['assets/witten-heven/mauer-L.webp?v=witten-heven-env1',428,-322,90],
  ['assets/witten-heven/mauer-efeu-bogen.webp?v=witten-heven-env1',0,552,170],
  ['assets/witten-heven/treppe.webp?v=witten-heven-env1',0,540,230]
 ];
 let bossSprite=null,bossRequested=false;
 function loadSprite(url){
  if(globalThis.DenkmalAssets?.ready){
    const img=globalThis.DenkmalAssets.ready(url);
    return img&&img.naturalWidth&&img.naturalHeight?img:null;
  }
  return null;
 }
 function bossImage(){
  const cached=loadSprite(BOSS_URL);if(cached)return cached;
  if(!bossRequested){
    bossRequested=true;
    if(typeof Image==='function'){bossSprite=new Image();bossSprite.decoding='async';bossSprite.src=BOSS_URL;}
  }
  return bossSprite?.complete&&bossSprite.naturalWidth?bossSprite:null;
 }
 function stroke(q,points,color,width){
  q.beginPath();points.forEach((p,i)=>i?q.lineTo(p.x,p.y):q.moveTo(p.x,p.y));
  q.strokeStyle=color;q.lineWidth=width;q.lineJoin='round';q.lineCap='round';q.stroke();
 }
 function randomGenerator(seed){let s=seed>>>0;return()=>{s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff;};}
 function createGround(level){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=1536;allocations++;
  const q=canvas.getContext('2d');q.scale(.5,.5);
  const rand=randomGenerator(4711);
  // Forest floor base (level 8 has no authored ground tiles yet -> shared palette).
  q.fillStyle=globalThis.TD2GroundV3?.patternFor?.(q,8,'base')||globalThis.TD2Style2Materials?.forest||'#1d2c26';
  q.fillRect(0,0,SIZE,SIZE);
  // Open grassy clearing around the memorial hill.
  const clearing=q.createRadialGradient(C.x,C.y,120,C.x,C.y,760);
  clearing.addColorStop(0,'#3d4a3a');clearing.addColorStop(.62,'#2c3d31');clearing.addColorStop(1,'#1d2c2600');
  q.fillStyle=clearing;q.beginPath();q.arc(C.x,C.y,760,0,Math.PI*2);q.fill();
  // Leaf litter and undergrowth speckle.
  for(let i=0;i<1500;i++){
    const x=rand()*SIZE,y=rand()*SIZE,rx=10+rand()*80;
    q.fillStyle=['#74826417','#354f3b30','#a5a1810f','#4a3a2426'][i%4];
    q.beginPath();q.ellipse(x,y,rx,rx*(.26+rand()*.28),rand()-.5,0,Math.PI*2);q.fill();
  }
  // Dense bare-deciduous forest ring at the map edges.
  for(let i=0;i<130;i++){
    const a=rand()*Math.PI*2,r=1120+rand()*380,x=C.x+Math.cos(a)*r,y=C.y+Math.sin(a)*r;
    if(x<20||x>SIZE-20||y<20||y>SIZE-20)continue;
    q.fillStyle=i%3?'#16241cdd':'#1c2f24d8';
    q.beginPath();q.arc(x,y,26+rand()*34,0,Math.PI*2);q.fill();
    q.fillStyle='#3a3325aa';
    q.beginPath();q.arc(x,y,7+rand()*7,0,Math.PI*2);q.fill();
  }
  // Authored lanes from levels.js so rendered paths and AI agree.
  for(const lane of level.paths){
    stroke(q,lane,'#141d18',122);stroke(q,lane,'#5d6850',105);
    stroke(q,lane,globalThis.TD2GroundV3?.patternFor?.(q,8,'road')||globalThis.TD2Style2Materials?.stone||'#9a927a',84);
  }
  // Raised stone platform + southern stair strip.
  const p=level.hevenPlatform;
  q.fillStyle='#565349';q.fillRect(C.x+p.left,C.y+p.top,(p.right-p.left),(p.bottom-p.top));
  q.strokeStyle='#8d8568';q.lineWidth=5;q.strokeRect(C.x+p.left,C.y+p.top,(p.right-p.left),(p.bottom-p.top));
  q.fillStyle='#615a48';q.fillRect(C.x-p.stair.width/2,C.y+p.stair.top,p.stair.width,p.stair.bottom-p.stair.top);
  q.strokeStyle='#8d8568';q.lineWidth=4;q.strokeRect(C.x-p.stair.width/2,C.y+p.stair.top,p.stair.width,p.stair.bottom-p.stair.top);
  for(let y=C.y+p.stair.top+18;y<C.y+p.stair.bottom;y+=24){q.strokeStyle='#3f3a2e';q.lineWidth=3;q.beginPath();q.moveTo(C.x-p.stair.width/2+6,y);q.lineTo(C.x+p.stair.width/2-6,y);q.stroke();}
  // Name-plate wall band to the north.
  const w=level.hevenWall;
  q.fillStyle='#4c483e';q.fillRect(C.x+w.left,C.y+w.top,(w.right-w.left),(w.bottom-w.top));
  q.strokeStyle='#877f66';q.lineWidth=5;q.strokeRect(C.x+w.left,C.y+w.top,(w.right-w.left),(w.bottom-w.top));
  for(let x=C.x+w.left+30;x<C.x+w.right;x+=60){q.strokeStyle='#39352c';q.lineWidth=3;q.beginPath();q.moveTo(x,C.y+w.top+6);q.lineTo(x,C.y+w.bottom-6);q.stroke();}
  return canvas;
 }
 function createMemorial(){
  // Procedural stand-in for the generated four-pillar sprite: dark basalt
  // pillars, wrought-iron cross, central gold-plate (text stays unreadable).
  const canvas=document.createElement('canvas');canvas.width=420;canvas.height=520;allocations++;
  const q=canvas.getContext('2d');q.translate(210,500);q.lineJoin='round';
  q.fillStyle='#15272386';q.beginPath();q.ellipse(8,8,190,32,0,0,Math.PI*2);q.fill();
  q.fillStyle='#4a463c';q.fillRect(-170,-26,340,34);
  q.fillStyle='#6d6858';q.fillRect(-170,-34,340,14);
  const pillar=(x)=>{q.fillStyle='#3b3a38';q.fillRect(x,-360,52,334);
    q.fillStyle='#575650';q.fillRect(x+6,-360,14,334);
    q.fillStyle='#2c2b29';q.fillRect(x+38,-360,14,334);
    q.fillStyle='#4c4b46';q.fillRect(x,-372,52,14);};
  pillar(-150);pillar(-60);pillar(30);pillar(120);
  // Central gold inscription plate between the middle pillars.
  q.fillStyle='#8a6a3b';q.fillRect(-34,-240,68,150);
  q.fillStyle='#d9a45b';q.fillRect(-28,-234,56,138);
  q.strokeStyle='#6b5228';q.lineWidth=3;
  for(let i=0;i<6;i++){q.beginPath();q.moveTo(-20,-214+i*22);q.lineTo(20,-214+i*22);q.stroke();}
  // Wrought-iron cross on a thin rod between the middle pillars.
  q.strokeStyle='#1c1c20';q.lineWidth=7;q.beginPath();q.moveTo(0,-372);q.lineTo(0,-452);q.stroke();
  q.lineWidth=8;q.beginPath();q.moveTo(-26,-428);q.lineTo(26,-428);q.stroke();
  q.lineWidth=8;q.beginPath();q.moveTo(0,-470);q.lineTo(0,-404);q.stroke();
  return canvas;
 }
 function readyMonument(){
  if(globalThis.DenkmalAssets?.ready){
    monumentSprite=globalThis.DenkmalAssets.ready(MONUMENT_URL);
    return !!(monumentSprite?.naturalWidth&&monumentSprite.naturalHeight);
  }
  if(!monumentRequested){
    monumentRequested=true;
    if(typeof Image==='function'){monumentSprite=new Image();monumentSprite.decoding='async';monumentSprite.src=MONUMENT_URL;}
  }
  return !!(monumentSprite?.complete&&monumentSprite.naturalWidth&&monumentSprite.naturalHeight);
 }
 function drawGround(ctx,level){
  const revision=globalThis.TD2GroundV3?.revision||0;
  if(!ground||materialRevision!==revision){ground=createGround(level);materialRevision=revision;}
  ctx.drawImage(ground,0,0,SIZE,SIZE);
  for(const [url,ox,oy,h] of ENV){
    const img=loadSprite(url);if(!img)continue;
    const w=h*img.naturalWidth/img.naturalHeight;
    ctx.drawImage(img,C.x+ox-w/2,C.y+oy-h,w,h);
  }
 }
 function drawBoss(ctx,e,time=0){
  const img=bossImage();if(!img)return false;
  const h=300,w=h*img.naturalWidth/img.naturalHeight,bob=Math.sin(time*2)*3;
  ctx.drawImage(img,e.x-w/2,e.y-h+bob,w,h);
  return true;
 }
 function drawMonument(ctx,m){
  if(readyMonument()){
    const height=520,width=height*monumentSprite.naturalWidth/monumentSprite.naturalHeight;
    ctx.drawImage(monumentSprite,m.x-width/2,m.y-height+20,width,height);
    return;
  }
  if(!monument)monument=createMemorial();
  ctx.drawImage(monument,m.x-210,m.y-500,420,520);
 }
 function drawAirLane(ctx,level,active){
  if(!active)return;
  const a=level.airGate;ctx.save();try{
    ctx.setLineDash([11,17]);stroke(ctx,[a,C],'#8ac2d288',3);ctx.setLineDash([]);
    ctx.fillStyle='#9cdae2';ctx.textAlign='center';ctx.font='700 17px sans-serif';
    ctx.fillText('LUFTANGRIFF AUS DEM NORDEN',a.x,a.y-40);
  }finally{ctx.restore();}
 }
 globalThis.DenkmalWittenHevenArt={drawGround,drawMonument,drawAirLane,drawBoss,
  release(){ground=null;monument=null;monumentSprite=null;monumentRequested=false;bossSprite=null;bossRequested=false;},
  get allocations(){return allocations;}};
})();
