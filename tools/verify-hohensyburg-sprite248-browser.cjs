/* Issue #248: compare default, clean Canvas and new RGBA artwork in
 * actual Level 5 Chromium scenes. Touch emulation != physical Android QA. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const output=process.env.TD2_SYBURG_248_OUT||'/tmp/td2-syburg-248';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css',
 '.webp':'image/webp','.png':'image/png','.json':'application/json','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname.replace(/^\/v4-style2\//,'/');
 const file=path.resolve(root,'.'+pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,body)=>{
  res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
  res.end(err?'not found':body);
 });
});
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox',
  '--disable-dev-shm-usage','--use-angle=swiftshader']});
 const modes=[{name:'canvas-clean',query:'?td2SyburgCleanPreview=1'},
  {name:'sprite248',query:'?td2SyburgArt248=1'},
  {name:'sprite248-v2',query:''}];
 const results=[];
 try{
  for(const mobile of [false,true])for(const mode of modes){
   const context=await browser.newContext({
    viewport:mobile?{width:412,height:915}:{width:1280,height:800},
    isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1
   });
   const page=await context.newPage(),errors=[],failed=[],requests=[];
   page.on('pageerror',error=>errors.push(error.message));
   page.on('response',response=>{if(response.status()>=400)failed.push(response.url());});
   page.on('request',request=>requests.push(request.url()));
   await page.goto(`http://127.0.0.1:${server.address().port}/v4-style2/index.html`+mode.query,{waitUntil:'networkidle'});
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
   const scene=await page.evaluate(async()=>{
    if(!await DenkmalTerrain.load())throw Error('terrain failed to load');
    DenkmalTestHooks.startGame(5);
    DenkmalTestHooks.launchWave();
    await new Promise(resolve=>setTimeout(()=>requestAnimationFrame(
     ()=>requestAnimationFrame(resolve)),700));
    const game=DenkmalTestHooks.getGame();
    if(game?.level!==5)throw Error('Hohensyburg Level 5 was not started');
    const canvas=document.querySelector('#game'),w=canvas.width,h=canvas.height;
    const pixels=canvas.getContext('2d').getImageData(0,0,w,h).data;
    let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>24)visible++;
    if(visible<w*h*.08)throw Error('empty gameplay canvas');
    return {level:game.level,wave:game.wave,visible,canvas:{w,h},
      candidateEnabled:DenkmalHohensyburgArt.candidate248Preview,
      candidateV2:DenkmalHohensyburgArt.candidate248V2,
      cleanEnabled:DenkmalHohensyburgArt.textFreePreview};
   });
   assert.equal(scene.candidateEnabled,mode.name.startsWith('sprite248'));
   assert.equal(scene.candidateV2,mode.name==='sprite248-v2');
   assert.equal(scene.cleanEnabled,mode.name==='canvas-clean');
   if(mode.name.startsWith('sprite248')){
    await page.waitForFunction(()=>DenkmalHohensyburgArt.candidate248Ready,null,{timeout:15000});
    const meta=await page.evaluate(()=>({
      loaded:DenkmalHohensyburgArt.candidate248Ready,failed:DenkmalHohensyburgArt.candidate248Failed
    }));
    assert(meta.loaded&&!meta.failed,'512x608 candidate decoded');
   }
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const requested=requests.filter(url=>/kaiser-wilhelm-style2-qa-v[12]-2x\.webp/.test(url));
   const hasCandidate=mode.name.startsWith('sprite248');
   assert.equal(requested.length,hasCandidate?1:0,'preview image request restricted to opt-in');
   if(hasCandidate){
     const chosenVersion=mode.name==='sprite248-v2'?'v2':'v1';
     assert(requested[0].includes('qa-'+chosenVersion+'-2x.webp'),
       'only the selected Hohensyburg sprite variant should load');
   }
   assert.deepEqual(errors,[],'no JavaScript exceptions');
   assert.deepEqual(failed,[],'no 4xx/5xx requests');
   const label=`${mode.name}-${mobile?'touch':'desktop'}-level5`;
   await page.screenshot({path:path.join(output,label+'.png')});
   await page.locator('#game').screenshot({path:path.join(output,label+'-canvas.png')});
   results.push({mode:mode.name,touchEmulated:mobile,...scene,requested,errors,failed});
   await context.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({
   chromium:browser.version(),physicalAndroidTested:false,results
  },null,2));
  console.log('Hohensyburg #248: 6 scenes passed; V2 default, V1 opt-in and Canvas fallback; correct WebP loaded once.');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
