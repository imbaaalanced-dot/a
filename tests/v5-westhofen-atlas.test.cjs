'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const code=fs.readFileSync(path.join(__dirname,'../dist/westhofen-art.js'),'utf8');
const html=fs.readFileSync(path.join(__dirname,'../dist/index.html'),'utf8');
const asset=path.join(__dirname,'../dist/assets/scenery/v5/westhofen-props-atlas.webp');
assert.ok(fs.statSync(asset).size>9000 && fs.statSync(asset).size<45000,'small WebP atlas');
assert.match(html,/westhofen-art\.js\?v=westhofen-v5-scene-atlas1/);
assert.equal(code.split('V5_SCENERY_ATLAS_START').length-1,1);
assert.doesNotMatch(code,/steinmonument_dekor\.webp/);

let canvasBuilds=0,propDraws=0;
const requested=[];
class MockImage {
 constructor(){this.naturalWidth=320;this.decoding='auto';}
 set src(url){this.url=url;requested.push(this);}
}
function mockContext(){
 return new Proxy({},{
  get(_t,k){
   if(k==='drawImage')return (...args)=>{if(args[0] instanceof MockImage)propDraws++;};
   return ()=>{};
  },
  set(){return true;}
 });
}
const sandbox={
 document:{createElement(tag){assert.equal(tag,'canvas');canvasBuilds++;return {width:0,height:0,getContext(){return mockContext();}};}},
 Image:MockImage,
 DenkmalLevels:{pathDistance(){return Infinity;}}
};
vm.runInNewContext(code,sandbox);
const art=sandbox.DenkmalWesthofenArt;
const ctx=mockContext(),empty={paths:[],slots:[]};
art.drawGround(ctx,empty);
assert.equal(requested.length,1,'exactly one atlas is preloaded');
assert.equal(canvasBuilds,1,'first canvas drawn before atlas resolves');
assert.equal(propDraws,0,'procedural fallback before image load');
requested[0].onload();
art.drawGround(ctx,empty);
assert.equal(canvasBuilds,2,'cached canvas rebuilt once after image loading');
assert.equal(propDraws,4,'four scenery crops baked exactly once');
art.drawGround(ctx,empty);
assert.equal(canvasBuilds,2,'subsequent frames reuse map canvas');
assert.equal(propDraws,4,'no repeated scenery draws per frame');
art.release();
const blocked={paths:[],slots:[
 {x:1536-700,y:1536-440},{x:1536-780,y:1536-180},
 {x:1536+840,y:1536-150},{x:1536+900,y:1536-500}
]};
art.drawGround(ctx,blocked);
assert.equal(requested.length,2,'on next visit atlas is requested again');
requested[1].onload();
art.drawGround(ctx,blocked);
assert.equal(propDraws,4,'all four scenery sprites skipped when build pads overlap');
console.log('V5 Westhofen atlas lazy loading, single bake, clearance and release: OK');
