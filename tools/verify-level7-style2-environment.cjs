/* Desktop and touch-emulated gameplay preview for Westhofen's environment pass. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'../dist');
const output=process.env.TD2_LEVEL7_ENVIRONMENT_OUT||'/tmp/td2-level7-environment';
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
        // Validate the actual V3 preview decoder, not merely that a network request was sent.
        const memorialUrl='assets/westhofen/westhofen-memorial-style2-v3-preview.svg?v=westhofen-style2v3-preview2';
        if(!DenkmalAssets.levelAssets[7].includes(memorialUrl))throw Error('level 7 preload manifest did not select V3 preview');
        const memorial=await DenkmalAssets.load(memorialUrl);
        if(!memorial||memorial.naturalWidth!==768||memorial.naturalHeight!==512)throw Error('V3 preview SVG did not decode to 768x512');
        const createPreview=(width,background)=>{
          const c=document.createElement('canvas');c.width=width;c.height=Math.round(width*512/768);
          const q=c.getContext('2d',{willReadFrequently:true});
          q.fillStyle=background;q.fillRect(0,0,c.width,c.height);
          q.drawImage(memorial,0,0,c.width,c.height);
          return c.toDataURL('image/png');
        };
        const spriteAlpha=document.createElement('canvas');
        spriteAlpha.width=128;spriteAlpha.height=85;
        const spriteCtx=spriteAlpha.getContext('2d',{willReadFrequently:true});
        spriteCtx.drawImage(memorial,0,0,128,85);
        const sampled=spriteCtx.getImageData(0,0,128,85).data;
        let spriteVisiblePixels=0;
        for(let i=3;i<sampled.length;i+=4)if(sampled[i]>=32)spriteVisiblePixels++;
        if(spriteVisiblePixels<500)throw Error('V3 preview sprite appears empty when drawn at 128px');
        const previews={dark64:createPreview(64,'#14221e'),light128:createPreview(128,'#d8d6c9')};
        // Instrument the real gameplay draw for this exact decoded image.
        const originalDraw=CanvasRenderingContext2D.prototype.drawImage;
        let memorialDrawCalls=0;
        CanvasRenderingContext2D.prototype.drawImage=function(...args){
          if(args[0]===memorial)memorialDrawCalls++;
          return originalDraw.apply(this,args);
        };
        try{
          DenkmalTestHooks.startGame(7);
          DenkmalTestHooks.launchWave();
          await new Promise(resolve=>setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)),2200));
        }finally{
          CanvasRenderingContext2D.prototype.drawImage=originalDraw;
        }
        if(memorialDrawCalls===0)throw Error('V3 preview decoded SVG never drawn during live level 7 gameplay');
        const game=DenkmalTestHooks.getGame(),canvas=document.querySelector('#game');
        if(game?.level!==7)throw Error(`expected Westhofen level 7, got ${game?.level}`);
        const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>24)visible++;
        if(visible<canvas.width*canvas.height*.08)throw Error('Westhofen gameplay canvas appears empty');
        return {level:game.level,wave:game.wave,canvas:{width:canvas.width,height:canvas.height},visiblePixels:visible,environmentReady,groundReady,memorialDrawCalls,spriteVisiblePixels,memorialDecoded:[memorial.naturalWidth,memorial.naturalHeight],previews};
      });
      const {previews,...verifiedState}=state;
      for(const [kind,dataUrl] of Object.entries(previews)){
        const filename=`${mobile?'mobile':'desktop'}-westhofen-v3-${kind}.png`;
        fs.writeFileSync(path.join(output,filename),Buffer.from(dataUrl.split(',')[1],'base64'));
      }
      await page.screenshot({path:path.join(output,`${mobile?'mobile':'desktop'}-westhofen-gameplay.png`)});
      assert(requests.some(url=>url.includes('ground-style2-v1.webp')),'shared Style-2 ground texture was not fetched');
      assert(requests.some(url=>url.includes('environment-atlas-style2-v1.webp')),'shared transparent environment atlas was not fetched');
      assert(requests.some(url=>url.includes('westhofen-memorial-style2-v3-preview.svg')),'reference-derived Westhofen memorial was not fetched');
      assert.deepEqual(errors,[],'no JavaScript exceptions');
      assert.deepEqual(failed,[],'no failed asset or script requests');
      results.push({mobileTouchEmulation:mobile,...verifiedState,errors,failedRequests:failed,assetVersion:'westhofen-v3-preview',historicalApproval:false});
      await context.close();
    }
    fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
    console.log(JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
