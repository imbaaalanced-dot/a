'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const loaded=[];
const box={Image:class{constructor(){loaded.push(this);}},Math,localStorage:{getItem(){return null;}}};vm.createContext(box);
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
// A standing sprite keeps its height and its foot anchored on oblique ground.
assert.equal(typeof p.upright,'function','standing sprites need projection compensation');
let matrix=[1,0,0,1,0,0],stack=[];
const multiply=m=>{const [a,b,c,d,e,f]=matrix,[A,B,C,D,E,F]=m;matrix=[a*A+c*B,b*A+d*B,a*C+c*D,b*C+d*D,a*E+c*F+e,b*E+d*F+f];};
const transform={save(){stack.push([...matrix]);},restore(){matrix=stack.pop();},translate(x,y){multiply([1,0,0,1,x,y]);},scale(x,y){multiply([x,0,0,y,0,0]);}};
for(const point of [{x:1536,y:1536},{x:10,y:3000}]){
 matrix=[1,0,0,p.depth,0,0];const before=[...matrix];
 p.upright(transform,point,()=>{
  const screen=q=>({x:matrix[0]*q.x+matrix[2]*q.y+matrix[4],y:matrix[1]*q.x+matrix[3]*q.y+matrix[5]});
  const foot=screen(point),top=screen({x:point.x,y:point.y-100});
  assert.ok(Math.abs(foot.y-point.y*p.depth)<1e-8,'foot stays on ground');
  assert.ok(Math.abs(foot.y-top.y-100)<1e-8,'standing height stays undistorted');
 });
 assert.deepEqual(matrix,before,'sprite transform cannot affect subsequent ground draws');
}
console.log('Upright sprites retain foot position and height, then restore world transform.');
// Camera motion reuses a single atlas, and only the visible source rectangle is copied.
let allocations=0,copies=[];
const paint=new Proxy({createRadialGradient:()=>({addColorStop(){}}),createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
box.document={createElement(){allocations++;return {getContext:()=>paint};}};
const target={drawImage(...args){copies.push(args);}};
const layout={...box.DenkmalLevels.levels[3],center:box.DenkmalLevels.center};
p.draw(target,3,layout,{x:1000,y:1200},600,800);
assert.deepEqual(copies[0].slice(1),[500,600,300,400,1000,1200,600,800]);
for(let i=0;i<10;i++)p.draw(target,3,layout,{x:1000+i,y:1200},600,800);
assert.equal(allocations,1,'moving the camera never allocates another atlas');
p.draw(target,3,layout,{x:-100,y:-100},400,400);
assert.deepEqual(copies.at(-1).slice(1),[0,0,150,150,0,0,300,300],'world-edge view clips both source and destination');
const count=copies.length;p.draw(target,3,layout,{x:4000,y:4000},200,200);
assert.equal(copies.length,count,'fully off-map views skip bitmap copies');
console.log('Decoration cache reuses its atlas and crops world-edge camera views.');

assert.equal(loaded.length,1,'shared scenery atlas is requested once');
loaded[0].naturalWidth=768;loaded[0].naturalHeight=512;loaded[0].onload();
p.draw(target,3,layout,{x:1000,y:1200},600,800);
assert.equal(allocations,2,'newly decoded scenery invalidates the ground decoration cache once');
p.draw(target,3,layout,{x:1000,y:1200},600,800);
assert.equal(allocations,2,'warm scenery never allocates another canvas');
for(let i=5;i<=6;i++){
 const layout={...box.DenkmalLevels.levels[i],center:box.DenkmalLevels.center};
 const before=JSON.stringify(layout);
 for(const d of p.details(i,layout))for(const path of layout.paths)assert.ok(box.DenkmalLevels.pathDistance(d,path)>100);
 assert.equal(JSON.stringify(layout),before);
}
