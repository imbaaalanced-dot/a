/* Regression: chapter 6/7 monuments must reuse the centrally decoded WebP. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../dist');
for(const scenario of [
 {file:'goethestrasse-art.js',api:'DenkmalGoetheArt',url:'assets/elemental/goethestrasse-memorial-style2.webp?v=style2a1'},
 {file:'westhofen-art.js',api:'DenkmalWesthofenArt',url:'assets/westhofen/westhofen-memorial-style2-v3-preview.svg?v=westhofen-style2v3-preview1'}
]){
 let newImages=0,urls=[],draws=[],fallbackUrls=[];
 const decoded={naturalWidth:512,naturalHeight:512,complete:true};
 class MockImage{
  constructor(){newImages++;this.complete=true;this.naturalWidth=512;this.naturalHeight=512;}
  set src(value){fallbackUrls.push(value);}
 }
 const context=new Proxy({
  drawImage(...args){draws.push(args);},save(){},restore(){}
 },{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
 const box={Math,Image:MockImage,DenkmalAssets:{ready(url){urls.push(url);return decoded;}}};
 box.globalThis=box;
 vm.createContext(box);
 vm.runInContext(fs.readFileSync(path.join(root,scenario.file),'utf8'),box,{filename:scenario.file});
 const art=box[scenario.api],objective={x:1536,y:1536,hp:500,maxHp:500};
 art.drawMonument(context,objective);
 art.drawMonument(context,objective);
 assert.deepEqual(urls,[scenario.url,scenario.url],scenario.file+' uses only the shared asset manager');
 assert.equal(newImages,0,scenario.file+' must not decode a duplicate standalone WebP');
 assert.equal(fallbackUrls.length,0,scenario.file+' must not fetch a duplicate URL');
 assert.equal(draws.filter(a=>a[0]===decoded).length,2,scenario.file+' draws the decoded asset');
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
