/* Westhofen sprite loading, transparent-vector contract and procedural fallback. */
'use strict';
const fs=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/westhofen-art.js'),'utf8');
const sprite=fs.readFileSync(path.join(__dirname,'../dist/assets/westhofen-monument-pilot.svg'),'utf8');

assert.match(sprite,/^<svg /);
assert.match(sprite,/viewBox="-320 -210 640 300"/);
assert.match(sprite,/winged helmet/i);
assert.ok(!/<image\b/i.test(sprite),'the sprite must not load external raster resources');
assert.ok(!/<rect\b[^>]*width="640"/i.test(sprite),'sprite must not have a full-canvas background');

function makeCanvas(){
 const stats={saves:0,restores:0,images:[]};
 const methods={
  save(){stats.saves++;},restore(){stats.restores++;},
  drawImage(...args){stats.images.push(args);}
 };
 const ctx=new Proxy(methods,{get(target,key){return target[key]??(()=>{});}});
 return {ctx,stats};
}
function load(ImageClass){
 const context={Math};
 if(ImageClass)context.Image=ImageClass;
 vm.createContext(context);
 vm.runInContext(source,context);
 return context.DenkmalWesthofenArt;
}
const monument={x:1536,y:1536,hp:100,maxHp:100};
const noImage=load();
let canvas=makeCanvas();
noImage.drawMonument(canvas.ctx,monument);
assert.equal(canvas.stats.images.length,0,'unavailable image API keeps procedural memorial');
assert.equal(canvas.stats.saves,canvas.stats.restores,'no unbalanced context state on fallback');
let pending;
class FakeImage{
 constructor(){pending=this;this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
 set src(value){this._src=value;}
 get src(){return this._src;}
}
const withImage=load(FakeImage);
canvas=makeCanvas();
withImage.drawMonument(canvas.ctx,monument);
assert.equal(canvas.stats.images.length,0,'draw procedural monument while image loads');
assert.match(pending.src,/^assets\/westhofen-monument-v2\.webp\?v=whmonument2$/);
pending.complete=true;pending.naturalWidth=768;pending.naturalHeight=384;pending.onload();
withImage.drawMonument(canvas.ctx,monument);
assert.equal(canvas.stats.images.length,1,'use sprite only after successful image load');
assert.deepEqual(canvas.stats.images[0].slice(1),[-320,-230,640,320],'preserve fixed monument anchor and display footprint');
assert.equal(canvas.stats.saves,canvas.stats.restores,'sprite path preserves canvas state');
const failed=load(FakeImage);
canvas=makeCanvas();
failed.drawMonument(canvas.ctx,monument);
pending.onerror();
failed.drawMonument(canvas.ctx,monument);
assert.equal(canvas.stats.images.length,0,'decode error leaves procedural monument playable');
assert.equal(canvas.stats.saves,canvas.stats.restores);
console.log('Westhofen sprite loader: WebP art, SVG pilot retained, ready, loading and failure fallback verified.');
