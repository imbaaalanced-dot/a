'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const box={Math,localStorage:{getItem(){return null;}}};vm.createContext(box);
vm.runInContext(fs.readFileSync('dist/levels.js','utf8'),box);
assert.ok(fs.existsSync('dist/style2-phase6.js'),'phase 6 renderer exists');
vm.runInContext(fs.readFileSync('dist/style2-phase6.js','utf8'),box);
const p=box.Style2Phase6;
for(const zoom of [.55,1,1.4])for(const camera of [{x:0,y:0},{x:800,y:1250}])for(const point of [{x:0,y:0},{x:1536,y:1536},{x:3072,y:3072}]){
 const screen=p.project(point,camera,zoom),back=p.unproject(screen,camera,zoom);
 assert.ok(Math.abs(back.x-point.x)<1e-8&&Math.abs(back.y-point.y)<1e-8,'picking inverts rendering at all zoom levels');
}
assert.ok(p.depth<1&&p.depth>.7,'oblique projection expands visible ground depth');
for(let i=1;i<=4;i++){
 const layout={...box.DenkmalLevels.levels[i],center:box.DenkmalLevels.center},before=JSON.stringify(layout);
 const details=p.details(i,layout);assert.ok(details.length>40);
 for(const d of details){assert.ok(box.DenkmalLevels.pathDistance(d,layout.paths[0])>=0);
  for(const path of layout.paths)assert.ok(box.DenkmalLevels.pathDistance(d,path)>100,'decorations clear enemy lanes');
  for(const slot of layout.slots)assert.ok(Math.hypot(d.x-slot.x,d.y-slot.y)>80,'decorations clear tower pads');
 }
 assert.equal(JSON.stringify(layout),before,'visuals cannot mutate layout');
 assert.equal(JSON.stringify(p.details(i,layout)),JSON.stringify(details),'no flickering random scenery');
}
console.log('Phase 6 projection round trips and immutable lane-safe scenery: passed');
