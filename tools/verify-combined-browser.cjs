'use strict';
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist'),out=process.env.TD2_QA_OUT||'/tmp/td2-combined-qa/browser';
const types={'.js':'application/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/v4-alpha9\//,''),file=path.resolve(root,relative||'index.html');if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});});
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=process.env.TD2_TEST_URL||`http://127.0.0.1:${server.address().port}/v4-alpha9/`;
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});const report=[];
 try{for(const mobile of [false,true]){
  const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],missing=[];page.setDefaultTimeout(30000);
  page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
  await page.addInitScript(()=>{if(location.protocol.startsWith('http'))localStorage.setItem('denkmal-graphics','low');});
  await page.goto(base+'?td2UserTowers=1',{waitUntil:'networkidle'});await page.locator('#td2Loading').waitFor({state:'detached',timeout:60000});
  await page.evaluate(()=>DenkmalTestHooks.startGame(5));await page.waitForFunction(()=>DenkmalTestHooks.getGame()?.level===5);
  const opening=await page.evaluate(()=>{const g=DenkmalTestHooks.getGame();return {level:g.level,wave:g.wave,count:g.waveTotal};});assert.deepEqual(opening,{level:5,wave:17,count:32});
  await page.screenshot({path:path.join(out,mobile?'touch-campaign.png':'desktop-campaign.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);report.push({mobile,opening,errors,missing});await context.close();console.log('Combined scenario passed',mobile);
 }
 fs.writeFileSync(path.join(out,'combined-report.json'),JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
