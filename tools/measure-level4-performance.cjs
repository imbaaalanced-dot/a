/* TD2 Level 4 FPS profiling: each condition runs in a FRESH Chromium context.
   Prevents old frame/sprite loop state and screenshot compositor throttling from
   biasing the baseline-vs-compact comparison. No gameplay/code changes. */
'use strict';
const {chromium}=require('playwright');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../dist');
const output=process.env.TD2_LEVEL4_PERF_OUT||'/tmp/td2-level4-performance';
const mime={'.js':'text/javascript','.css':'text/css','.html':'text/html','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer((req,res)=>{
 let file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403).end();return;}
 if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
 fs.readFile(file,(err,data)=>{res.writeHead(err?404:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});res.end(err?'missing':data);});
});
const pctl=(values,p)=>{
 if(!values.length)return null;
 const sorted=values.slice().sort((a,b)=>a-b);
 return +sorted[Math.max(0,Math.ceil(sorted.length*p)-1)].toFixed(2);
};
(async()=>{
 fs.mkdirSync(output,{recursive:true});
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--use-angle=swiftshader']});
 const results=[];
 try{
  for(const t of [
    {device:'desktop-1649x890-high',width:1649,height:890,touch:false,graphics:'high'},
    {device:'portrait-412x915-auto',width:412,height:915,touch:true,graphics:'auto'}
  ])for(const cssProfile of ['baseline','compact'])for(const menuOpen of [false,true]){
    // Each measurement starts a fresh page, wave and rAF history. Never take
    // screenshots in an FPS timing run: canvas copies stall SwiftShader.
    const context=await browser.newContext({viewport:{width:t.width,height:t.height},isMobile:t.touch,hasTouch:t.touch,deviceScaleFactor:1,reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&r.url().startsWith('http://127.0.0.1:'))requests.push({status:r.status(),url:r.url()});});
    try{
      await page.bringToFront();
      await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
      await page.goto('http://127.0.0.1:'+server.address().port+'/index.html',{waitUntil:'domcontentloaded'});
      await page.waitForFunction(()=>!document.getElementById('td2Loading'),null,{timeout:45000});
      await page.evaluate(({cssProfile,menuOpen,graphics})=>{
        const link=document.querySelector('link[href*="level4-options-menu-compact.css"]');
        if(!link)throw Error('compact menu stylesheet not loaded');
        link.disabled=cssProfile==='baseline';
        DenkmalTestHooks.setGraphicsPreference(graphics);
        DenkmalTestHooks.startGame(4);
        HeroSaga.continueStory();
        if(document.getElementById('fpsOverlay').classList.contains('hidden'))document.getElementById('telemetryBtn').click();
        document.getElementById('hudMenu').open=menuOpen;
        DenkmalTestHooks.launchWave();
      },{cssProfile,menuOpen,graphics:t.graphics});
      await page.waitForFunction(()=>DenkmalTestHooks.getState()==='playing'&&DenkmalTestHooks.getGame()?.level===4,null,{timeout:15000});
      await page.bringToFront();
      await page.waitForTimeout(1250);
      const measurement=await page.evaluate(async()=>{
        const intervals=[],labels=[];let old=0,raf=0;
        const sample=ts=>{if(old&&ts-old>0&&ts-old<1000)intervals.push(ts-old);old=ts;raf=requestAnimationFrame(sample)};
        raf=requestAnimationFrame(sample);
        const timer=setInterval(()=>labels.push(document.getElementById('fpsOverlay')?.textContent||''),500);
        await new Promise(done=>setTimeout(done,4500));
        clearInterval(timer);cancelAnimationFrame(raf);
        const game=DenkmalTestHooks.getGame(),canvas=document.getElementById('game');
        return {intervals,labels,level:game?.level,wave:game?.wave,enemies:game?.enemies?.length,
          canvas:{width:canvas.width,height:canvas.height},
          graphicsTier:DenkmalTestHooks.qualityTier(),
          visibility:document.visibilityState,hasFocus:document.hasFocus(),
          memoryMB:performance.memory?.usedJSHeapSize?Math.round(performance.memory.usedJSHeapSize/1048576):null
        };
      });
      const as=(expression)=>measurement.labels.map(x=>Number(x.match(expression)?.[1])).filter(x=>Number.isFinite(x)&&x>0);
      const fps=as(/FPS\s+(\d+)/),p95=as(/P95\s+([\d.]+)ms/),sim=as(/SIM\s+([\d.]+)ms/),draw=as(/DRAW\s+([\d.]+)ms/);
      const out={device:t.device,graphics:t.graphics,cssProfile,menuOpen,level:measurement.level,wave:measurement.wave,
        enemies:measurement.enemies,canvas:measurement.canvas,qualityTier:measurement.graphicsTier,
        pageVisibility:measurement.visibility,pageHasFocus:measurement.hasFocus,
        rafSamples:measurement.intervals.length,rafMedianMs:pctl(measurement.intervals,.5),rafP95Ms:pctl(measurement.intervals,.95),
        rafOver50ms:measurement.intervals.filter(x=>x>50).length,
        drawFpsMedian:pctl(fps,.5),gameDrawP95Ms:pctl(p95,.5),
        simMsMedian:pctl(sim,.5),drawMsMedian:pctl(draw,.5),
        telemetrySamples:fps.length,memoryMB:measurement.memoryMB,
        jsErrors:errors,failedResourceRequests:requests
      };
      assert.equal(out.level,4,'profile must use Level 4');
      assert.ok(out.telemetrySamples>=2,'game telemetry must be sampled');
      assert.deepEqual(errors,[],'no JavaScript exceptions');
      results.push(out);
      console.log('LEVEL4_ISOLATED_PERF '+JSON.stringify(out));
      fs.writeFileSync(path.join(output,'partial-results.json'),JSON.stringify({browser:browser.version(),results},null,2));
    }finally{await context.close();}
  }
  const full={browser:browser.version(),host:'GitHub Actions/Linux/SwiftShader',physicalAndroidTested:false,
    note:'Short sequential samples in fresh contexts. Hardware and runner scheduling are not comparable to the user PC.',results};
  fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(full,null,2));
  console.log('LEVEL4_ISOLATED_REPORT '+JSON.stringify(full));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>server.close());
