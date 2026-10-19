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
  // GPS reference: church OSM way 30729509 center approx 51.41905,7.42299;
  // memorial object/photo point approx 51.418844,7.423072 (Commons).
  // Approx 23 m north and 6 m west of lion at 22 playfield px/m.
  // Footprint is deliberately conservative; only relative layout is derived
  // from public geodata, not survey-grade building dimensions.
  const churchFootprint={left:-415,right:235,top:-700,bottom:-290};
  // User aerial reference, 18 October: northern lane follows the east side;
  // southern approaches share the village-road access. Illustrative, not surveyed.
  const churchPaths=[
    [[420,-1000],[420,-760],[420,-360],[350,-200],[200,-90],[0,0]],
    [[850,520],[450,520],[400,250],[250,100],[0,0]],
    [[-850,520],[-300,520],[-100,280],[-100,100],[0,0]],
    [[-850,-220],[-600,-220],[-420,-200],[-220,-180],[-100,-80],[0,0]]
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
  // Annotated Goethestraße map: asymmetric park approaches and a separate air corridor.
  const goethePaths=[
    [[-900,720],[-600,570],[-770,340],[-660,70],[-440,-70],[-230,-50],[0,0]],
    [[730,-650],[730,-240],[750,130],[560,110],[290,50],[0,0]],
    [[1000,690],[760,490],[750,130],[560,110],[290,50],[0,0]]
  ].map(route=>route.map(([x,y])=>point(x,y)));
  const goetheSlots=[];
  for(const [x,y] of [[-600,-240],[-300,-280],[600,-240],[-450,60],[-300,60],[-600,210],[-450,510],[-450,660],[-150,210],[150,210],[450,210],[600,360],[600,660],[450,-90]]){
    const p=point(x,y);
    if(Math.hypot(x,y)>=190&&goethePaths.every(path=>pathDistance(p,path)>=92)&&
      goethePaths.some(path=>pathDistance(p,path)<245)&&goetheSlots.every(q=>Math.hypot(q.x-p.x,q.y-p.y)>120))goetheSlots.push(p);
  }
  // Aerial & oblique visitor references (18 Oct 2026): the pylon stands on an
  // elevated masonry plinth; a much broader lower forecourt faces the drop.
  // Rectangles and routes are GAMEPLAY approximations, not surveyed boundaries.
  // Offsets are relative to the monument objective at (0,0).
  const syburgTerrace={
    raised:{left:-380,right:300,top:-330,bottom:320},
    forecourt:{left:-800,right:900,top:280,bottom:690},
    stairs:[{x:-245,top:320,bottom:520,width:132},{x:218,top:320,bottom:525,width:136}],
    cliffY:740
  };
  // Two trails from the forest converge on the raised platform, while the
  // forecourt approach enters by the SE stairway. No imaginary fourth land gate.
  const syburgPaths=[
    [[-1080,-760],[-790,-600],[-565,-420],[-400,-250],[-180,-100],[0,0]],
    [[810,-840],[680,-630],[485,-440],[320,-260],[140,-100],[0,0]],
    [[1050,595],[795,545],[560,480],[345,430],[218,325],[135,155],[0,0]]
  ].map(route=>route.map(([x,y])=>point(x,y)));
  const syburgSlots=[];
  const syburgCandidates=[
    [-670,-450],[-410,-460],[-620,-80],[-520,150],[-380,390],
    [-180,440],[100,410],[360,390],[580,450],[600,-420],
    [420,-380],[520,-60],[400,130],[180,-390],[-80,-390],
    [-650,430],[-650,320],[-390,-600],[630,-550],[-60,500]
  ];
  for(const [x,y] of syburgCandidates){
    const p=point(x,y);
    const raised=syburgTerrace.raised;
    const onRaised=x>=raised.left-45&&x<=raised.right+45&&y>=raised.top-45&&y<=raised.bottom+45;
    const onStairs=syburgTerrace.stairs.some(stair=>Math.abs(x-stair.x)<stair.width/2+65&&y>stair.top-65&&y<stair.bottom+65);
    if(Math.hypot(x,y)>=200&&Math.abs(x)<890&&y<syburgTerrace.cliffY-60&&
      !onRaised&&!onStairs&&syburgPaths.every(path=>pathDistance(p,path)>=90)&&
      syburgSlots.every(other=>Math.hypot(other.x-p.x,other.y-p.y)>115))syburgSlots.push(p);
  }
  function getWaveGates(level,wave){
    if(level===3)return [0,1,2,3].slice(0,wave===9?2:wave===10?3:4);
    if(level===4)return [0,1,2,3].slice(0,wave===13?2:wave===14?3:4);
    if(level===5)return wave===17?[0,1]:[0,1,2];
    return levels[level].gates.map((_,i)=>i);
  }
  const levels={
    1:{name:'EINLEITUNG',gates,paths:gates.map(g=>[g,center]),slots:laneSlots,firstWave:1},
    2:{name:'DAS LABYRINTH',gates:[maze[0]],paths:[maze],slots,firstWave:6},
    3:{name:'KRIEGERDENKMAL KIRCHENDE',gates:kirchendePaths.map(p=>p[0]),paths:kirchendePaths,slots:kirchendeSlots,firstWave:9,lastWave:12,startEssence:180,maxTowers:8,approximate:true},
    5:{name:'HOHENSYBURG · KAISER-WILHELM-DENKMAL',gates:syburgPaths.map(path=>path[0]),paths:syburgPaths,slots:syburgSlots,syburgTerrace,airGate:point(160,1010),gateLabels:['WALDWEG WEST','PARKZUGANG OST','TERRASSENWEG'],firstWave:17,lastWave:20,startEssence:300,maxTowers:11,approximate:true},
    6:{name:'HERDECKE GOETHESTRASSE',gates:goethePaths.map(p=>p[0]),paths:goethePaths,slots:goetheSlots,airGate:point(170,950),gateLabels:['PARKWEG WEST','GOETHESTRASSE NORD','GOETHESTRASSE OST'],firstWave:21,lastWave:24,startEssence:320,maxTowers:12,approximate:true},
    4:{name:'DORFKIRCHE UND SCHLAFENDER LÖWE',gates:churchPaths.map(p=>p[0]),paths:churchPaths,slots:churchSlots,churchFootprint,gateLabels:['IN DEN EICHEN','DORFWEG OST','DORFWEG WEST','KIRCHHOF WEST'],firstWave:13,lastWave:16,startEssence:245,maxTowers:10,approximate:true}
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
  const level5Key='denkmal-level5-completed-v1';
  let level5Completed=false;
  try{level5Completed=localStorage.getItem(level5Key)==='true';}catch{}
  function completeLevel5(){level5Completed=true;try{localStorage.setItem(level5Key,'true');storageAvailable=true;}catch{storageAvailable=false;}return storageAvailable;}
  const level6Key='denkmal-level6-completed-v1';
  let level6Completed=false;
  try{level6Completed=localStorage.getItem(level6Key)==='true';}catch{}
  function completeLevel6(){level6Completed=true;try{localStorage.setItem(level6Key,'true');storageAvailable=true;}catch{storageAvailable=false;}return storageAvailable;}
  function nearestSlot(p,level=2){let best=null,d=Infinity;for(const slot of (levels[level]?.slots||[])){const next=Math.hypot(p.x-slot.x,p.y-slot.y);if(next<d){best=slot;d=next;}}return d<=88?best:null;}
  function advance(enemy,dt,path=maze){if(!path.length||!Number.isFinite(dt)||dt<=0)return;let budget=Math.max(0,enemy.speed*dt);while(enemy.waypoint<path.length&&budget>0){const p=path[enemy.waypoint],dx=p.x-enemy.x,dy=p.y-enemy.y,d=Math.hypot(dx,dy);if(d<=budget){enemy.x=p.x;enemy.y=p.y;budget-=d;enemy.waypoint++;}else{enemy.x+=dx/d*budget;enemy.y+=dy/d*budget;budget=0;}}}
  globalThis.DenkmalLevels={levels,center,unlock,completeLevel4,completeLevel5,completeLevel6,get level5Completed(){return level5Completed;},get level6Completed(){return level6Completed;},nearestSlot,advance,pathDistance,getWaveGates,get level4Completed(){return level4Completed;},get unlocked(){return unlocked;},get storageAvailable(){return storageAvailable;}};
})();
