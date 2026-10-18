'use strict';
// Photo-derived Ender Dorfkirche sprite: actual WebP bytes, loading, fallback, anchors.
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const src=fs.readFileSync('dist/church-art.js','utf8');
const html=fs.readFileSync('dist/index.html','utf8');
const png=fs.readFileSync('dist/assets/church-ende-alpha8.webp');
assert.equal(png.subarray(0,4).toString('ascii'),'RIFF');
assert.equal(png.subarray(8,12).toString('ascii'),'WEBP');
assert.match(html,/church-art\.js\?v=alpha8a2/);
let canvases=0,draws=[],save=0,loadUrls=[];
const grad=()=>({addColorStop(){}});
const ctx=new Proxy({
  drawImage(...args){draws.push(args);},
  createLinearGradient:grad,createRadialGradient:grad,
  save(){save++;},restore(){save--;}
},{get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>(o[k]=v,true)});
const document={createElement(tag){
  assert.equal(tag,'canvas');canvases++;
  return {width:0,height:0,getContext:()=>ctx};
}};
let imageInstance=null;
class ImageMock {
  constructor(){this.naturalWidth=1254;this.naturalHeight=1254;if(!imageInstance)imageInstance=this;}
  set src(url){loadUrls.push(url);this.onload?.();}
}
const box={Math,document,Image:ImageMock};
vm.createContext(box);vm.runInContext(src,box);
const art=box.DenkmalChurch,center={x:1536,y:1536};
assert.ok(art.churchSpriteReady&&!art.churchSpriteFailed);
assert.equal(loadUrls[0],'assets/church-ende-alpha8.webp?v=alpha8a2');
assert.equal(loadUrls[1],'assets/lion-ende-alpha8.webp?v=alpha8a2');
art.drawBackdrop(ctx,center);
const first=draws.find(a=>a[0]===imageInstance);
assert.ok(first,'the generated church WebP must be drawn, not only loaded');
assert.deepEqual(first.slice(1),[-520,-1100,760,760]);
assert.equal(canvases,0,'loaded asset should bypass procedural church rasterization');
for(let i=0;i<70;i++)art.drawBackdrop(ctx,center);
assert.equal(canvases,0,'no new architecture canvases per frame');
assert.equal(save,0,'canvas transforms restored');
const fb={Math,document};
vm.createContext(fb);vm.runInContext(src,fb);
draws=[];
fb.DenkmalChurch.drawBackdrop(ctx,center);
assert.ok(canvases===1,'procedural fallback remains when Image is absent');
assert.ok(draws.some(a=>a[1]===-500&&a[2]===-930),'fallback geometry not moved');
console.log('Level 4 church generated WebP, loading, alignment and fallback verified.');
