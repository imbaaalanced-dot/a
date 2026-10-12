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
  // Reference-derived layout: road along the lower edge, footpath to the left.
  // Joining points under tree crowns remain an approximation, not survey data.
  const kirchendePaths=[
    [[-340,-620],[-340,-260],[-250,-90],[0,0]],
    [[-700,480],[-340,480],[-340,190],[-250,-90],[0,0]],
    [[700,480],[160,480],[160,210],[90,90],[0,0]],
    [[20,740],[20,480],[20,180],[0,0]]
  ].map(route=>route.map(([x,y])=>point(x,y)));
  const kirchendeSlots=[];
  const candidates=[[-450,-380],[-210,-360],[-470,-100],[-420,90],[-190,170],[-200,340],[270,310],[290,100],[190,-150],[20,-250],[430,320],[450,-150]];
  for(const [x,y] of candidates){const p=point(x,y);if(kirchendePaths.every(path=>pathDistance(p,path)>=64))kirchendeSlots.push(p);}
  function getWaveGates(level,wave){return level===3?[0,1,2,3].slice(0,wave===9?2:wave===10?3:4):levels[level].gates.map((_,i)=>i);}
  const levels={
    1:{name:'VIER TORE',gates,paths:gates.map(g=>[g,center]),slots:laneSlots,firstWave:1},
    2:{name:'DAS LABYRINTH',gates:[maze[0]],paths:[maze],slots,firstWave:6},
    3:{name:'KRIEGERDENKMAL KIRCHENDE',gates:kirchendePaths.map(p=>p[0]),paths:kirchendePaths,slots:kirchendeSlots,firstWave:9,lastWave:12,startEssence:180,maxTowers:8,approximate:true}
  };
  const saveKey='denkmal-level2-unlocked-v1';
  let unlocked=false,storageAvailable=true;
  try{unlocked=localStorage.getItem(saveKey)==='true';}catch{storageAvailable=false;}
  function unlock(){unlocked=true;try{localStorage.setItem(saveKey,'true');storageAvailable=true;}catch{storageAvailable=false;}return storageAvailable;}
  function nearestSlot(p,level=2){let best=null,d=Infinity;for(const slot of (levels[level]?.slots||[])){const next=Math.hypot(p.x-slot.x,p.y-slot.y);if(next<d){best=slot;d=next;}}return d<=88?best:null;}
  function advance(enemy,dt,path=maze){if(!path.length||!Number.isFinite(dt)||dt<=0)return;let budget=Math.max(0,enemy.speed*dt);while(enemy.waypoint<path.length&&budget>0){const p=path[enemy.waypoint],dx=p.x-enemy.x,dy=p.y-enemy.y,d=Math.hypot(dx,dy);if(d<=budget){enemy.x=p.x;enemy.y=p.y;budget-=d;enemy.waypoint++;}else{enemy.x+=dx/d*budget;enemy.y+=dy/d*budget;budget=0;}}}
  globalThis.DenkmalLevels={levels,center,unlock,nearestSlot,advance,pathDistance,getWaveGates,get unlocked(){return unlocked;},get storageAvailable(){return storageAvailable;}};
})();
