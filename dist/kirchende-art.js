/* Kirchende scenery and sprites. Nothing is loaded before selecting Level 3. */
(() => {
  'use strict';
  const assets={monument:'monument-v1.png'};for(const key of ['rootrunner','stoneguard','mistcaller','uprooted','thorn1','thorn2','thorn3','lantern1','lantern2','lantern3'])assets[key]=key+'.webp';
  const images={};let loading=null;
  function load(enabled=true){
    if(!enabled)return Promise.resolve([]);if(loading)return loading;
    loading=Promise.all(Object.entries(assets).map(([key,file])=>new Promise(resolve=>{const img=new Image();images[key]=img;const timer=setTimeout(()=>resolve(false),3500);img.onload=()=>{clearTimeout(timer);resolve(true);};img.onerror=()=>{clearTimeout(timer);resolve(false);};img.src='assets/kirchende/'+file+'?v=v400a1';})));return loading;
  }
  function draw(ctx,key,x,y,height,{face=1,opacity=1}={}){
    const img=images[key];if(!img?.complete||!img.naturalWidth)return false;
    const sw=img.naturalWidth,sh=img.naturalHeight,sx=0,sy=0;
    const width=height*sw/sh;ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.globalAlpha*=opacity;ctx.drawImage(img,sx,sy,sw,sh,-width/2,12-height,width,height);ctx.restore();return true;
  }
  function crownOpacity(tree,actors){return actors.some(a=>Math.hypot(a.x-tree.x,a.y-tree.y)<tree.r+25)?.25:1;}
  const trees=[[-510,-490,100],[-130,-510,110],[80,-480,100],[270,-370,90],[-530,-210,92],[-120,-80,72],[320,-30,92],[-510,210,90],[410,180,90],[-180,410,72],[-540,420,90],[450,410,78]];
  function drawScenery(ctx,center,actors,{crowns=false,low=false}={}){
    ctx.save();ctx.translate(center.x,center.y);
    if(!crowns){
      ctx.fillStyle='#41443a';ctx.fillRect(-820,430,1640,100);ctx.strokeStyle='#c2bb9755';ctx.lineWidth=5;ctx.strokeRect(-820,430,1640,100);
      // Reference buildings are context at the boundary, outside the defended clearing.
      for(const [x,y,w,h] of [[-800,-350,185,240],[510,-370,200,145],[520,-90,200,230],[290,610,250,160],[-400,630,180,150]]){ctx.fillStyle='#756d60';ctx.fillRect(x,y,w,h);ctx.fillStyle='#423d39';ctx.fillRect(x+8,y+8,w-16,h-16);ctx.strokeStyle='#998879';ctx.strokeRect(x,y,w,h);}
      ctx.strokeStyle='#716e54';ctx.lineWidth=9;ctx.strokeRect(-100,-55,200,135);
      for(const [x,y] of [[-130,95],[140,-130]]){ctx.fillStyle='#8c6750';ctx.fillRect(x-28,y-6,56,12);ctx.fillStyle='#393b34';ctx.fillRect(x-22,y+6,5,8);ctx.fillRect(x+17,y+6,5,8);}
      for(const [x,y,r] of trees){ctx.fillStyle='#3e382e';ctx.fillRect(x-8,y-20,16,32);}
    }else trees.forEach(([x,y,r],i)=>{const world={x:x+center.x,y:y+center.y,r};ctx.globalAlpha=crownOpacity(world,actors);if(!globalThis.DenkmalForest?.drawCrown(ctx,x,y,r,i)){ctx.fillStyle='#273d29';ctx.beginPath();ctx.arc(x,y-35,r,0,7);ctx.fill();}});
    ctx.restore();
  }
  function drawCracks(ctx,m){if(m.hp/m.maxHp>.66)return;ctx.save();ctx.translate(m.x,m.y);ctx.strokeStyle=m.hp/m.maxHp<=.33?'#db8b5555':'#34261b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,-130);ctx.lineTo(8,-105);ctx.lineTo(-3,-82);ctx.lineTo(16,-55);if(m.hp/m.maxHp<=.33){ctx.moveTo(28,-110);ctx.lineTo(10,-75);ctx.lineTo(22,-40);}ctx.stroke();ctx.restore();}
  globalThis.KirchendeArt={load,draw,drawScenery,drawCracks,crownOpacity};
})();
