/* Deterministic V4.1 map dressing: geometry, clearance, bounded caches, cold fallback. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../dist');
let allocated=0,blits=0,shapes=0;
const ctx=new Proxy({drawImage(){blits++;},fill(){shapes++;},stroke(){shapes++;},createRadialGradient(){return {addColorStop(){}};}},{get(o,k){return k in o?o[k]:()=>{};},set(o,k,v){o[k]=v;return true;}});
const box={Math,document:{createElement(type){assert.equal(type,'canvas');allocated++;return {width:0,height:0,getContext(){return ctx;}};}},localStorage:{getItem(){return null;},setItem(){}}};
vm.createContext(box);
for(const name of ['persisted-state.js','levels.js','map-polish-v410.js'])vm.runInContext(fs.readFileSync(path.join(root,name),'utf8'),box);
const api=box.DenkmalMapPolish,levels=box.DenkmalLevels;
assert.equal(allocated,0,'loading creates no canvases or downloads');
const original=JSON.stringify(levels.levels),plans=[];
for(let level=1;level<=7;level++){
 const layout={...levels.levels[level],center:levels.center};
 const plan=api.getPlan(level,layout);plans.push(plan);
 assert.ok(Object.isFrozen(plan)&&Object.isFrozen(plan.vegetation),'cached plans cannot mutate');
 assert.ok(plan.vegetation.length>20&&plan.vegetation.length<=240,'every map receives bounded vegetation');
 assert.ok(plan.weathering.length>=20&&plan.weathering.length<=64,'all maps break up repetitive ground with bounded stains');
 assert.ok(Object.isFrozen(plan.weathering),'weathering plans are immutable');
 for(const p of [...plan.weathering,...plan.vegetation,...plan.edges]){
  assert.ok((layout.gates||[]).every(g=>Math.hypot(p.x-g.x,p.y-g.y)>p.r+125),'complete decoration clears spawn gates');
  if(layout.airGate)assert.ok(Math.hypot(p.x-layout.airGate.x,p.y-layout.airGate.y)>p.r+125,'air gate stays visible');
  if(level===6)assert.ok(p.x+p.r<=layout.center.x+620&&p.y+p.r<=layout.center.y+500,'Goethe street frontage stays bare');
  if(level===7){
   assert.ok(p.y+p.r<=layout.center.y+460,'Westhofen street, bus stop and pavement stay bare');
   assert.ok(p.x+p.r<layout.center.x-320||p.x-p.r>layout.center.x+320||p.y+p.r<layout.center.y-210||p.y-p.r>layout.center.y+220,'Westhofen memorial apron stays bare');
  }
 }
 for(const p of plan.weathering){
  assert.ok(layout.paths.every(route=>levels.pathDistance(p,route)>=76+p.r),'full weathering radius clears lanes');
  assert.ok(layout.slots.every(slot=>Math.hypot(p.x-slot.x,p.y-slot.y)>=65+p.r),'weathering clears build pads');
 }
 assert.ok(plan.edges.length>10&&plan.edges.length<=900,'every route receives bounded transition texture');
 assert.ok(plan.contact.length>=12,'each monument has contact patches');
 for(const p of plan.vegetation){
  assert.ok(levels.levels[level].paths.every(route=>levels.pathDistance(p,route)>=74+p.r),'entire vegetation patch clears paths');
  assert.ok(layout.slots.every(s=>Math.hypot(p.x-s.x,p.y-s.y)>=60+p.r),'patch clears tower pads');
  assert.ok(Math.hypot(p.x-layout.center.x,p.y-layout.center.y)>=180+p.r,'monument anchor stays clear');
  if(layout.churchFootprint){const f=layout.churchFootprint,c=layout.center;assert.ok(p.x+p.r<c.x+f.left-35||p.x-p.r>c.x+f.right+35||p.y+p.r<c.y+f.top-35||p.y-p.r>c.y+f.bottom+35,'church exclusion includes patch radius');}
  if(layout.syburgTerrace)for(const f of [layout.syburgTerrace.raised,layout.syburgTerrace.forecourt]){const c=layout.center;assert.ok(p.x+p.r<c.x+f.left-35||p.x-p.r>c.x+f.right+35||p.y+p.r<c.y+f.top-35||p.y-p.r>c.y+f.bottom+35,'terraces remain free');}
 }
 api.drawGround(ctx,level,layout,{x:900,y:900},1200,900);
 api.drawDetails(ctx,level,layout,{x:900,y:900},1200,900);
 const count=allocated,builds=api.stats().builds;
 for(let frame=0;frame<15;frame++){
  const wrapper={...layout}; // Renderer supplies a new shallow wrapper every frame.
  api.drawGround(ctx,level,wrapper,{x:901,y:902},1100,800,{reduced:true});
  api.drawDetails(ctx,level,wrapper,{x:901,y:902},1100,800,{reduced:true});
 }
 assert.equal(allocated,count,'warm frames allocate no canvas');assert.equal(api.stats().builds,builds,'shallow wrappers and reduced motion reuse static atlas');
 assert.equal(api.stats().retainedCanvases,2,'only one map pair is retained');
 assert.ok(api.stats().bytes<=18874368,'normal cache at most 18 MiB');
}
assert.equal(JSON.stringify(levels.levels),original,'no paths, slots, church, terrace or monument coordinates change');
api.reset();
assert.equal(api.stats().retainedCanvases,0);
assert.equal(JSON.stringify(api.getPlan(4,{...levels.levels[4],center:levels.center})),JSON.stringify(plans[3]),'seed reproduces the complete plan');
api.drawGround(ctx,4,{...levels.levels[4],center:levels.center},{x:0,y:0},3072,3072,{low:true});
assert.equal(api.stats().size,768,'low mode rasterizes at quarter world size');assert.ok(api.stats().bytes<=4718592,'low cache at most 4.5 MiB');
const count=allocated,beforeBlits=blits;
api.drawDetails(ctx,4,{...levels.levels[4],center:levels.center},{x:4000,y:4000},100,100,{low:true});
assert.equal(allocated,count);assert.equal(blits,beforeBlits,'off-world crop never issues negative draw rectangles');
assert.equal(api.drawGround(ctx,99,{},null,100,100),false,'unsupported layout fails closed');
assert.ok(shapes>300&&blits>50,'both passes paint and composite');
const fallback={Math,localStorage:box.localStorage};vm.createContext(fallback);vm.runInContext(fs.readFileSync(path.join(root,'map-polish-v410.js'),'utf8'),fallback);
assert.equal(fallback.DenkmalMapPolish.drawGround(ctx,1,{...levels.levels[1],center:levels.center},{x:0,y:0},100,100),false,'missing canvas is a transparent no-op');
let unavailableAllocations=0;fallback.document={createElement(){unavailableAllocations++;return {getContext(){return null;}};}};
fallback.DenkmalMapPolish.reset();
for(let frame=0;frame<12;frame++)assert.equal(fallback.DenkmalMapPolish.drawGround(ctx,1,{...levels.levels[1],center:levels.center},{x:0,y:0},100,100),false);
assert.equal(unavailableAllocations,2,'failed context is remembered instead of allocating every frame');
console.log('V4.1 map polish: all seven deterministic plans, exclusions, immutable layouts, bounded warm/low caches and canvas fallback passed.');
