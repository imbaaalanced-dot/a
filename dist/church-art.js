/* TD2 Level 4 – Ender Dorfkirche and the 1879 sleeping-lion memorial.
   Composition uses public photo references, but dimensions and orientation are illustrative. */
(() => {
  'use strict';
  // Church center ~23 m N / ~6 m W of the memorial (OSM + Commons, approximate).
  // The model is 22 gameplay pixels per metre; footprint excludes decorative roof.
  const churchFrame={x:-500,y:-930,w:720,h:760};
  const trees=[[-760,-920,96],[-790,-130,105],[-510,510,90],[690,400,93],[670,-240,102],[360,-920,92]];
  const graves=[[-485,-245],[-390,60],[-540,150],[-350,235],[330,-290],[470,-430],[490,80],[-450,-105]];
  const benches=[[-500,125],[320,380]];
  let church=null,site=null,lionArt=null;
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
  // Reference pass 2: more legible masonry depth and warm/cool material hierarchy.
  // All marks are baked into the existing church canvas, not generated per frame.
  function paintChurchFinish(g){
    const light='#e2cfa6',deep='#343b3b';
    const rng=seeded(18021779);
    g.save();
    // Two clipped roof planes: staggered slate scales, moss and a pale stone ridge.
    polygon(g,[[289,75],[630,75],[600,211],[218,211]],null,null);
    g.clip();
    const roofLight=g.createLinearGradient(0,75,0,211);
    roofLight.addColorStop(0,'#89909936');
    roofLight.addColorStop(.5,'#59606b09');
    roofLight.addColorStop(1,'#121d2e66');
    g.fillStyle=roofLight;g.fillRect(211,72,425,144);
    for(let row=0;row<16;row++){
      const y=80+row*8.25;
      for(let col=0;col<35;col++){
        const x=218+col*13+((row%2)*6),n=rng();
        g.strokeStyle=n>.78?'#c6c7b650':n<.21?'#16212a7a':'#929ea53a';
        g.lineWidth=n>.9?1.35:.9;
        g.beginPath();g.moveTo(x,y);g.lineTo(x+11,y-1.5);g.stroke();
        if(n>.972){g.fillStyle='#8c9b786e';g.fillRect(x+2,y-2,6,2);}
      }
    }
    g.restore();
    // Deep gutter and thin eave highlight show the thickness of the nave.
    g.lineJoin='round';
    g.strokeStyle='#202b2cdd';g.lineWidth=10;g.beginPath();
    g.moveTo(140,270);g.lineTo(218,211);g.lineTo(600,211);g.stroke();
    g.strokeStyle='#e3cfa466';g.lineWidth=3;g.beginPath();
    g.moveTo(143,265);g.lineTo(219,207);g.lineTo(601,207);g.stroke();
    for(const x of [214,314,413,513]){
      // Buttresses frame the arched windows; low relief, not additional hitboxes.
      g.fillStyle='#29332ecc';g.fillRect(x+3,348,15,290);
      g.fillStyle='#9d9883';g.fillRect(x,345,12,285);
      g.fillStyle='#c7bba0';g.fillRect(x,344,3,281);
      g.fillStyle='#7d8175';g.fillRect(x-5,344,23,10);
      g.fillStyle='#a7a38a';g.fillRect(x-5,541,21,6);
      g.strokeStyle='#4c554e75';g.lineWidth=1;
      for(let y=376;y<620;y+=27){
        g.beginPath();g.moveTo(x,y);g.lineTo(x+11,y-2);g.stroke();
      }
    }
    // Existing triple windows: recessed glass, mullions and soft amber glow.
    for(const x of [247,345,443]){
      g.save();g.beginPath();g.roundRect(x+6,449,34,88,[18,18,2,2]);g.clip();
      const glass=g.createLinearGradient(x,449,x+34,537);
      glass.addColorStop(0,'#6d613e99');glass.addColorStop(.46,'#e6ad5266');
      glass.addColorStop(1,'#102e3acc');
      g.fillStyle=glass;g.fillRect(x+5,447,35,94);
      g.strokeStyle='#e6c68777';g.lineWidth=1.8;
      g.beginPath();g.moveTo(x+22,453);g.lineTo(x+22,532);
      g.moveTo(x+7,483);g.lineTo(x+39,483);g.stroke();g.restore();
      g.strokeStyle='#f1e1bf89';g.lineWidth=2;
      g.beginPath();g.moveTo(x+4,536);g.lineTo(x+41,536);g.stroke();
      g.fillStyle='#efad4236';g.fillRect(x+8,542,31,5);
    }
    // Tower stonework has a directional edge, carved bands and deep bell ports.
    g.fillStyle='#e1d4b030';g.fillRect(55,184,8,424);
    g.fillStyle='#28372d5e';g.fillRect(201,181,11,430);
    g.strokeStyle='#e2d4b36d';g.lineWidth=5;
    g.beginPath();g.moveTo(63,228);g.lineTo(203,228);
    g.moveTo(63,408);g.lineTo(203,408);
    g.moveTo(70,493);g.lineTo(198,493);g.stroke();
    for(let row=0;row<10;row++){
      const yy=236+row*25;
      g.strokeStyle=row%2?'#554f4677':'#decfb02d';g.lineWidth=1;
      g.beginPath();g.moveTo(66,yy);g.lineTo(197,yy);g.stroke();
    }
    g.strokeStyle='#202c2eaf';g.lineWidth=3;
    for(const x of [81,143]){
      g.beginPath();g.roundRect(x-3,170,31,60,[16,16,1,1]);g.stroke();
      g.strokeStyle='#d6bd8f83';g.lineWidth=2;g.beginPath();
      g.moveTo(x+6,187);g.lineTo(x+6,215);g.stroke();
    }
    // Roof apex and clock bezel catch the same upper-left light direction.
    g.strokeStyle=light+'92';g.lineWidth=3;
    g.beginPath();g.moveTo(47,145);g.lineTo(127,-16);g.stroke();
    g.strokeStyle='#f8e6c0b8';g.lineWidth=2;
    g.beginPath();g.arc(128,302,45,Math.PI*.7,Math.PI*1.7);g.stroke();
    g.strokeStyle=deep;g.lineWidth=2;
    g.beginPath();g.arc(128,302,37,0,Math.PI*2);g.stroke();
    // South portal in stepped stone, with a warm lamp instead of a flat door.
    g.fillStyle='#d3c5a899';g.beginPath();g.roundRect(90,513,80,105,[39,39,2,2]);g.fill();
    g.fillStyle='#26332f';g.beginPath();g.roundRect(98,521,64,95,[32,32,2,2]);g.fill();
    const portal=g.createLinearGradient(98,523,160,610);
    portal.addColorStop(0,'#98714794');portal.addColorStop(1,'#131c1c');
    g.fillStyle=portal;g.beginPath();g.roundRect(102,525,56,88,[28,28,1,1]);g.fill();
    g.strokeStyle='#d9c6a2';g.lineWidth=4;g.beginPath();g.roundRect(89,512,82,106,[40,40,1,1]);g.stroke();
    g.strokeStyle='#192522';g.lineWidth=3;g.beginPath();g.moveTo(130,551);g.lineTo(130,609);g.stroke();
    g.fillStyle='#f8cd7a';g.beginPath();g.arc(136,577,3,0,Math.PI*2);g.fill();
    g.fillStyle='#b5aa8b';g.fillRect(87,613,91,9);
    g.fillStyle='#5a614f';g.fillRect(85,622,95,5);
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
    // STYLE 2: Slate-scale courses, chipped ridges and aged roof patina.
    // Drawn once into the church bitmap; no new per-frame textures.
    g.save();
    g.beginPath();g.moveTo(289,75);g.lineTo(630,75);g.lineTo(600,211);g.lineTo(218,211);g.closePath();g.clip();
    const slate=seeded(1759);
    for(let row=0;row<14;row++){
      const yy=79+row*10.5;
      for(let col=0;col<26;col++){
        const xx=213+col*17+(row%2)*8;
        g.strokeStyle=['#a6adb238','#1b293251','#b5b6aa31','#202c3650'][Math.floor(slate()*4)];
        g.lineWidth=.8+slate()*.6;
        g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+14,yy-2);g.stroke();
        if(slate()<.11){g.fillStyle='#8a917d3b';g.fillRect(xx+3,yy-3,3+slate()*7,1.5);}
      }
    }
    g.restore();
    g.strokeStyle='#c2b89b83';g.lineWidth=3;g.beginPath();
    g.moveTo(288,77);g.lineTo(629,77);g.stroke();
    // Faint wall seams and natural sandstone discoloration stay inside the masonry.
    const masonry=seeded(1760);
    for(let i=0;i<110;i++){
      const x=220+masonry()*324,y=289+masonry()*360;
      g.strokeStyle=i%3?'#4d53482b':'#d1c4a02c';g.lineWidth=.8+masonry();
      g.beginPath();g.moveTo(x,y);g.lineTo(x+5+masonry()*12,y+1);g.stroke();
    }
    // Three tall arched windows with sandstone surrounds.
    for(const x of [247,345,443]){
      g.fillStyle='#c9c0a5';g.beginPath();g.roundRect(x,443,45,100,[22,22,4,4]);g.fill();
      const glass=g.createLinearGradient(x,449,x,537);
      glass.addColorStop(0,'#92714a');glass.addColorStop(.28,'#66583d');
      glass.addColorStop(.65,'#304344');glass.addColorStop(1,'#26373b');
      g.fillStyle=glass;g.beginPath();g.roundRect(x+5,449,35,88,[18,18,2,2]);g.fill();
      g.fillStyle='#f1bc6430';g.fillRect(x+9,474,5,37);
      g.strokeStyle='#9b9d8d';g.lineWidth=2;g.beginPath();g.moveTo(x+22,454);g.lineTo(x+22,531);g.stroke();
    }
    // Slate courses and ochre edge highlights define the church silhouette.
    g.strokeStyle='#cabf9c46';g.lineWidth=2;g.beginPath();
    g.moveTo(141,268);g.lineTo(218,210);g.lineTo(601,210);g.stroke();
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
    paintChurchFinish(g);
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
    // STYLE 2: stone fractures, moss in joints and autumn debris near the edges.
    // Preserve a clean reading area around the lion's collision point.
    for(let i=0;i<175;i++){
      const x=-155+rnd()*311,y=-133+rnd()*272;
      if(Math.abs(x)<91&&Math.abs(y)<92)continue;
      g.strokeStyle=['#38483b69','#d4c2a737','#51584851'][i%3];
      g.lineWidth=.6+rnd()*1.3;g.beginPath();g.moveTo(x,y);
      g.lineTo(x+2+rnd()*9,y+1+rnd()*6);
      if(i%4===0)g.lineTo(x+6+rnd()*11,y+4+rnd()*11);
      g.stroke();
    }
    for(let i=0;i<220;i++){
      const x=-158+rnd()*316,y=-135+rnd()*273;
      if(Math.abs(x)<105&&Math.abs(y)<93)continue;
      const w=2+rnd()*7;
      g.fillStyle=i%3===0?'#5366478a':i%3===1?'#8b744cad':'#ab8b5d9c';
      g.beginPath();g.ellipse(x,y,w,1+rnd()*2,rnd()*Math.PI,0,Math.PI*2);g.fill();
    }
    // Warm late-afternoon highlights are baked into the cached paving texture.
    const warm=g.createRadialGradient(-104,-89,5,-104,-89,113);
    warm.addColorStop(0,'#f6c77929');warm.addColorStop(1,'#f6c77900');
    g.fillStyle=warm;g.fillRect(-163,-139,210,215);
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
    // Westward and northward relative to lion. Southern facade clears the monument.
    const paintChurch=()=>ctx.drawImage(church,churchFrame.x,churchFrame.y,churchFrame.w,churchFrame.h);
    if(globalThis.Style2Phase6)globalThis.Style2Phase6.upright(ctx,{x:churchFrame.x+churchFrame.w/2,y:churchFrame.y+churchFrame.h},paintChurch);else paintChurch();
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
  // Draw the 1879 stone monument once to a transparent canvas and reuse it.
  // The real object is a tall, stepped and ornamented memorial with the lion on top;
  // see Commons Category:Ehrenmal_Schlafender_Löwe_(Ende).
  // Slightly richer south-facing stone sculpture without changing its anchor.
  function paintLionFinish(g){
    const rng=seeded(19071879);
    g.save();
    // Carved brow, nostrils and layered mane read even at mobile zoom.
    g.lineCap='round';
    g.strokeStyle='#f6e5bd71';g.lineWidth=2.4;
    g.beginPath();g.moveTo(-22,-272);g.quadraticCurveTo(-14,-280,-6,-273);
    g.moveTo(6,-273);g.quadraticCurveTo(15,-280,23,-272);g.stroke();
    g.strokeStyle='#4f5449ad';g.lineWidth=1.4;
    for(let side of [-1,1]){
      for(let row=0;row<5;row++){
        const x=side*(29+row%2*7),y=-275+row*11;
        g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x+side*11,y+8,x+side*2,y+15);g.stroke();
      }
    }
    g.fillStyle='#626251';for(const x of [-6,6]){
      g.beginPath();g.ellipse(x,-255,2.5,1.4,0,0,Math.PI*2);g.fill();
    }
    // Pedestal with dark corner seams and weathered stone blocks.
    g.strokeStyle='#4e5c5477';g.lineWidth=1.4;
    for(let y=-187;y<-48;y+=21){
      g.beginPath();g.moveTo(-89,y);g.lineTo(-68,y-2);
      g.moveTo(70,y-1);g.lineTo(88,y-1);g.stroke();
    }
    g.strokeStyle='#f5ddae78';g.lineWidth=2;
    g.strokeRect(-66,-166,134,101);
    g.strokeStyle='#a38c6099';g.lineWidth=2;
    g.strokeRect(-60,-160,123,91);
    // Low-contrast lichen outside inscription center, all cached.
    for(let i=0;i<95;i++){
      const x=-108+rng()*216,y=-227+rng()*208;
      if(y>-166&&y<-66&&Math.abs(x)<72)continue;
      g.fillStyle=i%2?'#5f815034':'#e5d4ab33';
      g.beginPath();g.ellipse(x,y,1+rng()*3,1+rng()*2,0,0,Math.PI*2);g.fill();
    }
    g.restore();
  }
  function createLionArt(){
    const canvas=document.createElement('canvas');canvas.width=320;canvas.height=380;
    const g=canvas.getContext('2d');g.translate(160,366);
    const grad=(x,y,w,h,colors)=>{
      const v=g.createLinearGradient(x,y,x+w,y+h);for(const [stop,color] of colors)v.addColorStop(stop,color);return v;
    };
    const stone=grad(-110,-200,210,160,[[0,'#d4c5a5'],[.38,'#b6a884'],[.65,'#999579'],[1,'#5c6556']]);
    g.fillStyle='#18251c55';g.beginPath();g.ellipse(9,4,113,19,0,0,Math.PI*2);g.fill();
    // Wide stepped plinth, left-facing front and dark stone side.
    polygon(g,[[-116,-17],[94,-17],[111,-33],[-95,-33]],'#c8bda0','#8f927b');
    polygon(g,[[94,-17],[111,-33],[111,-6],[94,1]],'#6f7564','#626957');
    g.fillStyle=grad(-108,-21,170,30,[[0,'#b9b195'],[.48,'#847e69'],[1,'#686c59']]);
    g.fillRect(-116,-17,210,18);g.fillRect(-106,-34,197,17);
    g.fillStyle='#d4c5a2';g.fillRect(-111,-40,205,7);
    g.fillStyle='#575c4c';g.fillRect(-92,-49,175,13);
    // Main masonry drum with shallow beveled corners; designed tall, not a low cube.
    g.fillStyle=stone;g.fillRect(-91,-188,179,141);
    polygon(g,[[88,-188],[105,-199],[105,-52],[88,-47]],'#727c6b','#555f53');
    polygon(g,[[-91,-188],[-75,-203],[105,-199],[88,-188]],'#c8bc9c','#817e6a');
    g.fillStyle=grad(0,-188,0,150,[[0,'#c3b596'],[.5,'#9f9c83'],[1,'#777a65']]);g.fillRect(-91,-188,179,17);
    g.fillStyle='#d9c9a9';g.fillRect(-97,-202,195,9);
    g.fillStyle='#6b6e5d';g.fillRect(-96,-209,197,7);
    g.fillStyle='#bfb294';g.fillRect(-103,-218,208,9);
    // Dark inset memorial plaque, bronze edge, four worn rivets.
    g.fillStyle='#7f826c';g.fillRect(-68,-168,137,105);
    g.fillStyle='#a9a68b';g.fillRect(-66,-166,132,101);
    g.fillStyle=grad(-61,-161,124,94,[[0,'#353f3e'],[.38,'#505953'],[1,'#1b2b2a']]);g.fillRect(-61,-161,124,93);
    g.strokeStyle='#ab9a77';g.lineWidth=2;g.strokeRect(-61,-161,124,93);
    g.strokeStyle='#716a54';g.lineWidth=1;g.strokeRect(-56,-156,114,83);
    for(const x of [-53,53])for(const y of [-151,-79]){
      g.fillStyle='#bfb08c';g.beginPath();g.arc(x,y,3,0,7);g.fill();
      g.fillStyle='#484e45';g.fillRect(x-1,y-1,2,2);
    }
    g.fillStyle='#c7ba96';g.textAlign='center';g.font='bold 12px Georgia,serif';
    g.fillText('ZUM ANDENKEN',0,-138);
    g.font='9px Georgia,serif';
    g.fillText('DER GEFALLENEN KRIEGER',0,-123);
    g.fillText('VON ENDE',0,-110);
    g.fillText('1864 · 1866 · 1870/71',0,-92);
    // Carved foliated rosettes bordering the front slab.
    function relief(x,sy){
      g.save();g.translate(x,sy);
      g.strokeStyle='#ded0ad';g.lineWidth=3;g.beginPath();g.moveTo(0,35);g.bezierCurveTo(-9,12,12,-10,0,-37);g.stroke();
      for(let j=0;j<6;j++){const yy=-24+j*10;
        g.fillStyle=j%2?'#b3a889':'#d9cbab';g.beginPath();g.ellipse(j%2?8:-8,yy,7,11,j%2?-.8:.8,0,7);g.fill();
      }
      g.restore();
    }
    relief(-80,-119);relief(80,-119);
    // Layered foot molding / lower inscription.
    g.fillStyle='#797a65';g.fillRect(-103,-56,210,7);
    g.fillStyle='#c8b898';g.fillRect(-97,-63,198,7);
    g.fillStyle='#9c997f';g.fillRect(-90,-49,178,18);
    g.fillStyle='#d9c9a3';g.fillRect(-95,-44,189,6);
    g.fillStyle='#696e5d';g.fillRect(-93,-31,187,5);
    g.textAlign='center';g.font='bold 14px Georgia,serif';g.fillStyle='#e6d5ad';g.fillText('1879',0,-34);
    // Top cornice to separate sculpture from masonry.
    polygon(g,[[-110,-222],[-92,-237],[97,-237],[111,-223]],'#bfb094','#6e7466');
    g.fillStyle='#d4c8a7';g.fillRect(-113,-229,223,9);
    g.fillStyle='#767d69';g.fillRect(-110,-219,220,7);
    // Quarter-turn in ground space: west-facing profile becomes south-facing.
    // Redraw the foreshortened sculpture; rotating its bitmap would tip it sideways.
    const fur=grad(-65,-312,130,90,[[0,'#e1d3b0'],[.4,'#bcae89'],[1,'#737b68']]);
    // Reclining body recedes north behind the lowered head.
    g.fillStyle=fur;g.beginPath();g.ellipse(7,-282,48,32,0,0,Math.PI*2);g.fill();
    g.fillStyle='#b5a784';g.beginPath();g.ellipse(9,-302,35,16,0,0,Math.PI*2);g.fill();
    g.strokeStyle='#ddd0ad';g.lineWidth=4;g.beginPath();
    g.moveTo(39,-293);g.bezierCurveTo(66,-310,73,-279,49,-274);g.stroke();
    // Paired forelegs point south, resting on the front cornice.
    for(const x of [-31,31]){
      g.fillStyle=fur;g.beginPath();g.ellipse(x,-246,16,24,0,0,Math.PI*2);g.fill();
      g.fillStyle='#d0c09a';g.beginPath();g.ellipse(x,-229,21,9,0,0,Math.PI*2);g.fill();
      g.strokeStyle='#827c65';g.lineWidth=1.5;
      for(let toe=-1;toe<=1;toe++){g.beginPath();g.moveTo(x+toe*7,-232);g.lineTo(x+toe*7,-225);g.stroke();}
    }
    // Symmetrical mane, ears and closed eyes establish the new frontal view.
    g.fillStyle=grad(-47,-295,94,70,[[0,'#e0d0ac'],[.5,'#b2a17f'],[1,'#6b7462']]);
    g.beginPath();g.ellipse(0,-265,45,35,0,0,Math.PI*2);g.fill();
    const rand=seeded(1879);
    for(let i=0;i<26;i++){
      const angle=i*Math.PI*2/26,x=Math.cos(angle)*35,y=-265+Math.sin(angle)*26;
      g.strokeStyle=i%3?'#7d806eaa':'#ecdec2bb';g.lineWidth=1.5;
      g.beginPath();g.moveTo(x*.8,-265+(y+265)*.8);g.quadraticCurveTo(x+4,y+5,x,y+10);g.stroke();
    }
    for(const x of [-26,26]){g.fillStyle='#b7a580';g.beginPath();g.ellipse(x,-284,10,9,0,0,Math.PI*2);g.fill();}
    g.fillStyle='#d7c5a1';g.beginPath();g.ellipse(0,-266,28,23,0,0,Math.PI*2);g.fill();
    g.strokeStyle='#615c49';g.lineWidth=2;
    for(const x of [-13,13]){g.beginPath();g.moveTo(x-6,-270);g.quadraticCurveTo(x,-266,x+6,-270);g.stroke();}
    g.fillStyle='#c2b18b';g.beginPath();g.ellipse(-9,-253,13,9,0,0,Math.PI*2);g.ellipse(9,-253,13,9,0,0,Math.PI*2);g.fill();
    polygon(g,[[-7,-260],[7,-260],[0,-253]],'#555849');
    g.strokeStyle='#6c6651';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-253);g.lineTo(0,-248);g.stroke();
    // Lichen and patina, retained within carved limestone and pedestal.
    for(let i=0;i<170;i++){
      const x=-108+rand()*212,y=-214+rand()*208;
      if(y>-180&&y<-65&&Math.abs(x)<72)continue; // don't obscure bronze inscription
      g.fillStyle=i%5?'#61735721':'#e0d8b326';
      g.beginPath();g.ellipse(x,y,1+rand()*3,1+rand()*2,0,0,7);g.fill();
    }
    paintLionFinish(g);
    return canvas;
  }
  function drawLion(ctx,m){
    if(!lionArt)lionArt=createLionArt();
    // Contact shadow belongs to the collision point. Everything else is cached.
    ctx.save();ctx.fillStyle='#17251b66';ctx.beginPath();
    ctx.ellipse(m.x,m.y+6,119,25,0,0,Math.PI*2);ctx.fill();
    // Deliberately 20% smaller than the source canvas: the church dominates.
    ctx.drawImage(lionArt,m.x-128,m.y-293,256,304);
    if(m.hp/m.maxHp<.67){
      ctx.strokeStyle=m.hp/m.maxHp<.33?'#4a4f45':'#85816c';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(m.x-43,m.y-151);ctx.lineTo(m.x-30,m.y-135);
      ctx.lineTo(m.x-41,m.y-112);ctx.lineTo(m.x-24,m.y-89);ctx.stroke();
    }
    ctx.restore();
  }
  globalThis.DenkmalChurch={drawGround,drawBackdrop,drawRoad,drawSite,drawCanopies,drawLion,churchFrame,trees,graves};
})();