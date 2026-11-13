'use strict';
/* Level 7 opt-in graphic selection: keep V1 default, V2 for preview, with one decoder per successful path. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const root=__dirname+'/../dist';
const v1='assets/westhofen/westhofen-memorial-style2-v1.webp?v=westhofen-style2a1';
const v2='assets/westhofen/westhofen-memorial-style2-v2.webp?v=westhofen-style2-v2a1';

function runArt(query,stub){
 const drawn=[],loaded=[],retained=[],released=[];
 const ctx=new Proxy({drawImage(...args){drawn.push(args);},save(){},restore(){}},{
  get(obj,key){return key in obj?obj[key]:()=>{};},set(obj,key,value){obj[key]=value;return true;}
 });
 const selected={naturalWidth:768,naturalHeight:512,complete:true};
 const fallback={naturalWidth:768,naturalHeight:512,complete:true};
 const images=[];
 class ImageMock{constructor(){images.push(this);this.complete=false;this.naturalWidth=0;this.naturalHeight=0;}
  set src(x){this.url=x;loaded.push(x);} get src(){return this.url;}}
 const assets=stub==='standalone'?null:{
  ready(url){loaded.push(url);return stub==='failed'?(url===v1?fallback:null):url===(query?v2:v1)?selected:null;},
  status(url){return stub==='failed'&&url===v2?'failed':'loading';},
  retain(group,urls){retained.push({group,urls});return Promise.resolve([]);},
  release(group){released.push(group);}
 };
 const box={Math,Image:ImageMock,DenkmalAssets:assets,location:{search:query?'?westhofenArt=v2':''}};
 box.globalThis=box;vm.createContext(box);
 vm.runInContext(fs.readFileSync(root+'/westhofen-art.js','utf8'),box);
 const art=box.DenkmalWesthofenArt,m={x:1536,y:1536,hp:100,maxHp:100};
 art.drawMonument(ctx,m);art.drawMonument(ctx,m);
 return {art,assets,drawn,loaded,retained,released,images,ctx,box};
}
let x=runArt(false,'success');
assert.equal(x.art.previewV2,undefined,'internal preview flag should not leak into game state');
assert.equal(x.drawn.length,2);
assert.equal(x.loaded[0],v1,'default selects the approved V1');
assert.equal(x.loaded.length,2,'no duplicate image request per frame');
assert.deepEqual(x.drawn[0].slice(1),[1311,1271,450,300],'objective anchor remains identical');
assert.equal(x.images.length,0,'manager path must not create its own Image');
x.art.release();

x=runArt(true,'success');
assert.equal(x.drawn.length,2);
assert.deepEqual(x.loaded,[v2,v2],'opt-in V2 gets exactly one shared image owner');
assert.deepEqual(x.retained,[],'healthy V2 never preloads V1');
assert.deepEqual(x.drawn[0].slice(1),[1311,1271,450,300],'V2 retains fixed world placement');
x.art.release();

x=runArt(true,'failed');
assert.equal(x.drawn.length,2,'once V2 fails, available V1 draws at the same location');
assert.equal(x.retained.length,1,'V1 is only retained after V2 failure');
assert.equal(x.retained[0].group,'westhofen:v1-fallback');
assert.deepEqual(x.retained[0].urls,[v1]);
assert.deepEqual(x.loaded,[v2,v1,v2,v1],'one lazy fall-through, no repeated ownership');
x.art.release();
assert.deepEqual(x.released,['westhofen:v1-fallback'],'release fallback ownership after level change');

x=runArt(true,'standalone');
assert.equal(x.images.length,1,'standalone V2 starts one decode');
assert.equal(x.images[0].src,v2);
x.images[0].onerror();
assert.equal(x.images[0].src,v1,'standalone preview recovers to V1 on V2 network failure');
assert.equal(x.images.length,1,'fallback reuses the same HTMLImageElement');

(async()=>{
 const created=[];
 class LoadingImage{constructor(){created.push(this);this.complete=false;this.naturalWidth=0;}
  set src(url){this._src=url;if(!url)return;queueMicrotask(()=>{this.complete=true;this.naturalWidth=768;this.onload?.();});}
  get src(){return this._src;}
  decode(){return Promise.resolve();}
 }
 const box={Math,Image:LoadingImage,Promise,Map,Set,Date,location:{search:'?westhofenArt=v2'}};
 box.globalThis=box;vm.createContext(box);
 vm.runInContext(fs.readFileSync(root+'/asset-manager.js','utf8'),box);
 const am=box.DenkmalAssets;
 assert.deepEqual(Array.from(am.levelAssets[7]),[v2],'next-level preload targets V2 in preview mode');
 await am.level(7);
 assert.equal(am.status(v2),'ready');
 assert.equal(am.status(v1),'unrequested','V1 must not decode for healthy V2');
 am.release('level:7');
 assert.equal(am.status(v2),'unrequested','V2 releases when leaving Westhofen');
 console.log('Westhofen V2: default V1, opt-in V2, exact objective pivot, lazy fallback and asset lifecycle verified');
})().catch(e=>{console.error(e);process.exitCode=1;});
