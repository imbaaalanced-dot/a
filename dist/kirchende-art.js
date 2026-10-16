/* Kirchende scenery and sprites. Nothing is loaded before selecting Level 3. */
(() => {
  'use strict';
  const assets={monument:'monument-photo-v2.webp'};for(const key of ['rootrunner','stoneguard','mistcaller','uprooted'])assets[key]=key+'.webp';
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
    // STYLE 2: weathered joints, edge moss, and subtle canopy light on the stone plaza.
    // Keep the monument's center clear and bake all details into this cached 384px canvas.
    q.save();q.beginPath();q.rect(-140,-100,280,232);q.clip();
    for(let i=0;i<58;i++){
      const x=-133+random()*265,y=-94+random()*220;
      if(Math.abs(x)<65&&y>-78&&y<75)continue;
      q.strokeStyle=i%3===0?'#c9c0a535':'#323c354f';
      q.lineWidth=.6+random()*1.2;q.beginPath();q.moveTo(x,y);
      q.lineTo(x+4+random()*10,y+1+random()*5);
      if(i%3===0)q.lineTo(x+8+random()*13,y+5+random()*9);
      q.stroke();
    }
    for(let i=0;i<170;i++){
      const x=-136+random()*273,y=-97+random()*223;
      if(Math.abs(x)<97&&y>-77&&y<72)continue;
      q.fillStyle=['#4a62465b','#66784f70','#a18a5e68','#ad986753'][i%4];
      q.beginPath();q.ellipse(x,y,1+random()*4,.7+random()*2,random()*Math.PI,0,Math.PI*2);q.fill();
    }
    const dapple=q.createRadialGradient(-115,-90,6,-115,-90,186);
    dapple.addColorStop(0,'#f1bd7522');
    dapple.addColorStop(.55,'#cfa5650c');
    dapple.addColorStop(1,'#f1bd7500');
    q.fillStyle=dapple;q.fillRect(-140,-100,280,232);
    // Shaded outer joints give the paved center more depth without obscuring towers.
    const shade=q.createLinearGradient(-140,-100,140,132);
    shade.addColorStop(0,'#18251d2a');shade.addColorStop(.45,'#1b241b00');
    shade.addColorStop(1,'#1b251c24');
    q.fillStyle=shade;q.fillRect(-140,-100,280,232);
    q.restore();
    return c;
  }
  function drawSite(ctx,center){if(!site)site=createSite();ctx.drawImage(site,center.x-192,center.y-144);}
  // Three small, deterministic root-and-leaf decals; each is cached once and reused.
  // Decoration is visual only: no changes to navigation, cover or enemy collisions.
  const rootPatches=[];
  function rootPatch(variant){
    if(rootPatches[variant])return rootPatches[variant];
    const canvas=document.createElement('canvas');canvas.width=192;canvas.height=112;
    const g=canvas.getContext('2d'),r=(()=>{
      let seed=2107+variant*913;return ()=>((seed=(Math.imul(1664525,seed)+1013904223)>>>0)/4294967296);
    })();
    const shadow=g.createRadialGradient(96,64,2,96,64,91);
    shadow.addColorStop(0,'#15201971');shadow.addColorStop(.6,'#2631242f');
    shadow.addColorStop(1,'#26312400');
    g.fillStyle=shadow;g.fillRect(0,0,192,112);
    for(let i=0;i<75;i++){
      const x=18+r()*158,y=22+r()*70;
      // A few low-contrast leaves and moss clumps at the tree foot.
      g.fillStyle=['#6d744151','#a08a5b65','#4e614951','#8064475a'][i%4];
      g.beginPath();g.ellipse(x,y,1.5+r()*5,.6+r()*2.6,r()*Math.PI,0,Math.PI*2);g.fill();
    }
    rootPatches[variant]=canvas;
    return canvas;
  }
  function bench(ctx,x,y,angle){
    ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.fillStyle='#28342e55';ctx.fillRect(-9,-33,25,76);
    ctx.fillStyle='#3f463b';for(const y of [-23,24])ctx.fillRect(-6,y,20,5);
    for(let i=0;i<3;i++){ctx.fillStyle=i===0?'#9b7964':'#796153';ctx.fillRect(-6+i*5,-32,4,67);}
    ctx.fillStyle='#b495772f';ctx.fillRect(-6,-31,1,64);ctx.restore();
  }
  const buildingCache=new Map();
  function building(ctx,x,y,w,h,halfTimber=false){
    const key=w+':'+h+':'+halfTimber;
    let sprite=buildingCache.get(key);
    if(!sprite){
      sprite=document.createElement('canvas');sprite.width=w+80;sprite.height=h+80;
      const q=sprite.getContext('2d');q.translate(30,30);
      const polygon=(points,fill,stroke)=>{
        q.beginPath();points.forEach(([xx,yy],i)=>i?q.lineTo(xx,yy):q.moveTo(xx,yy));q.closePath();
        q.fillStyle=fill;q.fill();if(stroke){q.strokeStyle=stroke;q.lineWidth=2;q.stroke();}
      };
      // All roof, facade and contact shading are baked once; original world bounds stay fixed.
      q.fillStyle='#0b1c2466';q.beginPath();q.ellipse(w*.57,h*.94,w*.65,20,-.1,0,Math.PI*2);q.fill();
      const wallTop=h*.36,side=22;
      const wall=q.createLinearGradient(0,wallTop,w,h);
      wall.addColorStop(0,halfTimber?'#b1a38a':'#9d9981');wall.addColorStop(1,'#6c7364');
      q.fillStyle=wall;q.fillRect(0,wallTop,w-side,h-wallTop-9);
      polygon([[w-side,wallTop],[w,wallTop-18],[w,h-27],[w-side,h-9]],'#535f54','#3d4942');
      // Small, low-contrast masonry courses replace the plain rectangular facade.
      q.strokeStyle='#d3c6a527';q.lineWidth=1;
      for(let row=wallTop+13;row<h-14;row+=15){
        q.beginPath();q.moveTo(2,row);q.lineTo(w-side-2,row);q.stroke();
        for(let col=8+(Math.floor(row/15)%2)*13;col<w-side-4;col+=27){q.beginPath();q.moveTo(col,row);q.lineTo(col,row+12);q.stroke();}
      }
      const roof=q.createLinearGradient(0,0,w,wallTop+15);
      roof.addColorStop(0,'#667375');roof.addColorStop(.48,'#414f55');roof.addColorStop(1,'#263b46');
      polygon([[-9,wallTop+6],[w*.30,0],[w+8,7],[w-side+9,wallTop+6]],roof,'#253740');
      // Tile strokes are clipped to the pitched roof, avoiding facade overpaint.
      q.save();q.beginPath();q.moveTo(-9,wallTop+6);q.lineTo(w*.30,0);q.lineTo(w+8,7);q.lineTo(w-side+9,wallTop+6);q.closePath();q.clip();
      for(let yy=10;yy<wallTop+6;yy+=10){
        q.strokeStyle=yy%20?'#b0b7ab28':'#182b354d';q.lineWidth=2;q.beginPath();q.moveTo(-9,yy);q.lineTo(w+8,yy+5);q.stroke();
        for(let xx=(yy%20?4:13);xx<w;xx+=21){q.strokeStyle='#172d3544';q.lineWidth=1;q.beginPath();q.moveTo(xx,yy);q.lineTo(xx-4,yy+10);q.stroke();}
      }
      q.restore();q.strokeStyle='#c1c0a66b';q.lineWidth=3;q.beginPath();q.moveTo(w*.30,0);q.lineTo(w+8,7);q.stroke();
      q.fillStyle='#5d655b';q.fillRect(w*.67,9,17,30);q.fillStyle='#b8b092';q.fillRect(w*.67-2,7,21,5);
      // Recessed windows share the same cool shadow and warm upper-left lighting.
      let index=0;
      for(let yy=wallTop+24;yy<h-45;yy+=49)for(let xx=17;xx<w-side-24;xx+=42){
        q.fillStyle='#c1b79b';q.fillRect(xx-3,yy-3,24,31);q.fillStyle='#253e41';q.fillRect(xx,yy,18,25);
        if(index++%5===1){q.fillStyle='#d2a75a88';q.fillRect(xx+2,yy+2,14,21);}
        q.fillStyle='#52685f';q.fillRect(xx+8,yy,2,25);q.fillRect(xx,yy+11,18,2);
        q.fillStyle='#b1a98b';q.fillRect(xx-4,yy+26,26,3);
      }
      if(halfTimber){
        q.strokeStyle='#514e3e';q.lineWidth=5;q.beginPath();
        q.moveTo(3,wallTop+10);q.lineTo(3,h-10);q.moveTo(w-side-3,wallTop+10);q.lineTo(w-side-3,h-10);
        q.moveTo((w-side)/2,wallTop+9);q.lineTo((w-side)/2,h-10);
        q.moveTo(0,h*.68);q.lineTo(w-side,h*.68);q.stroke();
      }
      q.fillStyle='#4c5749';q.fillRect(-3,h-18,w-side+6,12);
      q.fillStyle='#a49d8177';q.fillRect(-3,h-18,w-side+6,2);
      buildingCache.set(key,sprite);
    }
    ctx.drawImage(sprite,x-30,y-30);
  }
  function drawScenery(ctx,center,actors,{crowns=false,low=false}={}){
    ctx.save();ctx.translate(center.x,center.y);
    if(!crowns){
      // Village-edge hints remain outside the clearing, partly screened by vegetation.
      building(ctx,-790,-430,185,205,true);building(ctx,590,-475,230,300);
      ctx.fillStyle='#77786b';ctx.fillRect(-820,700,1640,86);ctx.fillStyle='#a5a28a';ctx.fillRect(-820,700,1640,4);
      bench(ctx,-90,435,-.05);bench(ctx,105,435,.05);
      // Root decals sit below the tree trunks and below subsequently rendered routes.
      for(let i=0;i<trees.length;i++){
        const [x,y]=trees[i];ctx.drawImage(rootPatch(i%3),x-96,y-48);
      }
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
