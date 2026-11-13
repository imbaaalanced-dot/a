/* Hohensyburg: text-free cached monument is the default and query-compatible. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../dist/hohensyburg-art.js'),'utf8');
function sample(search){
 const calls=[],images=[];let canvases=0;
 const context=new Proxy({
  drawImage(...a){calls.push(a);},
  createLinearGradient(){return {addColorStop(){}};},
  createRadialGradient(){return {addColorStop(){}};}
 },{get(obj,key){return key in obj?obj[key]:()=>{};},set(obj,key,val){obj[key]=val;return true;}});
 const sandbox={globalThis:null,location:{search},Math,
  document:{createElement(type){assert.equal(type,'canvas');canvases++;
   return {width:0,height:0,getContext(){return context;}};}},
  Image:class ImageMock{
   constructor(){this.complete=true;this.naturalWidth=361;this.naturalHeight=550;images.push(this);}
   set src(url){this.loadedFrom=url;}
  }
 };
 sandbox.globalThis=sandbox;
 vm.runInNewContext(source,sandbox,{filename:'hohensyburg-art.js'});
 const art=sandbox.DenkmalHohensyburgArt,center={x:1536,y:1536};
 art.drawMonument(context,center);
 art.drawMonument(context,center);
 return {art,calls,images,canvases,center};
}
const normal=sample('');
assert.equal(normal.art.textFreePreview,true);
assert.equal(normal.images.length,0,'default never loads the branded WebP');
assert.equal(normal.canvases,1,'default monument uses exactly one canvas');
assert.equal(normal.calls.length,2);
assert.strictEqual(normal.calls[0][0],normal.calls[1][0],'cached monument reused');
assert.equal(normal.calls[0][1],normal.center.x-240);
assert.equal(normal.calls[0][2],normal.center.y-500);
assert.equal(normal.calls[0][3],480);
assert.equal(normal.calls[0][4],540);
for(const search of ['?td2SyburgCleanPreview=1','?td2SyburgCleanPreview=0']){
 const state=sample(search);
 assert.equal(state.art.textFreePreview,true,'query parameters cannot re-enable branded image');
 assert.equal(state.images.length,0,'no legacy WebP loads in any mode');
 assert.equal(state.canvases,1,'only one cached canvas per renderer');
}
console.log('Hohensyburg: text-free default, legacy URL compatibility, caching and monument anchor passed.');
