/* TD2 HUD 2.0 — Chromium layout smoke (desktop + touch portrait/landscape). */
'use strict';
const {chromium}=require('playwright');
const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const output=process.env.TD2_HUD_QA_OUT||'/tmp/td2-hud2-qa';
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.woff2':'font/woff2'};
const server=http.createServer((request,response)=>{
  let file=path.resolve(root,'.'+new URL(request.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){response.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  fs.readFile(file,(error,bytes)=>{response.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});response.end(error?'missing':bytes);});
});

(async()=>{
  fs.mkdirSync(output,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/index.html`;
  const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
  const results=[];
  try{
    for(const test of [
      {name:'portrait',width:390,height:844,touch:true},
      {name:'landscape',width:844,height:390,touch:true},
      {name:'desktop',width:1280,height:800,touch:false}
    ]){
      const context=await browser.newContext({viewport:{width:test.width,height:test.height},hasTouch:test.touch,isMobile:test.touch,reducedMotion:'reduce'});
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
      await page.goto(url,{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>!document.getElementById('td2Loading'),null,{timeout:45000});
      await page.evaluate(()=>{DenkmalTestHooks.startGame(1);HeroSaga.continueStory();});
      await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing',null,{timeout:15000});
      await page.waitForTimeout(250);
      if(test.touch){
        assert.equal(await page.locator('#compactHud').isVisible(),true,test.name+' compact status shown');
        assert.equal(await page.locator('#mobileNextWaveBtn').isVisible(),true,test.name+' wave-start action visible during build pause');
        await page.evaluate(()=>DenkmalTestHooks.launchWave());
        assert.equal(await page.locator('#mobileNextWaveBtn').isVisible(),false,test.name+' wave-start action hides during combat');
        assert.equal(await page.locator('#arsenal').isVisible(),false,test.name+' full arsenal hidden');
        assert.equal(await page.locator('#buildBtn').isVisible(),false,test.name+' duplicate build button hidden');
        assert.equal(await page.locator('#soulBtn').isVisible(),true,test.name+' soul button shown');
        assert.equal(await page.locator('#dodgeBtn').isVisible(),true,test.name+' dodge button shown');
        const bounds=await page.locator('#compactHud').boundingBox();
        assert.ok(bounds&&bounds.height<78&&bounds.width<test.width*.92,test.name+' compact HUD stays narrow');
        const closeSize=await page.locator('#touchContext .touch-context-close').evaluate(el=>({w:getComputedStyle(el).minWidth,h:getComputedStyle(el).minHeight}));
        assert.equal(closeSize.w,'48px');assert.equal(closeSize.h,'48px');
        await page.locator('#touchContext').evaluate(el=>{el.hidden=false;el.classList.remove('hidden');});
        const panel=await page.locator('#touchContext').boundingBox(),soul=await page.locator('#soulBtn').boundingBox();
        assert.ok(panel&&soul&&panel.y+panel.height<=soul.y,test.name+' temporary tower menu clears ability controls');
        await page.locator('#touchContext').evaluate(el=>{el.hidden=true;el.classList.add('hidden');});
      }else{
        assert.equal(await page.locator('#compactHud').isVisible(),false,'desktop keeps original HUD');
        assert.equal(await page.locator('#arsenal').isVisible(),true,'desktop arsenal still visible');
      }
      await page.screenshot({path:path.join(output,test.name+'.png')});
      assert.deepEqual(errors,[],test.name+' JavaScript errors');
      results.push({name:test.name,errors,compact:await page.locator('#compactHud').isVisible()});
      await context.close();
    }
    fs.writeFileSync(path.join(output,'result.json'),JSON.stringify({browser:await browser.version(),results},null,2));
    console.log('TD2 HUD 2.0 Chromium smoke passed:',results.map(r=>r.name).join(', '));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
