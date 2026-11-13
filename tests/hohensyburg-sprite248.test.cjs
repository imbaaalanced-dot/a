/* Issue #248: opt-in Hohensyburg sprite binary/renderer contract. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../dist');
const script=fs.readFileSync(path.join(root,'hohensyburg-art.js'),'utf8');
assert.equal(script.split('if(textFreePreview||candidate248Preview){').length-1,2,
 'both cleaned stone-material areas must apply to sprite248 preview');
for(const [filename,width,height,budget] of [
  ['kaiser-wilhelm-style2-qa-v1-1x.webp',256,304,35000],
  ['kaiser-wilhelm-style2-qa-v1-2x.webp',512,608,100000],
  ['kaiser-wilhelm-style2-qa-v2-1x.webp',256,304,35000],
  ['kaiser-wilhelm-style2-qa-v2-2x.webp',512,608,100000]
]){
 const asset=fs.readFileSync(path.join(root,'assets/hohensyburg',filename));
 assert.equal(asset.subarray(0,4).toString(),'RIFF');
 assert.equal(asset.subarray(8,16).toString(),'WEBPVP8X');
 assert.ok((asset[20]&16)!==0,'transparency flagged: '+filename);
 assert.equal(asset.readUIntLE(24,3)+1,width);
 assert.equal(asset.readUIntLE(27,3)+1,height);
 assert.ok(asset.length<budget,'WebP exceeds budget: '+filename);
}
function scene(search,{pending=false,failed=false,invalid=false}={}){
 const images=[],draws=[];let canvases=0;
 const ctx=new Proxy({drawImage(...args){draws.push(args);},
  createLinearGradient(){return {addColorStop(){}};},
  createRadialGradient(){return {addColorStop(){}};}
 },{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true;}});
 class ImageMock{
  constructor(){this.complete=true;this.naturalWidth=361;this.naturalHeight=550;images.push(this);}
  set src(url){
   this.loadedFrom=url;
   if(/qa-v[12]-2x\.webp/.test(url)){
    this.naturalWidth=invalid?511:512;this.naturalHeight=608;
    if(failed){this.complete=false;this.onerror?.();}
    else if(pending){this.complete=false;}
    else this.onload?.();
   }
  }
 }
 const context={globalThis:null,location:{search},Math,Image:ImageMock,
   document:{createElement(type){assert.equal(type,'canvas');canvases++;
    return {width:0,height:0,getContext:()=>ctx};}}
 };
 context.globalThis=context;
 vm.runInNewContext(script,context,{filename:'hohensyburg-art.js'});
 const art=context.DenkmalHohensyburgArt,mark={x:1536,y:1536};
 const render=()=>art.drawMonument(ctx,mark);
 render();render();
 return {art,images,draws,mark,render,canvases:()=>canvases};
}
const normal=scene('');
assert.equal(normal.art.candidate248Preview,true,'approved V2 is the Level 5 default');
assert.equal(normal.art.candidate248V2,true);
assert.equal(normal.images.length,1,'default decodes exactly one V2 sprite');
assert.match(normal.images[0].loadedFrom,/kaiser-wilhelm-style2-qa-v2-2x.webp/);
assert.equal(normal.canvases(),0);
const legacy=scene('?td2SyburgLegacy=1');
assert.equal(legacy.art.candidate248Preview,false,'legacy bypasses V2');
assert.equal(legacy.art.legacyMonument,true);
assert.equal(legacy.images.length,1,'legacy retains original WebP');
assert.match(legacy.images[0].loadedFrom,/kaiser-wilhelm-style2.webp/);
assert.equal(legacy.canvases(),0);
const clean=scene('?td2SyburgCleanPreview=1');
assert.equal(clean.images.length,0,'text-free preview still uses no new image');
assert.equal(clean.canvases(),1);
const ready=scene('?td2SyburgArt248=1');
assert.equal(ready.art.candidate248Preview,true);
assert.equal(ready.art.candidate248Ready,true);
assert.equal(ready.images.length,1,'one fetch and decode for the candidate');
assert.match(ready.images[0].loadedFrom,/kaiser-wilhelm-style2-qa-v1-2x.webp/);
assert.equal(ready.canvases(),0,'ready sprite avoids fallback canvas');
assert.equal(ready.draws.length,2);
const width=540*512/608,draw=ready.draws[0];
assert.ok(Math.abs(draw[1]-(ready.mark.x-width/2))<1e-8,'unchanged x anchor');
assert.equal(draw[2],ready.mark.y-500,'unchanged foot anchor');
assert.ok(Math.abs(draw[3]-width)<1e-8);
assert.equal(draw[4],540);
const upgraded=scene('?td2SyburgArt248=2');
assert.equal(upgraded.art.candidate248Preview,true,'V2 activates the common preview');
assert.equal(upgraded.art.candidate248V2,true,'V2 selection is exposed for browser QA');
assert.equal(upgraded.art.candidate248Ready,true,'V2 decodes through the common loader');
assert.equal(upgraded.images.length,1,'V2 loads only one artwork');
assert.match(upgraded.images[0].loadedFrom,/qa-v2-2x\.webp\?v=syburg-248b1/);
assert.equal(upgraded.canvases(),0,'V2 ready sprite avoids fallback Canvas');
assert.equal(upgraded.draws[0][2],upgraded.mark.y-500,'V2 retains original foot anchor');
const pendingV2=scene('?td2SyburgArt248=2',{pending:true});
assert.equal(pendingV2.canvases(),1,'pending V2 uses cached Canvas fallback');
pendingV2.images[0].complete=true;pendingV2.images[0].onload?.();
pendingV2.render();
assert.equal(pendingV2.art.candidate248Ready,true,'deferred V2 transitions to sprite');
const brokenV2=scene('?td2SyburgArt248=2',{failed:true});
assert.equal(brokenV2.art.candidate248Failed,true);
assert.equal(brokenV2.canvases(),1,'broken V2 preserves the cached Canvas fallback');
const pending=scene('?td2SyburgArt248=1',{pending:true});
assert.equal(pending.images.length,1);
assert.equal(pending.canvases(),1,'pending image uses cached Canvas fallback');
assert.strictEqual(pending.draws[0][0],pending.draws[1][0],'fallback not reallocated');
pending.images[0].complete=true;pending.images[0].onload?.();
pending.render();
assert.equal(pending.art.candidate248Ready,true);
assert.strictEqual(pending.draws.at(-1)[0],pending.images[0]);
const broken=scene('?td2SyburgArt248=1',{failed:true});
assert.equal(broken.art.candidate248Failed,true);
assert.equal(broken.images.length,1,'error never retries on every frame');
assert.equal(broken.canvases(),1,'load failure restores cached Canvas');
const badSize=scene('?td2SyburgArt248=1',{invalid:true});
assert.equal(badSize.art.candidate248Failed,true);
assert.equal(badSize.canvases(),1,'invalid dimensions restore Canvas');
console.log('Hohensyburg #248: V2 default, legacy opt-out, four alpha WebPs, caching and fallback passed.');
