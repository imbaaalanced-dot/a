/* Present-day Kaiser-Wilhelm-Denkmal, Hohensyburg: historical silhouette in a cached, illustrative Style 2 landscape. */
(()=>{'use strict';
  const C={x:1536,y:1536},SIZE=3072;
  let ground=null,memorial=null,allocations=0;
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
    const q=canvas.getContext('2d');q.translate(240,500);
    q.lineJoin='round';
    // Present-day single massive sandstone pylon, not the demolished 1902 side towers.
    q.fillStyle='#242d2a66';q.beginPath();q.ellipse(0,6,195,32,0,0,Math.PI*2);q.fill();
    q.fillStyle='#5e665b';q.fillRect(-190,-28,380,40);q.fillStyle='#ac9f81';q.fillRect(-188,-36,376,13);
    q.fillStyle='#706e5e';q.fillRect(-100,-382,200,350);
    q.fillStyle='#9d9378';q.fillRect(-84,-395,168,344);q.fillStyle='#c3b399';q.fillRect(-106,-405,212,25);
    q.fillStyle='#615f53';q.fillRect(-66,-345,132,230);
    q.fillStyle='#b5a58c';q.beginPath();q.moveTo(-72,-340);q.lineTo(-72,-287);q.quadraticCurveTo(0,-220,72,-287);q.lineTo(72,-340);q.closePath();q.fill();
    q.fillStyle='#777060';q.fillRect(-85,-108,170,70);q.fillStyle='#b2a186';q.fillRect(-96,-115,192,18);
    q.fillStyle='#6e765d';q.fillRect(-98,-391,14,338);q.fillRect(84,-391,14,338);
    // Side statues: Bismarck and Moltke in bronze, subordinate to equestrian figure.
    for(const x of [-145,145]){
      q.fillStyle='#837f6a';q.fillRect(x-34,-98,68,42);q.fillStyle='#394f49';
      q.beginPath();q.moveTo(x-18,-95);q.lineTo(x-27,-165);q.lineTo(x-14,-223);q.lineTo(x+14,-223);q.lineTo(x+26,-165);q.lineTo(x+21,-95);q.closePath();q.fill();
      q.beginPath();q.arc(x,-236,20,0,Math.PI*2);q.fill();
    }
    // Bronze horse and rider: a readable side silhouette in a small 2.5D game view.
    q.fillStyle='#244e48';
    q.beginPath();q.moveTo(-60,-161);q.lineTo(-70,-220);q.lineTo(-34,-222);q.lineTo(0,-208);
    q.lineTo(43,-218);q.lineTo(78,-237);q.lineTo(95,-225);q.lineTo(84,-194);
    q.lineTo(66,-185);q.lineTo(40,-192);q.lineTo(39,-143);q.lineTo(22,-143);q.lineTo(12,-189);
    q.lineTo(-28,-183);q.lineTo(-39,-142);q.lineTo(-58,-142);q.closePath();q.fill();
    q.strokeStyle='#80a193';q.lineWidth=5;q.beginPath();q.moveTo(-42,-207);q.lineTo(72,-207);q.stroke();
    q.fillStyle='#375c50';q.fillRect(-2,-274,28,60);q.beginPath();q.arc(12,-289,16,0,Math.PI*2);q.fill();
    q.strokeStyle='#8ca595';q.lineWidth=8;q.beginPath();q.moveTo(11,-245);q.lineTo(48,-226);q.stroke();
    // Sunlit edges, faint dry joints and the historically documented founding date.
    q.fillStyle='#c2b49a';q.font='bold 22px serif';q.textAlign='center';q.fillText('1871',0,-83);
    q.strokeStyle='#d9cbac70';q.lineWidth=3;q.beginPath();q.moveTo(-97,-380);q.lineTo(-97,-58);q.stroke();
    return canvas;
  }
  function drawMonument(ctx,m){if(!memorial)memorial=createMemorial();ctx.drawImage(memorial,m.x-240,m.y-500,480,540);}
  function drawAirLane(ctx,level,active){
    if(!active)return;
    const a=level.airGate;ctx.save();try{
      ctx.setLineDash([11,17]);stroke(ctx,[a,C],'#8ac2d288',3);ctx.setLineDash([]);
      ctx.fillStyle='#9cdae2';ctx.textAlign='center';ctx.font='700 17px sans-serif';
      ctx.fillText('LUFTANGRIFF ÜBER DEM HANG',a.x,a.y-40);
    }finally{ctx.restore();}
  }
  globalThis.DenkmalHohensyburgArt={drawGround,drawMonument,drawAirLane,get allocations(){return allocations;}};
})();
