/* TD2 Kirchende: repeatable multi-layer foliage, cached per crown variant. */
(()=>{'use strict';
const crowns=[],shrubs=[];
function rnd(seed){return ()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);}
function circle(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();}
function create(index){
 const c=document.createElement('canvas');c.width=c.height=256;
 const q=c.getContext('2d'),r=rnd(7823+index*491);
 // Five distinct baked silhouettes, not five recolors of one round crown.
 // Broad oak, tall beech, broken old tree, dark conifer and sparse woodland.
 const profiles=[
  {rx:1,ry:.85,clusters:115,leaves:720,edge:99,dark:false},
  {rx:.75,ry:1.03,clusters:118,leaves:740,edge:96,dark:false},
  {rx:1.02,ry:.73,clusters:88,leaves:465,edge:96,dark:false},
  {rx:.69,ry:1.12,clusters:105,leaves:550,edge:95,dark:true},
  {rx:.90,ry:.79,clusters:76,leaves:390,edge:94,dark:false}
 ];
 const profile=profiles[index%profiles.length];
 const shade=q.createRadialGradient(128,130,18,128,130,117);
 shade.addColorStop(0,profile.dark?'#101f1d':'#13251b');
 shade.addColorStop(.65,profile.dark?'#223e33':'#1d3926');
 shade.addColorStop(1,'#10291b00');
 q.fillStyle=shade;q.beginPath();q.ellipse(128,130,110*profile.rx,110*profile.ry,0,0,Math.PI*2);q.fill();
 const mass=profile.dark?['#263e34','#345344','#3f5c48','#45644b','#20382f']:['#435a40','#53674a','#60734e','#6d7c53','#354e3c'];
 for(let i=0;i<profile.clusters;i++){
  const a=r()*Math.PI*2,d=Math.sqrt(r())*87,x=128+Math.cos(a)*d*profile.rx,y=128+Math.sin(a)*d*profile.ry;
  circle(q,x,y,profile.dark?8+r()*12:10+r()*17,mass[Math.floor(r()*mass.length)]);
 }
 const leaf=profile.dark?['#3f654e','#52765b','#66836a','#284c40','#789078']:['#657b50','#7b8b5c','#8d9868','#496644','#a5a16d','#526e49'];
 for(let i=0;i<profile.leaves;i++){
  const a=r()*Math.PI*2,d=Math.sqrt(r())*94,x=128+Math.cos(a)*d*profile.rx,y=128+Math.sin(a)*d*profile.ry;
  if(((x-128)/profile.rx)**2+((y-128)/profile.ry)**2>profile.edge**2)continue;
  q.fillStyle=leaf[Math.floor(r()*leaf.length)];q.beginPath();
  q.ellipse(x,y,profile.dark?1+r()*2.3:1.2+r()*3.6,profile.dark?2+r()*4:1+r()*2.4,r()*3,0,Math.PI*2);q.fill();
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
 circle(q,96,100,80,'#233d2d99');
 for(let i=0;i<350;i++){
   const a=r()*Math.PI*2,d=Math.sqrt(r())*75,x=96+Math.cos(a)*d,y=96+Math.sin(a)*d*.88;
   q.fillStyle=['#304b3b','#405d45','#506d4c','#627b55','#7b8a61'][i%5];q.beginPath();q.ellipse(x,y,2+r()*7,1.4+r()*3,a+.6,0,Math.PI*2);q.fill();
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