/* Desktop and touch-emulated gameplay preview for Goethestraße's environment pass. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'../dist');
const output=process.env.TD2_LEVEL6_ENVIRONMENT_OUT||'/tmp/td2-level6-environment';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname.replace(/^\/v4-style2\//,'/');
  const file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(error?'not found':data);});
});
(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
  const results=[];
  try{
    for(const mobile of [false,true]){
      const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
      const page=await context.newPage(),errors=[],failed=[],requests=[];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
      page.on('request',request=>requests.push(request.url()));
      await page.goto(`http://127.0.0.1:${server.address().port}/v4-style2/index.html`,{waitUntil:'networkidle'});
      await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
      const state=await page.evaluate(async()=>{
        const environmentReady=await KirchendeArt.loadEnvironment();
        const groundReady=await DenkmalTerrain.load();
        if(!environmentReady||!KirchendeArt.ready('environment'))throw Error('shared environment atlas failed to load');
        if(!groundReady||!DenkmalTerrain.groundImage?.naturalWidth)throw Error('shared Style-2 ground texture failed to load');
        DenkmalTestHooks.startGame(6);
        DenkmalTestHooks.launchWave();
        await new Promise(resolve=>setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)),2200));
        const game=DenkmalTestHooks.getGame(),canvas=document.querySelector('#game');
        if(game?.level!==6)throw Error(`expected Goethestraße level 6, got ${game?.level}`);
        const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>24)visible++;
        if(visible<canvas.width*canvas.height*.08)throw Error('Goethestraße gameplay canvas appears empty');
        return {level:game.level,wave:game.wave,canvas:{width:canvas.width,height:canvas.height},visiblePixels:visible,environmentReady,groundReady};
      });
      await page.screenshot({path:path.join(output,`${mobile?'mobile':'desktop'}-goethestrasse-gameplay.png`)});
      assert(requests.some(url=>url.includes('ground-style2-v1.webp')),'shared Style-2 ground texture was not fetched');
      assert(requests.some(url=>url.includes('environment-atlas-style2-v1.webp')),'shared transparent environment atlas was not fetched');
      assert.deepEqual(errors,[],'no JavaScript exceptions');
      assert.deepEqual(failed,[],'no failed asset or script requests');
      results.push({mobileTouchEmulation:mobile,...state,errors,failedRequests:failed});
      await context.close();
    }
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
    console.log(JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
