/* Hohensyburg: the known text-embedded WebP remains default;
 * ?td2SyburgCleanPreview=1 selects the existing cached Canvas fallback. */
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
assert.equal(normal.art.textFreePreview,false);
assert.equal(normal.images.length,1,'default keeps the original loaded WebP');
assert.equal(normal.canvases,0,'default sprite does not allocate fallback');
assert.equal(normal.calls.length,2);
assert.match(normal.calls[0][0].loadedFrom,/kaiser-wilhelm-style2\.webp/);
const optin=sample('?td2SyburgCleanPreview=1');
assert.equal(optin.art.textFreePreview,true);
assert.equal(optin.images.length,0,'text-free preview does not request branded WebP in this renderer');
assert.equal(optin.canvases,1,'Canvas monument cached across draws');
assert.equal(optin.calls.length,2);
assert.strictEqual(optin.calls[0][0],optin.calls[1][0],'reuses one cached canvas');
assert.equal(optin.calls[0][1],optin.center.x-240);
assert.equal(optin.calls[0][2],optin.center.y-500);
assert.equal(optin.calls[0][3],480);
assert.equal(optin.calls[0][4],540);
assert.equal(sample('?td2SyburgCleanPreview=0').art.textFreePreview,false);
console.log('Hohensyburg: default sprite, text-free preview, cached fallback and monument anchor passed.');
