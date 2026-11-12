/* Isolated opt-in gameplay preview for Style-2 terrain in Kirchende/Westhofen. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'../dist');
const out=process.env.TD2_PILOT_CANVAS_OUT||'/tmp/td2-pilot-canvas';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css',
  '.webp':'image/webp','.png':'image/png','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const pathname=new URL(req.url,'http://localhost').pathname.replace(/^\/v4-style2\//,'/');
  const f=path.resolve(root,'.'+pathname);
  if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(f,(error,data)=>{
    res.writeHead(error?404:200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});
    res.end(error?'not found':data);
  });
});
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  await new Promise(done=>server.listen(0,'127.0.0.1',done));
  const browser=await chromium.launch({headless:true,args:[
    '--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader'
  ]});
  const results=[];
  try{
    for(const level of [3,7])for(const mobile of [false,true]){
      const context=await browser.newContext({
        viewport:mobile?{width:412,height:915}:{width:1280,height:800},
        deviceScaleFactor:1,isMobile:mobile,hasTouch:mobile
      });
      const page=await context.newPage(),errors=[],failed=[],requests=[];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
      page.on('request',request=>requests.push(request.url()));
      await page.goto(
        `http://127.0.0.1:${server.address().port}/v4-style2/index.html?td2Style2Pilot=1`,
        {waitUntil:'networkidle'});
      await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
      const state=await page.evaluate(async(level)=>{
        const ready=await DenkmalTerrain.load();
        if(!ready||!DenkmalTerrain.groundImage?.naturalWidth)
          throw Error('opt-in pilot ground failed to load');
        await KirchendeArt.loadEnvironment();
        DenkmalTestHooks.startGame(level);
        DenkmalTestHooks.launchWave();
        await new Promise(r=>setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(r)),1000));
        const game=DenkmalTestHooks.getGame(),canvas=document.querySelector('#game');
        if(game?.level!==level)throw Error('wrong gameplay level: '+game?.level);
        const {width,height}=canvas;
        let visible=0,p=canvas.getContext('2d').getImageData(0,0,width,height).data;
        for(let i=3;i<p.length;i+=4)if(p[i]>24)visible++;
        if(visible<width*height*.08)throw Error('empty canvas');
        return {level:game.level,wave:game.wave,width,height,visible,
          pilotGroundUrl:DenkmalTerrain.groundImage.currentSrc};
      },level);
      await page.screenshot({path:path.join(out,
        `${mobile?'touch':'desktop'}-level${level}.png`)});
      for(const asset of [
        'environment/ground/forest_floor.webp',
        'environment/ground/gravel_path.webp',
        'environment/ground/cobble_moss.webp'
      ]){
        assert(requests.some(url=>url.includes('style2-pilot-v1/'+asset)),
          'pilot material not fetched: '+asset);
      }
      assert(state.pilotGroundUrl.includes('style2-pilot-v1/'),
        'active terrain remained legacy despite pilot flag');
      assert.deepEqual(failed,[],'all requested scripts and textures must load');
      assert.deepEqual(errors,[],'no JavaScript exceptions');
      results.push({touchEmulated:mobile,...state,failedRequests:failed,errors});
      await context.close();
    }
    fs.writeFileSync(path.join(out,'results.json'),
      JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
    console.log(JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;})
 .finally(()=>server.close());
