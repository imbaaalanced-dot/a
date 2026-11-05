/* Level 4 reference pass: cached architectural ground dressing for Style 2.
   Visual only: never modifies walkable routes, pads, collision or progression. */
(()=>{
  'use strict';
  const church=globalThis.DenkmalChurch;
  const levels=globalThis.DenkmalLevels;
  const layout=levels?.levels?.[4],center=levels?.center;
  if(!church||!layout||!center)return;
  const REGION=2048,RESOLUTION=1024,origin={x:center.x-REGION/2,y:center.y-REGION/2};
  let ground=null,lantern=null,builds=0;
  function rnd(seed){return ()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);}
  const random=rnd(18791879);
  function clear(x,y,road=112,pad=91){
    const f=layout.churchFootprint;
    if(Math.hypot(x-center.x,y-center.y)<188)return false;
    if(f&&x>center.x+f.left-95&&x<center.x+f.right+95&&
       y>center.y+f.top-95&&y<center.y+f.bottom+95)return false;
    if(layout.paths.some(p=>levels.pathDistance({x,y},p)<road))return false;
    return layout.slots.every(p=>Math.hypot(x-p.x,y-p.y)>pad);
  }
  const lamps=[[-655,-525],[280,-985],[640,-405],[-590,170],[310,475],[595,310]]
    .map(([x,y])=>({x:center.x+x,y:center.y+y}))
    .filter(p=>clear(p.x,p.y,73,75));
  const stoneLines=[
    [[-580,-870],[-580,-510]],
    [[-600,-480],[-600,-325]],
    [[290,-875],[290,-505]],
    [[-450,-135],[-260,-135]],
    [[-370,385],[-240,385]],
    [[270,410],[390,410]]
  ];
  function scatter(g,x,y,r,i){
    g.fillStyle=i%5===0?'#9b794536':'#52624633';
    g.beginPath();g.ellipse(x,y,r*3.2,r*1.3,i%4*.18,0,Math.PI*2);g.fill();
    if(i%3===0){
      g.fillStyle='#14221866';g.beginPath();g.ellipse(x+4,y+5,r*.85,r*.32,0,0,Math.PI*2);g.fill();
      g.fillStyle=i%2?'#949282':'#74796b';
      g.beginPath();g.ellipse(x,y,r*.74,r*.42,-.2,0,Math.PI*2);g.fill();
      g.strokeStyle='#d0bfa05c';g.lineWidth=1.3;g.beginPath();
      g.moveTo(x-r*.55,y-r*.10);g.lineTo(x+r*.22,y-r*.24);g.stroke();
    }else{
      for(let n=0;n<4;n++){
        const a=n*Math.PI/2+i,rr=r*(.3+(n%2)*.3);
        g.fillStyle=['#647749aa','#84925398','#a18a5980','#475d448f'][n];
        g.beginPath();g.ellipse(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.65,r*.52,r*.21,a,0,Math.PI*2);g.fill();
      }
    }
  }
  function wallStone(g,x,y,angle,index){
    g.save();g.translate(x,y);g.rotate(angle);
    g.fillStyle='#111f1b77';g.fillRect(-16,-1,33,13);
    g.fillStyle=index%4===0?'#b5ad96':'#918f7c';g.fillRect(-17,-8,31,10);
    g.fillStyle='#646c63';g.fillRect(-17,2,31,7);
    g.strokeStyle='#d3c7a050';g.lineWidth=1;g.strokeRect(-17,-8,31,10);
    if(index%4===0){g.fillStyle='#63715377';g.fillRect(-12,-6,11,3);}
    g.restore();
  }
  function buildGround(){
    ground=document.createElement('canvas');
    ground.width=ground.height=RESOLUTION;builds++;
    const g=ground.getContext('2d');g.save();
    g.scale(RESOLUTION/REGION,RESOLUTION/REGION);
    g.translate(-origin.x,-origin.y);
    // Small, subdued garden and stone remnants: no painted roads or moving elements.
    for(let i=0;i<760;i++){
      const x=origin.x+random()*REGION,y=origin.y+random()*REGION;
      if(!clear(x,y,111,93))continue;
      scatter(g,x,y,3+random()*10,i);
    }
    for(const [[ax,ay],[bx,by]] of stoneLines){
      const sx=center.x+ax,sy=center.y+ay,ex=center.x+bx,ey=center.y+by;
      const distance=Math.hypot(ex-sx,ey-sy),count=Math.floor(distance/31),angle=Math.atan2(ey-sy,ex-sx);
      for(let k=0;k<=count;k++){
        const t=(k+.5)/(count+1),x=sx+(ex-sx)*t,y=sy+(ey-sy)*t;
        if(clear(x,y,117,107))wallStone(g,x,y,angle,k);
      }
    }
    // Restrained baked warm pools. Every light has a fixed world position.
    for(const p of lamps){
      const glow=g.createRadialGradient(p.x,p.y,4,p.x,p.y,135);
      glow.addColorStop(0,'#e9af5c47');glow.addColorStop(.4,'#ad82372b');
      glow.addColorStop(1,'#70591a00');
      g.fillStyle=glow;g.fillRect(p.x-135,p.y-135,270,270);
    }
    g.restore();
  }
  function buildLantern(){
    lantern=document.createElement('canvas');lantern.width=70;lantern.height=155;builds++;
    const c=lantern.getContext('2d');
    c.fillStyle='#101c1b55';c.beginPath();c.ellipse(34,149,30,5,0,0,Math.PI*2);c.fill();
    c.fillStyle='#42433c';c.fillRect(29,48,10,101);
    c.fillStyle='#b8a880';c.fillRect(28,48,3,98);
    c.fillStyle='#1e2826';c.fillRect(22,35,25,30);
    c.fillStyle='#bd9158';c.fillRect(26,39,17,22);
    const glass=c.createLinearGradient(26,40,43,60);
    glass.addColorStop(0,'#fff3b2');glass.addColorStop(.55,'#ffc872');glass.addColorStop(1,'#8e522a');
    c.fillStyle=glass;c.fillRect(28,41,13,18);
    c.strokeStyle='#29322e';c.lineWidth=3;
    c.strokeRect(26,39,17,22);c.beginPath();c.moveTo(34,39);c.lineTo(34,61);c.stroke();
    c.fillStyle='#292e2a';c.beginPath();c.moveTo(18,35);c.lineTo(35,20);c.lineTo(51,35);c.closePath();c.fill();
    c.strokeStyle='#a99b74';c.lineWidth=2;c.stroke();
    c.fillStyle='#d3b16d';c.fillRect(32,18,5,5);
  }
  const oldGround=church.drawGround,oldSite=church.drawSite;
  church.drawGround=function(ctx,camera,width,height){
    const value=oldGround.apply(this,arguments);
    if(!ground)buildGround();
    const x=Math.max(origin.x,camera.x),y=Math.max(origin.y,camera.y);
    const right=Math.min(origin.x+REGION,camera.x+width),bottom=Math.min(origin.y+REGION,camera.y+height);
    if(right>x&&bottom>y){
      const factor=RESOLUTION/REGION;
      ctx.drawImage(ground,(x-origin.x)*factor,(y-origin.y)*factor,(right-x)*factor,(bottom-y)*factor,x,y,right-x,bottom-y);
    }
    return value;
  };
  church.drawSite=function(ctx,location){
    const result=oldSite.apply(this,arguments);
    if(!lantern)buildLantern();
    for(const p of lamps){
      const paint=()=>ctx.drawImage(lantern,p.x-35,p.y-152,70,155);
      if(globalThis.Style2Phase6?.upright)globalThis.Style2Phase6.upright(ctx,p,paint);
      else paint();
    }
    return result;
  };
  globalThis.Style2Level4Reference={clear,lamps,origin,region:REGION,get builds(){return builds;}};
})();