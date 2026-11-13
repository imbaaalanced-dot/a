/* TD2: five-tower arsenal and separated desktop/mobile toolbar browser QA. */
'use strict';
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../dist'),out=process.env.TD2_TOWER_HUD_OUT||'/tmp/td2-tower-hud';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer((req,res)=>{
 let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});
});
function checkRect(r,w,h,label){
 assert.ok(r&&r.width>0&&r.height>0,label+' visible');
 assert.ok(r.x>=-2&&r.y>=-2&&r.x+r.width<=w+2&&r.y+r.height<=h+2,label+' inside viewport '+JSON.stringify(r));
}
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const all=[];
 try{
  for(const t of [
    {name:'desktop-1649',width:1649,height:890,touch:false},
    {name:'desktop-1280',width:1280,height:800,touch:false},
    {name:'desktop-900',width:900,height:750,touch:false},
    {name:'mobile-412',width:412,height:915,touch:true},
    {name:'mobile-360',width:360,height:800,touch:true}
  ]){
   const context=await browser.newContext({viewport:{width:t.width,height:t.height},hasTouch:t.touch,isMobile:t.touch,deviceScaleFactor:1,reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400&&(r.url().includes('game.js')||r.url().includes('combat-hud-layout-v3.css')))failed.push(r.url());});
   await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
   await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>!document.getElementById('td2Loading'),null,{timeout:45000});
   await page.evaluate(()=>{DenkmalTestHooks.startGame(7);HeroSaga.continueStory()});
   await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing',null,{timeout:20000});
   await page.waitForTimeout(180);
   assert.equal(await page.locator('[data-tower="boomerang"]').count(),0,t.name+' retired tower is not offered');
   assert.equal(await page.locator('#arsenal button').count(),5,t.name+' has five tower types');
   assert.deepEqual(await page.locator('#arsenal button').evaluateAll(btns=>btns.map(b=>b.dataset.tower)),['bow','cannon','mage','rift','barracks']);
   if(!t.touch){
    assert.equal(await page.locator('#arsenal').isVisible(),true,t.name+' arsenal visible');
    const ars=await page.locator('#arsenal').boundingBox(),ctrl=await page.locator('#controls').boundingBox();
    checkRect(ars,t.width,t.height,t.name+' arsenal');checkRect(ctrl,t.width,t.height,t.name+' actions');
    assert.ok(ars.y+ars.height<=ctrl.y-3,t.name+' arsenal must clear actions by >=3px, '+JSON.stringify({ars,ctrl}));
    assert.ok(ars.x>=ctrl.x-350||t.width<1000,t.name+' tower row aligned on right side');
    await page.keyboard.press('Digit5');
    assert.equal(await page.evaluate(()=>DenkmalTestHooks.getGame().selectedTower),'barracks','key 5 selects barracks');
    await page.keyboard.press('Digit1');
    assert.equal(await page.evaluate(()=>DenkmalTestHooks.getGame().selectedTower),'bow','key 1 selects bow');
    await page.keyboard.press('Digit6');
    assert.equal(await page.evaluate(()=>DenkmalTestHooks.getGame().selectedTower),'barracks','legacy key 6 still selects barracks');
   }else{
    assert.equal(await page.locator('#arsenal').isVisible(),false,t.name+' touch context replaces desktop arsenal');
    assert.equal(await page.locator('#compactHud').isVisible(),true,t.name+' compact status displayed');
    const compact=await page.locator('#compactHud').boundingBox();
    const control=await page.locator('#controls').boundingBox();
    checkRect(compact,t.width,t.height,t.name+' compact HUD');
    checkRect(control,t.width,t.height,t.name+' abilities');
    assert.equal(await page.locator('#soulBtn').isVisible(),true,t.name+' soul button');
    assert.equal(await page.locator('#dodgeBtn').isVisible(),true,t.name+' dodge button');
   }
   await page.screenshot({path:path.join(out,t.name+'.png'),animations:'disabled'});
   assert.deepEqual(errors,[],t.name+' JS errors');assert.deepEqual(failed,[],t.name+' changed asset HTTP errors');
   all.push({name:t.name,touch:t.touch,errors,failed});
   await context.close();
  }
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results:all},null,2));
  console.log('TD2 tower shop and HUD browser QA passed',JSON.stringify(all));
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
