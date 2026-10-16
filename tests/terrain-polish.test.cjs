/* Visual-only alpha.5 checks; execute with node tests/terrain-polish.test.cjs. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
let canvases=0,patterns=0;
function context(){
 const calls={fills:0,strokes:0,images:0,dashes:[]};
 const out={calls,fill(){calls.fills++;},stroke(){calls.strokes++;},drawImage(){calls.images++;},
 setLineDash(value){calls.dashes.push(value);},
 createPattern(){patterns++;return {pattern:true};},
 createRadialGradient(){return {addColorStop(){}}},createLinearGradient(){return {addColorStop(){}}}};
 return new Proxy(out,{get:(obj,key)=>key in obj?obj[key]:(()=>{}),set:(obj,key,value)=>(obj[key]=value,true)});
}
const sandbox={document:{createElement(){canvases++;return {getContext:context};}},Math};
vm.createContext(sandbox);
for(const file of ['terrain-polish.js','forest-crowns.js']){
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist',file),'utf8'),sandbox,{filename:file});
}
const g=sandbox.DenkmalTerrain,forest=sandbox.DenkmalForest,ctx=context();
assert.ok(g&&forest,'both art modules loaded');
for(let level=1;level<=3;level++){
 const before=ctx.calls.fills;g.drawStars(ctx,100,100,level);
 assert.equal(ctx.calls.fills-before,level,'tower rank is represented by exact gold star count');
}
g.drawGround(ctx,0,0,512,512);
const firstPattern=patterns;g.drawGround(ctx,12,14,200,200);
assert.equal(patterns,firstPattern,'ground does not recreate its pattern every frame');
const road=[{x:0,y:0},{x:60,y:45},{x:150,y:45}];
const beforeStrokes=ctx.calls.strokes;g.drawRoad(ctx,road);
assert.ok(ctx.calls.strokes-beforeStrokes>=6,'footpaths include soft shoulders and a textured surface');
assert.ok(ctx.calls.dashes.every(dash=>dash.length===0),'photo-based footpaths have no traffic-style dashed centerline');
g.drawRoad(ctx,road,{surface:'slabs'});
const warmRoadPatterns=patterns;
g.drawRoad(ctx,road,{surface:'slabs'});
assert.equal(patterns,warmRoadPatterns,'the paved approach reuses its texture');
forest.drawCrown(ctx,120,150,90,0);
const firstCanvases=canvases;forest.drawCrown(ctx,120,150,90,5);
assert.equal(canvases,firstCanvases,'same foliage variant reuses its sprite');
assert.equal(ctx.calls.images,4,'two cached ground draws and two forest crowns render successfully');
for(let i=0;i<5;i++)forest.drawCrown(ctx,120,150,90,i);
for(let i=0;i<3;i++)forest.drawShrub(ctx,90,110,50,i);
const allVariants=canvases;
for(let i=0;i<15;i++){forest.drawCrown(ctx,120,150,90,i);forest.drawShrub(ctx,90,110,50,i);}
assert.equal(canvases,allVariants,'all tree and shrub variants reuse their sprites after warming');
console.log('Alpha.5 photo renderer: stars, cached moss/earth/slabs, all trees and shrubs passed.');
