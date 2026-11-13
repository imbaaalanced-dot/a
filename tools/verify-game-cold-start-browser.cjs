/* Player-menu startup with material responses held or failed; no manual loader/reset calls. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=process.env.TD2_ENVIRONMENT_ROOT||path.resolve(__dirname,'../dist');
const output=process.env.TD2_COLD_START_OUT||'/tmp/td2-game-cold-start';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});
});
(async()=>{
 fs.mkdirSync(output,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.TD2_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const results=[];
 try{
  for(const mobile of [false,true])for(const fail of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
   const page=await context.newPage(),errors=[],failed=[];let requested=0,release;
   const held=new Promise(resolve=>{release=resolve;});
   page.on('pageerror',e=>errors.push(e.message));page.on('requestfailed',r=>failed.push({url:r.url(),error:r.failure()?.errorText}));
   await page.route('**/assets/reference-ground-v3/*.webp*',async route=>{requested++;await held;if(fail)await route.abort('failed');else await route.continue();});
   await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:'domcontentloaded'});
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
   await page.locator('#menuCampaignBtn').click();await page.locator('#startBtn').click();
   if(await page.locator('#storyContinue').isVisible())await page.locator('#storyContinue').click();
   await page.locator('#tutorialSkip').waitFor({state:'visible',timeout:10000});
   await page.locator('#tutorialSkip').click();
   await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing'&&Style2Maps.stats().activeLevel===1);
   const snapshot=()=>page.evaluate(()=>{const g=DenkmalTestHooks.getGame();return {level:g.level,state:DenkmalTestHooks.getState(),hero:{x:g.hero.x,y:g.hero.y},loaded:TD2GroundV3.loadedCount,revision:TD2GroundV3.revision,maps:Style2Maps.stats()};});
   const before=await snapshot();assert.equal(requested,9,'normal menu startup must request V3 without prewarming');assert.equal(before.loaded,0);
   await page.keyboard.down('ArrowRight');
   try{await page.waitForFunction(p=>{const h=DenkmalTestHooks.getGame().hero;return Math.hypot(h.x-p.x,h.y-p.y)>2;},before.hero,{timeout:5000});}
   finally{await page.keyboard.up('ArrowRight');}
   const moving=await snapshot();assert.ok(Math.hypot(moving.hero.x-before.hero.x,moving.hero.y-before.hero.y)>2,'player can move while material downloads are pending');
   const name=`${mobile?'touch':'desktop'}-${fail?'failed':'delayed'}`;
   await page.screenshot({path:path.join(output,name+'-pending.png')});release();
   if(fail)await page.waitForFunction(()=>TD2GroundV3.loadedCount===0&&performance.getEntriesByType('resource').filter(r=>r.name.includes('/reference-ground-v3/')).length>=9);
   else await page.waitForFunction(()=>TD2GroundV3.loadedCount===9&&TD2GroundV3.revision===1);
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const after=await snapshot();assert.equal(after.state,'playing');assert.equal(after.level,1);
   assert.equal(after.maps.builds,moving.maps.builds+(fail?0:1),'only successful late decode rebuilds the tutorial map');
   await page.waitForTimeout(600);const warm=await snapshot();assert.equal(warm.maps.builds,after.maps.builds);assert.equal(requested,9,'failed downloads never cause a request loop');
   assert.deepEqual(errors,[],'material failure must not throw');assert.ok(failed.filter(r=>new URL(r.url).origin===new URL(page.url()).origin).every(r=>r.url.includes('/reference-ground-v3/')),'no unrelated local game asset failure: '+JSON.stringify(failed));
   await page.screenshot({path:path.join(output,name+'-settled.png')});
   results.push({touchEmulation:mobile,materialFailure:fail,requested,before,moving,after,warm,errors,failedRequests:failed});await context.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
  console.log(JSON.stringify({chromium:browser.version(),menuStartupScenarios:results.length,physicalAndroidTested:false}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
