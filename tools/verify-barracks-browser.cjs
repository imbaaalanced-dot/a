/* Real Chromium smoke; fixtures control resources, UI performs build/upgrade/sell. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist'),out=process.env.TD2_BARRACKS_QA_OUT||'/tmp/td2-barracks-qa';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const f=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!f.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 fs.readFile(f,(err,data)=>{
  if(!err&&f===path.join(root,'game.js'))data=Buffer.from(data.toString().replace(/\}\)\(\);\s*$/,`globalThis.BarracksQA={project(p){const r=canvas.getBoundingClientRect();return {x:r.left+(p.x-camera.x)*zoom*r.width/W,y:r.top+(p.y-camera.y)*zoom*viewDepth*r.height/H};}};})();`));
  res.writeHead(err?404:200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});res.end(err?'missing':data);
 });
});
(async()=>{
 fs.mkdirSync(out,{recursive:true});await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({headless:true,executablePath:process.env.TD2_CHROMIUM_PATH||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const results=[];
 try{
  for(const profile of [{name:'desktop',width:1280,height:800,touch:false},{name:'portrait',width:390,height:844,touch:true},{name:'landscape',width:844,height:390,touch:true}]){
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},hasTouch:profile.touch,isMobile:profile.touch,deviceScaleFactor:1});
   const page=await context.newPage(),errors=[],missing=[],assets=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});page.on('request',r=>{if(r.url().includes('/assets/barracks/'))assets.push(r.url());});
   await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
   await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:'networkidle'});
   await page.waitForFunction(()=>!document.getElementById('td2Loading'));
   await page.evaluate(()=>{
    DenkmalTestHooks.startGame(1);HeroSaga.continueStory();const g=DenkmalTestHooks.getGame(),slot=DenkmalLevels.levels[1].slots[0];
    g.essence=500;g.intermission=99999;g.hero.x=slot.x;g.hero.y=slot.y+58;g.hero.fireCd=99999;
    DenkmalTestHooks.update(.01);
   });
   // Story and pause overlays can outlive the initial startGame hook.
   // Resume only through the existing UI; report the actual state on failure.
   for(let attempt=0;attempt<3;attempt++){
    const state=await page.evaluate(()=>DenkmalTestHooks.getState());
    if(state==='playing')break;
    if(state==='story')await page.evaluate(()=>HeroSaga.continueStory());
    else if(state==='paused')await page.locator('#resumeBtn').click();
    else break;
    await page.waitForTimeout(100);
   }
   try{
    await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing',null,{timeout:10000});
   }catch(error){
    const diagnostic=await page.evaluate(()=>({
     state:globalThis.DenkmalTestHooks?.getState?.(),
     level:globalThis.DenkmalTestHooks?.getGame?.()?.level,
     storyVisible:!document.getElementById('storyScreen')?.classList.contains('hidden'),
     pauseVisible:!document.getElementById('pauseScreen')?.classList.contains('hidden'),
     loadingVisible:!!document.getElementById('td2Loading')
    }));
    throw new Error('Barracks Chromium startup did not reach playing: '+JSON.stringify({profile:profile.name,diagnostic,errors,missing})+'; '+error.message);
   }
   await page.waitForTimeout(350);
   async function tapTower(){const p=await page.evaluate(()=>BarracksQA.project(DenkmalTestHooks.getGame().towers[0]||DenkmalLevels.levels[1].slots[0]));await page.touchscreen.tap(p.x,p.y);}
   if(profile.touch){await tapTower();await page.locator('#touchContext [data-tower="barracks"]').tap();}
   else{await page.keyboard.press('Digit6');await page.keyboard.press('KeyE');}
   await page.waitForFunction(()=>DenkmalTestHooks.getGame().towers[0]?.kind==='barracks'&&DenkmalTestHooks.getGame().militia.length===1);
   assert.equal(await page.evaluate(()=>DenkmalTestHooks.getGame().essence),445);
   await page.evaluate(()=>DenkmalBarracks.preload());
   await page.waitForFunction(()=>DenkmalAssets.status(DenkmalBarracks.ATLAS)==='ready'&&DenkmalAssets.status(DenkmalBarracks.STATES)==='ready');
   const combat=await page.evaluate(()=>{
    const g=DenkmalTestHooks.getGame(),u=g.militia[0];u.aliveTime=2;u.x=u.rally.x;u.y=u.rally.y;
    DenkmalTestHooks.spawnEnemy();const e=g.enemies[0];Object.assign(e,{x:u.x+20,y:u.y,r:12,hp:10000,maxHp:10000,damage:1,attackCd:0,attackCooldown:.2,speed:0,waypoint:0});
    const before=e.hp,hp=u.hp;for(let i=0;i<60;i++)DenkmalTestHooks.update(1/60);
    const result={enemyDamaged:e.hp<before,allyDamaged:u.hp<hp};g.enemies.length=0;g.bullets.length=0;u.hp=u.maxHp/2;return result;
   });
   assert.equal(combat.enemyDamaged,true);assert.equal(combat.allyDamaged,true);
   for(const level of [2,3]){
    if(profile.touch){await tapTower();await page.locator('#touchContext .touch-context-options button').filter({hasText:/AUFWERTEN/}).tap();}
    else await page.keyboard.press('KeyQ');
    await page.waitForFunction(l=>DenkmalTestHooks.getGame().towers[0].level===l,level);
    await page.waitForFunction(l=>DenkmalTestHooks.getGame().militia[0].level===l,level);
    assert.equal(await page.evaluate(()=>{const u=DenkmalTestHooks.getGame().militia[0];return u.hp/u.maxHp;}),.5);
   }
   const frames=await page.evaluate(()=>{
    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=160;const ctx=canvas.getContext('2d');let blits=0,count=0;
    const original=ctx.drawImage.bind(ctx);ctx.drawImage=(...a)=>{blits++;original(...a);};
    for(let level=1;level<=3;level++)for(const mode of ['idle','walk','attack','hit','death','recruit']){
     const u=DenkmalBarracks.makeUnit({x:80,y:110,level},[]);Object.assign(u,{aliveTime:mode==='recruit'?.2:2,mode,hitTime:mode==='hit'?.15:0,hp:mode==='death'?0:u.hp,deathTime:mode==='death'?.35:0});
     ctx.clearRect(0,0,160,160);blits=0;DenkmalBarracks.drawUnit(ctx,u);
     if(blits!==1)throw Error('duplicate/missing blit '+level+'/'+mode);
     if(!ctx.getImageData(0,0,160,160).data.some((v,i)=>i%4===3&&v>16))throw Error('blank '+level+'/'+mode);count++;
    }return count;
   });assert.equal(frames,18);
   await page.screenshot({path:path.join(out,profile.name+'.png')});
   if(profile.touch){await tapTower();await page.locator('#touchContext .touch-context-options button').filter({hasText:/VERKAUF/}).tap();}
   else await page.keyboard.press('KeyX');
   await page.waitForFunction(()=>DenkmalTestHooks.getGame().towers.length===0&&DenkmalTestHooks.getGame().militia.length===0);
   assert.equal(await page.evaluate(()=>DenkmalTestHooks.getGame().essence),444,'55+35+50 cost; 84 refund');
   assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.equal(assets.length,2,'each atlas requested exactly once');
   results.push({profile:profile.name,combat,renderedStates:frames,atlasRequests:assets.length,errors,missing});await context.close();
  }
  const result={chromium:browser.version(),physicalAndroidTested:false,results};fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
