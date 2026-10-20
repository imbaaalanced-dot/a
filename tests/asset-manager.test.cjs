'use strict';
const {readFileSync}=require('node:fs');
const vm=require('node:vm');
const assert=require('node:assert/strict');
async function run(){
  const created=[];
  class ImageMock{
    constructor(){created.push(this);this.complete=false;this.naturalWidth=0;}
    set src(url){this._src=url;if(!url)return;queueMicrotask(()=>{
      this.complete=true;this.naturalWidth=url.includes('broken')?0:64;
      (this.naturalWidth?this.onload:this.onerror)?.();
    });}
    get src(){return this._src;}
  }
  const box={Image:ImageMock,Promise,Map,Set,Date,globalThis:null};box.globalThis=box;
  vm.createContext(box);vm.runInContext(readFileSync('dist/asset-manager.js','utf8'),box);
  const assets=box.DenkmalAssets;
  const [first,second]=await Promise.all([assets.load('assets/hero/example.webp'),assets.load('assets/hero/example.webp')]);
  assert.equal(first,second);assert.equal(created.length,1,'parallel consumers share one download and image');
  assert.equal(assets.status('assets/hero/example.webp'),'ready');
  assert.equal(await assets.load('assets/broken.webp'),null);
  assert.equal(assets.status('assets/broken.webp'),'failed');
  await assets.level(3);const count=created.length;
  await assets.level(3);assert.equal(created.length,count,'reentering level reuses its images');
  await assets.next(3);assets.release('level:3');
  assert.equal(assets.status('assets/scenery-alpha8.webp?v=alpha8a2'),'ready','shared scene is pinned for level 4');
  assert.equal(assets.status('assets/kirchende/monument-photo-v2.webp?v=v400a5photo2'),'unrequested','previous level art is released');
  assert.equal(assets.status('assets/lion-ende-alpha8.webp?v=alpha8a2'),'ready');
  console.log('Asset manager: coalescing, fallback status, next-level preload and release passed');
}
run().catch(error=>{console.error(error);process.exitCode=1;});
