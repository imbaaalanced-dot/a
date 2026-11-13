/* TD2 Level 4 performance sampling — CI/Linux Chromium, NOT physical Android.
   Keeps graphics/game logic untouched and records actual in-game HUD telemetry
   alongside rAF pacing at the screenshot desktop resolution and touch portrait. */
'use strict';
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.join(__dirname,'../dist');
const output=process.env.TD2_LEVEL4_PERF_OUT||'/tmp/td2-level4-performance';
const phase=process.env.TD2_LEVEL4_PERF_PHASE||'baseline';
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  fs.readFile(file,(err,bytes)=>{
    res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});
    res.end(err?'missing':bytes);
  });
});
function percentile(numbers,fraction){
  if(!numbers.length)return null;
  const sorted=numbers.slice().sort((a,b)=>a-b);
  return +sorted[Math.max(0,Math.ceil(sorted.length*fraction)-1)].toFixed(2);
}
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const results=[];
 try{
  for(const config of [
    {name:'level4-desktop-1649x890-high',width:1649,height:890,touch:false,graphics:'high'},
    {name:'level4-portrait-412x915-auto',width:412,height:915,touch:true,graphics:'auto'}
  ]){
    const context=await browser.newContext({viewport:{width:config.width,height:config.height},hasTouch:config.touch,isMobile:config.touch,deviceScaleFactor:1,reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[],failed=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1:'))failed.push({status:r.status(),url:r.url()});});
    await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
    await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>!document.getElementById('td2Loading'),null,{timeout:45000});
    // Paired comparison in the same Chromium/device. Disable the new CSS for
    // the baseline, then enable it for the compact layout, resetting the wave.
    for(const cssProfile of ['baseline','compact']){
    await page.evaluate(profile=>{
      const stylesheet=document.querySelector('link[href*="level4-options-menu-compact.css"]');
      if(!stylesheet)throw new Error('compact options stylesheet is missing');
      stylesheet.disabled=profile==='baseline';
    },cssProfile);
    await page.evaluate(config=>{
      DenkmalTestHooks.setGraphicsPreference(config.graphics);
      DenkmalTestHooks.startGame(4);
      HeroSaga.continueStory();
      const menu=document.getElementById('hudMenu');if(menu)menu.open=false;
      const telemetry=document.getElementById('fpsOverlay');
      if(telemetry.classList.contains('hidden'))document.getElementById('telemetryBtn').click();
      DenkmalTestHooks.launchWave();
    },config);
    await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing'&&DenkmalTestHooks.getGame()?.level===4,null,{timeout:15000});
    await page.waitForTimeout(1500); // asset warm-up, not included in metrics
    for(const menuOpen of [false,true]){
      await page.evaluate(open=>{document.getElementById('hudMenu').open=open},menuOpen);
      // Do not measure the one-time layout/repaint from opening the menu.
      await page.waitForTimeout(450);
      const measurement=await page.evaluate(async()=>{
        const samples=[],readings=[],samplesToRun=6500;
        let rafId=0,previous=0;
        const observe=timestamp=>{
          if(previous){
            const delta=timestamp-previous;
            if(delta>0&&delta<1000)samples.push(delta);
          }
          previous=timestamp;
          rafId=requestAnimationFrame(observe);
        };
        rafId=requestAnimationFrame(observe);
        const timer=setInterval(()=>{
          const overlay=document.getElementById('fpsOverlay');
          readings.push(overlay?.textContent||'');
        },550);
        await new Promise(ok=>setTimeout(ok,samplesToRun));
        clearInterval(timer);cancelAnimationFrame(rafId);
        const game=DenkmalTestHooks.getGame();
        return {
          rafFrameDeltas:samples,
          hudReadings:readings,
          gameLevel:game?.level,
          gameWave:game?.wave,
          enemies:game?.enemies?.length,
          fx:game?.particles?.length,
          canvas:{width:document.getElementById('game').width,height:document.getElementById('game').height},
          menuOpen:document.getElementById('hudMenu').open,
          qualityTier:DenkmalTestHooks.qualityTier(),
          graphicsPreference:document.getElementById('graphicsBtn')?.textContent,
          memoryMB:performance.memory?.usedJSHeapSize?Math.round(performance.memory.usedJSHeapSize/1048576):null
        };
      });
      const deltas=measurement.rafFrameDeltas;
      const fpsValues=measurement.hudReadings.map(x=>Number(x.match(/FPS\s+(\d+)/)?.[1])).filter(x=>Number.isFinite(x)&&x>0);
      const p95FromHud=measurement.hudReadings.map(x=>Number(x.match(/P95\s+([\d.]+)ms/)?.[1])).filter(x=>Number.isFinite(x)&&x>0);
      const simFromHud=measurement.hudReadings.map(x=>Number(x.match(/SIM\s+([\d.]+)ms/)?.[1])).filter(x=>Number.isFinite(x));
      const drawFromHud=measurement.hudReadings.map(x=>Number(x.match(/DRAW\s+([\d.]+)ms/)?.[1])).filter(x=>Number.isFinite(x));
      const result={
        device:config.name,graphics:config.graphics,cssProfile,menuOpen,
        level:measurement.gameLevel,wave:measurement.gameWave,
        enemiesAtEnd:measurement.enemies,fxAtEnd:measurement.fx,
        canvas:measurement.canvas,qualityTier:measurement.qualityTier,
        browserRafMedianMs:percentile(deltas,.5),browserRafP95Ms:percentile(deltas,.95),
        browserRafOver50ms:deltas.filter(x=>x>50).length,rafSamples:deltas.length,
        gameTelemetryFpsMedian:percentile(fpsValues,.5),
        gameTelemetryP95MsMedian:percentile(p95FromHud,.5),
        gameTelemetrySimMsMedian:percentile(simFromHud,.5),
        gameTelemetryDrawMsMedian:percentile(drawFromHud,.5),
        gameTelemetrySampleCount:fpsValues.length,
        memoryMB:measurement.memoryMB
      };
      assert.equal(result.level,4,'must profile Ender Dorfkirche Level 4');
      assert.ok(result.rafSamples>1,'browser rAF must advance during benchmark');
      assert.ok(result.gameTelemetrySampleCount>1,'in-game drawn FPS counter must update');
      assert.ok(result.gameTelemetryFpsMedian>0,'positive game draw FPS');
      results.push(result);
      console.log('LEVEL4_PERF '+JSON.stringify(result));
      // Never capture an active WebGL/canvas screenshot inside the timing loop:
      // the compositor copy blocks headless SwiftShader and biases the next run.
      fs.writeFileSync(path.join(output,'partial-results.json'),JSON.stringify({phase,results},null,2));
    }
    } // end paired baseline/compact study on this device
    assert.deepEqual(errors,[],config.name+' JavaScript errors');
    fs.writeFileSync(path.join(output,config.name+'-diagnostic.json'),JSON.stringify({errors,failedRequests:failed},null,2));
    await context.close();
  }
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify({phase,browser:browser.version(),host:'GitHub Actions Linux headless / SwiftShader',physicalAndroidTested:false,notDirectlyComparableToUserDesktop:true,results},null,2));
  console.log('LEVEL4_PERF_REPORT '+JSON.stringify({phase,browser:browser.version(),results}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
