/* Denkmal TD2 Style 2: bow, mage and rift.
 * Purely visual, cached 2.5D canvas drawings. Combat values never change. */
(() => {
  'use strict';
  const kinds=new Set(['bow','mage','rift']);
  const tier=value=>Math.max(1,Math.min(3,Math.floor(Number(value)||1)));
  const towerCache=new Map(),projectileCache=new Map(),impactCache=new Map();
  const palettes={
    bow:{base:'#858576',edge:'#c0ae89',dark:'#484f46',trim:'#d1a66a',light:'#f6d89b'},
    mage:{base:'#79878c',edge:'#b0bec0',dark:'#364956',trim:'#68b8d8',light:'#b2eeff'},
    rift:{base:'#77717e',edge:'#afa5ad',dark:'#3b344e',trim:'#b27cd5',light:'#f1b6ff'}
  };
  function canvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
  function polygon(g,points,fill,stroke,width=2){
    g.beginPath();points.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.closePath();
    if(fill){g.fillStyle=fill;g.fill();}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
  }
  function circle(g,x,y,r,fill,stroke,width=2){
    g.beginPath();g.arc(x,y,r,0,Math.PI*2);
    if(fill){g.fillStyle=fill;g.fill();}
    if(stroke){g.strokeStyle=stroke;g.lineWidth=width;g.stroke();}
  }
  function line(g,pts,color,width){
    g.strokeStyle=color;g.lineWidth=width;g.lineCap='round';g.beginPath();
    pts.forEach(([x,y],i)=>i?g.lineTo(x,y):g.moveTo(x,y));g.stroke();
  }
  function stone(g,p,level){
    // Identical footprint at every tier, compatible with fixed tower pads.
    g.fillStyle='#17231b66';g.beginPath();g.ellipse(120,230,90,17,0,0,Math.PI*2);g.fill();
    polygon(g,[[32,191],[116,163],[207,192],[125,225]],p.edge,'#323d37',3);
    polygon(g,[[32,191],[125,225],[125,239],[32,206]],p.base,'#464d43');
    polygon(g,[[125,225],[207,192],[207,208],[125,239]],p.dark,'#343b38');
    for(let i=0;i<8;i++){
      const x=48+i*19,y=191+(i%3)*6;
      line(g,[[x,y],[x+8,y+3]],i%2?'#322f2f70':'#d1c39a69',1.1);
    }
    if(level>1){
      polygon(g,[[45,174],[114,151],[194,174],[126,201]],p.base,p.edge,2);
      polygon(g,[[126,201],[194,174],[194,193],[126,219]],p.dark,'#30363b');
      for(const x of [62,177])circle(g,x,184,4,p.trim);
    }
    if(level===3){
      polygon(g,[[48,157],[113,136],[192,158],[124,181]],p.edge,p.trim,3);
      polygon(g,[[124,181],[192,158],[192,172],[124,198]],p.dark,null);
    }
  }
  function bowTower(g,level,p){
    // L1 watch platform; L2 reinforced ballista gallery; L3 high twin-bow battlement.
    const topY=level===1?129:level===2?112:97;
    for(const x of [76,159]){
      polygon(g,[[x-8,183],[x+5,180],[x+3,topY],[x-9,topY+3]],'#705035','#3d362c',2);
      line(g,[[x-7,149],[x+3,147]],'#cfaf7f',3);
    }
    polygon(g,[[58,topY+13],[118,topY-10],[181,topY+9],[120,topY+34]],'#94714c','#4d4233',3);
    polygon(g,[[58,topY+13],[120,topY+34],[120,topY+47],[58,topY+30]],'#624830',null);
    polygon(g,[[120,topY+34],[181,topY+9],[181,topY+25],[120,topY+47]],'#4c3d31',null);
    line(g,[[80,topY+20],[160,topY+20]],'#c6a16d',4);
    // Giant bow arms are the defining silhouette, not a decorative recolor.
    const bowX=level===1?[119]:level===2?[103,135]:[92,120,147];
    for(let i=0;i<bowX.length;i++){
      const x=bowX[i],top=topY-33-(level===3&&i===1?13:0);
      line(g,[[x-14,top+7],[x-21,top+30],[x-12,top+52]],level===1?'#926b42':'#c4a372',level===3?7:5);
      line(g,[[x+14,top+7],[x+21,top+30],[x+12,top+52]],level===1?'#926b42':'#c4a372',level===3?7:5);
      line(g,[[x-14,top+7],[x+12,top+52]],'#ddc9a0',1.5);
      line(g,[[x+14,top+7],[x-12,top+52]],'#ddc9a0',1.5);
      line(g,[[x,top+42],[x,top+2]],'#a2a38a',2);
      polygon(g,[[x-4,top+4],[x+4,top+4],[x,top-6]],p.light);
    }
    if(level===3){
      for(const x of [55,181])polygon(g,[[x-10,topY+8],[x,topY-10],[x+10,topY+8]],'#5d6464',p.trim,3);
    }
  }
  function mageTower(g,level,p){
    // L1 simple blue-glass focus / L2 double conduit / L3 levitating crystal cluster.
    polygon(g,[[72,179],[74,123],[117,101],[162,120],[169,179],[123,201]],p.base,'#374c54',3);
    polygon(g,[[123,201],[169,179],[162,120],[117,101]],p.dark,'#3c5661',2);
    polygon(g,[[82,121],[118,92],[159,120],[117,143]],'#4e6268',p.edge,3);
    line(g,[[89,160],[118,183],[155,163]],p.trim,level===3?5:3);
    for(const x of (level===1?[116]:level===2?[99,138]:[89,122,152])){
      const height=level===1?44:level===2?58:77;
      const y=100-(level===3&&x===122?14:0);
      const crystal=g.createLinearGradient(x-17,y-height,x+17,y+5);
      crystal.addColorStop(0,'#f1fcff');crystal.addColorStop(.4,p.light);crystal.addColorStop(1,'#32758d');
      polygon(g,[[x,y-height],[x+14,y-22],[x+8,y+5],[x-9,y+5],[x-15,y-22]],crystal,'#27586f',3);
      line(g,[[x,y-height],[x,y+5]],'#ffffff9c',1);
    }
    if(level>1){
      for(const x of [81,165])circle(g,x,152,level===2?8:12,'#4cb1dc','#c8edff',3);
    }
    if(level===3){
      line(g,[[65,116],[120,67],[176,116]],'#88daf8a6',3);
      circle(g,120,72,9,'#e0fdff','#5bbde3',3);
    }
  }
  function riftTower(g,level,p){
    // L1 one fractured obelisk; L2 forked spires; L3 rift gate and triple arc pylons.
    polygon(g,[[67,183],[90,112],[125,93],[159,112],[177,183],[124,209]],p.base,'#4a4055',3);
    polygon(g,[[125,93],[159,112],[177,183],[124,209]],p.dark,'#544b66',2);
    const columns=level===1?[121]:level===2?[100,142]:[83,122,161];
    for(const [i,x] of columns.entries()){
      const h=level===1?81:level===2?101:(i===1?136:105);
      const top=177-h;
      polygon(g,[[x-13,172],[x-16,top+26],[x,top],[x+15,top+26],[x+13,172],[x,188]],'#514c61',p.trim,3);
      polygon(g,[[x,top],[x+15,top+26],[x+13,172],[x,188]],'#302d46',null);
      line(g,[[x-8,145],[x+5,133],[x-2,117]],'#cf82ef',level===3?4:2);
    }
    circle(g,121,153,level===1?11:level===2?16:23,'#743da0',p.light,3);
    circle(g,121,153,level===1?5:level===2?7:11,'#ecb7ff',null);
    if(level===3){
      const halo=g.createRadialGradient(121,91,0,121,91,47);
      halo.addColorStop(0,'#f1d3ffb5');halo.addColorStop(.45,'#bb69ea55');halo.addColorStop(1,'#ab67db00');
      g.fillStyle=halo;g.fillRect(70,36,102,112);
      line(g,[[87,123],[122,58],[159,123]],'#daa1ff',3);
    }
  }
  function makeTower(kind,level){
    const c=canvas(240,256),g=c.getContext('2d'),p=palettes[kind];
    stone(g,p,level);
    if(kind==='bow')bowTower(g,level,p);
    if(kind==='mage')mageTower(g,level,p);
    if(kind==='rift')riftTower(g,level,p);
    // Small fixed weathering marks; no randomized per-frame effects.
    for(let i=0;i<18;i++){
      g.fillStyle=i%3?'#4052444b':'#c7bd9870';
      const x=53+(i*47)%133,y=173+(i*17)%31;
      g.fillRect(x,y,2+(i%4),1+(i%2));
    }
    return c;
  }
  function drawTower(ctx,kind,x,y,level,reduced=false){
    if(!kinds.has(kind))return false;
    level=tier(level);const key=kind+level;
    if(!towerCache.has(key))towerCache.set(key,makeTower(kind,level));
    const size=[91,101,112][level-1];
    ctx.save();
    if(!reduced&&level===3&&kind!=='bow'){
      ctx.shadowColor=palettes[kind].trim;ctx.shadowBlur=9;
    }
    ctx.drawImage(towerCache.get(key),x-size/2,y+13-size,size,size);
    ctx.restore();return true;
  }
  function makeProjectile(kind,level){
    const c=canvas(90,90),g=c.getContext('2d'),p=palettes[kind];
    if(kind==='bow'){
      // Plain arrow / iron bodkin / gilded broadhead, all facing right.
      line(g,[[13,45],[71,45]],level===1?'#9d794b':'#b7bfc0',level===3?5:3);
      polygon(g,[[71,45],[level===3?64:69,level===3?32:39],[84,45],[level===3?64:69,level===3?58:51]],level===1?'#b7b6aa':level===2?'#91aab3':'#f1ce80','#363e40',2);
      for(const y of [-1,1])polygon(g,[[12,45],[28,45],[18,45+12*y]],y<0?'#bdb8a6':'#85633d');
      if(level===3)line(g,[[26,43],[69,43]],'#ffe5a2',2);
    }else{
      const glow=g.createRadialGradient(45,45,2,45,45,level===3?35:25);
      glow.addColorStop(0,p.light);glow.addColorStop(.35,kind==='mage'?'#4ebbd599':'#b05de0a5');
      glow.addColorStop(1,'#00000000');
      g.fillStyle=glow;g.fillRect(8,8,74,74);
      if(kind==='mage'){
        const arms=level===1?4:level===2?6:8;
        for(let i=0;i<arms;i++){
          const a=i*2*Math.PI/arms,r=level===3?26:level===2?20:15;
          line(g,[[45,45],[45+Math.cos(a)*r,45+Math.sin(a)*r]],'#e5faff',level===3?4:3);
        }
        circle(g,45,45,level===1?9:level===2?12:16,'#7dd8f1','#e6fbff',3);
      }else{
        const spikes=level===1?2:level===2?3:5;
        for(let i=0;i<spikes;i++){
          const y=29+i*9;
          line(g,[[13,y+5],[39,y-5],[54,y+9],[77,y]],'#db8cfa',level===3?5:3);
        }
        circle(g,45,45,level===1?5:level===2?9:12,'#eac1ff',null);
      }
    }
    return c;
  }
  function drawProjectile(ctx,b,reduced=false){
    if(!kinds.has(b?.kind))return false;
    const level=tier(b.level),key=b.kind+level;
    if(!projectileCache.has(key))projectileCache.set(key,makeProjectile(b.kind,level));
    const size=b.kind==='bow'?[27,31,36][level-1]:[23,29,37][level-1];
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(Math.atan2(b.vy||0,b.vx||1));
    if(!reduced&&b.kind!=='bow'){
      ctx.strokeStyle=palettes[b.kind].trim;ctx.lineWidth=level+1;ctx.globalAlpha=.3;
      line(ctx,[[-size,0],[-size*2.1,0]],palettes[b.kind].trim,level+1);
      ctx.globalAlpha=1;
    }
    ctx.drawImage(projectileCache.get(key),-size/2,-size/2,size,size);
    ctx.restore();return true;
  }
  function makeImpact(kind,level,frame){
    const c=canvas(120,120),g=c.getContext('2d'),p=palettes[kind],progress=frame/4;
    const radius=[14,22,30][level-1]*(.5+progress*1.25);
    g.globalAlpha=Math.max(.07,1-progress);
    if(kind==='bow'){
      for(let i=0;i<level*4;i++){
        const a=i*2*Math.PI/(level*4);
        line(g,[[60+Math.cos(a)*8,60+Math.sin(a)*8],[60+Math.cos(a)*radius,60+Math.sin(a)*radius]],p.trim,2.5);
      }
    }else{
      const fade=g.createRadialGradient(60,60,1,60,60,radius);
      fade.addColorStop(0,p.light);fade.addColorStop(.35,p.trim+'88');fade.addColorStop(1,'#00000000');
      g.fillStyle=fade;g.fillRect(60-radius,60-radius,radius*2,radius*2);
      g.strokeStyle=p.light;g.lineWidth=2+level;
      g.beginPath();g.arc(60,60,radius*.7,0,Math.PI*2);g.stroke();
      for(let i=0;i<level*3;i++){
        const a=i*2*Math.PI/(level*3);
        line(g,[[60+Math.cos(a)*radius*.65,60+Math.sin(a)*radius*.65],[60+Math.cos(a+.13)*radius*1.18,60+Math.sin(a+.13)*radius*1.18]],p.light,2);
      }
    }
    return c;
  }
  function drawImpact(ctx,p){
    if(!p?.style2Impact||!kinds.has(p.kind))return false;
    const level=tier(p.level),progress=1-Math.max(0,p.life)/Math.max(.001,p.max);
    const frame=Math.max(0,Math.min(4,Math.floor(progress*5))),key=p.kind+level+'-'+frame;
    if(!impactCache.has(key))impactCache.set(key,makeImpact(p.kind,level,frame));
    const size=[43,58,76][level-1];
    ctx.save();ctx.globalAlpha*=Math.max(.08,1-progress*.86);
    ctx.drawImage(impactCache.get(key),p.x-size/2,p.y-size/2,size,size);
    ctx.restore();return true;
  }
  globalThis.Style2Towers={
    drawTower,drawProjectile,drawImpact,
    cacheCounts:()=>({towers:towerCache.size,projectiles:projectileCache.size,impactFrames:impactCache.size})
  };
})();