/* Street detail pass (P1 #330 §2): kerb rims, centre dashes and sidewalk edges on
   the authored streets of levels 3/6/7, drawn only inside the existing road
   polylines. Layouts stay untouched. Run: node tests/street-details.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
 const root=path.join(__dirname,'..');
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 function recorder(){
  const state={fillStyle:'',strokeStyle:'',lineWidth:0,dash:null};
  const rec={strokes:[],points:[],dashes:[],fills:[],dashCalls:[],drawImage(){},save(){},restore(){},clip(){},scale(){},translate(){},rotate(){},setTransform(){},setLineDash(d){state.dash=d;rec.dashCalls.push(d);}};
  const q=new Proxy(rec,{
   get(t,k){
    if(k in t)return t[k];
    if(k==='fillStyle'||k==='strokeStyle'||k==='lineWidth')return state[k];
    return (...a)=>{
     if(k==='stroke')rec.strokes.push({style:state.strokeStyle,width:state.lineWidth,dash:state.dash});
     else if(k==='moveTo'||k==='lineTo')rec.points.push([a[0],a[1]]);
     else if(k==='fillRect')rec.fills.push({style:state.fillStyle,x:a[0],y:a[1],w:a[2],h:a[3]});
     else if(k==='setLineDash'){state.dash=a[0];rec.dashCalls.push(a[0]);}
     else if(k==='createRadialGradient'||k==='createLinearGradient')return{addColorStop(){}};
     else if(k==='createPattern')return{};
     else if(k==='arc'||k==='ellipse'||k==='beginPath'||k==='closePath'||k==='fill'||k==='strokeRect'||k==='stroke'&&false){}
    };
   },
   set(t,k,v){if(k==='fillStyle'||k==='strokeStyle'||k==='lineWidth'){state[k]=v;return true;}t[k]=v;return true;}
  });
  return {q,rec,state};
 }
 function loadModule(file,extra){
  const {q,rec}=recorder();
  const canvases=[];
  const context={location:{search:''},Math,Image:function(){},setTimeout(){return 1;},clearTimeout(){},
   document:{createElement(){const r=recorder();canvases.push(r);return {width:0,height:0,getContext:()=>r.q};}},
   ...extra};
  context.globalThis=context;
  vm.createContext(context);vm.runInContext(read(file),context);
  return {context,rec,canvases};
 }
 // --- Level 7 Westhofen: kerb rim + lane marks + sidewalk edge on streetRoute ---
 const w=loadModule('dist/westhofen-art.js',{DenkmalLevels:{pathDistance:()=>1e9}});
 const wLayout={paths:[],slots:[],gates:[],center:{x:1536,y:1536}};
 const wSnap=JSON.stringify(wLayout);
 const wOut=recorder();
 w.context.DenkmalWesthofenArt.drawGround(wOut.q,wLayout);
 const wGround=w.canvases[0].rec;
 assert.ok(wGround.strokes.some(s=>s.width===165&&s.style==='#3f443f66'),'L7 street gets a dark kerb rim');
 assert.ok(wGround.strokes.some(s=>s.width===143&&s.style==='#676f6b'),'L7 asphalt band unchanged');
 assert.ok(wGround.dashCalls.some(d=>Array.isArray(d)&&d.length===2&&d[0]>0),'L7 centre dashes drawn');
 assert.ok(wGround.strokes.some(s=>s.width===58&&s.style==='#4a4f4a'),'L7 sidewalk gets a kerb edge');
 const route=w.context.DenkmalWesthofenArt.streetRoutes()[0];
 assert.ok(wGround.points.some(([x,y])=>x===route.points[0].x&&y===route.points[0].y),'L7 marks follow the exported streetRoute');
 assert.equal(JSON.stringify(wLayout),wSnap,'L7 layout not mutated');
 // --- Level 6 Goethestraße: rim + dashes on both exported road routes ---
 const g=loadModule('dist/goethestrasse-art.js',{DenkmalLevels:{pathDistance:()=>1e9}});
 const gLayout={paths:[],slots:[],gates:[],center:{x:1536,y:1536}};
 const gOut=recorder();
 g.context.DenkmalGoetheArt.drawGround(gOut.q,gLayout);
 const gGround=g.canvases[0].rec;
 assert.ok(gGround.strokes.filter(s=>s.width===155&&s.style==='#3f443f66').length===2,'L6 both road routes get the kerb rim');
 assert.ok(gGround.dashCalls.filter(d=>Array.isArray(d)&&d.length===2&&d[0]>0).length>10,'L6 centre dashes on both routes');
 for(const r of g.context.DenkmalGoetheArt.streetRoutes())
  assert.ok(gGround.points.some(([x,y])=>x===r.points[0].x&&y===r.points[0].y),'L6 marks follow exported route '+r.points[0].x);
 // --- Level 3 Kirchende: asphalt edge lines + centre dashes, entrance gap kept ---
 const k=loadModule('dist/kirchende-art.js',{DenkmalLevels:{levels:{3:{street:{y:480,left:-820,right:820,width:98}}},pathDistance:()=>1e9}});
 const kRec=recorder();
 k.context.KirchendeArt.drawSite(kRec.q,{x:1536,y:1536});
 const dashFills=kRec.rec.fills.filter(f=>f.style==='#d8d3ba66'&&f.w===30&&f.h===4&&f.y===478);
 assert.equal(dashFills.length,23,'L3 centre dashes drawn along the street');
 assert.ok(!dashFills.some(f=>f.x===-32||f.x===32),'axial entrance gap stays free of dashes');
 assert.ok(kRec.rec.fills.some(f=>f.style==='#242b2a'&&f.w===1640&&f.h===98),'L3 asphalt band unchanged');
 // --- wiring pins ---
 const html=read('dist/index.html');
 for(const [file,key] of [['kirchende-art.js','style2-streets-20261123'],['goethestrasse-art.js','goethe-streets-20261123'],['westhofen-art.js','westhofen-streets-20261123']])
  assert.ok(html.includes(file+'?v='+key),file+' cache key bumped');
 console.log('Street details: kerb rims, centre dashes, sidewalk edges on L3/L6/L7; layouts untouched');
})().catch(e=>{console.error(e);process.exitCode=1;});
