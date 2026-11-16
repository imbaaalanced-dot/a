'use strict';
// Controlled late-wave fixture. This is not a naturally played Android run.
const {chromium}=require('playwright');
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const out=process.env.TD2_SPRITE_REPRO_OUT||'/tmp/td2-sprite-repro';
const expectViolet=process.env.TD2_SPRITE_EXPECT==='violet';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{
 let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});
});
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 let browser;
 try{
  browser=await chromium.launch({executablePath:process.env.TD2_CHROMIUM_EXECUTABLE||'/usr/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
  const results=[];
  for(const touch of [false,true]){
   const context=await browser.newContext({viewport:touch?{width:412,height:915}:{width:1280,height:800},hasTouch:touch,isMobile:touch,reducedMotion:'no-preference'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://fonts.googleapis.com/**',r=>r.abort());
   await page.addInitScript(()=>{
    localStorage.setItem('td2-v4-intro-tutorial','done');
    const raf=window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame=cb=>raf(t=>{if(!window.__spriteFreeze)cb(t);});
   });
   const response=await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});
   assert.equal(response.status(),200);
   await page.waitForFunction(()=>globalThis.DenkmalTestHooks&&globalThis.HeroSaga&&!document.getElementById('td2Loading'),null,{timeout:60000});
   await page.evaluate(()=>{DenkmalTestHooks.startGame(1);HeroSaga.continueStory();});
   await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing');
   await page.evaluate(async()=>{
    await DenkmalAssets.retain('violet-repro',[TD2HeroSideAssets.marcel.sheets.down]);
    window.__spriteFreeze=true;
   });
   for(const graphics of ['high','low'])for(const wave of [14,15,16]){
    const result=await page.evaluate(({graphics,wave})=>{
     const hooks=DenkmalTestHooks,g=hooks.getGame();
     hooks.setGraphicsPreference(graphics);g.wave=wave;g.spawnTimer=999;
     g.hero.character='marcel';g.hero.direction='down';g.hero.hitFlash=0;g.hero.dodge=0;
     // Advance the real hero animation clock to the fifth attack frame.
     HeroSaga.onAttack({x:g.hero.x,y:g.hero.y+100});
     HeroSaga.update(.17,false,{x:0,y:1});
     const c=document.createElement('canvas');c.width=256;c.height=256;
     const ctx=c.getContext('2d'),draws=[],draw=ctx.drawImage.bind(ctx);
     ctx.drawImage=(...a)=>{draws.push({url:a[0].src||null,crop:a.slice(1,5)});draw(...a);};
     ctx.translate(128-g.hero.x,190-g.hero.y);
     HeroSaga.draw(ctx,g.hero);
     const rgba=ctx.getImageData(0,0,256,256).data;let violet=0;
     for(let i=0;i<rgba.length;i+=4)if(rgba[i]>100&&rgba[i+2]>100&&rgba[i+1]<100&&rgba[i+3]>100&&Math.min(rgba[i],rgba[i+2])>rgba[i+1]*1.4)violet++;
     const id='spriteRepro';document.getElementById(id)?.remove();c.id=id;
     Object.assign(c.style,{position:'fixed',top:'0',left:'0',width:'256px',height:'256px',zIndex:'99999',background:'#ddd',pointerEvents:'none'});document.body.append(c);
     return {wave,graphics,qualityTier:hooks.qualityTier(),state:hooks.getState(),hero:g.hero.character,direction:g.hero.attackDirection,draws,violetPixels:violet,particles:g.particles.length,enemies:g.enemies.length,towers:g.towers.length,frameData:c.toDataURL()};
    },{graphics,wave});
    const filename=`${touch?'touch':'desktop'}-${graphics}-wave${wave}`;
    fs.writeFileSync(path.join(out,filename+'-frame.png'),Buffer.from(result.frameData.split(',')[1],'base64'));delete result.frameData;
    await page.screenshot({path:path.join(out,filename+'.png')});
    assert.ok(result.draws.some(d=>d.url?.includes('marcel-down-actions-v5b')&&JSON.stringify(d.crop)==='[512,256,128,128]'),'real HeroSaga path must select frame 4');
    assert.ok(expectViolet?result.violetPixels>100:result.violetPixels<20,'actual Canvas purple-matte expectation');
    results.push({touch,...result});
   }
   assert.deepEqual(errors,[]);await context.close();
  }
  const movingResults=[];
  for(const touch of [false,true])for(const wave of [14,15,16]){
   const context=await browser.newContext({viewport:touch?{width:412,height:915}:{width:1280,height:800},hasTouch:touch,isMobile:touch,reducedMotion:'no-preference'});
   const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.route('https://fonts.googleapis.com/**',r=>r.abort());
   await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
   await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>globalThis.DenkmalTestHooks&&globalThis.HeroSaga&&!document.getElementById('td2Loading'),null,{timeout:60000});
   await page.evaluate(()=>{DenkmalTestHooks.startGame(1);HeroSaga.continueStory();});
   await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing');
   await page.evaluate(async({wave,touch})=>{
    const hooks=DenkmalTestHooks,g=hooks.getGame();hooks.setGraphicsPreference(touch?'auto':'high');
    g.wave=wave;g.intermission=0;g.spawnTimer=999;g.waveSpawned=0;g.waveTotal=100;
    g.hero.invuln=999;g.hero.fireCd=0;
    hooks.spawnEnemy('runner');const enemy=g.enemies.at(-1);
    enemy.hp=enemy.maxHp=100000;enemy.damage=0;
    window.__follow=setInterval(()=>{enemy.x=g.hero.x;enemy.y=g.hero.y+100;},10);
    await DenkmalAssets.retain('moving-violet-repro',[TD2HeroSideAssets.marcel.sheets.down,TD2CanonicalHeroArt.marcel.walk]);
    window.__movingDraws=[];
    const ctx=document.getElementById('game').getContext('2d'),original=ctx.drawImage.bind(ctx);
    ctx.drawImage=(...a)=>{
     original(...a);
     if(g.hero.moving&&a[0].src?.includes('/assets/hero/')){
      window.__movingDraws.push({url:a[0].src,crop:a.slice(1,5),moving:g.hero.moving,attackDirection:g.hero.attackDirection,wave:g.wave});
      if(a[0].src.includes('marcel-down-actions-v5b')&&a[1]===512&&a[2]===256&&!window.__movingFrame)
       queueMicrotask(()=>{window.__movingFrame=document.getElementById('game').toDataURL();});
     }
    };
   },{wave,touch});
   let cdp;
   if(touch){
    const r=await page.locator('#joystick').boundingBox();assert.ok(r);
    cdp=await context.newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2}]});
    await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:r.x+r.width*.85,y:r.y+r.height/2}]});
   }else await page.keyboard.down('KeyD');
   await page.waitForFunction(()=>window.__movingFrame&&window.__movingDraws.some(d=>d.url.includes('marcel-walk-v5b.webp')),null,{timeout:20000});
   if(touch)await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});else await page.keyboard.up('KeyD');
   const result=await page.evaluate(()=>{
    clearInterval(window.__follow);const g=DenkmalTestHooks.getGame();
    return {wave:g.wave,graphics:DenkmalTestHooks.graphicsPreference(),qualityTier:DenkmalTestHooks.qualityTier(),draws:window.__movingDraws,frame:window.__movingFrame,particles:g.particles.length,enemies:g.enemies.length,towers:g.towers.length};
   });
   fs.writeFileSync(path.join(out,`moving-${touch?'touch':'desktop'}-wave${wave}.png`),Buffer.from(result.frame.split(',')[1],'base64'));delete result.frame;
   assert.deepEqual(errors,[]);movingResults.push({touch,...result});await context.close();
  }
  const report={browser:browser.version(),expectViolet,fixture:'controlled wave state and animation clock; no natural wave playthrough',physicalAndroid:false,reducedMotion:false,combatEffects:'isolated cases: no injected combat effects; moving cases: real automatic hero attack against a controlled runner',results,movingResults};
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report,null,2));
 }finally{await browser?.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
