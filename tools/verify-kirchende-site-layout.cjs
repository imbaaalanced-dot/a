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
 const results=[];let foliage=null;
 const forestQA=process.env.TD2_FOREST_QA==='1';
 const levels=forestQA?[1,2,3,4]:[3,4];
 try{
  for(const mobile of [false,true])for(const level of levels){
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
   if(forestQA&&!mobile&&level===4){
    const sheet=await page.evaluate(()=>{
     const sprites=[],collector={drawImage(sprite){sprites.push(sprite);}};
     for(let i=0;i<5;i++)DenkmalForest.drawCrown(collector,0,0,64,i);
     const metrics=sprites.map((sprite,variant)=>{
      if(sprite.width!==256||sprite.height!==256)throw Error('Unexpected crown texture size');
      const pixels=sprite.getContext('2d').getImageData(0,0,256,256).data;
      let visible=0,left=256,top=256,right=0,bottom=0;
      for(let y=0;y<256;y++)for(let x=0;x<256;x++)if(pixels[(y*256+x)*4+3]>8){
       visible++;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);
      }
      if(visible<10000||left<2||top<2||right>253||bottom>253)throw Error('Empty or clipped crown '+variant);
      return {variant,width:sprite.width,height:sprite.height,bounds:[left,top,right,bottom],visible};
     });
     const unique=new Set(sprites);
     for(let i=0;i<100;i++)DenkmalForest.drawCrown({drawImage(sprite){
      if(sprite!==sprites[i%5])throw Error('Warm crown cache changed');
     }},0,0,64,i);
     if(unique.size!==5)throw Error('Crown variants are duplicated');
     const c=document.createElement('canvas');c.width=1100;c.height=270;
     const g=c.getContext('2d');g.fillStyle='#293a30';g.fillRect(0,0,c.width,c.height);
     g.fillStyle='#ded5b6';g.font='15px sans-serif';g.fillText('Crown variants: 64 / 128 px',16,24);
     for(let i=0;i<5;i++)for(const [j,size] of [64,128].entries())
      DenkmalForest.drawCrown(g,i*220+110,54+j*93+size/2+35,size/2.16,i);
     return {url:c.toDataURL('image/png'),metrics,decodedBytes:5*256*256*4};
    });
    fs.writeFileSync(path.join(out,'forest-crowns-64-128.png'),Buffer.from(sheet.url.split(',')[1],'base64'));
    foliage={metrics:sheet.metrics,decodedBytes:sheet.decodedBytes};
   }
   await page.screenshot({path:path.join(out,`level${level}-${mobile?'touch':'desktop'}.png`)});
   results.push({mobile,...state,errors,failed});await context.close();
  }
  fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({chromium:browser.version(),physicalAndroidTested:false,foliage,results},null,2));
  console.log(results.length+' Chromium scenes passed: levels '+levels.join('/')+', desktop/touch, nonempty canvases, no JS/HTTP errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;}).finally(()=>server.close());
