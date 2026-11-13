/* Hohensyburg: verify the cached text-free monument is used with and without
 * the legacy optional preview parameter.
 * Chromium touch emulation is not an Android 4 GB hardware test. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const output=process.env.TD2_SYBURG_TEXT_FREE_OUT||'/tmp/td2-syburg-text-free';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css',
 '.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname.replace(/^\/v4-style2\//,'/'));
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{
  res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
  res.end(err?'not found':data);
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
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1
   });
   const page=await context.newPage(),errors=[],failed=[],requests=[];
   page.on('request',req=>requests.push(req.url()));
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
   const url=`http://127.0.0.1:${server.address().port}/v4-style2/index.html`+
    (preview?'?td2SyburgCleanPreview=1':'');
   await page.goto(url,{waitUntil:'networkidle'});
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
   const state=await page.evaluate(async()=>{
    const ready=await DenkmalTerrain.load();
    if(!ready)throw Error('shared terrain did not load');
    DenkmalTestHooks.startGame(5);
    DenkmalTestHooks.launchWave();
    await new Promise(resolve=>setTimeout(()=>requestAnimationFrame(
      ()=>requestAnimationFrame(resolve)),700));
    const game=DenkmalTestHooks.getGame();
    if(game?.level!==5)throw Error('Hohensyburg level 5 did not launch');
    const canvas=document.querySelector('#game');
    const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
    let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>24)visible++;
    if(visible<canvas.width*canvas.height*.08)throw Error('empty Hohensyburg canvas');
    return {level:game.level,wave:game.wave,width:canvas.width,height:canvas.height,
     visible,textFreePreview:DenkmalHohensyburgArt.textFreePreview,
     allocations:DenkmalHohensyburgArt.allocations};
   });
   assert.equal(state.textFreePreview,true,'all sessions must use text-free monument');
   assert.ok(!requests.some(url=>url.includes('kaiser-wilhelm-style2.webp')),
     'branded Hohensyburg asset must not be requested');
   assert.deepEqual(errors,[],'no JavaScript exceptions');
   assert.deepEqual(failed,[],'no HTTP failures');
   const label=`${preview?'legacy-query-clean':'default-clean'}-${mobile?'touch':'desktop'}`;
   await page.screenshot({path:path.join(output,label+'.png')});
   await page.locator('#game').screenshot({path:path.join(output,label+'-canvas.png')});
   results.push({label,emulatedTouch:mobile,...state,errors,failed});
   await context.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({
    chromium:browser.version(),physicalAndroidTested:false,results
  },null,2));
  console.log('Hohensyburg text-free runtime: 4 Chromium scenes without branded asset requests');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
