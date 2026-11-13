/* Targeted desktop/touch preview QA for the two Level 4 seamfix WebPs.
 * Captures production V3 and opt-in variants in separate clean contexts.
 * Browser emulation is NOT a physical Android hardware acceptance. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const output=process.env.TD2_LEVEL4_SEAMFIX_OUT||'/tmp/td2-level4-seamfix';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css',
 '.webp':'image/webp','.png':'image/png','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname.replace(/^\/v4-style2\//,'/');
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(error,body)=>{
  res.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
  res.end(error?'not found':body);
 });
});
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:[
  '--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader'
 ]});
 const results=[];
 try{
  for(const mobile of [false,true])for(const preview of [false,true]){
   const context=await browser.newContext({
    viewport:mobile?{width:412,height:915}:{width:1280,height:800},
    deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile
   });
   const page=await context.newPage(),errors=[],failed=[],requests=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
   page.on('request',request=>requests.push(request.url()));
   const url=`http://127.0.0.1:${server.address().port}/v4-style2/index.html`+
    (preview?'?td2Level4Seamfix=1':'');
   await page.goto(url,{waitUntil:'networkidle'});
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
   const scene=await page.evaluate(async()=>{
    if(!await DenkmalTerrain.load())throw Error('Level 4 ground failed to load');
    if(!DenkmalTestHooks.getDeveloperMode())DenkmalTestHooks.toggleDeveloperMode();
    const used=[];
    const realDraw=DenkmalTerrain.drawRoad;
    DenkmalTerrain.drawRoad=function(ctx,route,options){
     if(used.length<16)used.push(options?.surface||'earth');
     return realDraw.apply(this,arguments);
    };
    DenkmalTestHooks.startGame(4);
    DenkmalTestHooks.launchWave();
    await new Promise(resolve=>setTimeout(()=>requestAnimationFrame(
     ()=>requestAnimationFrame(resolve)),700));
    const game=DenkmalTestHooks.getGame();
    if(game?.level!==4)throw Error('Level 4 was not started');
    const canvas=document.querySelector('#game');
    if(!canvas)throw Error('Missing game canvas');
    const {width,height}=canvas;
    const pixels=canvas.getContext('2d').getImageData(0,0,width,height).data;
    let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>24)visible++;
    if(visible<width*height*.08)throw Error('Level 4 canvas is empty');
    return {level:game.level,wave:game.wave,width,height,visible,
     enabled:DenkmalTerrain.level4SeamfixEnabled,
     loaded:DenkmalTerrain.level4SeamfixLoaded,surfaces:used};
   });
   assert.equal(scene.enabled,preview,'preview flag must control the actual renderer');
   assert(scene.surfaces.includes('slabs'),'existing cobblestone approaches must render');
   assert.equal(scene.surfaces.includes('flagstone'),preview,
    'Kirchhof West flagstone only appears in the opted-in scene');
   assert.equal(scene.loaded,preview?2:0,'both 512px materials must decode in preview');
   const loaded=requests.filter(x=>x.includes('/assets/level4/level4-')&&x.includes('-seamfix.webp'));
   assert.equal(loaded.length,preview?2:0,'new WebP requests restricted to opt-in');
   if(preview)for(const name of ['cobblestone','flagstone']){
    assert(loaded.some(x=>x.includes(`level4-${name}-512-seamfix.webp`)),
     `missing request for ${name}`);
   }
   assert.deepEqual(errors,[],'no JavaScript exceptions');
   assert.deepEqual(failed,[],'no 4xx/5xx asset or script responses');
   const name=`${preview?'seamfix':'v3-default'}-${mobile?'touch':'desktop'}-level4`;
   await page.screenshot({path:path.join(output,name+'.png')});
   await page.locator('#game').screenshot({path:path.join(output,name+'-canvas.png')});
   results.push({mode:preview?'seamfix':'v3-default',touchEmulated:mobile,
    ...scene,assetRequests:loaded,errors,failedRequests:failed});
   await context.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({
   chromium:browser.version(),physicalAndroidTested:false,results
  },null,2));
  console.log('Level 4 seamfix: four desktop/touch gameplay scenes with correct asset loading, route materials and no browser errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
