'use strict';
const {chromium}=require('playwright'),http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const server=http.createServer((req,res)=>{const p=new URL(req.url,'http://localhost').pathname.replace('/v4.1.0','');const file=path.join(root,p==='/'?'index.html':p);fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':({'.js':'application/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{browser=await chromium.launch({headless:true,...(process.env.TD2_CHROMIUM_PATH?{executablePath:process.env.TD2_CHROMIUM_PATH}:{}),args:['--no-sandbox','--disable-dev-shm-usage']});
const context=await browser.newContext({viewport:{width:820,height:330},hasTouch:true,isMobile:true});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/v4.1.0/`,{waitUntil:'networkidle'});
await page.locator('#td2Loading').waitFor({state:'detached',timeout:60000});
await page.evaluate(()=>{DenkmalTestHooks.startGame(6);const g=DenkmalTestHooks.getGame();g.wave=31;g.intermission=600;g.hero.hp=g.hero.maxHp=263;g.waveTotal=48;g.waveKilled=0;g.towers.push({x:g.hero.x+30,y:g.hero.y,kind:'cannon',level:3,spent:130,r:18,damage:30,range:160,fireRate:1,fireCd:1,targetMode:'first'});});
await page.waitForTimeout(200);
const before=await page.locator('#objective').boundingBox();console.log('collapsed objective',before);
assert.ok(before.y+before.height<180,'collapsed wave preview must leave the center of short landscape screens free');
for(const [width,height] of [[820,330],[915,412],[393,815],[360,640]]){
await page.setViewportSize({width,height});
await page.locator('#wavePreviewDetails summary').click();
assert.equal(await page.locator('#wavePreviewDetails').getAttribute('open'),'');
const bounds=await page.locator('#wavePreview').boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1,'expanded forecast stays inside viewport');
assert.ok(bounds.height<=height*.31,'details are bounded and scrollable');
const hp=await page.locator('#playerHpText').evaluate(e=>({nowrap:getComputedStyle(e).whiteSpace,overflow:e.scrollWidth>e.clientWidth}));assert.equal(hp.nowrap,'nowrap');assert.equal(hp.overflow,false);
await page.locator('#wavePreview').evaluate(e=>e.scrollTop=e.scrollHeight);assert.ok(await page.locator('#wavePreview').evaluate(e=>e.scrollHeight<=e.clientHeight||e.scrollTop>0));
await page.locator('#wavePreviewDetails summary').click();
const controls=await page.locator('#controls').boundingBox();assert.ok(controls.x>=0&&controls.y>=0&&controls.x+controls.width<=width+1&&controls.y+controls.height<=height+1);
const upgrade=await page.locator('#upgradeBtn').boundingBox();assert.ok(upgrade.height<=30,'max-level status stays compact');
if(process.env.TD2_QA_OUT){fs.mkdirSync(process.env.TD2_QA_OUT,{recursive:true});await page.screenshot({path:path.join(process.env.TD2_QA_OUT,`hud-${width}x${height}.png`)});}
console.log('PASS viewport',width,height);
}
await page.locator('#wavePreviewDetails summary').focus();await page.keyboard.press('Space');assert.equal(await page.locator('#wavePreviewDetails').getAttribute('open'),'');
await page.setViewportSize({width:820,height:330});const rotated=await page.locator('#wavePreview').boundingBox();assert.ok(rotated.y+rotated.height<=330,'open forecast stays in bounds after rotation');
if(process.env.TD2_QA_OUT)await page.screenshot({path:path.join(process.env.TD2_QA_OUT,'hud-details-landscape.png')});
await page.locator('#nextWaveBtn').click();await page.waitForTimeout(100);assert.equal(await page.locator('#wavePreviewDetails').getAttribute('open'),null);assert.equal(await page.locator('#wavePreviewDetails').isVisible(),false);
assert.deepEqual(errors,[]);console.log('PASS collapse at wave start, keyboard, no page errors');
}finally{if(browser)await browser.close();await new Promise(r=>server.close(r));}})().catch(e=>{console.error(e);process.exitCode=1;});
