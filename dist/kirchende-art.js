/* Kirchende scenery and sprites. Nothing is loaded before selecting Level 3. */
(() => {
  'use strict';
  // Opt-in artwork pilot: preserves the verified photographic sprite by default.
  const pilot=/(?:^|[?&])td2KirchendeMemorialPilot=1(?:&|$)/.test(globalThis.location?.search||'');
  const assets={monument:pilot?'monument-style2-pilot.webp':'monument-photo-v2.webp',environment:'environment-atlas-style2-v1.webp'};
  // The opt-in plaque WebP shows unverified candles and has fringe artifacts.
  // Retain the file for later review but never request it in the game.
  // The neutral, photo-positioned stone below is baked into the cached site.
  for(const key of ['rootrunner','stoneguard','mistcaller','uprooted'])assets[key]=key+'.webp';
  const images={},pending={};let loading=null,environmentLoading=null;
  function ready(key){return !!(images[key]?.complete&&images[key].naturalWidth);}
  function loadOne(key){
    if(!assets[key])return Promise.resolve(false);
    if(ready(key))return Promise.resolve(true);
    if(pending[key])return pending[key];
    pending[key]=new Promise(resolve=>{
      const img=new Image();images[key]=img;let settled=false;
      const finish=ok=>{if(settled)return;settled=true;clearTimeout(timer);if(!ok)delete pending[key];resolve(ok);};
      const timer=setTimeout(()=>finish(false),8000);
      img.onload=()=>finish(true);img.onerror=()=>finish(false);img.decoding='async';
      const version=key==='monument'?(assets.monument==='monument-photo-v2.webp'?'v400a5photo2':'kirchende-memorial-pilot2'):key==='environment'?'kirchende-pilot2':'v400a1';
      img.src='assets/kirchende/'+assets[key]+'?v='+version;
      if(img.complete&&img.naturalWidth)finish(true);
    });
    return pending[key];
  }
  function loadEnvironment(){
    if(ready('environment'))return Promise.resolve(true);
    if(environmentLoading)return environmentLoading;
    environmentLoading=loadOne('environment').then(async ok=>{
      if(ok)await globalThis.DenkmalTerrain?.load?.();
      else environmentLoading=null;
      return ok;
    });
    return environmentLoading;
  }
  function load(enabled=true){
    if(!enabled)return Promise.resolve([]);if(loading)return loading;
    loading=Promise.all(Object.keys(assets).map(loadOne)).then(async results=>{
      // An optional preview must never block Level 3 if its art is missing.
      // Fetch the original image only after a pilot failure: avoid double decode.
      if(pilot&&!ready('monument')&&assets.monument!=='monument-photo-v2.webp'){
        assets.monument='monument-photo-v2.webp';
        results[0]=await loadOne('monument');
      }
      if(results.some(ok=>!ok))loading=null;
      await globalThis.DenkmalTerrain?.load?.();
      return results;
    });
    return loading;
  }
  function draw(ctx,key,x,y,height,{face=1,opacity=1}={}){
    const img=images[key];if(!img?.complete||!img.naturalWidth)return false;
    const sw=img.naturalWidth,sh=img.naturalHeight,sx=0,sy=0;
    const width=height*sw/sh;ctx.save();ctx.translate(x,y);ctx.scale(face,1);ctx.globalAlpha*=opacity;ctx.drawImage(img,sx,sy,sw,sh,-width/2,12-height,width,height);ctx.restore();return true;
  }
  // Most enemies are nowhere near a crown. Reject those on the cheap x/y
  // bounds before calling hypot; the circular boundary stays exactly the same.
  function nearCrown(actor,tree,r){
    const dx=actor.x-tree.x,dy=actor.y-tree.y;
    return Math.abs(dx)<r&&Math.abs(dy)<r&&Math.hypot(dx,dy)<r;
  }
  function crownOpacity(tree,actors,shielded){
    if(shielded?.some(a=>nearCrown(a,tree,tree.r+30)))return 0;
    return actors.some(a=>nearCrown(a,tree,tree.r+25))?.25:1;
  }
  // Photo-derived atmosphere, not a surveyed reconstruction. Gameplay coordinates stay separate.
  const trees=[[-660,-760,115],[-320,-735,118],[40,-750,108],[510,-695,111],[-510,-490,108],[-160,-480,110],[150,-450,102],[380,-290,96],[-510,-160,98],[-210,35,88],[260,35,96],[-500,260,100],[450,235,106],[-480,350,92],[560,350,94]];
  const shrubs=[[-90,195,45],[-95,260,45],[-95,325,45],[95,195,32],[95,255,32],[95,315,32],[-555,-310,65],[-360,-505,72],[360,-200,60],[520,-385,80],[-580,75,75],[535,90,75]];
  let site;
  function drawAtlas(ctx,index,x,y,size){
    const img=images.environment;if(!img?.complete||!img.naturalWidth)return false;
    const sw=img.naturalWidth/3,sh=img.naturalHeight/2,sx=(index%3)*sw,sy=Math.floor(index/3)*sh;
    ctx.drawImage(img,sx,sy,sw,sh,x-size/2,y-size,size,size);return true;
  }
  const props=[
    {kind:4,x:-665,y:-540,size:150},{kind:4,x:660,y:-570,size:142},
    {kind:3,x:-660,y:170,size:178},{kind:3,x:650,y:190,size:172},
    {kind:5,x:-430,y:-635,size:112},{kind:5,x:515,y:-500,size:105}
  ];
  function propIsClear(prop,center){
    const p={x:center.x+prop.x,y:center.y+prop.y};
    const layout=globalThis.DenkmalLevels?.levels?.[3];
    if(!layout)return true;
    if(layout.paths?.some(path=>globalThis.DenkmalLevels.pathDistance(p,path)<150))return false;
    if(layout.slots?.some(slot=>Math.hypot(p.x-slot.x,p.y-slot.y)<140))return false;
    const objective=globalThis.DenkmalLevels?.center||center;
    return Math.hypot(p.x-objective.x,p.y-objective.y)>275;
  }
  function createSite(){
    const c=document.createElement('canvas');c.width=c.height=384;const q=c.getContext('2d');q.translate(192,144);
    // Irregular, subdued stone enclosure. The former opaque 6x5 grid produced
    // a pale checkerboard visible beneath the 2.5D memorial artwork.
    q.save();q.beginPath();q.moveTo(-138,-81);
    q.lineTo(-121,-104);q.lineTo(110,-101);q.lineTo(139,-83);
    q.lineTo(143,90);q.lineTo(113,132);q.lineTo(-115,130);
    q.lineTo(-144,96);q.closePath();q.clip();
    const soil=q.createRadialGradient(0,0,20,0,0,198);
    soil.addColorStop(0,'#58604bba');soil.addColorStop(.7,'#42513e9c');soil.addColorStop(1,'#32413022');
    q.fillStyle=soil;q.fillRect(-150,-112,300,250);
    let flagSeed=1927;
    const flagRnd=()=>((flagSeed=(Math.imul(1664525,flagSeed)+1013904223)>>>0)/4294967296);
    const palette=['#777969','#818372','#696e62','#888575','#656f62'];
    for(let row=0;row<6;row++)for(let col=0;col<7;col++){
      const x=-141+col*42+(row%2)*16+(flagRnd()-.5)*10;
      const y=-103+row*40+(flagRnd()-.5)*8;
      const w=30+flagRnd()*9,h=28+flagRnd()*8;
      q.fillStyle=palette[(row*3+col)%palette.length];q.globalAlpha=.48+flagRnd()*.22;
      q.beginPath();q.moveTo(x+4,y);q.lineTo(x+w-5,y+2);
      q.lineTo(x+w,y+h-5);q.lineTo(x+w-4,y+h);
      q.lineTo(x+2,y+h-2);q.lineTo(x,y+5);q.closePath();q.fill();
    }
    q.globalAlpha=1;q.restore();
    // Low stone edging, worn joints and three shallow treads at the paved approach.
    q.strokeStyle=globalThis.TD2Style2Materials?.stone||'#999b7f';q.lineWidth=3;q.beginPath();q.moveTo(-138,-81);q.lineTo(-121,-104);q.lineTo(110,-101);q.lineTo(139,-83);q.lineTo(143,90);q.lineTo(113,132);q.lineTo(-115,130);q.lineTo(-144,96);q.closePath();q.stroke();
    for(let i=0;i<3;i++){
      q.fillStyle='#383e3388';q.fillRect(-44,138+i*11,128,11);
      q.fillStyle=['#929480','#868b75','#7b826d'][i];q.fillRect(-44,134+i*11,128,8);
      q.fillStyle='#d1cbb044';q.fillRect(-44,134+i*11,128,1);
    }
    // Single low, unlettered memorial slab, centered in front of the helmet.
    // Both pilot and default use this same once-cached stone. No fabricated
    // inscriptions, candles, or duplicate overlay textures.
    q.fillStyle='#313c3355';q.fillRect(-40,80,84,42);
    q.fillStyle='#6d7967';q.fillRect(-44,72,84,41);
    q.fillStyle='#a6ae94';q.fillRect(-44,69,84,35);
    q.strokeStyle='#ced1b24d';q.lineWidth=1;q.strokeRect(-42,71,80,31);
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
    dapple.addColorStop(0,globalThis.TD2Style2Materials?.warmLight||'#f1bd7522');
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
  function drawStreet(ctx){
    // User walk-through, 14 Nov: this memorial is across the road from the
    // churchyard. Share the road center with the actual approach lanes.
    // Dimensions remain gameplay approximations, not measured street widths.
    const street=globalThis.DenkmalLevels?.levels?.[3]?.street||{y:480,left:-820,right:820,width:98};
    const top=street.y-street.width/2,bottom=street.y+street.width/2;
    ctx.fillStyle='#242b2a';ctx.fillRect(street.left,top,street.right-street.left,street.width);
    ctx.fillStyle='#555b53';ctx.fillRect(street.left,top-4,street.right-street.left,8);
    ctx.fillStyle='#8e8c7a';ctx.fillRect(street.left,top-5,street.right-street.left,3);
    ctx.fillStyle='#50574e';ctx.fillRect(street.left,bottom-6,street.right-street.left,6);
    for(let i=0;i<30;i++){
      const x=-820+i*56;
      ctx.fillStyle=i%3===0?'#72786c':'#62695e';
      // Leave the axial entrance open: no wall across the stairs/access.
      if(x<90&&x+53>-50)continue;
      ctx.fillRect(x,top-39,53,26);ctx.fillRect(x+((i%2)*7),top-13,49,11);
      ctx.strokeStyle='#373f35';ctx.lineWidth=2;ctx.strokeRect(x,top-39,53,26);
    }
  }
  function drawSite(ctx,center){
    if(!site)site=createSite();
    // Paint after the lane textures, so earth does not overwrite the asphalt.
    ctx.save();ctx.translate(center.x,center.y);drawStreet(ctx);ctx.restore();
    ctx.drawImage(site,center.x-192,center.y-144);
    // The centered plaque is already baked into the site canvas. No second layer.
  }
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
    // Quiet branching roots tie each canopy into the mossy earth. The decal is
    // baked once per existing variant; no extra draw calls or gameplay geometry.
    for(let root=0;root<3;root++){
      const x=92+(root-1)*19+r()*11,tipX=x+(root-1)*32+(r()-.5)*31;
      g.strokeStyle=root===1?'#3440349c':'#403c2f89';
      g.lineWidth=3.5+root*.7;g.lineCap='round';
      g.beginPath();g.moveTo(x,45+r()*9);
      g.bezierCurveTo(x+(root-1)*8,63,tipX*.8+x*.2,70,tipX,82+r()*13);
      g.stroke();
      g.strokeStyle='#8990753f';g.lineWidth=1.2;
      g.beginPath();g.moveTo(x,48);g.quadraticCurveTo(tipX,68,tipX,80);g.stroke();
    }
    // Dark fern clusters around the root contact patch, away from the lane.
    for(let tuft=0;tuft<9;tuft++){
      const x=22+r()*148,y=48+r()*45;
      g.strokeStyle=['#3e604477','#61734b77','#78805266'][tuft%3];
      g.lineWidth=1.5;g.beginPath();g.moveTo(x,y+5);
      g.quadraticCurveTo(x-6-r()*5,y-5,x-8-r()*7,y-8-r()*6);g.stroke();
      g.beginPath();g.moveTo(x,y+5);
      g.quadraticCurveTo(x+4+r()*7,y-4,x+7+r()*9,y-8-r()*7);g.stroke();
    }
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
  // Visual sprite bounds only: houses do not add navigation or collision geometry.
  const buildings=Object.freeze([
    Object.freeze({x:-790,y:-430,width:185,height:205,halfTimber:true}),
    Object.freeze({x:590,y:-475,width:230,height:300,halfTimber:false})
  ]);
  const buildingFootprints=Object.freeze(buildings.map(b=>Object.freeze({left:b.x-30,top:b.y-30,right:b.x+b.width+50,bottom:b.y+b.height+50})));
  function groundDecorationClear(x,y,r,center){
    return buildingFootprints.every(f=>x+r<center.x+f.left||x-r>center.x+f.right||y+r<center.y+f.top||y-r>center.y+f.bottom);
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
      // Roof overhang and recessed entry give the facade depth at game scale.
      q.fillStyle='#162b2a55';q.fillRect(0,wallTop+7,w-side,7);
      const doorX=Math.round((w-side)*.52),doorY=h-54;
      q.fillStyle='#a49c82';q.fillRect(doorX-4,doorY-4,32,43);
      q.fillStyle='#26372f';q.fillRect(doorX,doorY,24,39);
      q.strokeStyle='#665e46';q.lineWidth=2;q.beginPath();
      for(let plank=6;plank<24;plank+=6){q.moveTo(doorX+plank,doorY+2);q.lineTo(doorX+plank,h-18);}q.stroke();
      q.fillStyle='#baa373';q.fillRect(doorX+18,doorY+22,3,3);
      q.fillStyle='#4c5749';q.fillRect(-3,h-18,w-side+6,12);
      q.fillStyle='#a49d8177';q.fillRect(-3,h-18,w-side+6,2);
      // Low stone steps and moss join the original foundation to the soil.
      q.fillStyle='#3b463a';q.fillRect(doorX-9,h-7,42,6);
      q.fillStyle='#8d8c72';q.fillRect(doorX-6,h-10,36,5);
      q.fillStyle='#b3ab8d77';q.fillRect(doorX-6,h-10,36,1);
      for(let patch=0;patch<7;patch++){
        const mx=8+patch*(w-side-12)/7;
        q.fillStyle=patch%2?'#627b4555':'#425c3e88';q.beginPath();
        q.ellipse(mx,h-6+(patch%3),12+(patch%2)*5,4,0,0,Math.PI*2);q.fill();
      }
      buildingCache.set(key,sprite);
    }
    ctx.drawImage(sprite,x-30,y-30);
  }
  function drawScenery(ctx,center,actors,{crowns=false,low=false,shielded=null}={}){
    ctx.save();ctx.translate(center.x,center.y);
    if(!crowns){
      // Village-edge hints remain outside the clearing, partly screened by vegetation.
      for(const b of buildings)building(ctx,b.x,b.y,b.width,b.height,b.halfTimber);
      bench(ctx,-155,350,-.05);bench(ctx,180,350,.05);
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
      // Low decorative ruins, stones and lanterns stay outside authored paths/pads.
      for(const prop of props)if(propIsClear(prop,center))drawAtlas(ctx,prop.kind,prop.x,prop.y,prop.size);
    }else{
      shrubs.forEach(([x,y,r],i)=>{const world={x:x+center.x,y:y+center.y,r};ctx.globalAlpha=crownOpacity(world,actors,shielded);if(!drawAtlas(ctx,2,x,y,r*2.12))globalThis.DenkmalForest?.drawShrub(ctx,x,y,r,i);});
      trees.forEach(([x,y,r],i)=>{const world={x:x+center.x,y:y+center.y,r};ctx.globalAlpha=crownOpacity(world,actors,shielded);if(!drawAtlas(ctx,i%3===0?0:1,x,y-35,r*2.16)){if(!globalThis.DenkmalForest?.drawCrown(ctx,x,y,r,i)){ctx.fillStyle='#506241';ctx.beginPath();ctx.arc(x,y-35,r,0,7);ctx.fill();}}});
    }
    ctx.restore();
  }
  function drawCracks(ctx,m){if(m.hp/m.maxHp>.66)return;ctx.save();ctx.translate(m.x,m.y);ctx.strokeStyle=m.hp/m.maxHp<=.33?'#db8b5555':'#34261b';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,-130);ctx.lineTo(8,-105);ctx.lineTo(-3,-82);ctx.lineTo(16,-55);if(m.hp/m.maxHp<=.33){ctx.moveTo(28,-110);ctx.lineTo(10,-75);ctx.lineTo(22,-40);}ctx.stroke();ctx.restore();}
  globalThis.KirchendeArt={load,loadEnvironment,ready,image(key){return ready(key)?images[key]:null;},draw,drawScenery,drawSite,drawCracks,crownOpacity,buildingFootprints,groundDecorationClear};
})();
