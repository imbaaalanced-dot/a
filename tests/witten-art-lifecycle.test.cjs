'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
(async()=>{
 const images=[],draws=[];
 class Image{
  constructor(){images.push(this);this.complete=false;this.naturalWidth=this.naturalHeight=0;}
  set src(url){this.url=url;}
  get src(){return this.url;}
  decode(){return Promise.resolve();}
  async finish(){this.complete=true;this.naturalWidth=this.naturalHeight=512;await this.onload?.();}
 }
 const ctx=new Proxy({drawImage(...args){draws.push(args)},createRadialGradient:()=>({addColorStop(){}})}, {get:(o,k)=>o[k]||(()=>{})});
 const box={Image,Math,Date,console,document:{createElement:()=>({getContext:()=>ctx})}};
 vm.createContext(box);
 for(const file of ['persisted-state.js','levels.js','asset-manager.js','witten-heven-art.js'])vm.runInContext(fs.readFileSync('dist/'+file,'utf8'),box);
 const art=box.DenkmalWittenHevenArt,manager=box.DenkmalAssets,level=box.DenkmalLevels.levels[8],m={x:1536,y:1536};
 art.drawGround(ctx,level);art.drawMonument(ctx,m);
 assert.equal(art.drawBoss(ctx,m),false,'loading boss uses fallback');
 assert.equal(art.drawBoss(ctx,m),false);
 assert.equal(images.filter(i=>i.src.includes('boss-pfeiler')).length,1,'no duplicate standalone boss decode');
 const urls=images.map(i=>i.src);
 assert.ok(urls.length>10,'environment sprites requested');
 await Promise.all(images.map(i=>i.finish()));
 art.drawGround(ctx,level);art.drawMonument(ctx,m);
 assert.equal(art.drawBoss(ctx,m),true);
 assert.equal(images.length,urls.length,'warm draws reuse decoded images');
 art.release();
 for(const url of urls)assert.equal(manager.status(url),'unrequested','released '+url);
 assert.ok(images.every(i=>i.src===''),'decoded image sources cleared');
 // Re-entry and leaving while decode is pending must also release ownership.
 art.drawGround(ctx,level);art.drawMonument(ctx,m);art.drawBoss(ctx,m);
 const pending=images.slice(urls.length);art.release();
 await Promise.all(pending.map(i=>i.finish()));
 for(const url of urls)assert.equal(manager.status(url),'unrequested','late decode released '+url);
 console.log('Witten art: single boss decode, warm reuse, release and pending-decode release passed');
})().catch(e=>{console.error(e);process.exitCode=1});
