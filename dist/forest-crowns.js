/* TD2 Kirchende: repeatable multi-layer foliage, cached per crown variant. */
(()=>{'use strict';
const crowns=[],shrubs=[];
function rnd(seed){return ()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);}
function circle(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();}
function create(index){
 const c=document.createElement('canvas');c.width=c.height=256;
 const q=c.getContext('2d'),r=rnd(7823+index*491);
 const shade=q.createRadialGradient(128,130,18,128,130,117);
 shade.addColorStop(0,'#13251b');shade.addColorStop(.65,'#1d3926');shade.addColorStop(1,'#10291b00');
 circle(q,128,130,116,shade);
 const mass=['#4f6941','#5c7448','#6a7d4b','#79874f','#3f5b3a'];
 for(let i=0;i<115;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*87;circle(q,128+Math.cos(a)*d,128+Math.sin(a)*d*.85,10+r()*17,mass[Math.floor(r()*mass.length)]);}
 const leaf=['#6e884e','#829854','#9ba462','#4e7044','#b0ac6f','#587740'];
 for(let i=0;i<1350;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*94,x=128+Math.cos(a)*d,y=128+Math.sin(a)*d*.83;
  if((x-128)**2+((y-128)*1.2)**2>99**2)continue;
  q.fillStyle=leaf[Math.floor(r()*leaf.length)];q.beginPath();q.ellipse(x,y,1.2+r()*3.6,1+r()*2.4,r()*3,0,Math.PI*2);q.fill();
 }
 return c;
}
// Broad, glossy evergreen leaves distinguish the approach shrubs from tall trees.
function createShrub(index){
 const c=document.createElement('canvas');c.width=c.height=192;const q=c.getContext('2d'),r=rnd(9341+index*83);
 circle(q,96,100,80,'#233d2d99');
 for(let i=0;i<540;i++){
   const a=r()*Math.PI*2,d=Math.sqrt(r())*75,x=96+Math.cos(a)*d,y=96+Math.sin(a)*d*.88;
   q.fillStyle=['#344f36','#456444','#56764b','#668454','#829264'][i%5];q.beginPath();q.ellipse(x,y,2+r()*7,1.4+r()*3,a+.6,0,Math.PI*2);q.fill();
 }
 return c;
}
function drawShrub(ctx,x,y,r,number){
 const index=number%3,sprite=shrubs[index]||(shrubs[index]=createShrub(index));
 ctx.drawImage(sprite,x-r*1.15,y-r*1.12,r*2.3,r*2.3);return true;
}
function drawCrown(ctx,x,y,r,number){
 const index=number%5;const sprite=crowns[index]||(crowns[index]=create(index));
 const d=r*2.32;ctx.drawImage(sprite,x-d/2,y-35-d/2,d,d);return true;
}
globalThis.DenkmalForest={drawCrown,drawShrub};
})();