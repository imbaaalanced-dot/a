/* Kirchende scenery and sprites. Nothing is loaded before selecting Level 3. */
(() => {
  'use strict';
  const assets={monument:'monument-photo-v2.webp'};for(const key of ['rootrunner','stoneguard','mistcaller','uprooted','thorn1','thorn2','thorn3','lantern1','lantern2','lantern3'])assets[key]=key+'.webp';
  const images={};let loading=null;
  function ready(key){return !!(images[key]?.complete&&images[key].naturalWidth);}
  function load(enabled=true){
    if(!enabled)return Promise.resolve([]);if(loading)return loading;
    loading=Promise.all(Object.entries(assets).map(([key,file])=>{
      if(ready(key))return Promise.resolve(true);
      return new Promise(resolve=>{
        const img=new Image();images[key]=img;let settled=false;
        const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);resolve(ok);};
        const timer=setTimeout(()=>finish(false),8000);
        img.onload=()=>finish(true);img.onerror=()=>finish(false);img.decoding='async';
        img.src='assets/kirchende/'+file+'?v='+(key==='monument'?'v400a5photo2':'v400a1');
        if(img.complete&&img.naturalWidth)finish(true);
      });
    })).then(results=>{if(results.some(ok=>!ok))loading=null;return results;});
    return loading;
  }
  function draw(ctx,key,x,y,height,{face=1,opacity=1}={}){
    const img=images[key];if(!img?.complete||!img.naturalWidth)return false;
    const sw=img.naturalWidth,sh=img.naturalHeight,sx=0,sy=0;
    const width=height*sw/sh;ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.globalAlpha*=opacity;ctx.drawImage(img,sx,sy,sw,sh,-width/2,12-height,width,height);ctx.restore();return true;
  }
  function crownOpacity(tree,actors){return actors.some(a=>Math.hypot(a.x-tree.x,a.y-tree.y)<tree.r+25)?.25:1;}
  // Photo-derived atmosphere, not a surveyed reconstruction. Gameplay coordinates stay separate.
  const trees=[[-510,-490,108],[-160,-480,110],[150,-450,102],[380,-290,96],[-510,-160,98],[-210,35,88],[260,35,96],[-500,260,100],[450,235,106],[-480,480,92],[460,500,94]];
  const shrubs=[[-90,195,45],[-95,260,45],[-95,325,45],[95,195,32],[95,255,32],[95,315,32],[-555,-310,65],[-360,-505,72],[360,-200,60],[520,-385,80],[-580,75,75],[535,90,75]];
  let site;
  function createSite(){
    const c=document.createElement('canvas');c.width=c.height=384;const q=c.getContext('2d');q.translate(192,144);
    q.fillStyle='#252d2440';q.fillRect(-145,-94,290,235);
    q.fillStyle='#59664b';q.fillRect(-142,-101,284,234);
    for(let row=0;row<5;row++)for(let col=0;col<6;col++){
      const x=-136+col*45,y=-96+row*44;
      q.fillStyle=['#7e8070','#868575','#747b6b','#8e8b77'][(row*5+col*3)%4];q.fillRect(x,y,43,42);
      q.fillStyle='#c5bfa129';q.fillRect(x+1,y+1,41,1);
      q.strokeStyle='#525c463f';q.lineWidth=1;q.beginPath();q.moveTo(x+5,y+16);q.lineTo(x+18,y+22);q.lineTo(x+16,y+33);q.stroke();
    }
    for(let i=0;i<2800;i++){const x=-136+(i*73%270),y=-96+(i*131%220);q.fillStyle=i%2?'#bbb18a1c':'#40523924';q.fillRect(x,y,1+i%3,1);}
    // Low stone edging, worn joints and three shallow treads at the paved approach.
    q.strokeStyle='#999b7f';q.lineWidth=3;q.strokeRect(-140,-100,280,232);
    for(let i=0;i<3;i++){
      q.fillStyle='#383e3388';q.fillRect(-44,138+i*11,128,11);
      q.fillStyle=['#929480','#868b75','#7b826d'][i];q.fillRect(-44,134+i*11,128,8);
      q.fillStyle='#d1cbb044';q.fillRect(-44,134+i*11,128,1);
    }
    // The separate, low memorial slab visible in the reference views.
    q.fillStyle='#313c3355';q.fillRect(-111,75,77,43);q.fillStyle='#6d7967';q.fillRect(-115,67,77,43);
    q.fillStyle='#a6ae94';q.fillRect(-115,64,77,38);q.strokeStyle='#ced1b24d';q.lineWidth=1;q.strokeRect(-113,66,73,34);
    // Fixed-seed leaf litter gathers around edges, not in an animated noise pass.
    let seed=1967;const random=()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
    for(let i=0;i<230;i++){
      const x=-140+random()*280,y=-100+random()*232;
      if(Math.abs(x)<92&&y>-60&&y<65)continue;
      q.fillStyle=['#7f6546','#9c7c54','#b29b70','#5c6040'][i%4];q.save();q.translate(x,y);q.rotate(random()*3);
      q.beginPath();q.ellipse(0,0,1+random()*3,.8+random()*1.4,0,0,7);q.fill();q.restore();
    }
    return c;
  }
  function drawSite(ctx,center){if(!site)site=createSite();ctx.drawImage(site,center.x-192,center.y-144);}
  function bench(ctx,x,y,angle){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#28342e55';ctx.fillRect(-9,-33,25,76);
    ctx.fillStyle='#3f463b';for(const y of [-23,24])ctx.fillRect(-6,y,20,5);
    for(let i=0;i<3;i++){ctx.fillStyle=i===0?'#9b7964':'#796153';ctx.fillRect(-6+i*5,-32,4,67);}
    ctx.fillStyle='#b495772f';ctx.fillRect(-6,-31,1,64);ctx.restore();
  }
  function building(ctx,x,y,w,h,halfTimber=false){
    ctx.fillStyle=halfTimber?'#b8b39a':'#b3aa8b';ctx.fillRect(x,y,w,h);
    ctx.fillStyle='#77796b';ctx.fillRect(x-7,y-13,w+14,31);
    for(let yy=y+36;yy<y+h-20;yy+=58)for(let xx=x+20;xx<x+w-15;xx+=46){ctx.fillStyle='#58635a';ctx.fillRect(xx,yy,19,29);ctx.fillStyle='#a6b9a34d';ctx.fillRect(xx+2,yy+2,6,23);}
    if(halfTimber){ctx.strokeStyle='#5a5546';ctx.lineWidth=5;ctx.strokeRect(x,y+18,w,h-18);ctx.beginPath();ctx.moveTo(x+w/2,y+18);ctx.lineTo(x+w/2,y+h);ctx.moveTo(x,y+h/2);ctx.lineTo(x+w,y+h/2);ctx.stroke();}
  }
  function drawScenery(ctx,center,actors,{crowns=false,low=false}={}){
    ctx.save();ctx.translate(center.x,center.y);
    if(!crowns){
      // Village-edge hints remain outside the clearing, partly screened by vegetation.
      building(ctx,-790,-430,185,205,true);building(ctx,590,-475,230,300);
      ctx.fillStyle='#77786b';ctx.fillRect(-820,700,1640,86);ctx.fillStyle='#a5a28a';ctx.fillRect(-820,700,1640,4);
      bench(ctx,-90,435,-.05);bench(ctx,105,435,.05);
      for(const [x,y,r] of trees){
        ctx.strokeStyle='#383f3170';ctx.lineWidth=13;ctx.beginPath();ctx.moveTo(x,y+9);ctx.lineTo(x+24,y+38);ctx.stroke();
        ctx.strokeStyle='#747568';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(x,y+9);ctx.lineTo(x-3,y-37);ctx.lineTo(x-20,y-72);ctx.stroke();
        ctx.strokeStyle='#4d5547';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(x,y-18);ctx.lineTo(x+20,y-58);ctx.stroke();
        ctx.strokeStyle='#68694d';ctx.lineWidth=3;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(x,y+9);ctx.lineTo(x-18+i*18,y+24+Math.abs(i-1)*5);ctx.stroke();}
      }
    }else{
      shrubs.forEach(([x,y,r],i)=>{const world={x:x+center.x,y:y+center.y,r};ctx.globalAlpha=crownOpacity(world,actors);globalThis.DenkmalForest?.drawShrub(ctx,x,y,r,i);});
      trees.forEach(([x,y,r],i)=>{const world={x:x+center.x,y:y+center.y,r};ctx.globalAlpha=crownOpacity(world,actors);if(!globalThis.DenkmalForest?.drawCrown(ctx,x,y,r,i)){ctx.fillStyle='#506241';ctx.beginPath();ctx.arc(x,y-35,r,0,7);ctx.fill();}});
    }
    ctx.restore();
  }
  function drawCracks(ctx,m){if(m.hp/m.maxHp>.66)return;ctx.save();ctx.translate(m.x,m.y);ctx.strokeStyle=m.hp/m.maxHp<=.33?'#db8b5555':'#34261b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,-130);ctx.lineTo(8,-105);ctx.lineTo(-3,-82);ctx.lineTo(16,-55);if(m.hp/m.maxHp<=.33){ctx.moveTo(28,-110);ctx.lineTo(10,-75);ctx.lineTo(22,-40);}ctx.stroke();ctx.restore();}
  globalThis.KirchendeArt={load,ready,draw,drawScenery,drawSite,drawCracks,crownOpacity};
})();
