'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.TD2_CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{
  for(const mobile of [false,true]){
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile});
   const page=await context.newPage(),errors=[],missing=[];
   page.on('pageerror',e=>errors.push(e.message));
   page.on('response',r=>{if(r.status()>=400&&r.url().includes('/assets/witten-heven/'))missing.push(r.url());});
   await page.goto(process.env.TD2_TEST_URL||'http://127.0.0.1:8777/index.html');
   await page.waitForFunction(()=>!!globalThis.DenkmalTestHooks);
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:60000});
   await page.evaluate(()=>{DenkmalLevels.completeLevel7();DenkmalTestHooks.startGame(7);const g=DenkmalTestHooks.getGame();g.wave=DenkmalCampaign20.chapter(7).lastWave;DenkmalTestHooks.endWave();});
   assert.equal(await page.locator('#nextLevelBtn').textContent(),'LEVEL 8 STARTEN');
   await page.locator('#nextLevelBtn').click();
   await page.waitForFunction(()=>DenkmalTestHooks.getGame().level===8&&DenkmalTestHooks.getState()==='playing');
   await page.waitForFunction(()=>DenkmalAssets.status('assets/witten-heven/monument-heven-style2.webp?v=witten-heven-monument1')==='ready');
   const result=await page.evaluate(()=>{
    const t=DenkmalTestHooks,g=t.getGame();
    g.hero.hp=g.hero.maxHp=g.monument.hp=g.monument.maxHp=1e9;
    const result={level:g.level,wave:g.wave,mode:g.mode};
    g.wave=32;t.spawnEnemy('boss');return result;
   });
   assert.deepEqual(result,{level:8,wave:29,mode:'campaign'});
   await page.waitForFunction(()=>DenkmalAssets.status('assets/witten-heven/boss-pfeilerwaechter-v1.webp?v=witten-heven-boss1')==='ready');
   // Capture Canvas directly to avoid headless compositor stalls.
   const png=await page.evaluate(()=>document.querySelector('#game').toDataURL().split(',')[1]);
   require('node:fs').writeFileSync('/tmp/witten-'+(mobile?'mobile':'desktop')+'.png',Buffer.from(png,'base64'));
   await page.evaluate(()=>DenkmalTestHooks.endWave());
   await page.locator('#completeMenuBtn').click();
   assert.equal(await page.evaluate(()=>DenkmalAssets.status('assets/witten-heven/monument-heven-style2.webp?v=witten-heven-monument1')),'unrequested');
   await page.locator('#menuCampaignBtn').click();
   await page.getByRole('button',{name:'Nächste Levelseite',exact:true}).click();
   await page.locator('#level8Btn').click();
   await page.waitForFunction(()=>DenkmalTestHooks.getGame().level===8&&DenkmalTestHooks.getState()==='playing');
   await page.waitForFunction(()=>DenkmalAssets.status('assets/witten-heven/monument-heven-style2.webp?v=witten-heven-monument1')==='ready');
   assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
   console.log(JSON.stringify({mobile,transition:result,bossLoaded:true,releaseAndReentry:true,errors,missing}));
   await context.close();
  }
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
