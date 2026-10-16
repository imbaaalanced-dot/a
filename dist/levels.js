(() => {
  'use strict';
  const center={x:1536,y:1536};
  const point=(x,y)=>({x:center.x+x,y:center.y+y});
  const gates=[point(0,-600),point(600,0),point(0,600),point(-600,0)];
  const maze=[[-440,-440],[440,-440],[440,440],[-440,440],[-440,-160],[180,-160],[180,180],[0,180],[0,0]].map(([x,y])=>point(x,y));
  function segmentDistance(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy);}
  function pathDistance(p,path){return Math.min(...path.slice(1).map((b,i)=>segmentDistance(p,path[i],b)));}
  const laneSlots=[];
  for(const gate of gates){
    const dx=center.x-gate.x,dy=center.y-gate.y,length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
    for(const along of [165,325,485])for(const side of [-1,1]){
      const p={x:gate.x+dx*along/length+nx*104*side,y:gate.y+dy*along/length+ny*104*side};
      if(pathDistance(p,[gate,center])>=96&&Math.hypot(p.x-center.x,p.y-center.y)>145&&laneSlots.every(s=>Math.hypot(s.x-p.x,s.y-p.y)>94))laneSlots.push(p);
    }
  }
  const slots=[];
  for(let i=1;i<maze.length;i++){
    const a=maze[i-1],b=maze[i],length=Math.hypot(b.x-a.x,b.y-a.y),nx=-(b.y-a.y)/length,ny=(b.x-a.x)/length;
    for(let along=90;along<length-50;along+=160)for(const side of [-1,1]){
      const p={x:a.x+(b.x-a.x)*along/length+nx*88*side,y:a.y+(b.y-a.y)*along/length+ny*88*side};
      if(pathDistance(p,maze)>=70&&Math.hypot(p.x-center.x,p.y-center.y)>100&&slots.every(s=>Math.hypot(s.x-p.x,s.y-p.y)>100))slots.push(p);
    }
  }
  // Video review 2026-10-16: central slab approach and shallow stair.
  // Four gameplay spawns remain; side/rear connections are reconstructed.
  const kirchendePaths=[
    [[-340,-620],[-340,-260],[-200,-160],[0,-160],[0,0]],
    [[-700,700],[-180,700],[0,480],[0,180],[0,0]],
    [[700,700],[180,700],[0,480],[0,180],[0,0]],
    [[0,740],[0,480],[0,180],[0,0]]
  ].map(route=>route.map(([x,y])=>point(x,y)));
  const kirchendeSlots=[];
  const candidates=[[-450,-380],[-210,-360],[-470,-100],[-420,90],[-190,170],[-200,340],[270,310],[290,100],[190,-150],[20,-250],[430,320],[450,-150]];
  for(const [x,y] of candidates){const p=point(x,y);if(kirchendePaths.every(path=>pathDistance(p,path)>=64))kirchendeSlots.push(p);}
  // GPS reference: church OSM way 30729509 center approx 51.41905,7.42299;
  // memorial object/photo point approx 51.418844,7.423072 (Commons).
  // Approx 23 m north and 6 m west of lion at 22 playfield px/m.
  // Footprint is deliberately conservative; only relative layout is derived
  // from public geodata, not survey-grade building dimensions.
  const churchFootprint={left:-415,right:235,top:-700,bottom:-290};
  const churchPaths=[
    [[-730,-370],[-555,-365],[-435,-195],[-175,-125],[0,0]],
    [[-735,340],[-420,345],[-250,190],[-90,70],[0,0]],
    [[635,700],[370,520],[280,270],[125,100],[0,0]],
    [[-690,-790],[-615,-535],[-530,-260],[-200,-155],[0,0]]
  ].map(route=>route.map(([x,y])=>point(x,y)));
  // Keep a 40 px clearance from the wall for paths/tower markers.
  const outsideChurch=(x,y,padding=0)=>
    x<churchFootprint.left-padding||x>churchFootprint.right+padding||
    y<churchFootprint.top-padding||y>churchFootprint.bottom+padding;
  const churchSlots=[];
  const churchCandidates=[
    [-760,-590],[-470,-810],[-240,-830],[100,-820],[320,-680],
    [340,-345],[310,-210],[510,-210],[-740,-50],[-550,-65],
    [-380,20],[-220,-250],[-160,380],[100,330],[230,390],
    [440,340],[560,190],[380,60],[70,-205],[520,520]
  ];
  for(const [x,y] of churchCandidates){
    const pad=point(x,y);
    const clear=churchPaths.every(path=>pathDistance(pad,path)>=84)&&Math.hypot(x,y)>=165;
    if(clear&&outsideChurch(x,y,40)&&churchSlots.every(other=>Math.hypot(pad.x-other.x,pad.y-other.y)>95))
      churchSlots.push(pad);
  }
  function getWaveGates(level,wave){
    if(level===3)return [0,1,2,3].slice(0,wave===9?2:wave===10?3:4);
    if(level===4)return [0,1,2,3].slice(0,wave===13?2:wave===14?3:4);
    return levels[level].gates.map((_,i)=>i);
  }
  const levels={
    1:{name:'EINLEITUNG',gates,paths:gates.map(g=>[g,center]),slots:laneSlots,firstWave:1},
    2:{name:'DAS LABYRINTH',gates:[maze[0]],paths:[maze],slots,firstWave:6},
    3:{name:'KRIEGERDENKMAL KIRCHENDE',gates:kirchendePaths.map(p=>p[0]),paths:kirchendePaths,slots:kirchendeSlots,firstWave:9,lastWave:12,startEssence:180,maxTowers:8,approximate:true},
    4:{name:'DORFKIRCHE UND SCHLAFENDER LÖWE',gates:churchPaths.map(p=>p[0]),paths:churchPaths,slots:churchSlots,churchFootprint,firstWave:13,lastWave:16,startEssence:245,maxTowers:10,approximate:true}
  };
  const saveKey='denkmal-level2-unlocked-v1';
  let unlocked=false,storageAvailable=true;
  try{unlocked=localStorage.getItem(saveKey)==='true';}catch{storageAvailable=false;}
  function unlock(){unlocked=true;try{localStorage.setItem(saveKey,'true');storageAvailable=true;}catch{storageAvailable=false;}return storageAvailable;}
  const level4Key='denkmal-level4-completed-v1';
  let level4Completed=false;
  try{level4Completed=localStorage.getItem(level4Key)==='true';}catch{}
  function completeLevel4(){
    level4Completed=true;try{localStorage.setItem(level4Key,'true');storageAvailable=true;}catch{storageAvailable=false;}
    return storageAvailable;
  }
  function nearestSlot(p,level=2){let best=null,d=Infinity;for(const slot of (levels[level]?.slots||[])){const next=Math.hypot(p.x-slot.x,p.y-slot.y);if(next<d){best=slot;d=next;}}return d<=88?best:null;}
  function advance(enemy,dt,path=maze){if(!path.length||!Number.isFinite(dt)||dt<=0)return;let budget=Math.max(0,enemy.speed*dt);while(enemy.waypoint<path.length&&budget>0){const p=path[enemy.waypoint],dx=p.x-enemy.x,dy=p.y-enemy.y,d=Math.hypot(dx,dy);if(d<=budget){enemy.x=p.x;enemy.y=p.y;budget-=d;enemy.waypoint++;}else{enemy.x+=dx/d*budget;enemy.y+=dy/d*budget;budget=0;}}}
  globalThis.DenkmalLevels={levels,center,unlock,completeLevel4,nearestSlot,advance,pathDistance,getWaveGates,get level4Completed(){return level4Completed;},get unlocked(){return unlocked;},get storageAvailable(){return storageAvailable;}};
})();
