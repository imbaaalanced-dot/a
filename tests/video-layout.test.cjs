'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const s={localStorage:{getItem(){return null;},setItem(){}}};
vm.createContext(s);vm.runInContext(fs.readFileSync(path.join(root,'dist/levels.js'),'utf8'),s);
const {levels,center,advance,pathDistance}=s.DenkmalLevels;
// The filmed southern approach runs straight up the steps to the memorial.
for(const route of levels[3].paths.slice(1)){
  for(const p of route.slice(-3))assert.equal(p.x,center.x,'southern lanes must align with the central stair');
}
for(const level of [3,4]){
  for(const route of levels[level].paths){
    const e={...route[0],waypoint:1,speed:100};
    for(let i=0;i<500;i++)advance(e,.1,route);
    assert.equal(e.waypoint,route.length,'enemy can traverse the complete revised route');
    assert.equal(e.x,center.x);assert.equal(e.y,center.y);
  }
  assert.ok(levels[level].slots.length>=levels[level].maxTowers,'enough clear build slots remain');
  for(const p of levels[level].slots)for(const route of levels[level].paths)
    assert.ok(pathDistance(p,route)>=(level===3?64:84));
}
// Exported art geometry must follow runtime paths; stale parallel coordinates
// would show enemies walking beside the newly painted paths.
const geometry=JSON.parse(execFileSync('python',['-c',
  'import runpy,json; m=runpy.run_path("tools/build_style2_maps.py"); print(json.dumps({str(n):{"paths":m["LEVEL_PATHS"][n],"slots":m["slots_for"](n)} for n in (3,4)}))'
],{cwd:root,encoding:'utf8'}));
for(const n of [3,4]){
  assert.deepEqual(geometry[n].paths,Array.from(levels[n].paths,r=>Array.from(r,p=>[p.x,p.y])));
  assert.equal(geometry[n].slots.length,levels[n].slots.length);
}
console.log('Video layout: stair approach, enemy traversal, tower clearance and exported geometry passed.');
