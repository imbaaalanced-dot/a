/* Optional real-browser smoke test. Requires Playwright (not a game dependency).
 * node tools/verify-user-style2-browser.cjs
 * CHROMIUM_EXECUTABLE and TD2_QA_OUT can override the browser and evidence folder.
 * Only a local HTTP server and temporary browser profiles are used. */
'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist');
const out=path.resolve(process.env.TD2_QA_OUT||'/tmp/td2-style2-browser-qa');
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.json':'application/json','.svg':'image/svg+xml','.mp3':'audio/mpeg'};
const server=http.createServer((req,res)=>{
  const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\/v4-alpha9\//,'');
  const file=path.resolve(root,relative||'index.html');
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});
});
(async()=>{
  fs.mkdirSync(out,{recursive:true});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  const url=`http://127.0.0.1:${server.address().port}/v4-alpha9/`;
  const browser=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_EXECUTABLE||undefined,args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--no-zygote','--use-angle=swiftshader']});
  const report={browser:browser.version(),rendererSha256:createHash('sha256').update(fs.readFileSync(path.join(root,'style2-user-towers.js'))).digest('hex'),scenarios:[],androidDeviceTested:false,scene:'Synthetic placement of 15 tower variants; gameplay tower limits are not changed.'};
  try{
    for(const mobile of [false,true]){
      const context=await browser.newContext({viewport:mobile?{width:412,height:915}:{width:1280,height:900},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
      const page=await context.newPage(),errors=[],missing=[],userRequests=[];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
      page.on('request',r=>{if(r.url().includes('style2-user-towers-v1/runtime-webp/'))userRequests.push(r.url());});
      await page.goto(url,{waitUntil:'networkidle'});
      assert.equal(await page.evaluate(()=>UserStyle2Towers.enabled),false);
      assert.equal(userRequests.length,0,'opt-out must not fetch user sprites');
      await page.goto(url+'?td2UserTowers=1',{waitUntil:'networkidle'});
      const cold=await page.evaluate(()=>{
        const c=document.createElement('canvas'),g=c.getContext('2d');
        const drawn=UserStyle2Towers.drawTower(g,'cannon',80,120,1);
        return {drawn,alpha:g.getImageData(0,0,1,1).data[3]};
      });
      assert.deepEqual(cold,{drawn:false,alpha:0},'cold adapter must hand control to the previous renderer without touching Canvas');
      const assets=await page.evaluate(async()=>{
        const manifest=await (await fetch('assets/style2-user-towers-v1/manifest.json')).json();
        const urls=manifest.assets.map(e=>'assets/style2-user-towers-v1/'+e.webp_path+'?v=user-towers-1');
        const images=await DenkmalAssets.retain('qa-user-towers',urls);
        return {decoded:images.filter(Boolean).length,total:urls.length};
      });
      assert.equal(assets.decoded,30);
      // Real decoders, Canvas 2D and the production adapter, all 30 variants.
      const rendered=await page.evaluate(()=>{
        const c=document.createElement('canvas');c.width=160;c.height=160;
        const g=c.getContext('2d');let count=0;
        for(const kind of ['bow','cannon','mage','rift','boomerang'])for(const level of [1,2,3]){
          for(const projectile of [false,true]){
            g.clearRect(0,0,160,160);
            const ok=projectile?UserStyle2Towers.drawProjectile(g,{kind,level,x:80,y:80,vx:0,vy:1},.1):UserStyle2Towers.drawTower(g,kind,80,120,level);
            const pixels=g.getImageData(0,0,160,160).data;
            if(!ok||!pixels.some((value,i)=>i%4===3&&value>16))throw Error('blank '+kind+level);
            if(g.getTransform().a!==1||g.getTransform().b!==0||g.getTransform().e!==0)throw Error('Canvas transform leaked');
            count++;
          }
        }
        return count;
      });
      assert.equal(rendered,30);
      if(!mobile){
        await page.evaluate(()=>{
          const c=document.createElement('canvas');c.id='qa-grid';c.width=1250;c.height=760;
          c.style='position:fixed;inset:0;z-index:99999;width:1250px;height:760px';document.body.append(c);
          const g=c.getContext('2d');g.fillStyle='#15201e';g.fillRect(0,0,c.width,c.height);
          g.font='bold 23px sans-serif';g.fillStyle='#e6d2a8';g.fillText('TD2 · Style 2 · 64 / 128 px',24,36);
          const kinds=['bow','cannon','mage','rift','boomerang'];
          for(let col=0;col<5;col++){
            g.font='bold 18px sans-serif';g.fillStyle='#e6d2a8';g.fillText(kinds[col].toUpperCase(),col*250+24,76);
            for(let level=1;level<=3;level++){
              const x=col*250,y=100+(level-1)*215;
              g.fillStyle='#23332c';g.fillRect(x+12,y,226,197);
              g.font='13px sans-serif';g.fillStyle='#f1e5cb';g.fillText('STUFE '+level,x+24,y+22);
              for(const [size,px] of [[64,x+65],[128,x+167]]){
                g.save();g.translate(px,y+150);g.scale(size/112,size/112);
                UserStyle2Towers.drawTower(g,kinds[col],0,-13,level);g.restore();
              }
              UserStyle2Towers.drawProjectile(g,{kind:kinds[col],level,x:x+125,y:y+176,vx:1,vy:0},.1);
            }
          }
        });
        await page.locator('#qa-grid').screenshot({path:path.join(out,'towers-64-128.png')});
        await page.evaluate(()=>document.querySelector('#qa-grid').remove());
      }
      const levels=[];
      for(const level of [1,2,3,4,5,6]){
        await page.evaluate(n=>DenkmalTestHooks.startGame(n),level);
        await page.waitForFunction(n=>DenkmalTestHooks.getGame()?.level===n,level);
        await page.evaluate(()=>HeroSaga.continueStory());
        levels.push(level);
      }
      await page.evaluate(()=>DenkmalTestHooks.startGame(3));
      await page.waitForFunction(()=>DenkmalTestHooks.getGame()?.level===3);
      await page.evaluate(()=>{
        const game=DenkmalTestHooks.getGame(),kinds=['bow','cannon','mage','rift','boomerang'];
        game.maxTowers=15; // Synthetic visual fixture only, not production balancing.
        for(let col=0;col<5;col++)for(let level=1;level<=3;level++)game.towers.push({kind:kinds[col],level,x:game.hero.x-300+col*150,y:game.hero.y-160+(level-1)*150,r:18,range:260,damage:8,fireCd:0,fireRate:1,spent:40,targetMode:'first'});
      });
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      await page.waitForFunction(()=>getComputedStyle(document.querySelector('#toast')).opacity==='0');
      await page.screenshot({path:path.join(out,mobile?'game-touch-portrait.png':'game-desktop.png')});
      assert.deepEqual(errors,[],'no browser exceptions');
      assert.deepEqual(missing,[],'no failed asset responses');
      report.scenarios.push({touchEmulation:mobile,levels,decoded:assets.decoded,rendered,coldFallbackPassed:true,errors,missing});
      // Keep contexts until browser.close(): single-process test browsers can
      // terminate when their last context closes between desktop/touch runs.
    }
    fs.writeFileSync(path.join(out,'report.json'),JSON.stringify(report,null,2)+'\n');
    console.log(JSON.stringify(report,null,2));
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
