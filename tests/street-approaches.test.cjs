/* Street approach plates (P1 #330 §2 "Anschlüsse"): paved junction plates where
   gameplay lanes meet the authored streets of levels 3/6/7. Visual only, drawn
   on the cached ground; lanes/routes are only read. Run: node tests/street-approaches.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
 const root=path.join(__dirname,'..');
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 function pathDistance(p,route){
  let best=Infinity;
  for(let i=1;i<route.length;i++){
   const a=route[i-1],b=route[i],dx=b.x-a.x,dy=b.y-a.y,len2=dx*dx+dy*dy;
   const t=len2?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len2)):0;
   best=Math.min(best,Math.hypot(p.x-(a.x+dx*t),p.y-(a.y+dy*t)));
  }
  return best;
 }
 function recorder(){
  const state={fillStyle:'',strokeStyle:'',lineWidth:0};
  const stack=[{x:0,y:0}];
  const rec={strokes:[],fills:[],dashCalls:[],save(){stack.push({...stack[stack.length-1]});},restore(){stack.pop();},clip(){},scale(){},translate(x,y){const c=stack[stack.length-1];c.x+=x;c.y+=y;},rotate(){},drawImage(){},setLineDash(d){rec.dashCalls.push(d);},setTransform(){}};
  const q=new Proxy(rec,{
   get(t,k){
    if(k in t)return t[k];
    if(k==='fillStyle'||k==='strokeStyle'||k==='lineWidth')return state[k];
    return (...a)=>{
     if(k==='fillRect'){const c=stack[stack.length-1];rec.fills.push({style:state.fillStyle,x:c.x+a[0],y:c.y+a[1],w:a[2],h:a[3]});}
     else if(k==='stroke')rec.strokes.push({style:state.strokeStyle,width:state.lineWidth});
     else if(k==='createRadialGradient'||k==='createLinearGradient')return{addColorStop(){}};
     else if(k==='createPattern')return{};
    };
   },
   set(t,k,v){if(k==='fillStyle'||k==='strokeStyle'||k==='lineWidth'){state[k]=v;return true;}t[k]=v;return true;}
  });
  return {q,rec};
 }
 function loadModule(file,extra){
  const context={location:{search:''},Math,Image:function(){},setTimeout(){return 1;},clearTimeout(){},
   document:{createElement(){const r=recorder();context.__canvases.push(r);return {width:0,height:0,getContext:()=>r.q};}},
   __canvases:[],...extra};
  vm.createContext(context);vm.runInContext(read(file),context);
  return context;
 }
 // --- ground-v3 approachPlates unit ---
 const g3=loadModule('dist/ground-v3.js',{DenkmalLevels:{pathDistance}});
 assert.equal(typeof g3.TD2GroundV3.approachPlates,'function','approachPlates exported');
 const route=[{x:0,y:0},{x:1000,y:0}];
 let r=recorder();
 let n=g3.TD2GroundV3.approachPlates(r.q,[[{x:500,y:-200},{x:500,y:200}]],route,80);
 assert.ok(n>0,'lane crossing the street gets plates');
 assert.ok(r.rec.fills.some(f=>f.style==='#83876f'&&f.w===28&&f.h===20),'plate face drawn');
 r=recorder();
 n=g3.TD2GroundV3.approachPlates(r.q,[[{x:500,y:500},{x:500,y:900}]],route,80);
 assert.equal(n,0,'lane far from the street gets no plates');
 assert.equal(r.rec.fills.length,0);
 // --- L7 Westhofen: plates where a lane crosses the exported street route ---
 const street=[{x:416,y:2296},{x:976,y:2236},{x:1576,y:2256},{x:2176,y:2196},{x:2656,y:2236}];
 const w=loadModule('dist/westhofen-art.js',{DenkmalLevels:{pathDistance},TD2GroundV3:g3.TD2GroundV3});
 const lane=[{x:1576,y:1500},{x:1576,y:2600}]; // crosses streetRoute near (1576,2256)
 const wLayout={paths:[lane],slots:[],gates:[],center:{x:1536,y:1536}};
 const wSnap=JSON.stringify(wLayout);
 const wOut=recorder();
 w.DenkmalWesthofenArt.drawGround(wOut.q,wLayout);
 const wGround=w.__canvases[0].rec;
 const walk=[{x:416,y:2168},{x:976,y:2110},{x:1576,y:2128},{x:2176,y:2072},{x:2656,y:2110}];
 const plates=wGround.fills.filter(f=>f.style==='#83876f'&&f.w===28&&f.h===20);
 assert.ok(plates.length>0,'L7 plates drawn at the lane/street crossing');
 assert.ok(plates.some(f=>pathDistance({x:f.x+14,y:f.y+10},street)<90),'plates reach the street');
 assert.ok(plates.every(f=>pathDistance({x:f.x+14,y:f.y+10},street)<95||pathDistance({x:f.x+14,y:f.y+10},walk)<48),'plates stay at street or sidewalk crossing only');
 assert.equal(JSON.stringify(wLayout),wSnap,'L7 layout not mutated');
 // --- L3 Kirchende: junction plates at lane vertices on the street, axial gap open ---
 const center={x:1536,y:1536};
 const pt=(x,y)=>({x:center.x+x,y:center.y+y});
 const l3paths=[
  [[-340,-620],[-340,-260],[-250,-90],[0,0]],
  [[-700,480],[-340,480],[20,480],[20,180],[0,0]],
  [[700,480],[350,480],[20,480],[20,180],[0,0]],
  [[20,740],[20,480],[20,180],[0,0]]
 ].map(route=>route.map(([x,y])=>pt(x,y)));
 const k=loadModule('dist/kirchende-art.js',{DenkmalLevels:{pathDistance,center,levels:{3:{street:{y:480,left:-820,right:820,width:98},paths:l3paths}}}});
 const kRec=recorder();
 k.KirchendeArt.drawSite(kRec.q,center);
 const aprons=kRec.rec.fills.filter(f=>f.style==='#83876f'&&f.w===76&&f.h===28);
 assert.equal(aprons.length,12,'L3 plates at the four non-axial street vertices (3 plates each)');
 for(const vx of [-700,-340,350,700])assert.ok(aprons.some(f=>f.x===1536+vx-38),'plate at lane vertex x='+vx);
 assert.ok(!aprons.some(f=>f.x>1536-50-39&&f.x<1536+90),'axial entrance stays free of plates');
 console.log('Street approach plates: ground-v3 helper, L7 crossing plates, L3 junction plates, axial gap open');
})().catch(e=>{console.error(e);process.exitCode=1;});
