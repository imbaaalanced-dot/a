/* Real touch gestures: dragging/menu dismissal must not select or spend; a separate pad tap must still open selection.
   Test hooks start the scene and inspect state only. Google Fonts uses app fallbacks. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist'),out=process.env.TD2_TOUCH_GUARDS_OUT||'/tmp/td2-touch-guards';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{
 const name=new URL(req.url,'http://localhost').pathname.replace(/^\/v4-style2\//,'/');
 const file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});
});
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.TD2_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const results=[];
 try{
  for(const width of [360,412])for(const level of [3,4]){
      const context=await browser.newContext({viewport:{width,height:915},hasTouch:true,isMobile:true,deviceScaleFactor:1});
   const page=await context.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
   await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({status:200,contentType:'text/css',body:''}));
   await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
   await page.goto('http://127.0.0.1:'+server.address().port+'/v4-style2/index.html',{waitUntil:'networkidle'});
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
   // Observe the actual pad render transform; do not duplicate camera/zoom math.
   await page.evaluate(()=>{
    globalThis.__qaPads=new Map();
    const original=Style2Markers.drawPad;
    Style2Markers.drawPad=function(ctx,p,...args){
     if(ctx.canvas.id==='game'){
      const m=ctx.getTransform();globalThis.__qaTransform=m;
      const v=m.transformPoint(new DOMPoint(p.x,p.y)),r=ctx.canvas.getBoundingClientRect();
      globalThis.__qaPads.set(p.x+','+p.y,{wx:p.x,wy:p.y,x:r.x+v.x*r.width/ctx.canvas.width,y:r.y+v.y*r.height/ctx.canvas.height});
     }
     return original.call(this,ctx,p,...args);
    };
   });
   await page.evaluate(level=>{DenkmalTestHooks.startGame(level);HeroSaga.continueStory();},level);
   await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing');
   await page.waitForFunction(()=>[...globalThis.__qaPads.values()].some(p=>p.x>50&&p.x<innerWidth-50&&p.y>200&&p.y<innerHeight-220),null,{timeout:45000});
   const point=await page.evaluate(()=>{
    const points=[...globalThis.__qaPads.values()].filter(p=>p.x>30&&p.x<innerWidth-30&&p.y>180&&p.y<innerHeight-220);
    const p=points.find(p=>p.x>50&&p.x<innerWidth-50&&p.y>200);
    if(!p)throw Error('no visible unobstructed rendered pad');return {...p,candidates:points};
   });
   const tapPad=async()=>{
    await page.waitForTimeout(150);
    const p=await page.evaluate(p=>{const c=document.querySelector('#game'),r=c.getBoundingClientRect(),v=globalThis.__qaTransform.transformPoint(new DOMPoint(p.wx,p.wy));return {x:r.x+v.x*r.width/c.width,y:r.y+v.y*r.height/c.height};},point);
    assert.equal(await page.evaluate(p=>document.elementFromPoint(p.x,p.y)?.id,p),'game','pad touch must hit canvas');
    await page.touchscreen.tap(p.x,p.y);
   };
   const snapshot=()=>page.evaluate(()=>{const g=DenkmalTestHooks.getGame();return {essence:g.essence,towers:g.towers.map(t=>({kind:t.kind,level:t.level,spent:t.spent}))};});
   const initial=await snapshot();
   const cdp=await context.newCDPSession(page);
   await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:point.x-40,y:point.y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:point.x,y:point.y}]});
   await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
   assert.equal(await page.locator('#touchContext').isVisible(),false,'drag must not open build selector');
   assert.deepEqual(await snapshot(),initial,'drag must not spend essence');
   await page.locator('#hudMenu summary').tap();
   assert.equal(await page.locator('#hudMenu').evaluate(e=>e.open),true);
   const dismissal=await page.evaluate(points=>points.find(p=>document.elementFromPoint(p.x,p.y)?.id==='game'),point.candidates);
   assert.ok(dismissal,'a visible pad must remain outside the menu panel');
   await page.touchscreen.tap(dismissal.x,dismissal.y);
   assert.equal(await page.locator('#hudMenu').evaluate(e=>e.open),false,'canvas tap closes HUD menu');
   assert.equal(await page.locator('#touchContext').isVisible(),false,'menu dismissal must not also open build selector');
   assert.deepEqual(await snapshot(),initial);
   await tapPad();
   await page.locator('#touchContext').waitFor({state:'visible'});
   assert.deepEqual(await snapshot(),initial,'pad tap must not purchase');
   await page.locator('#touchContext .touch-context-close').tap();
   await page.locator('#hudMenu summary').tap();
   await page.locator('#menuPauseBtn').tap();
   await page.waitForFunction(()=>DenkmalTestHooks.getState()==='paused');
   // Tap the backdrop, away from the modal's real resume button.
   await page.touchscreen.tap(5,250);
   assert.equal(await page.evaluate(()=>DenkmalTestHooks.getState()),'paused');
   assert.equal(await page.locator('#touchContext').isVisible(),false,'pause modal must block build selection');
   assert.deepEqual(await snapshot(),initial,'paused touch must not spend essence');
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
   await page.screenshot({path:path.join(out,`level${level}-${width}.png`)});
   results.push({level,width,point,initial,errors,failed});await context.close();

  }
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
  console.log('Touch drag/menu/modal guards and separate pad selection passed: levels 3/4 at 360/412px, no essence spent, no JS/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
