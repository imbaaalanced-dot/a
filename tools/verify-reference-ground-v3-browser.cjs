/* Desktop Chromium + touch-emulated reference-ground V3 screenshots.
 * Does not qualify as a physical Android test. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const output=process.env.TD2_GROUND_V3_OUT||'/tmp/td2-reference-ground-v3';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css',
 '.webp':'image/webp','.png':'image/png','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname.replace(/^\/v4-style2\//,'/');
 const filename=path.resolve(root,'.'+pathname);
 if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(filename,(err,body)=>{
  res.writeHead(err?404:200,{'Content-Type':mime[path.extname(filename)]||'application/octet-stream'});
  res.end(err?'not found':body);
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
  // One default-mode comparison ensures V3 has no silent live activation.
  const scenes=[{level:3,mobile:false,active:false},
   ...[1,2,3,4,5,6,7].flatMap(level=>[
    {level,mobile:false,active:true},{level,mobile:true,active:true}])];
  for(const {level,mobile,active} of scenes){
   const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:800},
    deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile});
   const page=await context.newPage(),errors=[],failed=[],requests=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
   page.on('request',r=>requests.push(r.url()));
   const url=`http://127.0.0.1:${server.address().port}/v4-style2/index.html`+
    (active?'?td2GroundV3=1':'');
   await page.goto(url,{waitUntil:'networkidle'});
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
   const result=await page.evaluate(async lvl=>{
    const ready=await DenkmalTerrain.load();
    if(!ready)throw Error('shared terrain did not load');
    if(TD2GroundV3.enabled&&TD2GroundV3.loadedCount!==9)
      throw Error(`V3 material count ${TD2GroundV3.loadedCount} / 9`);
    // Dedicated isolated test context: developer unlock avoids writing regular campaign progress.
    if(!DenkmalTestHooks.getDeveloperMode())DenkmalTestHooks.toggleDeveloperMode();
    if(lvl===3)await KirchendeArt?.load?.(true);
    DenkmalTestHooks.startGame(lvl);DenkmalTestHooks.launchWave();
    await new Promise(r=>setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(r)),750));
    const game=DenkmalTestHooks.getGame();
    if(game?.level!==lvl)throw Error('incorrect active level: '+game?.level);
    const canvas=document.querySelector('#game'),{width,height}=canvas;
    let visible=0;const pixels=canvas.getContext('2d').getImageData(0,0,width,height).data;
    for(let i=3;i<pixels.length;i+=4)if(pixels[i]>24)visible++;
    if(visible<width*height*.08)throw Error('empty gameplay canvas');
    return {level:game.level,wave:game.wave,visible,canvas:{width,height},
      material:TD2GroundV3.material(lvl,'base'),loaded:TD2GroundV3.loadedCount};
   },level);
   const requestedAssets=requests.filter(u=>u.includes('assets/reference-ground-v3/'));
   assert.equal(requestedAssets.length,active?9:0,'V3 requests must be opt-in and single-load');
   assert.deepEqual(failed,[],'HTTP failures in game and image requests');
   assert.deepEqual(errors,[],'JavaScript exceptions during gameplay');
   await page.screenshot({path:path.join(output,
    `${active?'v3':'default'}-${mobile?'touch':'desktop'}-level${level}.png`)});
   results.push({mode:active?'v3':'default',touchEmulated:mobile,...result,failedRequests:failed,errors});
   await context.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({
   chromium:browser.version(),physicalAndroidTested:false,results},null,2));
  console.log(`V3 chromium: ${results.length} scenes without JS/HTTP errors; Android 4GB NOT tested`);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());