/* TD2 Kirchende: repeatable multi-layer foliage, cached per crown variant. */
(()=>{'use strict';
const crowns=[],shrubs=[];
function rnd(seed){return ()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);}
function create(index){
 const c=document.createElement('canvas');c.width=c.height=256;
 const q=c.getContext('2d'),r=rnd(7823+index*491);
 // Five distinct baked silhouettes, not five recolors of one round crown.
 // Broad oak, tall beech, broken old tree, dark conifer and sparse woodland.
 const profiles=[
  {rx:1,ry:.85,leaves:720,dark:false},
  {rx:.75,ry:1.03,leaves:740,dark:false},
  {rx:1.02,ry:.73,leaves:465,dark:false},
  {rx:.69,ry:1.12,leaves:550,dark:true},
  {rx:.90,ry:.79,leaves:390,dark:false}
 ];
 const profile=profiles[index%profiles.length];
 const shade=q.createRadialGradient(128,130,18,128,130,117);
 shade.addColorStop(0,profile.dark?'#101f1d88':'#13251b88');
 shade.addColorStop(.65,profile.dark?'#223e3355':'#1d392655');
 shade.addColorStop(1,'#10291b00');
 q.fillStyle=shade;q.beginPath();q.ellipse(128,130,110*profile.rx,110*profile.ry,0,0,Math.PI*2);q.fill();
 // Overlapping foliage masses carry their own light and deep underside.
 // Small leaf marks follow each mass rather than speckling one flat disc.
 const lobes=[];
 for(let i=0;i<16;i++){
  const a=i*2.399963+r()*.5,d=Math.sqrt((i+.5)/16)*72;
  lobes.push({x:128+Math.cos(a)*d*profile.rx,y:128+Math.sin(a)*d*profile.ry,
    rx:(24+r()*13)*profile.rx,ry:(22+r()*12)*profile.ry});
 }
 lobes.sort((a,b)=>a.y-b.y);
 for(const lobe of lobes){
  const {x,y,rx,ry}=lobe;
  const volume=q.createRadialGradient(x-rx*.32,y-ry*.42,2,x,y,Math.max(rx,ry)*1.08);
  volume.addColorStop(0,profile.dark?'#4e674b':'#718259');
  volume.addColorStop(.38,profile.dark?'#3c5740':'#5c724c');
  volume.addColorStop(.74,profile.dark?'#2d4936':'#405b3b');
  volume.addColorStop(1,profile.dark?'#233c2e':'#304c33');
  q.fillStyle=volume;q.beginPath();
  // Uneven branch tips break the circular lobe boundary at small sizes.
  for(let tip=0;tip<22;tip++){
   const a=tip*Math.PI*2/22,reach=.78+r()*.24;
   const px=x+Math.cos(a)*rx*reach,py=y+Math.sin(a)*ry*reach;
   if(tip)q.lineTo(px,py);else q.moveTo(px,py);
  }
  q.closePath();q.fill();
  const leaves=profile.dark?['#83916a45','#48674a55','#132e2755']
    :['#adb07a60','#7b925866','#29433155'];
  for(let i=0;i<Math.floor(profile.leaves/10);i++){
   const a=r()*Math.PI*2,d=Math.sqrt(r())*.94;
   const lx=x+Math.cos(a)*d*rx,ly=y+Math.sin(a)*d*ry;
   // Upper-left sprays are softly lit; lower sprays reinforce the shadow.
   q.fillStyle=leaves[(lx-x)/rx+(ly-y)/ry<-.25?0:ly<y?1:2];
   q.beginPath();q.ellipse(lx,ly,1+r()*2,profile.dark?2+r()*2.5:1+r()*1.6,a*.3-.6,0,Math.PI*2);q.fill();
  }
 }
 // One consistent light direction, baked into the sprite rather than filtered each frame.
 q.globalCompositeOperation='source-atop';
 const light=q.createLinearGradient(35,30,210,220);
 light.addColorStop(0,'#d7c58a25');light.addColorStop(.45,'#a8b08a00');light.addColorStop(1,'#102a365c');
 q.fillStyle=light;q.fillRect(0,0,c.width,c.height);q.globalCompositeOperation='source-over';
 return c;
}
// Broad, glossy evergreen leaves distinguish the approach shrubs from tall trees.
function createShrub(index){
 const c=document.createElement('canvas');c.width=c.height=192;const q=c.getContext('2d'),r=rnd(9341+index*83);
 // Three low-profile silhouettes share the old 192px cache budget:
 // compact evergreen, wide hedgerow and sparse fern-like undergrowth.
 const profiles=[
  {rx:.88,ry:.86,leaves:350,base:'#233d2d99',palette:['#304b3b','#405d45','#506d4c','#627b55','#7b8a61']},
  {rx:1.12,ry:.70,leaves:360,base:'#283a2899',palette:['#334b35','#45593a','#576848','#6c7850','#889063']},
  {rx:.77,ry:1.00,leaves:260,base:'#203a3299',palette:['#27483c','#37604b','#4d7456','#648364','#789477']}
 ];
 const p=profiles[index%profiles.length];
 q.fillStyle=p.base;q.beginPath();q.ellipse(96,100,80*p.rx,80*p.ry,0,0,Math.PI*2);q.fill();
 for(let i=0;i<p.leaves;i++){
   const a=r()*Math.PI*2,d=Math.sqrt(r())*75,x=96+Math.cos(a)*d*p.rx,y=96+Math.sin(a)*d*.88*p.ry;
   q.fillStyle=p.palette[i%p.palette.length];q.beginPath();
   q.ellipse(x,y,2+r()*7,1.4+r()*3,a+.6,0,Math.PI*2);q.fill();
 }
 return c;
}
function drawShrub(ctx,x,y,r,number){
 const index=number%3,sprite=shrubs[index]||(shrubs[index]=createShrub(index));
 ctx.drawImage(sprite,x-r*1.06,y-r*1.04,r*2.12,r*2.12);return true;
}
function drawCrown(ctx,x,y,r,number){
 const index=number%5;const sprite=crowns[index]||(crowns[index]=create(index));
 const d=r*2.16;ctx.drawImage(sprite,x-d/2,y-35-d/2,d,d);return true;
}
globalThis.DenkmalForest={drawCrown,drawShrub};
})();