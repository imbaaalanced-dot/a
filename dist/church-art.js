/* TD2 Level 4 – Ender Dorfkirche and the 1879 sleeping-lion memorial.
   Composition uses public photo references, but dimensions and orientation are illustrative. */
(() => {
  'use strict';
  const trees=[[-570,-575,96],[-630,-80,115],[-510,510,90],[560,400,93],[610,-100,102],[-170,-610,92]];
  const graves=[[-365,-530],[-305,-565],[-240,-470],[-440,-60],[-565,20],[590,-330],[510,-440],[360,-130]];
  const benches=[[-315,190],[250,330]];
  let church=null,site=null;
  function seeded(seed){return () => ((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
  function polygon(c,points,fill,stroke){
    c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));
    c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=3;c.stroke();}
  }
  function brick(c,x,y,w,h,seed=5){
    const rnd=seeded(seed);c.fillStyle='#8e8876';c.fillRect(x,y,w,h);
    for(let yy=y+5;yy<y+h-4;yy+=13)for(let xx=x+5;xx<x+w-5;xx+=28){
      const width=19+rnd()*11,height=7+rnd()*4;
      c.fillStyle=['#b6ac93','#9b9a87','#777c72','#c8baa0','#a2a38f'][Math.floor(rnd()*5)];
      c.fillRect(xx+(Math.floor((yy-y)/13)%2)*7,yy,width,height);
    }
  }
  function createChurch(){
    const c=document.createElement('canvas');c.width=720;c.height=900;
    const g=c.getContext('2d');g.translate(65,45);
    g.fillStyle='#19251f66';g.beginPath();g.ellipse(318,695,272,55,-.1,0,Math.PI*2);g.fill();
    // South-facing nave of local sandstone; the roof is a visible bird's-eye mass.
    brick(g,140,270,410,405,775);
    polygon(g,[[140,270],[535,270],[601,211],[218,211]],'#77796e','#50534f');
    polygon(g,[[140,270],[218,211],[218,598],[140,675]],'#706e5c','#494b45');
    polygon(g,[[218,211],[600,211],[535,270],[140,270]],'#515963','#353b42');
    polygon(g,[[218,211],[600,211],[630,75],[289,75]],'#565f68','#2d343d');
    polygon(g,[[289,75],[630,75],[600,211],[218,211]],'#464e59','#2d343b');
    const r=seeded(1963);
    for(let i=0;i<185;i++){
      const x=250+r()*345,y=86+r()*118;
      g.strokeStyle=['#6e7580','#313a42','#858b89'][i%3];g.lineWidth=.8;g.beginPath();g.moveTo(x,y);g.lineTo(x+14,y-2);g.stroke();
    }
    // Three tall arched windows with sandstone surrounds.
    for(const x of [247,345,443]){
      g.fillStyle='#c9c0a5';g.beginPath();g.roundRect(x,443,45,100,[22,22,4,4]);g.fill();
      g.fillStyle='#283c43';g.beginPath();g.roundRect(x+5,449,35,88,[18,18,2,2]);g.fill();
      g.strokeStyle='#9b9d8d';g.lineWidth=2;g.beginPath();g.moveTo(x+22,454);g.lineTo(x+22,531);g.stroke();
    }
    // Thick square tower and slate belfry with the distinctive clock.
    brick(g,48,180,167,432,381);brick(g,62,130,136,95,737);
    polygon(g,[[42,145],[127,-21],[221,145]],'#4e5b65','#343e46');
    polygon(g,[[126,-21],[221,145],[194,133]],'#333d47','#262c35');
    for(const x of [81,143]){g.fillStyle='#2f3b3e';g.beginPath();g.roundRect(x,171,25,55,[13,13,0,0]);g.fill();}
    g.fillStyle='#ddd4ba';g.beginPath();g.arc(128,302,43,0,Math.PI*2);g.fill();
    g.strokeStyle='#59564a';g.lineWidth=5;g.stroke();
    g.fillStyle='#474b49';for(let i=0;i<12;i++){const a=i*Math.PI/6;g.beginPath();g.arc(128+Math.sin(a)*33,302-Math.cos(a)*33,2,0,7);g.fill();}
    g.strokeStyle='#303e46';g.lineWidth=4;g.beginPath();g.moveTo(128,302);g.lineTo(128,277);g.moveTo(128,302);g.lineTo(148,307);g.stroke();
    g.fillStyle='#333b3a';g.beginPath();g.roundRect(97,519,66,95,[32,32,2,2]);g.fill();
    g.strokeStyle='#d0c1a0';g.lineWidth=6;g.stroke();g.fillStyle='#b6a991';g.fillRect(89,613,90,11);
    // Subtle highlights to keep the stone readable at portrait zoom.
    g.strokeStyle='#d7d1b04d';g.lineWidth=3;g.strokeRect(54,190,155,424);
    return c;
  }
  function createSite(){
    const c=document.createElement('canvas');c.width=c.height=400;const g=c.getContext('2d');
    g.translate(200,190);
    g.fillStyle='#29302766';g.fillRect(-169,-128,336,296);
    g.fillStyle='#7d7f6f';g.fillRect(-163,-139,326,286);
    const rnd=seeded(1879);
    for(let row=0;row<8;row++)for(let col=0;col<9;col++){
      const x=-158+col*36,y=-135+row*35;
      g.fillStyle=['#a09d89','#7f8578','#b6ae93','#898d7b'][Math.floor(rnd()*4)];
      g.fillRect(x+1,y+1,34,33);
      g.strokeStyle='#4e554a50';g.strokeRect(x+1,y+1,34,33);
      g.fillStyle='#74806155';g.fillRect(x+3,y+25,8+rnd()*14,4);
    }
    g.strokeStyle='#bbb89b';g.lineWidth=8;g.strokeRect(-164,-139,328,286);
    return c;
  }
  function drawGround(ctx,cam,width,height){
    const pad=70,x=Math.max(0,cam.x-pad),y=Math.max(0,cam.y-pad);
    const w=Math.min(3072-x,width+2*pad),h=Math.min(3072-y,height+2*pad);
    if(globalThis.DenkmalTerrain?.drawGround)globalThis.DenkmalTerrain.drawGround(ctx,x,y,w,h);
    else{ctx.fillStyle='#3c4b37';ctx.fillRect(x,y,w,h);}
  }
  function drawGrave(ctx,x,y,index){
    ctx.save();ctx.translate(x,y);
    ctx.fillStyle='#17241e66';ctx.beginPath();ctx.ellipse(5,8,25,9,0,0,7);ctx.fill();
    ctx.fillStyle=['#9c9983','#a9a790','#898f80'][index%3];ctx.beginPath();
    ctx.moveTo(-16,2);ctx.lineTo(-16,-30);ctx.quadraticCurveTo(-15,-51,0,-52);
    ctx.quadraticCurveTo(16,-50,16,-30);ctx.lineTo(16,2);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#cec8a6aa';ctx.lineWidth=1.5;ctx.stroke();
    ctx.strokeStyle='#555c5166';ctx.beginPath();ctx.moveTo(-8,-18);ctx.lineTo(9,-18);ctx.moveTo(-7,-12);ctx.lineTo(6,-12);ctx.stroke();
    ctx.restore();
  }
  function drawBench(ctx,x,y){
    ctx.save();ctx.translate(x,y);ctx.fillStyle='#2b342d88';ctx.fillRect(-39,-11,86,24);
    ctx.fillStyle='#897357';for(let i=0;i<3;i++)ctx.fillRect(-42,-20+i*10,84,7);
    ctx.fillStyle='#484e44';ctx.fillRect(-34,11,7,12);ctx.fillRect(27,11,7,12);ctx.restore();
  }
  function drawBackdrop(ctx,center){
    if(!church)church=createChurch();
    ctx.save();ctx.translate(center.x,center.y);
    // Church placed behind and to the east of the memorial; not a cadastral survey.
    ctx.drawImage(church,50,-735,620,790);
    for(const [i,[x,y]] of graves.entries())drawGrave(ctx,x,y,i);
    for(const [x,y] of benches)drawBench(ctx,x,y);
    for(const [x,y] of trees){
      ctx.fillStyle='#364336';ctx.fillRect(x-11,y-70,22,85);
      ctx.strokeStyle='#616856';ctx.lineWidth=7;ctx.beginPath();ctx.moveTo(x,y-18);ctx.lineTo(x-31,y-70);ctx.moveTo(x,y-34);ctx.lineTo(x+34,y-92);ctx.stroke();
    }
    ctx.restore();
  }
  function drawRoad(ctx,path){
    if(globalThis.DenkmalTerrain?.drawRoad)return globalThis.DenkmalTerrain.drawRoad(ctx,path,{surface:'slabs'});
    ctx.save();ctx.lineJoin='round';ctx.beginPath();path.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.strokeStyle='#444b4088';ctx.lineWidth=80;ctx.stroke();ctx.strokeStyle='#999586';ctx.lineWidth=69;ctx.stroke();ctx.restore();
  }
  function drawSite(ctx,center){
    if(!site)site=createSite();ctx.drawImage(site,center.x-200,center.y-190);
  }
  function drawCanopies(ctx,center,actors){
    ctx.save();ctx.translate(center.x,center.y);
    trees.forEach(([x,y,r],i)=>{
      const near=actors?.some(a=>Math.hypot(a.x-center.x-x,a.y-center.y-y)<r+25);
      ctx.globalAlpha=near?.22:1;
      if(!globalThis.DenkmalForest?.drawCrown(ctx,x,y,r,i)){
        ctx.fillStyle='#3f5838';ctx.beginPath();ctx.arc(x,y-43,r,0,7);ctx.fill();
      }
    });ctx.restore();
  }
  function drawLion(ctx,m){
    ctx.save();ctx.translate(m.x,m.y);
    ctx.fillStyle='#151f1c88';ctx.beginPath();ctx.ellipse(5,11,108,24,0,0,7);ctx.fill();
    // Stone socle; grounded on the same y as the collision objective.
    for(const [x,y,w,h,color] of [[-94,-12,189,26,'#747a6c'],[-85,-25,170,16,'#a4a592'],[-78,-88,157,66,'#a49e89']]){
      ctx.fillStyle=color;ctx.fillRect(x,y,w,h);
    }
    ctx.strokeStyle='#d2cbb153';ctx.lineWidth=3;ctx.strokeRect(-76,-85,152,59);
    ctx.fillStyle='#625f50';ctx.fillRect(-62,-69,126,31);
    ctx.fillStyle='#d5c9a5';ctx.font='700 13px Georgia,serif';ctx.textAlign='center';ctx.fillText('1879',0,-49);
    // The sleeping lion: rounded reclining torso, drooped forelegs, mane and muzzle.
    ctx.fillStyle='#bcb69e';ctx.beginPath();ctx.ellipse(24,-102,69,24,-.1,0,7);ctx.fill();
    ctx.fillStyle='#a5a38d';ctx.beginPath();ctx.ellipse(64,-99,37,20,-.25,0,7);ctx.fill();
    ctx.fillStyle='#cbc4a8';ctx.beginPath();ctx.ellipse(-34,-111,26,28,.18,0,7);ctx.fill();
    for(let i=0;i<9;i++){const a=i*Math.PI*2/9;ctx.fillStyle=i%2?'#a69e83':'#d0c6a8';ctx.beginPath();ctx.ellipse(-35+Math.cos(a)*20,-112+Math.sin(a)*20,10,13,a,0,7);ctx.fill();}
    ctx.fillStyle='#d0c7ac';ctx.beginPath();ctx.ellipse(-51,-105,22,15,0,0,7);ctx.fill();
    ctx.fillStyle='#505247';ctx.fillRect(-64,-111,4,3);ctx.fillRect(-58,-101,6,3);
    ctx.fillStyle='#d0c8ab';ctx.beginPath();ctx.roundRect(-30,-93,76,12,6);ctx.fill();
    ctx.fillStyle='#a8a288';ctx.beginPath();ctx.roundRect(30,-91,58,9,4);ctx.fill();
    ctx.strokeStyle='#a8a68f';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(73,-106);ctx.quadraticCurveTo(110,-126,96,-87);ctx.stroke();
    if(m.hp/m.maxHp<.67){
      ctx.strokeStyle=m.hp/m.maxHp<.33?'#4d4b43':'#727466';ctx.lineWidth=2;ctx.beginPath();
      ctx.moveTo(-21,-84);ctx.lineTo(-8,-64);ctx.lineTo(-17,-46);ctx.lineTo(0,-31);ctx.stroke();
    }
    ctx.restore();
  }
  globalThis.DenkmalChurch={drawGround,drawBackdrop,drawRoad,drawSite,drawCanopies,drawLion,trees,graves};
})();