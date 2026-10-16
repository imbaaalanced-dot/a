/* Cached ground markers. Gameplay ownership, build rules and placement stay in game.js. */
(()=>{'use strict';
const cache=new Map();
function ring(g,r,color,width){g.strokeStyle=color;g.lineWidth=width;g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.stroke();}
function disc(g,r,color){g.fillStyle=color;g.beginPath();g.arc(0,0,r,0,Math.PI*2);g.fill();}
function bitmap(kind,active=false){
 const key=kind+active;if(cache.has(key))return cache.get(key);
 const c=document.createElement('canvas');c.width=c.height=96;const q=c.getContext('2d');q.translate(48,48);
 const r=kind==='pad'?25:35;
 q.save();q.translate(3,5);disc(q,r+4,'#101e2466');q.restore();
 const stone=q.createLinearGradient(-r,-r,r,r);stone.addColorStop(0,'#777d68');stone.addColorStop(.5,'#48594a');stone.addColorStop(1,'#293c35');
 disc(q,r+2,stone);ring(q,r,'#b4a278',2);disc(q,r-4,'#1a3029');ring(q,r-6,'#6c795b88',1);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;q.save();q.rotate(a);q.strokeStyle='#1b332d';q.lineWidth=2;q.beginPath();q.moveTo(r-4,0);q.lineTo(r+2,0);q.stroke();q.restore();
 }
 if(kind==='pad'){
  for(let i=0;i<4;i++){q.save();q.rotate(i*Math.PI/2);q.fillStyle='#cfb57a';q.fillRect(-2,-r-2,4,5);q.restore();}
  q.strokeStyle='#d8c38c';q.lineWidth=2.2;q.lineCap='round';q.beginPath();q.moveTo(-5,0);q.lineTo(5,0);q.moveTo(0,-5);q.lineTo(0,5);q.stroke();
 }else{ring(q,r-1,active?'#e9b65e':'#889478',active?3:1);}
 cache.set(key,c);return c;
}
function drawPad(ctx,p){ctx.drawImage(bitmap('pad'),p.x-48,p.y-48);return true;}
function drawGate(ctx,p,next,active=false){
 ctx.drawImage(bitmap('gate',active),p.x-48,p.y-48);
 ctx.save();try{ctx.translate(p.x,p.y);ctx.rotate(Math.atan2(next.y-p.y,next.x-p.x));ctx.fillStyle=active?'#f0cd86':'#b4b99b';ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-6,-7);ctx.lineTo(-2,0);ctx.lineTo(-6,7);ctx.closePath();ctx.fill();}finally{ctx.restore();}return true;
}
function drawPreview(ctx,p,paintGhost){
 if(!p)return false;ctx.save();try{
  ctx.translate(p.x,p.y);const ok=p.valid&&p.affordable,color=ok?p.color:'#d88474';
  ctx.globalAlpha=ok?.075:.045;disc(ctx,p.range,color);
  ctx.globalAlpha=.75;ring(ctx,p.range,color,1.5);
  ctx.setLineDash([5,9]);ring(ctx,p.range-5,color,.8);ctx.setLineDash([]);
  ctx.globalAlpha=1;ring(ctx,31,ok?'#e6ce94':'#df9481',2);
  ctx.globalAlpha=ok?.48:.25;
  const painted=paintGhost?.()===true;
  if(!painted){ctx.globalAlpha=.9;ctx.fillStyle=color;ctx.font='700 18px sans-serif';ctx.textAlign='center';ctx.fillText(p.icon,0,6);}
  ctx.globalAlpha=.95;ctx.fillStyle='#101e20e8';ctx.fillRect(-78,63,156,20);
  ctx.fillStyle=ok?'#efdbad':'#efb2a4';ctx.textAlign='center';ctx.font='700 10px sans-serif';
  ctx.fillText((ok?p.role:'NICHT BAUBAR')+' · '+p.cost+' E',0,77);
 }finally{ctx.restore();}return true;
}
globalThis.Style2Markers={drawPad,drawGate,drawPreview};
})();
