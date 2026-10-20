/* Present-day Kaiser-Wilhelm-Denkmal, Hohensyburg: historical silhouette in a cached, illustrative Style 2 landscape. */
(()=>{'use strict';
  const C={x:1536,y:1536},SIZE=3072;
  let ground=null,memorial=null,allocations=0;
  // Pre-cut transparent Style 2 sprite. Keep the cached Canvas pylon as offline fallback.
  let standaloneSprite=null;
  const monumentImage=()=>{
    const url='assets/hohensyburg/kaiser-wilhelm-v1.webp?v=syburg3';
    if(globalThis.DenkmalAssets)return globalThis.DenkmalAssets.get(url);
    if(typeof Image!=='function')return null;
    if(!standaloneSprite){standaloneSprite=new Image();standaloneSprite.decoding='async';standaloneSprite.src=url;}
    return standaloneSprite;
  };
  function stroke(ctx,points,color,width){
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function randomGenerator(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
  // Terrain / terrace: all large geometry is rasterized only once per map.
  function createGround(level){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1536;allocations++;
    const q=canvas.getContext('2d');q.scale(.5,.5);
    const rand=randomGenerator(1902),t=level.syburgTerrace;
    const c=C,r=t.raised,f=t.forecourt;
    // Woodland surrounds the north-facing Y junction. South is the wooded drop.
    q.fillStyle='#202f29';q.fillRect(0,0,SIZE,SIZE);
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
      stroke(q,lane,'#a39b7d',84);
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
    q.fillStyle='#a9a18b';q.fillRect(c.x+f.left-24,c.y+f.top-10,
      f.right-f.left+48,f.bottom-f.top+10);
    q.fillStyle='#8d8878';q.fillRect(c.x+f.left+22,c.y+f.top+20,
      f.right-f.left-44,f.bottom-f.top-45);
    for(let y=f.top+25;y<f.bottom-25;y+=48)for(let x=f.left+22;x<f.right-20;x+=76){
      q.fillStyle=['#b6ab90a0','#8c887688','#c2b99c55','#85837266'][
        Math.abs(Math.floor(x/76)+Math.floor(y/48))%4];
      q.fillRect(c.x+x+2,c.y+y+2,70,41);
      q.strokeStyle='#514f4555';q.lineWidth=2;
      q.strokeRect(c.x+x+1,c.y+y+1,73,44);
    }
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
    q.fillStyle='#99917c';q.fillRect(c.x+r.left+24,c.y+r.top+20,
      r.right-r.left-48,r.bottom-r.top-45);
    for(let y=r.top+20;y<r.bottom-35;y+=45)for(let x=r.left+20;x<r.right-35;x+=74){
      q.fillStyle=['#b5ab92','#8f8878','#a19882','#b8ad93'][Math.abs(Math.floor(x/74)+Math.floor(y/45))%4];
      q.fillRect(c.x+x+2,c.y+y+2,68,39);
      q.fillStyle='#464d4344';q.fillRect(c.x+x,c.y+y+40,70,2);
    }
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
    return canvas;
  }
  function drawGround(ctx,level){if(!ground)ground=createGround(level);ctx.drawImage(ground,0,0,SIZE,SIZE);}
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
    // Two freestanding bronze figures: Bismarck and Moltke.
    for(const x of [-146,149]){
      q.fillStyle='#716b5c';q.fillRect(x-35,-93,70,47);
      q.fillStyle='#ac9b82';q.fillRect(x-37,-100,74,12);
      q.fillStyle='#2c5149';q.beginPath();
      q.moveTo(x-17,-99);q.lineTo(x-28,-170);q.lineTo(x-17,-212);
      q.lineTo(x+18,-212);q.lineTo(x+28,-165);q.lineTo(x+16,-99);
      q.closePath();q.fill();
      q.fillStyle='#43665d';q.beginPath();q.arc(x,-226,17,0,Math.PI*2);q.fill();
      q.strokeStyle='#7c9e8f';q.lineWidth=3;q.beginPath();
      q.moveTo(x-17,-181);q.lineTo(x-12,-119);q.stroke();
    }
    // Patinated bronze side-on horse, distinct rider above, standing in front
    // of the arch, not replacing it with a generic tower sprite.
    q.fillStyle='#203f3c';q.beginPath();
    q.moveTo(-68,-165);q.lineTo(-72,-222);q.lineTo(-51,-243);
    q.lineTo(-25,-228);q.lineTo(11,-215);q.lineTo(44,-228);
    q.lineTo(72,-245);q.lineTo(93,-234);q.lineTo(80,-198);
    q.lineTo(61,-188);q.lineTo(44,-196);q.lineTo(43,-143);
    q.lineTo(26,-143);q.lineTo(14,-192);q.lineTo(-29,-191);
    q.lineTo(-38,-141);q.lineTo(-58,-141);q.closePath();q.fill();
    q.strokeStyle='#6b9586';q.lineWidth=4;q.beginPath();
    q.moveTo(-55,-222);q.lineTo(55,-209);q.stroke();
    q.fillStyle='#41685b';q.beginPath();q.moveTo(-7,-285);
    q.lineTo(24,-288);q.lineTo(28,-210);q.lineTo(-9,-214);q.closePath();q.fill();
    q.beginPath();q.arc(8,-301,16,0,Math.PI*2);q.fill();
    q.strokeStyle='#9fae9b';q.lineWidth=6;q.beginPath();
    q.moveTo(14,-255);q.lineTo(47,-230);q.stroke();
    // 1871 commemorates the Reichsgründung; the monument opened in 1902.
    q.fillStyle='#cab99c';q.font='bold 20px serif';q.textAlign='center';
    q.fillText('1871',0,-76);
    return canvas;
  }
  function drawMonument(ctx,m){
    const monumentSprite=monumentImage();
    if(monumentSprite?.complete&&monumentSprite.naturalWidth>0){
      // Foot anchor is on the existing upper terrace, not on the lower plaza.
      // Canvas already applies the oblique camera's upright-sprite correction.
      const height=570,width=height*monumentSprite.naturalWidth/monumentSprite.naturalHeight;
      ctx.drawImage(monumentSprite,m.x-width/2,m.y-height+40,width,height);
      return;
    }
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
    release(){ground=null;memorial=null;standaloneSprite=null;},
    get allocations(){return allocations;}};
})();
