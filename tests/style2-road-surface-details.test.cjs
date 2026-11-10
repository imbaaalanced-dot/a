'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
let allocations=0;
const details=[];
function drawingContext(id){
 const stats={ellipses:0,rectangles:0,strokes:0};
 details[id]=stats;
 const ctx={
  save(){},restore(){},translate(){},rotate(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},
  stroke(){stats.strokes++;},fill(){},fillRect(){stats.rectangles++;},strokeRect(){},
  ellipse(){stats.ellipses++;},
  setLineDash(){},
  createPattern(){return {reusable:true};},
  createRadialGradient(){return {addColorStop(){}};},
  createLinearGradient(){return {addColorStop(){}};}
 };
 return ctx;
}
const render=drawingContext(-1);
const sandbox={Math,document:{createElement(type){
 assert.equal(type,'canvas');
 const id=allocations++;
 return {width:0,height:0,getContext(){return drawingContext(id);}};
}}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/terrain-polish.js'),'utf8'),sandbox);
const pathPoints=[{x:100,y:200},{x:200,y:250},{x:350,y:270}];
const terrain=sandbox.DenkmalTerrain;
terrain.drawRoad(render,pathPoints,{surface:'earth'});
terrain.drawRoad(render,pathPoints,{surface:'slabs'});
assert.equal(allocations,2,'only earth and stone cached 256px canvases are created');
assert.ok(details[0].ellipses>=135,'earth material includes baked, seeded moss and pebble flecks');
assert.ok(details[1].rectangles>=60,'stone material includes embedded, baked moss seams');
const strokes=details[-1].strokes;
assert.equal(strokes,18,'two roads use existing nine stroke passes each');
for(let n=0;n<15;n++){
 terrain.drawRoad(render,pathPoints,{surface:n%2?'earth':'slabs'});
}
assert.equal(allocations,2,'repeated road draws reuse material textures');
assert.equal(details[-1].strokes-strokes,15*9,'baked detail adds no road-frame stroke cost');
console.log('Style 2 road materials: moss, pebble/paving details and fixed cache budget passed');
