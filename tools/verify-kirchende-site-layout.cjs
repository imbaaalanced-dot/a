/* Real Chromium smoke/visual review for the two separately referenced sites. */
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist'),out=process.env.TD2_SITE_QA_OUT||'/tmp/td2-site-layout';
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
  for(const mobile of [false,true])for(const level of [3,4]){
   const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1280,height:800},hasTouch:mobile,isMobile:mobile,deviceScaleFactor:1});
   const page=await context.newPage(),errors=[],failed=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failed.push(r.url());});
   await page.addInitScript(()=>localStorage.setItem('td2-v4-intro-tutorial','done'));
   await page.goto('http://127.0.0.1:'+server.address().port+'/v4-style2/index.html',{waitUntil:'networkidle'});
   await page.locator('#td2Loading').waitFor({state:'detached',timeout:45000});
   const state=await page.evaluate(async level=>{
    const h=DenkmalTestHooks;
    if(!h.getDeveloperMode())h.toggleDeveloperMode();
    await KirchendeArt.load();await DenkmalTerrain.load();
    h.startGame(level);HeroSaga?.continueStory?.();
    await new Promise(r=>setTimeout(r,600));
    const g=h.getGame();
    const canvas=document.querySelector('#game'),q=canvas.getContext('2d');
    const pixels=q.getImageData(0,0,canvas.width,canvas.height).data;
    let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>24)visible++;
    return {level:g.level,slots:DenkmalLevels.levels[level].slots.length,visible,width:canvas.width,height:canvas.height};
   },level);
   assert.equal(state.level,level);assert.ok(state.visible>state.width*state.height*.08,'nonempty game canvas');
   assert.deepEqual(errors,[]);assert.deepEqual(failed,[]);
   await page.screenshot({path:path.join(out,`level${level}-${mobile?'touch':'desktop'}.png`)});
   results.push({mobile,...state,errors,failed});await context.close();
  }
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,results},null,2));
  console.log('Four Chromium scenes passed: levels 3/4, desktop/touch, nonempty canvases, no JS/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
