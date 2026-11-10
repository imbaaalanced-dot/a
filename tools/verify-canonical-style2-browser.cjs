/* Chromium smoke: canonical hero/tower art, desktop and touch emulation. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const http=require('node:http');
const {chromium}=require('playwright');
const root=path.join(__dirname,'../dist');
const screenshots=process.env.TD2_CANONICAL_ART_OUT||'/tmp/td2-canonical-art-pilot';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.json':'application/json'};
const server=http.createServer((req,res)=>{
  const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{res.writeHead(error?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(error?'not found':data);});
});
(async()=>{
  fs.mkdirSync(screenshots,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
  const results=[];
  try{
    for(const mobile of [false,true]){
      const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:800},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
      const page=await context.newPage(),errors=[],missing=[],requests=[];
      page.on('pageerror',error=>errors.push(error.message));
      page.on('response',response=>{if(response.status()>=400)missing.push(response.url());});
      page.on('request',request=>requests.push(request.url()));
      await page.goto(`http://127.0.0.1:${server.address().port}/index.html`,{waitUntil:'networkidle'});
      await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
      const device=mobile?'mobile-touch':'desktop';
      await page.screenshot({path:path.join(screenshots,`${device}-marcel-menu.png`),fullPage:true});
      await page.locator('#chooseKim').click();
      await page.waitForFunction(()=>document.querySelector('#heroHudPortrait')?.style.backgroundImage.includes('kim-marksman-v6.webp'));
      await page.screenshot({path:path.join(screenshots,`${device}-kim-menu.png`),fullPage:true});
      await page.locator('#chooseMarcel').click();
      const output=await page.evaluate(async()=>{
        const kinds=['bow','cannon','mage','rift','boomerang'],urls=[];
        for(const kind of kinds)for(let tier=1;tier<=3;tier++){
          const id=`tower_${kind}_lv${tier}`;
          urls.push(`assets/style2-user-towers-v4/runtime-webp/towers/${id}.webp?v=style2-v4`);
        }
        await DenkmalAssets.retain('canonical-style2-v4-browser-qa',urls);
        const canvas=document.createElement('canvas');canvas.width=180;canvas.height=180;
        const ctx=canvas.getContext('2d');let rendered=0;
        for(const kind of kinds)for(let tier=1;tier<=3;tier++){
          ctx.clearRect(0,0,180,180);
          // The Android-oriented adapter permits only a few concurrent image
          // loads. Wait for its bounded queue; a cold image is not a failure.
          const started=performance.now();
          while(!UserStyle2Towers.drawTower(ctx,kind,90,120,tier)){
            if(performance.now()-started>15000)throw Error(`canonical ${kind}/${tier} did not render within 15 s`);
            await new Promise(resolve=>setTimeout(resolve,35));
          }
          if(!ctx.getImageData(0,0,180,180).data.some((value,i)=>i%4===3&&value>16))throw Error(`blank ${kind}/${tier}`);
          rendered++;
        }
        let projectiles=0,impacts=0;
        for(const kind of kinds)for(let tier=1;tier<=3;tier++){
          const bullet={kind,level:tier,x:90,y:90,vx:1,vy:0};
          const started=performance.now();
          while(!UserStyle2Towers.drawProjectile(ctx,bullet)){
            if(performance.now()-started>15000)throw Error(`V4 ${kind}/${tier} projectile did not render within 15 s`);
            await new Promise(resolve=>setTimeout(resolve,35));
          }
          projectiles++;
          const particle={kind,level:tier,x:90,y:90,life:.15,max:.3};
          const impactUrl=`assets/style2-user-towers-v4/runtime-webp/impact_${kind}_6x3.webp?v=style2-v4`;
          const impactStarted=performance.now();
          while(!Style2ImpactsV4.draw(ctx,particle)){
            if(performance.now()-impactStarted>15000)throw Error(`V4 ${kind}/${tier} impact atlas did not draw within 15 s`);
            await new Promise(resolve=>setTimeout(resolve,35));
          }
          const atlas=DenkmalAssets.ready(impactUrl);
          if(!atlas||atlas.naturalWidth!==768||atlas.naturalHeight!==384)throw Error(`invalid V4 ${kind} impact atlas`);
          impacts++;
        }
        DenkmalTestHooks.startGame(1);HeroSaga.continueStory();
        return {rendered,projectiles,impacts,level:DenkmalTestHooks.getGame()?.level};
      });
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      assert.equal(output.rendered,15);
      assert.equal(output.projectiles,15);
      assert.equal(output.impacts,15);
      assert.equal(output.level,1);
      await page.screenshot({path:path.join(screenshots,`${device}-gameplay.png`),fullPage:true});
      const banned=/marcel-lantern-sprite|directional-v410\/(?:kim|marcel)[.-]|tower-boomerang-atlas|projectile-fx-v3\.svg|tower-(?:bow|cannon|mage|rift|boomerang)-(?:l[123]|infernal|ash)/i;
      assert.deepEqual(requests.filter(url=>banned.test(url)),[],'no competing hero/tower art fetched');
      assert.equal(requests.filter(url=>/style2-user-towers-v4\/runtime-webp\/towers\//.test(url)).length,15,'all fifteen V4 tower tiers fetched');
      assert.equal(requests.filter(url=>/style2-user-towers-v4\/runtime-webp\/projectiles\//.test(url)).length,15,'all fifteen V4 projectile tiers fetched');
      assert.equal(requests.filter(url=>/style2-user-towers-v4\/runtime-webp\/impact_/.test(url)).length,5,'one V4 impact atlas per family fetched');
      assert.deepEqual(errors,[],'no JavaScript exceptions');
      assert.deepEqual(missing,[],'no HTTP errors');
      results.push({mobileTouchEmulation:mobile,...output,errors,missing,legacyRequests:0});
      await context.close();
    }
    console.log(JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>server.close());
