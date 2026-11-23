/* Regression: chapter 6/7 monuments must reuse the centrally decoded WebP. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../dist');
for(const scenario of [
 {file:'goethestrasse-art.js',api:'DenkmalGoetheArt',url:'assets/elemental/goethestrasse-memorial-style2.webp?v=style2a1',baked:false},
 {file:'westhofen-art.js',api:'DenkmalWesthofenArt',url:'assets/westhofen/westhofen-memorial-style2-v4.webp?v=westhofen-style2v4',baked:true}
]){
 let newImages=0,urls=[],draws=[],fallbackUrls=[],bakeDraws=[],bakeCanvas=null;
 const decoded={naturalWidth:512,naturalHeight:512,complete:true};
 class MockImage{
  constructor(){newImages++;this.complete=true;this.naturalWidth=512;this.naturalHeight=512;}
  set src(value){fallbackUrls.push(value);}
 }
 const bakeCtx=new Proxy({
  drawImage(...args){bakeDraws.push(args);}
 },{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
 const context=new Proxy({
  drawImage(...args){draws.push(args);},save(){},restore(){}
 },{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
 const box={Math,Image:MockImage,DenkmalAssets:{ready(url){urls.push(url);return decoded;}}};
 // Westhofen bakes the decoded SVG once into an offscreen bitmap; both scenarios
 // must still draw through exactly one shared decode source.
 box.document={createElement(){bakeCanvas={width:0,height:0,getContext:()=>bakeCtx};return bakeCanvas;}};
 box.globalThis=box;
 vm.createContext(box);
 vm.runInContext(fs.readFileSync(path.join(root,scenario.file),'utf8'),box,{filename:scenario.file});
 const art=box[scenario.api],objective={x:1536,y:1536,hp:500,maxHp:500};
 art.drawMonument(context,objective);
 art.drawMonument(context,objective);
 assert.deepEqual(urls,[scenario.url,scenario.url],scenario.file+' uses only the shared asset manager');
 assert.equal(newImages,0,scenario.file+' must not decode a duplicate standalone WebP');
 assert.equal(fallbackUrls.length,0,scenario.file+' must not fetch a duplicate URL');
 if(scenario.baked){
  assert.equal(bakeDraws.filter(a=>a[0]===decoded).length,1,scenario.file+' bakes the decoded asset exactly once');
  assert.equal(draws.filter(a=>a[0]===bakeCanvas).length,2,scenario.file+' draws the baked bitmap per frame');
  assert.equal(bakeCanvas.width,900,scenario.file+' bake covers the 450x300 world footprint at 2x');
  assert.equal(bakeCanvas.height,600,scenario.file+' bake covers the 450x300 world footprint at 2x');
 }else{
  assert.equal(draws.filter(a=>a[0]===decoded).length,2,scenario.file+' draws the decoded asset');
 }
 box.DenkmalAssets.ready=()=>null;
 art.drawMonument(context,objective);
 assert.equal(newImages,0,scenario.file+' keeps its procedural fallback during pending image decode');
 art.release();
 box.DenkmalAssets=null;
 art.drawMonument(context,objective);
 assert.equal(newImages,1,scenario.file+' supports standalone preview without manager');
 assert.deepEqual(fallbackUrls,[scenario.url],scenario.file+' standalone fallback uses identical versioned URL');
}
console.log('Goethestrasse and Westhofen: single image owner, loading fallback and URL identity passed');