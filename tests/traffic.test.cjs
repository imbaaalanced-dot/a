/* Traffic prototype (P1 #330 §2): opt-in decorative cars stay on authored
   street polylines, are deterministic, bounded, and never mutate the layout.
   Run: node tests/traffic.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
 const root=path.join(__dirname,'..');
 const CAR_MARGIN=60;
 const source=fs.readFileSync(path.join(root,'dist/traffic.js'),'utf8');
 function load(search,matchMediaReduced=false,extra={}){
  const context={location:{search},Math,
   matchMedia:q=>({matches:matchMediaReduced&&q.includes('prefers-reduced-motion')}),
   ...extra};
  vm.createContext(context);vm.runInContext(source,context);
  return context.TD2Traffic;
 }
 function recorder(){
  const calls=[];
  const ctx={save(){calls.push(['save']);},restore(){calls.push(['restore']);},
   translate(x,y){calls.push(['translate',x,y]);},rotate(a){calls.push(['rotate',a]);},
   fillRect(){},beginPath(){},arc(){},ellipse(){},fill(){},roundRect(){},
   set fillStyle(v){},set globalAlpha(v){}};
  return {ctx,calls};
 }
 const l3Layout={center:{x:1536,y:1536},street:{y:480,left:-820,right:820,width:98},
  paths:[[{x:0,y:0},{x:100,y:0}]],slots:[{x:50,y:50}],gates:[{x:0,y:0}]};
 let t=load('');
 assert.equal(t.enabled,false,'default off without ?td2Traffic=1');
 let rec=recorder();
 assert.equal(t.draw(rec.ctx,3,l3Layout,10,{}),false,'disabled module draws nothing');
 assert.equal(rec.calls.length,0);
 t=load('?td2Traffic=1');
 assert.equal(t.enabled,true,'opt-in enables traffic');
 rec=recorder();
 const layoutSnapshot=JSON.stringify(l3Layout);
 assert.equal(t.draw(rec.ctx,3,l3Layout,10,{}),true,'L3 draws cars');
 const positions=rec.calls.filter(c=>c[0]==='translate').map(c=>[c[1],c[2]]);
 assert.equal(positions.length,t.MAX_CARS_PER_ROUTE,'one car per slot, bounded count');
 for(const [x,y]of positions){
  assert.ok(x>=1536-820-CAR_MARGIN&&x<=1536+820+CAR_MARGIN,'car x stays on the street span');
  assert.ok(Math.abs(y-(1536+480))<=49+1,'car stays within street half width');
 }
 assert.equal(JSON.stringify(l3Layout),layoutSnapshot,'layout is not mutated');
 rec=recorder();t.draw(rec.ctx,3,l3Layout,10,{});
 assert.deepEqual(rec.calls.filter(c=>c[0]==='translate').map(c=>[c[1],c[2]]),positions,'same time => identical positions');
 rec=recorder();t.draw(rec.ctx,3,l3Layout,25,{});
 assert.notDeepEqual(rec.calls.filter(c=>c[0]==='translate').map(c=>[c[1],c[2]]),positions,'time moves the cars');
 rec=recorder();
 assert.equal(t.draw(rec.ctx,3,l3Layout,10,{low:true}),false,'lowFX disables traffic');
 assert.equal(rec.calls.length,0);
 t=load('?td2Traffic=1',true);
 assert.equal(t.reduced,true);
 rec=recorder();
 assert.equal(t.draw(rec.ctx,3,l3Layout,10,{}),false,'prefers-reduced-motion disables traffic');
 const westRoute=[{x:100,y:100},{x:900,y:140}];
 t=load('?td2Traffic=1',false,{DenkmalWesthofenArt:{streetRoutes:()=>[{points:westRoute,halfWidth:60}]}});
 rec=recorder();
 assert.equal(t.draw(rec.ctx,7,{center:{x:0,y:0},gates:[]},5,{}),true,'L7 uses the art-module street route');
 const l7pos=rec.calls.filter(c=>c[0]==='translate').map(c=>[c[1],c[2]]);
 assert.equal(l7pos.length,t.MAX_CARS_PER_ROUTE);
 for(const [x,y]of l7pos){
  const t2=Math.max(0,Math.min(1,(x-100)/800));
  const lineY=100+t2*40;
  assert.ok(Math.abs(y-lineY)<=60+1,'car stays on the L7 road polyline');
 }
 assert.equal(t.draw(rec.ctx,1,{center:{x:0,y:0},gates:[]},5,{}),false,'levels without streets draw nothing');
 const ambience=fs.readFileSync(path.join(root,'dist/style2-ambience.js'),'utf8');
 assert.ok(ambience.includes('TD2Traffic?.draw'),'ambience hooks the traffic draw');
 const html=fs.readFileSync(path.join(root,'dist/index.html'),'utf8');
 assert.ok(html.includes('traffic.js?v=traffic-proto-20261122'),'index.html includes traffic.js with cache key');
 const west=fs.readFileSync(path.join(root,'dist/westhofen-art.js'),'utf8');
 assert.ok(west.includes('streetRoutes()'),'westhofen exports its street route');
 const goethe=fs.readFileSync(path.join(root,'dist/goethestrasse-art.js'),'utf8');
 assert.ok(goethe.includes('streetRoutes()'),'goethestrasse exports its street routes');
 console.log('Traffic prototype: opt-in, on-road, deterministic, bounded, layout untouched');
})().catch(e=>{console.error(e);process.exitCode=1;});
