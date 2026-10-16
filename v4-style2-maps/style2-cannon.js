/* Denkmal TD2 Style 2 cannon graphics.
 * Three cached 2.5D tower illustrations, matching ballistics and impact frames.
 * Visual module only: tower stats, projectile collisions and damage are unchanged. */
(() => {
  'use strict';
  const towerCache=new Map(),shellCache=new Map(),impactCache=new Map();
  const clampLevel=value=>Math.max(1,Math.min(3,Math.floor(Number(value)||1)));
  const palette=[
    {stone:'#827d69',edge:'#c4b697',side:'#4e5047',wood:'#805b3b',iron:'#5e625e',gold:'#bd9662'},
    {stone:'#969687',edge:'#cfc5a9',side:'#575a54',wood:'#785b41',iron:'#434c50',gold:'#bba172'},
    {stone:'#9f9a87',edge:'#ddd0a8',side:'#4c554e',wood:'#645845',iron:'#354146',gold:'#dfaf60'}
  ];
  function canvas(width,height){
    const c=document.createElement('canvas');c.width=width;c.height=height;return c;
  }
  function polygon(g,pts,fill,stroke,width=2){
    g.beginPath();pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();
    if(fill){g.fillStyle=fill;g.fill();}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
  }
  function ellipse(g,x,y,rx,ry,fill,stroke,width=1){
    g.beginPath();g.ellipse(x,y,rx,ry,0,0,Math.PI*2);
    if(fill){g.fillStyle=fill;g.fill();}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
  }
  function makeTower(level){
    const c=canvas(240,256),g=c.getContext('2d'),p=palette[level-1];
    const seed=117+level*193;let s=seed;
    const rnd=()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);
    ellipse(g,121,226,85,18,'#1019148a');
    polygon(g,[[38,185],[111,168],[207,190],[126,222]],p.edge,'#3a3f38',3);
    polygon(g,[[38,185],[126,222],[126,236],[38,202]],p.stone,'#4b5146');
    polygon(g,[[126,222],[207,190],[207,207],[126,236]],p.side,'#363e39');
    // Stone blocks: muted highlights and carved mortar.
    for(let i=0;i<13;i++){
      const x=46+rnd()*146,y=186+rnd()*24;
      g.strokeStyle=i%2?'#313c3959':'#ede0bc55';g.lineWidth=1;
      g.beginPath();g.moveTo(x,y);g.lineTo(x+7+rnd()*10,y+1);g.stroke();
    }
    polygon(g,[[54,143],[113,123],[188,146],[125,178]],p.edge,'#4d5247',3);
    polygon(g,[[54,143],[125,178],[125,213],[54,180]],p.stone,'#52594c');
    polygon(g,[[125,178],[188,146],[188,186],[125,213]],p.side,'#2e3836');
    // Braces and side armor progress with the tower level.
    for(let i=0;i<level;i++){
      const yy=151+i*12;
      g.strokeStyle=level===1?'#b58b55':'#c6a56d';
      g.lineWidth=level===3?4:3;
      g.beginPath();g.moveTo(65,yy);g.lineTo(120,yy+20);g.stroke();
    }
    if(level===1){
      // Timber scaffolding and a small, dark bronze barrel for wooden ammunition.
      for(const x of [66,173]){
        g.fillStyle='#684728';g.fillRect(x,104,13,61);
        g.fillStyle='#b08758';g.fillRect(x+1,104,3,58);
      }
      g.strokeStyle='#674c35';g.lineWidth=10;g.beginPath();
      g.moveTo(70,157);g.lineTo(167,118);g.stroke();
      g.strokeStyle='#b38c60';g.lineWidth=4;g.stroke();
      ellipse(g,113,135,26,29,'#685a45','#2e3531',3);
    }else{
      // Large masonry cheeks and protective iron support plates.
      polygon(g,[[52,103],[82,89],[97,157],[69,172]],'#71756a','#353d3c');
      polygon(g,[[164,103],[185,113],[177,166],[152,154]],'#626963','#323b3b');
      g.fillStyle=p.iron;g.fillRect(63,146,111,13);
      g.fillStyle='#d4b784';g.fillRect(71,149,95,3);
      if(level===3){
        // Tier III furnace frame / thick shielding, not merely a recolor.
        polygon(g,[[74,91],[109,78],[158,92],[163,127],[73,126]],'#5f6863','#dbb566',4);
        for(const x of [82,154]){g.fillStyle='#e0ad61';g.fillRect(x,102,5,25);}
        ellipse(g,121,120,19,13,'#aa6637','#f0b65f',3);
      }
    }
    // Barrel: same cannon silhouette with progressively reinforced metal and muzzle.
    g.save();g.translate(120,121);g.rotate(-.25);
    const barrel=g.createLinearGradient(-35,-66,35,24);
    if(level===1){barrel.addColorStop(0,'#99724a');barrel.addColorStop(.5,'#5b4a36');barrel.addColorStop(1,'#3e403b');}
    else if(level===2){barrel.addColorStop(0,'#adb1aa');barrel.addColorStop(.5,'#586264');barrel.addColorStop(1,'#2d373a');}
    else{barrel.addColorStop(0,'#d1ad6f');barrel.addColorStop(.45,'#5b6967');barrel.addColorStop(1,'#283436');}
    polygon(g,[[-29,-53],[24,-53],[33,27],[-34,27]],barrel,'#263135',4);
    for(const y of level===1?[-19]:[-37,-8,17]){
      g.strokeStyle=level===1?'#c29a6b':level===2?'#a3a9a3':'#e2b46d';
      g.lineWidth=level===3?7:5;g.beginPath();g.moveTo(-30,y);g.lineTo(28,y);g.stroke();
    }
    ellipse(g,-2,-53,31,12,level===1?'#92704c':'#869089','#273033',5);
    ellipse(g,-2,-53,22,7,level===3?'#d67830':'#222b2d',level===3?'#efb86a':'#4f5756',3);
    if(level===3)ellipse(g,-2,-53,11,4,'#ffc67d');
    g.restore();
    // Dark-fantasy scratches and lichen are baked once, not sampled per frame.
    for(let i=0;i<90;i++){
      const x=53+rnd()*136,y=144+rnd()*64;
      g.fillStyle=i%5===0?'#bcb69252':'#44574337';
      g.fillRect(x,y,1+rnd()*3,.5+rnd()*2);
    }
    if(level===3){
      for(let i=0;i<7;i++){
        g.strokeStyle=i%2?'#eab367b4':'#f4d5919c';g.lineWidth=2;
        g.beginPath();g.moveTo(92+i*8,83);g.lineTo(96+i*7,78-(i%3)*5);g.stroke();
      }
    }
    return c;
  }
  function tower(ctx,x,y,level,reduced=false){
    level=clampLevel(level);
    if(!towerCache.has(level))towerCache.set(level,makeTower(level));
    const art=towerCache.get(level),size=[94,102,110][level-1];
    ctx.save();ctx.globalAlpha*=1;
    if(!reduced&&level===3){ctx.shadowColor='#e2a45f';ctx.shadowBlur=7;}
    ctx.drawImage(art,x-size/2,y+13-size,size,size);
    ctx.restore();return true;
  }
  function makeShell(level){
    const c=canvas(80,80),g=c.getContext('2d');
    ellipse(g,40,43,level===3?20:17,level===3?20:17,level===1?'#765438':'#222c2e','#131b1c',2);
    if(level===1){
      // Rough hardwood sphere, its grain still visible at mobile zoom.
      g.strokeStyle='#c59a65';g.lineWidth=2;
      for(const yy of [33,41,50]){g.beginPath();g.moveTo(28,yy);g.quadraticCurveTo(40,yy-7,50,yy+2);g.stroke();}
      ellipse(g,34,33,6,4,'#d5ae73a0');
    }else if(level===2){
      ellipse(g,34,34,7,5,'#c2c3ae');
      g.strokeStyle='#717c7e';g.lineWidth=3;g.beginPath();g.arc(40,43,14,-2,-.2);g.stroke();
    }else{
      ellipse(g,40,42,15,15,'#b85928','#d39c53',2);
      ellipse(g,40,41,9,9,'#f7a442');
      ellipse(g,37,37,4,4,'#fff3b5');
      g.strokeStyle='#ffd688';g.lineWidth=2;
      for(let i=0;i<6;i++){
        const a=(i/6)*Math.PI*2;
        g.beginPath();g.moveTo(40+Math.cos(a)*20,42+Math.sin(a)*20);
        g.lineTo(40+Math.cos(a)*27,42+Math.sin(a)*27);g.stroke();
      }
    }
    return c;
  }
  function projectile(ctx,bullet,reduced=false){
    if(bullet?.kind!=='cannon')return false;
    const level=clampLevel(bullet.level);
    if(!shellCache.has(level))shellCache.set(level,makeShell(level));
    const art=shellCache.get(level),size=[20,23,27][level-1];
    const angle=Math.atan2(bullet.vy||0,bullet.vx||1);
    ctx.save();ctx.translate(bullet.x,bullet.y);
    if(!reduced){
      ctx.rotate(angle);ctx.strokeStyle=level===3?'#f4a657':'#776958';
      ctx.globalAlpha=.45;ctx.lineWidth=level===3?4:2;
      ctx.beginPath();ctx.moveTo(-size*.4,0);ctx.lineTo(-size*1.8,0);ctx.stroke();
      ctx.globalAlpha=1;
    }
    ctx.drawImage(art,-size/2,-size/2,size,size);ctx.restore();return true;
  }
  function makeImpact(level,frame){
    const c=canvas(144,144),g=c.getContext('2d');
    const t=frame/5,size=level===1?25:level===2?35:46;
    const radius=(.45+t*.95)*size,alpha=Math.max(.06,1-t);
    const colors=[['#9e805c','#d3b284'],['#788287','#ced1c1'],['#d57031','#ffd18c']][level-1];
    const aura=g.createRadialGradient(72,72,0,72,72,radius);
    aura.addColorStop(0,level===3?'#ffe5a9a0':'#e9d6a155');
    aura.addColorStop(.45,level===3?'#ef8f3c6c':'#84796658');
    aura.addColorStop(1,'#00000000');
    g.fillStyle=aura;g.fillRect(72-radius,72-radius,radius*2,radius*2);
    g.globalAlpha=alpha;
    g.strokeStyle=colors[1];g.lineWidth=level===3?5:level===2?4:3;
    g.beginPath();g.arc(72,72,radius*.85,0,Math.PI*2);g.stroke();
    for(let i=0;i<12;i++){
      const a=i*Math.PI/6+.33,dist=radius*(.65+(i%3)*.13);
      const x=72+Math.cos(a)*dist,y=72+Math.sin(a)*dist;
      g.fillStyle=i%2?colors[0]:colors[1];
      if(level===3){g.beginPath();g.arc(x,y,2.5+(i%4),0,Math.PI*2);g.fill();}
      else polygon(g,[[x-2,y-3],[x+3,y-2],[x+1,y+3],[x-3,y+2]],g.fillStyle,null);
    }
    if(level===3){
      const core=g.createRadialGradient(72,72,0,72,72,18*(1-t*.7));
      core.addColorStop(0,'#fff7be');core.addColorStop(.4,'#ffb348');core.addColorStop(1,'#e0612100');
      g.fillStyle=core;g.beginPath();g.arc(72,72,22*(1-t*.65),0,Math.PI*2);g.fill();
    }
    return c;
  }
  function impact(ctx,particle){
    if(!particle?.cannonImpact)return false;
    const level=clampLevel(particle.level);
    const ratio=Math.max(0,Math.min(1,1-Math.max(0,particle.life)/Math.max(.001,particle.max)));
    const frame=Math.min(5,Math.floor(ratio*6));
    const key=level*10+frame;
    if(!impactCache.has(key))impactCache.set(key,makeImpact(level,frame));
    const sprite=impactCache.get(key),size=[67,84,104][level-1];
    ctx.save();ctx.globalAlpha*=Math.max(.05,1-ratio*.9);
    ctx.drawImage(sprite,particle.x-size/2,particle.y-size/2,size,size);
    ctx.restore();return true;
  }
  globalThis.Style2Cannon={
    drawTower:tower,drawProjectile:projectile,drawImpact:impact,
    // Counts are for lightweight regression tests and diagnostics, not HUD.
    cacheCounts:()=>({towers:towerCache.size,shells:shellCache.size,impactFrames:impactCache.size})
  };
})();
