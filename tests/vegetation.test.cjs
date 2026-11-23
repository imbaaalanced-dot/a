/* Vegetation/ground pass (P1 #330 §2): opt-in procedural meadow, grass and
   verge detail for L3/L6/L7 is deterministic, bounded, keeps clear of paths,
   slots, gates, monument and street surface, and never mutates the layout.
   Run: node tests/vegetation.test.cjs */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
 const root=path.join(__dirname,'..');
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 // Real campaign layouts and real street polylines from the art modules.
 const store=new Map();
 const env={Math,JSON,Date,console,Number,Array,Object,Map,Set,
  localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)},
  document:{createElement:()=>({getContext:()=>null,style:{}}),addEventListener(){}},
  Image:function(){},addEventListener(){},location:{search:''}};
 env.globalThis=env;env.window=env;vm.createContext(env);
 vm.runInContext(read('dist/persisted-state.js'),env);
 vm.runInContext(read('dist/levels.js'),env);
 for(const f of ['dist/goethestrasse-art.js','dist/westhofen-art.js'])vm.runInContext(read(f),env);
 const center=env.DenkmalLevels.center;
 const layouts={};
 for(const lv of [1,3,6,7])layouts[lv]={...env.DenkmalLevels.levels[lv],center};
 assert.ok(env.DenkmalGoetheArt.streetRoutes().length>0&&env.DenkmalWesthofenArt.streetRoutes().length>0,'art modules export street routes');
 const source=read('dist/vegetation.js');
 function load(search){
  const ctx={location:{search},Math,DenkmalGoetheArt:env.DenkmalGoetheArt,DenkmalWesthofenArt:env.DenkmalWesthofenArt};
  vm.createContext(ctx);vm.runInContext(source,ctx);return ctx.TD2Vegetation;
 }
 function recorder(){
  const calls=[];const rec=n=>(...a)=>calls.push([n,...a]);
  const ctx={save:rec('save'),restore:rec('restore'),beginPath:rec('beginPath'),moveTo:rec('moveTo'),lineTo:rec('lineTo'),
   ellipse:rec('ellipse'),arc:rec('arc'),fill:rec('fill'),set fillStyle(v){calls.push(['fillStyle',v]);},set globalAlpha(v){calls.push(['alpha',v]);}};
  return {ctx,calls};
 }
 let v=load('');
 assert.equal(v.enabled,false,'default off without ?td2Vegetation=1');
 let r=recorder();
 assert.equal(v.draw(r.ctx,3,layouts[3],{}),false,'disabled module draws nothing');
 assert.equal(r.calls.length,0);
 v=load('?td2Vegetation=1');
 assert.equal(v.enabled,true,'opt-in enables the pass');
 const segDist=(p,a,b)=>{const dx=b.x-a.x,dy=b.y-a.y,l=dx*dx+dy*dy,t=l?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/l)):0;return Math.hypot(p.x-(a.x+dx*t),p.y-(a.y+dy*t));};
 const polyDist=(p,pts)=>{let d=Infinity;for(let i=1;i<pts.length;i++)d=Math.min(d,segDist(p,pts[i-1],pts[i]));return d;};
 const streetsOf=lv=>lv===3?[{points:[{x:center.x-820,y:center.y+480},{x:center.x+820,y:center.y+480}],halfWidth:49}]
  :lv===6?env.DenkmalGoetheArt.streetRoutes():env.DenkmalWesthofenArt.streetRoutes();
 for(const lv of [3,6,7]){
  const layout=layouts[lv],snapshot=JSON.stringify(layout);
  r=recorder();
  assert.equal(v.draw(r.ctx,lv,layout,{}),true,`L${lv} draws vegetation`);
  const st=v.stats(lv,layout);
  assert.ok(st.tufts>40&&st.flowers>10&&st.patches>5,`L${lv} has a visible meadow (${JSON.stringify(st)})`);
  const ys=v.items(lv,layout).map(p=>p.y);
  assert.ok(ys.some(y=>y<1000)&&ys.some(y=>y>2100),`L${lv} detail spreads over the whole map, not one edge`);
  assert.ok(st.verge>10,`L${lv} has verge transition detail along the street`);
  assert.ok(st.tufts<=v.LIMITS.MAX_TUFTS&&st.flowers<=v.LIMITS.MAX_FLOWERS&&st.patches<=v.LIMITS.MAX_PATCHES&&st.verge<=v.LIMITS.MAX_VERGE,'item counts bounded');
  assert.ok(r.calls.filter(c=>c[0]==='fill').length<=10,'batched: at most 10 fills per frame');
  assert.equal(r.calls.filter(c=>c[0]==='save').length,r.calls.filter(c=>c[0]==='restore').length,'canvas state balanced');
  for(const p of v.items(lv,layout)){
   assert.ok(Math.hypot(p.x-center.x,p.y-center.y)>=v.CLEAR.center,`L${lv} keeps the monument clear`);
   for(const g of layout.gates)assert.ok(Math.hypot(p.x-g.x,p.y-g.y)>=v.CLEAR.gate,`L${lv} keeps gates clear`);
   for(const s of layout.slots)assert.ok(Math.hypot(p.x-s.x,p.y-s.y)>=v.CLEAR.slot,`L${lv} keeps tower slots clear`);
   for(const pa of layout.paths)assert.ok(polyDist(p,pa)>=v.CLEAR.path,`L${lv} keeps enemy paths clear`);
   for(const s of streetsOf(lv))assert.ok(polyDist(p,s.points)>=s.halfWidth+v.CLEAR.street,`L${lv} keeps the street surface clear`);
  }
  assert.equal(JSON.stringify(layout),snapshot,`L${lv} layout is not mutated`);
  const again=load('?td2Vegetation=1');
  assert.equal(JSON.stringify(again.items(lv,{...layout})),JSON.stringify(v.items(lv,layout)),`L${lv} placement is deterministic`);
 }
 r=recorder();
 assert.equal(v.draw(r.ctx,3,layouts[3],{low:true}),false,'lowFX disables the pass');
 assert.equal(r.calls.length,0);
 assert.equal(v.draw(recorder().ctx,1,layouts[1],{}),false,'levels outside L3/L6/L7 draw nothing');
 const ambience=read('dist/style2-ambience.js');
 assert.ok(ambience.indexOf('TD2Vegetation?.draw')>0&&ambience.indexOf('TD2Vegetation?.draw')<ambience.indexOf('TD2Traffic?.draw'),'ambience hooks vegetation beneath traffic');
 assert.ok(read('dist/index.html').includes('vegetation.js?v=vegetation-pass-20261123'),'index.html includes vegetation.js with cache key');
 console.log('Vegetation pass: opt-in, clear of paths/slots/gates/street, deterministic, bounded, layout untouched');
})().catch(e=>{console.error(e);process.exitCode=1;});
