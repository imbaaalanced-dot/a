/* TD2 Alpha.5: cached forest, stone paths and consistent star ratings. */
(()=>{'use strict';
let grass,grassPattern;let road,roadPattern;
function rng(s){return ()=>((s=(Math.imul(1664525,s)+1013904223)>>>0)/4294967296);}
function texture(kind){const size=kind==='grass'?512:256,c=document.createElement('canvas');c.width=c.height=size;
const g=c.getContext('2d'),r=rng(kind==='grass'?164701:9821);g.fillStyle=kind==='grass'?'#394b34':'#54584f';g.fillRect(0,0,size,size);
const palette=kind==='grass'?['#25402d88','#607e5188','#99865c55','#182e2488','#8a9d7a77']:['#252d2a88','#89928355','#b6a17c44'];
if(kind==='grass')for(let i=0;i<120;i++){let x=r()*size,y=r()*size;g.fillStyle=palette[i%palette.length];g.beginPath();g.ellipse(x,y,12+r()*40,6+r()*23,r()*3,0,7);g.fill();}
for(let i=0;i<(kind==='grass'?8500:3200);i++){g.fillStyle=palette[i%palette.length];g.fillRect(r()*size,r()*size,1+r()*3,1+r()*2);}
if(kind==='grass')for(let i=0;i<1500;i++){let x=r()*size,y=r()*size;g.strokeStyle='#87a06a70';g.beginPath();g.moveTo(x-2,y-3);g.lineTo(x,y);g.lineTo(x+2,y-4);g.stroke();}
return c;}
function drawGround(ctx,x,y,w,h){if(!grass)grass=texture('grass');if(!grassPattern)grassPattern=ctx.createPattern(grass,'repeat');ctx.save();ctx.fillStyle=grassPattern||'#394b34';ctx.fillRect(x,y,w,h);ctx.restore();}
function drawRoad(ctx,path){if(!path||path.length<2)return;if(!road)road=texture('road');if(!roadPattern)roadPattern=ctx.createPattern(road,'repeat');
ctx.save();ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
for(const [width,color] of [[110,'#101a1588'],[99,'#818070'],[89,'#292f2a'],[80,'#545a51'],[76,roadPattern||'#545a51']]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();}
ctx.setLineDash([13,29]);ctx.strokeStyle='#d2b87b88';ctx.lineWidth=2.5;ctx.stroke();ctx.restore();}
function drawStars(ctx,x,y,level,low=false){const n=Math.max(1,Math.min(3,Math.floor(level||1)));ctx.save();ctx.lineJoin='round';ctx.lineWidth=1.6;
for(let i=0;i<n;i++){const sx=x+(i-(n-1)/2)*29,sy=y+47;ctx.beginPath();
for(let j=0;j<10;j++){let a=j*Math.PI/5-Math.PI/2,d=j%2?5.5:12.4,px=sx+Math.cos(a)*d,py=sy+Math.sin(a)*d;if(j)ctx.lineTo(px,py);else ctx.moveTo(px,py);}
ctx.closePath();ctx.shadowBlur=low?0:7;ctx.shadowColor='#f1ae42';ctx.fillStyle='#ffcf51';ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle='#543c21';ctx.stroke();}
ctx.restore();}
globalThis.DenkmalTerrain={drawGround,drawRoad,drawStars};
})();