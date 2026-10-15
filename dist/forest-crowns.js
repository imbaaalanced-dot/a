/* TD2 Kirchende: repeatable multi-layer foliage, cached per crown variant. */
(()=>{'use strict';
const crowns=[];
function rnd(seed){return ()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);}
function circle(c,x,y,r,color){c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fillStyle=color;c.fill();}
function create(index){
 const c=document.createElement('canvas');c.width=c.height=256;
 const q=c.getContext('2d'),r=rnd(7823+index*491);
 const shade=q.createRadialGradient(128,130,18,128,130,117);
 shade.addColorStop(0,'#13251b');shade.addColorStop(.65,'#1d3926');shade.addColorStop(1,'#10291b00');
 circle(q,128,130,116,shade);
 const mass=['#27442b','#2e4b2f','#3c5633','#49683b','#1b3929'];
 for(let i=0;i<115;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*87;circle(q,128+Math.cos(a)*d,128+Math.sin(a)*d*.85,10+r()*17,mass[Math.floor(r()*mass.length)]);}
 const leaf=['#426e3d','#537c45','#789052','#264a32','#9a9c62','#385a37'];
 for(let i=0;i<1350;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*94,x=128+Math.cos(a)*d,y=128+Math.sin(a)*d*.83;
  if((x-128)**2+((y-128)*1.2)**2>99**2)continue;
  q.fillStyle=leaf[Math.floor(r()*leaf.length)];q.beginPath();q.ellipse(x,y,1.2+r()*3.6,1+r()*2.4,r()*3,0,Math.PI*2);q.fill();
 }
 return c;
}
function drawCrown(ctx,x,y,r,number){
 const index=number%5;const sprite=crowns[index]||(crowns[index]=create(index));
 const d=r*2.32;ctx.drawImage(sprite,x-d/2,y-35-d/2,d,d);return true;
}
globalThis.DenkmalForest={drawCrown};
})();