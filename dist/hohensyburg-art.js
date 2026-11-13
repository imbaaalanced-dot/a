/* Present-day Kaiser-Wilhelm-Denkmal, Hohensyburg: historical silhouette in a cached, illustrative Style 2 landscape. */
(()=>{'use strict';
  const C={x:1536,y:1536},SIZE=3072;
  let ground=null,memorial=null,allocations=0,environmentRequested=false;
  const lampOffsets=[[-900,-260],[900,-310],[-890,550]];
  function environmentLamps(level){
    const terrace=level.syburgTerrace;
    return lampOffsets.map(([x,y])=>({x:C.x+x,y:C.y+y})).filter(p=>{
      if(Math.hypot(p.x-C.x,p.y-C.y)<320)return false;
      if(level.paths.some(path=>globalThis.DenkmalLevels.pathDistance(p,path)<155))return false;
      if(level.slots.some(slot=>Math.hypot(slot.x-p.x,slot.y-p.y)<155))return false;
      const x=p.x-C.x,y=p.y-C.y,r=terrace.raised,f=terrace.forecourt;
      if(x>r.left-95&&x<r.right+95&&y>r.top-95&&y<r.bottom+95)return false;
      if(terrace.stairs.some(s=>Math.abs(x-s.x)<s.width/2+105&&y>s.top-105&&y<s.bottom+105))return false;
      if(x>f.left-65&&x<f.right+65&&y>f.top-65&&y<f.bottom+65)return false;
      return true;
    });
  }
  function requestSharedEnvironment(){
    if(environmentRequested)return;
    const load=globalThis.KirchendeArt?.loadEnvironment;
    if(typeof load!=='function')return;
    environmentRequested=true;
    Promise.resolve(load.call(globalThis.KirchendeArt)).then(ok=>{
      if(ok)ground=null;else environmentRequested=false;
    }).catch(()=>{environmentRequested=false;});
  }
  // Style-2 V2 is the Level-5 default; the original branded sprite is archival only.
  // A clean Canvas reconstruction from current main remains the only fallback.
  const syburgSearch=globalThis.location?.search||'';
  const legacyMonument=/(?:^|[?&])td2SyburgLegacy=1(?:&|$)/.test(syburgSearch);
  const textFreePreview=legacyMonument||/(?:^|[?&])td2SyburgCleanPreview=1(?:&|$)/.test(syburgSearch);
  const candidate248V1=!textFreePreview&&/(?:^|[?&])td2SyburgArt248=1(?:&|$)/.test(syburgSearch);
  const candidate248V2=!textFreePreview&&!candidate248V1;
  const candidate248Preview=candidate248V1||candidate248V2;
  const candidate248Url=candidate248V2
    ?'assets/hohensyburg/kaiser-wilhelm-style2-qa-v2-2x.webp?v=syburg-248b1'
    :'assets/hohensyburg/kaiser-wilhelm-style2-qa-v1-2x.webp?v=syburg-248a1';
  let candidate248Sprite=null,candidate248Failed=false;
  function candidate248Image(){
    if(!candidate248Preview||candidate248Failed||typeof Image!=='function')return null;
    if(!candidate248Sprite){
      const img=new Image();img.decoding='async';candidate248Sprite=img;
      img.onload=()=>{if(img.naturalWidth!==512||img.naturalHeight!==608){
        candidate248Failed=true;candidate248Sprite=null;
      }};
      img.onerror=()=>{candidate248Failed=true;candidate248Sprite=null;};
      img.src=candidate248Url;
    }
    return candidate248Sprite?.complete&&candidate248Sprite.naturalWidth===512&&candidate248Sprite.naturalHeight===608
      ?candidate248Sprite:null;
  }
  function stroke(ctx,points,color,width){
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function randomGenerator(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
  // Subtle offset joints replace the two alternating rectangular checkerboards.
  // Tiles are baked into the existing level-ground canvas, never per frame.
  function weatheredPaving(q,x,y,w,h,stoneW,stoneH,seed){
    const random=randomGenerator(seed);
    const stones=['#898a7d','#8c8c7f','#929083','#85877b','#8f8f82','#8b8d80'];
    q.save();q.beginPath();q.rect(x,y,w,h);q.clip();
    q.fillStyle='#777b70';q.fillRect(x,y,w,h);
    for(let row=0,sy=y-4;sy<y+h+stoneH;row++,sy+=stoneH){
      const offset=(row%2)*stoneW*.5;
      for(let sx=x-stoneW;sx<x+w+stoneW;sx+=stoneW){
        const dx=(random()-.5)*8,dy=(random()-.5)*5;
        const left=sx+offset+dx,top=sy+dy;
        const width=stoneW-4+random()*2,height=stoneH-4+random()*2;
        q.fillStyle=stones[Math.floor(random()*stones.length)];
        q.beginPath();
        q.moveTo(left+4,top);q.lineTo(left+width-5,top+1);
        q.lineTo(left+width,top+height-5);q.lineTo(left+width-4,top+height);
        q.lineTo(left+2,top+height-2);q.lineTo(left,top+4);
        q.closePath();q.fill();
        q.strokeStyle='#34443c2a';q.lineWidth=.8;q.stroke();
        if(random()>.76){
          q.fillStyle='#3e59412e';q.beginPath();
          q.ellipse(left+width*.26,top+height*.86,3+random()*7,1+random()*2,0,0,Math.PI*2);
          q.fill();
        }
      }
    }
    q.restore();
  }
  // Terrain / terrace: all large geometry is rasterized only once per map.
  function createGround(level){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1536;allocations++;
    const q=canvas.getContext('2d');q.scale(.5,.5);
    const rand=randomGenerator(1902),t=level.syburgTerrace;
    const c=C,r=t.raised,f=t.forecourt;
    // Woodland surrounds the north-facing Y junction. South is the wooded drop.
    q.fillStyle=globalThis.TD2GroundV3?.patternFor?.(q,5,'base')||globalThis.TD2Style2Materials?.forest||'#202f29';q.fillRect(0,0,SIZE,SIZE);
    const texture=globalThis.DenkmalTerrain?.groundImage;
    if(!globalThis.TD2GroundV3?.imageFor?.(5,'base')&&texture?.complete&&texture.naturalWidth){
      const pattern=q.createPattern(texture,'repeat');
      if(pattern){q.save();q.globalAlpha=.2;q.fillStyle=pattern;q.fillRect(0,0,SIZE,SIZE);q.restore();}
    }
    for(let i=0;i<1600;i++){
      const x=rand()*SIZE,y=rand()*SIZE,rx=15+rand()*92;
      q.fillStyle=['#74826417','#354f3b30','#a5a1810f','#172a233a'][i%4];
      q.beginPath();q.ellipse(x,y,rx,rx*(.26+rand()*.28),rand()-.5,0,Math.PI*2);q.fill();
    }
    const slope=q.createLinearGradient(0,c.y+630,0,c.y+1450);
    slope.addColorStop(0,'#5a5d4e');slope.addColorStop(.18,'#39453d');
    slope.addColorStop(.53,'#283f39');slope.addColorStop(1,'#132923');
    q.fillStyle=slope;q.beginPath();q.moveTo(0,c.y+1010);
    q.lineTo(c.x-1020,c.y+830);q.lineTo(c.x-730,c.y+750);
    q.lineTo(c.x+970,c.y+750);q.lineTo(SIZE,c.y+920);
    q.lineTo(SIZE,SIZE);q.lineTo(0,SIZE);q.closePath();q.fill();
    // Three lanes are authored in levels.js, so rendered paths and AI agree.
    for(const lane of level.paths){
      stroke(q,lane,'#182820',122);stroke(q,lane,'#626c54',105);
      stroke(q,lane,globalThis.TD2GroundV3?.patternFor?.(q,5,'road')||globalThis.TD2Style2Materials?.stone||'#a39b7d',84);
      for(let i=1;i<lane.length;i++){
        const a=lane[i-1],b=lane[i],d=Math.hypot(b.x-a.x,b.y-a.y);
        if(d<1)continue;
        const nx=(b.y-a.y)/d,ny=-(b.x-a.x)/d;
        for(let step=16;step<d;step+=42){
          const x=a.x+(b.x-a.x)*step/d,y=a.y+(b.y-a.y)*step/d;
          q.strokeStyle='#665d4670';q.lineWidth=2;q.beginPath();
          q.moveTo(x+nx*27,y+ny*27);q.lineTo(x-nx*27,y-ny*27);q.stroke();
        }
      }
    }
    // Canopy masses sit behind the architecture, never across tower pads or roads.
    for(let i=0;i<120;i++){
      const x=rand()*SIZE,y=rand()*SIZE,rad=45+rand()*86,p={x,y};
      if(x>c.x-880&&x<c.x+1000&&y>c.y-400&&y<c.y+780)continue;
      if(level.paths.some(path=>globalThis.DenkmalLevels.pathDistance(p,path)<rad+60))continue;
      if(level.slots.some(slot=>Math.hypot(slot.x-x,slot.y-y)<rad+50))continue;
      q.fillStyle='#0b1819a8';q.beginPath();q.ellipse(x+18,y+23,rad,rad*.62,0,0,Math.PI*2);q.fill();
      if(globalThis.DenkmalForest?.drawCrown){globalThis.DenkmalForest.drawCrown(q,x,y,rad,i);continue;}
      q.fillStyle=['#38503b','#324a3a','#455945','#2c4238','#4c6247'][i%5];
      q.beginPath();q.arc(x,y,rad,0,Math.PI*2);q.fill();
      q.fillStyle='#b4b59020';q.beginPath();
      q.ellipse(x-rad*.23,y-rad*.27,rad*.6,rad*.27,-.35,0,Math.PI*2);q.fill();
    }
    // The lower public forecourt is larger than the pylon's raised enclosure.
    // It has a real front retaining wall rather than a flat floating rectangle.
    q.fillStyle='#18231f9c';q.fillRect(c.x+f.left+24,c.y+f.top+45,
      f.right-f.left+42,f.bottom-f.top+84);
    q.fillStyle='#55594e';q.fillRect(c.x+f.left-24,c.y+f.bottom-4,
      f.right-f.left+48,92);
    q.fillStyle=globalThis.TD2GroundV3?.patternFor?.(q,5,'forecourt')||'#a9a18b';q.fillRect(c.x+f.left-24,c.y+f.top-10,
      f.right-f.left+48,f.bottom-f.top+10);
    weatheredPaving(q,c.x+f.left+22,c.y+f.top+20,
      f.right-f.left-44,f.bottom-f.top-45,76,48,1902);
    // Viewpoint balustrade follows the southern edge, with stone-capped posts.
    q.fillStyle='#52564d';q.fillRect(c.x+f.left-20,c.y+f.bottom-12,f.right-f.left+40,45);
    q.fillStyle='#c1b49b';q.fillRect(c.x+f.left-24,c.y+f.bottom-20,f.right-f.left+48,13);
    for(let x=f.left-10;x<f.right;x+=125){
      q.fillStyle='#62675b';q.fillRect(c.x+x,c.y+f.bottom-44,37,49);
      q.fillStyle='#c1b69d';q.fillRect(c.x+x-6,c.y+f.bottom-50,49,12);
    }
    // Separate the raised monument plinth from the public forecourt.
    // Stone facades use a visible downward offset to read as 2.5D elevation.
    const wallBottom=c.y+r.bottom+74;
    q.fillStyle='#18221faf';q.fillRect(c.x+r.left+22,c.y+r.top+30,
      r.right-r.left+52,r.bottom-r.top+95);
    q.fillStyle='#665f54';q.fillRect(c.x+r.left,c.y+r.top+22,
      r.right-r.left,r.bottom-r.top+60);
    const courses=['#79705f','#625b50','#867967','#6e685b'];
    for(let y=c.y+r.top+35;y<wallBottom;y+=31){
      q.strokeStyle=courses[Math.abs(Math.floor(y/31))%4];q.lineWidth=3;
      q.beginPath();q.moveTo(c.x+r.left,y);q.lineTo(c.x+r.right,y);q.stroke();
    }
    // Recess the stairs into the southern face instead of drawing solid wall over them.
    for(const stair of t.stairs){
      q.fillStyle='#a69a83';q.fillRect(c.x+stair.x-stair.width*.5,
        c.y+r.bottom,stair.width,54);
    }
    q.fillStyle='#a99d84';q.fillRect(c.x+r.left,c.y+r.top,
      r.right-r.left,r.bottom-r.top);
    weatheredPaving(q,c.x+r.left+24,c.y+r.top+20,
      r.right-r.left-48,r.bottom-r.top-45,74,45,1936);
    // Plinth coping is interrupted where the two stair flights meet the deck.
    q.fillStyle='#c8bba2';q.fillRect(c.x+r.left-10,c.y+r.top-12,r.right-r.left+20,21);
    q.fillRect(c.x+r.left-12,c.y+r.top,22,r.bottom-r.top);
    q.fillRect(c.x+r.right-10,c.y+r.top,22,r.bottom-r.top);
    let from=r.left;
    const gaps=t.stairs.map(s=>({left:s.x-s.width*.5-8,right:s.x+s.width*.5+8})).sort((a,b)=>a.left-b.left);
    for(const gap of [...gaps,{left:r.right+1,right:r.right+1}]){
      if(gap.left>from)q.fillRect(c.x+from,c.y+r.bottom-10,gap.left-from,18);
      from=Math.max(from,gap.right);
    }
    for(const stair of t.stairs){
      const left=c.x+stair.x-stair.width/2,w=stair.width;
      q.fillStyle='#5d5c52';q.fillRect(left-19,c.y+stair.top,w+38,stair.bottom-stair.top+34);
      q.fillStyle='#c2b49b';q.fillRect(left-7,c.y+stair.top,w+14,stair.bottom-stair.top);
      for(let y=stair.top;y<stair.bottom;y+=21){
        q.fillStyle=((y-stair.top)/21)%2?'#988e7d':'#afa28a';
        q.fillRect(left,c.y+y,w,18);
        q.fillStyle='#d3c5a7';q.fillRect(left,c.y+y,w,4);
      }
      // Narrow side masonry, no invisible gap between stairs and terrace.
      q.fillStyle='#797365';q.fillRect(left-17,c.y+stair.top-7,14,stair.bottom-stair.top+26);
      q.fillRect(left+w+3,c.y+stair.top-7,14,stair.bottom-stair.top+26);
    }
    // Keep the memorial anchor and visual contact on the upper deck.
    q.fillStyle='#2c332e99';q.beginPath();q.ellipse(c.x,c.y+38,208,79,0,0,Math.PI*2);q.fill();
    const atlas=globalThis.KirchendeArt?.image?.('environment');
    if(atlas?.naturalWidth){
      const sw=atlas.naturalWidth/3,sh=atlas.naturalHeight/2;
      for(const p of environmentLamps(level)){
        const glow=q.createRadialGradient(p.x,p.y-47,3,p.x,p.y-47,168);
        glow.addColorStop(0,'#efbd7050');glow.addColorStop(.44,'#c18c4a22');glow.addColorStop(1,'#70591a00');
        q.fillStyle=glow;q.fillRect(p.x-168,p.y-215,336,336);
        q.drawImage(atlas,sw*2,sh,sw,sh,p.x-55,p.y-112,110,110);
      }
    }
    return canvas;
  }
  function drawGround(ctx,level){requestSharedEnvironment();if(!ground)ground=createGround(level);ctx.drawImage(ground,0,0,SIZE,SIZE);}
  function createMemorial(){
    const canvas=document.createElement('canvas');canvas.width=480;canvas.height=540;allocations++;
    const q=canvas.getContext('2d');q.translate(240,500);q.lineJoin='round';
    // A single present-day pylon (after 1935/36), not the original triple-tower group.
    q.fillStyle='#1527238c';q.beginPath();q.ellipse(12,10,196,37,0,0,Math.PI*2);q.fill();
    // Ground-level stone dais, projecting slab and heavy equestrian pedestal.
    q.fillStyle='#5c6159';q.fillRect(-190,-30,380,39);
    q.fillStyle='#b7a98e';q.fillRect(-190,-42,380,17);
    q.fillStyle='#776e60';q.fillRect(-105,-110,205,79);
    q.fillStyle='#bdad91';q.fillRect(-111,-117,217,18);
    // Right-hand shaded face gives the monumental sandstone pylon a real volume.
    q.fillStyle='#645f53';q.beginPath();
    q.moveTo(84,-404);q.lineTo(112,-385);q.lineTo(112,-62);
    q.lineTo(84,-48);q.closePath();q.fill();
    q.fillStyle='#9b8f78';q.fillRect(-102,-403,190,350);
    q.fillStyle='#d1bda0';q.fillRect(-105,-403,16,346);
    q.fillStyle='#ac9d84';q.fillRect(-91,-400,14,334);
    // Weathered block courses. Upper-left edge catches the warm Style 2 light.
    for(let row=0;row<10;row++){
      const y=-377+row*31;
      q.strokeStyle=row%2?'#6e695d77':'#d3c4a37e';
      q.lineWidth=2;q.beginPath();q.moveTo(-88,y);q.lineTo(85,y);q.stroke();
      for(const offset of [0,1]){
        const x=-79+(((row+offset*3)%4)*44);
        q.beginPath();q.moveTo(x,y);q.lineTo(x,y+30);q.stroke();
      }
    }
    // Tall recessed arch visible behind the horse: dark void, stone architrave.
    q.fillStyle='#605b50';q.beginPath();q.moveTo(-66,-114);
    q.lineTo(-66,-292);q.quadraticCurveTo(-66,-355,0,-356);
    q.quadraticCurveTo(65,-355,65,-292);q.lineTo(65,-114);q.closePath();q.fill();
    q.fillStyle='#252e2b';q.beginPath();q.moveTo(-52,-122);
    q.lineTo(-52,-290);q.quadraticCurveTo(-50,-339,0,-340);
    q.quadraticCurveTo(50,-338,52,-290);q.lineTo(52,-122);q.closePath();q.fill();
    q.strokeStyle='#d3c0a0';q.lineWidth=9;q.beginPath();
    q.moveTo(-68,-113);q.lineTo(-68,-291);q.quadraticCurveTo(-65,-360,0,-361);
    q.quadraticCurveTo(69,-359,69,-291);q.lineTo(69,-113);q.stroke();
    // The present tower's square upper opening, viewed slightly from above.
    q.fillStyle='#bead92';q.fillRect(-120,-415,233,24);
    q.fillStyle='#cfc0a6';q.fillRect(-115,-421,218,13);
    q.fillStyle='#59594d';q.beginPath();
    q.moveTo(-102,-413);q.lineTo(80,-413);q.lineTo(98,-405);q.lineTo(-82,-405);q.closePath();q.fill();
    q.strokeStyle='#726f60';q.lineWidth=5;q.strokeRect(-104,-415,210,15);
    // The three preserved bronze monuments are shaded separately from stone:
    // the equestrian figure Wilhelm I, flanked by Bismarck and Moltke.
    // All details are rasterized once into the same 480x540 cached canvas.
    function bronze(x,y,w,h){
      const g=q.createLinearGradient(x-w*.55,y-h*.6,x+w*.6,y+h*.5);
      g.addColorStop(0,'#9fbbab');g.addColorStop(.22,'#527e70');
      g.addColorStop(.56,'#345e55');g.addColorStop(1,'#183a34');
      return g;
    }
    function sideBronze(x,officer){
      q.save();q.translate(x,0);
      // Chiselled sandstone plinth and recessed vertical contact shadow.
      q.fillStyle='#383e35';q.fillRect(-37,-103,74,11);
      q.fillStyle='#766e60';q.fillRect(-34,-98,68,51);
      q.fillStyle='#c7b498';q.fillRect(-38,-103,76,9);
      q.fillStyle='#a89a80';q.fillRect(-34,-94,8,43);
      q.fillStyle='#203832bb';q.beginPath();q.ellipse(0,-105,26,9,0,0,Math.PI*2);q.fill();
      // Distinct boot stance, two folds in the long cast-bronze greatcoat.
      q.fillStyle='#21483f';q.beginPath();
      q.moveTo(-17,-124);q.lineTo(-22,-103);q.lineTo(-5,-99);
      q.lineTo(-1,-130);q.lineTo(4,-99);q.lineTo(24,-102);
      q.lineTo(17,-136);q.closePath();q.fill();
      q.fillStyle=bronze(0,-176,58,103);q.beginPath();
      q.moveTo(-17,-207);q.bezierCurveTo(-31,-204,-35,-178,-29,-152);
      q.lineTo(-25,-113);q.quadraticCurveTo(-5,-123,0,-117);
      q.quadraticCurveTo(13,-122,27,-112);q.lineTo(28,-156);
      q.bezierCurveTo(32,-178,23,-201,14,-207);q.closePath();q.fill();
      // Asymmetrical coat lapels and the hanging cloak read at reduced scale.
      q.strokeStyle='#a4b8a7';q.lineWidth=2.7;q.beginPath();
      q.moveTo(-8,-202);q.lineTo(2,-183);q.lineTo(-4,-141);
      q.moveTo(7,-201);q.lineTo(15,-181);q.lineTo(9,-147);q.stroke();
      q.strokeStyle='#163b35';q.lineWidth=4;q.beginPath();
      q.moveTo(-26,-155);q.quadraticCurveTo(-31,-135,-24,-116);
      q.moveTo(27,-160);q.quadraticCurveTo(23,-134,26,-116);q.stroke();
      // Bismarck (left): hands on staff; Moltke (right): lowered sabre.
      q.strokeStyle='#2e584d';q.lineWidth=12;q.lineCap='round';q.beginPath();
      q.moveTo(-22,-195);q.lineTo(-22,-154);q.lineTo(-6,-157);
      q.moveTo(21,-196);q.lineTo(23,officer?-166:-156);
      q.lineTo(officer?15:4,officer?-156:-158);q.stroke();
      q.strokeStyle='#a0b9a7';q.lineWidth=3;q.beginPath();
      q.moveTo(-25,-189);q.lineTo(-24,-163);
      q.moveTo(22,-190);q.lineTo(23,-166);q.stroke();
      q.fillStyle='#477467';q.beginPath();q.ellipse(-4,-158,7,5,0,0,Math.PI*2);q.fill();
      q.strokeStyle='#172c2a';q.lineWidth=4;q.beginPath();
      q.moveTo(officer?17:-4,-153);q.lineTo(officer?28:-5,-107);q.stroke();
      // Sculpted neck, face, ear, cap and directional facial shadow.
      q.fillStyle='#224b43';q.fillRect(-7,-217,14,13);
      q.fillStyle=bronze(0,-227,30,37);q.beginPath();
      q.ellipse(0,-231,14,17,-.12,0,Math.PI*2);q.fill();
      q.fillStyle='#9bb7a7';q.beginPath();q.ellipse(-5,-232,4,9,-.2,0,Math.PI*2);q.fill();
      q.fillStyle='#254a42';q.beginPath();q.moveTo(2,-236);
      q.lineTo(11,-228);q.lineTo(2,-222);q.closePath();q.fill();
      q.fillStyle=officer?'#456e61':'#2a4d45';q.beginPath();
      q.moveTo(-15,-238);q.lineTo(-12,-249);q.lineTo(10,-252);
      q.lineTo(16,-241);q.closePath();q.fill();
      q.strokeStyle='#abc2ae';q.lineWidth=2;q.beginPath();
      q.moveTo(-14,-241);q.lineTo(15,-241);q.stroke();
      if(!officer){
        q.fillStyle='#24483f';q.beginPath();q.moveTo(-10,-220);
        q.quadraticCurveTo(0,-208,11,-222);q.lineTo(5,-213);
        q.lineTo(-6,-212);q.closePath();q.fill();
      }
      q.restore();
    }
    // Front view from the south: Moltke west / left, Bismarck east / right.
    sideBronze(-146,true);sideBronze(149,false);
    // The bronze horse is read in three-quarter profile: four distinct legs,
    // raised foreleg, head, reins, mane, sculpted chest and separate rider.
    q.fillStyle='#152d2a99';q.beginPath();q.ellipse(-5,-126,74,12,0,0,Math.PI*2);q.fill();
    q.lineCap='round';q.lineJoin='round';
    // Far hind leg and foreground rear leg, not a featureless triangular body.
    q.strokeStyle='#173d36';q.lineWidth=14;q.beginPath();
    q.moveTo(29,-190);q.lineTo(42,-156);q.lineTo(38,-126);
    q.moveTo(11,-183);q.lineTo(18,-155);q.lineTo(16,-125);q.stroke();
    q.strokeStyle='#83aa95';q.lineWidth=3;q.beginPath();
    q.moveTo(24,-180);q.lineTo(34,-155);q.lineTo(32,-138);q.stroke();
    // Long tail emerges behind the saddle rather than the animal's head.
    q.strokeStyle='#254f45';q.lineWidth=10;q.beginPath();
    q.moveTo(47,-220);q.quadraticCurveTo(77,-198,66,-165);q.stroke();
    q.strokeStyle='#86a996';q.lineWidth=2;q.beginPath();
    q.moveTo(48,-221);q.quadraticCurveTo(71,-201,66,-183);q.stroke();
    q.fillStyle=bronze(-4,-213,116,73);q.beginPath();
    q.ellipse(-3,-203,52,32,-.13,0,Math.PI*2);q.fill();
    q.fillStyle='#9abdab42';q.beginPath();
    q.ellipse(-17,-214,29,11,-.2,0,Math.PI*2);q.fill();
    q.strokeStyle='#1d443b';q.lineWidth=5;q.beginPath();
    q.moveTo(-49,-198);q.quadraticCurveTo(-9,-174,32,-189);q.stroke();
    // The front leg is raised; the other reaches the stone pedestal.
    q.strokeStyle='#2b6155';q.lineWidth=14;q.beginPath();
    q.moveTo(-34,-185);q.lineTo(-40,-156);q.lineTo(-38,-127);
    q.moveTo(-49,-193);q.lineTo(-66,-169);q.lineTo(-78,-164);q.stroke();
    q.strokeStyle='#add0b8';q.lineWidth=3;q.beginPath();
    q.moveTo(-43,-184);q.lineTo(-47,-157);
    q.moveTo(-60,-177);q.lineTo(-71,-166);q.stroke();
    q.strokeStyle='#18332f';q.lineWidth=7;q.beginPath();
    q.moveTo(-46,-126);q.lineTo(-30,-126);
    q.moveTo(-79,-164);q.lineTo(-66,-164);q.stroke();
    // Long neck, sculpted muzzle, separate ears and bridle.
    q.fillStyle=bronze(-50,-244,63,89);q.beginPath();
    q.moveTo(-43,-198);q.quadraticCurveTo(-58,-227,-66,-247);
    q.lineTo(-48,-263);q.quadraticCurveTo(-31,-239,-18,-219);
    q.lineTo(-17,-198);q.closePath();q.fill();
    q.fillStyle='#365f53';q.beginPath();
    q.ellipse(-66,-255,20,23,-.26,0,Math.PI*2);q.fill();
    q.fillStyle='#7fa792';q.beginPath();
    q.ellipse(-74,-255,9,17,-.3,0,Math.PI*2);q.fill();
    q.fillStyle='#2b554a';q.beginPath();
    q.moveTo(-79,-270);q.lineTo(-84,-286);q.lineTo(-70,-276);
    q.lineTo(-62,-287);q.lineTo(-57,-272);q.closePath();q.fill();
    q.strokeStyle='#182e2a';q.lineWidth=3;q.beginPath();
    q.moveTo(-58,-260);q.quadraticCurveTo(-80,-253,-82,-240);
    q.moveTo(-55,-250);q.lineTo(-40,-216);q.stroke();
    q.fillStyle='#0c2723';q.beginPath();q.arc(-73,-262,2.6,0,Math.PI*2);q.fill();
    // Uniformed rider, cape and mounted silhouette in front of arch.
    q.fillStyle='#163a34';q.beginPath();q.ellipse(7,-229,23,9,-.18,0,Math.PI*2);q.fill();
    q.fillStyle='#21483e';q.beginPath();
    q.moveTo(5,-286);q.quadraticCurveTo(24,-284,34,-258);
    q.lineTo(42,-225);q.lineTo(13,-223);q.lineTo(-10,-247);
    q.closePath();q.fill();
    q.fillStyle=bronze(10,-268,55,87);q.beginPath();
    q.moveTo(-6,-286);q.quadraticCurveTo(14,-297,28,-279);
    q.lineTo(27,-243);q.lineTo(-6,-241);q.closePath();q.fill();
    q.strokeStyle='#a3c6b0';q.lineWidth=3;q.beginPath();
    q.moveTo(0,-280);q.lineTo(10,-262);q.lineTo(7,-246);q.stroke();
    // The rider raises one arm in greeting; the other holds the reins.
    // Both silhouettes stay inside the original 480 x 540 memorial canvas.
    q.strokeStyle='#234d42';q.lineWidth=11;q.beginPath();
    q.moveTo(25,-275);q.lineTo(13,-258);q.lineTo(-14,-252);
    q.moveTo(-3,-272);q.lineTo(-23,-295);q.lineTo(-37,-313);q.stroke();
    q.strokeStyle='#b1c7ad';q.lineWidth=3;q.beginPath();
    q.moveTo(22,-273);q.lineTo(10,-258);
    q.moveTo(-6,-275);q.lineTo(-25,-298);q.stroke();
    q.fillStyle='#8eae9d';q.beginPath();q.ellipse(-38,-316,7,10,-.25,0,Math.PI*2);q.fill();
    q.strokeStyle='#274940';q.lineWidth=2;q.beginPath();
    q.moveTo(-43,-322);q.lineTo(-47,-330);
    q.moveTo(-38,-325);q.lineTo(-39,-334);
    q.moveTo(-33,-322);q.lineTo(-31,-330);q.stroke();
    q.fillStyle='#8eae9d';q.beginPath();q.arc(-14,-252,5,0,Math.PI*2);q.fill();
    q.fillStyle=bronze(10,-307,33,47);q.beginPath();
    q.ellipse(10,-309,15,19,-.13,0,Math.PI*2);q.fill();
    q.fillStyle='#24463d';q.beginPath();
    q.moveTo(-5,-321);q.lineTo(-3,-328);q.lineTo(25,-329);
    q.lineTo(28,-320);q.closePath();q.fill();
    q.strokeStyle='#9dbdaa';q.lineWidth=2;q.beginPath();
    q.moveTo(-5,-320);q.lineTo(26,-320);q.stroke();
    q.strokeStyle='#304e42';q.lineWidth=3;q.beginPath();
    q.moveTo(10,-328);q.lineTo(10,-341);q.stroke();
    // Bridle, reigns, stirrup and small highlights tie horse and rider together.
    q.strokeStyle='#a8c3a4';q.lineWidth=2;q.beginPath();
    q.moveTo(-38,-250);q.quadraticCurveTo(-20,-237,-13,-255);
    q.lineTo(-19,-231);
    q.moveTo(9,-240);q.lineTo(21,-205);q.lineTo(35,-202);q.stroke();
    // Current 1935/36 arrangement: the Reichsgruendung date is above
    // the arch, not written on the lower pedestal (LWL / contemporary views).
    q.textAlign='center';q.textBaseline='alphabetic';
    q.font='bold 14px Georgia,serif';q.lineWidth=1;
    q.strokeStyle='#514b41';q.strokeText('18 JANUAR 1871',0,-373);
    q.fillStyle='#d5bea0';q.fillText('18 JANUAR 1871',0,-373);
    // Small crown relief in the stone course above the inscription.
    q.fillStyle='#5b564a';q.beginPath();q.moveTo(-17,-393);
    q.lineTo(-15,-400);q.lineTo(-7,-394);q.lineTo(0,-405);
    q.lineTo(7,-394);q.lineTo(15,-400);q.lineTo(17,-393);
    q.lineTo(15,-388);q.lineTo(-15,-388);q.closePath();q.fill();
    q.strokeStyle='#bca78c';q.lineWidth=1.5;q.stroke();
    return canvas;
  }
  function drawMonument(ctx,m){
    const sprite=candidate248Image();
    if(sprite){
      const height=540,width=height*sprite.naturalWidth/sprite.naturalHeight;
      ctx.drawImage(sprite,m.x-width/2,m.y-height+40,width,height);
      return;
    }
    // Existing sculpted Canvas fallback is cached and has no embedded logo.
    if(!memorial)memorial=createMemorial();
    ctx.drawImage(memorial,m.x-240,m.y-500,480,540);
  }
  function drawAirLane(ctx,level,active){
    if(!active)return;
    const a=level.airGate;ctx.save();try{
      ctx.setLineDash([11,17]);stroke(ctx,[a,C],'#8ac2d288',3);ctx.setLineDash([]);
      ctx.fillStyle='#9cdae2';ctx.textAlign='center';ctx.font='700 17px sans-serif';
      ctx.fillText('LUFTANGRIFF ÜBER DEM HANG',a.x,a.y-40);
    }finally{ctx.restore();}
  }
  globalThis.DenkmalHohensyburgArt={drawGround,drawMonument,drawAirLane,
    legacyMonument,textFreePreview,candidate248Preview,candidate248V2,
    get candidate248Ready(){return !!candidate248Sprite?.complete&&candidate248Sprite.naturalWidth===512&&candidate248Sprite.naturalHeight===608;},
    get candidate248Failed(){return candidate248Failed;},
    release(){ground=null;memorial=null;candidate248Sprite=null;candidate248Failed=false;},
    environmentLamps,
    get allocations(){return allocations;}};
})();
