/* Browser QA: native Fullscreen API in the campaign and Ansturm on desktop/touch Chromium. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
  const filename=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!filename.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(filename,(error,bytes)=>{
    res.writeHead(error?404:200,{'Content-Type':types[path.extname(filename)]||'application/octet-stream'});
    res.end(error?'not found':bytes);
  });
});
const waitOn=async(page,enabled)=>page.waitForFunction(expected=>Boolean(document.fullscreenElement)===expected,enabled,{timeout:9000});
(async()=>{
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
  const reports=[];
  try{
    for(const mobile of [false,true]){
      for(const mode of ['campaign','ansturm']){
        const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
        const page=await context.newPage(),errors=[],missing=[];
        page.on('pageerror',error=>errors.push(error.message));
        page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
        try{
          const url='http://127.0.0.1:'+server.address().port+(mode==='campaign'?'/index.html':'/ansturm/index.html');
          await page.goto(url,{waitUntil:'networkidle',timeout:60000});
          let selector;
          if(mode==='campaign'){
            await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
            selector='#menuFullscreenBtn';
            const options=mobile?'.td2-dock-button[data-td2-target="options"]':'#menuOptionsBtn';
            await page.locator(options).click();
            await page.locator(selector).waitFor({state:'visible'});
          }else selector='#introFullscreen';
          await page.locator(selector).click();
          await waitOn(page,true);
          assert.equal(await page.locator(selector).getAttribute('aria-pressed'),'true','fullscreen button must reflect active state');
          await page.locator(selector).click();
          await waitOn(page,false);
          assert.equal(await page.locator(selector).getAttribute('aria-pressed'),'false','fullscreen button must reflect exit');
          assert.deepEqual(errors,[],'no JavaScript errors in fullscreen flow');
          assert.deepEqual(missing,[],'no missing static game assets');
          reports.push({mode,touchEmulation:mobile,fullscreenEnter:true,fullscreenExit:true,javaScriptErrors:0,httpErrors:0,physicalAndroidTested:false});
        }finally{await context.close();}
      }
    }
    console.log(JSON.stringify({browser:browser.version(),reports},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
