/* Five distinct cached canopy silhouettes; no new buffers after warm-up. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
let allocations=0;
const shapes=[];
function context(id){
 const c={globalCompositeOperation:'source-over',
  beginPath(){},arc(){},fill(){},fillRect(){},drawImage(){},
  createRadialGradient(){return {addColorStop(){}};},
  createLinearGradient(){return {addColorStop(){}};},
  ellipse(x,y,rx,ry){if(x===128&&y===130&&rx>50&&ry>50)shapes[id].push([rx,ry]);}
 };
 return c;
}
const sandbox={Math,document:{createElement(type){
 assert.equal(type,'canvas');
 const id=allocations++;shapes[id]=[];
 return {width:0,height:0,getContext(){return context(id);}};
}}};
vm.createContext(sandbox);
const filename=path.join(__dirname,'../dist/forest-crowns.js');
vm.runInContext(fs.readFileSync(filename,'utf8'),sandbox);
const forest=sandbox.DenkmalForest;
assert.ok(forest?.drawCrown,'forest renderer registered');
const draw={drawImage(){}};
for(let i=0;i<5;i++)forest.drawCrown(draw,150,180,72,i);
assert.equal(allocations,5,'five profiles use only five lazily cached 256px textures');
const silhouettes=shapes.map(v=>v[0]?.map(n=>Number(n.toFixed(2))).join(':'));
assert.equal(new Set(silhouettes).size,5,'five silhouettes have distinct broad/tall/sparse proportions');
for(let i=0;i<50;i++)forest.drawCrown(draw,150,180,72,i);
assert.equal(allocations,5,'every repeat reuses one of five cached crown variants');
for(let i=0;i<3;i++)forest.drawShrub(draw,150,180,42,i);
assert.equal(allocations,8,'three shrubs add exactly three lazily cached 192px textures');
const shrubSilhouettes=shapes.slice(5).map(v=>v[0]?.map(n=>Number(n.toFixed(2))).join(':'));
assert.equal(new Set(shrubSilhouettes).size,3,'three shrubs have distinct width and height');
for(let i=0;i<30;i++)forest.drawShrub(draw,150,180,42,i);
assert.equal(allocations,8,'repeated shrub drawing creates no new canvases');
assert.ok(!/Math\.random|requestAnimationFrame|setInterval/.test(fs.readFileSync(filename,'utf8')),
 'no unseeded per-frame decoration or animation');
console.log('Style 2 forest silhouettes: five distinct cached crown profiles passed');
