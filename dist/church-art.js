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
    // Curved rows of small cobbles visible around the real memorial plinth.
    // No oversized square paving slabs around the lion.
    g.save();g.beginPath();g.rect(-164,-139,328,286);g.clip();
    g.fillStyle='#505e4c';g.fillRect(-164,-139,328,286);
    for(let radius=25;radius<500;radius+=17){
      const count=Math.ceil(Math.PI*2*radius/22);
      for(let i=0;i<count;i++){
        const angle=(i+(Math.floor(radius/17)%2)*.5)*Math.PI*2/count;
        const x=Math.cos(angle)*radius,y=150+Math.sin(angle)*radius;
        g.save();g.translate(x,y);g.rotate(angle+Math.PI/2);
        g.fillStyle=['#a09d89','#7f8578','#b6ae93','#898d7b'][Math.floor(rnd()*4)];
        g.beginPath();g.roundRect(-9,-6,18,12,2);g.fill();g.restore();
      }
    }
    g.restore();
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
    ctx.drawImage(church,churchFrame.x,churchFrame.y,churchFrame.w,churchFrame.h);
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
    // Sleeping lion silhouette: paws forward, lowered head, calm expression,
    // long mane, reclining shoulders, haunches and curled tail.
    const fur=grad(-72,-298,160,90,[[0,'#e1d3b0'],[.26,'#c1b28d'],[.65,'#a39979'],[1,'#777d69']]);
    g.fillStyle=fur;g.beginPath();g.moveTo(-52,-257);
    g.bezierCurveTo(-47,-278,-24,-292,0,-289);
    g.bezierCurveTo(32,-302,66,-277,84,-255);
    g.bezierCurveTo(94,-240,74,-229,55,-234);
    g.bezierCurveTo(20,-239,-2,-235,-33,-238);
    g.quadraticCurveTo(-64,-234,-52,-257);g.fill();
    // Haunches rise above the back rather than round blobs.
    g.fillStyle='#b6a986';g.beginPath();g.ellipse(67,-267,27,21,-.43,0,7);g.fill();
    g.strokeStyle='#e1d2b0';g.lineWidth=5;g.beginPath();
    g.moveTo(81,-254);g.bezierCurveTo(115,-264,121,-229,88,-228);
    g.bezierCurveTo(75,-226,75,-238,83,-237);g.stroke();
    // Mane with a cohesive outline; strands are sculpted curved grooves.
    g.fillStyle=grad(-79,-294,85,80,[[0,'#e0d0ac'],[.47,'#b2a17f'],[1,'#6b7462']]);
    g.beginPath();g.moveTo(-35,-291);
    g.bezierCurveTo(-58,-319,-87,-300,-79,-268);
    g.bezierCurveTo(-90,-253,-74,-241,-77,-229);
    g.bezierCurveTo(-63,-230,-53,-222,-40,-227);
    g.bezierCurveTo(-16,-226,-13,-245,-23,-265);
    g.bezierCurveTo(-12,-285,-25,-290,-35,-291);g.fill();
    const rand=seeded(1879);
    for(let i=0;i<26;i++){
      const x=-76+rand()*55,y=-290+rand()*55;
      g.strokeStyle=i%3?'#7d806eaa':'#ecdec2bb';g.lineWidth=1.7+rand()*1.1;
      g.beginPath();g.moveTo(x,y);g.quadraticCurveTo(x-9,y+12,x+2,y+19);g.stroke();
    }
    // Lion's sleeping muzzle points to the west.
    g.fillStyle='#d7c5a1';g.beginPath();
    g.moveTo(-70,-281);g.quadraticCurveTo(-100,-287,-102,-266);
    g.quadraticCurveTo(-103,-253,-84,-251);g.quadraticCurveTo(-67,-250,-60,-267);g.closePath();g.fill();
    g.strokeStyle='#504b3f';g.lineWidth=2;
    g.beginPath();g.moveTo(-93,-270);g.quadraticCurveTo(-86,-265,-80,-270);g.stroke(); // closed eye
    g.fillStyle='#444a43';g.beginPath();g.ellipse(-102,-259,7,5,.2,0,7);g.fill(); // nose
    g.strokeStyle='#535548';g.lineWidth=1;g.beginPath();g.moveTo(-99,-254);g.quadraticCurveTo(-88,-248,-78,-254);g.stroke();
    // Broad forepaws reach the lion's front ledge.
    for(const [x,y] of [[-32,-237],[17,-239]]){
      g.fillStyle='#bdb08c';g.beginPath();g.ellipse(x,y,28,10,.03,0,7);g.fill();
      g.strokeStyle='#847b64';g.lineWidth=1.7;
      for(let i=0;i<3;i++){g.beginPath();g.moveTo(x+8+i*6,y-4);g.lineTo(x+8+i*6,y+5);g.stroke();}
    }
    // Lichen and patina, retained within carved limestone and pedestal.
    for(let i=0;i<170;i++){
      const x=-108+rand()*212,y=-214+rand()*208;
      if(y>-180&&y<-65&&Math.abs(x)<72)continue; // don't obscure bronze inscription
      g.fillStyle=i%5?'#61735721':'#e0d8b326';
      g.beginPath();g.ellipse(x,y,1+rand()*3,1+rand()*2,0,0,7);g.fill();
    }
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