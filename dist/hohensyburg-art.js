/* Present-day Kaiser-Wilhelm-Denkmal, Hohensyburg: historical silhouette in a cached, illustrative Style 2 landscape. */
(()=>{'use strict';
  const C={x:1536,y:1536},SIZE=3072;
  let ground=null,memorial=null,allocations=0;
  function stroke(ctx,points,color,width){
    ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
    ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke();
  }
  function randomGenerator(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
  function createGround(level){
    const canvas=document.createElement('canvas');canvas.width=canvas.height=1536;allocations++;
    const q=canvas.getContext('2d');q.scale(.5,.5);
    const rand=randomGenerator(1902);
    // Wooded escarpment and the more open, fortified lookout terrace.
    q.fillStyle='#1b2b24';q.fillRect(0,0,SIZE,SIZE);
    for(let i=0;i<1900;i++){
      const x=rand()*SIZE,y=rand()*SIZE,r=12+rand()*45;
      q.fillStyle=i%3===0?'#344a3438':i%3===1?'#63715b24':'#a6a17a10';
      q.beginPath();q.ellipse(x,y,r,r*.42,0,0,Math.PI*2);q.fill();
    }
    // The south-facing valley is deliberately outside the traversable terrace.
    const cliff=q.createLinearGradient(0,C.y+600,0,C.y+1250);
    cliff.addColorStop(0,'#51544b');cliff.addColorStop(.28,'#343f39');cliff.addColorStop(1,'#11251f');
    q.fillStyle=cliff;q.beginPath();q.moveTo(0,C.y+820);q.lineTo(C.x-820,C.y+620);
    q.lineTo(C.x+820,C.y+620);q.lineTo(SIZE,C.y+850);q.lineTo(SIZE,SIZE);q.lineTo(0,SIZE);q.closePath();q.fill();
    // Terrace: broad sandstone paving with a rounded southern outer wall.
    q.fillStyle='#303b36';q.fillRect(C.x-830,C.y-650,1660,1330);
    q.fillStyle='#827e68';q.fillRect(C.x-770,C.y-590,1540,1180);
    q.fillStyle='#9e9980';q.fillRect(C.x-680,C.y-500,1360,1030);
    for(let y=-480;y<520;y+=46)for(let x=-660;x<660;x+=76){
      const tone=(Math.floor(x/76)+Math.floor(y/46))%5;
      q.fillStyle=['#8e8b75','#999680','#868673','#9e9a81','#8a8a78'][Math.abs(tone)];
      q.fillRect(C.x+x,C.y+y,70,40);
      q.fillStyle='#4e50452c';q.fillRect(C.x+x,C.y+y+37,70,3);
    }
    // On-site parapet towards Hengsteysee; no invented river feature on the plateau.
    q.fillStyle='#52574d';q.fillRect(C.x-780,C.y+565,1560,95);
    q.fillStyle='#afa98f';q.fillRect(C.x-790,C.y+562,1580,26);
    for(let x=-755;x<=755;x+=112){q.fillStyle='#6c7063';q.fillRect(C.x+x,C.y+548,44,60);q.fillStyle='#b5b09a';q.fillRect(C.x+x-8,C.y+541,60,12);}
    for(let side of [-1,1]){
      const x=C.x+side*780;
      q.fillStyle='#63695d';q.fillRect(x-16,C.y-600,32,1170);
      q.fillStyle='#aaa38c';q.fillRect(x-17,C.y-600,34,11);
    }
    // Paths are authored in levels.js and are distinct from the stone terrace.
    for(const lane of level.paths){
      stroke(q,lane,'#26332e',112);stroke(q,lane,'#a59b7c',88);stroke(q,lane,'#8a806c',75);
      for(let i=1;i<lane.length;i++){const a=lane[i-1],b=lane[i],d=Math.hypot(b.x-a.x,b.y-a.y);if(d<1)continue;
        const nx=(b.y-a.y)/d,ny=-(b.x-a.x)/d;
        for(let step=24;step<d;step+=38){const t=step/d,x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
          q.strokeStyle='#584f4166';q.lineWidth=2;q.beginPath();q.moveTo(x+nx*30,y+ny*30);q.lineTo(x-nx*30,y-ny*30);q.stroke();}
      }
    }
    // Painterly treetops beyond tower sites and enemy approaches only.
    for(let i=0;i<80;i++){
      const x=rand()*SIZE,y=rand()*SIZE,r=45+rand()*88,p={x,y};
      if(x>C.x-870&&x<C.x+870&&y>C.y-710&&y<C.y+730)continue;
      if(level.paths.some(path=>globalThis.DenkmalLevels.pathDistance(p,path)<r+66))continue;
      if(level.slots.some(slot=>Math.hypot(slot.x-x,slot.y-y)<r+45))continue;
      q.fillStyle='#0c1b19aa';q.beginPath();q.ellipse(x+15,y+28,r,r*.53,0,0,Math.PI*2);q.fill();
      q.fillStyle=['#344a35','#304238','#3e5040','#435542'][i%4];
      q.beginPath();q.arc(x,y,r,0,Math.PI*2);q.fill();
      q.fillStyle='#81907122';q.beginPath();q.ellipse(x-r*.15,y-r*.25,r*.5,r*.27,-.4,0,Math.PI*2);q.fill();
    }
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
