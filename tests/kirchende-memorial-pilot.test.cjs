/* Level 3 opt-in monument pilot: lazy files, separate plaque and legacy defaults. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
(async()=>{
 const source=fs.readFileSync(path.join(__dirname,'../dist/kirchende-art.js'),'utf8');
 const loaded=[],siteRects=[];
 class FakeImage {
  constructor(){this.complete=false;this.naturalWidth=0;this.naturalHeight=0;loaded.push(this);}
  ok(){this.complete=true;this.naturalWidth=this.src.includes('opferplatte')?470:261;this.naturalHeight=this.src.includes('opferplatte')?248:425;this.onload();}
  fail(){this.complete=true;this.onerror();}
 }
 const context={Image:FakeImage,location:{search:'?td2KirchendeMemorialPilot=1'},Math,
   setTimeout(){return 1;},clearTimeout(){},
   document:{createElement(tag){assert.equal(tag,'canvas');return {width:0,height:0,getContext(){
     const gradient={addColorStop(){}};
     return new Proxy({createRadialGradient(){return gradient;},createLinearGradient(){return gradient;},fillRect(x,y,w,h){siteRects.push([x,y,w,h]);}},{get(target,k){return k in target?target[k]:()=>{};}});
   }};}}};
 vm.createContext(context);vm.runInContext(source,context);
 const art=context.KirchendeArt;
 assert.equal(loaded.length,0,'pilot does not load before Level 3');
 const loading=art.load();
 const monument=loaded.find(i=>i.src?.includes('monument-style2-pilot.webp'));
 const plaque=loaded.find(i=>i.src?.includes('opferplatte-style2-pilot.webp'));
 assert.ok(monument,'pilot monument WebP requested');
 assert.equal(plaque,undefined,'unapproved candle-bearing plaque sprite must not be requested');
 assert.ok(!loaded.some(i=>i.src?.includes('monument-photo-v2.webp')),'no double preload of original monument');
 loaded.forEach(i=>i.ok());await loading;
 const draws=[],ctx={fillRect(){},strokeRect(){},globalAlpha:1,drawImage(...args){draws.push(args);},save(){},restore(){},translate(){},scale(){}};
 assert.equal(art.draw(ctx,'monument',100,200,235),true);
 art.drawSite(ctx,{x:100,y:200});
 assert.equal(draws.length,2,'monument and one cached plaza draw, no duplicate plaque image');
 assert.ok(siteRects.some(([x,y,w,h])=>x===-44&&y===69&&w===84&&h===35),
   'single slab must be centered in the baked site');
 assert.ok(!siteRects.some(([x,y,w,h])=>x===-115&&y===64&&w===77&&h===38),
   'original left-offset slab must not remain');
 assert.equal(art.ready('plaque'),false,'no fictional plaque asset becomes active');
 const count=loaded.length;await art.load();assert.equal(loaded.length,count,'loaded images reused');
 const normalImages=[];
 class NormalImage extends FakeImage{constructor(){super();normalImages.push(this);}}
 const normal={Image:NormalImage,location:{search:''},Math,setTimeout(){return 1;},clearTimeout(){}};
 vm.createContext(normal);vm.runInContext(source,normal);
 const normalLoading=normal.KirchendeArt.load();
 assert.ok(normalImages.some(i=>i.src?.includes('monument-photo-v2.webp')),'normal level keeps photographic monument');
 assert.ok(!normalImages.some(i=>i.src?.includes('style2-pilot.webp')),'normal level never loads pilot files');
 normalImages.forEach(i=>i.ok());await normalLoading;
 // Missing preview asset: return to the known photographic sprite without blocking the level.
 const failedImages=[];
 class FailureImage{
   complete=false;naturalWidth=0;naturalHeight=0;
   constructor(){failedImages.push(this);}
   ok(){this.complete=true;this.naturalWidth=512;this.naturalHeight=768;this.onload();}
   fail(){this.complete=true;this.onerror();}
 }
 const fallbackCtx={Image:FailureImage,location:{search:'?td2KirchendeMemorialPilot=1'},Math,setTimeout(){return 1;},clearTimeout(){}};
 vm.createContext(fallbackCtx);vm.runInContext(source,fallbackCtx);
 const recovering=fallbackCtx.KirchendeArt.load();
 const broken=failedImages.find(i=>i.src?.includes('monument-style2-pilot.webp'));
 assert.ok(broken,'fallback test requests pilot first');
 failedImages.filter(i=>i!==broken).forEach(i=>i.ok());broken.fail();
 await new Promise(resolve=>setImmediate(resolve));
 const original=failedImages.find(i=>i.src?.includes('monument-photo-v2.webp?v=v400a5photo2'));
 assert.ok(original,'failed pilot triggers a single original image request with the correct cache key');
 original.ok();
 await recovering;
 assert.equal(fallbackCtx.KirchendeArt.ready('monument'),true,'original monument keeps Level 3 available');
 await fallbackCtx.KirchendeArt.load();
 assert.equal(failedImages.filter(i=>i.src?.includes('monument-photo-v2.webp')).length,1,'recovery does not re-download the original');
 console.log('Kirchende pilot loading, centered unlettered slab, no candle sprite and missing-pilot fallback passed');
})().catch(e=>{console.error(e);process.exitCode=1;});
