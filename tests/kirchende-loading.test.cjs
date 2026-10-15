/* Real art loader lifecycle: cold load, failure, retry and decoded sprite use. */
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
(async()=>{
 const images=[],timers=new Map();let nextTimer=0;
 class TestImage{
  complete=false;naturalWidth=0;naturalHeight=0;
  constructor(){images.push(this);}
  decodeOK(){this.complete=true;this.naturalWidth=512;this.naturalHeight=768;this.onload();}
  decodeFail(){this.complete=true;this.onerror();}
 }
 const sandbox={Image:TestImage,Math,setTimeout(fn){timers.set(++nextTimer,fn);return nextTimer;},clearTimeout(id){timers.delete(id);}};
 vm.createContext(sandbox);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/kirchende-art.js'),'utf8'),sandbox);
 const art=sandbox.KirchendeArt;
 await art.load(false);assert.equal(images.length,0,'other levels do not trigger Kirchende downloads');
 const pending=art.load();const failed=images.find(i=>i.src.includes('monument'));
 assert.ok(failed.src.includes('monument-photo-v2.webp'),'mobile loads the optimized photographic sprite');
 assert.equal(art.ready('monument'),false);
 failed.decodeFail();images.filter(i=>i!==failed).forEach(i=>i.decodeOK());await pending;
 const warmImages=images.length,retry=art.load();assert.equal(images.length,warmImages+1,'retry downloads only the failed image');
 images.at(-1).decodeOK();await retry;assert.equal(art.ready('monument'),true);
 const calls=[],ctx=new Proxy({globalAlpha:1,drawImage(...args){calls.push(args);}}, {get:(obj,key)=>key in obj?obj[key]:()=>{}});
 assert.equal(art.draw(ctx,'monument',100,200,235),true);assert.equal(calls.length,1,'decoded monument replaces the fallback');
 await art.load();assert.equal(images.length,warmImages+1,'ready images are reused');
 vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/terrain-polish.js'),'utf8'),sandbox);
 const ground=images.at(-1);ground.decodeFail();const groundImages=images.length;
 const groundRetry=sandbox.DenkmalTerrain.load();
 assert.equal(images.length,groundImages+1,'a failed ground texture can retry without reloading the page');
 images.at(-1).decodeOK();assert.equal(await groundRetry,true);
 console.log('Kirchende art loader: optimized sprite, retry and decoded drawing passed.');
})().catch(error=>{console.error(error);process.exitCode=1;});
