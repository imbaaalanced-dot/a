/* Real Chromium smoke test; no game dependency. */
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path'),assert=require('assert/strict');
const root=path.resolve(__dirname,'../dist');
const server=http.createServer((req,res)=>{const name=path.resolve(root,decodeURIComponent(new URL(req.url,'http://localhost').pathname).slice(1)||'index.html');if(!name.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}fs.readFile(name,(e,b)=>{res.writeHead(e?404:200,{'Content-Type':{'.js':'application/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml'}[path.extname(name)]||'application/octet-stream'});res.end(e?'missing':b);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));const browser=await chromium.launch({executablePath:process.env.CHROMIUM_EXECUTABLE||'/tmp/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--no-zygote','--use-angle=swiftshader']});const reports=[];
try{for(const mobile of [false,true]){const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile});const page=await context.newPage(),errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
await page.goto('http://127.0.0.1:'+server.address().port+'/?td2CampaignPilot=1',{waitUntil:'networkidle'});await page.waitForFunction(()=>!!globalThis.DenkmalTestHooks);await page.waitForFunction(()=>!document.querySelector('#td2Loading')||document.querySelector('#td2Loading')?.classList.contains('done')||getComputedStyle(document.querySelector('#td2Loading')).display==='none');
assert(await page.locator('#portalNewBtn').isVisible());assert((await page.locator('#portalNewBtn').innerText()).includes('Portalreise'));
for(const hero of ['marcel','kim']){
 await page.evaluate(hero=>{document.getElementById('gameoverMenuBtn').click();document.getElementById(hero==='kim'?'chooseKim':'chooseMarcel').click();DenkmalTestHooks.startPortalRun({resume:false});},hero);
 const initial=await page.evaluate(()=>({mode:DenkmalTestHooks.getGame().mode,hero:DenkmalTestHooks.getGame().hero.character,gold:DenkmalTestHooks.getGame().essence}));assert.deepEqual(initial,{mode:'portal',hero,gold:75});
 await page.locator('#nextWaveBtn').click();await page.waitForFunction(()=>DenkmalTestHooks.getGame().enemies.length>0);assert.equal(await page.evaluate(()=>DenkmalTestHooks.getPortalRun().phase),'combat');
 // Fast-forward only combat outcomes; actual movement/portal collision tested below.
 await page.evaluate(()=>{const h=DenkmalTestHooks,g=h.getGame();g.enemies=[];h.endWave();h.launchWave();h.endWave();});
 assert.equal(await page.locator('#perkGrid button').count(),3);await page.locator('#perkGrid button').first().click();
 await page.evaluate(()=>{const h=DenkmalTestHooks,g=h.getGame();g.hero.x=1536;g.hero.y=776;h.update(.02);});assert.equal(await page.evaluate(()=>DenkmalTestHooks.getPortalRun().section),2);
 await page.reload({waitUntil:'networkidle'});await page.waitForFunction(()=>!document.querySelector('#td2Loading'));await page.evaluate(()=>DenkmalTestHooks.startPortalRun({resume:true}));assert.equal(await page.evaluate(()=>DenkmalTestHooks.getPortalRun().section),2);
}
await page.evaluate(()=>{DenkmalTestHooks.startGame(1,'campaign-pilot');HeroSaga.continueStory();});assert.equal(await page.evaluate(()=>DenkmalTestHooks.getGame().maxTowers),6);
fs.mkdirSync('/tmp/td2-portal-qa',{recursive:true});await page.screenshot({path:'/tmp/td2-portal-qa/'+(mobile?'touch':'desktop')+'.png'});
assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);reports.push({touchEmulation:mobile,heroes:['marcel','kim'],portalCollision:true,resume:true,campaignPilot:true,errors,missing});}
fs.writeFileSync('/tmp/td2-portal-qa/report.json',JSON.stringify({browser:browser.version(),reports,realAndroidTested:false},null,2));console.log(JSON.stringify(reports));}finally{await browser.close();server.close();}})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
