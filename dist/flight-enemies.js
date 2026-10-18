/* Goethestraße enemy foundation. Existing campaign waves do not spawn these yet. */
(()=>{'use strict';
const specs={
 shadowwing:{hp:44,speed:94,damage:11,r:13,bounty:3,flying:true,focusMonument:true},
 gargoyle:{hp:138,speed:43,damage:24,r:19,bounty:5,armor:.25,flying:true,focusMonument:true},
 stormwing:{hp:88,speed:65,damage:17,r:16,bounty:4,flying:true,focusMonument:true}
};
const canHit=(attack,enemy)=>!enemy.flying||!!attack.heroShot||['bow','mage','rift','magic'].includes(attack.kind);
function advance(e,target,dt){
 const distance=Math.hypot(target.x-e.x,target.y-e.y),reach=e.r+target.r;
 const step=Math.min(Math.max(0,distance-reach),e.speed*(e.slow>0?(e.slowFactor||.58):1)*Math.max(0,dt));
 if(distance){e.x+=(target.x-e.x)/distance*step;e.y+=(target.y-e.y)/distance*step;}
 return distance-step<=reach+.5;
}
const sprites=new Map();
function sprite(type){
 if(!specs[type]||typeof Image==='undefined')return null;
 let entry=sprites.get(type);
 if(entry?.failed&&Date.now()>=entry.retryAt){sprites.delete(type);entry=null;}
 if(!entry){entry={img:new Image(),failed:false,retryAt:0};sprites.set(type,entry);entry.img.decoding='async';entry.img.onerror=()=>{entry.failed=true;entry.retryAt=Date.now()+5000;};entry.img.src='assets/elemental/'+type+'-v1.webp?v=flight2';}
 return !entry.failed&&entry.img.complete&&entry.img.naturalWidth>0?entry.img:null;
}
function draw(ctx,e,time=0,reduced=false){
 if(!e.flying)return false;
 const img=sprite(e.type);
 if(img){const size=e.type==='gargoyle'?100:e.type==='stormwing'?94:86,bob=reduced?0:Math.sin(time*4)*2;ctx.drawImage(img,e.x-size/2,e.y-12-size*.65+bob,size,size);return true;}
 const heavy=e.type==='gargoyle',storm=e.type==='stormwing',r=e.r;
 const flap=reduced?0:Math.sin(time*(heavy?5:9)+e.x*.02)*r*.35;
 ctx.save();try{ctx.translate(e.x,e.y-12);ctx.lineJoin='round';ctx.lineWidth=2;
 for(const side of [-1,1]){ctx.save();ctx.scale(side,1);ctx.fillStyle=heavy?'#73796b':storm?'#526b81':'#38475a';ctx.strokeStyle=heavy?'#aba68b':'#88b7c0';ctx.beginPath();ctx.moveTo(2,-6);ctx.lineTo(r*2.1,-r*.9+flap);ctx.lineTo(r*1.7,5+flap);ctx.lineTo(r,1);ctx.lineTo(r*.6,9);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
 ctx.fillStyle=heavy?'#505b50':'#273d4b';ctx.beginPath();ctx.ellipse(0,0,r*.55,r*.9,0,0,Math.PI*2);ctx.fill();ctx.fillStyle=heavy?'#d1ba75':'#a5e3e5';ctx.fillRect(-5,-7,3,3);ctx.fillRect(2,-7,3,3);
 }finally{ctx.restore();}return true;
}
globalThis.FlightEnemies={specs,canHit,advance,draw};})();
