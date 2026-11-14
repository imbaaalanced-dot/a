'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function context(draws=[]){return new Proxy({drawImage(...a){draws.push(a);},createLinearGradient(){return {addColorStop(){}};},createRadialGradient(){return {addColorStop(){}};}},{get:(o,k)=>k in o?o[k]:()=>{}});}
const box={Math,Date,performance:{now:()=>0},localStorage:{getItem(){return null;},setItem(){}},document:{createElement(){return {width:0,height:0,getContext:()=>context()};}}};
vm.createContext(box);
for(const file of ['persisted-state.js','levels.js','kirchende-art.js','map-polish-v410.js','v2-expansion.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),box,{filename:file});
const layout={...box.DenkmalLevels.levels[3],center:box.DenkmalLevels.center},original=JSON.stringify(box.DenkmalLevels.levels),draws=[];
box.KirchendeArt.drawScenery(context(draws),layout.center,[],{crowns:false,low:true});
const buildings=draws.slice(0,2).map(([image,x,y])=>({left:layout.center.x+x,top:layout.center.y+y,right:layout.center.x+x+image.width,bottom:layout.center.y+y+image.height}));
assert.equal(buildings.length,2,'derive exclusions from the actual house sprite draws');
const clear=(p,r)=>buildings.every(b=>p.x+r<b.left||p.x-r>b.right||p.y+r<b.top||p.y-r>b.bottom);
function verify(){
 const plan=box.DenkmalMapPolish.getPlan(3,layout);
 for(const group of ['weathering','vegetation','edges'])for(const p of plan[group])assert.ok(clear(p,p.r),group+' must not paint on a house roof or facade');
 const props=box.V2Expansion.placements(3,layout);
 assert.ok(props.length>20,'retain village detail outside the houses');
 for(const p of props)assert.ok(clear(p,p.size),'expansion sprite bounds must clear the painted buildings');
 assert.equal(box.DenkmalMapPolish.getPlan(3,{...layout}),plan,'warm map plans are reused');
 assert.equal(box.V2Expansion.placements(3,{...layout}),props,'warm prop plans are reused');
 assert.equal(JSON.stringify(box.DenkmalLevels.levels),original,'no path, pad, street or level geometry changes');
}
verify();
const art=box.KirchendeArt;box.KirchendeArt=undefined;
const cold=box.DenkmalMapPolish.getPlan(3,layout),coldProps=box.V2Expansion.placements(3,layout);
box.KirchendeArt=art;
assert.ok(box.DenkmalMapPolish.getPlan(3,layout)!==cold,'late scenery metadata invalidates the old plan');
assert.ok(box.V2Expansion.placements(3,layout)!==coldProps,'late building bounds invalidate cached prop positions');
verify();
console.log('Kirchende: decoration clears actual house sprite bounds, late metadata refreshes plans, warm caches and level geometry stay intact.');
